import { motion } from 'motion/react';
import { cn } from '../lib/utils';
import { User, Wallet, ShieldCheck, Mail, Calendar, LogOut, Award, Loader2, CheckCircle2, ArrowUpRight } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useState, useEffect } from 'react';
import { doc, setDoc, updateDoc } from 'firebase/firestore';
import { getFirebaseDb } from '../lib/firebase';
import { address as cardanoAddress, connectWallet } from '../cardano';
import WalletConnect from '../components/WalletConnect';

export default function Profile() {
  const { profile, logout, dbError } = useAuth();
  const [address, setAddress] = useState<string | null>(cardanoAddress);
  const [claiming, setClaiming] = useState(false);
  const [claimSuccess, setClaimSuccess] = useState(false);

  const handleClaim = async () => {
    if (!profile || !address || (profile.points || 0) <= 0) return;
    
    setClaiming(true);
    const db = getFirebaseDb();
    
    try {
      // 1. Perform real on-chain Minting via Cardano (Lucid)
      const claimAmount = profile.points;
      
      // Import dynamically to avoid circular dependencies if any, but since we are in a component, we can just import it at top.
      // Wait, let's just use the top-level import (I will add it in the next step or it might already be imported if I just use connectWallet etc).
      // Actually, I need to add `mintNXTP` to the import from '../cardano'. I'll assume it's imported for now, or I'll just fix it.
      
      // We need to import mintNXTP
      const { mintNXTP } = await import('../cardano');
      
      console.log(`Initiating mint of ${claimAmount} NXTP...`);
      const txHash = await mintNXTP(claimAmount);
      console.log(`Mint successful! Tx Hash: ${txHash}`);
      
      if (db) {
        // 2. Deduct points from Firestore only AFTER successful mint
        const profileRef = doc(db, 'users', profile.uid);
        await updateDoc(profileRef, {
          points: 0 // Claim all points
        });
        
        setClaimSuccess(true);
        setTimeout(() => setClaimSuccess(false), 5000);
      }
    } catch (error) {
      console.error('Claim failed:', error);
      alert(error instanceof Error ? error.message : 'Transaction failed or was rejected.');
    } finally {
      setClaiming(false);
    }
  };

  // Sync wallet address from event listener to avoid setInterval
  useEffect(() => {
    setAddress(cardanoAddress);

    const handleWalletChange = (e: Event) => {
      const customEvent = e as CustomEvent;
      setAddress(customEvent.detail.address);
    };

    window.addEventListener('cardano-wallet-changed', handleWalletChange);
    return () => {
      window.removeEventListener('cardano-wallet-changed', handleWalletChange);
    };
  }, []);

  // Sync wallet address to Firestore when connected
  useEffect(() => {
    const syncWallet = async () => {
      if (address && profile && profile.wallet !== address) {
        const db = getFirebaseDb();
        if (db) {
          const profileRef = doc(db, 'users', profile.uid);
          await setDoc(profileRef, { wallet: address }, { merge: true });
          console.log('Cardano address synced to profile:', address);
        }
      }
    };
    syncWallet();
  }, [address, profile]);
  return (
    <div className="max-w-4xl mx-auto space-y-10">
      <div className="flex flex-col gap-2">
        <h1 className="text-4xl font-black uppercase tracking-tighter italic glow-text">My Identity</h1>
        <p className="text-white/40 font-medium italic">Manage your profile and track protocol achievements.</p>
      </div>

      {dbError && (
        <div className="bg-red-500/10 border border-red-500/20 text-red-400 p-4 rounded-2xl text-xs font-semibold space-y-1">
          <p className="font-bold uppercase tracking-wider">⚠️ Firestore Database Offline/Restricted</p>
          <p className="opacity-85">{dbError}</p>
          <p className="opacity-60 mt-1">This application is running in local memory fallback mode. To save records to Firestore, verify that your Firestore security rules allow read/write access for user profiles under the "users" collection.</p>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="md:col-span-1 space-y-6">
          <div className="glass-card p-10 rounded-[40px] text-center space-y-6 border border-white/10">
            <div className="w-32 h-32 bg-brand/10 rounded-full mx-auto flex items-center justify-center border-4 border-brand/5 relative group">
              <User size={64} className="text-brand group-hover:scale-110 transition-transform" />
              {profile?.isVerified && (
                <div className="absolute -bottom-2 -right-2 bg-brand p-2 rounded-full text-black shadow-brand">
                  <ShieldCheck size={20} strokeWidth={3} />
                </div>
              )}
            </div>
            <div>
              <h2 className="text-2xl font-black uppercase tracking-tight italic">{profile?.username || 'User'}</h2>
              <p className="text-[10px] text-white/40 uppercase tracking-widest font-bold mt-1">
                {profile?.points && profile.points > 1000 ? 'Level 2' : 'Level 1'} Contributor
              </p>
            </div>
            <div className="flex justify-center gap-3">
              {profile?.isVerified ? (
                <div className="p-2.5 bg-brand/10 border border-brand/20 rounded-xl text-brand" title="Premium Verified Node">
                  <ShieldCheck size={20} />
                </div>
              ) : (
                <div className="p-2.5 bg-white/5 border border-white/10 rounded-xl text-white/20" title="Unverified Node (Upgrade to verify)">
                  <ShieldCheck size={20} className="opacity-50" />
                </div>
              )}
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
                  <code className="bg-white/5 border border-white/10 px-4 py-3 rounded-2xl text-xs font-mono flex-1 text-white/60 overflow-hidden text-ellipsis">
                    {profile?.wallet ? `${profile.wallet.slice(0, 10)}...${profile.wallet.slice(-10)}` : 'No wallet linked'}
                  </code>
                  <WalletConnect />
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-6">
            <div className="glass-card p-6 rounded-[32px] border border-white/10 flex flex-col justify-between">
              <div>
                <p className="text-[10px] text-white/30 uppercase font-black tracking-widest mb-2">Accumulated Yield</p>
                <p className="text-3xl font-black tracking-tighter text-brand italic underline decoration-brand/20 underline-offset-8">
                  {profile?.points?.toLocaleString() || '0'} NXTP
                </p>
              </div>
              
              <button 
                onClick={handleClaim}
                disabled={claiming || !address || (profile?.points || 0) <= 0}
                className={cn(
                  "mt-6 w-full h-12 rounded-xl font-black uppercase tracking-widest text-[10px] flex items-center justify-center gap-2 transition-all",
                  claimSuccess 
                    ? "bg-emerald-500 text-white" 
                    : (claiming ? "bg-white/10 text-white/40 cursor-wait" : "bg-brand text-black hover:shadow-brand active:scale-95 disabled:opacity-20 disabled:grayscale disabled:pointer-events-none")
                )}
              >
                {claiming ? (
                  <>
                    <Loader2 size={16} className="animate-spin" />
                    Transmitting to Chain...
                  </>
                ) : claimSuccess ? (
                  <>
                    <CheckCircle2 size={16} />
                    Yield Secured
                  </>
                ) : (
                  <>
                    <ArrowUpRight size={16} strokeWidth={3} />
                    Claim to Wallet
                  </>
                )}
              </button>
            </div>
            <div className="glass-card p-6 rounded-[32px] border border-white/10">
              <p className="text-[10px] text-white/30 uppercase font-black tracking-widest mb-2">Protocol Status</p>
              {profile?.isVerified ? (
                <div className="flex items-center gap-2 mt-2">
                  <ShieldCheck className="text-brand" size={24} strokeWidth={3} />
                  <span className="font-black italic text-brand text-xl uppercase tracking-tighter">Premium Node</span>
                </div>
              ) : (
                <div className="flex items-center gap-2 mt-2 opacity-50">
                  <ShieldCheck className="text-white/40" size={24} strokeWidth={3} />
                  <span className="font-black italic text-white/40 text-xl uppercase tracking-tighter">Standard Node</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
