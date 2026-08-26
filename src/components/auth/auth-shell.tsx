import type { ReactNode } from "react";
import Link from "next/link";
import { Disc3 } from "lucide-react";
import { BrandMark } from "@/components/brand-mark";

export function AuthShell({ children, note="Kenya's sound moves through people." }: { children:ReactNode; note?:string }) {
  return <main className="grid min-h-svh bg-background lg:grid-cols-[.9fr_1.1fr]">
    <section className="flex min-h-svh flex-col px-5 py-6 sm:px-10 lg:px-14"><header className="flex items-center justify-between"><BrandMark /><Link href="/" className="text-sm font-medium text-muted-foreground hover:text-plum">Back home</Link></header><div className="mx-auto flex w-full max-w-md flex-1 items-center py-12">{children}</div><p className="text-center text-xs text-muted-foreground">By continuing, you agree to use Sauti respectfully.</p></section>
    <aside className="relative hidden overflow-hidden bg-plum p-14 text-white lg:flex lg:flex-col lg:justify-between"><div className="relative z-10"><p className="flex items-center gap-2 text-sm text-coral"><span className="size-2 rounded-full bg-lime" /> One sound. Many ways in.</p><h2 className="mt-8 max-w-xl text-6xl font-medium leading-[.94] tracking-[-.055em]">{note}</h2></div><div className="relative z-10 grid grid-cols-2 gap-3"><div className="rounded-3xl bg-white/8 p-5"><p className="text-2xl font-medium text-lime">Hear it</p><p className="mt-2 text-sm text-white/55">Discover what&apos;s moving around you.</p></div><div className="rounded-3xl bg-coral p-5"><p className="text-2xl font-medium">Move it</p><p className="mt-2 text-sm text-white/70">Help Kenyan music travel further.</p></div></div><Disc3 className="absolute -bottom-48 -right-36 size-[38rem] text-white opacity-[.04]" /></aside>
  </main>;
}
