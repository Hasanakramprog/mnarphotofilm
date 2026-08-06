'use client';

import { useState, type FormEvent } from 'react';
import { Save, Loader2 } from 'lucide-react';
import type { Session, SessionInsert, SessionStatus } from '@/types/session';
import { motion } from 'framer-motion';
import { formatPhone } from '@/lib/utils';

interface SessionFormProps {
  initialData?: Partial<Session>;
  onSubmit: (data: SessionInsert) => Promise<void>;
  onDelete?: () => Promise<void>;
  onCancel: () => void;
  loading?: boolean;
}

const SESSION_TYPES = [
  'Photo Shoot',
  'Full Wedding Pack',
  'Family Session',
  'Kids Session',
  'Engagement Session',
  'Video Shoot',
  'Other',
];

const STATUS_OPTIONS: { value: SessionStatus; label: string }[] = [
  { value: 'confirmed', label: 'Confirmed' },
  { value: 'pending', label: 'Pending' },
  { value: 'completed', label: 'Completed' },
  { value: 'cancelled', label: 'Cancelled' },
];

export default function SessionForm({
  initialData = {},
  onSubmit,
  onDelete,
  onCancel,
  loading = false,
}: SessionFormProps) {
  const [form, setForm] = useState<SessionInsert>({
    client_name: initialData.client_name ?? '',
    client_phone: initialData.client_phone ?? null,
    date: initialData.date ?? '',
    location: initialData.location ?? '',
    time: initialData.time ?? null,
    session_type: initialData.session_type ?? SESSION_TYPES[0],
    price_text: initialData.price_text ?? null,
    price_numeric: initialData.price_numeric ?? null,
    notes: initialData.notes ?? null,
    status: initialData.status ?? 'confirmed',
  });

  const [deleteConfirm, setDeleteConfirm] = useState(false);
  const [localLoading, setLocalLoading] = useState(false);
  const isLoading = loading || localLoading;

  function set<K extends keyof SessionInsert>(key: K, value: SessionInsert[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setLocalLoading(true);
    try {
      const formattedPhone = formatPhone(form.client_phone);
      await onSubmit({
        ...form,
        client_phone: formattedPhone,
      });
    } finally {
      setLocalLoading(false);
    }
  }

  async function handleDelete() {
    if (!deleteConfirm) {
      setDeleteConfirm(true);
      return;
    }
    if (!onDelete) return;
    setLocalLoading(true);
    try {
      await onDelete();
    } finally {
      setLocalLoading(false);
      setDeleteConfirm(false);
    }
  }

  const inputClass = 'input-field';
  const labelClass = 'block text-sm font-semibold text-slate-700 mb-1.5';

  return (
    <form onSubmit={handleSubmit} className="space-y-5 text-left" id="session-form">
      {/* Client name + Phone row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label htmlFor="sf-client-name" className={labelClass}>
            Client Name <span className="text-rose-500">*</span>
          </label>
          <input
            id="sf-client-name"
            type="text"
            required
            className={inputClass}
            placeholder="Client or couple name"
            value={form.client_name}
            onChange={(e) => set('client_name', e.target.value)}
          />
        </div>
        <div>
          <label htmlFor="sf-client-phone" className={labelClass}>
            Phone / WhatsApp
          </label>
          <input
            id="sf-client-phone"
            type="tel"
            className={inputClass}
            placeholder="+961 70 123 456"
            value={form.client_phone ?? ''}
            onChange={(e) => set('client_phone', e.target.value || null)}
          />
        </div>
      </div>

      {/* Date + Time row */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label htmlFor="sf-date" className={labelClass}>
            Date <span className="text-rose-500">*</span>
          </label>
          <input
            id="sf-date"
            type="date"
            required
            className={inputClass}
            value={form.date}
            onChange={(e) => set('date', e.target.value)}
          />
        </div>
        <div>
          <label htmlFor="sf-time" className={labelClass}>
            Time
          </label>
          <input
            id="sf-time"
            type="time"
            className={inputClass}
            value={form.time ?? ''}
            onChange={(e) => set('time', e.target.value || null)}
          />
        </div>
      </div>

      {/* Session type */}
      <div>
        <label htmlFor="sf-session-type" className={labelClass}>
          Session Type
        </label>
        <select
          id="sf-session-type"
          className={`${inputClass} select-field`}
          value={form.session_type}
          onChange={(e) => set('session_type', e.target.value)}
        >
          {SESSION_TYPES.map((t) => (
            <option key={t} value={t}>{t}</option>
          ))}
        </select>
      </div>

      {/* Location */}
      <div>
        <label htmlFor="sf-location" className={labelClass}>
          Location
        </label>
        <input
          id="sf-location"
          type="text"
          className={inputClass}
          placeholder="e.g. Studio & Outdoor"
          value={form.location}
          onChange={(e) => set('location', e.target.value)}
        />
      </div>

      {/* Price row */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label htmlFor="sf-price-num" className={labelClass}>
            Price (Numeric $)
          </label>
          <input
            id="sf-price-num"
            type="number"
            step="0.01"
            className={inputClass}
            placeholder="250"
            value={form.price_numeric ?? ''}
            onChange={(e) => set('price_numeric', e.target.value ? parseFloat(e.target.value) : null)}
          />
        </div>
        <div>
          <label htmlFor="sf-price-text" className={labelClass}>
            Price (Custom Text)
          </label>
          <input
            id="sf-price-text"
            type="text"
            className={inputClass}
            placeholder="e.g. 200 + 50 deposit"
            value={form.price_text ?? ''}
            onChange={(e) => set('price_text', e.target.value || null)}
          />
        </div>
      </div>

      {/* Status */}
      <div>
        <label htmlFor="sf-status" className={labelClass}>
          Status
        </label>
        <select
          id="sf-status"
          className={`${inputClass} select-field`}
          value={form.status}
          onChange={(e) => set('status', e.target.value as SessionStatus)}
        >
          {STATUS_OPTIONS.map((o) => (
            <option key={o.value} value={o.value}>{o.label}</option>
          ))}
        </select>
      </div>

      {/* Notes */}
      <div>
        <label htmlFor="sf-notes" className={labelClass}>
          Notes
        </label>
        <textarea
          id="sf-notes"
          rows={3}
          className={inputClass}
          placeholder="Any additional notes or instructions..."
          value={form.notes ?? ''}
          onChange={(e) => set('notes', e.target.value || null)}
          style={{ resize: 'vertical' }}
        />
      </div>

      {/* Action buttons */}
      <div className="flex items-center gap-3 pt-2">
        <button
          id="session-form-submit"
          type="submit"
          disabled={isLoading}
          className="flex-1 flex items-center justify-center gap-2 rounded-xl py-3 font-bold text-sm bg-gradient-to-r from-amber-600 to-amber-500 text-white hover:from-amber-700 hover:to-amber-600 shadow-sm transition-all duration-200 cursor-pointer disabled:opacity-60"
        >
          {isLoading ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
          {isLoading ? 'Saving...' : 'Save Session'}
        </button>

        <button
          type="button"
          onClick={onCancel}
          disabled={isLoading}
          className="px-5 py-3 rounded-xl text-sm font-semibold bg-slate-100 border border-slate-300 text-slate-700 hover:bg-slate-200 transition-colors duration-200 cursor-pointer disabled:opacity-60"
          id="session-form-cancel"
        >
          Cancel
        </button>

        {onDelete && (
          <motion.button
            type="button"
            onClick={handleDelete}
            disabled={isLoading}
            animate={deleteConfirm ? { scale: [1, 1.02, 1] } : {}}
            className={`px-4 py-3 rounded-xl text-sm font-semibold transition-all duration-200 cursor-pointer disabled:opacity-60 ${
              deleteConfirm
                ? 'bg-rose-100 text-rose-700 border border-rose-300'
                : 'bg-slate-100 text-slate-500 border border-slate-200 hover:text-rose-600 hover:bg-rose-50'
            }`}
            id="session-form-delete"
          >
            {deleteConfirm ? 'Confirm Delete?' : 'Delete'}
          </motion.button>
        )}
      </div>
    </form>
  );
}
