# SQLMate Reference Site Analysis

Date: 2026-07-20
Branch: `feature/content-quality-pass`
Scope: only `문제풀이`, `개념정리`, `SQL 실습` internals. The restored SQLMate layout, menu structure, sidebar, dashboard, note flow, colors, and card style are intentionally preserved.

## Access Results

| URL | Access | Notes |
| --- | --- | --- |
| https://yunamom.tistory.com/394 | PASS | Readable. The page is a SQLD 57회 기출복원 article with one-question-at-a-time reconstruction flow, multiple-choice traps, SQL result inference, NULL/date/string function examples, and join/result-count reasoning. Used only for question-flow and trap-style analysis. |
| https://sqldyangpa.com/ | PASS | Readable. The site emphasizes no-login practice, round-based question sets, subject/theory navigation, CBT flow, and random/infinite quiz concepts. Used for focused practice flow and repeated-learning UX ideas, not for SQLP content copying. |
| https://velog.io/@yooha9621/series/SQLP%ED%95%84%EA%B8%B0%EC%97%B0%EC%8A%B5 | PASS | Readable. The series index exposes SQLP topic coverage across index tuning, join tuning, optimizer, SQL analysis, advanced SQL tuning, partitioning, lock, and transaction. Used for curriculum coverage checks. |
| https://valiant-sloth-306.notion.site/3-32d5d8fcf4aa805f92c9d825b5dfa735?source=copy_link | FAIL | Notion content was not accessible through the available browser/search path in this run. No content from this page is claimed as read. Use exported PDF/Markdown when available. |
| https://blog.naver.com/oracledo/220390350995 | FAIL | Direct page content was not accessible through the available browser/search path in this run. No content from this page is claimed as read. |

## Applied To Problem Solving

- Kept 필기 문제 as objective click-choice only.
- Added a reviewed first-quality seed set: 10 questions per subject, 30 total.
- Mixed question surfaces across passages, tables, SQL snippets, execution plans, Trace summaries, and 보기 조합형 style.
- Added choice-specific explanations for the reviewed seed set so wrong choices explain the actual misconception.
- Connected reviewed questions to concept article IDs where available.
- Preserved existing per-subject 100-question counts and subject-local extra-question expansion.

## Applied To Concept Study

- Preserved the subject-first structure: `개념정리 > 1과목/2과목/3과목 > 대단원 > 세부 개념`.
- Strengthened four high-impact concept pages without changing the concept UI:
  - `WHERE 절`
  - `인덱스 스캔 효율화`
  - `SQL 트레이스`
  - `쿼리 변환`
- Added dense textbook-style blocks with reading order, comparison tables, execution-plan/trace interpretation, and exam traps.

## Applied To SQL Practice

- Kept SQL writing only in the SQL practice area.
- Exposed existing lab hints directly in the lab screen as 단계별 힌트.
- Preserved existing Oracle-vs-simulation labeling. PostgreSQL/local simulation is not represented as actual Oracle execution.

## Copyright And Source Safety

- No source problem text, answer text, table, image, or code is copied verbatim.
- Reference materials were used to identify learning flow, topic coverage, and trap patterns.
- All new questions and explanations are original SQLMate content.
