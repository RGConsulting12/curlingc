# Curling

A progressive curl command lab. Start with trivial GET requests and climb through headers, auth, cookies, redirects, and more.

Progress is saved **locally** in your browser so you can pick up where you left off.

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
