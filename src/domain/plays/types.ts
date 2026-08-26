export const PLAY_SOURCE_TYPES = ["MATATU", "DJ", "RADIO", "VENUE", "PERSONAL", "TRIPLINK", "OTHER"] as const;
export type PlaySourceType = (typeof PLAY_SOURCE_TYPES)[number];

export const VERIFICATION_STATUSES = ["PENDING", "VERIFIED", "REJECTED", "FLAGGED"] as const;
export type VerificationStatus = (typeof VERIFICATION_STATUSES)[number];

export const QUALIFICATION_STATUSES = ["PENDING", "QUALIFIED", "NOT_QUALIFIED", "REVIEW_REQUIRED"] as const;
export type QualificationStatus = (typeof QUALIFICATION_STATUSES)[number];
