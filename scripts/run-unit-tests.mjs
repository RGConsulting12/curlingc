#!/usr/bin/env node
import { execSync } from 'node:child_process';
import { createRequire } from 'node:module';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, '..');
const require = createRequire(import.meta.url);

execSync('npx tsc -p tsconfig.node-test.json', { cwd: root, stdio: 'inherit' });

const { parseShellCommand } = require('../.test-out/app/core/shell/shell-parser.js');
const { executePipeline } = require('../.test-out/app/core/shell/shell-simulator.js');
const { VirtualFilesystem } = require('../.test-out/app/core/shell/virtual-fs.js');
const { ShellChallengeRunnerService } = require('../.test-out/app/core/shell-challenge-runner.service.js');
const { getChallenge } = require('../.test-out/app/core/curriculum.js');
const { parseCurlCommand } = require('../.test-out/app/core/curl-parser.js');

let passed = 0;
let failed = 0;

function assert(condition, message) {
  if (!condition) {
    failed += 1;
    console.error(`FAIL: ${message}`);
    return;
  }
  passed += 1;
}

function run(command, cwd = '/home/lab') {
  const parsed = parseShellCommand(command);
  assert(parsed.ok, `parse failed: ${command}`);
  if (!parsed.ok) {
    return '';
  }
  const result = executePipeline(parsed.pipeline, new VirtualFilesystem(cwd));
  assert(!('message' in result), `execute failed: ${command} -> ${result.message ?? ''}`);
  if ('message' in result) {
    return '';
  }
  return result.stdout.replace(/\n+$/, '');
}

console.log('Running CLI lab unit tests...\n');

assert(parseShellCommand('cat latency.csv').ok, 'parses cat');
assert(parseShellCommand('cat latency.csv | grep portal-a').pipeline?.stages.length === 2, 'parses pipeline');
assert(!parseShellCommand('cat latency.csv; rm -rf /').ok, 'blocks semicolon chaining');
assert(!parseShellCommand('echo $(whoami)').ok, 'blocks command substitution');
assert(!parseShellCommand('cat latency.csv && echo no').ok, 'blocks && chaining');
assert(parseShellCommand("grep portal-a latency.csv | awk -F, '{sum += $4; n++} END {print sum/n}'").ok, 'allows awk semicolons inside quotes');
assert(parseShellCommand('grep "portal a" latency.log').ok, 'parses double-quoted patterns');
assert(parseShellCommand('cat "latency.csv"').pipeline?.stages[0]?.args[0] === 'latency.csv', 'strips double quotes from filenames');

const vfs = new VirtualFilesystem('/home/lab');
let traversalError = '';
try {
  vfs.read('../../etc/passwd');
} catch (error) {
  traversalError = error.message;
}
assert(traversalError.includes('No such file or directory'), 'path traversal outside VFS is not readable');
assert(!vfs.exists('/etc/passwd'), '/etc/passwd is not seeded in the lab VFS');

const redirectParse = parseShellCommand('cat > hacked.txt latency.csv');
assert(!redirectParse.ok && redirectParse.message.includes('Redirection'), 'blocks > redirection at parse time');
assert(!parseShellCommand('cat latency.csv >> out.txt').ok, 'blocks >> redirection');
assert(!parseShellCommand('cmd 2>&1').ok, 'blocks 2>&1 redirection');

const sedDirect = run("sed 's/portal-a/PORTAL-A/' latency.log");
assert(sedDirect.includes('PORTAL-A') && !sedDirect.includes(' portal-a '), 'sed substitutes on file operands');
const sedPipe = run("cat latency.log | sed 's/portal-a/PORTAL-A/'");
assert(sedPipe.includes('PORTAL-A'), 'sed substitutes in a pipeline');

const literalGrep = run('grep portal.a latency.csv');
assert(!literalGrep.includes('portal-b,'), 'grep uses literal match by default');
const regexGrep = run('grep -E portal- latency.csv');
assert(regexGrep.includes('portal-a') && regexGrep.includes('portal-b,'), 'grep -E enables regex patterns');

const digB = run('dig portal-b.example.com');
assert(digB.includes('10.0.0.6'), 'dig resolves portal-b from /etc/hosts');
const nslookupB = run('nslookup portal-b.example.com');
assert(nslookupB.includes('10.0.0.6'), 'nslookup resolves portal-b from /etc/hosts');

assert(run('cat endpoints.txt | wc -l') === '3', 'pipeline cat to wc counts endpoint lines');
assert(
  run('cat latency.log | grep portal-a').includes('ping_avg='),
  'pipeline cat to grep filters log lines',
);
assert(
  run('grep portal-a latency.csv | awk -F, \'{print $4}\' | sort -n') === '34.2\n35.6\n36.9\n38.1\n52.8',
  'three-stage pipeline preserves order',
);

const shellCurl = executePipeline(
  parseShellCommand('curl -s https://evil.example/secret').pipeline,
  new VirtualFilesystem('/home/lab'),
);
assert(
  !('message' in shellCurl) && shellCurl.stdout.includes('evil.example') && !shellCurl.stdout.startsWith('HTTP/'),
  'simulated shell curl never performs HTTP fetch',
);

const grepOut = run('grep portal-a latency.csv');
assert(grepOut.includes('portal-a') && !grepOut.includes('portal-b,'), 'grep filters portal-a');
assert(run('wc -l latency.csv') === '16', 'wc counts lines');
assert(
  run('grep portal-b latency.csv | cut -d, -f4') === '48.7\n47.2\n46.1\n49.5\n48.0',
  'cut after grep',
);
assert(
  run("grep portal-a latency.csv | awk -F, '{print $4}' | sort -n") === '34.2\n35.6\n36.9\n38.1\n52.8',
  'pipeline sort -n',
);
assert(
  run('grep portal-a latency.csv | awk -F, \'{sum += $4; n++} END {print sum/n}\'') === '39.52',
  'awk average',
);

const unsupported = executePipeline(
  parseShellCommand('bash -c id').pipeline,
  new VirtualFilesystem('/home/lab'),
);
assert('message' in unsupported, 'rejects unsupported bash command');

assert(run('ping -c 3 portal-a.example.com').includes('rtt min/avg/max/mdev = 31.2/35.6/41.1'), 'ping summary');
assert(
  run("curl -o /dev/null -s -w '%{http_code},%{time_total}\\n' https://portal-a.example.com") === '200,0.182',
  'curl write-out',
);

const runner = new ShellChallengeRunnerService();
const grepChallenge = getChallenge('cli-grep-01');
assert(runner.validate('grep portal-a latency.csv', grepChallenge).ok, 'validates grep exercise');
const sedChallenge = getChallenge('cli-sed-01');
assert(runner.validate("sed 's/portal-a/PORTAL-A/' latency.log", sedChallenge).ok, 'validates sed exercise');
assert(!runner.validate('grep portal-a latency.csv', getChallenge('cli-pipe-04')).ok, 'rejects incomplete pipeline exercise');

const curlParsed = parseCurlCommand('curl -s /api/hello');
assert(curlParsed?.method === 'GET' && curlParsed.url === '/api/hello', 'curl parser regression');

console.log(`\n${passed} passed, ${failed} failed`);
process.exit(failed ? 1 : 0);
