import Link from "next/link";
import { AdminHeader, Status } from "@/components/admin/admin-shell";
import { adminClient } from "@/lib/services/admin-data";
import { requireRole } from "@/lib/auth/session";
const money = (n: number) => `KSh ${n.toLocaleString()}`;
export default async function Page() {
  const { profile } = await requireRole("ADMIN", "/admin");
  const db = await adminClient();
  const [
    { count: pendingCampaigns },
    { count: flagged },
    { count: payouts },
    { count: active },
    { data: funds },
    { data: wallets },
    { data: djs },
    { data: matatus },
    { data: events },
    { data: ownership },
  ] = await Promise.all([
    db
      .from("campaigns")
      .select("id", { count: "exact", head: true })
      .eq("approval_status", "PENDING"),
    db
      .from("play_event_flags")
      .select("id", { count: "exact", head: true })
      .eq("status", "OPEN"),
    db
      .from("payout_requests")
      .select("id", { count: "exact", head: true })
      .eq("status", "REQUESTED"),
    db
      .from("campaigns")
      .select("id", { count: "exact", head: true })
      .eq("status", "ACTIVE"),
    db.from("campaign_financial_summary").select("remaining_balance"),
    db.from("wallet_financial_summary").select("pending"),
    db
      .from("dj_profiles")
      .select("id,stage_name,created_at")
      .order("created_at", { ascending: false })
      .limit(3),
    db
      .from("matatus")
      .select("id,display_name,created_at")
      .order("created_at", { ascending: false })
      .limit(3),
    db
      .from("financial_events")
      .select("id,event_type,created_at")
      .order("created_at", { ascending: false })
      .limit(6),
    (db as any).from("admin_assignments").select("level,ownership_bps").eq("profile_id",profile.id).maybeSingle(),
  ]);
  const ownershipPercent=Number(ownership?.ownership_bps??0)/100;
  const priorities = [
    ["Pending Campaigns", pendingCampaigns ?? 0, "/admin/campaigns"],
    ["Flagged Plays", flagged ?? 0, "/admin/reviews/plays"],
    ["Pending Payouts", payouts ?? 0, "/admin/payouts"],
    ["Active Campaigns", active ?? 0, "/admin/campaigns"],
    [
      "Campaign Funds Held",
      money((funds ?? []).reduce((n, x) => n + Number(x.remaining_balance), 0)),
      "/admin/finance",
    ],
    [
      "Earnings Pending",
      money((wallets ?? []).reduce((n, x) => n + Number(x.pending), 0)),
      "/admin/finance",
    ],
  ];
  return (
    <>
      <AdminHeader
        eyebrow="Command Centre"
        title="What needs attention?"
        description="A focused view of marketplace operations, reviews and financial risk."
      />
      {ownershipPercent>0?<Link href="/admin/treasury" className="mt-7 block rounded-[2rem] bg-coral p-7 text-white transition-transform hover:-translate-y-0.5"><p className="text-sm text-white/70">Sauti Music ownership</p><h2 className="mt-2 text-3xl font-medium">You own {ownershipPercent}% of Sauti Music.</h2><p className="mt-2 max-w-2xl text-white/75">You are entitled to {ownershipPercent}% of approved net profits. View allocations and withdraw available proceeds from your management wallet.</p></Link>:null}
      <div className="mt-8 grid grid-cols-2 gap-3 xl:grid-cols-3">
        {priorities.map(([l, v, h]) => (
          <Link
            href={String(h)}
            key={String(l)}
            className="rounded-2xl bg-card p-5 hover:ring-2 hover:ring-coral/20"
          >
            <p className="text-sm text-muted-foreground">{l}</p>
            <p className="mt-2 text-3xl font-medium text-plum">{v}</p>
          </Link>
        ))}
      </div>
      <div className="mt-9 grid gap-5 lg:grid-cols-2">
        <section className="rounded-3xl bg-plum p-6 text-white">
          <h2 className="text-2xl">System Alerts</h2>
          <div className="mt-5 grid gap-3">
            {(events ?? []).map((e) => (
              <div key={e.id} className="rounded-xl bg-white/10 p-4">
                <Status>{e.event_type.replaceAll("_", " ")}</Status>
                <p className="mt-2 text-sm text-white/60">
                  {new Date(e.created_at).toLocaleString()}
                </p>
              </div>
            ))}
            {!events?.length ? (
              <p className="text-white/60">No urgent system alerts.</p>
            ) : null}
          </div>
        </section>
        <section className="rounded-3xl bg-card p-6">
          <h2 className="text-2xl text-plum">New DJs / Matatus</h2>
          <div className="mt-5 grid gap-3">
            {[
              ...(djs ?? []).map((x) => x.stage_name),
              ...(matatus ?? []).map((x) => x.display_name),
            ].map((x) => (
              <p key={x} className="rounded-xl border p-3">
                {x}
              </p>
            ))}
          </div>
        </section>
      </div>
    </>
  );
}
