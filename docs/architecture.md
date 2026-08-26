# Architecture

Next.js App Router renders public and authenticated experiences. Server Components load scoped data; Server Actions mutate after fresh session and role checks. Supabase provides authentication, PostgreSQL, row-level security and storage.

PostgreSQL is the trust boundary for campaign transitions, participation, verification, immutable finance, payouts and administration. Browser state is never proof of identity, role, balance or eligibility. Signed media links are short-lived.

Environments use separate Supabase projects. Migrations are immutable and ordered. Seed data is opt-in local tooling, not deployment input. Structured logging leaves a clean adapter point for a future monitoring provider.
