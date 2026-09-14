import { NextResponse } from "next/server";
import { requireRole } from "@/lib/auth/session";
import { createClient } from "@/lib/supabase/server";
import { normalizeKenyanPhone, startStk } from "@/lib/payments/mpesa";

export async function POST(request: Request) {
  const { profile } = await requireRole("ARTIST_LABEL", "/artist"); const db = await createClient();
  const body = await request.json() as { campaignId?: string; phone?: string };
  const { data: campaign } = await db.from("campaigns").select("id,total_budget,currency,artist_account_id,funding_status").eq("id", body.campaignId ?? "").single();
  if (!campaign || campaign.currency !== "KES" || campaign.funding_status === "FUNDED") return NextResponse.json({ error: "This campaign cannot be funded." }, { status: 400 });
  const { data: membership } = await db.from("artist_account_memberships").select("profile_id").eq("artist_account_id", campaign.artist_account_id).eq("profile_id", profile.id).maybeSingle();
  if (!membership) return NextResponse.json({ error: "You cannot fund this campaign." }, { status: 403 });
  try {
    const phone = normalizeKenyanPhone(body.phone ?? ""); const started = await startStk({ amount: Number(campaign.total_budget), phone, reference: `SAUTI-${campaign.id.slice(0, 6)}` });
    const { error } = await db.rpc("register_mpesa_checkout", { p_campaign_id: campaign.id, p_checkout_id: started.checkoutId, p_merchant_id: started.merchantId, p_phone: phone });
    if (error) throw error;
    return NextResponse.json({ checkoutId: started.checkoutId, message: "Check your phone and enter your M-Pesa PIN." });
  } catch (cause) { return NextResponse.json({ error: cause instanceof Error ? cause.message : "Payment could not be started." }, { status: 400 }); }
}
