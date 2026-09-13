import { Challenge } from '../models';

export const level10Challenges: Challenge[] = [
  {
    id: 'cookie-session-01',
    tier: 6,
    title: 'Send a session cookie',
    prompt: 'Access your session with cookie session=abc123.',
    goal: 'GET /api/session/me with the session cookie.',
    hints: ['-b sends cookies.', 'curl -b "session=abc123" ...'],
    targetPath: '/api/session/me',
    expectedMethod: 'GET',
    cookies: { session: 'abc123' },
  },
  {
    id: 'cookie-multi-01',
    tier: 6,
    title: 'Multiple cookies',
    prompt: 'Send session=abc123 and theme=dark together.',
    goal: 'GET /api/session/preferences with both cookies.',
    hints: ['Separate cookies with semicolons in -b.', 'curl -b "session=abc123;theme=dark" ...'],
    targetPath: '/api/session/preferences',
    expectedMethod: 'GET',
    cookies: { session: 'abc123', theme: 'dark' },
  },
];
