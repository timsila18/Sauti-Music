import "server-only";

import { redirect } from "next/navigation";
import type { UserRole } from "@/domain/auth/roles";
import { roleHome, safeReturnPath } from "@/lib/auth/routing";
import type { ProfileRow } from "@/lib/supabase/database.types";
import { createClient } from "@/lib/supabase/server";

export async function getAuthContext(): Promise<{ userId:string; profile:ProfileRow } | null> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;
  const { data: profile } = await supabase.from("profiles").select("*").eq("auth_user_id",user.id).maybeSingle();
  return profile ? { userId:user.id, profile } : null;
}

export async function requireUser(intendedPath?: string) {
  const context = await getAuthContext();
  if (!context) redirect(`/login${intendedPath ? `?next=${encodeURIComponent(intendedPath)}` : ""}`);
  if (context.profile.onboarding_status !== "COMPLETED") redirect("/onboarding");
  return context;
}

export async function requireRole(role: UserRole, intendedPath: string) {
  const context = await requireUser(intendedPath);
  if (context.profile.role !== role) redirect(roleHome(context.profile.role));
  return context;
}

export async function redirectAuthenticatedUser(next?: string | null) {
  const context = await getAuthContext();
  if (!context) return;
  if (context.profile.onboarding_status !== "COMPLETED") redirect("/onboarding");
  redirect(safeReturnPath(next) ?? roleHome(context.profile.role));
}
