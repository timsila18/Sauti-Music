import Link from "next/link";
import { BrandMark } from "@/components/brand-mark";
import { logoutAction } from "@/app/(auth)/actions";
import { Button } from "@/components/ui/button";
import { NotificationBell } from "@/components/notifications/notification-bell";
const items = [
  ["Overview", "/admin"],
  ["Campaigns", "/admin/campaigns"],
  ["Music", "/admin/music"],
  ["Users", "/admin/users"],
  ["DJs", "/admin/djs"],
  ["Matatus", "/admin/matatus"],
  ["Plays & Reviews", "/admin/reviews/plays"],
  ["Risk", "/admin/risk"],
  ["Finance", "/admin/finance"],
  ["My Sauti Share", "/admin/treasury"],
  ["Payouts", "/admin/payouts"],
  ["Settings", "/admin/settings"],
  ["Audit", "/admin/audit"],
];
export function AdminShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-svh bg-background lg:grid lg:grid-cols-[250px_1fr]">
      <aside className="border-b p-5 lg:sticky lg:top-0 lg:h-svh lg:border-b-0 lg:border-r lg:p-7">
        <div className="flex items-center justify-between">
          <BrandMark />
          <div className="flex items-center gap-2"><NotificationBell /><span className="rounded-full bg-lavender px-3 py-1 text-xs text-plum">Admin</span></div>
        </div>
        <nav className="mt-7 flex gap-2 overflow-x-auto pb-2 lg:grid">
          {items.map(([label, href]) => (
            <Link
              key={href}
              href={href}
              className="whitespace-nowrap rounded-xl px-3 py-2 text-sm text-muted-foreground hover:bg-lavender hover:text-plum"
            >
              {label}
            </Link>
          ))}
        </nav>
        <form action={logoutAction} className="mt-6 hidden lg:block">
          <Link href="/account/security" className="mb-3 block rounded-xl px-3 py-2 text-sm text-muted-foreground hover:bg-lavender hover:text-plum">Password & security</Link>
          <Button variant="outline" className="w-full">
            Log out
          </Button>
        </form>
      </aside>
      <main className="min-w-0 p-5 sm:p-8 lg:p-10">{children}</main>
    </div>
  );
}
export function AdminHeader({
  eyebrow,
  title,
  description,
}: {
  eyebrow: string;
  title: string;
  description?: string;
}) {
  return (
    <header>
      <p className="text-sm font-medium text-coral">{eyebrow}</p>
      <h1 className="mt-2 text-4xl font-medium tracking-[-.04em] text-plum">
        {title}
      </h1>
      {description ? (
        <p className="mt-3 max-w-3xl text-muted-foreground">{description}</p>
      ) : null}
    </header>
  );
}
export function Status({ children }: { children: React.ReactNode }) {
  const value = String(children).toUpperCase();
  const tone = value.includes("NOT_QUALIFIED") || value.includes("REJECT") || value.includes("FAILED") || value.includes("BLOCKED") ? "bg-destructive/10 text-destructive" : value.includes("FLAG") || value.includes("REVIEW") || value.includes("HIGH") || value.includes("URGENT") ? "bg-coral/15 text-coral" : value.includes("ACTIVE") || value.includes("QUALIFIED") || value.includes("COMPLETED") || value.includes("AVAILABLE") ? "bg-lime/45 text-plum" : "bg-lavender text-plum";
  return (
    <span className={`inline-flex rounded-full px-3 py-1 text-xs font-medium ${tone}`}>
      {children}
    </span>
  );
}
