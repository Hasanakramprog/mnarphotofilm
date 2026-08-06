'use client';

export const dynamic = 'force-dynamic';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, LogOut, Table, Calendar, Upload, LayoutDashboard } from 'lucide-react';
import type { Session, SessionInsert } from '@/types/session';
import AdminCalendar from '@/components/admin/AdminCalendar';
import SessionTable from '@/components/admin/SessionTable';
import SessionForm from '@/components/admin/SessionForm';
import { createClient } from '@/lib/supabase/client';

type AdminView = 'calendar' | 'table';

interface SlideOver {
  mode: 'add' | 'edit';
  date?: string;
  session?: Session;
}

export default function AdminDashboard() {
  const router = useRouter();
  const supabase = createClient();
  const [view, setView] = useState<AdminView>('calendar');
  const [sessions, setSessions] = useState<Session[]>([]);
  const [loading, setLoading] = useState(true);
  const [slideOver, setSlideOver] = useState<SlideOver | null>(null);
  const [formLoading, setFormLoading] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  // Auth guard
  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (!user) router.replace('/admin/login');
    });
  }, [router, supabase.auth]);

  const fetchSessions = useCallback(async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('sessions')
      .select('*')
      .order('date', { ascending: true });
    if (!error && data) setSessions(data as Session[]);
    setLoading(false);
  }, [supabase]);

  useEffect(() => { fetchSessions(); }, [fetchSessions]);

  function showToast(message: string, type: 'success' | 'error' = 'success') {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3500);
  }

  async function handleLogout() {
    await supabase.auth.signOut();
    router.push('/admin/login');
  }

  async function handleAddSession(data: SessionInsert) {
    setFormLoading(true);
    const { error } = await supabase.from('sessions').insert([data]);
    setFormLoading(false);
    if (error) { showToast('Error adding session', 'error'); return; }
    showToast('Session added successfully');
    setSlideOver(null);
    fetchSessions();
  }

  async function handleEditSession(data: SessionInsert) {
    if (!slideOver?.session) return;
    setFormLoading(true);
    const { error } = await supabase.from('sessions').update(data).eq('id', slideOver.session.id);
    setFormLoading(false);
    if (error) { showToast('Error updating session', 'error'); return; }
    showToast('Session updated successfully');
    setSlideOver(null);
    fetchSessions();
  }

  async function handleDeleteSession(id: string) {
    const { error } = await supabase.from('sessions').delete().eq('id', id);
    if (error) { showToast('Error deleting session', 'error'); return; }
    showToast('Session deleted');
    setSlideOver(null);
    fetchSessions();
  }

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <header className="sticky top-0 z-30 bg-white/90 backdrop-blur-md border-b border-slate-200 shadow-xs">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-4 flex items-center justify-between gap-4">
          {/* Brand */}
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-amber-50 border border-amber-200 flex items-center justify-center flex-shrink-0 text-amber-700">
              <LayoutDashboard size={18} />
            </div>
            <span className="font-bold text-base text-slate-900">
              Admin Dashboard
            </span>
          </div>

          {/* View toggle */}
          <div className="hidden sm:flex items-center gap-1 rounded-xl p-1 bg-slate-100 border border-slate-200">
            {([
              { value: 'calendar', label: 'Calendar', Icon: Calendar },
              { value: 'table', label: 'Table', Icon: Table },
            ] as const).map(({ value, label, Icon }) => (
              <button
                key={value}
                id={`admin-view-${value}`}
                onClick={() => setView(value)}
                className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                  view === value
                    ? 'bg-white text-amber-800 shadow-xs border border-amber-300'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <Icon size={14} /> {label}
              </button>
            ))}
          </div>

          {/* Actions */}
          <div className="flex items-center gap-2">
            <button
              id="admin-add-session-btn"
              onClick={() => setSlideOver({ mode: 'add' })}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs sm:text-sm font-bold bg-amber-600 text-white hover:bg-amber-700 shadow-sm transition-all cursor-pointer"
            >
              <Plus size={16} /> Add Session
            </button>

            <a
              href="/admin/import"
              id="admin-import-link"
              className="p-2 rounded-xl bg-slate-100 border border-slate-200 text-slate-600 hover:bg-slate-200 transition-colors"
              title="Import CSV Data"
            >
              <Upload size={16} />
            </a>

            <button
              id="admin-logout-btn"
              onClick={handleLogout}
              className="p-2 rounded-xl bg-slate-100 border border-slate-200 text-slate-600 hover:bg-slate-200 hover:text-rose-600 transition-colors cursor-pointer"
              title="Logout"
            >
              <LogOut size={16} />
            </button>
          </div>
        </div>
      </header>

      {/* Main content */}
      <main className="max-w-6xl mx-auto px-4 sm:px-6 py-8">
        {/* Stats row */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
          {[
            { label: 'Total Sessions', value: sessions.length },
            { label: 'Confirmed', value: sessions.filter((s) => s.status === 'confirmed').length },
            { label: 'Pending', value: sessions.filter((s) => s.status === 'pending').length },
            { label: 'Completed', value: sessions.filter((s) => s.status === 'completed').length },
          ].map(({ label, value }) => (
            <div
              key={label}
              className="rounded-2xl px-5 py-4 bg-white border border-slate-200 shadow-xs"
            >
              <p className="text-xs font-semibold text-slate-500 mb-1">{label}</p>
              <p className="text-2xl font-extrabold text-amber-700">{loading ? '—' : value}</p>
            </div>
          ))}
        </div>

        {/* Main view */}
        {loading ? (
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-28 rounded-2xl bg-slate-200/70 animate-shimmer" />
            ))}
          </div>
        ) : view === 'calendar' ? (
          <AdminCalendar
            sessions={sessions}
            onAddSession={(date) => setSlideOver({ mode: 'add', date })}
            onEditSession={(session) => setSlideOver({ mode: 'edit', session })}
          />
        ) : (
          <SessionTable
            sessions={sessions}
            onEdit={(session) => setSlideOver({ mode: 'edit', session })}
            onDelete={(id) => handleDeleteSession(id)}
          />
        )}
      </main>

      {/* SlideOver for add/edit */}
      <AnimatePresence>
        {slideOver && (
          <>
            <motion.div
              key="overlay"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-40 bg-slate-900/40 backdrop-blur-xs"
              onClick={() => setSlideOver(null)}
            />
            <motion.div
              key="drawer"
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', stiffness: 340, damping: 32 }}
              className="fixed top-0 right-0 h-full z-50 overflow-y-auto flex flex-col w-full max-w-md bg-white border-l border-slate-200 shadow-2xl"
            >
              <div className="flex items-center justify-between px-6 py-5 flex-shrink-0 border-b border-slate-200 bg-slate-50">
                <h2 className="font-bold text-lg text-slate-900">
                  {slideOver.mode === 'add' ? 'Add New Session' : 'Edit Session'}
                </h2>
              </div>

              <div className="flex-1 px-6 py-6">
                <SessionForm
                  initialData={
                    slideOver.mode === 'edit'
                      ? slideOver.session
                      : slideOver.date
                      ? { date: slideOver.date }
                      : {}
                  }
                  onSubmit={slideOver.mode === 'add' ? handleAddSession : handleEditSession}
                  onDelete={
                    slideOver.mode === 'edit' && slideOver.session
                      ? () => handleDeleteSession(slideOver.session!.id)
                      : undefined
                  }
                  onCancel={() => setSlideOver(null)}
                  loading={formLoading}
                />
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Toast notification */}
      <AnimatePresence>
        {toast && (
          <motion.div
            key="toast"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className={`fixed bottom-6 left-1/2 -translate-x-1/2 z-[60] px-5 py-3 rounded-xl text-sm font-bold shadow-xl border ${
              toast.type === 'success'
                ? 'bg-emerald-50 text-emerald-800 border-emerald-300'
                : 'bg-rose-50 text-rose-800 border-rose-300'
            }`}
          >
            {toast.message}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
