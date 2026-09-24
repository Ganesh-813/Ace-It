import React, { useState } from 'react';
import { Target, Plus, Flame, Users, Search, CheckCircle2, ChevronRight } from 'lucide-react';
import { Goal, User } from '../types';
import { sound } from '../services/sound';

interface GoalsViewProps {
  user: User;
  goals: Goal[];
  onSelectGoal: (goal: Goal) => void;
  onCreateGoal: () => void;
  onOpenCheckIn: (goal: Goal) => void;
}

export const GoalsView: React.FC<GoalsViewProps> = ({
  user,
  goals,
  onSelectGoal,
  onCreateGoal,
  onOpenCheckIn,
}) => {
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  const categories = ['all', 'learning', 'coding', 'fitness', 'productivity'];

  const filteredGoals = goals.filter((g) => {
    if (g.isArchived) return false;
    const matchesSearch =
      g.title.toLowerCase().includes(search.toLowerCase()) ||
      g.description.toLowerCase().includes(search.toLowerCase());
    const matchesCat = selectedCategory === 'all' || g.category === selectedCategory;
    return matchesSearch && matchesCat;
  });

  return (
    <div className="pb-24 px-4 pt-2 space-y-4 select-none max-w-md mx-auto">
      {/* Top Header */}
      <div className="flex items-center justify-between">
        <div>
          <span className="text-[11px] font-bold tracking-wider uppercase text-slate-400">
            Accountability Hub
          </span>
          <h1 className="text-2xl font-black tracking-tight text-white">
            Shared Goals
          </h1>
        </div>

        <button
          type="button"
          onClick={() => {
            sound.tap();
            onCreateGoal();
          }}
          className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-white text-slate-950 text-xs font-bold shadow-md shadow-white/10 active:scale-95 transition-transform"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Create Goal</span>
        </button>
      </div>

      {/* Search Input */}
      <div className="relative flex items-center">
        <Search className="absolute left-3.5 w-4 h-4 text-slate-400" />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search goals by keyword..."
          className="w-full h-11 pl-10 pr-3 rounded-2xl bg-slate-900 border border-white/10 text-xs text-white focus:outline-none focus:border-amber-400 placeholder-slate-500 transition-colors"
        />
      </div>

      {/* Category Pills */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar">
        {categories.map((cat) => (
          <button
            key={cat}
            type="button"
            onClick={() => {
              sound.tap();
              setSelectedCategory(cat);
            }}
            className={`px-3 py-1 rounded-full text-xs font-semibold capitalize whitespace-nowrap transition-all ${
              selectedCategory === cat
                ? 'bg-amber-400 text-slate-950 shadow-sm'
                : 'bg-slate-900 text-slate-400 border border-white/5 hover:text-slate-200'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Goals List */}
      <div className="space-y-3 pt-1">
        {filteredGoals.length === 0 ? (
          <div className="p-8 rounded-3xl bg-slate-900/40 border border-white/5 text-center space-y-3">
            <Target className="w-8 h-8 text-slate-500 mx-auto" />
            <p className="text-sm font-bold text-white">No goals matching criteria</p>
            <p className="text-xs text-slate-400">
              Try adjusting your search or start a new shared goal with friends.
            </p>
          </div>
        ) : (
          filteredGoals.map((goal) => {
            const member = goal.members.find((m) => m.userId === user.id);
            const userContribution = member?.weeklyContributionPercent ?? 0;
            const groupProgress = Math.round(
              goal.members.reduce((acc, m) => acc + (m.weeklyContributionPercent || 0), 0) /
                goal.members.length
            );
            const checkedInToday = member?.hasCheckedInToday;

            return (
              <div
                key={goal.id}
                onClick={() => {
                  sound.tap();
                  onSelectGoal(goal);
                }}
                className="p-4 rounded-2xl bg-slate-900 border border-white/10 shadow-lg space-y-3 hover:border-white/20 transition-all cursor-pointer group"
              >
                {/* Header */}
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-bold text-amber-400 uppercase tracking-wide">
                        {goal.category}
                      </span>
                      <span className="text-slate-600 text-xs">·</span>
                      <span className="text-[10px] text-slate-400 flex items-center gap-1">
                        <Users className="w-3 h-3" />
                        {goal.members.length} members
                      </span>
                    </div>
                    <h3 className="text-base font-extrabold text-white mt-0.5 group-hover:text-amber-300 transition-colors">
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

                <p className="text-xs text-slate-300 line-clamp-2 leading-relaxed">
                  {goal.description}
                </p>

                {/* Contribution Metrics */}
                <div className="grid grid-cols-2 gap-3 p-3 rounded-xl bg-slate-950/50 border border-white/5">
                  <div>
                    <span className="text-[10px] text-slate-400 block">Your Contribution</span>
                    <div className="flex items-center gap-2 mt-0.5">
                      <span className="text-sm font-black text-amber-300 tabular-nums">
                        {userContribution}%
                      </span>
                      <div className="flex-1 h-1.5 rounded-full bg-slate-800 overflow-hidden">
                        <div
                          className="h-full bg-amber-400 rounded-full"
                          style={{ width: `${userContribution}%` }}
                        />
                      </div>
                    </div>
                  </div>

                  <div>
                    <span className="text-[10px] text-slate-400 block">Group Progress</span>
                    <div className="flex items-center gap-2 mt-0.5">
                      <span className="text-sm font-black text-white tabular-nums">
                        {groupProgress}%
                      </span>
                      <div className="flex-1 h-1.5 rounded-full bg-slate-800 overflow-hidden">
                        <div
                          className="h-full bg-slate-400 rounded-full"
                          style={{ width: `${groupProgress}%` }}
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Bottom Card Actions */}
                <div
                  className="flex items-center justify-between pt-1"
                  onClick={(e) => e.stopPropagation()}
                >
                  <button
                    type="button"
                    onClick={() => onSelectGoal(goal)}
                    className="text-xs font-semibold text-slate-400 hover:text-white flex items-center gap-1 transition-colors"
                  >
                    <span>View Sprint</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>

                  {checkedInToday ? (
                    <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-400 bg-emerald-950/40 border border-emerald-500/20 px-3 py-1.5 rounded-xl">
                      <CheckCircle2 className="w-3.5 h-3.5 stroke-[2.5px]" />
                      <span>Logged Today</span>
                    </div>
                  ) : (
                    <button
                      type="button"
                      onClick={() => {
                        sound.tap();
                        onOpenCheckIn(goal);
                      }}
                      className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-white hover:bg-slate-100 text-slate-950 font-black text-xs shadow active:scale-95 transition-all"
                    >
                      <Flame className="w-3.5 h-3.5 text-orange-500 fill-orange-500" />
                      <span>Log Progress</span>
                    </button>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
