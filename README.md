# Sauti

Sauti connects artists, DJs, matatus and listeners so music can be promoted, played, discovered and measured in the real world.

## Local setup

1. Install Node.js 22 and run `npm ci`.
2. Copy `.env.example` to `.env.local` and provide the Supabase URL and publishable key. Never put a database password or service-role key in a `NEXT_PUBLIC_` variable.
3. Run `npm run dev`. Demo seed data is intentionally disabled; load `supabase/seed.sql` only into a disposable local database.

## Quality gate

Run `npm run check`. It performs lint, TypeScript checking, unit tests and a production build. CI runs the same checks on pushes and pull requests.

## Production

Apply migrations in order, configure the environment using `.env.example`, keep all demo and mock flags false, and follow [the deployment runbook](docs/deployment.md). Do not automatically deploy from an assistant run unless the operator explicitly requests it.
