/**
 * Ace It - Storage & Business Logic Engine
 * Handles persistent state, transactions, streak calculations, gamification, and anti-abuse rules.
 * All fake mock users and seeded streaks have been removed for a clean, authentic experience.
 */

import {
  User,
  Goal,
  DailyCheckin,
  XpTransaction,
  PearlTransaction,
  Achievement,
  UserAchievement,
  WeeklyResult,
  NotificationItem,
  FriendRelation,
  FriendRequest,
} from '../types';

const STORAGE_KEYS = {
  USERS: 'aceit_fresh_v3_users',
  CURRENT_USER_ID: 'aceit_fresh_v3_current_user_id',
  GOALS: 'aceit_fresh_v3_goals',
  CHECKINS: 'aceit_fresh_v3_checkins',
  XP_TX: 'aceit_fresh_v3_xp_tx',
  PEARL_TX: 'aceit_fresh_v3_pearl_tx',
  USER_ACHIEVEMENTS: 'aceit_fresh_v3_user_achievements',
  WEEKLY_RESULTS: 'aceit_fresh_v3_weekly_results',
  NOTIFICATIONS: 'aceit_fresh_v3_notifications',
  FRIENDSHIPS: 'aceit_fresh_v3_friendships',
  FRIEND_REQUESTS: 'aceit_fresh_v3_friend_requests',
  THEME_MODE: 'aceit_fresh_v3_theme_mode',
};

// Full achievements catalog
export const ACHIEVEMENTS_CATALOG: Achievement[] = [
  { id: 'ach_first_checkin', key: 'first_checkin', title: 'First Step', description: 'Log your very first daily progress report', iconName: 'Flame', tier: 'bronze', xpReward: 50, pearlReward: 15, category: 'checkin' },
  { id: 'ach_streak_7', key: 'streak_7', title: '7 Day Streak', description: 'Maintain a 7-day streak without breaking the chain', iconName: 'Zap', tier: 'bronze', xpReward: 150, pearlReward: 30, category: 'streak' },
  { id: 'ach_streak_14', key: 'streak_14', title: '14 Day Streak', description: 'Two weeks of unbroken discipline', iconName: 'Shield', tier: 'silver', xpReward: 300, pearlReward: 60, category: 'streak' },
  { id: 'ach_streak_30', key: 'streak_30', title: '30 Day Streak', description: 'A full month of relentless consistency', iconName: 'Flame', tier: 'gold', xpReward: 600, pearlReward: 120, category: 'streak' },
  { id: 'ach_streak_50', key: 'streak_50', title: '50 Day Streak', description: 'Half a century of daily progress', iconName: 'Award', tier: 'gold', xpReward: 1000, pearlReward: 200, category: 'streak' },
  { id: 'ach_streak_100', key: 'streak_100', title: '100 Day Streak', description: 'Legendary 100-day streak milestone', iconName: 'Crown', tier: 'pearl', xpReward: 2500, pearlReward: 500, category: 'streak' },
  { id: 'ach_first_goal', key: 'first_goal', title: 'Architect', description: 'Create your first shared goal with friends', iconName: 'Target', tier: 'bronze', xpReward: 100, pearlReward: 20, category: 'social' },
  { id: 'ach_first_friend', key: 'first_friend', title: 'Accountability Circle', description: 'Connect with your first accountability partner', iconName: 'Users', tier: 'bronze', xpReward: 80, pearlReward: 15, category: 'social' },
  { id: 'ach_weekly_champ', key: 'weekly_champ', title: 'Weekly Champion', description: 'Finish highest contributor in a weekly group sprint', iconName: 'Trophy', tier: 'gold', xpReward: 500, pearlReward: 150, category: 'weekly' },
  { id: 'ach_weekly_5', key: 'weekly_5', title: '5x Champion', description: 'Earn top weekly contributor honors 5 times', iconName: 'Sparkles', tier: 'pearl', xpReward: 1500, pearlReward: 400, category: 'weekly' },
  { id: 'ach_goal_finished', key: 'goal_finished', title: 'Goal Finisher', description: 'Successfully complete the full duration of a goal', iconName: 'CheckCircle2', tier: 'gold', xpReward: 400, pearlReward: 100, category: 'mastery' },
  { id: 'ach_xp_1000', key: 'xp_1000', title: '1,000 XP Club', description: 'Accumulate 1,000 lifetime XP', iconName: 'Star', tier: 'bronze', xpReward: 100, pearlReward: 25, category: 'mastery' },
  { id: 'ach_xp_10000', key: 'xp_10000', title: '10,000 XP Veteran', description: 'Accumulate 10,000 lifetime XP', iconName: 'Compass', tier: 'gold', xpReward: 800, pearlReward: 150, category: 'mastery' },
  { id: 'ach_pearls_100', key: 'pearls_100', title: 'Pearl Collector', description: 'Amass a treasure of 100 Pearls', iconName: 'Gem', tier: 'silver', xpReward: 200, pearlReward: 20, category: 'mastery' },
  { id: 'ach_pearls_1000', key: 'pearls_1000', title: 'Pearl Magnate', description: 'Hold 1,000 or more Pearls in your balance', iconName: 'Sparkles', tier: 'pearl', xpReward: 1000, pearlReward: 200, category: 'mastery' },
  { id: 'ach_consistency_master', key: 'consistency_master', title: 'Consistency Master', description: 'Check in with 80%+ contribution for 7 consecutive days', iconName: 'Zap', tier: 'silver', xpReward: 350, pearlReward: 80, category: 'streak' },
  { id: 'ach_team_player', key: 'team_player', title: 'Team Player', description: 'Cheer on and review progress with friends in a group', iconName: 'HeartHandshake', tier: 'bronze', xpReward: 150, pearlReward: 40, category: 'social' },
];

class StorageService {
  private users: User[] = [];
  private currentUserId: string | null = null;
  private goals: Goal[] = [];
  private checkins: DailyCheckin[] = [];
  private xpTransactions: XpTransaction[] = [];
  private pearlTransactions: PearlTransaction[] = [];
  private userAchievements: UserAchievement[] = [];
  private weeklyResults: WeeklyResult[] = [];
  private notifications: NotificationItem[] = [];
  private friendships: { [userId: string]: FriendRelation[] } = {};
  private friendRequests: FriendRequest[] = [];
  private listeners: Array<() => void> = [];

  constructor() {
    this.init();
  }

  public subscribe(listener: () => void): () => void {
    this.listeners.push(listener);
    return () => {
      this.listeners = this.listeners.filter((l) => l !== listener);
    };
  }

  private notify() {
    this.listeners.forEach((l) => {
      try {
        l();
      } catch (e) {
        console.error(e);
      }
    });
  }

  private init() {
    if (typeof window === 'undefined') return;

    try {
      // Purge old mock seeded keys
      const legacyKeys = [
        'aceit_users_v1',
        'aceit_current_user_id_v1',
        'aceit_goals_v1',
        'aceit_checkins_v1',
        'aceit_xp_tx_v1',
        'aceit_pearl_tx_v1',
        'aceit_achievements_v1',
        'aceit_user_achievements_v1',
        'aceit_weekly_results_v1',
        'aceit_notifications_v1',
        'aceit_friendships_v1',
        'ace_it_onboarded_v1',
      ];
      legacyKeys.forEach((k) => localStorage.removeItem(k));

      // Load fresh user data
      const storedUsers = localStorage.getItem(STORAGE_KEYS.USERS);
      this.users = storedUsers ? JSON.parse(storedUsers) : [];

      const storedCurId = localStorage.getItem(STORAGE_KEYS.CURRENT_USER_ID);
      if (storedCurId && this.users.some((u) => u.id === storedCurId)) {
        this.currentUserId = storedCurId;
      } else if (this.users.length > 0) {
        this.currentUserId = this.users[0].id;
        localStorage.setItem(STORAGE_KEYS.CURRENT_USER_ID, this.currentUserId);
      } else {
        this.currentUserId = null;
      }

      const storedGoals = localStorage.getItem(STORAGE_KEYS.GOALS);
      this.goals = storedGoals ? JSON.parse(storedGoals) : [];

      const storedCheckins = localStorage.getItem(STORAGE_KEYS.CHECKINS);
      this.checkins = storedCheckins ? JSON.parse(storedCheckins) : [];

      const storedXpTx = localStorage.getItem(STORAGE_KEYS.XP_TX);
      this.xpTransactions = storedXpTx ? JSON.parse(storedXpTx) : [];

      const storedPearlTx = localStorage.getItem(STORAGE_KEYS.PEARL_TX);
      this.pearlTransactions = storedPearlTx ? JSON.parse(storedPearlTx) : [];

      const storedUserAch = localStorage.getItem(STORAGE_KEYS.USER_ACHIEVEMENTS);
      this.userAchievements = storedUserAch ? JSON.parse(storedUserAch) : [];

      const storedWeekly = localStorage.getItem(STORAGE_KEYS.WEEKLY_RESULTS);
      this.weeklyResults = storedWeekly ? JSON.parse(storedWeekly) : [];

      const storedNotifs = localStorage.getItem(STORAGE_KEYS.NOTIFICATIONS);
      this.notifications = storedNotifs ? JSON.parse(storedNotifs) : [];

      const storedFriendships = localStorage.getItem(STORAGE_KEYS.FRIENDSHIPS);
      this.friendships = storedFriendships ? JSON.parse(storedFriendships) : {};

      const storedRequests = localStorage.getItem(STORAGE_KEYS.FRIEND_REQUESTS);
      this.friendRequests = storedRequests ? JSON.parse(storedRequests) : [];
    } catch (e) {
      console.error('Failed initializing Ace It storage', e);
    }
  }

  // --- Auth & User Management ---

  public hasUser(): boolean {
    return this.currentUserId !== null && this.users.some((u) => u.id === this.currentUserId);
  }

  public getCurrentUser(): User | null {
    if (!this.currentUserId) return null;
    return this.users.find((u) => u.id === this.currentUserId) || null;
  }

  public getAllUsers(): User[] {
    return [...this.users];
  }

  public getUserById(id: string): User | undefined {
    return this.users.find((u) => u.id === id);
  }

  public switchUser(userId: string): User {
    const user = this.users.find((u) => u.id === userId);
    if (!user) throw new Error('User not found');
    this.currentUserId = user.id;
    localStorage.setItem(STORAGE_KEYS.CURRENT_USER_ID, user.id);
    this.notify();
    return user;
  }

  public signOut(): void {
    this.currentUserId = null;
    localStorage.removeItem(STORAGE_KEYS.CURRENT_USER_ID);
    this.notify();
  }

  public resetAllData(): void {
    localStorage.clear();
    this.users = [];
    this.currentUserId = null;
    this.goals = [];
    this.checkins = [];
    this.xpTransactions = [];
    this.pearlTransactions = [];
    this.userAchievements = [];
    this.weeklyResults = [];
    this.notifications = [];
    this.friendships = {};
    this.friendRequests = [];
    this.notify();
  }

  public signUpUser(params: {
    email: string;
    username: string;
    displayName?: string;
    avatarUrl?: string;
  }): User {
    const cleanEmail = params.email.trim().toLowerCase();
    const cleanUsername = params.username.trim().toLowerCase().replace(/^@/, '');

    if (!cleanEmail || !cleanEmail.includes('@') || !cleanEmail.includes('.')) {
      throw new Error('Please enter a valid Gmail or email address');
    }
    if (cleanUsername.length < 3 || cleanUsername.length > 20) {
      throw new Error('Username must be between 3 and 20 characters');
    }
    if (!/^[a-z0-9_]+$/.test(cleanUsername)) {
      throw new Error('Username can only contain letters, numbers, and underscores');
    }
    if (this.users.some((u) => u.username.toLowerCase() === cleanUsername)) {
      throw new Error(`@${cleanUsername} is already taken. Please choose another username.`);
    }

    const defaultAvatar = `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(
      params.displayName || cleanUsername
    )}&backgroundColor=0f172a,1e293b,334155&textColor=ffffff`;

    const newUser: User = {
      id: `user_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`,
      email: cleanEmail,
      username: cleanUsername,
      displayName: params.displayName?.trim() || cleanUsername,
      avatarUrl: params.avatarUrl || defaultAvatar,
      bio: '',
      streak: 0,
      longestStreak: 0,
      totalXp: 0,
      pearlBalance: 50, // Welcome gift
      streakShields: 1, // 1 free freeze shield
      level: 1,
      joinedDate: new Date().toISOString().split('T')[0],
      isOnline: true,
    };

    this.users.push(newUser);
    this.currentUserId = newUser.id;
    localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(this.users));
    localStorage.setItem(STORAGE_KEYS.CURRENT_USER_ID, newUser.id);

    // Initial starter pearl transaction
    this.addPearlTransaction(newUser.id, 50, 'Welcome to Ace It Starter Pearls');

    // Initialize all catalog achievements as locked
    ACHIEVEMENTS_CATALOG.forEach((ach) => {
      this.userAchievements.push({
        achievementId: ach.id,
        userId: newUser.id,
        unlocked: false,
        progress: 0,
        maxProgress: ach.id.includes('streak') ? parseInt(ach.id.replace(/\D/g, '') || '10') : 10,
      });
    });
    localStorage.setItem(STORAGE_KEYS.USER_ACHIEVEMENTS, JSON.stringify(this.userAchievements));

    // Initial welcome notification
    this.notifications.unshift({
      id: `notif_${Date.now()}`,
      userId: newUser.id,
      title: 'Welcome to Ace It!',
      message: 'Create your first shared goal and connect with your friend to start your streak.',
      type: 'reward',
      isRead: false,
      timestamp: 'Just now',
    });
    localStorage.setItem(STORAGE_KEYS.NOTIFICATIONS, JSON.stringify(this.notifications));

    this.notify();
    return newUser;
  }

  public loginUser(identifier: string): User {
    const clean = identifier.trim().toLowerCase().replace(/^@/, '');
    const user = this.users.find(
      (u) => u.username.toLowerCase() === clean || (u.email && u.email.toLowerCase() === clean)
    );
    if (!user) {
      throw new Error(`No account found matching "${identifier}". Please create an account.`);
    }
    this.currentUserId = user.id;
    localStorage.setItem(STORAGE_KEYS.CURRENT_USER_ID, user.id);
    this.notify();
    return user;
  }

  public updateCurrentUser(partial: Partial<User>): User {
    if (!this.currentUserId) throw new Error('Not logged in');
    const idx = this.users.findIndex((u) => u.id === this.currentUserId);
    if (idx === -1) throw new Error('User not found');
    this.users[idx] = { ...this.users[idx], ...partial };
    localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(this.users));
    this.notify();
    return this.users[idx];
  }

  // --- Goals Management ---

  public getGoals(): Goal[] {
    return this.goals.filter((g) => !g.isArchived);
  }

  public getGoalById(id: string): Goal | undefined {
    return this.goals.find((g) => g.id === id);
  }

  public createGoal(params: {
    title: string;
    description: string;
    category: Goal['category'];
    frequency: Goal['frequency'];
    durationDays: number;
    invitedFriendIds: string[];
    targetUnit?: string;
  }): Goal {
    const user = this.getCurrentUser();
    if (!user) throw new Error('Must be signed in to create a goal');

    const today = new Date().toISOString().split('T')[0];
    const newGoalId = `goal_${Date.now()}`;

    const memberList = [
      {
        userId: user.id,
        goalId: newGoalId,
        role: 'owner' as const,
        joinedAt: today,
        weeklyContributionPercent: 0,
        dailyCheckinsThisWeek: 0,
        effortScoreThisWeek: 0,
        consistencyScoreThisWeek: 0,
        goalProgressScoreThisWeek: 0,
        hasCheckedInToday: false,
      },
      ...params.invitedFriendIds.map((friendId) => ({
        userId: friendId,
        goalId: newGoalId,
        role: 'member' as const,
        joinedAt: today,
        weeklyContributionPercent: 0,
        dailyCheckinsThisWeek: 0,
        effortScoreThisWeek: 0,
        consistencyScoreThisWeek: 0,
        goalProgressScoreThisWeek: 0,
        hasCheckedInToday: false,
      })),
    ];

    const newGoal: Goal = {
      id: newGoalId,
      title: params.title.trim(),
      description: params.description.trim(),
      category: params.category,
      frequency: params.frequency,
      durationDays: params.durationDays,
      startDate: today,
      creatorId: user.id,
      streak: 0,
      longestStreak: 0,
      isArchived: false,
      targetMetric: params.title,
      targetUnit: params.targetUnit || 'minutes',
      members: memberList,
    };

    this.goals.unshift(newGoal);
    localStorage.setItem(STORAGE_KEYS.GOALS, JSON.stringify(this.goals));

    // Award bonus XP and Pearl for creating first goal
    this.addXpTransaction(user.id, 100, `Created goal: ${newGoal.title}`, newGoal.id);
    this.addPearlTransaction(user.id, 20, `Created goal: ${newGoal.title}`, newGoal.id);
    this.unlockAchievement(user.id, 'ach_first_goal');

    this.notify();
    return newGoal;
  }

  public inviteFriendToGoal(goalId: string, friendId: string): Goal {
    const goal = this.goals.find((g) => g.id === goalId);
    if (!goal) throw new Error('Goal not found');
    if (goal.members.some((m) => m.userId === friendId)) {
      return goal;
    }

    goal.members.push({
      userId: friendId,
      goalId,
      role: 'member',
      joinedAt: new Date().toISOString().split('T')[0],
      weeklyContributionPercent: 0,
      dailyCheckinsThisWeek: 0,
      effortScoreThisWeek: 0,
      consistencyScoreThisWeek: 0,
      goalProgressScoreThisWeek: 0,
      hasCheckedInToday: false,
    });

    localStorage.setItem(STORAGE_KEYS.GOALS, JSON.stringify(this.goals));
    this.notify();
    return goal;
  }

  // --- Daily Check-In Engine ---

  public submitCheckin(params: {
    goalId: string;
    contributionPercent: number; // 25, 50, 75, 85, 100
    minutesLogged?: number;
    timeSpentMinutes?: number;
    unitsCompleted?: number;
    quantityCompleted?: number;
    quantityUnit?: string;
    accomplishedText?: string;
    reflection?: string;
    photoProofUrl?: string;
    hasAttachment?: boolean;
  }): {
    checkin: DailyCheckin;
    xpEarned: number;
    pearlsEarned: number;
    newStreak: number;
  } {
    const curUser = this.getCurrentUser();
    if (!curUser) throw new Error('Not logged in');

    const goal = this.goals.find((g) => g.id === params.goalId);
    if (!goal) throw new Error('Goal not found');

    const today = new Date().toISOString().split('T')[0];

    // Anti-abuse: 1 check-in per goal per day
    const alreadyDone = this.checkins.some(
      (c) => c.goalId === params.goalId && c.userId === curUser.id && c.date === today
    );
    if (alreadyDone) {
      throw new Error("You have already checked in for this goal today! Keep up tomorrow's streak.");
    }

    const minutes = params.minutesLogged || params.timeSpentMinutes || 30;
    // Dynamic XP & Pearls calculation
    const baseContribution = Math.min(100, Math.max(25, params.contributionPercent));
    const xpEarned = Math.round(30 + (baseContribution / 100) * 45 + Math.min(25, minutes / 3));
    const pearlsEarned = Math.max(3, Math.round(5 + (baseContribution / 100) * 10));

    const newCheckin: DailyCheckin = {
      id: `chk_${Date.now()}`,
      goalId: params.goalId,
      userId: curUser.id,
      date: today,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      accomplishedText: params.accomplishedText || 'Logged daily progress',
      contributionPercent: baseContribution,
      minutesLogged: minutes,
      timeSpentMinutes: minutes,
      unitsCompleted: params.unitsCompleted || params.quantityCompleted,
      quantityCompleted: params.quantityCompleted,
      quantityUnit: params.quantityUnit,
      reflection: params.reflection,
      photoProofUrl: params.photoProofUrl,
      hasAttachment: params.hasAttachment,
      xpEarned,
      pearlsEarned,
      verifiedByPartner: false,
    };

    this.checkins.unshift(newCheckin);
    localStorage.setItem(STORAGE_KEYS.CHECKINS, JSON.stringify(this.checkins));

    // Update goal member
    const member = goal.members.find((m) => m.userId === curUser.id);
    if (member) {
      member.hasCheckedInToday = true;
      member.lastCheckInDate = today;
      member.dailyCheckinsThisWeek += 1;
      
      const dailyCompletion = Math.min(100, Math.round((member.dailyCheckinsThisWeek / 7) * 100));
      const loggedEffort = Math.min(100, Math.max(50, params.contributionPercent));
      const consistency = Math.min(100, 70 + member.dailyCheckinsThisWeek * 5);
      const goalProg = 80;
      member.weeklyContributionPercent = this.calculateContributionScore(dailyCompletion, loggedEffort, consistency, goalProg);
    }

    // Increment user streak and goal streak
    const newStreak = curUser.streak + 1;
    const longest = Math.max(curUser.longestStreak, newStreak);
    this.updateCurrentUser({
      streak: newStreak,
      longestStreak: longest,
      totalXp: curUser.totalXp + xpEarned,
      pearlBalance: curUser.pearlBalance + pearlsEarned,
    });

    goal.streak += 1;
    goal.longestStreak = Math.max(goal.longestStreak, goal.streak);
    localStorage.setItem(STORAGE_KEYS.GOALS, JSON.stringify(this.goals));

    // Record transactions
    this.addXpTransaction(curUser.id, xpEarned, `Daily check-in: ${goal.title}`, goal.id);
    this.addPearlTransaction(curUser.id, pearlsEarned, `Daily check-in: ${goal.title}`, goal.id);

    // Achievements checks
    this.unlockAchievement(curUser.id, 'ach_first_checkin');
    if (newStreak >= 7) this.unlockAchievement(curUser.id, 'ach_streak_7');
    if (newStreak >= 14) this.unlockAchievement(curUser.id, 'ach_streak_14');
    if (newStreak >= 30) this.unlockAchievement(curUser.id, 'ach_streak_30');

    this.notifications.unshift({
      id: `notif_${Date.now()}`,
      userId: curUser.id,
      title: 'Progress Logged!',
      message: `You earned +${xpEarned} XP and +${pearlsEarned} Pearls in ${goal.title}.`,
      type: 'checkin',
      isRead: false,
      timestamp: 'Just now',
    });
    localStorage.setItem(STORAGE_KEYS.NOTIFICATIONS, JSON.stringify(this.notifications));

    this.notify();

    return {
      checkin: newCheckin,
      xpEarned,
      pearlsEarned,
      newStreak,
    };
  }

  public submitDailyCheckin = (params: any) => this.submitCheckin(params);

  public getCheckinsForGoal(goalId: string): DailyCheckin[] {
    return this.checkins.filter((c) => c.goalId === goalId);
  }

  public hasUserCheckedInToday(goalId: string, userId?: string): boolean {
    const targetUserId = userId || this.currentUserId;
    if (!targetUserId) return false;
    const today = new Date().toISOString().split('T')[0];
    return this.checkins.some((c) => c.goalId === goalId && c.userId === targetUserId && c.date === today);
  }

  public getTodayXp(userId?: string): number {
    const uid = userId || this.currentUserId;
    if (!uid) return 0;
    const today = new Date().toISOString().split('T')[0];
    return this.checkins
      .filter((c) => c.userId === uid && c.date === today)
      .reduce((sum, c) => sum + c.xpEarned, 0);
  }

  // --- Weekly Calculation Ceremony Engine ---

  public calculateWeeklyResults(goalId: string): WeeklyResult {
    return this.calculateWeeklyResultsForGoal(goalId);
  }

  public calculateWeeklyResultsForGoal(goalId: string): WeeklyResult {
    const goal = this.goals.find((g) => g.id === goalId);
    if (!goal) throw new Error('Goal not found');

    const rankedMembers = goal.members.map((m) => {
      const user = this.getUserById(m.userId) || {
        username: 'partner',
        displayName: 'Accountability Friend',
        avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
      };
      return {
        userId: m.userId,
        username: user.username,
        displayName: user.displayName,
        avatarUrl: user.avatarUrl,
        contributionPercent: m.weeklyContributionPercent || 0,
      };
    });

    rankedMembers.sort((a, b) => b.contributionPercent - a.contributionPercent);

    const weeklyMembers = rankedMembers.map((m, idx) => {
      const isChamp = idx === 0 && rankedMembers.length > 0;
      const xpEarned = isChamp ? 500 : Math.max(50, Math.round(300 * (m.contributionPercent / 100)));
      const pearlsEarned = isChamp ? 150 : Math.max(10, Math.round(50 * (m.contributionPercent / 100)));

      const targetUser = this.getUserById(m.userId);
      if (targetUser) {
        targetUser.totalXp += xpEarned;
        targetUser.pearlBalance += pearlsEarned;
        this.addXpTransaction(m.userId, xpEarned, `Weekly contribution result in ${goal.title}`, goal.id);
        this.addPearlTransaction(m.userId, pearlsEarned, `Weekly contribution result in ${goal.title}`, goal.id);
        if (isChamp) {
          this.unlockAchievement(m.userId, 'ach_weekly_champ');
        }
      }

      return {
        ...m,
        rank: idx + 1,
        xpEarned,
        pearlsEarned,
        isChampion: isChamp,
      };
    });

    const result: WeeklyResult = {
      id: `wres_${Date.now()}`,
      goalId,
      goalTitle: goal.title,
      weekEndingDate: new Date().toISOString().split('T')[0],
      championUserId: weeklyMembers[0]?.userId || '',
      formula: {
        dailyCompletionWeight: 0.4,
        loggedEffortWeight: 0.3,
        consistencyWeight: 0.2,
        goalProgressWeight: 0.1,
      },
      members: weeklyMembers,
    };

    this.weeklyResults.unshift(result);
    localStorage.setItem(STORAGE_KEYS.WEEKLY_RESULTS, JSON.stringify(this.weeklyResults));
    this.notify();
    return result;
  }

  public getWeeklyResults(): WeeklyResult[] {
    return [...this.weeklyResults];
  }

  // --- Friend System ---

  public getFriendRequests(): FriendRequest[] {
    return [...this.friendRequests];
  }

  public sendFriendRequest(targetUserId: string): FriendRequest {
    const curUser = this.getCurrentUser();
    if (!curUser) throw new Error('Not logged in');
    if (curUser.id === targetUserId) throw new Error('Cannot add yourself as a friend');

    const existing = this.friendRequests.find(
      (r) => r.fromUserId === curUser.id && r.toUserId === targetUserId && r.status === 'pending'
    );
    if (existing) return existing;

    const newReq: FriendRequest = {
      id: `freq_${Date.now()}`,
      fromUserId: curUser.id,
      toUserId: targetUserId,
      status: 'pending',
      createdAt: new Date().toISOString().split('T')[0],
    };

    this.friendRequests.unshift(newReq);
    localStorage.setItem(STORAGE_KEYS.FRIEND_REQUESTS, JSON.stringify(this.friendRequests));
    this.notify();
    return newReq;
  }

  public respondToFriendRequest(reqId: string, status: 'accepted' | 'declined'): boolean {
    const req = this.friendRequests.find((r) => r.id === reqId);
    if (!req) return false;
    req.status = status;

    if (status === 'accepted') {
      const today = new Date().toISOString().split('T')[0];
      if (!this.friendships[req.fromUserId]) this.friendships[req.fromUserId] = [];
      if (!this.friendships[req.toUserId]) this.friendships[req.toUserId] = [];

      this.friendships[req.fromUserId].push({ friendId: req.toUserId, status: 'friends', since: today });
      this.friendships[req.toUserId].push({ friendId: req.fromUserId, status: 'friends', since: today });

      localStorage.setItem(STORAGE_KEYS.FRIENDSHIPS, JSON.stringify(this.friendships));
      this.unlockAchievement(req.fromUserId, 'ach_first_friend');
      this.unlockAchievement(req.toUserId, 'ach_first_friend');
    }

    localStorage.setItem(STORAGE_KEYS.FRIEND_REQUESTS, JSON.stringify(this.friendRequests));
    this.notify();
    return true;
  }

  public addFriendByHandle(handle: string): { success: boolean; user?: User; message: string } {
    const curUser = this.getCurrentUser();
    if (!curUser) throw new Error('Please sign in first');

    const cleanHandle = handle.trim().toLowerCase().replace(/^@/, '');
    if (!cleanHandle) throw new Error('Please enter a username or Gmail');

    if (cleanHandle === curUser.username.toLowerCase() || (curUser.email && cleanHandle === curUser.email.toLowerCase())) {
      throw new Error('You cannot add your own account as a friend.');
    }

    // Find existing user or create real companion user for instant squad collaboration
    let friendUser = this.users.find(
      (u) => u.username.toLowerCase() === cleanHandle || (u.email && u.email.toLowerCase() === cleanHandle)
    );

    if (!friendUser) {
      // Create their friend's profile so they can start sharing goals immediately
      const friendId = `user_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`;
      friendUser = {
        id: friendId,
        email: cleanHandle.includes('@') ? cleanHandle : `${cleanHandle}@gmail.com`,
        username: cleanHandle.replace(/[^a-z0-9_]/g, '') || `friend_${Date.now().toString().slice(-4)}`,
        displayName: cleanHandle.includes('@') ? cleanHandle.split('@')[0] : cleanHandle.charAt(0).toUpperCase() + cleanHandle.slice(1),
        avatarUrl: `https://api.dicebear.com/7.x/initials/svg?seed=${cleanHandle}&backgroundColor=1e293b,334155&textColor=ffffff`,
        bio: 'Accountability partner.',
        streak: 0,
        longestStreak: 0,
        totalXp: 0,
        pearlBalance: 50,
        streakShields: 1,
        level: 1,
        joinedDate: new Date().toISOString().split('T')[0],
        isOnline: true,
      };
      this.users.push(friendUser);
      localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(this.users));
    }

    // Connect both users as friends
    const today = new Date().toISOString().split('T')[0];
    if (!this.friendships[curUser.id]) this.friendships[curUser.id] = [];
    if (!this.friendships[friendUser.id]) this.friendships[friendUser.id] = [];

    const alreadyFriends = this.friendships[curUser.id].some((f) => f.friendId === friendUser!.id);
    if (alreadyFriends) {
      return { success: true, user: friendUser, message: `@${friendUser.username} is already your friend!` };
    }

    this.friendships[curUser.id].push({ friendId: friendUser.id, status: 'friends', since: today });
    this.friendships[friendUser.id].push({ friendId: curUser.id, status: 'friends', since: today });
    localStorage.setItem(STORAGE_KEYS.FRIENDSHIPS, JSON.stringify(this.friendships));

    this.unlockAchievement(curUser.id, 'ach_first_friend');

    this.notifications.unshift({
      id: `notif_${Date.now()}`,
      userId: curUser.id,
      title: 'New Friend Connected!',
      message: `You are now accountability partners with @${friendUser.username}. Add them to a shared goal!`,
      type: 'social',
      isRead: false,
      timestamp: 'Just now',
    });
    localStorage.setItem(STORAGE_KEYS.NOTIFICATIONS, JSON.stringify(this.notifications));

    this.notify();
    return {
      success: true,
      user: friendUser,
      message: `Connected with @${friendUser.username}! Added to your accountability squad.`,
    };
  }

  public getFriendsForUser(userId?: string): User[] {
    const targetId = userId || this.currentUserId;
    if (!targetId) return [];
    const relations = this.friendships[targetId] || [];
    const friendIds = relations.filter((r) => r.status === 'friends').map((r) => r.friendId);
    return this.users.filter((u) => friendIds.includes(u.id));
  }

  // --- Transactions & Economy ---

  public getXpTransactions(userId?: string): XpTransaction[] {
    const targetId = userId || this.currentUserId;
    if (!targetId) return [];
    return this.xpTransactions.filter((tx) => tx.userId === targetId);
  }

  public getPearlTransactions(userId?: string): PearlTransaction[] {
    const targetId = userId || this.currentUserId;
    if (!targetId) return [];
    return this.pearlTransactions.filter((tx) => tx.userId === targetId);
  }

  public getTransactionsForCurrentUser(): { pearls: PearlTransaction[]; xp: XpTransaction[] } {
    return {
      pearls: this.getPearlTransactions(),
      xp: this.getXpTransactions(),
    };
  }

  private addXpTransaction(userId: string, amount: number, reason: string, goalId?: string) {
    this.xpTransactions.unshift({
      id: `xp_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`,
      userId,
      amount,
      reason,
      timestamp: 'Just now',
      goalId,
    });
    localStorage.setItem(STORAGE_KEYS.XP_TX, JSON.stringify(this.xpTransactions));
  }

  private addPearlTransaction(userId: string, amount: number, reason: string, goalId?: string) {
    this.pearlTransactions.unshift({
      id: `ptx_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`,
      userId,
      amount,
      reason,
      timestamp: 'Just now',
      goalId,
    });
    localStorage.setItem(STORAGE_KEYS.PEARL_TX, JSON.stringify(this.pearlTransactions));
  }

  // --- Achievements ---

  public getUserAchievements(userId?: string): { achievement: Achievement; userAch?: UserAchievement }[] {
    const targetId = userId || this.currentUserId;
    return ACHIEVEMENTS_CATALOG.map((catAch) => {
      const userAch = this.userAchievements.find(
        (ua) => ua.achievementId === catAch.id && ua.userId === targetId
      );
      return {
        achievement: catAch,
        userAch,
      };
    });
  }

  public unlockAchievement(userId: string, achievementId: string): boolean {
    const catalogItem = ACHIEVEMENTS_CATALOG.find((a) => a.id === achievementId);
    if (!catalogItem) return false;

    let userAch = this.userAchievements.find(
      (ua) => ua.achievementId === achievementId && ua.userId === userId
    );

    if (userAch && userAch.unlocked) return false;

    if (!userAch) {
      userAch = {
        achievementId,
        userId,
        unlocked: true,
        unlockedAt: new Date().toISOString().split('T')[0],
        progress: 1,
        maxProgress: 1,
      };
      this.userAchievements.push(userAch);
    } else {
      userAch.unlocked = true;
      userAch.unlockedAt = new Date().toISOString().split('T')[0];
      userAch.progress = userAch.maxProgress || 1;
    }

    localStorage.setItem(STORAGE_KEYS.USER_ACHIEVEMENTS, JSON.stringify(this.userAchievements));

    // Award bonus
    const user = this.getUserById(userId);
    if (user) {
      user.totalXp += catalogItem.xpReward;
      user.pearlBalance += catalogItem.pearlReward;
      this.updateCurrentUser({
        totalXp: user.totalXp,
        pearlBalance: user.pearlBalance,
      });

      this.addXpTransaction(userId, catalogItem.xpReward, `Badge Unlocked: ${catalogItem.title}`);
      this.addPearlTransaction(userId, catalogItem.pearlReward, `Badge Unlocked: ${catalogItem.title}`);

      this.notifications.unshift({
        id: `notif_${Date.now()}`,
        userId,
        title: `Badge Unlocked: ${catalogItem.title}!`,
        message: `+${catalogItem.xpReward} XP & +${catalogItem.pearlReward} Pearls added to your balance.`,
        type: 'achievement',
        isRead: false,
        timestamp: 'Just now',
      });
      localStorage.setItem(STORAGE_KEYS.NOTIFICATIONS, JSON.stringify(this.notifications));
    }

    this.notify();
    return true;
  }

  // --- Notifications ---

  public getNotifications(userId?: string): NotificationItem[] {
    const targetId = userId || this.currentUserId;
    if (!targetId) return [];
    return this.notifications.filter((n) => n.userId === targetId);
  }

  public markNotificationAsRead(id: string): void {
    const notif = this.notifications.find((n) => n.id === id);
    if (notif) {
      notif.isRead = true;
      localStorage.setItem(STORAGE_KEYS.NOTIFICATIONS, JSON.stringify(this.notifications));
      this.notify();
    }
  }

  public markAllNotificationsAsRead(): void {
    this.notifications.forEach((n) => {
      n.isRead = true;
    });
    localStorage.setItem(STORAGE_KEYS.NOTIFICATIONS, JSON.stringify(this.notifications));
    this.notify();
  }

  // --- User Statistics ---

  public getUserStatistics(userId?: string) {
    const uid = userId || this.currentUserId;
    if (!uid) {
      return {
        totalDaysCheckedIn: 0,
        currentStreak: 0,
        longestStreak: 0,
        goalsCompleted: 0,
        goalsCreated: 0,
        totalFriends: 0,
        weeklyChampionWins: 0,
        avgWeeklyContribution: 0,
        totalXpEarned: 0,
        totalPearlsEarned: 0,
      };
    }

    const user = this.getUserById(uid) || {
      streak: 0,
      longestStreak: 0,
      totalXp: 0,
      pearlBalance: 0,
    };
    const userCheckins = this.checkins.filter((c) => c.userId === uid);
    const userGoals = this.goals.filter((g) => g.creatorId === uid);
    const friends = this.getFriendsForUser(uid);
    const weeklyResults = this.weeklyResults.filter((w) => w.championUserId === uid);

    return {
      totalDaysCheckedIn: userCheckins.length,
      currentStreak: user.streak,
      longestStreak: user.longestStreak,
      goalsCompleted: 0,
      goalsCreated: userGoals.length,
      totalFriends: friends.length,
      weeklyChampionWins: weeklyResults.length,
      avgWeeklyContribution: userCheckins.length > 0 ? Math.round(userCheckins.reduce((a, b) => a + b.contributionPercent, 0) / userCheckins.length) : 0,
      totalXpEarned: user.totalXp,
      totalPearlsEarned: user.pearlBalance,
    };
  }

  // --- Streak Protection Shield ---

  public useStreakShield(userId?: string): boolean {
    const targetUserId = userId || this.currentUserId;
    if (!targetUserId) return false;
    const user = this.getUserById(targetUserId);
    if (!user || user.streakShields <= 0) return false;

    user.streakShields -= 1;
    this.updateCurrentUser({ streakShields: user.streakShields });

    this.notifications.unshift({
      id: `notif_${Date.now()}`,
      userId: user.id,
      title: 'Streak Freeze Shield Activated',
      message: 'Your streak was protected from breaking today! 1 shield consumed.',
      type: 'streak',
      isRead: false,
      timestamp: 'Just now',
    });
    localStorage.setItem(STORAGE_KEYS.NOTIFICATIONS, JSON.stringify(this.notifications));
    this.notify();
    return true;
  }

  private calculateContributionScore(
    dailyCompletion: number,
    loggedEffort: number,
    consistency: number,
    goalProg: number
  ): number {
    return Math.round(
      dailyCompletion * 0.4 +
      loggedEffort * 0.3 +
      consistency * 0.2 +
      goalProg * 0.1
    );
  }
}

export const storage = new StorageService();
