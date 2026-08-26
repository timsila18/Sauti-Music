import Link from "next/link";
import { AdminHeader, Status } from "@/components/admin/admin-shell";
import { adminClient } from "@/lib/services/admin-data";

export const dynamic = "force-dynamic";

export default async function Page({
  searchParams,
}: {
  searchParams: Promise<{ risk?: string; reason?: string }>;
}) {
  const filters = await searchParams;
  const db = await adminClient();
  let riskQuery = db
    .from("account_risk_profiles")
    .select("*")
    .order("last_evaluated_at", { ascending: false })
    .limit(100);
  if (["LOW", "MEDIUM", "HIGH", "BLOCKED"].includes(filters.risk ?? "")) {
    riskQuery = riskQuery.eq("risk_level", filters.risk as "LOW" | "MEDIUM" | "HIGH" | "BLOCKED");
  }
  let flagQuery = db
    .from("play_event_flags")
    .select("*")
    .eq("status", "OPEN")
    .order("created_at", { ascending: false })
    .limit(100);
  if (filters.reason) flagQuery = flagQuery.eq("flag_type", filters.reason);
  const [{ data: risks }, { data: flags }, { data: metrics }, { data: profiles }, { data: holds }] =
    await Promise.all([
      riskQuery,
      flagQuery,
      db.from("admin_risk_metrics").select("*").single(),
      db.from("profiles").select("id,display_name,handle,account_status"),
      db.from("ledger_transactions").select("id,amount,currency,reference_id,created_at").eq("status", "PENDING").eq("transaction_type", "PARTICIPANT_EARNING").order("created_at", { ascending: false }).limit(50),
    ]);
  const total = Number(metrics?.total ?? 0);
  const pct = (value: unknown) => total ? `${Math.round((Number(value ?? 0) / total) * 100)}%` : "0%";
  return (
    <>
      <AdminHeader eyebrow="Trust & Safety" title="Risk dashboard" description="Transparent, rule-based signals protecting campaign funds. No opaque fraud score." />
      <form className="mt-6 flex flex-wrap gap-2 rounded-2xl bg-card p-4">
        <select name="risk" defaultValue={filters.risk ?? ""} className="h-10 rounded-xl border px-3"><option value="">All risk levels</option>{["LOW","MEDIUM","HIGH","BLOCKED"].map(x=><option key={x}>{x}</option>)}</select>
        <input name="reason" defaultValue={filters.reason ?? ""} placeholder="Reason code" className="h-10 rounded-xl border px-3" />
        <button className="rounded-xl bg-plum px-5 text-white">Filter</button>
      </form>
      <section className="mt-6 grid gap-3 sm:grid-cols-2 xl:grid-cols-5">
        <Metric label="Qualified" value={pct(metrics?.qualified)} />
        <Metric label="Not qualified" value={pct(metrics?.not_qualified)} />
        <Metric label="Pending review" value={pct(metrics?.pending_review)} />
        <Metric label="Rejected" value={pct(metrics?.rejected)} />
        <Metric label="Pending holds" value={String(holds?.length ?? 0)} />
      </section>
      <div className="mt-7 grid gap-6 xl:grid-cols-2">
        <section className="rounded-3xl bg-card p-6"><h2 className="text-2xl text-plum">High risk accounts</h2><div className="mt-4 grid gap-3">{(risks ?? []).map(r=>{const p=profiles?.find(x=>x.id===r.profile_id);return <Link href={`/admin/users?profile=${r.profile_id}`} key={r.profile_id} className="rounded-2xl border p-4"><div className="flex justify-between gap-3"><b>{p?.display_name ?? r.profile_id.slice(0,8)}</b><Status>{r.risk_level}</Status></div><p className="mt-1 text-sm text-muted-foreground">{r.minor_violation_count} minor · {r.serious_violation_count} serious · {p?.account_status}</p></Link>})}{!risks?.length?<p className="text-muted-foreground">No matching risk profiles.</p>:null}</div></section>
        <section className="rounded-3xl bg-card p-6"><h2 className="text-2xl text-plum">Recently flagged activity</h2><div className="mt-4 grid gap-3">{(flags ?? []).map(f=><Link href="/admin/reviews/plays" key={f.id} className="rounded-2xl border p-4"><div className="flex justify-between gap-3"><b>{f.flag_type.replaceAll("_"," ")}</b><Status>{f.severity}</Status></div><p className="mt-1 text-sm text-muted-foreground">{f.source} · {new Date(f.created_at).toLocaleString()}</p></Link>)}{!flags?.length?<p className="text-muted-foreground">No open flags.</p>:null}</div></section>
      </div>
      <section className="mt-6 rounded-3xl bg-card p-6"><h2 className="text-2xl text-plum">Pending financial holds</h2><div className="mt-4 grid gap-2">{(holds ?? []).map(h=><p key={h.id} className="rounded-xl border p-3 text-sm">{h.currency} {h.amount} · activity {h.reference_id?.slice(0,8)} · {new Date(h.created_at).toLocaleString()}</p>)}{!holds?.length?<p className="text-muted-foreground">No pending holds.</p>:null}</div></section>
    </>
  );
}

function Metric({label,value}:{label:string;value:string}) { return <div className="rounded-2xl bg-lavender p-5 text-plum"><p className="text-sm">{label}</p><p className="mt-2 text-3xl font-medium">{value}</p></div>; }
