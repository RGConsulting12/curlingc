export type ParsedCurl = {
  method: string;
  url: string;
  headers: Record<string, string>;
  body?: string;
  formFields: Record<string, string>;
  cookies: Record<string, string>;
  basicAuth?: { user: string; pass: string };
  flags: Set<string>;
  flagValues: Record<string, string>;
};

const METHOD_FLAGS = new Set(['-X', '--request']);
const BOOL_FLAGS = new Set([
  '-s',
  '--silent',
  '-L',
  '--location',
  '-I',
  '--head',
  '-i',
  '--include',
  '-v',
  '--verbose',
  '-G',
  '--get',
  '-k',
  '--insecure',
  '--compressed',
]);
const VALUE_FLAGS = new Set([
  '-H',
  '--header',
  '-d',
  '--data',
  '--data-raw',
  '--data-binary',
  '--data-urlencode',
  '-u',
  '--user',
  '-b',
  '--cookie',
  '-F',
  '--form',
  '-A',
  '--user-agent',
  '-e',
  '--referer',
  '-o',
  '--output',
  '-w',
  '--write-out',
  '--max-time',
  '--retry',
  '-x',
  '--proxy',
  '--cacert',
]);

export function parseCurlCommand(input: string): ParsedCurl | null {
  const tokens = tokenize(input.trim());
  if (!tokens.length || tokens[0]!.toLowerCase() !== 'curl') {
    return null;
  }

  let method = 'GET';
  let url = '';
  let body = '';
  const headers: Record<string, string> = {};
  const formFields: Record<string, string> = {};
  const cookies: Record<string, string> = {};
  const flags = new Set<string>();
  const flagValues: Record<string, string> = {};
  let basicAuth: { user: string; pass: string } | undefined;
  let useGetWithData = false;

  for (let i = 1; i < tokens.length; i += 1) {
    const token = tokens[i]!;

    if (BOOL_FLAGS.has(token)) {
      flags.add(normalizeFlag(token));
      if (token === '-I' || token === '--head') {
        method = 'HEAD';
      }
      if (token === '-G' || token === '--get') {
        useGetWithData = true;
      }
      continue;
    }

    if (METHOD_FLAGS.has(token)) {
      method = (tokens[i + 1] ?? 'GET').toUpperCase();
      i += 1;
      continue;
    }

    if (VALUE_FLAGS.has(token)) {
      const value = tokens[i + 1];
      if (!value) {
        return null;
      }
      const normalized = normalizeFlag(token);

      flags.add(normalized);

      if (token === '-H' || token === '--header') {
        const split = value.split(':');
        const name = split.shift()?.trim();
        const headerValue = split.join(':').trim();
        if (!name) {
          return null;
        }
        headers[name.toLowerCase()] = headerValue;
      } else if (
        token === '-d' ||
        token === '--data' ||
        token === '--data-raw' ||
        token === '--data-binary' ||
        token === '--data-urlencode'
      ) {
        body = body ? `${body}&${value}` : value;
        if (!METHOD_FLAGS.has(tokens[i - 2] ?? '') && method === 'GET') {
          method = useGetWithData ? 'GET' : 'POST';
        }
      } else if (token === '-u' || token === '--user') {
        const [user, pass = ''] = value.split(':');
        basicAuth = { user, pass };
      } else if (token === '-b' || token === '--cookie') {
        for (const part of value.split(';')) {
          const [name, cookieValue = ''] = part.split('=');
          if (name?.trim()) {
            cookies[name.trim()] = cookieValue.trim();
          }
        }
      } else if (token === '-F' || token === '--form') {
        const eq = value.indexOf('=');
        if (eq > 0) {
          const key = value.slice(0, eq);
          const raw = value.slice(eq + 1);
          formFields[key] = raw.startsWith('@') ? raw.slice(1) : raw;
        }
        if (method === 'GET') {
          method = 'POST';
        }
      } else if (token === '-A' || token === '--user-agent') {
        headers['user-agent'] = value;
      } else if (token === '-e' || token === '--referer') {
        headers['referer'] = value;
      } else {
        flagValues[normalized] = value;
      }

      i += 1;
      continue;
    }

    if (token.startsWith('http://') || token.startsWith('https://') || token.startsWith('/')) {
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

  if (useGetWithData && body) {
    const joiner = url.includes('?') ? '&' : '?';
    url = `${url}${joiner}${body}`;
    body = '';
  }

  if (basicAuth) {
    headers['authorization'] =
      `Basic ${btoa(`${basicAuth.user}:${basicAuth.pass}`)}`;
  }

  if (Object.keys(formFields).length > 0) {
    headers['content-type'] = headers['content-type'] ?? 'multipart/form-data';
  } else if (body && !headers['content-type']) {
    headers['content-type'] = 'application/x-www-form-urlencoded';
  }

  if (Object.keys(cookies).length > 0) {
    headers['cookie'] = Object.entries(cookies)
      .map(([name, value]) => `${name}=${value}`)
      .join('; ');
  }

  return {
    method,
    url,
    headers,
    body: body || undefined,
    formFields,
    cookies,
    basicAuth,
    flags,
    flagValues,
  };
}

function normalizeFlag(flag: string): string {
  const aliases: Record<string, string> = {
    '--silent': '-s',
    '--location': '-L',
    '--head': '-I',
    '--include': '-i',
    '--verbose': '-v',
    '--get': '-G',
    '--header': '-H',
    '--data': '-d',
    '--data-raw': '-d',
    '--data-binary': '-d',
    '--data-urlencode': '-d',
    '--user': '-u',
    '--cookie': '-b',
    '--form': '-F',
    '--user-agent': '-A',
    '--referer': '-e',
    '--output': '-o',
    '--write-out': '-w',
    '--insecure': '-k',
    '--proxy': '-x',
  };
  return aliases[flag] ?? flag;
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
  const raw = url.split('?')[0] ?? url;
  if (raw.startsWith('/')) {
    return raw;
  }
  try {
    return new URL(raw).pathname;
  } catch {
    return null;
  }
}

export function queryFromUrl(url: string): URLSearchParams | null {
  const query = url.includes('?') ? url.split('?')[1] : '';
  if (url.startsWith('/')) {
    return new URLSearchParams(query ?? '');
  }
  try {
    return new URL(url).searchParams;
  } catch {
    return null;
  }
}

export function hasFlag(parsed: ParsedCurl, flag: string): boolean {
  return parsed.flags.has(flag);
}
