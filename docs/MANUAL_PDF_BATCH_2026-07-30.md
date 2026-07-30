# Manual PDF Batch QA - 2026-07-30

## Scope

- Added 20 subject-2 objective questions.
- Added 20 subject-3 objective questions.
- Added 5 SQL Practice questions.
- Source handling: manual visual comparison against rendered PDF pages, not blind OCR extraction.
- UI scope: no layout/menu redesign.

## Added Objective Questions

### Subject 2

- Added numbers after the existing published set.
- Covered set operators, outer join counts, date arithmetic, period join predicates, latest-history SQL, window functions, hierarchical query, ROLLUP, MERGE, NULL with NOT IN, ANSI outer join condition placement, PIVOT, and ROWS/RANGE.
- Material-heavy questions store SQL/table data in separated fields instead of collapsing text into the question stem.

### Subject 3

- Added numbers after the existing published set.
- Covered execution-plan interpretation, index access, composite index order, local/global prefixed partition indexes, partition pruning, lock and blocking, APPEND Direct Path Insert, UPDATE/MERGE tuning, SQL Trace, optimizer cardinality, NL/Hash Join, OR Expansion, and Index Skip Scan.
- Added SQL-choice and execution-plan style questions to reduce the previous imbalance toward short concept-only questions.

## Added SQL Practice

- Added 5 practice cases:
  - 지점별 월별 누적매출 SQL 작성
  - 기준일 현재 고객 최신 이력 조회
  - 월별 Range 파티션 조건 Rewrite
  - 상관 UPDATE를 MERGE로 재작성
  - APPEND INSERT의 대기 원인 분석
- Practice problems no longer force the same schema/target-plan/template fields on every item.
- Running-total practice includes both source table and target result table.

## Fixed/Preserved

- Existing 2과목 43번 multi-table outer join display remains split into EMP and DEPT tables.
- Existing 실기6 source/target-table display remains split into source and target tables.
- Personal note rich editing from the prior change is preserved.

## Automated Scan Results

- `findPublishedUserVisibleIssues()` returned no published user-visible metadata or broken-text issues in tests.
- Exact duplicate and semantic-template duplicate guard passed in `tests/problem-bank.test.ts`.
- Published count after this batch:
  - 1과목: 100
  - 2과목: 120
  - 3과목: 120
  - SQL Practice: 32

## Manual Review Notes

- The new 45 items were manually composed from visually rendered PDF pages and user-provided screenshots.
- Existing older questions beyond this batch were automatically scanned for broken text, exposed metadata, collapsed SQL/table content, exact duplicates, and likely template duplicates.
- No automated blocker was detected, but full semantic PDF-to-screen review of all existing 340 objective questions and 32 practice cases is still a separate manual QA task.

## Test Result

- `vitest run tests/problem-bank.test.ts`: PASS, 13 tests.
