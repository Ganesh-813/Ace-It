import React, { useState } from 'react';
import { motion } from 'motion/react';
import { User as UserIcon, Mail, ArrowRight, CheckCircle, AtSign, Sparkles } from 'lucide-react';
import { storage } from '../services/storage';
import { User } from '../types';
import { sound } from '../services/sound';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (user: User) => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose, onSuccess }) => {
  const [mode, setMode] = useState<'signup' | 'login'>('signup');
  const [username, setUsername] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [email, setEmail] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [welcomeUser, setWelcomeUser] = useState<User | null>(null);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    sound.tap();

    try {
      if (mode === 'signup') {
        if (!email.trim()) {
          setError('Please provide your Gmail / email address');
          return;
        }
        if (!username.trim()) {
          setError('Please choose a username');
          return;
        }

        const newUser = storage.signUpUser({
          email: email.trim(),
          username: username.trim(),
          displayName: displayName.trim() || username.trim(),
        });

        sound.pearlChime(1.2);
        setWelcomeUser(newUser);
        setTimeout(() => {
          setWelcomeUser(null);
          onSuccess(newUser);
        }, 1400);
      } else {
        const identifier = email || username;
        if (!identifier.trim()) {
          setError('Please enter your Gmail or @username');
          return;
        }
        const user = storage.loginUser(identifier.trim());
        sound.pearlChime(1.1);
        onSuccess(user);
      }
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('Something went wrong. Please try again.');
      }
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
      <motion.div
        initial={{ opacity: 0, scale: 0.94 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.94 }}
        className="w-full max-w-sm rounded-3xl bg-[#0C101A] border border-white/10 shadow-2xl p-6 text-white relative overflow-hidden font-sans"
      >
        {/* Welcome Celebration Overlay */}
        {welcomeUser ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            className="py-8 flex flex-col items-center justify-center text-center space-y-3"
          >
            <div className="w-16 h-16 rounded-full bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400">
              <CheckCircle className="w-8 h-8" />
            </div>
            <h2 className="text-2xl font-bold text-white">
              Welcome, @{welcomeUser.username}
            </h2>
            <p className="text-xs text-slate-300 max-w-xs">
              Your account is active. +50 starter Pearls and a streak shield are waiting for you!
            </p>
          </motion.div>
        ) : (
          <>
            {/* Header Tabs */}
            <div className="flex items-center justify-between mb-5">
              <div>
                <h2 className="text-xl font-bold tracking-tight text-white">
                  {mode === 'signup' ? 'Create Account' : 'Welcome Back'}
                </h2>
                <p className="text-xs text-slate-400 mt-0.5">
                  {mode === 'signup' ? 'Join with your Gmail & username' : 'Sign in to Ace It'}
                </p>
              </div>
              <button
                type="button"
                onClick={onClose}
                className="text-slate-400 hover:text-white text-xs font-semibold p-1"
              >
                ✕
              </button>
            </div>

            {/* Toggle Mode */}
            <div className="flex items-center p-1 bg-slate-900 rounded-xl mb-4 border border-white/5">
              <button
                type="button"
                onClick={() => {
                  sound.tap();
                  setMode('signup');
                  setError(null);
                }}
                className={`flex-1 py-1.5 text-xs font-semibold rounded-lg transition-all ${
                  mode === 'signup'
                    ? 'bg-white text-slate-950 shadow-sm font-bold'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                Sign Up
              </button>
              <button
                type="button"
                onClick={() => {
                  sound.tap();
                  setMode('login');
                  setError(null);
                }}
                className={`flex-1 py-1.5 text-xs font-semibold rounded-lg transition-all ${
                  mode === 'login'
                    ? 'bg-white text-slate-950 shadow-sm font-bold'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                Sign In
              </button>
            </div>

            {error && (
              <div className="mb-4 p-2.5 rounded-xl bg-red-950/50 border border-red-500/30 text-xs text-red-300">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-3">
              {/* Email */}
              <div>
                <label className="block text-[11px] font-semibold text-slate-300 mb-1 uppercase tracking-wider">
                  Gmail / Email
                </label>
                <div className="relative flex items-center">
                  <Mail className="absolute left-3 w-4 h-4 text-slate-500" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@gmail.com"
                    required={mode === 'signup'}
                    className="w-full h-11 pl-9 pr-3 rounded-xl bg-slate-900 border border-white/10 text-sm text-white focus:outline-none focus:border-amber-400 transition-colors"
                  />
                </div>
              </div>

              {/* Username field */}
              <div>
                <label className="block text-[11px] font-semibold text-slate-300 mb-1 uppercase tracking-wider">
                  {mode === 'signup' ? 'Choose Username' : 'Username'}
                </label>
                <div className="relative flex items-center">
                  <span className="absolute left-3 text-slate-500 text-sm font-semibold">@</span>
                  <input
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, ''))}
                    placeholder="your_handle"
                    maxLength={20}
                    required={mode === 'signup'}
                    className="w-full h-11 pl-8 pr-3 rounded-xl bg-slate-900 border border-white/10 text-sm text-white focus:outline-none focus:border-amber-400 transition-colors"
                  />
                </div>
              </div>

              {mode === 'signup' && (
                <div>
                  <label className="block text-[11px] font-semibold text-slate-300 mb-1 uppercase tracking-wider">
                    Full Name (Optional)
                  </label>
                  <div className="relative flex items-center">
                    <UserIcon className="absolute left-3 w-4 h-4 text-slate-500" />
                    <input
                      type="text"
                      value={displayName}
                      onChange={(e) => setDisplayName(e.target.value)}
                      placeholder="e.g. Ganesh Patel"
                      className="w-full h-11 pl-9 pr-3 rounded-xl bg-slate-900 border border-white/10 text-sm text-white focus:outline-none focus:border-amber-400 transition-colors"
                    />
                  </div>
                </div>
              )}

              <button
                type="submit"
                className="w-full h-11 mt-4 rounded-xl bg-white hover:bg-slate-100 text-slate-950 font-bold text-sm flex items-center justify-center gap-2 shadow-lg shadow-white/10 active:scale-[0.98] transition-transform"
              >
                <span>{mode === 'signup' ? 'Create Account' : 'Sign In'}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </form>
          </>
        )}
      </motion.div>
    </div>
  );
};
