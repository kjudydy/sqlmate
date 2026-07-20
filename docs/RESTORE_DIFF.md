# Restore Diff

## Rejected Overhaul

The rejected branch `feature/sqlp-platform-overhaul` added a broad learning-platform IA:

- Separate top-level subject menus
- SQLP concept platform page
- Mock exam page
- Bookmark page
- Learning statistics page
- AI tutor page
- User settings page
- Admin content page
- Large new schema migration

The user clarified that this changed SQLMate away from the intended product.

## Restored Direction

The branch `feature/restore-pre-overhaul-ui` starts from `e32814c` and keeps the previous SQLMate shape:

- Dashboard
- 문제풀이
- 오답노트
- 개념정리
- 개인노트

SQL 실습 remains a feature, but it is no longer exposed as a separate top-level sidebar item. It is reachable from the `문제풀이` flow.

## Preserved Data

No user data deletion is performed. Existing Supabase `study_state` JSONB data remains compatible.

