'use client';

import { useState, useEffect } from 'react';
import { Guest, GuestFormData } from '@/models/guest.model';
import { getGroups } from '@/services/groups.service';
import { DEFAULT_GROUP } from '@/lib/constants';
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

const defaultFields = {
  firstName: '',
  lastName: '',
  phone: '',
  group: DEFAULT_GROUP,
  plannedGuests: 1,
};

export default function GuestFormModal({ isOpen, onClose, guest, onSubmit }: GuestFormModalProps) {
  const [fields, setFields] = useState(defaultFields);
  const [errors, setErrors] = useState<FormErrors>({});
  const [loading, setLoading] = useState(false);
  const [groups, setGroups] = useState<string[]>([]);
  const [groupsLoading, setGroupsLoading] = useState(false);

  // Load groups from Firestore whenever the modal opens
  useEffect(() => {
    if (!isOpen) return;
    setGroupsLoading(true);
    getGroups()
      .then(setGroups)
      .catch(() => setGroups([DEFAULT_GROUP]))
      .finally(() => setGroupsLoading(false));
  }, [isOpen]);

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
        dietaryNeeds: [],
      });
      onClose();
    } catch {
      // Error shown via ViewModel error state in parent
    } finally {
      setLoading(false);
    }
  }

  // If the existing guest's group is not in the loaded list, add it as an option
  const groupOptions =
    fields.group && !groups.includes(fields.group)
      ? [...groups, fields.group]
      : groups;

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
            className="w-24 rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-navy-800 focus:ring-1 focus:ring-navy-800"
          />
          {errors.plannedGuests && (
            <p className="text-xs text-red-600">{errors.plannedGuests}</p>
          )}
        </div>

        {/* Group dropdown — dynamic from Firestore */}
        <div className="flex flex-col gap-1">
          <label className="text-sm font-medium text-gray-700">קבוצה</label>
          {groupsLoading ? (
            <div className="flex items-center gap-2 py-2">
              <div className="w-4 h-4 rounded-full border-2 border-navy-800 border-t-transparent animate-spin" />
              <span className="text-sm text-gray-400">טוען קבוצות...</span>
            </div>
          ) : (
            <select
              value={fields.group}
              onChange={(e) => setFields((p) => ({ ...p, group: e.target.value }))}
              className="rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-navy-800 focus:ring-1 focus:ring-navy-800"
            >
              {groupOptions.map((g) => (
                <option key={g} value={g}>{g}</option>
              ))}
            </select>
          )}
          {errors.group && <p className="text-xs text-red-600">{errors.group}</p>}
        </div>

        {/* Buttons */}
        <div className="flex justify-end gap-3 pt-2">
          <Button variant="secondary" type="button" onClick={onClose}>
            ביטול
          </Button>
          <Button type="submit" loading={loading}>
            שמור
          </Button>
        </div>
      </form>
    </Modal>
  );
}
