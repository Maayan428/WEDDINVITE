'use client';

import { useRef, useState } from 'react';
import { Upload, FileDown, X, CheckCircle2, AlertCircle, AlertTriangle } from 'lucide-react';
import { importGuestsFromExcel, downloadExcelTemplate } from '@/services/excel.service';
import { GuestFormData } from '@/models/guest.model';
import Button from '@/components/ui/Button';

interface ImportExcelButtonProps {
  addGuest: (data: GuestFormData) => Promise<void>;
  onSuccess: () => void;
}

type ImportPhase =
  | { name: 'idle' }
  | { name: 'parsing' }
  | { name: 'previewing'; guests: GuestFormData[]; warnings: string[]; parseError?: string }
  | { name: 'importing'; current: number; total: number; errors: string[] }
  | { name: 'done'; imported: number; errors: string[] };

const PREVIEW_ROWS = 5;

export default function ImportExcelButton({ addGuest, onSuccess }: ImportExcelButtonProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [phase, setPhase] = useState<ImportPhase>({ name: 'idle' });

  function resetToIdle() {
    setPhase({ name: 'idle' });
    if (inputRef.current) inputRef.current.value = '';
  }

  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setPhase({ name: 'parsing' });
    try {
      const { guests, warnings } = await importGuestsFromExcel(file);
      setPhase({ name: 'previewing', guests, warnings });
    } catch (err) {
      setPhase({
        name: 'previewing',
        guests: [],
        warnings: [],
        parseError: err instanceof Error ? err.message : 'שגיאה בקריאת הקובץ',
      });
    }
  }

  async function handleImportAll(guests: GuestFormData[]) {
    setPhase({ name: 'importing', current: 0, total: guests.length, errors: [] });
    const errors: string[] = [];

    for (let i = 0; i < guests.length; i++) {
      setPhase({ name: 'importing', current: i + 1, total: guests.length, errors });
      try {
        await addGuest(guests[i]);
      } catch {
        errors.push(`שורה ${i + 1}: ${guests[i].firstName} ${guests[i].lastName} — שגיאה בשמירה`);
      }
    }

    setPhase({ name: 'done', imported: guests.length - errors.length, errors });
    onSuccess();
  }

  const isModalOpen =
    phase.name === 'parsing' ||
    phase.name === 'previewing' ||
    phase.name === 'importing' ||
    phase.name === 'done';

  return (
    <>
      {/* Hidden file input */}
      <input
        ref={inputRef}
        type="file"
        accept=".xlsx,.xls"
        className="hidden"
        onChange={handleFileChange}
      />

      {/* Trigger buttons */}
      <div className="flex items-center gap-2">
        <Button
          variant="secondary"
          loading={phase.name === 'parsing'}
          onClick={() => inputRef.current?.click()}
        >
          <Upload className="w-4 h-4" />
          ייבוא מאקסל
        </Button>
        <button
          type="button"
          onClick={downloadExcelTemplate}
          title="הורד תבנית Excel"
          className="flex items-center gap-1.5 rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-600 hover:bg-gray-50 hover:text-navy-800 transition-colors"
        >
          <FileDown className="w-4 h-4" />
          <span className="hidden sm:inline">הורד תבנית</span>
        </button>
      </div>

      {/* Modal overlay */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={phase.name === 'previewing' || phase.name === 'done' ? resetToIdle : undefined}
          />
          <div className="relative z-10 w-full max-w-2xl rounded-xl bg-white shadow-2xl">
            {/* Header */}
            <div className="flex items-center justify-between border-b border-gray-200 px-6 py-4">
              <h2 className="text-lg font-semibold text-gray-900">
                {phase.name === 'parsing'  && 'קורא קובץ...'}
                {phase.name === 'previewing' && (phase.parseError ? 'שגיאה בקריאת הקובץ' : 'תצוגה מקדימה')}
                {phase.name === 'importing' && 'מייבא אורחים...'}
                {phase.name === 'done'      && 'ייבוא הושלם'}
              </h2>
              {(phase.name === 'previewing' || phase.name === 'done') && (
                <button
                  type="button"
                  onClick={resetToIdle}
                  className="rounded-lg p-1.5 text-gray-500 hover:bg-gray-100 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              )}
            </div>

            <div className="p-6">
              {/* ── Parsing spinner ── */}
              {phase.name === 'parsing' && (
                <div className="flex items-center justify-center py-10">
                  <div className="w-8 h-8 rounded-full border-2 border-navy-800 border-t-transparent animate-spin" />
                </div>
              )}

              {/* ── Parse error ── */}
              {phase.name === 'previewing' && phase.parseError && (
                <div className="flex flex-col items-center gap-4 py-6 text-center">
                  <AlertCircle className="w-12 h-12 text-red-500" />
                  <p className="text-red-700 font-medium">{phase.parseError}</p>
                  <p className="text-sm text-gray-500">
                    ודאי שהקובץ מכיל עמודות: שם פרטי, שם משפחה, טלפון, מספר מוזמנים, קבוצה
                  </p>
                  <div className="flex gap-3">
                    <Button variant="secondary" onClick={resetToIdle}>סגור</Button>
                    <button
                      type="button"
                      onClick={downloadExcelTemplate}
                      className="flex items-center gap-1.5 rounded-lg bg-navy-800 px-4 py-2 text-sm text-white hover:bg-navy-900 transition-colors"
                    >
                      <FileDown className="w-4 h-4" />
                      הורד תבנית
                    </button>
                  </div>
                </div>
              )}

              {/* ── Preview table ── */}
              {phase.name === 'previewing' && !phase.parseError && (
                <>
                  <p className="mb-4 text-sm text-gray-600">
                    נמצאו <span className="font-semibold text-gray-900">{phase.guests.length}</span> אורחים לייבוא.
                    מוצגות {Math.min(PREVIEW_ROWS, phase.guests.length)} השורות הראשונות:
                  </p>

                  {/* Warnings banner */}
                  {phase.warnings.length > 0 && (
                    <div className="mb-4 flex items-start gap-2.5 rounded-lg border border-yellow-200 bg-yellow-50 px-4 py-3">
                      <AlertTriangle className="mt-0.5 w-4 h-4 flex-shrink-0 text-yellow-600" />
                      <p className="text-sm text-yellow-800">
                        שים לב: {phase.warnings.length} שורות שויכו ל&quot;לא שויך לקבוצה&quot; כי הקבוצה לא נמצאה במערכת
                      </p>
                    </div>
                  )}

                  <div className="overflow-hidden rounded-lg border border-gray-200 mb-5">
                    <table className="w-full text-sm">
                      <thead className="bg-gray-50 border-b border-gray-200">
                        <tr>
                          <th className="px-3 py-2 text-start font-semibold text-gray-700">שם פרטי</th>
                          <th className="px-3 py-2 text-start font-semibold text-gray-700">שם משפחה</th>
                          <th className="px-3 py-2 text-start font-semibold text-gray-700">טלפון</th>
                          <th className="px-3 py-2 text-start font-semibold text-gray-700">מוזמנים</th>
                          <th className="px-3 py-2 text-start font-semibold text-gray-700">קבוצה</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-100">
                        {phase.guests.slice(0, PREVIEW_ROWS).map((g, i) => (
                          <tr key={i} className="hover:bg-gray-50">
                            <td className="px-3 py-2 text-gray-900">{g.firstName}</td>
                            <td className="px-3 py-2 text-gray-900">{g.lastName}</td>
                            <td className="px-3 py-2 text-gray-600">{g.phone}</td>
                            <td className="px-3 py-2 text-gray-600">{g.plannedGuests}</td>
                            <td className="px-3 py-2 text-gray-600">{g.group}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  {phase.guests.length > PREVIEW_ROWS && (
                    <p className="mb-4 text-xs text-gray-500 text-center">
                      ועוד {phase.guests.length - PREVIEW_ROWS} אורחים נוספים...
                    </p>
                  )}

                  <div className="flex justify-end gap-3">
                    <Button variant="secondary" onClick={resetToIdle}>ביטול</Button>
                    <Button onClick={() => handleImportAll(phase.guests)}>
                      ייבא הכל ({phase.guests.length})
                    </Button>
                  </div>
                </>
              )}

              {/* ── Import progress ── */}
              {phase.name === 'importing' && (
                <div className="flex flex-col items-center gap-5 py-8">
                  <div className="w-10 h-10 rounded-full border-2 border-navy-800 border-t-transparent animate-spin" />
                  <p className="text-base font-medium text-gray-700">
                    מייבא... {phase.current}/{phase.total}
                  </p>
                  <div className="w-full max-w-xs rounded-full bg-gray-200 h-2">
                    <div
                      className="h-2 rounded-full bg-navy-800 transition-all duration-300"
                      style={{ width: `${(phase.current / phase.total) * 100}%` }}
                    />
                  </div>
                </div>
              )}

              {/* ── Done ── */}
              {phase.name === 'done' && (
                <div className="flex flex-col items-center gap-4 py-4 text-center">
                  <CheckCircle2 className="w-14 h-14 text-green-500" />
                  <p className="text-lg font-semibold text-gray-900">
                    יובאו {phase.imported} אורחים בהצלחה ✓
                  </p>

                  {phase.errors.length > 0 && (
                    <div className="w-full rounded-lg bg-red-50 p-4 text-start">
                      <p className="mb-2 text-sm font-semibold text-red-700">
                        {phase.errors.length} שגיאות:
                      </p>
                      <ul className="space-y-1">
                        {phase.errors.map((err, i) => (
                          <li key={i} className="text-xs text-red-600">{err}</li>
                        ))}
                      </ul>
                    </div>
                  )}

                  <Button onClick={resetToIdle}>סגור</Button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
