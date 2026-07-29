export type PdfReviewSubject = "modeling" | "sql-basic" | "tuning";
export type PdfReviewMode = "original" | "variant" | "similar";
export type PdfReviewStatus =
  | "extracted"
  | "review_required"
  | "original_verified"
  | "variant_verified"
  | "similar_verified"
  | "published"
  | "rejected";
export type PdfReviewDifficulty = "기본" | "중급" | "상급" | "최상급";
export type PdfReviewChoiceId = "A" | "B" | "C" | "D";

export type PdfReviewChoice = {
  id: PdfReviewChoiceId;
  text: string;
  explanation: string;
};

export type PdfReviewSource = {
  document: string;
  page: number;
  answerPage?: number;
  questionNumber?: number | string;
  verifiedBy: "page_render_and_answer_key" | "derived_from_verified_original";
  verificationNote: string;
};

export type PdfReviewTable = {
  title?: string;
  headers: string[];
  rows: string[][];
};

export type PdfReviewQuestion = {
  kind: "objective";
  id: string;
  subjectId: PdfReviewSubject;
  subjectName: string;
  majorTopic: string;
  middleTopic: string;
  topic: string;
  difficulty: PdfReviewDifficulty;
  mode: PdfReviewMode;
  status: PdfReviewStatus;
  source: PdfReviewSource;
  stem: string;
  passage?: string;
  code?: string;
  table?: PdfReviewTable;
  choices: PdfReviewChoice[];
  answer: PdfReviewChoiceId | PdfReviewChoiceId[];
  explanation: string;
  relatedConcept: string;
  hints: string[];
  validationNotes: string[];
  variantDesign?: string;
};

export type PdfReviewLab = {
  kind: "lab";
  id: string;
  title: string;
  topic: string;
  difficulty: PdfReviewDifficulty;
  mode: PdfReviewMode;
  status: PdfReviewStatus;
  source: PdfReviewSource;
  scenario: string;
  requirements: string[];
  schemaSql: string;
  sampleData?: PdfReviewTable[];
  currentSql?: string;
  executionPlan?: string;
  traceSummary?: PdfReviewTable;
  answerSql: string;
  acceptedAlternatives: string[];
  rubric: string[];
  explanation: string;
  relatedConcepts: string[];
  hints: string[];
  validationNotes: string[];
};

export type PdfReviewItem = PdfReviewQuestion | PdfReviewLab;

const choiceIds: PdfReviewChoiceId[] = ["A", "B", "C", "D"];

function choices(values: Array<[string, string]>): PdfReviewChoice[] {
  return values.map(([text, explanation], index) => ({
    id: choiceIds[index],
    text,
    explanation
  }));
}

const sqlExam = "SQL-자격검정-실전문제.pdf";
const subject3Full = "sqlp_subject3_full.pdf";

const commonOriginalNote = "PDF 페이지 PNG 렌더와 정답 및 해설 페이지를 직접 대조했다. 사용자 화면에는 출처와 검수 메타데이터를 노출하지 않는다.";

export const pdfReviewQuestions: PdfReviewQuestion[] = [
  {
    kind: "objective",
    id: "pdf-o-1-011",
    subjectId: "modeling",
    subjectName: "1과목",
    majorTopic: "데이터 모델링의 이해",
    middleTopic: "엔터티",
    topic: "엔터티의 특징",
    difficulty: "기본",
    mode: "original",
    status: "original_verified",
    source: {
      document: sqlExam,
      page: 8,
      answerPage: 110,
      questionNumber: 11,
      verifiedBy: "page_render_and_answer_key",
      verificationNote: commonOriginalNote
    },
    stem: "다음 중 엔터티의 일반적인 특징으로 가장 부적절한 것은?",
    choices: choices([
      ["다른 엔터티와의 관계를 가지지 않는다.", "정답입니다. 일반적인 엔터티는 다른 엔터티와 최소 한 개 이상의 관계를 가져야 하며, 공통코드나 통계성 엔터티처럼 예외적인 경우에만 관계가 생략될 수 있습니다."],
      ["유일한 식별자에 의해 식별이 가능해야 한다.", "오답입니다. 엔터티는 유일한 식별자에 의해 인스턴스를 구분할 수 있어야 합니다."],
      ["엔터티는 업무 프로세스에 의해 이용되어야 한다.", "오답입니다. 업무에서 필요하고 관리되는 정보여야 엔터티로 볼 수 있습니다."],
      ["엔터티는 반드시 속성을 포함해야 한다.", "오답입니다. 속성이 없으면 관리할 정보가 없으므로 엔터티로 보기 어렵습니다."]
    ]),
    answer: "A",
    explanation: "엔터티의 중요한 특징 중 하나는 다른 엔터티와 관계를 가져야 한다는 점이다. 다만 공통코드, 통계성 엔터티와 같은 예외는 관계를 생략할 수 있다.",
    relatedConcept: "엔터티의 특징",
    hints: ["엔터티가 업무에서 독립적으로 관리되는 정보인지 확인한다.", "엔터티의 식별자, 속성, 인스턴스, 관계 조건을 하나씩 점검한다.", "관계가 전혀 없다는 표현은 공통코드 같은 예외를 제외하면 일반적인 특징으로 보기 어렵다."],
    validationNotes: ["문항 본문과 보기 4개를 page 8 렌더링 이미지로 확인했다.", "정답 A를 answer page 110의 11번 해설로 확인했다."]
  },
  {
    kind: "objective",
    id: "pdf-o-1-012",
    subjectId: "modeling",
    subjectName: "1과목",
    majorTopic: "데이터 모델링의 이해",
    middleTopic: "엔터티",
    topic: "엔터티 분류",
    difficulty: "기본",
    mode: "original",
    status: "original_verified",
    source: {
      document: sqlExam,
      page: 8,
      answerPage: 110,
      questionNumber: 12,
      verifiedBy: "page_render_and_answer_key",
      verificationNote: commonOriginalNote
    },
    stem: "다음 중 다른 엔터티로부터 주식별자를 상속받지 않고 자신의 고유한 주식별자를 가지며 사원, 부서, 고객, 상품, 자재 등이 예가 될 수 있는 엔터티로 가장 적절한 것은?",
    choices: choices([
      ["기본 엔터티(키엔터티)", "정답입니다. 기본 엔터티는 업무에 원래 존재하고 독립적으로 생성되며 타 엔터티의 부모 역할을 할 수 있습니다."],
      ["중심 엔터티(메인엔터티)", "오답입니다. 중심 엔터티는 업무의 중심이 되는 정보이지만, 지문의 '주식별자를 상속받지 않음'과 '독립 생성' 설명은 기본 엔터티의 정의입니다."],
      ["행위 엔터티", "오답입니다. 행위 엔터티는 두 개 이상의 부모 엔터티로부터 발생하거나 업무 행위 결과로 생기는 경우가 많습니다."],
      ["개념 엔터티", "오답입니다. 개념 엔터티는 유형 분류상 용어로 쓰일 수 있지만, 지문이 묻는 대표 분류는 기본 엔터티입니다."]
    ]),
    answer: "A",
    explanation: "기본엔터티는 그 업무에 원래 존재하는 정보로서 다른 엔터티와의 관계에 의해 생성되지 않고, 자신의 고유한 주식별자를 가진다.",
    relatedConcept: "기본 엔터티와 행위 엔터티",
    hints: ["사원, 부서, 고객처럼 업무에 원래 존재하는 정보인지 본다.", "다른 엔터티의 주식별자를 상속받는지 여부를 확인한다.", "독립 생성과 부모 역할은 기본 엔터티의 대표 신호다."],
    validationNotes: ["page 8의 12번 문항과 보기 4개를 이미지로 확인했다.", "정답 A와 해설을 answer page 110에서 대조했다."]
  },
  {
    kind: "objective",
    id: "pdf-o-1-013",
    subjectId: "modeling",
    subjectName: "1과목",
    majorTopic: "데이터 모델링의 이해",
    middleTopic: "엔터티",
    topic: "엔터티 명명",
    difficulty: "기본",
    mode: "original",
    status: "original_verified",
    source: {
      document: sqlExam,
      page: 8,
      answerPage: 110,
      questionNumber: 13,
      verifiedBy: "page_render_and_answer_key",
      verificationNote: commonOriginalNote
    },
    stem: "다음 중 엔터티의 이름을 부여하는 방법으로서 가장 부적절한 것은?",
    choices: choices([
      ["가능하면 약어를 사용하여 엔터티의 이름을 간결하고 명확하게 한다.", "정답입니다. 엔터티 이름은 가능하면 약어를 사용하지 않고 현업 업무 용어를 사용해야 합니다."],
      ["현업의 업무 용어를 사용하여 업무상의 의미를 분명하게 한다.", "오답입니다. 현업 용어 사용은 엔터티 명명 기준에 맞습니다."],
      ["모든 엔터티에서 유일한 이름이 부여되어야 한다.", "오답입니다. 같은 모델 내에서 엔터티 이름은 유일해야 혼선을 줄일 수 있습니다."],
      ["엔터티가 생성되는 의미대로 자연스럽게 부여하도록 한다.", "오답입니다. 생성 의미를 반영하는 이름은 적절한 명명 기준입니다."]
    ]),
    answer: "A",
    explanation: "엔터티 명명 기준은 현업 업무 용어 사용, 약어 사용 지양, 단수명사 사용, 전체 엔터티 내 유일성, 생성 의미 반영이다.",
    relatedConcept: "엔터티 명명 규칙",
    hints: ["명칭 문제는 현업 용어, 약어 지양, 단수명사, 유일성을 확인한다.", "간결함보다 의미 명확성이 우선이다.", "약어 사용을 권장하는 보기는 명명 기준과 어긋난다."],
    validationNotes: ["page 8의 13번 문항을 렌더 이미지로 확인했다.", "answer page 110에서 정답 A를 확인했다."]
  },
  {
    kind: "objective",
    id: "pdf-o-1-016",
    subjectId: "modeling",
    subjectName: "1과목",
    majorTopic: "데이터 모델링의 이해",
    middleTopic: "속성",
    topic: "속성의 분류",
    difficulty: "중급",
    mode: "original",
    status: "original_verified",
    source: {
      document: sqlExam,
      page: 9,
      answerPage: 111,
      questionNumber: 16,
      verifiedBy: "page_render_and_answer_key",
      verificationNote: commonOriginalNote
    },
    stem: "다음 중 아래와 같은 사례에서 속성에 대한 설명으로 가장 부적절한 것은?",
    passage: "우리은행은 예금분류(일반예금, 특별예금 등)의 원금, 예치기간, 이자율을 관리할 필요가 있다. 또한 원금에 대한 이자율을 적용하여 계산된 이자에 대해서도 속성으로 관리하고자 한다.",
    choices: choices([
      ["일반예금은 코드 엔터티를 별도로 구분하고 값에는 코드값만 포함한다.", "오답입니다. 예금분류를 코드화하여 관리하는 설명으로 볼 수 있습니다."],
      ["원금, 예치기간은 기본(BASIC)속성이다.", "오답입니다. 원금과 예치기간은 업무에서 원래 관리해야 하는 기본 속성입니다."],
      ["이자와 이자율은 파생(DERIVED)속성이다.", "정답입니다. 이자는 계산된 값이므로 파생 속성이지만, 이자율은 정의되어 관리되는 값이므로 기본 속성입니다."],
      ["예금분류는 설계(DESIGNED)속성이다.", "오답입니다. 예금분류 코드를 설계 속성 관점에서 볼 수 있습니다."]
    ]),
    answer: "C",
    explanation: "이자는 계산된 값으로 파생속성이 맞지만, 이자율은 원래 가지고 있어야 하는 속성이므로 기본속성에 해당한다.",
    relatedConcept: "기본 속성, 설계 속성, 파생 속성",
    hints: ["계산해서 생기는 값인지, 업무에서 원래 관리하는 값인지 구분한다.", "이자와 이자율을 같은 종류로 묶으면 함정에 걸린다.", "이자는 계산 결과이고 이자율은 정의 값이다."],
    validationNotes: ["page 9의 16번 사례와 보기 4개를 이미지로 확인했다.", "answer page 111에서 정답 C와 해설을 확인했다."]
  },
  {
    kind: "objective",
    id: "pdf-o-1-018",
    subjectId: "modeling",
    subjectName: "1과목",
    majorTopic: "데이터 모델링의 이해",
    middleTopic: "속성",
    topic: "도메인",
    difficulty: "기본",
    mode: "original",
    status: "original_verified",
    source: {
      document: sqlExam,
      page: 9,
      answerPage: 111,
      questionNumber: 18,
      verifiedBy: "page_render_and_answer_key",
      verificationNote: commonOriginalNote
    },
    stem: "다음 중 아래 설명이 나타내는 데이터모델의 개념으로 가장 적절한 것은?",
    passage: "주문이라는 엔터티가 있을 때 단가라는 속성 값의 범위는 100에서 10,000 사이의 실수 값이며 제품명이라는 속성은 길이가 20자리 이내의 문자열로 정의할 수 있다.",
    choices: choices([
      ["시스템카탈로그(System Catalog)", "오답입니다. 시스템카탈로그는 DBMS가 객체 정보를 관리하는 메타데이터 영역입니다."],
      ["용어사전(Word Dictionary)", "오답입니다. 용어사전은 표준 용어와 정의를 관리하는 자료입니다."],
      ["속성사전(Attribute Dictionary)", "오답입니다. 속성사전은 속성 자체의 정의와 표준을 관리하지만, 값의 허용 범위 개념은 도메인입니다."],
      ["도메인(Domain)", "정답입니다. 도메인은 속성이 가질 수 있는 값의 범위와 제약을 정의합니다."]
    ]),
    answer: "D",
    explanation: "각 엔터티의 속성에 어떤 유형의 값이 들어가는지를 정의하는 개념은 도메인에 해당한다.",
    relatedConcept: "도메인과 속성의 값 범위",
    hints: ["속성의 명칭이 아니라 속성 값의 허용 범위를 묻고 있다.", "길이, 숫자 범위, 형식은 도메인의 단서다.", "값의 범위를 정의하는 데이터 모델링 개념을 선택한다."],
    validationNotes: ["page 9의 18번 문항과 보기를 확인했다.", "answer page 111에서 정답 D를 확인했다."]
  },
  {
    kind: "objective",
    id: "pdf-v-1-entity-exception",
    subjectId: "modeling",
    subjectName: "1과목",
    majorTopic: "데이터 모델링의 이해",
    middleTopic: "엔터티",
    topic: "엔터티 예외 관계",
    difficulty: "중급",
    mode: "variant",
    status: "variant_verified",
    source: {
      document: sqlExam,
      page: 8,
      answerPage: 110,
      questionNumber: 11,
      verifiedBy: "derived_from_verified_original",
      verificationNote: "11번 엔터티 특징 문항에서 공통코드 예외와 일반 엔터티 조건을 분리해 새 조건으로 검수했다."
    },
    stem: "상품 주문 시스템을 모델링할 때 다음 엔터티 후보 중 일반적인 엔터티 성립 조건을 가장 명확하게 만족하지 못하는 것은?",
    choices: choices([
      ["주문", "오답입니다. 주문은 주문번호로 식별되고 주문일시, 금액 등 속성을 가지며 업무 프로세스에서 사용됩니다."],
      ["상품", "오답입니다. 상품은 상품코드로 식별되고 여러 주문과 관계를 맺는 대표 엔터티입니다."],
      ["배송상태코드", "오답입니다. 코드 엔터티는 관계가 생략될 수 있는 예외가 있으나, 값 집합과 코드명을 관리한다면 엔터티가 될 수 있습니다."],
      ["월별주문합계금액", "정답입니다. 단순 집계 결과를 원천 관리 대상처럼 두면 식별자, 생명주기, 관계가 모호하며 파생 데이터일 가능성이 큽니다."]
    ]),
    answer: "D",
    explanation: "엔터티는 업무에서 관리해야 하는 인스턴스 집합과 속성, 식별자, 관계가 있어야 한다. 집계 결과는 성능 목적의 반정규화 대상일 수는 있지만 원천 엔터티 후보로 바로 확정하면 안 된다.",
    relatedConcept: "엔터티 후보와 파생 데이터",
    hints: ["업무에서 원천으로 관리하는 정보인지 확인한다.", "코드성 정보는 관계 예외가 있을 수 있음을 고려한다.", "집계 결과를 원천 엔터티로 착각하는 보기가 핵심 함정이다."],
    validationNotes: ["원본 11번의 엔터티 일반 조건을 유지하되 후보 유형, 업무 상황, 정답 논리를 새로 구성했다.", "단순 명칭 또는 숫자 변경이 아니라 파생 데이터 판단을 추가했다."],
    variantDesign: "일반 엔터티 조건 + 코드 엔터티 예외 + 파생 집계 데이터 판단을 결합했다."
  },
  {
    kind: "objective",
    id: "pdf-v-1-attribute-classification",
    subjectId: "modeling",
    subjectName: "1과목",
    majorTopic: "데이터 모델링의 이해",
    middleTopic: "속성",
    topic: "파생 속성 판단",
    difficulty: "중급",
    mode: "variant",
    status: "variant_verified",
    source: {
      document: sqlExam,
      page: 9,
      answerPage: 111,
      questionNumber: 16,
      verifiedBy: "derived_from_verified_original",
      verificationNote: "16번의 기본/설계/파생 속성 구분을 보험 계약 업무로 재구성했다."
    },
    stem: "보험계약 엔터티에서 납입원금, 약정이율, 만기예정이자, 상품분류코드를 관리한다. 다음 설명 중 가장 부적절한 것은?",
    choices: choices([
      ["납입원금은 업무에서 직접 관리되는 기본 속성으로 볼 수 있다.", "오답입니다. 납입원금은 계약 업무에서 직접 입력되고 관리되는 값입니다."],
      ["약정이율은 만기예정이자를 계산하는 데 사용되므로 파생 속성이다.", "정답입니다. 약정이율은 계산식의 입력값이지 계산 결과가 아니므로 기본 속성으로 보는 것이 적절합니다."],
      ["만기예정이자는 납입원금과 약정이율을 이용해 계산되는 파생 속성으로 볼 수 있다.", "오답입니다. 계산 결과로 관리되는 값이므로 파생 속성 판단이 가능합니다."],
      ["상품분류코드는 업무 규칙을 코드화하기 위해 설계된 속성으로 볼 수 있다.", "오답입니다. 분류를 코드로 관리하기 위한 설계 속성 설명입니다."]
    ]),
    answer: "B",
    explanation: "파생 속성은 다른 속성으로 계산되거나 변형되어 생성되는 값이다. 계산에 사용되는 비율이나 기준값까지 파생 속성으로 분류하면 안 된다.",
    relatedConcept: "속성 분류와 파생 속성",
    hints: ["계산 결과와 계산 입력값을 구분한다.", "이율, 비율, 단가처럼 정의되어 관리되는 값은 보통 기본 속성이다.", "파생 속성 여부는 '다른 속성으로부터 만들어졌는가'로 판단한다."],
    validationNotes: ["원본 16번의 함정인 이자와 이자율 구분을 유지하되 업무 시나리오와 선택지 논리를 새로 작성했다."],
    variantDesign: "속성명과 업무 영역을 바꾸고 계산 입력값/결과값 구분을 다시 계산하게 했다."
  },
  {
    kind: "objective",
    id: "pdf-v-1-domain-vs-dictionary",
    subjectId: "modeling",
    subjectName: "1과목",
    majorTopic: "데이터 모델링의 이해",
    middleTopic: "속성",
    topic: "도메인과 표준화",
    difficulty: "중급",
    mode: "variant",
    status: "variant_verified",
    source: {
      document: sqlExam,
      page: 9,
      answerPage: 111,
      questionNumber: 18,
      verifiedBy: "derived_from_verified_original",
      verificationNote: "18번 도메인 문항에서 값 범위와 용어 표준의 차이를 새 예시로 검수했다."
    },
    stem: "고객등급 속성은 A, B, C, D 중 하나만 허용하고, 생년월일 속성은 YYYYMMDD 형식의 8자리 문자로만 저장하도록 정의했다. 이 설명과 가장 가까운 데이터 모델링 개념은?",
    choices: choices([
      ["도메인", "정답입니다. 속성이 가질 수 있는 값의 범위, 형식, 길이 등을 정의하는 개념입니다."],
      ["관계차수", "오답입니다. 관계차수는 엔터티 간 인스턴스 참여 수를 표현합니다."],
      ["식별자", "오답입니다. 식별자는 인스턴스를 유일하게 구분하는 속성 또는 속성 집합입니다."],
      ["용어사전", "오답입니다. 용어사전은 표준 용어를 관리하지만 값의 허용 범위를 직접 뜻하지는 않습니다."]
    ]),
    answer: "A",
    explanation: "속성의 허용 값, 길이, 형식은 도메인으로 정의한다. 용어사전이나 속성사전은 표준화 산출물이지만 값 범위 자체를 묻는 답은 도메인이다.",
    relatedConcept: "도메인",
    hints: ["값의 후보와 형식을 제한하는지 본다.", "용어 명칭 관리인지 값 범위 관리인지 구분한다.", "A, B, C, D처럼 허용값 집합이 나오면 도메인을 떠올린다."],
    validationNotes: ["원본 18번의 값 범위 판단을 다른 속성 유형으로 재구성했다."],
    variantDesign: "수치 범위에서 코드 집합과 날짜 형식 제한으로 조건을 바꿨다."
  },
  {
    kind: "objective",
    id: "pdf-s-1-identifier-relationship",
    subjectId: "modeling",
    subjectName: "1과목",
    majorTopic: "데이터 모델과 성능",
    middleTopic: "식별자와 관계",
    topic: "식별 관계와 생명주기",
    difficulty: "상급",
    mode: "similar",
    status: "similar_verified",
    source: {
      document: sqlExam,
      page: 10,
      answerPage: 111,
      questionNumber: 29,
      verifiedBy: "derived_from_verified_original",
      verificationNote: "식별/비식별 관계 선택 기준 문항의 평가 목표를 유지하고 새로운 계약-청구 업무로 구성했다."
    },
    stem: "보험계약과 보험료청구를 모델링한다. 보험료청구는 반드시 하나의 보험계약에 속하고, 계약이 삭제될 때 독립적으로 보존할 업무 요구가 없다. 청구번호는 계약 내에서만 유일하다. 가장 적절한 설계 판단은?",
    choices: choices([
      ["보험료청구의 주식별자에 계약번호를 포함하는 식별 관계를 우선 검토한다.", "정답입니다. 자식의 생명주기가 부모에 종속되고 자식 식별자가 부모 식별자에 의존하므로 식별 관계가 자연스럽습니다."],
      ["SQL 문장이 길어질 수 있으므로 항상 비식별 관계로 전환한다.", "오답입니다. SQL 편의만으로 식별 관계를 회피하면 업무 식별성과 생명주기 표현이 깨질 수 있습니다."],
      ["계약번호는 외래키로도 두지 않고 청구번호만 전사적으로 유일하게 만든다.", "오답입니다. 청구가 계약에 반드시 속한다는 업무 규칙을 약화합니다."],
      ["청구는 계약과 독립적으로 생성될 수 있으므로 선택 관계로 둔다.", "오답입니다. 지문에서 청구는 반드시 계약에 속한다고 제시했습니다."]
    ]),
    answer: "A",
    explanation: "식별 관계는 자식 엔터티의 주식별자에 부모 주식별자를 포함해 부모-자식 생명주기와 식별 의존성을 표현한다. 단순 SQL 복잡도만으로 비식별 관계를 선택하는 것은 위험하다.",
    relatedConcept: "식별 관계와 비식별 관계",
    hints: ["자식 인스턴스가 부모 없이 존재할 수 있는지 확인한다.", "자식의 식별자가 부모 식별자에 의존하는지 본다.", "SQL 길이보다 생명주기와 식별 의존성이 먼저다."],
    validationNotes: ["원본의 식별 관계 판단 함정을 독립 업무 시나리오로 새로 작성했다.", "관계 구조와 정답 논리가 원본 답 암기만으로 풀리지 않게 변경됐다."],
    variantDesign: "관계 유형, 생명주기, 식별자 범위를 새 업무 조건으로 바꿨다."
  },
  {
    kind: "objective",
    id: "pdf-s-1-normalization-performance",
    subjectId: "modeling",
    subjectName: "1과목",
    majorTopic: "데이터 모델과 성능",
    middleTopic: "정규화",
    topic: "반복 속성과 1정규화",
    difficulty: "상급",
    mode: "similar",
    status: "similar_verified",
    source: {
      document: sqlExam,
      page: 112,
      answerPage: 112,
      questionNumber: 37,
      verifiedBy: "derived_from_verified_original",
      verificationNote: "반복 속성의 1정규화와 OR 조건 성능 저하 출제 의도를 신규 주문 할인 업무로 재구성했다."
    },
    stem: "주문 테이블에 할인쿠폰1, 할인쿠폰2, 할인쿠폰3 컬럼을 두고 세 컬럼 중 하나라도 특정 쿠폰코드와 일치하는 주문을 자주 조회한다. 데이터 증가 후 OR 조건과 인덱스 관리 비용이 함께 문제가 되고 있다. 가장 적절한 개선 방향은?",
    choices: choices([
      ["세 쿠폰 컬럼에 각각 인덱스를 추가하고 기존 모델을 유지한다.", "오답입니다. 모든 반복 컬럼에 인덱스를 만들면 DML 비용이 커지고 OR 조건의 전체 스캔 위험도 남습니다."],
      ["할인쿠폰1 컬럼만 대표로 사용하고 나머지 쿠폰은 문자열로 합쳐 저장한다.", "오답입니다. 원자성과 검색 가능성을 더 악화시킵니다."],
      ["주문쿠폰 엔터티를 분리해 주문과 쿠폰 발생을 1:M으로 모델링한다.", "정답입니다. 반복 속성을 행으로 분리하면 1정규형을 만족하고 쿠폰코드 조건 인덱스 설계도 명확해집니다."],
      ["조회 SQL에서 OR 대신 LIKE를 사용해 조건을 단순화한다.", "오답입니다. LIKE는 모델의 반복 구조 문제를 해결하지 못하고 오히려 인덱스 효율을 떨어뜨릴 수 있습니다."]
    ]),
    answer: "C",
    explanation: "반복 속성은 1정규화 대상이다. 행으로 분리하면 검색 조건과 인덱스 설계가 단순해지고, 반복 컬럼별 인덱스와 OR 조건으로 인한 성능 저하를 줄일 수 있다.",
    relatedConcept: "1정규화와 반복 속성 제거",
    hints: ["컬럼이 같은 의미로 반복되는지 확인한다.", "OR 조건이 왜 인덱스 설계를 어렵게 하는지 생각한다.", "반복 컬럼을 행으로 분리하는 1:M 모델이 핵심이다."],
    validationNotes: ["원본 반복 속성 성능 문항과 같은 평가 목표를 유지하되 업무, 컬럼, 조회 조건을 새로 작성했다."],
    variantDesign: "원본의 반복 속성 모델을 주문-쿠폰 업무로 독립 재구성했다."
  },
  {
    kind: "objective",
    id: "pdf-o-2-001",
    subjectId: "sql-basic",
    subjectName: "2과목",
    majorTopic: "SQL 기본",
    middleTopic: "SQL 문장 종류",
    topic: "DCL",
    difficulty: "기본",
    mode: "original",
    status: "original_verified",
    source: {
      document: sqlExam,
      page: 22,
      answerPage: 114,
      questionNumber: 1,
      verifiedBy: "page_render_and_answer_key",
      verificationNote: commonOriginalNote
    },
    stem: "다음 중 데이터 제어어(DCL)에 해당하는 명령어는?",
    choices: choices([
      ["INSERT", "오답입니다. INSERT는 DML입니다."],
      ["RENAME", "오답입니다. RENAME은 DDL에 속합니다."],
      ["COMMIT", "오답입니다. COMMIT은 TCL입니다."],
      ["REVOKE", "정답입니다. REVOKE는 권한을 회수하는 DCL 명령어입니다."]
    ]),
    answer: "D",
    explanation: "데이터 제어어는 데이터베이스에 접근하고 객체를 사용할 권한을 부여하거나 회수하는 명령어이며 GRANT, REVOKE가 있다.",
    relatedConcept: "DDL, DML, DCL, TCL 구분",
    hints: ["권한 부여와 회수에 관련된 명령어인지 본다.", "INSERT는 데이터 조작, COMMIT은 트랜잭션 제어다.", "권한 회수 명령어가 DCL이다."],
    validationNotes: ["page 22 렌더링 이미지에서 문항과 선택지를 확인했다.", "answer page 114에서 정답 D와 해설을 확인했다."]
  },
  {
    kind: "objective",
    id: "pdf-o-2-002",
    subjectId: "sql-basic",
    subjectName: "2과목",
    majorTopic: "SQL 기본",
    middleTopic: "SQL 문장 종류",
    topic: "DDL",
    difficulty: "기본",
    mode: "original",
    status: "original_verified",
    source: {
      document: sqlExam,
      page: 22,
      answerPage: 114,
      questionNumber: 2,
      verifiedBy: "page_render_and_answer_key",
      verificationNote: commonOriginalNote
    },
    stem: "다음 중 아래 내용의 범주에 해당하는 SQL 명령어로 옳지 않은 것은?",
    passage: "테이블의 구조를 생성, 변경, 삭제하는 등 데이터 구조를 정의하는 데 사용되는 명령어이다.",
    choices: choices([
      ["CREATE", "오답입니다. CREATE는 데이터 구조를 생성하는 DDL입니다."],
      ["GRANT", "정답입니다. GRANT는 권한을 부여하는 DCL이며 DDL이 아닙니다."],
      ["ALTER", "오답입니다. ALTER는 데이터 구조를 변경하는 DDL입니다."],
      ["DROP", "오답입니다. DROP은 데이터 구조를 삭제하는 DDL입니다."]
    ]),
    answer: "B",
    explanation: "데이터 구조를 정의하는 명령어는 DDL이며 CREATE, ALTER, DROP, RENAME 등이 있다. GRANT는 DCL이다.",
    relatedConcept: "DDL과 DCL",
    hints: ["지문은 데이터 구조 정의 범주를 설명한다.", "테이블 생성, 변경, 삭제 명령어를 먼저 제외한다.", "권한 부여 명령어는 데이터 구조 정의가 아니다."],
    validationNotes: ["page 22의 2번 문항과 선택지를 확인했다.", "answer page 114에서 정답 B를 확인했다."]
  },
  {
    kind: "objective",
    id: "pdf-o-2-008",
    subjectId: "sql-basic",
    subjectName: "2과목",
    majorTopic: "SQL 기본",
    middleTopic: "WHERE 절",
    topic: "NULL",
    difficulty: "기본",
    mode: "original",
    status: "original_verified",
    source: {
      document: sqlExam,
      page: 24,
      answerPage: 115,
      questionNumber: 8,
      verifiedBy: "page_render_and_answer_key",
      verificationNote: commonOriginalNote
    },
    stem: "다음 중 NULL의 설명으로 가장 부적절한 것은?",
    choices: choices([
      ["모르는 값을 의미한다.", "오답입니다. NULL은 아직 정의되지 않았거나 알 수 없는 값을 의미할 수 있습니다."],
      ["값의 부재를 의미한다.", "오답입니다. NULL은 값이 존재하지 않음을 나타낼 수 있습니다."],
      ["공백문자(Empty String) 혹은 숫자 0을 의미한다.", "정답입니다. NULL은 공백 문자열이나 숫자 0과 동일하지 않습니다."],
      ["NULL과의 모든 비교(IS NULL 제외)는 알 수 없음(Unknown)을 반환한다.", "오답입니다. 일반 비교에서 NULL은 UNKNOWN을 만들 수 있습니다."]
    ]),
    answer: "C",
    explanation: "NULL은 공백문자나 숫자 0과 동일하지 않다.",
    relatedConcept: "NULL과 3값 논리",
    hints: ["NULL을 0이나 빈 문자열과 같은 값으로 보면 안 된다.", "일반 비교와 IS NULL 비교를 구분한다.", "NULL은 값 자체라기보다 미정 또는 부재 상태다."],
    validationNotes: ["page 24의 8번 문항을 이미지로 확인했다.", "answer page 115에서 정답 C를 확인했다."]
  },
  {
    kind: "objective",
    id: "pdf-o-2-010",
    subjectId: "sql-basic",
    subjectName: "2과목",
    majorTopic: "SQL 기본",
    middleTopic: "DDL",
    topic: "제약조건",
    difficulty: "기본",
    mode: "original",
    status: "original_verified",
    source: {
      document: sqlExam,
      page: 24,
      answerPage: 115,
      questionNumber: 10,
      verifiedBy: "page_render_and_answer_key",
      verificationNote: commonOriginalNote
    },
    stem: "다음 중 테이블 생성시 컬럼별 생성할 수 있는 제약조건(Constraints)에 대한 설명으로 가장 부적절한 것은?",
    choices: choices([
      ["UNIQUE: 테이블 내에서 중복되는 값이 없으며 NULL 입력이 불가능하다.", "정답입니다. UNIQUE는 중복을 허용하지 않지만 NULL 입력은 가능할 수 있습니다."],
      ["PK: 주키로 테이블당 1개만 생성이 가능하다.", "오답입니다. 한 테이블에는 하나의 기본키 제약조건만 둘 수 있습니다."],
      ["FK: 외래키로 테이블당 여러 개 생성이 가능하다.", "오답입니다. 외래키 제약조건은 여러 개 둘 수 있습니다."],
      ["NOT NULL: 명시적으로 NULL 입력을 방지한다.", "오답입니다. NOT NULL은 NULL 입력을 막는 제약조건입니다."]
    ]),
    answer: "A",
    explanation: "PK는 UNIQUE와 NOT NULL 성질을 가지지만, UNIQUE 제약조건의 모든 컬럼은 NULL 값을 가질 수도 있다.",
    relatedConcept: "PK, UNIQUE, FK, NOT NULL",
    hints: ["PK와 UNIQUE를 구분한다.", "UNIQUE가 중복을 막는다는 점과 NULL 허용 여부를 따로 본다.", "NULL 입력 불가능은 PK와 NOT NULL의 성격이다."],
    validationNotes: ["page 24의 10번 문항과 선택지를 확인했다.", "answer page 115의 10번 해설로 정답 A를 확인했다."]
  },
  {
    kind: "objective",
    id: "pdf-o-2-011",
    subjectId: "sql-basic",
    subjectName: "2과목",
    majorTopic: "SQL 기본",
    middleTopic: "DDL",
    topic: "테이블명 규칙",
    difficulty: "기본",
    mode: "original",
    status: "original_verified",
    source: {
      document: sqlExam,
      page: 25,
      answerPage: 115,
      questionNumber: 11,
      verifiedBy: "page_render_and_answer_key",
      verificationNote: commonOriginalNote
    },
    stem: "다음 중 물리적 테이블 명으로 가장 적절한 것은?",
    choices: choices([
      ["EMP_10", "정답입니다. 문자로 시작하고 허용 가능한 문자 조합을 사용합니다."],
      ["100-EMP", "오답입니다. 숫자로 시작하고 하이픈을 포함합니다."],
      ["EMP-100", "오답입니다. 하이픈은 일반적인 테이블명 문자로 적절하지 않습니다."],
      ["100_EMP", "오답입니다. 테이블명은 반드시 문자로 시작해야 합니다."]
    ]),
    answer: "A",
    explanation: "테이블명과 컬럼명은 반드시 문자로 시작해야 하며, 허용 문자 규칙을 따라야 한다.",
    relatedConcept: "객체명 작성 규칙",
    hints: ["이름의 첫 글자를 확인한다.", "하이픈처럼 식별자 규칙에 맞지 않는 문자가 있는지 본다.", "문자로 시작하고 허용 문자만 쓰는 선택지를 고른다."],
    validationNotes: ["page 25의 11번 문항을 이미지로 확인했다.", "answer page 115의 11번 해설과 대조했다."]
  },
  {
    kind: "objective",
    id: "pdf-v-2-null-not-in",
    subjectId: "sql-basic",
    subjectName: "2과목",
    majorTopic: "SQL 기본",
    middleTopic: "WHERE 절",
    topic: "NULL 비교",
    difficulty: "중급",
    mode: "variant",
    status: "variant_verified",
    source: {
      document: sqlExam,
      page: 24,
      answerPage: 115,
      questionNumber: 8,
      verifiedBy: "derived_from_verified_original",
      verificationNote: "NULL의 의미와 비교 결과를 NOT IN 조건으로 확장해 검수했다."
    },
    stem: "아래 SQL의 결과로 가장 적절한 것은?",
    code: `SELECT COUNT(*) AS CNT
FROM (SELECT 1 AS C FROM DUAL UNION ALL
      SELECT 2 FROM DUAL UNION ALL
      SELECT NULL FROM DUAL)
WHERE C NOT IN (2, NULL);`,
    choices: choices([
      ["0", "정답입니다. NOT IN 목록에 NULL이 포함되면 비교 결과가 UNKNOWN이 되어 TRUE로 통과하는 행이 없습니다."],
      ["1", "오답입니다. C=1이 2와 다르다는 점만 보고 NULL 비교를 놓친 판단입니다."],
      ["2", "오답입니다. NULL 행까지 통과한다고 보면 SQL의 UNKNOWN 처리를 놓친 것입니다."],
      ["3", "오답입니다. WHERE 조건이 모든 행을 통과시키지 않습니다."]
    ]),
    answer: "A",
    explanation: "NULL이 포함된 비교는 UNKNOWN을 만들 수 있다. NOT IN 내부에 NULL이 있으면 각 행이 조건을 TRUE로 만족한다고 확정할 수 없으므로 결과 건수는 0이다.",
    relatedConcept: "NULL과 NOT IN",
    hints: ["NOT IN은 여러 개의 <> 비교와 AND 결합처럼 해석될 수 있다.", "목록 안의 NULL이 모든 비교 결과에 영향을 준다.", "WHERE는 TRUE만 통과시키고 UNKNOWN은 통과시키지 않는다."],
    validationNotes: ["원본 NULL 개념을 유지하되 SQL 결과 추론형으로 변경했다.", "Oracle DUAL 기준 문법과 결과를 수작업 검증했다."],
    variantDesign: "단순 설명형을 SQL 결과형으로 바꾸고 NULL 목록 조건을 추가했다."
  },
  {
    kind: "objective",
    id: "pdf-v-2-constraint-composite",
    subjectId: "sql-basic",
    subjectName: "2과목",
    majorTopic: "SQL 기본",
    middleTopic: "DDL",
    topic: "제약조건",
    difficulty: "중급",
    mode: "variant",
    status: "variant_verified",
    source: {
      document: sqlExam,
      page: 24,
      answerPage: 115,
      questionNumber: 10,
      verifiedBy: "derived_from_verified_original",
      verificationNote: "PK/UNIQUE/FK/NOT NULL 구분 문항을 복합키와 NULL 허용 조건으로 재구성했다."
    },
    stem: "다음 중 제약조건에 대한 설명으로 가장 적절하지 않은 것은?",
    choices: choices([
      ["복합 기본키는 여러 컬럼으로 구성될 수 있지만 테이블의 기본키 제약조건은 하나로 정의된다.", "오답입니다. 기본키는 여러 컬럼으로 구성될 수 있습니다."],
      ["UNIQUE 제약조건은 중복을 제한하지만 DBMS와 컬럼 구성에 따라 NULL을 허용할 수 있다.", "오답입니다. UNIQUE와 NOT NULL은 같은 의미가 아닙니다."],
      ["외래키는 반드시 참조하는 부모 테이블의 기본키와 같은 컬럼명이어야 한다.", "정답입니다. 외래키 컬럼명은 부모 키 컬럼명과 같을 필요가 없고 참조 관계와 데이터 타입 정합성이 중요합니다."],
      ["NOT NULL은 해당 컬럼에 NULL이 저장되지 않도록 제한한다.", "오답입니다. NOT NULL의 기본 역할입니다."]
    ]),
    answer: "C",
    explanation: "외래키는 참조 대상 키와 관계를 맺는 제약조건이며, 컬럼명이 반드시 동일해야 하는 것은 아니다. 컬럼명 동일 여부와 참조 무결성은 별개의 문제다.",
    relatedConcept: "참조 무결성과 제약조건",
    hints: ["컬럼명 규칙과 참조 무결성 규칙을 구분한다.", "PK가 복합 컬럼일 수 있다는 점을 떠올린다.", "외래키는 이름보다 참조 대상과 값의 정합성이 중요하다."],
    validationNotes: ["원본 10번의 제약조건 구분을 새로운 오답 포인트로 확장했다."],
    variantDesign: "UNIQUE NULL 함정을 유지하되 FK 컬럼명 함정을 추가했다."
  },
  {
    kind: "objective",
    id: "pdf-v-2-object-name",
    subjectId: "sql-basic",
    subjectName: "2과목",
    majorTopic: "SQL 기본",
    middleTopic: "DDL",
    topic: "객체명",
    difficulty: "기본",
    mode: "variant",
    status: "variant_verified",
    source: {
      document: sqlExam,
      page: 25,
      answerPage: 115,
      questionNumber: 11,
      verifiedBy: "derived_from_verified_original",
      verificationNote: "물리 테이블명 규칙 문항을 인덱스명과 컬럼명 후보로 확장했다."
    },
    stem: "Oracle 기준으로 별도 인용부호를 사용하지 않는 객체명 후보 중 가장 적절한 것은?",
    choices: choices([
      ["ORDER-2026", "오답입니다. 하이픈은 일반 식별자에 적절하지 않습니다."],
      ["2026_ORDER", "오답입니다. 숫자로 시작합니다."],
      ["ORDER_DETAIL", "정답입니다. 문자로 시작하고 일반적인 허용 문자 조합을 사용합니다."],
      ["ORDER DETAIL", "오답입니다. 공백을 포함합니다."]
    ]),
    answer: "C",
    explanation: "일반 식별자는 문자로 시작하고 허용 문자만 사용해야 한다. 하이픈, 공백, 숫자 시작은 부적절하다.",
    relatedConcept: "SQL 객체명 규칙",
    hints: ["인용부호를 쓰지 않는 일반 객체명 기준이다.", "첫 글자와 특수문자를 확인한다.", "공백과 하이픈은 제거 대상이다."],
    validationNotes: ["원본 11번의 객체명 규칙을 새 후보군으로 변경했다."],
    variantDesign: "테이블명 후보를 인용부호 없는 객체명 전반으로 바꿨다."
  },
  {
    kind: "objective",
    id: "pdf-s-2-outer-join-filter",
    subjectId: "sql-basic",
    subjectName: "2과목",
    majorTopic: "SQL 활용",
    middleTopic: "조인",
    topic: "OUTER JOIN 조건 위치",
    difficulty: "상급",
    mode: "similar",
    status: "similar_verified",
    source: {
      document: sqlExam,
      page: 121,
      answerPage: 121,
      questionNumber: 72,
      verifiedBy: "derived_from_verified_original",
      verificationNote: "OUTER JOIN에서 ON 조건과 WHERE 조건의 차이를 새 고객-주문 예제로 구성했다."
    },
    stem: "모든 고객을 출력하되, 2026년 주문이 있으면 주문번호를 함께 보여주려 한다. 다음 중 요구사항을 가장 올바르게 만족하는 SQL은?",
    choices: choices([
      ["SELECT c.고객번호, o.주문번호 FROM 고객 c LEFT JOIN 주문 o ON c.고객번호 = o.고객번호 WHERE o.주문일자 >= DATE '2026-01-01'", "오답입니다. WHERE에서 주문 조건을 걸면 주문이 없는 고객의 NULL 확장 행이 제거됩니다."],
      ["SELECT c.고객번호, o.주문번호 FROM 고객 c LEFT JOIN 주문 o ON c.고객번호 = o.고객번호 AND o.주문일자 >= DATE '2026-01-01'", "정답입니다. 주문 조건을 ON에 두면 고객 전체를 보존하면서 조인 대상 주문만 제한합니다."],
      ["SELECT c.고객번호, o.주문번호 FROM 고객 c INNER JOIN 주문 o ON c.고객번호 = o.고객번호 AND o.주문일자 >= DATE '2026-01-01'", "오답입니다. INNER JOIN은 주문이 없는 고객을 제거합니다."],
      ["SELECT c.고객번호, o.주문번호 FROM 주문 o RIGHT JOIN 고객 c ON c.고객번호 = o.고객번호 WHERE o.주문번호 IS NOT NULL", "오답입니다. WHERE 조건으로 주문 없는 고객을 제거합니다."]
    ]),
    answer: "B",
    explanation: "OUTER JOIN에서 기준 테이블을 보존하려면 조인 대상 테이블의 필터 조건을 ON 절에 두어야 한다. WHERE 절에 두면 NULL 확장 행이 제거되어 INNER JOIN처럼 동작할 수 있다.",
    relatedConcept: "OUTER JOIN 조건 위치",
    hints: ["보존해야 하는 기준 테이블이 무엇인지 확인한다.", "주문 조건을 WHERE에 두면 NULL 확장 행이 어떻게 되는지 생각한다.", "조인 대상 제한은 ON 절에서 처리해야 한다."],
    validationNotes: ["원본의 ON/WHERE 조건 위치 함정을 독립 SQL로 재구성했다."],
    variantDesign: "고객 보존 요구와 주문일자 필터 조건을 결합한 새 SQL 비교형 문제다."
  },
  {
    kind: "objective",
    id: "pdf-s-2-window-rank",
    subjectId: "sql-basic",
    subjectName: "2과목",
    majorTopic: "SQL 활용",
    middleTopic: "윈도우 함수",
    topic: "ROW_NUMBER와 RANK",
    difficulty: "상급",
    mode: "similar",
    status: "similar_verified",
    source: {
      document: sqlExam,
      page: 127,
      answerPage: 127,
      questionNumber: 115,
      verifiedBy: "derived_from_verified_original",
      verificationNote: "윈도우 함수로 그룹별 1건 추출하는 출제 의도를 추천 점수 예시에서 부서별 매출 예시로 새로 구성했다."
    },
    stem: "부서별 매출액이 가장 큰 사원 1명만 출력하려고 한다. 동점자가 있어도 부서별 정확히 1명만 출력해야 한다. 가장 적절한 함수는?",
    choices: choices([
      ["RANK() OVER(PARTITION BY 부서 ORDER BY 매출액 DESC)", "오답입니다. 동점자가 있으면 같은 순위가 여러 명 나와 부서별 1명을 보장하지 못합니다."],
      ["DENSE_RANK() OVER(PARTITION BY 부서 ORDER BY 매출액 DESC)", "오답입니다. 동점자를 같은 순위로 처리하므로 1등이 여러 명일 수 있습니다."],
      ["ROW_NUMBER() OVER(PARTITION BY 부서 ORDER BY 매출액 DESC, 사원번호)", "정답입니다. 정렬 기준 안에서 유일한 순번을 부여하므로 부서별 1명만 선택할 수 있습니다."],
      ["COUNT(*) OVER(PARTITION BY 부서)", "오답입니다. 부서별 건수를 계산할 뿐 순위를 부여하지 않습니다."]
    ]),
    answer: "C",
    explanation: "ROW_NUMBER는 정렬 결과에 유일한 순번을 부여한다. 동점자를 모두 남기는 RANK 계열과 달리 그룹별 정확히 한 행을 뽑아야 할 때 적절하다.",
    relatedConcept: "윈도우 함수와 순위 함수",
    hints: ["동점자가 있을 때 결과 행 수가 어떻게 되는지 확인한다.", "정확히 1명이라는 조건은 유일 순번이 필요하다는 뜻이다.", "ROW_NUMBER에 보조 정렬 기준을 두면 안정적으로 1건을 고를 수 있다."],
    validationNotes: ["원본 순위 함수 문제의 평가 목표를 새 업무와 조건으로 독립 구성했다."],
    variantDesign: "추천경로별 최고점 문제를 부서별 최고 매출 1명 문제로 재구성했다."
  },
  {
    kind: "objective",
    id: "pdf-o-3-001",
    subjectId: "tuning",
    subjectName: "3과목",
    majorTopic: "아키텍처 기반 튜닝 원리",
    middleTopic: "데이터베이스 아키텍처",
    topic: "Connection",
    difficulty: "중급",
    mode: "original",
    status: "original_verified",
    source: {
      document: sqlExam,
      page: 73,
      answerPage: 130,
      questionNumber: 1,
      verifiedBy: "page_render_and_answer_key",
      verificationNote: commonOriginalNote
    },
    stem: "다음 중 데이터베이스 연결(Connection)과 관련한 설명으로 가장 부적절한 것은?",
    choices: choices([
      ["데이터베이스 서버와 클라이언트 간 연결상태를 유지하면 서버 자원을 낭비하게 되므로 동시 사용자가 많은 OLTP 환경에선 SQL 수행을 마치자마자 곧바로 연결(Connection)을 닫아주는 것이 바람직하다.", "정답입니다. SQL 수행마다 연결을 반복 생성/해제하면 부하가 커지므로 OLTP 환경에서는 Connection Pooling 활용이 중요합니다."],
      ["연결(Connection) 요청에 대한 부하는 쓰레드(Thread) 기반 아키텍처보다 프로세스 기반 아키텍처에서 더 심하게 발생한다.", "오답입니다. 프로세스 기반은 연결 생성 비용이 더 클 수 있습니다."],
      ["전용 서버(Dedicated Server) 방식으로 오라클 데이터베이스에 접속하면 사용자가 데이터베이스 서버에 연결 요청을 할 때마다 서버 프로세스(또는 쓰레드)가 생성된다.", "오답입니다. 전용 서버 방식 설명으로 적절합니다."],
      ["공유 서버(Shared Server) 방식으로 오라클 데이터베이스에 접속하면 사용자 프로세스는 서버 프로세스와 직접 통신하지 않고 Dispatcher 프로세스를 거친다.", "오답입니다. 공유 서버 방식에서는 Dispatcher를 거칠 수 있습니다."]
    ]),
    answer: "A",
    explanation: "다중 사용자 환경에서 매 SQL 수행마다 연결을 닫고 다시 생성하면 서버 프로세스 또는 쓰레드 생성과 해제가 반복되어 성능에 좋지 않다. OLTP 애플리케이션에서는 Connection Pooling이 필수적이다.",
    relatedConcept: "Connection Pooling",
    hints: ["연결 유지 비용과 연결 생성 비용을 함께 본다.", "OLTP 환경에서는 매번 접속/해제가 좋은지 생각한다.", "Connection Pooling이 왜 필요한지 떠올린다."],
    validationNotes: ["page 73의 1번 문항과 answer page 130의 해설을 대조했다."]
  },
  {
    kind: "objective",
    id: "pdf-o-3-002",
    subjectId: "tuning",
    subjectName: "3과목",
    majorTopic: "아키텍처 기반 튜닝 원리",
    middleTopic: "데이터베이스 I/O 원리",
    topic: "저장 구조",
    difficulty: "중급",
    mode: "original",
    status: "original_verified",
    source: {
      document: sqlExam,
      page: 73,
      answerPage: 130,
      questionNumber: 2,
      verifiedBy: "page_render_and_answer_key",
      verificationNote: commonOriginalNote
    },
    stem: "다음 중 Oracle이나 SQL Server 같은 데이터베이스의 저장 구조를 설명한 것으로 가장 부적절한 것은?",
    choices: choices([
      ["데이터를 읽고 쓰는 단위는 블록(페이지)이다.", "오답입니다. 블록 또는 페이지는 기본 I/O 단위입니다."],
      ["데이터파일에 공간을 할당하는 단위는 익스텐트다.", "오답입니다. 익스텐트는 공간 할당 단위입니다."],
      ["같은 세그먼트에 속한 익스텐트끼리는 데이터파일 내에서 서로 인접해 있다.", "정답입니다. 같은 세그먼트의 익스텐트들이 반드시 서로 인접한다고 볼 수 없습니다."],
      ["SQL Server에서는 한 익스텐트에 속한 페이지들을 여러 오브젝트가 나누어 사용할 수 있다.", "오답입니다. SQL Server의 혼합 익스텐트 개념과 관련된 설명입니다."]
    ]),
    answer: "C",
    explanation: "익스텐트 내 블록들은 서로 인접하지만, 익스텐트끼리 서로 인접하지는 않는다.",
    relatedConcept: "블록, 익스텐트, 세그먼트",
    hints: ["블록과 익스텐트, 세그먼트의 포함 관계를 구분한다.", "인접성이 보장되는 단위가 무엇인지 확인한다.", "익스텐트 내부와 익스텐트 사이를 혼동하면 안 된다."],
    validationNotes: ["page 73의 2번 문항과 answer page 130의 2번 해설을 확인했다."]
  },
  {
    kind: "objective",
    id: "pdf-o-3-004",
    subjectId: "tuning",
    subjectName: "3과목",
    majorTopic: "아키텍처 기반 튜닝 원리",
    middleTopic: "데이터베이스 아키텍처",
    topic: "메모리 구조",
    difficulty: "중급",
    mode: "original",
    status: "original_verified",
    source: {
      document: sqlExam,
      page: 74,
      answerPage: 130,
      questionNumber: 4,
      verifiedBy: "page_render_and_answer_key",
      verificationNote: commonOriginalNote
    },
    stem: "다음 중 메모리 구조에 대한 설명으로 가장 부적절한 것은?",
    choices: choices([
      ["DB 버퍼 캐시는 데이터 파일로부터 읽어 들인 데이터 블록을 담는 캐시 영역이다.", "오답입니다. DB 버퍼 캐시의 기본 설명입니다."],
      ["/*+ append */ 힌트를 사용하면 Insert 시 DB 버퍼 캐시를 거치지 않고 디스크에서 직접 쓸 수 있다.", "오답입니다. Direct Path Insert와 관련된 설명입니다."],
      ["클러스터링 팩터가 좋은 인덱스를 사용하면 Buffer Pinning 효과로 I/O를 줄일 수 있다.", "오답입니다. 인접한 테이블 블록 반복 접근이 줄어드는 효과와 관련됩니다."],
      ["LRU 알고리즘에 따라, Table Full Scan 한 데이터 블록이 Index Range Scan 한 데이터 블록보다 DB 버퍼 캐시에 더 오래 머무른다.", "정답입니다. Table Full Scan 블록은 보통 LRU end에 위치해 오래 머물지 않습니다."]
    ]),
    answer: "D",
    explanation: "Table Full Scan한 데이터 블록은 LRU end에 위치하기 때문에 버퍼 캐시에 오래 머물지 않는다.",
    relatedConcept: "DB 버퍼 캐시와 LRU",
    hints: ["Full Scan 블록과 인덱스 경유 블록의 캐시 체류 특성을 비교한다.", "LRU에서 오래 보존되는 블록이 무엇인지 생각한다.", "Full Scan 블록이 캐시를 오래 점유한다고 단정하는 보기가 함정이다."],
    validationNotes: ["page 74의 4번 문항과 answer page 130의 정답 D를 확인했다."]
  },
  {
    kind: "objective",
    id: "pdf-o-3-008",
    subjectId: "tuning",
    subjectName: "3과목",
    majorTopic: "아키텍처 기반 튜닝 원리",
    middleTopic: "SQL 파싱 부하",
    topic: "바인드 변수",
    difficulty: "중급",
    mode: "original",
    status: "original_verified",
    source: {
      document: sqlExam,
      page: 75,
      answerPage: 131,
      questionNumber: 8,
      verifiedBy: "page_render_and_answer_key",
      verificationNote: commonOriginalNote
    },
    stem: "공통기술팀에서 개발표준 업무를 담당하는 고성능 씨는 OLTP 환경인 점을 고려해 가급적 바인드 변수를 사용하도록 권고하지만, Literal 상수 조건을 사용하는 것이 더 낫거나 바인드 변수를 사용하려고 애쓰지 않아도 되는 경우를 제시했다. 다음 중 가장 부적절한 것은?",
    choices: choices([
      ["수행빈도가 낮고 한 번 수행할 때 수십 초 이상 수행되는 SQL일 때", "오답입니다. 하드파싱보다 SQL 자체 수행 비용이 훨씬 큰 경우 바인드 변수 효과가 상대적으로 작을 수 있습니다."],
      ["조건절 칼럼의 값 종류(Distinct Value)가 소수이고, 값 분포가 균일하지 않을 때", "오답입니다. 히스토그램 활용을 위해 리터럴 조건이 유리할 수 있습니다."],
      ["사용자가 선택적으로 입력할 수 있는 조회 항목이 다양해서 조건절이 동적으로 바뀔 때", "정답입니다. 조건절이 동적으로 구성되더라도 비교 값에는 바인드 변수를 사용하려고 노력해야 합니다."],
      ["사용자가 입력할 수 있는 조회 항목이 아니어서 해당 조건절이 불변일 때", "오답입니다. 불변 조건이라면 리터럴로 고정해도 재사용성 문제가 크지 않을 수 있습니다."]
    ]),
    answer: "C",
    explanation: "사용자의 입력 조건이 다양해서 조건절을 동적으로 구성하더라도 조건절 비교 값만큼은 바인드 변수를 사용하려고 노력해야 한다.",
    relatedConcept: "바인드 변수와 하드 파싱",
    hints: ["동적 SQL과 바인드 변수 사용은 서로 배타적이지 않다.", "조건절의 구조와 비교 값을 구분한다.", "비교 값은 가능한 바인딩하는 것이 파싱 부하를 줄인다."],
    validationNotes: ["page 75의 8번 문항과 answer page 131의 8번 해설을 확인했다."]
  },
  {
    kind: "objective",
    id: "pdf-o-3-010",
    subjectId: "tuning",
    subjectName: "3과목",
    majorTopic: "아키텍처 기반 튜닝 원리",
    middleTopic: "SQL 파싱 부하",
    topic: "Static SQL과 Dynamic SQL",
    difficulty: "중급",
    mode: "original",
    status: "original_verified",
    source: {
      document: sqlExam,
      page: 75,
      answerPage: 131,
      questionNumber: 10,
      verifiedBy: "page_render_and_answer_key",
      verificationNote: commonOriginalNote
    },
    stem: "다음 중 SQL 작성 방식에 대해 설명으로 가장 부적절한 것은?",
    choices: choices([
      ["Static SQL이란, String형 변수에 담지 않고 코드 사이에 직접 기술한 SQL문을 말한다.", "오답입니다. Static SQL 설명으로 적절합니다."],
      ["Dynamic SQL이란, String형 변수에 담아서 실행하는 SQL문을 말한다.", "오답입니다. Dynamic SQL 설명으로 적절합니다."],
      ["Static SQL을 지원하는 개발환경에선 가급적 Static SQL로 작성하는 것이 바람직하다.", "오답입니다. Static SQL은 PreCompile 과정과 커서 캐싱 측면에서 안정적인 장점이 있습니다."],
      ["루프(Loop) 내에서 반복적으로 수행되는 SQL에 Dynamic SQL을 사용하면, 공유 메모리에 캐싱된 SQL을 공유하지 못해 하드파싱이 반복적으로 일어난다.", "정답입니다. 바인드 변수를 사용하면 Dynamic SQL이라도 캐싱된 SQL을 공유할 수 있으므로 항상 하드파싱이 반복된다고 단정할 수 없습니다."]
    ]),
    answer: "D",
    explanation: "바인드 변수를 사용하기만 하면 루프 내에서 반복 수행되는 SQL이더라도 캐싱된 SQL을 공유할 수 있다. Static SQL을 지원하는 개발환경에서는 가급적 Static SQL로 작성하는 것이 좋다.",
    relatedConcept: "Static SQL, Dynamic SQL, 커서 공유",
    hints: ["Dynamic SQL 여부와 바인드 변수 사용 여부를 분리해서 본다.", "루프에서 반복 수행될 때 SQL Text가 동일하게 유지되는지 확인한다.", "바인드 변수를 사용하면 캐싱된 커서를 공유할 수 있다."],
    validationNotes: ["page 75의 10번 문항과 answer page 131의 10번 해설을 확인했다."]
  },
  {
    kind: "objective",
    id: "pdf-v-3-connection-pool",
    subjectId: "tuning",
    subjectName: "3과목",
    majorTopic: "아키텍처 기반 튜닝 원리",
    middleTopic: "데이터베이스 아키텍처",
    topic: "Connection Pooling",
    difficulty: "중급",
    mode: "variant",
    status: "variant_verified",
    source: {
      document: sqlExam,
      page: 73,
      answerPage: 130,
      questionNumber: 1,
      verifiedBy: "derived_from_verified_original",
      verificationNote: "Connection 문항을 웹 API 서버의 커넥션 풀 장애 상황으로 재구성했다."
    },
    stem: "동시 접속이 많은 주문 API 서버에서 매 요청마다 DB 연결을 새로 열고 닫도록 구현했다. 피크 시간에 서버 프로세스 생성과 인증 처리 비용이 급증한다. 가장 적절한 개선 방향은?",
    choices: choices([
      ["요청마다 연결을 즉시 닫는 원칙을 유지하고 DB 서버 CPU만 증설한다.", "오답입니다. 연결 생성/해제 부하 자체를 줄이지 못합니다."],
      ["Connection Pool을 사용해 일정 수의 연결을 재사용하고, 풀 크기와 대기 시간을 관리한다.", "정답입니다. OLTP 환경에서는 연결 재사용으로 접속 부하를 줄이는 것이 핵심입니다."],
      ["모든 요청을 하나의 전역 커넥션으로 직렬 처리한다.", "오답입니다. 병목과 장애 전파 위험이 큽니다."],
      ["SQL 수행 직전마다 애플리케이션을 재기동해 커넥션 상태를 초기화한다.", "오답입니다. 운영 안정성과 성능 모두 악화됩니다."]
    ]),
    answer: "B",
    explanation: "동시 사용자가 많은 OLTP 환경에서는 Connection Pooling으로 연결 생성과 해제 비용을 줄이고, 제한된 연결 수를 안정적으로 재사용해야 한다.",
    relatedConcept: "Connection Pooling",
    hints: ["문제의 병목이 SQL 자체인지 연결 생성인지 구분한다.", "매 요청마다 접속을 반복하는 방식의 비용을 떠올린다.", "재사용 가능한 연결 풀을 관리하는 선택지가 정답이다."],
    validationNotes: ["원본 1번의 핵심 평가 목표를 API 서버 시나리오로 변경했다."],
    variantDesign: "연결 방식 설명형을 장애 원인/개선 선택형으로 바꿨다."
  },
  {
    kind: "objective",
    id: "pdf-v-3-buffer-cache",
    subjectId: "tuning",
    subjectName: "3과목",
    majorTopic: "아키텍처 기반 튜닝 원리",
    middleTopic: "데이터베이스 I/O 원리",
    topic: "버퍼 캐시",
    difficulty: "상급",
    mode: "variant",
    status: "variant_verified",
    source: {
      document: sqlExam,
      page: 74,
      answerPage: 130,
      questionNumber: 4,
      verifiedBy: "derived_from_verified_original",
      verificationNote: "DB 버퍼 캐시와 Full Scan 블록의 체류 특성을 새로운 실행 상황으로 재구성했다."
    },
    stem: "야간 배치가 대형 이력 테이블을 Full Scan한 직후, OLTP 화면에서 자주 쓰는 소형 코드 테이블 조회까지 느려졌다. 이 현상을 설명한 것으로 가장 적절한 것은?",
    choices: choices([
      ["Full Scan 블록은 항상 LRU의 MRU 쪽에 올라가므로 코드 테이블 블록을 오래 밀어낸다.", "오답입니다. Full Scan 블록이 항상 오래 보존된다고 볼 수 없습니다."],
      ["대량 Full Scan은 버퍼 캐시에 부담을 줄 수 있지만, Oracle은 Full Scan 블록을 오래 머물지 않게 처리하는 메커니즘을 사용한다.", "정답입니다. Full Scan 블록은 일반적으로 LRU end 쪽에 위치해 캐시 오염을 완화합니다."],
      ["인덱스 Range Scan으로 읽은 블록은 버퍼 캐시를 전혀 사용하지 않는다.", "오답입니다. 일반적인 인덱스/테이블 블록 읽기는 버퍼 캐시를 사용합니다."],
      ["DB 버퍼 캐시는 SQL 파싱 결과만 저장하므로 데이터 블록 경합과 무관하다.", "오답입니다. 파싱 결과는 주로 Shared Pool 영역과 관련됩니다."]
    ]),
    answer: "B",
    explanation: "DB 버퍼 캐시는 데이터 블록을 담는 영역이고, Full Scan으로 읽은 블록은 일반적으로 오래 캐시에 머물지 않게 처리되어 캐시 오염을 줄인다.",
    relatedConcept: "버퍼 캐시와 Full Scan",
    hints: ["DB 버퍼 캐시가 저장하는 대상부터 확인한다.", "Full Scan 블록과 인덱스 경유 블록의 캐시 체류 차이를 떠올린다.", "LRU의 어느 쪽에 위치하는지가 핵심이다."],
    validationNotes: ["원본 4번의 LRU/Full Scan 함정을 운영 시나리오로 재구성했다."],
    variantDesign: "메모리 구조 설명형을 배치 후 OLTP 성능 상황형으로 바꿨다."
  },
  {
    kind: "objective",
    id: "pdf-v-3-bind-histogram",
    subjectId: "tuning",
    subjectName: "3과목",
    majorTopic: "아키텍처 기반 튜닝 원리",
    middleTopic: "SQL 파싱 부하",
    topic: "바인드 변수와 히스토그램",
    difficulty: "상급",
    mode: "variant",
    status: "variant_verified",
    source: {
      document: sqlExam,
      page: 75,
      answerPage: 131,
      questionNumber: 8,
      verifiedBy: "derived_from_verified_original",
      verificationNote: "바인드 변수 예외 조건을 데이터 분포와 히스토그램 판단 문제로 확장했다."
    },
    stem: "주문상태코드 컬럼은 값 종류가 4개이고, '완료'가 전체의 98%, '취소'가 0.5%다. 같은 SQL에서 상태코드 조건만 바뀐다. 설명으로 가장 적절한 것은?",
    choices: choices([
      ["항상 바인드 변수를 사용해야 하므로 값 분포는 실행계획에 영향을 줄 수 없다.", "오답입니다. 바인드 변수 사용 시 값별 히스토그램 활용이 제한될 수 있습니다."],
      ["값 분포가 심하게 불균등하면 리터럴 조건 또는 적절한 커서 공유 전략을 검토할 수 있다.", "정답입니다. 선택도 차이가 큰 조건에서는 값별 실행계획 차이를 고려해야 합니다."],
      ["Distinct Value가 적은 컬럼은 어떤 경우에도 인덱스를 생성하면 안 된다.", "오답입니다. 값 분포와 조회 패턴에 따라 저카디널리티 컬럼도 인덱스 후보가 될 수 있습니다."],
      ["바인드 변수를 쓰면 하드파싱이 매번 발생하므로 OLTP에서는 피해야 한다.", "오답입니다. 바인드 변수는 일반적으로 커서 공유와 파싱 부하 감소에 도움이 됩니다."]
    ]),
    answer: "B",
    explanation: "OLTP에서 바인드 변수는 중요하지만, 값 분포가 심하게 치우친 컬럼은 히스토그램과 선택도 차이 때문에 리터럴 또는 적절한 커서 공유 전략을 검토할 수 있다.",
    relatedConcept: "바인드 변수, 선택도, 히스토그램",
    hints: ["파싱 부하와 실행계획 품질은 서로 다른 축이다.", "값 종류가 적고 분포가 불균등한 조건을 주목한다.", "선택도 차이가 큰 값은 같은 계획이 항상 최적이 아닐 수 있다."],
    validationNotes: ["원본 8번의 바인드 변수 예외 조건을 데이터 분포 판단형으로 재구성했다."],
    variantDesign: "Literal 예외 판단을 히스토그램/선택도 문제로 확장했다."
  },
  {
    kind: "objective",
    id: "pdf-s-3-index-access-filter",
    subjectId: "tuning",
    subjectName: "3과목",
    majorTopic: "인덱스와 조인",
    middleTopic: "인덱스 튜닝",
    topic: "Access Predicate와 Filter Predicate",
    difficulty: "최상급",
    mode: "similar",
    status: "similar_verified",
    source: {
      document: sqlExam,
      page: 85,
      answerPage: 134,
      questionNumber: 51,
      verifiedBy: "derived_from_verified_original",
      verificationNote: "인덱스 스캔량과 테이블 랜덤 액세스 판단을 신규 실행계획 수치로 구성했다."
    },
    stem: "인덱스 IDX_ORD(주문일자, 고객등급, 주문상태)와 아래 조건이 있다. 실행계획 Predicate에서 주문일자만 access, 고객등급과 주문상태는 filter로 나타났다. 가장 적절한 판단은?",
    code: `WHERE 주문일자 BETWEEN DATE '2026-07-01' AND DATE '2026-07-31'
  AND 고객등급 = 'VIP'
  AND 주문상태 = '완료'`,
    choices: choices([
      ["인덱스에 세 컬럼이 모두 있으므로 세 조건이 모두 인덱스 스캔 범위를 줄인다.", "오답입니다. Predicate에서 filter로 표시된 조건은 스캔 범위를 직접 줄이지 못할 수 있습니다."],
      ["주문일자 범위가 넓고 후행 컬럼이 filter라면 인덱스 스캔 후 버리는 행이 많을 수 있다.", "정답입니다. access와 filter 구분이 인덱스 스캔 효율 판단의 핵심입니다."],
      ["filter predicate는 테이블 액세스 후에만 평가되므로 인덱스 블록에서는 절대 적용되지 않는다.", "오답입니다. 인덱스 필터로 평가될 수도 있으나 스캔 시작/종료 범위를 줄이는 access와는 다릅니다."],
      ["고객등급을 인덱스에서 filter하므로 테이블 랜덤 액세스는 항상 0이 된다.", "오답입니다. 필요한 컬럼이 인덱스에 모두 없으면 테이블 액세스가 발생할 수 있습니다."]
    ]),
    answer: "B",
    explanation: "인덱스 컬럼에 조건이 존재해도 access predicate가 아니면 스캔 범위를 줄이지 못한다. 넓은 선두 범위 조건 뒤의 후행 컬럼 필터는 인덱스 스캔 효율 저하의 대표 원인이다.",
    relatedConcept: "인덱스 스캔 효율화",
    hints: ["인덱스 컬럼 포함 여부와 스캔 범위 축소 여부는 다르다.", "Predicate Information에서 access와 filter를 구분한다.", "넓은 범위를 먼저 읽고 후행 조건으로 버리는 구조가 병목이다."],
    validationNotes: ["원본 Trace/인덱스 판단형 문제의 핵심을 새 SQL 조건과 predicate 정보로 독립 구성했다."],
    variantDesign: "실행계획 수치 대신 Predicate 구분을 중심으로 새 문제를 만들었다."
  },
  {
    kind: "objective",
    id: "pdf-s-3-hash-build-input",
    subjectId: "tuning",
    subjectName: "3과목",
    majorTopic: "인덱스와 조인",
    middleTopic: "조인 기본 원리",
    topic: "Hash Join Build Input",
    difficulty: "상급",
    mode: "similar",
    status: "similar_verified",
    source: {
      document: sqlExam,
      page: 70,
      answerPage: 130,
      questionNumber: 146,
      verifiedBy: "derived_from_verified_original",
      verificationNote: "Hash Join과 Sort Merge Join 조건 판단을 신규 조인 선택 문제로 구성했다."
    },
    stem: "대량 주문 5천만 건과 프로모션 대상 고객 3만 건을 조인해 대상 주문을 찾는다. 조인 컬럼에 양쪽 모두 정렬된 입력은 없고, 프로모션 대상 고객 집합은 메모리에 충분히 적재 가능하다. 가장 적절한 설명은?",
    choices: choices([
      ["프로모션 대상 고객을 Build Input으로 해시 테이블을 만들고 주문을 Probe하는 Hash Join을 검토한다.", "정답입니다. 작은 집합을 Build Input으로 사용하면 메모리 사용과 탐색 비용이 유리합니다."],
      ["항상 주문 테이블을 Build Input으로 사용해야 해시 충돌이 줄어든다.", "오답입니다. 대량 집합을 Build로 선택하면 메모리 부담과 spill 위험이 커집니다."],
      ["정렬된 입력이 없으므로 Sort Merge Join이 항상 Hash Join보다 유리하다.", "오답입니다. 정렬 부하가 필요하므로 대량 데이터에서는 불리할 수 있습니다."],
      ["Hash Join은 등가 조인에서는 사용할 수 없고 비등가 조인 전용이다.", "오답입니다. Hash Join은 등가 조인에서 주로 사용됩니다."]
    ]),
    answer: "A",
    explanation: "Hash Join은 보통 작은 집합을 Build Input으로 해시 테이블을 만들고 큰 집합을 Probe한다. 등가 조인과 대량 처리에서 적절하며, 메모리 부족 시 spill을 고려해야 한다.",
    relatedConcept: "Hash Join",
    hints: ["두 집합의 크기 차이를 먼저 본다.", "해시 테이블을 만드는 쪽은 보통 작은 집합이 유리하다.", "정렬 입력이 없는 Sort Merge Join은 정렬 비용을 고려해야 한다."],
    validationNotes: ["원본 조인 방식 판단 포인트를 새로운 데이터 규모와 메모리 조건으로 구성했다."],
    variantDesign: "조인 방식 명칭 암기가 아니라 build/probe 선택 근거를 묻도록 설계했다."
  }
];

export const archivedPdfReviewLabs: PdfReviewLab[] = [
  {
    kind: "lab",
    id: "pdf-lab-01-running-total",
    title: "지점별 월 누적매출 SQL 작성",
    topic: "윈도우 함수",
    difficulty: "중급",
    mode: "original",
    status: "original_verified",
    source: {
      document: sqlExam,
      page: 137,
      answerPage: 137,
      questionNumber: "실기문제 1",
      verifiedBy: "page_render_and_answer_key",
      verificationNote: "실기문제 1의 누적매출 요구와 정답 SQL을 해설 페이지에서 확인했다."
    },
    scenario: "월별지점매출 테이블에서 지점별 판매월 순서에 따른 누적매출을 조회한다.",
    requirements: ["지점, 판매월, 매출, 누적매출을 출력한다.", "누적매출은 같은 지점 안에서 판매월 순서로 누적한다.", "윈도우 함수 사용 방식과 비사용 대안의 차이를 설명한다."],
    schemaSql: `CREATE TABLE 월별지점매출 (
  지점 VARCHAR2(20),
  판매월 CHAR(6),
  매출 NUMBER
);`,
    sampleData: [
      {
        title: "월별지점매출",
        headers: ["지점", "판매월", "매출"],
        rows: [["강남", "202601", "100"], ["강남", "202602", "150"], ["강남", "202603", "120"], ["종로", "202601", "80"], ["종로", "202602", "110"]]
      }
    ],
    answerSql: `SELECT 지점,
       판매월,
       매출,
       SUM(매출) OVER (
         PARTITION BY 지점
         ORDER BY 판매월
         ROWS BETWEEN UNBOUNDED PRECEDING AND CURRENT ROW
       ) AS 누적매출
FROM 월별지점매출;`,
    acceptedAlternatives: ["SUM(매출) OVER(PARTITION BY 지점 ORDER BY 판매월) 사용 가능", "윈도우 함수를 지원하지 않는 환경에서는 같은 지점의 이전 월을 부등호 조인해 SUM하는 방식 가능"],
    rubric: ["PARTITION BY 지점이 있어야 한다.", "ORDER BY 판매월이 있어야 한다.", "누적 범위가 현재 행까지여야 한다.", "지점 간 매출이 섞이면 감점한다."],
    explanation: "누적매출은 같은 지점 안에서 판매월 순서로 누적해야 하므로 윈도우 SUM과 PARTITION BY, ORDER BY가 핵심이다.",
    relatedConcepts: ["윈도우 함수", "누적 집계"],
    hints: ["일반 GROUP BY는 행을 월별로 유지하기 어렵다.", "지점별로 누적 범위를 나누어야 한다.", "ORDER BY 판매월이 누적 순서를 결정한다."],
    validationNotes: ["실기문제 1의 정답 페이지를 기준으로 요구사항과 모범 SQL을 등록했다."]
  },
  {
    kind: "lab",
    id: "pdf-lab-02-nl-index",
    title: "고객 조건 주문 조회 인덱스와 NL Join 유도",
    topic: "결합 인덱스와 NL Join",
    difficulty: "상급",
    mode: "similar",
    status: "similar_verified",
    source: {
      document: sqlExam,
      page: 138,
      answerPage: 138,
      questionNumber: "실기문제 2",
      verifiedBy: "derived_from_verified_original",
      verificationNote: "고객-주문 NL Join과 인덱스 설계 실습의 평가 목표를 다른 조건으로 재구성했다."
    },
    scenario: "특정 지역의 고객명 목록에 해당하는 고객의 최근 주문을 빠르게 조회해야 한다.",
    requirements: ["고객을 먼저 찾고 주문을 NL Join으로 조회하는 방향을 제시한다.", "고객과 주문에 필요한 결합 인덱스를 설계한다.", "힌트는 실행계획 유도 의도를 설명해야 한다."],
    schemaSql: `CREATE TABLE 고객 (
  고객번호 NUMBER PRIMARY KEY,
  거주지역코드 VARCHAR2(2) NOT NULL,
  고객명 VARCHAR2(50) NOT NULL
);

CREATE TABLE 주문 (
  주문번호 NUMBER PRIMARY KEY,
  고객번호 NUMBER NOT NULL,
  주문일시 DATE NOT NULL,
  주문금액 NUMBER
);`,
    currentSql: `SELECT o.주문번호, o.주문일시, c.고객명, o.주문금액
FROM 주문 o
JOIN 고객 c ON c.고객번호 = o.고객번호
WHERE o.주문일시 BETWEEN DATE '2026-07-01' AND DATE '2026-07-07'
  AND (c.거주지역코드, c.고객명) IN (('02', '김하나'), ('05', '박서연'));`,
    executionPlan: `교육용 예상 계획
NESTED LOOPS
  INLIST ITERATOR
    INDEX RANGE SCAN 고객_IX01 (거주지역코드, 고객명)
  INDEX RANGE SCAN 주문_IX01 (고객번호, 주문일시)`,
    answerSql: `CREATE INDEX 고객_IX01 ON 고객(거주지역코드, 고객명);
CREATE INDEX 주문_IX01 ON 주문(고객번호, 주문일시);

SELECT /*+ LEADING(c) USE_NL(o) INDEX(c 고객_IX01) INDEX(o 주문_IX01) */
       o.주문번호, o.주문일시, c.고객명, o.주문금액
FROM 고객 c
JOIN 주문 o ON o.고객번호 = c.고객번호
WHERE o.주문일시 BETWEEN DATE '2026-07-01' AND DATE '2026-07-07'
  AND (c.거주지역코드, c.고객명) IN (('02', '김하나'), ('05', '박서연'));`,
    acceptedAlternatives: ["고객 선행 + 주문(고객번호, 주문일시) 인덱스 활용 방향이면 인정", "힌트 없이도 동일 접근 경로를 설명하면 부분 인정"],
    rubric: ["고객 조건 인덱스의 선두 컬럼이 거주지역코드, 고객명이어야 한다.", "주문 인덱스는 고객번호 후 주문일시 조건을 처리해야 한다.", "주문을 먼저 대량 스캔하는 답안은 감점한다."],
    explanation: "고객 조건의 선택도가 높다면 고객을 먼저 소량 추출하고 주문을 고객번호로 반복 탐색하는 NL Join이 유리하다.",
    relatedConcepts: ["결합 인덱스", "NL Join", "부분범위 처리"],
    hints: ["먼저 줄일 수 있는 테이블이 어느 쪽인지 본다.", "후행 테이블 조인 컬럼에 인덱스가 필요하다.", "고객 조건과 주문 기간 조건이 각각 어느 인덱스에서 쓰이는지 설명한다."],
    validationNotes: ["원본 실기 2의 인덱스/NL Join 평가 목표를 유지하되 날짜, 이름, SQL 구조를 새로 작성했다."]
  },
  {
    kind: "lab",
    id: "pdf-lab-03-analytic-order",
    title: "업체별 주문 통계 분석 함수 작성",
    topic: "분석 함수",
    difficulty: "중급",
    mode: "original",
    status: "original_verified",
    source: {
      document: sqlExam,
      page: 138,
      answerPage: 138,
      questionNumber: "실기문제 3",
      verifiedBy: "page_render_and_answer_key",
      verificationNote: "실기문제 3의 분석 함수 정답 구조를 해설 페이지에서 확인했다."
    },
    scenario: "주문 테이블에서 주문별로 업체번호 기준 총주문횟수, 평균주문금액, 최대주문금액을 함께 출력한다.",
    requirements: ["2015년 9월 주문을 조회한다.", "업체번호별 총주문횟수, 평균주문금액, 최대주문금액을 주문 행마다 표시한다.", "평균주문금액 내림차순으로 정렬한다."],
    schemaSql: `CREATE TABLE 주문 (
  주문번호 NUMBER PRIMARY KEY,
  업체번호 NUMBER NOT NULL,
  주문일자 CHAR(8) NOT NULL,
  주문금액 NUMBER NOT NULL
);`,
    answerSql: `SELECT 주문번호,
       업체번호,
       주문일자,
       주문금액,
       COUNT(*) OVER (PARTITION BY 업체번호) AS 총주문횟수,
       AVG(주문금액) OVER (PARTITION BY 업체번호) AS 평균주문금액,
       MAX(주문금액) OVER (PARTITION BY 업체번호) AS 최대주문금액
FROM 주문
WHERE 주문일자 LIKE '201509%'
ORDER BY 평균주문금액 DESC;`,
    acceptedAlternatives: ["주문일자 BETWEEN '20150901' AND '20150930' 조건도 인정", "별칭은 달라도 의미가 같으면 인정"],
    rubric: ["COUNT, AVG, MAX가 모두 분석 함수여야 한다.", "PARTITION BY 업체번호가 누락되면 오답이다.", "GROUP BY로 주문 행을 줄이면 요구사항을 만족하지 못한다."],
    explanation: "행을 유지하면서 업체별 통계를 붙여야 하므로 GROUP BY가 아니라 분석 함수를 사용해야 한다.",
    relatedConcepts: ["분석 함수", "PARTITION BY"],
    hints: ["주문 행이 사라지면 안 된다.", "업체별 통계를 행마다 붙이는 함수를 떠올린다.", "GROUP BY와 분석 함수의 결과 행 수 차이를 확인한다."],
    validationNotes: ["실기문제 3의 핵심 SQL 구조를 검수 세트로 등록했다."]
  },
  {
    kind: "lab",
    id: "pdf-lab-04-optional-condition",
    title: "옵션 조건 주문 조회 SQL Rewrite",
    topic: "옵션 조건과 UNION ALL",
    difficulty: "상급",
    mode: "similar",
    status: "similar_verified",
    source: {
      document: sqlExam,
      page: 139,
      answerPage: 139,
      questionNumber: "실기문제 4",
      verifiedBy: "derived_from_verified_original",
      verificationNote: "옵션 조건 SQL 최적화 실습을 신규 주문 검색 조건으로 재구성했다."
    },
    scenario: "고객번호는 선택 입력 조건이고 주문일자는 필수 조건이다. 고객번호가 입력되지 않은 경우 전체 고객 주문을 조회해야 한다.",
    requirements: ["고객번호가 입력되면 고객번호 인덱스를 활용할 수 있어야 한다.", "고객번호가 없으면 주문일시 기준 인덱스를 활용해야 한다.", "NVL 방식의 장단점과 UNION ALL 방식의 장점을 설명한다."],
    schemaSql: `CREATE TABLE 주문 (
  주문번호 NUMBER PRIMARY KEY,
  고객번호 NUMBER NOT NULL,
  주문일시 DATE NOT NULL,
  주문금액 NUMBER,
  배송지 VARCHAR2(200)
);

CREATE INDEX 주문_IX01 ON 주문(고객번호, 주문일시);
CREATE INDEX 주문_IX02 ON 주문(주문일시);`,
    currentSql: `SELECT 주문번호, 고객번호, 주문일시, 주문금액, 배송지
FROM 주문
WHERE 고객번호 = NVL(:cust_no, 고객번호)
  AND 주문일시 >= TO_DATE(:ord_dt1, 'YYYYMMDD')
  AND 주문일시 < TO_DATE(:ord_dt2, 'YYYYMMDD') + 1
ORDER BY 주문일시 DESC;`,
    answerSql: `SELECT 주문번호, 고객번호, 주문일시, 주문금액, 배송지
FROM 주문
WHERE :cust_no IS NOT NULL
  AND 고객번호 = :cust_no
  AND 주문일시 >= TO_DATE(:ord_dt1, 'YYYYMMDD')
  AND 주문일시 < TO_DATE(:ord_dt2, 'YYYYMMDD') + 1
UNION ALL
SELECT 주문번호, 고객번호, 주문일시, 주문금액, 배송지
FROM 주문
WHERE :cust_no IS NULL
  AND 주문일시 >= TO_DATE(:ord_dt1, 'YYYYMMDD')
  AND 주문일시 < TO_DATE(:ord_dt2, 'YYYYMMDD') + 1
ORDER BY 주문일시 DESC;`,
    acceptedAlternatives: ["고객번호 NULL 여부에 따라 별도 SQL을 분기하는 애플리케이션 처리도 인정", "Oracle의 NVL OR Expansion을 명확히 설명하면 부분 인정"],
    rubric: ["고객번호 입력/미입력 경로가 분리되어야 한다.", "두 분기의 결과가 중복되지 않아야 한다.", "필수 주문일시 조건은 두 분기에 모두 있어야 한다."],
    explanation: "옵션 조건을 하나의 NVL 조건으로 처리하면 인덱스 선택이 불안정할 수 있다. UNION ALL 또는 SQL 분기로 조건 존재 여부에 맞는 접근 경로를 분리한다.",
    relatedConcepts: ["옵션 조건", "OR Expansion", "UNION ALL Rewrite"],
    hints: ["고객번호가 NULL일 때와 아닐 때 선택도가 완전히 다르다.", "하나의 조건식에 모든 경우를 넣으면 인덱스 선택이 어려워진다.", "서로 배타적인 두 분기로 나누면 각 분기에 맞는 인덱스를 사용할 수 있다."],
    validationNotes: ["원본 실기 4의 옵션 조건 튜닝 목표를 새 SQL과 인덱스 조건으로 재구성했다."]
  },
  {
    kind: "lab",
    id: "pdf-lab-05-trace-analysis",
    title: "SQL Trace 기반 조인 병목 분석",
    topic: "SQL Trace와 실행계획",
    difficulty: "최상급",
    mode: "similar",
    status: "similar_verified",
    source: {
      document: sqlExam,
      page: 85,
      answerPage: 134,
      questionNumber: 42,
      verifiedBy: "derived_from_verified_original",
      verificationNote: "Trace 수치와 조인 제거/접근 경로 판단을 신규 주문-고객 조회로 구성했다."
    },
    scenario: "주문일시 조건으로 주문을 조회하면서 고객 테이블을 조인한다. 화면에는 고객 테이블 컬럼을 출력하지 않는다.",
    requirements: ["Trace 수치에서 병목을 찾는다.", "불필요한 조인 여부를 판단한다.", "주문일시 조건에 맞는 인덱스 개선안을 제시한다."],
    schemaSql: `CREATE TABLE 고객 (
  고객번호 NUMBER PRIMARY KEY,
  고객명 VARCHAR2(50) NOT NULL
);

CREATE TABLE 주문 (
  주문번호 NUMBER PRIMARY KEY,
  고객번호 NUMBER NOT NULL,
  주문일시 DATE NOT NULL,
  주문금액 NUMBER NOT NULL
);`,
    currentSql: `SELECT o.주문번호, o.주문일시, o.고객번호, o.주문금액
FROM 주문 o
JOIN 고객 c ON c.고객번호 = o.고객번호
WHERE o.주문일시 = :ord_dt;`,
    executionPlan: `교육용 예시 계획
NESTED LOOPS
  TABLE ACCESS BY INDEX ROWID 주문
    INDEX RANGE SCAN 주문_IX01 (주문일시)
  INDEX UNIQUE SCAN 고객_PK`,
    traceSummary: {
      title: "교육용 Trace 핵심 요약",
      headers: ["Operation", "Rows", "Starts", "CR", "PR", "Time"],
      rows: [["INDEX RANGE SCAN 주문_IX01", "38,420", "1", "1,204", "20", "0.18s"], ["TABLE ACCESS 주문", "38,420", "1", "41,880", "640", "1.92s"], ["INDEX UNIQUE SCAN 고객_PK", "38,420", "38,420", "76,840", "0", "1.40s"]]
    },
    answerSql: `CREATE INDEX 주문_IX02 ON 주문(주문일시, 주문번호, 고객번호, 주문금액);

SELECT o.주문번호, o.주문일시, o.고객번호, o.주문금액
FROM 주문 o
WHERE o.주문일시 = :ord_dt;`,
    acceptedAlternatives: ["고객 FK가 NOT NULL이고 고객 컬럼을 사용하지 않는다는 전제를 명시한 조인 제거", "주문일시 선두 인덱스에 출력 컬럼을 포함하는 커버링 방향"],
    rubric: ["고객 컬럼 미사용과 NOT NULL FK 전제를 근거로 조인 제거를 설명해야 한다.", "고객_PK 반복 Starts가 병목임을 지적해야 한다.", "주문 테이블 랜덤 액세스 감소 방안을 제시해야 한다."],
    explanation: "고객 컬럼을 사용하지 않고 주문의 고객번호가 NOT NULL FK라면 고객 조인이 불필요할 수 있다. Trace에서 고객_PK가 주문 결과 건수만큼 반복 수행되어 CR이 커지는 점이 핵심 병목이다.",
    relatedConcepts: ["조인 제거", "SQL Trace", "테이블 랜덤 액세스"],
    hints: ["SELECT, WHERE에서 고객 테이블 컬럼을 실제로 쓰는지 확인한다.", "Starts가 38,420인 오퍼레이션이 무엇인지 본다.", "조인을 제거할 수 있다면 반복 인덱스 탐색과 CR이 어떻게 변하는지 설명한다."],
    validationNotes: ["교육용 Trace 수치는 부모/자식 관계와 Starts 반복이 논리적으로 맞도록 수작업 검수했다.", "실제 Oracle 측정값이 아니므로 화면에서 교육용 예시로 표시한다."]
  },
  {
    kind: "lab",
    id: "pdf-lab-06-anti-join-null",
    title: "NULL 포함 제외 조건 SQL Rewrite",
    topic: "NOT EXISTS와 NULL",
    difficulty: "상급",
    mode: "variant",
    status: "variant_verified",
    source: {
      document: sqlExam,
      page: 26,
      answerPage: 121,
      questionNumber: "실기확장 6",
      verifiedBy: "derived_from_verified_original",
      verificationNote: "NULL과 NOT IN 함정을 실습형 SQL Rewrite로 재구성했다."
    },
    scenario: "이벤트 대상 고객 중 최근 30일 안에 수신거부 이력이 없는 고객만 추출해야 한다.",
    requirements: ["수신거부 테이블의 고객번호에 NULL이 존재해도 결과가 비정상적으로 비지 않아야 한다.", "최근 30일 조건은 수신거부 이력에 적용한다.", "NOT IN 방식의 위험과 NOT EXISTS 방식의 장점을 설명한다."],
    schemaSql: `CREATE TABLE 고객 (
  고객번호 NUMBER PRIMARY KEY,
  고객명 VARCHAR2(50) NOT NULL,
  가입상태 VARCHAR2(10) NOT NULL
);

CREATE TABLE 수신거부이력 (
  이력번호 NUMBER PRIMARY KEY,
  고객번호 NUMBER,
  거부일자 DATE NOT NULL
);

CREATE INDEX 수신거부이력_IX01 ON 수신거부이력(고객번호, 거부일자);`,
    currentSql: `SELECT c.고객번호, c.고객명
FROM 고객 c
WHERE c.가입상태 = '정상'
  AND c.고객번호 NOT IN (
    SELECT h.고객번호
    FROM 수신거부이력 h
    WHERE h.거부일자 >= TRUNC(SYSDATE) - 30
  );`,
    answerSql: `SELECT c.고객번호, c.고객명
FROM 고객 c
WHERE c.가입상태 = '정상'
  AND NOT EXISTS (
    SELECT 1
    FROM 수신거부이력 h
    WHERE h.고객번호 = c.고객번호
      AND h.거부일자 >= TRUNC(SYSDATE) - 30
  );`,
    acceptedAlternatives: ["서브쿼리에서 h.고객번호 IS NOT NULL을 보장한 NOT IN은 부분 인정", "반조인으로 변환 가능한 NOT EXISTS 구조면 인정"],
    rubric: ["NOT IN의 NULL 위험을 제거해야 한다.", "상관 조건 h.고객번호 = c.고객번호가 있어야 한다.", "최근 30일 조건이 수신거부 이력에 적용되어야 한다."],
    explanation: "NOT IN 하위 결과에 NULL이 포함되면 비교 결과가 UNKNOWN이 되어 전체 결과가 사라질 수 있다. 제외 조건은 NOT EXISTS로 작성하면 NULL 영향을 피하면서 고객별 존재 여부를 판단할 수 있다.",
    relatedConcepts: ["NULL", "NOT EXISTS", "Anti Join"],
    hints: ["NOT IN 목록에 NULL이 있으면 어떤 일이 생기는지 떠올린다.", "고객별로 거부 이력이 존재하는지 확인해야 한다.", "존재 여부 검사는 NOT EXISTS가 안전하다."],
    validationNotes: ["PDF의 NULL/NOT IN 판단 유형을 SQL 작성 실습으로 확장했다."]
  },
  {
    kind: "lab",
    id: "pdf-lab-07-rollup-label",
    title: "ROLLUP 소계 라벨링 SQL 작성",
    topic: "ROLLUP과 GROUPING",
    difficulty: "중급",
    mode: "similar",
    status: "similar_verified",
    source: {
      document: sqlExam,
      page: 36,
      answerPage: 128,
      questionNumber: "실기확장 7",
      verifiedBy: "derived_from_verified_original",
      verificationNote: "ROLLUP과 GROUPING 함수 출제 의도를 실습 문제로 구성했다."
    },
    scenario: "월별 매출을 지역과 상품별로 집계하고 지역 소계와 전체 합계를 구분해 보고서에 표시한다.",
    requirements: ["지역, 상품, 매출합계를 출력한다.", "상품 소계 행에는 상품명을 '지역소계'로 표시한다.", "전체 합계 행에는 지역명을 '전체합계'로 표시한다.", "원천 데이터의 NULL과 집계 행의 NULL을 구분한다."],
    schemaSql: `CREATE TABLE 매출 (
  매출월 CHAR(6) NOT NULL,
  지역명 VARCHAR2(30),
  상품명 VARCHAR2(50),
  매출금액 NUMBER NOT NULL
);`,
    sampleData: [
      {
        title: "매출",
        headers: ["매출월", "지역명", "상품명", "매출금액"],
        rows: [["202607", "서울", "노트북", "100"], ["202607", "서울", "모니터", "80"], ["202607", "부산", "노트북", "70"]]
      }
    ],
    answerSql: `SELECT CASE WHEN GROUPING(지역명) = 1 THEN '전체합계' ELSE NVL(지역명, '지역미상') END AS 지역명,
       CASE WHEN GROUPING(상품명) = 1 THEN '지역소계' ELSE NVL(상품명, '상품미상') END AS 상품명,
       SUM(매출금액) AS 매출합계
FROM 매출
WHERE 매출월 = '202607'
GROUP BY ROLLUP(지역명, 상품명)
ORDER BY GROUPING(지역명), 지역명, GROUPING(상품명), 상품명;`,
    acceptedAlternatives: ["GROUPING_ID를 사용해 소계와 합계를 구분해도 인정", "라벨 문구가 달라도 소계/합계 구분이 정확하면 인정"],
    rubric: ["ROLLUP(지역명, 상품명)을 사용해야 한다.", "GROUPING 함수로 집계 NULL과 원천 NULL을 구분해야 한다.", "월 조건은 집계 전에 적용해야 한다."],
    explanation: "ROLLUP 결과의 NULL은 원천 NULL과 집계 행 표시용 NULL이 섞일 수 있다. GROUPING 함수를 사용하면 집계 연산으로 생성된 NULL인지 구분할 수 있다.",
    relatedConcepts: ["ROLLUP", "GROUPING 함수", "GROUP BY"],
    hints: ["소계 행의 NULL은 원천 데이터의 NULL과 다를 수 있다.", "GROUPING 함수의 반환값을 라벨링에 사용한다.", "ROLLUP 컬럼 순서가 소계 계층을 결정한다."],
    validationNotes: ["집계/소계 PDF 유형을 SQL 작성 실습으로 확장했다."]
  },
  {
    kind: "lab",
    id: "pdf-lab-08-topn-stopkey",
    title: "Top-N 게시글 조회 실행계획 유도",
    topic: "Top-N과 STOPKEY",
    difficulty: "상급",
    mode: "similar",
    status: "similar_verified",
    source: {
      document: sqlExam,
      page: 84,
      answerPage: 135,
      questionNumber: "실기확장 8",
      verifiedBy: "derived_from_verified_original",
      verificationNote: "Top-N과 인덱스 정렬 활용 튜닝 문제를 신규 업무 시나리오로 구성했다."
    },
    scenario: "공지 게시판에서 특정 게시구분의 최신 글 20건만 첫 화면에 보여준다. 현재 SQL은 전체 정렬 후 20건을 잘라 응답이 느리다.",
    requirements: ["전체 정렬을 피하거나 줄이는 SQL과 인덱스 설계를 제시한다.", "상위 20건만 읽고 조기 종료될 수 있는 실행계획을 설명한다.", "동일 등록일시의 정렬 안정성을 보장한다."],
    schemaSql: `CREATE TABLE 게시글 (
  게시글번호 NUMBER PRIMARY KEY,
  게시구분 VARCHAR2(10) NOT NULL,
  등록일시 DATE NOT NULL,
  제목 VARCHAR2(200) NOT NULL,
  삭제여부 CHAR(1) DEFAULT 'N' NOT NULL
);`,
    currentSql: `SELECT *
FROM (
  SELECT 게시글번호, 게시구분, 등록일시, 제목
  FROM 게시글
  WHERE 게시구분 = :board_type
    AND 삭제여부 = 'N'
  ORDER BY 등록일시 DESC, 게시글번호 DESC
)
WHERE ROWNUM <= 20;`,
    executionPlan: `교육용 현재 계획
SORT ORDER BY STOPKEY
  TABLE ACCESS FULL 게시글

목표 계획 예시
COUNT STOPKEY
  TABLE ACCESS BY INDEX ROWID 게시글
    INDEX RANGE SCAN DESCENDING 게시글_IX01`,
    answerSql: `CREATE INDEX 게시글_IX01 ON 게시글(게시구분, 삭제여부, 등록일시 DESC, 게시글번호 DESC);

SELECT *
FROM (
  SELECT /*+ INDEX_DESC(b 게시글_IX01) */
         b.게시글번호, b.게시구분, b.등록일시, b.제목
  FROM 게시글 b
  WHERE b.게시구분 = :board_type
    AND b.삭제여부 = 'N'
  ORDER BY b.등록일시 DESC, b.게시글번호 DESC
)
WHERE ROWNUM <= 20;`,
    acceptedAlternatives: ["DELETE 여부 선택도가 낮다면 인덱스 컬럼 순서를 게시구분, 등록일시 DESC, 게시글번호 DESC, 삭제여부로 조정하는 설명도 부분 인정", "FETCH FIRST 20 ROWS ONLY를 사용해도 Top-N 의미가 같으면 인정"],
    rubric: ["등치 조건 컬럼이 인덱스 앞쪽에 있어야 한다.", "ORDER BY 컬럼과 방향이 인덱스 뒤쪽과 맞아야 한다.", "ROWNUM 또는 FETCH FIRST가 정렬 후 상위 N건 의미를 보존해야 한다."],
    explanation: "Top-N 조회는 정렬 순서와 맞는 인덱스를 사용하면 전체 정렬 없이 필요한 건수 근처에서 멈출 수 있다. 게시구분과 삭제여부로 범위를 좁히고 등록일시, 게시글번호 역순 정렬을 인덱스 순서로 처리하는 것이 핵심이다.",
    relatedConcepts: ["Top-N", "STOPKEY", "결합 인덱스"],
    hints: ["조건 컬럼과 정렬 컬럼을 한 인덱스에서 함께 처리할 수 있는지 본다.", "정렬 방향이 DESC인지 확인한다.", "COUNT STOPKEY 또는 STOPKEY 계열 처리가 목표다."],
    validationNotes: ["실행계획은 교육용 예시이며 논리 관계를 검수했다."]
  },
  {
    kind: "lab",
    id: "pdf-lab-09-merge-deduplicate-source",
    title: "MERGE 소스 중복 제거 후 요약 반영",
    topic: "MERGE와 DML",
    difficulty: "상급",
    mode: "variant",
    status: "variant_verified",
    source: {
      document: sqlExam,
      page: 39,
      answerPage: 130,
      questionNumber: "실기확장 9",
      verifiedBy: "derived_from_verified_original",
      verificationNote: "MERGE 원리와 소스 키 유일성 함정을 실습형으로 재구성했다."
    },
    scenario: "일별 상품 매출 요약 테이블에 당일 주문 데이터를 반영한다. 주문 원천에는 같은 상품이 여러 건 존재한다.",
    requirements: ["소스 집합을 요약 키 기준으로 먼저 집계한다.", "기존 요약 행은 UPDATE, 없는 행은 INSERT한다.", "같은 대상 행을 여러 번 갱신하는 MERGE 오류를 방지한다."],
    schemaSql: `CREATE TABLE 주문 (
  주문번호 NUMBER PRIMARY KEY,
  주문일자 DATE NOT NULL,
  상품번호 NUMBER NOT NULL,
  주문금액 NUMBER NOT NULL
);

CREATE TABLE 일별상품매출 (
  매출일자 DATE NOT NULL,
  상품번호 NUMBER NOT NULL,
  매출금액 NUMBER NOT NULL,
  CONSTRAINT 일별상품매출_PK PRIMARY KEY (매출일자, 상품번호)
);`,
    currentSql: `MERGE INTO 일별상품매출 t
USING (
  SELECT 주문일자 AS 매출일자, 상품번호, 주문금액
  FROM 주문
  WHERE 주문일자 = :work_dt
) s
ON (t.매출일자 = s.매출일자 AND t.상품번호 = s.상품번호)
WHEN MATCHED THEN UPDATE SET t.매출금액 = t.매출금액 + s.주문금액
WHEN NOT MATCHED THEN INSERT (매출일자, 상품번호, 매출금액)
VALUES (s.매출일자, s.상품번호, s.주문금액);`,
    answerSql: `MERGE INTO 일별상품매출 t
USING (
  SELECT 주문일자 AS 매출일자,
         상품번호,
         SUM(주문금액) AS 주문금액
  FROM 주문
  WHERE 주문일자 = :work_dt
  GROUP BY 주문일자, 상품번호
) s
ON (t.매출일자 = s.매출일자 AND t.상품번호 = s.상품번호)
WHEN MATCHED THEN UPDATE SET t.매출금액 = t.매출금액 + s.주문금액
WHEN NOT MATCHED THEN INSERT (매출일자, 상품번호, 매출금액)
VALUES (s.매출일자, s.상품번호, s.주문금액);`,
    acceptedAlternatives: ["원천을 별도 임시 집계 테이블로 만든 뒤 MERGE하는 방식도 인정", "동일 키가 유일한 소스만 MERGE에 제공된다는 전제를 명확히 보장하면 인정"],
    rubric: ["USING 소스가 매출일자, 상품번호 기준으로 유일해야 한다.", "기존 행은 누적 UPDATE되어야 한다.", "미존재 행은 INSERT되어야 한다."],
    explanation: "MERGE 대상 키에 대해 소스 행이 중복되면 하나의 대상 행을 여러 번 갱신하려는 문제가 생길 수 있다. 원천 주문을 요약 키 기준으로 먼저 GROUP BY하여 MERGE 소스의 유일성을 보장해야 한다.",
    relatedConcepts: ["MERGE", "DML 튜닝", "GROUP BY"],
    hints: ["MERGE의 ON 조건이 어떤 키를 대상으로 하는지 본다.", "주문 원천에는 같은 상품이 여러 건 있을 수 있다.", "USING 절에서 대상 키 기준 한 행만 남겨야 한다."],
    validationNotes: ["MERGE 중복 소스 오류 가능성을 검수 가능한 실습 요구로 구성했다."]
  },
  {
    kind: "lab",
    id: "pdf-lab-10-fk-lock-analysis",
    title: "외래키 인덱스 누락 Lock 원인 분석",
    topic: "Lock과 동시성",
    difficulty: "최상급",
    mode: "similar",
    status: "similar_verified",
    source: {
      document: sqlExam,
      page: 91,
      answerPage: 136,
      questionNumber: "실기확장 10",
      verifiedBy: "derived_from_verified_original",
      verificationNote: "Lock과 외래키 인덱스 판단을 SQLP 실기형 분석 문제로 구성했다."
    },
    scenario: "고객 삭제 배치 시간에 주문 입력 트랜잭션이 대기한다. 주문.고객번호는 고객.고객번호를 참조하지만 주문.고객번호 인덱스가 없다.",
    requirements: ["대기 원인을 Lock과 참조 무결성 검증 관점에서 설명한다.", "필요한 인덱스와 적용 시 주의사항을 제시한다.", "무조건 제약조건 삭제가 답이 아님을 설명한다."],
    schemaSql: `CREATE TABLE 고객 (
  고객번호 NUMBER PRIMARY KEY,
  고객상태 VARCHAR2(10) NOT NULL
);

CREATE TABLE 주문 (
  주문번호 NUMBER PRIMARY KEY,
  고객번호 NUMBER NOT NULL,
  주문일시 DATE NOT NULL,
  주문금액 NUMBER NOT NULL,
  CONSTRAINT 주문_FK01 FOREIGN KEY (고객번호) REFERENCES 고객(고객번호)
);`,
    executionPlan: `교육용 관찰 정보
Session 1: DELETE FROM 고객 WHERE 고객상태 = '탈퇴'
Session 2: INSERT INTO 주문(주문번호, 고객번호, 주문일시, 주문금액) VALUES (...)

대기 이벤트 예시
enq: TM - contention
enq: TX - row lock contention`,
    answerSql: `CREATE INDEX 주문_IX01 ON 주문(고객번호);

-- 추가 설명:
-- 부모 고객 삭제/변경 시 자식 주문 존재 여부를 빠르게 확인할 수 있어야 한다.
-- 운영 적용 전 중복 인덱스 여부, DML 증가 비용, 배치 시간대를 함께 검토한다.`,
    acceptedAlternatives: ["주문(고객번호, 주문일시)처럼 주요 조회 조건까지 포함한 결합 인덱스도 업무 조회와 맞으면 인정", "부모 삭제 정책을 논리 삭제로 바꾸는 업무 대안은 인덱스 검토와 함께 부분 인정"],
    rubric: ["자식 외래키 인덱스 누락을 원인 후보로 지적해야 한다.", "부모 삭제/변경과 자식 DML 사이 잠금 경합을 설명해야 한다.", "제약조건 삭제가 아니라 무결성 유지와 인덱스 설계를 우선해야 한다."],
    explanation: "외래키 제약은 자동으로 자식 인덱스를 만들지 않는다. 부모 키 삭제나 변경이 발생하면 자식 존재 여부 확인과 잠금 범위가 커질 수 있어 주문.고객번호 인덱스를 검토해야 한다.",
    relatedConcepts: ["Lock", "외래키", "동시성"],
    hints: ["부모 행 삭제가 자식 테이블을 왜 확인해야 하는지 생각한다.", "자식 외래키 컬럼에 인덱스가 없으면 검증 범위가 커진다.", "무결성을 지우기보다 인덱스와 트랜잭션 순서를 조정한다."],
    validationNotes: ["동시성 실습은 실제 운영 측정값이 아닌 교육용 관찰 정보로 명확히 표시한다."]
  },
  {
    kind: "lab",
    id: "pdf-lab-11-connect-by-path",
    title: "조직도 계층 경로 SQL 작성",
    topic: "계층형 질의",
    difficulty: "상급",
    mode: "variant",
    status: "variant_verified",
    source: {
      document: sqlExam,
      page: 41,
      answerPage: 131,
      questionNumber: "실기확장 11",
      verifiedBy: "derived_from_verified_original",
      verificationNote: "계층형 질의의 방향과 경로 출력 함정을 실습형으로 재구성했다."
    },
    scenario: "조직 개편 후 특정 본부 아래의 사용 중인 부서만 단계, 경로, 말단 여부와 함께 조회해야 한다. 같은 부서명이 여러 단계에 존재할 수 있으므로 부서번호 기준으로 계층을 전개해야 한다.",
    requirements: ["지정한 루트 부서에서 하위 부서 방향으로 전개한다.", "LEVEL, SYS_CONNECT_BY_PATH, CONNECT_BY_ISLEAF를 사용해 단계와 경로를 표시한다.", "사용여부가 'Y'인 부서만 결과에 포함하되 계층 방향을 반대로 쓰지 않는다."],
    schemaSql: `CREATE TABLE 부서 (
  부서번호 NUMBER PRIMARY KEY,
  상위부서번호 NUMBER,
  부서명 VARCHAR2(100) NOT NULL,
  사용여부 CHAR(1) NOT NULL,
  CONSTRAINT 부서_FK01 FOREIGN KEY (상위부서번호) REFERENCES 부서(부서번호)
);

CREATE INDEX 부서_IX01 ON 부서(상위부서번호, 사용여부);`,
    sampleData: [
      {
        title: "부서",
        headers: ["부서번호", "상위부서번호", "부서명", "사용여부"],
        rows: [
          ["10", "", "본사", "Y"],
          ["110", "10", "영업본부", "Y"],
          ["111", "110", "국내영업", "Y"],
          ["112", "110", "해외영업", "N"],
          ["120", "10", "기술본부", "Y"]
        ]
      }
    ],
    currentSql: `SELECT LEVEL AS 단계,
       부서번호,
       부서명
FROM 부서
START WITH 부서번호 = :root_dept
CONNECT BY 부서번호 = PRIOR 상위부서번호;`,
    executionPlan: `교육용 실행계획 예시
------------------------------------------------------------
Id | Operation                      | Name      | Rows | Cost
------------------------------------------------------------
 0 | SELECT STATEMENT               |           |   45 |   12
 1 |  CONNECT BY WITH FILTERING     |           |   45 |   12
 2 |   TABLE ACCESS BY INDEX ROWID  | 부서      |    1 |    2
 3 |    INDEX UNIQUE SCAN           | 부서_PK   |    1 |    1
 4 |   TABLE ACCESS BY INDEX ROWID  | 부서      |   44 |   10
 5 |    INDEX RANGE SCAN            | 부서_IX01 |   44 |    4
------------------------------------------------------------`,
    answerSql: `SELECT LEVEL AS 단계,
       부서번호,
       부서명,
       SYS_CONNECT_BY_PATH(부서명, '/') AS 부서경로,
       CONNECT_BY_ISLEAF AS 말단여부
FROM 부서
WHERE 사용여부 = 'Y'
START WITH 부서번호 = :root_dept
CONNECT BY PRIOR 부서번호 = 상위부서번호;`,
    acceptedAlternatives: ["비활성 부서의 하위 부서를 업무상 함께 제외해야 한다는 조건을 명시하고 CONNECT BY 조건에 사용여부를 함께 둔 답안은 부분 인정", "ORDER SIBLINGS BY 부서명 추가는 결과 정렬 요구가 있을 때 인정"],
    rubric: ["PRIOR 방향이 부모 부서번호에서 자식 상위부서번호로 연결되어야 한다.", "경로와 말단 여부를 계층형 함수로 출력해야 한다.", "사용여부 필터가 결과 의미를 훼손하지 않는 위치에 있어야 한다."],
    explanation: "하위 방향 계층 전개는 부모 행의 부서번호와 자식 행의 상위부서번호를 연결해야 한다. CONNECT BY PRIOR 부서번호 = 상위부서번호가 핵심이며, 방향을 반대로 쓰면 상위 방향 탐색이 된다.",
    relatedConcepts: ["계층형 질의", "CONNECT BY", "PRIOR"],
    hints: ["PRIOR가 붙은 값은 부모 행의 값이다.", "루트에서 하위로 내려가려면 부모 부서번호와 자식 상위부서번호를 비교한다.", "경로와 말단 여부는 계층형 전용 함수를 사용한다."],
    validationNotes: ["계층 방향, 경로 함수, 말단 여부 표시를 각각 검수했다."]
  },
  {
    kind: "lab",
    id: "pdf-lab-12-outer-join-count",
    title: "미주문 고객 포함 집계 SQL 작성",
    topic: "Outer Join과 집계",
    difficulty: "중급",
    mode: "similar",
    status: "similar_verified",
    source: {
      document: sqlExam,
      page: 74,
      answerPage: 134,
      questionNumber: "실기확장 12",
      verifiedBy: "derived_from_verified_original",
      verificationNote: "Outer Join 결과 건수 추론 문제를 SQL 작성형 실습으로 확장했다."
    },
    scenario: "마케팅 부서가 전체 고객별 2026년 상반기 주문 건수와 주문금액을 요청했다. 주문이 없는 고객도 반드시 0건, 0원으로 표시해야 한다.",
    requirements: ["모든 고객을 결과에 포함한다.", "2026년 상반기 주문만 집계한다.", "주문이 없는 고객은 주문건수 0, 주문금액 0으로 표시한다.", "날짜 조건 때문에 Outer Join이 Inner Join으로 바뀌지 않게 한다."],
    schemaSql: `CREATE TABLE 고객 (
  고객번호 NUMBER PRIMARY KEY,
  고객명 VARCHAR2(100) NOT NULL,
  고객등급 VARCHAR2(10)
);

CREATE TABLE 주문 (
  주문번호 NUMBER PRIMARY KEY,
  고객번호 NUMBER NOT NULL,
  주문일자 DATE NOT NULL,
  주문금액 NUMBER NOT NULL,
  CONSTRAINT 주문_FK01 FOREIGN KEY (고객번호) REFERENCES 고객(고객번호)
);

CREATE INDEX 주문_IX01 ON 주문(고객번호, 주문일자);`,
    currentSql: `SELECT c.고객번호,
       c.고객명,
       COUNT(*) AS 주문건수,
       NVL(SUM(o.주문금액), 0) AS 주문금액
FROM 고객 c
     LEFT JOIN 주문 o ON o.고객번호 = c.고객번호
WHERE o.주문일자 >= DATE '2026-01-01'
  AND o.주문일자 <  DATE '2026-07-01'
GROUP BY c.고객번호, c.고객명;`,
    answerSql: `SELECT c.고객번호,
       c.고객명,
       COUNT(o.주문번호) AS 주문건수,
       NVL(SUM(o.주문금액), 0) AS 주문금액
FROM 고객 c
     LEFT JOIN 주문 o
       ON o.고객번호 = c.고객번호
      AND o.주문일자 >= DATE '2026-01-01'
      AND o.주문일자 <  DATE '2026-07-01'
GROUP BY c.고객번호, c.고객명;`,
    acceptedAlternatives: ["주문을 기간 조건으로 먼저 필터링한 인라인 뷰와 LEFT JOIN하는 방식도 인정", "COUNT(o.고객번호)처럼 주문 매칭 시 NULL이 아닌 후행 컬럼을 세는 방식도 인정"],
    rubric: ["기간 조건은 ON 절 또는 후행 인라인 뷰 내부에 있어야 한다.", "COUNT(*)가 아니라 후행 테이블의 매칭 컬럼을 집계해야 한다.", "NULL 합계는 0으로 변환해야 한다."],
    explanation: "LEFT JOIN 후 WHERE 절에서 후행 테이블 주문일자 조건을 걸면 매칭되지 않은 고객의 NULL 확장 행이 제거된다. 기간 조건은 JOIN 조건으로 이동하고, 주문건수는 COUNT(o.주문번호)처럼 후행 테이블 컬럼 기준으로 계산해야 한다.",
    relatedConcepts: ["Outer Join", "COUNT", "NULL"],
    hints: ["주문 없는 고객의 후행 테이블 컬럼은 NULL이다.", "WHERE 절의 후행 테이블 조건은 NULL 확장 행을 제거한다.", "COUNT(*)와 COUNT(후행컬럼)의 차이가 핵심이다."],
    validationNotes: ["Outer Join 보존 행과 COUNT 의미를 기준으로 정답을 검수했다."]
  },
  {
    kind: "lab",
    id: "pdf-lab-13-partition-pruning",
    title: "월 파티션 주문 조회 Predicate 수정",
    topic: "Partition Pruning",
    difficulty: "상급",
    mode: "variant",
    status: "variant_verified",
    source: {
      document: sqlExam,
      page: 85,
      answerPage: 135,
      questionNumber: "실기확장 13",
      verifiedBy: "derived_from_verified_original",
      verificationNote: "함수 조건으로 파티션 프루닝이 약해지는 튜닝 유형을 실습형으로 구성했다."
    },
    scenario: "주문 테이블은 주문일자 기준 월 단위 Range Partition으로 구성되어 있다. 특정 월의 정상 주문을 조회하는 배치가 전체 파티션을 훑고 있다.",
    requirements: ["주문일자 컬럼에 함수를 적용하지 않고 월 범위를 표현한다.", "월 파티션 프루닝이 가능하도록 Predicate를 재작성한다.", "상태 조건과 주문일자 조건의 Access/Filter 역할을 구분해 설명한다."],
    schemaSql: `CREATE TABLE 주문 (
  주문번호 NUMBER NOT NULL,
  주문일자 DATE NOT NULL,
  고객번호 NUMBER NOT NULL,
  상태코드 VARCHAR2(10) NOT NULL,
  주문금액 NUMBER NOT NULL
)
PARTITION BY RANGE (주문일자) (
  PARTITION P202606 VALUES LESS THAN (DATE '2026-07-01'),
  PARTITION P202607 VALUES LESS THAN (DATE '2026-08-01'),
  PARTITION P202608 VALUES LESS THAN (DATE '2026-09-01')
);

CREATE INDEX 주문_LX01 ON 주문(주문일자, 상태코드) LOCAL;`,
    currentSql: `SELECT 주문번호, 고객번호, 주문금액
FROM 주문
WHERE TO_CHAR(주문일자, 'YYYYMM') = '202607'
  AND 상태코드 = '정상';`,
    executionPlan: `교육용 현재 실행계획 예시
--------------------------------------------------------------------------------
Id | Operation                  | Name      | Pstart | Pstop | Rows  | Cost
--------------------------------------------------------------------------------
 0 | SELECT STATEMENT           |           |        |       | 35000 |  920
 1 |  PARTITION RANGE ALL       |           |      1 |     3 | 35000 |  920
 2 |   TABLE ACCESS FULL        | 주문      |      1 |     3 | 35000 |  920
--------------------------------------------------------------------------------
Predicate Information
2 - filter(TO_CHAR("주문일자",'YYYYMM')='202607' AND "상태코드"='정상')`,
    traceSummary: {
      title: "교육용 Trace 핵심 요약",
      headers: ["항목", "값", "의미"],
      rows: [
        ["Rows", "35,000", "조건 통과 행"],
        ["CR", "184,200", "전체 파티션 논리 읽기"],
        ["PR", "3,420", "버퍼 캐시 미적중"],
        ["Time", "00:00:18.40", "함수 조건으로 읽기 범위 증가"]
      ]
    },
    answerSql: `SELECT 주문번호, 고객번호, 주문금액
FROM 주문
WHERE 주문일자 >= DATE '2026-07-01'
  AND 주문일자 <  DATE '2026-08-01'
  AND 상태코드 = '정상';`,
    acceptedAlternatives: ["바인드 변수를 사용할 때 :from_dt, :to_dt 반열린 범위로 작성한 답안 인정", "상태코드 선택도가 매우 높고 인덱스 설계를 바꿀 수 있다면 (상태코드, 주문일자) 인덱스 제안은 보조 개선안으로 인정"],
    rubric: ["주문일자 함수 조건을 제거해야 한다.", "월 말일 BETWEEN보다 반열린 범위가 시간 값 포함 측면에서 안전함을 설명해야 한다.", "목표는 PARTITION RANGE SINGLE 또는 RANGE ITERATOR와 LOCAL INDEX RANGE SCAN이다."],
    explanation: "파티션 키 주문일자에 TO_CHAR 함수를 적용하면 파티션 프루닝과 인덱스 시작점 형성이 약해진다. 날짜 컬럼 자체를 반열린 범위로 비교하면 해당 월 파티션과 로컬 인덱스 범위 스캔을 유도할 수 있다.",
    relatedConcepts: ["Partition Pruning", "SARGable Predicate", "Access Predicate"],
    hints: ["파티션 키에 함수가 적용되어 있는지 먼저 본다.", "월 조건은 DATE 상수의 시작일과 다음 달 시작일로 표현할 수 있다.", "시간 값이 섞인 DATE 컬럼에서는 반열린 범위가 안전하다."],
    validationNotes: ["함수 조건 제거와 파티션 프루닝 목표 실행계획의 논리 관계를 검수했다."]
  },
  {
    kind: "lab",
    id: "pdf-lab-14-scalar-subquery-rewrite",
    title: "스칼라 서브쿼리 반복 수행 제거",
    topic: "스칼라 서브쿼리 튜닝",
    difficulty: "최상급",
    mode: "similar",
    status: "similar_verified",
    source: {
      document: sqlExam,
      page: 78,
      answerPage: 135,
      questionNumber: "실기확장 14",
      verifiedBy: "derived_from_verified_original",
      verificationNote: "스칼라 서브쿼리 반복 수행과 사전 집계 Rewrite를 실습형으로 구성했다."
    },
    scenario: "주문 목록 50만 건에 대해 고객별 최근 30일 결제금액을 SELECT 절 스칼라 서브쿼리로 조회한다. 같은 고객이 여러 주문에 반복 등장해 결제 테이블 탐색이 과도하게 반복된다.",
    requirements: ["스칼라 서브쿼리 반복 수행 병목을 설명한다.", "고객별 결제 집계를 먼저 만든 뒤 조인하는 형태로 SQL을 재작성한다.", "반복 Starts 감소와 집계 범위 축소 근거를 설명한다."],
    schemaSql: `CREATE TABLE 주문 (
  주문번호 NUMBER PRIMARY KEY,
  고객번호 NUMBER NOT NULL,
  주문일자 DATE NOT NULL,
  주문상태 VARCHAR2(10) NOT NULL
);

CREATE TABLE 결제 (
  결제번호 NUMBER PRIMARY KEY,
  고객번호 NUMBER NOT NULL,
  결제일자 DATE NOT NULL,
  결제금액 NUMBER NOT NULL
);

CREATE INDEX 주문_IX01 ON 주문(주문일자, 주문상태, 고객번호);
CREATE INDEX 결제_IX01 ON 결제(결제일자, 고객번호);`,
    currentSql: `SELECT o.주문번호,
       o.고객번호,
       (SELECT SUM(p.결제금액)
        FROM 결제 p
        WHERE p.고객번호 = o.고객번호
          AND p.결제일자 >= DATE '2026-07-01'
          AND p.결제일자 <  DATE '2026-08-01') AS 월결제금액
FROM 주문 o
WHERE o.주문일자 >= DATE '2026-07-01'
  AND o.주문일자 <  DATE '2026-08-01'
  AND o.주문상태 = '완료';`,
    executionPlan: `교육용 현재 실행계획 예시
--------------------------------------------------------------------------------
Id | Operation                      | Name      | Starts | Rows | Cost
--------------------------------------------------------------------------------
 0 | SELECT STATEMENT               |           |      1 | 500K | 8200
 1 |  TABLE ACCESS BY INDEX ROWID   | 주문      |      1 | 500K | 1100
 2 |   INDEX RANGE SCAN             | 주문_IX01 |      1 | 500K |  320
 3 |  SORT AGGREGATE                |           | 500000 |    1 |     
 4 |   TABLE ACCESS BY INDEX ROWID  | 결제      | 500000 |    3 | 7100
 5 |    INDEX RANGE SCAN            | 결제_IX01 | 500000 |    3 | 4200
--------------------------------------------------------------------------------`,
    traceSummary: {
      title: "교육용 Trace 핵심 요약",
      headers: ["항목", "값", "의미"],
      rows: [
        ["Rows", "500,000", "주문 출력 행 수"],
        ["Starts", "500,000", "스칼라 서브쿼리 반복 수행"],
        ["CR", "2,860,000", "결제 반복 탐색 논리 읽기"],
        ["PR", "8,400", "반복 탐색 중 물리 읽기"]
      ]
    },
    answerSql: `WITH 결제집계 AS (
  SELECT 고객번호,
         SUM(결제금액) AS 월결제금액
  FROM 결제
  WHERE 결제일자 >= DATE '2026-07-01'
    AND 결제일자 <  DATE '2026-08-01'
  GROUP BY 고객번호
)
SELECT o.주문번호,
       o.고객번호,
       NVL(p.월결제금액, 0) AS 월결제금액
FROM 주문 o
     LEFT JOIN 결제집계 p ON p.고객번호 = o.고객번호
WHERE o.주문일자 >= DATE '2026-07-01'
  AND o.주문일자 <  DATE '2026-08-01'
  AND o.주문상태 = '완료';`,
    acceptedAlternatives: ["결제집계를 인라인 뷰로 작성한 LEFT JOIN 답안 인정", "고객번호별 중복이 적고 캐싱 효과가 충분하다는 근거를 제시한 유지안은 부분 인정"],
    rubric: ["스칼라 서브쿼리 Starts가 외부 주문 행 수만큼 반복됨을 지적해야 한다.", "결제 데이터를 고객번호 기준으로 먼저 집계해야 한다.", "주문은 보존되어야 하므로 LEFT JOIN 또는 동일 의미의 방식이어야 한다."],
    explanation: "SELECT 절 스칼라 서브쿼리는 외부 행마다 평가될 수 있다. 같은 고객이 반복되는 주문 목록에서는 결제 집계를 고객 단위로 먼저 만들고 조인하면 반복 Starts와 논리 읽기를 크게 줄일 수 있다.",
    relatedConcepts: ["스칼라 서브쿼리", "SQL Rewrite", "Starts"],
    hints: ["실행계획에서 같은 Operation의 Starts가 외부 행 수와 같은지 본다.", "같은 고객번호에 대한 결제 집계가 반복 계산되는지 확인한다.", "고객번호별 사전 집계 후 조인하면 반복을 줄일 수 있다."],
    validationNotes: ["Starts, Rows, CR 수치가 부모-자식 반복 관계와 일치하도록 검수했다."]
  },
  {
    kind: "lab",
    id: "pdf-lab-15-parallel-insert-plan",
    title: "대량 INSERT SELECT 실행계획 분석",
    topic: "대량 DML과 Parallel",
    difficulty: "최상급",
    mode: "similar",
    status: "similar_verified",
    source: {
      document: sqlExam,
      page: 92,
      answerPage: 136,
      questionNumber: "실기확장 15",
      verifiedBy: "derived_from_verified_original",
      verificationNote: "대량 INSERT SELECT, 병렬 처리, 실행계획 해석을 종합 실습형으로 구성했다."
    },
    scenario: "월말 배송 분석용 테이블에 3개월 주문, 고객, 배송 데이터를 적재한다. 기존 SQL은 고객을 한 건씩 찾는 NL 반복과 불필요한 랜덤 액세스가 커서 야간 배치 제한 시간을 초과한다.",
    requirements: ["대량 INSERT SELECT에 적합한 접근 방식과 힌트를 제안한다.", "고객과 배송 테이블 조인 방식을 Hash Join 중심으로 유도한다.", "APPEND와 PARALLEL 사용 시 제약조건, 인덱스 유지 비용, Undo/Redo 영향까지 설명한다."],
    schemaSql: `CREATE TABLE 주문 (
  주문번호 NUMBER PRIMARY KEY,
  고객번호 NUMBER NOT NULL,
  주문일자 DATE NOT NULL,
  주문금액 NUMBER NOT NULL,
  배송상태 VARCHAR2(10) NOT NULL
);

CREATE TABLE 고객 (
  고객번호 NUMBER PRIMARY KEY,
  고객등급 VARCHAR2(10) NOT NULL,
  활동상태 VARCHAR2(10) NOT NULL
);

CREATE TABLE 배송 (
  주문번호 NUMBER PRIMARY KEY,
  배송일자 DATE,
  배송유형 VARCHAR2(10)
);

CREATE TABLE 주문배송적재 (
  주문번호 NUMBER,
  고객번호 NUMBER,
  고객등급 VARCHAR2(10),
  주문일자 DATE,
  주문금액 NUMBER,
  배송일자 DATE,
  배송유형 VARCHAR2(10)
);`,
    currentSql: `INSERT INTO 주문배송적재
SELECT o.주문번호,
       o.고객번호,
       c.고객등급,
       o.주문일자,
       o.주문금액,
       d.배송일자,
       d.배송유형
FROM 주문 o,
     고객 c,
     배송 d
WHERE o.고객번호 = c.고객번호
  AND o.주문번호 = d.주문번호(+)
  AND o.주문일자 BETWEEN DATE '2026-06-01' AND DATE '2026-08-31';`,
    executionPlan: `교육용 현재 실행계획 예시
------------------------------------------------------------------------------------------------
Id | Operation                         | Name    | Starts | Rows  | Cost | IN-OUT
------------------------------------------------------------------------------------------------
 0 | INSERT STATEMENT                  |         |      1 | 3000K | 9800 |
 1 |  LOAD TABLE CONVENTIONAL          | 주문배송적재 | 1 |       |      |
 2 |  NESTED LOOPS OUTER               |         |      1 | 3000K | 9800 |
 3 |   NESTED LOOPS                    |         |      1 | 3000K | 7600 |
 4 |    TABLE ACCESS FULL              | 주문    |      1 | 3000K | 3100 |
 5 |    TABLE ACCESS BY INDEX ROWID    | 고객    | 3000K | 3000K | 2400 |
 6 |     INDEX UNIQUE SCAN             | 고객_PK | 3000K | 3000K | 1200 |
 7 |   TABLE ACCESS BY INDEX ROWID     | 배송    | 3000K | 2800K | 2200 |
 8 |    INDEX UNIQUE SCAN              | 배송_PK | 3000K | 2800K | 1100 |
------------------------------------------------------------------------------------------------
Predicate Information
4 - filter("O"."주문일자">=DATE '2026-06-01' AND "O"."주문일자"<=DATE '2026-08-31')
6 - access("O"."고객번호"="C"."고객번호")
8 - access("O"."주문번호"="D"."주문번호")`,
    traceSummary: {
      title: "교육용 Trace 핵심 요약",
      headers: ["항목", "값", "의미"],
      rows: [
        ["Rows", "3,000,000", "적재 대상 주문"],
        ["Starts", "3,000,000", "고객/배송 반복 인덱스 탐색"],
        ["CR", "9,840,000", "대량 랜덤 액세스 논리 읽기"],
        ["PR", "126,000", "배치 중 물리 읽기"],
        ["Time", "00:18:42.00", "교육용 비교 기준"]
      ]
    },
    answerSql: `INSERT /*+ APPEND PARALLEL(t 4) */ INTO 주문배송적재 t
SELECT /*+ LEADING(o) USE_HASH(c) USE_HASH(d) FULL(o) FULL(c) FULL(d) PARALLEL(o 4) PARALLEL(c 4) PARALLEL(d 4) */
       o.주문번호,
       o.고객번호,
       c.고객등급,
       o.주문일자,
       o.주문금액,
       d.배송일자,
       d.배송유형
FROM 주문 o
     JOIN 고객 c ON c.고객번호 = o.고객번호
     LEFT JOIN 배송 d ON d.주문번호 = o.주문번호
WHERE o.주문일자 >= DATE '2026-06-01'
  AND o.주문일자 <  DATE '2026-09-01';`,
    acceptedAlternatives: ["주문 기간 조건의 선택도가 높아 파티션 프루닝이 가능한 경우 주문 파티션 범위 스캔과 Hash Join을 조합한 답안 인정", "적재 대상 테이블 인덱스를 작업 후 재생성하는 운영 절차를 함께 제시하면 추가 인정"],
    rubric: ["BETWEEN 말일 조건을 반열린 범위로 고쳐 시간 값을 안전하게 포함해야 한다.", "대량 조인에서 반복 INDEX UNIQUE SCAN을 줄이는 Hash Join 근거를 설명해야 한다.", "APPEND/PARALLEL은 제약조건, 인덱스, 로그, 동시성 영향을 함께 검토해야 한다."],
    explanation: "대량 INSERT SELECT에서 수백만 행을 기준으로 작은 테이블을 반복 INDEX UNIQUE SCAN하면 Starts와 CR이 커진다. 대량 범위는 Hash Join과 병렬 처리, Direct Path Insert를 검토하되 운영 제약과 인덱스 유지 비용을 함께 판단해야 한다.",
    relatedConcepts: ["대량 DML", "Parallel", "Hash Join", "SQL Trace"],
    hints: ["실행계획에서 고객과 배송 접근 Starts가 주문 행 수와 같은지 확인한다.", "대량 적재에서는 한 건씩 찾는 방식보다 집합 조인 방식이 유리할 수 있다.", "APPEND와 PARALLEL은 성능만이 아니라 운영 제약까지 답안에 포함해야 한다."],
    validationNotes: ["Rows, Starts, CR 수치가 반복 랜덤 액세스 병목을 설명하도록 검수했다."]
  },
  {
    kind: "lab",
    id: "pdf-lab-16-conditional-search-rewrite",
    title: "선택 조건 조회 SQL Rewrite",
    topic: "복잡한 조건 조회",
    difficulty: "상급",
    mode: "similar",
    status: "similar_verified",
    source: {
      document: sqlExam,
      page: 76,
      answerPage: 134,
      questionNumber: "실기확장 16",
      verifiedBy: "derived_from_verified_original",
      verificationNote: "선택 파라미터 조건과 인덱스 사용 판단을 실습형으로 재구성했다."
    },
    scenario: "주문 검색 화면에서 고객번호가 입력되면 특정 고객 주문만 조회하고, 입력되지 않으면 기간 내 전체 주문을 조회한다. 현재 SQL은 OR 조건 때문에 고객번호 인덱스 효율이 낮다.",
    requirements: ["고객번호 입력 여부에 따라 인덱스 접근이 달라지도록 SQL을 재작성한다.", "고객번호가 입력된 경우와 입력되지 않은 경우의 접근 경로 차이를 설명한다.", "하나의 만능 조건으로 모든 케이스를 처리하려다 생기는 비효율을 설명한다."],
    schemaSql: `CREATE TABLE 주문검색 (
  주문번호 NUMBER PRIMARY KEY,
  고객번호 NUMBER NOT NULL,
  주문일시 DATE NOT NULL,
  주문상태 VARCHAR2(10) NOT NULL,
  주문금액 NUMBER NOT NULL
);

CREATE INDEX 주문검색_IX01 ON 주문검색(고객번호, 주문일시);
CREATE INDEX 주문검색_IX02 ON 주문검색(주문일시, 주문상태);`,
    currentSql: `SELECT 주문번호, 고객번호, 주문일시, 주문금액
FROM 주문검색
WHERE 주문일시 >= :from_dt
  AND 주문일시 <  :to_dt
  AND 주문상태 = '완료'
  AND (:cust_no IS NULL OR 고객번호 = :cust_no);`,
    executionPlan: `교육용 현재 실행계획 예시
--------------------------------------------------------------------------
Id | Operation                 | Name         | Rows   | Cost
--------------------------------------------------------------------------
 0 | SELECT STATEMENT          |              | 120000 | 1420
 1 |  TABLE ACCESS BY INDEX ROWID | 주문검색   | 120000 | 1420
 2 |   INDEX RANGE SCAN        | 주문검색_IX02| 120000 |  360
--------------------------------------------------------------------------
Predicate Information
2 - access("주문일시">=:from_dt AND "주문일시"<:to_dt)
1 - filter("주문상태"='완료' AND (:cust_no IS NULL OR "고객번호"=:cust_no))`,
    answerSql: `-- 고객번호가 입력된 경우
SELECT 주문번호, 고객번호, 주문일시, 주문금액
FROM 주문검색
WHERE 고객번호 = :cust_no
  AND 주문일시 >= :from_dt
  AND 주문일시 <  :to_dt
  AND 주문상태 = '완료'

UNION ALL

-- 고객번호가 입력되지 않은 경우
SELECT 주문번호, 고객번호, 주문일시, 주문금액
FROM 주문검색
WHERE :cust_no IS NULL
  AND 주문일시 >= :from_dt
  AND 주문일시 <  :to_dt
  AND 주문상태 = '완료';`,
    acceptedAlternatives: ["애플리케이션에서 고객번호 입력 여부에 따라 두 SQL로 분기하는 방식 인정", "옵션 조건이 여러 개인 경우 동적 SQL을 사용하되 바인드 변수 유지 방안을 설명하면 인정"],
    rubric: ["OR 옵션 조건이 고객번호 Access Predicate 형성을 방해할 수 있음을 설명해야 한다.", "고객번호 입력 케이스에서는 고객번호 선두 인덱스 사용 가능성을 열어야 한다.", "입력되지 않은 케이스와 입력된 케이스가 논리적으로 중복 반환되지 않아야 한다."],
    explanation: "옵션 조건을 한 SQL의 OR로 처리하면 선택적인 바인드 값에 따라 인덱스 시작점이 불명확해질 수 있다. 조건 입력 여부에 따라 SQL을 분기하거나 UNION ALL로 분리하면 각 분기에서 더 적절한 Access Predicate를 만들 수 있다.",
    relatedConcepts: ["OR Expansion", "옵션 조건", "Access Predicate"],
    hints: ["OR 안에 바인드 NULL 검사가 있으면 인덱스 시작점이 약해질 수 있다.", "고객번호 입력 케이스와 미입력 케이스는 서로 배타적이다.", "분기별로 다른 인덱스가 쓰일 수 있게 만드는 것이 핵심이다."],
    validationNotes: ["옵션 조건 분기와 UNION ALL 배타성 조건을 검수했다."]
  },
  {
    kind: "lab",
    id: "pdf-lab-17-fix-outer-join-sql",
    title: "잘못된 Outer Join SQL 수정",
    topic: "잘못된 SQL 수정",
    difficulty: "중급",
    mode: "variant",
    status: "variant_verified",
    source: {
      document: sqlExam,
      page: 74,
      answerPage: 134,
      questionNumber: "실기확장 17",
      verifiedBy: "derived_from_verified_original",
      verificationNote: "Outer Join 조건 위치와 COUNT 함정을 SQL 수정형으로 구성했다."
    },
    scenario: "전체 상품별 7월 판매수량을 보여주는 리포트에서 판매가 없는 상품이 누락된다. 상품은 모두 보여야 하며 판매가 없으면 0으로 표시해야 한다.",
    requirements: ["판매가 없는 상품도 보존한다.", "기간 조건 때문에 Outer Join 결과가 사라지지 않게 한다.", "COUNT와 SUM의 NULL 처리 방식을 올바르게 사용한다."],
    schemaSql: `CREATE TABLE 상품 (
  상품번호 NUMBER PRIMARY KEY,
  상품명 VARCHAR2(100) NOT NULL,
  판매상태 VARCHAR2(10) NOT NULL
);

CREATE TABLE 판매 (
  판매번호 NUMBER PRIMARY KEY,
  상품번호 NUMBER NOT NULL,
  판매일자 DATE NOT NULL,
  판매수량 NUMBER NOT NULL,
  CONSTRAINT 판매_FK01 FOREIGN KEY (상품번호) REFERENCES 상품(상품번호)
);

CREATE INDEX 판매_IX01 ON 판매(상품번호, 판매일자);`,
    currentSql: `SELECT p.상품번호,
       p.상품명,
       COUNT(*) AS 판매건수,
       SUM(s.판매수량) AS 판매수량
FROM 상품 p
     LEFT JOIN 판매 s ON s.상품번호 = p.상품번호
WHERE p.판매상태 = '판매중'
  AND s.판매일자 >= DATE '2026-07-01'
  AND s.판매일자 <  DATE '2026-08-01'
GROUP BY p.상품번호, p.상품명;`,
    answerSql: `SELECT p.상품번호,
       p.상품명,
       COUNT(s.판매번호) AS 판매건수,
       NVL(SUM(s.판매수량), 0) AS 판매수량
FROM 상품 p
     LEFT JOIN 판매 s
       ON s.상품번호 = p.상품번호
      AND s.판매일자 >= DATE '2026-07-01'
      AND s.판매일자 <  DATE '2026-08-01'
WHERE p.판매상태 = '판매중'
GROUP BY p.상품번호, p.상품명;`,
    acceptedAlternatives: ["판매를 기간 조건으로 필터링한 인라인 뷰와 상품을 LEFT JOIN하는 방식 인정", "COUNT(s.상품번호)처럼 판매 매칭 행에서 NULL이 아닌 컬럼 기준 집계도 인정"],
    rubric: ["후행 테이블 기간 조건을 ON 절 또는 인라인 뷰 안으로 이동해야 한다.", "COUNT(*)를 후행 테이블 컬럼 COUNT로 바꿔야 한다.", "SUM 결과 NULL은 0으로 처리해야 한다."],
    explanation: "판매 테이블 조건을 WHERE 절에 두면 판매가 없는 상품의 NULL 확장 행이 제거된다. 후행 조건은 ON 절에 두고, 판매건수는 COUNT(s.판매번호)처럼 실제 매칭 행 기준으로 세어야 한다.",
    relatedConcepts: ["Outer Join", "COUNT", "SQL Rewrite"],
    hints: ["판매가 없는 상품은 판매 컬럼이 NULL인 확장 행으로 남아야 한다.", "WHERE 절에서 판매 컬럼을 조건으로 걸면 그 행이 제거된다.", "COUNT(*)는 보존 행 자체를 세므로 판매 없는 상품도 1이 될 수 있다."],
    validationNotes: ["보존 테이블과 후행 테이블 조건 위치를 검수했다."]
  },
  {
    kind: "lab",
    id: "pdf-lab-18-group-by-having",
    title: "집계 및 HAVING 조건 SQL 작성",
    topic: "집계 및 HAVING",
    difficulty: "중급",
    mode: "original",
    status: "original_verified",
    source: {
      document: sqlExam,
      page: 49,
      answerPage: 132,
      questionNumber: "실기확장 18",
      verifiedBy: "derived_from_verified_original",
      verificationNote: "GROUP BY, HAVING, 반품 제외 조건을 실습형으로 정리했다."
    },
    scenario: "월별 채널 매출 집계에서 반품 주문은 제외하고, 정상 주문이 100건 이상인 월-채널 조합만 보고해야 한다.",
    requirements: ["월과 채널 기준으로 집계한다.", "반품 상태 주문은 집계 대상에서 제외한다.", "집계 후 주문건수 100건 이상인 그룹만 반환한다."],
    schemaSql: `CREATE TABLE 채널주문 (
  주문번호 NUMBER PRIMARY KEY,
  주문일자 DATE NOT NULL,
  채널코드 VARCHAR2(10) NOT NULL,
  주문상태 VARCHAR2(10) NOT NULL,
  주문금액 NUMBER NOT NULL
);

CREATE INDEX 채널주문_IX01 ON 채널주문(주문일자, 채널코드, 주문상태);`,
    currentSql: `SELECT TO_CHAR(주문일자, 'YYYYMM') AS 주문월,
       채널코드,
       COUNT(*) AS 주문건수,
       SUM(주문금액) AS 주문금액
FROM 채널주문
GROUP BY TO_CHAR(주문일자, 'YYYYMM'), 채널코드;`,
    answerSql: `SELECT TO_CHAR(주문일자, 'YYYYMM') AS 주문월,
       채널코드,
       COUNT(*) AS 주문건수,
       SUM(주문금액) AS 주문금액
FROM 채널주문
WHERE 주문일자 >= DATE '2026-01-01'
  AND 주문일자 <  DATE '2026-07-01'
  AND 주문상태 <> '반품'
GROUP BY TO_CHAR(주문일자, 'YYYYMM'), 채널코드
HAVING COUNT(*) >= 100;`,
    acceptedAlternatives: ["주문월 가상 컬럼 또는 함수 기반 인덱스가 있는 환경이면 해당 컬럼 기준 GROUP BY 답안 인정", "반품 상태가 NULL 가능이면 NVL 또는 명시적 NULL 정책을 제시한 답안 인정"],
    rubric: ["반품 제외 조건은 집계 전에 적용해야 한다.", "주문건수 기준 100건 이상 조건은 HAVING에 둬야 한다.", "월과 채널 기준 GROUP BY가 요구 결과와 일치해야 한다."],
    explanation: "WHERE는 집계 전 행을 제한하고 HAVING은 집계 후 그룹을 제한한다. 반품 제외는 WHERE, 주문건수 100건 이상은 HAVING COUNT(*) 조건으로 처리해야 한다.",
    relatedConcepts: ["GROUP BY", "HAVING", "WHERE"],
    hints: ["반품 제외는 개별 주문 행 조건이다.", "100건 이상은 그룹을 만든 뒤 알 수 있다.", "행 필터는 WHERE, 그룹 필터는 HAVING이다."],
    validationNotes: ["WHERE와 HAVING 역할 분리를 검수했다."]
  },
  {
    kind: "lab",
    id: "pdf-lab-19-result-reasoning",
    title: "JOIN 결과 행 수 추론",
    topic: "실행 결과 추론",
    difficulty: "상급",
    mode: "variant",
    status: "variant_verified",
    source: {
      document: sqlExam,
      page: 74,
      answerPage: 134,
      questionNumber: "실기확장 19",
      verifiedBy: "derived_from_verified_original",
      verificationNote: "테이블 데이터와 Outer Join 결과 행 수 추론을 실습형으로 구성했다."
    },
    scenario: "EMP와 DEPT 테이블을 LEFT OUTER JOIN했을 때 각 직원 행이 어떻게 보존되는지 설명하고 결과 건수를 계산해야 한다.",
    requirements: ["제시된 샘플 데이터 기준으로 LEFT JOIN 결과 행 수를 계산한다.", "매칭되지 않은 EMP 행이 보존되는 이유를 설명한다.", "중복 매칭이 발생할 때 결과 행이 늘어나는 과정을 설명한다."],
    schemaSql: `CREATE TABLE EMP (
  EMPNO NUMBER PRIMARY KEY,
  DEPT_CODE VARCHAR2(10),
  EMP_NAME VARCHAR2(50)
);

CREATE TABLE DEPT (
  DEPT_CODE VARCHAR2(10),
  DEPT_SEQ NUMBER,
  DEPT_NAME VARCHAR2(50)
);`,
    sampleData: [
      {
        title: "EMP",
        headers: ["EMPNO", "DEPT_CODE", "EMP_NAME"],
        rows: [
          ["1", "A", "KIM"],
          ["2", "B", "LEE"],
          ["3", "B", "PARK"],
          ["4", "C", "CHOI"]
        ]
      },
      {
        title: "DEPT",
        headers: ["DEPT_CODE", "DEPT_SEQ", "DEPT_NAME"],
        rows: [
          ["A", "1", "영업"],
          ["B", "1", "개발"],
          ["B", "2", "품질"]
        ]
      }
    ],
    currentSql: `SELECT e.empno, e.dept_code, d.dept_seq, d.dept_name
FROM emp e
     LEFT JOIN dept d ON d.dept_code = e.dept_code
ORDER BY e.empno, d.dept_seq;`,
    answerSql: `-- 결과 행 수: 6행
-- EMPNO 1은 A 1건과 매칭되어 1행
-- EMPNO 2와 3은 B가 DEPT에서 2건 매칭되어 각각 2행
-- EMPNO 4는 C 매칭이 없어 NULL 확장 행 1행
-- 따라서 1 + 2 + 2 + 1 = 6행이다.

SELECT e.empno, e.dept_code, d.dept_seq, d.dept_name
FROM emp e
     LEFT JOIN dept d ON d.dept_code = e.dept_code
ORDER BY e.empno, d.dept_seq;`,
    acceptedAlternatives: ["결과 행을 직접 나열해 6행임을 보인 답안 인정", "DEPT_CODE별 매칭 건수를 곱해 계산한 설명 인정"],
    rubric: ["LEFT JOIN에서 EMP 행이 모두 보존됨을 설명해야 한다.", "B 부서의 DEPT 2건 매칭이 EMPNO 2와 3 각각에 적용됨을 계산해야 한다.", "C 부서는 매칭이 없어 NULL 확장 행 1행으로 남음을 설명해야 한다."],
    explanation: "LEFT JOIN은 왼쪽 EMP 행을 보존한다. A는 1건, B는 DEPT 2건에 매칭되므로 B 소속 직원 2명이 각각 2행씩 생성되고, C는 매칭이 없어 NULL 확장 1행이 된다. 총 1+2+2+1=6행이다.",
    relatedConcepts: ["Outer Join", "결과 행 수", "중복 매칭"],
    hints: ["왼쪽 테이블의 각 행을 기준으로 오른쪽 매칭 건수를 셉니다.", "B는 오른쪽 테이블에 두 건 있습니다.", "매칭이 없는 C도 LEFT JOIN에서는 한 행 남습니다."],
    validationNotes: ["샘플 데이터별 매칭 건수와 총 행 수를 검수했다."]
  },
  {
    kind: "lab",
    id: "pdf-lab-20-trace-index-join-review",
    title: "Trace 기반 인덱스와 조인 순서 종합 튜닝",
    topic: "종합 튜닝",
    difficulty: "최상급",
    mode: "similar",
    status: "similar_verified",
    source: {
      document: sqlExam,
      page: 93,
      answerPage: 136,
      questionNumber: "실기확장 20",
      verifiedBy: "derived_from_verified_original",
      verificationNote: "Trace, Predicate, 인덱스, 조인 순서 판단을 종합 실습형으로 구성했다."
    },
    scenario: "상담 이력 조회 화면에서 특정 고객의 최근 상담 30건을 보여준다. 결과는 30건뿐인데 Trace에서 CR이 높고 실행계획은 상담유형 조건을 필터로 처리한다.",
    requirements: ["Rows 대비 CR이 높은 원인을 실행계획과 Predicate로 설명한다.", "최근 30건 부분범위 처리가 가능하도록 인덱스와 SQL을 제안한다.", "상담유형 조건이 Access Predicate가 되도록 결합 인덱스 순서를 설명한다."],
    schemaSql: `CREATE TABLE 상담이력 (
  상담번호 NUMBER PRIMARY KEY,
  고객번호 NUMBER NOT NULL,
  상담유형 VARCHAR2(10) NOT NULL,
  상담일시 DATE NOT NULL,
  상담상태 VARCHAR2(10) NOT NULL,
  상담내용 VARCHAR2(4000)
);

CREATE INDEX 상담이력_IX01 ON 상담이력(고객번호, 상담일시);
CREATE INDEX 상담이력_IX02 ON 상담이력(상담유형, 상담상태);`,
    currentSql: `SELECT *
FROM (
  SELECT 상담번호, 고객번호, 상담유형, 상담일시, 상담상태
  FROM 상담이력
  WHERE 고객번호 = :cust_no
    AND 상담유형 = :call_type
    AND 상담상태 = '완료'
  ORDER BY 상담일시 DESC
)
WHERE ROWNUM <= 30;`,
    executionPlan: `교육용 현재 실행계획 예시
------------------------------------------------------------------------------------
Id | Operation                       | Name          | Starts | Rows | Cost
------------------------------------------------------------------------------------
 0 | SELECT STATEMENT                |               |      1 |   30 |  410
 1 |  COUNT STOPKEY                  |               |      1 |   30 |  410
 2 |   VIEW                          |               |      1 | 3200 |  410
 3 |    SORT ORDER BY STOPKEY        |               |      1 | 3200 |  410
 4 |     TABLE ACCESS BY INDEX ROWID | 상담이력      |      1 | 3200 |  390
 5 |      INDEX RANGE SCAN           | 상담이력_IX01 |      1 | 8200 |   45
------------------------------------------------------------------------------------
Predicate Information
5 - access("고객번호"=:cust_no)
4 - filter("상담유형"=:call_type AND "상담상태"='완료')`,
    traceSummary: {
      title: "교육용 Trace 핵심 요약",
      headers: ["항목", "값", "의미"],
      rows: [
        ["Rows", "30", "최종 반환 행"],
        ["Index Rows", "8,200", "고객번호로 읽은 인덱스 행"],
        ["CR", "42,600", "필터 후 버려진 테이블 방문 포함"],
        ["PR", "380", "일부 테이블 블록 물리 읽기"],
        ["Time", "00:00:04.80", "화면 응답 지연"]
      ]
    },
    answerSql: `CREATE INDEX 상담이력_IX03 ON 상담이력(고객번호, 상담유형, 상담상태, 상담일시 DESC);

SELECT 상담번호, 고객번호, 상담유형, 상담일시, 상담상태
FROM (
  SELECT /*+ INDEX_DESC(h 상담이력_IX03) */
         상담번호, 고객번호, 상담유형, 상담일시, 상담상태
  FROM 상담이력 h
  WHERE 고객번호 = :cust_no
    AND 상담유형 = :call_type
    AND 상담상태 = '완료'
  ORDER BY 상담일시 DESC
)
WHERE ROWNUM <= 30;`,
    acceptedAlternatives: ["인덱스에 상담상태와 상담유형 순서를 바꾸는 대안은 두 컬럼의 선택도와 업무 조건 빈도를 근거로 제시하면 부분 인정", "인덱스만으로 필요한 컬럼을 모두 포함해 테이블 액세스를 줄이는 커버링 설계는 추가 인정"],
    rubric: ["현재 인덱스가 고객번호만 Access Predicate로 사용하고 나머지를 Filter로 처리함을 설명해야 한다.", "Top-N 부분범위 처리를 위해 정렬 컬럼 DESC를 인덱스 뒤쪽에 둬야 한다.", "최종 Rows는 30이지만 중간 Index Rows와 CR이 큰 이유를 설명해야 한다."],
    explanation: "현재 인덱스는 고객번호로 넓게 읽은 뒤 상담유형과 상담상태를 테이블 방문 후 필터링한다. 고객번호, 상담유형, 상담상태를 등치 조건으로 묶고 상담일시 DESC를 뒤에 두면 필요한 최근 30건을 더 빨리 찾고 정렬과 테이블 방문을 줄일 수 있다.",
    relatedConcepts: ["인덱스 스캔 효율화", "Top-N", "SQL Trace"],
    hints: ["최종 Rows가 30인데 Index Rows와 CR이 큰 이유를 찾습니다.", "Access Predicate와 Filter Predicate를 구분합니다.", "등치 조건 뒤에 정렬 컬럼 DESC를 둔 인덱스가 부분범위 처리에 유리합니다."],
    validationNotes: ["Trace 수치와 Predicate 비효율, 목표 인덱스 설계의 관계를 검수했다."]
  }
];

type Subject3LabInput = {
  id: string;
  title: string;
  topic: string;
  difficulty: PdfReviewDifficulty;
  mode: PdfReviewMode;
  document: string;
  page: number;
  answerPage?: number;
  questionNumber: string;
  verificationNote: string;
  scenario: string;
  requirements: string[];
  schemaSql: string;
  sampleData?: PdfReviewTable[];
  currentSql?: string;
  executionPlan?: string;
  traceSummary?: PdfReviewTable;
  answerSql: string;
  acceptedAlternatives?: string[];
  rubric: string[];
  explanation: string;
  relatedConcepts: string[];
  hints: string[];
};

function verifiedStatusForMode(mode: PdfReviewMode): PdfReviewStatus {
  if (mode === "original") return "original_verified";
  if (mode === "variant") return "variant_verified";
  return "similar_verified";
}

function subject3Lab(input: Subject3LabInput): PdfReviewLab {
  return {
    kind: "lab",
    id: input.id,
    title: input.title,
    topic: input.topic,
    difficulty: input.difficulty,
    mode: input.mode,
    status: verifiedStatusForMode(input.mode),
    source: {
      document: input.document,
      page: input.page,
      answerPage: input.answerPage,
      questionNumber: input.questionNumber,
      verifiedBy: input.mode === "original" ? "page_render_and_answer_key" : "derived_from_verified_original",
      verificationNote: input.verificationNote
    },
    scenario: input.scenario,
    requirements: input.requirements,
    schemaSql: input.schemaSql,
    sampleData: input.sampleData,
    currentSql: input.currentSql,
    executionPlan: input.executionPlan,
    traceSummary: input.traceSummary,
    answerSql: input.answerSql,
    acceptedAlternatives: input.acceptedAlternatives ?? ["동일 결과와 동일 튜닝 근거를 만족하는 SQL Rewrite는 인정한다."],
    rubric: input.rubric,
    explanation: input.explanation,
    relatedConcepts: input.relatedConcepts,
    hints: input.hints,
    validationNotes: ["PDF/이미지 레이아웃으로 확인한 SQLP 3과목 실기 출제 스타일을 기준으로 수작업 검수했다."]
  };
}

export const rejectedSubject3InspiredLabs: PdfReviewLab[] = [
  subject3Lab({
    id: "subject3-lab-01-contract-sargable",
    title: "계약일자 좌변 변형 제거",
    topic: "인덱스 컬럼 좌변 변형 제거",
    difficulty: "상급",
    mode: "original",
    document: subject3Full,
    page: 6,
    answerPage: 6,
    questionNumber: "실기 01",
    verificationNote: "계약일자 함수 변형 제거와 상품코드 NVL 제거 실기 유형을 반영했다.",
    scenario: "계약 테이블에서 2026년 7월 특정 상품의 계약 건수를 조회한다. 계약일자, 상품코드 순서의 결합 인덱스가 있지만 현재 SQL은 Full Table Scan으로 수행된다.",
    requirements: ["계약일자 인덱스 Range Scan이 가능하도록 SQL을 재작성한다.", "상품코드 조건에서 컬럼 좌변 변형을 제거한다.", "시간 값이 포함된 DATE 컬럼에서도 누락이 없도록 범위를 작성한다."],
    schemaSql: "",
    currentSql: `SELECT COUNT(*)
FROM 계약
WHERE TO_CHAR(계약일자, 'YYYYMM') = '202607'
  AND NVL(상품코드, 'X') = 'P001';`,
    executionPlan: `교육용 현재 실행계획
Id | Operation          | Name | Rows  | Cost
0  | SELECT STATEMENT   |      |     1 | 1280
1  |  SORT AGGREGATE    |      |     1 |
2  |   TABLE ACCESS FULL| 계약 | 85000 | 1280
Predicate Information
2 - filter(TO_CHAR("계약일자",'YYYYMM')='202607' AND NVL("상품코드",'X')='P001')`,
    answerSql: `SELECT COUNT(*)
FROM 계약
WHERE 계약일자 >= TO_DATE('20260701', 'YYYYMMDD')
  AND 계약일자 <  TO_DATE('20260801', 'YYYYMMDD')
  AND 상품코드 = 'P001';`,
    rubric: ["계약일자에 TO_CHAR를 적용하지 않아야 한다.", "월 조건은 반열린 날짜 범위로 작성해야 한다.", "상품코드에 NVL을 적용하지 않아야 한다."],
    explanation: "인덱스 컬럼에 함수가 적용되면 인덱스 키 원본 순서를 활용하기 어렵다. 날짜 컬럼은 시작일 이상, 다음 달 시작일 미만으로 쓰고 상품코드는 단순 등치 조건으로 두어야 한다.",
    relatedConcepts: ["SARGable Predicate", "Index Range Scan", "좌변 변형"],
    hints: ["계약일자 컬럼이 함수의 입력으로 들어가는지 본다.", "DATE 컬럼의 월 조건은 BETWEEN 말일보다 반열린 범위가 안전하다.", "NVL(상품코드, 'X')는 상품코드 인덱스 활용을 방해할 수 있다."]
  }),
  subject3Lab({
    id: "subject3-lab-02-exists-semi-join",
    title: "DISTINCT 제거와 EXISTS Semi Join",
    topic: "Semi Join 튜닝",
    difficulty: "상급",
    mode: "original",
    document: subject3Full,
    page: 7,
    answerPage: 7,
    questionNumber: "실기 02",
    verificationNote: "1:N 조인 중복 제거를 EXISTS로 바꾸는 실기 유형을 반영했다.",
    scenario: "고객 100만 건, 주문 5,000만 건 환경에서 2026년 주문 이력이 있는 VIP 고객을 조회한다. DISTINCT 때문에 Sort Unique와 Temp I/O가 크게 발생한다.",
    requirements: ["고객 중복 제거 목적의 DISTINCT를 제거한다.", "주문 존재 여부만 확인하도록 SQL을 재작성한다.", "Semi Join의 Short-Circuit 효과를 설명한다."],
    schemaSql: "",
    currentSql: `SELECT DISTINCT c.고객ID, c.고객명, c.고객등급
FROM 고객 c
JOIN 주문 o ON o.고객ID = c.고객ID
WHERE c.고객등급 = 'VIP'
  AND o.주문일자 >= '20260101';`,
    answerSql: `SELECT c.고객ID, c.고객명, c.고객등급
FROM 고객 c
WHERE c.고객등급 = 'VIP'
  AND EXISTS (
    SELECT 1
    FROM 주문 o
    WHERE o.고객ID = c.고객ID
      AND o.주문일자 >= '20260101'
  );`,
    rubric: ["주문 조인으로 늘어난 고객 중복을 DISTINCT로 제거하지 않아야 한다.", "EXISTS로 존재 여부만 확인해야 한다.", "첫 매칭 후 탐색을 멈출 수 있는 Semi Join 효과를 설명해야 한다."],
    explanation: "1:N 조인 결과 중복을 DISTINCT로 제거하면 대량 정렬이 발생한다. EXISTS는 고객별 주문 존재 여부만 확인하므로 불필요한 중복 생성과 Sort Unique를 피할 수 있다.",
    relatedConcepts: ["EXISTS", "Semi Join", "Sort Unique"],
    hints: ["고객 정보는 한 번만 필요하고 주문 상세 행은 필요 없다.", "DISTINCT는 조인으로 늘어난 행을 다시 줄이는 비용이다.", "존재 여부는 EXISTS가 더 자연스럽다."]
  }),
  subject3Lab({
    id: "subject3-lab-03-single-scan-pivot",
    title: "반복 스칼라 서브쿼리 단일 스캔 전환",
    topic: "Pivot형 집계 Rewrite",
    difficulty: "상급",
    mode: "original",
    document: subject3Full,
    page: 8,
    answerPage: 8,
    questionNumber: "실기 03",
    verificationNote: "월별 반복 스캔을 CASE 집계로 바꾸는 실기 유형을 반영했다.",
    scenario: "월별일계 2,000만 건에서 2025년 1월부터 6월까지 월별 매출 합계를 한 행으로 출력한다. 기존 SQL은 같은 테이블을 월별로 반복 스캔한다.",
    requirements: ["월별일계 테이블을 한 번만 스캔하도록 재작성한다.", "월별 컬럼은 조건부 집계로 만든다.", "반복 Full Scan이 왜 비효율인지 설명한다."],
    schemaSql: "",
    currentSql: `SELECT
  (SELECT SUM(매출액) FROM 월별일계 WHERE 매출년월 = '202501') AS M01,
  (SELECT SUM(매출액) FROM 월별일계 WHERE 매출년월 = '202502') AS M02,
  (SELECT SUM(매출액) FROM 월별일계 WHERE 매출년월 = '202503') AS M03,
  (SELECT SUM(매출액) FROM 월별일계 WHERE 매출년월 = '202504') AS M04,
  (SELECT SUM(매출액) FROM 월별일계 WHERE 매출년월 = '202505') AS M05,
  (SELECT SUM(매출액) FROM 월별일계 WHERE 매출년월 = '202506') AS M06
FROM dual;`,
    answerSql: `SELECT
  SUM(CASE WHEN 매출년월 = '202501' THEN 매출액 END) AS M01,
  SUM(CASE WHEN 매출년월 = '202502' THEN 매출액 END) AS M02,
  SUM(CASE WHEN 매출년월 = '202503' THEN 매출액 END) AS M03,
  SUM(CASE WHEN 매출년월 = '202504' THEN 매출액 END) AS M04,
  SUM(CASE WHEN 매출년월 = '202505' THEN 매출액 END) AS M05,
  SUM(CASE WHEN 매출년월 = '202506' THEN 매출액 END) AS M06
FROM 월별일계
WHERE 매출년월 BETWEEN '202501' AND '202506';`,
    rubric: ["동일 테이블 반복 서브쿼리를 제거해야 한다.", "대상 월 범위를 한 번에 제한해야 한다.", "SUM(CASE) 또는 DECODE 집계로 월별 컬럼을 만들어야 한다."],
    explanation: "동일 테이블을 월별 스칼라 서브쿼리로 반복 조회하면 I/O가 월 수만큼 증가한다. 조건부 집계를 사용하면 대상 기간을 한 번 스캔하면서 월별 합계를 동시에 계산할 수 있다.",
    relatedConcepts: ["Scalar Subquery", "CASE 집계", "Single Pass"],
    hints: ["FROM dual에 달린 스칼라 서브쿼리 개수를 셉니다.", "월별로 같은 테이블을 반복 읽고 있습니다.", "조건부 집계는 한 번 스캔한 행을 여러 컬럼으로 나눌 수 있습니다."]
  }),
  subject3Lab({
    id: "subject3-lab-04-hash-join-build",
    title: "대량 배치 Hash Join 힌트 작성",
    topic: "Hash Join Build Input",
    difficulty: "최상급",
    mode: "original",
    document: subject3Full,
    page: 8,
    answerPage: 8,
    questionNumber: "실기 04",
    verificationNote: "NL Join Random I/O를 Hash Join으로 바꾸는 실기 유형을 반영했다.",
    scenario: "상품기본 10만 건과 일별상품판매 1억 건을 조인해 반기 매출을 집계한다. 현재는 NL Join으로 풀려 대량 Random I/O가 발생한다.",
    requirements: ["배치 집계에 적합한 Hash Join 힌트를 작성한다.", "상품기본을 Build Input으로 두는 이유를 설명한다.", "NL Join이 왜 대량 배치에 불리한지 설명한다."],
    schemaSql: "",
    currentSql: `SELECT p.상품카테고리, SUM(s.판매금액) AS 총판매금액
FROM 상품기본 p
JOIN 일별상품판매 s ON s.상품코드 = p.상품코드
WHERE s.판매일자 BETWEEN '20260101' AND '20260630'
GROUP BY p.상품카테고리;`,
    executionPlan: `교육용 현재 실행계획
Id | Operation                    | Name            | Starts | Rows
0  | SELECT STATEMENT             |                 |      1 |   50
1  |  HASH GROUP BY               |                 |      1 |   50
2  |   NESTED LOOPS               |                 |      1 |  80M
3  |    TABLE ACCESS FULL         | 상품기본        |      1 | 100K
4  |    TABLE ACCESS BY INDEX ROWID| 일별상품판매   | 100000 |  800
5  |     INDEX RANGE SCAN         | 일별상품판매_IX01|100000 |  800`,
    answerSql: `SELECT /*+ LEADING(p s) USE_HASH(s) SWAP_JOIN_INPUTS(p) */
       p.상품카테고리, SUM(s.판매금액) AS 총판매금액
FROM 상품기본 p
JOIN 일별상품판매 s ON s.상품코드 = p.상품코드
WHERE s.판매일자 BETWEEN '20260101' AND '20260630'
GROUP BY p.상품카테고리;`,
    rubric: ["NL Join 반복 탐색 병목을 지적해야 한다.", "Hash Join을 유도하는 힌트를 작성해야 한다.", "작은 상품기본을 Build Input으로 둬야 하는 이유를 설명해야 한다."],
    explanation: "대량 판매 집합을 상품별로 반복 인덱스 탐색하면 Random I/O가 커진다. 작은 상품기본을 Build Input으로 Hash Area에 올리고 큰 판매 집합을 Probe하는 Hash Join이 배치 집계에 적합할 수 있다.",
    relatedConcepts: ["Hash Join", "Build Input", "Batch Tuning"],
    hints: ["일별상품판매 접근 Starts가 상품기본 행 수만큼 반복되는지 봅니다.", "배치 집계는 전체 처리량이 중요합니다.", "Hash Join에서는 작은 쪽 Build Input이 유리합니다."]
  }),
  subject3Lab({
    id: "subject3-lab-05-topn-sort-omission",
    title: "Top-N 정렬 제거와 Stopkey",
    topic: "Sort Omission",
    difficulty: "상급",
    mode: "original",
    document: subject3Full,
    page: 9,
    answerPage: 9,
    questionNumber: "실기 05",
    verificationNote: "INDEX_DESC와 COUNT STOPKEY를 이용한 페이징 튜닝 실기 유형을 반영했다.",
    scenario: "게시글 테이블에는 게시판ID, 작성일자 DESC, 게시글ID 순서의 결합 인덱스가 있다. 최근 게시글 10건 조회에서 SORT ORDER BY가 발생한다.",
    requirements: ["인덱스 정렬 순서를 활용해 Sort 연산을 제거한다.", "ROWNUM Stopkey로 10건만 읽고 멈추게 한다.", "ORDER BY 생략 또는 힌트 사용 시 결과 정렬 보장 조건을 설명한다."],
    schemaSql: "",
    currentSql: `SELECT *
FROM (
  SELECT 게시글ID, 제목, 작성자ID, 작성일자
  FROM 게시글
  WHERE 게시판ID = 'FREE'
  ORDER BY 작성일자 DESC
)
WHERE ROWNUM <= 10;`,
    answerSql: `SELECT *
FROM (
  SELECT /*+ INDEX_DESC(a 게시글_IX01) */
         게시글ID, 제목, 작성자ID, 작성일자
  FROM 게시글 a
  WHERE 게시판ID = 'FREE'
)
WHERE ROWNUM <= 10;`,
    rubric: ["게시판ID 등치 조건과 작성일자 DESC 인덱스 순서를 활용해야 한다.", "COUNT STOPKEY 또는 부분범위 처리 효과를 설명해야 한다.", "불필요한 SORT ORDER BY 제거 근거를 제시해야 한다."],
    explanation: "인덱스가 게시판ID별 작성일자 DESC 순서로 정렬되어 있으므로 해당 인덱스를 역순/정렬 순서대로 읽으면 최근 10건을 조기 종료할 수 있다. 이때 SORT ORDER BY와 대량 스캔을 줄일 수 있다.",
    relatedConcepts: ["Top-N", "COUNT STOPKEY", "Index Scan"],
    hints: ["인덱스 컬럼 순서가 WHERE와 ORDER BY를 동시에 만족하는지 봅니다.", "최근 10건만 필요하므로 전체 정렬은 비효율입니다.", "INDEX_DESC와 ROWNUM 조건의 결합을 생각합니다."]
  }),
  subject3Lab({
    id: "subject3-lab-06-order-delivery-batch",
    title: "주문배송 야간 배치 SQL 튜닝",
    topic: "파티션 배치 종합 튜닝",
    difficulty: "최상급",
    mode: "similar",
    document: sqlExam,
    page: 101,
    answerPage: 136,
    questionNumber: "실기문제 6 변형",
    verificationNote: "사용자가 제공한 실기문제 6 이미지의 주문-배송-고객, 파티션, 인덱스 구성 스타일을 반영했다.",
    scenario: "주문, 배송, 고객 정보를 읽어 주문배송 적재 테이블에 입력하는 야간 배치다. 대상 주문 데이터는 2026년 6월부터 8월까지 3개월이며 월별 배송건수는 900만 건, 고객 수는 500만 명이다.",
    requirements: ["주문일자와 배송일자 Range Partition을 활용한다.", "주문배송상태코드와 배송상태코드 인덱스를 활용할 수 있는 조인 순서를 제안한다.", "배치 목적에 맞는 병렬 처리와 Direct Path Insert 적용 여부를 설명한다.", "아래 인덱스 구성에서 어떤 인덱스가 핵심인지 제시한다."],
    schemaSql: `고객
- 고객번호(PK)
- 고객명
- 고객연락처
- 등록일시

주문
- 주문번호(PK)
- 주문일자
- 주문고객번호
- 주문상품수
- 주문금액
- 주문상태코드
- 할인금액
- 배송지주소코드
- 배송지주소상세

배송
- 배송번호(PK)
- 주문번호
- 배송일자
- 배송상태코드
- 배송업체번호
- 배송기사연락처

파티션 구성
- 주문: 주문일자 기준 월 단위 Range Partition
- 배송: 배송일자 기준 월 단위 Range Partition

인덱스 구성
- 주문_PK: 주문번호
- 주문_N1: 주문상태코드 + 주문일자 LOCAL
- 주문_N2: 주문고객번호 + 주문일자 LOCAL
- 배송_PK: 배송번호
- 배송_N1: 주문번호 + 배송일자 LOCAL
- 배송_N2: 배송일자 + 배송상태코드 LOCAL
- 고객_PK: 고객번호
- 고객_N1: 고객명 + 고객번호`,
    currentSql: `INSERT INTO 주문배송
SELECT o.주문번호, o.주문일자, c.고객번호, c.고객명,
       d.배송번호, d.배송일자, d.배송상태코드
FROM 주문 o, 배송 d, 고객 c
WHERE o.주문번호 = d.주문번호
  AND o.주문고객번호 = c.고객번호
  AND o.주문일자 BETWEEN DATE '2026-06-01' AND DATE '2026-08-31'
  AND d.배송일자 BETWEEN DATE '2026-06-01' AND DATE '2026-08-31'
  AND o.주문상태코드 = '완료'
  AND d.배송상태코드 = '배송완료';`,
    executionPlan: `목표 실행계획 방향
- 주문_N1 LOCAL INDEX RANGE SCAN: 주문상태코드 + 주문일자 조건으로 3개월 파티션 접근
- 배송_N1 LOCAL INDEX RANGE SCAN 또는 HASH JOIN: 주문번호 조인과 배송일자 파티션 범위 활용
- 고객_PK INDEX UNIQUE SCAN: 주문고객번호로 고객 단건 확인
- 대량 적재 시 APPEND/PARALLEL 적용 여부 검토

주의: 실제 Oracle 측정값이 아닌 실기 풀이용 목표 방향이다.`,
    answerSql: `INSERT /*+ APPEND PARALLEL(t 4) */ INTO 주문배송 t
SELECT /*+ LEADING(o d c) USE_HASH(d) USE_NL(c) INDEX(o 주문_N1) INDEX(d 배송_N1) */
       o.주문번호, o.주문일자, c.고객번호, c.고객명,
       d.배송번호, d.배송일자, d.배송상태코드
FROM 주문 o
JOIN 배송 d
  ON d.주문번호 = o.주문번호
 AND d.배송일자 >= DATE '2026-06-01'
 AND d.배송일자 <  DATE '2026-09-01'
JOIN 고객 c
  ON c.고객번호 = o.주문고객번호
WHERE o.주문일자 >= DATE '2026-06-01'
  AND o.주문일자 <  DATE '2026-09-01'
  AND o.주문상태코드 = '완료'
  AND d.배송상태코드 = '배송완료';`,
    acceptedAlternatives: ["배송을 먼저 파티션 범위로 줄인 뒤 주문과 Hash Join하는 계획도 배송 선택도가 더 높다는 근거가 있으면 인정", "APPEND/PARALLEL은 운영 Lock과 로그 정책을 함께 설명한 경우에만 인정"],
    rubric: ["BETWEEN 말일 조건 대신 반열린 범위로 작성해야 한다.", "월 단위 파티션 프루닝을 설명해야 한다.", "주문/배송 Local Index와 조인 방식 선택 근거를 제시해야 한다.", "대량 INSERT의 APPEND/PARALLEL 부작용을 함께 설명해야 한다."],
    explanation: "실기문제 6 유형은 단순 SQL 작성이 아니라 ERD, 파티션, 인덱스, 데이터량을 한 번에 보고 배치 SQL의 접근 경로를 설계하는 문제다. 주문/배송 날짜 범위는 파티션 프루닝이 가능하도록 반열린 범위로 쓰고, 주문상태 및 배송상태 조건과 조인 키 인덱스를 함께 고려해야 한다.",
    relatedConcepts: ["Partition Pruning", "Batch Tuning", "Local Index", "Direct Path Insert"],
    hints: ["문제의 파티션 기준 컬럼이 주문일자와 배송일자인지 먼저 확인합니다.", "상태코드와 날짜가 함께 있는 Local Index를 찾아봅니다.", "3개월 대량 적재는 최초 응답보다 전체 처리량이 중요합니다."]
  }),
  subject3Lab({
    id: "subject3-lab-07-partition-index-classification",
    title: "파티션 인덱스 유형 분류",
    topic: "Local/Global 파티션 인덱스",
    difficulty: "상급",
    mode: "original",
    document: sqlExam,
    page: 99,
    answerPage: 135,
    questionNumber: "객관식 78-79 실기화",
    verificationNote: "SQL-자격검정 실전문제의 파티션 인덱스 분류 유형을 실습형으로 확장했다.",
    scenario: "거래 테이블과 두 개의 인덱스 DDL을 보고 각 인덱스가 Global/Local 및 Prefixed/Nonprefixed 중 어디에 해당하는지 판단해야 한다.",
    requirements: ["테이블 파티션 키와 인덱스 선두 컬럼을 비교한다.", "GLOBAL PARTITION BY와 LOCAL 선언을 구분한다.", "각 인덱스 유형과 조회/관리상 특징을 설명한다."],
    schemaSql: `CREATE TABLE 거래 (
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
    answerSql: `-- 분류 답안
거래_IDX1: Global Prefixed Partition Index
  - GLOBAL로 선언된 파티션 인덱스
  - 인덱스 선두 컬럼이 거래일자이며 인덱스 파티션 키와 일치

거래_IDX2: Local Nonprefixed Partition Index
  - LOCAL로 선언되어 테이블 파티션과 1:1 대응
  - 테이블 파티션 키 거래일자가 인덱스 선두가 아니고 두 번째 컬럼`,
    rubric: ["GLOBAL/LOCAL 선언을 먼저 식별해야 한다.", "Prefixed 여부는 파티션 키가 인덱스 선두인지로 판단해야 한다.", "LOCAL이라고 해서 항상 Prefixed가 아님을 설명해야 한다."],
    explanation: "파티션 인덱스 분류는 선언 방식과 컬럼 순서를 함께 봐야 한다. 거래_IDX1은 GLOBAL 파티션 인덱스이며 거래일자가 선두라 Prefixed다. 거래_IDX2는 LOCAL이지만 계좌번호가 선두라 Local Nonprefixed다.",
    relatedConcepts: ["Partition Index", "Local Prefixed", "Global Prefixed"],
    hints: ["LOCAL과 Prefixed를 같은 말로 보면 안 됩니다.", "Prefixed는 파티션 키가 인덱스 왼쪽부터 시작하는지 보는 개념입니다.", "IDX2는 거래일자가 포함되어 있지만 선두가 아닙니다."]
  }),
  subject3Lab({
    id: "subject3-lab-08-pq-distribute",
    title: "병렬 조인 데이터 분배 방식 선택",
    topic: "PQ_DISTRIBUTE",
    difficulty: "최상급",
    mode: "variant",
    document: sqlExam,
    page: 100,
    answerPage: 136,
    questionNumber: "객관식 82 실기화",
    verificationNote: "병렬 실행계획의 동적 재분배 문제와 pq_distribute 힌트 판단을 실습형으로 구성했다.",
    scenario: "주문은 주문일자 Range Partition, 고객번호 Hash Subpartition 구조이고 고객은 비파티션 테이블이다. 병렬 조인에서 주문 데이터가 조인 키 기준으로 다시 재분배되어 평소보다 3배 이상 느려졌다.",
    requirements: ["현재 병렬 실행계획에서 PX SEND HASH가 병목이 되는 이유를 설명한다.", "큰 주문 테이블의 재분배를 줄이는 분배 방식을 제안한다.", "힌트는 데이터량과 파티션 구조를 근거로 선택한다."],
    schemaSql: `주문: 주문일자 Range Partition + 고객번호 Hash Subpartition, 월 평균 2,000만 건
고객: Non-Partitioned, 100만 건

현재 SQL
SELECT /*+ ordered use_hash(o) parallel(c 2) parallel(o 2) */
       o.고객번호, SUM(o.주문금액), MIN(c.등급코드)
FROM 고객 c, 주문 o
WHERE o.고객번호 = c.고객번호
  AND o.주문일자 BETWEEN '20100901' AND '20100930'
GROUP BY o.고객번호;`,
    executionPlan: `교육용 현재 실행계획
Id | Operation              | Name      | TQ       | IN-OUT
 2 | PX SEND QC (RANDOM)    | :TQ10003  | Q1,03    | P->S
 5 | PX SEND HASH           | :TQ10002  | Q1,02    | P->P
 7 | HASH JOIN              |           | Q1,02    | PCWP
 9 | PX SEND HASH           | :TQ10000  | Q1,00    | P->P
11 | TABLE ACCESS FULL      | 고객      | Q1,00    | PCWP
13 | PX SEND HASH           | :TQ10001  | Q1,01    | P->P
15 | TABLE ACCESS FULL      | 주문      | Q1,01    | PCWP`,
    answerSql: `SELECT /*+ ordered use_hash(o) parallel(c 2) parallel(o 2) pq_distribute(o none broadcast) */
       o.고객번호, SUM(o.주문금액), MIN(c.등급코드)
FROM 고객 c, 주문 o
WHERE o.고객번호 = c.고객번호
  AND o.주문일자 >= '20100901'
  AND o.주문일자 <  '20101001'
GROUP BY o.고객번호;`,
    acceptedAlternatives: ["실제 분배 방향은 실행계획에서 inner/outer 입력과 데이터량을 확인해 조정해야 한다는 설명 포함 시 인정", "고객 조건으로 고객이 매우 작아지는 경우 BROADCAST 계열 힌트 제안 인정"],
    rubric: ["PX SEND HASH로 양쪽 데이터가 재분배되는 병목을 설명해야 한다.", "큰 주문 데이터 이동을 줄이는 방향을 제시해야 한다.", "pq_distribute 힌트 선택 근거를 데이터량과 파티션 구조로 설명해야 한다."],
    explanation: "병렬 Hash Join에서는 데이터 분배 방식이 성능을 좌우한다. 큰 주문 테이블을 다시 HASH 재분배하면 통신량이 커지므로 기존 파티션 구조를 활용하고 작은 고객 집합을 Broadcast하는 방식을 검토할 수 있다.",
    relatedConcepts: ["Parallel Query", "PQ_DISTRIBUTE", "Hash Join"],
    hints: ["PX SEND HASH가 몇 번 발생하는지 봅니다.", "큰 주문과 작은 고객 중 어느 쪽을 이동시키는 것이 싼지 판단합니다.", "기존 Hash Subpartition이 조인 키와 맞는지 확인합니다."]
  }),
  subject3Lab({
    id: "subject3-lab-09-direct-path-lock",
    title: "Direct Path Insert 동시성 분석",
    topic: "Direct Path Insert Lock",
    difficulty: "상급",
    mode: "original",
    document: sqlExam,
    page: 96,
    answerPage: 135,
    questionNumber: "객관식 70 실기화",
    verificationNote: "APPEND INSERT ALL과 병렬 DML Lock 판단 유형을 실습형으로 구성했다.",
    scenario: "두 세션이 같은 월별시세 적재 테이블에 INSERT /*+ APPEND */ ALL 문장을 순차적으로 실행한다. 첫 세션이 커밋 전이고 두 번째 세션이 다른 분기 데이터를 적재한다.",
    requirements: ["APPEND Direct Path Insert가 일반 INSERT와 다른 잠금 특성을 설명한다.", "두 번째 세션이 왜 대기할 수 있는지 TM Lock 관점에서 설명한다.", "운영 배치에서 동시 실행을 피하거나 파티션 단위로 분리하는 대안을 제시한다."],
    schemaSql: `CREATE TABLE 주식월별시세 (
  종목코드 VARCHAR2(20),
  거래일자 VARCHAR2(8),
  종가 NUMBER
);
CREATE TABLE 선물월별시세 (
  종목코드 VARCHAR2(20),
  거래일자 VARCHAR2(8),
  종가 NUMBER
);`,
    currentSql: `INSERT /*+ APPEND */ ALL
WHEN :v_구분 = '주식' THEN
  INTO 주식월별시세(종목코드, 거래일자, 종가)
WHEN :v_구분 = '선물' THEN
  INTO 선물월별시세(종목코드, 거래일자, 종가)
SELECT 종목코드, :v_기준일자, AVG(종가)
FROM 일별시세
WHERE 거래일자 BETWEEN ADD_MONTHS(:v_기준일자, -1) AND :v_기준일자
GROUP BY 종목코드;`,
    executionPlan: `교육용 관찰 정보
Session 100: INSERT /*+ APPEND */ 대상 테이블 Direct Path 적재 후 커밋 전
Session 200: 동일 대상 세그먼트에 APPEND 적재 시도

관찰 가능한 대기
- enq: TM - contention
- Direct Path Insert 대상 테이블에 대한 강한 TM Lock 경합`,
    answerSql: `-- 정답은 단순 SQL 변경보다 운영 제어를 포함해야 한다.
-- 1. 같은 대상 테이블 APPEND 적재를 동시에 수행하지 않도록 배치 순서를 분리한다.
-- 2. 대상이 파티션 테이블이면 파티션 단위 적재/교환으로 경합을 줄인다.
-- 3. 동시 DML이 필요한 테이블에는 APPEND/병렬 DML 적용 여부를 재검토한다.`,
    rubric: ["APPEND가 Direct Path Insert를 유도할 수 있음을 설명해야 한다.", "커밋 전 같은 대상 테이블에 강한 TM Lock 경합이 생길 수 있음을 설명해야 한다.", "무조건 APPEND를 제거하는 것이 아니라 배치 동시성과 적재 방식을 함께 검토해야 한다."],
    explanation: "Direct Path Insert는 대량 적재에는 유리하지만 일반 OLTP DML처럼 행 단위 동시성을 기대하면 안 된다. 같은 대상 테이블에 대해 커밋 전 APPEND/병렬 DML이 겹치면 TM Lock 경합이 발생할 수 있다.",
    relatedConcepts: ["Direct Path Insert", "TM Lock", "Batch"],
    hints: ["APPEND 힌트가 어떤 적재 방식을 유도하는지 봅니다.", "두 세션의 대상 테이블과 커밋 상태를 확인합니다.", "성능 힌트와 동시성 제약은 함께 판단해야 합니다."]
  }),
  subject3Lab({
    id: "subject3-lab-10-local-prefixed-index-design",
    title: "Local Prefixed 인덱스 설계",
    topic: "Local Prefixed 인덱스 설계",
    difficulty: "상급",
    mode: "variant",
    document: sqlExam,
    page: 99,
    answerPage: 135,
    questionNumber: "객관식 78 변형",
    verificationNote: "파티션 키 선두 컬럼 여부를 인덱스 설계형 실습으로 바꿨다.",
    scenario: "거래 테이블은 거래일시 기준 월 파티션이다. 월별 거래 집계 배치에서 파티션 단위 유지보수와 거래일시 범위 스캔이 모두 중요하다.",
    requirements: ["Local Prefixed 인덱스를 설계한다.", "거래일시가 선두가 되어야 하는 이유를 설명한다.", "거래일시가 후행인 Local Nonprefixed와 차이를 설명한다."],
    schemaSql: `CREATE TABLE 거래월별 (
  고객번호 VARCHAR2(10),
  종목코드 VARCHAR2(20),
  거래일시 DATE NOT NULL,
  체결수량 NUMBER,
  체결금액 NUMBER
)
PARTITION BY RANGE (거래일시) (
  PARTITION p202601 VALUES LESS THAN (DATE '2026-02-01'),
  PARTITION p202602 VALUES LESS THAN (DATE '2026-03-01'),
  PARTITION pmax VALUES LESS THAN (MAXVALUE)
);`,
    answerSql: `CREATE INDEX 거래월별_N1
ON 거래월별(거래일시, 고객번호, 종목코드)
LOCAL;`,
    rubric: ["LOCAL 인덱스로 작성해야 한다.", "파티션 키 거래일시가 인덱스 선두여야 한다.", "후행 컬럼은 조회 조건과 정렬 필요에 맞춰 배치해야 한다."],
    explanation: "Local Prefixed 인덱스는 테이블 파티션 키가 인덱스 선두에 있어야 한다. 거래일시 기준 파티션이면 거래일시를 첫 컬럼으로 둔 LOCAL 인덱스가 해당한다.",
    relatedConcepts: ["Local Prefixed", "Partition Maintenance", "Index Design"],
    hints: ["테이블 파티션 기준은 거래일시입니다.", "LOCAL만 붙였다고 Prefixed가 되지 않습니다.", "거래일시가 첫 번째 인덱스 컬럼인지 확인합니다."]
  }),
  subject3Lab({
    id: "subject3-lab-11-history-row-number",
    title: "기준일자 최신 고객이력 조회",
    topic: "최신 이력 조회",
    difficulty: "상급",
    mode: "similar",
    document: sqlExam,
    page: 96,
    answerPage: 134,
    questionNumber: "객관식 69 실기화",
    verificationNote: "고객변경이력 최신행 조회 문제를 SQL 작성형으로 재구성했다.",
    scenario: "전체 고객에 대해 2010년 12월 4일 기준 최신 고객변경이력을 조회해야 한다. 고객별 변경순번은 변경이 발생할 때 증가한다.",
    requirements: ["기준일자 이전 이력만 대상으로 한다.", "고객별 최신 변경순번 1건만 선택한다.", "전체 고객 대상 반복 상관 서브쿼리를 피한다."],
    schemaSql: `CREATE TABLE 고객변경이력 (
  고객ID VARCHAR2(20),
  변경순번 NUMBER,
  변경일자 VARCHAR2(8),
  전화번호 VARCHAR2(20),
  주소 VARCHAR2(200),
  자녀수 NUMBER,
  직업 VARCHAR2(50),
  고객등급 VARCHAR2(10),
  CONSTRAINT 고객변경이력_PK PRIMARY KEY (고객ID, 변경순번)
);
CREATE INDEX 고객변경이력_IX01 ON 고객변경이력(변경일자, 고객ID, 변경순번);`,
    currentSql: `SELECT h.*
FROM 고객변경이력 h
WHERE h.변경순번 = (
  SELECT MAX(x.변경순번)
  FROM 고객변경이력 x
  WHERE x.고객ID = h.고객ID
    AND x.변경일자 <= '20101204'
);`,
    answerSql: `SELECT 고객ID, 변경순번, 전화번호, 주소, 자녀수, 직업, 고객등급
FROM (
  SELECT h.*,
         ROW_NUMBER() OVER (
           PARTITION BY 고객ID
           ORDER BY 변경순번 DESC
         ) AS rn
  FROM 고객변경이력 h
  WHERE h.변경일자 <= '20101204'
)
WHERE rn = 1;`,
    rubric: ["기준일자 이전 조건을 먼저 적용해야 한다.", "고객ID별 최신 순번을 분석 함수로 골라야 한다.", "전체 고객 대상 반복 탐색 비용을 설명해야 한다."],
    explanation: "기준일자 이전 이력을 한 번 모은 뒤 고객별로 변경순번 내림차순 ROW_NUMBER를 부여하면 최신 행을 선택할 수 있다. 전체 고객 대상 상관 서브쿼리 반복보다 집합 처리 관점에서 유리하다.",
    relatedConcepts: ["ROW_NUMBER", "이력 조회", "SQL Rewrite"],
    hints: ["최신이라는 말은 고객별 순위 계산과 연결됩니다.", "기준일자보다 미래인 이력은 먼저 제외합니다.", "PARTITION BY 고객ID가 핵심입니다."]
  }),
  subject3Lab({
    id: "subject3-lab-12-partition-pruning-date",
    title: "파티션 프루닝 날짜 조건 수정",
    topic: "Partition Pruning",
    difficulty: "상급",
    mode: "similar",
    document: subject3Full,
    page: 3,
    questionNumber: "응용 실기 12",
    verificationNote: "Partition Pruning 객관식 개념을 실기형으로 확장했다.",
    scenario: "주문 테이블은 주문일자 기준 월 Range Partition이다. 월별 배치 SQL이 TO_CHAR 조건 때문에 모든 파티션을 읽고 있다.",
    requirements: ["파티션 키 컬럼 변형을 제거한다.", "월 조건을 반열린 범위로 작성한다.", "실행계획에서 PARTITION RANGE ALL이 줄어드는 이유를 설명한다."],
    schemaSql: `CREATE TABLE 주문파티션 (
  주문번호 NUMBER,
  주문일자 DATE NOT NULL,
  고객번호 NUMBER,
  주문금액 NUMBER
)
PARTITION BY RANGE (주문일자) (
  PARTITION p202607 VALUES LESS THAN (DATE '2026-08-01'),
  PARTITION p202608 VALUES LESS THAN (DATE '2026-09-01'),
  PARTITION pmax VALUES LESS THAN (MAXVALUE)
);`,
    currentSql: `SELECT SUM(주문금액)
FROM 주문파티션
WHERE TO_CHAR(주문일자, 'YYYYMM') = '202607';`,
    executionPlan: `현재: PARTITION RANGE ALL + TABLE ACCESS FULL
목표: PARTITION RANGE SINGLE 또는 RANGE ITERATOR`,
    answerSql: `SELECT SUM(주문금액)
FROM 주문파티션
WHERE 주문일자 >= DATE '2026-07-01'
  AND 주문일자 <  DATE '2026-08-01';`,
    rubric: ["TO_CHAR 조건을 제거해야 한다.", "날짜 범위를 반열린 조건으로 작성해야 한다.", "파티션 프루닝 효과를 설명해야 한다."],
    explanation: "파티션 키 주문일자를 함수로 감싸면 옵티마이저가 특정 파티션을 쉽게 제외하기 어렵다. 원본 컬럼을 범위 조건으로 비교하면 해당 월 파티션만 읽도록 유도할 수 있다.",
    relatedConcepts: ["Partition Pruning", "Range Partition", "SARGable"],
    hints: ["파티션 키가 함수 안에 들어가면 위험합니다.", "2026년 7월은 7월 1일 이상, 8월 1일 미만입니다.", "Pstart/Pstop이 줄어드는 실행계획을 목표로 합니다."]
  }),
  subject3Lab({
    id: "subject3-lab-13-skip-scan",
    title: "Index Skip Scan 적용 판단",
    topic: "Index Skip Scan",
    difficulty: "상급",
    mode: "variant",
    document: subject3Full,
    page: 1,
    questionNumber: "응용 실기 13",
    verificationNote: "Index Skip Scan 선두 컬럼 NDV 조건을 실습형 판단 문제로 구성했다.",
    scenario: "회원 테이블에 (성별, 생년월일) 인덱스가 있다. 성별은 M/F 두 값뿐이고 생년월일 조건 검색이 빈번하다. 별도 생년월일 단일 인덱스는 없다.",
    requirements: ["Index Skip Scan이 후보가 될 수 있는 조건을 설명한다.", "선두 컬럼 NDV가 낮은 점이 왜 중요한지 설명한다.", "Skip Scan이 항상 최선은 아님을 보완 설명한다."],
    schemaSql: `CREATE TABLE 회원 (
  회원번호 NUMBER PRIMARY KEY,
  성별 CHAR(1) NOT NULL,
  생년월일 VARCHAR2(8) NOT NULL,
  가입일자 DATE
);
CREATE INDEX 회원_IX01 ON 회원(성별, 생년월일);`,
    currentSql: `SELECT 회원번호
FROM 회원
WHERE 생년월일 BETWEEN '19900101' AND '19991231';`,
    answerSql: `-- 가능한 접근 방향
-- 1. 기존 회원_IX01에 대해 INDEX SKIP SCAN 후보 검토
-- 2. 생년월일 검색이 매우 빈번하고 선택도가 높다면 생년월일 선두 인덱스 추가 검토

SELECT /*+ INDEX_SS(m 회원_IX01) */ 회원번호
FROM 회원 m
WHERE 생년월일 BETWEEN '19900101' AND '19991231';`,
    rubric: ["선두 컬럼 성별의 Distinct 값이 낮아 Skip Scan 후보가 될 수 있음을 설명해야 한다.", "후행 컬럼 생년월일의 선택도가 중요함을 설명해야 한다.", "전용 인덱스 추가 여부는 사용 빈도와 DML 비용을 함께 판단해야 한다."],
    explanation: "Index Skip Scan은 선두 컬럼 조건이 없어도 선두 컬럼 값 종류가 적고 후행 컬럼 선택도가 좋을 때 후보가 된다. 다만 반복 Skip 비용이 있으므로 전용 인덱스와 비교해야 한다.",
    relatedConcepts: ["Index Skip Scan", "NDV", "선택도"],
    hints: ["선두 컬럼 성별의 값 종류를 봅니다.", "생년월일 조건이 얼마나 선택적인지 봅니다.", "Skip Scan은 선두 컬럼 값별로 후행 범위를 탐색하는 방식입니다."]
  }),
  subject3Lab({
    id: "subject3-lab-14-hash-spill-trace",
    title: "Hash Join Temp Spill Trace 분석",
    topic: "Hash Join Spill",
    difficulty: "최상급",
    mode: "similar",
    document: subject3Full,
    page: 2,
    questionNumber: "응용 실기 14",
    verificationNote: "Hash Area 초과와 Grace Hash Join 개념을 Trace 분석형으로 구성했다.",
    scenario: "대량 매출과 고객 세그먼트를 Hash Join하는 배치에서 Temp 사용량이 급증했다. Build Input으로 선택된 집합이 예상보다 커졌다.",
    requirements: ["Hash Join에서 Build Input이 PGA를 초과하면 어떤 일이 생기는지 설명한다.", "Trace 수치에서 Temp Spill 의심 근거를 찾는다.", "Build Input 축소 또는 조인 순서 조정 방안을 제시한다."],
    schemaSql: `CREATE TABLE 고객세그먼트 (
  고객번호 NUMBER,
  세그먼트코드 VARCHAR2(10),
  기준월 VARCHAR2(6)
);
CREATE TABLE 월매출 (
  고객번호 NUMBER,
  매출월 VARCHAR2(6),
  매출금액 NUMBER
);`,
    executionPlan: `교육용 실행계획
Id | Operation             | Name        | Rows  | TempSpc
0  | SELECT STATEMENT      |             | 900K  |
1  |  HASH GROUP BY        |             | 900K  | 1200M
2  |   HASH JOIN           |             | 12M   | 1800M
3  |    TABLE ACCESS FULL  | 고객세그먼트 | 8M   |
4  |    TABLE ACCESS FULL  | 월매출      | 60M   |`,
    traceSummary: {
      title: "교육용 Trace 핵심 요약",
      headers: ["항목", "값", "의미"],
      rows: [
        ["Rows", "900,000", "최종 집계 그룹"],
        ["CR", "1,240,000", "대량 스캔 논리 읽기"],
        ["PR", "94,000", "Temp/테이블 물리 읽기"],
        ["Temp", "1,800MB", "Hash Area 초과로 디스크 분할"]
      ]
    },
    answerSql: `-- 튜닝 방향 예시
WITH 대상고객 AS (
  SELECT 고객번호, 세그먼트코드
  FROM 고객세그먼트
  WHERE 기준월 = '202607'
    AND 세그먼트코드 IN ('A','B')
)
SELECT /*+ LEADING(s m) USE_HASH(m) */
       s.세그먼트코드, SUM(m.매출금액)
FROM 대상고객 s
JOIN 월매출 m ON m.고객번호 = s.고객번호
WHERE m.매출월 = '202607'
GROUP BY s.세그먼트코드;`,
    rubric: ["Build Input이 과대해 Temp Spill이 발생할 수 있음을 설명해야 한다.", "선필터링으로 Build Input을 줄이는 방안을 제시해야 한다.", "메모리 증설만이 아니라 SQL 구조와 통계정보도 검토해야 한다."],
    explanation: "Hash Join Build Input이 PGA Hash Area를 초과하면 디스크 Temp Segment로 분할되는 Grace Hash Join 형태가 되어 PR과 Temp 사용량이 증가한다. 작은 집합을 먼저 만들고 조인하는 구조가 중요하다.",
    relatedConcepts: ["Hash Join", "PGA", "Temp Spill"],
    hints: ["실행계획의 TempSpc와 Trace의 Temp 사용량을 봅니다.", "Build Input 후보가 너무 큰지 확인합니다.", "필터링을 조인 전에 적용할 수 있는지 봅니다."]
  }),
  subject3Lab({
    id: "subject3-lab-15-scalar-cache-miss",
    title: "스칼라 서브쿼리 캐시 미스 분석",
    topic: "Scalar Subquery Caching",
    difficulty: "상급",
    mode: "variant",
    document: subject3Full,
    page: 3,
    questionNumber: "응용 실기 15",
    verificationNote: "스칼라 서브쿼리 캐시의 입력값 NDV 함정을 실습형으로 구성했다.",
    scenario: "주문 200만 건을 조회하면서 SELECT 절에서 고객번호별 포인트 합계를 스칼라 서브쿼리로 계산한다. 고객번호 Distinct가 180만 개라 캐시 적중률이 낮다.",
    requirements: ["스칼라 서브쿼리 캐싱이 잘 듣지 않는 이유를 설명한다.", "고객별 포인트를 사전 집계 후 조인하도록 재작성한다.", "Starts와 CR이 높은 원인을 설명한다."],
    schemaSql: `CREATE TABLE 주문조회 (
  주문번호 NUMBER PRIMARY KEY,
  고객번호 NUMBER,
  주문일자 DATE
);
CREATE TABLE 포인트적립 (
  고객번호 NUMBER,
  적립일자 DATE,
  적립포인트 NUMBER
);`,
    currentSql: `SELECT o.주문번호,
       o.고객번호,
       (SELECT SUM(p.적립포인트)
        FROM 포인트적립 p
        WHERE p.고객번호 = o.고객번호) AS 누적포인트
FROM 주문조회 o
WHERE o.주문일자 >= DATE '2026-07-01';`,
    executionPlan: `교육용 현재 실행계획
Id | Operation                    | Starts  | Rows
0  | SELECT STATEMENT             |       1 | 2000K
1  |  TABLE ACCESS FULL 주문조회  |       1 | 2000K
2  |  SORT AGGREGATE              | 2000000 |     1
3  |   TABLE ACCESS FULL 포인트적립| 2000000 |    10`,
    answerSql: `WITH 포인트집계 AS (
  SELECT 고객번호, SUM(적립포인트) AS 누적포인트
  FROM 포인트적립
  GROUP BY 고객번호
)
SELECT o.주문번호, o.고객번호, NVL(p.누적포인트, 0) AS 누적포인트
FROM 주문조회 o
LEFT JOIN 포인트집계 p ON p.고객번호 = o.고객번호
WHERE o.주문일자 >= DATE '2026-07-01';`,
    rubric: ["입력값 고객번호 NDV가 커서 캐시 적중률이 낮음을 설명해야 한다.", "포인트를 고객번호별로 먼저 집계해야 한다.", "LEFT JOIN으로 주문 보존 의미를 유지해야 한다."],
    explanation: "스칼라 서브쿼리 캐시는 입력값 종류가 적을 때 효과가 크다. 고객번호 Distinct가 매우 크면 캐시 미스와 반복 수행이 많아져 사전 집계 후 조인이 더 안정적일 수 있다.",
    relatedConcepts: ["Scalar Subquery Caching", "NDV", "SQL Rewrite"],
    hints: ["스칼라 서브쿼리의 입력값이 무엇인지 봅니다.", "Distinct 고객 수가 매우 많으면 캐시가 잘 맞지 않습니다.", "고객별 집계를 먼저 만들 수 있습니다."]
  }),
  subject3Lab({
    id: "subject3-lab-16-foreign-key-lock",
    title: "외래키 인덱스 누락 Lock 분석",
    topic: "외래키 Lock",
    difficulty: "상급",
    mode: "similar",
    document: sqlExam,
    page: 97,
    questionNumber: "응용 실기 16",
    verificationNote: "부모 삭제와 자식 외래키 인덱스 누락에 따른 Lock 경합 유형을 구성했다.",
    scenario: "상품 마스터 삭제 배치 중 주문상품 입력 트랜잭션이 대기한다. 주문상품.상품코드는 상품.상품코드를 참조하지만 주문상품.상품코드 인덱스가 없다.",
    requirements: ["대기 원인을 참조 무결성 검증과 Lock 관점에서 설명한다.", "필요한 인덱스를 제안한다.", "제약조건 삭제가 아닌 튜닝 방향을 제시한다."],
    schemaSql: `CREATE TABLE 상품 (
  상품코드 VARCHAR2(20) PRIMARY KEY,
  상품명 VARCHAR2(100)
);
CREATE TABLE 주문상품 (
  주문번호 NUMBER,
  상품코드 VARCHAR2(20),
  수량 NUMBER,
  CONSTRAINT 주문상품_FK01 FOREIGN KEY (상품코드) REFERENCES 상품(상품코드)
);`,
    executionPlan: `교육용 관찰 정보
Session 1: DELETE FROM 상품 WHERE 상품코드 = :p
Session 2: INSERT INTO 주문상품 VALUES (:o, :p, :q)
대기 이벤트: enq: TM - contention`,
    answerSql: `CREATE INDEX 주문상품_IX01 ON 주문상품(상품코드);`,
    rubric: ["자식 외래키 인덱스 누락을 원인으로 지적해야 한다.", "부모 삭제/변경 시 자식 존재 여부 검증을 설명해야 한다.", "무결성 유지와 인덱스 비용을 함께 설명해야 한다."],
    explanation: "외래키 컬럼에는 자동으로 인덱스가 생성되지 않는다. 부모 키 삭제/변경 시 자식 테이블 확인 범위가 커져 TM Lock 경합이 발생할 수 있으므로 자식 외래키 인덱스를 검토해야 한다.",
    relatedConcepts: ["Foreign Key", "TM Lock", "동시성"],
    hints: ["부모 행 삭제가 자식 존재 여부 확인을 요구합니다.", "자식 외래키 컬럼에 인덱스가 있는지 봅니다.", "제약조건 삭제보다 인덱스 설계가 우선입니다."]
  }),
  subject3Lab({
    id: "subject3-lab-17-or-expansion",
    title: "OR 조건 분리와 UNION ALL",
    topic: "OR Expansion",
    difficulty: "상급",
    mode: "similar",
    document: subject3Full,
    page: 6,
    questionNumber: "응용 실기 17",
    verificationNote: "OR 조건으로 인덱스 활용이 어려운 SQL을 UNION ALL로 분리하는 유형을 반영했다.",
    scenario: "조회 화면에서 주문번호 또는 고객번호 중 하나가 입력된다. 현재 SQL은 OR 조건 때문에 두 인덱스 중 어느 것도 효율적으로 사용하지 못한다.",
    requirements: ["주문번호 입력 분기와 고객번호 입력 분기를 분리한다.", "각 분기에서 해당 선두 컬럼 인덱스를 사용할 수 있게 한다.", "두 분기가 중복 반환되지 않도록 조건을 둔다."],
    schemaSql: `CREATE TABLE 주문검색2 (
  주문번호 NUMBER PRIMARY KEY,
  고객번호 NUMBER,
  주문일자 DATE,
  주문상태 VARCHAR2(10)
);
CREATE INDEX 주문검색2_IX01 ON 주문검색2(고객번호, 주문일자);`,
    currentSql: `SELECT 주문번호, 고객번호, 주문일자
FROM 주문검색2
WHERE (:order_no IS NOT NULL AND 주문번호 = :order_no)
   OR (:cust_no IS NOT NULL AND 고객번호 = :cust_no);`,
    answerSql: `SELECT 주문번호, 고객번호, 주문일자
FROM 주문검색2
WHERE :order_no IS NOT NULL
  AND 주문번호 = :order_no
UNION ALL
SELECT 주문번호, 고객번호, 주문일자
FROM 주문검색2
WHERE :order_no IS NULL
  AND :cust_no IS NOT NULL
  AND 고객번호 = :cust_no;`,
    rubric: ["OR 조건을 배타적인 UNION ALL 분기로 나눠야 한다.", "주문번호와 고객번호 각각의 인덱스 시작점을 살려야 한다.", "분기 간 중복 가능성을 제거해야 한다."],
    explanation: "OR 조건은 서로 다른 인덱스 조건을 한 실행 경로에 묶어 인덱스 활용을 어렵게 만들 수 있다. UNION ALL로 분리하면 각 분기에서 가장 적합한 인덱스를 사용할 수 있다.",
    relatedConcepts: ["USE_CONCAT", "OR Expansion", "Index Access"],
    hints: ["두 검색 조건은 서로 다른 선두 컬럼을 사용합니다.", "분기별로 하나의 명확한 시작 조건을 만들어야 합니다.", "UNION ALL은 중복 제거 정렬이 없으므로 배타 조건이 필요합니다."]
  }),
  subject3Lab({
    id: "subject3-lab-18-merge-source-unique",
    title: "MERGE 소스 유일성 보장",
    topic: "MERGE 소스 중복",
    difficulty: "상급",
    mode: "variant",
    document: subject3Full,
    page: 5,
    questionNumber: "응용 실기 18",
    verificationNote: "대량 DML과 MERGE 소스 중복 함정을 실습형으로 구성했다.",
    scenario: "일별고객매출 요약 테이블에 주문 원천을 MERGE한다. 같은 고객의 주문이 하루에 여러 건 있어 대상 한 행을 여러 번 갱신하려는 문제가 발생한다.",
    requirements: ["MERGE USING 소스를 대상 키 기준으로 유일하게 만든다.", "기존 행은 UPDATE, 없는 행은 INSERT한다.", "원천 중복이 왜 오류나 중복 갱신 문제를 만드는지 설명한다."],
    schemaSql: `CREATE TABLE 주문원천 (
  주문번호 NUMBER PRIMARY KEY,
  매출일자 VARCHAR2(8),
  고객번호 NUMBER,
  주문금액 NUMBER
);
CREATE TABLE 일별고객매출 (
  매출일자 VARCHAR2(8),
  고객번호 NUMBER,
  매출금액 NUMBER,
  CONSTRAINT 일별고객매출_PK PRIMARY KEY (매출일자, 고객번호)
);`,
    currentSql: `MERGE INTO 일별고객매출 t
USING 주문원천 s
ON (t.매출일자 = s.매출일자 AND t.고객번호 = s.고객번호)
WHEN MATCHED THEN UPDATE SET t.매출금액 = t.매출금액 + s.주문금액
WHEN NOT MATCHED THEN INSERT VALUES (s.매출일자, s.고객번호, s.주문금액);`,
    answerSql: `MERGE INTO 일별고객매출 t
USING (
  SELECT 매출일자, 고객번호, SUM(주문금액) AS 주문금액
  FROM 주문원천
  GROUP BY 매출일자, 고객번호
) s
ON (t.매출일자 = s.매출일자 AND t.고객번호 = s.고객번호)
WHEN MATCHED THEN UPDATE SET t.매출금액 = t.매출금액 + s.주문금액
WHEN NOT MATCHED THEN INSERT (매출일자, 고객번호, 매출금액)
VALUES (s.매출일자, s.고객번호, s.주문금액);`,
    rubric: ["USING 소스를 매출일자, 고객번호 기준으로 집계해야 한다.", "대상 PK와 ON 조건이 일치해야 한다.", "동일 대상 행 다중 갱신 가능성을 설명해야 한다."],
    explanation: "MERGE의 ON 조건 기준으로 소스가 중복되면 같은 대상 행을 여러 번 갱신하려는 문제가 생긴다. 대상 키 기준으로 소스를 먼저 집계해 유일성을 보장해야 한다.",
    relatedConcepts: ["MERGE", "DML", "GROUP BY"],
    hints: ["ON 조건이 대상의 어떤 키와 대응되는지 봅니다.", "주문 원천은 같은 고객 하루 여러 건일 수 있습니다.", "USING 절에서 한 키 한 행으로 만들어야 합니다."]
  }),
  subject3Lab({
    id: "subject3-lab-19-leading-hints",
    title: "조인 순서와 방식 힌트 작성",
    topic: "Optimizer Hint",
    difficulty: "상급",
    mode: "similar",
    document: subject3Full,
    page: 4,
    questionNumber: "응용 실기 19",
    verificationNote: "LEADING, USE_NL, USE_HASH 힌트 조합 문제를 실습형으로 구성했다.",
    scenario: "소량의 행사대상 고객을 먼저 읽고 고객-주문은 NL Join, 주문-배송집계는 Hash Join으로 처리해야 한다. 옵티마이저가 배송집계를 먼저 읽어 비효율이 발생한다.",
    requirements: ["행사대상 -> 고객 -> 주문 -> 배송집계 순서로 조인 순서를 유도한다.", "고객-주문은 NL Join, 주문-배송집계는 Hash Join으로 유도한다.", "힌트 대상 테이블 별칭을 정확히 사용한다."],
    schemaSql: `CREATE TABLE 행사대상 (고객번호 NUMBER PRIMARY KEY);
CREATE TABLE 고객 (고객번호 NUMBER PRIMARY KEY, 고객명 VARCHAR2(100));
CREATE TABLE 주문 (주문번호 NUMBER PRIMARY KEY, 고객번호 NUMBER, 주문일자 DATE);
CREATE TABLE 배송집계 (주문번호 NUMBER PRIMARY KEY, 배송건수 NUMBER);`,
    currentSql: `SELECT c.고객번호, c.고객명, COUNT(o.주문번호), SUM(d.배송건수)
FROM 행사대상 e, 고객 c, 주문 o, 배송집계 d
WHERE e.고객번호 = c.고객번호
  AND c.고객번호 = o.고객번호
  AND o.주문번호 = d.주문번호
GROUP BY c.고객번호, c.고객명;`,
    answerSql: `SELECT /*+ LEADING(e c o d) USE_NL(c o) USE_HASH(d) */
       c.고객번호, c.고객명, COUNT(o.주문번호), SUM(d.배송건수)
FROM 행사대상 e
JOIN 고객 c ON c.고객번호 = e.고객번호
JOIN 주문 o ON o.고객번호 = c.고객번호
JOIN 배송집계 d ON d.주문번호 = o.주문번호
GROUP BY c.고객번호, c.고객명;`,
    rubric: ["LEADING 힌트로 순서를 명시해야 한다.", "USE_NL 대상과 USE_HASH 대상을 구분해야 한다.", "힌트 별칭이 SQL의 별칭과 일치해야 한다."],
    explanation: "LEADING은 조인 순서를, USE_NL/USE_HASH는 각 테이블이 조인될 때의 방식을 유도한다. 힌트는 테이블명이 아니라 SQL에서 사용한 별칭 기준으로 정확히 작성해야 한다.",
    relatedConcepts: ["LEADING", "USE_NL", "USE_HASH"],
    hints: ["먼저 읽을 작은 집합은 행사대상입니다.", "힌트 대상은 별칭입니다.", "조인 순서 힌트와 조인 방식 힌트를 함께 써야 합니다."]
  }),
  subject3Lab({
    id: "subject3-lab-20-trace-predicate-access",
    title: "Trace와 Predicate로 병목 원인 찾기",
    topic: "SQL Trace와 Predicate",
    difficulty: "최상급",
    mode: "similar",
    document: subject3Full,
    page: 5,
    questionNumber: "응용 실기 20",
    verificationNote: "Rows, Starts, CR, Access/Filter Predicate를 함께 읽는 종합 실기 유형을 구성했다.",
    scenario: "최근 주문 100건 조회 화면의 최종 Rows는 100건인데 CR이 180,000으로 높다. 실행계획을 보면 인덱스는 주문일자만 Access로 사용하고 고객등급과 주문상태는 Filter로 처리한다.",
    requirements: ["Rows 대비 CR이 높은 원인을 설명한다.", "Access Predicate와 Filter Predicate를 구분한다.", "결합 인덱스 개선안을 제시하고 기대 실행계획을 설명한다."],
    schemaSql: `CREATE TABLE 주문상세조회 (
  주문번호 NUMBER PRIMARY KEY,
  고객등급 VARCHAR2(10),
  주문상태 VARCHAR2(10),
  주문일자 DATE,
  주문금액 NUMBER
);
CREATE INDEX 주문상세조회_IX01 ON 주문상세조회(주문일자);`,
    executionPlan: `교육용 현재 실행계획
Id | Operation                    | Name             | Starts | Rows | CR
0  | SELECT STATEMENT             |                  |      1 |  100 |
1  |  COUNT STOPKEY               |                  |      1 |  100 |
2  |   TABLE ACCESS BY INDEX ROWID| 주문상세조회     |      1 | 8500 | 180000
3  |    INDEX RANGE SCAN          | 주문상세조회_IX01|      1 | 8500 |   2600
Predicate Information
3 - access("주문일자">=:from_dt)
2 - filter("고객등급"='VIP' AND "주문상태"='완료')`,
    traceSummary: {
      title: "교육용 Trace 핵심 요약",
      headers: ["항목", "값", "의미"],
      rows: [
        ["Rows", "100", "최종 반환"],
        ["Index Rows", "8,500", "인덱스에서 읽은 후보"],
        ["CR", "180,000", "테이블 랜덤 액세스 증가"],
        ["PR", "620", "물리 읽기"]
      ]
    },
    answerSql: `CREATE INDEX 주문상세조회_IX02
ON 주문상세조회(고객등급, 주문상태, 주문일자 DESC);

SELECT *
FROM (
  SELECT /*+ INDEX_DESC(o 주문상세조회_IX02) */
         주문번호, 고객등급, 주문상태, 주문일자, 주문금액
  FROM 주문상세조회 o
  WHERE 고객등급 = 'VIP'
    AND 주문상태 = '완료'
    AND 주문일자 >= :from_dt
  ORDER BY 주문일자 DESC
)
WHERE ROWNUM <= 100;`,
    rubric: ["주문일자만 Access이고 고객등급/상태가 Filter인 점을 지적해야 한다.", "등치 조건 컬럼을 인덱스 선두에 두는 개선안을 제시해야 한다.", "Top-N 정렬과 Stopkey 처리까지 설명해야 한다."],
    explanation: "최종 Rows가 작아도 인덱스에서 넓은 후보를 읽고 테이블 방문 후 필터링하면 CR이 커진다. 고객등급, 주문상태 등치 조건을 선두로 두고 주문일자 DESC를 뒤에 두면 Access Predicate 범위를 좁히고 최근 100건 부분범위 처리를 기대할 수 있다.",
    relatedConcepts: ["Access Predicate", "Filter Predicate", "Top-N"],
    hints: ["인덱스 행 수와 최종 Rows 차이를 봅니다.", "Filter Predicate로 밀린 조건이 무엇인지 확인합니다.", "등치 조건 뒤 정렬 컬럼 순서가 Top-N에 유리합니다."]
  })
];

export const pdfReviewLabs: PdfReviewLab[] = [
  subject3Lab({
    id: "subject3-full-practice-01-contract-date",
    title: "실기 01 | 인덱스 컬럼 좌변 변형 제거",
    topic: "인덱스 컬럼 변형 제거",
    difficulty: "상급",
    mode: "original",
    document: subject3Full,
    page: 6,
    answerPage: 6,
    questionNumber: "실기 01",
    verificationNote: "sqlp_subject3_full 6페이지의 실기 01 문항과 모범답안 텍스트를 대조했다.",
    scenario: "다음은 [계약] 테이블에서 2026년 7월에 체결된 계약 중 특정 상품코드('P001')의 계약 건수를 조회하는 쿼리다. 현재 계약일자 컬럼에 인덱스 [계약일자 + 상품코드]가 존재하지만 Full Table Scan으로 처리되고 있다.",
    requirements: ["인덱스를 정상적으로 Range Scan 하도록 개선된 SQL을 작성하시오.", "Full Table Scan이 발생한 원인을 설명하시오."],
    schemaSql: "",
    currentSql: `SELECT COUNT(*)
FROM 계약
WHERE TO_CHAR(계약일자, 'YYYYMM') = '202607'
  AND NVL(상품코드, 'X') = 'P001';`,
    answerSql: `SELECT COUNT(*)
FROM 계약
WHERE 계약일자 >= TO_DATE('20260701', 'YYYYMMDD')
  AND 계약일자 <  TO_DATE('20260801', 'YYYYMMDD')
  AND 상품코드 = 'P001';`,
    acceptedAlternatives: ["날짜 범위를 DATE 리터럴로 표현해도 의미가 같으면 인정한다.", "상품코드 NULL을 별도로 포함해야 하는 업무 조건이 없다면 NVL 제거가 핵심이다."],
    rubric: ["계약일자 컬럼 좌변의 TO_CHAR를 제거한다.", "월 조건을 시작일 이상, 다음 달 시작일 미만 범위로 표현한다.", "상품코드 컬럼 좌변의 NVL을 제거한다.", "좌변 함수 적용이 인덱스 Range Scan을 방해한다는 원인을 설명한다."],
    explanation: "인덱스 컬럼 좌변에 TO_CHAR, NVL 같은 함수를 적용하면 인덱스에 저장된 원본 값 순서를 그대로 사용할 수 없다. 날짜 컬럼은 함수로 월 문자열을 만들지 말고 날짜 범위 조건으로 작성해야 하며, 상품코드도 단순 등치 조건으로 두어 결합 인덱스의 후속 컬럼 조건까지 활용할 수 있게 해야 한다.",
    relatedConcepts: ["SARGable Predicate", "Index Range Scan", "결합 인덱스"],
    hints: ["계약일자에 적용된 함수가 인덱스 사용을 막는지 확인한다.", "월 조건은 BETWEEN보다 다음 달 1일 미만 범위가 안전하다.", "NVL(상품코드, 'X')는 상품코드 인덱스 조건을 필터로 밀어낼 수 있다."]
  }),
  subject3Lab({
    id: "subject3-full-practice-02-exists-semi-join",
    title: "실기 02 | EXISTS 변환과 Semi-Join 튜닝",
    topic: "EXISTS Semi Join",
    difficulty: "상급",
    mode: "original",
    document: subject3Full,
    page: 7,
    answerPage: 7,
    questionNumber: "실기 02",
    verificationNote: "sqlp_subject3_full 7페이지의 실기 02 문항과 모범답안 텍스트를 대조했다.",
    scenario: "[고객] 테이블 100만 건과 [주문] 테이블 5,000만 건이 있다. 2026년 주문 이력이 있는 VIP 고객 정보를 조회할 때 중복 제거를 위해 DISTINCT를 사용하여 극심한 Temp Segment Sort와 I/O 병목이 발생한다.",
    requirements: ["테이블 스캔을 최소화하고 Sort를 제거하는 최적화 SQL을 작성하시오.", "DISTINCT 방식이 왜 비효율인지 설명하시오."],
    schemaSql: "",
    currentSql: `SELECT DISTINCT C.고객ID, C.고객명, C.고객등급
FROM 고객 C
JOIN 주문 O ON C.고객ID = O.고객ID
WHERE C.고객등급 = 'VIP'
  AND O.주문일자 >= '20260101';`,
    answerSql: `SELECT C.고객ID, C.고객명, C.고객등급
FROM 고객 C
WHERE C.고객등급 = 'VIP'
  AND EXISTS (
    SELECT 1
    FROM 주문 O
    WHERE O.고객ID = C.고객ID
      AND O.주문일자 >= '20260101'
  );`,
    acceptedAlternatives: ["동일한 존재 여부 판정을 SEMI JOIN으로 유도하는 형태는 인정한다.", "주문일자가 DATE 타입이라면 바인드나 DATE 리터럴로 변환해도 된다."],
    rubric: ["1:N 조인 결과의 중복을 DISTINCT로 제거하지 않는다.", "주문 상세가 아니라 존재 여부만 확인하도록 EXISTS로 작성한다.", "Semi Join의 첫 매칭 후 탐색 종료 효과를 설명한다.", "Sort Unique 제거 효과를 설명한다."],
    explanation: "주문 테이블과 조인한 뒤 DISTINCT로 고객 중복을 제거하면 대량 조인 결과를 만든 다음 정렬로 중복을 제거해야 한다. EXISTS는 고객별 주문 존재 여부만 판단하므로 조건에 맞는 주문을 찾는 즉시 탐색을 멈출 수 있고, 불필요한 Sort Unique를 없앨 수 있다.",
    relatedConcepts: ["EXISTS", "Semi Join", "Sort Unique"],
    hints: ["출력 컬럼에는 주문 테이블 컬럼이 없다.", "DISTINCT는 이미 늘어난 결과를 사후에 줄이는 연산이다.", "존재 여부만 필요할 때는 EXISTS를 먼저 떠올린다."]
  }),
  subject3Lab({
    id: "subject3-full-practice-03-single-pass-pivot",
    title: "실기 03 | 반복 스칼라 서브쿼리 제거",
    topic: "Single Pass 집계",
    difficulty: "상급",
    mode: "original",
    document: subject3Full,
    page: 8,
    answerPage: 8,
    questionNumber: "실기 03",
    verificationNote: "sqlp_subject3_full 8페이지의 실기 03 문항과 모범답안 텍스트를 대조했다.",
    scenario: "[월별일계] 테이블 2,000만 건에서 2025년 1월부터 6월까지의 월별 매출 합계를 조회하고자 한다. 아래 SQL은 테이블을 6번 반복 Full Scan하여 심각한 성능 저하가 발생한다.",
    requirements: ["테이블을 1번만 Scan하도록 튜닝된 SQL을 작성하시오.", "반복 스칼라 서브쿼리가 왜 비효율인지 설명하시오."],
    schemaSql: "",
    currentSql: `SELECT
  (SELECT SUM(매출액) FROM 월별일계 WHERE 매출년월 = '202501') AS M01,
  (SELECT SUM(매출액) FROM 월별일계 WHERE 매출년월 = '202502') AS M02,
  (SELECT SUM(매출액) FROM 월별일계 WHERE 매출년월 = '202503') AS M03,
  (SELECT SUM(매출액) FROM 월별일계 WHERE 매출년월 = '202504') AS M04,
  (SELECT SUM(매출액) FROM 월별일계 WHERE 매출년월 = '202505') AS M05,
  (SELECT SUM(매출액) FROM 월별일계 WHERE 매출년월 = '202506') AS M06
FROM DUAL;`,
    answerSql: `SELECT
  SUM(CASE WHEN 매출년월 = '202501' THEN 매출액 END) AS M01,
  SUM(CASE WHEN 매출년월 = '202502' THEN 매출액 END) AS M02,
  SUM(CASE WHEN 매출년월 = '202503' THEN 매출액 END) AS M03,
  SUM(CASE WHEN 매출년월 = '202504' THEN 매출액 END) AS M04,
  SUM(CASE WHEN 매출년월 = '202505' THEN 매출액 END) AS M05,
  SUM(CASE WHEN 매출년월 = '202506' THEN 매출액 END) AS M06
FROM 월별일계
WHERE 매출년월 BETWEEN '202501' AND '202506';`,
    acceptedAlternatives: ["SUM(DECODE(매출년월, '202501', 매출액)) 형태도 인정한다.", "월 범위를 IN 목록으로 제한해도 1회 스캔 구조라면 인정한다."],
    rubric: ["동일 테이블을 월별로 반복 조회하지 않는다.", "대상 월 범위를 한 번에 제한한다.", "CASE 또는 DECODE 조건부 집계로 월별 컬럼을 만든다.", "Single Pass 처리 효과를 설명한다."],
    explanation: "스칼라 서브쿼리를 월별로 나열하면 같은 테이블을 조건만 바꿔 반복 탐색한다. 범위를 한 번에 읽고 SUM(CASE)로 월별 금액을 나누어 집계하면 읽기 횟수를 줄이고 대량 I/O를 크게 감소시킬 수 있다.",
    relatedConcepts: ["Scalar Subquery", "조건부 집계", "Single Pass"],
    hints: ["FROM DUAL 위에 같은 테이블을 조회하는 서브쿼리가 몇 번 반복되는지 센다.", "월별 컬럼은 조건부 집계로 만들 수 있다.", "읽는 범위는 202501부터 202506까지 한 번만 잡는다."]
  }),
  subject3Lab({
    id: "subject3-full-practice-04-hash-join-build-input",
    title: "실기 04 | NL Join 병목과 Hash Join 전환",
    topic: "Hash Join Build Input",
    difficulty: "최상급",
    mode: "original",
    document: subject3Full,
    page: 8,
    answerPage: 8,
    questionNumber: "실기 04",
    verificationNote: "sqlp_subject3_full 8페이지의 실기 04 문항과 모범답안 텍스트를 대조했다.",
    scenario: "[상품기본] 테이블 10만 건과 [일별상품판매] 테이블 1억 건을 조인하여 대용량 배치 집계를 수행하려고 한다. 현재 옵티마이저가 인덱스를 타면서 NL Join으로 풀려 10시간 이상 소요되고 있다.",
    requirements: ["배치 집계 목적에 맞게 Hash Join으로 변경하시오.", "상품기본 테이블을 Build Input으로 지정하는 힌트 적용 SQL을 작성하시오."],
    schemaSql: "",
    currentSql: `SELECT P.상품카테고리, SUM(S.판매금액) AS 총판매금액
FROM 상품기본 P
JOIN 일별상품판매 S ON P.상품코드 = S.상품코드
WHERE S.판매일자 BETWEEN '20260101' AND '20260630'
GROUP BY P.상품카테고리;`,
    answerSql: `SELECT /*+ LEADING(P S) USE_HASH(S) SWAP_JOIN_INPUTS(P) */
       P.상품카테고리, SUM(S.판매금액) AS 총판매금액
FROM 상품기본 P
JOIN 일별상품판매 S ON P.상품코드 = S.상품코드
WHERE S.판매일자 BETWEEN '20260101' AND '20260630'
GROUP BY P.상품카테고리;`,
    acceptedAlternatives: ["상품기본을 Build Input으로 두는 Hash Join 의도가 명확한 동등 힌트 조합은 인정한다.", "판매일자 타입에 맞춘 날짜 리터럴 변경은 허용한다."],
    rubric: ["대량 배치 집계에서 NL Join 반복 Random I/O가 병목임을 설명한다.", "Hash Join을 유도한다.", "상대적으로 작은 상품기본을 Build Input으로 지정한다.", "힌트의 테이블 별칭이 SQL 별칭과 일치해야 한다."],
    explanation: "대량 판매 집합을 NL Join으로 반복 탐색하면 후행 테이블 접근이 매우 커진다. 소량인 상품기본을 Hash Area에 올려 Build Input으로 삼고 대량 판매 집합을 Probe하면 Random I/O를 줄이고 배치 전체 처리량을 높일 수 있다.",
    relatedConcepts: ["Hash Join", "Build Input", "Batch Tuning"],
    hints: ["대량 배치에서는 첫 행 응답보다 전체 처리량이 중요하다.", "Hash Join의 Build Input은 보통 더 작은 집합이 유리하다.", "힌트에는 실제 SQL의 별칭 P, S를 사용해야 한다."]
  }),
  subject3Lab({
    id: "subject3-full-practice-05-sort-omission",
    title: "실기 05 | 실행계획 분석과 Sort 제거",
    topic: "Top-N Sort Omission",
    difficulty: "상급",
    mode: "original",
    document: subject3Full,
    page: 9,
    answerPage: 9,
    questionNumber: "실기 05",
    verificationNote: "sqlp_subject3_full 9페이지의 실기 05 문항과 모범답안 텍스트를 대조했다.",
    scenario: "[게시글] 테이블의 인덱스가 [게시판ID + 작성일자 DESC + 게시글ID] 순으로 결합 인덱스가 구성되어 있다. 아래 SQL은 최근 게시글 10건을 가져오는 페이징 쿼리이나 실행계획 상에서 SORT ORDER BY가 발생하여 전체 스캔 후 정렬하고 있다.",
    requirements: ["인덱스 정렬 특성을 활용하여 Sort 연산을 제거하도록 SQL을 개선하시오.", "ROWNUM Stopkey와 인덱스 정렬 활용 근거를 설명하시오."],
    schemaSql: "",
    currentSql: `SELECT *
FROM (
  SELECT 게시글ID, 제목, 작성자ID, 작성일자
  FROM 게시글
  WHERE 게시판ID = 'FREE'
  ORDER BY 작성일자 DESC
)
WHERE ROWNUM <= 10;`,
    answerSql: `SELECT *
FROM (
  SELECT /*+ INDEX_DESC(A (게시판ID, 작성일자, 게시글ID)) */
         게시글ID, 제목, 작성자ID, 작성일자
  FROM 게시글 A
  WHERE 게시판ID = 'FREE'
)
WHERE ROWNUM <= 10;`,
    acceptedAlternatives: ["동일 결합 인덱스를 명시적으로 타게 하여 정렬 생략이 보장되는 힌트 조합은 인정한다.", "실제 인덱스명 사용 방식도 인정한다."],
    rubric: ["게시판ID 등치 조건과 작성일자 DESC 정렬이 인덱스 순서와 맞는지 설명한다.", "INDEX_DESC 또는 동등한 접근으로 인덱스 정렬을 활용한다.", "ROWNUM <= 10으로 Stopkey 처리를 유도한다.", "불필요한 SORT ORDER BY 제거 근거를 설명한다."],
    explanation: "인덱스가 게시판ID별 작성일자 DESC 순서로 정렬되어 있으면 해당 게시판 조건으로 인덱스를 역순 스캔하는 것만으로 최근 글 순서를 얻을 수 있다. ROWNUM Stopkey와 결합하면 전체 정렬 없이 필요한 10건만 읽고 멈출 수 있다.",
    relatedConcepts: ["Top-N", "COUNT STOPKEY", "Index Scan"],
    hints: ["인덱스 컬럼 순서가 WHERE와 ORDER BY를 동시에 만족하는지 본다.", "정렬된 인덱스를 읽으면 SORT ORDER BY가 필요 없을 수 있다.", "10건만 필요하므로 Stopkey가 핵심이다."]
  }),
  subject3Lab({
    id: "sql-cert-practice-01-running-total",
    title: "실기문제 1 | 지점별 누적매출 구하기",
    topic: "Running Total",
    difficulty: "상급",
    mode: "original",
    document: sqlExam,
    page: 101,
    answerPage: 101,
    questionNumber: "실기문제 1",
    verificationNote: "SQL-자격검정-실전문제 198쪽 실기문제 1의 문제 문장과 표를 렌더링 페이지로 대조했다.",
    scenario: "아래 좌측과 같은 월별지점매출 테이블을 읽어서 우측과 같은 형태, 즉 각 지점별로 판매월과 함께 증가하는 누적매출(running total)을 구하는 SQL을 작성하시오.",
    requirements: ["윈도우 함수를 이용한 방식으로 작성하시오.", "윈도우 함수나 스칼라 서브쿼리를 지원하지 않는 DBMS에서 활용할 수 있는 방식으로 작성하시오.", "단, 전체범위처리에 최적화된 방식으로 작성하시오."],
    schemaSql: "",
    sampleData: [
      {
        title: "월별지점매출",
        headers: ["지점", "판매월", "매출"],
        rows: [["10", "1", "521"], ["10", "2", "684"], ["10", "3", "590"], ["20", "1", "537"], ["20", "2", "650"], ["20", "3", "500"], ["20", "4", "919"], ["20", "5", "658"], ["30", "1", "631"], ["30", "2", "736"], ["30", "3", "513"], ["30", "4", "970"], ["30", "5", "939"], ["30", "6", "666"]]
      }
    ],
    answerSql: `-- 1. 윈도우 함수 방식
SELECT 지점, 판매월, 매출,
       SUM(매출) OVER (
         PARTITION BY 지점
         ORDER BY 판매월
         ROWS BETWEEN UNBOUNDED PRECEDING AND CURRENT ROW
       ) AS 누적매출
FROM 월별지점매출
ORDER BY 지점, 판매월;

-- 2. 윈도우 함수/스칼라 서브쿼리 미지원 DBMS용 전체범위 처리 방식
SELECT a.지점, a.판매월, a.매출, SUM(b.매출) AS 누적매출
FROM 월별지점매출 a
JOIN 월별지점매출 b
  ON b.지점 = a.지점
 AND b.판매월 <= a.판매월
GROUP BY a.지점, a.판매월, a.매출
ORDER BY a.지점, a.판매월;`,
    acceptedAlternatives: ["윈도우 함수 방식은 SUM OVER(PARTITION BY 지점 ORDER BY 판매월) 의미가 같으면 인정한다.", "비윈도우 방식은 같은 지점의 이전 월까지 누적 합계를 한 번의 조인과 집계로 구하면 인정한다."],
    rubric: ["지점별로 누적 합계를 구분한다.", "판매월 순서로 누적한다.", "윈도우 함수 방식과 비윈도우 방식 두 가지를 모두 작성한다.", "비윈도우 방식에서 스칼라 서브쿼리 반복 수행을 사용하지 않는다."],
    explanation: "누적매출은 같은 지점 안에서 현재 판매월 이하의 매출을 합산한 값이다. 분석 함수를 쓸 수 있으면 SUM OVER가 가장 직접적이며, 지원하지 않는 환경에서는 자기 조인 후 현재 월 이하의 행을 모아 GROUP BY로 합산하는 전체범위 처리 방식이 적절하다.",
    relatedConcepts: ["Window Function", "Self Join", "Running Total"],
    hints: ["누적 기준은 지점과 판매월이다.", "윈도우 함수에서는 PARTITION BY와 ORDER BY가 모두 필요하다.", "비윈도우 방식은 같은 테이블을 한 번 더 조인해 현재 월 이하 조건을 만든다."]
  }),
  subject3Lab({
    id: "sql-cert-practice-02-trace-rewrite",
    title: "실기문제 2 | SQL Trace 분석과 조건절 개선",
    topic: "SQL Trace 튜닝",
    difficulty: "최상급",
    mode: "original",
    document: sqlExam,
    page: 102,
    answerPage: 102,
    questionNumber: "실기문제 2",
    verificationNote: "SQL-자격검정-실전문제 199쪽 실기문제 2의 SQL, Trace, 인덱스 구성을 렌더링 페이지로 대조했다.",
    scenario: "아래 SQL과 트레이스 결과를 분석해서 개선된 SQL을 작성하시오.",
    requirements: ["원하는 실행계획이 정확히 나오도록 힌트도 함께 기술하시오.", "최적의 인덱스 구성방안도 함께 제시하시오.", "성능개선에 도움이 되지 않는 필요 이상의 컬럼을 추가하지 마시오."],
    schemaSql: `[인덱스 구성]
고객 테이블
- 고객_PK : 고객번호

주문 테이블
- 주문_PK : 주문번호`,
    currentSql: `SELECT o.주문일시, o.주문번호, c.고객번호, c.고객명, c.연락처, o.주문금액, o.배송지
FROM 고객 c, 주문 o
WHERE o.주문일시 BETWEEN TO_DATE('20150301', 'YYYYMMDD')
                    AND TO_DATE('20150314235959', 'YYYYMMDDHH24MISS')
  AND o.고객번호 = c.고객번호
  AND c.거주지역코드 || c.고객명 IN ('02김철수', '05홍길동')
ORDER BY o.주문일시, c.고객명;`,
    executionPlan: `[SQL Trace]
Call       Count   CPU Time   Elapsed Time   Disk    Query    Current   Rows
Parse          1      0.000          0.002       0        0          0      0
Execute        1      0.000          0.000       0        0          0      0
Fetch          2      0.828          7.136   65296   114341          0      5
Total          4      0.828          7.138   65296   114341          0      5

Rows  Row Source Operation
5      SORT ORDER BY (cr=114341 pr=65296 cost=21342)
5      HASH JOIN (cr=114341 pr=65296 cost=21127)
20     TABLE ACCESS FULL 고객 (cr=76929 pr=36924 cost=21019)
45185  PARTITION RANGE SINGLE PARTITION: 1 1 (cr=37412 pr=28372 cost=107)
45185  TABLE ACCESS FULL 주문 PARTITION: 1 1 (cr=37412 pr=28372 cost=107)`,
    traceSummary: {
      title: "Trace 핵심 요약",
      headers: ["항목", "값", "의미"],
      rows: [["Fetch Rows", "5", "최종 반환 행 수는 매우 작다."], ["Query", "114,341", "반환 행 수 대비 논리 읽기가 과도하다."], ["Disk", "65,296", "물리 읽기가 크다."], ["고객 Full Scan", "20 rows after 76,929 CR", "문자열 결합 조건 때문에 고객 접근이 비효율적이다."], ["주문 Full Scan", "45,185 rows", "기간 파티션 내 주문을 넓게 읽고 조인한다."]]
    },
    answerSql: `-- 인덱스 제안
CREATE INDEX 고객_X01 ON 고객(거주지역코드, 고객명, 고객번호);
CREATE INDEX 주문_X01 ON 주문(고객번호, 주문일시);

-- 개선 SQL
SELECT /*+ LEADING(c o) USE_NL(o) INDEX(c 고객_X01) INDEX(o 주문_X01) */
       o.주문일시, o.주문번호, c.고객번호, c.고객명, c.연락처, o.주문금액, o.배송지
FROM 고객 c, 주문 o
WHERE ((c.거주지역코드 = '02' AND c.고객명 = '김철수')
    OR (c.거주지역코드 = '05' AND c.고객명 = '홍길동'))
  AND o.고객번호 = c.고객번호
  AND o.주문일시 >= TO_DATE('20150301', 'YYYYMMDD')
  AND o.주문일시 <  TO_DATE('20150315', 'YYYYMMDD')
ORDER BY o.주문일시, c.고객명;`,
    acceptedAlternatives: ["거주지역코드/고객명 조건을 UNION ALL로 분리하고 각 분기에서 같은 인덱스를 쓰게 하는 방식도 인정한다.", "주문 인덱스는 고객 선별 후 주문 기간을 찾는 접근 경로가 명확하면 인정한다."],
    rubric: ["고객 컬럼 결합 조건을 제거한다.", "거주지역코드와 고객명을 각각 Access Predicate로 만들 수 있게 한다.", "반환 고객 수가 작다는 Trace 근거로 고객 선행 NL Join을 설명한다.", "날짜 상한을 다음 날 미만으로 표현한다.", "필요 이상의 인덱스 컬럼을 추가하지 않는다."],
    explanation: "최종 반환은 5건인데 고객과 주문을 모두 넓게 읽어 Query와 Disk가 과도하다. c.거주지역코드 || c.고객명 조건은 고객 인덱스 활용을 어렵게 하므로 컬럼별 조건으로 풀어야 한다. 고객 조건으로 소량을 먼저 찾고 주문은 고객번호와 주문일시 범위로 탐색하도록 유도하면 Full Scan과 큰 Hash Join을 피할 수 있다.",
    relatedConcepts: ["SQL Trace", "SARGable Predicate", "NL Join", "결합 인덱스"],
    hints: ["최종 Rows는 5건인데 Query와 Disk가 매우 크다.", "문자열 결합 조건은 고객 인덱스 시작점을 만들기 어렵다.", "고객 조건이 매우 선택적이면 고객을 먼저 찾고 주문을 반복 탐색하는 경로가 유리할 수 있다."]
  }),
  subject3Lab({
    id: "sql-cert-practice-03-single-read-rewrite",
    title: "실기문제 3 | 같은 데이터 두 번 읽지 않기",
    topic: "Analytic Rewrite",
    difficulty: "상급",
    mode: "original",
    document: sqlExam,
    page: 102,
    answerPage: 102,
    questionNumber: "실기문제 3",
    verificationNote: "SQL-자격검정-실전문제 200쪽 실기문제 3의 SQL1, SQL2 조건을 렌더링 페이지로 대조했다.",
    scenario: "같은 데이터를 두 번 읽지 않고도 같은 결과집합을 출력하도록 아래 두 SQL을 각각 재작성하시오. 단, 부분범위처리 불가능한 상황이며 전체범위처리 기준으로 튜닝한다. 주문일자는 문자형 8자리, 거래 업체는 10,000개, 월평균 주문건수는 100만 건이다.",
    requirements: ["SQL1을 같은 결과로 재작성하시오.", "SQL2를 같은 결과로 재작성하시오.", "같은 주문 데이터를 두 번 읽는 비효율을 제거하시오."],
    schemaSql: "",
    currentSql: `[SQL1]
SELECT b.주문번호, b.업체번호, b.주문일자, b.주문금액,
       a.총주문횟수, a.평균주문금액, a.최대주문금액
FROM (
  SELECT 업체번호, COUNT(*) 총주문횟수, AVG(주문금액) 평균주문금액, MAX(주문금액) 최대주문금액
  FROM 주문
  WHERE 주문일자 LIKE '201509%'
  GROUP BY 업체번호
) a, 주문 b
WHERE b.업체번호 = a.업체번호
  AND b.주문일자 LIKE '201509%'
ORDER BY a.평균주문금액 DESC;

[SQL2]
SELECT b.주문번호, b.업체번호, b.주문일자, b.주문금액
FROM (
  SELECT 업체번호, MAX(주문번호) 마지막주문번호
  FROM 주문
  WHERE 주문일자 LIKE '201509%'
  GROUP BY 업체번호
) a, 주문 b
WHERE b.업체번호 = a.업체번호
  AND b.주문번호 = a.마지막주문번호;`,
    answerSql: `[SQL1 재작성]
SELECT 주문번호, 업체번호, 주문일자, 주문금액,
       COUNT(*) OVER (PARTITION BY 업체번호) AS 총주문횟수,
       AVG(주문금액) OVER (PARTITION BY 업체번호) AS 평균주문금액,
       MAX(주문금액) OVER (PARTITION BY 업체번호) AS 최대주문금액
FROM 주문
WHERE 주문일자 LIKE '201509%'
ORDER BY 평균주문금액 DESC;

[SQL2 재작성]
SELECT 주문번호, 업체번호, 주문일자, 주문금액
FROM (
  SELECT 주문번호, 업체번호, 주문일자, 주문금액,
         MAX(주문번호) OVER (PARTITION BY 업체번호) AS 마지막주문번호
  FROM 주문
  WHERE 주문일자 LIKE '201509%'
)
WHERE 주문번호 = 마지막주문번호;`,
    acceptedAlternatives: ["SQL1은 분석 함수로 업체별 집계값을 한 번에 붙이면 인정한다.", "SQL2는 ROW_NUMBER 또는 KEEP 집계를 이용하되 주문 데이터를 불필요하게 두 번 읽지 않으면 인정한다."],
    rubric: ["주문 테이블을 집계용과 상세용으로 반복 읽지 않는다.", "SQL1은 업체별 분석 함수로 총계/평균/최대값을 붙인다.", "SQL2는 업체별 마지막 주문번호를 분석 함수 또는 동등한 방식으로 계산한다.", "전체범위처리 기준에서 반복 스캔 제거 근거를 설명한다."],
    explanation: "기존 SQL은 2015년 9월 주문을 집계하기 위해 한 번, 상세 행을 가져오기 위해 다시 한 번 읽는다. 분석 함수를 사용하면 같은 결과 행에 업체별 집계값이나 마지막 주문번호를 함께 계산할 수 있어 동일 월 주문 집합을 반복 조회하지 않아도 된다.",
    relatedConcepts: ["Analytic Function", "Window Function", "SQL Rewrite"],
    hints: ["집계 결과를 상세 행마다 붙여야 한다.", "GROUP BY만 사용하면 상세 주문번호가 사라진다.", "분석 함수는 상세 행을 보존하면서 그룹 값을 계산한다."]
  }),
  subject3Lab({
    id: "sql-cert-practice-04-order-search-index",
    title: "실기문제 4 | 주문 조회 화면 SQL과 인덱스",
    topic: "검색 조건과 인덱스 설계",
    difficulty: "상급",
    mode: "original",
    document: sqlExam,
    page: 103,
    answerPage: 103,
    questionNumber: "실기문제 4",
    verificationNote: "SQL-자격검정-실전문제 201쪽 실기문제 4의 테이블 구조와 화면 조건을 렌더링 페이지로 대조했다.",
    scenario: "주문 테이블은 파티셔닝하지 않았다. 하루 주문 건수는 평균 2만 건이며 10년치 데이터가 저장되어 있다. 주문 조회 화면에서 고객번호는 입력하지 않을 수 있지만 주문일자는 항상 입력해야 한다. 주문일자는 보통 3일, 최대 1주일까지 입력할 수 있다. 개발 정책상 Dynamic SQL은 사용할 수 없고 주문일시 기준 역순으로 정렬해야 하며 부분범위처리는 허용되지 않는다.",
    requirements: ["조회 버튼을 누를 때 수행할 최적의 SQL을 작성하시오.", "최적의 인덱스 구성안을 제시하시오."],
    schemaSql: `[주문 테이블]
주문번호  NUMBER       PK, NOT NULL
고객번호  NUMBER       NOT NULL
주문일시  DATE         NOT NULL
주문금액  NUMBER       NOT NULL
우편번호  VARCHAR2(6)  NOT NULL
배송지    VARCHAR2(100) NOT NULL
연락처    VARCHAR2(14) NULL
메모      VARCHAR2(100) NULL`,
    answerSql: `-- 고객번호가 입력되지 않을 수 있으므로 Dynamic SQL 없이 조건을 분기한다.
SELECT 주문번호, 고객번호, 주문일시, 주문금액, 우편번호, 배송지, 연락처, 메모
FROM 주문
WHERE :고객번호 IS NULL
  AND 주문일시 >= :시작일시
  AND 주문일시 <  :종료일시
UNION ALL
SELECT 주문번호, 고객번호, 주문일시, 주문금액, 우편번호, 배송지, 연락처, 메모
FROM 주문
WHERE :고객번호 IS NOT NULL
  AND 고객번호 = :고객번호
  AND 주문일시 >= :시작일시
  AND 주문일시 <  :종료일시
ORDER BY 주문일시 DESC;

-- 인덱스 구성안
CREATE INDEX 주문_X01 ON 주문(주문일시 DESC);
CREATE INDEX 주문_X02 ON 주문(고객번호, 주문일시 DESC);`,
    acceptedAlternatives: ["고객번호 입력 여부별로 애플리케이션에서 서로 다른 정적 SQL을 호출하는 방식도 개발 정책상 허용된다면 인정한다.", "고객번호 조건의 사용 빈도가 낮다면 주문일시 중심 인덱스 하나를 우선하고 근거를 명확히 설명하면 부분 인정한다."],
    rubric: ["고객번호 선택 조건을 OR로 뭉개지 않는다.", "주문일시 필수 조건을 인덱스 시작점으로 활용한다.", "전체 결과를 그리드에 출력하므로 부분범위처리 전제를 쓰지 않는다.", "주문일시 역순 정렬과 인덱스 정렬 활용 가능성을 고려한다."],
    explanation: "고객번호가 선택 조건인 화면을 하나의 OR 조건으로 처리하면 인덱스 접근 경로가 불안정해질 수 있다. Dynamic SQL이 금지되어도 UNION ALL 분기로 고객번호 입력 여부를 분리하면 각 분기에서 필요한 인덱스를 명확히 사용할 수 있다. 주문일자는 항상 입력되고 범위가 작으므로 주요 접근 조건이며, 고객번호가 있을 때는 고객번호+주문일시 인덱스가 유리하다.",
    relatedConcepts: ["선택 조건 분기", "결합 인덱스", "Sort Omission"],
    hints: ["고객번호는 선택 조건이고 주문일시는 필수 조건이다.", "OR 조건 하나로 처리하면 두 경우 모두에 좋은 인덱스 접근이 어려울 수 있다.", "Dynamic SQL이 금지되어도 UNION ALL 분기라는 선택지가 있다."]
  }),
  subject3Lab({
    id: "sql-cert-practice-05-customer-access-history",
    title: "실기문제 5 | AC 상태 고객 조회와 최근접속일시",
    topic: "부분범위 처리와 전체 출력 SQL 분리",
    difficulty: "최상급",
    mode: "original",
    document: sqlExam,
    page: 103,
    answerPage: 104,
    questionNumber: "실기문제 5",
    verificationNote: "SQL-자격검정-실전문제 202~203쪽 실기문제 5의 모델, 요건, 데이터 분포를 렌더링 페이지로 대조했다.",
    scenario: "고객상태코드가 'AC'인 고객을 조회해서 등록일시, 고객번호 순으로 출력한다. 출력 항목에는 고객번호, 고객명, 등록일시, 연락처, 주소, 최근접속일시가 포함된다. 최근접속일시는 최근 한 달 이내 마지막 접속일시이며 접속이력이 없으면 NULL을 출력한다.",
    requirements: ["조회/다음 버튼은 매번 20건씩 읽어 그리드 화면에 추가하는 방식으로 구현한다.", "파일로 출력 버튼은 전체 조회 데이터를 파일로 일괄 저장한다.", "두 조회 버튼에 대한 최적 SQL을 각각 작성하고 최적 인덱스 구성안을 제시하시오.", "한 달 전 날짜는 TRUNC(ADD_MONTHS(SYSDATE, -1))을 사용한다."],
    schemaSql: `[요건]
1. 조회/다음: 응답속도를 빠르게 튜닝하는 것이 가장 중요하다.
2. 파일로 출력: 전체 처리속도와 시스템 리소스 사용량을 최소화하는 것이 가장 중요하다.
3. 조회/다음은 대개 3페이지 이내만 조회하고 멈춘다.
4. 페이징 동안 신규 등록/삭제는 고려하지 않아도 된다.
5. 인덱스 구성이 변경되더라도 결과집합은 정확히 보장되어야 한다.
6. View Merging, Join Predicate Pushdown 등 Query Transformation이 작동하지 않는 DBMS 버전을 사용 중이다.
7. 성능에 도움이 안 되는 인덱스 컬럼을 추가하면 감점될 수 있다.
8. 병렬처리는 불가하다.

[데이터 분포 및 테이블 구성]
고객 테이블
- 비파티션
- 총 고객수 = 10만명
- 고객상태코드 'AC'인 고객수 = 2만명

고객접속이력 테이블
- 총 데이터 건수 = 1,000만건
- 접속일시 기준 월단위 Range 파티션
- 고객접속이력_PK는 Local Partitioned Index`,
    answerSql: `-- 조회/다음 버튼: 앞쪽 일부 페이지 응답속도 우선
SELECT *
FROM (
  SELECT c.고객번호, c.고객명, c.등록일시, c.연락처, c.주소,
         (
           SELECT MAX(h.접속일시)
           FROM 고객접속이력 h
           WHERE h.고객번호 = c.고객번호
             AND h.접속일시 >= TRUNC(ADD_MONTHS(SYSDATE, -1))
         ) AS 최근접속일시
  FROM 고객 c
  WHERE c.고객상태코드 = 'AC'
    AND (:마지막등록일시 IS NULL
      OR (c.등록일시, c.고객번호) > (:마지막등록일시, :마지막고객번호))
  ORDER BY c.등록일시, c.고객번호
)
WHERE ROWNUM <= 20;

-- 파일로 출력: 전체범위 처리 우선
WITH 최근접속 AS (
  SELECT 고객번호, MAX(접속일시) AS 최근접속일시
  FROM 고객접속이력
  WHERE 접속일시 >= TRUNC(ADD_MONTHS(SYSDATE, -1))
  GROUP BY 고객번호
)
SELECT c.고객번호, c.고객명, c.등록일시, c.연락처, c.주소, h.최근접속일시
FROM 고객 c
LEFT JOIN 최근접속 h ON h.고객번호 = c.고객번호
WHERE c.고객상태코드 = 'AC'
ORDER BY c.등록일시, c.고객번호;

-- 인덱스 구성안
CREATE INDEX 고객_X01 ON 고객(고객상태코드, 등록일시, 고객번호);
CREATE INDEX 고객접속이력_X01 ON 고객접속이력(고객번호, 접속일시) LOCAL;`,
    acceptedAlternatives: ["조회/다음에서 ROWNUM 방식 대신 정확한 keyset pagination을 구현하면 인정한다.", "파일 출력은 접속이력을 먼저 고객별 집계한 뒤 조인하는 구조라면 인정한다."],
    rubric: ["조회/다음과 파일 출력을 같은 SQL로 강제하지 않는다.", "조회/다음은 20건 부분범위 응답속도를 우선한다.", "파일 출력은 전체범위 처리이므로 고객접속이력을 먼저 집계해 반복 탐색을 줄인다.", "정렬 기준인 등록일시, 고객번호를 인덱스에 반영한다.", "최근 한 달 접속 조건을 고객접속이력 쪽에 적용한다."],
    explanation: "앞쪽 몇 페이지만 빠르게 보여주는 조회/다음 버튼과 전체 데이터를 저장하는 파일 출력 버튼은 최적화 목표가 다르다. 조회/다음은 고객 인덱스 정렬 순서로 20건씩 읽고 각 고객의 최근접속일시를 효율적으로 찾는 방식이 유리하다. 파일 출력은 모든 AC 고객을 처리하므로 고객접속이력을 고객번호별로 먼저 집계한 뒤 조인해야 반복 탐색을 줄일 수 있다.",
    relatedConcepts: ["부분범위 처리", "Scalar Subquery", "사전 집계", "인덱스 설계"],
    hints: ["두 버튼의 성능 목표가 서로 다르다.", "조회/다음은 처음 몇 페이지 응답속도가 중요하다.", "파일 출력은 전체 데이터를 한 번에 처리하므로 반복 스칼라 조회가 불리할 수 있다."]
  }),
  subject3Lab({
    id: "sql-cert-practice-06-order-delivery-batch",
    title: "실기문제 6 | 주문배송 야간 배치 튜닝",
    topic: "대량 배치 실행계획 분석",
    difficulty: "최상급",
    mode: "original",
    document: sqlExam,
    page: 104,
    answerPage: 105,
    questionNumber: "실기문제 6",
    verificationNote: "SQL-자격검정-실전문제 204~205쪽 실기문제 6의 ERD, 인덱스 구성, 병렬 SQL과 예상 실행계획을 렌더링 페이지로 대조했다.",
    scenario: "주문, 배송, 고객 정보를 읽어 주문배송 테이블에 입력하는 야간 배치 프로그램을 튜닝하려고 한다. 대상 주문 데이터는 2016년 6월부터 8월까지 3개월치다. 월별 주문건수는 1,000만 건이고 월별 배송건수는 900만 건이다. 배송은 주문이 완료된 후에 시작되며 고객 수는 500만 명이다.",
    requirements: ["아래 병렬 SQL과 예상실행계획을 분석해 가장 빠르게 수행할 수 있도록 SQL을 재작성하시오.", "옵티마이저 힌트 변경이 필요하면 SQL 문장에 정확히 기술하시오.", "세션 파라미터 변경이 필요하면 설정 값을 제시하시오.", "인덱스 구성 변경이 필요하면 변경안을 제시하시오.", "파티션 구성은 변경할 수 없다.", "시스템 운영 정책상 허용된 최대 Parallel Degree는 4다."],
    schemaSql: `[테이블 및 인덱스 구성]
고객
- 고객번호
- 고객명
- 고객연락처
- 등록일시

주문
- 주문번호
- 주문일자
- 주문고객번호
- 주문상품수
- 주문금액
- 주문상태코드
- 할인금액
- 배송지주소코드
- 배송지주소상세

배송
- 배송번호
- 주문번호
- 배송일자
- 배송상태코드
- 배송업체번호
- 배송기사연락처

[파티션 구성]
- 주문: 주문일자 기준 월단위 Range 파티션
- 배송: 배송일자 기준 월단위 Range 파티션

[인덱스 구성]
주문_PK: 주문번호
주문_N1: 주문상태코드 + 주문일자 (Local Partition)
주문_N2: 주문고객번호 + 주문일자 (Local Partition)
배송_PK: 배송번호
배송_N1: 주문번호 + 배송일자 (Local Partition)
배송_N2: 배송일자 + 배송상태코드 (Local Partition)
고객_PK: 고객번호
고객_N1: 고객명 + 고객번호`,
    currentSql: `INSERT INTO 주문배송 t
SELECT /*+ LEADING(o) USE_NL(d) INDEX(d) FULL(o) PARALLEL(o 4) */
       o.주문번호, o.주문일자, o.주문상품수, o.주문상태코드, o.주문고객번호,
       (SELECT 고객명 FROM 고객 WHERE 고객번호 = o.주문고객번호) 고객명,
       d.배송번호, d.배송일자, d.배송상태코드, d.배송업체번호, d.배송기사연락처
FROM 주문 o, 배송 d
WHERE o.주문일자 BETWEEN '20160601' AND '20160831'
  AND o.주문번호 = d.주문번호;`,
    executionPlan: `[예상 실행계획]
Id | Operation                         | Name      | Rows | Pstart | Pstop | TQ       | IN-OUT
0  | INSERT STATEMENT                  |           | 30M  |        |       |          |
1  | LOAD TABLE CONVENTIONAL           | 주문배송  |      |        |       |          |
2  | TABLE ACCESS BY INDEX ROWID       | 고객      | 1    |        |       |          |
3  | INDEX UNIQUE SCAN                 | 고객_PK   | 1    |        |       |          |
4  | PX COORDINATOR                    |           |      |        |       |          |
5  | PX SEND QC (RANDOM)               | :TQ10000  | 30M  |        |       | Q1,00    | P->S
6  | NESTED LOOPS                      |           | 30M  |        |       | Q1,00    | PCWP
7  | NESTED LOOPS                      |           | 30M  |        |       | Q1,00    | PCWP
8  | PX BLOCK ITERATOR                 |           | 30M  | 62     | 64    | Q1,00    | PCWC
9  | TABLE ACCESS FULL                 | 주문      | 30M  | 62     | 64    | Q1,00    | PCWP
10 | PARTITION RANGE ALL               |           |      |        |       | Q1,00    | PCWP
11 | INDEX RANGE SCAN                  | 배송_N1   | 1    | 1      | 65    | Q1,00    | PCWP
12 | TABLE ACCESS BY LOCAL INDEX ROWID | 배송      | 1    | 1      |       | Q1,00    | PCWP

Predicate Information
3  - access("고객번호" = :B1)
9  - filter("O"."주문일자" <= '20160831')
11 - access("O"."주문번호" = "D"."주문번호")`,
    answerSql: `ALTER SESSION ENABLE PARALLEL DML;

INSERT /*+ APPEND PARALLEL(t 4) */ INTO 주문배송 t
SELECT /*+ LEADING(o d c) USE_HASH(d) USE_HASH(c) FULL(o) FULL(d) FULL(c) PARALLEL(o 4) PARALLEL(d 4) PARALLEL(c 4) */
       o.주문번호, o.주문일자, o.주문상품수, o.주문상태코드, o.주문고객번호,
       c.고객명,
       d.배송번호, d.배송일자, d.배송상태코드, d.배송업체번호, d.배송기사연락처
FROM 주문 o
JOIN 배송 d
  ON d.주문번호 = o.주문번호
JOIN 고객 c
  ON c.고객번호 = o.주문고객번호
WHERE o.주문일자 >= '20160601'
  AND o.주문일자 <  '20160901';`,
    acceptedAlternatives: ["고객 조회를 스칼라 서브쿼리에서 조인으로 바꾸고, 대량 주문/배송을 Hash Join 중심으로 처리하는 방향이면 인정한다.", "배송일자 파티션 조건을 안전하게 추가할 수 있는 업무 전제가 명확하면 배송 파티션 프루닝을 함께 유도해도 인정한다."],
    rubric: ["스칼라 서브쿼리 고객 조회를 조인으로 바꾼다.", "배송_N1 반복 탐색과 배송 파티션 전체 탐색 문제를 지적한다.", "대량 배치에 NL 반복보다 Hash Join과 병렬 Full Scan이 유리한 근거를 설명한다.", "Parallel DML을 사용하려면 세션 설정과 APPEND를 함께 고려한다.", "문자형 날짜 조건의 상한을 다음 기간 미만으로 표현한다."],
    explanation: "예상 실행계획은 주문 3개월 3,000만 건을 읽고 배송을 주문번호로 반복 탐색하며, 고객명도 스칼라 서브쿼리로 반복 조회한다. 야간 배치이고 동시 DML이 없으며 최대 병렬도 4가 허용되므로 고객 조회를 조인으로 바꾸고 대량 집합은 Hash Join과 병렬 처리 중심으로 재작성하는 것이 적절하다. 단, 파티션 구성 변경은 금지되어 있으므로 SQL과 힌트, 세션 설정 범위에서 개선해야 한다.",
    relatedConcepts: ["Parallel DML", "Hash Join", "Scalar Subquery", "Partition Pruning"],
    hints: ["예상 실행계획에서 배송_N1이 주문 건수만큼 반복 탐색되는지 본다.", "고객명 조회가 SELECT 절 스칼라 서브쿼리로 반복되는지 확인한다.", "대량 INSERT SELECT에서 APPEND와 Parallel DML 설정이 필요한지 검토한다."]
  })
];

export const pdfReviewItems: PdfReviewItem[] = [...pdfReviewQuestions, ...pdfReviewLabs];

export const bannedUserVisiblePatterns: RegExp[] = [
  /�/,
  /㉧/,
  /sourceDocument/i,
  /sourceType/i,
  /sourcePage/i,
  /sourceQuestion/i,
  /generationMode/i,
  /parentQuestionId/i,
  /variantGroupId/i,
  /contentHash/i,
  /semanticFingerprint/i,
  /review_required/i,
  /original_ready/i,
  /문항 키/,
  /추출 상태/,
  /PDF 원문 문항/,
  /유사형 문항/,
  /\[[^\]]+\.pdf\s+p\.\s*\d+/i
];

export function getUserVisibleText(item: PdfReviewItem): string {
  if (item.kind === "lab") {
    return [
      item.title,
      item.topic,
      item.difficulty,
      item.scenario,
      ...item.requirements,
      item.schemaSql,
      item.currentSql,
      item.executionPlan,
      item.answerSql,
      ...item.acceptedAlternatives,
      ...item.rubric,
      item.explanation,
      ...item.relatedConcepts,
      ...item.hints,
      ...(item.sampleData ?? []).flatMap((table) => [table.title, ...table.headers, ...table.rows.flat()]),
      ...(item.traceSummary ? [item.traceSummary.title, ...item.traceSummary.headers, ...item.traceSummary.rows.flat()] : [])
    ]
      .filter(Boolean)
      .join("\n");
  }

  return [
    item.subjectName,
    item.majorTopic,
    item.middleTopic,
    item.topic,
    item.difficulty,
    item.stem,
    item.passage,
    item.code,
    item.explanation,
    item.relatedConcept,
    ...item.hints,
    ...(item.table ? [item.table.title, ...item.table.headers, ...item.table.rows.flat()] : []),
    ...item.choices.flatMap((choice) => [choice.text, choice.explanation])
  ]
    .filter(Boolean)
    .join("\n");
}

export function findUserVisibleQualityIssues(items: PdfReviewItem[] = pdfReviewItems) {
  return items.flatMap((item) => {
    const text = getUserVisibleText(item);
    return bannedUserVisiblePatterns
      .filter((pattern) => pattern.test(text))
      .map((pattern) => ({
        id: item.id,
        pattern: pattern.toString()
      }));
  });
}

export function getPdfReviewSummary(items: PdfReviewItem[] = pdfReviewItems) {
  const bySubject = new Map<string, number>();
  const byMode = new Map<PdfReviewMode, number>();
  const byStatus = new Map<PdfReviewStatus, number>();

  for (const item of items) {
    const subject = item.kind === "objective" ? item.subjectName : "SQL Practice";
    bySubject.set(subject, (bySubject.get(subject) ?? 0) + 1);
    byMode.set(item.mode, (byMode.get(item.mode) ?? 0) + 1);
    byStatus.set(item.status, (byStatus.get(item.status) ?? 0) + 1);
  }

  return {
    total: items.length,
    objectives: items.filter((item) => item.kind === "objective").length,
    labs: items.filter((item) => item.kind === "lab").length,
    bySubject: Object.fromEntries(bySubject),
    byMode: Object.fromEntries(byMode),
    byStatus: Object.fromEntries(byStatus),
    qualityIssues: findUserVisibleQualityIssues(items)
  };
}

export const pdfReviewSummary = getPdfReviewSummary();
