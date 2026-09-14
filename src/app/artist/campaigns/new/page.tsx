import { CampaignWizard } from "@/components/artist/campaign-wizard";
import { ArtistShell } from "@/components/artist/artist-ui";
import { artistContext } from "@/lib/services/artist-data";

export const dynamic = "force-dynamic";
export default async function Page({searchParams}:{searchParams:Promise<{song?:string;draft?:string;package?:string}>}){
  const x=await artistContext(),q=await searchParams;
  const{data:draft}=q.draft?await x.db.from("campaign_drafts").select("*").eq("id",q.draft).eq("owner_profile_id",x.profile.id).eq("state","DRAFT").maybeSingle():{data:null};
  return <ArtistShell>{x.account.account_type==="LABEL"?<p className="mb-5 rounded-2xl bg-lavender p-4 text-sm text-plum">Label campaign · Choose the artist&apos;s eligible release from your catalogue below.</p>:null}<CampaignWizard songs={x.songs.filter(s=>Boolean(s.audio_asset_url&&s.rights_declaration_accepted)&&s.status!=="ARCHIVED")} initialSong={q.song} draft={draft??undefined}/></ArtistShell>;
}
