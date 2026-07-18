import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  RefreshCcw,
  Users, 
  ClipboardList, 
  Shield, 
  CheckCircle2, 
  Search, 
  Plus, 
  Trash2, 
  AlertCircle, 
  Activity, 
  Award, 
  Database,
  ArrowRight,
  UserCheck,
  UserMinus,
  ListCollapse,
  Link,
  Twitter,
  MessageCircle,
  Youtube,
  Globe
} from 'lucide-react';
import type { SocialTask, UserProfile, Survey, SurveyQuestion } from '../types';

import { collection, getDocs, getDoc, doc, updateDoc, setDoc, deleteDoc, query, orderBy, where, serverTimestamp, arrayRemove } from 'firebase/firestore';
import { getFirebaseDb, getFirebaseStorage } from '../lib/firebase';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { useAuth } from '../context/AuthContext';

// Helper to upload image and get URL (available throughout component)
const uploadImage = async (file: File): Promise<string> => {
  const storage = getFirebaseStorage();
  if (!storage) throw new Error('Firebase Storage not initialized');
  const imgRef = ref(storage, `survey_images/${Date.now()}_${file.name}`);
  await uploadBytes(imgRef, file);
  const url = await getDownloadURL(imgRef);
  return url;
};
import { saveAs } from 'file-saver';


 


type TabType = 'dashboard' | 'users' | 'surveys' | 'submissions' | 'social' | 'settings';

export default function Admin() {
  const { profile, isFirebaseReady } = useAuth();
  const [activeTab, setActiveTab] = useState<TabType>('dashboard');
  const [devBypass, setDevBypass] = useState(false);
  
  // Data States
  const [usersList, setUsersList] = useState<UserProfile[]>([]);
  const [surveysList, setSurveysList] = useState<Survey[]>([]);
  const [submissionsList, setSubmissionsList] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filters & Search
  const [userSearch, setUserSearch] = useState('');
  const [userFilter, setUserFilter] = useState<'all' | 'verified' | 'unverified'>('all');

  // New Survey Form State
  const [newSurveyTitle, setNewSurveyTitle] = useState('');
  const [newSurveyDesc, setNewSurveyDesc] = useState('');
  const [newSurveyImageFile, setNewSurveyImageFile] = useState<File | null>(null);
  const [newSurveyReward, setNewSurveyReward] = useState(25);
  const [newSurveyType, setNewSurveyType] = useState<'text' | 'image' | 'voice'>('text');
  const [newQuestions, setNewQuestions] = useState<Omit<SurveyQuestion, 'id'>[]>([
    { text: '', type: 'multiple-choice', options: ['Yes', 'No'] }
  ]);

  // Points Editing State
  const [editingUserId, setEditingUserId] = useState<string | null>(null);
  const [editPointsValue, setEditPointsValue] = useState<number>(0);

  // Inline delete confirmation state
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);

  // Survey publish loading state
  const [isSubmittingSurvey, setIsSubmittingSurvey] = useState(false);

  // Social Tasks State
  const [socialTasksList, setSocialTasksList] = useState<SocialTask[]>([]);
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [newTaskDesc, setNewTaskDesc] = useState('');
  const [newTaskReward, setNewTaskReward] = useState(15);
  const [newTaskPlatform, setNewTaskPlatform] = useState<SocialTask['platform']>('twitter');
  const [newTaskLink, setNewTaskLink] = useState('');
  const [newTaskLocked, setNewTaskLocked] = useState(false);
  const [isSubmittingTask, setIsSubmittingTask] = useState(false);
  const [confirmDeleteTaskId, setConfirmDeleteTaskId] = useState<string | null>(null);
  const [isSeeding, setIsSeeding] = useState(false);

  // Cardano System Settings State
  const [cardanoNetwork, setCardanoNetwork] = useState<'Preprod' | 'Mainnet'>('Preprod');
  const [treasuryAddress, setTreasuryAddress] = useState('');
  const [isSavingSettings, setIsSavingSettings] = useState(false);

  const fetchSettings = async () => {
    const db = getFirebaseDb();
    if (!db) return;
    try {
      const docRef = doc(db, 'system_config', 'cardano');
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        const data = docSnap.data();
        setCardanoNetwork(data.network || 'Preprod');
        setTreasuryAddress(data.treasuryAddress || '');
      }
    } catch (e) {
      console.error('Failed to fetch settings:', e);
    }
  };

  const handleSaveSettings = async () => {
    const db = getFirebaseDb();
    if (!db) return;
    setIsSavingSettings(true);
    try {
      const docRef = doc(db, 'system_config', 'cardano');
      await setDoc(docRef, {
        network: cardanoNetwork,
        treasuryAddress: treasuryAddress.trim()
      }, { merge: true });
      alert('Cardano configuration saved successfully!');
    } catch (e: any) {
      console.error('Failed to save settings:', e);
      alert(`Failed to save settings: ${e.message}`);
    } finally {
      setIsSavingSettings(false);
    }
  };

  // Check Admin Role or local bypass
  const isLocalhost = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
  const hasAdminAccess = profile?.isAdmin || devBypass || (isLocalhost && devBypass);

  const fetchAdminData = async () => {
    const db = getFirebaseDb();
    if (!db) return;
    


    setLoading(true);
    setError(null);

    // 1. Fetch Users
    try {
      const usersSnap = await getDocs(collection(db, 'users'));
      const fetchedUsers = usersSnap.docs.map(doc => ({
        uid: doc.id,
        ...doc.data()
      })) as UserProfile[];
      setUsersList(fetchedUsers);
    } catch (e: any) {
      console.error('Error fetching users:', e);
    }

    // 2. Fetch Surveys
    try {
      const surveysSnap = await getDocs(query(collection(db, 'surveys'), orderBy('createdAt', 'desc')));
      const fetchedSurveys = surveysSnap.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Survey[];
      setSurveysList(fetchedSurveys);
    } catch (e: any) {
      console.error('Error fetching surveys:', e);
    }

    // 3. Fetch User Submissions
    try {
      const submissionsSnap = await getDocs(collection(db, 'user_answers'));
      const fetchedSubmissions = submissionsSnap.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setSubmissionsList(fetchedSubmissions);
    } catch (e: any) {
      console.error('Error fetching submissions:', e);
    }

    // 4. Fetch Social Tasks
    try {
      const socialSnap = await getDocs(query(collection(db, 'social_tasks'), orderBy('order', 'asc')));
      const fetchedTasks = socialSnap.docs.map(d => ({ id: d.id, ...d.data() })) as SocialTask[];
      setSocialTasksList(fetchedTasks);
    } catch (e: any) {
      console.error('Error fetching social tasks with order, trying simple query:', e);
      try {
        const socialSnap = await getDocs(collection(db, 'social_tasks'));
        const fetchedTasks = socialSnap.docs.map(d => ({ id: d.id, ...d.data() })) as SocialTask[];
        fetchedTasks.sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
        setSocialTasksList(fetchedTasks);
      } catch (e2: any) {
        console.error('Failed to fetch social tasks completely:', e2);
        setError(`Failed to load social tasks: ${e2.message}`);
      }
      // 5. Fetch Settings
      try {
        await fetchSettings();
      } catch (e: any) {
        console.error('Error fetching settings:', e);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (hasAdminAccess && isFirebaseReady) {
      fetchAdminData();
    }
  }, [hasAdminAccess, isFirebaseReady]);

  // User Administration Handlers
  const handleToggleVerification = async (user: UserProfile) => {
    const db = getFirebaseDb();
    if (!db) return;

    try {
      const userRef = doc(db, 'users', user.uid);
      const newStatus = !user.isVerified;
      await updateDoc(userRef, { isVerified: newStatus });
      
      setUsersList(prev => prev.map(u => u.uid === user.uid ? { ...u, isVerified: newStatus } : u));
    } catch (e) {
      console.error('Failed to toggle verification:', e);
      alert('Error updating verification status.');
    }
  };

  const handleUpdatePoints = async (userId: string) => {
    const db = getFirebaseDb();
    if (!db) return;

    try {
      const userRef = doc(db, 'users', userId);
      await updateDoc(userRef, { points: editPointsValue });
      
      setUsersList(prev => prev.map(u => u.uid === userId ? { ...u, points: editPointsValue } : u));
      setEditingUserId(null);
    } catch (e) {
      console.error('Failed to update points:', e);
      alert('Error updating user points.');
    }
  };

  // Survey Administration Handlers
  const handleAddQuestion = () => {
    setNewQuestions(prev => [...prev, { text: '', type: 'multiple-choice', options: ['Yes', 'No'] }]);
  };

  const handleRemoveQuestion = (index: number) => {
    if (newQuestions.length <= 1) return;
    setNewQuestions(prev => prev.filter((_, i) => i !== index));
  };

  const handleQuestionChange = (index: number, field: string, value: any) => {
    setNewQuestions(prev => prev.map((q, i) => {
      if (i === index) {
        if (field === 'options') {
          // split comma separated options
          const opts = value.split(',').map((o: string) => o.trim()).filter((o: string) => o !== '');
          return { ...q, options: opts };
        }
        return { ...q, [field]: value };
      }
      return q;
    }));
  };

  const handleCreateSurvey = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmittingSurvey) return; // guard against double-submit
    const db = getFirebaseDb();
    if (!db) return;

    // Validate questions
    if (newQuestions.some(q => q.text.trim() === '')) {
      setError('Please fill out all question texts before publishing.');
      return;
    }

    setIsSubmittingSurvey(true);
    setError(null);
    try {
      const surveysCol = collection(db, 'surveys');
      const questionsWithIds: SurveyQuestion[] = newQuestions.map((q, i) => ({
        id: `q${i + 1}`,
        text: q.text,
        type: q.type,
        ...(q.type === 'multiple-choice' && { options: q.options })
      }));

      // Use a slug-based deterministic ID so repeated submits don't create duplicates
      const slug = newSurveyTitle.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
      const surveyRef = doc(surveysCol, slug);

      const imageUrl = newSurveyImageFile ? await uploadImage(newSurveyImageFile) : undefined;
      const newSurvey = {
        title: newSurveyTitle,
        description: newSurveyDesc,
        reward: Number(newSurveyReward),
        type: newSurveyType,
        createdAt: serverTimestamp(),
        questions: questionsWithIds,
        imageUrl,
      };

      await setDoc(surveyRef, newSurvey);

      // Update local state (replace if exists, prepend if new)
      setSurveysList(prev => {
        const exists = prev.find(s => s.id === slug);
        if (exists) return prev.map(s => s.id === slug ? { id: slug, ...newSurvey } as Survey : s);
        return [{ id: slug, ...newSurvey } as Survey, ...prev];
      });

      // Reset form
      setNewSurveyTitle('');
      setNewSurveyDesc('');
      setNewSurveyReward(25);
      setNewSurveyImageFile(null);
      setNewQuestions([{ text: '', type: 'multiple-choice', options: ['Yes', 'No'] }]);
    } catch (e: any) {
      console.error('Failed to create survey:', e);
      setError(`Publish failed: ${e.message}`);
    } finally {
      setIsSubmittingSurvey(false);
    }
  };

  // Refresh a survey so users can retake it
  const handleRefreshSurvey = async (surveyId: string) => {
    const db = getFirebaseDb();
    if (!db) return;
    try {
      const surveyRef = doc(db, 'surveys', surveyId);
      // Update a timestamp to force re-evaluation
      await updateDoc(surveyRef, { refreshedAt: serverTimestamp() });
      // Delete all user answer documents for this survey
      const answersSnap = await getDocs(query(collection(db, 'user_answers'), where('surveyId', '==', surveyId)));
      for (const answerDoc of answersSnap.docs) await deleteDoc(answerDoc.ref);
      // Also delete any response docs in the sub‑collection (legacy path)
      const respSnap = await getDocs(collection(db, `surveys/${surveyId}/responses`));
      for (const docSnap of respSnap.docs) await deleteDoc(docSnap.ref);

      // Remove the survey from all users' completedSurveys lists
      const usersQuery = query(collection(db, 'users'), where('completedSurveys', 'array-contains', surveyId));
      const usersSnap = await getDocs(usersQuery);
      for (const userDoc of usersSnap.docs) {
        await updateDoc(userDoc.ref, {
          completedSurveys: arrayRemove(surveyId)
        });
      }

      // Refetch the list to reflect changes
      fetchAdminData();
    } catch (e: any) {
      console.error('Refresh survey failed:', e);
      setError(`Refresh failed: ${e.message}`);
    }
  };

  const handleDeleteSurvey = async (surveyId: string) => {
    const db = getFirebaseDb();
    if (!db) return;

    try {
      await deleteDoc(doc(db, 'surveys', surveyId));
      setSurveysList(prev => prev.filter(s => s.id !== surveyId));
      setConfirmDeleteId(null);
    } catch (e: any) {
      console.error('Failed to delete survey:', e);
      setConfirmDeleteId(null);
      setError(`Delete failed: ${e.message}`);
    }
  };

  // Social Task Handlers
  const handleCreateSocialTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmittingTask) return;
    const db = getFirebaseDb();
    if (!db) return;

    setIsSubmittingTask(true);
    setError(null);
    try {
      const slug = newTaskTitle.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
      const taskRef = doc(collection(db, 'social_tasks'), slug);
      const newTask: Omit<SocialTask, 'id'> = {
        title: newTaskTitle,
        description: newTaskDesc,
        reward: Number(newTaskReward),
        platform: newTaskPlatform,
        link: newTaskLink,
        locked: newTaskLocked,
        order: socialTasksList.length,
        createdAt: serverTimestamp()
      };
      await setDoc(taskRef, newTask);
      setSocialTasksList(prev => {
        const exists = prev.find(t => t.id === slug);
        if (exists) return prev.map(t => t.id === slug ? { id: slug, ...newTask } as SocialTask : t);
        return [...prev, { id: slug, ...newTask } as SocialTask];
      });
      // Reset form
      setNewTaskTitle('');
      setNewTaskDesc('');
      setNewTaskReward(15);
      setNewTaskLink('');
      setNewTaskLocked(false);
    } catch (e: any) {
      setError(`Failed to create task: ${e.message}`);
    } finally {
      setIsSubmittingTask(false);
    }
  };

  const handleDeleteSocialTask = async (taskId: string) => {
    const db = getFirebaseDb();
    if (!db) return;
    try {
      await deleteDoc(doc(db, 'social_tasks', taskId));
      setSocialTasksList(prev => prev.filter(t => t.id !== taskId));
      setConfirmDeleteTaskId(null);
    } catch (e: any) {
      setError(`Delete failed: ${e.message}`);
      setConfirmDeleteTaskId(null);
    }
  };

  const handleSeedDefaultTasks = async () => {
    const db = getFirebaseDb();
    if (!db) return;
    setIsSeeding(true);
    setError(null);
    try {
      const defaultTasks = [
        { title: 'Follow CEO on X', reward: 20, platform: 'twitter' as const, link: 'https://x.com/ogleksb', description: 'Follow the official X profile of the NEXT.AI CEO for insider insights, announcements, and vision.', order: 0 },
        { title: 'Follow Admin on X', reward: 10, platform: 'twitter' as const, link: 'https://x.com/Ghdaniel19', description: 'Follow our official Administrator (@Ghdaniel19) on X for verified network directives.', order: 1 },
        { title: 'Join Official Telegram', reward: 15, platform: 'telegram' as const, link: 'https://t.me/nextai', description: 'Engage with other contributors in our secure neural channel.', order: 2 },
        { title: 'Follow WNXT (Official)', reward: 20, platform: 'twitter' as const, link: 'https://x.com/G_WNXT', description: 'Follow our official WNXT handle on X to stay updated on node and protocol developments.', order: 3 },
        { title: 'Follow Gimbalabs (Partners)', reward: 15, platform: 'twitter' as const, link: 'https://x.com/gimbalabs', description: 'Connect with Gimbalabs on X, our core partner building decentralized APIs and learning spaces.', order: 4 },
        { title: 'Follow Cardano Foundation', reward: 15, platform: 'twitter' as const, link: 'https://x.com/Cardano_CF', description: 'Follow the Cardano Foundation on X, backing the growth and adoption of Cardano ecosystem.', order: 5 },
        { title: 'Watch Protocol AMA', reward: 50, platform: 'youtube' as const, link: 'https://youtube.com', locked: true, description: 'Unlock this mission by completing 3 research surveys.', order: 6 },
      ];

      const seededTasks: SocialTask[] = [];
      for (const task of defaultTasks) {
        const slug = task.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
        const taskRef = doc(collection(db, 'social_tasks'), slug);
        await setDoc(taskRef, {
          ...task,
          createdAt: serverTimestamp()
        });
        seededTasks.push({ id: slug, ...task } as SocialTask);
      }
      setSocialTasksList(seededTasks);
    } catch (e: any) {
      setError(`Failed to seed tasks: ${e.message}`);
    } finally {
      setIsSeeding(false);
    }
  };

  const handleGrantAdminInDb = async () => {
    const db = getFirebaseDb();
    if (db && profile?.uid) {
      try {
        const userRef = doc(db, 'users', profile.uid);
        await updateDoc(userRef, { isAdmin: true });
        alert("Admin status successfully granted in Firestore! Refreshing to apply permissions...");
        window.location.reload();
      } catch (e: any) {
        console.error("Failed to grant admin status:", e);
        alert("Failed to grant admin status: " + e.message);
      }
    } else {
      alert("No active user profile session. Please make sure you are logged in.");
    }
  };

  // Platform icon helper
  const PlatformIcon = ({ platform }: { platform: SocialTask['platform'] }) => {
    switch (platform) {
      case 'twitter': return <Twitter size={16} />;
      case 'telegram': return <MessageCircle size={16} />;
      case 'youtube': return <Youtube size={16} />;
      default: return <Globe size={16} />;
    }
  };

  const platformColors: Record<SocialTask['platform'], string> = {
    twitter: 'bg-sky-500/10 text-sky-400 border-sky-500/20',
    telegram: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
    youtube: 'bg-red-500/10 text-red-400 border-red-500/20',
    discord: 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20',
    other: 'bg-white/5 text-white/50 border-white/10',
  };

  // Helpers
  const getUserEmail = (userId: string) => {
    const user = usersList.find(u => u.uid === userId);
    return user ? user.email : userId;
  };

  const getSurveyTitle = (surveyId: string) => {
    const survey = surveysList.find(s => s.id === surveyId);
    return survey ? survey.title : surveyId;
  };

  // CSV Export for Submissions (moved inside component to access state)
  const downloadCSV = () => {
    try {
      if (!submissionsList.length) return;
      const allQuestionIds = new Set<string>();
      submissionsList.forEach((sub) => {
        Object.keys(sub.answers || {}).forEach((qid) => allQuestionIds.add(qid));
      });
      const questionHeaders = Array.from(allQuestionIds);
      
      const escapeCSV = (val: any) => {
        if (val === undefined || val === null) return '';
        const str = String(val);
        if (str.includes('"') || str.includes(',') || str.includes('\n') || str.includes('\r')) {
          return `"${str.replace(/"/g, '""')}"`;
        }
        return str;
      };

      const rows: string[] = [];
      const header = ['Survey Title', 'User Email', ...questionHeaders];
      rows.push(header.map(escapeCSV).join(','));

      submissionsList.forEach((sub) => {
        const surveyTitle = getSurveyTitle(sub.surveyId);
        const userEmail = getUserEmail(sub.userId);
        const answers = sub.answers || {};
        const row = [
          surveyTitle,
          userEmail,
          ...questionHeaders.map((qid) => answers[qid])
        ];
        rows.push(row.map(escapeCSV).join(','));
      });
      const csvContent = rows.join('\r\n');
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const filename = `survey_submissions_${new Date().toISOString().split('T')[0]}.csv`;
      saveAs(blob, filename);
    } catch (e) {
      console.error('CSV export error:', e);
    }
  };
  // Render Access Denied
  if (!hasAdminAccess) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center p-6">
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="max-w-md w-full glass-card p-8 rounded-[32px] text-center space-y-6 border-red-500/20"
        >
          <div className="w-16 h-16 bg-red-500/10 rounded-full flex items-center justify-center mx-auto text-red-400">
            <Shield size={32} />
          </div>
          <div className="space-y-2">
            <h1 className="text-3xl font-black uppercase italic tracking-tight text-white">Access Denied</h1>
            <p className="text-white/40 text-sm">
              Your profile does not contain admin permissions. Set the <code className="text-brand">isAdmin: true</code> attribute in your Firestore user document.
            </p>
          </div>

          <div className="pt-4 border-t border-white/5 space-y-3">
            <p className="text-xs text-white/30 italic">
              Running locally or want to preview the dashboard interface?
            </p>
            <button 
              onClick={async () => {
                setDevBypass(true);
                const db = getFirebaseDb();
                if (db && profile?.uid) {
                  try {
                    await updateDoc(doc(db, 'users', profile.uid), { isAdmin: true });
                  } catch (e) {
                    console.warn("Could not auto-grant admin in DB on bypass click:", e);
                  }
                }
              }}
              className="w-full bg-brand hover:shadow-brand text-black py-3 rounded-xl font-black uppercase text-xs tracking-wider transition-all flex items-center justify-center gap-2"
            >
              <span>Developer Bypass Mode</span>
              <ArrowRight size={14} strokeWidth={3} />
            </button>
          </div>
        </motion.div>
      </div>
    );
  }

  // Filtered Users
  const filteredUsers = usersList.filter(user => {
    const matchesSearch = 
      user.email?.toLowerCase().includes(userSearch.toLowerCase()) || 
      user.username?.toLowerCase().includes(userSearch.toLowerCase()) ||
      user.wallet?.toLowerCase().includes(userSearch.toLowerCase());
    
    if (userFilter === 'verified') return matchesSearch && user.isVerified;
    if (userFilter === 'unverified') return matchesSearch && !user.isVerified;
    return matchesSearch;
  });

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-2">
          <div className="flex items-center gap-3">
            <h1 className="text-4xl sm:text-5xl font-black uppercase tracking-tighter italic glow-text">Admin Gateway</h1>
            <span className="bg-brand/10 border border-brand/20 text-brand px-3 py-1 rounded-full text-[10px] font-black tracking-widest uppercase">
              {devBypass ? 'Bypass' : 'Root'}
            </span>
          </div>
          <p className="text-white/40 font-medium italic">Manage network protocol activities, user accounts, and surveys.</p>
        </div>

        {/* Tab Controls */}
        <div className="flex bg-white/5 border border-white/10 p-1.5 rounded-2xl gap-1 overflow-x-auto">
          {(['dashboard', 'users', 'surveys', 'submissions', 'social', 'settings'] as TabType[]).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-5 py-2.5 rounded-xl font-black uppercase text-[10px] tracking-wider transition-all shrink-0 ${
                activeTab === tab 
                  ? 'bg-brand text-black shadow-brand' 
                  : 'text-white/50 hover:text-white hover:bg-white/5'
              }`}
            >
              {tab === 'social' ? '🔗 Social' : tab === 'settings' ? '⚙️ Settings' : tab}
            </button>
          ))}
        </div>
      </div>

      {devBypass && !profile?.isAdmin && (
        <div className="bg-amber-500/10 border border-amber-500/20 text-amber-400 p-5 rounded-2xl flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 text-sm">
          <div className="flex gap-3">
            <AlertCircle size={20} className="shrink-0 mt-0.5" />
            <div>
              <p className="font-bold text-amber-400">Developer Bypass Mode (Database Not Authorized)</p>
              <p className="text-white/60">Your current Firestore account is not marked as admin. You will get permission errors when creating/seeding tasks or surveys.</p>
            </div>
          </div>
          <button
            onClick={handleGrantAdminInDb}
            className="bg-amber-500 hover:bg-amber-600 text-black px-4 py-2 rounded-xl text-xs font-black uppercase tracking-wider shrink-0 transition-all active:scale-95 shadow-[0_0_15px_rgba(245,158,11,0.3)]"
          >
            🔑 Grant Database Admin
          </button>
        </div>
      )}

      {error && (
        <div className="bg-red-500/10 border border-red-500/20 text-red-400 p-5 rounded-2xl flex gap-3 text-sm">
          <AlertCircle size={20} className="shrink-0 mt-0.5" />
          <div>
            <p className="font-bold">Firestore Database Error</p>
            <p className="text-white/60">{error}</p>
          </div>
        </div>
      )}

      {loading ? (
        <div className="h-[40vh] flex flex-col items-center justify-center space-y-4">
          <div className="w-10 h-10 border-4 border-brand/20 border-t-brand rounded-full animate-spin" />
          <p className="text-white/40 font-mono uppercase tracking-[0.2em] text-[10px]">Querying Nodes...</p>
        </div>
      ) : (
        <div className="space-y-8">
          
          {/* TAB 1: DASHBOARD OVERVIEW */}
          {activeTab === 'dashboard' && (
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6"
            >
              <div className="glass-card p-6 rounded-3xl border border-white/10 space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-[10px] uppercase tracking-wider text-white/40 font-black">Total Network Users</span>
                  <div className="w-8 h-8 rounded-lg bg-blue-500/10 flex items-center justify-center text-blue-400">
                    <Users size={16} />
                  </div>
                </div>
                <div className="space-y-1">
                  <h3 className="text-3xl font-black">{usersList.length}</h3>
                  <p className="text-xs text-white/30">Synced profile logs</p>
                </div>
              </div>

              <div className="glass-card p-6 rounded-3xl border border-white/10 space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-[10px] uppercase tracking-wider text-white/40 font-black">Active Surveys</span>
                  <div className="w-8 h-8 rounded-lg bg-brand/10 flex items-center justify-center text-brand">
                    <ClipboardList size={16} />
                  </div>
                </div>
                <div className="space-y-1">
                  <h3 className="text-3xl font-black">{surveysList.length}</h3>
                  <p className="text-xs text-white/30">Published surveys</p>
                </div>
              </div>

              <div className="glass-card p-6 rounded-3xl border border-white/10 space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-[10px] uppercase tracking-wider text-white/40 font-black">Total Submissions</span>
                  <div className="w-8 h-8 rounded-lg bg-emerald-500/10 flex items-center justify-center text-emerald-400">
                    <Activity size={16} />
                  </div>
                </div>
                <div className="space-y-1">
                  <h3 className="text-3xl font-black">{submissionsList.length}</h3>
                  <p className="text-xs text-white/30">User responses logged</p>
                </div>
              </div>

              <div className="glass-card p-6 rounded-3xl border border-white/10 space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-[10px] uppercase tracking-wider text-white/40 font-black">Distributed Points</span>
                  <div className="w-8 h-8 rounded-lg bg-amber-500/10 flex items-center justify-center text-amber-400">
                    <Award size={16} />
                  </div>
                </div>
                <div className="space-y-1">
                  <h3 className="text-3xl font-black text-brand">
                    {usersList.reduce((acc, curr) => acc + (curr.points || 0), 0)} PTS
                  </h3>
                  <p className="text-xs text-white/30">Granted across accounts</p>
                </div>
              </div>
            </motion.div>
          )}

          {/* TAB 2: USER MANAGER */}
          {activeTab === 'users' && (
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-6"
            >
              {/* Search & Filter Controls */}
              <div className="flex flex-col sm:flex-row gap-4 justify-between">
                <div className="relative max-w-md w-full">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-white/30" size={16} />
                  <input
                    type="text"
                    placeholder="Search by Email, Username, or Wallet..."
                    value={userSearch}
                    onChange={(e) => setUserSearch(e.target.value)}
                    className="w-full bg-white/5 border border-white/10 rounded-2xl py-3.5 pl-12 pr-4 focus:outline-none focus:border-brand/40 transition-colors text-sm font-medium"
                  />
                </div>
                
                <div className="flex bg-white/5 border border-white/10 p-1 rounded-xl gap-1">
                  {(['all', 'verified', 'unverified'] as const).map((filter) => (
                    <button
                      key={filter}
                      onClick={() => setUserFilter(filter)}
                      className={`px-4 py-2 rounded-lg font-black uppercase text-[9px] tracking-wider transition-all ${
                        userFilter === filter 
                          ? 'bg-brand/15 border border-brand/20 text-brand' 
                          : 'text-white/40 border border-transparent hover:text-white'
                      }`}
                    >
                      {filter}
                    </button>
                  ))}
                </div>
              </div>

              {/* Users Table */}
              <div className="glass-card rounded-[24px] border border-white/10 overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full border-collapse text-left">
                    <thead>
                      <tr className="border-b border-white/5 text-[10px] uppercase tracking-wider text-white/40 font-black">
                        <th className="p-6">User / Email</th>
                        <th className="p-6">Wallet Address</th>
                        <th className="p-6">Points</th>
                        <th className="p-6">Referral Info</th>
                        <th className="p-6">Tier Status</th>
                        <th className="p-6 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                      {filteredUsers.length === 0 ? (
                        <tr>
                          <td colSpan={6} className="p-10 text-center text-sm text-white/40 italic">
                            No users found matching requirements.
                          </td>
                        </tr>
                      ) : (
                        filteredUsers.map((user) => (
                          <tr key={user.uid} className="hover:bg-white/[0.02] transition-colors">
                            <td className="p-6">
                              <div className="space-y-1">
                                <p className="font-bold text-white flex items-center gap-1.5">
                                  {user.username}
                                  {user.isAdmin && (
                                    <span className="text-[8px] bg-red-500/10 text-red-400 border border-red-500/20 px-1 rounded font-black uppercase tracking-wider">
                                      Admin
                                    </span>
                                  )}
                                </p>
                                <p className="text-xs text-white/40">{user.email}</p>
                              </div>
                            </td>
                            <td className="p-6 font-mono text-xs">
                              {user.wallet ? (
                                <span className="text-white/75 bg-white/5 border border-white/10 px-3 py-1.5 rounded-lg">
                                  {user.wallet.slice(0, 10)}...{user.wallet.slice(-8)}
                                </span>
                              ) : (
                                <span className="text-white/20 italic">Not Connected</span>
                              )}
                            </td>
                            <td className="p-6">
                              {editingUserId === user.uid ? (
                                <div className="flex items-center gap-2">
                                  <input
                                    type="number"
                                    value={editPointsValue}
                                    onChange={(e) => setEditPointsValue(Number(e.target.value))}
                                    className="w-20 bg-black/40 border border-white/25 rounded-lg py-1 px-2 text-sm focus:outline-none focus:border-brand"
                                  />
                                  <button
                                    onClick={() => handleUpdatePoints(user.uid)}
                                    className="bg-brand text-black px-2.5 py-1.5 rounded-lg text-xs font-black"
                                  >
                                    Save
                                  </button>
                                  <button
                                    onClick={() => setEditingUserId(null)}
                                    className="text-white/40 hover:text-white text-xs px-1"
                                  >
                                    Cancel
                                  </button>
                                </div>
                              ) : (
                                <div className="flex items-center gap-2 group">
                                  <span className="font-bold text-brand">{user.points} PTS</span>
                                  <button
                                    onClick={() => {
                                      setEditingUserId(user.uid);
                                      setEditPointsValue(user.points);
                                    }}
                                    className="opacity-0 group-hover:opacity-100 transition-opacity text-white/40 hover:text-brand text-xs"
                                  >
                                    Edit
                                  </button>
                                </div>
                              )}
                            </td>
                            <td className="p-6">
                              <div className="space-y-1 text-xs">
                                <p className="text-white/70">
                                  Code: <span className="font-mono text-white font-bold">{user.referralCode}</span>
                                </p>
                                <p className="text-white/40">
                                  Referrals: <span className="font-bold text-brand">{user.referrals}</span>
                                  {user.referredBy && (
                                    <>
                                      {' '} | Invited by: <span className="font-mono text-white">{user.referredBy}</span>
                                    </>
                                  )}
                                </p>
                              </div>
                            </td>
                            <td className="p-6">
                              <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-wider ${
                                user.isVerified 
                                  ? 'bg-brand/10 text-brand border border-brand/20 shadow-[0_0_10px_rgba(204,255,0,0.15)]' 
                                  : 'bg-white/5 text-white/40 border border-white/10'
                              }`}>
                                <span className={`w-1.5 h-1.5 rounded-full ${user.isVerified ? 'bg-brand' : 'bg-white/20'}`} />
                                {user.isVerified ? 'Premium' : 'Standard'}
                              </span>
                            </td>
                            <td className="p-6 text-right">
                              <button
                                onClick={() => handleToggleVerification(user)}
                                className={`px-4 py-2 rounded-xl text-[9px] font-black uppercase tracking-wider border transition-all ${
                                  user.isVerified
                                    ? 'bg-red-500/5 hover:bg-red-500/10 text-red-400 border-red-500/10'
                                    : 'bg-brand text-black hover:shadow-brand border-transparent'
                                }`}
                              >
                                {user.isVerified ? 'Demote Tier' : 'Verify Node'}
                              </button>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </motion.div>
          )}

          {/* TAB 3: SURVEYS & CRUD */}
          {activeTab === 'surveys' && (
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="grid grid-cols-1 lg:grid-cols-3 gap-8"
            >
              
              {/* Add Survey Form */}
              <div className="lg:col-span-1 space-y-6">
                <div className="glass-card p-6 sm:p-8 rounded-[32px] border border-white/10 space-y-6">
                  <h3 className="text-xl font-black uppercase italic tracking-tight text-white flex items-center gap-2">
                    <Plus size={18} className="text-brand" />
                    Publish Survey
                  </h3>

                  <form onSubmit={handleCreateSurvey} className="space-y-4">
                    <div className="space-y-1.5">
                      <label className="text-[9px] font-black uppercase tracking-[0.2em] text-white/30">Survey Title</label>
                      <input
                        type="text"
                        required
                        value={newSurveyTitle}
                        onChange={(e) => setNewSurveyTitle(e.target.value)}
                        placeholder="e.g. DeFi Staking Feedback"
                        className="w-full bg-black/40 border border-white/10 rounded-xl py-3 px-4 focus:outline-none focus:border-brand/40 text-sm font-semibold text-white/80"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-[9px] font-black uppercase tracking-[0.2em] text-white/30">Description</label>
                      <textarea
                        required
                        value={newSurveyDesc}
                        onChange={(e) => setNewSurveyDesc(e.target.value)}
                        placeholder="Provide details about this research task..."
                        className="w-full bg-black/40 border border-white/10 rounded-xl py-3 px-4 focus:outline-none focus:border-brand/40 text-sm font-semibold text-white/80 min-h-[80px]"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-1.5">
                        <label className="text-[9px] font-black uppercase tracking-[0.2em] text-white/30">Reward (Points)</label>
                        <input
                          type="number"
                          required
                          value={newSurveyReward}
                          onChange={(e) => setNewSurveyReward(Number(e.target.value))}
                          className="w-full bg-black/40 border border-white/10 rounded-xl py-3 px-4 focus:outline-none focus:border-brand/40 text-sm font-semibold text-white/80"
                        />
                      </div>

                      <div className="space-y-1.5">
                        <label className="text-[9px] font-black uppercase tracking-[0.2em] text-white/30">Survey Type</label>
                        <select
                          value={newSurveyType}
                          onChange={(e) => setNewSurveyType(e.target.value as any)}
                          className="w-full bg-black/40 border border-white/10 rounded-xl py-3.5 px-4 focus:outline-none focus:border-brand/40 text-xs font-semibold text-white/80"
                        >
                          <option value="text">Text Response</option>
                          <option value="image">Visual Review</option>
                          <option value="voice">Audio Input</option>
                        </select>
                      </div>
                    </div>

                    {newSurveyType === 'image' && (
                      <div className="space-y-1.5">
                        <label className="text-[9px] font-black uppercase tracking-[0.2em] text-white/30">Survey Image Reference</label>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={(e) => {
                            if (e.target.files && e.target.files[0]) {
                              setNewSurveyImageFile(e.target.files[0]);
                            }
                          }}
                          className="w-full bg-black/40 border border-white/10 rounded-xl py-2 px-4 focus:outline-none focus:border-brand/40 text-sm text-white/80"
                        />
                      </div>
                    )}

                    {/* Questions Builder */}
                    <div className="pt-4 border-t border-white/5 space-y-4">
                      <div className="flex justify-between items-center">
                        <span className="text-[9px] font-black uppercase tracking-[0.2em] text-white/30">
                          Questions ({newQuestions.length})
                        </span>
                        <button
                          type="button"
                          onClick={handleAddQuestion}
                          className="text-brand hover:underline font-black text-[9px] uppercase tracking-wider flex items-center gap-1"
                        >
                          + Add Question
                        </button>
                      </div>

                      <div className="space-y-4 max-h-[300px] overflow-y-auto pr-1">
                        {newQuestions.map((q, idx) => (
                          <div key={idx} className="p-4 bg-white/5 border border-white/10 rounded-2xl space-y-3 relative">
                            {newQuestions.length > 1 && (
                              <button
                                type="button"
                                onClick={() => handleRemoveQuestion(idx)}
                                className="absolute top-2 right-2 text-white/30 hover:text-red-400"
                              >
                                <Trash2 size={14} />
                              </button>
                            )}

                            <div className="space-y-1">
                              <span className="text-[8px] font-black uppercase text-brand">Q{idx + 1} Question Text</span>
                              <input
                                type="text"
                                required
                                value={q.text}
                                onChange={(e) => handleQuestionChange(idx, 'text', e.target.value)}
                                placeholder="Enter question..."
                                className="w-full bg-black/40 border border-white/10 rounded-lg py-2 px-3 focus:outline-none focus:border-brand text-xs"
                              />
                            </div>

                            <div className="grid grid-cols-2 gap-2">
                              <div className="space-y-1">
                                <span className="text-[8px] font-black uppercase text-white/40">Response Format</span>
                                <select
                                  value={q.type}
                                  onChange={(e) => handleQuestionChange(idx, 'type', e.target.value)}
                                  className="w-full bg-black/40 border border-white/10 rounded-lg py-2 px-2 focus:outline-none focus:border-brand text-[9px]"
                                >
                                  <option value="multiple-choice">Multiple Choice</option>
                                  <option value="text">Free Text</option>
                                </select>
                              </div>

                              {q.type === 'multiple-choice' && (
                                <div className="space-y-1">
                                  <span className="text-[8px] font-black uppercase text-white/40">Options (Comma separated)</span>
                                  <input
                                    type="text"
                                    required
                                    defaultValue={q.options?.join(', ')}
                                    onChange={(e) => handleQuestionChange(idx, 'options', e.target.value)}
                                    placeholder="Yes, No, Maybe"
                                    className="w-full bg-black/40 border border-white/10 rounded-lg py-2 px-3 focus:outline-none focus:border-brand text-[9px]"
                                  />
                                </div>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    <button
                      type="submit"
                      disabled={isSubmittingSurvey}
                      className={`w-full font-black uppercase tracking-wider py-3.5 rounded-xl text-xs transition-all mt-4 flex items-center justify-center gap-2 ${
                        isSubmittingSurvey
                          ? 'bg-brand/40 text-black/50 cursor-not-allowed'
                          : 'bg-brand text-black hover:shadow-brand'
                      }`}
                    >
                      {isSubmittingSurvey ? (
                        <>
                          <svg className="animate-spin h-3.5 w-3.5" viewBox="0 0 24 24" fill="none">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/>
                          </svg>
                          Publishing...
                        </>
                      ) : 'Publish to Network'}
                    </button>
                  </form>
                </div>
              </div>

              {/* Surveys List */}
              <div className="lg:col-span-2 space-y-6">
                <div className="glass-card p-6 sm:p-8 rounded-[32px] border border-white/10 space-y-6">
                  <h3 className="text-xl font-black uppercase italic tracking-tight text-white flex items-center gap-2">
                    <Database size={18} className="text-brand" />
                    Published Research ({surveysList.length})
                  </h3>

                  <div className="space-y-4">
                    {surveysList.length === 0 ? (
                      <p className="text-sm text-white/40 italic text-center py-10">No published surveys available.</p>
                    ) : (
                      surveysList.map((survey) => (
                        <div 
                          key={survey.id}
                          className="p-6 bg-white/5 border border-white/10 rounded-3xl flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 hover:border-white/20 transition-all"
                        >
                          <div className="space-y-2">
                            <div className="flex items-center gap-2">
                              <h4 className="font-bold text-white uppercase italic">{survey.title}</h4>
                              <span className="bg-brand/10 border border-brand/20 text-brand px-2 py-0.5 rounded text-[8px] font-black uppercase">
                                {survey.type}
                              </span>
                            </div>
                            <p className="text-xs text-white/40 line-clamp-1">{survey.description}</p>
                            <div className="flex gap-4 text-[10px] text-white/30">
                              <span>Reward: <strong className="text-brand font-bold">+{survey.reward} PTS</strong></span>
                              <span>Questions: <strong>{survey.questions?.length || 0} units</strong></span>
                            </div>
                          </div>

                          {confirmDeleteId === survey.id ? (
                            <div className="flex items-center gap-2 self-end sm:self-center">
                              <span className="text-[9px] text-red-400 font-black uppercase tracking-wider">Confirm?</span>
                              <button
                                onClick={() => handleDeleteSurvey(survey.id)}
                                className="bg-red-500 text-white p-2.5 rounded-xl transition-all hover:bg-red-600"
                                title="Confirm delete"
                              >
                                <CheckCircle2 size={16} />
                              </button>
                              <button
                                onClick={() => setConfirmDeleteId(null)}
                                className="bg-white/10 text-white/60 p-2.5 rounded-xl transition-all hover:bg-white/20"
                                title="Cancel"
                              >
                                ✕
                              </button>
                            </div>
                          ) : (
                            <div className="flex gap-2 self-end sm:self-center">
                              <button
                                onClick={() => setConfirmDeleteId(survey.id)}
                                className="bg-red-500/10 border border-red-500/20 hover:bg-red-500 text-red-400 hover:text-black p-2.5 rounded-xl transition-all"
                                title="Delete survey"
                              >
                                <Trash2 size={16} />
                              </button>
                              <button
                                onClick={() => handleRefreshSurvey(survey.id)}
                                className="bg-blue-500/10 border border-blue-500/20 hover:bg-blue-500 text-blue-400 hover:text-white p-2.5 rounded-xl transition-all"
                                title="Refresh survey"
                              >
                                <RefreshCcw size={16} />
                              </button>
                            </div>
                          )}
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {/* TAB 4: SUBMISSIONS LOG */}
          {activeTab === 'submissions' && (
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="glass-card p-6 sm:p-8 rounded-[32px] border border-white/10 space-y-6"
            >
              <h3 className="text-xl font-black uppercase italic tracking-tight text-white flex items-center gap-2">
                <ListCollapse size={18} className="text-brand" />
                Raw Submission Registry ({submissionsList.length}) <motion.button
  type="button"
  onClick={downloadCSV}
  className="ml-4 bg-brand hover:shadow-brand text-black py-1 px-3 rounded-md text-xs font-black uppercase"
  whileHover={{ scale: 1.05 }}
  whileTap={{ scale: 0.95 }}
  transition={{ duration: 0.1 }}
>
  Download CSV
</motion.button>
              </h3>

              <div className="space-y-6">
                {submissionsList.length === 0 ? (
                  <p className="text-sm text-white/40 italic text-center py-10">No users have submitted answers yet.</p>
                ) : (
                  submissionsList.map((sub) => (
                    <div 
                      key={sub.id} 
                      className="bg-white/5 border border-white/10 rounded-3xl p-6 space-y-4 hover:border-white/20 transition-all"
                    >
                      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 border-b border-white/5 pb-4">
                        <div>
                          <p className="text-[10px] uppercase font-black tracking-wider text-white/40">Survey Mission</p>
                          <h4 className="font-bold text-white text-sm uppercase italic">
                            {getSurveyTitle(sub.surveyId)}
                          </h4>
                        </div>

                        <div className="text-left sm:text-right">
                          <p className="text-[10px] uppercase font-black tracking-wider text-white/40">Submitted By</p>
                          <p className="text-xs font-medium text-brand font-mono">{getUserEmail(sub.userId)}</p>
                        </div>
                      </div>

                      {/* Answers block */}
                      <div className="space-y-3">
                        <p className="text-[9px] uppercase font-black tracking-wider text-white/30">Responses</p>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          {Object.entries(sub.answers || {}).map(([qId, ans]) => (
                            <div key={qId} className="bg-black/30 border border-white/5 p-4 rounded-2xl space-y-1">
                              <span className="text-[8px] font-black text-brand uppercase">{qId} ({getUserEmail(sub.userId)}) Response:</span>
                              <p className="text-xs font-semibold text-white/80">{String(ans)}</p>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </motion.div>
          )}

          {/* TAB 5: SOCIAL LINKS MANAGER */}
          {activeTab === 'social' && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="grid grid-cols-1 lg:grid-cols-3 gap-8"
            >
              {/* Create Task Form */}
              <div className="lg:col-span-1">
                <div className="glass-card p-6 sm:p-8 rounded-[32px] border border-white/10 space-y-6">
                  <h3 className="text-xl font-black uppercase italic tracking-tight text-white flex items-center gap-2">
                    <Link size={18} className="text-brand" />
                    Add Social Task
                  </h3>

                  <form onSubmit={handleCreateSocialTask} className="space-y-4">
                    <div className="space-y-1.5">
                      <label className="text-[9px] font-black uppercase tracking-[0.2em] text-white/30">Task Title</label>
                      <input
                        type="text"
                        required
                        value={newTaskTitle}
                        onChange={(e) => setNewTaskTitle(e.target.value)}
                        placeholder="e.g. Follow NEXT.AI on X"
                        className="w-full bg-black/40 border border-white/10 rounded-xl py-3 px-4 focus:outline-none focus:border-brand/40 text-sm font-semibold text-white/80"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-[9px] font-black uppercase tracking-[0.2em] text-white/30">Description</label>
                      <textarea
                        required
                        value={newTaskDesc}
                        onChange={(e) => setNewTaskDesc(e.target.value)}
                        placeholder="Describe what users need to do..."
                        className="w-full bg-black/40 border border-white/10 rounded-xl py-3 px-4 focus:outline-none focus:border-brand/40 text-sm font-semibold text-white/80 min-h-[70px]"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-[9px] font-black uppercase tracking-[0.2em] text-white/30">Link URL</label>
                      <input
                        type="url"
                        required
                        value={newTaskLink}
                        onChange={(e) => setNewTaskLink(e.target.value)}
                        placeholder="https://x.com/..."
                        className="w-full bg-black/40 border border-white/10 rounded-xl py-3 px-4 focus:outline-none focus:border-brand/40 text-sm font-mono text-white/80"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-1.5">
                        <label className="text-[9px] font-black uppercase tracking-[0.2em] text-white/30">Platform</label>
                        <select
                          value={newTaskPlatform}
                          onChange={(e) => setNewTaskPlatform(e.target.value as SocialTask['platform'])}
                          className="w-full bg-black/40 border border-white/10 rounded-xl py-3.5 px-4 focus:outline-none focus:border-brand/40 text-xs font-semibold text-white/80"
                        >
                          <option value="twitter">Twitter / X</option>
                          <option value="telegram">Telegram</option>
                          <option value="youtube">YouTube</option>
                          <option value="discord">Discord</option>
                          <option value="other">Other</option>
                        </select>
                      </div>

                      <div className="space-y-1.5">
                        <label className="text-[9px] font-black uppercase tracking-[0.2em] text-white/30">Reward (PTS)</label>
                        <input
                          type="number"
                          required
                          min={1}
                          value={newTaskReward}
                          onChange={(e) => setNewTaskReward(Number(e.target.value))}
                          className="w-full bg-black/40 border border-white/10 rounded-xl py-3 px-4 focus:outline-none focus:border-brand/40 text-sm font-semibold text-white/80"
                        />
                      </div>
                    </div>

                    <label className="flex items-center gap-3 cursor-pointer group select-none">
                      <div
                        onClick={() => setNewTaskLocked(v => !v)}
                        className={`w-10 h-5 rounded-full transition-colors relative flex-shrink-0 ${
                          newTaskLocked ? 'bg-amber-500/60 border border-amber-500/40' : 'bg-white/10 border border-white/10'
                        }`}
                      >
                        <span className={`absolute top-0.5 w-4 h-4 rounded-full bg-white transition-all ${
                          newTaskLocked ? 'left-5' : 'left-0.5'
                        }`} />
                      </div>
                      <span className="text-[9px] font-black uppercase tracking-[0.2em] text-white/40 group-hover:text-white/60 transition-colors">
                        Lock Task (require prerequisites)
                      </span>
                    </label>

                    <button
                      type="submit"
                      disabled={isSubmittingTask}
                      className={`w-full font-black uppercase tracking-wider py-3.5 rounded-xl text-xs transition-all mt-2 flex items-center justify-center gap-2 ${
                        isSubmittingTask
                          ? 'bg-brand/40 text-black/50 cursor-not-allowed'
                          : 'bg-brand text-black hover:shadow-brand'
                      }`}
                    >
                      {isSubmittingTask ? (
                        <>
                          <svg className="animate-spin h-3.5 w-3.5" viewBox="0 0 24 24" fill="none">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/>
                          </svg>
                          Saving...
                        </>
                      ) : (
                        <>
                          <Plus size={14} strokeWidth={3} />
                          Publish Task
                        </>
                      )}
                    </button>
                  </form>
                </div>
              </div>

              {/* Tasks List */}
              <div className="lg:col-span-2">
                <div className="glass-card p-6 sm:p-8 rounded-[32px] border border-white/10 space-y-6">
                  <div className="flex items-center justify-between">
                    <h3 className="text-xl font-black uppercase italic tracking-tight text-white flex items-center gap-2">
                      <Database size={18} className="text-brand" />
                      Live Social Tasks ({socialTasksList.length})
                    </h3>
                    <span className="text-[9px] font-black uppercase tracking-widest text-white/30 border border-white/10 px-3 py-1 rounded-full">
                      Firestore · social_tasks
                    </span>
                  </div>

                  {socialTasksList.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-16 space-y-4 text-center">
                      <div className="w-14 h-14 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-white/20">
                        <Link size={24} />
                      </div>
                      <div className="space-y-1">
                        <p className="text-sm text-white/40 italic">No social tasks published yet.</p>
                        <p className="text-xs text-white/20">Tasks added here will appear dynamically on the Neural Missions page.</p>
                      </div>
                      <button
                        type="button"
                        onClick={handleSeedDefaultTasks}
                        disabled={isSeeding}
                        className="bg-brand hover:shadow-brand text-black py-2.5 px-5 rounded-xl text-xs font-black uppercase tracking-wider transition-all disabled:opacity-50"
                      >
                        {isSeeding ? 'Seeding...' : '⚡ Seed Default Tasks'}
                      </button>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {socialTasksList.map((task) => (
                        <div
                          key={task.id}
                          className="p-5 bg-white/5 border border-white/10 rounded-3xl flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 hover:border-white/20 transition-all"
                        >
                          <div className="flex items-start gap-4">
                            <div className={`w-10 h-10 rounded-xl border flex items-center justify-center flex-shrink-0 ${platformColors[task.platform]}`}>
                              <PlatformIcon platform={task.platform} />
                            </div>
                            <div className="space-y-1.5">
                              <div className="flex items-center gap-2 flex-wrap">
                                <h4 className="font-bold text-white uppercase italic text-sm">{task.title}</h4>
                                <span className={`px-2 py-0.5 rounded text-[8px] font-black uppercase border ${platformColors[task.platform]}`}>
                                  {task.platform}
                                </span>
                                {task.locked && (
                                  <span className="px-2 py-0.5 rounded text-[8px] font-black uppercase border bg-amber-500/10 text-amber-400 border-amber-500/20">
                                    Locked
                                  </span>
                                )}
                              </div>
                              <p className="text-xs text-white/40 line-clamp-1">{task.description}</p>
                              <div className="flex gap-4 text-[10px] text-white/30">
                                <span>Reward: <strong className="text-brand font-bold">+{task.reward} PTS</strong></span>
                                <a
                                  href={task.link}
                                  target="_blank"
                                  rel="noreferrer"
                                  className="font-mono text-white/30 hover:text-brand transition-colors truncate max-w-[200px]"
                                >
                                  {task.link}
                                </a>
                              </div>
                            </div>
                          </div>

                          {confirmDeleteTaskId === task.id ? (
                            <div className="flex items-center gap-2 self-end sm:self-center flex-shrink-0">
                              <span className="text-[9px] text-red-400 font-black uppercase tracking-wider">Confirm?</span>
                              <button
                                onClick={() => handleDeleteSocialTask(task.id)}
                                className="bg-red-500 text-white p-2.5 rounded-xl transition-all hover:bg-red-600"
                              >
                                <CheckCircle2 size={16} />
                              </button>
                              <button
                                onClick={() => setConfirmDeleteTaskId(null)}
                                className="bg-white/10 text-white/60 p-2.5 rounded-xl transition-all hover:bg-white/20"
                              >
                                ✕
                              </button>
                            </div>
                          ) : (
                            <button
                              onClick={() => setConfirmDeleteTaskId(task.id)}
                              className="bg-red-500/10 border border-red-500/20 hover:bg-red-500 text-red-400 hover:text-black p-2.5 rounded-xl transition-all self-end sm:self-center flex-shrink-0"
                              title="Delete task"
                            >
                              <Trash2 size={16} />
                            </button>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          )}

          {/* TAB 6: SETTINGS MANAGER */}
          {activeTab === 'settings' && (
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="max-w-2xl mx-auto glass-card p-10 rounded-[40px] border border-white/10 space-y-8 relative overflow-hidden group"
            >
              <div className="space-y-2 relative z-10 border-b border-white/10 pb-6">
                <h2 className="text-3xl font-black uppercase italic tracking-tighter">System settings</h2>
                <p className="text-white/40 text-xs font-semibold tracking-wide uppercase italic">Cardano Network & Treasury Address Configuration</p>
              </div>

              <div className="space-y-6 relative z-10">
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-white/40">Cardano Network</label>
                  <select 
                    value={cardanoNetwork}
                    onChange={(e) => setCardanoNetwork(e.target.value as any)}
                    className="w-full bg-black/40 border border-white/10 rounded-2xl p-4 focus:outline-none focus:border-brand/40 transition-colors font-semibold text-white/80"
                  >
                    <option value="Preprod" className="bg-[#0a0a0a] text-white">Cardano Preprod Testnet</option>
                    <option value="Mainnet" className="bg-[#0a0a0a] text-white">Cardano Mainnet</option>
                  </select>
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-white/40">Treasury Address</label>
                  <input 
                    type="text"
                    placeholder="Enter treasury address (e.g. addr1... or addr_test1...)"
                    value={treasuryAddress}
                    onChange={(e) => setTreasuryAddress(e.target.value)}
                    className="w-full bg-black/40 border border-white/10 rounded-2xl p-4 focus:outline-none focus:border-brand/40 transition-colors font-semibold text-white/80 font-mono text-sm"
                  />
                  <p className="text-[10px] text-white/30 italic">All minting fees and tier upgrades will be routed to this address on the selected network.</p>
                </div>

                <button 
                  onClick={handleSaveSettings}
                  disabled={isSavingSettings || !treasuryAddress.trim()}
                  className="bg-brand text-black px-8 py-4 rounded-xl font-black uppercase tracking-widest text-xs hover:shadow-brand transition-all w-full flex items-center justify-center gap-2"
                >
                  {isSavingSettings ? 'Saving Configuration...' : 'Save Configuration'}
                </button>
              </div>
            </motion.div>
          )}

        </div>
      )}
    </div>
  );
}
