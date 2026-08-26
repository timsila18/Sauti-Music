"use server";
import { revalidatePath } from "next/cache";
import { requireRole } from "@/lib/auth/session";
import { createClient } from "@/lib/supabase/server";

async function listener(){const {profile}=await requireRole("LISTENER","/listener");return {profile,supabase:await createClient()};}
export async function toggleSongSave(songId:string,active:boolean){const {profile,supabase}=await listener();if(active)await supabase.from("song_saves").delete().eq("profile_id",profile.id).eq("song_id",songId);else await supabase.from("song_saves").insert({profile_id:profile.id,song_id:songId});revalidatePath("/listener");revalidatePath("/my-sauti");}
export async function toggleSongLike(songId:string,active:boolean){const {profile,supabase}=await listener();if(active)await supabase.from("song_likes").delete().eq("profile_id",profile.id).eq("song_id",songId);else await supabase.from("song_likes").insert({profile_id:profile.id,song_id:songId});revalidatePath("/listener");}
export async function toggleFollow(targetType:"ARTIST"|"DJ"|"MATATU",targetId:string,active:boolean){const {profile,supabase}=await listener();if(active)await supabase.from("follows").delete().eq("profile_id",profile.id).eq("target_type",targetType).eq("target_id",targetId);else await supabase.from("follows").insert({profile_id:profile.id,target_type:targetType,target_id:targetId});revalidatePath("/my-sauti");}
export async function addListeningHistory(songId:string){const {profile,supabase}=await listener();await supabase.from("listener_history").insert({profile_id:profile.id,song_id:songId,source_type:"SIMULATED_LISTENING",context_label:"Sauti demo listening"});revalidatePath("/listener");revalidatePath("/my-sauti");}
export async function removeHistory(id:string){const {profile,supabase}=await listener();await supabase.from("listener_history").delete().eq("id",id).eq("profile_id",profile.id);revalidatePath("/listener");revalidatePath("/my-sauti");}
export async function clearListeningHistory(){const {profile,supabase}=await listener();await supabase.from("listener_history").delete().eq("profile_id",profile.id);revalidatePath("/listener");revalidatePath("/my-sauti");}
export async function requestSong(targetType:"DJ"|"MATATU",targetId:string,songId:string){const {supabase}=await listener();const {error}=await supabase.rpc("create_song_request",{p_target_type:targetType,p_target_id:targetId,p_song_id:songId});return {ok:!error,error:error?.message.includes("RATE_LIMITED")?"Too many requests. Try again in a minute.":undefined};}
