export const LEDGER_TRANSACTION_TYPES = ["CAMPAIGN_FUNDING","CAMPAIGN_HOLD","CAMPAIGN_RELEASE","PARTICIPANT_EARNING","PLATFORM_COMMISSION","REFUND","PAYOUT","PAYOUT_REVERSAL","ADJUSTMENT","BONUS","FEE"] as const;
export type LedgerTransactionType = (typeof LEDGER_TRANSACTION_TYPES)[number];
export type LedgerDirection = "DEBIT" | "CREDIT";

export type Money = Readonly<{ amount: string; currency: string }>;
