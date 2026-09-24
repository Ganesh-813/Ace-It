import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Clock, Hash, Sparkles, Check, Flame, Camera, FileText, X } from 'lucide-react';
import { Goal, User } from '../types';
import { storage } from '../services/storage';
import { PearlIcon } from './PearlIcon';
import { sound } from '../services/sound';

interface CheckInModalProps {
  goal: Goal | null;
  isOpen: boolean;
  user?: User | null;
  onClose: () => void;
  onSuccess: (data?: { xpEarned: number; pearlsEarned: number; newStreak: number }) => void;
}

const PERCENT_PRESETS = [25, 50, 75, 85, 100];

export const CheckInModal: React.FC<CheckInModalProps> = ({
  goal,
  isOpen,
  user,
  onClose,
  onSuccess,
}) => {
  const [accomplishedText, setAccomplishedText] = useState('');
  const [contributionPercent, setContributionPercent] = useState(85);
  const [timeSpentMinutes, setTimeSpentMinutes] = useState(45);
  const [quantityCompleted, setQuantityCompleted] = useState<number | ''>('');
  const [reflection, setReflection] = useState('');
  const [hasAttachment, setHasAttachment] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Success state before dismissing
  const [successData, setSuccessData] = useState<{
    xpEarned: number;
    pearlsEarned: number;
    newStreak: number;
  } | null>(null);

  if (!isOpen || !goal) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!accomplishedText.trim()) {
      setError('Please write a brief summary of what you accomplished today.');
      return;
    }

    setError(null);
    setSubmitting(true);
    sound.tap();

    try {
      const result = storage.submitDailyCheckin({
        goalId: goal.id,
        accomplishedText,
        contributionPercent,
        timeSpentMinutes: Number(timeSpentMinutes) || 30,
        quantityCompleted: quantityCompleted === '' ? undefined : Number(quantityCompleted),
        quantityUnit: goal.targetUnit || 'units',
        reflection: reflection || undefined,
        hasAttachment,
      });

      sound.checkinSuccess();
      setSuccessData({
        xpEarned: result.xpEarned,
        pearlsEarned: result.pearlsEarned,
        newStreak: result.newStreak,
      });

      setTimeout(() => {
        setSuccessData(null);
        onSuccess(result);
        onClose();
      }, 2200);
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('Unable to log check-in right now.');
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/80 backdrop-blur-md">
      <motion.div
        initial={{ y: '100%', opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: '100%', opacity: 0 }}
        transition={{ type: 'spring', stiffness: 380, damping: 28 }}
        className="w-full max-w-md max-h-[90vh] overflow-y-auto rounded-t-3xl sm:rounded-3xl bg-[#0D111A] border border-white/10 shadow-2xl p-6 text-white relative"
      >
        {/* Top Close Button */}
        <button
          onClick={onClose}
          type="button"
          className="absolute top-5 right-5 w-8 h-8 rounded-full bg-slate-800/80 hover:bg-slate-700 flex items-center justify-center text-slate-400 hover:text-white transition-colors"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Success Modal Celebration */}
        <AnimatePresence>
          {successData ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              className="py-10 flex flex-col items-center justify-center text-center space-y-4"
            >
              {/* Central Glowing Icon */}
              <div className="w-20 h-20 rounded-full bg-gradient-to-tr from-amber-500/30 to-orange-500/20 border border-amber-400/40 flex items-center justify-center shadow-2xl shadow-amber-500/20">
                <Check className="w-10 h-10 text-amber-300 stroke-[3px]" />
              </div>

              <div>
                <h2
                  className="text-2xl font-black text-white tracking-tight"
                  style={{ fontFamily: 'var(--font-display, sans-serif)' }}
                >
                  Progress logged!
                </h2>
                <p className="text-xs text-slate-300 mt-1">
                  Your teammates in {goal.title} have been notified.
                </p>
              </div>

              {/* Badges Earned */}
              <div className="flex items-center gap-3 pt-2">
                <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-900 border border-white/10">
                  <Sparkles className="w-4 h-4 text-amber-400" />
                  <span className="text-xs font-black text-amber-300 tabular-nums">
                    +{successData.xpEarned} XP
                  </span>
                </div>

                <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-900 border border-white/10">
                  <PearlIcon size="sm" animate />
                  <span className="text-xs font-black text-white tabular-nums">
                    +{successData.pearlsEarned} Pearls
                  </span>
                </div>

                <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-orange-950/40 border border-orange-500/30">
                  <Flame className="w-4 h-4 text-orange-400 fill-orange-400" />
                  <span className="text-xs font-black text-orange-300 tabular-nums">
                    {successData.newStreak}d Streak
                  </span>
                </div>
              </div>

              <p className="text-[11px] text-emerald-400 font-semibold flex items-center gap-1 pt-1">
                🔥 Streak maintained into tomorrow!
              </p>
            </motion.div>
          ) : (
            <>
              {/* Header */}
              <div className="mb-4 pr-8">
                <span className="text-[11px] font-bold uppercase tracking-wider text-amber-400">
                  Daily Progress Report
                </span>
                <h2
                  className="text-xl font-black text-white mt-0.5"
                  style={{ fontFamily: 'var(--font-display, sans-serif)' }}
                >
                  {goal.title}
                </h2>
                <p className="text-xs text-slate-400 mt-0.5">
                  Ready to check in? Maintain your {goal.streak}-day streak.
                </p>
              </div>

              {error && (
                <div className="mb-4 p-3 rounded-xl bg-red-950/50 border border-red-500/30 text-xs text-red-300">
                  {error}
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-4">
                {/* 1. What did you accomplish today? */}
                <div>
                  <label className="block text-xs font-bold text-slate-200 mb-1.5">
                    What did you accomplish today?
                  </label>
                  <textarea
                    rows={3}
                    value={accomplishedText}
                    onChange={(e) => setAccomplishedText(e.target.value)}
                    placeholder="e.g. Studied mathematics for 2 hours and completed quadratic equations exercises."
                    required
                    className="w-full p-3 rounded-xl bg-slate-900 border border-white/10 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-400 transition-colors leading-relaxed"
                  />
                </div>

                {/* 2. How much did you contribute? */}
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="text-xs font-bold text-slate-200">
                      How much did you contribute?
                    </label>
                    <span className="text-sm font-black text-amber-400 tabular-nums">
                      {contributionPercent}%
                    </span>
                  </div>

                  {/* Preset Buttons */}
                  <div className="grid grid-cols-5 gap-1.5 mb-2.5">
                    {PERCENT_PRESETS.map((pct) => (
                      <button
                        key={pct}
                        type="button"
                        onClick={() => {
                          sound.tap();
                          setContributionPercent(pct);
                        }}
                        className={`py-1.5 rounded-lg text-xs font-bold transition-all ${
                          contributionPercent === pct
                            ? 'bg-amber-400 text-slate-950 shadow-md shadow-amber-400/20'
                            : 'bg-slate-900 hover:bg-slate-800 text-slate-300 border border-white/5'
                        }`}
                      >
                        {pct}%
                      </button>
                    ))}
                  </div>

                  {/* Slider */}
                  <input
                    type="range"
                    min={10}
                    max={100}
                    step={5}
                    value={contributionPercent}
                    onChange={(e) => setContributionPercent(Number(e.target.value))}
                    className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-amber-400"
                  />
                </div>

                {/* 3. Time spent & Quantity Completed */}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-300 mb-1">
                      Time Spent (mins)
                    </label>
                    <div className="relative flex items-center">
                      <Clock className="absolute left-3 w-3.5 h-3.5 text-slate-400" />
                      <input
                        type="number"
                        min={5}
                        max={720}
                        value={timeSpentMinutes}
                        onChange={(e) => setTimeSpentMinutes(Number(e.target.value))}
                        className="w-full h-10 pl-8 pr-3 rounded-xl bg-slate-900 border border-white/10 text-xs text-white focus:outline-none focus:border-amber-400"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-slate-300 mb-1">
                      Quantity {goal.targetUnit ? `(${goal.targetUnit})` : ''}
                    </label>
                    <div className="relative flex items-center">
                      <Hash className="absolute left-3 w-3.5 h-3.5 text-slate-400" />
                      <input
                        type="number"
                        placeholder="e.g. 15"
                        value={quantityCompleted}
                        onChange={(e) =>
                          setQuantityCompleted(e.target.value === '' ? '' : Number(e.target.value))
                        }
                        className="w-full h-10 pl-8 pr-3 rounded-xl bg-slate-900 border border-white/10 text-xs text-white focus:outline-none focus:border-amber-400"
                      />
                    </div>
                  </div>
                </div>

                {/* 4. Short Reflection / Journal */}
                <div>
                  <label className="block text-[11px] font-semibold text-slate-300 mb-1">
                    Personal Reflection (Private to group)
                  </label>
                  <input
                    type="text"
                    value={reflection}
                    onChange={(e) => setReflection(e.target.value)}
                    placeholder="e.g. Challenging concepts, but stayed focused!"
                    className="w-full h-10 px-3 rounded-xl bg-slate-900 border border-white/10 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-400"
                  />
                </div>

                {/* 5. Optional photo proof toggle */}
                <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-900/60 border border-white/5">
                  <div className="flex items-center gap-2">
                    <Camera className="w-4 h-4 text-slate-400" />
                    <span className="text-xs text-slate-300 font-medium">Add photo proof</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      sound.tap();
                      setHasAttachment(!hasAttachment);
                    }}
                    className={`w-10 h-5 rounded-full transition-colors relative ${
                      hasAttachment ? 'bg-amber-400' : 'bg-slate-700'
                    }`}
                  >
                    <div
                      className={`w-3.5 h-3.5 rounded-full bg-slate-950 absolute top-0.5 transition-transform ${
                        hasAttachment ? 'translate-x-5' : 'translate-x-1'
                      }`}
                    />
                  </button>
                </div>

                {/* Expected Rewards preview */}
                <div className="flex items-center justify-between p-3 rounded-xl bg-gradient-to-r from-amber-500/10 to-orange-500/10 border border-amber-500/20">
                  <div className="flex items-center gap-1.5 text-xs text-slate-300">
                    <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                    <span>Estimated rewards:</span>
                  </div>
                  <div className="flex items-center gap-2.5">
                    <span className="text-xs font-bold text-amber-300 tabular-nums">
                      +{20 + Math.round((contributionPercent / 100) * 25)} XP
                    </span>
                    <div className="flex items-center gap-1">
                      <PearlIcon size="xs" />
                      <span className="text-xs font-bold text-white tabular-nums">
                        +{contributionPercent >= 80 ? 8 : 5} Pearls
                      </span>
                    </div>
                  </div>
                </div>

                {/* Submit button */}
                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full h-12 rounded-xl bg-white hover:bg-slate-100 text-slate-950 font-bold text-sm flex items-center justify-center gap-2 shadow-lg shadow-white/10 active:scale-[0.98] transition-transform"
                >
                  <Flame className="w-4 h-4 text-orange-500 fill-orange-500" />
                  <span>SUBMIT TODAY'S PROGRESS</span>
                </button>
              </form>
            </>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
};
