export const CAMPAIGN_STATUSES = ["DRAFT", "PENDING_APPROVAL", "ACTIVE", "PAUSED", "COMPLETED", "REJECTED", "CANCELLED"] as const;
export type CampaignStatus = (typeof CAMPAIGN_STATUSES)[number];

export const CAMPAIGN_APPROVAL_STATUSES = ["NOT_SUBMITTED", "PENDING", "APPROVED", "REJECTED"] as const;
export type CampaignApprovalStatus = (typeof CAMPAIGN_APPROVAL_STATUSES)[number];

const CAMPAIGN_TRANSITIONS: Record<CampaignStatus, readonly CampaignStatus[]> = {
  DRAFT: ["PENDING_APPROVAL", "CANCELLED"],
  PENDING_APPROVAL: ["ACTIVE", "REJECTED", "CANCELLED"],
  ACTIVE: ["PAUSED", "COMPLETED", "CANCELLED"],
  PAUSED: ["ACTIVE", "COMPLETED", "CANCELLED"],
  COMPLETED: [],
  REJECTED: ["DRAFT", "CANCELLED"],
  CANCELLED: [],
};

export function canTransitionCampaign(from: CampaignStatus, to: CampaignStatus): boolean {
  return CAMPAIGN_TRANSITIONS[from].includes(to);
}
