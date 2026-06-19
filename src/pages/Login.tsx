import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Shield, Sparkles, AlertCircle, Coins, Flame } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function Login() {
  const { loginWithGoogle, isFirebaseReady } = useAuth() || {};
  const navigate = useNavigate();
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleGoogle = async () => {
    if (typeof loginWithGoogle !== 'function') {
      setError('Google login is not available right now.');
      return;
    }
    setLoading(true);
    setError(null);
    try {
      await loginWithGoogle();
      navigate('/');
    } catch (err: any) {
      console.error('Login failed:', err);
      if (err.code === 'auth/popup-closed-by-user') {
        setError('Sign-in popup closed. Please try again.');
      } else {
        setError(err.message ?? 'Login failed. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  if (!isFirebaseReady) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-black">
        <div className="w-12 h-12 border-4 border-brand/20 border-t-brand rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen relative flex items-center justify-center p-6 bg-black overflow-hidden font-sans">
      {/* Cyber Grid Background */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#141414_1px,transparent_1px),linear-gradient(to_bottom,#141414_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_50%,#000_70%,transparent_100%)] opacity-40 pointer-events-none" />

      {/* Brand Color Ambient Spotlight */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[550px] h-[550px] bg-brand/5 rounded-full blur-[140px] pointer-events-none" />

      <div className="w-full max-w-lg z-10 space-y-8">
        <div className="text-center space-y-4">
          {/* Logo Animation */}
          <motion.div
            initial={{ scale: 0.8, opacity: 0, rotate: -12 }}
            animate={{ scale: 1, opacity: 1, rotate: 12 }}
            transition={{ type: 'spring', stiffness: 200, damping: 15 }}
            whileHover={{ scale: 1.05, rotate: 0 }}
            className="w-20 h-20 bg-brand rounded-[24px] flex items-center justify-center mx-auto shadow-[0_0_40px_rgba(204,255,0,0.25)] cursor-pointer"
          >
            <Shield size={38} className="text-black stroke-[2.5]" />
          </motion.div>

          <div className="space-y-2">
            <motion.h1
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.1 }}
              className="text-4xl sm:text-5xl font-black uppercase tracking-tighter italic glow-text"
            >
              NEXT.AI
            </motion.h1>
            <motion.p
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.15 }}
              className="text-white/40 text-sm font-semibold tracking-wide uppercase italic"
            >
              Decentralized Intelligence Network
            </motion.p>
          </div>
        </div>

        {/* Auth Card */}
        <motion.div
          initial={{ y: 30, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ type: 'spring', stiffness: 100, damping: 20, delay: 0.2 }}
          className="glass-card p-8 sm:p-10 rounded-[32px] shadow-[0_30px_60px_rgba(0,0,0,0.8)] border border-white/10 relative overflow-hidden"
        >
          {/* Subtle top highlights inside card */}
          <div className="absolute top-0 inset-x-0 h-[1px] bg-gradient-to-r from-transparent via-brand/30 to-transparent" />

          <div className="space-y-6">
            <div className="text-center space-y-2">
              <h2 className="text-2xl font-black uppercase italic tracking-tight text-white">
                Initialize Gateway
              </h2>
              <p className="text-white/50 text-sm">
                Get instant access using Google single sign-on. No registration form required.
              </p>
            </div>

            {/* Error Message */}
            <AnimatePresence>
              {error && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="bg-red-500/10 border border-red-500/20 text-red-400 p-4 rounded-2xl flex items-start gap-3 text-sm"
                  role="alert"
                >
                  <AlertCircle size={18} className="shrink-0 mt-0.5" />
                  <span>{error}</span>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Google Login Button */}
            <motion.button
              whileHover={{ scale: 1.02, translateY: -2 }}
              whileTap={{ scale: 0.98 }}
              onClick={handleGoogle}
              disabled={loading}
              className={`w-full py-4 px-6 bg-white text-black font-black uppercase tracking-wider rounded-2xl flex items-center justify-center gap-3 transition-all duration-300 shadow-[0_0_30px_rgba(255,255,255,0.05)] hover:shadow-[0_8px_30px_rgba(204,255,0,0.15)] ${
                loading ? 'opacity-75 cursor-wait' : 'cursor-pointer hover:bg-brand'
              }`}
            >
              {loading ? (
                <div className="flex items-center gap-2">
                  <svg className="animate-spin h-5 w-5 text-black" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  <span>Connecting...</span>
                </div>
              ) : (
                <>
                  <svg className="w-5 h-5 shrink-0" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path
                      fill="#EA4335"
                      d="M12 5.04c1.65 0 3.13.57 4.3 1.69l3.22-3.22C17.56 1.7 15.01 1 12 1 7.39 1 3.4 3.66 1.45 7.55l3.85 2.99C6.22 7.36 8.89 5.04 12 5.04z"
                    />
                    <path
                      fill="#4285F4"
                      d="M23.49 12.27c0-.81-.07-1.59-.2-2.36H12v4.51h6.43c-.28 1.44-1.09 2.66-2.31 3.48v2.9h3.73c2.18-2 3.64-4.96 3.64-8.53z"
                    />
                    <path
                      fill="#34A853"
                      d="M12 23c3.24 0 5.97-1.07 7.96-2.92l-3.73-2.9c-1.03.69-2.35 1.1-4.23 1.1-3.11 0-5.78-2.32-6.72-5.46L1.41 15.8C3.36 19.66 7.37 23 12 23z"
                    />
                    <path
                      fill="#FBBC05"
                      d="M5.28 12.82a7.18 7.18 0 010-4.64L1.41 5.19A11.97 11.97 0 001.41 17.8l3.87-2.98c-.16-.62-.25-1.28-.25-2z"
                    />
                  </svg>
                  <span>Continue with Google</span>
                </>
              )}
            </motion.button>

            {/* Platform Highlights */}
            <div className="pt-6 border-t border-white/5 space-y-4">
              <div className="flex gap-4 items-start">
                <div className="w-8 h-8 rounded-xl bg-brand/10 flex items-center justify-center shrink-0">
                  <Sparkles size={16} className="text-brand" />
                </div>
                <div>
                  <h4 className="text-xs font-black uppercase tracking-wider text-white">Instant Onboarding</h4>
                  <p className="text-xs text-white/40 mt-0.5">Your profile is auto-synchronized instantly upon login.</p>
                </div>
              </div>

              <div className="flex gap-4 items-start">
                <div className="w-8 h-8 rounded-xl bg-brand/10 flex items-center justify-center shrink-0">
                  <Coins size={16} className="text-brand" />
                </div>
                <div>
                  <h4 className="text-xs font-black uppercase tracking-wider text-white">Cardano Web3 Rewards</h4>
                  <p className="text-xs text-white/40 mt-0.5">Earn token rewards directly claimable into your Cardano wallet.</p>
                </div>
              </div>

              <div className="flex gap-4 items-start">
                <div className="w-8 h-8 rounded-xl bg-brand/10 flex items-center justify-center shrink-0">
                  <Coins size={16} className="text-brand" />
                </div>
                <div>
                  <h4 className="text-xs font-black uppercase tracking-wider text-white">Referral Boosts</h4>
                  <p className="text-xs text-white/40 mt-0.5">Invite others via your custom URL and auto-gain multi-tier rewards.</p>
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Security & Support Disclaimer */}
        <p className="text-center text-xs text-white/30 tracking-wide">
          By signing in, you connect securely via Google. We do not store or read your passwords.
        </p>
      </div>
    </div>
  );
}
