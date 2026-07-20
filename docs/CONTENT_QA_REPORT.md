# SQLMate Content QA Report

## Scope

This QA report applies to the restored UI branch based on `e32814c`.

## UI and Flow QA

| Item | Result | Notes |
| --- | --- | --- |
| Restore previous design direction | PASS | Kept the existing sidebar, cards, dashboard layout, note layout, colors, and typography from `e32814c`. |
| Remove subject-level top menus | PASS | The rejected overhaul branch is not used. |
| Remove bookmark/statistics/AI tutor top menus | PASS | These menus do not exist on the restored branch. |
| Keep problem-solving under one menu | PASS | Top-level sidebar uses `문제풀이`; SQL lab is now reachable inside that flow. |
| Keep personal note simple | PASS | Notes remain title/body/tag based, not block-editor based. |
| Highlight chip removal | PASS | Top individual deletion chips were removed. |
| Individual mark deletion | PASS | Clicking an existing highlighted text removes only that highlight. |
| Clear all marks | PASS | One `모든 마킹 지우기` button exists in the concept toolbar. |

## Objective Question QA

| Item | Result | Notes |
| --- | --- | --- |
| 1과목 100 questions | PASS | Covered by `tests/problem-bank.test.ts`. |
| 2과목 100 questions | PASS | Covered by `tests/problem-bank.test.ts`. |
| 3과목 100 questions | PASS | Covered by `tests/problem-bank.test.ts`. |
| Objective questions require click selection | PASS | `ObjectiveQuestion` uses choices and one answer; no SQL textarea is rendered in objective question view. |
| SQL writing is separated into SQL practice | PASS | SQL textarea exists only in the lab view. |
| Extra questions are subject-local | PASS | Existing tests verify independent 20-question batches per subject. |
| Exact official exam-copy risk | PASS | Current content is original/reconstructed-style, not copied official questions. |
| Depth and final exam fitness | REVIEW REQUIRED | Question pool is structurally ready, but content should keep being edited from PDF and official range. |

## SQL Practice QA

| Item | Result | Notes |
| --- | --- | --- |
| 20 lab questions | PASS | Covered by `tests/problem-bank.test.ts`. |
| Lab-only SQL input | PASS | SQL editor exists only in `section === "lab"`. |
| Execution plan simulation label | PASS | UI labels local mode as simulation when no `DATABASE_URL` exists. |
| PDF-derived practice topics | PASS | Existing lab pool includes partition, Top-N, index, no_merge, COUNT STOPKEY, exchange partition, and Predicate Information patterns. |
| Actual Oracle execution | REVIEW REQUIRED | No Oracle sandbox is connected. The app must not claim actual Oracle execution. |

## Concept QA

| Item | Result | Notes |
| --- | --- | --- |
| Subject-first concept organization | PASS | Concepts are selected under 1/2/3 subject tabs inside one `개념정리` menu. |
| Avoid generic repeated labels | PASS | Existing tests reject repetitive labels such as `핵심 정의:` and `세부 포인트`. |
| Curriculum document created | PASS | See `docs/CONCEPT_CURRICULUM.md`. |
| Full SQLP coverage | REVIEW REQUIRED | The curriculum is mapped; individual concept depth should continue improving without changing IA. |

