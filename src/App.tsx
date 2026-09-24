/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { ActiveTab, User, Goal, WeeklyResult } from './types';
import { storage } from './services/storage';
import { sound } from './services/sound';

// Components
import { LaunchScreen } from './components/LaunchScreen';
import { OnboardingModal } from './components/OnboardingModal';
import { TopBar } from './components/TopBar';
import { BottomNav } from './components/BottomNav';
import { PearlBurstCanvas } from './components/PearlBurstCanvas';

// Modals
import { AuthModal } from './components/AuthModal';
import { CheckInModal } from './components/CheckInModal';
import { CreateGoalModal } from './components/CreateGoalModal';
import { WeeklyResultsModal } from './components/WeeklyResultsModal';
import { FriendProfileModal } from './components/FriendProfileModal';
import { NotificationDrawer } from './components/NotificationDrawer';
import { PearlLedgerModal } from './components/PearlLedgerModal';

// Views
import { SignInView } from './views/SignInView';
import { HomeView } from './views/HomeView';
import { GoalsView } from './views/GoalsView';
import { GoalDetailView } from './views/GoalDetailView';
import { FriendsView } from './views/FriendsView';
import { LeaderboardView } from './views/LeaderboardView';
import { ProfileView } from './views/ProfileView';

export default function App() {
  const [currentUser, setCurrentUser] = useState<User | null>(() => storage.getCurrentUser());
  const [goals, setGoals] = useState<Goal[]>(() => storage.getGoals());
  const [activeTab, setActiveTab] = useState<ActiveTab>('home');
  const [theme, setTheme] = useState<'dark' | 'light'>('dark');

  // Launch screen state (show on load, allow replay)
  const [showLaunch, setShowLaunch] = useState(true);

  // Onboarding state
  const [showOnboarding, setShowOnboarding] = useState(false);

  // Modals
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [checkInGoal, setCheckInGoal] = useState<Goal | null>(null);
  const [createGoalOpen, setCreateGoalOpen] = useState(false);
  const [selectedGoalDetail, setSelectedGoalDetail] = useState<Goal | null>(null);
  const [weeklyResult, setWeeklyResult] = useState<WeeklyResult | null>(null);
  const [inspectedFriend, setInspectedFriend] = useState<User | null>(null);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [pearlLedgerOpen, setPearlLedgerOpen] = useState(false);

  // Celebration particle burst trigger key
  const [burstKey, setBurstKey] = useState(0);

  // Subscribe to storage changes
  useEffect(() => {
    const unsubscribe = storage.subscribe(() => {
      const cur = storage.getCurrentUser();
      setCurrentUser(cur ? { ...cur } : null);
      setGoals([...storage.getGoals()]);
      if (selectedGoalDetail) {
        const updated = storage.getGoals().find((g) => g.id === selectedGoalDetail.id);
        if (updated) setSelectedGoalDetail(updated);
      }
    });

    // Check if first-time user
    const hasOnboarded = localStorage.getItem('ace_it_onboarded_v1');
    if (!hasOnboarded) {
      setShowOnboarding(true);
    }

    return () => unsubscribe();
  }, [selectedGoalDetail]);

  const handleFinishLaunch = () => {
    setShowLaunch(false);
  };

  const handleCompleteOnboarding = () => {
    localStorage.setItem('ace_it_onboarded_v1', 'true');
    setShowOnboarding(false);
  };

  const triggerWeeklyCeremony = (goalId?: string) => {
    if (!currentUser) return;
    const gId = goalId || (goals.length > 0 ? goals[0].id : 'goal_1');
    const res = storage.calculateWeeklyResults(gId);
    setWeeklyResult(res);
    setBurstKey(Date.now());
  };

  const handleToggleTheme = () => {
    const next = theme === 'dark' ? 'light' : 'dark';
    setTheme(next);
    if (next === 'light') {
      document.documentElement.classList.add('light-mode');
    } else {
      document.documentElement.classList.remove('light-mode');
    }
  };

  return (
    <div
      className={`min-h-screen ${
        theme === 'dark' ? 'bg-[#07090E] text-white' : 'bg-slate-50 text-slate-900'
      } font-sans antialiased`}
    >
      {/* 1. Cinematic Startup Experience */}
      {showLaunch && <LaunchScreen onFinish={handleFinishLaunch} />}

      {/* 2. When not authenticated: Prompt to sign in with Gmail & create unique username */}
      {!currentUser ? (
        !showLaunch && (
          <SignInView
            onSignedIn={(user) => {
              setCurrentUser(user);
              setShowOnboarding(false);
            }}
          />
        )
      ) : (
        <>
          {/* Onboarding Modal for First Time Experience */}
          {showOnboarding && !showLaunch && (
            <OnboardingModal onComplete={handleCompleteOnboarding} />
          )}

          {/* 3. Global 3D Pearl Celebration Particle Overlay */}
          <PearlBurstCanvas triggerKey={burstKey} count={28} />

          {/* Mobile-Centric Container */}
          <div className="max-w-md mx-auto min-h-screen relative flex flex-col shadow-2xl bg-[#07090E] border-x border-white/5 font-sans">
            {/* Top Header */}
            <TopBar
              user={currentUser}
              notifications={storage.getNotifications()}
              onOpenNotifications={() => setNotificationsOpen(true)}
              onOpenProfile={() => setActiveTab('profile')}
              onOpenPearlLedger={() => setPearlLedgerOpen(true)}
              theme={theme}
              onToggleTheme={handleToggleTheme}
            />

            {/* View Router */}
            <main className="flex-1 w-full overflow-x-hidden pt-2">
              {selectedGoalDetail ? (
                <GoalDetailView
                  goal={selectedGoalDetail}
                  user={currentUser}
                  onBack={() => setSelectedGoalDetail(null)}
                  onOpenCheckIn={(g) => setCheckInGoal(g)}
                  onTriggerWeeklyResults={(gId) => triggerWeeklyCeremony(gId)}
                  onOpenFriendProfile={(fr) => setInspectedFriend(fr)}
                />
              ) : (
                <>
                  {activeTab === 'home' && (
                    <HomeView
                      user={currentUser}
                      goals={goals}
                      onOpenCheckIn={(g) => setCheckInGoal(g)}
                      onOpenGoalDetail={(g) => setSelectedGoalDetail(g)}
                      onCreateGoal={() => setCreateGoalOpen(true)}
                      onOpenLeaderboard={() => setActiveTab('leaderboard')}
                    />
                  )}

                  {activeTab === 'goals' && (
                    <GoalsView
                      user={currentUser}
                      goals={goals}
                      onSelectGoal={(g) => setSelectedGoalDetail(g)}
                      onCreateGoal={() => setCreateGoalOpen(true)}
                      onOpenCheckIn={(g) => setCheckInGoal(g)}
                    />
                  )}

                  {activeTab === 'friends' && (
                    <FriendsView
                      currentUser={currentUser}
                      onOpenFriendProfile={(fr) => setInspectedFriend(fr)}
                    />
                  )}

                  {activeTab === 'leaderboard' && (
                    <LeaderboardView
                      currentUser={currentUser}
                      onOpenFriendProfile={(u) => setInspectedFriend(u)}
                      onTriggerWeeklyCeremony={() => triggerWeeklyCeremony()}
                    />
                  )}

                  {activeTab === 'profile' && (
                    <ProfileView
                      user={currentUser}
                      onOpenLedger={() => setPearlLedgerOpen(true)}
                      onSwitchAccount={() => setAuthModalOpen(true)}
                      onReplayLaunch={() => setShowLaunch(true)}
                      theme={theme}
                      onToggleTheme={handleToggleTheme}
                    />
                  )}
                </>
              )}
            </main>

            {/* Bottom Navigation */}
            <BottomNav
              activeTab={activeTab}
              onChangeTab={(tab) => {
                setSelectedGoalDetail(null);
                setActiveTab(tab);
              }}
            />

            {/* Modals & Dialogs */}
            <AuthModal
              isOpen={authModalOpen}
              onClose={() => setAuthModalOpen(false)}
              onSuccess={(u) => {
                setCurrentUser(u);
                setAuthModalOpen(false);
              }}
            />

            <CheckInModal
              goal={checkInGoal}
              isOpen={!!checkInGoal}
              user={currentUser}
              onClose={() => setCheckInGoal(null)}
              onSuccess={() => {
                setBurstKey(Date.now());
                setCheckInGoal(null);
              }}
            />

            <CreateGoalModal
              isOpen={createGoalOpen}
              onClose={() => setCreateGoalOpen(false)}
              onCreated={(newGoal) => {
                setSelectedGoalDetail(newGoal);
                setBurstKey(Date.now());
              }}
            />

            {weeklyResult && (
              <WeeklyResultsModal
                result={weeklyResult}
                currentUser={currentUser}
                isOpen={!!weeklyResult}
                onClose={() => setWeeklyResult(null)}
              />
            )}

            <FriendProfileModal
              friend={inspectedFriend}
              isOpen={!!inspectedFriend}
              onClose={() => setInspectedFriend(null)}
              onNudge={() => {
                setBurstKey(Date.now());
              }}
            />

            <NotificationDrawer
              isOpen={notificationsOpen}
              onClose={() => setNotificationsOpen(false)}
              onOpenFriend={(u: User) => setInspectedFriend(u)}
            />

            <PearlLedgerModal
              isOpen={pearlLedgerOpen}
              user={currentUser}
              onClose={() => setPearlLedgerOpen(false)}
            />
          </div>
        </>
      )}
    </div>
  );
}
