'use client';

import { useState, type FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import { X, Save, Loader2 } from 'lucide-react';
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
  'جلسة تصوير',
  'Full wedding Pack',
  'تصوير عائلي',
  'جلسة أطفال',
  'جلسة خطوبة',
  'تصوير فيديو',
  'أخرى',
];

const STATUS_OPTIONS: { value: SessionStatus; label: string }[] = [
  { value: 'confirmed', label: 'مؤكد' },
  { value: 'pending', label: 'معلّق' },
  { value: 'completed', label: 'مكتمل' },
  { value: 'cancelled', label: 'ملغى' },
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
  const labelClass = 'block text-sm font-medium mb-1.5';

  return (
    <form onSubmit={handleSubmit} className="space-y-5" id="session-form">
      {/* Client name + Phone row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label htmlFor="sf-client-name" className={labelClass} style={{ color: 'var(--color-text-secondary)' }}>
            اسم العميل <span style={{ color: '#f87171' }}>*</span>
          </label>
          <input
            id="sf-client-name"
            type="text"
            required
            className={inputClass}
            placeholder="اسم العميل أو الثنائي"
            value={form.client_name}
            onChange={(e) => set('client_name', e.target.value)}
          />
        </div>
        <div>
          <label htmlFor="sf-client-phone" className={labelClass} style={{ color: 'var(--color-text-secondary)' }}>
            رقم الهاتف / الواتساب
          </label>
          <input
            id="sf-client-phone"
            type="tel"
            className={`${inputClass} ltr-content`}
            placeholder="+961 70 123 456"
            value={form.client_phone ?? ''}
            onChange={(e) => set('client_phone', e.target.value || null)}
          />
        </div>
      </div>

      {/* Date + Time row */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label htmlFor="sf-date" className={labelClass} style={{ color: 'var(--color-text-secondary)' }}>
            التاريخ <span style={{ color: '#f87171' }}>*</span>
          </label>
          <input
            id="sf-date"
            type="date"
            required
            className={`${inputClass} ltr-content`}
            value={form.date}
            onChange={(e) => set('date', e.target.value)}
          />
        </div>
        <div>
          <label htmlFor="sf-time" className={labelClass} style={{ color: 'var(--color-text-secondary)' }}>
            الساعة
          </label>
          <input
            id="sf-time"
            type="time"
            className={`${inputClass} ltr-content`}
            value={form.time ?? ''}
            onChange={(e) => set('time', e.target.value || null)}
          />
        </div>
      </div>

      {/* Session type */}
      <div>
        <label htmlFor="sf-session-type" className={labelClass} style={{ color: 'var(--color-text-secondary)' }}>
          نوع التصوير
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
        <label htmlFor="sf-location" className={labelClass} style={{ color: 'var(--color-text-secondary)' }}>
          اللوكيشن
        </label>
        <input
          id="sf-location"
          type="text"
          className={inputClass}
          placeholder="مثال: البيت + Outdoor"
          value={form.location}
          onChange={(e) => set('location', e.target.value)}
        />
      </div>

      {/* Price row */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label htmlFor="sf-price-num" className={labelClass} style={{ color: 'var(--color-text-secondary)' }}>
            السعر (رقم)
          </label>
          <input
            id="sf-price-num"
            type="number"
            step="0.01"
            className={`${inputClass} ltr-content`}
            placeholder="230"
            value={form.price_numeric ?? ''}
            onChange={(e) => set('price_numeric', e.target.value ? parseFloat(e.target.value) : null)}
          />
        </div>
        <div>
          <label htmlFor="sf-price-text" className={labelClass} style={{ color: 'var(--color-text-secondary)' }}>
            السعر (نص حر)
          </label>
          <input
            id="sf-price-text"
            type="text"
            className={inputClass}
            placeholder="230 + 20"
            value={form.price_text ?? ''}
            onChange={(e) => set('price_text', e.target.value || null)}
          />
        </div>
      </div>

      {/* Status */}
      <div>
        <label htmlFor="sf-status" className={labelClass} style={{ color: 'var(--color-text-secondary)' }}>
          الحالة
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
        <label htmlFor="sf-notes" className={labelClass} style={{ color: 'var(--color-text-secondary)' }}>
          ملاحظات
        </label>
        <textarea
          id="sf-notes"
          rows={3}
          className={inputClass}
          placeholder="أي ملاحظات إضافية..."
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
          className="flex-1 flex items-center justify-center gap-2 rounded-xl py-3 font-semibold text-sm transition-all duration-200 cursor-pointer disabled:opacity-60"
          style={{
            background: 'linear-gradient(135deg, var(--color-brand-gold-dark), var(--color-brand-gold))',
            color: '#0a0a0f',
          }}
        >
          {isLoading ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
          {isLoading ? 'جارٍ الحفظ...' : 'حفظ'}
        </button>

        <button
          type="button"
          onClick={onCancel}
          disabled={isLoading}
          className="px-5 py-3 rounded-xl text-sm font-medium transition-colors duration-200 cursor-pointer disabled:opacity-60"
          style={{
            background: 'var(--color-surface-2)',
            border: '1px solid var(--color-border-subtle)',
            color: 'var(--color-text-secondary)',
          }}
          id="session-form-cancel"
        >
          إلغاء
        </button>

        {onDelete && (
          <motion.button
            type="button"
            onClick={handleDelete}
            disabled={isLoading}
            animate={deleteConfirm ? { scale: [1, 1.02, 1] } : {}}
            className="px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 cursor-pointer disabled:opacity-60"
            style={{
              background: deleteConfirm
                ? 'rgba(239,68,68,0.15)'
                : 'var(--color-surface-2)',
              border: deleteConfirm
                ? '1px solid rgba(239,68,68,0.3)'
                : '1px solid var(--color-border-subtle)',
              color: deleteConfirm ? '#f87171' : 'var(--color-text-muted)',
            }}
            id="session-form-delete"
          >
            {deleteConfirm ? 'تأكيد الحذف؟' : 'حذف'}
          </motion.button>
        )}
      </div>
    </form>
  );
}
