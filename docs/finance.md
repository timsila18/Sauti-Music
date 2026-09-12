# Sauti financial architecture

Sauti treats the ledger as the source of truth. Wallet balances are views over immutable entries; no page stores or edits a balance.

## Money convention

The inherited schema uses PostgreSQL `numeric(14,2)` and ISO currency codes. KES values are exact to cents and all calculations happen in PostgreSQL—never with browser floating-point arithmetic. This preserves compatibility with the existing whole-KSh product while supporting minor units and additional currencies later. A future API may expose integer minor units at its boundary without changing ledger semantics.

## Wallets and ledger

Artist accounts can hold future credits, campaigns hold allocated budgets, participant profiles hold earnings, and platform operating wallets hold internal fees. Normal users cannot see platform wallets. Wallets are `ACTIVE`, `SUSPENDED`, or `CLOSED`.

Every operation creates one or more ledger entries linked by `transfer_id`, with a typed transaction/status, reference, actor, idempotency key, metadata, and timestamp. A posted row cannot be updated or deleted. Corrections use a reversing entry or an audited `ADJUSTMENT`. RLS allows owners and artist campaign managers to read relevant entries, while posted writes happen only inside security-definer financial functions after role checks.

## Funding and commission

Flow: provider confirmation → lock campaign → create/reuse campaign wallet → credit gross funding → debit reserved platform fee → credit platform operating wallet → update funding status → append event and audit record.

Rates use integer basis points in the admin-only `finance_policy`; 2,000 basis points means 20%. The MVP reserves the platform fee when funding is confirmed. Reports deliberately label it “reserved”; production accounting must decide when it becomes earned revenue. The development simulator calls this same transaction boundary and labels every record `Development Funding`. It is not a payment option.

Funding lifecycle is separate from campaign lifecycle: `NOT_FUNDED → PENDING → FUNDED → PARTIALLY_SPENT → EXHAUSTED`, with `PARTIALLY_REFUNDED` and `REFUNDED` branches.

## Participant earnings and settlement

Qualified activity must be locked and checked for qualification, duplication, participant eligibility, wallet status, and remaining reward allocation. The campaign debit and participant credit share a transfer/reference and unique idempotency keys. The database row lock serializes the final available budget so concurrent plays cannot overspend it. `available_at` implements the configurable review window: posted credits before that time are shown as Pending; cleared credits are Available.

Budget-low and exhausted events use the configured basis-point threshold. Exhaustion rejects new paid activity and should stop distribution while preserving already-valid pending reviews.

## Refunds

Refundable balance is derived as funding less participant earnings, reserved/non-refundable fees, earlier refunds, and pending commitments. The admin development action locks the campaign wallet and refuses an amount above that balance. It creates an immutable refund, event, audit record, and funding-state change. No real refund provider is called.

## Payouts

`payout_requests` stores wallet, exact amount, currency, method, private destination reference, status, timestamps, external reference, failure reason, metadata, and idempotency key. States are `REQUESTED`, `PROCESSING`, `COMPLETED`, `FAILED`, `CANCELLED`, and `REVERSED`. The configured minimum payout defaults to KSh 100 for development. No live payout action is exposed.

Participants can now create an idempotent, audited M-Pesa payout request from an eligible earnings wallet. The database locks the wallet, validates the configured minimum and available balance, and prevents overlapping requests. Creating a request does not move money: an approved provider worker must transition it through processing and completion.

`PayoutProvider` and `CampaignFundingProvider` are application boundaries for M-Pesa B2C, STK Push, bank, card, or account-credit adapters. Provider credentials remain server-only and live transfer processing stays unavailable until the Safaricom application and callbacks are configured.

## Audit, idempotency, and events

Funding, earnings, refunds, payouts, reversals, and adjustments use unique idempotency keys. Financial operations append protected audit rows recording actor, action, entity, before/after context where applicable, and operation metadata. Lightweight domain events (`campaign.funded`, `participant.earning_created`, `campaign.budget_low`, `campaign.budget_exhausted`, `refund.created`, `payout.requested`, `payout.completed`) support later notification and integration workers without introducing an event bus.

## Security boundary

- Browsers cannot insert, update, or delete wallets or ledger entries.
- Artists can read only wallets and entries for accounts/campaigns they manage.
- DJs see only their profile earnings wallet.
- Matatu crew see only their own authorized profile wallet; shared vehicle payout ownership can be introduced explicitly later.
- Payout destinations are owner/admin only, platform accounting is admin only, and configuration writes remain admin-only.
- Amounts submitted to an admin action are revalidated and calculated inside the locked database transaction. Participant reward amounts always come from server-side configuration.

## Future M-Pesa integration

An STK adapter will call the campaign funding service only after a verified, idempotent provider callback. A B2C adapter will consume an approved payout request and post completion or reversal exactly once. Provider signatures, callback storage, reconciliation, credential management, and live transfers are intentionally outside this prompt.
