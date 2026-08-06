'use client';

import { motion } from 'framer-motion';
import { Lock } from 'lucide-react';

export default function Hero() {
  return (
    <header className="relative overflow-hidden">
      {/* Top Admin Link */}
      <div className="absolute top-4 start-4 z-20">
        <a
          href="/admin"
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium transition-all duration-200"
          style={{
            background: 'rgba(255, 255, 255, 0.04)',
            border: '1px solid rgba(255, 255, 255, 0.08)',
            color: 'var(--color-text-muted)',
          }}
        >
          <Lock size={13} />
          <span>لوحة الإدارة</span>
        </a>
      </div>

      {/* Background gradient layer */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            'radial-gradient(ellipse 80% 60% at 50% 0%, rgba(201,169,110,0.12) 0%, transparent 70%)',
        }}
      />

      {/* Decorative lines */}
      <div
        className="absolute inset-0 pointer-events-none opacity-20"
        style={{
          backgroundImage:
            'repeating-linear-gradient(0deg, transparent, transparent 60px, rgba(201,169,110,0.06) 60px, rgba(201,169,110,0.06) 61px)',
        }}
      />

      <div className="relative z-10 max-w-4xl mx-auto px-6 pt-20 pb-16 text-center">
        {/* Logo / monogram */}
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.6, ease: 'easeOut' }}
          className="inline-flex items-center justify-center w-20 h-20 rounded-full mb-8 glow-gold-sm"
          style={{
            background:
              'radial-gradient(circle, rgba(201,169,110,0.15) 0%, rgba(201,169,110,0.05) 100%)',
            border: '1px solid rgba(201,169,110,0.3)',
          }}
        >
          <span
            className="text-3xl font-bold"
            style={{ color: 'var(--color-brand-gold)' }}
          >
            م
          </span>
        </motion.div>

        {/* Studio name */}
        <motion.h1
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.7, delay: 0.15, ease: 'easeOut' }}
          className="text-gold-gradient text-4xl sm:text-5xl md:text-6xl font-bold tracking-tight mb-4"
          style={{ fontFamily: 'var(--font-arabic)', letterSpacing: '-0.01em' }}
        >
          Mnar Photofilm
        </motion.h1>

        {/* Arabic subtitle */}
        <motion.p
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.7, delay: 0.28, ease: 'easeOut' }}
          className="text-xl sm:text-2xl font-light mb-3"
          style={{ color: 'var(--color-text-secondary)' }}
        >
          جلسات التصوير القادمة
        </motion.p>

        <motion.p
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.7, delay: 0.38, ease: 'easeOut' }}
          className="text-base"
          style={{ color: 'var(--color-text-muted)' }}
        >
          احجزي جلستك الآن عبر التواصل المباشر
        </motion.p>

        {/* Divider */}
        <motion.div
          initial={{ scaleX: 0, opacity: 0 }}
          animate={{ scaleX: 1, opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.5, ease: 'easeOut' }}
          className="mx-auto mt-10 h-px w-48"
          style={{
            background:
              'linear-gradient(90deg, transparent, var(--color-brand-gold), transparent)',
          }}
        />
      </div>
    </header>
  );
}
