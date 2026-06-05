import { initializeApp } from 'firebase/app';
import { getFirestore, doc, updateDoc, collection, query, where, getDocs } from 'firebase/firestore';
import { readFileSync } from 'fs';
import { join } from 'path';

// Load Firebase configuration
const configPath = join(process.cwd(), 'src/lib/firebase-applet-config.json');
let firebaseConfig;
try {
  firebaseConfig = JSON.parse(readFileSync(configPath, 'utf-8'));
} catch (e) {
  console.error('Error reading firebase-applet-config.json:', e);
  process.exit(1);
}

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

async function makeAdmin() {
  const target = process.argv[2];
  if (!target) {
    console.log('Usage: npx tsx scripts/make-admin.ts <email-or-uid>');
    process.exit(1);
  }

  console.log(`Searching for user matching: "${target}"...`);

  try {
    // 1. Try treating it as a UID first
    const userRef = doc(db, 'users', target);
    const usersCollection = collection(db, 'users');
    
    // 2. Query by email in case target is an email
    const q = query(usersCollection, where('email', '==', target));
    const querySnapshot = await getDocs(q);

    if (!querySnapshot.empty) {
      const userDoc = querySnapshot.docs[0];
      await updateDoc(doc(db, 'users', userDoc.id), { isAdmin: true });
      console.log(`Successfully set isAdmin to true for user:`);
      console.log(`- Username: ${userDoc.data().username}`);
      console.log(`- Email: ${userDoc.data().email}`);
      console.log(`- UID: ${userDoc.id}`);
    } else {
      // 3. Fallback: try checking if a document exists with that UID
      // Note: we just update it; if it doesn't exist, it will throw an error
      await updateDoc(userRef, { isAdmin: true });
      console.log(`Successfully set isAdmin to true for user UID: ${target}`);
    }
  } catch (error: any) {
    console.error('Error updating document:', error.message || error);
    process.exit(1);
  }
}

makeAdmin();
