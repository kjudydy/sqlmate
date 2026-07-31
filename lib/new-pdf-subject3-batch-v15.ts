import type { ChoiceId, Difficulty, ObjectiveQuestion, SubjectId } from "@/lib/types";
import type { PdfReviewLab } from "@/lib/pdf-review-bank";

type ManualPdfExtensionQuestion = {
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

const reconstruction53 = "sqlp_53_exam_reconstruction.pdf";
const advancedExam = "sqlp_advanced_exam.pdf";
const subject3Advanced = "SQLP_Subject3_Advanced_20Questions.pdf";

export const newPdfSubject3ObjectiveBatch15: ManualPdfExtensionQuestion[] = [
  {
    subjectId: "tuning",
    number: 301,
    majorTopic: "SQL 고급활용 및 튜닝",
    middleTopic: "Oracle 아키텍처",
    topic: "DB 버퍼 캐시와 Latch",
    difficulty: "상급",
    questionType: "아키텍처 개념 판단형",
    mode: "original",
    sourceDocument: advancedExam,
    sourcePage: 1,
    sourceQuestionNumber: 1,
    stem: "다음 중 DB 버퍼 캐시 및 Lock/Latch 메커니즘에 대한 설명으로 가장 올바르지 않은 것은?",
    choices: [
      ["A", "Buffer Pinning은 동일 블록을 연속해서 액세스할 때 CBC Latch 획득 부담을 줄이는 데 도움이 될 수 있다.", "오답이다. 동일 블록을 반복 접근할 때 불필요한 latch 탐색 부담을 줄이는 방향의 설명으로 볼 수 있다."],
      ["B", "MVCC 모델에서 일반적인 읽기 작업은 Shared Lock을 요구하지 않으므로 DML과 읽기 사이의 블로킹을 줄인다.", "오답이다. Oracle의 일관 읽기는 Undo를 이용해 읽기 일관성을 제공하므로 일반 조회가 DML 행 잠금을 기다리는 구조가 아니다."],
      ["C", "Cache Buffers Chains Latch 경합을 줄이기 위해 Hash Bucket 수를 늘리면 Hash Chain 평균 길이가 길어져 Latch 대기가 감소한다.", "정답이다. Bucket 수가 늘면 보통 하나의 Bucket에 매달리는 블록 수가 줄어 Chain 평균 길이가 짧아지는 방향이다. 길어진다는 설명이 틀렸다."],
      ["D", "Free Buffer 탐색 중 Dirty Buffer만 계속 발견되면 DBWR에 쓰기 요청을 보낸 뒤 free buffer waits 대기가 나타날 수 있다.", "오답이다. 재사용 가능한 버퍼 확보가 지연될 때 free buffer waits가 발생할 수 있다."]
    ],
    answer: "C",
    relatedConceptId: "tuning-sql-trace",
    hint: ["CBC Latch가 어떤 구조를 보호하는지 떠올린다.", "Hash Bucket 수와 Chain 길이의 관계를 본다.", "Bucket이 늘면 같은 Bucket에 몰리는 블록 수가 보통 줄어든다."],
    explanation: "Cache Buffers Chains Latch는 버퍼 캐시의 해시 체인을 탐색할 때 경합이 발생할 수 있다. Hash Bucket 수를 늘리면 동일 Bucket에 연결되는 블록 수가 줄어 Chain 탐색 길이가 짧아지는 방향이므로, Chain 평균 길이가 길어진다는 설명은 반대다."
  },
  {
    subjectId: "tuning",
    number: 302,
    majorTopic: "SQL 고급활용 및 튜닝",
    middleTopic: "실행계획",
    topic: "DBMS_XPLAN ALLSTATS LAST",
    difficulty: "상급",
    questionType: "실행계획 통계 해석형",
    mode: "original",
    sourceDocument: reconstruction53,
    sourcePage: 2,
    sourceQuestionNumber: 3,
    stem: "DBMS_XPLAN.DISPLAY_CURSOR 함수 호출 시 format에 'ALLSTATS LAST'를 지정했을 때 가장 올바른 설명은?",
    code: "SELECT *\nFROM TABLE(DBMS_XPLAN.DISPLAY_CURSOR(NULL, NULL, 'ALLSTATS LAST'));",
    choices: [
      ["A", "가장 최근 실행된 쿼리의 예상 실행계획 정보만 출력한다.", "오답이다. ALLSTATS LAST는 예상 정보만이 아니라 마지막 실행의 실제 통계를 함께 보여주는 데 의미가 있다."],
      ["B", "커서의 전체 실행 횟수에 대한 평균 통계치와 예상 통계치를 모두 출력한다.", "오답이다. LAST는 전체 평균이 아니라 마지막 실행 통계를 보는 옵션이다."],
      ["C", "마지막 실행 건에 대한 실제 실행 통계와 예상 통계를 함께 출력한다.", "정답이다. A-Rows, A-Time, Buffers 같은 실제 통계와 E-Rows를 비교할 수 있다."],
      ["D", "모든 커서의 과거 execution history 전체 통계치를 요약해서 보여준다.", "오답이다. DISPLAY_CURSOR는 특정 커서의 실행계획을 표시하는 함수이지 모든 커서 이력을 요약하는 기능이 아니다."]
    ],
    answer: "C",
    relatedConceptId: "tuning-explain-plan",
    hint: ["ALLSTATS가 실제 실행 통계와 관련됨을 확인한다.", "LAST가 평균인지 마지막 실행인지 구분한다.", "E-Rows와 A-Rows 비교가 핵심이다."],
    explanation: "GATHER_PLAN_STATISTICS 힌트 또는 관련 설정으로 통계를 수집한 뒤 ALLSTATS LAST를 사용하면 마지막 실행의 실제 행 수, 시간, 버퍼 사용량 등을 예상치와 함께 비교할 수 있다."
  },
  {
    subjectId: "tuning",
    number: 303,
    majorTopic: "SQL 고급활용 및 튜닝",
    middleTopic: "조인 튜닝",
    topic: "NL Join Prefetch와 반복 액세스",
    difficulty: "상급",
    questionType: "조인 방식 판단형",
    mode: "original",
    sourceDocument: advancedExam,
    sourcePage: 2,
    sourceQuestionNumber: 3,
    stem: "Nested Loops Join 성능 최적화 및 Prefetch/Batch I/O 동작 방식에 관한 설명 중 가장 올바르지 않은 것은?",
    choices: [
      ["A", "nlj_batching 힌트가 적용되면 Outer 테이블에서 읽은 여러 건을 모아 Inner 테이블 액세스를 일괄 처리할 수 있다.", "오답이다. NL Join의 rowid 기반 테이블 액세스를 묶어 처리해 I/O 효율을 높이려는 설명이다."],
      ["B", "Inner 테이블 액세스 시 Index Rowid Prefetch가 작동하면 테이블 블록 읽기 과정에서 Sequential I/O가 나타날 수 있다.", "오답이다. Rowid를 미리 모아 테이블 블록 접근을 개선하는 동작과 관련된다."],
      ["C", "Outer 테이블의 결과 집합이 크더라도 Inner 테이블 인덱스가 Unique 인덱스면 항상 최상의 성능을 보장한다.", "정답이다. Outer가 크면 Unique 인덱스라도 반복 탐색과 테이블 랜덤 액세스가 커질 수 있어 항상 최선이라고 할 수 없다."],
      ["D", "Driving 테이블의 추출 건수가 많으면 NL Join보다 Hash Join을 선택하는 것이 랜덤 액세스 부담을 줄일 수 있다.", "오답이다. 대량 반복 탐색이 병목이면 Hash Join이 더 나을 수 있다."]
    ],
    answer: "C",
    relatedConceptId: "tuning-nl-join",
    hint: ["NL Join 비용은 Outer 결과 건수에 비례한다.", "Unique 인덱스는 한 번의 탐색 비용을 줄일 뿐 반복 횟수를 없애지 않는다.", "항상 최상이라는 표현을 조심한다."],
    explanation: "NL Join은 Outer 집합의 각 행마다 Inner 쪽 인덱스를 반복 탐색한다. Inner 인덱스가 Unique여도 Outer 결과가 매우 크면 반복 인덱스 탐색과 테이블 랜덤 액세스가 누적되어 Hash Join보다 불리해질 수 있다."
  },
  {
    subjectId: "tuning",
    number: 304,
    majorTopic: "SQL 고급활용 및 튜닝",
    middleTopic: "파티셔닝",
    topic: "Range-Hash Composite Partition Pruning",
    difficulty: "최상급",
    questionType: "파티션 프루닝 판단형",
    mode: "original",
    sourceDocument: advancedExam,
    sourcePage: 2,
    sourceQuestionNumber: 5,
    stem: "Range-Hash Composite Partition 테이블에서 파티션 Pruning 동작에 대한 설명으로 가장 올바르지 않은 것은?",
    choices: [
      ["A", "WHERE 절에 Range 키 조건만 있어도 상위 Range 파티션 수준의 Pruning은 동작할 수 있다.", "오답이다. 상위 Range 파티션 키 조건이 있으면 Range 파티션 제거가 가능하다."],
      ["B", "Hash 키에 동등 조건이 있으면 지정된 Hash 서브파티션을 선택적으로 스캔할 수 있다.", "오답이다. Hash 서브파티션은 해시 키의 동등 조건에서 선택 효과를 기대할 수 있다."],
      ["C", "Dynamic Pruning은 실행 시점에 바인드 변수 값 등에 의해 접근 파티션이 정해지는 방식이다.", "오답이다. KEY 또는 KEY(AP) 표시와 연결되는 동적 프루닝 설명으로 볼 수 있다."],
      ["D", "Hash 서브파티션 키에 LIKE나 BETWEEN 같은 범위 조건을 사용해도 Hash Pruning이 완벽하게 적용된다.", "정답이다. Hash Pruning은 해시 값 계산이 가능한 동등 조건 중심으로 동작하므로 범위 조건에서 완벽한 서브파티션 제거를 기대하기 어렵다."]
    ],
    answer: "D",
    relatedConceptId: "tuning-partition-pruning",
    hint: ["Range 파티션과 Hash 서브파티션의 제거 조건을 구분한다.", "Hash는 범위 순서를 보존하는 구조가 아니다.", "Hash 키에는 동등 조건이 핵심이다."],
    explanation: "Range-Hash Composite Partition에서는 Range 키 조건으로 상위 파티션을 줄이고, Hash 키 동등 조건으로 서브파티션을 줄일 수 있다. Hash 구조는 값의 범위를 순서대로 저장하지 않으므로 LIKE나 BETWEEN 범위 조건으로 완전한 Hash Pruning을 기대하기 어렵다."
  },
  {
    subjectId: "tuning",
    number: 305,
    majorTopic: "SQL 고급활용 및 튜닝",
    middleTopic: "병렬 처리",
    topic: "Parallel Granule과 Redistribution",
    difficulty: "최상급",
    questionType: "병렬 실행 판단형",
    mode: "original",
    sourceDocument: advancedExam,
    sourcePage: 3,
    sourceQuestionNumber: 6,
    stem: "병렬 쿼리 동작 메커니즘과 Granule 및 Redistribution에 대한 설명 중 올바르지 않은 것은?",
    choices: [
      ["A", "Block Range Granule은 PX 서버에 블록 범위를 동적으로 할당하므로 파티션 수보다 병렬도가 커도 비교적 균등한 분배가 가능하다.", "오답이다. 블록 범위 단위 분배는 파티션 개수 제약을 줄일 수 있다."],
      ["B", "Partition Granule은 파티션 단위로 작업을 할당하므로 병렬 프로세스 수가 파티션 수보다 많으면 일부 PX 서버가 대기할 수 있다.", "오답이다. 파티션 수가 병렬도보다 적으면 일을 배정받지 못하는 PX가 생길 수 있다."],
      ["C", "BROADCAST 방식은 조인 드라이빙 집합이 매우 클 때 데이터 송수신 Overhead를 최소화하기 위해 주로 선택된다.", "정답이다. Broadcast는 작은 집합을 모든 PX 서버로 복제할 때 유리하며 큰 집합을 Broadcast하면 전송 부하가 커진다."],
      ["D", "PQ_DISTRIBUTE 힌트로 HASH/HASH, BROADCAST 등 데이터 재분배 방식을 명시적으로 제어할 수 있다.", "오답이다. 병렬 조인에서 분배 방식을 제어하는 대표 힌트다."]
    ],
    answer: "C",
    relatedConceptId: "tuning-parallel",
    hint: ["Broadcast는 어떤 쪽 집합이 작을 때 유리한지 본다.", "Granule은 작업 분배 단위다.", "큰 집합을 모든 서버로 복제하면 부하가 커진다."],
    explanation: "BROADCAST는 작은 테이블 또는 작은 결과 집합을 모든 병렬 서버에 복제해 큰 테이블의 재분배를 피할 때 효과적이다. 조인 대상이 매우 큰데 Broadcast를 적용하면 네트워크와 메모리 부하가 커진다."
  },
  {
    subjectId: "tuning",
    number: 306,
    majorTopic: "SQL 고급활용 및 튜닝",
    middleTopic: "옵티마이저",
    topic: "CBO 통계정보와 Density",
    difficulty: "상급",
    questionType: "통계정보 해석형",
    mode: "original",
    sourceDocument: advancedExam,
    sourcePage: 3,
    sourceQuestionNumber: 7,
    stem: "CBO의 통계정보 및 비용 계산에 대한 설명으로 올바르지 않은 것은?",
    choices: [
      ["A", "히스토그램이 없는 컬럼의 범위 조건에서 CBO는 기본 선택도 추정값을 사용할 수 있다.", "오답이다. 분포 정보가 부족하면 기본 선택도 규칙에 의존할 수 있다."],
      ["B", "Extended Statistics는 두 개 이상 컬럼 간 상관관계를 고려한 카디널리티 추정에 도움을 줄 수 있다.", "오답이다. 복합 컬럼 상관관계가 강할 때 유용하다."],
      ["C", "System Statistics가 있으면 CBO는 블록 수뿐 아니라 CPU, Single/Multi Block Read Time 등을 함께 고려할 수 있다.", "오답이다. 시스템 통계는 I/O와 CPU 비용 모델에 영향을 준다."],
      ["D", "Density 값이 1에 가까울수록 해당 컬럼의 변별력이 매우 뛰어나 인덱스 스캔 비용이 낮게 산정된다.", "정답이다. Density가 1에 가깝다는 것은 NDV가 낮고 중복도가 높다는 뜻에 가까우므로 변별력이 뛰어나다고 보기 어렵다."]
    ],
    answer: "D",
    relatedConceptId: "tuning-optimizer",
    hint: ["Density와 NDV의 관계를 떠올린다.", "NDV가 낮으면 선택도가 좋은지 생각한다.", "Density 1은 변별력이 낮은 쪽에 가깝다."],
    explanation: "Density는 대략 1/NDV와 관련되며 값이 클수록 동일 값이 많이 반복될 가능성이 높다. 따라서 Density가 1에 가까우면 변별력이 낮아 인덱스 효율이 떨어질 수 있다."
  },
  {
    subjectId: "tuning",
    number: 307,
    majorTopic: "SQL 고급활용 및 튜닝",
    middleTopic: "이력 데이터 조회",
    topic: "선분이력 조인 조건",
    difficulty: "상급",
    questionType: "SQL 조건절 선택형",
    mode: "original",
    sourceDocument: subject3Advanced,
    sourcePage: 1,
    sourceQuestionNumber: 1,
    stem: "고객 테이블과 고객등급변경이력, 전화번호변경이력 테이블이 있고 두 이력 테이블은 시작일자와 종료일자로 선분이력을 관리한다. 이름이 '홍길동'인 고객의 1998년 5월 29일자 고객등급과 전화번호를 조회할 때 가장 적절한 조건절은?",
    code: `SELECT c.고객번호, c.고객명, c1.고객등급, c2.전화번호
FROM   고객 c,
       고객등급변경이력 c1,
       전화번호변경이력 c2
WHERE  c.고객명 = '홍길동'
AND    c1.고객번호 = c.고객번호
AND    c2.고객번호 = c.고객번호
AND    /* 조건절 */;`,
    choices: [
      ["A", "c1.변경순번 = (SELECT MAX(변경순번) FROM 고객등급변경이력 WHERE 시작일자 <= '19980529') AND c2.변경순번 = (SELECT MAX(변경순번) FROM 전화번호변경이력 WHERE 시작일자 <= '19980529')", "오답이다. 고객번호 상관 조건이 빠져 전체 이력 중 최대 순번을 고를 수 있고, 각 고객별 현재 이력을 보장하지 못한다."],
      ["B", "c1.변경순번 = (SELECT 변경순번 FROM 고객등급변경이력 WHERE '19980529' BETWEEN 시작일자 AND 종료일자) AND c2.변경순번 = (SELECT 변경순번 FROM 전화번호변경이력 WHERE '19980529' BETWEEN 시작일자 AND 종료일자)", "오답이다. 상관 조건이 없어 여러 고객의 이력이 섞일 수 있고 단일 행 보장도 어렵다."],
      ["C", "'19980529' BETWEEN c1.시작일자 AND c1.종료일자 AND '19980529' BETWEEN c2.시작일자 AND c2.종료일자", "정답이다. 각 이력 테이블의 유효기간 조건을 직접 부여해 해당 기준일에 유효한 행만 조인한다."],
      ["D", "'19980529' BETWEEN c1.시작일자 AND c1.종료일자 AND c1.종료일자 >= c2.시작일자 AND c1.시작일자 <= c2.종료일자", "오답이다. c2 자체가 기준일에 유효한지 확인하지 않고 두 이력 구간의 겹침만 비교한다."]
    ],
    answer: "C",
    relatedConceptId: "tuning-index-design",
    hint: ["선분이력은 특정 시점이 시작일자와 종료일자 사이에 있는지 본다.", "이력 테이블마다 기준일 조건이 필요하다.", "다른 이력과 기간이 겹친다는 조건만으로 기준일 유효성을 보장하지 못한다."],
    explanation: "선분이력 테이블에서 특정 기준일의 상태를 조회하려면 기준일이 각 이력 행의 시작일자와 종료일자 사이에 들어가는 조건을 조인 조건에 직접 부여하는 것이 가장 직관적이다."
  },
  {
    subjectId: "tuning",
    number: 308,
    majorTopic: "SQL 고급활용 및 튜닝",
    middleTopic: "실행계획",
    topic: "실행계획 Operation 매칭",
    difficulty: "상급",
    questionType: "실행계획 매칭형",
    mode: "original",
    sourceDocument: subject3Advanced,
    sourcePage: 2,
    sourceQuestionNumber: 2,
    stem: "다음 실행계획 Operation들과 보기 SQL을 연결할 때, 제시된 실행계획 중 존재하지 않는 SQL은?",
    passage:
      "[제시된 Operation]\n(A) SORT AGGREGATE + TABLE ACCESS FULL\n(B) SORT ORDER BY + TABLE ACCESS FULL\n(C) SORT UNIQUE + TABLE ACCESS FULL\n(D) SORT GROUP BY + TABLE ACCESS FULL",
    choices: [
      ["A", "SELECT * FROM emp ORDER BY deptno", "오답이다. ORDER BY는 별도 정렬이 필요하면 SORT ORDER BY에 대응된다."],
      ["B", "SELECT DISTINCT deptno FROM emp", "오답이다. DISTINCT는 중복 제거를 위해 SORT UNIQUE가 나타날 수 있다."],
      ["C", "SELECT deptno, COUNT(*) FROM emp GROUP BY deptno", "오답이다. GROUP BY 집계는 SORT GROUP BY 또는 Hash Group By가 나타날 수 있다."],
      ["D", "SELECT empno, ename, sal, AVG(sal) OVER(PARTITION BY deptno) FROM emp", "정답이다. 분석 함수는 WINDOW SORT 계열 Operation이 필요할 수 있는데 제시된 Operation에는 없다."]
    ],
    answer: "D",
    relatedConceptId: "tuning-explain-plan",
    hint: ["ORDER BY, DISTINCT, GROUP BY가 각각 어떤 Sort Operation으로 이어지는지 본다.", "분석 함수의 실행계획 키워드를 떠올린다.", "OVER(PARTITION BY)는 WINDOW SORT 계열을 의심한다."],
    explanation: "ORDER BY, DISTINCT, GROUP BY는 각각 SORT ORDER BY, SORT UNIQUE, SORT GROUP BY에 대응될 수 있다. 분석 함수 AVG() OVER(PARTITION BY ...)는 WINDOW SORT 계열 Operation이 나타날 수 있으므로 제시된 네 Operation에는 해당 SQL의 계획이 없다."
  },
  {
    subjectId: "tuning",
    number: 309,
    majorTopic: "SQL 고급활용 및 튜닝",
    middleTopic: "서브쿼리 튜닝",
    topic: "PUSH_SUBQ 힌트",
    difficulty: "상급",
    questionType: "힌트 동작 판단형",
    mode: "original",
    sourceDocument: subject3Advanced,
    sourcePage: 9,
    sourceQuestionNumber: 16,
    stem: "다음 중 /*+ PUSH_SUBQ */ 힌트에 대한 설명으로 가장 올바른 것은?",
    choices: [
      ["A", "Unnesting 되지 않은 일반 필터 조건을 조인 연산보다 나중에 처리하도록 지연시킨다.", "오답이다. PUSH_SUBQ는 서브쿼리 필터를 가능한 앞쪽에서 수행하도록 유도하는 힌트다."],
      ["B", "Unnesting 되지 않은 서브쿼리 필터를 가능한 이른 단계에 실행하여 메인 쿼리의 다음 조인 대상 건수를 줄인다.", "정답이다. 조인 전에 필터링 효과를 얻도록 서브쿼리 수행 위치를 앞당기는 목적이다."],
      ["C", "서브쿼리를 메인 쿼리와 View Merging 하도록 강력하게 권장한다.", "오답이다. View Merging은 인라인 뷰 병합과 관련된 별도 최적화다."],
      ["D", "스칼라 서브쿼리를 Hash Outer Join으로 자동 변환한다.", "오답이다. 스칼라 서브쿼리 변환 여부와 PUSH_SUBQ는 같은 의미가 아니다."]
    ],
    answer: "B",
    relatedConceptId: "tuning-query-transformation",
    hint: ["PUSH라는 단어가 필터 수행 위치를 앞당기는지 늦추는지 생각한다.", "Unnesting이 되지 않은 서브쿼리 필터가 대상이다.", "목표는 다음 조인으로 넘어가는 행 수 감소다."],
    explanation: "PUSH_SUBQ는 Unnesting 되지 않고 FILTER 형태로 남은 서브쿼리를 가능한 이른 시점에 수행하도록 유도해 후속 조인 대상 행 수를 줄이는 데 사용한다."
  },
  {
    subjectId: "tuning",
    number: 310,
    majorTopic: "SQL 고급활용 및 튜닝",
    middleTopic: "인덱스 튜닝",
    topic: "결합 인덱스 컬럼 순서",
    difficulty: "상급",
    questionType: "인덱스 설계 선택형",
    mode: "original",
    sourceDocument: subject3Advanced,
    sourcePage: 10,
    sourceQuestionNumber: 17,
    stem: "다음 세 SQL 패턴을 단 하나의 결합 인덱스로 최대한 효율적으로 지원하려고 한다. 인덱스 컬럼 순서로 가장 적절한 것은?",
    passage:
      "SQL 1: WHERE DEPTNO = :A AND EMP_TYPE = :B AND SAL >= :C\nSQL 2: WHERE DEPTNO = :A AND EMP_TYPE = :B AND ENAME LIKE :D || '%'\nSQL 3: WHERE DEPTNO = :A AND EMP_TYPE = :B",
    choices: [
      ["A", "SAL + ENAME + DEPTNO + EMP_TYPE", "오답이다. 범위 조건 컬럼을 선두에 두면 공통 동등 조건을 효율적으로 활용하기 어렵다."],
      ["B", "DEPTNO + EMP_TYPE + SAL + ENAME", "정답이다. 세 SQL에 공통인 동등 조건 DEPTNO, EMP_TYPE을 선두에 두고 범위/LIKE 조건을 뒤에 배치한다."],
      ["C", "ENAME + SAL + DEPTNO + EMP_TYPE", "오답이다. SQL 1과 SQL 3의 공통 동등 조건을 선두에서 활용하지 못한다."],
      ["D", "DEPTNO + SAL + EMP_TYPE + ENAME", "오답이다. EMP_TYPE이 공통 동등 조건인데 범위 컬럼 SAL 뒤로 밀려 스캔 효율이 떨어진다."]
    ],
    answer: "B",
    relatedConceptId: "tuning-index-design",
    hint: ["여러 SQL에 공통으로 등장하는 등치 조건을 먼저 찾는다.", "범위 조건 뒤의 컬럼은 액세스 효율이 제한될 수 있다.", "세 SQL 모두 DEPTNO와 EMP_TYPE을 사용한다."],
    explanation: "결합 인덱스는 여러 SQL에 공통으로 사용되는 동등 조건 컬럼을 선두에 두는 것이 기본이다. DEPTNO와 EMP_TYPE은 세 SQL 모두에서 동등 조건으로 사용되므로 선두에 두고, SAL과 ENAME 같은 범위/LIKE 조건 컬럼을 뒤에 두는 것이 적절하다."
  },
  {
    subjectId: "tuning",
    number: 311,
    majorTopic: "SQL 고급활용 및 튜닝",
    middleTopic: "Sort 튜닝",
    topic: "Sort Operation 제거",
    difficulty: "상급",
    questionType: "정렬 유발 여부 판단형",
    mode: "original",
    sourceDocument: subject3Advanced,
    sourcePage: 10,
    sourceQuestionNumber: 18,
    stem: "다음 보기 중 실행 시 추가적인 Sort Operation을 유발하지 않을 가능성이 가장 높은 것은?",
    choices: [
      ["A", "SELECT DISTINCT empno, ename FROM emp", "오답이다. DISTINCT는 중복 제거를 위해 SORT UNIQUE를 유발할 수 있다."],
      ["B", "SELECT deptno, SUM(sal) FROM emp GROUP BY deptno", "오답이다. Hash Group By를 배제하면 GROUP BY는 정렬 기반 집계를 유발할 수 있다."],
      ["C", "SELECT * FROM emp WHERE deptno = 10 ORDER BY empno (단, DEPTNO + EMPNO 결합 인덱스 존재)", "정답이다. DEPTNO 등치 조건 후 EMPNO 순서로 인덱스를 읽으면 별도 ORDER BY 정렬을 생략할 수 있다."],
      ["D", "SELECT ename FROM emp INTERSECT SELECT ename FROM dept_mgr", "오답이다. INTERSECT는 중복 제거와 교집합 처리를 위해 정렬 또는 해시 작업이 필요하다."]
    ],
    answer: "C",
    relatedConceptId: "tuning-index-scan-efficiency",
    hint: ["DISTINCT, GROUP BY, INTERSECT는 정렬 또는 해시 작업을 떠올린다.", "ORDER BY가 있어도 인덱스 순서와 맞으면 정렬을 생략할 수 있다.", "DEPTNO + EMPNO 인덱스에서 DEPTNO 등치 후 EMPNO 순서를 본다."],
    explanation: "DEPTNO + EMPNO 결합 인덱스가 있으면 DEPTNO = 10 범위 안에서 EMPNO 순서대로 데이터가 정렬되어 있으므로 ORDER BY EMPNO를 별도 Sort 없이 처리할 수 있다. 반면 DISTINCT, GROUP BY, INTERSECT는 별도 정렬 또는 해시 처리가 필요할 수 있다."
  }
];

export const newPdfSubject3LabBatch15: PdfReviewLab[] = [
  {
    kind: "lab",
    id: "advanced-exam-lab-index-redesign-three-sql",
    title: "세 SQL을 지원하는 결합 인덱스 설계",
    topic: "인덱스 재설계",
    difficulty: "상급",
    mode: "original",
    status: "original_verified",
    source: {
      document: advancedExam,
      page: 5,
      questionNumber: 11,
      verifiedBy: "page_render_and_answer_key",
      verificationNote: "Rendered page and extracted text were checked. The lab is added only as structured SQL/text, not as a full PDF screenshot."
    },
    scenario:
      "주문 테이블에 현재 IDX_01(주문일자, 고객번호) 인덱스가 있고, 고객별 주문 조회, 상태별 주문 조회, 월별 결제금액 집계를 함께 지원해야 한다.",
    requirements: [
      "Random Access를 최소화하면서 세 SQL을 모두 지원할 결합 인덱스 컬럼 순서를 제시하시오.",
      "각 SQL이 제안 인덱스를 어떻게 활용하는지 설명하시오.",
      "SQL 3에서 결제금액을 인덱스에 포함하는 이유를 설명하시오."
    ],
    schemaSql: "주문(고객번호, 주문일자, 주문상태코드, 결제금액, 배송지역코드)\n현재 인덱스: IDX_01(주문일자, 고객번호)",
    currentSql: `[SQL 1]
SELECT *
FROM 주문
WHERE 고객번호 = :cust_no
AND 주문일자 BETWEEN :d1 AND :d2
ORDER BY 주문일자 DESC;

[SQL 2]
SELECT *
FROM 주문
WHERE 고객번호 = :cust_no
AND 주문상태코드 = 'COMP'
AND 주문일자 >= :d1;

[SQL 3]
SELECT 고객번호, SUM(결제금액)
FROM 주문
WHERE 고객번호 = :cust_no
AND 주문일자 LIKE :ym || '%'
GROUP BY 고객번호;`,
    answerSql: "권장 인덱스: 주문_X01(고객번호, 주문상태코드, 주문일자, 결제금액)",
    acceptedAlternatives: [
      "상태 조건이 SQL 2에서만 중요하고 SQL 1의 정렬 제거를 더 우선하면 (고객번호, 주문일자, 주문상태코드, 결제금액)도 대안으로 검토할 수 있다. 다만 SQL 2의 점 조건 필터링 효과는 약해진다."
    ],
    rubric: [
      "공통 동등 조건인 고객번호를 선두에 배치한다.",
      "주문상태코드와 주문일자의 점 조건/범위 조건 순서를 SQL별로 설명한다.",
      "결제금액 포함으로 SQL 3의 Index Only 또는 테이블 랜덤 액세스 감소 효과를 설명한다.",
      "단순히 기존 인덱스 컬럼 순서만 유지하지 않고 세 SQL의 공통 패턴을 함께 고려한다."
    ],
    explanation:
      "세 SQL 모두 고객번호 조건을 사용하므로 고객번호를 선두에 둔다. 주문상태코드는 SQL 2의 점 조건이고 주문일자는 범위 및 정렬 조건으로 사용된다. 결제금액을 뒤에 포함하면 SQL 3의 SUM 집계에서 테이블 액세스를 줄일 수 있다.",
    relatedConcepts: ["Composite Index", "Access Predicate", "Index Only"],
    hints: ["세 SQL에 공통으로 등장하는 등치 조건을 먼저 찾는다.", "점 조건 컬럼과 범위 조건 컬럼의 순서가 스캔 범위에 미치는 영향을 본다.", "SELECT 또는 집계에 필요한 컬럼까지 인덱스에 있으면 테이블 액세스를 줄일 수 있다."],
    validationNotes: ["Source lab 11 from sqlp_advanced_exam.pdf was checked from rendered page 5.", "Existing index-design labs were compared; this one is kept because it evaluates three simultaneous SQL patterns and covering-index reasoning."]
  },
  {
    kind: "lab",
    id: "advanced-exam-lab-latest-order-per-customer-stopkey",
    title: "고객별 최신 주문 1건 추출 SQL 튜닝",
    topic: "고객별 Top-N Stopkey",
    difficulty: "상급",
    mode: "original",
    status: "original_verified",
    source: {
      document: advancedExam,
      page: 7,
      questionNumber: 15,
      verifiedBy: "page_render_and_answer_key",
      verificationNote: "Rendered page and extracted text were checked. Added as structured SQL/text."
    },
    scenario:
      "주문 1천만 건에서 고객별 최신 주문 1건을 추출하는 쿼리가 ROW_NUMBER 윈도우 함수로 전체 데이터를 정렬해 메모리 부하가 크다. 인덱스 (고객번호, 주문일자 DESC, 주문번호 DESC)를 활용해 정렬을 줄이고 싶다.",
    requirements: [
      "기존 ROW_NUMBER 방식의 병목을 설명하시오.",
      "고객별로 인덱스에서 최신 1건만 빠르게 읽는 SQL로 재작성하시오.",
      "왜 전체 Window Sort를 줄일 수 있는지 설명하시오."
    ],
    schemaSql: "주문(고객번호, 주문번호, 주문일자, 결제금액)\n권장 인덱스: 주문_X01(고객번호, 주문일자 DESC, 주문번호 DESC)",
    currentSql: `SELECT 고객번호, 주문번호, 주문일자, 결제금액
FROM (
  SELECT 고객번호, 주문번호, 주문일자, 결제금액,
         ROW_NUMBER() OVER(PARTITION BY 고객번호 ORDER BY 주문일자 DESC, 주문번호 DESC) AS rn
  FROM 주문
)
WHERE rn = 1;`,
    answerSql: `SELECT c.고객번호, o.주문번호, o.주문일자, o.결제금액
FROM (SELECT DISTINCT 고객번호 FROM 주문) c
CROSS APPLY (
  SELECT 주문번호, 주문일자, 결제금액
  FROM 주문 o
  WHERE o.고객번호 = c.고객번호
  ORDER BY o.주문일자 DESC, o.주문번호 DESC
  FETCH FIRST 1 ROWS ONLY
) o;`,
    acceptedAlternatives: [
      "Oracle 버전에 따라 CROSS APPLY 대신 LATERAL inline view 또는 고객 마스터 테이블을 driving table로 사용하는 방식도 가능하다.",
      "고객 집합을 별도 고객 테이블에서 가져올 수 있다면 SELECT DISTINCT 고객번호 스캔 비용을 줄일 수 있다."
    ],
    rubric: [
      "ROW_NUMBER 방식이 전체 또는 대량 Window Sort를 유발할 수 있음을 설명한다.",
      "고객번호별로 인덱스 선두 컬럼을 이용해 최신 순서로 접근한다.",
      "FETCH FIRST 1 ROWS ONLY 또는 ROWNUM = 1로 고객별 Stopkey 처리를 유도한다.",
      "주문일자 DESC, 주문번호 DESC 인덱스 순서와 ORDER BY가 맞아야 함을 설명한다."
    ],
    explanation:
      "ROW_NUMBER 방식은 고객별 순위를 계산하기 위해 대량 Window Sort가 필요할 수 있다. 고객별로 인덱스 (고객번호, 주문일자 DESC, 주문번호 DESC)를 타고 첫 행만 읽으면 각 고객의 최신 주문 1건을 Stopkey 방식으로 가져올 수 있어 정렬 부담을 크게 줄일 수 있다.",
    relatedConcepts: ["Top-N", "Stopkey", "Index Desc Scan"],
    hints: ["전체 순위를 계산하지 않고 고객별 첫 행만 읽는 방법을 찾는다.", "ORDER BY와 인덱스 컬럼 순서가 일치해야 한다.", "FETCH FIRST 1 ROWS ONLY가 각 고객별 내부 조회에 적용되어야 한다."],
    validationNotes: ["Source lab 15 from sqlp_advanced_exam.pdf was checked from rendered page 7.", "Existing paging Top-N labs were compared; this one is kept because it evaluates per-group latest-row retrieval."]
  }
];
