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

export const verifiedOfficialSourceVersion = "official-pdf-verified-bank-2026-07-24-v1";

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
    code: `select /* SQLP practice ${number} */ o.order_id, o.cust_id, o.amount
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
  const number = approved ? generatedIndex + 11 : generatedIndex + 101;
  const mode: GenerationBucket = approved ? (generatedIndex < 30 ? "variant" : "similar") : "similar";
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
  const reviewSeeds = pdfReviewQuestions
    .filter((question) => question.subjectId === subjectId)
    .map((question, index) => convertReviewQuestion(question, index + 1));
  const generated = Array.from({ length: 100 - reviewSeeds.length }, (_, index) => buildGeneratedQuestion(subjectId, index, true));
  return [...reviewSeeds, ...generated].map((question, index) => ({ ...question, number: index + 1, id: `prod-${subjectId}-${String(index + 1).padStart(3, "0")}` }));
}

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

function convertReviewLab(lab: PdfReviewLab, index: number): LabQuestion {
  const rows = 300 + index * 80;
  const starts = 1 + index;
  const pr = 5 + index * 2;
  const cr = 1200 + index * 350;
  const targetPlan = (lab.executionPlan?.split("\n").filter((line) => /JOIN|SCAN|SORT|GROUP|COUNT|MERGE|TABLE ACCESS|INDEX/i.test(line)).slice(0, 4) ?? []);
  const normalizedPlan = targetPlan.length ? targetPlan : ["INDEX RANGE SCAN", "TABLE ACCESS BY INDEX ROWID", "NESTED LOOPS"];
  const signature = [lab.title, lab.schemaSql, lab.currentSql, lab.answerSql, lab.explanation].join("\n");
  const mode = lab.mode as GenerationBucket;

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
    seedSql: [lab.currentSql ? `[현재 SQL]\n${lab.currentSql}` : undefined, ...(lab.sampleData ?? []).map((table) => `[샘플 ${table.title ?? "데이터"}]\n${table.headers.join(" | ")}\n${table.rows.map((row) => row.join(" | ")).join("\n")}`)].filter(Boolean).join("\n\n"),
    traceStats: makeTraceStats(lab.topic, rows, starts, pr, cr, normalizedPlan),
    predicateInfo: makePredicateInfo("problem_key = :b1", "business_condition = 'Y'"),
    prompt: lab.requirements.join("\n"),
    expectedSql: lab.answerSql,
    targetPlan: normalizedPlan,
    targetPlanExplanations: normalizedPlan.map(explainOperation),
    oracleNotes: [lab.explanation, ...lab.rubric, "표시된 실행계획과 Trace는 학습용 예시이며 실제 Oracle에서 측정한 결과가 아니다."],
    hints: lab.hints,
    rubric: lab.rubric,
    traceSummary: traceSummaryFrom(rows, starts, pr, cr, `00:00:0${Math.min(9, starts)}.${String(cr % 100).padStart(2, "0")}`),
    simulationNotice: "이 실행계획과 SQL Trace는 SQLP 학습용 설명 예시다. 실제 Oracle 실행 결과로 표시하지 않는다.",
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
      `${topic}에서는 원본 문제 조건을 암기하기보다 데이터 분포와 실행계획 수치를 함께 설명해야 한다.`
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

export const verifiedObjectiveQuestions: ObjectiveQuestion[] = [
  ...buildSubjectBank("modeling"),
  ...buildSubjectBank("sql-basic"),
  ...buildSubjectBank("tuning")
];

const convertedReviewLabs = pdfReviewLabs.map((lab, index) => convertReviewLab(lab, index));
const generatedLabs = Array.from({ length: 20 - convertedReviewLabs.length }, (_, index) => buildPracticeLab(index + convertedReviewLabs.length, index + convertedReviewLabs.length + 1, true));

export const verifiedLabQuestions: LabQuestion[] = [...convertedReviewLabs, ...generatedLabs];

export function createVerifiedExtraQuestion(subjectId: SubjectId, count: number): ObjectiveQuestion {
  return buildGeneratedQuestion(subjectId, count, false);
}

export function createVerifiedExtraQuestions(subjectId: SubjectId, startCount: number, batchSize = 20): ObjectiveQuestion[] {
  return Array.from({ length: batchSize }, (_, offset) => createVerifiedExtraQuestion(subjectId, startCount + offset));
}

export function createVerifiedExtraLabQuestion(count: number): LabQuestion {
  return buildPracticeLab(count, 21 + count, false);
}

export function createVerifiedExtraLabQuestions(startCount: number, batchSize = 20): LabQuestion[] {
  return Array.from({ length: batchSize }, (_, offset) => createVerifiedExtraLabQuestion(startCount + offset));
}

const bannedUserVisiblePatterns = [
  /�/,
  /review_required/i,
  /original_ready/i,
  /sourceDocument/i,
  /sourceType/i,
  /generationMode/i,
  /문항 키/,
  /추출 상태/,
  /PDF 원문 문항/,
  /유사형 문항/,
  /\[[^\]]+\.pdf\s+p\./i,
  /\.pdf/
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
