"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

export type PayoutActionState={status:"idle"|"error"|"success";message?:string};

function payoutMessage(message:string){
  if(message.includes("BELOW_MINIMUM"))return "The amount is below the minimum payout.";
  if(message.includes("INSUFFICIENT_AVAILABLE_BALANCE"))return "That amount is higher than your available balance.";
  if(message.includes("PAYOUT_ALREADY_PENDING"))return "You already have a payout being processed.";
  if(message.includes("INVALID_DESTINATION"))return "Enter a valid Kenyan M-Pesa phone number.";
  if(message.includes("WALLET_UNAVAILABLE"))return "Your earnings wallet is not available.";
  return "We could not submit the payout. Your balance was not changed.";
}

export async function requestPayoutAction(_:PayoutActionState,formData:FormData):Promise<PayoutActionState>{
  const amount=Number(formData.get("amount"));
  const rawPhone=String(formData.get("phone")??"").replace(/[\s()-]/g,"");
  const phone=rawPhone.startsWith("0")?`254${rawPhone.slice(1)}`:rawPhone.startsWith("+")?rawPhone.slice(1):rawPhone;
  if(!Number.isFinite(amount)||amount<=0)return{status:"error",message:"Enter a valid payout amount."};
  if(!/^254[17]\d{8}$/.test(phone))return{status:"error",message:"Use a Kenyan number such as 0712 345 678."};
  const db=await createClient();
  const {error}=await db.rpc("request_payout",{p_amount:amount,p_method:"MPESA_B2C",p_destination_reference:phone,p_idempotency_key:`participant:${crypto.randomUUID()}`});
  if(error)return{status:"error",message:payoutMessage(error.message)};
  revalidatePath("/dj/wallet");
  revalidatePath("/matatu/wallet");
  return{status:"success",message:"Payout requested. We’ll update you when processing begins."};
}
