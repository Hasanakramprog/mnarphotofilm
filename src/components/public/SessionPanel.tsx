'use client';

import { useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Clock, MapPin, Camera, Phone } from 'lucide-react';
import type { PublicSession } from '@/types/session';
import { formatArabicDate, formatTime, getWhatsAppUrl, formatPhone } from '@/lib/utils';
import { STATUS_LABELS, STATUS_COLORS } from '@/types/session';

interface SessionPanelProps {
  open: boolean;
  onClose: () => void;
  date: string | null;
  sessions: PublicSession[];
}

export default function SessionPanel({ open, onClose, date, sessions }: SessionPanelProps) {
  const panelRef = useRef<HTMLDivElement>(null);

  // Close on Escape key
  useEffect(() => {
    function handleKey(e: KeyboardEvent) {
      if (e.key === 'Escape') onClose();
    }
    if (open) {
      document.addEventListener('keydown', handleKey);
      document.body.style.overflow = 'hidden';
    }
    return () => {
      document.removeEventListener('keydown', handleKey);
      document.body.style.overflow = '';
    };
  }, [open, onClose]);

  return (
    <AnimatePresence>
      {open && (
        <>
          {/* Backdrop */}
          <motion.div
            key="backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="fixed inset-0 z-40"
            style={{ background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)' }}
            onClick={onClose}
          />

          {/* Panel — slides in from right (RTL: right side) */}
          <motion.div
            key="panel"
            ref={panelRef}
            initial={{ x: '100%', opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: '100%', opacity: 0 }}
            transition={{ type: 'spring', stiffness: 340, damping: 32 }}
            className="fixed top-0 right-0 h-full z-50 flex flex-col w-full max-w-sm sm:max-w-md shadow-premium-lg overflow-hidden"
            style={{
              background: 'var(--color-surface-1)',
              borderLeft: '1px solid var(--color-border)',
            }}
            aria-modal="true"
            role="dialog"
            aria-label="تفاصيل الجلسات"
          >
            {/* Header */}
            <div
              className="flex items-center justify-between px-6 py-5 flex-shrink-0"
              style={{ borderBottom: '1px solid var(--color-border-subtle)' }}
            >
              <div>
                <p className="text-xs font-medium mb-1" style={{ color: 'var(--color-text-muted)' }}>
                  جلسات يوم
                </p>
                <h2 className="text-lg font-semibold" style={{ color: 'var(--color-text-primary)' }}>
                  {date ? formatArabicDate(date) : ''}
                </h2>
              </div>
              <button
                onClick={onClose}
                aria-label="إغلاق"
                className="p-2 rounded-lg transition-colors hover:bg-white/5 cursor-pointer"
                style={{ color: 'var(--color-text-muted)' }}
              >
                <X size={20} />
              </button>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto px-6 py-5 space-y-4">
              {sessions.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-48 text-center">
                  <Camera
                    size={40}
                    className="mb-4 opacity-20"
                    style={{ color: 'var(--color-brand-gold)' }}
                  />
                  <p style={{ color: 'var(--color-text-muted)' }}>لا توجد جلسات في هذا اليوم</p>
                </div>
              ) : (
                sessions.map((session, i) => (
                  <motion.div
                    key={session.id}
                    initial={{ opacity: 0, y: 16 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.07, duration: 0.35 }}
                    className="rounded-xl p-5 space-y-3"
                    style={{
                      background: 'var(--color-surface-2)',
                      border: '1px solid var(--color-border-subtle)',
                    }}
                  >
                    {/* Client name + status */}
                    <div className="flex items-start justify-between gap-3">
                      <h3
                        className="font-semibold text-lg leading-snug"
                        style={{ color: 'var(--color-text-primary)' }}
                      >
                        {session.client_name}
                      </h3>
                      <span
                        className={`text-xs font-medium px-2.5 py-1 rounded-full border flex-shrink-0 ${STATUS_COLORS[session.status]}`}
                      >
                        {STATUS_LABELS[session.status]}
                      </span>
                    </div>

                    {/* Session type */}
                    <div className="flex items-center gap-2">
                      <Camera size={14} style={{ color: 'var(--color-brand-gold)' }} className="flex-shrink-0" />
                      <span className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>
                        {session.session_type}
                      </span>
                    </div>

                    {/* Time */}
                    <div className="flex items-center gap-2">
                      <Clock size={14} style={{ color: 'var(--color-brand-gold)' }} className="flex-shrink-0" />
                      <span
                        className="text-sm ltr-content"
                        style={{ color: 'var(--color-text-secondary)' }}
                      >
                        {formatTime(session.time)}
                      </span>
                    </div>

                    {/* WhatsApp Phone */}
                    {session.client_phone && (
                      <div className="flex items-center gap-2">
                        <Phone size={14} className="text-emerald-400 flex-shrink-0" />
                        <a
                          href={getWhatsAppUrl(session.client_phone) ?? '#'}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-sm font-medium text-emerald-400 hover:underline ltr-content flex items-center gap-1.5 cursor-pointer"
                          title="تواصل عبر الواتساب"
                        >
                          <span>{formatPhone(session.client_phone)}</span>
                          <span className="text-[10px] px-1.5 py-0.5 rounded bg-emerald-500/10 border border-emerald-500/20">واتساب</span>
                        </a>
                      </div>
                    )}

                    {/* Location */}
                    {session.location && (
                      <div className="flex items-start gap-2">
                        <MapPin size={14} style={{ color: 'var(--color-brand-gold)' }} className="flex-shrink-0 mt-0.5" />
                        <span className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>
                          {session.location}
                        </span>
                      </div>
                    )}
                  </motion.div>
                ))
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
