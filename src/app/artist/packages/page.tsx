import Link from "next/link";
import { Check, ArrowRight } from "lucide-react";
import { ArtistShell, Header } from "@/components/artist/artist-ui";
import { Button } from "@/components/ui/button";
import { artistContext } from "@/lib/services/artist-data";
import { promotionPackages } from "@/lib/promotion-packages";

export const dynamic = "force-dynamic";
export default async function Page(){const{account}=await artistContext();return <ArtistShell><Header eyebrow="Promotion packages" title={`Choose the right push for ${account.name}.`}/><p className="mt-4 max-w-2xl text-muted-foreground">Every package funds real campaign activity through participating DJs and matatus. You choose the song, audience and dates before submitting.</p><div className="mt-8 grid gap-5 lg:grid-cols-3">{promotionPackages.map((pkg,index)=><article key={pkg.id} className={`rounded-3xl p-6 ${index===1?"bg-plum text-white ring-4 ring-coral/15":"bg-card"}`}><p className={`text-sm font-medium ${index===1?"text-lime":"text-coral"}`}>{pkg.reach}</p><h2 className="mt-2 text-2xl font-medium">{pkg.name}</h2><p className="mt-3 text-sm opacity-70">{pkg.description}</p><p className="mt-7 text-4xl font-medium">KSh {pkg.budget.toLocaleString()}</p><p className="mt-2 text-sm opacity-70">Campaign budget</p><div className="mt-6 flex items-center gap-2 text-sm"><Check className="size-4"/>{pkg.partners}</div><Button asChild variant={index===1?"secondary":"default"} className="mt-7 w-full"><Link href={`/artist/campaigns/new?package=${pkg.id}`}>Choose package<ArrowRight/></Link></Button></article>)}</div><p className="mt-6 rounded-2xl bg-lavender p-5 text-sm text-plum">Labels can select any artist and eligible song in their Sauti catalogue during campaign setup.</p></ArtistShell>}
