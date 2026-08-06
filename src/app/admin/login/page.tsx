'use client';

export const dynamic = 'force-dynamic';


import { useState, FormEvent } from 'react';
import { createClient } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';
import { Eye, EyeOff, LogIn } from 'lucide-react';
import { motion } from 'framer-motion';

export default function AdminLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPw, setShowPw] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleLogin(e: FormEvent) {
    e.preventDefault();
    setError('');
    setLoading(true);
    const supabase = createClient();
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) {
      setError('البريد الإلكتروني أو كلمة المرور غير صحيحة');
      setLoading(false);
    } else {
      router.push('/admin');
      router.refresh();
    }
  }

  return (
    <div
      className="min-h-screen flex items-center justify-center px-4"
      style={{ background: 'var(--color-surface-0)' }}
    >
      {/* Background glow */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: 'radial-gradient(ellipse 60% 40% at 50% 30%, rgba(201,169,110,0.06) 0%, transparent 70%)',
        }}
      />

      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: 'easeOut' }}
        className="relative w-full max-w-sm"
      >
        {/* Card */}
        <div
          className="rounded-2xl p-8 shadow-premium-lg"
          style={{
            background: 'var(--color-surface-1)',
            border: '1px solid var(--color-border)',
          }}
        >
          {/* Logo */}
          <div className="text-center mb-8">
            <div
              className="inline-flex items-center justify-center w-14 h-14 rounded-full mb-4"
              style={{
                background: 'rgba(201,169,110,0.1)',
                border: '1px solid rgba(201,169,110,0.25)',
              }}
            >
              <span className="text-2xl font-bold" style={{ color: 'var(--color-brand-gold)' }}>م</span>
            </div>
            <h1 className="text-xl font-bold" style={{ color: 'var(--color-text-primary)' }}>
              لوحة الإدارة
            </h1>
            <p className="text-sm mt-1" style={{ color: 'var(--color-text-muted)' }}>
              Mnar Photofilm
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleLogin} className="space-y-4" id="admin-login-form">
            <div>
              <label
                htmlFor="email"
                className="block text-sm font-medium mb-1.5"
                style={{ color: 'var(--color-text-secondary)' }}
              >
                البريد الإلكتروني
              </label>
              <input
                id="email"
                type="email"
                autoComplete="email"
                required
                className="input-field"
                placeholder="admin@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                dir="ltr"
              />
            </div>

            <div>
              <label
                htmlFor="password"
                className="block text-sm font-medium mb-1.5"
                style={{ color: 'var(--color-text-secondary)' }}
              >
                كلمة المرور
              </label>
              <div className="relative">
                <input
                  id="password"
                  type={showPw ? 'text' : 'password'}
                  autoComplete="current-password"
                  required
                  className="input-field pe-12"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  dir="ltr"
                />
                <button
                  type="button"
                  onClick={() => setShowPw(!showPw)}
                  className="absolute inset-y-0 end-3 flex items-center px-1 cursor-pointer"
                  style={{ color: 'var(--color-text-muted)' }}
                  aria-label={showPw ? 'إخفاء كلمة المرور' : 'إظهار كلمة المرور'}
                >
                  {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            {error && (
              <motion.p
                initial={{ opacity: 0, y: -4 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-sm text-center py-2.5 px-4 rounded-lg"
                style={{
                  background: 'rgba(239,68,68,0.08)',
                  border: '1px solid rgba(239,68,68,0.2)',
                  color: '#f87171',
                }}
              >
                {error}
              </motion.p>
            )}

            <button
              id="login-submit-btn"
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 rounded-xl py-3 font-semibold text-sm transition-all duration-200 cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed mt-2"
              style={{
                background: loading
                  ? 'var(--color-surface-3)'
                  : 'linear-gradient(135deg, var(--color-brand-gold-dark), var(--color-brand-gold))',
                color: loading ? 'var(--color-text-muted)' : '#0a0a0f',
              }}
            >
              <LogIn size={16} />
              {loading ? 'جارٍ الدخول...' : 'تسجيل الدخول'}
            </button>
          </form>
        </div>

        {/* Back link */}
        <div className="text-center mt-5">
          <a
            href="/"
            className="text-sm transition-colors"
            style={{ color: 'var(--color-text-muted)' }}
          >
            ← العودة إلى الصفحة الرئيسية
          </a>
        </div>
      </motion.div>
    </div>
  );
}
