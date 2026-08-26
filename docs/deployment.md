# Deployment runbook

1. Use separate Supabase projects for development, staging and production. Never copy demo users to production.
2. Rotate any credential shared in chat or stored insecurely. Keep database and service-role secrets only in an approved secret store.
3. Apply migrations to staging, run `npm run check`, then complete the role matrix in `test-strategy.md`.
4. Set `SAUTI_ENV=production`, every `ENABLE_*` flag to `false`, and configure only the public Supabase URL, publishable key and canonical site URL as browser-visible variables.
5. Confirm Supabase Auth URLs, email templates, rate limits and bot protection. Confirm `runtime_policy` disables simulation, mock payouts and demo data.
6. Deploy a preview, test `/api/health`, then promote the immutable build. Never run seed files.
7. Watch logs and Supabase metrics; retain a rollback deployment and tested database recovery plan.

The runtime has no service-role dependency. Database administration uses a separately held, rotated credential.
