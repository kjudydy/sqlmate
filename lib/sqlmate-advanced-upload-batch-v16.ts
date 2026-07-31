import type { ChoiceId, Difficulty, ObjectiveQuestion, SubjectId } from "@/lib/types";

type AdvancedUploadQuestion = {
  subjectId: SubjectId;
  number: number;
  majorTopic: string;
  middleTopic: string;
  topic: string;
  difficulty: Difficulty;
  questionType: string;
  mode: "original" | "variant" | "similar";
  sourceDocument?: string;
  sourcePage: number;
  sourceQuestionNumber?: number;
  parentQuestionId?: string;
  stem: string;
  passage?: string;
  code?: string;
  table?: ObjectiveQuestion["table"];
  tables?: ObjectiveQuestion["tables"];
  choices: Array<[ChoiceId, string, string]>;
  answer: ChoiceId;
  relatedConceptId: string;
  hint: [string, string, string];
  explanation: string;
};

const sourceDocument = "sqlmate_sqlp_advanced_exam.pdf";

export const sqlmateAdvancedUploadObjectiveBatch16: AdvancedUploadQuestion[] = [
  {
    subjectId: "modeling",
    number: 101,
    majorTopic: "데이터 모델링과 성능",
    middleTopic: "반정규화",
    topic: "반정규화 유형과 식별 관계",
    difficulty: "상급",
    questionType: "모델링 성능 판단형",
    mode: "original",
    sourceDocument,
    sourcePage: 6,
    sourceQuestionNumber: 3,
    stem:
      "다음은 쇼핑몰 시스템의 주문과 주문배송 엔티티 간 관계 데이터 모델 및 성능 튜닝 요구사항이다. 데이터 모델링 관점에서 반정규화 절차 및 무결성 제약조건에 대한 설명으로 가장 적절하지 않은 것은?",
    passage:
      "주문배송은 주문 1건당 평균 1.2건 생성되며 택배사 분할 배송이 가능하다. 배송 현황 조회 화면은 주문 기간과 배송 상태를 조건으로 주문과 배송 정보를 함께 조회한다.",
    table: {
      title: "엔티티 구성",
      headers: ["엔티티명", "주요 속성 / PK, FK 구성", "일 평균 발생량 및 특징"],
      rows: [
        ["주문(ORDERS)", "ORDER_NO(PK), CUST_ID, ORDER_DATE, TOTAL_AMT, STATUS", "일 50,000건 생성, 1차 정규화 완료"],
        [
          "주문배송(ORDER_DELIVERY)",
          "ORDER_NO(PK, FK), DELIVERY_SEQ(PK), TRACKING_NO, COURIER_CODE, DELIVERY_STATUS, COURIER_NAME",
          "주문 1건당 평균 1.2건 배송 생성, 택배사 분할 배송 가능"
        ]
      ]
    },
    code: `SELECT o.order_no, o.order_date, d.tracking_no, d.courier_name
FROM   orders o
JOIN   order_delivery d ON o.order_no = d.order_no
WHERE  o.order_date BETWEEN :st AND :ed
AND    d.delivery_status = 'IN_TRANSIT';`,
    choices: [
      [
        "A",
        "반정규화를 고려하기 전에 먼저 인덱스 추가, 파티셔닝, 클러스터링, 응용 프로그램 캐싱 등 데이터 모델 변경 없는 성능 향상 방안을 검토해야 한다.",
        "맞는 설명이다. 반정규화는 데이터 중복과 정합성 관리 비용을 동반하므로 정규화 구조를 유지한 튜닝 방안을 먼저 검토한다."
      ],
      [
        "B",
        "ORDER_DELIVERY 테이블의 COURIER_NAME 속성은 택배사 코드(COURIER_CODE)에 결정되는 함수적 종속 관계를 가지므로, 이를 ORDER_DELIVERY에 직접 저장한 것은 3정규형 위반 및 컬럼 중복 반정규화에 해당한다.",
        "맞는 설명이다. COURIER_CODE가 COURIER_NAME을 결정한다면 일반 속성 간 이행 함수 종속이므로 별도 코드 테이블 분리 대상이다."
      ],
      [
        "C",
        "배송 조회 SQL의 조인 성능 저하를 해결하기 위해 ORDER_DELIVERY 테이블에 ORDER_DATE 컬럼을 중복하여 복사해 두고 ORDERS 테이블과의 조인을 제거하는 것은 관계 반정규화에 속한다.",
        "틀린 설명이다. 타 테이블의 특정 컬럼을 복사해 저장하는 것은 컬럼 반정규화, 특히 중복 컬럼 추가에 가깝다. 관계 반정규화는 중복 FK 관계를 추가해 조인 경로를 단축하는 방식이다."
      ],
      [
        "D",
        "정규화를 철저히 수행하면 데이터 중복이 제거되어 데이터 무결성은 향상되지만, 조인 연산 증가로 인해 조회 성능이 저하될 수 있으므로 성능 관점의 검토가 필수적이다.",
        "맞는 설명이다. 정규화는 무결성 측면의 장점이 크지만 조회 경로와 조인 비용도 함께 검토해야 한다."
      ]
    ],
    answer: "C",
    relatedConceptId: "modeling-normalization",
    hint: ["반정규화 적용 전 검토 절차를 먼저 확인한다.", "중복되는 대상이 컬럼인지 관계인지 구분한다.", "ORDER_DATE를 배송 테이블에 복사하는 행위는 관계 추가가 아니라 컬럼 중복이다."],
    explanation:
      "반정규화는 테이블 반정규화, 컬럼 반정규화, 관계 반정규화로 나누어 판단한다. ORDER_DELIVERY에 ORDER_DATE를 복사해 저장하는 것은 조인 제거를 위한 중복 컬럼 추가이므로 컬럼 반정규화다. 관계 반정규화는 엔티티 간 FK 관계를 중복 추가해 먼 조인 경로를 단축하는 경우에 해당한다."
  },
  {
    subjectId: "sql-basic",
    number: 121,
    majorTopic: "SQL 기본 및 활용",
    middleTopic: "GROUP BY",
    topic: "GROUPING SETS와 CUBE/ROLLUP",
    difficulty: "상급",
    questionType: "고급 집계 SQL 선택형",
    mode: "original",
    sourceDocument,
    sourcePage: 7,
    sourceQuestionNumber: 4,
    stem:
      "다음은 부서별, 직급별 급여 합계를 집계하는 SQL 문장 (A)와 동일한 결과를 출력하도록 고급 집계 함수를 활용하여 작성한 SQL 문장 (B)이다. 빈칸 (가)와 (나)에 들어갈 올바른 연산자 및 기술을 고르시오.",
    code: `-- SQL 문장 (A): UNION ALL을 사용한 다중 집계
SELECT deptno, job, SUM(sal) AS sum_sal, 1 AS grp_id
FROM emp
GROUP BY deptno, job
UNION ALL
SELECT deptno, NULL AS job, SUM(sal) AS sum_sal, 2 AS grp_id
FROM emp
GROUP BY deptno
UNION ALL
SELECT NULL AS deptno, job, SUM(sal) AS sum_sal, 3 AS grp_id
FROM emp
GROUP BY job;

-- SQL 문장 (B): 고급 집계 함수로 단일 테이블 Scan 리팩토링
SELECT deptno, job, SUM(sal) AS sum_sal,
       CASE
         WHEN GROUPING(deptno) = 0 AND GROUPING(job) = 0 THEN 1
         WHEN GROUPING(deptno) = 0 AND GROUPING(job) = 1 THEN 2
         WHEN GROUPING(deptno) = 1 AND GROUPING(job) = 0 THEN 3
       END AS grp_id
FROM emp
GROUP BY ______ (가) ______
HAVING ______ (나) ______;`,
    choices: [
      [
        "A",
        "(가) ROLLUP(deptno, job) / (나) GROUPING_ID(deptno, job) < 3",
        "오답이다. ROLLUP(deptno, job)은 (deptno, job), (deptno), () 조합을 만들므로 job 단위 집계가 누락되고 전체 총합이 포함된다."
      ],
      [
        "B",
        "(가) CUBE(deptno, job) / (나) GROUPING(deptno) = 0 OR GROUPING(job) = 0",
        "오답이다. CUBE는 네 조합을 만들 수 있으나 제시된 HAVING 조건은 필요한 세 조합만 명확히 표현하는 가장 직접적인 방식이 아니다."
      ],
      [
        "C",
        "(가) GROUPING SETS ((deptno, job), (deptno), (job)) / (나) 1=1, 별도 HAVING 조건 불필요",
        "정답이다. 필요한 집계 조합인 (deptno, job), (deptno), (job)만 명시하므로 전체 총합을 만들지 않고 별도 HAVING 필터가 필요 없다."
      ],
      [
        "D",
        "(가) GROUPING SETS (deptno, job) / (나) GROUPING(deptno) + GROUPING(job) <= 1",
        "오답이다. GROUPING SETS (deptno, job)은 (deptno)와 (job) 단일 집계만 수행하며 (deptno, job) 결합 집계가 누락된다."
      ]
    ],
    answer: "C",
    relatedConceptId: "sql-group-having",
    hint: ["UNION ALL의 각 SELECT가 어떤 집계 조합을 만드는지 세어 본다.", "ROLLUP과 CUBE가 자동으로 추가하는 조합을 확인한다.", "필요한 조합만 직접 지정하는 연산자는 GROUPING SETS다."],
    explanation:
      "SQL (A)는 (deptno, job), (deptno), (job) 세 가지 집계만 생성하고 전체 총합은 포함하지 않는다. GROUPING SETS는 원하는 집계 컬럼 조합을 직접 지정할 수 있으므로 GROUPING SETS ((deptno, job), (deptno), (job))가 가장 정확하다."
  },
  {
    subjectId: "tuning",
    number: 130,
    majorTopic: "SQL 고급활용 및 튜닝",
    middleTopic: "조인 방식",
    topic: "Hash Join Build Input과 Workarea",
    difficulty: "상급",
    questionType: "실행계획 및 Trace 분석형",
    mode: "original",
    sourceDocument,
    sourcePage: 2,
    sourceQuestionNumber: 1,
    stem:
      "다음은 대용량 OLTP 환경에서 주문 테이블과 고객 테이블을 조인하는 쿼리의 실행계획 및 AUTOTRACE 통계이다. hash_area_size는 2MB로 설정되어 있다. Hash Join 동작 알고리즘 및 메모리/디스크 I/O 판단 중 가장 올바르지 않은 설명을 고르시오.",
    code: `SELECT /*+ USE_HASH(c o) SWAP_JOIN_INPUTS(o) */
       c.cust_id, c.cust_name,
       COUNT(o.order_id) AS order_cnt,
       SUM(o.order_amt) AS total_amt
FROM   customer c
JOIN   orders o ON c.cust_id = o.cust_id
WHERE  c.region_code = 'SEOUL'
AND    o.order_date >= TO_DATE('2026-01-01', 'YYYY-MM-DD')
GROUP BY c.cust_id, c.cust_name;

----------------------------------------------------------------------------------------------
| Id | Operation            | Name     | Rows   | Bytes | Cost (%CPU)| Time     |
----------------------------------------------------------------------------------------------
|  0 | SELECT STATEMENT     |          |  50000 | 2441K | 1250 (2)   | 00:00:15 |
|  1 | HASH GROUP BY        |          |  50000 | 2441K | 1250 (2)   | 00:00:15 |
|* 2 | HASH JOIN            |          |  80000 | 3906K | 1240 (2)   | 00:00:15 |
|* 3 | TABLE ACCESS FULL    | ORDERS   | 100000 | 2929K |  800 (2)   | 00:00:10 |
|* 4 | TABLE ACCESS FULL    | CUSTOMER |  50000 | 1220K |  430 (1)   | 00:00:05 |
----------------------------------------------------------------------------------------------
Predicate Information
2 - access("C"."CUST_ID"="O"."CUST_ID")
3 - filter("O"."ORDER_DATE">=TO_DATE('2026-01-01 00:00:00','yyyy-mm-dd hh24:mi:ss'))
4 - filter("C"."REGION_CODE"='SEOUL')

Statistics
15420 consistent gets
  840 physical reads
  120 physical writes (direct path write)
  120 physical reads  (direct path read)`,
    choices: [
      [
        "A",
        "SWAP_JOIN_INPUTS(o) 힌트로 인해 레코드 수가 더 많은 ORDERS 건이 Build Input으로 선택되었다.",
        "정답 선택이다. Build Input 선택 기준을 레코드 수로 설명한 부분이 틀렸다. 이 계획에서는 SWAP_JOIN_INPUTS(o) 힌트가 ORDERS를 강제로 Build Input으로 지정한 것이며, 일반적으로는 필터링 후 메모리 크기가 작은 집합을 Build로 두는 것이 유리하다."
      ],
      [
        "B",
        "Build Input의 해시 테이블 크기 2,929KB가 hash_area_size 2,048KB를 초과하여 In-Memory Hash Join을 수행하지 못하고 Grace Hash Join 단계로 전환되었다.",
        "맞는 설명이다. ORDERS의 예상 Bytes가 Workarea 크기보다 크므로 해시 파티션 일부가 TEMP로 내려가는 2-Pass/Grace Hash Join 상황을 의심할 수 있다."
      ],
      [
        "C",
        "ORDERS 테이블이 Build Input이 되면서 Workarea 메모리 부족으로 생성된 임시 파티션 쌍 중 일부가 Temp Segment로 디스크에 스필되었다.",
        "맞는 설명이다. direct path write/read 수치가 있어 해시 조인 과정의 디스크 스필을 추론할 수 있다."
      ],
      [
        "D",
        "SWAP_JOIN_INPUTS 힌트를 제거하여 CUSTOMER 테이블 1,220KB가 Build Input으로 지정된다면, Direct Path I/O 없이 메모리 내 Hash Join 가능성이 높아진다.",
        "맞는 설명이다. CUSTOMER의 예상 Bytes가 2MB 이내이므로 Build Input을 CUSTOMER로 두면 TEMP 스필 위험이 작아진다."
      ]
    ],
    answer: "A",
    relatedConceptId: "tuning-hash-join",
    hint: ["Hash Join에서 Build Input은 무엇을 기준으로 작게 잡는지 확인한다.", "Rows와 Bytes 중 Workarea 메모리 압박을 직접 설명하는 수치를 본다.", "direct path write/read가 나타나는 이유를 Hash Join spill과 연결한다."],
    explanation:
      "Hash Join의 Build Input은 보통 필터링 후 메모리에 올릴 해시 테이블의 크기가 작은 집합이 유리하다. 이 문항에서 ORDERS는 Rows도 많고 Bytes도 CUSTOMER보다 크지만 SWAP_JOIN_INPUTS(o) 힌트 때문에 Build Input으로 강제되었다. 따라서 Build 선택 원인을 레코드 수가 많기 때문이라고 설명한 A가 틀렸다."
  },
  {
    subjectId: "tuning",
    number: 131,
    majorTopic: "SQL 고급활용 및 튜닝",
    middleTopic: "인덱스 튜닝",
    topic: "Index Skip Scan과 IN-List Iterator",
    difficulty: "최상급",
    questionType: "인덱스 스캔 방식 선택형",
    mode: "original",
    sourceDocument,
    sourcePage: 4,
    sourceQuestionNumber: 2,
    stem:
      "다음은 일별 계좌 거래 내역 테이블에 생성된 결합 인덱스 및 SQL 튜닝 과정이다. 가장 효율적인 인덱스 스캔 방식을 유도하기 위한 조치로 올바른 것을 고르시오.",
    passage:
      "ACCT_TX_HIST 테이블은 1,000만 건이며 TX_TYPE은 '01'(입금), '02'(출금), '03'(이체), '04'(수수료) 네 값이 균등하게 존재한다.",
    table: {
      title: "현재 인덱스 구성",
      headers: ["테이블명", "인덱스 구성", "테이블 총 건수"],
      rows: [["ACCT_TX_HIST", "ACCT_TX_HIST_X1: TX_TYPE + CUST_NO + TX_DATE", "10,000,000건"]]
    },
    code: `-- 원본 SQL
SELECT *
FROM   acct_tx_hist
WHERE  cust_no = :cust_no
AND    tx_date BETWEEN :st_dt AND :ed_dt;

---------------------------------------------------------------------------------------------
| Id | Operation                     | Name            | Rows | Bytes | Cost (%CPU)| Time     |
---------------------------------------------------------------------------------------------
|  0 | SELECT STATEMENT              |                 |   25 |  2200 | 182 (0)   | 00:00:03 |
|* 1 | TABLE ACCESS BY INDEX ROWID   | ACCT_TX_HIST    |   25 |  2200 | 182 (0)   | 00:00:03 |
|* 2 | INDEX SKIP SCAN               | ACCT_TX_HIST_X1 |   25 |       | 178 (0)   | 00:00:03 |
---------------------------------------------------------------------------------------------
Rows Execution Statistics
25 rows, consistent gets: 382, physical reads: 45`,
    choices: [
      [
        "A",
        "선두 컬럼인 TX_TYPE의 Distinct Value가 4개로 적으므로 Index Skip Scan이 최적의 액세스 경로이며 추가적인 SQL 수정이나 인덱스 변경은 불필요하다.",
        "오답이다. Skip Scan이 가능하다는 것과 최적이라는 것은 다르다. 선두 컬럼 값별 루트/브랜치 탐색과 리프 블록 탐색 비용이 누적될 수 있다."
      ],
      [
        "B",
        "TX_TYPE 조건이 없으므로 인덱스를 CUST_NO + TX_DATE + TX_TYPE 순서로 변경하는 신규 인덱스를 추가 생성하는 것만이 유일한 해결책이다.",
        "오답이다. 인덱스 변경은 가능하지만 유일한 해결책은 아니다. 운영 영향이 큰 DDL 변경 전에 SQL 리팩토링으로 접근할 수 있는지 먼저 검토한다."
      ],
      [
        "C",
        "SQL에 TX_TYPE IN ('01','02','03','04') 조건을 추가하여 IN-List Iterator 기반 Index Range Scan으로 전환 유도하면 Skip Scan의 리프 블록 재탐색 오버헤드를 줄일 수 있다.",
        "정답이다. 선두 컬럼의 도메인이 작고 고정되어 있으면 가능한 선두 컬럼 값을 명시해 선두 컬럼별 Range Scan 반복으로 바꾸는 방식이 Skip Scan보다 효율적일 수 있다."
      ],
      [
        "D",
        "INDEX_FFS 힌트를 사용하여 인덱스 전체 블록을 Multi-block Read 방식으로 읽는 것이 가장 블록 I/O 효율적이다.",
        "오답이다. SELECT * 이므로 테이블 액세스가 필요하며 1,000만 건 인덱스 전체를 읽는 접근은 조건 선택도가 있는 조회에 부적절하다."
      ]
    ],
    answer: "C",
    relatedConceptId: "tuning-index-scan-efficiency",
    hint: ["현재 인덱스의 선두 컬럼 조건이 누락되어 있다는 점을 본다.", "선두 컬럼의 값 종류가 네 개로 작고 고정되어 있다는 조건을 활용한다.", "Skip Scan을 Range Scan 반복으로 바꾸는 IN-List Iterator 유도 방식을 떠올린다."],
    explanation:
      "결합 인덱스의 선두 컬럼 조건이 없으면 Skip Scan이 고려될 수 있지만, 선두 컬럼 값 종류가 매우 적고 명확하다면 해당 값을 IN 목록으로 명시해 선두 컬럼별 Index Range Scan 반복을 유도할 수 있다. 이는 Skip Scan의 탐색 오버헤드를 줄이는 대표적인 SQL Rewrite 접근이다."
  },
  {
    subjectId: "tuning",
    number: 132,
    majorTopic: "SQL 고급활용 및 튜닝",
    middleTopic: "SQL Trace",
    topic: "TKPROF와 NLJ Batching",
    difficulty: "최상급",
    questionType: "Trace 및 Row Source 분석형",
    mode: "original",
    sourceDocument,
    sourcePage: 9,
    sourceQuestionNumber: 5,
    stem:
      "다음은 대용량 트랜잭션 시스템에서 수행된 Nested Loops Join 쿼리의 TKPROF Trace 리포트이다. 실행 결과를 분석하여 오라클의 내부 Join Optimization 동작 및 성능 상태를 진단한 내용으로 올바르지 않은 것을 고르시오.",
    code: `TKPROF: Release 19.0.0.0.0 - Production
SQL ID: 8azf2k9v01mpx

SELECT /*+ LEADING(e) USE_NL(d) */ e.empno, e.ename, d.dname
FROM emp e JOIN dept d ON e.deptno = d.deptno
WHERE e.hiredate >= TO_DATE('2020-01-01', 'YYYY-MM-DD');

call     count      cpu   elapsed   disk   query  current   rows
------- ------ -------- --------- ------ ------- -------- ------
Parse        1     0.00      0.00      0       0        0      0
Execute      1     0.00      0.00      0       0        0      0
Fetch      101     0.12      0.45    350    2050        0  10000
------- ------ -------- --------- ------ ------- -------- ------
total      103     0.12      0.45    350    2050        0  10000

Rows (Accum)  Execution Plan
------------ -------------------------------------------------------------
10000        NESTED LOOPS (cr=2050 pr=350 pw=0 time=450120 us cost=312)
10000          NESTED LOOPS (cr=1050 pr=50 pw=0 time=120050 us cost=12)
10000            TABLE ACCESS FULL EMP (cr=50 pr=50 pw=0 time=20010 us)
10000            INDEX UNIQUE SCAN PK_DEPT (cr=1000 pr=0 pw=0 time=45000 us)
10000          TABLE ACCESS BY INDEX ROWID DEPT (cr=1000 pr=300 pw=0 time=320000 us)`,
    choices: [
      [
        "A",
        "2개의 NESTED LOOPS 노드가 나타난 파싱 트리는 Oracle 11g 이후 도입된 nlj_batching 또는 Table Prefetch 옵티마이저 파이프라인 구조가 반영된 결과이다.",
        "맞는 설명이다. NLJ Batching 또는 Table Prefetch가 적용되면 RowID를 모아 내부 테이블 액세스를 배치 처리하는 구조가 실행계획에 두 단계 NL로 나타날 수 있다."
      ],
      [
        "B",
        "Outer 테이블인 EMP의 Full Table Scan 과정에서 발생한 블록 I/O는 query(cr) 50회, disk(pr) 50회이다.",
        "맞는 설명이다. TABLE ACCESS FULL EMP 라인에 cr=50, pr=50으로 표시되어 있다."
      ],
      [
        "C",
        "Inner 인덱스 PK_DEPT 탐색 시 disk(pr)가 0회로 기록되었으므로, 인덱스 블록이 모두 Buffer Cache에서 처리되어 디스크 I/O가 발생하지 않았다.",
        "맞는 설명이다. 해당 라인의 pr=0은 인덱스 탐색에 물리 읽기가 없었음을 의미한다."
      ],
      [
        "D",
        "Inner 테이블 DEPT의 TABLE ACCESS BY INDEX ROWID 조회가 총 10,000번 반복 수행되는 동안 2,000회의 Consistent Get이 발생하였으므로, ROWID를 통한 테이블 방문 시 블록 재사용률이 높아 I/O 효율이 매우 낮다고 단정할 수 없다.",
        "정답 선택이다. 실제 DEPT 테이블 액세스 라인의 cr은 1,000회이고, 보기의 2,000회 수치가 맞지 않는다. 또한 블록 재사용률이 높으면 I/O 효율이 매우 낮다고 단정하기 어렵다."
      ]
    ],
    answer: "D",
    relatedConceptId: "tuning-nl-join",
    hint: ["각 Row Source 라인의 cr/pr 수치를 부모 합계와 자식 단계별로 분리한다.", "NESTED LOOPS가 두 번 보이는 이유를 NLJ Batching과 연결한다.", "DEPT 테이블 액세스 라인의 cr 값이 보기의 수치와 일치하는지 확인한다."],
    explanation:
      "Trace에서 전체 Fetch의 query는 2,050회지만 DEPT TABLE ACCESS BY INDEX ROWID 단계의 cr은 1,000회다. 보기 D는 수치 자체를 2,000회로 잘못 읽었고, 동일 블록 내 여러 행을 연속해서 읽는 경우에는 블록 재사용률이 높아 I/O 효율이 낮다고 단정할 수 없다. 따라서 올바르지 않은 진단은 D다."
  }
];
