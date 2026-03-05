'use client';

import { useState, useEffect, useCallback } from 'react';
import { Guest, GuestFormData, RSVPStatus } from '@/models/guest.model';
import {
  getAllGuests,
  addGuest as serviceAddGuest,
  updateGuest as serviceUpdateGuest,
  deleteGuest as serviceDeleteGuest,
} from '@/services/guests.service';
import { buildInviteUrl } from '@/lib/token.utils';

interface GuestsViewModel {
  guests: Guest[];
  filteredGuests: Guest[];
  loading: boolean;
  error: string | null;
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  selectedGroup: string;
  setSelectedGroup: (group: string) => void;
  selectedStatus: RSVPStatus | '';
  setSelectedStatus: (status: RSVPStatus | '') => void;
  copiedGuestId: string | null;
  addGuest: (data: GuestFormData) => Promise<void>;
  updateGuest: (id: string, data: Partial<GuestFormData>) => Promise<void>;
  deleteGuest: (id: string) => Promise<void>;
  copyInviteLink: (guestId: string) => Promise<void>;
  refresh: () => Promise<void>;
}

export function useGuestsViewModel(): GuestsViewModel {
  const [guests, setGuests] = useState<Guest[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedGroup, setSelectedGroup] = useState('');
  const [selectedStatus, setSelectedStatus] = useState<RSVPStatus | ''>('');
  const [copiedGuestId, setCopiedGuestId] = useState<string | null>(null);

  const fetchGuests = useCallback(async (): Promise<void> => {
    setLoading(true);
    setError(null);
    try {
      const data = await getAllGuests();
      setGuests(data);
    } catch {
      setError('שגיאה בטעינת האורחים.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchGuests();
  }, [fetchGuests]);

  const filteredGuests = guests.filter((g) => {
    const term = searchTerm.trim().toLowerCase();
    const matchesSearch =
      !term ||
      g.firstName.toLowerCase().includes(term) ||
      g.lastName.toLowerCase().includes(term) ||
      g.phone.includes(term);
    const matchesGroup = !selectedGroup || g.group === selectedGroup;
    const matchesStatus = !selectedStatus || g.status === selectedStatus;
    return matchesSearch && matchesGroup && matchesStatus;
  });

  async function addGuest(data: GuestFormData): Promise<void> {
    setError(null);
    try {
      await serviceAddGuest(data);
      await fetchGuests();
    } catch {
      setError('שגיאה בהוספת האורח.');
      throw new Error('שגיאה בהוספת האורח.');
    }
  }

  async function updateGuest(id: string, data: Partial<GuestFormData>): Promise<void> {
    setError(null);
    try {
      await serviceUpdateGuest(id, data);
      await fetchGuests();
    } catch {
      setError('שגיאה בעדכון האורח.');
      throw new Error('שגיאה בעדכון האורח.');
    }
  }

  async function deleteGuest(id: string): Promise<void> {
    setError(null);
    try {
      await serviceDeleteGuest(id);
      setGuests((prev) => prev.filter((g) => g.id !== id));
    } catch {
      setError('שגיאה במחיקת האורח.');
    }
  }

  async function copyInviteLink(guestId: string): Promise<void> {
    const url = buildInviteUrl(guestId);
    try {
      await navigator.clipboard.writeText(url);
      setCopiedGuestId(guestId);
      setTimeout(() => setCopiedGuestId(null), 2000);
    } catch {
      setError('לא ניתן להעתיק קישור. אנא העתיקו ידנית: ' + url);
    }
  }

  return {
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
    refresh: fetchGuests,
  };
}
