import type {Metadata} from "next";
import {notFound} from "next/navigation";
import {AppShell} from "@/components/app-shell";
import {SongDetailView} from "@/components/listener/listener-ui";
import {requireRole} from "@/lib/auth/session";
import {songBySlug} from "@/lib/services/listener-discovery";
export const dynamic="force-dynamic";
export async function generateMetadata({params}:{params:Promise<{slug:string}>}):Promise<Metadata>{const song=songBySlug((await params).slug);return {title:song?`${song.title} — ${song.artist}`:"Song"}}
export default async function Page({params}:{params:Promise<{slug:string}>}){await requireRole("LISTENER","/discover");const song=songBySlug((await params).slug);if(!song)notFound();return <AppShell role="listener" action={{role:"listener",label:"Start Listening",supportingText:"Discover what's playing around you."}}><SongDetailView song={song}/></AppShell>}
