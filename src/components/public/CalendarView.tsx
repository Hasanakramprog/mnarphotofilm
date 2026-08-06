'use client';

import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronRight, ChevronLeft } from 'lucide-react';
import type { PublicSession } from '@/types/session';
import SessionPanel from './SessionPanel';

interface CalendarViewProps {
  sessions: PublicSession[];
}

const ARABIC_MONTHS = [
  'يناير', 'فبراير', 'مارس', 'أبريل', 'مايو', 'يونيو',
  'يوليو', 'أغسطس', 'سبتمبر', 'أكتوبر', 'نوفمبر', 'ديسمبر',
];
const ARABIC_WEEKDAYS = ['الأحد', 'الاثنين', 'الثلاثاء', 'الأربعاء', 'الخميس', 'الجمعة', 'السبت'];

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
      <div
        className="rounded-2xl overflow-hidden shadow-premium"
        style={{
          background: 'var(--color-surface-1)',
          border: '1px solid var(--color-border-subtle)',
        }}
      >
        {/* Month navigation header */}
        <div
          className="flex items-center justify-between px-6 py-5"
          style={{ borderBottom: '1px solid var(--color-border-subtle)' }}
        >
          <button
            onClick={nextMonth}
            aria-label="الشهر التالي"
            className="p-2 rounded-lg transition-colors hover:bg-white/5 cursor-pointer"
            style={{ color: 'var(--color-text-secondary)' }}
          >
            <ChevronRight size={20} />
          </button>

          <AnimatePresence mode="wait">
            <motion.h2
              key={`${year}-${month}`}
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 8 }}
              transition={{ duration: 0.2 }}
              className="text-lg font-semibold"
              style={{ color: 'var(--color-text-primary)' }}
            >
              {ARABIC_MONTHS[month]} {year}
            </motion.h2>
          </AnimatePresence>

          <button
            onClick={prevMonth}
            aria-label="الشهر السابق"
            className="p-2 rounded-lg transition-colors hover:bg-white/5 cursor-pointer"
            style={{ color: 'var(--color-text-secondary)' }}
          >
            <ChevronLeft size={20} />
          </button>
        </div>

        {/* Weekday headers */}
        <div className="grid grid-cols-7 px-4 pt-4">
          {ARABIC_WEEKDAYS.map((d) => (
            <div
              key={d}
              className="text-center text-xs font-medium pb-3"
              style={{ color: 'var(--color-text-muted)' }}
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
                className="relative flex flex-col items-center justify-center rounded-xl aspect-square text-sm font-medium cursor-pointer transition-colors duration-150"
                style={{
                  background: isSelected
                    ? 'rgba(201,169,110,0.18)'
                    : isToday
                    ? 'rgba(255,255,255,0.04)'
                    : 'transparent',
                  border: isSelected
                    ? '1px solid rgba(201,169,110,0.4)'
                    : isToday
                    ? '1px solid rgba(255,255,255,0.08)'
                    : '1px solid transparent',
                  color: isSelected
                    ? 'var(--color-brand-gold)'
                    : isToday
                    ? 'var(--color-text-primary)'
                    : 'var(--color-text-secondary)',
                }}
                aria-label={`${day} ${ARABIC_MONTHS[month]}${hasSession ? ` - ${sessionCount} جلسة` : ''}`}
              >
                <span>{day}</span>
                {hasSession && (
                  <span
                    className="absolute bottom-1.5 flex gap-0.5"
                  >
                    {Array.from({ length: Math.min(sessionCount, 3) }).map((_, i) => (
                      <span
                        key={i}
                        className="w-1 h-1 rounded-full"
                        style={{ background: 'var(--color-brand-gold)' }}
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
