import { parseCurlCommand } from './curl-parser';
import { parseShellCommand } from './shell/shell-parser';
import { executePipeline } from './shell/shell-simulator';
import { VirtualFilesystem } from './shell/virtual-fs';
import { ShellChallengeRunnerService } from './shell-challenge-runner.service';
import { getChallenge } from './curriculum';

describe('parseShellCommand', () => {
  it('parses a simple cat command', () => {
    const parsed = parseShellCommand('cat latency.csv');
    expect(parsed.ok).toBeTrue();
    if (parsed.ok) {
      expect(parsed.pipeline.stages.length).toBe(1);
      expect(parsed.pipeline.stages[0]!.name).toBe('cat');
    }
  });

  it('parses a pipeline', () => {
    const parsed = parseShellCommand('cat latency.log | grep portal-a');
    expect(parsed.ok).toBeTrue();
    if (parsed.ok) {
      expect(parsed.pipeline.stages.length).toBe(2);
    }
  });

  it('rejects shell chaining operators', () => {
    const parsed = parseShellCommand('cat latency.csv; rm -rf /');
    expect(parsed.ok).toBeFalse();
  });

  it('rejects command substitution', () => {
    const parsed = parseShellCommand('echo $(whoami)');
    expect(parsed.ok).toBeFalse();
  });

  it('rejects shell redirection', () => {
    expect(parseShellCommand('cat > out.txt latency.csv').ok).toBeFalse();
    expect(parseShellCommand('cat latency.csv >> out.txt').ok).toBeFalse();
  });
});

describe('shell simulator', () => {
  const vfs = new VirtualFilesystem('/home/lab');

  function run(command: string): string {
    const parsed = parseShellCommand(command);
    if (!parsed.ok) {
      throw new Error(parsed.message);
    }
    const result = executePipeline(parsed.pipeline, vfs);
    if ('message' in result) {
      throw new Error(result.message);
    }
    return result.stdout.replace(/\n+$/, '');
  }

  it('cats a virtual file', () => {
    const output = run('cat latency.csv');
    expect(output).toContain('timestamp,endpoint');
    expect(output).toContain('portal-a');
  });

  it('filters with grep', () => {
    const output = run('grep portal-a latency.csv');
    expect(output).toContain('portal-a');
    expect(output).not.toContain('portal-b,');
  });

  it('uses literal grep matches by default', () => {
    const output = run('grep portal.a latency.csv');
    expect(output).not.toContain('portal-b,');
  });

  it('substitutes with sed', () => {
    const output = run("sed 's/portal-a/PORTAL-A/' latency.log");
    expect(output).toContain('PORTAL-A');
  });

  it('resolves dig from /etc/hosts', () => {
    const output = run('dig portal-b.example.com');
    expect(output).toContain('10.0.0.6');
  });

  it('counts lines with wc', () => {
    expect(run('wc -l latency.csv')).toBe('16');
  });

  it('extracts fields with cut', () => {
    const output = run('grep portal-b latency.csv | cut -d, -f4');
    expect(output).toBe('48.7\n47.2\n46.1\n49.5\n48.0');
  });

  it('sorts numerically in a pipeline', () => {
    const output = run("grep portal-a latency.csv | awk -F, '{print $4}' | sort -n");
    expect(output).toBe('34.2\n35.6\n36.9\n38.1\n52.8');
  });

  it('computes averages with awk', () => {
    const output = run('grep portal-a latency.csv | awk -F, \'{sum += $4; n++} END {print sum/n}\'');
    expect(output).toBe('39.52');
  });

  it('rejects unsupported commands', () => {
    const parsed = parseShellCommand('bash -c id');
    expect(parsed.ok).toBeTrue();
    if (parsed.ok) {
      const result = executePipeline(parsed.pipeline, vfs);
      expect('message' in result).toBeTrue();
    }
  });

  it('simulates ping summary', () => {
    const output = run('ping -c 3 portal-a.example.com');
    expect(output).toContain('rtt min/avg/max/mdev = 31.2/35.6/41.1');
  });

  it('simulates curl write-out timing', () => {
    const output = run("curl -o /dev/null -s -w '%{http_code},%{time_total}\\n' https://portal-a.example.com");
    expect(output).toBe('200,0.182');
  });
});

describe('ShellChallengeRunnerService', () => {
  const runner = new ShellChallengeRunnerService();

  it('validates a grep exercise', () => {
    const challenge = getChallenge('cli-grep-01');
    expect(challenge).toBeDefined();
    const result = runner.validate('grep portal-a latency.csv', challenge!);
    expect(result.ok).toBeTrue();
  });

  it('validates a sed exercise', () => {
    const challenge = getChallenge('cli-sed-01');
    const result = runner.validate("sed 's/portal-a/PORTAL-A/' latency.log", challenge!);
    expect(result.ok).toBeTrue();
  });

  it('rejects malformed pipeline exercises', () => {
    const challenge = getChallenge('cli-pipe-04');
    const result = runner.validate('grep portal-a latency.csv', challenge!);
    expect(result.ok).toBeFalse();
  });
});

describe('parseCurlCommand regression', () => {
  it('still parses curl GET commands', () => {
    const parsed = parseCurlCommand('curl -s /api/hello');
    expect(parsed).not.toBeNull();
    expect(parsed!.method).toBe('GET');
    expect(parsed!.url).toBe('/api/hello');
  });
});
