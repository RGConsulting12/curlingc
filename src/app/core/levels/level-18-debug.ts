import { ChallengeDefinition } from '../models';

export const level18Challenges: ChallengeDefinition[] = [
  {
    id: 'debug-verbose-01',
    tier: 10,
    title: 'Verbose output',
    prompt: 'Fetch /api/hello with verbose mode to inspect the TLS and request trace.',
    goal: 'GET /api/hello with -v.',
    hints: ['-v shows request and response headers on stderr.', 'Use -v -s together in scripts carefully.'],
    targetPath: '/api/hello',
    expectedMethod: 'GET',
    requiredFlags: ['-v'],
  },
  {
    id: 'debug-writeout-01',
    tier: 10,
    title: 'Write-out format',
    prompt: 'Request /api/hello and include a write-out format for the HTTP code.',
    goal: 'GET /api/hello with -w "%{http_code}".',
    hints: ['-w prints custom info after the transfer.', 'curl -w "%{http_code}" -o /dev/null -s ...'],
    targetPath: '/api/hello',
    expectedMethod: 'GET',
    requiredFlags: ['-w'],
    flagValues: { '-w': '%{http_code}' },
  },
  {
    id: 'debug-output-01',
    tier: 10,
    title: 'Save to file',
    prompt: 'Download /api/hello to hello.json using -o.',
    goal: 'GET /api/hello with -o hello.json',
    hints: ['-o writes the response body to a file.', 'curl -o hello.json ...'],
    targetPath: '/api/hello',
    expectedMethod: 'GET',
    requiredFlags: ['-o'],
    flagValues: { '-o': 'hello.json' },
  },
];
