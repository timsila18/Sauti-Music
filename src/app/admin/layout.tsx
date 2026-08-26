import { AdminShell } from "@/components/admin/admin-shell";
import { requireRole } from "@/lib/auth/session";
export const dynamic = "force-dynamic";
export default async function Layout({
  children,
}: {
  children: React.ReactNode;
}) {
  await requireRole("ADMIN", "/admin");
  return <AdminShell>{children}</AdminShell>;
}
