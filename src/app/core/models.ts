export type HttpMethod = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE' | 'HEAD' | 'OPTIONS';

export type ChallengeCategory =
  | 'curl'
  | 'files'
  | 'search'
  | 'text'
  | 'networking'
  | 'system'
  | 'pipelines'
  | 'challenges';

export type ChallengeKind = 'curl' | 'shell';

export type ChallengeHelp = {
  explanation: string;
  example: string;
  commentary: string;
  docUrl: string;
  docLabel: string;
};

export type ShellValidationMode = 'exact' | 'contains' | 'lines' | 'regex';

export type ShellChallengeSpec = {
  /** Simulated working directory for relative paths */
  cwd?: string;
  /** Expected stdout after trimming trailing newline(s) */
  expectedStdout?: string;
  /** Each string must appear somewhere in stdout */
  expectedStdoutContains?: string[];
  /** Each line must appear in stdout (order-independent unless orderedLines is true) */
  expectedStdoutLines?: string[];
  /** When true, expectedStdoutLines must match in order */
  orderedLines?: boolean;
  /** Regex test against stdout */
  expectedStdoutPattern?: string;
  validationMode?: ShellValidationMode;
  /** Show per-stage pipeline I/O in the UI */
  showPipeline?: boolean;
  /** Required substrings in the user's command (teaching specific flags) */
  commandIncludes?: string[];
  /** Blocked patterns — reject before execution */
  forbiddenPatterns?: string[];
};

export type ChallengeDefinition = {
  id: string;
  kind?: ChallengeKind;
  category?: ChallengeCategory;
  tier: number;
  title: string;
  prompt: string;
  goal: string;
  hints: string[];
  /** curl challenges */
  targetPath?: string;
  expectedMethod?: HttpMethod;
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
  /** shell / pipeline challenges */
  shell?: ShellChallengeSpec;
};

export type Challenge = ChallengeDefinition & {
  kind: ChallengeKind;
  category: ChallengeCategory;
  help: ChallengeHelp;
};

export type Level = {
  id: string;
  title: string;
  ribbonTitle: string;
  description: string;
  emoji: string;
  category: ChallengeCategory;
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

export const CATEGORY_LABELS: Record<ChallengeCategory, string> = {
  curl: 'Curl',
  files: 'Files',
  search: 'Search',
  text: 'Text Processing',
  networking: 'Networking',
  system: 'System',
  pipelines: 'Pipelines',
  challenges: 'Challenges',
};

export const CATEGORY_ORDER: ChallengeCategory[] = [
  'curl',
  'files',
  'search',
  'text',
  'networking',
  'system',
  'pipelines',
  'challenges',
];

export function challengeKind(def: ChallengeDefinition): ChallengeKind {
  return def.kind ?? (def.shell ? 'shell' : 'curl');
}

export function challengeCategory(def: ChallengeDefinition): ChallengeCategory {
  return def.category ?? (challengeKind(def) === 'shell' ? 'files' : 'curl');
}
