"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Bell,
  Compass,
  Home,
  LogOut,
  Menu,
  Settings,
  UserRound,
  WalletCards,
} from "lucide-react";
import { logoutAction } from "@/app/(auth)/actions";
import { BrandMark } from "@/components/brand-mark";
import { SautiAction } from "@/components/navigation/sauti-action";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";
import type { PreviewRole, RoleAction } from "@/lib/types";
import { NotificationBell } from "@/components/notifications/notification-bell";

const listenerItems = [
  { label: "Home", icon: Home, href: "/listener" },
  { label: "Discover", icon: Compass, href: "/discover" },
  { label: "Activity", icon: Bell, href: "/activity" },
  { label: "You", icon: UserRound, href: "/my-sauti" },
];
const artistItems = [
  { label: "Home", icon: Home, href: "/artist" },
  { label: "Music", icon: Compass, href: "/artist/music" },
  { label: "Activity", icon: Bell, href: "/artist/activity" },
  { label: "Profile", icon: UserRound, href: "/artist/profile" },
];
const matatuItems = [
  { label: "Home", icon: Home, href: "/matatu" },
  { label: "Campaigns", icon: Compass, href: "/matatu/campaigns" },
  { label: "Activity", icon: Bell, href: "/matatu/activity" },
  { label: "Wallet", icon: WalletCards, href: "/matatu/wallet" },
];
const djItems = [
  { label: "Home", icon: Home, href: "/dj" },
  { label: "Campaigns", icon: Compass, href: "/dj/campaigns" },
  { label: "Activity", icon: Bell, href: "/dj/activity" },
  { label: "Wallet", icon: WalletCards, href: "/dj/wallet" },
];

export function AppNavigation({
  role,
  action,
}: {
  role: PreviewRole;
  action: RoleAction;
}) {
  const pathname = usePathname();
  const items =
    role === "artist"
      ? artistItems
      : role === "matatu"
        ? matatuItems
        : role === "dj"
          ? djItems
          : listenerItems;
  const navigable = role !== "admin";
  return (
    <>
      <header className="sticky top-0 z-40 flex h-16 items-center justify-between bg-background/95 px-5 backdrop-blur lg:hidden">
        <BrandMark />
        <div className="flex items-center gap-1">
          <NotificationBell />
          <AccountMenu role={role} />
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" aria-label="Open menu">
                <Menu />
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="bg-background p-6">
              <SheetHeader>
                <SheetTitle>
                  <BrandMark />
                </SheetTitle>
              </SheetHeader>
              <div className="mt-8 grid gap-2">
                {items.map(({ label, icon: Icon, href }) => (
                  <Button
                    key={label}
                    asChild
                    variant="ghost"
                    className="justify-start"
                  >
                    <Link href={navigable ? href : "#"}>
                      <Icon />
                      {label}
                    </Link>
                  </Button>
                ))}
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </header>
      <aside className="fixed inset-y-0 left-0 z-30 hidden w-64 flex-col border-r bg-background p-7 lg:flex">
        <div className="flex items-center justify-between">
          <BrandMark />
          <NotificationBell />
        </div>
        <nav className="mt-12 grid gap-2">
          {items.map(({ label, icon: Icon, href }, index) => {
            const target = navigable ? href : index === 0 ? pathname : "#";
            return (
              <Link
                key={label}
                href={target}
                className={cn(
                  "flex items-center gap-3 rounded-xl px-3 py-3 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground",
                  pathname === target && "bg-lavender text-plum",
                )}
              >
                <Icon className="size-5" />
                {label}
              </Link>
            );
          })}
        </nav>
        <div className="mt-auto">
          <AccountMenu role={role} expanded />
          <p className="mb-4 mt-5 text-xs uppercase tracking-[.16em] text-muted-foreground">
            {role} preview
          </p>
          <SautiAction action={action} compact />
        </div>
      </aside>
      <nav
        aria-label="Primary navigation"
        className="fixed inset-x-0 bottom-0 z-50 grid grid-cols-5 items-end border-t bg-card/95 px-2 pb-[max(.5rem,env(safe-area-inset-bottom))] pt-2 shadow-[0_-8px_24px_rgba(23,23,28,.05)] backdrop-blur lg:hidden"
      >
        {items.slice(0, 2).map(({ label, icon: Icon, href }) => {
          const target = navigable ? href : pathname;
          return (
            <Link
              key={label}
              href={target}
              className={cn(
                "flex flex-col items-center gap-1 rounded-2xl py-2 text-[11px] text-muted-foreground",
                pathname === target && "text-primary",
              )}
            >
              <Icon className="size-5" />
              {label}
            </Link>
          );
        })}
        <SautiAction action={action} />
        {items.slice(2).map(({ label, icon: Icon, href }) => {
          const target = navigable ? href : "#";
          return (
            <Link
              key={label}
              href={target}
              className={cn(
                "flex flex-col items-center gap-1 rounded-2xl py-2 text-[11px] text-muted-foreground",
                pathname === target && "text-primary",
              )}
            >
              <Icon className="size-5" />
              {label}
            </Link>
          );
        })}
      </nav>
    </>
  );
}

function AccountMenu({
  role,
  expanded = false,
}: {
  role: PreviewRole;
  expanded?: boolean;
}) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size={expanded ? "default" : "icon"}
          className={cn(expanded && "w-full justify-start rounded-xl")}
        >
          <span className="grid size-7 place-items-center rounded-full bg-lavender text-plum">
            <UserRound className="size-4" />
          </span>
          {expanded ? (
            <span className="capitalize">{role} account</span>
          ) : (
            <span className="sr-only">Open account menu</span>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align={expanded ? "start" : "end"} className="w-56">
        <DropdownMenuLabel>
          <p className="font-medium">Your Sauti</p>
          <p className="mt-0.5 text-xs font-normal capitalize text-muted-foreground">
            {role.replace("_", " ")}
          </p>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <Link
          href={role === "listener" ? "/my-sauti" : "#profile"}
          className="flex items-center gap-2 px-2 py-2 text-sm"
        >
          <UserRound className="size-4" />
          Profile
        </Link>
        <Link
          href="/account/security"
          className="flex items-center gap-2 px-2 py-2 text-sm text-muted-foreground"
        >
          <Settings className="size-4" />
          Password & security
        </Link>
        <DropdownMenuSeparator />
        <form action={logoutAction}>
          <button className="flex w-full items-center gap-2 rounded-sm px-2 py-2 text-sm text-destructive hover:bg-muted">
            <LogOut className="size-4" />
            Log out
          </button>
        </form>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
