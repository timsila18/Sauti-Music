"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

function Field({ name, label, type = "text", required = false }: { name: string; label: string; type?: string; required?: boolean }) {
  return <div className="grid gap-2"><Label htmlFor={name}>{label}</Label><Input id={name} name={name} type={type} required={required} className="h-12 rounded-xl" /></div>;
}

async function upload(file: File, kind: "audio" | "artwork") {
  const intent = await fetch("/api/storage/upload-intent", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ kind, mime: file.type, size: file.size }) });
  const prepared = await intent.json();
  if (!intent.ok) throw new Error(prepared.error ?? "The upload could not be prepared.");
  const form = new FormData(); form.append("file", file);
  const response = await fetch(prepared.uploadUrl, { method: "POST", body: form });
  const result = await response.json();
  if (!response.ok) throw new Error(result.error ?? `The ${kind} upload failed.`);
  return { key: prepared.key as string, url: result.url as string | undefined, receipt: result.receipt as string | undefined };
}

export function NewSongForm() {
  const router = useRouter();
  const [error, setError] = useState(""); const [status, setStatus] = useState(""); const [pending, setPending] = useState(false);
  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault(); setError(""); setPending(true); const form = new FormData(event.currentTarget);
    try {
      const audio = form.get("audio") as File, artwork = form.get("artwork") as File;
      setStatus("Securely uploading campaign audio…"); const audioResult = await upload(audio, "audio");
      let artworkUrl = "";
      if (artwork?.size) { setStatus("Uploading artwork…"); artworkUrl = (await upload(artwork, "artwork")).url ?? ""; }
      setStatus("Saving your song…");
      const external_links = Object.fromEntries(["youtube", "spotify", "apple_music", "mdundo"].map((key) => [key, String(form.get(key) ?? "").trim()]).filter(([, value]) => value));
      const body = Object.fromEntries(["title", "version", "featured", "genre", "language", "release_date", "isrc"].map((key) => [key, String(form.get(key) ?? "")]));
      const response = await fetch("/api/storage/complete", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ ...body, external_links, audioKey: audioResult.key, audioReceipt: audioResult.receipt, artworkUrl }) });
      const result = await response.json(); if (!response.ok) throw new Error(result.error ?? "The song could not be saved.");
      router.push(`/artist/music/${result.id}`); router.refresh();
    } catch (cause) { setError(cause instanceof Error ? cause.message : "The upload could not be completed."); setStatus(""); setPending(false); }
  }
  return <form onSubmit={submit} className="mt-8 grid gap-5 rounded-3xl bg-card p-6 sm:p-8"><Field name="title" label="Song title" required /><div className="grid gap-5 sm:grid-cols-2"><Field name="version" label="Version / remix (optional)" /><Field name="featured" label="Featured artist (optional)" /></div><div className="grid gap-5 sm:grid-cols-2"><Field name="genre" label="Genre" /><Field name="language" label="Language" /></div><div className="grid gap-5 sm:grid-cols-2"><Field name="release_date" label="Release date" type="date" /><Field name="isrc" label="ISRC (optional)" /></div><Field name="artwork" label="Artwork · JPG, PNG or WebP up to 8 MB" type="file" /><Field name="audio" label="Campaign audio · MP3, WAV or M4A up to 30 MB" type="file" required /><fieldset className="grid gap-4 rounded-2xl bg-lavender p-5"><legend className="font-medium text-plum">External listening links (optional)</legend>{["youtube", "spotify", "apple_music", "mdundo"].map((key) => <Field key={key} name={key} label={key.replace("_", " ")} type="url" />)}</fieldset><label className="flex items-start gap-3 rounded-2xl border p-4 text-sm"><input type="checkbox" name="rights" value="yes" required className="mt-1" /><span>I confirm that I own this music or have permission to upload and promote it through Sauti.</span></label>{error ? <p role="alert" className="text-sm text-destructive">{error}</p> : null}{status ? <p role="status" className="text-sm text-coral">{status}</p> : null}<div className="overflow-hidden rounded-full bg-muted"><div className={`h-1 bg-coral transition-all ${pending ? "w-2/3 animate-pulse" : "w-0"}`} /></div><Button type="submit" disabled={pending}>{pending ? "Uploading…" : "Save Song"}</Button><p className="text-xs text-muted-foreground">Campaign audio is encrypted in Sauti&apos;s private HostAfrica compartment and is never publicly downloadable.</p></form>;
}
