import { Challenge, Level } from './models';
import { level01Challenges } from './levels/level-01-get';
import { level02Challenges } from './levels/level-02-headers';
import { level03Challenges } from './levels/level-03-query';
import { level04Challenges } from './levels/level-04-output';
import { level05Challenges } from './levels/level-05-post-form';
import { level06Challenges } from './levels/level-06-json';
import { level07Challenges } from './levels/level-07-rest';
import { level08Challenges } from './levels/level-08-basic-auth';
import { level09Challenges } from './levels/level-09-tokens';
import { level10Challenges } from './levels/level-10-cookies';
import { level11Challenges } from './levels/level-11-redirects';
import { level12Challenges } from './levels/level-12-metadata';
import { level13Challenges } from './levels/level-13-get-data';
import { level14Challenges } from './levels/level-14-multipart';
import { level15Challenges } from './levels/level-15-graphql';
import { level16Challenges } from './levels/level-16-conditional';
import { level17Challenges } from './levels/level-17-performance';
import { level18Challenges } from './levels/level-18-debug';
import { level19Challenges } from './levels/level-19-options';
import { level20Challenges } from './levels/level-20-boss';

export const levels: Level[] = [
  {
    id: 'first-curl',
    title: 'First curl',
    ribbonTitle: 'GET',
    description: 'Your first GET requests — no flags required.',
    emoji: '🥌',
    challenges: level01Challenges,
  },
  {
    id: 'headers',
    title: 'Headers',
    ribbonTitle: 'Headers',
    description: 'Send and negotiate headers with -H.',
    emoji: '📨',
    challenges: level02Challenges,
  },
  {
    id: 'query-strings',
    title: 'Query strings',
    ribbonTitle: 'Query',
    description: 'Filter and paginate with URL parameters.',
    emoji: '🔎',
    challenges: level03Challenges,
  },
  {
    id: 'output-flags',
    title: 'Output flags',
    ribbonTitle: 'Output',
    description: 'Silent mode and HEAD requests with -s and -I.',
    emoji: '🔇',
    challenges: level04Challenges,
  },
  {
    id: 'post-form',
    title: 'POST form data',
    ribbonTitle: 'Forms',
    description: 'Submit forms with -d.',
    emoji: '📝',
    challenges: level05Challenges,
  },
  {
    id: 'post-json',
    title: 'JSON bodies',
    ribbonTitle: 'JSON',
    description: 'POST JSON APIs with Content-Type and -d.',
    emoji: '🧾',
    challenges: level06Challenges,
  },
  {
    id: 'rest-verbs',
    title: 'REST verbs',
    ribbonTitle: 'REST',
    description: 'PUT, PATCH, and DELETE resources.',
    emoji: '🔧',
    challenges: level07Challenges,
  },
  {
    id: 'basic-auth',
    title: 'Basic auth',
    ribbonTitle: 'Basic',
    description: 'Authenticate with -u user:pass.',
    emoji: '🔐',
    challenges: level08Challenges,
  },
  {
    id: 'tokens',
    title: 'Tokens & API keys',
    ribbonTitle: 'Tokens',
    description: 'Bearer tokens and X-API-Key headers.',
    emoji: '🎫',
    challenges: level09Challenges,
  },
  {
    id: 'cookies',
    title: 'Cookies',
    ribbonTitle: 'Cookies',
    description: 'Send session state with -b.',
    emoji: '🍪',
    challenges: level10Challenges,
  },
  {
    id: 'redirects',
    title: 'Redirects',
    ribbonTitle: 'Redirect',
    description: 'Follow 3xx responses with -L.',
    emoji: '↪️',
    challenges: level11Challenges,
  },
  {
    id: 'client-metadata',
    title: 'Client metadata',
    ribbonTitle: 'Metadata',
    description: 'User-Agent and Referer with -A and -e.',
    emoji: '🪪',
    challenges: level12Challenges,
  },
  {
    id: 'get-with-data',
    title: 'GET with data',
    ribbonTitle: 'GET -d',
    description: 'Move POST data into the query string with -G.',
    emoji: '🔗',
    challenges: level13Challenges,
  },
  {
    id: 'multipart',
    title: 'Multipart upload',
    ribbonTitle: 'Upload',
    description: 'Upload files and fields with -F.',
    emoji: '📎',
    challenges: level14Challenges,
  },
  {
    id: 'graphql',
    title: 'GraphQL',
    ribbonTitle: 'GraphQL',
    description: 'Query and mutate via JSON POST.',
    emoji: '◈',
    challenges: level15Challenges,
  },
  {
    id: 'conditional',
    title: 'Conditional requests',
    ribbonTitle: 'Cache',
    description: 'ETags and byte ranges.',
    emoji: '⚡',
    challenges: level16Challenges,
  },
  {
    id: 'performance',
    title: 'Performance flags',
    ribbonTitle: 'Perf',
    description: 'Timeouts, compression, and retries.',
    emoji: '⏱️',
    challenges: level17Challenges,
  },
  {
    id: 'debug',
    title: 'Debug & output',
    ribbonTitle: 'Debug',
    description: 'Verbose mode, write-out, and save to file.',
    emoji: '🐛',
    challenges: level18Challenges,
  },
  {
    id: 'options-proxy',
    title: 'OPTIONS & proxy',
    ribbonTitle: 'OPTIONS',
    description: 'Method discovery and proxy flags.',
    emoji: '🛰️',
    challenges: level19Challenges,
  },
  {
    id: 'boss',
    title: 'Expert bosses',
    ribbonTitle: 'Boss',
    description: 'Multi-step combos mirroring real incident response.',
    emoji: '🏆',
    challenges: level20Challenges,
  },
];

export const allChallenges: Challenge[] = levels.flatMap((level) => level.challenges);

export function getLevel(id: string): Level {
  return levels.find((level) => level.id === id) ?? levels[0]!;
}

export function getChallenge(id: string): Challenge | undefined {
  return allChallenges.find((challenge) => challenge.id === id);
}

export function nextChallenge(id: string): Challenge | null {
  const index = allChallenges.findIndex((challenge) => challenge.id === id);
  return index >= 0 && index < allChallenges.length - 1 ? allChallenges[index + 1]! : null;
}

export function tierLabel(tier: number): string {
  if (tier <= 2) return 'Beginner';
  if (tier <= 4) return 'Intermediate';
  if (tier <= 7) return 'Advanced';
  if (tier <= 9) return 'Professional';
  return 'Expert';
}
