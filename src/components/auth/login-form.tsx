"use client";
import Link from "next/link";
import { useActionState } from "react";
import { loginAction, type AuthActionState } from "@/app/(auth)/actions";
import { AuthMessage } from "@/components/auth/auth-message";
import { PasswordField } from "@/components/auth/password-field";
import { SubmitButton } from "@/components/auth/submit-button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
export function LoginForm({ next, error }: { next?:string; error?:string }) { const [state,action]=useActionState(loginAction,{status:error?"error":"idle",message:error} satisfies AuthActionState); return <form action={action} className="grid gap-5"><input type="hidden" name="next" value={next??""} /><div className="grid gap-2"><Label htmlFor="email">Email</Label><Input id="email" name="email" type="email" autoComplete="email" required placeholder="you@example.com" className="h-12 rounded-xl" /></div><PasswordField /><div className="-mt-2 flex justify-end"><Link href="/forgot-password" className="text-sm font-medium text-coral hover:underline">Forgot password?</Link></div><AuthMessage status={state.status} message={state.message} /><SubmitButton>Sign in</SubmitButton><p className="text-center text-sm text-muted-foreground">New to Sauti? <Link href="/signup" className="font-semibold text-plum hover:underline">Create an account</Link></p></form>; }
