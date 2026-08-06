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
    { value: 'calendar', label: 'التقويم', Icon: Calendar },
    { value: 'list', label: 'القائمة', Icon: List },
  ];

  return (
    <div
      className="inline-flex rounded-xl p-1 gap-1"
      style={{
        background: 'var(--color-surface-2)',
        border: '1px solid var(--color-border-subtle)',
      }}
      role="tablist"
      aria-label="طريقة العرض"
    >
      {options.map(({ value, label, Icon }) => {
        const isActive = view === value;
        return (
          <button
            key={value}
            role="tab"
            aria-selected={isActive}
            onClick={() => onChange(value)}
            className="relative flex items-center gap-2 rounded-lg px-5 py-2.5 text-sm font-medium transition-colors duration-200 cursor-pointer"
            style={{
              color: isActive ? 'var(--color-brand-gold)' : 'var(--color-text-muted)',
            }}
            id={`view-tab-${value}`}
          >
            {isActive && (
              <motion.span
                layoutId="view-tab-bg"
                className="absolute inset-0 rounded-lg"
                style={{
                  background: 'rgba(201,169,110,0.08)',
                  border: '1px solid rgba(201,169,110,0.2)',
                }}
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
