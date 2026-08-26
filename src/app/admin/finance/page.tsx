import { AdminHeader } from "@/components/admin/admin-shell";
import {
  createAdjustment,
  simulateFunding,
  simulateRefund,
} from "@/app/admin/actions";
import { adminClient } from "@/lib/services/admin-data";
import { runtime } from "@/lib/config/features";
const money = (v: number) =>
  `KSh ${v.toLocaleString(undefined, { minimumFractionDigits: 2 })}`;
export default async function Page() {
  const db = await adminClient();
  const [
    { data: campaigns },
    { data: c },
    { data: w },
    { data: f },
    { count: payouts },
    { data: wallets },
  ] = await Promise.all([
    db.from("campaigns").select("id,campaign_name"),
    db.from("campaign_financial_summary").select("remaining_balance"),
    db.from("wallet_financial_summary").select("wallet_type,available,pending"),
    db
      .from("ledger_transactions")
      .select("amount")
      .eq("transaction_type", "PLATFORM_COMMISSION")
      .eq("direction", "CREDIT")
      .eq("status", "POSTED"),
    db
      .from("payout_requests")
      .select("id", { count: "exact", head: true })
      .in("status", ["REQUESTED", "PROCESSING"]),
    db.from("wallets").select("id,wallet_type,currency").limit(50),
  ]);
  const metrics = [
    [
      "Campaign funds held",
      money((c ?? []).reduce((n, x) => n + Number(x.remaining_balance), 0)),
    ],
    [
      "Reward liabilities",
      money((w ?? []).reduce((n, x) => n + Number(x.pending), 0)),
    ],
    [
      "Available balances",
      money((w ?? []).reduce((n, x) => n + Number(x.available), 0)),
    ],
    [
      "Platform fees",
      money((f ?? []).reduce((n, x) => n + Number(x.amount), 0)),
    ],
    ["Payouts pending", String(payouts ?? 0)],
  ];
  return (
    <>
      <AdminHeader
        eyebrow="Finance"
        title="Marketplace money"
        description="Ledger-derived totals and controlled development operations."
      />
      <div className="mt-8 grid grid-cols-2 gap-3 xl:grid-cols-5">
        {metrics.map(([l, v]) => (
          <div key={l} className="rounded-2xl bg-card p-5">
            <p className="text-sm text-muted-foreground">{l}</p>
            <p className="mt-2 text-2xl font-medium text-plum">{v}</p>
          </div>
        ))}
      </div>
      <div className="mt-9 grid gap-4 xl:grid-cols-3">
        {runtime.financeSimulation ? <Form title="Development Funding" action={simulateFunding}>
          <Select
            name="campaignId"
            options={(campaigns ?? []).map((x) => [x.id, x.campaign_name])}
          />
          <Input name="amount" placeholder="Amount KES" />
          <button className="rounded-xl bg-coral p-3 text-white">
            Simulate funding
          </button>
        </Form> : null}
        {runtime.financeSimulation ? <Form title="Development Refund" action={simulateRefund}>
          <Select
            name="campaignId"
            options={(campaigns ?? []).map((x) => [x.id, x.campaign_name])}
          />
          <Input name="amount" placeholder="Amount KES" />
          <Input name="reason" placeholder="Reason" />
          <button className="rounded-xl bg-plum p-3 text-white">
            Approve refund
          </button>
        </Form> : null}
        <Form title="Controlled Adjustment" action={createAdjustment}>
          <Select
            name="walletId"
            options={(wallets ?? []).map((x) => [
              x.id,
              `${x.wallet_type} · ${x.id.slice(0, 8)}`,
            ])}
          />
          <Select
            name="direction"
            options={[
              ["CREDIT", "Credit"],
              ["DEBIT", "Debit"],
            ]}
          />
          <Input name="amount" placeholder="Amount KES" />
          <Input name="reason" placeholder="Reason" />
          <Input name="note" placeholder="Supporting note" />
          <label className="text-xs">
            <input required type="checkbox" /> Confirm immutable entry
          </label>
          <button className="rounded-xl bg-plum p-3 text-white">
            Create adjustment
          </button>
        </Form>
      </div>
    </>
  );
}
function Form({
  title,
  action,
  children,
}: {
  title: string;
  action: (f: FormData) => Promise<void>;
  children: React.ReactNode;
}) {
  return (
    <form
      action={action}
      className="grid content-start gap-3 rounded-3xl bg-card p-6"
    >
      <h2 className="text-xl font-medium text-plum">{title}</h2>
      {children}
    </form>
  );
}
function Input(p: React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      required
      {...p}
      className="h-11 rounded-xl border bg-background px-3"
    />
  );
}
function Select({ name, options }: { name: string; options: string[][] }) {
  return (
    <select
      required
      name={name}
      className="h-11 rounded-xl border bg-background px-3"
    >
      {options.map(([v, l]) => (
        <option key={v} value={v}>
          {l}
        </option>
      ))}
    </select>
  );
}
