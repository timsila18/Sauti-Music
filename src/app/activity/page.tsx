import type {Metadata} from "next";
import {AppShell} from "@/components/app-shell";
import {ActivityFeed} from "@/components/activity/activity-feed";
import {createClient} from "@/lib/supabase/server";
import {requireRole} from "@/lib/auth/session";
export const metadata:Metadata={title:"Activity"};export const dynamic="force-dynamic";
export default async function Page(){const{profile}=await requireRole("LISTENER","/activity");const db=await createClient();const{data}=await db.from("activity_events").select("*").eq("recipient_profile_id",profile.id).order("created_at",{ascending:false}).limit(50);return <AppShell role="listener" action={{role:"listener",label:"Start Listening",supportingText:"Discover what's playing around you."}}><p className="text-sm text-coral">From the Sauti you follow</p><h1 className="mt-1 text-4xl font-medium text-plum">Activity</h1><ActivityFeed events={data??[]} empty="Follow artists, DJs and matatus to shape this feed."/></AppShell>}
