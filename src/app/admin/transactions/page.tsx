import Link from "next/link";
import { LEDGER_TRANSACTION_TYPES } from "@/domain/finance/types";
import { requireRole } from "@/lib/auth/session";
import { createClient } from "@/lib/supabase/server";
export const dynamic = "force-dynamic";
export default async function Page({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | undefined>>;
}) {
  await requireRole("ADMIN", "/admin/transactions");
  const p = await searchParams,
    db = await createClient();
  let q = db
    .from("ledger_transactions")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(100);
  if (p.reference) q = q.ilike("description", `%${p.reference}%`);
  if (p.wallet) q = q.eq("wallet_id", p.wallet);
  if (p.campaign) q = q.eq("reference_id", p.campaign);
  if (p.from) q = q.gte("created_at", p.from);
  if (p.to) q = q.lte("created_at", `${p.to}T23:59:59.999Z`);
  if (
    p.type &&
    LEDGER_TRANSACTION_TYPES.includes(
      p.type as (typeof LEDGER_TRANSACTION_TYPES)[number],
    )
  )
    q = q.eq(
      "transaction_type",
      p.type as (typeof LEDGER_TRANSACTION_TYPES)[number],
    );
  if (
    p.status &&
    ["PENDING", "POSTED", "FAILED", "REVERSED", "CANCELLED"].includes(p.status)
  )
    q = q.eq(
      "status",
      p.status as "PENDING" | "POSTED" | "FAILED" | "REVERSED" | "CANCELLED",
    );
  const { data: rows } = await q;
  return (
    <main className="min-h-svh bg-background p-6">
      <div className="mx-auto max-w-7xl">
        <Link href="/admin" className="text-sm text-coral">
          ← Finance overview
        </Link>
        <h1 className="mt-4 text-4xl font-medium text-plum">
          Transaction Explorer
        </h1>
        <form className="mt-7 grid gap-3 rounded-2xl bg-card p-4 sm:grid-cols-4">
          <input
            name="from"
            type="date"
            defaultValue={p.from}
            aria-label="From date"
            className="h-11 rounded-xl border px-3"
          />
          <input
            name="to"
            type="date"
            defaultValue={p.to}
            aria-label="To date"
            className="h-11 rounded-xl border px-3"
          />
          <select
            name="type"
            defaultValue={p.type}
            aria-label="Transaction type"
            className="h-11 rounded-xl border px-3"
          >
            <option value="">All transaction types</option>
            {LEDGER_TRANSACTION_TYPES.map((x) => (
              <option key={x}>{x}</option>
            ))}
          </select>
          <select
            name="status"
            defaultValue={p.status}
            aria-label="Transaction status"
            className="h-11 rounded-xl border px-3"
          >
            <option value="">All statuses</option>
            {["PENDING", "POSTED", "FAILED", "REVERSED", "CANCELLED"].map(
              (x) => (
                <option key={x}>{x}</option>
              ),
            )}
          </select>
          <input
            name="campaign"
            defaultValue={p.campaign}
            placeholder="Campaign reference UUID"
            className="h-11 rounded-xl border px-3"
          />
          <input
            name="wallet"
            defaultValue={p.wallet}
            placeholder="Participant wallet UUID"
            className="h-11 rounded-xl border px-3"
          />
          <input
            name="reference"
            defaultValue={p.reference}
            placeholder="Reference / description"
            className="h-11 rounded-xl border px-3"
          />
          <button className="rounded-xl bg-plum text-white">Filter</button>
        </form>
        <div className="mt-5 overflow-x-auto rounded-2xl bg-card">
          <table className="w-full min-w-[900px] text-left text-sm">
            <thead className="text-muted-foreground">
              <tr>
                {[
                  "Transaction",
                  "Amount",
                  "Direction",
                  "Wallet",
                  "Reference",
                  "Status",
                  "Timestamp",
                ].map((x) => (
                  <th key={x} className="p-4">
                    {x}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {(rows ?? []).map((r) => (
                <tr key={r.id} className="border-t">
                  <td className="p-4">
                    <p className="font-medium">
                      {r.transaction_type.replaceAll("_", " ")}
                    </p>
                    <code className="text-xs">{r.id.slice(0, 8)}</code>
                  </td>
                  <td className="p-4">
                    {r.currency} {Number(r.amount).toLocaleString()}
                  </td>
                  <td className="p-4">{r.direction}</td>
                  <td className="p-4 font-mono text-xs">
                    {r.wallet_id.slice(0, 8)}
                  </td>
                  <td className="p-4">{r.description}</td>
                  <td className="p-4">{r.status}</td>
                  <td className="p-4">
                    {new Date(r.created_at).toLocaleString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </main>
  );
}
