/**
 * cleanupDuplicateSurveys
 * Run once to remove duplicate survey docs left by the old addDoc-based seed.
 * Keeps the first occurrence of each unique title; deletes the rest.
 * Import and call this from a useEffect or admin page, then remove it.
 */
import { collection, getDocs, deleteDoc, doc, query, orderBy } from 'firebase/firestore';
import { getFirebaseDb } from './firebase';

export async function cleanupDuplicateSurveys() {
  const db = getFirebaseDb();
  if (!db) return;

  const q = query(collection(db, 'surveys'), orderBy('createdAt', 'asc'));
  const snapshot = await getDocs(q);

  const seenTitles = new Map<string, string>(); // title -> first doc id kept

  for (const docSnap of snapshot.docs) {
    const title: string = docSnap.data().title ?? '';
    if (seenTitles.has(title)) {
      // Duplicate – delete it
      await deleteDoc(doc(db, 'surveys', docSnap.id));
      console.log(`Deleted duplicate survey: "${title}" (id: ${docSnap.id})`);
    } else {
      seenTitles.set(title, docSnap.id);
    }
  }

  console.log('Cleanup complete. Unique surveys kept:', seenTitles.size);
}
