import { ChallengeDefinition } from '../models';

export const cliSearchChallenges: ChallengeDefinition[] = [
  {
    id: 'cli-grep-01',
    kind: 'shell',
    category: 'search',
    tier: 2,
    title: 'Filter with grep',
    prompt: 'Find all measurements for portal-a.',
    goal: 'Use grep portal-a latency.csv.',
    hints: ['grep prints lines matching a pattern.', 'No pipes yet — grep reads the file directly.'],
    shell: {
      commandIncludes: ['grep', 'portal-a'],
      expectedStdoutContains: ['portal-a,31.2,35.6', 'portal-a,45.2,52.8'],
      validationMode: 'contains',
    },
  },
  {
    id: 'cli-grep-02',
    kind: 'shell',
    category: 'search',
    tier: 2,
    title: 'Invert a grep match',
    prompt: 'Show lines that are NOT for portal-c.',
    goal: 'Use grep -v portal-c latency.csv.',
    hints: ['-v inverts the match.', 'Useful to exclude noisy endpoints.'],
    shell: {
      commandIncludes: ['grep', '-v'],
      expectedStdoutContains: ['portal-a', 'portal-b'],
      validationMode: 'contains',
    },
  },
  {
    id: 'cli-find-01',
    kind: 'shell',
    category: 'search',
    tier: 3,
    title: 'Find files by name',
    prompt: 'Locate CSV files under the lab directory.',
    goal: 'Use find . -name "*.csv".',
    hints: ['find walks directories.', '-name accepts shell globs.'],
    shell: {
      commandIncludes: ['find'],
      expectedStdoutContains: ['latency.csv'],
      validationMode: 'contains',
    },
  },
];
