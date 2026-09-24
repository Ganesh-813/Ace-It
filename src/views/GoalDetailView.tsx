import React, { useState } from 'react';
import { motion } from 'motion/react';
import { ArrowLeft, Flame, Users, Calendar, Trophy, CheckCircle2, Clock, Sparkles, UserPlus, Award } from 'lucide-react';
import { Goal, User, DailyCheckin } from '../types';
import { storage } from '../services/storage';
import { PearlIcon } from '../components/PearlIcon';
import { sound } from '../services/sound';

interface GoalDetailViewProps {
  goal: Goal;
  user: User;
  onBack: () => void;
  onOpenCheckIn: (goal: Goal) => void;
  onTriggerWeeklyResults: (goalId: string) => void;
  onOpenFriendProfile: (friendUser: User) => void;
}

export const GoalDetailView: React.FC<GoalDetailViewProps> = ({
  goal,
  user,
  onBack,
  onOpenCheckIn,
  onTriggerWeeklyResults,
  onOpenFriendProfile,
}) => {
  const [inviteModalOpen, setInviteModalOpen] = useState(false);
  const [selectedFriendToInvite, setSelectedFriendToInvite] = useState<string>('');

  const checkins = storage.getCheckinsForGoal(goal.id);
  const currentMember = goal.members.find((m) => m.userId === user.id);
  const checkedInToday = currentMember?.hasCheckedInToday;

  const groupProgress = Math.round(
    goal.members.reduce((acc, m) => acc + (m.weeklyContributionPercent || 0), 0) /
      goal.members.length
  );

  // Available friends to invite
  const userFriends = storage.getFriendsForUser();
  const uninvitedFriends = userFriends.filter(
    (f) => !goal.members.some((m) => m.userId === f.id)
  );

  const handleInvite = (friendId: string) => {
    sound.tap();
    storage.inviteFriendToGoal(goal.id, friendId);
    setInviteModalOpen(false);
  };

  return (
    <div className="pb-28 px-4 pt-2 space-y-5 select-none max-w-md mx-auto">
      {/* Top Bar Navigation */}
      <div className="flex items-center justify-between">
        <button
          type="button"
          onClick={() => {
            sound.tap();
            onBack();
          }}
          className="h-9 px-3 rounded-full bg-slate-900 hover:bg-slate-800 border border-white/10 text-xs font-bold text-slate-300 flex items-center gap-1.5 transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Goals</span>
        </button>

        {/* Weekly Calculation Trigger Button */}
        <button
          type="button"
          onClick={() => {
            sound.tap();
            onTriggerWeeklyResults(goal.id);
          }}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-amber-950/60 hover:bg-amber-900/60 border border-amber-500/30 text-xs font-bold text-amber-300 transition-all shadow-sm"
          title="Simulate end-of-week results"
        >
          <Trophy className="w-3.5 h-3.5 text-amber-400" />
          <span>Weekly Results</span>
        </button>
      </div>

      {/* Goal Header */}
      <div className="p-5 rounded-3xl bg-gradient-to-b from-[#0E1320] to-[#0A0D16] border border-white/10 shadow-xl space-y-3">
        <div className="flex items-start justify-between gap-3">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-black text-amber-400 uppercase tracking-wider">
                {goal.category} Challenge
              </span>
              <span className="text-slate-600 text-xs">·</span>
              <span className="text-[11px] text-slate-400 flex items-center gap-1">
                <Calendar className="w-3 h-3" />
                {goal.durationDays} days sprint
              </span>
            </div>
            <h1 className="text-2xl font-black text-white mt-1 tracking-tight">
              {goal.title}
            </h1>
          </div>

          <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-950/60 border border-amber-500/30 shrink-0">
            <Flame className="w-4 h-4 text-amber-400 fill-amber-400" />
            <span className="text-sm font-black text-amber-300 tabular-nums">
              {goal.streak}d
            </span>
          </div>
        </div>

        <p className="text-xs text-slate-300 leading-relaxed">
          {goal.description}
        </p>

        {/* Action Button: Check In */}
        <div className="pt-2">
          {checkedInToday ? (
            <div className="w-full h-11 rounded-xl bg-emerald-950/50 border border-emerald-500/30 flex items-center justify-center gap-2 text-emerald-400 text-xs font-bold">
              <CheckCircle2 className="w-4 h-4" />
              <span>You checked in for today! Streak safe.</span>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => {
                sound.tap();
                onOpenCheckIn(goal);
              }}
              className="w-full h-12 rounded-xl bg-white hover:bg-slate-100 text-slate-950 font-black text-xs flex items-center justify-center gap-2 shadow-lg shadow-white/10 active:scale-[0.98] transition-transform"
            >
              <Flame className="w-4 h-4 text-orange-500 fill-orange-500" />
              <span>LOG TODAY'S PROGRESS</span>
            </button>
          )}
        </div>
      </div>

      {/* 3D Circular GROUP PROGRESS VISUALIZATION */}
      <div className="p-6 rounded-3xl bg-slate-900/90 border border-white/10 shadow-lg text-center relative overflow-hidden">
        <div className="relative w-44 h-44 mx-auto flex items-center justify-center my-1">
          {/* Circular SVG Ring */}
          <svg className="w-full h-full -rotate-90" viewBox="0 0 160 160">
            <circle
              cx="80"
              cy="80"
              r="68"
              fill="none"
              stroke="currentColor"
              className="text-slate-800"
              strokeWidth="10"
            />
            <circle
              cx="80"
              cy="80"
              r="68"
              fill="none"
              stroke="url(#groupProgressGrad)"
              strokeWidth="10"
              strokeDasharray="427"
              strokeDashoffset={427 - (427 * groupProgress) / 100}
              strokeLinecap="round"
              className="transition-all duration-1000 ease-out"
            />
            <defs>
              <linearGradient id="groupProgressGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#f59e0b" />
                <stop offset="100%" stopColor="#10b981" />
              </linearGradient>
            </defs>
          </svg>

          {/* Center text */}
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span
              className="text-4xl font-black text-white tabular-nums"
              style={{ fontFamily: 'var(--font-display, sans-serif)' }}
            >
              {groupProgress}%
            </span>
            <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 mt-0.5">
              Group Progress
            </span>
          </div>
        </div>

        <p className="text-xs text-slate-400 max-w-xs mx-auto mt-2">
          Weekly Contribution Formula: Daily Completion (40%) + Effort (30%) + Consistency (20%) + Progress (10%).
        </p>
      </div>

      {/* SQUAD MEMBERS CONTRIBUTION LEADERBOARD */}
      <div>
        <div className="flex items-center justify-between mb-3 px-1">
          <span className="text-xs font-black uppercase tracking-wider text-slate-300">
            Squad Members ({goal.members.length})
          </span>

          <button
            type="button"
            onClick={() => setInviteModalOpen(true)}
            className="text-xs font-semibold text-amber-400 hover:text-amber-300 flex items-center gap-1 transition-colors"
          >
            <UserPlus className="w-3.5 h-3.5" />
            <span>Invite Friend</span>
          </button>
        </div>

        <div className="space-y-2">
          {goal.members
            .sort((a, b) => (b.weeklyContributionPercent || 0) - (a.weeklyContributionPercent || 0))
            .map((member, idx) => {
              const u = storage.getUserById(member.userId) || {
                username: member.userId.replace('user_', ''),
                displayName: member.userId.replace('user_', ''),
                avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
                streak: 10,
                totalXp: 1000,
                pearlBalance: 100,
              };

              const isMe = member.userId === user.id;

              return (
                <div
                  key={member.userId}
                  onClick={() => {
                    if (!isMe && 'id' in u) {
                      onOpenFriendProfile(u as User);
                    }
                  }}
                  className={`p-3 rounded-2xl border flex items-center justify-between transition-all cursor-pointer ${
                    isMe
                      ? 'bg-amber-950/20 border-amber-500/30 shadow'
                      : 'bg-slate-900 border-white/5 hover:border-white/10'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <span className="w-4 text-xs font-bold text-slate-500 tabular-nums">
                      #{idx + 1}
                    </span>
                    <img
                      src={u.avatarUrl}
                      alt={u.displayName}
                      className="w-9 h-9 rounded-full object-cover ring-1 ring-white/10"
                    />
                    <div>
                      <div className="flex items-center gap-1.5">
                        <p className="text-xs font-bold text-white">{u.displayName}</p>
                        {isMe && (
                          <span className="text-[9px] font-bold text-amber-400 bg-amber-950/60 px-1.5 py-0.2 rounded">
                            YOU
                          </span>
                        )}
                      </div>
                      <p className="text-[10px] text-slate-400">
                        @{u.username} · {member.dailyCheckinsThisWeek}/7 check-ins this week
                      </p>
                    </div>
                  </div>

                  <div className="text-right">
                    <span className="text-sm font-black text-amber-300 tabular-nums">
                      {member.weeklyContributionPercent}%
                    </span>
                    <span className="text-[10px] text-slate-400 block">Contribution</span>
                  </div>
                </div>
              );
            })}
        </div>
      </div>

      {/* RECENT CHECK-INS ACTIVITY TIMELINE */}
      <div>
        <div className="flex items-center justify-between mb-3 px-1">
          <span className="text-xs font-black uppercase tracking-wider text-slate-300">
            Recent Check-in Activity
          </span>
          <span className="text-[11px] text-slate-500">Live feed</span>
        </div>

        {checkins.length === 0 ? (
          <div className="p-6 rounded-2xl bg-slate-900/50 border border-white/5 text-center text-slate-500 text-xs">
            No check-ins logged yet today. Be the first to start the momentum!
          </div>
        ) : (
          <div className="space-y-2.5">
            {checkins.map((chk) => {
              const chkUser = storage.getUserById(chk.userId);
              return (
                <div
                  key={chk.id}
                  className="p-3.5 rounded-2xl bg-slate-900/80 border border-white/5 space-y-2"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <img
                        src={chkUser?.avatarUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150'}
                        alt="avatar"
                        className="w-6 h-6 rounded-full object-cover"
                      />
                      <span className="text-xs font-bold text-white">
                        {chkUser?.displayName || 'Teammate'}
                      </span>
                      <span className="text-[10px] text-slate-500">· {chk.date}</span>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-amber-300 tabular-nums">
                        +{chk.xpEarned} XP
                      </span>
                      <div className="flex items-center gap-0.5">
                        <PearlIcon size={12} />
                        <span className="text-xs font-bold text-white tabular-nums">
                          +{chk.pearlsEarned}
                        </span>
                      </div>
                    </div>
                  </div>

                  <p className="text-xs text-slate-200 leading-relaxed">
                    "{chk.accomplishedText}"
                  </p>

                  <div className="flex items-center gap-3 text-[10px] text-slate-400 pt-0.5 border-t border-white/5">
                    <span>Effort: {chk.contributionPercent}%</span>
                    <span>·</span>
                    <span>Time: {chk.timeSpentMinutes} mins</span>
                    {chk.quantityCompleted && (
                      <>
                        <span>·</span>
                        <span>Quantity: {chk.quantityCompleted} {chk.quantityUnit}</span>
                      </>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Invite Friends Modal */}
      {inviteModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
          <div className="w-full max-w-sm rounded-3xl bg-[#0D111A] border border-white/10 p-5 text-white space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold">Invite Friends to Goal</h3>
              <button
                type="button"
                onClick={() => setInviteModalOpen(false)}
                className="text-slate-400 hover:text-white"
              >
                ✕
              </button>
            </div>

            {uninvitedFriends.length === 0 ? (
              <p className="text-xs text-slate-400 py-4 text-center">
                All of your current friends are already members of this goal!
              </p>
            ) : (
              <div className="space-y-2 max-h-56 overflow-y-auto">
                {uninvitedFriends.map((f) => (
                  <div
                    key={f.id}
                    className="p-2.5 rounded-xl bg-slate-900 border border-white/5 flex items-center justify-between"
                  >
                    <div className="flex items-center gap-2.5">
                      <img src={f.avatarUrl} alt="" className="w-7 h-7 rounded-full object-cover" />
                      <div>
                        <p className="text-xs font-bold text-white">{f.displayName}</p>
                        <p className="text-[10px] text-slate-400">@{f.username}</p>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleInvite(f.id)}
                      className="px-3 py-1 rounded-lg bg-white text-slate-950 font-bold text-xs hover:bg-slate-100"
                    >
                      Add
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
