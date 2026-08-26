import type { Metadata } from "next";
import { AuthShell } from "@/components/auth/auth-shell";
import { LoginForm } from "@/components/auth/login-form";
import { redirectAuthenticatedUser } from "@/lib/auth/session";
export const metadata:Metadata={title:"Sign in"}; export const dynamic="force-dynamic";
export default async function LoginPage({ searchParams }: { searchParams:Promise<{next?:string;error?:string}> }) { const {next,error}=await searchParams; await redirectAuthenticatedUser(next); return <AuthShell><div className="w-full"><p className="text-sm font-medium text-coral">Welcome back</p><h1 className="mt-2 text-4xl font-medium tracking-[-.04em] text-plum">Sign in to Sauti.</h1><p className="mb-8 mt-3 text-muted-foreground">Pick up where the music left you.</p><LoginForm next={next} error={error} /></div></AuthShell>; }
