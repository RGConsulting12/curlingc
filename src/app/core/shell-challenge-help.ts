import { ChallengeHelp } from './models';

export const shellChallengeHelp: Record<string, ChallengeHelp> = {
  'cli-cat-01': {
    explanation:
      'cat (concatenate) reads files and writes their contents to stdout. It is one of the simplest ways to inspect configuration, logs, or CSV data on a constrained Linux host.',
    example: 'cat latency.csv',
    commentary:
      'On real systems cat is often the first step before grep, awk, or sort. It does not paginate — use less for long files.',
    docUrl: 'https://man7.org/linux/man-pages/man1/cat.1.html',
    docLabel: 'cat(1) manual',
  },
  'cli-head-01': {
    explanation: 'head prints the first N lines of a file. head -n 2 shows the header row plus one data row — useful for quick previews.',
    example: 'head -n 2 latency.csv',
    commentary: 'Pair head with wc -l to sanity-check file size before heavy processing.',
    docUrl: 'https://man7.org/linux/man-pages/man1/head.1.html',
    docLabel: 'head(1) manual',
  },
  'cli-tail-01': {
    explanation: 'tail prints the last N lines — ideal for recent log entries or the latest measurements in a growing CSV.',
    example: 'tail -n 3 latency.csv',
    commentary: 'tail -n +2 starts at line 2 (skipping a header). tail -f follows live logs.',
    docUrl: 'https://man7.org/linux/man-pages/man1/tail.1.html',
    docLabel: 'tail(1) manual',
  },
  'cli-wc-01': {
    explanation: 'wc (word count) with -l counts lines. Include the header when counting CSV rows unless you skip it deliberately.',
    example: 'wc -l latency.csv',
    commentary: 'wc -w counts words; wc -c counts bytes. Pipelines often use wc -l to verify filter results.',
    docUrl: 'https://man7.org/linux/man-pages/man1/wc.1.html',
    docLabel: 'wc(1) manual',
  },
  'cli-less-01': {
    explanation:
      'less is a pager — it shows one screen at a time and lets you scroll/search. This lab simulates the first screen only.',
    example: 'less latency.log',
    commentary: 'Unlike cat, less does not dump the entire file at once. Press / to search in real less.',
    docUrl: 'https://man7.org/linux/man-pages/man1/less.1.html',
    docLabel: 'less(1) manual',
  },
  'cli-cut-01': {
    explanation: 'cut extracts columns from delimited text. -d, sets comma delimiter; -f2 selects the endpoint column in latency.csv.',
    example: 'cut -d, -f2 latency.csv',
    commentary: 'cut is simpler than awk for fixed columns but less flexible than awk for calculations.',
    docUrl: 'https://man7.org/linux/man-pages/man1/cut.1.html',
    docLabel: 'cut(1) manual',
  },
  'cli-grep-01': {
    explanation:
      'grep searches for lines containing a literal string by default. grep portal-a latency.csv keeps only rows for that endpoint.',
    example: 'grep portal-a latency.csv',
    commentary:
      'Patterns are plain text unless you add -E for extended regular expressions. grep is the workhorse of log analysis.',
    docUrl: 'https://man7.org/linux/man-pages/man1/grep.1.html',
    docLabel: 'grep(1) manual',
  },
  'cli-grep-02': {
    explanation: 'grep -v inverts the match — print lines that do NOT contain the pattern.',
    example: 'grep -v portal-c latency.csv',
    commentary: 'Useful to exclude noisy endpoints or known-good hosts from incident triage.',
    docUrl: 'https://man7.org/linux/man-pages/man1/grep.1.html',
    docLabel: 'grep -v',
  },
  'cli-find-01': {
    explanation: 'find walks directory trees. find . -name "*.csv" locates CSV files under the current directory.',
    example: 'find . -name "*.csv"',
    commentary: 'On constrained systems find is often available when GUI tools are not.',
    docUrl: 'https://man7.org/linux/man-pages/man1/find.1.html',
    docLabel: 'find(1) manual',
  },
  'cli-sort-01': {
    explanation: 'sort orders lines. sort -n compares numerically — essential for latency values (10 < 9 as text, but 9 < 10 as numbers).',
    example: "grep portal-a latency.csv | awk -F, '{print $4}' | sort -n",
    commentary: 'Always sort before uniq when you need global deduplication.',
    docUrl: 'https://man7.org/linux/man-pages/man1/sort.1.html',
    docLabel: 'sort(1) manual',
  },
  'cli-uniq-01': {
    explanation: 'uniq collapses adjacent duplicate lines. Sort first so all duplicates are adjacent.',
    example: 'cut -d, -f2 latency.csv | tail -n +2 | sort | uniq',
    commentary: 'uniq -c prefixes each unique line with a count — handy for histograms.',
    docUrl: 'https://man7.org/linux/man-pages/man1/uniq.1.html',
    docLabel: 'uniq(1) manual',
  },
  'cli-sed-01': {
    explanation: "sed streams editor — s/old/new/ substitutes text on each line. Here portal-a becomes PORTAL-A in the log view.",
    example: "sed 's/portal-a/PORTAL-A/' latency.log",
    commentary: 'sed -i edits files in place on real systems. This lab keeps changes in stdout only.',
    docUrl: 'https://man7.org/linux/man-pages/man1/sed.1.html',
    docLabel: 'sed(1) manual',
  },
  'cli-awk-01': {
    explanation: 'awk treats each line as fields. awk -F, splits CSV columns; {print $6} outputs http_ms for filtered rows.',
    example: "grep portal-a latency.csv | awk -F, '{print $6}'",
    commentary: 'awk is a small language — field math, conditionals, and END summaries without Python.',
    docUrl: 'https://man7.org/linux/man-pages/man1/gawk.1.html',
    docLabel: 'awk(1) manual',
  },
  'cli-awk-02': {
    explanation:
      'awk END blocks run after all input lines. {sum += $4; n++} END {print sum/n} computes the average ping_avg for portal-a.',
    example: "grep portal-a latency.csv | awk -F, '{sum += $4; n++} END {print sum/n}'",
    commentary: 'This pattern replaces spreadsheet averages in shell-only monitoring scripts.',
    docUrl: 'https://man7.org/linux/man-pages/man1/gawk.1.html',
    docLabel: 'awk aggregation',
  },
  'cli-pipe-01': {
    explanation:
      'A pipe | connects stdout of the left command to stdin of the right. cat latency.log | grep portal-a avoids naming the file twice.',
    example: 'cat latency.log | grep portal-a',
    commentary: 'Each stage receives text and produces text — small tools composed into workflows.',
    docUrl: 'https://man7.org/linux/man-pages/man7/pipe.7.html',
    docLabel: 'pipe(7) — IPC overview',
  },
  'cli-pipe-02': {
    explanation: 'grep filters rows; cut selects columns. Together they extract one metric from one endpoint.',
    example: 'grep portal-b latency.csv | cut -d, -f4',
    commentary: 'Think: filter → transform. The pipe passes only matching rows to cut.',
    docUrl: 'https://man7.org/linux/man-pages/man1/grep.1.html',
    docLabel: 'Composing grep and cut',
  },
  'cli-pipe-03': {
    explanation: 'Three conceptual stages: grep keeps portal-c rows, awk averages http_ms, stdout shows the result.',
    example: "grep portal-c latency.csv | awk -F, '{sum += $6; n++} END {print sum/n}'",
    commentary: 'Average HTTP latency for portal-c is ~314ms in this dataset — higher than ping alone suggests.',
    docUrl: 'https://man7.org/linux/man-pages/man1/gawk.1.html',
    docLabel: 'Pipeline aggregation',
  },
  'cli-pipe-04': {
    explanation:
      'Classic pipeline: grep filters endpoint, awk extracts ping_avg, sort -n orders values low to high.',
    example: "grep portal-a latency.csv | awk -F, '{print $4}' | sort -n",
    commentary: 'This is the same progression taught in the latency monitor capstone.',
    docUrl: 'https://man7.org/linux/man-pages/man1/sort.1.html',
    docLabel: 'filter → awk → sort',
  },
  'cli-pipe-05': {
    explanation: 'awk can count rows matching a condition: $6 > 200 {n++} END {print n} finds elevated HTTP latency samples.',
    example: "grep portal-a latency.csv | awk -F, '$6 > 200 {n++} END {print n}'",
    commentary: 'One degraded HTTP sample (with 503 status) appears at 11:00 for portal-a.',
    docUrl: 'https://man7.org/linux/man-pages/man1/gawk.1.html',
    docLabel: 'Conditional counting',
  },
  'cli-ping-01': {
    explanation:
      'ping sends ICMP echo requests. ping -c 3 sends three probes. Linux prints rtt min/avg/max/mdev summarizing round-trip time.',
    example: 'ping -c 3 portal-a.example.com',
    commentary:
      'ICMP measures network reachability and basic latency — not HTTP application time. Normal ping with slow HTTP implicates the app layer.',
    docUrl: 'https://man7.org/linux/man-pages/man8/ping.8.html',
    docLabel: 'ping(8) manual',
  },
  'cli-curl-timing-01': {
    explanation:
      'curl -o /dev/null -s discards the body; -w \'%{http_code},%{time_total}\\n\' prints HTTP status and total time.',
    example: "curl -o /dev/null -s -w '%{http_code},%{time_total}\\n' https://portal-a.example.com",
    commentary: 'time_total includes DNS, connect, TLS, and server processing — broader than ping RTT.',
    docUrl: 'https://curl.se/docs/manpage.html#-w',
    docLabel: 'curl -w write-out',
  },
  'cli-dig-01': {
    explanation:
      'dig queries DNS servers directly and shows structured answers including A records. Answers come from the lab /etc/hosts file.',
    example: 'dig portal-a.example.com',
    commentary: 'DNS failures can cause HTTP errors even when ping to an IP works — dig isolates name resolution.',
    docUrl: 'https://man7.org/linux/man-pages/man1/dig.1.html',
    docLabel: 'dig(1) manual',
  },
  'cli-traceroute-01': {
    explanation: 'traceroute (or tracepath) shows each router hop toward a host — helpful when latency spikes mid-path.',
    example: 'traceroute portal-a.example.com',
    commentary: 'Simulated output lists gateway.lab and the destination — real traceroute uses TTL expiry.',
    docUrl: 'https://man7.org/linux/man-pages/man8/traceroute.8.html',
    docLabel: 'traceroute(8) manual',
  },
  'cli-nslookup-01': {
    explanation: 'nslookup is an interactive DNS lookup tool still common on minimal Linux images.',
    example: 'nslookup portal-b.example.com',
    commentary: 'dig is more script-friendly; nslookup is still worth knowing on older systems.',
    docUrl: 'https://man7.org/linux/man-pages/man1/nslookup.1.html',
    docLabel: 'nslookup(1) manual',
  },
  'cli-network-compare-01': {
    explanation:
      'Compare ping_avg (field 4) with http_ms (field 6). Rows where ping is healthy but HTTP is slow point to application issues.',
    example: "grep portal-a latency.csv | awk -F, '$4 < 50 && $6 > 200 {print $1,$6,$7}'",
    commentary: 'The 11:00 sample shows HTTP 420ms with HTTP 503 — ping was still under 50ms.',
    docUrl: 'https://curl.se/docs/manpage.html#-w',
    docLabel: 'Layered latency analysis',
  },
  'cli-ps-01': {
    explanation: 'ps lists running processes. ps aux shows all users with full command lines — spot stuck ping/curl jobs.',
    example: 'ps aux',
    commentary: 'When a host feels slow, ps reveals runaway scripts before installing heavier tools.',
    docUrl: 'https://man7.org/linux/man-pages/man1/ps.1.html',
    docLabel: 'ps(1) manual',
  },
  'cli-df-01': {
    explanation: 'df reports filesystem disk usage. df -h uses human-readable sizes (K, M, G).',
    example: 'df -h',
    commentary: 'Full disks cause logging and CSV append failures during monitoring.',
    docUrl: 'https://man7.org/linux/man-pages/man1/df.1.html',
    docLabel: 'df(1) manual',
  },
  'cli-du-01': {
    explanation: 'du estimates directory space usage. du -h . summarizes the lab folder.',
    example: 'du -h .',
    commentary: 'Use du before scp-ing large log trees off a constrained edge device.',
    docUrl: 'https://man7.org/linux/man-pages/man1/du.1.html',
    docLabel: 'du(1) manual',
  },
  'cli-free-01': {
    explanation: 'free shows memory and swap usage. free -h is readable on small VPS instances.',
    example: 'free -h',
    commentary: 'Low available memory can inflate HTTP latency even when network ping looks fine.',
    docUrl: 'https://man7.org/linux/man-pages/man1/free.1.html',
    docLabel: 'free(1) manual',
  },
  'cli-ssh-01': {
    explanation:
      'ssh opens an encrypted remote shell. This lab simulates the connection banner only — no real remote execution.',
    example: 'ssh monitor.lab',
    commentary: 'Batch monitoring usually uses ssh with a remote command rather than interactive sessions.',
    docUrl: 'https://man7.org/linux/man-pages/man1/ssh.1.html',
    docLabel: 'ssh(1) manual',
  },
  'cli-scp-01': {
    explanation: 'scp copies files over SSH. Useful for moving latency.csv to a central collector without extra agents.',
    example: 'scp latency.csv backup.lab:/data/latency.csv',
    commentary: 'Simulated copy — real scp requires SSH keys and host trust.',
    docUrl: 'https://man7.org/linux/man-pages/man1/scp.1.html',
    docLabel: 'scp(1) manual',
  },
  'cli-capstone-01': {
    explanation: 'A latency monitor starts with endpoints — URLs or hostnames to probe on a schedule.',
    example: 'cat endpoints.txt',
    commentary: 'In Bash you might: while read url; do ...; done < endpoints.txt',
    docUrl: 'https://man7.org/linux/man-pages/man1/cat.1.html',
    docLabel: 'Monitor workflow — endpoints',
  },
  'cli-capstone-02': {
    explanation: 'Step two: ICMP probes with ping -c 3 capture min/avg/max for each endpoint.',
    example: 'ping -c 3 portal-b.example.com',
    commentary: 'Parse the summary line with awk or grep in a script and append to CSV.',
    docUrl: 'https://man7.org/linux/man-pages/man8/ping.8.html',
    docLabel: 'Monitor workflow — ping',
  },
  'cli-capstone-03': {
    explanation: 'Step three: HTTP timing with curl captures application response time and status code.',
    example: "curl -o /dev/null -s -w '%{http_code},%{time_total}\\n' https://portal-c.example.com",
    commentary: 'Append timestamp, endpoint, ping stats, http_ms, and http_status as one CSV row.',
    docUrl: 'https://curl.se/docs/manpage.html#-w',
    docLabel: 'Monitor workflow — curl',
  },
  'cli-capstone-04': {
    explanation:
      'Analyze rolling history: aggregate average http_ms per endpoint, sort numerically, take the worst offender.',
    example:
      "tail -n +2 latency.csv | awk -F, '{a[$2]+=$6; c[$2]++} END {for (e in a) print e, a[e]/c[e]}' | sort -k2 -n | tail -n 1",
    commentary: 'portal-c averages the highest HTTP latency in this dataset — prioritize investigation there.',
    docUrl: 'https://man7.org/linux/man-pages/man1/gawk.1.html',
    docLabel: 'Monitor workflow — analysis',
  },
  'cli-capstone-05': {
    explanation:
      'Capstone: Build a Linux Latency Monitor mentally — endpoints → ping → curl → CSV → grep/awk analysis → rolling history.',
    example: "grep portal-a latency.csv | awk -F, '$6 > 200 {print $1,$6,$7}'",
    commentary:
      'All of this can live in a Bash script using only stock CLI tools — no Python, Node, or database required.',
    docUrl: 'https://www.gnu.org/software/bash/manual/bash.html',
    docLabel: 'Bash scripting manual',
  },
};
