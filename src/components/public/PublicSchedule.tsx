'use client';

import { useState, useEffect } from 'react';
import Hero from './Hero';
import ViewToggle, { type ViewMode } from './ViewToggle';
import CalendarView from './CalendarView';
import ListView from './ListView';
import type { PublicSession } from '@/types/session';

export default function PublicSchedule() {
  const [view, setView] = useState<ViewMode>('list');
  const [sessions, setSessions] = useState<PublicSession[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/sessions')
      .then((r) => r.json())
      .then((data: PublicSession[]) => setSessions(data ?? []))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="bg-slate-50 min-h-screen">
      <Hero />

      {/* Controls bar */}
      <div className="sticky top-0 z-30 bg-slate-50/90 backdrop-blur-md border-b border-slate-200 shadow-sm">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 py-3 flex justify-center">
          <ViewToggle view={view} onChange={setView} />
        </div>
      </div>

      {/* Content */}
      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-8">
        {loading ? (
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <div
                key={i}
                className="h-40 rounded-2xl bg-slate-200/70 animate-shimmer"
              />
            ))}
          </div>
        ) : view === 'calendar' ? (
          <CalendarView sessions={sessions} />
        ) : (
          <ListView sessions={sessions} />
        )}
      </div>

      {/* Footer */}
      <footer className="text-center py-10 mt-8 flex flex-col items-center gap-2 border-t border-slate-200 text-slate-500">
        <p className="text-sm">
          © {new Date().getFullYear()} Mnar Photofilm — All rights reserved
        </p>
        <a
          href="/admin"
          className="text-xs transition-colors hover:text-amber-700 hover:underline"
        >
          Admin Login
        </a>
      </footer>
    </div>
  );
}
