import { Challenge } from '../models';

export const level17Challenges: Challenge[] = [
  {
    id: 'perf-max-time-01',
    tier: 9,
    title: 'Request timeout',
    prompt: 'Call /api/slow with a 10 second max time limit.',
    goal: 'GET /api/slow with --max-time 10',
    hints: ['--max-time caps how long curl waits.', 'curl --max-time 10 ...'],
    targetPath: '/api/slow',
    expectedMethod: 'GET',
    flagValues: { '--max-time': '10' },
  },
  {
    id: 'perf-compressed-01',
    tier: 9,
    title: 'Compressed response',
    prompt: 'Request /api/stats with compression enabled.',
    goal: 'GET /api/stats with --compressed',
    hints: [
      '--compressed asks for gzip/deflate and decompresses output.',
      'curl --compressed ...',
    ],
    targetPath: '/api/stats',
    expectedMethod: 'GET',
    requiredFlags: ['--compressed'],
  },
  {
    id: 'perf-retry-01',
    tier: 9,
    title: 'Retry on failure',
    prompt: 'Hit the flaky endpoint with 3 retries configured.',
    goal: 'GET /api/flaky with --retry 3',
    hints: ['--retry re-attempts transient failures.', 'curl --retry 3 ...'],
    targetPath: '/api/flaky',
    expectedMethod: 'GET',
    flagValues: { '--retry': '3' },
  },
];
