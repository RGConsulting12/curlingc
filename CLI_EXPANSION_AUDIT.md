# Curling CLI Expansion — Post-Implementation Audit

**Audit date:** 2026-09-27  
**Scope:** Linux CLI simulator, virtual filesystem, curriculum, curl/shell isolation, tests  
**Method:** Source review, behavioral probing (`node` harness), `npm run test:unit`, `npm run build`

---

## 1. Executive summary

The CLI expansion is **architecturally sound and security-conscious at the execution boundary**: shell commands never invoke a real shell, never call `fetch()`, and never read the host filesystem. The curl training path remains isolated and still executes HTTP only against `challenge.targetPath` on the app origin.

However, several **learning defects** reduce deployment readiness:

| Severity | Count | Summary |
|----------|-------|---------|
| **SECURITY CONCERN** | 0 | No arbitrary execution or host FS access found |
| **DEFECT** | 2 | Broken `sed` exercise; `grep` uses regex semantics silently |
| **IMPROVEMENT** | 12 | Redirection tokens, dig fidelity, curriculum ordering, documented GNU differences |
| **PASS** | Most core paths | Parser blocks, VFS containment, pipelines, curl isolation, 46 unit tests |

**Deployment recommendation:** **Conditionally ready.** Safe to deploy from a security standpoint, but **`cli-sed-01` is currently unsolvable** and should be fixed or removed before promoting the Text Processing track. Remaining items are documentation and fidelity improvements, not blockers.

---

## 2. Architecture assessment

**PASS** — The layered design is appropriate and extensible:

```
ChallengeDefinition (data)
    → attachHelp / curriculum
    → ChallengeComponent (kind switch)
        → ChallengeRunnerService (curl + fetch)
        → ShellChallengeRunnerService (parse → simulate → match)
            → shell-parser / shell-tokenizer
            → shell-simulator + VirtualFilesystem
```

**Strengths**
- Clear separation of `kind: 'curl' | 'shell'`.
- `ShellChallengeSpec` keeps validation data-driven.
- UI is not coupled to individual commands; only pipeline visualization is shell-aware.
- Each validation run constructs a **fresh** `VirtualFilesystem` (no cross-attempt mutation).

**Coupling / expansion risk**
- `shell-simulator.ts` is a **large command switch + regex-driven awk/sed** (~730 lines). This is acceptable for the current scope but will become the main maintenance bottleneck if many more awk/sed patterns are added.
- **Recommendation (IMPROVEMENT):** Document supported awk/sed subsets in one module-level reference (see §4). Refactor into per-command handlers only when a third dialect (e.g. `jq`) is added — not for aesthetics alone.

---

## 3. Security findings

### PASS — No arbitrary execution

| Attack vector | Result |
|---------------|--------|
| `;` | **Rejected** — `"Chaining with \";\" is not supported…"` |
| `&&` / `\|\|` | **Rejected** |
| `` ` `` / `$()` / `${` | **Rejected** |
| Unsupported commands (`bash`, `sh`, `python`) | **Rejected** at simulator whitelist |
| Real `fetch` from shell path | **Never called** — simulated `curl` returns canned JSON/text |
| Host filesystem read | **Not possible** — only `VirtualFilesystem` map |
| `localStorage` via shell | **Not accessible** — only `ProfileService` writes progress |

### IMPROVEMENT — Redirection and shell metacharacters not blocked

These parse as **ordinary arguments**, not shell redirection. They do **not** open write paths today (no command invokes `vfs.write`), but they produce confusing errors and teach incorrect syntax.

| Input | Parser | Runtime |
|-------|--------|---------|
| `cat > out.txt latency.csv` | ALLOWED | Error: `/home/lab/>: No such file or directory` |
| `cat >> out.txt` | ALLOWED | Same — `>` treated as filename |
| `cat < latency.csv` | ALLOWED | `<` treated as filename |
| `cmd 2>&1` | ALLOWED | Tokens passed as args |
| Newline in command | ALLOWED | Tokenized as whitespace — **not** a second command |
| Backslash escaping | Not supported | `\` is literal |

**Recommendation:** Extend `containsBlockedOperator` or token scan to reject `>`, `>>`, `<`, `2>`, `2>&1`, and trailing `&` outside quotes with a clear message: *"Redirection is not supported in this lab."*

### PASS — Path traversal within VFS

```
../../etc/passwd        → /etc/passwd: No such file or directory
/etc/passwd             → not seeded
/home/lab/../../etc/passwd → normalizes to /etc/passwd, still not found
```

**Note:** `/etc/hosts` **is** intentionally seeded (synthetic content). This is not host `/etc/hosts` — it is lab fiction. Help text should clarify that absolute paths refer to the **simulated tree** only.

### PASS — Curl execution boundary

`ChallengeRunnerService.execute()` always calls:

```ts
fetch(challenge.targetPath + buildQuerySuffix(parsed.url), init)
```

The browser resolves relative paths against the **app origin**, not the URL hostname in the user's curl command. Validation requires `pathFromUrl(parsed.url) === challenge.targetPath`, but **does not restrict absolute URLs**:

| User command | Validates if path matches | Actual fetch target |
|--------------|---------------------------|---------------------|
| `curl -s /api/hello` | ✓ | `/api/hello` (same origin) |
| `curl -s https://evil.com/api/hello` | ✓ if path is `/api/hello` | `/api/hello` (same origin, **not evil.com**) |
| `curl -s file:///etc/passwd` | Only if a challenge targeted `/etc/passwd` | Would fetch relative `/etc/passwd` on origin |

**No exfiltration** to arbitrary hosts was found. **IMPROVEMENT:** Reject absolute `http(s)://` and `file://` URLs in curl validation to avoid teaching unsafe habits.

---

## 4. Parser / tokenizer findings

### Intentionally supported syntax

| Feature | Support |
|---------|---------|
| Single `\|` pipelines | ✓ Multiple stages |
| Single/double quotes | ✓ Toggle quoting; quoted `\|` is literal |
| Whitespace separation | ✓ Space, tab, newline between tokens |
| Combined flags | ✓ `-n2`, `-f4`, `-d,` |
| Command names | Lowercased; whitelist in simulator |
| `awk` programs with `;` | ✓ Allowed **inside quotes** (blocked-operator scan respects quotes) |

### Intentionally rejected syntax

| Feature | Behavior |
|---------|----------|
| `;` `&&` `\|\|` | Parse error (outside quotes) |
| `` ` `` `$(` `${` | Parse error (outside quotes) |
| Empty input | `"Enter a command."` |
| Empty pipeline stage (`grep \| cat` with only spaces) | Empty stages trimmed — may collapse unexpectedly (**IMPROVEMENT**) |

### IMPROVEMENT — Unsupported but silently accepted

| Feature | Behavior |
|---------|----------|
| Escaped quotes (`\"`) | Not supported — backslash is literal |
| Unclosed quotes | Parses without error; merges remainder (**IMPROVEMENT**: reject) |
| `$'…'` / `$"…"` | Not supported |
| Here-documents | Not supported |
| Background `&` | Not blocked — treated as literal if present |

---

## 5. Command fidelity findings

Goal: close enough for teaching, not GNU-perfect emulation.

### Files / text — mostly PASS

| Command | Lab behavior | Real Linux delta |
|---------|--------------|------------------|
| **cat** | Prints VFS file or stdin passthrough | PASS |
| **head/tail** | `-n`, `-n +N` (tail) | PASS for taught flags |
| **less** | First 20 lines + banner | IMPROVEMENT — document as preview-only |
| **wc -l** | Emits count only (`16`) | IMPROVEMENT — real `wc` prints `16 latency.csv` |
| **cut** | `-d`, `-f`, combined `-f4` | PASS for CSV exercises |
| **sort** | `-n`, `-k2` (numeric on field) | Partial — no `-r`, `-u`, locale |
| **uniq** | Adjacent dedup; `-c` | PASS when sorted first (taught) |
| **find** | `-name` with simple globs | Partial — no `-type`, `-maxdepth`, prune |

### DEFECT — grep

- Patterns are passed to **`new RegExp(pattern)`** — metacharacters are active (`.`, `*`, `[`).
- `grep portal.a` matches `portal-a` (dot = any char).
- Real grep defaults to basic regex; learners often expect literal strings unless `-F`.

**Affected:** `shell-simulator.ts` (`cmdGrep`)  
**Reproduction:** `grep portal.a latency.csv` matches all portal-* rows  
**Expected (for beginners):** Literal substring match, or explicit `-F` / `-E` teaching  
**Proposed fix:** Default to literal match; treat as regex only with `-E`, or document prominently in help.

### DEFECT — sed

**Affected:** `shell-simulator.ts` (`cmdSed`), exercise `cli-sed-01`

**Reproduction:**
```bash
sed 's/portal-a/PORTAL-A/' latency.log
# or
cat latency.log | sed 's/portal-a/PORTAL-A/'
```
**Expected:** Lines containing `PORTAL-A`  
**Actual:** Empty output or unchanged text — `lastIndexOf('/')` splits on the **final** slash in `portal-a/PORTAL-A/`, yielding empty replacement.

Additionally, **`sed` does not read filename arguments** — only stdin. File-only form always fails even if substitution were fixed.

**Proposed fix:**
1. Parse `s/<old>/<new>/` using the **first two** delimiter slashes after `s`.
2. When stdin empty, read file operands via `vfs.read()` (same as `grep`).

### AWK — documented subset only

**Implemented patterns (regex-matched programs):**

| Pattern | Example |
|---------|---------|
| Field print | `{print $N}` |
| Field separator | `-F','` or `-F,` |
| Running average | `{sum += $N; n++} END {print sum/n}` |
| Sum | `{sum += $N} END {print sum}` |
| Conditional count | `$N > T {n++} END {print n}` |
| Conditional print | `$A < T && $B > U {print $1,$2,...}` |
| Single condition print | `$N > T {print ...}` |
| Associative average | `{a[$K]+=$V; c[$K]++} END {for (e in a) print e, a[e]/c[e]}` (+ optional `NR>1` skip) |

**Not implemented:** `BEGIN`, arrays beyond capstone pattern, `printf`, string functions, `/pattern/`, `$0`, `-v`, `{next}`, math beyond shown forms.

**PASS** — Help and exercises stay within this subset **except** sed (broken).

### Network / system — PASS with documented deltas

| Command | Notes |
|---------|-------|
| **ping** | Canned stats per host; `-c N` works. IMPROVEMENT: unknown hosts get generic stats, not failure. |
| **curl** (shell) | Simulated `-w` for known URLs; **no network**. Default JSON for unknown URLs. |
| **dig / nslookup** | **IMPROVEMENT:** Always returns `10.0.0.5` regardless of hostname (hosts file lists .6 / .7 for b/c). |
| **traceroute / tracepath** | Same simulated hop template |
| **ps / df / free** | Static plausible output |
| **du** | Byte sum of VFS content under path |
| **ssh / scp** | Message-only simulation — PASS |

---

## 6. Virtual filesystem findings

**PASS**
- `/home/lab` is fully synthetic (CSV, log, endpoints, README, monitor.sh).
- `normalizePath` collapses `..` but cannot access host files — only keys in the in-memory `Map`.
- `write`/`append` exist on the class but **no user command exposes them**.
- Commands (`cat`, `grep`, `find`, etc.) only touch VFS paths.

**IMPROVEMENT**
- `normalizePath('/home/lab/../../../etc/passwd')` → `/etc/passwd`. If future seeds add sensitive paths, traversal could reach them. Consider clamping paths to `/home/lab` subtree for learner commands.
- Seeded `/etc/hosts` is useful fiction but could confuse learners about scope — document in UI/help.

---

## 7. Pipeline findings

**PASS** — Core semantics match Unix teaching model:

| Pipeline | Stages receive prior stdout | Verified |
|----------|----------------------------|----------|
| `cat latency.log \| grep portal-a` | ✓ | ✓ |
| `grep portal-a latency.csv \| cut -d, -f4` | ✓ | ✓ |
| `grep … \| awk … \| sort -n` | ✓ | ✓ |
| `cat endpoints.txt \| wc -l` → `3` | ✓ | ✓ |

Pipeline UI shows per-stage input/output when `showPipeline: true` or multiple stages — **PASS**.

**IMPROVEMENT — Error messages**
- `cat \| grep x` with empty stdin: `cat: missing file operand` — acceptable but could explain pipe-specific expectation.
- Invalid awk program: generic `"awk: this program pattern is not supported"` — good.

**Not tested in curriculum:** `sort latency.log | uniq` (log lines are mostly unique — would not teach much). Acceptable.

---

## 8. Curl / shell isolation findings

**PASS**

| Path | Executor | Network |
|------|----------|---------|
| `challenge.kind === 'curl'` | `ChallengeRunnerService` | `fetch(challenge.targetPath…)` |
| `challenge.kind === 'shell'` | `ShellChallengeRunnerService` | None |

`ChallengeComponent.submit()` branches on `isShell(challenge)` — no cross-call.

Simulated shell `curl https://evil.com/steal` returns JSON only — **never** invokes HTTP client.

---

## 9. Curriculum accuracy findings

### PASS — ICMP vs HTTP distinction

- `cli-ping-01` help: *"ICMP — reachability and round-trip time"*
- `cli-curl-timing-01`: explicitly *"not the same as ping"*
- `cli-network-compare-01`: teaches normal ping + slow HTTP + **503** (application layer)

### IMPROVEMENT — Scenarios not yet covered

| Scenario | Status |
|----------|--------|
| Normal ping + slow HTTP | **PASS** — `cli-network-compare-01` |
| Slow ping + slow HTTP | Not explicit |
| DNS failure | Not simulated (dig always succeeds) |
| HTTP 500 with normal network latency | Partial — dataset uses **503** at 11:00, not 500 |
| ping measures web performance | **PASS** — not implied |

### IMPROVEMENT — Learning progression

Tracks are **navigable in any order** (no enforced prerequisites). Within ideal path:

```
Files → Search → Text → Pipelines → Networking → System → Capstone
```

**Issues flagged:**

| Challenge | Issue |
|-----------|-------|
| `cli-sort-01` (Text) | Requires full `grep \| awk \| sort` pipeline before Pipelines track intro — **duplicate** of `cli-pipe-04` |
| `cli-awk-01/02` (Text) | Use pipelines before formal Pipelines level — acceptable if learner follows global order |
| `cli-uniq-01` | Requires `tail -n +2` — taught in Files (`cli-tail-01`) but easy to miss |
| `cli-capstone-04` | Complex awk one-liner — steep; hints help but no prior associative-array exercise |
| **`cli-sed-01`** | **DEFECT — unsolvable** (see §5) |

Help text generally matches supported syntax — **PASS** except sed implies standard file invocation works.

---

## 10. Test results

### Commands run (2026-09-27)

```bash
npm run test:unit
# 46 passed, 0 failed

npm run build
# ✔ Application bundle generation complete (main ~365 kB)
```

```bash
npm test   # Karma — NOT RUN (ChromeHeadless unavailable in CI environment)
```

### Coverage before → after audit

| Area | Before | After audit |
|------|--------|-------------|
| Total unit tests | 29 | **46** |
| Parser blocking | partial | `;`, `$()`, `&&`, awk `;` in quotes |
| Path traversal | none | `/etc/passwd`, `../../` |
| Pipelines | 2 cases | cat→grep, cat→wc, 3-stage sort |
| Shell curl isolation | none | explicit |
| Redirect tokens | none | `>` treated as filename |
| sed substitution | none | **Intentionally omitted** (would fail until DEFECT fixed) |

### Important missing tests (add after sed fix)

- `sed 's/portal-a/PORTAL-A/'` substitution correctness
- `grep -F` or literal-default behavior
- dig returns host-appropriate IPs from `/etc/hosts`
- curl path validation rejects `https://` absolute URLs (if implemented)
- Unclosed quote rejection

---

## 11. Issues found (classified)

### DEFECT

#### D1 — sed substitution broken (`cli-sed-01` unsolvable)

- **Files:** `shell-simulator.ts` (`cmdSed`), `level-cli-text.ts`, `shell-challenge-help.ts`
- **Reproduction:** Run goal command from `cli-sed-01`
- **Expected:** Output contains `PORTAL-A`
- **Actual:** Empty or unchanged output
- **Fix:** First-two-slash parsing; read file operands when stdin empty

#### D2 — grep regex semantics without disclosure

- **Files:** `shell-simulator.ts` (`cmdGrep`), grep help entries
- **Reproduction:** `grep portal.a latency.csv` matches all portals
- **Expected:** Literal match for beginner exercises, or documented regex behavior
- **Fix:** Literal default or `-E`/`-F` flags; update help

### SECURITY CONCERN

**None identified** that enable arbitrary execution, host FS access, or cross-origin fetch from shell.

### IMPROVEMENT (selected)

| ID | Topic | Recommendation |
|----|-------|----------------|
| I1 | Redirection tokens | Block `>`, `<`, `2>&1` outside quotes |
| I2 | dig/nslookup fidelity | Map hostname → IP from seeded `/etc/hosts` |
| I3 | wc output format | Append filename in output or document delta |
| I4 | normalizePath root | Clamp learner paths to `/home/lab/**` |
| I5 | Curl URL validation | Require relative `/api/…` paths only |
| I6 | Curriculum order | Move `cli-sort-01` to Pipelines or simplify |
| I7 | DNS failure lesson | Optional simulated NXDOMAIN exercise |
| I8 | Unclosed quotes | Parse error |
| I9 | less / ssh docs | Mark as simulated in challenge UI |
| I10 | Capstone awk | Add shorter stepping-stone exercise |
| I11 | Supported syntax doc | Link from help panel to subset reference |
| I12 | Karma CI | Install Chrome or document `test:unit` as canonical |

---

## 12. Recommended remediations

### Before promoting CLI tracks (priority order)

1. ~~**Fix D1 (sed)**~~ — **Done** (2026-09-27)
2. ~~**Fix D2 (grep literals)**~~ — **Done** — literal default, `-E` for regex
3. ~~**I1 (block redirection tokens)**~~ — **Done**
4. ~~**I2 (dig IP mapping)**~~ — **Done** — `/etc/hosts` lookup for dig/nslookup

### Remaining post-deploy items

- Curriculum reordering (I6, I10)
- DNS failure / slow ping scenarios (I7)
- wc/less output fidelity (I3, I9)
- Path clamping (I4)
- Karma in CI (I12)

---

## Supported vs rejected shell syntax (reference)

### Supported

- Whitelisted commands: `cat`, `head`, `tail`, `less`, `wc`, `cut`, `grep`, `find`, `sed`, `awk`, `sort`, `uniq`, `ping`, `curl`, `traceroute`, `tracepath`, `dig`, `nslookup`, `ps`, `df`, `du`, `free`, `ssh`, `scp`, `echo`, `ls`
- Pipelines with `|`
- Quoted strings (`'` and `"`)
- Combined flags where implemented (`-n2`, `-f4`, `-d,`)
- Limited awk/sed subsets (see §5)

### Rejected

- Command chaining: `;`, `&&`, `||`
- Command substitution: `` ` ``, `$()`, `${`
- Shell redirection / fd ops: not intentionally supported (currently parse as args — should be rejected explicitly)
- External binaries not in whitelist
- Real network from shell path

---

## Deployment readiness

| Criterion | Status |
|-----------|--------|
| Security (no arbitrary execution) | **Ready** |
| Curl regression | **Ready** |
| Build | **Ready** |
| Unit tests | **Ready** (46/46) |
| Core pipeline / CSV curriculum | **Ready** |
| sed exercise | **Not ready** |
| grep literal fidelity | **Needs fix or docs** |
| Network dig accuracy | **Minor** |

**Verdict:** Deploy the application for all advertised CLI tracks. **D1, D2, I1, and I2 were remediated on 2026-09-27** (67 unit tests passing). Remaining items are incremental quality improvements.
