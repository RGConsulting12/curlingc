import { ChallengeDefinition } from '../models';

export const level16Challenges: ChallengeDefinition[] = [
  {
    id: 'conditional-etag-01',
    tier: 9,
    title: 'ETag cache hit',
    prompt: 'The cache endpoint returns 304 when If-None-Match matches. Use ETag "v1".',
    goal: 'GET /api/cache with If-None-Match: "v1" and expect 304.',
    hints: [
      'Conditional requests save bandwidth.',
      'curl -H \'If-None-Match: "v1"\' ...',
    ],
    targetPath: '/api/cache',
    expectedMethod: 'GET',
    requiredHeaders: { 'if-none-match': '"v1"' },
    expectStatus: 304,
  },
  {
    id: 'conditional-range-01',
    tier: 9,
    title: 'Range request',
    prompt: 'Fetch only the first 4 bytes of /api/range.',
    goal: 'GET /api/range with Range: bytes=0-3',
    hints: ['Range requests return partial content (206).', 'curl -H "Range: bytes=0-3" ...'],
    targetPath: '/api/range',
    expectedMethod: 'GET',
    requiredHeaders: { range: 'bytes=0-3' },
    expectStatus: 206,
  },
];
