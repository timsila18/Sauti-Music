"use server";
import{revalidatePath}from"next/cache";import{artistContext}from"@/lib/services/artist-data";
const val=(f:FormData,k:string)=>String(f.get(k)??"").trim();
export async function addRosterArtist(f:FormData){const{account,db}=await artistContext();if(account.account_type!=="LABEL")return;await(db as any).from("label_artists").insert({label_account_id:account.id,stage_name:val(f,"stage_name"),contact_email:val(f,"email")||null,phone:val(f,"phone")||null,bio:val(f,"bio")||null,genres:val(f,"genres").split(",").map(x=>x.trim()).filter(Boolean)});revalidatePath("/artist/team")}
export async function inviteTeamMember(f:FormData){const{profile,account,db}=await artistContext();await(db as any).from("artist_team_invitations").insert({artist_account_id:account.id,email:val(f,"email").toLowerCase(),membership_role:val(f,"role")==="ADMIN"?"ADMIN":"MEMBER",invited_by:profile.id});revalidatePath("/artist/team")}
