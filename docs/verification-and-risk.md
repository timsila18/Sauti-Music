# Verification and risk

Sauti separates three facts: an **activity** says something happened, **verification** says the evidence is credible, and **qualification** says a verified activity meets the campaign's payment rules. A device report alone never creates an available earning.

## Central rule engine

`finish_matatu_playback` is the transactional verification boundary for Sauti Player activity. It locks the playback, participation and campaign budget, serializes decisions per participation, uses a request idempotency key, calculates trusted playback from server elapsed time, and writes one immutable `verification_decisions` version. It returns the same event for retries.

Rules are stored in `verification_policy` and copied into `campaigns.configuration_snapshot.verification_rules`. Every play also stores its exact rule snapshot. Configuration changes therefore affect new campaigns/activity only; historical decisions change only through an explicit, audited reprocessing action.

Implemented rules cover active/accepted participation, account and risk state, campaign/song match, plausible timing, trusted duration and percentage, cooldowns, participant and campaign daily limits, overlap prevention, duplicate requests, and remaining campaign budget. Seeking can only reduce trusted time: reported progress is capped by server elapsed time and track duration.

## Decisions and money

Verification uses `PENDING`, `VERIFIED`, `REJECTED`, or `FLAGGED`. Qualification uses `PENDING`, `QUALIFIED`, `NOT_QUALIFIED`, or `REVIEW_REQUIRED`. A qualifying Sauti Player event creates paired **pending** ledger entries: a campaign reservation and participant earning. The finance settlement window determines when clean pending earnings become available; flagged or disputed earnings stay held.

Manual DJ activity is always pending verification and requires review. It creates no automatic earning. Admin review and reprocessing preserve the original system decision, add a new version/review record, require a reason, and audit the actor. Financial outcome changes must use idempotent adjustments/reversals rather than editing ledger history.

## Risk and privacy

Flags are reusable records with severity, source, resolution and private Admin notes. Transparent counts escalate accounts from low to medium/high and repeated serious signals can place an account under review. A participant can be stopped from earning on one campaign without pausing the campaign for everyone.

The app may retain a pseudonymous installation identifier and short-lived security IP logs, but IP matching is not a primary decision. Installation IDs are not hardware fingerprints and are never shown to artists or participants. Raw microphone/audio recordings are not collected. Future recognition adapters must process audio ephemerally and discard it after recognition.

Artists see only qualified, not-qualified, pending-review and rejected totals. Participants receive safe explanations such as playback threshold, current play limit, or review pending; device/IP correlation and internal thresholds are Admin-only.

## Extension hooks

The verification method enum reserves `AUDIO_FINGERPRINT`, `DJ_INTEGRATION`, and `RADIO_FEED`. Future adapters should normalize evidence into a play activity and call the same versioned qualification boundary. They must not post rewards directly.
