import type { Metadata } from "next";
import { AuthShell } from "@/components/auth/auth-shell";
import { SignupForm } from "@/components/auth/signup-form";
import { redirectAuthenticatedUser } from "@/lib/auth/session";
export const metadata:Metadata={title:"Join Sauti"}; export const dynamic="force-dynamic";
export default async function SignupPage() { await redirectAuthenticatedUser(); return <AuthShell note="Your place in Kenya's sound starts here."><div className="w-full"><p className="text-sm font-medium text-coral">Step 1 of 2</p><h1 className="mt-2 text-4xl font-medium tracking-[-.04em] text-plum">Create your account.</h1><p className="mb-8 mt-3 text-muted-foreground">Three details, then tell us how you use Sauti.</p><SignupForm /></div></AuthShell>; }
