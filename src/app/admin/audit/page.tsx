import { createDispute } from "@/app/admin/actions";
import { AdminHeader, Status } from "@/components/admin/admin-shell";
import { adminClient } from "@/lib/services/admin-data";
export default async function Page({
  searchParams,
}: {
  searchParams: Promise<{ action?: string; entity?: string }>;
}) {
  const p = await searchParams,
    db = await adminClient();
  let q = db
    .from("audit_logs")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(100);
  if (p.action) q = q.ilike("action", `%${p.action}%`);
  if (p.entity) q = q.eq("entity_type", p.entity);
  const [{ data: logs }, { data: disputes }] = await Promise.all([
    q,
    db.from("disputes").select("*").order("created_at", { ascending: false }),
  ]);
  return (
    <>
      <AdminHeader eyebrow="Governance" title="Audit & disputes" />
      <form className="mt-6 flex gap-2">
        <input
          name="action"
          placeholder="Action"
          className="h-11 rounded-xl border px-3"
        />
        <input
          name="entity"
          placeholder="Entity type"
          className="h-11 rounded-xl border px-3"
        />
        <button className="rounded-xl bg-plum px-4 text-white">Filter</button>
      </form>
      <div className="mt-7 grid gap-5 xl:grid-cols-[1.5fr_.5fr]">
        <section className="overflow-hidden rounded-3xl bg-card">
          <h2 className="p-5 text-2xl text-plum">Immutable history</h2>
          {(logs ?? []).map((x) => (
            <details key={x.id} className="border-t p-4">
              <summary className="cursor-pointer">
                <b>{x.action}</b> · {x.entity_type} ·{" "}
                {new Date(x.created_at).toLocaleString()}
              </summary>
              <pre className="mt-3 overflow-auto rounded-xl bg-muted p-3 text-xs">
                {JSON.stringify(
                  {
                    before: x.previous_data,
                    after: x.new_data,
                    metadata: x.metadata,
                  },
                  null,
                  2,
                )}
              </pre>
            </details>
          ))}
        </section>
        <div>
          <form
            action={createDispute}
            className="grid gap-3 rounded-3xl bg-card p-5"
          >
            <h2 className="text-xl text-plum">Open dispute</h2>
            <select name="type" className="h-10 rounded-xl border">
              <option>REJECTED_PLAY</option>
              <option>MISSING_EARNING</option>
              <option>CAMPAIGN</option>
              <option>PAYOUT</option>
              <option>OTHER</option>
            </select>
            <input
              name="entityType"
              required
              placeholder="Related entity type"
              className="h-10 rounded-xl border px-3"
            />
            <input
              name="entityId"
              placeholder="Related entity UUID"
              className="h-10 rounded-xl border px-3"
            />
            <textarea
              name="description"
              required
              placeholder="Description"
              className="min-h-24 rounded-xl border p-3"
            />
            <button className="rounded-xl bg-coral p-3 text-white">
              Create dispute
            </button>
          </form>
          <section className="mt-4 rounded-3xl bg-card p-5">
            <h2 className="text-xl text-plum">Disputes</h2>
            {(disputes ?? []).map((d) => (
              <div key={d.id} className="border-b py-3">
                <Status>{d.status}</Status>
                <p className="mt-2 text-sm">
                  {d.dispute_type} · {d.description}
                </p>
              </div>
            ))}
          </section>
        </div>
      </div>
    </>
  );
}
