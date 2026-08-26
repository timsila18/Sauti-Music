import { reprocessPlay, reviewPlay } from "@/app/admin/actions";
import { AdminHeader, Status } from "@/components/admin/admin-shell";
import { adminClient } from "@/lib/services/admin-data";
export default async function Page() {
  const db = await adminClient();
  const [
    { data: plays },
    { data: flags },
    { data: songs },
    { data: campaigns },
  ] = await Promise.all([
    db
      .from("play_events")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(100),
    db
      .from("play_event_flags")
      .select("*")
      .order("created_at", { ascending: false }),
    db.from("songs").select("id,title"),
    db.from("campaigns").select("id,campaign_name,configuration_snapshot"),
  ]);
  return (
    <>
      <AdminHeader
        eyebrow="Trust & Safety"
        title="Play review queue"
        description="Manual decisions preserve the system result and use the same protected earning ledger."
      />
      <div className="mt-7 grid gap-3">
        {(plays ?? [])
          .filter(
            (p) =>
              ["PENDING", "REVIEW_REQUIRED", "NOT_QUALIFIED"].includes(
                p.qualification_status,
              ) || flags?.some((f) => f.play_event_id === p.id),
          )
          .map((p) => {
            const f = flags?.find((x) => x.play_event_id === p.id);
            return (
              <article key={p.id} className="rounded-2xl bg-card p-5">
                <div className="flex flex-wrap justify-between gap-3">
                  <div>
                    <Status>{f ? "FLAGGED" : p.qualification_status}</Status>
                    <h2 className="mt-2 text-lg font-medium">
                      {songs?.find((s) => s.id === p.song_id)?.title}
                    </h2>
                    <p className="text-sm text-muted-foreground">
                      {
                        campaigns?.find((c) => c.id === p.campaign_id)
                          ?.campaign_name
                      }{" "}
                      · {p.source_type} · {p.verification_method}
                    </p>
                    <p className="text-sm">
                      {f?.flag_type.replaceAll("_", " ") ?? "Awaiting review"} ·{" "}
                      {new Date(p.created_at).toLocaleString()}
                    </p>
                  </div>
                  <code className="text-xs">{p.id.slice(0, 8)}</code>
                </div>
                <form
                  action={reviewPlay}
                  className="mt-4 grid gap-2 sm:grid-cols-4"
                >
                  <input type="hidden" name="playId" value={p.id} />
                  <select
                    name="outcome"
                    className="h-10 rounded-xl border px-2"
                  >
                    <option>APPROVED</option>
                    <option>REJECTED</option>
                    <option>KEPT_FLAGGED</option>
                  </select>
                  <input
                    required
                    name="reason"
                    placeholder="Decision reason"
                    className="h-10 rounded-xl border px-3"
                  />
                  <input
                    name="note"
                    placeholder="Private note"
                    className="h-10 rounded-xl border px-3"
                  />
                  <button className="rounded-xl bg-coral px-4 text-white">
                    Confirm review
                  </button>
                </form>
                <form action={reprocessPlay} className="mt-2 flex gap-2">
                  <input type="hidden" name="playId" value={p.id} />
                  <input required name="reason" placeholder="Reason to re-run this decision" className="h-10 min-w-0 flex-1 rounded-xl border px-3" />
                  <button className="rounded-xl border px-4">Reprocess</button>
                </form>
              </article>
            );
          })}
      </div>
    </>
  );
}
