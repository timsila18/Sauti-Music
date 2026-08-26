import type { Metadata } from "next";
import{Home}from"@/components/matatu/matatu-ui";import{matatuContext}from"@/lib/services/matatu-data";
export const metadata: Metadata = { title:"Matatu Home" };
export const dynamic="force-dynamic";
export default async function Page(){const x=await matatuContext();return <Home matatu={x.matatu} campaigns={x.campaigns} plays={x.plays}/>}
