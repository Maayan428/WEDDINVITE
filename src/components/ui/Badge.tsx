'use client';

import { RSVPStatus } from '@/models/guest.model';
import { cn } from '@/lib/utils';

interface BadgeProps {
  status: RSVPStatus;
  className?: string;
}

const statusConfig: Record<RSVPStatus, { label: string; className: string }> = {
  confirmed: { label: 'אישר הגעה', className: 'bg-emerald-100 text-emerald-700' },
  declined:  { label: 'לא מגיע',   className: 'bg-red-100 text-red-600' },
  pending:   { label: 'ממתין',     className: 'bg-amber-100 text-amber-700' },
};

export default function Badge({ status, className }: BadgeProps) {
  const config = statusConfig[status];
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full px-3 py-1 text-xs font-medium',
        config.className,
        className,
      )}
    >
      {config.label}
    </span>
  );
}
