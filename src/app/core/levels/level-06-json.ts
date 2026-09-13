import { Challenge } from '../models';

export const level06Challenges: Challenge[] = [
  {
    id: 'post-json-create-01',
    tier: 4,
    title: 'Create a resource',
    prompt: 'Create a stone resource named "Blue" via JSON.',
    goal: 'POST /api/resources with JSON {"name":"Blue","weight":20}',
    hints: [
      'Set Content-Type: application/json.',
      'curl -H "Content-Type: application/json" -d \'{"name":"Blue","weight":20}\' ...',
    ],
    targetPath: '/api/resources',
    expectedMethod: 'POST',
    requiredHeaders: { 'content-type': 'application/json' },
    bodyJson: { name: 'Blue', weight: 20 },
    expectStatus: 201,
  },
  {
    id: 'post-json-update-01',
    tier: 4,
    title: 'JSON patch payload',
    prompt: 'Send a JSON body to echo that sets status to ready.',
    goal: 'POST /api/echo/json with {"status":"ready"}',
    hints: ['JSON bodies need Content-Type: application/json.', 'Quote JSON carefully in your shell.'],
    targetPath: '/api/echo/json',
    expectedMethod: 'POST',
    requiredHeaders: { 'content-type': 'application/json' },
    bodyJson: { status: 'ready' },
  },
];
