import { Link, useLocation } from 'react-router-dom';
import { withdrawNXTP, getNXTPBalance, fetchCardanoConfig, address as cardanoAddress } from '../../cardano';

import { LayoutDashboard, ClipboardList, Users, Trophy, User, Zap, X, FileText } from 'lucide-react';
import { cn } from '../../lib/utils';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../../context/AuthContext';
import { useState, useEffect } from 'react';
import { doc, updateDoc, increment } from 'firebase/firestore';
import { getFirebaseDb } from '../../lib/firebase';

const navItems = [
  { name: 'Dashboard', path: '/', icon: LayoutDashboard },
  { name: 'Surveys', path: '/surveys', icon: ClipboardList },
  { name: 'Social Tasks', path: '/tasks', icon: Zap },
  { name: 'Referrals', path: '/referrals', icon: Users },
  { name: 'Leaderboard', path: '/leaderboard', icon: Trophy },
  { name: 'Profile', path: '/profile', icon: User },
  { name: 'Whitepaper', path: '/about', icon: FileText },
];

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export function Sidebar({ isOpen, onClose }: SidebarProps) {
  const location = useLocation();
  const { profile } = useAuth();
  const [showPremiumModal, setShowPremiumModal] = useState(false);
  const [upgrading, setUpgrading] = useState(false);
  const [confirmingTx, setConfirmingTx] = useState(false);
  const [countdown, setCountdown] = useState(25);
  const [walletNxtp, setWalletNxtp] = useState<bigint>(0n);
  const [isConnected, setIsConnected] = useState<boolean>(!!cardanoAddress);
  const UPGRADE_AMOUNT = 200; // Upgrade cost in NXTP

  const fetchWalletBalance = async () => {
    try {
      const bal = await getNXTPBalance();
      setWalletNxtp(bal);
      setIsConnected(true);
    } catch (e) {
      setWalletNxtp(0n);
      setIsConnected(false);
    }
  };

  useEffect(() => {
    if (showPremiumModal) {
      fetchWalletBalance();
    }
  }, [showPremiumModal]);

  useEffect(() => {
    const handleWalletChange = (e: Event) => {
      const customEvent = e as CustomEvent;
      setIsConnected(!!customEvent.detail.address);
      if (customEvent.detail.address) {
        fetchWalletBalance();
      } else {
        setWalletNxtp(0n);
      }
    };

    window.addEventListener('cardano-wallet-changed', handleWalletChange);
    return () => {
      window.removeEventListener('cardano-wallet-changed', handleWalletChange);
    };
  }, []);

  const handleUpgrade = async () => {
    if (!profile) return;
    
    setUpgrading(true);
    try {
      const db = getFirebaseDb();
      if (!db || !profile.uid) return;
      
      const config = await fetchCardanoConfig();
      const NEXTAI_ADDRESS = config.treasuryAddress;
      // Check NXTP balance before withdrawal
      const nxtpBalance = await getNXTPBalance();
      if (nxtpBalance < 200n) {
        alert(`Insufficient NXTP balance in your connected wallet. You currently have ${nxtpBalance.toString()} NXTP, but need at least 200 NXTP to upgrade.`);
        setUpgrading(false);
        return;
      }
      await withdrawNXTP(NEXTAI_ADDRESS, UPGRADE_AMOUNT);
      
      const userRef = doc(db, 'users', profile.uid);
      await updateDoc(userRef, {
        isVerified: true
      });
      
      // Start confirmation countdown so the user knows to wait for block confirmation
      setConfirmingTx(true);
      setCountdown(25);
      
      const timer = setInterval(() => {
        setCountdown((prev) => {
          if (prev <= 1) {
            clearInterval(timer);
            setConfirmingTx(false);
            setShowPremiumModal(false);
            setUpgrading(false);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } catch (error) {
      console.error('Upgrade failed:', error);
      alert(error instanceof Error ? error.message : 'Transaction failed or was rejected.');
      setUpgrading(false);
    }
  };

  return (
    <>
      <aside className={cn(
        "fixed inset-y-0 left-0 w-72 border-r border-white/10 flex flex-col z-40 bg-black/90 backdrop-blur-xl transition-transform duration-300 lg:relative lg:translate-x-0 lg:flex lg:w-64 lg:bg-black/40",
        isOpen ? "translate-x-0" : "-translate-x-full"
      )}>
        <div className="p-8 flex items-center justify-between">
          <Link to="/" onClick={onClose} className="flex items-center space-x-3 group">
            <div className="w-10 h-10 bg-brand rounded-lg flex items-center justify-center shadow-[0_0_20px_rgba(204,255,0,0.3)] transition-transform group-hover:rotate-6">
              <LayoutDashboard size={24} className="text-black" />
            </div>
            <h1 className="text-xl font-bold tracking-tighter uppercase">NEXT.<span className="text-brand">AI</span></h1>
          </Link>
          
          {/* Mobile Close Button */}
          <button 
            onClick={onClose}
            className="lg:hidden p-2 text-white/40 hover:text-white"
          >
            <X size={24} />
          </button>
        </div>

        <nav className="flex-1 px-4 space-y-2">
            {navItems.map((item) => {
            const isActive = location.pathname === item.path;
            const Icon = item.icon;
            
            return (
              <Link
                key={item.path}
                to={item.path}
                onClick={onClose}
                className={cn(
                  "p-4 rounded-xl transition-all flex items-center space-x-3 group",
                  isActive 
                    ? "bg-white/5 border border-white/10 text-brand" 
                    : "text-white/60 hover:text-white hover:bg-white/5"
                )}
              >
                <Icon size={18} className={cn(isActive ? "text-brand" : "text-white/40 group-hover:text-white")} />
                <span className="font-medium text-sm">{item.name}</span>
              </Link>
            );
          })}
        </nav>

        <div className="p-6">
          {profile?.isVerified ? (
            <div className="bg-brand/10 border border-brand/30 rounded-2xl p-4 relative overflow-hidden group">
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-brand/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
              <p className="text-[10px] uppercase tracking-widest text-brand font-black mb-1 relative z-10">Status</p>
              <div className="flex items-center justify-between relative z-10">
                <span className="text-sm font-bold text-brand">Premium Node</span>
                <div className="w-5 h-5 bg-brand rounded-full flex items-center justify-center text-black text-[10px] font-bold shadow-[0_0_10px_rgba(204,255,0,0.5)]">✓</div>
              </div>
            </div>
          ) : (
            <button 
              onClick={() => setShowPremiumModal(true)}
              className="w-full bg-white/5 hover:bg-brand/10 border border-white/10 hover:border-brand/30 rounded-2xl p-4 transition-all text-left group relative overflow-hidden"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
              <div className="flex justify-between items-center mb-1 relative z-10">
                <p className="text-[10px] uppercase tracking-widest text-white/40 group-hover:text-brand font-black transition-colors">Upgrade Tier</p>
                <span className="text-[9px] font-black text-brand bg-brand/10 px-1.5 py-0.5 rounded border border-brand/20">200 NXTP</span>
              </div>
              <div className="flex items-center justify-between relative z-10">
                <span className="text-sm font-semibold text-white group-hover:text-brand transition-colors">Get Verified</span>
                <div className="w-5 h-5 border border-white/20 rounded-full flex items-center justify-center text-white/40 group-hover:border-brand group-hover:text-brand transition-colors text-[10px] font-bold">
                  ★
                </div>
              </div>
            </button>
          )}
        </div>
      </aside>

      <AnimatePresence>
        {showPremiumModal && (
          <div className="fixed inset-0 flex items-center justify-center z-[9999] p-6">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowPremiumModal(false)}
              className="absolute inset-0 bg-black/90 backdrop-blur-sm"
            />
            
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              className="relative w-full max-w-sm bg-[#0a0a0a] rounded-[32px] border border-brand/30 p-8 shadow-[0_0_50px_rgba(204,255,0,0.15)] z-10 text-center overflow-hidden"
            >
              <div className="absolute -top-24 -right-24 w-48 h-48 bg-brand/20 blur-[80px] rounded-full pointer-events-none" />
              
              <div className="w-20 h-20 bg-brand/10 border border-brand/20 rounded-full flex items-center justify-center mx-auto mb-6 relative">
                <div className="absolute inset-0 bg-brand/20 blur-xl rounded-full animate-pulse"></div>
                <span className="text-4xl relative z-10">★</span>
              </div>
              
              <h3 className="text-2xl font-black uppercase tracking-tighter italic text-white mb-2">Unlock Premium</h3>
              <p className="text-sm text-white/60 mb-8 font-medium">Verify your node to access exclusive highest-yielding missions and a 2x boost on all referral rewards.</p>

              <div className="bg-white/5 border border-white/10 rounded-2xl p-4 mb-6 flex justify-between items-center text-left">
                <div>
                  <p className="text-[10px] font-black uppercase tracking-widest text-white/40 mb-1">Upgrade Cost</p>
                  <p className="text-xl font-black text-brand tracking-tighter">200 NXTP</p>
                </div>
                <div className="text-right">
                  <p className="text-[10px] font-black uppercase tracking-widest text-white/40 mb-1">Your Wallet Balance</p>
                  <p className="text-lg font-black text-white/80">{walletNxtp.toString()} NXTP</p>
                </div>
              </div>

              <div className="space-y-3">
                <button 
                  onClick={handleUpgrade}
                  disabled={upgrading || confirmingTx || !isConnected || walletNxtp < 200n}
                  className="w-full bg-brand text-black font-black text-xs uppercase tracking-widest py-4 rounded-xl hover:shadow-brand transition-all active:scale-95 disabled:opacity-50 disabled:pointer-events-none flex items-center justify-center gap-2"
                >
                  {upgrading ? (
                    <>
                      <span className="animate-spin text-lg">⚙</span>
                      Signing Tx...
                    </>
                  ) : confirmingTx ? (
                    <>
                      <span className="animate-spin text-lg">⚙</span>
                      Confirming Block ({countdown}s)...
                    </>
                  ) : !isConnected ? (
                    'Wallet Not Connected'
                  ) : walletNxtp < 200n ? (
                    'Insufficient NXTP Balance'
                  ) : (
                    'Confirm Upgrade'
                  )}
                </button>
                <button 
                  onClick={() => setShowPremiumModal(false)}
                  disabled={upgrading}
                  className="w-full bg-transparent text-white/40 font-black text-[10px] uppercase tracking-widest py-3 hover:text-white transition-colors"
                >
                  Cancel
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}
