# Claude Mastery Workspace (hosted version)

A training workspace for learning Claude across five levels. This version runs on your own host with:

- Email and password accounts
- Progress saved per user on the server
- An optional Claude API key per user, which turns on the live features

## What is in this folder

| File | Purpose |
| --- | --- |
| `server.js` | The server: accounts, saved progress, encrypted API keys, and the relay to Claude |
| `public/index.html` | The built workspace page (React app bundled into one file). Do not edit by hand |
| `mastery-app/` | The React source the page is built from |
| `render.yaml` | Deployment settings for Render |
| `package.json` | Dependencies (only `pg`, the Postgres driver) |

## Run it on your computer first

You need Node.js 18 or newer.

```
npm install
npm start
```

Open http://localhost:3000, create an account and try it. In this mode accounts are saved in `data/users.json`.

## Deploy for others to use

You need two free services: a database (so accounts survive restarts) and a web host.
Free tiers change, so check each provider's current limits before relying on them.

### 1. Put the code on GitHub

Already done if Claude pushed it for you. Otherwise create a private repository and upload everything here except `node_modules` and `data`.

### 2. Create a Postgres database

Use any hosted Postgres, for example Neon or Supabase. Create a project and copy its connection string. It looks like:

```
postgres://user:password@host/dbname
```

The server creates its own table on first start.

### 3. Create the web service

On Render: New > Blueprint, choose your repository. Render reads `render.yaml`. When asked, paste the connection string as `DATABASE_URL`. `SECRET` is generated for you.

On another host, set these yourself:

| Variable | Value |
| --- | --- |
| `NODE_ENV` | `production` |
| `SECRET` | A long random string. Generate one with `node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"` |
| `DATABASE_URL` | Your Postgres connection string |
| `GOOGLE_CLIENT_ID` | Optional. Turns on "Continue with Google". From Google Cloud, see below |
| `GOOGLE_CLIENT_SECRET` | Optional. Goes with the client ID |
| `CLAUDE_MODEL` | Optional. The Claude model used for live runs. Defaults to `claude-haiku-5-5` |

Build command `npm install`, start command `npm start`.

### 4. Share the link

Open the address your host gives you, create your own account, then share the address.

## Sign in with Google (optional)

1. Open console.cloud.google.com and create a project.
2. Set up the OAuth consent screen (Google Auth Platform): app name, your support email, audience External.
3. Create an OAuth client ID of type Web application.
4. Under Authorised redirect URIs add `https://YOUR-SITE.onrender.com/auth/google/callback` (and `http://localhost:3000/auth/google/callback` for local testing).
5. Copy the client ID and secret into the `GOOGLE_CLIENT_ID` and `GOOGLE_CLIENT_SECRET` environment variables and redeploy.

Once both are set, the sign-in page shows only "Continue with Google". Without them it falls back to email and password. Only the `openid` and `email` scopes are requested, so the site never sees the user's Gmail messages. A user who signs in with Google using the same email as an existing password account is signed in to that same account.

## Things to know before you share it

- **Keep `SECRET` unchanged and private.** It signs logins and encrypts saved API keys. If it changes, everyone is logged out and saved keys must be entered again.
- **Without `DATABASE_URL`, accounts are stored in a file.** Many free hosts wipe files on every restart, which would erase all accounts. Use Postgres for anything real.
- **There is no password reset or email verification.** A user who forgets their password cannot recover the account. Adding reset needs an email-sending service.
- **Anyone with the link can create an account.** There is no invite list or admin page.
- **API keys.** Each user's key is encrypted on the server and never sent back to a browser. Whoever runs the server and holds `SECRET` could technically decrypt them, so tell your users that, and suggest they set a spending limit on their key.
- **Limits.** 10 login attempts per 15 minutes per address, 40 live Claude runs per user per hour. These counters reset when the server restarts.
- **Use HTTPS.** Render and similar hosts provide it automatically. Do not run this over plain HTTP in public.
- **Free hosts sleep.** The first visit after a quiet period can take up to a minute to load.

## Updating the curriculum or the design

The page is a React app (React, TypeScript, Tailwind CSS, shadcn/ui) in the `mastery-app` folder.

- Lessons, projects, the capstone, the Readme and the Scheduler text: `mastery-app/src/curriculum.ts`
- Screens: `mastery-app/src/App.tsx`
- Mastery rules and saving: `mastery-app/src/store.ts`
- Colours and fonts: `mastery-app/src/index.css`

After editing, rebuild (needs Node 18+ and pnpm):

```
cd mastery-app
pnpm install
./build.sh
```

This rewrites `public/index.html`. Commit and redeploy.
