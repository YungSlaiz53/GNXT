import { getFirebaseDb, initFirebase } from '../src/lib/firebase';
import { collection, getDocs, updateDoc, serverTimestamp, increment } from 'firebase/firestore';

/**
 * Adds streakCount (starting at 1) and lastStreakDate (current server timestamp)
 * to any user document that is missing these fields.
 *
 * Run with: `node tools/migrateStreak.ts` (requires ts-node or compiled to JS).
 */
async function migrateStreakFields() {
  // Ensure Firebase is initialized before accessing Firestore
  await initFirebase();
  const db = getFirebaseDb();
  if (!db) {
    console.error('Firestore not initialized. Ensure Firebase config is correct.');
    return;
  }

  const usersCol = collection(db, 'users');
  const snapshot = await getDocs(usersCol);
  const updates: Promise<void>[] = [];

  snapshot.forEach(docSnap => {
    const data = docSnap.data();
    if (data.streakCount === undefined) {
      updates.push(
        updateDoc(docSnap.ref, {
          streakCount: 1,
          lastStreakDate: serverTimestamp(),
        })
      );
    }
  });

  if (updates.length === 0) {
    console.log('All user documents already contain streak fields.');
    return;
  }

  await Promise.all(updates);
  console.log(`Migrated ${updates.length} user document(s) with streak fields.`);
}

migrateStreakFields().catch(err => {
  console.error('Migration failed:', err);
});
