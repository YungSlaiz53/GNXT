import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
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
  ListCollapse
} from 'lucide-react';
import { collection, getDocs, doc, updateDoc, addDoc, deleteDoc, query, orderBy, serverTimestamp } from 'firebase/firestore';
import { getFirebaseDb } from '../lib/firebase';
import { useAuth } from '../context/AuthContext';
import { UserProfile, Survey, SurveyQuestion } from '../types';

type TabType = 'dashboard' | 'users' | 'surveys' | 'submissions';

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
  const [newSurveyReward, setNewSurveyReward] = useState(25);
  const [newSurveyType, setNewSurveyType] = useState<'text' | 'image' | 'voice'>('text');
  const [newQuestions, setNewQuestions] = useState<Omit<SurveyQuestion, 'id'>[]>([
    { text: '', type: 'multiple-choice', options: ['Yes', 'No'] }
  ]);

  // Points Editing State
  const [editingUserId, setEditingUserId] = useState<string | null>(null);
  const [editPointsValue, setEditPointsValue] = useState<number>(0);

  // Check Admin Role or local bypass
  const isLocalhost = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
  const hasAdminAccess = profile?.isAdmin || devBypass || (isLocalhost && devBypass);

  const fetchAdminData = async () => {
    const db = getFirebaseDb();
    if (!db) return;
    
    setLoading(true);
    setError(null);
    try {
      // 1. Fetch Users
      const usersSnap = await getDocs(collection(db, 'users'));
      const fetchedUsers = usersSnap.docs.map(doc => ({
        uid: doc.id,
        ...doc.data()
      })) as UserProfile[];
      setUsersList(fetchedUsers);

      // 2. Fetch Surveys
      const surveysSnap = await getDocs(query(collection(db, 'surveys'), orderBy('createdAt', 'desc')));
      const fetchedSurveys = surveysSnap.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Survey[];
      setSurveysList(fetchedSurveys);

      // 3. Fetch User Submissions
      const submissionsSnap = await getDocs(collection(db, 'user_answers'));
      const fetchedSubmissions = submissionsSnap.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setSubmissionsList(fetchedSubmissions);
    } catch (e: any) {
      console.error('Error fetching admin data:', e);
      setError(e.message || 'Failed to load administration data. Check Firestore rules.');
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
    const db = getFirebaseDb();
    if (!db) return;

    // Validate questions
    if (newQuestions.some(q => q.text.trim() === '')) {
      alert('Please fill out all question texts.');
      return;
    }

    try {
      const surveysCol = collection(db, 'surveys');
      const questionsWithIds: SurveyQuestion[] = newQuestions.map((q, i) => ({
        id: `q${i + 1}`,
        text: q.text,
        type: q.type,
        options: q.type === 'multiple-choice' ? q.options : undefined
      }));

      const newSurvey = {
        title: newSurveyTitle,
        description: newSurveyDesc,
        reward: Number(newSurveyReward),
        type: newSurveyType,
        createdAt: serverTimestamp(),
        questions: questionsWithIds
      };

      const docRef = await addDoc(surveysCol, newSurvey);
      
      // Update local state
      setSurveysList(prev => [{ id: docRef.id, ...newSurvey } as Survey, ...prev]);

      // Reset Form
      setNewSurveyTitle('');
      setNewSurveyDesc('');
      setNewSurveyReward(25);
      setNewQuestions([{ text: '', type: 'multiple-choice', options: ['Yes', 'No'] }]);
      alert('Survey created and published successfully!');
    } catch (e) {
      console.error('Failed to create survey:', e);
      alert('Error creating survey.');
    }
  };

  const handleDeleteSurvey = async (surveyId: string) => {
    if (!confirm('Are you sure you want to delete this survey? This cannot be undone.')) return;
    
    const db = getFirebaseDb();
    if (!db) return;

    try {
      await deleteDoc(doc(db, 'surveys', surveyId));
      setSurveysList(prev => prev.filter(s => s.id !== surveyId));
    } catch (e) {
      console.error('Failed to delete survey:', e);
      alert('Error deleting survey.');
    }
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
              onClick={() => setDevBypass(true)}
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
          {(['dashboard', 'users', 'surveys', 'submissions'] as TabType[]).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-5 py-2.5 rounded-xl font-black uppercase text-[10px] tracking-wider transition-all shrink-0 ${
                activeTab === tab 
                  ? 'bg-brand text-black shadow-brand' 
                  : 'text-white/50 hover:text-white hover:bg-white/5'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>

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
                      className="w-full bg-brand text-black hover:shadow-brand font-black uppercase tracking-wider py-3.5 rounded-xl text-xs transition-all mt-4"
                    >
                      Publish to Network
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

                          <button
                            onClick={() => handleDeleteSurvey(survey.id)}
                            className="bg-red-500/10 border border-red-500/20 hover:bg-red-500 text-red-400 hover:text-black p-2.5 rounded-xl transition-all self-end sm:self-center"
                          >
                            <Trash2 size={16} />
                          </button>
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
                Raw Submission Registry ({submissionsList.length})
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
                              <span className="text-[8px] font-black text-brand uppercase">{qId} Response:</span>
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

        </div>
      )}
    </div>
  );
}
