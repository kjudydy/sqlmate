# Concept Link Manual Progress

This file tracks small manual batches for problem-to-concept link cleanup.
Avoid running the full audit script unless explicitly requested.

## 2026-08-12

### Subject 1 manual pass completed

- Reviewed the first subject concept links in small batches.
- Added targeted concept content for normalization, history modeling, transaction modeling, super/subtype, and distributed database concepts.
- Added focused regression tests for the reviewed modeling batches.

### Subject 2 manual pass completed

- Reviewed SQL-basic concept links in three small batches.
- Batch 1 covered the first 40 SQL-basic questions and reinforced:
  - `sql-select`
  - `sql-group-functions`
  - `sql-group-having`
  - `sql-hierarchical-self-join`
  - `sql-pivot-unpivot`
- Batch 2 normalized broad legacy aliases:
  - `sql-group-by` -> `sql-group-having` or `sql-group-functions`
  - `sql-hierarchical` -> `sql-hierarchical-self-join`
  - `sql-pivot` -> `sql-pivot-unpivot`
  - `sql-transaction` -> `sql-tcl`
  - `sql-joins` -> `sql-standard-join`
- Batch 3 linked date and regexp function questions to more specific concepts:
  - date arithmetic and service-period conditions -> `sql-date`
  - REGEXP_INSTR -> `sql-regexp`
  - LENGTH/REPLACE character-count questions remain on `sql-functions`
- Added focused regression tests for the three SQL-basic batches.

### Subject 3 manual pass started

- Reviewed the first tuning batch in a narrow pass.
- Normalized obvious concept-link mismatches for:
  - Top-N and STOPKEY -> `tuning-top-n`
  - Partition Pruning -> `tuning-partition-pruning`
  - Bind Peeking and Adaptive Cursor Sharing -> `tuning-optimizer`
  - Hash Join Build Input -> `tuning-hash-join`
  - NL Join repeated-cost questions -> `tuning-nl-join`
- Added a focused regression test for these first tuning-batch links.
- Reviewed the second tuning batch in a narrow pass.
- Moved the latest-history SQL Rewrite case from the generic SQL window-function concept to `tuning-sql-rewrite`.
- Kept Local/Global partition index and Partition Exchange questions on `tuning-partitioning`, and added a focused regression test to protect that choice.
- Reviewed imported tuning expansion batches in a narrow pass.
- Normalized specific imported-batch links:
  - Buffer cache / latch / hot block -> `tuning-architecture`
  - TKPROF / SQL Trace / Wait Event headers -> `tuning-sql-trace`
  - Sort Operation removal -> `tuning-sort`
  - Top-N / STOPKEY only -> `tuning-top-n`
- Removed the overly broad partial-range Top-N heuristic so non-Top-N sort questions do not link to the wrong concept.
- Added a focused regression test for imported tuning expansion links.
- Reviewed imported tuning index questions in a narrow pass.
- Normalized specific index links:
  - composite index column order and access/filter predicate questions -> `tuning-composite-index`
  - Index Full Scan / Fast Full Scan / Skip Scan / IN-List Iterator questions -> `tuning-index-scan-efficiency`
- Added a focused regression test for imported tuning index links.
- Reviewed imported tuning join/concurrency/transformation questions in a narrow pass.
- Kept Hash Join, NL Join, query transformation, concurrency, cardinality, scalar subquery, and partition index questions on their specific concepts.
- Split Adaptive Cursor Sharing from generic optimizer matching:
  - Adaptive Cursor Sharing -> `tuning-sql-sharing`
  - Bind Peeking remains -> `tuning-optimizer`
- Added a focused regression test for imported tuning join/concurrency/transformation links.
- Added a representative problem-screen destination test for concept buttons users are likely to click:
  - NULL questions -> `sql-null`
  - constraint questions -> `sql-constraints`
  - identifier questions -> `sql-identifiers`
  - TCL and MERGE questions -> `sql-tcl` / `sql-dml`
  - window-function questions -> `sql-window-functions`

## Next Batch

- 2026-08-12 follow-up: audited subject 2 questions 1-30 with a narrow regression test.
- Confirmed each related-concept button in this range lands on a concept article containing the topic keywords needed for the question.
- Corrected subject 2 question 23 from the broad `sql-constraints` concept to `sql-ddl-constraints`, because the question is about defining constraints with `CREATE TABLE` / `ALTER TABLE`.
- 2026-08-12 follow-up: audited subject 2 questions 31-60 with a narrow regression test.
- Confirmed the range covers NULL/NVL, outer join counts, hierarchical queries, scalar subqueries, PIVOT, set operators, window functions, grouping, DML, date arithmetic, Top-N, CASE, and history joins.
- Strengthened `sql-subquery` so scalar subquery and EXISTS/NOT EXISTS questions land on a concept page that actually explains the tested behavior.
- 2026-08-12 follow-up: audited subject 2 questions 61-90 with a narrow regression test.
- Corrected NATURAL JOIN, outer join count, and DATE arithmetic questions to more precise concept destinations.
- Strengthened `sql-subquery`, `sql-where`, and `sql-window-functions` for inline views, tuple IN comparisons, LAG/LEAD, FIRST_VALUE, and NTILE.
- 2026-08-12 follow-up: audited subject 2 questions 91-121 with a narrow regression test.
- Corrected additional outer join, DATE arithmetic, latest-history join, HAVING, and GROUPING SETS/CUBE questions to their more precise concept destinations.
- Replaced the related concept bodies for `sql-where`, `sql-dcl`, and `sql-date` with readable Korean study blocks that cover LIKE/ESCAPE, tuple IN, ROLE/object privileges, DATE time arithmetic, and half-open date ranges.
- Continue with the next manual batch only when needed:
  - subject 3 follow-up batches
  - visible concept destinations from solved/wrong-note flows
  - avoid full-bank audit unless explicitly requested
