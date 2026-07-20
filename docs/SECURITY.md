# Security

## Secrets

- `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` may be client-visible.
- Service role keys, OpenAI API keys, Google OAuth secrets, and database passwords must remain server-side only.

## RLS

All user-owned tables must use `auth.uid() = user_id` policies. Admin rights are table-driven through `admin_roles`.

## SQL Execution

Learner SQL must not run against the production application database. The current SQL practice system is simulation-first. PostgreSQL execution, if enabled, must be read-only and bounded by statement timeout.

## Audit

Admin content status changes and sensitive content operations should write to `audit_logs`.
