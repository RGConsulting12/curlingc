import { ChallengeDefinition } from '../models';

export const level03Challenges: ChallengeDefinition[] = [
  {
    id: 'query-search-01',
    tier: 2,
    title: 'Search query',
    prompt: 'Search the catalog for the term "stone".',
    goal: 'GET /api/search?q=stone',
    hints: ['Query strings go after ? in the URL.', 'curl ".../api/search?q=stone"'],
    targetPath: '/api/search',
    expectedMethod: 'GET',
    queryParams: { q: 'stone' },
  },
  {
    id: 'query-pagination-01',
    tier: 2,
    title: 'Pagination',
    prompt: 'Fetch page 2 with a page size of 5.',
    goal: 'GET /api/search?page=2&limit=5',
    hints: ['Combine multiple query params with &.', 'Order of params usually does not matter.'],
    targetPath: '/api/search',
    expectedMethod: 'GET',
    queryParams: { page: '2', limit: '5' },
  },
];
