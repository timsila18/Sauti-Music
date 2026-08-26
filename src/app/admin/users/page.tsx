import { setAccountStatus } from "@/app/admin/actions";
import { AdminHeader, Status } from "@/components/admin/admin-shell";
import { adminClient } from "@/lib/services/admin-data";
export default async function Page({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; role?: string }>;
}) {
  const p = await searchParams,
    db = await adminClient();
  let q = db
    .from("profiles")
    .select("*")
    .order("created_at", { ascending: false });
  if (p.q)
    q = q.or(
      `display_name.ilike.%${p.q}%,handle.ilike.%${p.q}%,contact_email.ilike.%${p.q}%`,
    );
  if (p.role) q = q.eq("role", p.role as never);
  const { data: rows } = await q;
  return (
    <>
      <AdminHeader eyebrow="Accounts" title="Users and access" />
      <form className="mt-6 flex gap-2">
        <input
          name="q"
          defaultValue={p.q}
          placeholder="Name, handle or email"
          className="h-11 flex-1 rounded-xl border px-3"
        />
        <select
          name="role"
          defaultValue={p.role}
          className="rounded-xl border px-3"
        >
          <option value="">All roles</option>
          {["LISTENER", "ARTIST_LABEL", "DJ", "MATATU_CREW"].map((x) => (
            <option key={x}>{x}</option>
          ))}
        </select>
        <button className="rounded-xl bg-plum px-5 text-white">Search</button>
      </form>
      <div className="mt-7 grid gap-3">
        {(rows ?? []).map((u) => (
          <article key={u.id} className="rounded-2xl bg-card p-5">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <h2 className="text-lg font-medium">{u.display_name}</h2>
                <p className="text-sm text-muted-foreground">
                  @{u.handle} · {u.contact_email ?? "No contact email"} ·{" "}
                  {u.role}
                </p>
              </div>
              <Status>{u.account_status}</Status>
            </div>
            {u.role !== "ADMIN" ? (
              <form
                action={setAccountStatus}
                className="mt-4 grid gap-2 sm:grid-cols-4"
              >
                <input type="hidden" name="profileId" value={u.id} />
                <select name="status" className="h-10 rounded-xl border px-2">
                  <option>ACTIVE</option>
                  <option>SUSPENDED</option>
                  <option>UNDER_REVIEW</option>
                </select>
                <input
                  required
                  name="reason"
                  placeholder="User-facing reason"
                  className="h-10 rounded-xl border px-3"
                />
                <input
                  name="note"
                  placeholder="Private note"
                  className="h-10 rounded-xl border px-3"
                />
                <button className="rounded-xl bg-coral px-3 text-white">
                  Update status
                </button>
              </form>
            ) : null}
          </article>
        ))}
      </div>
    </>
  );
}
