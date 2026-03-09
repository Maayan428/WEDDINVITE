'use client';

import { X } from 'lucide-react';
import { Guest } from '@/models/guest.model';

interface GroupDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  groupName: string | null;
  guests: Guest[];
}

export default function GroupDetailModal({
  isOpen,
  onClose,
  groupName,
  guests,
}: GroupDetailModalProps) {
  if (!isOpen || !groupName) return null;

  const groupGuests = guests.filter((g) => g.group === groupName);
  const confirmed = groupGuests.filter((g) => g.status === 'confirmed');
  const declined = groupGuests.filter((g) => g.status === 'declined');
  const pending = groupGuests.filter((g) => g.status === 'pending');

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
      <div
        className="relative z-10 w-full max-w-lg rounded-2xl bg-white max-h-[80vh] flex flex-col"
        style={{ boxShadow: '0 8px 40px rgba(0,0,0,0.15), 0 2px 8px rgba(13,148,136,0.08)' }}
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-gray-100 px-6 py-4 flex-shrink-0">
          <h2 className="text-lg font-semibold" style={{ color: '#1e3a5f' }}>קבוצת {groupName}</h2>
          <button
            type="button"
            onClick={onClose}
            className="rounded-xl p-1.5 text-gray-400 hover:bg-gray-100 hover:text-gray-600 transition-all duration-200"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="overflow-y-auto p-6 flex flex-col gap-4">
          <GuestSection
            icon="✅"
            title="אישרו הגעה"
            count={confirmed.length}
            headerColor="text-emerald-700"
            bgColor="bg-emerald-50"
            borderColor="border-emerald-100"
          >
            {confirmed.map((g) => (
              <GuestRow key={g.id} guest={g} showActual />
            ))}
          </GuestSection>

          <GuestSection
            icon="❌"
            title="לא מגיעים"
            count={declined.length}
            headerColor="text-red-600"
            bgColor="bg-red-50"
            borderColor="border-red-100"
          >
            {declined.map((g) => (
              <GuestRow key={g.id} guest={g} />
            ))}
          </GuestSection>

          <GuestSection
            icon="⏳"
            title="ממתינים לתשובה"
            count={pending.length}
            headerColor="text-amber-700"
            bgColor="bg-amber-50"
            borderColor="border-amber-100"
          >
            {pending.map((g) => (
              <GuestRow key={g.id} guest={g} />
            ))}
          </GuestSection>
        </div>
      </div>
    </div>
  );
}

interface GuestSectionProps {
  icon: string;
  title: string;
  count: number;
  headerColor: string;
  bgColor: string;
  borderColor: string;
  children: React.ReactNode;
}

function GuestSection({ icon, title, count, headerColor, bgColor, borderColor, children }: GuestSectionProps) {
  return (
    <div className={`rounded-xl ${bgColor} border ${borderColor} overflow-hidden`}>
      <div className="flex items-center justify-between px-4 py-2.5 border-b border-black/5">
        <span className={`text-sm font-semibold ${headerColor}`}>
          {icon} {title}
        </span>
        <span className={`text-xs ${headerColor} opacity-70`}>{count} אורחים</span>
      </div>
      {count === 0 ? (
        <p className="px-4 py-3 text-xs text-gray-400">אין אורחים</p>
      ) : (
        <ul className="divide-y divide-black/5">{children}</ul>
      )}
    </div>
  );
}

interface GuestRowProps {
  guest: Guest;
  showActual?: boolean;
}

function GuestRow({ guest, showActual }: GuestRowProps) {
  return (
    <li className="flex items-center justify-between px-4 py-2 hover:bg-black/[0.02] transition-colors">
      <span className="text-sm text-gray-800">
        {guest.firstName} {guest.lastName}
      </span>
      {showActual && guest.actualGuests != null && (
        <span className="text-xs text-emerald-600 font-medium">{guest.actualGuests} מגיעים</span>
      )}
    </li>
  );
}
