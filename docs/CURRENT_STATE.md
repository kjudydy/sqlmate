# SQLMate Current State

## Branch and Baseline

- Current work branch: `feature/restore-pre-overhaul-ui`
- Baseline commit used for recovery: `e32814c Improve SQLP generation and concept tools`
- Preserved backup branch for the rejected overhaul: `backup/sqlp-platform-overhaul-20260720`
- Previous overhaul branch: `feature/sqlp-platform-overhaul`

`e32814c` was selected because it is immediately before the large platform overhaul commits and keeps the existing SQLMate flow:

- Dashboard
- 문제풀이
- SQL 실습
- 오답노트
- 개념정리
- 개인노트

The rejected overhaul introduced separate subject-level top menus, bookmarks, statistics, AI tutor, admin screens, and a larger platform-style IA. That direction is intentionally not used for this recovery branch.

## Current Technical State

- Framework: Next.js App Router, React, TypeScript
- Auth/storage: Supabase Auth and `study_state` JSONB table
- User data: answers, lab answers, todos, attempts, wrong notes, concept marks, notes, and extra question batches are stored in `study_state`
- RLS: `profiles`, `study_state`, and `problem_feedback` have owner-only policies in `supabase/schema.sql`
- SQL practice: PostgreSQL `EXPLAIN` can run only when `DATABASE_URL` is set; otherwise the UI shows local simulation
- Production is not modified from this branch

## Recovery Changes in This Branch

- Kept the previous visual design, spacing, sidebar style, cards, dashboard, note style, and responsive behavior.
- Removed `SQL 실습` from the top-level sidebar and made it reachable from inside `문제풀이`.
- Kept objective questions as click-select 필기 문제.
- Kept SQL input only in SQL 실습.
- Removed top highlight deletion chips from concept pages.
- Changed highlight deletion so clicking an already highlighted text removes only that mark.
- Added one clean `모든 마킹 지우기` button in the concept toolbar.
- Kept personal notes as simple title/body/tag notes, not a block editor.

## Database and RLS Impact

No destructive database change is required for this recovery branch.

The existing `study_state` JSON structure can preserve current user data. The rejected overhaul migration is not applied here.

