const names = ["MPESA_CONSUMER_KEY", "MPESA_CONSUMER_SECRET", "MPESA_PASSKEY", "MPESA_SHORTCODE", "MPESA_CALLBACK_SECRET"];
const missing = names.filter((name) => !process.env[name]);
if (missing.length) throw new Error(`Missing configuration: ${missing.join(", ")}`);
const auth = Buffer.from(`${process.env.MPESA_CONSUMER_KEY}:${process.env.MPESA_CONSUMER_SECRET}`).toString("base64");
const response = await fetch("https://api.safaricom.co.ke/oauth/v1/generate?grant_type=client_credentials", { headers: { Authorization: `Basic ${auth}` } });
if (!response.ok) throw new Error(`Daraja authentication failed with HTTP ${response.status}`);
const body = await response.json();
if (!body.access_token) throw new Error("Daraja returned no access token");
console.log("Production Daraja authentication succeeded; no payment was initiated.");
