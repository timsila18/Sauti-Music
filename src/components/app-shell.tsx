import type { ReactNode } from "react";
import { AppNavigation } from "@/components/navigation/app-navigation";
import type { PreviewRole, RoleAction } from "@/lib/types";

export function AppShell({ children, role, action }: { children: ReactNode; role: PreviewRole; action: RoleAction }) {
  return <div className="min-h-screen bg-background"><AppNavigation role={role} action={action} /><main className="mx-auto min-h-screen max-w-7xl px-5 pb-28 pt-8 sm:px-8 lg:ml-64 lg:pb-16 lg:pt-10">{children}</main></div>;
}
