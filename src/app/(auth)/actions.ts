"use server";

import { redirect } from "next/navigation";
import type { UserRole } from "@/domain/auth/roles";
import { isUserRole } from "@/domain/auth/roles";
import { roleHome, safeReturnPath } from "@/lib/auth/routing";
import type { Json } from "@/lib/supabase/database.types";
import { createClient } from "@/lib/supabase/server";

export type AuthActionState = { status:"idle"|"error"|"success"; message?:string; destination?:string };

function value(formData: FormData, key: string): string { return String(formData.get(key) ?? "").trim(); }
function siteUrl(): string { return process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000"; }

function authMessage(message: string): string {
  const text = message.toLowerCase();
  if (text.includes("already") || text.includes("registered")) return "That email is already registered. Try signing in instead.";
  if (text.includes("password") && (text.includes("weak") || text.includes("characters"))) return "Choose a stronger password with at least 8 characters.";
  if (text.includes("invalid login")) return "The email or password is incorrect.";
  if (text.includes("rate") || text.includes("network") || text.includes("fetch")) return "We couldn't connect right now. Please try again in a moment.";
  if (text.includes("expired")) return "This link has expired. Request a new password reset email.";
  return "Something didn't work. Please try again.";
}

export async function signUpAction(_: AuthActionState, formData: FormData): Promise<AuthActionState> {
  const displayName=value(formData,"display_name"), email=value(formData,"email").toLowerCase(), password=value(formData,"password");
  if (!displayName || !email || !password) return { status:"error", message:"Complete all three fields to continue." };
  if (password.length < 8) return { status:"error", message:"Choose a password with at least 8 characters." };
  const supabase=await createClient();
  const { data,error }=await supabase.auth.signUp({ email,password,options:{ data:{ display_name:displayName },emailRedirectTo:`${siteUrl()}/auth/callback?next=/onboarding` } });
  if (error) return { status:"error",message:authMessage(error.message) };
  if (data.session) redirect("/onboarding");
  return { status:"success",message:"Check your email to confirm your account, then continue your Sauti setup." };
}

export async function loginAction(_: AuthActionState, formData: FormData): Promise<AuthActionState> {
  const email=value(formData,"email").toLowerCase(), password=value(formData,"password"), next=safeReturnPath(value(formData,"next"));
  if (!email || !password) return { status:"error",message:"Enter your email and password." };
  const supabase=await createClient();
  const { data,error }=await supabase.auth.signInWithPassword({ email,password });
  if (error || !data.user) return { status:"error",message:authMessage(error?.message ?? "Invalid login") };
  const { data:profile }=await supabase.from("profiles").select("role,onboarding_status").eq("auth_user_id",data.user.id).maybeSingle();
  if (!profile || profile.onboarding_status!=="COMPLETED") redirect("/onboarding");
  redirect(next ?? roleHome(profile.role));
}

export async function forgotPasswordAction(_: AuthActionState, formData: FormData): Promise<AuthActionState> {
  const email=value(formData,"email").toLowerCase();
  if (!email) return { status:"error",message:"Enter the email you use for Sauti." };
  const supabase=await createClient();
  const { error }=await supabase.auth.resetPasswordForEmail(email,{ redirectTo:`${siteUrl()}/auth/callback?next=/reset-password` });
  if (error) return { status:"error",message:authMessage(error.message) };
  return { status:"success",message:"If an account exists for that email, a reset link is on its way." };
}

export async function resetPasswordAction(_: AuthActionState, formData: FormData): Promise<AuthActionState> {
  const password=value(formData,"password"), confirmation=value(formData,"password_confirmation");
  if (password.length<8) return { status:"error",message:"Choose a password with at least 8 characters." };
  if (password!==confirmation) return { status:"error",message:"The passwords don't match yet." };
  const supabase=await createClient();
  const { data:{ user } }=await supabase.auth.getUser();
  if (!user) return { status:"error",message:"This reset link has expired. Request a new one." };
  const { error }=await supabase.auth.updateUser({ password });
  if (error) return { status:"error",message:authMessage(error.message) };
  return { status:"success",message:"Your password is updated. You can now sign in." };
}

export async function logoutAction() {
  const supabase=await createClient();
  await supabase.auth.signOut();
  redirect("/login");
}

function onboardingMessage(message: string): string {
  if (message.includes("HANDLE_TAKEN")) return "That handle is already taken. Try another one.";
  if (message.includes("INVALID_HANDLE")) return "Use 3–30 lowercase letters, numbers or underscores for your handle.";
  if (message.includes("RESERVED_HANDLE")) return "That handle is reserved. Try something more personal.";
  if (message.includes("REQUIRED")) return "Complete the required fields before continuing.";
  return "We couldn't save your setup. Nothing was lost—please try again.";
}

export async function completeOnboardingAction(_: AuthActionState, formData: FormData): Promise<AuthActionState> {
  const role=value(formData,"role");
  if (!isUserRole(role) || role==="ADMIN") return { status:"error",message:"Choose one of the four Sauti experiences." };
  const genres=value(formData,"genres").split(",").map(item=>item.trim()).filter(Boolean);
  const details:Json={
    display_name:value(formData,"display_name"), county:value(formData,"county"), town_area:value(formData,"town_area"), bio:value(formData,"bio"), avatar_url:value(formData,"avatar_url"),
    handle:value(formData,"handle"), name:value(formData,"name"), stage_name:value(formData,"stage_name"), account_type:value(formData,"account_type"),
    sacco_name:value(formData,"sacco_name"), main_route:value(formData,"main_route"), relationship:value(formData,"relationship"), genres,
  };
  const supabase=await createClient();
  const { data:{ user } }=await supabase.auth.getUser();
  if (!user) return { status:"error",message:"Your session expired. Sign in again to continue." };
  const { error }=await supabase.rpc("complete_onboarding",{ p_role:role as UserRole,p_details:details });
  if (error) return { status:"error",message:onboardingMessage(`${error.code} ${error.message}`) };
  return { status:"success",message:"Your Sauti space is ready.",destination:roleHome(role as UserRole) };
}
