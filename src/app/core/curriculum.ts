import { Challenge, Level } from './models';

const helloChallenge: Challenge = {
  id: 'get-hello-01',
  tier: 1,
  title: 'Say hello',
  prompt: 'Fetch the greeting from the mock API.',
  goal: 'GET /api/hello and receive a 200 JSON response.',
  hints: [
    'Start with curl and the full URL.',
    'Add -s to hide the progress meter.',
    'Example: curl -s https://your-app.vercel.app/api/hello',
  ],
  targetPath: '/api/hello',
  expectedMethod: 'GET',
};

const usersChallenge: Challenge = {
  id: 'get-users-01',
  tier: 1,
  title: 'List users',
  prompt: 'Retrieve the user list endpoint.',
  goal: 'GET /api/users.',
  hints: [
    'This is another simple GET.',
    'Use the same host as the hello challenge.',
  ],
  targetPath: '/api/users',
  expectedMethod: 'GET',
};

const jsonHeaderChallenge: Challenge = {
  id: 'get-json-header-01',
  tier: 2,
  title: 'Ask for JSON',
  prompt: 'The API prefers clients that send Accept: application/json.',
  goal: 'GET /api/profile with an Accept header.',
  hints: [
    'Use -H to send a header.',
    'curl -H "Accept: application/json" ...',
  ],
  targetPath: '/api/profile',
  expectedMethod: 'GET',
  requiredHeaders: { accept: 'application/json' },
};

export const levels: Level[] = [
  {
    id: 'first-curl',
    title: 'First curl',
    ribbonTitle: 'GET',
    description: 'Your first GET requests — no flags required.',
    emoji: '🥌',
    challenges: [helloChallenge, usersChallenge],
  },
  {
    id: 'headers',
    title: 'Headers',
    ribbonTitle: 'Headers',
    description: 'Tell the server what format you want back.',
    emoji: '📨',
    challenges: [jsonHeaderChallenge],
  },
];

export function getLevel(id: string): Level {
  return levels.find((level) => level.id === id) ?? levels[0]!;
}

export function getChallenge(id: string): Challenge | undefined {
  for (const level of levels) {
    const match = level.challenges.find((challenge) => challenge.id === id);
    if (match) {
      return match;
    }
  }
  return undefined;
}

export function nextChallenge(id: string): Challenge | null {
  const flat = levels.flatMap((level) => level.challenges);
  const index = flat.findIndex((challenge) => challenge.id === id);
  return index >= 0 && index < flat.length - 1 ? flat[index + 1]! : null;
}
