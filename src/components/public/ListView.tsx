'use client';

import { useMemo } from 'react';
import { motion } from 'framer-motion';
import type { PublicSession } from '@/types/session';
import SessionCard from './SessionCard';
import { getMonthKey, getMonthYear } from '@/lib/utils';
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
          className="mb-4 opacity-30 text-amber-600"
        />
        <h3 className="text-xl font-bold mb-1 text-slate-800">
          No Upcoming Sessions
        </h3>
        <p className="text-slate-500 text-sm">Check back soon for new photo session schedules</p>
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
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: '-40px' }}
            transition={{ duration: 0.4, ease: 'easeOut' }}
            className="flex items-center gap-4 mb-6"
          >
            <h2 className="text-xl font-extrabold text-amber-700 whitespace-nowrap">
              {getMonthYear(monthSessions[0].date)}
            </h2>
            <div className="flex-1 h-px bg-gradient-to-r from-amber-300/60 to-transparent" />
            <span className="text-xs font-semibold px-3 py-1 rounded-full bg-amber-50 text-amber-800 border border-amber-200 shadow-xs">
              {monthSessions.length} {monthSessions.length === 1 ? 'session' : 'sessions'}
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
