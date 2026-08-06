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
    if (error) { showToast('خطأ في إضافة الجلسة', 'error'); return; }
    showToast('تم إضافة الجلسة بنجاح');
    setSlideOver(null);
    fetchSessions();
  }

  async function handleEditSession(data: SessionInsert) {
    if (!slideOver?.session) return;
    setFormLoading(true);
    const { error } = await supabase.from('sessions').update(data).eq('id', slideOver.session.id);
    setFormLoading(false);
    if (error) { showToast('خطأ في تعديل الجلسة', 'error'); return; }
    showToast('تم تعديل الجلسة بنجاح');
    setSlideOver(null);
    fetchSessions();
  }

  async function handleDeleteSession(id: string) {
    const { error } = await supabase.from('sessions').delete().eq('id', id);
    if (error) { showToast('خطأ في حذف الجلسة', 'error'); return; }
    showToast('تم حذف الجلسة');
    setSlideOver(null);
    fetchSessions();
  }

  return (
    <div className="min-h-screen" style={{ background: 'var(--color-surface-0)' }}>
      {/* Header */}
      <header
        className="sticky top-0 z-30 backdrop-blur-md"
        style={{ background: 'rgba(10,10,15,0.9)', borderBottom: '1px solid var(--color-border-subtle)' }}
      >
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-4 flex items-center justify-between gap-4">
          {/* Brand */}
          <div className="flex items-center gap-3">
            <div
              className="w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0"
              style={{ background: 'rgba(201,169,110,0.12)', border: '1px solid rgba(201,169,110,0.25)' }}
            >
              <LayoutDashboard size={16} style={{ color: 'var(--color-brand-gold)' }} />
            </div>
            <span className="font-semibold text-sm" style={{ color: 'var(--color-text-primary)' }}>
              لوحة الإدارة
            </span>
          </div>

          {/* View toggle */}
          <div className="hidden sm:flex items-center gap-1 rounded-lg p-1" style={{ background: 'var(--color-surface-2)', border: '1px solid var(--color-border-subtle)' }}>
            {([
              { value: 'calendar', label: 'تقويم', Icon: Calendar },
              { value: 'table', label: 'جدول', Icon: Table },
            ] as const).map(({ value, label, Icon }) => (
              <button
                key={value}
                id={`admin-view-${value}`}
                onClick={() => setView(value)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-all cursor-pointer"
                style={{
                  background: view === value ? 'rgba(201,169,110,0.1)' : 'transparent',
                  color: view === value ? 'var(--color-brand-gold)' : 'var(--color-text-muted)',
                }}
              >
                <Icon size={13} /> {label}
              </button>
            ))}
          </div>

          {/* Actions */}
          <div className="flex items-center gap-2">
            <button
              id="admin-add-session-btn"
              onClick={() => setSlideOver({ mode: 'add' })}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-semibold transition-all cursor-pointer"
              style={{
                background: 'linear-gradient(135deg, var(--color-brand-gold-dark), var(--color-brand-gold))',
                color: '#0a0a0f',
              }}
            >
              <Plus size={15} /> إضافة
            </button>

            <a
              href="/admin/import"
              id="admin-import-link"
              className="p-2 rounded-xl transition-colors"
              style={{ background: 'var(--color-surface-2)', border: '1px solid var(--color-border-subtle)', color: 'var(--color-text-muted)' }}
              title="استيراد بيانات"
            >
              <Upload size={16} />
            </a>

            <button
              id="admin-logout-btn"
              onClick={handleLogout}
              className="p-2 rounded-xl transition-colors cursor-pointer"
              style={{ background: 'var(--color-surface-2)', border: '1px solid var(--color-border-subtle)', color: 'var(--color-text-muted)' }}
              title="تسجيل الخروج"
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
            { label: 'إجمالي الجلسات', value: sessions.length },
            { label: 'مؤكدة', value: sessions.filter((s) => s.status === 'confirmed').length },
            { label: 'معلّقة', value: sessions.filter((s) => s.status === 'pending').length },
            { label: 'مكتملة', value: sessions.filter((s) => s.status === 'completed').length },
          ].map(({ label, value }, i) => (
            <div
              key={label}
              className="rounded-2xl px-5 py-4"
              style={{ background: 'var(--color-surface-1)', border: '1px solid var(--color-border-subtle)' }}
            >
              <p className="text-xs mb-1" style={{ color: 'var(--color-text-muted)' }}>{label}</p>
              <p className="text-2xl font-bold" style={{ color: 'var(--color-brand-gold)' }}>{loading ? '—' : value}</p>
            </div>
          ))}
        </div>

        {/* Main view */}
        {loading ? (
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-28 rounded-2xl animate-shimmer" />
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
              className="fixed inset-0 z-40"
              style={{ background: 'rgba(0,0,0,0.55)', backdropFilter: 'blur(4px)' }}
              onClick={() => setSlideOver(null)}
            />
            <motion.div
              key="drawer"
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', stiffness: 340, damping: 32 }}
              className="fixed top-0 right-0 h-full z-50 overflow-y-auto flex flex-col w-full max-w-md shadow-premium-lg"
              style={{ background: 'var(--color-surface-1)', borderLeft: '1px solid var(--color-border)' }}
            >
              <div
                className="flex items-center justify-between px-6 py-5 flex-shrink-0"
                style={{ borderBottom: '1px solid var(--color-border-subtle)' }}
              >
                <h2 className="font-semibold text-lg" style={{ color: 'var(--color-text-primary)' }}>
                  {slideOver.mode === 'add' ? 'إضافة جلسة جديدة' : 'تعديل الجلسة'}
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
            className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[60] px-5 py-3 rounded-xl text-sm font-medium shadow-premium-lg"
            style={{
              background: toast.type === 'success' ? 'rgba(16,185,129,0.12)' : 'rgba(239,68,68,0.12)',
              border: `1px solid ${toast.type === 'success' ? 'rgba(16,185,129,0.3)' : 'rgba(239,68,68,0.3)'}`,
              color: toast.type === 'success' ? '#34d399' : '#f87171',
            }}
          >
            {toast.message}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
