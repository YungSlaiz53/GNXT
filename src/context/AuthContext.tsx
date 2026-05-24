import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { 
  onAuthStateChanged, 
  signInWithPopup, 
  GoogleAuthProvider, 
  signOut,
  User,
  Auth,
  createUserWithEmailAndPassword
} from 'firebase/auth';
import { initFirebase, getFirebaseAuth, getFirebaseDb } from '../lib/firebase';
import { doc, getDoc, setDoc, onSnapshot, serverTimestamp, Firestore, updateDoc, increment, collection, query, where, getDocs, limit } from 'firebase/firestore';
import { UserProfile } from '../types';

interface AuthContextType {
  user: User | null;
  profile: UserProfile | null;
  loading: boolean;
  isFirebaseReady: boolean;
  loginWithGoogle: () => Promise<void>;
  signUp: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [isFirebaseReady, setIsFirebaseReady] = useState(false);
  const [authInstance, setAuthInstance] = useState<Auth | null>(null);
  const [dbInstance, setDbInstance] = useState<Firestore | null>(null);

  const loginWithGoogle = async () => {
    if (!authInstance) {
      throw new Error('Firebase Auth not initialized');
    }
    const provider = new GoogleAuthProvider();
    provider.addScope('email');
    await signInWithPopup(authInstance, provider);
    // onAuthStateChanged will update state
  };

  // Initialise Firebase app and acquire auth/db instances
  useEffect(() => {
    const init = async () => {
      try {
        await initFirebase();
        const auth = getFirebaseAuth();
        const db = getFirebaseDb();
        if (auth && db) {
          setAuthInstance(auth);
          setDbInstance(db);
          setIsFirebaseReady(true);
        } else {
          console.error('Firebase auth or db not initialized');
        }
      } catch (e) {
        console.error('Firebase init error:', e);
      } finally {
        setLoading(false);
        // Clean any leftover mock data in local storage
        localStorage.removeItem('mock_profile');
      }
    };
    init();
  }, []);

  // Listen for auth state changes and sync profile with real-time updates
  useEffect(() => {
    if (!authInstance || !dbInstance) return;

    let unsubscribeProfile: (() => void) | null = null;

    const unsubscribeAuth = onAuthStateChanged(authInstance, async (user) => {
      setUser(user);
      
      // Clear existing profile listener if user changes
      if (unsubscribeProfile) {
        unsubscribeProfile();
        unsubscribeProfile = null;
      }

      if (user) {
        try {
          const profileRef = doc(dbInstance, 'users', user.uid);
          
          // Use onSnapshot for real-time profile updates (points, rewards, etc.)
          unsubscribeProfile = onSnapshot(profileRef, async (snap) => {
            if (snap.exists()) {
              const data = snap.data() as UserProfile;
              setProfile(data);
              setLoading(false); // Success: Profile loaded
            } else {
            // Check for referral code in LocalStorage (set in App.tsx)
            const referralCodeFromStorage = localStorage.getItem('referralCode');
            console.log('Attempting to create profile with referral:', referralCodeFromStorage);
            
            const referralCode = Math.random().toString(36).substring(2, 8).toUpperCase();
            const newProfile: UserProfile = {
              uid: user.uid,
              username: user.displayName || 'User',
              email: user.email || '',
              points: referralCodeFromStorage ? 20 : 10,
              referrals: 0,
              referralCode,
              isVerified: false,
              joinedAt: serverTimestamp(),
              lastLogin: serverTimestamp(),
              completedTasks: [],
              referredBy: referralCodeFromStorage || undefined
            };

            // If referred, award the referrer
            if (referralCodeFromStorage) {
              try {
                const referrersQuery = query(
                  collection(dbInstance, 'users'), 
                  where('referralCode', '==', referralCodeFromStorage),
                  limit(1)
                );
                const referrerSnap = await getDocs(referrersQuery);
                
                if (!referrerSnap.empty) {
                  const referrerDoc = referrerSnap.docs[0];
                  await updateDoc(doc(dbInstance, 'users', referrerDoc.id), {
                    points: increment(20),
                    referrals: increment(1)
                  });
                  console.log('Referrer rewarded successfully:', referralCodeFromStorage);
                } else {
                  console.warn('Referral code not found in database:', referralCodeFromStorage);
                }
              } catch (err) {
                console.error('Referral award error:', err);
              }
              // Clean up storage
              localStorage.removeItem('referralCode');
            }

            console.log('Writing new profile to Firestore:', newProfile);
            await setDoc(profileRef, newProfile);
            setProfile(newProfile);
            setLoading(false); // Success: Profile created
          }
        }, (err) => {
          console.error('onSnapshot error:', err);
          setLoading(false);
        });
      } catch (e) {
        console.error('Profile sync error:', e);
        setLoading(false);
      }
    } else {
      setProfile(null);
      setLoading(false); // Success: No user logged in
    }
    });

    return () => {
      unsubscribeAuth();
      if (unsubscribeProfile) unsubscribeProfile();
    };
  }, [authInstance, dbInstance]);

  // Sign up with email/password
  const signUp = async (email: string, password: string) => {
    if (!authInstance) {
      throw new Error('Firebase Auth not initialized');
    }
    if (!dbInstance) {
      throw new Error('Firestore not initialized');
    }
    // Create user
    const { user } = await createUserWithEmailAndPassword(authInstance, email, password);
    // Create a profile document for the new user
    const profileRef = doc(dbInstance, 'users', user.uid);
    const newProfile: UserProfile = {
      uid: user.uid,
      username: user.email?.split('@')[0] ?? 'User',
      email: user.email ?? '',
      points: 10,
      referrals: 0,
      referralCode: Math.random().toString(36).substring(2, 8).toUpperCase(),
      isVerified: false,
      joinedAt: serverTimestamp(),
      lastLogin: serverTimestamp(),
      completedTasks: [],
      // No referredBy for direct signup
    };
    await setDoc(profileRef, newProfile);
    // onAuthStateChanged listener will set user/profile state
  };

  const logout = async () => {
    setLoading(true);
    if (authInstance) {
      await signOut(authInstance);
    }
    setUser(null);
    setProfile(null);
    setLoading(false);
  };

  return (
    <AuthContext.Provider value={{ user, profile, loading, isFirebaseReady, loginWithGoogle, signUp, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
