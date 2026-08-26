import type { Metadata } from "next";
import{Home}from"@/components/dj/dj-ui";import{djContext}from"@/lib/services/dj-data";
export const metadata: Metadata = { title:"DJ Home" };
export const dynamic="force-dynamic";
export default async function Page(){const x=await djContext();return <Home dj={x.dj} campaigns={x.campaigns} sets={x.sets}/>}
