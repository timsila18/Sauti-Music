import "server-only";

import { createHmac, timingSafeEqual } from "node:crypto";

export type StorageKind = "artwork" | "audio";

type StorageToken = {
  action: "upload" | "read" | "delete";
  exp: number;
  key: string;
  kind: StorageKind;
  mime?: string;
  size?: number;
  download?: boolean;
};

function config() {
  const secret = process.env.SAUTI_STORAGE_SECRET;
  if (!secret || secret.length < 32) throw new Error("Sauti media storage is not configured.");
  return {
    secret,
    uploadUrl: process.env.SAUTI_STORAGE_UPLOAD_URL ?? "https://images.solfit.co.ke/sauti/upload.php",
    mediaUrl: process.env.SAUTI_STORAGE_MEDIA_URL ?? "https://images.solfit.co.ke/sauti/media.php",
  };
}

export function signStorageToken(payload: StorageToken) {
  const { secret } = config();
  const body = Buffer.from(JSON.stringify(payload)).toString("base64url");
  const signature = createHmac("sha256", secret).update(body).digest("base64url");
  return `${body}.${signature}`;
}

export function storageUploadUrl(token: string) {
  return `${config().uploadUrl}?token=${encodeURIComponent(token)}`;
}

export function storageMediaUrl(token: string) {
  return `${config().mediaUrl}?token=${encodeURIComponent(token)}`;
}

export function isHostAfricaAudioKey(value: string) {
  return value.startsWith("hostafrica:");
}

export function unwrapHostAfricaKey(value: string) {
  return value.slice("hostafrica:".length);
}

export function safeTokenEqual(left: string, right: string) {
  const a = Buffer.from(left);
  const b = Buffer.from(right);
  return a.length === b.length && timingSafeEqual(a, b);
}
