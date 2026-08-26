# Test strategy

The automated gate runs lint, TypeScript, unit tests and a production build. Database changes must be exercised against an ephemeral Supabase project, never production.

Before a pilot, test unauthenticated redirects and the full role matrix: Listener ownership; Artist upload/campaign ownership; DJ accepted-campaign access; Matatu crew/playback; and Admin-only review, settings, finance and payout operations. Attempt cross-account reads and writes directly through Supabase to prove RLS denies them.

Concurrency cases include duplicate funding keys, repeated play completion, simultaneous payout transitions, and song requests inside/outside the rate window. Assert one ledger effect, one final state and a durable audit record.

E2E smoke coverage should exercise authentication, onboarding, every role workflow, verification, earnings, notifications and Admin review at 320, 390, 768 and 1440 pixels. Live payment and recognition tests remain blocked until those integrations exist.
