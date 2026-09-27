# Curling

A progressive Linux CLI learning lab — **80 challenges** across **curl**, **files**, **grep/awk pipelines**, **network diagnostics**, and a **latency monitor capstone**. Commands run in a **safe browser-side simulator** (no real shell on Vercel).

Progress is saved **locally** in your browser so you can pick up where you left off.

## Curriculum

| Track | Topic |
|-------|--------|
| **Curl** (20 levels) | GET, headers, auth, redirects, GraphQL, boss combos |
| **Files** | cat, head, tail, less, wc, cut |
| **Search** | grep, find |
| **Text Processing** | sort, uniq, sed, awk |
| **Pipelines** | Unix `\|` composition on `latency.csv` / `latency.log` |
| **Networking** | ping, curl timing, dig, traceroute, ICMP vs HTTP |
| **System** | ps, df, du, free, ssh, scp (simulated) |
| **Challenges** | Build a Linux Latency Monitor capstone |

Simulated dataset: `latency.csv` with ping and HTTP measurements for portal-a/b/c.

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

Unit tests (simulator/parser — no browser required):

```bash
npm run test:unit
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
