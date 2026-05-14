import { initializeApp, getApp, getApps, FirebaseApp } from 'firebase/app';
import { getAuth, Auth, GoogleAuthProvider } from 'firebase/auth';
import { getFirestore, Firestore } from 'firebase/firestore';

let app: FirebaseApp | null = null;
let auth: Auth | null = null;
let db: Firestore | null = null;

// Export ready-to-use instances for direct sign‑in usage
export const firebaseAuth = () => auth; // will be set after init
export const googleProvider = new GoogleAuthProvider();

import firebaseConfig from './firebase-applet-config.json';

/**
 * Gets the Firebase configuration.
 */
function getFirebaseConfig() {
  if (firebaseConfig && firebaseConfig.apiKey && firebaseConfig.apiKey !== "YOUR_API_KEY") {
    return firebaseConfig;
  }
  return null;
}

/**
 * Initializes Firebase if a configuration is available.
 */
export async function initFirebase() {
  if (app) return app;
  
  if (getApps().length > 0) {
    app = getApp();
  } else {
    const config = getFirebaseConfig();
    if (config && config.apiKey && config.apiKey !== "YOUR_API_KEY") {
      app = initializeApp(config);
    }
  }
  return app;
}

/**
 * Gets the Auth instance. Returns null if Firebase is not initialized.
 */
export const getFirebaseAuth = () => {
  if (auth) return auth;
  if (!app) {
    // Try to get existing default app if it was initialized elsewhere
    try {
      app = getApp();
    } catch (e) {
      return null;
    }
  }
  auth = getAuth(app);
  return auth;
};

/**
 * Gets the Firestore instance. Returns null if Firebase is not initialized.
 */
export const getFirebaseDb = () => {
  if (db) return db;
  if (!app) {
    try {
      app = getApp();
    } catch (e) {
      return null;
    }
  }
  db = getFirestore(app);
  return db;
};

// Legacy placeholders to maintain compatibility without crashing
export const authInstance = null as unknown as Auth;
export const dbInstance = null as unknown as Firestore;
export { app };
