import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { motion, AnimatePresence } from 'motion/react';
import { Users, Copy, Share2, Award, CheckCircle2, Loader2, Search } from 'lucide-react';
import { collection, query, where, orderBy, getDocs } from 'firebase/firestore';
import { getFirebaseDb } from '../lib/firebase';
import { UserProfile } from '../types';
import { useEffect } from 'react';

export default function Referrals() {
  const { profile } = useAuth();
  const [copied, setCopied] = useState(false);
  const [referredUsers, setReferredUsers] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(true);

  const referralCode = profile?.referralCode || "LOADING...";
  const referralLink = `${window.location.origin}/auth?ref=${referralCode}`;

  useEffect(() => {
    const fetchReferred = async () => {
      if (!profile?.referralCode) return;
      const db = getFirebaseDb();
      if (!db) return;

      try {
        const q = query(
          collection(db, 'users'),
          where('referredBy', '==', profile.referralCode),
          orderBy('joinedAt', 'desc')
        );
        const snapshot = await getDocs(q);
        const fetched = snapshot.docs.map(doc => doc.data() as UserProfile);
        setReferredUsers(fetched);
      } catch (e) {
        console.error('Error fetching referred users:', e);
      } finally {
        setLoading(false);
      }
    };

    fetchReferred();
  }, [profile?.referralCode]);

  const copyToClipboard = () => {
    navigator.clipboard.writeText(referralLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-10 max-w-6xl mx-auto">
      <div className="flex flex-col gap-2">
        <h1 className="text-4xl font-black uppercase tracking-tighter italic glow-text">Referral Protocol</h1>
        <p className="text-white/40 font-medium italic">Expand the ecosystem and secure perpetual yield bonuses.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-1 space-y-6">
          <div className="glass-card p-10 rounded-[40px] space-y-8 border border-white/10 relative overflow-hidden group">
            <div className="space-y-3 relative z-10">
              <p className="text-[10px] text-white/30 uppercase tracking-[0.2em] font-black">Your Protocol ID</p>
              <div className="flex items-center gap-4 p-4 bg-brand/5 border border-brand/20 rounded-2xl group-hover:border-brand/40 transition-colors shadow-brand/10">
                <span className="text-2xl font-black italic tracking-tighter text-brand uppercase">{referralCode}</span>
                <button
                  onClick={copyToClipboard}
                  className="ml-auto p-2 hover:bg-brand/10 rounded-lg transition-colors text-brand"
                >
                  {copied ? <CheckCircle2 size={20} /> : <Copy size={20} />}
                </button>
              </div>
            </div>

            <button
              onClick={copyToClipboard}
              className="w-full bg-brand text-black py-5 rounded-2xl font-black uppercase tracking-widest text-xs flex items-center justify-center gap-3 hover:shadow-brand transition-all active:scale-95 relative z-10"
            >
              <AnimatePresence mode="wait">
                {copied ? (
                  <motion.div
                    key="copied"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="flex items-center gap-2"
                  >
                    <CheckCircle2 size={20} strokeWidth={3} />
                    Link Transmitted
                  </motion.div>
                ) : (
                  <motion.div
                    key="transmit"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="flex items-center gap-2"
                  >
                    <Share2 size={20} strokeWidth={3} />
                    Transmit Link
                  </motion.div>
                )}
              </AnimatePresence>
            </button>

            {/* Background pattern */}
            <Users className="absolute -bottom-10 -left-10 opacity-[0.03] rotate-12" size={200} />
          </div>

          <div className="glass-card p-8 rounded-[32px] space-y-6 border border-white/10">
            <h3 className="text-xs font-black uppercase tracking-widest text-white/40 flex items-center gap-2">
              <Award size={14} className="text-brand" />
              Yield Distribution
            </h3>
            <div className="space-y-4">
              <div className="flex items-center gap-4 p-4 bg-white/5 rounded-2xl border border-white/5">
                <div className="w-10 h-10 rounded-xl bg-brand/10 flex items-center justify-center text-brand">
                  <span className="font-black italic text-sm">20</span>
                </div>
                <div>
                  <p className="text-xs font-black uppercase tracking-tighter italic">Referrer Reward</p>
                  <p className="text-brand font-black text-xs tracking-widest">PER REGISTRATION</p>
                </div>
              </div>
              <div className="flex items-center gap-4 p-4 bg-white/5 rounded-2xl border border-white/5">
                <div className="w-10 h-10 rounded-xl bg-brand/10 flex items-center justify-center text-brand">
                  <span className="font-black italic text-sm">10</span>
                </div>
                <div>
                  <p className="text-xs font-black uppercase tracking-tighter italic">Invitee Bonus</p>
                  <p className="text-brand font-black text-xs tracking-widest">ON SIGNUP</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="lg:col-span-2 glass-card p-10 rounded-[40px] space-y-10 border border-white/10">
          <div className="flex items-center justify-between border-b border-white/10 pb-8">
            <h2 className="text-2xl font-black uppercase tracking-tight italic flex items-center gap-3">
              <Users className="text-brand" size={28} />
              Recent Interceptions
            </h2>
            <div className="bg-white/5 border border-white/10 px-4 py-1 rounded-full">
              <span className="text-[10px] text-white/40 font-black uppercase tracking-widest">
                Total: {referredUsers.length.toString().padStart(2, '0')} Users
              </span>
            </div>
          </div>

          <div className="space-y-4 min-h-[300px]">
            {loading ? (
              <div className="flex flex-col items-center justify-center py-20 space-y-4">
                <Loader2 className="w-10 h-10 text-brand animate-spin" />
                <p className="text-[10px] font-black uppercase tracking-widest text-white/20">Scanning Network...</p>
              </div>
            ) : referredUsers.length > 0 ? (
              referredUsers.map((user, i) => {
                const avatar = user.username.substring(0, 2).toUpperCase();
                return (
                  <div key={user.uid} className="flex items-center justify-between p-6 bg-white/5 hover:bg-white/10 border border-white/5 rounded-[24px] transition-all group">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-2xl bg-brand/10 border border-brand/10 flex items-center justify-center group-hover:bg-brand group-hover:text-black transition-colors">
                        <span className="text-brand group-hover:text-black text-sm font-black italic uppercase">{avatar}</span>
                      </div>
                      <div>
                        <h4 className="font-bold text-lg group-hover:text-brand transition-colors italic uppercase tracking-tight">{user.username}</h4>
                        <p className="text-[10px] text-white/30 font-black uppercase tracking-widest">
                          Verified • Joined {user.joinedAt?.toDate ? user.joinedAt.toDate().toLocaleDateString() : 'Just now'}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-xl font-black italic tracking-tighter text-brand">+20 NXTP</p>
                      <p className="text-[10px] text-brand/40 uppercase font-black tracking-widest">Distributed</p>
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="flex flex-col items-center justify-center py-20 space-y-4">
                <Search className="w-10 h-10 text-white/10" />
                <p className="text-[10px] font-black uppercase tracking-widest text-white/20">No Referrals Detected</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
