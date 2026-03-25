'use client';

import { useEffect, useState } from 'react';
import { EventDetails } from '@/models/event.model';
import {
  getEventDetails as fetchDetails,
  saveEventDetails as persistDetails,
} from '@/services/event.service';

export function useEventViewModel() {
  const [eventDetails, setEventDetails] = useState<EventDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchDetails()
      .then(setEventDetails)
      .catch(() => setError('שגיאה בטעינת פרטי האירוע'))
      .finally(() => setLoading(false));
  }, []);

  async function saveEventDetails(data: EventDetails) {
    setSaving(true);
    setError(null);
    try {
      await persistDetails(data);
      setEventDetails(data);
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch {
      setError('שגיאה בשמירת הפרטים');
    } finally {
      setSaving(false);
    }
  }

  return { eventDetails, loading, saving, saveSuccess, error, saveEventDetails };
}
