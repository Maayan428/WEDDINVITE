'use client';

import { Calendar, Clock, MapPin } from 'lucide-react';
import { Guest } from '@/models/guest.model';
import { EventDetails } from '@/models/event.model';

interface InvitationCardProps {
  guest: Guest;
  event: EventDetails;
}

function FloralDivider({ color }: { color: string }) {
  return (
    <div className="my-7 flex items-center justify-center gap-3" style={{ color }}>
      <div
        className="h-px w-14"
        style={{ background: `linear-gradient(to right, transparent, ${color}80)` }}
      />
      <svg
        width="20"
        height="20"
        viewBox="0 0 20 20"
        fill="currentColor"
        className="shrink-0 opacity-80"
        aria-hidden="true"
      >
        <path d="M10 1 C8 5 4 6 1 6 C3 8 4 12 10 12 S17 8 19 6 C16 6 12 5 10 1Z" />
        <circle cx="10" cy="10" r="1.5" />
        <path d="M10 19 C12 15 16 14 19 14 C17 12 16 8 10 8 S3 12 1 14 C4 14 8 15 10 19Z" />
      </svg>
      <div
        className="h-px w-14"
        style={{ background: `linear-gradient(to left, transparent, ${color}80)` }}
      />
    </div>
  );
}

function formatDate(dateStr: string): string {
  try {
    const d = new Date(dateStr);
    if (!isNaN(d.getTime())) {
      return d.toLocaleDateString('he-IL', {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
      });
    }
  } catch {
    // fall through
  }
  return dateStr;
}

function getGenderGreeting(gender?: 'male' | 'female' | 'unspecified'): string {
  if (gender === 'male') return 'אתה מוזמן לחתונה של';
  if (gender === 'female') return 'את מוזמנת לחתונה של';
  return 'הוזמנת לחתונה של';
}

export default function InvitationCard({ guest, event }: InvitationCardProps) {
  const style = event.inviteStyle ?? {};
  const guestNameColor = style.guestNameColor ?? '#1e3a5f';
  const coupleNameColor = style.coupleNameColor ?? '#1e3a5f';
  const accentColor = style.accentColor ?? '#0d9488';
  const detailsColor = style.detailsColor ?? '#374151';
  const headingFontClass =
    style.headingFont === 'sans'
      ? 'font-sans'
      : style.headingFont === 'elegant'
        ? 'font-serif italic'
        : 'font-serif';

  return (
    <div className="text-center">
      {/* 1. "שמחים להזמין את" */}
      <p
        className="text-xs uppercase tracking-[0.35em] font-sans"
        style={{ color: accentColor }}
      >
        שמחים להזמין את
      </p>

      {/* 2. Guest full name — large & bold */}
      <h1
        className={`mt-3 text-2xl font-bold leading-tight ${headingFontClass}`}
        style={{ color: guestNameColor }}
      >
        {guest.firstName} {guest.lastName}
      </h1>

      {/* Decorative rule */}
      <div
        className="mx-auto mt-4 h-0.5 w-20 rounded-full"
        style={{ background: `linear-gradient(90deg, ${accentColor}, ${accentColor}88)` }}
      />

      {/* 4. Gender-based greeting */}
      <p className="mt-5 text-sm tracking-wide" style={{ color: detailsColor }}>
        {getGenderGreeting(guest.gender)}
      </p>

      {/* 5. Couple name */}
      <h2
        className={`mt-2 text-5xl font-bold leading-tight ${headingFontClass}`}
        style={{ color: coupleNameColor }}
      >
        {event.coupleName}
      </h2>

      {/* 6. Floral divider */}
      <FloralDivider color={accentColor} />

      {/* 7. Event details card */}
      <div
        className="mx-auto max-w-sm rounded-2xl border p-6"
        style={{
          borderColor: `${accentColor}33`,
          background: 'linear-gradient(135deg, #f0fafa 0%, #ffffff 100%)',
        }}
      >
        <div className="flex flex-col gap-4">
          <div className="flex items-center justify-center gap-3" style={{ color: detailsColor }}>
            <Calendar className="w-5 h-5 shrink-0" style={{ color: accentColor }} />
            <span className="font-medium">{formatDate(event.date)}</span>
          </div>
          <div className="flex items-center justify-center gap-3" style={{ color: detailsColor }}>
            <Clock className="w-5 h-5 shrink-0" style={{ color: accentColor }} />
            <span>{event.time}</span>
          </div>
          <div className="flex items-center justify-center gap-3" style={{ color: detailsColor }}>
            <MapPin className="w-5 h-5 shrink-0" style={{ color: accentColor }} />
            <span>{event.venue}</span>
          </div>
        </div>
      </div>

      {/* 8. Welcome message */}
      {event.welcomeMessage && (
        <p
          className="mx-auto mt-5 max-w-sm text-sm italic leading-relaxed"
          style={{ color: detailsColor }}
        >
          {event.welcomeMessage}
        </p>
      )}

      {/* 9. Invitation image */}
      {event.invitationImageBase64 && (
        <div className="mt-6 w-full overflow-hidden rounded-2xl shadow-md">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={event.invitationImageBase64}
            alt="הזמנה לחתונה"
            className="w-full object-contain"
            style={{ maxHeight: '85vh' }}
          />
        </div>
      )}

      {/* 10. RSVP deadline */}
      <p className="mt-6 text-sm" style={{ color: detailsColor }}>
        נשמח לאשרך עד {formatDate(event.rsvpDeadline)}
      </p>
    </div>
  );
}
