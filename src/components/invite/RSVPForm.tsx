'use client';

import { useState } from 'react';
import { Guest, RSVPSubmission } from '@/models/guest.model';
import Button from '@/components/ui/Button';

const DIETARY_OPTS = ['צמחוני', 'טבעוני', 'ללא גלוטן', 'ללא לקטוז', 'אחר'] as const;
const OTHER = 'אחר';
const MAX_MESSAGE = 500;

interface RSVPFormProps {
  guest: Guest;
  onSubmit: (data: RSVPSubmission & { attending: boolean }) => Promise<void>;
  loading: boolean;
  initialAttending?: boolean;
}

export default function RSVPForm({ guest, onSubmit, loading, initialAttending }: RSVPFormProps) {
  const prefilled = initialAttending !== undefined;

  const [attending, setAttending] = useState<boolean | null>(initialAttending ?? null);
  const [actualGuests, setActualGuests] = useState(
    prefilled ? (guest.actualGuests ?? 1) : 1,
  );
  const [dietaryNeeds, setDietaryNeeds] = useState<string[]>(
    prefilled ? (guest.dietaryNeeds ?? []).filter((d) => d !== OTHER) : [],
  );
  const [otherChecked, setOtherChecked] = useState(
    prefilled ? (guest.dietaryNeeds ?? []).includes(OTHER) : false,
  );
  const [dietaryNote, setDietaryNote] = useState(
    prefilled ? (guest.dietaryNote ?? '') : '',
  );
  const [personalMessage, setPersonalMessage] = useState(
    prefilled ? (guest.personalMessage ?? '') : '',
  );
  const [validationError, setValidationError] = useState<string | null>(null);

  function toggleDietary(option: string) {
    if (option === OTHER) {
      setOtherChecked((v) => !v);
      return;
    }
    setDietaryNeeds((prev) =>
      prev.includes(option) ? prev.filter((d) => d !== option) : [...prev, option],
    );
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (attending === null) {
      setValidationError('יש לבחור אם אתה מגיע או לא');
      return;
    }
    setValidationError(null);
    const allDietary = otherChecked ? [...dietaryNeeds, OTHER] : dietaryNeeds;
    await onSubmit({
      attending,
      actualGuests: attending ? actualGuests : 0,
      dietaryNeeds: allDietary,
      dietaryNote: otherChecked && dietaryNote ? dietaryNote : undefined,
      personalMessage: personalMessage || undefined,
    });
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-6">
      {/* Attendance toggle */}
      <div>
        <p className="mb-3 text-center text-sm text-gray-500">האם תוכל/י להגיע לאירוע?</p>
        <div className="grid grid-cols-2 gap-3">
          <button
            type="button"
            onClick={() => setAttending(true)}
            className={`rounded-xl border-2 py-5 px-3 text-center font-medium transition-all duration-200 ${
              attending === true
                ? 'border-teal-500 text-white shadow-md'
                : 'border-gray-200 text-gray-600 hover:border-teal-300 hover:bg-teal-50/50'
            }`}
            style={
              attending === true
                ? { background: 'linear-gradient(135deg, #0d9488 0%, #06b6d4 100%)' }
                : {}
            }
          >
            <span className="block text-2xl mb-1.5">✓</span>
            <span className="text-sm">אשמח להגיע</span>
          </button>
          <button
            type="button"
            onClick={() => setAttending(false)}
            className={`rounded-xl border-2 py-5 px-3 text-center font-medium transition-all duration-200 ${
              attending === false
                ? 'border-red-400 bg-red-50 text-red-600 shadow-sm'
                : 'border-gray-200 text-gray-600 hover:border-red-200 hover:bg-red-50/30'
            }`}
          >
            <span className="block text-2xl mb-1.5">✗</span>
            <span className="text-sm">לא אוכל להגיע</span>
          </button>
        </div>
      </div>

      {/* Additional fields — only when attending */}
      {attending === true && (
        <>
          {/* Guest count */}
          <div className="flex flex-col gap-2">
            <label className="text-sm font-medium text-gray-700">כמה אנשים יגיעו?</label>
            <div className="flex items-center gap-4">
              <button
                type="button"
                onClick={() => setActualGuests((n) => Math.max(1, n - 1))}
                className="w-10 h-10 rounded-full border border-gray-200 text-xl leading-none hover:bg-teal-50 hover:border-teal-300 hover:text-teal-600 transition-all duration-200"
              >
                −
              </button>
              <span className="text-2xl font-semibold w-8 text-center" style={{ color: '#1e3a5f' }}>{actualGuests}</span>
              <button
                type="button"
                onClick={() => setActualGuests((n) => Math.min(guest.plannedGuests, n + 1))}
                className="w-10 h-10 rounded-full border border-gray-200 text-xl leading-none hover:bg-teal-50 hover:border-teal-300 hover:text-teal-600 transition-all duration-200"
              >
                +
              </button>
              <span className="text-xs text-gray-400">מתוך {guest.plannedGuests} מוזמנים</span>
            </div>
          </div>

          {/* Dietary needs */}
          <div className="flex flex-col gap-2">
            <label className="text-sm font-medium text-gray-700">
              צרכים תזונתיים{' '}
              <span className="font-normal text-gray-400">(אופציונלי)</span>
            </label>
            <div className="flex flex-wrap gap-x-5 gap-y-2">
              {DIETARY_OPTS.map((option) => (
                <label key={option} className="flex items-center gap-1.5 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={option === OTHER ? otherChecked : dietaryNeeds.includes(option)}
                    onChange={() => toggleDietary(option)}
                    className="rounded border-gray-300 accent-teal-600"
                  />
                  <span className="text-sm text-gray-700">{option}</span>
                </label>
              ))}
            </div>
            {otherChecked && (
              <input
                type="text"
                value={dietaryNote}
                onChange={(e) => setDietaryNote(e.target.value)}
                placeholder="פרט/י בבקשה..."
                className="rounded-xl border border-gray-200 px-3 py-2 text-sm outline-none focus:border-teal-400 focus:ring-2 focus:ring-teal-100 transition-all duration-200"
              />
            )}
          </div>
        </>
      )}

      {/* Personal message — always visible */}
      <div className="flex flex-col gap-1">
        <label className="text-sm font-medium text-gray-700">
          ברכה אישית לזוג 💌{' '}
          <span className="font-normal text-gray-400">(אופציונלי)</span>
        </label>
        <textarea
          value={personalMessage}
          onChange={(e) => setPersonalMessage(e.target.value.slice(0, MAX_MESSAGE))}
          placeholder="כתבו לנו ברכה חמה..."
          rows={3}
          className="rounded-xl border border-gray-200 px-3 py-2 text-sm outline-none focus:border-teal-400 focus:ring-2 focus:ring-teal-100 transition-all duration-200 resize-none"
        />
        <p className="text-xs text-gray-400 text-end">
          {personalMessage.length}/{MAX_MESSAGE}
        </p>
      </div>

      {validationError && (
        <p className="text-sm text-center text-red-600">{validationError}</p>
      )}

      <Button
        type="submit"
        loading={loading}
        disabled={attending === null}
        size="lg"
        className="w-full"
      >
        שלח אישור
      </Button>
    </form>
  );
}
