import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { requireRole } from "@/lib/auth/session";
import { createClient } from "@/lib/supabase/server";
import { safeTokenEqual, storageReceipt } from "@/lib/storage/hostafrica";

const clean = (value: unknown) => typeof value === "string" ? value.trim() : "";

export async function POST(request: Request) {
  const { profile } = await requireRole("ARTIST_LABEL", "/artist");
  const db = await createClient();
  const { data: membership } = await db.from("artist_account_memberships").select("artist_account_id").eq("profile_id", profile.id).limit(1).maybeSingle();
  if (!membership) return NextResponse.json({ error: "Artist account not found." }, { status: 403 });
  const body = await request.json();
  const title = clean(body.title), audioKey = clean(body.audioKey), artworkUrl = clean(body.artworkUrl), audioReceipt = clean(body.audioReceipt);
  if (!title || !audioKey.startsWith(`${profile.id}/`)) return NextResponse.json({ error: "Invalid song upload." }, { status: 400 });
  if (!safeTokenEqual(audioReceipt, storageReceipt(audioKey))) return NextResponse.json({ error: "The audio upload could not be verified." }, { status: 400 });
  if (artworkUrl && !artworkUrl.startsWith("https://images.solfit.co.ke/sauti/artwork/")) return NextResponse.json({ error: "Invalid artwork." }, { status: 400 });
  const { data, error } = await db.from("songs").insert({
    id: crypto.randomUUID(), artist_account_id: membership.artist_account_id, title, version_name: clean(body.version) || null,
    featured_artist_text: clean(body.featured) || null, artwork_url: artworkUrl || null,
    audio_asset_url: `hostafrica:${audioKey}`, duration_seconds: null, isrc: clean(body.isrc) || null,
    release_date: clean(body.release_date) || null, genre: clean(body.genre) || null,
    language: clean(body.language) || null, external_links: body.external_links ?? {}, is_explicit: false,
    status: "DRAFT", rights_declaration_accepted: true, rights_declaration_timestamp: new Date().toISOString(),
  }).select("id").single();
  if (error) return NextResponse.json({ error: "Your song details could not be saved." }, { status: 500 });
  revalidatePath("/artist/music");
  return NextResponse.json({ id: data.id });
}
