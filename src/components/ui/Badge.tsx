'use client';

import { RSVPStatus } from '@/models/guest.model';
import { cn } from '@/lib/utils';

interface BadgeProps {
  status: RSVPStatus;
  className?: string;
}

const statusConfig: Record<RSVPStatus, { label: string; className: string }> = {
  confirmed: { label: 'אישר הגעה', className: 'bg-green-100 text-green-800 border-green-200' },
  declined:  { label: 'לא מגיע',   className: 'bg-red-100 text-red-800 border-red-200' },
  pending:   { label: 'ממתין',     className: 'bg-yellow-100 text-yellow-800 border-yellow-200' },
};

export default function Badge({ status, className }: BadgeProps) {
  const config = statusConfig[status];
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium',
        config.className,
        className,
      )}
    >
      {config.label}
    </span>
  );
}
