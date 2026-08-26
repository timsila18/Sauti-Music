"use client";
import Link from "next/link";
import { useActionState } from "react";
import { forgotPasswordAction, type AuthActionState } from "@/app/(auth)/actions";
import { AuthMessage } from "@/components/auth/auth-message";
import { SubmitButton } from "@/components/auth/submit-button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
const initialState:AuthActionState={status:"idle"};
export function ForgotForm() { const [state,action]=useActionState(forgotPasswordAction,initialState); return <form action={action} className="grid gap-5"><div className="grid gap-2"><Label htmlFor="email">Email</Label><Input id="email" name="email" type="email" autoComplete="email" required placeholder="you@example.com" className="h-12 rounded-xl" /></div><AuthMessage status={state.status} message={state.message} /><SubmitButton>Send reset link</SubmitButton><Link href="/login" className="text-center text-sm font-medium text-plum hover:underline">Back to sign in</Link></form>; }
