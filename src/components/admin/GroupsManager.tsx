'use client';

import { useState } from 'react';
import { Trash2, ChevronUp, ChevronDown, Plus, X } from 'lucide-react';
import { useGroupsViewModel } from '@/viewmodels/useGroupsViewModel';
import Button from '@/components/ui/Button';

interface GroupsManagerProps {
  onClose: () => void;
  guestCounts: Record<string, number>;
}

export default function GroupsManager({ onClose, guestCounts }: GroupsManagerProps) {
  const {
    groups,
    loading,
    saving,
    error,
    successMessage,
    pendingRemove,
    addGroup,
    removeGroup,
    confirmRemove,
    cancelRemove,
    moveUp,
    moveDown,
    save,
  } = useGroupsViewModel();

  const [newGroupName, setNewGroupName] = useState('');
  const [addError, setAddError] = useState<string | null>(null);

  function handleAdd() {
    const err = addGroup(newGroupName);
    if (err) {
      setAddError(err);
      return;
    }
    setAddError(null);
    setNewGroupName('');
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      <div className="relative z-10 w-full max-w-md rounded-xl bg-white shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-gray-200 px-6 py-4">
          <h2 className="text-lg font-semibold text-gray-900">ניהול קבוצות שיוך</h2>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-1.5 text-gray-500 hover:bg-gray-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 flex flex-col gap-4">
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <div className="w-6 h-6 rounded-full border-2 border-navy-800 border-t-transparent animate-spin" />
            </div>
          ) : (
            <>
              {error && (
                <div className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-600">{error}</div>
              )}

              {successMessage && (
                <div className="rounded-lg bg-green-50 px-4 py-3 text-sm font-medium text-green-700">
                  {successMessage}
                </div>
              )}

              {/* Pending remove confirmation */}
              {pendingRemove && (
                <div className="rounded-lg border border-orange-200 bg-orange-50 px-4 py-3">
                  <p className="text-sm font-medium text-orange-800 mb-3">
                    קבוצה זו משויכת ל-{pendingRemove.count} אורחים. האם להמשיך?
                  </p>
                  <div className="flex gap-2">
                    <Button variant="danger" onClick={confirmRemove}>כן, מחק</Button>
                    <Button variant="secondary" onClick={cancelRemove}>ביטול</Button>
                  </div>
                </div>
              )}

              {/* Groups list */}
              <ul className="divide-y divide-gray-100 rounded-lg border border-gray-200 overflow-hidden">
                {groups.length === 0 && (
                  <li className="px-4 py-6 text-center text-sm text-gray-400">אין קבוצות עדיין</li>
                )}
                {groups.map((group, i) => (
                  <li key={group} className="flex items-center gap-2 px-4 py-3 bg-white hover:bg-gray-50">
                    <div className="flex flex-col gap-0.5">
                      <button
                        type="button"
                        onClick={() => moveUp(i)}
                        disabled={i === 0}
                        className="p-0.5 rounded text-gray-400 hover:text-gray-700 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                      >
                        <ChevronUp className="w-4 h-4" />
                      </button>
                      <button
                        type="button"
                        onClick={() => moveDown(i)}
                        disabled={i === groups.length - 1}
                        className="p-0.5 rounded text-gray-400 hover:text-gray-700 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                      >
                        <ChevronDown className="w-4 h-4" />
                      </button>
                    </div>
                    <span className="flex-1 text-sm font-medium text-gray-800">{group}</span>
                    {(guestCounts[group] ?? 0) > 0 && (
                      <span className="text-xs text-gray-400">{guestCounts[group]} אורחים</span>
                    )}
                    <button
                      type="button"
                      onClick={() => removeGroup(group, guestCounts[group] ?? 0)}
                      className="p-1.5 rounded text-gray-400 hover:text-red-500 hover:bg-red-50 transition-colors"
                      title="מחק קבוצה"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </li>
                ))}
              </ul>

              {/* Add new group */}
              <div className="flex flex-col gap-1.5">
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={newGroupName}
                    onChange={(e) => {
                      setNewGroupName(e.target.value);
                      setAddError(null);
                    }}
                    onKeyDown={(e) => e.key === 'Enter' && handleAdd()}
                    placeholder="שם קבוצה חדשה..."
                    className="flex-1 rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-navy-800 focus:ring-1 focus:ring-navy-800"
                  />
                  <Button onClick={handleAdd} variant="secondary">
                    <Plus className="w-4 h-4" />
                    הוסף
                  </Button>
                </div>
                {addError && <p className="text-xs text-red-600">{addError}</p>}
              </div>
            </>
          )}

          {/* Footer */}
          <div className="flex justify-end gap-3 pt-2 border-t border-gray-200">
            <Button variant="secondary" onClick={onClose}>סגור</Button>
            <Button onClick={save} loading={saving} disabled={loading}>
              שמור שינויים
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
