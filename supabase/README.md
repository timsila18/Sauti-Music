# Sauti database

The initial migration models the MVP path from artist-owned songs through approved campaigns, DJ/matatu participation, qualified play events and auditable ledger credits.

## Accounting rules

- `ledger_transactions` is the financial source of truth; wallet balances are derived by `wallet_balances`.
- `campaign_budget_summary` separates funding, holds, participant earnings, Sauti commission, fees and refunds.
- Participation earnings and play counts are caches only, documented directly on their columns.
- Trusted server operations will post ledger entries using unique idempotency keys. Clients receive read-only RLS access.

## Security rules

- Authentication identity remains in `auth.users`; application data uses `profiles`.
- Sensitive base tables are private by default. Public discovery goes through column-limited views.
- Role and ownership checks are centralized in security-definer helper functions with fixed search paths.
- Campaign approval, play qualification, ledger writes and audit writes have no client write policies.
- `audit_logs` is append-only at the database level.

## Local development

Run `supabase start`, then `supabase db reset` to apply migrations and the Kenyan demo seed. All demo accounts use `SautiDemo254!`; they are development-only identities under the `.local` domain.
