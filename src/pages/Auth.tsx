import { useState } from 'react';
import { motion } from 'motion/react';
import { Mail, Lock, ArrowRight, Chrome, Shield } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { cn } from '../lib/utils';
import Login from '../components/Login';

export default function Auth() {
  const [isLogin, setIsLogin] = useState(true);
  const { loginWithGoogle } = useAuth();

  return (
    <div className="min-h-[80vh] flex items-center justify-center p-4">
      <div className="w-full max-w-md space-y-8">
        <div className="text-center space-y-4">
          <motion.div 
            initial={{ scale: 0.5, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="w-16 h-16 bg-brand rounded-2xl flex items-center justify-center mx-auto rotate-12"
          >
            <Shield size={32} className="text-black" />
          </motion.div>
          <div className="space-y-2">
            <h1 className="text-4xl font-black uppercase tracking-tighter italic glow-text">
              {isLogin ? 'Welcome Back' : 'Join Protocol'}
            </h1>
            <p className="text-white/40 font-medium italic">Enter the next generation of survey rewards.</p>
          </div>
        </div>

        <div className="glass-card p-8 rounded-[32px] space-y-6">
          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-[0.2em] text-white/30">Email Address</label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-white/20" size={18} />
                <input 
                  type="email" 
                  placeholder="name@example.com"
                  className="w-full bg-black/40 border border-white/10 rounded-2xl py-4 pl-12 pr-4 focus:outline-none focus:border-brand/40 transition-colors font-medium"
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-[0.2em] text-white/30">Password</label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-white/20" size={18} />
                <input 
                  type="password" 
                  placeholder="••••••••"
                  className="w-full bg-black/40 border border-white/10 rounded-2xl py-4 pl-12 pr-4 focus:outline-none focus:border-brand/40 transition-colors font-medium"
                />
              </div>
            </div>
          </div>

          <button className="w-full bg-brand text-black py-4 rounded-2xl font-black uppercase tracking-widest flex items-center justify-center gap-2 hover:shadow-brand transition-all">
            {isLogin ? 'Sign In' : 'Create Account'}
            <ArrowRight size={18} strokeWidth={3} />
          </button>

          <div className="relative py-4">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-white/10"></div>
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-surface px-4 text-white/20 font-bold">Or continue with</span>
            </div>
          </div>

          <Login />
        </div>

        <p className="text-center text-sm text-white/40">
          {isLogin ? "Don't have an account?" : "Already have an account?"}
          {' '}
          <button 
            onClick={() => setIsLogin(!isLogin)}
            className="text-brand font-bold hover:underline underline-offset-4"
          >
            {isLogin ? 'Sign Up' : 'Log In'}
          </button>
        </p>
      </div>
    </div>
  );
}
