# Concept Curriculum

Date: 2026-07-20

원칙: SQLMate의 최상위 개념정리 구조는 현재처럼 `1과목`, `2과목`, `3과목`을 유지한다. Optimizer, Index, Join 같은 기술어를 최상위 메뉴로 분리하지 않는다.

## 1과목 데이터 모델링의 이해

### 데이터 모델링의 이해

- 모델링의 정의와 특징: 추상화, 단순화, 명확화
- 모델링의 세 가지 관점: 데이터 관점, 프로세스 관점, 데이터와 프로세스 상관 관점
- 데이터 모델링 3단계: 개념, 논리, 물리 모델링
- 데이터베이스 3단계 구조: 외부, 개념, 내부 스키마
- 데이터 독립성: 논리적 독립성, 물리적 독립성
- 좋은 데이터 모델의 조건: 중복 배제, 비유연성 제거, 비일관성 방지

### 엔터티와 속성

- 엔터티 정의, 인스턴스, 엔터티 후보 판단
- 유형/개념/사건 엔터티
- 기본, 중심, 행위 엔터티
- 속성 정의, 원자성, 다중값, 반복 속성
- 기본 속성, 설계 속성, 파생 속성
- 도메인과 속성값 검증
- NULL 허용과 SQL 결과 영향

### 관계와 식별자

- 관계 정의, 관계명, 관계 차수, 선택성
- 1:1, 1:M, M:M 관계 판단
- 식별 관계와 비식별 관계
- 주식별자 도출 기준: 유일성, 최소성, 불변성, 존재성
- 본질 식별자와 인조 식별자
- 관계 선택성이 조인 건수와 인덱스 설계에 미치는 영향

### 성능 데이터 모델링

- 정규화 목적과 이상 현상
- 1정규형, 2정규형, 3정규형, BCNF
- 반정규화 판단 기준과 위험
- 이력 모델, 집계 모델, 중복 컬럼
- 트랜잭션 모델링과 데이터 생명주기

## 2과목 SQL 기본 및 활용

### SQL 기본

- SELECT 논리 처리 순서
- WHERE, NULL, 3값 논리
- 비교 연산자, BETWEEN, IN, LIKE
- 날짜/문자/숫자 함수
- CASE, NVL, COALESCE, NULLIF
- GROUP BY, HAVING, 집계 함수
- ORDER BY와 정렬 기준
- DDL, DML, TCL, 제약조건

### SQL 활용

- 표준 조인과 Oracle 조인
- INNER, OUTER, CROSS, NATURAL JOIN
- OUTER JOIN 조건 위치
- 서브쿼리: 단일행, 다중행, 상관, 스칼라
- EXISTS, IN, NOT EXISTS, NOT IN과 NULL
- 집합 연산자
- 계층형 질의
- 윈도우 함수
- ROLLUP, CUBE, GROUPING SETS
- Top-N과 페이징

## 3과목 SQL 고급활용 및 튜닝

### 옵티마이저와 실행계획

- SQL 처리 과정: Parse, Bind, Execute, Fetch
- Hard Parse와 Soft Parse
- Library Cache와 Cursor 공유
- CBO, 통계정보, Histogram, Dynamic Sampling
- Selectivity, Cardinality, Cost
- Access Path, Join Order, Join Method
- DBMS_XPLAN과 실제 row source 통계

### 인덱스 튜닝

- B-Tree 구조: root, branch, leaf block
- 수직 탐색과 수평 탐색
- ROWID와 테이블 랜덤 액세스
- Unique, Range, Full, Fast Full, Skip Scan
- 결합 인덱스와 선두 컬럼
- 등치 조건, 범위 조건, 정렬 조건
- 클러스터링 팩터
- 인덱스 손익분기점
- 인덱스 스캔 효율화
- 테이블 액세스 최소화

### 조인 튜닝

- NL Join: 선행 집합, 후행 인덱스, 반복 횟수
- Sort Merge Join: 정렬 비용, 조인 조건
- Hash Join: Build Input, Probe Input, 메모리와 TEMP
- Semi Join, Anti Join, Outer Join
- 조인 순서와 힌트
- 대량 조인과 부분범위 처리

### Query Transformation

- View Merging
- Predicate Pushing / Pullup
- Subquery Unnesting
- OR Expansion
- Join Elimination
- Partition Pruning
- Group By Placement
- Top-N Pushdown
- 변환 제어 힌트

### SQL 분석과 고급 튜닝

- SQL Trace와 TKPROF
- Parse/Execute/Fetch call 분석
- CR, PR, current, query, elapsed, CPU
- 대기 이벤트
- Sort 메커니즘, PGA, One-pass, Multi-pass
- 대량 DML, Direct Path, APPEND, Exchange Partition
- Lock, Latch, MVCC, 동시성 제어

## 연결 정책

- 문제 해설은 관련 개념 ID로 이동한다.
- 개념 페이지는 관련 문제와 SQL 실습으로 연결한다.
- 실습은 Trace, 실행계획, Predicate, 인덱스/조인 관련 개념을 함께 연결한다.
