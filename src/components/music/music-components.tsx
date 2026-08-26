import { MoreHorizontal, Play } from "lucide-react";
import { Artwork } from "@/components/music/artwork";
import { Button } from "@/components/ui/button";
import type { MusicItem } from "@/lib/types";

export function SongArtworkCard({ item }: { item: MusicItem }) { return <article className="surface-hover group min-w-40 rounded-3xl bg-card p-3"><Artwork item={item} /><h3 className="mt-3 truncate font-medium">{item.title}</h3><p className="truncate text-sm text-muted-foreground">{item.artist}</p></article>; }
export function MusicRow({ item, meta }: { item: MusicItem; meta?: string }) { return <article className="group flex items-center gap-4 rounded-2xl px-2 py-3 transition-colors hover:bg-card"><Artwork item={item} className="size-14 shrink-0 rounded-xl" /><div className="min-w-0 flex-1"><h3 className="truncate font-medium">{item.title}</h3><p className="truncate text-sm text-muted-foreground">{item.artist}{meta ? ` · ${meta}` : ""}</p></div><Button size="icon" variant="ghost" aria-label={`Play ${item.title}`}><Play className="fill-current" /></Button><Button size="icon" variant="ghost" className="hidden sm:inline-flex" aria-label={`More options for ${item.title}`}><MoreHorizontal /></Button></article>; }
