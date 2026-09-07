import React, { useState, useEffect } from 'react';
import { useNavigate, Link, useSearchParams } from 'react-router-dom';
import { Sparkles, Mail, Lock, ShieldAlert } from 'lucide-react';
import { useAuthStore } from '../../store/authStore';

export default function Login() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { login, user, error, clearError, loading } = useAuthStore();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  useEffect(() => {
    // If already logged in, redirect to home or admin depending on role
    if (user) {
      if (user.role === 'admin' || user.role === 'sub-admin') {
        navigate('/admin');
      } else {
        navigate('/');
      }
    }
    clearError();
  }, [user, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !password) return;

    const res = await login(email, password);
    if (res.success) {
      if (res.user.role === 'admin' || res.user.role === 'sub-admin') {
        navigate('/admin');
      } else {
        navigate('/');
      }
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 pt-24 pb-16">
      
      <div className="max-w-md w-full bg-teal-dark border border-gold/25 p-8 rounded-lg space-y-6 shadow-2xl relative">
        {/* Frame Accent lines */}
        <div className="absolute top-2 left-2 right-2 bottom-2 border border-gold/10 pointer-events-none rounded" />

        <div className="text-center space-y-2">
          <div className="flex justify-center items-center space-x-1.5 text-gold">
            <span className="font-serif text-2xl font-bold tracking-widest">VAARAHI</span>
            <Sparkles className="h-4 w-4 text-gold animate-pulse" />
          </div>
          <span className="text-xs text-gold/80 uppercase tracking-widest block font-medium">AUTHENTIC SAREE CO.</span>
        </div>

        {searchParams.get('expired') && (
          <div className="bg-orange-950/20 border border-orange-500/30 text-orange-400 p-2.5 rounded text-xs text-center flex items-center space-x-2">
            <ShieldAlert className="h-4 w-4 flex-shrink-0" />
            <span>Session expired. Please sign in again.</span>
          </div>
        )}

        {error && (
          <div className="bg-red-950/20 border border-red-500/30 text-red-400 p-2.5 rounded text-xs text-center flex items-center space-x-2">
            <ShieldAlert className="h-4 w-4 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="relative">
            <label className="text-[10px] uppercase tracking-widest text-gold block mb-1 font-semibold">Email ID</label>
            <div className="relative">
              <input
                type="email"
                required
                placeholder="care@vaarahi.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-teal-deep border border-gold/30 text-white rounded px-4 py-2.5 text-xs pl-10 focus:outline-none focus:border-gold"
              />
              <Mail className="absolute left-3.5 top-3.5 h-4 w-4 text-gold" />
            </div>
          </div>

          <div className="relative">
            <label className="text-[10px] uppercase tracking-widest text-gold block mb-1 font-semibold">Password</label>
            <div className="relative">
              <input
                type="password"
                required
                placeholder="&bull;&bull;&bull;&bull;&bull;&bull;&bull;&bull;"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-teal-deep border border-gold/30 text-white rounded px-4 py-2.5 text-xs pl-10 focus:outline-none focus:border-gold"
              />
              <Lock className="absolute left-3.5 top-3.5 h-4 w-4 text-gold" />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-gold text-teal-dark font-bold hover:bg-gold-light text-center uppercase tracking-widest py-3.5 rounded transition shadow border border-gold text-xs font-semibold disabled:opacity-50"
          >
            {loading ? 'Authenticating...' : 'Secure Login'}
          </button>
        </form>

        <div className="text-center text-xs text-gray-300 pt-4 border-t border-gold/10">
          <span>New to Vaarahi Weaves? </span>
          <Link to="/register" className="text-gold hover:text-white underline font-semibold">
            Create Account
          </Link>
        </div>

      </div>

    </div>
  );
}
