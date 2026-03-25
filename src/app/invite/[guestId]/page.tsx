import type { Metadata } from 'next';
import { getGuestById } from '@/services/guests.service';
import { getEventDetails } from '@/services/event.service';
import InviteClient from './InviteClient';

export async function generateMetadata(
  { params }: { params: Promise<{ guestId: string }> }
): Promise<Metadata> {
  try {
    const { guestId } = await params;
    const [guest, event] = await Promise.all([
      getGuestById(guestId),
      getEventDetails(),
    ]);

    if (!guest) {
      return {
        title: 'הזמנה לחתונה',
        description: 'לחצו לאישור הגעה',
      };
    }

    const guestName = `${guest.firstName} ${guest.lastName}`;
    const title = `${guestName} — הוזמנת לחתונה של ${event.coupleName}`;
    const description = `📅 ${event.date} | 🕖 ${event.time} | 📍 ${event.venue} — לחצו לאישור הגעה`;
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL ?? 'https://weddinvite-ten.vercel.app';

    return {
      title,
      description,
      openGraph: {
        title,
        description,
        type: 'website',
        locale: 'he_IL',
        url: `${baseUrl}/invite/${guestId}`,
        siteName: `חתונת ${event.coupleName}`,
        images: [
          {
            url: `${baseUrl}/api/og`,
            width: 1200,
            height: 630,
            alt: `הזמנה לחתונה של ${event.coupleName}`,
          },
        ],
      },
      twitter: {
        card: 'summary_large_image',
        title,
        description,
        images: [`${baseUrl}/api/og`],
      },
    };
  } catch {
    return {
      title: 'הזמנה לחתונה',
      description: 'לחצו לאישור הגעה',
    };
  }
}

export default async function InvitePage(
  { params }: { params: Promise<{ guestId: string }> }
) {
  const { guestId } = await params;
  return <InviteClient guestId={guestId} />;
}
