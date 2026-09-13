export type ParsedCurl = {
  method: string;
  url: string;
  headers: Record<string, string>;
};

const METHOD_FLAGS = new Set(['-X', '--request']);

export function parseCurlCommand(input: string): ParsedCurl | null {
  const tokens = tokenize(input.trim());
  if (!tokens.length || tokens[0]!.toLowerCase() !== 'curl') {
    return null;
  }

  let method = 'GET';
  let url = '';
  const headers: Record<string, string> = {};

  for (let i = 1; i < tokens.length; i += 1) {
    const token = tokens[i]!;

    if (METHOD_FLAGS.has(token)) {
      method = (tokens[i + 1] ?? 'GET').toUpperCase();
      i += 1;
      continue;
    }

    if (token === '-H' || token === '--header') {
      const header = tokens[i + 1];
      if (!header) {
        return null;
      }
      const split = header.split(':');
      const name = split.shift()?.trim();
      const value = split.join(':').trim();
      if (!name) {
        return null;
      }
      headers[name.toLowerCase()] = value;
      i += 1;
      continue;
    }

    if (token.startsWith('http://') || token.startsWith('https://')) {
      url = token;
      continue;
    }

    if (!token.startsWith('-') && !url) {
      url = token;
    }
  }

  if (!url) {
    return null;
  }

  return { method, url, headers };
}

function tokenize(input: string): string[] {
  const tokens: string[] = [];
  let current = '';
  let quote: '"' | "'" | null = null;

  for (let i = 0; i < input.length; i += 1) {
    const char = input[i]!;

    if (quote) {
      if (char === quote) {
        quote = null;
        tokens.push(current);
        current = '';
      } else {
        current += char;
      }
      continue;
    }

    if (char === '"' || char === "'") {
      quote = char;
      continue;
    }

    if (char === ' ' || char === '\t' || char === '\n') {
      if (current) {
        tokens.push(current);
        current = '';
      }
      continue;
    }

    current += char;
  }

  if (current) {
    tokens.push(current);
  }

  return tokens;
}

export function pathFromUrl(url: string): string | null {
  if (url.startsWith('/')) {
    return url;
  }
  try {
    const parsed = new URL(url);
    return parsed.pathname;
  } catch {
    return null;
  }
}
