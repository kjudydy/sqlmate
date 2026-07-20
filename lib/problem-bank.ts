import type { Choice, ChoiceId, ConceptArticle, Difficulty, LabPlanExplanation, LabQuestion, LabTraceSummaryRow, ObjectiveQuestion, SubjectId } from "@/lib/types";

const choiceIds: ChoiceId[] = ["A", "B", "C", "D"];
type ChoiceTuple = [string, string, string, string];

type DraftQuestion = {
  majorTopic?: string;
  middleTopic?: string;
  questionType?: string;
  topic: string;
  difficulty: Difficulty;
  stem: string;
  passage?: string;
  code?: string;
  table?: ObjectiveQuestion["table"];
  choices: ChoiceTuple;
  answerIndex?: 0 | 1 | 2 | 3;
  choiceExplanations?: ChoiceTuple;
  relatedConceptId?: string;
  reviewStatus?: "approved" | "review_required";
  hint: string;
  explanation: string;
};

type SubjectConfig<T = ModelSpec | SqlSpec | TuningSpec> = {
  id: SubjectId;
  name: string;
  articleCategory: string;
  specs: T[];
  drafts: (spec: T, index: number) => DraftQuestion[];
  article: (spec: T, index: number) => ConceptArticle;
};

type ModelSpec = {
  topic: string;
  difficulty: Difficulty;
  scenario: string;
  correctRule: string;
  trap: string;
  sqlAngle: string;
  candidates: ChoiceTuple;
  candidateNotes: ChoiceTuple;
};

type SqlSpec = {
  topic: string;
  difficulty: Difficulty;
  scenario: string;
  code: string;
  correctRule: string;
  fix: string;
  trap: string;
  resultAngle: string;
};

type TuningSpec = {
  topic: string;
  difficulty: Difficulty;
  scenario: string;
  code: string;
  correctRule: string;
  fix: string;
  trap: string;
  planAngle: string;
};

const extraScenarios = [
  "월말 배치",
  "모바일 주문",
  "정기결제",
  "고객등급 개편",
  "이벤트 캠페인",
  "대용량 이력 조회",
  "실시간 대시보드",
  "운영 장애 분석"
];

function rotateChoices(choices: ChoiceTuple, answerIndex: number, offset: number) {
  const shift = offset % choices.length;
  const rotated = choices.map((_, index) => choices[(index - shift + choices.length) % choices.length]) as ChoiceTuple;
  return {
    choices: rotated,
    answerIndex: ((answerIndex + shift) % choices.length) as 0 | 1 | 2 | 3
  };
}

function rotateTuple(tuple: ChoiceTuple, offset: number) {
  const shift = offset % tuple.length;
  return tuple.map((_, index) => tuple[(index - shift + tuple.length) % tuple.length]) as ChoiceTuple;
}

function makeChoices(choices: ChoiceTuple): Choice[] {
  return choices.map((text, index) => ({ id: choiceIds[index], text }));
}

function seededRank(seed: string, index: number) {
  let hash = 2166136261;
  const value = `${seed}:${index}`;

  for (let charIndex = 0; charIndex < value.length; charIndex += 1) {
    hash ^= value.charCodeAt(charIndex);
    hash = Math.imul(hash, 16777619);
  }

  return hash >>> 0;
}

function mixDrafts<T>(drafts: T[], seed: string) {
  return drafts
    .map((draft, index) => ({ draft, rank: seededRank(seed, index) }))
    .sort((a, b) => a.rank - b.rank)
    .map((item) => item.draft);
}

function hasAny(text: string, patterns: string[]) {
  return patterns.some((pattern) => text.includes(pattern));
}

function makeSolvingGuide(draft: DraftQuestion) {
  const guides = [];

  if (hasAny(draft.stem, ["부적절", "틀린", "아닌"])) {
    guides.push("문제가 '부적절한 것'을 묻고 있으므로 옳은 설명을 고르는 것이 아니라 틀린 전제를 제거해야 합니다.");
  }

  if (hasAny(draft.stem, ["옳은 것만 모두", "보기"])) {
    guides.push("ㄱ, ㄴ, ㄷ 보기는 한 번에 감으로 고르지 말고 각 문장을 O/X로 따로 판정한 뒤 조합을 맞춥니다.");
  }

  if (draft.table) {
    guides.push("표가 있으면 조건 적용 전 행을 먼저 세고, WHERE/JOIN/GROUP BY 적용 후 남는 행을 다시 확인합니다.");
  }

  if (draft.code) {
    guides.push("SQL 문항은 작성 순서가 아니라 논리 처리 순서와 NULL, 조인 조건 위치, 집계 기준을 따라 해석합니다.");
  }

  if (draft.topic.includes("실행계획") || draft.topic.includes("인덱스") || draft.topic.includes("Join") || draft.topic.includes("조인")) {
    guides.push("튜닝 문항은 실행계획 이름만 보지 말고 조인 순서, 접근 경로, 반복 횟수, Predicate 위치를 함께 봅니다.");
  }

  if (guides.length === 0) {
    guides.push("지문에서 업무 규칙, 조건, 예외 단어를 먼저 표시하고 선택지의 단정 표현을 확인합니다.");
  }

  return guides.join("\n");
}

function makeExamPoint(draft: DraftQuestion) {
  if (draft.topic.includes("NULL") || draft.topic.includes("NOT IN")) {
    return "NULL은 TRUE/FALSE가 아니라 UNKNOWN을 만들 수 있어 WHERE 결과에서 빠지는지 확인해야 합니다.";
  }

  if (draft.topic.includes("OUTER") || draft.topic.includes("관계 선택성")) {
    return "기준 행 보존 여부가 핵심입니다. 조건이 ON에 있는지 WHERE에 있는지에 따라 결과 건수가 달라질 수 있습니다.";
  }

  if (draft.topic.includes("식별") || draft.topic.includes("정규") || draft.topic.includes("엔터티")) {
    return "모델링 문제는 용어 암기보다 업무 규칙을 엔터티, 속성, 관계, 식별자로 분해하는 것이 핵심입니다.";
  }

  if (draft.topic.includes("ROLLUP") || draft.topic.includes("CUBE") || draft.topic.includes("GROUP") || draft.topic.includes("집계")) {
    return "집계 문항은 행 조건과 그룹 조건을 나누고, 소계/총계가 어떤 조합으로 생기는지 확인해야 합니다.";
  }

  if (draft.topic.includes("실행계획") || draft.topic.includes("인덱스") || draft.topic.includes("힌트") || draft.topic.includes("Join") || draft.topic.includes("조인")) {
    return "SQLP 튜닝 문항은 결과 보존이 먼저이고, 그 다음 인덱스 접근 조건과 조인 방식의 타당성을 판단합니다.";
  }

  return "기출형 문항은 한 단어 차이로 정답이 갈리는 경우가 많으니 '항상', '무조건', '자동으로' 같은 표현을 조심합니다.";
}

function makeStudyHint(draft: DraftQuestion) {
  return [`출제 포인트: ${draft.topic}`, `힌트: ${draft.hint}`, `풀이 방향:\n${makeSolvingGuide(draft)}`].join("\n\n");
}

function inferQuestionType(draft: DraftQuestion, subjectId: SubjectId) {
  if (draft.questionType) return draft.questionType;
  if (draft.stem.includes("옳은 것만 모두") || draft.passage?.includes("[보기]")) return "보기 조합형";
  if (draft.stem.includes("부적절") || draft.stem.includes("옳지 않은")) return "옳지 않은 설명 선택형";
  if (draft.code?.includes("Predicate Information") || draft.code?.includes("Rows") || draft.code?.includes("CR")) return "SQL Trace 분석 선택형";
  if (draft.code?.includes("Operation") || draft.topic.includes("실행계획")) return "실행계획 분석 선택형";
  if (draft.code && subjectId === "sql-basic") return "SQL 실행 결과 선택형";
  if (draft.code && subjectId === "tuning") return "적절한 튜닝 방향 선택형";
  if (draft.table) return "표 판단형 객관식";
  return "단일 선택 객관식";
}

function inferMajorTopic(subjectId: SubjectId, topic: string) {
  if (subjectId === "modeling") {
    if (hasAny(topic, ["정규", "반정규", "NULL", "성능", "도메인"])) return "성능 데이터 모델링";
    if (hasAny(topic, ["스키마", "모델링", "엔터티", "속성", "관계", "식별"])) return "데이터 모델링의 이해";
    return "관계와 식별자";
  }

  if (subjectId === "sql-basic") {
    if (hasAny(topic, ["JOIN", "조인", "서브쿼리", "집합", "Top-N", "계층", "윈도우", "ROLLUP", "CUBE"])) return "SQL 활용";
    if (hasAny(topic, ["DDL", "DML", "TCL", "제약", "트랜잭션"])) return "관리 구문";
    return "SQL 기본";
  }

  if (hasAny(topic, ["인덱스", "스캔", "클러스터링", "Predicate", "SARGable", "테이블 엑세스"])) return "인덱스 튜닝";
  if (hasAny(topic, ["조인", "Join", "NL", "Hash", "Sort Merge"])) return "조인 튜닝";
  if (hasAny(topic, ["Trace", "트레이스", "실행계획", "TKPROF"])) return "SQL 분석 도구";
  if (hasAny(topic, ["쿼리", "뷰", "서브쿼리", "OR", "파티션", "Top-N", "Sort", "Group"])) return "SQL 최적화 원리";
  if (hasAny(topic, ["Lock", "동시성", "트랜잭션"])) return "Lock과 트랜잭션 동시성 제어";
  return "SQL 고급활용 및 튜닝";
}

function inferMiddleTopic(subjectId: SubjectId, topic: string) {
  if (subjectId === "modeling") {
    if (hasAny(topic, ["정규", "반정규"])) return "정규화와 반정규화";
    if (hasAny(topic, ["식별"])) return "식별자";
    if (hasAny(topic, ["관계"])) return "관계";
    if (hasAny(topic, ["엔터티"])) return "엔터티";
    return "데이터 모델링 핵심";
  }

  if (subjectId === "sql-basic") {
    if (hasAny(topic, ["JOIN", "조인"])) return "조인";
    if (hasAny(topic, ["GROUP", "ROLLUP", "CUBE", "집계"])) return "그룹 함수";
    if (hasAny(topic, ["윈도우", "Top-N", "계층"])) return "고급 SQL";
    if (hasAny(topic, ["서브쿼리", "집합"])) return "서브쿼리와 집합 연산";
    return "SQL 기본 문법";
  }

  if (hasAny(topic, ["인덱스", "스캔", "Predicate", "SARGable", "클러스터링"])) return "인덱스 스캔 효율화";
  if (hasAny(topic, ["NL"])) return "NL 조인";
  if (hasAny(topic, ["Hash"])) return "Hash Join";
  if (hasAny(topic, ["Sort Merge"])) return "Sort Merge Join";
  if (hasAny(topic, ["Trace", "트레이스", "TKPROF"])) return "SQL Trace";
  if (hasAny(topic, ["파티션"])) return "Partition Pruning";
  if (hasAny(topic, ["뷰", "서브쿼리", "OR", "쿼리"])) return "Query Transformation";
  return "실행계획과 튜닝 판단";
}

function inferRelatedConceptId(subjectId: SubjectId, topic: string) {
  if (subjectId === "modeling") {
    if (topic.includes("엔터티")) return "modeling-entity";
    if (topic.includes("속성")) return "modeling-attribute";
    if (topic.includes("관계")) return "modeling-relationship";
    if (topic.includes("식별")) return "modeling-identifier";
    if (topic.includes("정규")) return "modeling-normalization";
    if (topic.includes("NULL")) return "modeling-null";
    return "modeling-data-model";
  }

  if (subjectId === "sql-basic") {
    if (topic.includes("WHERE") || topic.includes("NULL") || topic.includes("SARGable")) return "sql-where";
    if (topic.includes("조인") || topic.includes("JOIN")) return "sql-standard-join";
    if (topic.includes("GROUP") || topic.includes("ROLLUP") || topic.includes("CUBE") || topic.includes("집계")) return "sql-group-having";
    if (topic.includes("윈도우")) return "sql-window-functions";
    if (topic.includes("Top-N")) return "sql-top-n";
    if (topic.includes("서브쿼리")) return "sql-subquery";
    if (topic.includes("집합")) return "sql-set-operators";
    if (topic.includes("함수")) return "sql-functions";
    return "sql-where";
  }

  if (topic.includes("Trace") || topic.includes("트레이스") || topic.includes("TKPROF")) return "tuning-sql-trace";
  if (topic.includes("쿼리") || topic.includes("뷰") || topic.includes("서브쿼리") || topic.includes("OR")) return "tuning-query-transformation";
  if (topic.includes("Hash")) return "tuning-hash-join";
  if (topic.includes("NL")) return "tuning-nl-join";
  if (topic.includes("Sort") || topic.includes("정렬")) return "tuning-sort";
  if (topic.includes("파티션")) return "tuning-partitioning";
  if (topic.includes("Lock") || topic.includes("동시성")) return "tuning-lock";
  if (topic.includes("테이블")) return "tuning-table-access";
  return "tuning-index-scan-efficiency";
}

function duplicationCheckNote(globalIndex: number) {
  if (globalIndex < 10) return "approved seed: 사용자가 승인한 1~10번 품질 기준 세트";
  if (globalIndex < 100) return "자동 QA: 동일 stem/code/table/choices 서명 중복 없음";
  return "review_required: 20문제 확장 배치 검수 후 승인 필요";
}

function makeDetailedExplanation(draft: DraftQuestion, answerText: string) {
  return [
    `정답 근거: ${draft.explanation}`,
    `풀이 순서:\n${makeSolvingGuide(draft)}`,
    `시험 포인트: ${makeExamPoint(draft)}`,
    `정답 선택지 핵심: ${answerText}`
  ].join("\n\n");
}

function makeWhyWrong(draft: DraftQuestion, choices: ChoiceTuple, answerIndex: number, choiceExplanations?: ChoiceTuple): Record<ChoiceId, string> {
  const answerText = choices[answerIndex];
  const asksWrongChoice = hasAny(draft.stem, ["부적절", "틀린", "아닌"]);
  const asksCombo = hasAny(draft.stem, ["옳은 것만 모두", "보기"]);

  return choiceIds.reduce(
    (acc, id, index) => {
      const choiceText = choices[index];

      if (choiceExplanations?.[index]) {
        acc[id] = choiceExplanations[index];
        return acc;
      }

      if (index === answerIndex) {
        acc[id] = `정답 선택지입니다. ${draft.explanation}`;
        return acc;
      }

      if (asksWrongChoice) {
        acc[id] = `오답입니다. 이 선택지는 지문 기준으로 옳거나 더 적절한 설명이므로, '${draft.stem}' 문항에서는 정답이 아닙니다. 정답은 "${answerText}"처럼 잘못된 전제를 담은 선택지입니다.`;
        return acc;
      }

      if (asksCombo) {
        acc[id] = `오답입니다. 보기 조합 중 하나 이상의 O/X 판정이 어긋났습니다. ㄱ, ㄴ, ㄷ을 따로 판단하면 정답 조합은 "${answerText}"입니다.`;
        return acc;
      }

      acc[id] = `오답입니다. "${choiceText}"는 ${draft.topic}의 핵심 조건을 충분히 만족하지 못합니다. 지문과 SQL/모델 조건을 적용하면 "${answerText}"가 더 정확합니다.`;
      return acc;
    },
    {} as Record<ChoiceId, string>
  );
}

function withExtraContext(draft: DraftQuestion, index: number, baseLength: number): DraftQuestion {
  const round = Math.floor(index / baseLength);
  if (round === 0) return draft;

  const scenario = extraScenarios[index % extraScenarios.length];
  return {
    ...draft,
    stem: `${draft.stem} - ${scenario} 사례`,
    passage: [draft.passage, `추가 사례: ${scenario} 상황에서도 같은 원칙을 적용해 판단한다.`].filter(Boolean).join("\n")
  };
}

const examReconstructionDrafts: Record<SubjectId, DraftQuestion[]> = {
  modeling: [
    {
      topic: "데이터 모델링 유의점",
      difficulty: "기본",
      stem: "다음 중 데이터 모델링 시 유의해야 할 사항으로 가장 부적절한 것은?",
      choices: [
        "조회 성능을 이유로 모든 모델을 처음부터 반정규화하여 설계한다.",
        "같은 데이터가 여러 장소에 중복 저장되지 않도록 중복성을 검토한다.",
        "사소한 업무 변화에도 모델이 크게 흔들리지 않도록 유연성을 고려한다.",
        "데이터 간 상호 연관 관계를 명확히 하여 비일관성을 예방한다."
      ],
      hint: "모델링 유의점은 중복, 비유연성, 비일관성 방지입니다.",
      explanation: "반정규화는 정규화와 성능 병목 확인 후 제한적으로 검토할 사항이지 모델링 유의점 자체가 아닙니다."
    },
    {
      topic: "속성 분류",
      difficulty: "기본",
      stem: "다음 설명에 대한 속성 분류로 가장 부적절한 것은?",
      passage: "정기예금 상품은 예금분류코드, 원금, 예치기간, 이자율을 관리한다. 원금과 이자율을 이용해 계산한 예상이자도 함께 조회한다.",
      choices: [
        "이자율은 다른 속성으로 계산되는 파생 속성이다.",
        "원금은 업무에서 직접 관리하는 기본 속성이다.",
        "예금분류코드는 업무를 규칙화하기 위해 도입한 설계 속성으로 볼 수 있다.",
        "예상이자는 원금과 이자율로 계산되는 파생 속성이다."
      ],
      hint: "계산 결과인지, 정의되어 입력되는 값인지 구분하세요.",
      explanation: "이자율은 계산 결과가 아니라 상품 조건으로 정의되는 값입니다. 예상이자가 파생 속성입니다."
    },
    {
      topic: "인스턴스와 속성",
      difficulty: "기본",
      stem: "인스턴스에 대한 설명으로 가장 부적절한 것은?",
      choices: [
        "인스턴스는 속성이 하나도 없어도 엔터티에 존재할 수 있다.",
        "인스턴스는 엔터티에 속한 개별 발생 값이다.",
        "하나의 엔터티에는 여러 인스턴스가 존재할 수 있다.",
        "인스턴스는 속성 값들의 조합으로 식별된다."
      ],
      hint: "인스턴스는 속성 값으로 표현됩니다.",
      explanation: "속성이 전혀 없는 인스턴스는 업무적으로 식별하거나 설명할 수 없습니다."
    },
    {
      topic: "스키마 구조",
      difficulty: "기본",
      stem: "다음 설명이 의미하는 스키마로 가장 적절한 것은?",
      passage: "조직 전체 관점에서 모든 사용자와 응용시스템이 필요로 하는 데이터를 통합하여 DB에 저장되는 데이터와 관계를 표현한다.",
      choices: ["개념 스키마", "외부 스키마", "내부 스키마", "응용 스키마"],
      hint: "조직 전체의 통합 관점입니다.",
      explanation: "조직 전체의 통합적 데이터 구조는 개념 스키마입니다."
    },
    {
      topic: "엔터티 분류",
      difficulty: "중간",
      stem: "다음 중 발생 시점에 따른 엔터티 분류에 해당하지 않는 것은?",
      choices: ["유형 엔터티", "기본 엔터티", "중심 엔터티", "행위 엔터티"],
      hint: "발생 시점 분류는 기본, 중심, 행위입니다.",
      explanation: "유형 엔터티는 유무형 분류에 가깝고, 발생 시점 분류는 기본/중심/행위 엔터티입니다."
    },
    {
      topic: "관계 표기법",
      difficulty: "기본",
      stem: "관계 표기법의 구성 요소로 가장 부적절한 것은?",
      choices: ["관계분류", "관계명", "관계차수", "관계선택사양"],
      hint: "관계 표기법은 이름, 차수, 선택사양을 중심으로 봅니다.",
      explanation: "관계분류는 관계 표기법의 대표 구성 요소로 보지 않습니다."
    },
    {
      topic: "ERD 관계차수",
      difficulty: "중간",
      stem: "다음 업무규칙에 대한 ERD 해석으로 가장 적절한 것은?",
      passage: "고객은 주문을 하지 않을 수 있다. 주문은 반드시 한 명의 고객에 의해 발생한다.",
      choices: [
        "고객은 주문과 선택 관계이고, 주문은 고객과 필수 관계이다.",
        "고객과 주문은 양쪽 모두 필수 1:1 관계이다.",
        "주문은 고객 없이 독립적으로 생성될 수 있다.",
        "고객은 반드시 하나 이상의 주문을 가져야 한다."
      ],
      hint: "기준 엔터티의 행 보존 여부를 생각하세요.",
      explanation: "주문이 없는 고객은 가능하지만 고객 없는 주문은 불가능합니다."
    },
    {
      topic: "식별자 특징",
      difficulty: "기본",
      stem: "주식별자의 특징으로 가장 부적절한 것은?",
      choices: [
        "주식별자는 NULL을 허용해도 무방하다.",
        "주식별자는 각 인스턴스를 유일하게 구분해야 한다.",
        "주식별자는 값이 자주 변하지 않는 것이 바람직하다.",
        "복합 식별자는 불필요하게 많은 속성을 포함하지 않도록 한다."
      ],
      hint: "주식별자는 존재성과 유일성이 중요합니다.",
      explanation: "주식별자는 각 인스턴스를 식별해야 하므로 NULL을 허용하면 안 됩니다."
    },
    {
      topic: "식별자 분류",
      difficulty: "중간",
      stem: "다음 보기의 식별자 분류가 바르게 연결된 것은?",
      passage: "[보기]\nㄱ. 엔터티의 대표성을 가지며 각 어커런스를 구분한다.\nㄴ. 대표성은 없지만 각 어커런스를 구분할 수 있다.\nㄷ. 업무에 의해 만들어진 식별자이다.\nㄹ. 다른 엔터티와의 관계를 통해 받아온 식별자이다.",
      choices: [
        "ㄱ 주식별자, ㄴ 보조식별자, ㄷ 본질식별자, ㄹ 외부식별자",
        "ㄱ 보조식별자, ㄴ 주식별자, ㄷ 외부식별자, ㄹ 본질식별자",
        "ㄱ 본질식별자, ㄴ 외부식별자, ㄷ 주식별자, ㄹ 보조식별자",
        "ㄱ 주식별자, ㄴ 외부식별자, ㄷ 보조식별자, ㄹ 본질식별자"
      ],
      hint: "대표성, 업무 발생 여부, 관계 수신 여부를 구분하세요.",
      explanation: "대표성은 주식별자, 대표성 없는 구분자는 보조식별자, 업무에서 생성된 것은 본질식별자, 관계로 받은 것은 외부식별자입니다."
    },
    {
      topic: "정규화",
      difficulty: "중간",
      stem: "다음 설명이 의미하는 정규형으로 가장 적절한 것은?",
      passage: "릴레이션이 제1정규형을 만족하고, 기본키가 아닌 모든 속성이 기본키 전체에 완전 함수 종속된다.",
      choices: ["제2정규형", "제1정규형", "제3정규형", "보이스-코드 정규형"],
      hint: "부분 함수 종속 제거를 떠올리세요.",
      explanation: "기본키 전체에 완전 함수 종속되면 제2정규형을 만족합니다."
    },
    {
      topic: "도메인",
      difficulty: "기본",
      stem: "각 속성이 가질 수 있는 값의 범위를 의미하는 용어로 가장 적절한 것은?",
      choices: ["도메인", "관계차수", "식별자", "카디널리티"],
      hint: "속성 값의 허용 범위입니다.",
      explanation: "도메인은 속성이 가질 수 있는 값의 범위입니다."
    },
    {
      topic: "M:N 관계 해소",
      difficulty: "중간",
      stem: "고객은 같은 서비스를 여러 번 이용할 수 있고, 서비스는 여러 고객에게 제공될 수 있다. 가장 적절한 모델은?",
      choices: [
        "고객과 서비스 사이에 서비스이용 엔터티를 두고 이용일자 등 관계 속성을 둔다.",
        "고객 테이블에 서비스코드1, 서비스코드2 컬럼을 계속 추가한다.",
        "서비스 테이블에 고객번호를 하나만 둔다.",
        "고객과 서비스를 1:1 관계로 고정한다."
      ],
      hint: "동일 서비스를 재이용할 수 있으면 관계 발생 자체를 관리해야 합니다.",
      explanation: "M:N 관계와 반복 이용 이력은 교차 엔터티로 해소하는 것이 적절합니다."
    }
  ],
  "sql-basic": [
    {
      topic: "ORDER BY",
      difficulty: "기본",
      stem: "PLAYER 테이블에서 선수명과 팀명은 오름차순, 연봉은 내림차순으로 조회하는 ORDER BY 절로 가장 적절한 것은?",
      code: "SELECT 선수명, 팀명, 연봉\nFROM PLAYER",
      choices: [
        "ORDER BY 선수명 ASC, 팀명 ASC, 3 DESC",
        "ORDER BY 선수명 DESC, 팀명 DESC, 연봉 ASC",
        "ORDER BY 선수명 ASC, 팀명, DESC 연봉",
        "ORDER BY 1 DESC, 2 DESC, 3 ASC"
      ],
      hint: "정렬 방향 생략 시 ASC이고, SELECT 목록의 순번을 사용할 수 있습니다.",
      explanation: "선수명 ASC, 팀명 ASC, 세 번째 컬럼인 연봉 DESC가 요구사항에 맞습니다."
    },
    {
      topic: "GROUP BY와 HAVING",
      difficulty: "중간",
      stem: "학과별 평균학점이 3.0 이상인 학과를 조회하려고 한다. 가장 적절한 SQL 작성 방향은?",
      code: "STUDENT(학번, 학과)\nENROLL(학번, 강좌번호, 학점)",
      choices: [
        "학과로 GROUP BY 한 뒤 HAVING AVG(학점) >= 3.0 조건을 둔다.",
        "WHERE AVG(학점) >= 3.0 조건만 사용한다.",
        "GROUP BY 없이 HAVING 절만 사용하면 학과별 평균이 자동 계산된다.",
        "ORDER BY AVG(학점)만 사용하면 평균 3.0 이상만 남는다."
      ],
      hint: "집계 결과 조건은 HAVING에서 판단합니다.",
      explanation: "학과별 평균이므로 GROUP BY 학과가 필요하고, 집계 조건은 HAVING에 둡니다."
    },
    {
      topic: "뷰와 조건 결합",
      difficulty: "중간",
      stem: "다음 뷰와 조회 SQL의 결과로 가장 적절한 것은?",
      table: {
        headers: ["C1", "C2"],
        rows: [["A", "100"], ["B", "200"], ["B", "100"], ["NULL", "200"]]
      },
      code: "CREATE VIEW V_T AS\nSELECT * FROM T\nWHERE C1 = 'B' OR C1 IS NULL;\n\nSELECT SUM(C2) AS C2\nFROM V_T\nWHERE C2 >= 200 AND C1 = 'B';",
      choices: ["200", "0", "300", "400"],
      hint: "뷰 조건과 조회 조건을 모두 만족해야 합니다.",
      explanation: "뷰에는 B행과 NULL행이 남지만 최종 WHERE에서 C1='B'와 C2>=200을 모두 만족하는 행은 B,200 한 건입니다."
    },
    {
      topic: "NULL 비교",
      difficulty: "중간",
      stem: "다음 SQL 조건 평가에 대한 설명으로 가장 적절한 것은?",
      code: "SELECT *\nFROM T\nWHERE C1 <> 'B';",
      table: {
        headers: ["C1"],
        rows: [["A"], ["B"], ["NULL"]]
      },
      choices: [
        "C1이 NULL인 행은 조건 결과가 UNKNOWN이므로 반환되지 않는다.",
        "NULL은 빈 문자열과 같으므로 반환된다.",
        "NULL은 'B'가 아니므로 항상 반환된다.",
        "비교 연산자는 NULL을 0으로 변환한다."
      ],
      hint: "NULL 비교 결과는 TRUE/FALSE가 아니라 UNKNOWN이 될 수 있습니다.",
      explanation: "WHERE 절은 TRUE인 행만 반환하므로 UNKNOWN인 NULL 행은 제외됩니다."
    },
    {
      topic: "NOT IN",
      difficulty: "실전",
      stem: "다음 SQL의 결과에 대한 설명으로 가장 적절한 것은?",
      code: "SELECT C1\nFROM T1\nWHERE C1 NOT IN (SELECT C1 FROM T2);",
      table: {
        headers: ["T1.C1", "T2.C1"],
        rows: [["1", "2"], ["2", "NULL"], ["3", ""]]
      },
      choices: [
        "서브쿼리 결과에 NULL이 포함되면 NOT IN 비교가 UNKNOWN이 되어 기대와 다른 결과가 나올 수 있다.",
        "NOT IN은 NULL을 자동으로 제거하고 비교한다.",
        "NOT IN은 EXISTS와 항상 같은 결과를 반환한다.",
        "NULL이 있어도 T1의 1과 3은 반드시 반환된다."
      ],
      hint: "NOT IN과 NULL 조합은 자주 나오는 함정입니다.",
      explanation: "서브쿼리에 NULL이 포함되면 NOT IN의 전체 판단이 UNKNOWN으로 흐를 수 있어 주의해야 합니다."
    },
    {
      topic: "ROLLUP",
      difficulty: "중간",
      stem: "주문일자별, 주문방법별 소계와 전체 합계를 함께 구하려고 한다. 가장 적절한 GROUP BY 구문은?",
      choices: [
        "GROUP BY ROLLUP(주문일자, 주문방법)",
        "GROUP BY 주문일자, 주문방법 HAVING ROLLUP",
        "GROUP BY CUBE(주문일자)",
        "GROUP BY GROUPING(주문일자, 주문방법)"
      ],
      hint: "계층적 소계는 ROLLUP입니다.",
      explanation: "ROLLUP(주문일자, 주문방법)은 상세, 주문일자 소계, 전체 합계를 생성합니다."
    },
    {
      topic: "CUBE",
      difficulty: "중간",
      stem: "주문일자와 주문방법 각각의 소계, 두 컬럼 조합의 집계, 전체 집계를 모두 출력하려고 한다. 가장 적절한 것은?",
      choices: [
        "GROUP BY CUBE(주문일자, 주문방법)",
        "GROUP BY ROLLUP(주문일자)",
        "GROUP BY 주문일자, 주문방법",
        "GROUP BY GROUPING_ID"
      ],
      hint: "모든 조합의 소계를 떠올리세요.",
      explanation: "CUBE는 지정한 컬럼 조합의 모든 소계를 생성합니다."
    },
    {
      topic: "윈도우 함수",
      difficulty: "중간",
      stem: "부서별 급여 순위를 구하되 같은 급여는 같은 순위로 표시하고 다음 순위는 건너뛰려 한다. 가장 적절한 함수는?",
      choices: ["RANK()", "ROW_NUMBER()", "DENSE_RANK()", "NTILE()"],
      hint: "동순위 후 순위를 건너뛰는지 확인하세요.",
      explanation: "RANK는 동순위에 같은 순위를 부여하고 다음 순위를 건너뜁니다."
    },
    {
      topic: "OUTER JOIN 조건 위치",
      difficulty: "실전",
      stem: "고객은 모두 출력하고, 최근 주문이 있으면 주문정보를 함께 출력하려 한다. 가장 적절한 조건 위치는?",
      code: "CUSTOMER C LEFT JOIN ORDERS O ON O.CUST_ID = C.CUST_ID",
      choices: [
        "주문일자 조건은 ON 절에 두어 고객 행 보존을 유지한다.",
        "주문일자 조건은 WHERE 절에 두어야 항상 고객이 모두 보존된다.",
        "LEFT JOIN은 조건 위치와 무관하게 같은 결과를 반환한다.",
        "OUTER JOIN에서는 ON 절 조건을 사용할 수 없다."
      ],
      hint: "WHERE에서 후행 테이블 조건을 걸면 NULL 확장 행이 제거될 수 있습니다.",
      explanation: "보존 테이블의 모든 행을 유지하려면 후행 테이블 조건은 ON 절에 두는 것이 안전합니다."
    }
  ],
  tuning: [
    {
      topic: "실행계획 읽기",
      difficulty: "실전",
      stem: "다음 실행계획 해석으로 가장 적절한 것은?",
      code: "TABLE ACCESS FULL ORDERS\n  filter: TO_CHAR(ORDER_DT,'YYYYMM') = '202607'",
      choices: [
        "컬럼에 함수가 적용되어 일반 B-tree 인덱스의 범위 탐색이 어려울 수 있다.",
        "FULL SCAN은 항상 인덱스 스캔보다 빠르므로 튜닝 대상이 아니다.",
        "TO_CHAR 조건은 자동으로 ORDER_DT 범위 조건으로 변환된다.",
        "필터 조건은 실행계획과 무관하다."
      ],
      hint: "Access Predicate와 Filter Predicate를 구분하세요.",
      explanation: "컬럼 함수 조건은 인덱스 선두 컬럼을 그대로 사용하기 어렵게 만들 수 있어 범위 조건 변환을 검토합니다."
    },
    {
      topic: "인덱스 튜닝",
      difficulty: "실전",
      stem: "복합 인덱스 IDX_ORDERS_01(CUST_ID, ORDER_DT)가 있을 때 가장 인덱스 활용 가능성이 높은 조건은?",
      choices: [
        "CUST_ID = :b1 AND ORDER_DT >= :b2",
        "ORDER_DT >= :b2",
        "TO_CHAR(ORDER_DT,'YYYYMM') = :b1",
        "AMOUNT + 0 > :b1"
      ],
      hint: "복합 인덱스는 선두 컬럼 조건이 중요합니다.",
      explanation: "선두 컬럼 CUST_ID의 등치 조건과 ORDER_DT 범위 조건을 함께 사용하므로 활용 가능성이 높습니다."
    },
    {
      topic: "Nested Loops",
      difficulty: "실전",
      stem: "다음 중 Nested Loops 조인에 대한 설명으로 가장 적절한 것은?",
      choices: [
        "선행 집합이 작고 후행 집합 조인 컬럼 인덱스가 효율적일 때 유리할 수 있다.",
        "대량 집합끼리 조인할 때 항상 Hash Join보다 빠르다.",
        "후행 테이블을 FULL SCAN해도 반복 횟수와 무관하게 비용이 작다.",
        "조인 순서는 Nested Loops 성능과 무관하다."
      ],
      hint: "반복 접근 비용을 생각하세요.",
      explanation: "Nested Loops는 선행 집합 건수와 후행 집합 접근 비용에 크게 영향을 받습니다."
    },
    {
      topic: "Hash Join",
      difficulty: "실전",
      stem: "대량의 주문과 주문상세를 동등 조건으로 조인하고 대부분의 행을 읽어야 한다. 가장 적절한 조인 방식 후보는?",
      choices: ["Hash Join", "Nested Loops만 고정", "Cartesian Join", "Index Unique Scan"],
      hint: "대량 동등 조인에서 해시 조인을 떠올리세요.",
      explanation: "대량 동등 조인에서는 Build/Probe가 가능한 Hash Join이 유리한 후보가 될 수 있습니다."
    },
    {
      topic: "힌트",
      difficulty: "실전",
      stem: "다음 힌트 사용에 대한 설명으로 가장 부적절한 것은?",
      code: "SELECT /*+ LEADING(C O) USE_NL(O) INDEX(O IDX_ORDERS_01) */ ...",
      choices: [
        "힌트는 많이 작성할수록 서로 충돌해도 옵티마이저가 항상 의도대로 처리한다.",
        "LEADING은 조인 순서 의도를 표현한다.",
        "USE_NL은 지정 테이블을 후행으로 Nested Loops 조인하도록 유도한다.",
        "INDEX 힌트는 접근 경로 의도를 표현한다."
      ],
      hint: "힌트는 조인 순서, 조인 방식, 접근 경로가 서로 맞아야 합니다.",
      explanation: "충돌하는 힌트를 많이 넣으면 목표 실행계획이 안정되는 것이 아니라 무시되거나 다른 계획이 나올 수 있습니다."
    },
    {
      topic: "파티션 프루닝",
      difficulty: "실전",
      stem: "월별 파티션 테이블에서 특정 월 데이터만 조회하려 한다. 가장 적절한 조건 작성은?",
      choices: [
        "파티션 키 컬럼에 월 시작일 이상, 다음 월 시작일 미만의 범위 조건을 사용한다.",
        "파티션 키에 TO_CHAR를 적용해 YYYYMM 문자열로 비교한다.",
        "파티션 키 조건 없이 WHERE 절의 다른 컬럼만 사용한다.",
        "파티션 테이블은 조건과 무관하게 항상 하나의 파티션만 읽는다."
      ],
      hint: "파티션 키가 변형되지 않아야 프루닝 가능성이 높습니다.",
      explanation: "파티션 키에 직접 범위 조건을 주면 필요한 파티션만 접근할 가능성이 높아집니다."
    },
    {
      topic: "실제 실행 통계",
      difficulty: "실전",
      stem: "다음 실행 통계에서 우선 확인할 병목 지점으로 가장 적절한 것은?",
      code: "Operation A: Starts=1, A-Rows=10, Buffers=100\nOperation B: Starts=10000, A-Rows=10000, Buffers=500000",
      choices: [
        "Starts와 Buffers가 큰 Operation B의 반복 접근 원인을 확인한다.",
        "Operation A가 먼저 표시되었으므로 반드시 A가 병목이다.",
        "A-Rows가 있으면 Buffers는 볼 필요가 없다.",
        "Starts는 실행 횟수와 무관하다."
      ],
      hint: "실제 실행 통계는 Starts, A-Rows, Buffers를 함께 봅니다.",
      explanation: "Starts가 크고 Buffers가 큰 단계는 반복 호출 비용의 원인일 수 있습니다."
    }
  ]
};

const qualitySeedDrafts: Record<SubjectId, DraftQuestion[]> = {
  modeling: [
    {
      topic: "데이터 모델링의 관점",
      difficulty: "중간",
      stem: "다음 업무 설명을 데이터 모델링 관점으로 해석한 것으로 가장 적절한 것은?",
      passage:
        "보험 계약 업무에서 청약, 심사, 계약, 보험료 납입, 보상 청구가 순서대로 처리된다. 데이터 모델러는 계약자, 계약, 보험료, 보상청구 데이터를 식별하고 각 프로세스가 어떤 데이터를 생성·변경·조회하는지 함께 검토한다.",
      choices: [
        "데이터 관점은 관리해야 할 대상과 관계를 찾고, 상관 관점은 프로세스가 데이터에 미치는 CRUD 영향을 본다.",
        "프로세스 관점은 테이블의 물리 저장 구조와 인덱스 블록 분포만을 분석한다.",
        "상관 관점은 데이터와 프로세스를 분리해 서로 영향을 주지 않는다는 전제를 확인한다.",
        "데이터 관점은 화면 흐름과 버튼 클릭 순서만 표현하므로 엔터티 도출과 무관하다."
      ],
      choiceExplanations: [
        "정답입니다. 데이터 관점은 업무 데이터와 관계, 상관 관점은 프로세스가 데이터에 주는 생성·조회·수정·삭제 영향을 함께 본다는 점이 핵심입니다.",
        "오답입니다. 물리 저장 구조와 인덱스 블록 분포는 물리 설계·튜닝 영역이며, 프로세스 관점의 핵심은 업무 수행 절차입니다.",
        "오답입니다. 상관 관점은 데이터와 프로세스의 상호작용을 보는 관점이지 둘이 독립임을 전제하는 관점이 아닙니다.",
        "오답입니다. 화면 흐름은 요구사항 이해에 도움을 줄 수 있지만 데이터 관점 자체는 엔터티, 속성, 관계 도출과 직접 관련됩니다."
      ],
      relatedConceptId: "modeling-data-model",
      hint: "데이터, 프로세스, 상관 관점이 각각 무엇을 질문하는지 구분하세요.",
      explanation: "업무 데이터 자체와 프로세스의 CRUD 영향을 함께 검토한다는 문장이 데이터 관점과 상관 관점을 동시에 가리킵니다."
    },
    {
      topic: "엔터티와 인스턴스",
      difficulty: "중간",
      stem: "다음 후보 중 엔터티로 보기 가장 어려운 것은?",
      table: {
        headers: ["후보", "업무 설명"],
        rows: [
          ["고객", "계약을 체결하거나 보상 청구를 할 수 있는 개인 또는 법인"],
          ["계약", "상품, 계약자, 기간, 상태를 가진 업무 관리 대상"],
          ["보험료납입", "계약별 납입일, 납입금액, 납입수단으로 발생하는 이력"],
          ["총납입금액", "계약별 납입 이력을 합산해 화면에 표시하는 계산 결과"]
        ]
      },
      choices: ["총납입금액", "고객", "계약", "보험료납입"],
      choiceExplanations: [
        "정답입니다. 총납입금액은 독립적으로 식별해 관리하는 발생 집합이라기보다 납입 이력에서 계산되는 파생 정보입니다.",
        "오답입니다. 고객은 업무에서 독립적으로 식별되고 여러 인스턴스를 가지는 대표적인 엔터티 후보입니다.",
        "오답입니다. 계약은 기간, 상태, 상품 등 속성과 생명주기를 가지는 중심 엔터티 후보입니다.",
        "오답입니다. 보험료납입은 계약에 종속된 행위 엔터티로, 납입 발생 이력을 관리해야 하므로 엔터티 후보가 됩니다."
      ],
      relatedConceptId: "modeling-entity",
      hint: "여러 인스턴스가 있고 독립적으로 식별·관리해야 하는 업무 대상인지 보세요.",
      explanation: "계산 결과는 속성 또는 조회 결과로 표현할 수 있으나, 별도 발생 집합이 아니라면 엔터티로 보기 어렵습니다."
    },
    {
      topic: "속성 분류",
      difficulty: "중간",
      stem: "다음 설명에서 속성 분류가 바르게 연결된 것은?",
      passage:
        "계약 테이블은 계약번호, 상품코드, 계약일자, 월보험료, 납입횟수를 저장한다. 화면에서는 월보험료와 납입횟수를 곱해 총납입예정금액을 보여준다.",
      choices: [
        "계약번호는 기본 또는 식별 속성, 상품코드는 설계 속성, 총납입예정금액은 파생 속성으로 볼 수 있다.",
        "월보험료는 계산식으로만 만들어지므로 항상 파생 속성이다.",
        "총납입예정금액은 화면에 보이므로 반드시 기본 속성으로 저장해야 한다.",
        "상품코드는 업무 분류를 위해 도입한 코드이므로 속성이 아니라 엔터티가 될 수 없다."
      ],
      choiceExplanations: [
        "정답입니다. 계약번호는 계약 인스턴스를 식별하고, 상품코드는 업무 분류를 위해 설계된 코드 속성, 총납입예정금액은 계산 결과입니다.",
        "오답입니다. 월보험료는 계약 조건으로 저장되는 기본 속성일 수 있고, 계산 결과라는 근거가 없습니다.",
        "오답입니다. 화면에 보인다고 반드시 저장해야 하는 것은 아닙니다. 계산 가능하면 파생 속성으로 둘 수 있고 성능 요구가 있을 때 저장 여부를 검토합니다.",
        "오답입니다. 코드는 설계 속성으로 충분히 표현될 수 있습니다. 별도 코드 엔터티를 둘 수는 있지만 '엔터티가 될 수 없다'도 과도한 표현입니다."
      ],
      relatedConceptId: "modeling-attribute",
      hint: "업무에서 입력·관리되는 값인지, 설계상 추가한 코드인지, 다른 값으로 계산되는지 구분하세요.",
      explanation: "SQLP 모델링 문제는 기본·설계·파생 속성을 섞어 내며, 화면 표시 여부와 저장 필요성을 혼동시키는 선택지가 자주 나옵니다."
    },
    {
      topic: "관계 선택성과 관계차수",
      difficulty: "중간",
      stem: "다음 업무 규칙을 ERD 관계로 해석한 것으로 가장 적절한 것은?",
      passage:
        "회원은 가입 직후 주문이 없을 수 있다. 주문은 반드시 한 명의 회원에 의해 발생한다. 하나의 회원은 여러 주문을 할 수 있다.",
      choices: [
        "회원 입장에서는 주문이 선택이고, 주문 입장에서는 회원이 필수이며, 회원과 주문은 1:M 관계다.",
        "회원은 주문이 반드시 1건 있어야 하므로 회원과 주문은 1:1 필수 관계다.",
        "주문은 회원 없이도 생성 가능하므로 주문에서 회원은 선택 관계다.",
        "주문이 여러 건 발생하므로 회원과 주문은 항상 M:N 관계로만 모델링한다."
      ],
      choiceExplanations: [
        "정답입니다. 주문 없는 회원은 허용되지만 회원 없는 주문은 허용되지 않고, 한 회원이 여러 주문을 가질 수 있으므로 1:M입니다.",
        "오답입니다. 가입 직후 주문이 없을 수 있으므로 회원 쪽 주문 관계는 선택이며 1:1도 아닙니다.",
        "오답입니다. 주문은 반드시 한 명의 회원에 의해 발생하므로 주문에서 회원은 필수입니다.",
        "오답입니다. 한 주문이 여러 회원에 의해 발생한다는 규칙이 없으므로 M:N으로 해석할 수 없습니다."
      ],
      relatedConceptId: "modeling-relationship",
      hint: "기준 엔터티마다 상대 엔터티 인스턴스가 0개 가능한지, 1개 이상 필수인지 따로 판단하세요.",
      explanation: "관계 선택성은 양쪽 방향을 따로 읽어야 하며, 차수는 한 인스턴스가 상대 인스턴스를 몇 개 가질 수 있는지로 판단합니다."
    },
    {
      topic: "주식별자 도출",
      difficulty: "실전",
      stem: "다음 보기 중 주식별자 설계 판단으로 옳은 것만 모두 고른 것은?",
      passage:
        "[보기]\nㄱ. 주식별자는 각 인스턴스를 유일하게 구분해야 하며 NULL을 허용하지 않는다.\nㄴ. 업무 식별자가 너무 길고 변경 가능성이 높으면 인조식별자 도입을 검토할 수 있다.\nㄷ. 관계로부터 받은 외부식별자는 어떤 경우에도 주식별자에 포함될 수 없다.",
      choices: ["ㄱ, ㄴ", "ㄱ, ㄷ", "ㄴ, ㄷ", "ㄱ, ㄴ, ㄷ"],
      choiceExplanations: [
        "정답입니다. ㄱ은 유일성·존재성, ㄴ은 인조식별자 도입 판단입니다. ㄷ은 식별 관계에서는 부모 식별자가 자식 주식별자 일부가 될 수 있어 틀렸습니다.",
        "오답입니다. ㄷ이 틀렸습니다. 외부식별자는 식별 관계에서 자식 주식별자 구성에 포함될 수 있습니다.",
        "오답입니다. ㄱ은 주식별자 기본 성질로 맞고, ㄷ은 식별 관계를 무시한 설명이라 틀렸습니다.",
        "오답입니다. ㄷ의 '어떤 경우에도'가 함정입니다. 식별 관계와 비식별 관계를 구분해야 합니다."
      ],
      relatedConceptId: "modeling-identifier",
      hint: "유일성, 최소성, 존재성, 불변성 그리고 식별/비식별 관계를 함께 보세요.",
      explanation: "주식별자는 인스턴스를 안정적으로 식별해야 하며, 부모 식별자가 자식 식별자에 포함되는 식별 관계도 출제 함정입니다."
    },
    {
      topic: "정규화",
      difficulty: "실전",
      stem: "다음 릴레이션에서 우선 제거해야 할 종속 문제로 가장 적절한 것은?",
      table: {
        headers: ["수강번호", "학생번호", "과목번호", "학생명", "과목명", "담당교수"],
        rows: [
          ["1001", "S01", "DB01", "김민지", "데이터베이스", "박교수"],
          ["1002", "S02", "DB01", "이서연", "데이터베이스", "박교수"]
        ]
      },
      passage: "수강번호가 기본키이며, 학생번호는 학생명을, 과목번호는 과목명과 담당교수를 결정한다.",
      choices: [
        "학생명과 과목명/담당교수는 기본키가 아닌 결정자에 종속되므로 학생·과목 엔터티로 분리해 이행 종속을 제거한다.",
        "모든 컬럼이 원자값이므로 더 이상 정규화할 대상이 없다.",
        "수강번호가 단일키이므로 제3정규형 위반은 발생할 수 없다.",
        "학생명과 과목명을 수강 테이블에 계속 중복 저장하면 조인 없이 항상 정합성이 보장된다."
      ],
      choiceExplanations: [
        "정답입니다. 단일 기본키라도 비식별자 학생번호·과목번호가 다른 비식별자를 결정하면 이행 종속 문제가 생깁니다.",
        "오답입니다. 원자값은 1정규형 판단이고, 함수 종속과 이행 종속 검토가 남아 있습니다.",
        "오답입니다. 단일키이면 부분 종속 문제는 줄지만, 비식별자 간 이행 종속은 여전히 발생할 수 있습니다.",
        "오답입니다. 중복 저장은 학생명·과목명 변경 시 갱신 이상과 불일치 위험을 만듭니다."
      ],
      relatedConceptId: "modeling-normalization",
      hint: "단일 기본키인지 복합키인지보다, 기본키가 아닌 속성이 다른 비식별자를 결정하는지 보세요.",
      explanation: "제3정규형은 비식별자 간 이행 종속을 제거하는 것이 핵심이며, 단일키 테이블에서도 충분히 출제됩니다."
    },
    {
      topic: "M:N 관계 해소",
      difficulty: "중간",
      stem: "다음 업무 규칙을 가장 안정적으로 표현한 모델은?",
      passage:
        "하나의 프로모션은 여러 상품에 적용될 수 있고, 하나의 상품은 기간이 다른 여러 프로모션에 참여할 수 있다. 프로모션별 상품 할인율과 적용 시작일을 관리해야 한다.",
      choices: [
        "프로모션상품 엔터티를 두고 프로모션번호, 상품번호, 적용시작일, 할인율을 관리한다.",
        "상품 테이블에 프로모션번호1, 프로모션번호2 컬럼을 계속 추가한다.",
        "프로모션 테이블에 상품번호 하나만 저장한다.",
        "상품과 프로모션을 1:1 관계로 고정하고 할인율은 화면에서만 입력한다."
      ],
      choiceExplanations: [
        "정답입니다. M:N 관계 자체가 업무 발생이며 관계 속성인 할인율과 적용 시작일을 교차 엔터티에서 관리해야 합니다.",
        "오답입니다. 반복 컬럼은 프로모션 개수가 늘 때 구조 변경이 필요하고 정규화 원칙에도 맞지 않습니다.",
        "오답입니다. 하나의 프로모션이 여러 상품에 적용될 수 있다는 규칙을 표현하지 못합니다.",
        "오답입니다. 업무 규칙상 다대다이며 할인율도 관리 대상이므로 1:1 고정과 화면 입력만으로는 데이터 정합성을 보장할 수 없습니다."
      ],
      relatedConceptId: "modeling-relationship-join",
      hint: "관계에 속성이 붙고 같은 쌍이 기간별로 반복될 수 있으면 교차 엔터티를 검토하세요.",
      explanation: "M:N 관계는 물리 테이블에서 직접 표현하기 어렵고, 관계 발생과 관계 속성을 관리하는 교차 엔터티로 해소합니다."
    },
    {
      topic: "반정규화",
      difficulty: "실전",
      stem: "다음 중 반정규화 검토 순서로 가장 적절한 것은?",
      passage:
        "주문 목록 화면에서 고객명, 최근 배송상태, 주문금액 합계를 함께 보여주는데 조인이 많아 응답 시간이 늦다. 개발팀은 주문 테이블에 고객명과 주문금액합계를 저장하자고 제안했다.",
      choices: [
        "정규화 모델과 SQL, 인덱스, 집계 방식의 병목을 먼저 확인한 뒤 중복 저장의 정합성 유지 방안까지 검토한다.",
        "조회가 한 번이라도 느리면 모든 조회 컬럼을 주문 테이블에 중복 저장한다.",
        "반정규화는 모델링 초기부터 정규화 검토 없이 적용해야 한다.",
        "중복 저장 후에는 원천 데이터 변경과 동기화 방법을 고려할 필요가 없다."
      ],
      choiceExplanations: [
        "정답입니다. 반정규화는 성능 병목과 대안을 확인한 뒤 중복·정합성·갱신 비용을 함께 검토하는 의사결정입니다.",
        "오답입니다. 모든 조회 컬럼 중복은 데이터 불일치와 DML 비용을 키우며, 근거 없는 반정규화입니다.",
        "오답입니다. 정규화와 업무 규칙 확인이 먼저이고, 반정규화는 성능 요구가 명확할 때 제한적으로 검토합니다.",
        "오답입니다. 반정규화의 가장 큰 위험이 원천 데이터와 중복 데이터의 동기화 문제입니다."
      ],
      relatedConceptId: "modeling-normalization",
      hint: "성능 개선 효과만 보지 말고 중복 데이터 정합성 유지 비용까지 함께 판단하세요.",
      explanation: "SQLP는 반정규화를 무조건 나쁜 것 또는 무조건 좋은 것으로 묻지 않고, 적용 전 검토 순서와 부작용을 함께 묻습니다."
    },
    {
      topic: "NULL과 모델 선택",
      difficulty: "중간",
      stem: "다음 모델링 판단으로 가장 적절한 것은?",
      passage:
        "고객의 법정대리인 정보는 미성년 고객에게만 필요하다. 성인 고객은 법정대리인명이 항상 NULL이다. 향후 법정대리인의 연락처, 관계, 동의일자도 관리할 예정이다.",
      choices: [
        "법정대리인을 별도 엔터티로 분리하거나 선택 관계로 두어 해당되는 고객에게만 발생하도록 검토한다.",
        "모든 고객 컬럼에 법정대리인명, 연락처, 관계, 동의일자를 두고 대부분 NULL이어도 모델 품질에는 영향이 없다.",
        "NULL이 있으면 SQL에서 절대 조회할 수 없으므로 해당 업무는 저장하지 않는다.",
        "선택 관계는 모델링에서 표현할 수 없으므로 법정대리인은 코드값 하나로만 둔다."
      ],
      choiceExplanations: [
        "정답입니다. 특정 조건에서만 발생하고 속성이 늘어나는 정보는 선택 관계 또는 별도 엔터티로 분리하는 것이 NULL 과다와 의미 혼란을 줄입니다.",
        "오답입니다. 대부분 NULL인 속성이 계속 늘면 테이블 의미가 흐려지고 제약, 검증, SQL 조건도 복잡해집니다.",
        "오답입니다. NULL은 조회와 비교에 주의가 필요할 뿐 저장 자체가 불가능한 것은 아닙니다.",
        "오답입니다. 선택 관계는 ERD에서 표현 가능하며, 법정대리인 업무 속성을 코드 하나로 축약하면 의미를 잃습니다."
      ],
      relatedConceptId: "modeling-null",
      hint: "NULL이 업무상 미발생을 의미하는지, 아직 모름을 의미하는지, 속성군 분리가 필요한지 확인하세요.",
      explanation: "NULL 과다 문제는 SQL 결과뿐 아니라 모델 의미와 제약 관리에도 영향을 줍니다."
    },
    {
      topic: "트랜잭션 모델링",
      difficulty: "실전",
      stem: "다음 중 트랜잭션 모델링 관점의 설명으로 가장 적절한 것은?",
      passage:
        "주문 취소 프로세스는 주문 상태를 변경하고, 결제 취소 이력을 생성하며, 재고 예약 수량을 되돌린다. 세 작업은 업무적으로 하나의 취소 처리 단위로 관리된다.",
      choices: [
        "취소 트랜잭션이 어떤 엔터티를 생성·수정하는지 CRUD 영향을 식별하고 일관성 경계를 함께 검토한다.",
        "트랜잭션 모델링은 오직 화면 버튼 배치만 결정하므로 데이터 모델과 무관하다.",
        "하나의 프로세스가 여러 엔터티를 변경하면 무조건 모든 엔터티를 하나의 테이블로 합친다.",
        "트랜잭션은 DBMS 커밋 명령만 의미하므로 업무 모델링 단계에서는 고려하지 않는다."
      ],
      choiceExplanations: [
        "정답입니다. 트랜잭션 모델링은 업무 처리 단위가 데이터에 주는 생성·수정·삭제 영향을 보고 일관성 경계를 찾는 작업입니다.",
        "오답입니다. 화면 흐름과 관련은 있을 수 있지만, 핵심은 업무 프로세스와 데이터 변경 영향입니다.",
        "오답입니다. 여러 엔터티를 함께 변경한다고 테이블을 합치는 것은 정규화와 업무 의미를 해칠 수 있습니다.",
        "오답입니다. DBMS 커밋도 중요하지만 SQLP 모델링에서는 업무 트랜잭션과 데이터 생명주기 관점도 봅니다."
      ],
      relatedConceptId: "modeling-transaction-model",
      hint: "프로세스 하나가 어떤 데이터를 생성, 수정, 삭제, 조회하는지 CRUD 관점으로 보세요.",
      explanation: "업무 트랜잭션의 데이터 영향과 일관성 경계는 모델 품질과 SQL 처리 단위에 직접 연결됩니다."
    }
  ],
  "sql-basic": [
    {
      topic: "NULL 조건과 3값 논리",
      difficulty: "중간",
      stem: "다음 SQL의 결과로 가장 적절한 것은?",
      table: {
        headers: ["T.C1", "T.C2"],
        rows: [
          ["A", "10"],
          ["B", "20"],
          ["NULL", "30"],
          ["C", "NULL"]
        ]
      },
      code: "SELECT COUNT(*) AS CNT\nFROM T\nWHERE C1 <> 'B'\n  AND C2 >= 10;",
      choices: ["1", "2", "3", "4"],
      choiceExplanations: [
        "정답입니다. A,10만 TRUE입니다. NULL <> 'B'는 UNKNOWN이고, C,NULL은 C1 조건은 TRUE지만 C2 >= 10이 UNKNOWN이라 제외됩니다.",
        "오답입니다. NULL 행 또는 C2가 NULL인 행을 TRUE로 계산하면 2가 나오지만 WHERE는 TRUE만 통과시킵니다.",
        "오답입니다. 비교 대상이 NULL인 조건은 UNKNOWN이 될 수 있어 조건을 만족한 것으로 보지 않습니다.",
        "오답입니다. WHERE 조건을 적용하지 않은 전체 행 수입니다."
      ],
      relatedConceptId: "sql-where",
      hint: "WHERE는 TRUE인 행만 남기고, FALSE와 UNKNOWN은 모두 제외합니다.",
      explanation: "NULL 비교가 포함된 조건은 UNKNOWN을 만들 수 있으므로 각 행을 TRUE/FALSE/UNKNOWN으로 따로 판정해야 합니다."
    },
    {
      topic: "NOT IN과 NULL",
      difficulty: "실전",
      stem: "다음 SQL에 대한 설명으로 가장 적절한 것은?",
      table: {
        headers: ["T1.ID", "T2.ID"],
        rows: [
          ["1", "2"],
          ["2", "NULL"],
          ["3", ""]
        ]
      },
      code: "SELECT ID\nFROM T1\nWHERE ID NOT IN (SELECT ID FROM T2);",
      choices: [
        "서브쿼리 결과에 NULL이 포함되어 전체 비교가 UNKNOWN으로 흐를 수 있으므로 결과가 없을 수 있다.",
        "T1의 1과 3은 T2에 없으므로 항상 반환된다.",
        "NOT IN은 내부적으로 NULL을 자동 제거한 뒤 비교한다.",
        "NOT IN과 NOT EXISTS는 NULL 포함 여부와 무관하게 항상 같은 결과다."
      ],
      choiceExplanations: [
        "정답입니다. NOT IN은 비교 목록에 NULL이 있으면 각 후보가 NULL과의 비교에서 UNKNOWN을 포함해 기대와 다른 결과가 될 수 있습니다.",
        "오답입니다. 단순 집합 차집합처럼 보이지만 SQL의 NULL 비교 때문에 1과 3도 반환되지 않을 수 있습니다.",
        "오답입니다. NULL이 자동 제거된다고 가정하면 SQL 3값 논리 함정을 놓치게 됩니다.",
        "오답입니다. NOT EXISTS는 상관 조건으로 존재 여부를 판단하므로 NULL에 대한 동작이 NOT IN과 달라질 수 있습니다."
      ],
      relatedConceptId: "sql-subquery",
      hint: "서브쿼리 결과 목록 안의 NULL 하나가 NOT IN 판단 전체에 어떤 영향을 주는지 보세요.",
      explanation: "SQLD/SQLP 기출형 NULL 함정 중 가장 대표적인 유형이며, 안전한 부정 존재 조건은 NOT EXISTS로 바꾸는 사고가 필요합니다."
    },
    {
      topic: "OUTER JOIN 조건 위치",
      difficulty: "실전",
      stem: "고객 전체를 보존하면서 2026년 7월 주문이 있으면 주문금액을 보여주려 한다. 가장 적절한 SQL 형태는?",
      code: "CUSTOMER(CUST_ID, CUST_NM)\nORDERS(ORDER_ID, CUST_ID, ORDER_DT, AMT)",
      choices: [
        "CUSTOMER C LEFT JOIN ORDERS O ON O.CUST_ID = C.CUST_ID AND O.ORDER_DT >= DATE '2026-07-01' AND O.ORDER_DT < DATE '2026-08-01'",
        "CUSTOMER C LEFT JOIN ORDERS O ON O.CUST_ID = C.CUST_ID WHERE O.ORDER_DT >= DATE '2026-07-01'",
        "CUSTOMER C INNER JOIN ORDERS O ON O.CUST_ID = C.CUST_ID AND O.ORDER_DT >= DATE '2026-07-01'",
        "CUSTOMER C LEFT JOIN ORDERS O ON O.CUST_ID = C.CUST_ID WHERE O.ORDER_ID IS NOT NULL"
      ],
      choiceExplanations: [
        "정답입니다. 후행 테이블 주문 조건을 ON 절에 두어 주문이 없는 고객의 NULL 확장 행을 보존합니다.",
        "오답입니다. WHERE에서 O.ORDER_DT 조건을 걸면 NULL 확장 행이 제거되어 사실상 INNER JOIN처럼 변합니다.",
        "오답입니다. INNER JOIN은 주문이 없는 고객을 제거하므로 고객 전체 보존 요구와 다릅니다.",
        "오답입니다. WHERE O.ORDER_ID IS NOT NULL은 주문이 있는 고객만 남기므로 보존 목적을 깨뜨립니다."
      ],
      relatedConceptId: "sql-standard-join",
      hint: "OUTER JOIN에서 보존해야 할 테이블과 후행 테이블 조건 위치를 분리해서 보세요.",
      explanation: "OUTER JOIN 문제는 조건 위치 한 줄로 결과 건수가 달라지는 대표 함정입니다."
    },
    {
      topic: "GROUP BY와 HAVING",
      difficulty: "중간",
      stem: "다음 요구사항을 만족하는 설명으로 가장 적절한 것은?",
      passage: "부서별로 2026년 입사자의 평균 급여를 구하되, 평균 급여가 5000 이상인 부서만 출력한다.",
      choices: [
        "입사일 조건은 WHERE에서 행을 먼저 줄이고, 평균 급여 조건은 GROUP BY 후 HAVING에서 판단한다.",
        "평균 급여 조건은 WHERE AVG(SAL) >= 5000으로 작성한다.",
        "HAVING은 GROUP BY 없이 사용할 수 없으므로 어떤 집계 조건도 표현할 수 없다.",
        "ORDER BY AVG(SAL) DESC를 쓰면 평균 5000 미만 부서는 자동으로 제거된다."
      ],
      choiceExplanations: [
        "정답입니다. 행 단위 조건과 그룹 단위 조건을 나누는 것이 핵심입니다.",
        "오답입니다. WHERE는 그룹이 만들어지기 전 단계라 집계 함수 조건을 직접 둘 수 없습니다.",
        "오답입니다. DBMS에 따라 전체를 하나의 그룹으로 보는 집계 HAVING도 가능하지만, 여기서는 부서별 GROUP BY가 필요합니다.",
        "오답입니다. ORDER BY는 정렬 단계이지 행이나 그룹을 제거하는 조건이 아닙니다."
      ],
      relatedConceptId: "sql-group-having",
      hint: "WHERE는 행을 줄이고 HAVING은 그룹을 줄입니다.",
      explanation: "집계 문제는 SQL 작성 순서보다 논리 처리 순서로 해석해야 정답이 명확합니다."
    },
    {
      topic: "윈도우 함수",
      difficulty: "중간",
      stem: "다음 요구에 맞는 함수 선택으로 가장 적절한 것은?",
      passage:
        "팀별 득점 순위를 구한다. 같은 득점자는 같은 순위를 부여하고, 다음 순위는 건너뛰지 않고 연속 번호로 표시한다.",
      choices: ["DENSE_RANK() OVER(PARTITION BY 팀 ORDER BY 득점 DESC)", "RANK() OVER(PARTITION BY 팀 ORDER BY 득점 DESC)", "ROW_NUMBER() OVER(PARTITION BY 팀 ORDER BY 득점 DESC)", "NTILE(4) OVER(ORDER BY 득점 DESC)"],
      choiceExplanations: [
        "정답입니다. DENSE_RANK는 동순위 후 다음 순위를 건너뛰지 않습니다.",
        "오답입니다. RANK는 동순위 후 다음 순위를 건너뜁니다.",
        "오답입니다. ROW_NUMBER는 동점자에게도 서로 다른 번호를 부여합니다.",
        "오답입니다. NTILE은 순위를 구하는 함수가 아니라 행을 지정한 개수의 그룹으로 나눕니다."
      ],
      relatedConceptId: "sql-window-functions",
      hint: "동순위 처리와 다음 번호가 건너뛰는지 여부를 구분하세요.",
      explanation: "RANK, DENSE_RANK, ROW_NUMBER 차이는 선택지 표현만 바꿔 자주 출제됩니다."
    },
    {
      topic: "집합 연산자",
      difficulty: "중간",
      stem: "다음 설명으로 가장 적절한 것은?",
      passage:
        "A 결과는 10행, B 결과는 8행이다. 두 결과에는 완전히 같은 행이 3행 있다. 중복을 제거하지 않고 두 결과를 이어 붙이고 싶다.",
      choices: ["UNION ALL을 사용한다.", "UNION을 사용한다.", "INTERSECT를 사용한다.", "MINUS를 사용한다."],
      choiceExplanations: [
        "정답입니다. UNION ALL은 중복 제거 정렬 없이 두 결과를 그대로 연결합니다.",
        "오답입니다. UNION은 중복 제거가 발생하므로 같은 행 3개가 하나로 합쳐질 수 있습니다.",
        "오답입니다. INTERSECT는 양쪽에 공통으로 존재하는 행만 반환합니다.",
        "오답입니다. MINUS는 앞 결과에서 뒤 결과와 겹치는 행을 제거합니다."
      ],
      relatedConceptId: "sql-set-operators",
      hint: "중복 제거 여부와 정렬/비교 비용을 함께 떠올리세요.",
      explanation: "SQLP 튜닝 관점에서는 UNION과 UNION ALL의 결과 차이뿐 아니라 SORT UNIQUE 비용도 함께 봅니다."
    },
    {
      topic: "Top-N",
      difficulty: "실전",
      stem: "Oracle에서 '최근 주문 10건'을 정확하고 효율적으로 조회하는 방향으로 가장 적절한 것은?",
      code: "ORDERS(ORDER_ID, CUST_ID, ORDER_DT, AMT)\nIDX_ORDERS_01(CUST_ID, ORDER_DT DESC, ORDER_ID DESC)",
      choices: [
        "고객 조건과 ORDER_DT DESC, ORDER_ID DESC 정렬을 인라인 뷰 안에서 맞춘 뒤 바깥에서 ROWNUM <= 10을 적용한다.",
        "WHERE ROWNUM <= 10을 먼저 적용한 뒤 ORDER BY ORDER_DT DESC를 수행한다.",
        "ORDER BY 없이 ROWNUM <= 10만 사용해도 항상 최근 10건이다.",
        "ORDER_DT만 정렬하면 같은 시각 주문의 페이지 순서도 항상 안정적이다."
      ],
      choiceExplanations: [
        "정답입니다. 정렬 기준을 먼저 확정하고 STOPKEY가 적용되도록 해야 최근 10건이 의미 있게 잘립니다.",
        "오답입니다. ROWNUM을 먼저 자르면 임의 10건을 고른 뒤 정렬하는 꼴이 될 수 있습니다.",
        "오답입니다. ORDER BY가 없으면 최근이라는 의미가 보장되지 않습니다.",
        "오답입니다. ORDER_DT가 같은 주문이 있으면 ORDER_ID 같은 결정적 보조 정렬이 필요합니다."
      ],
      relatedConceptId: "sql-top-n",
      hint: "Oracle ROWNUM은 부여 시점과 ORDER BY 위치가 핵심입니다.",
      explanation: "Top-N 문항은 결과 정확성과 인덱스 정렬 활용 가능성을 동시에 묻는 경우가 많습니다."
    },
    {
      topic: "ROLLUP과 GROUPING",
      difficulty: "실전",
      stem: "ROLLUP 결과에서 실제 NULL과 소계 행의 NULL을 구분하는 방법으로 가장 적절한 것은?",
      choices: [
        "GROUPING(컬럼) 또는 GROUPING_ID를 사용해 집계로 생성된 NULL인지 판단한다.",
        "NVL(컬럼, '전체')만 사용하면 실제 NULL과 소계 NULL을 완벽히 구분할 수 있다.",
        "ROLLUP 결과에는 NULL이 절대 나타나지 않는다.",
        "ORDER BY를 사용하면 실제 NULL과 소계 NULL이 자동으로 다른 값이 된다."
      ],
      choiceExplanations: [
        "정답입니다. GROUPING 계열 함수는 해당 NULL이 집계 행 표현인지 여부를 알려줍니다.",
        "오답입니다. NVL만 쓰면 실제 NULL도 '전체'로 바뀌어 소계 NULL과 섞일 수 있습니다.",
        "오답입니다. ROLLUP은 소계/총계 행에서 집계 컬럼을 NULL로 표시할 수 있습니다.",
        "오답입니다. ORDER BY는 정렬만 수행하며 NULL의 의미를 구분해주지 않습니다."
      ],
      relatedConceptId: "sql-group-functions",
      hint: "소계 행에서 생긴 NULL과 원본 데이터의 NULL은 의미가 다릅니다.",
      explanation: "GROUPING 함수는 집계 함수 단원의 대표 함정으로, NVL 표시 문제와 함께 자주 연결됩니다."
    },
    {
      topic: "날짜 조건",
      difficulty: "실전",
      stem: "주문일자가 2026년 7월인 주문을 조회하면서 일반 B-tree 인덱스를 활용하기 가장 좋은 조건은?",
      code: "create index orders_x1 on orders(order_dt);",
      choices: [
        "order_dt >= date '2026-07-01' and order_dt < date '2026-08-01'",
        "to_char(order_dt, 'YYYYMM') = '202607'",
        "trunc(order_dt, 'MM') = date '2026-07-01'",
        "substr(order_dt, 1, 6) = '202607'"
      ],
      choiceExplanations: [
        "정답입니다. 컬럼을 변형하지 않는 반개구간 범위 조건은 인덱스 Range Scan에 유리하고 말일 시간값도 안전하게 포함합니다.",
        "오답입니다. 컬럼에 TO_CHAR를 적용하면 함수 기반 인덱스가 없는 한 일반 인덱스 access 조건으로 쓰기 어렵습니다.",
        "오답입니다. TRUNC도 컬럼 함수 적용이므로 일반 인덱스 스캔 효율을 떨어뜨릴 수 있습니다.",
        "오답입니다. 날짜 컬럼을 문자열처럼 잘라 비교하는 방식은 문법과 성능 모두 부적절합니다."
      ],
      relatedConceptId: "tuning-index-scan-efficiency",
      hint: "컬럼을 가공하지 않고 시작 이상, 다음 시작 미만 조건으로 표현하세요.",
      explanation: "SQL 기본 날짜 조건이지만 SQLP 튜닝에서는 SARGable 조건과 인덱스 access predicate 판단으로 연결됩니다."
    },
    {
      topic: "CASE 표현식",
      difficulty: "중간",
      stem: "다음 CASE 표현식 결과로 가장 적절한 것은?",
      table: {
        headers: ["AMT"],
        rows: [["1200"], ["800"], ["NULL"]]
      },
      code: "SELECT CASE\n         WHEN AMT >= 1000 THEN 'H'\n         WHEN AMT < 1000 THEN 'L'\n         ELSE 'U'\n       END AS GRADE\nFROM T\nORDER BY AMT DESC NULLS LAST;",
      choices: ["H, L, U", "H, U, L", "L, H, U", "H, L, L"],
      choiceExplanations: [
        "정답입니다. 1200은 H, 800은 L, NULL은 두 비교가 UNKNOWN이라 ELSE U가 됩니다.",
        "오답입니다. NULL은 정렬상 마지막이지만 CASE 결과는 ELSE U이며 800보다 먼저 나오지 않습니다.",
        "오답입니다. 1200은 첫 WHEN을 만족하므로 H가 먼저입니다.",
        "오답입니다. NULL < 1000은 TRUE가 아니라 UNKNOWN이므로 L이 아닙니다."
      ],
      relatedConceptId: "sql-functions",
      hint: "CASE의 각 WHEN 조건도 NULL 비교에서는 UNKNOWN이 될 수 있습니다.",
      explanation: "CASE는 위에서부터 TRUE인 조건을 선택하고, NULL 비교가 TRUE가 아니면 다음 WHEN 또는 ELSE로 넘어갑니다."
    }
  ],
  tuning: [
    {
      topic: "Access Predicate와 Filter Predicate",
      difficulty: "실전",
      stem: "다음 실행계획 해석으로 가장 적절한 것은?",
      code:
        "--------------------------------------------------------------------------------\n| Id | Operation                   | Name        | Rows | Starts | Buffers |\n--------------------------------------------------------------------------------\n|  0 | SELECT STATEMENT            |             |   25 |      1 |   18400 |\n|  1 |  TABLE ACCESS BY INDEX ROWID| ORDERS      |   25 |      1 |   18400 |\n|  2 |   INDEX RANGE SCAN          | ORDERS_X1   | 8200 |      1 |     120 |\n--------------------------------------------------------------------------------\nPredicate Information\n 2 - access(\"ORDERS\".\"CUST_ID\"=:B1)\n 1 - filter(\"ORDERS\".\"ORDER_DT\">=DATE '2026-07-01' AND \"ORDERS\".\"STATUS_CD\"='PAID')",
      choices: [
        "CUST_ID만 인덱스 access 조건이고 ORDER_DT, STATUS_CD는 테이블에서 걸러져 랜덤 액세스가 과다할 수 있다.",
        "INDEX RANGE SCAN이 보이므로 테이블 액세스 비용은 무시해도 된다.",
        "ORDER_DT와 STATUS_CD가 WHERE에 있으므로 모두 인덱스 access 조건이다.",
        "Buffers가 큰 원인은 항상 SELECT 절 컬럼 수 때문이며 인덱스 설계와 무관하다."
      ],
      choiceExplanations: [
        "정답입니다. 인덱스에서 8200개 ROWID를 만든 뒤 테이블에서 25건만 남는 구조라 테이블 랜덤 액세스와 필터 컬럼 보강을 봐야 합니다.",
        "오답입니다. 인덱스 스캔 이후 TABLE ACCESS BY INDEX ROWID가 18400 Buffers를 소비하고 있어 핵심 병목일 수 있습니다.",
        "오답입니다. Predicate Information상 ORDER_DT와 STATUS_CD는 TABLE ACCESS 단계 filter입니다.",
        "오답입니다. SELECT 절 컬럼도 영향은 가능하지만, 제시된 근거는 access/filter 분리와 랜덤 액세스 문제입니다."
      ],
      relatedConceptId: "tuning-index-scan-efficiency",
      hint: "Predicate Information에서 access가 인덱스 진입 조건인지, filter가 읽은 뒤 버리는 조건인지 먼저 구분하세요.",
      explanation: "SQLP 실행계획 문제는 인덱스를 탔는지보다 얼마나 많이 스캔하고 어디서 버렸는지를 묻습니다."
    },
    {
      topic: "결합 인덱스 설계",
      difficulty: "실전",
      stem: "다음 SQL을 가장 안정적으로 지원하는 인덱스 후보로 가장 적절한 것은?",
      code:
        "SELECT order_id, order_dt, amt\nFROM orders\nWHERE cust_id = :cust_id\n  AND status_cd = 'PAID'\n  AND order_dt >= :from_dt\n  AND order_dt < :to_dt\nORDER BY order_dt DESC, order_id DESC\nFETCH FIRST 20 ROWS ONLY;",
      choices: [
        "orders_x1(cust_id, status_cd, order_dt desc, order_id desc)",
        "orders_x1(order_dt, cust_id, status_cd)",
        "orders_x1(amt, order_dt, cust_id)",
        "orders_x1(status_cd, amt, order_id)"
      ],
      choiceExplanations: [
        "정답입니다. 등치 조건 cust_id/status_cd를 앞에 두고 범위·정렬 컬럼 order_dt/order_id를 이어 두면 범위 축소와 정렬 생략 가능성이 높습니다.",
        "오답입니다. order_dt 범위가 선두가 되면 고객/상태 조건으로 범위를 충분히 좁히기 전에 넓은 날짜 범위를 볼 수 있습니다.",
        "오답입니다. amt는 조건이나 정렬 핵심 컬럼이 아니므로 선두 배치 근거가 약합니다.",
        "오답입니다. order_dt 조건이 빠져 최근 20건 부분범위와 정렬 요구를 안정적으로 지원하기 어렵습니다."
      ],
      relatedConceptId: "tuning-index-design",
      hint: "등치 조건, 범위 조건, ORDER BY/STOPKEY 순서로 인덱스 컬럼을 검토하세요.",
      explanation: "선택도만으로 컬럼 순서를 정하지 말고, 실제 SQL의 등치·범위·정렬·부분범위 처리 요구를 같이 봐야 합니다."
    },
    {
      topic: "테이블 랜덤 액세스",
      difficulty: "실전",
      stem: "다음 실제 실행 통계에서 우선 검토할 개선 방향으로 가장 적절한 것은?",
      code:
        "Id Operation                         Name          A-Rows Starts Buffers\n 0 SELECT STATEMENT                                      30      1   42150\n 1  TABLE ACCESS BY INDEX ROWID BATCHED EMP              30      1   42150\n 2   INDEX RANGE SCAN                 EMP_X01         18000      1     210\n\nPredicate Information\n 2 - access(\"EMP\".\"DEPTNO\"=:B1)\n 1 - filter(\"EMP\".\"JOB_CD\"='DBA' AND \"EMP\".\"HIRE_DT\">=:B2)",
      choices: [
        "DEPTNO 이후 JOB_CD, HIRE_DT 조건을 인덱스에 포함하는 결합 인덱스를 검토해 테이블 방문 전 필터링을 줄인다.",
        "INDEX RANGE SCAN의 Buffers가 210으로 작으므로 전체 SQL은 이미 충분히 최적이다.",
        "EMP_X01 인덱스를 삭제하고 어떤 조건에서도 Full Scan만 사용하게 한다.",
        "SELECT 절 컬럼을 모두 제거하면 WHERE 조건 필터 비용도 사라진다."
      ],
      choiceExplanations: [
        "정답입니다. 인덱스에서 18000건을 찾고 테이블에서 30건만 남으므로 필터 컬럼을 인덱스 access 또는 최소한 인덱스 filter 단계로 끌어올릴 필요가 있습니다.",
        "오답입니다. 인덱스 자체 Buffers가 작아도 테이블 랜덤 액세스 Buffers가 매우 큽니다.",
        "오답입니다. Full Scan이 나을 수도 있는 상황은 있지만, 제시 조건에서는 조건 조합에 맞춘 인덱스 개선이 우선 검토 대상입니다.",
        "오답입니다. SELECT 절 컬럼 수는 테이블 액세스 여부에 영향이 있을 수 있으나 WHERE 필터 조건 자체가 사라지는 것은 아닙니다."
      ],
      relatedConceptId: "tuning-table-access",
      hint: "인덱스 단계 A-Rows와 테이블 단계 A-Rows의 차이를 보세요.",
      explanation: "인덱스를 탄다는 사실보다 인덱스 후 테이블 방문이 얼마나 낭비되는지가 SQLP 튜닝의 핵심입니다."
    },
    {
      topic: "NL Join과 Hash Join",
      difficulty: "실전",
      stem: "다음 상황에서 가장 적절한 조인 방식 판단은?",
      passage:
        "ORDERS는 최근 3개월 조건으로 350만 건이 남고, ORDER_ITEMS는 주문당 평균 3건이다. 두 테이블을 대부분 읽어 상품군별 매출을 집계한다. 후행 테이블 인덱스는 있으나 랜덤 액세스가 매우 많다.",
      choices: [
        "대량 동등 조인과 집계이므로 Hash Join과 Hash Group By 후보를 우선 검토하고, PGA/TEMP 사용량을 함께 본다.",
        "후행 인덱스가 있으므로 무조건 Nested Loops가 가장 빠르다.",
        "대량 조인이므로 조인 조건을 제거한 Cartesian Join을 검토한다.",
        "집계 SQL에서는 조인 방식이 성능에 영향을 주지 않는다."
      ],
      choiceExplanations: [
        "정답입니다. 대부분의 행을 읽는 대량 동등 조인은 랜덤 반복 접근보다 해시 조인이 유리할 수 있고, 메모리 부족 시 TEMP spill도 확인해야 합니다.",
        "오답입니다. 후행 인덱스가 있어도 선행 집합이 350만 건이면 NL 반복 비용이 폭증할 수 있습니다.",
        "오답입니다. Cartesian Join은 조인 조건 없이 행 수를 폭증시키므로 의도된 튜닝 방식이 아닙니다.",
        "오답입니다. 집계 전 조인 입력 크기와 방식은 전체 I/O, CPU, TEMP에 큰 영향을 줍니다."
      ],
      relatedConceptId: "tuning-hash-join",
      hint: "선행 집합 크기와 후행 접근 반복 횟수를 먼저 계산하세요.",
      explanation: "NL은 소량·부분범위에 강하고, Hash Join은 대량 동등 조인에 강한 경우가 많다는 조건 판단 문제입니다."
    },
    {
      topic: "SQL Trace 분석",
      difficulty: "실전",
      stem: "다음 TKPROF 요약에서 가장 타당한 해석은?",
      code:
        "call     count   cpu    elapsed   disk   query  current rows\nParse        1  0.01       0.02      0      12        0    0\nExecute      1  0.02       0.03      0       5        0    0\nFetch     5001  1.20       8.90   4200  980000        0 5000",
      choices: [
        "Fetch 단계의 query, disk, elapsed가 크므로 결과 반환 과정의 반복 I/O와 fetch call을 우선 분석한다.",
        "Parse count가 1이므로 전체 SQL은 병목이 없다.",
        "current가 0이므로 읽기 I/O도 전혀 없었다.",
        "rows가 5000이면 query 980000은 무시해도 된다."
      ],
      choiceExplanations: [
        "정답입니다. Fetch 단계에서 대부분의 logical/physical read와 시간이 발생하고 fetch count도 커서 로우 소스와 애플리케이션 fetch 패턴을 봐야 합니다.",
        "오답입니다. Parse가 작아도 Execute 또는 Fetch 단계에서 병목이 발생할 수 있습니다.",
        "오답입니다. current는 주로 변경 관련 current get이며, query와 disk가 읽기 비용을 보여줍니다.",
        "오답입니다. 5000행을 얻기 위해 query 980000이면 과도한 논리 읽기일 수 있어 핵심 분석 대상입니다."
      ],
      relatedConceptId: "tuning-sql-trace",
      hint: "Parse/Execute/Fetch 중 어느 단계에 시간이 몰려 있는지 보세요.",
      explanation: "Trace 문항은 실행계획 이름보다 실제 call별 시간, logical read, physical read, fetch 횟수를 읽는 능력을 묻습니다."
    },
    {
      topic: "쿼리 변환",
      difficulty: "실전",
      stem: "다음 인라인 뷰 튜닝 판단으로 가장 적절한 것은?",
      code:
        "SELECT /*+ ? */ p.category_cd, v.sum_amt\nFROM products p\nJOIN (\n  SELECT product_id, SUM(sale_amt) sum_amt\n  FROM order_items\n  WHERE order_dt >= DATE '2026-07-01'\n  GROUP BY product_id\n) v ON v.product_id = p.product_id\nWHERE p.category_cd = 'BOOK';",
      choices: [
        "상품별 집계를 먼저 끝낸 뒤 소량 상품과 조인해야 한다면 NO_MERGE(v)로 뷰 병합을 막는 방향을 검토한다.",
        "인라인 뷰는 항상 병합되는 것이 정답이므로 NO_MERGE는 절대 사용하지 않는다.",
        "GROUP BY가 있는 인라인 뷰는 결과 보존과 무관하게 WHERE 조건을 모두 안쪽으로 밀어 넣어야 한다.",
        "쿼리 변환은 실행계획에 영향을 주지 않으므로 힌트 검토 대상이 아니다."
      ],
      choiceExplanations: [
        "정답입니다. 집계 후 조인이 의도라면 뷰 병합이 목표 계획을 깨뜨릴 수 있어 NO_MERGE 같은 변환 제어를 검토합니다.",
        "오답입니다. 병합이 유리한 경우도 있지만 집계, Top-N, 부분범위 처리 의도를 보존해야 할 때 막아야 할 수 있습니다.",
        "오답입니다. Predicate pushing은 결과가 보존될 때만 안전하며, 집계 전후 의미가 달라질 수 있습니다.",
        "오답입니다. 쿼리 변환은 조인 순서, 집계 위치, Predicate 위치에 직접 영향을 줍니다."
      ],
      relatedConceptId: "tuning-query-transformation",
      hint: "뷰 병합이 되면 집계 위치와 조인 입력 크기가 어떻게 바뀌는지 생각하세요.",
      explanation: "SQLP 실습은 NO_MERGE, PUSH_PRED, UNNEST 같은 변환 제어의 의도와 결과 보존 조건을 자주 묻습니다."
    },
    {
      topic: "Top-N과 STOPKEY",
      difficulty: "실전",
      stem: "다음 목표 실행계획을 얻기 위한 SQL 작성 방향으로 가장 적절한 것은?",
      code:
        "목표: INDEX RANGE SCAN DESCENDING ORDERS_X1 -> COUNT STOPKEY -> 주문상세 NL 조인\n인덱스: ORDERS_X1(CUST_ID, ORDER_DT DESC, ORDER_ID DESC)",
      choices: [
        "고객의 최근 주문을 인라인 뷰에서 ORDER BY 인덱스 순서로 정렬하고 ROWNUM/FETCH FIRST로 먼저 20건만 남긴 뒤 상세를 조인한다.",
        "주문상세를 모두 조인한 뒤 최종 SELECT에서 ROWNUM <= 20을 적용한다.",
        "ORDER BY를 생략하고 INDEX 힌트만 쓰면 항상 최근 20건이 보장된다.",
        "COUNT STOPKEY는 Full Scan에서만 나타나므로 인덱스와 함께 사용할 수 없다."
      ],
      choiceExplanations: [
        "정답입니다. 선행 주문 집합을 인덱스 정렬 순서로 먼저 줄이면 뒤쪽 NL 반복을 줄이고 STOPKEY 의도가 드러납니다.",
        "오답입니다. 조인을 모두 수행한 뒤 자르면 상세 조인 반복 비용을 먼저 치르게 됩니다.",
        "오답입니다. 인덱스 힌트는 접근 경로를 유도할 뿐 결과 순서 요구사항을 명시하지 않습니다.",
        "오답입니다. COUNT STOPKEY는 정렬/인덱스 접근과 결합해 부분범위 중단을 표현할 수 있습니다."
      ],
      relatedConceptId: "tuning-sort",
      hint: "Top-N은 '먼저 줄이는 위치'가 실행계획을 좌우합니다.",
      explanation: "최근 N건 실습은 SQL 결과 정확성, 인덱스 정렬, STOPKEY, 조인 반복 횟수를 함께 판단해야 합니다."
    },
    {
      topic: "파티션 프루닝",
      difficulty: "실전",
      stem: "다음 실행계획의 문제점과 개선 방향으로 가장 적절한 것은?",
      code:
        "--------------------------------------------------------------------------------\n| Id | Operation               | Name      | Pstart| Pstop | Rows | Buffers |\n--------------------------------------------------------------------------------\n|  0 | SELECT STATEMENT        |           |       |       | 1200 |   62000 |\n|  1 |  PARTITION RANGE ALL    |           |     1 |   36  | 1200 |   62000 |\n|  2 |   TABLE ACCESS FULL     | SALES_PT  |     1 |   36  | 1200 |   62000 |\n--------------------------------------------------------------------------------\nPredicate Information\n 2 - filter(TO_CHAR(\"SALE_DT\",'YYYYMM')='202607' AND \"REGION_CD\"='S')",
      choices: [
        "파티션 키 SALE_DT가 함수로 감싸져 전체 파티션을 읽고 있으므로 반개구간 날짜 조건으로 바꿔 PSTART/PSTOP 축소를 유도한다.",
        "PARTITION RANGE ALL은 항상 최적이므로 개선할 필요가 없다.",
        "REGION_CD 조건이 있으므로 SALE_DT 조건은 파티션 프루닝과 무관하다.",
        "TO_CHAR 조건은 Oracle이 항상 자동으로 파티션 범위 조건으로 바꾼다."
      ],
      choiceExplanations: [
        "정답입니다. 파티션 키를 변형하지 않는 범위 조건으로 작성해야 필요한 월 파티션만 읽을 가능성이 높아집니다.",
        "오답입니다. 특정 월 조회인데 Pstart/Pstop이 1~36이면 불필요한 파티션 접근을 의심해야 합니다.",
        "오답입니다. 파티션 키가 SALE_DT라면 REGION_CD만으로는 월 파티션 pruning을 보장할 수 없습니다.",
        "오답입니다. 함수 조건을 항상 자동 변환한다고 단정할 수 없으며, 명시적 범위 조건이 안전합니다."
      ],
      relatedConceptId: "tuning-partitioning",
      hint: "PSTART/PSTOP과 파티션 키 조건의 형태를 같이 확인하세요.",
      explanation: "파티션 문제는 조건이 있는지보다 파티션 키를 옵티마이저가 pruning 가능한 형태로 볼 수 있는지가 중요합니다."
    },
    {
      topic: "힌트 조합",
      difficulty: "실전",
      stem: "다음 힌트 조합 해석으로 가장 적절한 것은?",
      code:
        "SELECT /*+ leading(c o i) use_hash(o) use_nl(i) index(o orders_x1) */ ...\nFROM customers c\nJOIN orders o ON o.cust_id = c.cust_id\nJOIN order_items i ON i.order_id = o.order_id\nWHERE c.grade_cd = 'VIP';",
      choices: [
        "c -> o는 Hash Join, 그 결과 -> i는 NL Join을 유도하며, o 접근에는 orders_x1 사용 의도를 함께 준다.",
        "USE_HASH(o)는 o를 무조건 선행 테이블로 만들라는 뜻이다.",
        "LEADING(c o i)는 FROM 절 작성 순서를 바꾸는 문법이다.",
        "INDEX(o orders_x1)을 쓰면 조인 방식 힌트는 모두 무시된다."
      ],
      choiceExplanations: [
        "정답입니다. LEADING은 조인 순서, USE_HASH/USE_NL은 각 대상 테이블이 조인될 때의 방식, INDEX는 접근 경로 의도입니다.",
        "오답입니다. USE_HASH(o)는 o를 해시 조인 방식으로 조인하라는 힌트이지 선행 테이블 지정 자체는 LEADING이 담당합니다.",
        "오답입니다. LEADING은 옵티마이저 조인 순서 유도 힌트이지 SQL 텍스트의 FROM 절을 물리적으로 바꾸는 문법이 아닙니다.",
        "오답입니다. 접근 경로 힌트와 조인 방식 힌트는 서로 보완적으로 사용할 수 있으며, 별칭과 계획 가능성이 중요합니다."
      ],
      relatedConceptId: "tuning-nl-join",
      hint: "LEADING, USE_NL/USE_HASH, INDEX가 각각 무엇을 제어하는지 분리하세요.",
      explanation: "힌트 문제는 힌트 이름 암기보다 별칭, 조인 순서, 조인 방식, 접근 경로가 서로 일관되는지 보는 유형입니다."
    },
    {
      topic: "Lock과 동시성",
      difficulty: "실전",
      stem: "다음 동시성 상황에 대한 설명으로 가장 적절한 것은?",
      passage:
        "세션 A가 주문 100번 행을 UPDATE한 뒤 아직 COMMIT하지 않았다. 세션 B가 같은 주문 100번 행을 UPDATE하려고 대기한다. 세션 C는 일반 SELECT로 주문 100번을 조회한다.",
      choices: [
        "B는 A의 행 lock 때문에 대기할 수 있고, C의 일반 SELECT는 일관된 읽기로 이전 커밋 버전을 볼 수 있다.",
        "A가 UPDATE하면 C의 SELECT도 반드시 A가 COMMIT할 때까지 대기한다.",
        "B가 대기하는 이유는 항상 library cache latch 때문이며 행 lock과 무관하다.",
        "Oracle은 MVCC가 없으므로 읽기와 쓰기가 항상 서로 차단된다."
      ],
      choiceExplanations: [
        "정답입니다. 같은 행을 변경하려는 DML은 row lock 대기가 발생할 수 있지만, 일반 SELECT는 undo를 이용한 read consistency로 커밋된 버전을 읽을 수 있습니다.",
        "오답입니다. 일반적인 일관 읽기 SELECT는 변경 중인 행 때문에 곧바로 대기하지 않고 이전 커밋 이미지를 볼 수 있습니다.",
        "오답입니다. 같은 행 UPDATE 대기는 대표적인 row lock contention 상황입니다.",
        "오답입니다. Oracle은 읽기 일관성을 제공하며 읽기와 쓰기가 항상 차단되는 구조가 아닙니다."
      ],
      relatedConceptId: "tuning-lock",
      hint: "DML 간 충돌과 일반 SELECT의 read consistency를 구분하세요.",
      explanation: "SQLP 동시성 문제는 Lock, 트랜잭션, MVCC/Undo 기반 읽기 일관성을 함께 묻습니다."
    }
  ]
};

function buildDraftSequence<T>(config: SubjectConfig<T>): DraftQuestion[] {
  const groups = [
    ...examReconstructionDrafts[config.id].map((draft) => [draft]),
    ...config.specs.map((spec, index) => config.drafts(spec, index))
  ];
  const maxGroupLength = Math.max(...groups.map((group) => group.length));

  const interleaved = Array.from({ length: maxGroupLength }, (_, draftIndex) => groups.map((group) => group[draftIndex]).filter(Boolean)).flat();
  const qualitySeeds = qualitySeedDrafts[config.id] ?? [];
  const qualitySeedStems = new Set(qualitySeeds.map((draft) => draft.stem));
  const generatedDrafts = mixDrafts(interleaved, config.id).filter((draft) => !qualitySeedStems.has(draft.stem));

  return [...qualitySeeds, ...generatedDrafts];
}

function buildSubject<T>(config: SubjectConfig<T>, count: number, startIndex = 0, idPrefix: string = config.id): ObjectiveQuestion[] {
  const drafts = buildDraftSequence(config);

  return Array.from({ length: count }, (_, offset) => {
    const globalIndex = startIndex + offset;
    const draft = withExtraContext(drafts[globalIndex % drafts.length], globalIndex, drafts.length);
    const answerIndex = draft.answerIndex ?? 0;
    const rotated = rotateChoices(draft.choices, answerIndex, globalIndex);
    const majorTopic = draft.majorTopic ?? inferMajorTopic(config.id, draft.topic);
    const middleTopic = draft.middleTopic ?? inferMiddleTopic(config.id, draft.topic);
    const relatedConceptId = draft.relatedConceptId ?? inferRelatedConceptId(config.id, draft.topic);

    return {
      id: `${idPrefix}-${String(globalIndex + 1).padStart(3, "0")}`,
      number: globalIndex + 1,
      subjectId: config.id,
      subjectName: config.name,
      majorTopic,
      middleTopic,
      topic: draft.topic,
      difficulty: draft.difficulty,
      questionType: inferQuestionType(draft, config.id),
      stem: draft.stem,
      passage: draft.passage,
      code: draft.code,
      table: draft.table,
      choices: makeChoices(rotated.choices),
      answer: choiceIds[rotated.answerIndex],
      relatedConceptId,
      hint: makeStudyHint(draft),
      explanation: makeDetailedExplanation(draft, rotated.choices[rotated.answerIndex]),
      whyWrong: makeWhyWrong(draft, rotated.choices, rotated.answerIndex, draft.choiceExplanations ? rotateTuple(draft.choiceExplanations, globalIndex) : undefined),
      reviewStatus: draft.reviewStatus ?? (globalIndex < 100 ? "approved" : "review_required"),
      duplicationCheck: duplicationCheckNote(globalIndex)
    };
  });
}

function modelDrafts(spec: ModelSpec, index: number): DraftQuestion[] {
  return [
    {
      topic: spec.topic,
      difficulty: spec.difficulty,
      stem: `다음 중 ${spec.topic}에 대한 설명으로 가장 부적절한 것은?`,
      passage: spec.scenario,
      choices: [
        spec.trap,
        spec.correctRule,
        "업무 규칙을 데이터 구조로 표현할 때 식별 가능성과 관계 선택성을 함께 검토한다.",
        "정규화 이후 성능 요구가 명확하면 반정규화 여부를 별도로 검토할 수 있다."
      ],
      hint: "업무 규칙을 데이터 구조로 바꾸는 기준을 보세요.",
      explanation: `${spec.trap}은(는) 모델링 원칙에 맞지 않는 부적절한 설명입니다. ${spec.correctRule}`
    },
    {
      topic: spec.topic,
      difficulty: spec.difficulty,
      stem: `다음 설명에 해당하는 ${spec.topic} 후보로 가장 적절한 것은?`,
      table: {
        headers: ["후보", "업무 설명"],
        rows: spec.candidates.map((candidate, candidateIndex) => [candidate, spec.candidateNotes[candidateIndex]])
      },
      choices: spec.candidates,
      hint: "독립적으로 관리되는 집합인지, 값인지, 관계인지 구분하세요.",
      explanation: `${spec.candidates[0]}이(가) 지문 조건에서 가장 적절합니다.`
    },
    {
      topic: spec.topic,
      difficulty: spec.difficulty,
      stem: `다음 보기 중 ${spec.topic} 관점에서 옳은 것만 모두 고른 것은?`,
      passage: `[보기]\nㄱ. ${spec.correctRule}\nㄴ. ${spec.trap}\nㄷ. ${spec.sqlAngle}`,
      choices: [
        "ㄱ, ㄷ",
        "ㄱ, ㄴ",
        "ㄴ, ㄷ",
        "ㄱ, ㄴ, ㄷ"
      ],
      hint: "ㄴ처럼 단정적이거나 원칙을 뒤집는 문장을 먼저 제거하세요.",
      explanation: `ㄱ과 ㄷ이 옳습니다. ㄴ은 ${spec.trap}`
    },
    {
      topic: spec.topic,
      difficulty: "실전",
      stem: `다음 업무 설명을 바탕으로 ${spec.topic}이 SQL 작성에 미치는 영향으로 가장 적절한 것은?`,
      passage: spec.scenario,
      choices: [
        spec.sqlAngle,
        "모델링 결과는 SQL 결과 건수와 무관하고 화면 디자인에만 영향을 준다.",
        "조인 경로는 옵티마이저가 항상 자동으로 보정하므로 모델은 중요하지 않다.",
        "식별자와 관계 선택성은 인덱스 설계와 실행계획에 영향을 주지 않는다."
      ],
      hint: "모델링 판단이 조인, NULL, 인덱스에 어떻게 이어지는지 보세요.",
      explanation: spec.sqlAngle
    }
  ];
}

function sqlDrafts(spec: SqlSpec, index: number): DraftQuestion[] {
  return [
    {
      topic: spec.topic,
      difficulty: spec.difficulty,
      stem: `다음 ${spec.topic} SQL의 실행 결과 또는 해석으로 가장 적절한 것은?`,
      code: spec.code,
      choices: [spec.resultAngle, spec.trap, "SQL 문장은 항상 작성 순서대로만 실행된다.", "NULL은 모든 DBMS에서 숫자 0과 동일하게 처리된다."],
      hint: "SQL의 논리 처리 순서와 NULL 처리를 함께 보세요.",
      explanation: `${spec.resultAngle} ${spec.correctRule}`
    },
    {
      topic: spec.topic,
      difficulty: spec.difficulty,
      stem: `다음 보기 중 ${spec.topic}에 대한 설명으로 옳은 것만 모두 고른 것은?`,
      passage: `[보기]\nㄱ. ${spec.correctRule}\nㄴ. ${spec.trap}\nㄷ. ${spec.resultAngle}`,
      code: spec.code,
      choices: ["ㄱ, ㄷ", "ㄱ, ㄴ", "ㄴ, ㄷ", "ㄱ, ㄴ, ㄷ"],
      hint: "결과 건수나 NULL, 집계, 조인 보존 여부를 확인하세요.",
      explanation: `ㄱ과 ㄷ이 옳습니다. ㄴ은 ${spec.trap}`
    },
    {
      topic: spec.topic,
      difficulty: "실전",
      stem: `다음 ${spec.topic} 상황에서 가장 적절한 SQL 작성 방향은?`,
      passage: spec.scenario,
      code: spec.code,
      choices: [spec.fix, spec.trap, "조건을 모두 SELECT 절 별칭으로 옮긴다.", "결과가 달라도 실행계획만 빠르면 정답으로 본다."],
      hint: "문법보다 결과 보존과 논리 순서가 우선입니다.",
      explanation: spec.fix
    },
    {
      topic: spec.topic,
      difficulty: "중간",
      stem: `${spec.topic} 관련 선택지 중 가장 부적절한 것은?`,
      choices: [
        spec.trap,
        spec.correctRule,
        spec.fix,
        "실제 시험에서는 결과 건수, NULL, 조인 조건 위치를 함께 묻는 경우가 많다."
      ],
      hint: "단정적인 표현을 조심하세요.",
      explanation: spec.trap
    }
  ];
}

function tuningDrafts(spec: TuningSpec, index: number): DraftQuestion[] {
  return [
    {
      topic: spec.topic,
      difficulty: spec.difficulty,
      stem: `다음 ${spec.topic} 실행계획 해석으로 가장 적절한 것은?`,
      passage: spec.scenario,
      code: spec.code,
      choices: [spec.planAngle, spec.trap, "힌트를 많이 쓰면 통계정보는 확인하지 않아도 된다.", "인덱스 스캔이 보이면 항상 최적 실행계획이다."],
      hint: "성능 판단은 실행계획 이름보다 근거가 중요합니다.",
      explanation: `${spec.planAngle} ${spec.correctRule}`
    },
    {
      topic: spec.topic,
      difficulty: "실전",
      stem: `다음 ${spec.topic} SQL 또는 실행계획을 개선하는 방향으로 가장 적절한 것은?`,
      code: spec.code,
      choices: [spec.fix, spec.trap, "결과가 달라져도 빠른 조인 방식으로 바꾼다.", "테이블명을 짧게 바꾸면 I/O가 줄어든다."],
      hint: "결과 보존, access predicate, 조인 순서를 함께 보세요.",
      explanation: spec.fix
    },
    {
      topic: spec.topic,
      difficulty: spec.difficulty,
      stem: `다음 보기 중 ${spec.topic} 튜닝 판단으로 옳은 것만 모두 고른 것은?`,
      passage: spec.scenario,
      code: spec.code,
      choices: [
        "ㄱ, ㄷ",
        "ㄱ, ㄴ",
        "ㄴ, ㄷ",
        "ㄱ, ㄴ, ㄷ"
      ],
      hint: "Rows, Starts, Predicate, 인덱스 접근 조건을 보세요.",
      explanation: `ㄱ과 ㄷ이 옳습니다.\nㄱ. ${spec.correctRule}\nㄴ. ${spec.trap}\nㄷ. ${spec.planAngle}`
    },
    {
      topic: spec.topic,
      difficulty: "중간",
      stem: `${spec.topic}에서 가장 위험한 판단은?`,
      choices: [
        spec.trap,
        spec.correctRule,
        spec.fix,
        "튜닝 후에도 결과 정합성과 제약 조건 만족 여부를 검증한다."
      ],
      hint: "항상, 무조건 같은 표현을 의심하세요.",
      explanation: spec.trap
    }
  ];
}

const modelingSpecs: ModelSpec[] = [
  {
    topic: "데이터 모델링의 정의",
    difficulty: "기본",
    scenario: "신규 시스템 구축 전에 업무에서 관리해야 할 정보와 규칙을 일정한 표기법으로 표현하려 한다.",
    correctRule: "모델링은 현실 세계를 추상화, 단순화, 명확화하여 일정한 표기법으로 표현하는 과정이다.",
    trap: "모델링은 테이블 생성 SQL을 작성한 뒤 컬럼명을 예쁘게 바꾸는 작업이다.",
    sqlAngle: "모델링이 명확해야 SQL의 조인 경로, 조건 의미, 결과 건수를 안정적으로 판단할 수 있다.",
    candidates: ["업무 규칙", "버튼 색상", "서버 포트", "로그 파일명"],
    candidateNotes: ["데이터 모델에 반영해야 하는 사실 명제다.", "화면 디자인 요소다.", "인프라 설정이다.", "운영 파일 이름이다."]
  },
  {
    topic: "모델링의 특징",
    difficulty: "기본",
    scenario: "복잡한 영업 업무를 모든 세부 절차 그대로가 아니라 핵심 데이터 구조 중심으로 표현하려 한다.",
    correctRule: "추상화, 단순화, 명확화는 모델링의 핵심 특징이다.",
    trap: "모델은 현실 세계를 가능한 한 복잡하게 모두 복사할수록 좋다.",
    sqlAngle: "명확하지 않은 모델은 같은 업무 조건을 SQL마다 다르게 해석하게 만든다.",
    candidates: ["추상화", "난독화", "중복화", "임의화"],
    candidateNotes: ["현실의 핵심 관점을 뽑아 표현한다.", "이해를 어렵게 만드는 행위다.", "불필요한 반복을 만든다.", "규칙 없는 표현이다."]
  },
  {
    topic: "모델링의 세 가지 관점",
    difficulty: "중간",
    scenario: "업무 분석 회의에서 데이터, 프로세스, 데이터와 프로세스의 상호 영향을 나누어 검토한다.",
    correctRule: "모델링은 데이터 관점, 프로세스 관점, 데이터와 프로세스의 상관 관점으로 나누어 볼 수 있다.",
    trap: "SQLP의 데이터 모델링은 화면 흐름만 보면 충분하고 데이터 관점은 필요 없다.",
    sqlAngle: "데이터와 프로세스의 상관을 이해하면 트랜잭션이 어떤 엔터티를 생성·변경하는지 SQL로 추적하기 쉽다.",
    candidates: ["데이터 관점", "색상 관점", "폰트 관점", "브라우저 관점"],
    candidateNotes: ["업무가 어떤 데이터를 필요로 하는지 보는 관점이다.", "데이터 모델링 관점이 아니다.", "데이터 모델링 관점이 아니다.", "실행 환경 관점이다."]
  },
  {
    topic: "데이터 모델링 유의점",
    difficulty: "기본",
    scenario: "전사 고객 데이터를 여러 시스템에서 함께 사용하려고 한다.",
    correctRule: "데이터 모델링은 중복, 비유연성, 비일관성을 줄이는 방향으로 수행해야 한다.",
    trap: "업무 변화가 예상되어도 현재 화면에 맞춰 컬럼을 계속 추가하는 것이 가장 좋다.",
    sqlAngle: "중복과 비일관성이 크면 동일 조건의 SQL도 시스템마다 다른 결과를 낼 수 있다.",
    candidates: ["중복 방지", "버튼 정렬", "화면 애니메이션", "이미지 압축"],
    candidateNotes: ["같은 데이터가 여러 곳에 저장되는 문제를 줄인다.", "UI 작업이다.", "UI 작업이다.", "자산 최적화다."]
  },
  {
    topic: "외부·개념·내부 스키마",
    difficulty: "중간",
    scenario: "사용자 관점, 조직 전체 관점, 물리 저장 관점을 구분해 DB 구조를 설명한다.",
    correctRule: "외부 스키마는 사용자 관점, 개념 스키마는 조직 전체 관점, 내부 스키마는 물리 저장 관점이다.",
    trap: "개념 스키마는 특정 사용자 한 명이 보는 개인 뷰만 의미한다.",
    sqlAngle: "스키마 관점을 구분하면 뷰, 논리 모델, 물리 인덱스의 역할을 혼동하지 않는다.",
    candidates: ["개념 스키마", "응용 스키마", "화면 스키마", "메뉴 스키마"],
    candidateNotes: ["조직 전체 데이터와 관계를 표현한다.", "3층 스키마의 표준 분류가 아니다.", "3층 스키마가 아니다.", "3층 스키마가 아니다."]
  },
  {
    topic: "엔터티 명명과 특징",
    difficulty: "기본",
    scenario: "업무에서 관리할 엔터티 후보의 이름을 정하고 검증한다.",
    correctRule: "엔터티명은 업무에서 사용하는 명사형으로, 유일하고 약어를 남용하지 않게 부여한다.",
    trap: "엔터티명은 개발자가 알아보기만 하면 업무 용어와 달라도 상관없다.",
    sqlAngle: "명확한 엔터티명은 SQL 별칭과 조인 의미를 이해하는 데 도움을 준다.",
    candidates: ["계약", "처리", "좋은것", "데이터1"],
    candidateNotes: ["업무 명사이며 관리 대상이다.", "동사형 처리 행위다.", "의미가 모호하다.", "의미가 모호하다."]
  },
  {
    topic: "유형·개념·사건 엔터티",
    difficulty: "중간",
    scenario: "보험상품, 조직, 주문, 청구 같은 엔터티 후보를 분류한다.",
    correctRule: "유형 엔터티는 물리적 형태가 있는 대상, 개념 엔터티는 개념적 관리 대상, 사건 엔터티는 업무 행위 결과이다.",
    trap: "주문처럼 발생 행위를 기록하는 엔터티는 항상 유형 엔터티다.",
    sqlAngle: "엔터티 성격은 발생 건수, 이력 관리, 조인 중심 테이블 판단에 영향을 준다.",
    candidates: ["보험상품", "주문상세", "주문일자", "상품명"],
    candidateNotes: ["개념적으로 관리되는 상품 조건이다.", "사건/행위 엔터티에 가깝다.", "속성이다.", "속성이다."]
  },
  {
    topic: "기본·중심·행위 엔터티",
    difficulty: "중간",
    scenario: "프로젝트 수행 중 고객, 상품, 주문, 주문상세의 발생 시점을 구분한다.",
    correctRule: "기본 엔터티는 독립적으로 존재하고, 중심 엔터티는 업무 중심이 되며, 행위 엔터티는 두 개 이상 부모로부터 발생한다.",
    trap: "행위 엔터티는 분석 초기부터 항상 가장 먼저 명확하게 도출된다.",
    sqlAngle: "행위 엔터티는 데이터량이 많아지고 조인과 집계의 중심이 되는 경우가 많다.",
    candidates: ["주문상세", "고객명", "상품명", "우편번호"],
    candidateNotes: ["주문과 상품 등 부모 관계에서 발생하는 행위 데이터다.", "고객 속성이다.", "상품 속성이다.", "주소 속성이다."]
  },
  {
    topic: "속성 명명과 특성",
    difficulty: "기본",
    scenario: "속성 후보가 업무에서 쓰는 용어와 다르게 중복 정의되어 있다.",
    correctRule: "속성명은 업무 의미를 명확히 하고 하나의 속성은 하나의 의미만 가져야 한다.",
    trap: "같은 속성명이 테이블마다 다른 의미여도 개발자가 알고 있으면 문제 없다.",
    sqlAngle: "속성 의미가 흔들리면 WHERE 조건과 집계 기준이 달라져 결과 오류가 생긴다.",
    candidates: ["고객번호", "정보", "값", "기타"],
    candidateNotes: ["식별 의미가 명확하다.", "의미가 넓다.", "의미가 넓다.", "의미가 모호하다."]
  },
  {
    topic: "식별·비식별 관계",
    difficulty: "실전",
    scenario: "부모 식별자가 자식의 주식별자에 포함되는지 여부를 판단한다.",
    correctRule: "식별 관계는 부모 식별자가 자식 주식별자에 포함되고, 비식별 관계는 일반 외래키로 참조한다.",
    trap: "식별 관계에서는 부모 키가 자식의 일반 속성으로만 존재하고 주식별자에는 포함되지 않는다.",
    sqlAngle: "식별 관계는 키 전파로 하위 테이블까지 조인 키가 이어질 수 있다.",
    candidates: ["식별 관계", "관계 없음", "화면 관계", "정렬 관계"],
    candidateNotes: ["부모 키가 자식 주식별자에 포함된다.", "참조 관계가 있다.", "모델 관계가 아니다.", "모델 관계가 아니다."]
  },
  {
    topic: "주식별자 도출 기준",
    difficulty: "중간",
    scenario: "엔터티의 주식별자 후보 중 업무에서 자주 사용되고 안정적인 속성을 고른다.",
    correctRule: "주식별자는 업무에서 자주 이용되고, 명칭·내역 같은 설명성 값은 피하며, 너무 많은 속성 조합을 지양한다.",
    trap: "명칭이나 내역처럼 사람이 읽기 쉬운 설명 컬럼을 주식별자로 우선 지정한다.",
    sqlAngle: "좋은 주식별자는 FK와 조인 조건을 단순하고 안정적으로 만든다.",
    candidates: ["사원번호", "사원명", "부서명", "비고"],
    candidateNotes: ["업무에서 사원을 구분하는 안정적 후보일 수 있다.", "동명이인 가능성이 있다.", "여러 사원이 공유한다.", "설명성 값이다."]
  },
  {
    topic: "식별자의 최소성",
    difficulty: "중간",
    scenario: "주문번호만으로 주문을 식별할 수 있는데 주문일자까지 주식별자에 포함하려 한다.",
    correctRule: "식별자의 최소성은 유일성을 만족하는 데 꼭 필요한 속성만 포함해야 한다는 특성이다.",
    trap: "식별자는 속성을 많이 포함할수록 항상 더 좋은 모델이 된다.",
    sqlAngle: "불필요하게 긴 복합키는 모든 자식 테이블의 FK와 조인 조건을 무겁게 만든다.",
    candidates: ["최소성", "비유연성", "카디널리티", "선택성"],
    candidateNotes: ["필요 최소 속성으로 식별한다.", "모델링 유의점이다.", "관계 차수다.", "필수/선택 참여 여부다."]
  },
  {
    topic: "엔터티 판별",
    difficulty: "기본",
    scenario: "고객센터는 고객, 상담이력, 상담결과, 상담처리시간을 관리한다.",
    correctRule: "업무에서 독립적으로 관리하고 반복 발생하는 대상의 집합을 엔터티로 본다.",
    trap: "고객명처럼 값을 설명하는 항목을 엔터티로 분리한다.",
    sqlAngle: "엔터티를 잘못 잡으면 불필요한 조인과 중복 컬럼이 생긴다.",
    candidates: ["상담이력", "고객명", "상담처리시간", "상담결과명"],
    candidateNotes: ["고객별 여러 건 발생하며 식별과 관리가 필요하다.", "고객을 설명하는 값이다.", "상담이력의 속성 값이다.", "코드 값의 표시명에 가깝다."]
  },
  {
    topic: "속성 분류",
    difficulty: "기본",
    scenario: "주문금액은 주문수량과 상품단가를 이용해 계산할 수 있다.",
    correctRule: "다른 속성으로 계산 가능한 값은 파생 속성 여부를 검토한다.",
    trap: "계산 가능 여부와 무관하게 모든 금액 컬럼을 기본 속성으로 둔다.",
    sqlAngle: "파생 속성 저장은 조회 성능과 정합성 유지 비용을 함께 만든다.",
    candidates: ["주문금액", "주문번호", "상품코드", "주문일자"],
    candidateNotes: ["수량과 단가로 계산 가능한 값이다.", "주문을 식별하는 값이다.", "상품 참조 값이다.", "주문 발생 시점이다."]
  },
  {
    topic: "관계 선택성",
    difficulty: "중간",
    scenario: "고객은 주문하지 않을 수 있지만 주문은 반드시 고객에 의해 생성된다.",
    correctRule: "기준 엔터티의 선택성과 상대 엔터티의 필수성을 구분해 관계를 표현한다.",
    trap: "양쪽 모두 필수 관계로 표현해 주문 없는 고객을 제거한다.",
    sqlAngle: "선택 관계를 무시하면 OUTER JOIN이 필요한 조회에서 기준 행이 사라진다.",
    candidates: ["고객 선택 1:M 주문", "고객 필수 1:1 주문", "고객 M:N 주문", "관계 없음"],
    candidateNotes: ["고객은 주문이 없을 수 있고 주문은 고객이 필요하다.", "한 고객이 여러 주문을 할 수 있다.", "교차 엔터티가 필요한 관계가 아니다.", "주문은 고객과 관련된다."]
  },
  {
    topic: "식별자 안정성",
    difficulty: "중간",
    scenario: "사원번호는 회사 정책 변경 시 재발급될 수 있고 주민등록번호는 수집하지 않는다.",
    correctRule: "주식별자는 유일성, 최소성, 안정성, 존재성을 함께 만족해야 한다.",
    trap: "현재 유일하기만 하면 변경 가능성이 커도 주식별자로 확정한다.",
    sqlAngle: "불안정한 식별자는 FK 전파 후 대량 갱신과 참조 무결성 문제를 만든다.",
    candidates: ["인조 사원ID", "사원명", "부서명", "입사월"],
    candidateNotes: ["변경 가능성이 낮고 내부 식별에 적합하다.", "동명이인이 가능하다.", "여러 사원이 공유한다.", "유일하지 않다."]
  },
  {
    topic: "1정규형",
    difficulty: "기본",
    scenario: "회원 테이블에 전화번호1, 전화번호2, 전화번호3 컬럼이 반복된다.",
    correctRule: "반복 속성이나 다중 값을 별도 행 구조로 분리하면 1NF 위반을 줄일 수 있다.",
    trap: "반복 컬럼을 계속 늘리는 방식이 가장 정규화된 설계다.",
    sqlAngle: "반복 컬럼은 검색 조건과 집계 SQL을 복잡하게 만들고 인덱스 설계를 어렵게 한다.",
    candidates: ["회원전화번호", "회원명", "가입일자", "회원등급명"],
    candidateNotes: ["회원별 여러 전화번호를 행으로 관리한다.", "회원 속성이다.", "회원 속성이다.", "등급 코드의 표시명이다."]
  },
  {
    topic: "2정규형",
    difficulty: "중간",
    scenario: "수강(학생ID, 과목ID, 과목명, 성적)에서 과목명은 과목ID에만 종속된다.",
    correctRule: "복합 식별자의 일부에만 종속되는 속성은 2NF 위반 후보이다.",
    trap: "복합키가 있으면 모든 속성이 자동으로 완전 함수 종속을 만족한다.",
    sqlAngle: "부분 종속을 방치하면 과목명 변경 시 여러 수강 행을 갱신해야 한다.",
    candidates: ["과목", "성적", "학생명", "수강일자"],
    candidateNotes: ["과목ID에 종속되는 과목명을 관리한다.", "학생과 과목의 관계 속성이다.", "학생 엔터티의 속성이다.", "수강 관계의 속성이다."]
  },
  {
    topic: "3정규형",
    difficulty: "중간",
    scenario: "고객(고객ID, 등급코드, 등급할인율)에서 등급할인율은 등급코드에 종속된다.",
    correctRule: "일반 속성 간 이행 함수 종속은 3NF 위반 후보이다.",
    trap: "등급할인율이 조회에 필요하면 고객 테이블에만 보관해야 한다.",
    sqlAngle: "이행 종속을 방치하면 할인율 변경 시 중복 데이터 정합성 문제가 생긴다.",
    candidates: ["등급", "고객명", "고객ID", "가입일자"],
    candidateNotes: ["등급코드별 할인율을 관리한다.", "고객 속성이다.", "고객 식별자다.", "고객 속성이다."]
  },
  {
    topic: "반정규화",
    difficulty: "실전",
    scenario: "정규화된 주문 모델에서 월별 대시보드 조회가 과도하게 느리다.",
    correctRule: "반정규화는 성능 병목, 정합성 유지 방안, 갱신 비용을 검토한 뒤 제한적으로 적용한다.",
    trap: "조인이 2개 이상이면 항상 중복 컬럼을 추가한다.",
    sqlAngle: "반정규화는 읽기 비용을 줄일 수 있지만 쓰기 정합성 비용을 만든다.",
    candidates: ["월별주문요약", "고객명복사", "상품명복사", "주문메모"],
    candidateNotes: ["반복 집계 조회 병목을 줄이기 위한 요약 엔터티다.", "무조건 복사하면 정합성 문제가 생긴다.", "무조건 복사하면 정합성 문제가 생긴다.", "성능 병목 해소 목적이 약하다."]
  },
  {
    topic: "M:N 관계 해소",
    difficulty: "중간",
    scenario: "학생은 여러 과목을 수강하고 과목은 여러 학생이 수강한다. 수강일자와 성적은 관계에 종속된다.",
    correctRule: "M:N 관계에 속성이 있으면 교차 엔터티로 해소한다.",
    trap: "학생 테이블에 과목코드1, 과목코드2 컬럼을 계속 추가한다.",
    sqlAngle: "교차 엔터티는 조인 경로를 명확하게 하고 관계 속성을 안정적으로 관리한다.",
    candidates: ["수강", "학생명", "과목명", "성적등급명"],
    candidateNotes: ["학생과 과목 사이의 관계와 성적을 관리한다.", "학생 속성이다.", "과목 속성이다.", "성적 코드의 표시명이다."]
  },
  {
    topic: "슈퍼타입과 서브타입",
    difficulty: "실전",
    scenario: "회원은 개인회원과 법인회원으로 나뉘며 공통 속성과 타입별 속성이 섞여 있다.",
    correctRule: "공통 속성과 배타성, 발생 비율, 조회 패턴을 보고 통합/분리 전략을 정한다.",
    trap: "서브타입 이름이 길면 반드시 별도 테이블로 분리한다.",
    sqlAngle: "통합/분리 방식은 조인 수, NULL 컬럼, 인덱스 선택성에 영향을 준다.",
    candidates: ["회원 슈퍼타입", "회원명", "가입일자", "담당자전화"],
    candidateNotes: ["개인/법인 공통 식별과 속성을 가진다.", "공통 속성이다.", "공통 속성이다.", "법인회원 속성일 수 있다."]
  },
  {
    topic: "이력 모델",
    difficulty: "실전",
    scenario: "고객 등급 변경 이력을 보존하고 특정 기준일의 등급을 조회해야 한다.",
    correctRule: "이력은 적용시작일과 적용종료일 또는 기준시점으로 유효 기간을 표현한다.",
    trap: "현재 등급만 남기면 모든 이력 조회 요구를 만족한다.",
    sqlAngle: "이력 모델은 기준일 조건과 기간 겹침 조건이 SQL의 핵심이 된다.",
    candidates: ["고객등급이력", "현재등급명", "고객명", "최종수정자명"],
    candidateNotes: ["고객별 등급의 유효기간을 관리한다.", "현재 값의 표시명이다.", "고객 속성이다.", "감사 속성에 가깝다."]
  },
  {
    topic: "코드 엔터티",
    difficulty: "중간",
    scenario: "주문상태는 접수, 결제완료, 배송중, 취소 등 제한된 값으로 관리된다.",
    correctRule: "코드와 코드명, 사용여부, 정렬순서처럼 표준화가 필요한 값은 코드 엔터티로 관리할 수 있다.",
    trap: "코드 값은 화면에만 쓰이므로 데이터 모델에는 표현하지 않는다.",
    sqlAngle: "코드 엔터티는 표시명 변경과 조건 표준화에는 유리하지만 과도한 조인은 주의한다.",
    candidates: ["주문상태코드", "주문금액", "주문번호", "배송주소상세"],
    candidateNotes: ["제한된 상태 값을 표준화한다.", "주문 속성이다.", "주문 식별자다.", "주소 속성이다."]
  },
  {
    topic: "도메인",
    difficulty: "기본",
    scenario: "여러 테이블에서 사용여부 컬럼이 Y/N, 1/0, T/F로 섞여 있다.",
    correctRule: "도메인은 속성이 가질 수 있는 값의 범위와 형식을 표준화한다.",
    trap: "같은 의미의 값 표현은 테이블마다 달라도 전혀 문제가 없다.",
    sqlAngle: "도메인 표준화는 조건식 단순화와 데이터 품질 개선에 도움을 준다.",
    candidates: ["사용여부 도메인", "테이블명", "컬럼 순서", "화면 색상"],
    candidateNotes: ["값 범위와 표현 방식을 통일한다.", "객체 이름이다.", "물리 배치 정보다.", "데이터 도메인이 아니다."]
  },
  {
    topic: "본질식별자와 인조식별자",
    difficulty: "실전",
    scenario: "업무 식별자가 길고 변경 가능성이 있어 내부 식별자 도입을 검토한다.",
    correctRule: "인조식별자는 안정성과 단순성을 줄 수 있지만 업무 식별자의 유일성 제약은 별도로 보장해야 한다.",
    trap: "인조식별자를 만들면 업무키 중복 검증은 필요 없다.",
    sqlAngle: "인조식별자는 조인 키를 단순화하지만 업무키 인덱스와 제약 설계가 추가로 필요하다.",
    candidates: ["주문ID", "주문번호+채널코드", "고객명", "주문상태명"],
    candidateNotes: ["내부 참조용 인조식별자로 쓸 수 있다.", "업무 식별자 후보이다.", "유일하지 않다.", "상태 표시명이다."]
  },
  {
    topic: "관계명",
    difficulty: "기본",
    scenario: "한 고객은 여러 배송지를 등록하고 기본 배송지를 지정할 수 있다.",
    correctRule: "관계명은 두 엔터티 사이의 업무 의미를 동사형으로 명확히 표현한다.",
    trap: "관계명은 ERD에 보이지 않아도 SQL 작성과 무관하다.",
    sqlAngle: "명확한 관계명은 조인 의미와 기준 집합을 이해하는 데 도움을 준다.",
    candidates: ["고객이 배송지를 등록한다", "고객명", "배송지주소", "기본여부"],
    candidateNotes: ["고객과 배송지의 업무 관계를 표현한다.", "고객 속성이다.", "배송지 속성이다.", "배송지 속성이다."]
  },
  {
    topic: "카디널리티",
    difficulty: "중간",
    scenario: "한 부서는 여러 사원을 가질 수 있고 사원은 하나의 부서에 소속된다.",
    correctRule: "카디널리티는 한 인스턴스가 상대 인스턴스와 맺을 수 있는 개수를 표현한다.",
    trap: "카디널리티는 화면 목록 개수만 의미하며 모델에는 영향을 주지 않는다.",
    sqlAngle: "카디널리티 이해는 조인 후 결과 건수 폭증 여부를 예측하는 기준이 된다.",
    candidates: ["부서 1:M 사원", "부서 M:N 사원", "부서 1:1 사원", "관계 없음"],
    candidateNotes: ["한 부서에 여러 사원이 가능하다.", "사원은 하나의 부서에 소속된다.", "여러 사원이 가능하므로 1:1이 아니다.", "소속 관계가 있다."]
  },
  {
    topic: "참조 무결성",
    difficulty: "중간",
    scenario: "주문은 존재하지 않는 고객번호를 참조하면 안 된다.",
    correctRule: "참조 무결성은 자식의 외래키 값이 부모의 식별자 값과 일치하도록 보장한다.",
    trap: "외래키는 성능을 위해 논리 모델에서만 쓰고 정합성과는 무관하다.",
    sqlAngle: "참조 무결성은 조인 결과 신뢰성과 삭제/갱신 규칙에 영향을 준다.",
    candidates: ["주문.cust_id FK", "주문.amount", "고객명", "주문메모"],
    candidateNotes: ["주문이 고객을 참조하는 키다.", "금액 속성이다.", "고객 속성이다.", "설명 속성이다."]
  },
  {
    topic: "계층 모델",
    difficulty: "중간",
    scenario: "카테고리는 상위 카테고리와 하위 카테고리로 여러 단계 구성된다.",
    correctRule: "계층 구조는 자기참조 관계나 별도 계층 엔터티로 표현할 수 있다.",
    trap: "계층 단계가 늘어날 때마다 level1, level2 컬럼을 무한히 추가한다.",
    sqlAngle: "계층 모델은 셀프 조인, CONNECT BY, 재귀 CTE 같은 SQL 패턴으로 이어진다.",
    candidates: ["상위카테고리ID", "카테고리명", "정렬순서", "수정일자"],
    candidateNotes: ["자기참조 관계를 표현하는 키다.", "카테고리 속성이다.", "표시 속성이다.", "감사 속성이다."]
  },
  {
    topic: "트랜잭션 모델",
    difficulty: "실전",
    scenario: "주문 접수, 결제, 출고는 하나의 업무 흐름에서 상태가 변한다.",
    correctRule: "모델은 업무 트랜잭션이 어떤 엔터티와 상태 변화를 만드는지 표현해야 한다.",
    trap: "상태 변화는 프로그램 로직이므로 데이터 모델에는 전혀 표현하지 않는다.",
    sqlAngle: "트랜잭션 모델 이해는 상태 조건, 이력 조회, 동시성 제어 SQL에 영향을 준다.",
    candidates: ["주문상태이력", "주문자명", "상품명", "화면버튼명"],
    candidateNotes: ["상태 변화와 발생 시점을 관리한다.", "주문 속성이다.", "상품 속성이다.", "데이터 모델 대상이 아니다."]
  },
  {
    topic: "NULL 속성",
    difficulty: "중간",
    scenario: "배송완료일은 배송 전에는 존재하지 않지만 배송 완료 후에는 반드시 필요하다.",
    correctRule: "NULL 허용은 업무상 값의 미발생과 미입력을 구분해 결정한다.",
    trap: "모든 컬럼을 NULL 허용으로 두면 모델이 가장 유연해진다.",
    sqlAngle: "NULL 허용은 OUTER JOIN, 집계, 조건식의 결과에 직접 영향을 준다.",
    candidates: ["배송완료일", "주문번호", "고객ID", "상품코드"],
    candidateNotes: ["업무 시점에 따라 미발생 상태가 가능하다.", "식별자는 보통 필수다.", "참조키는 주문에 필수다.", "주문상품에는 필수다."]
  },
  {
    topic: "데이터 표준화",
    difficulty: "기본",
    scenario: "고객번호, 고객ID, CUST_NO가 같은 의미로 여러 시스템에 섞여 있다.",
    correctRule: "표준 용어와 도메인을 맞추면 모델 해석과 SQL 작성의 혼선을 줄인다.",
    trap: "같은 의미라도 개발자가 편한 이름을 각자 쓰는 것이 유지보수에 유리하다.",
    sqlAngle: "표준화는 조인 컬럼 식별과 데이터 통합 쿼리의 오류를 줄인다.",
    candidates: ["고객 식별자 표준", "버튼 색상", "화면 위치", "로그인 이미지"],
    candidateNotes: ["같은 의미의 식별자를 통일한다.", "데이터 표준 대상이 아니다.", "데이터 표준 대상이 아니다.", "데이터 표준 대상이 아니다."]
  },
  {
    topic: "업무 규칙 도출",
    difficulty: "중간",
    scenario: "쿠폰은 발급 후 한 번만 사용할 수 있고 만료일 이후에는 사용할 수 없다.",
    correctRule: "업무 규칙은 엔터티, 속성, 관계, 제약 조건으로 분해해 모델에 반영한다.",
    trap: "업무 규칙은 화면 설명에만 두고 데이터 제약으로는 표현하지 않는다.",
    sqlAngle: "규칙을 모델에 반영하면 중복 사용 방지와 유효기간 조건 SQL이 명확해진다.",
    candidates: ["쿠폰사용이력", "쿠폰명", "만료일", "할인금액"],
    candidateNotes: ["쿠폰 사용 여부와 시점을 관리한다.", "쿠폰 속성이다.", "쿠폰 속성이다.", "쿠폰 속성이다."]
  },
  {
    topic: "속성 원자성",
    difficulty: "기본",
    scenario: "주소 컬럼 하나에 우편번호, 시도, 상세주소를 모두 붙여 저장한다.",
    correctRule: "업무에서 따로 검색·검증·집계해야 하는 값은 원자적으로 분리한다.",
    trap: "문자열 하나에 모두 붙이면 항상 가장 좋은 정규화다.",
    sqlAngle: "원자성이 낮은 컬럼은 LIKE 검색과 함수 가공을 유발해 인덱스 효율을 떨어뜨린다.",
    candidates: ["우편번호", "전체주소문장", "화면주소", "주소라벨"],
    candidateNotes: ["별도 검색과 검증이 필요한 값이다.", "복합 문자열이다.", "표현용 값이다.", "표시명에 가깝다."]
  },
  {
    topic: "테이블 통합과 분리",
    difficulty: "실전",
    scenario: "온라인주문과 매장주문은 공통 속성이 많지만 일부 속성과 처리 흐름이 다르다.",
    correctRule: "통합/분리는 공통 속성, 배타성, 조회 패턴, NULL 비율을 함께 보고 결정한다.",
    trap: "이름이 다른 업무는 공통 속성이 많아도 반드시 완전히 분리한다.",
    sqlAngle: "통합은 조인을 줄일 수 있지만 NULL 증가와 인덱스 선택성 저하를 만들 수 있다.",
    candidates: ["주문 공통 엔터티", "온라인주문메모", "매장명", "배송요청사항"],
    candidateNotes: ["공통 식별과 속성을 묶을 수 있다.", "온라인 주문 특화 속성이다.", "매장 주문 특화 속성이다.", "온라인 주문 특화 속성이다."]
  },
  {
    topic: "데이터 품질",
    difficulty: "중간",
    scenario: "같은 고객이 시스템별로 다른 고객번호와 다른 휴대폰 형식으로 저장된다.",
    correctRule: "데이터 품질은 표준화, 식별 기준, 중복 식별 규칙을 함께 관리해야 한다.",
    trap: "중복 고객은 SQL로 조회할 때마다 사람이 판단하면 충분하다.",
    sqlAngle: "품질 기준이 없으면 조인과 집계 결과의 신뢰도가 떨어진다.",
    candidates: ["고객통합식별규칙", "메뉴명", "버튼위치", "배경색"],
    candidateNotes: ["중복 식별과 통합 기준을 정의한다.", "데이터 품질 기준이 아니다.", "데이터 품질 기준이 아니다.", "데이터 품질 기준이 아니다."]
  },
  {
    topic: "모델과 인덱스 연결",
    difficulty: "실전",
    scenario: "주문 조회는 고객별 최근 주문 조건으로 대부분 수행된다.",
    correctRule: "자주 쓰는 관계와 조회 조건은 식별자와 인덱스 후보를 함께 검토하게 만든다.",
    trap: "논리 모델은 인덱스 설계와 전혀 관련이 없다.",
    sqlAngle: "고객-주문 관계와 주문일 조건은 복합 인덱스 컬럼 순서 판단으로 이어진다.",
    candidates: ["주문(cust_id, order_dt)", "주문(amount)", "고객명", "상품명"],
    candidateNotes: ["주요 조회 조건과 관계를 반영한다.", "금액 단독 조건은 주 시나리오가 아니다.", "고객 속성이다.", "상품 속성이다."]
  },
  {
    topic: "모델 검증",
    difficulty: "실전",
    scenario: "모델 리뷰에서 주요 화면 SQL을 대입해 결과 건수와 조인 경로를 점검한다.",
    correctRule: "모델은 업무 규칙뿐 아니라 대표 SQL을 대입해 검증해야 한다.",
    trap: "ERD가 보기 좋으면 실제 SQL 검증은 생략해도 된다.",
    sqlAngle: "대표 SQL 검증은 누락 관계, 잘못된 선택성, 불필요한 조인을 조기에 찾게 해준다.",
    candidates: ["대표 조회 SQL 검증", "로고 색상 검토", "버튼 문구 검토", "폰트 크기 결정"],
    candidateNotes: ["모델이 SQL 요구를 만족하는지 확인한다.", "모델 검증 항목이 아니다.", "모델 검증 항목이 아니다.", "모델 검증 항목이 아니다."]
  }
];

const sqlSpecs: SqlSpec[] = [
  {
    topic: "SELECT 논리 처리 순서",
    difficulty: "기본",
    scenario: "SELECT 별칭을 WHERE 절에서 바로 사용하려 한다.",
    code: "SELECT order_id, amount AS amt\nFROM orders\nWHERE amt >= 10000;",
    correctRule: "WHERE 절은 SELECT 절보다 논리적으로 먼저 처리되므로 SELECT 별칭을 바로 참조할 수 없다.",
    fix: "별칭 조건은 인라인 뷰 바깥에서 사용하거나 원래 표현식을 WHERE 절에 작성한다.",
    trap: "SELECT 절이 항상 가장 먼저 실행되므로 WHERE에서 별칭을 사용할 수 있다.",
    resultAngle: "이 SQL은 별칭 인식 문제로 오류가 발생할 수 있다."
  },
  {
    topic: "DISTINCT",
    difficulty: "기본",
    scenario: "주문 테이블에서 주문 채널과 상태의 중복 없는 조합을 조회한다.",
    code: "SELECT DISTINCT channel_cd, status_cd\nFROM orders;",
    correctRule: "DISTINCT는 SELECT 목록 전체 조합을 기준으로 중복을 제거한다.",
    fix: "특정 컬럼 하나가 아니라 SELECT에 나열된 컬럼 조합 기준임을 확인한다.",
    trap: "DISTINCT는 첫 번째 컬럼만 기준으로 중복을 제거하고 나머지 컬럼은 임의로 선택한다.",
    resultAngle: "channel_cd와 status_cd의 같은 조합은 한 번만 출력된다."
  },
  {
    topic: "문자 함수",
    difficulty: "기본",
    scenario: "고객명 앞뒤 공백을 제거하고 대문자로 비교한다.",
    code: "SELECT customer_id\nFROM customers\nWHERE UPPER(TRIM(customer_name)) = 'KIM';",
    correctRule: "문자 함수는 문자열 변환, 자르기, 길이, 대소문자, 공백 제거 등에 사용된다.",
    fix: "검색 조건에 컬럼 함수를 적용하면 인덱스 사용성이 떨어질 수 있어 저장 값 정제나 함수 기반 인덱스를 검토한다.",
    trap: "TRIM은 숫자 합계를 구하는 집계 함수이다.",
    resultAngle: "공백 제거와 대문자 변환 후 KIM과 같은 고객명이 비교된다."
  },
  {
    topic: "날짜 함수",
    difficulty: "중간",
    scenario: "주문일이 속한 월의 첫날을 기준으로 월별 집계를 한다.",
    code: "SELECT TRUNC(order_dt, 'MM') order_month, COUNT(*)\nFROM orders\nGROUP BY TRUNC(order_dt, 'MM');",
    correctRule: "날짜 함수는 날짜 절삭, 더하기, 차이 계산 등 날짜 단위 처리를 수행한다.",
    fix: "월별 그룹 기준은 TRUNC(date,'MM')처럼 명확히 만들 수 있다.",
    trap: "날짜 컬럼은 문자처럼 항상 사전순으로 비교해도 월별 결과가 정확하다.",
    resultAngle: "같은 월에 속한 주문이 월 첫날 값으로 묶인다."
  },
  {
    topic: "NVL과 COALESCE",
    difficulty: "중간",
    scenario: "할인금액이 NULL이면 0으로 보고 결제금액을 계산한다.",
    code: "SELECT amount - COALESCE(discount_amt, 0) AS pay_amt\nFROM orders;",
    correctRule: "NVL 또는 COALESCE는 NULL일 때 대체 값을 반환하는 데 사용한다.",
    fix: "NULL을 0으로 계산해야 하는지, 알 수 없음으로 유지해야 하는지 업무 의미를 먼저 확인한다.",
    trap: "COALESCE는 NULL이 아닌 값을 모두 NULL로 바꾸는 함수이다.",
    resultAngle: "discount_amt가 NULL이면 0으로 대체되어 amount에서 차감된다."
  },
  {
    topic: "CASE 표현식",
    difficulty: "중간",
    scenario: "주문금액에 따라 VIP, NORMAL 등급을 표시한다.",
    code: "SELECT order_id,\n       CASE WHEN amount >= 100000 THEN 'VIP' ELSE 'NORMAL' END AS order_grade\nFROM orders;",
    correctRule: "CASE 표현식은 조건에 따라 서로 다른 값을 반환한다.",
    fix: "여러 조건이 겹치면 위에서부터 평가되는 순서를 고려해 작성한다.",
    trap: "CASE는 WHERE 절에서만 사용할 수 있고 SELECT 절에서는 사용할 수 없다.",
    resultAngle: "amount가 100000 이상이면 VIP, 아니면 NORMAL이 표시된다."
  },
  {
    topic: "LIKE",
    difficulty: "기본",
    scenario: "상품명이 SQL로 시작하는 상품을 찾는다.",
    code: "SELECT product_id\nFROM products\nWHERE product_name LIKE 'SQL%';",
    correctRule: "LIKE의 %는 길이 제한 없는 문자열, _는 한 글자를 의미한다.",
    fix: "앞쪽 고정 패턴은 인덱스 활용 가능성이 있지만 '%SQL' 같은 앞 와일드카드는 불리할 수 있다.",
    trap: "LIKE 'SQL%'는 SQL로 끝나는 문자열만 찾는다.",
    resultAngle: "SQL로 시작하는 상품명이 반환된다."
  },
  {
    topic: "BETWEEN",
    difficulty: "기본",
    scenario: "금액이 1000 이상 5000 이하인 주문을 찾는다.",
    code: "SELECT order_id\nFROM orders\nWHERE amount BETWEEN 1000 AND 5000;",
    correctRule: "BETWEEN a AND b는 일반적으로 양 끝값을 포함한다.",
    fix: "날짜 조건에서는 시각까지 고려해 반열린 구간을 쓰는 것이 안전할 때가 많다.",
    trap: "BETWEEN은 시작값과 종료값을 모두 제외한다.",
    resultAngle: "1000과 5000인 주문도 조건에 포함된다."
  },
  {
    topic: "IN 조건",
    difficulty: "기본",
    scenario: "주문상태가 결제완료 또는 배송중인 주문을 조회한다.",
    code: "SELECT order_id\nFROM orders\nWHERE status_cd IN ('PAID', 'SHIPPING');",
    correctRule: "IN은 값이 목록 중 하나와 일치하는지 판단한다.",
    fix: "동일 컬럼에 대한 여러 OR 조건은 IN으로 간결하게 표현할 수 있다.",
    trap: "IN 목록은 반드시 하나의 값만 가질 수 있다.",
    resultAngle: "상태가 PAID 또는 SHIPPING인 주문이 반환된다."
  },
  {
    topic: "WHERE와 HAVING",
    difficulty: "기본",
    scenario: "부서별 평균 급여가 5000 이상인 부서를 찾는다.",
    code: "SELECT deptno, AVG(sal)\nFROM emp\nGROUP BY deptno\nHAVING AVG(sal) >= 5000;",
    correctRule: "집계 결과에 대한 조건은 HAVING 절에서 판단한다.",
    fix: "행 조건은 WHERE, 그룹 집계 조건은 HAVING에 둔다.",
    trap: "AVG 같은 집계 함수 조건은 WHERE 절에 작성해야 한다.",
    resultAngle: "GROUP BY 후 평균 급여 조건을 만족하는 그룹만 남는다."
  },
  {
    topic: "NULL 비교",
    difficulty: "기본",
    scenario: "퇴사일이 아직 없는 사원을 찾는다.",
    code: "SELECT empno\nFROM emp\nWHERE retire_dt IS NULL;",
    correctRule: "NULL 비교는 = NULL이 아니라 IS NULL 또는 IS NOT NULL을 사용한다.",
    fix: "값 미존재 판단에는 IS NULL을 사용한다.",
    trap: "retire_dt = NULL 조건이 NULL 행을 정확히 찾는다.",
    resultAngle: "퇴사일이 미정인 행만 반환된다."
  },
  {
    topic: "집계와 NULL",
    difficulty: "중간",
    scenario: "NULL이 포함된 금액 컬럼을 집계한다.",
    code: "SELECT COUNT(*) c1, COUNT(amount) c2, SUM(amount) s\nFROM orders;",
    correctRule: "COUNT(*)는 행 수를 세고 COUNT(컬럼)은 NULL을 제외한다.",
    fix: "NULL을 0으로 보고 싶으면 COALESCE 또는 NVL 같은 처리를 명시한다.",
    trap: "COUNT(*)와 COUNT(amount)는 NULL 포함 여부와 무관하게 항상 같다.",
    resultAngle: "amount가 NULL인 행은 COUNT(amount)와 SUM(amount) 계산에서 제외된다."
  },
  {
    topic: "INNER JOIN",
    difficulty: "기본",
    scenario: "주문이 존재하는 고객만 조회한다.",
    code: "SELECT c.cust_id, o.order_id\nFROM customers c\nJOIN orders o ON o.cust_id = c.cust_id;",
    correctRule: "INNER JOIN은 양쪽 조인 조건을 만족하는 행만 반환한다.",
    fix: "주문 없는 고객까지 필요하면 OUTER JOIN으로 바꿔야 한다.",
    trap: "INNER JOIN은 기준 테이블의 모든 행을 항상 보존한다.",
    resultAngle: "주문이 없는 고객은 결과에서 제외된다."
  },
  {
    topic: "OUTER JOIN 조건 위치",
    difficulty: "실전",
    scenario: "주문 없는 고객도 보이면서 결제완료 주문만 붙이려 한다.",
    code: "SELECT c.cust_id, o.order_id\nFROM customers c LEFT JOIN orders o\n  ON o.cust_id = c.cust_id\nWHERE o.status_cd = 'PAID';",
    correctRule: "OUTER JOIN의 보존되지 않는 쪽 조건을 WHERE에 두면 기준 행이 사라질 수 있다.",
    fix: "결제완료 조건을 ON 절에 두어 고객 행 보존을 유지한다.",
    trap: "LEFT JOIN을 쓰면 WHERE 절 조건과 무관하게 왼쪽 행이 항상 보존된다.",
    resultAngle: "주문이 없거나 PAID 주문이 없는 고객은 WHERE 조건에서 제거될 수 있다."
  },
  {
    topic: "NATURAL JOIN",
    difficulty: "중간",
    scenario: "두 테이블에 같은 이름의 컬럼이 여러 개 있다.",
    code: "SELECT *\nFROM emp NATURAL JOIN dept;",
    correctRule: "NATURAL JOIN은 동일 이름 컬럼을 자동 조인 기준으로 사용한다.",
    fix: "의도한 조인 컬럼을 명확히 쓰려면 ON 또는 USING을 사용한다.",
    trap: "NATURAL JOIN은 컬럼명이 달라도 FK를 자동으로 찾아 조인한다.",
    resultAngle: "동일 이름 컬럼이 추가되면 의도치 않은 조인 조건이 늘 수 있다."
  },
  {
    topic: "CROSS JOIN",
    difficulty: "기본",
    scenario: "색상 3개와 사이즈 4개의 모든 조합을 만든다.",
    code: "SELECT c.color, s.size\nFROM colors c CROSS JOIN sizes s;",
    correctRule: "CROSS JOIN은 두 집합의 모든 조합을 만든다.",
    fix: "의도한 전체 조합이면 CROSS JOIN을 명시적으로 사용한다.",
    trap: "CROSS JOIN은 항상 중복을 제거한 뒤 결과를 만든다.",
    resultAngle: "색상 3개와 사이즈 4개면 12행이 만들어진다."
  },
  {
    topic: "서브쿼리 IN",
    difficulty: "중간",
    scenario: "주문이 있는 고객을 찾는다.",
    code: "SELECT cust_id\nFROM customers\nWHERE cust_id IN (SELECT cust_id FROM orders);",
    correctRule: "IN 서브쿼리는 비교 대상 값이 서브쿼리 결과 집합에 포함되는지 판단한다.",
    fix: "중복 여부와 존재 판단 중심이면 EXISTS도 대안이 될 수 있다.",
    trap: "IN 서브쿼리는 서브쿼리 결과가 1행일 때만 사용할 수 있다.",
    resultAngle: "주문 테이블에 cust_id가 존재하는 고객만 남는다."
  },
  {
    topic: "NOT IN과 NULL",
    difficulty: "실전",
    scenario: "폐쇄 부서가 아닌 사원을 찾는다.",
    code: "SELECT empno\nFROM emp\nWHERE deptno NOT IN (SELECT deptno FROM closed_dept);",
    correctRule: "NOT IN 목록에 NULL이 포함되면 기대한 결과가 나오지 않을 수 있다.",
    fix: "서브쿼리에서 NULL을 제거하거나 NOT EXISTS로 바꿔 검토한다.",
    trap: "NOT IN은 NULL을 자동으로 제외하므로 결과에 영향이 없다.",
    resultAngle: "서브쿼리 결과에 NULL이 있으면 전체 비교가 UNKNOWN이 될 수 있다."
  },
  {
    topic: "EXISTS",
    difficulty: "중간",
    scenario: "구매 이력이 있는 고객만 조회한다.",
    code: "SELECT c.cust_id\nFROM customers c\nWHERE EXISTS (SELECT 1 FROM orders o WHERE o.cust_id = c.cust_id);",
    correctRule: "EXISTS는 서브쿼리 결과의 존재 여부를 판단한다.",
    fix: "중복 제거보다 존재 여부가 목적이면 EXISTS가 자연스럽다.",
    trap: "EXISTS는 서브쿼리 SELECT 목록의 실제 값을 모두 반환한다.",
    resultAngle: "고객별로 주문 존재 여부가 참이면 고객 행이 반환된다."
  },
  {
    topic: "스칼라 서브쿼리",
    difficulty: "중간",
    scenario: "고객별 마지막 주문일을 SELECT 절에 표시한다.",
    code: "SELECT c.cust_id,\n       (SELECT MAX(o.order_dt) FROM orders o WHERE o.cust_id = c.cust_id) last_order_dt\nFROM customers c;",
    correctRule: "스칼라 서브쿼리는 하나의 행에 하나의 값을 반환해야 한다.",
    fix: "대량 반복 비용이 크면 사전 집계 후 조인으로 바꿀 수 있다.",
    trap: "스칼라 서브쿼리는 여러 행과 여러 컬럼을 반환해도 자동으로 합쳐진다.",
    resultAngle: "고객별 마지막 주문일이 하나의 값으로 표시된다."
  },
  {
    topic: "UNION과 UNION ALL",
    difficulty: "기본",
    scenario: "두 결과 집합을 합치되 중복 제거가 필요 없다.",
    code: "SELECT cust_id FROM online_orders\nUNION ALL\nSELECT cust_id FROM store_orders;",
    correctRule: "UNION ALL은 중복 제거 없이 결과를 이어 붙인다.",
    fix: "중복 제거가 필요하면 UNION을, 필요 없으면 UNION ALL을 검토한다.",
    trap: "UNION ALL은 UNION보다 항상 더 엄격하게 중복을 제거한다.",
    resultAngle: "같은 고객번호가 양쪽에 있으면 중복 행이 남을 수 있다."
  },
  {
    topic: "INTERSECT",
    difficulty: "중간",
    scenario: "온라인과 매장 모두 구매한 고객을 찾는다.",
    code: "SELECT cust_id FROM online_orders\nINTERSECT\nSELECT cust_id FROM store_orders;",
    correctRule: "INTERSECT는 두 결과 집합에 공통으로 존재하는 행을 반환한다.",
    fix: "공통 집합을 구할 때 INTERSECT 또는 조인/EXISTS를 검토한다.",
    trap: "INTERSECT는 첫 번째 집합에서 두 번째 집합을 뺀 결과를 반환한다.",
    resultAngle: "온라인과 매장 양쪽에 모두 있는 고객만 반환된다."
  },
  {
    topic: "MINUS",
    difficulty: "중간",
    scenario: "온라인 구매자는 있지만 매장 구매자는 아닌 고객을 찾는다.",
    code: "SELECT cust_id FROM online_orders\nMINUS\nSELECT cust_id FROM store_orders;",
    correctRule: "MINUS는 첫 번째 결과 집합에서 두 번째 결과 집합을 제외한다.",
    fix: "차집합 요구라면 MINUS 또는 NOT EXISTS를 고려한다.",
    trap: "MINUS는 두 결과 집합의 공통 행만 반환한다.",
    resultAngle: "온라인 집합에만 존재하는 고객이 반환된다."
  },
  {
    topic: "ROLLUP",
    difficulty: "중간",
    scenario: "부서별, 전체 합계를 한 번에 구한다.",
    code: "SELECT deptno, SUM(sal)\nFROM emp\nGROUP BY ROLLUP(deptno);",
    correctRule: "ROLLUP은 계층적 소계와 총계를 생성한다.",
    fix: "부분합과 총계가 필요하면 ROLLUP, CUBE, GROUPING SETS를 검토한다.",
    trap: "ROLLUP은 WHERE 절에서만 사용할 수 있는 행 필터 기능이다.",
    resultAngle: "부서별 합계와 전체 합계 행이 함께 나올 수 있다."
  },
  {
    topic: "CUBE",
    difficulty: "중간",
    scenario: "지역과 상품의 모든 조합별 소계를 구한다.",
    code: "SELECT region_cd, product_cd, SUM(amount)\nFROM sales\nGROUP BY CUBE(region_cd, product_cd);",
    correctRule: "CUBE는 지정 컬럼 조합의 가능한 모든 소계를 생성한다.",
    fix: "모든 차원의 소계가 필요하면 CUBE를 사용한다.",
    trap: "CUBE는 지정한 마지막 컬럼의 총계만 만든다.",
    resultAngle: "지역별, 상품별, 지역+상품별, 전체 합계가 가능하다."
  },
  {
    topic: "ROW_NUMBER",
    difficulty: "중간",
    scenario: "고객별 최신 주문 1건만 뽑는다.",
    code: "SELECT *\nFROM (\n  SELECT o.*, ROW_NUMBER() OVER(PARTITION BY cust_id ORDER BY order_dt DESC, order_id DESC) rn\n  FROM orders o\n) x\nWHERE rn = 1;",
    correctRule: "ROW_NUMBER는 파티션 내에서 고유한 순번을 부여한다.",
    fix: "윈도우 함수 결과는 바깥 SELECT에서 필터링한다.",
    trap: "ROW_NUMBER는 동순위가 있으면 같은 순번을 부여한다.",
    resultAngle: "고객별 정렬 기준상 첫 번째 주문만 남는다."
  },
  {
    topic: "RANK와 DENSE_RANK",
    difficulty: "중간",
    scenario: "동점자를 포함한 매출 순위를 계산한다.",
    code: "SELECT empno, RANK() OVER(ORDER BY sales_amt DESC) rnk\nFROM sales_emp;",
    correctRule: "RANK는 동순위 다음 순위를 건너뛴다.",
    fix: "연속 순위가 필요하면 DENSE_RANK를 사용한다.",
    trap: "RANK와 DENSE_RANK는 모든 경우에 완전히 같은 결과를 만든다.",
    resultAngle: "1등이 2명이면 다음 순위는 3등이 될 수 있다."
  },
  {
    topic: "Top-N",
    difficulty: "실전",
    scenario: "Oracle에서 정렬 후 상위 10건을 구한다.",
    code: "SELECT *\nFROM (SELECT * FROM emp ORDER BY sal DESC)\nWHERE ROWNUM <= 10;",
    correctRule: "Oracle ROWNUM은 정렬 인라인 뷰 바깥에서 제한해야 의도한 Top-N이 된다.",
    fix: "정렬을 먼저 수행한 인라인 뷰 외부에서 ROWNUM 조건을 적용한다.",
    trap: "WHERE ROWNUM <= 10 ORDER BY sal DESC는 항상 급여 상위 10명을 보장한다.",
    resultAngle: "급여 내림차순 정렬 결과 중 상위 10행이 반환된다."
  },
  {
    topic: "계층형 질의",
    difficulty: "중간",
    scenario: "조직도처럼 관리자-직원 관계를 단계별로 조회한다.",
    code: "SELECT empno, mgr, LEVEL\nFROM emp\nSTART WITH mgr IS NULL\nCONNECT BY PRIOR empno = mgr;",
    correctRule: "계층형 질의는 부모-자식 관계를 따라 행을 전개한다.",
    fix: "루트 조건과 부모-자식 연결 조건을 명확히 작성한다.",
    trap: "CONNECT BY는 집계 함수가 있을 때만 사용할 수 있다.",
    resultAngle: "최상위 관리자부터 하위 직원 방향으로 계층이 전개된다."
  },
  {
    topic: "셀프 조인",
    difficulty: "기본",
    scenario: "사원과 관리자의 이름을 같은 테이블에서 조회한다.",
    code: "SELECT e.ename, m.ename AS mgr_name\nFROM emp e LEFT JOIN emp m ON m.empno = e.mgr;",
    correctRule: "셀프 조인은 같은 테이블을 서로 다른 별칭으로 참조한다.",
    fix: "각 역할에 맞는 별칭을 사용해 조인 조건을 명확히 한다.",
    trap: "같은 테이블은 자기 자신과 조인할 수 없다.",
    resultAngle: "관리자가 없는 사원도 LEFT JOIN이면 보존될 수 있다."
  },
  {
    topic: "PIVOT",
    difficulty: "중간",
    scenario: "월별 매출 행을 월 컬럼 형태로 보여준다.",
    code: "SELECT *\nFROM sales\nPIVOT (SUM(amount) FOR sales_month IN ('01' AS m01, '02' AS m02));",
    correctRule: "PIVOT은 행 값을 열 방향으로 회전해 집계 결과를 표현한다.",
    fix: "행 값을 컬럼으로 펼칠 때 PIVOT을 검토한다.",
    trap: "PIVOT은 컬럼을 행으로 내리는 기능만 수행한다.",
    resultAngle: "월 값이 m01, m02 같은 컬럼으로 표현된다."
  },
  {
    topic: "UNPIVOT",
    difficulty: "중간",
    scenario: "월별 컬럼을 행 형태로 변환한다.",
    code: "SELECT product_id, sales_month, amount\nFROM monthly_sales\nUNPIVOT (amount FOR sales_month IN (m01, m02, m03));",
    correctRule: "UNPIVOT은 여러 컬럼을 행 값으로 변환한다.",
    fix: "컬럼으로 퍼진 값을 분석용 행 구조로 바꿀 때 UNPIVOT을 사용한다.",
    trap: "UNPIVOT은 행 값을 열 방향으로 펼치는 기능이다.",
    resultAngle: "m01, m02, m03 컬럼 값이 sales_month 행 값으로 내려간다."
  },
  {
    topic: "정규표현식",
    difficulty: "중간",
    scenario: "전화번호 형식이 맞는 행만 찾는다.",
    code: "SELECT phone_no\nFROM customers\nWHERE REGEXP_LIKE(phone_no, '^010-[0-9]{4}-[0-9]{4}$');",
    correctRule: "정규표현식 함수는 문자열 패턴을 조건으로 검사할 수 있다.",
    fix: "형식 검증에는 REGEXP_LIKE 같은 패턴 조건을 사용할 수 있다.",
    trap: "정규표현식은 숫자 컬럼의 합계를 구할 때만 사용한다.",
    resultAngle: "010-0000-0000 형태와 맞는 전화번호만 남는다."
  },
  {
    topic: "DML",
    difficulty: "기본",
    scenario: "고객 등급을 갱신한다.",
    code: "UPDATE customers\nSET grade_cd = 'VIP'\nWHERE total_amt >= 1000000;",
    correctRule: "UPDATE는 테이블의 기존 행 값을 변경하는 DML이다.",
    fix: "변경 대상 조건을 WHERE 절에 명확히 작성한다.",
    trap: "UPDATE는 테이블 구조를 변경하는 DDL이다.",
    resultAngle: "조건을 만족하는 고객의 등급 값이 변경된다."
  },
  {
    topic: "TCL",
    difficulty: "기본",
    scenario: "작업 결과를 확정하거나 취소한다.",
    code: "COMMIT;\nROLLBACK;",
    correctRule: "COMMIT과 ROLLBACK은 트랜잭션을 제어하는 TCL이다.",
    fix: "논리적 작업 단위를 완료했을 때 COMMIT, 취소할 때 ROLLBACK을 사용한다.",
    trap: "COMMIT은 테이블 컬럼을 추가하는 DDL이다.",
    resultAngle: "COMMIT은 변경을 확정하고 ROLLBACK은 미확정 변경을 취소한다."
  },
  {
    topic: "DDL과 DCL",
    difficulty: "기본",
    scenario: "테이블을 만들고 권한을 부여한다.",
    code: "CREATE TABLE t1(id NUMBER);\nGRANT SELECT ON t1 TO user_a;",
    correctRule: "CREATE는 DDL, GRANT는 DCL에 해당한다.",
    fix: "구조 정의와 권한 제어 명령을 구분한다.",
    trap: "GRANT는 데이터를 조회하는 DML이다.",
    resultAngle: "테이블 구조가 생성되고 조회 권한이 부여된다."
  }
];

const tuningSpecs: TuningSpec[] = [
  {
    topic: "SQL 처리 과정",
    difficulty: "기본",
    scenario: "같은 SQL을 반복 수행하는데 하드 파싱이 많이 발생한다.",
    code: "SELECT * FROM orders WHERE order_id = 1001;\nSELECT * FROM orders WHERE order_id = 1002;",
    correctRule: "SQL 파싱과 공유를 고려하려면 바인드 변수 사용과 SQL 텍스트 동일성이 중요하다.",
    fix: "리터럴을 바인드 변수로 바꿔 SQL 공유 가능성을 높인다.",
    trap: "리터럴 값만 다르면 DBMS는 항상 같은 SQL로 공유한다.",
    planAngle: "하드 파싱이 줄면 파싱 CPU와 라이브러리 캐시 경합을 줄일 수 있다."
  },
  {
    topic: "데이터베이스 I/O",
    difficulty: "중간",
    scenario: "소량 결과를 얻기 위해 많은 블록을 읽는다.",
    code: "Rows=10  Buffers=85000",
    correctRule: "튜닝에서는 반환 행 수뿐 아니라 읽은 블록 수와 접근 경로를 함께 본다.",
    fix: "불필요한 테이블 액세스와 비효율 인덱스 스캔을 줄인다.",
    trap: "결과가 10건이면 읽은 블록 수와 무관하게 항상 효율적이다.",
    planAngle: "Buffers가 크면 I/O 비효율이 숨어 있을 수 있다."
  },
  {
    topic: "실행계획 읽기",
    difficulty: "기본",
    scenario: "실행계획에서 Rows와 Predicate Information을 확인한다.",
    code: "--------------------------------------------------------------------------------\n| Id | Operation                   | Name          | Rows |\n|  1 | TABLE ACCESS BY INDEX ROWID | ORDERS        |   10 |\n|* 2 | INDEX RANGE SCAN            | IDX_ORDERS_01 |   10 |\n--------------------------------------------------------------------------------",
    correctRule: "Operation 이름뿐 아니라 Rows, Predicate, Starts를 함께 해석해야 한다.",
    fix: "Predicate Information에서 access 조건과 filter 조건을 분리해 본다.",
    trap: "실행계획의 첫 줄 Operation만 보면 튜닝 판단이 충분하다.",
    planAngle: "인덱스 스캔이 보이더라도 실제 탐색 범위와 테이블 액세스 비용을 확인해야 한다."
  },
  {
    topic: "Access Predicate와 Filter Predicate",
    difficulty: "실전",
    scenario: "인덱스 스캔은 보이지만 읽은 범위가 크다.",
    code: "access(\"CUST_ID\"=:B1)\nfilter(TO_CHAR(\"ORDER_DT\",'YYYYMM')=:B2)",
    correctRule: "access 조건은 탐색 범위를 줄이고 filter 조건은 읽은 뒤 걸러내는 조건이다.",
    fix: "ORDER_DT를 함수로 감싸지 않는 범위 조건으로 바꾼다.",
    trap: "filter 조건도 항상 인덱스 탐색 범위를 줄인다.",
    planAngle: "CUST_ID만 access이고 ORDER_DT는 filter라면 인덱스 효율이 낮을 수 있다."
  },
  {
    topic: "SARGable 조건",
    difficulty: "실전",
    scenario: "주문월 조건 때문에 주문일 인덱스를 잘 쓰지 못한다.",
    code: "WHERE TO_CHAR(order_dt, 'YYYYMM') = '202608'",
    correctRule: "컬럼을 함수로 가공하면 일반 인덱스의 range scan 조건이 되기 어렵다.",
    fix: "order_dt >= DATE '2026-08-01' AND order_dt < DATE '2026-09-01'로 작성한다.",
    trap: "컬럼에 함수를 적용할수록 일반 B-Tree 인덱스 접근이 항상 빨라진다.",
    planAngle: "날짜 범위 조건은 파티션 프루닝과 인덱스 range scan 가능성을 높인다."
  },
  {
    topic: "복합 인덱스",
    difficulty: "중간",
    scenario: "인덱스 IDX_ORD_01(cust_id, order_dt)가 있다.",
    code: "WHERE cust_id = :b1\n  AND order_dt >= :b2",
    correctRule: "복합 인덱스는 선두 컬럼과 조건 형태가 탐색 효율을 좌우한다.",
    fix: "선두 컬럼 동등 조건과 후속 컬럼 범위 조건을 활용한다.",
    trap: "복합 인덱스는 어떤 후행 컬럼 조건만 있어도 항상 동일하게 효율적이다.",
    planAngle: "cust_id 동등 조건으로 범위를 줄이고 order_dt 범위 탐색이 가능하다."
  },
  {
    topic: "인덱스 스킵 스캔",
    difficulty: "실전",
    scenario: "복합 인덱스 선두 컬럼 조건이 없지만 선두 컬럼 distinct 값이 적다.",
    code: "INDEX IDX_EMP(gender, emp_no)\nWHERE emp_no = :b1",
    correctRule: "Skip Scan은 선두 컬럼을 건너뛰듯 탐색할 수 있지만 조건과 분포에 영향을 받는다.",
    fix: "선두 컬럼 distinct 값과 후행 조건 선택도를 보고 인덱스 재설계를 검토한다.",
    trap: "Skip Scan은 항상 선두 컬럼 동등 조건보다 빠르다.",
    planAngle: "선두 컬럼 분포가 나쁘면 Skip Scan 비용이 커질 수 있다."
  },
  {
    topic: "함수 기반 인덱스",
    difficulty: "중간",
    scenario: "대소문자 무시 이름 검색이 매우 많다.",
    code: "WHERE UPPER(customer_name) = UPPER(:name)",
    correctRule: "함수 기반 인덱스는 함수 표현식 조건을 인덱스로 지원할 수 있다.",
    fix: "UPPER(customer_name) 표현식 기반 인덱스를 검토한다.",
    trap: "함수 기반 인덱스는 어떤 함수 조건에도 자동으로 적용된다.",
    planAngle: "쿼리 표현식과 인덱스 표현식이 맞아야 활용 가능성이 높다."
  },
  {
    topic: "클러스터링 팩터",
    difficulty: "실전",
    scenario: "인덱스를 탔는데 테이블 랜덤 액세스가 많아 느리다.",
    code: "INDEX RANGE SCAN -> TABLE ACCESS BY INDEX ROWID\nRows=50000 Buffers=300000",
    correctRule: "클러스터링 팩터가 나쁘면 인덱스 경유 테이블 액세스 비용이 커질 수 있다.",
    fix: "조회 범위, 정렬 상태, 테이블 액세스량을 보고 인덱스/저장 구조를 검토한다.",
    trap: "인덱스만 사용하면 테이블 액세스 비용은 항상 0이다.",
    planAngle: "많은 ROWID 랜덤 액세스는 인덱스 사용이 오히려 불리할 수 있음을 뜻한다."
  },
  {
    topic: "NL 조인",
    difficulty: "중간",
    scenario: "선행 집합은 작고 후행 테이블 조인 컬럼에 선택도 좋은 인덱스가 있다.",
    code: "/*+ leading(c) use_nl(o) index(o idx_orders_01) */",
    correctRule: "Nested Loops는 선행 집합이 작고 후행 인덱스 탐색이 효율적일 때 유리하다.",
    fix: "선행 집합을 먼저 줄이고 후행 테이블에 적절한 인덱스를 사용한다.",
    trap: "대용량 두 테이블을 조인할 때 NL 조인은 항상 Hash Join보다 빠르다.",
    planAngle: "선행 행마다 후행 인덱스를 반복 탐색하므로 반복 횟수가 핵심이다."
  },
  {
    topic: "Hash Join",
    difficulty: "중간",
    scenario: "대량 주문과 주문상세를 동등 조건으로 조인한다.",
    code: "/*+ use_hash(oi) */\norders o JOIN order_items oi ON oi.order_id = o.order_id",
    correctRule: "Hash Join은 대량 동등 조인에서 유리할 수 있다.",
    fix: "작은 집합을 build input으로 삼고 메모리 사용량을 확인한다.",
    trap: "Hash Join은 비동등 조인에서만 사용할 수 있다.",
    planAngle: "Build input 크기와 해시 영역 메모리가 성능에 영향을 준다."
  },
  {
    topic: "Sort Merge Join",
    difficulty: "중간",
    scenario: "조인 양쪽이 이미 정렬되어 있거나 비동등 조인을 검토한다.",
    code: "MERGE JOIN\nSORT JOIN\nSORT JOIN",
    correctRule: "Sort Merge Join은 양쪽을 정렬한 뒤 병합하는 조인 방식이다.",
    fix: "정렬 비용과 조인 조건 형태를 보고 NL/Hash와 비교한다.",
    trap: "Sort Merge Join은 정렬이 전혀 필요 없는 조인 방식이다.",
    planAngle: "정렬된 결과를 병합하므로 정렬 비용과 입력 크기가 중요하다."
  },
  {
    topic: "조인 순서",
    difficulty: "실전",
    scenario: "세 테이블 조인에서 선택도가 높은 고객 필터가 있다.",
    code: "customers c JOIN orders o JOIN order_items oi\nWHERE c.region_cd = :region",
    correctRule: "선택도가 높은 조건으로 선행 집합을 줄이면 조인 비용을 낮출 수 있다.",
    fix: "LEADING 힌트나 SQL 구조로 선행 집합 축소 의도를 표현한다.",
    trap: "조인 순서는 FROM 절에 적힌 순서와 항상 동일하게 고정된다.",
    planAngle: "선행 집합 크기가 후속 조인 반복 횟수와 해시 입력 크기를 좌우한다."
  },
  {
    topic: "스칼라 서브쿼리 튜닝",
    difficulty: "실전",
    scenario: "고객 행마다 마지막 결제일을 반복 조회한다.",
    code: "SELECT c.cust_id,\n       (SELECT MAX(pay_dt) FROM payments p WHERE p.cust_id = c.cust_id)\nFROM customers c",
    correctRule: "스칼라 서브쿼리는 반복 수행 비용이 커질 수 있어 집계 조인으로 바꿔 검토한다.",
    fix: "payments를 cust_id별로 사전 집계한 뒤 customers와 조인한다.",
    trap: "SELECT 절 스칼라 서브쿼리는 데이터량과 무관하게 항상 한 번만 실행된다.",
    planAngle: "Starts가 고객 행 수만큼 증가한다면 반복 수행 비용을 의심한다."
  },
  {
    topic: "통계정보",
    difficulty: "실전",
    scenario: "예상 Rows와 실제 A-Rows 차이가 매우 크다.",
    code: "E-Rows=10  A-Rows=150000",
    correctRule: "통계정보와 히스토그램은 카디널리티 추정과 조인 순서에 영향을 준다.",
    fix: "최신 통계, 히스토그램, 데이터 편중, 바인드 값 분포를 확인한다.",
    trap: "옵티마이저는 통계가 없어도 실제 행 수를 항상 미리 정확히 안다.",
    planAngle: "예상과 실제 차이가 크면 잘못된 조인 방식이나 접근 경로가 선택될 수 있다."
  },
  {
    topic: "히스토그램",
    difficulty: "실전",
    scenario: "상태코드 값이 일부 값에 심하게 몰려 있다.",
    code: "WHERE status_cd = :status",
    correctRule: "데이터 분포가 치우친 컬럼은 히스토그램이 선택도 추정에 도움을 줄 수 있다.",
    fix: "편중 컬럼의 히스토그램 필요성과 바인드 변수 영향을 검토한다.",
    trap: "히스토그램은 모든 컬럼에 많을수록 항상 좋고 부작용이 없다.",
    planAngle: "인기 값과 비인기 값에 따라 다른 실행계획이 유리할 수 있다."
  },
  {
    topic: "바인드 변수와 공유",
    difficulty: "중간",
    scenario: "리터럴 SQL이 매우 많이 생성된다.",
    code: "WHERE cust_id = 101\nWHERE cust_id = 102\nWHERE cust_id = 103",
    correctRule: "바인드 변수는 SQL 공유를 높여 파싱 비용을 줄일 수 있다.",
    fix: "반복 실행되는 조건 값을 바인드 변수로 처리한다.",
    trap: "바인드 변수는 SQL 공유와 전혀 관련이 없다.",
    planAngle: "공유 커서가 늘면 하드 파싱과 라이브러리 캐시 부담이 줄 수 있다."
  },
  {
    topic: "쿼리 변환",
    difficulty: "실전",
    scenario: "옵티마이저가 SQL을 내부적으로 다른 형태로 변환한다.",
    code: "View Merging / Subquery Unnesting / Predicate Pushdown",
    correctRule: "쿼리 변환은 결과를 유지하면서 더 나은 실행계획 후보를 만들기 위한 과정이다.",
    fix: "변환이 불리하면 NO_MERGE, NO_UNNEST 등 제어 힌트를 검토한다.",
    trap: "쿼리 변환은 항상 결과를 바꾸므로 사용되면 안 된다.",
    planAngle: "작성한 SQL 모양과 실제 실행계획의 로우 소스가 다를 수 있다."
  },
  {
    topic: "뷰 머징",
    difficulty: "실전",
    scenario: "인라인 뷰에서 먼저 집계한 뒤 조인해야 한다.",
    code: "SELECT /*+ no_merge(s) */ *\nFROM (SELECT product_id, SUM(amount) amt FROM sales GROUP BY product_id) s\nJOIN products p ON p.product_id = s.product_id",
    correctRule: "NO_MERGE는 인라인 뷰 병합을 막아 선집계 의도를 보존할 때 검토한다.",
    fix: "집계 결과 보존이 중요하면 쿼리 블록 별칭과 함께 NO_MERGE를 사용한다.",
    trap: "인라인 뷰는 어떤 경우에도 반드시 물리적으로 먼저 실행된다.",
    planAngle: "뷰 머징 여부에 따라 집계 시점과 조인 대상 행 수가 달라질 수 있다."
  },
  {
    topic: "서브쿼리 Unnesting",
    difficulty: "실전",
    scenario: "EXISTS 서브쿼리가 조인 형태로 변환될 수 있다.",
    code: "WHERE EXISTS (SELECT 1 FROM orders o WHERE o.cust_id = c.cust_id)",
    correctRule: "Unnesting은 서브쿼리를 조인 형태로 풀어 실행계획 후보를 넓힌다.",
    fix: "변환 결과와 원래 의미가 맞는지 확인하고 필요 시 힌트로 제어한다.",
    trap: "EXISTS 서브쿼리는 절대 조인 방식으로 최적화될 수 없다.",
    planAngle: "SEMI JOIN 형태로 보이면 존재 여부 판단이 조인으로 처리된 것이다."
  },
  {
    topic: "Predicate Pushdown",
    difficulty: "실전",
    scenario: "뷰 바깥 조건을 뷰 내부로 밀어 넣을 수 있다.",
    code: "SELECT * FROM (SELECT * FROM orders) v WHERE v.order_dt >= :dt",
    correctRule: "Predicate Pushdown은 조건을 더 이른 단계에 적용해 처리량을 줄일 수 있다.",
    fix: "조건이 내부 집합을 줄일 수 있는지 실행계획에서 확인한다.",
    trap: "조건은 항상 최종 SELECT 단계에서만 적용된다.",
    planAngle: "조건이 내부 테이블 액세스 단계에 적용되면 읽는 범위가 줄 수 있다."
  },
  {
    topic: "파티션 프루닝",
    difficulty: "실전",
    scenario: "주문일 기준 RANGE 파티션 테이블에서 특정 월만 조회한다.",
    code: "WHERE order_dt >= DATE '2026-08-01'\n  AND order_dt < DATE '2026-09-01'",
    correctRule: "파티션 키 조건이 명확하면 필요한 파티션만 읽는 프루닝이 가능하다.",
    fix: "파티션 키를 함수로 감싸지 않는 범위 조건을 사용한다.",
    trap: "파티션 테이블은 조건과 무관하게 항상 모든 파티션을 읽는다.",
    planAngle: "Pstart/Pstop 또는 partition range 정보로 프루닝 여부를 확인한다."
  },
  {
    topic: "OR Expansion",
    difficulty: "실전",
    scenario: "서로 다른 컬럼의 OR 조건 때문에 인덱스 활용이 애매하다.",
    code: "WHERE status_cd = :status OR channel_cd = :channel",
    correctRule: "OR 조건은 분기별 인덱스 활용을 위해 UNION ALL 분해를 검토할 수 있다.",
    fix: "분기 조건이 중복을 만들지 않도록 배타 조건을 추가해 UNION ALL로 나눈다.",
    trap: "OR 조건은 어떤 경우에도 인덱스를 사용할 수 없다.",
    planAngle: "분기마다 다른 access path를 선택할 수 있으면 비용이 줄 수 있다."
  },
  {
    topic: "Top-N 튜닝",
    difficulty: "실전",
    scenario: "최신 주문 20건만 자주 조회한다.",
    code: "WHERE status_cd = 'PAID'\nORDER BY order_dt DESC, order_id DESC\nFETCH FIRST 20 ROWS ONLY",
    correctRule: "Top-N은 필터 조건과 정렬 컬럼을 함께 고려한 인덱스 설계가 중요하다.",
    fix: "status_cd, order_dt, order_id 순서 등 조건과 정렬을 만족하는 인덱스를 검토한다.",
    trap: "Top-N은 20건만 보므로 인덱스나 정렬 비용을 전혀 고려하지 않아도 된다.",
    planAngle: "STOPKEY와 정렬 생략 가능성은 실행계획에서 중요한 판단 포인트다."
  },
  {
    topic: "소트 튜닝",
    difficulty: "중간",
    scenario: "대량 ORDER BY와 GROUP BY로 TEMP 사용량이 크다.",
    code: "SORT ORDER BY\nTEMP 8GB",
    correctRule: "정렬은 메모리와 TEMP 사용량에 영향을 주므로 입력량 축소와 인덱스 정렬을 검토한다.",
    fix: "필터링을 먼저 강화하고 정렬 컬럼 인덱스 또는 집계 방식 변경을 검토한다.",
    trap: "SORT 작업은 항상 CPU만 사용하고 TEMP I/O와 무관하다.",
    planAngle: "TEMP 사용이 크면 대량 정렬이 병목일 수 있다."
  },
  {
    topic: "DML 튜닝",
    difficulty: "실전",
    scenario: "대량 UPDATE가 오래 걸리고 인덱스가 매우 많다.",
    code: "UPDATE order_items SET status_cd = 'C' WHERE order_dt < :dt",
    correctRule: "대량 DML은 인덱스 유지 비용, 로그, 락, 커밋 단위를 함께 고려한다.",
    fix: "처리 범위 분할, 불필요 인덱스 점검, 배치 커밋 전략을 검토한다.",
    trap: "인덱스가 많을수록 대량 UPDATE는 항상 더 빨라진다.",
    planAngle: "변경 행 수와 인덱스 유지 비용이 전체 수행 시간에 크게 작용한다."
  },
  {
    topic: "Lock",
    difficulty: "중간",
    scenario: "동시에 같은 주문 행을 갱신하려는 세션들이 대기한다.",
    code: "UPDATE orders SET status_cd = 'PAID' WHERE order_id = :id",
    correctRule: "Lock은 동시 변경에서 데이터 정합성을 보장하지만 대기와 경합을 만들 수 있다.",
    fix: "트랜잭션 범위를 줄이고 필요한 순서로 일관되게 자원을 접근한다.",
    trap: "트랜잭션이 길어도 Lock 경합은 절대 발생하지 않는다.",
    planAngle: "대기 이벤트와 블로킹 세션을 함께 확인해야 원인을 좁힐 수 있다."
  },
  {
    topic: "트랜잭션 동시성",
    difficulty: "실전",
    scenario: "재고 차감과 주문 확정을 동시에 처리한다.",
    code: "UPDATE stock SET qty = qty - :order_qty WHERE product_id = :pid",
    correctRule: "동시성 제어는 정합성, 격리 수준, 락 범위, 트랜잭션 길이를 함께 다룬다.",
    fix: "재고 검증과 차감을 하나의 일관된 트랜잭션으로 설계한다.",
    trap: "동시성 문제는 SELECT 문만 사용하면 언제나 자동으로 해결된다.",
    planAngle: "정합성 보장과 대기 최소화 사이의 균형을 검토해야 한다."
  },
  {
    topic: "Call 최소화",
    difficulty: "실전",
    scenario: "애플리케이션이 고객 1명마다 주문 조회 SQL을 반복 호출한다.",
    code: "for each customer:\n  SELECT * FROM orders WHERE cust_id = :cust_id",
    correctRule: "데이터베이스 Call이 많으면 네트워크 왕복과 반복 파싱/실행 비용이 커진다.",
    fix: "집합 기반 SQL로 한 번에 필요한 고객의 주문을 조회한다.",
    trap: "SQL을 여러 번 잘게 호출하면 항상 집합 SQL보다 빠르다.",
    planAngle: "실행계획이 좋아도 호출 횟수가 많으면 전체 응답 시간이 나빠질 수 있다."
  },
  {
    topic: "대용량 배치",
    difficulty: "실전",
    scenario: "야간 배치가 제한 시간 안에 끝나지 않는다.",
    code: "INSERT INTO summary_table\nSELECT ... FROM large_sales GROUP BY ...",
    correctRule: "대용량 배치는 처리 범위, 병렬, 파티션, 로그, 커밋 전략을 함께 검토한다.",
    fix: "파티션 단위 처리, 병렬 처리 가능성, 중간 집계 전략을 검토한다.",
    trap: "대용량 배치는 SQL 하나만 짧게 쓰면 항상 빨라진다.",
    planAngle: "스캔량, 정렬/해시 작업, TEMP, 병렬 분배가 핵심 병목이 될 수 있다."
  },
  {
    topic: "힌트 충돌",
    difficulty: "실전",
    scenario: "NL 조인을 의도하면서 후행 테이블 FULL 스캔을 강제했다.",
    code: "/*+ USE_NL(o) FULL(o) */",
    correctRule: "힌트는 조인 방식, 조인 순서, 접근 경로가 서로 모순되지 않아야 한다.",
    fix: "후행 테이블에는 조인 키 인덱스 사용 의도를 명확히 작성한다.",
    trap: "서로 충돌하는 힌트를 많이 넣을수록 목표 실행계획이 안정된다.",
    planAngle: "NL 후행 테이블 FULL 스캔은 반복 FULL SCAN으로 이어질 수 있다."
  },
  {
    topic: "실제 실행 통계",
    difficulty: "실전",
    scenario: "예상 실행계획과 실제 수행 결과가 다르다.",
    code: "Starts=10000  A-Rows=10000  Buffers=500000",
    correctRule: "실제 실행 통계는 Starts, A-Rows, Buffers를 함께 봐야 한다.",
    fix: "반복 수행이 많은 로우 소스와 버퍼 사용량이 큰 지점을 우선 확인한다.",
    trap: "예상 실행계획만 있으면 실제 실행 통계는 볼 필요가 없다.",
    planAngle: "Starts가 큰 단계는 반복 호출 비용의 원인일 수 있다."
  }
];

function modelingConceptPoints(spec: ModelSpec) {
  return [
    `핵심 정의: ${spec.correctRule}`,
    `지문 읽기: ${spec.scenario}`,
    "판단 순서: 업무에서 독립적으로 관리되는 집합인지, 반복 발생하는지, 식별 가능한지 먼저 본다.",
    "모델링 연결: 엔터티, 속성, 관계, 식별자를 분리해서 읽으면 정규화와 조인 경로가 함께 보인다.",
    `SQL 연결: ${spec.sqlAngle}`,
    "실전 체크: 선택 관계는 OUTER JOIN 필요 여부, 필수 관계는 INNER JOIN 가능 여부와 연결된다.",
    "복습 포인트: 주식별자는 유일성, 최소성, 안정성, 존재성을 함께 확인하고 변경 가능성이 큰 업무번호는 조심한다.",
    `함정: ${spec.trap}`
  ];
}

function sqlConceptPoints(spec: SqlSpec) {
  return [
    `핵심 규칙: ${spec.correctRule}`,
    `예제 상황: ${spec.scenario}`,
    `SQL 작성 방향: ${spec.fix}`,
    `결과 판단: ${spec.resultAngle}`,
    "지문 읽기: SELECT 결과 건수, NULL 포함 여부, 조건 위치, 정렬 기준, 중복 제거 여부를 먼저 표시한다.",
    "객관식 포인트: 표가 나오면 조건 적용 전후의 행 수를 직접 세고, 코드가 나오면 논리 처리 순서대로 해석한다.",
    "Oracle 관점: NULL 비교, OUTER JOIN 조건 위치, ROWNUM/ROW_NUMBER 차이, 계층형 질의 처리 순서를 특히 조심한다.",
    `함정: ${spec.trap}`
  ];
}

function tuningConceptPoints(spec: TuningSpec) {
  return [
    `핵심 원리: ${spec.correctRule}`,
    `상황: ${spec.scenario}`,
    `개선 방향: ${spec.fix}`,
    `실행계획 관점: ${spec.planAngle}`,
    "읽는 순서: 조인 순서, 접근 방법, Access Predicate와 Filter Predicate, 예상 Rows와 실제 Rows 차이를 함께 본다.",
    "인덱스 체크: 선두 컬럼, 조건 연산자, 범위 조건 이후 컬럼 활용도, 클러스터링 팩터, 테이블 액세스 횟수를 확인한다.",
    "힌트 체크: LEADING, USE_NL, USE_HASH, INDEX, NO_MERGE 같은 힌트가 서로 같은 실행계획을 가리키는지 확인한다.",
    "실기 체크: 요구사항을 만족한 상태에서 실행계획 의도를 SQL에 표현해야 하며, 결과가 달라지는 튜닝은 정답이 아니다.",
    `함정: ${spec.trap}`
  ];
}

const modeling: SubjectConfig<ModelSpec> = {
  id: "modeling",
  name: "1과목 데이터 모델링의 이해",
  articleCategory: "1과목 데이터 모델링",
  specs: modelingSpecs,
  drafts: modelDrafts,
  article: (spec) => ({
    id: `concept-modeling-${spec.topic.replace(/\s+/g, "-")}`,
    subjectId: "modeling",
    subjectName: "1과목 데이터 모델링의 이해",
    majorTopic: spec.topic,
    detailTopic: spec.topic,
    category: `1과목 데이터 모델링 > ${spec.topic}`,
    title: spec.topic,
    summary: spec.scenario,
    keyPoints: modelingConceptPoints(spec),
    examTrap: spec.trap,
    oracleAngle: spec.sqlAngle
  })
};

const sqlBasic: SubjectConfig<SqlSpec> = {
  id: "sql-basic",
  name: "2과목 SQL 기본 및 활용",
  articleCategory: "2과목 SQL 기본 및 활용",
  specs: sqlSpecs,
  drafts: sqlDrafts,
  article: (spec) => ({
    id: `concept-sql-${spec.topic.replace(/\s+/g, "-")}`,
    subjectId: "sql-basic",
    subjectName: "2과목 SQL 기본 및 활용",
    majorTopic: spec.topic,
    detailTopic: spec.topic,
    category: `2과목 SQL 기본 및 활용 > ${spec.topic}`,
    title: spec.topic,
    summary: spec.scenario,
    keyPoints: sqlConceptPoints(spec),
    examTrap: spec.trap
  })
};

const tuning: SubjectConfig<TuningSpec> = {
  id: "tuning",
  name: "3과목 SQL 고급활용 및 튜닝",
  articleCategory: "3과목 SQL 고급활용 및 튜닝",
  specs: tuningSpecs,
  drafts: tuningDrafts,
  article: (spec) => ({
    id: `concept-tuning-${spec.topic.replace(/\s+/g, "-")}`,
    subjectId: "tuning",
    subjectName: "3과목 SQL 고급활용 및 튜닝",
    majorTopic: spec.topic,
    detailTopic: spec.topic,
    category: `3과목 SQL 고급활용 및 튜닝 > ${spec.topic}`,
    title: spec.topic,
    summary: spec.scenario,
    keyPoints: tuningConceptPoints(spec),
    examTrap: spec.trap,
    oracleAngle: spec.planAngle
  })
};

const configs = [modeling, sqlBasic, tuning] as const;

export const subjects = configs.map((config) => ({ id: config.id, name: config.name }));

export const objectiveQuestions: ObjectiveQuestion[] = [
  ...buildSubject(modeling, 100),
  ...buildSubject(sqlBasic, 100),
  ...buildSubject(tuning, 100)
];

export { conceptArticles } from "./concepts";

type LabCase = Omit<LabQuestion, "id" | "number" | "schemaSql" | "seedSql">;

type LabEnvironment = Pick<LabQuestion, "schemaSql" | "seedSql">;

const sqlpLabSchema = `공통 실습 모델

[업무 테이블]
customers(cust_id PK, cust_name, grade_cd, region_cd, created_at)
orders(order_id PK, cust_id FK, order_dt, status_cd, channel_cd, delivery_id, amount)
order_items(order_id FK, item_id, product_id FK, qty, sale_amt)
products(product_id PK, category_cd, product_name, active_yn)
product_history(product_id, start_dt, end_dt, event_cd, unit_price)
deliveries(delivery_id PK, delivery_status_cd)
payments(payment_id PK, order_id FK, pay_dt, pay_amt, pay_method)

[복기형 실행계획 연습 테이블]
t1(dt, id, cd, v1)          -- 월 파티션 대상 테이블이라고 가정
t2(dt, id, cd, v1)          -- 변경분 또는 비교 대상
t3(id, nm)                  -- 최종 명칭 조회 테이블
t4(id, nm)                  -- 존재 여부 확인용 테이블
emp(empno, deptno, hire_dt, job_cd, sal, region_cd)
emp_part(dt, empno, deptno, job_cd, sal)

[주요 인덱스 후보]
idx_orders_cust_dt(cust_id, order_dt desc)
idx_orders_dt_status(order_dt, status_cd)
idx_order_items_order_product(order_id, product_id)
idx_product_history_period(product_id, start_dt, end_dt)
idx_payments_order_dt(order_id, pay_dt)
t1_pk(dt, id), t2_pk(dt, id), t3_pk(id), t4_pk(id)
emp_x01(deptno, hire_dt), emp_part_x2(job_cd), emp_part_x4(empno)`;

const sqlpLabSeed = `작성 규칙
- 실행은 PostgreSQL 기준 SELECT/WITH/EXPLAIN만 허용합니다.
- Oracle 힌트는 /*+ ... */ 주석으로 함께 적어도 됩니다.
- DDL, DML, 세미콜론, -- 주석은 실행 안전을 위해 차단됩니다.
- 파티션 exchange, direct path insert 같은 Oracle 전용 답안은 Oracle/SQLP 관점 해설에서 따로 정리합니다.`;

const commonOracleNotes = [
  "SQLP 실기형 답안은 결과가 먼저 맞아야 하고, 그 다음 실행계획 모양과 힌트 의도를 맞춥니다.",
  "힌트는 쿼리 블록과 테이블 별칭이 정확해야 적용됩니다. LEADING, USE_NL, USE_HASH, INDEX, NO_MERGE의 대상 별칭을 반드시 확인하세요.",
  "Access Predicate와 Filter Predicate를 나누어 설명하면 인덱스 효율을 훨씬 정확하게 판단할 수 있습니다."
];

const commonRubric = ["요구 결과 보존", "부분범위/집합처리 의도", "인덱스 접근 조건", "조인 순서와 방식", "Oracle 힌트 별칭 정확성"];

const labTraceProfiles = [
  {
    trace: `Oracle SQL Trace 목표 통계
Id Operation                         Name        Rows  Loop     PR     CR    time
 0 SELECT STATEMENT                               10     1       0     47   00:00:00.01
 1  TABLE ACCESS BY INDEX ROWID      T3          10    10       0     20   00:00:00.01
 2   INDEX UNIQUE SCAN               T3_PK       10    10       0     10   00:00:00.01
 3  COUNT STOPKEY                                10     1       0     27   00:00:00.01
 4   VIEW                                        20     1       0     27   00:00:00.01
 5    UNION-ALL                                  20     1       0     27   00:00:00.01
핵심: T1/T2 각 분기에서 먼저 10건으로 줄인 뒤 T3는 최종 10건에 대해서만 조회한다.`,
    predicate: `Predicate Information
 2 - access("T3"."ID"=:B1)
 6 - filter(ROWNUM<=10)
 9 - access("T1"."DT"=TRUNC(SYSDATE) AND "T1"."ID"="T4"."ID")
10 - access("T4"."ID"="T1"."ID")
11 - filter(ROWNUM<=10)
14 - access("T2"."DT"=TRUNC(SYSDATE) AND "T2"."ID"="T4"."ID")
15 - access("T4"."ID"="T2"."ID")`
  },
  {
    trace: `Oracle SQL Trace 목표 통계
Id Operation                         Name        Rows  Loop     PR     CR    time
 0 INSERT STATEMENT                              850     1      12    210   00:00:00.05
 1  LOAD TABLE CONVENTIONAL          T1_P202501 850     1      12    210   00:00:00.05
 2   NESTED LOOPS OUTER                          850     1      12    210   00:00:00.04
 3    PARTITION RANGE SINGLE         T1          900     1      10    160   00:00:00.03
 4     TABLE ACCESS FULL             T1          900     1      10    160   00:00:00.03
 5    TABLE ACCESS BY INDEX ROWID    T2          850   900       2     50   00:00:00.01
핵심: MERGE의 update/delete/insert를 그대로 수행하지 않고 보존/교체 집합을 만들어 EXCHANGE 대상으로 적재한다.`,
    predicate: `Predicate Information
 4 - filter("T1"."DT">=DATE '2025-01-01' AND "T1"."DT"<DATE '2025-02-01')
 6 - access("T2"."DT"="T1"."DT" AND "T2"."ID"="T1"."ID")
제약: T1_P202501은 T1 파티션과 컬럼 순서, 타입, nullable, check 조건이 교환 가능해야 한다.`
  },
  {
    trace: `Oracle SQL Trace 목표 통계
Id Operation                         Name                 Rows  Loop     PR     CR    time
 0 SELECT STATEMENT                                         10     1       0     55   00:00:00.01
 1  COUNT STOPKEY                                           10     1       0     55   00:00:00.01
 2   VIEW                                                   10     1       0     55   00:00:00.01
 3    NESTED LOOPS OUTER                                    10     1       0     55   00:00:00.01
 4     TABLE ACCESS BY INDEX ROWID       ORDERS             10     1       0     24   00:00:00.01
 5      INDEX RANGE SCAN DESCENDING      ORDERS_X1          10     1       0      4   00:00:00.01
 6     TABLE ACCESS BY INDEX ROWID       PRODUCT_HISTORY    10    10       0     31   00:00:00.01
핵심: ORDER BY를 인덱스 역순으로 해결하고 10건을 먼저 자른다.`,
    predicate: `Predicate Information
 5 - access("ORDERS"."CUST_ID"=:B1)
 5 - filter(ROWNUM<=10)
 7 - access("PH"."PRODUCT_ID"="OI"."PRODUCT_ID" AND "PH"."START_DT"<=:ORDER_DT)
 7 - filter("PH"."END_DT">:ORDER_DT)
주의: 상품 이력 조건을 WHERE로 내리면 OUTER JOIN 보존 행이 사라질 수 있다.`
  },
  {
    trace: `Oracle SQL Trace 목표 통계
Id Operation                         Name             Rows  Loop     PR     CR    time
 0 SELECT STATEMENT                                    100     1       3    420   00:00:00.08
 1  NESTED LOOPS                                       100     1       3    420   00:00:00.08
 2   VIEW                                              100     1       2     80   00:00:00.02
 3    WINDOW SORT PUSHED RANK                         1000    1       2     80   00:00:00.02
 4     TABLE ACCESS BY INDEX ROWID BATCHED ORDERS     1000    1       2     80   00:00:00.02
 5      INDEX RANGE SCAN                  ORDERS_X01  1000    1       0     12   00:00:00.01
 6   INDEX RANGE SCAN                     DETAIL_X01  1000 1000       1    340   00:00:00.06
핵심: 최근 1시간 조건으로 주문을 먼저 줄이고 ROW_NUMBER로 최근 1000건만 남긴다.`,
    predicate: `Predicate Information
 3 - filter(ROW_NUMBER() OVER (ORDER BY INTERNAL_FUNCTION("주문일시") DESC)<=1000)
 5 - access("주문일시">=SYSDATE-1/24)
 6 - access("주문상품"."주문번호"="주문1"."주문번호")
주의: ROWNUM으로 자르면 COUNT STOPKEY가 생겨 목표 계획과 달라질 수 있다.`
  },
  {
    trace: `Oracle SQL Trace 목표 통계
Id Operation                         Name          Rows  Loop     PR      CR    time
 0 SELECT STATEMENT                                  50     1      32   38000   00:00:01.20
 1  TABLE ACCESS BY INDEX ROWID       EMP           50  12000      32   38000   00:00:01.20
 2   INDEX RANGE SCAN                 EMP_X01    12000     1       4     150   00:00:00.02
핵심: 인덱스에서 많이 찾고 테이블에서 대부분 버리는 구조다. 조건 컬럼을 인덱스에 보강해야 한다.`,
    predicate: `Predicate Information
 2 - access("EMP"."DEPTNO"=:B1)
 1 - filter("EMP"."HIRE_DT">=:B2 AND "EMP"."JOB_CD"=:B3)
개선 방향: EMP_X02(DEPTNO, JOB_CD, HIRE_DT) 또는 업무 선택도에 맞춘 복합 인덱스를 제안한다.`
  },
  {
    trace: `Oracle SQL Trace 목표 통계
Id Operation                         Name             Rows  Loop     PR      CR    time
 0 SELECT STATEMENT                                 1200     1      70    6200   00:00:00.45
 1  HASH GROUP BY                                   1200     1      70    6200   00:00:00.45
 2   HASH JOIN                                      8000     1      70    6200   00:00:00.40
 3    PARTITION RANGE SINGLE          ORDERS        3000    1      22    1800   00:00:00.12
 4    TABLE ACCESS FULL               ORDER_ITEMS   9000    1      48    4400   00:00:00.28
핵심: 대량 집계는 NL 반복보다 해시 조인과 해시 집계가 자연스럽다.`,
    predicate: `Predicate Information
 3 - access("ORDERS"."ORDER_DT">=DATE '2026-04-01' AND "ORDERS"."ORDER_DT"<DATE '2026-07-01')
 2 - access("OI"."ORDER_ID"="O"."ORDER_ID")
주의: 대량 범위인데 USE_NL을 강제하면 Loop와 CR이 폭증한다.`
  }
];

function labTrace(index: number, variant = 0) {
  return labTraceProfiles[(index + variant) % labTraceProfiles.length].trace;
}

function labPredicate(index: number, variant = 0) {
  return labTraceProfiles[(index + variant) % labTraceProfiles.length].predicate;
}

function labEnvironment(round: string, schemaSql: string, seedSql: string): LabEnvironment {
  return {
    schemaSql: `[${round} 복원형 DDL/인덱스]\n${schemaSql}`,
    seedSql: `[${round} AS-IS/제약조건]\n${seedSql}`
  };
}

const sqlpLabEnvironments: LabEnvironment[] = [
  labEnvironment(
    "53회 1번",
    `create table t1(dt date, id varchar2(10), cd varchar2(10), v1 number);
create unique index t1_pk on t1(dt, id);
create table t2(dt date, id varchar2(10), cd varchar2(10), v1 number);
create unique index t2_pk on t2(dt, id);
create table t3(id varchar2(10), nm varchar2(10));
create unique index t3_pk on t3(id);
create table t4(id varchar2(10), nm varchar2(10));
create unique index t4_pk on t4(id);`,
    `AS-IS는 t1/t2가 먼저 t3와 조인한 뒤 UNION ALL, 정렬, exists(t4), rownum <= 10을 적용한다.
TO-BE는 t1/t2 각 분기에서 t4와 NL 조인 후 COUNT STOPKEY, UNION ALL 후 다시 COUNT STOPKEY, t3는 최종 스칼라 조회로 보이게 작성한다.
힌트 의도: no_merge, leading, use_nl, index, 각 분기 rownum 위치.`
  ),
  labEnvironment(
    "53회 2번",
    `create table t1(dt date, id varchar2(10), cd varchar2(10), v1 number)
partition by range(dt)(
  partition p202501 values less than (date '2025-02-01'),
  partition p202502 values less than (date '2025-03-01'),
  partition pmax values less than (maxvalue)
);
create unique index t1_pk on t1(dt, id) local;
create table t2(dt date, id varchar2(10), cd varchar2(10), v1 number);
create unique index t2_pk on t2(dt, id);`,
    `AS-IS는 merge into t1 using t2로 update 후 일부 delete, 미존재 row insert가 섞인다.
TO-BE는 t1_p202501 교환용 테이블을 만들고, 최종 생존 행을 insert한 뒤 exchange partition으로 교체하는 방향이다.
답안에는 SELECT뿐 아니라 Oracle 관점으로 create table, insert append, exchange partition, drop table 순서를 설명할 수 있어야 한다.`
  ),
  labEnvironment(
    "52회 1번",
    `create table orders(order_id number, cust_id varchar2(11), order_dt date, delivery_id number, constraint orders_pk primary key(order_id));
create index orders_x1 on orders(cust_id, order_dt);
create table order_items(order_id number, product_id number, qty number, constraint order_items_pk primary key(order_id, product_id));
create table product_history(product_id number, start_dt date, end_dt date, event_cd varchar2(20), unit_price number);
create index product_history_x2 on product_history(product_id, start_dt, end_dt);
create table deliveries(delivery_id number, delivery_status_cd varchar2(10));`,
    `AS-IS는 고객 주문 전체를 조인한 뒤 정렬하고 10건을 자른다.
TO-BE는 orders_x1을 cust_id, order_dt 순서로 활용하여 order by desc에도 SORT ORDER BY를 피하고 COUNT STOPKEY로 10건을 먼저 줄인다.
상품이력은 product_id/start_dt/end_dt 인덱스를 사용하고, 배송상태는 마지막 스칼라 조회로 처리한다.`
  ),
  labEnvironment(
    "52회 2번",
    `create table orders_a(order_no varchar2(16), cust_no varchar2(11), order_dt date) partition by range(order_no)(partition p202501 values less than('202502'), partition pmax values less than(maxvalue));
create table order_detail_b(order_no varchar2(16), product_no varchar2(10));
create table customer_c(cust_no varchar2(11), grade_cd varchar2(10));
create table product_d(product_no varchar2(10), product_nm varchar2(100));
create table code_e(code_cd varchar2(10), code_nm varchar2(100));
create table order_stat_f(order_no varchar2(16), stat_amt number);
create index orders_a_x1 on orders_a(order_dt, order_no);`,
    `문제 제약: FROM 절은 a,b,c,d,e,f 별칭 순서를 유지한다.
하지만 목표 실행계획은 최근 주문 a를 먼저 줄이고 b,d,c,e,f 순서로 NL 조인하도록 유도한다.
FROM 작성 순서와 LEADING 힌트의 조인 순서가 다를 수 있음을 설명해야 한다.`
  ),
  labEnvironment(
    "51회 1번",
    `create table products(product_id number primary key, product_name varchar2(100), cust_id number);
create table orders(order_id number primary key, order_dt date);
create index orders_x01 on orders(order_dt);
create table order_items(order_id number primary key, product_id number, qty number);
create index order_items_x01 on order_items(order_id, product_id);`,
    `요구사항: 주문일시가 1시간 이내인 최근 주문 1000건 중 2번 이상 주문된 상품명, 주문합계수량, 마지막 주문일시를 구한다.
목표 포인트: 최근 1000건을 먼저 제한한 뒤 주문상품을 조인하고 상품별 집계를 수행한다.
힌트는 목표 실행계획과 같은 순서가 나오도록 작성한다.`
  ),
  labEnvironment(
    "50회 1-1",
    `create table emp(empno number, deptno number, hire_dt date, job_cd varchar2(20), sal number, memo varchar2(4000));
-- 관찰된 계획: TABLE ACCESS FULL EMP, Rows는 작지만 Bytes가 매우 큼`,
    `단답형 스타일: 실행계획 문제점과 개선점을 각각 적는다.
문제점: 조건이 소량인데 전체 테이블을 읽거나, 필요한 컬럼보다 큰 payload를 읽는다.
개선: 조건 컬럼 기반 인덱스와 필요한 컬럼만 조회하는 SQL을 제시한다.`
  ),
  labEnvironment(
    "50회 1-2",
    `create table emp(empno number, deptno number, hire_dt date, job_cd varchar2(20), sal number);
create index emp_x01 on emp(deptno);
-- 관찰된 계획: INDEX RANGE SCAN EMP_X01 1000건 후 TABLE ACCESS 100건`,
    `단답형 스타일: 인덱스는 타지만 효율이 나쁘다.
문제점: 필터 조건 컬럼이 인덱스에 없어 많은 rowid를 만든 뒤 테이블에서 버린다.
개선: deptno + hire_dt 또는 deptno + job_cd처럼 조건 조합에 맞는 복합 인덱스와 조건식을 제시한다.`
  ),
  labEnvironment(
    "50회 1-3",
    `create table emp_part(dt date, empno number, deptno number, job_cd varchar2(20), sal number)
partition by range(dt)(partition p202607 values less than(date '2026-08-01'), partition pmax values less than(maxvalue));
create index emp_part_x2 on emp_part(job_cd) local;`,
    `관찰된 계획: local index를 사용하지만 PARTITION RANGE ALL로 모든 파티션을 본다.
문제점: 파티션 키 조건이 없거나 dt 컬럼을 함수로 감싸 pruning이 안 된다.
개선: 파티션 키 범위 조건을 직접 쓰고 PSTART/PSTOP이 줄어드는지 확인한다.`
  ),
  labEnvironment(
    "OR 확장형",
    `create table orders(order_id number, order_dt date, status_cd varchar2(10), channel_cd varchar2(10), amount number);
create index orders_x1 on orders(status_cd, order_dt);
create index orders_x2 on orders(channel_cd, order_dt);`,
    `AS-IS는 status_cd 조건과 channel_cd 조건이 OR로 묶여 한쪽 인덱스만 타거나 넓은 범위를 스캔한다.
TO-BE는 UNION ALL 분기로 나누고, 두 번째 분기에 중복 방지 조건을 둔다.
UNION은 정렬/중복제거가 발생하므로 UNION ALL이 기본이다.`
  ),
  labEnvironment(
    "스칼라 개선형",
    `create table customers(cust_id varchar2(20), cust_name varchar2(100), region_cd varchar2(10));
create table orders(order_id number, cust_id varchar2(20), order_dt date);
create table payments(payment_id number, order_id number, pay_dt date, pay_amt number);
create index payments_x1 on payments(order_id, pay_dt);`,
    `AS-IS는 customers 각 행마다 SELECT 절 상관 스칼라 서브쿼리로 마지막 결제일과 합계를 반복 조회한다.
TO-BE는 payments를 고객별로 먼저 집계하고 customers와 outer join한다.
결과 보존을 위해 결제 없는 고객도 출력할지 확인한다.`
  ),
  labEnvironment(
    "해시 집계형",
    `create table orders(order_id number, order_dt date, status_cd varchar2(10));
create table order_items(order_id number, product_id number, sale_amt number);
create table products(product_id number, category_cd varchar2(10));
create index orders_x1 on orders(order_dt, status_cd);`,
    `대량 분기 범위 매출 집계 문제다.
소량 NL이 아니라 orders 범위 -> order_items -> products 해시 조인과 HASH GROUP BY를 의도한다.
PGA/TEMP 사용 가능성도 해설에 적는다.`
  ),
  labEnvironment(
    "세미조인형",
    `create table customers(cust_id varchar2(20), cust_name varchar2(100));
create table orders(order_id number, cust_id varchar2(20));
create table order_items(order_id number, product_id varchar2(20));
create index order_items_x1 on order_items(product_id, order_id);`,
    `AS-IS는 JOIN 후 DISTINCT로 구매 고객 중복을 제거한다.
TO-BE는 존재 여부만 필요하므로 EXISTS 기반 세미 조인으로 작성한다.
실행계획에서 HASH JOIN SEMI 또는 NESTED LOOPS SEMI를 기대한다.`
  ),
  labEnvironment(
    "안티조인형",
    `create table orders(order_id number, cust_id varchar2(20), order_dt date);
create table payments(payment_id number, order_id number, pay_dt date);
create index payments_x1 on payments(order_id);`,
    `미결제 주문 조회 문제다.
NOT IN은 서브쿼리 결과에 NULL이 섞이면 결과가 사라질 수 있으므로 NOT EXISTS로 안전하게 작성한다.
최근 주문 범위를 먼저 줄이는 조건도 필요하다.`
  ),
  labEnvironment(
    "OUTER 조건위치형",
    `create table orders(order_id number, order_dt date);
create table order_items(order_id number, product_id number);
create table product_history(product_id number, start_dt date, end_dt date, event_cd varchar2(20), unit_price number);
create index product_history_x2 on product_history(product_id, start_dt, end_dt);`,
    `상품이력이 없어도 주문상품 행은 보존해야 한다.
오른쪽 테이블의 기간/이벤트 조건을 WHERE에 두면 outer join이 inner join처럼 변한다.
조건 위치가 정답의 핵심이다.`
  ),
  labEnvironment(
    "SARGable 변환형",
    `create table orders(order_id number, order_dt date, status_cd varchar2(10));
create index orders_x1 on orders(order_dt, status_cd);`,
    `AS-IS는 to_char(order_dt,'YYYYMM') = '202607' 형태다.
TO-BE는 order_dt >= date '2026-07-01' and order_dt < date '2026-08-01' 반개구간으로 바꾼다.
함수 기반 인덱스가 없으면 컬럼 함수는 일반 인덱스 access 조건이 되기 어렵다.`
  ),
  labEnvironment(
    "뷰머징 제어형",
    `create table order_items(order_id number, product_id number, sale_amt number);
create table products(product_id number, category_cd varchar2(10));
create index order_items_x1 on order_items(product_id);`,
    `주문상품을 상품별로 먼저 집계한 뒤 products와 조인해야 한다.
옵티마이저가 집계 인라인 뷰를 병합하면 목표 순서가 깨질 수 있으므로 no_merge 의도를 표현한다.
집계 후 소량 조인의 근거를 설명한다.`
  ),
  labEnvironment(
    "페이징/정렬형",
    `create table orders(order_id number, cust_id varchar2(20), order_dt date, amount number);
create index orders_x1 on orders(cust_id, order_dt desc, order_id desc);`,
    `최근 주문 101~120번째 페이지를 가져온다.
정렬 기준이 유일하지 않으면 페이지가 흔들리므로 order_dt desc, order_id desc처럼 결정적 정렬을 사용한다.
index_desc와 row_number 또는 rownum inline view를 비교한다.`
  ),
  labEnvironment(
    "Call 최소화형",
    `create table customers(cust_id varchar2(20), cust_name varchar2(100), region_cd varchar2(10));
create table orders(order_id number, cust_id varchar2(20), order_dt date, amount number);`,
    `AS-IS는 애플리케이션에서 고객 목록을 루프 돌며 고객별 주문 합계를 반복 조회한다.
TO-BE는 한 번의 집합 SQL로 지역/고객별 합계를 구한다.
짧은 SQL도 반복 호출되면 parse/execute/fetch call이 병목이 된다.`
  ),
  labEnvironment(
    "대량삭제 대체형",
    `create table emp_part(dt date, empno number, deptno number, job_cd varchar2(20), sal number)
partition by range(dt)(partition p202602 values less than(date '2026-03-01'), partition pmax values less than(maxvalue));`,
    `특정 파티션의 대부분을 삭제해야 한다.
일반 DELETE 대신 보존할 소량 행만 CTAS/insert append로 만들고 exchange 또는 truncate+insert를 고려한다.
SELECT 답안은 보존 대상 행 집합을 정확히 만든다.`
  ),
  labEnvironment(
    "기간조인형",
    `create table orders(order_id number, order_dt date);
create table order_items(order_id number, product_id number);
create table product_history(product_id number, start_dt date, end_dt date, unit_price number);
create index product_history_x1 on product_history(product_id, start_dt, end_dt);`,
    `주문 시점에 유효한 가격 이력을 찾는다.
기간 조건은 start_dt <= order_dt and order_dt < end_dt 형태가 중복을 줄이는 데 안전하다.
이력이 없는 주문상품을 보존해야 하면 outer join을 유지한다.`
  )
];

const sqlpLabCases: LabCase[] = [
  {
    title: "UNION ALL 분기별 부분범위와 최종 Top-N",
    difficulty: "실전",
    topic: "Top-N / COUNT STOPKEY",
    scenario: "53회 복기형처럼 TO-BE 실행계획에 각 분기 COUNT STOPKEY와 최종 COUNT STOPKEY가 보이도록 쿼리 구조를 다시 만든다.",
    prompt:
      "t1, t2에서 오늘 데이터만 조회하되 t4에 존재하는 id만 남긴다. 각 분기에서 먼저 10건 이하로 줄인 뒤 UNION ALL 하고, 마지막에 t3 명칭은 스칼라 서브쿼리 형태로 조회하라.",
    expectedSql: `with branch_1 as (
  select /*+ no_merge leading(t1 t4) use_nl(t4) index(t1 t1_pk) index(t4 t4_pk) */ 1 as tp, t1.id
  from t1
  join t4 on t4.id = t1.id
  where t1.dt = current_date
  order by t1.id
  limit 10
),
branch_2 as (
  select /*+ no_merge leading(t2 t4) use_nl(t4) index(t2 t2_pk) index(t4 t4_pk) */ 2 as tp, t2.id
  from t2
  join t4 on t4.id = t2.id
  where t2.dt = current_date
  order by t2.id
  limit 10
),
unioned as (
  select * from branch_1
  union all
  select * from branch_2
)
select u.tp, (select t3.nm from t3 where t3.id = u.id) as nm
from unioned u
order by u.tp, nm
limit 10`,
    targetPlan: ["COUNT STOPKEY per branch", "UNION-ALL", "NESTED LOOPS with T4", "T3 scalar lookup after final stopkey"],
    oracleNotes: [
      ...commonOracleNotes,
      "Oracle 답안에서는 각 인라인 뷰 안쪽에 rownum <= 10을 두어 분기별 COUNT STOPKEY를 만들고, UNION ALL 밖에서 다시 rownum <= 10을 둡니다.",
      "t3를 먼저 조인하면 목표 실행계획과 달라질 수 있으므로 최종 SELECT 절 스칼라 서브쿼리로 뒤에 보이게 하는 의도가 중요합니다."
    ],
    hints: ["분기별 inline view를 먼저 만든다.", "각 분기 안쪽에서 정렬 후 limit/rownum으로 부분범위 처리한다.", "t3는 마지막에 이름만 조회한다."],
    rubric: commonRubric
  },
  {
    title: "MERGE 배치를 파티션 교환 방식으로 재구성",
    difficulty: "실전",
    topic: "파티션 교환 / 배치 튜닝",
    scenario: "53회 복기형의 exchange partition 핵심을 PostgreSQL 연습용 SELECT로 바꿔, 교체할 파티션의 최종 모습을 먼저 만든다.",
    prompt:
      "t1의 2025년 1월 파티션을 t2 변경분으로 갱신한다고 가정한다. 기존 MERGE처럼 행마다 update/delete/insert하지 말고, 교환 대상 임시 테이블에 들어갈 최종 행 집합을 SELECT로 작성하라.",
    expectedSql: `with old_partition as (
  select /*+ full(t1) */ dt, id, cd, v1
  from t1
  where dt >= date '2025-01-01'
    and dt < date '2025-02-01'
),
merged_rows as (
  select
    coalesce(n.dt, o.dt) as dt,
    coalesce(n.id, o.id) as id,
    coalesce(n.cd, o.cd) as cd,
    case when n.id is not null and o.id is not null then o.v1 + n.v1 else coalesce(n.v1, o.v1) end as v1,
    case when n.id is not null and o.id is not null then 'MATCHED' else 'SURVIVED' end as merge_state
  from old_partition o
  full join t2 n
    on n.dt = o.dt
   and n.id = o.id
)
select dt, id, cd, v1
from merged_rows
where not (merge_state = 'MATCHED' and cd <= '100')`,
    targetPlan: ["Build replacement rows", "PARTITION RANGE SINGLE/ALL depending predicate", "OUTER JOIN old and delta", "INSERT into exchange table in Oracle"],
    oracleNotes: [
      ...commonOracleNotes,
      "Oracle 정답 방향은 t1_p202501 같은 교환용 테이블 생성, 최종 데이터 INSERT, ALTER TABLE t1 EXCHANGE PARTITION p202501 WITH TABLE t1_p202501, 임시 테이블 정리 순서입니다.",
      "DML을 직접 수행하는 것이 아니라 교체할 파티션의 최종 상태를 한 번에 만드는 사고가 핵심입니다."
    ],
    hints: ["교체 대상 월을 먼저 잘라낸다.", "기존 행과 변경분을 outer join으로 결합한다.", "delete 조건은 최종 행 집합에서 제외한다."],
    rubric: commonRubric
  },
  {
    title: "고객 최근 주문 10건 부분범위 처리",
    difficulty: "실전",
    topic: "Top-N / 인덱스 DESC",
    scenario: "52회 복기형처럼 고객번호와 주문일시 인덱스를 이용해 SORT ORDER BY 없이 최근 10건만 먼저 가져온다.",
    prompt:
      "특정 고객의 최근 주문 10건을 먼저 줄인 뒤 주문상품, 상품이력, 배송을 차례대로 결합하라. 상품이력은 기간 조건을 포함한 outer join으로 유지한다.",
    expectedSql: `with recent_orders as (
  select /*+ no_merge index_desc(o idx_orders_cust_dt) */ o.order_id, o.order_dt, o.delivery_id
  from orders o
  where o.cust_id = 'C0000000042'
  order by o.order_dt desc, o.order_id desc
  limit 10
)
select /*+ leading(ro oi ph) use_nl(oi) use_nl(ph) index(oi idx_order_items_order_product) index(ph idx_product_history_period) */
  ro.order_id,
  ro.order_dt,
  oi.qty * ph.unit_price as order_amount,
  (select d.delivery_status_cd from deliveries d where d.delivery_id = ro.delivery_id) as delivery_status_cd
from recent_orders ro
join order_items oi on oi.order_id = ro.order_id
left join product_history ph
  on ph.product_id = oi.product_id
 and ro.order_dt >= ph.start_dt
 and ro.order_dt < ph.end_dt
 and ph.event_cd = 'SQLP'`,
    targetPlan: ["INDEX RANGE SCAN DESCENDING", "COUNT STOPKEY", "NESTED LOOPS OUTER", "상품이력 기간 인덱스"],
    oracleNotes: [
      ...commonOracleNotes,
      "주문을 먼저 10건으로 줄여야 뒤쪽 조인 반복 횟수가 작아집니다. Oracle에서는 index_desc + rownum <= 10 조합이 핵심입니다.",
      "상품이력 이벤트명 조건은 outer join 의미를 깨지 않도록 조인 조건 쪽에 두어야 합니다."
    ],
    hints: ["주문을 inline view로 먼저 자른다.", "정렬 방향과 인덱스 방향을 맞춘다.", "배송 상태는 스칼라 조회로 마지막에 붙여도 된다."],
    rubric: commonRubric
  },
  {
    title: "FROM 순서 제약이 있는 6테이블 조인",
    difficulty: "실전",
    topic: "조인 순서 / 힌트",
    scenario: "52회 복기형의 'FROM 절 테이블 순서 유지' 조건을 반영해, 작성 순서와 실제 선행 집합을 힌트로 분리한다.",
    prompt:
      "FROM에는 orders a, order_items b, customers c, products d, deliveries e, payments f 순서를 유지하라. 실제 실행 의도는 최근 주문 a를 먼저 줄이고 b, d, c, e, f 순서로 조인하는 것이다.",
    expectedSql: `select /*+ leading(a b d c e f) use_nl(b) use_nl(d) use_nl(c) use_nl(e) use_nl(f) index(a idx_orders_dt_status) */
  a.order_id,
  c.cust_name,
  d.product_name,
  e.delivery_status_cd,
  f.pay_amt
from orders a
join order_items b on b.order_id = a.order_id
join customers c on c.cust_id = a.cust_id
join products d on d.product_id = b.product_id
left join deliveries e on e.delivery_id = a.delivery_id
left join payments f on f.order_id = a.order_id
where a.order_dt >= current_date - interval '7 days'
  and a.status_cd = 'PAID'
order by a.order_dt desc
limit 50`,
    targetPlan: ["FROM order preserved", "LEADING controls join order", "NESTED LOOPS chain", "recent orders first"],
    oracleNotes: [
      ...commonOracleNotes,
      "SQL 텍스트의 FROM 나열 순서와 옵티마이저 조인 순서는 다를 수 있습니다. 제약 조건을 만족하면서 힌트로 의도를 명확히 해야 합니다.",
      "OUTER JOIN이 섞이면 힌트로도 마음대로 순서를 바꿀 수 없는 보존 관계가 있으므로 기준 테이블을 먼저 확인합니다."
    ],
    hints: ["FROM 별칭을 a,b,c,d,e,f로 고정한다.", "LEADING 힌트의 순서는 목표 계획을 적는다.", "outer join은 결과 보존을 깨지 않게 둔다."],
    rubric: commonRubric
  },
  {
    title: "최근 1시간 주문 Top-1000 후 상품 집계",
    difficulty: "실전",
    topic: "Top-N / 집계 / 조인",
    scenario: "51회 복기형처럼 최근 주문을 먼저 1000건으로 자른 뒤 주문상품을 조인하고 상품별 합계를 구한다.",
    prompt:
      "최근 1시간 주문 중 최신 1000건만 대상으로 상품별 주문수량 합계를 구하라. 합계가 2 이상인 상품만 남기고 합계수량 내림차순으로 정렬하라.",
    expectedSql: `with recent_orders as (
  select /*+ no_merge index_desc(o idx_orders_dt_status) */ o.order_id, o.order_dt
  from orders o
  where o.order_dt >= current_timestamp - interval '1 hour'
  order by o.order_dt desc, o.order_id desc
  limit 1000
),
product_sum as (
  select oi.product_id, sum(oi.qty) as total_qty, max(ro.order_dt) as last_order_dt
  from recent_orders ro
  join order_items oi on oi.order_id = ro.order_id
  group by oi.product_id
  having sum(oi.qty) >= 2
)
select /*+ leading(ps p) use_nl(p) */ p.product_name, ps.total_qty, ps.last_order_dt
from product_sum ps
join products p on p.product_id = ps.product_id
order by ps.total_qty desc, ps.last_order_dt desc`,
    targetPlan: ["WINDOW SORT PUSHED RANK or STOPKEY", "INDEX RANGE SCAN on order_dt", "HASH GROUP BY", "product lookup by PK"],
    oracleNotes: [
      ...commonOracleNotes,
      "최근 1000건 제한이 집계 뒤로 밀리면 완전히 다른 문제가 됩니다. 부분범위 처리를 먼저 적용하는 위치가 핵심입니다.",
      "상품명 조회는 집계 후 소량 결과에 붙이는 편이 반복 접근을 줄입니다."
    ],
    hints: ["최근 주문 CTE가 가장 먼저다.", "집계는 주문상품 조인 뒤 상품별로 한다.", "상품명은 마지막에 붙인다."],
    rubric: commonRubric
  },
  {
    title: "Full Scan 진단 후 선택 조건 인덱스 접근으로 전환",
    difficulty: "중간",
    topic: "인덱스 진단",
    scenario: "50회 복기형처럼 실행계획에 TABLE ACCESS FULL이 보일 때 조건과 인덱스 후보를 근거로 개선안을 작성한다.",
    prompt:
      "emp에서 특정 부서의 최근 입사자만 조회해야 하는데 전체 스캔이 발생한다고 가정한다. deptno, hire_dt 조건을 인덱스 범위 조건으로 사용할 수 있게 쿼리를 작성하라.",
    expectedSql: `select /*+ index(e emp_x01) */ e.empno, e.deptno, e.hire_dt, e.job_cd
from emp e
where e.deptno = 30
  and e.hire_dt >= current_date - interval '90 days'
order by e.hire_dt desc`,
    targetPlan: ["INDEX RANGE SCAN EMP_X01", "TABLE ACCESS BY INDEX ROWID", "avoid TABLE ACCESS FULL"],
    oracleNotes: [
      ...commonOracleNotes,
      "Full Scan은 항상 나쁜 것은 아니지만, 소량 선택 조건이 있고 적절한 복합 인덱스가 있으면 Range Scan을 검토합니다.",
      "조건 컬럼과 정렬 컬럼이 같은 인덱스 순서에 있으면 정렬 비용까지 줄일 수 있습니다."
    ],
    hints: ["선택 조건을 WHERE에 명확히 둔다.", "인덱스 선두 컬럼 deptno를 등치로 사용한다.", "hire_dt는 범위 조건으로 둔다."],
    rubric: commonRubric
  },
  {
    title: "인덱스는 타지만 필터가 많은 계획 개선",
    difficulty: "중간",
    topic: "인덱스 스캔 효율",
    scenario: "50회 복기형의 '인덱스는 있으나 1000건 탐색 후 100건만 남는' 상황을 조건 컬럼 추가 관점으로 연습한다.",
    prompt:
      "orders에서 주문일시 인덱스만 타고 status_cd는 필터로 많이 버려진다고 가정한다. 날짜 범위와 상태 조건이 모두 인덱스 후보가 되도록 SQL을 명확히 작성하라.",
    expectedSql: `select /*+ index(o idx_orders_dt_status) */ o.order_id, o.order_dt, o.amount
from orders o
where o.order_dt >= current_date - interval '30 days'
  and o.order_dt < current_date + interval '1 day'
  and o.status_cd = 'PAID'`,
    targetPlan: ["INDEX RANGE SCAN with date/status", "fewer table rowid visits", "filter predicate reduced"],
    oracleNotes: [
      ...commonOracleNotes,
      "인덱스 사용 여부보다 인덱스에서 얼마나 많이 읽고 얼마나 버리는지가 중요합니다.",
      "복합 인덱스 설계 답안에서는 조건 컬럼이 access로 쓰이는지, filter로 밀리는지까지 설명합니다."
    ],
    hints: ["날짜는 컬럼 함수를 쓰지 말고 범위로 쓴다.", "상태 조건을 별도 필터로 숨기지 않는다.", "필요 컬럼만 조회한다."],
    rubric: commonRubric
  },
  {
    title: "Bytes가 큰 계획에서 필요한 컬럼만 읽기",
    difficulty: "기본",
    topic: "테이블 엑세스 최소화",
    scenario: "50회 복기형처럼 인덱스 스캔 건수는 적절하지만 Bytes와 테이블 액세스 비용이 큰 상황을 줄인다.",
    prompt:
      "고객의 최근 주문 존재 여부와 주문번호만 필요하다. SELECT *와 불필요한 큰 컬럼 조회를 피하고 인덱스 중심으로 읽도록 작성하라.",
    expectedSql: `select /*+ index(o idx_orders_cust_dt) */ o.order_id, o.order_dt
from orders o
where o.cust_id = 'C0000000042'
  and o.order_dt >= current_date - interval '180 days'
order by o.order_dt desc
limit 20`,
    targetPlan: ["INDEX RANGE SCAN DESCENDING", "reduced bytes", "fewer table columns"],
    oracleNotes: [
      ...commonOracleNotes,
      "실행계획에서 Rows는 작아도 Bytes가 크면 넓은 컬럼이나 불필요한 테이블 액세스가 병목일 수 있습니다.",
      "커버링 인덱스 후보를 설명할 때는 조회 컬럼을 무작정 다 넣기보다 DML 비용을 함께 언급합니다."
    ],
    hints: ["필요한 컬럼만 선택한다.", "Top-N이면 정렬 인덱스를 활용한다.", "테이블 랜덤 액세스가 필요한 컬럼인지 확인한다."],
    rubric: commonRubric
  },
  {
    title: "OR 조건을 UNION ALL로 분해",
    difficulty: "중간",
    topic: "OR 조건 분해",
    scenario: "OR 때문에 한쪽 인덱스만 쓰거나 넓게 스캔하는 SQL을 분기별 접근으로 바꾼다.",
    prompt:
      "orders에서 status_cd 조건 또는 channel_cd 조건이 OR로 묶여 있다. 각 조건이 독립적으로 인덱스 후보가 되도록 UNION ALL로 분해하고 중복을 방지하라.",
    expectedSql: `select /*+ index(o idx_orders_dt_status) */ o.order_id, o.order_dt, o.amount
from orders o
where o.status_cd = 'PAID'
  and o.order_dt >= current_date - interval '7 days'
union all
select /*+ index(o idx_orders_dt_status) */ o.order_id, o.order_dt, o.amount
from orders o
where o.channel_cd = 'APP'
  and o.order_dt >= current_date - interval '7 days'
  and o.status_cd <> 'PAID'`,
    targetPlan: ["UNION-ALL", "branch specific index access", "duplicate guard condition"],
    oracleNotes: [
      ...commonOracleNotes,
      "OR 확장은 옵티마이저가 자동으로 할 수도 있지만, 실기에서는 UNION ALL로 의도를 드러내는 답안을 요구할 수 있습니다.",
      "UNION ALL은 중복 제거를 하지 않으므로 두 분기가 겹치지 않게 배타 조건을 넣어야 합니다."
    ],
    hints: ["OR의 각 항을 별도 SELECT로 분리한다.", "두 번째 분기에 중복 방지 조건을 둔다.", "UNION 대신 UNION ALL을 사용한다."],
    rubric: commonRubric
  },
  {
    title: "반복 스칼라 서브쿼리를 사전 집계 조인으로 변경",
    difficulty: "중간",
    topic: "스칼라 서브쿼리 개선",
    scenario: "고객별 마지막 결제일을 행마다 반복 조회하는 SQL을 한 번 집계한 뒤 조인하는 방식으로 바꾼다.",
    prompt:
      "customers 목록에 고객별 마지막 결제일과 결제금액 합계를 붙인다. SELECT 절 상관 스칼라 서브쿼리 반복 대신 payments를 먼저 집계하라.",
    expectedSql: `with pay_summary as (
  select o.cust_id, max(p.pay_dt) as last_pay_dt, sum(p.pay_amt) as total_pay_amt
  from orders o
  join payments p on p.order_id = o.order_id
  group by o.cust_id
)
select c.cust_id, c.cust_name, ps.last_pay_dt, ps.total_pay_amt
from customers c
left join pay_summary ps on ps.cust_id = c.cust_id
where c.region_cd = 'SEOUL'`,
    targetPlan: ["PAYMENTS pre aggregation", "HASH GROUP BY", "CUSTOMERS OUTER JOIN", "no repeated scalar execution"],
    oracleNotes: [
      ...commonOracleNotes,
      "스칼라 서브쿼리는 소량이면 괜찮을 수 있지만 외부 행 수와 distinct key가 많으면 반복 비용이 커집니다.",
      "집계 후 조인은 결과가 달라지지 않는지, outer join으로 고객 보존이 필요한지 확인해야 합니다."
    ],
    hints: ["payments를 orders와 조인해 cust_id별로 먼저 집계한다.", "customers는 left join으로 보존한다.", "SELECT 절 안의 반복 조회를 없앤다."],
    rubric: commonRubric
  },
  {
    title: "대량 집계는 해시 조인과 해시 그룹으로 처리",
    difficulty: "중간",
    topic: "해시 조인 / 집계",
    scenario: "분기 전체 주문상품 매출을 상품군별로 집계하는 대량 SQL이다. NL 반복보다 해시 조인을 의도한다.",
    prompt:
      "최근 분기 주문상품 매출을 상품 카테고리별로 집계하라. 대량 범위 처리이므로 orders와 order_items, products를 해시 조인하는 의도를 힌트에 표현하라.",
    expectedSql: `select /*+ leading(o oi p) use_hash(oi) use_hash(p) */ p.category_cd, sum(oi.sale_amt) as sale_amt
from orders o
join order_items oi on oi.order_id = o.order_id
join products p on p.product_id = oi.product_id
where o.order_dt >= date '2026-04-01'
  and o.order_dt < date '2026-07-01'
group by p.category_cd`,
    targetPlan: ["HASH JOIN", "HASH GROUP BY", "large date range scan"],
    oracleNotes: [
      ...commonOracleNotes,
      "대량 등가 조인은 해시 조인이 유리한 경우가 많지만, build input 크기와 PGA/TEMP 사용을 함께 봐야 합니다.",
      "NL 조인을 무조건 피하는 것이 아니라 선행 집합 규모에 따라 판단합니다."
    ],
    hints: ["분기 범위 조건을 SARGable하게 쓴다.", "대량 조인은 USE_HASH를 고려한다.", "집계 컬럼만 SELECT에 둔다."],
    rubric: commonRubric
  },
  {
    title: "EXISTS로 중복 제거 정렬 피하기",
    difficulty: "기본",
    topic: "세미 조인",
    scenario: "구매 이력이 있는 고객만 필요할 때 JOIN + DISTINCT 대신 EXISTS로 존재 여부만 검사한다.",
    prompt:
      "특정 상품을 구매한 이력이 있는 고객 목록을 조회하라. 고객이 여러 번 구매해도 한 번만 출력되어야 하며, DISTINCT 정렬 없이 작성하는 것이 목표다.",
    expectedSql: `select c.cust_id, c.cust_name
from customers c
where exists (
  select 1
  from orders o
  join order_items oi on oi.order_id = o.order_id
  where o.cust_id = c.cust_id
    and oi.product_id = 'P00042'
)`,
    targetPlan: ["SEMI JOIN", "no SORT UNIQUE", "ORDER_ITEMS index candidate"],
    oracleNotes: [
      ...commonOracleNotes,
      "EXISTS는 존재 여부만 필요할 때 중복 행 생성을 피하는 대표적인 방식입니다.",
      "실행계획에서는 HASH JOIN SEMI, NESTED LOOPS SEMI 등으로 변환될 수 있습니다."
    ],
    hints: ["고객을 기준 집합으로 둔다.", "서브쿼리는 존재 여부만 반환한다.", "DISTINCT가 필요한 조인 결과를 만들지 않는다."],
    rubric: commonRubric
  },
  {
    title: "NOT IN NULL 함정을 피한 안티 조인",
    difficulty: "중간",
    topic: "안티 조인 / NULL",
    scenario: "미결제 주문을 찾을 때 NOT IN 서브쿼리에 NULL이 섞이면 결과가 사라질 수 있다. NOT EXISTS로 안전하게 작성한다.",
    prompt:
      "최근 30일 주문 중 결제 이력이 전혀 없는 주문을 찾으라. payments.order_id에 NULL 가능성이 있다고 보고 NOT EXISTS로 작성하라.",
    expectedSql: `select o.order_id, o.cust_id, o.order_dt
from orders o
where o.order_dt >= current_date - interval '30 days'
  and not exists (
    select 1
    from payments p
    where p.order_id = o.order_id
  )`,
    targetPlan: ["ANTI JOIN", "date range access", "NULL safe anti condition"],
    oracleNotes: [
      ...commonOracleNotes,
      "NOT IN은 서브쿼리 결과에 NULL이 포함되면 UNKNOWN으로 인해 기대와 다른 결과가 나올 수 있습니다.",
      "SQLP 객관식과 튜닝 문제 모두 NOT EXISTS와 NULL 안전성을 자주 연결합니다."
    ],
    hints: ["NOT IN 대신 NOT EXISTS를 우선 고려한다.", "최근 30일 조건으로 기준 집합을 줄인다.", "서브쿼리는 조인 키만 비교한다."],
    rubric: commonRubric
  },
  {
    title: "OUTER JOIN 조건 위치로 기준 행 보존",
    difficulty: "기본",
    topic: "아우터 조인",
    scenario: "상품이력이 없어도 주문상품은 보여야 하는 요구사항이다. 오른쪽 테이블 조건을 WHERE에 두면 outer join이 깨진다.",
    prompt:
      "주문상품별 상품이력 금액을 조회하되, 해당 기간의 상품이력이 없어도 주문상품 행은 보존하라. 이벤트 조건과 기간 조건을 ON 절에 배치하라.",
    expectedSql: `select oi.order_id, oi.product_id, ph.unit_price
from order_items oi
join orders o on o.order_id = oi.order_id
left join product_history ph
  on ph.product_id = oi.product_id
 and o.order_dt >= ph.start_dt
 and o.order_dt < ph.end_dt
 and ph.event_cd = 'SQLP'
where o.order_dt >= current_date - interval '7 days'`,
    targetPlan: ["NESTED LOOPS OUTER or HASH OUTER", "preserved ORDER_ITEMS", "right table filters in join condition"],
    oracleNotes: [
      ...commonOracleNotes,
      "Oracle 구식 outer join 표기에서는 c.이벤트명(+)처럼 오른쪽 조건에도 (+)가 빠지지 않아야 합니다.",
      "WHERE에 오른쪽 테이블 조건을 두면 NULL 확장 행이 제거되어 INNER JOIN처럼 변할 수 있습니다."
    ],
    hints: ["보존해야 할 기준 테이블을 먼저 정한다.", "오른쪽 테이블 조건은 ON에 둔다.", "WHERE는 기준 집합 조건 위주로 둔다."],
    rubric: commonRubric
  },
  {
    title: "날짜 컬럼 함수 제거로 Range Scan 가능하게 만들기",
    difficulty: "기본",
    topic: "SARGable 조건",
    scenario: "TO_CHAR(order_dt, 'YYYYMM') 같은 조건은 일반 인덱스 활용을 방해한다. 월 범위 조건으로 바꾼다.",
    prompt:
      "2026년 7월 주문을 조회하라. order_dt 컬럼에 함수를 씌우지 말고 시작일 이상, 다음 달 시작일 미만 범위로 작성하라.",
    expectedSql: `select /*+ index(o idx_orders_dt_status) */ o.order_id, o.order_dt, o.status_cd
from orders o
where o.order_dt >= date '2026-07-01'
  and o.order_dt < date '2026-08-01'`,
    targetPlan: ["INDEX RANGE SCAN", "ACCESS predicate on order_dt", "no function on indexed column"],
    oracleNotes: [
      ...commonOracleNotes,
      "컬럼에 함수를 적용하면 함수 기반 인덱스가 없는 한 일반 인덱스 Range Scan이 어려워집니다.",
      "월 조건은 '해당 월 시작 이상, 다음 월 시작 미만' 패턴으로 외우면 안전합니다."
    ],
    hints: ["컬럼 왼쪽은 그대로 둔다.", "BETWEEN보다 반개구간이 시간값 처리에 안전하다.", "문자 변환 조건을 피한다."],
    rubric: commonRubric
  },
  {
    title: "파티션 Pruning을 만드는 조건",
    difficulty: "중간",
    topic: "파티션 Pruning",
    scenario: "50회 복기형의 local partition index가 전체 파티션을 읽는 상황을 피하기 위해 파티션 키 조건을 명확히 둔다.",
    prompt:
      "emp_part는 dt 기준 range partition이라고 가정한다. 특정 월과 사원번호 조건으로 필요한 파티션만 읽게 작성하라.",
    expectedSql: `select /*+ index(e emp_part_x4) */ e.empno, e.deptno, e.sal
from emp_part e
where e.dt >= date '2026-07-01'
  and e.dt < date '2026-08-01'
  and e.empno = 7788`,
    targetPlan: ["PARTITION RANGE SINGLE", "PSTART/PSTOP narrowed", "INDEX RANGE SCAN"],
    oracleNotes: [
      ...commonOracleNotes,
      "파티션 테이블이라도 파티션 키 조건이 없거나 함수로 감싸면 PARTITION RANGE ALL이 될 수 있습니다.",
      "실행계획에서 PSTART, PSTOP을 보고 pruning이 실제로 되었는지 확인합니다."
    ],
    hints: ["파티션 키 dt를 범위 조건으로 직접 사용한다.", "일자 함수로 컬럼을 감싸지 않는다.", "사원번호 조건은 인덱스 접근 후보로 둔다."],
    rubric: commonRubric
  },
  {
    title: "집계 인라인 뷰 병합 방지",
    difficulty: "중간",
    topic: "뷰 머징 제어",
    scenario: "주문상품을 먼저 집계한 뒤 상품과 조인해야 중복과 조인 비용을 줄일 수 있다. 뷰 병합을 막는 의도를 표현한다.",
    prompt:
      "order_items를 product_id별로 먼저 집계한 결과만 products와 조인하라. 옵티마이저가 집계 뷰를 바깥 쿼리로 병합하지 않게 힌트를 적어라.",
    expectedSql: `select /*+ no_merge(s) use_hash(p) */ p.category_cd, s.product_id, s.sale_amt
from (
  select product_id, sum(sale_amt) as sale_amt
  from order_items
  group by product_id
) s
join products p on p.product_id = s.product_id`,
    targetPlan: ["NO_MERGE inline view", "HASH GROUP BY before join", "HASH JOIN PRODUCTS"],
    oracleNotes: [
      ...commonOracleNotes,
      "NO_MERGE는 항상 좋은 힌트가 아니라, 집계 후 소량 결과를 조인해야 하는 의도가 있을 때 사용합니다.",
      "뷰 병합을 막으면 최적화 기회가 줄 수 있으므로 결과 건수와 중복 제거 목적을 같이 설명해야 합니다."
    ],
    hints: ["인라인 뷰에서 group by를 먼저 수행한다.", "바깥 쿼리 힌트에서 뷰 별칭을 지정한다.", "상품 조인은 집계 후에 한다."],
    rubric: commonRubric
  },
  {
    title: "정렬 생략을 노린 최근 주문 페이징",
    difficulty: "중간",
    topic: "Top-N / 소트 튜닝",
    scenario: "ORDER BY 정렬 비용을 줄이기 위해 주문일시 내림차순 인덱스 순서와 Top-N 조건을 맞춘다.",
    prompt:
      "특정 고객의 최근 주문 101~120번째 행을 조회하라. 정렬 기준은 결정적이어야 하고, 인덱스 역순 스캔을 유도하라.",
    expectedSql: `with numbered as (
  select /*+ index_desc(o idx_orders_cust_dt) */ o.order_id, o.order_dt, o.amount,
         row_number() over(order by o.order_dt desc, o.order_id desc) as rn
  from orders o
  where o.cust_id = 'C0000000042'
)
select order_id, order_dt, amount
from numbered
where rn between 101 and 120`,
    targetPlan: ["INDEX RANGE SCAN DESCENDING", "WINDOW SORT PUSHED RANK", "deterministic order by"],
    oracleNotes: [
      ...commonOracleNotes,
      "Top-N/페이징은 정렬 기준이 유일하지 않으면 페이지가 흔들릴 수 있습니다. order_id 같은 보조 정렬키가 필요합니다.",
      "Oracle에서는 row_number 분석 함수 또는 rownum inline view 패턴을 요구사항에 맞게 선택합니다."
    ],
    hints: ["고객 조건을 먼저 둔다.", "order_dt와 order_id를 함께 정렬한다.", "row_number 결과를 바깥에서 필터링한다."],
    rubric: commonRubric
  },
  {
    title: "DB Call 최소화를 위한 집합 SQL",
    difficulty: "중간",
    topic: "데이터베이스 Call 최소화",
    scenario: "고객을 루프 돌며 주문 합계를 한 명씩 조회하는 N+1 패턴을 집합 기반 SQL 하나로 바꾼다.",
    prompt:
      "최근 30일 동안 지역별 고객 주문금액 합계를 한 번에 구하라. 고객별 반복 SELECT가 아니라 GROUP BY 기반 집합 SQL로 작성하라.",
    expectedSql: `select c.region_cd, c.cust_id, c.cust_name, sum(o.amount) as order_amount
from customers c
join orders o on o.cust_id = c.cust_id
where o.order_dt >= current_date - interval '30 days'
group by c.region_cd, c.cust_id, c.cust_name
order by c.region_cd, order_amount desc`,
    targetPlan: ["single SQL call", "JOIN then GROUP BY", "no row-by-row loop"],
    oracleNotes: [
      ...commonOracleNotes,
      "짧은 SQL도 수만 번 호출되면 parse/execute/fetch call이 병목이 됩니다.",
      "PL/SQL에서는 BULK COLLECT, FORALL도 중요하지만, 가능하면 SQL 한 문장으로 처리하는 것이 먼저입니다."
    ],
    hints: ["루프를 SQL로 옮긴다.", "지역/고객 기준 GROUP BY를 작성한다.", "필요한 기간 조건을 SARGable하게 둔다."],
    rubric: commonRubric
  },
  {
    title: "로깅 최소화 배치의 대상 행 분리",
    difficulty: "실전",
    topic: "DML 튜닝 / 로깅 최소화",
    scenario: "50회 복기형의 nologging + append, 대량 delete 대체 전략을 SELECT 연습으로 바꿔 보존할 행 집합을 만든다.",
    prompt:
      "특정 파티션의 95%를 삭제해야 한다면 일반 DELETE보다 보존할 5%만 임시 테이블에 적재한 뒤 교체하는 전략을 고려한다. 보존 대상 행을 SELECT로 작성하라.",
    expectedSql: `select /*+ full(e) */ e.dt, e.empno, e.deptno, e.job_cd, e.sal
from emp_part e
where e.dt >= date '2026-02-01'
  and e.dt < date '2026-03-01'
  and e.job_cd <> 'Y'`,
    targetPlan: ["FULL scan target partition", "keep only survivor rows", "Oracle CTAS/APPEND/EXCHANGE/TRUNCATE strategy"],
    oracleNotes: [
      ...commonOracleNotes,
      "Oracle 실제 답안은 임시 테이블 nologging 생성, /*+ append */ direct path insert, 원 파티션 truncate 또는 exchange, 재적재 순서로 설명합니다.",
      "95% 삭제처럼 변경량이 매우 큰 경우 일반 DELETE는 undo/redo와 lock 부담이 커질 수 있습니다."
    ],
    hints: ["삭제할 95%가 아니라 보존할 5%를 생각한다.", "파티션 키 범위를 명확히 둔다.", "Oracle 단계는 해설에 따로 적는다."],
    rubric: commonRubric
  },
  {
    title: "인덱스 컬럼 순서 재검토용 조건 분해",
    difficulty: "중간",
    topic: "인덱스 설계",
    scenario: "선택도만 보고 인덱스 순서를 정하면 틀리기 쉽다. 등치 조건, 범위 조건, 정렬 조건 순서로 판단한다.",
    prompt:
      "orders에서 고객번호 등치, 주문일시 범위, 주문일시 내림차순 정렬이 반복된다. 어떤 컬럼이 선두가 되어야 하는지 드러나도록 SQL을 작성하라.",
    expectedSql: `select /*+ index(o idx_orders_cust_dt) */ o.order_id, o.order_dt, o.amount
from orders o
where o.cust_id = 'C0000000042'
  and o.order_dt >= date '2026-01-01'
  and o.order_dt < date '2026-07-01'
order by o.order_dt desc, o.order_id desc
limit 30`,
    targetPlan: ["cust_id equality first", "order_dt range second", "ORDER BY covered by index order"],
    oracleNotes: [
      ...commonOracleNotes,
      "복합 인덱스 컬럼 순서는 선택도만이 아니라 등치 조건, 범위 조건, 정렬 생략 가능성을 함께 봅니다.",
      "SQLP 실기에서는 새 인덱스가 필요하면 정확한 CREATE INDEX 컬럼 순서를 제시해야 할 수 있습니다."
    ],
    hints: ["등치 조건을 선두로 생각한다.", "범위 조건 이후 컬럼의 액세스 효과를 구분한다.", "정렬 요구사항까지 함께 본다."],
    rubric: commonRubric
  },
  {
    title: "현재 상태와 이력 테이블 기간 조인",
    difficulty: "중간",
    topic: "기간 조인 / 조인",
    scenario: "주문 시점에 유효한 상품이력을 찾는 문제다. BETWEEN 형태의 기간 조인과 outer join 보존을 함께 연습한다.",
    prompt:
      "주문상품의 주문시점 가격을 product_history에서 찾는다. 시작일 이상, 종료일 미만 기간 조건을 사용하고 이력이 없어도 주문상품 행은 남겨라.",
    expectedSql: `select /*+ leading(o oi ph) use_nl(oi) use_nl(ph) index(ph idx_product_history_period) */
  o.order_id,
  oi.product_id,
  ph.unit_price
from orders o
join order_items oi on oi.order_id = o.order_id
left join product_history ph
  on ph.product_id = oi.product_id
 and o.order_dt >= ph.start_dt
 and o.order_dt < ph.end_dt
where o.order_dt >= current_date - interval '14 days'`,
    targetPlan: ["NESTED LOOPS OUTER", "period index access", "date range predicate"],
    oracleNotes: [
      ...commonOracleNotes,
      "기간 조인은 종료일 포함 여부 때문에 중복 매칭이 생기기 쉽습니다. 시작일 이상, 종료일 미만 규칙이 안전합니다.",
      "기간 인덱스는 product_id와 start_dt/end_dt 조건이 access/filter 중 어디에 쓰이는지 확인해야 합니다."
    ],
    hints: ["주문일시를 기준 시점으로 둔다.", "기간 조건은 조인 조건에 둔다.", "이력 미존재 행을 보존하려면 left join을 유지한다."],
    rubric: commonRubric
  },
  {
    title: "실행계획 문제점 서술형 대비",
    difficulty: "실전",
    topic: "실행계획 진단",
    scenario: "50회처럼 실행계획을 보고 문제점과 개선점을 서술하는 유형에 대비해, SQL에서 어떤 근거를 찾아야 하는지 연습한다.",
    prompt:
      "emp_part에서 local index를 사용하지만 전체 파티션을 읽는 계획이 나온다고 가정한다. 파티션 키 조건을 보강한 개선 SQL을 작성하고, 그래도 전체 파티션이면 글로벌 인덱스나 인덱스 재설계를 설명할 수 있어야 한다.",
    expectedSql: `select /*+ index(e emp_part_x2) */ e.empno, e.deptno, e.job_cd
from emp_part e
where e.dt >= date '2026-07-01'
  and e.dt < date '2026-08-01'
  and e.job_cd = 'DBA'`,
    targetPlan: ["PSTART/PSTOP narrowed", "LOCAL INDEX RANGE SCAN", "diagnose PARTITION RANGE ALL if not narrowed"],
    oracleNotes: [
      ...commonOracleNotes,
      "PARTITION RANGE ALL이 보이면 파티션 키 조건 누락, 파티션 키 함수 변형, local index 구조가 현재 SQL에 맞지 않는지 의심합니다.",
      "서술형 답안은 '문제점 -> 근거 -> 개선안' 순서가 좋습니다. 예: 전체 파티션 탐색 -> PSTART/PSTOP ALL -> 파티션 키 범위 조건 또는 글로벌 인덱스 검토."
    ],
    hints: ["PSTART/PSTOP을 줄일 조건을 둔다.", "job_cd 조건만으로는 파티션 pruning이 되지 않는다.", "개선 근거를 실행계획 용어로 설명한다."],
    rubric: commonRubric
  }
];

function explainPlanItem(item: string): LabPlanExplanation {
  const upper = item.toUpperCase();
  const catalog: Array<[string, string, string]> = [
    ["COUNT STOPKEY", "COUNT STOPKEY - 정렬 또는 인덱스 순서에서 필요한 건수만 읽고 조기 중단", "Top-N 조건을 가능한 안쪽에 배치했는지 확인합니다."],
    ["INDEX RANGE SCAN DESCENDING", "INDEX RANGE SCAN DESCENDING - 인덱스 범위를 역순으로 스캔", "ORDER BY DESC와 인덱스 컬럼 순서가 맞으면 정렬 비용을 줄일 수 있습니다."],
    ["INDEX RANGE SCAN", "INDEX RANGE SCAN - 인덱스 시작점과 종료점을 잡아 범위 스캔", "access predicate가 실제 스캔 범위를 줄이는지가 핵심입니다."],
    ["INDEX UNIQUE SCAN", "INDEX UNIQUE SCAN - 유일 인덱스로 단건을 찾는 접근", "반복 횟수가 많으면 단건 접근도 누적 비용이 커집니다."],
    ["TABLE ACCESS BY INDEX ROWID", "TABLE ACCESS BY INDEX ROWID - 인덱스에서 얻은 ROWID로 테이블 방문", "ROWID 방문이 많으면 테이블 랜덤 액세스 비용을 따져야 합니다."],
    ["TABLE ACCESS FULL", "TABLE ACCESS FULL - 테이블 전체 또는 파티션 전체를 순차적으로 읽음", "대량 범위에서는 유리할 수 있지만 소량 조건이면 인덱스 후보를 봅니다."],
    ["NESTED LOOPS OUTER", "NESTED LOOPS OUTER - 기준 행을 보존하며 후행 테이블을 반복 탐색", "후행 인덱스와 보존 조건 위치가 중요합니다."],
    ["NESTED LOOPS", "NESTED LOOPS - 선행 집합의 각 행마다 후행 집합을 반복 탐색", "선행 집합이 작고 후행 인덱스가 효율적일 때 적합합니다."],
    ["HASH JOIN", "HASH JOIN - 한쪽 입력을 해시 테이블로 만들고 다른 쪽을 탐색", "대량 조인에서 유리하지만 메모리 부족 시 TEMP spill을 볼 수 있습니다."],
    ["HASH GROUP BY", "HASH GROUP BY - 해시 영역으로 그룹 집계를 수행", "입력 건수와 distinct 그룹 수, PGA/TEMP 부담을 함께 봅니다."],
    ["UNION-ALL", "UNION-ALL - 분기 결과를 중복 제거 없이 결합", "분기별 인덱스를 살릴 수 있지만 중복 방지 조건이 필요할 수 있습니다."],
    ["PARTITION RANGE", "PARTITION RANGE - 파티션 키 조건으로 읽을 파티션 범위 결정", "PSTART/PSTOP이 좁혀졌는지 확인해야 합니다."],
    ["PSTART/PSTOP", "PSTART/PSTOP - 파티션 시작/끝 번호", "ALL이면 파티션 프루닝 실패 가능성을 의심합니다."],
    ["WINDOW SORT PUSHED RANK", "WINDOW SORT PUSHED RANK - Top-N/분석 함수 순위 처리를 조기 적용", "정렬 기준이 결정적이고 제한 위치가 맞는지 봅니다."],
    ["SORT", "SORT - 정렬 또는 정렬 기반 집계/중복 제거", "인덱스 순서, GROUP BY 방식, DISTINCT 제거 가능성을 확인합니다."],
    ["NO_MERGE", "NO_MERGE - 인라인 뷰 병합 차단 의도", "집계 후 조인이나 Top-N 순서를 보존해야 할 때 사용합니다."],
    ["ANTI JOIN", "ANTI JOIN - 존재하지 않는 행을 찾는 조인", "NOT IN의 NULL 함정보다 NOT EXISTS가 안전한지 판단합니다."],
    ["SEMI JOIN", "SEMI JOIN - 존재 여부만 확인하는 조인", "중복 제거 없이 존재성만 판단할 때 효율적입니다."]
  ];
  const match = catalog.find(([needle]) => upper.includes(needle));

  return {
    operation: item,
    korean: match?.[1] ?? `${item} - 목표 실행계획에서 확인해야 할 처리 단계`,
    note: match?.[2] ?? "영문 Operation은 Oracle 표기를 유지하고, 해설에서 왜 필요한지 확인합니다."
  };
}

function buildTraceSummary(traceStats?: string): LabTraceSummaryRow[] {
  if (!traceStats) return [];
  const operationLines = traceStats
    .split("\n")
    .map((line) => line.trim())
    .filter((line) => /^\d+\s+/.test(line));
  const totals = operationLines.reduce(
    (acc, line) => {
      const parts = line.split(/\s+/);
      const maybeNumbers = parts.filter((part) => /^\d+$/.test(part));
      const time = parts.find((part) => /^\d{2}:\d{2}:\d{2}/.test(part));

      if (maybeNumbers.length >= 5) {
        const [rows, loop, pr, cr] = maybeNumbers.slice(-4).map(Number);
        acc.rows += rows;
        acc.loop = Math.max(acc.loop, loop);
        acc.pr += pr;
        acc.cr += cr;
      }

      if (time && !acc.time) acc.time = time;
      return acc;
    },
    { rows: 0, loop: 0, pr: 0, cr: 0, time: "" }
  );

  return [
    { metric: "Rows", value: totals.rows.toLocaleString("ko-KR"), meaning: "주요 Row Source에서 처리 또는 반환한 행 수 합계입니다. 실제 Oracle 측정값이 아니라 설명용 예시 기준입니다." },
    { metric: "Loop/Starts", value: totals.loop.toLocaleString("ko-KR"), meaning: "같은 오퍼레이션이 반복 수행되는 정도입니다. NL 조인 후행 접근이나 스칼라 조회에서 커질 수 있습니다." },
    { metric: "PR", value: totals.pr.toLocaleString("ko-KR"), meaning: "Physical Read 예시값입니다. 디스크 읽기 또는 캐시 미적중 가능성을 봅니다." },
    { metric: "CR", value: totals.cr.toLocaleString("ko-KR"), meaning: "Consistent Read 예시값입니다. Rows 대비 과하면 인덱스 효율, 조인 반복, 테이블 액세스를 의심합니다." },
    { metric: "Time", value: totals.time || "00:00:00.xx", meaning: "교육용 Trace에 표시된 경과 시간 예시입니다. 실제 실행 시간으로 단정하지 않습니다." }
  ];
}

function relatedConceptsForLab(lab: LabCase) {
  const ids = new Set<string>();
  if (hasAny(lab.topic, ["Trace", "트레이스", "TKPROF", "실행계획"])) ids.add("tuning-sql-trace");
  if (hasAny(lab.topic, ["인덱스", "스캔", "Top-N", "Predicate", "SARGable"])) ids.add("tuning-index-scan-efficiency");
  if (hasAny(lab.topic, ["테이블", "랜덤"])) ids.add("tuning-table-access");
  if (hasAny(lab.topic, ["NL", "조인", "Join"])) ids.add("tuning-nl-join");
  if (hasAny(lab.topic, ["해시", "Hash"])) ids.add("tuning-hash-join");
  if (hasAny(lab.topic, ["파티션", "Partition"])) ids.add("tuning-partitioning");
  if (hasAny(lab.topic, ["OR", "뷰", "서브쿼리", "쿼리"])) ids.add("tuning-query-transformation");
  if (hasAny(lab.topic, ["Sort", "정렬", "Group", "Distinct"])) ids.add("tuning-sort");
  if (!ids.size) ids.add("tuning-sql-trace");
  return Array.from(ids);
}

export const labQuestions: LabQuestion[] = sqlpLabCases.slice(0, 20).map((lab, index) => ({
  ...lab,
  id: `lab-${String(index + 1).padStart(2, "0")}`,
  number: index + 1,
  schemaSql: sqlpLabEnvironments[index]?.schemaSql ?? sqlpLabSchema,
  seedSql: sqlpLabEnvironments[index]?.seedSql ?? sqlpLabSeed,
  traceStats: labTrace(index),
  predicateInfo: labPredicate(index),
  targetPlanExplanations: lab.targetPlan.map(explainPlanItem),
  traceSummary: buildTraceSummary(labTrace(index)),
  simulationNotice: "이 실행계획과 SQL Trace는 첨부 자료와 복기 유형을 바탕으로 만든 SQLP 학습용 설명 예시입니다. 실제 Oracle에서 측정한 운영 실행 결과로 표시하지 않습니다.",
  relatedConceptIds: relatedConceptsForLab(lab)
}));

export function createLocalExtraQuestion(subjectId: SubjectId, count: number): ObjectiveQuestion {
  if (subjectId === "modeling") {
    return buildSubject(modeling, 1, 100 + count, "extra-modeling")[0];
  }

  if (subjectId === "sql-basic") {
    return buildSubject(sqlBasic, 1, 100 + count, "extra-sql-basic")[0];
  }

  return buildSubject(tuning, 1, 100 + count, "extra-tuning")[0];
}

export function createLocalExtraQuestions(subjectId: SubjectId, startCount: number, batchSize = 20): ObjectiveQuestion[] {
  return Array.from({ length: batchSize }, (_, offset) => createLocalExtraQuestion(subjectId, startCount + offset));
}

export function createLocalExtraLabQuestion(count: number): LabQuestion {
  const base = sqlpLabCases[count % sqlpLabCases.length];
  const env = sqlpLabEnvironments[count % sqlpLabEnvironments.length];
  const variant = Math.floor(count / sqlpLabCases.length) + 1;
  const number = 20 + count + 1;

  return {
    ...base,
    id: `lab-extra-${String(count + 1).padStart(3, "0")}`,
    number,
    title: `${base.title} 변형 ${variant}`,
    scenario: `${base.scenario} 같은 유형을 다른 조건으로 다시 풀어보는 추가 실습입니다.`,
    prompt: `${base.prompt}\n\n추가 조건: 같은 실행계획 의도를 유지하되 날짜 범위, 선행 집합, 조인 보존 조건이 바뀌어도 답안 구조가 흔들리지 않게 작성하세요.`,
    schemaSql: `${env?.schemaSql ?? sqlpLabSchema}\n\n[추가 변형 조건]\n- 같은 유형의 다른 회차 복원 문제처럼 테이블명과 조건값이 달라졌다고 가정합니다.\n- 목표는 암기한 SQL을 복붙하는 것이 아니라 실행계획 의도를 재현하는 것입니다.`,
    seedSql: `${env?.seedSql ?? sqlpLabSeed}\n\n[추가 출제 포인트]\n- 결과 보존 조건을 먼저 확인합니다.\n- 인덱스/힌트는 별칭이 바뀌어도 논리가 같아야 합니다.\n- COUNT STOPKEY, PSTART/PSTOP, OUTER JOIN 조건 위치, access/filter 구분을 설명할 수 있어야 합니다.`,
    targetPlanExplanations: base.targetPlan.map(explainPlanItem),
    simulationNotice: "이 추가 실습의 실행계획과 Trace는 검수 전 학습용 설명 예시입니다. 관리자 검수 후 공개하는 배치 후보로 봅니다.",
    relatedConceptIds: relatedConceptsForLab(base)
  };
}

export function createLocalExtraLabQuestions(startCount: number, batchSize = 5): LabQuestion[] {
  return Array.from({ length: batchSize }, (_, offset) => {
    const count = startCount + offset;
    return {
      ...createLocalExtraLabQuestion(count),
      traceStats: `${labTrace(count, offset)}\n\n추가 변형 포인트: 기준 Trace보다 Loop 또는 CR이 커지면 선행 집합 축소 위치를 먼저 의심합니다.`,
      predicateInfo: `${labPredicate(count, offset)}\n\n추가 변형 포인트: access 조건은 인덱스 진입 조건, filter 조건은 읽은 뒤 버리는 조건으로 나누어 서술합니다.`,
      traceSummary: buildTraceSummary(labTrace(count, offset))
    };
  });
}
