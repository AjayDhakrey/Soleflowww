-- Normalize malformed legacy Auth records without changing passwords or confirmation state.
-- https://supabase.com/docs/guides/troubleshooting/scan-error-on-column-confirmation_token-converting-null-to-string-is-unsupported-during-auth-login-a0c686
UPDATE auth.users
SET confirmation_token=COALESCE(confirmation_token,''),
    recovery_token=COALESCE(recovery_token,''),
    email_change_token_new=COALESCE(email_change_token_new,''),
    email_change=COALESCE(email_change,'')
WHERE confirmation_token IS NULL OR recovery_token IS NULL OR email_change_token_new IS NULL OR email_change IS NULL;
