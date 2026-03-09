'use client';

import { Calendar, Clock, MapPin } from 'lucide-react';
import { Guest } from '@/models/guest.model';
import { EventDetails } from '@/models/event.model';

interface InvitationCardProps {
  guest: Guest;
  event: EventDetails;
}

function FloralDivider() {
  return (
    <div className="flex items-center justify-center gap-3 text-teal-400 my-7">
      <div className="h-px w-14 bg-gradient-to-r from-transparent to-teal-300" />
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
      <div className="h-px w-14 bg-gradient-to-l from-transparent to-teal-300" />
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

export default function InvitationCard({ guest, event }: InvitationCardProps) {
  return (
    <div className="text-center">
      {/* Top label */}
      <p className="text-xs uppercase tracking-[0.35em] text-teal-500 font-sans">
        הוזמנת לחתונה של
      </p>

      {/* Couple name */}
      <h1 className="mt-4 font-serif text-5xl font-bold leading-tight" style={{ color: '#1e3a5f' }}>
        {event.coupleName}
      </h1>

      {/* Teal rule */}
      <div
        className="mx-auto mt-5 h-0.5 w-20 rounded-full"
        style={{ background: 'linear-gradient(90deg, #0d9488, #06b6d4)' }}
      />

      {/* Guest name — personalized & prominent */}
      <p className="mt-6 text-sm text-gray-500 tracking-wide">שמחים להזמין את</p>
      <h2 className="mt-2 font-serif text-3xl font-semibold text-teal-700">
        {guest.firstName} {guest.lastName}
      </h2>

      <FloralDivider />

      {/* Event details card */}
      <div
        className="mx-auto max-w-sm rounded-2xl border p-6"
        style={{
          borderColor: 'rgba(13,148,136,0.2)',
          background: 'linear-gradient(135deg, #f0fafa 0%, #ffffff 100%)',
        }}
      >
        <div className="flex flex-col gap-4">
          <div className="flex items-center justify-center gap-3 text-gray-700">
            <Calendar className="w-5 h-5 text-teal-500 shrink-0" />
            <span className="font-medium">{formatDate(event.date)}</span>
          </div>
          <div className="flex items-center justify-center gap-3 text-gray-700">
            <Clock className="w-5 h-5 text-teal-500 shrink-0" />
            <span>{event.time}</span>
          </div>
          <div className="flex items-center justify-center gap-3 text-gray-700">
            <MapPin className="w-5 h-5 text-teal-500 shrink-0" />
            <span>{event.venue}</span>
          </div>
        </div>
      </div>

      <p className="mt-6 text-sm text-gray-500">
        נשמח לאשרך עד 30 יום לפני האירוע
      </p>
    </div>
  );
}
