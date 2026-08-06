'use client';

import { motion } from 'framer-motion';
import { Clock, MapPin, Camera, Calendar, Phone } from 'lucide-react';
import type { PublicSession } from '@/types/session';
import { formatDate, formatTime, getWhatsAppUrl, formatPhone } from '@/lib/utils';
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
      className="group rounded-2xl p-6 bg-white border border-slate-200 shadow-sm hover:shadow-md hover:border-amber-300 transition-all duration-300"
    >
      {/* Top row: client name + status badge */}
      <div className="flex items-start justify-between gap-4 mb-3">
        <h3 className="font-bold text-xl leading-snug text-slate-900 group-hover:text-amber-800 transition-colors duration-200">
          {session.client_name}
        </h3>
        <span
          className={`text-xs font-semibold px-3 py-1 rounded-full border flex-shrink-0 ${STATUS_COLORS[session.status]}`}
        >
          {STATUS_LABELS[session.status]}
        </span>
      </div>

      {/* Session type */}
      <div className="flex items-center gap-2.5 mb-3">
        <Camera size={15} className="flex-shrink-0 text-amber-600" />
        <span className="text-sm font-semibold text-slate-700">
          {session.session_type}
        </span>
      </div>

      {/* Separator */}
      <div className="my-3.5 h-px bg-slate-100" />

      {/* Meta row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
        <div className="flex items-center gap-2">
          <Calendar size={14} className="flex-shrink-0 text-slate-400" />
          <span className="text-sm text-slate-600 font-medium">
            {formatDate(session.date)}
          </span>
        </div>

        <div className="flex items-center gap-2">
          <Clock size={14} className="flex-shrink-0 text-slate-400" />
          <span className="text-sm text-slate-600 font-medium">
            {formatTime(session.time)}
          </span>
        </div>

        {session.client_phone && (
          <div className="flex items-center gap-2 sm:col-span-2">
            <Phone size={14} className="flex-shrink-0 text-emerald-600" />
            <a
              href={getWhatsAppUrl(session.client_phone) ?? '#'}
              target="_blank"
              rel="noopener noreferrer"
              onClick={(e) => e.stopPropagation()}
              className="text-sm font-semibold text-emerald-700 hover:text-emerald-800 hover:underline flex items-center gap-1.5 cursor-pointer"
              title="Chat on WhatsApp"
            >
              <span>{formatPhone(session.client_phone)}</span>
              <span className="text-[11px] px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                WhatsApp 💬
              </span>
            </a>
          </div>
        )}

        {session.location && (
          <div className="flex items-start gap-2 sm:col-span-2">
            <MapPin size={14} className="flex-shrink-0 mt-0.5 text-slate-400" />
            <span className="text-sm text-slate-600">
              {session.location}
            </span>
          </div>
        )}
      </div>

      {/* Gold accent line at bottom on hover */}
      <motion.div className="mt-4 h-0.5 w-0 group-hover:w-full transition-all duration-500 ease-out bg-gradient-to-r from-amber-500 to-amber-300" />
    </motion.article>
  );
}
