'use client';

import * as XLSX from 'xlsx';
import { Guest, GuestFormData } from '@/models/guest.model';
import { getGroups } from '@/services/groups.service';
import { DEFAULT_GROUP } from '@/lib/constants';

// Maps every accepted header variant (lowercase, trimmed) → GuestFormData field
const HEADER_ALIASES: Record<string, keyof GuestFormData> = {
  'שם פרטי': 'firstName',
  'firstname': 'firstName',
  'first name': 'firstName',
  'שם משפחה': 'lastName',
  'lastname': 'lastName',
  'last name': 'lastName',
  'טלפון': 'phone',
  'phone': 'phone',
  'מספר טלפון': 'phone',
  'מספר מוזמנים': 'plannedGuests',
  'מוזמנים מתוכננים': 'plannedGuests',
  'plannedguests': 'plannedGuests',
  'planned guests': 'plannedGuests',
  'מוזמנים': 'plannedGuests',
  'קבוצה': 'group',
  'group': 'group',
};

// Hebrew column headers used in the template (order matters for display)
const TEMPLATE_HEADERS = ['שם פרטי', 'שם משפחה', 'טלפון', 'מספר מוזמנים', 'קבוצה'];

function normalizeHeader(h: string): string {
  return h.trim().toLowerCase();
}

export interface ImportResult {
  guests: GuestFormData[];
  warnings: string[];
}

export async function importGuestsFromExcel(file: File): Promise<ImportResult> {
  // Fetch valid groups first so we can validate each row
  const validGroups = await getGroups();

  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = (e) => {
      try {
        const workbook = XLSX.read(e.target?.result, { type: 'binary' });
        const sheet = workbook.Sheets[workbook.SheetNames[0]];

        const rawRows = XLSX.utils.sheet_to_json<Record<string, unknown>>(sheet, {
          defval: '',
          raw: false,
        });

        if (rawRows.length === 0) {
          throw new Error('הקובץ ריק — לא נמצאו שורות נתונים');
        }

        // Build column header → GuestFormData field mapping
        const firstRow = rawRows[0];
        const colMap = new Map<string, keyof GuestFormData>();
        for (const header of Object.keys(firstRow)) {
          const alias = HEADER_ALIASES[normalizeHeader(header)];
          if (alias) colMap.set(header, alias);
        }

        const hasFirstName = [...colMap.values()].includes('firstName');
        if (!hasFirstName) {
          throw new Error('לא נמצאה עמודת "שם פרטי" בקובץ. ודאי שהכותרות תואמות לתבנית.');
        }

        const guests: GuestFormData[] = [];
        const warnings: string[] = [];
        let rowNumber = 1; // 1-based data row counter (excludes header)

        for (const row of rawRows) {
          rowNumber++;
          const mapped: Partial<GuestFormData> = {};

          for (const [header, field] of colMap.entries()) {
            const val = String(row[header] ?? '').trim();
            if (val) {
              if (field === 'plannedGuests') {
                (mapped as Record<string, unknown>)[field] = Math.max(1, parseInt(val, 10) || 1);
              } else {
                (mapped as Record<string, unknown>)[field] = val;
              }
            }
          }

          // Skip rows with no name
          if (!mapped.firstName && !mapped.lastName) continue;

          // Validate / assign group
          let group = mapped.group?.trim() ?? '';
          if (!group) {
            group = DEFAULT_GROUP;
          } else if (!validGroups.includes(group)) {
            warnings.push(
              `שורה ${rowNumber}: קבוצה "${group}" לא נמצאה במערכת — שויך ל"${DEFAULT_GROUP}"`
            );
            group = DEFAULT_GROUP;
          }

          guests.push({
            firstName: mapped.firstName ?? '',
            lastName: mapped.lastName ?? '',
            phone: mapped.phone ?? '',
            group,
            plannedGuests: mapped.plannedGuests ?? 1,
            dietaryNeeds: [],
          });
        }

        if (guests.length === 0) {
          throw new Error('לא נמצאו אורחים תקינים בקובץ');
        }

        resolve({ guests, warnings });
      } catch (err) {
        reject(err instanceof Error ? err : new Error('שגיאה בפענוח קובץ האקסל'));
      }
    };

    reader.onerror = () => reject(new Error('שגיאה בקריאת הקובץ'));
    reader.readAsBinaryString(file);
  });
}

export function exportGuestsToExcel(guests: Guest[]): void {
  const statusLabel = (s: Guest['status']) =>
    s === 'confirmed' ? 'אישר הגעה' : s === 'declined' ? 'לא מגיע' : 'ממתין לתשובה';

  const fmtDate = (d: Date | undefined) =>
    d ? d.toLocaleDateString('he-IL', { day: '2-digit', month: '2-digit', year: 'numeric' }) : '';

  const fmtDietary = (g: Guest) => {
    const parts = g.dietaryNeeds.filter(Boolean);
    if (g.dietaryNote) parts.push(g.dietaryNote);
    return parts.join(', ');
  };

  const HEADERS = [
    'שם פרטי', 'שם משפחה', 'טלפון', 'קבוצה',
    'מוזמנים מתוכנן', 'סטטוס', 'מגיעים בפועל',
    'תזונה מיוחדת', 'ברכה אישית', 'תאריך עדכון',
  ];

  const rows = guests.map((g) => ({
    'שם פרטי':        g.firstName,
    'שם משפחה':       g.lastName,
    'טלפון':          g.phone,
    'קבוצה':          g.group,
    'מוזמנים מתוכנן': g.plannedGuests,
    'סטטוס':          statusLabel(g.status),
    'מגיעים בפועל':   g.actualGuests ?? '',
    'תזונה מיוחדת':   fmtDietary(g),
    'ברכה אישית':     g.personalMessage ?? '',
    'תאריך עדכון':    fmtDate(g.respondedAt),
  }));

  const sheet = XLSX.utils.json_to_sheet(rows, { header: HEADERS });

  // Auto-fit column widths based on max content length
  sheet['!cols'] = HEADERS.map((header) => {
    const maxLen = Math.max(
      header.length,
      ...rows.map((row) => String(row[header as keyof typeof row] ?? '').length),
    );
    return { wch: Math.min(maxLen + 2, 40) };
  });

  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, sheet, 'אורחים');

  const today = new Date().toISOString().split('T')[0];
  XLSX.writeFile(workbook, `אורחים_${today}.xlsx`);
}

export async function downloadExcelTemplate(): Promise<void> {
  const groups = await getGroups();
  const groupsList = groups.join(', ');

  // ── Main sheet ─────────────────────────────────────────────────────────────
  const exampleRow: Record<string, string | number> = {
    'שם פרטי': 'ישראל',
    'שם משפחה': 'ישראלי',
    'טלפון': '050-0000000',
    'מספר מוזמנים': 2,
    'קבוצה': groups[0] ?? DEFAULT_GROUP,
  };

  const mainSheet = XLSX.utils.json_to_sheet([exampleRow], { header: TEMPLATE_HEADERS });
  mainSheet['!cols'] = [...TEMPLATE_HEADERS.map(() => ({ wch: 20 })), { wch: 50 }];
  mainSheet['F1'] = { v: `← בחר מהרשימה: ${groupsList}`, t: 's' };

  // Best-effort: add Excel data validation for column E (SheetJS Pro feature;
  // silently ignored in SheetJS CE — the reference sheets below serve as fallback)
  (mainSheet as Record<string, unknown>)['!dataValidations'] = [
    {
      type: 'list',
      sqref: 'E2:E200',
      formula1: `"${groups.join(',')}"`,
      showDropDown: false,
      showErrorMessage: true,
      errorTitle: 'קבוצה לא תקינה',
      error: 'יש לבחור קבוצה מהרשימה בלבד',
    },
  ];

  // ── Groups reference sheet (one group per row) ──────────────────────────
  const groupRows = groups.map((g) => ({ 'קבוצות תקינות': g }));
  const groupSheet = XLSX.utils.json_to_sheet(groupRows);
  groupSheet['!cols'] = [{ wch: 22 }];

  // ── Instructions sheet ───────────────────────────────────────────────────
  const instructionsSheet = XLSX.utils.json_to_sheet([
    { הוראות: `קבוצות אפשריות: ${groupsList}` },
    { הוראות: 'מלא את עמודה E עם אחת מהקבוצות לעיל בלבד.' },
    { הוראות: 'שורות עם קבוצה לא מוכרת ישויכו אוטומטית ל"לא שויך לקבוצה".' },
  ]);
  instructionsSheet['!cols'] = [{ wch: 60 }];

  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, mainSheet, 'תבנית אורחים');
  XLSX.utils.book_append_sheet(workbook, groupSheet, 'קבוצות_תקינות');
  XLSX.utils.book_append_sheet(workbook, instructionsSheet, 'הוראות');
  XLSX.writeFile(workbook, 'תבנית_ייבוא_אורחים.xlsx');
}
