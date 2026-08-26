# Supabase boundary

`database.types.ts` mirrors the core migration for compile-time use. When a project is linked to Supabase, regenerate it with the CLI and review the resulting diff rather than editing generated table shapes casually.

Client creation belongs in separate browser and server modules once authentication is wired. Never expose the service-role key to browser code. Business writes such as campaign approval, play qualification and ledger posting must go through trusted server-side operations; RLS intentionally provides no client write policies for them.
