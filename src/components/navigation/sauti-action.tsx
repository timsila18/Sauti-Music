"use client";

import { AudioLines } from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import type { RoleAction } from "@/lib/types";
import { ListeningSheet } from "@/components/listener/listener-ui";

export function SautiAction({
  action,
  compact = false,
}: {
  action: RoleAction;
  compact?: boolean;
}) {
  if (action.role === "listener") return <ListeningSheet compact={compact} />;
  if (action.role === "artist")
    return (
      <Link
        href="/artist/campaigns/new"
        aria-label="Promote a Song"
        className={cn(
          "pressable group flex items-center justify-center bg-primary text-white focus-visible:ring-2 focus-visible:ring-ring",
          compact
            ? "w-full gap-2 rounded-xl px-4 py-3 text-sm font-medium"
            : "mx-auto -mt-4 size-14 rounded-full border-4 border-card shadow-lg shadow-primary/25",
        )}
      >
        <AudioLines className="size-5" />
        {compact ? "Promote" : <span className="sr-only">Promote a Song</span>}
      </Link>
    );
  if (action.role === "matatu")
    return (
      <Link
        href="/matatu/campaigns"
        aria-label="Play and Earn"
        className={cn(
          "pressable flex items-center justify-center bg-primary text-white",
          compact
            ? "w-full gap-2 rounded-xl px-4 py-3 text-sm font-medium"
            : "mx-auto -mt-4 size-14 rounded-full border-4 border-card shadow-lg shadow-primary/25",
        )}
      >
        <AudioLines className="size-5" />
        {compact ? (
          "Play & Earn"
        ) : (
          <span className="sr-only">Play and Earn</span>
        )}
      </Link>
    );
  if (action.role === "dj")
    return (
      <Link
        href="/dj/sets/new"
        aria-label="Start Set"
        className={cn(
          "pressable flex items-center justify-center bg-primary text-white",
          compact
            ? "w-full gap-2 rounded-xl px-4 py-3 text-sm font-medium"
            : "mx-auto -mt-4 size-14 rounded-full border-4 border-card shadow-lg shadow-primary/25",
        )}
      >
        <AudioLines className="size-5" />
        {compact ? "Start Set" : <span className="sr-only">Start Set</span>}
      </Link>
    );
  return (
    <button
      type="button"
      onClick={() =>
        toast(action.supportingText, {
          description: "This action will be enabled in a future Sauti stage.",
        })
      }
      aria-label={action.label}
      className={cn(
        "pressable group flex items-center justify-center bg-coral text-white shadow-lg shadow-coral/25 focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
        compact
          ? "w-full gap-2 rounded-2xl px-4 py-3 text-sm font-medium"
          : "mx-auto -mt-7 size-16 flex-col rounded-full border-4 border-card",
      )}
    >
      <AudioLines className="size-6 transition-transform group-hover:scale-110" />
      {compact ? action.label : <span className="sr-only">{action.label}</span>}
    </button>
  );
}
