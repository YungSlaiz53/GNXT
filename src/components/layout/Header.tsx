import { useState, useEffect } from 'react';
import WalletConnect from '../WalletConnect';
import { Bell, Menu } from 'lucide-react';
import { fetchCardanoConfig } from '../../cardano';

interface HeaderProps {
  onMenuClick: () => void;
}

export function Header({ onMenuClick }: HeaderProps) {
  const [network, setNetwork] = useState<string>('Preprod');

  useEffect(() => {
    fetchCardanoConfig().then(config => {
      setNetwork(config.network);
    }).catch(err => {
      console.error('Error fetching Cardano config in Header:', err);
    });
  }, []);

  return (
    <header className="h-20 border-b border-white/10 px-6 lg:px-10 flex items-center justify-between bg-black/20 backdrop-blur-sm sticky top-0 z-10">
      <div className="flex items-center space-x-4 lg:space-x-8">
        <button 
          onClick={onMenuClick}
          className="lg:hidden p-2 -ml-2 text-white/60 hover:text-white"
        >
          <Menu size={24} />
        </button>
        
        <div className="hidden sm:block">
          <h2 className="text-[10px] uppercase tracking-[0.2em] text-white/40 font-bold">Current Node</h2>
          <p className="text-sm font-medium flex items-center mt-0.5">
            <span className="w-2 h-2 rounded-full bg-brand mr-2 shadow-[0_0_8px_rgba(204,255,0,0.6)]"></span>
            Cardano {network}
          </p>
        </div>
      </div>

      <div className="flex items-center space-x-3 lg:space-x-6">
        <WalletConnect />
        
        <button className="p-2 text-white/40 relative hover:text-brand transition-colors group hidden sm:block">
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-brand rounded-full border-2 border-black shadow-[0_0_8px_rgba(204,255,0,0.4)]"></span>
          <Bell size={20} className="group-hover:scale-110 transition-transform" />
        </button>
      </div>
    </header>
  );
}
