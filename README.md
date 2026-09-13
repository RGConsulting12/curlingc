# Curling

A progressive curl command lab — **44 challenges** across **20 levels**, from your first GET to expert incident-response combos.

Progress is saved **locally** in your browser so you can pick up where you left off.

## Curriculum

| Levels | Topic |
|--------|--------|
| 1–2 | GET, headers |
| 3–4 | Query strings, `-s`, `-I` |
| 5–7 | Form POST, JSON, PUT/PATCH/DELETE |
| 8–10 | Basic auth, bearer/API keys, cookies |
| 11–13 | Redirects (`-L`), User-Agent/Referer, `-G` |
| 14–15 | Multipart (`-F`), GraphQL |
| 16–17 | ETags, ranges, timeouts, compression, retries |
| 18–19 | `-v`, `-w`, `-o`, OPTIONS, proxy (`-x`) |
| 20 | Expert boss levels (multi-step combos) |

## Local

```bash
npm install
npm run dev
```

`npm run dev` runs `vercel dev` so `/api/*` mock endpoints work alongside the Angular app.

UI-only (no API):

```bash
npm start
```

## Deploy on Vercel

Same flow as [silly-blanks](https://github.com/RGConsulting12/silly-blanks): GitHub remote + Vercel CLI (not Cursor origin).

```bash
npx vercel
```

Follow the prompts to link this repo to your Vercel account. Production deploy:

```bash
npx vercel --prod
```

Or connect **RGConsulting12/curlingc** in the Vercel dashboard for automatic deploys on push to `main`.

## Repo

- **GitHub:** [RGConsulting12/curlingc](https://github.com/RGConsulting12/curlingc)
