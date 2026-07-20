# Architecture

## Stack

- Next.js App Router
- TypeScript
- Supabase Auth and PostgreSQL
- Supabase RLS for user-owned data
- Vercel Preview and production deployment
- Server-only API routes for AI and SQL practice adapters

## Content Flow

1. Source material is analyzed and recorded in `docs/CONTENT_SOURCE_ANALYSIS.md`.
2. Curated content is authored in structured TypeScript seed files.
3. Validation scripts check required fields, duplication, type distribution, concept links, and plan/trace sanity.
4. Migration schema supports moving content to Supabase tables with status/version/source metadata.
5. General users see only approved content.
6. Generated content enters review_required/admin flow before learner exposure.

## User Data Flow

Supabase Auth provides `auth.uid()`. User-owned tables store `user_id` and RLS policies restrict access to the owner. The browser should not rely on localStorage as the source of truth; local caching is only a resilience layer.

## SQL Practice Adapter

The system distinguishes:

- `oracle_simulation`: reconstructed Oracle plan/trace learning material.
- `postgres_explain`: optional PostgreSQL EXPLAIN for safe read-only practice, not Oracle proof.
- `oracle_sandbox`: future isolated Oracle runner, not implemented yet.
