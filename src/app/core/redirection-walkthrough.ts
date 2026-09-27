export type RedirectionExample = {
  id: string;
  title: string;
  situation: string;
  command: string;
  flow: string;
  onRealLinux: string;
  inThisLab: string;
};

export const redirectionIntro =
  'This lab does not execute redirection — you cannot type `>` or `<` here. Read through these examples to see what would happen on a real constrained Linux host. Use pipes (`|`) in exercises below.';

export const redirectionExamples: RedirectionExample[] = [
  {
    id: 'write-stdout',
    title: 'Write stdout to a file (`>`)',
    situation: 'Save filtered rows for later analysis without re-running grep.',
    command: 'grep portal-a latency.csv > portal-a-only.csv',
    flow: 'grep stdout ──> portal-a-only.csv\n(screen is quiet — nothing printed)',
    onRealLinux:
      'Creates or overwrites portal-a-only.csv with matching lines only. If the file existed, previous contents are replaced.',
    inThisLab: 'Run `grep portal-a latency.csv` and read the output panel. On a real host you would add `> portal-a-only.csv` to keep it.',
  },
  {
    id: 'append',
    title: 'Append stdout to a file (`>>`)',
    situation: 'Add one monitoring observation to a growing CSV without erasing history.',
    command: 'echo "2026-09-27T13:00:00,portal-a,31.0,35.4,40.2,190,200" >> observations.csv',
    flow: 'echo stdout ──>> observations.csv\n(existing lines stay; new line added at end)',
    onRealLinux:
      'Appends a single line to observations.csv. Safe for log-style growth — unlike `>`, nothing is wiped.',
    inThisLab:
      'The capstone describes this pattern in a Bash monitor script. Here, inspect `latency.csv` as the sample history instead of appending.',
  },
  {
    id: 'read-stdin',
    title: 'Read a file as stdin (`<`)',
    situation: 'Feed a file to a command that normally reads from the keyboard or pipe.',
    command: 'wc -l < latency.csv',
    flow: 'latency.csv ──> wc -l\n(same result as: wc -l latency.csv)',
    onRealLinux:
      'Opens latency.csv as standard input for wc. Useful when a command has no filename argument but accepts stdin.',
    inThisLab: 'Use `wc -l latency.csv` or `cat latency.csv | wc -l` — both work in the simulator.',
  },
  {
    id: 'write-input',
    title: 'Write from a file into another (`<` and `>` together)',
    situation: 'Copy a subset of data into a new report file without using cat.',
    command: 'grep portal-b latency.csv > portal-b-report.csv',
    flow: 'latency.csv ──grep──> stdout ──> portal-b-report.csv',
    onRealLinux:
      'Reads the source file through grep and writes matches only to portal-b-report.csv. Combines read + write in one step.',
    inThisLab: 'Chain with a pipe instead: `grep portal-b latency.csv | head` and read the combined output.',
  },
  {
    id: 'discard',
    title: 'Discard body, keep metrics (`> /dev/null`)',
    situation: 'Measure HTTP timing without printing the HTML body.',
    command: "curl -o /dev/null -s -w '%{http_code},%{time_total}\\n' https://portal-a.example.com",
    flow: 'HTTP body ──> /dev/null (discarded)\nwrite-out ──> screen: 200,0.182',
    onRealLinux:
      '/dev/null is a sink — data written there disappears. `-w` still prints timing and status to stdout.',
    inThisLab:
      'Try the Network track curl timing challenge — the simulator returns the same `200,0.182` line without a real download.',
  },
  {
    id: 'stderr-file',
    title: 'Capture errors only (`2>`)',
    situation: 'Keep normal output on screen but log failures separately.',
    command: 'ping -c 3 bad.example.com 2> ping-errors.log',
    flow: 'stdout (replies) ──> screen\nstderr (unknown host) ──> ping-errors.log',
    onRealLinux:
      'File descriptor 2 is stderr. Only error messages land in ping-errors.log; successful ping lines still print.',
    inThisLab: 'Not simulated. Remember: exit codes and stderr matter when automating checks on a real server.',
  },
  {
    id: 'stderr-merge',
    title: 'Merge stderr into stdout (`2>&1`)',
    situation: 'Search both normal output and errors with one grep.',
    command: 'ping -c 3 portal-a.example.com 2>&1 | grep "packet loss"',
    flow: 'ping stdout ──┐\n              ├──> grep ──> matching lines\nping stderr ──┘',
    onRealLinux:
      '`2>&1` means “send stderr to wherever stdout is going” — here, into the pipe so grep sees everything.',
    inThisLab: 'Use pipes between whitelisted commands, e.g. `grep portal-a latency.csv | awk -F, \'{print $4}\'`.',
  },
  {
    id: 'monitor-script',
    title: 'Read list + append observation (monitor script)',
    situation: 'Automate latency collection: read endpoints, probe each, append one CSV row.',
    command: `while read url; do
  host=$(echo "$url" | sed 's|https://||')
  ping -c 3 "$host" | tail -1 >> ping.log
  curl -o /dev/null -s -w "%{http_code},%{time_total}\\n" "$url" >> http.log
done < endpoints.txt`,
    flow: 'endpoints.txt ──read──> loop ──append──> ping.log / http.log',
    onRealLinux:
      '`< endpoints.txt` drives the loop. `>>` accumulates results. No Python or database required — stock CLI only.',
    inThisLab:
      'Walk the capstone track step by step (endpoints → ping → curl → grep/awk on latency.csv) to learn the same workflow interactively.',
  },
];
