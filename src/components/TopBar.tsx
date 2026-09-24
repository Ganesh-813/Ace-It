import React, { useState, useEffect } from 'react';
import { Flame, Bell, Shield, Sparkles } from 'lucide-react';
import { PearlIcon } from './PearlIcon';
import { User, NotificationItem } from '../types';
import { sound } from '../services/sound';

interface TopBarProps {
  user: User;
  notifications: NotificationItem[];
  onOpenNotifications: () => void;
  onOpenProfile: () => void;
  onOpenPearlLedger: () => void;
  theme: 'dark' | 'light';
  onToggleTheme: () => void;
}

export const TopBar: React.FC<TopBarProps> = ({
  user,
  notifications,
  onOpenNotifications,
  onOpenProfile,
  onOpenPearlLedger,
  theme,
  onToggleTheme,
}) => {
  const [prevPearls, setPrevPearls] = useState(user.pearlBalance);
  const [bumpingPearls, setBumpingPearls] = useState(false);

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  useEffect(() => {
    if (user.pearlBalance > prevPearls) {
      setBumpingPearls(true);
      const t = setTimeout(() => {
        setBumpingPearls(false);
        setPrevPearls(user.pearlBalance);
      }, 700);
      return () => clearTimeout(t);
    }
    setPrevPearls(user.pearlBalance);
  }, [user.pearlBalance, prevPearls]);

  return (
    <header className="sticky top-0 z-30 w-full backdrop-blur-md bg-[#07090E]/85 dark:bg-[#07090E]/85 border-b border-white/5 px-4 py-2.5 flex items-center justify-between select-none">
      {/* Brand & Streak Indicator */}
      <div className="flex items-center gap-2.5">
        <span className="text-base font-black tracking-tight text-white">
          Ace It
        </span>

        {/* Global Streak Pill */}
        <div
          title="Active Daily Streak"
          className="flex items-center gap-1 bg-amber-950/40 border border-amber-500/25 px-2 py-0.5 rounded-full"
        >
          <Flame className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
          <span className="text-xs font-black text-amber-300 tabular-nums">
            {user.streak}
          </span>
        </div>
      </div>

      {/* Right Actions: Pearls Counter, Notifications, Avatar */}
      <div className="flex items-center gap-2">
        {/* Pearls Counter Button */}
        <button
          type="button"
          onClick={() => {
            sound.tap();
            onOpenPearlLedger();
          }}
          className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-slate-900/80 hover:bg-slate-800/90 border border-white/10 transition-all active:scale-95 ${
            bumpingPearls ? 'scale-110 border-amber-300/60 bg-amber-950/30' : ''
          }`}
          title="Your Pearl Balance"
        >
          <PearlIcon size="sm" animate={bumpingPearls} />
          <span className="text-xs font-bold text-white tabular-nums">
            {user.pearlBalance.toLocaleString()}
          </span>
        </button>

        {/* Notifications Button */}
        <button
          type="button"
          onClick={() => {
            sound.tap();
            onOpenNotifications();
          }}
          className="relative w-8 h-8 rounded-full bg-slate-900/80 hover:bg-slate-800 flex items-center justify-center text-slate-300 hover:text-white border border-white/10 transition-colors"
          title="Notifications"
        >
          <Bell className="w-3.5 h-3.5" />
          {unreadCount > 0 && (
            <span className="absolute -top-0.5 -right-0.5 w-3.5 h-3.5 rounded-full bg-orange-500 text-white text-[9px] font-bold flex items-center justify-center shadow">
              {unreadCount}
            </span>
          )}
        </button>

        {/* User Avatar */}
        <button
          type="button"
          onClick={() => {
            sound.tap();
            onOpenProfile();
          }}
          className="relative w-8 h-8 rounded-full ring-2 ring-amber-400/40 hover:ring-amber-400 transition-all overflow-hidden"
          title={`@${user.username} (Level ${user.level})`}
        >
          <img
            src={user.avatarUrl}
            alt={user.displayName}
            className="w-full h-full object-cover"
          />
        </button>
      </div>
    </header>
  );
};
