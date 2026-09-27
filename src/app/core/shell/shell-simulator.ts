import { ParsedCommand, ParsedPipeline } from './shell-parser';
import { lookupHostIp, VirtualFilesystem } from './virtual-fs';

export type PipelineStageResult = {
  command: string;
  input: string;
  output: string;
};

export type ShellExecutionResult = {
  stdout: string;
  stderr: string;
  exitCode: number;
  stages: PipelineStageResult[];
};

export type ShellExecutionError = {
  message: string;
  stderr?: string;
  stages?: PipelineStageResult[];
};

const ALLOWED_COMMANDS = new Set([
  'cat',
  'head',
  'tail',
  'less',
  'wc',
  'cut',
  'grep',
  'find',
  'sed',
  'awk',
  'sort',
  'uniq',
  'ping',
  'curl',
  'traceroute',
  'tracepath',
  'dig',
  'nslookup',
  'ps',
  'df',
  'du',
  'free',
  'ssh',
  'scp',
  'echo',
  'ls',
]);

const PING_STATS: Record<string, { min: number; avg: number; max: number; mdev: number }> = {
  'portal-a.example.com': { min: 31.2, avg: 35.6, max: 41.1, mdev: 3.8 },
  'portal-b.example.com': { min: 42.1, avg: 48.7, max: 55.2, mdev: 4.5 },
  'portal-c.example.com': { min: 63.4, avg: 71.2, max: 82.7, mdev: 6.1 },
  'localhost': { min: 0.05, avg: 0.08, max: 0.12, mdev: 0.02 },
};

const HTTP_STATS: Record<string, { ms: number; status: number }> = {
  'https://portal-a.example.com': { ms: 0.182, status: 200 },
  'https://portal-b.example.com': { ms: 0.24, status: 200 },
  'https://portal-c.example.com': { ms: 0.31, status: 200 },
  'https://example.com': { ms: 0.145, status: 200 },
};

export function executePipeline(
  pipeline: ParsedPipeline,
  vfs: VirtualFilesystem,
): ShellExecutionResult | ShellExecutionError {
  const stages: PipelineStageResult[] = [];
  let stdin = '';

  for (const stage of pipeline.stages) {
    if (!ALLOWED_COMMANDS.has(stage.name)) {
      return {
        message: `Command not supported in this lab: ${stage.name}`,
        stages,
      };
    }

    try {
      const result = runCommand(stage, stdin, vfs);
      stages.push({
        command: stage.raw,
        input: stdin,
        output: result.stdout,
      });
      stdin = result.stdout;
      if (result.exitCode !== 0) {
        return {
          stdout: result.stdout,
          stderr: result.stderr,
          exitCode: result.exitCode,
          stages,
        };
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Command failed.';
      return { message, stages };
    }
  }

  return {
    stdout: stdin,
    stderr: '',
    exitCode: 0,
    stages,
  };
}

function runCommand(
  cmd: ParsedCommand,
  stdin: string,
  vfs: VirtualFilesystem,
): { stdout: string; stderr: string; exitCode: number } {
  switch (cmd.name) {
    case 'cat':
      return cmdCat(cmd, stdin, vfs);
    case 'head':
      return cmdHead(cmd, stdin, vfs);
    case 'tail':
      return cmdTail(cmd, stdin, vfs);
    case 'less':
      return cmdLess(cmd, stdin, vfs);
    case 'wc':
      return cmdWc(cmd, stdin, vfs);
    case 'cut':
      return cmdCut(cmd, stdin);
    case 'grep':
      return cmdGrep(cmd, stdin, vfs);
    case 'find':
      return cmdFind(cmd, vfs);
    case 'sed':
      return cmdSed(cmd, stdin, vfs);
    case 'awk':
      return cmdAwk(cmd, stdin);
    case 'sort':
      return cmdSort(cmd, stdin);
    case 'uniq':
      return cmdUniq(cmd, stdin);
    case 'ping':
      return cmdPing(cmd);
    case 'curl':
      return cmdCurl(cmd);
    case 'traceroute':
    case 'tracepath':
      return cmdTraceroute(cmd);
    case 'dig':
      return cmdDig(cmd, vfs);
    case 'nslookup':
      return cmdNslookup(cmd, vfs);
    case 'ps':
      return cmdPs(cmd);
    case 'df':
      return cmdDf(cmd);
    case 'du':
      return cmdDu(cmd, vfs);
    case 'free':
      return cmdFree(cmd);
    case 'ssh':
      return cmdSsh(cmd);
    case 'scp':
      return cmdScp(cmd);
    case 'echo':
      return ok(cmd.args.join(' '));
    case 'ls':
      return cmdLs(cmd, vfs);
    default:
      return fail(`Unsupported command: ${cmd.name}`);
  }
}

function ok(stdout: string, exitCode = 0): { stdout: string; stderr: string; exitCode: number } {
  return { stdout, stderr: '', exitCode };
}

function fail(stderr: string, exitCode = 1): { stdout: string; stderr: string; exitCode: number } {
  return { stdout: '', stderr, exitCode };
}

function readInput(cmd: ParsedCommand, stdin: string, vfs: VirtualFilesystem): string {
  if (stdin) {
    return stdin;
  }
  if (!cmd.args.length) {
    return '';
  }
  return cmd.args
    .filter((arg) => !arg.startsWith('-'))
    .map((path) => vfs.read(path))
    .join('\n');
}

function cmdCat(cmd: ParsedCommand, stdin: string, vfs: VirtualFilesystem) {
  if (stdin) {
    return ok(stdin);
  }
  if (!cmd.args.length) {
    return fail('cat: missing file operand');
  }
  const parts: string[] = [];
  for (const arg of cmd.args) {
    if (arg.startsWith('-')) {
      continue;
    }
    parts.push(vfs.read(arg));
  }
  return ok(parts.join('\n'));
}

function cmdHead(cmd: ParsedCommand, stdin: string, vfs: VirtualFilesystem) {
  const lines = readLines(cmd, stdin, vfs);
  const count = flagInt(cmd.args, '-n', 10);
  return ok(lines.slice(0, count).join('\n'));
}

function cmdTail(cmd: ParsedCommand, stdin: string, vfs: VirtualFilesystem) {
  const lines = readLines(cmd, stdin, vfs);
  const nIndex = cmd.args.indexOf('-n');
  if (nIndex >= 0) {
    const raw = cmd.args[nIndex + 1] ?? '10';
    if (raw.startsWith('+')) {
      const start = Number.parseInt(raw.slice(1), 10);
      return ok(lines.slice(start - 1).join('\n'));
    }
    const count = Number.parseInt(raw, 10);
    return ok(lines.slice(-count).join('\n'));
  }
  const count = 10;
  return ok(lines.slice(-count).join('\n'));
}

function cmdLess(cmd: ParsedCommand, stdin: string, vfs: VirtualFilesystem) {
  const text = readInput(cmd, stdin, vfs);
  const lines = splitLines(text);
  const preview = lines.slice(0, 20).join('\n');
  const suffix = lines.length > 20 ? '\n--(END of first screen; less would let you scroll)--' : '';
  return ok(`${preview}${suffix}`);
}

function cmdWc(cmd: ParsedCommand, stdin: string, vfs: VirtualFilesystem) {
  const text = stdin || readInput(cmd, '', vfs);
  const lines = splitLines(text);
  const words = text.trim() ? text.trim().split(/\s+/).length : 0;
  const chars = text.length;
  const onlyLines = cmd.args.includes('-l');
  const onlyWords = cmd.args.includes('-w');
  const onlyChars = cmd.args.includes('-c');

  if (onlyLines && !onlyWords && !onlyChars) {
    return ok(String(lines.length));
  }
  if (onlyWords && !onlyLines && !onlyChars) {
    return ok(String(words));
  }
  if (onlyChars && !onlyLines && !onlyWords) {
    return ok(String(chars));
  }
  return ok(`${lines.length} ${words} ${chars}`);
}

function cmdCut(cmd: ParsedCommand, stdin: string) {
  const delimiter = flagValue(cmd.args, '-d', ',');
  const fieldSpec = flagValue(cmd.args, '-f', '1');
  const fields = fieldSpec
    .split(',')
    .map((value) => Number.parseInt(value, 10))
    .filter((value) => !Number.isNaN(value));

  const lines = splitLines(stdin);
  const output = lines
    .filter((line) => line.length > 0)
    .map((line) => {
      const parts = line.split(delimiter);
      return fields.map((field) => parts[field - 1] ?? '').join(delimiter);
    })
    .join('\n');
  return ok(output);
}

function cmdGrep(cmd: ParsedCommand, stdin: string, vfs: VirtualFilesystem) {
  const invert = cmd.args.includes('-v');
  const ignoreCase = cmd.args.includes('-i');
  const useRegex = cmd.args.includes('-E');
  const patternArg = cmd.args.find((arg) => !arg.startsWith('-'));
  if (!patternArg) {
    return fail('grep: missing pattern');
  }

  let text = stdin;
  const fileArgs = cmd.args.filter((arg) => !arg.startsWith('-') && arg !== patternArg);
  if (!text && fileArgs.length) {
    text = fileArgs.map((path) => vfs.read(path)).join('\n');
  }

  const matched = splitLines(text).filter((line) => {
    const hit = lineMatchesPattern(line, patternArg, ignoreCase, useRegex);
    return invert ? !hit : hit;
  });
  return ok(matched.join('\n'));
}

function lineMatchesPattern(
  line: string,
  pattern: string,
  ignoreCase: boolean,
  useRegex: boolean,
): boolean {
  if (useRegex) {
    const regex = new RegExp(pattern, ignoreCase ? 'i' : '');
    return regex.test(line);
  }
  const haystack = ignoreCase ? line.toLowerCase() : line;
  const needle = ignoreCase ? pattern.toLowerCase() : pattern;
  return haystack.includes(needle);
}

function cmdFind(cmd: ParsedCommand, vfs: VirtualFilesystem) {
  const start = cmd.args[0] && !cmd.args[0].startsWith('-') ? cmd.args[0] : '.';
  const nameIndex = cmd.args.indexOf('-name');
  const pattern = nameIndex >= 0 ? cmd.args[nameIndex + 1] : '*';
  const root = vfs.resolve(start);
  const matches: string[] = [];

  const walk = (dir: string): void => {
    for (const name of vfs.listDir(dir)) {
      const full = `${dir}/${name}`.replace(/\/+/g, '/');
      if (globMatch(name, pattern ?? '*')) {
        matches.push(full);
      }
      try {
        vfs.read(full);
      } catch {
        walk(full);
      }
    }
  };

  walk(root);
  return ok(matches.sort().join('\n'));
}

function cmdSed(cmd: ParsedCommand, stdin: string, vfs: VirtualFilesystem) {
  const script = cmd.args.find((arg) => !arg.startsWith('-'));
  if (!script) {
    return fail('sed: missing script');
  }

  if (!script.startsWith('s/')) {
    return fail('sed: only simple s/old/new/ substitutions are supported in this lab');
  }

  const body = script.slice(2);
  const firstSlash = body.indexOf('/');
  if (firstSlash < 0) {
    return fail('sed: invalid substitution');
  }
  const oldText = body.slice(0, firstSlash);
  const rest = body.slice(firstSlash + 1);
  const secondSlash = rest.indexOf('/');
  if (secondSlash < 0) {
    return fail('sed: invalid substitution');
  }
  const newText = rest.slice(0, secondSlash);

  let text = stdin;
  const fileArgs = cmd.args.filter((arg) => !arg.startsWith('-') && arg !== script);
  if (!text && fileArgs.length) {
    text = fileArgs.map((path) => vfs.read(path)).join('\n');
  }

  const output = splitLines(text)
    .map((line) => line.split(oldText).join(newText))
    .join('\n');
  return ok(output);
}

function cmdAwk(cmd: ParsedCommand, stdin: string) {
  const fieldSepIndex = cmd.args.indexOf('-F');
  const fieldSep =
    fieldSepIndex >= 0
      ? cmd.args[fieldSepIndex + 1]?.replace(/^['"]|['"]$/g, '') ?? ','
      : undefined;
  const program = cmd.args.find(
    (arg, index) => !arg.startsWith('-') && index !== fieldSepIndex + 1,
  );
  if (!program) {
    return fail('awk: missing program');
  }

  const lines = splitLines(stdin).filter((line) => line.length > 0);
  const fieldsFor = (line: string): string[] =>
    fieldSep ? line.split(fieldSep) : splitFields(line);

  const singleConditionPrint = program.match(
    /\$(\d+)\s*>\s*(\d+)\s*\{\s*print\s+(.+)\s*\}/,
  );
  if (singleConditionPrint) {
    const field = Number.parseInt(singleConditionPrint[1]!, 10);
    const threshold = Number.parseInt(singleConditionPrint[2]!, 10);
    const printSpec = singleConditionPrint[3]!;
    const fieldNums = [...printSpec.matchAll(/\$(\d+)/g)].map((match) => Number(match[1]!));
    const output: string[] = [];
    for (const line of lines) {
      const fields = fieldsFor(line);
      const value = Number.parseFloat(fields[field - 1] ?? '');
      if (!Number.isNaN(value) && value > threshold) {
        output.push(fieldNums.map((num) => fields[num - 1] ?? '').join(' '));
      }
    }
    return ok(output.join('\n'));
  }

  const conditionalPrint = program.match(
    /\$(\d+)\s*<\s*(\d+)\s*&&\s*\$(\d+)\s*>\s*(\d+)\s*\{\s*print\s+(.+)\s*\}/,
  );
  if (conditionalPrint) {
    const f1 = Number.parseInt(conditionalPrint[1]!, 10);
    const t1 = Number.parseInt(conditionalPrint[2]!, 10);
    const f2 = Number.parseInt(conditionalPrint[3]!, 10);
    const t2 = Number.parseInt(conditionalPrint[4]!, 10);
    const printSpec = conditionalPrint[5]!;
    const fieldNums = [...printSpec.matchAll(/\$(\d+)/g)].map((match) => Number(match[1]!));
    const output: string[] = [];
    for (const line of lines) {
      const fields = fieldsFor(line);
      const v1 = Number.parseFloat(fields[f1 - 1] ?? '');
      const v2 = Number.parseFloat(fields[f2 - 1] ?? '');
      if (!Number.isNaN(v1) && !Number.isNaN(v2) && v1 < t1 && v2 > t2) {
        output.push(fieldNums.map((num) => fields[num - 1] ?? '').join(' '));
      }
    }
    return ok(output.join('\n'));
  }

  const aggregateMatch = program.match(
    /\{\s*a\[\$(\d+)\]\+=\$(\d+);\s*c\[\$(\d+)\]\+\+\s*\}\s*END\s*\{\s*for\s*\(\s*e\s+in\s+a\s*\)\s*print\s+e,\s*a\[e\]\/c\[e\]\s*\}/,
  );
  if (aggregateMatch) {
    const keyField = Number.parseInt(aggregateMatch[1]!, 10);
    const valueField = Number.parseInt(aggregateMatch[2]!, 10);
    const totals = new Map<string, { sum: number; count: number }>();
    for (let index = 0; index < lines.length; index += 1) {
      if (program.includes('NR>1') && index === 0) {
        continue;
      }
      const line = lines[index]!;
      const fields = fieldsFor(line);
      const key = fields[keyField - 1] ?? '';
      const value = Number.parseFloat(fields[valueField - 1] ?? '');
      if (!key || Number.isNaN(value)) {
        continue;
      }
      const current = totals.get(key) ?? { sum: 0, count: 0 };
      current.sum += value;
      current.count += 1;
      totals.set(key, current);
    }
    const output = [...totals.entries()].map(
      ([key, stats]) => `${key} ${stats.sum / stats.count}`,
    );
    return ok(output.join('\n'));
  }
  const printField = program.match(/^\{\s*print\s+\$(\d+)\s*\}$/);
  if (printField) {
    const field = Number.parseInt(printField[1]!, 10);
    return ok(lines.map((line) => fieldsFor(line)[field - 1] ?? '').join('\n'));
  }

  const avgMatch = program.match(
    /\{\s*sum\s\+=\s\$(\d+);\s*n\+\+\s*\}\s*END\s*\{\s*print\s+sum\/n\s*\}/,
  );
  if (avgMatch) {
    const field = Number.parseInt(avgMatch[1]!, 10);
    let sum = 0;
    let count = 0;
    for (const line of lines) {
      const value = Number.parseFloat(fieldsFor(line)[field - 1] ?? '');
      if (!Number.isNaN(value)) {
        sum += value;
        count += 1;
      }
    }
    return ok(count ? String(Math.round((sum / count) * 100) / 100) : '0');
  }

  const sumMatch = program.match(/\{\s*sum\s\+=\s\$(\d+)\s*\}\s*END\s*\{\s*print\s+sum\s*\}/);
  if (sumMatch) {
    const field = Number.parseInt(sumMatch[1]!, 10);
    let sum = 0;
    for (const line of lines) {
      const value = Number.parseFloat(fieldsFor(line)[field - 1] ?? '');
      if (!Number.isNaN(value)) {
        sum += value;
      }
    }
    return ok(String(sum));
  }

  const countMatch = program.match(/END\s*\{\s*print\s+n\s*\}/);
  if (countMatch && program.includes('n++')) {
    const condition = program.match(/\$(\d+)\s*>\s*(\d+)/);
    if (condition) {
      const field = Number.parseInt(condition[1]!, 10);
      const threshold = Number.parseInt(condition[2]!, 10);
      let count = 0;
      for (const line of lines) {
        const value = Number.parseFloat(fieldsFor(line)[field - 1] ?? '');
        if (!Number.isNaN(value) && value > threshold) {
          count += 1;
        }
      }
      return ok(String(count));
    }
    return ok(String(lines.length));
  }

  return fail('awk: this program pattern is not supported in the lab simulator');
}

function cmdSort(cmd: ParsedCommand, stdin: string) {
  const numeric = cmd.args.includes('-n');
  const keyIndex = cmd.args.findIndex((arg) => arg === '-k');
  const keyField =
    keyIndex >= 0 ? Number.parseInt(cmd.args[keyIndex + 1]?.replace(/[^0-9]/g, '') ?? '1', 10) : 1;
  const lines = splitLines(stdin).filter((line) => line.length > 0);
  const sorted = [...lines].sort((a, b) => {
    if (numeric || cmd.args.includes('-k')) {
      const aParts = a.split(/\s+/);
      const bParts = b.split(/\s+/);
      const aVal = Number.parseFloat(aParts[keyField - 1] ?? a);
      const bVal = Number.parseFloat(bParts[keyField - 1] ?? b);
      return aVal - bVal;
    }
    return a.localeCompare(b);
  });
  return ok(sorted.join('\n'));
}

function cmdUniq(cmd: ParsedCommand, stdin: string) {
  const count = cmd.args.includes('-c');
  const lines = splitLines(stdin);
  const output: string[] = [];
  let previous = '';
  let tally = 0;

  for (const line of lines) {
    if (line === previous) {
      tally += 1;
      continue;
    }
    if (previous) {
      output.push(count ? `${tally} ${previous}` : previous);
    }
    previous = line;
    tally = 1;
  }
  if (previous) {
    output.push(count ? `${tally} ${previous}` : previous);
  }
  return ok(output.join('\n'));
}

function cmdPing(cmd: ParsedCommand) {
  const count = flagInt(cmd.args, '-c', 4);
  const host = lastOperand(cmd.args) ?? 'localhost';
  const stats = PING_STATS[host] ?? { min: 10, avg: 15, max: 20, mdev: 2.5 };

  const replies = Array.from({ length: count }, (_, index) => {
    const ms = stats.avg + (index % 2 === 0 ? -1.2 : 1.4);
    return `64 bytes from ${host}: icmp_seq=${index + 1} ttl=56 time=${ms.toFixed(1)} ms`;
  });

  const summary = `\n--- ${host} ping statistics ---\n${count} packets transmitted, ${count} received, 0% packet loss\nrtt min/avg/max/mdev = ${stats.min}/${stats.avg}/${stats.max}/${stats.mdev} ms`;
  return ok(`${replies.join('\n')}${summary}`);
}

function cmdCurl(cmd: ParsedCommand) {
  const url =
    cmd.args.find((arg) => arg.startsWith('http')) ??
    lastOperand(cmd.args) ??
    'https://example.com';
  if (!url.startsWith('http')) {
    return fail('curl: expected an http(s) URL');
  }
  const writeOutIndex = cmd.args.findIndex((arg) => arg === '-w' || arg === '--write-out');
  const writeOut =
    writeOutIndex >= 0 ? cmd.args[writeOutIndex + 1]?.replace(/^['"]|['"]$/g, '') : '';
  const stats = HTTP_STATS[url] ?? { ms: 0.2, status: 200 };

  if (writeOut.includes('%{http_code}') && writeOut.includes('%{time_total}')) {
    return ok(`${stats.status},${stats.ms.toFixed(3)}`);
  }
  if (writeOut.includes('%{http_code}')) {
    return ok(String(stats.status));
  }
  if (writeOut.includes('%{time_total}')) {
    return ok(stats.ms.toFixed(3));
  }

  return ok(`{"url":"${url}","status":${stats.status},"time_total":${stats.ms.toFixed(3)}}`);
}

function cmdTraceroute(cmd: ParsedCommand) {
  const host = lastOperand(cmd.args) ?? 'portal-a.example.com';
  const hops = [
    ' 1  gateway.lab (10.0.0.1)  1.234 ms',
    ' 2  edge-01.isp.net (198.51.100.2)  12.456 ms',
    ` 3  ${host} (10.0.0.5)  35.678 ms`,
  ];
  return ok(`traceroute to ${host}\n${hops.join('\n')}`);
}

function cmdDig(cmd: ParsedCommand, vfs: VirtualFilesystem) {
  const name = lastOperand(cmd.args) ?? 'portal-a.example.com';
  const ip = lookupHostIp(name, vfs) ?? '10.0.0.5';
  return ok(
    `; <<>> DiG simulated <<>> ${name}\n;; ANSWER SECTION:\n${name}.\t300\tIN\tA\t${ip}`,
  );
}

function cmdNslookup(cmd: ParsedCommand, vfs: VirtualFilesystem) {
  const name = lastOperand(cmd.args) ?? 'portal-a.example.com';
  const ip = lookupHostIp(name, vfs) ?? '10.0.0.5';
  return ok(`Server:\t\t10.0.0.1\nAddress:\t10.0.0.1#53\n\nName:\t${name}\nAddress: ${ip}`);
}

function cmdPs(cmd: ParsedCommand) {
  const aux = cmd.args.includes('aux') || cmd.args.includes('-ef');
  if (aux) {
    return ok(
      'USER       PID  CMD\nlab       1010  sshd: lab@pts/0\nlab       1042  bash\nlab       1188  ping portal-a.example.com\nlab       1201  curl -s https://portal-a.example.com',
    );
  }
  return ok('  PID TTY          TIME CMD\n 1042 pts/0    00:00:00 bash');
}

function cmdDf(cmd: ParsedCommand) {
  const human = cmd.args.includes('-h');
  if (human) {
    return ok(
      'Filesystem      Size  Used Avail Use% Mounted on\n/dev/vda1        20G  6.2G   13G  33% /\ntmpfs           1.9G     0  1.9G   0% /dev/shm',
    );
  }
  return ok(
    'Filesystem     1K-blocks    Used Available Use% Mounted on\n/dev/vda1       20971520 6488064  13434880  33% /',
  );
}

function cmdDu(cmd: ParsedCommand, vfs: VirtualFilesystem) {
  const human = cmd.args.includes('-h');
  const path = cmd.args.find((arg) => !arg.startsWith('-')) ?? '.';
  const resolved = vfs.resolve(path);
  const total = vfs.totalSizeUnder(path);
  const size = human ? `${Math.max(1, Math.ceil(total / 1024))}K` : String(total);
  return ok(`${size}\t${resolved}`);
}

function cmdFree(cmd: ParsedCommand) {
  const human = cmd.args.includes('-h');
  if (human) {
    return ok('              total        used        free      shared  buff/cache   available\nMem:           7.8Gi       2.1Gi       4.0Gi       120Mi       1.7Gi       5.4Gi');
  }
  return ok('              total        used        free      shared buff/cache   available\nMem:        8192000     2201600     4194304      122880     1796096     5668864');
}

function cmdSsh(cmd: ParsedCommand) {
  const target = cmd.args.find((arg) => !arg.startsWith('-')) ?? 'monitor.lab';
  return ok(`Connected to ${target}\nlab@${target}:~$ (interactive SSH is simulated; use batch commands in scripts)`);
}

function cmdScp(cmd: ParsedCommand) {
  const paths = cmd.args.filter((arg) => !arg.startsWith('-'));
  if (paths.length < 2) {
    return fail('scp: missing destination');
  }
  return ok(`${paths[0]} -> ${paths[1]}  100%  4KB  simulated copy complete`);
}

function cmdLs(cmd: ParsedCommand, vfs: VirtualFilesystem) {
  const path = cmd.args.find((arg) => !arg.startsWith('-')) ?? '.';
  return ok(vfs.listDir(path).join('\n'));
}

function readLines(cmd: ParsedCommand, stdin: string, vfs: VirtualFilesystem): string[] {
  return splitLines(readInput(cmd, stdin, vfs));
}

function splitLines(text: string): string[] {
  if (!text) {
    return [];
  }
  return text.replace(/\n$/, '').split('\n');
}

function splitFields(line: string): string[] {
  if (line.includes(',')) {
    return line.split(',');
  }
  return line.trim().split(/\s+/);
}

function flagValue(args: string[], flag: string, fallback: string): string {
  const index = args.indexOf(flag);
  if (index >= 0) {
    return args[index + 1] ?? fallback;
  }
  const combined = args.find((arg) => arg.startsWith(flag) && arg.length > flag.length);
  if (combined) {
    return combined.slice(flag.length);
  }
  return fallback;
}

function flagInt(args: string[], flag: string, fallback: number): number {
  const raw = flagValue(args, flag, String(fallback));
  return Number.parseInt(raw, 10);
}

const FLAG_TAKES_VALUE = new Set(['-c', '-n', '-F', '-d', '-f', '-w', '-e', '-b', '-A', '-o']);

function lastOperand(args: string[]): string | undefined {
  const operands: string[] = [];
  for (let i = 0; i < args.length; i += 1) {
    const arg = args[i]!;
    if (arg.startsWith('-')) {
      const bare = arg.length === 2 ? arg : arg.slice(0, 2);
      if (FLAG_TAKES_VALUE.has(bare) && arg.length === 2) {
        i += 1;
      } else if (FLAG_TAKES_VALUE.has(bare) && arg.length > 2) {
        continue;
      }
      continue;
    }
    operands.push(arg);
  }
  return operands[operands.length - 1];
}

function globMatch(name: string, pattern: string): boolean {
  if (pattern === '*') {
    return true;
  }
  if (pattern.startsWith('*') && pattern.endsWith('*')) {
    return name.includes(pattern.slice(1, -1));
  }
  if (pattern.startsWith('*')) {
    return name.endsWith(pattern.slice(1));
  }
  if (pattern.endsWith('*')) {
    return name.startsWith(pattern.slice(0, -1));
  }
  return name === pattern;
}

export { ALLOWED_COMMANDS };
