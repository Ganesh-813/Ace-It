import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Target, ArrowRight, ArrowLeft, Check, Users, Calendar, Sparkles, X, UserPlus } from 'lucide-react';
import { Goal, User, FrequencyType } from '../types';
import { storage } from '../services/storage';
import { PearlIcon } from './PearlIcon';
import { sound } from '../services/sound';

interface CreateGoalModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreated: (goal: Goal) => void;
}

const PRESET_GOALS = [
  {
    title: 'Complete 30 Days of Coding',
    description: 'Code for at least 60 minutes every day. Build production apps.',
    category: 'coding' as const,
    duration: 30,
    unit: 'minutes',
  },
  {
    title: 'Mathematics Revision',
    description: 'Solve calculus and algebraic problem sets daily for 45 minutes.',
    category: 'learning' as const,
    duration: 30,
    unit: 'problems',
  },
  {
    title: 'Run 100 km This Month',
    description: 'Crush outdoor distance runs together and build relentless stamina.',
    category: 'fitness' as const,
    duration: 30,
    unit: 'km',
  },
  {
    title: 'Daily Deep Reading',
    description: 'Read 25 pages of non-fiction or literature before sleep.',
    category: 'learning' as const,
    duration: 14,
    unit: 'pages',
  },
];

export const CreateGoalModal: React.FC<CreateGoalModalProps> = ({
  isOpen,
  onClose,
  onCreated,
}) => {
  const [step, setStep] = useState(1);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState<Goal['category']>('learning');
  const [frequency, setFrequency] = useState<FrequencyType>('daily');
  const [durationDays, setDurationDays] = useState(30);
  const [targetUnit, setTargetUnit] = useState('minutes');
  const [selectedFriendIds, setSelectedFriendIds] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const friends = storage.getFriendsForUser();

  const handleNext = () => {
    sound.tap();
    setError(null);
    if (step === 1 && !title.trim()) {
      setError('Please provide a goal name');
      return;
    }
    if (step === 2 && !description.trim()) {
      setError('Please write a short description');
      return;
    }
    setStep(step + 1);
  };

  const handleBack = () => {
    sound.tap();
    setError(null);
    if (step > 1) setStep(step - 1);
  };

  const handleSelectPreset = (preset: typeof PRESET_GOALS[0]) => {
    sound.tap();
    setTitle(preset.title);
    setDescription(preset.description);
    setCategory(preset.category);
    setDurationDays(preset.duration);
    setTargetUnit(preset.unit);
  };

  const toggleFriend = (id: string) => {
    sound.tap();
    if (selectedFriendIds.includes(id)) {
      setSelectedFriendIds(selectedFriendIds.filter((f) => f !== id));
    } else {
      setSelectedFriendIds([...selectedFriendIds, id]);
    }
  };

  const handleFinishCreate = () => {
    sound.tap();
    try {
      const newGoal = storage.createGoal({
        title,
        description,
        category,
        frequency,
        durationDays,
        invitedFriendIds: selectedFriendIds,
        targetUnit,
      });

      sound.streakFanfare();
      onCreated(newGoal);
      onClose();
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('Failed to create goal');
      }
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
      <motion.div
        initial={{ opacity: 0, scale: 0.94 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.94 }}
        className="w-full max-w-md max-h-[90vh] overflow-y-auto rounded-3xl bg-[#0D111A] border border-white/10 shadow-2xl p-6 text-white relative flex flex-col justify-between"
      >
        {/* Top bar */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <span className="text-xs font-bold uppercase tracking-wider text-amber-400">
              Create Shared Goal · Step {step} of 6
            </span>
            <button
              onClick={onClose}
              type="button"
              className="text-slate-400 hover:text-white p-1"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Progress bar */}
          <div className="w-full h-1 bg-slate-800 rounded-full mb-6 overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-amber-400 to-orange-500 transition-all duration-300"
              style={{ width: `${(step / 6) * 100}%` }}
            />
          </div>

          {error && (
            <div className="mb-4 p-2.5 rounded-xl bg-red-950/50 border border-red-500/30 text-xs text-red-300">
              {error}
            </div>
          )}

          {/* STEP 1: Name & Presets */}
          {step === 1 && (
            <div className="space-y-4">
              <div>
                <h3 className="text-xl font-black text-white">
                  What is your goal?
                </h3>
                <p className="text-xs text-slate-400 mt-1">
                  Give it a clear, action-oriented name your friends can rally behind.
                </p>
              </div>

              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Complete 30 Days of Coding"
                className="w-full h-12 px-4 rounded-xl bg-slate-900 border border-white/10 text-sm text-white focus:outline-none focus:border-amber-400"
                autoFocus
              />

              {/* Quick inspiration presets */}
              <div>
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-2">
                  Or pick a popular community challenge:
                </span>
                <div className="grid grid-cols-1 gap-2">
                  {PRESET_GOALS.map((p) => (
                    <button
                      key={p.title}
                      type="button"
                      onClick={() => handleSelectPreset(p)}
                      className={`p-3 rounded-xl border text-left transition-all ${
                        title === p.title
                          ? 'bg-amber-950/40 border-amber-400/50'
                          : 'bg-slate-900/60 border-white/5 hover:bg-slate-900'
                      }`}
                    >
                      <p className="text-xs font-bold text-white">{p.title}</p>
                      <p className="text-[11px] text-slate-400 line-clamp-1 mt-0.5">{p.description}</p>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* STEP 2: Description & Category */}
          {step === 2 && (
            <div className="space-y-4">
              <div>
                <h3 className="text-xl font-black text-white">
                  Describe the daily commitment
                </h3>
                <p className="text-xs text-slate-400 mt-1">
                  What specifically counts as showing up each day?
                </p>
              </div>

              <textarea
                rows={3}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="e.g. Code for at least 60 minutes every day. Push commits or solve exercises."
                className="w-full p-3.5 rounded-xl bg-slate-900 border border-white/10 text-xs text-white focus:outline-none focus:border-amber-400 leading-relaxed"
                autoFocus
              />

              <div>
                <label className="block text-[11px] font-bold text-slate-300 uppercase tracking-wider mb-2">
                  Category
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {(['learning', 'coding', 'fitness', 'productivity', 'mindset', 'creative'] as const).map(
                    (cat) => (
                      <button
                        key={cat}
                        type="button"
                        onClick={() => {
                          sound.tap();
                          setCategory(cat);
                        }}
                        className={`py-2 px-3 rounded-xl text-xs font-semibold capitalize transition-all ${
                          category === cat
                            ? 'bg-white text-slate-950 shadow-md'
                            : 'bg-slate-900 text-slate-400 border border-white/5 hover:text-slate-200'
                        }`}
                      >
                        {cat}
                      </button>
                    )
                  )}
                </div>
              </div>
            </div>
          )}

          {/* STEP 3: Frequency */}
          {step === 3 && (
            <div className="space-y-4">
              <div>
                <h3 className="text-xl font-black text-white">
                  Choose frequency
                </h3>
                <p className="text-xs text-slate-400 mt-1">
                  How often will the group check in?
                </p>
              </div>

              <div className="space-y-2.5">
                {[
                  { id: 'daily', label: 'Every Day (Recommended)', desc: 'Maximizes streak velocity and compound momentum' },
                  { id: 'weekdays', label: 'Weekdays Only (Mon–Fri)', desc: 'Rest on weekends while keeping momentum' },
                  { id: 'custom', label: 'Custom Rhythm', desc: 'Flexible check-ins tailored to your squad' },
                ].map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => {
                      sound.tap();
                      setFrequency(item.id as FrequencyType);
                    }}
                    className={`w-full p-3.5 rounded-xl border text-left transition-all ${
                      frequency === item.id
                        ? 'bg-amber-950/40 border-amber-400/60 shadow-lg'
                        : 'bg-slate-900 border-white/5 hover:bg-slate-850'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <p className="text-xs font-bold text-white">{item.label}</p>
                      {frequency === item.id && <Check className="w-4 h-4 text-amber-400" />}
                    </div>
                    <p className="text-[11px] text-slate-400 mt-0.5">{item.desc}</p>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* STEP 4: Duration */}
          {step === 4 && (
            <div className="space-y-4">
              <div>
                <h3 className="text-xl font-black text-white">
                  Choose duration
                </h3>
                <p className="text-xs text-slate-400 mt-1">
                  Commitment sprints build intense focus.
                </p>
              </div>

              <div className="grid grid-cols-2 gap-2.5">
                {[7, 14, 30, 60, 90].map((d) => (
                  <button
                    key={d}
                    type="button"
                    onClick={() => {
                      sound.tap();
                      setDurationDays(d);
                    }}
                    className={`p-3.5 rounded-xl border text-left transition-all ${
                      durationDays === d
                        ? 'bg-amber-950/40 border-amber-400/60 shadow-md'
                        : 'bg-slate-900 border-white/5 hover:bg-slate-850'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-black text-white tabular-nums">{d} Days</span>
                      {durationDays === d && <Check className="w-4 h-4 text-amber-400" />}
                    </div>
                    <span className="text-[10px] text-slate-400 mt-0.5 block">
                      {d === 7 ? 'Quick Sprint' : d === 30 ? 'Habit Anchor' : `${Math.round(d / 30)} Months`}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* STEP 5: Invite Friends */}
          {step === 5 && (
            <div className="space-y-4">
              <div>
                <h3 className="text-xl font-black text-white">
                  Invite accountability friends
                </h3>
                <p className="text-xs text-slate-400 mt-1">
                  "I need to open the app today because my friends are depending on me."
                </p>
              </div>

              {friends.length === 0 ? (
                <div className="p-4 rounded-xl bg-slate-900/80 border border-white/5 text-center space-y-2">
                  <p className="text-xs text-slate-300">You haven't connected with friends yet.</p>
                  <p className="text-[11px] text-slate-500">You can still launch this goal solo and invite friends anytime!</p>
                </div>
              ) : (
                <div className="space-y-2 max-h-56 overflow-y-auto">
                  {friends.map((friend) => {
                    const isSelected = selectedFriendIds.includes(friend.id);
                    return (
                      <button
                        key={friend.id}
                        type="button"
                        onClick={() => toggleFriend(friend.id)}
                        className={`w-full p-2.5 rounded-xl border flex items-center justify-between transition-all ${
                          isSelected
                            ? 'bg-amber-950/40 border-amber-400/50 shadow'
                            : 'bg-slate-900 border-white/5 hover:bg-slate-850'
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <img
                            src={friend.avatarUrl}
                            alt={friend.displayName}
                            className="w-8 h-8 rounded-full object-cover"
                          />
                          <div className="text-left">
                            <p className="text-xs font-bold text-white">{friend.displayName}</p>
                            <p className="text-[10px] text-slate-400">@{friend.username} · {friend.streak}d streak</p>
                          </div>
                        </div>
                        <div
                          className={`w-5 h-5 rounded-full border flex items-center justify-center ${
                            isSelected ? 'bg-amber-400 border-amber-400 text-slate-950' : 'border-slate-600'
                          }`}
                        >
                          {isSelected && <Check className="w-3.5 h-3.5 stroke-[3px]" />}
                        </div>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* STEP 6: Review */}
          {step === 6 && (
            <div className="space-y-4">
              <div>
                <h3 className="text-xl font-black text-white">
                  Review & Launch
                </h3>
                <p className="text-xs text-slate-400 mt-1">
                  Ready to lock in your next shared streak?
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-slate-900 border border-white/10 space-y-3">
                <div>
                  <span className="text-[10px] font-bold text-amber-400 uppercase tracking-wider">
                    Goal Name
                  </span>
                  <p className="text-sm font-black text-white mt-0.5">{title}</p>
                  <p className="text-xs text-slate-300 mt-0.5">{description}</p>
                </div>

                <div className="grid grid-cols-3 gap-2 pt-2 border-t border-white/5 text-center">
                  <div>
                    <span className="text-[10px] text-slate-400 block">Frequency</span>
                    <span className="text-xs font-bold text-white capitalize">{frequency}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 block">Duration</span>
                    <span className="text-xs font-bold text-white tabular-nums">{durationDays} Days</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 block">Members</span>
                    <span className="text-xs font-bold text-white tabular-nums">
                      {1 + selectedFriendIds.length}
                    </span>
                  </div>
                </div>
              </div>

              {/* Creator Reward Bonus preview */}
              <div className="flex items-center justify-between p-3 rounded-xl bg-gradient-to-r from-amber-500/10 to-orange-500/10 border border-amber-500/20">
                <div className="flex items-center gap-1.5 text-xs text-slate-300">
                  <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                  <span>Goal creation reward:</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-amber-300">+50 XP</span>
                  <div className="flex items-center gap-1">
                    <PearlIcon size="xs" />
                    <span className="text-xs font-bold text-white">+10 Pearls</span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer Navigation Buttons */}
        <div className="flex items-center justify-between gap-3 mt-6 pt-3 border-t border-white/5">
          {step > 1 ? (
            <button
              type="button"
              onClick={handleBack}
              className="h-11 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-bold text-slate-200 flex items-center gap-1.5 transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back</span>
            </button>
          ) : (
            <div />
          )}

          {step < 6 ? (
            <button
              type="button"
              onClick={handleNext}
              className="h-11 px-5 rounded-xl bg-white hover:bg-slate-100 text-slate-950 text-xs font-bold flex items-center gap-1.5 shadow-lg shadow-white/10 active:scale-95 transition-transform"
            >
              <span>Next Step</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          ) : (
            <button
              type="button"
              onClick={handleFinishCreate}
              className="h-11 px-6 rounded-xl bg-gradient-to-r from-amber-400 to-orange-400 hover:from-amber-300 hover:to-orange-300 text-slate-950 text-xs font-black flex items-center gap-2 shadow-lg shadow-orange-500/25 active:scale-95 transition-transform"
            >
              <Target className="w-4 h-4" />
              <span>CREATE GOAL</span>
            </button>
          )}
        </div>
      </motion.div>
    </div>
  );
};
