export const USER_ROLES = ["LISTENER", "ARTIST_LABEL", "DJ", "MATATU_CREW", "ADMIN"] as const;

export type UserRole = (typeof USER_ROLES)[number];

export const ROLE_CAPABILITIES = {
  LISTENER: ["discover:music"],
  ARTIST_LABEL: ["artist:manage", "song:manage", "campaign:manage"],
  DJ: ["dj:manage", "campaign:participate"],
  MATATU_CREW: ["matatu:manage", "campaign:participate"],
  ADMIN: ["platform:admin"],
} as const satisfies Record<UserRole, readonly string[]>;

export type RoleCapability = (typeof ROLE_CAPABILITIES)[UserRole][number];

export function isUserRole(value: unknown): value is UserRole {
  return typeof value === "string" && USER_ROLES.includes(value as UserRole);
}

export function hasRole(role: UserRole, allowed: readonly UserRole[]): boolean {
  return allowed.includes(role);
}

export function isParticipantRole(role: UserRole): role is "DJ" | "MATATU_CREW" {
  return role === "DJ" || role === "MATATU_CREW";
}
