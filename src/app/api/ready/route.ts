import {logger} from "@/lib/observability/logger";

export const dynamic="force-dynamic";

export async function GET(){
  const started=Date.now();
  const required=["NEXT_PUBLIC_SUPABASE_URL","NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY","NEXT_PUBLIC_SITE_URL"];
  const missing=required.filter(name=>!process.env[name]);
  const unsafeFlags=["ENABLE_DEMO_LISTENING","ENABLE_FINANCE_SIMULATION","ENABLE_MOCK_PAYOUTS"].filter(name=>process.env[name]==="true");
  const production=process.env.SAUTI_ENV==="production";
  const ready=missing.length===0&&(!production||unsafeFlags.length===0);
  logger.info("readiness.checked",{route:"/api/ready",status:ready?"ok":"degraded",durationMs:Date.now()-started});
  return Response.json({status:ready?"ready":"not_ready",environment:process.env.SAUTI_ENV??"development",checks:{configuration:missing.length===0,productionSafety:!production||unsafeFlags.length===0,paymentsConfigured:Boolean(process.env.MPESA_CONSUMER_KEY&&process.env.MPESA_CONSUMER_SECRET&&process.env.MPESA_SHORTCODE)}},{status:ready?200:503,headers:{"Cache-Control":"no-store"}});
}
