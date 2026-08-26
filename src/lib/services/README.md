# Services

Provider boundaries live here when Sauti adds external capabilities. Keep adapters grouped by capability (recognition, payments, TripLink, streaming and notifications) and expose domain-friendly interfaces to the application.

External provider IDs belong in `external_identifiers`, not on domain tables. Provider metadata is never the source of truth for Sauti ownership, qualification or accounting. No provider implementations are included at this stage.
