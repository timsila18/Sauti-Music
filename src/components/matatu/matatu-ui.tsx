"use client";
import Link from "next/link";
import { useEffect, useState, useTransition } from "react";
import { BusFront, Music2, Pause, Play, Route, Wallet } from "lucide-react";
import { Button } from "@/components/ui/button";
import { AppShell } from "@/components/app-shell";
import {
  decideCampaign,
  finishPlayback,
  startPlayback,
  updateRequest,
} from "@/app/matatu/actions";
import type {
  CampaignParticipationRow,
  CampaignRow,
  MatatuRow,
  PlayEventRow,
  SongRequestRow,
} from "@/lib/supabase/database.types";
import { kenyaDateTime } from "@/lib/time";
const action = {
  role: "matatu" as const,
  label: "Play & Earn",
  supportingText: "Open available campaigns",
};
export function MatatuShell({ children }: { children: React.ReactNode }) {
  return (
    <AppShell role="matatu" action={action}>
      {children}
    </AppShell>
  );
}
export function Home({
  matatu,
  campaigns,
  plays,
}: {
  matatu: MatatuRow;
  campaigns: CampaignRow[];
  plays: PlayEventRow[];
}) {
  const qualified = plays.filter(
    (x) => x.qualification_status === "QUALIFIED",
  ).length;
  return (
    <MatatuShell>
      <header>
        <div className="flex items-center gap-3">
          <div className="grid size-11 place-items-center rounded-2xl bg-secondary text-primary">
            <BusFront />
          </div>
          <div>
            <h1 className="text-3xl font-medium">{matatu.display_name}</h1>
            <p className="text-sm text-muted-foreground">{matatu.main_route}</p>
          </div>
        </div>
      </header>
      <section className="mt-10">
        <p className="text-sm text-muted-foreground">Today</p>
        <p className="mt-2 text-5xl font-medium">KSh 70</p>
        <p className="mt-2 text-muted-foreground">
          {qualified} qualified {qualified === 1 ? "play" : "plays"}
        </p>
        <Button asChild size="lg" className="mt-7">
          <Link href="/matatu/campaigns">
            <Play />
            Play & Earn
          </Link>
        </Button>
      </section>
      <CampaignCards campaigns={campaigns.slice(0, 3)} />
    </MatatuShell>
  );
}
export function CampaignCards({ campaigns }: { campaigns: CampaignRow[] }) {
  return (
    <section className="mt-12">
      <h2 className="text-2xl font-medium text-plum">Available Campaigns</h2>
      {campaigns.length ? (
        <div className="mt-4 grid gap-4 lg:grid-cols-2">
          {campaigns.map((c) => (
            <Link
              key={c.id}
              href={`/matatu/campaigns/${c.id}`}
              className="surface-hover rounded-3xl bg-card p-6"
            >
              <span className="rounded-full bg-lime px-3 py-1 text-xs text-plum">
                Active
              </span>
              <h3 className="mt-5 text-2xl font-medium">{c.campaign_name}</h3>
              <p className="mt-2 text-muted-foreground">
                Nairobi · KSh 40 per qualified play
              </p>
              <p className="mt-5 text-sm">
                Play at least 80% · cooldown and daily limit apply
              </p>
            </Link>
          ))}
        </div>
      ) : (
        <p className="mt-4 rounded-3xl border border-dashed p-8 text-center">
          No music campaigns match your matatu right now. Check again later.
        </p>
      )}
    </section>
  );
}
export function CampaignDetail({
  campaign,
  participation,
}: {
  campaign: CampaignRow;
  participation?: CampaignParticipationRow;
}) {
  const [pending, start] = useTransition();
  return (
    <MatatuShell>
      <p className="text-sm text-coral">Playing for Campaign</p>
      <h1 className="mt-2 text-4xl font-medium text-plum">
        {campaign.campaign_name}
      </h1>
      <div className="mt-7 rounded-3xl bg-card p-6">
        <p>
          {campaign.start_date} — {campaign.end_date}
        </p>
        <p className="mt-3 text-muted-foreground">
          Nairobi · Your route matches this campaign.
        </p>
        <div className="mt-6 grid grid-cols-2 gap-3">
          <Info l="Reward" v="KSh 40" />
          <Info l="Qualification" v="80% minimum" />
        </div>
      </div>
      {participation &&
      ["ACCEPTED", "ACTIVE"].includes(participation.status) ? (
        <Player participation={participation} />
      ) : (
        <div className="mt-7 flex gap-3">
          <Button
            disabled={pending}
            onClick={() =>
              start(async () => {
                const r = await decideCampaign(campaign.id, true);
                if (r.participationId) location.reload();
              })
            }
          >
            Join Campaign
          </Button>
          <Button
            variant="outline"
            disabled={pending}
            onClick={() =>
              start(async () => {
                await decideCampaign(campaign.id, false);
              })
            }
          >
            Not Interested
          </Button>
        </div>
      )}
    </MatatuShell>
  );
}
function Player({
  participation,
}: {
  participation: CampaignParticipationRow;
}) {
  const [session, setSession] = useState<string>(),
    [seconds, setSeconds] = useState(0),
    [playing, setPlaying] = useState(false),
    [result, setResult] = useState<{
      qualificationStatus?: string;
      reward?: number;
      pending?: boolean;
    }>();
  const [pending, start] = useTransition();
  useEffect(() => {
    if (!playing) return;
    const t = setInterval(() => setSeconds((v) => v + 1), 1000);
    return () => clearInterval(t);
  }, [playing]);
  const progress = Math.min(100, Math.round((seconds / 60) * 100));
  const begin = () =>
    start(async () => {
      const r = await startPlayback(participation.id);
      if (r.sessionId) {
        setSession(r.sessionId);
        setSeconds(0);
        setResult(undefined);
        setPlaying(true);
      }
    });
  const finish = () =>
    session &&
    start(async () => {
      setPlaying(false);
      const r = await finishPlayback(session, seconds);
      if (r.result && typeof r.result === "object" && !Array.isArray(r.result))
        setResult(
          r.result as {
            qualificationStatus?: string;
            reward?: number;
            pending?: boolean;
          },
        );
    });
  return (
    <section className="mt-8 overflow-hidden rounded-[2rem] bg-plum p-6 text-white sm:p-8">
      <div className="mx-auto max-w-md text-center">
        <p className="text-sm font-medium text-lime">Sauti Campaign Player</p>
        <div className="mx-auto mt-6 grid aspect-square w-44 place-items-center rounded-3xl bg-gradient-to-br from-coral to-lavender text-plum shadow-2xl shadow-black/20">
          <Music2 className="size-16" />
        </div>
        <button
          disabled={pending}
          aria-label={
            playing ? "Stop campaign playback" : "Start campaign playback"
          }
          className={`pressable mx-auto mt-6 grid size-20 place-items-center rounded-full bg-coral shadow-lg shadow-coral/25 ${playing ? "ring-4 ring-lime/40" : ""}`}
          onClick={playing ? finish : begin}
        >
          {playing ? (
            <Pause className="size-8 fill-current" />
          ) : (
            <Play className="ml-1 size-8 fill-current" />
          )}
        </button>
        <div className="mt-7 flex items-end justify-between gap-3 text-left">
          <div>
            <p className="text-xs uppercase tracking-wider text-white/50">
              Playback
            </p>
            <p className="mt-1 text-xl font-medium">{seconds}s played</p>
          </div>
          <div className="text-right">
            <p className="text-xs uppercase tracking-wider text-white/50">
              Qualification
            </p>
            <p className="mt-1 text-xl font-medium">{progress}%</p>
          </div>
        </div>
        <div className="mt-3 h-2 overflow-hidden rounded-full bg-white/15">
          <div
            className="h-full rounded-full bg-lime transition-[width] duration-500"
            style={{ width: `${progress}%` }}
          />
        </div>
        <p className="mt-3 text-sm text-white/60">
          Play at least 80% and 60 seconds. Keep this screen open.
        </p>
        <p className="mt-2 text-xs text-white/40">
          Listening is inactive until you press play. Sauti does not use your
          microphone.
        </p>
        {result ? (
          <div
            role="status"
            className={`mt-6 rounded-2xl p-5 text-left ${result.qualificationStatus === "QUALIFIED" ? "bg-lime text-plum" : "bg-white/10"}`}
          >
            <p className="text-lg font-medium">
              {result.qualificationStatus === "QUALIFIED"
                ? "Qualified Play ✓"
                : result.qualificationStatus === "REVIEW_REQUIRED"
                  ? "Pending Review"
                  : "Not Qualified"}
            </p>
            <p className="mt-1 text-sm opacity-75">
              {result.qualificationStatus === "QUALIFIED"
                ? `KSh ${result.reward ?? 40} pending review before it becomes available.`
                : "This activity did not meet the campaign requirement."}
            </p>
          </div>
        ) : null}
      </div>
    </section>
  );
}
export function Earnings() {
  return (
    <MatatuShell>
      <Header title="Earnings" />
      <section className="mt-8">
        <p className="text-sm text-muted-foreground">Available</p>
        <p className="mt-2 text-5xl font-medium">KSh 175</p>
        <p className="mt-5 text-sm text-muted-foreground">
          Pending{" "}
          <span className="ml-2 font-medium text-foreground">KSh 0</span>
        </p>
        <Button
          className="mt-7"
          onClick={() =>
            alert(
              "Withdrawals are coming soon. M-Pesa payouts will be added before public launch.",
            )
          }
        >
          <Wallet />
          Withdraw
        </Button>
      </section>
      <section className="mt-12">
        <h2 className="text-2xl font-medium">Recent</h2>
        <p className="mt-4 text-sm text-muted-foreground">
          Qualified play earnings will appear here.
        </p>
      </section>
    </MatatuShell>
  );
}
export function Plays({ plays }: { plays: PlayEventRow[] }) {
  return (
    <MatatuShell>
      <Header title="Play History" />
      <div className="mt-6 grid gap-3">
        {plays.map((p) => (
          <div key={p.id} className="rounded-2xl bg-card p-5">
            <b>{p.qualification_status.replaceAll("_", " ")}</b>
            <p className="mt-1 text-sm text-muted-foreground">
              {kenyaDateTime(p.started_at)} ·{" "}
              {p.duration_seconds ?? 0}s played
            </p>
          </div>
        ))}
        {!plays.length ? <p>Your campaign plays will appear here.</p> : null}
      </div>
    </MatatuShell>
  );
}
export function Requests({ requests }: { requests: SongRequestRow[] }) {
  return (
    <MatatuShell>
      <Header title="Passenger Requests" />
      <div className="mt-6 grid gap-3">
        {requests.map((r) => (
          <div key={r.id} className="rounded-2xl bg-card p-5">
            <b>Song request</b>
            <p className="text-sm text-muted-foreground">
              {r.status} · No earnings attached
            </p>
            <div className="mt-4 flex gap-2">
              {(["SEEN", "PLAYED", "DECLINED"] as const).map((s) => (
                <Button
                  key={s}
                  size="sm"
                  variant="outline"
                  onClick={() => updateRequest(r.id, s)}
                >
                  {s}
                </Button>
              ))}
            </div>
          </div>
        ))}
      </div>
    </MatatuShell>
  );
}
export function Profile({ matatu }: { matatu: MatatuRow }) {
  return (
    <MatatuShell>
      <Header title={matatu.display_name} />
      <div className="mt-7 rounded-3xl bg-card p-7">
        <p>
          {matatu.main_route} · {matatu.sacco_name}
        </p>
        <p className="mt-3 text-muted-foreground">
          {matatu.town_area}, {matatu.county} · Public music identity. Private
          vehicle identifiers are never shown.
        </p>
        <Button asChild className="mt-6">
          <Link href={`/matatu/${matatu.handle}`}>View Public Profile</Link>
        </Button>
      </div>
      <div className="mt-6 rounded-3xl bg-lavender p-6">
        <Route />
        <h2 className="mt-5 text-2xl font-medium">Start Trip</h2>
        <p className="mt-2 text-muted-foreground">
          Trip sessions are ready for future integrations. GPS and TripLink are
          not active.
        </p>
        <Button disabled className="mt-5">
          Start Trip · coming next
        </Button>
      </div>
    </MatatuShell>
  );
}
function Header({ title }: { title: string }) {
  return (
    <header>
      <p className="text-sm text-coral">Niaje 254</p>
      <h1 className="mt-1 text-4xl font-medium text-plum">{title}</h1>
    </header>
  );
}
function Info({ l, v }: { l: string; v: string }) {
  return (
    <div>
      <p className="text-xs opacity-60">{l}</p>
      <b>{v}</b>
    </div>
  );
}
