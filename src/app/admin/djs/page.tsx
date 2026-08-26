import { setVerification } from "@/app/admin/actions";
import { AdminHeader, Status } from "@/components/admin/admin-shell";
import { adminClient } from "@/lib/services/admin-data";
export default async function Page() {
  const db = await adminClient();
  const [{ data: rows }, { data: parts }, { data: sets }, { data: wallets }] =
    await Promise.all([
      db.from("dj_profiles").select("*"),
      db
        .from("campaign_participations")
        .select("dj_profile_id")
        .eq("participant_type", "DJ"),
      db.from("dj_sets").select("dj_profile_id"),
      db.from("wallet_financial_summary").select("profile_id,total_earned"),
    ]);
  return (
    <>
      <AdminHeader eyebrow="Participants" title="DJs" />
      <div className="mt-7 grid gap-3">
        {(rows ?? []).map((d) => (
          <article key={d.id} className="rounded-2xl bg-card p-5">
            <div className="flex justify-between">
              <div>
                <h2 className="text-xl font-medium">{d.stage_name}</h2>
                <p className="text-sm text-muted-foreground">
                  {d.town_area}, {d.county} ·{" "}
                  {parts?.filter((x) => x.dj_profile_id === d.id).length ?? 0}{" "}
                  campaigns ·{" "}
                  {sets?.filter((x) => x.dj_profile_id === d.id).length ?? 0}{" "}
                  sets
                </p>
                <p className="text-sm">
                  Earned KSh{" "}
                  {Number(
                    wallets?.find((x) => x.profile_id === d.profile_id)
                      ?.total_earned ?? 0,
                  ).toLocaleString()}
                </p>
              </div>
              <Status>{d.verification_status}</Status>
            </div>
            <Verify entity="DJ" id={d.id} />
          </article>
        ))}
      </div>
    </>
  );
}
function Verify({ entity, id }: { entity: string; id: string }) {
  return (
    <form action={setVerification} className="mt-4 flex flex-wrap gap-2">
      <input type="hidden" name="entityType" value={entity} />
      <input type="hidden" name="entityId" value={id} />
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
  );
}
