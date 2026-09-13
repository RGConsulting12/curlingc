import { ChallengeDefinition } from '../models';

export const level15Challenges: ChallengeDefinition[] = [
  {
    id: 'graphql-query-01',
    tier: 8,
    title: 'GraphQL query',
    prompt: 'Query the stones field via the GraphQL endpoint.',
    goal: 'POST /api/graphql with a query for stones.',
    hints: [
      'GraphQL uses POST with a JSON body.',
      'Body should include "query" mentioning stones.',
    ],
    targetPath: '/api/graphql',
    expectedMethod: 'POST',
    requiredHeaders: { 'content-type': 'application/json' },
    bodyIncludes: ['stones'],
  },
  {
    id: 'graphql-mutation-01',
    tier: 8,
    title: 'GraphQL mutation',
    prompt: 'Run a mutation to set the skip name to "Nova".',
    goal: 'POST /api/graphql with mutation and name Nova.',
    hints: ['Mutations are still POST requests.', 'Include mutation and Nova in the JSON body.'],
    targetPath: '/api/graphql',
    expectedMethod: 'POST',
    requiredHeaders: { 'content-type': 'application/json' },
    bodyIncludes: ['mutation', 'Nova'],
  },
];
