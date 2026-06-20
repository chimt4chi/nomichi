'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { auth } from '@/lib/auth';
import { db } from '@/lib/db';
import { ShieldAlert, LogIn, Lock } from 'lucide-react';

export default function AdminLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('admin@thenomichi.com');
  const [password, setPassword] = useState('password123');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [emailError, setEmailError] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [mockMode, setMockMode] = useState(false);

  useEffect(() => {
    // Check if we are running in mock fallback mode
    setMockMode(db.isMockMode());

    // Redirect to admin dashboard if user is already signed in
    async function checkSession() {
      const user = await auth.getUser();
      if (user) {
        router.push('/admin');
      }
    }
    checkSession();
  }, [router]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setEmailError('');
    setPasswordError('');

    let hasErrors = false;

    if (!email.trim()) {
      setEmailError('Please enter your email address');
      hasErrors = true;
    } else {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        setEmailError('Please enter a valid email address');
        hasErrors = true;
      }
    }

    if (!password) {
      setPasswordError('Please enter your password');
      hasErrors = true;
    } else if (password.length < 6) {
      setPasswordError('Password must be at least 6 characters');
      hasErrors = true;
    }

    if (hasErrors) return;

    setLoading(true);
    try {
      const { user, error: authError } = await auth.signIn(email, password);
      if (authError) {
        const msg = authError.message.toLowerCase();
        if (msg.includes('invalid email or password') || msg.includes('credential') || msg.includes('password')) {
          setPasswordError('Incorrect password. Please try again.');
        } else if (msg.includes('email')) {
          setEmailError(authError.message);
        } else {
          setError(authError.message);
        }
      } else if (user) {
        router.push('/admin');
      }
    } catch (err: any) {
      console.error(err);
      setError('An unexpected login error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-[#FFFBF5] flex items-center justify-center p-6">
      <div className="max-w-md w-full bg-white p-8 rounded-xl border border-[rgba(209,183,136,0.4)] shadow-lg animate-fade-in">
        {/* Brand Header */}
        <div className="text-center mb-8">
          <span className="font-display font-extrabold text-3xl tracking-tight text-[#1C1B1A]">
            NOM<span className="text-[#D55D27]">I</span>CH<span className="text-[#D55D27]">I</span>
          </span>
          <p className="text-xs uppercase tracking-widest text-[#45471D] font-semibold mt-1">
            Trip Desk Admin
          </p>
        </div>

        {error && (
          <div className="p-3 mb-6 text-xs bg-red-50 border border-red-200 text-red-700 rounded-lg flex items-start gap-2">
            <ShieldAlert size={16} className="shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-4">
          {/* Email input */}
          <div className="form-group">
            <label className="form-label">Work Email</label>
            <input
              type="text"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="name@thenomichi.com"
              className="form-input text-sm"
              disabled={loading}
            />
            {emailError && <span className="form-error">{emailError}</span>}
          </div>

          {/* Password input */}
          <div className="form-group">
            <label className="form-label">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="form-input text-sm"
              disabled={loading}
            />
            {passwordError && <span className="form-error">{passwordError}</span>}
          </div>

          <button
            type="submit"
            disabled={loading}
            className={`btn btn-ink w-full text-xs font-semibold uppercase tracking-wider py-3 mt-2 flex items-center justify-center gap-2 ${
              loading ? 'btn-disabled' : ''
            }`}
          >
            {loading ? (
              <span>Signing In...</span>
            ) : (
              <>
                <LogIn size={14} />
                <span>Sign In to Desk</span>
              </>
            )}
          </button>
        </form>

        {/* Back to Home link */}
        <div className="mt-6 text-center">
          <a
            href="/"
            className="text-xs text-[#45471D] hover:text-[#D55D27] font-medium transition-colors inline-flex items-center gap-1.5"
          >
            <span>←</span>
            <span>Back to Home</span>
          </a>
        </div>
      </div>
    </main>
  );
}
