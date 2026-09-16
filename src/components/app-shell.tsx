import type { ReactNode } from "react";
import { AppNavigation } from "@/components/navigation/app-navigation";
import { SessionWelcome } from "@/components/session-welcome";
import type { PreviewRole, RoleAction } from "@/lib/types";

export function AppShell({ children, role, action }: { children: ReactNode; role: PreviewRole; action: RoleAction }) {
  return <div className="min-h-screen bg-background"><AppNavigation role={role} action={action} /><main className="mx-auto min-h-screen max-w-[1180px] px-4 pb-28 pt-5 sm:px-7 sm:pt-8 lg:ml-[232px] lg:px-10 lg:pb-16 lg:pt-9 xl:px-12"><SessionWelcome />{children}</main></div>;
}
