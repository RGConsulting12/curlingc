export type HttpMethod = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE' | 'HEAD' | 'OPTIONS';

export type ChallengeHelp = {
  explanation: string;
  example: string;
  commentary: string;
  docUrl: string;
  docLabel: string;
};

export type ChallengeDefinition = {
  id: string;
  tier: number;
  title: string;
  prompt: string;
  goal: string;
  hints: string[];
  targetPath: string;
  expectedMethod: HttpMethod;
  requiredHeaders?: Record<string, string>;
  queryParams?: Record<string, string>;
  bodyIncludes?: string[];
  bodyJson?: Record<string, unknown>;
  basicAuth?: { user: string; pass: string };
  bearerToken?: string;
  apiKey?: string;
  cookies?: Record<string, string>;
  requiredFlags?: string[];
  flagValues?: Record<string, string>;
  expectStatus?: number;
  multipartFields?: Record<string, string>;
};

export type Challenge = ChallengeDefinition & {
  help: ChallengeHelp;
};

export type Level = {
  id: string;
  title: string;
  ribbonTitle: string;
  description: string;
  emoji: string;
  challenges: ChallengeDefinition[];
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
