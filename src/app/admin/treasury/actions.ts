"use server";
import{revalidatePath}from"next/cache";
import{createClient}from"@/lib/supabase/server";
export type TreasuryState={status:"idle"|"error"|"success";message?:string};
export async function distributeProfitAction(_:TreasuryState,data:FormData):Promise<TreasuryState>{
 const amount=Number(data.get("amount")),period=String(data.get("period")??"").trim(),note=String(data.get("note")??"").trim();
 if(!Number.isFinite(amount)||amount<=0||period.length<3||note.length<5)return{status:"error",message:"Enter a valid net profit, period and supporting note."};
 const db=await createClient();
 const{error}=await db.rpc("record_management_net_profit" as never,{p_net_profit:amount,p_period_label:period,p_supporting_note:note,p_idempotency_key:`management:${crypto.randomUUID()}`} as never);
 if(error)return{status:"error",message:error.message.includes("SUPER_ADMIN")?"Only the super admin can approve a net-profit distribution.":"The distribution could not be recorded."};
 revalidatePath("/admin");revalidatePath("/admin/treasury");return{status:"success",message:"Net profit distributed to the management owners."};
}
