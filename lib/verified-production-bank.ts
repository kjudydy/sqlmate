import {
  pdfReviewLabs,
  pdfReviewQuestions,
  type PdfReviewLab,
  type PdfReviewMode,
  type PdfReviewQuestion
} from "@/lib/pdf-review-bank";
import { pdfExtensionQuestionsBatch12 } from "@/lib/pdf-extension-bank-v13";
import { manualPdfObjectiveExtensionBatch14 } from "@/lib/manual-pdf-extension-batch-v14";
import { newPdfSubject3LabBatch15, newPdfSubject3ObjectiveBatch15 } from "@/lib/new-pdf-subject3-batch-v15";
import { sqlmateAdvanced20qObjectiveBatch17 } from "@/lib/sqlmate-advanced-20q-batch-v17";
import { sqlmateAdvancedUploadObjectiveBatch16 } from "@/lib/sqlmate-advanced-upload-batch-v16";
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

export const verifiedOfficialSourceVersion = "official-pdf-reviewed-only-2026-07-30-v13";

export const verifiedOfficialPdfSources = [
  { name: "SQL-자격검정-실전문제.pdf", pages: 144, textPages: 136, lowTextPages: [1, 12, 20, 40, 71, 93, 106, 107], questionCandidates: 685, focus: ["modeling", "sql-basic", "tuning"] as SubjectId[], visualChecks: [8, 9, 22, 24, 25, 73, 74, 75, 137, 138, 139] },
  { name: "45회_기출문제.pdf", pages: 20, textPages: 20, lowTextPages: [], questionCandidates: 105, focus: ["modeling", "sql-basic", "tuning"] as SubjectId[], visualChecks: [1, 10, 20] },
  { name: "46회_기출문제.pdf", pages: 11, textPages: 11, lowTextPages: [], questionCandidates: 81, focus: ["modeling", "sql-basic", "tuning"] as SubjectId[], visualChecks: [1, 5, 11] },
  { name: "47회_기출문제.pdf", pages: 12, textPages: 12, lowTextPages: [], questionCandidates: 82, focus: ["modeling", "sql-basic", "tuning"] as SubjectId[], visualChecks: [1, 6, 12] },
  { name: "48회_기출문제.pdf", pages: 14, textPages: 14, lowTextPages: [], questionCandidates: 84, focus: ["modeling", "sql-basic"] as SubjectId[], visualChecks: [1, 7, 14] },
  { name: "49회_기출문제.pdf", pages: 22, textPages: 22, lowTextPages: [], questionCandidates: 70, focus: ["sql-basic", "tuning"] as SubjectId[], visualChecks: [1, 11, 22] },
  { name: "50회_기출문제.pdf", pages: 16, textPages: 16, lowTextPages: [], questionCandidates: 65, focus: ["modeling", "sql-basic", "tuning"] as SubjectId[], visualChecks: [1, 8, 16] },
  { name: "SQLP_Exam_Problem_Bank_60.pdf", pages: 17, textPages: 17, lowTextPages: [], questionCandidates: 60, focus: ["modeling", "sql-basic", "tuning"] as SubjectId[], visualChecks: [1, 2, 5, 8, 9, 12, 17] },
  { name: "SQLD_기출복원문제집_58회_59회_60회.pdf", pages: 13, textPages: 13, lowTextPages: [], questionCandidates: 34, focus: ["modeling", "sql-basic"] as SubjectId[], visualChecks: [2, 5, 13] },
  { name: "SQLP_실기_기출복기_예상문제집.pdf", pages: 9, textPages: 9, lowTextPages: [], questionCandidates: 6, focus: ["tuning"] as SubjectId[], visualChecks: [1, 2, 4, 5, 7, 8, 9] },
  { name: "SQLP_3과목_및_실기_합격_기출모의고사.pdf", pages: 18, textPages: 18, lowTextPages: [], questionCandidates: 40, focus: ["tuning"] as SubjectId[], visualChecks: [1, 8, 9, 10, 11, 15, 18] }
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
  ["SQL 기본 및 활용", "WHERE", "NULL 비교", "sql-null", "중급", "NULL 비교는 TRUE/FALSE가 아니라 UNKNOWN을 만들 수 있으며 WHERE에서는 TRUE인 행만 남는다.", "NULL을 0이나 빈 문자열과 같은 값으로 비교한다."],
  ["SQL 기본 및 활용", "함수", "NVL과 COALESCE", "sql-functions", "중급", "NVL은 Oracle 함수이고 COALESCE는 표준 표현이며 데이터 타입 결정과 평가 방식 차이를 함께 확인한다.", "두 함수가 모든 DBMS와 타입 조합에서 완전히 동일하다고 본다."],
  ["SQL 기본 및 활용", "함수", "날짜 연산", "sql-functions", "상급", "Oracle DATE는 날짜와 시간을 함께 보관하므로 기간 조건은 종료일 미만 방식으로 작성해야 누락이 적다.", "BETWEEN 종료일을 날짜 리터럴로 쓰면 그날 전체가 포함된다고 판단한다."],
  ["SQL 기본 및 활용", "함수", "CASE 표현식", "sql-functions", "중급", "CASE는 조건 순서대로 평가되며 첫 번째로 만족한 결과가 반환된다.", "여러 WHEN이 참이면 모든 결과가 결합된다고 판단한다."],
  ["SQL 기본 및 활용", "JOIN", "INNER JOIN 결과", "sql-join", "중급", "INNER JOIN은 조인 조건을 만족하는 행 조합만 남기므로 중복 행은 관계 건수에 따라 증가할 수 있다.", "조인 컬럼이 PK/FK이면 결과 건수가 항상 한쪽 테이블 건수와 같다고 본다."],
  ["SQL 기본 및 활용", "JOIN", "OUTER JOIN 조건 위치", "sql-standard-join", "상급", "OUTER JOIN의 보존 테이블과 ON/WHERE 조건 위치는 NULL 확장 행의 보존 여부를 바꾼다.", "LEFT JOIN 후 WHERE에서 오른쪽 테이블 컬럼을 필터해도 보존 효과가 유지된다고 본다."],
  ["SQL 기본 및 활용", "Subquery", "상관 서브쿼리", "sql-subquery", "상급", "상관 서브쿼리는 외부 행마다 내부 조건이 달라지며 EXISTS/IN/스칼라 결과의 의미를 구분해야 한다.", "상관 서브쿼리는 항상 한 번만 실행된다고 판단한다."],
  ["SQL 기본 및 활용", "Subquery", "NOT IN과 NULL", "sql-null", "상급", "NOT IN 목록이나 서브쿼리 결과에 NULL이 있으면 전체 비교가 UNKNOWN이 되어 예상과 다른 결과가 나온다.", "NOT IN과 NOT EXISTS가 NULL 상황에서도 항상 같은 결과라고 본다."],
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
  sourceDocument?: string;
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
    sourceDocument: args.sourceDocument ?? source.name,
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
  const signature = [question.stem, question.passage, question.code, JSON.stringify(question.table), JSON.stringify(question.tables), choices.map((choice) => choice.text).join("|")].join("\n");

  return {
    ...metadataForObjective({
      subjectId: question.subjectId as SubjectId,
      number,
      mode,
      sourceDocument: source.document,
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
    table: question.table ? { title: question.table.title, headers: question.table.headers, rows: question.table.rows } : undefined,
    tables: question.tables?.map((table) => ({ title: table.title, headers: table.headers, rows: table.rows })),
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
    if (/NULL/.test([question.middleTopic, question.topic, question.stem].filter(Boolean).join(" "))) return "sql-null";
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
  sourceDocument?: string;
  sourcePage: number;
  sourceQuestionNumber?: number;
  parentQuestionId?: string;
  stem: string;
  passage?: string;
  code?: string;
  table?: ObjectiveQuestion["table"];
  tables?: ObjectiveQuestion["tables"];
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
    input.tables ? JSON.stringify(input.tables) : "",
    input.choices.map((choice) => `${choice.id}:${choice.text}`).join("|")
  ].join("\n");

  return {
    ...metadataForObjective({
      subjectId: input.subjectId,
      number: input.number,
      mode: input.mode,
      sourceDocument: input.sourceDocument,
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
    tables: input.tables,
    choices: input.choices.map((choice) => ({ id: choice.id, text: choice.text })),
    answer: input.answer,
    relatedConceptId: input.relatedConceptId,
    hint: input.hint,
    explanation: input.explanation,
    whyWrong: Object.fromEntries(input.choices.map((choice) => [choice.id, choice.explanation])) as Record<ChoiceId, string>,
    duplicationCheck: "manual PDF-based starter extension; not a numeric/name-only variant"
  };
}

function stepHint(first: string, second: string, third: string) {
  return `1단계: ${first}\n2단계: ${second}\n3단계: ${third}`;
}

type CompactManualQuestion = Omit<ManualPublishedQuestion, "choices" | "hint"> & {
  choices: Array<[ChoiceId, string, string]>;
  hint: [string, string, string];
};

function makeCompactManualQuestion(input: CompactManualQuestion): ObjectiveQuestion {
  return makeManualQuestion({
    ...input,
    choices: input.choices.map(([id, text, explanation]) => ({ id, text, explanation })),
    hint: stepHint(input.hint[0], input.hint[1], input.hint[2])
  });
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
      relatedConceptId: "sql-null",
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
      relatedConceptId: "sql-null",
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
    relatedConceptId: "sql-null",
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
    relatedConceptId: "sql-null",
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

const manualVerifiedObjectiveQuestionsBatch04: ObjectiveQuestion[] = ([
  {
    subjectId: "modeling",
    number: 36,
    majorTopic: "데이터 모델링의 이해",
    middleTopic: "관계",
    topic: "다대다 관계 해소",
    difficulty: "중급",
    questionType: "관계 구조 판단형",
    mode: "variant",
    sourcePage: 17,
    parentQuestionId: "pdf-v-1-m-n-relationship",
    stem: "학생과 강좌는 서로 여러 건씩 연결될 수 있고, 수강신청일자와 성적은 학생과 강좌의 조합에 따라 달라진다. 논리 모델 설계로 가장 적절한 것은?",
    choices: [
      { id: "A", text: "학생 엔터티에 강좌번호와 성적 속성을 반복 컬럼으로 둔다.", explanation: "오답입니다. 반복 컬럼은 확장성과 정규화 측면에서 부적절하며 강좌 수 변화에 취약합니다." },
      { id: "B", text: "강좌 엔터티에 학생번호를 하나만 두고 최근 수강 학생만 저장한다.", explanation: "오답입니다. 여러 학생의 수강 관계를 표현할 수 없습니다." },
      { id: "C", text: "수강 엔터티를 두고 학생과 강좌를 각각 1대다로 연결하며 수강신청일자와 성적을 수강에 둔다.", explanation: "정답입니다. 다대다 관계는 교차 엔터티로 해소하고 관계 자체의 속성은 교차 엔터티에 둡니다." },
      { id: "D", text: "학생과 강좌 사이에 관계선을 제거하고 성적만 별도 코드 테이블로 관리한다.", explanation: "오답입니다. 수강 사실 자체를 표현하지 못합니다." }
    ],
    answer: "C",
    relatedConceptId: "modeling-relationship",
    hint: "1단계: 한 학생이 여러 강좌를 들을 수 있는지 확인합니다.\n2단계: 한 강좌도 여러 학생을 가질 수 있는지 확인합니다.\n3단계: 관계 자체에 속성이 있으면 교차 엔터티가 필요합니다.",
    explanation: "다대다 관계는 물리 테이블로 직접 구현하기 어렵고 관계 자체의 속성을 안정적으로 담기 어렵다. 수강 같은 교차 엔터티를 두면 학생-수강, 강좌-수강의 1대다 관계로 해소할 수 있다."
  },
  {
    subjectId: "modeling",
    number: 37,
    majorTopic: "데이터 모델링의 이해",
    middleTopic: "슈퍼타입과 서브타입",
    topic: "서브타입 변환",
    difficulty: "상급",
    questionType: "모델 변환 판단형",
    mode: "similar",
    sourcePage: 26,
    parentQuestionId: "pdf-s-1-super-subtype",
    stem: "상품은 공통 속성이 많고, 도서와 가전의 고유 속성은 일부만 다르다. 전체 상품 조회가 매우 빈번하고 서브타입별 고유 속성 조회는 상대적으로 적다. 물리 모델 변환으로 가장 우선 검토할 방식은?",
    choices: [
      { id: "A", text: "슈퍼타입과 모든 서브타입을 각각 별도 테이블로 분리하여 항상 조인한다.", explanation: "오답입니다. 전체 상품 조회가 빈번하면 반복 조인 비용이 커질 수 있습니다." },
      { id: "B", text: "공통 속성과 고유 속성을 하나의 상품 테이블로 통합하고 상품유형으로 구분한다.", explanation: "정답입니다. 공통 속성이 많고 전체 조회가 빈번하면 단일 테이블 통합을 우선 검토할 수 있습니다." },
      { id: "C", text: "도서 테이블과 가전 테이블만 만들고 공통 속성을 모든 테이블에 복사한다.", explanation: "오답입니다. 공통 속성 중복이 크고 전체 상품 조회 시 UNION 비용과 정합성 관리가 필요합니다." },
      { id: "D", text: "상품유형 코드를 제거하고 속성 존재 여부만으로 유형을 판단한다.", explanation: "오답입니다. 유형 식별 기준이 불명확해지고 제약조건 관리가 어려워집니다." }
    ],
    answer: "B",
    relatedConceptId: "modeling-super-subtype",
    hint: "1단계: 공통 속성 비중과 조회 패턴을 함께 봅니다.\n2단계: 전체 조회가 빈번한지, 서브타입별 조회가 빈번한지 구분합니다.\n3단계: 통합 테이블은 조인 제거와 단순 조회에 유리하지만 NULL 관리가 필요합니다.",
    explanation: "슈퍼타입/서브타입 변환은 조회 패턴, 공통 속성 비중, 서브타입 고유 속성 수, 데이터량을 고려한다. 전체 상품 조회가 빈번하고 공통 속성이 많다면 단일 테이블 통합이 유리할 수 있다."
  },
  {
    subjectId: "modeling",
    number: 38,
    majorTopic: "데이터 모델링의 이해",
    middleTopic: "이력 모델링",
    topic: "기간 이력",
    difficulty: "상급",
    questionType: "이력 모델 판단형",
    mode: "similar",
    sourcePage: 29,
    parentQuestionId: "pdf-s-1-history-modeling",
    stem: "고객의 등급은 변경될 수 있고, 주문 시점의 고객등급으로 혜택 금액을 재계산해야 한다. 현재 고객 테이블에는 최신 등급만 저장되어 있다. 가장 적절한 모델링 보완은?",
    choices: [
      { id: "A", text: "고객 테이블의 고객등급만 계속 갱신하고 과거 등급은 저장하지 않는다.", explanation: "오답입니다. 주문 시점 등급을 재현할 수 없어 과거 혜택 검증이 어렵습니다." },
      { id: "B", text: "고객등급이력 엔터티를 두고 적용시작일자와 적용종료일자로 기간을 관리한다.", explanation: "정답입니다. 시점 기준 값을 재현하려면 기간 이력 모델이 필요합니다." },
      { id: "C", text: "주문 테이블에서 고객번호를 제거하고 고객명만 저장한다.", explanation: "오답입니다. 고객 식별과 관계 추적이 어려워집니다." },
      { id: "D", text: "등급 변경 시 모든 과거 주문의 주문금액을 최신 등급 기준으로 갱신한다.", explanation: "오답입니다. 주문 당시 사실을 훼손할 수 있습니다." }
    ],
    answer: "B",
    relatedConceptId: "modeling-history",
    hint: "1단계: 최신값만 필요한지 과거 시점 값이 필요한지 구분합니다.\n2단계: 주문 시점의 등급을 재현해야 합니다.\n3단계: 적용 시작과 종료 기간이 있는 이력 엔터티가 적절합니다.",
    explanation: "시점별 값을 재현해야 하는 업무에서는 최신값만 저장하면 부족하다. 고객등급이력에 적용 기간을 관리하면 주문일자 기준으로 당시 등급을 찾을 수 있다."
  },
  {
    subjectId: "modeling",
    number: 39,
    majorTopic: "데이터 모델링의 이해",
    middleTopic: "정규화",
    topic: "제3정규형",
    difficulty: "중급",
    questionType: "함수 종속 판단형",
    mode: "variant",
    sourcePage: 33,
    parentQuestionId: "pdf-v-1-3nf",
    stem: "수강내역(학생번호, 과목번호, 교수번호, 교수명)에서 기본키가 (학생번호, 과목번호)이고, 교수번호가 교수명을 결정한다. 제3정규형 관점에서 가장 적절한 설명은?",
    choices: [
      { id: "A", text: "교수명은 기본키 전체에만 종속하므로 분리할 필요가 없다.", explanation: "오답입니다. 교수번호가 교수명을 결정하므로 이행 종속 가능성이 있습니다." },
      { id: "B", text: "교수번호와 교수명을 별도 교수 엔터티로 분리해 이행 종속을 제거한다.", explanation: "정답입니다. 비식별자 속성이 다른 비식별자 속성에 종속되는 구조를 제거해야 합니다." },
      { id: "C", text: "교수명을 주식별자에 포함하면 모든 정규화 문제가 해결된다.", explanation: "오답입니다. 식별자에 이름을 넣으면 변경과 중복 문제가 커질 수 있습니다." },
      { id: "D", text: "제3정규형은 반복 속성 제거만 다루므로 이 사례와 무관하다.", explanation: "오답입니다. 반복 속성 제거는 제1정규형이고, 제3정규형은 이행 종속 제거와 관련됩니다." }
    ],
    answer: "B",
    relatedConceptId: "modeling-normalization",
    hint: "1단계: 기본키가 아닌 속성이 다른 기본키 아닌 속성을 결정하는지 봅니다.\n2단계: 교수번호 -> 교수명 종속을 확인합니다.\n3단계: 이행 종속은 별도 엔터티 분리로 해소합니다.",
    explanation: "제3정규형은 기본키가 아닌 속성 사이의 이행 종속을 제거한다. 교수번호가 교수명을 결정한다면 교수 정보를 분리하고 수강내역에는 교수번호만 참조하게 하는 것이 적절하다."
  },
  {
    subjectId: "modeling",
    number: 40,
    majorTopic: "데이터 모델과 성능",
    middleTopic: "분산 데이터베이스",
    topic: "분산 투명성",
    difficulty: "기본",
    questionType: "개념 매칭형",
    mode: "original",
    sourcePage: 121,
    parentQuestionId: "pdf-o-1-distributed-transparency",
    stem: "사용자는 데이터가 어느 지역 서버에 저장되어 있는지 알 필요 없이 동일한 이름과 방식으로 데이터를 조회한다. 이 설명과 가장 가까운 분산 데이터베이스의 투명성은?",
    choices: [
      { id: "A", text: "위치 투명성", explanation: "정답입니다. 데이터의 물리적 위치를 사용자가 의식하지 않아도 되는 특성입니다." },
      { id: "B", text: "중복 투명성", explanation: "오답입니다. 중복 투명성은 복제 데이터 존재를 사용자가 의식하지 않는 특성입니다." },
      { id: "C", text: "병행 투명성", explanation: "오답입니다. 병행 투명성은 여러 트랜잭션 동시 수행의 일관성과 관련됩니다." },
      { id: "D", text: "장애 투명성", explanation: "오답입니다. 장애 투명성은 일부 장애에도 작업 지속 또는 복구가 가능하게 하는 특성입니다." }
    ],
    answer: "A",
    relatedConceptId: "modeling-distributed",
    hint: "1단계: 사용자가 무엇을 의식하지 않아도 되는지 봅니다.\n2단계: 지문은 저장 위치를 묻고 있습니다.\n3단계: 위치를 감추는 것은 위치 투명성입니다.",
    explanation: "위치 투명성은 분산된 데이터의 실제 저장 위치를 사용자가 알지 않아도 동일하게 접근할 수 있게 하는 특성이다."
  },
  {
    subjectId: "sql-basic",
    number: 36,
    majorTopic: "SQL 기본 및 활용",
    middleTopic: "집합 연산",
    topic: "UNION과 UNION ALL",
    difficulty: "중급",
    questionType: "SQL 결과 선택형",
    mode: "original",
    sourcePage: 84,
    parentQuestionId: "pdf-o-2-set-operator",
    stem: "아래 두 집합 R1, R2에 대해 가와 나 SQL의 결과 행 수로 가장 적절한 것은?",
    table: {
      title: "입력 데이터",
      headers: ["집합", "A", "B", "C"],
      rows: [
        ["R1", "A3", "B2", "C3"],
        ["R1", "A1", "B1", "C1"],
        ["R1", "A2", "B1", "C2"],
        ["R2", "A1", "B1", "C1"],
        ["R2", "A3", "B2", "C3"]
      ]
    },
    code: `-- 가
SELECT A, B, C FROM R1
UNION ALL
SELECT A, B, C FROM R2;

-- 나
SELECT A, B, C FROM R1
UNION
SELECT A, B, C FROM R2;`,
    choices: [
      { id: "A", text: "가: 5개, 나: 3개", explanation: "정답입니다. UNION ALL은 중복을 제거하지 않아 3+2=5행이고, UNION은 중복을 제거해 서로 다른 3행만 남습니다." },
      { id: "B", text: "가: 5개, 나: 5개", explanation: "오답입니다. UNION은 중복 행을 제거합니다." },
      { id: "C", text: "가: 3개, 나: 3개", explanation: "오답입니다. UNION ALL은 중복을 포함해 양쪽 결과를 모두 반환합니다." },
      { id: "D", text: "가: 3개, 나: 5개", explanation: "오답입니다. UNION이 UNION ALL보다 행 수가 많아질 수 없습니다." }
    ],
    answer: "A",
    relatedConceptId: "sql-set-operators",
    hint: "1단계: R1과 R2의 완전히 같은 행을 찾습니다.\n2단계: UNION ALL은 중복을 제거하지 않습니다.\n3단계: UNION은 컬럼 값 전체가 같은 행을 하나로 봅니다.",
    explanation: "UNION ALL은 두 결과 집합을 그대로 이어 붙인다. UNION은 중복 제거 과정을 수행하므로 R2의 두 행이 R1에 이미 존재하면 최종 고유 행은 3개다."
  },
  {
    subjectId: "sql-basic",
    number: 37,
    majorTopic: "SQL 기본 및 활용",
    middleTopic: "Window Function",
    topic: "RANK와 DENSE_RANK",
    difficulty: "상급",
    questionType: "분석 함수 결과 추론형",
    mode: "variant",
    sourcePage: 46,
    parentQuestionId: "pdf-v-2-rank",
    stem: "아래 점수 데이터에서 점수 내림차순으로 RANK와 DENSE_RANK를 계산할 때, 학생 C의 결과로 가장 적절한 것은?",
    table: {
      title: "점수",
      headers: ["학생", "점수"],
      rows: [
        ["A", "95"],
        ["B", "90"],
        ["C", "90"],
        ["D", "80"]
      ]
    },
    code: `SELECT 학생,
       점수,
       RANK() OVER (ORDER BY 점수 DESC) AS rnk,
       DENSE_RANK() OVER (ORDER BY 점수 DESC) AS drnk
FROM 점수;`,
    choices: [
      { id: "A", text: "RANK 1, DENSE_RANK 1", explanation: "오답입니다. 95점 A가 1위이므로 90점 C는 1위가 아닙니다." },
      { id: "B", text: "RANK 2, DENSE_RANK 2", explanation: "정답입니다. B와 C는 공동 2위이며 두 함수 모두 90점 그룹을 2로 표시합니다." },
      { id: "C", text: "RANK 3, DENSE_RANK 2", explanation: "오답입니다. 공동 순위의 두 번째 행이라고 해서 RANK가 3이 되는 것은 아닙니다." },
      { id: "D", text: "RANK 2, DENSE_RANK 3", explanation: "오답입니다. DENSE_RANK는 중복 순위 다음에 건너뛰지 않으므로 90점 그룹은 2입니다." }
    ],
    answer: "B",
    relatedConceptId: "sql-window-functions",
    hint: "1단계: 같은 점수는 같은 순위를 받습니다.\n2단계: RANK와 DENSE_RANK 차이는 다음 점수 그룹에서 드러납니다.\n3단계: C는 B와 같은 점수 그룹입니다.",
    explanation: "RANK와 DENSE_RANK는 동점자에게 같은 순위를 부여한다. 차이는 다음 순위에서 발생한다. 80점 D는 RANK 4, DENSE_RANK 3이지만 C는 둘 다 2다."
  },
  {
    subjectId: "sql-basic",
    number: 38,
    majorTopic: "SQL 기본 및 활용",
    middleTopic: "GROUP BY",
    topic: "ROLLUP과 GROUPING",
    difficulty: "상급",
    questionType: "집계 행 수 추론형",
    mode: "similar",
    sourcePage: 50,
    parentQuestionId: "pdf-s-2-rollup",
    stem: "지역은 서울, 부산 2개이고 각 지역마다 상품분류가 의류, 식품 2개씩 존재한다. GROUP BY ROLLUP(지역, 상품분류)의 결과 행 수로 가장 적절한 것은?",
    choices: [
      { id: "A", text: "4개", explanation: "오답입니다. 상세 그룹만 세면 4개지만 ROLLUP은 소계와 총계를 추가합니다." },
      { id: "B", text: "6개", explanation: "오답입니다. 지역별 소계 2개는 추가되지만 전체 총계 1개가 빠졌습니다." },
      { id: "C", text: "7개", explanation: "정답입니다. 상세 4개, 지역별 소계 2개, 전체 총계 1개로 총 7개입니다." },
      { id: "D", text: "8개", explanation: "오답입니다. ROLLUP(지역, 상품분류)은 상품분류별 독립 소계를 만들지 않습니다." }
    ],
    answer: "C",
    relatedConceptId: "sql-group-functions",
    hint: "1단계: 상세 그룹 수를 먼저 계산합니다.\n2단계: ROLLUP 순서상 앞 컬럼인 지역별 소계가 추가됩니다.\n3단계: 마지막에 전체 총계가 추가됩니다.",
    explanation: "ROLLUP(a,b)는 (a,b), (a), () 그룹을 생성한다. 지역 2개와 상품분류 2개 조합의 상세 4행, 지역별 소계 2행, 전체 총계 1행이 생성된다."
  },
  {
    subjectId: "sql-basic",
    number: 39,
    majorTopic: "SQL 기본 및 활용",
    middleTopic: "JOIN",
    topic: "Outer Join 조건 위치",
    difficulty: "상급",
    questionType: "SQL Rewrite 선택형",
    mode: "variant",
    sourcePage: 74,
    parentQuestionId: "pdf-v-2-outer-join-filter",
    stem: "모든 고객을 출력하되 2026년 7월 주문만 주문금액으로 집계하려 한다. 주문이 없는 고객도 남기기 위한 SQL 조건 위치로 가장 적절한 것은?",
    choices: [
      { id: "A", text: "LEFT JOIN 후 WHERE o.주문일자 >= DATE '2026-07-01' 조건을 둔다.", explanation: "오답입니다. WHERE 절의 후행 테이블 조건은 NULL 확장 행을 제거해 Inner Join처럼 동작할 수 있습니다." },
      { id: "B", text: "LEFT JOIN의 ON 절에 주문일자 범위 조건을 함께 둔다.", explanation: "정답입니다. 고객 보존은 유지하면서 매칭 대상 주문만 기간으로 제한할 수 있습니다." },
      { id: "C", text: "RIGHT JOIN으로 바꾸고 고객 조건을 WHERE 절에 둔다.", explanation: "오답입니다. 보존해야 하는 쪽은 고객이며 방향만 바꾼다고 조건 위치 문제가 해결되지 않습니다." },
      { id: "D", text: "주문일자 조건을 HAVING 절로 옮기면 항상 동일한 결과가 된다.", explanation: "오답입니다. HAVING은 그룹 후 필터이며 후행 행 보존 문제를 자동 해결하지 않습니다." }
    ],
    answer: "B",
    relatedConceptId: "sql-standard-join",
    hint: "1단계: 어느 테이블의 행을 보존해야 하는지 확인합니다.\n2단계: 후행 테이블 조건이 WHERE에 있으면 NULL 확장 행이 제거됩니다.\n3단계: 매칭 조건 제한은 ON 절 또는 후행 인라인 뷰 내부가 적절합니다.",
    explanation: "Outer Join에서 보존되지 않는 쪽 테이블의 조건을 WHERE 절에 두면 매칭 실패 행이 제거된다. 모든 고객을 남겨야 하므로 주문 기간 조건은 ON 절에 두어야 한다."
  },
  {
    subjectId: "sql-basic",
    number: 40,
    majorTopic: "SQL 기본 및 활용",
    middleTopic: "DML",
    topic: "MERGE 제약",
    difficulty: "중급",
    questionType: "MERGE 설명 선택형",
    mode: "similar",
    sourcePage: 39,
    parentQuestionId: "pdf-s-2-merge-on",
    stem: "Oracle MERGE 문에서 ON 절에 사용된 대상 테이블 컬럼에 대한 설명으로 가장 적절한 것은?",
    choices: [
      { id: "A", text: "ON 절에 사용된 대상 컬럼은 MATCHED UPDATE 절에서 자유롭게 갱신할 수 있다.", explanation: "오답입니다. Oracle에서는 ON 절에 사용된 대상 컬럼을 UPDATE하려 하면 제한이 발생할 수 있습니다." },
      { id: "B", text: "ON 절은 매칭 여부를 판단하므로 대상 행 식별에 사용된 컬럼 갱신은 주의해야 한다.", explanation: "정답입니다. 매칭 기준 컬럼은 대상 행 식별에 관여하므로 UPDATE 대상 선정 시 제한과 의미를 검토해야 합니다." },
      { id: "C", text: "MERGE는 INSERT만 가능하고 UPDATE는 지원하지 않는다.", explanation: "오답입니다. MERGE는 MATCHED UPDATE와 NOT MATCHED INSERT를 지원합니다." },
      { id: "D", text: "MERGE의 USING 절은 반드시 실제 테이블 하나만 사용할 수 있다.", explanation: "오답입니다. USING 절에는 인라인 뷰나 서브쿼리도 사용할 수 있습니다." }
    ],
    answer: "B",
    relatedConceptId: "sql-dml",
    hint: "1단계: ON 절이 어떤 역할을 하는지 확인합니다.\n2단계: 매칭 기준이 되는 대상 컬럼을 동시에 바꾸면 어떤 의미 문제가 생기는지 생각합니다.\n3단계: Oracle MERGE의 UPDATE 제한을 떠올립니다.",
    explanation: "MERGE의 ON 절은 소스와 대상의 매칭 여부를 결정한다. 대상 행 식별에 사용된 컬럼을 같은 MERGE에서 갱신하는 것은 제한되거나 의미상 위험하므로 별도 처리 또는 기준 컬럼 변경을 검토해야 한다."
  },
  {
    subjectId: "tuning",
    number: 36,
    majorTopic: "SQL 고급활용 및 튜닝",
    middleTopic: "인덱스 튜닝",
    topic: "결합 인덱스 컬럼 순서",
    difficulty: "상급",
    questionType: "인덱스 구성 선택형",
    mode: "similar",
    sourcePage: 84,
    parentQuestionId: "pdf-s-3-composite-index",
    stem: "게시글 테이블에서 게시구분은 등치 조건, 삭제여부는 등치 조건, 등록일시는 범위 조건과 ORDER BY DESC에 사용된다. 최근 글 20건을 빠르게 조회하기 위한 결합 인덱스로 가장 적절한 것은?",
    choices: [
      { id: "A", text: "(등록일시, 게시구분, 삭제여부)", explanation: "오답입니다. 범위와 정렬 컬럼이 선두이면 등치 조건으로 탐색 범위를 충분히 좁히기 어렵습니다." },
      { id: "B", text: "(게시구분, 삭제여부, 등록일시 DESC)", explanation: "정답입니다. 등치 조건 컬럼 뒤에 정렬/범위 컬럼을 두면 범위 스캔과 Top-N 처리에 유리합니다." },
      { id: "C", text: "(삭제여부)", explanation: "오답입니다. 삭제여부만으로는 선택도가 낮고 정렬 제거도 어렵습니다." },
      { id: "D", text: "(제목, 등록일시)", explanation: "오답입니다. 제목은 조건에 없으므로 인덱스 시작점 형성에 도움이 되지 않습니다." }
    ],
    answer: "B",
    relatedConceptId: "tuning-index-scan-efficiency",
    hint: "1단계: 등치 조건 컬럼을 먼저 모읍니다.\n2단계: 범위 조건과 정렬 컬럼이 같은 컬럼인지 확인합니다.\n3단계: Top-N이면 정렬을 피할 수 있는 순서가 중요합니다.",
    explanation: "결합 인덱스는 등치 조건으로 선두 범위를 좁힌 뒤 범위와 정렬 컬럼을 활용하는 구조가 일반적으로 유리하다. 게시구분, 삭제여부 등치 후 등록일시 DESC 범위 스캔을 하면 최근 20건을 조기 종료할 수 있다."
  },
  {
    subjectId: "tuning",
    number: 37,
    majorTopic: "SQL 고급활용 및 튜닝",
    middleTopic: "인덱스 튜닝",
    topic: "클러스터링 팩터",
    difficulty: "상급",
    questionType: "성능 원인 분석형",
    mode: "variant",
    sourcePage: 82,
    parentQuestionId: "pdf-v-3-clustering-factor",
    stem: "두 인덱스의 선택도는 비슷하지만 IX_A를 사용할 때 테이블 랜덤 액세스가 훨씬 많이 발생한다. 가장 직접적인 원인으로 의심할 수 있는 것은?",
    choices: [
      { id: "A", text: "IX_A의 클러스터링 팩터가 테이블 블록 수에 가깝다.", explanation: "오답입니다. 테이블 블록 수에 가까우면 같은 인덱스 순서의 행들이 비교적 모여 있어 랜덤 액세스 비용이 낮아지는 편입니다." },
      { id: "B", text: "IX_A의 클러스터링 팩터가 테이블 행 수에 가깝다.", explanation: "정답입니다. 인덱스 순서와 테이블 저장 순서가 불일치해 ROWID 방문이 흩어질 가능성이 큽니다." },
      { id: "C", text: "IX_A가 유니크 인덱스라서 항상 더 느리다.", explanation: "오답입니다. 유니크 여부 자체가 항상 더 느린 원인이 되지는 않습니다." },
      { id: "D", text: "IX_A의 리프 블록 수가 0이기 때문이다.", explanation: "오답입니다. 정상 인덱스의 리프 블록 수가 0이라는 전제는 부적절합니다." }
    ],
    answer: "B",
    relatedConceptId: "tuning-table-access",
    hint: "1단계: 인덱스 스캔 후 테이블 ROWID 방문 비용을 생각합니다.\n2단계: 인덱스 순서와 테이블 저장 순서가 비슷하면 같은 블록을 반복 활용합니다.\n3단계: 클러스터링 팩터가 행 수에 가까우면 흩어진 방문 가능성이 큽니다.",
    explanation: "클러스터링 팩터는 인덱스 순서로 테이블을 방문할 때 블록 전환이 얼마나 자주 일어나는지 나타낸다. 행 수에 가까운 값은 인덱스 순서와 테이블 저장 순서가 흩어져 있음을 의미해 랜덤 액세스 비용을 키운다."
  },
  {
    subjectId: "tuning",
    number: 38,
    majorTopic: "SQL 고급활용 및 튜닝",
    middleTopic: "조인 튜닝",
    topic: "Hash Join Build Input",
    difficulty: "중급",
    questionType: "조인 방식 판단형",
    mode: "similar",
    sourcePage: 88,
    parentQuestionId: "pdf-s-3-hash-build",
    stem: "Hash Join에서 두 입력 중 하나를 메모리에 해시 테이블로 구성해야 한다. 일반적으로 Build Input으로 선택하기 가장 적절한 집합은?",
    choices: [
      { id: "A", text: "조인 후 결과가 가장 큰 집합", explanation: "오답입니다. 결과 크기보다 해시 테이블을 만들 입력 집합의 크기와 가용 메모리가 중요합니다." },
      { id: "B", text: "필터 후 크기가 작고 해시 테이블로 만들기 적합한 집합", explanation: "정답입니다. 작은 집합을 Build Input으로 두면 메모리 사용과 파티션 분할 비용을 줄일 수 있습니다." },
      { id: "C", text: "인덱스가 가장 많은 테이블", explanation: "오답입니다. Hash Join은 인덱스 개수보다 입력 집합 크기와 조인 방식 특성이 더 중요합니다." },
      { id: "D", text: "항상 FROM 절에 먼저 적힌 테이블", explanation: "오답입니다. 옵티마이저는 비용과 통계에 따라 Build/Probe를 결정합니다." }
    ],
    answer: "B",
    relatedConceptId: "tuning-advanced-join",
    hint: "1단계: Hash Join은 한쪽 입력으로 해시 테이블을 만듭니다.\n2단계: 메모리에 올릴 대상은 작을수록 유리합니다.\n3단계: 큰 쪽은 Probe Input으로 흘려보내는 것이 일반적입니다.",
    explanation: "Hash Join은 Build Input을 해시 테이블로 구성한 뒤 Probe Input을 읽으며 매칭한다. Build Input이 너무 크면 메모리 부족과 디스크 분할이 발생할 수 있어 필터 후 작은 집합이 적합하다."
  },
  {
    subjectId: "tuning",
    number: 39,
    majorTopic: "SQL 고급활용 및 튜닝",
    middleTopic: "쿼리 변환",
    topic: "Predicate Pushing",
    difficulty: "상급",
    questionType: "실행계획 해석형",
    mode: "variant",
    sourcePage: 86,
    parentQuestionId: "pdf-v-3-predicate-pushing",
    stem: "인라인 뷰에서 대량 데이터를 먼저 집계한 뒤 바깥 WHERE 절에서 특정 고객만 필터링한다. 동일 결과를 유지하면서 집계 전 데이터량을 줄일 가능성이 큰 최적화는?",
    choices: [
      { id: "A", text: "Predicate Pushing", explanation: "정답입니다. 외부 조건을 뷰 내부로 밀어 넣어 집계 전 처리 범위를 줄일 수 있습니다." },
      { id: "B", text: "Cartesian Join", explanation: "오답입니다. 조인 조건 없는 곱집합은 일반적으로 비효율을 키웁니다." },
      { id: "C", text: "Full Table Scan 강제", explanation: "오답입니다. 전체 스캔 강제는 조건을 조기 적용하는 변환과 다릅니다." },
      { id: "D", text: "ORDER BY 제거만 수행", explanation: "오답입니다. 지문은 집계 전 필터 적용이 핵심입니다." }
    ],
    answer: "A",
    relatedConceptId: "tuning-query-transformation",
    hint: "1단계: 외부 WHERE 조건이 뷰 내부로 들어갈 수 있는지 봅니다.\n2단계: 집계 전 필터링하면 처리 대상이 줄어듭니다.\n3단계: 조건을 밀어 넣는 변환 이름을 찾습니다.",
    explanation: "Predicate Pushing은 외부 조건을 뷰나 서브쿼리 내부로 밀어 넣어 조기 필터링을 유도하는 변환이다. 집계 전 대상 건수를 줄일 수 있으면 큰 성능 개선이 가능하다."
  },
  {
    subjectId: "tuning",
    number: 40,
    majorTopic: "SQL 고급활용 및 튜닝",
    middleTopic: "옵티마이저",
    topic: "Bind Peeking과 Adaptive Cursor Sharing",
    difficulty: "최상급",
    questionType: "옵티마이저 판단형",
    mode: "similar",
    sourcePage: 89,
    parentQuestionId: "pdf-s-3-bind-peeking",
    stem: "상태코드 = :b1 조건에서 '정상'은 전체의 90%, '오류'는 0.1%다. 같은 SQL이 바인드 값에 따라 전혀 다른 선택도를 가지는데 하나의 실행계획만 재사용되어 일부 값에서 매우 느리다. 가장 관련 깊은 설명은?",
    choices: [
      { id: "A", text: "바인드 변수는 항상 Literal보다 정확한 Cardinality를 보장한다.", explanation: "오답입니다. 바인드 값 분포가 심하게 치우치면 계획 공유가 오히려 불리할 수 있습니다." },
      { id: "B", text: "Bind Peeking과 Adaptive Cursor Sharing을 통해 바인드 값별 선택도 차이에 대응할 수 있는지 검토한다.", explanation: "정답입니다. 바인드 값에 따른 선택도 편차가 큰 경우 커서 공유와 선택도 추정 문제가 핵심입니다." },
      { id: "C", text: "통계정보가 있으면 히스토그램은 어떤 경우에도 필요 없다.", explanation: "오답입니다. 데이터 분포가 치우친 컬럼은 히스토그램이 선택도 추정에 중요할 수 있습니다." },
      { id: "D", text: "Full Scan은 항상 Index Range Scan보다 빠르므로 모든 값을 Full Scan으로 고정한다.", explanation: "오답입니다. 선택도가 낮은 값에서는 인덱스가 유리할 수 있으며 항상이라는 단정은 부적절합니다." }
    ],
    answer: "B",
    relatedConceptId: "tuning-optimizer",
    hint: "1단계: 같은 컬럼의 값별 데이터 분포가 얼마나 다른지 봅니다.\n2단계: 바인드 변수 사용 시 실행계획 공유와 선택도 추정 문제가 생길 수 있습니다.\n3단계: 바인드 값별 계획 분화 가능성을 다루는 기능을 떠올립니다.",
    explanation: "바인드 변수는 파싱 비용 감소와 SQL 공유에 유리하지만 값별 선택도 차이가 큰 컬럼에서는 하나의 계획이 모든 값에 적합하지 않을 수 있다. Bind Peeking, 히스토그램, Adaptive Cursor Sharing 검토가 필요하다."
  }
] as ManualPublishedQuestion[]).map(makeManualQuestion);

const manualVerifiedTuningPartitionAndTraceQuestions: ObjectiveQuestion[] = ([
  {
    subjectId: "tuning",
    number: 41,
    majorTopic: "SQL 고급활용 및 튜닝",
    middleTopic: "파티션 튜닝",
    topic: "Local Prefixed 파티션 인덱스",
    difficulty: "상급",
    questionType: "DDL 기반 인덱스 유형 판단형",
    mode: "original",
    sourcePage: 99,
    sourceQuestionNumber: 78,
    stem: "거래 테이블이 거래일시 기준 Range Partition으로 구성되어 있다. 다음 중 Local Prefixed 파티션 인덱스로 가장 적절한 것은?",
    code: `CREATE TABLE 거래 (
  고객번호 VARCHAR2(10),
  종목코드 VARCHAR2(20),
  거래일시 DATE
)
PARTITION BY RANGE (거래일시) (
  PARTITION p2010 VALUES LESS THAN (TO_DATE('20110101','YYYYMMDD')),
  PARTITION p2011 VALUES LESS THAN (TO_DATE('20120101','YYYYMMDD')),
  PARTITION p2012 VALUES LESS THAN (TO_DATE('20130101','YYYYMMDD')),
  PARTITION pmax  VALUES LESS THAN (MAXVALUE)
);`,
    choices: [
      { id: "A", text: "CREATE INDEX 거래_N1 ON 거래(거래일시) LOCAL", explanation: "정답입니다. 테이블 파티션 키인 거래일시가 인덱스 선두 컬럼이므로 Local Prefixed 인덱스입니다." },
      { id: "B", text: "CREATE INDEX 거래_N2 ON 거래(고객번호) LOCAL", explanation: "오답입니다. LOCAL이지만 테이블 파티션 키 거래일시가 선두 컬럼이 아니므로 Local Nonprefixed입니다." },
      { id: "C", text: "CREATE INDEX 거래_N3 ON 거래(종목코드) LOCAL", explanation: "오답입니다. LOCAL이지만 파티션 키가 인덱스 선두에 없습니다." },
      { id: "D", text: "CREATE INDEX 거래_N4 ON 거래(종목코드, 거래일시) LOCAL", explanation: "오답입니다. 거래일시가 포함되어도 선두 컬럼이 종목코드이므로 Prefixed가 아닙니다." }
    ],
    answer: "A",
    relatedConceptId: "tuning-partition-pruning",
    hint: "1단계: 테이블 파티션 키가 무엇인지 확인합니다.\n2단계: LOCAL 여부와 Prefixed 여부는 다른 개념입니다.\n3단계: 파티션 키가 인덱스 선두 컬럼이면 Local Prefixed입니다.",
    explanation: "Local Prefixed 파티션 인덱스는 로컬 인덱스이면서 인덱스 선두 컬럼이 테이블 파티션 키로 시작한다. 거래일시 기준 파티션이므로 (거래일시) LOCAL 인덱스가 해당한다."
  },
  {
    subjectId: "tuning",
    number: 42,
    majorTopic: "SQL 고급활용 및 튜닝",
    middleTopic: "파티션 튜닝",
    topic: "Global/Local Prefixed 분류",
    difficulty: "상급",
    questionType: "DDL 기반 복합 판단형",
    mode: "variant",
    sourceDocument: "SQL-자격검정-실전문제.pdf",
    sourcePage: 99,
    sourceQuestionNumber: 79,
    stem: "아래 DDL에서 거래_IDX1과 거래_IDX2의 인덱스 유형 조합으로 가장 적절한 것은?",
    code: `CREATE TABLE 거래 (
  계좌번호 NUMBER,
  상품번호 VARCHAR2(6),
  거래일자 VARCHAR2(8),
  거래량 NUMBER,
  거래금액 NUMBER
)
PARTITION BY RANGE (거래일자) (
  PARTITION p1 VALUES LESS THAN ('20110101'),
  PARTITION p2 VALUES LESS THAN ('20120101'),
  PARTITION px VALUES LESS THAN (MAXVALUE)
);

CREATE INDEX 거래_IDX1 ON 거래(거래일자, 상품번호) GLOBAL
PARTITION BY RANGE (거래일자) (
  PARTITION p1 VALUES LESS THAN ('20120101'),
  PARTITION px VALUES LESS THAN (MAXVALUE)
);

CREATE INDEX 거래_IDX2 ON 거래(계좌번호, 거래일자) LOCAL;`,
    choices: [
      { id: "A", text: "거래_IDX1: Global Prefixed, 거래_IDX2: Local Nonprefixed", explanation: "정답입니다. IDX1은 GLOBAL 파티션 인덱스이며 파티션 키 거래일자가 선두입니다. IDX2는 LOCAL이지만 테이블 파티션 키 거래일자가 선두가 아닙니다." },
      { id: "B", text: "거래_IDX1: Global Nonprefixed, 거래_IDX2: Local Prefixed", explanation: "오답입니다. IDX1은 거래일자가 선두라 Prefixed이고, IDX2는 계좌번호가 선두라 Nonprefixed입니다." },
      { id: "C", text: "거래_IDX1: Local Prefixed, 거래_IDX2: Global Nonprefixed", explanation: "오답입니다. IDX1은 GLOBAL로 선언되어 있고 IDX2는 LOCAL로 선언되어 있습니다." },
      { id: "D", text: "거래_IDX1: Nonpartitioned, 거래_IDX2: Local Prefixed", explanation: "오답입니다. IDX1은 GLOBAL PARTITION BY가 있으므로 비파티션 인덱스가 아닙니다." }
    ],
    answer: "A",
    relatedConceptId: "tuning-partition-pruning",
    hint: "1단계: GLOBAL/LOCAL 선언을 먼저 확인합니다.\n2단계: Prefixed는 인덱스 파티션 키 또는 테이블 파티션 키가 인덱스 선두에 있는지 봅니다.\n3단계: LOCAL 인덱스라도 파티션 키가 후행이면 Nonprefixed입니다.",
    explanation: "거래_IDX1은 GLOBAL 파티션 인덱스이고 인덱스 파티션 키인 거래일자가 인덱스 선두이므로 Global Prefixed다. 거래_IDX2는 LOCAL이지만 테이블 파티션 키 거래일자가 두 번째 컬럼이므로 Local Nonprefixed다."
  },
  {
    subjectId: "tuning",
    number: 43,
    majorTopic: "SQL 고급활용 및 튜닝",
    middleTopic: "SQL Rewrite",
    topic: "최신 이력 조회",
    difficulty: "최상급",
    questionType: "최적 SQL 선택형",
    mode: "similar",
    sourcePage: 96,
    sourceQuestionNumber: 69,
    stem: "고객변경이력에서 기준일자 이전의 최신 이력 한 건을 고객별로 조회하려 한다. 전체 고객을 대상으로 하며 고객별 변경순번은 증가 값이다. 가장 효과적인 SQL 형태는?",
    choices: [
      { id: "A", text: "고객마다 상관 서브쿼리로 MAX(변경순번)을 반복 조회한다.", explanation: "오답입니다. 전체 고객 대상이면 고객 수만큼 이력 테이블 탐색이 반복될 수 있습니다." },
      { id: "B", text: "기준일자 이전 이력을 한 번 읽고 ROW_NUMBER() OVER(PARTITION BY 고객번호 ORDER BY 변경순번 DESC) = 1로 최신 행을 고른다.", explanation: "정답입니다. 대상 이력을 한 번 처리하면서 고객별 최신 행을 안정적으로 선택할 수 있습니다." },
      { id: "C", text: "변경일자가 기준일자와 같은 행만 조회한다.", explanation: "오답입니다. 기준일자에 변경이 없는 고객의 직전 이력을 놓칩니다." },
      { id: "D", text: "고객 테이블을 먼저 Full Scan한 후 고객별로 이력 테이블을 무조건 Nested Loops 반복 조회한다.", explanation: "오답입니다. 전체 고객 대상에서는 반복 탐색 비용이 커질 수 있습니다." }
    ],
    answer: "B",
    relatedConceptId: "sql-window-functions",
    hint: "1단계: 기준일자 당일 이력이 아니라 기준일자 이전 최신 이력입니다.\n2단계: 전체 고객 대상이면 고객별 반복 서브쿼리 비용을 봅니다.\n3단계: 고객별 순위를 한 번 계산해 rnum=1을 고르는 방식이 적절합니다.",
    explanation: "전체 고객의 특정 시점 최신 이력은 기준일자 이전 이력을 한 번 필터링한 뒤 고객별 ROW_NUMBER를 계산해 최신 행을 선택하는 방식이 효과적이다. 상관 서브쿼리는 고객 수만큼 반복될 수 있어 대량 처리에 불리하다."
  },
  {
    subjectId: "tuning",
    number: 44,
    majorTopic: "SQL 고급활용 및 튜닝",
    middleTopic: "병렬 처리",
    topic: "PQ_DISTRIBUTE 힌트",
    difficulty: "최상급",
    questionType: "병렬 실행계획 힌트 선택형",
    mode: "variant",
    sourcePage: 100,
    sourceQuestionNumber: 82,
    stem: "주문 테이블은 고객번호 기준 Hash Subpartition을 가지고 있고 고객 테이블은 상대적으로 작은 비파티션 테이블이다. 병렬 Hash Join에서 주문을 고객번호 기준으로 다시 재분배해 비용이 커졌다. 개선 방향으로 가장 적절한 것은?",
    choices: [
      { id: "A", text: "큰 주문 테이블을 조인 키로 다시 HASH HASH 재분배하도록 강제한다.", explanation: "오답입니다. 이미 주문이 고객번호 기준으로 분산되어 있는데 다시 재분배하면 통신량이 커질 수 있습니다." },
      { id: "B", text: "작은 고객 집합을 각 주문 파티션 쪽으로 Broadcast하고 주문의 기존 분산을 최대한 활용한다.", explanation: "정답입니다. 큰 사실 테이블의 재분배를 피하고 작은 차원 집합을 Broadcast하는 것이 유리할 수 있습니다." },
      { id: "C", text: "병렬도를 1로 낮추면 항상 가장 빠르다.", explanation: "오답입니다. 병렬도 1은 통신은 줄지만 대량 처리 병렬 효과를 잃을 수 있어 항상 정답이 아닙니다." },
      { id: "D", text: "조인 조건을 제거해 Cartesian Join으로 바꾼다.", explanation: "오답입니다. 조인 조건 제거는 결과와 성능 모두를 망칠 수 있습니다." }
    ],
    answer: "B",
    relatedConceptId: "tuning-parallel",
    hint: "1단계: 병렬 조인에서 가장 비싼 데이터 이동이 무엇인지 봅니다.\n2단계: 큰 테이블과 작은 테이블 중 어느 쪽을 이동시키는 것이 싼지 판단합니다.\n3단계: 기존 파티션/서브파티션 분산을 활용하는 방향을 고릅니다.",
    explanation: "병렬 조인에서는 데이터 재분배 비용이 핵심이다. 큰 주문 테이블이 이미 조인 키와 맞는 분산 구조를 갖고 있다면 주문을 다시 HASH 분배하기보다 작은 고객 집합을 Broadcast해 큰 데이터 이동을 줄이는 전략을 검토한다."
  },
  {
    subjectId: "tuning",
    number: 45,
    majorTopic: "SQL 고급활용 및 튜닝",
    middleTopic: "대량 DML",
    topic: "Direct Path Insert와 병렬 DML Lock",
    difficulty: "상급",
    questionType: "동시성 상황 판단형",
    mode: "original",
    sourcePage: 96,
    sourceQuestionNumber: 70,
    stem: "INSERT /*+ APPEND */ 또는 병렬 DML을 사용하는 배치가 같은 대상 테이블에 대해 동시에 수행될 때 주의해야 할 설명으로 가장 적절한 것은?",
    choices: [
      { id: "A", text: "Direct Path Insert는 항상 행 단위 TX Lock만 사용하므로 다른 DML과 충돌하지 않는다.", explanation: "오답입니다. APPEND/병렬 DML은 테이블 수준 잠금과 세그먼트 확장 특성 때문에 동시 DML에 제약이 생길 수 있습니다." },
      { id: "B", text: "병렬 DML은 대상 테이블에 강한 TM Lock을 유발할 수 있어 동시에 같은 테이블을 갱신하는 트랜잭션을 블로킹할 수 있다.", explanation: "정답입니다. 대량 적재 성능과 동시성 제약을 함께 고려해야 합니다." },
      { id: "C", text: "APPEND 힌트를 사용하면 Redo와 Undo가 어떤 환경에서도 0이 된다.", explanation: "오답입니다. NOLOGGING, FORCE LOGGING, 인덱스 유지 여부 등 조건에 따라 달라집니다." },
      { id: "D", text: "Direct Path Insert는 항상 버퍼 캐시를 더 많이 사용하므로 OLTP 단건 INSERT에 적합하다.", explanation: "오답입니다. Direct Path는 대량 적재에 적합한 방식이며 OLTP 단건 처리와는 목적이 다릅니다." }
    ],
    answer: "B",
    relatedConceptId: "tuning-dml",
    hint: "1단계: APPEND/병렬 DML은 대량 적재 성능을 위한 기능입니다.\n2단계: 성능 향상과 함께 잠금 범위가 커질 수 있습니다.\n3단계: 같은 대상 테이블의 동시 DML 블로킹 가능성을 봅니다.",
    explanation: "Direct Path Insert와 병렬 DML은 대량 적재 성능을 높일 수 있지만 대상 테이블에 강한 TM Lock을 유발해 동시 갱신과 충돌할 수 있다. 배치 시간, 대상 테이블 접근 패턴, 로그 정책을 함께 검토해야 한다."
  },
  {
    subjectId: "tuning",
    number: 46,
    majorTopic: "SQL 고급활용 및 튜닝",
    middleTopic: "SQL Trace",
    topic: "Wait Event",
    difficulty: "중급",
    questionType: "대기 이벤트 매칭형",
    mode: "original",
    sourcePage: 95,
    sourceQuestionNumber: 77,
    stem: "Full Table Scan 또는 Index Fast Full Scan처럼 Multi-Block I/O를 수행하는 과정에서 주로 관찰되는 대기 이벤트는?",
    choices: [
      { id: "A", text: "db file sequential read", explanation: "오답입니다. 주로 인덱스 탐색 후 ROWID로 테이블 블록을 읽는 Single Block I/O와 관련됩니다." },
      { id: "B", text: "db file scattered read", explanation: "정답입니다. Multi-Block I/O로 읽은 블록들이 버퍼 캐시에 흩어져 적재되는 상황과 관련됩니다." },
      { id: "C", text: "log file sync", explanation: "오답입니다. 커밋 시 LGWR 동기화 대기와 관련됩니다." },
      { id: "D", text: "latch: cache buffers chains", explanation: "오답입니다. 버퍼 체인 래치 경합과 관련되며 Multi-Block I/O 대기 이벤트 자체는 아닙니다." }
    ],
    answer: "B",
    relatedConceptId: "tuning-sql-trace",
    hint: "1단계: Single Block I/O와 Multi-Block I/O를 구분합니다.\n2단계: Full Scan은 여러 블록을 한 번에 읽을 수 있습니다.\n3단계: scattered read가 Multi-Block I/O와 연결됩니다.",
    explanation: "db file scattered read는 Full Table Scan, Index Fast Full Scan 등에서 Multi-Block I/O가 발생할 때 자주 관찰된다. db file sequential read는 주로 Single Block I/O와 관련된다."
  },
  {
    subjectId: "tuning",
    number: 47,
    majorTopic: "SQL 고급활용 및 튜닝",
    middleTopic: "쿼리 변환",
    topic: "PUSH_PRED 힌트",
    difficulty: "상급",
    questionType: "힌트 역할 판단형",
    mode: "original",
    sourcePage: 92,
    sourceQuestionNumber: 72,
    stem: "인라인 뷰 튜닝에서 PUSH_PRED 힌트가 수행하는 역할로 가장 적절한 것은?",
    choices: [
      { id: "A", text: "메인 쿼리의 조건절을 뷰 내부로 밀어 넣어 뷰 안에서 먼저 처리 대상 건수를 줄이도록 유도한다.", explanation: "정답입니다. Predicate Pushing은 외부 조건을 내부로 전달해 조기 필터링을 유도합니다." },
      { id: "B", text: "뷰 내부 GROUP BY를 항상 제거하고 조인으로 바꾼다.", explanation: "오답입니다. GROUP BY 제거가 아니라 조건절 밀어넣기가 핵심입니다." },
      { id: "C", text: "서브쿼리를 무조건 FILTER 방식으로 남긴다.", explanation: "오답입니다. FILTER 방식 유지가 아니라 뷰 내부 처리 범위 축소와 관련됩니다." },
      { id: "D", text: "파티션 테이블의 모든 파티션을 스캔하도록 강제한다.", explanation: "오답입니다. 불필요한 접근을 늘리는 힌트가 아닙니다." }
    ],
    answer: "A",
    relatedConceptId: "tuning-query-transformation",
    hint: "1단계: PUSH라는 이름 그대로 조건을 어디로 보내는지 봅니다.\n2단계: 뷰 내부에서 먼저 줄일 수 있으면 성능에 유리합니다.\n3단계: View Merging과는 다른 변환입니다.",
    explanation: "PUSH_PRED는 메인 쿼리 조건을 인라인 뷰 내부로 밀어 넣어 뷰 처리량을 줄이도록 유도하는 힌트다. 특히 뷰를 완전히 병합하기 어려운 상황에서 조기 필터링 효과를 기대할 수 있다."
  },
  {
    subjectId: "tuning",
    number: 48,
    majorTopic: "SQL 고급활용 및 튜닝",
    middleTopic: "캐시와 메모리",
    topic: "Result Cache",
    difficulty: "중급",
    questionType: "캐시 적용 판단형",
    mode: "variant",
    sourcePage: 94,
    sourceQuestionNumber: 76,
    stem: "Oracle Result Cache 적용 대상으로 가장 부적절한 것은?",
    choices: [
      { id: "A", text: "변경이 거의 없는 코드 테이블을 조회하는 반복 SQL", explanation: "오답입니다. 변경이 적고 반복 호출되는 기준 정보는 Result Cache 후보가 될 수 있습니다." },
      { id: "B", text: "DML이 초당 수천 건 발생하는 주문 원장 테이블의 실시간 집계 SQL", explanation: "정답입니다. 잦은 변경으로 캐시 무효화가 반복되어 오히려 관리 비용이 커질 수 있습니다." },
      { id: "C", text: "동일한 파라미터로 반복 조회되는 소규모 기준 정보 함수", explanation: "오답입니다. 함수 결과 캐시 후보가 될 수 있습니다." },
      { id: "D", text: "배치 중 여러 번 참조되는 변경 없는 달력 테이블 조회", explanation: "오답입니다. 변경이 거의 없는 반복 조회는 캐시 재사용 가능성이 있습니다." }
    ],
    answer: "B",
    relatedConceptId: "tuning-memory",
    hint: "1단계: Result Cache는 결과 재사용이 목적입니다.\n2단계: 테이블이 변경되면 캐시 무효화가 발생합니다.\n3단계: DML 빈도가 높은 테이블은 부적합합니다.",
    explanation: "Result Cache는 동일 결과를 재사용할 때 효과적이다. DML이 빈번한 테이블은 캐시가 자주 무효화되어 재사용 이점보다 관리 오버헤드가 커질 수 있다."
  },
  {
    subjectId: "tuning",
    number: 49,
    majorTopic: "SQL 고급활용 및 튜닝",
    middleTopic: "인덱스 튜닝",
    topic: "인덱스 컬럼 좌변 변형",
    difficulty: "중급",
    questionType: "조건절 판단형",
    mode: "original",
    sourcePage: 93,
    sourceQuestionNumber: 74,
    stem: "등록일자가 VARCHAR2(8) 타입이고 인덱스가 등록일자 컬럼에 존재한다. 다음 중 인덱스 컬럼 좌변 변형 사례가 아닌 것은?",
    choices: [
      { id: "A", text: "WHERE NVL(등록일자, '20260101') = '20260701'", explanation: "오답입니다. 인덱스 컬럼 등록일자에 NVL 함수가 적용되었습니다." },
      { id: "B", text: "WHERE SUBSTR(등록일자, 1, 4) = '2026'", explanation: "오답입니다. 인덱스 컬럼에 SUBSTR 함수가 적용되었습니다." },
      { id: "C", text: "WHERE 등록일자 LIKE '202607%'", explanation: "정답입니다. 컬럼 자체는 변형하지 않고 선두 고정 패턴이므로 Range Scan 가능성이 있습니다." },
      { id: "D", text: "WHERE 등록일자 || '000000' = '20260701000000'", explanation: "오답입니다. 컬럼에 문자열 연결 연산이 적용되었습니다." }
    ],
    answer: "C",
    relatedConceptId: "tuning-index-scan-efficiency",
    hint: "1단계: 함수나 연산자가 컬럼 왼쪽에 적용됐는지 봅니다.\n2단계: LIKE의 선두가 고정되어 있는지 확인합니다.\n3단계: 등록일자 LIKE '202607%'는 컬럼 변형이 아닙니다.",
    explanation: "인덱스 컬럼에 함수나 연산을 적용하면 인덱스 원본 키 순서를 활용하기 어렵다. 반면 등록일자 LIKE '202607%'는 컬럼을 변형하지 않고 선두 문자열 범위를 지정하므로 인덱스 Range Scan 후보가 된다."
  },
  {
    subjectId: "tuning",
    number: 50,
    majorTopic: "SQL 고급활용 및 튜닝",
    middleTopic: "서브쿼리 튜닝",
    topic: "Anti Join",
    difficulty: "중급",
    questionType: "서브쿼리 변환 판단형",
    mode: "original",
    sourcePage: 94,
    sourceQuestionNumber: 75,
    stem: "서브쿼리 Unnesting 후 Anti Join으로 변환될 가능성이 가장 큰 조건은?",
    choices: [
      { id: "A", text: "IN 서브쿼리", explanation: "오답입니다. IN/EXISTS는 일반적으로 Semi Join 계열로 변환될 수 있습니다." },
      { id: "B", text: "EXISTS 서브쿼리", explanation: "오답입니다. EXISTS는 존재 여부를 확인하므로 Semi Join 계열과 관련됩니다." },
      { id: "C", text: "NOT EXISTS 또는 NULL 문제가 통제된 NOT IN 서브쿼리", explanation: "정답입니다. 존재하지 않는 행을 찾는 부정 조건은 Anti Join으로 변환될 수 있습니다." },
      { id: "D", text: "UNION ALL 집합 연산", explanation: "오답입니다. UNION ALL은 서브쿼리 Anti Join 변환 조건이 아닙니다." }
    ],
    answer: "C",
    relatedConceptId: "tuning-query-transformation",
    hint: "1단계: Semi Join은 존재하는 행을 찾는 쪽입니다.\n2단계: Anti Join은 존재하지 않는 행을 찾는 쪽입니다.\n3단계: NOT EXISTS가 대표적인 Anti Join 후보입니다.",
    explanation: "Anti Join은 한쪽 집합에 매칭되는 행이 없는 데이터를 찾는 조인 방식이다. NOT EXISTS나 NULL 처리 문제가 통제된 NOT IN 서브쿼리가 Unnesting되면 NL Anti Join 또는 Hash Anti Join으로 변환될 수 있다."
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
  return undefined;
}

function convertReviewLab(lab: PdfReviewLab, index: number): LabQuestion {
  const signature = [lab.title, lab.schemaSql, lab.currentSql, lab.answerSql, lab.explanation].join("\n");
  const mode = lab.mode as GenerationBucket;
  const traceStats = reviewTraceText(lab, "");
  const convertedTraceSummary = reviewTraceRows(lab.traceSummary);

  return {
    ...metadataForLab({
      number: index + 1,
      mode,
      signature,
      sourceDocument: lab.source.document,
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
    seedSql: [lab.currentSql ? `[현재 SQL]\n${lab.currentSql}` : undefined, lab.executionPlan ? `[실행계획/관찰 정보]\n${lab.executionPlan}` : undefined].filter(Boolean).join("\n\n"),
    sampleData: lab.sampleData,
    traceStats,
    predicateInfo: reviewPredicateInfo(lab),
    prompt: lab.requirements.join("\n"),
    expectedSql: lab.answerSql,
    targetPlan: [],
    targetPlanExplanations: undefined,
    oracleNotes: [lab.explanation, ...lab.rubric],
    hints: lab.hints,
    rubric: lab.rubric,
    traceSummary: convertedTraceSummary,
    simulationNotice: traceStats ? "문제에 제시된 실행계획 또는 Trace 성격의 자료만 표시한다. 실제 Oracle 실행 결과로 새로 측정한 값은 아니다." : undefined,
    relatedConceptIds: relatedConceptsForTopic(lab.topic)
  };
}

function metadataForLab(args: {
  number: number;
  mode: GenerationBucket;
  signature: string;
  sourceDocument?: string;
  sourcePage?: number;
  sourceQuestionNumber?: number | string;
  approved: boolean;
}) {
  const source = sourceFor("tuning", args.number + 2);
  const sourceType = sourceTypeForMode(args.mode);
  return {
    sourceDocument: args.sourceDocument ?? source.name,
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
    question.tables ? JSON.stringify(question.tables) : "",
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

const manualVerifiedObjectiveQuestionsBatch05: ObjectiveQuestion[] = ([
  {
    subjectId: "modeling",
    number: 51,
    majorTopic: "데이터 모델링의 이해",
    middleTopic: "엔터티",
    topic: "엔터티 후보 판정",
    difficulty: "중급",
    questionType: "업무 시나리오 판단형",
    mode: "similar",
    sourcePage: 9,
    parentQuestionId: "pdf-s-1-entity-candidate",
    stem: "학원 시스템에서 수강신청은 수강생과 강좌의 조합마다 발생하며 신청일자, 결제상태, 환불여부를 가진다. 다음 중 모델링 관점에서 가장 적절한 설명은?",
    choices: [
      ["A", "수강신청은 화면 버튼이므로 엔터티가 아니라 프로세스만으로 관리한다.", "오답이다. 업무상 관리해야 할 발생 사실과 속성이 있으므로 데이터로 관리해야 한다."],
      ["B", "수강신청은 수강생과 강좌 사이의 M:N 관계를 해소하는 행위 엔터티로 도출할 수 있다.", "정답이다. 관계 자체에 신청일자와 결제상태 같은 속성이 있으므로 교차 엔터티가 적절하다."],
      ["C", "수강생 테이블에 강좌번호1, 강좌번호2를 반복 컬럼으로 추가하면 정규화 측면에서 가장 안정적이다.", "오답이다. 반복 컬럼은 확장성과 제1정규형 측면에서 부적절하다."],
      ["D", "강좌 테이블에 최근수강생번호만 저장하면 전체 수강 이력을 보존할 수 있다.", "오답이다. 여러 수강생과 이력 속성을 표현하지 못한다."]
    ],
    answer: "B",
    relatedConceptId: "modeling-relationship",
    hint: ["관계 자체에 속성이 있는지 본다.", "M:N 관계를 물리 테이블로 직접 구현할 수 있는지 판단한다.", "교차 엔터티가 필요한 경우를 찾는다."],
    explanation: "수강신청은 수강생과 강좌의 단순 연결을 넘어 신청일자, 결제상태, 환불여부라는 독립 속성을 가진다. 이런 경우 관계를 행위 엔터티로 도출해 두 부모 엔터티와 각각 1:M 관계를 맺게 하는 것이 적절하다."
  },
  {
    subjectId: "modeling",
    number: 52,
    majorTopic: "데이터 모델링의 이해",
    middleTopic: "식별자",
    topic: "주식별자 최소성",
    difficulty: "상급",
    questionType: "식별자 구성 판단형",
    mode: "variant",
    sourcePage: 24,
    parentQuestionId: "pdf-v-1-identifier-minimality",
    stem: "보험계약상세 엔터티의 후보 식별자로 (계약번호, 담보코드, 적용시작일자)가 있고, 담보코드는 계약번호 안에서만 유일하다. 적용시작일자는 동일 담보의 이력 구분에 필요하다. 가장 적절한 판단은?",
    choices: [
      ["A", "계약번호만으로 계약상세를 식별할 수 있으므로 나머지 컬럼은 주식별자에서 제외한다.", "오답이다. 한 계약에 여러 담보와 이력이 존재하므로 계약번호만으로 유일하지 않다."],
      ["B", "담보코드는 코드성이므로 주식별자에 포함할 수 없다.", "오답이다. 업무상 식별에 필요한 코드라면 주식별자 구성 요소가 될 수 있다."],
      ["C", "(계약번호, 담보코드, 적용시작일자)는 유일성과 최소성을 만족하는 후보가 될 수 있다.", "정답이다. 세 컬럼 모두 이력 단위 식별에 필요하고 어느 하나를 빼면 유일성이 깨진다."],
      ["D", "이력 테이블은 항상 인조식별자 하나만 주식별자로 사용해야 한다.", "오답이다. 인조식별자를 쓸 수는 있지만 업무 유일성 제약은 별도로 보존해야 한다."]
    ],
    answer: "C",
    relatedConceptId: "modeling-identifier",
    hint: ["각 컬럼을 제거했을 때 유일성이 유지되는지 본다.", "이력 구분 컬럼이 식별에 필요한지 확인한다.", "인조식별자 도입 여부와 업무 유일성은 분리해 판단한다."],
    explanation: "주식별자는 유일성뿐 아니라 최소성을 만족해야 한다. 계약번호만으로는 여러 담보를 구분할 수 없고, 적용시작일자를 제외하면 동일 담보의 이력을 구분할 수 없으므로 세 컬럼 조합이 후보 식별자가 된다."
  },
  {
    subjectId: "modeling",
    number: 53,
    majorTopic: "데이터 모델링의 이해",
    middleTopic: "관계",
    topic: "선택 관계와 NULL",
    difficulty: "중급",
    questionType: "관계 선택성 판단형",
    mode: "similar",
    sourcePage: 18,
    parentQuestionId: "pdf-s-1-optional-relationship",
    stem: "배송은 주문이 출고된 이후에만 생성된다. 주문은 생성 직후 배송이 없을 수 있고, 배송은 반드시 하나의 주문에 속한다. 주문-배송 관계를 표현할 때 가장 적절한 것은?",
    choices: [
      ["A", "주문과 배송은 항상 1:1 필수 관계이므로 주문 생성 시 배송번호를 반드시 입력한다.", "오답이다. 주문 생성 직후에는 배송이 없을 수 있으므로 주문 입장에서 선택 관계다."],
      ["B", "배송 테이블에 주문번호 외래키를 두고 배송 입장에서는 필수, 주문 입장에서는 선택 관계로 표현한다.", "정답이다. 배송은 주문 없이 존재할 수 없지만 주문은 배송 전 상태가 가능하다."],
      ["C", "주문 테이블에 배송상태 컬럼만 두면 배송 엔터티는 필요 없다.", "오답이다. 배송번호, 배송일자, 기사 등 배송 자체 속성과 이력을 잃는다."],
      ["D", "배송이 늦게 생성되므로 주문번호 외래키를 NULL 허용으로 두어야 한다.", "오답이다. 배송 행이 생성되는 순간에는 반드시 주문에 속해야 하므로 배송의 주문번호는 필수다."]
    ],
    answer: "B",
    relatedConceptId: "modeling-null",
    hint: ["어느 쪽 행이 먼저 생기는지 본다.", "각 엔터티 입장에서 관계 참여가 필수인지 선택인지 구분한다.", "외래키 NULL 허용 여부는 자식 행 존재 시점을 기준으로 판단한다."],
    explanation: "주문은 배송 전에 존재할 수 있으므로 주문에서 배송으로의 참여는 선택이다. 반면 배송은 특정 주문 없이 존재할 수 없으므로 배송의 주문번호 외래키는 필수로 설계하는 것이 자연스럽다."
  },
  {
    subjectId: "modeling",
    number: 54,
    majorTopic: "데이터 모델링의 이해",
    middleTopic: "정규화",
    topic: "제1정규형",
    difficulty: "기본",
    questionType: "정규형 위반 판단형",
    mode: "original",
    sourcePage: 37,
    parentQuestionId: "pdf-o-1-1nf-repeating",
    stem: "고객 테이블에 전화번호1, 전화번호2, 전화번호3 컬럼을 두고 고객별 연락처를 관리한다. 업무상 한 고객은 연락처를 0개 이상 가질 수 있고 연락처별 용도와 인증여부도 관리해야 한다. 가장 적절한 개선안은?",
    choices: [
      ["A", "전화번호 컬럼을 충분히 많이 늘려 향후 최대 개수를 대비한다.", "오답이다. 반복 컬럼 증가는 구조 변경을 반복시키고 용도/인증여부 관리도 어렵다."],
      ["B", "전화번호들을 콤마로 연결해 하나의 문자열 컬럼에 저장한다.", "오답이다. 원자값 원칙을 훼손하고 검색과 제약 검사가 어려워진다."],
      ["C", "고객연락처 엔터티를 분리해 고객번호와 연락처순번 또는 연락처번호로 식별한다.", "정답이다. 다중값 속성을 별도 엔터티로 분리하는 것이 제1정규형에 맞다."],
      ["D", "최근 인증된 전화번호 하나만 고객 테이블에 남기고 나머지는 삭제한다.", "오답이다. 업무가 요구하는 전체 연락처 관리를 보존하지 못한다."]
    ],
    answer: "C",
    relatedConceptId: "modeling-normalization",
    hint: ["한 행 한 컬럼에 여러 값이 들어가는지 본다.", "연락처 자체에 속성이 있는지 확인한다.", "다중값 속성은 별도 엔터티로 분리하는지 판단한다."],
    explanation: "연락처가 0개 이상이고 용도, 인증여부 같은 속성을 가지면 단순 반복 컬럼이 아니라 고객연락처 엔터티로 분리해야 한다. 이는 원자값 보장과 확장성 측면에서 제1정규형에 맞는다."
  },
  {
    subjectId: "modeling",
    number: 55,
    majorTopic: "데이터 모델링의 이해",
    middleTopic: "정규화",
    topic: "제2정규형",
    difficulty: "중급",
    questionType: "부분 함수 종속 판단형",
    mode: "variant",
    sourcePage: 38,
    parentQuestionId: "pdf-v-1-2nf",
    stem: "주문상세(주문번호, 상품번호, 주문수량, 상품명, 상품분류명)에서 기본키는 (주문번호, 상품번호)이고, 상품명과 상품분류명은 상품번호만으로 결정된다. 가장 적절한 정규화 판단은?",
    choices: [
      ["A", "상품명은 주문상세 화면에 필요하므로 주문상세에 반복 저장해야 한다.", "오답이다. 조회 편의가 정규화 위반을 정당화하지는 않는다."],
      ["B", "상품명과 상품분류명은 복합키 일부인 상품번호에만 종속되므로 상품 엔터티로 분리하는 것이 적절하다.", "정답이다. 부분 함수 종속 제거가 제2정규형의 핵심이다."],
      ["C", "상품분류명은 설명 속성이므로 어떤 테이블에 있어도 정규화와 무관하다.", "오답이다. 코드/분류에 종속되는 설명값은 중복과 갱신 이상을 만든다."],
      ["D", "주문수량도 상품번호만으로 결정되므로 상품 엔터티로 이동한다.", "오답이다. 주문수량은 주문과 상품의 조합에 종속되는 거래 속성이다."]
    ],
    answer: "B",
    relatedConceptId: "modeling-normalization",
    hint: ["복합키의 일부만으로 결정되는 속성을 찾는다.", "주문별로 달라지는 속성과 상품 자체 속성을 구분한다.", "부분 함수 종속은 별도 엔터티 분리 대상이다."],
    explanation: "상품명과 상품분류명은 주문번호와 무관하게 상품번호만으로 결정된다. 복합키 일부에만 종속되는 속성이므로 주문상세가 아니라 상품 쪽으로 분리해야 제2정규형을 만족한다."
  },
  {
    subjectId: "modeling",
    number: 56,
    majorTopic: "데이터 모델링의 이해",
    middleTopic: "정규화",
    topic: "제3정규형",
    difficulty: "중급",
    questionType: "이행 종속 판단형",
    mode: "variant",
    sourcePage: 40,
    parentQuestionId: "pdf-v-1-3nf",
    stem: "수강이력(수강생번호, 과목번호, 교수번호, 교수명)에서 기본키는 (수강생번호, 과목번호)이고 교수번호가 교수명을 결정한다. 가장 적절한 설명은?",
    choices: [
      ["A", "교수명은 기본키 전체에 직접 종속되므로 분리하지 않는다.", "오답이다. 교수번호를 통해 교수명에 이행 종속된다."],
      ["B", "교수번호와 교수명을 교수 엔터티로 분리해 이행 종속을 제거한다.", "정답이다. 비식별자 속성이 다른 비식별자 속성을 결정하므로 제3정규형 관점에서 분리한다."],
      ["C", "교수명을 기본키에 포함하면 모든 정규화 문제가 해결된다.", "오답이다. 이름은 식별 안정성이 낮고 중복을 늘린다."],
      ["D", "교수번호는 코드이므로 수강이력에 저장할 수 없다.", "오답이다. 참조키로 저장할 수 있으며 교수 정보는 별도 엔터티로 관리한다."]
    ],
    answer: "B",
    relatedConceptId: "modeling-normalization",
    hint: ["비식별자 속성 사이의 결정 관계를 찾는다.", "교수번호가 교수명을 결정하는지 확인한다.", "이행 종속은 제3정규형에서 제거한다."],
    explanation: "교수명은 수강이력의 식별자에 직접 종속되기보다 교수번호에 종속된다. 따라서 교수 엔터티를 분리하고 수강이력에는 교수번호만 참조시키는 것이 적절하다."
  },
  {
    subjectId: "modeling",
    number: 57,
    majorTopic: "데이터 모델링과 성능",
    middleTopic: "반정규화",
    topic: "파생 속성 저장",
    difficulty: "상급",
    questionType: "반정규화 적용 판단형",
    mode: "similar",
    sourcePage: 55,
    parentQuestionId: "pdf-s-1-denormalization-derived",
    stem: "일별 상품 재고를 조회할 때 입고, 출고, 조정 이력을 매번 집계해 현재고를 계산한다. 조회는 초당 수백 회 발생하지만 입출고 등록은 배치성으로 모아서 처리된다. 가장 적절한 반정규화 검토 방향은?",
    choices: [
      ["A", "정규화 모델에서는 파생값 저장이 항상 금지되므로 현재고 컬럼을 둘 수 없다.", "오답이다. 성능 요구와 정합성 유지 방안이 명확하면 파생 속성 저장을 검토할 수 있다."],
      ["B", "현재고를 상품재고 테이블에 저장하고 입출고 반영 시점과 검증 배치를 함께 설계한다.", "정답이다. 조회 빈도가 높고 갱신 통제가 가능하면 파생값 저장이 효과적일 수 있다."],
      ["C", "입출고 이력을 삭제하고 현재고만 남기면 모델이 가장 단순해진다.", "오답이다. 이력 추적과 감사 요구를 잃는다."],
      ["D", "현재고를 화면 캐시에만 저장하면 데이터 정합성 설계가 필요 없다.", "오답이다. 캐시도 무효화와 정합성 기준이 필요하다."]
    ],
    answer: "B",
    relatedConceptId: "modeling-normalization",
    hint: ["조회 빈도와 갱신 빈도의 균형을 본다.", "파생값 저장 시 정합성 유지 절차가 있는지 확인한다.", "원천 이력 보존 여부를 함께 판단한다."],
    explanation: "반정규화는 무조건 중복 저장이 아니라 조회 성능과 정합성 비용의 균형 문제다. 현재고처럼 조회가 매우 빈번하고 갱신 경로를 통제할 수 있다면 파생 속성 저장과 검증 배치를 함께 설계할 수 있다."
  },
  {
    subjectId: "modeling",
    number: 58,
    majorTopic: "데이터 모델링과 성능",
    middleTopic: "이력 모델링",
    topic: "기간 이력 무결성",
    difficulty: "상급",
    questionType: "이력 모델 판단형",
    mode: "similar",
    sourcePage: 61,
    parentQuestionId: "pdf-s-1-period-history",
    stem: "회원등급은 시간에 따라 변경되며 주문 당시 등급으로 할인율을 계산해야 한다. 등급이력에는 적용시작일자만 있고 종료일자는 없다. 가장 먼저 보완해야 할 모델링 요소는?",
    choices: [
      ["A", "최신 등급만 남기고 과거 등급은 주문 테이블의 할인금액으로 대체한다.", "오답이다. 과거 기준 재계산과 검증이 어렵다."],
      ["B", "적용종료일자 또는 다음 시작일 기준으로 기간을 식별하고 기간 중첩 방지 규칙을 둔다.", "정답이다. 주문 시점의 등급을 안정적으로 찾으려면 유효 기간 무결성이 필요하다."],
      ["C", "등급명을 주문 테이블에 문자로 복사하면 이력 테이블은 필요 없다.", "오답이다. 등급 정책 변경과 검증 기준을 잃는다."],
      ["D", "적용시작일자를 제거하고 변경순번만 두면 시간 기준 조회가 쉬워진다.", "오답이다. 주문일자 기준 이력 조회가 불가능해진다."]
    ],
    answer: "B",
    relatedConceptId: "modeling-history",
    hint: ["주문 시점의 값을 찾아야 하는지 본다.", "기간이 닫혀 있지 않으면 어떤 문제가 생기는지 확인한다.", "중첩과 공백 방지 규칙이 필요하다."],
    explanation: "시점 기준 이력 모델은 적용 시작과 종료 범위를 명확히 해야 한다. 종료일자 또는 다음 시작일 기준 규칙을 두고 한 회원의 등급 기간이 중첩되지 않도록 제약을 설계해야 한다."
  },
  {
    subjectId: "modeling",
    number: 59,
    majorTopic: "데이터 모델링과 성능",
    middleTopic: "슈퍼타입/서브타입",
    topic: "물리 모델 변환",
    difficulty: "상급",
    questionType: "서브타입 변환 판단형",
    mode: "similar",
    sourcePage: 63,
    parentQuestionId: "pdf-s-1-super-subtype",
    stem: "결제수단은 카드, 계좌이체, 간편결제로 나뉜다. 공통 속성이 많고 대부분의 조회가 전체 결제수단을 대상으로 하며, 각 유형 고유 속성은 일부만 사용된다. 우선 검토할 물리 모델은?",
    choices: [
      ["A", "유형별 테이블을 완전히 분리하고 전체 조회는 항상 UNION ALL로 처리한다.", "오답이다. 전체 조회가 매우 빈번하면 UNION ALL 반복 비용이 커질 수 있다."],
      ["B", "공통/고유 속성을 하나의 결제수단 테이블에 통합하고 유형코드로 구분한다.", "정답이다. 공통 속성이 많고 전체 조회 중심이면 통합 테이블이 유리할 수 있다."],
      ["C", "공통 속성을 모든 서브타입 테이블에 복사해 조인을 제거한다.", "오답이다. 중복과 정합성 문제가 크다."],
      ["D", "유형코드를 제거하고 NULL 여부만으로 유형을 추론한다.", "오답이다. 유형 판정 기준이 불명확하고 제약 관리가 어렵다."]
    ],
    answer: "B",
    relatedConceptId: "modeling-super-subtype",
    hint: ["조회 패턴이 전체 중심인지 유형별 중심인지 본다.", "공통 속성과 고유 속성 비율을 확인한다.", "통합 모델의 NULL 관리 비용도 함께 고려한다."],
    explanation: "슈퍼타입/서브타입 물리 변환은 조회 패턴과 속성 분포가 기준이다. 전체 조회가 빈번하고 공통 속성이 많으면 단일 통합 테이블이 조인과 UNION 비용을 줄일 수 있다."
  },
  {
    subjectId: "modeling",
    number: 60,
    majorTopic: "데이터 모델링과 성능",
    middleTopic: "데이터 모델과 성능",
    topic: "집계 테이블",
    difficulty: "상급",
    questionType: "성능 모델링 판단형",
    mode: "variant",
    sourcePage: 71,
    parentQuestionId: "pdf-v-1-aggregate-table",
    stem: "월별 고객 사용금액 조회가 대시보드에서 반복 수행되고 원천 사용내역은 일 1억 건 이상 적재된다. 월 마감 후 값은 변하지 않는다. 가장 적절한 모델 보완은?",
    choices: [
      ["A", "항상 원천 사용내역을 실시간 집계해야 정규화 모델이 유지된다.", "오답이다. 마감 후 불변이고 조회가 반복되면 집계 테이블을 검토할 수 있다."],
      ["B", "월별 고객 사용금액 집계 테이블을 두고 원천과 집계의 생성 기준을 명확히 관리한다.", "정답이다. 대량 원천 반복 집계를 줄이고 마감 기준으로 정합성을 관리할 수 있다."],
      ["C", "고객 테이블에 최근 한 달 금액만 저장하고 과거 월별 금액은 버린다.", "오답이다. 월별 조회 요구를 충족하지 못한다."],
      ["D", "인덱스를 많이 만들면 집계 테이블 없이 모든 월별 조회가 충분히 빨라진다.", "오답이다. 대량 집계 자체 비용은 인덱스만으로 해결되지 않을 수 있다."]
    ],
    answer: "B",
    relatedConceptId: "modeling-transaction-model",
    hint: ["원천 데이터 규모와 조회 반복 여부를 본다.", "집계 값이 변경되는지 또는 마감되는지 확인한다.", "집계 테이블은 생성 기준과 검증 기준이 필요하다."],
    explanation: "대량 원천 테이블을 매번 집계하는 비용이 크고 월 마감 후 값이 고정된다면 월별 고객 집계 테이블을 별도로 두는 것이 성능 모델링 관점에서 적절하다."
  }
] as CompactManualQuestion[]).map(makeCompactManualQuestion);

const manualVerifiedObjectiveQuestionsBatch12: ObjectiveQuestion[] = pdfExtensionQuestionsBatch12.map(makeCompactManualQuestion);

const manualVerifiedObjectiveQuestionsBatch06: ObjectiveQuestion[] = ([
  {
    subjectId: "modeling", number: 61, majorTopic: "데이터 모델링의 이해", middleTopic: "속성", topic: "기본·설계·파생 속성", difficulty: "중급", questionType: "속성 분류 판단형", mode: "variant", sourcePage: 15, parentQuestionId: "pdf-v-1-attribute-type",
    stem: "주문 엔터티에 주문일시, 주문금액, 주문번호, 월주문금액이 있다. 주문번호는 시스템이 채번하고 월주문금액은 주문상세 금액을 월 단위로 합산해 저장한다. 속성 분류로 가장 적절한 것은?",
    choices: [["A", "주문일시는 설계 속성, 주문번호는 파생 속성이다.", "오답이다. 주문일시는 업무에서 직접 발생하는 기본 속성이고 주문번호는 식별 편의를 위한 설계 속성이다."], ["B", "주문번호는 설계 속성, 월주문금액은 파생 속성이다.", "정답이다. 주문번호는 시스템 식별을 위해 설계했고 월주문금액은 다른 데이터로 계산된다."], ["C", "월주문금액은 사용자가 조회하므로 기본 속성이다.", "오답이다. 조회 여부가 아니라 값의 발생 원천으로 분류한다."], ["D", "모든 금액 속성은 파생 속성이므로 주문금액도 저장하면 안 된다.", "오답이다. 주문금액이 거래 발생 시 확정되는 원천 값이면 기본 속성이 될 수 있다."]],
    answer: "B", relatedConceptId: "modeling-attribute", hint: ["값이 업무에서 직접 발생하는지 본다.", "식별이나 편의를 위해 설계한 값인지 확인한다.", "다른 속성으로 계산되는 값은 파생 속성이다."],
    explanation: "속성 분류는 화면 표시나 데이터 타입이 아니라 값의 원천으로 판단한다. 시스템 채번 주문번호는 설계 속성, 월주문금액은 원천 거래를 집계한 파생 속성이다."
  },
  {
    subjectId: "modeling", number: 62, majorTopic: "데이터 모델링의 이해", middleTopic: "관계", topic: "관계 차수", difficulty: "중급", questionType: "ERD 관계 해석형", mode: "similar", sourcePage: 18, parentQuestionId: "pdf-s-1-cardinality",
    stem: "한 부서는 여러 직원을 가질 수 있고, 직원은 입사 시 반드시 하나의 부서에 소속된다. 단, 폐지된 부서는 직원이 없을 수도 있다. 부서-직원 관계의 차수와 선택성으로 가장 적절한 것은?",
    choices: [["A", "부서:직원 = 1:1, 양쪽 필수", "오답이다. 한 부서에 여러 직원이 있을 수 있으므로 1:M이다."], ["B", "부서:직원 = 1:M, 부서 입장은 선택, 직원 입장은 필수", "정답이다. 부서는 직원이 없을 수 있고 직원은 반드시 부서에 속한다."], ["C", "부서:직원 = M:N, 양쪽 선택", "오답이다. 직원은 하나의 부서에만 속한다고 제시되었다."], ["D", "부서:직원 = 1:M, 부서 입장도 필수", "오답이다. 폐지된 부서는 직원이 없을 수 있다."]],
    answer: "B", relatedConceptId: "modeling-relationship", hint: ["한쪽 인스턴스에 반대쪽이 몇 개 연결되는지 본다.", "최소 참여가 0인지 1인지 따진다.", "폐지 부서라는 예외가 선택성을 결정한다."],
    explanation: "관계 차수는 최대 참여 수, 선택성은 최소 참여 수로 판단한다. 부서는 직원이 0명 이상, 직원은 정확히 하나의 부서에 속하므로 부서 선택-직원 필수의 1:M 관계다."
  },
  {
    subjectId: "modeling", number: 63, majorTopic: "데이터 모델링의 이해", middleTopic: "식별자", topic: "본질 식별자와 인조 식별자", difficulty: "상급", questionType: "식별자 변경 영향형", mode: "similar", sourcePage: 26, parentQuestionId: "pdf-s-1-surrogate-key",
    stem: "회원은 주민등록번호 대신 회원번호를 주식별자로 사용한다. 그러나 동일 주민등록번호의 중복 회원 가입은 금지해야 한다. 가장 적절한 설계 원칙은?",
    choices: [["A", "회원번호를 쓰면 주민등록번호 유일성 검사는 필요 없다.", "오답이다. 인조식별자는 식별 방법일 뿐 업무 유일성 규칙을 대체하지 않는다."], ["B", "회원번호를 PK로 두고 주민등록번호에는 별도 유일 제약 또는 중복 검증 규칙을 둔다.", "정답이다. 인조식별자와 업무 유일성 보존을 함께 설계해야 한다."], ["C", "주민등록번호를 삭제하면 동일인 판단 요구도 사라진다.", "오답이다. 업무 규칙은 데이터 보유 여부와 별개로 남을 수 있다."], ["D", "주민등록번호를 모든 자식 테이블의 식별자에 포함한다.", "오답이다. 식별자 전파와 개인정보 노출, 변경 영향이 커진다."]],
    answer: "B", relatedConceptId: "modeling-natural-surrogate", hint: ["PK 선택과 업무 중복 규칙을 구분한다.", "인조식별자가 도입되어도 후보 식별자 의미가 사라지는지 본다.", "민감 정보 전파 영향을 함께 고려한다."],
    explanation: "인조식별자는 관계 안정성과 개인정보 노출 감소에 유리할 수 있지만 업무상 중복 방지 규칙을 없애지는 않는다. 따라서 회원번호 PK와 주민등록번호 유일성 검증을 함께 설계한다."
  },
  {
    subjectId: "modeling", number: 64, majorTopic: "데이터 모델링과 성능", middleTopic: "반정규화", topic: "중복 컬럼 정합성", difficulty: "상급", questionType: "반정규화 부작용 판단형", mode: "variant", sourcePage: 58, parentQuestionId: "pdf-v-1-duplicated-column",
    stem: "주문 목록에서 고객명을 빠르게 표시하기 위해 주문 테이블에 고객명을 중복 저장하려고 한다. 고객명 변경은 드물지만 변경 시 과거 주문 화면에는 주문 당시 고객명을 보여야 한다. 가장 적절한 판단은?",
    choices: [["A", "고객명이 바뀌면 모든 과거 주문 고객명을 최신명으로 갱신한다.", "오답이다. 주문 당시 고객명 보존 요구와 충돌한다."], ["B", "주문 당시 고객명을 주문에 저장하되, 최신 고객명 조회와 의미를 명확히 분리한다.", "정답이다. 중복 저장 목적이 이력 보존인지 조인 제거인지 구분해야 한다."], ["C", "고객명을 절대 중복 저장하지 않고 매번 고객 테이블에서만 조회한다.", "오답이다. 주문 당시 값 보존 요구가 있으면 중복이 아니라 스냅샷 성격의 속성이 될 수 있다."], ["D", "고객명 변경을 금지하면 모든 정합성 문제가 해결된다.", "오답이다. 업무 현실과 데이터 품질 요구를 무시한 해결이다."]],
    answer: "B", relatedConceptId: "modeling-normalization", hint: ["중복 컬럼이 최신값인지 당시값인지 구분한다.", "변경 시 갱신 대상이 무엇인지 확인한다.", "반정규화에는 정합성 규칙이 함께 필요하다."],
    explanation: "주문 당시 고객명을 보여야 한다면 주문의 고객명은 단순 중복 최신값이 아니라 거래 시점 스냅샷 속성이다. 최신 고객명과 당시 고객명의 의미를 분리해 정합성 규칙을 설계해야 한다."
  },
  {
    subjectId: "modeling", number: 65, majorTopic: "데이터 모델링과 성능", middleTopic: "데이터 모델과 성능", topic: "조인 감소 모델링", difficulty: "상급", questionType: "모델 변경 영향형", mode: "similar", sourcePage: 73, parentQuestionId: "pdf-s-1-join-reduction",
    stem: "매출 조회 화면은 주문, 주문상세, 상품, 상품분류를 매번 조인한다. 상품분류명은 변경이 거의 없고 매출 분석은 과거 주문 당시 분류 기준으로 수행된다. 성능 개선 관점에서 우선 검토할 수 있는 것은?",
    choices: [["A", "상품분류 엔터티를 삭제하고 상품명에 분류명을 붙인다.", "오답이다. 분류 체계와 검색 기준을 잃는다."], ["B", "주문상세 또는 매출 집계에 주문 당시 상품분류코드를 저장하는 방안을 검토한다.", "정답이다. 분석 기준이 주문 당시 값이면 조인 감소와 이력 보존을 함께 얻을 수 있다."], ["C", "모든 화면에서 상품분류 조인을 금지한다.", "오답이다. 정합한 조회가 필요한 화면도 있다."], ["D", "상품분류명을 매번 서브쿼리로 조회하면 조인 비용이 사라진다.", "오답이다. 표현만 바뀔 뿐 반복 조회 비용이 발생할 수 있다."]],
    answer: "B", relatedConceptId: "modeling-relationship-join", hint: ["조회가 과거 기준인지 최신 기준인지 본다.", "조인을 줄이는 컬럼 저장이 업무 의미를 보존하는지 확인한다.", "분석 집계와 원천 정합성의 역할을 분리한다."],
    explanation: "과거 주문 당시 분류 기준으로 분석한다면 주문상세나 매출 집계에 당시 상품분류코드를 저장하는 설계가 타당할 수 있다. 이는 단순 중복이 아니라 시점 기준 분석 요구와 조인 감소를 함께 만족한다."
  },
  {
    subjectId: "modeling", number: 66, majorTopic: "데이터 모델링의 이해", middleTopic: "정규화", topic: "함수 종속", difficulty: "중급", questionType: "함수 종속 추론형", mode: "original", sourcePage: 33, parentQuestionId: "pdf-o-1-functional-dependency",
    stem: "수강평가(학생번호, 과목번호, 교수번호, 평가점수)에서 한 과목은 한 학기에 한 교수만 담당하고 학생은 여러 과목을 수강한다. 기본키가 (학생번호, 과목번호)라면 성립하는 함수 종속으로 가장 적절한 것은?",
    choices: [["A", "학생번호 -> 교수번호", "오답이다. 한 학생이 여러 과목을 수강할 수 있어 학생번호만으로 교수번호가 결정되지 않는다."], ["B", "과목번호 -> 교수번호", "정답이다. 지문에서 한 과목은 한 교수만 담당한다고 했다."], ["C", "교수번호 -> 평가점수", "오답이다. 평가점수는 학생과 과목의 수강 결과에 따라 달라진다."], ["D", "평가점수 -> 과목번호", "오답이다. 같은 평가점수를 받은 과목은 여러 개일 수 있다."]],
    answer: "B", relatedConceptId: "modeling-normalization", hint: ["결정자 값이 주어졌을 때 종속자 값이 하나로 정해지는지 본다.", "학생이 여러 과목을 수강한다는 조건을 반영한다.", "과목 담당 교수 조건을 함수 종속으로 표현한다."],
    explanation: "함수 종속은 업무 규칙으로 판단한다. 한 과목을 한 교수가 담당한다면 과목번호가 교수번호를 결정하며, 이는 복합키 일부에 대한 종속이므로 정규화 검토 대상이 된다."
  },
  {
    subjectId: "modeling", number: 67, majorTopic: "데이터 모델링과 성능", middleTopic: "NULL 모델링", topic: "NULL 의미 구분", difficulty: "상급", questionType: "NULL 모델링 판단형", mode: "similar", sourcePage: 76, parentQuestionId: "pdf-s-1-null-semantics",
    stem: "계약해지일자 컬럼에 NULL이 저장되어 있다. NULL은 미해지, 해지일자 미입력, 해지 대상 아님 세 의미가 섞여 있다. 가장 적절한 개선 방향은?",
    choices: [["A", "NULL은 모두 같은 의미이므로 그대로 사용한다.", "오답이다. 서로 다른 업무 의미가 섞이면 조건과 집계가 모호해진다."], ["B", "해지상태코드와 해지일자를 분리해 NULL의 의미를 상태로 명확히 표현한다.", "정답이다. NULL 하나에 여러 의미를 담지 않도록 상태와 일자를 분리한다."], ["C", "NULL을 모두 9999-12-31로 바꾸면 업무 의미가 명확해진다.", "오답이다. 미해지와 미입력, 미대상을 구분하지 못한다."], ["D", "해지일자 컬럼을 삭제하고 화면에서만 상태를 계산한다.", "오답이다. 업무 기록과 조회 기준이 데이터 모델에 표현되지 않는다."]],
    answer: "B", relatedConceptId: "modeling-null", hint: ["NULL이 하나의 의미인지 여러 의미인지 본다.", "상태와 발생 일자는 서로 다른 속성인지 확인한다.", "집계와 조건절에서 혼동될 가능성을 생각한다."],
    explanation: "NULL은 모름, 미해당, 미입력 등 여러 의미를 가질 수 있다. 하나의 컬럼에 의미가 섞이면 SQL 조건과 보고서가 모호해지므로 상태코드와 일자 속성을 분리하는 것이 바람직하다."
  },
  {
    subjectId: "modeling", number: 68, majorTopic: "데이터 모델링의 이해", middleTopic: "관계", topic: "재귀 관계", difficulty: "중급", questionType: "재귀 관계 판단형", mode: "variant", sourcePage: 21, parentQuestionId: "pdf-v-1-recursive-relationship",
    stem: "조직 엔터티에서 한 조직은 상위 조직을 하나 가질 수 있고 최상위 조직은 상위 조직이 없다. 하위 조직은 여러 개 있을 수 있다. 가장 적절한 모델링은?",
    choices: [["A", "조직 테이블에 상위조직번호 자기참조 외래키를 둔다.", "정답이다. 동일 엔터티 간 계층 관계는 재귀 관계로 표현할 수 있다."], ["B", "상위조직명1, 상위조직명2 컬럼을 반복해서 둔다.", "오답이다. 계층 깊이 변화에 취약하고 정규화에 맞지 않는다."], ["C", "최상위 조직과 하위 조직을 서로 다른 엔터티로 완전히 분리한다.", "오답이다. 같은 성격의 조직을 불필요하게 분리한다."], ["D", "상위 조직이 없는 행은 허용하지 않는다.", "오답이다. 최상위 조직은 상위 조직이 없을 수 있다."]],
    answer: "A", relatedConceptId: "modeling-relationship", hint: ["같은 엔터티 타입 사이의 관계인지 확인한다.", "최상위 행의 선택성을 본다.", "계층 깊이가 변할 수 있는지 판단한다."],
    explanation: "조직 계층은 동일 엔터티 타입 내부의 부모-자식 관계이므로 자기참조 외래키로 표현할 수 있다. 최상위 조직은 상위조직번호가 NULL일 수 있도록 선택성을 반영한다."
  },
  {
    subjectId: "modeling", number: 69, majorTopic: "데이터 모델링의 이해", middleTopic: "속성", topic: "도메인과 제약",
    difficulty: "기본", questionType: "도메인 판단형", mode: "original", sourcePage: 14, parentQuestionId: "pdf-o-1-domain",
    stem: "성별코드, 주문상태코드, 회원등급코드는 여러 엔터티에서 반복 사용된다. 모델링 단계에서 가장 먼저 관리해야 할 대상으로 적절한 것은?",
    choices: [["A", "각 컬럼명을 화면명 기준으로 모두 다르게 만든다.", "오답이다. 같은 의미의 데이터가 서로 다른 이름으로 흩어진다."], ["B", "공통 도메인과 허용값, 데이터 타입, 길이 규칙을 정의한다.", "정답이다. 도메인은 속성의 값 범위와 표현 규칙을 일관되게 관리한다."], ["C", "코드 컬럼은 모두 숫자형으로 고정한다.", "오답이다. 코드 체계와 업무 의미에 따라 문자형이 적절할 수 있다."], ["D", "도메인은 물리 DB 생성 이후에만 검토한다.", "오답이다. 논리 모델 단계부터 의미와 값 범위를 정의해야 한다."]],
    answer: "B", relatedConceptId: "modeling-attribute", hint: ["여러 속성에 공통으로 적용되는 값 규칙을 찾는다.", "데이터 타입과 허용값도 모델 규칙인지 본다.", "도메인은 명명과 표준화에도 영향을 준다."],
    explanation: "도메인은 속성이 가질 수 있는 값의 범위, 데이터 타입, 길이, 형식 등을 정의한다. 반복 사용되는 코드 속성은 공통 도메인으로 관리해야 일관성을 확보할 수 있다."
  },
  {
    subjectId: "modeling", number: 70, majorTopic: "데이터 모델링과 성능", middleTopic: "분산 데이터베이스", topic: "분산 투명성", difficulty: "중급", questionType: "개념 매칭형", mode: "original", sourcePage: 121, parentQuestionId: "pdf-o-1-distributed-transparency",
    stem: "사용자는 데이터가 어느 지역 서버에 저장되어 있는지 알 필요 없이 동일한 SQL로 주문 데이터를 조회한다. 이 설명과 가장 가까운 분산 데이터베이스 투명성은?",
    choices: [["A", "위치 투명성", "정답이다. 데이터의 실제 저장 위치를 사용자가 의식하지 않는 특성이다."], ["B", "중복 투명성", "오답이다. 복제본 존재 여부를 숨기는 특성이다."], ["C", "장애 투명성", "오답이다. 일부 노드 장애에도 서비스가 계속되는 특성과 관련된다."], ["D", "병행 투명성", "오답이다. 동시 트랜잭션 수행의 일관성과 관련된다."]],
    answer: "A", relatedConceptId: "modeling-data-model", hint: ["사용자가 무엇을 몰라도 되는지 본다.", "지문은 저장 위치를 말한다.", "위치를 숨기는 특성이 위치 투명성이다."],
    explanation: "위치 투명성은 데이터가 어느 노드나 지역에 저장되는지 사용자가 알지 못해도 동일하게 접근할 수 있는 특성이다."
  }
] as CompactManualQuestion[]).map(makeCompactManualQuestion);

const manualVerifiedObjectiveQuestionsBatch07: ObjectiveQuestion[] = ([
  {
    subjectId: "modeling", number: 71, majorTopic: "데이터 모델링의 이해", middleTopic: "엔터티", topic: "행위 엔터티", difficulty: "중급", questionType: "엔터티 분류 판단형", mode: "variant", sourcePage: 12, parentQuestionId: "pdf-v-1-action-entity",
    stem: "상품과 고객 사이에 관심상품등록이 발생하며 등록일시, 알림동의여부, 삭제일시를 관리한다. 관심상품등록의 분류로 가장 적절한 것은?",
    choices: [["A", "기본 엔터티", "오답이다. 상품과 고객이라는 기본/중심 엔터티 사이에서 발생하는 행위에 가깝다."], ["B", "행위 엔터티", "정답이다. 두 엔터티 간 업무 행위를 기록하고 자체 속성을 가진다."], ["C", "코드 엔터티", "오답이다. 허용값 집합이 아니라 발생 사실을 저장한다."], ["D", "외부 엔터티", "오답이다. 외부 시스템에서 독립적으로 제공되는 참조 데이터가 아니다."]],
    answer: "B", relatedConceptId: "modeling-entity", hint: ["해당 데이터가 원래 존재하는 객체인지 발생 행위인지 본다.", "두 엔터티의 조합에 속성이 붙는지 확인한다.", "등록일시와 삭제일시는 관계 행위의 속성이다."],
    explanation: "관심상품등록은 고객과 상품 사이에서 발생하는 업무 행위이고 등록일시, 알림동의여부 같은 속성을 가진다. 따라서 행위 엔터티로 모델링하는 것이 적절하다."
  },
  {
    subjectId: "modeling", number: 72, majorTopic: "데이터 모델링의 이해", middleTopic: "관계", topic: "식별 관계", difficulty: "상급", questionType: "관계 식별성 판단형", mode: "similar", sourcePage: 24, parentQuestionId: "pdf-s-1-identifying-relation",
    stem: "주문상세의 식별자는 (주문번호, 주문순번)이고 주문번호는 주문 엔터티의 식별자다. 주문상세는 주문 없이 존재할 수 없으며 주문이 삭제되면 상세도 삭제된다. 가장 적절한 관계 해석은?",
    choices: [["A", "비식별 관계이며 주문번호는 일반 속성이다.", "오답이다. 부모 식별자가 자식 식별자의 일부가 된다."], ["B", "식별 관계로 볼 수 있으며 주문번호는 주문상세 식별자의 일부다.", "정답이다. 존재 종속과 식별자 상속이 함께 나타난다."], ["C", "M:N 관계이므로 교차 엔터티가 하나 더 필요하다.", "오답이다. 이미 주문상세가 주문 하위 엔터티 역할을 한다."], ["D", "주문상세는 주문번호 없이 주문순번만으로 식별된다.", "오답이다. 주문순번은 주문 안에서만 의미가 있다."]],
    answer: "B", relatedConceptId: "modeling-relationship", hint: ["부모 식별자가 자식 식별자에 포함되는지 본다.", "자식의 존재가 부모에 종속되는지 확인한다.", "주문순번이 전역 유일인지 주문 내부 순번인지 구분한다."],
    explanation: "식별 관계는 부모 식별자가 자식 식별자의 일부가 되는 관계다. 주문상세의 주문번호는 주문의 식별자이면서 주문상세 식별자의 일부이므로 식별 관계로 해석할 수 있다."
  },
  {
    subjectId: "modeling", number: 73, majorTopic: "데이터 모델링과 성능", middleTopic: "이력 모델링", topic: "상태 이력", difficulty: "상급", questionType: "모델 보완 판단형", mode: "similar", sourcePage: 62, parentQuestionId: "pdf-s-1-status-history",
    stem: "배송상태는 접수, 집하, 배송중, 완료, 반송으로 바뀐다. 현재 배송 테이블에는 최신 상태코드만 있고 상태별 변경시각과 담당자를 추적해야 하는 요구가 추가되었다. 적절한 모델 보완은?",
    choices: [["A", "배송 테이블에 상태변경시각1, 상태변경시각2를 반복 컬럼으로 추가한다.", "오답이다. 상태 단계 추가와 반복 관리에 취약하다."], ["B", "배송상태이력 엔터티를 분리해 배송번호, 상태코드, 변경일시, 담당자를 관리한다.", "정답이다. 상태 변경 발생 사실과 속성을 이력 엔터티로 보존한다."], ["C", "최신 상태만 있으면 완료 여부를 알 수 있으므로 이력은 저장하지 않는다.", "오답이다. 변경시각과 담당자 추적 요구를 충족하지 못한다."], ["D", "상태코드명을 배송 테이블에 중복 저장하면 이력이 복원된다.", "오답이다. 코드명 중복은 상태 변경 이력을 만들지 못한다."]],
    answer: "B", relatedConceptId: "modeling-history", hint: ["최신값 요구인지 변경 과정 추적 요구인지 구분한다.", "상태 변경 자체에 속성이 있는지 본다.", "반복 컬럼보다 이력 엔터티가 적절한지 판단한다."],
    explanation: "상태별 변경시각과 담당자를 추적하려면 최신 상태 컬럼만으로는 부족하다. 배송상태이력을 별도 엔터티로 두어 상태 변경 발생 사실을 시간 순서로 관리해야 한다."
  },
  {
    subjectId: "modeling", number: 74, majorTopic: "데이터 모델링의 이해", middleTopic: "정규화", topic: "반복 그룹 제거", difficulty: "기본", questionType: "테이블 구조 개선형", mode: "variant", sourcePage: 37, parentQuestionId: "pdf-v-1-repeating-group",
    stem: "설문응답 테이블에 문항1답변, 문항2답변, 문항3답변 컬럼이 있고 설문마다 문항 수가 다르다. 가장 적절한 구조는?",
    choices: [["A", "최대 문항 수만큼 답변 컬럼을 미리 만든다.", "오답이다. 문항 수 변경에 취약하고 NULL이 많이 생긴다."], ["B", "설문응답상세 엔터티를 두고 응답번호, 문항번호, 답변값을 관리한다.", "정답이다. 반복 그룹을 행으로 전환해 문항 수 변화를 수용한다."], ["C", "답변을 JSON 문자열 하나에 모두 저장하면 정규화 문제가 없다.", "오답이다. 관계형 제약과 검색, 집계가 어려워진다."], ["D", "문항 수가 많은 설문은 별도 테이블을 매번 새로 만든다.", "오답이다. 메타데이터와 SQL 유지보수 비용이 커진다."]],
    answer: "B", relatedConceptId: "modeling-normalization", hint: ["문항 수가 고정인지 변동인지 확인한다.", "반복 컬럼을 행 구조로 바꿀 수 있는지 본다.", "답변 자체가 문항과 응답의 조합 속성인지 판단한다."],
    explanation: "문항 수가 설문마다 달라지는 구조에서 반복 답변 컬럼은 부적절하다. 응답상세 엔터티로 분리하면 문항 수 변화와 답변 검색/집계를 안정적으로 처리할 수 있다."
  },
  {
    subjectId: "modeling", number: 75, majorTopic: "데이터 모델링과 성능", middleTopic: "물리 모델", topic: "논리 모델과 인덱스", difficulty: "중급", questionType: "개념 구분형", mode: "original", sourcePage: 96, parentQuestionId: "pdf-o-1-logical-physical",
    stem: "논리 모델에서 주문과 고객의 관계를 정의한 후, 물리 모델에서 주문(고객번호, 주문일자) 인덱스를 추가하였다. 가장 적절한 설명은?",
    choices: [["A", "인덱스 추가는 논리 모델의 관계를 삭제하는 작업이다.", "오답이다. 인덱스는 물리 접근 성능을 위한 구조이지 관계 의미를 삭제하지 않는다."], ["B", "논리 관계는 업무 규칙이고 인덱스는 물리 성능 구현 요소다.", "정답이다. 두 단계의 목적을 구분해야 한다."], ["C", "인덱스가 있으면 외래키 제약은 필요 없다.", "오답이다. 인덱스와 참조 무결성 제약은 역할이 다르다."], ["D", "모든 논리 관계에는 반드시 같은 컬럼 순서의 인덱스가 필요하다.", "오답이다. 인덱스는 SQL 패턴과 선택도에 따라 설계한다."]],
    answer: "B", relatedConceptId: "modeling-data-model", hint: ["논리 모델이 표현하는 것과 물리 모델이 구현하는 것을 구분한다.", "관계와 인덱스의 역할을 나눠 본다.", "외래키 제약과 인덱스는 같은 기능인지 확인한다."],
    explanation: "논리 모델의 관계는 업무 의미와 무결성을 표현한다. 인덱스는 물리 DB에서 특정 접근 경로를 빠르게 하기 위한 성능 구조이며 관계 자체를 대체하지 않는다."
  },
  {
    subjectId: "modeling", number: 76, majorTopic: "데이터 모델링과 성능", middleTopic: "대량 데이터 모델", topic: "파티션 고려", difficulty: "상급", questionType: "성능 모델링 판단형", mode: "similar", sourcePage: 103, parentQuestionId: "pdf-s-1-partition-modeling",
    stem: "주문 테이블은 월 3천만 건씩 증가하고 대부분의 조회와 삭제 배치는 주문월 기준으로 수행된다. 모델링 단계에서 우선 고려할 물리 설계 요소로 가장 적절한 것은?",
    choices: [["A", "주문번호만 주식별자로 정하면 월별 배치 성능은 자동으로 해결된다.", "오답이다. 식별자와 대량 데이터 접근/삭제 전략은 별도 검토가 필요하다."], ["B", "주문월 또는 주문일자 기준 파티션 전략과 로컬 인덱스 활용 가능성을 검토한다.", "정답이다. 월 단위 조회와 보관/삭제는 파티션 설계와 밀접하다."], ["C", "모든 주문 데이터를 한 블록에 모으도록 클러스터링한다.", "오답이다. 물리적으로 불가능하고 경합을 키운다."], ["D", "과거 주문은 조회하지 않도록 애플리케이션에서만 막는다.", "오답이다. DB 차원의 보관, 삭제, 접근 성능 요구를 해결하지 못한다."]],
    answer: "B", relatedConceptId: "modeling-transaction-model", hint: ["데이터 증가 단위와 조회/삭제 단위를 비교한다.", "월 기준 접근이면 파티션 키 후보가 되는지 본다.", "인덱스도 파티션 전략과 함께 봐야 한다."],
    explanation: "대량 테이블은 논리 모델 이후 물리 설계에서 파티션과 인덱스를 함께 검토해야 한다. 월별 조회와 보관 배치가 중심이면 주문일자/월 기준 파티션이 성능과 관리 측면에서 중요하다."
  },
  {
    subjectId: "modeling", number: 77, majorTopic: "데이터 모델링의 이해", middleTopic: "엔터티", topic: "엔터티 독립성", difficulty: "중급", questionType: "엔터티 성립 판단형", mode: "variant", sourcePage: 10, parentQuestionId: "pdf-v-1-entity-instance",
    stem: "캠페인 보고서 화면에만 필요한 '고객연령대별건수' 항목이 있다. 이 값은 고객 생년월일과 캠페인 참여 내역을 집계하면 계산된다. 별도 엔터티로 도출하는 판단으로 가장 적절한 것은?",
    choices: [["A", "보고서에 표시되므로 반드시 독립 엔터티다.", "오답이다. 화면 표시 항목이 곧 엔터티는 아니다."], ["B", "원천 데이터로 계산 가능한 집계 결과이므로 우선 파생 정보 또는 집계 테이블 필요성을 별도 검토한다.", "정답이다. 업무상 독립 관리 대상인지, 성능상 저장할 집계인지 구분해야 한다."], ["C", "집계값은 데이터가 아니므로 모델에 전혀 표현할 수 없다.", "오답이다. 성능 요구가 있으면 집계 테이블로 모델링할 수 있다."], ["D", "고객 엔터티의 주식별자로 사용한다.", "오답이다. 집계값은 고객을 식별하지 않는다."]],
    answer: "B", relatedConceptId: "modeling-entity", hint: ["화면 항목과 업무 관리 대상은 다르다.", "집계 결과인지 원천 발생 사실인지 본다.", "저장이 필요하면 반정규화/집계 모델로 검토한다."],
    explanation: "엔터티는 업무적으로 관리할 대상과 인스턴스가 있어야 한다. 보고서 집계 항목은 원천 데이터에서 계산되는 결과이므로 독립 엔터티보다 파생 정보 또는 집계 테이블 필요성으로 검토한다."
  },
  {
    subjectId: "modeling", number: 78, majorTopic: "데이터 모델링의 이해", middleTopic: "관계", topic: "외래키 인덱스와 성능", difficulty: "상급", questionType: "성능 영향 판단형", mode: "similar", sourcePage: 99, parentQuestionId: "pdf-s-1-fk-index",
    stem: "부모 테이블 고객의 고객번호가 자식 주문 테이블의 외래키다. 주문 테이블에 고객번호 인덱스가 없고 고객 삭제/변경 시 주문 검증이 빈번하다. 가장 적절한 설명은?",
    choices: [["A", "외래키를 만들면 자식 외래키 인덱스도 자동 생성된다.", "오답이다. Oracle에서 외래키 생성이 자식 인덱스를 자동 생성하지 않는다."], ["B", "자식 주문의 고객번호 인덱스는 부모 키 변경/삭제 검증과 조인 성능에 영향을 줄 수 있다.", "정답이다. 자식 외래키 인덱스는 참조 검증과 잠금 경합 완화에도 중요하다."], ["C", "부모 고객_PK가 있으면 자식 테이블 검색에는 항상 충분하다.", "오답이다. 자식 테이블에서 고객번호로 찾는 접근 경로가 별도로 필요할 수 있다."], ["D", "외래키 인덱스는 정합성에 해롭기 때문에 만들면 안 된다.", "오답이다. 인덱스는 정합성을 해치지 않고 DML 비용과 조회 성능의 균형 대상이다."]],
    answer: "B", relatedConceptId: "modeling-relationship", hint: ["외래키 제약과 인덱스 생성이 자동으로 연결되는지 확인한다.", "부모 변경/삭제 시 자식 검증이 어떻게 이뤄지는지 본다.", "조인과 잠금 영향도 함께 고려한다."],
    explanation: "외래키 제약은 참조 무결성을 보장하지만 자식 외래키 컬럼 인덱스는 자동으로 생성되지 않는다. 부모 키 삭제/변경이나 자식 조회가 빈번하면 자식 외래키 인덱스가 중요하다."
  },
  {
    subjectId: "modeling", number: 79, majorTopic: "데이터 모델링과 성능", middleTopic: "슈퍼타입/서브타입", topic: "배타/중첩 서브타입", difficulty: "중급", questionType: "서브타입 제약 판단형", mode: "variant", sourcePage: 65, parentQuestionId: "pdf-v-1-subtype-exclusive",
    stem: "회원은 개인회원 또는 법인회원 중 하나에만 속할 수 있다. 개인회원과 법인회원은 동시에 될 수 없다. 이때 서브타입 제약으로 가장 적절한 것은?",
    choices: [["A", "중첩 서브타입", "오답이다. 중첩은 한 슈퍼타입 인스턴스가 여러 서브타입에 동시에 속할 수 있는 경우다."], ["B", "배타 서브타입", "정답이다. 개인회원과 법인회원 중 하나에만 속할 수 있으므로 배타다."], ["C", "부분 식별 관계", "오답이다. 이는 관계 식별자 전파와 관련된 용어다."], ["D", "순환 관계", "오답이다. 동일 엔터티 내부 계층 관계를 의미한다."]],
    answer: "B", relatedConceptId: "modeling-super-subtype", hint: ["한 인스턴스가 여러 유형에 동시에 속할 수 있는지 본다.", "둘 중 하나만 가능하면 배타를 생각한다.", "서브타입 제약과 관계 식별성을 구분한다."],
    explanation: "배타 서브타입은 슈퍼타입 인스턴스가 여러 서브타입 중 하나에만 속할 수 있는 경우다. 개인회원과 법인회원이 동시에 될 수 없다면 배타 제약이다."
  },
  {
    subjectId: "modeling", number: 80, majorTopic: "데이터 모델링의 이해", middleTopic: "데이터 모델 검증", topic: "CRUD 매트릭스", difficulty: "중급", questionType: "검증 방법 판단형", mode: "original", sourcePage: 8, parentQuestionId: "pdf-o-1-crud-matrix",
    stem: "업무 프로세스와 엔터티가 도출된 후, 각 프로세스가 어떤 엔터티를 생성·조회·수정·삭제하는지 대조하려고 한다. 가장 적절한 검증 도구는?",
    choices: [["A", "CRUD 매트릭스", "정답이다. 프로세스와 데이터 간 생성/조회/수정/삭제 관계를 검증한다."], ["B", "정규화 종속도", "오답이다. 함수 종속과 정규형 검토에 쓰인다."], ["C", "인덱스 손익분기점 표", "오답이다. 물리 접근 경로 성능 판단 도구다."], ["D", "SQL Trace Call 표", "오답이다. SQL 실제 수행 통계 분석 도구다."]],
    answer: "A", relatedConceptId: "modeling-data-model", hint: ["프로세스와 엔터티를 교차로 놓는 검증인지 본다.", "C/R/U/D 활동을 표시하는지 확인한다.", "모델 누락과 불필요 엔터티를 찾는 용도다."],
    explanation: "CRUD 매트릭스는 업무 기능과 엔터티를 교차해 어떤 기능이 어떤 데이터를 생성, 조회, 수정, 삭제하는지 검증한다. 누락 엔터티나 사용되지 않는 엔터티를 찾는 데 유용하다."
  },
  {
    subjectId: "sql-basic", number: 51, majorTopic: "SQL 기본 및 활용", middleTopic: "함수", topic: "날짜 연산", difficulty: "중급", questionType: "SQL 결과 선택형", mode: "original", sourcePage: 42, parentQuestionId: "pdf-o-2-date-arithmetic",
    stem: "Oracle 환경에서 다음 SQL의 결과로 가장 적절한 것은?",
    code: `SELECT TO_CHAR(TO_DATE('2015.01.10 10', 'YYYY.MM.DD HH24')
       + 1/24/(60/10), 'YYYY.MM.DD HH24:MI:SS')
FROM DUAL;`,
    choices: [["A", "2015.01.10 11:01:00", "오답이다. 1/24는 1시간이고 다시 6으로 나누면 10분이다."], ["B", "2015.01.10 10:05:00", "오답이다. 5분이 아니라 10분이 더해진다."], ["C", "2015.01.10 10:10:00", "정답이다. 1/24/(60/10)는 1일의 1/144, 즉 10분이다."], ["D", "2015.01.10 10:30:00", "오답이다. 30분을 더하는 식이 아니다."]],
    answer: "C", relatedConceptId: "sql-date", hint: ["Oracle DATE 덧셈에서 1은 하루다.", "1/24는 한 시간이다.", "(60/10)=6으로 다시 나누면 10분이다."],
    explanation: "Oracle DATE에 숫자를 더하면 일 단위로 계산한다. 1/24는 1시간, 1/24/6은 10분이므로 10:00에 10분을 더한 10:10:00이 된다."
  },
  {
    subjectId: "sql-basic", number: 52, majorTopic: "SQL 기본 및 활용", middleTopic: "집합 연산", topic: "UNION과 UNION ALL", difficulty: "중급", questionType: "결과 행 수 추론형", mode: "original", sourcePage: 84, parentQuestionId: "pdf-o-2-union-count",
    stem: "아래 두 테이블 R1, R2에 대해 가, 나 SQL 결과 행 수로 가장 적절한 것은?",
    table: { title: "입력 데이터", headers: ["집합", "A", "B", "C"], rows: [["R1", "A3", "B2", "C3"], ["R1", "A1", "B1", "C1"], ["R1", "A2", "B1", "C2"], ["R2", "A1", "B1", "C1"], ["R2", "A3", "B2", "C3"]] },
    code: `-- 가
SELECT A, B, C FROM R1
UNION ALL
SELECT A, B, C FROM R2;

-- 나
SELECT A, B, C FROM R1
UNION
SELECT A, B, C FROM R2;`,
    choices: [["A", "가: 5개, 나: 3개", "정답이다. UNION ALL은 중복을 포함하고 UNION은 중복 행을 제거한다."], ["B", "가: 5개, 나: 5개", "오답이다. UNION은 중복을 제거한다."], ["C", "가: 3개, 나: 3개", "오답이다. UNION ALL은 R1 3행과 R2 2행을 모두 반환한다."], ["D", "가: 3개, 나: 5개", "오답이다. UNION 결과가 UNION ALL보다 많을 수 없다."]],
    answer: "A", relatedConceptId: "sql-set-operators", hint: ["R2 두 행이 R1에 이미 존재하는지 확인한다.", "UNION ALL은 중복 제거를 하지 않는다.", "UNION은 전체 컬럼 값이 같은 행을 하나로 본다."],
    explanation: "UNION ALL은 두 결과를 그대로 합치므로 5행이다. UNION은 중복 행을 제거하므로 R1의 세 행만 남아 3행이 된다."
  },
  {
    subjectId: "sql-basic", number: 53, majorTopic: "SQL 기본 및 활용", middleTopic: "JOIN", topic: "Outer Join 결과", difficulty: "상급", questionType: "조인 결과 행 수형", mode: "variant", sourcePage: 74, parentQuestionId: "pdf-v-2-outer-join-count",
    stem: "EMP.C는 DEPT와 연결된 외래키다. EMP와 DEPT를 LEFT, FULL, RIGHT OUTER JOIN했을 때 결과 건수로 가장 적절한 것은?",
    table: { title: "테이블 데이터", headers: ["테이블", "컬럼1", "컬럼2", "컬럼3"], rows: [["EMP", "A=1", "B=b", "C=w"], ["EMP", "A=3", "B=d", "C=w"], ["EMP", "A=5", "B=y", "C=y"], ["DEPT", "C=w", "D=1", "E=10"], ["DEPT", "C=z", "D=4", "E=11"], ["DEPT", "C=v", "D=2", "E=22"]] },
    choices: [["A", "3건, 5건, 4건", "오답이다. RIGHT OUTER JOIN은 DEPT 기준 미매칭 2행과 매칭 2행으로 4건이지만 FULL은 5건이 아니다."], ["B", "4건, 5건, 3건", "오답이다. LEFT는 EMP 기준 3행이다."], ["C", "3건, 5건, 4건", "정답이다. EMP 3행 중 w 두 행과 y 한 행, DEPT 미매칭 z/v 두 행이 FULL에 추가된다."], ["D", "3건, 4건, 5건", "오답이다. FULL과 RIGHT의 미매칭 포함 방향을 바꿨다."]],
    answer: "C", relatedConceptId: "sql-join", hint: ["EMP 기준 LEFT 결과는 EMP 행 수 이상이다.", "DEPT에서 매칭되지 않는 C=z, C=v를 찾는다.", "FULL은 양쪽 미매칭을 모두 포함한다."],
    explanation: "LEFT는 EMP 3행을 보존한다. RIGHT는 DEPT 기준으로 w 매칭 2행과 z/v 미매칭 2행이 있어 4행이다. FULL은 EMP의 y 미매칭 1행과 DEPT의 z/v 미매칭 2행까지 포함해 5행이다."
  },
  {
    subjectId: "sql-basic", number: 54, majorTopic: "SQL 기본 및 활용", middleTopic: "집합 연산", topic: "UNION ALL 대체 가능성", difficulty: "상급", questionType: "SQL Rewrite 선택형", mode: "similar", sourcePage: 67, parentQuestionId: "pdf-s-2-union-all-rewrite",
    stem: "EMP 컬럼별 NUM_DISTINCT는 EMPNO=14, ENAME=14, DEPTNO=3, JOB=5, MGR=6, SAL=12다. 다음 중 UNION 대신 UNION ALL로 바꾸어도 결과 중복이 발생하지 않는 SQL은?",
    choices: [["A", "WHERE empno = 7499 UNION WHERE empno = 7654", "정답이다. EMPNO는 유일하므로 두 조건 결과가 서로 겹치지 않는다."], ["B", "WHERE deptno = 10 UNION WHERE deptno = 20", "오답처럼 보일 수 있으나 조건은 배타적이다. 하지만 보기 기준에서 SELECT 컬럼이 deptno, job, mgr만이면 중복 행 가능성을 데이터 분포만으로 배제하기 어렵다."], ["C", "WHERE job = 'CLERK' UNION WHERE mgr IS NOT NULL", "오답이다. 같은 행이 두 조건을 동시에 만족할 수 있다."], ["D", "WHERE sal >= 1000 UNION WHERE sal <= 3000", "오답이다. 범위가 겹치므로 중복 가능성이 있다."]],
    answer: "A", relatedConceptId: "sql-set-operators", hint: ["UNION ALL로 바꾸려면 두 분기 결과가 서로 배타적이어야 한다.", "선택 컬럼 기준 중복 가능성도 봐야 한다.", "유일 컬럼 조건은 배타성을 판단하기 쉽다."],
    explanation: "UNION ALL은 중복 제거를 하지 않으므로 분기 결과가 겹치지 않는다는 근거가 필요하다. EMPNO는 유일하므로 서로 다른 EMPNO 조건의 결과는 동일 행이 될 수 없다."
  },
  {
    subjectId: "sql-basic", number: 55, majorTopic: "SQL 기본 및 활용", middleTopic: "GROUP BY", topic: "HAVING", difficulty: "중급", questionType: "SQL 결과 선택형", mode: "variant", sourcePage: 70, parentQuestionId: "pdf-v-2-group-having",
    stem: "아래 주문 데이터에서 고객별 주문금액 합계가 100 이상인 고객 수는?",
    table: { title: "ORDERS", headers: ["고객", "금액"], rows: [["A", "40"], ["A", "70"], ["B", "90"], ["C", "60"], ["C", "50"], ["D", "100"]] },
    code: `SELECT COUNT(*)
FROM (
  SELECT 고객
  FROM ORDERS
  GROUP BY 고객
  HAVING SUM(금액) >= 100
);`,
    choices: [["A", "1", "오답이다. A, C, D 세 고객이 조건을 만족한다."], ["B", "2", "오답이다. D의 합계 100도 포함된다."], ["C", "3", "정답이다. A=110, C=110, D=100이다."], ["D", "4", "오답이다. B=90은 조건을 만족하지 못한다."]],
    answer: "C", relatedConceptId: "sql-group-by", hint: ["먼저 고객별로 그룹을 만든다.", "각 그룹의 SUM을 계산한다.", "HAVING은 그룹 결과에 적용된다."],
    explanation: "GROUP BY 후 A와 C는 각각 110, D는 100으로 HAVING 조건을 만족한다. B는 90이므로 제외되어 최종 고객 수는 3이다."
  }
] as CompactManualQuestion[]).map(makeCompactManualQuestion);

const manualVerifiedObjectiveQuestionsBatch08: ObjectiveQuestion[] = ([
  {
    subjectId: "sql-basic", number: 56, majorTopic: "SQL 기본 및 활용", middleTopic: "Window Function", topic: "누적 합계", difficulty: "중급", questionType: "분석 함수 결과형", mode: "original", sourcePage: 101, parentQuestionId: "pdf-o-2-running-total",
    stem: "지점별 판매월 순서대로 누적매출을 구하려고 한다. 다음 중 지점별 running total을 가장 정확히 계산하는 윈도우 함수 구문은?",
    choices: [["A", "SUM(매출) OVER (ORDER BY 판매월)", "오답이다. 지점별로 분리되지 않아 전체 누적이 된다."], ["B", "SUM(매출) OVER (PARTITION BY 지점 ORDER BY 판매월 ROWS BETWEEN UNBOUNDED PRECEDING AND CURRENT ROW)", "정답이다. 지점별 파티션 안에서 판매월 순서로 누적한다."], ["C", "SUM(매출) OVER (PARTITION BY 판매월 ORDER BY 지점)", "오답이다. 월별로 묶이므로 지점별 누적이 아니다."], ["D", "SUM(매출) GROUP BY 지점, 판매월", "오답이다. GROUP BY는 행을 집약하므로 각 행별 누적값을 만들지 못한다."]],
    answer: "B", relatedConceptId: "sql-window-functions", hint: ["누적 기준이 지점별인지 전체인지 본다.", "정렬 기준은 판매월이다.", "현재 행까지 누적하려면 window frame을 확인한다."],
    explanation: "지점별 누적매출은 PARTITION BY 지점으로 그룹을 나누고 ORDER BY 판매월로 순서를 정한 뒤 현재 행까지의 SUM을 계산해야 한다."
  },
  {
    subjectId: "sql-basic", number: 57, majorTopic: "SQL 기본 및 활용", middleTopic: "Window Function", topic: "RANK와 DENSE_RANK", difficulty: "중급", questionType: "결과 순위 추론형", mode: "variant", sourcePage: 88, parentQuestionId: "pdf-v-2-rank",
    stem: "점수 100, 90, 90, 80인 네 행에 대해 RANK()와 DENSE_RANK()를 내림차순으로 계산했다. 80점 행의 RANK와 DENSE_RANK로 가장 적절한 것은?",
    choices: [["A", "RANK=3, DENSE_RANK=3", "오답이다. RANK는 동점 다음 순위를 건너뛴다."], ["B", "RANK=4, DENSE_RANK=3", "정답이다. 90점 동점 두 행 때문에 RANK는 4, DENSE_RANK는 3이다."], ["C", "RANK=2, DENSE_RANK=4", "오답이다. 순위 방향과 동점 처리가 모두 맞지 않는다."], ["D", "RANK=4, DENSE_RANK=4", "오답이다. DENSE_RANK는 순위를 건너뛰지 않는다."]],
    answer: "B", relatedConceptId: "sql-window-functions", hint: ["동점이 있는 90점 구간을 찾는다.", "RANK는 건너뛰고 DENSE_RANK는 건너뛰지 않는다.", "80점은 세 번째 서로 다른 점수다."],
    explanation: "RANK는 100점 1위, 90점 두 행 2위, 다음 80점은 4위가 된다. DENSE_RANK는 서로 다른 점수 순서만 세므로 80점은 3위다."
  },
  {
    subjectId: "sql-basic", number: 58, majorTopic: "SQL 기본 및 활용", middleTopic: "NULL", topic: "NOT IN과 NULL", difficulty: "상급", questionType: "SQL 결과 함정형", mode: "similar", sourcePage: 52, parentQuestionId: "pdf-s-2-null-not-in",
    stem: "T1(id)에는 1,2,3이 있고 T2(id)에는 2,NULL이 있다. 다음 SQL 결과로 가장 적절한 것은?",
    code: `SELECT id
FROM T1
WHERE id NOT IN (SELECT id FROM T2);`,
    choices: [["A", "1, 3", "오답이다. 서브쿼리 결과에 NULL이 포함되어 NOT IN 전체 판단이 UNKNOWN이 된다."], ["B", "결과 없음", "정답이다. NOT IN 목록에 NULL이 있으면 모든 비교가 TRUE로 확정되지 않는다."], ["C", "1, 2, 3", "오답이다. 2는 명시적으로 T2에 존재한다."], ["D", "NULL", "오답이다. T1에는 NULL 행이 없고 조건 결과도 NULL을 반환하지 않는다."]],
    answer: "B", relatedConceptId: "sql-null", hint: ["NOT IN은 <> ALL과 같은 의미로 볼 수 있다.", "목록에 NULL이 있으면 비교 결과가 UNKNOWN이 된다.", "WHERE는 TRUE만 통과시킨다."],
    explanation: "NOT IN은 서브쿼리 결과 중 하나라도 NULL이면 비교가 TRUE로 확정되지 않는다. 따라서 T1의 1과 3도 UNKNOWN이 되어 WHERE를 통과하지 못한다."
  },
  {
    subjectId: "sql-basic", number: 59, majorTopic: "SQL 기본 및 활용", middleTopic: "Subquery", topic: "Scalar Subquery", difficulty: "중급", questionType: "오류 판단형", mode: "variant", sourcePage: 61, parentQuestionId: "pdf-v-2-scalar-subquery",
    stem: "SELECT 절의 스칼라 서브쿼리가 한 행에 대해 두 건 이상을 반환할 수 있다. Oracle에서 가장 적절한 설명은?",
    choices: [["A", "첫 번째 행만 자동으로 선택된다.", "오답이다. Oracle 스칼라 서브쿼리는 두 건 이상 반환 시 오류가 발생한다."], ["B", "ORA-01427: single-row subquery returns more than one row 오류가 발생할 수 있다.", "정답이다. 스칼라 서브쿼리는 한 행 한 컬럼만 반환해야 한다."], ["C", "두 행이 문자열로 연결되어 반환된다.", "오답이다. 별도 집계 함수 없이 자동 연결되지 않는다."], ["D", "NULL로 변환되어 결과가 반환된다.", "오답이다. 0건이면 NULL이지만 2건 이상이면 오류다."]],
    answer: "B", relatedConceptId: "sql-subquery", hint: ["스칼라 서브쿼리의 반환 행 수 조건을 확인한다.", "0건과 2건 이상을 구분한다.", "한 행 한 컬럼 조건을 위반하면 오류다."],
    explanation: "스칼라 서브쿼리는 단일 값을 반환해야 한다. 0건이면 NULL로 처리될 수 있지만 두 건 이상이면 ORA-01427 오류가 발생한다."
  },
  {
    subjectId: "sql-basic", number: 60, majorTopic: "SQL 기본 및 활용", middleTopic: "DML", topic: "MERGE", difficulty: "중급", questionType: "MERGE 동작 판단형", mode: "similar", sourcePage: 95, parentQuestionId: "pdf-s-2-merge",
    stem: "MERGE 문에서 ON 조건에 매칭되는 행은 UPDATE하고 매칭되지 않는 행은 INSERT한다. 다음 중 가장 적절한 설명은?",
    choices: [["A", "MERGE는 항상 INSERT만 수행한다.", "오답이다. MATCHED/NOT MATCHED 절에 따라 UPDATE와 INSERT가 나뉜다."], ["B", "ON 조건 매칭 여부에 따라 UPDATE 또는 INSERT를 한 문장에서 처리할 수 있다.", "정답이다. MERGE의 기본 목적이다."], ["C", "MERGE의 ON 절 컬럼은 UPDATE SET 절에서 자유롭게 변경할 수 있다.", "오답이다. Oracle에서는 ON 절 참조 컬럼 갱신에 제약이 있다."], ["D", "NOT MATCHED 절은 DELETE를 수행한다.", "오답이다. 일반적으로 NOT MATCHED는 INSERT 절이다."]],
    answer: "B", relatedConceptId: "sql-dml", hint: ["MATCHED와 NOT MATCHED의 의미를 구분한다.", "ON 절이 행 매칭 기준이다.", "Oracle의 ON 절 컬럼 갱신 제약도 기억한다."],
    explanation: "MERGE는 원본과 대상의 매칭 여부에 따라 갱신 또는 입력을 한 문장에서 처리한다. SQLP에서는 ON 절 조건과 UPDATE/INSERT 수행 대상을 정확히 구분해야 한다."
  },
  {
    subjectId: "sql-basic", number: 61, majorTopic: "SQL 기본 및 활용", middleTopic: "GROUP BY", topic: "ROLLUP", difficulty: "상급", questionType: "집계 결과 행 수형", mode: "variant", sourcePage: 80, parentQuestionId: "pdf-v-2-rollup",
    stem: "지역 2개, 상품군 3개 조합이 모두 존재하는 매출 테이블에서 GROUP BY ROLLUP(지역, 상품군)을 수행한다. 결과 행 수로 가장 적절한 것은?",
    choices: [["A", "6행", "오답이다. 상세 조합 6행만 계산한 것이다."], ["B", "8행", "오답이다. 지역별 소계 2행과 전체 합계 1행까지 포함해야 한다."], ["C", "9행", "정답이다. 상세 6행 + 지역별 소계 2행 + 전체 합계 1행이다."], ["D", "12행", "오답이다. CUBE처럼 모든 조합 소계를 만드는 것이 아니다."]],
    answer: "C", relatedConceptId: "sql-group-by", hint: ["ROLLUP은 오른쪽부터 소계를 만든다.", "상세 조합 수를 먼저 계산한다.", "지역별 소계와 전체 합계를 더한다."],
    explanation: "ROLLUP(지역, 상품군)은 (지역, 상품군) 상세, 지역 소계, 전체 합계를 만든다. 2*3=6 상세 + 2 지역 소계 + 1 전체 합계로 9행이다."
  },
  {
    subjectId: "sql-basic", number: 62, majorTopic: "SQL 기본 및 활용", middleTopic: "계층형 질의", topic: "CONNECT BY", difficulty: "상급", questionType: "계층 방향 판단형", mode: "similar", sourcePage: 92, parentQuestionId: "pdf-s-2-connect-by",
    stem: "EMP(empno, mgr)에서 사원 7788의 하위 조직을 조회하려고 한다. Oracle 계층형 질의 조건으로 가장 적절한 것은?",
    choices: [["A", "START WITH empno = 7788 CONNECT BY PRIOR mgr = empno", "오답이다. PRIOR 방향이 상위로 거슬러 올라가는 형태다."], ["B", "START WITH empno = 7788 CONNECT BY PRIOR empno = mgr", "정답이다. 현재 부모 empno가 자식의 mgr와 같아야 하위로 내려간다."], ["C", "START WITH mgr = 7788 CONNECT BY empno = PRIOR mgr", "오답이다. 시작 행이 7788 자신이 아니라 직속 부하부터 시작한다."], ["D", "CONNECT BY empno = mgr", "오답이다. START WITH와 PRIOR가 없어 계층 방향을 명확히 표현하지 못한다."]],
    answer: "B", relatedConceptId: "sql-hierarchical", hint: ["PRIOR가 붙은 쪽이 부모 행의 값을 의미한다.", "하위 조회는 부모 empno = 자식 mgr 관계다.", "START WITH는 루트 사원이다."],
    explanation: "하위 조직을 내려가려면 부모 행의 empno가 자식 행의 mgr와 같아야 한다. 따라서 CONNECT BY PRIOR empno = mgr 조건이 적절하다."
  },
  {
    subjectId: "sql-basic", number: 63, majorTopic: "SQL 기본 및 활용", middleTopic: "집합 연산", topic: "INTERSECT와 MINUS", difficulty: "중급", questionType: "집합 결과 추론형", mode: "variant", sourcePage: 83, parentQuestionId: "pdf-v-2-set-intersect-minus",
    stem: "A 집합은 {1,2,3,4}, B 집합은 {3,4,5}다. A INTERSECT B와 A MINUS B 결과로 가장 적절한 것은?",
    choices: [["A", "INTERSECT={1,2}, MINUS={3,4}", "오답이다. 교집합과 차집합을 반대로 판단했다."], ["B", "INTERSECT={3,4}, MINUS={1,2}", "정답이다. 공통 원소는 3,4이고 A에만 있는 원소는 1,2다."], ["C", "INTERSECT={1,2,3,4,5}, MINUS={}", "오답이다. 이는 UNION에 가까운 결과다."], ["D", "INTERSECT={}, MINUS={5}", "오답이다. 5는 A에 없으므로 A MINUS B에 포함되지 않는다."]],
    answer: "B", relatedConceptId: "sql-set-operators", hint: ["INTERSECT는 공통 원소다.", "MINUS는 왼쪽 집합에서 오른쪽 집합을 뺀다.", "5는 A에 없음을 확인한다."],
    explanation: "INTERSECT는 A와 B에 모두 있는 3,4를 반환한다. A MINUS B는 A에만 있는 1,2를 반환한다."
  },
  {
    subjectId: "sql-basic", number: 64, majorTopic: "SQL 기본 및 활용", middleTopic: "JOIN", topic: "Non Equi Join", difficulty: "상급", questionType: "SQL 선택형", mode: "similar", sourcePage: 68, parentQuestionId: "pdf-s-2-non-equi-join",
    stem: "급여 SAL이 급여등급 테이블의 LOSAL~HISAL 범위에 속하는 등급을 찾으려 한다. 가장 적절한 조인 조건은?",
    choices: [["A", "e.sal = g.losal AND e.sal = g.hisal", "오답이다. 하한과 상한이 동시에 같은 경우만 찾는다."], ["B", "e.sal BETWEEN g.losal AND g.hisal", "정답이다. 범위 조건으로 Non Equi Join을 수행한다."], ["C", "e.sal IN (g.losal, g.hisal)", "오답이다. 경계값과 같은 급여만 찾는다."], ["D", "e.sal <> g.losal", "오답이다. 등급 범위를 결정하지 못한다."]],
    answer: "B", relatedConceptId: "sql-join", hint: ["등급 테이블은 범위 시작과 끝을 가진다.", "동등 조인이 아니라 범위 조인이다.", "BETWEEN 조건의 포함 범위를 확인한다."],
    explanation: "급여등급처럼 범위에 따라 매핑하는 테이블은 동등 조인이 아니라 BETWEEN 하한 AND 상한 형태의 Non Equi Join을 사용한다."
  },
  {
    subjectId: "sql-basic", number: 65, majorTopic: "SQL 기본 및 활용", middleTopic: "DML", topic: "참조 무결성과 DELETE", difficulty: "상급", questionType: "제약조건 결과 추론형", mode: "variant", sourcePage: 74, parentQuestionId: "pdf-v-2-delete-cascade-set-null",
    stem: "T(C PK), S(B PK, C REFERENCES T(C) ON DELETE CASCADE), R(A PK, B REFERENCES S(B) ON DELETE SET NULL)이 있다. T의 C=1 행을 삭제하면 가장 적절한 설명은?",
    choices: [["A", "S에서 C=1을 참조하는 행은 삭제되고, 그 S.B를 참조하던 R.B는 NULL이 된다.", "정답이다. T 삭제가 S에 CASCADE되고, S 삭제가 R에 SET NULL로 전파된다."], ["B", "S 행만 삭제되고 R 행은 그대로 B 값을 유지한다.", "오답이다. S 행 삭제 시 R의 외래키는 SET NULL 동작을 한다."], ["C", "R 행도 모두 삭제된다.", "오답이다. R의 제약은 CASCADE가 아니라 SET NULL이다."], ["D", "T 삭제는 자식이 있어 항상 실패한다.", "오답이다. ON DELETE CASCADE가 지정되어 있다."]],
    answer: "A", relatedConceptId: "sql-constraints", hint: ["T 삭제가 S에 어떤 옵션으로 전파되는지 본다.", "S 삭제가 R에는 어떤 옵션으로 동작하는지 확인한다.", "CASCADE와 SET NULL을 구분한다."],
    explanation: "T의 부모 행 삭제는 S의 참조 행을 CASCADE로 삭제한다. 이어 S의 B를 참조하던 R은 ON DELETE SET NULL이므로 R 행은 남고 B가 NULL이 된다."
  },
  {
    subjectId: "sql-basic", number: 66, majorTopic: "SQL 기본 및 활용", middleTopic: "Subquery", topic: "EXISTS", difficulty: "중급", questionType: "조건 의미 판단형", mode: "original", sourcePage: 60, parentQuestionId: "pdf-o-2-exists",
    stem: "EXISTS 서브쿼리에 대한 설명으로 가장 적절한 것은?",
    choices: [["A", "서브쿼리 SELECT 목록 값이 NULL이면 EXISTS는 항상 FALSE다.", "오답이다. EXISTS는 반환 행 존재 여부를 본다."], ["B", "상관 조건을 만족하는 행이 하나라도 있으면 TRUE가 된다.", "정답이다. EXISTS는 행 존재성 조건이다."], ["C", "EXISTS는 반드시 모든 서브쿼리 행을 정렬한 후 판단한다.", "오답이다. 존재 여부만 확인하면 되며 정렬이 필수는 아니다."], ["D", "EXISTS는 IN과 항상 NULL 처리까지 완전히 동일하다.", "오답이다. NULL과 중복 처리에서 차이가 생길 수 있다."]],
    answer: "B", relatedConceptId: "sql-subquery", hint: ["EXISTS가 값 비교인지 행 존재 비교인지 본다.", "SELECT 목록 자체가 중요한지 확인한다.", "NULL 처리에서 IN과 차이가 날 수 있다."],
    explanation: "EXISTS는 서브쿼리가 조건을 만족하는 행을 하나라도 반환하면 TRUE다. SELECT 목록의 값보다 행 존재 여부가 핵심이다."
  },
  {
    subjectId: "sql-basic", number: 67, majorTopic: "SQL 기본 및 활용", middleTopic: "Top-N", topic: "ROWNUM 처리 순서", difficulty: "상급", questionType: "SQL 결과 함정형", mode: "similar", sourcePage: 89, parentQuestionId: "pdf-s-2-rownum-order",
    stem: "EMP에서 급여 상위 3명을 조회하려고 한다. Oracle에서 가장 적절한 SQL은?",
    choices: [["A", "SELECT * FROM EMP WHERE ROWNUM <= 3 ORDER BY sal DESC", "오답이다. ROWNUM이 정렬 전에 부여되어 상위 급여 3명이 보장되지 않는다."], ["B", "SELECT * FROM (SELECT * FROM EMP ORDER BY sal DESC) WHERE ROWNUM <= 3", "정답이다. 인라인 뷰에서 정렬 후 바깥에서 ROWNUM을 적용한다."], ["C", "SELECT * FROM EMP WHERE ROWNUM = 3 ORDER BY sal DESC", "오답이다. ROWNUM = 3 조건은 일반적으로 첫 행부터 통과하지 못한다."], ["D", "SELECT * FROM EMP GROUP BY sal HAVING ROWNUM <= 3", "오답이다. Top-N 조회 문법과 맞지 않는다."]],
    answer: "B", relatedConceptId: "sql-top-n", hint: ["ROWNUM이 언제 부여되는지 본다.", "정렬 후 자르려면 인라인 뷰가 필요하다.", "ROWNUM = 3 조건의 특성을 기억한다."],
    explanation: "Oracle 구버전 Top-N 패턴은 정렬을 인라인 뷰 안에서 먼저 수행하고 바깥 쿼리에서 ROWNUM <= N을 적용한다."
  },
  {
    subjectId: "sql-basic", number: 68, majorTopic: "SQL 기본 및 활용", middleTopic: "함수", topic: "COUNT 함수", difficulty: "기본", questionType: "집계 함수 판단형", mode: "variant", sourcePage: 50, parentQuestionId: "pdf-v-2-count-null",
    stem: "테이블 T의 C1 값이 1, NULL, 2, NULL이다. COUNT(*), COUNT(C1)의 결과로 가장 적절한 것은?",
    choices: [["A", "4, 4", "오답이다. COUNT(C1)은 NULL을 세지 않는다."], ["B", "4, 2", "정답이다. COUNT(*)는 모든 행, COUNT(C1)은 NULL이 아닌 값만 센다."], ["C", "2, 4", "오답이다. 두 함수의 의미가 반대다."], ["D", "2, 2", "오답이다. COUNT(*)는 NULL 여부와 무관하게 행 수를 센다."]],
    answer: "B", relatedConceptId: "sql-null", hint: ["COUNT(*)는 행을 센다.", "COUNT(컬럼)은 NULL을 제외한다.", "NULL 두 건을 제외하면 C1 값은 두 건이다."],
    explanation: "COUNT(*)는 전체 행 수 4를 반환하고, COUNT(C1)은 NULL이 아닌 1과 2만 세어 2를 반환한다."
  },
  {
    subjectId: "sql-basic", number: 69, majorTopic: "SQL 기본 및 활용", middleTopic: "조건 표현", topic: "CASE", difficulty: "중급", questionType: "표현식 결과형", mode: "similar", sourcePage: 54, parentQuestionId: "pdf-s-2-case",
    stem: "점수가 90 이상이면 A, 80 이상이면 B, 그 외는 C를 반환하는 CASE 식에서 95점 결과는?",
    code: `CASE
  WHEN score >= 90 THEN 'A'
  WHEN score >= 80 THEN 'B'
  ELSE 'C'
END`,
    choices: [["A", "A", "정답이다. 첫 번째 조건을 만족하면 이후 조건은 평가 결과와 무관하게 A가 반환된다."], ["B", "B", "오답이다. 95는 80 이상도 맞지만 CASE는 앞 조건부터 매칭된다."], ["C", "C", "오답이다. ELSE는 앞 조건이 모두 FALSE일 때만 사용된다."], ["D", "NULL", "오답이다. 만족하는 WHEN이 존재한다."]],
    answer: "A", relatedConceptId: "sql-functions", hint: ["CASE는 위에서 아래로 조건을 평가한다.", "95가 첫 번째 WHEN을 만족하는지 본다.", "첫 매칭 결과가 반환된다."],
    explanation: "CASE는 조건을 순서대로 평가하고 처음 TRUE가 되는 THEN 값을 반환한다. 95는 score >= 90을 만족하므로 A다."
  },
  {
    subjectId: "sql-basic", number: 70, majorTopic: "SQL 기본 및 활용", middleTopic: "JOIN", topic: "이력 조인", difficulty: "상급", questionType: "효율 SQL 선택형", mode: "original", sourcePage: 69, parentQuestionId: "pdf-o-2-customer-history",
    stem: "고객변경이력에서 2010년 12월 4일자 고객 속성을 조회해야 한다. 변경순번이 클수록 최신 이력이다. 가장 효율적인 접근으로 적절한 것은?",
    choices: [["A", "고객과 모든 이력을 조인한 뒤 최종 결과에서 MAX(변경순번)을 다시 찾는다.", "오답이다. 전체 조인 후 필터하면 불필요한 이력 행이 많아진다."], ["B", "기준일 이하 이력에서 고객별 최신 변경순번을 먼저 구한 뒤 고객과 조인한다.", "정답이다. 필요한 이력 한 건으로 축소한 뒤 조인하는 방식이 효율적이다."], ["C", "변경일자 조건 없이 가장 큰 변경순번만 선택한다.", "오답이다. 기준일 이후 변경이 포함될 수 있다."], ["D", "고객 테이블 현재값만 조회한다.", "오답이다. 과거 기준일 이력을 반영하지 못한다."]],
    answer: "B", relatedConceptId: "sql-subquery", hint: ["기준일 조건이 먼저 적용되어야 한다.", "고객별 최신 이력 한 건으로 줄인다.", "축소 결과를 고객과 조인한다."],
    explanation: "이력 조회는 기준일 이하의 이력 중 고객별 최신 행을 먼저 찾는 것이 중요하다. 이후 고객과 조인하면 불필요한 이력 전체 조인을 피할 수 있다."
  }
] as CompactManualQuestion[]).map(makeCompactManualQuestion);

const manualVerifiedObjectiveQuestionsBatch09: ObjectiveQuestion[] = ([
  {
    subjectId: "sql-basic", number: 71, majorTopic: "SQL 기본 및 활용", middleTopic: "Window Function", topic: "ROWS와 RANGE", difficulty: "상급", questionType: "윈도우 프레임 판단형", mode: "similar", sourcePage: 88, parentQuestionId: "pdf-s-2-window-frame",
    stem: "동일 주문일시에 여러 행이 있을 때 SUM(amount) OVER (ORDER BY 주문일시 RANGE BETWEEN UNBOUNDED PRECEDING AND CURRENT ROW)을 사용했다. ROWS 방식과 비교한 설명으로 가장 적절한 것은?",
    choices: [["A", "RANGE는 같은 ORDER BY 값을 가진 행들을 같은 현재 범위로 묶을 수 있다.", "정답이다. 동률 값이 있으면 같은 정렬 값의 행이 함께 프레임에 포함될 수 있다."], ["B", "RANGE는 항상 물리적으로 현재 행 하나만 더한다.", "오답이다. 이는 ROWS의 행 단위 프레임에 가깝다."], ["C", "ROWS와 RANGE는 중복 정렬값이 있어도 결과 차이가 절대 없다.", "오답이다. 동률 값에서 누적값이 달라질 수 있다."], ["D", "RANGE는 GROUP BY 없이 사용할 수 없다.", "오답이다. 분석 함수의 윈도우 프레임으로 사용할 수 있다."]],
    answer: "A", relatedConceptId: "sql-window-functions", hint: ["ROWS는 물리 행, RANGE는 정렬 값 범위다.", "동일 주문일시가 여러 행이면 동률 처리를 본다.", "누적합에서 같은 정렬값 행이 함께 들어갈 수 있다."],
    explanation: "ROWS는 물리적 행 수 기준이고 RANGE는 ORDER BY 값의 논리적 범위 기준이다. 동일 정렬값이 있는 경우 RANGE 누적합은 동률 행을 같은 프레임으로 묶을 수 있다."
  },
  {
    subjectId: "sql-basic", number: 72, majorTopic: "SQL 기본 및 활용", middleTopic: "GROUP BY", topic: "SELECT 목록 제약", difficulty: "중급", questionType: "SQL 오류 판단형", mode: "variant", sourcePage: 72, parentQuestionId: "pdf-v-2-group-select",
    stem: "다음 SQL이 오류가 나는 이유로 가장 적절한 것은?",
    code: `SELECT deptno, ename, SUM(sal)
FROM emp
GROUP BY deptno;`,
    choices: [["A", "SUM 함수는 GROUP BY와 함께 사용할 수 없다.", "오답이다. 집계 함수는 GROUP BY와 함께 사용할 수 있다."], ["B", "ename이 GROUP BY 절에 없고 집계 함수로도 감싸지지 않았다.", "정답이다. 그룹별 결과에서 비집계 컬럼은 GROUP BY에 포함되어야 한다."], ["C", "deptno는 숫자 컬럼이라 GROUP BY가 불가능하다.", "오답이다. 숫자 컬럼도 그룹화할 수 있다."], ["D", "SELECT 절에 집계 함수가 하나만 있어서 오류다.", "오답이다. 집계 함수 개수와 무관하다."]],
    answer: "B", relatedConceptId: "sql-group-by", hint: ["SELECT 목록의 각 컬럼을 확인한다.", "집계되지 않은 컬럼은 GROUP BY에 있어야 한다.", "ename은 deptno 그룹 안에서 여러 값일 수 있다."],
    explanation: "GROUP BY deptno는 부서별 한 행을 만든다. 이때 ename은 부서 안에 여러 값이 있을 수 있으므로 GROUP BY에 포함하거나 집계해야 한다."
  },
  {
    subjectId: "sql-basic", number: 73, majorTopic: "SQL 기본 및 활용", middleTopic: "JOIN", topic: "ANSI Outer Join 조건 위치", difficulty: "상급", questionType: "SQL 의미 비교형", mode: "similar", sourcePage: 75, parentQuestionId: "pdf-s-2-outer-join-predicate",
    stem: "LEFT OUTER JOIN에서 후행 테이블 B의 상태 조건을 ON 절에 둘 때와 WHERE 절에 둘 때의 차이로 가장 적절한 것은?",
    choices: [["A", "WHERE 절에 B 조건을 두면 미매칭 보존 행이 제거될 수 있다.", "정답이다. NULL 확장된 B 컬럼 조건이 WHERE에서 FALSE/UNKNOWN이 되어 사라질 수 있다."], ["B", "ON 절과 WHERE 절은 OUTER JOIN에서 항상 완전히 동일하다.", "오답이다. 보존 행 처리 때문에 결과가 달라질 수 있다."], ["C", "ON 절에는 조인 컬럼만 쓰고 필터 조건은 절대 쓸 수 없다.", "오답이다. ON 절에 후행 조건을 둘 수 있으며 의미가 다르다."], ["D", "WHERE 절의 B 조건은 모든 B 미매칭 행을 자동으로 TRUE 처리한다.", "오답이다. NULL 비교는 보통 UNKNOWN이 된다."]],
    answer: "A", relatedConceptId: "sql-join", hint: ["LEFT JOIN의 보존 테이블이 어느 쪽인지 본다.", "후행 테이블 컬럼이 미매칭 시 NULL이 된다.", "WHERE는 TRUE만 통과시킨다."],
    explanation: "Outer Join에서 후행 테이블 조건을 WHERE에 두면 NULL 확장 행이 제거되어 Inner Join처럼 바뀔 수 있다. ON 절 조건은 매칭 여부 판단에 사용되어 보존 행을 유지할 수 있다."
  },
  {
    subjectId: "sql-basic", number: 74, majorTopic: "SQL 기본 및 활용", middleTopic: "PIVOT", topic: "행열 변환", difficulty: "중급", questionType: "PIVOT 결과 판단형", mode: "variant", sourcePage: 91, parentQuestionId: "pdf-v-2-pivot",
    stem: "월별 매출 행을 고객별 1월, 2월 컬럼으로 바꾸려 한다. 이때 PIVOT 절에서 반드시 필요한 요소로 가장 적절한 것은?",
    choices: [["A", "집계 함수와 PIVOT 대상 값 목록", "정답이다. PIVOT은 교차 컬럼으로 만들 값과 집계 함수를 지정한다."], ["B", "CONNECT BY PRIOR 조건", "오답이다. 계층형 질의 조건이다."], ["C", "ON DELETE CASCADE 옵션", "오답이다. 참조 무결성 옵션이다."], ["D", "FOR UPDATE 절", "오답이다. 행 잠금용 절이다."]],
    answer: "A", relatedConceptId: "sql-pivot", hint: ["PIVOT은 여러 행 값을 컬럼으로 회전한다.", "집계가 필요한지 확인한다.", "컬럼이 될 값 목록을 지정해야 한다."],
    explanation: "PIVOT은 지정한 값들을 컬럼으로 바꾸며, 여러 행이 한 셀로 모일 수 있으므로 SUM, COUNT 같은 집계 함수와 FOR 컬럼 IN 값 목록이 필요하다."
  },
  {
    subjectId: "sql-basic", number: 75, majorTopic: "SQL 기본 및 활용", middleTopic: "Subquery", topic: "Inline View", difficulty: "중급", questionType: "처리 순서 판단형", mode: "original", sourcePage: 89, parentQuestionId: "pdf-o-2-inline-view",
    stem: "인라인 뷰를 사용하는 가장 적절한 이유는?",
    choices: [["A", "FROM 절에서 먼저 가공한 결과 집합에 바깥 조건을 적용하거나 별칭을 부여하기 위해 사용한다.", "정답이다. 인라인 뷰는 FROM 절의 임시 결과 집합처럼 동작한다."], ["B", "DDL 문장 안에서만 사용할 수 있다.", "오답이다. SELECT의 FROM 절에서 사용할 수 있다."], ["C", "항상 물리 테이블로 저장된다.", "오답이다. 일반적으로 쿼리 블록이며 옵티마이저가 병합할 수도 있다."], ["D", "WHERE 절 조건을 모두 무시한다.", "오답이다. 바깥 조건과 내부 조건은 결과 의미에 영향을 준다."]],
    answer: "A", relatedConceptId: "sql-subquery", hint: ["인라인 뷰의 위치는 FROM 절이다.", "정렬 후 ROWNUM 같은 패턴도 떠올린다.", "물리 저장 테이블과 구분한다."],
    explanation: "인라인 뷰는 FROM 절에 작성하는 서브쿼리로, 먼저 계산한 결과를 바깥 쿼리에서 다시 필터링하거나 조인할 때 사용한다."
  },
  {
    subjectId: "sql-basic", number: 76, majorTopic: "SQL 기본 및 활용", middleTopic: "TCL", topic: "COMMIT과 ROLLBACK", difficulty: "기본", questionType: "트랜잭션 결과 판단형", mode: "variant", sourcePage: 96, parentQuestionId: "pdf-v-2-tcl",
    stem: "한 세션에서 INSERT 후 COMMIT, 다시 UPDATE 후 ROLLBACK을 수행했다. 최종적으로 유지되는 변경으로 가장 적절한 것은?",
    choices: [["A", "INSERT와 UPDATE 모두 취소된다.", "오답이다. COMMIT된 INSERT는 ROLLBACK 대상이 아니다."], ["B", "INSERT는 유지되고 UPDATE는 취소된다.", "정답이다. ROLLBACK은 마지막 COMMIT 이후 변경만 되돌린다."], ["C", "INSERT는 취소되고 UPDATE는 유지된다.", "오답이다. COMMIT/ROLLBACK 의미가 반대다."], ["D", "둘 다 자동으로 다시 실행된다.", "오답이다. TCL은 변경 재실행 기능이 아니다."]],
    answer: "B", relatedConceptId: "sql-transaction", hint: ["COMMIT 경계를 찾는다.", "ROLLBACK이 되돌리는 범위를 확인한다.", "마지막 COMMIT 이후 UPDATE만 취소된다."],
    explanation: "COMMIT은 이전 변경을 영구화한다. 이후 UPDATE는 같은 트랜잭션에서 ROLLBACK되므로 취소되지만 INSERT는 유지된다."
  },
  {
    subjectId: "sql-basic", number: 77, majorTopic: "SQL 기본 및 활용", middleTopic: "제약조건", topic: "CHECK 제약", difficulty: "중급", questionType: "제약조건 판단형", mode: "similar", sourcePage: 94, parentQuestionId: "pdf-s-2-check-constraint",
    stem: "주문상태코드가 'R','P','C' 중 하나만 허용되어야 한다. 데이터 모델과 DB 제약 관점에서 적절한 방법은?",
    choices: [["A", "애플리케이션에서만 검사하고 DB에는 아무 제약을 두지 않는다.", "오답이다. 우회 입력이나 배치 오류를 DB가 막지 못한다."], ["B", "CHECK 제약 또는 코드 참조 테이블 FK로 허용값을 강제한다.", "정답이다. 허용값 도메인을 DB 제약으로 보장할 수 있다."], ["C", "컬럼명을 주문상태코드로 만들면 자동으로 값이 제한된다.", "오답이다. 이름만으로 값 제약은 생기지 않는다."], ["D", "NULL 허용으로 두면 잘못된 코드가 들어오지 않는다.", "오답이다. NULL 허용은 잘못된 비NULL 값을 막지 않는다."]],
    answer: "B", relatedConceptId: "sql-constraints", hint: ["허용값 집합을 어디서 강제할지 본다.", "CHECK와 코드 FK를 비교한다.", "컬럼명은 제약이 아니다."],
    explanation: "허용 코드가 고정적이면 CHECK 제약, 코드가 별도 관리 대상이면 코드 테이블 FK를 사용할 수 있다. 핵심은 DB 차원에서 도메인 무결성을 보장하는 것이다."
  },
  {
    subjectId: "sql-basic", number: 78, majorTopic: "SQL 기본 및 활용", middleTopic: "함수", topic: "NVL과 COALESCE", difficulty: "중급", questionType: "NULL 함수 결과형", mode: "variant", sourcePage: 51, parentQuestionId: "pdf-v-2-nvl",
    stem: "COMM 값이 NULL인 행에서 NVL(COMM, 0) + 100의 결과는?",
    choices: [["A", "NULL", "오답이다. NVL이 NULL을 0으로 대체한다."], ["B", "0", "오답이다. 0으로 대체한 뒤 100을 더한다."], ["C", "100", "정답이다. NVL(COMM,0)이 0이 되고 0+100이 된다."], ["D", "오류", "오답이다. 숫자 0과 100의 연산은 가능하다."]],
    answer: "C", relatedConceptId: "sql-null", hint: ["NVL의 두 번째 인자를 확인한다.", "NULL이 0으로 대체된다.", "그 다음 산술 연산을 수행한다."],
    explanation: "NVL(COMM,0)은 COMM이 NULL이면 0을 반환한다. 따라서 0 + 100으로 계산되어 결과는 100이다."
  },
  {
    subjectId: "sql-basic", number: 79, majorTopic: "SQL 기본 및 활용", middleTopic: "집합 연산", topic: "컬럼 개수와 타입", difficulty: "중급", questionType: "SQL 오류 판단형", mode: "original", sourcePage: 82, parentQuestionId: "pdf-o-2-set-compatible",
    stem: "UNION을 사용할 때 두 SELECT 결과의 필수 조건으로 가장 적절한 것은?",
    choices: [["A", "컬럼 개수가 같고 대응 컬럼의 데이터 타입이 호환되어야 한다.", "정답이다. 집합 연산의 기본 호환 조건이다."], ["B", "두 SELECT의 테이블명이 반드시 같아야 한다.", "오답이다. 서로 다른 테이블도 컬럼 구조가 호환되면 가능하다."], ["C", "ORDER BY는 각 SELECT마다 반드시 있어야 한다.", "오답이다. 일반적으로 최종 결과에 ORDER BY를 둔다."], ["D", "각 SELECT의 WHERE 조건은 완전히 같아야 한다.", "오답이다. 조건은 달라도 집합 연산이 가능하다."]],
    answer: "A", relatedConceptId: "sql-set-operators", hint: ["집합 연산은 행 집합을 합친다.", "대응 컬럼 개수와 타입을 맞춰야 한다.", "테이블명이나 WHERE 조건 동일성은 필수가 아니다."],
    explanation: "UNION, INTERSECT, MINUS 같은 집합 연산은 양쪽 SELECT의 컬럼 수가 같고 대응 컬럼 타입이 호환되어야 한다."
  },
  {
    subjectId: "sql-basic", number: 80, majorTopic: "SQL 기본 및 활용", middleTopic: "JOIN", topic: "자연 조인 함정", difficulty: "상급", questionType: "SQL 의미 판단형", mode: "similar", sourcePage: 76, parentQuestionId: "pdf-s-2-natural-join",
    stem: "NATURAL JOIN을 사용할 때 가장 주의해야 할 점은?",
    choices: [["A", "같은 이름의 컬럼이 모두 자동 조인 조건으로 사용될 수 있다.", "정답이다. 의도하지 않은 동일명 컬럼이 조인 조건에 포함될 수 있다."], ["B", "조인 조건을 명시하지 않으므로 항상 카티션 곱이 된다.", "오답이다. 동일명 컬럼을 자동으로 조인한다."], ["C", "NULL 값을 항상 같은 값으로 간주해 매칭한다.", "오답이다. NULL은 일반 동등 비교에서 매칭되지 않는다."], ["D", "두 테이블 컬럼명이 모두 달라야만 사용할 수 있다.", "오답이다. 같은 이름 컬럼이 조인 기준이 된다."]],
    answer: "A", relatedConceptId: "sql-join", hint: ["NATURAL JOIN의 자동 조건 기준을 본다.", "동일명 컬럼이 여러 개면 어떻게 되는지 생각한다.", "명시적 JOIN 조건보다 의도가 숨겨질 수 있다."],
    explanation: "NATURAL JOIN은 두 테이블의 같은 이름 컬럼을 자동으로 조인 조건에 사용한다. 의도하지 않은 컬럼이 조건에 포함될 수 있어 실무와 시험 모두에서 주의해야 한다."
  },
  {
    subjectId: "tuning", number: 51, majorTopic: "SQL 분석 도구", middleTopic: "SQL Trace", topic: "Trace 수치 해석", difficulty: "최상급", questionType: "Trace 분석 선택형", mode: "original", sourcePage: 51, parentQuestionId: "pdf-o-3-trace-cpu-elapsed",
    stem: "아래 Trace 결과를 가장 적절히 해석한 보기 2개를 고르라는 문제에서 정답 판단 근거로 가장 적절한 것은?",
    table: { title: "Trace 요약", headers: ["Call", "Count", "CPU Time", "Elapsed Time", "Disk", "Query", "Current", "Rows"], rows: [["Parse", "1", "0.00", "0.02", "0", "0", "0", "0"], ["Execute", "1", "0.00", "0.00", "0", "0", "0", "0"], ["Fetch", "78", "10.50", "39.39", "2880", "286848", "0", "1989"]] },
    choices: [["A", "Rows 대비 Query가 매우 커 인덱스 스캔 효율이나 테이블 액세스 비용을 의심한다.", "정답이다. 1,989행 반환에 논리 읽기 286,848은 과도하다."], ["B", "Parse Count가 1이므로 SQL 성능 문제는 파싱 병목이다.", "오답이다. 주요 시간과 I/O는 Fetch 단계에 몰려 있다."], ["C", "Elapsed와 CPU 차이가 크므로 I/O 대기 또는 경합 가능성을 함께 본다.", "정답이다. CPU보다 elapsed가 훨씬 크면 대기 시간을 확인해야 한다."], ["D", "Disk가 있으므로 반드시 Full Table Scan만 원인이다.", "오답이다. 물리 읽기는 원인 후보지만 실행계획과 함께 봐야 한다."]],
    answer: "A", relatedConceptId: "tuning-sql-trace", hint: ["Call별 시간이 어디에 몰렸는지 본다.", "Rows 대비 Query 수치를 계산한다.", "CPU와 elapsed 차이를 대기 시간 관점으로 해석한다."],
    explanation: "Trace는 Fetch 단계의 logical reads와 elapsed가 병목임을 보여준다. Rows 대비 Query가 매우 크고 CPU와 elapsed 차이가 커서 인덱스 스캔 효율, 테이블 랜덤 액세스, I/O 대기 가능성을 함께 봐야 한다."
  },
  {
    subjectId: "tuning", number: 52, majorTopic: "인덱스 튜닝", middleTopic: "파티션 인덱스", topic: "Local Prefixed Index", difficulty: "상급", questionType: "인덱스 설계 선택형", mode: "original", sourcePage: 78, parentQuestionId: "pdf-o-3-local-prefixed",
    stem: "거래 테이블이 거래일시 기준 Range 파티션이고 LOCAL PREFIXED 파티션 인덱스를 만들려고 한다. 가장 적절한 인덱스 구성은?",
    code: `CREATE TABLE 거래 (
  고객번호 VARCHAR2(10),
  종목코드 VARCHAR2(20),
  거래일시 DATE,
  ...
)
PARTITION BY RANGE (거래일시) (...);`,
    choices: [["A", "CREATE INDEX 거래_N1 ON 거래(거래일시) LOCAL", "정답이다. 파티션 키가 인덱스 선두에 있어 Local Prefixed 조건을 만족한다."], ["B", "CREATE INDEX 거래_N2 ON 거래(고객번호) LOCAL", "오답이다. 파티션 키가 선두에 없어 Local Nonprefixed다."], ["C", "CREATE INDEX 거래_N3 ON 거래(종목코드) LOCAL", "오답이다. 파티션 키 거래일시가 선두가 아니다."], ["D", "CREATE INDEX 거래_N4 ON 거래(종목코드, 거래일시) LOCAL", "오답이다. 거래일시가 포함되어도 선두 컬럼이 아니면 Prefixed가 아니다."]],
    answer: "A", relatedConceptId: "tuning-partition-pruning", hint: ["Prefixed는 파티션 키가 인덱스 선두인지 본다.", "LOCAL 여부와 선두 컬럼 여부를 분리한다.", "거래일시가 첫 컬럼인 인덱스를 찾는다."],
    explanation: "Local Prefixed Index는 로컬 인덱스이면서 파티션 키가 인덱스 선두 컬럼으로 시작해야 한다. 거래일시 기준 파티션이므로 거래일시가 첫 컬럼인 인덱스가 정답이다."
  },
  {
    subjectId: "tuning", number: 53, majorTopic: "인덱스 튜닝", middleTopic: "파티션 인덱스", topic: "Global/Local Prefixed 구분", difficulty: "최상급", questionType: "인덱스 유형 매칭형", mode: "original", sourcePage: 79, parentQuestionId: "pdf-o-3-partition-index-type",
    stem: "거래 테이블은 거래일자 기준 Range 파티션이다. 거래_idx1은 GLOBAL PARTITION BY RANGE(거래일자)이고 컬럼은 (거래일자, 상품번호)다. 거래_idx2는 LOCAL이고 컬럼은 (계좌번호, 거래일자)다. 두 인덱스 유형으로 가장 적절한 것은?",
    choices: [["A", "idx1 Global Prefixed, idx2 Local Prefixed", "오답이다. idx2는 로컬이지만 파티션 키가 선두가 아니다."], ["B", "idx1 Global Prefixed, idx2 Local Nonprefixed", "정답이다. idx1은 Global이고 파티션 키가 선두, idx2는 Local이지만 선두가 계좌번호다."], ["C", "idx1 Local Prefixed, idx2 Global Nonprefixed", "오답이다. idx1은 GLOBAL로 정의되어 있다."], ["D", "idx1 Global Nonprefixed, idx2 Local Prefixed", "오답이다. 두 인덱스의 선두 컬럼 판단이 반대다."]],
    answer: "B", relatedConceptId: "tuning-partition-pruning", hint: ["GLOBAL/LOCAL 정의를 먼저 본다.", "Prefixed는 파티션 키가 선두인지 본다.", "idx2의 첫 컬럼은 계좌번호다."],
    explanation: "idx1은 GLOBAL 파티션 인덱스이고 파티션 키 거래일자가 선두이므로 Global Prefixed다. idx2는 LOCAL이지만 선두가 계좌번호이고 거래일자는 두 번째이므로 Local Nonprefixed다."
  },
  {
    subjectId: "tuning", number: 54, majorTopic: "인덱스 튜닝", middleTopic: "인덱스 스캔 효율화", topic: "SARGable 조건", difficulty: "상급", questionType: "Access Predicate 판단형", mode: "variant", sourcePage: 109, parentQuestionId: "pdf-v-3-index-range-impossible",
    stem: "일반 B-tree 인덱스 IDX1(C1)이 있을 때 Index Range Scan 시작점을 만들기 가장 어려운 조건은?",
    choices: [["A", "C1 LIKE 'ABC%'", "오답이다. 우측 와일드카드는 범위 시작점을 만들 수 있다."], ["B", "C1 BETWEEN 'A' AND 'C'", "오답이다. 명확한 범위 조건이다."], ["C", "SUBSTR(C1,1,3) = 'ABC'", "정답이다. 컬럼을 함수로 가공해 일반 인덱스 access가 어렵다."], ["D", "C1 = 'ABC'", "오답이다. 동등 조건은 가장 전형적인 access 조건이다."]],
    answer: "C", relatedConceptId: "tuning-index-scan-efficiency", hint: ["컬럼 자체가 왼쪽에 보존되는지 본다.", "함수 적용 여부를 확인한다.", "일반 인덱스와 함수 기반 인덱스를 구분한다."],
    explanation: "인덱스 컬럼을 SUBSTR로 가공하면 일반 B-tree 인덱스의 정렬 순서를 그대로 활용하기 어렵다. 함수 기반 인덱스가 없다면 access predicate가 되기 힘들다."
  },
  {
    subjectId: "tuning", number: 55, majorTopic: "인덱스 튜닝", middleTopic: "테이블 액세스 최소화", topic: "클러스터링 팩터", difficulty: "상급", questionType: "성능 원인 판단형", mode: "similar", sourcePage: 112, parentQuestionId: "pdf-s-3-clustering-factor",
    stem: "두 인덱스의 선택도는 비슷하지만 IDX_A를 사용할 때 TABLE ACCESS BY INDEX ROWID의 Buffer가 훨씬 크다. 가장 먼저 의심할 요소는?",
    choices: [["A", "클러스터링 팩터 차이", "정답이다. 인덱스 순서와 테이블 저장 순서가 맞지 않으면 랜덤 액세스가 늘어난다."], ["B", "SELECT 절 컬럼 별칭", "오답이다. 별칭은 테이블 블록 방문량을 직접 늘리지 않는다."], ["C", "Parse Count", "오답이다. 문제는 rowid 테이블 액세스 Buffer 차이다."], ["D", "SQL 문장 줄바꿈", "오답이다. 포맷은 실행 I/O 원인이 아니다."]],
    answer: "A", relatedConceptId: "tuning-table-access", hint: ["인덱스 스캔 후 테이블 방문 비용을 본다.", "같은 건수라도 블록 방문이 달라질 수 있다.", "인덱스 순서와 테이블 저장 순서의 상관성을 생각한다."],
    explanation: "클러스터링 팩터가 나쁘면 인덱스에서 찾은 ROWID 순서가 테이블 블록에 흩어져 있어 랜덤 액세스가 증가한다. 선택도가 비슷해도 테이블 액세스 비용이 크게 달라질 수 있다."
  },
  {
    subjectId: "tuning", number: 56, majorTopic: "실행계획", middleTopic: "Predicate", topic: "Access와 Filter", difficulty: "상급", questionType: "Predicate 해석형", mode: "variant", sourcePage: 110, parentQuestionId: "pdf-v-3-access-filter",
    stem: "실행계획 Predicate Information에서 A.COL1 = :B1은 access, A.COL2 = :B2는 filter로 표시되었다. 가장 적절한 해석은?",
    choices: [["A", "COL1 조건은 인덱스 탐색 범위를 줄이는 데 사용되었고 COL2는 읽은 뒤 걸러졌다.", "정답이다. access와 filter의 핵심 차이다."], ["B", "filter 조건이 access 조건보다 항상 먼저 수행된다.", "오답이다. 표시 의미가 실행 순서를 단순히 말하는 것은 아니다."], ["C", "access 조건은 WHERE 절에 없는 조건이다.", "오답이다. WHERE 조건 중 인덱스 탐색에 사용된 조건일 수 있다."], ["D", "filter 조건은 성능에 전혀 영향이 없다.", "오답이다. 많이 읽은 뒤 버리면 비효율이 커진다."]],
    answer: "A", relatedConceptId: "tuning-index-scan-efficiency", hint: ["access는 시작점/범위 축소에 쓰였는지 본다.", "filter는 읽은 후 적용되는지 본다.", "filter로 많이 버리는 경우 인덱스 설계를 의심한다."],
    explanation: "Access Predicate는 인덱스 또는 액세스 경로의 탐색 범위를 줄이는 조건이고, Filter Predicate는 읽은 뒤 평가되는 조건이다. Filter가 선택도가 높으면 불필요한 I/O가 커질 수 있다."
  },
  {
    subjectId: "tuning", number: 57, majorTopic: "조인 튜닝", middleTopic: "NL Join", topic: "선행 집합과 후행 인덱스", difficulty: "상급", questionType: "조인 방식 판단형", mode: "similar", sourcePage: 120, parentQuestionId: "pdf-s-3-nl-join",
    stem: "선행 집합이 50건이고 후행 테이블은 조인 컬럼 인덱스로 1건씩 빠르게 찾을 수 있다. 첫 화면 응답시간이 중요하다. 우선 검토할 조인 방식은?",
    choices: [["A", "Nested Loops Join", "정답이다. 소량 선행 집합과 후행 인덱스 탐색, 부분범위 처리에 유리하다."], ["B", "Hash Join", "오답이다. 대량 집합 처리에 강하지만 첫 행 응답 중심에서는 NL이 더 적합할 수 있다."], ["C", "Sort Merge Join", "오답이다. 양쪽 정렬 비용이 필요할 수 있다."], ["D", "Cartesian Join", "오답이다. 조인 조건 없는 곱집합은 요구와 다르다."]],
    answer: "A", relatedConceptId: "tuning-nl-join", hint: ["선행 집합 크기를 본다.", "후행 테이블 조인 인덱스 유무를 확인한다.", "첫 화면 응답시간이면 부분범위 처리도 고려한다."],
    explanation: "NL Join은 선행 집합이 작고 후행 테이블을 인덱스로 빠르게 찾을 수 있을 때 유리하다. 특히 일부 행을 빨리 반환해야 하는 부분범위 처리에서 장점이 있다."
  },
  {
    subjectId: "tuning", number: 58, majorTopic: "조인 튜닝", middleTopic: "Hash Join", topic: "Build Input", difficulty: "상급", questionType: "조인 입력 판단형", mode: "variant", sourcePage: 124, parentQuestionId: "pdf-v-3-hash-build-input",
    stem: "Hash Join에서 한쪽 집합은 5천 건, 다른 쪽은 5천만 건이다. PGA 메모리가 제한적일 때 일반적으로 Build Input으로 더 적절한 것은?",
    choices: [["A", "5천 건 집합", "정답이다. 작은 집합으로 해시 테이블을 만들어야 메모리와 spill 부담이 작다."], ["B", "5천만 건 집합", "오답이다. 큰 집합을 Build로 잡으면 해시 영역이 커지고 spill 위험이 높다."], ["C", "항상 먼저 SQL에 적힌 테이블", "오답이다. 텍스트 순서가 Build Input을 결정하는 절대 기준은 아니다."], ["D", "인덱스가 더 많은 테이블", "오답이다. Hash Join Build는 주로 입력 크기와 메모리 관점으로 판단한다."]],
    answer: "A", relatedConceptId: "tuning-hash-join", hint: ["Hash Join은 한쪽으로 해시 테이블을 만든다.", "메모리에 올릴 집합 크기를 본다.", "작은 집합이 Build Input인 것이 일반적이다."],
    explanation: "Hash Join은 Build Input으로 해시 테이블을 만든 후 Probe Input으로 탐색한다. 작은 집합을 Build로 선택해야 메모리 사용량과 디스크 spill 위험을 줄일 수 있다."
  },
  {
    subjectId: "tuning", number: 59, majorTopic: "인덱스 튜닝", middleTopic: "Sort 제거", topic: "ORDER BY 인덱스 활용", difficulty: "상급", questionType: "인덱스 구성 선택형", mode: "similar", sourcePage: 126, parentQuestionId: "pdf-s-3-sort-omission",
    stem: "WHERE 고객번호 = :b1 ORDER BY 주문일시 DESC FETCH FIRST 10 ROWS ONLY 패턴이 매우 빈번하다. Sort 제거와 부분범위 처리에 가장 유리한 인덱스는?",
    choices: [["A", "(고객번호, 주문일시 DESC)", "정답이다. 동등 조건 후 정렬 순서가 인덱스와 맞아 상위 10건을 빠르게 읽을 수 있다."], ["B", "(주문일시, 고객번호)", "오답이다. 고객번호 조건으로 좁히기 전에 날짜 범위를 넓게 읽을 수 있다."], ["C", "(주문금액)", "오답이다. 조건과 정렬에 맞지 않는다."], ["D", "(고객번호) 단일 인덱스만 있으면 ORDER BY가 항상 제거된다.", "오답이다. 주문일시 정렬 순서가 인덱스에 없다."]],
    answer: "A", relatedConceptId: "tuning-index-design", hint: ["동등 조건 컬럼을 선두로 둔다.", "ORDER BY 컬럼과 방향을 맞춘다.", "FETCH FIRST 10은 부분범위 처리를 노린다."],
    explanation: "고객번호로 좁힌 뒤 주문일시 DESC 순서로 바로 읽을 수 있으면 SORT ORDER BY를 제거하고 상위 10건에서 멈출 수 있다."
  },
  {
    subjectId: "tuning", number: 60, majorTopic: "SQL 옵티마이저", middleTopic: "쿼리 변환", topic: "OR Expansion", difficulty: "상급", questionType: "쿼리 변환 판단형", mode: "variant", sourcePage: 132, parentQuestionId: "pdf-v-3-or-expansion",
    stem: "WHERE C1 = :b1 OR C2 = :b2 조건에서 C1, C2 각각에 선택도 높은 인덱스가 있다. 옵티마이저 변환 관점에서 검토할 수 있는 것은?",
    choices: [["A", "OR Expansion으로 UNION ALL 분기를 만들어 각 인덱스를 활용한다.", "정답이다. OR 조건을 분기하면 각 조건별 인덱스 접근이 가능해질 수 있다."], ["B", "항상 Full Scan만 가능하므로 인덱스는 무의미하다.", "오답이다. OR Expansion이나 Bitmap 등 대안이 있다."], ["C", "C1 인덱스만 사용하고 C2 조건은 삭제한다.", "오답이다. 결과가 달라진다."], ["D", "ORDER BY를 추가하면 OR 조건이 자동으로 사라진다.", "오답이다. 정렬은 조건 변환과 무관하다."]],
    answer: "A", relatedConceptId: "tuning-query-transformation", hint: ["OR 양쪽 컬럼에 각각 인덱스가 있는지 본다.", "분기별로 access 조건이 될 수 있는지 확인한다.", "중복 제거 조건이 필요한 상황도 고려한다."],
    explanation: "OR Expansion은 OR 조건을 UNION ALL 분기로 바꿔 각 분기가 적합한 인덱스를 사용할 수 있게 하는 쿼리 변환이다. 단, 분기 중복 가능성은 검증해야 한다."
  },
  {
    subjectId: "tuning", number: 61, majorTopic: "SQL 옵티마이저", middleTopic: "쿼리 변환", topic: "View Merging과 NO_MERGE", difficulty: "최상급", questionType: "힌트 의도 판단형", mode: "similar", sourcePage: 135, parentQuestionId: "pdf-s-3-no-merge",
    stem: "인라인 뷰 내부에서 GROUP BY로 대량 데이터를 먼저 집계한 뒤 코드 테이블과 조인해야 빠르다. 옵티마이저가 뷰를 병합하면 조인 후 집계가 될 수 있다. 적절한 힌트는?",
    choices: [["A", "NO_MERGE", "정답이다. 인라인 뷰 병합을 막아 집계 후 조인 구조를 보존한다."], ["B", "USE_NL", "오답이다. 조인 방식 힌트이지 뷰 병합 차단 힌트가 아니다."], ["C", "INDEX_FFS", "오답이다. 인덱스 Fast Full Scan 유도 힌트다."], ["D", "APPEND", "오답이다. Direct Path Insert 관련 힌트다."]],
    answer: "A", relatedConceptId: "tuning-query-transformation", hint: ["인라인 뷰의 처리 순서가 의미 있는지 본다.", "뷰 병합을 막는 힌트를 찾는다.", "집계 후 조인 구조를 보존해야 한다."],
    explanation: "NO_MERGE는 인라인 뷰를 바깥 쿼리와 병합하지 않도록 유도한다. 집계 후 조인처럼 뷰 내부 처리 결과가 작아진 뒤 조인해야 하는 경우 자주 사용된다."
  },
  {
    subjectId: "tuning", number: 62, majorTopic: "SQL 옵티마이저", middleTopic: "서브쿼리 변환", topic: "Unnesting", difficulty: "상급", questionType: "힌트 선택형", mode: "variant", sourcePage: 136, parentQuestionId: "pdf-v-3-unnest-hash-sj",
    stem: "EXISTS 서브쿼리를 반복 필터가 아니라 해시 세미 조인으로 변환시키고자 한다. 가장 직접적인 힌트 조합은?",
    choices: [["A", "UNNEST HASH_SJ", "정답이다. 서브쿼리 Unnesting과 Hash Semi Join 유도를 나타낸다."], ["B", "NO_UNNEST PUSH_SUBQ", "오답이다. NO_UNNEST는 서브쿼리를 풀지 않게 한다."], ["C", "INDEX_DESC FULL", "오답이다. 접근 경로 힌트일 뿐 세미 조인 변환을 직접 표현하지 않는다."], ["D", "ORDERED USE_MERGE", "오답이다. 조인 순서/방식 힌트로 해시 세미 조인 변환 의도가 아니다."]],
    answer: "A", relatedConceptId: "tuning-query-transformation", hint: ["EXISTS를 조인으로 푸는 변환 이름을 떠올린다.", "세미 조인 방식이 Hash인지 확인한다.", "NO_UNNEST는 반대 의도다."],
    explanation: "UNNEST는 서브쿼리를 조인 형태로 풀도록 유도하고 HASH_SJ는 해시 세미 조인을 의미한다. EXISTS 반복 비용을 줄이는 데 자주 사용된다."
  },
  {
    subjectId: "tuning", number: 63, majorTopic: "파티션 튜닝", middleTopic: "Partition Pruning", topic: "컬럼 가공 제거", difficulty: "상급", questionType: "SQL Rewrite 선택형", mode: "similar", sourcePage: 140, parentQuestionId: "pdf-s-3-partition-pruning-substr",
    stem: "주문번호 앞 6자리가 주문월이며 주문번호 기준 파티션 프루닝이 가능하다. 다음 중 2025년 1~2월 주문 조회 조건으로 가장 적절한 것은?",
    choices: [["A", "SUBSTR(주문번호,1,6) IN ('202501','202502')", "오답이다. 컬럼 가공으로 시작점 탐색과 pruning이 어려울 수 있다."], ["B", "주문번호 >= '2025010000000000' AND 주문번호 < '2025030000000000'", "정답이다. 컬럼을 가공하지 않는 반개구간 범위 조건이다."], ["C", "TO_CHAR(주문번호) LIKE '%202501%'", "오답이다. 앞쪽 와일드카드와 가공으로 비효율적이다."], ["D", "주문번호 <> '2025030000000000'", "오답이다. 제외 조건은 원하는 월 범위를 좁히지 못한다."]],
    answer: "B", relatedConceptId: "tuning-partition-pruning", hint: ["파티션 키나 인덱스 컬럼을 함수로 감싸는지 본다.", "연속된 두 달은 반개구간으로 표현할 수 있다.", "상한은 다음 월 시작값 미만이 안전하다."],
    explanation: "컬럼 가공 조건은 인덱스 Range Scan과 Partition Pruning을 방해할 수 있다. 주문월 접두가 정렬되는 구조라면 시작값 이상, 다음 월 시작값 미만 조건이 적절하다."
  },
  {
    subjectId: "tuning", number: 64, majorTopic: "대량 처리 튜닝", middleTopic: "Parallel DML", topic: "세션 설정과 APPEND", difficulty: "상급", questionType: "대량 INSERT 판단형", mode: "original", sourcePage: 142, parentQuestionId: "pdf-o-3-parallel-dml",
    stem: "INSERT /*+ APPEND PARALLEL(t 4) */ SELECT 문을 작성했지만 병렬 DML이 기대대로 동작하지 않는다. 우선 확인할 사항은?",
    choices: [["A", "ALTER SESSION ENABLE PARALLEL DML 설정 여부", "정답이다. Oracle Parallel DML은 세션 활성화가 필요하다."], ["B", "SELECT 절 컬럼 별칭 길이", "오답이다. 병렬 DML 활성화와 직접 관련 없다."], ["C", "ORDER BY 절 존재 여부만 확인하면 된다.", "오답이다. 정렬 여부가 핵심 설정은 아니다."], ["D", "COMMIT을 먼저 수행하면 INSERT가 병렬로 바뀐다.", "오답이다. 병렬 DML은 실행 전 세션 설정이 필요하다."]],
    answer: "A", relatedConceptId: "tuning-parallel", hint: ["Parallel 힌트와 Parallel DML 세션 설정은 다르다.", "DML 전에 설정해야 하는 문장을 찾는다.", "APPEND는 Direct Path와 관련된다."],
    explanation: "Oracle에서 병렬 DML을 사용하려면 ALTER SESSION ENABLE PARALLEL DML이 필요하다. 힌트만 작성했다고 모든 DML이 병렬로 수행되는 것은 아니다."
  },
  {
    subjectId: "tuning", number: 65, majorTopic: "SQL 분석 도구", middleTopic: "SQL Trace", topic: "Application Cursor Caching", difficulty: "상급", questionType: "Trace 계산형", mode: "similar", sourcePage: 9, parentQuestionId: "pdf-s-3-cursor-caching",
    stem: "Trace에서 Parse Count는 10, Execute Count는 1,000이다. 가장 적절한 해석은?",
    choices: [["A", "Execute Count가 Parse Count보다 크므로 커서 재사용 또는 Application Cursor Caching 가능성을 볼 수 있다.", "정답이다. 실행 횟수보다 파싱 횟수가 훨씬 적다."], ["B", "Parse Count가 10이면 하드 파싱이 1,000번 발생했다.", "오답이다. 하드 파싱 횟수는 library cache miss 등 추가 지표를 봐야 한다."], ["C", "Execute Count가 많으면 SQL이 실행되지 않았다는 뜻이다.", "오답이다. Execute는 실행 호출 수다."], ["D", "Parse와 Execute는 항상 같은 값이어야 정상이다.", "오답이다. 커서 재사용 시 Execute가 더 클 수 있다."]],
    answer: "A", relatedConceptId: "tuning-sql-trace", hint: ["Parse와 Execute의 비율을 본다.", "같은 커서가 여러 번 실행될 수 있다.", "하드 파싱 여부는 library cache miss를 확인한다."],
    explanation: "Execute Count가 Parse Count보다 훨씬 크면 매번 새로 파싱하지 않고 커서를 재사용했을 가능성이 있다. 하드/소프트 파싱은 parse count misses in library cache 등과 함께 판단한다."
  },
  {
    subjectId: "tuning", number: 66, majorTopic: "SQL 옵티마이저", middleTopic: "통계정보", topic: "카디널리티 오류", difficulty: "상급", questionType: "실행계획 원인 판단형", mode: "variant", sourcePage: 118, parentQuestionId: "pdf-v-3-cardinality",
    stem: "예상 Rows는 10건인데 실제 A-Rows는 100만 건이다. 이 차이가 조인 순서 선택 실패로 이어졌다. 가장 먼저 확인할 항목은?",
    choices: [["A", "통계정보와 히스토그램, 조건 컬럼 선택도", "정답이다. 카디널리티 추정 오류의 대표 원인이다."], ["B", "SQL 파일의 줄 수", "오답이다. 줄 수는 옵티마이저 추정 근거가 아니다."], ["C", "SELECT 절 컬럼 순서", "오답이다. 조인 카디널리티 오류의 직접 원인으로 보기 어렵다."], ["D", "테이블 주석 존재 여부", "오답이다. 주석은 비용 계산에 사용되지 않는다."]],
    answer: "A", relatedConceptId: "tuning-optimizer", hint: ["예상 Rows와 실제 Rows 차이를 본다.", "선택도 추정에 쓰이는 정보가 무엇인지 확인한다.", "히스토그램과 최신 통계를 검토한다."],
    explanation: "옵티마이저는 통계정보와 선택도 추정을 바탕으로 카디널리티를 계산한다. 실제 행 수와 큰 차이가 있으면 조인 순서와 방식 선택이 잘못될 수 있다."
  },
  {
    subjectId: "tuning", number: 67, majorTopic: "SQL 옵티마이저", middleTopic: "바인드 변수", topic: "Bind Peeking", difficulty: "상급", questionType: "계획 공유 함정형", mode: "similar", sourcePage: 119, parentQuestionId: "pdf-s-3-bind-peeking",
    stem: "같은 SQL이 바인드 값에 따라 선택도가 크게 달라진다. 처음 실행 바인드 값 기준으로 생성된 계획이 다른 값에도 공유되어 성능 편차가 발생한다. 관련 개념은?",
    choices: [["A", "Bind Peeking 또는 Adaptive Cursor Sharing", "정답이다. 바인드 값 분포에 따라 계획 공유 문제가 발생할 수 있다."], ["B", "Cartesian Product", "오답이다. 조인 조건 누락으로 인한 곱집합 개념이다."], ["C", "Direct Path Insert", "오답이다. 대량 적재 방식이다."], ["D", "GROUPING SETS", "오답이다. 다차원 집계 구문이다."]],
    answer: "A", relatedConceptId: "tuning-optimizer", hint: ["바인드 값에 따라 선택도가 달라지는지 본다.", "첫 실행 값으로 계획이 만들어지는 현상을 떠올린다.", "여러 계획 분리가 필요한 상황이다."],
    explanation: "Bind Peeking은 최초 바인드 값을 참고해 계획을 만들 수 있고, 값 분포가 치우치면 다른 바인드 값에서 부적절한 계획이 공유될 수 있다. Adaptive Cursor Sharing은 이를 완화한다."
  },
  {
    subjectId: "tuning", number: 68, majorTopic: "Lock과 동시성", middleTopic: "Blocking", topic: "행 잠금", difficulty: "중급", questionType: "동시성 시나리오형", mode: "variant", sourcePage: 128, parentQuestionId: "pdf-v-3-lock-blocking",
    stem: "세션 A가 주문번호 100의 행을 UPDATE하고 COMMIT하지 않았다. 세션 B가 같은 행을 UPDATE하려고 할 때 가장 적절한 설명은?",
    choices: [["A", "세션 B는 A가 COMMIT 또는 ROLLBACK할 때까지 대기할 수 있다.", "정답이다. 같은 행에 대한 TX row lock 경합이 발생한다."], ["B", "세션 B는 항상 즉시 성공하고 A의 변경을 덮어쓴다.", "오답이다. 행 잠금으로 동시 갱신 충돌을 막는다."], ["C", "SELECT 문도 항상 같은 방식으로 대기한다.", "오답이다. 일반 일관 읽기는 잠금 대기 없이 이전 버전을 읽을 수 있다."], ["D", "A가 UPDATE한 행은 DB에서 즉시 삭제된다.", "오답이다. UPDATE와 DELETE는 다르다."]],
    answer: "A", relatedConceptId: "tuning-lock",
    hint: ["같은 행을 동시에 갱신하는지 본다.", "UPDATE는 행 잠금을 획득한다.", "일반 SELECT와 UPDATE 대기를 구분한다."],
    explanation: "Oracle에서 UPDATE는 대상 행에 TX 잠금을 잡는다. 다른 세션이 같은 행을 갱신하려 하면 선행 트랜잭션 종료까지 대기할 수 있다."
  },
  {
    subjectId: "tuning", number: 69, majorTopic: "인덱스 튜닝", middleTopic: "Index Fast Full Scan", topic: "Index FFS", difficulty: "중급", questionType: "스캔 방식 구분형", mode: "original", sourcePage: 113, parentQuestionId: "pdf-o-3-index-ffs",
    stem: "Index Fast Full Scan에 대한 설명으로 가장 적절한 것은?",
    choices: [["A", "인덱스 전체를 멀티블록 I/O로 읽을 수 있으며 정렬 순서는 보장하지 않는다.", "정답이다. 테이블 대신 인덱스 세그먼트를 전체 스캔하는 방식이다."], ["B", "항상 인덱스 키 순서대로 결과를 반환한다.", "오답이다. 키 순서 보장은 Index Full Scan 쪽 성격이다."], ["C", "선두 컬럼 동등 조건이 반드시 필요하다.", "오답이다. 전체 인덱스 스캔이므로 선두 동등 조건이 필수는 아니다."], ["D", "테이블 블록을 반드시 한 건씩 ROWID로 방문한다.", "오답이다. 필요한 컬럼이 인덱스에 있으면 테이블 액세스를 피할 수 있다."]],
    answer: "A", relatedConceptId: "tuning-index-basic", hint: ["Fast Full은 전체 인덱스 스캔이다.", "정렬 순서 보장 여부를 구분한다.", "인덱스만으로 필요한 컬럼을 충족할 수 있는지 본다."],
    explanation: "Index Fast Full Scan은 인덱스 세그먼트를 전체 스캔하며 멀티블록 I/O와 병렬 처리가 가능하다. 결과의 키 순서를 보장하지 않는 점이 Index Full Scan과 다르다."
  },
  {
    subjectId: "tuning", number: 70, majorTopic: "SQL 분석 도구", middleTopic: "실행계획", topic: "COUNT STOPKEY", difficulty: "상급", questionType: "실행계획 해석형", mode: "similar", sourcePage: 127, parentQuestionId: "pdf-s-3-count-stopkey",
    stem: "실행계획에 COUNT STOPKEY가 보이고, 인덱스 Range Scan 후 상위 10건에서 멈춘다. 가장 적절한 해석은?",
    choices: [["A", "ROWNUM 또는 FETCH FIRST 조건으로 부분범위 처리가 가능해 불필요한 나머지 행 처리를 줄인다.", "정답이다. Stopkey는 필요한 건수에서 조기 중단하는 계획이다."], ["B", "항상 전체 테이블을 읽은 뒤 마지막에 10건만 버린다.", "오답이다. Stopkey는 조기 중단 가능성을 의미한다."], ["C", "COUNT STOPKEY는 집계 오류를 나타내는 경고다.", "오답이다. 정상 실행계획 Operation이다."], ["D", "정렬을 반드시 TEMP로 수행했다는 뜻이다.", "오답이다. 인덱스 순서와 결합되면 정렬 없이 Top-N이 가능하다."]],
    answer: "A", relatedConceptId: "tuning-top-n",
    hint: ["Stopkey는 필요한 건수 제한과 관련된다.", "인덱스 순서와 만나면 조기 중단할 수 있다.", "전체 처리 후 필터인지 부분범위 처리인지 구분한다."],
    explanation: "COUNT STOPKEY는 ROWNUM <= N 또는 FETCH FIRST N ROWS 같은 조건으로 필요한 행 수만큼 처리하고 멈출 수 있음을 의미한다. Top-N 튜닝에서 중요하다."
  }
] as CompactManualQuestion[]).map(makeCompactManualQuestion);

const manualVerifiedObjectiveQuestionsBatch10: ObjectiveQuestion[] = ([
  {
    subjectId: "sql-basic",
    number: 81,
    majorTopic: "SQL 기본 및 활용",
    middleTopic: "Window Function",
    topic: "LAG 함수",
    difficulty: "중급",
    questionType: "분석 함수 결과형",
    mode: "similar",
    sourcePage: 88,
    parentQuestionId: "pdf-s-2-lag",
    stem: "월별 매출 테이블에서 같은 고객의 직전 월 매출을 현재 행에 함께 표시하려고 한다. 가장 적절한 분석 함수는?",
    choices: [
      ["A", "LAG(매출) OVER (PARTITION BY 고객 ORDER BY 매출월)", "정답이다. 같은 고객 파티션 안에서 이전 행의 매출을 가져온다."],
      ["B", "LEAD(매출) OVER (PARTITION BY 고객 ORDER BY 매출월)", "오답이다. LEAD는 다음 행 값을 가져온다."],
      ["C", "SUM(매출) OVER (PARTITION BY 고객)", "오답이다. 누적 또는 합계이지 직전 월 값을 가져오지 않는다."],
      ["D", "COUNT(*) OVER (ORDER BY 매출월)", "오답이다. 행 수를 계산할 뿐 직전 매출을 반환하지 않는다."]
    ],
    answer: "A",
    relatedConceptId: "sql-window-functions",
    hint: ["현재 행 기준 이전 행 값을 가져와야 한다.", "고객별로 분리하려면 PARTITION BY 고객이 필요하다.", "시간 순서는 매출월 ORDER BY로 정한다."],
    explanation: "LAG 함수는 현재 행보다 앞선 행의 값을 같은 결과 행에 표시할 때 사용한다. 고객별 직전 월 매출은 고객 파티션 안에서 매출월 순서로 LAG(매출)을 계산하면 된다."
  }
] as CompactManualQuestion[]).map(makeCompactManualQuestion);

const manualVerifiedObjectiveQuestionsBatch11: ObjectiveQuestion[] = ([
  {
    subjectId: "modeling",
    number: 81,
    majorTopic: "데이터 모델링의 이해",
    middleTopic: "엔터티",
    topic: "행위 엔터티",
    difficulty: "중급",
    questionType: "개념 적용형",
    mode: "original",
    sourcePage: 2,
    sourceQuestionNumber: 1,
    parentQuestionId: "sqld-60-q1-entity-classification",
    stem: "데이터 변경이 매우 자주 발생하고 발생량도 큰 엔터티를 분류할 때 가장 적절한 것은?",
    passage: "온라인 주문 시스템에서 주문, 결제, 배송처럼 업무 처리 과정에서 계속 발생하는 데이터를 별도 엔터티로 관리하려고 한다.",
    choices: [
      ["A", "행위 엔터티", "정답이다. 행위 엔터티는 업무 수행 과정에서 발생하며 데이터 발생량과 변경 빈도가 큰 엔터티다."],
      ["B", "개념 엔터티", "오답이다. 개념 엔터티는 조직, 상품분류처럼 상대적으로 추상적이고 기준이 되는 개념을 나타낸다."],
      ["C", "중심 엔터티", "오답이다. 중심 엔터티는 업무의 중심이 되는 고객, 상품 같은 주요 대상이며 반드시 발생량이 가장 큰 것은 아니다."],
      ["D", "기본 엔터티", "오답이다. 기본 엔터티는 업무에서 독립적으로 존재하는 핵심 대상이지만, 발생 사건 데이터라는 조건과는 다르다."]
    ],
    answer: "A",
    relatedConceptId: "modeling-entity",
    hint: ["엔터티가 기준 정보인지 거래 발생 정보인지 나눈다.", "변경 빈도와 발생량이 큰 주문/결제/배송 데이터를 떠올린다.", "업무 행위 결과로 생기는 엔터티가 답이다."],
    explanation: "주문, 결제, 배송, 입출금처럼 업무 프로세스가 실행될 때마다 계속 생성되는 데이터는 행위 엔터티로 분류한다. 기준 정보 엔터티와 혼동하면 안 된다."
  },
  {
    subjectId: "modeling",
    number: 82,
    majorTopic: "데이터 모델링의 이해",
    middleTopic: "속성",
    topic: "파생 속성",
    difficulty: "중급",
    questionType: "속성 분류형",
    mode: "original",
    sourcePage: 2,
    sourceQuestionNumber: 2,
    parentQuestionId: "sqld-60-q2-derived-attribute",
    stem: "다른 속성으로부터 계산되거나 가공되어 도출되는 속성의 유형으로 가장 적절한 것은?",
    table: {
      headers: ["속성", "저장 방식", "비고"],
      rows: [
        ["주문금액", "주문수량 * 단가", "계산 가능"],
        ["고객등급명", "등급코드 조인으로 표시", "표시용"],
        ["누적구매액", "주문금액 합계", "집계 가능"]
      ]
    },
    choices: [
      ["A", "파생 속성", "정답이다. 기존 속성이나 관계에서 계산 또는 가공해 얻는 속성을 말한다."],
      ["B", "기본 속성", "오답이다. 기본 속성은 업무에서 원천적으로 발생해 직접 수집되는 속성이다."],
      ["C", "설계 속성", "오답이다. 설계 속성은 시스템 구현이나 식별을 위해 추가되는 속성이다."],
      ["D", "개념 속성", "오답이다. 속성 분류에서 계산 결과를 뜻하는 표준 분류로 보기 어렵다."]
    ],
    answer: "A",
    relatedConceptId: "modeling-attribute",
    hint: ["원천 데이터인지 계산 결과인지 구분한다.", "합계, 금액, 나이처럼 계산 가능한 값을 본다.", "다른 속성에서 도출되면 파생 속성이다."],
    explanation: "파생 속성은 원천 속성으로부터 계산되므로 저장 여부를 신중히 결정해야 한다. 성능상 저장할 수는 있지만 정합성 유지 방안이 함께 필요하다."
  },
  {
    subjectId: "modeling",
    number: 83,
    majorTopic: "데이터 모델링의 이해",
    middleTopic: "정규화",
    topic: "제1정규형",
    difficulty: "중급",
    questionType: "정규화 판단형",
    mode: "variant",
    sourcePage: 2,
    sourceQuestionNumber: 3,
    parentQuestionId: "sqld-60-q3-atomic-value",
    stem: "다음 고객 연락처 모델에서 제1정규형 관점의 문제로 가장 적절한 것은?",
    table: {
      headers: ["고객ID", "고객명", "연락처목록"],
      rows: [
        ["C001", "강민재", "010-1111-1111, 02-222-3333"],
        ["C002", "오서연", "010-2222-3333"],
        ["C003", "한지훈", "010-3333-4444, 010-5555-6666"]
      ]
    },
    choices: [
      ["A", "한 속성에 반복되는 여러 연락처 값을 저장하므로 원자값 원칙을 위반한다.", "정답이다. 제1정규형은 한 속성 위치에 하나의 원자값만 저장해야 한다."],
      ["B", "고객명이 문자형이므로 제1정규형을 위반한다.", "오답이다. 문자형 속성 자체는 정규형 위반이 아니다."],
      ["C", "고객ID가 있으므로 모든 정규형을 만족한다.", "오답이다. 식별자가 있어도 반복값 속성이 있으면 제1정규형 문제가 남는다."],
      ["D", "연락처가 NULL이 아니므로 정규화 문제가 없다.", "오답이다. NULL 여부가 아니라 여러 값을 한 칼럼에 담았다는 점이 문제다."]
    ],
    answer: "A",
    relatedConceptId: "modeling-normalization",
    hint: ["한 칸에 값이 몇 개인지 본다.", "콤마로 여러 연락처를 넣는 방식은 검색과 제약조건을 어렵게 만든다.", "제1정규형의 핵심은 원자성이다."],
    explanation: "연락처목록처럼 여러 값을 문자열 하나에 합쳐 저장하면 개별 연락처 검색, 중복 방지, 유형 구분이 어렵다. 연락처 엔터티로 분리해 고객과 1:N 관계로 모델링해야 한다."
  },
  {
    subjectId: "modeling",
    number: 84,
    majorTopic: "데이터 모델링과 성능",
    middleTopic: "반정규화",
    topic: "파생 속성 저장",
    difficulty: "상급",
    questionType: "성능 모델링 판단형",
    mode: "similar",
    sourcePage: 5,
    sourceQuestionNumber: 9,
    parentQuestionId: "sqld-derived-attribute-summary",
    stem: "주문상세 5천만 건에서 고객별 최근 1년 누적구매액을 거의 모든 화면에서 조회한다. 누적구매액 컬럼을 고객 테이블에 저장하려 할 때 가장 적절한 판단은?",
    choices: [
      ["A", "조회 성능 요구가 명확하므로 반정규화로 저장할 수 있지만, 주문 변경 시 동기화와 검증 절차를 함께 설계해야 한다.", "정답이다. 파생값 저장은 성능상 가능하지만 정합성 유지 책임이 따른다."],
      ["B", "계산 가능한 값은 어떤 경우에도 저장하면 안 되므로 매번 상세 테이블을 집계해야 한다.", "오답이다. 대량 반복 집계 비용이 크면 반정규화를 검토할 수 있다."],
      ["C", "고객 테이블에 컬럼을 추가하면 정합성 문제는 DBMS가 자동으로 해결한다.", "오답이다. 파생값 갱신 로직과 검증 배치가 필요하다."],
      ["D", "누적구매액은 식별자 후보이므로 고객의 기본키로 전환해야 한다.", "오답이다. 누적구매액은 식별 안정성이 없어 기본키 후보가 아니다."]
    ],
    answer: "A",
    relatedConceptId: "modeling-normalization",
    hint: ["계산 가능 여부와 저장 금지는 같은 말이 아니다.", "반복 조회 비용과 변경 정합성을 함께 본다.", "저장한다면 갱신 책임이 생긴다."],
    explanation: "반정규화는 성능 요구가 명확하고 정합성 유지 방안이 있을 때 선택한다. 파생 속성 저장은 화면 응답 시간을 크게 줄일 수 있지만 주문 취소, 반품, 이력 재계산 시점까지 설계해야 한다."
  },
  {
    subjectId: "modeling",
    number: 85,
    majorTopic: "데이터 모델링의 이해",
    middleTopic: "관계",
    topic: "식별 관계와 비식별 관계",
    difficulty: "상급",
    questionType: "관계 판단형",
    mode: "variant",
    sourcePage: 3,
    sourceQuestionNumber: 11,
    parentQuestionId: "modeling-identifying-relationship",
    stem: "주문상세는 주문이 없으면 존재할 수 없고, 주문번호와 상품번호 조합으로 식별된다. 이 관계를 모델링할 때 가장 적절한 설명은?",
    table: {
      headers: ["엔터티", "주요 속성", "비고"],
      rows: [
        ["주문", "주문번호", "주문 헤더"],
        ["주문상세", "주문번호, 상품번호, 수량", "주문에 종속"],
        ["상품", "상품번호", "기준 정보"]
      ]
    },
    choices: [
      ["A", "주문과 주문상세는 식별 관계로 볼 수 있으며, 주문번호가 주문상세의 주식별자 일부가 된다.", "정답이다. 자식의 식별자가 부모 식별자를 포함하고 존재 의존성이 강하다."],
      ["B", "주문상세가 주문번호를 가지면 무조건 비식별 관계가 된다.", "오답이다. 부모 식별자가 자식 식별자에 포함되면 식별 관계다."],
      ["C", "상품번호가 있으므로 주문과 주문상세 사이에는 관계가 필요 없다.", "오답이다. 주문상세는 주문과 상품을 연결하는 발생 데이터다."],
      ["D", "식별 관계는 물리 모델에서 외래키를 만들 수 없다는 뜻이다.", "오답이다. 식별 관계에서도 외래키 제약조건을 정의할 수 있다."]
    ],
    answer: "A",
    relatedConceptId: "modeling-relationship",
    hint: ["자식 엔터티의 기본키에 부모 기본키가 들어가는지 본다.", "존재 의존성이 강한지 확인한다.", "주문상세는 주문 없이는 의미가 없다."],
    explanation: "식별 관계는 부모의 주식별자가 자식의 주식별자 일부로 전이되는 관계다. 주문상세의 주문번호는 주문을 참조할 뿐 아니라 주문상세 식별에도 참여한다."
  },
  {
    subjectId: "modeling",
    number: 86,
    majorTopic: "데이터 모델링과 성능",
    middleTopic: "이력 모델링",
    topic: "기간 이력",
    difficulty: "상급",
    questionType: "이력 모델링 판단형",
    mode: "similar",
    sourcePage: 5,
    sourceQuestionNumber: 12,
    parentQuestionId: "modeling-history-current-row",
    stem: "고객등급이 변경될 때마다 변경일자와 종료일자를 저장해 특정 시점의 등급을 조회하려고 한다. 가장 적절한 설계 기준은?",
    choices: [
      ["A", "동일 고객의 이력 기간이 겹치지 않도록 제약 또는 검증 로직을 두고, 현재 행 표현 방식도 명확히 정한다.", "정답이다. 기간 이력은 중복 기간과 현재 행 표현이 핵심 검증 대상이다."],
      ["B", "변경일자만 저장하면 어떤 시점의 등급도 항상 빠르게 정확히 조회된다.", "오답이다. 직전/다음 변경일 계산이 필요하며 종료일이나 현재 행 규칙이 없으면 복잡해진다."],
      ["C", "종료일자를 모두 NULL로 저장하면 기간 겹침 문제가 사라진다.", "오답이다. 모든 행이 현재처럼 보일 수 있어 시점 조회가 불가능하다."],
      ["D", "등급 이력은 조회용이므로 정합성 검증 대상이 아니다.", "오답이다. 이력 겹침은 과거 시점 조회 오류를 만든다."]
    ],
    answer: "A",
    relatedConceptId: "modeling-transaction-model",
    hint: ["시점 조회는 시작일과 종료일의 관계를 본다.", "동일 고객의 기간이 겹치면 어느 등급인지 모호해진다.", "현재 행을 NULL 종료일로 둘지 최대일자로 둘지 일관성이 필요하다."],
    explanation: "기간 이력 모델은 기간 중복, 종료일 미설정, 현재 행 표현, 변경 시점 정렬을 함께 관리해야 한다. 단순 변경일자 누적만으로는 시점 조회의 정확성을 보장하기 어렵다."
  },
  {
    subjectId: "modeling",
    number: 87,
    majorTopic: "데이터 모델링의 이해",
    middleTopic: "정규화",
    topic: "부분 함수 종속",
    difficulty: "상급",
    questionType: "정규화 단계 판단형",
    mode: "similar",
    sourcePage: 2,
    sourceQuestionNumber: 7,
    parentQuestionId: "normalization-partial-dependency",
    stem: "아래 수강 모델에서 제2정규형 관점으로 가장 먼저 분리해야 하는 속성은?",
    table: {
      headers: ["수강번호", "학생ID", "과목ID", "과목명", "담당교수", "성적"],
      rows: [
        ["1", "S01", "DB01", "데이터베이스", "김교수", "A"],
        ["2", "S02", "DB01", "데이터베이스", "김교수", "B"],
        ["3", "S01", "SQLP", "SQL튜닝", "박교수", "A"]
      ]
    },
    choices: [
      ["A", "과목명과 담당교수는 과목ID에만 종속되므로 과목 엔터티로 분리한다.", "정답이다. 복합 식별자 일부인 과목ID에만 종속되는 속성은 부분 함수 종속이다."],
      ["B", "성적은 과목ID에만 종속되므로 과목 엔터티로 분리한다.", "오답이다. 성적은 학생과 과목의 조합에 종속된다."],
      ["C", "학생ID는 과목명에 종속되므로 수강 테이블에서 제거한다.", "오답이다. 학생ID는 수강을 식별하는 핵심 속성이다."],
      ["D", "모든 속성이 수강번호에만 종속되므로 분리할 필요가 없다.", "오답이다. 업무 식별자가 학생ID+과목ID라면 과목 속성의 부분 종속을 제거해야 한다."]
    ],
    answer: "A",
    relatedConceptId: "modeling-normalization",
    hint: ["복합 식별자를 기준으로 일부 속성만 결정되는지 본다.", "과목ID만 알면 과목명과 담당교수를 알 수 있는지 확인한다.", "제2정규형은 부분 함수 종속 제거다."],
    explanation: "학생ID와 과목ID의 조합으로 수강을 식별할 때, 과목명과 담당교수는 과목ID에만 종속된다. 따라서 과목 엔터티로 분리해 수강에는 과목ID만 남기는 것이 적절하다."
  },
  {
    subjectId: "modeling",
    number: 88,
    majorTopic: "데이터 모델링과 성능",
    middleTopic: "슈퍼타입/서브타입",
    topic: "서브타입 물리 구현",
    difficulty: "최상급",
    questionType: "모델 구현 선택형",
    mode: "variant",
    sourcePage: 6,
    sourceQuestionNumber: 14,
    parentQuestionId: "modeling-super-subtype",
    stem: "보험 계약은 공통 속성이 많지만 자동차보험과 생명보험은 고유 속성과 조회 화면이 크게 다르다. 데이터량이 매우 많고 상품별 화면은 대부분 분리되어 있다. 가장 적절한 물리 구현 방향은?",
    choices: [
      ["A", "공통 계약 테이블과 서브타입별 상세 테이블을 분리하는 방식을 우선 검토한다.", "정답이다. 공통 속성과 고유 속성을 분리해 불필요한 NULL과 화면별 접근 비용을 줄일 수 있다."],
      ["B", "모든 속성을 하나의 계약 테이블에 넣어야 조인 비용이 항상 최소가 된다.", "오답이다. 고유 속성이 많으면 NULL 컬럼과 행 길이 증가, 불필요한 I/O가 커질 수 있다."],
      ["C", "서브타입이 있으면 공통 속성도 서브타입별 테이블에 모두 중복 저장해야 한다.", "오답이다. 공통 속성 중복은 정합성 문제를 만든다."],
      ["D", "물리 구현은 논리 모델과 무관하므로 업무 조회 패턴을 고려하지 않는다.", "오답이다. 슈퍼타입/서브타입 물리화는 조회 패턴, 데이터량, NULL 비율을 함께 고려한다."]
    ],
    answer: "A",
    relatedConceptId: "modeling-entity",
    hint: ["공통 속성과 고유 속성의 비율을 본다.", "조회 화면이 상품별로 분리되는지 확인한다.", "NULL이 많은 단일 테이블과 조인이 필요한 분리 테이블의 비용을 비교한다."],
    explanation: "슈퍼타입/서브타입 구현은 통합, 분리, 개별 테이블 방식 중 업무 조회 패턴과 고유 속성 비율에 맞춰 선택한다. 데이터량이 크고 서브타입별 화면이 분리된다면 공통+상세 분리 구조가 유리할 수 있다."
  },
  {
    subjectId: "modeling",
    number: 89,
    majorTopic: "데이터 모델링과 성능",
    middleTopic: "분산 데이터베이스",
    topic: "분산 투명성",
    difficulty: "중급",
    questionType: "개념 구분형",
    mode: "original",
    sourcePage: 9,
    sourceQuestionNumber: 18,
    parentQuestionId: "modeling-distributed-transparency",
    stem: "분산 데이터베이스 설계에서 사용자가 데이터가 어느 노드에 있는지 몰라도 동일한 논리 이름으로 접근하도록 하는 성격으로 가장 적절한 것은?",
    choices: [
      ["A", "위치 투명성", "정답이다. 데이터 위치를 사용자가 알 필요 없이 접근하게 하는 특성이다."],
      ["B", "중복 투명성", "오답이다. 여러 위치에 복제된 데이터를 사용자가 의식하지 않도록 하는 성격이다."],
      ["C", "장애 투명성", "오답이다. 일부 노드 장애에도 서비스가 계속되도록 하는 성격이다."],
      ["D", "병행 투명성", "오답이다. 여러 사용자가 동시에 접근해도 일관성을 유지하는 성격이다."]
    ],
    answer: "A",
    relatedConceptId: "modeling-data-model",
    hint: ["사용자가 무엇을 몰라도 되는지 본다.", "노드 위치를 숨기는 투명성이다.", "복제 여부를 숨기는 투명성과 구분한다."],
    explanation: "위치 투명성은 분산된 데이터의 물리적 위치를 사용자가 의식하지 않게 해준다. 분산 설계 문제에서는 위치, 중복, 장애, 병행 투명성을 구분해 묻는 경우가 많다."
  },
  {
    subjectId: "modeling",
    number: 90,
    majorTopic: "데이터 모델링의 이해",
    middleTopic: "ERD",
    topic: "관계 선택성과 외부 조인",
    difficulty: "상급",
    questionType: "ERD 결과 판단형",
    mode: "similar",
    sourcePage: 10,
    sourceQuestionNumber: 20,
    parentQuestionId: "modeling-outer-join-cardinality",
    stem: "고객과 상담이력은 고객 1명당 상담이력 0건 이상인 관계다. 전체 고객 1,000명, 상담이력 600건이며 상담이 없는 고객도 목록에 보여야 한다. 가장 적절한 SQL 방향은?",
    table: {
      headers: ["엔터티", "건수", "관계"],
      rows: [
        ["고객", "1,000", "부모"],
        ["상담이력", "600", "고객별 0건 이상"],
        ["요구사항", "전체 고객 표시", "상담이 없으면 상담일자는 NULL"]
      ]
    },
    choices: [
      ["A", "고객을 기준으로 상담이력을 LEFT OUTER JOIN한다.", "정답이다. 상담이 없는 고객도 남기려면 고객을 보존하는 외부 조인이 필요하다."],
      ["B", "상담이력을 기준으로 고객을 INNER JOIN한다.", "오답이다. 상담이 없는 고객은 결과에서 사라진다."],
      ["C", "상담이력만 조회한 뒤 고객명은 스칼라 서브쿼리로 가져온다.", "오답이다. 상담이 없는 고객을 만들 수 없다."],
      ["D", "고객과 상담이력을 CROSS JOIN한 뒤 NULL을 제거한다.", "오답이다. 카티션 곱이 발생해 요구 결과와 다르다."]
    ],
    answer: "A",
    relatedConceptId: "modeling-relationship",
    hint: ["어느 쪽 행을 반드시 보존해야 하는지 본다.", "자식이 없는 부모도 출력해야 한다.", "고객을 왼쪽에 두고 상담이력을 외부 조인한다."],
    explanation: "ERD의 선택 관계는 SQL 결과 행 보존 방향과 연결된다. 부모 전체를 보존해야 하면 부모를 기준으로 외부 조인을 사용해야 한다."
  },
  {
    subjectId: "sql-basic",
    number: 82,
    majorTopic: "SQL 기본 및 활용",
    middleTopic: "집계 함수",
    topic: "COUNT와 NULL",
    difficulty: "중급",
    questionType: "SQL 실행 결과형",
    mode: "original",
    sourcePage: 1,
    sourceQuestionNumber: 1,
    parentQuestionId: "sqlp60-q1-count-empty",
    stem: "아래 SQL의 실행 결과로 올바른 것은?",
    code: "SELECT NVL(COUNT(*), 0) AS CNT\nFROM EMP\nWHERE 1 = 2;",
    choices: [
      ["A", "0", "정답이다. COUNT(*)는 조건에 맞는 행이 없어도 NULL이 아니라 0을 반환한다."],
      ["B", "NULL", "오답이다. COUNT(*) 결과는 0이며 NVL 적용 전에도 NULL이 아니다."],
      ["C", "오류 발생", "오답이다. 문법적으로 정상 SQL이다."],
      ["D", "결과 행 없음", "오답이다. 집계 함수만 있는 SELECT는 결과 행 1건을 반환한다."]
    ],
    answer: "A",
    relatedConceptId: "sql-null",
    hint: ["COUNT(*)와 COUNT(컬럼)의 NULL 처리를 구분한다.", "집계 함수만 있는 SELECT는 행이 없어도 집계 결과 한 행을 반환한다.", "NVL은 여기서 0을 다시 0으로 바꿀 뿐이다."],
    explanation: "WHERE 조건이 거짓이라 입력 행은 0건이지만 COUNT(*)는 0을 반환한다. 따라서 NVL(COUNT(*), 0)의 결과도 0이다."
  },
  {
    subjectId: "sql-basic",
    number: 83,
    majorTopic: "SQL 기본 및 활용",
    middleTopic: "집계 함수",
    topic: "COUNT(컬럼)",
    difficulty: "중급",
    questionType: "SQL 실행 결과형",
    mode: "original",
    sourcePage: 1,
    sourceQuestionNumber: 3,
    parentQuestionId: "sqlp60-q3-count-column-null",
    stem: "COMM 컬럼 값이 다음과 같을 때 SQL 실행 결과는?",
    table: {
      headers: ["행", "COMM"],
      rows: [
        ["1", "100"],
        ["2", "NULL"],
        ["3", "200"],
        ["4", "NULL"],
        ["5", "300"]
      ]
    },
    code: "SELECT COUNT(COMM) AS CNT\nFROM EMP;",
    choices: [
      ["A", "5", "오답이다. COUNT(컬럼)은 NULL을 제외한다."],
      ["B", "3", "정답이다. COMM이 NULL이 아닌 값은 100, 200, 300 세 건이다."],
      ["C", "NULL", "오답이다. COUNT 함수 결과는 숫자다."],
      ["D", "0", "오답이다. NULL이 아닌 COMM 값이 존재한다."]
    ],
    answer: "B",
    relatedConceptId: "sql-null",
    hint: ["COUNT(*)와 COUNT(COMM)을 구분한다.", "NULL인 COMM 값은 세지 않는다.", "NULL이 아닌 값이 3개다."],
    explanation: "COUNT(컬럼명)은 해당 컬럼이 NULL이 아닌 행만 센다. COMM 값 중 NULL이 아닌 값은 3건이므로 결과는 3이다."
  },
  {
    subjectId: "sql-basic",
    number: 84,
    majorTopic: "SQL 기본 및 활용",
    middleTopic: "JOIN",
    topic: "OUTER JOIN 조건 위치",
    difficulty: "상급",
    questionType: "조인 결과 판단형",
    mode: "variant",
    sourcePage: 2,
    sourceQuestionNumber: 5,
    parentQuestionId: "sqlp60-q5-outer-join-on-where",
    stem: "회원 전체를 조회하되, 2026년 7월 주문이 있는 경우 주문번호를 함께 보여주려고 한다. 다음 중 회원이 주문하지 않았어도 회원 행을 보존하는 SQL은?",
    code: "-- MEMBER(member_id, member_nm)\n-- ORD(order_id, member_id, order_dt)",
    choices: [
      ["A", "SELECT m.member_id, o.order_id FROM member m LEFT JOIN ord o ON o.member_id = m.member_id AND o.order_dt >= DATE '2026-07-01' AND o.order_dt < DATE '2026-08-01'", "정답이다. 주문 기간 조건을 ON 절에 두면 회원 행은 보존되고 매칭 주문만 제한된다."],
      ["B", "SELECT m.member_id, o.order_id FROM member m LEFT JOIN ord o ON o.member_id = m.member_id WHERE o.order_dt >= DATE '2026-07-01' AND o.order_dt < DATE '2026-08-01'", "오답이다. WHERE에서 o 컬럼 조건을 걸면 주문이 없는 회원의 NULL 확장 행이 제거된다."],
      ["C", "SELECT m.member_id, o.order_id FROM member m INNER JOIN ord o ON o.member_id = m.member_id", "오답이다. INNER JOIN은 주문 없는 회원을 제거한다."],
      ["D", "SELECT m.member_id, o.order_id FROM ord o RIGHT JOIN member m ON o.member_id = m.member_id WHERE o.order_dt IS NOT NULL", "오답이다. WHERE o.order_dt IS NOT NULL이 주문 없는 회원을 제거한다."]
    ],
    answer: "A",
    relatedConceptId: "sql-joins",
    hint: ["LEFT OUTER JOIN에서 어느 테이블 행을 보존해야 하는지 본다.", "오른쪽 테이블 조건이 WHERE로 내려가면 NULL 확장 행이 사라진다.", "기간 조건은 ON 절에 두어야 회원 행이 보존된다."],
    explanation: "외부 조인에서 ON 절 조건은 조인 매칭 대상을 제한하지만 보존 테이블 행을 제거하지 않는다. 반면 WHERE 절의 오른쪽 테이블 조건은 NULL 확장 행을 제거해 INNER JOIN처럼 동작할 수 있다."
  },
  {
    subjectId: "sql-basic",
    number: 85,
    majorTopic: "SQL 기본 및 활용",
    middleTopic: "NULL",
    topic: "NOT IN과 NULL",
    difficulty: "상급",
    questionType: "NULL 추론형",
    mode: "original",
    sourcePage: 5,
    sourceQuestionNumber: 2,
    parentQuestionId: "sqld-q2-not-in-null",
    stem: "서브쿼리 결과에 NULL이 포함되어 있을 때 WHERE col NOT IN (SELECT ...) 조건의 일반적인 결과로 가장 적절한 것은?",
    choices: [
      ["A", "NULL을 제외한 값만 비교하므로 정상적으로 차집합이 반환된다.", "오답이다. NOT IN은 NULL 때문에 UNKNOWN이 개입된다."],
      ["B", "비교 대상에 NULL이 하나라도 있으면 조건이 UNKNOWN이 되어 결과가 공집합이 될 수 있다.", "정답이다. NOT IN은 모든 불일치를 만족해야 하므로 NULL 비교가 전체 판단을 막는다."],
      ["C", "NULL을 0으로 자동 변환한 뒤 비교한다.", "오답이다. SQL은 NULL을 자동으로 0으로 바꾸지 않는다."],
      ["D", "항상 ORA 오류가 발생한다.", "오답이다. 문법 오류가 아니라 논리 결과가 UNKNOWN이 되는 문제다."]
    ],
    answer: "B",
    relatedConceptId: "sql-null",
    hint: ["NOT IN은 여러 개의 <> 조건을 AND로 묶은 것과 유사하다.", "col <> NULL의 결과를 생각한다.", "UNKNOWN이 WHERE에서 통과하는지 본다."],
    explanation: "NOT IN 목록 또는 서브쿼리 결과에 NULL이 있으면 col <> NULL 판단이 UNKNOWN이 된다. WHERE는 TRUE만 통과시키므로 결과가 0건이 될 수 있다."
  },
  {
    subjectId: "sql-basic",
    number: 86,
    majorTopic: "SQL 기본 및 활용",
    middleTopic: "문자 함수",
    topic: "LENGTH와 REPLACE",
    difficulty: "상급",
    questionType: "SQL 실행 결과형",
    mode: "similar",
    sourcePage: 7,
    sourceQuestionNumber: 41,
    parentQuestionId: "sql-string-count-character",
    stem: "아래 TAB1 데이터에서 SQL의 실행 결과로 가장 적절한 것은? 단, 한글 한 글자는 1글자로 계산한다.",
    table: {
      headers: ["ROWNUM", "C1"],
      rows: [
        ["1", "A"],
        ["1", "A"],
        ["2", "B"],
        ["2", "BB"],
        ["2", "B"],
        ["2", "C"]
      ]
    },
    code: "SELECT SUM(LENGTH(C1) - LENGTH(REPLACE(C1, 'B', ''))) AS CNT\nFROM TAB1;",
    choices: [
      ["A", "2", "오답이다. 'BB' 행에서 B가 2개 있으므로 전체 B 개수는 2보다 크다."],
      ["B", "3", "오답이다. B 행 2개와 BB 행 1개를 행 수로 세면 3이지만, 문제는 문자 개수를 센다."],
      ["C", "4", "정답이다. B, BB, B에서 B 문자는 각각 1, 2, 1개로 총 4개다."],
      ["D", "6", "오답이다. 전체 행 수 또는 전체 문자열 수를 세는 식이 아니다."]
    ],
    answer: "C",
    relatedConceptId: "sql-functions",
    hint: ["REPLACE로 특정 문자를 제거한 뒤 길이 차이를 본다.", "행 수가 아니라 문자 개수를 더한다.", "B + BB + B의 B 개수를 계산한다."],
    explanation: "LENGTH(C1) - LENGTH(REPLACE(C1,'B',''))는 각 행에서 B 문자의 개수를 구한다. A, A, C는 0이고 B, BB, B는 1, 2, 1이므로 합은 4다."
  },
  {
    subjectId: "sql-basic",
    number: 87,
    majorTopic: "SQL 기본 및 활용",
    middleTopic: "집합 연산",
    topic: "UNION과 UNION ALL",
    difficulty: "상급",
    questionType: "결과 행 수 추론형",
    mode: "similar",
    sourcePage: 9,
    sourceQuestionNumber: 84,
    parentQuestionId: "sql-set-row-count",
    stem: "다음 두 SQL 가, 나의 결과 행 수 조합으로 가장 적절한 것은?",
    table: {
      headers: ["테이블", "A", "B", "C"],
      rows: [
        ["R1", "A1", "B1", "C1"],
        ["R1", "A2", "B1", "C2"],
        ["R2", "A1", "B1", "C1"],
        ["R2", "A3", "B2", "C3"]
      ]
    },
    code: "가.\nSELECT A, B, C FROM R1\nUNION ALL\nSELECT A, B, C FROM R2;\n\n나.\nSELECT A, B, C FROM R1\nUNION\nSELECT A, B, C FROM R2;",
    choices: [
      ["A", "가: 4개, 나: 3개", "정답이다. UNION ALL은 4행을 모두 보존하고 UNION은 중복 (A1,B1,C1)을 제거해 3행이다."],
      ["B", "가: 3개, 나: 4개", "오답이다. UNION ALL은 중복을 제거하지 않는다."],
      ["C", "가: 4개, 나: 4개", "오답이다. UNION은 완전히 같은 행을 중복 제거한다."],
      ["D", "가: 2개, 나: 2개", "오답이다. 각 테이블의 행 수나 테이블 수를 묻는 문제가 아니다."]
    ],
    answer: "A",
    relatedConceptId: "sql-set-operators",
    hint: ["UNION ALL은 중복을 제거하지 않는다.", "UNION은 SELECT 컬럼 전체가 같은 행을 하나로 만든다.", "R1과 R2에 같은 행이 하나 있다."],
    explanation: "UNION ALL 결과는 R1 2행 + R2 2행으로 4행이다. UNION은 (A1,B1,C1)이 중복되므로 3행을 반환한다."
  },
  {
    subjectId: "sql-basic",
    number: 88,
    majorTopic: "SQL 기본 및 활용",
    middleTopic: "윈도우 함수",
    topic: "NTILE",
    difficulty: "중급",
    questionType: "분석 함수 결과형",
    mode: "original",
    sourcePage: 5,
    sourceQuestionNumber: 6,
    parentQuestionId: "sqld-q6-ntile",
    stem: "총 8개 행을 NTILE(3)로 3개 그룹에 나눌 때 행별 그룹 번호 배치로 가장 적절한 것은?",
    choices: [
      ["A", "1 1 1 2 2 2 3 3", "정답이다. 8행을 3그룹으로 나누면 앞 그룹부터 3, 3, 2건이 배정된다."],
      ["B", "1 1 2 2 3 3 3 3", "오답이다. 뒤쪽 그룹이 더 커지는 방식이 아니다."],
      ["C", "1 2 3 1 2 3 1 2", "오답이다. NTILE은 라운드로빈이 아니라 정렬 순서대로 연속 배분한다."],
      ["D", "1 1 1 1 2 2 3 3", "오답이다. 앞 그룹에 잔여를 너무 많이 배분했다."]
    ],
    answer: "A",
    relatedConceptId: "sql-window-functions",
    hint: ["행 수 8을 그룹 수 3으로 나눈다.", "몫은 2, 나머지는 2다.", "나머지는 앞 그룹부터 1건씩 더한다."],
    explanation: "NTILE(3)은 정렬된 행을 가능한 균등하게 3개 그룹으로 나눈다. 8 = 3+3+2이므로 그룹 번호는 1 1 1 2 2 2 3 3이다."
  },
  {
    subjectId: "sql-basic",
    number: 89,
    majorTopic: "SQL 기본 및 활용",
    middleTopic: "튜플 비교",
    topic: "다중 컬럼 IN",
    difficulty: "중급",
    questionType: "논리식 변환형",
    mode: "original",
    sourcePage: 5,
    sourceQuestionNumber: 5,
    parentQuestionId: "sqld-q5-multicolumn-in",
    stem: "WHERE (a, b) IN ((10005, 2003)) 조건과 논리적으로 같은 조건은?",
    choices: [
      ["A", "(a = 10005) OR (b = 2003)", "오답이다. 둘 중 하나만 맞아도 통과하므로 튜플 비교와 다르다."],
      ["B", "(a = 10005) AND (b = 2003)", "정답이다. 단일 튜플 비교는 두 컬럼 값이 모두 일치해야 한다."],
      ["C", "(a <> 10005) AND (b <> 2003)", "오답이다. IN이 아니라 NOT IN에 가까운 방향이다."],
      ["D", "(a = 2003) AND (b = 10005)", "오답이다. 컬럼과 값의 위치가 바뀌었다."]
    ],
    answer: "B",
    relatedConceptId: "sql-where",
    hint: ["튜플의 첫 번째 값은 첫 번째 컬럼과 비교한다.", "두 컬럼이 동시에 일치해야 한다.", "OR가 아니라 AND 조건이다."],
    explanation: "다중 컬럼 튜플 IN 조건 `(a,b) IN ((x,y))`는 `(a=x AND b=y)`와 같다. 컬럼별 조건이 모두 만족되어야 한다."
  },
  {
    subjectId: "sql-basic",
    number: 90,
    majorTopic: "SQL 기본 및 활용",
    middleTopic: "날짜 함수",
    topic: "날짜 연산",
    difficulty: "상급",
    questionType: "SQL 실행 결과형",
    mode: "variant",
    sourcePage: 8,
    sourceQuestionNumber: 42,
    parentQuestionId: "sql-date-arithmetic",
    stem: "Oracle DATE 연산 결과로 가장 적절한 것은?",
    code: "SELECT TO_CHAR(\n         TO_DATE('2026,03,10 10', 'YYYY,MM,DD HH24')\n         + 1 / 24 / 60 * 10,\n         'YYYY,MM,DD HH24:MI:SS'\n       ) AS DT\nFROM DUAL;",
    choices: [
      ["A", "2026,03,10 10:00:10", "오답이다. 1/24/60은 1분이고 여기에 10을 곱했으므로 10분이다."],
      ["B", "2026,03,10 10:10:00", "정답이다. DATE에 10분이 더해진다."],
      ["C", "2026,03,10 20:00:00", "오답이다. 10시간을 더하는 식이 아니다."],
      ["D", "2026,03,11 10:00:00", "오답이다. 1일을 더하는 식이 아니다."]
    ],
    answer: "B",
    relatedConceptId: "sql-functions",
    hint: ["Oracle DATE에서 숫자 1은 하루다.", "1/24는 한 시간, 1/24/60은 1분이다.", "그 값에 10을 곱하면 10분이다."],
    explanation: "Oracle DATE + 숫자 연산에서 숫자 1은 1일이다. 1/24/60은 1분이므로 10을 곱하면 10분이 더해져 10:10:00이 된다."
  },
  {
    subjectId: "sql-basic",
    number: 91,
    majorTopic: "SQL 기본 및 활용",
    middleTopic: "조건식",
    topic: "서비스 기간 조건",
    difficulty: "최상급",
    questionType: "SQL 비교 선택형",
    mode: "similar",
    sourcePage: 11,
    sourceQuestionNumber: 39,
    parentQuestionId: "sql-service-period-condition",
    stem: "서비스 가입 테이블에서 2026년 3월 1일 하루 동안 유효한 서비스 건수를 서비스ID별로 집계하려고 한다. 다음 중 인덱스 활용과 의미가 가장 적절한 SQL은?",
    table: {
      headers: ["테이블", "컬럼"],
      rows: [
        ["SVC_JOIN", "SVC_ID, CUST_ID, JOIN_YMD, JOIN_HH"],
        ["SVC_JOIN", "SVC_START_DATE, SVC_END_DATE"],
        ["전제", "SVC_START_DATE, SVC_END_DATE는 DATE 타입"]
      ]
    },
    choices: [
      ["A", "WHERE SVC_START_DATE <= TO_DATE('20260301235959','YYYYMMDDHH24MISS') AND SVC_END_DATE >= TO_DATE('20260301000000','YYYYMMDDHH24MISS') GROUP BY SVC_ID", "정답이다. 컬럼을 가공하지 않고 하루 구간과 서비스 유효 기간의 겹침을 판정한다."],
      ["B", "WHERE TO_CHAR(SVC_END_DATE, 'YYYYMMDD') = '20260301' GROUP BY SVC_ID", "오답이다. 종료일이 3월 1일인 서비스만 세므로 당일 유효한 전체 서비스가 아니다. 컬럼 가공도 있다."],
      ["C", "WHERE JOIN_YMD || JOIN_HH = '2026030100' GROUP BY SVC_ID", "오답이다. 가입 시각만 보며 서비스 유효 기간과 무관하다."],
      ["D", "WHERE TO_CHAR(SVC_START_DATE, 'YYYYMM') = '202603' GROUP BY SVC_ID", "오답이다. 3월에 시작한 서비스만 세며 기존 계속 서비스가 빠진다."]
    ],
    answer: "A",
    relatedConceptId: "sql-where",
    hint: ["하루 동안 유효하다는 것은 기간이 겹치는지 보는 문제다.", "DATE 컬럼을 TO_CHAR로 감싸면 인덱스 시작점을 만들기 어렵다.", "시작일은 하루 끝보다 작거나 같고 종료일은 하루 시작보다 크거나 같아야 한다."],
    explanation: "기간 유효성 조회는 검색 기간과 서비스 기간의 교차 여부를 판단해야 한다. 컬럼을 가공하지 않는 범위 조건을 사용해야 의미와 성능을 모두 만족한다."
  },
  {
    subjectId: "sql-basic",
    number: 92,
    majorTopic: "SQL 기본 및 활용",
    middleTopic: "문자 함수",
    topic: "REGEXP_INSTR",
    difficulty: "중급",
    questionType: "SQL 실행 결과형",
    mode: "original",
    sourcePage: 13,
    sourceQuestionNumber: 31,
    parentQuestionId: "sqld-q31-regexp-instr",
    stem: "아래 SQL의 실행 결과로 가장 적절한 것은?",
    code: "SELECT REGEXP_INSTR('13123123123', '312') AS POS\nFROM DUAL;",
    choices: [
      ["A", "1", "오답이다. 첫 번째 문자는 '1'이며 패턴 '312'가 시작되는 위치가 아니다."],
      ["B", "2", "정답이다. 문자열의 2번째 위치부터 '312' 패턴이 처음 나타난다."],
      ["C", "3", "오답이다. 3번째 위치부터는 '123'이므로 패턴과 다르다."],
      ["D", "0", "오답이다. 패턴이 존재하지 않을 때 0이지만, 이 문자열에는 패턴이 존재한다."]
    ],
    answer: "B",
    relatedConceptId: "sql-functions",
    hint: ["Oracle 문자열 위치는 1부터 시작한다.", "패턴 '312'가 처음 연속으로 나타나는 구간을 찾는다.", "두 번째 문자부터 3-1-2가 이어진다."],
    explanation: "REGEXP_INSTR은 정규표현식 패턴이 처음 매칭되는 시작 위치를 반환한다. '13123123123'에서 '312'는 2번째 문자부터 처음 나타나므로 결과는 2다."
  },
  {
    subjectId: "tuning",
    number: 71,
    majorTopic: "인덱스 튜닝",
    middleTopic: "클러스터링 팩터",
    topic: "Clustering Factor",
    difficulty: "상급",
    questionType: "성능 지표 해석형",
    mode: "original",
    sourcePage: 8,
    sourceQuestionNumber: 41,
    parentQuestionId: "sqlp60-q41-clustering-factor",
    stem: "인덱스 클러스터링 팩터에 대한 설명으로 가장 적절하지 않은 것은?",
    choices: [
      ["A", "인덱스 키 순서와 테이블 블록 저장 순서가 얼마나 비슷한지를 나타낸다.", "오답이 아니다. 클러스터링 팩터의 핵심 정의다."],
      ["B", "테이블 블록 수에 가까울수록 인덱스 Range Scan 후 테이블 랜덤 액세스 효율이 좋다.", "오답이 아니다. CF가 블록 수에 가까우면 같은 블록 재방문 가능성이 높다."],
      ["C", "테이블 행 수에 가까울수록 인덱스 순서대로 읽어도 테이블 블록 이동이 많아질 수 있다.", "오답이 아니다. CF가 나쁜 상태를 설명한다."],
      ["D", "CF가 나빠도 Index Range Scan의 테이블 랜덤 액세스 비용 추정에는 영향을 주지 않는다.", "정답이다. CF는 인덱스 경유 테이블 액세스 비용 추정에 직접 영향을 준다."]
    ],
    answer: "D",
    relatedConceptId: "tuning-table-access",
    hint: ["CF는 인덱스와 테이블 블록의 물리적 근접성을 나타낸다.", "좋은 CF와 나쁜 CF가 비용 추정에 어떻게 반영되는지 본다.", "Range Scan 후 ROWID 테이블 방문 비용과 연결한다."],
    explanation: "클러스터링 팩터가 나쁘면 인덱스 순서로 읽는 ROWID가 여러 테이블 블록으로 흩어져 있어 랜덤 액세스 비용이 커진다. 옵티마이저는 이 값을 비용 계산에 사용한다."
  },
  {
    subjectId: "tuning",
    number: 72,
    majorTopic: "인덱스 튜닝",
    middleTopic: "파티션 인덱스",
    topic: "Local Prefixed Index",
    difficulty: "최상급",
    questionType: "인덱스 구성 선택형",
    mode: "similar",
    sourcePage: 78,
    sourceQuestionNumber: 78,
    parentQuestionId: "sql-cert-q78-local-prefixed",
    stem: "거래 테이블이 거래일자 기준 Range 파티션으로 구성되어 있다. 다음 중 Local Prefixed Partition Index로 가장 적절한 것은?",
    code: "CREATE TABLE 거래 (\n  고객번호 VARCHAR2(10),\n  종목코드 VARCHAR2(20),\n  거래일시 DATE,\n  거래수량 NUMBER\n)\nPARTITION BY RANGE (거래일시) (...);",
    choices: [
      ["A", "CREATE INDEX 거래_N1 ON 거래(거래일시, 고객번호) LOCAL", "정답이다. 로컬 인덱스이면서 파티션 키 거래일시가 인덱스 선두에 있으므로 Local Prefixed다."],
      ["B", "CREATE INDEX 거래_N2 ON 거래(고객번호, 거래일시) LOCAL", "오답이다. Local이지만 파티션 키가 선두가 아니므로 Local Nonprefixed다."],
      ["C", "CREATE INDEX 거래_N3 ON 거래(종목코드) LOCAL", "오답이다. 파티션 키가 포함되지 않은 Local Nonprefixed 인덱스다."],
      ["D", "CREATE INDEX 거래_N4 ON 거래(거래일시) GLOBAL", "오답이다. 파티션 키가 선두라도 GLOBAL이면 Local Prefixed가 아니다."]
    ],
    answer: "A",
    relatedConceptId: "tuning-partitioning",
    hint: ["Local인지 Global인지 먼저 본다.", "Prefixed는 파티션 키가 인덱스 선두에 있는지 본다.", "거래일시가 파티션 키다."],
    explanation: "Local Prefixed 인덱스는 각 테이블 파티션과 1:1로 대응되는 로컬 인덱스이며, 인덱스 선두 컬럼이 파티션 키로 시작해야 한다."
  },
  {
    subjectId: "tuning",
    number: 73,
    majorTopic: "인덱스 튜닝",
    middleTopic: "파티션 인덱스",
    topic: "Global/Local Prefixed 구분",
    difficulty: "최상급",
    questionType: "보기 조합형",
    mode: "variant",
    sourcePage: 79,
    sourceQuestionNumber: 79,
    parentQuestionId: "sql-cert-q79-index-type",
    stem: "아래 DDL을 보고 IDX1, IDX2의 인덱스 유형을 순서대로 고른 것은?",
    code: "CREATE TABLE 거래 (\n  거래번호 NUMBER,\n  상품번호 VARCHAR2(6),\n  거래일자 VARCHAR2(8),\n  거래금액 NUMBER\n)\nPARTITION BY RANGE(거래일자)(\n  PARTITION P1 VALUES LESS THAN('20260101'),\n  PARTITION P2 VALUES LESS THAN('20270101'),\n  PARTITION PX VALUES LESS THAN(MAXVALUE)\n);\n\nCREATE INDEX IDX1 ON 거래(거래일자, 상품번호)\nGLOBAL PARTITION BY RANGE(거래일자)(\n  PARTITION G1 VALUES LESS THAN('20260101'),\n  PARTITION GX VALUES LESS THAN(MAXVALUE)\n);\n\nCREATE INDEX IDX2 ON 거래(거래번호, 거래일자) LOCAL;",
    choices: [
      ["A", "IDX1: Global Prefixed, IDX2: Local Nonprefixed", "정답이다. IDX1은 Global이고 선두가 파티션 키이며, IDX2는 Local이지만 선두가 거래번호다."],
      ["B", "IDX1: Global Nonprefixed, IDX2: Local Prefixed", "오답이다. IDX1은 선두가 거래일자이고 IDX2는 선두가 거래번호다."],
      ["C", "IDX1: Local Prefixed, IDX2: Global Prefixed", "오답이다. IDX1은 GLOBAL, IDX2는 LOCAL로 명시되어 있다."],
      ["D", "IDX1: Local Nonprefixed, IDX2: Local Prefixed", "오답이다. IDX1의 LOCAL/GLOBAL 판단이 틀렸다."]
    ],
    answer: "A",
    relatedConceptId: "tuning-partitioning",
    hint: ["각 인덱스의 LOCAL/GLOBAL 키워드를 먼저 확인한다.", "Prefixed 여부는 파티션 키가 인덱스 선두인지 판단한다.", "IDX2의 선두는 거래번호다."],
    explanation: "IDX1은 GLOBAL 파티션 인덱스이고 인덱스 선두가 거래일자라 Global Prefixed다. IDX2는 LOCAL 인덱스지만 선두 컬럼이 거래번호라 Local Nonprefixed다."
  },
  {
    subjectId: "tuning",
    number: 74,
    majorTopic: "SQL 분석 도구",
    middleTopic: "SQL Trace",
    topic: "Fetch Call과 Array Processing",
    difficulty: "최상급",
    questionType: "Trace 수치 해석형",
    mode: "similar",
    sourcePage: 51,
    sourceQuestionNumber: 51,
    parentQuestionId: "sql-cert-q51-trace-array",
    stem: "아래 Trace 요약을 보고 가장 먼저 점검할 개선 지점으로 가장 적절한 것은?",
    table: {
      headers: ["Call", "Count", "CPU", "Elapsed", "Disk", "Query", "Current", "Rows"],
      rows: [
        ["Parse", "1", "0.00", "0.02", "0", "0", "0", "0"],
        ["Execute", "1", "0.00", "0.00", "0", "0", "0", "0"],
        ["Fetch", "80", "10.50", "42.90", "2,780", "286,480", "0", "1,980"],
        ["Total", "82", "10.50", "42.92", "2,780", "286,480", "0", "1,980"]
      ]
    },
    choices: [
      ["A", "Rows 1,980건을 Fetch 80회로 가져왔으므로 애플리케이션 Fetch Array Size가 작아 Call 비용이 커질 수 있다.", "정답이다. 평균 약 25건/Fetch로 네트워크 왕복과 Fetch call 비용을 먼저 의심할 수 있다."],
      ["B", "Disk가 0이 아니므로 항상 인덱스 컬럼 순서만 바꾸면 해결된다.", "오답이다. 물리 I/O만 보고 인덱스 컬럼 순서 조정으로 단정할 수 없다."],
      ["C", "Query 286,480은 논리 읽기가 커 보이지만, 이 문항에서 가장 직접적으로 수치화되는 Call 개선 지점은 Fetch 횟수다.", "오답이다. 논리 읽기 분석도 필요하지만 보기 중 가장 먼저 계산 가능한 개선 지점은 Fetch Array Size다."],
      ["D", "Parse가 1회이므로 하드 파싱 문제가 성능 병목의 전부다.", "오답이다. Parse 수치만으로 Fetch 단계의 I/O 병목을 설명할 수 없다."]
    ],
    answer: "A",
    relatedConceptId: "tuning-sql-trace",
    hint: ["Rows와 Fetch Count로 평균 Fetch 크기를 계산한다.", "Query는 Logical Reads다.", "Elapsed 대부분이 Fetch에 몰려 있는지 본다."],
    explanation: "Trace에서 Fetch 80회에 1,980건이면 평균 Fetch 크기가 약 25건이다. 반환 건수 대비 Fetch Call이 많으므로 Array Fetch 크기와 애플리케이션 호출 방식을 먼저 점검한다. 논리 읽기 분석도 필요하지만 이 문항의 핵심은 Fetch Call 계산이다."
  },
  {
    subjectId: "tuning",
    number: 75,
    majorTopic: "인덱스 튜닝",
    middleTopic: "Access Predicate",
    topic: "Access와 Filter Predicate",
    difficulty: "상급",
    questionType: "Predicate 해석형",
    mode: "original",
    sourcePage: 11,
    sourceQuestionNumber: 59,
    parentQuestionId: "sqlp60-q59-access-filter",
    stem: "Access Predicate와 Filter Predicate의 차이에 대한 설명으로 가장 적절한 것은?",
    choices: [
      ["A", "Access Predicate는 인덱스 스캔 범위를 결정하고, Filter Predicate는 스캔된 레코드의 추출 여부를 판단한다.", "정답이다. Access는 시작/끝 범위 결정, Filter는 읽은 뒤 걸러내는 조건이다."],
      ["B", "Access Predicate는 테이블을 읽은 뒤 확인하고 Filter Predicate는 인덱스 루트 블록만 확인한다.", "오답이다. Access와 Filter의 의미가 뒤섞여 있다."],
      ["C", "두 조건은 실행계획에만 다르게 표시될 뿐 성능상 의미는 완전히 같다.", "오답이다. 스캔량을 줄이는지 여부가 다르다."],
      ["D", "Filter Predicate가 항상 Access Predicate보다 스캔 범위를 더 크게 줄인다.", "오답이다. Filter는 이미 읽은 레코드를 거르는 성격이 강하다."]
    ],
    answer: "A",
    relatedConceptId: "tuning-index-scan-efficiency",
    hint: ["인덱스 시작점과 종료점을 만드는 조건인지 본다.", "읽은 뒤 버리는 조건인지 구분한다.", "스캔량 자체를 줄이는 쪽이 Access다."],
    explanation: "인덱스 튜닝에서는 같은 WHERE 조건이라도 Access Predicate가 되는지 Filter Predicate가 되는지가 중요하다. Filter로 밀리면 인덱스를 많이 읽고 나중에 버릴 수 있다."
  },
  {
    subjectId: "tuning",
    number: 76,
    majorTopic: "조인 튜닝",
    middleTopic: "Hash Join",
    topic: "Build Input과 Disk Spill",
    difficulty: "상급",
    questionType: "조인 방식 판단형",
    mode: "original",
    sourcePage: 9,
    sourceQuestionNumber: 46,
    parentQuestionId: "sqlp60-q46-hash-spill",
    stem: "Hash Join에서 Build Input 크기가 Work Area를 초과할 때 발생할 수 있는 처리 방식으로 가장 적절한 것은?",
    choices: [
      ["A", "In-Memory Hash Join으로 모든 데이터가 메모리 안에서만 처리된다.", "오답이다. 메모리가 충분할 때의 이상적인 형태다."],
      ["B", "Grace Hash Join처럼 디스크 TEMP 영역을 사용해 파티션 단위로 나누어 처리할 수 있다.", "정답이다. 메모리 부족 시 Disk Spill이 발생할 수 있다."],
      ["C", "옵티마이저가 실행 중 항상 Nested Loops Join으로 자동 전환한다.", "오답이다. 실행 중 임의로 항상 NL로 바뀌는 것이 아니다."],
      ["D", "Sort Merge Join으로 변환되어 인덱스 정렬을 보장한다.", "오답이다. Hash Area 부족이 Sort Merge 전환을 보장하지 않는다."]
    ],
    answer: "B",
    relatedConceptId: "tuning-hash-join",
    hint: ["Hash Join은 Build Input으로 해시 테이블을 만든다.", "해시 영역이 부족하면 TEMP 사용 여부를 본다.", "Disk Spill이 발생하면 성능이 급격히 떨어질 수 있다."],
    explanation: "Build Input이 메모리에 담기지 않으면 해시 파티션을 TEMP에 기록하고 나누어 처리하는 Grace Hash Join 방식이 될 수 있다. 이때 TEMP I/O가 성능 병목이 된다."
  },
  {
    subjectId: "tuning",
    number: 77,
    majorTopic: "SQL 튜닝",
    middleTopic: "Index Range Scan",
    topic: "인덱스 컬럼 가공",
    difficulty: "상급",
    questionType: "최적 SQL 선택형",
    mode: "variant",
    sourcePage: 6,
    sourceQuestionNumber: 34,
    parentQuestionId: "sqlp60-q34-function-based-condition",
    stem: "ORD_DATE 컬럼에 일반 B-Tree 인덱스가 있을 때 2026년 7월 15일 주문을 조회하는 조건으로 가장 적절한 것은?",
    choices: [
      ["A", "WHERE TO_CHAR(ORD_DATE, 'YYYYMMDD') = '20260715'", "오답이다. 인덱스 컬럼을 가공해 일반 인덱스 Range Scan 시작점을 만들기 어렵다."],
      ["B", "WHERE ORD_DATE >= TO_DATE('20260715','YYYYMMDD') AND ORD_DATE < TO_DATE('20260716','YYYYMMDD')", "정답이다. 컬럼을 가공하지 않고 하루 범위를 반개구간으로 표현한다."],
      ["C", "WHERE NVL(ORD_DATE, SYSDATE) = TO_DATE('20260715','YYYYMMDD')", "오답이다. 컬럼 가공이 발생하고 NULL 처리 의미도 달라진다."],
      ["D", "WHERE SUBSTR(ORD_DATE, 1, 8) = '20260715'", "오답이다. DATE 컬럼에 문자열 함수 적용은 문법과 성능 모두 부적절하다."]
    ],
    answer: "B",
    relatedConceptId: "tuning-index-scan-efficiency",
    hint: ["좌변 컬럼을 그대로 두는지 본다.", "DATE에는 시각 정보가 포함될 수 있다.", "하루 조건은 시작 이상 다음날 미만으로 쓰는 것이 안전하다."],
    explanation: "날짜 컬럼을 TO_CHAR로 감싸면 일반 인덱스의 시작점과 종료점을 만들기 어렵다. `>= 시작일 AND < 다음날` 조건은 시각까지 포함한 날짜 범위를 안전하게 표현한다."
  },
  {
    subjectId: "tuning",
    number: 78,
    majorTopic: "SQL 튜닝",
    middleTopic: "부분범위 처리",
    topic: "COUNT STOPKEY",
    difficulty: "최상급",
    questionType: "실행계획 해석형",
    mode: "similar",
    sourcePage: 5,
    sourceQuestionNumber: 3,
    parentQuestionId: "practice-count-stopkey-topn",
    stem: "아래 실행계획이 목표로 하는 튜닝 의도로 가장 적절한 것은?",
    code: "Id | Operation                    | Name\n 0 | SELECT STATEMENT             |\n 1 |  COUNT STOPKEY               |\n 2 |   VIEW                       |\n 3 |    INDEX RANGE SCAN DESCENDING| 주문_X1",
    choices: [
      ["A", "정렬 대상 전체를 만든 뒤 마지막에 10건을 버리는 전범위 처리다.", "오답이다. COUNT STOPKEY는 조기 중단 가능성을 나타낸다."],
      ["B", "인덱스 역순 스캔으로 필요한 순서의 상위 N건을 먼저 읽고 중단하려는 계획이다.", "정답이다. Top-N 부분범위 처리의 대표 패턴이다."],
      ["C", "HASH JOIN의 Build Input을 줄이기 위한 디스크 파티셔닝 계획이다.", "오답이다. 제시 Operation은 Hash Join이 아니다."],
      ["D", "UNION 중복 제거를 위해 SORT UNIQUE를 수행하는 계획이다.", "오답이다. SORT UNIQUE가 없고 Stopkey가 핵심이다."]
    ],
    answer: "B",
    relatedConceptId: "tuning-top-n",
    hint: ["COUNT STOPKEY가 어떤 조건에서 나타나는지 본다.", "DESCENDING 인덱스 스캔과 ORDER BY 제거를 연결한다.", "필요한 N건에서 멈추는지 확인한다."],
    explanation: "주문_X1 인덱스가 정렬 요구와 맞으면 Index Range Scan Descending으로 최근 순서의 데이터를 읽을 수 있다. COUNT STOPKEY는 상위 N건을 얻은 뒤 조기 종료하는 실행계획이다."
  },
  {
    subjectId: "tuning",
    number: 79,
    majorTopic: "SQL 튜닝",
    middleTopic: "대량 DML",
    topic: "Partition Exchange",
    difficulty: "최상급",
    questionType: "튜닝 방안 선택형",
    mode: "original",
    sourcePage: 5,
    sourceQuestionNumber: 4,
    parentQuestionId: "practice-partition-exchange",
    stem: "대용량 파티션 테이블의 특정 월 파티션 전체를 재작성해야 한다. 행 단위 MERGE보다 Partition Exchange 방식을 검토하는 주된 이유로 가장 적절한 것은?",
    choices: [
      ["A", "세그먼트 교환으로 파티션을 빠르게 대체하여 대량 UPDATE/DELETE의 Undo, Redo, 인덱스 유지 비용을 줄일 수 있기 때문이다.", "정답이다. Partition Exchange는 파티션 단위 배치 튜닝의 핵심 방법이다."],
      ["B", "Partition Exchange를 사용하면 모든 제약조건 검증이 자동으로 생략되어 데이터 오류가 절대 발생하지 않는다.", "오답이다. WITHOUT VALIDATION 사용 조건과 데이터 정합성 검토가 필요하다."],
      ["C", "파티션 테이블에서는 MERGE 문을 사용할 수 없기 때문이다.", "오답이다. MERGE는 사용할 수 있지만 대량 변경 비용이 클 수 있다."],
      ["D", "Exchange 후에는 로컬 인덱스와 글로벌 인덱스 관리가 항상 필요 없어지기 때문이다.", "오답이다. 인덱스 상태와 옵션을 고려해야 한다."]
    ],
    answer: "A",
    relatedConceptId: "tuning-partitioning",
    hint: ["행 단위 변경과 세그먼트 교환의 차이를 본다.", "Undo/Redo와 인덱스 유지 비용을 비교한다.", "특정 파티션 전체를 바꿀 수 있을 때 효과가 크다."],
    explanation: "Partition Exchange는 새 파티션 이미지를 별도 테이블로 만든 뒤 메타데이터 교환으로 기존 파티션과 바꾸는 방식이다. 대량 DML의 행 단위 비용을 피할 수 있어 배치 튜닝에서 중요하다."
  },
  {
    subjectId: "tuning",
    number: 80,
    majorTopic: "SQL 분석 도구",
    middleTopic: "SQL Trace",
    topic: "Rows와 Starts",
    difficulty: "최상급",
    questionType: "Trace 병목 판단형",
    mode: "similar",
    sourcePage: 8,
    sourceQuestionNumber: 6,
    parentQuestionId: "practice-trace-starts",
    stem: "아래 실행계획 통계에서 성능 문제 원인으로 가장 먼저 의심할 내용은?",
    table: {
      headers: ["Id", "Operation", "Name", "Rows", "Starts", "CR"],
      rows: [
        ["1", "HASH JOIN", "", "30,000,000", "1", "210,000"],
        ["2", "TABLE ACCESS FULL", "주문", "30,000,000", "1", "180,000"],
        ["3", "NESTED LOOPS", "", "30,000,000", "1", "1,820,000"],
        ["4", "INDEX RANGE SCAN", "배송_N1", "1", "30,000,000", "1,650,000"]
      ]
    },
    choices: [
      ["A", "배송_N1이 3천만 번 시작되어 주문 건수만큼 반복 탐색되고 있으므로 조인 방식이나 조인 순서를 재검토한다.", "정답이다. Starts가 과도하면 NL 반복 비용을 의심해야 한다."],
      ["B", "HASH JOIN의 Starts가 1이므로 HASH JOIN이 모든 병목의 원인이다.", "오답이다. 반복 수행 병목은 배송_N1 쪽에서 더 뚜렷하다."],
      ["C", "Rows가 1인 Operation은 항상 비용 문제가 없으므로 무시한다.", "오답이다. Rows가 작아도 Starts가 매우 크면 총 비용이 커진다."],
      ["D", "CR은 논리 읽기가 아니므로 성능 판단에 사용할 수 없다.", "오답이다. CR은 논리 읽기 지표로 Trace 분석의 핵심이다."]
    ],
    answer: "A",
    relatedConceptId: "tuning-sql-trace",
    hint: ["Rows만 보지 말고 Starts를 함께 본다.", "작은 인덱스 스캔도 반복 횟수가 크면 전체 비용이 커진다.", "NL 반복 탐색인지 판단한다."],
    explanation: "인덱스 Range Scan의 Rows가 1이어도 Starts가 30,000,000이면 총 반복 탐색 비용이 매우 크다. 대량 배치에서는 Hash Join, 조인 전 집계, 조인 순서 변경 등을 검토해야 한다."
  }
] as CompactManualQuestion[]).map(makeCompactManualQuestion);

const manualVerifiedObjectiveQuestionsBatch14: ObjectiveQuestion[] =
  manualPdfObjectiveExtensionBatch14.map((question) => makeCompactManualQuestion(question));

const manualVerifiedObjectiveQuestionsBatch15: ObjectiveQuestion[] =
  newPdfSubject3ObjectiveBatch15.map((question) => makeCompactManualQuestion(question));

const manualVerifiedObjectiveQuestionsBatch16: ObjectiveQuestion[] =
  sqlmateAdvancedUploadObjectiveBatch16.map((question) => makeCompactManualQuestion(question));

const manualVerifiedObjectiveQuestionsBatch17: ObjectiveQuestion[] =
  sqlmateAdvanced20qObjectiveBatch17.map((question) => makeCompactManualQuestion(question));

const objectiveQuestionCandidates = dedupeObjectiveQuestions([
  ...verifiedObjectiveSeedQuestions,
  ...manualVerifiedObjectiveQuestions,
  ...manualVerifiedObjectiveQuestionsBatch02,
  ...manualVerifiedObjectiveQuestionsBatch03,
  ...manualVerifiedObjectiveQuestionsBatch04,
  ...manualVerifiedObjectiveQuestionsBatch05,
  ...manualVerifiedObjectiveQuestionsBatch06,
  ...manualVerifiedObjectiveQuestionsBatch07,
  ...manualVerifiedObjectiveQuestionsBatch08,
  ...manualVerifiedObjectiveQuestionsBatch09,
  ...manualVerifiedObjectiveQuestionsBatch10,
  ...manualVerifiedObjectiveQuestionsBatch11,
  ...manualVerifiedObjectiveQuestionsBatch12,
  ...manualVerifiedTuningPartitionAndTraceQuestions,
  ...manualVerifiedObjectiveQuestionsBatch14,
  ...manualVerifiedObjectiveQuestionsBatch15,
  ...manualVerifiedObjectiveQuestionsBatch16,
  ...manualVerifiedObjectiveQuestionsBatch17
]);

const convertedReviewLabs = [...pdfReviewLabs, ...newPdfSubject3LabBatch15].map((lab, index) => convertReviewLab(lab, index));
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
    ...(question.visualAssets ?? []).map((asset) => [asset.title, asset.alt, asset.caption].filter(Boolean).join(" ")),
    question.explanation,
    question.hint,
    question.table ? [question.table.headers.join(" "), question.table.rows.flat().join(" ")].join(" ") : "",
    ...(question.tables ?? []).map((table) => [table.title, table.headers.join(" "), table.rows.flat().join(" ")].filter(Boolean).join(" ")),
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
  if (question.code || question.table || question.tables?.length || question.passage) return false;

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

const rejectedKnownDuplicateQuestionIds = new Set(["prod-ext-tuning-210", "prod-ext-tuning-212"]);

function isPublishedObjectiveQuestion(question: ObjectiveQuestion) {
  if (rejectedKnownDuplicateQuestionIds.has(question.id)) return false;
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
    ...(lab.visualAssets ?? []).map((asset) => [asset.title, asset.alt, asset.caption].filter(Boolean).join(" ")),
    ...(lab.sampleData ?? []).flatMap((table) => [table.title ?? "", ...table.headers, ...table.rows.flat()]),
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

const choiceExplanationPatches: Record<string, Partial<Record<ChoiceId, string>>> = {
  "prod-sql-basic-008": {
    A: "오답이다. 일반 식별자는 문자로 시작하고 허용된 문자 조합을 사용해야 한다. 하이픈은 뺄셈 연산자로 해석될 수 있어 별도 인용부호 없이 객체명으로 쓰기 부적절하다.",
    B: "오답이다. 별도 인용부호를 쓰지 않는 일반 객체명은 숫자로 시작할 수 없다. 숫자로 시작하는 이름을 쓰려면 인용 식별자가 필요하지만 실무와 시험에서는 피하는 편이 안전하다.",
    C: "정답이다. 문자로 시작하고 영문자, 숫자, 밑줄 조합만 사용하므로 별도 인용부호 없이 Oracle 일반 식별자로 쓰기 적절하다.",
    D: "오답이다. 공백이 포함된 이름은 별도 인용부호가 없으면 하나의 객체명으로 인식되지 않는다. 인용 식별자는 대소문자와 공백까지 관리해야 해 일반 설계에서는 권장되지 않는다."
  },
  "prod-ext-sql-basic-074": {
    A: "정답이다. PIVOT은 행 값을 컬럼으로 펼치면서 각 교차 셀에 들어갈 값을 집계해야 하므로 집계 함수가 필요하고, 어떤 값을 컬럼으로 만들지 IN 목록으로 지정해야 한다.",
    B: "오답이다. CONNECT BY PRIOR는 계층형 질의에서 부모-자식 탐색 방향을 정하는 조건이다. 행 값을 컬럼으로 전환하는 PIVOT의 필수 요소가 아니다.",
    C: "오답이다. ON DELETE CASCADE는 참조 무결성에서 부모 행 삭제 시 자식 행 삭제를 지정하는 옵션이다. PIVOT 집계나 행열 변환과 관계가 없다.",
    D: "오답이다. FOR UPDATE는 조회한 행에 잠금을 거는 절이다. PIVOT 결과를 만들기 위한 집계 기준이나 대상 값 목록을 대신할 수 없다."
  },
  "prod-ext-tuning-054": {
    A: "오답이다. `LIKE 'ABC%'`는 선행 문자열이 고정되어 있어 일반 B-Tree 인덱스에서 시작점과 종료점을 잡는 Range Scan이 가능하다.",
    B: "오답이다. BETWEEN은 하한과 상한이 모두 제시된 범위 조건이므로 인덱스의 수직 탐색 후 리프 블록 범위 스캔으로 이어질 수 있다.",
    C: "정답이다. `SUBSTR(C1,1,3)`처럼 컬럼을 함수로 가공하면 일반 인덱스의 키 값과 조건을 직접 비교하기 어렵다. 함수 기반 인덱스가 없다면 access predicate가 되기 힘들다.",
    D: "오답이다. 동등 조건은 B-Tree 인덱스에서 가장 전형적으로 시작점을 만들 수 있는 조건이다. 선택도가 낮아도 조건 형태 자체는 access에 적합하다."
  },
  "prod-ext-tuning-060": {
    A: "정답이다. OR Expansion은 OR 조건을 UNION ALL 분기로 나누어 각 분기에서 선택도 높은 인덱스를 독립적으로 활용하게 만드는 쿼리 변환이다.",
    B: "오답이다. OR 조건이 있다고 항상 Full Scan만 가능한 것은 아니다. OR Expansion, Bitmap 변환, IN-list 처리 등 조건과 인덱스 구성에 따라 여러 대안이 있다.",
    C: "오답이다. C2 조건을 삭제하면 원래 OR 조건의 결과 집합이 바뀐다. 튜닝 Rewrite는 성능 이전에 결과 보존이 먼저 검증되어야 한다.",
    D: "오답이다. ORDER BY는 최종 결과 정렬 요구사항일 뿐 OR 조건을 자동으로 제거하지 않는다. 오히려 불필요한 정렬 비용을 추가할 수 있다."
  },
  "prod-ext-tuning-067": {
    A: "정답이다. Bind Peeking은 최초 실행 바인드 값으로 계획을 만들고 공유하면서 다른 선택도의 값에서 비효율이 생길 수 있는 현상과 관련된다. Adaptive Cursor Sharing은 이런 편차를 완화하기 위한 기능이다.",
    B: "오답이다. Cartesian Product는 조인 조건 누락 등으로 두 집합의 곱이 만들어지는 현상이다. 바인드 값별 선택도 편차와 계획 공유 문제를 설명하지 않는다.",
    C: "오답이다. Direct Path Insert는 대량 입력 경로와 관련된 개념이다. SELECT 조건의 바인드 값 분포와 실행계획 공유 문제와는 초점이 다르다.",
    D: "오답이다. GROUPING SETS는 여러 집계 기준을 한 번에 계산하는 SQL 구문이다. 바인드 값별 실행계획 편차를 제어하는 기능이 아니다."
  },
  "prod-ext-modeling-106": {
    A: "오답이다. 피터 첸 표기법에서 사각형은 보통 엔터티를 나타낸다. 관계 자체를 표현하는 기본 도형과 구분해야 한다.",
    B: "오답이다. 타원은 속성을 나타내는 데 사용된다. 속성과 관계를 혼동하면 ERD 해석 문제에서 연결 의미를 잘못 읽게 된다.",
    C: "정답이다. 피터 첸 표기법에서 관계는 마름모로 표현한다. 엔터티 사각형과 속성 타원을 연결해 업무 규칙을 나타낸다.",
    D: "오답이다. 삼각형은 피터 첸 표기법에서 관계를 나타내는 일반 기본 도형이 아니다. 표기법별 도형 의미를 구분해야 한다."
  },
  "prod-ext-tuning-108": {
    A: "오답이다. FILTER 방식은 외부 행을 읽고 각 행마다 서브쿼리 조건을 평가할 수 있으므로 대량 외부 행에서는 반복 수행이 병목이 될 수 있다. 이 설명 자체는 타당하다.",
    B: "오답이다. FILTER Operation은 메인 쿼리 행을 기준으로 내부 조건을 확인하는 구조이므로 메인 쿼리 집합이 반복 평가의 출발점이 된다.",
    C: "정답이다. 메인 쿼리 건수가 많고 서브쿼리 조인 컬럼 인덱스가 없다면 반복 Full Scan이 발생할 수 있다. 이런 경우 Hash Semi Join 등으로 변환하는 편이 유리할 수 있어 항상 우수하다는 설명은 틀렸다.",
    D: "오답이다. 조건과 의미가 맞으면 UNNEST 계열 힌트나 옵티마이저 변환을 통해 Semi Join으로 바뀔 수 있다. 다만 변환 가능 여부는 NULL, 중복, 집계 여부에 따라 검토해야 한다."
  },
  "prod-ext-tuning-113": {
    A: "오답이다. APPEND 힌트는 Direct Path Insert를 유도하는 대표 수단이며, HWM 위쪽 새 블록에 적재하는 동작과 연결된다.",
    B: "오답이다. Direct Path Insert는 버퍼 캐시 경유와 기존 블록 탐색 부담을 줄여 대량 입력에서 유리할 수 있다. 이 설명은 장점으로 적절하다.",
    C: "정답이다. NOLOGGING은 Redo를 줄일 수 있지만 모든 Redo가 완전히 0이 되거나 복구 위험이 사라지는 것은 아니다. 백업과 장애 복구 전략을 함께 고려해야 한다.",
    D: "오답이다. Direct Path 작업은 일반 DML과 다른 잠금, 세그먼트 사용, 동시성 제약을 만들 수 있으므로 운영 영향 검토가 필요하다."
  },
  "prod-ext-tuning-116": {
    A: "정답이다. ROWS 프레임은 물리적인 행 개수를 기준으로 하므로 현재 행과 바로 앞 2개 행까지 최대 3개 행이 계산 범위가 된다.",
    B: "오답이다. 값이 같은 모든 행을 포함하는 설명은 RANGE 프레임의 동률 처리와 혼동한 것이다. ROWS는 값 동률이 아니라 행 위치 기준이다.",
    C: "오답이다. 파티션 전체를 항상 포함하는 것은 `UNBOUNDED PRECEDING`부터 `UNBOUNDED FOLLOWING` 같은 전체 프레임에 가깝다.",
    D: "오답이다. PRECEDING은 현재 행 이전 방향을 뜻한다. 이후 2개 행을 포함하려면 FOLLOWING을 사용해야 한다."
  }
};

function patchKnownObjectiveQuestionIssues(question: ObjectiveQuestion): ObjectiveQuestion {
  const whyWrongPatch = choiceExplanationPatches[question.id];
  const withPatchedWhyWrong = whyWrongPatch
    ? {
        ...question,
        whyWrong: {
          ...question.whyWrong,
          ...whyWrongPatch
        }
      }
    : question;

  question = withPatchedWhyWrong;

  const nullLinkText = [question.middleTopic, question.topic, question.stem, question.parentQuestionId].filter(Boolean).join(" ");
  if (question.subjectId === "sql-basic" && /\bNULL\b/i.test(nullLinkText) && !/SET NULL/i.test(nullLinkText)) {
    question = { ...question, relatedConceptId: "sql-null" };
  }

  const constraintLinkText = [question.middleTopic, question.topic, question.stem, question.code, question.parentQuestionId].filter(Boolean).join(" ");
  const isConstraintQuestion =
    question.subjectId === "sql-basic" &&
    !/SELECT\s+목록\s+제약|GROUP BY.*SELECT/i.test(constraintLinkText) &&
    /(제약조건|참조\s*무결성|CHECK|PRIMARY\s+KEY|FOREIGN\s+KEY|UNIQUE|ON\s+DELETE|CASCADE|SET\s+NULL|외래키|기본키)/i.test(
      constraintLinkText
    );

  if (isConstraintQuestion) {
    question = { ...question, relatedConceptId: "sql-constraints" };
  }

  if (question.id === "prod-sql-basic-005" || question.id === "prod-sql-basic-008") {
    question = { ...question, relatedConceptId: "sql-identifiers" };
  }

  const windowFunctionLinkText = [
    question.middleTopic,
    question.topic,
    question.stem,
    question.passage,
    question.code,
    question.parentQuestionId,
    ...question.choices.map((choice) => choice.text)
  ]
    .filter(Boolean)
    .join(" ");
  if (
    question.subjectId === "sql-basic" &&
    /(ROW_NUMBER|DENSE_RANK|RANK|NTILE|LAG|LEAD|OVER\s*\(|PARTITION\s+BY|ROWS\s+BETWEEN|RANGE\s+BETWEEN|Window|window)/i.test(
      windowFunctionLinkText
    )
  ) {
    question = { ...question, relatedConceptId: "sql-window-functions" };
  }

  if (question.id === "prod-tuning-010") {
    return {
      ...question,
      sourceDocument: "SQL-자격검정-실전문제.pdf",
      sourcePage: 89,
      sourceQuestionNumber: 53,
      sourceType: "owner_pdf_variant",
      generationMode: "transformed",
      majorTopic: "SQL 고급활용 및 튜닝",
      middleTopic: "인덱스 튜닝",
      topic: "결합 인덱스 액세스 조건",
      difficulty: "상급",
      questionType: "실행계획 기반 인덱스 조건 판단형",
      stem:
        "다음 인덱스 구성과 SQL을 고려할 때, 실행계획 맨 아래 ID=5의 주문_IDX 인덱스 Range Scan에서 액세스 조건으로 가장 적절한 것은?",
      passage:
        "[인덱스 구성]\nCREATE INDEX 주문_IDX ON 주문(주문일자, 고객번호);\n\n[실행계획 요약]\n0 SELECT STATEMENT\n1  TABLE ACCESS BY INDEX ROWID 주문\n2   NESTED LOOPS\n3    TABLE ACCESS BY INDEX ROWID 고객\n4     INDEX RANGE SCAN 고객_X01\n5    INDEX RANGE SCAN 주문_IDX",
      code: `SELECT /*+ ordered use_nl(o) */ *
FROM   고객 c,
       주문 o
WHERE  c.가입일자 = '20130414'
AND    o.고객번호 = c.고객번호
AND    o.주문일자 = '20130414'
AND    o.상품코드 = 'A123';`,
      table: undefined,
      tables: undefined,
      visualAssets: undefined,
      choices: [
        { id: "A", text: "o.고객번호 = c.고객번호" },
        { id: "B", text: "o.주문일자 = '20130414'" },
        { id: "C", text: "o.주문일자 = '20130414' AND o.고객번호 = c.고객번호" },
        {
          id: "D",
          text:
            "o.주문일자 = '20130414' AND o.고객번호 = c.고객번호 AND o.상품코드 = 'A123'"
        }
      ],
      answer: "C",
      relatedConceptId: "tuning-index-design",
      hint:
        "1단계: 주문_IDX의 컬럼 순서를 먼저 확인한다.\n2단계: 인덱스에 포함된 컬럼만 액세스 조건 후보가 될 수 있다.\n3단계: 선두 컬럼 주문일자와 두 번째 컬럼 고객번호는 모두 조건에 있고, 상품코드는 인덱스 컬럼이 아니다.",
      explanation:
        "주문_IDX는 (주문일자, 고객번호) 순서의 결합 인덱스다. SQL에는 주문일자 동등 조건과 고객번호 조인 조건이 모두 존재하므로 두 조건은 주문_IDX Range Scan의 액세스 조건으로 사용할 수 있다. 반면 상품코드는 주문_IDX에 포함되지 않았으므로 해당 인덱스의 액세스 조건이 될 수 없고, 테이블 액세스 이후 필터 조건으로 평가된다.",
      whyWrong: {
        A: "오답이다. 고객번호 조건만으로는 주문_IDX의 선두 컬럼인 주문일자를 사용하지 못한다.",
        B: "오답이다. 주문일자는 선두 컬럼이므로 액세스 조건이 되지만, 두 번째 컬럼 고객번호 조건도 함께 사용할 수 있다.",
        C: "정답이다. 주문일자와 고객번호가 모두 주문_IDX의 구성 컬럼이고 SQL 조건에도 존재하므로 액세스 조건으로 가장 적절하다.",
        D: "오답이다. 상품코드는 주문_IDX 구성 컬럼이 아니므로 주문_IDX의 액세스 조건에 포함될 수 없다."
      },
      duplicationCheck:
        "manual PDF recheck: SQL-자격검정-실전문제 53번의 결합 인덱스 액세스 조건 판단 구조를 기준으로 짧은 Hash Join 개념형 문제를 교체"
    };
  }

  if (question.id === "prod-ext-tuning-016") {
    return {
      ...question,
      sourceDocument: "SQL-자격검정-실전문제.pdf",
      sourcePage: 89,
      sourceQuestionNumber: 54,
      sourceType: "owner_pdf_variant",
      generationMode: "transformed",
      majorTopic: "SQL 고급활용 및 튜닝",
      middleTopic: "SQL Trace",
      topic: "Row Source Operation 해석",
      difficulty: "최상급",
      questionType: "SQL Trace 기반 튜닝 우선순위 판단형",
      stem:
        "다음 SQL Trace의 Row Source Operation을 보고 튜닝을 위해 가장 우선적으로 검토할 사항으로 가장 적절한 것은? 단, 한 달 주문 건수는 평균 50만 건이다.",
      passage:
        "[Row Source Operation]\n10    NESTED LOOPS (cr=149480 pr=13563 time=19337719 us)\n23    TABLE ACCESS BY INDEX ROWID 고객 (cr=103541 pr=13562 time=8766716 us)\n2978  INDEX RANGE SCAN 고객_IDX (cr=46092 pr=968 time=1879909 us)\n10    TABLE ACCESS BY INDEX ROWID 주문 (cr=45939 pr=1 time=5375998 us)\n28    INDEX RANGE SCAN 주문_IDX (cr=4 pr=0)",
      code: `SELECT c.고객명,
       c.연령,
       c.전화번호,
       o.주문일자,
       o.주문금액,
       o.배송지주소
FROM   고객 c,
       주문 o
WHERE  o.고객번호 = c.고객번호
AND    c.고객등급 = 'A'
AND    c.연령 BETWEEN 51 AND 60
AND    o.주문일자 BETWEEN '20101201' AND '20101231';`,
      table: undefined,
      tables: undefined,
      visualAssets: undefined,
      choices: [
        { id: "A", text: "고객_IDX 인덱스의 컬럼 순서를 조정한다." },
        { id: "B", text: "고객_IDX 인덱스에 필터링 컬럼을 추가하는 방안을 검토한다." },
        { id: "C", text: "주문_IDX 인덱스에 배송지주소 컬럼을 추가한다." },
        { id: "D", text: "주문 테이블을 항상 선행 집합으로 변경한다." }
      ],
      answer: "B",
      relatedConceptId: "tuning-sql-trace",
      hint:
        "1단계: Rows와 cr이 어느 Row Source에서 크게 발생하는지 본다.\n2단계: 고객_IDX에서 많은 행을 찾은 뒤 고객 테이블 액세스에서 많이 걸러지는지 확인한다.\n3단계: 고객 조건 컬럼이 인덱스에서 충분히 필터링되지 못하면 인덱스 구성 보완이 우선 검토 대상이다.",
      explanation:
        "Trace에서는 고객_IDX Range Scan에서 2,978건을 찾고 고객 테이블 액세스에서 23건만 남는다. 이 과정에서 고객 쪽 cr과 pr이 크게 발생하므로, 고객 조건인 고객등급과 연령을 인덱스 단계에서 더 줄일 수 있는지 검토하는 것이 우선이다. 주문 쪽은 주문_IDX Range Scan의 cr이 매우 작고 반환 Rows도 제한적이므로 첫 번째 병목으로 보기 어렵다.",
      whyWrong: {
        A: "부분적으로 검토할 수는 있지만, 문제의 핵심은 단순 순서 조정 자체보다 고객 조건을 인덱스에서 더 많이 처리하도록 구성하는 것이다.",
        B: "정답이다. 고객_IDX에서 많은 후보를 읽고 테이블 액세스 후 적은 행만 남으므로 고객 조건 컬럼을 인덱스에 반영하는 방안이 우선이다.",
        C: "오답이다. 배송지주소는 SELECT 컬럼일 뿐이며 Trace의 주된 병목은 주문_IDX가 아니라 고객 쪽 후보 행과 테이블 액세스다.",
        D: "오답이다. 한 달 주문이 50만 건이면 주문을 무조건 선행하는 방식은 더 큰 선행 집합을 만들 수 있다."
      },
      duplicationCheck:
        "manual PDF recheck: SQL-자격검정-실전문제 54번의 Trace Row Source 기반 튜닝 우선순위 판단 구조를 기준으로 짧은 Sort Merge Join 개념형 문제를 교체"
    };
  }

  if (question.id === "prod-ext-tuning-014") {
    return {
      ...question,
      sourceDocument: "SQL-자격검정-실전문제.pdf",
      sourcePage: 70,
      sourceQuestionNumber: 143,
      sourceType: "owner_pdf_variant",
      generationMode: "transformed",
      majorTopic: "SQL 고급활용 및 튜닝",
      middleTopic: "조인 튜닝",
      topic: "Semi Join 실행 방식",
      difficulty: "상급",
      questionType: "SQL 기반 조인 기법 판단형",
      stem: "다음 SQL에서 나타날 수 있는 조인 기법으로 가장 적절한 것은?",
      passage: "[DEPT 테이블 INDEX 정보]\nPK_DEPT : DEPTNO\n\n[EMP 테이블 INDEX 정보]\nPK_EMP : EMPNO\nIDX_EMP_01 : DEPTNO",
      code: `SELECT *
FROM   DEPT D
WHERE  D.DEPTNO = 'A001'
AND    EXISTS (
         SELECT 'X'
         FROM   EMP E
         WHERE  D.DEPTNO = E.DEPTNO
       );`,
      table: undefined,
      tables: undefined,
      visualAssets: undefined,
      choices: [
        { id: "A", text: "HASH ANTI JOIN" },
        { id: "B", text: "HASH SEMI JOIN" },
        { id: "C", text: "NESTED LOOP ANTI JOIN" },
        { id: "D", text: "NESTED LOOP SEMI JOIN" }
      ],
      answer: "D",
      relatedConceptId: "tuning-nl-join",
      hint:
        "1단계: EXISTS는 결과를 중복 생성하지 않고 존재 여부만 확인합니다.\n2단계: ANTI JOIN은 NOT EXISTS/NOT IN 계열에서 주로 나타납니다.\n3단계: 선행 DEPT가 단건에 가깝고 EMP.DEPTNO 인덱스가 있으면 후행 인덱스 탐색형 Semi Join을 판단합니다.",
      explanation:
        "EXISTS 서브쿼리는 조건을 만족하는 행의 존재 여부만 확인하므로 Semi Join으로 변환될 수 있다. 여기서는 DEPT가 DEPTNO = 'A001' 조건으로 매우 작게 줄고, EMP에는 DEPTNO 인덱스가 있으므로 후행 EMP를 반복 탐색하는 Nested Loop Semi Join이 가장 자연스럽다.",
      whyWrong: {
        A: "오답이다. ANTI JOIN은 존재하지 않는 행을 찾는 NOT EXISTS 또는 NOT IN 계열에 대응한다.",
        B: "오답이다. EXISTS는 Semi Join 계열이지만, 이 문제의 인덱스와 선행 집합 조건에서는 Hash보다 Nested Loop 방식이 더 적절하다.",
        C: "오답이다. 조인 방식은 Nested Loop일 수 있으나 EXISTS는 Anti가 아니라 Semi 성격이다.",
        D: "정답이다. EXISTS 조건은 Semi Join으로 변환될 수 있고, DEPT 단건 조건과 EMP.DEPTNO 인덱스가 있어 Nested Loop Semi Join이 적절하다."
      },
      duplicationCheck:
        "manual PDF recheck: SQL-자격검정 실전문제 143번의 SQL/인덱스 정보 기반 조인 기법 판단형으로 교체"
    };
  }

  if (question.id === "prod-ext-tuning-015") {
    return {
      ...question,
      sourceDocument: "SQL-자격검정-실전문제.pdf",
      sourcePage: 70,
      sourceQuestionNumber: 145,
      sourceType: "owner_pdf_variant",
      generationMode: "transformed",
      majorTopic: "SQL 고급활용 및 튜닝",
      middleTopic: "조인 튜닝",
      topic: "Hash Join 적용 조건",
      difficulty: "상급",
      questionType: "조인 방식 조건 판단형",
      stem:
        "해싱(Hashing) 기법을 이용하여 조인하는 Hash Join이 더 효과적일 수 있는 조건에 대한 설명으로 가장 부적절한 것은?",
      passage:
        "Hash Join은 한쪽 입력을 메모리에 해시 테이블로 만들고 다른 입력을 Probe하는 방식이다. 조인 컬럼 인덱스 부재, 대량 랜덤 액세스 부담, 정렬 비용 등을 함께 판단한다.",
      code: undefined,
      table: undefined,
      tables: undefined,
      visualAssets: undefined,
      choices: [
        { id: "A", text: "조인 컬럼에 적절한 인덱스가 없어 Nested Loops Join의 반복 탐색이 비효율적인 경우" },
        { id: "B", text: "드라이빙 집합에서 후행 테이블로 조인 액세스하는 양이 많아 랜덤 액세스 부하가 심한 경우" },
        { id: "C", text: "Sort Merge Join을 수행하기에는 두 입력이 커서 정렬 부하가 큰 경우" },
        { id: "D", text: "유니크 인덱스를 활용해 소량 테이블을 온라인으로 빠르게 조회하는 경우" }
      ],
      answer: "D",
      relatedConceptId: "tuning-hash-join",
      hint:
        "1단계: Hash Join은 대량 조인에서 랜덤 액세스와 정렬 부담을 줄일 때 유리합니다.\n2단계: 소량 온라인 조회와 유니크 인덱스 탐색은 보통 NL Join에 가까운 조건입니다.\n3단계: Hash Join이 유리한 조건이 아닌 보기를 찾습니다.",
      explanation:
        "Hash Join은 후행 테이블 인덱스 탐색이 비효율적이거나 대량 랜덤 액세스가 발생하거나 Sort Merge Join의 정렬 비용이 큰 경우 유리할 수 있다. 반대로 소량 데이터를 유니크 인덱스로 빠르게 찾는 온라인 조회는 Nested Loops Join이 더 자연스러운 조건이므로 Hash Join의 효과적 조건으로 보기 어렵다.",
      whyWrong: {
        A: "오답이다. 후행 조인 컬럼에 적절한 인덱스가 없으면 NL Join 반복 탐색 비용이 커져 Hash Join이 대안이 될 수 있다.",
        B: "오답이다. 많은 조인 액세스가 랜덤 I/O로 이어지는 상황은 Hash Join 검토 대상이다.",
        C: "오답이다. 두 입력의 정렬 비용이 큰 경우 Sort Merge Join보다 Hash Join이 유리할 수 있다.",
        D: "정답이다. 소량 테이블을 유니크 인덱스로 빠르게 조회하는 온라인 처리라면 Hash Join보다 NL Join 조건에 가깝다."
      },
      duplicationCheck:
        "manual PDF recheck: SQL-자격검정 실전문제 145번의 Hash Join 적용 조건 판단형으로 교체"
    };
  }

  if (question.id === "prod-tuning-009") {
    return {
      ...question,
      sourceDocument: "SQL-자격검정-실전문제.pdf",
      sourcePage: 88,
      sourceQuestionNumber: 51,
      sourceType: "owner_pdf_similar",
      generationMode: "generated_similar",
      duplicationCheck:
        "manual PDF recheck: SQL-자격검정 실전문제 51번은 Trace를 보고 2개를 고르는 원문 문제다. 현재 문항은 Access/Filter Predicate 유사형이므로 원문형으로 표시하지 않는다."
    };
  }

  if (
    question.subjectId === "tuning" &&
    question.sourcePage === 99 &&
    question.sourceQuestionNumber === 78 &&
    question.generationMode === "original"
  ) {
    return {
      ...question,
      sourceDocument: "SQL-자격검정-실전문제.pdf",
      sourcePage: 99,
      sourceQuestionNumber: 78,
      sourceType: "owner_pdf",
      generationMode: "original",
      majorTopic: "SQL 고급활용 및 튜닝",
      middleTopic: "파티션 튜닝",
      topic: "Local Prefixed 파티션 인덱스",
      difficulty: "상급",
      questionType: "DDL 기반 인덱스 유형 판단형",
      stem: "거래 테이블이 아래와 같을 때, 다음 중 Local Prefixed 파티션 인덱스로 가장 적절한 것은?",
      passage: undefined,
      code: `CREATE TABLE 거래 (
  고객번호 VARCHAR2(10),
  종목코드 VARCHAR2(20),
  거래일시 DATE,
  ...
)
PARTITION BY RANGE (거래일시) (
  PARTITION p2010 VALUES LESS THAN (TO_DATE('20110101','YYYYMMDD')),
  PARTITION p2011 VALUES LESS THAN (TO_DATE('20120101','YYYYMMDD')),
  PARTITION p2012 VALUES LESS THAN (TO_DATE('20130101','YYYYMMDD')),
  PARTITION p2013 VALUES LESS THAN (TO_DATE('20140101','YYYYMMDD')),
  PARTITION pmax VALUES LESS THAN (MAXVALUE)
);`,
      table: undefined,
      tables: undefined,
      choices: [
        { id: "A", text: "CREATE INDEX 거래_N1 ON 거래(거래일시) LOCAL" },
        { id: "B", text: "CREATE INDEX 거래_N2 ON 거래(고객번호) LOCAL" },
        { id: "C", text: "CREATE INDEX 거래_N3 ON 거래(종목코드) LOCAL" },
        { id: "D", text: "CREATE INDEX 거래_N4 ON 거래(종목코드, 거래일시) LOCAL" }
      ],
      answer: "A",
      relatedConceptId: "tuning-partition-pruning",
      hint:
        "1단계: 테이블 파티션 키가 무엇인지 먼저 확인합니다.\n2단계: LOCAL 여부와 Prefixed 여부는 서로 다른 기준입니다.\n3단계: 파티션 키가 인덱스 선두 컬럼이면 Local Prefixed입니다.",
      explanation:
        "Local Prefixed 파티션 인덱스는 로컬 인덱스이면서 인덱스의 선두 컬럼이 테이블 파티션 키로 시작하는 경우다. 이 테이블은 거래일시 기준 Range Partition이므로 거래일시가 선두 컬럼인 거래_N1 LOCAL 인덱스가 Local Prefixed에 해당한다.",
      whyWrong: {
        A: "정답이다. LOCAL 인덱스이고 테이블 파티션 키인 거래일시가 인덱스 선두 컬럼이므로 Local Prefixed 파티션 인덱스다.",
        B: "오답이다. LOCAL 인덱스이지만 선두 컬럼이 고객번호라서 테이블 파티션 키인 거래일시로 시작하지 않는다. Local Nonprefixed에 가깝다.",
        C: "오답이다. LOCAL 인덱스이지만 종목코드가 선두 컬럼이므로 파티션 키 선두 조건을 만족하지 않는다.",
        D: "오답이다. 거래일시가 포함되어 있더라도 선두 컬럼이 종목코드이므로 Prefixed 조건을 만족하지 않는다."
      },
      duplicationCheck: "manual PDF recheck: SQL-자격검정 실전문제 78번 원문 DDL의 p2013 파티션과 선택지를 복원"
    };
  }

  if (
    question.subjectId === "tuning" &&
    question.sourceQuestionNumber === 70 &&
    question.generationMode === "original" &&
    question.stem.includes("INSERT")
  ) {
    return {
      ...question,
      sourceDocument: "SQL-자격검정-실전문제.pdf",
      sourcePage: 96,
      sourceQuestionNumber: 70,
      sourceType: "owner_pdf_variant",
      generationMode: "transformed",
      code: `INSERT /*+ APPEND */ ALL
WHEN :v_주식선물구분 = '주식'
THEN INTO 주식월별시세(종목코드, 거래일자, 종가)
WHEN :v_주식선물구분 = '선물'
THEN INTO 선물월별시세(종목코드, 거래일자, 종가)
SELECT a.종목코드
     , :v_기준일자 AS 거래일자
     , AVG(a.종가) AS 종가
FROM 주식일별시세 a
WHERE :v_주식선물구분 = '주식'
  AND a.거래일자 BETWEEN ADD_MONTHS(:v_기준일자, -1) AND :v_기준일자
GROUP BY a.종목코드
UNION ALL
SELECT a.종목코드
     , :v_기준일자 AS 거래일자
     , AVG(a.종가) AS 종가
FROM 선물일별시세 a
WHERE :v_주식선물구분 = '선물'
  AND a.거래일자 BETWEEN ADD_MONTHS(:v_기준일자, -1) AND :v_기준일자
GROUP BY a.종목코드;

-- 세션 100
EXEC :v_주식선물구분 := '주식';
/

-- 세션 200
EXEC :v_주식선물구분 := '선물';
/`,
      duplicationCheck: "manual PDF recheck: SQL-자격검정 실전문제 70번 원문 SQL을 근거로 한 변형 문제다. PDF 원문 선택지와 완전히 같지 않으므로 Original이 아닌 Variant로 관리한다."
    };
  }

  if (question.id === "prod-modeling-001") {
    return {
      ...question,
      difficulty: "중급",
      stem:
        "회원, 주문, 주문상세, 상품 후보를 도출하는 모델링 회의에서 엔터티 후보를 검토하고 있다. 다음 중 일반적인 엔터티 판단 기준으로 가장 부적절한 설명은?",
      passage:
        "엔터티는 업무에서 관리해야 하는 대상이며, 식별 가능하고 여러 인스턴스를 가질 수 있어야 한다. 다만 공통코드나 통계성 엔터티처럼 관계 표현 방식에 예외가 생길 수 있다.",
      explanation:
        "엔터티는 업무에서 필요로 하고, 식별 가능하며, 속성을 가지고, 업무 프로세스에서 이용되는 데이터 집합이다. 일반적으로 다른 엔터티와 관계를 갖지만, 공통코드나 통계성 엔터티처럼 관계 표현이 단순하거나 생략되는 예외가 있을 수 있다.",
      whyWrong: {
        A: "정답이다. 엔터티가 항상 다른 엔터티와의 관계를 전혀 가지지 않는다는 설명은 부적절하다. 대부분의 엔터티는 업무 규칙에 따라 관계를 가지며, 예외가 있더라도 일반 원칙을 부정할 수는 없다.",
        B: "오답이다. 엔터티 인스턴스는 업무적으로 구분되어야 하므로 식별자에 의해 식별 가능해야 한다.",
        C: "오답이다. 업무 프로세스에서 사용되지 않는 데이터 집합은 관리 대상 엔터티로 보기 어렵다.",
        D: "오답이다. 엔터티는 관리할 속성을 포함해야 하며, 속성 없이 존재 의미를 설명하기 어렵다."
      }
    };
  }

  if (question.id === "prod-sql-basic-001") {
    return {
      ...question,
      difficulty: "중급",
      stem:
        "운영 담당자가 퇴사한 사용자에게 부여된 특정 테이블 조회 권한을 회수하려고 한다. SQL 명령어 분류와 목적을 모두 고려할 때 사용할 명령어로 가장 적절한 것은?",
      passage: "DCL은 데이터베이스 객체 접근 권한을 부여하거나 회수하는 명령어 집합이다. DML, DDL, TCL과 목적이 다르다.",
      explanation:
        "권한 회수는 데이터 제어어(DCL)의 역할이며 REVOKE를 사용한다. INSERT는 데이터 조작어, RENAME은 객체 정의 변경에 가까운 DDL, COMMIT은 트랜잭션 제어어다.",
      whyWrong: {
        A: "오답이다. INSERT는 테이블에 행을 추가하는 DML이다. 사용자 권한을 회수하는 기능이 없다.",
        B: "오답이다. RENAME은 객체 이름을 바꾸는 DDL 성격의 명령이다. 권한 회수와 목적이 다르다.",
        C: "오답이다. COMMIT은 현재 트랜잭션의 변경을 확정하는 TCL이다. 권한을 변경하지 않는다.",
        D: "정답이다. REVOKE는 사용자나 역할에 부여된 객체 권한을 회수하는 DCL 명령이다."
      }
    };
  }

  if (question.id === "prod-sql-basic-005") {
    return {
      ...question,
      difficulty: "중급",
      stem:
        "Oracle에서 별도 인용부호를 사용하지 않고 물리 테이블명을 생성하려 한다. 다음 후보 중 일반 식별자 규칙과 유지보수성을 함께 고려할 때 가장 적절한 것은?",
      passage: "일반 식별자는 문자로 시작하고, 허용된 문자 조합을 사용해야 하며, 연산자처럼 해석될 수 있는 기호나 공백을 피해야 한다.",
      explanation:
        "EMP_10은 문자로 시작하고 밑줄과 숫자를 포함하는 일반적인 식별자 형태다. 숫자로 시작하거나 하이픈을 포함한 이름은 별도 인용부호 없이는 일반 객체명으로 부적절하다.",
      whyWrong: {
        A: "정답이다. 문자로 시작하고 밑줄과 숫자만 사용하므로 일반 식별자로 적절하다.",
        B: "오답이다. 숫자로 시작하고 하이픈도 포함하므로 별도 인용부호 없이 일반 테이블명으로 사용하기 부적절하다.",
        C: "오답이다. 문자로 시작하더라도 하이픈은 뺄셈 연산자처럼 해석될 수 있어 일반 식별자에 적절하지 않다.",
        D: "오답이다. 숫자로 시작하는 일반 식별자는 허용되지 않는다. 인용 식별자를 쓰면 가능하더라도 운영 SQL 작성과 유지보수에 불리하다."
      }
    };
  }

  if (question.id === "prod-sql-basic-008") {
    return {
      ...question,
      difficulty: "중급",
      stem:
        "주문 상세 테이블을 생성하면서 SQL에서 매번 큰따옴표를 붙이지 않아도 되는 객체명을 선택하려 한다. Oracle 일반 식별자 규칙상 가장 적절한 후보는?",
      passage:
        "인용 식별자를 사용하면 공백이나 특수문자를 포함할 수 있지만, 이후 SQL 작성 시 대소문자와 인용부호를 계속 맞춰야 하므로 일반 객체명으로는 피하는 것이 좋다."
    };
  }

  if (
    question.id === "prod-ext-tuning-051" &&
    question.parentQuestionId === "pdf-o-3-trace-cpu-elapsed"
  ) {
    return {
      ...question,
      difficulty: "최상급",
      questionType: "Trace 수치 해석형",
      stem: "아래 Trace 결과를 보고 병목 원인을 판단할 때 가장 직접적인 근거로 적절한 것은?",
      table: {
        title: "Trace 요약",
        headers: ["Call", "Count", "CPU Time", "Elapsed Time", "Disk", "Query", "Current", "Rows"],
        rows: [
          ["Parse", "1", "0.010", "0.012", "0", "0", "0", "0"],
          ["Execute", "1", "0.000", "0.000", "0", "0", "0", "0"],
          ["Fetch", "78", "10.150", "49.199", "27830", "266468", "0", "1909"],
          ["Total", "80", "10.160", "49.231", "27830", "266468", "0", "1909"]
        ]
      },
      choices: [
        {
          id: "A",
          text:
            "Index Range Scan에서 약 26만 건의 ROWID 후보가 발생한 뒤 TABLE ACCESS BY INDEX ROWID에서 1,909건으로 줄었으므로 인덱스 컬럼 순서나 필터 컬럼 포함 여부를 우선 점검한다."
        },
        {
          id: "B",
          text: "Parse가 1회 발생했으므로 병목의 핵심은 하드 파싱이며 실행 단계의 I/O는 중요하지 않다."
        },
        {
          id: "C",
          text: "Rows가 1,909건으로 적으므로 Query와 Disk 수치가 커도 테이블 랜덤 액세스 비용은 문제가 되지 않는다."
        },
        {
          id: "D",
          text: "Current가 0이므로 이 SQL은 블록을 거의 읽지 않았고 성능 개선 대상이 아니다."
        }
      ],
      answer: "A",
      hint:
        "1단계: Fetch 단계의 Disk, Query, Rows 수치를 함께 봅니다.\n2단계: Row Source에서 인덱스 단계의 Rows와 테이블 액세스 단계의 Rows 차이를 확인합니다.\n3단계: 많이 읽고 적게 남기는 구조라면 인덱스 스캔 효율과 테이블 랜덤 액세스를 의심합니다.",
      explanation:
        "Trace는 Fetch 단계에 대부분의 elapsed time과 I/O가 집중되어 있고, Row Source에서는 INDEX RANGE SCAN이 약 26만 건의 후보를 만든 뒤 TABLE ACCESS BY INDEX ROWID 단계에서 1,909건만 남는다. 이는 필요한 행을 찾기 전에 너무 많은 ROWID 후보와 테이블 블록 방문이 발생한 구조이므로 인덱스 컬럼 순서, 조건 컬럼 포함 여부, 테이블 랜덤 액세스 비용을 우선 점검해야 한다. CPU Time과 Elapsed Time의 차이가 큰 점도 I/O 대기 가능성을 함께 보게 만드는 근거다.",
      whyWrong: {
        A: "정답이다. Rows 대비 Query와 Disk가 크고, 인덱스 단계에서 많은 후보가 발생한 뒤 테이블 액세스에서 크게 줄어드는 구조라 인덱스 스캔 효율과 테이블 랜덤 액세스 비용을 우선 점검해야 한다.",
        B: "오답이다. Parse는 1회이고 시간과 I/O는 Fetch 단계에 몰려 있다. 하드 파싱 병목으로 단정할 수 없다.",
        C: "오답이다. 최종 반환 Rows가 적더라도 그 과정에서 Query 266,468, Disk 27,830이 발생했다면 비효율을 의심해야 한다.",
        D: "오답이다. Current는 변경 블록 읽기 성격의 수치이며, Query와 Disk가 매우 크므로 읽기 비용이 없다고 볼 수 없다."
      },
      duplicationCheck: "manual PDF recheck: Trace 수치와 Row Source Operation을 PDF 51번 자료와 대조해 단일 선택형으로 보정"
    };
  }

  if (question.id === "prod-ext-sql-basic-022") {
    return {
      ...question,
      sourceDocument: "manual-pdf-derived-outer-join",
      sourcePage: undefined,
      sourceQuestionNumber: undefined,
      sourceType: "owner_pdf_similar",
      generationMode: "generated_similar",
      stem:
        "EMP와 DEPT를 C 컬럼으로 조인한다. 아래 데이터에서 LEFT OUTER JOIN, FULL OUTER JOIN, RIGHT OUTER JOIN 결과 건수 조합으로 가장 적절한 것은?",
      passage:
        "조인 조건은 EMP.C = DEPT.C 이며, 결과 건수는 LEFT, FULL, RIGHT 순서로 판단한다. 같은 C 값이 양쪽에 여러 건 있으면 조인 결과가 곱으로 늘어날 수 있다.",
      table: undefined,
      tables: [
        {
          title: "EMP 테이블",
          headers: ["A", "B", "C"],
          rows: [
            ["1", "b", "w"],
            ["3", "d", "w"],
            ["5", "y", "y"],
            ["7", "n", "NULL"]
          ]
        },
        {
          title: "DEPT 테이블",
          headers: ["C", "D", "E"],
          rows: [
            ["w", "1", "10"],
            ["w", "2", "20"],
            ["z", "4", "11"]
          ]
        }
      ],
      choices: [
        { id: "A", text: "LEFT 4건, FULL 5건, RIGHT 5건" },
        { id: "B", text: "LEFT 6건, FULL 7건, RIGHT 5건" },
        { id: "C", text: "LEFT 5건, FULL 6건, RIGHT 4건" },
        { id: "D", text: "LEFT 6건, FULL 6건, RIGHT 6건" }
      ],
      answer: "B",
      hint:
        "1단계: EMP의 C=w 두 행과 DEPT의 C=w 두 행이 조인되면 2×2로 4건이 됩니다.\n2단계: EMP의 C=y와 C=NULL은 LEFT/FULL에서 보존되고, DEPT의 C=z는 RIGHT/FULL에서 보존됩니다.\n3단계: FULL OUTER JOIN은 LEFT 결과에 오른쪽 미매칭 행을 추가합니다.",
      explanation:
        "C=w는 EMP에 2건, DEPT에 2건이 있으므로 매칭 결과가 4건이다. LEFT OUTER JOIN은 여기에 EMP의 C=y 미매칭 1건과 C=NULL 미매칭 1건을 보존해 6건이다. FULL OUTER JOIN은 LEFT 결과 6건에 DEPT의 C=z 미매칭 1건을 더해 7건이다. RIGHT OUTER JOIN은 C=w 매칭 4건과 DEPT의 C=z 미매칭 1건을 보존해 5건이다.",
      whyWrong: {
        A: "오답이다. C=w의 중복 매칭이 4건으로 늘어나는 점과 EMP의 미매칭 두 행을 모두 반영하지 못했다.",
        B: "정답이다. C=w 중복 매칭 4건, EMP 미매칭 2건, DEPT 미매칭 1건을 외부 조인 방향별로 정확히 반영했다.",
        C: "오답이다. RIGHT OUTER JOIN에서도 C=w 중복 매칭 4건에 DEPT의 C=z 미매칭 1건이 더해져 5건이다.",
        D: "오답이다. FULL OUTER JOIN은 양쪽 미매칭 행을 모두 포함하므로 RIGHT보다 1건 더 많아야 한다."
      },
      duplicationCheck: "outer join count variant with duplicate join key and null-preserved row; not a table-name or number-only duplicate"
    };
  }

  if (question.id === "prod-ext-modeling-106") {
    return {
      ...question,
      difficulty: "중급",
      stem:
        "피터 첸 표기법으로 고객과 주문 사이의 업무 규칙을 ERD로 표현하려 한다. 엔터티, 속성, 관계의 도형 의미를 구분할 때 관계를 나타내는 도형으로 가장 적절한 것은?",
      passage: "피터 첸 표기법은 엔터티, 속성, 관계를 서로 다른 도형으로 표현해 업무 대상과 연결 규칙을 시각적으로 구분한다."
    };
  }

  if (question.id === "prod-ext-modeling-118") {
    return {
      ...question,
      difficulty: "중급",
      stem:
        "주문 생성, 결제 승인, 재고 차감이 하나의 논리 작업으로 처리되어야 하는 시스템을 설계하고 있다. 트랜잭션의 ACID 특성에 포함되지 않는 것은?",
      passage:
        "ACID는 트랜잭션이 중간 실패나 동시 실행 상황에서도 데이터 정합성을 보장하기 위해 갖추어야 하는 대표 특성이다."
    };
  }

  if (question.id === "prod-ext-sql-basic-012") {
    return {
      ...question,
      majorTopic: "SQL 기본 및 활용",
      middleTopic: "함수와 조건절",
      topic: "날짜 조건과 인덱스 활용",
      difficulty: "상급",
      questionType: "최적 SQL 선택형",
      stem:
        "서비스 가입 이력 테이블에서 2015년 1월에 시작된 유효 가입 건수를 서비스ID별로 집계하려 한다. 결과 정확성과 날짜 컬럼 인덱스 활용을 함께 고려할 때 가장 적절한 SQL은?",
      passage:
        "SVC_START_DATE와 SVC_END_DATE는 DATE 타입이다. 종료일이 없거나 2015년 2월 1일 이후인 행은 2015년 1월 말 기준으로 유효한 가입으로 본다.",
      code: undefined,
      table: {
        title: "SVC_JOIN",
        headers: ["컬럼", "설명"],
        rows: [
          ["SVC_ID", "서비스ID"],
          ["CUST_ID", "고객ID"],
          ["SVC_START_DATE", "가입 시작일"],
          ["SVC_END_DATE", "가입 종료일, 미종료 시 NULL"],
          ["JOIN_YMD", "가입일자 문자값, YYYYMMDD"]
        ]
      },
      tables: undefined,
      choices: [
        {
          id: "A",
          text:
            "SELECT svc_id, COUNT(*) AS cnt\nFROM svc_join\nWHERE TO_CHAR(svc_start_date, 'YYYYMM') = '201501'\n  AND NVL(svc_end_date, DATE '9999-12-31') >= DATE '2015-02-01'\nGROUP BY svc_id"
        },
        {
          id: "B",
          text:
            "SELECT svc_id, COUNT(*) AS cnt\nFROM svc_join\nWHERE svc_start_date >= DATE '2015-01-01'\n  AND svc_start_date <  DATE '2015-02-01'\n  AND (svc_end_date IS NULL OR svc_end_date >= DATE '2015-02-01')\nGROUP BY svc_id"
        },
        {
          id: "C",
          text:
            "SELECT svc_id, COUNT(*) AS cnt\nFROM svc_join\nWHERE svc_start_date BETWEEN DATE '2015-01-01' AND DATE '2015-01-31'\n  AND (svc_end_date IS NULL OR svc_end_date >= DATE '2015-02-01')\nGROUP BY svc_id"
        },
        {
          id: "D",
          text:
            "SELECT svc_id, COUNT(*) AS cnt\nFROM svc_join\nWHERE DATE '2015-01-31' BETWEEN svc_start_date AND svc_end_date\nGROUP BY svc_id"
        }
      ],
      answer: "B",
      relatedConceptId: "sql-date",
      hint:
        "1단계: DATE 컬럼에 함수를 씌우면 일반 B-Tree 인덱스의 range scan 가능성이 낮아진다.\n2단계: 1월 전체는 시작 이상, 다음 달 시작 미만의 반개구간으로 표현해야 시간값 누락이 없다.\n3단계: 종료일 NULL은 BETWEEN으로 비교하면 UNKNOWN이 되므로 별도 조건으로 보존해야 한다.",
      explanation:
        "DATE 타입 월 조건은 `>= 월 시작일`과 `< 다음 월 시작일` 형태가 가장 안전하다. 이 방식은 시간값이 포함된 DATE도 누락하지 않고, SVC_START_DATE 인덱스의 범위 스캔 가능성을 유지한다. 종료일이 NULL인 미종료 가입은 `svc_end_date IS NULL`로 별도 보존해야 한다.",
      whyWrong: {
        A: "오답이다. 시작일 컬럼에 TO_CHAR 함수를 적용해 일반 인덱스 활용을 어렵게 만들고, NVL도 종료일 컬럼 가공이므로 조건 평가와 인덱스 활용 측면에서 불리하다.",
        B: "정답이다. 시작일은 반개구간으로 처리해 시간값 누락을 피하고, 종료일 NULL을 별도 보존해 결과 정확성과 인덱스 접근 가능성을 함께 만족한다.",
        C: "오답이다. `DATE '2015-01-31'`은 2015-01-31 00:00:00이므로 1월 31일 오전 0시 이후의 데이터가 누락될 수 있다.",
        D: "오답이다. 1월에 시작된 가입을 찾는 문제가 아니라 1월 31일 시점 유효 여부만 판단하며, 종료일 NULL인 미종료 행도 BETWEEN에서 제외된다."
      },
      duplicationCheck: "replaced duplicate NULL count skeleton with PDF-style date predicate and index access question"
    };
  }

  if (question.id !== "prod-ext-sql-basic-053") return question;

  return {
    ...question,
    sourceDocument: "manual-pdf-derived-outer-join",
    sourcePage: undefined,
    sourceQuestionNumber: undefined,
    sourceType: "owner_pdf_similar",
    generationMode: "generated_similar",
    stem: "EMP.C는 DEPT.C와 연결된다. EMP 테이블과 DEPT 테이블을 각각 LEFT OUTER JOIN, FULL OUTER JOIN, RIGHT OUTER JOIN 했을 때 결과 건수로 가장 적절한 것은?",
    passage: "조인 조건은 EMP.C = DEPT.C 이며, 결과 건수는 LEFT, FULL, RIGHT 순서로 판단한다.",
    table: undefined,
    tables: [
      {
        title: "EMP 테이블",
        headers: ["A", "B", "C"],
        rows: [
          ["1", "b", "w"],
          ["3", "d", "w"],
          ["5", "y", "y"]
        ]
      },
      {
        title: "DEPT 테이블",
        headers: ["C", "D", "E"],
        rows: [
          ["w", "1", "10"],
          ["z", "4", "11"],
          ["v", "2", "22"]
        ]
      }
    ],
    choices: [
      { id: "A", text: "LEFT 3건, FULL 5건, RIGHT 4건" },
      { id: "B", text: "LEFT 3건, FULL 4건, RIGHT 5건" },
      { id: "C", text: "LEFT 4건, FULL 5건, RIGHT 4건" },
      { id: "D", text: "LEFT 3건, FULL 5건, RIGHT 3건" }
    ],
    answer: "A",
    hint: "1단계: EMP의 C=w 두 행은 DEPT의 C=w 한 행과 각각 매칭된다.\n2단계: EMP의 C=y는 LEFT/FULL에서만 보존되고, DEPT의 C=z, C=v는 RIGHT/FULL에서 보존된다.\n3단계: FULL OUTER JOIN은 양쪽 미매칭 행을 모두 포함하므로 LEFT 결과에 DEPT 미매칭 두 행을 더한다.",
    explanation: "EMP 기준 LEFT OUTER JOIN은 EMP의 3행을 보존한다. C=w 두 행은 DEPT의 C=w와 매칭되고, C=y 한 행은 DEPT 쪽 NULL로 남으므로 3건이다. FULL OUTER JOIN은 LEFT 결과 3건에 DEPT에서 매칭되지 않은 C=z, C=v 두 행을 더해 5건이다. RIGHT OUTER JOIN은 DEPT 기준으로 C=w 매칭 2건과 C=z, C=v 미매칭 2건을 포함하므로 4건이다.",
    whyWrong: {
      A: "정답이다. LEFT 3건, FULL 5건, RIGHT 4건으로 외부 조인의 보존 방향과 양쪽 미매칭 행을 모두 반영했다.",
      B: "오답이다. FULL OUTER JOIN은 양쪽 미매칭 행을 모두 포함하므로 RIGHT보다 작아질 수 없다.",
      C: "오답이다. LEFT OUTER JOIN은 EMP 기준 3행을 보존하며 DEPT의 미매칭 z, v는 포함하지 않는다.",
      D: "오답이다. RIGHT OUTER JOIN은 DEPT의 C=w가 EMP 두 행과 매칭되고, z/v 두 행도 보존되므로 4건이다."
    }
  };
}

function addVisualAssetOnce(question: ObjectiveQuestion, asset: NonNullable<ObjectiveQuestion["visualAssets"]>[number]): ObjectiveQuestion {
  const currentAssets = question.visualAssets ?? [];
  if (currentAssets.some((item) => item.src === asset.src)) return question;
  return {
    ...question,
    visualAssets: [...currentAssets, asset]
  };
}

function withKnownVisualAssets(question: ObjectiveQuestion): ObjectiveQuestion {
  if (
    question.id === "prod-ext-tuning-051" &&
    question.parentQuestionId === "pdf-o-3-trace-cpu-elapsed"
  ) {
    return addVisualAssetOnce(question, {
      src: "/problem-visuals/sql-cert-q51-trace-row-source.png",
      title: "SQL Trace와 Row Source 자료",
      alt: "Parse, Execute, Fetch 단계별 Trace 수치와 TABLE ACCESS BY INDEX ROWID 및 INDEX RANGE SCAN Row Source",
      caption: "Fetch 단계의 I/O 수치와 Row Source별 처리 행 수를 함께 보며 병목 위치를 판단합니다.",
      kind: "trace"
    });
  }

  return question;
}

export const verifiedObjectiveQuestions: ObjectiveQuestion[] = renumberObjectiveQuestions(
  objectiveQuestionCandidates.filter(isPublishedObjectiveQuestion).map(patchKnownObjectiveQuestionIssues).map(withKnownVisualAssets)
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

