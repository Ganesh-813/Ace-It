import React from 'react';
import { motion } from 'motion/react';
import { Flame, Users, CheckCircle2, ArrowRight, Sparkles, Plus, Clock, Target } from 'lucide-react';
import { User, Goal } from '../types';
import { StreakVisual3D } from '../components/StreakVisual3D';
import { PearlIcon } from '../components/PearlIcon';
import { sound } from '../services/sound';
import { storage } from '../services/storage';

interface HomeViewProps {
  user: User;
  goals: Goal[];
  onOpenCheckIn: (goal: Goal) => void;
  onOpenGoalDetail: (goal: Goal) => void;
  onCreateGoal: () => void;
  onOpenLeaderboard: () => void;
}

export const HomeView: React.FC<HomeViewProps> = ({
  user,
  goals,
  onOpenCheckIn,
  onOpenGoalDetail,
  onCreateGoal,
  onOpenLeaderboard,
}) => {
  // Time-sensitive greeting
  const hour = new Date().getHours();
  const timeGreeting = hour < 12 ? 'Good morning' : hour < 18 ? 'Good afternoon' : 'Good evening';

  // Today's daily XP calculation from actual checkins
  const todayXp = storage.getTodayXp(user.id);
  const todayXpTarget = 100;
  const xpPercent = Math.min(100, Math.round((todayXp / todayXpTarget) * 100));

  const activeGoals = goals.filter((g) => !g.isArchived);

  return (
    <div className="pb-24 px-4 pt-2 space-y-5 select-none max-w-md mx-auto font-sans">
      {/* 1. Header Greeting & Status */}
      <div className="flex items-center justify-between">
        <div>
          <span className="text-[11px] font-bold tracking-wider uppercase text-slate-400">
            {timeGreeting}
          </span>
          <h1 className="text-2xl font-black tracking-tight text-white">
            @{user.username}
          </h1>
        </div>

        <button
          type="button"
          onClick={() => {
            sound.tap();
            onCreateGoal();
          }}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/10 hover:bg-white/15 border border-white/10 text-xs font-bold text-white transition-all active:scale-95 shadow-sm"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>New Goal</span>
        </button>
      </div>

      {/* 2. Central 3D Streak Object */}
      <div className="p-4 rounded-3xl bg-gradient-to-b from-[#0E1320] to-[#0A0D16] border border-white/10 shadow-xl relative overflow-hidden">
        <div className="flex items-center justify-between text-xs px-2 mb-1">
          <span className="font-bold text-slate-300">Daily Momentum</span>
          <span className="text-[11px] font-semibold text-amber-400">Level {user.level} Striker</span>
        </div>

        <StreakVisual3D
          streak={user.streak}
          longestStreak={user.longestStreak}
          hasCheckedInToday={goals.some((g) =>
            g.members.some((m) => m.userId === user.id && m.hasCheckedInToday)
          )}
          streakShields={user.streakShields}
          onTap={() => {
            sound.streakFanfare();
          }}
        />
      </div>

      {/* 3. Today's XP Progress Bar */}
      <div className="p-3.5 rounded-2xl bg-slate-900/80 border border-white/5 space-y-2">
        <div className="flex items-center justify-between text-xs">
          <div className="flex items-center gap-1.5 font-bold text-slate-200">
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            <span>Today's XP Target</span>
          </div>
          <span className="font-black text-amber-300 tabular-nums">
            +{todayXp} / {todayXpTarget} XP
          </span>
        </div>

        <div className="w-full h-2.5 rounded-full bg-slate-800 overflow-hidden">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${xpPercent}%` }}
            transition={{ duration: 0.8, ease: 'easeOut' }}
            className="h-full bg-gradient-to-r from-amber-400 to-orange-500 rounded-full"
          />
        </div>
      </div>

      {/* 4. Active Shared Goals */}
      <div>
        <div className="flex items-center justify-between mb-3 px-1">
          <h2 className="text-sm font-black uppercase tracking-wider text-slate-300">
            Your Active Goals ({activeGoals.length})
          </h2>
          <span className="text-xs text-slate-400">Shared Streaks</span>
        </div>

        {activeGoals.length === 0 ? (
          <div className="p-6 rounded-3xl bg-slate-900/50 border border-dashed border-white/10 text-center space-y-3">
            <Target className="w-8 h-8 text-amber-400 mx-auto" />
            <p className="text-sm font-bold text-white">Ready to build your first streak?</p>
            <p className="text-xs text-slate-400 max-w-xs mx-auto">
              Create a shared goal, invite your friends, and keep each other accountable.
            </p>
            <button
              onClick={onCreateGoal}
              className="px-4 py-2 rounded-xl bg-white text-slate-950 font-bold text-xs inline-flex items-center gap-1.5 shadow-lg active:scale-95 transition-transform"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Create Goal</span>
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            {activeGoals.map((goal) => {
              const currentMember = goal.members.find((m) => m.userId === user.id);
              const checkedInToday = currentMember?.hasCheckedInToday;
              const groupProgress = Math.round(
                goal.members.reduce((acc, m) => acc + (m.weeklyContributionPercent || 0), 0) /
                  goal.members.length
              );

              return (
                <div
                  key={goal.id}
                  className="p-4 rounded-2xl bg-slate-900/90 hover:bg-slate-900 border border-white/10 shadow-lg space-y-3 transition-all relative overflow-hidden group cursor-pointer"
                  onClick={() => onOpenGoalDetail(goal)}
                >
                  {/* Top row: Title + Streak badge */}
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-bold text-amber-400 uppercase tracking-wide">
                          {goal.category}
                        </span>
                        <span className="text-slate-600 text-xs">·</span>
                        <span className="text-[10px] text-slate-400 flex items-center gap-1">
                          <Users className="w-3 h-3" />
                          {goal.members.length} friends
                        </span>
                      </div>
                      <h3 className="text-base font-extrabold text-white truncate mt-0.5">
                        {goal.title}
                      </h3>
                    </div>

                    <div className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-amber-950/50 border border-amber-500/30 shrink-0">
                      <Flame className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
                      <span className="text-xs font-black text-amber-300 tabular-nums">
                        {goal.streak}d
                      </span>
                    </div>
                  </div>

                  {/* Group progress bar */}
                  <div>
                    <div className="flex items-center justify-between text-[11px] mb-1">
                      <span className="text-slate-400">Group sprint progress</span>
                      <span className="font-bold text-slate-200 tabular-nums">
                        {groupProgress}%
                      </span>
                    </div>
                    <div className="w-full h-2 rounded-full bg-slate-800 overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-amber-400 to-orange-500 rounded-full transition-all duration-500"
                        style={{ width: `${groupProgress}%` }}
                      />
                    </div>
                  </div>

                  {/* Bottom row: Members avatars + Check-in Action */}
                  <div
                    className="flex items-center justify-between pt-1"
                    onClick={(e) => e.stopPropagation()}
                  >
                    {/* Avatars stacked */}
                    <div className="flex items-center -space-x-2 overflow-hidden">
                      {goal.members.slice(0, 4).map((m, i) => (
                        <div
                          key={m.userId}
                          className="w-6 h-6 rounded-full border border-slate-900 bg-slate-800 flex items-center justify-center text-[10px] font-bold text-white shadow-sm overflow-hidden"
                          title={m.userId}
                        >
                          {m.userId.replace('user_', '').charAt(0).toUpperCase()}
                        </div>
                      ))}
                      {goal.members.length > 4 && (
                        <div className="w-6 h-6 rounded-full border border-slate-900 bg-slate-700 flex items-center justify-center text-[9px] font-bold text-slate-300">
                          +{goal.members.length - 4}
                        </div>
                      )}
                    </div>

                    {/* Check-in button */}
                    {checkedInToday ? (
                      <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-400 bg-emerald-950/40 border border-emerald-500/25 px-3 py-1.5 rounded-xl">
                        <CheckCircle2 className="w-3.5 h-3.5 stroke-[2.5px]" />
                        <span>Checked in</span>
                      </div>
                    ) : (
                      <button
                        type="button"
                        onClick={() => {
                          sound.tap();
                          onOpenCheckIn(goal);
                        }}
                        className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-white hover:bg-slate-100 text-slate-950 font-black text-xs shadow-md shadow-white/10 active:scale-95 transition-all"
                      >
                        <Flame className="w-3.5 h-3.5 text-orange-500 fill-orange-500" />
                        <span>Log Progress</span>
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* 5. Recent Accountability Buzz snippet */}
      <div className="p-4 rounded-2xl bg-gradient-to-br from-slate-900 to-[#0A0E18] border border-white/5 space-y-2">
        <div className="flex items-center justify-between text-xs">
          <span className="font-bold text-slate-300 flex items-center gap-1.5">
            <Users className="w-3.5 h-3.5 text-cyan-400" />
            <span>Squad Activity</span>
          </span>
          <button
            onClick={onOpenLeaderboard}
            className="text-[11px] font-semibold text-amber-400 hover:text-amber-300 flex items-center gap-1"
          >
            <span>Standings</span>
            <ArrowRight className="w-3 h-3" />
          </button>
        </div>
        <p className="text-xs text-slate-300 leading-snug">
          Rahul logged 3 exercises in <span className="text-white font-semibold">Mathematics Revision</span> · <span className="text-amber-300 font-bold">+40 XP</span>
        </p>
      </div>
    </div>
  );
};
