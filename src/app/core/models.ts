export type ChallengeTier = 1 | 2 | 3 | 4 | 5;

export type Challenge = {
  id: string;
  tier: ChallengeTier;
  title: string;
  prompt: string;
  goal: string;
  hints: string[];
  /** Paths relative to the mock API base (e.g. /api/hello). */
  targetPath: string;
  expectedMethod: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';
  requiredHeaders?: Record<string, string>;
};

export type Level = {
  id: string;
  title: string;
  ribbonTitle: string;
  description: string;
  emoji: string;
  challenges: Challenge[];
};

export type ProfileProgress = {
  completedChallengeIds: string[];
  currentChallengeId: string;
  hintsUsed: Record<string, number>;
  attempts: Record<string, number>;
};

export type UserProfile = {
  id: string;
  displayName: string;
  createdAt: string;
  progress: ProfileProgress;
};

export const STORAGE_KEY = 'curling:profiles';
export const ACTIVE_PROFILE_KEY = 'curling:active-profile-id';
