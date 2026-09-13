import { Challenge } from '../models';

export const level07Challenges: Challenge[] = [
  {
    id: 'put-item-01',
    tier: 4,
    title: 'Replace a resource',
    prompt: 'Replace item 7 with name "Granite" using PUT and JSON.',
    goal: 'PUT /api/items/7 with {"name":"Granite"}',
    hints: ['Use -X PUT when method is not implied by -d.', 'Include Content-Type: application/json.'],
    targetPath: '/api/items/7',
    expectedMethod: 'PUT',
    requiredHeaders: { 'content-type': 'application/json' },
    bodyJson: { name: 'Granite' },
  },
  {
    id: 'patch-item-01',
    tier: 4,
    title: 'Partial update',
    prompt: 'Patch item 7 to set weight to 42.',
    goal: 'PATCH /api/items/7 with {"weight":42}',
    hints: ['PATCH sends a partial update.', '-X PATCH -d \'{"weight":42}\' ...'],
    targetPath: '/api/items/7',
    expectedMethod: 'PATCH',
    requiredHeaders: { 'content-type': 'application/json' },
    bodyJson: { weight: 42 },
  },
  {
    id: 'delete-item-01',
    tier: 4,
    title: 'Delete a resource',
    prompt: 'Delete item 7 from the API.',
    goal: 'DELETE /api/items/7',
    hints: ['DELETE often has no body.', 'curl -X DELETE ...'],
    targetPath: '/api/items/7',
    expectedMethod: 'DELETE',
    expectStatus: 204,
  },
];
