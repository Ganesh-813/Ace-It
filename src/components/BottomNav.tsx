import React from 'react';
import { motion } from 'motion/react';
import { Home, Target, Users, Trophy, User as UserIcon } from 'lucide-react';
import { ActiveTab } from '../types';
import { sound } from '../services/sound';

interface BottomNavProps {
  activeTab: ActiveTab;
  onChangeTab: (tab: ActiveTab) => void;
}

interface TabItem {
  id: ActiveTab;
  label: string;
  icon: React.ElementType;
}

const TABS: TabItem[] = [
  { id: 'home', label: 'Home', icon: Home },
  { id: 'goals', label: 'Goals', icon: Target },
  { id: 'friends', label: 'Friends', icon: Users },
  { id: 'leaderboard', label: 'Ranks', icon: Trophy },
  { id: 'profile', label: 'Profile', icon: UserIcon },
];

export const BottomNav: React.FC<BottomNavProps> = ({ activeTab, onChangeTab }) => {
  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 max-w-md mx-auto bg-[#080B12]/90 backdrop-blur-lg border-t border-white/10 px-2 py-1.5 select-none">
      <div className="flex items-center justify-around">
        {TABS.map((tab) => {
          const isActive = activeTab === tab.id;
          const Icon = tab.icon;

          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => {
                sound.tap();
                onChangeTab(tab.id);
              }}
              className="relative flex flex-col items-center justify-center min-w-[56px] min-h-[46px] py-1 px-2 rounded-xl transition-all"
            >
              {/* Active ambient glow pill */}
              {isActive && (
                <motion.div
                  layoutId="activeTabPill"
                  className="absolute inset-0 bg-white/5 rounded-xl -z-10"
                  transition={{ type: 'spring', stiffness: 450, damping: 30 }}
                />
              )}

              {/* Icon with dimensional spring effect */}
              <motion.div
                animate={isActive ? { scale: [1, 1.15, 1], y: -2 } : { scale: 1, y: 0 }}
                transition={{ duration: 0.25 }}
                className={isActive ? 'text-white' : 'text-slate-400 hover:text-slate-200'}
              >
                <Icon
                  className={`w-5 h-5 ${isActive ? 'stroke-[2.5px]' : 'stroke-2'}`}
                />
              </motion.div>

              {/* Label */}
              <span
                className={`text-[10px] font-semibold tracking-tight mt-1 transition-colors ${
                  isActive ? 'text-white' : 'text-slate-400'
                }`}
              >
                {tab.label}
              </span>

              {/* Active bottom micro-indicator */}
              {isActive && (
                <motion.div
                  layoutId="activeDot"
                  className="w-1 h-1 rounded-full bg-amber-400 mt-0.5"
                />
              )}
            </button>
          );
        })}
      </div>
    </nav>
  );
};
