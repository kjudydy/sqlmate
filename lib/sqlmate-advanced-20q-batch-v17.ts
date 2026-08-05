import type { ChoiceId, Difficulty, ObjectiveQuestion, SubjectId } from "@/lib/types";

type Advanced20Question = {
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

const sourceDocument = "SQLMate_SQLP_Advanced_20Q.pdf";

export const sqlmateAdvanced20qObjectiveBatch17: Advanced20Question[] = [
  {
    subjectId: "tuning",
    number: 133,
    majorTopic: "SQL 고급활용 및 튜닝",
    middleTopic: "인덱스 구조",
    topic: "B-Tree 리프 블록 분할과 Hot Block",
    difficulty: "상급",
    questionType: "인덱스 메커니즘 판단형",
    mode: "original",
    sourceDocument,
    sourcePage: 2,
    sourceQuestionNumber: 1,
    parentQuestionId: "sqlmate-advanced-20q-01",
    stem:
      "다음 중 B-Tree 인덱스의 Right Split / Leaf Block Split 메커니즘과 Sequence 또는 Timestamp 기반 PK 구조에서의 인덱스 블록 락 경합에 대한 설명으로 가장 옳지 않은 것은?",
    passage:
      "대용량 트랜잭션 환경에서 INSERT 성능 향상을 위해 Sequence 기반의 PK 인덱스 구조를 다각도로 분석하고 있다.",
    choices: [
      [
        "A",
        "순차적으로 증가하는 PK 값을 INSERT할 때 인덱스 리프 블록은 50:50 Split이 아닌 90:10 또는 Right Split이 발생하여 공간 효율성이 유지된다.",
        "옳은 설명이다. 순차 증가 키는 최우측 리프 블록에 계속 삽입되므로 기존 블록을 거의 채우고 새 블록을 할당하는 Right Split이 발생한다."
      ],
      [
        "B",
        "순차 증가 PK 인덱스의 최우측 리프 블록에 대한 동시 INSERT 쏠림 현상을 완화하기 위해 Hash Partitioned Index를 적용할 수 있다.",
        "옳은 설명이다. 해시 파티션 인덱스는 삽입 위치를 여러 인덱스 파티션으로 분산시켜 Hot Block 경합을 줄일 수 있다."
      ],
      [
        "C",
        "Reverse Key Index를 적용하면 인덱스 블록 락 경합은 줄어들 수 있지만 Range Scan 형태의 조건절을 사용하는 쿼리 성능이 저하될 수 있다.",
        "옳은 설명이다. Reverse Key Index는 키 값을 뒤집어 저장하므로 삽입 분산에는 유리하지만 범위 검색에는 불리하다."
      ],
      [
        "D",
        "Sequence 인덱스의 Hot Block을 해결하기 위해 인덱스 블록의 PCTFREE 설정값을 50% 이상으로 크게 늘리면 Right Split 특성상 블록 경합이 완전히 해소된다.",
        "옳지 않은 설명이다. PCTFREE를 높여도 새 키가 마지막 리프 블록에 몰리는 구조 자체는 바뀌지 않으므로 Hot Block 경합을 완전히 없앨 수 없다."
      ]
    ],
    answer: "D",
    relatedConceptId: "tuning-index-basic",
    hint: [
      "순차 증가 키가 어느 리프 블록으로 들어가는지 먼저 확인한다.",
      "PCTFREE는 블록 내부 여유 공간 설정이지 삽입 위치 분산 장치가 아니다.",
      "Hot Block 완화에는 삽입 위치를 분산하는 해시 파티션 인덱스나 Reverse Key 같은 접근이 필요하다."
    ],
    explanation:
      "정답은 D이다. Sequence 기반 PK 인덱스는 신규 키가 계속 최우측 리프 블록에 삽입되어 해당 블록이 Hot Block이 되기 쉽다. Right Split은 공간 낭비를 줄이는 분할 방식이지 동시 삽입 경합을 제거하는 방식이 아니다. PCTFREE를 크게 잡아도 마지막 리프 블록으로 집중되는 현상은 유지된다."
  },
  {
    subjectId: "tuning",
    number: 134,
    majorTopic: "SQL 고급활용 및 튜닝",
    middleTopic: "SQL Trace",
    topic: "Consistent Read와 Undo 재구성",
    difficulty: "상급",
    questionType: "Auto Trace 분석형",
    mode: "original",
    sourceDocument,
    sourcePage: 2,
    sourceQuestionNumber: 2,
    parentQuestionId: "sqlmate-advanced-20q-02",
    stem:
      "아래 Auto Trace 결과 중 쿼리 B가 쿼리 A에 비해 더 많은 consistent gets를 기록한 근본적인 이유로 가장 적절한 것은?",
    passage:
      "두 쿼리 모두 동일한 테이블 EMP_BIG을 스캔하며 동일한 건수 1,000건을 반환하였다. 사용된 인덱스와 스캔 범위도 동일하다.",
    code: `[Query A Trace]
1000 rows selected.

Execution Plan
----------------------------------------------------------
0 SELECT STATEMENT Optimizer=ALL_ROWS
1 0 TABLE ACCESS (BY INDEX ROWID BATCHED) OF 'EMP_BIG'
2 1 INDEX (RANGE SCAN) OF 'EMP_BIG_IDX1' (NON-UNIQUE)

Statistics
----------------------------------------------------------
0 recursive calls
0 db block gets
250 consistent gets
0 physical reads

[Query B Trace]
1000 rows selected.

Execution Plan
----------------------------------------------------------
0 SELECT STATEMENT Optimizer=ALL_ROWS
1 0 TABLE ACCESS (BY INDEX ROWID BATCHED) OF 'EMP_BIG'
2 1 INDEX (RANGE SCAN) OF 'EMP_BIG_IDX1' (NON-UNIQUE)

Statistics
----------------------------------------------------------
0 recursive calls
0 db block gets
1250 consistent gets
0 physical reads`,
    choices: [
      [
        "A",
        "Query B 실행 시점에 다른 세션에서 EMP_BIG 테이블에 대량 UPDATE 또는 DELETE를 수행하여 Undo Segment를 통한 CR 블록 재구성이 대량 발생하였다.",
        "정답이다. 실행계획과 physical reads가 같더라도 일관 읽기를 위해 Undo를 따라가 블록을 재구성하면 consistent gets가 크게 증가할 수 있다."
      ],
      [
        "B",
        "Query A는 DB Buffer Cache에서 블록을 읽었고 Query B는 Physical Read를 수행했기 때문이다.",
        "틀렸다. Query B의 physical reads도 0이므로 디스크 읽기 증가가 원인이 아니다."
      ],
      [
        "C",
        "Query A의 인덱스가 Unique Index이고 Query B의 인덱스는 Non-Unique Index이기 때문이다.",
        "틀렸다. 두 실행계획 모두 동일한 Non-Unique Index Range Scan을 사용한다."
      ],
      [
        "D",
        "Query B 실행 직전 EMP_BIG 테이블에 대해 ALTER TABLE EMP_BIG SHRINK SPACE가 실행되었기 때문이다.",
        "틀렸다. 제시된 Trace만으로 Shrink를 원인으로 볼 수 없고, 핵심 차이는 일관 읽기 블록 재구성 가능성이다."
      ]
    ],
    answer: "A",
    relatedConceptId: "tuning-sql-trace",
    hint: [
      "physical reads가 0인데 consistent gets만 증가한 상황을 해석한다.",
      "MVCC 환경에서 오래된 버전의 블록을 만들 때 어떤 세그먼트를 따라가는지 떠올린다.",
      "동일 실행계획이라도 Undo를 통한 CR 블록 재구성이 많으면 논리 읽기는 증가한다."
    ],
    explanation:
      "정답은 A이다. Query B는 동일한 계획과 동일한 반환 건수를 보이지만 consistent gets가 훨씬 많다. 이는 다른 트랜잭션 변경분 때문에 읽기 일관성을 보장하기 위해 Undo 정보를 이용해 이전 버전의 블록을 재구성했을 가능성이 높다는 뜻이다."
  },
  {
    subjectId: "tuning",
    number: 135,
    majorTopic: "SQL 고급활용 및 튜닝",
    middleTopic: "조인 튜닝",
    topic: "Hash Join 메모리와 Build Input",
    difficulty: "상급",
    questionType: "Hash Join 판단형",
    mode: "original",
    sourceDocument,
    sourcePage: 3,
    sourceQuestionNumber: 3,
    parentQuestionId: "sqlmate-advanced-20q-03",
    stem:
      "다음 중 Hash Join 동작 메커니즘 및 Workarea(PGA) 메모리 관리 관점에 대한 설명으로 옳지 않은 것은?",
    passage:
      "대용량 두 테이블 ORDER_HIST 1,000만 건과 CUSTOMER 100만 건을 Hash Join 하려고 한다.",
    choices: [
      [
        "A",
        "Build Input이 PGA의 Hash Area Size보다 작을 경우 1-Pass 또는 Multi-Pass Hash Join 없이 In-Memory Hash Join으로 처리된다.",
        "옳은 설명이다. Build Input 전체를 메모리에 올릴 수 있으면 Temp 분할 없이 해시 테이블을 구성할 수 있다."
      ],
      [
        "B",
        "Build Input 대상 집합을 선택할 때는 테이블의 전체 크기가 아니라 WHERE 조건절에 의해 필터링된 후 조인에 참여하는 최종 추출 데이터의 총 바이트 크기가 작은 쪽을 선택해야 한다.",
        "옳은 설명이다. Build Input은 행 수뿐 아니라 조인에 필요한 컬럼 폭까지 고려한 실제 바이트 크기가 중요하다."
      ],
      [
        "C",
        "Hash Area Size가 부족하여 Spill to Disk가 발생할 경우 Build Input과 Probe Input 모두 동일한 Hash 함수를 적용해 Partition Pair를 만들어 Temp Segment에 기록한다.",
        "옳은 설명이다. 같은 해시 함수로 분할해야 서로 매칭 가능한 파티션 쌍을 다시 처리할 수 있다."
      ],
      [
        "D",
        "Probe Input이 Build Input보다 행 수가 훨씬 적다면 튜닝을 위해 Probe Input을 Build Input으로 변경하도록 SWAP_JOIN_INPUTS 힌트를 사용하는 것이 항상 유리하다.",
        "옳지 않은 설명이다. 항상 유리하지 않다. 최종 바이트 크기, 필터링 후 건수, 조인 키 분포, 병렬 처리, 메모리 크기를 함께 봐야 한다."
      ]
    ],
    answer: "D",
    relatedConceptId: "tuning-hash-join",
    hint: [
      "Hash Join에서 메모리에 올리는 쪽이 무엇인지 확인한다.",
      "Build Input 선택 기준은 단순 행 수가 아니라 필터 후 데이터 크기이다.",
      "항상 유리하다는 표현은 조인 메모리와 데이터 분포를 무시한 설명인지 점검한다."
    ],
    explanation:
      "정답은 D이다. Hash Join의 Build Input은 가능한 작아야 하지만 단순 Row Count만으로 결정하지 않는다. 조건 적용 후 실제 조인 참여 데이터의 바이트 크기와 Workarea 크기, 분포, 병렬 처리 구조를 함께 판단해야 하므로 SWAP_JOIN_INPUTS가 항상 유리하다고 말할 수 없다."
  },
  {
    subjectId: "tuning",
    number: 136,
    majorTopic: "SQL 고급활용 및 튜닝",
    middleTopic: "인덱스 스캔",
    topic: "IN-List Iterator와 Skip Scan",
    difficulty: "상급",
    questionType: "인덱스 실행계획 판단형",
    mode: "original",
    sourceDocument,
    sourcePage: 3,
    sourceQuestionNumber: 4,
    parentQuestionId: "sqlmate-advanced-20q-04",
    stem:
      "테이블 TAB_A에 인덱스 IDX_A(COL1, COL2, COL3)가 존재할 때 다음 SQL 및 실행계획 분석 중 가장 적절한 것은?",
    code: `SELECT *
FROM   TAB_A
WHERE  COL1 IN ('A', 'B')
AND    COL3 = 'XYZ';`,
    choices: [
      [
        "A",
        "COL2에 대한 조건이 없으므로 이 쿼리는 반드시 Table Full Scan으로 처리된다.",
        "틀렸다. 선두 컬럼 COL1 조건이 존재하므로 인덱스 접근 가능성을 배제할 수 없다."
      ],
      [
        "B",
        "COL1의 Distinct Value 개수가 매우 높고 COL2의 Distinct Value 개수가 매우 적을 때 Index Skip Scan이 가장 유용하게 동작한다.",
        "틀렸다. Skip Scan은 선두 컬럼 조건이 없고 선두 컬럼의 Distinct Value가 적을 때 상대적으로 유리하다."
      ],
      [
        "C",
        "CBO가 이 쿼리를 Index Inlist Iterator 방식으로 처리할 경우 (COL1='A' AND COL3='XYZ')와 (COL1='B' AND COL3='XYZ') 두 개의 분기로 각각 Index Range Scan을 시도한다.",
        "정답이다. IN 조건은 내부적으로 여러 개의 동등 조건 탐색으로 분기되어 각 값별 Range Scan이 수행될 수 있다."
      ],
      [
        "D",
        "Index Skip Scan은 선두 컬럼 COL1의 Distinct Value 개수가 매우 많은 경우에만 선택되며 Distinct Value가 적으면 성능이 저하된다.",
        "틀렸다. 설명이 반대이다. Skip Scan은 선두 컬럼 값 종류가 적을수록 탐색 분기 수가 줄어 유리하다."
      ]
    ],
    answer: "C",
    relatedConceptId: "tuning-index-scan-efficiency",
    hint: [
      "결합 인덱스의 선두 컬럼에 어떤 조건이 있는지 먼저 확인한다.",
      "IN 조건은 하나의 범위가 아니라 여러 동등 조건 탐색으로 나뉠 수 있다.",
      "Skip Scan은 선두 컬럼 조건이 없을 때 주로 검토되는 스캔 방식이다."
    ],
    explanation:
      "정답은 C이다. COL1에 IN 조건이 있으므로 CBO는 IN-List Iterator로 COL1='A', COL1='B' 각각에 대해 인덱스 Range Scan을 수행할 수 있다. COL2 조건이 없더라도 COL1 조건이 있으므로 무조건 Full Scan이라고 볼 수 없다."
  },
  {
    subjectId: "tuning",
    number: 137,
    majorTopic: "SQL 고급활용 및 튜닝",
    middleTopic: "인덱스 설계",
    topic: "Clustering Factor",
    difficulty: "중급",
    questionType: "인덱스 비용 판단형",
    mode: "original",
    sourceDocument,
    sourcePage: 4,
    sourceQuestionNumber: 5,
    parentQuestionId: "sqlmate-advanced-20q-05",
    stem:
      "클러스터링 팩터(Clustering Factor, CF)와 인덱스 스캔 효율에 관한 설명으로 가장 올바르지 않은 것은?",
    choices: [
      [
        "A",
        "CF는 인덱스 키 값 정렬 순서와 테이블 데이터의 물리적 저장 순서(ROWID 순서)가 얼마나 일치하는지를 나타내는 지표이다.",
        "옳은 설명이다. 인덱스 순서로 ROWID를 따라갈 때 테이블 블록 이동이 얼마나 잦은지를 보여준다."
      ],
      [
        "B",
        "CF가 테이블의 전체 블록 수(Blocks)에 가까울수록 우수한 상태이며, 전체 행 수(Num_Rows)에 가까울수록 불량한 상태이다.",
        "옳은 설명이다. 같은 블록을 연속해서 읽을수록 CF는 블록 수에 가까워지고 랜덤 액세스가 많을수록 행 수에 가까워진다."
      ],
      [
        "C",
        "CF가 나쁜 인덱스라도 Index Range Scan으로 대량 데이터를 추출할 때 DB Buffer Cache 크기가 충분하다면 Buffer Pinning 효과로 Random I/O 단점이 대부분 사라진다.",
        "옳지 않은 설명이다. Cache가 충분해도 논리 읽기, 래치 탐색, CPU 비용은 남고 대량 범위에서는 Full Scan이 더 유리할 수 있다."
      ],
      [
        "D",
        "인덱스 클러스터링 팩터가 매우 나쁜 상태에서 대량 데이터를 조회할 때 CBO는 Index Range Scan보다 Table Full Scan이 더 저렴하다고 판단할 가능성이 높다.",
        "옳은 설명이다. 랜덤 테이블 액세스 비용이 커지면 Full Scan의 멀티 블록 읽기가 더 저렴할 수 있다."
      ]
    ],
    answer: "C",
    relatedConceptId: "tuning-clustering-factor",
    hint: [
      "CF가 나쁜 경우 인덱스 순서와 테이블 저장 순서가 어긋난다는 뜻이다.",
      "Buffer Cache는 물리 읽기를 줄일 수 있지만 모든 비용을 없애지는 않는다.",
      "대량 범위 검색에서 랜덤 액세스가 많은 인덱스는 Full Scan보다 불리할 수 있다."
    ],
    explanation:
      "정답은 C이다. CF가 나쁘면 인덱스 Range Scan 후 테이블 블록을 랜덤하게 반복 방문하게 된다. Buffer Cache가 물리 읽기를 줄일 수는 있지만 consistent gets, 래치 획득, CPU 비용까지 사라지는 것은 아니다."
  },
  {
    subjectId: "tuning",
    number: 138,
    majorTopic: "SQL 고급활용 및 튜닝",
    middleTopic: "파티셔닝",
    topic: "Composite Partition Pruning",
    difficulty: "상급",
    questionType: "Partition Pruning 판단형",
    mode: "original",
    sourceDocument,
    sourcePage: 4,
    sourceQuestionNumber: 6,
    parentQuestionId: "sqlmate-advanced-20q-06",
    stem:
      "다음 중 Range-Hash Composite Partitioning 테이블에 대한 Partition Pruning 메커니즘 설명으로 가장 옳지 않은 것은?",
    code: `-- SALE_DATE 기준 Range 파티션 + CUST_ID 기준 Hash 서브파티션
SELECT *
FROM   SALES_COMP
WHERE  SALE_DATE >= TO_DATE('2026-03-01', 'YYYY-MM-DD')
AND    SALE_DATE <  TO_DATE('2026-04-01', 'YYYY-MM-DD')
AND    CUST_ID = :v_cust_id;`,
    choices: [
      [
        "A",
        "위 쿼리는 Compile 시점에 Range 파티션 Pruning과 Hash 서브파티션 Pruning이 동시에 발생할 수 있다.",
        "대체로 옳은 설명이다. SALE_DATE 범위는 상수 조건이므로 Range 파티션은 정적으로 줄일 수 있고, CUST_ID 바인드는 실행 시점 서브파티션 Pruning 대상이 될 수 있다."
      ],
      [
        "B",
        "바인드 변수 :v_cust_id가 사용되었으므로 Hash 서브파티션에 대한 Pruning은 쿼리 실행 시점에 결정된다.",
        "옳은 설명이다. 바인드 값은 실행 시점에 확정되므로 동적 Pruning으로 처리될 수 있다."
      ],
      [
        "C",
        "SALE_DATE 조건절 열에 TO_CHAR(SALE_DATE, 'YYYYMM') = '202603' 형태의 좌변 가공을 적용해도 Static Partition Pruning이 정상 동작한다.",
        "옳지 않은 설명이다. 파티션 키 컬럼을 함수로 가공하면 일반적으로 파티션 범위 조건을 직접 인식하기 어려워 Static Pruning이 제한될 수 있다."
      ],
      [
        "D",
        "파티션 키 컬럼에 대한 Pruning이 성공하면 액세스하지 않는 파티션의 인덱스 세그먼트 역시 읽지 않고 스킵한다.",
        "옳은 설명이다. 접근 대상 파티션이 줄어들면 해당 파티션에 속한 로컬 인덱스 세그먼트 접근도 줄어든다."
      ]
    ],
    answer: "C",
    relatedConceptId: "tuning-partitioning",
    hint: [
      "파티션 Pruning은 파티션 키 조건을 옵티마이저가 인식할 수 있어야 한다.",
      "상수 범위 조건과 바인드 조건은 결정 시점이 다르다.",
      "파티션 키 좌변을 함수로 감싸면 Static Pruning이 어려워질 수 있다."
    ],
    explanation:
      "정답은 C이다. 파티션 키 SALE_DATE를 TO_CHAR로 가공하면 파티션 경계와 직접 비교하는 조건이 아니므로 정적 파티션 Pruning이 제한될 수 있다. 파티션 키는 가능한 한 가공하지 않고 범위 조건으로 작성하는 것이 안정적이다."
  },
  {
    subjectId: "tuning",
    number: 139,
    majorTopic: "SQL 고급활용 및 튜닝",
    middleTopic: "쿼리 변환",
    topic: "Subquery Unnesting과 Semi Join",
    difficulty: "상급",
    questionType: "서브쿼리 튜닝 판단형",
    mode: "original",
    sourceDocument,
    sourcePage: 5,
    sourceQuestionNumber: 7,
    parentQuestionId: "sqlmate-advanced-20q-07",
    stem: "아래 SQL과 실행계획 변환 과정에 대한 설명 중 가장 올바르지 않은 것은?",
    code: `SELECT D.DEPTNO, D.DNAME
FROM   DEPT D
WHERE  D.LOCATION = 'SEOUL'
AND    EXISTS (
  SELECT 1
  FROM   EMP E
  WHERE  E.DEPTNO = D.DEPTNO
  AND    E.SAL >= 5000
);`,
    choices: [
      [
        "A",
        "서브쿼리 Unnesting이 수행되면 EXISTS 서브쿼리는 조인문(Semi Join) 형태로 변환된다.",
        "옳은 설명이다. EXISTS는 조인 성공 여부만 필요하므로 Semi Join으로 변환될 수 있다."
      ],
      [
        "B",
        "Unnesting이 방지되면 서브쿼리는 Filter 방식으로 처리되어 메인쿼리에서 추출된 각 행마다 서브쿼리가 반복 수행된다.",
        "옳은 설명이다. Filter 방식은 외부 행마다 서브쿼리를 평가하는 구조가 될 수 있다."
      ],
      [
        "C",
        "Filter 방식 동작 시 Subquery Caching 기능이 작동하면 메인쿼리의 동일한 DEPTNO 값에 대해서는 서브쿼리를 재실행하지 않고 캐싱된 결과를 활용한다.",
        "옳은 설명이다. 입력값이 반복되면 캐시를 통해 서브쿼리 반복 비용을 줄일 수 있다."
      ],
      [
        "D",
        "Unnesting 후 Semi Join을 수행할 때 EMP 테이블의 DEPTNO가 Unique Key가 아니라면 결과 건수가 M:N 조인으로 인해 불어나는 현상이 발생한다.",
        "옳지 않은 설명이다. Semi Join은 존재 여부만 확인하므로 EMP에서 여러 행이 매칭되어도 DEPT 행이 중복 증폭되지 않는다."
      ]
    ],
    answer: "D",
    relatedConceptId: "tuning-query-transformation",
    hint: [
      "EXISTS는 값을 반환하는 조인이 아니라 존재 여부를 판단한다.",
      "Semi Join은 매칭 행이 여러 개여도 외부 행을 한 번만 반환한다.",
      "M:N 결과 증폭은 일반 조인과 Semi Join을 혼동할 때 생기는 오답이다."
    ],
    explanation:
      "정답은 D이다. EXISTS가 Semi Join으로 변환되면 내부 테이블에 여러 건이 존재하더라도 외부 행은 한 번만 반환된다. 따라서 일반 Inner Join처럼 M:N 조인 결과가 증폭된다고 볼 수 없다."
  },
  {
    subjectId: "tuning",
    number: 140,
    majorTopic: "SQL 고급활용 및 튜닝",
    middleTopic: "Sort 튜닝",
    topic: "Top-N Sort와 Stopkey",
    difficulty: "상급",
    questionType: "Top-N 실행계획 판단형",
    mode: "original",
    sourceDocument,
    sourcePage: 6,
    sourceQuestionNumber: 8,
    parentQuestionId: "sqlmate-advanced-20q-08",
    stem: "다음 SQL의 실행계획 및 PGA 메모리 사용량 메커니즘에 관한 설명으로 가장 올바른 것은?",
    code: `SELECT *
FROM (
  SELECT EMPNO, ENAME, SAL, HIREDATE
  FROM   EMP_LARGE
  WHERE  DEPTNO = 10
  ORDER BY SAL DESC
)
WHERE ROWNUM <= 10;`,
    choices: [
      [
        "A",
        "ORDER BY 컬럼에 인덱스가 없는 경우 테이블 전체를 정렬하는 Full Sort가 반드시 발생하며 Temp Segment를 많이 사용하게 된다.",
        "틀렸다. Top-N Stopkey 최적화가 적용되면 전체 결과를 완전히 정렬하지 않고 상위 N개만 유지할 수 있다."
      ],
      [
        "B",
        "Top-N Stopkey 알고리즘이 작동하더라도 추출 대상 1,000만 건 전체를 정렬 메모리에 올린 후 상위 10건만 자르는 방식으로 작동한다.",
        "틀렸다. Top-N은 전체 정렬보다 작은 메모리 구조로 상위 후보만 유지하는 방식으로 동작할 수 있다."
      ],
      [
        "C",
        "Top-N Sort 알고리즘이 적용되면 지정된 N개 공간의 우선순위 큐만 메모리에 유지하면서 스캔과 동시에 최소 또는 최대값을 교체하므로 PGA 메모리 사용량이 작아진다.",
        "정답이다. 전체 Sort Area를 크게 잡지 않고 상위 N건 후보만 유지하여 처리할 수 있다."
      ],
      [
        "D",
        "WHERE ROWNUM <= 10 조건 대신 OFFSET 0 ROWS FETCH FIRST 10 ROWS ONLY 구문을 사용하면 Top-N Stopkey 최적화가 적용되지 않는다.",
        "틀렸다. 최신 Oracle에서는 FETCH FIRST 구문도 Top-N 최적화 대상이 될 수 있다."
      ]
    ],
    answer: "C",
    relatedConceptId: "tuning-sort",
    hint: [
      "Top-N 쿼리는 전체 정렬과 상위 N개 유지 방식의 차이를 묻는다.",
      "ROWNUM <= N 조건은 Stopkey 최적화와 연결된다.",
      "상위 N개만 필요할 때는 PGA에 모든 행을 올릴 필요가 없다."
    ],
    explanation:
      "정답은 C이다. Top-N Stopkey 또는 Top-N Sort는 전체 결과를 완전히 정렬한 뒤 잘라내는 방식이 아니라, 필요한 상위 N개 후보만 유지하면서 스캔할 수 있다. 따라서 일반 Full Sort보다 PGA와 Temp 사용량이 크게 줄어들 수 있다."
  },
  {
    subjectId: "tuning",
    number: 141,
    majorTopic: "SQL 고급활용 및 튜닝",
    middleTopic: "Lock과 동시성",
    topic: "SELECT FOR UPDATE와 MVCC",
    difficulty: "중급",
    questionType: "동시성 판단형",
    mode: "original",
    sourceDocument,
    sourcePage: 6,
    sourceQuestionNumber: 9,
    parentQuestionId: "sqlmate-advanced-20q-09",
    stem:
      "다음 중 MVCC 기반 DBMS의 SELECT FOR UPDATE 및 Lock 메커니즘에 관한 설명으로 가장 옳지 않은 것은?",
    choices: [
      [
        "A",
        "SELECT ... FOR UPDATE 구문은 단순 읽기 전용 Shared Lock 대신 해당 Row에 대해 변경을 전제로 한 Lock을 획득하여 타 트랜잭션의 동시 변경을 차단한다.",
        "옳은 설명이다. FOR UPDATE는 조회 대상 행을 갱신 대상으로 잠그므로 다른 세션의 변경과 충돌할 수 있다."
      ],
      [
        "B",
        "SELECT ... FOR UPDATE WAIT 5 구문 사용 시 다른 트랜잭션이 해당 Row를 Lock 중이라면 5초 동안 대기 후 획득 실패 시 예외를 발생시킨다.",
        "옳은 설명이다. WAIT 옵션은 지정 시간만큼 기다린 뒤 실패 처리를 한다."
      ],
      [
        "C",
        "MVCC 모델에서는 일반적인 SELECT가 UPDATE 중인 Row를 읽으려고 할 때 Block Lock 대기 현상이 발생한다.",
        "옳지 않은 설명이다. 일반 SELECT는 일관 읽기를 통해 이전 버전을 읽을 수 있으므로 보통 UPDATE Lock을 기다리지 않는다."
      ],
      [
        "D",
        "SELECT ... FOR UPDATE NOWAIT는 동시성 제어 및 Deadlock 회피를 목적으로 락 획득을 즉시 시도하고 실패 시 바로 오류를 반환할 때 유용하다.",
        "옳은 설명이다. NOWAIT는 대기하지 않고 실패를 빠르게 감지할 수 있다."
      ]
    ],
    answer: "C",
    relatedConceptId: "tuning-concurrency",
    hint: [
      "일반 SELECT와 SELECT FOR UPDATE의 Lock 동작을 구분한다.",
      "MVCC에서 읽기 일관성은 Undo 기반 이전 버전 읽기와 연결된다.",
      "일반 SELECT가 UPDATE 트랜잭션의 Row Lock을 기다린다는 설명이 맞는지 확인한다."
    ],
    explanation:
      "정답은 C이다. MVCC 환경에서 일반 SELECT는 대개 변경 중인 행의 과거 버전을 읽어 일관성을 보장하므로 Row Lock 대기를 하지 않는다. Lock 대기는 SELECT FOR UPDATE처럼 변경을 전제로 잠금을 획득하려는 경우에 발생한다."
  },
  {
    subjectId: "tuning",
    number: 142,
    majorTopic: "SQL 고급활용 및 튜닝",
    middleTopic: "DML 튜닝",
    topic: "Direct Path Insert",
    difficulty: "상급",
    questionType: "대량 DML 판단형",
    mode: "original",
    sourceDocument,
    sourcePage: 7,
    sourceQuestionNumber: 10,
    parentQuestionId: "sqlmate-advanced-20q-10",
    stem:
      "대용량 테이블 데이터 배치 INSERT 작업 시 INSERT /*+ APPEND */ INTO ... SELECT 방식의 Direct Path Write 동작에 관한 설명으로 가장 옳지 않은 것은?",
    choices: [
      [
        "A",
        "Direct Path Insert는 DB Buffer Cache를 거치지 않고 데이터 파일의 High Water Mark 뒤쪽에 데이터를 직접 기록한다.",
        "옳은 설명이다. Direct Path Insert는 일반 Conventional Insert와 달리 HWM 이후 영역에 직접 적재한다."
      ],
      [
        "B",
        "Direct Path Insert 작업 동안 해당 테이블에는 Exclusive Table Lock이 발생하여 타 세션의 DML이 블로킹될 수 있다.",
        "옳은 설명이다. Direct Path Insert는 동시 DML 제약과 Lock 영향을 고려해야 한다."
      ],
      [
        "C",
        "Direct Path Insert를 실행한 동일한 트랜잭션 내에서 COMMIT을 수행하기 전에 해당 테이블을 SELECT 조회하면 변경된 최신 데이터가 정상적으로 즉시 조회된다.",
        "옳지 않은 설명이다. Oracle에서는 Direct Path Insert 후 Commit 전 같은 트랜잭션에서 해당 테이블을 다시 읽으려 하면 ORA-12838 오류가 발생할 수 있다."
      ],
      [
        "D",
        "Undo Logging 양을 줄이고 Redo Logging 또한 NOLOGGING 모드와 결합하여 최적화할 수 있다.",
        "옳은 설명이다. Direct Path Insert는 Undo/Redo 부하 완화 목적의 대량 적재 튜닝에 활용된다."
      ]
    ],
    answer: "C",
    relatedConceptId: "tuning-dml",
    hint: [
      "Direct Path Insert는 Conventional Insert와 달리 HWM 이후에 직접 적재한다.",
      "대량 적재 성능은 좋아질 수 있지만 트랜잭션 내부 조회 제약이 있다.",
      "Commit 전 같은 테이블 재조회 시 ORA-12838을 떠올린다."
    ],
    explanation:
      "정답은 C이다. Direct Path Insert는 고속 적재에 유리하지만 Commit 전 해당 테이블을 다시 읽거나 수정할 때 제약이 있다. Oracle에서는 Direct Path로 수정한 객체를 Commit 전 다시 읽으면 ORA-12838이 발생할 수 있다."
  },
  {
    subjectId: "tuning",
    number: 143,
    majorTopic: "SQL 고급활용 및 튜닝",
    middleTopic: "인덱스 설계",
    topic: "결합 인덱스 액세스 조건과 필터 조건",
    difficulty: "상급",
    questionType: "인덱스 액세스 범위 비교형",
    mode: "original",
    sourceDocument,
    sourcePage: 8,
    sourceQuestionNumber: 11,
    parentQuestionId: "sqlmate-advanced-20q-11",
    stem:
      "테이블 CUST_ORDERS에 인덱스 IDX_01(CUST_ID, ORDER_DATE, STATUS)가 생성되어 있을 때, 다음 두 쿼리의 인덱스 스캔 범위에 대한 비교로 가장 옳지 않은 것은?",
    code: `-- SQL 1
SELECT *
FROM   CUST_ORDERS
WHERE  CUST_ID = 'C100'
AND    ORDER_DATE >= '20260101'
AND    ORDER_DATE <= '20260131'
AND    STATUS = 'COMPLETED';

-- SQL 2
SELECT *
FROM   CUST_ORDERS
WHERE  CUST_ID = 'C100'
AND    ORDER_DATE LIKE '202601%'
AND    STATUS = 'COMPLETED';`,
    choices: [
      [
        "A",
        "SQL 1에서 CUST_ID와 ORDER_DATE는 인덱스 액세스 조건으로 작동한다.",
        "옳은 설명이다. 선두 컬럼 동등 조건과 그 다음 컬럼의 범위 조건은 인덱스 탐색 범위를 결정한다."
      ],
      [
        "B",
        "SQL 1에서 STATUS 컬럼은 인덱스 필터 조건으로 작동한다.",
        "옳은 설명이다. ORDER_DATE가 범위 조건으로 사용된 뒤 뒤쪽 컬럼 STATUS는 탐색 범위를 더 좁히기 어렵고 필터 역할이 될 수 있다."
      ],
      [
        "C",
        "SQL 2에서 ORDER_DATE LIKE '202601%' 조건 때문에 STATUS 컬럼은 인덱스 액세스 조건으로 참여하지 못하고 인덱스 필터 조건으로 저하된다.",
        "옳은 설명이다. LIKE 접두 조건도 범위 조건처럼 동작하므로 뒤쪽 컬럼은 필터가 될 수 있다."
      ],
      [
        "D",
        "SQL 2는 LIKE 범위 조건으로 인해 SQL 1에 비해 인덱스 스캔 블록 수가 획기적으로 줄어든다.",
        "옳지 않은 설명이다. 두 조건 모두 2026년 1월 범위를 의미하므로 LIKE 사용만으로 스캔 블록 수가 획기적으로 줄어든다고 볼 수 없다."
      ]
    ],
    answer: "D",
    relatedConceptId: "tuning-index-scan-efficiency",
    hint: [
      "결합 인덱스에서 선두 컬럼 동등 조건 뒤 범위 조건이 나오면 뒤쪽 컬럼 역할을 확인한다.",
      "BETWEEN 형태와 LIKE 접두 조건이 만들어내는 범위를 비교한다.",
      "LIKE라는 문법 자체가 블록 수를 획기적으로 줄여주는 것은 아니다."
    ],
    explanation:
      "정답은 D이다. SQL 1과 SQL 2는 모두 CUST_ID에 대한 동등 조건 뒤 ORDER_DATE의 월 범위를 탐색한다. STATUS는 뒤쪽 필터 조건으로 작동할 가능성이 높고, LIKE 접두 조건이라고 해서 동일 월 범위보다 스캔 블록 수가 획기적으로 줄어드는 것은 아니다."
  },
  {
    subjectId: "tuning",
    number: 144,
    majorTopic: "SQL 고급활용 및 튜닝",
    middleTopic: "Nested Loops Join",
    topic: "Outer/Inner 필터 적용 순서",
    difficulty: "중급",
    questionType: "NL Join 처리 순서 판단형",
    mode: "original",
    sourceDocument,
    sourcePage: 8,
    sourceQuestionNumber: 12,
    parentQuestionId: "sqlmate-advanced-20q-12",
    stem:
      "Nested Loops Join 동작 시 Outer 테이블과 Inner 테이블 간의 Index Access 조건 및 Filter 조건 적용 순서에 관한 설명으로 옳은 것은?",
    code: `SELECT /*+ LEADING(A B) USE_NL(B) */
       A.EMPNO, A.ENAME, B.DNAME
FROM   EMP A, DEPT B
WHERE  A.DEPTNO = B.DEPTNO
AND    A.JOB = 'MANAGER'
AND    B.LOC = 'SEOUL';`,
    choices: [
      [
        "A",
        "Outer 테이블 A의 모든 행을 조인 조건으로 Inner 테이블 B에 먼저 조인한 후 마지막에 Outer Filter와 Inner Filter를 동시에 검증한다.",
        "틀렸다. Outer Filter는 Outer 집합을 줄이는 데 먼저 적용될 수 있다."
      ],
      [
        "B",
        "Outer 테이블 A에서 JOB = 'MANAGER' 조건을 만족하는 행을 찾을 때마다 순차적으로 Inner 테이블 B로 건너가 조인 조건 및 Inner Filter를 검증한다.",
        "정답이다. NL Join은 Outer에서 추출된 행마다 Inner 접근을 반복하고, Inner 접근 시 조인 조건과 필터 조건을 함께 평가한다."
      ],
      [
        "C",
        "Inner 테이블 B의 LOC = 'SEOUL' 조건을 만족하는 행을 먼저 전체 스캔한 후 Outer 테이블 A와 조인한다.",
        "틀렸다. 제시된 힌트는 LEADING(A B)와 USE_NL(B)이므로 A를 선행 집합으로 보는 NL Join 설명이 적절하다."
      ],
      [
        "D",
        "Outer Filter 조건 만족 여부와 관계없이 Outer 테이블의 전체 ROWID를 추출하여 Inner 테이블 인덱스를 비동기 탐색한다.",
        "틀렸다. Outer 필터를 만족하지 않는 행까지 Inner 탐색을 반복하는 것은 불필요한 처리이다."
      ]
    ],
    answer: "B",
    relatedConceptId: "tuning-nl-join",
    hint: [
      "LEADING(A B) 힌트는 어느 테이블이 선행 집합인지 알려준다.",
      "NL Join은 선행 집합의 행마다 후행 테이블을 반복 접근한다.",
      "Outer 필터로 선행 집합을 줄인 뒤 Inner 접근을 반복하는 흐름이 자연스럽다."
    ],
    explanation:
      "정답은 B이다. LEADING(A B) USE_NL(B)는 A를 선행 집합으로 하여 B를 반복 접근하는 NL Join을 유도한다. 따라서 A에서 JOB 조건을 만족하는 행마다 B로 접근하여 조인 조건과 B.LOC 필터를 평가한다."
  },
  {
    subjectId: "tuning",
    number: 145,
    majorTopic: "SQL 고급활용 및 튜닝",
    middleTopic: "인덱스 스캔",
    topic: "Index Full Scan과 Fast Full Scan",
    difficulty: "중급",
    questionType: "인덱스 스캔 방식 비교형",
    mode: "original",
    sourceDocument,
    sourcePage: 9,
    sourceQuestionNumber: 13,
    parentQuestionId: "sqlmate-advanced-20q-13",
    stem: "Index Full Scan과 Index Fast Full Scan의 비교 설명 중 가장 올바르지 않은 것은?",
    choices: [
      [
        "A",
        "Index Full Scan은 인덱스 리프 블록의 Double Linked List를 따라 순차적으로 읽으므로 결과 집합의 정렬 순서가 보장된다.",
        "옳은 설명이다. 인덱스 키 순서대로 리프 블록을 따라 읽기 때문이다."
      ],
      [
        "B",
        "Index Fast Full Scan은 Multi-Block Read 방식으로 인덱스 세그먼트의 Extent 블록들을 물리적 순서대로 읽으므로 정렬 순서가 보장되지 않는다.",
        "옳은 설명이다. 빠르게 전체 인덱스를 읽는 방식이라 키 순서 보장을 기대하면 안 된다."
      ],
      [
        "C",
        "Index Fast Full Scan은 쿼리에 포함된 모든 컬럼이 인덱스 내에 존재하지 않더라도 Table Random Access를 통해 나머지 컬럼을 가져올 수 있다.",
        "옳지 않은 설명이다. Index Fast Full Scan은 인덱스만 읽는 방식이므로 필요한 컬럼이 인덱스에 모두 있어야 한다."
      ],
      [
        "D",
        "Index Fast Full Scan은 Parallel Query가 가능하다.",
        "옳은 설명이다. 인덱스 세그먼트를 물리적으로 분할해 병렬 읽기가 가능하다."
      ]
    ],
    answer: "C",
    relatedConceptId: "tuning-index-basic",
    hint: [
      "Index Full Scan과 Fast Full Scan은 읽는 순서와 정렬 보장 여부가 다르다.",
      "Fast Full Scan은 테이블을 같이 액세스하는 방식인지 확인한다.",
      "필요한 컬럼이 인덱스에 모두 있는지 여부가 중요하다."
    ],
    explanation:
      "정답은 C이다. Index Fast Full Scan은 인덱스 세그먼트를 빠르게 전체 읽는 방식이며, 테이블 랜덤 액세스로 부족한 컬럼을 가져오는 방식이 아니다. 따라서 쿼리에서 필요한 컬럼이 인덱스에 모두 있어야 사용할 수 있다."
  },
  {
    subjectId: "tuning",
    number: 146,
    majorTopic: "SQL 고급활용 및 튜닝",
    middleTopic: "옵티마이저",
    topic: "Selectivity와 Cardinality",
    difficulty: "중급",
    questionType: "CBO 계산형",
    mode: "original",
    sourceDocument,
    sourcePage: 9,
    sourceQuestionNumber: 14,
    parentQuestionId: "sqlmate-advanced-20q-14",
    stem: "아래 조건에 대한 CBO의 선택도 및 카디널리티 계산 결과로 올바른 것은?",
    passage:
      "전체 건수 Num_Rows = 10,000건, 컬럼 GENDER의 Distinct Value = 2, 컬럼 AGE의 Distinct Value = 50, Histogram 없음, Null 없음, AGE의 Min = 1, Max = 50이다. 조건절은 WHERE GENDER = 'M' AND AGE >= 41 이다.",
    choices: [
      ["A", "Selectivity = 0.1, 예상 Cardinality = 1,000건", "정답이다. GENDER 선택도 1/2, AGE >= 41 선택도 10/50을 곱하면 0.5 × 0.2 = 0.1이다."],
      ["B", "Selectivity = 0.02, 예상 Cardinality = 200건", "틀렸다. 두 조건의 선택도를 잘못 곱한 결과이다."],
      ["C", "Selectivity = 0.05, 예상 Cardinality = 500건", "틀렸다. AGE 조건만 0.1로 계산하거나 범위 개수를 잘못 산정한 값이다."],
      ["D", "Selectivity = 0.01, 예상 Cardinality = 100건", "틀렸다. 제시된 균등 분포 가정에서는 너무 낮은 선택도이다."]
    ],
    answer: "A",
    relatedConceptId: "tuning-cardinality",
    hint: [
      "Histogram이 없으면 균등 분포를 가정한다.",
      "GENDER='M'은 2개 값 중 하나이므로 선택도는 0.5이다.",
      "AGE 41~50은 50개 값 중 10개 값이므로 0.2이고 두 조건을 곱한다."
    ],
    explanation:
      "정답은 A이다. GENDER='M'의 선택도는 1/2 = 0.5이고, AGE >= 41은 41부터 50까지 10개 값이므로 10/50 = 0.2이다. 두 조건이 독립이라고 가정하면 전체 선택도는 0.5 × 0.2 = 0.1이고 예상 카디널리티는 10,000 × 0.1 = 1,000건이다."
  },
  {
    subjectId: "tuning",
    number: 147,
    majorTopic: "SQL 고급활용 및 튜닝",
    middleTopic: "서브쿼리 튜닝",
    topic: "Scalar Subquery Caching",
    difficulty: "상급",
    questionType: "스칼라 서브쿼리 판단형",
    mode: "original",
    sourceDocument,
    sourcePage: 10,
    sourceQuestionNumber: 15,
    parentQuestionId: "sqlmate-advanced-20q-15",
    stem: "다음 스칼라 서브쿼리의 특징 및 튜닝 기법에 관한 설명으로 가장 옳지 않은 것은?",
    code: `SELECT E.EMPNO, E.ENAME,
       (SELECT D.DNAME
        FROM   DEPT D
        WHERE  D.DEPTNO = E.DEPTNO) AS DNAME
FROM   EMP E;`,
    choices: [
      [
        "A",
        "스칼라 서브쿼리는 메인쿼리 각 행마다 캐시를 확인하여 입력값 DEPTNO와 출력값 DNAME을 저장해두고 동일 입력 시 캐싱된 값을 사용할 수 있다.",
        "옳은 설명이다. 반복 입력값이 많으면 스칼라 서브쿼리 캐싱 효과가 나타날 수 있다."
      ],
      [
        "B",
        "스칼라 서브쿼리는 단 1개의 컬럼, 1개의 행만 반환해야 하며 2개 이상의 행이 반환되면 Run-time 에러가 발생한다.",
        "옳은 설명이다. 스칼라 서브쿼리는 단일 값이어야 한다."
      ],
      [
        "C",
        "스칼라 서브쿼리는 입력값 종류가 매우 많고 메인쿼리 건수가 대용량이더라도 항상 조인보다 우수한 성능을 보장한다.",
        "옳지 않은 설명이다. Distinct 입력값이 많으면 캐싱 효과가 낮고 반복 실행 비용이 커져 조인이 더 유리할 수 있다."
      ],
      [
        "D",
        "여러 개의 컬럼을 스칼라 서브쿼리로 각각 가져올 때 성능 저하가 발생하면 인라인 뷰를 활용한 Outer Join 등으로 변환하는 것이 바람직하다.",
        "옳은 설명이다. 다수 스칼라 서브쿼리 반복은 조인 기반 재작성 대상이 될 수 있다."
      ]
    ],
    answer: "C",
    relatedConceptId: "tuning-scalar-subquery",
    hint: [
      "스칼라 서브쿼리 캐싱은 입력값 반복이 많을 때 효과가 크다.",
      "입력값 종류가 많으면 캐시 재사용률이 낮아진다.",
      "항상 조인보다 우수하다는 단정이 성립하는지 확인한다."
    ],
    explanation:
      "정답은 C이다. 스칼라 서브쿼리는 동일 입력값이 반복될 때 캐싱 효과를 볼 수 있지만, 입력값 종류가 많거나 대용량 반복 실행이 발생하면 조인으로 재작성하는 편이 더 효율적일 수 있다."
  },
  {
    subjectId: "tuning",
    number: 148,
    majorTopic: "SQL 고급활용 및 튜닝",
    middleTopic: "분석 함수 튜닝",
    topic: "Window Sort 최적화",
    difficulty: "상급",
    questionType: "분석 함수 실행계획 판단형",
    mode: "original",
    sourceDocument,
    sourcePage: 10,
    sourceQuestionNumber: 16,
    parentQuestionId: "sqlmate-advanced-20q-16",
    stem:
      "다음 중 Analytical Window Function 구문 사용 시 인덱스 및 Sort Operation 최적화 메커니즘에 관한 설명으로 가장 옳지 않은 것은?",
    code: `SELECT EMPNO, DEPTNO, SAL,
       ROW_NUMBER() OVER (PARTITION BY DEPTNO ORDER BY SAL DESC) AS RN
FROM   EMP;`,
    choices: [
      [
        "A",
        "DEPTNO + SAL 순서로 구성된 복합 인덱스가 존재하더라도 분석함수 특성상 전체 데이터에 대한 Sort Group By 또는 Window Sort 작업이 무조건 실행된다.",
        "옳지 않은 설명이다. PARTITION BY와 ORDER BY 순서에 맞는 인덱스가 있으면 정렬 부담을 줄이거나 제거할 수 있다."
      ],
      [
        "B",
        "PARTITION BY 컬럼과 ORDER BY 컬럼 순서로 정렬된 인덱스 (DEPTNO, SAL DESC)가 존재하면 Sort Operation을 생략할 수 있다.",
        "옳은 설명이다. 필요한 정렬 순서를 인덱스가 제공하면 Window Sort 비용을 줄일 수 있다."
      ],
      [
        "C",
        "ROW_NUMBER 결과를 WHERE RN <= 3으로 필터링하기 위해 Inline View를 감쌀 경우 최신 CBO는 Pushdown 및 Top-N Stopkey 최적화를 적용할 수 있다.",
        "옳은 설명이다. 상황에 따라 Window Top-N 최적화가 가능하다."
      ],
      [
        "D",
        "분석함수 정렬 과정에서 PGA의 Sort Area Size가 부족하면 Temp Segment에 Write/Read 하는 Disk Sort가 발생한다.",
        "옳은 설명이다. 정렬 메모리가 부족하면 Temp I/O가 발생한다."
      ]
    ],
    answer: "A",
    relatedConceptId: "tuning-sort",
    hint: [
      "분석 함수의 PARTITION BY와 ORDER BY 순서가 인덱스 정렬 순서와 맞는지 확인한다.",
      "정렬 순서를 이미 만족하는 인덱스가 있으면 Window Sort를 줄일 수 있다.",
      "무조건 Sort가 발생한다는 단정이 맞는지 점검한다."
    ],
    explanation:
      "정답은 A이다. 분석 함수라고 해서 항상 전체 Window Sort가 무조건 필요한 것은 아니다. PARTITION BY와 ORDER BY에 맞는 인덱스가 있으면 정렬을 생략하거나 줄일 수 있으며, Top-N 조건과 결합해 추가 최적화도 가능하다."
  },
  {
    subjectId: "tuning",
    number: 149,
    majorTopic: "SQL 고급활용 및 튜닝",
    middleTopic: "SGA와 Latch",
    topic: "CBC Latch와 Hot Block",
    difficulty: "상급",
    questionType: "대기 이벤트 원인 판단형",
    mode: "original",
    sourceDocument,
    sourcePage: 11,
    sourceQuestionNumber: 17,
    parentQuestionId: "sqlmate-advanced-20q-17",
    stem: "SGA Buffer Cache 내의 CBC Latch 경합과 Hot Block 완화 방안으로 가장 옳지 않은 것은?",
    choices: [
      [
        "A",
        "특정 블록에 여러 세션이 동시에 액세스할 때 해당 블록이 속한 Hash Chain을 보호하는 CBC Latch 경합이 발생한다.",
        "옳은 설명이다. 같은 해시 체인 또는 같은 인기 블록 접근이 많으면 latch: cache buffers chains 대기가 증가할 수 있다."
      ],
      [
        "B",
        "SQL을 튜닝하여 Logical Reads를 감소시키면 CBC Latch 탐색 횟수 자체가 줄어들어 경합이 완화된다.",
        "옳은 설명이다. 논리 읽기 감소는 버퍼 탐색과 래치 획득 횟수 감소로 이어진다."
      ],
      [
        "C",
        "Hot Block 테이블이나 인덱스에 대해 PCTFREE를 줄이고 테이블 Compress 옵션을 적용하여 한 블록 내에 최대한 많은 행을 밀어 넣는 것이 CBC Latch 완화의 핵심이다.",
        "옳지 않은 설명이다. 한 블록에 더 많은 행을 모으면 오히려 특정 블록 접근 집중이 심해질 수 있다."
      ],
      [
        "D",
        "Hash Cluster, Reverse Key Index, 데이터 재배치 등으로 접근 블록을 분산하면 Hot Block 완화에 도움이 될 수 있다.",
        "옳은 설명이다. 접근 위치를 여러 블록으로 분산시키는 방식은 Hot Block 완화에 유효하다."
      ]
    ],
    answer: "C",
    relatedConceptId: "tuning-architecture",
    hint: [
      "CBC Latch는 버퍼 캐시의 블록 탐색과 관련된 경합이다.",
      "Logical Reads를 줄이거나 접근 블록을 분산하면 경합 완화에 도움이 된다.",
      "한 블록에 더 많은 행을 밀어 넣는 방식이 Hot Block을 줄이는지 생각한다."
    ],
    explanation:
      "정답은 C이다. Hot Block은 특정 블록에 접근이 집중되어 발생한다. 행을 더 촘촘히 저장하면 오히려 같은 블록에 대한 접근 집중이 커질 수 있으므로 CBC Latch 완화의 핵심 방안으로 보기 어렵다."
  },
  {
    subjectId: "tuning",
    number: 150,
    majorTopic: "SQL 고급활용 및 튜닝",
    middleTopic: "SQL Trace와 Wait Event",
    topic: "대기 이벤트 해석",
    difficulty: "중급",
    questionType: "Wait Event 매핑형",
    mode: "original",
    sourceDocument,
    sourcePage: 12,
    sourceQuestionNumber: 18,
    parentQuestionId: "sqlmate-advanced-20q-18",
    stem: "다음 대기 이벤트 및 DB 병목 현상에 대한 연결과 해설 중 가장 올바르지 않은 것은?",
    choices: [
      [
        "A",
        "db file sequential read는 Single Block Read 발생 시 나타나며 주로 인덱스 탐색 및 Table Random Access 시 발생한다.",
        "옳은 설명이다. 인덱스 기반 랜덤 액세스에서 자주 관찰된다."
      ],
      [
        "B",
        "db file scattered read는 Multi-Block Read 발생 시 나타나며 Table Full Scan 또는 Index Fast Full Scan 시 발생한다.",
        "옳은 설명이다. 여러 블록을 흩어진 버퍼 위치로 읽어들이는 Full Scan 계열에서 나타난다."
      ],
      [
        "C",
        "direct path read는 DB Buffer Cache를 거치지 않고 PGA로 직접 블록을 읽는 현상으로 Parallel Query 스캔이나 Temp Segment 스캔 시 주로 나타난다.",
        "옳은 설명이다. 대량 읽기나 병렬 처리에서 버퍼 캐시를 우회하는 직접 경로 읽기가 발생할 수 있다."
      ],
      [
        "D",
        "log file sync는 LGWR가 Redo Log Buffer를 디스크에 기록하는 동안 발생하며 대량 배치 Commit을 자주 일으키는 로직보다 단일 Commit을 모아서 처리할 때 더 심각하게 증가한다.",
        "옳지 않은 설명이다. log file sync는 Commit 대기와 밀접하며 잦은 Commit이 증가 원인이 되기 쉽다."
      ]
    ],
    answer: "D",
    relatedConceptId: "tuning-sql-trace",
    hint: [
      "각 대기 이벤트가 Single Block, Multi-Block, Direct Path, Commit 중 무엇과 연결되는지 구분한다.",
      "log file sync는 Commit 요청과 LGWR 기록 완료 대기와 연결된다.",
      "Commit을 모으면 일반적으로 log file sync 발생 횟수는 줄어든다."
    ],
    explanation:
      "정답은 D이다. log file sync는 세션이 Commit 후 LGWR의 Redo 기록 완료를 기다릴 때 나타난다. 잦은 Commit이 발생하면 대기 횟수와 비용이 커질 수 있으며, Commit을 적절히 모으면 완화될 수 있다."
  },
  {
    subjectId: "tuning",
    number: 151,
    majorTopic: "SQL 고급활용 및 튜닝",
    middleTopic: "파티션 인덱스",
    topic: "Local Index와 Global Index",
    difficulty: "상급",
    questionType: "파티션 인덱스 가용성 판단형",
    mode: "original",
    sourceDocument,
    sourcePage: 12,
    sourceQuestionNumber: 19,
    parentQuestionId: "sqlmate-advanced-20q-19",
    stem: "파티션 테이블의 Local Index와 Global Index 구조 및 가용성에 대한 설명 중 가장 옳지 않은 것은?",
    choices: [
      [
        "A",
        "Local Partitioned Index는 테이블 파티션과 인덱스 파티션이 1:1로 매핑되어 관리 편의성이 뛰어나다.",
        "옳은 설명이다. 테이블 파티션 작업이 해당 로컬 인덱스 파티션에 국한되는 장점이 있다."
      ],
      [
        "B",
        "Global Partitioned Index는 테이블 파티션 키와 다른 키로 인덱스를 파티셔닝할 수 있다.",
        "옳은 설명이다. Global Index는 테이블 파티션 구조와 별개로 인덱스 파티션을 구성할 수 있다."
      ],
      [
        "C",
        "특정 테이블 파티션을 DROP하거나 TRUNCATE할 때 Local Index는 해당 파티션의 인덱스 세그먼트만 삭제되므로 타 파티션 인덱스는 USABLE 상태를 유지한다.",
        "옳은 설명이다. Local Index는 파티션 단위 관리가 쉽다."
      ],
      [
        "D",
        "특정 테이블 파티션을 DROP할 때 Global Index는 UPDATE GLOBAL INDEXES 옵션을 주지 않더라도 타 파티션의 인덱스가 불능 상태로 빠지지 않는다.",
        "옳지 않은 설명이다. Global Index는 테이블 파티션 삭제로 ROWID 매핑이 깨질 수 있어 관리 옵션 없이 UNUSABLE 상태가 될 수 있다."
      ]
    ],
    answer: "D",
    relatedConceptId: "tuning-partitioning",
    hint: [
      "Local Index는 테이블 파티션과 1:1로 대응한다.",
      "Global Index는 여러 테이블 파티션을 가로질러 ROWID를 관리한다.",
      "테이블 파티션 삭제가 Global Index의 가용성에 어떤 영향을 주는지 확인한다."
    ],
    explanation:
      "정답은 D이다. Global Index는 테이블 파티션 작업의 영향을 받아 인덱스 엔트리의 ROWID 정합성이 깨질 수 있다. UPDATE GLOBAL INDEXES 같은 옵션을 고려하지 않으면 UNUSABLE 상태가 될 수 있다."
  },
  {
    subjectId: "tuning",
    number: 152,
    majorTopic: "SQL 고급활용 및 튜닝",
    middleTopic: "SQL 공유와 바인드 변수",
    topic: "Adaptive Cursor Sharing",
    difficulty: "상급",
    questionType: "바인드 변수 최적화 판단형",
    mode: "original",
    sourceDocument,
    sourcePage: 13,
    sourceQuestionNumber: 20,
    parentQuestionId: "sqlmate-advanced-20q-20",
    stem:
      "바인드 변수 사용과 Histogram, Adaptive Cursor Sharing 동작 메커니즘에 관한 설명으로 가장 올바르지 않은 것은?",
    choices: [
      [
        "A",
        "바인드 변수를 사용하면 Hard Parsing 횟수를 크게 줄여 Shared Pool의 Library Cache Latch 경합을 줄일 수 있다.",
        "옳은 설명이다. SQL 텍스트 공유가 가능해져 파싱 부하를 줄일 수 있다."
      ],
      [
        "B",
        "바인드 변수를 사용하는 SQL은 최적화 시점에 데이터 분포도 활용이 제한되므로 데이터가 치우친 컬럼에 대해 부적절한 실행계획이 고정될 위험이 있다.",
        "옳은 설명이다. 바인드 값에 따라 선택도가 크게 달라지는 컬럼에서는 한 계획이 모든 값에 적합하지 않을 수 있다."
      ],
      [
        "C",
        "Adaptive Cursor Sharing은 바인드 변수를 사용하는 SQL이라도 바인드 값에 따라 실행계획을 다르게 선택할 수 있게 해주는 기능이다.",
        "옳은 설명이다. 바인드 민감 SQL에 대해 여러 Child Cursor와 실행계획을 관리할 수 있다."
      ],
      [
        "D",
        "ACS가 작동하더라도 Bind Peeking 메커니즘은 완전히 비활성화되며 최초 하드 파싱 시점에는 히스토그램을 전혀 참조하지 않는다.",
        "옳지 않은 설명이다. Bind Peeking과 히스토그램 정보가 최초 계획 형성에 영향을 줄 수 있고 ACS는 이후 바인드 값별 실행 특성을 반영해 계획을 보완한다."
      ]
    ],
    answer: "D",
    relatedConceptId: "tuning-sql-sharing",
    hint: [
      "바인드 변수는 파싱 부하를 줄이지만 데이터 치우침 문제를 만들 수 있다.",
      "Bind Peeking과 ACS는 서로 완전히 배타적인 기능인지 확인한다.",
      "ACS는 실행 후 관찰된 바인드 값별 성능 차이를 바탕으로 여러 계획을 관리할 수 있다."
    ],
    explanation:
      "정답은 D이다. Adaptive Cursor Sharing이 있다고 해서 Bind Peeking이 완전히 비활성화되는 것은 아니다. 최초 하드 파싱 시점의 바인드 값과 통계 정보가 계획에 영향을 줄 수 있고, ACS는 이후 바인드 값별 선택도 차이를 감지해 여러 Child Cursor와 실행계획을 관리한다."
  }
];
