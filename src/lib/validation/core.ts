const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const HANDLE = /^[a-z0-9_]{3,30}$/;

export function cleanText(value: unknown, max = 500): string {
  const text = String(value ?? "").trim();
  if (text.length > max) throw new Error(`Text must be ${max} characters or fewer.`);
  return text;
}
export function uuid(value: unknown): string {
  const text = cleanText(value, 36);
  if (!UUID.test(text)) throw new Error("Invalid identifier.");
  return text;
}
export function email(value: unknown): string {
  const text = cleanText(value, 254).toLowerCase();
  if (!EMAIL.test(text)) throw new Error("Enter a valid email address.");
  return text;
}
export function handle(value: unknown): string {
  const text = cleanText(value, 30).toLowerCase();
  if (!HANDLE.test(text)) throw new Error("Use 3–30 lowercase letters, numbers or underscores.");
  return text;
}
export function positiveAmount(value: unknown, max = 100_000_000): number {
  const amount = Number(value);
  if (!Number.isFinite(amount) || amount <= 0 || amount > max || Math.round(amount * 100) !== amount * 100) throw new Error("Enter a valid positive amount.");
  return amount;
}
