import type { Metadata } from "next";
import { AppShell } from "@/components/app-shell";
import { ListenerHome } from "@/components/listener/listener-ui";
import { requireRole } from "@/lib/auth/session";
export const metadata: Metadata = { title:"Listener Home" };
export const dynamic="force-dynamic";
export default async function Page() { const {profile}=await requireRole("LISTENER","/listener");const {createClient}=await import("@/lib/supabase/server");const supabase=await createClient();const {data=[]}=await supabase.from("listener_history").select("id,song_id,heard_at,context_label").eq("profile_id",profile.id).order("heard_at",{ascending:false}).limit(8);const history=(data??[]).map(x=>({id:x.id,songId:x.song_id,heardAt:x.heard_at,context:x.context_label}));return <AppShell role="listener" action={{role:"listener",label:"Start Listening",supportingText:"Discover what's playing around you."}}><ListenerHome name={profile.display_name} area={profile.town_area??profile.county??"Kenya"} history={history}/></AppShell>; }
