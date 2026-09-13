import { ChallengeHelp } from './models';

/** Full explanations for every challenge, aligned with official curl documentation. */
export const challengeHelp: Record<string, ChallengeHelp> = {
  'get-hello-01': {
    explanation:
      'curl is a command-line tool for transferring data with URLs. With no extra flags, curl issues an HTTP GET request and prints the response body to stdout. The /api/hello endpoint returns a simple JSON greeting.',
    example: 'curl -s /api/hello',
    commentary:
      'Think of curl as a universal remote control for web APIs. GET is the default method — you are asking the server to send you data, not change anything. The -s (silent) flag hides curl\'s progress meter so scripts and learning exercises show only the response.',
    docUrl: 'https://curl.se/docs/manpage.html',
    docLabel: 'curl man page — URL transfer basics',
  },
  'get-users-01': {
    explanation:
      'Any URL path works the same way: curl fetches it with GET unless you override the method. /api/users returns a list resource — a common REST pattern for collections.',
    example: 'curl -s /api/users',
    commentary:
      'REST APIs organize data around resources (users, orders, stones). Listing a collection is almost always GET with no body. Once you know one GET, you know dozens — only the path changes.',
    docUrl: 'https://curl.se/docs/manpage.html',
    docLabel: 'curl man page — default GET behavior',
  },
  'header-accept-01': {
    explanation:
      'The -H (or --header) flag adds HTTP request headers. The Accept header tells the server which content types your client can handle. Many APIs return JSON only when Accept: application/json is present.',
    example: 'curl -s -H "Accept: application/json" /api/profile',
    commentary:
      'Headers are metadata about your request — like telling a waiter "I\'d like the menu in English." Servers use Accept for content negotiation: same URL, different formats (JSON vs HTML). curl does not set Accept automatically; you must add it when the API requires it.',
    docUrl: 'https://curl.se/docs/manpage.html#-H',
    docLabel: 'curl -H, --header',
  },
  'header-custom-01': {
    explanation:
      'Custom headers work identically to standard ones. APIs often use X- prefixed headers for application-specific metadata. Here, X-Lab-Client: curling identifies your client to the lab server.',
    example: 'curl -s -H "X-Lab-Client: curling" /api/lab-client',
    commentary:
      'Real APIs gate access with custom headers (API versions, tenant IDs, feature flags). Header names are case-insensitive per HTTP spec, but quoting values with spaces or special characters is good practice.',
    docUrl: 'https://curl.se/docs/manpage.html#-H',
    docLabel: 'curl -H, --header',
  },
  'query-search-01': {
    explanation:
      'Query parameters are appended to the URL after ?. Each key=value pair filters or configures the request. Here, q=stone passes the search term to /api/search.',
    example: 'curl -s "/api/search?q=stone"',
    commentary:
      'Query strings are how GET requests carry parameters without a body. Browsers do this in every search box. Quote the full URL in your shell when it contains ? or & to prevent the shell from interpreting them.',
    docUrl: 'https://curl.se/docs/manpage.html#--url',
    docLabel: 'curl URL syntax',
  },
  'query-pagination-01': {
    explanation:
      'Multiple query parameters are joined with &. page=2 selects the second page; limit=5 sets page size. Order of parameters typically does not matter to the server.',
    example: 'curl -s "/api/search?page=2&limit=5"',
    commentary:
      'Pagination is everywhere in list APIs — without it, large datasets would overwhelm clients. Learning to compose query strings is essential for debugging search, filters, and admin panels.',
    docUrl: 'https://curl.se/docs/manpage.html#--url',
    docLabel: 'curl URL syntax',
  },
  'flag-silent-01': {
    explanation:
      'The -s (--silent) flag disables curl\'s progress meter and error messages on failure. It is the standard choice in scripts where you only want the response body on stdout.',
    example: 'curl -s /api/hello',
    commentary:
      'curl\'s default progress output is helpful when learning but noisy in pipelines (curl ... | jq). Silent mode is not "quiet errors" in all cases — pair with -f (--fail) in production scripts if you need HTTP errors to exit non-zero.',
    docUrl: 'https://curl.se/docs/manpage.html#-s',
    docLabel: 'curl -s, --silent',
  },
  'flag-head-01': {
    explanation:
      'The -I (--head) flag sends an HTTP HEAD request: same headers as GET but no response body. Use it to check status, caching headers, or whether an endpoint exists without downloading content.',
    example: 'curl -I /api/health',
    commentary:
      'HEAD is ideal for health checks and monitoring — you learn if the service is up and what Content-Type it would return, with minimal bandwidth. Equivalent to curl -X HEAD.',
    docUrl: 'https://curl.se/docs/manpage.html#-I',
    docLabel: 'curl -I, --head',
  },
  'post-login-01': {
    explanation:
      'The -d (--data) flag sends data in the request body and implies POST unless you set -X otherwise. Form fields use application/x-www-form-urlencoded format: key=value pairs joined by &.',
    example: 'curl -s -d "user=admin&pass=secret" /api/login',
    commentary:
      'HTML login forms submit this same encoding. When an API expects form data rather than JSON, -d is your tool. Never put real passwords in shell history on shared machines — use env vars or credential files in production.',
    docUrl: 'https://curl.se/docs/manpage.html#-d',
    docLabel: 'curl -d, --data',
  },
  'post-echo-01': {
    explanation:
      'A single form field is still -d with message=sweep. curl sets Content-Type to application/x-www-form-urlencoded by default for -d data. The echo endpoint reflects what you sent.',
    example: 'curl -s -d "message=sweep" /api/echo',
    commentary:
      'Echo endpoints are invaluable for learning — they prove your request shape is correct before you hit a real service. If echo returns your field, your -d syntax is right.',
    docUrl: 'https://curl.se/docs/manpage.html#-d',
    docLabel: 'curl -d, --data',
  },
  'post-json-create-01': {
    explanation:
      'JSON APIs require Content-Type: application/json and a JSON body. Use -H for the header and -d for the raw JSON string. POST /api/resources with {"name":"Blue","weight":20} creates a resource; expect HTTP 201 Created.',
    example:
      'curl -s -H "Content-Type: application/json" -d \'{"name":"Blue","weight":20}\' /api/resources',
    commentary:
      'Modern APIs speak JSON. The two-step pattern — set Content-Type, send JSON body — is the foundation of REST clients. In bash, single quotes around JSON protect double quotes inside from shell expansion.',
    docUrl: 'https://curl.se/docs/manpage.html#-d',
    docLabel: 'curl -d with JSON payloads',
  },
  'post-json-update-01': {
    explanation:
      'Same JSON pattern: Content-Type header plus -d with valid JSON. Here the body is {"status":"ready"} posted to /api/echo/json, which returns what you sent for verification.',
    example: 'curl -s -H "Content-Type: application/json" -d \'{"status":"ready"}\' /api/echo/json',
    commentary:
      'Practicing on echo endpoints builds muscle memory before PUT/PATCH on real resources. Valid JSON means double-quoted keys and strings, no trailing commas.',
    docUrl: 'https://curl.se/docs/manpage.html#-H',
    docLabel: 'curl headers and JSON',
  },
  'put-item-01': {
    explanation:
      'PUT replaces an entire resource. Use -X PUT to set the method (since -d alone defaults to POST), add Content-Type: application/json, and send the full replacement body {"name":"Granite"} to /api/items/7.',
    example:
      'curl -s -X PUT -H "Content-Type: application/json" -d \'{"name":"Granite"}\' /api/items/7',
    commentary:
      'PUT vs PATCH: PUT replaces the whole resource; PATCH updates fields. REST verbs map to CRUD — PUT is "save this entire record at this URL." Always check API docs; some servers use POST for updates.',
    docUrl: 'https://curl.se/docs/manpage.html#-X',
    docLabel: 'curl -X, --request',
  },
  'patch-item-01': {
    explanation:
      'PATCH applies a partial update. -X PATCH with JSON body {"weight":42} changes only the weight field on item 7 without sending the full object.',
    example:
      'curl -s -X PATCH -H "Content-Type: application/json" -d \'{"weight":42}\' /api/items/7',
    commentary:
      'PATCH is common in mobile and SPA apps where you tweak one field. curl has no shortcut flag for PATCH — you must use -X PATCH explicitly.',
    docUrl: 'https://curl.se/docs/manpage.html#-X',
    docLabel: 'curl -X, --request',
  },
  'delete-item-01': {
    explanation:
      'DELETE removes a resource. Use -X DELETE with no body. /api/items/7 should return HTTP 204 No Content on success — an empty success response.',
    example: 'curl -s -X DELETE /api/items/7',
    commentary:
      'DELETE is idempotent in REST design: deleting the same resource twice may return 404 the second time. Many APIs require auth for DELETE — combine with -u or Bearer headers in real systems.',
    docUrl: 'https://curl.se/docs/manpage.html#-X',
    docLabel: 'curl -X DELETE',
  },
  'auth-basic-read-01': {
    explanation:
      'The -u (--user) flag sends HTTP Basic authentication. Format is username:password. curl encodes them into the Authorization header automatically. Credentials here are curl-lab:rocks for GET /api/secure.',
    example: 'curl -s -u curl-lab:rocks /api/secure',
    commentary:
      'Basic auth is simple but sends credentials on every request (base64-encoded, not encrypted unless HTTPS). Fine for internal tools; prefer OAuth or tokens for public APIs. curl also accepts -u user (prompts for password).',
    docUrl: 'https://curl.se/docs/manpage.html#-u',
    docLabel: 'curl -u, --user',
  },
  'auth-basic-write-01': {
    explanation:
      'Combine -u for authentication with -d for the form body. POST note=classified to /api/secure while authenticating as curl-lab:rocks.',
    example: 'curl -s -u curl-lab:rocks -d "note=classified" /api/secure',
    commentary:
      'Authenticated writes are the norm in admin APIs. Order of flags rarely matters — group auth (-u), headers (-H), data (-d), then URL. Test read access before write access when debugging 401/403 errors.',
    docUrl: 'https://curl.se/docs/manpage.html#-u',
    docLabel: 'curl -u with POST data',
  },
  'auth-bearer-01': {
    explanation:
      'Bearer tokens go in the Authorization header: Authorization: Bearer <token>. Use -H to set it. Token for this challenge: lab-token-42 on GET /api/admin.',
    example: 'curl -s -H "Authorization: Bearer lab-token-42" /api/admin',
    commentary:
      'OAuth 2.0 and JWT APIs almost always use Bearer tokens. Unlike Basic auth, there is no curl shortcut — you build the header yourself. Tokens expire; 401 often means refresh your token.',
    docUrl: 'https://curl.se/docs/manpage.html#-H',
    docLabel: 'curl -H Authorization header',
  },
  'auth-api-key-01': {
    explanation:
      'Some services use a dedicated API key header instead of Bearer. Here, X-API-Key: lab-key-99 is required for GET /api/metrics. Set it with -H.',
    example: 'curl -s -H "X-API-Key: lab-key-99" /api/metrics',
    commentary:
      'API key header names vary (X-API-Key, Api-Key, x-api-key). Check the provider docs. Treat keys like passwords — use environment variables in scripts: curl -H "X-API-Key: $API_KEY" ...',
    docUrl: 'https://curl.se/docs/manpage.html#-H',
    docLabel: 'curl custom headers',
  },
  'cookie-session-01': {
    explanation:
      'The -b (--cookie) flag sends cookies in the Cookie header. Format is name=value. Send session=abc123 so GET /api/session/me returns your session profile.',
    example: 'curl -s -b "session=abc123" /api/session/me',
    commentary:
      'Browsers store cookies automatically; curl does not. You copy cookies from DevTools or a prior login response (-c saves cookies to a file). Sessions tie requests to a logged-in user on the server.',
    docUrl: 'https://curl.se/docs/manpage.html#-b',
    docLabel: 'curl -b, --cookie',
  },
  'cookie-multi-01': {
    explanation:
      'Multiple cookies go in one -b string, separated by semicolons: session=abc123;theme=dark. Both are sent on GET /api/session/preferences.',
    example: 'curl -s -b "session=abc123;theme=dark" /api/session/preferences',
    commentary:
      'This mirrors how browsers send Cookie headers. For many cookies across sessions, curl -b cookiejar.txt reuses a saved jar from curl -c cookiejar.txt after login.',
    docUrl: 'https://curl.se/docs/manpage.html#-b',
    docLabel: 'curl -b multiple cookies',
  },
  'redirect-follow-01': {
    explanation:
      'By default curl does not follow HTTP redirects (3xx responses). The -L (--location) flag tells curl to follow Location headers. /api/redirect returns 302; -L reaches the final destination.',
    example: 'curl -s -L /api/redirect',
    commentary:
      'Redirects move clients to a new URL (HTTP → HTTPS, short links, auth flows). Without -L you only see the redirect response, not the final content. curl limits redirect chains to avoid infinite loops.',
    docUrl: 'https://curl.se/docs/manpage.html#L',
    docLabel: 'curl -L, --location',
  },
  'redirect-chain-01': {
    explanation:
      '/api/hop redirects twice. A single -L follows the full chain until a non-redirect response or the redirect limit is hit.',
    example: 'curl -s -L /api/hop',
    commentary:
      'Multi-hop redirects appear in OAuth, CDN edge routing, and legacy URL migrations. -s -L is a common script combo: follow redirects, print only the final body.',
    docUrl: 'https://curl.se/docs/manpage.html#L',
    docLabel: 'curl redirect following',
  },
  'meta-user-agent-01': {
    explanation:
      'The -A (--user-agent) flag sets the User-Agent header. Some APIs block or tailor responses by client. /api/agent requires User-Agent: CurlingLab/1.0.',
    example: 'curl -s -A "CurlingLab/1.0" /api/agent',
    commentary:
      'User-Agent identifies your client (browser, bot, mobile app). Servers use it for analytics, compatibility, or blocking scrapers. -A is shorthand for -H "User-Agent: ...".',
    docUrl: 'https://curl.se/docs/manpage.html#-A',
    docLabel: 'curl -A, --user-agent',
  },
  'meta-referer-01': {
    explanation:
      'The -e (--referer) flag sets the Referer header (historical spelling retained in HTTP). It indicates which page linked to this request. /api/referer expects Referer: https://curling.lab/docs.',
    example: 'curl -s -e "https://curling.lab/docs" /api/referer',
    commentary:
      'Referer headers support analytics, hotlink protection, and CSRF checks. Some APIs reject requests without an expected Referer. Equivalent to -H "Referer: ...".',
    docUrl: 'https://curl.se/docs/manpage.html#-e',
    docLabel: 'curl -e, --referer',
  },
  'get-data-urlencode-01': {
    explanation:
      'Normally -d implies POST. The -G (--get) flag converts -d data into URL query parameters on a GET request. -G -d "q=hello world" builds /api/search?q=hello+world (spaces encoded).',
    example: 'curl -s -G -d "q=hello world" /api/search',
    commentary:
      'Some legacy APIs use GET with query parameters built from form fields. -G is the bridge. For complex values, prefer --data-urlencode with -G for proper encoding of &, =, and spaces.',
    docUrl: 'https://curl.se/docs/manpage.html#-G',
    docLabel: 'curl -G, --get',
  },
  'get-data-urlencode-02': {
    explanation:
      'Combine -G with --data-urlencode to safely add query parameters. --data-urlencode status=active produces /api/search?status=active with correct encoding for special characters.',
    example: 'curl -s -G --data-urlencode "status=active" /api/search',
    commentary:
      '--data-urlencode is the safer sibling of -d when values contain reserved characters. In scripts, prefer it over manual URL encoding to avoid subtle bugs.',
    docUrl: 'https://curl.se/docs/manpage.html#--data-urlencode',
    docLabel: 'curl --data-urlencode',
  },
  'multipart-upload-01': {
    explanation:
      'The -F (--form) flag sends multipart/form-data, used for file uploads and mixed field types. -F "photo=sweep.jpg" posts a form field named photo with that value to /api/upload.',
    example: 'curl -s -F "photo=sweep.jpg" /api/upload',
    commentary:
      'Multipart is how browsers upload files. curl sets Content-Type and boundaries automatically with -F. For real files use -F "photo=@/path/to/file.jpg" (@ prefix uploads file contents).',
    docUrl: 'https://curl.se/docs/manpage.html#-F',
    docLabel: 'curl -F, --form',
  },
  'multipart-meta-01': {
    explanation:
      'Multiple -F flags add multiple parts to the same multipart request. Send photo=sweep.jpg and team=skip together in one POST to /api/upload.',
    example: 'curl -s -F "photo=sweep.jpg" -F "team=skip" /api/upload',
    commentary:
      'Real uploads often mix files and metadata (user ID, album name). Each -F is one part of the form. This pattern maps directly to HTML <form enctype="multipart/form-data">.',
    docUrl: 'https://curl.se/docs/manpage.html#-F',
    docLabel: 'curl multipart form fields',
  },
  'graphql-query-01': {
    explanation:
      'GraphQL uses a single POST endpoint with a JSON body containing a "query" string. POST to /api/graphql with Content-Type: application/json and a body whose query field requests stones.',
    example:
      'curl -s -H "Content-Type: application/json" -d \'{"query":"{ stones }"}\' /api/graphql',
    commentary:
      'Unlike REST\'s many URLs, GraphQL sends all operations to one endpoint. The query language selects fields you need — no over-fetching. curl is a standard tool for GraphQL debugging alongside GraphiQL.',
    docUrl: 'https://curl.se/docs/manpage.html#-d',
    docLabel: 'curl POST with JSON body',
  },
  'graphql-mutation-01': {
    explanation:
      'Mutations are POST requests too, with a JSON body containing a "mutation" string. Include a mutation that sets the skip name to "Nova" in the body sent to /api/graphql.',
    example:
      'curl -s -H "Content-Type: application/json" -d \'{"query":"mutation { setSkip(name: \\"Nova\\") }"}\' /api/graphql',
    commentary:
      'Queries read data; mutations change it. Both use POST in most GraphQL servers. Escape quotes carefully in shell JSON — or put the body in a file: curl -d @mutation.json ...',
    docUrl: 'https://curl.se/docs/manpage.html#-d',
    docLabel: 'curl -d JSON payloads',
  },
  'conditional-etag-01': {
    explanation:
      'Conditional GET saves bandwidth. Send If-None-Match: "v1" with -H. If the server\'s ETag still matches, it returns HTTP 304 Not Modified with no body instead of resending data.',
    example: 'curl -s -H \'If-None-Match: "v1"\' /api/cache',
    commentary:
      'ETags are fingerprints of a resource version. Clients cache responses and revalidate with If-None-Match. Critical for mobile apps and CDNs — you only download when content actually changed.',
    docUrl: 'https://curl.se/docs/manpage.html#-H',
    docLabel: 'curl conditional request headers',
  },
  'conditional-range-01': {
    explanation:
      'The Range header requests a byte slice of the response. Range: bytes=0-3 fetches the first four bytes of /api/range. Servers return HTTP 206 Partial Content when honoring ranges.',
    example: 'curl -s -H "Range: bytes=0-3" /api/range',
    commentary:
      'Range requests power video streaming, resume downloads, and large-file partial reads. Not all servers support ranges — look for Accept-Ranges in response headers.',
    docUrl: 'https://curl.se/docs/manpage.html#-H',
    docLabel: 'curl Range requests',
  },
  'perf-max-time-01': {
    explanation:
      '--max-time 10 caps the total transfer time at 10 seconds. curl aborts if /api/slow does not complete within that limit. Prevents hung scripts waiting forever.',
    example: 'curl -s --max-time 10 /api/slow',
    commentary:
      'Timeouts are essential in automation and incident response. Pair --max-time (total time) with --connect-timeout (TCP handshake only) for finer control. Always set timeouts when curling production services from cron jobs.',
    docUrl: 'https://curl.se/docs/manpage.html#--max-time',
    docLabel: 'curl --max-time',
  },
  'perf-compressed-01': {
    explanation:
      '--compressed tells curl to send Accept-Encoding: gzip, deflate, br and automatically decompress the response body. Use it on GET /api/stats for smaller transfers.',
    example: 'curl -s --compressed /api/stats',
    commentary:
      'Compression reduces bandwidth; curl hides decompression from you. Most browsers do this automatically. Useful when debugging APIs that return large JSON payloads.',
    docUrl: 'https://curl.se/docs/manpage.html#--compressed',
    docLabel: 'curl --compressed',
  },
  'perf-retry-01': {
    explanation:
      '--retry 3 retries the request up to 3 times on transient failures (specific HTTP codes and connection errors). Use it against /api/flaky which may fail intermittently.',
    example: 'curl -s --retry 3 /api/flaky',
    commentary:
      'Retries help with flaky networks and rate-limited services — but can amplify load if misused on POST. curl\'s default retry delay increases exponentially. For idempotent GETs, retries are generally safe.',
    docUrl: 'https://curl.se/docs/manpage.html#--retry',
    docLabel: 'curl --retry',
  },
  'debug-verbose-01': {
    explanation:
      'The -v (--verbose) flag prints request and response headers, TLS handshake details, and connection info to stderr while the body still goes to stdout. Essential for debugging /api/hello.',
    example: 'curl -v /api/hello',
    commentary:
      'When a request fails mysteriously, -v is step one: see exactly what was sent and received. stderr vs stdout separation lets you pipe the body: curl -vs ... 2>trace.log | jq .',
    docUrl: 'https://curl.se/docs/manpage.html#-v',
    docLabel: 'curl -v, --verbose',
  },
  'debug-writeout-01': {
    explanation:
      '-w (--write-out) prints custom information after the transfer. "%{http_code}" outputs the numeric HTTP status. Useful to check status without printing the full body.',
    example: 'curl -s -w "%{http_code}" -o /dev/null /api/hello',
    commentary:
      'Write-out variables include %{time_total}, %{url_effective}, and %{content_type} — great for benchmarks and health checks. -o /dev/null discards the body when you only care about metadata.',
    docUrl: 'https://curl.se/docs/manpage.html#-w',
    docLabel: 'curl -w, --write-out',
  },
  'debug-output-01': {
    explanation:
      'The -o (--output) flag writes the response body to a file instead of stdout. -o hello.json saves GET /api/hello response to hello.json on disk.',
    example: 'curl -s -o hello.json /api/hello',
    commentary:
      'Downloading artifacts, saving API snapshots, and scripting file pipelines all use -o. Use -O (uppercase) to save with the remote filename. Combine with -w for download progress in scripts.',
    docUrl: 'https://curl.se/docs/manpage.html#-o',
    docLabel: 'curl -o, --output',
  },
  'method-options-01': {
    explanation:
      'OPTIONS discovers what methods and headers a server allows — important for CORS preflight. Use -X OPTIONS to send OPTIONS /api/resources and read Allowed methods in the response.',
    example: 'curl -s -X OPTIONS /api/resources',
    commentary:
      'Browsers send OPTIONS automatically before cross-origin PUT/DELETE. API developers use curl OPTIONS to verify CORS config without opening DevTools. No body is typically sent.',
    docUrl: 'https://curl.se/docs/manpage.html#-X',
    docLabel: 'curl -X OPTIONS',
  },
  'method-proxy-flag-01': {
    explanation:
      'The -x (--proxy) flag routes the request through an HTTP proxy. -x http://proxy.lab:8080 sends GET /api/hello via that proxy. The lab accepts any proxy value for learning.',
    example: 'curl -s -x http://proxy.lab:8080 /api/hello',
    commentary:
      'Corporate networks and debugging tools (Charles, mitmproxy) use proxies to inspect traffic. In production, only trust proxies you control — TLS termination and credential exposure are real risks.',
    docUrl: 'https://curl.se/docs/manpage.html#-x',
    docLabel: 'curl -x, --proxy',
  },
  'boss-webhook-01': {
    explanation:
      'Webhooks combine POST, JSON body, Content-Type, and Bearer auth. POST {"event":"score"} to /api/webhook with Authorization: Bearer lab-token-42 and Content-Type: application/json.',
    example:
      'curl -s -H "Authorization: Bearer lab-token-42" -H "Content-Type: application/json" -d \'{"event":"score"}\' /api/webhook',
    commentary:
      'Webhook delivery is a real-world pattern: GitHub, Stripe, and Slack all POST signed JSON to your URL. Mastering header + body composition in one curl command mirrors production integration debugging.',
    docUrl: 'https://curl.se/docs/manpage.html',
    docLabel: 'curl man page — combining flags',
  },
  'boss-incident-01': {
    explanation:
      'Incident response often requires stacking auth mechanisms. GET /api/incident?incident=42 needs basic auth (curl-lab:rocks), cookie session=abc123, and the query parameter incident=42 in one command.',
    example:
      'curl -s -u curl-lab:rocks -b "session=abc123" "/api/incident?incident=42"',
    commentary:
      'Production debugging is rarely a single flag — you layer credentials, session state, and filters. Build the command incrementally: auth first, then cookies, then query params, verifying each with -v.',
    docUrl: 'https://curl.se/docs/manpage.html',
    docLabel: 'curl man page — authentication and cookies',
  },
  'boss-pipeline-01': {
    explanation:
      'The full pipeline challenge combines -L (follow redirect), POST with JSON body {"action":"deploy"}, Bearer token lab-token-42, and Content-Type: application/json on /api/pipeline.',
    example:
      'curl -s -L -X POST -H "Authorization: Bearer lab-token-42" -H "Content-Type: application/json" -d \'{"action":"deploy"}\' /api/pipeline',
    commentary:
      'Deploy pipelines, CI hooks, and orchestration APIs often look exactly like this: authenticated JSON POST that may redirect to a status URL. Expert curl users read requirements, stack flags confidently, and verify with -v when something returns unexpected 3xx or 401.',
    docUrl: 'https://curl.se/docs/manpage.html',
    docLabel: 'curl man page — full request control',
  },
};

export function attachHelp<T extends { id: string }>(challenge: T): T & { help: ChallengeHelp } {
  const help = challengeHelp[challenge.id];
  if (!help) {
    throw new Error(`Missing help content for challenge: ${challenge.id}`);
  }
  return { ...challenge, help };
}
