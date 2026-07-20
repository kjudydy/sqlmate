# SQLP Content Source Analysis

## Primary Attached PDF

- File: `105d86a3-c085-4b15-a217-d5d72210f2e4_3과목.pdf`
- Local analysis copy: `sqlp_subject3_tmp.pdf`
- Metadata title: `3과목`
- Page count: 44
- Text extraction: succeeded for all 44 pages
- Visual rendering: selected pages 27-29 and 36-38 were rendered and visually inspected

## Page Topic Map

| Pages | Main topic | Use in SQLMate |
| --- | --- | --- |
| 1, 44 | Section cover pages | No direct content use |
| 2-3 | Partition exchange flow, CTAS, NOLOGGING, PARALLEL, local/global index handling, `WITHOUT VALIDATION`, `UPDATE GLOBAL INDEXES` | SQL practice, partition concept |
| 4-5 | DELETE tuning, truncate/drop index/parallel DML/nologging/reinsert/rebuild flow, paging processing | SQL practice, DML tuning, Top-N/paging concept |
| 6-11 | 54회 실기 1 복기: multi-column update, OR condition, `OR_EXPAND`, `SWAP_JOIN_INPUTS`, `FULL`, scalar update rewrite | SQL practice, query transformation, OR expansion, update tuning |
| 12-15 | 54회 실기 2 복기: target table truncate, unusable index, parallel DML, multi-table insert all | SQL practice, large DML tuning |
| 16-19 | 53회 실기 1 복기: UNION ALL branches, `COUNT STOPKEY`, T1/T2/T3/T4 join rewrite | SQL practice, partial range processing, Top-N |
| 20-23 | 53회 실기 2 복기: merge/update/delete/insert workload, exchange partition strategy | SQL practice, partition exchange, batch rewrite |
| 24-30 | 52회 실기 1 복기: 주문/상품이력/주문상품/배송 schema, before/after execution plans, Predicate Information, index rewrite, `leading/use_nl/index/no_unnest` | SQL practice, index design, NL join, scalar subquery, access/filter predicate |
| 31-39 | 52회 실기 2 복기: fixed FROM order a,b,c,d,e,f, partition range all to iterator, full scans, hash join/right outer, grouped inline view, code detail joins | SQL practice, hash join, view/no_merge, partition pruning |
| 40 | SQL Trace formulas: rows/execute, block/fetch, array size, execute count vs parse count | Concept guide, trace interpretation questions |
| 41 | Hint notes: `NO_UNNEST`, scalar subquery cache, filter timing | Concept guide, practice hints |
| 42 | Index range scan blockers: column transformation, leading wildcard, implicit conversion, `IS NULL` limits | Concept guide, objective questions |
| 43 | Partial range processing: inline view group by, `use_nl`, `no_merge`, `push_pred`, scalar subquery `no_unnest`, `index_desc` | Concept guide, SQL practice |

## Practice Content Candidates

- Partition exchange with CTAS and index handling
- Large DELETE converted to truncate/reinsert/rebuild strategy
- Multi-column update with OR expansion
- Parallel insert all into target table
- UNION ALL Top-N with repeated `COUNT STOPKEY`
- Exchange partition replacing high-volume merge/update/delete workload
- Order/product-history lookup with outer join condition placement and scalar delivery lookup
- Fixed-table-order hash join aggregation with code detail outer joins
- SQL Trace interpretation using rows, execute, fetch, CR, PR, and array size

## Concept Content Candidates

- Partition pruning and exchange partition
- Direct path insert, NOLOGGING, parallel DML
- Index usability and global/local index maintenance
- Access Predicate vs Filter Predicate
- Index range scan failure patterns
- Top-N and partial range processing
- Query transformation: OR Expansion, View Merging, Predicate Pushing, Subquery Unnesting
- Join method control: Nested Loops, Hash Join, right outer hash join
- SQL Trace/TKPROF metric interpretation
- Scalar subquery cache and `NO_UNNEST`

## Visual Inspection Notes

- Pages 27-29 show before/after execution plans and Predicate Information for the 52회 1번 order/product-history scenario.
- Pages 36-38 show partition range all/iterator, full table scans, hash joins, Predicate Information, and a candidate answer using `no_merge`, `use_hash`, `full`, and `swap_join_inputs`.
- Rendered images are temporary analysis artifacts under `tmp_pdf_pages/` and are not intended for production content.

## Copyright and Source Use

The PDF is user-provided study material. SQLMate should not paste full original text or screenshots into the app. It should convert the observed patterns into original explanations, original objective questions, and original practice scenarios.

## 2026-07-20 Reference Pass

- `https://yunamom.tistory.com/394` was accessible and used to analyze one-question reconstruction flow, SQL result inference, NULL/date/string traps, and choice-based explanation style.
- `https://sqldyangpa.com/` was accessible and used to analyze focused practice flow, subject navigation, repeated quiz UX, and immediate-solving patterns.
- `https://velog.io/@yooha9621/series/SQLP%ED%95%84%EA%B8%B0%EC%97%B0%EC%8A%B5` was accessible and used to cross-check 3과목 coverage such as index tuning, join tuning, optimizer, SQL analysis, advanced tuning, lock, and transaction.
- The user-provided Notion link was not accessible in this run. No Notion-only content is claimed as read.
- The Naver blog direct page was not accessible in this run. No Naver-only content is claimed as read.
- New reviewed seed questions are original SQLMate content and do not copy source problems, answer text, or tables.
