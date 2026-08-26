"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
export function RealtimeNotificationRefresh({profileId}:{profileId:string}){const router=useRouter();useEffect(()=>{const db=createClient();const channel=db.channel(`notification-centre:${profileId}`).on("postgres_changes",{event:"INSERT",schema:"public",table:"notifications",filter:`recipient_profile_id=eq.${profileId}`},()=>router.refresh()).subscribe();return()=>{void db.removeChannel(channel)}},[profileId,router]);return null}
