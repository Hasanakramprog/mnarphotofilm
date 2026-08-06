'use client';

import { useMemo } from 'react';
import { motion } from 'framer-motion';
import type { PublicSession } from '@/types/session';
import SessionCard from './SessionCard';
import { getMonthKey, getArabicMonthYear } from '@/lib/utils';
import { Camera } from 'lucide-react';

interface ListViewProps {
  sessions: PublicSession[];
}

export default function ListView({ sessions }: ListViewProps) {
  // Sort ascending by date
  const sorted = useMemo(
    () => [...sessions].sort((a, b) => a.date.localeCompare(b.date)),
    [sessions]
  );

  // Group by YYYY-MM
  const groups = useMemo(() => {
    const map = new Map<string, PublicSession[]>();
    for (const s of sorted) {
      const key = getMonthKey(s.date);
      if (!map.has(key)) map.set(key, []);
      map.get(key)!.push(s);
    }
    return Array.from(map.entries());
  }, [sorted]);

  if (groups.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-24 text-center">
        <Camera
          size={56}
          className="mb-6 opacity-15"
          style={{ color: 'var(--color-brand-gold)' }}
        />
        <h3
          className="text-xl font-semibold mb-2"
          style={{ color: 'var(--color-text-secondary)' }}
        >
          لا توجد جلسات قادمة
        </h3>
        <p style={{ color: 'var(--color-text-muted)' }}>تابعي الصفحة لمعرفة الجلسات الجديدة</p>
      </div>
    );
  }

  let cardIndex = 0;

  return (
    <div className="space-y-12">
      {groups.map(([monthKey, monthSessions]) => (
        <section key={monthKey}>
          {/* Month heading with gold line */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: '-40px' }}
            transition={{ duration: 0.4, ease: 'easeOut' }}
            className="flex items-center gap-4 mb-6"
          >
            <h2
              className="text-xl font-bold whitespace-nowrap"
              style={{ color: 'var(--color-brand-gold)' }}
            >
              {getArabicMonthYear(monthSessions[0].date)}
            </h2>
            <div
              className="flex-1 h-px"
              style={{
                background:
                  'linear-gradient(90deg, rgba(201,169,110,0.4), transparent)',
              }}
            />
            <span
              className="text-sm font-medium px-3 py-1 rounded-full"
              style={{
                background: 'rgba(201,169,110,0.08)',
                color: 'var(--color-text-muted)',
                border: '1px solid rgba(201,169,110,0.12)',
              }}
            >
              {monthSessions.length} جلسة
            </span>
          </motion.div>

          {/* Session cards */}
          <div className="space-y-4">
            {monthSessions.map((session) => {
              const idx = cardIndex++;
              return (
                <SessionCard key={session.id} session={session} index={idx % 6} />
              );
            })}
          </div>
        </section>
      ))}
    </div>
  );
}
