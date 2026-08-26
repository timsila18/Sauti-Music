import type { Metadata } from "next";
import { AuthShell } from "@/components/auth/auth-shell";
import { ForgotForm } from "@/components/auth/forgot-form";
export const metadata:Metadata={title:"Reset password"};
export default function ForgotPasswordPage() { return <AuthShell><div className="w-full"><p className="text-sm font-medium text-coral">Password help</p><h1 className="mt-2 text-4xl font-medium tracking-[-.04em] text-plum">Find your way back in.</h1><p className="mb-8 mt-3 text-muted-foreground">We&apos;ll email you a secure reset link.</p><ForgotForm /></div></AuthShell>; }
