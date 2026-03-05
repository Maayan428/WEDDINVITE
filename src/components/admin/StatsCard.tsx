'use client';

import { LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

interface StatsCardProps {
  title: string;
  value: number | string;
  icon: LucideIcon;
  colorVariant?: 'blue' | 'green' | 'red' | 'yellow';
}

const colorClasses: Record<string, { icon: string; bg: string }> = {
  blue:   { icon: 'text-blue-600',   bg: 'bg-blue-100' },
  green:  { icon: 'text-green-600',  bg: 'bg-green-100' },
  red:    { icon: 'text-red-600',    bg: 'bg-red-100' },
  yellow: { icon: 'text-yellow-600', bg: 'bg-yellow-100' },
};

export default function StatsCard({
  title,
  value,
  icon: Icon,
  colorVariant = 'blue',
}: StatsCardProps) {
  const colors = colorClasses[colorVariant];

  return (
    <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600">{title}</p>
          <p className="mt-1 text-3xl font-bold text-gray-900">{value}</p>
        </div>
        <div className={cn('rounded-full p-3', colors.bg)}>
          <Icon className={cn('w-6 h-6', colors.icon)} />
        </div>
      </div>
    </div>
  );
}
