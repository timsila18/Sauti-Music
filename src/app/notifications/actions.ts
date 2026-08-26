"use server";
import { revalidatePath } from "next/cache";
import { requireUser } from "@/lib/auth/session";
import { createClient } from "@/lib/supabase/server";
import type { NotificationCategory } from "@/lib/supabase/database.types";
const value=(f:FormData,k:string)=>String(f.get(k)??"");
export async function markRead(form:FormData){await requireUser("/notifications");const db=await createClient();const{error}=await db.rpc("mark_notification_read",{p_notification_id:value(form,"id")});if(error)throw new Error(error.message);revalidatePath("/notifications");}
export async function markAllRead(){await requireUser("/notifications");const db=await createClient();const{error}=await db.rpc("mark_all_notifications_read",{});if(error)throw new Error(error.message);revalidatePath("/notifications");}
export async function archiveNotification(form:FormData){await requireUser("/notifications");const db=await createClient();const{error}=await db.rpc("archive_notification",{p_notification_id:value(form,"id")});if(error)throw new Error(error.message);revalidatePath("/notifications");}
export async function setPreference(form:FormData){await requireUser("/notifications");const db=await createClient();const{error}=await db.rpc("set_notification_preference",{p_category:value(form,"category") as NotificationCategory,p_enabled:form.get("enabled")==="on"});if(error)throw new Error(error.message);revalidatePath("/notifications");}
