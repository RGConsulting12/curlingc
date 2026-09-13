import { ChallengeDefinition } from '../models';

export const level12Challenges: ChallengeDefinition[] = [
  {
    id: 'meta-user-agent-01',
    tier: 7,
    title: 'Custom user agent',
    prompt: 'The agent endpoint only trusts the CurlingLab/1.0 user agent.',
    goal: 'GET /api/agent with User-Agent CurlingLab/1.0 using -A.',
    hints: ['-A sets the User-Agent header.', 'curl -A "CurlingLab/1.0" ...'],
    targetPath: '/api/agent',
    expectedMethod: 'GET',
    requiredHeaders: { 'user-agent': 'CurlingLab/1.0' },
    requiredFlags: ['-A'],
  },
  {
    id: 'meta-referer-01',
    tier: 7,
    title: 'Referer header',
    prompt: 'Access the referer check endpoint as if linked from the docs page.',
    goal: 'GET /api/referer with Referer https://curling.lab/docs',
    hints: ['-e sets the Referer header.', 'curl -e "https://curling.lab/docs" ...'],
    targetPath: '/api/referer',
    expectedMethod: 'GET',
    requiredHeaders: { referer: 'https://curling.lab/docs' },
    requiredFlags: ['-e'],
  },
];
