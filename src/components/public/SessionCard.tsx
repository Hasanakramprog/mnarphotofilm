'use client';

import { motion } from 'framer-motion';
import { Clock, MapPin, Camera, Calendar, Phone } from 'lucide-react';
import type { PublicSession } from '@/types/session';
import { formatArabicDate, formatTime, getWhatsAppUrl } from '@/lib/utils';
import { STATUS_LABELS, STATUS_COLORS } from '@/types/session';

interface SessionCardProps {
  session: PublicSession;
  index?: number;
}

export default function SessionCard({ session, index = 0 }: SessionCardProps) {
  return (
    <motion.article
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-60px' }}
      transition={{ duration: 0.45, delay: index * 0.06, ease: 'easeOut' }}
      whileHover={{ y: -2 }}
      className="group rounded-2xl p-6 transition-all duration-300"
      style={{
        background: 'var(--color-surface-1)',
        border: '1px solid var(--color-border-subtle)',
        boxShadow: '0 2px 16px rgba(0,0,0,0.3)',
      }}
      onMouseEnter={(e) => {
        (e.currentTarget as HTMLElement).style.borderColor = 'rgba(201,169,110,0.2)';
        (e.currentTarget as HTMLElement).style.boxShadow =
          '0 4px 32px rgba(0,0,0,0.4), 0 0 0 1px rgba(201,169,110,0.08)';
      }}
      onMouseLeave={(e) => {
        (e.currentTarget as HTMLElement).style.borderColor = 'var(--color-border-subtle)';
        (e.currentTarget as HTMLElement).style.boxShadow = '0 2px 16px rgba(0,0,0,0.3)';
      }}
    >
      {/* Top row: client name + status badge */}
      <div className="flex items-start justify-between gap-4 mb-4">
        <h3
          className="font-semibold text-xl leading-snug transition-colors duration-200"
          style={{ color: 'var(--color-text-primary)' }}
        >
          {session.client_name}
        </h3>
        <span
          className={`text-xs font-medium px-3 py-1.5 rounded-full border flex-shrink-0 ${STATUS_COLORS[session.status]}`}
        >
          {STATUS_LABELS[session.status]}
        </span>
      </div>

      {/* Session type */}
      <div className="flex items-center gap-2.5 mb-3">
        <Camera
          size={15}
          className="flex-shrink-0"
          style={{ color: 'var(--color-brand-gold)' }}
        />
        <span
          className="text-sm font-medium"
          style={{ color: 'var(--color-text-secondary)' }}
        >
          {session.session_type}
        </span>
      </div>

      {/* Separator */}
      <div
        className="my-4 h-px"
        style={{ background: 'var(--color-border-subtle)' }}
      />

      {/* Meta row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
        <div className="flex items-center gap-2">
          <Calendar
            size={14}
            className="flex-shrink-0"
            style={{ color: 'var(--color-text-muted)' }}
          />
          <span
            className="text-sm"
            style={{ color: 'var(--color-text-secondary)' }}
          >
            {formatArabicDate(session.date)}
          </span>
        </div>

        <div className="flex items-center gap-2">
          <Clock
            size={14}
            className="flex-shrink-0"
            style={{ color: 'var(--color-text-muted)' }}
          />
          <span
            className="text-sm ltr-content"
            style={{ color: 'var(--color-text-secondary)' }}
          >
            {formatTime(session.time)}
          </span>
        </div>

        {session.client_phone && (
          <div className="flex items-center gap-2 sm:col-span-2">
            <Phone
              size={14}
              className="flex-shrink-0 text-emerald-400"
            />
            <a
              href={getWhatsAppUrl(session.client_phone) ?? '#'}
              target="_blank"
              rel="noopener noreferrer"
              onClick={(e) => e.stopPropagation()}
              className="text-sm font-medium text-emerald-400 hover:text-emerald-300 hover:underline ltr-content flex items-center gap-1.5 cursor-pointer"
              title="تواصل عبر الواتساب"
            >
              <span>{session.client_phone}</span>
              <span className="text-[11px] px-2 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/25">واتساب 💬</span>
            </a>
          </div>
        )}

        {session.location && (
          <div className="flex items-start gap-2 sm:col-span-2">
            <MapPin
              size={14}
              className="flex-shrink-0 mt-0.5"
              style={{ color: 'var(--color-text-muted)' }}
            />
            <span
              className="text-sm"
              style={{ color: 'var(--color-text-secondary)' }}
            >
              {session.location}
            </span>
          </div>
        )}
      </div>

      {/* Gold accent line at bottom on hover */}
      <motion.div
        className="mt-5 h-px w-0 group-hover:w-full transition-all duration-500 ease-out"
        style={{
          background:
            'linear-gradient(90deg, var(--color-brand-gold-dark), var(--color-brand-gold), transparent)',
        }}
      />
    </motion.article>
  );
}
