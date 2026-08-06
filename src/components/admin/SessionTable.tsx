'use client';

import { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { Search, Pencil, Trash2, Phone } from 'lucide-react';
import type { Session } from '@/types/session';
import { STATUS_COLORS, STATUS_LABELS } from '@/types/session';
import { formatDate, formatTime, formatPrice, getWhatsAppUrl, formatPhone } from '@/lib/utils';

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
    <div className="rounded-2xl overflow-hidden bg-white border border-slate-200 shadow-sm">
      {/* Filters bar */}
      <div className="flex flex-wrap items-center gap-3 px-5 py-4 border-b border-slate-200 bg-slate-50/50">
        {/* Search */}
        <div className="relative flex-1 min-w-[200px]">
          <Search size={15} className="absolute top-1/2 -translate-y-1/2 left-3 pointer-events-none text-slate-400" />
          <input
            id="session-table-search"
            type="search"
            placeholder="Search client, phone, location..."
            className="input-field pl-9"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        {/* Status filter */}
        <select
          id="session-table-status-filter"
          className="input-field select-field w-auto font-medium"
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
        >
          <option value="all">All Statuses</option>
          <option value="confirmed">Confirmed</option>
          <option value="pending">Pending</option>
          <option value="completed">Completed</option>
          <option value="cancelled">Cancelled</option>
        </select>

        {/* Month filter */}
        <select
          id="session-table-month-filter"
          className="input-field select-field w-auto font-medium"
          value={monthFilter}
          onChange={(e) => setMonthFilter(e.target.value)}
        >
          <option value={ALL_MONTHS_KEY}>All Months</option>
          {months.map((m) => (
            <option key={m} value={m}>{m}</option>
          ))}
        </select>

        <span className="text-xs font-semibold text-slate-500 bg-slate-200/60 px-2.5 py-1 rounded-full">
          {sorted.length} {sorted.length === 1 ? 'result' : 'results'}
        </span>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-sm text-left">
          <thead>
            <tr className="border-b border-slate-200 bg-slate-100/70 text-slate-600">
              {['Client', 'Phone / WhatsApp', 'Date', 'Time', 'Type', 'Location', 'Price', 'Status', 'Actions'].map((h) => (
                <th
                  key={h}
                  className="px-4 py-3 font-semibold text-xs whitespace-nowrap"
                >
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {sorted.length === 0 ? (
              <tr>
                <td colSpan={9} className="text-center py-12 text-slate-500 font-medium">
                  No sessions found matching your filter
                </td>
              </tr>
            ) : (
              sorted.map((s, i) => (
                <motion.tr
                  key={s.id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: i * 0.02 }}
                  className="border-b border-slate-100 hover:bg-slate-50 transition-colors"
                >
                  <td className="px-4 py-3.5 font-bold text-slate-900 whitespace-nowrap">
                    {s.client_name}
                  </td>
                  <td className="px-4 py-3.5 whitespace-nowrap">
                    {s.client_phone ? (
                      <a
                        href={getWhatsAppUrl(s.client_phone) ?? '#'}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-100 transition-colors"
                        title="Chat on WhatsApp"
                      >
                        <Phone size={12} />
                        <span>{formatPhone(s.client_phone)}</span>
                      </a>
                    ) : (
                      <span className="text-xs text-slate-400">—</span>
                    )}
                  </td>
                  <td className="px-4 py-3.5 whitespace-nowrap text-slate-700 font-medium">
                    {formatDate(s.date)}
                  </td>
                  <td className="px-4 py-3.5 whitespace-nowrap text-slate-700 font-medium">
                    {formatTime(s.time)}
                  </td>
                  <td className="px-4 py-3.5 whitespace-nowrap text-slate-700 font-medium">
                    {s.session_type}
                  </td>
                  <td className="px-4 py-3.5 text-slate-600 max-w-[180px]">
                    <span className="line-clamp-1">{s.location || '—'}</span>
                  </td>
                  <td className="px-4 py-3.5 whitespace-nowrap font-semibold text-slate-800">
                    {formatPrice(s.price_numeric, s.price_text)}
                  </td>
                  <td className="px-4 py-3.5">
                    <span className={`text-xs font-semibold px-2.5 py-1 rounded-full border whitespace-nowrap ${STATUS_COLORS[s.status]}`}>
                      {STATUS_LABELS[s.status]}
                    </span>
                  </td>
                  <td className="px-4 py-3.5">
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => onEdit(s)}
                        className="p-1.5 rounded-lg hover:bg-slate-200/80 text-slate-600 transition-colors cursor-pointer"
                        aria-label="Edit"
                        id={`edit-session-${s.id}`}
                      >
                        <Pencil size={14} />
                      </button>
                      <button
                        onClick={() => onDelete(s.id)}
                        className="p-1.5 rounded-lg hover:bg-rose-100 text-rose-600 transition-colors cursor-pointer"
                        aria-label="Delete"
                        id={`delete-session-${s.id}`}
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
