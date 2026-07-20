# Database

Migration draft: `supabase/migrations/20260720000000_sqlp_platform_schema.sql`

## Core Tables

- `profiles`
- `admin_roles`
- `subjects`
- `topics`
- `content_sources`
- `concept_documents`
- `questions`
- `question_choices`
- `question_hints`
- `practice_scenarios`
- `practice_hints`
- `attempts`
- `practice_submissions`
- `wrong_answer_items`
- `bookmarks`
- `highlights`
- `annotations`
- `personal_notes`
- `note_blocks`
- `todo_items`
- `learning_sessions`
- `ai_feedback`
- `content_versions`
- `audit_logs`

## RLS Principles

- Content tables expose approved rows to authenticated users and all states to admins.
- User-owned tables use `auth.uid() = user_id`.
- Admin rights use `admin_roles`, not hardcoded email addresses.
- Service role keys must never be used in client code.

## Migration Notes

This migration is written as a reviewable draft. It has not been applied to production in this branch. Before applying, back up the project, run the migration on a preview/staging database if available, then verify RLS with two separate test users.
