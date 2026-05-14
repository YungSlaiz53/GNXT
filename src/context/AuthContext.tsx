import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { 
  onAuthStateChanged, 
  signInWithPopup, 
  GoogleAuthProvider, 
  signOut,
  User,
  Auth
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
            } else {
              // Check for referral code in URL
              const urlParams = new URLSearchParams(window.location.search);
              const referralCodeFromUrl = urlParams.get('ref');
              
              const referralCode = Math.random().toString(36).substring(2, 8).toUpperCase();
              const newProfile: UserProfile = {
                uid: user.uid,
                username: user.displayName || 'User',
                email: user.email || '',
                points: referralCodeFromUrl ? 20 : 10, // 20 starting points if referred
                referrals: 0,
                referralCode,
                isVerified: false,
                joinedAt: serverTimestamp(),
                lastLogin: serverTimestamp(),
                completedTasks: [],
                referredBy: referralCodeFromUrl || undefined
              };

              // If referred, award the referrer
              if (referralCodeFromUrl) {
                try {
                  const referrersQuery = query(
                    collection(dbInstance, 'users'), 
                    where('referralCode', '==', referralCodeFromUrl),
                    limit(1)
                  );
                  const referrerSnap = await getDocs(referrersQuery);
                  
                  if (!referrerSnap.empty) {
                    const referrerDoc = referrerSnap.docs[0];
                    await updateDoc(doc(dbInstance, 'users', referrerDoc.id), {
                      points: increment(20), // Reward for referring
                      referrals: increment(1)
                    });
                    console.log('Referrer rewarded:', referralCodeFromUrl);
                  }
                } catch (err) {
                  console.error('Referral award error:', err);
                }
              }

              console.log('Creating new profile for:', user.email);
              await setDoc(profileRef, newProfile);
              setProfile(newProfile);
            }
          });
        } catch (e) {
          console.error('Profile sync error:', e);
        }
      } else {
        setProfile(null);
      }
    });

    return () => {
      unsubscribeAuth();
      if (unsubscribeProfile) unsubscribeProfile();
    };
  }, [authInstance, dbInstance]);

  const loginWithGoogle = async () => {
    if (!authInstance) {
      throw new Error('Firebase Auth not initialized');
    }
    if (!dbInstance) {
      throw new Error('Firestore not initialized');
    }
    const provider = new GoogleAuthProvider();
    // Ensure email is requested
    provider.addScope('email');
    const result = await signInWithPopup(authInstance, provider);
    const signedUser = result.user;
    // Update email in Firestore if available
    if (signedUser.email) {
      const profileRef = doc(dbInstance, 'users', signedUser.uid);
      await setDoc(profileRef, { email: signedUser.email }, { merge: true });
    }
    // onAuthStateChanged will handle setting user/profile state

  };

  const logout = async () => {
    if (authInstance) {
      await signOut(authInstance);
    }
    setUser(null);
    setProfile(null);
  };

  return (
    <AuthContext.Provider value={{ user, profile, loading, isFirebaseReady, loginWithGoogle, logout }}>
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
