"use client";

import Link from "next/link";
import {
  startTransition,
  useEffect,
  useMemo,
  useState,
  useTransition,
} from "react";
import {
  ArrowRight,
  Bookmark,
  Check,
  Heart,
  MoreHorizontal,
  Pause,
  Play,
  Search,
  Share2,
  Trash2,
  UserPlus,
  Volume2,
  X,
} from "lucide-react";
import { toast } from "sonner";
import {
  addListeningHistory,
  clearListeningHistory,
  removeHistory,
  requestSong,
  toggleFollow,
  toggleSongLike,
  toggleSongSave,
} from "@/app/listener-actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  activityItems,
  chartViews,
  discoverySections,
  discoverySongs,
  publicProfiles,
  type DiscoverySong,
  type PublicProfile,
} from "@/lib/services/listener-discovery";
import { cn } from "@/lib/utils";

const tone = {
  coral: "from-coral to-[#ff9387]",
  plum: "from-plum to-[#62436e]",
  lime: "from-lime to-[#f1ffb7]",
  lavender: "from-lavender to-[#c7a9e5]",
};
export function Cover({
  song,
  className,
}: {
  song: DiscoverySong;
  className?: string;
}) {
  return (
    <div
      role="img"
      aria-label={`${song.title} artwork`}
      className={cn(
        "relative aspect-square overflow-hidden rounded-2xl bg-gradient-to-br p-3",
        tone[song.accent],
        className,
      )}
    >
      <span
        className={cn(
          "absolute -bottom-7 -right-6 size-24 rounded-full border-[14px]",
          song.accent === "plum" ? "border-white/15" : "border-plum/10",
        )}
      />
      <span
        className={cn(
          "absolute right-4 top-4 size-2 rounded-full",
          song.accent === "plum" ? "bg-lime" : "bg-plum",
        )}
      />
      <p
        className={cn(
          "absolute bottom-3 left-3 max-w-[80%] text-sm font-semibold leading-tight",
          song.accent === "plum" ? "text-white" : "text-plum",
        )}
      >
        {song.title}
      </p>
    </div>
  );
}

export function SongActions({
  song,
  compact = false,
}: {
  song: DiscoverySong;
  compact?: boolean;
}) {
  const [saved, setSaved] = useState(false);
  const [liked, setLiked] = useState(false);
  const [pending, start] = useTransition();
  return (
    <div className="flex items-center gap-1">
      <Button
        type="button"
        variant={saved ? "default" : "ghost"}
        size={compact ? "icon-sm" : "sm"}
        aria-label={
          saved ? `Remove ${song.title} from My Sauti` : `Save ${song.title}`
        }
        disabled={pending}
        onClick={() => {
          const was = saved;
          setSaved(!was);
          start(async () => {
            await toggleSongSave(song.id, was);
            toast(was ? "Removed from My Sauti" : "Saved to My Sauti");
          });
        }}
      >
        <Bookmark className={cn("size-4", saved && "fill-current")} />
        {compact ? null : saved ? "Saved" : "Save"}
      </Button>
      <Button
        type="button"
        variant="ghost"
        size={compact ? "icon-sm" : "sm"}
        aria-label={liked ? `Unlike ${song.title}` : `Like ${song.title}`}
        disabled={pending}
        onClick={() => {
          const was = liked;
          setLiked(!was);
          start(async () => {
            await toggleSongLike(song.id, was);
          });
        }}
      >
        <Heart className={cn("size-4", liked && "fill-coral text-coral")} />
        {compact ? null : "Like"}
      </Button>
    </div>
  );
}

export function SongTile({ song }: { song: DiscoverySong }) {
  return (
    <article className="min-w-36 snap-start sm:min-w-44">
      <Link href={`/song/${song.slug}`}>
        <Cover song={song} />
        <h3 className="mt-3 truncate font-medium text-plum">{song.title}</h3>
        <p className="truncate text-sm text-muted-foreground">{song.artist}</p>
      </Link>
      <div className="mt-2">
        <SongActions song={song} compact />
      </div>
    </article>
  );
}

export function SongRail({
  title,
  songs = discoverySongs,
}: {
  title: string;
  songs?: DiscoverySong[];
}) {
  return (
    <section className="mt-12">
      <div className="mb-5 flex items-end justify-between">
        <h2 className="text-2xl font-medium tracking-[-.03em] text-plum">
          {title}
        </h2>
        <Link href="/discover" className="text-sm font-medium text-coral">
          See all
        </Link>
      </div>
      <div className="-mx-5 flex snap-x gap-4 overflow-x-auto px-5 pb-3 sm:-mx-8 sm:px-8 lg:mx-0 lg:px-0">
        {songs.map((song) => (
          <SongTile key={song.id} song={song} />
        ))}
      </div>
    </section>
  );
}

export function ListeningSheet({ compact = false }: { compact?: boolean }) {
  const [state, setState] = useState<
    "ready" | "listening" | "detected" | "none" | "stopped"
  >("ready");
  const [open, setOpen] = useState(false);
  const [, start] = useTransition();
  useEffect(() => {
    if (state !== "listening") return;
    const id = setTimeout(() => setState("detected"), 2200);
    return () => clearTimeout(id);
  }, [state]);
  const song = discoverySongs[0];
  return (
    <Sheet
      open={open}
      onOpenChange={(value) => {
        setOpen(value);
        if (!value) setState("ready");
      }}
    >
      <SheetTrigger asChild>
        <button
          type="button"
          aria-label="Start Listening"
          className={cn(
            "pressable group flex items-center justify-center bg-primary text-white focus-visible:ring-2 focus-visible:ring-ring",
            compact
              ? "w-full gap-2 rounded-xl px-4 py-3 text-sm font-medium"
              : "mx-auto -mt-3 size-12 rounded-2xl",
          )}
        >
          <Volume2 className="size-6" />
          {compact ? (
            "Listen"
          ) : (
            <span className="sr-only">Start Listening</span>
          )}
        </button>
      </SheetTrigger>
      <SheetContent
        side="bottom"
        className="mx-auto max-h-[92svh] max-w-2xl overflow-y-auto rounded-t-[2rem] border-x p-6 sm:p-9"
      >
        <SheetHeader className="text-left">
          <p className="text-xs font-semibold uppercase tracking-[.18em] text-coral">
            Demo listening
          </p>
          <SheetTitle className="text-3xl text-plum">
            What&apos;s Playing?
          </SheetTitle>
          <SheetDescription>
            No microphone is active. This is a simulated recognition preview.
          </SheetDescription>
        </SheetHeader>
        <div className="grid min-h-80 place-items-center py-8 text-center">
          {state === "ready" && (
            <div>
              <PulseIcon />
              <h3 className="mt-7 text-2xl font-medium">Ready when you are.</h3>
              <p className="mt-2 text-muted-foreground">
                Tap below to try the demo listening flow.
              </p>
              <Button
                className="mt-7 rounded-full px-7"
                onClick={() => setState("listening")}
              >
                <Play className="fill-current" />
                Start Listening
              </Button>
            </div>
          )}
          {state === "listening" && (
            <div>
              <PulseIcon active />
              <h3 className="mt-7 text-2xl font-medium">
                Listening to the moment…
              </h3>
              <p className="mt-2 text-muted-foreground">
                Simulating a nearby song match.
              </p>
              <Button
                variant="outline"
                className="mt-7 rounded-full"
                onClick={() => setState("stopped")}
              >
                <Pause />
                Stop
              </Button>
            </div>
          )}
          {state === "detected" && (
            <div className="w-full">
              <Cover song={song} className="mx-auto w-44" />
              <p className="mt-5 text-xs font-semibold uppercase tracking-widest text-coral">
                Demo match
              </p>
              <h3 className="mt-2 text-3xl font-medium text-plum">
                {song.title}
              </h3>
              <p className="mt-1 text-muted-foreground">{song.artist}</p>
              <div className="mt-6 flex flex-wrap justify-center gap-2">
                <SongActions song={song} />
                <Button variant="outline" size="sm" asChild>
                  <Link href={`/artist/${song.artistHandle}`}>View Artist</Link>
                </Button>
              </div>
              <Button
                variant="ghost"
                className="mt-3"
                onClick={() =>
                  start(async () => {
                    await addListeningHistory(song.id);
                    toast("Added to Recently Heard");
                    setOpen(false);
                  })
                }
              >
                <Check />
                Keep this discovery
              </Button>
            </div>
          )}
          {state === "none" && (
            <div>
              <X className="mx-auto size-12 text-muted-foreground" />
              <h3 className="mt-5 text-2xl font-medium">
                We couldn&apos;t catch that one.
              </h3>
              <Button
                className="mt-6 rounded-full"
                onClick={() => setState("listening")}
              >
                Try again
              </Button>
            </div>
          )}
          {state === "stopped" && (
            <div>
              <Pause className="mx-auto size-12 text-muted-foreground" />
              <h3 className="mt-5 text-2xl font-medium">Listening stopped.</h3>
              <Button
                className="mt-6 rounded-full"
                onClick={() => setState("listening")}
              >
                Start again
              </Button>
            </div>
          )}
        </div>
        {state === "ready" ? (
          <button
            className="mx-auto block text-xs text-muted-foreground underline"
            onClick={() => setState("none")}
          >
            Preview no-song state
          </button>
        ) : null}
      </SheetContent>
    </Sheet>
  );
}
function PulseIcon({ active = false }: { active?: boolean }) {
  return (
    <div
      className={cn(
        "relative mx-auto grid size-20 place-items-center rounded-2xl bg-secondary text-primary",
        active && "animate-pulse",
      )}
    >
      <Volume2 className="size-9" />
      {active ? <span className="absolute inset-[-8px] rounded-[1.5rem] border border-primary/25" /> : null}
    </div>
  );
}

export function ListenerHome({
  name,
  area,
  history,
}: {
  name: string;
  area: string;
  history: {
    id: string;
    songId: string;
    heardAt: string;
    context: string | null;
  }[];
}) {
  const [view, setView] = useState<keyof typeof chartViews>("Near Me");
  return (
    <>
      <div className="flex items-end justify-between gap-4">
        <div>
        <p className="text-sm font-medium text-muted-foreground">
          Good afternoon, {name.split(" ")[0]}
        </p>
        <h1 className="mt-1 text-3xl font-semibold tracking-[-.045em] text-ink">What&apos;s playing?</h1>
        </div>
        <span className="hidden rounded-full bg-secondary px-3 py-1.5 text-xs font-medium text-primary sm:block">{area}</span>
      </div>
      <section className="app-panel relative mt-6 overflow-hidden p-6 text-center sm:p-8">
        <div className="absolute inset-x-0 top-0 h-1 bg-primary" />
        <div className="relative z-10 mx-auto max-w-lg">
          <div className="mx-auto flex w-fit items-end gap-1 text-primary" aria-hidden="true">{[18,32,46,28,52,38,22,42,30].map((height,index)=><span key={index} className="w-1 rounded-full bg-current" style={{height}} />)}</div>
          <h2 className="mt-5 text-2xl font-semibold tracking-[-.035em]">Tap Sauti to find out</h2>
          <p className="mt-2 text-sm text-muted-foreground">Identify music playing around you.</p>
          <div className="mx-auto mt-6 w-fit">
            <ListeningSheet compact />
          </div>
        </div>
        <span className="absolute -bottom-20 -right-16 size-52 rounded-full border-[32px] border-secondary" />
      </section>
      <section className="mt-12">
        <h2 className="text-2xl font-medium text-plum">Recently heard</h2>
        {history.length ? (
          <div className="app-panel mt-4 divide-y px-4">
            {history.map((item) => {
              const song =
                discoverySongs.find((x) => x.id === item.songId) ??
                discoverySongs[0];
              return (
                <div key={item.id} className="flex items-center gap-3 py-3">
                  <Cover song={song} className="size-14 shrink-0 rounded-xl" />
                  <Link href={`/song/${song.slug}`} className="min-w-0 flex-1">
                    <p className="truncate font-medium">{song.title}</p>
                    <p className="truncate text-sm text-muted-foreground">
                      {song.artist} · {item.context ?? "Sauti listening"}
                    </p>
                  </Link>
                  <SongActions song={song} compact />
                  <button
                    aria-label={`Remove ${song.title} from history`}
                    onClick={() =>
                      startTransition(() => removeHistory(item.id))
                    }
                  >
                    <Trash2 className="size-4 text-muted-foreground" />
                  </button>
                </div>
              );
            })}
          </div>
        ) : (
          <Empty
            title="Nothing heard yet"
            body="Songs you discover will appear here."
          />
        )}
      </section>
      <section className="mt-12">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <h2 className="text-2xl font-medium text-plum">Hot around you</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Public music activity · {area}
            </p>
          </div>
        </div>
        <Tabs
          value={view}
          onValueChange={(v) => setView(v as keyof typeof chartViews)}
          className="mt-5 overflow-x-auto"
        >
          <TabsList>
            {Object.keys(chartViews).map((key) => (
              <TabsTrigger key={key} value={key}>
                {key}
              </TabsTrigger>
            ))}
          </TabsList>
        </Tabs>
        <ol className="app-panel mt-4">
          {chartViews[view].map((song, index) => (
            <li
              key={song.id}
              className="flex items-center gap-4 border-b px-4 py-3 last:border-0"
            >
              <span className="w-5 text-center text-lg font-medium text-coral">
                {index + 1}
              </span>
              <Cover song={song} className="size-12 shrink-0 rounded-xl" />
              <Link href={`/song/${song.slug}`} className="min-w-0 flex-1">
                <p className="truncate font-medium">{song.title}</p>
                <p className="truncate text-sm text-muted-foreground">
                  {song.artist}
                </p>
              </Link>
              <ArrowRight className="size-4 text-muted-foreground" />
            </li>
          ))}
        </ol>
      </section>
      <SongRail title="Discover next" songs={discoverySongs.slice(1, 5)} />
      <ProfileRail />
    </>
  );
}

export function DiscoverView() {
  return (
    <>
      <header>
        <p className="text-sm font-medium text-coral">
          Find your next favourite
        </p>
        <h1 className="mt-1 text-4xl font-medium tracking-[-.04em] text-plum">
          Discover
        </h1>
      </header>
      <SearchExperience />
      {discoverySections.map((section) => (
        <SongRail
          key={section.title}
          title={section.title}
          songs={section.items}
        />
      ))}
    </>
  );
}
export function SearchExperience() {
  const [query, setQuery] = useState("");
  const [debounced, setDebounced] = useState("");
  useEffect(() => {
    const id = setTimeout(() => setDebounced(query.trim().toLowerCase()), 250);
    return () => clearTimeout(id);
  }, [query]);
  const groups = useMemo(
    () => ({
      Songs: discoverySongs.filter((x) =>
        `${x.title} ${x.artist} ${x.genre}`.toLowerCase().includes(debounced),
      ),
      Artists: publicProfiles.filter(
        (x) =>
          x.kind === "ARTIST" &&
          `${x.name} ${x.genres.join(" ")}`.toLowerCase().includes(debounced),
      ),
      DJs: publicProfiles.filter(
        (x) => x.kind === "DJ" && x.name.toLowerCase().includes(debounced),
      ),
      Matatus: publicProfiles.filter(
        (x) =>
          x.kind === "MATATU" &&
          `${x.name} ${x.subtitle}`.toLowerCase().includes(debounced),
      ),
    }),
    [debounced],
  );
  return (
    <section className="mt-7">
      <div className="relative">
        <Search className="absolute left-4 top-1/2 size-5 -translate-y-1/2 text-muted-foreground" />
        <Input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="h-14 rounded-2xl bg-card pl-12"
          placeholder="Search songs, artists, DJs and matatus"
          aria-label="Search Sauti"
        />
      </div>
      {debounced && (
        <div className="mt-3 rounded-3xl border bg-card p-5 shadow-xl">
          {Object.entries(groups).map(([label, results]) =>
            results.length ? (
              <div key={label} className="mb-5 last:mb-0">
                <h2 className="mb-2 text-xs font-semibold uppercase tracking-widest text-muted-foreground">
                  {label}
                </h2>
                {results.slice(0, 4).map((item) =>
                  "title" in item ? (
                    <Link
                      key={item.id}
                      href={`/song/${item.slug}`}
                      className="flex rounded-xl px-3 py-2 hover:bg-muted"
                    >
                      <span>
                        <b>{item.title}</b>
                        <small className="ml-2 text-muted-foreground">
                          {item.artist}
                        </small>
                      </span>
                    </Link>
                  ) : (
                    <Link
                      key={item.id}
                      href={`/${item.kind.toLowerCase()}/${item.handle}`}
                      className="flex rounded-xl px-3 py-2 hover:bg-muted"
                    >
                      <b>{item.name}</b>
                    </Link>
                  ),
                )}
              </div>
            ) : null,
          )}
          {Object.values(groups).every((x) => !x.length) && (
            <p className="text-sm text-muted-foreground">
              No Sauti results yet. Try another name or genre.
            </p>
          )}
        </div>
      )}
    </section>
  );
}

export function ProfileRail() {
  return (
    <section className="mt-12">
      <h2 className="text-2xl font-medium text-plum">
        People moving the sound
      </h2>
      <div className="mt-5 grid gap-3 sm:grid-cols-2">
        {publicProfiles.map((profile) => (
          <Link
            key={profile.id}
            href={`/${profile.kind.toLowerCase()}/${profile.handle}`}
            className="surface-hover flex items-center gap-4 rounded-2xl bg-card p-4"
          >
            <div
              className={cn(
                "grid size-14 place-items-center rounded-full bg-gradient-to-br font-semibold text-plum",
                tone[profile.accent],
              )}
            >
              {profile.name.slice(0, 2)}
            </div>
            <div>
              <h3 className="font-medium">{profile.name}</h3>
              <p className="text-sm text-muted-foreground">
                {profile.subtitle}
              </p>
            </div>
            <ArrowRight className="ml-auto size-4 text-coral" />
          </Link>
        ))}
      </div>
    </section>
  );
}

export function PublicProfileView({ profile }: { profile: PublicProfile }) {
  const [followed, setFollowed] = useState(false);
  const [pending, start] = useTransition();
  const songs = discoverySongs.filter((x) => x.artistId === profile.id);
  return (
    <>
      <section className="overflow-hidden rounded-[2rem] bg-plum p-7 text-white sm:p-10">
        <div
          className={cn(
            "grid size-24 place-items-center rounded-full bg-gradient-to-br text-2xl font-semibold text-plum",
            tone[profile.accent],
          )}
        >
          {profile.name.slice(0, 2)}
        </div>
        <div className="mt-6 flex flex-wrap items-center gap-3">
          <h1 className="text-4xl font-medium tracking-[-.04em]">
            {profile.name}
          </h1>
          {profile.verified && (
            <Check
              className="size-5 rounded-full bg-lime p-1 text-plum"
              aria-label="Verified"
            />
          )}
        </div>
        <p className="mt-2 text-white/60">
          {profile.subtitle} · {profile.location}
        </p>
        <p className="mt-5 max-w-xl text-white/80">{profile.bio}</p>
        <div className="mt-6 flex flex-wrap gap-2">
          {profile.genres.map((g) => (
            <span
              key={g}
              className="rounded-full bg-white/10 px-3 py-1 text-sm"
            >
              {g}
            </span>
          ))}
        </div>
        <Button
          disabled={pending}
          variant={followed ? "secondary" : "default"}
          className="mt-7 rounded-full"
          onClick={() => {
            const was = followed;
            setFollowed(!was);
            start(() => toggleFollow(profile.kind, profile.id, was));
          }}
        >
          <UserPlus />
          {followed ? "Following" : "Follow"}
        </Button>
      </section>
      {profile.kind === "ARTIST" && (
        <SongRail
          title="Music"
          songs={songs.length ? songs : discoverySongs.slice(0, 3)}
        />
      )}
      {profile.kind === "DJ" && (
        <>
          <SongRail
            title="Music DJ Mura is supporting"
            songs={discoverySongs.slice(0, 4)}
          />
          <RequestSong profile={profile} />
        </>
      )}
      {profile.kind === "MATATU" && (
        <>
          <SongRail
            title="Recent music activity"
            songs={[discoverySongs[1], discoverySongs[5], discoverySongs[4]]}
          />
          <RequestSong profile={profile} />
        </>
      )}
    </>
  );
}
function RequestSong({ profile }: { profile: PublicProfile }) {
  const [songId, setSongId] = useState(discoverySongs[0].id);
  const [pending, start] = useTransition();
  return (
    <section className="mt-12 rounded-3xl bg-lavender p-6 sm:p-8">
      <h2 className="text-2xl font-medium text-plum">Request a Song</h2>
      <p className="mt-2 text-sm text-muted-foreground">
        Send a friendly request. Playing it is always their choice.
      </p>
      <div className="mt-5 flex flex-col gap-3 sm:flex-row">
        <select
          aria-label="Choose a song"
          value={songId}
          onChange={(e) => setSongId(e.target.value)}
          className="h-12 flex-1 rounded-xl border bg-card px-4"
        >
          {discoverySongs.map((song) => (
            <option key={song.id} value={song.id}>
              {song.title} — {song.artist}
            </option>
          ))}
        </select>
        <Button
          disabled={pending}
          className="h-12 rounded-xl"
          onClick={() =>
            start(async () => {
              const result = await requestSong(
                profile.kind as "DJ" | "MATATU",
                profile.id,
                songId,
              );
              toast(result.ok ? "Request sent" : "Request could not be sent");
            })
          }
        >
          Send request
        </Button>
      </div>
    </section>
  );
}

export function MySautiView({
  savedIds,
  history,
  following,
}: {
  savedIds: string[];
  history: {
    id: string;
    songId: string;
    heardAt: string;
    context: string | null;
  }[];
  following: string[];
}) {
  const saved = discoverySongs.filter((x) => savedIds.includes(x.id));
  const followed = publicProfiles.filter((x) => following.includes(x.id));
  return (
    <>
      <header>
        <p className="text-sm font-medium text-coral">
          Your private music space
        </p>
        <h1 className="mt-1 text-4xl font-medium tracking-[-.04em] text-plum">
          My Sauti
        </h1>
      </header>
      <section className="mt-10">
        <h2 className="text-2xl font-medium text-plum">Saved Songs</h2>
        {saved.length ? (
          <div className="mt-5 grid grid-cols-2 gap-4 sm:grid-cols-4">
            {saved.map((song) => (
              <SongTile key={song.id} song={song} />
            ))}
          </div>
        ) : (
          <Empty
            title="No saved music"
            body="Found something you love? Save it and it'll live here."
          />
        )}
      </section>
      <section className="mt-12">
        <h2 className="text-2xl font-medium text-plum">Following</h2>
        {followed.length ? (
          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            {followed.map((profile) => (
              <Link
                key={profile.id}
                href={`/${profile.kind.toLowerCase()}/${profile.handle}`}
                className="rounded-2xl bg-card p-5 font-medium"
              >
                {profile.name}
                <span className="ml-2 text-sm font-normal text-muted-foreground">
                  {profile.kind}
                </span>
              </Link>
            ))}
          </div>
        ) : (
          <Empty
            title="Not following anyone yet"
            body="Follow artists, DJs and matatus to shape your Sauti experience."
          />
        )}
      </section>
      <section className="mt-12 rounded-3xl bg-plum p-7 text-white">
        <p className="text-sm font-medium text-lime">Your Sound</p>
        <h2 className="mt-2 text-3xl font-medium">Afropop with city energy.</h2>
        <div className="mt-7 grid gap-5 sm:grid-cols-3">
          <Mini label="Favourite genre" value="Afropop" />
          <Mini
            label="Most saved artist"
            value={saved[0]?.artist ?? "Start saving"}
          />
          <Mini label="Discoveries this month" value={String(history.length)} />
        </div>
        <p className="mt-6 text-xs text-white/45">
          Based only on your private Sauti activity.
        </p>
      </section>
      <section className="mt-12">
        <h2 className="text-2xl font-medium text-plum">Privacy</h2>
        <div className="mt-4 rounded-3xl bg-card p-6">
          <p className="font-medium">Listening history is private</p>
          <p className="mt-1 text-sm text-muted-foreground">
            Only you can see and manage your listening activity.
          </p>
          <Button
            variant="outline"
            className="mt-5 rounded-full"
            onClick={() => startTransition(() => clearListeningHistory())}
          >
            Clear recent listening history
          </Button>
          <div className="mt-5 flex items-center justify-between border-t pt-5">
            <div>
              <p className="font-medium">Basic activity visibility</p>
              <p className="text-sm text-muted-foreground">
                Private by default
              </p>
            </div>
            <span className="rounded-full bg-lime px-3 py-1 text-xs font-medium text-plum">
              Private
            </span>
          </div>
        </div>
      </section>
    </>
  );
}
function Mini({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-xs uppercase tracking-widest text-white/45">{label}</p>
      <p className="mt-2 text-xl font-medium">{value}</p>
    </div>
  );
}
export function ActivityView() {
  return (
    <>
      <header>
        <p className="text-sm font-medium text-coral">
          From the Sauti you follow
        </p>
        <h1 className="mt-1 text-4xl font-medium tracking-[-.04em] text-plum">
          Activity
        </h1>
      </header>
      <div className="mt-8 divide-y rounded-3xl bg-card px-5">
        {activityItems.map((item, index) => (
          <div key={item} className="flex gap-4 py-5">
            <span
              className={cn(
                "mt-1 size-3 shrink-0 rounded-full",
                index === 0 ? "bg-coral" : "bg-lime",
              )}
            />
            <div>
              <p className="font-medium">{item}</p>
              <p className="mt-1 text-sm text-muted-foreground">
                {index === 0 ? "Today" : "This week"}
              </p>
            </div>
          </div>
        ))}
      </div>
      <p className="mt-4 text-center text-xs text-muted-foreground">
        Demo activity will later be powered by Sauti events.
      </p>
    </>
  );
}
function Empty({ title, body }: { title: string; body: string }) {
  return (
    <div className="mt-4 rounded-3xl border border-dashed bg-card/50 p-8 text-center">
      <MoreHorizontal className="mx-auto size-6 text-coral" />
      <h3 className="mt-4 font-medium text-plum">{title}</h3>
      <p className="mx-auto mt-2 max-w-md text-sm text-muted-foreground">
        {body}
      </p>
    </div>
  );
}
export function SongDetailView({ song }: { song: DiscoverySong }) {
  return (
    <>
      <section className="grid gap-8 md:grid-cols-[minmax(240px,380px)_1fr] md:items-center">
        <Cover song={song} className="w-full" />
        <div>
          <p className="text-sm font-medium text-coral">
            {song.genre} · {song.releaseDate}
          </p>
          <h1 className="mt-2 text-5xl font-medium tracking-[-.05em] text-plum">
            {song.title}
          </h1>
          <Link
            href={`/artist/${song.artistHandle}`}
            className="mt-3 block text-lg text-muted-foreground hover:text-coral"
          >
            {song.artist}
          </Link>
          <p className="mt-6 rounded-2xl bg-lavender p-4 text-sm text-plum">
            {song.activity}. Public, aggregated Sauti activity only.
          </p>
          <div className="mt-6 flex flex-wrap gap-2">
            <SongActions song={song} />
            <Button
              variant="outline"
              size="sm"
              onClick={() =>
                navigator.share?.({
                  title: `${song.title} — ${song.artist}`,
                  url: location.href,
                })
              }
            >
              <Share2 />
              Share
            </Button>
          </div>
        </div>
      </section>
      <section className="mt-12">
        <h2 className="text-2xl font-medium text-plum">Listen elsewhere</h2>
        {song.externalLinks && Object.keys(song.externalLinks).length ? (
          <div className="mt-4 flex gap-2">
            {Object.entries(song.externalLinks).map(([name, url]) => (
              <Button key={name} asChild variant="outline">
                <a href={url} target="_blank" rel="noreferrer">
                  {name}
                </a>
              </Button>
            ))}
          </div>
        ) : (
          <p className="mt-3 text-sm text-muted-foreground">
            No external listening links have been provided for this song.
          </p>
        )}
      </section>
    </>
  );
}
