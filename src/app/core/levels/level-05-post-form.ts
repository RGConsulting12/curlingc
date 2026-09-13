import { Challenge } from '../models';

export const level05Challenges: Challenge[] = [
  {
    id: 'post-login-01',
    tier: 3,
    title: 'Form login',
    prompt: 'Log in with username admin and password secret using form data.',
    goal: 'POST /api/login with user=admin&pass=secret',
    hints: ['-d sends POST data.', 'curl -d "user=admin&pass=secret" ...'],
    targetPath: '/api/login',
    expectedMethod: 'POST',
    bodyIncludes: ['user=admin', 'pass=secret'],
  },
  {
    id: 'post-echo-01',
    tier: 3,
    title: 'Echo form field',
    prompt: 'POST a message field with value "sweep" to the echo endpoint.',
    goal: 'POST /api/echo with message=sweep',
    hints: ['Form bodies use application/x-www-form-urlencoded by default.', '-d implies POST unless you override with -X.'],
    targetPath: '/api/echo',
    expectedMethod: 'POST',
    bodyIncludes: ['message=sweep'],
  },
];
