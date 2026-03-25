'use client';

import { useState, useEffect } from 'react';
import { Guest, GuestFormData } from '@/models/guest.model';
import { DEFAULT_GROUP } from '@/lib/constants';
import { useGroups } from '@/lib/GroupsContext';
import Modal from '@/components/ui/Modal';
import Input from '@/components/ui/Input';
import Button from '@/components/ui/Button';

interface GuestFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  guest?: Guest;
  onSubmit: (data: GuestFormData) => Promise<void>;
}

interface FormErrors {
  firstName?: string;
  lastName?: string;
  plannedGuests?: string;
  group?: string;
}

type GenderType = 'male' | 'female' | 'unspecified';

const defaultFields: {
  firstName: string;
  lastName: string;
  phone: string;
  group: string;
  plannedGuests: number;
  gender: GenderType;
} = {
  firstName: '',
  lastName: '',
  phone: '',
  group: DEFAULT_GROUP,
  plannedGuests: 1,
  gender: 'unspecified',
};

export default function GuestFormModal({ isOpen, onClose, guest, onSubmit }: GuestFormModalProps) {
  const [fields, setFields] = useState(defaultFields);
  const [errors, setErrors] = useState<FormErrors>({});
  const [loading, setLoading] = useState(false);
  const { groups: groupEntries } = useGroups();

  // Populate fields when editing an existing guest
  useEffect(() => {
    if (!isOpen) return;
    if (guest) {
      setFields({
        firstName: guest.firstName,
        lastName: guest.lastName,
        phone: guest.phone,
        group: guest.group,
        plannedGuests: guest.plannedGuests,
        gender: guest.gender ?? 'unspecified',
      });
    } else {
      setFields(defaultFields);
    }
    setErrors({});
  }, [guest, isOpen]);

  function validate(): boolean {
    const next: FormErrors = {};
    if (!fields.firstName.trim()) next.firstName = 'שם פרטי הוא שדה חובה';
    if (!fields.lastName.trim()) next.lastName = 'שם משפחה הוא שדה חובה';
    if (fields.plannedGuests < 1) next.plannedGuests = 'מספר המוזמנים חייב להיות לפחות 1';
    if (!fields.group) next.group = 'יש לבחור קבוצה';
    setErrors(next);
    return Object.keys(next).length === 0;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!validate()) return;
    setLoading(true);
    try {
      await onSubmit({
        firstName: fields.firstName.trim(),
        lastName: fields.lastName.trim(),
        phone: fields.phone.trim(),
        group: fields.group,
        plannedGuests: fields.plannedGuests,
        gender: fields.gender,
        dietaryNeeds: [],
      });
      onClose();
    } catch {
      // Error shown via ViewModel error state in parent
    } finally {
      setLoading(false);
    }
  }

  // Names from context; if guest's group isn't in the list, add it as a fallback option
  const groupNames = groupEntries.map((g) => g.name);
  const groupOptions =
    fields.group && !groupNames.includes(fields.group)
      ? [...groupNames, fields.group]
      : groupNames;

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={guest ? 'עריכת אורח' : 'הוספת אורח'}>
      <form onSubmit={handleSubmit} className="flex flex-col gap-4" noValidate>
        {/* Name row */}
        <div className="grid grid-cols-2 gap-3">
          <Input
            label="שם פרטי"
            value={fields.firstName}
            onChange={(e) => setFields((p) => ({ ...p, firstName: e.target.value }))}
            error={errors.firstName}
            placeholder="ישראל"
          />
          <Input
            label="שם משפחה"
            value={fields.lastName}
            onChange={(e) => setFields((p) => ({ ...p, lastName: e.target.value }))}
            error={errors.lastName}
            placeholder="ישראלי"
          />
        </div>

        {/* Gender (פנייה) */}
        <div className="flex flex-col gap-1">
          <label className="text-sm font-medium text-gray-700">פנייה</label>
          <div className="flex gap-2">
            {([
              { value: 'male', label: 'זכר' },
              { value: 'female', label: 'נקבה' },
              { value: 'unspecified', label: 'לא מצוין' },
            ] as { value: GenderType; label: string }[]).map(({ value, label }) => (
              <button
                key={value}
                type="button"
                onClick={() => setFields(p => ({ ...p, gender: value }))}
                className={`flex-1 rounded-full border py-1.5 text-sm font-medium transition-all ${
                  fields.gender === value
                    ? 'border-teal-500 bg-teal-500 text-white'
                    : 'border-gray-200 bg-white text-gray-600 hover:border-teal-300'
                }`}
              >
                {label}
              </button>
            ))}
          </div>
        </div>

        {/* Phone */}
        <Input
          label="מספר טלפון"
          type="tel"
          value={fields.phone}
          onChange={(e) => setFields((p) => ({ ...p, phone: e.target.value }))}
          placeholder="050-0000000"
        />

        {/* Planned guests */}
        <div className="flex flex-col gap-1">
          <label className="text-sm font-medium text-gray-700">מספר מוזמנים מתוכנן</label>
          <input
            type="number"
            min={1}
            max={30}
            value={fields.plannedGuests}
            onChange={(e) =>
              setFields((p) => ({ ...p, plannedGuests: Math.max(1, Number(e.target.value)) }))
            }
            className="w-24 rounded-xl border border-gray-200 px-3 py-2 text-sm outline-none focus:border-teal-400 focus:ring-2 focus:ring-teal-100 transition-all duration-200"
          />
          {errors.plannedGuests && (
            <p className="text-xs text-red-600">{errors.plannedGuests}</p>
          )}
        </div>

        {/* Group dropdown — dynamic from Firestore */}
        <div className="flex flex-col gap-1">
          <label className="text-sm font-medium text-gray-700">קבוצה</label>
          <select
            value={fields.group}
            onChange={(e) => setFields((p) => ({ ...p, group: e.target.value }))}
            className="rounded-xl border border-gray-200 px-3 py-2 text-sm outline-none focus:border-teal-400 focus:ring-2 focus:ring-teal-100 transition-all duration-200"
          >
            {groupOptions.map((g) => (
              <option key={g} value={g}>{g}</option>
            ))}
          </select>
          {errors.group && <p className="text-xs text-red-600">{errors.group}</p>}
        </div>

        {/* Buttons */}
        <div className="flex flex-col gap-2 pt-2">
          <Button type="submit" loading={loading} className="w-full">
            שמור
          </Button>
          <Button variant="ghost" type="button" onClick={onClose} className="w-full">
            ביטול
          </Button>
        </div>
      </form>
    </Modal>
  );
}
