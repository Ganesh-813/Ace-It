/**
 * Ace It - Application Data Types & Domain Models
 */

export type FrequencyType = 'daily' | 'weekdays' | 'custom';

export interface User {
  id: string;
  email?: string;
  username: string; // e.g. "ganesh"
  displayName: string;
  avatarUrl: string;
  bio: string;
  streak: number;
  longestStreak: number;
  totalXp: number;
  pearlBalance: number;
  streakShields: number; // streak protections available
  level: number;
  joinedDate: string;
  isOnline?: boolean;
}

export interface GoalMember {
  userId: string;
  goalId: string;
  role: 'owner' | 'member';
  joinedAt: string;
  weeklyContributionPercent: number; // 0-100%
  dailyCheckinsThisWeek: number;
  effortScoreThisWeek: number;
  consistencyScoreThisWeek: number;
  goalProgressScoreThisWeek: number;
  lastCheckInDate?: string;
  hasCheckedInToday?: boolean;
}

export interface Goal {
  id: string;
  title: string;
  description: string;
  category: 'learning' | 'fitness' | 'coding' | 'productivity' | 'mindset' | 'creative';
  creatorId: string;
  streak: number;
  longestStreak: number;
  frequency: FrequencyType;
  durationDays: number;
  startDate: string;
  isArchived: boolean;
  targetMetric?: string;
  targetUnit?: string;
  members: GoalMember[];
}

export interface DailyCheckin {
  id: string;
  goalId: string;
  userId: string;
  date: string; // YYYY-MM-DD
  accomplishedText?: string;
  contributionPercent: number; // 0 - 100
  timeSpentMinutes?: number;
  quantityCompleted?: number;
  quantityUnit?: string;
  reflection?: string;
  hasAttachment?: boolean;
  xpEarned: number;
  pearlsEarned: number;
  timestamp: string;
  minutesLogged?: number;
  unitsCompleted?: number;
  photoProofUrl?: string;
  verifiedByPartner?: boolean;
}

export interface XpTransaction {
  id: string;
  userId: string;
  amount: number;
  reason: string;
  timestamp: string;
  goalId?: string;
}

export interface PearlTransaction {
  id: string;
  userId: string;
  amount: number;
  reason: string;
  timestamp: string;
  goalId?: string;
}

export interface Achievement {
  id: string;
  key: string;
  title: string;
  description: string;
  iconName: string;
  tier: 'bronze' | 'silver' | 'gold' | 'pearl';
  xpReward: number;
  pearlReward: number;
  category: 'streak' | 'social' | 'checkin' | 'weekly' | 'mastery';
}

export interface UserAchievement {
  achievementId: string;
  userId: string;
  unlocked: boolean;
  unlockedAt?: string;
  progress?: number;
  maxProgress?: number;
}

export interface WeeklyResultMember {
  userId: string;
  username: string;
  displayName: string;
  avatarUrl: string;
  contributionPercent: number;
  rank: number;
  xpEarned: number;
  pearlsEarned: number;
  isChampion: boolean;
}

export interface WeeklyResult {
  id: string;
  goalId: string;
  goalTitle: string;
  weekEndingDate: string;
  championUserId: string;
  members: WeeklyResultMember[];
  formula: {
    dailyCompletionWeight: number; // 40%
    loggedEffortWeight: number;    // 30%
    consistencyWeight: number;     // 20%
    goalProgressWeight: number;    // 10%
  };
}

export interface NotificationItem {
  id: string;
  userId: string;
  title: string;
  message: string;
  type: 'streak' | 'friend' | 'checkin' | 'reward' | 'weekly' | 'social' | 'achievement';
  isRead: boolean;
  timestamp: string;
}

export interface FriendRelation {
  friendId: string;
  status: 'friends' | 'pending_sent' | 'pending_received';
  since: string;
}

export interface FriendRequest {
  id: string;
  fromUserId: string;
  toUserId: string;
  status: 'pending' | 'accepted' | 'declined';
  createdAt: string;
}

export type ActiveTab = 'home' | 'goals' | 'friends' | 'leaderboard' | 'profile';
