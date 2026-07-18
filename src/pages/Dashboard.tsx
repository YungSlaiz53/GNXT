import { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { ArrowUpRight, Zap, Twitter, MessageCircle, Youtube, CheckCircle2 } from 'lucide-react';
import { cn } from '../lib/utils';
import { useAuth } from '../context/AuthContext';
import { doc, updateDoc, arrayUnion, increment, collection, query, orderBy, limit, getDocs, where, getCountFromServer } from 'firebase/firestore';
import { getFirebaseDb } from '../lib/firebase';
import { useNavigate } from 'react-router-dom';
import { Survey } from '../types';

export default function Dashboard() {
  const { profile } = useAuth();
  const navigate = useNavigate();
  const [featuredSurvey, setFeaturedSurvey] = useState<Survey | null>(null);
  const [rank, setRank] = useState<number | null>(null);

  useEffect(() => {
    const fetchFeatured = async () => {
      const db = getFirebaseDb();
      if (!db) return;
      const q = query(collection(db, 'surveys'), orderBy('createdAt', 'desc'), limit(1));
      const snapshot = await getDocs(q);
      if (!snapshot.empty) {
        setFeaturedSurvey({ id: snapshot.docs[0].id, ...snapshot.docs[0].data() } as Survey);
      }
    };
    fetchFeatured();
  }, []);

  useEffect(() => {
    const fetchRank = async () => {
      if (!profile) return;
      const db = getFirebaseDb();
      if (!db) return;

      try {
        const userPoints = profile.points || 0;
        const q = query(
          collection(db, 'users'),
          where('points', '>', userPoints)
        );
        const snapshot = await getCountFromServer(q);
        setRank(snapshot.data().count + 1);
      } catch (error) {
        console.error('Error fetching user rank:', error);
      }
    };
    fetchRank();
  }, [profile?.points, profile?.uid]);
  
  const stats = [
    { label: 'Total Points', value: profile?.points?.toLocaleString() || '0', unit: 'NXTP', color: 'text-brand' },
    { label: 'Rank', value: rank !== null ? `#${rank}` : '...', unit: 'GLOBAL', color: 'text-white' },
    { label: 'Daily Streak', value: `${profile?.streakCount || 1} Days`, unit: '🔥', color: 'text-white' },
    { label: 'Referrals', value: profile?.referrals?.toString() || '0', unit: `+${(profile?.referrals || 0) * 20} PTS`, color: 'text-white' },
  ];

  const handleTaskClick = async (taskId: string, reward: number, link?: string) => {
    if (!profile || profile.completedTasks?.includes(taskId)) return;

    if (link) window.open(link, '_blank');

    const db = getFirebaseDb();
    if (db && profile.uid) {
      try {
        const userRef = doc(db, 'users', profile.uid);
        await updateDoc(userRef, {
          points: increment(reward),
          completedTasks: arrayUnion(taskId)
        });
        console.log(`Task ${taskId} completed! +${reward} PTS`);
      } catch (error) {
        console.error('Error completing task:', error);
      }
    }
  };

  return (
    <div className="space-y-10">
      {/* Stats Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, i) => (
          <motion.div 
            key={i}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: i * 0.1 }}
            className="glass-card p-6 rounded-[32px] border border-white/10"
          >
            <p className="text-white/40 text-[10px] uppercase font-black tracking-widest mb-2">{stat.label}</p>
            <div className="flex items-baseline space-x-2">
              <span className={cn("text-3xl font-black tracking-tighter", stat.color)}>{stat.value}</span>
              <span className="text-[10px] text-white/20 font-bold uppercase">{stat.unit}</span>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Main Action Area */}
      <div className="grid grid-cols-12 gap-8">
        
        {/* Featured Card */}
        <motion.div 
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="col-span-12 lg:col-span-8 relative rounded-[40px] overflow-hidden bg-gradient-to-br from-[#111] to-[#000] border border-white/10 p-10 flex flex-col justify-between min-h-[400px] group"
        >
          <div className="absolute top-0 right-0 p-8">
            <div className="bg-brand text-black text-[10px] font-black uppercase px-3 py-1 rounded-full shadow-[0_0_15px_rgba(204,255,0,0.5)]">Featured</div>
          </div>
          
          <div className="max-w-md">
            <h3 className="text-4xl sm:text-5xl font-black leading-none mb-6 tracking-tighter uppercase italic">
              {featuredSurvey?.title || 'Loading Protocol...'}
            </h3>
            <p className="text-white/40 leading-relaxed mb-8 text-sm font-medium">
              {featuredSurvey?.description || 'Synchronizing with the neural network...'}
            </p>
            
            <div className="flex items-center space-x-12 mb-10">
              <div className="flex flex-col">
                <span className="text-[10px] uppercase text-white/30 tracking-[0.2em] font-bold mb-1">Reward</span>
                <span className="text-xl font-black text-brand">+{featuredSurvey?.reward || 0} PTS</span>
              </div>
              <div className="flex flex-col">
                <span className="text-[10px] uppercase text-white/30 tracking-[0.2em] font-bold mb-1">Questions</span>
                <span className="text-xl font-black">{featuredSurvey?.questions?.length || 0} UNITS</span>
              </div>
              <div className="flex flex-col">
                <span className="text-[10px] uppercase text-white/30 tracking-[0.2em] font-bold mb-1">Estimate</span>
                <span className="text-xl font-black">4 MIN</span>
              </div>
            </div>
          </div>

          <button 
            onClick={() => navigate('/surveys')}
            className="w-full bg-brand text-black font-black h-16 rounded-2xl flex items-center justify-center space-x-3 hover:scale-[0.99] transition-all shadow-[0_10px_40px_rgba(204,255,0,0.2)] hover:shadow-brand"
          >
            <span>START RESEARCH</span>
            <ArrowUpRight size={20} strokeWidth={3} />
          </button>
          
          {/* Decorative background element */}
          <div className="absolute -bottom-12 -right-12 w-64 h-64 bg-brand/5 rounded-full blur-3xl group-hover:bg-brand/10 transition-colors" />
        </motion.div>

        {/* Side Tasks */}
        <div className="col-span-12 lg:col-span-4 flex flex-col space-y-6">
          <div className="glass-card rounded-[32px] p-6 flex flex-col flex-1 border border-white/10">
            <h4 className="text-xs font-black uppercase tracking-widest text-white/40 mb-6 flex items-center gap-2">
              <Zap size={14} className="text-brand" />
              Social Missions
            </h4>
            <div className="space-y-4">
              {[
                { id: 'follow-ceo', title: 'Follow CEO on X', reward: 20, icon: Twitter, bColor: 'bg-amber-500/10', iColor: 'text-amber-400', link: 'https://x.com/ogleksb', locked: false },
                { id: 'follow-admin-twitter', title: 'Follow Admin on X', reward: 10, icon: Twitter, bColor: 'bg-blue-500/10', iColor: 'text-blue-400', link: 'https://x.com/Ghdaniel19', locked: false },
                { id: 'join-telegram', title: 'Join Telegram', reward: 15, icon: MessageCircle, bColor: 'bg-emerald-500/10', iColor: 'text-emerald-400', link: 'https://t.me/nextai', locked: false },
              ].map((task, i) => {
                const isCompleted = profile?.completedTasks?.includes(task.id);
                return (
                  <div 
                    key={i} 
                    onClick={() => !task.locked && !isCompleted && handleTaskClick(task.id, task.reward, task.link)}
                    className={cn(
                      "group flex items-center justify-between p-4 rounded-2xl bg-black/40 border border-white/5 transition-all cursor-pointer",
                      (task.locked || isCompleted) ? "opacity-40 grayscale pointer-events-none" : "hover:border-brand/40"
                    )}
                  >
                    <div className="flex items-center space-x-3">
                      <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center", task.bColor, task.iColor)}>
                        <task.icon size={20} />
                      </div>
                      <div>
                        <p className="text-sm font-bold">{task.title}</p>
                        <p className={cn("text-[10px] font-black uppercase", (task.locked || isCompleted) ? "text-white/20" : "text-brand")}>
                          {task.locked ? "LOCKED" : isCompleted ? "COMPLETED" : `+${task.reward} PTS`}
                        </p>
                      </div>
                    </div>
                    {!task.locked && !isCompleted && <ArrowUpRight className="text-white/20 group-hover:text-brand transition-colors" size={16} />}
                    {isCompleted && <CheckCircle2 className="text-brand" size={16} />}
                  </div>
                );
              })}
            </div>

            <div className="mt-8 pt-6 border-t border-white/5 space-y-4">
              <div className="bg-brand/5 border border-dashed border-brand/20 rounded-2xl p-4 flex items-center justify-between">
                <span className="text-[10px] text-white/40 uppercase tracking-widest font-bold">Multiplier</span>
                <span className="text-xs font-black text-brand">1.2X ACTIVE</span>
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
