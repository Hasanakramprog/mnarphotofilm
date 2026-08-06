'use client';

import { motion } from 'framer-motion';
import { Lock } from 'lucide-react';

export default function Hero() {
  return (
    <header className="relative overflow-hidden bg-slate-50 border-b border-slate-200">
      {/* Top Admin Link */}
      <div className="absolute top-4 left-4 z-20">
        <a
          href="/admin"
          className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-medium bg-white text-slate-600 border border-slate-200 shadow-sm hover:bg-slate-100 hover:text-slate-900 transition-all duration-200"
        >
          <Lock size={13} className="text-amber-600" />
          <span>Admin Panel</span>
        </a>
      </div>

      {/* Background gradient layer */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            'radial-gradient(ellipse 80% 60% at 50% 0%, rgba(217,119,6,0.08) 0%, transparent 75%)',
        }}
      />

      <div className="relative z-10 max-w-4xl mx-auto px-6 pt-16 pb-12 text-center">
        {/* Logo / monogram */}
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.6, ease: 'easeOut' }}
          className="inline-flex items-center justify-center w-20 h-20 rounded-full mb-6 shadow-md bg-amber-50 border border-amber-200/80"
        >
          <span
            className="text-3xl font-bold tracking-tight text-amber-700"
          >
            M
          </span>
        </motion.div>

        {/* Studio name */}
        <motion.h1
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.7, delay: 0.15, ease: 'easeOut' }}
          className="text-amber-700 text-4xl sm:text-5xl md:text-6xl font-extrabold tracking-tight mb-3"
        >
          Mnar Photofilm
        </motion.h1>

        {/* English subtitle */}
        <motion.p
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.7, delay: 0.28, ease: 'easeOut' }}
          className="text-xl sm:text-2xl font-medium mb-2 text-slate-800"
        >
          Upcoming Photo Sessions
        </motion.p>

        <motion.p
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.7, delay: 0.38, ease: 'easeOut' }}
          className="text-base text-slate-500 max-w-md mx-auto"
        >
          Explore available photography dates & scheduled sessions
        </motion.p>

        {/* Divider */}
        <motion.div
          initial={{ scaleX: 0, opacity: 0 }}
          animate={{ scaleX: 1, opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.5, ease: 'easeOut' }}
          className="mx-auto mt-8 h-px w-48 bg-gradient-to-r from-transparent via-amber-400 to-transparent"
        />
      </div>
    </header>
  );
}
