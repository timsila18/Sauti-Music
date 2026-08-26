import type { Metadata } from "next";
import { AuthShell } from "@/components/auth/auth-shell";
import { ResetForm } from "@/components/auth/reset-form";
export const metadata:Metadata={title:"Choose a new password"}; export const dynamic="force-dynamic";
export default function ResetPasswordPage() { return <AuthShell><div className="w-full"><p className="text-sm font-medium text-coral">Almost there</p><h1 className="mt-2 text-4xl font-medium tracking-[-.04em] text-plum">Choose a new password.</h1><p className="mb-8 mt-3 text-muted-foreground">Make it memorable and at least 8 characters.</p><ResetForm /></div></AuthShell>; }
