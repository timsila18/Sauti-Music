import { ArrowUpRight, Search, WalletCards } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import type { Campaign } from "@/lib/types";

export function StatusBadge({ children, tone="default" }: { children: React.ReactNode; tone?: "default"|"lime" }) { return <Badge className={tone==="lime"?"border-0 bg-lime text-plum":"border-0 bg-lavender text-plum"}>{children}</Badge>; }
export function MetricDisplay({ label, value, trend }: { label:string; value:string; trend?:string }) { return <div><p className="text-sm text-muted-foreground">{label}</p><p className="mt-2 text-3xl font-medium tracking-tight text-plum">{value}</p>{trend?<p className="mt-1 text-xs font-medium text-emerald-700">{trend}</p>:null}</div>; }
export function CampaignCard({ campaign }: { campaign:Campaign }) { return <Card className="surface-hover border-0 shadow-none"><CardContent className="flex items-center justify-between gap-5 p-5"><div><StatusBadge tone={campaign.status==="Trending"?"lime":"default"}>{campaign.status}</StatusBadge><h3 className="mt-4 text-lg font-medium">{campaign.title}</h3><p className="text-sm text-muted-foreground">{campaign.artist}</p></div><div className="text-right"><p className="font-medium text-coral">{campaign.reward}</p><ArrowUpRight className="ml-auto mt-5 size-5 text-muted-foreground" /></div></CardContent></Card>; }
export function EarningsDisplay({ amount, label="Today's earnings" }: { amount:string; label?:string }) { return <div className="rounded-3xl bg-plum p-6 text-white"><WalletCards className="size-6 text-lime" /><p className="mt-8 text-sm text-white/60">{label}</p><p className="mt-1 text-4xl font-medium tracking-tight">{amount}</p></div>; }
export function SearchField({ placeholder="Search Sauti" }: { placeholder?:string }) { return <label className="relative block"><span className="sr-only">Search</span><Search className="absolute left-4 top-1/2 size-5 -translate-y-1/2 text-muted-foreground" /><Input type="search" placeholder={placeholder} className="h-12 rounded-full bg-card pl-12 shadow-none" /></label>; }
