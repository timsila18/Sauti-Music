"use client";
import{useActionState}from"react";
import{changePasswordAction,type PasswordState}from"@/app/account/security/actions";
import{PasswordField}from"@/components/auth/password-field";
import{AuthMessage}from"@/components/auth/auth-message";
import{SubmitButton}from"@/components/auth/submit-button";
const initial:PasswordState={status:"idle"};
export function ChangePasswordForm(){const[state,action]=useActionState(changePasswordAction,initial);return <form action={action} className="mt-6 grid max-w-xl gap-5"><PasswordField name="current_password" label="Current password" autoComplete="current-password"/><PasswordField label="New password" autoComplete="new-password"/><PasswordField name="password_confirmation" label="Confirm new password" autoComplete="new-password"/><AuthMessage status={state.status} message={state.message}/><SubmitButton>Change password</SubmitButton></form>}
