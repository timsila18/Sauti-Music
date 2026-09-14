import { randomUUID } from "node:crypto";
import { NextResponse } from "next/server";
import { requireRole } from "@/lib/auth/session";
import { signStorageToken, storageUploadUrl, type StorageKind } from "@/lib/storage/hostafrica";

const allowed = {
  audio: { max: 30 * 1024 * 1024, mime: ["audio/mpeg", "audio/wav", "audio/x-wav", "audio/mp4", "audio/x-m4a"] },
  artwork: { max: 8 * 1024 * 1024, mime: ["image/jpeg", "image/png", "image/webp"] },
} as const;

export async function POST(request: Request) {
  const { profile } = await requireRole("ARTIST_LABEL", "/artist");
  const input = (await request.json()) as { kind?: StorageKind; mime?: string; size?: number };
  if (!input.kind || !(input.kind in allowed)) return NextResponse.json({ error: "Unsupported file type." }, { status: 400 });
  const rule = allowed[input.kind];
  if (!input.mime || !rule.mime.includes(input.mime as never) || !input.size || input.size > rule.max)
    return NextResponse.json({ error: `Invalid ${input.kind} file.` }, { status: 400 });
  const key = `${profile.id}/${randomUUID()}`;
  const token = signStorageToken({ action: "upload", exp: Math.floor(Date.now() / 1000) + 10 * 60, key, kind: input.kind, mime: input.mime, size: input.size });
  return NextResponse.json({ key, uploadUrl: storageUploadUrl(token) });
}
