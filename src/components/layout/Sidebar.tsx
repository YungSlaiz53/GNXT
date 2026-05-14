import { Link, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, 
  ClipboardList, 
  Users, 
  Trophy, 
  User, 
  Zap,
  X
} from 'lucide-react';
import { cn } from '../../lib/utils';
import { motion } from 'motion/react';

const navItems = [
  { name: 'Dashboard', path: '/', icon: LayoutDashboard },
  { name: 'Surveys', path: '/surveys', icon: ClipboardList },
  { name: 'Social Tasks', path: '/tasks', icon: Zap },
  { name: 'Referrals', path: '/referrals', icon: Users },
  { name: 'Leaderboard', path: '/leaderboard', icon: Trophy },
  { name: 'Profile', path: '/profile', icon: User },
];

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export function Sidebar({ isOpen, onClose }: SidebarProps) {
  const location = useLocation();

  return (
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
        <div className="bg-brand/10 border border-brand/30 rounded-2xl p-4">
          <p className="text-[10px] uppercase tracking-widest text-brand font-black mb-1">Verification Status</p>
          <div className="flex items-center justify-between">
            <span className="text-sm font-semibold">Verified Account</span>
            <div className="w-5 h-5 bg-brand rounded-full flex items-center justify-center text-black text-[10px] font-bold">✓</div>
          </div>
        </div>
      </div>
    </aside>
  );
}
