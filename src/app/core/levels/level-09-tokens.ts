import { ChallengeDefinition } from '../models';

export const level09Challenges: ChallengeDefinition[] = [
  {
    id: 'auth-bearer-01',
    tier: 5,
    title: 'Bearer token',
    prompt: 'Access the admin endpoint with bearer token lab-token-42.',
    goal: 'GET /api/admin with Authorization: Bearer lab-token-42',
    hints: [
      'Bearer tokens go in the Authorization header.',
      'curl -H "Authorization: Bearer lab-token-42" ...',
    ],
    targetPath: '/api/admin',
    expectedMethod: 'GET',
    bearerToken: 'lab-token-42',
  },
  {
    id: 'auth-api-key-01',
    tier: 5,
    title: 'API key header',
    prompt: 'Call the metrics endpoint with API key lab-key-99.',
    goal: 'GET /api/metrics with X-API-Key: lab-key-99',
    hints: ['Some APIs use X-API-Key instead of Bearer.', 'curl -H "X-API-Key: lab-key-99" ...'],
    targetPath: '/api/metrics',
    expectedMethod: 'GET',
    apiKey: 'lab-key-99',
  },
];
