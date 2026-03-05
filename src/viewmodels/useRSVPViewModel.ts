'use client';

import { useState, useEffect } from 'react';
import { Guest, RSVPSubmission } from '@/models/guest.model';
import { getGuestById, updateRSVP } from '@/services/guests.service';

export interface RSVPViewModel {
  guest: Guest | null;
  loading: boolean;
  error: string | null; // 'not-found' | 'network' | 'submit' | null
  alreadyResponded: boolean;
  submitRSVP: (data: RSVPSubmission & { attending: boolean }) => Promise<boolean>;
  retry: () => void;
}

export function useRSVPViewModel(guestId: string): RSVPViewModel {
  const [guest, setGuest] = useState<Guest | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [retryCount, setRetryCount] = useState(0);

  useEffect(() => {
    if (!guestId) return;

    async function fetchGuest() {
      setLoading(true);
      setError(null);
      try {
        const data = await getGuestById(guestId);
        if (!data) {
          setError('not-found');
        } else {
          setGuest(data);
        }
      } catch {
        setError('network');
      } finally {
        setLoading(false);
      }
    }

    fetchGuest();
  }, [guestId, retryCount]);

  const alreadyResponded = guest !== null && guest.status !== 'pending';

  async function submitRSVP(data: RSVPSubmission & { attending: boolean }): Promise<boolean> {
    if (!guest) return false;
    setError(null);
    setLoading(true);
    try {
      const { attending, ...rsvpData } = data;
      const status = attending ? ('confirmed' as const) : ('declined' as const);
      await updateRSVP(guest.id, {
        ...rsvpData,
        status,
        actualGuests: attending ? rsvpData.actualGuests : 0,
      });
      setGuest((prev) =>
        prev
          ? {
              ...prev,
              status,
              actualGuests: attending ? rsvpData.actualGuests : 0,
              dietaryNeeds: rsvpData.dietaryNeeds,
              dietaryNote: rsvpData.dietaryNote,
              personalMessage: rsvpData.personalMessage,
            }
          : null,
      );
      return true;
    } catch {
      setError('submit');
      return false;
    } finally {
      setLoading(false);
    }
  }

  function retry() {
    setRetryCount((c) => c + 1);
  }

  return { guest, loading, error, alreadyResponded, submitRSVP, retry };
}
