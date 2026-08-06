'use client';

export const dynamic = 'force-dynamic';


import { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Upload, FileText, Check, AlertCircle, ArrowRight, Loader2 } from 'lucide-react';
import { parseCSV } from '@/lib/utils';
import type { SessionInsert } from '@/types/session';

/** Map common Arabic column names to our schema fields */
function mapRow(row: Record<string, string>): Partial<SessionInsert> {
  const get = (...keys: string[]) => {
    for (const k of keys) {
      const val = row[k] ?? row[k.toLowerCase()] ?? '';
      if (val) return val;
    }
    return '';
  };

  const dateRaw = get('التاريخ', 'date', 'Date');
  // Try to parse dates in various formats → normalize to YYYY-MM-DD
  let date = dateRaw;
  if (dateRaw && !dateRaw.match(/^\d{4}-\d{2}-\d{2}$/)) {
    // Try DD/MM/YYYY or MM/DD/YYYY
    const parts = dateRaw.split(/[\/\-\.]/);
    if (parts.length === 3) {
      // Assume DD/MM/YYYY if first part ≤ 31
      const [d, m, y] = parts.map((p) => p.padStart(2, '0'));
      if (parseInt(y) > 1900) {
        date = `${y}-${m}-${d}`;
      } else if (parseInt(parts[2]) > 1900) {
        date = `${parts[2]}-${parts[1].padStart(2, '0')}-${parts[0].padStart(2, '0')}`;
      }
    }
  }

  const priceRaw = get('السعر', 'price', 'Price');
  const priceNumeric = parseFloat(priceRaw.replace(/[^\d.]/g, ''));

  return {
    client_name: get('الإسم', 'اسم', 'client_name', 'Client'),
    client_phone: get('رقم الهاتف', 'هاتف', 'الواتساب', 'واتساب', 'client_phone', 'phone', 'mobile') || null,
    date: date || '',
    location: get('اللوكيشن', 'location', 'Location'),
    time: get('الساعة', 'time', 'Time') || null,
    session_type: get('نوع التصوير', 'session_type', 'Type') || 'جلسة تصوير',
    price_text: priceRaw.match(/[^\d.\s]/) ? priceRaw : null,
    price_numeric: isNaN(priceNumeric) ? null : priceNumeric,
    notes: get('notes', 'ملاحظات') || null,
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
      // Try JSON first
      try {
        const json = JSON.parse(rawText);
        parsed = Array.isArray(json) ? json : [json];
      } catch {
        // Fall back to CSV
        parsed = parseCSV(rawText);
      }
      if (parsed.length === 0) {
        setParseError('لم يتم العثور على بيانات صالحة. تأكد من صحة CSV أو JSON.');
        return;
      }
      setRows(parsed.map(mapRow));
      setStep('preview');
    } catch (e) {
      setParseError('خطأ في تحليل البيانات. تأكد من صحة التنسيق.');
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
      setParseError('خطأ في الاستيراد. حاول مرة أخرى.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen px-4 py-12" style={{ background: 'var(--color-surface-0)' }}>
      <div className="max-w-3xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <a
            href="/admin"
            className="inline-flex items-center gap-2 text-sm mb-4 transition-colors"
            style={{ color: 'var(--color-text-muted)' }}
          >
            <ArrowRight size={14} />
            العودة للوحة الإدارة
          </a>
          <h1 className="text-2xl font-bold" style={{ color: 'var(--color-text-primary)' }}>
            استيراد الجلسات
          </h1>
          <p className="text-sm mt-1" style={{ color: 'var(--color-text-muted)' }}>
            الصق بيانات CSV أو JSON لاستيراد جلسات متعددة دفعةً واحدة
          </p>
        </div>

        {/* Step: upload */}
        <AnimatePresence mode="wait">
          {step === 'upload' && (
            <motion.div key="upload" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
              <div
                className="rounded-2xl p-6 mb-4"
                style={{ background: 'var(--color-surface-1)', border: '1px solid var(--color-border-subtle)' }}
              >
                <p className="text-sm font-medium mb-3" style={{ color: 'var(--color-text-secondary)' }}>
                  الصق بيانات CSV أو JSON هنا:
                </p>
                <textarea
                  id="import-text-area"
                  rows={10}
                  className="input-field font-mono text-xs"
                  placeholder={`الإسم,التاريخ,الساعة,اللوكيشن,نوع التصوير,السعر\nأحمد وسمر,2026-09-15,17:00,البيت,جلسة تصوير,350`}
                  value={rawText}
                  onChange={(e) => setRawText(e.target.value)}
                  dir="ltr"
                  style={{ fontFamily: 'var(--font-numeric)', resize: 'vertical' }}
                />

                <div className="mt-4 flex flex-wrap items-center gap-3">
                  <button
                    id="import-file-btn"
                    type="button"
                    onClick={() => fileRef.current?.click()}
                    className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium cursor-pointer transition-colors"
                    style={{
                      background: 'var(--color-surface-2)',
                      border: '1px solid var(--color-border-subtle)',
                      color: 'var(--color-text-secondary)',
                    }}
                  >
                    <FileText size={14} /> رفع ملف CSV/JSON
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
                    className="flex items-center gap-2 px-5 py-2 rounded-xl text-sm font-semibold cursor-pointer transition-all disabled:opacity-50"
                    style={{
                      background: 'linear-gradient(135deg, var(--color-brand-gold-dark), var(--color-brand-gold))',
                      color: '#0a0a0f',
                    }}
                  >
                    <Upload size={14} /> معاينة البيانات
                  </button>
                </div>

                {parseError && (
                  <div
                    className="mt-4 flex items-center gap-2 text-sm p-3 rounded-lg"
                    style={{ background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)', color: '#f87171' }}
                  >
                    <AlertCircle size={14} /> {parseError}
                  </div>
                )}
              </div>

              {/* Supported columns reference */}
              <div
                className="rounded-2xl p-5 text-sm"
                style={{ background: 'var(--color-surface-1)', border: '1px solid var(--color-border-subtle)' }}
              >
                <p className="font-medium mb-3" style={{ color: 'var(--color-text-secondary)' }}>
                  الأعمدة المدعومة:
                </p>
                <div className="grid grid-cols-2 gap-2">
                  {[
                    ['الإسم', 'client_name'],
                    ['رقم الهاتف', 'client_phone / phone / واتساب (اختياري)'],
                    ['التاريخ', 'date (YYYY-MM-DD أو DD/MM/YYYY)'],
                    ['الساعة', 'time'],
                    ['اللوكيشن', 'location'],
                    ['نوع التصوير', 'session_type'],
                    ['السعر', 'price'],
                    ['ملاحظات', 'notes (اختياري)'],
                  ].map(([ar, en]) => (
                    <div key={ar} className="flex gap-2">
                      <span style={{ color: 'var(--color-brand-gold)', minWidth: 90 }}>{ar}</span>
                      <span style={{ color: 'var(--color-text-muted)' }}>{en}</span>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          )}

          {step === 'preview' && (
            <motion.div key="preview" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
              <div
                className="rounded-2xl overflow-hidden mb-4"
                style={{ background: 'var(--color-surface-1)', border: '1px solid var(--color-border-subtle)' }}
              >
                <div
                  className="flex items-center justify-between px-5 py-4"
                  style={{ borderBottom: '1px solid var(--color-border-subtle)' }}
                >
                  <h2 className="font-semibold" style={{ color: 'var(--color-text-primary)' }}>
                    معاينة — {rows.length} جلسة
                  </h2>
                  <button
                    onClick={() => setStep('upload')}
                    className="text-sm cursor-pointer"
                    style={{ color: 'var(--color-text-muted)' }}
                    id="import-back-btn"
                  >
                    تعديل
                  </button>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-xs" dir="rtl">
                    <thead>
                      <tr style={{ background: 'var(--color-surface-2)', borderBottom: '1px solid var(--color-border-subtle)' }}>
                        {['العميل', 'الهاتف', 'التاريخ', 'الوقت', 'النوع', 'اللوكيشن', 'السعر'].map((h) => (
                          <th key={h} className="px-4 py-2 text-right font-medium" style={{ color: 'var(--color-text-muted)' }}>{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {rows.map((r, i) => (
                        <tr key={i} style={{ borderBottom: '1px solid var(--color-border-subtle)' }}>
                          <td className="px-4 py-2" style={{ color: 'var(--color-text-primary)' }}>{r.client_name || '—'}</td>
                          <td className="px-4 py-2 ltr-content" style={{ color: 'var(--color-text-secondary)' }}>{r.client_phone || '—'}</td>
                          <td className="px-4 py-2 ltr-content" style={{ color: 'var(--color-text-secondary)' }}>{r.date || '—'}</td>
                          <td className="px-4 py-2 ltr-content" style={{ color: 'var(--color-text-secondary)' }}>{r.time || 'TBD'}</td>
                          <td className="px-4 py-2" style={{ color: 'var(--color-text-secondary)' }}>{r.session_type || '—'}</td>
                          <td className="px-4 py-2" style={{ color: 'var(--color-text-secondary)' }}>{r.location || '—'}</td>
                          <td className="px-4 py-2 ltr-content" style={{ color: 'var(--color-text-secondary)' }}>
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
                  className="flex items-center gap-2 px-6 py-3 rounded-xl font-semibold text-sm cursor-pointer transition-all disabled:opacity-60"
                  style={{
                    background: 'linear-gradient(135deg, var(--color-brand-gold-dark), var(--color-brand-gold))',
                    color: '#0a0a0f',
                  }}
                >
                  {loading ? <Loader2 size={15} className="animate-spin" /> : <Upload size={15} />}
                  {loading ? 'جارٍ الاستيراد...' : `استيراد ${rows.length} جلسة`}
                </button>
                <button
                  onClick={() => setStep('upload')}
                  className="px-5 py-3 rounded-xl text-sm cursor-pointer"
                  style={{ background: 'var(--color-surface-2)', border: '1px solid var(--color-border-subtle)', color: 'var(--color-text-secondary)' }}
                  id="import-cancel-btn"
                >
                  إلغاء
                </button>
              </div>
            </motion.div>
          )}

          {step === 'done' && result && (
            <motion.div key="done" initial={{ opacity: 0, scale: 0.96 }} animate={{ opacity: 1, scale: 1 }}>
              <div
                className="rounded-2xl p-10 text-center"
                style={{ background: 'var(--color-surface-1)', border: '1px solid var(--color-border-subtle)' }}
              >
                <div
                  className="inline-flex items-center justify-center w-16 h-16 rounded-full mb-5"
                  style={{ background: 'rgba(16,185,129,0.1)', border: '1px solid rgba(16,185,129,0.25)' }}
                >
                  <Check size={28} className="text-emerald-400" />
                </div>
                <h2 className="text-xl font-bold mb-2" style={{ color: 'var(--color-text-primary)' }}>
                  تم الاستيراد بنجاح
                </h2>
                <p style={{ color: 'var(--color-text-secondary)' }}>
                  تم استيراد <span style={{ color: 'var(--color-brand-gold)' }}>{result.inserted}</span> جلسة
                  {result.errors > 0 && ` (${result.errors} خطأ)`}
                </p>
                <a
                  href="/admin"
                  id="import-done-back"
                  className="inline-flex items-center gap-2 mt-6 px-5 py-2.5 rounded-xl text-sm font-semibold"
                  style={{
                    background: 'linear-gradient(135deg, var(--color-brand-gold-dark), var(--color-brand-gold))',
                    color: '#0a0a0f',
                  }}
                >
                  <ArrowRight size={14} /> العودة للوحة الإدارة
                </a>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
