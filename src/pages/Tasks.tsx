import { motion } from 'motion/react';
import { Zap, Twitter, MessageCircle, Youtube, CheckCircle2, ArrowUpRight, Lock } from 'lucide-react';
import { cn } from '../lib/utils';
import { useAuth } from '../context/AuthContext';
import { doc, updateDoc, arrayUnion, increment } from 'firebase/firestore';
import { getFirebaseDb } from '../lib/firebase';

const tasks = [
  { id: 'follow-ceo', title: 'Follow CEO on X', reward: 20, icon: Twitter, bColor: 'bg-amber-500/10', iColor: 'text-amber-400', link: 'https://x.com/ogleksb', description: 'Follow the official X profile of the NEXT.AI CEO for insider insights, announcements, and vision.' },
  { id: 'follow-admin-twitter', title: 'Follow Admin on X', reward: 10, icon: Twitter, bColor: 'bg-blue-500/10', iColor: 'text-blue-400', link: 'https://x.com/Ghdaniel19', description: 'Follow our official Administrator (@Ghdaniel19) on X for verified network directives.' },
  { id: 'join-telegram', title: 'Join Official Telegram', reward: 15, icon: MessageCircle, bColor: 'bg-emerald-500/10', iColor: 'text-emerald-400', link: 'https://t.me/nextai', description: 'Engage with other contributors in our secure neural channel.' },
  { id: 'follow-wnxt', title: 'Follow WNXT (Official)', reward: 20, icon: Twitter, bColor: 'bg-cyan-500/10', iColor: 'text-cyan-400', link: 'https://x.com/G_WNXT', description: 'Follow our official WNXT handle on X to stay updated on node and protocol developments.' },
  { id: 'follow-gimbalabs', title: 'Follow Gimbalabs (Partners)', reward: 15, icon: Twitter, bColor: 'bg-indigo-500/10', iColor: 'text-indigo-400', link: 'https://x.com/gimbalabs', description: 'Connect with Gimbalabs on X, our core partner building decentralized APIs and learning spaces.' },
  { id: 'follow-cardanocf', title: 'Follow Cardano Foundation', reward: 15, icon: Twitter, bColor: 'bg-sky-500/10', iColor: 'text-sky-400', link: 'https://x.com/Cardano_CF', description: 'Follow the Cardano Foundation on X, backing the growth and adoption of Cardano ecosystem.' },
  { id: 'watch-ama', title: 'Watch Protocol AMA', reward: 50, icon: Youtube, bColor: 'bg-red-500/10', iColor: 'text-red-400', locked: true, description: 'Unlock this mission by completing 3 research surveys.' },
];

export default function Tasks() {
  const { profile } = useAuth();

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

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {tasks.map((task, i) => {
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
                  <div className={cn("w-16 h-16 rounded-2xl flex items-center justify-center", task.bColor, task.iColor)}>
                    <task.icon size={32} />
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
                  <div className="w-full h-14 bg-brand/10 border border-brand/20 rounded-2xl flex items-center justify-center space-x-2 text-brand font-black uppercase text-xs">
                    <CheckCircle2 size={14} />
                    <span>VERIFIED</span>
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
    </div>
  );
}
