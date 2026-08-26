import Link from "next/link";
import { ArrowDown, ArrowRight, AudioLines, BadgeCheck, BusFront, Check, ChevronRight, Disc3, Headphones, Heart, MapPin, Megaphone, Music2, Play, Radio, Sparkles, TrendingUp, Users } from "lucide-react";
import { BrandMark } from "@/components/brand-mark";
import { Artwork } from "@/components/music/artwork";
import { Button } from "@/components/ui/button";
import { music } from "@/lib/sample-data";

const roles = [
  { href:"/listener", eyebrow:"For the curious", title:"Listener", description:"Discover music around you. Save what you hear, request songs and follow the people shaping the sound.", cta:"Explore as Listener", icon:Headphones, tone:"bg-white", accent:"bg-primary text-white" },
  { href:"/artist", eyebrow:"For the creators", title:"Artist / Label", description:"Promote your music through real DJs and matatus and see what happened.", cta:"Get My Music Heard", icon:Megaphone, tone:"bg-white", accent:"bg-secondary text-primary" },
  { href:"/dj", eyebrow:"For the selectors", title:"DJ", description:"Discover campaigns, play new music, build your profile and earn.", cta:"Join as DJ", icon:Radio, tone:"bg-white", accent:"bg-secondary text-primary" },
  { href:"/matatu", eyebrow:"For the movers", title:"Matatu", description:"Build your music identity, engage passengers and earn from music campaigns.", cta:"Join as Matatu", icon:BusFront, tone:"bg-white", accent:"bg-secondary text-primary" },
] as const;

const steps = [
  { number:"01", title:"Artist launches a campaign", description:"Uploads a song and chooses where they want it promoted.", icon:Megaphone },
  { number:"02", title:"DJs and matatus join", description:"They choose campaigns that fit their audience.", icon:Users },
  { number:"03", title:"Music gets played", description:"Participating DJs and matatus play the authorised campaign track.", icon:Play },
  { number:"04", title:"Sauti records results", description:"The artist sees campaign activity and participating partners earn.", icon:TrendingUp },
] as const;

export default function LandingPage() {
  return (
    <main className="min-h-screen overflow-hidden bg-background">
      <header className="relative z-50 border-b border-plum/8"><nav aria-label="Main navigation" className="mx-auto flex h-20 max-w-7xl items-center justify-between px-5 sm:px-8">
        <BrandMark className="text-[1.75rem]" />
        <div className="hidden items-center gap-3 text-sm font-medium text-muted-foreground md:flex"><Link href="#roles" className="rounded-full px-3 py-3 transition-colors hover:bg-lavender hover:text-plum">Find your place</Link><Link href="#how-it-works" className="rounded-full px-3 py-3 transition-colors hover:bg-lavender hover:text-plum">How it works</Link><Link href="#listeners" className="rounded-full px-3 py-3 transition-colors hover:bg-lavender hover:text-plum">For listeners</Link></div>
        <Button asChild className="h-11 rounded-full px-5"><Link href="/signup">Join Sauti <ArrowRight /></Link></Button>
      </nav></header>

      <section className="relative mx-auto grid min-h-[calc(100svh-80px)] max-w-7xl items-center gap-10 px-5 py-14 sm:px-8 sm:py-20 lg:grid-cols-[.96fr_1.04fr] lg:py-16">
        <div className="relative z-10 max-w-2xl">
          <p className="mb-6 flex items-center gap-2 text-sm font-medium text-primary"><AudioLines className="size-4" /> Music moves here</p>
          <h1 className="text-balance text-6xl font-medium leading-[.94] tracking-[-.06em] text-ink sm:text-7xl lg:text-[6.5rem]">Hear Kenya<span className="text-primary">.</span></h1>
          <p className="mt-7 max-w-xl text-balance text-xl leading-8 text-foreground sm:text-2xl">Discover what&apos;s playing. Get your music heard.</p>
          <p className="mt-4 max-w-lg leading-7 text-muted-foreground">Artists promote music. DJs and matatus play it. Everyone sees the results.</p>
          <div className="mt-9 flex flex-col gap-3 sm:flex-row"><Button asChild size="lg" className="h-14 rounded-full px-8 text-base"><Link href="/signup">Join Sauti <ArrowRight /></Link></Button><Button asChild size="lg" variant="outline" className="h-14 rounded-full bg-transparent px-8 text-base"><Link href="#how-it-works">See How It Works <ArrowDown /></Link></Button></div>
        </div>

        <div className="relative mx-auto w-full max-w-[620px] py-8 lg:py-0" aria-label="A preview of music moving through Sauti">
          <div className="relative mx-auto w-[82%] rotate-[-2deg] rounded-[2.3rem] bg-plum p-4 shadow-2xl shadow-plum/20 transition-transform duration-500 hover:rotate-0 sm:w-[72%] sm:p-5"><div className="rounded-[1.75rem] bg-[#302038] p-5 text-white sm:p-6">
            <div className="flex items-center justify-between text-xs text-white/55"><span className="flex items-center gap-2"><span className="size-2 animate-pulse rounded-full bg-lime" /> Playing near you</span><MapPin className="size-4" /></div>
            <Artwork item={music[0]} className="mx-auto mt-6 w-[76%] shadow-xl" />
            <div className="mt-6 flex items-end justify-between gap-4"><div><h2 className="text-xl font-medium sm:text-2xl">Extra Pressure</h2><p className="mt-1 text-sm text-white/55">Bensoul · Westlands</p></div><button aria-label="Play Extra Pressure" className="pressable grid size-12 shrink-0 place-items-center rounded-full bg-coral"><Play className="size-5 fill-current" /></button></div>
            <div className="mt-5 flex items-center gap-3 border-t border-white/10 pt-4 text-xs text-white/60"><Heart className="size-4" /><span>Saved by 284 listeners today</span></div>
          </div></div>
          <div className="surface-hover absolute -left-1 top-[24%] w-44 rounded-2xl bg-white p-4 shadow-xl shadow-plum/10 sm:-left-8 sm:w-52"><div className="flex items-center justify-between"><span className="grid size-9 place-items-center rounded-full bg-lavender text-plum"><Megaphone className="size-4" /></span><BadgeCheck className="size-4 text-coral" /></div><p className="mt-4 text-xs text-muted-foreground">Artist campaign</p><p className="mt-1 font-medium text-plum">Nairobi Nights</p><div className="mt-3 h-1.5 overflow-hidden rounded-full bg-muted"><div className="h-full w-3/4 rounded-full bg-coral" /></div></div>
          <div className="surface-hover absolute -right-2 top-[12%] flex items-center gap-3 rounded-full bg-lime px-4 py-3 text-plum shadow-lg sm:-right-5"><span className="grid size-9 place-items-center rounded-full bg-plum text-white"><Radio className="size-4" /></span><span className="pr-2 text-sm font-semibold">DJ Mura is live</span></div>
          <div className="surface-hover absolute -bottom-1 right-0 flex items-center gap-3 rounded-2xl bg-coral px-4 py-3 text-white shadow-lg sm:right-5"><BusFront className="size-5" /><div><p className="text-xs text-white/65">Now on route</p><p className="text-sm font-semibold">CBD → Umoja</p></div></div>
        </div>
      </section>

      <section className="border-y border-plum/10 bg-lavender/55 px-5 py-7 sm:px-8"><p className="mx-auto max-w-5xl text-center text-lg font-medium leading-8 text-plum sm:text-xl">Artists promote music. DJs and matatus play it. <span className="text-coral">Sauti tracks the campaign</span> and everyone sees the results.</p></section>

      <section id="roles" className="scroll-mt-10 px-5 py-24 sm:px-8 sm:py-32"><div className="mx-auto max-w-7xl">
        <p className="text-sm font-medium text-coral">Pick your side of the sound</p><div className="mt-3 flex flex-col justify-between gap-5 sm:flex-row sm:items-end"><h2 className="max-w-3xl text-balance text-4xl font-medium tracking-[-.045em] text-plum sm:text-6xl">What brings you to Sauti?</h2><p className="max-w-sm text-muted-foreground">However you meet the music, there&apos;s a place for you here.</p></div>
        <div className="mt-12 grid gap-4 md:grid-cols-2">{roles.map(({ href, eyebrow, title, description, cta, icon: Icon, tone, accent }) => <Link key={title} href={href} className={`group relative flex min-h-80 flex-col overflow-hidden rounded-[2rem] p-7 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-plum/10 sm:p-9 ${tone}`}><div className="flex items-start justify-between"><span className="text-xs font-medium uppercase tracking-[.16em] opacity-55">{eyebrow}</span><span className={`grid size-12 place-items-center rounded-full transition-transform duration-300 group-hover:rotate-6 group-hover:scale-110 ${accent}`}><Icon className="size-5" /></span></div><div className="mt-auto"><h3 className="text-3xl font-medium tracking-tight">{title}</h3><p className="mt-3 max-w-md leading-7 opacity-70">{description}</p><p className="mt-7 flex items-center gap-2 text-sm font-semibold">{cta}<ArrowRight className="size-4 transition-transform group-hover:translate-x-1" /></p></div><Disc3 className="absolute -bottom-20 -right-16 size-52 opacity-[.06] transition-transform duration-700 group-hover:rotate-45" /></Link>)}</div>
      </div></section>

      <section id="how-it-works" className="scroll-mt-10 bg-plum px-5 py-24 text-white sm:px-8 sm:py-32"><div className="mx-auto max-w-7xl">
        <p className="text-sm font-medium text-coral">One song. A real journey.</p><h2 className="mt-3 max-w-3xl text-balance text-4xl font-medium tracking-[-.045em] sm:text-6xl">How Sauti works.</h2>
        <div className="relative mt-14 grid gap-4 lg:grid-cols-4">{steps.map(({ number, title, description, icon: Icon }, index) => <article key={number} className="relative rounded-3xl border border-white/12 p-6 transition-colors hover:bg-white/5 sm:p-7"><div className="flex items-center justify-between"><span className="font-mono text-xs text-white/40">{number}</span><Icon className="size-5 text-coral" /></div><h3 className="mt-16 text-xl font-medium">{title}</h3><p className="mt-3 text-sm leading-6 text-white/55">{description}</p>{index < steps.length - 1 ? <ChevronRight className="absolute -right-4 top-1/2 z-10 hidden size-7 -translate-y-1/2 rounded-full bg-coral p-1 text-white lg:block" /> : null}</article>)}</div>
      </div></section>

      <section id="listeners" className="scroll-mt-10 px-5 py-24 sm:px-8 sm:py-32"><div className="mx-auto grid max-w-7xl gap-14 lg:grid-cols-[.9fr_1.1fr] lg:items-center">
        <div><p className="text-sm font-medium text-coral">Made for music fans too</p><h2 className="mt-3 text-balance text-4xl font-medium tracking-[-.045em] text-plum sm:text-6xl">Why use Sauti if I&apos;m just a music fan?</h2><p className="mt-6 max-w-lg text-lg leading-8 text-muted-foreground">Because the best songs often find you when you&apos;re out living. Sauti helps you remember them and follow where the sound is moving.</p><Button asChild variant="outline" className="mt-8 h-12 rounded-full px-6"><Link href="/listener">Explore as Listener <ArrowRight /></Link></Button></div>
        <div className="grid gap-4 sm:grid-cols-2"><article className="rounded-[2rem] bg-white p-7 sm:min-h-72"><span className="grid size-12 place-items-center rounded-full bg-coral text-white"><Heart className="size-5" /></span><h3 className="mt-16 text-2xl font-medium text-plum">Never lose a song again</h3><p className="mt-3 leading-7 text-muted-foreground">Keep a record of music you discover through Sauti experiences.</p></article><article className="rounded-[2rem] bg-lavender p-7 sm:min-h-72"><span className="grid size-12 place-items-center rounded-full bg-lime text-plum"><TrendingUp className="size-5" /></span><h3 className="mt-16 text-2xl font-medium text-plum">Know what&apos;s hot around you</h3><p className="mt-3 leading-7 text-muted-foreground">See music trends by city, route, DJ and participating music spaces.</p></article><article className="rounded-[2rem] bg-plum p-7 text-white sm:col-span-2"><div className="flex flex-col justify-between gap-12 sm:flex-row sm:items-end"><div><span className="grid size-12 place-items-center rounded-full bg-coral"><Music2 className="size-5" /></span><h3 className="mt-8 text-2xl font-medium">Get closer to the people shaping the sound</h3><p className="mt-3 max-w-xl leading-7 text-white/60">Follow artists, discover DJs and find the matatus turning every route into a moving stage.</p></div><div className="flex -space-x-3" aria-label="Sauti community"><span className="grid size-12 place-items-center rounded-full border-2 border-plum bg-coral text-xs font-semibold">KA</span><span className="grid size-12 place-items-center rounded-full border-2 border-plum bg-lime text-xs font-semibold text-plum">DM</span><span className="grid size-12 place-items-center rounded-full border-2 border-plum bg-lavender text-xs font-semibold text-plum">254</span></div></div></article></div>
      </div></section>

      <section className="px-5 pb-8 sm:px-8"><div className="relative mx-auto max-w-7xl overflow-hidden rounded-[2.5rem] bg-coral px-6 py-16 text-center text-white sm:px-10 sm:py-24"><Sparkles className="mx-auto size-7" /><h2 className="mx-auto mt-5 max-w-3xl text-balance text-4xl font-medium tracking-[-.045em] sm:text-6xl">Kenya is playing.<br />Come hear it.</h2><p className="mx-auto mt-5 max-w-xl text-white/75">Discover what&apos;s around you, move your music further, or earn while you play.</p><Button asChild size="lg" variant="secondary" className="mt-9 h-14 rounded-full bg-white px-8 text-base text-plum hover:bg-white/90"><Link href="/signup">Join Sauti <ArrowRight /></Link></Button><Disc3 className="absolute -bottom-40 -left-24 size-96 opacity-10" /><Disc3 className="absolute -right-20 -top-32 size-80 opacity-10" /></div></section>

      <footer className="px-5 py-10 sm:px-8"><div className="mx-auto flex max-w-7xl flex-col gap-6 border-t pt-8 sm:flex-row sm:items-center sm:justify-between"><BrandMark /><p className="text-sm text-muted-foreground">Discover. Promote. Play. Be heard.</p><p className="flex items-center gap-2 text-sm text-muted-foreground"><Check className="size-4 text-coral" /> Made for Kenya&apos;s sound</p></div></footer>
    </main>
  );
}
