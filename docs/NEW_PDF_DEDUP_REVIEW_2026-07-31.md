# New PDF Dedup Review - 2026-07-31

## Source PDFs

- `sqlp_53_exam_reconstruction.pdf`
  - Pages: 6
  - Used for: 3과목 DBMS_XPLAN / ALLSTATS LAST reinforcement
- `sqlp_advanced_exam.pdf`
  - Pages: 7
  - Used for: 3과목 advanced objective questions and SQL Practice additions
- `SQLP_Subject3_Advanced_20Questions.pdf`
  - Pages: 11
  - Used for: 3과목 advanced objective questions

All pages were rendered to PNG under `tmp/new-pdf-audit/` and text extraction was checked. The added questions are stored as structured text, SQL, and choices. Full PDF page screenshots are not shown in the user-facing quiz.

## Added Objective Questions

| Subject | New Number | Source | Source Q | Topic | Mode |
|---|---:|---|---:|---|---|
| 3과목 | 119 | `sqlp_advanced_exam.pdf` | 1 | DB 버퍼 캐시와 Latch | original |
| 3과목 | 120 | `sqlp_53_exam_reconstruction.pdf` | 3 | DBMS_XPLAN ALLSTATS LAST | original |
| 3과목 | 121 | `sqlp_advanced_exam.pdf` | 3 | NL Join Prefetch와 반복 액세스 | original |
| 3과목 | 122 | `sqlp_advanced_exam.pdf` | 5 | Range-Hash Composite Partition Pruning | original |
| 3과목 | 123 | `sqlp_advanced_exam.pdf` | 6 | Parallel Granule과 Redistribution | original |
| 3과목 | 124 | `sqlp_advanced_exam.pdf` | 7 | CBO 통계정보와 Density | original |
| 3과목 | 125 | `SQLP_Subject3_Advanced_20Questions.pdf` | 1 | 선분이력 조인 조건 | original |
| 3과목 | 126 | `SQLP_Subject3_Advanced_20Questions.pdf` | 2 | 실행계획 Operation 매칭 | original |
| 3과목 | 127 | `SQLP_Subject3_Advanced_20Questions.pdf` | 16 | PUSH_SUBQ 힌트 | original |
| 3과목 | 128 | `SQLP_Subject3_Advanced_20Questions.pdf` | 17 | 결합 인덱스 컬럼 순서 | original |
| 3과목 | 129 | `SQLP_Subject3_Advanced_20Questions.pdf` | 18 | Sort Operation 제거 | original |

## Added SQL Practice

| New Number | Source | Source Q | Topic | Reason Kept |
|---:|---|---:|---|---|
| 33 | `sqlp_advanced_exam.pdf` | 11 | 인덱스 재설계 | Evaluates one composite index design against three SQL patterns and covering-index reasoning. |
| 34 | `sqlp_advanced_exam.pdf` | 15 | 고객별 Top-N Stopkey | Evaluates per-group latest-row retrieval using `CROSS APPLY`/Stopkey, distinct from simple paging Top-N problems. |

## Duplicates Or Near-Duplicates Not Added

These source questions were not added in this batch because the existing bank already covers the same main judgment path or a very close structure:

- `sqlp_53_exam_reconstruction.pdf`
  - Q1 Data Buffer Cache: covered by architecture basics; low incremental value.
  - Q2 Direct Path I/O: overlaps existing Direct Path questions.
  - Q5 Direct Path Insert Lock: overlaps existing Direct Path / APPEND lock questions.
  - Q6 Dynamic Pruning: overlaps existing partition pruning and Pstart/Pstop questions.
  - Q7 Array Processing: overlaps existing Fetch Call / Array Size question.
  - Q8 Parallel Server count: overlaps existing parallel execution basics.
- `sqlp_advanced_exam.pdf`
  - Q2 index access/filter: overlaps existing Access Predicate and Filter Predicate items.
  - Q4 Unnesting / `NL_SJ`: overlaps existing Unnesting and Semi Join hint questions.
  - Q8 Direct Path Insert: overlaps Direct Path Insert feature/lock questions.
  - Q9 Read Committed: not a priority for 3과목 expansion compared with tuning-specific items.
  - Q10 Partial Range Processing: overlaps existing COUNT STOPKEY / partial range questions.
  - Labs Q12-Q14: overlap existing Hash Join hint, OR Expansion, and scalar-subquery rewrite labs.
- `SQLP_Subject3_Advanced_20Questions.pdf`
  - Q3 UNION vs UNION ALL: already represented by a previously added structured UNION/UNION ALL item.
  - Q4 `pq_distribute`: overlaps existing parallel distribution question.
  - Q6 Access Predicate: overlaps multiple Access/Filter Predicate items.
  - Q7 Unnesting: overlaps existing Unnesting hint items.
  - Q8 Scalar Subquery: overlaps existing scalar-subquery caching/rewrite items.
  - Q9 Hash Join Build Input: overlaps existing Hash Join build/probe items.
  - Q10 Skip Scan: overlaps existing Skip Scan items.
  - Q11 Sort Merge Join: overlaps existing Sort Merge vs Hash Join comparison.
  - Q12 `NO_MERGE`: overlaps existing View Merging/NO_MERGE item.
  - Q13 Bind Peeking: overlaps existing Bind Peeking / ACS questions.
  - Q14 SARGable condition: overlaps existing column transformation item.
  - Q15 Partition Pruning: overlaps existing partition pruning condition items.
  - Q19 ROWNUM Stopkey: overlaps existing Top-N/COUNT STOPKEY items.
  - Q20 Result Cache: overlaps existing Result Cache items.

## Validation

- TypeScript: PASS
- Problem bank audit: PASS
  - Objective issues: 0
  - Lab issues: 0
  - Added objective count: 11
  - Added lab count: 2

