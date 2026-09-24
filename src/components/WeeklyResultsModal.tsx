import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Trophy, Crown, Sparkles, Flame, X, ArrowRight, Award } from 'lucide-react';
import { WeeklyResult, User } from '../types';
import { PearlIcon } from './PearlIcon';
import { sound } from '../services/sound';

interface WeeklyResultsModalProps {
  result: WeeklyResult | null;
  isOpen: boolean;
  currentUser?: User | null;
  onClose: () => void;
  onClaimChampion?: () => void;
}

export const WeeklyResultsModal: React.FC<WeeklyResultsModalProps> = ({
  result,
  isOpen,
  currentUser,
  onClose,
  onClaimChampion,
}) => {
  const [revealed, setRevealed] = useState(false);

  useEffect(() => {
    if (isOpen) {
      sound.streakFanfare();
      const t = setTimeout(() => {
        setRevealed(true);
        sound.pearlChime(1.3);
      }, 700);
      return () => clearTimeout(t);
    } else {
      setRevealed(false);
    }
  }, [isOpen]);

  if (!isOpen || !result) return null;

  const champion = result.members.find((m) => m.isChampion) || result.members[0];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md select-none">
      <motion.div
        initial={{ opacity: 0, scale: 0.92, y: 15 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.92 }}
        className="w-full max-w-md max-h-[92vh] overflow-y-auto rounded-3xl bg-[#090C14] border border-amber-500/30 shadow-2xl p-6 text-white relative flex flex-col justify-between"
      >
        {/* Ambient top light */}
        <div className="absolute -top-12 left-1/2 -translate-x-1/2 w-64 h-32 bg-amber-500/20 blur-3xl pointer-events-none rounded-full" />

        {/* Close Button */}
        <button
          onClick={onClose}
          type="button"
          className="absolute top-5 right-5 w-8 h-8 rounded-full bg-slate-800/80 hover:bg-slate-700 flex items-center justify-center text-slate-400 hover:text-white transition-colors"
        >
          <X className="w-4 h-4" />
        </button>

        <div>
          {/* Header */}
          <div className="text-center mb-6">
            <span className="text-[11px] font-black uppercase tracking-widest text-amber-400">
              Sprint Recap · {result.goalTitle}
            </span>
            <h2 className="text-3xl font-black text-white mt-1 tracking-tight">
              WEEK COMPLETE
            </h2>
            <p className="text-xs text-slate-400 mt-1">
              Every day counted. Here is how your squad showed up.
            </p>
          </div>

          {/* WEEKLY CHAMPION SPOTLIGHT */}
          {champion && (
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="mb-6 p-4 rounded-2xl bg-gradient-to-b from-amber-500/15 via-slate-900/90 to-slate-900/90 border border-amber-500/40 text-center relative overflow-hidden"
            >
              <div className="flex items-center justify-center gap-1 text-[11px] font-bold text-amber-300 uppercase tracking-wider mb-2">
                <Crown className="w-3.5 h-3.5 text-amber-400" />
                <span>Weekly Champion</span>
              </div>

              {/* Avatar & Crown */}
              <div className="relative w-16 h-16 mx-auto mb-2">
                <img
                  src={champion.avatarUrl}
                  alt={champion.displayName}
                  className="w-full h-full rounded-full object-cover ring-2 ring-amber-400 shadow-xl"
                />
                <div className="absolute -top-2 -right-1 w-6 h-6 rounded-full bg-amber-400 text-slate-950 flex items-center justify-center shadow">
                  <Trophy className="w-3.5 h-3.5" />
                </div>
              </div>

              <h3 className="text-base font-extrabold text-white">
                {champion.displayName}
              </h3>
              <p className="text-xs text-slate-400">@{champion.username}</p>

              {/* Champion Big Contribution */}
              <div className="mt-2.5 inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-950/60 border border-amber-500/30">
                <span className="text-xs text-slate-300">Sprint Contribution:</span>
                <span className="text-sm font-black text-amber-300 tabular-nums">
                  {champion.contributionPercent}%
                </span>
              </div>

              {/* Champion Rewards */}
              <div className="flex items-center justify-center gap-3 mt-3 pt-3 border-t border-white/10">
                <div className="flex items-center gap-1 text-xs font-bold text-amber-300">
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>+500 XP</span>
                </div>
                <div className="flex items-center gap-1.5 text-xs font-bold text-white">
                  <PearlIcon size="xs" animate />
                  <span>+150 Pearls</span>
                </div>
                <div className="flex items-center gap-1 text-[11px] font-semibold text-emerald-400">
                  <Award className="w-3.5 h-3.5" />
                  <span>Champion Badge</span>
                </div>
              </div>
            </motion.div>
          )}

          {/* YOUR GROUP CONTRIBUTION BREAKDOWN */}
          <div>
            <div className="flex items-center justify-between mb-2 px-1">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                Squad Contribution
              </span>
              <span className="text-[11px] text-slate-400">Formula Weighted</span>
            </div>

            <div className="space-y-2">
              {result.members.map((member, index) => {
                const isTop = index === 0;
                return (
                  <motion.div
                    key={member.userId}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.1 * index }}
                    className={`p-3 rounded-xl border flex items-center justify-between transition-all ${
                      isTop
                        ? 'bg-amber-950/20 border-amber-500/30'
                        : 'bg-slate-900/70 border-white/5'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <span className="w-4 text-xs font-bold text-slate-400 tabular-nums">
                        #{member.rank}
                      </span>
                      <img
                        src={member.avatarUrl}
                        alt={member.displayName}
                        className="w-7 h-7 rounded-full object-cover"
                      />
                      <div>
                        <div className="flex items-center gap-1.5">
                          <p className="text-xs font-bold text-white">{member.displayName}</p>
                          {isTop && <Crown className="w-3 h-3 text-amber-400" />}
                        </div>
                        <p className="text-[10px] text-slate-400">
                          {member.contributionPercent >= 70
                            ? 'Outstanding pace'
                            : 'Keep building momentum'}
                        </p>
                      </div>
                    </div>

                    <div className="text-right">
                      <span className="text-sm font-black text-amber-300 tabular-nums">
                        {member.contributionPercent}%
                      </span>
                      <div className="flex items-center gap-2 text-[10px] text-slate-400 justify-end mt-0.5">
                        <span>+{member.xpEarned} XP</span>
                        <span className="flex items-center gap-0.5 text-white">
                          <PearlIcon size={10} />
                          +{member.pearlsEarned}
                        </span>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </div>

          {/* Transparent Formula Note */}
          <div className="mt-4 p-3 rounded-xl bg-slate-900/40 border border-white/5 text-[11px] text-slate-400 space-y-1">
            <span className="font-semibold text-slate-300 block">
              Transparent Calculation Formula:
            </span>
            <p className="text-[10px] leading-relaxed">
              Contribution = (Daily Checkins × 40%) + (Logged Effort × 30%) + (Consistency × 20%) + (Goal Progress × 10%).
            </p>
          </div>
        </div>

        {/* Claim & Continue Button */}
        <button
          onClick={() => {
            sound.pearlChime(1.4);
            if (onClaimChampion) onClaimChampion();
            onClose();
          }}
          type="button"
          className="w-full h-12 mt-5 rounded-2xl bg-gradient-to-r from-amber-400 to-orange-400 hover:from-amber-300 hover:to-orange-300 text-slate-950 font-black text-xs flex items-center justify-center gap-2 shadow-lg shadow-amber-500/25 active:scale-95 transition-transform"
        >
          <span>CONTINUE INTO NEW WEEK</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </motion.div>
    </div>
  );
};
