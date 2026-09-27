export type VirtualFile = {
  path: string;
  content: string;
  executable?: boolean;
};

export const LATENCY_CSV = `timestamp,endpoint,ping_min,ping_avg,ping_max,http_ms,http_status
2026-09-27T08:00:00,portal-a,31.2,35.6,41.1,182,200
2026-09-27T08:00:00,portal-b,42.1,48.7,55.2,240,200
2026-09-27T08:00:00,portal-c,63.4,71.2,82.7,310,200
2026-09-27T09:00:00,portal-a,33.0,38.1,44.5,195,200
2026-09-27T09:00:00,portal-b,41.0,47.2,53.8,255,200
2026-09-27T09:00:00,portal-c,65.1,73.0,84.2,325,200
2026-09-27T10:00:00,portal-a,29.8,34.2,39.9,178,200
2026-09-27T10:00:00,portal-b,40.5,46.1,52.0,238,200
2026-09-27T10:00:00,portal-c,62.0,70.5,81.0,305,200
2026-09-27T11:00:00,portal-a,45.2,52.8,61.3,420,503
2026-09-27T11:00:00,portal-b,43.8,49.5,56.1,248,200
2026-09-27T11:00:00,portal-c,64.5,72.8,83.5,318,200
2026-09-27T12:00:00,portal-a,32.1,36.9,42.0,188,200
2026-09-27T12:00:00,portal-b,42.5,48.0,54.6,242,200
2026-09-27T12:00:00,portal-c,63.8,71.5,82.1,312,200`;

export const ENDPOINTS_TXT = `https://portal-a.example.com
https://portal-b.example.com
https://portal-c.example.com`;

export const LATENCY_LOG = LATENCY_CSV.split('\n')
  .slice(1)
  .map((line) => {
    const [ts, endpoint, , pingAvg, , httpMs, status] = line.split(',');
    return `${ts} ${endpoint} ping_avg=${pingAvg}ms http=${httpMs}ms status=${status}`;
  })
  .join('\n');

const DEFAULT_FILES: VirtualFile[] = [
  {
    path: '/home/lab/latency.csv',
    content: LATENCY_CSV,
  },
  {
    path: '/home/lab/latency.log',
    content: LATENCY_LOG,
  },
  {
    path: '/home/lab/endpoints.txt',
    content: ENDPOINTS_TXT,
  },
  {
    path: '/home/lab/README.txt',
    content:
      'Latency monitoring lab\n\nFiles:\n  latency.csv  — ping and HTTP measurements\n  latency.log  — human-readable log\n  endpoints.txt — landing page URLs\n',
  },
  {
    path: '/home/lab/monitor.sh',
    content: '#!/bin/bash\n# Example monitor skeleton\nping -c 3 portal-a.example.com\ncurl -o /dev/null -s -w \'%{http_code},%{time_total}\\n\' https://portal-a.example.com\n',
    executable: true,
  },
  {
    path: '/etc/hosts',
    content: '127.0.0.1 localhost\n10.0.0.5 portal-a.example.com\n10.0.0.6 portal-b.example.com\n10.0.0.7 portal-c.example.com\n',
  },
];

export class VirtualFilesystem {
  private readonly files = new Map<string, string>();
  readonly cwd: string;

  constructor(cwd = '/home/lab', seed: VirtualFile[] = DEFAULT_FILES) {
    this.cwd = cwd;
    for (const file of seed) {
      this.files.set(normalizePath(file.path), file.content);
    }
  }

  resolve(path: string, base = this.cwd): string {
    if (path.startsWith('/')) {
      return normalizePath(path);
    }
    return normalizePath(`${base}/${path}`);
  }

  exists(path: string, base?: string): boolean {
    return this.files.has(this.resolve(path, base));
  }

  read(path: string, base?: string): string {
    const resolved = this.resolve(path, base);
    const content = this.files.get(resolved);
    if (content === undefined) {
      throw new Error(`${resolved}: No such file or directory`);
    }
    return content;
  }

  listDir(path: string, base?: string): string[] {
    const resolved = this.resolve(path, base);
    const prefix = resolved.endsWith('/') ? resolved : `${resolved}/`;
    const names = new Set<string>();

    for (const filePath of this.files.keys()) {
      if (filePath === resolved || filePath.startsWith(prefix)) {
        const rest = filePath.slice(prefix.length);
        const segment = rest.split('/')[0];
        if (segment) {
          names.add(segment);
        }
      }
    }

    return [...names].sort();
  }

  write(path: string, content: string, base?: string): void {
    const resolved = this.resolve(path, base);
    this.files.set(resolved, content);
  }

  append(path: string, content: string, base?: string): void {
    const resolved = this.resolve(path, base);
    const existing = this.files.get(resolved) ?? '';
    this.files.set(resolved, existing + content);
  }

  totalSizeUnder(path: string, base?: string): number {
    const resolved = this.resolve(path, base);
    const prefix = resolved.endsWith('/') ? resolved : `${resolved}/`;
    let total = 0;
    for (const [filePath, content] of this.files.entries()) {
      if (filePath === resolved || filePath.startsWith(prefix)) {
        total += content.length;
      }
    }
    return total;
  }
}

export function normalizePath(path: string): string {
  const parts = path.split('/').filter(Boolean);
  const stack: string[] = [];
  for (const part of parts) {
    if (part === '.') {
      continue;
    }
    if (part === '..') {
      stack.pop();
      continue;
    }
    stack.push(part);
  }
  return `/${stack.join('/')}`;
}

export function basename(path: string): string {
  const normalized = normalizePath(path);
  const parts = normalized.split('/');
  return parts[parts.length - 1] ?? normalized;
}

/** Resolve a hostname using the simulated /etc/hosts file in the VFS. */
export function lookupHostIp(hostname: string, vfs: VirtualFilesystem): string | null {
  let hosts = '';
  try {
    hosts = vfs.read('/etc/hosts');
  } catch {
    return null;
  }

  for (const line of hosts.split('\n')) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) {
      continue;
    }
    const [ip, ...names] = trimmed.split(/\s+/);
    if (ip && names.includes(hostname)) {
      return ip;
    }
  }

  return null;
}
