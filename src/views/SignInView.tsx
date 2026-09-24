import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Mail, AtSign, User as UserIcon, ArrowRight, ShieldCheck, Sparkles, CheckCircle2 } from 'lucide-react';
import { storage } from '../services/storage';
import { User } from '../types';
import { sound } from '../services/sound';
import { PearlIcon } from '../components/PearlIcon';

interface SignInViewProps {
  onSignedIn: (user: User) => void;
}

const AVATAR_SEEDS = ['Felix', 'Aneka', 'Caleb', 'Milo', 'Nala', 'Leo'];

export const SignInView: React.FC<SignInViewProps> = ({ onSignedIn }) => {
  const [mode, setMode] = useState<'signup' | 'signin'>('signup');
  const [email, setEmail] = useState('');
  const [username, setUsername] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [selectedAvatarSeed, setSelectedAvatarSeed] = useState(AVATAR_SEEDS[0]);
  const [error, setError] = useState<string | null>(null);
  const [successUser, setSuccessUser] = useState<User | null>(null);

  // User metadata quick suggestion
  const suggestedEmail = 'gv878982@gmail.com';

  const handleQuickFillEmail = () => {
    sound.tap();
    setEmail(suggestedEmail);
    if (!username) {
      setUsername('ganesh');
    }
    if (!displayName) {
      setDisplayName('Ganesh Patel');
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    sound.tap();

    try {
      if (mode === 'signup') {
        if (!email.trim()) {
          setError('Please provide your Gmail or email address');
          return;
        }
        if (!username.trim()) {
          setError('Please choose a username');
          return;
        }

        const avatarUrl = `https://api.dicebear.com/7.x/notionists/svg?seed=${selectedAvatarSeed}&backgroundColor=0f172a,1e293b,334155`;

        const user = storage.signUpUser({
          email: email.trim(),
          username: username.trim(),
          displayName: displayName.trim() || username.trim(),
          avatarUrl,
        });

        sound.pearlChime(1.2);
        setSuccessUser(user);
        setTimeout(() => {
          onSignedIn(user);
        }, 1200);
      } else {
        const identifier = email || username;
        if (!identifier.trim()) {
          setError('Please enter your Gmail or @username');
          return;
        }

        const user = storage.loginUser(identifier.trim());
        sound.pearlChime(1.1);
        onSignedIn(user);
      }
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('An unexpected error occurred. Please try again.');
      }
    }
  };

  return (
    <div className="min-h-screen w-full bg-[#07090E] text-slate-100 flex flex-col justify-center px-4 py-8 select-none relative overflow-hidden">
      {/* Ambient background glow */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-96 h-96 rounded-full bg-gradient-to-tr from-amber-500/10 via-orange-500/15 to-indigo-600/15 blur-3xl pointer-events-none" />

      <div className="w-full max-w-sm mx-auto relative z-10 space-y-6">
        {/* Brand identity header */}
        <div className="text-center space-y-2">
          <div className="inline-flex items-center justify-center gap-2 p-2 px-3 rounded-full bg-white/5 border border-white/10 mb-1">
            <PearlIcon size="md" />
            <span className="text-xs font-semibold tracking-wider uppercase text-amber-300">
              Welcome to Ace It
            </span>
          </div>
          <h1 className="text-3xl font-extrabold text-white tracking-tight">
            Ace It
          </h1>
          <p className="text-xs text-slate-400 max-w-xs mx-auto">
            Build your streak. Ace your goals with your accountability partner.
          </p>
        </div>

        {/* Success Modal Animation */}
        {successUser ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.92 }}
            animate={{ opacity: 1, scale: 1 }}
            className="p-6 rounded-3xl bg-slate-900 border border-white/10 shadow-2xl text-center space-y-4"
          >
            <div className="w-16 h-16 rounded-full bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400 mx-auto">
              <CheckCircle2 className="w-8 h-8" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white">Account Created!</h2>
              <p className="text-xs text-slate-300 mt-1">
                Welcome, <span className="font-semibold text-white">@{successUser.username}</span>.
              </p>
              <p className="text-xs text-amber-300 font-medium mt-2">
                +50 Starter Pearls & 1 Streak Shield added to your balance.
              </p>
            </div>
          </motion.div>
        ) : (
          <div className="p-6 rounded-3xl bg-slate-900/90 backdrop-blur-xl border border-white/10 shadow-2xl space-y-5">
            {/* Tabs */}
            <div className="flex items-center p-1 bg-slate-950 rounded-xl border border-white/5">
              <button
                type="button"
                onClick={() => {
                  sound.tap();
                  setMode('signup');
                  setError(null);
                }}
                className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all ${
                  mode === 'signup'
                    ? 'bg-white text-slate-950 shadow'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                Create Account
              </button>
              <button
                type="button"
                onClick={() => {
                  sound.tap();
                  setMode('signin');
                  setError(null);
                }}
                className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all ${
                  mode === 'signin'
                    ? 'bg-white text-slate-950 shadow'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                Sign In
              </button>
            </div>

            {error && (
              <motion.div
                initial={{ opacity: 0, y: -4 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-3 rounded-xl bg-red-950/60 border border-red-500/30 text-xs text-red-200"
              >
                {error}
              </motion.div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Quick Fill Suggestion */}
              {mode === 'signup' && (
                <div className="flex items-center justify-between p-2 rounded-xl bg-amber-950/30 border border-amber-500/20 text-xs">
                  <span className="text-[11px] text-amber-200">Quick sign up with your Gmail?</span>
                  <button
                    type="button"
                    onClick={handleQuickFillEmail}
                    className="px-2 py-1 rounded-lg bg-amber-400 hover:bg-amber-300 text-slate-950 text-[10px] font-bold transition-colors"
                  >
                    Use {suggestedEmail}
                  </button>
                </div>
              )}

              {/* Gmail / Email */}
              <div>
                <label className="block text-[11px] font-bold text-slate-300 mb-1.5 uppercase tracking-wider">
                  Gmail / Email
                </label>
                <div className="relative flex items-center">
                  <Mail className="absolute left-3.5 w-4 h-4 text-slate-500" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@gmail.com"
                    required
                    className="w-full h-11 pl-10 pr-3.5 rounded-xl bg-slate-950 border border-white/10 text-sm text-white focus:outline-none focus:border-amber-400 focus:ring-1 focus:ring-amber-400 transition-all placeholder:text-slate-600 font-medium"
                  />
                </div>
              </div>

              {/* Username */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="block text-[11px] font-bold text-slate-300 uppercase tracking-wider">
                    {mode === 'signup' ? 'Choose Username' : 'Username'}
                  </label>
                  {mode === 'signup' && (
                    <span className="text-[10px] text-slate-400">Unique identifier</span>
                  )}
                </div>
                <div className="relative flex items-center">
                  <span className="absolute left-3.5 text-slate-500 font-bold text-sm">@</span>
                  <input
                    type="text"
                    value={username}
                    onChange={(e) =>
                      setUsername(e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, ''))
                    }
                    placeholder="username"
                    maxLength={20}
                    required={mode === 'signup'}
                    className="w-full h-11 pl-9 pr-3.5 rounded-xl bg-slate-950 border border-white/10 text-sm text-white focus:outline-none focus:border-amber-400 focus:ring-1 focus:ring-amber-400 transition-all placeholder:text-slate-600 font-medium"
                  />
                </div>
                {mode === 'signup' && (
                  <p className="text-[10px] text-slate-400 mt-1">
                    Your accountability friends will connect using @{username || 'username'}
                  </p>
                )}
              </div>

              {/* Display Name (Only on sign up) */}
              {mode === 'signup' && (
                <div>
                  <label className="block text-[11px] font-bold text-slate-300 mb-1.5 uppercase tracking-wider">
                    Your Name
                  </label>
                  <div className="relative flex items-center">
                    <UserIcon className="absolute left-3.5 w-4 h-4 text-slate-500" />
                    <input
                      type="text"
                      value={displayName}
                      onChange={(e) => setDisplayName(e.target.value)}
                      placeholder="e.g. Ganesh Patel"
                      className="w-full h-11 pl-10 pr-3.5 rounded-xl bg-slate-950 border border-white/10 text-sm text-white focus:outline-none focus:border-amber-400 focus:ring-1 focus:ring-amber-400 transition-all placeholder:text-slate-600 font-medium"
                    />
                  </div>
                </div>
              )}

              {/* Avatar Picker (Only on sign up) */}
              {mode === 'signup' && (
                <div>
                  <label className="block text-[11px] font-bold text-slate-300 mb-1.5 uppercase tracking-wider">
                    Choose Avatar
                  </label>
                  <div className="flex items-center justify-between gap-1.5 p-2 rounded-xl bg-slate-950 border border-white/5">
                    {AVATAR_SEEDS.map((seed) => {
                      const isSelected = selectedAvatarSeed === seed;
                      return (
                        <button
                          key={seed}
                          type="button"
                          onClick={() => {
                            sound.tap();
                            setSelectedAvatarSeed(seed);
                          }}
                          className={`w-9 h-9 rounded-full overflow-hidden transition-all ${
                            isSelected
                              ? 'ring-2 ring-amber-400 scale-105 shadow-md'
                              : 'opacity-60 hover:opacity-100'
                          }`}
                        >
                          <img
                            src={`https://api.dicebear.com/7.x/notionists/svg?seed=${seed}&backgroundColor=0f172a`}
                            alt={seed}
                            className="w-full h-full object-cover"
                          />
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Starter bonus callout */}
              {mode === 'signup' && (
                <div className="flex items-center gap-2 p-2.5 rounded-xl bg-white/5 border border-white/5 text-[11px] text-slate-300">
                  <Sparkles className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                  <span>
                    Includes <strong className="text-white">50 starter Pearls</strong> & 1 free Streak Freeze shield.
                  </span>
                </div>
              )}

              <button
                type="submit"
                className="w-full h-11 mt-2 rounded-xl bg-white hover:bg-slate-100 text-slate-950 font-bold text-sm flex items-center justify-center gap-2 shadow-lg shadow-white/10 active:scale-[0.98] transition-all"
              >
                <span>{mode === 'signup' ? 'Create Account & Start Fresh' : 'Sign In'}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </form>
          </div>
        )}

        {/* Footer info */}
        <div className="flex items-center justify-center gap-2 text-[11px] text-slate-400">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
          <span>Real streaks · 100% authentic accountability · No fake data</span>
        </div>
      </div>
    </div>
  );
};
