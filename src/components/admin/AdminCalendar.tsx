'use client';

import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronRight, ChevronLeft, Plus, Phone } from 'lucide-react';
import type { Session } from '@/types/session';
import { STATUS_COLORS, STATUS_LABELS } from '@/types/session';
import { formatTime, formatArabicDate, getWhatsAppUrl, formatPhone } from '@/lib/utils';

interface AdminCalendarProps {
  sessions: Session[];
  onAddSession: (date: string) => void;
  onEditSession: (session: Session) => void;
}

const ARABIC_MONTHS = [
  'يناير', 'فبراير', 'مارس', 'أبريل', 'مايو', 'يونيو',
  'يوليو', 'أغسطس', 'سبتمبر', 'أكتوبر', 'نوفمبر', 'ديسمبر',
];
const ARABIC_WEEKDAYS = ['الأحد', 'الاثنين', 'الثلاثاء', 'الأربعاء', 'الخميس', 'الجمعة', 'السبت'];

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
      <div
        className="lg:col-span-2 rounded-2xl overflow-hidden"
        style={{ background: 'var(--color-surface-1)', border: '1px solid var(--color-border-subtle)' }}
      >
        {/* Month nav */}
        <div
          className="flex items-center justify-between px-6 py-4"
          style={{ borderBottom: '1px solid var(--color-border-subtle)' }}
        >
          <button
            onClick={() => setViewDate(({ year, month }) => month === 11 ? { year: year + 1, month: 0 } : { year, month: month + 1 })}
            className="p-2 rounded-lg hover:bg-white/5 transition-colors cursor-pointer"
            style={{ color: 'var(--color-text-secondary)' }}
            aria-label="الشهر التالي"
          >
            <ChevronRight size={20} />
          </button>
          <AnimatePresence mode="wait">
            <motion.h2
              key={`${year}-${month}`}
              initial={{ opacity: 0, y: -6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 6 }}
              transition={{ duration: 0.18 }}
              className="font-semibold text-lg"
              style={{ color: 'var(--color-text-primary)' }}
            >
              {ARABIC_MONTHS[month]} {year}
            </motion.h2>
          </AnimatePresence>
          <button
            onClick={() => setViewDate(({ year, month }) => month === 0 ? { year: year - 1, month: 11 } : { year, month: month - 1 })}
            className="p-2 rounded-lg hover:bg-white/5 transition-colors cursor-pointer"
            style={{ color: 'var(--color-text-secondary)' }}
            aria-label="الشهر السابق"
          >
            <ChevronLeft size={20} />
          </button>
        </div>

        {/* Weekday labels */}
        <div className="grid grid-cols-7 px-4 pt-3">
          {ARABIC_WEEKDAYS.map((d) => (
            <div key={d} className="text-center text-xs pb-2 font-medium" style={{ color: 'var(--color-text-muted)' }}>{d}</div>
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
                className="relative flex flex-col items-center justify-start pt-1 rounded-xl min-h-[52px] text-xs font-medium cursor-pointer transition-colors"
                style={{
                  background: isSelected ? 'rgba(201,169,110,0.15)' : isToday ? 'rgba(255,255,255,0.04)' : 'transparent',
                  border: isSelected ? '1px solid rgba(201,169,110,0.35)' : isToday ? '1px solid rgba(255,255,255,0.07)' : '1px solid transparent',
                  color: isSelected ? 'var(--color-brand-gold)' : 'var(--color-text-secondary)',
                }}
                aria-label={`${day} ${ARABIC_MONTHS[month]}${daySess.length ? ` - ${daySess.length} جلسة` : ''}`}
              >
                <span>{day}</span>
                {daySess.length > 0 && (
                  <div className="flex gap-0.5 mt-0.5 flex-wrap justify-center px-0.5">
                    {daySess.slice(0, 3).map((s) => (
                      <span
                        key={s.id}
                        className="w-1.5 h-1.5 rounded-full flex-shrink-0"
                        style={{
                          background: s.status === 'confirmed' ? '#10b981'
                            : s.status === 'pending' ? '#f59e0b'
                            : s.status === 'completed' ? '#3b82f6'
                            : '#6b7280',
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
      <div
        className="rounded-2xl overflow-hidden flex flex-col"
        style={{ background: 'var(--color-surface-1)', border: '1px solid var(--color-border-subtle)', minHeight: 300 }}
      >
        <div
          className="flex items-center justify-between px-5 py-4 flex-shrink-0"
          style={{ borderBottom: '1px solid var(--color-border-subtle)' }}
        >
          <h3 className="font-semibold text-sm" style={{ color: 'var(--color-text-primary)' }}>
            {selectedDate ? `جلسات ${formatArabicDate(selectedDate)}` : 'اختر يوماً'}
          </h3>
          {selectedDate && (
            <button
              onClick={() => onAddSession(selectedDate)}
              id="admin-calendar-add-btn"
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium cursor-pointer transition-colors"
              style={{
                background: 'rgba(201,169,110,0.1)',
                border: '1px solid rgba(201,169,110,0.2)',
                color: 'var(--color-brand-gold)',
              }}
            >
              <Plus size={13} /> إضافة جلسة
            </button>
          )}
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          <AnimatePresence>
            {!selectedDate ? (
              <p className="text-sm text-center py-8" style={{ color: 'var(--color-text-muted)' }}>
                اضغط على يوم لعرض جلساته
              </p>
            ) : daySessions.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-sm mb-3" style={{ color: 'var(--color-text-muted)' }}>لا توجد جلسات</p>
                <button
                  onClick={() => onAddSession(selectedDate)}
                  className="text-sm cursor-pointer transition-colors"
                  style={{ color: 'var(--color-brand-gold)' }}
                >
                  + إضافة جلسة جديدة
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
                  className="w-full text-right rounded-xl p-4 transition-all cursor-pointer"
                  style={{
                    background: 'var(--color-surface-2)',
                    border: '1px solid var(--color-border-subtle)',
                  }}
                  onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.borderColor = 'rgba(201,169,110,0.2)'; }}
                  onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.borderColor = 'var(--color-border-subtle)'; }}
                >
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <span className="font-medium text-sm" style={{ color: 'var(--color-text-primary)' }}>
                      {s.client_name}
                    </span>
                    <span className={`text-xs px-2 py-0.5 rounded-full border ${STATUS_COLORS[s.status]}`}>
                      {STATUS_LABELS[s.status]}
                    </span>
                  </div>
                  <p className="text-xs" style={{ color: 'var(--color-text-muted)' }}>
                    {s.session_type} • {formatTime(s.time)}
                  </p>

                  {s.client_phone && (
                    <div className="mt-2 pt-2 flex items-center justify-between border-t border-white/5 text-xs">
                      <a
                        href={getWhatsAppUrl(s.client_phone) ?? '#'}
                        target="_blank"
                        rel="noopener noreferrer"
                        onClick={(e) => e.stopPropagation()}
                        className="inline-flex items-center gap-1.5 px-2 py-1 rounded-md bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 hover:bg-emerald-500/20 transition-colors"
                        title="محادثة واتساب"
                      >
                        <Phone size={11} />
                        <span className="ltr-content font-medium">{formatPhone(s.client_phone)}</span>
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
