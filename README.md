This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.

---

## Production Database (Hosted PostgreSQL)

The app uses PostgreSQL via Prisma. Local development runs against
`localhost:5432`; production must run against a hosted database, because a
deployed server cannot reach your local machine.

### 1. Create a hosted database

Pick one provider and copy **both** connection strings it gives you:

| Provider | Pooled URL (use for `DATABASE_URL`) | Direct URL (use for `DIRECT_URL`) |
| --- | --- | --- |
| [Neon](https://neon.tech) | host ends in `-pooler` | host without `-pooler` |
| [Supabase](https://supabase.com) | port `6543` | port `5432` |
| [Vercel Postgres](https://vercel.com/storage/postgres) | host ends in `-pooler` | host without `-pooler` |

`DATABASE_URL` is what the running app uses. `DIRECT_URL` is used only by
`prisma migrate`, which needs a long-lived session that a transaction-mode
pooler cannot provide.

> Supabase's pooler runs in transaction mode, so `?pgbouncer=true` is required
> on the pooled URL: `...:6543/postgres?pgbouncer=true`. Prisma connections
> through a pooler must not use prepared statements.

### 2. Set environment variables on your host

Never commit real credentials. Add these in your platform's dashboard
(Vercel: *Project → Settings → Environment Variables*):

| Variable | Required | Notes |
| --- | --- | --- |
| `DATABASE_URL` | yes | Pooled connection string from step 1 |
| `DIRECT_URL` | yes | Direct connection string from step 1 |
| `JWT_SECRET` | yes | Unique random value, ≥ 32 bytes. The app **refuses to start in production** if this is missing or left at the dev default |
| `NEXT_PUBLIC_APP_URL` | yes | Your real deployed origin, e.g. `https://your-app.vercel.app`, used for post-logout redirects |
| `SUPERACCESS_USERNAME` / `SUPERACCESS_PASSWORD` | yes | Admin panel credentials. Both default to empty in production, so logins fail safely until you set them |
| `UPSTASH_REDIS_REST_URL` / `UPSTASH_REDIS_REST_TOKEN` | optional | Caching no-ops when unset; every request then hits the DB/API |
| `FINNHUB_API_KEY`, `ALPHA_VANTAGE_API_KEY` | optional | Market data |
| `DEFAULT_ADMIN_EMAIL` / `DEFAULT_ADMIN_PASSWORD` | optional | Opt-in first-admin seeding. Requires an explicit password |

Generate a strong secret:

```bash
node -e "console.log(require('crypto').randomBytes(48).toString('base64url'))"
```

> **Note:** `NEXT_PUBLIC_*` values are inlined at **build** time, not read at
> runtime. Changing `NEXT_PUBLIC_APP_URL` later requires a redeploy.

### 3. Apply migrations

Migrations are **not** applied automatically by `next build`. Run them before
(or as part of) each release:

```bash
npm run db:deploy   # prisma migrate deploy — safe, non-interactive, idempotent
```

Use `npm run db:deploy` in production — never `prisma migrate dev`, which can
prompt interactively and reset data.

### 4. Verify

```bash
npm run db:status   # should print: Database schema is up to date!
```

If it reports drift, do not force-reset a production database; compare
`prisma/migrations` against the live schema first.

### Available scripts

| Script | Purpose |
| --- | --- |
| `npm run dev` | Local dev server |
| `npm run build` | `prisma generate` + `next build` |
| `npm run start` | Serve the production build |
| `npm run lint` | ESLint |
| `npm run db:migrate` | Create/apply migrations in development |
| `npm run db:deploy` | Apply committed migrations in production |
| `npm run db:status` | Check migration state against the live DB |
| `npm run db:studio` | Browse data in Prisma Studio |
