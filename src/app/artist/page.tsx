import type { Metadata } from "next";
import {ArtistHome} from "@/components/artist/artist-ui";import {artistContext} from "@/lib/services/artist-data";
export const metadata: Metadata = { title:"Artist Home" };
export const dynamic="force-dynamic";
export default async function Page(){const x=await artistContext();return <ArtistHome account={x.account} songs={x.songs} campaigns={x.campaigns}/>}
