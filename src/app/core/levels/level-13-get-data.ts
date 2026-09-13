import { Challenge } from '../models';

export const level13Challenges: Challenge[] = [
  {
    id: 'get-data-urlencode-01',
    tier: 7,
    title: 'GET with encoded data',
    prompt: 'Search using -G and -d so the data lands in the query string.',
    goal: 'GET /api/search with q=hello world via -G -d.',
    hints: [
      '-G moves -d data into the URL query string.',
      'curl -G -d "q=hello world" .../api/search',
    ],
    targetPath: '/api/search',
    expectedMethod: 'GET',
    queryParams: { q: 'hello world' },
    requiredFlags: ['-G'],
  },
  {
    id: 'get-data-urlencode-02',
    tier: 7,
    title: 'URL-encoded filter',
    prompt: 'Filter by status=active using -G and --data-urlencode.',
    goal: 'GET /api/search?status=active built with -G.',
    hints: ['--data-urlencode is safer for special characters.', 'Combine -G with -d or --data-urlencode.'],
    targetPath: '/api/search',
    expectedMethod: 'GET',
    queryParams: { status: 'active' },
    requiredFlags: ['-G'],
  },
];
