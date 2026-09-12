import {notFound} from "next/navigation";
import {ArtistShell,Header} from "@/components/artist/artist-ui";
import {artistContext,campaignResults} from "@/lib/services/artist-data";

export const dynamic="force-dynamic";

export default async function Page({params}:{params:Promise<{id:string}>}){
  const context=await artistContext();
  const id=(await params).id;
  const campaign=context.campaigns.find(item=>item.id===id);
  if(!campaign)notFound();
  const results=await campaignResults(context.db,campaign);
  const partnerTotal=results.djPartners+results.matatuPartners;
  return <ArtistShell>
    <Header eyebrow="Campaign Results" title={campaign.campaign_name}/>
    <div className="mt-8 grid gap-4 sm:grid-cols-2">
      <section className="rounded-3xl bg-card p-6">
        <h2 className="text-xl font-medium">Campaign Summary</h2>
        <p className="mt-4 text-muted-foreground">{results.qualifiedPlays.toLocaleString()} qualified plays · {results.djPartners} DJs · {results.matatuPartners} matatus</p>
        <p className="mt-2 text-sm text-muted-foreground">{results.locations.length?results.locations.join(" · "):partnerTotal?"Partner locations are not set yet.":"No partners have joined yet."}</p>
      </section>
      <section className="rounded-3xl bg-card p-6">
        <h2 className="text-xl font-medium">Engagement</h2>
        <p className="mt-4 text-muted-foreground">{results.saves.toLocaleString()} saves during the campaign · KSh {results.earned.toLocaleString(undefined,{minimumFractionDigits:2,maximumFractionDigits:2})} earned by partners</p>
        {results.reviewRequired?<p className="mt-2 text-sm text-coral">{results.reviewRequired} play{results.reviewRequired===1?"":"s"} awaiting review</p>:null}
      </section>
    </div>
    <p className="mt-5 text-sm text-muted-foreground">Results update from verified campaign activity.</p>
  </ArtistShell>;
}
