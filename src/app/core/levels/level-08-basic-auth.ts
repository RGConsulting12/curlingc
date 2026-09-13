import { ChallengeDefinition } from '../models';

export const level08Challenges: ChallengeDefinition[] = [
  {
    id: 'auth-basic-read-01',
    tier: 5,
    title: 'Basic auth read',
    prompt: 'Read the secure vault. Credentials: curl-lab / rocks',
    goal: 'GET /api/secure with basic auth.',
    hints: ['-u user:pass sets Basic authentication.', 'curl -u curl-lab:rocks ...'],
    targetPath: '/api/secure',
    expectedMethod: 'GET',
    basicAuth: { user: 'curl-lab', pass: 'rocks' },
  },
  {
    id: 'auth-basic-write-01',
    tier: 5,
    title: 'Basic auth write',
    prompt: 'POST note=classified to /api/secure using the same credentials.',
    goal: 'POST /api/secure with basic auth and form body.',
    hints: ['Combine -u with -d for authenticated POST.', 'curl -u curl-lab:rocks -d "note=classified" ...'],
    targetPath: '/api/secure',
    expectedMethod: 'POST',
    basicAuth: { user: 'curl-lab', pass: 'rocks' },
    bodyIncludes: ['note=classified'],
  },
];
