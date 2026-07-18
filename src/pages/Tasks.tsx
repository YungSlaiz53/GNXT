import { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Zap, Twitter, MessageCircle, Youtube, CheckCircle2, ArrowUpRight, Lock, Globe } from 'lucide-react';
import { cn } from '../lib/utils';
import { useAuth } from '../context/AuthContext';
import { doc, updateDoc, arrayUnion, increment, collection, getDocs, query, orderBy } from 'firebase/firestore';
import { getFirebaseDb } from '../lib/firebase';
import type { SocialTask } from '../types';

// ---------- Static fallback tasks (used when social_tasks collection is empty) ----------
const FALLBACK_TASKS: SocialTask[] = [
  { id: 'follow-ceo', title: 'Follow CEO on X', reward: 20, platform: 'twitter', link: 'https://x.com/ogleksb', description: 'Follow the official X profile of the NEXT.AI CEO for insider insights, announcements, and vision.', order: 0 },
  { id: 'follow-admin-twitter', title: 'Follow Admin on X', reward: 10, platform: 'twitter', link: 'https://x.com/Ghdaniel19', description: 'Follow our official Administrator (@Ghdaniel19) on X for verified network directives.', order: 1 },
  { id: 'join-telegram', title: 'Join Official Telegram', reward: 15, platform: 'telegram', link: 'https://t.me/nextai', description: 'Engage with other contributors in our secure neural channel.', order: 2 },
  { id: 'follow-wnxt', title: 'Follow WNXT (Official)', reward: 20, platform: 'twitter', link: 'https://x.com/G_WNXT', description: 'Follow our official WNXT handle on X to stay updated on node and protocol developments.', order: 3 },
  { id: 'follow-gimbalabs', title: 'Follow Gimbalabs (Partners)', reward: 15, platform: 'twitter', link: 'https://x.com/gimbalabs', description: 'Connect with Gimbalabs on X, our core partner building decentralized APIs and learning spaces.', order: 4 },
  { id: 'follow-cardanocf', title: 'Follow Cardano Foundation', reward: 15, platform: 'twitter', link: 'https://x.com/Cardano_CF', description: 'Follow the Cardano Foundation on X, backing the growth and adoption of Cardano ecosystem.', order: 5 },
  { id: 'watch-ama', title: 'Watch Protocol AMA', reward: 50, platform: 'youtube', link: '', locked: true, description: 'Unlock this mission by completing 3 research surveys.', order: 6 },
];

// Platform → Lucide icon & color classes
const PLATFORM_META: Record<SocialTask['platform'], { Icon: React.ElementType; bColor: string; iColor: string }> = {
  twitter:  { Icon: Twitter,       bColor: 'bg-sky-500/10',     iColor: 'text-sky-400' },
  telegram: { Icon: MessageCircle, bColor: 'bg-emerald-500/10', iColor: 'text-emerald-400' },
  youtube:  { Icon: Youtube,       bColor: 'bg-red-500/10',     iColor: 'text-red-400' },
  discord:  { Icon: Zap,           bColor: 'bg-indigo-500/10',  iColor: 'text-indigo-400' },
  other:    { Icon: Globe,         bColor: 'bg-white/5',        iColor: 'text-white/40' },
};

export default function Tasks() {
  const { profile } = useAuth();
  const [tasks, setTasks] = useState<SocialTask[]>([]);
  const [loadingTasks, setLoadingTasks] = useState(true);

  // Load tasks from Firestore; fall back to static list if collection is empty
  useEffect(() => {
    const fetchTasks = async () => {
      const db = getFirebaseDb();
      if (!db) { setTasks(FALLBACK_TASKS); setLoadingTasks(false); return; }
      try {
        const snap = await getDocs(query(collection(db, 'social_tasks'), orderBy('order', 'asc')));
        if (snap.empty) {
          setTasks(FALLBACK_TASKS);
        } else {
          setTasks(snap.docs.map(d => ({ id: d.id, ...d.data() })) as SocialTask[]);
        }
      } catch {
        setTasks(FALLBACK_TASKS);
      } finally {
        setLoadingTasks(false);
      }
    };
    fetchTasks();
  }, []);

  const handleTaskClick = async (taskId: string, reward: number, link?: string) => {
    if (!profile) return;

    // Open the external link regardless of completion status
    if (link) window.open(link, '_blank');

    // If already completed, do not award points
    if (profile.completedTasks?.includes(taskId)) return;

    const db = getFirebaseDb();
    if (db && profile.uid) {
      try {
        const userRef = doc(db, 'users', profile.uid);
        await updateDoc(userRef, {
          points: increment(reward),
          completedTasks: arrayUnion(taskId)
        });
      } catch (error) {
        console.error('Error completing task:', error);
      }
    }
  };

  return (
    <div className="space-y-12">
      <div className="flex flex-col gap-2">
        <h1 className="text-5xl font-black uppercase tracking-tighter italic glow-text">Neural Missions</h1>
        <p className="text-white/40 font-medium italic">Complete social and technical tasks to increase your protocol reputation.</p>
      </div>

      {loadingTasks ? (
        <div className="h-[30vh] flex flex-col items-center justify-center space-y-4">
          <div className="w-8 h-8 border-4 border-brand/20 border-t-brand rounded-full animate-spin" />
          <p className="text-white/40 font-mono uppercase tracking-[0.2em] text-[10px]">Loading Missions...</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {tasks.map((task, i) => {
            const meta = PLATFORM_META[task.platform] ?? PLATFORM_META.other;
            const Icon = meta.Icon;
            const isCompleted = profile?.completedTasks?.includes(task.id);
            return (
              <motion.div 
                key={task.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                className={cn(
                  "glass-card p-8 rounded-[40px] border border-white/10 flex flex-col justify-between group",
                  (task.locked || isCompleted) && "opacity-60"
                )}
              >
                <div className="space-y-6">
                  <div className="flex justify-between items-start">
                    <div className={cn("w-16 h-16 rounded-2xl flex items-center justify-center", meta.bColor, meta.iColor)}>
                      <Icon size={32} />
                    </div>
                    <div className="bg-brand/10 border border-brand/20 px-4 py-1.5 rounded-full">
                      <span className="text-brand font-black italic uppercase text-[10px] tracking-widest">
                        {task.locked ? "LOCKED" : isCompleted ? "COMPLETED" : `+${task.reward} PTS`}
                      </span>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <h3 className="text-2xl font-black uppercase tracking-tight italic">{task.title}</h3>
                    <p className="text-sm text-white/40 leading-relaxed font-medium">{task.description}</p>
                  </div>
                </div>

                <div className="mt-10">
                  {task.locked ? (
                    <button disabled className="w-full h-14 bg-white/5 border border-white/10 rounded-2xl flex items-center justify-center space-x-2 text-white/20 font-black uppercase text-xs">
                      <Lock size={14} />
                      <span>LOCKED</span>
                    </button>
                  ) : isCompleted ? (
                    <div className="flex items-center gap-2">
                      <div className="flex items-center justify-center h-14 px-4 bg-brand/10 border border-brand/20 rounded-2xl text-brand font-black uppercase text-xs">
                        <CheckCircle2 size={14} />
                        <span className="ml-1">VERIFIED</span>
                      </div>
                      <button
                        onClick={() => window.open(task.link, '_blank')}
                        className="flex items-center justify-center h-14 px-4 bg-brand/20 border border-brand/30 rounded-2xl text-brand font-black uppercase text-xs hover:shadow-brand transition-all"
                      >
                        <ArrowUpRight size={14} strokeWidth={3} />
                      </button>
                    </div>
                  ) : (
                    <button 
                      onClick={() => handleTaskClick(task.id, task.reward, task.link)}
                      className="w-full h-14 bg-brand text-black rounded-2xl flex items-center justify-center space-x-2 font-black uppercase text-xs hover:shadow-brand transition-all active:scale-[0.98]"
                    >
                      <span>LAUNCH MISSION</span>
                      <ArrowUpRight size={14} strokeWidth={3} />
                    </button>
                  )}
                </div>
              </motion.div>
            );
          })}
        </div>
      )}
    </div>
  );
}
