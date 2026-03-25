'use client';

import { useEffect, useState } from 'react';
import { useRSVPViewModel } from '@/viewmodels/useRSVPViewModel';
import { DEFAULT_EVENT_DETAILS } from '@/lib/constants';
import { EventDetails } from '@/models/event.model';
import { getEventDetails } from '@/services/event.service';
import InvitationCard from '@/components/invite/InvitationCard';
import RSVPForm from '@/components/invite/RSVPForm';
import Button from '@/components/ui/Button';

function SectionDivider({ label }: { label: string }) {
  return (
    <div className="my-10 flex items-center gap-4">
      <div className="h-px flex-1 bg-gradient-to-r from-transparent to-teal-200" />
      <span className="text-xs text-teal-500 tracking-widest uppercase">{label}</span>
      <div className="h-px flex-1 bg-gradient-to-l from-transparent to-teal-200" />
    </div>
  );
}

export default function InviteClient({ guestId }: { guestId: string }) {
  const { guest, loading, error, alreadyResponded, submitRSVP, retry } =
    useRSVPViewModel(guestId);

  const [forceForm, setForceForm] = useState(false);

  const [eventDetails, setEventDetails] = useState<EventDetails>(DEFAULT_EVENT_DETAILS);
  useEffect(() => {
    getEventDetails().then(setEventDetails).catch(() => {});
  }, []);

  // ── Loading (initial, no guest yet) ──
  if (loading && !guest) {
    return (
      <div
        className="flex min-h-screen items-center justify-center"
        style={{ background: 'linear-gradient(180deg, #ffffff 0%, #f0fafa 100%)' }}
      >
        <div className="flex flex-col items-center gap-4">
          <div className="w-10 h-10 rounded-full border-2 border-teal-400 border-t-transparent animate-spin" />
          <p className="text-sm text-gray-400">טוען את ההזמנה שלך...</p>
        </div>
      </div>
    );
  }

  // ── Not found ──
  if (error === 'not-found' || (!loading && !guest && error !== 'network')) {
    return (
      <div
        className="flex min-h-screen items-center justify-center p-6"
        style={{ background: 'linear-gradient(180deg, #ffffff 0%, #f0fafa 100%)' }}
      >
        <div className="mx-auto max-w-sm text-center">
          <div className="mb-6 text-6xl">💌</div>
          <h1 className="mb-3 font-serif text-2xl font-bold" style={{ color: '#1e3a5f' }}>הקישור אינו תקין</h1>
          <p className="text-gray-500 text-sm leading-relaxed">
            ייתכן שהקישור שגוי או שפג תוקפו. אנא פנו לבני הזוג לקבלת קישור חדש.
          </p>
        </div>
      </div>
    );
  }

  // ── Network error (no guest loaded) ──
  if (error === 'network' && !guest) {
    return (
      <div
        className="flex min-h-screen items-center justify-center p-6"
        style={{ background: 'linear-gradient(180deg, #ffffff 0%, #f0fafa 100%)' }}
      >
        <div className="mx-auto max-w-sm text-center">
          <div className="mb-6 text-5xl">📡</div>
          <h1 className="mb-2 text-xl font-semibold text-gray-800">שגיאת חיבור</h1>
          <p className="mb-6 text-sm text-gray-500">
            לא הצלחנו לטעון את ההזמנה. בדקו את החיבור לאינטרנט ונסו שוב.
          </p>
          <Button onClick={retry}>נסה שוב</Button>
        </div>
      </div>
    );
  }

  if (!guest) return null;

  const showConfirmation = alreadyResponded && !forceForm;

  return (
    <div
      className="min-h-screen"
      style={{ background: 'linear-gradient(180deg, #ffffff 0%, #f0fafa 60%, #ccfbf1 100%)' }}
    >
      {/* Teal accent bar */}
      <div className="h-1 w-full" style={{ background: 'linear-gradient(90deg, #0d9488, #06b6d4, #0d9488)' }} />

      <div className="mx-auto max-w-[600px] px-4 py-12 sm:py-16">
        {/* Invitation header */}
        <InvitationCard guest={guest} event={eventDetails} />

        <SectionDivider label="אישור הגעה" />

        {/* RSVP card */}
        <div
          className="rounded-2xl border border-gray-100 bg-white p-6 sm:p-8"
          style={{ boxShadow: '0 4px 24px rgba(13,148,136,0.10), 0 1px 4px rgba(0,0,0,0.06)' }}
        >
          {/* Submit error */}
          {error === 'submit' && (
            <div className="mb-5 rounded-xl bg-red-50 border border-red-100 px-4 py-3 text-sm text-center text-red-700">
              שגיאה בשמירת התשובה — בדקו את החיבור ונסו שוב.
            </div>
          )}

          {showConfirmation ? (
            <div
              className="flex flex-col items-center gap-4 py-6 text-center rounded-2xl"
              style={{ background: 'linear-gradient(135deg, #f0fafa 0%, #ccfbf1 100%)' }}
            >
              {guest.status === 'confirmed' ? (
                <>
                  <div className="text-6xl">🎉</div>
                  <h3 className="font-serif text-2xl font-bold" style={{ color: '#1e3a5f' }}>
                    תודה! מחכים לראותך
                  </h3>
                  <p className="text-gray-600">
                    אישרת הגעה עבור{' '}
                    <span className="font-semibold text-teal-700">
                      {guest.actualGuests ?? guest.plannedGuests}
                    </span>{' '}
                    {(guest.actualGuests ?? guest.plannedGuests) === 1 ? 'אדם' : 'אנשים'}.
                  </p>
                </>
              ) : (
                <>
                  <div className="text-6xl">💙</div>
                  <h3 className="font-serif text-2xl font-bold" style={{ color: '#1e3a5f' }}>
                    תודה על העדכון
                  </h3>
                  <p className="text-gray-600">חבל שלא תוכל/י להגיע — נתגעגע אליך.</p>
                </>
              )}

              <button
                type="button"
                onClick={() => setForceForm(true)}
                className="mt-2 text-sm text-teal-600 underline underline-offset-2 hover:text-teal-800 transition-colors"
              >
                לעדכן תגובה
              </button>
            </div>
          ) : (
            <RSVPForm
              guest={guest}
              onSubmit={async (data) => {
                const ok = await submitRSVP(data);
                if (ok) setForceForm(false);
              }}
              loading={loading}
              initialAttending={alreadyResponded ? guest.status === 'confirmed' : undefined}
            />
          )}
        </div>

        {/* Footer */}
        <p className="mt-10 text-center text-xs text-gray-400">
          בשאלות ופניות — צרו קשר ישירות עם בני הזוג
        </p>
      </div>
    </div>
  );
}
