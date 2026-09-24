import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Flame, ShieldCheck } from 'lucide-react';
import { sound } from '../services/sound';

interface StreakVisual3DProps {
  streak: number;
  longestStreak: number;
  hasCheckedInToday?: boolean;
  streakShields?: number;
  onTap?: () => void;
}

export const StreakVisual3D: React.FC<StreakVisual3DProps> = ({
  streak,
  longestStreak,
  hasCheckedInToday = false,
  streakShields = 2,
  onTap,
}) => {
  const [prevStreak, setPrevStreak] = useState(streak);
  const [isBumping, setIsBumping] = useState(false);

  useEffect(() => {
    if (streak > prevStreak) {
      setIsBumping(true);
      sound.streakFanfare();
      const timer = setTimeout(() => {
        setIsBumping(false);
        setPrevStreak(streak);
      }, 950);
      return () => clearTimeout(timer);
    }
    setPrevStreak(streak);
  }, [streak, prevStreak]);

  return (
    <div
      onClick={() => {
        sound.tap();
        if (onTap) onTap();
      }}
      className="relative flex flex-col items-center justify-center cursor-pointer group py-3 select-none"
    >
      {/* Outer ambient glow */}
      <div
        className={`absolute w-52 h-52 rounded-full blur-3xl transition-opacity duration-700 pointer-events-none ${
          isBumping
            ? 'bg-amber-500/45 scale-125'
            : hasCheckedInToday
            ? 'bg-orange-500/25'
            : 'bg-amber-500/20'
        }`}
      />

      {/* 3D Glowing Circular Ring */}
      <div className="relative w-44 h-44 flex items-center justify-center">
        {/* Animated breathing outer ring */}
        <div
          className={`absolute inset-0 rounded-full border border-orange-500/30 streak-ring-glow pointer-events-none transition-all duration-500 ${
            isBumping ? 'scale-115 border-amber-400' : ''
          }`}
          style={{
            background: 'radial-gradient(circle, rgba(251, 146, 60, 0.08) 0%, transparent 70%)',
          }}
        />

        {/* Multi-layered 3D concentric ring segments */}
        <svg className="absolute inset-0 w-full h-full -rotate-90 pointer-events-none" viewBox="0 0 160 160">
          <circle
            cx="80"
            cy="80"
            r="68"
            fill="none"
            stroke="currentColor"
            className="text-slate-800/80 dark:text-slate-800/80"
            strokeWidth="5"
          />
          <circle
            cx="80"
            cy="80"
            r="68"
            fill="none"
            stroke="url(#streakGrad)"
            strokeWidth="6"
            strokeDasharray="427"
            strokeDashoffset={hasCheckedInToday ? '0' : '90'}
            strokeLinecap="round"
            className="transition-all duration-1000 ease-out"
          />
          <defs>
            <linearGradient id="streakGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#f97316" />
              <stop offset="50%" stopColor="#fb923c" />
              <stop offset="100%" stopColor="#fde047" />
            </linearGradient>
          </defs>
        </svg>

        {/* Center floating core */}
        <motion.div
          animate={
            isBumping
              ? { scale: [1, 1.28, 1.05, 1], rotate: [0, -3, 3, 0] }
              : { y: [-2, 2, -2] }
          }
          transition={
            isBumping
              ? { duration: 0.85, ease: 'easeOut' }
              : { duration: 4.5, repeat: Infinity, ease: 'easeInOut' }
          }
          className="relative z-10 flex flex-col items-center justify-center w-32 h-32 rounded-full bg-gradient-to-b from-slate-900/90 to-slate-950/95 dark:from-slate-900/90 dark:to-[#090D16]/95 backdrop-blur-md border border-white/10 shadow-2xl shadow-orange-950/40"
        >
          {/* Flame Icon with subtle shimmer */}
          <div className="flex items-center gap-1 -mt-1 text-amber-400">
            <Flame
              className={`w-5 h-5 transition-transform duration-300 ${
                isBumping ? 'scale-125 text-amber-300 fill-amber-300' : 'fill-amber-400/90'
              }`}
            />
          </div>

          {/* Large Animated Streak Number */}
          <AnimatePresence mode="popLayout">
            <motion.span
              key={streak}
              initial={{ y: 8, opacity: 0, scale: 0.8 }}
              animate={{ y: 0, opacity: 1, scale: 1 }}
              exit={{ y: -8, opacity: 0 }}
              transition={{ type: 'spring', stiffness: 450, damping: 25 }}
              className="text-4xl font-extrabold tracking-tight text-white tabular-nums drop-shadow-md"
              style={{ fontFamily: 'var(--font-display, sans-serif)' }}
            >
              {streak}
            </motion.span>
          </AnimatePresence>

          {/* Subtitle */}
          <span className="text-[11px] font-bold tracking-widest uppercase text-slate-300 mt-0.5">
            Day Streak
          </span>
        </motion.div>
      </div>

      {/* Status banner & Shield indicator */}
      <div className="flex items-center gap-3 mt-3">
        <span className="text-xs font-medium text-slate-400">
          {hasCheckedInToday ? (
            <span className="text-emerald-400 font-semibold flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
              Streak secured today
            </span>
          ) : (
            'Don’t break the chain.'
          )}
        </span>

        {streakShields > 0 && (
          <div
            title={`${streakShields} Streak Shields active`}
            className="flex items-center gap-1 text-[11px] text-amber-300/90 bg-amber-950/40 border border-amber-500/25 px-2 py-0.5 rounded-full"
          >
            <ShieldCheck className="w-3 h-3 text-amber-400" />
            <span>{streakShields}</span>
          </div>
        )}
      </div>

      {longestStreak > streak && (
        <span className="text-[11px] text-slate-400 mt-1">
          Best record: {longestStreak} days
        </span>
      )}
    </div>
  );
};
