import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { 
  onAuthStateChanged, 
  signInWithPopup, signInWithRedirect, 
  GoogleAuthProvider, 
  signOut,
  User,
  Auth,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword
} from 'firebase/auth';
import { initFirebase, getFirebaseAuth, getFirebaseDb } from '../lib/firebase';
import { doc, getDoc, setDoc, onSnapshot, serverTimestamp, Firestore, updateDoc, increment, collection, query, where, getDocs, limit } from 'firebase/firestore';
import { UserProfile } from '../types';

interface AuthContextType {
  user: User | null;
  profile: UserProfile | null;
  loading: boolean;
  isFirebaseReady: boolean;
  dbError: string | null;
  loginWithGoogle: () => Promise<void>;
  loginWithEmail: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [isFirebaseReady, setIsFirebaseReady] = useState(false);
  const [dbError, setDbError] = useState<string | null>(null);
  const [authInstance, setAuthInstance] = useState<Auth | null>(null);
  const [dbInstance, setDbInstance] = useState<Firestore | null>(null);

  const loginWithGoogle = async () => {
    if (!authInstance) {
      throw new Error('Firebase Auth not initialized');
    }
    const provider = new GoogleAuthProvider();
    provider.addScope('email');
    try {
      await signInWithPopup(authInstance, provider);
    } catch (e: any) {
      // Fallback for popup blocked/closed scenarios (common in production)
      if (e.code === 'auth/popup-closed-by-user' || e.code === 'auth/popup-blocked') {
        await signInWithRedirect(authInstance, provider);
      } else {
        // Re‑throw other errors for upstream handling
        throw e;
      }
    }
    // onAuthStateChanged will update state
  };

  const loginWithEmail = async (email: string, password: string) => {
    if (!authInstance) {
      throw new Error('Firebase Auth not initialized');
    }
    await signInWithEmailAndPassword(authInstance, email, password);
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
          setLoading(false);
        }
      } catch (e) {
        console.error('Firebase init error:', e);
        setLoading(false);
      } finally {
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

    const unsubscribeAuth = onAuthStateChanged(authInstance, async (currentUser) => {
      setUser(currentUser);
      
      // Clear existing profile listener if user changes
      if (unsubscribeProfile) {
        unsubscribeProfile();
        unsubscribeProfile = null;
      }

      if (currentUser) {
        const createFallbackProfile = () => {
          return {
            uid: currentUser.uid,
            username: currentUser.displayName || currentUser.email?.split('@')[0] || 'User',
            email: currentUser.email || '',
            points: 10,
            referrals: 0,
            referralCode: 'LOCAL-' + currentUser.uid.substring(0, 5).toUpperCase(),
            isVerified: false,
            isAdmin: false,
            joinedAt: new Date(),
            lastLogin: new Date(),
            completedTasks: []
          } as UserProfile;
        };

        try {
          const profileRef = doc(dbInstance, 'users', currentUser.uid);
          
          // Use onSnapshot for real-time profile updates (points, rewards, etc.)
          unsubscribeProfile = onSnapshot(profileRef, async (snap) => {
            try {
              if (snap.exists()) {
                const data = snap.data() as UserProfile;
                
                // If existing profile is missing email, update it in background if possible
                if (currentUser.email && (!data.email || data.email === '')) {
                  data.email = currentUser.email;
                  try {
                    await updateDoc(profileRef, { email: currentUser.email });
                  } catch (e) {
                    console.warn('Failed to update email in Firestore:', e);
                  }
                }
                
                setProfile(data);
                setDbError(null); // Clear database errors on success
                setLoading(false); // Success: Profile loaded

                // Sync referrals count dynamically to award points if write permissions blocked it during invitee signup
                if (data.referralCode) {
                  try {
                    const referralsQuery = query(
                      collection(dbInstance, 'users'),
                      where('referredBy', '==', data.referralCode)
                    );
                    const referralsSnap = await getDocs(referralsQuery);
                    const actualReferralsCount = referralsSnap.size;
                    const storedReferrals = data.referrals || 0;
                    
                    if (actualReferralsCount > storedReferrals) {
                      const newReferrals = actualReferralsCount - storedReferrals;
                      const rewardPoints = newReferrals * 20;
                      await updateDoc(profileRef, {
                        referrals: actualReferralsCount,
                        points: increment(rewardPoints)
                      });
                      console.log(`Synced ${newReferrals} new referral(s). Awarded ${rewardPoints} PTS.`);
                    }
                  } catch (syncErr) {
                    console.warn('Failed to sync referrals count dynamically:', syncErr);
                  }
                }
              } else {
                // Check for referral code in LocalStorage (set in App.tsx)
                const referralCodeFromStorage = localStorage.getItem('referralCode');
                console.log('Attempting to create profile with referral:', referralCodeFromStorage);
                
                const referralCode = Math.random().toString(36).substring(2, 8).toUpperCase();
                const newProfile: UserProfile = {
                  uid: currentUser.uid,
                  username: currentUser.displayName || 'User',
                  email: currentUser.email || '',
                  points: referralCodeFromStorage ? 20 : 10,
                  referrals: 0,
                  referralCode,
                  isVerified: false,
                  isAdmin: false,
                  joinedAt: serverTimestamp(),
                  lastLogin: serverTimestamp(),
                  completedTasks: []
                };

                if (referralCodeFromStorage) {
                  newProfile.referredBy = referralCodeFromStorage;
                }

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
                try {
                  await setDoc(profileRef, newProfile);
                  setProfile(newProfile);
                  setDbError(null); // Success writing
                } catch (writeErr: any) {
                  console.error('Failed to write profile to Firestore, using local memory profile:', writeErr);
                  setDbError('Write Error: ' + (writeErr.message || String(writeErr)));
                  setProfile(newProfile);
                }
                setLoading(false); // Success: Profile created
              }
            } catch (callbackErr: any) {
              console.error('Error inside onSnapshot callback, using fallback:', callbackErr);
              setDbError('Callback Error: ' + (callbackErr.message || String(callbackErr)));
              setProfile(createFallbackProfile());
              setLoading(false);
            }
          }, (err: any) => {
            console.error('onSnapshot subscription error, using fallback profile:', err);
            setDbError('Subscription/Read Error: ' + (err.message || String(err)));
            setProfile(createFallbackProfile());
            setLoading(false);
          });
        } catch (e: any) {
          console.error('Profile sync error, using fallback:', e);
          setDbError('Sync Setup Error: ' + (e.message || String(e)));
          setProfile(createFallbackProfile());
          setLoading(false);
        }
      } else {
        setProfile(null);
        setDbError(null);
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

    const referralCodeFromStorage = localStorage.getItem('referralCode');
    const referralCode = Math.random().toString(36).substring(2, 8).toUpperCase();

    const newProfile: UserProfile = {
      uid: user.uid,
      username: user.email?.split('@')[0] ?? 'User',
      email: user.email ?? '',
      points: referralCodeFromStorage ? 20 : 10,
      referrals: 0,
      referralCode,
      isVerified: false,
      isAdmin: false,
      joinedAt: serverTimestamp(),
      lastLogin: serverTimestamp(),
      completedTasks: []
    };

    if (referralCodeFromStorage) {
      newProfile.referredBy = referralCodeFromStorage;

      // Award the referrer (best effort)
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
          console.log('Referrer rewarded successfully during email signup:', referralCodeFromStorage);
        }
      } catch (err) {
        console.error('Referral award error during email signup:', err);
      }
      
      // Clean up storage
      localStorage.removeItem('referralCode');
    }

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
    <AuthContext.Provider value={{ user, profile, loading, isFirebaseReady, dbError, loginWithGoogle, signUp, logout }}>
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
