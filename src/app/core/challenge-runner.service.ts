import { Injectable } from '@angular/core';
import { Challenge } from './models';
import { parseCurlCommand, pathFromUrl, queryFromUrl } from './curl-parser';

export type ValidationResult =
  | { ok: true; parsed: NonNullable<ReturnType<typeof parseCurlCommand>> }
  | { ok: false; message: string };

export type HttpResult =
  | { ok: true; preview: string; status: number }
  | { ok: false; message: string; preview?: string };

@Injectable({ providedIn: 'root' })
export class ChallengeRunnerService {
  validate(command: string, challenge: Challenge): ValidationResult {
    const parsed = parseCurlCommand(command);
    if (!parsed) {
      return { ok: false, message: 'Could not parse that command. Start with curl and a URL.' };
    }

    const path = pathFromUrl(parsed.url);
    if (!path) {
      return { ok: false, message: 'URL looks invalid.' };
    }

    if (parsed.method !== challenge.expectedMethod) {
      return {
        ok: false,
        message: `Expected HTTP ${challenge.expectedMethod}, got ${parsed.method}.`,
      };
    }

    if (path !== challenge.targetPath) {
      return { ok: false, message: `Expected path ${challenge.targetPath}, got ${path}.` };
    }

    const query = queryFromUrl(parsed.url);
    if (!query) {
      return { ok: false, message: 'Could not read query parameters from the URL.' };
    }

    if (challenge.queryParams) {
      for (const [key, expected] of Object.entries(challenge.queryParams)) {
        if (query.get(key) !== expected) {
          return { ok: false, message: `Query parameter ${key} should be ${expected}.` };
        }
      }
    }

    if (challenge.requiredHeaders) {
      for (const [name, expected] of Object.entries(challenge.requiredHeaders)) {
        const actual = parsed.headers[name.toLowerCase()];
        if (!actual || !actual.includes(expected)) {
          return { ok: false, message: `Missing or incorrect header: ${name}` };
        }
      }
    }

    if (challenge.basicAuth) {
      const auth = parsed.headers['authorization'] ?? '';
      const expected = `Basic ${btoa(
        `${challenge.basicAuth.user}:${challenge.basicAuth.pass}`,
      )}`;
      if (auth !== expected) {
        return { ok: false, message: 'Basic auth credentials are missing or incorrect. Use -u user:pass' };
      }
    }

    if (challenge.bearerToken) {
      const auth = parsed.headers['authorization'] ?? '';
      if (auth !== `Bearer ${challenge.bearerToken}`) {
        return {
          ok: false,
          message: 'Missing or incorrect Bearer token in Authorization header.',
        };
      }
    }

    if (challenge.apiKey) {
      const key = parsed.headers['x-api-key'] ?? '';
      if (key !== challenge.apiKey) {
        return { ok: false, message: 'Missing or incorrect X-API-Key header.' };
      }
    }

    if (challenge.cookies) {
      for (const [name, expected] of Object.entries(challenge.cookies)) {
        if (parsed.cookies[name] !== expected) {
          return { ok: false, message: `Missing or incorrect cookie: ${name}` };
        }
      }
    }

    if (challenge.bodyIncludes?.length) {
      const body = parsed.body ?? '';
      for (const snippet of challenge.bodyIncludes) {
        if (!body.includes(snippet)) {
          return { ok: false, message: `Request body should include: ${snippet}` };
        }
      }
    }

    if (challenge.bodyJson) {
      try {
        const json = JSON.parse(parsed.body ?? '{}') as Record<string, unknown>;
        for (const [key, expected] of Object.entries(challenge.bodyJson)) {
          if (json[key] !== expected) {
            return { ok: false, message: `JSON body field ${key} should be ${String(expected)}.` };
          }
        }
      } catch {
        return { ok: false, message: 'Request body must be valid JSON.' };
      }
    }

    if (challenge.multipartFields) {
      for (const [key, expected] of Object.entries(challenge.multipartFields)) {
        if (parsed.formFields[key] !== expected) {
          return { ok: false, message: `Form field ${key} should be ${expected}. Use -F.` };
        }
      }
    }

    if (challenge.requiredFlags) {
      for (const flag of challenge.requiredFlags) {
        if (!parsed.flags.has(flag)) {
          return { ok: false, message: `Missing required flag: ${flag}` };
        }
      }
    }

    if (challenge.flagValues) {
      for (const [flag, expected] of Object.entries(challenge.flagValues)) {
        const actual = parsed.flagValues[flag];
        if (!actual || actual !== expected) {
          return { ok: false, message: `Flag ${flag} should be set to ${expected}.` };
        }
      }
    }

    return { ok: true, parsed };
  }

  async execute(
    parsed: NonNullable<ReturnType<typeof parseCurlCommand>>,
    challenge: Challenge,
  ): Promise<HttpResult> {
    const headers: Record<string, string> = { ...parsed.headers };
    delete headers['cookie'];

    if (parsed.flags.has('--compressed')) {
      headers['accept-encoding'] = 'gzip, deflate, br';
    }

    const init: RequestInit = {
      method: parsed.method,
      headers,
    };

    if (Object.keys(parsed.formFields).length > 0) {
      const form = new FormData();
      for (const [key, value] of Object.entries(parsed.formFields)) {
        form.append(key, value);
      }
      init.body = form;
      delete headers['content-type'];
    } else if (parsed.body && parsed.method !== 'GET' && parsed.method !== 'HEAD') {
      init.body = parsed.body;
    }

    if (challenge.requiredFlags?.includes('-L')) {
      init.redirect = 'follow';
    }

    try {
      const response = await fetch(challenge.targetPath + buildQuerySuffix(parsed.url), init);
      const expected = challenge.expectStatus;
      const body =
        parsed.method === 'HEAD' ? '' : await response.text();

      const preview = [
        `HTTP/${response.status} ${response.statusText}`,
        ...Array.from(response.headers.entries()).map(([k, v]) => `${k}: ${v}`),
        '',
        body,
      ].join('\n');

      const success =
        expected !== undefined ? response.status === expected : response.ok;

      if (success) {
        return { ok: true, preview, status: response.status };
      }

      return {
        ok: false,
        message: `Expected status ${expected ?? '2xx'}, got ${response.status}.`,
        preview,
      };
    } catch {
      return { ok: false, message: 'Request failed. Check the path, flags, and auth.' };
    }
  }
}

function buildQuerySuffix(url: string): string {
  const idx = url.indexOf('?');
  return idx >= 0 ? url.slice(idx) : '';
}
