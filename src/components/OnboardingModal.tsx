import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Users, Flame, Trophy, Sparkles, ArrowRight, Check } from 'lucide-react';
import { PearlIcon } from './PearlIcon';
import { sound } from '../services/sound';

interface OnboardingModalProps {
  onComplete: () => void;
}

const SCREENS = [
  {
    title: 'Stay consistent. Together.',
    subtext: 'Turn your goals into shared streaks and keep each other accountable every single day.',
    icon: Flame,
    color: 'from-amber-500/20 to-orange-500/10',
    accentColor: '#f97316',
    renderVisual: () => (
      <div className="relative w-48 h-48 mx-auto flex items-center justify-center">
        <div className="absolute inset-0 rounded-full border border-orange-500/30 streak-ring-glow" />
        <div className="relative z-10 w-32 h-32 rounded-full bg-slate-900/90 border border-white/10 flex flex-col items-center justify-center shadow-2xl">
          <Flame className="w-10 h-10 text-amber-400 fill-amber-400" />
          <span className="text-2xl font-black text-white mt-1 tabular-nums">18</span>
          <span className="text-[10px] font-bold tracking-widest text-slate-400 uppercase">Day Streak</span>
        </div>
      </div>
    ),
  },
  {
    title: 'Build goals with friends.',
    subtext: 'Invite friends by @username, pool your momentum, and celebrate daily progress side-by-side.',
    icon: Users,
    color: 'from-blue-500/20 to-cyan-500/10',
    accentColor: '#0ea5e9',
    renderVisual: () => (
      <div className="relative w-52 h-44 mx-auto flex items-center justify-center">
        {/* Connected circle of accountability avatars */}
        <div className="relative w-40 h-40">
          <div className="absolute inset-0 rounded-full border border-dashed border-cyan-500/30 animate-spin" style={{ animationDuration: '24s' }} />
          {/* Central Target */}
          <div className="absolute inset-0 m-auto w-16 h-16 rounded-2xl bg-gradient-to-tr from-cyan-600 to-blue-600 flex flex-col items-center justify-center shadow-lg shadow-cyan-900/40">
            <Users className="w-7 h-7 text-white" />
            <span className="text-[9px] font-bold text-white/90 uppercase tracking-tight mt-0.5">Squad</span>
          </div>
          {/* Surrounding Avatars */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1 w-9 h-9 rounded-full bg-slate-800 border-2 border-cyan-400 flex items-center justify-center text-xs font-bold text-white shadow-md">
            G
          </div>
          <div className="absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-1 w-9 h-9 rounded-full bg-slate-800 border-2 border-emerald-400 flex items-center justify-center text-xs font-bold text-white shadow-md">
            R
          </div>
          <div className="absolute left-0 top-1/2 -translate-x-1 -translate-y-1/2 w-9 h-9 rounded-full bg-slate-800 border-2 border-amber-400 flex items-center justify-center text-xs font-bold text-white shadow-md">
            A
          </div>
          <div className="absolute right-0 top-1/2 translate-x-1 -translate-y-1/2 w-9 h-9 rounded-full bg-slate-800 border-2 border-purple-400 flex items-center justify-center text-xs font-bold text-white shadow-md">
            K
          </div>
        </div>
      </div>
    ),
  },
  {
    title: 'Your effort counts.',
    subtext: 'Transparent weekly contribution scores calculate daily completion, effort, and consistency fairly.',
    icon: Trophy,
    color: 'from-emerald-500/20 to-teal-500/10',
    accentColor: '#10b981',
    renderVisual: () => (
      <div className="w-60 mx-auto p-4 rounded-2xl bg-slate-900/90 border border-white/10 shadow-2xl space-y-3 text-left">
        <div className="flex items-center justify-between text-xs">
          <span className="font-semibold text-slate-200">You</span>
          <span className="font-bold text-emerald-400 tabular-nums">91%</span>
        </div>
        <div className="w-full h-2 rounded-full bg-slate-800 overflow-hidden">
          <div className="h-full bg-gradient-to-r from-emerald-500 to-teal-400 rounded-full w-[91%]" />
        </div>
        <div className="flex items-center justify-between text-xs pt-1">
          <span className="text-slate-400">Accountability Partner</span>
          <span className="font-medium text-slate-300 tabular-nums">78%</span>
        </div>
        <div className="w-full h-2 rounded-full bg-slate-800 overflow-hidden">
          <div className="h-full bg-gradient-to-r from-slate-600 to-slate-400 rounded-full w-[78%]" />
        </div>
      </div>
    ),
  },
  {
    title: 'Consistency gets rewarded.',
    subtext: 'Earn glossy Pearls, accumulate XP, unlock 3D collectible badges, and lead the weekly podium.',
    icon: Sparkles,
    color: 'from-purple-500/20 to-pink-500/10',
    accentColor: '#a855f7',
    renderVisual: () => (
      <div className="relative w-56 h-44 mx-auto flex items-center justify-center">
        {/* Floating Pearls and Badge */}
        <div className="relative z-10 flex flex-col items-center">
          <div className="w-18 h-18 rounded-2xl bg-gradient-to-b from-amber-300 via-amber-400 to-amber-600 p-1 shadow-xl shadow-amber-900/30 flex items-center justify-center border border-white/30">
            <Trophy className="w-9 h-9 text-slate-950" />
          </div>
          <div className="flex items-center gap-2 mt-3 bg-slate-900/90 border border-white/15 px-3 py-1.5 rounded-full shadow-lg">
            <PearlIcon size="md" />
            <span className="text-sm font-black text-white tabular-nums">+150 Pearls</span>
          </div>
        </div>
        {/* Surrounding mini floating pearls */}
        <div className="absolute top-2 left-6 animate-bounce" style={{ animationDuration: '3s' }}>
          <PearlIcon size="sm" />
        </div>
        <div className="absolute bottom-3 right-6 animate-bounce" style={{ animationDuration: '2.4s' }}>
          <PearlIcon size="md" />
        </div>
        <div className="absolute top-5 right-8 animate-bounce" style={{ animationDuration: '3.6s' }}>
          <PearlIcon size="xs" />
        </div>
      </div>
    ),
  },
];

export const OnboardingModal: React.FC<OnboardingModalProps> = ({ onComplete }) => {
  const [step, setStep] = useState(0);

  const handleNext = () => {
    sound.tap();
    if (step < SCREENS.length - 1) {
      setStep(step + 1);
    } else {
      sound.checkinSuccess();
      onComplete();
    }
  };

  const handleSkip = () => {
    sound.tap();
    onComplete();
  };

  const cur = SCREENS[step];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 16 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="w-full max-w-sm rounded-3xl bg-gradient-to-b from-[#0F1420] to-[#090C14] border border-white/10 shadow-2xl p-6 text-center relative overflow-hidden"
      >
        {/* Top skip button */}
        <div className="flex items-center justify-between mb-4">
          <span className="text-xs font-bold tracking-wider text-slate-400 uppercase">
            Ace It · Step {step + 1} of {SCREENS.length}
          </span>
          {step < SCREENS.length - 1 && (
            <button
              onClick={handleSkip}
              className="text-xs font-semibold text-slate-400 hover:text-white px-2 py-1 transition-colors"
            >
              Skip
            </button>
          )}
        </div>

        {/* Dynamic visual slot */}
        <div className="h-48 flex items-center justify-center my-2">
          <AnimatePresence mode="wait">
            <motion.div
              key={step}
              initial={{ opacity: 0, scale: 0.88, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.88, y: -10 }}
              transition={{ duration: 0.3 }}
              className="w-full"
            >
              {cur.renderVisual()}
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Text descriptions */}
        <div className="min-h-[105px] mt-2">
          <AnimatePresence mode="wait">
            <motion.div
              key={step}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.25 }}
            >
              <h2 className="text-xl font-extrabold text-white tracking-tight">
                {cur.title}
              </h2>
              <p className="text-xs leading-relaxed text-slate-300 mt-2 max-w-xs mx-auto">
                {cur.subtext}
              </p>
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Progress step dots */}
        <div className="flex items-center justify-center gap-1.5 my-4">
          {SCREENS.map((_, i) => (
            <div
              key={i}
              className={`h-1.5 rounded-full transition-all duration-300 ${
                i === step ? 'w-6 bg-white' : 'w-1.5 bg-slate-700'
              }`}
            />
          ))}
        </div>

        {/* Primary Action */}
        <button
          onClick={handleNext}
          className="w-full h-12 rounded-2xl bg-white hover:bg-slate-100 text-slate-950 font-bold text-sm flex items-center justify-center gap-2 shadow-lg shadow-white/10 active:scale-[0.98] transition-transform"
        >
          {step === SCREENS.length - 1 ? (
            <>
              <span>Get Started</span>
              <Check className="w-4 h-4" />
            </>
          ) : (
            <>
              <span>Continue</span>
              <ArrowRight className="w-4 h-4" />
            </>
          )}
        </button>
      </motion.div>
    </div>
  );
};
