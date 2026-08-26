"use client";
import Link from "next/link";
import { useActionState } from "react";
import { signUpAction, type AuthActionState } from "@/app/(auth)/actions";
import { AuthMessage } from "@/components/auth/auth-message";
import { PasswordField } from "@/components/auth/password-field";
import { SubmitButton } from "@/components/auth/submit-button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
const initialState:AuthActionState={status:"idle"};
export function SignupForm() { const [state,action]=useActionState(signUpAction,initialState); return <form action={action} className="grid gap-5"><div className="grid gap-2"><Label htmlFor="display_name">Your name</Label><Input id="display_name" name="display_name" autoComplete="name" required placeholder="What should we call you?" className="h-12 rounded-xl" /></div><div className="grid gap-2"><Label htmlFor="email">Email</Label><Input id="email" name="email" type="email" autoComplete="email" required placeholder="you@example.com" className="h-12 rounded-xl" /></div><PasswordField autoComplete="new-password" /><p className="-mt-2 text-xs text-muted-foreground">Use at least 8 characters.</p><AuthMessage status={state.status} message={state.message} /><SubmitButton>Continue</SubmitButton><p className="text-center text-sm text-muted-foreground">Already have an account? <Link href="/login" className="font-semibold text-plum hover:underline">Sign in</Link></p></form>; }
