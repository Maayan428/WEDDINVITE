'use client';

import { useState } from 'react';
import { UserPlus, Search } from 'lucide-react';
import { useGuestsViewModel } from '@/viewmodels/useGuestsViewModel';
import { Guest, GuestFormData, RSVPStatus } from '@/models/guest.model';
import GuestTable from '@/components/admin/GuestTable';
import GuestFormModal from '@/components/admin/GuestFormModal';
import ImportExcelButton from '@/components/admin/ImportExcelButton';
import ExportExcelButton from '@/components/admin/ExportExcelButton';
import Button from '@/components/ui/Button';
import { cn } from '@/lib/utils';
import { DEFAULT_GROUP } from '@/lib/constants';

const STATUS_FILTERS: { label: string; value: RSVPStatus | '' }[] = [
  { label: 'הכל',        value: ''          },
  { label: 'אישרו',      value: 'confirmed' },
  { label: 'לא מגיעים', value: 'declined'  },
  { label: 'ממתינים',   value: 'pending'   },
];

export default function GuestsPage() {
  const {
    guests,
    filteredGuests,
    loading,
    error,
    searchTerm,
    setSearchTerm,
    selectedGroup,
    setSelectedGroup,
    selectedStatus,
    setSelectedStatus,
    copiedGuestId,
    addGuest,
    updateGuest,
    deleteGuest,
    copyInviteLink,
    refresh,
  } = useGuestsViewModel();

  const [modalOpen, setModalOpen] = useState(false);
  const [editingGuest, setEditingGuest] = useState<Guest | undefined>();

  function handleEdit(guest: Guest) {
    setEditingGuest(guest);
    setModalOpen(true);
  }

  function handleAdd() {
    setEditingGuest(undefined);
    setModalOpen(true);
  }

  async function handleSubmit(data: GuestFormData) {
    if (editingGuest) {
      await updateGuest(editingGuest.id, data);
    } else {
      await addGuest(data);
    }
  }

  // Derive group list from actual guests; always include DEFAULT_GROUP as last option
  const groups = [
    ...Array.from(new Set(guests.map((g) => g.group).filter((g) => g !== DEFAULT_GROUP))).sort(),
    DEFAULT_GROUP,
  ];

  return (
    <div className="flex flex-col gap-6">
      {/* ── Top bar ── */}
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="font-serif text-3xl font-bold" style={{ color: '#1e3a5f' }}>ניהול אורחים</h1>
          <div className="mt-1 flex items-center gap-2">
            <div className="h-0.5 w-8 rounded-full bg-teal-500" />
            <p className="text-sm text-gray-500">{guests.length} אורחים סה&quot;כ</p>
          </div>
        </div>
        <div className="flex items-center gap-2 flex-wrap justify-end">
          <ExportExcelButton guests={guests} />
          <ImportExcelButton addGuest={addGuest} onSuccess={refresh} />
          <Button onClick={handleAdd}>
            <UserPlus className="w-4 h-4" />
            הוסף אורח +
          </Button>
        </div>
      </div>

      {/* Error banner */}
      {error && (
        <div className="rounded-xl bg-red-50 border border-red-100 px-4 py-3 text-sm text-red-600">{error}</div>
      )}

      {/* ── Search & Filters ── */}
      <div className="flex flex-col gap-3">
        {/* Search input */}
        <div className="relative max-w-xs">
          <Search className="pointer-events-none absolute top-1/2 -translate-y-1/2 end-3 w-4 h-4 text-gray-400" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="חיפוש לפי שם..."
            className="w-full rounded-xl border border-gray-200 py-2 pe-9 ps-3 text-sm outline-none focus:border-teal-400 focus:ring-2 focus:ring-teal-100 bg-white transition-all duration-200"
          />
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {/* Group dropdown */}
          <select
            value={selectedGroup}
            onChange={(e) => setSelectedGroup(e.target.value)}
            className="rounded-xl border border-gray-200 bg-white px-3 py-1.5 text-sm outline-none focus:border-teal-400 focus:ring-2 focus:ring-teal-100 transition-all duration-200"
          >
            <option value="">כל הקבוצות</option>
            {groups.map((g) => (
              <option key={g} value={g}>{g}</option>
            ))}
          </select>

          {/* Status pills */}
          <div className="flex flex-wrap gap-1.5">
            {STATUS_FILTERS.map(({ label, value }) => (
              <button
                key={value}
                type="button"
                onClick={() => setSelectedStatus(value)}
                className={cn(
                  'rounded-full border px-3 py-1 text-xs font-medium transition-all duration-200',
                  selectedStatus === value
                    ? 'bg-teal-600 text-white border-teal-600 shadow-sm'
                    : 'bg-white text-gray-600 border-gray-200 hover:border-teal-400 hover:text-teal-600',
                )}
              >
                {label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* ── Table / Cards ── */}
      {loading ? (
        <div className="flex items-center justify-center py-20">
          <div className="w-6 h-6 rounded-full border-2 border-teal-500 border-t-transparent animate-spin" />
        </div>
      ) : (
        <GuestTable
          guests={filteredGuests}
          copiedGuestId={copiedGuestId}
          onEdit={handleEdit}
          onDelete={deleteGuest}
          onCopyLink={copyInviteLink}
        />
      )}

      {/* ── Add / Edit modal ── */}
      <GuestFormModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        guest={editingGuest}
        onSubmit={handleSubmit}
      />
    </div>
  );
}
