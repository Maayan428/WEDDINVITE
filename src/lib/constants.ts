export const APP_NAME = 'ניהול אורחי חתונה';

export const GROUP_COLORS = [
  '#0d9488', // teal
  '#3b82f6', // blue
  '#8b5cf6', // violet
  '#f59e0b', // amber
  '#f43f5e', // rose
  '#10b981', // emerald
  '#f97316', // orange
  '#06b6d4', // cyan
];

export const DEFAULT_GROUP_COLOR = '#9ca3af';

export const DEFAULT_GROUP = 'לא שויך לקבוצה';

export const GUESTS_COLLECTION = 'guests';

export const GUEST_GROUPS: string[] = [
  'משפחה',
  'חברים',
  'עבודה',
  'שכנים',
  'אחרים',
];

export const DIETARY_OPTIONS: string[] = [
  'צמחוני',
  'טבעוני',
  'ללא גלוטן',
  'ללא לקטוז',
  'כשר',
  'ללא אגוזים',
];

export const EXCEL_COLUMN_MAP: Record<string, keyof import('@/models/guest.model').Guest> = {
  'שם פרטי': 'firstName',
  'שם משפחה': 'lastName',
  'טלפון': 'phone',
  'קבוצה': 'group',
  'מוזמנים מתוכננים': 'plannedGuests',
};

export const DEFAULT_EVENT_DETAILS = {
  coupleName: 'רחל ודוד',
  date: '2025-08-15',
  time: '19:00',
  venue: 'אולם האירועים, תל אביב',
};
