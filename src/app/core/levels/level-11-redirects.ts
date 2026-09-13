import { ChallengeDefinition } from '../models';

export const level11Challenges: ChallengeDefinition[] = [
  {
    id: 'redirect-follow-01',
    tier: 6,
    title: 'Follow redirects',
    prompt: 'The shortcut endpoint redirects. Follow it to reach the final response.',
    goal: 'GET /api/redirect with -L to follow the 302.',
    hints: ['By default curl does not follow redirects.', 'Add -L or --location.'],
    targetPath: '/api/redirect',
    expectedMethod: 'GET',
    requiredFlags: ['-L'],
  },
  {
    id: 'redirect-chain-01',
    tier: 6,
    title: 'Redirect chain',
    prompt: 'The hop endpoint redirects twice. Follow the full chain.',
    goal: 'GET /api/hop with -L.',
    hints: ['-L follows multiple redirects up to a limit.', 'Use -s -L together in scripts.'],
    targetPath: '/api/hop',
    expectedMethod: 'GET',
    requiredFlags: ['-L'],
  },
];
