import { ChallengeDefinition } from '../models';

export const level01Challenges: ChallengeDefinition[] = [
  {
    id: 'get-hello-01',
    tier: 1,
    title: 'Say hello',
    prompt: 'Fetch the greeting from the mock API.',
    goal: 'GET /api/hello and receive a 200 JSON response.',
    hints: ['Start with curl and the URL.', 'Add -s to hide the progress meter.'],
    targetPath: '/api/hello',
    expectedMethod: 'GET',
  },
  {
    id: 'get-users-01',
    tier: 1,
    title: 'List users',
    prompt: 'Retrieve the user list endpoint.',
    goal: 'GET /api/users.',
    hints: ['Another simple GET request.', 'Use -s for cleaner output.'],
    targetPath: '/api/users',
    expectedMethod: 'GET',
  },
];
