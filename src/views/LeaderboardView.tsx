import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Trophy, Crown, Medal, Sparkles, Flame, Info, HelpCircle } from 'lucide-react';
import { User } from '../types';
import { storage } from '../services/storage';
import { PearlIcon } from '../components/PearlIcon';
import { sound } from '../services/sound';

interface LeaderboardViewProps {
  currentUser: User;
  onOpenFriendProfile: (user: User) => void;
  onTriggerWeeklyCeremony: () => void;
}

export const LeaderboardView: React.FC<LeaderboardViewProps> = ({
  currentUser,
  onOpenFriendProfile,
  onTriggerWeeklyCeremony,
}) => {
  const [filter, setFilter] = useState<'weekly' | 'alltime'>('weekly');
  const [showFormulaInfo, setShowFormulaInfo] = useState(false);

  const allUsers = storage.getAllUsers();

  // Weekly scoring ranking from real statistics
  const weeklyRanked = [...allUsers]
    .map((u) => {
      const stats = storage.getUserStatistics(u.id);
      return {
        ...u,
        weeklyScore: stats.avgWeeklyContribution || 0,
      };
    })
    .sort((a, b) => b.weeklyScore - a.weeklyScore);

  // All-time XP ranking
  const allTimeRanked = [...allUsers].sort((a, b) => b.totalXp - a.totalXp);

  const displayList = filter === 'weekly' ? weeklyRanked : allTimeRanked;
  const topOne = displayList[0];
  const topTwo = displayList[1];
  const topThreeUser = displayList[2];

  return (
    <div className="pb-24 px-4 pt-2 space-y-4 select-none max-w-md mx-auto font-sans">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <span className="text-[11px] font-bold tracking-wider uppercase text-slate-400">
            Fair Play Arena
          </span>
          <h1 className="text-2xl font-black tracking-tight text-white">
            Weekly Podium
          </h1>
        </div>

        {/* Info button for formula */}
        <button
          type="button"
          onClick={() => {
            sound.tap();
            setShowFormulaInfo(!showFormulaInfo);
          }}
          className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-slate-900 border border-white/10 text-xs font-semibold text-slate-300 hover:text-white"
        >
          <Info className="w-3.5 h-3.5 text-amber-400" />
          <span>Formula</span>
        </button>
      </div>

      {/* Filter toggle */}
      <div className="flex items-center p-1 bg-slate-900 rounded-2xl border border-white/5 text-xs font-bold">
        <button
          type="button"
          onClick={() => {
            sound.tap();
            setFilter('weekly');
          }}
          className={`flex-1 py-2 rounded-xl transition-all ${
            filter === 'weekly' ? 'bg-white text-slate-950 shadow' : 'text-slate-400'
          }`}
        >
          Weekly Contribution %
        </button>
        <button
          type="button"
          onClick={() => {
            sound.tap();
            setFilter('alltime');
          }}
          className={`flex-1 py-2 rounded-xl transition-all ${
            filter === 'alltime' ? 'bg-white text-slate-950 shadow' : 'text-slate-400'
          }`}
        >
          All-Time XP
        </button>
      </div>

      {/* Transparent formula explain box */}
      {showFormulaInfo && (
        <div className="p-4 rounded-2xl bg-slate-900/90 border border-amber-500/30 text-xs text-slate-300 space-y-2">
          <div className="flex items-center gap-1.5 font-bold text-amber-300">
            <Sparkles className="w-4 h-4" />
            <span>Duolingo-Inspired Fair Contribution Algorithm</span>
          </div>
          <p className="text-[11px] leading-relaxed text-slate-300">
            Unlike simple raw hours which favor people with infinite free time, Ace It scores your weekly consistency:
          </p>
          <ul className="text-[11px] space-y-1 text-slate-400 list-disc pl-4">
            <li><strong className="text-white">40% Daily Completion:</strong> Showing up every single day</li>
            <li><strong className="text-white">30% Effort Logged:</strong> Meeting your personal commitment targets</li>
            <li><strong className="text-white">20% Streak Consistency:</strong> Holding your chain without breaks</li>
            <li><strong className="text-white">10% Goal Progress:</strong> Concrete task milestones accomplished</li>
          </ul>
          <p className="text-[10px] text-amber-400 font-semibold pt-1">
            Weekly #1 Champion receives: +150 Pearls & +500 XP!
          </p>
        </div>
      )}

      {/* 3D PODIUM DISPLAY (Top 3) */}
      <div className="pt-4 pb-2">
        <div className="flex items-end justify-center gap-2 sm:gap-3">
          {/* 2nd Place (Left) */}
          {topTwo ? (
            <div
              onClick={() => onOpenFriendProfile(topTwo)}
              className="flex-1 flex flex-col items-center cursor-pointer group"
            >
              <div className="relative mb-2">
                <img
                  src={topTwo.avatarUrl}
                  alt={topTwo.displayName}
                  className="w-12 h-12 rounded-full object-cover ring-2 ring-slate-400 shadow-lg group-hover:scale-105 transition-transform"
                />
                <span className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-slate-700 border border-slate-900 text-white text-[10px] font-black flex items-center justify-center">
                  2
                </span>
              </div>
              <p className="text-xs font-bold text-white text-center truncate max-w-[80px]">
                {topTwo.displayName}
              </p>
              <span className="text-[11px] font-black text-slate-300 tabular-nums">
                {filter === 'weekly' ? `${(topTwo as any).weeklyScore}%` : `${topTwo.totalXp} XP`}
              </span>

              {/* Podium block */}
              <div className="w-full h-20 mt-2 rounded-t-2xl bg-gradient-to-b from-slate-700/60 to-slate-900/90 border-t-2 border-slate-400 flex items-center justify-center">
                <Medal className="w-6 h-6 text-slate-300" />
              </div>
            </div>
          ) : (
            <div className="flex-1 flex flex-col items-center opacity-40">
              <div className="w-12 h-12 rounded-full border border-dashed border-white/20 flex items-center justify-center text-[10px] text-slate-500 mb-2">
                2nd
              </div>
              <p className="text-[11px] text-slate-500">Invite Friend</p>
              <div className="w-full h-20 mt-2 rounded-t-2xl bg-slate-900/40 border-t border-white/10" />
            </div>
          )}

          {/* 1st Place (Center - Champion) */}
          {topOne ? (
            <div
              onClick={() => onOpenFriendProfile(topOne)}
              className="flex-1 flex flex-col items-center -translate-y-2 cursor-pointer group"
            >
              <div className="relative mb-2">
                <Crown className="w-6 h-6 text-amber-400 absolute -top-5 left-1/2 -translate-x-1/2 animate-bounce" style={{ animationDuration: '2.5s' }} />
                <img
                  src={topOne.avatarUrl}
                  alt={topOne.displayName}
                  className="w-15 h-15 rounded-full object-cover ring-3 ring-amber-400 shadow-2xl group-hover:scale-105 transition-transform"
                />
                <span className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-amber-400 text-slate-950 text-xs font-black flex items-center justify-center shadow">
                  1
                </span>
              </div>
              <p className="text-xs font-black text-white text-center truncate max-w-[90px]">
                {topOne.displayName}
              </p>
              <span className="text-xs font-black text-amber-300 tabular-nums">
                {filter === 'weekly' ? `${(topOne as any).weeklyScore}%` : `${topOne.totalXp} XP`}
              </span>

              {/* Podium block */}
              <div className="w-full h-28 mt-2 rounded-t-2xl bg-gradient-to-b from-amber-500/30 to-amber-950/80 border-t-2 border-amber-400 flex flex-col items-center justify-center shadow-lg shadow-amber-500/10">
                <Trophy className="w-7 h-7 text-amber-400" />
                <span className="text-[9px] font-extrabold uppercase tracking-wider text-amber-300 mt-1">
                  Champion
                </span>
              </div>
            </div>
          ) : (
            <div className="flex-1 flex flex-col items-center -translate-y-2 opacity-50">
              <div className="w-15 h-15 rounded-full border border-dashed border-amber-400/40 flex items-center justify-center text-xs text-amber-400 mb-2">
                1st
              </div>
              <div className="w-full h-28 mt-2 rounded-t-2xl bg-amber-950/20 border-t border-amber-400/40" />
            </div>
          )}

          {/* 3rd Place (Right) */}
          {topThreeUser ? (
            <div
              onClick={() => onOpenFriendProfile(topThreeUser)}
              className="flex-1 flex flex-col items-center cursor-pointer group"
            >
              <div className="relative mb-2">
                <img
                  src={topThreeUser.avatarUrl}
                  alt={topThreeUser.displayName}
                  className="w-12 h-12 rounded-full object-cover ring-2 ring-amber-700 shadow-lg group-hover:scale-105 transition-transform"
                />
                <span className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-amber-900 border border-slate-900 text-amber-200 text-[10px] font-black flex items-center justify-center">
                  3
                </span>
              </div>
              <p className="text-xs font-bold text-white text-center truncate max-w-[80px]">
                {topThreeUser.displayName}
              </p>
              <span className="text-[11px] font-black text-amber-400 tabular-nums">
                {filter === 'weekly' ? `${(topThreeUser as any).weeklyScore}%` : `${topThreeUser.totalXp} XP`}
              </span>

              {/* Podium block */}
              <div className="w-full h-16 mt-2 rounded-t-2xl bg-gradient-to-b from-amber-950/60 to-slate-900/90 border-t-2 border-amber-700 flex items-center justify-center">
                <Medal className="w-5 h-5 text-amber-600" />
              </div>
            </div>
          ) : (
            <div className="flex-1 flex flex-col items-center opacity-40">
              <div className="w-12 h-12 rounded-full border border-dashed border-white/20 flex items-center justify-center text-[10px] text-slate-500 mb-2">
                3rd
              </div>
              <p className="text-[11px] text-slate-500">Invite Friend</p>
              <div className="w-full h-16 mt-2 rounded-t-2xl bg-slate-900/40 border-t border-white/10" />
            </div>
          )}
        </div>
      </div>

      {/* Full Leaderboard List */}
      <div className="space-y-2 pt-2">
        <div className="flex items-center justify-between px-1">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
            Sprint Standings
          </span>
          <button
            onClick={onTriggerWeeklyCeremony}
            className="text-xs font-semibold text-amber-400 hover:text-amber-300"
          >
            Trigger Week Recap
          </button>
        </div>

        {displayList.map((item, idx) => {
          const isMe = item.id === currentUser.id;
          const score = filter === 'weekly' ? `${(item as any).weeklyScore}%` : `${item.totalXp.toLocaleString()} XP`;

          return (
            <div
              key={item.id}
              onClick={() => onOpenFriendProfile(item)}
              className={`p-3 rounded-2xl border flex items-center justify-between transition-all cursor-pointer ${
                isMe
                  ? 'bg-amber-950/20 border-amber-500/40 shadow-md'
                  : 'bg-slate-900/80 border-white/5 hover:border-white/10'
              }`}
            >
              <div className="flex items-center gap-3">
                <span className="w-5 text-xs font-bold text-slate-400 tabular-nums">
                  #{idx + 1}
                </span>
                <img
                  src={item.avatarUrl}
                  alt={item.displayName}
                  className="w-9 h-9 rounded-full object-cover ring-1 ring-white/10"
                />
                <div>
                  <div className="flex items-center gap-1.5">
                    <p className="text-xs font-bold text-white">{item.displayName}</p>
                    {isMe && (
                      <span className="text-[9px] font-bold text-amber-400 bg-amber-950/80 px-1.5 py-0.2 rounded">
                        YOU
                      </span>
                    )}
                  </div>
                  <p className="text-[10px] text-slate-400">
                    @{item.username} · 🔥 {item.streak}d streak
                  </p>
                </div>
              </div>

              <div className="text-right">
                <span className="text-sm font-black text-white tabular-nums">
                  {score}
                </span>
                <span className="text-[10px] text-slate-400 block">
                  {filter === 'weekly' ? 'Weekly Contribution' : 'Earned XP'}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
