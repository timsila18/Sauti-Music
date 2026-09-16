"use client";
import Link from "next/link";
import { useEffect, useState, useTransition } from "react";
import { Disc3, Download, Play, Radio, Wallet } from "lucide-react";
import { AppShell } from "@/components/app-shell";
import { Button } from "@/components/ui/button";
import type {
  CampaignParticipationRow,
  CampaignRow,
  DjProfileRow,
  DjSetRow,
} from "@/lib/supabase/database.types";
import {
  createSet,
  decideDjCampaign,
  endSet,
  getTrackAccess,
  logTrack,
} from "@/app/dj/actions";
import { kenyaDate } from "@/lib/time";
const action = {
  role: "dj" as const,
  label: "Start Set",
  supportingText: "Start My Set",
};
export function DjShell({ children }: { children: React.ReactNode }) {
  return (
    <AppShell role="dj" action={action}>
      {children}
    </AppShell>
  );
}
export function Home({
  dj,
  campaigns,
  sets,
}: {
  dj: DjProfileRow;
  campaigns: CampaignRow[];
  sets: DjSetRow[];
}) {
  return (
    <DjShell>
      <header className="flex flex-wrap items-end justify-between gap-5">
        <div><p className="text-sm font-medium text-muted-foreground">
          Good evening, {dj.stage_name}
        </p>
        <h1 className="mt-2 text-4xl font-semibold tracking-[-.045em]">
          Ready for your next set?
        </h1></div>
        <Button asChild size="lg" className="rounded-full px-6 shadow-lg shadow-primary/20">
          <Link href="/dj/sets/new">
            <Radio />
            Start Set
          </Link>
        </Button>
      </header>
      <section className="app-panel relative mt-8 overflow-hidden bg-ink p-6 text-white sm:p-8">
        <div className="relative z-10 grid gap-7 sm:grid-cols-[1fr_auto] sm:items-end"><div><p className="eyebrow text-lime">This week</p><p className="mt-3 text-4xl font-semibold tracking-[-.05em]">KSh 105</p><p className="mt-1 text-sm text-white/50">Campaign earnings</p></div><div className="wave-bars text-primary" aria-hidden="true">{Array.from({length:18},(_,i)=><span key={i} style={{height:`${24+(i*17)%68}%`}} />)}</div></div>
        <div className="relative z-10 mt-6 flex gap-10 border-t border-white/10 pt-5">
          <div>
            <p className="text-2xl font-semibold">KSh 105</p>
            <p className="mt-1 text-sm text-muted-foreground">Earned</p>
          </div>
          <div>
            <p className="text-2xl font-semibold">{sets.length}</p>
            <p className="mt-1 text-sm text-muted-foreground">Sets</p>
          </div>
        </div>
      </section>
      <Campaigns campaigns={campaigns} />
    </DjShell>
  );
}
export function Campaigns({ campaigns }: { campaigns: CampaignRow[] }) {
  return (
    <section className="mt-12">
      <h2 className="text-2xl font-medium text-plum">Available Campaigns</h2>
      <div className="mt-4 grid gap-4 lg:grid-cols-2">
        {campaigns.map((c) => (
          <Link
            key={c.id}
            href={`/dj/campaigns/${c.id}`}
            className="rounded-3xl bg-card p-6"
          >
            <Disc3 className="text-coral" />
            <h3 className="mt-6 text-2xl font-medium">{c.campaign_name}</h3>
            <p className="mt-2 text-muted-foreground">
              Nairobi · KSh 50 per qualified activity
            </p>
          </Link>
        ))}
      </div>
    </section>
  );
}
export function Campaign({
  campaign,
  part,
}: {
  campaign: CampaignRow;
  part?: CampaignParticipationRow;
}) {
  const [, start] = useTransition();
  const joined = part && ["ACCEPTED", "ACTIVE"].includes(part.status);
  return (
    <DjShell>
      <p className="text-coral">DJ Campaign</p>
      <h1 className="mt-2 text-4xl font-medium">{campaign.campaign_name}</h1>
      <div className="mt-7 rounded-3xl bg-card p-6">
        <p>
          {campaign.start_date} — {campaign.end_date}
        </p>
        <p className="mt-3 text-muted-foreground">
          Nairobi · authorised campaign track
        </p>
      </div>
      {joined ? (
        <div className="mt-7 rounded-3xl bg-lavender p-6">
          <h2 className="text-2xl font-medium">My Campaign Track</h2>
          <p className="mt-2 text-sm">
            Use only as authorised by the campaign terms. Links expire after
            five minutes.
          </p>
          <div className="mt-5 flex gap-2">
            <Button
              onClick={() =>
                start(async () => {
                  const r = await getTrackAccess(campaign.id, false);
                  if (r.url) location.href = r.url;
                })
              }
            >
              <Play />
              Preview
            </Button>
            <Button
              variant="outline"
              onClick={() =>
                start(async () => {
                  const r = await getTrackAccess(campaign.id, true);
                  if (r.url) location.href = r.url;
                })
              }
            >
              <Download />
              Download
            </Button>
          </div>
        </div>
      ) : (
        <div className="mt-7 flex gap-2">
          <Button
            onClick={() =>
              start(async () => {
                await decideDjCampaign(campaign.id, true);
                location.reload();
              })
            }
          >
            Join Campaign
          </Button>
          <Button
            variant="outline"
            onClick={() =>
              start(async () => {
                await decideDjCampaign(campaign.id, false);
              })
            }
          >
            Not Interested
          </Button>
        </div>
      )}
    </DjShell>
  );
}
export function NewSet() {
  return (
    <DjShell>
      <h1 className="text-4xl font-medium">Start My Set</h1>
      <form
        action={createSet}
        className="mt-7 grid gap-4 rounded-3xl bg-card p-6"
      >
        <input
          name="name"
          placeholder="Set name (optional)"
          className="h-12 rounded-xl border px-4"
        />
        <input
          name="venue"
          required
          placeholder="Venue / event"
          className="h-12 rounded-xl border px-4"
        />
        <input
          name="area"
          placeholder="Town / area"
          className="h-12 rounded-xl border px-4"
        />
        <label className="flex gap-3">
          <input name="private" type="checkbox" />
          This is a private event
        </label>
        <Button>Start Set</Button>
        <p className="text-xs text-muted-foreground">
          No microphone, background listener or DJ-software integration is
          active.
        </p>
      </form>
    </DjShell>
  );
}
export function SetView({
  set,
  campaigns,
}: {
  set: DjSetRow;
  campaigns: CampaignRow[];
}) {
  const [, start] = useTransition();
  return (
    <DjShell>
      <section className="relative overflow-hidden rounded-[1.75rem] bg-[#101017] p-6 text-white shadow-2xl shadow-black/15 sm:p-9">
        <div className="flex items-center gap-2 text-sm font-medium text-lime">
          <span
            className={`size-2 rounded-full ${set.status === "ACTIVE" ? "animate-pulse bg-lime" : "bg-white/40"}`}
          />
          {set.status === "ACTIVE" ? "LIVE SET" : "SET COMPLETE"}
        </div>
        <h1 className="mt-4 text-3xl font-medium sm:text-4xl">
          {set.name || set.venue_name}
        </h1>
        <p className="mt-2 text-white/55">
          {set.venue_name} · {set.town_area}
        </p>
        {set.status === "ACTIVE" ? (
          <ActiveElapsed startedAt={set.started_at} />
        ) : null}
        <div className="wave-bars mt-7 text-primary" aria-hidden="true">{Array.from({length:34},(_,i)=><span key={i} style={{height:`${20+(i*23)%76}%`}} />)}</div>
        <div className="mt-8 border-t border-white/10 pt-7">
          <h2 className="text-xl">Campaign tracks</h2>
          <div className="mt-4 grid gap-3">
            {campaigns.map((c) => (
              <div
                key={c.id}
                className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-white/5 bg-white/8 p-4 transition hover:bg-white/12"
              >
                <span className="font-medium">{c.campaign_name}</span>
                <Button
                  size="sm"
                  onClick={() =>
                    start(async () => {
                      await logTrack(set.id, c.id);
                      location.reload();
                    })
                  }
                >
                  Mark as Played
                </Button>
              </div>
            ))}
          </div>
          <p className="mt-5 text-xs text-white/50">
            Manual plays stay pending review and do not earn automatically.
          </p>
        </div>
      </section>
      {set.status === "ACTIVE" ? (
        <Button
          className="mt-6 w-full sm:w-auto"
          variant="destructive"
          onClick={() =>
            start(async () => {
              await endSet(set.id);
              location.reload();
            })
          }
        >
          End and save set
        </Button>
      ) : (
        <p role="status" className="mt-6 rounded-2xl bg-lime/30 p-5 text-plum">
          Set saved ✓
        </p>
      )}
    </DjShell>
  );
}
function ActiveElapsed({ startedAt }: { startedAt: string }) {
  const [seconds, setSeconds] = useState(() =>
    Math.max(
      0,
      Math.floor((Date.now() - new Date(startedAt).getTime()) / 1000),
    ),
  );
  useEffect(() => {
    const timer = setInterval(
      () =>
        setSeconds(
          Math.max(
            0,
            Math.floor((Date.now() - new Date(startedAt).getTime()) / 1000),
          ),
        ),
      1000,
    );
    return () => clearInterval(timer);
  }, [startedAt]);
  const hours = Math.floor(seconds / 3600),
    minutes = Math.floor((seconds % 3600) / 60),
    secs = seconds % 60;
  return (
    <div className="mt-8">
      <p className="text-xs uppercase tracking-[.16em] text-white/45">
        Elapsed
      </p>
      <p className="mt-1 font-mono text-4xl tabular-nums sm:text-5xl">
        {hours ? `${String(hours).padStart(2, "0")}:` : ""}
        {String(minutes).padStart(2, "0")}:{String(secs).padStart(2, "0")}
      </p>
    </div>
  );
}
export function Sets({ sets }: { sets: DjSetRow[] }) {
  return (
    <DjShell>
      <h1 className="text-4xl font-medium">Set History</h1>
      <div className="mt-6 grid gap-3">
        {sets.map((s) => (
          <Link
            key={s.id}
            href={`/dj/sets/${s.id}`}
            className="rounded-2xl bg-card p-5"
          >
            <b>{s.name || s.venue_name}</b>
            <p className="text-sm text-muted-foreground">
              {s.status} · {kenyaDate(s.started_at)}
            </p>
          </Link>
        ))}
      </div>
    </DjShell>
  );
}
export function Earnings() {
  return (
    <DjShell>
      <h1 className="text-4xl font-medium">Earnings</h1>
      <section className="mt-8">
        <p className="text-sm text-muted-foreground">Available</p>
        <p className="mt-2 text-5xl font-medium">KSh 105</p>
        <p className="mt-5 text-sm text-muted-foreground">
          Pending{" "}
          <span className="ml-2 font-medium text-foreground">KSh 0</span>
        </p>
        <Button
          className="mt-7"
          onClick={() => alert("M-Pesa withdrawals are coming soon")}
        >
          <Wallet />
          Withdraw
        </Button>
      </section>
    </DjShell>
  );
}
export function Profile({ dj }: { dj: DjProfileRow }) {
  return (
    <DjShell>
      <h1 className="text-4xl font-medium">{dj.stage_name}</h1>
      <p className="mt-2 text-muted-foreground">
        {dj.music_genres.join(" · ")} · {dj.town_area}
      </p>
      <p className="mt-6">{dj.bio}</p>
      <Button asChild className="mt-6">
        <Link href={`/dj/${dj.handle}`}>View Public Profile</Link>
      </Button>
      <p className="mt-8 rounded-2xl bg-lavender p-5">
        Tastemaker insights coming later.
      </p>
    </DjShell>
  );
}
