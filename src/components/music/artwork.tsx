import { Music2 } from "lucide-react";
import { cn } from "@/lib/utils";
import type { MusicItem } from "@/lib/types";
const accents = { coral:"bg-coral", plum:"bg-plum", lime:"bg-lime text-plum", lavender:"bg-lavender text-plum" };
export function Artwork({ item, className }: { item: MusicItem; className?: string }) { return <div aria-label={`${item.title} artwork`} role="img" className={cn("relative grid aspect-square place-items-center overflow-hidden rounded-2xl text-white", accents[item.accent], className)}><div className="absolute -right-8 -top-8 size-28 rounded-full border-[18px] border-current opacity-15" /><Music2 className="size-8" /><span className="absolute bottom-3 left-3 text-xs font-semibold uppercase tracking-widest opacity-80">Sauti</span></div>; }
