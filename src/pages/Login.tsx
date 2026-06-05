import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Shield, Star, Gift, Zap } from 'lucide-react';



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
    } catch (e: any) {
      console.error('Login failed:', e);
      setError(e.message ?? 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-black relative overflow-hidden font-sans">
      {/* Background grid */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#141414_1px,transparent_1px),linear-gradient(to_bottom,#141414_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_50%,#000_70%,transparent_100%)] opacity-40 pointer-events-none" />
      {/* Brand glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[550px] h-[550px] bg-brand/5 rounded-full blur-[140px] pointer-events-none" />
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ type: 'spring', stiffness: 120 }}
        className="glass-card p-8 rounded-2xl w-full max-w-md z-10"
      >
        <motion.div
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.1 }}
          className="flex justify-center mb-6"
        >
          <div className="w-20 h-20 bg-brand rounded-[24px] flex items-center justify-center shadow-[0_0_40px_rgba(204,255,0,0.25)]">
            <Shield className="text-black" size={24} />
          </div>
        </motion.div>
        <h1 className="text-2xl font-bold text-center mb-4">Welcome Back</h1>
        {/* Info Section */}
          <div className="text-center text-white/70 mb-4 space-y-2">
            <p className="text-sm">Sign in with Google to instantly access the NEXT.AI portal.</p>
            <p className="text-sm font-medium">Earn rewards on every login and unlock premium features.</p>
        <motion.ul className="flex justify-center space-x-6 text-sm" initial="hidden" animate="visible" variants={{
          hidden: { opacity: 0, y: 10 },
          visible: { opacity: 1, y: 0, transition: { staggerChildren: 0.1 } }
        }}>
          <motion.li className="flex items-center gap-2" whileHover={{ scale: 1.1 }}>
            <Star className="w-4 h-4 text-brand" />
            <span>Earn NXTP points</span>
          </motion.li>
          <motion.li className="flex items-center gap-2" whileHover={{ scale: 1.1 }}>
            <Gift className="w-4 h-4 text-brand" />
            <span>Access exclusive tasks</span>
          </motion.li>
          <motion.li className="flex items-center gap-2" whileHover={{ scale: 1.1 }}>
            <Zap className="w-4 h-4 text-brand" />
            <span>Upgrade your node</span>
          </motion.li>
        </motion.ul>
          </div>
          <AnimatePresence>
            {error && (
              <motion.p
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="bg-red-500/10 border border-red-500/20 text-red-400 p-2 rounded mb-4 text-sm"
                role="alert"
              >
                {error}
              </motion.p>
            )}
          </AnimatePresence>
        <motion.button
          whileHover={{ scale: 1.02, boxShadow: '0 0 15px rgba(204,255,0,0.6)' }}
          whileTap={{ scale: 0.96 }}
          onClick={handleGoogle}
          disabled={!isFirebaseReady || loading}
          className={`relative w-full py-3 bg-gradient-to-r from-brand to-brand/80 text-white font-bold rounded flex items-center justify-center gap-3 transition ${loading ? 'opacity-70 cursor-wait' : 'hover:from-brand/90 hover:to-brand/70'}`}
        >
          {/* Google icon */}
          <svg className="w-5 h-5" viewBox="0 0 533.5 544.3" xmlns="http://www.w3.org/2000/svg">
            <path fill="#4285F4" d="M533.5 278.4c0-17.6-1.6-34.5-4.5-50.7H272v95.7h146.9c-6.4 34.1-25.5 62.9-54.4 82.3v68.4h87.9c51.5-47.4 81.1-117.2 81.1-196.1"/>
            <path fill="#34A853" d="M272 544.3c73.2 0 134.6-24.2 179.5-65.9l-87.9-68.4c-24.4 16.4-55.6 26.1-91.6 26.1-70.5 0-130.2-47.6-151.7-111.4H30.1v70.1c44.9 88.5 136.4 149.5 241.9 149.5"/>
            <path fill="#FBBC05" d="M120.3 324.7c-10.5-31.2-10.5-64.8 0-96l-70.2-70.1c-31.5 60.9-31.5 132.4 0 193.3l70.2-70.2"/>
            <path fill="#EA4335" d="M272 107.9c39.6-.6 77.6 14.9 105.8 42.7l79.5-79.5C425.1 21.2 350.9-4.5 272 0c-105.5 0-197 61-241.9 149.5l70.2 70.1c21.5-63.8 81.2-111.4 151.7-111.4"/>
          </svg>
          {loading ? (
            <>
              <svg className="animate-spin h-5 w-5 text-black" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
              </svg>
              Signing in…
            </>
          ) : (
            'Sign in with Google'
          )}
        </motion.button>
        <p className="mt-4 text-center text-sm">
          No account?{' '}
          <a href="/signup" className="text-brand underline">
            Create one
          </a>
        </p>
      </motion.div>
    </div>
  );
}
