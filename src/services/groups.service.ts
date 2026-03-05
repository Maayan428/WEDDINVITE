import { doc, getDoc, setDoc } from 'firebase/firestore';
import { db } from '@/services/firebase.config';
import { DEFAULT_GROUP } from '@/lib/constants';

const BASE_DEFAULT_GROUPS = ['משפחה', 'חברים', 'עבודה', 'שכנים', 'אחרים'];

// DEFAULT_GROUP is always kept as the last entry
function ensureDefaultAtEnd(groups: string[]): string[] {
  const without = groups.filter((g) => g !== DEFAULT_GROUP);
  return [...without, DEFAULT_GROUP];
}

const DEFAULT_GROUPS = ensureDefaultAtEnd(BASE_DEFAULT_GROUPS);

export async function getGroups(): Promise<string[]> {
  const ref = doc(db, 'settings', 'groups');
  const snap = await getDoc(ref);
  if (!snap.exists()) {
    await setDoc(ref, { groups: DEFAULT_GROUPS });
    return DEFAULT_GROUPS;
  }
  const data = snap.data();
  const raw = Array.isArray(data.groups) ? (data.groups as string[]) : DEFAULT_GROUPS;
  return ensureDefaultAtEnd(raw);
}

export async function saveGroups(groups: string[]): Promise<void> {
  const ref = doc(db, 'settings', 'groups');
  await setDoc(ref, { groups: ensureDefaultAtEnd(groups) });
}
