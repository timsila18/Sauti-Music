import { setVerification } from "@/app/admin/actions";
import { AdminHeader, Status } from "@/components/admin/admin-shell";
import { adminClient } from "@/lib/services/admin-data";
export default async function Page() {
  const db = await adminClient();
  const [{ data: rows }, { data: crew }, { data: parts }] = await Promise.all([
    db.from("matatus").select("*"),
    db
      .from("matatu_crew_memberships")
      .select("matatu_id,profile_id,membership_role,relationship_role"),
    db
      .from("campaign_participations")
      .select("matatu_id")
      .eq("participant_type", "MATATU"),
  ]);
  return (
    <>
      <AdminHeader eyebrow="Participants" title="Matatus" />
      <div className="mt-7 grid gap-3">
        {(rows ?? []).map((m) => (
          <article key={m.id} className="rounded-2xl bg-card p-5">
            <div className="flex justify-between">
              <div>
                <h2 className="text-xl font-medium">{m.display_name}</h2>
                <p className="text-sm text-muted-foreground">
                  {m.main_route} · {m.sacco_name}
                </p>
                <p className="text-sm">
                  {crew?.filter((x) => x.matatu_id === m.id).length ?? 0} crew ·{" "}
                  {parts?.filter((x) => x.matatu_id === m.id).length ?? 0}{" "}
                  campaigns
                </p>
              </div>
              <Status>{m.verification_status}</Status>
            </div>
            <form
              action={setVerification}
              className="mt-4 flex flex-wrap gap-2"
            >
              <input type="hidden" name="entityType" value="MATATU" />
              <input type="hidden" name="entityId" value={m.id} />
              <select name="status" className="rounded-xl border px-3">
                <option>PENDING</option>
                <option>VERIFIED</option>
                <option>REJECTED</option>
              </select>
              <input
                required
                name="reason"
                placeholder="Reason"
                className="h-10 rounded-xl border px-3"
              />
              <button className="rounded-xl bg-plum px-4 text-white">
                Update verification
              </button>
            </form>
          </article>
        ))}
      </div>
    </>
  );
}
