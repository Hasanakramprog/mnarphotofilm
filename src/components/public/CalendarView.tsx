'use client';

import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronRight, ChevronLeft } from 'lucide-react';
import type { PublicSession } from '@/types/session';
import SessionPanel from './SessionPanel';

interface CalendarViewProps {
  sessions: PublicSession[];
}

const ENGLISH_MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];
const ENGLISH_WEEKDAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

function getDaysInMonth(year: number, month: number) {
  return new Date(year, month + 1, 0).getDate();
}
function getFirstDayOfMonth(year: number, month: number) {
  return new Date(year, month, 1).getDay();
}

export default function CalendarView({ sessions }: CalendarViewProps) {
  const today = new Date();
  const [viewDate, setViewDate] = useState({ year: today.getFullYear(), month: today.getMonth() });
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [panelOpen, setPanelOpen] = useState(false);

  // Build a set of dates that have sessions (YYYY-MM-DD)
  const sessionDates = useMemo(() => {
    const map = new Map<string, PublicSession[]>();
    for (const s of sessions) {
      const key = s.date;
      if (!map.has(key)) map.set(key, []);
      map.get(key)!.push(s);
    }
    return map;
  }, [sessions]);

  const { year, month } = viewDate;
  const daysInMonth = getDaysInMonth(year, month);
  const firstDay = getFirstDayOfMonth(year, month);

  // Build calendar grid (blank slots + day numbers)
  const cells: Array<number | null> = [
    ...Array(firstDay).fill(null),
    ...Array.from({ length: daysInMonth }, (_, i) => i + 1),
  ];

  function pad(num: number) {
    return String(num).padStart(2, '0');
  }

  function handleDayClick(day: number) {
    const dateStr = `${year}-${pad(month + 1)}-${pad(day)}`;
    setSelectedDate(dateStr);
    setPanelOpen(true);
  }

  function prevMonth() {
    setViewDate(({ year, month }) => {
      if (month === 0) return { year: year - 1, month: 11 };
      return { year, month: month - 1 };
    });
  }

  function nextMonth() {
    setViewDate(({ year, month }) => {
      if (month === 11) return { year: year + 1, month: 0 };
      return { year, month: month + 1 };
    });
  }

  const todayStr = `${today.getFullYear()}-${pad(today.getMonth() + 1)}-${pad(today.getDate())}`;

  const selectedSessions = selectedDate ? (sessionDates.get(selectedDate) ?? []) : [];

  return (
    <>
      <div className="rounded-2xl overflow-hidden shadow-premium bg-white border border-slate-200">
        {/* Month navigation header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-slate-200">
          <button
            onClick={prevMonth}
            aria-label="Previous Month"
            className="p-2 rounded-lg transition-colors hover:bg-slate-100 text-slate-600 cursor-pointer"
          >
            <ChevronLeft size={20} />
          </button>

          <AnimatePresence mode="wait">
            <motion.h2
              key={`${year}-${month}`}
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 8 }}
              transition={{ duration: 0.2 }}
              className="text-lg font-bold text-slate-800"
            >
              {ENGLISH_MONTHS[month]} {year}
            </motion.h2>
          </AnimatePresence>

          <button
            onClick={nextMonth}
            aria-label="Next Month"
            className="p-2 rounded-lg transition-colors hover:bg-slate-100 text-slate-600 cursor-pointer"
          >
            <ChevronRight size={20} />
          </button>
        </div>

        {/* Weekday headers */}
        <div className="grid grid-cols-7 px-4 pt-4">
          {ENGLISH_WEEKDAYS.map((d) => (
            <div
              key={d}
              className="text-center text-xs font-semibold text-slate-400 pb-3"
            >
              {d}
            </div>
          ))}
        </div>

        {/* Day cells */}
        <div className="grid grid-cols-7 px-4 pb-4 gap-1">
          {cells.map((day, idx) => {
            if (day === null) return <div key={`blank-${idx}`} />;

            const dateStr = `${year}-${pad(month + 1)}-${pad(day)}`;
            const hasSession = sessionDates.has(dateStr);
            const isToday = dateStr === todayStr;
            const isSelected = dateStr === selectedDate;
            const sessionCount = sessionDates.get(dateStr)?.length ?? 0;

            return (
              <motion.button
                key={dateStr}
                whileHover={{ scale: 1.08 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => handleDayClick(day)}
                className={`relative flex flex-col items-center justify-center rounded-xl aspect-square text-sm font-semibold cursor-pointer transition-colors duration-150 ${
                  isSelected
                    ? 'bg-amber-100/80 border border-amber-400 text-amber-900 shadow-sm'
                    : isToday
                    ? 'bg-slate-100 border border-slate-300 text-slate-900 font-bold'
                    : 'hover:bg-slate-50 text-slate-700'
                }`}
                aria-label={`${day} ${ENGLISH_MONTHS[month]}${hasSession ? ` - ${sessionCount} sessions` : ''}`}
              >
                <span>{day}</span>
                {hasSession && (
                  <span className="absolute bottom-1.5 flex gap-0.5">
                    {Array.from({ length: Math.min(sessionCount, 3) }).map((_, i) => (
                      <span
                        key={i}
                        className="w-1.5 h-1.5 rounded-full bg-amber-600 shadow-sm"
                      />
                    ))}
                  </span>
                )}
              </motion.button>
            );
          })}
        </div>
      </div>

      {/* Slide-in session panel */}
      <SessionPanel
        open={panelOpen}
        onClose={() => setPanelOpen(false)}
        date={selectedDate}
        sessions={selectedSessions}
      />
    </>
  );
}
