import { Injectable } from '@angular/core';
import { Challenge, ShellChallengeSpec } from './models';
import { parseShellCommand } from './shell/shell-parser';
import { executePipeline, PipelineStageResult } from './shell/shell-simulator';
import { VirtualFilesystem } from './shell/virtual-fs';

export type ShellValidationResult =
  | {
      ok: true;
      stdout: string;
      stages: PipelineStageResult[];
    }
  | { ok: false; message: string; stdout?: string; stages?: PipelineStageResult[] };

@Injectable({ providedIn: 'root' })
export class ShellChallengeRunnerService {
  validate(command: string, challenge: Challenge): ShellValidationResult {
    const spec = challenge.shell;
    if (!spec) {
      return { ok: false, message: 'This challenge has no shell configuration.' };
    }

    for (const pattern of spec.forbiddenPatterns ?? []) {
      if (command.includes(pattern)) {
        return { ok: false, message: `This lab does not allow: ${pattern}` };
      }
    }

    for (const fragment of spec.commandIncludes ?? []) {
      if (!command.includes(fragment)) {
        return { ok: false, message: `Your command should include: ${fragment}` };
      }
    }

    const parsed = parseShellCommand(command);
    if (!parsed.ok) {
      return { ok: false, message: parsed.message };
    }

    const vfs = new VirtualFilesystem(spec.cwd ?? '/home/lab');
    const executed = executePipeline(parsed.pipeline, vfs);
    if ('message' in executed) {
      return {
        ok: false,
        message: executed.message,
        stages: executed.stages,
      };
    }

    const stdout = normalizeStdout(executed.stdout);
    const outputCheck = matchStdout(stdout, spec);
    if (!outputCheck.ok) {
      return {
        ok: false,
        message: outputCheck.message,
        stdout,
        stages: executed.stages,
      };
    }

    return { ok: true, stdout, stages: executed.stages };
  }
}

function normalizeStdout(text: string): string {
  return text.replace(/\n+$/, '');
}

function matchStdout(
  stdout: string,
  spec: ShellChallengeSpec,
): { ok: true } | { ok: false; message: string } {
  const mode = spec.validationMode ?? inferMode(spec);

  if (mode === 'exact' && spec.expectedStdout !== undefined) {
    if (stdout !== normalizeStdout(spec.expectedStdout)) {
      return { ok: false, message: 'Output does not match the expected result.' };
    }
  }

  if (mode === 'regex' && spec.expectedStdoutPattern) {
    const regex = new RegExp(spec.expectedStdoutPattern, 'm');
    if (!regex.test(stdout)) {
      return { ok: false, message: 'Output does not match the expected pattern.' };
    }
  }

  for (const fragment of spec.expectedStdoutContains ?? []) {
    if (!stdout.includes(fragment)) {
      return { ok: false, message: `Expected output to include: ${fragment}` };
    }
  }

  if (spec.expectedStdoutLines?.length) {
    const lines = stdout.split('\n');
    if (spec.orderedLines) {
      const expected = spec.expectedStdoutLines.join('\n');
      if (stdout !== expected) {
        return { ok: false, message: 'Output lines are out of order or incorrect.' };
      }
    } else {
      for (const line of spec.expectedStdoutLines) {
        if (!lines.includes(line)) {
          return { ok: false, message: `Expected a line: ${line}` };
        }
      }
    }
  }

  if (
    spec.expectedStdout !== undefined &&
    mode !== 'exact' &&
    !spec.expectedStdoutContains?.length &&
    !spec.expectedStdoutLines?.length &&
    !spec.expectedStdoutPattern
  ) {
    if (!stdout.includes(spec.expectedStdout)) {
      return { ok: false, message: 'Output does not contain the expected value.' };
    }
  }

  return { ok: true };
}

function inferMode(spec: ShellChallengeSpec): ShellChallengeSpec['validationMode'] {
  if (spec.expectedStdoutPattern) {
    return 'regex';
  }
  if (spec.expectedStdoutLines?.length) {
    return spec.orderedLines ? 'exact' : 'lines';
  }
  if (spec.expectedStdout !== undefined) {
    return 'contains';
  }
  return 'contains';
}

/** Run a command in the lab VFS — useful for authoring expected outputs. */
export function previewShellCommand(command: string, cwd = '/home/lab'): string {
  const parsed = parseShellCommand(command);
  if (!parsed.ok) {
    return parsed.message;
  }
  const result = executePipeline(parsed.pipeline, new VirtualFilesystem(cwd));
  if ('message' in result) {
    return result.message;
  }
  return normalizeStdout(result.stdout);
}
