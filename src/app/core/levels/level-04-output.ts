import { Challenge } from '../models';

export const level04Challenges: Challenge[] = [
  {
    id: 'flag-silent-01',
    tier: 3,
    title: 'Silent mode',
    prompt: 'Fetch hello again, but use silent mode so curl hides the progress meter.',
    goal: 'GET /api/hello with the -s flag.',
    hints: ['-s is short for --silent.', 'Flags can appear before or after the URL.'],
    targetPath: '/api/hello',
    expectedMethod: 'GET',
    requiredFlags: ['-s'],
  },
  {
    id: 'flag-head-01',
    tier: 3,
    title: 'Headers only',
    prompt: 'Check the health endpoint headers without downloading a body.',
    goal: 'HEAD /api/health using -I.',
    hints: ['-I sends a HEAD request.', 'Equivalent to curl -X HEAD ...'],
    targetPath: '/api/health',
    expectedMethod: 'HEAD',
    requiredFlags: ['-I'],
  },
];
