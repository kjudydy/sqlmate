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

export const pdfReviewLabs: PdfReviewLab[] = [
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
  }
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
