# Notifications and activity

Sauti writes important domain feedback through `enqueue_notification`, not page components. The function creates a deduplicated transactional outbox item. A small database dispatcher materializes the in-app notification; failures remain visible in the outbox without undoing the campaign, play, request, or financial action.

Notifications are recipient-specific and activity events describe feed-safe domain actions. Activity visibility is `PRIVATE`, `PARTICIPANTS`, `PUBLIC`, or `ADMIN`; fraud evidence never enters participant/public feed metadata. Campaign play milestones replace per-play Artist spam.

In-app delivery is implemented. Preferences cover campaigns, earnings, requests, followers, and music discovery. Account/security messages cannot be disabled. Push, email, SMS, and WhatsApp flags are reserved but no external channel is connected.

Supabase Realtime is scoped to the signed-in user's notification rows. It refreshes the bell/count and notification centre; ordinary server queries remain the source of truth when Realtime is unavailable.
