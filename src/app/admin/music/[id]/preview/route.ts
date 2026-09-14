import { redirect } from "next/navigation";
import { requireRole } from "@/lib/auth/session";
import { createClient } from "@/lib/supabase/server";
import { isHostAfricaAudioKey, signStorageToken, storageMediaUrl, unwrapHostAfricaKey } from "@/lib/storage/hostafrica";
export async function GET(
  _: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  await requireRole("ADMIN", "/admin/music");
  const { id } = await params,
    db = await createClient();
  const { data: song } = await db
    .from("songs")
    .select("audio_asset_url")
    .eq("id", id)
    .single();
  if (!song?.audio_asset_url) redirect("/admin/music");
  if (isHostAfricaAudioKey(song.audio_asset_url)) {
    const token = signStorageToken({ action: "read", exp: Math.floor(Date.now() / 1000) + 300, key: unwrapHostAfricaKey(song.audio_asset_url), kind: "audio" });
    redirect(storageMediaUrl(token));
  }
  const { data, error } = await db.storage
    .from("campaign-audio")
    .createSignedUrl(song.audio_asset_url, 300);
  if (error) redirect("/admin/music");
  redirect(data.signedUrl);
}
