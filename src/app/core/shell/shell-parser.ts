import { splitPipeline, tokenizeShell } from './shell-tokenizer';

export type ParsedCommand = {
  name: string;
  args: string[];
  raw: string;
};

export type ParsedPipeline = {
  stages: ParsedCommand[];
  raw: string;
};

const BLOCKED_OPERATORS = [';', '&&', '||', '`', '$(', '${'];
const BLOCKED_REDIRECTIONS = ['2>&1', '>>', '2>', '>', '<'];

function containsBlockedOperator(input: string): string | null {
  let quote: '"' | "'" | null = null;
  for (let i = 0; i < input.length; i += 1) {
    const char = input[i]!;
    if (quote) {
      if (char === quote) {
        quote = null;
      }
      continue;
    }
    if (char === '"' || char === "'") {
      quote = char;
      continue;
    }
    for (const op of BLOCKED_OPERATORS) {
      if (input.startsWith(op, i)) {
        return op;
      }
    }
    for (const redirect of BLOCKED_REDIRECTIONS) {
      if (input.startsWith(redirect, i)) {
        return redirect;
      }
    }
  }
  return null;
}

function blockedOperatorMessage(token: string): string {
  if (BLOCKED_REDIRECTIONS.includes(token)) {
    return `Redirection with "${token}" is not supported in this training environment.`;
  }
  return `Chaining with "${token}" is not supported in this training environment.`;
}

export type ParseShellResult =
  | { ok: true; pipeline: ParsedPipeline }
  | { ok: false; message: string };

export function parseShellCommand(input: string): ParseShellResult {
  const trimmed = input.trim();
  if (!trimmed) {
    return { ok: false, message: 'Enter a command.' };
  }

  const blocked = containsBlockedOperator(trimmed);
  if (blocked) {
    return {
      ok: false,
      message: blockedOperatorMessage(blocked),
    };
  }

  const stageStrings = splitPipeline(trimmed);
  if (!stageStrings.length) {
    return { ok: false, message: 'Could not parse that command.' };
  }

  const stages: ParsedCommand[] = [];

  for (const stageRaw of stageStrings) {
    const tokens = tokenizeShell(stageRaw);
    if (!tokens.length) {
      return { ok: false, message: 'Empty pipeline stage.' };
    }

    const [name, ...args] = tokens;
    stages.push({
      name: name!.toLowerCase(),
      args,
      raw: stageRaw,
    });
  }

  return {
    ok: true,
    pipeline: { stages, raw: trimmed },
  };
}
