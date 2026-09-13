import { ChallengeDefinition } from '../models';

export const level14Challenges: ChallengeDefinition[] = [
  {
    id: 'multipart-upload-01',
    tier: 8,
    title: 'Multipart upload',
    prompt: 'Upload a photo field with value sweep.jpg using -F.',
    goal: 'POST /api/upload with -F photo=sweep.jpg',
    hints: ['-F sends multipart/form-data.', 'curl -F "photo=sweep.jpg" ...'],
    targetPath: '/api/upload',
    expectedMethod: 'POST',
    multipartFields: { photo: 'sweep.jpg' },
    requiredFlags: ['-F'],
  },
  {
    id: 'multipart-meta-01',
    tier: 8,
    title: 'Multipart with metadata',
    prompt: 'Upload photo=sweep.jpg and team=skip in one multipart POST.',
    goal: 'POST /api/upload with both form fields.',
    hints: ['Use multiple -F flags.', 'curl -F photo=sweep.jpg -F team=skip ...'],
    targetPath: '/api/upload',
    expectedMethod: 'POST',
    multipartFields: { photo: 'sweep.jpg', team: 'skip' },
  },
];
