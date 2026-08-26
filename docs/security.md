# Security model

Supabase Auth uses refreshed HTTP-only session cookies. Protected server components and actions resolve the user server-side; row-level security and guarded database functions remain authoritative.

Private campaign audio uses five-minute signed URLs after current campaign and participation checks. Artwork is public and constrained by bucket MIME and size rules. Uploads are checked for size and declared MIME type, normalized and never overwritten.

Financial state comes from posted, append-only ledger entries. Clients cannot write wallets, ledger entries, verification decisions, risk profiles or play flags. Administrative functions re-check the Admin role in PostgreSQL and write audit records. Finance simulation and mock payout switches default off.

Next.js supplies same-origin checks for Server Actions. React escapes rendered strings; the app does not use `dangerouslySetInnerHTML`. Redirects use `safeReturnPath`. Structured logs permit-list metadata to avoid PII and secrets. Song requests are transactionally rate-limited; Auth and edge abuse controls must also be enabled by operators.
