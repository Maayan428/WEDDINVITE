'use client';

import { useState } from 'react';
import { Link2, Check, Pencil, Trash2 } from 'lucide-react';
import { Guest } from '@/models/guest.model';
import Badge from '@/components/ui/Badge';
import { formatPhone } from '@/lib/utils';
import { DEFAULT_GROUP } from '@/lib/constants';
import { useGroups } from '@/lib/GroupsContext';

interface GuestTableProps {
  guests: Guest[];
  copiedGuestId: string | null;
  onEdit: (guest: Guest) => void;
  onDelete: (id: string) => void;
  onCopyLink: (guestId: string) => void;
}

export default function GuestTable({ guests, copiedGuestId, onEdit, onDelete, onCopyLink }: GuestTableProps) {
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
  const { getColor } = useGroups();

  if (guests.length === 0) {
    return (
      <div className="rounded-xl border border-dashed border-gray-300 bg-white py-20 text-center">
        <p className="text-gray-500">אין אורחים עדיין. הוסיפי את האורח הראשון!</p>
      </div>
    );
  }

  function handleDeleteClick(id: string) {
    setConfirmDeleteId(id);
  }

  function handleConfirmDelete(id: string) {
    setConfirmDeleteId(null);
    onDelete(id);
  }

  return (
    <>
      {/* ── Desktop table (hidden on mobile) ── */}
      <div className="hidden sm:block overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
        <table className="w-full text-sm">
          <thead className="border-b border-gray-200 bg-teal-50/60">
            <tr>
              <th className="px-4 py-3 text-start font-semibold text-[#1e3a5f]">שם</th>
              <th className="w-[140px] min-w-[140px] px-4 py-3 text-center font-semibold text-[#1e3a5f]">קבוצה</th>
              <th className="px-4 py-3 text-start font-semibold text-[#1e3a5f]">טלפון</th>
              <th className="px-4 py-3 text-start font-semibold text-[#1e3a5f]">מגיעים / מתוכנן</th>
              <th className="px-4 py-3 text-start font-semibold text-[#1e3a5f]">סטטוס</th>
              <th className="px-4 py-3 text-start font-semibold text-[#1e3a5f]">קישור</th>
              <th className="px-4 py-3 text-start font-semibold text-[#1e3a5f]">פעולות</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {guests.map((guest) => {
              const isCopied = copiedGuestId === guest.id;
              const isConfirming = confirmDeleteId === guest.id;

              return (
                <tr key={guest.id} className="hover:bg-teal-50/20 transition-colors duration-150">
                  <td className="px-4 py-3 font-medium text-gray-900">
                    {guest.firstName} {guest.lastName}
                  </td>
                  {guest.group === DEFAULT_GROUP ? (
                    <td className="w-[140px] min-w-[140px] px-3 py-3 text-center">
                      <span className="bg-gray-100 text-gray-400 italic text-xs px-2 py-1 rounded-full">
                        {guest.group}
                      </span>
                    </td>
                  ) : (
                    <td
                      className="w-[140px] min-w-[140px] px-3 py-3 text-center text-sm font-medium"
                      style={{
                        backgroundColor: `${getColor(guest.group)}1a`,
                        color: getColor(guest.group),
                      }}
                    >
                      {guest.group}
                    </td>
                  )}
                  <td className="px-4 py-3 text-gray-600">{formatPhone(guest.phone)}</td>
                  <td className="px-4 py-3">
                    {guest.status === 'confirmed' ? (
                      <div>
                        <span className="font-medium text-gray-800">
                          {guest.actualGuests ?? guest.plannedGuests}
                        </span>
                        {guest.actualGuests !== undefined &&
                          guest.actualGuests !== guest.plannedGuests && (
                            <div className="text-xs text-gray-400">
                              (תוכנן: {guest.plannedGuests})
                            </div>
                          )}
                      </div>
                    ) : (
                      <span className="text-gray-600">{guest.plannedGuests}</span>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <Badge status={guest.status} />
                  </td>
                  {/* Link column */}
                  <td className="px-4 py-3">
                    <button
                      type="button"
                      onClick={() => onCopyLink(guest.id)}
                      className={`inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1 text-xs font-medium transition-all ${
                        isCopied
                          ? 'bg-green-100 text-green-700'
                          : 'bg-gray-100 text-gray-600 hover:bg-navy-100 hover:text-navy-800'
                      }`}
                    >
                      {isCopied ? (
                        <>
                          <Check className="w-3.5 h-3.5" />
                          הועתק!
                        </>
                      ) : (
                        <>
                          <Link2 className="w-3.5 h-3.5" />
                          העתק קישור
                        </>
                      )}
                    </button>
                  </td>
                  {/* Actions column */}
                  <td className="px-4 py-3">
                    {isConfirming ? (
                      <div className="flex items-center gap-2 text-xs">
                        <span className="text-gray-600 whitespace-nowrap">
                          למחוק את {guest.firstName}?
                        </span>
                        <button
                          type="button"
                          onClick={() => handleConfirmDelete(guest.id)}
                          className="rounded px-2 py-1 bg-red-600 text-white hover:bg-red-700 transition-colors"
                        >
                          מחק
                        </button>
                        <button
                          type="button"
                          onClick={() => setConfirmDeleteId(null)}
                          className="rounded px-2 py-1 bg-gray-200 text-gray-700 hover:bg-gray-300 transition-colors"
                        >
                          ביטול
                        </button>
                      </div>
                    ) : (
                      <div className="flex items-center gap-1">
                        <button
                          type="button"
                          title="ערוך"
                          onClick={() => onEdit(guest)}
                          className="rounded p-1.5 text-gray-500 hover:bg-gray-100 transition-colors"
                        >
                          <Pencil className="w-4 h-4" />
                        </button>
                        <button
                          type="button"
                          title="מחק"
                          onClick={() => handleDeleteClick(guest.id)}
                          className="rounded p-1.5 text-red-500 hover:bg-red-50 transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* ── Mobile cards (shown only on small screens) ── */}
      <div className="flex flex-col gap-3 sm:hidden">
        {guests.map((guest) => {
          const isCopied = copiedGuestId === guest.id;
          const isConfirming = confirmDeleteId === guest.id;

          return (
            <div key={guest.id} className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
              <div className="flex items-start justify-between">
                <div>
                  <p className="font-semibold text-gray-900">
                    {guest.firstName} {guest.lastName}
                  </p>
                  <p className="mt-0.5 text-sm text-gray-500">{guest.group}</p>
                </div>
                <Badge status={guest.status} />
              </div>

              <div className="mt-3 flex items-center gap-4 text-sm text-gray-600">
                {guest.phone && <span>{formatPhone(guest.phone)}</span>}
                <span>
                  {guest.status === 'confirmed'
                    ? `${guest.actualGuests ?? guest.plannedGuests} מגיעים`
                    : `${guest.plannedGuests} מתוכנן`}
                </span>
              </div>

              <div className="mt-3 flex items-center justify-between border-t border-gray-100 pt-3">
                {/* Copy link */}
                <button
                  type="button"
                  onClick={() => onCopyLink(guest.id)}
                  className={`inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1 text-xs font-medium transition-all ${
                    isCopied
                      ? 'bg-green-100 text-green-700'
                      : 'bg-gray-100 text-gray-600 hover:bg-navy-100 hover:text-navy-800'
                  }`}
                >
                  {isCopied ? (
                    <><Check className="w-3.5 h-3.5" />הועתק! ✓</>
                  ) : (
                    <><Link2 className="w-3.5 h-3.5" />העתק קישור 🔗</>
                  )}
                </button>

                {/* Delete confirm / edit+delete */}
                {isConfirming ? (
                  <div className="flex items-center gap-2 text-xs">
                    <span className="text-gray-600">למחוק?</span>
                    <button
                      type="button"
                      onClick={() => handleConfirmDelete(guest.id)}
                      className="rounded px-2 py-1 bg-red-600 text-white"
                    >מחק</button>
                    <button
                      type="button"
                      onClick={() => setConfirmDeleteId(null)}
                      className="rounded px-2 py-1 bg-gray-200 text-gray-700"
                    >ביטול</button>
                  </div>
                ) : (
                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      onClick={() => onEdit(guest)}
                      className="rounded p-1.5 text-gray-500 hover:bg-gray-100"
                    >
                      <Pencil className="w-4 h-4" />
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDeleteClick(guest.id)}
                      className="rounded p-1.5 text-red-500 hover:bg-red-50"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </>
  );
}
