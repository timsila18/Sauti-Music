import { updatePayout } from "@/app/admin/actions";
import { AdminHeader, Status } from "@/components/admin/admin-shell";
import { adminClient } from "@/lib/services/admin-data";
export default async function Page() {
  const db = await adminClient();
  const [{ data: rows }, { data: wallets }, { data: profiles }] =
    await Promise.all([
      db
        .from("payout_requests")
        .select("*")
        .order("requested_at", { ascending: false }),
      db
        .from("wallet_financial_summary")
        .select("wallet_id,available,profile_id"),
      db.from("profiles").select("id,display_name,role,account_status"),
    ]);
  return (
    <>
      <AdminHeader
        eyebrow="Finance Operations"
        title="Payout review"
        description="Development workflow only. No M-Pesa request is made."
      />
      <div className="mt-7 grid gap-3">
        {(rows ?? []).map((p) => {
          const w = wallets?.find((x) => x.wallet_id === p.wallet_id),
            u = profiles?.find((x) => x.id === w?.profile_id);
          return (
            <article key={p.id} className="rounded-2xl bg-card p-5">
              <div className="flex flex-wrap justify-between gap-3">
                <div>
                  <h2 className="text-xl font-medium">
                    {u?.display_name ?? "Participant"}
                  </h2>
                  <p className="text-sm text-muted-foreground">
                    {u?.role} · account {u?.account_status} · {p.method}
                  </p>
                  <p>
                    Requested KSh {Number(p.amount).toLocaleString()} ·
                    Available KSh {Number(w?.available ?? 0).toLocaleString()}
                  </p>
                </div>
                <Status>{p.status}</Status>
              </div>
              {["REQUESTED", "PROCESSING"].includes(p.status) ? (
                <form
                  action={updatePayout}
                  className="mt-4 flex flex-wrap gap-2"
                >
                  <input type="hidden" name="payoutId" value={p.id} />
                  <select name="status" className="rounded-xl border px-3">
                    <option>PROCESSING</option>
                    <option>COMPLETED</option>
                    <option>FAILED</option>
                    <option>CANCELLED</option>
                  </select>
                  <input
                    required
                    name="reason"
                    placeholder="Reason / processing note"
                    className="h-10 flex-1 rounded-xl border px-3"
                  />
                  <label className="self-center text-xs">
                    <input required type="checkbox" /> Confirm development
                    status change
                  </label>
                  <button className="rounded-xl bg-plum px-4 text-white">
                    Update
                  </button>
                </form>
              ) : null}
            </article>
          );
        })}
      </div>
    </>
  );
}
