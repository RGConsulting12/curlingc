import { Challenge } from '../models';

export const level19Challenges: Challenge[] = [
  {
    id: 'method-options-01',
    tier: 10,
    title: 'OPTIONS probe',
    prompt: 'Discover allowed methods on /api/resources using OPTIONS.',
    goal: 'OPTIONS /api/resources',
    hints: ['OPTIONS reveals CORS and allowed verbs.', 'curl -X OPTIONS ...'],
    targetPath: '/api/resources',
    expectedMethod: 'OPTIONS',
  },
  {
    id: 'method-proxy-flag-01',
    tier: 10,
    title: 'Proxy flag awareness',
    prompt: 'Request /api/hello through a proxy flag (lab accepts any proxy value).',
    goal: 'GET /api/hello with -x http://proxy.lab:8080',
    hints: [
      '-x routes traffic through a proxy.',
      'In production, verify proxy trust boundaries.',
    ],
    targetPath: '/api/hello',
    expectedMethod: 'GET',
    requiredFlags: ['-x'],
    flagValues: { '-x': 'http://proxy.lab:8080' },
  },
];
