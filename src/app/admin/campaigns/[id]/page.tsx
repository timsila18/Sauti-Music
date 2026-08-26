import { notFound } from "next/navigation";
import { reviewCampaign } from "@/app/admin/actions";
import { AdminHeader, Status } from "@/components/admin/admin-shell";
import { adminClient } from "@/lib/services/admin-data";
export default async function Page({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params,
    db = await adminClient();
  const { data: c } = await db
    .from("campaigns")
    .select("*")
    .eq("id", id)
    .maybeSingle();
  if (!c) notFound();
  const [
    { data: song },
    { data: artist },
    { data: types },
    { data: targets },
    { data: finance },
    { count: rejections },
    { count: flags },
  ] = await Promise.all([
    db.from("songs").select("*").eq("id", c.song_id).single(),
    db
      .from("artist_accounts")
      .select("*")
      .eq("id", c.artist_account_id)
      .single(),
    db
      .from("campaign_participant_types")
      .select("participant_type")
      .eq("campaign_id", id),
    db
      .from("campaign_targets")
      .select("target_type,text_value")
      .eq("campaign_id", id),
    db
      .from("campaign_financial_summary")
      .select("*")
      .eq("campaign_id", id)
      .maybeSingle(),
    db
      .from("campaigns")
      .select("id", { count: "exact", head: true })
      .eq("artist_account_id", c.artist_account_id)
      .eq("status", "REJECTED"),
    db.from("play_event_flags").select("id", { count: "exact", head: true }),
  ]);
  return (
    <>
      <AdminHeader eyebrow="Campaign Review" title={c.campaign_name} />
      <div className="mt-7 grid gap-5 xl:grid-cols-3">
        <Panel title="Artist / Label">
          <b>{artist?.name}</b>
          <p>
            {artist?.verification_status} · {artist?.status}
          </p>
          <p>{rejections ?? 0} previous rejected campaigns</p>
        </Panel>
        <Panel title="Song">
          <b>{song?.title}</b>
          <p>
            Rights declared{" "}
            {song?.rights_declaration_timestamp
              ? new Date(song.rights_declaration_timestamp).toLocaleDateString()
              : "Not recorded"}
          </p>
          <p>ISRC {song?.isrc ?? "Not supplied"}</p>
          {song?.audio_asset_url ? (
            <a className="text-coral" href={`/admin/music/${song.id}/preview`}>
              Secure audio preview
            </a>
          ) : null}
        </Panel>
        <Panel title="Risk / History">
          <p>{flags ?? 0} platform flags</p>
          <p>Account {artist?.status}</p>
          <p>Approval {c.approval_status}</p>
        </Panel>
      </div>
      <div className="mt-5 grid gap-5 xl:grid-cols-2">
        <Panel title="Campaign">
          <p>
            <Status>{c.status}</Status> <Status>{c.funding_status}</Status>
          </p>
          <p>
            Participants:{" "}
            {types?.map((x) => x.participant_type).join(", ") || "None"}
          </p>
          <p>
            Targets:{" "}
            {targets?.map((x) => x.text_value ?? x.target_type).join(", ") ||
              "Broad"}
          </p>
          <p>
            {c.start_date} — {c.end_date}
          </p>
          <p>Budget KSh {Number(c.total_budget).toLocaleString()}</p>
        </Panel>
        <Panel title="Campaign Money">
          <p>
            Funded KSh {Number(finance?.total_funded ?? 0).toLocaleString()}
          </p>
          <p>
            Participant activity KSh{" "}
            {Number(finance?.participant_earnings ?? 0).toLocaleString()}
          </p>
          <p>
            Platform fee KSh{" "}
            {Number(finance?.platform_fee ?? 0).toLocaleString()}
          </p>
          <p>
            Remaining KSh{" "}
            {Number(finance?.remaining_balance ?? 0).toLocaleString()}
          </p>
        </Panel>
      </div>
      <form
        action={reviewCampaign}
        className="mt-6 grid gap-3 rounded-3xl bg-card p-6 sm:grid-cols-2"
      >
        <input type="hidden" name="campaignId" value={c.id} />
        <select name="outcome" className="h-11 rounded-xl border px-3">
          <option>APPROVED</option>
          <option>REJECTED</option>
          <option>CHANGES_REQUESTED</option>
          <option>PAUSED</option>
          <option>CANCELLED</option>
        </select>
        <select name="category" className="h-11 rounded-xl border px-3">
          <option value="other">Reason: other</option>
          <option value="rights concern">Rights concern</option>
          <option value="invalid audio">Invalid audio</option>
          <option value="incomplete information">Incomplete information</option>
          <option value="policy violation">Policy violation</option>
        </select>
        <textarea
          required
          name="message"
          placeholder="Message visible to Artist"
          className="min-h-24 rounded-xl border p-3"
        />
        <textarea
          name="note"
          placeholder="Private internal note"
          className="min-h-24 rounded-xl border p-3"
        />
        <label className="text-sm">
          <input required type="checkbox" /> Confirm this review decision and
          its consequences.
        </label>
        <button className="rounded-xl bg-coral p-3 text-white">
          Record decision
        </button>
      </form>
    </>
  );
}
function Panel({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="grid content-start gap-2 rounded-3xl bg-card p-6">
      <h2 className="text-xl font-medium text-plum">{title}</h2>
      {children}
    </section>
  );
}
