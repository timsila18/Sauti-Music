"use server";

import { createClient } from "@/lib/supabase/server";

export type PasswordState={status:"idle"|"error"|"success";message?:string};
const clean=(data:FormData,key:string)=>String(data.get(key)??"");

export async function changePasswordAction(_:PasswordState,data:FormData):Promise<PasswordState>{
  const current=clean(data,"current_password"),password=clean(data,"password"),confirmation=clean(data,"password_confirmation");
  if(!current)return{status:"error",message:"Enter your current password."};
  if(password.length<8||!/[A-Za-z]/.test(password)||!/[0-9]/.test(password)||!(/[^A-Za-z0-9]/.test(password)))return{status:"error",message:"Use at least 8 characters with a letter, number and symbol."};
  if(password!==confirmation)return{status:"error",message:"The new passwords do not match."};
  if(password===current)return{status:"error",message:"Choose a different new password."};
  const db=await createClient();
  const{data:{user}}=await db.auth.getUser();
  if(!user?.email)return{status:"error",message:"Your session expired. Sign in again."};
  const{error:verifyError}=await db.auth.signInWithPassword({email:user.email,password:current});
  if(verifyError)return{status:"error",message:"Your current password is incorrect."};
  const{error}=await db.auth.updateUser({password});
  return error?{status:"error",message:"We could not update your password. Please try again."}:{status:"success",message:"Password updated successfully."};
}
