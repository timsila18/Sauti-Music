import "server-only";
import { requireRole } from "@/lib/auth/session";
import { createClient } from "@/lib/supabase/server";
export async function adminClient() { await requireRole("ADMIN", "/admin"); return createClient(); }
