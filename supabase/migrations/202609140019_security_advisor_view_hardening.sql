alter view public.public_profiles set (security_invoker=true);
alter view public.public_artist_accounts set (security_invoker=true);
alter view public.public_songs set (security_invoker=true);
alter view public.admin_risk_metrics set (security_invoker=true);

comment on view public.public_profiles is 'Public-safe profile projection evaluated with caller permissions.';
comment on view public.public_artist_accounts is 'Public-safe artist projection evaluated with caller permissions.';
comment on view public.public_songs is 'Public-safe approved-song projection evaluated with caller permissions.';
comment on view public.admin_risk_metrics is 'Admin risk summary evaluated with caller permissions.';
