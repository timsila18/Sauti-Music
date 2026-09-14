import { createClient } from "@supabase/supabase-js";
import { callbackProof, queryStk } from "@/lib/payments/mpesa";

export async function POST(request: Request) {
  const payload = await request.json(); const callback = payload?.Body?.stkCallback;
  if (!callback?.CheckoutRequestID || typeof callback.ResultCode !== "number") return Response.json({ ResultCode: 0, ResultDesc: "Accepted" });
  const items = callback.CallbackMetadata?.Item ?? []; const value = (name: string) => items.find((item: { Name: string }) => item.Name === name)?.Value;
  const receipt = String(value("MpesaReceiptNumber") ?? ""); const amount = Number(value("Amount") ?? 0);
  try { const verified = await queryStk(callback.CheckoutRequestID); if (verified.resultCode !== callback.ResultCode) return Response.json({ ResultCode: 1, ResultDesc: "Verification mismatch" }, { status: 400 }); }
  catch { return Response.json({ ResultCode: 1, ResultDesc: "Verification unavailable" }, { status: 503 }); }
  const db = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!, { auth: { persistSession: false } });
  await db.rpc("complete_mpesa_checkout", { p_checkout_id: callback.CheckoutRequestID, p_result_code: callback.ResultCode, p_result_description: String(callback.ResultDesc ?? ""), p_receipt: receipt, p_amount: amount, p_proof: callbackProof(callback.CheckoutRequestID, callback.ResultCode, receipt) });
  return Response.json({ ResultCode: 0, ResultDesc: "Accepted" });
}
