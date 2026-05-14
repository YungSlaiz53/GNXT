import { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Trophy, Star, TrendingUp, Search, Loader2 } from 'lucide-react';
import { cn } from '../lib/utils';
import { collection, query, orderBy, limit, getDocs } from 'firebase/firestore';
import { getFirebaseDb } from '../lib/firebase';
import { UserProfile } from '../types';

const categories = ['Points', 'Referrals', 'Weekly'];

export default function Leaderboard() {
  const [players, setPlayers] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState('Points');

  useEffect(() => {
    const fetchLeaderboard = async () => {
      setLoading(true);
      const db = getFirebaseDb();
      if (!db) return;

      try {
        const orderField = activeCategory === 'Points' ? 'points' : 'referrals';
        const q = query(
          collection(db, 'users'), 
          orderBy(orderField, 'desc'), 
          limit(20)
        );
        const snapshot = await getDocs(q);
        const fetched = snapshot.docs.map(doc => doc.data() as UserProfile);
        setPlayers(fetched);
      } catch (e) {
        console.error('Leaderboard error:', e);
      } finally {
        setLoading(false);
      }
    };

    fetchLeaderboard();
  }, [activeCategory]);

  return (
    <div className="space-y-10 max-w-5xl mx-auto">
      <div className="flex flex-col gap-2">
        <h1 className="text-4xl font-black uppercase tracking-tighter italic glow-text">Rank Dominance</h1>
        <p className="text-white/40 font-medium italic">The elite performing nodes within the NEXT.AI ecosystem.</p>
      </div>

      <div className="flex flex-wrap gap-3">
        {categories.map((cat) => (
          <button 
            key={cat} 
            onClick={() => setActiveCategory(cat)}
            className={cn(
              "px-8 py-2.5 rounded-full text-[10px] font-black uppercase tracking-widest transition-all border",
              activeCategory === cat ? "bg-brand text-black border-brand shadow-brand" : "bg-white/5 text-white/40 border-white/10 hover:border-brand/40 hover:text-white"
            )}
          >
            {cat}
          </button>
        ))}
      </div>

      <div className="glass-card rounded-[40px] overflow-hidden border border-white/10">
        <div className="p-8 border-b border-white/10 bg-white/5 flex items-center justify-between">
          <div className="flex items-center gap-4">
             <div className="p-2.5 bg-yellow-400/10 rounded-lg">
                <Trophy className="text-yellow-400" size={20} />
             </div>
            <span className="font-black uppercase tracking-widest text-sm">Protocol Elite</span>
          </div>
        </div>

        <div className="divide-y divide-white/5 min-h-[400px]">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-32 space-y-4">
              <Loader2 className="w-10 h-10 text-brand animate-spin" />
              <p className="text-[10px] font-black uppercase tracking-widest text-white/20">Recalculating Ranks...</p>
            </div>
          ) : players.length > 0 ? (
            players.map((player, index) => {
              const rank = index + 1;
              const avatar = player.username.substring(0, 2).toUpperCase();
              return (
                <motion.div 
                  key={player.uid}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: index * 0.05 }}
                  className="p-8 flex items-center gap-8 hover:bg-white/5 transition-all group cursor-default"
                >
                  <div className="w-10 font-mono font-black italic text-xl text-center">
                    {rank === 1 ? <Trophy size={24} className="text-yellow-400 mx-auto drop-shadow-[0_0_8px_rgba(250,204,21,0.5)]" /> : 
                     rank === 2 ? <Trophy size={24} className="text-slate-400 mx-auto" /> :
                     rank === 3 ? <Trophy size={24} className="text-amber-600 mx-auto" /> :
                     <span className="text-white/10">#{rank}</span>}
                  </div>

                  <div className="w-14 h-14 rounded-2xl bg-white/5 border border-white/5 flex items-center justify-center font-black italic text-white/40 group-hover:bg-brand group-hover:text-black group-hover:border-brand transition-all text-lg shadow-none group-hover:shadow-brand">
                    {avatar}
                  </div>

                  <div className="flex-1">
                    <h3 className="font-black uppercase tracking-tight italic text-xl flex items-center gap-2 group-hover:text-brand transition-colors">
                      {player.username}
                      {rank < 4 && <div className="w-1.5 h-1.5 rounded-full bg-brand animate-pulse" />}
                    </h3>
                    <p className="text-[10px] text-white/30 font-black uppercase tracking-[0.2em]">{player.referrals || 0} CONNECTIONS • VERIFIED NODE</p>
                  </div>

                  <div className="text-right space-y-1">
                    <p className="font-black italic text-2xl tracking-tighter text-brand">{player.points.toLocaleString()} NXTP</p>
                    <div className="flex items-center gap-1 justify-end text-[10px] font-black text-emerald-400 uppercase tracking-widest">
                      <TrendingUp size={10} />
                      <span>STABLE</span>
                    </div>
                  </div>
                </motion.div>
              );
            })
          ) : (
            <div className="flex flex-col items-center justify-center py-32 space-y-4">
               <Search className="w-10 h-10 text-white/10" />
               <p className="text-[10px] font-black uppercase tracking-widest text-white/20">No Nodes Found</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
