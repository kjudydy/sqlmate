# SQLMate Concept Curriculum

This curriculum keeps the existing `개념정리` top-level menu and organizes content by SQLP subject, then major topic, then detailed concept.

## 1과목 데이터 모델링의 이해

### 데이터 모델링의 이해

- 데이터 모델링의 정의, 목적, 특징
- 모델링의 세 가지 관점: 데이터, 프로세스, 상관
- 데이터 모델링의 중요성: 파급효과, 간결한 표현, 데이터 품질
- 데이터 모델링 유의점: 중복, 비유연성, 비일관성
- 개념/논리/물리 데이터 모델링
- 데이터베이스 3단계 구조: 외부/개념/내부 스키마
- 논리적 독립성과 물리적 독립성
- 좋은 데이터 모델의 조건

### 엔터티

- 엔터티 정의와 성립 조건
- 업무 엔터티와 집합성
- 유형/개념/사건 엔터티
- 기본/중심/행위 엔터티
- 엔터티 명명 기준과 기출 함정

### 속성

- 속성 정의와 원자성
- 기본/설계/파생 속성
- 단일값/다중값 속성
- 도메인과 NULL
- 속성 분해와 반복 속성 제거

### 관계

- 관계 정의, 관계명, 관계차수, 선택성
- 식별 관계와 비식별 관계
- 1:1, 1:M, M:N 관계 해소
- 필수/선택 관계와 외래키 NULL
- ERD 해석 문제 풀이 순서

### 식별자

- 주식별자 특성: 유일성, 최소성, 불변성, 존재성
- 본질식별자, 인조식별자, 보조식별자, 외부식별자
- 식별자 도출 기준
- 복합식별자와 성능 영향

### 정규화와 반정규화

- 1NF, 2NF, 3NF, BCNF
- 함수 종속과 부분/이행 종속
- 정규화의 장점과 조인 증가 비용
- 반정규화 대상과 절차
- 중복 컬럼, 파생 컬럼, 이력 테이블, 집계 테이블

## 2과목 SQL 기본 및 활용

### SQL 기본

- SELECT 논리 처리 순서
- WHERE 조건, NULL, 3-valued logic
- 비교 연산자, BETWEEN, IN, LIKE
- 단일행 함수: 문자, 숫자, 날짜, 변환, NULL 함수
- CASE, DECODE, NVL, COALESCE, NULLIF
- ORDER BY와 alias/position
- DML, TCL, DDL, DCL 기본

### SQL 활용

- 집계 함수, GROUP BY, HAVING
- ROLLUP, CUBE, GROUPING SETS, GROUPING
- JOIN: INNER, OUTER, CROSS, NATURAL, USING
- Oracle old outer join `(+)` condition placement
- 서브쿼리: single-row, multi-row, correlated, scalar
- EXISTS/NOT EXISTS, IN/NOT IN and NULL
- 집합 연산: UNION, UNION ALL, INTERSECT, MINUS
- 윈도우 함수: rank, dense_rank, row_number, aggregate window
- 계층형 질의 and recursive thinking
- Top-N and paging

## 3과목 SQL 고급활용 및 튜닝

### SQL 처리 구조

- Parse, Bind, Execute, Fetch
- Hard parse and soft parse
- Cursor, library cache, shared pool
- SGA, PGA, buffer cache overview
- DB Call and array fetch
- SQL Trace and TKPROF metrics

### 옵티마이저

- RBO/CBO distinction
- Query transformation
- Statistics, selectivity, cardinality, cost
- Access path, join order, join method
- Hint syntax and scope

### 인덱스 튜닝

- B-tree index structure
- Index range scan, unique scan, full scan, fast full scan, skip scan
- Composite index column order
- Index scan efficiency
- Table random access minimization
- Clustering factor
- Index range scan blockers: column transformation, leading wildcard, implicit conversion, `IS NULL`
- Access Predicate vs Filter Predicate

### 조인 튜닝

- Nested Loops Join
- Sort Merge Join
- Hash Join
- Semi/anti join
- Outer join preservation
- Join order and driving row source
- `leading`, `use_nl`, `use_hash`, `swap_join_inputs`

### SQL Rewrite and Transformation

- Subquery unnesting and `no_unnest`
- View merging and `no_merge`
- Predicate pushing and `push_pred`
- OR expansion and `OR_EXPAND` / `USE_CONCAT`
- Scalar subquery cache
- UNION ALL branch pruning and Top-N

### Partition, DML, and Batch Tuning

- Partition pruning and PSTART/PSTOP
- Exchange partition
- Local/global index behavior
- NOLOGGING, APPEND, direct path insert
- Parallel DML
- Large delete/update rewrite
- Index unusable/rebuild strategy

### Sort, Hash, and Partial Range Processing

- Sort elimination
- Group by placement
- Hash group by
- `COUNT STOPKEY`
- `index_desc`
- Paging and deterministic ordering

### Lock and Concurrency

- Transaction isolation basics
- Row lock, table lock, enqueue
- Latch vs lock
- MVCC concept
- Deadlock and blocking sessions

## Current Site Mapping

- `lib/concepts.ts` already contains subject-based concept documents and should remain under the single `개념정리` menu.
- Concept documents should be improved inside this hierarchy rather than by creating new top-level technical menus.
- Related practice questions should link back to the closest detailed concept whenever the UI adds concept links.

