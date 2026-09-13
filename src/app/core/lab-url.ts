/** Production lab host — used in help examples and the challenge input placeholder. */
export const LAB_BASE_URL = 'https://curling.vercel.app';

/** Full API URL for a path (and optional query string), e.g. `/api/hello` or `/api/search?q=stone`. */
export function labApiUrl(pathAndQuery: string): string {
  const path = pathAndQuery.startsWith('/') ? pathAndQuery : `/${pathAndQuery}`;
  return `${LAB_BASE_URL}${path}`;
}
