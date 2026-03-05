'use client';

import { useState, useEffect } from 'react';
import { Guest } from '@/models/guest.model';
import { getAllGuests } from '@/services/guests.service';

interface DashboardStats {
  total: number;
  confirmed: number;
  declined: number;
  pending: number;
  totalExpectedGuests: number;
  confirmedPeople: number;
}

export interface GroupBreakdown {
  name: string;
  confirmed: number;
  declined: number;
  pending: number;
  total: number;
  confirmedPeople: number;
}

interface DashboardViewModel {
  stats: DashboardStats;
  groupBreakdown: GroupBreakdown[];
  guests: Guest[];
  loading: boolean;
  error: string | null;
  selectedGroup: string | null;
  setSelectedGroup: (group: string | null) => void;
  refresh: () => void;
}

export function useDashboardViewModel(): DashboardViewModel {
  const [guests, setGuests] = useState<Guest[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedGroup, setSelectedGroup] = useState<string | null>(null);
  const [fetchCount, setFetchCount] = useState(0);

  useEffect(() => {
    async function fetchData() {
      setLoading(true);
      setError(null);
      try {
        const data = await getAllGuests();
        setGuests(data);
      } catch {
        setError('שגיאה בטעינת נתוני הדשבורד.');
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, [fetchCount]);

  function refresh() {
    setFetchCount((c) => c + 1);
  }

  const confirmedGuests = guests.filter((g) => g.status === 'confirmed');

  const stats: DashboardStats = {
    total: guests.length,
    confirmed: confirmedGuests.length,
    declined: guests.filter((g) => g.status === 'declined').length,
    pending: guests.filter((g) => g.status === 'pending').length,
    totalExpectedGuests: guests.reduce((sum, g) => sum + (g.actualGuests ?? g.plannedGuests), 0),
    confirmedPeople: confirmedGuests.reduce((sum, g) => sum + (g.actualGuests ?? g.plannedGuests), 0),
  };

  const groupMap = new Map<string, GroupBreakdown>();
  for (const guest of guests) {
    const existing = groupMap.get(guest.group) ?? {
      name: guest.group,
      confirmed: 0,
      declined: 0,
      pending: 0,
      total: 0,
      confirmedPeople: 0,
    };
    existing.total += 1;
    if (guest.status === 'confirmed') {
      existing.confirmed += 1;
      existing.confirmedPeople += guest.actualGuests ?? guest.plannedGuests;
    } else if (guest.status === 'declined') {
      existing.declined += 1;
    } else {
      existing.pending += 1;
    }
    groupMap.set(guest.group, existing);
  }
  const groupBreakdown = Array.from(groupMap.values());

  return { stats, groupBreakdown, guests, loading, error, selectedGroup, setSelectedGroup, refresh };
}
