'use client';

import { useState, useEffect } from 'react';
import {
  GroupEntry,
  getGroups,
  saveGroups as serviceSaveGroups,
  nextAvailableColor,
} from '@/services/groups.service';

interface PendingRemove {
  group: string;
  count: number;
}

interface GroupsViewModel {
  groups: GroupEntry[];
  loading: boolean;
  saving: boolean;
  error: string | null;
  successMessage: string | null;
  pendingRemove: PendingRemove | null;
  addGroup: (name: string) => string | null;
  removeGroup: (name: string, guestCount: number) => void;
  confirmRemove: () => void;
  cancelRemove: () => void;
  moveUp: (index: number) => void;
  moveDown: (index: number) => void;
  changeColor: (name: string, color: string) => void;
  save: () => Promise<void>;
}

export function useGroupsViewModel(): GroupsViewModel {
  const [groups, setGroups] = useState<GroupEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [pendingRemove, setPendingRemove] = useState<PendingRemove | null>(null);

  useEffect(() => {
    getGroups()
      .then(setGroups)
      .catch(() => setError('שגיאה בטעינת הקבוצות'))
      .finally(() => setLoading(false));
  }, []);

  function addGroup(name: string): string | null {
    const trimmed = name.trim();
    if (!trimmed) return 'שם הקבוצה לא יכול להיות ריק';
    if (groups.some((g) => g.name === trimmed)) return 'קבוצה בשם זה כבר קיימת';
    const color = nextAvailableColor(groups.map((g) => g.color));
    setGroups((prev) => [...prev, { name: trimmed, color }]);
    return null;
  }

  function removeGroup(name: string, guestCount: number): void {
    if (guestCount > 0) {
      setPendingRemove({ group: name, count: guestCount });
    } else {
      setGroups((prev) => prev.filter((g) => g.name !== name));
    }
  }

  function confirmRemove(): void {
    if (!pendingRemove) return;
    setGroups((prev) => prev.filter((g) => g.name !== pendingRemove.group));
    setPendingRemove(null);
  }

  function cancelRemove(): void {
    setPendingRemove(null);
  }

  function moveUp(index: number): void {
    if (index <= 0) return;
    setGroups((prev) => {
      const next = [...prev];
      [next[index - 1], next[index]] = [next[index], next[index - 1]];
      return next;
    });
  }

  function moveDown(index: number): void {
    setGroups((prev) => {
      if (index >= prev.length - 1) return prev;
      const next = [...prev];
      [next[index], next[index + 1]] = [next[index + 1], next[index]];
      return next;
    });
  }

  function changeColor(name: string, color: string): void {
    setGroups((prev) => prev.map((g) => (g.name === name ? { ...g, color } : g)));
  }

  async function save(): Promise<void> {
    setSaving(true);
    setError(null);
    try {
      await serviceSaveGroups(groups);
      setSuccessMessage('הקבוצות עודכנו בהצלחה ✓');
      setTimeout(() => setSuccessMessage(null), 3000);
    } catch {
      setError('שגיאה בשמירת הקבוצות');
    } finally {
      setSaving(false);
    }
  }

  return {
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
    changeColor,
    save,
  };
}
