import { ArrowRight, Megaphone, Play, Radio, Route } from "lucide-react";
import { AppShell } from "@/components/app-shell";
import { ArtistAvatar } from "@/components/artist-avatar";
import { SongArtworkCard, MusicRow } from "@/components/music/music-components";
import { PageHeader, SectionHeader } from "@/components/page-header";
import { CampaignCard, EarningsDisplay, MetricDisplay, SearchField, StatusBadge } from "@/components/product-components";
import { Artwork } from "@/components/music/artwork";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { campaigns, music } from "@/lib/sample-data";

export function ListenerPreview() {
  return <AppShell role="listener" action={{ role:"listener", label:"Start Listening", supportingText:"Listening mode is coming soon." }}>
    <PageHeader eyebrow="Good afternoon, Amani" title="What are we hearing?" description="Tap the Sauti button whenever a sound catches you." />
    <SearchField placeholder="Search songs, artists and moods" />
    <section className="mt-10"><SectionHeader title="What's Playing?" /><div className="grid gap-5 rounded-3xl bg-plum p-5 text-white sm:grid-cols-[160px_1fr] sm:p-7"><Artwork item={music[0]} className="w-full max-w-40" /><div className="flex flex-col justify-center"><StatusBadge tone="lime">Live nearby</StatusBadge><h2 className="mt-4 text-3xl font-medium">{music[0].title}</h2><p className="mt-1 text-white/60">{music[0].artist} · Westlands</p><Button className="mt-6 w-fit rounded-full"><Play className="fill-current" />Play preview</Button></div></div></section>
    <section className="mt-12"><SectionHeader title="Hot Around You" action="See all" /><div className="grid grid-cols-2 gap-3 sm:grid-cols-4">{music.map(item=><SongArtworkCard key={item.title} item={item} />)}</div></section>
    <section className="mt-12"><SectionHeader title="Recently Heard" />{music.slice(1).map((item,index)=><MusicRow key={item.title} item={item} meta={`${index+2}h ago`} />)}</section>
  </AppShell>;
}

export function ArtistPreview() {
  return <AppShell role="artist" action={{ role:"artist", label:"Share Music", supportingText:"Music publishing tools are coming soon." }}>
    <div className="flex items-start justify-between gap-6"><PageHeader eyebrow="Artist home" title="Your sound is moving." description="A clear view of how listeners are finding your music." /><ArtistAvatar name="Njerae" subtitle="Verified artist" /></div>
    <section><SectionHeader title="Verified Plays" /><div className="grid gap-px overflow-hidden rounded-3xl bg-border sm:grid-cols-3"><div className="bg-card p-6"><MetricDisplay label="This week" value="12,480" trend="↑ 18% from last week" /></div><div className="bg-card p-6"><MetricDisplay label="New listeners" value="3,210" /></div><div className="bg-card p-6"><MetricDisplay label="Top city" value="Nairobi" /></div></div></section>
    <section className="mt-12"><SectionHeader title="Your Music" action="View catalogue" />{music.slice(0,3).map((item,index)=><MusicRow key={item.title} item={{...item,artist:"Njerae"}} meta={`${8-index*2}.4K plays`} />)}</section>
    <section className="mt-12 rounded-3xl bg-lavender p-6 sm:flex sm:items-center sm:justify-between sm:p-8"><div><Megaphone className="size-6 text-coral" /><h2 className="mt-5 text-2xl font-medium text-plum">Promote a Song</h2><p className="mt-2 text-muted-foreground">Put your next release in front of the right listeners.</p></div><Button className="mt-6 rounded-full sm:mt-0">Create campaign <ArrowRight /></Button></section>
  </AppShell>;
}

export function DjPreview() {
  return <AppShell role="dj" action={{ role:"dj", label:"Start My Set", supportingText:"Set tracking is coming soon." }}>
    <PageHeader eyebrow="DJ home" title="Ready when you are, DJ Mura." description="Start your set, find a campaign, and keep the room moving." />
    <section className="grid gap-5 lg:grid-cols-[1.4fr_.6fr]"><div className="relative overflow-hidden rounded-3xl bg-coral p-7 text-white"><Radio className="size-7" /><h2 className="mt-12 text-4xl font-medium">Start My Set</h2><p className="mt-2 max-w-md text-white/75">Capture verified plays while you do what you do best.</p><Button variant="secondary" className="mt-7 rounded-full bg-white text-plum hover:bg-white/90">Start set <ArrowRight /></Button><div className="absolute -bottom-16 -right-12 size-52 rounded-full border-[28px] border-white/10" /></div><EarningsDisplay amount="KSh 2,840" label="Earnings this week" /></section>
    <section className="mt-12"><SectionHeader title="Available Campaigns" action="View all" /><div className="grid gap-4 md:grid-cols-2">{campaigns.map(campaign=><CampaignCard key={campaign.title} campaign={campaign} />)}</div></section>
    <section className="mt-12"><Tabs defaultValue="recent"><TabsList><TabsTrigger value="recent">Recent sets</TabsTrigger><TabsTrigger value="top">Top tracks</TabsTrigger></TabsList><TabsContent value="recent" className="mt-5">{music.slice(0,2).map((item,index)=><MusicRow key={item.title} item={item} meta={`${32-index*11} verified plays`} />)}</TabsContent><TabsContent value="top" className="mt-5"><MusicRow item={music[2]} meta="Your most played" /></TabsContent></Tabs></section>
  </AppShell>;
}

export function MatatuPreview() {
  return <AppShell role="matatu" action={{ role:"matatu", label:"Start Trip", supportingText:"Trip mode is coming soon." }}>
    <PageHeader eyebrow="Matatu home · KDK 254A" title="Turn every trip into value." description="Play Kenyan music, verify the journey and earn along the way." />
    <section className="grid gap-5 lg:grid-cols-[1.4fr_.6fr]"><div className="rounded-3xl bg-plum p-7 text-white"><Route className="size-7 text-lime" /><h2 className="mt-10 text-4xl font-medium">Play & Earn</h2><p className="mt-2 max-w-lg text-white/65">Start a trip to see eligible campaigns for your route.</p><Button className="mt-7 rounded-full">Start trip <ArrowRight /></Button></div><EarningsDisplay amount="KSh 1,260" /></section>
    <section className="mt-12"><SectionHeader title="Available Campaigns" action="See all" /><div className="grid gap-4 md:grid-cols-2">{campaigns.map(campaign=><CampaignCard key={campaign.title} campaign={campaign} />)}</div></section>
    <section className="mt-12"><SectionHeader title="Today's Earnings" /><Card className="border-0 shadow-none"><CardContent className="grid gap-6 p-6 sm:grid-cols-3"><MetricDisplay label="Verified plays" value="36" /><MetricDisplay label="Trips" value="4" /><MetricDisplay label="Earned" value="KSh 1,260" trend="Target 84% complete" /></CardContent></Card></section>
  </AppShell>;
}
