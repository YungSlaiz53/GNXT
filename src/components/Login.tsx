import { signInWithPopup } from 'firebase/auth';
import { getFirebaseAuth, googleProvider } from '../lib/firebase';
import { useNavigate } from 'react-router-dom';

function Login() {
  const navigate = useNavigate();

  const handleGoogleLogin = async () => {
    try {
      const auth = getFirebaseAuth();
      if (!auth) throw new Error('Firebase Auth not initialized');
      
      googleProvider.addScope('email');
      const result = await signInWithPopup(auth, googleProvider);
      const user = result.user;
      
      console.log('Logged in:', user.email, user.displayName);
      navigate('/'); // Redirect after login
    } catch (error) {
      console.error('Login failed:', error);
    }
  };

  return (
    <button 
      onClick={handleGoogleLogin}
      className="w-full bg-white/5 hover:bg-white/10 border border-white/10 py-4 rounded-2xl font-bold flex items-center justify-center gap-3 transition-all"
    >
      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-brand" viewBox="0 0 24 24" fill="currentColor">
        <path d="M21.35 11.1H12v2.9h5.46c-.24 1.48-1.36 2.73-2.96 3.35v2.8h4.78c2.81-2.58 4.43-6.38 4.43-10.8 0-.73-.07-1.44-.2-2.15z"/>
        <path d="M12 22c2.7 0 4.96-.89 6.61-2.4l-4.78-2.8c-1.33.9-3.04 1.44-4.83 1.44-3.71 0-6.86-2.5-7.99-5.87H.92v3.68C2.6 19.68 7.01 22 12 22z"/>
        <path d="M4.01 13.27c-.33-.96-.52-1.97-.52-3.02s.19-2.06.52-3.02V3.55H.92A11.95 11.95 0 000 10.25c0 1.91.45 3.73 1.25 5.36l3.76-2.94z"/>
        <path d="M12 5.5c1.47 0 2.79.5 3.83 1.48l2.87-2.87C16.94 2.66 14.69 2 12 2 7.01 2 2.6 4.32.92 7.55l3.09 3.68C5.14 7.99 8.29 5.5 12 5.5z"/>
      </svg>
      Sign in with Google
    </button>
  );
}

export default Login;
