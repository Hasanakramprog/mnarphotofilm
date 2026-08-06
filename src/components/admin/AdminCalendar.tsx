'use client';

import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronRight, ChevronLeft, Plus, Phone } from 'lucide-react';
import type { Session } from '@/types/session';
import { STATUS_COLORS, STATUS_LABELS } from '@/types/session';
import { formatTime, formatDate, getWhatsAppUrl, formatPhone } from '@/lib/utils';

interface AdminCalendarProps {
  sessions: Session[];
  onAddSession: (date: string) => void;
  onEditSession: (session: Session) => void;
}

const ENGLISH_MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];
const ENGLISH_WEEKDAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

function pad(n: number) { return String(n).padStart(2, '0'); }

export default function AdminCalendar({ sessions, onAddSession, onEditSession }: AdminCalendarProps) {
  const today = new Date();
  const [viewDate, setViewDate] = useState({ year: today.getFullYear(), month: today.getMonth() });
  const [selectedDate, setSelectedDate] = useState<string | null>(null);

  const { year, month } = viewDate;
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const firstDay = new Date(year, month, 1).getDay();
  const cells: Array<number | null> = [...Array(firstDay).fill(null), ...Array.from({ length: daysInMonth }, (_, i) => i + 1)];
  const todayStr = `${today.getFullYear()}-${pad(today.getMonth() + 1)}-${pad(today.getDate())}`;

  const sessionMap = useMemo(() => {
    const map = new Map<string, Session[]>();
    for (const s of sessions) {
      if (!map.has(s.date)) map.set(s.date, []);
      map.get(s.date)!.push(s);
    }
    return map;
  }, [sessions]);

  const daySessions = selectedDate ? (sessionMap.get(selectedDate) ?? []) : [];

  function handleDayClick(day: number) {
    const dateStr = `${year}-${pad(month + 1)}-${pad(day)}`;
    setSelectedDate((prev) => (prev === dateStr ? null : dateStr));
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Calendar */}
      <div className="lg:col-span-2 rounded-2xl overflow-hidden bg-white border border-slate-200 shadow-sm">
        {/* Month nav */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200">
          <button
            onClick={() => setViewDate(({ year, month }) => month === 0 ? { year: year - 1, month: 11 } : { year, month: month - 1 })}
            className="p-2 rounded-lg hover:bg-slate-100 text-slate-600 transition-colors cursor-pointer"
            aria-label="Previous Month"
          >
            <ChevronLeft size={20} />
          </button>

          <AnimatePresence mode="wait">
            <motion.h2
              key={`${year}-${month}`}
              initial={{ opacity: 0, y: -6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 6 }}
              transition={{ duration: 0.18 }}
              className="font-bold text-lg text-slate-900"
            >
              {ENGLISH_MONTHS[month]} {year}
            </motion.h2>
          </AnimatePresence>

          <button
            onClick={() => setViewDate(({ year, month }) => month === 11 ? { year: year + 1, month: 0 } : { year, month: month + 1 })}
            className="p-2 rounded-lg hover:bg-slate-100 text-slate-600 transition-colors cursor-pointer"
            aria-label="Next Month"
          >
            <ChevronRight size={20} />
          </button>
        </div>

        {/* Weekday labels */}
        <div className="grid grid-cols-7 px-4 pt-3">
          {ENGLISH_WEEKDAYS.map((d) => (
            <div key={d} className="text-center text-xs pb-2 font-semibold text-slate-400">{d}</div>
          ))}
        </div>

        {/* Day cells */}
        <div className="grid grid-cols-7 px-4 pb-4 gap-1">
          {cells.map((day, idx) => {
            if (day === null) return <div key={`b-${idx}`} />;
            const dateStr = `${year}-${pad(month + 1)}-${pad(day)}`;
            const daySess = sessionMap.get(dateStr) ?? [];
            const isToday = dateStr === todayStr;
            const isSelected = dateStr === selectedDate;

            return (
              <motion.button
                key={dateStr}
                whileHover={{ scale: 1.06 }}
                whileTap={{ scale: 0.94 }}
                onClick={() => handleDayClick(day)}
                className={`relative flex flex-col items-center justify-start pt-1 rounded-xl min-h-[52px] text-xs font-semibold cursor-pointer transition-colors ${
                  isSelected
                    ? 'bg-amber-100/90 border border-amber-400 text-amber-900 shadow-xs'
                    : isToday
                    ? 'bg-slate-100 border border-slate-300 text-slate-900 font-bold'
                    : 'hover:bg-slate-50 text-slate-700'
                }`}
                aria-label={`${day} ${ENGLISH_MONTHS[month]}${daySess.length ? ` - ${daySess.length} sessions` : ''}`}
              >
                <span>{day}</span>
                {daySess.length > 0 && (
                  <div className="flex gap-1 mt-1 flex-wrap justify-center px-0.5">
                    {daySess.slice(0, 3).map((s) => (
                      <span
                        key={s.id}
                        className="w-1.5 h-1.5 rounded-full flex-shrink-0"
                        style={{
                          background: s.status === 'confirmed' ? '#10b981'
                            : s.status === 'pending' ? '#f59e0b'
                            : s.status === 'completed' ? '#3b82f6'
                            : '#ef4444',
                        }}
                      />
                    ))}
                  </div>
                )}
              </motion.button>
            );
          })}
        </div>
      </div>

      {/* Side panel */}
      <div className="rounded-2xl overflow-hidden flex flex-col bg-white border border-slate-200 shadow-sm min-h-[320px]">
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-200 bg-slate-50">
          <h3 className="font-bold text-sm text-slate-900">
            {selectedDate ? `Sessions for ${formatDate(selectedDate)}` : 'Select a date'}
          </h3>
          {selectedDate && (
            <button
              onClick={() => onAddSession(selectedDate)}
              id="admin-calendar-add-btn"
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-amber-50 text-amber-800 border border-amber-300 hover:bg-amber-100 transition-colors cursor-pointer shadow-xs"
            >
              <Plus size={13} /> Add Session
            </button>
          )}
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          <AnimatePresence>
            {!selectedDate ? (
              <p className="text-sm text-center py-8 text-slate-500 font-medium">
                Click on any date to view its sessions
              </p>
            ) : daySessions.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-sm mb-3 text-slate-500 font-medium">No sessions on this day</p>
                <button
                  onClick={() => onAddSession(selectedDate)}
                  className="text-sm font-semibold text-amber-700 hover:underline cursor-pointer"
                >
                  + Add new session
                </button>
              </div>
            ) : (
              daySessions.map((s, i) => (
                <motion.button
                  key={s.id}
                  initial={{ opacity: 0, x: 12 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.06 }}
                  onClick={() => onEditSession(s)}
                  className="w-full text-left rounded-xl p-4 bg-slate-50 border border-slate-200/80 hover:border-amber-300 hover:bg-white transition-all cursor-pointer shadow-xs"
                >
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <span className="font-bold text-sm text-slate-900">
                      {s.client_name}
                    </span>
                    <span className={`text-xs font-semibold px-2 py-0.5 rounded-full border ${STATUS_COLORS[s.status]}`}>
                      {STATUS_LABELS[s.status]}
                    </span>
                  </div>
                  <p className="text-xs text-slate-600 font-medium">
                    {s.session_type} • {formatTime(s.time)}
                  </p>

                  {s.client_phone && (
                    <div className="mt-2 pt-2 flex items-center justify-between border-t border-slate-200 text-xs">
                      <a
                        href={getWhatsAppUrl(s.client_phone) ?? '#'}
                        target="_blank"
                        rel="noopener noreferrer"
                        onClick={(e) => e.stopPropagation()}
                        className="inline-flex items-center gap-1.5 px-2 py-1 rounded-md bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-100 transition-colors font-semibold"
                        title="Chat on WhatsApp"
                      >
                        <Phone size={11} />
                        <span>{formatPhone(s.client_phone)}</span>
                      </a>
                    </div>
                  )}
                </motion.button>
              ))
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
