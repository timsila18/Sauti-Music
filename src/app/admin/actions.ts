"use server";
import { revalidatePath } from "next/cache";
import { requireRole } from "@/lib/auth/session";
import { createClient } from "@/lib/supabase/server";
import { requireFeature } from "@/lib/config/features";
import { cleanText, positiveAmount, uuid } from "@/lib/validation/core";
import { sendB2c } from "@/lib/payments/mpesa-b2c";
const text = (v: FormDataEntryValue | null) => String(v ?? "").trim();
export async function simulateFunding(form: FormData) {
  requireFeature("financeSimulation");
  await requireRole("ADMIN", "/admin");
  const db = await createClient();
  const { error } = await db.rpc("admin_simulate_campaign_funding", {
    p_campaign_id: uuid(form.get("campaignId")),
    p_amount: positiveAmount(form.get("amount")),
    p_idempotency_key: crypto.randomUUID(),
  });
  if (error) throw new Error(error.message);
  revalidatePath("/admin");
  revalidatePath("/artist/spending");
}
export async function simulateRefund(form: FormData) {
  requireFeature("financeSimulation");
  await requireRole("ADMIN", "/admin");
  const db = await createClient();
  const { error } = await db.rpc("admin_simulate_campaign_refund", {
    p_campaign_id: uuid(form.get("campaignId")),
    p_amount: positiveAmount(form.get("amount")),
    p_reason: cleanText(form.get("reason"), 500),
    p_idempotency_key: crypto.randomUUID(),
  });
  if (error) throw new Error(error.message);
  revalidatePath("/admin");
}
export async function createAdjustment(form: FormData) {
  await requireRole("ADMIN", "/admin");
  const db = await createClient();
  const direction = text(form.get("direction"));
  if (direction !== "CREDIT" && direction !== "DEBIT")
    throw new Error("Choose a valid direction");
  const { error } = await db.rpc("admin_create_adjustment", {
    p_wallet_id: uuid(form.get("walletId")),
    p_amount: positiveAmount(form.get("amount")),
    p_direction: direction,
    p_reason: text(form.get("reason")),
    p_note: text(form.get("note")),
    p_idempotency_key: crypto.randomUUID(),
  });
  if (error) throw new Error(error.message);
  revalidatePath("/admin");
}
async function adminRpc<
  Name extends
    keyof import("@/lib/supabase/database.types").Database["public"]["Functions"],
>(
  name: Name,
  args: import("@/lib/supabase/database.types").Database["public"]["Functions"][Name]["Args"],
) {
  await requireRole("ADMIN", "/admin");
  const db = await createClient();
  const { error } = await db.rpc(name, args);
  if (error) throw new Error(error.message);
  revalidatePath("/admin", "layout");
}
export async function reviewCampaign(form: FormData) {
  const outcome = text(form.get("outcome")) as
    | "APPROVED"
    | "REJECTED"
    | "CHANGES_REQUESTED"
    | "PAUSED"
    | "CANCELLED";
  await adminRpc("admin_review_campaign", {
    p_campaign_id: text(form.get("campaignId")),
    p_outcome: outcome,
    p_category: text(form.get("category")),
    p_public_message: text(form.get("message")),
    p_internal_note: text(form.get("note")),
  });
}
export async function setAccountStatus(form: FormData) {
  await adminRpc("admin_set_account_status", {
    p_profile_id: text(form.get("profileId")),
    p_status: text(form.get("status")) as
      | "ACTIVE"
      | "SUSPENDED"
      | "UNDER_REVIEW"
      | "CLOSED",
    p_reason: text(form.get("reason")),
    p_note: text(form.get("note")),
  });
}
export async function setVerification(form: FormData) {
  await adminRpc("admin_set_verification", {
    p_entity_type: text(form.get("entityType")),
    p_entity_id: text(form.get("entityId")),
    p_status: text(form.get("status")) as
      | "PENDING"
      | "VERIFIED"
      | "REJECTED"
      | "FLAGGED",
    p_reason: text(form.get("reason")),
  });
}
export async function reviewPlay(form: FormData) {
  await adminRpc("admin_review_play", {
    p_play_id: text(form.get("playId")),
    p_outcome: text(form.get("outcome")) as
      | "APPROVED"
      | "REJECTED"
      | "KEPT_FLAGGED",
    p_reason: text(form.get("reason")),
    p_note: text(form.get("note")),
  });
}
export async function reprocessPlay(form: FormData) {
  await adminRpc("admin_reprocess_play", {
    p_play_id: text(form.get("playId")),
    p_reason: text(form.get("reason")),
  });
}
export async function updatePayout(form: FormData) {
  await adminRpc("admin_update_payout", {
    p_payout_id: text(form.get("payoutId")),
    p_status: text(form.get("status")) as
      | "PROCESSING"
      | "COMPLETED"
      | "FAILED"
      | "CANCELLED",
    p_reason: text(form.get("reason")),
  });
}
export async function sendPayout(form: FormData) {
  await requireRole("ADMIN", "/admin"); const db = await createClient(); const payoutId = uuid(form.get("payoutId"));
  const { data: payout } = await db.from("payout_requests").select("id,amount,destination_reference,status,method").eq("id", payoutId).single();
  if (!payout || payout.status !== "REQUESTED" || payout.method !== "MPESA_B2C") throw new Error("Payout is not ready for dispatch.");
  const { error: beginError } = await db.rpc("register_mpesa_payout", { p_payout_id: payout.id, p_originator_id: payout.id, p_conversation_id: "" });
  if (beginError) throw new Error(beginError.message);
  try { const sent = await sendB2c({ payoutId: payout.id, amount: Number(payout.amount), phone: payout.destination_reference }); await db.rpc("record_mpesa_payout_dispatch", { p_payout_id: payout.id, p_conversation_id: sent.conversationId }); }
  catch (cause) { await db.rpc("fail_mpesa_payout_dispatch", { p_payout_id: payout.id, p_reason: cause instanceof Error ? cause.message : "Provider dispatch failed" }); throw cause; }
  revalidatePath("/admin/payouts");
}
export async function updateSetting(form: FormData) {
  const key = text(form.get("key"));
  const fields =
    key === "finance_policy"
      ? {
          currency: "KES",
          platform_commission_bps: Number(text(form.get("commissionBps"))),
          fixed_fee: 0,
          minimum_campaign_budget: Number(text(form.get("minimumBudget"))),
          minimum_payout: Number(text(form.get("minimumPayout"))),
          settlement_review_hours: Number(text(form.get("settlementHours"))),
          budget_low_threshold_bps: Number(text(form.get("budgetLowBps"))),
          fees_refundable: false,
        }
      : {
          participant_reward_kes: Number(text(form.get("reward"))),
          minimum_playback_percentage: Number(
            text(form.get("playbackPercentage")),
          ),
          minimum_absolute_seconds: Number(text(form.get("minimumSeconds"))),
          cooldown_minutes: Number(text(form.get("cooldown"))),
          participant_daily_limit: Number(text(form.get("dailyLimit"))),
          campaign_daily_limit: null,
          timing_tolerance_seconds: 5,
          overlap_tolerance_seconds: 10,
          player_qualification_enabled: form.get("maintenance") !== "on",
          reward_posting_enabled: true,
          privacy: {
            installation_id: "pseudonymous",
            ip_retention_days: 30,
            raw_audio_stored: false,
          },
        };
  await adminRpc("admin_update_setting", {
    p_key: key,
    p_value: fields,
    p_reason: text(form.get("reason")),
  });
}
export async function createDispute(form: FormData) {
  const { profile } = await requireRole("ADMIN", "/admin");
  const db = await createClient();
  const { error } = await db
    .from("disputes")
    .insert({
      dispute_type: text(form.get("type")) as
        | "REJECTED_PLAY"
        | "MISSING_EARNING"
        | "CAMPAIGN"
        | "PAYOUT"
        | "OTHER",
      related_entity_type: text(form.get("entityType")),
      related_entity_id: text(form.get("entityId")) || null,
      description: text(form.get("description")),
      opened_by: profile.id,
      status: "OPEN",
      admin_notes: null,
      resolution: null,
      resolved_at: null,
      updated_at: new Date().toISOString(),
      created_at: new Date().toISOString(),
      id: crypto.randomUUID(),
    });
  if (error) throw new Error(error.message);
  revalidatePath("/admin/audit");
}
