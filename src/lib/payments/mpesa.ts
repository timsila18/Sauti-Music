import "server-only";
import { createHmac } from "node:crypto";

const base = "https://api.safaricom.co.ke";
const required = (name: string) => { const value = process.env[name]; if (!value) throw new Error(`Missing ${name}`); return value; };
const timestamp = () => new Date().toISOString().replace(/[-:TZ.]/g, "").slice(0, 14);

async function token(key = required("MPESA_CONSUMER_KEY"), secret = required("MPESA_CONSUMER_SECRET")) {
  const response = await fetch(`${base}/oauth/v1/generate?grant_type=client_credentials`, { headers: { Authorization: `Basic ${Buffer.from(`${key}:${secret}`).toString("base64")}` }, cache: "no-store" });
  if (!response.ok) throw new Error("M-Pesa authentication failed");
  return (await response.json() as { access_token: string }).access_token;
}

export function normalizeKenyanPhone(value: string) {
  const digits = value.replace(/\D/g, "");
  if (/^0[17]\d{8}$/.test(digits)) return `254${digits.slice(1)}`;
  if (/^254[17]\d{8}$/.test(digits)) return digits;
  throw new Error("Enter a valid Kenyan M-Pesa number.");
}

export async function startStk(input: { amount: number; phone: string; reference: string }) {
  const shortcode = required("MPESA_SHORTCODE"), stamp = timestamp();
  const response = await fetch(`${base}/mpesa/stkpush/v1/processrequest`, { method: "POST", headers: { Authorization: `Bearer ${await token()}`, "Content-Type": "application/json" }, body: JSON.stringify({ BusinessShortCode: shortcode, Password: Buffer.from(`${shortcode}${required("MPESA_PASSKEY")}${stamp}`).toString("base64"), Timestamp: stamp, TransactionType: "CustomerPayBillOnline", Amount: Math.round(input.amount), PartyA: input.phone, PartyB: shortcode, PhoneNumber: input.phone, CallBackURL: `${required("NEXT_PUBLIC_SITE_URL")}/api/payments/mpesa/callback`, AccountReference: input.reference.slice(0, 12), TransactionDesc: "Sauti campaign funding" }), cache: "no-store" });
  const body = await response.json() as { CheckoutRequestID?: string; MerchantRequestID?: string; ResponseCode?: string; errorMessage?: string };
  if (!response.ok || body.ResponseCode !== "0" || !body.CheckoutRequestID) throw new Error(body.errorMessage ?? "M-Pesa could not start the payment.");
  return { checkoutId: body.CheckoutRequestID, merchantId: body.MerchantRequestID ?? "" };
}

export async function queryStk(checkoutId: string) {
  const shortcode = required("MPESA_SHORTCODE"), stamp = timestamp();
  const response = await fetch(`${base}/mpesa/stkpushquery/v1/query`, { method: "POST", headers: { Authorization: `Bearer ${await token()}`, "Content-Type": "application/json" }, body: JSON.stringify({ BusinessShortCode: shortcode, Password: Buffer.from(`${shortcode}${required("MPESA_PASSKEY")}${stamp}`).toString("base64"), Timestamp: stamp, CheckoutRequestID: checkoutId }), cache: "no-store" });
  const body = await response.json() as { ResultCode?: string | number; ResultDesc?: string; errorMessage?: string };
  if (!response.ok || body.ResultCode === undefined) throw new Error(body.errorMessage ?? "M-Pesa payment could not be verified.");
  return { resultCode: Number(body.ResultCode), description: body.ResultDesc ?? "" };
}

export function callbackProof(checkoutId: string, resultCode: number, receipt: string) {
  return createHmac("sha256", required("MPESA_CALLBACK_SECRET")).update(`${checkoutId}:${resultCode}:${receipt}`).digest("hex");
}
