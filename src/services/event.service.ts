'use client';

import { doc, getDoc, setDoc } from 'firebase/firestore';
import { db } from './firebase.config';
import { EventDetails } from '@/models/event.model';

// REMINDER — update Firebase Console Security Rules (Firestore):
// match /settings/{document} {
//   allow read: if true;          // public read for invite page
//   allow write: if request.auth != null;  // admin write only
// }

const DEFAULT_EVENT_DETAILS: EventDetails = {
  coupleName: 'שם החתן ושם הכלה',
  brideFirstName: 'הכלה',
  groomFirstName: 'החתן',
  date: 'תאריך האירוע',
  time: '19:00',
  venue: 'מקום האירוע',
  rsvpDeadline: 'תאריך אחרון לאישור',
  welcomeMessage: '',
};

export async function getEventDetails(): Promise<EventDetails> {
  const docRef = doc(db, 'settings', 'eventDetails');
  const snap = await getDoc(docRef);
  if (!snap.exists()) return DEFAULT_EVENT_DETAILS;
  return snap.data() as EventDetails;
}

export async function saveEventDetails(data: EventDetails): Promise<void> {
  const docRef = doc(db, 'settings', 'eventDetails');
  await setDoc(docRef, data, { merge: true });
}

// Resize image or convert PDF first page to a Base64 JPEG string for Firestore storage.
// Max width 2000px, JPEG quality 0.92 keeps the result well under Firestore's 1 MB doc limit.
export async function processInvitationFile(file: File): Promise<{ base64: string; fileType: 'image' | 'pdf' }> {
  if (file.type === 'application/pdf') {
    // @ts-ignore
    const pdfjsLib = await import('pdfjs-dist');
    pdfjsLib.GlobalWorkerOptions.workerSrc =
      `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`;

    const arrayBuffer = await file.arrayBuffer();
    const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
    const page = await pdf.getPage(1);
    const viewport = page.getViewport({ scale: 1.5 });

    const canvas = document.createElement('canvas');
    canvas.width = viewport.width;
    canvas.height = viewport.height;
    // @ts-ignore
    await page.render({ canvasContext: canvas.getContext('2d')!, viewport }).promise;

    const base64 = canvas.toDataURL('image/jpeg', 0.92);
    return { base64, fileType: 'pdf' };
  } else {
    return new Promise((resolve) => {
      const img = new Image();
      const objectUrl = URL.createObjectURL(file);
      img.onload = () => {
        const maxWidth = 2000;
        const scale = img.width > maxWidth ? maxWidth / img.width : 1;
        const canvas = document.createElement('canvas');
        canvas.width = img.width * scale;
        canvas.height = img.height * scale;
        canvas.getContext('2d')!.drawImage(img, 0, 0, canvas.width, canvas.height);
        URL.revokeObjectURL(objectUrl);
        const base64 = canvas.toDataURL('image/jpeg', 0.92);
        resolve({ base64, fileType: 'image' });
      };
      img.src = objectUrl;
    });
  }
}
