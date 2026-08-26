import type {Metadata} from "next";
import {AppShell} from "@/components/app-shell";
import {DiscoverView} from "@/components/listener/listener-ui";
import {requireRole} from "@/lib/auth/session";
export const metadata:Metadata={title:"Discover"};export const dynamic="force-dynamic";
export default async function Page(){await requireRole("LISTENER","/discover");return <AppShell role="listener" action={{role:"listener",label:"Start Listening",supportingText:"Discover what's playing around you."}}><DiscoverView/></AppShell>}
