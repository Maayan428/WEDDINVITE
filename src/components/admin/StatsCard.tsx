'use client';

import { LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

interface StatsCardProps {
  title: string;
  value: number | string;
  icon: LucideIcon;
  colorVariant?: 'blue' | 'green' | 'red' | 'yellow';
}

const colorClasses: Record<string, { icon: string; bg: string; border: string }> = {
  blue:   { icon: 'text-teal-600',   bg: 'bg-teal-50',   border: 'border-teal-500'   },
  green:  { icon: 'text-emerald-600', bg: 'bg-emerald-50', border: 'border-emerald-500' },
  red:    { icon: 'text-red-500',    bg: 'bg-red-50',    border: 'border-red-400'    },
  yellow: { icon: 'text-amber-600',  bg: 'bg-amber-50',  border: 'border-amber-400'  },
};

export default function StatsCard({
  title,
  value,
  icon: Icon,
  colorVariant = 'blue',
}: StatsCardProps) {
  const colors = colorClasses[colorVariant];

  return (
    <div
      className={cn(
        'rounded-2xl border-e-4 bg-gradient-to-br from-white to-gray-50/50 p-6',
        'transition-all duration-300 hover:-translate-y-1',
        'hover:shadow-[0_8px_30px_rgba(13,148,136,0.15)]',
        colors.border,
      )}
      style={{ boxShadow: '0 2px 8px rgba(0,0,0,0.06), 0 8px 24px rgba(13,148,136,0.08)' }}
    >
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-500">{title}</p>
          <p className="mt-1 text-3xl font-bold" style={{ color: '#1e3a5f' }}>{value}</p>
        </div>
        <div className={cn('rounded-full p-3', colors.bg)}>
          <Icon className={cn('w-6 h-6', colors.icon)} />
        </div>
      </div>
    </div>
  );
}
