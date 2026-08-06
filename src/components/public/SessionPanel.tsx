'use client';

import { useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Clock, MapPin, Camera, Phone } from 'lucide-react';
import type { PublicSession } from '@/types/session';
import { formatDate, formatTime, getWhatsAppUrl, formatPhone } from '@/lib/utils';
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
            className="fixed inset-0 z-40 bg-slate-900/40 backdrop-blur-xs"
            onClick={onClose}
          />

          {/* Panel — slides in from right */}
          <motion.div
            key="panel"
            ref={panelRef}
            initial={{ x: '100%', opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: '100%', opacity: 0 }}
            transition={{ type: 'spring', stiffness: 340, damping: 32 }}
            className="fixed top-0 right-0 h-full z-50 flex flex-col w-full max-w-sm sm:max-w-md bg-white border-l border-slate-200 shadow-2xl overflow-hidden"
            aria-modal="true"
            role="dialog"
            aria-label="Session Details"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-5 flex-shrink-0 border-b border-slate-200 bg-slate-50">
              <div>
                <p className="text-xs font-semibold text-slate-400 mb-0.5">
                  Sessions for
                </p>
                <h2 className="text-lg font-bold text-slate-900">
                  {date ? formatDate(date) : ''}
                </h2>
              </div>
              <button
                onClick={onClose}
                aria-label="Close"
                className="p-2 rounded-lg transition-colors hover:bg-slate-200/70 text-slate-500 cursor-pointer"
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
                    className="mb-3 opacity-30 text-amber-600"
                  />
                  <p className="text-slate-500 text-sm font-medium">No sessions scheduled for this day</p>
                </div>
              ) : (
                sessions.map((session, i) => (
                  <motion.div
                    key={session.id}
                    initial={{ opacity: 0, y: 16 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.07, duration: 0.35 }}
                    className="rounded-xl p-5 space-y-3 bg-slate-50 border border-slate-200/80 shadow-xs"
                  >
                    {/* Client name + status */}
                    <div className="flex items-start justify-between gap-3">
                      <h3 className="font-bold text-lg leading-snug text-slate-900">
                        {session.client_name}
                      </h3>
                      <span
                        className={`text-xs font-semibold px-2.5 py-1 rounded-full border flex-shrink-0 ${STATUS_COLORS[session.status]}`}
                      >
                        {STATUS_LABELS[session.status]}
                      </span>
                    </div>

                    {/* Session type */}
                    <div className="flex items-center gap-2">
                      <Camera size={14} className="flex-shrink-0 text-amber-600" />
                      <span className="text-sm font-medium text-slate-700">
                        {session.session_type}
                      </span>
                    </div>

                    {/* Time */}
                    <div className="flex items-center gap-2">
                      <Clock size={14} className="flex-shrink-0 text-amber-600" />
                      <span className="text-sm font-medium text-slate-600">
                        {formatTime(session.time)}
                      </span>
                    </div>

                    {/* WhatsApp Phone */}
                    {session.client_phone && (
                      <div className="flex items-center gap-2">
                        <Phone size={14} className="text-emerald-600 flex-shrink-0" />
                        <a
                          href={getWhatsAppUrl(session.client_phone) ?? '#'}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-sm font-semibold text-emerald-700 hover:underline flex items-center gap-1.5 cursor-pointer"
                          title="Chat on WhatsApp"
                        >
                          <span>{formatPhone(session.client_phone)}</span>
                          <span className="text-[10px] px-1.5 py-0.5 rounded bg-emerald-50 text-emerald-700 border border-emerald-200">
                            WhatsApp
                          </span>
                        </a>
                      </div>
                    )}

                    {/* Location */}
                    {session.location && (
                      <div className="flex items-start gap-2">
                        <MapPin size={14} className="text-amber-600 flex-shrink-0 mt-0.5" />
                        <span className="text-sm text-slate-600">
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
