import{ChangePasswordForm}from"@/components/auth/change-password-form";
import{requireUser}from"@/lib/auth/session";
export const dynamic="force-dynamic";
export default async function Page(){const{profile}=await requireUser("/account/security");return <main className="min-h-svh bg-background px-5 py-10 sm:px-8"><div className="mx-auto max-w-3xl"><p className="text-sm font-medium text-coral">Account security</p><h1 className="mt-2 text-4xl font-medium tracking-[-.04em] text-plum">Change your password.</h1><p className="mt-3 text-muted-foreground">Signed in as {profile.contact_email}. You’ll use the new password the next time you sign in.</p><section className="mt-8 rounded-3xl bg-card p-6 sm:p-8"><ChangePasswordForm/></section></div></main>}
