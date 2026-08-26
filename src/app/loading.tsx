import { Skeleton } from "@/components/ui/skeleton";
export default function Loading() { return <main className="mx-auto max-w-7xl px-5 py-12"><Skeleton className="h-5 w-28" /><Skeleton className="mt-5 h-14 w-2/3" /><div className="mt-12 grid gap-5 sm:grid-cols-3">{Array.from({length:3}).map((_,index)=><Skeleton key={index} className="h-56 rounded-3xl" />)}</div></main>; }
