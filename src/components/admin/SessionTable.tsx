'use client';

import { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { Search, Filter, Pencil, Trash2, Phone } from 'lucide-react';
import type { Session } from '@/types/session';
import { STATUS_COLORS, STATUS_LABELS } from '@/types/session';
import { formatArabicDate, formatTime, formatPrice, getWhatsAppUrl, formatPhone } from '@/lib/utils';

interface SessionTableProps {
  sessions: Session[];
  onEdit: (session: Session) => void;
  onDelete: (id: string) => void;
}

const ALL_MONTHS_KEY = 'all';

export default function SessionTable({ sessions, onEdit, onDelete }: SessionTableProps) {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [monthFilter, setMonthFilter] = useState(ALL_MONTHS_KEY);

  // Derive distinct months from sessions for the filter dropdown
  const months = useMemo(() => {
    const keys = new Set(sessions.map((s) => s.date.substring(0, 7)));
    return Array.from(keys).sort();
  }, [sessions]);

  const filtered = useMemo(() => {
    return sessions.filter((s) => {
      const matchSearch =
        !search ||
        s.client_name.toLowerCase().includes(search.toLowerCase()) ||
        (s.client_phone && s.client_phone.includes(search)) ||
        s.session_type.toLowerCase().includes(search.toLowerCase()) ||
        s.location.toLowerCase().includes(search.toLowerCase());
      const matchStatus = statusFilter === 'all' || s.status === statusFilter;
      const matchMonth = monthFilter === ALL_MONTHS_KEY || s.date.startsWith(monthFilter);
      return matchSearch && matchStatus && matchMonth;
    });
  }, [sessions, search, statusFilter, monthFilter]);

  const sorted = useMemo(() => [...filtered].sort((a, b) => a.date.localeCompare(b.date)), [filtered]);

  return (
    <div
      className="rounded-2xl overflow-hidden"
      style={{ background: 'var(--color-surface-1)', border: '1px solid var(--color-border-subtle)' }}
    >
      {/* Filters bar */}
      <div
        className="flex flex-wrap items-center gap-3 px-5 py-4"
        style={{ borderBottom: '1px solid var(--color-border-subtle)' }}
      >
        {/* Search */}
        <div className="relative flex-1 min-w-[180px]">
          <Search size={15} className="absolute top-1/2 -translate-y-1/2 start-3 pointer-events-none" style={{ color: 'var(--color-text-muted)' }} />
          <input
            id="session-table-search"
            type="search"
            placeholder="بحث..."
            className="input-field ps-9"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        {/* Status filter */}
        <select
          id="session-table-status-filter"
          className="input-field select-field w-auto"
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
        >
          <option value="all">كل الحالات</option>
          <option value="confirmed">مؤكد</option>
          <option value="pending">معلّق</option>
          <option value="completed">مكتمل</option>
          <option value="cancelled">ملغى</option>
        </select>

        {/* Month filter */}
        <select
          id="session-table-month-filter"
          className="input-field select-field w-auto"
          value={monthFilter}
          onChange={(e) => setMonthFilter(e.target.value)}
        >
          <option value={ALL_MONTHS_KEY}>كل الأشهر</option>
          {months.map((m) => (
            <option key={m} value={m}>{m}</option>
          ))}
        </select>

        <span className="text-sm" style={{ color: 'var(--color-text-muted)' }}>
          {sorted.length} نتيجة
        </span>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-sm" style={{ direction: 'rtl' }}>
          <thead>
            <tr style={{ borderBottom: '1px solid var(--color-border-subtle)', background: 'var(--color-surface-2)' }}>
              {['العميل', 'الهاتف / واتساب', 'التاريخ', 'الساعة', 'النوع', 'اللوكيشن', 'السعر', 'الحالة', ''].map((h) => (
                <th
                  key={h}
                  className="px-4 py-3 text-right font-medium text-xs whitespace-nowrap"
                  style={{ color: 'var(--color-text-muted)' }}
                >
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {sorted.length === 0 ? (
              <tr>
                <td colSpan={9} className="text-center py-12" style={{ color: 'var(--color-text-muted)' }}>
                  لا توجد نتائج
                </td>
              </tr>
            ) : (
              sorted.map((s, i) => (
                <motion.tr
                  key={s.id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: i * 0.02 }}
                  className="transition-colors"
                  style={{ borderBottom: '1px solid var(--color-border-subtle)' }}
                  onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,0.02)'; }}
                  onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.background = 'transparent'; }}
                >
                  <td className="px-4 py-3 font-medium whitespace-nowrap" style={{ color: 'var(--color-text-primary)' }}>
                    {s.client_name}
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap">
                    {s.client_phone ? (
                      <a
                        href={getWhatsAppUrl(s.client_phone) ?? '#'}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/25 hover:bg-emerald-500/20 transition-colors ltr-content"
                        title="محادثة واتساب"
                      >
                        <Phone size={12} />
                        <span>{formatPhone(s.client_phone)}</span>
                      </a>
                    ) : (
                      <span className="text-xs" style={{ color: 'var(--color-text-muted)' }}>—</span>
                    )}
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap ltr-content" style={{ color: 'var(--color-text-secondary)' }}>
                    {formatArabicDate(s.date)}
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap ltr-content" style={{ color: 'var(--color-text-secondary)' }}>
                    {formatTime(s.time)}
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap" style={{ color: 'var(--color-text-secondary)' }}>
                    {s.session_type}
                  </td>
                  <td className="px-4 py-3" style={{ color: 'var(--color-text-secondary)', maxWidth: 160 }}>
                    <span className="line-clamp-1">{s.location || '—'}</span>
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap ltr-content" style={{ color: 'var(--color-text-secondary)' }}>
                    {formatPrice(s.price_numeric, s.price_text)}
                  </td>
                  <td className="px-4 py-3">
                    <span className={`text-xs px-2.5 py-1 rounded-full border whitespace-nowrap ${STATUS_COLORS[s.status]}`}>
                      {STATUS_LABELS[s.status]}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => onEdit(s)}
                        className="p-1.5 rounded-lg hover:bg-white/5 transition-colors cursor-pointer"
                        style={{ color: 'var(--color-text-muted)' }}
                        aria-label="تعديل"
                        id={`edit-session-${s.id}`}
                      >
                        <Pencil size={14} />
                      </button>
                      <button
                        onClick={() => onDelete(s.id)}
                        className="p-1.5 rounded-lg transition-colors cursor-pointer"
                        style={{ color: '#ef4444' }}
                        aria-label="حذف"
                        id={`delete-session-${s.id}`}
                        onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.background = 'rgba(239,68,68,0.08)'; }}
                        onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.background = 'transparent'; }}
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </td>
                </motion.tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
