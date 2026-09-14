import Link from "next/link";
import { BrandMark } from "@/components/brand-mark";
import { logoutAction } from "@/app/(auth)/actions";
import { Button } from "@/components/ui/button";
import { NotificationBell } from "@/components/notifications/notification-bell";
import { SessionWelcome } from "@/components/session-welcome";
import { LogOut, Settings } from "lucide-react";
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
      <aside className="border-b p-5 lg:sticky lg:top-0 lg:flex lg:h-svh lg:flex-col lg:overflow-hidden lg:border-b-0 lg:border-r lg:p-7">
        <div className="shrink-0 flex items-center justify-between">
          <BrandMark />
          <div className="flex items-center gap-2"><NotificationBell /><span className="rounded-full bg-lavender px-3 py-1 text-xs text-plum">Admin</span></div>
        </div>
        <nav className="mt-7 flex gap-2 overflow-x-auto pb-2 lg:min-h-0 lg:flex-1 lg:grid lg:content-start lg:overflow-x-hidden lg:overflow-y-auto lg:pr-2">
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
        <div className="mt-4 flex shrink-0 items-center gap-2 border-t bg-background pt-4 lg:block">
          <Button asChild variant="ghost" className="min-w-fit flex-1 justify-start lg:mb-3 lg:w-full">
            <Link href="/account/security">
              <Settings className="size-4" />
              <span className="hidden sm:inline">Password &amp; security</span>
              <span className="sm:hidden">Security</span>
            </Link>
          </Button>
          <form action={logoutAction} className="flex-1">
            <Button
              type="submit"
              variant="outline"
              className="w-full text-destructive hover:text-destructive"
            >
              <LogOut className="size-4" />
              Log out
            </Button>
          </form>
        </div>
      </aside>
      <main className="min-w-0 p-5 sm:p-8 lg:p-10"><SessionWelcome />{children}</main>
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
