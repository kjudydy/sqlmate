# SQLMate Content Source Analysis

작성일: 2026-07-20

## 1. 첨부 PDF 확인

- 파일명: `105d86a3-c085-4b15-a217-d5d72210f2e4_3과목.pdf`
- 위치: `C:\Users\LG\Downloads\105d86a3-c085-4b15-a217-d5d72210f2e4_3과목.pdf`
- 파일 크기: 1,648,383 bytes
- PDF 메타 제목: `3과목`
- 페이지 수: 44
- 생성 도구: HeadlessChrome / Skia PDF
- 분석 방법:
  - `pypdf`로 페이지 수와 메타데이터 확인
  - `pdfplumber`로 페이지별 텍스트, 키워드, 이미지 포함 여부 확인
  - Poppler `pdftoppm`으로 주요 페이지 PNG 렌더링
  - 이미지 포함 또는 실행계획이 밀집된 페이지를 시각 검토

## 2. 문서 제목과 전체 목차

문서의 표지/메타 기준 제목은 `3과목`이다. 명시적인 자동 목차 페이지는 없고, 페이지 흐름상 다음 순서로 구성되어 있다.

1. 실기 파티션 EXCHANGE 유형
2. DELETE 튜닝 및 대량 DML 대체 유형
3. 54회 실기 1번 UPDATE 튜닝 복기형
4. 54회 실기 2번 대량 INSERT/Parallel DML 복기형
5. 53회 실기 1번 COUNT STOPKEY/UNION ALL/부분범위 처리 복기형
6. 53회 실기 2번 MERGE 대체와 partition exchange 복기형
7. 52회 실기 1번 주문/배송/상품이력 NL OUTER 조인 및 WINDOW NOSORT STOPKEY 복기형
8. 52회 실기 2번 파티션/Hash Join/Group By 튜닝 복기형
9. SQL Trace 공식 정리
10. SQL 힌트 정리
11. Index Range Scan 가능/불가능 조건 정리
12. 부분범위 처리 및 고급 힌트 정리

## 3. 페이지별 핵심 주제 분류

| 페이지 | 핵심 주제 | 콘텐츠 활용 |
| --- | --- | --- |
| 1 | 제목 페이지 `3과목` | 문서 메타 확인 |
| 2 | EXCHANGE 파티션 실기, CTAS, NOLOGGING, PARALLEL, PARTITION 조건 | 실습: 파티션 교환/대량 적재 |
| 3 | `WITHOUT VALIDATION`, `ENABLE NOVALIDATE`, 정합성 검사 의미 | 개념: 제약조건 검증/파티션 교환 주의 |
| 4 | DELETE 튜닝, TRUNCATE로 대체 가능한 상황 | 실습: 대량 DELETE 대체 전략 |
| 5 | ENABLE NOVALIDATE 추가 설명, 인덱스 처리 | 개념: 제약조건 상태와 DML 영향 |
| 6 | 54회 1번, UPDATE/INSERT, Multi-table 또는 Hash Join 언급 | 실습 후보: UPDATE 튜닝 |
| 7 | 54회 2번, DELETE 튜닝 감각 | 실습 후보: DELETE/대량 DML |
| 8 | 54회 1번 환경 구성 시작 | 실습 DDL/데이터 생성 |
| 9 | T3/T1/T2 생성, PK/Index 구성 | 실습 DDL/인덱스 구성 |
| 10 | 목표 실행계획: UPDATE, HASH JOIN RIGHT SEMI, OR_EXPAND, UNION-ALL, T2_X1/T2_X2 | 실습: UPDATE Rewrite + OR Expansion |
| 11 | 모범 UPDATE 힌트: `SWAP_JOIN_INPUTS`, `FULL`, `OR_EXPAND`, `INDEX` | 개념/실습: 힌트와 서브쿼리 튜닝 |
| 12 | 54회 2번 환경: T_SRC/T_TGT | 실습 DDL/데이터 구성 |
| 13 | T_SRC/T_TGT 데이터 적재 | 실습 데이터 분포 |
| 14 | 목표 실행계획, NOLOGGING 언급 | 실습: 대량 INSERT 성능 목표 |
| 15 | 모범답안: TRUNCATE, INDEX UNUSABLE, PARALLEL DML, APPEND, INSERT ALL, REBUILD | 실습: 대량 적재와 인덱스 재빌드 |
| 16 | 53회 1번 TO-BE 실행계획 작성형, CR/PR/Index 언급 | 실습: 목표 실행계획 유도 |
| 17 | T2/T3 제약조건 및 PK 구성 | 실습 DDL |
| 18 | UNION ALL, ORDER BY, EXISTS, ROWNUM <= 10, TO-BE 실행계획 캡처 | 실습: COUNT STOPKEY/부분범위 처리 |
| 19 | 기존 조인 T1/T3, T2/T3를 T1/T4, T2/T4로 변경, 각 VIEW COUNT STOPKEY | 개념/실습: 조인 위치와 STOPKEY |
| 20 | 53회 2번 MERGE 대체, 파티션 | 실습: MERGE 대체/partition exchange |
| 21 | AS-IS MERGE, TO-BE INSERT plan, OUTER JOIN, exchange 과정 | 실습 핵심 |
| 22 | `t1_p202501` 생성, 답안 일부 | 실습 답안 구성 |
| 23 | partition exchange, drop table, index/partition 언급 | 실습 답안 구성 |
| 24 | 52회 1번 시작, 주문/배송/상품이력 구조 | 실습: 주문 조회 튜닝 |
| 25 | 이벤트명 `SQLP`, 주문/상품 관련 데이터 생성 | 실습 데이터 분포 |
| 26 | 배송 데이터, 통계/commit | 실습 데이터 분포 |
| 27 | 수정 전 실행계획: WINDOW NOSORT STOPKEY, NL OUTER, Predicate | 실습: 실행계획 분석 |
| 28 | 수정 후 실행계획: COUNT STOPKEY, INDEX RANGE SCAN DESCENDING, 상품이력_X2 | 실습: rewrite/힌트 |
| 29 | Predicate information, 배송번호 access, SQL/인덱스 | 실습: Access/Filter 판독 |
| 30 | 쿼리 수정: `leading`, `use_nl`, `index`, 상품이력 기간 조건 | 모범답안 후보 |
| 31 | 52회 2번 시작, 파티션 | 실습: 파티션/집계 튜닝 |
| 32 | 월별 파티션 정의 | 실습 DDL |
| 33 | 임시 상품, row_number, 데이터 생성 | 실습 데이터 분포 |
| 34 | 상품/주문 관련 데이터 생성 | 실습 데이터 분포 |
| 35 | 고객/상품/코드상세 조인, 집계 SQL | 실습: 조인/집계 |
| 36 | 수정 전 실행계획 일부: PARTITION RANGE ALL, Predicate, SUBSTR 주문번호 필터 | 실습: 파티션 Pruning 실패 분석 |
| 37 | 수정 후 실행계획: HASH JOIN RIGHT OUTER, HASH GROUP BY, PARTITION RANGE ITERATOR | 실습: Hash Join/Group By/Pruning |
| 38 | Predicate 상세, 힌트/조인/파티션 관련 | 실습 해설 |
| 39 | 수정 SQL 일부: 주문번호 범위, 고객/상품 조인 | 모범답안 후보 |
| 40 | SQL Trace 공식: rows/execute, block/fetch, soft/hard parse, query/current/disk | 개념/문제: TKPROF 수치 계산 |
| 41 | SQL 힌트: `no_unnest`, NL/Hash 등 | 개념: 힌트 카탈로그 |
| 42 | INDEX RANGE SCAN 불가능/가능 조건, 함수 변형, LIKE, 형변환, NULL, OR, 선두컬럼 | 개념/필기 문제 |
| 43 | 부분범위 처리, `use_nl`, `no_merge`, `push_pred`, `no_unnest` | 개념/실습 |
| 44 | 종료 페이지 `3과목` | 내용 없음 |

## 4. 개념 정리에 활용할 내용

- 파티션 교환:
  - CTAS로 구조 복사
  - `NOLOGGING`, `PARALLEL`, `APPEND`
  - `EXCHANGE PARTITION ... INCLUDING INDEXES WITHOUT VALIDATION`
  - `ENABLE NOVALIDATE`와 기존 데이터 검증 범위
  - 인덱스 unusable/rebuild 전략
- 대량 DML 튜닝:
  - DELETE를 보존 집합 CTAS/INSERT/EXCHANGE 방식으로 대체
  - MERGE의 update/delete/insert를 직접 수행하지 않고 결과 집합을 새 파티션으로 구성
  - Parallel DML 활성화/비활성화
- 실행계획 제어:
  - `COUNT STOPKEY`, `WINDOW NOSORT STOPKEY`
  - `UNION-ALL`, `OR_EXPAND`
  - `HASH JOIN RIGHT SEMI`, `HASH JOIN RIGHT OUTER`
  - `NESTED LOOPS OUTER`
  - `PARTITION RANGE ALL` vs `PARTITION RANGE ITERATOR`
  - `INDEX RANGE SCAN DESCENDING`, `INDEX UNIQUE SCAN`
- Predicate 해석:
  - Access Predicate와 Filter Predicate 분리
  - Outer Join 조건의 위치
  - 함수 조건(`SUBSTR`)으로 인한 파티션 pruning 실패
  - 기간 이력 조인 조건의 ON/WHERE 위치
- SQL Trace/TKPROF:
  - execute당 평균 rows
  - fetch당 평균 block
  - array size
  - soft parse/hard parse 계산
  - 전체 블록수, 물리 블록수, 논리 블록수
  - CPU 비율과 wait time
- 인덱스:
  - Index Range Scan 불가능 조건
  - 컬럼 변형, 시작점을 찾을 수 없는 LIKE, 형변환, NULL, OR 조건
  - 선두 컬럼 미사용과 Skip Scan 가능 조건
  - NULL 허용 컬럼을 위한 분기/UNION ALL 설계
- 힌트:
  - `LEADING`, `USE_NL`, `USE_HASH`
  - `NO_MERGE`, `PUSH_PRED`, `NO_UNNEST`
  - `OR_EXPAND`
  - `INDEX`, `FULL`
  - `SWAP_JOIN_INPUTS`

## 5. 실습 문제로 변환 가능한 내용

1. 파티션 교환 대량 적재 실습
   - 목표: DELETE/UPDATE 대신 신규 파티션 테이블 구성 후 exchange
   - 평가: DDL 순서, 제약조건, 인덱스 상태, validation 옵션
2. UPDATE 튜닝 실습
   - 목표: OR 조건과 상관 서브쿼리를 `OR_EXPAND`/인덱스 접근으로 분해
   - 평가: HASH JOIN RIGHT SEMI와 T2_X1/T2_X2 접근 유도
3. Parallel INSERT 실습
   - 목표: 인덱스 unusable, APPEND, PARALLEL DML, INSERT ALL, rebuild
   - 평가: 로깅/병렬/인덱스 유지 비용 설명
4. COUNT STOPKEY 실습
   - 목표: UNION ALL 각 분기에서 먼저 Top-N을 줄이고 최종 테이블 접근 최소화
   - 평가: STOPKEY 위치와 조인 순서
5. MERGE 대체 실습
   - 목표: AS-IS MERGE를 OUTER JOIN 기반 INSERT 대상 집합으로 전환
   - 평가: partition exchange까지 작성
6. 주문/배송/상품이력 조회 실습
   - 목표: WINDOW NOSORT STOPKEY, NL OUTER, 이력 기간 인덱스 접근
   - 평가: Outer Join 보존 조건과 기간 조건 위치
7. 파티션 pruning 실패 분석 실습
   - 목표: `SUBSTR(주문번호,1,6)` 필터를 범위 조건으로 변경
   - 평가: `PARTITION RANGE ALL`을 `PARTITION RANGE ITERATOR`로 개선
8. Trace 계산 문제
   - 목표: TKPROF 수치를 이용해 parse/fetch/execute 효율, LIO/PIO 계산
   - 평가: 공식 적용과 비효율 판단

## 6. 실행계획/Trace/TKPROF/인덱스/조인/힌트/Rewrite/동시성 분류

### 실행계획

- p10: UPDATE + HASH JOIN RIGHT SEMI + OR_EXPAND + UNION-ALL
- p18-p19: COUNT STOPKEY + UNION ALL + NL + T3 최종 접근
- p21-p23: INSERT 대상 구성 + Partition Exchange
- p27-p30: WINDOW NOSORT STOPKEY + NL OUTER + 상품이력 기간 조인
- p36-p38: PARTITION RANGE ALL 개선, HASH JOIN, HASH GROUP BY, PARTITION RANGE ITERATOR

### SQL Trace/TKPROF

- p40: TKPROF 계산 공식
- p16, p24-p29, p31-p38: CR/PR/Rows/Loop를 활용한 실행계획형 실습 후보

### 인덱스

- p9, p12-p13, p17, p24-p30, p42: PK/Index 구성, Range Scan 가능/불가능, Skip Scan 조건

### 조인

- p10-p11: HASH JOIN RIGHT SEMI
- p18-p19: NL 조인과 조인 위치 변경
- p21: OUTER JOIN
- p27-p30: NESTED LOOPS OUTER
- p35-p38: HASH JOIN, HASH JOIN RIGHT OUTER

### 힌트

- p11: `SWAP_JOIN_INPUTS`, `FULL`, `OR_EXPAND`, `INDEX`
- p15: `APPEND`, `PARALLEL`
- p30: `LEADING`, `USE_NL`, `INDEX`
- p41-p43: `NO_UNNEST`, `NO_MERGE`, `PUSH_PRED`

### SQL Rewrite

- DELETE/UPDATE/MERGE를 CTAS/INSERT/EXCHANGE로 대체
- OR 조건 분기와 `OR_EXPAND`
- 월/일자 함수 조건을 SARGable한 범위 조건으로 변경
- 이력 조건을 Outer Join 보존 위치에 배치
- Top-N을 조인 전에 적용하여 부분범위 처리

### 동시성

- PDF 본문에서 Lock/동시성 실습 자체는 거의 직접 다루지 않는다.
- p40에 SQL Trace 공식과 hard parse/soft parse가 있어 Library Cache 관점 개념으로 확장 가능하다.
- Lock/동시성 문제는 별도 전문가 가이드/성능 고도화 기반 자체 제작 콘텐츠로 보강해야 한다.

## 7. 시각 검토 페이지

다음 페이지는 PNG 렌더링 후 직접 시각 확인했다.

- p10: 실행계획 표와 UPDATE SQL 이미지 확인
- p15: Parallel INSERT 실행계획과 모범답안 이미지 확인
- p18: UNION ALL SQL과 TO-BE 실행계획 이미지 확인
- p21: AS-IS MERGE와 TO-BE INSERT 실행계획 이미지 확인
- p27-p28: 52회 1번 수정 전/후 실행계획 이미지 확인
- p36-p37: 파티션 pruning 실패/개선 실행계획 이미지 확인
- p40: SQL Trace 공식 페이지 확인
- p42: Index Range Scan 가능/불가능 조건 페이지 확인

## 8. 읽기 문제 및 불명확한 부분

- p1, p44는 제목/종료 페이지로 실질 텍스트가 거의 없다.
- p16, p19 일부 텍스트에 NUL 문자 또는 추출 깨짐이 있었다. 시각적으로는 맥락 확인이 가능하지만, 정확한 원문 수치로 화면에 노출할 때는 원문 재검수 필요.
- PDF 내 `Cost`, `Card`, `Bytes`, `Pstart/Pstop`는 일부 이미지 캡처가 줄바꿈되어 있어 텍스트 추출만으로는 정밀 재사용하면 안 된다.
- 일부 답안은 작성자 메모로 "답 틀릴수도 있음"이라고 표시되어 있다. 해당 부분은 approved 콘텐츠가 아니라 review_required 상태로 관리해야 한다.
- PDF에는 실제 Oracle SQL Trace 전체 표가 아니라 실행계획과 Trace 공식 중심 자료가 많다. SQLMate 실습의 Rows/Loop/CR/PR/time 수치는 PDF 범위와 Oracle 물리 법칙에 맞춰 자체 검수된 시뮬레이션 값으로 별도 표시해야 한다.

## 9. 콘텐츠 제작 원칙

- PDF 내용을 그대로 복사하지 않고, 유형/난이도/출제 포인트를 기준으로 SQLMate 원본 문제로 재편집한다.
- PDF에서 확인한 내용은 `source_type = user_pdf`로 기록한다.
- PDF 기반이지만 수치와 테이블명을 자체 변형한 문제는 `source_type = user_pdf_adapted`로 기록한다.
- 답안 확정이 불명확한 문제는 `review_required` 상태로 저장하고 일반 사용자에게 공개하지 않는다.
- Oracle에서 실제 실행하지 않은 계획은 `simulated_oracle_plan` 또는 `expected_oracle_plan`으로 명확히 표시한다.
