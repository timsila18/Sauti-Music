import { AdminHeader, Status } from "@/components/admin/admin-shell";
import { adminClient } from "@/lib/services/admin-data";
export default async function Page() {
  const db = await adminClient();
  const [{ data: songs }, { data: artists }, { data: campaigns }] =
    await Promise.all([
      db.from("songs").select("*").order("created_at", { ascending: false }),
      db.from("artist_accounts").select("id,name"),
      db.from("campaigns").select("song_id"),
    ]);
  return (
    <>
      <AdminHeader
        eyebrow="Music Review"
        title="Submitted music"
        description="Rights declarations, campaign use and secure previews. Artist metadata remains read-only."
      />
      <div className="mt-7 grid gap-3">
        {(songs ?? []).map((s) => (
          <article
            key={s.id}
            className="rounded-2xl bg-card p-5 sm:flex sm:items-center sm:justify-between"
          >
            <div>
              <Status>{s.status}</Status>
              <h2 className="mt-2 text-xl font-medium">{s.title}</h2>
              <p className="text-sm text-muted-foreground">
                {artists?.find((a) => a.id === s.artist_account_id)?.name} ·
                uploaded {new Date(s.created_at).toLocaleDateString()}
              </p>
              <p className="text-sm">
                Rights {s.rights_declaration_accepted ? "declared" : "missing"}{" "}
                · {campaigns?.filter((c) => c.song_id === s.id).length ?? 0}{" "}
                campaigns
              </p>
            </div>
            {s.audio_asset_url ? (
              <a
                href={`/admin/music/${s.id}/preview`}
                className="mt-3 inline-block text-coral"
              >
                Secure preview
              </a>
            ) : null}
          </article>
        ))}
      </div>
    </>
  );
}
