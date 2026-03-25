import { doc, getDoc, setDoc } from 'firebase/firestore';
import { db } from '@/services/firebase.config';
import { DEFAULT_GROUP, DEFAULT_GROUP_COLOR, GROUP_COLORS } from '@/lib/constants';

export interface GroupEntry {
  name: string;
  color: string; // hex from GROUP_COLORS
}

const BASE_DEFAULT_GROUPS = ['משפחה', 'חברים', 'עבודה', 'שכנים', 'אחרים'];

function ensureDefaultAtEnd(groups: GroupEntry[]): GroupEntry[] {
  const without = groups.filter((g) => g.name !== DEFAULT_GROUP);
  return [...without, { name: DEFAULT_GROUP, color: DEFAULT_GROUP_COLOR }];
}

function toGroupEntries(names: string[]): GroupEntry[] {
  return names.map((name, i) => ({
    name,
    color: name === DEFAULT_GROUP ? DEFAULT_GROUP_COLOR : GROUP_COLORS[i % GROUP_COLORS.length],
  }));
}

const DEFAULT_GROUPS: GroupEntry[] = ensureDefaultAtEnd(
  BASE_DEFAULT_GROUPS.map((name, i) => ({ name, color: GROUP_COLORS[i % GROUP_COLORS.length] })),
);

export async function getGroups(): Promise<GroupEntry[]> {
  const ref = doc(db, 'settings', 'groups');
  const snap = await getDoc(ref);
  if (!snap.exists()) {
    await setDoc(ref, { groups: DEFAULT_GROUPS });
    return DEFAULT_GROUPS;
  }
  const data = snap.data();
  if (!Array.isArray(data.groups)) return DEFAULT_GROUPS;

  // Migrate old string[] format automatically
  if (data.groups.length > 0 && typeof data.groups[0] === 'string') {
    const migrated = ensureDefaultAtEnd(toGroupEntries(data.groups as string[]));
    await setDoc(ref, { groups: migrated });
    return migrated;
  }

  return ensureDefaultAtEnd(data.groups as GroupEntry[]);
}

export async function saveGroups(groups: GroupEntry[]): Promise<void> {
  const ref = doc(db, 'settings', 'groups');
  await setDoc(ref, { groups: ensureDefaultAtEnd(groups) });
}

/** Returns the first color from GROUP_COLORS not already in use, cycling if all are taken. */
export function nextAvailableColor(usedColors: string[]): string {
  const unused = GROUP_COLORS.find((c) => !usedColors.includes(c));
  return unused ?? GROUP_COLORS[usedColors.length % GROUP_COLORS.length];
}
