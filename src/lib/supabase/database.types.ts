import type {
  CampaignApprovalStatus,
  CampaignStatus,
} from "@/domain/campaigns/statuses";
import type {
  LedgerDirection,
  LedgerTransactionType,
} from "@/domain/finance/types";
import type {
  PlaySourceType,
  QualificationStatus,
  VerificationStatus,
} from "@/domain/plays/types";
import type { UserRole } from "@/domain/auth/roles";

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: ProfileRow;
        Insert: ProfileInsert;
        Update: Partial<ProfileInsert>;
        Relationships: [];
      };
      artist_accounts: {
        Row: ArtistAccountRow;
        Insert: Omit<ArtistAccountRow, "created_at" | "updated_at"> &
          Partial<Pick<ArtistAccountRow, "id">>;
        Update: Partial<ArtistAccountRow>;
        Relationships: [];
      };
      artist_account_memberships: {
        Row: {
          artist_account_id: string;
          profile_id: string;
          membership_role: "OWNER" | "ADMIN" | "MEMBER";
          created_at: string;
        };
        Insert: {
          artist_account_id: string;
          profile_id: string;
          membership_role?: "OWNER" | "ADMIN" | "MEMBER";
        };
        Update: { membership_role?: "OWNER" | "ADMIN" | "MEMBER" };
        Relationships: [];
      };
      dj_profiles: {
        Row: DjProfileRow;
        Insert: Partial<DjProfileRow> &
          Pick<DjProfileRow, "profile_id" | "stage_name" | "handle">;
        Update: Partial<DjProfileRow>;
        Relationships: [];
      };
      dj_sets: {
        Row: DjSetRow;
        Insert: Partial<DjSetRow> &
          Pick<DjSetRow, "dj_profile_id" | "venue_name">;
        Update: Partial<DjSetRow>;
        Relationships: [];
      };
      dj_set_tracks: {
        Row: DjSetTrackRow;
        Insert: Partial<DjSetTrackRow> &
          Pick<DjSetTrackRow, "set_id" | "song_id">;
        Update: Partial<DjSetTrackRow>;
        Relationships: [];
      };
      matatus: {
        Row: MatatuRow;
        Insert: Partial<MatatuRow> & Pick<MatatuRow, "display_name" | "handle">;
        Update: Partial<MatatuRow>;
        Relationships: [];
      };
      matatu_crew_memberships: {
        Row: {
          matatu_id: string;
          profile_id: string;
          membership_role: "OWNER" | "ADMIN" | "MEMBER";
          relationship_role:
            | "OWNER"
            | "DRIVER"
            | "CONDUCTOR"
            | "CREW_MUSIC_OPERATOR";
          created_at: string;
        };
        Insert: {
          matatu_id: string;
          profile_id: string;
          membership_role?: "OWNER" | "ADMIN" | "MEMBER";
          relationship_role?:
            | "OWNER"
            | "DRIVER"
            | "CONDUCTOR"
            | "CREW_MUSIC_OPERATOR";
        };
        Update: Record<string, never>;
        Relationships: [];
      };
      songs: {
        Row: SongRow;
        Insert: Omit<SongRow, "created_at" | "updated_at"> &
          Partial<Pick<SongRow, "id">>;
        Update: Partial<SongRow>;
        Relationships: [];
      };
      campaigns: {
        Row: CampaignRow;
        Insert: Omit<CampaignRow, "created_at" | "updated_at"> &
          Partial<Pick<CampaignRow, "id">>;
        Update: Partial<CampaignRow>;
        Relationships: [];
      };
      campaign_participations: {
        Row: CampaignParticipationRow;
        Insert: Omit<CampaignParticipationRow, "created_at" | "updated_at"> &
          Partial<Pick<CampaignParticipationRow, "id">>;
        Update: Partial<CampaignParticipationRow>;
        Relationships: [];
      };
      play_events: {
        Row: PlayEventRow;
        Insert: Omit<PlayEventRow, "created_at"> &
          Partial<Pick<PlayEventRow, "id">>;
        Update: Partial<PlayEventRow>;
        Relationships: [];
      };
      wallets: {
        Row: WalletRow;
        Insert: Omit<WalletRow, "created_at"> & Partial<Pick<WalletRow, "id">>;
        Update: Partial<WalletRow>;
        Relationships: [];
      };
      ledger_transactions: {
        Row: LedgerTransactionRow;
        Insert: Omit<LedgerTransactionRow, "created_at"> &
          Partial<Pick<LedgerTransactionRow, "id">>;
        Update: Partial<LedgerTransactionRow>;
        Relationships: [];
      };
      follows: {
        Row: FollowRow;
        Insert: Omit<FollowRow, "id" | "created_at"> & { id?: string };
        Update: Partial<FollowRow>;
        Relationships: [];
      };
      song_saves: {
        Row: SongSaveRow;
        Insert: Omit<SongSaveRow, "created_at">;
        Update: Partial<SongSaveRow>;
        Relationships: [];
      };
      song_likes: {
        Row: SongSaveRow;
        Insert: Omit<SongSaveRow, "created_at">;
        Update: Partial<SongSaveRow>;
        Relationships: [];
      };
      listener_history: {
        Row: ListenerHistoryRow;
        Insert: Omit<
          ListenerHistoryRow,
          "id" | "created_at" | "heard_at" | "source_id" | "context_label"
        > & {
          id?: string;
          heard_at?: string;
          source_id?: string | null;
          context_label?: string | null;
        };
        Update: Partial<ListenerHistoryRow>;
        Relationships: [];
      };
      song_requests: {
        Row: SongRequestRow;
        Insert: Omit<SongRequestRow, "id" | "created_at" | "updated_at"> & {
          id?: string;
        };
        Update: Partial<SongRequestRow>;
        Relationships: [];
      };
      campaign_drafts: {
        Row: CampaignDraftRow;
        Insert: Omit<
          CampaignDraftRow,
          "id" | "created_at" | "updated_at" | "state" | "submitted_campaign_id"
        > & {
          id?: string;
          state?: "DRAFT" | "SUBMITTED" | "CANCELLED";
          submitted_campaign_id?: string | null;
        };
        Update: Partial<CampaignDraftRow>;
        Relationships: [];
      };
      business_settings: {
        Row: { key: string; value: Json; updated_at: string };
        Insert: { key: string; value: Json };
        Update: { value?: Json };
        Relationships: [];
      };
      playback_sessions: {
        Row: PlaybackSessionRow;
        Insert: Partial<PlaybackSessionRow> &
          Pick<
            PlaybackSessionRow,
            "campaign_participation_id" | "matatu_id" | "song_id"
          >;
        Update: Partial<PlaybackSessionRow>;
        Relationships: [];
      };
      trip_sessions: {
        Row: TripSessionRow;
        Insert: Partial<TripSessionRow> &
          Pick<TripSessionRow, "matatu_id" | "started_by_profile_id">;
        Update: Partial<TripSessionRow>;
        Relationships: [];
      };
      payout_requests: {
        Row: PayoutRequestRow;
        Insert: never;
        Update: never;
        Relationships: [];
      };
      notifications: {
        Row: NotificationRow;
        Insert: never;
        Update: never;
        Relationships: [];
      };
      notification_preferences: {
        Row: { profile_id: string; category: NotificationCategory; in_app_enabled: boolean; push_enabled: boolean; email_enabled: boolean; sms_enabled: boolean; whatsapp_enabled: boolean; updated_at: string };
        Insert: never; Update: never; Relationships: [];
      };
      activity_events: {
        Row: ActivityEventRow; Insert: never; Update: never; Relationships: [];
      };
      admin_review_decisions: {
        Row: AdminReviewDecisionRow;
        Insert: never;
        Update: never;
        Relationships: [];
      };
      admin_notes: {
        Row: {
          id: string;
          entity_type: string;
          entity_id: string;
          note: string;
          author_profile_id: string;
          created_at: string;
        };
        Insert: never;
        Update: never;
        Relationships: [];
      };
      disputes: {
        Row: DisputeRow;
        Insert: Partial<DisputeRow> &
          Pick<
            DisputeRow,
            "dispute_type" | "related_entity_type" | "description"
          >;
        Update: Partial<
          Pick<
            DisputeRow,
            "status" | "admin_notes" | "resolution" | "resolved_at"
          >
        >;
        Relationships: [];
      };
      business_setting_versions: {
        Row: {
          id: number;
          setting_key: string;
          value: Json;
          effective_at: string;
          changed_by: string;
          reason: string;
          created_at: string;
        };
        Insert: never;
        Update: never;
        Relationships: [];
      };
      campaign_participant_types: {
        Row: { campaign_id: string; participant_type: "DJ" | "MATATU" };
        Insert: never;
        Update: never;
        Relationships: [];
      };
      campaign_targets: {
        Row: {
          id: string;
          campaign_id: string;
          target_type: string;
          text_value: string | null;
          dj_profile_id: string | null;
          matatu_id: string | null;
          participant_type: "DJ" | "MATATU" | null;
          metadata: Json;
          created_at: string;
        };
        Insert: never;
        Update: never;
        Relationships: [];
      };
      play_event_flags: {
        Row: {
          id: string;
          play_event_id: string;
          flag_type: string;
          status: "OPEN" | "CONFIRMED" | "DISMISSED";
          details: Json;
          reviewed_by: string | null;
          reviewed_at: string | null;
          created_at: string;
          severity: "INFO" | "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";
          source: string;
          resolution: string | null;
          admin_notes: string | null;
          resolved_at: string | null;
        };
        Insert: never;
        Update: never;
        Relationships: [];
      };
      verification_decisions: {
        Row: {
          id: string; play_event_id: string; decision_version: number;
          source: "SYSTEM" | "ADMIN" | "REPROCESSING";
          verification_status: VerificationStatus;
          qualification_status: QualificationStatus;
          risk_level: "LOW" | "MEDIUM" | "HIGH" | "BLOCKED";
          reason_codes: string[]; reward_eligible: boolean;
          reward_amount: number | null; rule_snapshot: Json;
          evidence_summary: Json; actor_profile_id: string | null;
          reprocess_reason: string | null; supersedes_decision_id: string | null;
          created_at: string;
        };
        Insert: never; Update: never; Relationships: [];
      };
      account_risk_profiles: {
        Row: {
          profile_id: string; risk_level: "LOW" | "MEDIUM" | "HIGH" | "BLOCKED";
          minor_violation_count: number; serious_violation_count: number;
          last_evaluated_at: string; earning_blocked_at: string | null;
          admin_flag: boolean; summary: Json;
        };
        Insert: never; Update: never; Relationships: [];
      };
      financial_events: {
        Row: {
          id: number;
          event_type: string;
          entity_type: string;
          entity_id: string | null;
          actor_profile_id: string | null;
          idempotency_key: string;
          payload: Json;
          created_at: string;
        };
        Insert: never;
        Update: never;
        Relationships: [];
      };
      audit_logs: {
        Row: {
          id: number;
          actor_profile_id: string | null;
          action: string;
          entity_type: string;
          entity_id: string | null;
          previous_data: Json;
          new_data: Json;
          metadata: Json;
          created_at: string;
        };
        Insert: never;
        Update: never;
        Relationships: [];
      };
    };
    Views: {
      wallet_financial_summary: {
        Row: WalletFinancialSummary;
        Relationships: [];
      };
      campaign_financial_summary: {
        Row: CampaignFinancialSummary;
        Relationships: [];
      };
      admin_risk_metrics: {
        Row: { qualified: number; not_qualified: number; pending_review: number; rejected: number; total: number };
        Relationships: [];
      };
    };
    Functions: {
      complete_onboarding: {
        Args: { p_role: UserRole; p_details?: Json };
        Returns: ProfileRow;
      };
      handle_is_available: { Args: { value: string }; Returns: boolean };
      submit_campaign_draft: { Args: { p_draft_id: string }; Returns: string };
      matatu_campaign_decision: {
        Args: { p_campaign_id: string; p_accept: boolean };
        Returns: string;
      };
      start_matatu_playback: {
        Args: { p_participation_id: string; p_idempotency_key?: string | null; p_installation_id?: string | null };
        Returns: string;
      };
      finish_matatu_playback: {
        Args: { p_session_id: string; p_position_seconds: number; p_idempotency_key?: string | null; p_trusted_playback_seconds?: number | null; p_event_summary?: Json };
        Returns: Json;
      };
      dj_campaign_decision: {
        Args: { p_campaign_id: string; p_accept: boolean };
        Returns: string;
      };
      log_manual_set_track: {
        Args: { p_set_id: string; p_campaign_id: string };
        Returns: string;
      };
      record_manual_dj_activity: {
        Args: { p_set_track_id: string; p_idempotency_key: string };
        Returns: Json;
      };
      create_song_request: {
        Args: { p_target_type: "DJ" | "MATATU"; p_target_id: string; p_song_id: string };
        Returns: string;
      };
      admin_reprocess_play: {
        Args: { p_play_id: string; p_reason: string };
        Returns: Json;
      };
      admin_simulate_campaign_funding: {
        Args: {
          p_campaign_id: string;
          p_amount: number;
          p_idempotency_key: string;
        };
        Returns: Json;
      };
      admin_create_adjustment: {
        Args: {
          p_wallet_id: string;
          p_amount: number;
          p_direction: LedgerDirection;
          p_reason: string;
          p_note: string;
          p_idempotency_key: string;
        };
        Returns: string;
      };
      admin_simulate_campaign_refund: {
        Args: {
          p_campaign_id: string;
          p_amount: number;
          p_reason: string;
          p_idempotency_key: string;
        };
        Returns: string;
      };
      admin_review_campaign: {
        Args: {
          p_campaign_id: string;
          p_outcome:
            | "APPROVED"
            | "REJECTED"
            | "CHANGES_REQUESTED"
            | "PAUSED"
            | "CANCELLED"
            | "KEPT_FLAGGED";
          p_category: string;
          p_public_message: string;
          p_internal_note: string;
        };
        Returns: undefined;
      };
      admin_set_account_status: {
        Args: {
          p_profile_id: string;
          p_status: "ACTIVE" | "SUSPENDED" | "UNDER_REVIEW" | "CLOSED";
          p_reason: string;
          p_note: string;
        };
        Returns: undefined;
      };
      admin_set_verification: {
        Args: {
          p_entity_type: string;
          p_entity_id: string;
          p_status: VerificationStatus;
          p_reason: string;
        };
        Returns: undefined;
      };
      admin_review_play: {
        Args: {
          p_play_id: string;
          p_outcome: "APPROVED" | "REJECTED" | "KEPT_FLAGGED";
          p_reason: string;
          p_note: string;
        };
        Returns: undefined;
      };
      admin_update_payout: {
        Args: {
          p_payout_id: string;
          p_status: "PROCESSING" | "COMPLETED" | "FAILED" | "CANCELLED";
          p_reason: string;
        };
        Returns: undefined;
      };
      admin_update_setting: {
        Args: { p_key: string; p_value: Json; p_reason: string };
        Returns: undefined;
      };
      mark_notification_read: { Args: { p_notification_id: string }; Returns: undefined };
      mark_all_notifications_read: { Args: Record<string, never>; Returns: number };
      archive_notification: { Args: { p_notification_id: string }; Returns: undefined };
      set_notification_preference: { Args: { p_category: NotificationCategory; p_enabled: boolean }; Returns: undefined };
      request_payout: {
        Args: { p_amount: number; p_method: "MPESA_B2C" | "BANK" | "OTHER"; p_destination_reference: string; p_idempotency_key: string };
        Returns: string;
      };
      register_mpesa_checkout: {
        Args: { p_campaign_id: string; p_checkout_id: string; p_merchant_id: string; p_phone: string };
        Returns: string;
      };
      complete_mpesa_checkout: {
        Args: { p_checkout_id: string; p_result_code: number; p_result_description: string; p_receipt: string; p_amount: number; p_proof: string };
        Returns: Json;
      };
      register_mpesa_payout: { Args: { p_payout_id: string; p_originator_id: string; p_conversation_id: string }; Returns: undefined };
      record_mpesa_payout_dispatch: { Args: { p_payout_id: string; p_conversation_id: string }; Returns: undefined };
      fail_mpesa_payout_dispatch: { Args: { p_payout_id: string; p_reason: string }; Returns: undefined };
      complete_mpesa_payout: { Args: { p_originator_id: string; p_result_code: number; p_result_description: string; p_receipt: string; p_conversation_id: string; p_proof: string }; Returns: Json };
    };
    Enums: {
      user_role: UserRole;
      campaign_status: CampaignStatus;
      campaign_approval_status: CampaignApprovalStatus;
      play_source_type: PlaySourceType;
      verification_status: VerificationStatus;
      qualification_status: QualificationStatus;
      ledger_transaction_type: LedgerTransactionType;
      ledger_direction: LedgerDirection;
      onboarding_status: OnboardingStatus;
    };
    CompositeTypes: Record<string, never>;
  };
};

export type OnboardingStatus = "NOT_STARTED" | "IN_PROGRESS" | "COMPLETED";
export type ProfileRow = {
  id: string;
  auth_user_id: string;
  display_name: string;
  handle: string | null;
  role: UserRole;
  phone: string | null;
  contact_email: string | null;
  avatar_url: string | null;
  bio: string | null;
  county: string | null;
  town_area: string | null;
  favourite_genres: string[];
  onboarding_status: OnboardingStatus;
  verification_status: VerificationStatus;
  account_status: "ACTIVE" | "SUSPENDED" | "UNDER_REVIEW" | "CLOSED";
  created_at: string;
  updated_at: string;
};
export type ProfileInsert = Omit<
  ProfileRow,
  "id" | "created_at" | "updated_at"
> & { id?: string };
export type ArtistAccountRow = {
  id: string;
  account_type: "INDEPENDENT_ARTIST" | "ARTIST_TEAM" | "LABEL";
  name: string;
  handle: string;
  profile_image_url: string | null;
  cover_image_url: string | null;
  bio: string | null;
  county: string | null;
  town_area: string | null;
  website_url: string | null;
  social_links: Json;
  verification_status: VerificationStatus;
  status: "ACTIVE" | "SUSPENDED" | "UNDER_REVIEW" | "CLOSED";
  created_at: string;
  updated_at: string;
};
export type SongRow = {
  id: string;
  artist_account_id: string;
  title: string;
  version_name: string | null;
  featured_artist_text: string | null;
  artwork_url: string | null;
  audio_asset_url: string | null;
  duration_seconds: number | null;
  isrc: string | null;
  release_date: string | null;
  genre: string | null;
  language: string | null;
  external_links: Json;
  is_explicit: boolean;
  status: "DRAFT" | "PENDING_REVIEW" | "APPROVED" | "REJECTED" | "ARCHIVED";
  rights_declaration_accepted: boolean;
  rights_declaration_timestamp: string | null;
  created_at: string;
  updated_at: string;
};
export type CampaignRow = {
  id: string;
  artist_account_id: string;
  song_id: string;
  campaign_name: string;
  objective: "AWARENESS" | "VERIFIED_PLAYS" | "DISCOVERY";
  total_budget: string;
  currency: string;
  start_date: string;
  end_date: string;
  status: CampaignStatus;
  approval_status: CampaignApprovalStatus;
  funding_status:
    | "NOT_FUNDED"
    | "PENDING"
    | "FUNDED"
    | "PARTIALLY_SPENT"
    | "EXHAUSTED"
    | "PARTIALLY_REFUNDED"
    | "REFUNDED";
  submitted_at: string | null;
  configuration_snapshot: Json;
  approval_notes: string | null;
  approved_at: string | null;
  approved_by: string | null;
  paused_at: string | null;
  completed_at: string | null;
  created_at: string;
  updated_at: string;
};
export type CampaignDraftRow = {
  id: string;
  artist_account_id: string;
  owner_profile_id: string;
  song_id: string | null;
  current_step: number;
  configuration: Json;
  state: "DRAFT" | "SUBMITTED" | "CANCELLED";
  submitted_campaign_id: string | null;
  created_at: string;
  updated_at: string;
};
export type CampaignParticipationRow = {
  id: string;
  campaign_id: string;
  participant_type: "DJ" | "MATATU";
  dj_profile_id: string | null;
  matatu_id: string | null;
  status:
    | "AVAILABLE"
    | "INVITED"
    | "ACCEPTED"
    | "ACTIVE"
    | "COMPLETED"
    | "REJECTED"
    | "REMOVED";
  accepted_at: string | null;
  rejected_at: string | null;
  earned_amount: string;
  qualified_play_count: number;
  last_qualified_play_at: string | null;
  created_at: string;
  updated_at: string;
};
export type PlayEventRow = {
  id: string;
  song_id: string;
  campaign_id: string | null;
  campaign_participation_id: string | null;
  source_type: PlaySourceType;
  source_id: string | null;
  started_at: string;
  ended_at: string | null;
  duration_seconds: number | null;
  verification_status: VerificationStatus;
  verification_method:
    | "SAUTI_PLAYER"
    | "AUDIO_FINGERPRINT"
    | "DJ_INTEGRATION"
    | "RADIO_FEED"
    | "MANUAL"
    | "SYSTEM";
  qualification_status: QualificationStatus;
  qualified_at: string | null;
  metadata: Json;
  activity_id: string | null;
  idempotency_key: string | null;
  rule_snapshot: Json;
  reward_amount: string | null;
  reward_status: "PENDING" | "POSTED" | "FAILED" | "REVERSED" | "CANCELLED" | null;
  risk_level: "LOW" | "MEDIUM" | "HIGH" | "BLOCKED";
  created_at: string;
};
export type WalletRow = {
  id: string;
  owner_type: "PROFILE" | "ARTIST_ACCOUNT" | "CAMPAIGN";
  profile_id: string | null;
  artist_account_id: string | null;
  campaign_id: string | null;
  wallet_type: "EARNINGS" | "CAMPAIGN_BUDGET" | "PAYOUT" | "OPERATING";
  currency: string;
  status: "ACTIVE" | "SUSPENDED" | "CLOSED";
  created_at: string;
};
export type LedgerTransactionRow = {
  id: string;
  wallet_id: string;
  transaction_type: LedgerTransactionType;
  direction: LedgerDirection;
  amount: string;
  currency: string;
  reference_type: string | null;
  reference_id: string | null;
  description: string;
  status: "PENDING" | "POSTED" | "FAILED" | "REVERSED" | "CANCELLED";
  idempotency_key: string | null;
  created_at: string;
  posted_at: string | null;
  transfer_id: string | null;
  available_at: string | null;
  created_by: string | null;
  reversal_of: string | null;
  metadata: Json;
};
export type WalletFinancialSummary = {
  wallet_id: string;
  profile_id: string | null;
  artist_account_id: string | null;
  campaign_id: string | null;
  wallet_type: WalletRow["wallet_type"];
  currency: string;
  status: WalletRow["status"];
  available: string;
  pending: string;
  total_earned: string;
};
export type CampaignFinancialSummary = {
  campaign_id: string;
  currency: string;
  total_funded: string;
  participant_earnings: string;
  platform_fee: string;
  reserved_fees: string;
  refunded: string;
  pending_amount: string;
  remaining_balance: string;
};
export type PayoutRequestRow = {
  id: string;
  wallet_id: string;
  amount: string;
  currency: string;
  method: "MPESA_B2C" | "BANK" | "OTHER";
  destination_reference: string;
  status:
    | "REQUESTED"
    | "PROCESSING"
    | "COMPLETED"
    | "FAILED"
    | "CANCELLED"
    | "REVERSED";
  requested_by: string;
  requested_at: string;
  processed_at: string | null;
  external_transaction_id: string | null;
  failure_reason: string | null;
  idempotency_key: string;
  metadata: Json;
};
export type NotificationRow = {
  id: string;
  recipient_profile_id: string;
  notification_type: string;
  title: string;
  body: string;
  metadata: Json;
  link_url: string | null;
  read_at: string | null;
  created_at: string;
  related_entity_type: string | null;
  related_entity_id: string | null;
  priority: "LOW" | "NORMAL" | "HIGH" | "URGENT";
  category: NotificationCategory;
  archived_at: string | null;
  deduplication_key: string | null;
};
export type NotificationCategory = "CAMPAIGNS" | "EARNINGS" | "REQUESTS" | "FOLLOWERS" | "MUSIC_DISCOVERY" | "ACCOUNT_SECURITY";
export type ActivityEventRow = { id:string; event_type:string; actor_profile_id:string|null; subject_type:string; subject_id:string|null; related_campaign_id:string|null; related_song_id:string|null; visibility:"PRIVATE"|"PARTICIPANTS"|"PUBLIC"|"ADMIN"; recipient_profile_id:string|null; title:string; body:string|null; action_url:string|null; metadata:Json; created_at:string };
export type FollowRow = {
  id: string;
  profile_id: string;
  target_type: "ARTIST" | "DJ" | "MATATU";
  target_id: string;
  created_at: string;
};
export type SongSaveRow = {
  profile_id: string;
  song_id: string;
  created_at: string;
};
export type ListenerHistoryRow = {
  id: string;
  profile_id: string;
  song_id: string;
  source_type: "SIMULATED_LISTENING" | "DJ" | "MATATU" | "OTHER";
  source_id: string | null;
  context_label: string | null;
  heard_at: string;
  created_at: string;
};
export type SongRequestRow = {
  id: string;
  requester_profile_id: string;
  target_type: "DJ" | "MATATU";
  target_id: string;
  song_id: string;
  status: "PENDING" | "SEEN" | "PLAYED" | "DECLINED" | "EXPIRED";
  created_at: string;
  updated_at: string;
};
export type MatatuRow = {
  id: string;
  display_name: string;
  handle: string;
  vehicle_identifier: string | null;
  sacco_name: string | null;
  main_route: string | null;
  county: string | null;
  town_area: string | null;
  profile_image_url: string | null;
  status: "ACTIVE" | "SUSPENDED" | "UNDER_REVIEW" | "CLOSED";
  verification_status: VerificationStatus;
  created_at: string;
  updated_at: string;
};
export type PlaybackSessionRow = {
  id: string;
  campaign_participation_id: string;
  matatu_id: string;
  song_id: string;
  started_at: string;
  ended_at: string | null;
  playback_position_seconds: number;
  completion_percentage: string;
  status: "PLAYING" | "STOPPED" | "QUALIFIED" | "NOT_QUALIFIED" | "FLAGGED";
  rejection_reason: string | null;
  play_event_id: string | null;
  created_at: string;
};
export type TripSessionRow = {
  id: string;
  matatu_id: string;
  started_by_profile_id: string;
  route_label: string | null;
  external_source: string | null;
  external_reference: string | null;
  status: "ACTIVE" | "COMPLETED";
  started_at: string;
  ended_at: string | null;
  summary: Json;
};
export type DjProfileRow = {
  id: string;
  profile_id: string;
  stage_name: string;
  handle: string;
  bio: string | null;
  photo_url: string | null;
  county: string | null;
  town_area: string | null;
  music_genres: string[];
  verification_status: VerificationStatus;
  status: "ACTIVE" | "SUSPENDED" | "UNDER_REVIEW" | "CLOSED";
  created_at: string;
  updated_at: string;
};
export type AdminReviewDecisionRow = {
  id: string;
  entity_type: string;
  entity_id: string;
  outcome:
    | "APPROVED"
    | "REJECTED"
    | "CHANGES_REQUESTED"
    | "PAUSED"
    | "CANCELLED"
    | "KEPT_FLAGGED";
  reason_category: string | null;
  public_message: string | null;
  internal_note: string | null;
  actor_profile_id: string;
  previous_state: Json;
  new_state: Json;
  created_at: string;
};
export type DisputeRow = {
  id: string;
  dispute_type:
    | "REJECTED_PLAY"
    | "MISSING_EARNING"
    | "CAMPAIGN"
    | "PAYOUT"
    | "OTHER";
  opened_by: string | null;
  related_entity_type: string;
  related_entity_id: string | null;
  status: "OPEN" | "IN_REVIEW" | "RESOLVED" | "REJECTED";
  description: string;
  admin_notes: string | null;
  resolution: string | null;
  created_at: string;
  resolved_at: string | null;
  updated_at: string;
};
export type DjSetRow = {
  id: string;
  dj_profile_id: string;
  name: string | null;
  venue_name: string;
  town_area: string | null;
  started_at: string;
  ended_at: string | null;
  duration_seconds: number | null;
  status: "SCHEDULED" | "ACTIVE" | "COMPLETED" | "CANCELLED";
  is_private: boolean;
  external_source: string | null;
  external_reference: string | null;
  metadata: Json;
  created_at: string;
};
export type DjSetTrackRow = {
  id: string;
  set_id: string;
  song_id: string;
  campaign_id: string | null;
  logged_at: string;
  source_method: "MANUAL" | "AUDIO_RECOGNITION" | "DJ_INTEGRATION";
  verification_status: VerificationStatus;
  qualification_status: QualificationStatus;
  play_event_id: string | null;
  created_at: string;
};
