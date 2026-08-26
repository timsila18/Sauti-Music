import Link from "next/link";
import { cn } from "@/lib/utils";
export function BrandMark({ className }: { className?: string }) { return <Link href="/" aria-label="Sauti home" className={cn("text-2xl font-semibold tracking-[-.06em] text-plum", className)}>sauti<span className="text-coral">.</span></Link>; }
