import React from 'react';
import { motion } from 'motion/react';
import { Flame, Sparkles, Trophy, Users, X, Check, Target } from 'lucide-react';
import { User, Goal } from '../types';
import { storage, ACHIEVEMENTS_CATALOG } from '../services/storage';
import { PearlIcon } from './PearlIcon';
import { sound } from '../services/sound';

interface FriendProfileModalProps {
  friend: User | null;
  isOpen: boolean;
  onClose: () => void;
  onInviteToGoal?: (goalId: string, friendId: string) => void;
  onNudge?: () => void;
}

export const FriendProfileModal: React.FC<FriendProfileModalProps> = ({
  friend,
  isOpen,
  onClose,
  onInviteToGoal,
  onNudge,
}) => {
  if (!isOpen || !friend) return null;

  const allGoals = storage.getGoals();
  const currentUserId = storage.getCurrentUser()?.id;
  const sharedGoals = allGoals.filter((g) =>
    g.members.some((m) => m.userId === friend.id) &&
    g.members.some((m) => m.userId === currentUserId)
  );

  const friendBadges = storage.getUserAchievements(friend.id).filter((a) => a.userAch?.unlocked);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md select-none">
      <motion.div
        initial={{ opacity: 0, scale: 0.94 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.94 }}
        className="w-full max-w-sm max-h-[90vh] overflow-y-auto rounded-3xl bg-[#0D111A] border border-white/10 shadow-2xl p-6 text-white relative space-y-4"
      >
        <button
          onClick={onClose}
          type="button"
          className="absolute top-5 right-5 w-8 h-8 rounded-full bg-slate-800/80 hover:bg-slate-700 flex items-center justify-center text-slate-400 hover:text-white transition-colors"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Profile Card */}
        <div className="text-center pt-2">
          <div className="relative w-20 h-20 mx-auto mb-3">
            <img
              src={friend.avatarUrl}
              alt={friend.displayName}
              className="w-full h-full rounded-full object-cover ring-4 ring-amber-400/30"
            />
            {friend.isOnline && (
              <span className="absolute bottom-1 right-1 w-4 h-4 rounded-full bg-emerald-500 border-2 border-slate-900" />
            )}
          </div>

          <h2
            className="text-xl font-black text-white tracking-tight"
            style={{ fontFamily: 'var(--font-display, sans-serif)' }}
          >
            {friend.displayName}
          </h2>
          <p className="text-xs text-amber-400 font-semibold">@{friend.username}</p>
          {friend.bio && (
            <p className="text-xs text-slate-300 mt-2 max-w-xs mx-auto leading-relaxed">
              "{friend.bio}"
            </p>
          )}
        </div>

        {/* Primary Stats Grid */}
        <div className="grid grid-cols-3 gap-2 p-3 rounded-2xl bg-slate-900 border border-white/5 text-center">
          <div>
            <div className="flex items-center justify-center gap-1 text-orange-400 mb-0.5">
              <Flame className="w-3.5 h-3.5 fill-orange-400" />
              <span className="text-sm font-black tabular-nums">{friend.streak}</span>
            </div>
            <span className="text-[10px] text-slate-400 uppercase font-semibold">Day Streak</span>
          </div>

          <div>
            <div className="flex items-center justify-center gap-1 text-amber-300 mb-0.5">
              <Sparkles className="w-3.5 h-3.5" />
              <span className="text-sm font-black tabular-nums">{friend.totalXp.toLocaleString()}</span>
            </div>
            <span className="text-[10px] text-slate-400 uppercase font-semibold">Total XP</span>
          </div>

          <div>
            <div className="flex items-center justify-center gap-1 text-white mb-0.5">
              <PearlIcon size="xs" />
              <span className="text-sm font-black tabular-nums">{friend.pearlBalance.toLocaleString()}</span>
            </div>
            <span className="text-[10px] text-slate-400 uppercase font-semibold">Pearls</span>
          </div>
        </div>

        {/* Shared Goals Section */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
              Mutual Shared Goals ({sharedGoals.length})
            </span>
          </div>

          {sharedGoals.length === 0 ? (
            <div className="p-3 rounded-xl bg-slate-900/60 border border-white/5 text-center">
              <p className="text-xs text-slate-400">No mutual goals active yet.</p>
            </div>
          ) : (
            <div className="space-y-2">
              {sharedGoals.map((g) => {
                const member = g.members.find((m) => m.userId === friend.id);
                return (
                  <div
                    key={g.id}
                    className="p-2.5 rounded-xl bg-slate-900 border border-white/5 flex items-center justify-between"
                  >
                    <div>
                      <p className="text-xs font-bold text-white">{g.title}</p>
                      <p className="text-[10px] text-slate-400">🔥 {g.streak}d streak · {g.members.length} members</p>
                    </div>
                    <div className="text-right">
                      <span className="text-xs font-black text-amber-400 tabular-nums">
                        {member?.weeklyContributionPercent || 70}%
                      </span>
                      <span className="text-[9px] text-slate-400 block">Weekly Contrib</span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Badges Earned */}
        <div>
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-2">
            Unlocked Badges ({friendBadges.length})
          </span>

          <div className="flex flex-wrap gap-2">
            {friendBadges.slice(0, 6).map((b) => (
              <div
                key={b.achievement.id}
                title={b.achievement.description}
                className="flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-slate-900 border border-white/10 text-[11px]"
              >
                <Trophy className="w-3 h-3 text-amber-400" />
                <span className="font-semibold text-slate-200">{b.achievement.title}</span>
              </div>
            ))}
          </div>
        </div>
      </motion.div>
    </div>
  );
};
