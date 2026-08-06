'use client';

export const dynamic = 'force-dynamic';

import { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Upload, FileText, Check, AlertCircle, ArrowLeft, Loader2 } from 'lucide-react';
import { parseCSV } from '@/lib/utils';
import type { SessionInsert } from '@/types/session';

/** Map common column names to our schema fields */
function mapRow(row: Record<string, string>): Partial<SessionInsert> {
  const get = (...keys: string[]) => {
    for (const k of keys) {
      const val = row[k] ?? row[k.toLowerCase()] ?? '';
      if (val) return val;
    }
    return '';
  };

  const dateRaw = get('date', 'Date', 'التاريخ');
  // Try to parse dates in various formats → normalize to YYYY-MM-DD
  let date = dateRaw;
  if (dateRaw && !dateRaw.match(/^\d{4}-\d{2}-\d{2}$/)) {
    const parts = dateRaw.split(/[\/\-\.]/);
    if (parts.length === 3) {
      const [d, m, y] = parts.map((p) => p.padStart(2, '0'));
      if (parseInt(y) > 1900) {
        date = `${y}-${m}-${d}`;
      } else if (parseInt(parts[2]) > 1900) {
        date = `${parts[2]}-${parts[1].padStart(2, '0')}-${parts[0].padStart(2, '0')}`;
      }
    }
  }

  const priceRaw = get('price', 'Price', 'السعر');
  const priceNumeric = parseFloat(priceRaw.replace(/[^\d.]/g, ''));

  return {
    client_name: get('client_name', 'Client', 'Client Name', 'name', 'Name', 'الإسم', 'اسم'),
    client_phone: get('client_phone', 'phone', 'Phone', 'mobile', 'Mobile', 'whatsapp', 'رقم الهاتف', 'هاتف', 'الواتساب') || null,
    date: date || '',
    location: get('location', 'Location', 'اللوكيشن'),
    time: get('time', 'Time', 'الساعة') || null,
    session_type: get('session_type', 'Type', 'Session Type', 'نوع التصوير') || 'Photo Shoot',
    price_text: priceRaw.match(/[^\d.\s]/) ? priceRaw : null,
    price_numeric: isNaN(priceNumeric) ? null : priceNumeric,
    notes: get('notes', 'Notes', 'ملاحظات') || null,
    status: 'confirmed',
  };
}

type ImportStep = 'upload' | 'preview' | 'done';

export default function ImportScreen() {
  const [step, setStep] = useState<ImportStep>('upload');
  const [rows, setRows] = useState<Partial<SessionInsert>[]>([]);
  const [rawText, setRawText] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<{ inserted: number; errors: number } | null>(null);
  const [parseError, setParseError] = useState('');
  const fileRef = useRef<HTMLInputElement>(null);

  function handleTextParse() {
    setParseError('');
    try {
      let parsed: Record<string, string>[] = [];
      try {
        const json = JSON.parse(rawText);
        parsed = Array.isArray(json) ? json : [json];
      } catch {
        parsed = parseCSV(rawText);
      }
      if (parsed.length === 0) {
        setParseError('No valid data found. Please check your CSV or JSON formatting.');
        return;
      }
      setRows(parsed.map(mapRow));
      setStep('preview');
    } catch {
      setParseError('Error parsing data. Please verify the format.');
    }
  }

  function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      const text = ev.target?.result as string;
      setRawText(text);
    };
    reader.readAsText(file, 'utf-8');
  }

  async function handleImport() {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/import', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ rows }),
      });
      const data = await res.json();
      setResult(data);
      setStep('done');
    } catch {
      setParseError('Failed to import data. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen px-4 py-12 bg-slate-50">
      <div className="max-w-3xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <a
            href="/admin"
            className="inline-flex items-center gap-2 text-sm font-semibold mb-4 text-slate-500 hover:text-amber-700 transition-colors"
          >
            <ArrowLeft size={16} />
            Back to Admin Dashboard
          </a>
          <h1 className="text-3xl font-extrabold text-slate-900">
            Import Sessions
          </h1>
          <p className="text-sm mt-1 text-slate-500 font-medium">
            Paste CSV or JSON data to bulk import photo sessions at once
          </p>
        </div>

        {/* Step: upload */}
        <AnimatePresence mode="wait">
          {step === 'upload' && (
            <motion.div key="upload" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
              <div className="rounded-2xl p-6 mb-6 bg-white border border-slate-200 shadow-sm">
                <p className="text-sm font-semibold text-slate-700 mb-3">
                  Paste CSV or JSON data below:
                </p>
                <textarea
                  id="import-text-area"
                  rows={10}
                  className="input-field font-mono text-xs"
                  placeholder={`client_name,date,time,location,session_type,price\nJohn & Mary,2026-09-15,17:00,Studio & Outdoor,Photo Shoot,350`}
                  value={rawText}
                  onChange={(e) => setRawText(e.target.value)}
                  style={{ resize: 'vertical' }}
                />

                <div className="mt-4 flex flex-wrap items-center gap-3">
                  <button
                    id="import-file-btn"
                    type="button"
                    onClick={() => fileRef.current?.click()}
                    className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold bg-slate-100 border border-slate-300 text-slate-700 hover:bg-slate-200 transition-colors cursor-pointer"
                  >
                    <FileText size={15} /> Upload CSV / JSON File
                  </button>
                  <input
                    ref={fileRef}
                    type="file"
                    accept=".csv,.json,.txt"
                    className="hidden"
                    onChange={handleFile}
                    id="import-file-input"
                  />

                  <button
                    id="import-parse-btn"
                    type="button"
                    onClick={handleTextParse}
                    disabled={!rawText.trim()}
                    className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold bg-gradient-to-r from-amber-600 to-amber-500 text-white hover:from-amber-700 hover:to-amber-600 shadow-sm transition-all cursor-pointer disabled:opacity-50"
                  >
                    <Upload size={15} /> Preview Data
                  </button>
                </div>

                {parseError && (
                  <div className="mt-4 flex items-center gap-2 text-sm p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 font-medium">
                    <AlertCircle size={15} /> {parseError}
                  </div>
                )}
              </div>

              {/* Supported columns reference */}
              <div className="rounded-2xl p-6 text-sm bg-white border border-slate-200 shadow-xs">
                <p className="font-bold text-slate-900 mb-3">
                  Supported Column Headers:
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs font-medium">
                  {[
                    ['client_name', 'Client name / couple name'],
                    ['client_phone', 'Phone number / WhatsApp (optional)'],
                    ['date', 'YYYY-MM-DD or DD/MM/YYYY'],
                    ['time', 'HH:MM time string'],
                    ['location', 'Location / venue'],
                    ['session_type', 'Type of photography session'],
                    ['price', 'Price numeric or custom text'],
                    ['notes', 'Additional notes (optional)'],
                  ].map(([en, desc]) => (
                    <div key={en} className="flex gap-2">
                      <span className="text-amber-700 font-bold min-w-[100px]">{en}</span>
                      <span className="text-slate-500">{desc}</span>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          )}

          {step === 'preview' && (
            <motion.div key="preview" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
              <div className="rounded-2xl overflow-hidden mb-6 bg-white border border-slate-200 shadow-sm">
                <div className="flex items-center justify-between px-5 py-4 border-b border-slate-200 bg-slate-50">
                  <h2 className="font-bold text-slate-900">
                    Preview — {rows.length} {rows.length === 1 ? 'session' : 'sessions'}
                  </h2>
                  <button
                    onClick={() => setStep('upload')}
                    className="text-sm font-semibold text-amber-700 hover:underline cursor-pointer"
                    id="import-back-btn"
                  >
                    Edit Input
                  </button>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-xs text-left">
                    <thead>
                      <tr className="bg-slate-100/70 border-b border-slate-200 text-slate-600 font-semibold">
                        {['Client', 'Phone', 'Date', 'Time', 'Type', 'Location', 'Price'].map((h) => (
                          <th key={h} className="px-4 py-2.5 font-semibold">{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {rows.map((r, i) => (
                        <tr key={i} className="border-b border-slate-100 hover:bg-slate-50">
                          <td className="px-4 py-2.5 font-bold text-slate-900">{r.client_name || '—'}</td>
                          <td className="px-4 py-2.5 text-slate-600">{r.client_phone || '—'}</td>
                          <td className="px-4 py-2.5 text-slate-600">{r.date || '—'}</td>
                          <td className="px-4 py-2.5 text-slate-600">{r.time || 'TBD'}</td>
                          <td className="px-4 py-2.5 text-slate-600">{r.session_type || '—'}</td>
                          <td className="px-4 py-2.5 text-slate-600">{r.location || '—'}</td>
                          <td className="px-4 py-2.5 text-slate-800 font-semibold">
                            {r.price_text || r.price_numeric || '—'}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <button
                  id="import-confirm-btn"
                  onClick={handleImport}
                  disabled={loading}
                  className="flex items-center gap-2 px-6 py-3 rounded-xl font-bold text-sm bg-gradient-to-r from-amber-600 to-amber-500 text-white hover:from-amber-700 hover:to-amber-600 shadow-md transition-all cursor-pointer disabled:opacity-60"
                >
                  {loading ? <Loader2 size={16} className="animate-spin" /> : <Upload size={16} />}
                  {loading ? 'Importing...' : `Import ${rows.length} Sessions`}
                </button>
                <button
                  onClick={() => setStep('upload')}
                  className="px-5 py-3 rounded-xl text-sm font-semibold bg-slate-100 border border-slate-300 text-slate-700 hover:bg-slate-200 transition-colors cursor-pointer"
                  id="import-cancel-btn"
                >
                  Cancel
                </button>
              </div>
            </motion.div>
          )}

          {step === 'done' && result && (
            <motion.div key="done" initial={{ opacity: 0, scale: 0.96 }} animate={{ opacity: 1, scale: 1 }}>
              <div className="rounded-2xl p-10 text-center bg-white border border-slate-200 shadow-lg">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full mb-5 bg-emerald-50 border border-emerald-200">
                  <Check size={28} className="text-emerald-600" />
                </div>
                <h2 className="text-2xl font-extrabold text-slate-900 mb-2">
                  Import Completed Successfully
                </h2>
                <p className="text-slate-600 font-medium">
                  Successfully imported <span className="font-bold text-amber-700">{result.inserted}</span> sessions
                  {result.errors > 0 && ` (${result.errors} errors)`}.
                </p>
                <a
                  href="/admin"
                  id="import-done-back"
                  className="inline-flex items-center gap-2 mt-6 px-6 py-3 rounded-xl text-sm font-bold bg-gradient-to-r from-amber-600 to-amber-500 text-white hover:from-amber-700 hover:to-amber-600 shadow-md transition-all"
                >
                  <ArrowLeft size={16} /> Return to Admin Dashboard
                </a>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
