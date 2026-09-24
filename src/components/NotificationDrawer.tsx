import React from 'react';
import { motion } from 'motion/react';
import { Bell, Flame, Users, Sparkles, Trophy, CheckCheck, X } from 'lucide-react';
import { NotificationItem, User } from '../types';
import { storage } from '../services/storage';
import { sound } from '../services/sound';

interface NotificationDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  notifications?: NotificationItem[];
  onRefresh?: () => void;
  onOpenFriend?: (user: User) => void;
}

export const NotificationDrawer: React.FC<NotificationDrawerProps> = ({
  isOpen,
  onClose,
  notifications: propNotifications,
  onRefresh,
  onOpenFriend,
}) => {
  if (!isOpen) return null;

  const notifications = propNotifications || storage.getNotifications();

  const handleMarkAllRead = () => {
    sound.tap();
    storage.markAllNotificationsAsRead();
    if (onRefresh) onRefresh();
  };

  const getIcon = (type: NotificationItem['type']) => {
    switch (type) {
      case 'streak': return <Flame className="w-4 h-4 text-orange-400" />;
      case 'checkin': return <Users className="w-4 h-4 text-cyan-400" />;
      case 'reward': return <Sparkles className="w-4 h-4 text-amber-400" />;
      case 'weekly': return <Trophy className="w-4 h-4 text-purple-400" />;
      default: return <Bell className="w-4 h-4 text-slate-400" />;
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-end bg-black/75 backdrop-blur-sm select-none">
      <motion.div
        initial={{ x: '100%' }}
        animate={{ x: 0 }}
        exit={{ x: '100%' }}
        transition={{ type: 'spring', stiffness: 400, damping: 30 }}
        className="w-full max-w-sm h-full bg-[#0B0E17] border-l border-white/10 shadow-2xl p-5 flex flex-col justify-between text-white"
      >
        <div>
          {/* Header */}
          <div className="flex items-center justify-between pb-4 border-b border-white/10">
            <div className="flex items-center gap-2">
              <Bell className="w-4 h-4 text-amber-400" />
              <h2 className="text-base font-black tracking-tight" style={{ fontFamily: 'var(--font-display, sans-serif)' }}>
                Notifications
              </h2>
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleMarkAllRead}
                className="text-xs text-slate-400 hover:text-white transition-colors"
                title="Mark all as read"
              >
                <CheckCheck className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={onClose}
                className="text-slate-400 hover:text-white p-1"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* List */}
          <div className="mt-4 space-y-2.5 max-h-[calc(100vh-140px)] overflow-y-auto pr-1">
            {notifications.length === 0 ? (
              <div className="py-12 text-center text-slate-400">
                <p className="text-xs">All caught up! No notifications.</p>
              </div>
            ) : (
              notifications.map((n) => (
                <div
                  key={n.id}
                  onClick={() => {
                    storage.markNotificationAsRead(n.id);
                    if (onRefresh) onRefresh();
                  }}
                  className={`p-3 rounded-2xl border transition-all cursor-pointer ${
                    n.isRead
                      ? 'bg-slate-900/40 border-white/5 opacity-70'
                      : 'bg-slate-900 border-amber-500/20 shadow-md'
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <div className="p-2 rounded-xl bg-slate-800 shrink-0 mt-0.5">
                      {getIcon(n.type)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-1">
                        <p className="text-xs font-bold text-white truncate">{n.title}</p>
                        <span className="text-[10px] text-slate-400 shrink-0">{n.timestamp}</span>
                      </div>
                      <p className="text-[11px] text-slate-300 mt-1 leading-snug">{n.message}</p>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        <div className="pt-3 border-t border-white/10 text-center">
          <p className="text-[10px] text-slate-400">
            Push notifications enabled for shared squad accountability.
          </p>
        </div>
      </motion.div>
    </div>
  );
};
