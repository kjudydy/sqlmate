import type { ChoiceId, Difficulty, ObjectiveQuestion, SubjectId } from "@/lib/types";

export type PdfExtensionQuestion = {
  subjectId: SubjectId;
  number: number;
  majorTopic: string;
  middleTopic: string;
  topic: string;
  difficulty: Difficulty;
  questionType: string;
  mode: "original" | "variant" | "similar";
  sourcePage: number;
  sourceQuestionNumber: number;
  parentQuestionId: string;
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

export const pdfExtensionQuestionsBatch12: PdfExtensionQuestion[] = [
  {
    subjectId: "modeling",
    number: 101,
    majorTopic: "데이터 모델링의 이해",
    middleTopic: "엔터티",
    topic: "키 엔터티와 행위 엔터티",
    difficulty: "중급",
    questionType: "엔터티 분류형",
    mode: "variant",
    sourcePage: 1,
    sourceQuestionNumber: 1,
    parentQuestionId: "round58-modeling-key-entity",
    stem: "다음 업무 설명에서 키 엔터티로 보기 가장 어려운 것은?",
    passage: "인사 시스템은 사원, 부서, 프로젝트를 관리한다. 사원은 부서에 소속되고 프로젝트에 투입된다. 프로젝트 투입 이력은 투입일자와 철수일자를 기록하며 프로젝트가 진행되는 동안 계속 발생한다.",
    choices: [
      ["A", "사원", "오답이다. 사원은 인사 업무의 중심 관리 대상이므로 키 엔터티 후보가 된다."],
      ["B", "부서", "오답이다. 부서는 사원의 소속 기준이 되는 독립적인 기준 엔터티다."],
      ["C", "프로젝트", "오답이다. 프로젝트는 투입 이력의 기준이 되는 중심 업무 대상이다."],
      ["D", "프로젝트투입이력", "정답이다. 프로젝트투입이력은 업무 행위의 발생 결과를 기록하는 행위 엔터티에 가깝다."]
    ],
    answer: "D",
    relatedConceptId: "modeling-entity",
    hint: ["독립적으로 존재하는 업무 대상인지, 사건의 발생 결과인지 구분한다.", "투입일자와 철수일자는 특정 행위의 이력을 설명한다.", "계속 발생하는 이력 데이터는 보통 행위 엔터티로 분류한다."],
    explanation: "키 엔터티는 업무에서 독립적으로 식별되고 다른 데이터의 기준이 되는 대상이다. 프로젝트투입이력은 사원과 프로젝트 사이의 업무 행위가 발생한 결과를 기록하므로 행위 엔터티 성격이 강하다."
  },
  {
    subjectId: "modeling",
    number: 102,
    majorTopic: "데이터 모델링의 이해",
    middleTopic: "속성",
    topic: "파생 속성",
    difficulty: "중급",
    questionType: "속성 분류형",
    mode: "original",
    sourcePage: 1,
    sourceQuestionNumber: 2,
    parentQuestionId: "round59-derived-attribute-interest",
    stem: "예금 상품에서 원금, 예치기간, 이자율을 저장하고 이 값으로 계산한 예상 이자를 함께 관리하려고 한다. 속성 분류로 가장 적절한 것은?",
    choices: [
      ["A", "원금과 예치기간은 파생 속성, 예상 이자는 기본 속성이다.", "오답이다. 원금과 예치기간은 업무에서 직접 수집되는 기본 속성이다."],
      ["B", "이자율은 설계 속성, 예상 이자는 파생 속성이다.", "정답이다. 이자율은 상품 조건 관리를 위해 설계된 기준 속성이고 예상 이자는 원금, 기간, 이자율로 계산된다."],
      ["C", "예금분류코드는 파생 속성, 예상 이자는 설계 속성이다.", "오답이다. 예금분류코드는 코드 관리 목적의 설계 속성이고 예상 이자는 계산 결과다."],
      ["D", "계산 가능한 값은 항상 저장하지 않으므로 속성으로 볼 수 없다.", "오답이다. 계산 가능하더라도 성능이나 감사 목적이 있으면 파생 속성으로 관리할 수 있다."]
    ],
    answer: "B",
    relatedConceptId: "modeling-attribute",
    hint: ["업무에서 직접 발생한 값인지 계산한 값인지 먼저 나눈다.", "분류코드와 이자율은 설계상 관리되는 기준 정보다.", "계산 결과를 저장하면 파생 속성으로 분류한다."],
    explanation: "기본 속성은 업무에서 직접 수집되는 값이고, 설계 속성은 코드나 분류처럼 시스템 설계를 위해 추가되는 값이다. 예상 이자는 원금, 예치기간, 이자율에서 도출되므로 파생 속성이다."
  },
  {
    subjectId: "modeling",
    number: 103,
    majorTopic: "데이터 모델링의 이해",
    middleTopic: "관계",
    topic: "식별 관계와 비식별 관계",
    difficulty: "상급",
    questionType: "관계 판단형",
    mode: "similar",
    sourcePage: 2,
    sourceQuestionNumber: 6,
    parentQuestionId: "round59-identifying-relationship",
    stem: "다음 모델 검토 의견 중 식별 관계와 비식별 관계에 대한 설명으로 가장 부적절한 것은?",
    table: {
      headers: ["엔터티", "주요 식별자", "업무 규칙"],
      rows: [
        ["계약", "계약번호", "계약은 고객별로 체결된다."],
        ["계약상품", "계약번호 + 상품번호", "계약상품은 계약 없이는 존재할 수 없다."],
        ["상품", "상품번호", "상품은 여러 계약에 포함될 수 있다."]
      ]
    },
    choices: [
      ["A", "계약과 계약상품은 식별 관계로 볼 수 있다.", "오답이다. 계약번호가 계약상품의 주식별자 일부로 포함되므로 식별 관계가 적절하다."],
      ["B", "상품번호가 계약상품의 주식별자 일부라면 상품과 계약상품도 식별 관계 성격을 가질 수 있다.", "오답이다. 자식의 식별자에 부모 식별자가 포함되는지로 판단한다."],
      ["C", "비식별 관계로 바꾸면 업무 종속성이 강해져 부모 삭제 시 자식 존재 제약이 자동 강화된다.", "정답이다. 비식별 관계는 부모 식별자가 자식 일반 FK로만 존재하므로 식별 의존성이 약해진다."],
      ["D", "식별 관계는 자식 엔터티의 식별자 길이가 길어지고 하위 관계로 전파될 수 있다.", "오답이다. 식별자 상속으로 키가 길어지는 부작용은 실제 모델링 검토 대상이다."]
    ],
    answer: "C",
    relatedConceptId: "modeling-relationship",
    hint: ["부모 식별자가 자식 주식별자에 포함되는지 본다.", "비식별 관계는 식별자가 아니라 일반 외래키로 참조한다.", "업무 종속성 강화와 비식별 전환은 같은 방향이 아니다."],
    explanation: "식별 관계는 부모 엔터티의 주식별자가 자식 엔터티의 주식별자 일부가 되는 관계다. 비식별 관계로 전환하면 식별자 전파는 줄지만 존재 종속성을 자동으로 강화하지는 않는다."
  },
  {
    subjectId: "modeling",
    number: 104,
    majorTopic: "데이터 모델링의 이해",
    middleTopic: "정규화",
    topic: "제3정규형",
    difficulty: "중급",
    questionType: "정규화 판단형",
    mode: "variant",
    sourcePage: 1,
    sourceQuestionNumber: 2,
    parentQuestionId: "round58-third-normal-form",
    stem: "다음 릴레이션에서 제3정규형 위반의 직접 원인으로 가장 적절한 것은?",
    table: {
      headers: ["수강ID", "학생ID", "학생명", "학과코드", "학과명", "과목ID"],
      rows: [
        ["R01", "S10", "김민준", "D01", "통계학과", "SQLP01"],
        ["R02", "S11", "이서연", "D02", "컴퓨터공학", "SQLP02"],
        ["R03", "S10", "김민준", "D01", "통계학과", "SQLP03"]
      ]
    },
    choices: [
      ["A", "수강ID가 학생ID를 결정하지 못한다.", "오답이다. 수강ID는 행 식별자이며 학생ID를 포함한 행 정보를 결정할 수 있다."],
      ["B", "학과코드가 학과명을 결정하는 이행 함수 종속이 존재한다.", "정답이다. 수강ID -> 학생ID -> 학과코드 -> 학과명 구조로 비식별 속성 간 종속이 반복된다."],
      ["C", "학생명은 문자 속성이므로 제1정규형을 위반한다.", "오답이다. 문자 타입이라는 이유만으로 제1정규형 위반이 아니다."],
      ["D", "과목ID가 존재하므로 모든 속성이 복합 식별자에 부분 종속된다.", "오답이다. 제시된 식별자는 수강ID 단일 속성이며 부분 종속 판단이 아니다."]
    ],
    answer: "B",
    relatedConceptId: "modeling-normalization",
    hint: ["제3정규형은 비식별 속성 간 종속을 본다.", "학과코드와 학과명의 관계를 확인한다.", "학과명은 학생의 학과코드에 의해 반복 저장된다."],
    explanation: "제3정규형은 기본키가 아닌 속성이 다른 비식별 속성에 종속되는 이행 함수 종속을 제거한다. 학과명은 학과코드로 결정되므로 별도 학과 엔터티로 분리하는 것이 적절하다."
  },
  {
    subjectId: "modeling",
    number: 105,
    majorTopic: "데이터 모델링의 이해",
    middleTopic: "식별자",
    topic: "주식별자 특성",
    difficulty: "중급",
    questionType: "개념 선택형",
    mode: "original",
    sourcePage: 2,
    sourceQuestionNumber: 8,
    parentQuestionId: "round60-identifier-minimality",
    stem: "주식별자를 구성하는 속성 중 하나를 제거했을 때 인스턴스를 더 이상 유일하게 구분할 수 없다는 특성과 가장 관련 깊은 것은?",
    choices: [
      ["A", "최소성", "정답이다. 최소성은 유일성 보장에 필요한 최소한의 속성으로 식별자를 구성해야 한다는 의미다."],
      ["B", "대표성", "오답이다. 대표성은 업무적으로 엔터티를 대표할 수 있는 식별자를 선택하는 성격이다."],
      ["C", "불변성", "오답이다. 불변성은 식별자 값이 자주 변경되지 않아야 한다는 조건이다."],
      ["D", "존재성", "오답이다. 존재성은 식별자 값이 NULL일 수 없다는 조건과 관련된다."]
    ],
    answer: "A",
    relatedConceptId: "modeling-identifier",
    hint: ["속성 하나를 뺐을 때 유일성이 깨지는지를 묻고 있다.", "필요 이상의 속성을 포함하지 않는 성격을 찾는다.", "최소한의 속성으로 식별할 수 있어야 한다."],
    explanation: "주식별자는 유일성, 최소성, 불변성, 존재성 등을 만족해야 한다. 이 중 최소성은 식별에 불필요한 속성을 포함하지 않는 특성이다."
  },
  {
    subjectId: "modeling",
    number: 106,
    majorTopic: "데이터 모델링의 이해",
    middleTopic: "ERD",
    topic: "피터 첸 표기법",
    difficulty: "기본",
    questionType: "ERD 표기 선택형",
    mode: "original",
    sourcePage: 2,
    sourceQuestionNumber: 7,
    parentQuestionId: "round60-peter-chen-relationship",
    stem: "피터 첸 표기법에서 관계를 나타내는 도형으로 가장 적절한 것은?",
    choices: [
      ["A", "사각형", "오답이다. 사각형은 일반적으로 엔터티를 표시한다."],
      ["B", "타원", "오답이다. 타원은 속성을 표시한다."],
      ["C", "마름모", "정답이다. 피터 첸 표기법에서 관계는 마름모로 표현한다."],
      ["D", "삼각형", "오답이다. 일반적인 피터 첸 표기에서 관계의 기본 도형이 아니다."]
    ],
    answer: "C",
    relatedConceptId: "modeling-relationship",
    hint: ["엔터티, 속성, 관계의 도형을 구분한다.", "사각형은 대상, 타원은 속성이다.", "관계는 두 엔터티 사이의 연결 의미를 나타낸다."],
    explanation: "피터 첸 ERD에서 엔터티는 사각형, 속성은 타원, 관계는 마름모로 표현한다. 표기법 문제는 단순 암기가 아니라 어떤 정보가 대상·속성·관계인지 함께 구분해야 한다."
  },
  {
    subjectId: "modeling",
    number: 107,
    majorTopic: "데이터 모델링의 이해",
    middleTopic: "관계",
    topic: "선택성과 필수성",
    difficulty: "상급",
    questionType: "ERD 해석형",
    mode: "similar",
    sourcePage: 3,
    sourceQuestionNumber: 9,
    parentQuestionId: "erd-participation-student-course",
    stem: "다음 관계 규칙을 ERD로 표현할 때 가장 적절한 설명은?",
    passage: "학생은 아직 수강 신청을 하지 않았을 수 있다. 하나의 수강신청은 반드시 한 명의 학생에 속한다. 한 학생은 여러 수강신청을 할 수 있다.",
    choices: [
      ["A", "학생은 수강신청에 필수 참여하며, 수강신청은 학생에 선택 참여한다.", "오답이다. 학생은 수강신청이 없을 수 있으므로 학생 쪽 참여는 선택이다."],
      ["B", "학생은 수강신청에 선택 참여하고, 수강신청은 학생에 필수 참여한다.", "정답이다. 학생은 0건 이상의 수강신청을 가질 수 있고 수강신청은 반드시 학생을 참조한다."],
      ["C", "학생과 수강신청은 모두 선택 참여한다.", "오답이다. 수강신청은 학생 없이는 존재할 수 없으므로 필수 참여다."],
      ["D", "학생과 수강신청은 1:1 관계로 표현한다.", "오답이다. 한 학생이 여러 수강신청을 할 수 있으므로 1:N 관계다."]
    ],
    answer: "B",
    relatedConceptId: "modeling-relationship",
    hint: ["학생이 수강신청 없이 존재할 수 있는지 확인한다.", "수강신청이 학생 없이 존재할 수 있는지 확인한다.", "0건 가능 여부와 1:N 가능 여부를 함께 본다."],
    explanation: "선택성은 특정 인스턴스가 관계 참여 없이 존재할 수 있는지를 나타낸다. 학생은 수강신청이 없어도 존재 가능하지만, 수강신청은 반드시 학생을 가져야 하므로 학생-수강신청은 학생 선택, 수강신청 필수의 1:N 관계다."
  },
  {
    subjectId: "modeling",
    number: 108,
    majorTopic: "데이터 모델링과 성능",
    middleTopic: "반정규화",
    topic: "중복 속성",
    difficulty: "상급",
    questionType: "성능 모델링 판단형",
    mode: "variant",
    sourcePage: 4,
    sourceQuestionNumber: 4,
    parentQuestionId: "modeling-denormalization-title-duplicate",
    stem: "다음 중 반정규화 적용 전 검토 사항으로 가장 적절한 것은?",
    passage: "게시글 목록 화면에서 작성자명과 최신댓글내용을 함께 보여주기 위해 게시글 테이블에 두 값을 중복 저장하려고 한다. 댓글은 매우 자주 등록·삭제된다.",
    choices: [
      ["A", "조회 SQL이 단순해지므로 정합성 검토 없이 바로 중복 저장한다.", "오답이다. 댓글 변경 시 게시글 중복 컬럼 동기화 책임이 생긴다."],
      ["B", "조회 빈도, 갱신 빈도, 정합성 보정 로직, 장애 시 재생성 가능성을 함께 검토한다.", "정답이다. 반정규화는 성능 이득과 정합성 비용을 함께 따져야 한다."],
      ["C", "반정규화는 제3정규형을 만족한 모델에는 적용할 수 없다.", "오답이다. 정규화 후 성능 요구에 따라 통제된 반정규화를 검토할 수 있다."],
      ["D", "중복 저장된 값은 원본보다 항상 더 정확하므로 원본 테이블을 제거한다.", "오답이다. 중복 컬럼은 원본과 동기화되지 않으면 오히려 오류 원인이 된다."]
    ],
    answer: "B",
    relatedConceptId: "modeling-normalization",
    hint: ["반정규화는 조회 성능만의 문제가 아니다.", "변경이 잦은 데이터의 중복 저장 비용을 본다.", "정합성 보장 절차가 없으면 운영 장애가 된다."],
    explanation: "반정규화는 조인·집계 비용을 줄이기 위해 중복 또는 파생 데이터를 저장하는 설계다. 그러나 원본 변경 시 동기화, 재처리, 검증 절차가 필요하므로 조회 빈도와 갱신 빈도를 함께 고려해야 한다."
  },
  {
    subjectId: "modeling",
    number: 109,
    majorTopic: "데이터 모델링과 성능",
    middleTopic: "이력 모델링",
    topic: "기간 이력",
    difficulty: "최상급",
    questionType: "이력 모델링 판단형",
    mode: "similar",
    sourcePage: 5,
    sourceQuestionNumber: 12,
    parentQuestionId: "modeling-effective-date-history",
    stem: "상품 가격 이력을 기간 이력 방식으로 관리할 때 가장 적절한 설계 원칙은?",
    table: {
      headers: ["상품ID", "시작일자", "종료일자", "판매가격"],
      rows: [
        ["P01", "2026-01-01", "2026-03-31", "10000"],
        ["P01", "2026-04-01", "9999-12-31", "12000"],
        ["P02", "2026-02-01", "9999-12-31", "8000"]
      ]
    },
    choices: [
      ["A", "동일 상품의 기간이 겹치지 않도록 검증하고 현재 행 표현 규칙을 일관되게 둔다.", "정답이다. 기간 이력은 중복 기간 방지와 현재 행 조회 규칙이 핵심이다."],
      ["B", "종료일자는 항상 NULL로 두어야 과거 가격 조회가 가능하다.", "오답이다. 모든 종료일자를 NULL로 두면 과거 시점 판단이 불가능하다."],
      ["C", "가격 변경 시 기존 행을 UPDATE하여 한 행만 유지한다.", "오답이다. 과거 가격 이력이 사라진다."],
      ["D", "시작일자만 저장하면 어떤 시점의 가격도 항상 단일 행으로 찾을 수 있다.", "오답이다. 종료 범위 또는 다음 시작일 계산이 필요하며 겹침 검증도 필요하다."]
    ],
    answer: "A",
    relatedConceptId: "modeling-transaction-model",
    hint: ["시점 조회에서 한 상품이 두 가격을 반환하면 안 된다.", "과거 가격을 보존하려면 기존 행 갱신만으로는 부족하다.", "현재 행 표현과 기간 겹침 검증이 핵심이다."],
    explanation: "기간 이력은 시작일과 종료일로 유효 구간을 표현한다. 동일 대상의 기간이 겹치면 특정 시점 조회 결과가 중복되므로 제약 또는 배치 검증으로 겹침을 막아야 한다."
  },
  {
    subjectId: "modeling",
    number: 110,
    majorTopic: "데이터 모델링과 성능",
    middleTopic: "슈퍼타입/서브타입",
    topic: "배타 관계",
    difficulty: "상급",
    questionType: "모델 구조 판단형",
    mode: "similar",
    sourcePage: 2,
    sourceQuestionNumber: 8,
    parentQuestionId: "exclusive-subtype-modeling",
    stem: "개인회원과 법인회원이 공통 속성과 고유 속성을 함께 가진다. 한 회원은 개인 또는 법인 중 하나에만 속한다. 가장 적절한 설명은?",
    choices: [
      ["A", "공통 속성은 회원 슈퍼타입에 두고 개인/법인 고유 속성은 서브타입으로 분리할 수 있다.", "정답이다. 공통 속성과 고유 속성을 분리하고 배타성을 명확히 표현한다."],
      ["B", "배타 관계이므로 회원 테이블에는 어떤 공통 속성도 둘 수 없다.", "오답이다. 공통 속성은 슈퍼타입에 둘 수 있다."],
      ["C", "개인회원과 법인회원은 반드시 하나의 테이블에 모든 컬럼을 NULL 허용으로 합쳐야 한다.", "오답이다. 통합은 선택지 중 하나일 뿐이며 NULL과 제약 비용을 검토해야 한다."],
      ["D", "서브타입이 있으면 업무 규칙상 한 회원이 두 서브타입에 동시에 속해야 한다.", "오답이다. 지문은 배타 관계이므로 동시에 속할 수 없다."]
    ],
    answer: "A",
    relatedConceptId: "modeling-entity",
    hint: ["공통 속성과 고유 속성을 분리한다.", "개인/법인 중 하나만 가능하다는 배타성을 본다.", "물리 구현 방식은 통합/분리 모두 검토할 수 있다."],
    explanation: "슈퍼타입/서브타입 모델은 공통 속성을 슈퍼타입에, 고유 속성을 서브타입에 둔다. 배타 서브타입은 하나의 슈퍼타입 인스턴스가 여러 서브타입에 동시에 속하지 않도록 제약을 명확히 해야 한다."
  },
  {
    subjectId: "modeling",
    number: 111,
    majorTopic: "데이터 모델링의 이해",
    middleTopic: "속성",
    topic: "도메인",
    difficulty: "중급",
    questionType: "개념 적용형",
    mode: "variant",
    sourcePage: 1,
    sourceQuestionNumber: 3,
    parentQuestionId: "round59-domain-definition",
    stem: "도메인 설계에 대한 설명으로 가장 적절한 것은?",
    passage: "주문상태는 '접수', '결제완료', '배송중', '취소' 중 하나만 허용된다. 금액은 0 이상 10억 이하 숫자로 관리한다.",
    choices: [
      ["A", "도메인은 속성이 가질 수 있는 값의 범위와 형식을 정의한다.", "정답이다. 허용값, 데이터 타입, 길이, 범위 제약 등이 도메인에 해당한다."],
      ["B", "도메인은 화면에 보이는 컬럼 순서만 결정한다.", "오답이다. 화면 순서는 UI 설계에 가깝고 도메인은 값의 범위와 형식이다."],
      ["C", "도메인을 정의하면 업무 규칙 변경이 발생하지 않는다.", "오답이다. 업무 규칙은 바뀔 수 있으며 도메인도 함께 관리되어야 한다."],
      ["D", "도메인은 물리 모델에서는 전혀 표현할 수 없다.", "오답이다. CHECK, FK, 데이터 타입, 길이 등으로 물리 구현할 수 있다."]
    ],
    answer: "A",
    relatedConceptId: "modeling-attribute",
    hint: ["속성 값의 가능 범위를 생각한다.", "상태값 목록과 금액 범위는 값 검증 규칙이다.", "물리 모델에서는 타입과 제약조건으로 구현된다."],
    explanation: "도메인은 속성이 가질 수 있는 값의 범위를 정의한다. 코드값, 숫자 범위, 길이, 형식은 데이터 품질과 무결성의 기초가 되며 물리 모델에서 제약조건으로 구현할 수 있다."
  },
  {
    subjectId: "modeling",
    number: 112,
    majorTopic: "데이터 모델링과 성능",
    middleTopic: "분산 데이터베이스",
    topic: "분산 투명성",
    difficulty: "중급",
    questionType: "개념 선택형",
    mode: "similar",
    sourcePage: 6,
    sourceQuestionNumber: 18,
    parentQuestionId: "distributed-transparency",
    stem: "분산 데이터베이스에서 사용자가 데이터가 어느 노드에 저장되어 있는지 의식하지 않고 접근할 수 있게 하는 투명성은?",
    choices: [
      ["A", "위치 투명성", "정답이다. 위치 투명성은 데이터의 물리적 저장 위치를 사용자에게 숨긴다."],
      ["B", "중복 투명성", "오답이다. 중복 투명성은 복제본 존재 여부를 사용자가 의식하지 않게 하는 성격이다."],
      ["C", "분할 투명성", "오답이다. 분할 투명성은 수평/수직 분할 구조를 숨기는 성격이다."],
      ["D", "장애 투명성", "오답이다. 장애 투명성은 일부 노드 장애에도 서비스 연속성을 제공하는 성격이다."]
    ],
    answer: "A",
    relatedConceptId: "modeling-data-model",
    hint: ["질문은 저장 위치를 모르게 하는 성질이다.", "복제 여부와 분할 여부가 아니라 위치 자체다.", "사용자가 노드명을 몰라도 되는 투명성이다."],
    explanation: "분산 데이터베이스 투명성에는 위치, 중복, 분할, 장애 투명성 등이 있다. 데이터가 어느 서버나 노드에 있는지 사용자가 몰라도 접근할 수 있는 것은 위치 투명성이다."
  },
  {
    subjectId: "modeling",
    number: 113,
    majorTopic: "데이터 모델링의 이해",
    middleTopic: "함수 종속",
    topic: "부분 함수 종속",
    difficulty: "상급",
    questionType: "함수 종속 분석형",
    mode: "similar",
    sourcePage: 4,
    sourceQuestionNumber: 7,
    parentQuestionId: "partial-dependency-normalization",
    stem: "릴레이션 R(주문번호, 상품번호, 주문일자, 상품명, 수량)의 주식별자가 (주문번호, 상품번호)일 때 제2정규형 관점에서 분리 대상이 되는 종속은?",
    choices: [
      ["A", "주문번호 -> 주문일자", "정답이다. 주문일자는 복합 식별자 전체가 아니라 주문번호만으로 결정되므로 부분 함수 종속이다."],
      ["B", "(주문번호, 상품번호) -> 수량", "오답이다. 주문별 상품 수량은 복합 식별자 전체에 종속되는 것이 자연스럽다."],
      ["C", "상품명 -> 상품번호", "오답이다. 일반적으로 상품번호가 상품명을 결정하며 방향도 다르다."],
      ["D", "수량 -> 주문번호", "오답이다. 수량으로 주문번호를 결정할 수 없다."]
    ],
    answer: "A",
    relatedConceptId: "modeling-normalization",
    hint: ["제2정규형은 복합 식별자의 일부에 대한 종속을 제거한다.", "주문일자는 상품번호가 없어도 주문번호로 결정된다.", "수량은 주문과 상품의 조합으로 결정된다."],
    explanation: "복합 식별자에서 일부 속성만으로 일반 속성이 결정되면 부분 함수 종속이다. 주문일자는 주문번호에 종속되므로 주문 헤더와 주문 상세를 분리하는 것이 적절하다."
  },
  {
    subjectId: "modeling",
    number: 114,
    majorTopic: "데이터 모델링과 성능",
    middleTopic: "PK 변경 영향",
    topic: "식별자 변경 영향 분석",
    difficulty: "상급",
    questionType: "영향 분석형",
    mode: "similar",
    sourcePage: 6,
    sourceQuestionNumber: 20,
    parentQuestionId: "pk-change-impact-analysis",
    stem: "운영 중인 주문 테이블의 주식별자를 주문번호 단일 컬럼에서 (주문일자, 주문번호) 복합 식별자로 변경하려고 한다. 반드시 검토해야 할 영향으로 가장 거리가 먼 것은?",
    choices: [
      ["A", "주문을 참조하는 모든 하위 테이블의 외래키와 인덱스 변경", "오답이다. 복합 식별자로 변경되면 참조 구조와 인덱스가 영향을 받는다."],
      ["B", "주문번호를 사용하는 배치, API, 화면 SQL 수정", "오답이다. 식별자 변경은 애플리케이션 전반에 영향을 준다."],
      ["C", "기존 주문번호의 업무적 유일성 유지 여부", "오답이다. 대체 식별자 또는 UNIQUE 제약으로 업무 유일성을 보존할지 검토해야 한다."],
      ["D", "사용자 비밀번호 암호화 알고리즘 변경", "정답이다. 주문 PK 변경과 직접적인 관련성이 가장 낮다."]
    ],
    answer: "D",
    relatedConceptId: "modeling-identifier",
    hint: ["식별자 변경은 참조, 인덱스, SQL, 데이터 이관에 영향을 준다.", "주문번호 유일성이 사라지는지 검토한다.", "보안 암호화 정책은 주문 PK 변경과 직접 관련이 적다."],
    explanation: "주식별자 변경은 참조 무결성, 인덱스, 조인 경로, 프로그램 SQL, 데이터 이관 및 대체키 설계에 큰 영향을 준다. 사용자 비밀번호 암호화 알고리즘은 별도 보안 영역으로 직접 영향이 아니다."
  },
  {
    subjectId: "modeling",
    number: 115,
    majorTopic: "데이터 모델링의 이해",
    middleTopic: "엔터티",
    topic: "약한 엔터티",
    difficulty: "중급",
    questionType: "엔터티 판단형",
    mode: "variant",
    sourcePage: 3,
    sourceQuestionNumber: 6,
    parentQuestionId: "weak-entity-identification",
    stem: "다음 중 약한 엔터티로 보기 가장 적절한 것은?",
    choices: [
      ["A", "부서 없이도 독립적으로 존재하는 회사", "오답이다. 회사는 독립적 존재가 가능하다."],
      ["B", "주문이 삭제되면 함께 삭제되어야 하는 주문상세", "정답이다. 주문상세는 주문에 존재 종속되며 식별도 주문에 의존할 수 있다."],
      ["C", "상품 분류 코드와 무관하게 존재 가능한 상품", "오답이다. 상품은 기준 엔터티로 독립 식별 가능하다."],
      ["D", "모든 시스템에서 공통으로 사용하는 국가코드", "오답이다. 국가코드는 기준 정보에 가깝다."]
    ],
    answer: "B",
    relatedConceptId: "modeling-entity",
    hint: ["부모 없이는 존재할 수 없는 대상을 찾는다.", "삭제 종속과 식별 종속을 함께 본다.", "주문상세는 주문의 발생 결과이자 종속 데이터다."],
    explanation: "약한 엔터티는 독립 식별이나 존재가 어렵고 부모 엔터티에 의존한다. 주문상세는 주문 없이 존재 의미가 없으므로 약한 엔터티 또는 식별 관계의 자식 엔터티로 볼 수 있다."
  },
  {
    subjectId: "modeling",
    number: 116,
    majorTopic: "데이터 모델링과 성능",
    middleTopic: "집계 테이블",
    topic: "집계 기준 설계",
    difficulty: "상급",
    questionType: "성능 모델링 판단형",
    mode: "similar",
    sourcePage: 5,
    sourceQuestionNumber: 15,
    parentQuestionId: "summary-table-design",
    stem: "일별 매출 집계 테이블을 설계할 때 가장 적절한 검토 기준은?",
    passage: "주문상세는 하루 2천만 건 발생하고, 대부분의 화면은 일자·상품군·지역별 매출 합계를 조회한다. 반품과 주문취소는 다음 날에도 발생한다.",
    choices: [
      ["A", "집계 기준, 원천 변경 반영 방식, 재집계 범위, 정합성 검증 절차를 함께 설계한다.", "정답이다. 집계 테이블은 성능뿐 아니라 원천 변경 반영과 정합성 관리가 핵심이다."],
      ["B", "집계 테이블은 원천 테이블보다 항상 정확하므로 원천 데이터 보관이 불필요하다.", "오답이다. 집계는 원천에서 재생성·검증 가능해야 한다."],
      ["C", "반품이 존재하므로 집계 테이블은 절대 만들 수 없다.", "오답이다. 변경 반영 절차를 두고 집계 테이블을 운영할 수 있다."],
      ["D", "조회 화면이 빠르면 집계 기준은 업무 용어와 달라도 무방하다.", "오답이다. 집계 기준이 업무 정의와 다르면 해석 오류가 발생한다."]
    ],
    answer: "A",
    relatedConceptId: "modeling-normalization",
    hint: ["집계 테이블은 조회 성능만 보는 설계가 아니다.", "취소와 반품은 과거 집계 변경을 만든다.", "재집계와 검증 절차가 없으면 수치가 틀어진다."],
    explanation: "집계 테이블은 대량 원천 데이터를 미리 요약해 조회 성능을 높인다. 하지만 집계 기준, 변경 반영, 재처리 범위, 원천과의 검증 절차가 없으면 운영 데이터 신뢰도가 떨어진다."
  },
  {
    subjectId: "modeling",
    number: 117,
    majorTopic: "데이터 모델링의 이해",
    middleTopic: "관계",
    topic: "상호배타 관계",
    difficulty: "상급",
    questionType: "관계 제약 판단형",
    mode: "variant",
    sourcePage: 2,
    sourceQuestionNumber: 8,
    parentQuestionId: "exclusive-relationship-vehicle-owner",
    stem: "차량 소유자가 개인 또는 법인 중 하나일 수 있고 동시에 둘 다일 수는 없다. 이 제약을 모델링할 때 가장 적절한 설명은?",
    choices: [
      ["A", "개인소유와 법인소유 관계를 상호배타 관계로 표현하고 물리 구현 시 체크 로직을 둔다.", "정답이다. 배타성은 ERD 표기뿐 아니라 물리 제약 또는 프로그램 검증이 필요하다."],
      ["B", "두 관계를 모두 필수 관계로 두면 자동으로 상호배타가 보장된다.", "오답이다. 모두 필수면 오히려 두 관계를 동시에 요구할 수 있다."],
      ["C", "상호배타 관계는 선택 관계와 동일하므로 별도 제약이 필요 없다.", "오답이다. 선택성과 배타성은 다른 개념이다."],
      ["D", "개인과 법인을 하나의 코드 컬럼으로 표현하면 데이터 무결성 검증이 불가능하다.", "오답이다. 코드 컬럼 방식도 체크 제약과 참조 구조를 설계하면 가능하다."]
    ],
    answer: "A",
    relatedConceptId: "modeling-relationship",
    hint: ["개인과 법인 중 하나만 가능하다는 제약을 찾는다.", "선택 관계와 배타 관계를 구분한다.", "ERD 표기만으로 물리 무결성이 자동 보장되지는 않는다."],
    explanation: "상호배타 관계는 하나의 인스턴스가 여러 관계 중 하나에만 참여해야 하는 제약이다. 모델 표기와 더불어 데이터베이스 제약, 트리거, 애플리케이션 검증 등 구현 방식을 함께 결정해야 한다."
  },
  {
    subjectId: "modeling",
    number: 118,
    majorTopic: "데이터 모델링의 이해",
    middleTopic: "트랜잭션",
    topic: "트랜잭션 특성",
    difficulty: "기본",
    questionType: "개념 선택형",
    mode: "original",
    sourcePage: 2,
    sourceQuestionNumber: 8,
    parentQuestionId: "round59-transaction-acid",
    stem: "트랜잭션의 ACID 특성에 포함되지 않는 것은?",
    choices: [
      ["A", "원자성", "오답이다. 원자성은 트랜잭션의 전부 성공 또는 전부 실패를 의미한다."],
      ["B", "일관성", "오답이다. 일관성은 트랜잭션 전후 데이터 무결성이 유지되어야 함을 뜻한다."],
      ["C", "독립성", "오답이다. 독립성 또는 격리성은 동시 실행 트랜잭션 간 간섭 제어와 관련된다."],
      ["D", "최적성", "정답이다. 최적성은 ACID 특성이 아니다."]
    ],
    answer: "D",
    relatedConceptId: "tuning-transaction",
    hint: ["ACID 네 글자를 떠올린다.", "Atomicity, Consistency, Isolation, Durability에 대응하지 않는 것을 찾는다.", "성능 최적화 용어는 트랜잭션 특성이 아니다."],
    explanation: "ACID는 원자성, 일관성, 격리성, 지속성을 의미한다. 최적성은 트랜잭션의 정합성 보장 특성이 아니라 성능 평가 관점의 표현이다."
  },
  {
    subjectId: "modeling",
    number: 119,
    majorTopic: "데이터 모델링과 성능",
    middleTopic: "Null 모델링",
    topic: "선택 관계와 NULL",
    difficulty: "상급",
    questionType: "모델 변경 판단형",
    mode: "similar",
    sourcePage: 6,
    sourceQuestionNumber: 21,
    parentQuestionId: "optional-relationship-null",
    stem: "선택 관계를 필수 관계로 변경하려고 할 때 가장 먼저 확인해야 할 사항은?",
    passage: "배송 테이블의 주문번호는 현재 NULL 허용이다. 과거에는 수동 배송도 있었지만 앞으로는 모든 배송이 주문에서 출발하도록 정책이 바뀐다.",
    choices: [
      ["A", "기존 주문번호 NULL 데이터의 정리 또는 예외 처리 방안", "정답이다. NOT NULL 및 FK 강화 전에 기존 데이터 정리가 필요하다."],
      ["B", "배송 테이블명을 더 짧게 바꾸는 방안", "오답이다. 명명 변경은 필수 관계 전환의 핵심 검토가 아니다."],
      ["C", "모든 인덱스를 삭제하는 방안", "오답이다. 관계 필수화와 인덱스 삭제는 직접 관련이 없다."],
      ["D", "주문 테이블의 모든 컬럼을 배송 테이블로 복사하는 방안", "오답이다. 불필요한 중복이며 관계 제약 강화와 다르다."]
    ],
    answer: "A",
    relatedConceptId: "modeling-null",
    hint: ["NULL 허용 관계를 NOT NULL 관계로 바꾼다.", "기존 데이터에 NULL이 남아 있으면 제약을 만들 수 없다.", "업무 예외를 어떻게 처리할지 먼저 정해야 한다."],
    explanation: "선택 관계를 필수 관계로 바꾸면 외래키 컬럼의 NULL 허용 여부와 기존 데이터가 직접 영향을 받는다. 운영 데이터 정리, 예외 이관, 입력 경로 변경을 검토한 후 제약을 강화해야 한다."
  },
  {
    subjectId: "modeling",
    number: 120,
    majorTopic: "데이터 모델링의 이해",
    middleTopic: "좋은 데이터 모델",
    topic: "업무 규칙 표현",
    difficulty: "중급",
    questionType: "모델 품질 판단형",
    mode: "similar",
    sourcePage: 7,
    sourceQuestionNumber: 24,
    parentQuestionId: "good-data-model",
    stem: "좋은 데이터 모델의 조건으로 가장 적절하지 않은 것은?",
    choices: [
      ["A", "업무 규칙과 용어가 모델에 명확히 표현되어야 한다.", "오답이다. 업무 규칙 표현은 좋은 모델의 핵심 조건이다."],
      ["B", "중복을 무조건 0으로 만들기 위해 조회 성능 요구는 고려하지 않는다.", "정답이다. 정규화와 성능 요구는 균형 있게 검토해야 한다."],
      ["C", "변경 영향 범위를 예측할 수 있도록 관계와 식별자를 명확히 둔다.", "오답이다. 변경 영향 예측 가능성은 유지보수성에 중요하다."],
      ["D", "데이터 무결성을 보장할 수 있는 제약과 검증 기준을 포함한다.", "오답이다. 무결성 기준은 모델 품질의 핵심이다."]
    ],
    answer: "B",
    relatedConceptId: "modeling-data-model",
    hint: ["좋은 모델은 정규화만이 목적이 아니다.", "업무 규칙, 무결성, 성능, 변경 가능성을 함께 본다.", "조회 성능 요구를 무시하는 극단적인 설명을 찾는다."],
    explanation: "좋은 데이터 모델은 업무 의미를 정확히 표현하고 무결성과 변경 대응성을 갖추며 성능 요구도 고려한다. 중복 최소화는 중요하지만 성능과 운영 요구를 무시하는 절대 기준은 아니다."
  },
  {
    subjectId: "sql-basic",
    number: 101,
    majorTopic: "SQL 기본 및 활용",
    middleTopic: "집합 연산",
    topic: "UNION과 UNION ALL",
    difficulty: "상급",
    questionType: "SQL 실행 결과형",
    mode: "original",
    sourcePage: 7,
    sourceQuestionNumber: 84,
    parentQuestionId: "sql-cert-union-union-all-row-count",
    stem: "아래 두 테이블에 대해 가, 나 SQL을 수행했을 때 반환 행 수로 가장 적절한 것은?",
    table: {
      headers: ["테이블", "A", "B", "C"],
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
      ["A", "가: 5건, 나: 3건", "정답이다. UNION ALL은 3+2건을 모두 반환하고 UNION은 중복 행을 제거해 A1/B1/C1, A2/B1/C2, A3/B2/C3의 3건이 남는다."],
      ["B", "가: 3건, 나: 5건", "오답이다. 중복 제거는 UNION에서 수행되므로 행 수가 더 많아질 수 없다."],
      ["C", "가: 5건, 나: 5건", "오답이다. UNION은 R1과 R2의 중복 행을 제거한다."],
      ["D", "가: 3건, 나: 3건", "오답이다. UNION ALL은 중복을 제거하지 않는다."]
    ],
    answer: "A",
    relatedConceptId: "sql-set-operators",
    hint: ["UNION ALL은 중복 제거가 없다.", "UNION은 세 컬럼 전체가 같은 행을 중복으로 본다.", "R2의 두 행은 R1에 이미 존재한다."],
    explanation: "UNION ALL은 두 결과 집합을 그대로 이어 붙이므로 5건이다. UNION은 전체 선택 컬럼이 동일한 중복 행을 제거하므로 3건만 반환한다."
  },
  {
    subjectId: "sql-basic",
    number: 102,
    majorTopic: "SQL 기본 및 활용",
    middleTopic: "함수",
    topic: "문자 길이와 NULL 처리",
    difficulty: "상급",
    questionType: "SQL 실행 결과형",
    mode: "variant",
    sourcePage: 4,
    sourceQuestionNumber: 41,
    parentQuestionId: "sql-cert-length-replace-sum",
    stem: "아래 SQL의 실행 결과로 가장 적절한 것은? 단, 빈 칸은 저장공간이 아니라 실제 공백 문자이며 CHR(10)은 한 글자로 계산한다.",
    table: {
      headers: ["ROWNUM", "C1"],
      rows: [
        ["1", "A"],
        ["1", "A(개행)A"],
        ["2", "B"],
        ["2", "B(공백)B"],
        ["2", "NULL"]
      ]
    },
    code: `SELECT SUM(LENGTH(C1) - LENGTH(REPLACE(C1, 'B')))
FROM TAB1;`,
    choices: [
      ["A", "2", "오답이다. B가 포함된 두 행의 B 개수를 모두 세면 3이다."],
      ["B", "3", "정답이다. 'B'는 한 글자, 'B B'는 두 글자 B를 포함한다. NULL 행의 계산 결과는 NULL이라 SUM에서 제외된다."],
      ["C", "4", "오답이다. 공백은 세지만 B 개수에는 포함되지 않는다."],
      ["D", "5", "오답이다. 전체 행 수나 전체 문자 수가 아니라 특정 문자 제거 전후 길이 차이를 합산한다."]
    ],
    answer: "B",
    relatedConceptId: "sql-functions",
    hint: ["LENGTH(x) - LENGTH(REPLACE(x,'B'))는 B 개수를 센다.", "NULL 행은 SUM 집계에서 제외된다.", "'B B'에는 B가 두 번 있다."],
    explanation: "문자 제거 전후 길이 차이는 제거된 문자 수를 의미한다. B가 없는 행은 0, B 행은 1, B 공백 B 행은 2, NULL 행은 NULL이 되어 SUM 결과는 3이다."
  },
  {
    subjectId: "sql-basic",
    number: 103,
    majorTopic: "SQL 기본 및 활용",
    middleTopic: "JOIN",
    topic: "Outer Join 결과",
    difficulty: "상급",
    questionType: "JOIN 결과 추론형",
    mode: "original",
    sourcePage: 7,
    sourceQuestionNumber: 74,
    parentQuestionId: "sql-cert-emp-dept-outer-join-count",
    stem: "EMP와 DEPT를 LEFT, FULL, RIGHT 외부조인한 결과 건수의 조합으로 가장 적절한 것은?",
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
    passage: "EMP.C는 DEPT.C와 연결된다. LEFT, FULL, RIGHT OUTER JOIN의 결과 건수를 순서대로 고른다.",
    choices: [
      ["A", "3건, 4건, 3건", "오답이다. FULL OUTER JOIN은 EMP의 y 미매칭 1건과 DEPT의 z, v 미매칭 2건을 모두 보존하므로 4건이 아니라 5건이다."],
      ["B", "4건, 5건, 3건", "오답이다. LEFT JOIN은 EMP 기준 3건이지 DEPT 미매칭까지 포함하지 않는다."],
      ["C", "3건, 4건, 5건", "오답이다. FULL OUTER JOIN과 RIGHT OUTER JOIN의 결과 건수를 서로 바꿨다."],
      ["D", "3건, 5건, 4건", "정답이다. LEFT는 EMP 기준 3건, FULL은 양쪽 미매칭을 모두 포함해 5건, RIGHT는 DEPT 기준 4건이다."]
    ],
    answer: "D",
    relatedConceptId: "sql-join",
    hint: ["w 값은 EMP 2건과 DEPT 1건이 만나 2건이 된다.", "FULL은 양쪽 미매칭을 모두 보존한다.", "RIGHT는 DEPT의 z와 v도 보존한다."],
    explanation: "EMP 기준 LEFT JOIN은 w 매칭 2건과 EMP의 y 미매칭 1건으로 3건이다. FULL JOIN은 여기에 DEPT의 z, v 미매칭 2건을 더해 5건이다. RIGHT JOIN은 w 매칭 2건과 DEPT z, v 미매칭 2건으로 4건이다."
  },
  {
    subjectId: "sql-basic",
    number: 104,
    majorTopic: "SQL 기본 및 활용",
    middleTopic: "함수",
    topic: "Oracle DATE 연산",
    difficulty: "중급",
    questionType: "SQL 실행 결과형",
    mode: "original",
    sourcePage: 4,
    sourceQuestionNumber: 42,
    parentQuestionId: "sql-cert-date-fraction-day",
    stem: "Oracle 환경에서 다음 SQL의 결과로 가장 적절한 것은?",
    code: `SELECT TO_CHAR(
         TO_DATE('2015.01.10 10', 'YYYY.MM.DD HH24')
         + 1/24/(60/10),
         'YYYY.MM.DD HH24:MI:SS'
       )
FROM DUAL;`,
    choices: [
      ["A", "2015.01.10 10:05:00", "오답이다. 1/24는 1시간이고 다시 6으로 나누면 10분이다."],
      ["B", "2015.01.10 10:10:00", "정답이다. Oracle DATE의 1은 하루이므로 1/24/(60/10)은 10분이다."],
      ["C", "2015.01.10 10:30:00", "오답이다. 30분을 더하려면 1/48 또는 30/1440이 필요하다."],
      ["D", "2015.01.10 11:00:00", "오답이다. 1/24만 더하면 1시간이지만 추가로 6으로 나눈다."]
    ],
    answer: "B",
    relatedConceptId: "sql-functions",
    hint: ["Oracle DATE에서 숫자 1은 하루다.", "1/24는 1시간이다.", "60/10은 6이므로 1시간을 6으로 나눈다."],
    explanation: "Oracle DATE에 더하는 숫자는 일 단위다. 1/24는 1시간, 이를 6으로 나누면 10분이므로 결과는 2015.01.10 10:10:00이다."
  },
  {
    subjectId: "sql-basic",
    number: 105,
    majorTopic: "SQL 기본 및 활용",
    middleTopic: "권한",
    topic: "GRANT와 REVOKE",
    difficulty: "상급",
    questionType: "권한 시나리오형",
    mode: "variant",
    sourcePage: 3,
    sourceQuestionNumber: 4,
    parentQuestionId: "round58-grant-revoke-cascade",
    stem: "다음 권한 부여 후 R 테이블에 SELECT 권한을 가진 사용자로 가장 적절한 것은? 단, DBMS는 Oracle 권한 회수 규칙을 따른다.",
    code: `DBA: GRANT SELECT, INSERT ON R TO U1;
DBA: GRANT SELECT ON R TO U2 WITH GRANT OPTION;
U2 : GRANT SELECT ON R TO U3;
DBA: REVOKE SELECT ON R FROM U2;`,
    choices: [
      ["A", "DBA, U1", "정답이다. U2의 SELECT 권한이 회수되면 U2가 부여한 U3의 SELECT 권한도 연쇄 회수된다. U1의 SELECT는 별도 부여이므로 유지된다."],
      ["B", "DBA, U1, U3", "오답이다. U3의 권한은 U2를 통해 부여되었으므로 U2 회수 시 함께 회수된다."],
      ["C", "DBA, U2, U3", "오답이다. U2는 SELECT 권한을 회수당했다."],
      ["D", "DBA, U1, U2, U3", "오답이다. U2와 그 하위 권한이 모두 유지된다고 보면 안 된다."]
    ],
    answer: "A",
    relatedConceptId: "sql-dcl",
    hint: ["WITH GRANT OPTION으로 부여한 권한의 전파 관계를 본다.", "권한을 부여한 사용자의 권한이 회수되면 하위 부여 권한도 영향을 받는다.", "U1은 DBA에게 직접 별도 권한을 받았다."],
    explanation: "객체 권한을 WITH GRANT OPTION으로 받은 사용자가 다른 사용자에게 권한을 부여한 경우, 원 권한이 회수되면 그 사용자를 통해 전파된 권한도 회수된다. U1은 DBA에게 직접 SELECT를 받았으므로 유지된다."
  },
  {
    subjectId: "sql-basic",
    number: 106,
    majorTopic: "SQL 기본 및 활용",
    middleTopic: "Subquery",
    topic: "NOT IN과 NULL",
    difficulty: "상급",
    questionType: "SQL 실행 결과형",
    mode: "variant",
    sourcePage: 3,
    sourceQuestionNumber: 2,
    parentQuestionId: "round60-not-in-null",
    stem: "다음 SQL 결과로 가장 적절한 것은?",
    table: {
      headers: ["EMP.EMPNO", "EMP.DEPTNO", "BLOCKED.DEPTNO"],
      rows: [
        ["1", "10", "20"],
        ["2", "20", "NULL"],
        ["3", "30", ""]
      ]
    },
    code: `SELECT empno
FROM emp
WHERE deptno NOT IN (SELECT deptno FROM blocked);`,
    choices: [
      ["A", "1, 3", "오답이다. 서브쿼리 결과에 NULL이 있어 NOT IN 비교가 UNKNOWN이 된다."],
      ["B", "1", "오답이다. 10은 20과 다르지만 NULL과의 비교 때문에 전체 NOT IN이 TRUE가 되지 않는다."],
      ["C", "공집합", "정답이다. NOT IN 목록에 NULL이 포함되면 어떤 deptno도 확정적으로 목록에 없다고 판단할 수 없다."],
      ["D", "3", "오답이다. 30 역시 NULL 비교 때문에 TRUE가 아니다."]
    ],
    answer: "C",
    relatedConceptId: "sql-subquery",
    hint: ["NOT IN은 모든 값과 같지 않아야 TRUE가 된다.", "목록에 NULL이 있으면 비교 결과에 UNKNOWN이 포함된다.", "WHERE는 TRUE만 통과시킨다."],
    explanation: "NOT IN은 내부적으로 모든 비교가 TRUE여야 한다. 비교 대상 목록에 NULL이 있으면 'deptno <> NULL'이 UNKNOWN이 되어 전체 조건이 TRUE가 되지 않으므로 결과는 공집합이다."
  },
  {
    subjectId: "sql-basic",
    number: 107,
    majorTopic: "SQL 기본 및 활용",
    middleTopic: "Window Function",
    topic: "FIRST_VALUE",
    difficulty: "상급",
    questionType: "Window 결과 추론형",
    mode: "original",
    sourcePage: 3,
    sourceQuestionNumber: 4,
    parentQuestionId: "round60-first-value-running-min",
    stem: "다음 SQL에서 같은 부서의 급여를 오름차순 정렬했을 때 FIRST_VALUE 결과로 가장 적절한 것은?",
    table: {
      headers: ["사원", "부서", "급여"],
      rows: [
        ["A", "10", "3000"],
        ["B", "10", "1000"],
        ["C", "10", "2000"]
      ]
    },
    code: `SELECT 사원,
       FIRST_VALUE(급여) OVER (PARTITION BY 부서 ORDER BY 급여) AS fv
FROM 사원급여
WHERE 부서 = 10;`,
    choices: [
      ["A", "1000, 1000, 1000", "정답이다. 부서 10 파티션에서 급여 오름차순 첫 값은 모든 행에 대해 1000이다."],
      ["B", "1000, 2000, 3000", "오답이다. 이는 정렬 후 현재 행의 급여이지 FIRST_VALUE 결과가 아니다."],
      ["C", "3000, 2000, 1000", "오답이다. 내림차순도 아니며 FIRST_VALUE는 각 행마다 첫 값을 반환한다."],
      ["D", "3000, 3000, 3000", "오답이다. 오름차순 첫 값은 최솟값이다."]
    ],
    answer: "A",
    relatedConceptId: "sql-window-functions",
    hint: ["PARTITION BY 부서로 같은 부서 안에서 계산한다.", "ORDER BY 급여 오름차순의 첫 값을 찾는다.", "FIRST_VALUE는 각 행에 첫 행 값을 보여준다."],
    explanation: "FIRST_VALUE는 윈도우 정렬 기준에서 첫 번째 행의 값을 반환한다. 부서 10에서 급여 오름차순 첫 값은 1000이므로 모든 행의 결과가 1000이다."
  },
  {
    subjectId: "sql-basic",
    number: 108,
    majorTopic: "SQL 기본 및 활용",
    middleTopic: "Window Function",
    topic: "NTILE",
    difficulty: "중급",
    questionType: "Window 결과 추론형",
    mode: "original",
    sourcePage: 3,
    sourceQuestionNumber: 6,
    parentQuestionId: "round60-ntile-three",
    stem: "8개의 행에 대해 NTILE(3)을 적용하고 정렬 순서가 1부터 8까지일 때 그룹 번호 배정으로 가장 적절한 것은?",
    choices: [
      ["A", "1,1,1,2,2,2,3,3", "정답이다. 8개를 3그룹으로 나누면 앞 그룹부터 3,3,2건이 배정된다."],
      ["B", "1,1,2,2,3,3,3,3", "오답이다. NTILE은 앞쪽 버킷에 나머지를 먼저 배분한다."],
      ["C", "1,2,3,1,2,3,1,2", "오답이다. 라운드로빈 방식이 아니라 정렬 순서대로 연속 배정한다."],
      ["D", "1,1,1,1,2,2,3,3", "오답이다. 그룹 크기 차이가 1을 넘지 않도록 나누는 것이 일반적이다."]
    ],
    answer: "A",
    relatedConceptId: "sql-window-functions",
    hint: ["전체 행 수 8을 3개 버킷으로 나눈다.", "나머지 행은 앞 버킷부터 하나씩 더 배정된다.", "정렬 순서대로 연속 번호가 붙는다."],
    explanation: "NTILE(3)은 정렬된 8개 행을 가능한 균등하게 3개 버킷으로 나눈다. 나머지 2개 행은 앞쪽 그룹부터 배정되어 3, 3, 2건이 된다."
  },
  {
    subjectId: "sql-basic",
    number: 109,
    majorTopic: "SQL 기본 및 활용",
    middleTopic: "JOIN",
    topic: "ON 조건과 WHERE 조건",
    difficulty: "상급",
    questionType: "Outer Join 판단형",
    mode: "similar",
    sourcePage: 4,
    sourceQuestionNumber: 39,
    parentQuestionId: "outer-join-filter-placement",
    stem: "LEFT OUTER JOIN 결과에서 부서가 없는 사원도 보존하려고 한다. 가장 적절한 SQL은?",
    code: `-- EMP(deptno), DEPT(deptno, use_yn)
-- 요구: 모든 사원을 출력하되, 부서가 있으면 사용 중인 부서만 연결한다.`,
    choices: [
      ["A", "FROM emp e LEFT JOIN dept d ON e.deptno = d.deptno WHERE d.use_yn = 'Y'", "오답이다. WHERE에서 오른쪽 테이블을 필터하면 NULL 확장 행이 제거되어 INNER JOIN처럼 된다."],
      ["B", "FROM emp e LEFT JOIN dept d ON e.deptno = d.deptno AND d.use_yn = 'Y'", "정답이다. 오른쪽 테이블 조건을 ON에 두어 미매칭 사원 행을 보존한다."],
      ["C", "FROM emp e INNER JOIN dept d ON e.deptno = d.deptno AND d.use_yn = 'Y'", "오답이다. INNER JOIN은 부서가 없는 사원을 제거한다."],
      ["D", "FROM emp e, dept d WHERE e.deptno = d.deptno(+) AND d.use_yn = 'Y'", "오답이다. Oracle 구문에서도 오른쪽 테이블 조건의 외부조인 표시가 없으면 보존 효과가 깨진다."]
    ],
    answer: "B",
    relatedConceptId: "sql-standard-join",
    hint: ["보존해야 할 테이블은 EMP다.", "오른쪽 테이블 조건이 WHERE에 있으면 NULL 행이 제거된다.", "조인 매칭 조건과 최종 필터 조건을 구분한다."],
    explanation: "LEFT OUTER JOIN에서 오른쪽 테이블 조건을 WHERE 절에 두면 NULL로 확장된 행이 조건을 만족하지 못해 제거된다. 보존 테이블 행을 유지하려면 오른쪽 테이블 필터를 ON 절에 둔다."
  },
  {
    subjectId: "sql-basic",
    number: 110,
    majorTopic: "SQL 기본 및 활용",
    middleTopic: "GROUP BY",
    topic: "GROUPING SETS",
    difficulty: "상급",
    questionType: "집계 결과형",
    mode: "similar",
    sourcePage: 5,
    sourceQuestionNumber: 17,
    parentQuestionId: "grouping-sets-rollup-cube",
    stem: "다음 SQL이 생성하는 집계 레벨로 가장 적절한 것은?",
    code: `SELECT region, product, SUM(amount)
FROM sales
GROUP BY GROUPING SETS ((region, product), (region), ());`,
    choices: [
      ["A", "지역+상품, 지역 소계, 전체 총계", "정답이다. GROUPING SETS에 명시된 세 집계 레벨만 생성한다."],
      ["B", "지역+상품, 상품 소계, 전체 총계", "오답이다. (product) 집계 세트는 명시되어 있지 않다."],
      ["C", "지역+상품, 지역 소계, 상품 소계, 전체 총계", "오답이다. 이는 CUBE(region, product)에 가까운 결과다."],
      ["D", "상세 행만 반환하고 소계는 생성하지 않는다.", "오답이다. GROUPING SETS는 명시한 소계 행을 만든다."]
    ],
    answer: "A",
    relatedConceptId: "sql-group-functions",
    hint: ["GROUPING SETS 괄호 안의 각 항목이 하나의 집계 레벨이다.", "(region, product), (region), ()가 보인다.", "빈 괄호는 전체 총계다."],
    explanation: "GROUPING SETS는 명시한 집계 조합만 생성한다. (region, product)는 상세 집계, (region)은 지역 소계, ()는 전체 총계를 의미한다."
  },
  {
    subjectId: "sql-basic",
    number: 111,
    majorTopic: "SQL 기본 및 활용",
    middleTopic: "Top-N",
    topic: "ROWNUM과 ORDER BY",
    difficulty: "상급",
    questionType: "최적 SQL 선택형",
    mode: "variant",
    sourcePage: 3,
    sourceQuestionNumber: 8,
    parentQuestionId: "round59-topn-rownum",
    stem: "급여가 높은 사원 5명을 정확히 조회하는 Oracle SQL로 가장 적절한 것은?",
    choices: [
      ["A", "SELECT * FROM emp WHERE ROWNUM <= 5 ORDER BY sal DESC", "오답이다. ROWNUM이 먼저 부여된 뒤 정렬되므로 전체 상위 5명이 아니다."],
      ["B", "SELECT * FROM (SELECT * FROM emp ORDER BY sal DESC) WHERE ROWNUM <= 5", "정답이다. 정렬된 인라인 뷰 바깥에서 ROWNUM을 적용해야 한다."],
      ["C", "SELECT * FROM emp ORDER BY sal DESC WHERE ROWNUM <= 5", "오답이다. SQL 문법상 ORDER BY 뒤에 WHERE를 둘 수 없다."],
      ["D", "SELECT * FROM emp WHERE sal <= 5 ORDER BY sal DESC", "오답이다. sal 값이 5 이하인 행을 조회하는 조건일 뿐 Top-N이 아니다."]
    ],
    answer: "B",
    relatedConceptId: "sql-top-n",
    hint: ["Oracle ROWNUM은 정렬 전에 부여된다.", "정렬 결과에 대해 ROWNUM을 적용하려면 쿼리 블록을 나눈다.", "ORDER BY가 내부, ROWNUM이 외부에 있어야 한다."],
    explanation: "Oracle에서 정렬 후 상위 N건을 구하려면 ORDER BY를 수행한 인라인 뷰를 만들고 외부 쿼리에서 ROWNUM 조건을 적용한다."
  },
  {
    subjectId: "sql-basic",
    number: 112,
    majorTopic: "SQL 기본 및 활용",
    middleTopic: "계층형 질의",
    topic: "CONNECT BY",
    difficulty: "상급",
    questionType: "계층형 질의 판단형",
    mode: "variant",
    sourcePage: 3,
    sourceQuestionNumber: 7,
    parentQuestionId: "round58-hierarchical-query",
    stem: "Oracle 계층형 질의에 대한 설명으로 가장 부적절한 것은?",
    choices: [
      ["A", "START WITH는 계층 전개의 시작 행을 지정한다.", "오답이다. START WITH는 루트 행 조건이다."],
      ["B", "CONNECT BY PRIOR 자식컬럼 = 부모컬럼 형태와 방향에 따라 전개 방향이 달라질 수 있다.", "오답이다. PRIOR의 위치는 부모·자식 연결 방향을 결정한다."],
      ["C", "WHERE 절은 계층 전개 전에 항상 자식 후보를 제거하므로 전개 경로 자체를 완전히 바꾼다.", "정답이다. Oracle 계층형 질의에서 WHERE는 전개 후 행 필터로 작동하는 점을 구분해야 한다."],
      ["D", "SYS_CONNECT_BY_PATH는 루트부터 현재 행까지의 경로 문자열을 만들 수 있다.", "오답이다. 경로 출력 함수의 올바른 설명이다."]
    ],
    answer: "C",
    relatedConceptId: "sql-hierarchical-self-join",
    hint: ["START WITH와 CONNECT BY의 역할을 나눈다.", "WHERE는 일반 조인처럼 무조건 전개 전 필터라고 단정하면 위험하다.", "계층 전개 후 필터와 전개 조건을 구분한다."],
    explanation: "Oracle 계층형 질의에서 CONNECT BY는 계층 전개 조건이고 START WITH는 루트 조건이다. WHERE는 전개된 결과에 대한 필터로 이해해야 하며, 전개 경로를 제한하려면 CONNECT BY 조건에 포함하는 방식을 검토한다."
  },
  {
    subjectId: "sql-basic",
    number: 113,
    majorTopic: "SQL 기본 및 활용",
    middleTopic: "DML",
    topic: "MERGE",
    difficulty: "상급",
    questionType: "DML 판단형",
    mode: "similar",
    sourcePage: 6,
    sourceQuestionNumber: 19,
    parentQuestionId: "merge-duplicate-source",
    stem: "MERGE 문 수행 시 오류 또는 비결정적 결과를 피하기 위해 가장 주의해야 할 상황은?",
    passage: "대상 테이블 CUSTOMER_SUMMARY는 CUST_ID가 PK이다. 소스 집합에서 같은 CUST_ID가 두 건 이상 나올 수 있다.",
    choices: [
      ["A", "소스 집합의 동일 CUST_ID 중복을 사전에 집계하거나 제거한다.", "정답이다. 하나의 대상 행이 여러 소스 행과 매칭되면 안정적인 MERGE가 어렵고 오류가 발생할 수 있다."],
      ["B", "MERGE는 중복 소스 행이 있어도 마지막 행 기준으로 자동 갱신한다.", "오답이다. DBMS가 임의로 마지막 행을 선택한다고 보면 안 된다."],
      ["C", "MERGE에서는 INSERT만 가능하고 UPDATE는 불가능하다.", "오답이다. MERGE는 조건에 따라 UPDATE와 INSERT를 수행한다."],
      ["D", "ON 절에는 항상 상수 조건만 사용할 수 있다.", "오답이다. ON 절은 대상과 소스의 매칭 조건을 정의한다."]
    ],
    answer: "A",
    relatedConceptId: "sql-dml",
    hint: ["MERGE는 대상 행과 소스 행의 매칭 관계가 중요하다.", "하나의 대상 행에 여러 소스 행이 매칭되면 문제가 된다.", "소스를 먼저 집계하거나 중복 제거해야 한다."],
    explanation: "MERGE는 ON 조건으로 대상 행을 찾아 UPDATE 또는 INSERT한다. 동일 대상 행에 여러 소스 행이 매칭되면 안정적으로 한 번만 갱신할 수 없으므로 소스 중복을 제거하거나 집계해야 한다."
  },
  {
    subjectId: "sql-basic",
    number: 114,
    majorTopic: "SQL 기본 및 활용",
    middleTopic: "정규 표현식",
    topic: "REGEXP_REPLACE",
    difficulty: "중급",
    questionType: "함수 결과형",
    mode: "variant",
    sourcePage: 3,
    sourceQuestionNumber: 9,
    parentQuestionId: "round60-regexp-replace-date",
    stem: "다음 SQL의 결과로 가장 적절한 것은?",
    code: `SELECT REGEXP_REPLACE('2026/02/25', '([0-9]{4})/([0-9]{2})/([0-9]{2})', '\\\\1-\\\\2-\\\\3') AS dt
FROM dual;`,
    choices: [
      ["A", "2026-02-25", "정답이다. 세 캡처 그룹을 하이픈으로 다시 조합한다."],
      ["B", "20260225", "오답이다. 대체 문자열에 하이픈이 포함되어 있다."],
      ["C", "02-25-2026", "오답이다. 캡처 그룹 순서를 바꾸지 않았다."],
      ["D", "2026/02/25", "오답이다. 패턴이 매칭되므로 대체가 수행된다."]
    ],
    answer: "A",
    relatedConceptId: "sql-regexp",
    hint: ["괄호는 캡처 그룹을 만든다.", "\\1, \\2, \\3은 각 그룹을 다시 참조한다.", "대체 문자열의 구분자는 하이픈이다."],
    explanation: "REGEXP_REPLACE는 정규 표현식에 매칭되는 부분을 대체 문자열로 바꾼다. 세 숫자 그룹을 각각 참조하여 2026-02-25 형태로 변환한다."
  },
  {
    subjectId: "sql-basic",
    number: 115,
    majorTopic: "SQL 기본 및 활용",
    middleTopic: "JOIN",
    topic: "Natural Join",
    difficulty: "상급",
    questionType: "SQL 문장 판단형",
    mode: "similar",
    sourcePage: 5,
    sourceQuestionNumber: 22,
    parentQuestionId: "natural-join-same-columns",
    stem: "NATURAL JOIN 사용 시 가장 주의해야 할 점은?",
    passage: "EMP와 DEPT에는 DEPTNO뿐 아니라 REG_DATE라는 동일한 컬럼명이 우연히 함께 존재한다.",
    choices: [
      ["A", "동일한 이름의 컬럼이 모두 조인 조건으로 사용될 수 있다.", "정답이다. NATURAL JOIN은 이름이 같은 컬럼 전체를 암묵적 조인 조건으로 사용한다."],
      ["B", "첫 번째로 발견된 동일 컬럼 하나만 조인 조건이 된다.", "오답이다. 같은 이름 컬럼 모두가 조건으로 쓰일 수 있다."],
      ["C", "NATURAL JOIN은 항상 CROSS JOIN으로 변환된다.", "오답이다. 동일 컬럼 기반 등치 조인이다."],
      ["D", "NATURAL JOIN에서는 같은 이름 컬럼이 있어도 결과에 모두 중복 출력된다.", "오답이다. 공통 컬럼은 한 번만 표시된다."]
    ],
    answer: "A",
    relatedConceptId: "sql-standard-join",
    hint: ["NATURAL JOIN은 조인 컬럼을 명시하지 않는다.", "같은 이름 컬럼이 여러 개면 모두 조건이 될 수 있다.", "우연히 같은 컬럼명이 있으면 결과가 달라진다."],
    explanation: "NATURAL JOIN은 이름이 같은 컬럼들을 자동으로 조인 조건으로 삼는다. 의도하지 않은 동일 컬럼이 있으면 결과가 과도하게 줄거나 달라질 수 있으므로 명시적 JOIN 조건이 안전하다."
  },
  {
    subjectId: "sql-basic",
    number: 116,
    majorTopic: "SQL 기본 및 활용",
    middleTopic: "집합 연산",
    topic: "MINUS",
    difficulty: "중급",
    questionType: "집합 결과형",
    mode: "similar",
    sourcePage: 5,
    sourceQuestionNumber: 5,
    parentQuestionId: "set-operator-minus",
    stem: "다음 SQL 결과로 가장 적절한 것은?",
    table: {
      headers: ["A.X", "B.X"],
      rows: [
        ["1", "2"],
        ["2", "4"],
        ["3", ""],
        ["3", ""]
      ]
    },
    code: `SELECT x FROM A
MINUS
SELECT x FROM B;`,
    choices: [
      ["A", "1, 3", "정답이다. MINUS는 중복 제거 후 A에만 있는 값 1과 3을 반환한다."],
      ["B", "1, 3, 3", "오답이다. 집합 연산은 기본적으로 중복을 제거한다."],
      ["C", "2, 4", "오답이다. 이는 B 쪽 값이며 차집합 방향이 반대다."],
      ["D", "1, 2, 3", "오답이다. 2는 B에도 있으므로 제거된다."]
    ],
    answer: "A",
    relatedConceptId: "sql-set-operators",
    hint: ["MINUS는 앞 결과에서 뒤 결과를 뺀다.", "중복은 제거된다.", "A에 있고 B에는 없는 값을 찾는다."],
    explanation: "MINUS는 첫 번째 SELECT 결과에서 두 번째 SELECT 결과와 중복되는 값을 제거한다. A의 값은 1,2,3이고 B에는 2,4가 있으므로 결과는 1과 3이다."
  },
  {
    subjectId: "sql-basic",
    number: 117,
    majorTopic: "SQL 기본 및 활용",
    middleTopic: "GROUP BY",
    topic: "COUNT와 NULL",
    difficulty: "중급",
    questionType: "집계 결과형",
    mode: "variant",
    sourcePage: 4,
    sourceQuestionNumber: 41,
    parentQuestionId: "count-null-difference",
    stem: "다음 집계 결과로 가장 적절한 것은?",
    table: {
      headers: ["C1"],
      rows: [["A"], ["NULL"], ["B"], ["B"]]
    },
    code: `SELECT COUNT(*) AS c_all, COUNT(c1) AS c_col, COUNT(DISTINCT c1) AS c_dist
FROM t;`,
    choices: [
      ["A", "4, 3, 2", "정답이다. 전체 행은 4건, NULL이 아닌 C1은 3건, 중복 제거 값은 A와 B 두 개다."],
      ["B", "3, 3, 2", "오답이다. COUNT(*)는 NULL 여부와 상관없이 행 수를 센다."],
      ["C", "4, 4, 3", "오답이다. COUNT(c1)는 NULL을 제외하고 DISTINCT도 NULL을 세지 않는다."],
      ["D", "4, 3, 3", "오답이다. B 중복은 DISTINCT에서 하나로 계산된다."]
    ],
    answer: "A",
    relatedConceptId: "sql-group-having",
    hint: ["COUNT(*)와 COUNT(컬럼)의 차이를 본다.", "COUNT(DISTINCT 컬럼)은 NULL 제외와 중복 제거가 함께 적용된다.", "B는 두 번 있어도 DISTINCT에서는 하나다."],
    explanation: "COUNT(*)는 모든 행을 세고 COUNT(expr)는 expr이 NULL이 아닌 행만 센다. DISTINCT는 중복을 제거하므로 A와 B 두 값만 카운트된다."
  },
  {
    subjectId: "sql-basic",
    number: 118,
    majorTopic: "SQL 기본 및 활용",
    middleTopic: "DCL",
    topic: "ROLE과 객체 권한",
    difficulty: "중급",
    questionType: "권한 개념형",
    mode: "variant",
    sourcePage: 2,
    sourceQuestionNumber: 1,
    parentQuestionId: "round59-dcl-role",
    stem: "권한과 ROLE에 대한 설명으로 가장 적절한 것은?",
    choices: [
      ["A", "ROLE은 여러 권한을 묶어 사용자에게 부여하기 위한 권한 집합이다.", "정답이다. ROLE은 권한 관리를 단순화하기 위한 권한 묶음이다."],
      ["B", "REVOKE는 실행 즉시 물리 디스크에 데이터를 저장하는 명령이다.", "오답이다. REVOKE는 권한 회수 명령이며 데이터 저장 명령이 아니다."],
      ["C", "GRANT는 자신이 보유하지 않은 모든 권한도 임의로 부여할 수 있다.", "오답이다. 부여 가능한 권한과 grant option 여부가 필요하다."],
      ["D", "ROLE은 테이블의 행 데이터를 자동 암호화하는 기능이다.", "오답이다. ROLE은 접근 권한 관리 기능이다."]
    ],
    answer: "A",
    relatedConceptId: "sql-dcl",
    hint: ["ROLE의 목적은 권한 관리 단순화다.", "GRANT와 REVOKE는 권한 부여·회수 명령이다.", "데이터 저장이나 암호화 기능과 구분한다."],
    explanation: "ROLE은 여러 시스템 권한이나 객체 권한을 묶어 사용자에게 부여할 수 있게 해준다. GRANT는 권한 부여, REVOKE는 권한 회수 명령이다."
  },
  {
    subjectId: "sql-basic",
    number: 119,
    majorTopic: "SQL 기본 및 활용",
    middleTopic: "PIVOT",
    topic: "PIVOT 집계",
    difficulty: "상급",
    questionType: "SQL 구조 선택형",
    mode: "similar",
    sourcePage: 3,
    sourceQuestionNumber: 3,
    parentQuestionId: "round60-pivot-salary",
    stem: "부서별 직급별 연봉 합계를 행은 부서, 열은 직급으로 표시하려고 한다. PIVOT 절에 대한 설명으로 가장 적절한 것은?",
    choices: [
      ["A", "PIVOT은 직급 값을 컬럼으로 전환하고 연봉은 SUM 같은 집계 함수로 계산한다.", "정답이다. PIVOT은 값의 행을 열로 돌리며 집계 함수가 필요하다."],
      ["B", "PIVOT을 사용하면 GROUP BY와 집계 함수가 전혀 필요 없다.", "오답이다. PIVOT 내부에도 집계가 포함된다."],
      ["C", "PIVOT 대상 직급 값은 실행 시 데이터에 따라 자동으로 무한히 컬럼이 생성된다.", "오답이다. 일반 PIVOT은 IN 목록에 표시할 값을 명시한다."],
      ["D", "PIVOT은 문자 컬럼에는 사용할 수 없고 숫자 컬럼에만 사용할 수 있다.", "오답이다. 피벗 기준 값은 문자일 수 있으며 집계 대상이 주로 숫자다."]
    ],
    answer: "A",
    relatedConceptId: "sql-pivot-unpivot",
    hint: ["PIVOT은 행 값을 컬럼으로 돌리는 기능이다.", "연봉 합계는 집계 함수가 필요하다.", "컬럼으로 만들 값은 보통 IN 목록에 명시한다."],
    explanation: "PIVOT은 특정 컬럼의 값을 여러 출력 컬럼으로 전환하고, 각 교차점의 값을 집계 함수로 계산한다. 부서별 직급별 연봉 합계라면 직급을 피벗 컬럼으로, 연봉을 SUM 대상으로 둔다."
  },
  {
    subjectId: "sql-basic",
    number: 120,
    majorTopic: "SQL 기본 및 활용",
    middleTopic: "문자 함수",
    topic: "LIKE와 ESCAPE",
    difficulty: "중급",
    questionType: "조건식 판단형",
    mode: "variant",
    sourcePage: 2,
    sourceQuestionNumber: 2,
    parentQuestionId: "like-escape-underscore",
    stem: "문자열에 실제 언더스코어가 포함된 'A_C' 패턴만 찾으려고 한다. 가장 적절한 조건은?",
    choices: [
      ["A", "col LIKE 'A_C'", "오답이다. 언더스코어는 임의의 한 글자를 의미하므로 A와 C 사이 한 글자면 모두 매칭된다."],
      ["B", "col LIKE 'A\\_C' ESCAPE '\\'", "정답이다. ESCAPE 문자를 지정해 언더스코어를 일반 문자로 해석하게 한다."],
      ["C", "col = 'A%C'", "오답이다. 퍼센트가 실제 문자로 비교되며 요구 문자열과 다르다."],
      ["D", "col LIKE 'A%%C'", "오답이다. 퍼센트는 0글자 이상 와일드카드라 실제 언더스코어 여부를 보장하지 않는다."]
    ],
    answer: "B",
    relatedConceptId: "sql-where",
    hint: ["LIKE에서 _는 한 글자 와일드카드다.", "와일드카드를 일반 문자로 보려면 ESCAPE가 필요하다.", "ESCAPE 뒤 문자는 특별 의미를 제거한다."],
    explanation: "LIKE의 '_'는 임의의 한 글자를 의미한다. 실제 언더스코어 문자를 찾으려면 ESCAPE 문자를 지정하고 패턴에서 해당 문자를 붙여 '_ '의 와일드카드 의미를 제거해야 한다."
  },
  {
    subjectId: "tuning",
    number: 101,
    majorTopic: "SQL 고급활용 및 튜닝",
    middleTopic: "SQL 처리 구조",
    topic: "라이브러리 캐시와 바인드 피킹",
    difficulty: "상급",
    questionType: "개념 판단형",
    mode: "original",
    sourcePage: 1,
    sourceQuestionNumber: 1,
    parentQuestionId: "new-subject3-q1-library-cache",
    stem: "오라클 SQL 최적화 및 라이브러리 캐시 메커니즘에 대한 설명으로 가장 부적절한 것은?",
    choices: [
      ["A", "바인드 변수는 하드 파싱을 줄여 라이브러리 캐시 경합을 완화할 수 있다.", "오답이다. 바인드 변수의 대표적인 장점이다."],
      ["B", "문자열이 다르면 같은 의미의 SQL이라도 서로 다른 커서로 취급될 수 있다.", "오답이다. SQL 텍스트는 커서 공유의 중요한 기준이다."],
      ["C", "바인드 변수 피킹은 데이터가 치우친 컬럼에서도 항상 최적의 실행계획을 보장한다.", "정답이다. 최초 바인드 값에 맞춘 계획이 다른 값에는 부적절할 수 있다."],
      ["D", "CURSOR_SHARING=FORCE는 리터럴을 바인드처럼 변환하지만 부작용이 있을 수 있다.", "오답이다. 공유성은 좋아질 수 있으나 계획 안정성 문제가 생길 수 있다."]
    ],
    answer: "C",
    relatedConceptId: "tuning-sql-sharing",
    hint: ["항상 보장한다는 표현을 조심한다.", "바인드 피킹은 첫 실행 값의 선택도에 영향을 받는다.", "데이터 분포가 치우치면 실행계획이 값마다 달라져야 할 수 있다."],
    explanation: "바인드 변수 피킹은 최초 컴파일 시 바인드 값을 기준으로 실행계획을 만든다. 데이터 분포가 치우친 컬럼에서는 다른 바인드 값에 대해 잘못된 계획이 재사용될 수 있어 Adaptive Cursor Sharing 같은 보완이 필요하다."
  },
  {
    subjectId: "tuning",
    number: 102,
    majorTopic: "SQL 고급활용 및 튜닝",
    middleTopic: "인덱스",
    topic: "Index Skip Scan",
    difficulty: "상급",
    questionType: "인덱스 스캔 판단형",
    mode: "original",
    sourcePage: 1,
    sourceQuestionNumber: 2,
    parentQuestionId: "new-subject3-q2-skip-scan",
    stem: "결합 인덱스 (성별, 고객등급, 가입일자)가 있을 때 성별 조건 없이 고객등급='VIP' 조건만 사용한다. Index Skip Scan이 상대적으로 유리해질 수 있는 조건은?",
    choices: [
      ["A", "성별 컬럼의 NDV가 매우 낮고 고객등급 조건의 변별력이 높다.", "정답이다. 선두 컬럼 값별로 후속 컬럼 탐색을 반복하므로 선두 NDV가 낮을 때 효과적이다."],
      ["B", "성별 컬럼의 NDV가 매우 높고 고객등급 조건의 변별력이 낮다.", "오답이다. 스킵 포인트가 많고 후행 조건도 약하면 비효율이 크다."],
      ["C", "인덱스 선두 컬럼이 조건에 없으면 Skip Scan은 절대 불가능하다.", "오답이다. 선두 컬럼 조건이 없어도 특정 조건에서 Skip Scan이 가능하다."],
      ["D", "Skip Scan은 항상 Full Table Scan보다 빠르다.", "오답이다. 데이터 분포와 비용에 따라 달라진다."]
    ],
    answer: "A",
    relatedConceptId: "tuning-index-scan-efficiency",
    hint: ["Skip Scan은 선두 컬럼 값을 내부적으로 나누어 탐색한다.", "선두 컬럼 NDV가 낮아야 반복 탐색 수가 적다.", "후행 조건은 충분히 선택적이어야 한다."],
    explanation: "Index Skip Scan은 선두 컬럼 조건이 없어도 선두 컬럼의 가능한 값별로 후행 컬럼 조건을 탐색한다. 선두 컬럼 NDV가 낮고 후행 조건 선택도가 높을 때 효과가 있다."
  },
  {
    subjectId: "tuning",
    number: 103,
    majorTopic: "SQL 고급활용 및 튜닝",
    middleTopic: "인덱스",
    topic: "클러스터링 팩터",
    difficulty: "상급",
    questionType: "비용 판단형",
    mode: "original",
    sourcePage: 2,
    sourceQuestionNumber: 3,
    parentQuestionId: "new-subject3-q3-clustering-factor",
    stem: "클러스터링 팩터에 대한 설명으로 가장 부적절한 것은?",
    choices: [
      ["A", "인덱스 키 순서와 테이블 블록 저장 순서의 일치 정도를 나타낸다.", "오답이다. 클러스터링 팩터의 핵심 정의다."],
      ["B", "클러스터링 팩터가 좋으면 인덱스 Range Scan 후 테이블 블록 재방문 비용이 줄어든다.", "오답이다. 물리 배치가 인덱스 순서와 가까우면 랜덤 액세스 비용이 낮아진다."],
      ["C", "클러스터링 팩터가 나빠도 버퍼 캐시 히트율만 높으면 옵티마이저 비용에는 전혀 반영되지 않는다.", "정답이다. 옵티마이저는 CF를 테이블 액세스 비용 산정에 활용한다."],
      ["D", "같은 선택도라도 CF가 나쁜 인덱스는 Full Scan보다 불리할 수 있다.", "오답이다. 랜덤 액세스 비용이 커지면 손익분기점이 낮아질 수 있다."]
    ],
    answer: "C",
    relatedConceptId: "tuning-table-access",
    hint: ["CF는 테이블 액세스 비용에 연결된다.", "버퍼 캐시 상태와 옵티마이저 통계의 역할을 구분한다.", "CF가 나쁘면 랜덤 액세스 비용 추정이 커진다."],
    explanation: "클러스터링 팩터는 인덱스 순서로 ROWID를 따라갈 때 테이블 블록을 얼마나 자주 바꾸는지를 나타낸다. 옵티마이저는 이를 Index Range Scan 후 테이블 액세스 비용에 반영한다."
  },
  {
    subjectId: "tuning",
    number: 104,
    majorTopic: "SQL 고급활용 및 튜닝",
    middleTopic: "조인",
    topic: "NL Join",
    difficulty: "상급",
    questionType: "조인 방식 판단형",
    mode: "original",
    sourcePage: 2,
    sourceQuestionNumber: 4,
    parentQuestionId: "new-subject3-q4-nl-join",
    stem: "Nested Loops Join에 대한 설명으로 가장 부적절한 것은?",
    choices: [
      ["A", "선행 집합의 처리 범위가 전체 반복 탐색 횟수에 큰 영향을 준다.", "오답이다. 선행 행 수는 NL Join 비용의 핵심 요소다."],
      ["B", "후행 테이블 조인 컬럼의 효율적인 인덱스가 중요하다.", "오답이다. 후행 반복 탐색 비용을 줄이는 핵심이다."],
      ["C", "대량 집합 간 조인에서도 최초 응답 속도를 위해 NL Join이 항상 Hash Join보다 적합하다.", "정답이다. 선행 행 수와 후행 액세스 비용이 크면 NL Join은 매우 불리할 수 있다."],
      ["D", "선행 집합에서 필터링된 건수가 적을수록 후행 탐색 횟수가 줄어든다.", "오답이다. NL Join 반복 횟수가 줄어든다."]
    ],
    answer: "C",
    relatedConceptId: "tuning-nl-join",
    hint: ["NL Join은 반복 탐색 구조다.", "최초 응답성과 전체 처리량을 구분한다.", "항상이라는 표현이 성립하는지 본다."],
    explanation: "NL Join은 소량 선행 집합과 효율적인 후행 인덱스가 있을 때 유리하다. 대량 집합 간 조인에서는 반복 랜덤 액세스가 폭증할 수 있어 Hash Join이 더 적절할 수 있다."
  },
  {
    subjectId: "tuning",
    number: 105,
    majorTopic: "SQL 고급활용 및 튜닝",
    middleTopic: "조인",
    topic: "Sort Merge Join과 Hash Join",
    difficulty: "상급",
    questionType: "조인 비교형",
    mode: "original",
    sourcePage: 2,
    sourceQuestionNumber: 5,
    parentQuestionId: "new-subject3-q5-smj-hash",
    stem: "Sort Merge Join과 Hash Join 비교 설명으로 가장 부적절한 것은?",
    choices: [
      ["A", "Sort Merge Join은 양쪽 입력을 조인 키로 정렬한 뒤 병합한다.", "오답이다. Sort Merge Join의 기본 동작이다."],
      ["B", "Hash Join은 동등 조인뿐 아니라 모든 부등호 조인에서 동일하게 사용할 수 있다.", "정답이다. Hash Join은 기본적으로 동등 조인에 적합하다."],
      ["C", "Hash Join의 Build Input이 메모리를 초과하면 TEMP I/O가 발생할 수 있다.", "오답이다. Hash Area 부족 시 디스크 spill이 발생한다."],
      ["D", "이미 정렬된 입력이 있으면 Sort Merge Join의 정렬 비용이 줄어들 수 있다.", "오답이다. 인덱스 정렬 순서를 활용할 수 있는 경우가 있다."]
    ],
    answer: "B",
    relatedConceptId: "tuning-hash-join",
    hint: ["Hash Join의 대표 조건은 동등 조인이다.", "Sort Merge Join은 정렬 기반이다.", "메모리 부족 시 TEMP 사용을 생각한다."],
    explanation: "Hash Join은 해시 키 비교를 기반으로 하므로 일반적으로 동등 조인에 적합하다. 부등호나 범위 조인에서는 Sort Merge Join이나 NL Join이 고려될 수 있다."
  },
  {
    subjectId: "tuning",
    number: 106,
    majorTopic: "SQL 고급활용 및 튜닝",
    middleTopic: "조인",
    topic: "Hash Join Build Input",
    difficulty: "최상급",
    questionType: "힌트 판단형",
    mode: "original",
    sourcePage: 2,
    sourceQuestionNumber: 6,
    parentQuestionId: "new-subject3-q6-hash-build",
    stem: "CUST 1천 건, ORD 1천만 건을 조인한다. CUST를 Build Input으로 두고 ORD를 Probe Input으로 처리하려 할 때 가장 적절한 힌트 방향은?",
    code: `SELECT c.cust_id, o.ord_id
FROM cust c, ord o
WHERE c.cust_id = o.cust_id
  AND c.grade = 'VIP';`,
    choices: [
      ["A", "/*+ LEADING(c o) USE_HASH(o) */", "정답이다. CUST를 먼저 읽고 ORD를 해시 조인 대상으로 두면 작은 CUST가 Build Input이 되도록 유도할 수 있다."],
      ["B", "/*+ LEADING(o c) USE_NL(c) */", "오답이다. 대용량 ORD 선행 NL 반복 탐색이 발생할 수 있다."],
      ["C", "/*+ FULL(c) USE_NL(o) */", "오답이다. Hash Join이 아니라 NL Join 유도다."],
      ["D", "/*+ INDEX(o ord_pk) */", "오답이다. 인덱스 사용만 지정하며 Build/Probe 방향을 명확히 제어하지 않는다."]
    ],
    answer: "A",
    relatedConceptId: "tuning-hash-join",
    hint: ["작은 집합을 먼저 Build로 두는 것이 일반적이다.", "LEADING은 조인 순서, USE_HASH는 조인 방식을 유도한다.", "대용량 테이블을 Probe로 스캔하게 한다."],
    explanation: "Hash Join에서는 작은 입력을 Build Input으로 해시 테이블화하고 큰 입력을 Probe하는 것이 유리하다. LEADING(c o)와 USE_HASH(o)는 CUST 선행 후 ORD와 해시 조인을 유도한다."
  },
  {
    subjectId: "tuning",
    number: 107,
    majorTopic: "SQL 고급활용 및 튜닝",
    middleTopic: "쿼리 변환",
    topic: "Subquery Unnesting",
    difficulty: "상급",
    questionType: "쿼리 변환 선택형",
    mode: "original",
    sourcePage: 3,
    sourceQuestionNumber: 7,
    parentQuestionId: "new-subject3-q7-unnesting",
    stem: "서브쿼리 블록을 풀어 메인 쿼리와 같은 레벨의 조인으로 변환하는 기법과 이를 제어하는 힌트 쌍으로 가장 적절한 것은?",
    choices: [
      ["A", "View Merging - MERGE / NO_MERGE", "오답이다. 인라인 뷰 병합 제어에 가깝다."],
      ["B", "Subquery Unnesting - UNNEST / NO_UNNEST", "정답이다. 서브쿼리를 조인 형태로 풀어내는 기법과 힌트다."],
      ["C", "Predicate Pushing - PUSH_PRED / NO_PUSH_PRED", "오답이다. 조건을 뷰 내부로 밀어 넣는 기법이다."],
      ["D", "OR Expansion - USE_CONCAT / NO_EXPAND", "오답이다. OR 조건을 분기하는 변환과 관련된다."]
    ],
    answer: "B",
    relatedConceptId: "tuning-query-transformation",
    hint: ["서브쿼리를 조인으로 푸는 이름을 찾는다.", "UNNEST라는 힌트 명칭이 직접 연결된다.", "MERGE는 뷰 병합에 가깝다."],
    explanation: "Subquery Unnesting은 EXISTS, IN 등 서브쿼리를 조인 형태로 변환해 조인 순서와 조인 방식 선택 폭을 넓힌다. 힌트는 UNNEST와 NO_UNNEST를 사용한다."
  },
  {
    subjectId: "tuning",
    number: 108,
    majorTopic: "SQL 고급활용 및 튜닝",
    middleTopic: "쿼리 변환",
    topic: "FILTER와 Semi Join",
    difficulty: "상급",
    questionType: "실행계획 해석형",
    mode: "original",
    sourcePage: 3,
    sourceQuestionNumber: 8,
    parentQuestionId: "new-subject3-q8-filter-semi",
    stem: "EXISTS 서브쿼리가 Unnesting 되지 않고 FILTER Operation으로 처리될 때의 설명으로 가장 부적절한 것은?",
    choices: [
      ["A", "메인 쿼리의 각 행마다 서브쿼리 조건을 평가할 수 있다.", "오답이다. FILTER 방식의 대표적인 특징이다."],
      ["B", "메인 쿼리가 드라이빙 집합이 된다.", "오답이다. FILTER는 외부 행을 기준으로 내부 조건을 확인한다."],
      ["C", "메인 쿼리 건수가 많고 서브쿼리 조인 컬럼 인덱스가 없어도 항상 Hash Semi Join보다 우수하다.", "정답이다. 대량 반복 Full Scan이 발생할 수 있어 항상 우수하다고 할 수 없다."],
      ["D", "UNNEST 힌트를 통해 Semi Join으로 변환될 수 있다.", "오답이다. 변환 가능성이 있다."]
    ],
    answer: "C",
    relatedConceptId: "tuning-query-transformation",
    hint: ["FILTER는 반복 평가 구조다.", "서브쿼리 인덱스가 없고 외부 행이 많으면 비용이 커진다.", "항상 우수하다는 표현을 경계한다."],
    explanation: "FILTER 방식은 외부 행마다 서브쿼리를 반복 평가할 수 있다. 외부 행 수가 많고 내부 접근 경로가 나쁘면 Hash Semi Join으로 변환하는 것이 더 효율적일 수 있다."
  },
  {
    subjectId: "tuning",
    number: 109,
    majorTopic: "SQL 고급활용 및 튜닝",
    middleTopic: "고급 SQL 튜닝",
    topic: "Scalar Subquery Caching",
    difficulty: "최상급",
    questionType: "성능 판단형",
    mode: "original",
    sourcePage: 3,
    sourceQuestionNumber: 9,
    parentQuestionId: "new-subject3-q9-scalar-cache",
    stem: "스칼라 서브쿼리 캐싱에 대한 설명으로 가장 부적절한 것은?",
    choices: [
      ["A", "입력값 종류가 적고 반복이 많으면 캐싱 효과가 커질 수 있다.", "오답이다. 반복 입력값이 많을수록 캐시 재사용이 가능하다."],
      ["B", "스칼라 서브쿼리가 두 건 이상 반환하면 오류가 발생한다.", "오답이다. 단일 값이어야 하므로 다중 행은 오류다."],
      ["C", "입력값 NDV가 매우 높으면 캐시 재사용 효과가 줄어든다.", "오답이다. 서로 다른 입력이 많으면 캐시 적중률이 낮다."],
      ["D", "스칼라 서브쿼리는 항상 Hash Join으로 자동 변환되어 행마다 반복 실행되지 않는다.", "정답이다. 항상 자동 변환된다고 단정할 수 없다."]
    ],
    answer: "D",
    relatedConceptId: "tuning-scalar-subquery",
    hint: ["스칼라 서브쿼리는 행마다 평가될 수 있다.", "캐시는 입력값 반복 여부에 좌우된다.", "항상 Hash Join으로 변환된다는 표현을 의심한다."],
    explanation: "스칼라 서브쿼리는 단일 값을 반환해야 하며 입력값과 결과를 캐싱할 수 있다. 그러나 모든 경우에 Hash Join으로 자동 변환되는 것은 아니며, NDV가 높으면 캐싱 효과도 낮아진다."
  },
  {
    subjectId: "tuning",
    number: 110,
    majorTopic: "SQL 고급활용 및 튜닝",
    middleTopic: "정렬",
    topic: "Hash Group By",
    difficulty: "상급",
    questionType: "실행 결과 판단형",
    mode: "original",
    sourcePage: 4,
    sourceQuestionNumber: 10,
    parentQuestionId: "new-subject3-q10-hash-group-by",
    stem: "GROUP BY 결과에 대한 설명으로 가장 적절한 것은?",
    choices: [
      ["A", "GROUP BY는 항상 Sort Group By로 수행되므로 결과 정렬 순서가 보장된다.", "오답이다. Hash Group By가 선택될 수 있고 정렬 순서를 보장하지 않는다."],
      ["B", "Hash Group By는 정렬 없이 해시 테이블로 그룹을 만들 수 있어 결과 순서가 보장되지 않는다.", "정답이다. GROUP BY 결과 정렬이 필요하면 ORDER BY를 명시해야 한다."],
      ["C", "GROUP BY 컬럼에 인덱스가 있으면 Hash Group By는 절대 선택되지 않는다.", "오답이다. 비용에 따라 달라질 수 있다."],
      ["D", "GROUP BY는 중복 제거만 하므로 집계 함수와 함께 사용할 수 없다.", "오답이다. GROUP BY는 집계와 함께 사용된다."]
    ],
    answer: "B",
    relatedConceptId: "tuning-sort",
    hint: ["GROUP BY와 ORDER BY는 다르다.", "Hash Group By는 정렬 기반이 아니다.", "결과 순서가 필요하면 ORDER BY를 명시한다."],
    explanation: "Oracle은 GROUP BY를 Sort Group By 또는 Hash Group By로 처리할 수 있다. Hash Group By는 정렬 순서를 보장하지 않으므로 표시 순서가 필요하면 ORDER BY를 별도로 써야 한다."
  },
  {
    subjectId: "tuning",
    number: 111,
    majorTopic: "SQL 고급활용 및 튜닝",
    middleTopic: "Top-N",
    topic: "Stopkey",
    difficulty: "최상급",
    questionType: "실행계획 선택형",
    mode: "original",
    sourcePage: 4,
    sourceQuestionNumber: 11,
    parentQuestionId: "new-subject3-q11-topn-stopkey",
    stem: "급여 상위 10건을 빠르게 조회하려고 한다. Sort Order By를 최소화하고 Stopkey를 유도하는 데 가장 적절한 인덱스와 SQL 구조는?",
    choices: [
      ["A", "SAL DESC 인덱스를 만들고 정렬된 인라인 뷰 바깥에서 ROWNUM <= 10을 적용한다.", "정답이다. 인덱스 역순 스캔과 Stopkey로 전체 정렬을 피할 수 있다."],
      ["B", "SAL 인덱스 없이 WHERE ROWNUM <= 10 ORDER BY SAL DESC를 같은 블록에 작성한다.", "오답이다. 정렬 전 ROWNUM이 붙고 전체 상위 10건이 아니다."],
      ["C", "COUNT(*)를 먼저 수행한 후 정렬한다.", "오답이다. Top-N 조회와 관계없는 전체 집계가 추가된다."],
      ["D", "FULL 힌트를 주면 Stopkey가 항상 가장 빨리 동작한다.", "오답이다. Full Scan 후 정렬이 필요할 수 있다."]
    ],
    answer: "A",
    relatedConceptId: "tuning-response-time",
    hint: ["정렬 기준과 인덱스 순서가 맞아야 한다.", "ROWNUM 적용 위치가 중요하다.", "필요한 N건만 읽고 멈추는 계획을 찾는다."],
    explanation: "Top-N 최적화는 정렬 기준과 일치하는 인덱스를 사용하고 ROWNUM 또는 FETCH FIRST가 Stopkey로 작동하도록 쿼리 블록을 구성해야 한다. 그러면 전체 정렬 없이 필요한 건수만 조기 반환할 수 있다."
  },
  {
    subjectId: "tuning",
    number: 112,
    majorTopic: "SQL 고급활용 및 튜닝",
    middleTopic: "Result Cache",
    topic: "Result Cache 적용 조건",
    difficulty: "상급",
    questionType: "캐시 판단형",
    mode: "original",
    sourcePage: 4,
    sourceQuestionNumber: 12,
    parentQuestionId: "new-subject3-q12-result-cache",
    stem: "Result Cache 적용에 가장 부적절한 대상은?",
    choices: [
      ["A", "변경이 거의 없는 코드성 테이블의 반복 조회", "오답이다. 변경이 적고 반복 조회가 많으면 적합할 수 있다."],
      ["B", "DML이 매우 빈번한 OLTP 주문 테이블의 실시간 집계", "정답이다. DML 때마다 캐시 무효화가 빈번해져 효과가 낮거나 경합을 만들 수 있다."],
      ["C", "동일 파라미터로 자주 수행되는 참조성 조회", "오답이다. 반복성이 있으면 캐시 후보가 된다."],
      ["D", "변경 주기가 긴 기준정보 조회", "오답이다. 기준정보는 캐시 친화적이다."]
    ],
    answer: "B",
    relatedConceptId: "tuning-sql-sharing",
    hint: ["Result Cache는 결과 재사용이 목적이다.", "원본 테이블 DML이 발생하면 캐시 무효화가 일어난다.", "변경이 잦은 OLTP 집계를 경계한다."],
    explanation: "Result Cache는 동일 결과를 반복 재사용할 때 유리하지만 대상 테이블에 DML이 자주 발생하면 캐시 무효화와 경합이 잦아진다. 따라서 변경이 잦은 OLTP 테이블의 실시간 집계에는 부적합하다."
  },
  {
    subjectId: "tuning",
    number: 113,
    majorTopic: "SQL 고급활용 및 튜닝",
    middleTopic: "DML 튜닝",
    topic: "Direct Path Insert",
    difficulty: "상급",
    questionType: "DML 튜닝 판단형",
    mode: "original",
    sourcePage: 4,
    sourceQuestionNumber: 13,
    parentQuestionId: "new-subject3-q13-direct-path",
    stem: "Direct Path Insert에 대한 설명으로 가장 부적절한 것은?",
    choices: [
      ["A", "APPEND 힌트로 HWM 위쪽에 직접 블록을 쓰는 경로를 유도할 수 있다.", "오답이다. Direct Path Insert의 핵심 동작이다."],
      ["B", "Buffer Cache 경유를 줄여 대량 입력 성능을 높일 수 있다.", "오답이다. 대량 로딩에서 장점이다."],
      ["C", "NOLOGGING과 결합하면 Redo를 완전히 0으로 만들고 복구 위험도 없다.", "정답이다. Redo가 최소화될 수 있지만 완전한 무위험은 아니며 백업/복구 전략이 필요하다."],
      ["D", "동시 DML 제한이나 세그먼트 잠금 영향을 검토해야 한다.", "오답이다. Direct Path 작업의 운영 고려사항이다."]
    ],
    answer: "C",
    relatedConceptId: "tuning-dml",
    hint: ["Direct Path는 대량 적재를 빠르게 하지만 운영 제약이 있다.", "NOLOGGING은 복구 전략과 함께 봐야 한다.", "완전히 0 또는 무위험이라는 표현을 경계한다."],
    explanation: "Direct Path Insert는 HWM 위쪽에 직접 적재해 Buffer Cache와 일부 Undo/Redo 부담을 줄일 수 있다. 그러나 NOLOGGING은 장애 복구 관점의 위험이 있으므로 작업 후 백업과 LOGGING 원복을 검토해야 한다."
  },
  {
    subjectId: "tuning",
    number: 114,
    majorTopic: "SQL 고급활용 및 튜닝",
    middleTopic: "파티션",
    topic: "Partition Pruning",
    difficulty: "상급",
    questionType: "파티션 판단형",
    mode: "original",
    sourcePage: 4,
    sourceQuestionNumber: 14,
    parentQuestionId: "new-subject3-q14-partition-pruning",
    stem: "월별 Range Partition 테이블에서 Partition Pruning이 실패할 가능성이 가장 큰 조건은?",
    choices: [
      ["A", "sale_date >= DATE '2026-01-01' AND sale_date < DATE '2026-02-01'", "오답이다. 파티션 키에 직접 범위 조건이 주어져 Pruning이 가능하다."],
      ["B", "sale_date BETWEEN DATE '2026-01-01' AND DATE '2026-01-31'", "오답이다. 시간 포함 여부는 주의해야 하지만 파티션 키 직접 조건이다."],
      ["C", "TO_CHAR(sale_date, 'YYYYMM') = '202601'", "정답이다. 파티션 키 컬럼을 함수로 가공해 파티션 범위 판단이 어려워질 수 있다."],
      ["D", "sale_date = DATE '2026-01-15'", "오답이다. 단일 파티션을 특정하기 쉬운 조건이다."]
    ],
    answer: "C",
    relatedConceptId: "tuning-partitioning",
    hint: ["파티션 키 컬럼 좌변에 함수가 있는지 본다.", "직접 범위 조건이 Pruning에 유리하다.", "문자열 변환 조건은 파티션 경계와 바로 연결되기 어렵다."],
    explanation: "파티션 키를 함수로 감싸면 옵티마이저가 파티션 경계를 직접 활용하기 어려워질 수 있다. 날짜 파티션은 날짜 컬럼 자체에 시작일 이상, 다음 시작일 미만 조건을 주는 방식이 안전하다."
  },
  {
    subjectId: "tuning",
    number: 115,
    majorTopic: "SQL 고급활용 및 튜닝",
    middleTopic: "파티션",
    topic: "Local Prefixed Index",
    difficulty: "상급",
    questionType: "인덱스 유형 선택형",
    mode: "original",
    sourcePage: 4,
    sourceQuestionNumber: 15,
    parentQuestionId: "new-subject3-q15-local-index",
    stem: "Range Partition 테이블의 Local Index에 대한 설명으로 가장 적절한 것은?",
    choices: [
      ["A", "Local Prefixed Index는 인덱스 선두 컬럼에 파티션 키가 포함된 형태다.", "정답이다. 로컬 인덱스이면서 파티션 키가 선두에 오면 Prefixed로 분류한다."],
      ["B", "Local Non-Prefixed Index는 파티션 테이블에 생성할 수 없다.", "오답이다. 파티션 키가 선두가 아니거나 포함되지 않아도 로컬 인덱스를 만들 수 있다."],
      ["C", "Global Index는 항상 파티션 단위 관리 비용이 Local Index보다 낮다.", "오답이다. 파티션 drop/truncate 시 Global Index 유지 비용이 커질 수 있다."],
      ["D", "Local Index는 모든 파티션을 하나의 인덱스 세그먼트에 저장한다.", "오답이다. 테이블 파티션과 대응되는 인덱스 파티션으로 관리된다."]
    ],
    answer: "A",
    relatedConceptId: "tuning-partitioning",
    hint: ["Local 여부와 Prefixed 여부를 분리한다.", "Prefixed는 파티션 키가 인덱스 선두에 있는지 본다.", "Global과 Local의 관리 특성을 비교한다."],
    explanation: "Local Index는 테이블 파티션과 인덱스 파티션이 대응된다. Local Prefixed Index는 인덱스 선두 컬럼에 파티션 키가 포함되고, Local Non-Prefixed는 파티션 키가 선두가 아니거나 포함되지 않을 수 있다."
  },
  {
    subjectId: "tuning",
    number: 116,
    majorTopic: "SQL 고급활용 및 튜닝",
    middleTopic: "Window Function",
    topic: "윈도우 프레임",
    difficulty: "상급",
    questionType: "분석 함수 판단형",
    mode: "original",
    sourcePage: 4,
    sourceQuestionNumber: 16,
    parentQuestionId: "new-subject3-q16-window-frame",
    stem: "ROWS BETWEEN 2 PRECEDING AND CURRENT ROW에 대한 설명으로 가장 적절한 것은?",
    choices: [
      ["A", "현재 행을 포함해 물리적으로 직전 2개 행까지 최대 3개 행을 프레임으로 삼는다.", "정답이다. ROWS는 물리 행 수 기준이다."],
      ["B", "현재 행과 값이 같은 모든 행을 자동으로 포함한다.", "오답이다. 이는 RANGE 프레임의 동률 처리와 혼동한 설명이다."],
      ["C", "파티션 전체 행을 항상 포함한다.", "오답이다. 제한된 이동 프레임이다."],
      ["D", "현재 행 이후 2개 행을 포함한다.", "오답이다. PRECEDING은 이전 행 방향이다."]
    ],
    answer: "A",
    relatedConceptId: "sql-window-functions",
    hint: ["ROWS는 물리 행 기준이다.", "2 PRECEDING은 이전 두 행이다.", "CURRENT ROW는 현재 행을 포함한다."],
    explanation: "ROWS BETWEEN 2 PRECEDING AND CURRENT ROW는 정렬된 파티션 내에서 현재 행과 바로 앞 두 행을 대상으로 집계한다. 최대 세 행의 이동 프레임이다."
  },
  {
    subjectId: "tuning",
    number: 117,
    majorTopic: "SQL 고급활용 및 튜닝",
    middleTopic: "GROUPING",
    topic: "CUBE 조합 수",
    difficulty: "중급",
    questionType: "집계 조합 추론형",
    mode: "original",
    sourcePage: 4,
    sourceQuestionNumber: 17,
    parentQuestionId: "new-subject3-q17-cube-combinations",
    stem: "CUBE(a, b, c)가 생성하는 집계 조합 수로 가장 적절한 것은?",
    choices: [
      ["A", "3개", "오답이다. 컬럼 수만큼이 아니라 가능한 모든 조합을 만든다."],
      ["B", "4개", "오답이다. ROLLUP(a,b,c)의 레벨 수와 혼동한 값이다."],
      ["C", "6개", "오답이다. 세 컬럼의 쌍 조합만 세면 부족하다."],
      ["D", "8개", "정답이다. CUBE는 2의 N승 조합을 생성하므로 2^3=8개다."]
    ],
    answer: "D",
    relatedConceptId: "sql-group-functions",
    hint: ["CUBE는 모든 부분집합 조합을 만든다.", "컬럼이 N개면 2의 N승이다.", "세 컬럼이면 8개다."],
    explanation: "CUBE는 지정한 컬럼들의 가능한 모든 집계 조합을 생성한다. a,b,c 세 컬럼이면 (a,b,c), (a,b), (a,c), (b,c), (a), (b), (c), ()의 8개 조합이다."
  },
  {
    subjectId: "tuning",
    number: 118,
    majorTopic: "SQL 고급활용 및 튜닝",
    middleTopic: "대기 이벤트",
    topic: "log file sync",
    difficulty: "상급",
    questionType: "대기 이벤트 판단형",
    mode: "original",
    sourcePage: 5,
    sourceQuestionNumber: 19,
    parentQuestionId: "new-subject3-q19-log-file-sync",
    stem: "log file sync 대기 이벤트에 대한 설명으로 가장 적절한 것은?",
    choices: [
      ["A", "COMMIT 시 Redo Log Buffer 내용을 LGWR가 디스크에 동기화하기를 기다릴 때 발생할 수 있다.", "정답이다. 트랜잭션 확정과 Redo 기록 동기화가 핵심이다."],
      ["B", "인덱스 Range Scan 중 단일 블록을 읽을 때만 발생한다.", "오답이다. 단일 블록 읽기는 db file sequential read와 관련된다."],
      ["C", "정렬 메모리가 부족해 TEMP를 읽을 때만 발생한다.", "오답이다. TEMP I/O와 log file sync는 다르다."],
      ["D", "SQL 파싱 중 라이브러리 캐시 래치를 기다릴 때 발생한다.", "오답이다. 파싱 경합 이벤트와 구분해야 한다."]
    ],
    answer: "A",
    relatedConceptId: "tuning-sql-trace",
    hint: ["log file은 Redo Log를 떠올린다.", "sync는 커밋 동기화와 연결된다.", "인덱스 I/O나 TEMP I/O와 구분한다."],
    explanation: "log file sync는 사용자 세션이 COMMIT 후 LGWR가 Redo를 디스크에 기록 완료하기를 기다리는 상황에서 나타난다. 잦은 커밋, 느린 로그 디스크, LGWR 병목 등을 함께 분석한다."
  },
  {
    subjectId: "tuning",
    number: 119,
    majorTopic: "SQL 고급활용 및 튜닝",
    middleTopic: "SQL Trace",
    topic: "Consistent Read",
    difficulty: "상급",
    questionType: "Trace 분석형",
    mode: "original",
    sourcePage: 5,
    sourceQuestionNumber: 20,
    parentQuestionId: "new-subject3-q20-tkprof-cr",
    stem: "TKPROF 출력에서 query 또는 cr 수치가 의미하는 것으로 가장 적절한 것은?",
    choices: [
      ["A", "Consistent Read 모드로 읽은 논리적 블록 수", "정답이다. query/cr은 논리적 일관 읽기 블록 수를 의미한다."],
      ["B", "디스크에서 직접 읽은 물리 블록 수", "오답이다. 물리 읽기는 disk 또는 pr 수치와 관련된다."],
      ["C", "SQL이 반환한 최종 행 수", "오답이다. 반환 행 수는 rows로 본다."],
      ["D", "파싱 횟수", "오답이다. 파싱 횟수는 parse call과 관련된다."]
    ],
    answer: "A",
    relatedConceptId: "tuning-sql-trace",
    hint: ["query 또는 cr은 논리 읽기다.", "disk/pr과 구분한다.", "rows는 행 수다."],
    explanation: "TKPROF에서 query 또는 cr은 일관 읽기 모드의 논리 블록 읽기 수다. PR이 낮아도 CR이 크면 접근 경로가 비효율적일 수 있다."
  },
  {
    subjectId: "tuning",
    number: 120,
    majorTopic: "SQL 고급활용 및 튜닝",
    middleTopic: "인덱스",
    topic: "Access Predicate와 Filter Predicate",
    difficulty: "최상급",
    questionType: "Predicate 판정형",
    mode: "similar",
    sourcePage: 5,
    sourceQuestionNumber: 28,
    parentQuestionId: "new-subject3-q28-access-filter",
    stem: "다음 실행계획 해석으로 가장 적절한 것은?",
    code: `--------------------------------------------------------------------------------
| Id | Operation                    | Name      | Rows | Cost |
--------------------------------------------------------------------------------
|  0 | SELECT STATEMENT             |           |  100 |  420 |
|  1 |  TABLE ACCESS BY INDEX ROWID | 주문      |  100 |  420 |
|  2 |   INDEX RANGE SCAN           | 주문_X1   | 5000 |   35 |
--------------------------------------------------------------------------------
Predicate Information
2 - access("주문일자">=:B1 AND "주문일자"<:B2)
1 - filter("주문상태"='완료' AND "고객등급"='VIP')`,
    choices: [
      ["A", "주문일자 조건은 인덱스 스캔 범위를 줄이고, 주문상태와 고객등급은 테이블 액세스 후 필터된다.", "정답이다. access와 filter의 역할 차이를 정확히 설명한다."],
      ["B", "모든 Predicate가 인덱스 시작점과 종료점을 결정하므로 테이블 액세스는 100건만 발생한다.", "오답이다. 주문상태와 고객등급은 필터로 처리되어 5000건 ROWID 방문 가능성이 있다."],
      ["C", "filter Predicate는 조건이 적용되지 않는다는 의미다.", "오답이다. 적용은 되지만 읽은 후 걸러낸다는 의미다."],
      ["D", "주문상태와 고객등급을 인덱스에 추가해도 스캔 효율에는 영향을 줄 수 없다.", "오답이다. 결합 인덱스 구성에 따라 Access Predicate로 전환될 수 있다."]
    ],
    answer: "A",
    relatedConceptId: "tuning-explain-plan",
    hint: ["access는 인덱스 탐색 범위를 줄인다.", "filter는 읽은 뒤 조건을 평가한다.", "INDEX RANGE SCAN Rows와 최종 Rows 차이를 본다."],
    explanation: "Access Predicate는 인덱스의 시작점과 종료점을 결정해 스캔 범위를 줄인다. Filter Predicate는 이미 읽은 인덱스나 테이블 행에 조건을 적용한다. 이 계획은 주문일자 범위로 5000건을 읽고 상태와 등급으로 100건을 남기는 구조다."
  }
];
