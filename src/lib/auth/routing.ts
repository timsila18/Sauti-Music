import type { UserRole } from "@/domain/auth/roles";

const ROLE_HOME: Record<UserRole, string> = {
  LISTENER: "/listener",
  ARTIST_LABEL: "/artist",
  DJ: "/dj",
  MATATU_CREW: "/matatu",
  ADMIN: "/admin",
};

export function roleHome(role: UserRole): string { return ROLE_HOME[role]; }

export function safeReturnPath(value: string | null | undefined): string | null {
  if (!value || !value.startsWith("/") || value.startsWith("//") || value.includes("\\")) return null;
  return value;
}
