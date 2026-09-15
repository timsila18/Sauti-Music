import { sendPayout } from "@/app/admin/actions";
import { AdminHeader, Status } from "@/components/admin/admin-shell";
import { adminClient } from "@/lib/services/admin-data";
import { b2cConfigured } from "@/lib/payments/mpesa-b2c";
export default async function Page() {
  const livePayouts = b2cConfigured();
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
        description="Review requested withdrawals and dispatch approved payments through M-Pesa B2C."
      />
      {!livePayouts ? <p className="mt-5 rounded-2xl bg-lavender p-4 text-sm text-plum">M-Pesa payout dispatch is safely disabled until the exact B2C consumer key and secret are installed.</p> : null}
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
              {livePayouts && p.status === "REQUESTED" && p.method === "MPESA_B2C" ? <form action={sendPayout} className="mt-4"><input type="hidden" name="payoutId" value={p.id}/><label className="mr-3 text-xs"><input required type="checkbox"/> I verified the recipient and amount</label><button className="rounded-xl bg-coral px-4 py-2 text-white">Send via M-Pesa</button></form> : null}
            </article>
          );
        })}
      </div>
    </>
  );
}
