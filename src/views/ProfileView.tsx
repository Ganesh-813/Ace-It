import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { User, Achievement } from '../types';
import { storage, ACHIEVEMENTS_CATALOG } from '../services/storage';
import { PearlIcon } from '../components/PearlIcon';
import { Flame, Sparkles, Trophy, Award, Settings, ShieldCheck, Moon, Sun, Volume2, VolumeX, RotateCcw, UserPlus, LogOut, CheckCircle, Lock, X } from 'lucide-react';
import { sound } from '../services/sound';

interface ProfileViewProps {
  user: User;
  onOpenLedger: () => void;
  onSwitchAccount: () => void;
  onReplayLaunch: () => void;
  theme: 'dark' | 'light';
  onToggleTheme: () => void;
}

export const ProfileView: React.FC<ProfileViewProps> = ({
  user,
  onOpenLedger,
  onSwitchAccount,
  onReplayLaunch,
  theme,
  onToggleTheme,
}) => {
  const [selectedBadge, setSelectedBadge] = useState<Achievement | null>(null);
  const [soundEnabled, setSoundEnabled] = useState(sound.isEnabled());
  const [activeTab, setActiveTab] = useState<'badges' | 'stats' | 'settings'>('badges');

  const stats = storage.getUserStatistics(user.id);
  const userAchievements = storage.getUserAchievements(user.id);

  const toggleSound = () => {
    const newState = sound.toggle();
    setSoundEnabled(newState);
  };

  const handleUseStreakShield = () => {
    sound.tap();
    try {
      storage.useStreakShield(user.id);
      sound.pearlChime(1.2);
    } catch (e: unknown) {
      if (e instanceof Error) alert(e.message);
    }
  };

  return (
    <div className="pb-28 px-4 pt-2 space-y-4 select-none max-w-md mx-auto">
      {/* Top Profile Card */}
      <div className="p-5 rounded-3xl bg-gradient-to-b from-[#0E1320] to-[#0A0D16] border border-white/10 shadow-xl relative overflow-hidden text-center">
        {/* Glow */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-48 h-20 bg-amber-500/15 blur-2xl pointer-events-none" />

        <div className="relative w-22 h-22 mx-auto mb-3">
          <img
            src={user.avatarUrl}
            alt={user.displayName}
            className="w-full h-full rounded-full object-cover ring-4 ring-amber-400/40 shadow-2xl"
          />
          <div className="absolute -bottom-1 -right-1 px-2 py-0.5 rounded-full bg-slate-900 border border-amber-400 text-[10px] font-black text-amber-300 shadow">
            LVL {user.level}
          </div>
        </div>

        <h1 className="text-2xl font-bold text-white tracking-tight">
          {user.displayName}
        </h1>
        <div className="flex items-center justify-center gap-2 mt-1">
          <span className="text-xs text-amber-400 font-semibold">@{user.username}</span>
          {user.email && (
            <>
              <span className="text-slate-600 text-xs">•</span>
              <span className="text-xs text-slate-400 font-medium">{user.email}</span>
            </>
          )}
        </div>
        {user.bio && (
          <p className="text-xs text-slate-300 mt-2 max-w-xs mx-auto leading-relaxed">
            "{user.bio}"
          </p>
        )}

        {/* 3 Core Big Metrics */}
        <div className="grid grid-cols-3 gap-2 mt-5 p-3 rounded-2xl bg-slate-900/80 border border-white/5 text-center">
          <div className="flex flex-col items-center justify-center">
            <div className="flex items-center gap-1 text-orange-400 mb-0.5">
              <Flame className="w-4 h-4 fill-orange-400" />
              <span className="text-base font-black tabular-nums">{user.streak}</span>
            </div>
            <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">
              Day Streak
            </span>
          </div>

          <div className="flex flex-col items-center justify-center border-x border-white/5">
            <div className="flex items-center gap-1 text-amber-300 mb-0.5">
              <Sparkles className="w-4 h-4" />
              <span className="text-base font-black tabular-nums">
                {user.totalXp.toLocaleString()}
              </span>
            </div>
            <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">
              Total XP
            </span>
          </div>

          <div
            onClick={onOpenLedger}
            className="flex flex-col items-center justify-center cursor-pointer hover:opacity-90 transition-opacity"
          >
            <div className="flex items-center gap-1 text-white mb-0.5">
              <PearlIcon size="sm" animate />
              <span className="text-base font-black tabular-nums">
                {user.pearlBalance.toLocaleString()}
              </span>
            </div>
            <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">
              Pearls
            </span>
          </div>
        </div>
      </div>

      {/* Profile Section Tabs */}
      <div className="flex items-center p-1 bg-slate-900 rounded-2xl border border-white/5 text-xs font-bold">
        <button
          type="button"
          onClick={() => {
            sound.tap();
            setActiveTab('badges');
          }}
          className={`flex-1 py-2 rounded-xl transition-all ${
            activeTab === 'badges' ? 'bg-white text-slate-950 shadow' : 'text-slate-400'
          }`}
        >
          Badges ({userAchievements.filter((a) => a.userAch?.unlocked).length})
        </button>
        <button
          type="button"
          onClick={() => {
            sound.tap();
            setActiveTab('stats');
          }}
          className={`flex-1 py-2 rounded-xl transition-all ${
            activeTab === 'stats' ? 'bg-white text-slate-950 shadow' : 'text-slate-400'
          }`}
        >
          Statistics
        </button>
        <button
          type="button"
          onClick={() => {
            sound.tap();
            setActiveTab('settings');
          }}
          className={`flex-1 py-2 rounded-xl transition-all ${
            activeTab === 'settings' ? 'bg-white text-slate-950 shadow' : 'text-slate-400'
          }`}
        >
          Settings
        </button>
      </div>

      {/* TAB 1: 3D COLLECTIBLE BADGES */}
      {activeTab === 'badges' && (
        <div className="space-y-3">
          <div className="flex items-center justify-between px-1">
            <span className="text-xs font-bold text-slate-300">
              Collectible Badges & Achievements
            </span>
            <span className="text-[11px] text-slate-400">Tap to inspect</span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
            {userAchievements.map(({ achievement: b, userAch }) => {
              const isUnlocked = !!userAch?.unlocked;

              return (
                <div
                  key={b.id}
                  onClick={() => {
                    sound.tap();
                    setSelectedBadge(b);
                  }}
                  className={`p-3.5 rounded-2xl border text-center transition-all cursor-pointer relative overflow-hidden group ${
                    isUnlocked
                      ? 'bg-slate-900 border-white/15 hover:border-amber-400/50 shadow-lg'
                      : 'bg-slate-950/60 border-white/5 opacity-50'
                  }`}
                >
                  {/* Subtle shine sweep on unlocked badges */}
                  {isUnlocked && (
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
                  )}

                  {/* 3D Medal Emblem */}
                  <div className="relative w-14 h-14 mx-auto mb-2 flex items-center justify-center">
                    <div
                      className={`w-12 h-12 rounded-2xl flex items-center justify-center shadow-lg transition-transform group-hover:scale-105 ${
                        isUnlocked
                          ? 'bg-gradient-to-tr from-amber-400 via-amber-300 to-yellow-500 text-slate-950 border border-white/40 shadow-amber-500/20'
                          : 'bg-slate-800 text-slate-500 border border-slate-700'
                      }`}
                    >
                      {isUnlocked ? (
                        <Trophy className="w-6 h-6" />
                      ) : (
                        <Lock className="w-5 h-5 text-slate-500" />
                      )}
                    </div>
                  </div>

                  <h3 className="text-xs font-bold text-white truncate">{b.title}</h3>
                  <p className="text-[10px] text-slate-400 line-clamp-1 mt-0.5">{b.description}</p>

                  <div className="flex items-center justify-center gap-1.5 mt-2 pt-1.5 border-t border-white/5 text-[10px] font-semibold text-amber-300">
                    <span>+{b.xpReward} XP</span>
                    <span className="text-slate-600">·</span>
                    <span className="text-white">+{b.pearlReward} Pearls</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* TAB 2: FULL USER STATISTICS */}
      {activeTab === 'stats' && (
        <div className="space-y-3">
          <span className="text-xs font-bold text-slate-300 px-1 block">
            Career Accountability Record
          </span>

          <div className="grid grid-cols-2 gap-2.5">
            {[
              { label: 'Total Days Checked In', value: `${stats.totalDaysCheckedIn} Days` },
              { label: 'Current Streak', value: `${stats.currentStreak} Days`, highlight: true },
              { label: 'Longest Streak Record', value: `${stats.longestStreak} Days` },
              { label: 'Goals Completed', value: `${stats.goalsCompleted}` },
              { label: 'Goals Created', value: `${stats.goalsCreated}` },
              { label: 'Connected Friends', value: `${stats.totalFriends}` },
              { label: 'Weekly Wins (Champion)', value: `${stats.weeklyChampionWins}` },
              { label: 'Avg Weekly Contribution', value: `${stats.avgWeeklyContribution}%`, highlight: true },
              { label: 'Total XP Accumulated', value: `${stats.totalXpEarned.toLocaleString()} XP` },
              { label: 'Total Pearls Minted', value: `${stats.totalPearlsEarned.toLocaleString()}` },
            ].map((stat) => (
              <div
                key={stat.label}
                className="p-3.5 rounded-2xl bg-slate-900 border border-white/5 space-y-1"
              >
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                  {stat.label}
                </span>
                <span
                  className={`text-base font-black tabular-nums tracking-tight ${
                    stat.highlight ? 'text-amber-300' : 'text-white'
                  }`}
                >
                  {stat.value}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 3: ACCOUNT & SETTINGS */}
      {activeTab === 'settings' && (
        <div className="space-y-3">
          <span className="text-xs font-bold text-slate-300 px-1 block">
            Preferences & Controls
          </span>

          <div className="space-y-2">
            {/* Streak Shield Status */}
            <div className="p-3.5 rounded-2xl bg-slate-900 border border-white/5 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-xl bg-amber-500/10 text-amber-400">
                  <ShieldCheck className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-xs font-bold text-white">Streak Shields Active</p>
                  <p className="text-[10px] text-slate-400">
                    {user.streakShields} shields available to save your streak if you miss a day
                  </p>
                </div>
              </div>
              <span className="text-sm font-black text-amber-300 tabular-nums">
                {user.streakShields}
              </span>
            </div>

            {/* Sound Toggle */}
            <div className="p-3.5 rounded-2xl bg-slate-900 border border-white/5 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-xl bg-slate-800 text-slate-300">
                  {soundEnabled ? <Volume2 className="w-5 h-5" /> : <VolumeX className="w-5 h-5" />}
                </div>
                <div>
                  <p className="text-xs font-bold text-white">Audio & Feedback Chimes</p>
                  <p className="text-[10px] text-slate-400">Organic soundscapes on pearls & streaks</p>
                </div>
              </div>
              <button
                type="button"
                onClick={toggleSound}
                className={`w-11 h-6 rounded-full transition-colors relative ${
                  soundEnabled ? 'bg-amber-400' : 'bg-slate-700'
                }`}
              >
                <div
                  className={`w-4 h-4 rounded-full bg-slate-950 absolute top-1 transition-transform ${
                    soundEnabled ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>

            {/* Theme Toggle */}
            <div className="p-3.5 rounded-2xl bg-slate-900 border border-white/5 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-xl bg-slate-800 text-slate-300">
                  {theme === 'dark' ? <Moon className="w-5 h-5" /> : <Sun className="w-5 h-5" />}
                </div>
                <div>
                  <p className="text-xs font-bold text-white">Theme Mode</p>
                  <p className="text-[10px] text-slate-400">Currently set to {theme} mode</p>
                </div>
              </div>
              <button
                type="button"
                onClick={onToggleTheme}
                className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-bold text-white transition-colors"
              >
                Toggle {theme === 'dark' ? 'Light' : 'Dark'}
              </button>
            </div>

            {/* Replay Cinematic Intro */}
            <button
              type="button"
              onClick={() => {
                sound.tap();
                onReplayLaunch();
              }}
              className="w-full p-3.5 rounded-2xl bg-slate-900 border border-white/5 flex items-center justify-between hover:bg-slate-850 transition-colors text-left"
            >
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-xl bg-slate-800 text-slate-300">
                  <RotateCcw className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-xs font-bold text-white">Replay Launch Screen</p>
                  <p className="text-[10px] text-slate-400">View the 3D cinematic startup animation</p>
                </div>
              </div>
              <span className="text-xs text-slate-400">▶</span>
            </button>

            {/* Switch or Add Account */}
            <button
              type="button"
              onClick={() => {
                sound.tap();
                onSwitchAccount();
              }}
              className="w-full p-3.5 rounded-2xl bg-slate-900 border border-white/5 flex items-center justify-between hover:bg-slate-850 transition-colors text-left"
            >
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-xl bg-slate-800 text-amber-400">
                  <UserPlus className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-xs font-bold text-white">Switch or Add Account</p>
                  <p className="text-[10px] text-slate-400">Add a friend's account or switch active user</p>
                </div>
              </div>
              <span className="text-xs text-slate-400">Switch</span>
            </button>

            {/* Sign Out */}
            <button
              type="button"
              onClick={() => {
                sound.tap();
                storage.signOut();
              }}
              className="w-full p-3.5 rounded-2xl bg-slate-900 border border-white/5 flex items-center justify-between hover:bg-slate-850 transition-colors text-left"
            >
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-xl bg-slate-800 text-slate-300">
                  <LogOut className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-xs font-bold text-white">Sign Out</p>
                  <p className="text-[10px] text-slate-400">Log out of @{user.username}</p>
                </div>
              </div>
              <span className="text-xs text-slate-400">Exit</span>
            </button>

            {/* Reset All App Data */}
            <button
              type="button"
              onClick={() => {
                if (window.confirm('Are you sure you want to reset all data and start completely fresh? This will clear all local storage.')) {
                  sound.tap();
                  storage.resetAllData();
                }
              }}
              className="w-full p-3.5 rounded-2xl bg-red-950/20 border border-red-500/20 flex items-center justify-between hover:bg-red-950/40 transition-colors text-left"
            >
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-xl bg-red-900/40 text-red-400">
                  <RotateCcw className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-xs font-bold text-red-200">Reset All Data</p>
                  <p className="text-[10px] text-red-300/70">Wipe clean and restart from day zero</p>
                </div>
              </div>
              <span className="text-xs text-red-400">Reset</span>
            </button>
          </div>
        </div>
      )}

      {/* Badge Inspection Modal */}
      {selectedBadge && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
          <div className="w-full max-w-xs rounded-3xl bg-[#0D111A] border border-white/10 p-6 text-white text-center space-y-3 relative shadow-2xl">
            <button
              onClick={() => setSelectedBadge(null)}
              className="absolute top-4 right-4 text-slate-400 hover:text-white p-1"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="w-16 h-16 mx-auto rounded-2xl bg-gradient-to-tr from-amber-400 to-yellow-500 text-slate-950 flex items-center justify-center shadow-lg shadow-amber-500/20">
              <Trophy className="w-8 h-8" />
            </div>

            <h3 className="text-lg font-black text-white">{selectedBadge.title}</h3>
            <p className="text-xs text-slate-300">{selectedBadge.description}</p>

            <div className="flex items-center justify-center gap-3 pt-2 text-xs font-bold">
              <span className="text-amber-300">+{selectedBadge.xpReward} XP</span>
              <div className="flex items-center gap-1 text-white">
                <PearlIcon size="xs" />
                <span>+{selectedBadge.pearlReward} Pearls</span>
              </div>
            </div>

            <button
              onClick={() => setSelectedBadge(null)}
              className="w-full h-10 rounded-xl bg-white text-slate-950 font-bold text-xs mt-3"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
