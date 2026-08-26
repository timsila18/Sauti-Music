import Link from "next/link";
import { AdminHeader, Status } from "@/components/admin/admin-shell";
import { adminClient } from "@/lib/services/admin-data";
export default async function Page({
  searchParams,
}: {
  searchParams: Promise<{ status?: string }>;
}) {
  const { status = "PENDING_APPROVAL" } = await searchParams,
    db = await adminClient();
  let q = db
    .from("campaigns")
    .select("*")
    .order("submitted_at", { ascending: true });
  if (status === "PENDING_APPROVAL") q = q.eq("approval_status", "PENDING");
  else q = q.eq("status", status as never);
  const [{ data: rows }, { data: songs }, { data: artists }] =
    await Promise.all([
      q,
      db.from("songs").select("id,title"),
      db.from("artist_accounts").select("id,name"),
    ]);
  return (
    <>
      <AdminHeader
        eyebrow="Campaign Operations"
        title="Campaign review queue"
      />
      <nav className="mt-6 flex gap-2 overflow-x-auto">
        {[
          "PENDING_APPROVAL",
          "ACTIVE",
          "PAUSED",
          "COMPLETED",
          "REJECTED",
          "CANCELLED",
        ].map((x) => (
          <Link
            key={x}
            href={`/admin/campaigns?status=${x}`}
            className="rounded-full border px-4 py-2 text-sm"
          >
            {x.replaceAll("_", " ")}
          </Link>
        ))}
      </nav>
      <div className="mt-7 grid gap-3">
        {(rows ?? []).map((c) => (
          <Link
            key={c.id}
            href={`/admin/campaigns/${c.id}`}
            className="rounded-2xl bg-card p-5"
          >
            <div className="flex flex-wrap justify-between gap-3">
              <div>
                <Status>{c.status}</Status>
                <h2 className="mt-3 text-xl font-medium text-plum">
                  {c.campaign_name}
                </h2>
                <p className="text-sm text-muted-foreground">
                  {songs?.find((s) => s.id === c.song_id)?.title} ·{" "}
                  {artists?.find((a) => a.id === c.artist_account_id)?.name}
                </p>
              </div>
              <div className="text-right">
                <p className="font-medium">
                  KSh {Number(c.total_budget).toLocaleString()}
                </p>
                <p className="text-sm text-muted-foreground">
                  {c.start_date} — {c.end_date}
                </p>
                <p className="text-xs">
                  {c.funding_status.replaceAll("_", " ")}
                </p>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </>
  );
}
