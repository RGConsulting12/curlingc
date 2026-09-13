import { Challenge } from '../models';

export const level20Challenges: Challenge[] = [
  {
    id: 'boss-webhook-01',
    tier: 10,
    title: 'Webhook delivery',
    prompt: 'Deliver a webhook: POST JSON event=score to /api/webhook with bearer lab-token-42.',
    goal: 'Authenticated JSON POST to the webhook endpoint.',
    hints: [
      'Combine -H Authorization, -H Content-Type, and -d.',
      'curl -H "Authorization: Bearer lab-token-42" -H "Content-Type: application/json" -d \'{"event":"score"}\' ...',
    ],
    targetPath: '/api/webhook',
    expectedMethod: 'POST',
    bearerToken: 'lab-token-42',
    requiredHeaders: { 'content-type': 'application/json' },
    bodyJson: { event: 'score' },
  },
  {
    id: 'boss-incident-01',
    tier: 10,
    title: 'Incident response',
    prompt: 'The incident endpoint needs basic auth, a session cookie, and query incident=42.',
    goal: 'GET /api/incident?incident=42 with auth and cookie.',
    hints: [
      'Stack -u, -b, and query params in one command.',
      'curl -u curl-lab:rocks -b "session=abc123" ".../api/incident?incident=42"',
    ],
    targetPath: '/api/incident',
    expectedMethod: 'GET',
    queryParams: { incident: '42' },
    basicAuth: { user: 'curl-lab', pass: 'rocks' },
    cookies: { session: 'abc123' },
  },
  {
    id: 'boss-pipeline-01',
    tier: 10,
    title: 'Full pipeline',
    prompt: 'Follow the pipeline redirect, send JSON, and authenticate: POST to /api/pipeline with -L, bearer lab-token-42, body action=deploy.',
    goal: 'Expert combo: redirect follow + bearer + JSON POST.',
    hints: [
      'This challenge needs -L, Bearer auth, and JSON.',
      'curl -L -X POST -H "Authorization: Bearer lab-token-42" -H "Content-Type: application/json" -d \'{"action":"deploy"}\' .../api/pipeline',
    ],
    targetPath: '/api/pipeline',
    expectedMethod: 'POST',
    bearerToken: 'lab-token-42',
    requiredHeaders: { 'content-type': 'application/json' },
    bodyJson: { action: 'deploy' },
    requiredFlags: ['-L'],
  },
];
