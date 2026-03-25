'use client';

import { useEffect, useRef, useState } from 'react';
import { Calendar, Clock, MapPin, Loader2, Upload } from 'lucide-react';
import { EventDetails } from '@/models/event.model';
import { useEventViewModel } from '@/viewmodels/useEventViewModel';
import { processInvitationFile } from '@/services/event.service';
import ImageCropModal from '@/components/admin/ImageCropModal';

function formatPreviewDate(dateStr: string): string {
  try {
    const d = new Date(dateStr);
    if (!isNaN(d.getTime())) {
      return d.toLocaleDateString('he-IL', { day: 'numeric', month: 'long', year: 'numeric' });
    }
  } catch {
    // fall through
  }
  return dateStr;
}

const EMPTY_FORM: EventDetails = {
  coupleName: '',
  brideFirstName: '',
  groomFirstName: '',
  date: '',
  time: '',
  venue: '',
  rsvpDeadline: '',
  welcomeMessage: '',
};

export default function SettingsPage() {
  const { eventDetails, loading, saving, saveSuccess, error, saveEventDetails } = useEventViewModel();
  const [form, setForm] = useState<EventDetails>(EMPTY_FORM);
  const [coupleNameManuallyEdited, setCoupleNameManuallyEdited] = useState(false);

  // Upload state
  const [isDragging, setIsDragging] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState('');
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [uploadedPreviewUrl, setUploadedPreviewUrl] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Crop modal state
  const [cropModalOpen, setCropModalOpen] = useState(false);
  const [rawImageForCrop, setRawImageForCrop] = useState<string | null>(null);

  // Initialize form when data loads
  useEffect(() => {
    if (eventDetails) {
      setForm(eventDetails);
    }
  }, [eventDetails]);

  // Auto-compute coupleName when bride/groom change (unless manually edited)
  useEffect(() => {
    if (!coupleNameManuallyEdited && (form.brideFirstName || form.groomFirstName)) {
      const auto = `${form.brideFirstName} ו${form.groomFirstName}`.trim();
      setForm(prev => ({ ...prev, coupleName: auto }));
    }
  }, [form.brideFirstName, form.groomFirstName, coupleNameManuallyEdited]);

  function handleChange(field: keyof EventDetails, value: string) {
    setForm(prev => ({ ...prev, [field]: value }));
    if (field === 'coupleName') setCoupleNameManuallyEdited(true);
    if (field === 'brideFirstName' || field === 'groomFirstName') {
      setCoupleNameManuallyEdited(false);
    }
  }

  function handleStyleChange(
    field: keyof NonNullable<EventDetails['inviteStyle']>,
    value: string,
  ) {
    setForm(prev => ({
      ...prev,
      inviteStyle: {
        ...prev.inviteStyle,
        [field]: value,
      } as NonNullable<EventDetails['inviteStyle']>,
    }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    await saveEventDetails(form);
  }

  async function processFile(file: File) {
    const maxSize = 10 * 1024 * 1024;
    if (file.size > maxSize) {
      setUploadError('הקובץ גדול מדי — מקסימום 10MB');
      return;
    }
    setUploading(true);
    setUploadError(null);
    try {
      setUploadProgress(
        file.type === 'application/pdf' ? 'ממיר PDF לתמונה...' : 'מעבד תמונה...',
      );
      const { base64 } = await processInvitationFile(file);
      setRawImageForCrop(base64);
      setCropModalOpen(true);
    } catch {
      setUploadError('שגיאה בעיבוד הקובץ, נסי שנית');
    } finally {
      setUploading(false);
      setUploadProgress('');
    }
  }

  function handleCropConfirm(croppedBase64: string) {
    setUploadedPreviewUrl(croppedBase64);
    setForm(prev => ({ ...prev, invitationImageBase64: croppedBase64 }));
    setCropModalOpen(false);
    setRawImageForCrop(null);
  }

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) processFile(file);
  }

  function handleFileDrop(e: React.DragEvent) {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) processFile(file);
  }

  function openCropForCurrent() {
    const src = uploadedPreviewUrl ?? form.invitationImageBase64;
    if (src) {
      setRawImageForCrop(src);
      setCropModalOpen(true);
    }
  }

  function handleDeleteImage() {
    setUploadedPreviewUrl(null);
    setForm(prev => ({ ...prev, invitationImageBase64: undefined }));
    setRawImageForCrop(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  }

  const inputClass =
    'w-full rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-teal-300 focus:border-teal-400 transition-colors';
  const labelClass = 'block text-sm font-medium text-gray-700 mb-1';

  // Preview style vars (live-updating)
  const previewAccentColor = form.inviteStyle?.accentColor ?? '#0d9488';
  const previewCoupleNameColor = form.inviteStyle?.coupleNameColor ?? '#1e3a5f';
  const previewDetailsColor = form.inviteStyle?.detailsColor ?? '#374151';
  const previewHeadingFontClass =
    form.inviteStyle?.headingFont === 'sans'
      ? 'font-sans'
      : form.inviteStyle?.headingFont === 'elegant'
        ? 'font-serif italic'
        : 'font-serif';

  if (loading) {
    return (
      <div className="flex items-center justify-center py-24">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-teal-500 border-t-transparent" />
      </div>
    );
  }

  return (
    <div>
      {/* Page title */}
      <div className="mb-8">
        <h1 className="font-serif text-3xl font-bold" style={{ color: '#1e3a5f' }}>
          הגדרות אירוע
        </h1>
        <div
          className="mt-2 h-1 w-16 rounded-full"
          style={{ background: 'linear-gradient(90deg, #0d9488, #06b6d4)' }}
        />
      </div>

      {/* Main grid: form (3/5) + preview (2/5) */}
      <div className="grid gap-6 lg:grid-cols-5">
        {/* Form card */}
        <div
          className="lg:col-span-3 rounded-2xl border border-gray-100 bg-white p-6 sm:p-8"
          style={{ boxShadow: '0 1px 3px rgba(0,0,0,0.08), 0 4px 16px rgba(13,148,136,0.06)' }}
        >
          <form onSubmit={handleSubmit} className="flex flex-col gap-5">
            {/* Names row */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className={labelClass}>שם הכלה</label>
                <input
                  className={inputClass}
                  value={form.brideFirstName}
                  onChange={e => handleChange('brideFirstName', e.target.value)}
                  placeholder="מעיין"
                />
              </div>
              <div>
                <label className={labelClass}>שם החתן</label>
                <input
                  className={inputClass}
                  value={form.groomFirstName}
                  onChange={e => handleChange('groomFirstName', e.target.value)}
                  placeholder="אורי"
                />
              </div>
            </div>

            {/* Couple name */}
            <div>
              <label className={labelClass}>
                שם הזוג המלא
                <span className="ms-1 text-xs font-normal text-gray-400">
                  (מחושב אוטומטית, ניתן לעריכה)
                </span>
              </label>
              <input
                className={inputClass}
                value={form.coupleName}
                onChange={e => handleChange('coupleName', e.target.value)}
                placeholder="מעיין ואורי"
              />
            </div>

            {/* Date + time row */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className={labelClass}>תאריך האירוע</label>
                <input
                  type="date"
                  className={inputClass}
                  value={form.date}
                  onChange={e => handleChange('date', e.target.value)}
                />
              </div>
              <div>
                <label className={labelClass}>שעת האירוע</label>
                <input
                  type="time"
                  className={inputClass}
                  value={form.time}
                  onChange={e => handleChange('time', e.target.value)}
                />
              </div>
            </div>

            {/* Venue */}
            <div>
              <label className={labelClass}>מקום האירוע</label>
              <input
                className={inputClass}
                value={form.venue}
                onChange={e => handleChange('venue', e.target.value)}
                placeholder="אולם האירועים, תל אביב"
              />
            </div>

            {/* RSVP deadline */}
            <div>
              <label className={labelClass}>תאריך אחרון לאישור הגעה</label>
              <input
                type="date"
                className={inputClass}
                value={form.rsvpDeadline}
                onChange={e => handleChange('rsvpDeadline', e.target.value)}
              />
            </div>

            {/* Welcome message */}
            <div>
              <label className={labelClass}>
                הודעה אישית להזמנה
                <span className="ms-1 text-xs font-normal text-gray-400">(אופציונלי)</span>
              </label>
              <textarea
                className={`${inputClass} resize-none`}
                rows={3}
                maxLength={200}
                value={form.welcomeMessage ?? ''}
                onChange={e => handleChange('welcomeMessage', e.target.value)}
                placeholder="הודעה אישית שתופיע בהזמנה..."
              />
              <p className="mt-1 text-end text-xs text-gray-400">
                {(form.welcomeMessage ?? '').length}/200
              </p>
            </div>

            {/* Invitation image upload */}
            <div>
              <label className={labelClass}>
                תמונת ההזמנה
                <span className="ms-1 text-xs font-normal text-gray-400">
                  (PNG / JPG / PDF — יוצג בדף ההזמנה של האורח)
                </span>
              </label>

              {(form.invitationImageBase64 || uploadedPreviewUrl) && (
                <div className="mb-3">
                  <div className="group relative overflow-hidden rounded-xl border border-gray-200">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={uploadedPreviewUrl ?? (form.invitationImageBase64 as string)}
                      alt="הזמנה"
                      className="max-h-64 w-full object-contain"
                    />
                    {/* Hover overlay — desktop */}
                    <div className="absolute inset-0 flex items-center justify-center gap-3 bg-black/40 opacity-0 transition-opacity duration-200 group-hover:opacity-100">
                      <button
                        type="button"
                        onClick={openCropForCurrent}
                        className="flex items-center gap-1.5 rounded-xl bg-white px-4 py-2 text-sm font-medium text-gray-800 shadow transition-colors hover:bg-gray-50"
                      >
                        ✂️ חתוך תמונה
                      </button>
                      <button
                        type="button"
                        onClick={handleDeleteImage}
                        className="flex items-center gap-1.5 rounded-xl bg-red-500 px-4 py-2 text-sm font-medium text-white shadow transition-colors hover:bg-red-600"
                      >
                        🗑️ מחק תמונה
                      </button>
                    </div>
                  </div>
                  {/* Mobile fallback buttons (touch has no hover) */}
                  <div className="mt-2 flex gap-2 sm:hidden">
                    <button
                      type="button"
                      onClick={openCropForCurrent}
                      className="flex-1 rounded-xl border border-teal-200 py-2 text-sm text-teal-600 hover:bg-teal-50"
                    >
                      ✂️ חתוך
                    </button>
                    <button
                      type="button"
                      onClick={handleDeleteImage}
                      className="flex-1 rounded-xl border border-red-200 py-2 text-sm text-red-500 hover:bg-red-50"
                    >
                      🗑️ מחק
                    </button>
                  </div>
                </div>
              )}

              <div
                className={`relative flex cursor-pointer flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed p-6 text-center transition-colors ${
                  isDragging
                    ? 'border-teal-400 bg-teal-50'
                    : 'border-gray-200 hover:border-teal-300 hover:bg-teal-50/30'
                }`}
                onDragOver={e => {
                  e.preventDefault();
                  setIsDragging(true);
                }}
                onDragLeave={() => setIsDragging(false)}
                onDrop={handleFileDrop}
                onClick={() => fileInputRef.current?.click()}
              >
                <Upload className="h-6 w-6 text-teal-400" />
                <p className="text-sm text-gray-600">
                  גרור קובץ לכאן או{' '}
                  <span className="font-medium text-teal-600">לחץ לבחירה</span>
                </p>
                <p className="text-xs text-gray-400">PNG, JPG, PDF — עד 10MB</p>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/png,image/jpeg,application/pdf"
                  className="hidden"
                  onChange={handleFileChange}
                />
              </div>

              {uploading && (
                <div className="mt-2 flex items-center gap-2 text-sm text-teal-600">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  {uploadProgress}
                </div>
              )}
              {uploadError && (
                <p className="mt-1 text-xs text-red-500">{uploadError}</p>
              )}
            </div>

            {/* Error */}
            {error && (
              <div className="rounded-xl border border-red-100 bg-red-50 px-4 py-3 text-center text-sm text-red-700">
                {error}
              </div>
            )}

            {/* Success toast */}
            {saveSuccess && (
              <div className="rounded-xl border border-teal-200 bg-teal-50 px-4 py-3 text-center text-sm font-medium text-teal-800">
                הפרטים נשמרו בהצלחה ✓
              </div>
            )}

            {/* Save button */}
            <button
              type="submit"
              disabled={saving}
              className="mt-1 flex w-full items-center justify-center gap-2 rounded-xl py-3 text-sm font-semibold text-white transition-all duration-200 disabled:opacity-60"
              style={{ background: 'linear-gradient(135deg, #0d9488, #06b6d4)' }}
            >
              {saving ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  שומר...
                </>
              ) : (
                'שמור שינויים'
              )}
            </button>
          </form>
        </div>

        {/* Preview card */}
        <div
          className="lg:col-span-2 rounded-2xl border border-gray-100 bg-white p-6"
          style={{ boxShadow: '0 1px 3px rgba(0,0,0,0.08), 0 4px 16px rgba(13,148,136,0.06)' }}
        >
          <h2 className="mb-4 text-sm font-semibold uppercase tracking-wide text-gray-500">
            תצוגה מקדימה של ההזמנה
          </h2>

          <div className="text-center">
            <p
              className="text-xs uppercase tracking-[0.3em] font-sans"
              style={{ color: previewAccentColor }}
            >
              שמחים להזמין את
            </p>
            <h3
              className={`mt-3 text-2xl font-bold leading-tight ${previewHeadingFontClass}`}
              style={{ color: previewCoupleNameColor }}
            >
              {form.coupleName || 'שם הזוג'}
            </h3>
            <div
              className="mx-auto mt-3 h-0.5 w-14 rounded-full"
              style={{
                background: `linear-gradient(90deg, ${previewAccentColor}, ${previewAccentColor}88)`,
              }}
            />

            <div
              className="mx-auto mt-5 max-w-xs rounded-xl border p-4"
              style={{
                borderColor: `${previewAccentColor}33`,
                background: 'linear-gradient(135deg, #f0fafa 0%, #ffffff 100%)',
              }}
            >
              <div className="flex flex-col gap-3 text-sm">
                <div
                  className="flex items-center justify-center gap-2"
                  style={{ color: previewDetailsColor }}
                >
                  <Calendar className="h-4 w-4 shrink-0" style={{ color: previewAccentColor }} />
                  <span>{form.date ? formatPreviewDate(form.date) : 'תאריך האירוע'}</span>
                </div>
                <div
                  className="flex items-center justify-center gap-2"
                  style={{ color: previewDetailsColor }}
                >
                  <Clock className="h-4 w-4 shrink-0" style={{ color: previewAccentColor }} />
                  <span>{form.time || 'שעת האירוע'}</span>
                </div>
                <div
                  className="flex items-center justify-center gap-2"
                  style={{ color: previewDetailsColor }}
                >
                  <MapPin className="h-4 w-4 shrink-0" style={{ color: previewAccentColor }} />
                  <span>{form.venue || 'מקום האירוע'}</span>
                </div>
              </div>
            </div>

            {form.welcomeMessage && (
              <p
                className="mt-4 text-sm italic leading-relaxed"
                style={{ color: previewDetailsColor }}
              >
                {form.welcomeMessage}
              </p>
            )}

            {(uploadedPreviewUrl || form.invitationImageBase64) && (
              <div className="mt-4 overflow-hidden rounded-xl border border-gray-100">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={uploadedPreviewUrl ?? (form.invitationImageBase64 as string)}
                  alt="תצוגה מקדימה"
                  className="max-h-48 w-full object-contain"
                />
              </div>
            )}

            {form.rsvpDeadline && (
              <p className="mt-3 text-xs" style={{ color: previewDetailsColor }}>
                נשמח לאשרך עד {formatPreviewDate(form.rsvpDeadline)}
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Style section */}
      <div
        className="mt-6 rounded-2xl border border-gray-100 bg-white p-6"
        style={{ boxShadow: '0 1px 3px rgba(0,0,0,0.08)' }}
      >
        <h2 className="mb-5 text-lg font-bold text-gray-800">🎨 עיצוב ההזמנה</h2>

        {/* Color pickers */}
        <div className="mb-5 grid grid-cols-2 gap-4 sm:grid-cols-4">
          {([
            { field: 'guestNameColor', label: 'צבע שם האורח', default: '#1e3a5f' },
            { field: 'coupleNameColor', label: 'צבע שם הזוג', default: '#1e3a5f' },
            { field: 'accentColor', label: 'צבע הדגשה', default: '#0d9488' },
            { field: 'detailsColor', label: 'צבע פרטים', default: '#374151' },
          ] as { field: keyof NonNullable<EventDetails['inviteStyle']>; label: string; default: string }[]).map(
            ({ field, label, default: def }) => (
              <div key={field}>
                <label className={labelClass}>{label}</label>
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    value={
                      (form.inviteStyle?.[field] as string | undefined) ?? def
                    }
                    onChange={e => handleStyleChange(field, e.target.value)}
                    className="h-10 w-10 cursor-pointer rounded-lg border border-gray-200"
                  />
                  <span className="text-xs text-gray-500">
                    {(form.inviteStyle?.[field] as string | undefined) ?? def}
                  </span>
                </div>
              </div>
            ),
          )}
        </div>

        {/* Font selector */}
        <div>
          <label className={labelClass}>גופן כותרות</label>
          <div className="flex gap-2">
            {([
              { value: 'serif', label: 'קלאסי', fontClass: 'font-serif' },
              { value: 'sans', label: 'מודרני', fontClass: 'font-sans' },
              { value: 'elegant', label: 'אלגנטי', fontClass: 'font-serif italic' },
            ] as { value: NonNullable<EventDetails['inviteStyle']>['headingFont']; label: string; fontClass: string }[]).map(
              ({ value, label, fontClass }) => (
                <button
                  key={value}
                  type="button"
                  onClick={() => handleStyleChange('headingFont', value as string)}
                  className={`flex-1 rounded-xl border px-3 py-2 text-sm transition-all ${
                    (form.inviteStyle?.headingFont ?? 'serif') === value
                      ? 'border-teal-400 bg-teal-50 font-medium text-teal-700'
                      : 'border-gray-200 text-gray-600 hover:border-teal-200'
                  }`}
                >
                  <div className={`text-lg ${fontClass}`}>Aa</div>
                  <div>{label}</div>
                </button>
              ),
            )}
          </div>
        </div>
      </div>

      {/* Crop modal */}
      {cropModalOpen && rawImageForCrop && (
        <ImageCropModal
          imageSrc={rawImageForCrop}
          onConfirm={handleCropConfirm}
          onCancel={() => {
            setCropModalOpen(false);
            setRawImageForCrop(null);
          }}
        />
      )}
    </div>
  );
}
