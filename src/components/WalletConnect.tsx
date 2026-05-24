import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'motion/react';
import { connectWallet, disconnectWallet, address as cardanoAddress } from '../cardano';
import { LogOut, Wallet, CheckCircle2, ChevronRight, Loader2, Droplets, Hourglass, Flame } from 'lucide-react';
import { cn } from '../lib/utils';

const SUPPORTED_WALLETS = [
  { id: 'nami', name: 'Nami', icon: Droplets },
  { id: 'eternl', name: 'Eternl', icon: Hourglass },
  { id: 'flint', name: 'Flint', icon: Flame },
];

export default function WalletConnect() {
  const [connected, setConnected] = useState(!!cardanoAddress);
  const [walletAddress, setWalletAddress] = useState<string | null>(cardanoAddress);
  const [connecting, setConnecting] = useState(false);
  const [showOptions, setShowOptions] = useState(false);

  useEffect(() => {
    const handleWalletChange = (e: Event) => {
      const customEvent = e as CustomEvent;
      setConnected(customEvent.detail.connected);
      setWalletAddress(customEvent.detail.address);
    };

    window.addEventListener('cardano-wallet-changed', handleWalletChange);
    return () => {
      window.removeEventListener('cardano-wallet-changed', handleWalletChange);
    };
  }, []);

  const handleConnect = async (walletName: string) => {
    setConnecting(true);
    try {
      const result = await connectWallet(walletName);
      setConnected(true);
      setWalletAddress(result.address);
      setShowOptions(false);
    } catch (error) {
      console.error('Failed to connect:', error);
      alert(error instanceof Error ? error.message : 'Connection failed');
    } finally {
      setConnecting(false);
    }
  };

  const handleDisconnect = async () => {
    await disconnectWallet();
    setConnected(false);
    setWalletAddress(null);
  };

  if (connected && walletAddress) {
    return (
      <div className="flex items-center gap-4 bg-white/5 border border-white/10 p-2 pl-4 rounded-2xl">
        <div className="flex flex-col">
          <span className="text-[10px] text-white/40 uppercase font-black tracking-widest">Protocol Node</span>
          <span className="text-xs font-mono text-brand">
            {walletAddress.slice(0, 8)}...{walletAddress.slice(-8)}
          </span>
        </div>
        <button
          onClick={handleDisconnect}
          className="p-2 hover:bg-red-500/10 text-white/40 hover:text-red-500 rounded-xl transition-all"
          title="Disconnect"
        >
          <LogOut size={18} />
        </button>
      </div>
    );
  }

  const modalContent = (
    <AnimatePresence>
      {showOptions && (
        <div className="fixed inset-0 flex items-center justify-center z-[9999] p-6">
          {/* Solid Backdrop */}
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setShowOptions(false)}
            className="absolute inset-0 bg-black/90 backdrop-blur-sm"
          />
          
          {/* Solid Modal */}
          <motion.div 
            initial={{ opacity: 0, scale: 0.95, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 10 }}
            className="relative w-full max-w-sm bg-[#0a0a0a] rounded-[32px] border border-white/20 p-8 shadow-[0_0_50px_rgba(0,0,0,0.8)] z-10"
          >
            <div className="space-y-8">
              <div className="text-center space-y-2">
                <h3 className="text-2xl font-black uppercase tracking-tighter italic">Connect Wallet</h3>
                <p className="text-xs text-white/40 font-medium italic">Choose your preferred Cardano interface.</p>
              </div>

              <div className="space-y-3">
                {SUPPORTED_WALLETS.map((w) => {
                  const Icon = w.icon;
                  return (
                    <button
                      key={w.id}
                      onClick={() => handleConnect(w.id)}
                      className="w-full flex items-center justify-between p-5 bg-white/5 hover:bg-brand text-white hover:text-black rounded-2xl transition-all group border border-transparent hover:border-brand"
                    >
                      <div className="flex items-center gap-4">
                        <Icon size={24} className="opacity-80 group-hover:opacity-100" />
                        <span className="font-bold text-lg italic uppercase tracking-tight">{w.name}</span>
                      </div>
                      <ChevronRight size={20} className="opacity-20 group-hover:opacity-100 transition-opacity" />
                    </button>
                  );
                })}
              </div>

              <button 
                onClick={() => setShowOptions(false)}
                className="w-full text-center text-[10px] font-black uppercase tracking-[0.2em] text-white/30 hover:text-white transition-colors py-2"
              >
                Cancel Connection
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );

  return (
    <>
      <button
        onClick={() => setShowOptions(true)}
        disabled={connecting}
        className="bg-brand text-black px-6 py-3 rounded-2xl font-black uppercase tracking-widest text-xs flex items-center gap-3 hover:shadow-brand transition-all active:scale-95"
      >
        {connecting ? (
          <Loader2 size={18} className="animate-spin" />
        ) : (
          <Wallet size={18} strokeWidth={3} />
        )}
        {connecting ? 'Scanning...' : 'Connect Wallet'}
      </button>

      {/* Render modal at the document root to guarantee absolute centering regardless of parent styling */}
      {typeof document !== 'undefined' && createPortal(modalContent, document.body)}
    </>
  );
}
