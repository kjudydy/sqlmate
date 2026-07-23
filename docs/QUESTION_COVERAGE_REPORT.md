# Question Coverage Report

Updated: 2026-07-23

## Objective Bank

| Subject | Total | Source Basis | Notes |
|---|---:|---|---|
| 1과목 데이터 모델링의 이해 | 100 | 59 extracted units | Original/Variant/Similar generated from owner PDFs |
| 2과목 SQL 기본 및 활용 | 100 | 177 extracted units | Richest source pool; SQL result and syntax topics dominate |
| 3과목 SQL 고급활용 및 튜닝 | 100 | 41 extracted units | Tuning source pool is smaller; Similar variants fill gaps |

## Version Mix

| Subject | Original | Safe Variant | Similar |
|---|---:|---:|---:|
| 1과목 | 34 | 33 | 33 |
| 2과목 | 34 | 33 | 33 |
| 3과목 | 34 | 33 | 33 |

## Representative Topics In Current First 100

### 1과목

- 데이터 모델링
- 엔터티
- 속성
- 파생 속성
- 도메인
- 관계
- 식별자
- 식별·비식별 관계
- 주식별자 도출 기준
- 정규화
- ERD 해석

### 2과목

- DDL
- DCL
- TCL
- 제약조건
- NULL
- JOIN
- GROUP BY
- CASE 표현식
- NVL과 COALESCE
- DISTINCT
- 집합 연산
- 서브쿼리
- 윈도우 함수

### 3과목

- SQL 튜닝
- JOIN
- GROUP BY
- 서브쿼리
- 집합 연산
- NVL과 COALESCE
- DISTINCT
- NULL
- TCL
- 문자 함수

## SQL Practice

| Count | Original | Safe Variant | Similar |
|---:|---:|---:|---:|
| 20 | 7 | 7 | 6 |

The practice set is generated from one explicit practice source unit plus tuning units. Every lab includes:

- business scenario
- schema/data distribution notes
- prompt
- expected SQL
- target plan
- Korean operation explanations
- trace stats
- predicate information
- trace summary
- rubric
- simulation notice

## Batch Extension

Objective extension:

- 20 questions per subject per batch.
- Batch id format: `extra-{subjectId}-pdf-{n}`.
- Extra questions are `review_required`.

SQL Practice extension:

- 20 labs per batch.
- Batch id format: `extra-practice-pdf-{n}`.
- Extra labs are `review_required`.

## Gaps To Improve

- Add exact multi-select objective scoring for PDF items with multiple answer marks.
- Manually clean OCR spillover in source choices for high-value Original items.
- Add more direct SQLP tuning/practice source units if future PDFs contain richer 실기 pages.
- Rebalance 3과목 toward optimizer, index, join, trace, lock after additional PDFs are extracted.
