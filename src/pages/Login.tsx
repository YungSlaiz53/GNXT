import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Login() {
  const { loginWithGoogle } = useAuth() || {};
  const navigate = useNavigate();

  const handleGoogle = async () => {
    try {
      if (typeof loginWithGoogle === 'function') {
        await loginWithGoogle();
      } else {
        throw new Error('loginWithGoogle not available');
      }
      navigate('/'); // Redirect after login
    } catch (e: any) {
      console.error('Login failed:', e.message);
    }
  };

  return (
    <div className="max-w-md mx-auto mt-12 p-8 glass-card rounded-2xl">
      <h1 className="text-2xl font-bold mb-6 text-center">Sign In</h1>
      <button
        onClick={handleGoogle}
        className="w-full py-2 bg-brand text-black font-bold rounded hover:shadow-brand transition"
      >
        Sign in with Google
      <p className="mt-4 text-center">
        No account?{' '}
        <a href="/signup" className="text-brand underline">
          Create one
        </a>
      </p>
