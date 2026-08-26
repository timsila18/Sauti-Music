"use client";
import Link from "next/link";
import { useActionState } from "react";
import { resetPasswordAction, type AuthActionState } from "@/app/(auth)/actions";
import { AuthMessage } from "@/components/auth/auth-message";
import { PasswordField } from "@/components/auth/password-field";
import { SubmitButton } from "@/components/auth/submit-button";
const initialState:AuthActionState={status:"idle"};
export function ResetForm() { const [state,action]=useActionState(resetPasswordAction,initialState); if(state.status==="success") return <div className="grid gap-5"><AuthMessage status={state.status} message={state.message} /><Link href="/login" className="grid h-12 place-items-center rounded-full bg-coral font-medium text-white">Sign in with new password</Link></div>; return <form action={action} className="grid gap-5"><PasswordField label="New password" autoComplete="new-password" /><PasswordField name="password_confirmation" label="Confirm new password" autoComplete="new-password" /><AuthMessage status={state.status} message={state.message} /><SubmitButton>Update password</SubmitButton></form>; }
