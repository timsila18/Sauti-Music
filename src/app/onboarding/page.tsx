import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { BrandMark } from "@/components/brand-mark";
import { OnboardingFlow } from "@/components/onboarding/onboarding-flow";
import { roleHome } from "@/lib/auth/routing";
import { getAuthContext } from "@/lib/auth/session";
export const metadata:Metadata={title:"Choose your Sauti"}; export const dynamic="force-dynamic";
export default async function OnboardingPage() { const context=await getAuthContext(); if(!context) redirect("/login?next=/onboarding"); if(context.profile.onboarding_status==="COMPLETED") redirect(roleHome(context.profile.role)); return <main className="min-h-svh bg-background px-5 py-6 sm:px-8"><header className="mx-auto flex max-w-5xl items-center justify-between"><BrandMark /><p className="text-sm text-muted-foreground">Hi, {context.profile.display_name}</p></header><section className="mx-auto w-full max-w-3xl py-12 sm:py-20"><OnboardingFlow displayName={context.profile.display_name} /></section></main>; }
