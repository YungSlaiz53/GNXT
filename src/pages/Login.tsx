import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useState } from 'react';

export default function Login() {
  const { loginWithGoogle, isFirebaseReady } = useAuth() || {};
  const navigate = useNavigate();
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleGoogle = async () => {
    console.log('Google login button clicked');
    if (typeof loginWithGoogle !== 'function') {
      setError('Google login is not available right now.');
      return;
    }
    setLoading(true);
    setError(null);
    try {
      await loginWithGoogle();
      navigate('/'); // Redirect after login
    } catch (e: any) {
      console.error('Login failed:', e.message);
      setError(e.message ?? 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto mt-12 p-8 glass-card rounded-2xl">
      <h1 className="text-2xl font-bold mb-6 text-center">Sign In</h1>
      <button
        onClick={handleGoogle}
        disabled={!isFirebaseReady || loading}
        className={`w-full py-2 bg-brand text-black font-bold rounded hover:shadow-brand transition ${(!isFirebaseReady || loading) ? 'opacity-50 cursor-not-allowed' : ''}`}
      >
        {loading ? (
          <span className="flex items-center justify-center">
            <svg className="animate-spin h-5 w-5 mr-2 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4l3-3-3-3v4a8 8 0 00-8 8z"></path>
            </svg>
            Signing in…
          </span>
        ) : (
          'Sign in with Google'
        )}
      </button>
      {error && (
        <p className="mt-2 text-sm text-red-400" role="alert">
          {error}
        </p>
      )}
      <p className="mt-4 text-center">
        No account?{' '}
        <a href="/signup" className="text-brand underline">
          Create one
        </a>
      </p>
    </div>
  );
}
