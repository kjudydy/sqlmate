# SQLMate Agent Guide

SQLMate is a Korean SQLP learning platform for concept study, advanced problem solving, SQL tuning practice, wrong-answer review, personal notes, and AI-assisted explanations.

## Current Rule Of Engagement

- Work on `feature/sqlp-platform-overhaul`.
- Do not merge to `main` and do not run production deploy before Preview verification.
- Do not delete production data.
- Do not expose service role keys, OpenAI keys, Supabase secrets, or Google OAuth secrets in client code or Git.
- Treat Oracle execution plans in the app as `Oracle simulation / reconstructed study material` unless an actual isolated Oracle sandbox is connected.
- User-owned data must be stored under Supabase Auth user id and protected by RLS.
- Approved content is visible to learners; generated or review-required content belongs in admin review flows.

## Commands

- Typecheck: `pnpm typecheck`
- Tests: `pnpm test`
- Build: `pnpm build`
- Preview deploy only: `pnpm dlx vercel --yes`

## Source Material

- Primary attached PDF: `C:/Users/LG/Downloads/105d86a3-c085-4b15-a217-d5d72210f2e4_3과목.pdf`
- Analysis: `docs/CONTENT_SOURCE_ANALYSIS.md`
- Current-state audit: `docs/CURRENT_STATE.md`

## Content Quality

First quality seed target:

- 1과목 10 approved questions
- 2과목 10 approved questions
- 3과목 10 approved questions
- SQLP practice 3 approved scenarios
- Concept documents 3 or more

Every question needs a subject, major/minor/detail topic, difficulty, type, answer, detailed explanation, wrong-answer notes, at least 3 hints, source type, status, version, and related concept id.

## Next Priority

1. Keep normalized migration in sync with app data needs.
2. Replace legacy single-file UI with normalized content-driven views.
3. Add Supabase persistence for attempts, wrong answers, highlights, annotations, todos, and block notes.
4. Add admin content review UI.
5. Keep content expansion halted if Oracle trace/plan consistency cannot be confidently verified.
