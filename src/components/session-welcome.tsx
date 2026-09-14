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
      className="mb-6 rounded-2xl border border-plum/10 bg-lavender/55 px-4 py-3 text-sm text-plum sm:px-5"
      role="status"
    >
      Welcome <strong>{details.firstName}</strong>, you are logged in as{" "}
      <strong>{details.roleLabel}</strong>.
    </div>
  );
}
