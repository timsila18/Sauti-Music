"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import type { UserRole } from "@/domain/auth/roles";

const roleLabels = {
  LISTENER: "Listener",
  ARTIST_LABEL: "Artist / Label",
  DJ: "DJ",
  MATATU_CREW: "Matatu Crew",
  ADMIN: "Admin",
} as const;

type WelcomeDetails = { firstName: string; roleLabel: string };

export function SessionWelcome() {
  const [details, setDetails] = useState<WelcomeDetails | null>(null);

  useEffect(() => {
    let active = true;
    const loadDetails = async () => {
      const db = createClient();
      const {
        data: { user },
      } = await db.auth.getUser();
      if (!user) return;

      const { data: profile } = await db
        .from("profiles")
        .select("id,display_name,role")
        .eq("auth_user_id", user.id)
        .maybeSingle();
      if (!profile || !active) return;

      let roleLabel: string = roleLabels[profile.role as UserRole];
      if (profile.role === "ADMIN") {
        // Admin assignments are migration-backed and not yet present in generated client types.
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const { data: assignment } = await (db as any)
          .from("admin_assignments")
          .select("level")
          .eq("profile_id", profile.id)
          .maybeSingle();
        if (assignment?.level === "SUPER_ADMIN") roleLabel = "Super Admin";
      }

      if (active) {
        setDetails({
          firstName: profile.display_name.trim().split(/\s+/)[0] || "there",
          roleLabel,
        });
      }
    };

    void loadDetails();
    return () => {
      active = false;
    };
  }, []);

  if (!details) return null;

  return (
    <div
      className="mb-6 flex items-center gap-3 rounded-2xl border border-primary/10 bg-secondary/70 px-4 py-3 text-sm text-ink sm:px-5"
      role="status"
    >
      <span className="size-2 shrink-0 rounded-full bg-success" />
      <span>Welcome <strong>{details.firstName}</strong>, you are logged in as <strong>{details.roleLabel}</strong>.</span>
    </div>
  );
}
