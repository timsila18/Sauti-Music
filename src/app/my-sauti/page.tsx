import type {Metadata} from "next";
import {AppShell} from "@/components/app-shell";
import {MySautiView} from "@/components/listener/listener-ui";
import {requireRole} from "@/lib/auth/session";
import {createClient} from "@/lib/supabase/server";
export const metadata:Metadata={title:"My Sauti"};export const dynamic="force-dynamic";
export default async function Page(){const {profile}=await requireRole("LISTENER","/my-sauti");const supabase=await createClient();const [saves,heard,follows]=await Promise.all([supabase.from("song_saves").select("song_id").eq("profile_id",profile.id).order("created_at",{ascending:false}).limit(24),supabase.from("listener_history").select("id,song_id,heard_at,context_label").eq("profile_id",profile.id).order("heard_at",{ascending:false}).limit(24),supabase.from("follows").select("target_id").eq("profile_id",profile.id).limit(50)]);return <AppShell role="listener" action={{role:"listener",label:"Start Listening",supportingText:"Discover what's playing around you."}}><MySautiView savedIds={(saves.data??[]).map(x=>x.song_id)} history={(heard.data??[]).map(x=>({id:x.id,songId:x.song_id,heardAt:x.heard_at,context:x.context_label}))} following={(follows.data??[]).map(x=>x.target_id)}/></AppShell>}
