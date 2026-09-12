import "server-only";
import type {CampaignFinancialSummary,LedgerTransactionRow,WalletFinancialSummary} from "@/lib/supabase/database.types";
import {createClient} from "@/lib/supabase/server";

export type WalletActivity=Pick<LedgerTransactionRow,"id"|"transaction_type"|"direction"|"amount"|"currency"|"description"|"status"|"created_at"|"available_at">;
export interface WalletView{summary:WalletFinancialSummary|null;activity:WalletActivity[];minimumPayout:string;settlementHours:number;pendingPayout:{id:string;amount:string;currency:string;status:string;requested_at:string}|null}

export async function profileWallet(profileId:string):Promise<WalletView>{
 const db=await createClient();
 const [{data:summary},{data:policy}]=await Promise.all([
  db.from("wallet_financial_summary").select("*").eq("profile_id",profileId).eq("wallet_type","EARNINGS").maybeSingle(),
  db.from("business_settings").select("value").eq("key","finance_policy").maybeSingle()
 ]);
 const [activityResult,payoutResult]=summary?await Promise.all([
  db.from("ledger_transactions").select("id,transaction_type,direction,amount,currency,description,status,created_at,available_at").eq("wallet_id",summary.wallet_id).order("created_at",{ascending:false}).limit(20),
  db.from("payout_requests").select("id,amount,currency,status,requested_at").eq("wallet_id",summary.wallet_id).in("status",["REQUESTED","PROCESSING"]).order("requested_at",{ascending:false}).limit(1).maybeSingle(),
 ]):[{data:[]},{data:null}];
 const activity=activityResult.data??[];
 const value=(policy?.value??{}) as {minimum_payout?:number;settlement_review_hours?:number};
 return{summary,activity,minimumPayout:String(value.minimum_payout??100),settlementHours:value.settlement_review_hours??24,pendingPayout:payoutResult.data};
}

export async function artistFinances(artistAccountId:string){
 const db=await createClient();
 const {data:campaigns}=await db.from("campaigns").select("id,campaign_name").eq("artist_account_id",artistAccountId);
 const ids=(campaigns??[]).map(c=>c.id);
 const {data:summaries}=ids.length?await db.from("campaign_financial_summary").select("*").in("campaign_id",ids):{data:[] as CampaignFinancialSummary[]};
 return{campaigns:campaigns??[],summaries:summaries??[]};
}

export interface CampaignFundingProvider{startFunding(input:{campaignId:string;amount:string;currency:string;idempotencyKey:string}):Promise<{providerReference:string}>}
export interface PayoutProvider{requestPayout(input:{payoutRequestId:string;amount:string;currency:string;destinationReference:string}):Promise<{providerReference:string}>}
