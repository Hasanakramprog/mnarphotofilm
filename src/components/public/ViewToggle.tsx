'use client';

import { motion } from 'framer-motion';
import { Calendar, List } from 'lucide-react';

export type ViewMode = 'calendar' | 'list';

interface ViewToggleProps {
  view: ViewMode;
  onChange: (view: ViewMode) => void;
}

export default function ViewToggle({ view, onChange }: ViewToggleProps) {
  const options: { value: ViewMode; label: string; Icon: typeof Calendar }[] = [
    { value: 'calendar', label: 'Calendar', Icon: Calendar },
    { value: 'list', label: 'List', Icon: List },
  ];

  return (
    <div
      className="inline-flex rounded-xl p-1 gap-1 bg-slate-200/70 border border-slate-300/60"
      role="tablist"
      aria-label="View Mode"
    >
      {options.map(({ value, label, Icon }) => {
        const isActive = view === value;
        return (
          <button
            key={value}
            role="tab"
            aria-selected={isActive}
            onClick={() => onChange(value)}
            className={`relative flex items-center gap-2 rounded-lg px-5 py-2 text-sm font-semibold transition-colors duration-200 cursor-pointer ${
              isActive ? 'text-amber-800' : 'text-slate-600 hover:text-slate-900'
            }`}
            id={`view-tab-${value}`}
          >
            {isActive && (
              <motion.span
                layoutId="view-tab-bg"
                className="absolute inset-0 rounded-lg bg-white shadow-sm border border-amber-300/80"
                transition={{ type: 'spring', bounce: 0.2, duration: 0.4 }}
              />
            )}
            <Icon size={16} className="relative z-10 flex-shrink-0" />
            <span className="relative z-10">{label}</span>
          </button>
        );
      })}
    </div>
  );
}
