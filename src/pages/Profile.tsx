import { motion } from 'motion/react';
import { User, Wallet, ShieldCheck, Mail, Calendar, LogOut, Award } from 'lucide-react';
import { ConnectButton } from '@rainbow-me/rainbowkit';
import { useAuth } from '../context/AuthContext';
import { useAccount } from 'wagmi';
import { useEffect } from 'react';
import { doc, setDoc } from 'firebase/firestore';
import { getFirebaseDb } from '../lib/firebase';

export default function Profile() {
  const { profile, logout } = useAuth();
  const { address, isConnected } = useAccount();

  // Sync wallet address to Firestore when connected
  useEffect(() => {
    const syncWallet = async () => {
      if (isConnected && address && profile && profile.wallet !== address) {
        const db = getFirebaseDb();
        if (db) {
          const profileRef = doc(db, 'users', profile.uid);
          await setDoc(profileRef, { wallet: address }, { merge: true });
          console.log('Wallet address synced to profile:', address);
        }
      }
    };
    syncWallet();
  }, [isConnected, address, profile]);
  return (
    <div className="max-w-4xl mx-auto space-y-10">
      <div className="flex flex-col gap-2">
        <h1 className="text-4xl font-black uppercase tracking-tighter italic glow-text">My Identity</h1>
        <p className="text-white/40 font-medium italic">Manage your profile and track protocol achievements.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="md:col-span-1 space-y-6">
          <div className="glass-card p-10 rounded-[40px] text-center space-y-6 border border-white/10">
            <div className="w-32 h-32 bg-brand/10 rounded-full mx-auto flex items-center justify-center border-4 border-brand/5 relative group">
              <User size={64} className="text-brand group-hover:scale-110 transition-transform" />
              <div className="absolute -bottom-2 -right-2 bg-brand p-2 rounded-full text-black shadow-brand">
                <ShieldCheck size={20} strokeWidth={3} />
              </div>
            </div>
            <div>
              <h2 className="text-2xl font-black uppercase tracking-tight italic">{profile?.username || 'User'}</h2>
              <p className="text-[10px] text-white/40 uppercase tracking-widest font-bold mt-1">
                {profile?.points && profile.points > 1000 ? 'Level 2' : 'Level 1'} Contributor
              </p>
            </div>
            <div className="flex justify-center gap-3">
              <div className="p-2.5 bg-brand/10 border border-brand/20 rounded-xl text-brand" title="Verified Account">
                <ShieldCheck size={20} />
              </div>
              <div className="p-2.5 bg-purple-500/10 border border-purple-500/20 rounded-xl text-purple-400" title="Early Adopter">
                <Award size={20} />
              </div>
            </div>
          </div>

          <button className="w-full flex items-center justify-center gap-2 p-4 bg-red-500/5 hover:bg-red-500/10 text-red-500/60 hover:text-red-500 rounded-2xl transition-all border border-red-500/10" onClick={logout}>
            <LogOut size={20} />
            <span className="font-bold uppercase tracking-widest text-xs">Terminate Session</span>
          </button>
        </div>

        <div className="md:col-span-2 space-y-6">
          <div className="glass-card p-10 rounded-[40px] space-y-10 border border-white/10">
            <h3 className="text-xl font-black uppercase tracking-widest border-b border-white/10 pb-6 flex items-center gap-3">
              <span className="w-2 h-2 rounded-full bg-brand shadow-brand" />
              Protocol Dossier
            </h3>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-10">
              <div className="space-y-1">
                <div className="flex items-center gap-2 text-white/30 mb-2">
                  <Mail size={14} className="text-brand" />
                  <span className="text-[10px] font-black uppercase tracking-[0.2em]">Contact Email</span>
                </div>
                <p className="font-bold text-lg">{profile?.email || 'No email'}</p>
                <div className="mt-2 inline-flex items-center gap-1.5 bg-brand/10 px-2 py-0.5 rounded-md border border-brand/20">
                  <span className="w-1.5 h-1.5 rounded-full bg-brand animate-pulse" />
                  <span className="text-[10px] text-brand font-black uppercase tracking-widest">Verified</span>
                </div>
              </div>

              <div className="space-y-1">
                <div className="flex items-center gap-2 text-white/30 mb-2">
                  <Calendar size={14} className="text-brand" />
                  <span className="text-[10px] font-black uppercase tracking-[0.2em]">Deployment Date</span>
                </div>
                <p className="font-bold text-lg">
                  {profile?.joinedAt?.toDate ? profile.joinedAt.toDate().toLocaleDateString() : 'N/A'}
                </p>
              </div>

              <div className="sm:col-span-2 space-y-1">
                <div className="flex items-center gap-2 text-white/30 mb-2">
                  <Wallet size={14} className="text-brand" />
                  <span className="text-[10px] font-black uppercase tracking-[0.2em]">Authenticated Wallet</span>
                </div>
                <div className="flex flex-wrap items-center gap-4">
                  <code className="bg-white/5 border border-white/10 px-4 py-3 rounded-2xl text-sm font-mono flex-1 text-white/60">
                    {profile?.wallet ? `${profile.wallet.slice(0, 6)}...${profile.wallet.slice(-4)}` : 'No wallet linked'}
                  </code>
                  <ConnectButton accountStatus="avatar" showBalance={false} />
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-6">
            <div className="glass-card p-6 rounded-[32px] border border-white/10">
              <p className="text-[10px] text-white/30 uppercase font-black tracking-widest mb-2">Accumulated Yield</p>
              <p className="text-3xl font-black tracking-tighter text-brand italic underline decoration-brand/20 underline-offset-8">
                {profile?.points?.toLocaleString() || '0'} NXTP
              </p>
            </div>
            <div className="glass-card p-6 rounded-[32px] border border-white/10">
              <p className="text-[10px] text-white/30 uppercase font-black tracking-widest mb-2">Protocol Status</p>
              <div className="flex items-center gap-2 mt-2">
                <ShieldCheck className="text-brand" size={24} strokeWidth={3} />
                <span className="font-black italic text-brand text-xl uppercase tracking-tighter">Verified</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
