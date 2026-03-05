import {
  collection,
  doc,
  getDocs,
  getDoc,
  addDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  Timestamp,
  serverTimestamp,
} from 'firebase/firestore';
import { db } from '@/services/firebase.config';
import { Guest, GuestFormData, RSVPSubmission } from '@/models/guest.model';
import { GUESTS_COLLECTION } from '@/lib/constants';

function docToGuest(id: string, data: Record<string, unknown>): Guest {
  return {
    ...data,
    id,
    createdAt: data.createdAt instanceof Timestamp ? data.createdAt.toDate() : new Date(),
    respondedAt: data.respondedAt instanceof Timestamp ? data.respondedAt.toDate() : undefined,
  } as Guest;
}

export async function getAllGuests(): Promise<Guest[]> {
  const q = query(collection(db, GUESTS_COLLECTION), orderBy('createdAt', 'desc'));
  const snapshot = await getDocs(q);
  return snapshot.docs.map((d) => docToGuest(d.id, d.data()));
}

export async function getGuestById(id: string): Promise<Guest | null> {
  const snapshot = await getDoc(doc(db, GUESTS_COLLECTION, id));
  if (!snapshot.exists()) return null;
  return docToGuest(snapshot.id, snapshot.data());
}

export async function getGuestByToken(token: string): Promise<Guest | null> {
  const q = query(collection(db, GUESTS_COLLECTION), where('inviteToken', '==', token));
  const snapshot = await getDocs(q);
  if (snapshot.empty) return null;
  const d = snapshot.docs[0];
  return docToGuest(d.id, d.data());
}

export async function addGuest(data: GuestFormData): Promise<string> {
  const docRef = await addDoc(collection(db, GUESTS_COLLECTION), {
    ...data,
    // inviteToken = doc ID so the invite URL is just /invite/[docId]
    inviteToken: '',
    status: 'pending',
    dietaryNeeds: data.dietaryNeeds ?? [],
    createdAt: serverTimestamp(),
  });
  // Write inviteToken as the doc ID now that we have it
  await updateDoc(docRef, { inviteToken: docRef.id });
  return docRef.id;
}

export async function updateGuest(id: string, data: Partial<GuestFormData>): Promise<void> {
  await updateDoc(doc(db, GUESTS_COLLECTION, id), data as Record<string, unknown>);
}

export async function deleteGuest(id: string): Promise<void> {
  await deleteDoc(doc(db, GUESTS_COLLECTION, id));
}

export async function updateRSVP(
  id: string,
  rsvpData: RSVPSubmission & { status: 'confirmed' | 'declined' },
): Promise<void> {
  // Build payload explicitly — spreading optional undefined fields into Firestore throws
  // "Unsupported field value: undefined", so we include them only when present.
  const payload: Record<string, unknown> = {
    status: rsvpData.status,
    actualGuests: rsvpData.actualGuests,
    dietaryNeeds: rsvpData.dietaryNeeds,
    respondedAt: serverTimestamp(),
  };
  if (rsvpData.dietaryNote !== undefined) payload.dietaryNote = rsvpData.dietaryNote;
  if (rsvpData.personalMessage !== undefined) payload.personalMessage = rsvpData.personalMessage;

  console.log('[updateRSVP] Writing RSVP to Firestore:', { id, ...payload, respondedAt: '<serverTimestamp>' });
  await updateDoc(doc(db, GUESTS_COLLECTION, id), payload);
  console.log('[updateRSVP] Write successful for guest:', id);
}
