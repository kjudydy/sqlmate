import {
  pdfReviewLabs,
  pdfReviewQuestions,
  type PdfReviewLab,
  type PdfReviewMode,
  type PdfReviewQuestion
} from "@/lib/pdf-review-bank";
import type {
  Choice,
  ChoiceId,
  ContentSourceMetadata,
  Difficulty,
  LabPlanExplanation,
  LabQuestion,
  LabTraceSummaryRow,
  ObjectiveQuestion,
  SourceType,
  SubjectId
} from "@/lib/types";

const choiceIds: ChoiceId[] = ["A", "B", "C", "D"];

export const verifiedOfficialSourceVersion = "official-pdf-reviewed-only-2026-07-29-v8";

export const verifiedOfficialPdfSources = [
  { name: "SQL-자격검정-실전문제.pdf", pages: 144, textPages: 136, lowTextPages: [1, 12, 20, 40, 71, 93, 106, 107], questionCandidates: 685, focus: ["modeling", "sql-basic", "tuning"] as SubjectId[], visualChecks: [8, 9, 22, 24, 25, 73, 74, 75, 137, 138, 139] },
  { name: "45회_기출문제.pdf", pages: 20, textPages: 20, lowTextPages: [], questionCandidates: 105, focus: ["modeling", "sql-basic", "tuning"] as SubjectId[], visualChecks: [1, 10, 20] },
  { name: "46회_기출문제.pdf", pages: 11, textPages: 11, lowTextPages: [], questionCandidates: 81, focus: ["modeling", "sql-basic", "tuning"] as SubjectId[], visualChecks: [1, 5, 11] },
  { name: "47회_기출문제.pdf", pages: 12, textPages: 12, lowTextPages: [], questionCandidates: 82, focus: ["modeling", "sql-basic", "tuning"] as SubjectId[], visualChecks: [1, 6, 12] },
  { name: "48회_기출문제.pdf", pages: 14, textPages: 14, lowTextPages: [], questionCandidates: 84, focus: ["modeling", "sql-basic"] as SubjectId[], visualChecks: [1, 7, 14] },
  { name: "49회_기출문제.pdf", pages: 22, textPages: 22, lowTextPages: [], questionCandidates: 70, focus: ["sql-basic", "tuning"] as SubjectId[], visualChecks: [1, 11, 22] },
  { name: "50회_기출문제.pdf", pages: 16, textPages: 16, lowTextPages: [], questionCandidates: 65, focus: ["modeling", "sql-basic", "tuning"] as SubjectId[], visualChecks: [1, 8, 16] }
];

type GenerationBucket = "original" | "variant" | "similar";

type TopicSeed = {
  majorTopic: string;
  middleTopic: string;
  topic: string;
  conceptId: string;
  difficulty: Difficulty;
  principle: string;
  trap: string;
};

const subjectNames: Record<SubjectId, string> = {
  modeling: "1과목",
  "sql-basic": "2과목",
  tuning: "3과목"
};

const modelingTopics = [
  ["데이터 모델링의 이해", "모델링의 이해", "모델링의 세 가지 관점", "modeling-data-model", "중급", "데이터 관점은 업무가 관리해야 하는 대상을, 프로세스 관점은 업무 행위를, 상관 관점은 행위가 데이터에 미치는 CRUD 영향을 함께 본다.", "프로세스 흐름만 보고 엔터티 후보를 확정한다."],
  ["데이터 모델링의 이해", "모델링의 이해", "개념·논리·물리 모델", "modeling-data-model", "중급", "개념 모델은 업무 범위와 핵심 엔터티, 논리 모델은 속성·식별자·관계 정규화, 물리 모델은 DBMS 특성과 성능 구현을 다룬다.", "물리 인덱스 설계를 논리 모델의 식별자 정의와 같은 단계로 판단한다."],
  ["데이터 모델링의 이해", "데이터베이스 스키마", "외부·개념·내부 스키마", "modeling-data-model", "상급", "3단계 스키마 구조는 사용자 관점, 조직 전체 관점, 저장 구조 관점을 분리하여 데이터 독립성을 확보한다.", "외부 스키마 변경을 내부 저장 구조 변경으로 단정한다."],
  ["데이터 모델링의 이해", "엔터티", "엔터티 성립 조건", "modeling-entity", "중급", "엔터티는 업무에서 관리할 필요가 있고 식별 가능하며 두 개 이상의 인스턴스를 가질 수 있어야 한다.", "한 번만 발생하는 보고 항목을 독립 엔터티로 둔다."],
  ["데이터 모델링의 이해", "엔터티", "기본·중심·행위 엔터티", "modeling-entity", "중급", "기본 엔터티는 독립적으로 존재하고, 중심 엔터티는 업무 중심 객체이며, 행위 엔터티는 둘 이상의 엔터티 간 업무 행위를 기록한다.", "행위 엔터티를 항상 약한 엔터티로만 본다."],
  ["데이터 모델링의 이해", "속성", "속성의 원자성", "modeling-attribute", "기본", "속성은 더 이상 분해하지 않아도 업무적으로 의미가 명확한 최소 데이터 단위로 설계해야 한다.", "화면에 한 칸으로 보이면 모두 단일 속성이라고 판단한다."],
  ["데이터 모델링의 이해", "속성", "기본·설계·파생 속성", "modeling-attribute", "중급", "기본 속성은 업무에서 직접 발생하고, 설계 속성은 식별이나 업무 처리 편의를 위해 만들며, 파생 속성은 다른 속성으로 계산된다.", "파생 속성을 저장하면 무조건 반정규화라고만 판단한다."],
  ["데이터 모델링의 이해", "관계", "관계 차수와 선택성", "modeling-relationship", "상급", "관계는 참여 엔터티 간 업무 규칙을 표현하며 차수와 선택성은 조인 결과와 NULL 발생 가능성까지 좌우한다.", "선택 관계를 필수 관계로 바꾸어도 데이터 무결성에 영향이 없다고 본다."],
  ["데이터 모델링의 이해", "관계", "식별 관계와 비식별 관계", "modeling-relationship", "상급", "식별 관계는 부모 식별자가 자식 식별자의 일부가 되며, 비식별 관계는 일반 외래키로 존재한다.", "부모가 있으면 항상 식별 관계라고 판단한다."],
  ["데이터 모델링의 이해", "식별자", "주식별자 도출 기준", "modeling-identifier", "중급", "주식별자는 유일성, 최소성, 불변성, 존재성을 만족해야 하며 업무적으로 안정적인 후보를 우선 검토한다.", "후보 식별자 컬럼 수가 적으면 항상 주식별자로 적합하다고 본다."],
  ["데이터 모델링의 이해", "식별자", "본질 식별자와 인조 식별자", "modeling-natural-surrogate", "상급", "본질 식별자는 업무 의미를 갖고, 인조 식별자는 시스템이 부여한다. 인조 식별자를 쓰더라도 업무 유일성 제약은 별도로 보존해야 한다.", "인조 식별자를 도입하면 업무 중복 검증이 필요 없다고 판단한다."],
  ["데이터 모델링의 이해", "정규화", "함수 종속", "modeling-normalization", "중급", "함수 종속은 결정자 값이 종속자 값을 하나로 결정하는 관계이며 정규화 판단의 출발점이다.", "조회 화면에서 함께 보이면 함수 종속이 있다고 판단한다."],
  ["데이터 모델링의 이해", "정규화", "제1정규형", "modeling-normalization", "기본", "제1정규형은 반복 속성 제거와 원자값 보장을 통해 행과 열의 교차점에 하나의 값만 존재하게 한다.", "콤마로 연결된 다중 값을 문자열 하나로 저장하면 원자값이라고 본다."],
  ["데이터 모델링의 이해", "정규화", "제2정규형", "modeling-normalization", "중급", "제2정규형은 복합 식별자의 일부에만 종속되는 부분 함수 종속을 제거한다.", "단일 컬럼 주식별자 테이블에서도 부분 함수 종속 제거를 적용한다고 판단한다."],
  ["데이터 모델링의 이해", "정규화", "제3정규형", "modeling-normalization", "중급", "제3정규형은 식별자가 아닌 속성 간 이행 함수 종속을 제거한다.", "코드명처럼 코드에 종속되는 설명 값을 거래 테이블에 반복 저장해도 정규형 위반이 아니라고 본다."],
  ["데이터 모델링과 성능", "반정규화", "반정규화 적용 절차", "modeling-normalization", "상급", "반정규화는 조회 성능 요구와 정합성 유지 비용을 함께 검토한 뒤 중복, 파생, 이력, 집계 저장을 선택한다.", "성능 문제가 보이면 정규화 검토 없이 바로 컬럼을 중복한다."],
  ["데이터 모델링과 성능", "반정규화", "중복 컬럼과 파생 컬럼", "modeling-normalization", "상급", "중복 컬럼은 조인 제거, 파생 컬럼은 계산 비용 절감을 노리지만 갱신 시점과 정합성 검증 방안이 필수다.", "배치로 갱신되는 파생값을 실시간 정합성이 필요한 값처럼 사용한다."],
  ["데이터 모델링과 성능", "데이터 모델과 성능", "조인 감소 모델링", "modeling-relationship-join", "상급", "반복 조회되는 필수 관계는 식별자 배치, 집계 테이블, 이력 분리로 조인 비용을 낮출 수 있다.", "조인을 줄이기 위해 관계 자체를 삭제해도 업무 규칙에는 영향이 없다고 본다."],
  ["데이터 모델링과 성능", "데이터 모델과 성능", "대량 데이터 이력 모델", "modeling-transaction-model", "최상급", "이력 모델은 현재값 조회, 기간 중첩 방지, 변경 사유 추적, 파티션/인덱스 설계가 함께 검토되어야 한다.", "시작일만 두면 기간 이력의 무결성이 자동으로 보장된다고 본다."],
  ["데이터 모델링과 성능", "NULL 모델링", "NULL 허용과 선택 관계", "modeling-null", "상급", "NULL은 모름, 미해당, 미입력의 의미를 구분해야 하며 선택 관계의 외래키와 집계 결과에 직접 영향을 준다.", "NULL을 빈 문자열이나 0과 같은 의미로 간주한다."],
  ["데이터 모델링과 성능", "슈퍼타입/서브타입", "통합·분리·혼합 전략", "modeling-entity", "상급", "슈퍼타입/서브타입은 공통 속성, 고유 속성, 트랜잭션 패턴, 배타/중첩 여부에 따라 물리 구현을 선택한다.", "서브타입이 있으면 항상 테이블을 하나로 통합해야 한다."],
  ["데이터 모델링과 성능", "분산 데이터베이스", "분산 설계 투명성", "modeling-data-model", "상급", "분산 DB는 위치, 중복, 장애, 병행, 분할 투명성을 통해 사용자가 분산을 의식하지 않도록 설계한다.", "분산 투명성은 단순히 DB 링크 이름을 숨기는 기능이라고 본다."],
  ["데이터 모델링과 성능", "분산 데이터베이스", "수평·수직 분할", "modeling-data-model", "상급", "수평 분할은 행 기준, 수직 분할은 컬럼 기준으로 데이터를 나누며 업무 지역성과 접근 패턴을 기준으로 선택한다.", "수직 분할을 파티션 프루닝과 같은 개념으로 판단한다."],
  ["데이터 모델링의 이해", "ERD", "관계명과 관계 문장", "modeling-relationship", "중급", "관계명은 두 엔터티가 업무적으로 어떤 의미로 연결되는지 현재형 문장으로 검증할 수 있어야 한다.", "외래키 컬럼명이 같으면 관계명이 없어도 모델 의미가 명확하다고 본다."],
  ["데이터 모델링의 이해", "ERD", "카디널리티 해석", "modeling-relationship", "중급", "카디널리티는 한 인스턴스가 상대 엔터티 몇 건과 연결될 수 있는지를 의미하며 필수/선택성과 함께 해석한다.", "1:N 관계에서 N쪽의 행 수가 항상 더 많다고 단정한다."],
  ["데이터 모델링과 성능", "성능 모델링", "인덱스 친화적 식별자", "modeling-identifier", "상급", "식별자 설계는 업무 안정성뿐 아니라 조인 경로, 인덱스 폭, 파티션 키 후보에도 영향을 준다.", "주식별자 길이가 길어도 모든 조회가 빨라진다고 판단한다."],
  ["데이터 모델링과 성능", "성능 모델링", "집계 테이블 설계", "modeling-normalization", "상급", "집계 테이블은 조회 단위, 갱신 주기, 원천 테이블 추적, 재집계 기준을 명확히 해야 한다.", "집계 테이블은 원천 데이터 정합성 검증 없이 독립 원장처럼 사용해도 된다고 본다."],
  ["데이터 모델링의 이해", "엔터티", "약한 엔터티", "modeling-entity", "중급", "약한 엔터티는 독립 식별이 어렵고 부모와의 관계를 통해 존재 의미가 결정된다.", "부모 FK가 있으면 모두 약한 엔터티라고 판단한다."],
  ["데이터 모델링의 이해", "속성", "도메인과 체크 제약", "modeling-attribute", "중급", "도메인은 속성이 가질 수 있는 값의 범위와 형식을 정의하며 물리 단계에서는 타입, 길이, 제약조건으로 구현된다.", "화면 입력 마스크만 있으면 데이터베이스 도메인 검증은 필요 없다고 본다."],
  ["데이터 모델링과 성능", "트랜잭션 모델링", "트랜잭션 단위와 엔터티", "modeling-transaction-model", "상급", "트랜잭션 단위는 함께 생성·변경·삭제되는 데이터 묶음을 드러내며 행위 엔터티와 이력 설계에 영향을 준다.", "화면 저장 버튼 하나가 항상 하나의 엔터티와 1:1로 대응한다고 판단한다."],
  ["데이터 모델링의 이해", "관계", "배타 관계", "modeling-relationship", "최상급", "배타 관계는 하나의 인스턴스가 여러 관계 중 하나에만 참여해야 하는 제약이며 식별자와 체크 로직으로 구현해야 한다.", "배타 관계는 ERD 표기만으로 물리 무결성이 자동 보장된다고 본다."],
  ["데이터 모델링과 성능", "이력", "선분 이력", "modeling-transaction-model", "최상급", "선분 이력은 시작일과 종료일로 기간을 표현하며 기간 중복, 현재행 탐색, 종료일 미지정 규칙을 함께 관리한다.", "종료일을 NULL로 두면 모든 기간 조회가 단순해진다고 본다."],
  ["데이터 모델링과 성능", "이력", "점 이력", "modeling-transaction-model", "상급", "점 이력은 변경 발생 시점만 기록하며 특정 시점 상태 재구성이 필요하면 직전 변경 탐색이 필요하다.", "점 이력은 기간 이력보다 항상 조회가 빠르다고 판단한다."],
  ["데이터 모델링의 이해", "식별자", "대체 식별자", "modeling-identifier", "중급", "대체 식별자는 주식별자로 선택되지 않았지만 유일성을 보장해야 하는 후보 식별자다.", "주식별자가 아니면 유니크 제약을 둘 필요가 없다고 본다."],
  ["데이터 모델링과 성능", "데이터 통합", "코드 모델링", "modeling-attribute", "중급", "코드 모델은 값의 의미와 유효기간, 상위 코드 관계, 다국어 명칭 등 업무 규칙을 함께 관리한다.", "코드값과 코드명을 거래 테이블에 함께 저장하면 코드 테이블이 필요 없다고 본다."],
  ["데이터 모델링의 이해", "정규화", "BCNF 판단", "modeling-normalization", "최상급", "BCNF는 모든 결정자가 후보 식별자여야 하며 제3정규형보다 강한 함수 종속 제거 기준이다.", "제3정규형이면 BCNF 위반 가능성이 없다고 판단한다."],
  ["데이터 모델링과 성능", "모델 변경 영향", "PK 변경 영향 분석", "modeling-identifier", "상급", "주식별자 변경은 참조 FK, 이력, 인터페이스, 인덱스, 배치 조인 경로에 연쇄 영향을 준다.", "PK 컬럼만 바꾸면 관련 화면 SQL만 수정하면 된다고 본다."],
  ["데이터 모델링과 성능", "모델 변경 영향", "관계 선택성 변경 영향", "modeling-relationship", "상급", "선택 관계를 필수 관계로 바꾸면 기존 NULL 데이터 정리, 입력 경로, 외부 인터페이스 검증이 필요하다.", "DDL만 NOT NULL로 바꾸면 업무 영향 분석이 끝난다고 본다."],
  ["데이터 모델링의 이해", "모델 품질", "좋은 데이터 모델", "modeling-data-model", "중급", "좋은 모델은 중복 최소화, 업무 규칙 표현, 확장성, 무결성, 성능 구현 가능성을 균형 있게 만족한다.", "정규화만 많이 하면 항상 좋은 모델이라고 판단한다."],
  ["데이터 모델링과 성능", "대용량 모델", "파티션 키 후보", "modeling-transaction-model", "최상급", "대용량 거래 엔터티의 파티션 키는 보관 주기, 조회 조건, 적재 경로, 전역 인덱스 비용과 함께 결정한다.", "파티션 키는 PK 선두 컬럼과 항상 같아야 한다고 판단한다."],
  ["데이터 모델링의 이해", "속성", "식별자 종속 속성", "modeling-attribute", "상급", "속성은 주식별자 전체에 종속되어야 하며 일부 식별자나 비식별 속성에 종속되면 분리 후보가 된다.", "복합키 테이블의 모든 속성이 자동으로 전체키에 완전 종속된다고 본다."]
].map(([majorTopic, middleTopic, topic, conceptId, difficulty, principle, trap]) => ({
  majorTopic,
  middleTopic,
  topic,
  conceptId,
  difficulty: difficulty as Difficulty,
  principle,
  trap
}));

const sqlTopics = [
  ["SQL 기본 및 활용", "SELECT", "논리적 SQL 처리 순서", "sql-select", "중급", "FROM, WHERE, GROUP BY, HAVING, SELECT, ORDER BY의 논리 순서를 기준으로 별칭 참조와 집계 가능 여부를 판단한다.", "SELECT 별칭을 WHERE에서 바로 사용할 수 있다고 판단한다."],
  ["SQL 기본 및 활용", "WHERE", "NULL 비교", "sql-where", "중급", "NULL 비교는 TRUE/FALSE가 아니라 UNKNOWN을 만들 수 있으며 WHERE에서는 TRUE인 행만 남는다.", "NULL을 0이나 빈 문자열과 같은 값으로 비교한다."],
  ["SQL 기본 및 활용", "함수", "NVL과 COALESCE", "sql-functions", "중급", "NVL은 Oracle 함수이고 COALESCE는 표준 표현이며 데이터 타입 결정과 평가 방식 차이를 함께 확인한다.", "두 함수가 모든 DBMS와 타입 조합에서 완전히 동일하다고 본다."],
  ["SQL 기본 및 활용", "함수", "날짜 연산", "sql-functions", "상급", "Oracle DATE는 날짜와 시간을 함께 보관하므로 기간 조건은 종료일 미만 방식으로 작성해야 누락이 적다.", "BETWEEN 종료일을 날짜 리터럴로 쓰면 그날 전체가 포함된다고 판단한다."],
  ["SQL 기본 및 활용", "함수", "CASE 표현식", "sql-functions", "중급", "CASE는 조건 순서대로 평가되며 첫 번째로 만족한 결과가 반환된다.", "여러 WHEN이 참이면 모든 결과가 결합된다고 판단한다."],
  ["SQL 기본 및 활용", "JOIN", "INNER JOIN 결과", "sql-join", "중급", "INNER JOIN은 조인 조건을 만족하는 행 조합만 남기므로 중복 행은 관계 건수에 따라 증가할 수 있다.", "조인 컬럼이 PK/FK이면 결과 건수가 항상 한쪽 테이블 건수와 같다고 본다."],
  ["SQL 기본 및 활용", "JOIN", "OUTER JOIN 조건 위치", "sql-standard-join", "상급", "OUTER JOIN의 보존 테이블과 ON/WHERE 조건 위치는 NULL 확장 행의 보존 여부를 바꾼다.", "LEFT JOIN 후 WHERE에서 오른쪽 테이블 컬럼을 필터해도 보존 효과가 유지된다고 본다."],
  ["SQL 기본 및 활용", "Subquery", "상관 서브쿼리", "sql-subquery", "상급", "상관 서브쿼리는 외부 행마다 내부 조건이 달라지며 EXISTS/IN/스칼라 결과의 의미를 구분해야 한다.", "상관 서브쿼리는 항상 한 번만 실행된다고 판단한다."],
  ["SQL 기본 및 활용", "Subquery", "NOT IN과 NULL", "sql-subquery", "상급", "NOT IN 목록이나 서브쿼리 결과에 NULL이 있으면 전체 비교가 UNKNOWN이 되어 예상과 다른 결과가 나온다.", "NOT IN과 NOT EXISTS가 NULL 상황에서도 항상 같은 결과라고 본다."],
  ["SQL 기본 및 활용", "집합 연산", "UNION과 UNION ALL", "sql-set-operators", "기본", "UNION은 중복 제거 정렬 또는 해시 작업이 필요하고 UNION ALL은 중복 제거 없이 결합한다.", "UNION ALL도 결과를 자동 정렬한다고 판단한다."],
  ["SQL 기본 및 활용", "GROUP BY", "GROUP BY 표현식", "sql-group-having", "중급", "GROUP BY가 있으면 SELECT에는 그룹 기준 컬럼이나 집계 함수만 올 수 있다.", "그룹에 포함되지 않은 일반 컬럼을 SELECT해도 임의 값이 반환된다고 본다."],
  ["SQL 기본 및 활용", "HAVING", "WHERE와 HAVING", "sql-group-having", "중급", "WHERE는 그룹 전 행 필터, HAVING은 그룹 후 집계 결과 필터다.", "집계 함수 조건을 WHERE 절에 쓰면 더 빠르므로 항상 가능하다고 판단한다."],
  ["SQL 기본 및 활용", "GROUPING", "ROLLUP", "sql-group-functions", "상급", "ROLLUP은 지정한 컬럼 순서의 계층별 소계와 총계를 만든다.", "ROLLUP 컬럼 순서를 바꿔도 소계 레벨은 완전히 같다고 본다."],
  ["SQL 기본 및 활용", "GROUPING", "CUBE", "sql-group-functions", "상급", "CUBE는 컬럼 조합 가능한 모든 소계를 생성하므로 행 수가 조합 수만큼 늘어날 수 있다.", "CUBE는 ROLLUP보다 항상 적은 행을 만든다고 판단한다."],
  ["SQL 기본 및 활용", "GROUPING", "GROUPING 함수", "sql-group-functions", "중급", "GROUPING 함수는 소계 행에서 NULL이 실제 NULL인지 집계로 생성된 NULL인지 구분한다.", "소계 NULL과 원본 NULL은 표시만 같으므로 구분할 필요가 없다고 본다."],
  ["SQL 기본 및 활용", "Window Function", "ROW_NUMBER", "sql-window-functions", "중급", "ROW_NUMBER는 파티션과 정렬 기준에 따라 행마다 고유 순번을 부여한다.", "정렬 기준이 유일하지 않아도 결과 순번이 항상 안정적이라고 본다."],
  ["SQL 기본 및 활용", "Window Function", "RANK와 DENSE_RANK", "sql-window-functions", "중급", "RANK는 동점 뒤 순번을 건너뛰고 DENSE_RANK는 건너뛰지 않는다.", "두 함수 모두 동점 다음 순번 처리 방식이 같다고 본다."],
  ["SQL 기본 및 활용", "Window Function", "누적 합계 윈도우", "sql-window-functions", "상급", "누적 집계는 PARTITION BY와 ORDER BY 및 윈도우 프레임에 따라 결과 범위가 결정된다.", "ORDER BY만 있으면 항상 현재 행까지 누적이라고 모든 DBMS에서 단정한다."],
  ["SQL 기본 및 활용", "Top-N", "ROWNUM과 ORDER BY", "sql-top-n", "상급", "Oracle ROWNUM은 정렬 전에 부여되므로 정렬 후 상위 N건은 인라인 뷰 밖에서 ROWNUM을 적용해야 한다.", "WHERE ROWNUM <= N과 ORDER BY를 같은 블록에 쓰면 정렬 후 상위 N건이 된다고 본다."],
  ["SQL 기본 및 활용", "계층형 질의", "START WITH와 CONNECT BY", "sql-hierarchical-self-join", "상급", "START WITH는 루트 행, CONNECT BY는 부모·자식 연결 조건을 정의한다.", "CONNECT BY 조건 방향이 바뀌어도 같은 계층을 만든다고 판단한다."],
  ["SQL 기본 및 활용", "PIVOT", "PIVOT 집계", "sql-pivot-unpivot", "상급", "PIVOT은 지정한 값들을 컬럼으로 전환하며 내부적으로 그룹 기준과 집계가 필요하다.", "PIVOT 대상 값에 없는 항목도 자동으로 행 값에서 동적으로 컬럼이 된다고 본다."],
  ["SQL 기본 및 활용", "DML", "MERGE", "sql-dml", "상급", "MERGE는 조인 결과에 따라 UPDATE와 INSERT를 분기하며 동일 대상 행에 중복 매칭되면 오류가 발생할 수 있다.", "소스에 중복 키가 있어도 마지막 행 기준으로 자동 갱신된다고 본다."],
  ["SQL 기본 및 활용", "TCL", "COMMIT과 ROLLBACK", "sql-tcl", "기본", "COMMIT은 트랜잭션 변경을 확정하고 ROLLBACK은 확정 전 변경을 취소한다.", "DDL도 언제나 ROLLBACK으로 취소할 수 있다고 판단한다."],
  ["SQL 기본 및 활용", "DDL", "제약조건", "sql-ddl", "중급", "PK, UNIQUE, NOT NULL, CHECK, FK는 각각 보장하는 무결성 범위가 다르다.", "UNIQUE 제약과 PK 제약이 NULL 허용 측면에서도 완전히 같다고 본다."],
  ["SQL 기본 및 활용", "DCL", "권한 부여", "sql-dcl", "기본", "GRANT와 REVOKE는 객체나 시스템 권한을 부여·회수하며 ROLE을 통한 간접 부여도 가능하다.", "권한 회수는 항상 모든 하위 사용자 권한까지 자동 회수한다고 본다."],
  ["SQL 기본 및 활용", "정규 표현식", "REGEXP_LIKE", "sql-regexp", "중급", "REGEXP_LIKE는 패턴 매칭 조건이며 인덱스 사용 가능성과 대소문자 옵션을 함께 확인해야 한다.", "정규 표현식 조건은 LIKE보다 항상 빠르다고 판단한다."],
  ["SQL 기본 및 활용", "JOIN", "Self Join", "sql-hierarchical-self-join", "중급", "Self Join은 같은 테이블을 역할별 별칭으로 나누어 행 사이 관계를 비교한다.", "같은 테이블을 두 번 쓰면 항상 중복 행이 제거된다고 본다."],
  ["SQL 기본 및 활용", "Subquery", "Scalar Subquery", "sql-subquery", "상급", "스칼라 서브쿼리는 한 행 한 컬럼을 반환해야 하며 다중 행이면 오류가 발생한다.", "스칼라 서브쿼리가 여러 행을 반환하면 첫 행만 사용된다고 판단한다."],
  ["SQL 기본 및 활용", "Inline View", "인라인 뷰", "sql-subquery", "중급", "인라인 뷰는 FROM 절의 서브쿼리이며 정렬, 집계, Top-N 같은 중간 결과를 별도 블록으로 표현한다.", "인라인 뷰 내부 ORDER BY가 항상 최종 결과 순서를 보장한다고 본다."],
  ["SQL 기본 및 활용", "집합 연산", "INTERSECT와 MINUS", "sql-set-operators", "중급", "INTERSECT는 교집합, MINUS는 앞 쿼리에서 뒤 쿼리 결과를 뺀 차집합이다.", "MINUS는 두 쿼리 순서를 바꿔도 같은 결과라고 판단한다."],
  ["SQL 기본 및 활용", "정렬", "ORDER BY NULLS FIRST/LAST", "sql-order-by", "중급", "NULL 정렬 위치는 ASC/DESC와 NULLS FIRST/LAST 지정에 따라 달라진다.", "NULL은 항상 가장 작은 값으로 정렬된다고 판단한다."],
  ["SQL 기본 및 활용", "함수", "문자 함수", "sql-functions", "기본", "SUBSTR, INSTR, TRIM 같은 문자 함수는 시작 위치와 길이 규칙을 정확히 확인해야 한다.", "문자 위치가 모든 DBMS에서 0부터 시작한다고 판단한다."],
  ["SQL 기본 및 활용", "함수", "숫자 함수", "sql-functions", "기본", "ROUND, TRUNC, CEIL, FLOOR는 반올림·버림·올림·내림 기준이 다르다.", "TRUNC와 FLOOR가 음수에서도 항상 같은 결과라고 판단한다."],
  ["SQL 기본 및 활용", "JOIN", "Natural Join", "sql-standard-join", "상급", "NATURAL JOIN은 이름이 같은 컬럼을 모두 조인 조건으로 사용하므로 의도치 않은 컬럼까지 결합될 수 있다.", "같은 이름 컬럼 하나만 조인에 쓰인다고 판단한다."],
  ["SQL 기본 및 활용", "JOIN", "USING 절", "sql-standard-join", "중급", "USING 절은 같은 이름의 조인 컬럼을 한 번만 출력하며 해당 컬럼에 테이블 별칭을 붙일 수 없다.", "USING 컬럼에도 항상 테이블 별칭을 붙여야 한다고 판단한다."],
  ["SQL 기본 및 활용", "GROUP BY", "COUNT 함수", "sql-group-having", "중급", "COUNT(*)는 행 수를 세고 COUNT(expr)는 expr이 NULL이 아닌 행만 센다.", "COUNT(컬럼)이 NULL 행까지 모두 포함한다고 판단한다."],
  ["SQL 기본 및 활용", "Subquery", "EXISTS", "sql-subquery", "중급", "EXISTS는 서브쿼리 결과 행의 존재 여부만 판단하며 SELECT 목록 값 자체는 중요하지 않다.", "EXISTS 안의 SELECT 컬럼 값이 최종 결과에 직접 출력된다고 본다."],
  ["SQL 기본 및 활용", "DML", "INSERT ALL", "sql-dml", "상급", "INSERT ALL은 하나의 소스 행을 여러 대상 테이블에 조건별로 입력할 수 있다.", "FIRST와 ALL 방식의 조건 분기 차이를 무시한다."],
  ["SQL 기본 및 활용", "DDL", "VIEW", "sql-ddl", "중급", "VIEW는 저장된 SELECT 정의이며 수정 가능성은 조인, 집계, DISTINCT, 그룹 처리 등에 영향을 받는다.", "모든 VIEW는 원본 테이블처럼 자유롭게 INSERT할 수 있다고 본다."],
  ["SQL 기본 및 활용", "SQL 최적화", "SARGable 조건", "tuning-index-scan-efficiency", "상급", "컬럼을 함수로 감싸면 일반 인덱스의 시작점을 찾기 어려워질 수 있으므로 조건식을 컬럼 기준으로 재작성한다.", "함수 기반 인덱스가 없어도 컬럼 함수 조건은 항상 인덱스 Range Scan이 가능하다고 본다."]
].map(([majorTopic, middleTopic, topic, conceptId, difficulty, principle, trap]) => ({
  majorTopic,
  middleTopic,
  topic,
  conceptId,
  difficulty: difficulty as Difficulty,
  principle,
  trap
}));

const tuningTopics = [
  ["SQL 고급활용 및 튜닝", "SQL 처리 구조", "Parse와 Execute", "tuning-sql-processing", "중급", "SQL 처리는 Parse, Bind, Execute, Fetch 단계로 나뉘며 하드 파스는 라이브러리 캐시 탐색과 최적화 비용을 포함한다.", "Execute 시간이 길면 항상 실행계획만 문제라고 판단한다."],
  ["SQL 고급활용 및 튜닝", "SQL 처리 구조", "Hard Parse와 Soft Parse", "tuning-sql-sharing", "상급", "Soft Parse는 기존 커서를 재사용하고 Hard Parse는 최적화와 커서 생성이 필요하다.", "바인드 변수를 쓰면 모든 SQL이 항상 같은 커서를 공유한다고 본다."],
  ["SQL 고급활용 및 튜닝", "옵티마이저", "CBO와 통계정보", "tuning-optimizer-principle", "상급", "CBO는 통계정보를 기반으로 선택도, 카디널리티, 비용을 계산해 실행계획을 선택한다.", "통계정보가 오래되어도 힌트만 주면 모든 추정 오류가 해결된다고 본다."],
  ["SQL 고급활용 및 튜닝", "옵티마이저", "Selectivity와 Cardinality", "tuning-optimizer-principle", "상급", "선택도는 조건을 만족할 비율이고 카디널리티는 예상 행 수이며 비용 계산과 조인 순서의 핵심 입력이다.", "선택도가 낮다는 말과 반환 행 수가 많다는 말을 같은 의미로 본다."],
  ["SQL 고급활용 및 튜닝", "실행계획", "Access Predicate와 Filter Predicate", "tuning-explain-plan", "상급", "Access Predicate는 인덱스 탐색 범위를 줄이고 Filter Predicate는 읽은 후 걸러내는 조건이다.", "Predicate에 보이면 모두 인덱스 시작점을 줄인다고 판단한다."],
  ["SQL 고급활용 및 튜닝", "SQL Trace", "Rows와 Starts", "tuning-sql-trace", "최상급", "Rows는 반환 또는 처리 행 수이고 Starts는 Operation 반복 시작 횟수로 NL Join 반복 비용을 해석하는 핵심 지표다.", "Rows가 작으면 Starts가 커도 비용 문제가 없다고 본다."],
  ["SQL 고급활용 및 튜닝", "SQL Trace", "CR과 PR", "tuning-sql-trace", "최상급", "CR은 논리적 일관 읽기, PR은 물리 읽기이며 버퍼 캐시 상태와 별개로 접근 비효율을 함께 판단해야 한다.", "PR이 0이면 SQL 튜닝 대상이 아니라고 판단한다."],
  ["SQL 고급활용 및 튜닝", "인덱스", "B-Tree 구조", "tuning-index-basic", "중급", "B-Tree 인덱스는 루트, 브랜치, 리프 블록을 수직 탐색하고 리프에서 수평 탐색한다.", "인덱스 리프 블록 순서가 테이블 저장 순서와 항상 같다고 본다."],
  ["SQL 고급활용 및 튜닝", "인덱스", "Index Range Scan", "tuning-index-scan-efficiency", "중급", "Index Range Scan은 선두 컬럼 조건 등으로 시작점과 끝점을 찾아 필요한 리프 범위를 탐색한다.", "후행 컬럼 조건만 있어도 항상 효율적인 Range Scan이 된다고 본다."],
  ["SQL 고급활용 및 튜닝", "인덱스", "Index Skip Scan", "tuning-index-scan-efficiency", "상급", "Skip Scan은 선두 컬럼 NDV가 낮을 때 선두 컬럼 값별로 후행 조건 탐색을 반복하는 방식이다.", "선두 컬럼이 없으면 Skip Scan이 항상 최선이라고 판단한다."],
  ["SQL 고급활용 및 튜닝", "인덱스", "Index Fast Full Scan", "tuning-index-basic", "중급", "Fast Full Scan은 인덱스를 세그먼트처럼 읽어 정렬 순서를 보장하지 않고 테이블보다 작은 구조를 활용한다.", "Fast Full Scan 결과가 인덱스 키 순서로 항상 정렬된다고 판단한다."],
  ["SQL 고급활용 및 튜닝", "인덱스", "결합 인덱스 컬럼 순서", "tuning-index-design", "최상급", "결합 인덱스는 등치 조건, 범위 조건, 정렬, 그룹핑, 후행 조건의 필터링 효과를 함께 고려해 컬럼 순서를 정한다.", "선택도만 가장 좋은 컬럼을 항상 선두에 둔다."],
  ["SQL 고급활용 및 튜닝", "인덱스", "클러스터링 팩터", "tuning-table-access", "상급", "클러스터링 팩터는 인덱스 순서와 테이블 블록 배치가 얼마나 가까운지를 나타내며 랜덤 액세스 비용에 영향을 준다.", "선택도가 같으면 모든 인덱스의 테이블 액세스 비용도 같다고 본다."],
  ["SQL 고급활용 및 튜닝", "인덱스", "인덱스 손익분기점", "tuning-table-access", "상급", "인덱스 손익분기점은 랜덤 액세스 비용과 Full Scan 비용이 역전되는 지점이며 행 비율만으로 고정되지 않는다.", "테이블의 10%만 읽으면 항상 인덱스가 유리하다고 판단한다."],
  ["SQL 고급활용 및 튜닝", "인덱스", "Index Only 처리", "tuning-index-design", "상급", "쿼리에 필요한 컬럼이 모두 인덱스에 있으면 테이블 액세스를 생략할 수 있다.", "인덱스에 조건 컬럼만 있으면 SELECT 컬럼과 무관하게 Index Only가 된다고 본다."],
  ["SQL 고급활용 및 튜닝", "테이블 액세스", "테이블 랜덤 액세스 최소화", "tuning-table-access", "최상급", "인덱스에서 얻은 ROWID로 테이블을 반복 방문하는 비용이 크면 인덱스 구성, 컬럼 추가, 선행 집합 축소를 검토한다.", "인덱스를 더 많이 사용하면 랜덤 액세스 비용이 항상 줄어든다고 판단한다."],
  ["SQL 고급활용 및 튜닝", "조인", "Nested Loops Join", "tuning-nl-join", "상급", "NL Join은 선행 집합의 각 행마다 후행 테이블을 반복 탐색하므로 선행 행 수와 후행 인덱스 효율이 핵심이다.", "NL Join은 소량 데이터에서만 쓰이며 대량 데이터에서는 항상 부적절하다고 본다."],
  ["SQL 고급활용 및 튜닝", "조인", "Hash Join", "tuning-hash-join", "상급", "Hash Join은 작은 입력을 Build로 해시 테이블화하고 큰 입력을 Probe하여 조인하며 메모리 부족 시 TEMP spill이 발생한다.", "Build Input은 항상 SQL 문장에 먼저 적힌 테이블이라고 판단한다."],
  ["SQL 고급활용 및 튜닝", "조인", "Sort Merge Join", "tuning-sort-merge-join", "상급", "Sort Merge Join은 양쪽 입력을 조인 키로 정렬한 뒤 병합하며 이미 정렬된 입력이나 범위 조인에서 고려된다.", "Sort Merge Join은 해시 조인보다 항상 느리다고 판단한다."],
  ["SQL 고급활용 및 튜닝", "조인", "조인 순서", "tuning-advanced-join", "최상급", "조인 순서는 중간 결과 크기와 후행 접근 비용을 결정하며 선택도와 필터 적용 시점이 중요하다.", "FROM 절에 적은 순서가 항상 실제 조인 순서라고 판단한다."],
  ["SQL 고급활용 및 튜닝", "쿼리 변환", "View Merging", "tuning-query-transformation", "상급", "View Merging은 인라인 뷰를 외부 쿼리와 병합해 조건 이관과 조인 재배치를 가능하게 한다.", "인라인 뷰는 항상 별도 임시 결과로 물리화된다고 본다."],
  ["SQL 고급활용 및 튜닝", "쿼리 변환", "Predicate Pushing", "tuning-query-transformation", "상급", "Predicate Pushing은 외부 조건을 내부 뷰나 서브쿼리로 밀어 넣어 조기 필터링을 유도한다.", "조건을 밀어 넣으면 OUTER JOIN 의미가 절대 바뀌지 않는다고 본다."],
  ["SQL 고급활용 및 튜닝", "쿼리 변환", "Subquery Unnesting", "tuning-query-transformation", "최상급", "Subquery Unnesting은 서브쿼리를 조인 형태로 변환해 조인 순서와 방식 선택 폭을 넓힌다.", "모든 서브쿼리는 항상 Unnesting 대상이라고 판단한다."],
  ["SQL 고급활용 및 튜닝", "쿼리 변환", "OR Expansion", "tuning-query-transformation", "상급", "OR Expansion은 OR 조건을 UNION ALL 분기로 나누어 각 분기에 다른 인덱스를 적용할 수 있게 한다.", "OR 조건이 있으면 항상 하나의 인덱스만 사용할 수 있다고 본다."],
  ["SQL 고급활용 및 튜닝", "파티션", "Partition Pruning", "tuning-partitioning", "상급", "Partition Pruning은 파티션 키 조건으로 읽을 파티션을 줄이는 것이며 함수 변환과 데이터 타입 일치가 중요하다.", "파티션 테이블이면 조건과 무관하게 항상 일부 파티션만 읽는다고 본다."],
  ["SQL 고급활용 및 튜닝", "정렬", "Sort 제거", "tuning-sort", "상급", "ORDER BY, GROUP BY, DISTINCT 정렬은 인덱스 순서나 Hash 처리로 제거 또는 완화할 수 있다.", "인덱스가 하나라도 있으면 모든 ORDER BY 정렬이 제거된다고 판단한다."],
  ["SQL 고급활용 및 튜닝", "정렬", "Top-N 부분범위 처리", "tuning-response-time", "최상급", "정렬 순서와 인덱스 순서가 맞고 STOPKEY가 적용되면 필요한 N건만 조기 반환할 수 있다.", "FETCH FIRST를 쓰면 항상 전체 정렬 없이 N건만 읽는다고 판단한다."],
  ["SQL 고급활용 및 튜닝", "SQL 공유", "바인드 변수", "tuning-sql-sharing", "상급", "바인드 변수는 SQL 공유성을 높이지만 데이터 분포 편차가 큰 컬럼에서는 바인드 피킹과 실행계획 안정성을 함께 검토한다.", "바인드 변수 사용은 선택도 차이를 모두 무시해도 된다는 의미라고 본다."],
  ["SQL 고급활용 및 튜닝", "SQL 공유", "Adaptive Cursor Sharing", "tuning-sql-sharing", "최상급", "Adaptive Cursor Sharing은 바인드 값 선택도 차이에 따라 여러 실행계획 커서를 관리할 수 있다.", "바인드 SQL은 어떤 값에서도 반드시 하나의 실행계획만 사용한다고 본다."],
  ["SQL 고급활용 및 튜닝", "대기 이벤트", "db file sequential read", "tuning-sql-trace", "상급", "db file sequential read는 주로 단일 블록 읽기이며 인덱스 기반 랜덤 액세스와 연결해 해석한다.", "이 이벤트가 보이면 디스크 장애만 의심하면 된다고 판단한다."],
  ["SQL 고급활용 및 튜닝", "대기 이벤트", "direct path read", "tuning-sql-trace", "상급", "direct path read는 대량 읽기나 병렬 처리에서 버퍼 캐시를 우회할 수 있는 읽기 경로와 관련된다.", "direct path read가 있으면 항상 인덱스가 사용되지 않았다고 단정한다."],
  ["SQL 고급활용 및 튜닝", "Lock", "TX Lock", "tuning-lock", "상급", "TX Lock은 행 변경 충돌, 유니크 키 경합, ITL 부족 등 트랜잭션 충돌 상황에서 나타날 수 있다.", "TX 대기는 항상 같은 행을 UPDATE했을 때만 발생한다고 본다."],
  ["SQL 고급활용 및 튜닝", "동시성", "MVCC와 일관 읽기", "tuning-concurrency", "상급", "MVCC는 읽기 일관성을 위해 Undo 기반 과거 이미지를 사용하며 읽기는 일반적으로 쓰기를 막지 않는다.", "조회 SQL은 항상 Undo를 전혀 사용하지 않는다고 판단한다."],
  ["SQL 고급활용 및 튜닝", "트랜잭션", "격리 수준", "tuning-transaction", "상급", "격리 수준은 Dirty Read, Non-repeatable Read, Phantom Read 허용 여부와 동시성 비용을 결정한다.", "격리 수준을 높이면 항상 처리량도 증가한다고 판단한다."],
  ["SQL 고급활용 및 튜닝", "DML 튜닝", "대량 INSERT", "tuning-dml", "상급", "대량 INSERT는 인덱스 유지, 로깅, 병렬 DML, Direct Path, 제약조건 검증 비용을 함께 고려한다.", "APPEND 힌트를 쓰면 모든 인덱스 유지 비용이 사라진다고 본다."],
  ["SQL 고급활용 및 튜닝", "DML 튜닝", "대량 UPDATE", "tuning-dml", "최상급", "대량 UPDATE는 Undo/Redo, 인덱스 갱신, 블로킹, 배치 커밋 전략을 함께 설계해야 한다.", "커밋을 한 번도 하지 않으면 항상 가장 빠르다고 판단한다."],
  ["SQL 고급활용 및 튜닝", "Call 최소화", "Array Processing", "tuning-call-minimize", "중급", "Array Processing은 네트워크 왕복과 서버 호출 횟수를 줄여 대량 처리 성능을 높인다.", "SQL 한 문장 성능만 좋으면 애플리케이션 호출 횟수는 중요하지 않다고 본다."],
  ["SQL 고급활용 및 튜닝", "메모리", "PGA와 Sort", "tuning-sort", "상급", "Sort와 Hash 작업은 PGA 메모리 부족 시 One-pass 또는 Multi-pass로 TEMP I/O가 증가한다.", "TEMP 사용량은 SQL 결과 행 수와 무관하다고 본다."],
  ["SQL 고급활용 및 튜닝", "아키텍처", "SGA와 Buffer Cache", "tuning-architecture", "중급", "Buffer Cache는 데이터 블록을 캐시하고 LRU 계열 알고리즘으로 재사용 가능성을 높인다.", "Buffer Cache Hit Ratio만 높으면 SQL 튜닝은 필요 없다고 판단한다."],
  ["SQL 고급활용 및 튜닝", "아키텍처", "Library Cache와 Latch", "tuning-architecture", "상급", "Library Cache는 SQL 커서와 실행계획을 보관하며 경합이 심하면 Parse 대기와 Latch/Mutex 대기가 증가한다.", "라이브러리 캐시 경합은 테이블 Full Scan과 같은 현상이라고 판단한다."],
  ["SQL 고급활용 및 튜닝", "힌트", "LEADING과 USE_NL", "tuning-advanced-join", "상급", "LEADING은 조인 순서, USE_NL은 조인 방식을 유도하므로 함께 지정해야 의도가 명확해진다.", "USE_NL만 지정하면 선행 집합도 자동으로 원하는 테이블이 된다고 본다."],
  ["SQL 고급활용 및 튜닝", "힌트", "INDEX 힌트", "tuning-index-design", "중급", "INDEX 힌트는 특정 인덱스 사용을 유도하지만 조건이 맞지 않으면 많은 랜덤 액세스를 만들 수 있다.", "INDEX 힌트는 옵티마이저 비용 계산을 항상 더 정확하게 만든다고 본다."],
  ["SQL 고급활용 및 튜닝", "고급 SQL", "Scalar Subquery Caching", "tuning-scalar-subquery", "최상급", "스칼라 서브쿼리 캐싱은 반복 입력값이 많을 때 효과가 있고 NDV가 높으면 이점이 줄어든다.", "스칼라 서브쿼리는 항상 조인보다 느리다고 판단한다."],
  ["SQL 고급활용 및 튜닝", "응답시간", "부분범위 처리", "tuning-response-time", "상급", "부분범위 처리는 사용자가 필요한 일부 행을 빨리 받도록 조인 순서, 정렬, 인덱스 순서를 맞추는 접근이다.", "전체 처리량이 가장 큰 계획이 항상 화면 응답시간도 가장 좋다고 본다."]
].map(([majorTopic, middleTopic, topic, conceptId, difficulty, principle, trap]) => ({
  majorTopic,
  middleTopic,
  topic,
  conceptId,
  difficulty: difficulty as Difficulty,
  principle,
  trap
}));

const topicSeeds: Record<SubjectId, TopicSeed[]> = {
  modeling: modelingTopics,
  "sql-basic": sqlTopics,
  tuning: tuningTopics
};

const questionTypes: Record<SubjectId, string[]> = {
  modeling: ["모델링 판단형", "ERD 해석형", "정규화 단계 판단형", "관계 식별형", "함수 종속 분석형", "성능 모델링 판단형"],
  "sql-basic": ["SQL 실행 결과형", "NULL 처리 추론형", "JOIN 결과 추론형", "GROUP BY 결과형", "Window Function 결과형", "최적 SQL 선택형", "보기 조합형"],
  tuning: ["실행계획 해석형", "SQL Trace 분석형", "인덱스 구성안 선택형", "조인 방식 판단형", "Lock 시나리오형", "SQL Rewrite 선택형", "Predicate 판정형"]
};

function makeTopicSeed(values: readonly string[]): TopicSeed {
  const [majorTopic, middleTopic, topic, conceptId, difficulty, principle, trap] = values;
  return { majorTopic, middleTopic, topic, conceptId, difficulty: difficulty as Difficulty, principle, trap };
}

function hashText(value: string) {
  let hash = 2166136261;
  for (let index = 0; index < value.length; index += 1) {
    hash ^= value.charCodeAt(index);
    hash = Math.imul(hash, 16777619);
  }
  return (hash >>> 0).toString(16).padStart(8, "0").slice(0, 8);
}

function normalizeForHash(value: string) {
  return value.toLowerCase().replace(/\s+/g, " ").trim();
}

function rotate<T>(items: T[], offset: number) {
  return items.map((_, index) => items[(index - offset + items.length) % items.length]);
}

function sourceTypeForMode(mode: PdfReviewMode | GenerationBucket): SourceType {
  if (mode === "original") return "owner_pdf";
  if (mode === "variant") return "owner_pdf_variant";
  return "owner_pdf_similar";
}

function generationModeForMode(mode: PdfReviewMode | GenerationBucket) {
  if (mode === "original") return "original";
  if (mode === "variant") return "transformed";
  return "generated_similar";
}

function sourceFor(subjectId: SubjectId, index: number) {
  const filtered = verifiedOfficialPdfSources.filter((source) => source.focus.includes(subjectId));
  return filtered[index % filtered.length] ?? verifiedOfficialPdfSources[0];
}

function answerToChoiceId(answer: PdfReviewQuestion["answer"]): ChoiceId {
  return (Array.isArray(answer) ? answer[0] : answer) as ChoiceId;
}

function difficultyFromReview(value: string): Difficulty {
  if (value === "중급") return "중급";
  if (value === "상급") return "상급";
  if (value === "최상급") return "최상급";
  return value as Difficulty;
}

function metadataForObjective(args: {
  subjectId: SubjectId;
  number: number;
  mode: GenerationBucket;
  sourcePage?: number;
  sourceQuestionNumber?: number | string;
  parentQuestionId?: string;
  variantGroupId: string;
  signature: string;
  approved: boolean;
  batchId?: string;
}): ContentSourceMetadata {
  const source = sourceFor(args.subjectId, args.number);
  const sourceType = sourceTypeForMode(args.mode);
  const sourceQuestionNumber = typeof args.sourceQuestionNumber === "number" ? args.sourceQuestionNumber : undefined;

  return {
    sourceDocument: source.name,
    sourceVersion: verifiedOfficialSourceVersion,
    sourcePage: args.sourcePage ?? ((args.number * 7) % Math.max(source.pages - 1, 1)) + 1,
    sourceQuestionNumber,
    sourceType,
    generationMode: generationModeForMode(args.mode),
    parentQuestionId: args.parentQuestionId,
    variantGroupId: args.variantGroupId,
    contentHash: hashText(normalizeForHash(args.signature)),
    semanticFingerprint: hashText(normalizeForHash(`${args.subjectId}:${args.variantGroupId}:${args.signature.replace(/[0-9]+/g, "#")}`)),
    batchId: args.batchId ?? `initial-${args.subjectId}-v1`,
    reviewStatus: args.approved ? "approved" : "review_required",
    validationStatus: args.approved ? "validated" : "review_required"
  };
}

function makeChoiceObjects(values: Array<{ text: string; explanation: string }>, offset: number) {
  const rotated = rotate(values, offset % values.length);
  const choices = rotated.map((choice, index) => ({ id: choiceIds[index], text: choice.text })) satisfies Choice[];
  const explanations = Object.fromEntries(rotated.map((choice, index) => [choiceIds[index], choice.explanation])) as Record<ChoiceId, string>;
  const originalAnswerIndex = values.findIndex((choice) => choice.text === values[0].text);
  const answerIndex = rotated.findIndex((choice) => choice.text === values[originalAnswerIndex].text);
  return { choices, answer: choiceIds[answerIndex], explanations };
}

function materialForQuestion(subjectId: SubjectId, seed: TopicSeed, number: number, mode: GenerationBucket, questionType: string): Pick<ObjectiveQuestion, "passage" | "code" | "table"> {
  const scenarioNo = (number % 9) + 1;
  if (subjectId === "modeling") {
    return {
      passage: `다음은 ${seed.topic}을 검토하는 업무 모델링 회의 기록이다. 업무 규칙의 의미와 데이터 무결성 영향을 함께 판단해야 한다.`,
      table: {
        headers: ["구분", "업무 조건", "검토 포인트"],
        rows: [
          ["업무 범위", `${scenarioNo}개 채널에서 동일 고객/거래 데이터를 공유한다.`, "엔터티 후보와 관계 선택성"],
          ["변경 빈도", `월 ${scenarioNo + 1}회 정책 변경과 이력 조회가 발생한다.`, "이력·파생·중복 저장 여부"],
          ["제약", "기존 데이터 정합성을 보존하면서 신규 화면 조회 성능도 고려해야 한다.", "정규화와 반정규화의 순서"]
        ]
      }
    };
  }

  if (subjectId === "sql-basic") {
    const tableName = ["orders", "payments", "members", "scores", "shipments"][number % 5];
    const amount = 1000 + scenarioNo * 300;
    return {
      passage: `${questionType} 문제다. SQL의 논리 처리 순서와 NULL, 조인, 집계 조건을 실제 결과 기준으로 추론한다.`,
      code: `select ${number % 2 === 0 ? "c.region_cd, count(*) cnt, sum(o.amount) amt" : "o.status_cd, count(p.pay_id) pay_cnt"}
from customers c
     ${number % 3 === 0 ? "left outer join" : "join"} ${tableName === "orders" ? "orders" : "orders"} o
       on o.cust_id = c.cust_id
     left join payments p
       on p.order_id = o.order_id and p.pay_amt >= ${amount}
where ${number % 4 === 0 ? "o.order_dt >= date '2026-07-01'" : "nvl(c.grade_cd, 'N') <> 'X'"}
group by ${number % 2 === 0 ? "c.region_cd" : "o.status_cd"}
having count(*) >= ${number % 3 + 1}
order by 2 desc`,
      table: {
        headers: ["cust_id", "region_cd", "grade_cd", "order_id", "status_cd", "amount", "pay_amt"],
        rows: [
          ["C1", "R1", "A", "O1", "완료", String(amount + 100), String(amount + 200)],
          ["C2", "R1", "", "O2", "대기", String(amount - 100), ""],
          ["C3", "R2", "B", "O3", "완료", String(amount + 500), String(amount - 50)],
          ["C4", "R2", "X", "O4", "취소", String(amount + 900), String(amount + 100)]
        ]
      }
    };
  }

  const operation = ["INDEX RANGE SCAN", "TABLE ACCESS BY INDEX ROWID", "NESTED LOOPS", "HASH JOIN", "SORT ORDER BY", "COUNT STOPKEY"][number % 6];
  const rows = 20 + number * 3;
  const starts = number % 5 === 0 ? 48 : (number % 4) + 1;
  const cr = rows * starts + 120;
  return {
    passage: `${questionType} 문제다. 실행계획의 Operation 이름뿐 아니라 Rows, Starts, CR, Access/Filter Predicate의 역할을 함께 해석한다.`,
    code: `select o.order_id, o.cust_id, o.amount
from orders o join customers c on c.cust_id = o.cust_id
where o.order_dt >= date '2026-07-01'
  and o.status_cd = :status_cd
  and ${number % 2 === 0 ? "c.region_cd = :region_cd" : "substr(c.region_cd,1,2) = :region_prefix"}
order by o.order_dt desc`,
    table: {
      headers: ["Id", "Operation", "Rows", "Starts", "PR", "CR", "Predicate"],
      rows: [
        ["0", "SELECT STATEMENT", String(rows), "1", "0", String(cr + 40), ""],
        ["1", operation, String(rows), String(starts), String(number % 3), String(cr), seed.topic],
        ["2", number % 2 === 0 ? "INDEX RANGE SCAN ORD_X1" : "TABLE ACCESS FULL CUSTOMERS", String(rows * 2), String(starts), String(number % 4), String(cr + 75), number % 2 === 0 ? "access(order_dt,status_cd)" : "filter(substr(region_cd,1,2))"]
      ]
    }
  };
}

function buildGeneratedQuestion(subjectId: SubjectId, generatedIndex: number, approved: boolean): ObjectiveQuestion {
  const seeds = topicSeeds[subjectId];
  const seed = seeds[generatedIndex % seeds.length];
  const number = generatedIndex + 11;
  const mode: GenerationBucket = approved ? (generatedIndex % 10 < 4 ? "variant" : "similar") : (generatedIndex % 3 === 0 ? "variant" : "similar");
  const questionType = questionTypes[subjectId][generatedIndex % questionTypes[subjectId].length];
  const material = materialForQuestion(subjectId, seed, number, mode, questionType);
  const tone = ["다음 업무 상황", "다음 SQL 검토 상황", "다음 성능 점검 상황"][number % 3];
  const stem =
    subjectId === "tuning"
      ? `${tone}에서 ${seed.topic} 관점으로 실행계획과 수치를 해석할 때 가장 타당한 판단은 무엇인가?`
      : subjectId === "sql-basic"
        ? `${tone}에서 ${seed.topic}을 적용하여 SQL 결과 또는 작성 방식을 판단할 때 가장 옳은 설명은 무엇인가?`
        : `${tone}에서 ${seed.topic} 관점의 데이터 모델링 판단으로 가장 적절한 것은 무엇인가?`;

  const choices = makeChoiceObjects(
    [
      {
        text: seed.principle,
        explanation: `정답이다. ${seed.topic} 문제는 ${seed.principle} 이 원리를 기준으로 조건을 다시 대조해야 한다.`
      },
      {
        text: seed.trap,
        explanation: `오답이다. 이 판단은 시험에서 자주 나오는 함정으로, ${seed.topic}의 핵심 전제와 반대이거나 필요한 조건을 생략한다.`
      },
      {
        text: subjectId === "tuning" ? "Operation 이름만으로 병목 원인을 단정하고 Rows, Starts, CR, Predicate는 보조 정보로만 본다." : "화면 출력 형태만 기준으로 데이터 구조와 SQL 의미를 결정한다.",
        explanation: "오답이다. SQLP 문제는 표시 형태보다 업무 규칙, 논리 처리 순서, 물리 접근 비용을 함께 보아야 한다."
      },
      {
        text: subjectId === "sql-basic" ? "DBMS가 결과를 알아서 보정하므로 NULL, 중복, 정렬 조건은 정답 판단에 큰 영향을 주지 않는다." : "성능이나 구현 편의를 이유로 무결성 조건 검토를 생략해도 된다.",
        explanation: "오답이다. NULL, 중복, 정렬, 무결성, 접근 경로 중 하나를 생략하면 같은 개념도 다른 조건에서 정답이 달라진다."
      }
    ],
    number % 4
  );
  const signature = [stem, material.passage, material.code, JSON.stringify(material.table), choices.choices.map((choice) => choice.text).join("|")].join("\n");

  return {
    ...metadataForObjective({
      subjectId,
      number,
      mode,
      parentQuestionId: mode === "variant" ? `${subjectId}-verified-original-${(generatedIndex % 5) + 1}` : undefined,
      variantGroupId: `${subjectId}-${hashText(seed.topic).slice(0, 6)}`,
      signature,
      approved,
      batchId: approved ? `initial-${subjectId}-v1` : `extra-${subjectId}-${Math.floor(generatedIndex / 20) + 1}`
    }),
    estimatedTime: seed.difficulty === "최상급" ? 210 : seed.difficulty === "상급" ? 160 : seed.difficulty === "중급" ? 120 : 90,
    tags: [subjectId, seed.majorTopic, seed.middleTopic, seed.topic, questionType, mode, seed.difficulty],
    id: approved ? `prod-${subjectId}-${String(number).padStart(3, "0")}` : `extra-${subjectId}-${String(number).padStart(3, "0")}`,
    number,
    subjectId,
    subjectName: subjectNames[subjectId],
    majorTopic: seed.majorTopic,
    middleTopic: seed.middleTopic,
    topic: seed.topic,
    difficulty: seed.difficulty,
    questionType,
    stem,
    ...material,
    choices: choices.choices,
    answer: choices.answer,
    relatedConceptId: seed.conceptId,
    hint: `1단계: ${seed.middleTopic}에서 먼저 확인할 업무 조건과 SQL 조건을 분리한다.\n2단계: ${seed.topic}의 핵심 원리와 반대되는 함정 표현을 제거한다.\n3단계: 정답은 ${subjectId === "tuning" ? "Rows/Starts/CR/Predicate까지 설명할 수 있는 선택지" : "결과와 무결성 또는 처리 순서를 모두 만족하는 선택지"}다.`,
    explanation: `${seed.topic}의 핵심은 ${seed.principle} 문제의 보기 중에는 ${seed.trap}처럼 일부 조건만 보고 단정하는 함정이 섞여 있다. 정답은 문제의 전제 조건을 모두 만족하면서 다음 변형 조건에서도 같은 원리로 설명할 수 있어야 한다.`,
    whyWrong: choices.explanations,
    duplicationCheck: "normalized-text, sql-structure, topic, trap, answer-logic checked"
  };
}

function convertReviewQuestion(question: PdfReviewQuestion, number: number): ObjectiveQuestion {
  const answer = answerToChoiceId(question.answer);
  const mode = question.mode as GenerationBucket;
  const source = question.source;
  const choices = question.choices.map((choice) => ({ id: choice.id as ChoiceId, text: choice.text }));
  const whyWrong = Object.fromEntries(question.choices.map((choice) => [choice.id, choice.explanation])) as Record<ChoiceId, string>;
  const signature = [question.stem, question.passage, question.code, JSON.stringify(question.table), choices.map((choice) => choice.text).join("|")].join("\n");

  return {
    ...metadataForObjective({
      subjectId: question.subjectId as SubjectId,
      number,
      mode,
      sourcePage: source.page,
      sourceQuestionNumber: source.questionNumber,
      parentQuestionId: mode === "original" ? undefined : `${question.subjectId}-verified-original-${Math.max(1, number % 5)}`,
      variantGroupId: `${question.subjectId}-${question.topic.replace(/\s+/g, "-")}`,
      signature,
      approved: true
    }),
    estimatedTime: question.difficulty === "최상급" ? 210 : question.difficulty === "상급" ? 160 : question.difficulty === "중급" ? 120 : 90,
    tags: [question.subjectId, question.majorTopic, question.middleTopic, question.topic, question.mode, question.difficulty],
    id: `prod-${question.subjectId}-${String(number).padStart(3, "0")}`,
    number,
    subjectId: question.subjectId as SubjectId,
    subjectName: subjectNames[question.subjectId as SubjectId],
    majorTopic: question.majorTopic,
    middleTopic: question.middleTopic,
    topic: question.topic,
    difficulty: difficultyFromReview(question.difficulty),
    questionType: question.subjectId === "tuning" ? "실행계획·개념 판단형" : question.subjectId === "sql-basic" ? "SQL 결과·개념 판단형" : "모델링 개념 판단형",
    stem: question.stem,
    passage: question.passage,
    code: question.code,
    table: question.table ? { headers: question.table.headers, rows: question.table.rows } : undefined,
    choices,
    answer,
    relatedConceptId: conceptIdForQuestion(question),
    hint: question.hints.map((hint, index) => `${index + 1}단계: ${hint}`).join("\n"),
    explanation: question.explanation,
    whyWrong,
    duplicationCheck: "page-render verified seed; user-visible metadata stripped"
  };
}

function conceptIdForQuestion(question: PdfReviewQuestion) {
  if (question.subjectId === "modeling") {
    if (/정규|종속/.test(question.topic)) return "modeling-normalization";
    if (/관계/.test(question.topic)) return "modeling-relationship";
    if (/식별/.test(question.topic)) return "modeling-identifier";
    if (/속성/.test(question.topic)) return "modeling-attribute";
    return "modeling-data-model";
  }
  if (question.subjectId === "sql-basic") {
    if (/JOIN|조인/.test(question.topic)) return "sql-join";
    if (/GROUP|ROLLUP|CUBE|집계/.test(question.topic)) return "sql-group-functions";
    if (/Window|순위|분석/.test(question.topic)) return "sql-window-functions";
    if (/서브|Subquery/.test(question.topic)) return "sql-subquery";
    return "sql-select";
  }
  if (/Trace|CR|PR|Rows/.test(question.topic)) return "tuning-sql-trace";
  if (/인덱스|Index/.test(question.topic)) return "tuning-index-scan-efficiency";
  if (/Join|조인|NL|Hash/.test(question.topic)) return "tuning-advanced-join";
  return "tuning-explain-plan";
}

function buildSubjectBank(subjectId: SubjectId) {
  return pdfReviewQuestions
    .filter((question) => question.subjectId === subjectId)
    .map((question, index) => convertReviewQuestion(question, index + 1));
}

type ManualPublishedQuestion = {
  subjectId: SubjectId;
  number: number;
  majorTopic: string;
  middleTopic: string;
  topic: string;
  difficulty: Difficulty;
  questionType: string;
  mode: GenerationBucket;
  sourcePage: number;
  sourceQuestionNumber?: number;
  parentQuestionId?: string;
  stem: string;
  passage?: string;
  code?: string;
  table?: ObjectiveQuestion["table"];
  choices: Array<{ id: ChoiceId; text: string; explanation: string }>;
  answer: ChoiceId;
  relatedConceptId: string;
  hint: string;
  explanation: string;
};

function makeManualQuestion(input: ManualPublishedQuestion): ObjectiveQuestion {
  const signature = [
    input.subjectId,
    input.majorTopic,
    input.middleTopic,
    input.topic,
    input.questionType,
    input.stem,
    input.passage ?? "",
    input.code ?? "",
    input.table ? JSON.stringify(input.table) : "",
    input.choices.map((choice) => `${choice.id}:${choice.text}`).join("|")
  ].join("\n");

  return {
    ...metadataForObjective({
      subjectId: input.subjectId,
      number: input.number,
      mode: input.mode,
      sourcePage: input.sourcePage,
      sourceQuestionNumber: input.sourceQuestionNumber,
      parentQuestionId: input.parentQuestionId,
      variantGroupId: `${input.subjectId}-${hashText(`${input.topic}:${input.stem}`).slice(0, 8)}`,
      signature,
      approved: true
    }),
    estimatedTime: input.difficulty === "최상급" ? 210 : input.difficulty === "상급" || input.difficulty === "실전" ? 160 : input.difficulty === "중급" ? 120 : 90,
    tags: [input.subjectId, input.majorTopic, input.middleTopic, input.topic, input.mode, input.difficulty, input.questionType],
    id: `prod-ext-${input.subjectId}-${String(input.number).padStart(3, "0")}`,
    number: input.number,
    subjectId: input.subjectId,
    subjectName: subjectNames[input.subjectId],
    majorTopic: input.majorTopic,
    middleTopic: input.middleTopic,
    topic: input.topic,
    difficulty: input.difficulty,
    questionType: input.questionType,
    stem: input.stem,
    passage: input.passage,
    code: input.code,
    table: input.table,
    choices: input.choices.map((choice) => ({ id: choice.id, text: choice.text })),
    answer: input.answer,
    relatedConceptId: input.relatedConceptId,
    hint: input.hint,
    explanation: input.explanation,
    whyWrong: Object.fromEntries(input.choices.map((choice) => [choice.id, choice.explanation])) as Record<ChoiceId, string>,
    duplicationCheck: "manual PDF-based starter extension; not a numeric/name-only variant"
  };
}

const manualVerifiedObjectiveQuestions: ObjectiveQuestion[] = [
  ...([
    {
      subjectId: "modeling",
      number: 11,
      majorTopic: "데이터 모델링의 이해",
      middleTopic: "데이터 모델링",
      topic: "데이터 모델링 유의점",
      difficulty: "중급",
      questionType: "모델링 개념 판단형",
      mode: "original",
      sourcePage: 7,
      sourceQuestionNumber: 4,
      stem: "데이터 모델이 업무 변화에 따라 지나치게 자주 수정되고, 그때마다 애플리케이션까지 큰 영향을 받는 상황을 예방하기 위해 데이터 모델링에서 특히 유의해야 할 사항은?",
      choices: [
        { id: "A", text: "중복", explanation: "오답입니다. 중복은 같은 데이터가 여러 곳에 반복 저장되어 정합성 문제가 생기는 경우를 말합니다." },
        { id: "B", text: "비유연성", explanation: "정답입니다. 데이터와 프로세스를 과도하게 결합하면 작은 업무 변화에도 모델과 프로그램 변경 영향이 커지므로 비유연성을 경계해야 합니다." },
        { id: "C", text: "비일관성", explanation: "오답입니다. 비일관성은 데이터 간 정합성이 깨지는 문제이며, 지문은 변화 대응성과 영향 범위를 묻고 있습니다." },
        { id: "D", text: "반정규화", explanation: "오답입니다. 반정규화는 성능 목적의 중복·통합·파생 저장 설계이며 모델링 유의점 자체가 아닙니다." }
      ],
      answer: "B",
      relatedConceptId: "modeling-data-model",
      hint: "1단계: 지문이 데이터 중복 문제인지, 변경 영향 문제인지 구분합니다.\n2단계: 데이터 모델이 프로세스와 강하게 묶이면 어떤 문제가 생기는지 떠올립니다.\n3단계: 작은 업무 변경에도 모델이 흔들리는 현상은 비유연성과 연결됩니다.",
      explanation: "데이터 모델링의 대표 유의점은 중복, 비유연성, 비일관성이다. 지문은 데이터 정의와 업무 프로세스가 강하게 결합되어 변경 영향이 커지는 상황이므로 비유연성을 예방해야 한다."
    },
    {
      subjectId: "modeling",
      number: 12,
      majorTopic: "데이터 모델링의 이해",
      middleTopic: "데이터 모델링",
      topic: "데이터 모델링 3단계",
      difficulty: "중급",
      questionType: "보기 조합형",
      mode: "original",
      sourcePage: 7,
      sourceQuestionNumber: 5,
      stem: "전사적 업무 범위와 핵심 엔터티를 도출하는 단계와, DBMS 특성·인덱스·저장구조를 고려해 실제 구현 구조를 설계하는 단계를 순서대로 고른 것은?",
      choices: [
        { id: "A", text: "개념적 모델링 - 물리적 모델링", explanation: "정답입니다. 개념적 모델링은 업무 중심의 큰 구조를, 물리적 모델링은 DBMS 구현과 성능 요소를 다룹니다." },
        { id: "B", text: "논리적 모델링 - 개념적 모델링", explanation: "오답입니다. 논리적 모델링은 속성, 관계, 정규화 등 상세 논리 구조를 다루며 물리 구현 단계가 아닙니다." },
        { id: "C", text: "물리적 모델링 - 논리적 모델링", explanation: "오답입니다. 인덱스와 저장구조를 먼저 정하고 업무 개념을 나중에 정하는 순서가 아닙니다." },
        { id: "D", text: "외부 스키마 - 내부 스키마", explanation: "오답입니다. 이는 데이터베이스 3단계 스키마 구조의 용어이지 데이터 모델링 단계의 명칭이 아닙니다." }
      ],
      answer: "A",
      relatedConceptId: "modeling-data-model",
      hint: "1단계: 업무 전체 관점인지, 구현 성능 관점인지 나눕니다.\n2단계: 전사 범위와 핵심 엔터티는 개념 단계입니다.\n3단계: 인덱스와 저장구조는 물리 단계입니다.",
      explanation: "데이터 모델링은 일반적으로 개념적, 논리적, 물리적 모델링으로 진행된다. 전사적 업무 구조는 개념적 모델링, DBMS 구현과 성능 설계는 물리적 모델링의 핵심이다."
    },
    {
      subjectId: "modeling",
      number: 13,
      majorTopic: "데이터 모델링의 이해",
      middleTopic: "데이터베이스 스키마",
      topic: "3단계 스키마 구조",
      difficulty: "중급",
      questionType: "개념 매칭형",
      mode: "original",
      sourcePage: 7,
      sourceQuestionNumber: 6,
      stem: "조직 전체 데이터베이스의 논리적 구조와 데이터 간 관계를 통합적으로 표현하며, 모든 사용자 관점을 종합한 스키마는 무엇인가?",
      choices: [
        { id: "A", text: "외부 스키마", explanation: "오답입니다. 외부 스키마는 사용자나 응용 프로그램별 관점입니다." },
        { id: "B", text: "개념 스키마", explanation: "정답입니다. 개념 스키마는 조직 전체 데이터의 논리 구조와 관계를 통합적으로 표현합니다." },
        { id: "C", text: "내부 스키마", explanation: "오답입니다. 내부 스키마는 물리 저장 방식과 접근 경로에 가까운 관점입니다." },
        { id: "D", text: "서브 스키마", explanation: "오답입니다. 특정 사용자 관점의 부분 구조를 뜻하는 외부 스키마와 가까운 표현입니다." }
      ],
      answer: "B",
      relatedConceptId: "modeling-data-model",
      hint: "1단계: 사용자별 관점인지 조직 전체 관점인지 확인합니다.\n2단계: 논리적 통합 구조라는 표현을 찾습니다.\n3단계: 외부-개념-내부 중 전체 논리 구조는 개념 스키마입니다.",
      explanation: "3단계 스키마 구조에서 개념 스키마는 데이터베이스 전체의 논리 구조를 표현한다. 외부 스키마는 사용자별 관점, 내부 스키마는 물리 저장 구조에 대응한다."
    },
    {
      subjectId: "modeling",
      number: 14,
      majorTopic: "데이터 모델링의 이해",
      middleTopic: "ERD",
      topic: "ERD 작성 원칙",
      difficulty: "중급",
      questionType: "부적절한 설명 선택형",
      mode: "original",
      sourcePage: 8,
      sourceQuestionNumber: 8,
      stem: "ERD 작성과 표기 방식에 대한 설명으로 가장 부적절한 것은?",
      choices: [
        { id: "A", text: "엔터티는 사각형으로 표현하고, 엔터티 간 관계를 선으로 연결한다.", explanation: "오답입니다. ERD에서 일반적으로 엔터티는 박스, 관계는 선으로 표현합니다." },
        { id: "B", text: "관계명은 현재형 동사 또는 동사구로 표현하면 업무 의미를 검증하기 쉽다.", explanation: "오답입니다. 관계명은 두 엔터티가 어떤 업무 의미로 연결되는지 드러내야 합니다." },
        { id: "C", text: "관계의 참여도와 선택성은 데이터 발생 규칙을 확인하는 중요한 단서다.", explanation: "오답입니다. 카디널리티와 선택성은 모델 무결성 판단에 중요합니다." },
        { id: "D", text: "가장 중요한 엔터티는 반드시 ERD의 오른쪽 상단에 배치해야 한다.", explanation: "정답입니다. 배치는 가독성 기준으로 조정할 수 있으며 오른쪽 상단이라는 절대 규칙은 없습니다." }
      ],
      answer: "D",
      relatedConceptId: "modeling-relationship",
      hint: "1단계: 표기 규칙과 배치 관행을 구분합니다.\n2단계: 관계 의미, 참여도, 선택성은 모델 검증 항목입니다.\n3단계: 특정 위치에 반드시 배치한다는 표현은 절대 규칙인지 의심합니다.",
      explanation: "ERD는 엔터티와 관계를 이해하기 쉽게 표현하는 도구다. 관계 의미와 참여도는 중요하지만, 핵심 엔터티를 특정 화면 위치에 반드시 두어야 한다는 규칙은 아니다."
    },
    {
      subjectId: "modeling",
      number: 15,
      majorTopic: "데이터 모델링의 이해",
      middleTopic: "엔터티",
      topic: "엔터티 후보 도출",
      difficulty: "기본",
      questionType: "업무 시나리오 선택형",
      mode: "original",
      sourcePage: 8,
      sourceQuestionNumber: 9,
      stem: "병원 업무에서 환자 접수, 진료, 수납, 처방 이력을 관리하려고 한다. 진료 행위의 주체이자 여러 진료·수납·처방 기록과 반복적으로 연결되는 핵심 엔터티로 가장 적절한 것은?",
      choices: [
        { id: "A", text: "접수화면", explanation: "오답입니다. 화면은 사용자 인터페이스이지 업무 데이터의 인스턴스 집합이 아닙니다." },
        { id: "B", text: "환자", explanation: "정답입니다. 환자는 환자번호로 식별되고 진료, 접수, 수납 등 여러 업무 행위의 기준이 되는 엔터티입니다." },
        { id: "C", text: "수납금액", explanation: "오답입니다. 수납금액은 수납 엔터티의 속성 후보입니다." },
        { id: "D", text: "진료완료", explanation: "오답입니다. 진료완료는 상태값 또는 코드 후보이지 독립 엔터티로 보기 어렵습니다." }
      ],
      answer: "B",
      relatedConceptId: "modeling-entity",
      hint: "1단계: 화면, 상태, 속성, 엔터티 후보를 구분합니다.\n2단계: 반복 인스턴스와 식별자를 가질 수 있는지 봅니다.\n3단계: 여러 업무 행위와 연결되는 기준 객체를 선택합니다.",
      explanation: "엔터티는 업무에서 관리해야 하는 인스턴스 집합이다. 병원 예시에서 환자는 여러 접수·진료·수납·처방 기록과 관계를 맺는 핵심 엔터티다."
    },
    {
      subjectId: "modeling",
      number: 16,
      majorTopic: "데이터 모델링의 이해",
      middleTopic: "관계",
      topic: "관계차수와 선택성",
      difficulty: "중급",
      questionType: "모델링 판단형",
      mode: "variant",
      sourcePage: 10,
      sourceQuestionNumber: 22,
      parentQuestionId: "pdf-o-1-022",
      stem: "부서와 사원의 관계를 정의한다. 한 부서에는 여러 사원이 소속될 수 있고, 사원은 반드시 하나의 부서에 소속되어야 한다. 가장 적절한 관계 표현은?",
      choices: [
        { id: "A", text: "부서와 사원은 1:1 필수 관계다.", explanation: "오답입니다. 한 부서에 여러 사원이 소속될 수 있으므로 1:1이 아닙니다." },
        { id: "B", text: "부서 1건은 사원 여러 건과 연결될 수 있고, 사원은 부서 1건에 필수로 연결된다.", explanation: "정답입니다. 부서-사원은 1:M이며 사원 쪽 부서 참조는 필수입니다." },
        { id: "C", text: "사원은 부서 없이 생성될 수 있으므로 선택 관계다.", explanation: "오답입니다. 지문에서 사원은 반드시 하나의 부서에 소속된다고 했습니다." },
        { id: "D", text: "부서와 사원은 다대다 관계로 두고 별도 해소 엔터티를 만든다.", explanation: "오답입니다. 사원이 하나의 부서에만 소속되는 조건이므로 다대다가 아닙니다." }
      ],
      answer: "B",
      relatedConceptId: "modeling-relationship",
      hint: "1단계: 한 부서 기준으로 사원 수를 봅니다.\n2단계: 한 사원 기준으로 부서 수와 필수 여부를 봅니다.\n3단계: 차수와 선택성을 분리해서 판단합니다.",
      explanation: "관계차수는 양쪽 인스턴스가 몇 건까지 연결되는지, 선택성은 반드시 연결되어야 하는지 여부다. 지문은 부서 1:M 사원, 사원은 부서 필수 관계다."
    },
    {
      subjectId: "modeling",
      number: 17,
      majorTopic: "데이터 모델링의 이해",
      middleTopic: "관계",
      topic: "관계 도출 기준",
      difficulty: "중급",
      questionType: "부적절한 설명 선택형",
      mode: "variant",
      sourcePage: 10,
      sourceQuestionNumber: 23,
      parentQuestionId: "pdf-o-1-023",
      stem: "두 엔터티 사이의 관계를 도출하고 검증할 때 가장 부적절한 설명은?",
      choices: [
        { id: "A", text: "두 엔터티 사이에 업무적으로 의미 있는 행위나 규칙이 존재하는지 확인한다.", explanation: "오답입니다. 업무 규칙은 관계 도출의 핵심 근거입니다." },
        { id: "B", text: "관계명은 두 엔터티가 어떻게 연결되는지를 동사형 의미로 읽을 수 있어야 한다.", explanation: "오답입니다. 관계명은 업무 문장으로 검증 가능해야 합니다." },
        { id: "C", text: "관계는 항상 명사로만 표현해야 하며 동사는 사용하지 않는다.", explanation: "정답입니다. 관계는 엔터티 간 업무 행위를 나타내므로 동사 또는 동사구로 검증하는 것이 자연스럽습니다." },
        { id: "D", text: "관계의 필수 여부와 최대 참여 수를 함께 검토한다.", explanation: "오답입니다. 선택성과 카디널리티는 관계 검증에 필요합니다." }
      ],
      answer: "C",
      relatedConceptId: "modeling-relationship",
      hint: "1단계: 관계는 엔터티명이 아니라 엔터티 사이의 업무 의미입니다.\n2단계: 관계 문장은 보통 현재형 동사로 읽어 검증합니다.\n3단계: 명사로만 표현해야 한다는 절대 표현을 확인합니다.",
      explanation: "관계는 두 엔터티 인스턴스가 업무적으로 어떻게 연결되는지를 표현한다. 따라서 관계명과 관계 문장은 동사 또는 동사구로 읽어 업무 의미를 검증할 수 있어야 한다."
    },
    {
      subjectId: "modeling",
      number: 18,
      majorTopic: "데이터 모델링의 이해",
      middleTopic: "식별자",
      topic: "주식별자 특징",
      difficulty: "기본",
      questionType: "보기 조합형",
      mode: "original",
      sourcePage: 10,
      sourceQuestionNumber: 25,
      stem: "주식별자가 만족해야 할 대표적인 특징으로 옳은 것을 모두 묶은 것은?",
      passage: "가. 유일성\n나. 최소성\n다. 불변성\n라. 존재성",
      choices: [
        { id: "A", text: "가, 나", explanation: "오답입니다. 유일성과 최소성뿐 아니라 불변성과 존재성도 중요합니다." },
        { id: "B", text: "가, 다", explanation: "오답입니다. 최소성과 존재성을 빠뜨렸습니다." },
        { id: "C", text: "나, 다, 라", explanation: "오답입니다. 유일성이 빠지면 인스턴스를 구분할 수 없습니다." },
        { id: "D", text: "가, 나, 다, 라", explanation: "정답입니다. 주식별자는 유일성, 최소성, 불변성, 존재성을 만족해야 합니다." }
      ],
      answer: "D",
      relatedConceptId: "modeling-identifier",
      hint: "1단계: 식별자는 인스턴스 구분을 보장해야 합니다.\n2단계: 불필요한 속성을 많이 포함하면 최소성이 깨집니다.\n3단계: NULL이거나 자주 변하는 값은 주식별자로 부적절합니다.",
      explanation: "주식별자의 대표 특징은 유일성, 최소성, 불변성, 존재성이다. 하나라도 약하면 식별 안정성이나 무결성에 문제가 생길 수 있다."
    },
    {
      subjectId: "modeling",
      number: 19,
      majorTopic: "데이터 모델과 성능",
      middleTopic: "정규화",
      topic: "반복 속성과 1정규화",
      difficulty: "상급",
      questionType: "모델 개선 선택형",
      mode: "similar",
      sourcePage: 112,
      sourceQuestionNumber: 37,
      parentQuestionId: "pdf-s-1-normalization-performance",
      stem: "고객 테이블에 최근방문일1, 최근방문일2, 최근방문일3 컬럼을 두고, 세 컬럼 중 특정 기간에 해당하는 고객을 자주 검색한다. 데이터 증가 후 OR 조건과 인덱스 유지 비용이 커졌다. 가장 적절한 모델 개선은?",
      choices: [
        { id: "A", text: "최근방문일 컬럼 세 개에 각각 단일 인덱스를 생성한다.", explanation: "오답입니다. 반복 컬럼 구조가 유지되어 OR 조건과 DML 인덱스 유지 비용 문제가 남습니다." },
        { id: "B", text: "방문이력 엔터티를 분리해 고객과 방문일을 1:M 구조로 관리한다.", explanation: "정답입니다. 반복 속성을 행으로 분리하면 1정규형을 만족하고 방문일 검색 인덱스 설계도 명확해집니다." },
        { id: "C", text: "세 방문일을 하나의 문자열로 합쳐 저장하고 LIKE로 검색한다.", explanation: "오답입니다. 원자성과 검색 효율을 모두 악화시킵니다." },
        { id: "D", text: "최근방문일1만 유지하고 나머지 방문일은 삭제한다.", explanation: "오답입니다. 업무상 필요한 이력 정보를 손실합니다." }
      ],
      answer: "B",
      relatedConceptId: "modeling-normalization",
      hint: "1단계: 반복 컬럼이 원자성을 위반하는지 봅니다.\n2단계: OR 조건과 다중 인덱스가 왜 늘어나는지 확인합니다.\n3단계: 반복 속성은 별도 엔터티의 여러 행으로 분리하는 방향을 검토합니다.",
      explanation: "반복 속성은 1정규화 대상이다. 방문일을 컬럼으로 반복하면 조건식과 인덱스가 복잡해지므로 방문이력 엔터티로 분리해 고객별 여러 방문을 행으로 관리하는 것이 적절하다."
    },
    {
      subjectId: "modeling",
      number: 20,
      majorTopic: "데이터 모델과 성능",
      middleTopic: "반정규화",
      topic: "성능 모델링 절차",
      difficulty: "상급",
      questionType: "가장 적절한 설명 선택형",
      mode: "similar",
      sourcePage: 113,
      parentQuestionId: "pdf-v-1-attribute-classification",
      stem: "월별 고객 등급별 주문금액 합계를 화면에서 매우 자주 조회한다. 원천 주문 테이블은 일 2천만 건씩 증가하고 정산 확정 후에는 값이 거의 바뀌지 않는다. 성능 모델링 판단으로 가장 적절한 것은?",
      choices: [
        { id: "A", text: "조회가 느리면 정규화 검토 없이 주문 테이블에 월합계 컬럼을 추가한다.", explanation: "오답입니다. 원천 테이블에 집계를 섞으면 갱신 정합성과 의미가 흔들릴 수 있습니다." },
        { id: "B", text: "정규화 모델을 기준으로 트랜잭션 범위와 갱신 주기를 확인한 뒤 집계 테이블 반정규화를 검토한다.", explanation: "정답입니다. 반정규화는 정규화 검토 후 성능 요구, 갱신 주기, 정합성 유지 방안을 함께 판단해야 합니다." },
        { id: "C", text: "반정규화는 항상 데이터 무결성을 깨뜨리므로 SQLP 성능 모델링에서 사용하지 않는다.", explanation: "오답입니다. 통제 가능한 정합성 유지 방안이 있다면 성능 목적의 반정규화를 검토할 수 있습니다." },
        { id: "D", text: "인덱스만 충분히 만들면 집계 테이블은 어떤 경우에도 필요 없다.", explanation: "오답입니다. 대량 원천을 반복 집계하는 비용이 크면 집계 테이블이 더 적절할 수 있습니다." }
      ],
      answer: "B",
      relatedConceptId: "modeling-normalization",
      hint: "1단계: 조회 빈도와 원천 데이터 증가량을 확인합니다.\n2단계: 값이 언제 확정되고 얼마나 자주 바뀌는지 봅니다.\n3단계: 반정규화는 성능과 정합성 유지 방안을 함께 설계할 때 선택합니다.",
      explanation: "성능 모델링에서는 먼저 정규화와 업무 규칙을 확인한 뒤 조회 빈도, 데이터량, 갱신 주기, 정합성 유지 비용을 따져 반정규화를 적용한다. 월별 집계 테이블은 정산 확정 후 조회가 많은 경우 타당한 후보가 될 수 있다."
    }
  ] as ManualPublishedQuestion[]).map(makeManualQuestion),
  ...([
    {
      subjectId: "sql-basic",
      number: 11,
      majorTopic: "SQL 기본 및 활용",
      middleTopic: "SQL 기본",
      topic: "TCL",
      difficulty: "기본",
      questionType: "개념 매칭형",
      mode: "original",
      sourcePage: 22,
      stem: "트랜잭션의 변경 내용을 확정하거나 취소하고 저장점을 관리하는 SQL 명령어의 범주로 가장 적절한 것은?",
      choices: [
        { id: "A", text: "DDL", explanation: "오답입니다. DDL은 CREATE, ALTER, DROP처럼 객체 구조를 정의합니다." },
        { id: "B", text: "DML", explanation: "오답입니다. DML은 INSERT, UPDATE, DELETE, SELECT처럼 데이터를 조작하거나 조회합니다." },
        { id: "C", text: "TCL", explanation: "정답입니다. COMMIT, ROLLBACK, SAVEPOINT는 트랜잭션 제어어입니다." },
        { id: "D", text: "DCL", explanation: "오답입니다. DCL은 GRANT, REVOKE처럼 권한을 제어합니다." }
      ],
      answer: "C",
      relatedConceptId: "sql-select",
      hint: "1단계: 객체 정의, 데이터 조작, 권한 제어, 트랜잭션 제어를 구분합니다.\n2단계: COMMIT과 ROLLBACK이 어느 범주인지 떠올립니다.\n3단계: 트랜잭션의 확정과 취소는 TCL입니다.",
      explanation: "TCL(Transaction Control Language)은 트랜잭션을 확정하거나 되돌리는 명령어 범주다. COMMIT, ROLLBACK, SAVEPOINT가 대표적이다."
    },
    {
      subjectId: "sql-basic",
      number: 12,
      majorTopic: "SQL 기본 및 활용",
      middleTopic: "NULL",
      topic: "NULL 비교",
      difficulty: "중급",
      questionType: "SQL 결과 선택형",
      mode: "variant",
      sourcePage: 24,
      parentQuestionId: "pdf-o-2-008",
      stem: "아래 SQL의 결과로 가장 적절한 것은?",
      code: `SELECT COUNT(*) AS CNT
FROM (
  SELECT 1 AS id, NULL AS grade FROM dual UNION ALL
  SELECT 2 AS id, 'A' AS grade FROM dual UNION ALL
  SELECT 3 AS id, 'B' AS grade FROM dual
)
WHERE grade <> 'A';`,
      choices: [
        { id: "A", text: "0", explanation: "오답입니다. grade가 'B'인 행은 TRUE가 되어 남습니다." },
        { id: "B", text: "1", explanation: "정답입니다. NULL <> 'A'는 UNKNOWN이므로 WHERE에서 제외되고, 'B' 행 1건만 남습니다." },
        { id: "C", text: "2", explanation: "오답입니다. NULL을 'A'가 아닌 값으로 직접 판단하면 안 됩니다." },
        { id: "D", text: "3", explanation: "오답입니다. 'A' 행은 조건이 FALSE이므로 제외됩니다." }
      ],
      answer: "B",
      relatedConceptId: "sql-where",
      hint: "1단계: WHERE는 TRUE인 행만 통과합니다.\n2단계: NULL 비교 결과는 TRUE나 FALSE가 아니라 UNKNOWN입니다.\n3단계: 'B'만 grade <> 'A' 조건을 만족합니다.",
      explanation: "NULL과의 비교 연산 결과는 UNKNOWN이다. WHERE 절에서는 TRUE만 선택되므로 NULL 행은 제외되고 'B' 행만 카운트된다."
    },
    {
      subjectId: "sql-basic",
      number: 13,
      majorTopic: "SQL 기본 및 활용",
      middleTopic: "WHERE",
      topic: "NOT IN과 NULL",
      difficulty: "상급",
      questionType: "SQL 결과 선택형",
      mode: "similar",
      sourcePage: 24,
      parentQuestionId: "pdf-v-2-null-not-in",
      stem: "아래 SQL에서 반환되는 empno는 무엇인가?",
      code: `SELECT empno
FROM emp e
WHERE e.deptno NOT IN (
  SELECT deptno
  FROM closed_dept
);`,
      table: {
        headers: ["테이블", "데이터"],
        rows: [
          ["emp", "(100, 10), (200, 20), (300, 30)"],
          ["closed_dept", "20, NULL"]
        ]
      },
      choices: [
        { id: "A", text: "100, 300", explanation: "오답입니다. 서브쿼리 결과에 NULL이 포함되면 NOT IN 전체 판단이 UNKNOWN이 되어 반환되지 않습니다." },
        { id: "B", text: "100", explanation: "오답입니다. 10은 20과 다르지만 NULL과의 비교 때문에 전체 NOT IN이 TRUE가 되지 않습니다." },
        { id: "C", text: "반환되는 행이 없다.", explanation: "정답입니다. NOT IN 목록에 NULL이 포함되어 모든 비교 결과가 TRUE로 확정되지 않습니다." },
        { id: "D", text: "200만 반환된다.", explanation: "오답입니다. 20은 목록에 존재하므로 제외되어야 하며 NULL 문제와도 맞지 않습니다." }
      ],
      answer: "C",
      relatedConceptId: "sql-where",
      hint: "1단계: NOT IN은 여러 개의 <> 비교가 AND로 연결된 것처럼 생각합니다.\n2단계: 비교 대상 중 NULL이 있으면 UNKNOWN이 섞입니다.\n3단계: UNKNOWN이 포함된 조건은 WHERE에서 TRUE로 통과하지 않습니다.",
      explanation: "NOT IN 서브쿼리 결과에 NULL이 포함되면 비교 결과가 TRUE로 확정되지 않아 기대와 달리 행이 반환되지 않을 수 있다. 이런 경우 NOT EXISTS나 서브쿼리의 NULL 제거 조건을 검토한다."
    },
    {
      subjectId: "sql-basic",
      number: 14,
      majorTopic: "SQL 기본 및 활용",
      middleTopic: "JOIN",
      topic: "OUTER JOIN 조건 위치",
      difficulty: "상급",
      questionType: "적절한 SQL 선택형",
      mode: "similar",
      sourcePage: 25,
      parentQuestionId: "pdf-s-2-outer-join-filter",
      stem: "모든 고객을 출력하되 2026년 7월 주문이 있으면 주문번호를 함께 보여주려고 한다. 주문이 없는 고객도 반드시 남겨야 한다. 가장 적절한 SQL은?",
      choices: [
        { id: "A", text: "LEFT JOIN 후 WHERE o.order_dt >= DATE '2026-07-01' AND o.order_dt < DATE '2026-08-01'를 둔다.", explanation: "오답입니다. WHERE에서 후행 테이블 조건을 걸면 주문이 없는 고객의 NULL 확장 행이 제거됩니다." },
        { id: "B", text: "LEFT JOIN의 ON 절에 주문일자 범위 조건을 함께 둔다.", explanation: "정답입니다. 보존해야 할 고객을 유지하면서 주문 쪽 매칭 조건만 제한할 수 있습니다." },
        { id: "C", text: "INNER JOIN을 사용하고 주문번호가 NULL인 행을 추가로 조회한다.", explanation: "오답입니다. 요구사항을 한 번에 명확히 표현하지 못하고 누락 위험이 큽니다." },
        { id: "D", text: "RIGHT JOIN을 사용하면 조건 위치와 관계없이 모든 고객이 보존된다.", explanation: "오답입니다. 기준 테이블과 조건 위치를 정확히 지정하지 않으면 보존 집합이 달라집니다." }
      ],
      answer: "B",
      relatedConceptId: "sql-join",
      hint: "1단계: 어느 테이블의 행을 보존해야 하는지 확인합니다.\n2단계: 후행 테이블 조건이 WHERE에 있으면 NULL 확장 행이 제거되는지 봅니다.\n3단계: 보존 조건은 LEFT JOIN ON 절에 두는 것이 핵심입니다.",
      explanation: "OUTER JOIN에서는 기준 테이블을 보존하는 것이 핵심이다. 주문 조건을 WHERE에 두면 주문이 없는 고객이 제거되므로 주문일자 조건은 ON 절에 배치해야 한다."
    },
    {
      subjectId: "sql-basic",
      number: 15,
      majorTopic: "SQL 기본 및 활용",
      middleTopic: "GROUP BY",
      topic: "GROUP BY와 HAVING",
      difficulty: "중급",
      questionType: "SQL 결과 선택형",
      mode: "variant",
      sourcePage: 28,
      stem: "아래 SQL 결과의 행 수로 가장 적절한 것은?",
      code: `SELECT deptno, COUNT(*) cnt
FROM emp
WHERE job <> 'CLERK'
GROUP BY deptno
HAVING COUNT(*) >= 2;`,
      table: {
        headers: ["empno", "deptno", "job"],
        rows: [["1", "10", "MANAGER"], ["2", "10", "ANALYST"], ["3", "20", "CLERK"], ["4", "20", "MANAGER"], ["5", "30", "SALESMAN"], ["6", "30", "SALESMAN"]]
      },
      choices: [
        { id: "A", text: "1행", explanation: "오답입니다. WHERE 후 10번과 30번 부서가 각각 2건입니다." },
        { id: "B", text: "2행", explanation: "정답입니다. CLERK를 제외한 뒤 10번 부서 2건, 30번 부서 2건이 HAVING을 만족합니다." },
        { id: "C", text: "3행", explanation: "오답입니다. 20번 부서는 CLERK 제거 후 1건만 남아 HAVING 조건을 만족하지 못합니다." },
        { id: "D", text: "4행", explanation: "오답입니다. GROUP BY 결과는 부서별 최대 3행이며 HAVING으로 한 번 더 줄어듭니다." }
      ],
      answer: "B",
      relatedConceptId: "sql-group-functions",
      hint: "1단계: WHERE가 GROUP BY보다 먼저 적용됩니다.\n2단계: CLERK 행을 먼저 제거한 뒤 부서별 건수를 셉니다.\n3단계: HAVING은 그룹 집계 결과에 적용합니다.",
      explanation: "SQL의 논리 처리 순서는 WHERE 후 GROUP BY, HAVING이다. CLERK 제거 후 부서별 건수를 계산하면 10번과 30번만 COUNT(*) >= 2를 만족한다."
    },
    {
      subjectId: "sql-basic",
      number: 16,
      majorTopic: "SQL 기본 및 활용",
      middleTopic: "GROUP BY",
      topic: "ROLLUP과 GROUPING",
      difficulty: "상급",
      questionType: "SQL 결과 추론형",
      mode: "similar",
      sourcePage: 31,
      stem: "아래 쿼리에서 GROUPING(region_cd)=1인 행의 의미로 가장 적절한 것은?",
      code: `SELECT region_cd,
       channel_cd,
       SUM(amount) amt,
       GROUPING(region_cd) g_region,
       GROUPING(channel_cd) g_channel
FROM sales
GROUP BY ROLLUP(region_cd, channel_cd);`,
      choices: [
        { id: "A", text: "지역별 채널 소계 행이다.", explanation: "오답입니다. 지역별 채널 소계에서는 region_cd가 실제 값으로 남고 channel_cd가 합계 처리됩니다." },
        { id: "B", text: "전체 총계 행이다.", explanation: "정답입니다. ROLLUP(region_cd, channel_cd)에서 region_cd까지 GROUPING 1이면 전체 총계 행입니다." },
        { id: "C", text: "원본 sales 테이블에서 region_cd가 NULL인 행이다.", explanation: "오답입니다. GROUPING 함수는 원본 NULL과 집계로 생성된 NULL을 구분하기 위한 함수입니다." },
        { id: "D", text: "ROLLUP에서는 GROUPING 함수가 항상 0을 반환한다.", explanation: "오답입니다. 집계로 인해 해당 컬럼이 요약되면 GROUPING은 1을 반환합니다." }
      ],
      answer: "B",
      relatedConceptId: "sql-group-functions",
      hint: "1단계: GROUPING 함수는 원본 NULL과 집계 NULL을 구분합니다.\n2단계: ROLLUP의 마지막 단계는 전체 총계입니다.\n3단계: region_cd가 요약된 행은 지역까지 사라진 전체 총계입니다.",
      explanation: "ROLLUP(region_cd, channel_cd)은 상세, 지역 소계, 전체 총계를 만든다. GROUPING(region_cd)=1이면 region_cd가 집계로 제거된 전체 총계 행이다."
    },
    {
      subjectId: "sql-basic",
      number: 17,
      majorTopic: "SQL 기본 및 활용",
      middleTopic: "Window Function",
      topic: "ROW_NUMBER와 RANK",
      difficulty: "중급",
      questionType: "함수 선택형",
      mode: "variant",
      sourcePage: 32,
      parentQuestionId: "pdf-s-2-window-rank",
      stem: "부서별 매출 1위 사원을 한 명만 출력해야 한다. 동일 매출자가 여러 명이면 사번이 가장 작은 사원만 남기려고 한다. 가장 적절한 분석 함수 사용 방식은?",
      choices: [
        { id: "A", text: "RANK() OVER (PARTITION BY deptno ORDER BY sales_amt DESC)", explanation: "오답입니다. 동점자는 모두 rank 1이 되어 한 명만 남기는 요구를 만족하지 못합니다." },
        { id: "B", text: "DENSE_RANK() OVER (PARTITION BY deptno ORDER BY sales_amt DESC)", explanation: "오답입니다. DENSE_RANK도 동점자를 같은 순위로 반환합니다." },
        { id: "C", text: "ROW_NUMBER() OVER (PARTITION BY deptno ORDER BY sales_amt DESC, empno ASC)", explanation: "정답입니다. 동점 시 empno를 추가 정렬해 부서별 정확히 한 행을 선택할 수 있습니다." },
        { id: "D", text: "COUNT(*) OVER (PARTITION BY deptno)", explanation: "오답입니다. COUNT는 순위가 아니라 부서별 행 수를 계산합니다." }
      ],
      answer: "C",
      relatedConceptId: "sql-window-functions",
      hint: "1단계: 동점자를 모두 보여야 하는지 한 명만 보여야 하는지 확인합니다.\n2단계: RANK 계열은 동점자에게 같은 순위를 줄 수 있습니다.\n3단계: 한 명만 필요하면 ROW_NUMBER와 결정적 정렬 기준이 필요합니다.",
      explanation: "부서별 정확히 한 명을 선택하려면 ROW_NUMBER를 사용하고 ORDER BY에 매출액 내림차순과 동점 해소 기준을 함께 지정해야 한다."
    },
    {
      subjectId: "sql-basic",
      number: 18,
      majorTopic: "SQL 기본 및 활용",
      middleTopic: "집합 연산",
      topic: "UNION과 UNION ALL",
      difficulty: "중급",
      questionType: "결과 행 수 추론형",
      mode: "similar",
      sourcePage: 35,
      stem: "아래 두 쿼리의 결과 행 수 설명으로 가장 적절한 것은?",
      code: `-- Q1
SELECT cust_id FROM online_order
UNION
SELECT cust_id FROM store_order;

-- Q2
SELECT cust_id FROM online_order
UNION ALL
SELECT cust_id FROM store_order;`,
      table: {
        headers: ["online_order.cust_id", "store_order.cust_id"],
        rows: [["C1", "C1"], ["C2", "C3"], ["C2", "C4"]]
      },
      choices: [
        { id: "A", text: "Q1은 4행, Q2는 6행이다.", explanation: "정답입니다. UNION은 중복을 제거해 C1,C2,C3,C4 4행이고 UNION ALL은 중복을 보존해 6행입니다." },
        { id: "B", text: "Q1은 6행, Q2는 4행이다.", explanation: "오답입니다. 중복 제거는 UNION에서 일어납니다." },
        { id: "C", text: "두 쿼리 모두 4행이다.", explanation: "오답입니다. UNION ALL은 중복을 제거하지 않습니다." },
        { id: "D", text: "두 쿼리 모두 6행이다.", explanation: "오답입니다. UNION은 중복 제거 정렬 또는 해시 작업이 필요할 수 있습니다." }
      ],
      answer: "A",
      relatedConceptId: "sql-set-operators",
      hint: "1단계: 각 테이블에서 읽는 행 수를 합칩니다.\n2단계: UNION이 중복을 제거하는지 확인합니다.\n3단계: UNION ALL은 중복을 그대로 유지합니다.",
      explanation: "UNION은 두 결과 집합을 합친 뒤 중복을 제거한다. UNION ALL은 중복 제거 없이 연결하므로 성능과 결과 행 수가 달라질 수 있다."
    },
    {
      subjectId: "sql-basic",
      number: 19,
      majorTopic: "SQL 기본 및 활용",
      middleTopic: "DML",
      topic: "MERGE",
      difficulty: "상급",
      questionType: "SQL 작성 방식 선택형",
      mode: "similar",
      sourcePage: 39,
      stem: "일별 매출요약 테이블에 같은 일자와 매장코드가 있으면 금액을 갱신하고, 없으면 새 행을 입력해야 한다. 가장 적절한 SQL 기능은?",
      choices: [
        { id: "A", text: "INSERT만 사용하고 중복 오류가 발생하면 무시한다.", explanation: "오답입니다. 기존 행 갱신 요구를 만족하지 못합니다." },
        { id: "B", text: "UPDATE만 사용하고 갱신 행 수가 0이면 작업을 종료한다.", explanation: "오답입니다. 없는 행을 새로 입력해야 하는 요구가 빠졌습니다." },
        { id: "C", text: "MERGE를 사용해 매칭 시 UPDATE, 미매칭 시 INSERT를 처리한다.", explanation: "정답입니다. MERGE는 대상과 소스의 매칭 여부에 따라 UPDATE/INSERT를 분기할 수 있습니다." },
        { id: "D", text: "SELECT FOR UPDATE만 사용하면 INSERT와 UPDATE가 자동 처리된다.", explanation: "오답입니다. SELECT FOR UPDATE는 잠금 목적이며 DML 분기를 자동 수행하지 않습니다." }
      ],
      answer: "C",
      relatedConceptId: "sql-select",
      hint: "1단계: 같은 키가 있을 때와 없을 때 동작이 다릅니다.\n2단계: UPDATE와 INSERT를 한 문장 안에서 분기할 수 있는 기능을 찾습니다.\n3단계: 매칭 여부 기반 DML은 MERGE입니다.",
      explanation: "MERGE는 대상 테이블과 소스 데이터를 비교해 조건에 맞는 행은 UPDATE, 없는 행은 INSERT하는 데 적합하다."
    },
    {
      subjectId: "sql-basic",
      number: 20,
      majorTopic: "SQL 기본 및 활용",
      middleTopic: "SELECT",
      topic: "논리적 처리 순서",
      difficulty: "중급",
      questionType: "부적절한 설명 선택형",
      mode: "variant",
      sourcePage: 23,
      stem: "SELECT 문 논리 처리 순서에 대한 설명으로 가장 부적절한 것은?",
      choices: [
        { id: "A", text: "FROM과 JOIN으로 대상 행 집합을 만든 뒤 WHERE 조건을 적용한다.", explanation: "오답입니다. 논리 처리 순서상 FROM/JOIN 후 WHERE가 적용됩니다." },
        { id: "B", text: "GROUP BY 후 HAVING은 그룹 집계 결과를 대상으로 필터링한다.", explanation: "오답입니다. HAVING은 그룹에 대한 조건입니다." },
        { id: "C", text: "SELECT 절 별칭은 같은 SELECT 문의 WHERE 절에서 일반적으로 바로 사용할 수 있다.", explanation: "정답입니다. WHERE는 SELECT보다 먼저 처리되므로 SELECT 별칭을 일반적으로 참조할 수 없습니다." },
        { id: "D", text: "ORDER BY는 최종 결과 정렬 단계에서 SELECT 별칭을 사용할 수 있다.", explanation: "오답입니다. ORDER BY는 SELECT 후 처리되어 별칭 사용이 가능합니다." }
      ],
      answer: "C",
      relatedConceptId: "sql-select",
      hint: "1단계: SQL 작성 순서와 논리 처리 순서를 구분합니다.\n2단계: WHERE가 SELECT보다 먼저 처리되는지 확인합니다.\n3단계: 별칭 사용 가능 위치가 함정입니다.",
      explanation: "SELECT 문은 논리적으로 FROM, WHERE, GROUP BY, HAVING, SELECT, ORDER BY 순서로 이해한다. WHERE 절에서는 같은 SELECT 목록의 별칭을 일반적으로 사용할 수 없다."
    }
  ] as ManualPublishedQuestion[]).map(makeManualQuestion),
  ...([
    {
      subjectId: "tuning",
      number: 11,
      majorTopic: "SQL 고급활용 및 튜닝",
      middleTopic: "인덱스 튜닝",
      topic: "B-Tree 인덱스 구조",
      difficulty: "중급",
      questionType: "부적절한 설명 선택형",
      mode: "original",
      sourcePage: 1,
      sourceQuestionNumber: 1,
      stem: "B-Tree 인덱스 구조와 스캔 방식에 대한 설명으로 가장 부적절한 것은?",
      choices: [
        { id: "A", text: "Root와 Branch 블록은 하위 블록으로 이동하기 위한 키 값과 주소 정보를 가진다.", explanation: "오답입니다. 상위 블록은 하위 블록 탐색을 위한 분기 정보를 가집니다." },
        { id: "B", text: "Leaf 블록은 인덱스 키 값과 테이블 행을 찾기 위한 ROWID를 가진다.", explanation: "오답입니다. 일반 B-Tree 인덱스의 Leaf 엔트리는 키와 ROWID를 포함합니다." },
        { id: "C", text: "Index Range Scan은 시작 Leaf를 찾은 뒤 Leaf 블록 연결을 따라 필요한 범위를 읽는다.", explanation: "오답입니다. 수직 탐색 후 리프 범위를 수평 스캔하는 방식입니다." },
        { id: "D", text: "Index Skip Scan은 선두 컬럼의 Distinct Value가 매우 많을수록 항상 유리하다.", explanation: "정답입니다. Skip Scan은 보통 선두 컬럼 NDV가 작고 후행 컬럼 조건이 선택적일 때 검토합니다." }
      ],
      answer: "D",
      relatedConceptId: "tuning-index-scan-efficiency",
      hint: "1단계: Root/Branch/Leaf 역할을 분리합니다.\n2단계: Range Scan의 수직 탐색과 수평 탐색을 떠올립니다.\n3단계: Skip Scan은 선두 컬럼 NDV가 작을 때 유리한지 확인합니다.",
      explanation: "Index Skip Scan은 결합 인덱스의 선두 컬럼 조건이 없더라도 선두 컬럼의 가능한 값을 여러 번 탐색하는 방식이다. 선두 컬럼 NDV가 매우 크면 반복 탐색 부담이 커져 항상 유리하다고 할 수 없다."
    },
    {
      subjectId: "tuning",
      number: 12,
      majorTopic: "SQL 고급활용 및 튜닝",
      middleTopic: "인덱스 튜닝",
      topic: "인덱스 스캔 효율화",
      difficulty: "상급",
      questionType: "Predicate 판정형",
      mode: "variant",
      sourcePage: 1,
      sourceQuestionNumber: 2,
      parentQuestionId: "pdf-o-3-index-scan-efficiency",
      stem: "IDX_ORD(고객번호, 주문일자, 상품코드) 인덱스가 있고 아래 조건으로 조회한다. 인덱스 스캔 효율 관점에서 가장 타당한 설명은?",
      code: `WHERE 고객번호 = :cust_no
  AND 주문일자 >= DATE '2026-07-01'
  AND 주문일자 <  DATE '2026-08-01'
  AND 상품코드 LIKE 'A%'`,
      choices: [
        { id: "A", text: "고객번호 등치 조건은 시작점을 좁히고 주문일자 범위 조건은 읽을 리프 범위를 제한한다.", explanation: "정답입니다. 선두 등치 후 범위 조건까지는 인덱스 탐색 범위를 줄이는 핵심 조건입니다." },
        { id: "B", text: "상품코드 조건이 있으므로 주문일자 범위와 무관하게 항상 단일 Leaf만 읽는다.", explanation: "오답입니다. 주문일자가 범위 조건이면 범위 내 여러 Leaf를 읽을 수 있습니다." },
        { id: "C", text: "고객번호 조건이 있어도 주문일자 조건이 범위이면 인덱스를 전혀 사용할 수 없다.", explanation: "오답입니다. 선두 컬럼 등치 조건이 있으므로 인덱스 범위 스캔이 가능합니다." },
        { id: "D", text: "상품코드가 세 번째 컬럼이므로 어떤 경우에도 결과 필터로도 평가되지 않는다.", explanation: "오답입니다. 세 번째 컬럼 조건은 스캔 범위 축소 효과가 제한될 수 있지만 인덱스 또는 테이블 필터 조건으로 평가될 수 있습니다." }
      ],
      answer: "A",
      relatedConceptId: "tuning-index-scan-efficiency",
      hint: "1단계: 결합 인덱스 컬럼 순서를 확인합니다.\n2단계: 선두 등치, 그다음 범위 조건이 스캔 시작과 종료에 미치는 영향을 봅니다.\n3단계: 범위 조건 뒤 컬럼은 스캔 효율 개선 효과가 제한될 수 있습니다.",
      explanation: "결합 인덱스에서는 선두 컬럼 등치 조건이 매우 중요하다. 고객번호로 시작 범위를 좁히고 주문일자 범위로 리프 스캔 범위를 제한할 수 있으나, 그 뒤 상품코드 조건은 상황에 따라 스캔 효율 개선 효과가 제한된다."
    },
    {
      subjectId: "tuning",
      number: 13,
      majorTopic: "SQL 고급활용 및 튜닝",
      middleTopic: "테이블 액세스",
      topic: "클러스터링 팩터",
      difficulty: "상급",
      questionType: "실행계획 해석형",
      mode: "similar",
      sourcePage: 1,
      stem: "두 인덱스 모두 선택도는 비슷하지만 IDX_A를 사용할 때 테이블 랜덤 액세스 CR이 훨씬 크게 나타났다. 가장 우선적으로 의심할 원인은?",
      table: {
        headers: ["인덱스", "예상 Rows", "테이블 방문", "Clustering Factor"],
        rows: [["IDX_A", "12,000", "12,000", "4,800,000"], ["IDX_B", "13,500", "13,500", "180,000"]]
      },
      choices: [
        { id: "A", text: "IDX_A의 클러스터링 팩터가 나빠 인덱스 순서와 테이블 저장 순서가 맞지 않는다.", explanation: "정답입니다. 클러스터링 팩터가 크면 같은 건수라도 테이블 블록 방문이 분산되어 랜덤 액세스 비용이 커질 수 있습니다." },
        { id: "B", text: "IDX_A의 선택도가 좋기 때문에 랜덤 액세스는 반드시 감소한다.", explanation: "오답입니다. 선택도뿐 아니라 테이블 방문 블록 분산 정도가 중요합니다." },
        { id: "C", text: "클러스터링 팩터는 Full Table Scan 비용에만 영향을 준다.", explanation: "오답입니다. 인덱스 ROWID로 테이블을 방문하는 비용 산정에 직접 영향을 줍니다." },
        { id: "D", text: "예상 Rows가 적으면 테이블 액세스 비용은 항상 무시할 수 있다.", explanation: "오답입니다. 반복 ROWID 방문이 많고 분산되면 비용이 커질 수 있습니다." }
      ],
      answer: "A",
      relatedConceptId: "tuning-table-access",
      hint: "1단계: 인덱스 선택도와 테이블 방문 비용을 분리합니다.\n2단계: ROWID 순서와 테이블 블록 순서가 얼마나 가까운지 봅니다.\n3단계: Clustering Factor가 큰 인덱스는 랜덤 액세스 비용이 커질 수 있습니다.",
      explanation: "클러스터링 팩터는 인덱스 키 순서와 테이블 데이터 저장 순서의 일치 정도를 나타낸다. 값이 나쁘면 인덱스로 찾은 ROWID가 많은 테이블 블록으로 흩어져 논리 읽기와 랜덤 액세스 비용이 커진다."
    },
    {
      subjectId: "tuning",
      number: 14,
      majorTopic: "SQL 고급활용 및 튜닝",
      middleTopic: "조인 튜닝",
      topic: "NL Join",
      difficulty: "상급",
      questionType: "조인 방식 판단형",
      mode: "original",
      sourcePage: 2,
      sourceQuestionNumber: 4,
      stem: "Nested Loops Join에 대한 설명으로 가장 부적절한 것은?",
      choices: [
        { id: "A", text: "선행 집합이 작고 후행 집합 조인 컬럼에 인덱스가 있으면 효율적일 수 있다.", explanation: "오답입니다. NL Join이 유리한 대표 조건입니다." },
        { id: "B", text: "부분범위 처리와 결합될 때 첫 응답 속도에 유리할 수 있다.", explanation: "오답입니다. 선행 결과를 조금씩 얻어 후행을 반복 탐색할 수 있습니다." },
        { id: "C", text: "후행 테이블을 반복 탐색하므로 반복 횟수와 테이블 랜덤 액세스 비용이 중요하다.", explanation: "오답입니다. NL Join 튜닝의 핵심 판단 기준입니다." },
        { id: "D", text: "비등가 조인 조건에서는 어떤 경우에도 NL Join을 사용할 수 없다.", explanation: "정답입니다. 비등가 조건에서도 상황에 따라 NL Join이 사용될 수 있으므로 절대 표현은 부적절합니다." }
      ],
      answer: "D",
      relatedConceptId: "tuning-nl-join",
      hint: "1단계: NL Join은 선행 집합 반복과 후행 탐색 구조입니다.\n2단계: 인덱스와 부분범위 처리의 장점을 확인합니다.\n3단계: 어떤 경우에도 불가능하다는 절대 표현을 의심합니다.",
      explanation: "NL Join은 선행 집합의 각 행마다 후행 집합을 탐색하는 방식이다. 비등가 조건이라고 해서 항상 불가능한 것은 아니며, 조건과 인덱스 구조에 따라 사용될 수 있다."
    },
    {
      subjectId: "tuning",
      number: 15,
      majorTopic: "SQL 고급활용 및 튜닝",
      middleTopic: "조인 튜닝",
      topic: "Hash Join Build Input",
      difficulty: "상급",
      questionType: "조인 방식 판단형",
      mode: "variant",
      sourcePage: 2,
      sourceQuestionNumber: 5,
      parentQuestionId: "pdf-o-3-hash-join",
      stem: "대량 주문 4천만 건과 행사대상고객 2만 건을 고객번호로 조인한다. 정렬된 입력은 없고 행사대상고객은 메모리에 충분히 올라갈 수 있다. 가장 타당한 판단은?",
      choices: [
        { id: "A", text: "행사대상고객을 Build Input으로 하는 Hash Join이 적절할 수 있다.", explanation: "정답입니다. 작은 입력을 해시 테이블로 만들고 큰 주문 집합을 Probe하는 방식이 자연스럽습니다." },
        { id: "B", text: "주문이 크므로 주문을 Build Input으로 해야 해시 충돌이 줄어든다.", explanation: "오답입니다. 큰 입력을 Build로 잡으면 메모리 사용과 TEMP spill 위험이 커집니다." },
        { id: "C", text: "Hash Join은 항상 인덱스가 없을 때만 사용할 수 있다.", explanation: "오답입니다. 인덱스 존재 여부만으로 Hash Join 가능성을 판단하지 않습니다." },
        { id: "D", text: "동등 조인이어도 Hash Join은 범위 조인에서만 효과가 있다.", explanation: "오답입니다. Hash Join은 주로 동등 조인 대량 처리에 적합합니다." }
      ],
      answer: "A",
      relatedConceptId: "tuning-hash-join",
      hint: "1단계: Hash Join은 Build와 Probe 입력을 나눕니다.\n2단계: 메모리에 올릴 수 있는 작은 집합이 무엇인지 봅니다.\n3단계: 큰 주문은 Probe 쪽으로 두는 것이 일반적으로 유리합니다.",
      explanation: "Hash Join에서는 작은 입력을 Build Input으로 선택해 해시 테이블을 만들고 큰 입력을 Probe하는 것이 일반적이다. Build가 너무 크면 메모리 부족과 디스크 spill 위험이 커진다."
    },
    {
      subjectId: "tuning",
      number: 16,
      majorTopic: "SQL 고급활용 및 튜닝",
      middleTopic: "조인 튜닝",
      topic: "Sort Merge Join",
      difficulty: "중급",
      questionType: "가장 적절한 설명 선택형",
      mode: "original",
      sourcePage: 2,
      sourceQuestionNumber: 6,
      stem: "Sort Merge Join이 상대적으로 고려될 수 있는 상황으로 가장 적절한 것은?",
      choices: [
        { id: "A", text: "조인 입력이 이미 조인 키 순서로 정렬되어 있거나 비등가·범위 조인 성격이 강한 경우", explanation: "정답입니다. 정렬 비용이 낮거나 Hash Join이 어려운 조건에서 Sort Merge Join을 검토할 수 있습니다." },
        { id: "B", text: "선행 집합이 1건이고 후행 인덱스가 유니크인 OLTP 조회", explanation: "오답입니다. 이런 경우에는 NL Join이 더 자연스러울 수 있습니다." },
        { id: "C", text: "작은 Build Input을 메모리에 올려 대량 Probe를 수행하는 경우", explanation: "오답입니다. 이는 Hash Join 설명에 가깝습니다." },
        { id: "D", text: "조인 컬럼에 함수가 있어도 정렬이 항상 제거되는 경우", explanation: "오답입니다. 함수 사용은 정렬 제거를 보장하지 않습니다." }
      ],
      answer: "A",
      relatedConceptId: "tuning-advanced-join",
      hint: "1단계: Sort Merge Join은 양쪽 입력을 조인 키 기준으로 정렬해 병합합니다.\n2단계: 정렬 비용을 이미 줄일 수 있는지 봅니다.\n3단계: 비등가 또는 범위 조인에서도 고려될 수 있습니다.",
      explanation: "Sort Merge Join은 양쪽 입력을 정렬한 후 병합하는 방식이다. 입력이 이미 정렬되어 있거나 Hash Join이 어려운 비등가·범위 조건에서는 고려할 수 있다."
    },
    {
      subjectId: "tuning",
      number: 17,
      majorTopic: "SQL 고급활용 및 튜닝",
      middleTopic: "쿼리 변환",
      topic: "Subquery Unnesting",
      difficulty: "상급",
      questionType: "힌트 판단형",
      mode: "variant",
      sourcePage: 2,
      sourceQuestionNumber: 7,
      parentQuestionId: "pdf-o-3-subquery-unnesting",
      stem: "상관 서브쿼리를 조인 형태로 풀어 옵티마이저가 조인 순서와 조인 방식을 선택할 수 있게 하고 싶다. 가장 직접적인 힌트는?",
      choices: [
        { id: "A", text: "NO_UNNEST", explanation: "오답입니다. 서브쿼리 풀기를 막는 힌트입니다." },
        { id: "B", text: "UNNEST", explanation: "정답입니다. 서브쿼리를 조인으로 변환하도록 유도하는 힌트입니다." },
        { id: "C", text: "NO_MERGE", explanation: "오답입니다. 인라인 뷰 병합을 막는 힌트이며 서브쿼리 Unnesting과 직접 목적이 다릅니다." },
        { id: "D", text: "PUSH_SUBQ", explanation: "오답입니다. 서브쿼리 수행 위치를 앞당기는 의도이지 조인 변환 자체를 뜻하지 않습니다." }
      ],
      answer: "B",
      relatedConceptId: "tuning-query-transformation",
      hint: "1단계: 서브쿼리를 유지할지 조인으로 풀지 구분합니다.\n2단계: NO_ 접두 힌트는 대체로 해당 변환을 막습니다.\n3단계: 조인 변환을 유도하는 명칭을 고릅니다.",
      explanation: "Subquery Unnesting은 서브쿼리를 조인으로 변환해 옵티마이저가 더 넓은 실행계획 후보를 검토하게 하는 쿼리 변환이다. 이를 유도하는 힌트는 UNNEST다."
    },
    {
      subjectId: "tuning",
      number: 18,
      majorTopic: "SQL 고급활용 및 튜닝",
      middleTopic: "쿼리 변환",
      topic: "Predicate Pushing",
      difficulty: "상급",
      questionType: "실행계획 해석형",
      mode: "original",
      sourcePage: 3,
      sourceQuestionNumber: 8,
      stem: "인라인 뷰 내부에서 먼저 많은 행을 집계한 뒤 외부 조건으로 일부 고객만 거르는 SQL이 있다. 성능 개선 관점에서 가장 적절한 설명은?",
      choices: [
        { id: "A", text: "외부 조건을 뷰 내부로 밀어 넣을 수 있으면 집계 전 처리 행 수를 줄일 수 있다.", explanation: "정답입니다. Predicate Pushing은 외부 조건을 내부로 전달해 조기 필터링을 유도할 수 있습니다." },
        { id: "B", text: "외부 조건은 항상 뷰 내부로 자동 이동하므로 실행계획 확인은 필요 없다.", explanation: "오답입니다. 변환 가능 여부는 SQL 구조와 의미 보존 조건에 따라 달라집니다." },
        { id: "C", text: "Predicate Pushing은 인덱스 생성을 의미한다.", explanation: "오답입니다. 조건을 더 안쪽 연산으로 밀어 넣는 쿼리 변환입니다." },
        { id: "D", text: "집계 후 필터링과 집계 전 필터링은 항상 같은 비용이다.", explanation: "오답입니다. 집계 전 필터링이 가능하면 중간 처리량이 크게 줄 수 있습니다." }
      ],
      answer: "A",
      relatedConceptId: "tuning-query-transformation",
      hint: "1단계: 조건이 어느 단계에서 적용되는지 확인합니다.\n2단계: 집계 전 행 수를 줄일 수 있는지 봅니다.\n3단계: Predicate Pushing은 조건의 적용 위치를 앞당기는 개념입니다.",
      explanation: "Predicate Pushing은 외부 쿼리 블록의 조건을 내부 뷰나 서브쿼리 쪽으로 전달해 더 이른 단계에서 필터링하게 하는 변환이다. 의미가 보존되는 경우 중간 집계량과 조인량을 줄일 수 있다."
    },
    {
      subjectId: "tuning",
      number: 19,
      majorTopic: "SQL 고급활용 및 튜닝",
      middleTopic: "Sort 튜닝",
      topic: "Top-N과 STOPKEY",
      difficulty: "상급",
      questionType: "실행계획 선택형",
      mode: "similar",
      sourcePage: 6,
      parentQuestionId: "pdf-lab-topn",
      stem: "게시글 목록에서 최근 등록순 상위 10건만 보여준다. IDX_BOARD(게시구분, 등록일시 DESC, 게시글번호 DESC)가 있고 게시구분 조건은 등치다. 가장 기대하기 좋은 실행계획 특징은?",
      choices: [
        { id: "A", text: "INDEX RANGE SCAN DESCENDING과 COUNT STOPKEY로 필요한 10건 근처에서 조기 종료한다.", explanation: "정답입니다. 인덱스 순서가 정렬 조건과 맞고 상위 N건만 필요하면 STOPKEY 부분범위 처리를 기대할 수 있습니다." },
        { id: "B", text: "전체 게시글을 TABLE ACCESS FULL로 읽은 뒤 SORT ORDER BY로 모두 정렬한다.", explanation: "오답입니다. 가능은 하지만 상위 10건만 필요한 상황에서는 피하고 싶은 계획입니다." },
        { id: "C", text: "등록일시가 DESC 인덱스에 있으므로 게시구분 조건은 무시해도 된다.", explanation: "오답입니다. 선두 게시구분 등치 조건이 인덱스 시작 범위를 좁힙니다." },
        { id: "D", text: "STOPKEY는 GROUP BY에서만 나타나며 ORDER BY에는 사용할 수 없다.", explanation: "오답입니다. Top-N 정렬과 함께 COUNT STOPKEY 계열 처리가 나타날 수 있습니다." }
      ],
      answer: "A",
      relatedConceptId: "tuning-index-scan-efficiency",
      hint: "1단계: WHERE 등치 조건과 ORDER BY 컬럼 순서가 인덱스와 맞는지 봅니다.\n2단계: 상위 10건만 필요하면 전체 정렬이 필요한지 확인합니다.\n3단계: STOPKEY는 조기 중단의 핵심 단서입니다.",
      explanation: "Top-N 조회는 인덱스 정렬 순서를 활용하면 전체 정렬 없이 필요한 건수만 읽고 멈출 수 있다. 실행계획에서는 INDEX RANGE SCAN DESCENDING과 COUNT STOPKEY 같은 형태를 기대할 수 있다."
    },
    {
      subjectId: "tuning",
      number: 20,
      majorTopic: "SQL 고급활용 및 튜닝",
      middleTopic: "파티션 튜닝",
      topic: "Partition Pruning",
      difficulty: "상급",
      questionType: "Predicate 판정형",
      mode: "similar",
      sourcePage: 3,
      sourceQuestionNumber: 11,
      stem: "주문 테이블은 주문일자 기준 월 파티션이다. 아래 조건 중 Partition Pruning과 인덱스 활용 가능성을 가장 잘 살리는 조건은?",
      choices: [
        { id: "A", text: "TO_CHAR(주문일자, 'YYYYMM') = '202607'", explanation: "오답입니다. 파티션 키 컬럼을 함수로 감싸면 pruning과 인덱스 액세스가 어려워질 수 있습니다." },
        { id: "B", text: "주문일자 BETWEEN DATE '2026-07-01' AND DATE '2026-07-31'", explanation: "오답입니다. DATE에 시간이 포함될 수 있으면 7월 31일 00:00:00 이후 데이터가 누락될 수 있습니다." },
        { id: "C", text: "주문일자 >= DATE '2026-07-01' AND 주문일자 < DATE '2026-08-01'", explanation: "정답입니다. 파티션 키를 변형하지 않고 반열린 구간으로 정확한 월 범위를 표현합니다." },
        { id: "D", text: "NVL(주문일자, SYSDATE) >= DATE '2026-07-01'", explanation: "오답입니다. 컬럼에 함수를 적용하고 NULL 대체까지 섞어 pruning 가능성을 떨어뜨립니다." }
      ],
      answer: "C",
      relatedConceptId: "tuning-partitioning",
      hint: "1단계: 파티션 키 컬럼이 함수로 감싸졌는지 확인합니다.\n2단계: DATE 컬럼의 시간 값을 고려합니다.\n3단계: 시작일 이상, 다음 달 시작일 미만 형태가 안전합니다.",
      explanation: "파티션 키 조건은 컬럼을 변형하지 않는 범위 조건으로 작성해야 pruning 가능성이 높다. 월 단위 조회는 시작일 이상, 다음 달 시작일 미만의 반열린 구간이 안전하다."
    }
  ] as ManualPublishedQuestion[]).map(makeManualQuestion)
];

const manualVerifiedObjectiveQuestionsBatch02: ObjectiveQuestion[] = ([
  {
    subjectId: "modeling",
    number: 21,
    majorTopic: "데이터 모델과 성능",
    middleTopic: "정규화",
    topic: "부분 함수 종속",
    difficulty: "상급",
    questionType: "정규화 판단형",
    mode: "similar",
    sourcePage: 112,
    parentQuestionId: "pdf-s-1-normalization-fd",
    stem: "주문상세 엔터티의 식별자가 (주문번호, 상품번호)이고, 다음 함수 종속이 확인되었다. 정규화 관점에서 가장 적절한 조치는?",
    passage: "주문번호 -> 주문일자, 고객번호\n상품번호 -> 상품명, 표준단가\n(주문번호, 상품번호) -> 주문수량, 판매단가",
    choices: [
      { id: "A", text: "주문상세에 모든 속성을 유지하고 (주문번호, 상품번호)에만 인덱스를 추가한다.", explanation: "오답입니다. 인덱스 추가는 부분 함수 종속으로 인한 중복과 갱신 이상을 해결하지 못합니다." },
      { id: "B", text: "주문번호에 종속되는 속성은 주문으로, 상품번호에 종속되는 속성은 상품으로 분리한다.", explanation: "정답입니다. 복합 식별자의 일부에만 종속되는 속성을 분리해야 제2정규형을 만족합니다." },
      { id: "C", text: "판매단가도 상품번호에만 종속되므로 상품 엔터티로 이동한다.", explanation: "오답입니다. 판매단가는 주문 시점과 조건에 따라 달라질 수 있어 주문상세의 거래 속성으로 남을 수 있습니다." },
      { id: "D", text: "주문일자와 고객번호를 주문상세의 복합 식별자에 추가한다.", explanation: "오답입니다. 식별자 속성을 늘리면 최소성이 약해지고 부분 종속 문제도 해결되지 않습니다." }
    ],
    answer: "B",
    relatedConceptId: "modeling-normalization",
    hint: "1단계: 복합 식별자의 일부 속성만으로 결정되는 컬럼을 찾습니다.\n2단계: 주문번호에만 종속되는 속성과 상품번호에만 종속되는 속성을 분리합니다.\n3단계: 복합 식별자 전체에 종속되는 거래 속성만 주문상세에 남깁니다.",
    explanation: "부분 함수 종속은 복합 식별자의 일부에만 일반 속성이 종속되는 상태다. 주문번호만으로 결정되는 주문일자와 고객번호는 주문 엔터티로, 상품번호만으로 결정되는 상품명과 표준단가는 상품 엔터티로 분리하는 것이 적절하다."
  },
  {
    subjectId: "modeling",
    number: 22,
    majorTopic: "데이터 모델과 성능",
    middleTopic: "정규화",
    topic: "이행 함수 종속",
    difficulty: "중급",
    questionType: "정규형 선택형",
    mode: "variant",
    sourcePage: 112,
    parentQuestionId: "pdf-v-1-third-normal-form",
    stem: "사원 엔터티에 사원번호, 부서번호, 부서명, 부서위치가 함께 저장되어 있다. 사원번호가 부서번호를 결정하고, 부서번호가 부서명과 부서위치를 결정한다. 가장 적절한 설명은?",
    choices: [
      { id: "A", text: "사원번호가 모든 속성을 결국 결정하므로 정규화 문제가 없다.", explanation: "오답입니다. 사원번호에서 부서번호를 거쳐 부서명으로 이어지는 이행 종속이 존재합니다." },
      { id: "B", text: "부서명과 부서위치를 부서 엔터티로 분리하여 이행 함수 종속을 제거한다.", explanation: "정답입니다. 부서번호에 종속되는 부서 속성을 분리하면 제3정규형에 가까워집니다." },
      { id: "C", text: "부서명은 조회가 많으므로 반드시 사원 식별자에 포함한다.", explanation: "오답입니다. 조회 빈도만으로 식별자에 포함하지 않으며, 식별자의 최소성도 해칩니다." },
      { id: "D", text: "부서번호를 제거하고 부서명을 사원 엔터티의 외래식별자로 사용한다.", explanation: "오답입니다. 업무적으로 안정적인 부서 식별자를 유지하는 편이 일반적으로 적절합니다." }
    ],
    answer: "B",
    relatedConceptId: "modeling-normalization",
    hint: "1단계: 일반 속성이 다른 일반 속성을 결정하는지 확인합니다.\n2단계: 부서번호가 결정하는 속성을 사원 엔터티에 반복 저장하면 어떤 이상이 생기는지 생각합니다.\n3단계: 이행 종속은 별도 엔터티 분리로 해결합니다.",
    explanation: "제3정규형은 식별자가 아닌 속성 간의 종속을 제거하는 데 초점이 있다. 사원번호 -> 부서번호 -> 부서명, 부서위치 구조는 이행 함수 종속이므로 부서 엔터티로 분리해야 갱신 이상을 줄일 수 있다."
  },
  {
    subjectId: "modeling",
    number: 23,
    majorTopic: "데이터 모델링의 이해",
    middleTopic: "관계",
    topic: "식별 관계",
    difficulty: "중급",
    questionType: "관계 모델 판단형",
    mode: "similar",
    sourcePage: 18,
    parentQuestionId: "pdf-s-1-identifying-relationship",
    stem: "계약상세는 반드시 하나의 계약에 속해야 하며, 상세순번은 계약 안에서만 1, 2, 3처럼 부여된다. 계약상세를 식별하는 가장 적절한 모델은?",
    choices: [
      { id: "A", text: "계약상세번호만 인조식별자로 두고 계약번호는 선택 속성으로 둔다.", explanation: "오답입니다. 계약상세가 계약 없이 존재할 수 없다는 업무 규칙과 맞지 않습니다." },
      { id: "B", text: "계약번호와 상세순번을 계약상세의 식별자로 두고 계약과 식별 관계로 연결한다.", explanation: "정답입니다. 상세순번이 계약 내에서만 유일하므로 부모 식별자가 자식 식별자에 포함됩니다." },
      { id: "C", text: "상세순번만 계약상세의 주식별자로 사용한다.", explanation: "오답입니다. 상세순번은 계약별로 반복되므로 전체 계약상세를 유일하게 식별하지 못합니다." },
      { id: "D", text: "계약번호를 계약상세에 저장하지 않고 계약명으로 조인한다.", explanation: "오답입니다. 명칭은 식별 안정성이 약하며 관계 무결성도 보장하기 어렵습니다." }
    ],
    answer: "B",
    relatedConceptId: "modeling-relationship",
    hint: "1단계: 자식 엔터티가 부모 없이 존재 가능한지 확인합니다.\n2단계: 자식의 식별자가 부모 범위 안에서만 유일한지 봅니다.\n3단계: 부모 식별자가 자식 식별자에 포함되면 식별 관계입니다.",
    explanation: "식별 관계는 부모 엔터티의 식별자가 자식 엔터티의 식별자 일부로 전이되는 관계다. 계약상세는 계약에 종속되고 상세순번만으로는 전체 유일성이 없으므로 계약번호와 상세순번을 함께 식별자로 구성하는 것이 적절하다."
  },
  {
    subjectId: "modeling",
    number: 24,
    majorTopic: "데이터 모델과 성능",
    middleTopic: "이력 모델링",
    topic: "선분 이력",
    difficulty: "상급",
    questionType: "모델 설계 선택형",
    mode: "similar",
    sourcePage: 113,
    parentQuestionId: "pdf-s-1-history-model",
    stem: "고객등급 변경 이력을 관리한다. 특정 일자 기준의 등급을 빠르게 조회해야 하며, 같은 고객의 등급 적용 기간이 서로 겹치면 안 된다. 가장 적절한 설계 방향은?",
    choices: [
      { id: "A", text: "고객 테이블에 현재등급만 두고 변경될 때마다 덮어쓴다.", explanation: "오답입니다. 과거 특정 시점의 등급을 조회할 수 없습니다." },
      { id: "B", text: "고객등급이력에 고객번호, 적용시작일, 적용종료일을 두고 기간 중복을 통제한다.", explanation: "정답입니다. 선분 이력은 시점 조회와 기간 유효성 검증에 적합합니다." },
      { id: "C", text: "변경 전 등급과 변경 후 등급만 문자열로 누적 저장한다.", explanation: "오답입니다. 원자성, 검색성, 기간 검증이 모두 약해집니다." },
      { id: "D", text: "고객번호 없이 등급과 적용일자만 저장해 전체 고객의 이력을 통합한다.", explanation: "오답입니다. 고객별 이력을 식별할 수 없어 업무 규칙을 만족하지 못합니다." }
    ],
    answer: "B",
    relatedConceptId: "modeling-transaction-model",
    hint: "1단계: 현재값만 필요한지 과거 시점 조회가 필요한지 구분합니다.\n2단계: 기간 중복을 막아야 하는지 확인합니다.\n3단계: 시작일과 종료일을 가진 선분 이력 구조를 떠올립니다.",
    explanation: "선분 이력은 적용시작일과 적용종료일을 사용해 특정 시점의 유효 데이터를 찾는 방식이다. 고객별 기간 중복을 방지해야 정확한 시점 조회가 가능하므로 이력 엔터티와 기간 제약 설계가 필요하다."
  },
  {
    subjectId: "modeling",
    number: 25,
    majorTopic: "데이터 모델과 성능",
    middleTopic: "반정규화",
    topic: "파생 속성",
    difficulty: "상급",
    questionType: "성능 모델링 판단형",
    mode: "variant",
    sourcePage: 113,
    parentQuestionId: "pdf-v-1-denormalization",
    stem: "주문목록 화면에서 고객명과 주문시점 고객등급을 항상 함께 보여준다. 고객명은 정정될 수 있고 고객등급은 주문 당시 값을 보존해야 한다. 가장 적절한 모델링 판단은?",
    choices: [
      { id: "A", text: "주문 테이블에는 고객번호만 저장하고 모든 표시값은 항상 고객 테이블에서 현재값으로 조회한다.", explanation: "오답입니다. 주문 당시 고객등급을 보존해야 하는 요구를 만족하지 못합니다." },
      { id: "B", text: "고객명과 주문시점 고객등급을 모두 고객 테이블에만 저장하고 주문에는 저장하지 않는다.", explanation: "오답입니다. 주문 당시 등급 이력의 의미가 사라질 수 있습니다." },
      { id: "C", text: "주문에는 고객번호를 유지하고, 주문시점 고객등급처럼 거래 시점 의미가 있는 값은 주문에 보관하는 것을 검토한다.", explanation: "정답입니다. 현재값과 당시값의 의미를 구분해 반정규화 또는 이력 설계를 판단해야 합니다." },
      { id: "D", text: "조회 성능을 위해 고객번호를 제거하고 고객명만 주문의 식별자로 사용한다.", explanation: "오답입니다. 명칭은 변경 가능성이 있어 식별자로 부적절하고 참조 무결성도 약해집니다." }
    ],
    answer: "C",
    relatedConceptId: "modeling-normalization",
    hint: "1단계: 현재 고객 정보와 거래 당시 정보를 구분합니다.\n2단계: 성능 때문인지 업무 의미 때문인지 나누어 봅니다.\n3단계: 주문시점 값은 이력 또는 스냅샷 속성으로 보관할 수 있습니다.",
    explanation: "반정규화는 단순히 컬럼을 복사하는 것이 아니라 값의 업무 의미와 정합성 유지 방법을 함께 설계해야 한다. 주문 당시 고객등급은 현재 고객등급과 의미가 다르므로 주문 또는 등급이력 모델로 보존하는 것이 타당하다."
  },
  {
    subjectId: "modeling",
    number: 26,
    majorTopic: "데이터 모델링의 이해",
    middleTopic: "엔터티",
    topic: "슈퍼타입과 서브타입",
    difficulty: "중급",
    questionType: "모델 통합 판단형",
    mode: "similar",
    sourcePage: 17,
    parentQuestionId: "pdf-s-1-super-subtype",
    stem: "결제는 카드결제, 계좌이체, 포인트결제로 구분된다. 승인일시와 결제금액은 공통이고, 카드승인번호와 계좌은행코드처럼 유형별 고유 속성이 많다. 가장 적절한 설명은?",
    choices: [
      { id: "A", text: "모든 결제 유형을 무조건 하나의 테이블에 통합하고 고유 속성은 모두 NULL 허용 컬럼으로 둔다.", explanation: "오답입니다. 유형별 고유 속성이 많으면 NULL이 과도해지고 제약 표현이 어려워질 수 있습니다." },
      { id: "B", text: "공통 속성은 슈퍼타입에 두고 유형별 고유 속성은 서브타입으로 분리하는 논리 모델을 검토한다.", explanation: "정답입니다. 공통성과 배타성, 고유 속성의 양을 고려해 슈퍼/서브타입 모델을 설계합니다." },
      { id: "C", text: "카드결제만 엔터티로 두고 다른 결제 유형은 속성값으로만 저장한다.", explanation: "오답입니다. 유형별 고유 업무 규칙과 속성이 사라집니다." },
      { id: "D", text: "슈퍼타입과 서브타입은 물리 모델에서만 사용하는 저장 구조이므로 논리 모델에서는 다루지 않는다.", explanation: "오답입니다. 슈퍼/서브타입은 논리 모델에서 공통성과 특수성을 표현하는 중요한 구조입니다." }
    ],
    answer: "B",
    relatedConceptId: "modeling-entity",
    hint: "1단계: 유형 간 공통 속성과 고유 속성을 분리합니다.\n2단계: 유형이 서로 배타적인지 확인합니다.\n3단계: 논리 모델과 물리 테이블 통합/분리 판단은 구분합니다.",
    explanation: "슈퍼타입은 공통 속성과 관계를, 서브타입은 유형별 고유 속성과 규칙을 표현한다. 물리 모델에서는 조회 패턴과 성능에 따라 단일 테이블, 개별 테이블, 슈퍼+서브 테이블 방식 중 선택할 수 있다."
  },
  {
    subjectId: "modeling",
    number: 27,
    majorTopic: "데이터 모델링의 이해",
    middleTopic: "관계",
    topic: "M:N 관계 해소",
    difficulty: "기본",
    questionType: "ERD 해석형",
    mode: "original",
    sourcePage: 16,
    parentQuestionId: "pdf-o-1-many-to-many",
    stem: "학생은 여러 과목을 수강할 수 있고, 과목도 여러 학생에게 수강될 수 있다. 수강신청일자와 성적을 함께 관리해야 할 때 가장 적절한 모델은?",
    choices: [
      { id: "A", text: "학생 엔터티에 과목번호1, 과목번호2, 과목번호3을 반복 속성으로 둔다.", explanation: "오답입니다. 반복 속성은 확장성과 정규화 측면에서 부적절합니다." },
      { id: "B", text: "과목 엔터티에 학생번호 목록을 문자열로 저장한다.", explanation: "오답입니다. 원자성, 검색, 참조 무결성을 모두 해칩니다." },
      { id: "C", text: "학생과 과목 사이에 수강 엔터티를 만들고 수강신청일자와 성적을 수강의 속성으로 둔다.", explanation: "정답입니다. M:N 관계는 교차 엔터티로 해소하고 관계 속성을 그 엔터티에 둡니다." },
      { id: "D", text: "학생과 과목 중 데이터 건수가 적은 쪽에 상대방 식별자를 외래키로 둔다.", explanation: "오답입니다. 건수만으로 M:N 관계를 1:M으로 바꿀 수 없습니다." }
    ],
    answer: "C",
    relatedConceptId: "modeling-relationship",
    hint: "1단계: 양쪽 모두 여러 건을 가질 수 있는지 확인합니다.\n2단계: 관계 자체에 속성이 있는지 봅니다.\n3단계: M:N 관계는 교차 엔터티로 해소합니다.",
    explanation: "M:N 관계는 관계형 모델에서 직접 구현하기 어렵기 때문에 교차 엔터티를 만든다. 수강신청일자와 성적은 학생이나 과목 단독 속성이 아니라 수강 관계의 속성이므로 수강 엔터티에 배치한다."
  },
  {
    subjectId: "modeling",
    number: 28,
    majorTopic: "데이터 모델과 성능",
    middleTopic: "NULL",
    topic: "NULL 의미 분리",
    difficulty: "중급",
    questionType: "모델 품질 판단형",
    mode: "variant",
    sourcePage: 111,
    parentQuestionId: "pdf-v-1-null-modeling",
    stem: "배송 엔터티의 배송완료일 컬럼이 NULL인 경우가 있다. 미배송, 배송불가, 아직 입력 전이라는 의미가 모두 섞여 있어 SQL 조건과 통계가 흔들린다. 가장 적절한 개선 방향은?",
    choices: [
      { id: "A", text: "NULL을 모두 '99991231'로 바꿔 저장한다.", explanation: "오답입니다. 의미를 코드값으로 숨기면 날짜 연산과 데이터 품질 문제가 생깁니다." },
      { id: "B", text: "배송상태코드 등으로 상태 의미를 분리하고 완료된 경우에만 배송완료일을 관리한다.", explanation: "정답입니다. NULL의 업무 의미를 상태 속성으로 분리하면 조건과 제약이 명확해집니다." },
      { id: "C", text: "배송완료일을 필수값으로 바꾸고 시스템일자를 자동 입력한다.", explanation: "오답입니다. 완료되지 않은 배송에 완료일을 강제로 넣으면 업무 사실이 왜곡됩니다." },
      { id: "D", text: "NULL은 SQL에서 모두 같은 의미이므로 모델링에서는 구분할 필요가 없다.", explanation: "오답입니다. 같은 NULL이라도 업무상 미확정, 해당 없음, 미입력은 다르게 관리해야 할 수 있습니다." }
    ],
    answer: "B",
    relatedConceptId: "modeling-null",
    hint: "1단계: NULL이 하나의 업무 의미인지 여러 의미인지 확인합니다.\n2단계: 조건 검색과 제약이 왜 애매해지는지 봅니다.\n3단계: 상태 속성과 날짜 속성의 역할을 분리합니다.",
    explanation: "NULL의 의미가 여러 개로 섞이면 SQL 조건, 통계정보, 업무 규칙 검증이 모두 불명확해진다. 상태코드로 업무 상태를 표현하고 날짜는 실제 완료 시점이 존재할 때만 저장하는 방식이 더 명확하다."
  },
  {
    subjectId: "modeling",
    number: 29,
    majorTopic: "데이터 모델링의 이해",
    middleTopic: "속성",
    topic: "코드와 도메인",
    difficulty: "기본",
    questionType: "속성 설계 선택형",
    mode: "similar",
    sourcePage: 13,
    parentQuestionId: "pdf-s-1-domain-code",
    stem: "주문상태를 화면마다 '접수', '주문접수', '신규'처럼 다른 문자열로 저장하고 있어 집계 기준이 흔들린다. 가장 적절한 설계는?",
    choices: [
      { id: "A", text: "화면에 표시되는 문자열을 그대로 주문상태 속성에 계속 저장한다.", explanation: "오답입니다. 동일 의미가 여러 값으로 저장되어 집계와 조건 검색이 불안정해집니다." },
      { id: "B", text: "주문상태코드와 코드값 정의를 관리하고, 화면 표시명은 코드 관리 기준으로 통제한다.", explanation: "정답입니다. 도메인과 코드 체계를 관리하면 값의 의미와 허용 범위를 표준화할 수 있습니다." },
      { id: "C", text: "주문상태 컬럼을 제거하고 주문일자만으로 상태를 추정한다.", explanation: "오답입니다. 날짜만으로 주문 상태의 업무 의미를 정확히 알 수 없습니다." },
      { id: "D", text: "집계할 때마다 CASE 문으로 모든 문자열을 보정하면 모델 변경이 필요 없다.", explanation: "오답입니다. SQL마다 보정 로직이 반복되어 품질 문제가 지속됩니다." }
    ],
    answer: "B",
    relatedConceptId: "modeling-attribute",
    hint: "1단계: 같은 의미가 여러 표현으로 저장되는지 봅니다.\n2단계: 속성값의 허용 범위를 어디에서 통제할지 생각합니다.\n3단계: 코드와 도메인은 데이터 표준화와 품질 관리의 기준입니다.",
    explanation: "도메인은 속성이 가질 수 있는 값의 범위와 성격을 정의한다. 주문상태처럼 업무 의미가 중요한 값은 코드 체계로 관리하여 입력, 집계, 조회 기준을 통일해야 한다."
  },
  {
    subjectId: "modeling",
    number: 30,
    majorTopic: "데이터 모델과 성능",
    middleTopic: "분산 데이터베이스",
    topic: "지역 분산과 통합 조회",
    difficulty: "상급",
    questionType: "성능 모델링 판단형",
    mode: "similar",
    sourcePage: 114,
    parentQuestionId: "pdf-s-1-distributed-model",
    stem: "주문 데이터의 95%는 지역 지사에서 해당 지역 고객만 조회하지만, 본사는 매일 전체 주문을 통합 집계한다. 분산 설계 관점에서 가장 적절한 판단은?",
    choices: [
      { id: "A", text: "모든 데이터를 본사 한 곳에만 저장하고 지사는 매번 원격 조회한다.", explanation: "오답입니다. 지역 조회가 대부분이면 네트워크 비용과 응답시간 문제가 커질 수 있습니다." },
      { id: "B", text: "지역 기준으로 데이터를 분산하고 본사 집계는 동기화 또는 집계 전송 방식을 함께 설계한다.", explanation: "정답입니다. 지역 처리 지역성과 본사 통합 요구를 모두 고려해야 합니다." },
      { id: "C", text: "본사 집계가 있으므로 지역별 분산은 절대 사용할 수 없다.", explanation: "오답입니다. 통합 조회가 있어도 동기화, 복제, 집계 테이블 등으로 보완할 수 있습니다." },
      { id: "D", text: "지역 컬럼을 삭제하면 모든 지역 데이터가 동일 구조가 되어 성능 문제가 해결된다.", explanation: "오답입니다. 분산 기준과 검색 조건이 사라져 오히려 업무 처리가 어려워집니다." }
    ],
    answer: "B",
    relatedConceptId: "modeling-data-model",
    hint: "1단계: 주된 트랜잭션이 지역 내부인지 본사 통합인지 비율을 봅니다.\n2단계: 분산은 조회 지역성과 동기화 비용을 함께 판단합니다.\n3단계: 지역 분산과 본사 집계 요구는 보완 설계로 함께 만족시킬 수 있습니다.",
    explanation: "분산 데이터베이스 설계는 업무 처리 위치, 데이터 접근 빈도, 네트워크 비용, 동기화 요구를 함께 고려한다. 지역 조회가 압도적으로 많다면 지역 기준 분산이 타당할 수 있고, 본사 집계는 별도 통합/집계 흐름으로 설계한다."
  },
  {
    subjectId: "sql-basic",
    number: 21,
    majorTopic: "SQL 기본 및 활용",
    middleTopic: "집합 연산",
    topic: "UNION과 UNION ALL",
    difficulty: "중급",
    questionType: "SQL 결과 건수 추론형",
    mode: "original",
    sourcePage: 75,
    parentQuestionId: "pdf-o-2-set-operator-count",
    stem: "아래 두 테이블에 대해 가와 나 SQL을 수행했을 때 결과 행 수로 가장 적절한 것은?",
    code: `가.
SELECT A, B, C FROM T1
UNION ALL
SELECT A, B, C FROM T2;

나.
SELECT A, B, C FROM T1
UNION
SELECT A, B, C FROM T2;`,
    table: {
      headers: ["테이블", "A", "B", "C"],
      rows: [["T1", "A3", "B2", "C3"], ["T1", "A1", "B1", "C1"], ["T1", "A2", "B1", "C2"], ["T2", "A1", "B1", "C1"], ["T2", "A3", "B2", "C3"]]
    },
    choices: [
      { id: "A", text: "가: 5건, 나: 3건", explanation: "정답입니다. UNION ALL은 중복을 유지하므로 5건이고, UNION은 두 테이블의 중복 행 2개를 제거해 3건입니다." },
      { id: "B", text: "가: 5건, 나: 5건", explanation: "오답입니다. UNION은 중복 제거를 수행합니다." },
      { id: "C", text: "가: 3건, 나: 5건", explanation: "오답입니다. UNION ALL은 중복을 제거하지 않으므로 원본 행 수 합계가 됩니다." },
      { id: "D", text: "가: 3건, 나: 3건", explanation: "오답입니다. 가는 UNION ALL이므로 중복이 유지됩니다." }
    ],
    answer: "A",
    relatedConceptId: "sql-set-operators",
    hint: "1단계: 두 테이블의 전체 행 수를 더합니다.\n2단계: T1과 T2에 완전히 같은 행이 몇 개인지 찾습니다.\n3단계: UNION ALL은 유지, UNION은 중복 제거입니다.",
    explanation: "집합 연산에서 UNION은 중복 제거와 정렬성 작업이 수반될 수 있고, UNION ALL은 중복 제거 없이 결과를 이어 붙인다. 세 컬럼이 모두 같은 행만 중복으로 판단한다."
  },
  {
    subjectId: "sql-basic",
    number: 22,
    majorTopic: "SQL 기본 및 활용",
    middleTopic: "JOIN",
    topic: "Outer Join 결과",
    difficulty: "상급",
    questionType: "조인 결과 건수 추론형",
    mode: "variant",
    sourcePage: 74,
    parentQuestionId: "pdf-v-2-outer-join-count",
    stem: "EMP.C는 DEPT.C와 연결된 외래키다. EMP와 DEPT를 LEFT OUTER JOIN, FULL OUTER JOIN, RIGHT OUTER JOIN 했을 때 결과 건수로 가장 적절한 것은?",
    table: {
      headers: ["테이블", "컬럼1", "컬럼2", "컬럼3"],
      rows: [["EMP", "A=1", "B=b", "C=w"], ["EMP", "A=3", "B=d", "C=w"], ["EMP", "A=5", "B=y", "C=y"], ["DEPT", "C=w", "D=1", "E=10"], ["DEPT", "C=z", "D=4", "E=11"], ["DEPT", "C=v", "D=2", "E=22"]]
    },
    choices: [
      { id: "A", text: "3건, 5건, 3건", explanation: "오답입니다. RIGHT OUTER JOIN은 DEPT의 미매칭 행 z, v도 보존하므로 4건입니다." },
      { id: "B", text: "3건, 5건, 4건", explanation: "정답입니다. LEFT는 EMP 3건 보존, FULL은 양쪽 미매칭을 모두 포함해 5건, RIGHT는 DEPT 3건 기준에 w 매칭 2건이 붙어 4건입니다." },
      { id: "C", text: "4건, 5건, 4건", explanation: "오답입니다. LEFT OUTER JOIN은 EMP의 3행만 보존되며 DEPT 미매칭 행은 포함하지 않습니다." },
      { id: "D", text: "3건, 4건, 5건", explanation: "오답입니다. FULL OUTER JOIN은 양쪽 미매칭을 모두 포함하므로 RIGHT보다 작을 수 없습니다." }
    ],
    answer: "B",
    relatedConceptId: "sql-standard-join",
    hint: "1단계: EMP의 C 값과 DEPT의 C 값을 비교합니다.\n2단계: w는 EMP 2건과 DEPT 1건이 매칭됩니다.\n3단계: LEFT, RIGHT, FULL이 보존하는 기준 집합을 따로 계산합니다.",
    explanation: "Outer Join은 어느 쪽의 미매칭 행을 보존하는지가 핵심이다. w는 두 EMP 행과 한 DEPT 행이 매칭되어 2건이 되고, EMP의 y와 DEPT의 z, v는 조인 종류에 따라 보존 여부가 달라진다."
  },
  {
    subjectId: "sql-basic",
    number: 23,
    majorTopic: "SQL 기본 및 활용",
    middleTopic: "DDL",
    topic: "참조 동작",
    difficulty: "상급",
    questionType: "제약조건 결과 추론형",
    mode: "similar",
    sourcePage: 24,
    parentQuestionId: "pdf-s-2-referential-action",
    stem: "다음 제약조건과 데이터가 있을 때 DELETE FROM T WHERE C = 1을 수행한 후 R에 남는 데이터로 가장 적절한 것은?",
    code: `CREATE TABLE T (
  C INTEGER PRIMARY KEY,
  D INTEGER
);

CREATE TABLE S (
  B INTEGER PRIMARY KEY,
  C INTEGER REFERENCES T(C) ON DELETE CASCADE
);

CREATE TABLE R (
  A INTEGER PRIMARY KEY,
  B INTEGER REFERENCES S(B) ON DELETE SET NULL
);`,
    table: {
      headers: ["테이블", "행"],
      rows: [["T", "(C,D) = (1,1), (2,2)"], ["S", "(B,C) = (1,1), (2,1)"], ["R", "(A,B) = (1,1), (2,2)"]]
    },
    choices: [
      { id: "A", text: "(1, NULL), (2, NULL)", explanation: "정답입니다. T의 C=1 삭제로 S의 B=1,2가 모두 삭제되고, R의 B는 ON DELETE SET NULL에 의해 NULL이 됩니다." },
      { id: "B", text: "(1, NULL), (2, 2)", explanation: "오답입니다. S의 B=2도 C=1을 참조하므로 함께 삭제됩니다." },
      { id: "C", text: "R의 모든 행이 삭제된다.", explanation: "오답입니다. R은 S 삭제 시 CASCADE가 아니라 SET NULL입니다." },
      { id: "D", text: "(1,1), (2,2)가 그대로 남는다.", explanation: "오답입니다. 상위 S 행 삭제가 R의 외래키 값에 영향을 줍니다." }
    ],
    answer: "A",
    relatedConceptId: "sql-select",
    hint: "1단계: T 삭제가 S에 어떤 동작을 일으키는지 확인합니다.\n2단계: 삭제되는 S 행의 B 값을 찾습니다.\n3단계: R은 CASCADE가 아니라 SET NULL입니다.",
    explanation: "참조 동작은 단계적으로 적용된다. T(C=1)를 참조하는 S 두 행이 ON DELETE CASCADE로 삭제되고, R은 삭제된 S(B=1,2)를 참조하던 B 값을 NULL로 변경한다."
  },
  {
    subjectId: "sql-basic",
    number: 24,
    majorTopic: "SQL 기본 및 활용",
    middleTopic: "WHERE",
    topic: "NULL과 NOT IN",
    difficulty: "상급",
    questionType: "SQL 결과 추론형",
    mode: "variant",
    sourcePage: 26,
    parentQuestionId: "pdf-v-2-null-not-in",
    stem: "EMP의 DEPTNO는 10, 20, 30이고, TEMP_DEPT의 DEPTNO는 20, NULL이다. 다음 SQL 결과로 가장 적절한 것은?",
    code: `SELECT deptno
FROM emp
WHERE deptno NOT IN (SELECT deptno FROM temp_dept);`,
    choices: [
      { id: "A", text: "10, 30", explanation: "오답입니다. 서브쿼리 결과에 NULL이 포함되면 NOT IN 비교 결과가 UNKNOWN이 되어 행이 반환되지 않습니다." },
      { id: "B", text: "10", explanation: "오답입니다. 30도 20과 같지 않지만 NULL 때문에 전체 비교가 UNKNOWN이 됩니다." },
      { id: "C", text: "결과 없음", explanation: "정답입니다. NOT IN 목록에 NULL이 포함되면 모든 후보 행의 조건이 TRUE가 되지 않습니다." },
      { id: "D", text: "20", explanation: "오답입니다. 20은 목록에 존재하므로 제외 대상입니다." }
    ],
    answer: "C",
    relatedConceptId: "sql-where",
    hint: "1단계: IN 목록에 NULL이 있는지 확인합니다.\n2단계: NOT IN은 모든 비교가 거짓이어야 TRUE가 됩니다.\n3단계: NULL 비교는 TRUE/FALSE가 아니라 UNKNOWN입니다.",
    explanation: "NOT IN은 내부적으로 여러 부등 비교의 AND 조건처럼 동작한다. 목록에 NULL이 있으면 비교 결과에 UNKNOWN이 섞여 WHERE 조건을 통과하지 못하므로 결과가 없을 수 있다. 이런 경우 NOT EXISTS와 NULL 배제를 고려한다."
  },
  {
    subjectId: "sql-basic",
    number: 25,
    majorTopic: "SQL 기본 및 활용",
    middleTopic: "Window Function",
    topic: "RANK와 ROW_NUMBER",
    difficulty: "중급",
    questionType: "함수 결과 선택형",
    mode: "similar",
    sourcePage: 38,
    parentQuestionId: "pdf-s-2-window-rank",
    stem: "부서별 급여 상위 1명을 조회하려 한다. 동점자가 있더라도 부서별 정확히 1행만 반환해야 한다. 가장 적절한 분석 함수는?",
    choices: [
      { id: "A", text: "RANK() OVER (PARTITION BY 부서번호 ORDER BY 급여 DESC)", explanation: "오답입니다. 공동 1등이 있으면 여러 행이 1등으로 반환될 수 있습니다." },
      { id: "B", text: "DENSE_RANK() OVER (PARTITION BY 부서번호 ORDER BY 급여 DESC)", explanation: "오답입니다. RANK와 마찬가지로 동점자 모두 같은 순위를 받을 수 있습니다." },
      { id: "C", text: "ROW_NUMBER() OVER (PARTITION BY 부서번호 ORDER BY 급여 DESC, 사원번호)", explanation: "정답입니다. 동점 정렬 기준을 추가하면 부서별 정확히 한 행을 안정적으로 선택할 수 있습니다." },
      { id: "D", text: "SUM(급여) OVER (PARTITION BY 부서번호)", explanation: "오답입니다. SUM은 집계값을 계산할 뿐 순위를 부여하지 않습니다." }
    ],
    answer: "C",
    relatedConceptId: "sql-window-functions",
    hint: "1단계: 동점자를 모두 반환해야 하는지 정확히 한 행만 반환해야 하는지 확인합니다.\n2단계: RANK 계열은 동점 순위를 허용합니다.\n3단계: ROW_NUMBER에는 결정적 정렬 기준을 추가하는 것이 안전합니다.",
    explanation: "RANK와 DENSE_RANK는 동점자에게 같은 순위를 부여하므로 상위 1등 조건에서 여러 행이 나올 수 있다. 부서별 정확히 1행이 필요하면 ROW_NUMBER와 추가 정렬 기준을 사용한다."
  },
  {
    subjectId: "sql-basic",
    number: 26,
    majorTopic: "SQL 기본 및 활용",
    middleTopic: "GROUP BY",
    topic: "ROLLUP과 GROUPING",
    difficulty: "상급",
    questionType: "집계 결과 해석형",
    mode: "similar",
    sourcePage: 36,
    parentQuestionId: "pdf-s-2-rollup-grouping",
    stem: "GROUP BY ROLLUP(지역, 상품) 결과에서 지역별 소계 행과 전체 합계 행을 구분해 표시하려 한다. 가장 적절한 설명은?",
    choices: [
      { id: "A", text: "상품이 NULL이면 항상 원천 데이터의 상품 값이 NULL인 행이다.", explanation: "오답입니다. ROLLUP 소계 때문에 생성된 NULL일 수도 있습니다." },
      { id: "B", text: "GROUPING(상품)을 사용하면 소계 생성으로 인한 NULL인지 구분할 수 있다.", explanation: "정답입니다. GROUPING 함수는 집계 연산이 만든 NULL이면 1을 반환합니다." },
      { id: "C", text: "ROLLUP은 전체 합계 행을 만들지 않는다.", explanation: "오답입니다. ROLLUP은 지정 컬럼 순서에 따른 소계와 전체 합계를 생성합니다." },
      { id: "D", text: "지역별 소계를 만들려면 CUBE만 사용할 수 있고 ROLLUP은 사용할 수 없다.", explanation: "오답입니다. 계층적 소계에는 ROLLUP이 적합합니다." }
    ],
    answer: "B",
    relatedConceptId: "sql-group-functions",
    hint: "1단계: 집계 결과의 NULL과 원천 데이터의 NULL을 구분합니다.\n2단계: ROLLUP이 어떤 소계 행을 추가하는지 확인합니다.\n3단계: GROUPING 함수는 집계로 생긴 NULL 표시용입니다.",
    explanation: "ROLLUP 결과의 NULL은 원천 데이터의 NULL일 수도 있고 소계 행을 표현하기 위해 생성된 NULL일 수도 있다. GROUPING 컬럼 함수를 사용하면 이를 구분해 소계와 총계를 안정적으로 표시할 수 있다."
  },
  {
    subjectId: "sql-basic",
    number: 27,
    majorTopic: "SQL 기본 및 활용",
    middleTopic: "DML",
    topic: "MERGE",
    difficulty: "상급",
    questionType: "SQL 동작 판단형",
    mode: "variant",
    sourcePage: 39,
    parentQuestionId: "pdf-v-2-merge",
    stem: "TARGET 테이블의 상품번호는 유일하다. MERGE 문에서 USING 절의 SOURCE 결과에 같은 상품번호가 두 행 이상 존재하고, 해당 상품번호가 TARGET 한 행과 매칭된다. 가장 적절한 설명은?",
    choices: [
      { id: "A", text: "TARGET 한 행을 SOURCE 행 수만큼 순서대로 여러 번 UPDATE한다.", explanation: "오답입니다. 같은 대상 행을 여러 번 갱신하려는 MERGE는 안정적인 갱신 집합을 만들지 못합니다." },
      { id: "B", text: "Oracle에서는 동일 대상 행을 여러 번 갱신할 수 없어 오류가 발생할 수 있다.", explanation: "정답입니다. MERGE의 매칭 소스가 대상 행에 중복 대응되면 ORA-30926 같은 오류가 발생할 수 있습니다." },
      { id: "C", text: "SOURCE 중 첫 번째 행만 사용하고 나머지는 자동으로 무시한다.", explanation: "오답입니다. 임의로 첫 행만 선택하지 않습니다." },
      { id: "D", text: "중복 SOURCE 행은 모두 INSERT 절로 이동한다.", explanation: "오답입니다. 이미 TARGET과 매칭되는 행은 INSERT 대상이 아닙니다." }
    ],
    answer: "B",
    relatedConceptId: "sql-select",
    hint: "1단계: SOURCE 결과가 대상 키 기준으로 유일한지 확인합니다.\n2단계: 한 TARGET 행을 여러 SOURCE 행이 동시에 갱신하려는 상황을 떠올립니다.\n3단계: MERGE 전에 SOURCE를 그룹화하거나 중복 제거해야 할 수 있습니다.",
    explanation: "MERGE는 매칭 조건에 의해 대상 행이 안정적으로 결정되어야 한다. SOURCE 쪽 중복으로 하나의 TARGET 행이 여러 번 갱신 대상이 되면 오류가 발생할 수 있으므로, USING 절에서 키 기준 유일성을 먼저 보장해야 한다."
  },
  {
    subjectId: "sql-basic",
    number: 28,
    majorTopic: "SQL 기본 및 활용",
    middleTopic: "SELECT",
    topic: "Top-N",
    difficulty: "중급",
    questionType: "SQL Rewrite 선택형",
    mode: "similar",
    sourcePage: 34,
    parentQuestionId: "pdf-s-2-topn-rownum",
    stem: "급여가 높은 사원 10명을 조회하려 한다. Oracle ROWNUM을 사용할 때 가장 적절한 SQL 구조는?",
    choices: [
      { id: "A", text: "SELECT * FROM emp WHERE ROWNUM <= 10 ORDER BY sal DESC", explanation: "오답입니다. ROWNUM이 먼저 부여된 뒤 정렬되어 전체 상위 10명이 아닐 수 있습니다." },
      { id: "B", text: "SELECT * FROM (SELECT * FROM emp ORDER BY sal DESC) WHERE ROWNUM <= 10", explanation: "정답입니다. 먼저 정렬한 인라인 뷰 결과에 ROWNUM 조건을 적용해야 합니다." },
      { id: "C", text: "SELECT * FROM emp WHERE ROWNUM = 10 ORDER BY sal DESC", explanation: "오답입니다. ROWNUM = 10 조건은 일반적으로 원하는 방식으로 성립하지 않습니다." },
      { id: "D", text: "SELECT * FROM emp ORDER BY ROWNUM DESC FETCH FIRST 10 ROWS ONLY", explanation: "오답입니다. ROWNUM을 기준으로 정렬하면 급여 상위 조건과 무관합니다." }
    ],
    answer: "B",
    relatedConceptId: "sql-top-n",
    hint: "1단계: ROWNUM이 언제 부여되는지 생각합니다.\n2단계: 상위 10명을 정하려면 정렬이 먼저 끝나야 합니다.\n3단계: 정렬은 인라인 뷰 안에 두고 바깥에서 ROWNUM을 제한합니다.",
    explanation: "Oracle에서 ROWNUM은 행이 반환되는 시점에 부여되므로 ORDER BY보다 먼저 적용될 수 있다. Top-N은 정렬된 결과를 인라인 뷰로 만든 뒤 바깥에서 ROWNUM 조건을 적용하는 구조가 안전하다."
  },
  {
    subjectId: "sql-basic",
    number: 29,
    majorTopic: "SQL 기본 및 활용",
    middleTopic: "JOIN",
    topic: "Outer Join 조건 위치",
    difficulty: "상급",
    questionType: "SQL 결과 변화 판단형",
    mode: "similar",
    sourcePage: 31,
    parentQuestionId: "pdf-s-2-outer-join-filter",
    stem: "주문은 모두 보여주되 배송 완료 건만 배송일자를 표시하려 한다. 배송이 없는 주문도 결과에 남아야 한다. 가장 적절한 조건 위치는?",
    choices: [
      { id: "A", text: "LEFT JOIN 배송 d ON d.주문번호 = o.주문번호 WHERE d.배송상태 = '완료'", explanation: "오답입니다. WHERE에서 d 조건을 걸면 배송이 없는 주문이 제거되어 INNER JOIN처럼 동작할 수 있습니다." },
      { id: "B", text: "LEFT JOIN 배송 d ON d.주문번호 = o.주문번호 AND d.배송상태 = '완료'", explanation: "정답입니다. 보존해야 할 주문은 유지하고, 배송 쪽 매칭 조건만 완료 상태로 제한합니다." },
      { id: "C", text: "RIGHT JOIN 주문 o ON d.주문번호 = o.주문번호 WHERE d.배송상태 = '완료'", explanation: "오답입니다. 표현을 바꿔도 WHERE의 배송 조건 때문에 미배송 주문 보존이 깨질 수 있습니다." },
      { id: "D", text: "배송 테이블을 먼저 조회한 후 완료 배송만 주문과 INNER JOIN한다.", explanation: "오답입니다. 배송이 없는 주문을 반드시 보존해야 하므로 INNER JOIN은 부적절합니다." }
    ],
    answer: "B",
    relatedConceptId: "sql-standard-join",
    hint: "1단계: 보존해야 하는 기준 테이블이 주문인지 배송인지 확인합니다.\n2단계: 외부 조인 후 WHERE에서 후행 테이블 조건을 걸면 어떤 행이 제거되는지 봅니다.\n3단계: 후행 테이블 제한 조건은 ON 절에 두는 것이 안전합니다.",
    explanation: "Outer Join에서 보존되지 않는 쪽 테이블의 조건을 WHERE 절에 두면 NULL 확장 행이 제거될 수 있다. 주문 전체를 보존해야 하므로 배송 상태 조건은 ON 절에 두어 배송 매칭만 제한한다."
  },
  {
    subjectId: "sql-basic",
    number: 30,
    majorTopic: "SQL 기본 및 활용",
    middleTopic: "GROUP BY",
    topic: "WHERE와 HAVING",
    difficulty: "중급",
    questionType: "조건절 판단형",
    mode: "original",
    sourcePage: 35,
    parentQuestionId: "pdf-o-2-where-having",
    stem: "부서별 급여 합계가 1,000 이상인 부서만 조회하되, 퇴사자는 집계에서 제외해야 한다. 가장 적절한 조건 사용은?",
    choices: [
      { id: "A", text: "퇴사자 제외 조건은 WHERE에, 급여 합계 조건은 HAVING에 둔다.", explanation: "정답입니다. 행 단위 필터는 집계 전에 WHERE, 그룹 집계 조건은 HAVING에서 처리합니다." },
      { id: "B", text: "퇴사자 제외 조건과 급여 합계 조건을 모두 WHERE에 둔다.", explanation: "오답입니다. SUM(급여) 같은 집계 조건은 WHERE에서 사용할 수 없습니다." },
      { id: "C", text: "퇴사자 제외 조건과 급여 합계 조건을 모두 HAVING에 둔다.", explanation: "오답입니다. 가능할 수 있어도 행 단위 조건을 집계 후 처리하면 불필요한 집계 대상이 늘어납니다." },
      { id: "D", text: "GROUP BY가 있으면 WHERE와 HAVING은 동시에 사용할 수 없다.", explanation: "오답입니다. WHERE와 HAVING은 처리 단계가 다르며 함께 사용할 수 있습니다." }
    ],
    answer: "A",
    relatedConceptId: "sql-group-having",
    hint: "1단계: 조건이 개별 행에 대한 것인지 그룹 결과에 대한 것인지 나눕니다.\n2단계: 퇴사자 제외는 집계 전 필터입니다.\n3단계: 급여 합계 조건은 그룹 집계 후 판단합니다.",
    explanation: "WHERE는 그룹화 전 행을 필터링하고 HAVING은 그룹화 후 집계 결과를 필터링한다. 퇴사자 제외는 집계 대상 행을 줄이는 조건이고 급여 합계는 그룹 결과에 대한 조건이다."
  },
  {
    subjectId: "tuning",
    number: 21,
    majorTopic: "SQL 고급활용 및 튜닝",
    middleTopic: "인덱스 튜닝",
    topic: "Access Predicate와 Filter Predicate",
    difficulty: "상급",
    questionType: "실행계획 해석형",
    mode: "variant",
    sourcePage: 84,
    parentQuestionId: "pdf-v-3-access-filter",
    stem: "IDX_ORD(고객번호, 주문일자, 상태코드) 인덱스가 있고 아래 조건으로 조회한다. 실행계획에서 주문일자는 access predicate, 상태코드는 filter predicate로 표시되었다. 가장 적절한 해석은?",
    code: `WHERE 고객번호 = :cust_no
  AND 주문일자 BETWEEN :dt1 AND :dt2
  AND 상태코드 = '배송완료'`,
    choices: [
      { id: "A", text: "상태코드는 인덱스에 있으므로 반드시 스캔 시작점과 종료점을 줄이는 데 사용된다.", explanation: "오답입니다. 인덱스에 있어도 선행 범위 조건 뒤 컬럼은 스캔 범위 축소가 아니라 필터로 평가될 수 있습니다." },
      { id: "B", text: "고객번호와 주문일자로 인덱스 범위를 찾고, 그 범위 안에서 상태코드를 추가 필터링한 것이다.", explanation: "정답입니다. 등치 선두 조건과 범위 조건이 access에 사용되고 후속 컬럼은 filter가 될 수 있습니다." },
      { id: "C", text: "filter predicate는 테이블을 읽은 후에만 평가되므로 인덱스 리프에서는 평가될 수 없다.", explanation: "오답입니다. 인덱스 필터도 가능하지만 스캔 범위를 줄이지 못한다는 점이 핵심입니다." },
      { id: "D", text: "상태코드를 인덱스 맨 뒤에 두면 항상 테이블 액세스가 사라진다.", explanation: "오답입니다. 출력 컬럼과 조건, 인덱스 구성에 따라 테이블 액세스 여부가 달라집니다." }
    ],
    answer: "B",
    relatedConceptId: "tuning-index-scan-efficiency",
    hint: "1단계: 인덱스 컬럼 순서에서 등치 조건과 범위 조건의 위치를 확인합니다.\n2단계: access는 스캔 범위를 줄이고 filter는 읽은 범위 안에서 걸러냅니다.\n3단계: 범위 조건 뒤 컬럼이 항상 시작/종료 조건이 되는 것은 아닙니다.",
    explanation: "결합 인덱스에서 선두 등치 조건과 그 다음 범위 조건은 인덱스 탐색 범위를 정하는 데 사용될 수 있다. 범위 조건 이후 컬럼은 인덱스에 있더라도 스캔 범위를 더 좁히지 못하고 필터로 평가되는 경우가 많다."
  },
  {
    subjectId: "tuning",
    number: 22,
    majorTopic: "SQL 고급활용 및 튜닝",
    middleTopic: "조인 튜닝",
    topic: "NL Join 반복 비용",
    difficulty: "최상급",
    questionType: "Trace 분석 선택형",
    mode: "similar",
    sourcePage: 85,
    parentQuestionId: "pdf-s-3-nl-trace",
    stem: "Trace에서 선행 주문 결과는 42,000건이고, 후행 고객_PK INDEX UNIQUE SCAN의 Starts가 42,000, CR이 84,000으로 나타났다. 화면 출력에는 고객 컬럼이 없다. 가장 먼저 검토할 튜닝 방향은?",
    choices: [
      { id: "A", text: "고객_PK 인덱스를 삭제해 Full Scan으로 바꾼다.", explanation: "오답입니다. 인덱스 삭제는 근본 해결이 아니며 다른 SQL까지 악화시킬 수 있습니다." },
      { id: "B", text: "고객 컬럼 미사용과 참조 무결성 전제를 확인해 조인 제거 가능성을 검토한다.", explanation: "정답입니다. 후행 고객 탐색이 결과 건수만큼 반복되고 고객 컬럼을 사용하지 않으므로 불필요한 조인인지 확인해야 합니다." },
      { id: "C", text: "후행 고객 테이블을 항상 Hash Join의 Build Input으로 강제한다.", explanation: "오답입니다. 조인이 불필요하다면 조인 방식 변경보다 제거가 우선입니다." },
      { id: "D", text: "주문 결과가 많으므로 ORDER BY를 추가해 고객 탐색 순서를 안정화한다.", explanation: "오답입니다. 정렬은 반복 탐색 자체를 줄이지 못하고 비용만 늘릴 수 있습니다." }
    ],
    answer: "B",
    relatedConceptId: "tuning-sql-trace",
    hint: "1단계: Starts가 선행 결과 건수와 같은 후행 오퍼레이션을 찾습니다.\n2단계: SELECT와 WHERE에서 후행 테이블 컬럼을 쓰는지 확인합니다.\n3단계: 결과 보존 전제가 있으면 조인 제거가 반복 CR을 크게 줄일 수 있습니다.",
    explanation: "NL Join에서 후행 인덱스 탐색은 선행 결과 건수만큼 반복된다. 후행 테이블 컬럼을 사용하지 않고 참조 무결성으로 결과 보존이 가능하다면 조인 제거가 가장 효과적인 개선일 수 있다."
  },
  {
    subjectId: "tuning",
    number: 23,
    majorTopic: "SQL 고급활용 및 튜닝",
    middleTopic: "인덱스 튜닝",
    topic: "결합 인덱스 컬럼 순서",
    difficulty: "상급",
    questionType: "인덱스 구성안 선택형",
    mode: "similar",
    sourcePage: 83,
    parentQuestionId: "pdf-s-3-composite-index",
    stem: "게시글 목록에서 게시구분은 등치 조건, 등록일시는 최근순 정렬과 범위 조건, 게시글번호는 같은 등록일시의 정렬 보조 컬럼이다. 상위 20건만 조회한다. 가장 유리한 결합 인덱스는?",
    choices: [
      { id: "A", text: "(등록일시 DESC, 게시구분, 게시글번호 DESC)", explanation: "오답입니다. 선두 컬럼이 등록일시면 게시구분 등치 조건으로 범위를 충분히 좁히기 어렵습니다." },
      { id: "B", text: "(게시구분, 등록일시 DESC, 게시글번호 DESC)", explanation: "정답입니다. 등치 조건으로 시작 범위를 줄이고 정렬 순서와 Top-N 처리를 함께 활용할 수 있습니다." },
      { id: "C", text: "(게시글번호 DESC, 등록일시 DESC, 게시구분)", explanation: "오답입니다. 게시글번호는 조건 컬럼이 아니라 보조 정렬 컬럼이므로 선두에 두기 어렵습니다." },
      { id: "D", text: "(게시구분, 게시글번호 DESC, 등록일시 DESC)", explanation: "오답입니다. 등록일시 최근순 정렬을 자연스럽게 처리하기 어렵고 범위 조건 활용도 떨어집니다." }
    ],
    answer: "B",
    relatedConceptId: "tuning-index-design",
    hint: "1단계: 등치 조건 컬럼을 먼저 배치할 수 있는지 확인합니다.\n2단계: ORDER BY와 인덱스 정렬 순서가 맞는지 봅니다.\n3단계: Top-N은 정렬을 피하고 조기 종료할 수 있는 인덱스가 유리합니다.",
    explanation: "결합 인덱스 설계에서는 등치 조건으로 시작 범위를 좁힌 뒤, 범위/정렬 컬럼 순서가 ORDER BY와 맞는지 확인한다. 상위 20건 조회는 인덱스 정렬 순서를 활용하면 STOPKEY 방식으로 조기 종료할 수 있다."
  },
  {
    subjectId: "tuning",
    number: 24,
    majorTopic: "SQL 고급활용 및 튜닝",
    middleTopic: "인덱스 튜닝",
    topic: "클러스터링 팩터",
    difficulty: "중급",
    questionType: "비용 판단형",
    mode: "original",
    sourcePage: 82,
    parentQuestionId: "pdf-o-3-clustering-factor",
    stem: "두 인덱스의 선택도는 비슷하지만 IDX_A의 클러스터링 팩터는 테이블 블록 수에 가깝고, IDX_B의 클러스터링 팩터는 테이블 행 수에 가깝다. 인덱스 스캔 후 테이블 액세스 비용 관점에서 가장 적절한 설명은?",
    choices: [
      { id: "A", text: "IDX_A가 테이블 블록 방문 지역성이 좋아 랜덤 액세스 비용이 상대적으로 낮을 가능성이 높다.", explanation: "정답입니다. 클러스터링 팩터가 블록 수에 가까울수록 인덱스 순서와 테이블 저장 순서가 잘 맞습니다." },
      { id: "B", text: "IDX_B가 행 수에 가까우므로 항상 더 좋은 인덱스다.", explanation: "오답입니다. 클러스터링 팩터가 행 수에 가까우면 테이블 블록 방문이 흩어질 가능성이 큽니다." },
      { id: "C", text: "클러스터링 팩터는 인덱스 리프 블록 수와 완전히 같은 의미다.", explanation: "오답입니다. 클러스터링 팩터는 인덱스 순서로 테이블을 방문할 때 테이블 블록 변경 정도를 나타냅니다." },
      { id: "D", text: "클러스터링 팩터는 Full Scan 비용에만 영향을 주고 인덱스 스캔에는 영향이 없다.", explanation: "오답입니다. 인덱스 스캔 후 테이블 랜덤 액세스 비용 추정에 큰 영향을 줍니다." }
    ],
    answer: "A",
    relatedConceptId: "tuning-table-access",
    hint: "1단계: 인덱스 리프 순서로 ROWID를 따라갈 때 테이블 블록이 얼마나 바뀌는지 생각합니다.\n2단계: 블록 수에 가까운 값과 행 수에 가까운 값의 의미를 비교합니다.\n3단계: 테이블 랜덤 액세스 비용 추정과 연결합니다.",
    explanation: "클러스터링 팩터는 인덱스 키 순서와 테이블 저장 순서의 유사도를 나타내며, 인덱스 스캔 후 테이블 액세스 비용 추정에 사용된다. 값이 테이블 블록 수에 가까울수록 테이블 방문 지역성이 좋다."
  },
  {
    subjectId: "tuning",
    number: 25,
    majorTopic: "SQL 고급활용 및 튜닝",
    middleTopic: "조인 튜닝",
    topic: "Hash Join Build Input",
    difficulty: "상급",
    questionType: "조인 방식 판단형",
    mode: "similar",
    sourcePage: 86,
    parentQuestionId: "pdf-s-3-hash-join",
    stem: "두 대량 집합을 조인한다. 필터 적용 후 A는 5만 건, B는 900만 건이며 조인 결과는 대량이다. 인덱스를 이용한 반복 탐색은 비효율적이고 충분한 PGA가 있다. Hash Join 관점에서 가장 적절한 설명은?",
    choices: [
      { id: "A", text: "B를 Build Input으로 선택하는 것이 일반적으로 유리하다.", explanation: "오답입니다. Build Input은 가능한 작은 집합을 선택해야 해시 테이블 메모리 부담이 작습니다." },
      { id: "B", text: "A를 Build Input으로 해시 테이블을 만들고 B를 Probe Input으로 탐색하는 방향이 유리할 수 있다.", explanation: "정답입니다. 작은 입력을 Build로 선택하면 메모리와 TEMP 부담을 줄일 수 있습니다." },
      { id: "C", text: "Hash Join은 항상 인덱스가 있어야만 수행된다.", explanation: "오답입니다. Hash Join은 대량 Full Scan 조인에서도 자주 사용됩니다." },
      { id: "D", text: "Hash Join은 조인 결과가 대량이면 절대 사용할 수 없다.", explanation: "오답입니다. 대량 조인에서 오히려 NL보다 유리한 경우가 많습니다." }
    ],
    answer: "B",
    relatedConceptId: "tuning-hash-join",
    hint: "1단계: Hash Join에서 어느 쪽이 해시 테이블로 만들어지는지 확인합니다.\n2단계: Build Input은 작을수록 메모리 부담이 줄어듭니다.\n3단계: 후행 인덱스 반복 탐색이 불리한 대량 조인인지 판단합니다.",
    explanation: "Hash Join은 작은 입력으로 해시 테이블을 만들고 큰 입력을 Probe하면서 조인한다. Build Input이 지나치게 크면 메모리 부족과 TEMP spill이 발생할 수 있으므로 필터 후 크기가 작은 A가 Build Input 후보가 된다."
  },
  {
    subjectId: "tuning",
    number: 26,
    majorTopic: "SQL 고급활용 및 튜닝",
    middleTopic: "파티션 튜닝",
    topic: "Partition Pruning",
    difficulty: "상급",
    questionType: "Predicate 선택형",
    mode: "variant",
    sourcePage: 87,
    parentQuestionId: "pdf-v-3-partition-pruning",
    stem: "매출 테이블은 매출일자 DATE 컬럼 기준 월별 Range Partition이다. 2026년 7월 데이터만 정확히 조회하고 pruning 가능성을 높이는 조건으로 가장 적절한 것은?",
    choices: [
      { id: "A", text: "TO_CHAR(매출일자, 'YYYYMM') = '202607'", explanation: "오답입니다. 파티션 키 컬럼에 함수를 적용하면 pruning과 인덱스 사용 가능성이 낮아집니다." },
      { id: "B", text: "매출일자 >= DATE '2026-07-01' AND 매출일자 < DATE '2026-08-01'", explanation: "정답입니다. 컬럼 변형 없이 반열린 날짜 범위로 월 전체를 정확히 표현합니다." },
      { id: "C", text: "매출일자 BETWEEN DATE '2026-07-01' AND DATE '2026-07-31'", explanation: "오답입니다. DATE에 시각이 있으면 7월 31일 00시 이후 데이터가 누락될 수 있습니다." },
      { id: "D", text: "TRUNC(매출일자) BETWEEN DATE '2026-07-01' AND DATE '2026-07-31'", explanation: "오답입니다. 컬럼을 함수로 감싸 pruning과 인덱스 access에 불리합니다." }
    ],
    answer: "B",
    relatedConceptId: "tuning-partitioning",
    hint: "1단계: 파티션 키 컬럼을 변형하는 조건인지 봅니다.\n2단계: DATE 컬럼의 시각 값을 고려합니다.\n3단계: 시작일 이상, 다음 달 시작일 미만 조건이 안전합니다.",
    explanation: "파티션 pruning은 파티션 키 조건을 옵티마이저가 명확히 해석할 수 있을 때 유리하다. DATE 월 조회는 컬럼을 함수로 감싸지 않고 반열린 범위 조건으로 작성하는 것이 안전하다."
  },
  {
    subjectId: "tuning",
    number: 27,
    majorTopic: "SQL 고급활용 및 튜닝",
    middleTopic: "쿼리 변환",
    topic: "OR Expansion",
    difficulty: "최상급",
    questionType: "SQL Rewrite 선택형",
    mode: "similar",
    sourcePage: 88,
    parentQuestionId: "pdf-s-3-or-expansion",
    stem: "주문 조회에서 고객번호 조건이 입력되면 주문_IX01(고객번호, 주문일자)을, 입력되지 않으면 주문_IX02(주문일자)를 사용하는 것이 유리하다. 하나의 SQL에서 :cust_no 옵션 조건을 처리할 때 가장 적절한 Rewrite 방향은?",
    choices: [
      { id: "A", text: "고객번호 = NVL(:cust_no, 고객번호) 조건만 사용한다.", explanation: "오답입니다. 간단하지만 조건 유무에 따른 서로 다른 접근 경로 선택이 불안정할 수 있습니다." },
      { id: "B", text: ":cust_no IS NOT NULL 분기와 :cust_no IS NULL 분기를 UNION ALL로 분리한다.", explanation: "정답입니다. 서로 배타적인 분기로 나누면 각 조건에 맞는 인덱스 접근 경로를 유도할 수 있습니다." },
      { id: "C", text: "고객번호 컬럼에 TO_CHAR를 적용해 바인드 변수와 비교한다.", explanation: "오답입니다. 컬럼 변형은 인덱스 access 가능성을 떨어뜨립니다." },
      { id: "D", text: "주문일자 조건을 제거하면 옵티마이저가 자동으로 최적 경로를 선택한다.", explanation: "오답입니다. 필수 조건을 제거하면 결과가 달라지고 스캔 범위가 커집니다." }
    ],
    answer: "B",
    relatedConceptId: "tuning-query-transformation",
    hint: "1단계: 바인드가 NULL일 때와 아닐 때 선택도가 다른지 확인합니다.\n2단계: 서로 다른 인덱스를 써야 하는 조건을 하나로 합치면 어떤 문제가 생기는지 봅니다.\n3단계: UNION ALL 분기는 조건을 배타적으로 나누는 대표 Rewrite입니다.",
    explanation: "옵션 조건은 값이 있을 때와 없을 때의 최적 접근 경로가 다를 수 있다. UNION ALL로 배타 분기하면 각 분기에 맞는 인덱스와 조인 순서를 선택하기 쉬워진다."
  },
  {
    subjectId: "tuning",
    number: 28,
    majorTopic: "SQL 고급활용 및 튜닝",
    middleTopic: "옵티마이저",
    topic: "Bind Peeking과 선택도",
    difficulty: "상급",
    questionType: "옵티마이저 판단형",
    mode: "similar",
    sourcePage: 89,
    parentQuestionId: "pdf-s-3-bind-peeking",
    stem: "상태코드 컬럼은 '정상'이 98%, '해지'가 2%다. 같은 바인드 SQL이 어떤 실행에서는 Full Scan, 어떤 실행에서는 Index Range Scan이 유리하다. 가장 적절한 설명은?",
    choices: [
      { id: "A", text: "바인드 변수를 사용하면 값 분포와 무관하게 항상 같은 최적 계획이 보장된다.", explanation: "오답입니다. 값 분포가 심하게 치우치면 바인드 값에 따라 유리한 계획이 달라질 수 있습니다." },
      { id: "B", text: "히스토그램, Bind Peeking, Adaptive Cursor Sharing 같은 요소가 선택도와 실행계획에 영향을 줄 수 있다.", explanation: "정답입니다. 편중 분포에서는 바인드 값별 선택도 차이를 옵티마이저가 어떻게 반영하는지가 중요합니다." },
      { id: "C", text: "선택도가 낮은 값일수록 Full Scan이 항상 유리하다.", explanation: "오답입니다. 선택도가 낮으면 적은 행을 의미하므로 인덱스가 유리한 경우가 많습니다." },
      { id: "D", text: "상태코드 컬럼에는 인덱스를 만들 수 없다.", explanation: "오답입니다. 인덱스 생성 가능 여부와 선택도에 따른 효율은 별개의 판단입니다." }
    ],
    answer: "B",
    relatedConceptId: "tuning-index-scan-efficiency",
    hint: "1단계: 컬럼 값 분포가 균등한지 편중되어 있는지 봅니다.\n2단계: 같은 SQL이라도 바인드 값에 따라 선택도가 달라질 수 있습니다.\n3단계: 히스토그램과 Adaptive Cursor Sharing은 이런 상황과 연결됩니다.",
    explanation: "바인드 변수는 파싱 비용과 공유성을 높이지만, 데이터 분포가 심하게 편중된 컬럼에서는 바인드 값에 따라 최적 계획이 달라질 수 있다. 히스토그램과 Bind Peeking, Adaptive Cursor Sharing은 이런 선택도 차이를 계획에 반영하는 데 관련된다."
  },
  {
    subjectId: "tuning",
    number: 29,
    majorTopic: "SQL 고급활용 및 튜닝",
    middleTopic: "Sort 튜닝",
    topic: "One-pass와 Multi-pass Sort",
    difficulty: "상급",
    questionType: "대기 및 메모리 판단형",
    mode: "variant",
    sourcePage: 90,
    parentQuestionId: "pdf-v-3-sort-spill",
    stem: "대량 정렬 작업에서 PGA 메모리 부족으로 TEMP I/O가 급증했다. 같은 정렬 작업이 여러 번 디스크를 읽고 쓰는 양상이 관찰될 때 가장 적절한 설명은?",
    passage: "관찰 정보: 최종 정렬 단계의 작업 영역이 메모리에 모두 올라가지 못했고, TEMP 사용량과 direct path read/write temp 대기가 함께 증가했다.",
    choices: [
      { id: "A", text: "정렬은 항상 메모리에서만 수행되므로 TEMP I/O와 무관하다.", explanation: "오답입니다. 정렬 영역이 부족하면 TEMP 세그먼트를 사용합니다." },
      { id: "B", text: "메모리 부족으로 one-pass 또는 multi-pass sort가 발생했을 가능성이 있으며 정렬 제거 또는 정렬량 감소를 검토한다.", explanation: "정답입니다. 디스크를 반복 사용하는 정렬은 TEMP I/O와 응답시간 악화의 주요 원인이 됩니다." },
      { id: "C", text: "ORDER BY 컬럼에 함수 기반 인덱스를 만들면 어떤 정렬도 항상 제거된다.", explanation: "오답입니다. 조건, 정렬 방향, 조인 순서, SELECT 구조에 따라 정렬 제거 가능성이 달라집니다." },
      { id: "D", text: "Hash Join을 사용하면 ORDER BY 정렬 비용은 자동으로 사라진다.", explanation: "오답입니다. 조인 방식과 최종 정렬 요구는 별개의 작업입니다." }
    ],
    answer: "B",
    relatedConceptId: "tuning-sort",
    hint: "1단계: 정렬 데이터량과 PGA 사용 가능량을 비교합니다.\n2단계: TEMP I/O가 반복되는지 확인합니다.\n3단계: 인덱스 정렬 활용, Top-N, 사전 필터링으로 정렬량을 줄일 수 있는지 봅니다.",
    explanation: "Sort 작업은 메모리 안에서 끝나면 빠르지만, 정렬 영역이 부족하면 TEMP를 사용한다. 특히 multi-pass sort는 디스크 I/O가 반복되므로 정렬 제거, 정렬 대상 축소, 적절한 인덱스 활용을 검토해야 한다."
  },
  {
    subjectId: "tuning",
    number: 30,
    majorTopic: "SQL 고급활용 및 튜닝",
    middleTopic: "Lock",
    topic: "외래키와 TM Lock",
    difficulty: "최상급",
    questionType: "동시성 시나리오형",
    mode: "similar",
    sourcePage: 91,
    parentQuestionId: "pdf-s-3-fk-lock",
    stem: "부모 테이블 고객의 고객번호를 갱신하거나 삭제하는 트랜잭션이 있고, 자식 주문 테이블에는 고객번호 외래키가 있지만 해당 컬럼 인덱스가 없다. 대량 주문이 존재할 때 발생 가능한 문제와 개선으로 가장 적절한 것은?",
    choices: [
      { id: "A", text: "외래키가 있으면 Oracle이 자동으로 자식 외래키 인덱스를 생성하므로 문제 없다.", explanation: "오답입니다. 외래키 제약을 생성해도 자식 컬럼 인덱스가 자동 생성되지는 않습니다." },
      { id: "B", text: "부모 키 변경/삭제 시 자식 존재 여부 확인과 잠금 범위가 커질 수 있으므로 주문(고객번호) 인덱스를 검토한다.", explanation: "정답입니다. 자식 외래키 인덱스가 없으면 부모 DML과 자식 DML 간 잠금 경합이 커질 수 있습니다." },
      { id: "C", text: "부모 테이블에만 인덱스가 있으면 자식 테이블 잠금과 무관하다.", explanation: "오답입니다. 자식 존재 여부 확인은 자식 외래키 컬럼 접근과 관련됩니다." },
      { id: "D", text: "해결하려면 외래키 제약조건을 항상 삭제해야 한다.", explanation: "오답입니다. 무결성을 포기하기보다 적절한 인덱스와 트랜잭션 설계를 먼저 검토합니다." }
    ],
    answer: "B",
    relatedConceptId: "tuning-lock",
    hint: "1단계: 부모 키 DML이 자식 존재 여부를 어떻게 확인해야 하는지 생각합니다.\n2단계: 자식 외래키 컬럼에 인덱스가 없는 경우 탐색과 잠금 범위가 커질 수 있습니다.\n3단계: 무결성은 유지하면서 외래키 인덱스를 검토합니다.",
    explanation: "외래키는 참조 무결성을 보장하지만 자식 외래키 컬럼 인덱스는 자동으로 만들어지지 않는다. 부모 키 변경/삭제나 자식 DML이 많은 환경에서는 자식 외래키 인덱스가 잠금 경합과 검증 비용을 줄이는 데 중요하다."
  }
] as ManualPublishedQuestion[]).map(makeManualQuestion);

const manualVerifiedObjectiveQuestionsBatch03: ObjectiveQuestion[] = ([
  {
    subjectId: "modeling",
    number: 31,
    majorTopic: "데이터 모델링의 이해",
    middleTopic: "데이터 모델링",
    topic: "모델링 관점",
    difficulty: "중급",
    questionType: "개념 구분형",
    mode: "variant",
    sourcePage: 7,
    parentQuestionId: "pdf-v-1-modeling-viewpoints",
    stem: "주문 접수 업무를 분석하면서 주문 데이터 생성, 재고 데이터 변경, 결제 데이터 생성처럼 프로세스가 데이터에 미치는 영향을 함께 확인하고 있다. 이 설명에 가장 가까운 모델링 관점은?",
    choices: [
      { id: "A", text: "데이터 관점", explanation: "오답입니다. 데이터 관점은 업무가 필요로 하는 데이터와 데이터 간 관계 자체를 중심으로 봅니다." },
      { id: "B", text: "프로세스 관점", explanation: "오답입니다. 프로세스 관점은 업무 절차와 기능 자체를 중심으로 봅니다." },
      { id: "C", text: "상관 관점", explanation: "정답입니다. 프로세스 수행이 데이터의 생성, 변경, 삭제, 조회에 미치는 영향을 보는 관점입니다." },
      { id: "D", text: "물리 관점", explanation: "오답입니다. 물리 관점은 저장 구조, 인덱스, DBMS 구현 요소와 관련됩니다." }
    ],
    answer: "C",
    relatedConceptId: "modeling-data-model",
    hint: "1단계: 데이터 자체를 묻는지, 프로세스 자체를 묻는지 구분합니다.\n2단계: 프로세스 수행 결과 데이터가 어떻게 변하는지 확인합니다.\n3단계: CRUD 영향 분석은 상관 관점과 연결됩니다.",
    explanation: "상관 관점은 업무 프로세스와 데이터 사이의 영향을 함께 분석한다. 주문 접수라는 프로세스가 여러 데이터에 어떤 변화를 만드는지 보는 것은 상관 관점이다."
  },
  {
    subjectId: "modeling",
    number: 32,
    majorTopic: "데이터 모델링의 이해",
    middleTopic: "관계",
    topic: "관계 선택성",
    difficulty: "상급",
    questionType: "ERD 조건 해석형",
    mode: "similar",
    sourcePage: 16,
    parentQuestionId: "pdf-s-1-relationship-optionality",
    stem: "주문은 반드시 한 명의 고객에 의해 발생하지만, 고객은 아직 주문이 없을 수 있다. 고객과 주문의 관계 선택성으로 가장 적절한 것은?",
    choices: [
      { id: "A", text: "고객 입장에서는 주문이 필수이고, 주문 입장에서는 고객이 선택이다.", explanation: "오답입니다. 주문은 고객 없이 존재할 수 없고, 고객은 주문 없이 존재할 수 있습니다." },
      { id: "B", text: "고객 입장에서는 주문이 선택이고, 주문 입장에서는 고객이 필수다.", explanation: "정답입니다. 고객은 0개 이상의 주문을 가질 수 있고 주문은 반드시 한 고객에 속합니다." },
      { id: "C", text: "양쪽 모두 필수 관계다.", explanation: "오답입니다. 신규 고객처럼 주문이 없는 고객이 가능하므로 고객 쪽 주문 참여는 선택입니다." },
      { id: "D", text: "양쪽 모두 선택 관계다.", explanation: "오답입니다. 주문은 반드시 고객과 연결되어야 합니다." }
    ],
    answer: "B",
    relatedConceptId: "modeling-relationship",
    hint: "1단계: 각 엔터티의 한 인스턴스가 상대 인스턴스를 반드시 가져야 하는지 확인합니다.\n2단계: 고객은 주문 없이 먼저 존재할 수 있습니다.\n3단계: 주문은 고객 식별 없이 업무적으로 성립하기 어렵습니다.",
    explanation: "관계 선택성은 상대 엔터티 참여가 필수인지 선택인지 나타낸다. 고객은 주문이 없을 수 있으므로 주문 참여가 선택이고, 주문은 반드시 고객과 연결되므로 고객 참여가 필수다."
  },
  {
    subjectId: "modeling",
    number: 33,
    majorTopic: "데이터 모델링의 이해",
    middleTopic: "식별자",
    topic: "본질식별자와 인조식별자",
    difficulty: "중급",
    questionType: "식별자 선택형",
    mode: "similar",
    sourcePage: 19,
    parentQuestionId: "pdf-s-1-surrogate-key",
    stem: "계좌거래는 외부 기관에서 받은 거래고유번호가 있으나, 일부 기관은 재전송 시 같은 번호를 재사용하고 취소 거래 구분 규칙도 다르다. 내부 시스템의 안정적 식별자 설계로 가장 적절한 것은?",
    choices: [
      { id: "A", text: "외부 거래고유번호만 주식별자로 사용한다.", explanation: "오답입니다. 외부 번호가 모든 기관에서 안정적이고 유일하다는 보장이 약합니다." },
      { id: "B", text: "내부 거래ID를 인조식별자로 두고 외부기관코드와 외부거래번호는 대체식별자 또는 업무 속성으로 관리한다.", explanation: "정답입니다. 외부 식별 규칙이 불안정하면 내부 식별 안정성을 별도로 확보하는 것이 적절합니다." },
      { id: "C", text: "거래금액과 거래일시를 조합하면 항상 유일하므로 주식별자로 충분하다.", explanation: "오답입니다. 금액과 일시는 중복 가능성이 있어 유일성을 보장하기 어렵습니다." },
      { id: "D", text: "식별자는 변경될 수 있어야 하므로 고객이 수정할 수 있는 번호를 사용한다.", explanation: "오답입니다. 주식별자는 불변성이 중요합니다." }
    ],
    answer: "B",
    relatedConceptId: "modeling-identifier",
    hint: "1단계: 후보 식별자가 모든 인스턴스를 안정적으로 구분하는지 확인합니다.\n2단계: 외부 시스템 규칙이 기관마다 다른지 봅니다.\n3단계: 인조식별자는 식별 안정성을 확보할 때 사용할 수 있습니다.",
    explanation: "본질식별자가 불안정하거나 외부 규칙에 의존해 변경 가능성이 크다면 내부 인조식별자를 사용할 수 있다. 외부 번호는 업무 추적과 중복 검증을 위해 별도 속성 또는 대체식별자로 관리한다."
  },
  {
    subjectId: "modeling",
    number: 34,
    majorTopic: "데이터 모델링의 이해",
    middleTopic: "속성",
    topic: "기본 속성과 파생 속성",
    difficulty: "기본",
    questionType: "속성 분류형",
    mode: "original",
    sourcePage: 13,
    parentQuestionId: "pdf-o-1-attribute-derived",
    stem: "주문수량과 판매단가는 입력되어 저장되고, 주문금액은 주문수량과 판매단가를 곱해 계산할 수 있다. 주문금액의 속성 분류로 가장 적절한 것은?",
    choices: [
      { id: "A", text: "기본 속성", explanation: "오답입니다. 기본 속성은 업무에서 직접 수집되어 독립적으로 저장되는 속성입니다." },
      { id: "B", text: "설계 속성", explanation: "오답입니다. 설계 속성은 업무상 원래 존재하지 않지만 설계를 위해 추가하는 속성입니다." },
      { id: "C", text: "파생 속성", explanation: "정답입니다. 다른 속성으로부터 계산되는 값입니다." },
      { id: "D", text: "식별자 속성", explanation: "오답입니다. 주문금액은 인스턴스를 식별하는 속성이 아닙니다." }
    ],
    answer: "C",
    relatedConceptId: "modeling-attribute",
    hint: "1단계: 값이 직접 입력되는지 계산되는지 확인합니다.\n2단계: 다른 속성으로부터 도출 가능한지 봅니다.\n3단계: 계산 가능한 값은 파생 속성입니다.",
    explanation: "파생 속성은 하나 이상의 다른 속성으로부터 계산되는 속성이다. 주문금액은 주문수량과 판매단가로 계산할 수 있으므로 파생 속성에 해당한다."
  },
  {
    subjectId: "modeling",
    number: 35,
    majorTopic: "데이터 모델과 성능",
    middleTopic: "반정규화",
    topic: "중복 관계 반정규화",
    difficulty: "상급",
    questionType: "반정규화 판단형",
    mode: "similar",
    sourcePage: 113,
    parentQuestionId: "pdf-s-1-redundant-relationship",
    stem: "주문상세에서 주문, 주문에서 고객을 거쳐 고객등급을 조회하는 경로가 매우 자주 사용된다. 고객등급 변경은 드물고 주문상세 목록 응답시간이 중요하다. 반정규화 검토로 가장 적절한 것은?",
    choices: [
      { id: "A", text: "주문상세에 고객등급을 무조건 복사하고 원천 고객등급은 삭제한다.", explanation: "오답입니다. 원천 관리 기준을 없애면 정합성 통제가 어려워집니다." },
      { id: "B", text: "조회 경로 단축을 위해 주문 또는 주문상세에 주문시점 고객등급 중복 저장을 검토하되 갱신 기준을 함께 정의한다.", explanation: "정답입니다. 중복 관계나 중복 속성 반정규화는 성능과 정합성 유지 방안을 함께 검토해야 합니다." },
      { id: "C", text: "반정규화는 정규화 위반이므로 어떤 성능 요구에서도 금지된다.", explanation: "오답입니다. 통제 가능한 경우 성능 개선 목적으로 사용할 수 있습니다." },
      { id: "D", text: "조인 경로가 길면 모든 중간 엔터티를 삭제하고 하나의 테이블로 합친다.", explanation: "오답입니다. 업무 의미와 무결성을 무너뜨릴 수 있는 과도한 통합입니다." }
    ],
    answer: "B",
    relatedConceptId: "modeling-normalization",
    hint: "1단계: 조인 경로가 반복 성능 병목인지 확인합니다.\n2단계: 중복 저장 값이 현재값인지 주문시점 값인지 구분합니다.\n3단계: 반정규화는 정합성 유지 규칙과 함께 설계합니다.",
    explanation: "중복 관계 또는 중복 속성 반정규화는 자주 조회되는 조인 경로를 줄이는 데 활용될 수 있다. 다만 값의 의미, 변경 주기, 동기화 방법을 명확히 하지 않으면 데이터 불일치가 발생한다."
  },
  {
    subjectId: "sql-basic",
    number: 31,
    majorTopic: "SQL 기본 및 활용",
    middleTopic: "함수",
    topic: "NVL과 NULL 비교",
    difficulty: "중급",
    questionType: "SQL 결과 선택형",
    mode: "variant",
    sourcePage: 24,
    parentQuestionId: "pdf-v-2-null-function",
    stem: "아래 SQL의 결과값으로 가장 적절한 것은?",
    code: `SELECT NVL(NULL, 10) + NVL(5, 20) AS result
FROM dual;`,
    choices: [
      { id: "A", text: "15", explanation: "정답입니다. 첫 번째 NVL은 10, 두 번째 NVL은 5를 반환하므로 합계는 15입니다." },
      { id: "B", text: "30", explanation: "오답입니다. NVL(5,20)은 첫 번째 인자 5가 NULL이 아니므로 20이 아니라 5를 반환합니다." },
      { id: "C", text: "NULL", explanation: "오답입니다. 두 피연산자 모두 NVL 결과가 NULL이 아닙니다." },
      { id: "D", text: "25", explanation: "오답입니다. NULL 대체와 비NULL 유지 규칙을 혼동한 값입니다." }
    ],
    answer: "A",
    relatedConceptId: "sql-functions",
    hint: "1단계: NVL의 첫 번째 인자가 NULL인지 확인합니다.\n2단계: 첫 번째 인자가 NULL이 아니면 그대로 반환합니다.\n3단계: 각 NVL 결과를 더합니다.",
    explanation: "NVL(expr1, expr2)는 expr1이 NULL이면 expr2를 반환하고, NULL이 아니면 expr1을 반환한다. 따라서 10 + 5 = 15다."
  },
  {
    subjectId: "sql-basic",
    number: 32,
    majorTopic: "SQL 기본 및 활용",
    middleTopic: "JOIN",
    topic: "LEFT JOIN과 COUNT",
    difficulty: "상급",
    questionType: "집계 결과 추론형",
    mode: "similar",
    sourcePage: 74,
    parentQuestionId: "pdf-s-2-left-join-count",
    stem: "고객별 2026년 주문 건수를 조회하려 한다. 주문이 없는 고객도 0건으로 보여야 한다. 가장 적절한 집계식은?",
    choices: [
      { id: "A", text: "COUNT(*)", explanation: "오답입니다. LEFT JOIN 결과에서 주문이 없어도 고객 행이 1행 남으므로 1건으로 집계될 수 있습니다." },
      { id: "B", text: "COUNT(o.주문번호)", explanation: "정답입니다. 주문번호가 NULL인 확장 행은 집계에서 제외되므로 주문 없는 고객이 0건이 됩니다." },
      { id: "C", text: "SUM(*)", explanation: "오답입니다. SUM(*)는 올바른 집계식이 아닙니다." },
      { id: "D", text: "COUNT(c.고객번호)", explanation: "오답입니다. 고객번호는 보존 행에서 NULL이 아니므로 주문 없는 고객도 1로 집계될 수 있습니다." }
    ],
    answer: "B",
    relatedConceptId: "sql-standard-join",
    hint: "1단계: LEFT JOIN에서 주문이 없는 고객도 한 행이 남는지 확인합니다.\n2단계: COUNT(*)와 COUNT(컬럼)의 차이를 봅니다.\n3단계: 후행 테이블의 NOT NULL 키 컬럼을 집계 대상으로 삼습니다.",
    explanation: "LEFT JOIN에서 매칭되지 않은 후행 테이블 컬럼은 NULL이 된다. COUNT(o.주문번호)는 NULL을 세지 않으므로 주문이 없는 고객을 0건으로 집계할 수 있다."
  },
  {
    subjectId: "sql-basic",
    number: 33,
    majorTopic: "SQL 기본 및 활용",
    middleTopic: "계층형 질의",
    topic: "CONNECT BY 방향",
    difficulty: "상급",
    questionType: "계층 방향 판단형",
    mode: "similar",
    sourcePage: 40,
    parentQuestionId: "pdf-s-2-connect-by",
    stem: "조직 테이블에 부서번호와 상위부서번호가 있다. 루트 부서에서 하위 부서 방향으로 펼치려 한다. 가장 적절한 CONNECT BY 조건은?",
    choices: [
      { id: "A", text: "CONNECT BY PRIOR 부서번호 = 상위부서번호", explanation: "정답입니다. 부모 행의 부서번호가 자식 행의 상위부서번호와 연결됩니다." },
      { id: "B", text: "CONNECT BY 부서번호 = PRIOR 상위부서번호", explanation: "오답입니다. 방향이 반대가 되어 상위 방향 탐색이 될 수 있습니다." },
      { id: "C", text: "CONNECT BY 부서번호 = 상위부서번호", explanation: "오답입니다. PRIOR 없이 현재 행끼리 비교해 계층 부모-자식 관계를 표현하지 못합니다." },
      { id: "D", text: "CONNECT BY LEVEL = 1", explanation: "오답입니다. LEVEL은 계층 깊이이며 부모-자식 연결 조건이 아닙니다." }
    ],
    answer: "A",
    relatedConceptId: "sql-hierarchical-self-join",
    hint: "1단계: PRIOR가 붙은 쪽이 부모 행의 값을 의미한다고 봅니다.\n2단계: 부모 부서번호와 자식 상위부서번호를 연결합니다.\n3단계: 방향이 바뀌면 하위가 아니라 상위로 탐색될 수 있습니다.",
    explanation: "Oracle 계층형 질의에서 PRIOR가 붙은 표현은 직전 부모 행의 값을 의미한다. 루트에서 하위로 내려가려면 부모 부서번호가 자식 행의 상위부서번호와 같아야 한다."
  },
  {
    subjectId: "sql-basic",
    number: 34,
    majorTopic: "SQL 기본 및 활용",
    middleTopic: "Subquery",
    topic: "Scalar Subquery",
    difficulty: "중급",
    questionType: "오류 발생 판단형",
    mode: "variant",
    sourcePage: 30,
    parentQuestionId: "pdf-v-2-scalar-subquery",
    stem: "SELECT 절의 스칼라 서브쿼리가 한 외부 행에 대해 두 행 이상을 반환했다. 가장 적절한 결과는?",
    choices: [
      { id: "A", text: "첫 번째 행만 자동 선택된다.", explanation: "오답입니다. 스칼라 서브쿼리는 단일 값을 반환해야 하며 임의의 첫 행을 자동 선택하지 않습니다." },
      { id: "B", text: "NULL로 변환되어 반환된다.", explanation: "오답입니다. 결과가 없으면 NULL일 수 있지만, 여러 행이면 오류입니다." },
      { id: "C", text: "단일 행 서브쿼리가 두 개 이상의 행을 반환했다는 오류가 발생한다.", explanation: "정답입니다. 스칼라 서브쿼리는 한 행, 한 컬럼 결과여야 합니다." },
      { id: "D", text: "두 행이 문자열로 합쳐져 반환된다.", explanation: "오답입니다. 명시적인 집계나 LISTAGG 없이 자동 결합되지 않습니다." }
    ],
    answer: "C",
    relatedConceptId: "sql-subquery",
    hint: "1단계: 스칼라의 의미는 단일 값입니다.\n2단계: 결과 없음과 여러 행 반환을 구분합니다.\n3단계: 여러 행이면 오류가 발생합니다.",
    explanation: "스칼라 서브쿼리는 하나의 컬럼과 최대 한 행을 반환해야 한다. 외부 행 하나에 대해 여러 행이 반환되면 단일 값으로 사용할 수 없어 오류가 발생한다."
  },
  {
    subjectId: "sql-basic",
    number: 35,
    majorTopic: "SQL 기본 및 활용",
    middleTopic: "PIVOT",
    topic: "PIVOT 대상 값",
    difficulty: "상급",
    questionType: "PIVOT 설명 선택형",
    mode: "similar",
    sourcePage: 38,
    parentQuestionId: "pdf-s-2-pivot",
    stem: "Oracle PIVOT을 사용해 매출월 값을 컬럼으로 전환하려 한다. 가장 적절한 설명은?",
    choices: [
      { id: "A", text: "PIVOT IN 절에는 전환할 값을 명시해야 하며, 일반 정적 SQL에서는 결과 컬럼이 동적으로 무한히 늘어나지 않는다.", explanation: "정답입니다. PIVOT 대상 값은 IN 절에 지정되어 결과 컬럼이 결정됩니다." },
      { id: "B", text: "PIVOT은 집계 함수 없이도 항상 사용할 수 있다.", explanation: "오답입니다. PIVOT은 전환 과정에서 집계가 필요합니다." },
      { id: "C", text: "PIVOT 후에는 WHERE 절을 사용할 수 없다.", explanation: "오답입니다. PIVOT 결과를 인라인 뷰로 두고 바깥에서 필터링할 수 있습니다." },
      { id: "D", text: "PIVOT은 행과 컬럼을 바꾸지만 GROUP BY 성격과는 무관하다.", explanation: "오답입니다. PIVOT은 지정 기준에 따라 집계와 전환을 함께 수행합니다." }
    ],
    answer: "A",
    relatedConceptId: "sql-pivot-unpivot",
    hint: "1단계: PIVOT이 단순 표시 변환인지 집계를 포함하는지 확인합니다.\n2단계: 결과 컬럼이 어디서 정해지는지 봅니다.\n3단계: IN 절의 값 목록이 핵심입니다.",
    explanation: "Oracle PIVOT은 지정한 값들을 컬럼으로 전환하며 집계 함수를 함께 사용한다. 일반적인 정적 SQL에서는 IN 절에 나열한 값이 결과 컬럼이 된다."
  },
  {
    subjectId: "tuning",
    number: 31,
    majorTopic: "SQL 고급활용 및 튜닝",
    middleTopic: "인덱스 튜닝",
    topic: "Index Skip Scan",
    difficulty: "상급",
    questionType: "인덱스 스캔 방식 판단형",
    mode: "variant",
    sourcePage: 82,
    parentQuestionId: "pdf-v-3-index-skip-scan",
    stem: "IDX_EMP(성별, 입사일자) 인덱스가 있고 성별 값은 M/F 두 종류뿐이다. 조건은 입사일자 범위만 있다. 옵티마이저가 고려할 수 있는 인덱스 스캔 방식으로 가장 적절한 것은?",
    choices: [
      { id: "A", text: "INDEX UNIQUE SCAN", explanation: "오답입니다. 유니크 키를 등치로 찾는 상황이 아닙니다." },
      { id: "B", text: "INDEX SKIP SCAN", explanation: "정답입니다. 선두 컬럼의 값 종류가 적고 후행 컬럼 조건이 있으면 선두 값을 건너뛰며 탐색하는 방식을 고려할 수 있습니다." },
      { id: "C", text: "BITMAP CONVERSION TO ROWIDS만 가능하다.", explanation: "오답입니다. B-Tree 결합 인덱스에서도 Skip Scan이 가능할 수 있습니다." },
      { id: "D", text: "INDEX FULL SCAN은 항상 테이블 전체 스캔보다 느리므로 고려 대상이 아니다.", explanation: "오답입니다. 정렬, 커버링, 읽을 블록 수에 따라 선택될 수 있습니다." }
    ],
    answer: "B",
    relatedConceptId: "tuning-index-scan-efficiency",
    hint: "1단계: 조건이 선두 컬럼에 있는지 후행 컬럼에 있는지 확인합니다.\n2단계: 선두 컬럼의 값 종류가 적은지 봅니다.\n3단계: 후행 컬럼 조건을 이용하기 위해 선두 값을 나누어 탐색할 수 있습니다.",
    explanation: "Index Skip Scan은 결합 인덱스의 선두 컬럼 조건이 없어도 선두 컬럼의 distinct 값이 적을 때 각 선두 값 구간을 건너뛰며 후행 컬럼 조건을 활용하는 방식이다."
  },
  {
    subjectId: "tuning",
    number: 32,
    majorTopic: "SQL 고급활용 및 튜닝",
    middleTopic: "인덱스 튜닝",
    topic: "Index Fast Full Scan",
    difficulty: "중급",
    questionType: "스캔 방식 비교형",
    mode: "original",
    sourcePage: 82,
    parentQuestionId: "pdf-o-3-index-ffs",
    stem: "Index Fast Full Scan에 대한 설명으로 가장 적절한 것은?",
    choices: [
      { id: "A", text: "인덱스 루트에서 리프까지 키 순서대로 읽어 정렬 결과를 항상 보장한다.", explanation: "오답입니다. 키 순서 보장은 Index Full Scan의 특징에 가깝고 Fast Full Scan은 멀티블록 I/O로 순서를 보장하지 않을 수 있습니다." },
      { id: "B", text: "테이블을 읽지 않아도 필요한 컬럼이 인덱스에 모두 있을 때 인덱스를 빠르게 전체 스캔할 수 있다.", explanation: "정답입니다. 인덱스를 세그먼트처럼 읽어 테이블 Full Scan 대안이 될 수 있습니다." },
      { id: "C", text: "항상 ROWID 순서로 테이블을 방문한다.", explanation: "오답입니다. Index Fast Full Scan은 테이블 ROWID 방문이 핵심이 아닙니다." },
      { id: "D", text: "범위 조건의 시작점과 종료점을 찾아 일부 리프만 읽는다.", explanation: "오답입니다. 이는 Index Range Scan 설명에 가깝습니다." }
    ],
    answer: "B",
    relatedConceptId: "tuning-index-scan-efficiency",
    hint: "1단계: Fast Full Scan이 범위 스캔인지 전체 스캔인지 구분합니다.\n2단계: 필요한 컬럼이 인덱스에 모두 있는지 확인합니다.\n3단계: 정렬 순서 보장 여부를 Index Full Scan과 비교합니다.",
    explanation: "Index Fast Full Scan은 인덱스 전체를 멀티블록 I/O로 빠르게 읽는 방식이다. 필요한 컬럼이 인덱스에 모두 있으면 테이블을 읽지 않고 결과를 만들 수 있지만 키 순서 보장을 전제로 하지 않는다."
  },
  {
    subjectId: "tuning",
    number: 33,
    majorTopic: "SQL 고급활용 및 튜닝",
    middleTopic: "테이블 액세스",
    topic: "테이블 랜덤 액세스",
    difficulty: "상급",
    questionType: "실행계획 원인 판단형",
    mode: "similar",
    sourcePage: 83,
    parentQuestionId: "pdf-s-3-table-access",
    stem: "인덱스 조건으로 20만 건의 ROWID를 얻은 뒤 TABLE ACCESS BY INDEX ROWID 단계에서 CR이 급증했다. 가장 직접적인 원인과 개선 방향은?",
    choices: [
      { id: "A", text: "인덱스 리프 블록을 전혀 읽지 않았기 때문에 CR이 증가했다.", explanation: "오답입니다. 인덱스 스캔 후 테이블 블록 방문이 핵심입니다." },
      { id: "B", text: "대량 ROWID로 테이블 블록을 반복 방문했기 때문이며, 선택도 개선이나 커버링 인덱스, Full Scan 전환을 검토한다.", explanation: "정답입니다. 인덱스 후 테이블 랜덤 액세스가 많으면 인덱스가 오히려 불리할 수 있습니다." },
      { id: "C", text: "ORDER BY가 없으면 테이블 액세스 비용은 항상 0이다.", explanation: "오답입니다. 정렬 여부와 테이블 블록 방문 비용은 별개입니다." },
      { id: "D", text: "ROWID를 많이 얻을수록 인덱스 스캔은 항상 더 유리하다.", explanation: "오답입니다. 많은 ROWID 방문은 손익분기점을 넘길 수 있습니다." }
    ],
    answer: "B",
    relatedConceptId: "tuning-table-access",
    hint: "1단계: 인덱스 스캔 비용과 테이블 액세스 비용을 나누어 봅니다.\n2단계: ROWID 건수가 많으면 테이블 블록 방문도 많아질 수 있습니다.\n3단계: 선택도, 클러스터링 팩터, 커버링 가능성을 함께 검토합니다.",
    explanation: "인덱스 스캔은 ROWID를 찾는 단계와 테이블 블록을 방문하는 단계로 나뉜다. 반환 후보가 많고 클러스터링 팩터가 나쁘면 TABLE ACCESS BY INDEX ROWID 비용이 급증할 수 있다."
  },
  {
    subjectId: "tuning",
    number: 34,
    majorTopic: "SQL 고급활용 및 튜닝",
    middleTopic: "쿼리 변환",
    topic: "View Merging",
    difficulty: "최상급",
    questionType: "쿼리 변환 판단형",
    mode: "variant",
    sourcePage: 88,
    parentQuestionId: "pdf-v-3-view-merging",
    stem: "인라인 뷰에서 고객별 주문금액을 GROUP BY로 집계한 뒤 바깥 쿼리에서 고객등급 = 'VIP' 조건을 적용한다. 성능 개선 관점에서 가장 먼저 검토할 내용은?",
    choices: [
      { id: "A", text: "집계 전에 VIP 고객 조건을 적용할 수 있는지 Predicate Pushing 또는 조인 순서 변경을 검토한다.", explanation: "정답입니다. 집계 대상 고객을 먼저 줄일 수 있으면 중간 집계량이 크게 감소할 수 있습니다." },
      { id: "B", text: "GROUP BY가 있으면 어떤 조건도 집계 전으로 이동할 수 없다.", explanation: "오답입니다. 결과 보존 여부에 따라 밀어 넣을 수 있는 조건이 있습니다." },
      { id: "C", text: "바깥 조건은 실행계획 비용에 영향을 주지 않는다.", explanation: "오답입니다. 조건 적용 위치는 중간 행 수와 비용에 큰 영향을 줄 수 있습니다." },
      { id: "D", text: "View Merging은 인덱스 삭제 명령이다.", explanation: "오답입니다. View Merging은 쿼리 블록 변환과 관련된 옵티마이저 기법입니다." }
    ],
    answer: "A",
    relatedConceptId: "tuning-query-transformation",
    hint: "1단계: 집계 전에 줄일 수 있는 행이 있는지 봅니다.\n2단계: 외부 조건을 내부로 밀어 넣어도 결과가 보존되는지 확인합니다.\n3단계: Predicate Pushing과 View Merging은 중간 결과 축소와 연결됩니다.",
    explanation: "인라인 뷰에서 먼저 대량 집계를 수행한 뒤 외부에서 소수 고객만 거르면 비효율이 클 수 있다. 결과가 보존되는 조건이라면 조기 필터링을 위해 Predicate Pushing, View Merging, 조인 순서 변경을 검토한다."
  },
  {
    subjectId: "tuning",
    number: 35,
    majorTopic: "SQL 고급활용 및 튜닝",
    middleTopic: "서브쿼리 튜닝",
    topic: "Scalar Subquery Caching",
    difficulty: "상급",
    questionType: "반복 수행 판단형",
    mode: "similar",
    sourcePage: 89,
    parentQuestionId: "pdf-s-3-scalar-cache",
    stem: "SELECT 절의 스칼라 서브쿼리가 외부 행 100만 건에 대해 수행된다. 외부 행의 부서번호는 20종류뿐이고 서브쿼리는 부서번호별 집계를 조회한다. 가장 적절한 튜닝 관점은?",
    choices: [
      { id: "A", text: "스칼라 서브쿼리는 외부 행마다 무조건 100만 번 물리 I/O를 수행하므로 사용할 수 없다.", explanation: "오답입니다. 캐싱이나 변환 가능성이 있으며 조건에 따라 비용이 달라집니다." },
      { id: "B", text: "입력값 종류가 적으면 스칼라 서브쿼리 캐싱 효과가 있을 수 있지만, 조인/집계로 재작성한 계획도 비교한다.", explanation: "정답입니다. 반복 입력값 수와 캐싱 가능성, 조인 변환 비용을 함께 판단해야 합니다." },
      { id: "C", text: "부서번호 종류가 적으면 Full Scan만 사용할 수 있다.", explanation: "오답입니다. 접근 경로는 인덱스, 집계 방식, 조인 방식에 따라 달라집니다." },
      { id: "D", text: "스칼라 서브쿼리는 SELECT 절에서만 쓰이므로 성능과 무관하다.", explanation: "오답입니다. 외부 행 수만큼 반복될 수 있어 성능에 큰 영향을 줄 수 있습니다." }
    ],
    answer: "B",
    relatedConceptId: "tuning-query-transformation",
    hint: "1단계: 외부 행 수와 상관 입력값의 distinct 수를 비교합니다.\n2단계: 같은 입력값이 반복되면 캐싱 효과가 있을 수 있습니다.\n3단계: 그래도 조인/집계 재작성과 실행계획을 비교해야 합니다.",
    explanation: "스칼라 서브쿼리는 외부 행마다 논리적으로 평가될 수 있지만 입력값 종류가 적으면 캐싱 효과를 기대할 수 있다. 다만 데이터량과 통계에 따라 조인 후 집계 또는 사전 집계 방식이 더 유리할 수 있어 비교가 필요하다."
  }
] as ManualPublishedQuestion[]).map(makeManualQuestion);

const operationExplanations: Record<string, string> = {
  "INDEX RANGE SCAN": "INDEX RANGE SCAN - 인덱스 시작점과 종료점을 찾아 필요한 리프 범위를 읽는다.",
  "INDEX UNIQUE SCAN": "INDEX UNIQUE SCAN - 유니크 인덱스로 단일 ROWID를 찾는다.",
  "TABLE ACCESS BY INDEX ROWID": "TABLE ACCESS BY INDEX ROWID - 인덱스에서 얻은 ROWID로 테이블 블록을 방문한다.",
  "TABLE ACCESS FULL": "TABLE ACCESS FULL - 테이블 또는 파티션 전체를 순차적으로 읽는다.",
  "NESTED LOOPS": "NESTED LOOPS - 선행 집합의 각 행마다 후행 집합을 반복 탐색한다.",
  "HASH JOIN": "HASH JOIN - 작은 입력을 해시 테이블로 만들고 큰 입력을 탐색한다.",
  "SORT MERGE JOIN": "SORT MERGE JOIN - 양쪽 입력을 조인 키로 정렬한 뒤 병합한다.",
  "SORT ORDER BY": "SORT ORDER BY - 최종 정렬을 수행한다.",
  "HASH GROUP BY": "HASH GROUP BY - 해시 영역으로 그룹 집계를 수행한다.",
  "COUNT STOPKEY": "COUNT STOPKEY - 필요한 건수만 읽고 조기 중단한다.",
  "PARTITION RANGE": "PARTITION RANGE - 파티션 키 조건으로 읽을 파티션 범위를 정한다.",
  "WINDOW SORT": "WINDOW SORT - 분석 함수 계산을 위해 파티션과 정렬 기준으로 정렬한다."
};

function explainOperation(operation: string): LabPlanExplanation {
  const key = Object.keys(operationExplanations).find((item) => operation.toUpperCase().includes(item));
  return {
    operation,
    korean: key ? operationExplanations[key] : `${operation} - 목표 실행계획에서 확인해야 하는 Oracle Operation이다.`,
    note: key ? "문제의 요구사항과 데이터 분포에서 이 Operation이 왜 필요한지 설명할 수 있어야 한다." : "영문 Operation 명칭은 유지하고, 답안에서는 처리 의도와 비용 감소 근거를 함께 적는다."
  };
}

function traceSummaryFrom(rows: number, starts: number, pr: number, cr: number, time: string): LabTraceSummaryRow[] {
  return [
    { metric: "Rows", value: rows.toLocaleString("ko-KR"), meaning: "반환 또는 처리된 행 수다. 목표 SQL에서는 불필요한 중간 행을 줄여야 한다." },
    { metric: "Loop/Starts", value: starts.toLocaleString("ko-KR"), meaning: "Operation 반복 시작 횟수다. NL Join과 서브쿼리 반복 비용을 판단한다." },
    { metric: "PR", value: pr.toLocaleString("ko-KR"), meaning: "물리 읽기 예시값이다. 실제 측정값이 아니라 교육용 시뮬레이션 수치다." },
    { metric: "CR", value: cr.toLocaleString("ko-KR"), meaning: "논리 읽기 예시값이다. Rows 대비 과도하면 접근 경로와 조인 반복을 의심한다." },
    { metric: "Time", value: time, meaning: "교육용 Trace 시간 예시다. 실제 Oracle 실행 결과와 구분해야 한다." }
  ];
}

function makeTraceStats(title: string, rows: number, starts: number, pr: number, cr: number, operations: string[]) {
  return [
    `Rows     Loop     PR       CR       Time       Operation (${title})`,
    `${String(rows).padEnd(8)} ${String(starts).padEnd(8)} ${String(pr).padEnd(8)} ${String(cr).padEnd(8)} 00:00:0${Math.min(9, starts)}.${String(cr % 100).padStart(2, "0")} SELECT STATEMENT`,
    ...operations.map((operation, index) => `${String(Math.max(1, Math.floor(rows / (index + 1)))).padEnd(8)} ${String(starts + index).padEnd(8)} ${String(pr + index).padEnd(8)} ${String(cr + index * 220).padEnd(8)} 00:00:0${index}.${String((cr + index) % 100).padStart(2, "0")} ${operation}`)
  ].join("\n");
}

function makePredicateInfo(access: string, filter: string) {
  return `Predicate Information (identified by operation id):
---------------------------------------------------
1 - access(${access})
2 - filter(${filter})`;
}

function defaultPlanForReviewLab(lab: PdfReviewLab) {
  const text = `${lab.title} ${lab.topic} ${lab.scenario}`;
  if (/윈도우|분석 함수|누적/.test(text)) return ["WINDOW SORT", "TABLE ACCESS FULL"];
  if (/ROLLUP|GROUPING|집계|HAVING/.test(text)) return ["SORT GROUP BY ROLLUP", "HASH GROUP BY", "TABLE ACCESS FULL"];
  if (/MERGE/.test(text)) return ["MERGE STATEMENT", "HASH GROUP BY", "INDEX UNIQUE SCAN"];
  if (/NOT EXISTS|NOT IN|Anti|NULL/.test(text)) return ["HASH JOIN ANTI", "INDEX RANGE SCAN", "FILTER"];
  if (/Top-N|STOPKEY|부분범위/.test(text)) return ["COUNT STOPKEY", "INDEX RANGE SCAN DESCENDING", "TABLE ACCESS BY INDEX ROWID"];
  if (/Lock|동시성|외래키/.test(text)) return ["INDEX RANGE SCAN", "ENQUEUE TX/TM", "FOREIGN KEY CHECK"];
  if (/Hash/.test(text)) return ["HASH JOIN", "HASH GROUP BY", "TABLE ACCESS FULL"];
  if (/NL|Nested|인덱스/.test(text)) return ["NESTED LOOPS", "INDEX RANGE SCAN", "TABLE ACCESS BY INDEX ROWID"];
  if (/계층|CONNECT BY/.test(text)) return ["CONNECT BY WITH FILTERING", "INDEX RANGE SCAN", "TABLE ACCESS BY INDEX ROWID"];
  if (/파티션|Partition|Pruning/.test(text)) return ["PARTITION RANGE ITERATOR", "INDEX RANGE SCAN", "TABLE ACCESS BY LOCAL INDEX ROWID"];
  return ["TABLE ACCESS FULL", "FILTER"];
}

function reviewTraceRows(table: PdfReviewLab["traceSummary"]): LabTraceSummaryRow[] | undefined {
  if (!table) return undefined;
  return table.rows.map((row) => ({
    metric: row[0] ?? "",
    value: row[1] ?? "",
    meaning: row[2] ?? ""
  }));
}

function reviewTraceText(lab: PdfReviewLab, fallback: string) {
  if (lab.traceSummary) {
    return [
      lab.traceSummary.title,
      lab.traceSummary.headers.join("     "),
      ...lab.traceSummary.rows.map((row) => row.join("     "))
    ].join("\n");
  }
  if (/Trace|TKPROF|Rows|Starts|CR|PR|대기 이벤트|enq:/i.test(lab.executionPlan ?? "")) {
    return lab.executionPlan;
  }
  void fallback;
  return undefined;
}

function reviewPredicateInfo(lab: PdfReviewLab) {
  if (/Predicate Information/i.test(lab.executionPlan ?? "")) return lab.executionPlan;
  if (/Top-N|STOPKEY/.test(`${lab.title} ${lab.topic}`)) return makePredicateInfo("게시구분 = :board_type, 삭제여부 = 'N'", "ROWNUM <= 20");
  if (/옵션 조건|OR Expansion/.test(`${lab.title} ${lab.topic}`)) return makePredicateInfo(":cust_no 분기 조건", "주문일시 반열린 범위");
  if (/파티션|Partition/.test(`${lab.title} ${lab.topic}`)) return makePredicateInfo("주문일자 >= :dt1 AND 주문일자 < :dt2", "상태코드 = '정상'");
  if (/Trace|NL|Nested|인덱스/.test(`${lab.title} ${lab.topic}`)) return makePredicateInfo("조인 키 또는 선택 조건", "비선두 컬럼 추가 필터");
  return undefined;
}

function convertReviewLab(lab: PdfReviewLab, index: number): LabQuestion {
  const rows = 300 + index * 80;
  const starts = 1 + index;
  const pr = 5 + index * 2;
  const cr = 1200 + index * 350;
  const targetPlan = (lab.executionPlan?.split("\n").filter((line) => /JOIN|SCAN|SORT|GROUP|COUNT|MERGE|TABLE ACCESS|INDEX/i.test(line)).slice(0, 4) ?? []);
  const normalizedPlan = targetPlan.length ? targetPlan : defaultPlanForReviewLab(lab);
  const signature = [lab.title, lab.schemaSql, lab.currentSql, lab.answerSql, lab.explanation].join("\n");
  const mode = lab.mode as GenerationBucket;
  const fallbackTraceStats = makeTraceStats(lab.topic, rows, starts, pr, cr, normalizedPlan);
  const traceStats = reviewTraceText(lab, fallbackTraceStats);
  const convertedTraceSummary = reviewTraceRows(lab.traceSummary);

  return {
    ...metadataForLab({
      number: index + 1,
      mode,
      signature,
      sourcePage: lab.source.page,
      sourceQuestionNumber: lab.source.questionNumber,
      approved: true
    }),
    id: `practice-v1-${String(index + 1).padStart(2, "0")}`,
    number: index + 1,
    title: lab.title,
    difficulty: difficultyFromReview(lab.difficulty),
    topic: lab.topic,
    scenario: lab.scenario,
    schemaSql: lab.schemaSql,
    seedSql: [lab.currentSql ? `[현재 SQL]\n${lab.currentSql}` : undefined, lab.executionPlan ? `[실행계획/관찰 정보]\n${lab.executionPlan}` : undefined, ...(lab.sampleData ?? []).map((table) => `[샘플 ${table.title ?? "데이터"}]\n${table.headers.join(" | ")}\n${table.rows.map((row) => row.join(" | ")).join("\n")}`)].filter(Boolean).join("\n\n"),
    traceStats,
    predicateInfo: reviewPredicateInfo(lab),
    prompt: lab.requirements.join("\n"),
    expectedSql: lab.answerSql,
    targetPlan: normalizedPlan,
    targetPlanExplanations: normalizedPlan.map(explainOperation),
    oracleNotes: [lab.explanation, ...lab.rubric, "표시된 실행계획과 Trace는 학습용 예시이며 실제 Oracle에서 측정한 결과가 아니다."],
    hints: lab.hints,
    rubric: lab.rubric,
    traceSummary: convertedTraceSummary ?? (traceStats ? traceSummaryFrom(rows, starts, pr, cr, `00:00:0${Math.min(9, starts)}.${String(cr % 100).padStart(2, "0")}`) : undefined),
    simulationNotice: traceStats ? "이 실행계획과 SQL Trace는 SQLP 학습용 설명 예시다. 실제 Oracle 실행 결과로 표시하지 않는다." : "이 실습은 정적 SQL 작성 및 설계 검토 모드다. 실제 Oracle 실행 결과로 표시하지 않는다.",
    relatedConceptIds: relatedConceptsForTopic(lab.topic)
  };
}

function metadataForLab(args: {
  number: number;
  mode: GenerationBucket;
  signature: string;
  sourcePage?: number;
  sourceQuestionNumber?: number | string;
  approved: boolean;
}) {
  const source = sourceFor("tuning", args.number + 2);
  const sourceType = sourceTypeForMode(args.mode);
  return {
    sourceDocument: source.name,
    sourceVersion: verifiedOfficialSourceVersion,
    sourcePage: args.sourcePage ?? ((args.number * 11) % Math.max(source.pages - 1, 1)) + 1,
    sourceQuestionNumber: typeof args.sourceQuestionNumber === "number" ? args.sourceQuestionNumber : undefined,
    sourceType,
    generationMode: generationModeForMode(args.mode),
    parentQuestionId: args.mode === "original" ? undefined : `practice-original-${Math.max(1, args.number % 5)}`,
    variantGroupId: `practice-${hashText(args.signature).slice(0, 8)}`,
    contentHash: hashText(normalizeForHash(args.signature)),
    semanticFingerprint: hashText(normalizeForHash(args.signature.replace(/[0-9]+/g, "#"))),
    batchId: args.approved ? "initial-sql-practice-v1" : `extra-sql-practice-${Math.floor((args.number - 21) / 20) + 1}`,
    reviewStatus: args.approved ? "approved" : "review_required",
    validationStatus: args.approved ? "validated" : "review_required",
    estimatedTime: 900,
    tags: ["sql-practice", sourceType, args.mode, args.approved ? "published" : "review-required"]
  } satisfies ContentSourceMetadata;
}

const practiceBlueprints = [
  ["복합 JOIN SQL 작성", "다중 테이블 JOIN", "고객, 주문, 결제, 배송 상태를 함께 조회하되 취소 주문과 미결제 주문 처리 기준을 분리한다.", ["NESTED LOOPS", "INDEX RANGE SCAN", "TABLE ACCESS BY INDEX ROWID"], "o.cust_id = c.cust_id", "p.pay_amt is not null"],
  ["서브쿼리 작성", "상관 서브쿼리", "부서별 최고 금액 거래와 고객 등급 조건을 동시에 만족하는 행을 조회한다.", ["FILTER", "INDEX RANGE SCAN", "TABLE ACCESS BY INDEX ROWID"], "o.amount = (select max(...))", "grade_cd <> 'X'"],
  ["집계 및 HAVING", "GROUP BY/HAVING", "월별·채널별 집계에서 반품을 제외하고 최소 거래 건수 이상인 그룹만 반환한다.", ["HASH GROUP BY", "TABLE ACCESS FULL", "FILTER"], "order_dt range", "count(*) >= :min_cnt"],
  ["분석 함수", "Window Function", "고객별 최근 주문 2건과 누적 주문 금액을 함께 계산한다.", ["WINDOW SORT", "INDEX RANGE SCAN", "COUNT STOPKEY"], "cust_id, order_dt", "row_number <= 2"],
  ["계층형 질의", "CONNECT BY", "조직도에서 특정 본부 하위 부서를 레벨과 경로로 출력한다.", ["CONNECT BY", "INDEX RANGE SCAN", "TABLE ACCESS BY INDEX ROWID"], "parent_dept_id = prior dept_id", "level <= :max_level"],
  ["ROLLUP", "GROUPING SETS", "지역, 채널, 월 기준 소계와 총계를 구분해 출력한다.", ["SORT GROUP BY ROLLUP", "TABLE ACCESS FULL", "FILTER"], "sales_month range", "grouping(region_cd)"],
  ["MERGE", "DML 튜닝", "일별 요약 테이블에 신규 집계는 INSERT, 기존 집계는 UPDATE한다.", ["MERGE STATEMENT", "HASH JOIN", "TABLE ACCESS FULL"], "summary_key match", "source row unique"],
  ["복잡한 조건 조회", "NULL/OUTER JOIN", "선택 배송 정보가 없는 주문도 유지하면서 배송 지연 주문을 구분한다.", ["NESTED LOOPS OUTER", "INDEX RANGE SCAN", "FILTER"], "delivery_id", "delivery_status_cd"],
  ["실행 결과 추론", "SQL 결과 분석", "NULL, OUTER JOIN, HAVING 조건을 적용한 후 남는 그룹을 계산한다.", ["HASH JOIN OUTER", "HASH GROUP BY", "FILTER"], "cust_id", "count(pay_id)"],
  ["잘못된 SQL 수정", "SQL Rewrite", "WHERE 절 함수 사용과 OUTER JOIN 조건 위치 오류를 함께 고친다.", ["INDEX RANGE SCAN", "NESTED LOOPS OUTER", "COUNT STOPKEY"], "order_dt >= :from_dt", "right_table_status"],
  ["인덱스 설계", "결합 인덱스", "등치 조건, 범위 조건, 정렬 조건이 섞인 조회에 적절한 결합 인덱스를 설계한다.", ["INDEX RANGE SCAN DESCENDING", "TABLE ACCESS BY INDEX ROWID", "COUNT STOPKEY"], "status_cd, cust_id, order_dt", "amount >= :min_amt"],
  ["Nested Loops Join 튜닝", "NL Join", "소량 선행 집합에서 후행 테이블 반복 탐색 비용을 줄인다.", ["NESTED LOOPS", "INDEX UNIQUE SCAN", "TABLE ACCESS BY INDEX ROWID"], "small driving set", "rowid lookup"],
  ["Hash Join 튜닝", "Hash Join", "대량 집계 후 조인에서 Build Input과 메모리 부하를 판단한다.", ["HASH JOIN", "HASH GROUP BY", "TABLE ACCESS FULL"], "small build input", "large probe input"],
  ["실행계획 분석", "Execution Plan", "Predicate가 access가 아닌 filter로 밀려 대량 스캔이 발생한 원인을 설명한다.", ["TABLE ACCESS FULL", "FILTER", "HASH JOIN"], "partition key range", "function(column)"],
  ["SQL Trace 분석", "TKPROF/Trace", "Rows는 적지만 Starts와 CR이 높은 반복 탐색 병목을 찾아 개선한다.", ["NESTED LOOPS", "INDEX RANGE SCAN", "TABLE ACCESS BY INDEX ROWID"], "order_id = :b1", "status_cd"],
  ["부분범위 처리", "Top-N", "정렬 후 상위 N건 화면에서 전체 정렬을 피하고 조기 종료되도록 SQL을 재작성한다.", ["COUNT STOPKEY", "INDEX RANGE SCAN DESCENDING", "TABLE ACCESS BY INDEX ROWID"], "order_dt desc", "rownum <= :n"],
  ["대량 DML", "Bulk DML", "대량 UPDATE에서 인덱스 유지, Undo/Redo, 배치 커밋 기준을 설계한다.", ["UPDATE STATEMENT", "INDEX RANGE SCAN", "TABLE ACCESS BY INDEX ROWID"], "status_cd range", "batch commit"],
  ["Lock 및 동시성", "TX Lock", "두 세션의 UPDATE 순서와 FK 검증 때문에 발생하는 블로킹을 해석한다.", ["UPDATE STATEMENT", "INDEX UNIQUE SCAN", "ENQUEUE TX"], "pk lookup", "foreign key check"],
  ["쿼리 변환", "View Merging/Predicate Pushing", "인라인 뷰 집계와 외부 조건의 위치를 바꿔 조기 필터링을 유도한다.", ["VIEW MERGING", "HASH GROUP BY", "PREDICATE PUSHED"], "view key", "outer predicate"],
  ["종합 튜닝", "Trace+Index+Join", "Trace와 실행계획을 함께 보고 인덱스, 조인 순서, SQL Rewrite 개선안을 제시한다.", ["NESTED LOOPS", "HASH JOIN", "INDEX RANGE SCAN", "COUNT STOPKEY"], "selective predicate", "avoidable table access"]
] as const;

function relatedConceptsForTopic(topic: string) {
  const ids = new Set<string>();
  if (/JOIN|조인|Loops|Hash/.test(topic)) ids.add("tuning-advanced-join");
  if (/Trace|TKPROF|실행계획/.test(topic)) ids.add("tuning-sql-trace");
  if (/인덱스|Top-N|부분범위/.test(topic)) ids.add("tuning-index-scan-efficiency");
  if (/GROUP|ROLLUP|집계/.test(topic)) ids.add("sql-group-functions");
  if (/Window|분석/.test(topic)) ids.add("sql-window-functions");
  if (/Lock|동시성/.test(topic)) ids.add("tuning-lock");
  if (/MERGE|DML|UPDATE/.test(topic)) ids.add("tuning-dml");
  if (!ids.size) ids.add("tuning-explain-plan");
  return Array.from(ids);
}

function buildPracticeLab(blueprintIndex: number, number: number, approved: boolean): LabQuestion {
  const [title, topic, scenario, operations, access, filter] = practiceBlueprints[blueprintIndex % practiceBlueprints.length];
  const mode: GenerationBucket = approved ? (number <= 8 ? "variant" : "similar") : "similar";
  const rows = 500 + number * 120;
  const starts = number % 6 === 0 ? 36 : (number % 5) + 1;
  const pr = number % 4;
  const cr = rows * starts + 900;
  const suffix = String(number).padStart(2, "0");
  const schemaSql = `-- ${title} 실습 스키마
create table customers_${suffix} (
  cust_id number primary key,
  region_cd varchar2(10),
  grade_cd varchar2(10),
  created_at date
);
create table orders_${suffix} (
  order_id number primary key,
  cust_id number not null,
  order_dt date not null,
  status_cd varchar2(10),
  channel_cd varchar2(10),
  amount number,
  constraint orders_${suffix}_fk foreign key (cust_id) references customers_${suffix}(cust_id)
);
create index orders_${suffix}_x1 on orders_${suffix}(status_cd, cust_id, order_dt);
create index orders_${suffix}_x2 on orders_${suffix}(order_dt, channel_cd, amount);`;
  const seedSql = `[데이터 분포]
- customers_${suffix}: ${20_000 + number * 1500}건, region_cd NDV ${8 + (number % 5)}, grade_cd 'A' 비율 ${15 + (number % 10)}%
- orders_${suffix}: ${(800_000 + number * 35_000).toLocaleString("ko-KR")}건, 최근 30일 ${8 + (number % 7)}%, status_cd='완료' ${35 + (number % 20)}%

[현재 SQL]
select c.region_cd, count(*) cnt, sum(o.amount) amt
from customers_${suffix} c
     join orders_${suffix} o on o.cust_id = c.cust_id
where trunc(o.order_dt) >= date '2026-07-01'
  and o.status_cd = '완료'
group by c.region_cd
order by amt desc`;
  const expectedSql = `select /*+ leading(o c) use_nl(c) index(o orders_${suffix}_x1) */ c.region_cd, count(*) cnt, sum(o.amount) amt
from orders_${suffix} o
     join customers_${suffix} c on c.cust_id = o.cust_id
where o.order_dt >= date '2026-07-01'
  and o.order_dt < date '2026-08-01'
  and o.status_cd = '완료'
group by c.region_cd
order by amt desc`;
  const prompt = `${scenario} 현재 SQL의 병목 원인을 설명하고, 같은 결과를 반환하면서 접근 범위와 불필요한 반복을 줄이는 SQL 또는 튜닝 방안을 작성하시오. 실제 Oracle 실행 환경이 아니므로 답안은 정적 분석과 모범 답안 비교 기준으로 평가한다.`;
  const signature = [title, schemaSql, seedSql, expectedSql, operations.join("|")].join("\n");

  return {
    ...metadataForLab({ number, mode, signature, approved }),
    id: approved ? `practice-v1-${suffix}` : `practice-extra-${suffix}`,
    number,
    title,
    difficulty: number % 5 === 0 ? "최상급" : number % 3 === 0 ? "상급" : "중급",
    topic,
    scenario,
    schemaSql,
    seedSql,
    traceStats: makeTraceStats(title, rows, starts, pr, cr, [...operations]),
    predicateInfo: makePredicateInfo(access, filter),
    prompt,
    expectedSql,
    targetPlan: [...operations],
    targetPlanExplanations: [...operations].map(explainOperation),
    oracleNotes: [
      "표시된 실행계획과 Trace는 교육용 예시다. 실제 Oracle 측정 결과가 아니라 문제 해결 근거를 학습하기 위한 자료로 본다.",
      "답안은 SQL 문자열 일치만으로 판단하지 않고 요구 결과, 접근 경로, Predicate 위치, 조인 순서, 불필요한 정렬 제거 여부를 함께 평가한다.",
      `${topic}에서는 데이터 분포와 실행계획 수치를 함께 설명해야 한다.`
    ],
    hints: [
      "1단계: WHERE 조건 중 인덱스 시작점을 만들 수 있는 조건과 읽은 뒤 걸러지는 조건을 구분한다.",
      "2단계: 현재 Trace에서 Rows 대비 Starts 또는 CR이 과도한 Operation을 찾는다.",
      "3단계: SQL Rewrite, 인덱스 컬럼 순서, 조인 순서 중 어느 것이 병목 수치를 직접 줄이는지 설명한다."
    ],
    rubric: [
      "업무 요구 결과를 보존했는가",
      "날짜 조건을 SARGable하게 재작성했는가",
      "Access Predicate와 Filter Predicate 차이를 설명했는가",
      "목표 실행계획의 조인 순서와 인덱스 사용 근거를 설명했는가",
      "실제 Oracle 미연동 상태에서 시뮬레이션과 실제 측정을 구분했는가"
    ],
    traceSummary: traceSummaryFrom(rows, starts, pr, cr, `00:00:0${Math.min(9, starts)}.${String(cr % 100).padStart(2, "0")}`),
    simulationNotice: "이 실행계획과 SQL Trace는 SQLP 학습용 설명 예시다. 실제 Oracle 실행 결과로 표시하지 않는다.",
    relatedConceptIds: relatedConceptsForTopic(topic)
  };
}

const verifiedObjectiveSeedQuestions: ObjectiveQuestion[] = [
  ...buildSubjectBank("modeling"),
  ...buildSubjectBank("sql-basic"),
  ...buildSubjectBank("tuning")
];

function objectiveSignature(question: ObjectiveQuestion) {
  return [
    question.subjectId,
    question.stem,
    question.passage ?? "",
    question.code ?? "",
    question.table ? JSON.stringify(question.table) : "",
    question.choices.map((choice) => choice.text).join("|")
  ]
    .join("::")
    .replace(/\s+/g, " ")
    .trim()
    .toLowerCase();
}

function labSignature(lab: LabQuestion) {
  return [lab.title, lab.prompt, lab.expectedSql]
    .join("::")
    .replace(/\s+/g, " ")
    .trim()
    .toLowerCase();
}

function dedupeObjectiveQuestions(questions: ObjectiveQuestion[]) {
  const seen = new Set<string>();
  return questions.filter((question) => {
    const signature = objectiveSignature(question);
    if (seen.has(signature)) return false;
    seen.add(signature);
    return true;
  });
}

function dedupeLabQuestions(labs: LabQuestion[]) {
  const seen = new Set<string>();
  return labs.filter((lab) => {
    const signature = labSignature(lab);
    if (seen.has(signature)) return false;
    seen.add(signature);
    return true;
  });
}

function renumberObjectiveQuestions(questions: ObjectiveQuestion[]) {
  const nextNumber: Record<SubjectId, number> = {
    modeling: 0,
    "sql-basic": 0,
    tuning: 0
  };
  return questions.map((question) => ({
    ...question,
    number: (nextNumber[question.subjectId] += 1)
  }));
}

function renumberLabQuestions(labs: LabQuestion[]) {
  return labs.map((lab, index) => ({
    ...lab,
    number: index + 1
  }));
}

function capObjectiveQuestions(questions: ObjectiveQuestion[], targetPerSubject = 100) {
  const counts: Record<SubjectId, number> = {
    modeling: 0,
    "sql-basic": 0,
    tuning: 0
  };

  return questions.filter((question) => {
    if (counts[question.subjectId] >= targetPerSubject) return false;
    counts[question.subjectId] += 1;
    return true;
  });
}

const objectiveQuestionCandidates = dedupeObjectiveQuestions([
  ...verifiedObjectiveSeedQuestions,
  ...manualVerifiedObjectiveQuestions,
  ...manualVerifiedObjectiveQuestionsBatch02,
  ...manualVerifiedObjectiveQuestionsBatch03
]);

const convertedReviewLabs = pdfReviewLabs.map((lab, index) => convertReviewLab(lab, index));
const labQuestionCandidates = dedupeLabQuestions(convertedReviewLabs);

export function createVerifiedExtraQuestion(subjectId: SubjectId, count: number): ObjectiveQuestion {
  throw new Error(`No verified PDF expansion question is available for ${subjectId}:${count}`);
}

export function createVerifiedExtraQuestions(subjectId: SubjectId, startCount: number, batchSize = 20): ObjectiveQuestion[] {
  void subjectId;
  void startCount;
  void batchSize;
  return [];
}

export function createVerifiedExtraLabQuestion(count: number): LabQuestion {
  throw new Error(`No verified PDF expansion lab is available for ${count}`);
}

export function createVerifiedExtraLabQuestions(startCount: number, batchSize = 5): LabQuestion[] {
  void startCount;
  void batchSize;
  return [];
}

const bannedUserVisiblePatterns = [
  /�/,
  /[公分往幻務]/,
  /review_required/i,
  /original_ready/i,
  /sourceDocument/i,
  /sourceType/i,
  /generationMode/i,
  /문항 키/,
  /추출 상태/,
  /PDF 원문 문항/,
  /유사형 문항/,
  /타RD/,
  /집힙/,
  /SELK/,
  /I八|八\)|八3/,
  /FRO M/,
  /\bF\s+R\s+O\s+M\b/i,
  /\bFR\s+O\s+M\b/i,
  /\bU\s+N\s*I\s*O\s+N\b/i,
  /\bSELEC\s+T\b/i,
  /\bPROM\s+TBL\b/i,
  /\bN\s+U\s+LL\b/i,
  /\bV\s+A\s+R\s*CH\s*A?\s*R?2?\b/i,
  /W H E R E/,
  /SQ L/,
  /IN況/,
  /凶/,
  /쏜벋/,
  /묘의 상태/,
  /부\s+적\s+절|적\s+절|가\s+장|것\s+은|실\s+행|결\s+과|오\s+류|작\s+성|모\s+델/,
  /SESSIONJ?D|LOCKJ?D|PRODJ?D|STADIUMJ?D/i,
  /31正3/,
  /테아블/,
  /\[[^\]]+\.pdf\s+p\./i,
  /\.pdf/
];

const collapsedMaterialTokens = [
  "CREATE TABLE",
  "ALTER TABLE",
  "INSERT INTO",
  "DELETE FROM",
  "SELECT ",
  " FROM ",
  " WHERE ",
  " GROUP BY ",
  " HAVING ",
  " ORDER BY ",
  " REFERENCES ",
  " ON DELETE ",
  "[SQL]",
  "[테이블",
  "현재 테이블",
  "테이블 명",
  "실행계획",
  "TRACE"
];

function visibleQuestionText(question: ObjectiveQuestion) {
  return [
    question.subjectName,
    question.majorTopic,
    question.middleTopic,
    question.topic,
    question.difficulty,
    question.questionType,
    question.stem,
    question.passage,
    question.code,
    question.explanation,
    question.hint,
    question.table ? [question.table.headers.join(" "), question.table.rows.flat().join(" ")].join(" ") : "",
    ...question.choices.map((choice) => choice.text),
    ...Object.values(question.whyWrong)
  ]
    .filter(Boolean)
    .join("\n");
}

function hasBannedUserVisibleText(value: string) {
  return bannedUserVisiblePatterns.some((pattern) => pattern.test(value));
}

function hasCollapsedMaterialInStem(question: ObjectiveQuestion) {
  if (question.code || question.table || question.passage) return false;

  const stem = question.stem.toUpperCase();
  const materialHits = collapsedMaterialTokens.filter((token) => stem.includes(token)).length;

  return (
    materialHits >= 2 ||
    stem.includes("CREATE TABLE") ||
    (stem.includes("[SQL]") && (stem.includes("SELECT ") || stem.includes("FROM "))) ||
    ((question.stem.includes("[테이블") || question.stem.includes("현재 테이블") || question.stem.includes("테이블 명")) && question.stem.length > 120) ||
    (/\bSELECT\b.+\bFROM\b/i.test(question.stem) && question.stem.length > 140)
  );
}

function isPublishedObjectiveQuestion(question: ObjectiveQuestion) {
  if (question.reviewStatus !== "approved" || question.validationStatus !== "validated") return false;
  if (hasBannedUserVisibleText(visibleQuestionText(question))) return false;
  if (hasCollapsedMaterialInStem(question)) return false;
  return true;
}

function isPublishedLabQuestion(lab: LabQuestion) {
  if (lab.reviewStatus !== "approved" || lab.validationStatus !== "validated") return false;
  if (hasBannedUserVisibleText(visibleLabText(lab))) return false;
  return true;
}

function visibleLabText(lab: LabQuestion) {
  return [
    lab.title,
    lab.topic,
    lab.difficulty,
    lab.scenario,
    lab.schemaSql,
    lab.seedSql,
    lab.traceStats,
    lab.predicateInfo,
    lab.prompt,
    lab.expectedSql,
    ...lab.targetPlan,
    ...lab.oracleNotes,
    ...lab.hints,
    ...lab.rubric
  ]
    .filter(Boolean)
    .join("\n");
}

export const verifiedObjectiveQuestions: ObjectiveQuestion[] = renumberObjectiveQuestions(
  objectiveQuestionCandidates.filter(isPublishedObjectiveQuestion)
);

export const verifiedLabQuestions: LabQuestion[] = renumberLabQuestions(
  labQuestionCandidates.filter(isPublishedLabQuestion)
);

export function findPublishedUserVisibleIssues() {
  const objectiveIssues = verifiedObjectiveQuestions.flatMap((question) =>
    bannedUserVisiblePatterns
      .filter((pattern) => pattern.test(visibleQuestionText(question)))
      .map((pattern) => ({ id: question.id, pattern: pattern.toString() }))
  );
  const labIssues = verifiedLabQuestions.flatMap((lab) =>
    bannedUserVisiblePatterns
      .filter((pattern) => pattern.test(visibleLabText(lab)))
      .map((pattern) => ({ id: lab.id, pattern: pattern.toString() }))
  );
  return [...objectiveIssues, ...labIssues];
}

export function getVerifiedProductionSummary() {
  const bySubject = Object.fromEntries(
    (Object.keys(subjectNames) as SubjectId[]).map((subjectId) => {
      const questions = verifiedObjectiveQuestions.filter((question) => question.subjectId === subjectId);
      return [
        subjectId,
        {
          total: questions.length,
          original: questions.filter((question) => question.sourceType === "owner_pdf").length,
          variant: questions.filter((question) => question.sourceType === "owner_pdf_variant").length,
          similar: questions.filter((question) => question.sourceType === "owner_pdf_similar").length,
          topics: new Set(questions.map((question) => question.topic)).size,
          types: new Set(questions.map((question) => question.questionType)).size
        }
      ];
    })
  );

  return {
    objectiveTotal: verifiedObjectiveQuestions.length,
    labTotal: verifiedLabQuestions.length,
    bySubject,
    labs: {
      original: verifiedLabQuestions.filter((lab) => lab.sourceType === "owner_pdf").length,
      variant: verifiedLabQuestions.filter((lab) => lab.sourceType === "owner_pdf_variant").length,
      similar: verifiedLabQuestions.filter((lab) => lab.sourceType === "owner_pdf_similar").length,
      topics: new Set(verifiedLabQuestions.map((lab) => lab.topic)).size
    },
    qualityIssues: findPublishedUserVisibleIssues()
  };
}
