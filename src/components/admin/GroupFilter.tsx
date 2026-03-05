'use client';

import { GUEST_GROUPS } from '@/lib/constants';
import { cn } from '@/lib/utils';

interface GroupFilterProps {
  selectedGroup: string;
  onGroupChange: (group: string) => void;
}

export default function GroupFilter({ selectedGroup, onGroupChange }: GroupFilterProps) {
  const allGroups = ['', ...GUEST_GROUPS];

  return (
    <div className="flex flex-wrap gap-2">
      {allGroups.map((group) => (
        <button
          key={group || 'all'}
          type="button"
          onClick={() => onGroupChange(group)}
          className={cn(
            'rounded-full border px-4 py-1.5 text-sm font-medium transition-colors',
            selectedGroup === group
              ? 'bg-navy-800 text-white border-navy-800'
              : 'bg-white text-gray-700 border-gray-300 hover:border-navy-800 hover:text-navy-800',
          )}
        >
          {group || 'כל הקבוצות'}
        </button>
      ))}
    </div>
  );
}
