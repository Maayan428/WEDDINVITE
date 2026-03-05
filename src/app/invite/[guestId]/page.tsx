'use client';

import { use, useState } from 'react';
import { useRSVPViewModel } from '@/viewmodels/useRSVPViewModel';
import { DEFAULT_EVENT_DETAILS } from '@/lib/constants';
import InvitationCard from '@/components/invite/InvitationCard';
import RSVPForm from '@/components/invite/RSVPForm';
import Button from '@/components/ui/Button';

interface InvitePageProps {
  params: Promise<{ guestId: string }>;
}

function SectionDivider({ label }: { label: string }) {
  return (
    <div className="my-10 flex items-center gap-4">
      <div className="h-px flex-1 bg-gradient-to-r from-transparent to-gold-300" />
      <span className="text-xs text-gold-500 tracking-widest uppercase">{label}</span>
      <div className="h-px flex-1 bg-gradient-to-l from-transparent to-gold-300" />
    </div>
  );
}

export default function InvitePage({ params }: InvitePageProps) {
  const { guestId } = use(params);
  const { guest, loading, error, alreadyResponded, submitRSVP, retry } =
    useRSVPViewModel(guestId);

  // forceForm=true when user clicks "לעדכן תגובה"
  const [forceForm, setForceForm] = useState(false);

  const event = DEFAULT_EVENT_DETAILS;

  // ── Loading (initial, no guest yet) ──
  if (loading && !guest) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-b from-white to-navy-50/30">
        <div className="flex flex-col items-center gap-4">
          <div className="w-10 h-10 rounded-full border-2 border-gold-400 border-t-transparent animate-spin" />
          <p className="text-sm text-gray-400">טוען את ההזמנה שלך...</p>
        </div>
      </div>
    );
  }

  // ── Not found ──
  if (error === 'not-found' || (!loading && !guest && error !== 'network')) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-b from-white to-navy-50/30 p-6">
        <div className="mx-auto max-w-sm text-center">
          <div className="mb-6 text-6xl">💌</div>
          <h1 className="mb-3 font-serif text-2xl font-bold text-navy-800">הקישור אינו תקין</h1>
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
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-b from-white to-navy-50/30 p-6">
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

  // showConfirmation: when guest already responded AND user didn't request to edit
  const showConfirmation = alreadyResponded && !forceForm;

  return (
    <div className="min-h-screen bg-gradient-to-b from-white via-white to-navy-50/40">
      {/* Gold accent bar */}
      <div className="h-1 w-full bg-gradient-to-r from-gold-300 via-gold-500 to-gold-300" />

      <div className="mx-auto max-w-[600px] px-4 py-12 sm:py-16">
        {/* Invitation header */}
        <InvitationCard guest={guest} event={event} />

        <SectionDivider label="אישור הגעה" />

        {/* RSVP card */}
        <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-md sm:p-8">
          {/* Submit error */}
          {error === 'submit' && (
            <div className="mb-5 rounded-lg bg-red-50 px-4 py-3 text-sm text-center text-red-700">
              שגיאה בשמירת התשובה — בדקו את החיבור ונסו שוב.
            </div>
          )}

          {showConfirmation ? (
            /* ── Already-responded / just-submitted confirmation ── */
            <div className="flex flex-col items-center gap-4 py-4 text-center">
              {guest.status === 'confirmed' ? (
                <>
                  <div className="text-6xl">🎉</div>
                  <h3 className="font-serif text-2xl font-bold text-navy-800">
                    תודה! מחכים לראותך
                  </h3>
                  <p className="text-gray-600">
                    אישרת הגעה עבור{' '}
                    <span className="font-semibold text-navy-800">
                      {guest.actualGuests ?? guest.plannedGuests}
                    </span>{' '}
                    {(guest.actualGuests ?? guest.plannedGuests) === 1 ? 'אדם' : 'אנשים'}.
                  </p>
                </>
              ) : (
                <>
                  <div className="text-6xl">💙</div>
                  <h3 className="font-serif text-2xl font-bold text-navy-800">
                    תודה על העדכון
                  </h3>
                  <p className="text-gray-600">חבל שלא תוכל/י להגיע — נתגעגע אליך.</p>
                </>
              )}

              <button
                type="button"
                onClick={() => setForceForm(true)}
                className="mt-2 text-sm text-navy-700 underline underline-offset-2 hover:text-navy-900 transition-colors"
              >
                לעדכן תגובה
              </button>
            </div>
          ) : (
            /* ── RSVP Form ── */
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
