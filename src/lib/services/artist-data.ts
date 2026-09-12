import "server-only";
import {notFound} from "next/navigation";
import {requireRole} from "@/lib/auth/session";
import {createClient} from "@/lib/supabase/server";
export const campaignStats={spent:0,plays:0,djs:0,matatus:0,saves:0};
export async function artistContext(){const {profile}=await requireRole("ARTIST_LABEL","/artist");const db=await createClient();const {data:membership}=await db.from("artist_account_memberships").select("artist_account_id").eq("profile_id",profile.id).limit(1).maybeSingle();if(!membership)notFound();const [{data:account},{data:songs},{data:campaigns},{data:notifications}]=await Promise.all([db.from("artist_accounts").select("*").eq("id",membership.artist_account_id).single(),db.from("songs").select("*").eq("artist_account_id",membership.artist_account_id).order("created_at",{ascending:false}).limit(30),db.from("campaigns").select("*").eq("artist_account_id",membership.artist_account_id).order("created_at",{ascending:false}).limit(30),db.from("notifications").select("*").eq("recipient_profile_id",profile.id).order("created_at",{ascending:false}).limit(8)]);return {profile,account:account!,songs:songs??[],campaigns:campaigns??[],notifications:notifications??[],db};}

export type CampaignResults = {
  qualifiedPlays: number;
  reviewRequired: number;
  djPartners: number;
  matatuPartners: number;
  saves: number;
  earned: number;
  locations: string[];
};

export async function campaignResults(
  db: Awaited<ReturnType<typeof createClient>>,
  campaign: { id: string; song_id: string; start_date: string; end_date: string },
): Promise<CampaignResults> {
  const endExclusive = new Date(`${campaign.end_date}T00:00:00.000Z`);
  endExclusive.setUTCDate(endExclusive.getUTCDate() + 1);
  const [{ data: plays }, { data: participations }, { count: saves }] = await Promise.all([
    db.from("play_events").select("qualification_status,reward_amount,source_type,source_id").eq("campaign_id", campaign.id),
    db.from("campaign_participations").select("participant_type,dj_profile_id,matatu_id").eq("campaign_id", campaign.id).in("status", ["ACCEPTED", "ACTIVE", "COMPLETED"]),
    db.from("song_saves").select("song_id", { count: "exact", head: true }).eq("song_id", campaign.song_id).gte("created_at", `${campaign.start_date}T00:00:00.000Z`).lt("created_at", endExclusive.toISOString()),
  ]);

  const partners = participations ?? [];
  const djIds = [...new Set(partners.flatMap((item) => item.dj_profile_id ? [item.dj_profile_id] : []))];
  const matatuIds = [...new Set(partners.flatMap((item) => item.matatu_id ? [item.matatu_id] : []))];
  const [{ data: djs }, { data: matatus }] = await Promise.all([
    djIds.length ? db.from("dj_profiles").select("town_area,county").in("id", djIds) : Promise.resolve({ data: [] }),
    matatuIds.length ? db.from("matatus").select("town_area,county").in("id", matatuIds) : Promise.resolve({ data: [] }),
  ]);
  const locations = [...new Set([...(djs ?? []), ...(matatus ?? [])].flatMap((item) => item.town_area || item.county ? [item.town_area ?? item.county!] : []))];
  const events = plays ?? [];

  return {
    qualifiedPlays: events.filter((item) => item.qualification_status === "QUALIFIED").length,
    reviewRequired: events.filter((item) => item.qualification_status === "REVIEW_REQUIRED").length,
    djPartners: djIds.length,
    matatuPartners: matatuIds.length,
    saves: saves ?? 0,
    earned: events.reduce((total, item) => total + Number(item.reward_amount ?? 0), 0),
    locations,
  };
}
