import { ChallengeDefinition } from '../models';

export const level02Challenges: ChallengeDefinition[] = [
  {
    id: 'header-accept-01',
    tier: 2,
    title: 'Ask for JSON',
    prompt: 'The profile endpoint expects clients to request JSON explicitly.',
    goal: 'GET /api/profile with Accept: application/json.',
    hints: ['Use -H to send a header.', 'curl -H "Accept: application/json" ...'],
    targetPath: '/api/profile',
    expectedMethod: 'GET',
    requiredHeaders: { accept: 'application/json' },
  },
  {
    id: 'header-custom-01',
    tier: 2,
    title: 'Custom lab header',
    prompt: 'The lab client endpoint only responds to registered clients.',
    goal: 'GET /api/lab-client with X-Lab-Client: curling.',
    hints: ['Custom headers use the same -H flag.', 'Header names are case-insensitive.'],
    targetPath: '/api/lab-client',
    expectedMethod: 'GET',
    requiredHeaders: { 'x-lab-client': 'curling' },
  },
];
