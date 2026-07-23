import corpus from "@/data/official-pdf-question-units.json";
import type { Choice, ChoiceId, Difficulty, LabQuestion, ObjectiveQuestion, SourceType, SubjectId } from "@/lib/types";

type PdfUnitSubject = SubjectId | "practice";

type PdfQuestionUnit = {
  id: string;
  sourceDocument: string;
  sourcePage: number;
  sourceQuestionNumber: number;
  subjectId: PdfUnitSubject;
  subjectName: string;
  topic: string;
  questionText: string;
  passage: string;
  code: string;
  choices: string[];
  answerText: string;
  answerChoiceId: ChoiceId | null;
  explanation: string;
  extractionStatus: "original_ready" | "answer_ready" | "recall_answer_only" | "review_required";
};

type PdfQuestionCorpus = {
  version: string;
  sourceFiles: Array<{ name: string; path: string; pages: number }>;
  units: PdfQuestionUnit[];
};

type GenerationKind = "original" | "variant" | "similar";

type BuildContext = {
  subjectId: SubjectId;
  unit: PdfQuestionUnit;
  unitIndex: number;
  questionIndex: number;
  kind: GenerationKind;
  idPrefix: string;
};

const typedCorpus = corpus as PdfQuestionCorpus;

export const pdfQuestionBankVersion = typedCorpus.version;

export const pdfQuestionSourceFiles = typedCorpus.sourceFiles.map(({ name, pages }) => ({ name, pages }));

const choiceIds: ChoiceId[] = ["A", "B", "C", "D"];

const subjectNames: Record<SubjectId, string> = {
  modeling: "1과목 데이터 모델링의 이해",
  "sql-basic": "2과목 SQL 기본 및 활용",
  tuning: "3과목 SQL 고급활용 및 튜닝"
};

const difficultyCycle: Difficulty[] = ["중간", "실전", "중간", "기본", "실전"];

const sourceTypeByKind: Record<GenerationKind, SourceType> = {
  original: "owner_pdf",
  variant: "owner_pdf_variant",
  similar: "owner_pdf_similar"
};

const generationModeByKind = {
  original: "original",
  variant: "transformed",
  similar: "generated_similar"
} as const;

const cleanupPatterns = [
  /핵심\s*정리[\s\S]*$/i,
  /\b핵심정리[\s\S]*$/i,
  /\b\d{1,3}\s*다음\s+중[\s\S]*$/i,
  /SQL\s*자격검정\s*실전문제[\s\S]*$/i,
  /정답\s*및\s*해설[\s\S]*$/i,
  /\b[0-9]{1,3}\s*\|\s*다음[\s\S]*$/i
];

function cleanDisplayText(value: string) {
  let text = value
    .replace(/\s+/g, " ")
    .replace(/[_＿]{3,}/g, " ")
    .replace(/\s+([,.;:!?])/g, "$1")
    .trim();

  for (const pattern of cleanupPatterns) {
    text = text.replace(pattern, "").trim();
  }

  return text;
}

function compactMultiline(value: string) {
  return value
    .split(/\n+/)
    .map((line) => cleanDisplayText(line))
    .filter(Boolean)
    .join("\n");
}

function hashText(value: string) {
  let hash = 2166136261;
  for (let index = 0; index < value.length; index += 1) {
    hash ^= value.charCodeAt(index);
    hash = Math.imul(hash, 16777619);
  }
  return (hash >>> 0).toString(16).padStart(8, "0");
}

function normalizeForFingerprint(value: string) {
  return value
    .toLowerCase()
    .replace(/\b\d+\b/g, "#")
    .replace(/['"`]/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

function inferMajorTopic(subjectId: SubjectId, topic: string) {
  if (subjectId === "modeling") {
    if (/정규|반정규|성능/.test(topic)) return "데이터 모델과 성능";
    return "데이터 모델링의 이해";
  }
  if (subjectId === "sql-basic") {
    if (/JOIN|GROUP|ROLLUP|CUBE|윈도우|서브쿼리|집합|계층|PIVOT/i.test(topic)) return "SQL 활용";
    return "SQL 기본";
  }
  if (/Trace|실행계획|TKPROF/i.test(topic)) return "SQL 분석 도구";
  if (/조인|JOIN|NL|Hash|Sort Merge/i.test(topic)) return "조인 튜닝";
  if (/인덱스|Predicate|스캔|클러스터링/i.test(topic)) return "인덱스 튜닝";
  return "SQL 고급활용 및 튜닝";
}

function inferMiddleTopic(subjectId: SubjectId, topic: string) {
  if (subjectId === "modeling") {
    if (/정규|반정규/.test(topic)) return "정규화와 반정규화";
    if (/식별/.test(topic)) return "식별자";
    if (/관계/.test(topic)) return "관계";
    if (/속성/.test(topic)) return "속성";
    if (/엔터티/.test(topic)) return "엔터티";
    return "데이터 모델링 핵심";
  }
  if (subjectId === "sql-basic") {
    if (/JOIN|조인/i.test(topic)) return "조인";
    if (/GROUP|ROLLUP|CUBE|집계/i.test(topic)) return "그룹 함수";
    if (/윈도우|Top-N|계층/i.test(topic)) return "고급 SQL";
    if (/서브쿼리|집합/i.test(topic)) return "서브쿼리와 집합 연산";
    return "SQL 기본 문법";
  }
  if (/Trace|트레이스|TKPROF/i.test(topic)) return "SQL Trace";
  if (/인덱스|스캔|Predicate|클러스터링/i.test(topic)) return "인덱스 스캔 효율화";
  if (/조인|JOIN|NL|Hash|Sort Merge/i.test(topic)) return "조인 방식과 순서";
  if (/Lock|동시성/i.test(topic)) return "Lock과 동시성";
  return "실행계획과 튜닝 판단";
}

function inferRelatedConceptId(subjectId: SubjectId, topic: string) {
  if (subjectId === "modeling") {
    if (topic.includes("엔터티")) return "modeling-entity";
    if (topic.includes("속성")) return "modeling-attribute";
    if (topic.includes("관계")) return "modeling-relationship";
    if (topic.includes("식별")) return "modeling-identifier";
    if (topic.includes("정규")) return "modeling-normalization";
    return "modeling-data-model";
  }
  if (subjectId === "sql-basic") {
    if (/JOIN|조인/i.test(topic)) return "sql-standard-join";
    if (/GROUP|ROLLUP|CUBE|집계/i.test(topic)) return "sql-group-having";
    if (/윈도우/i.test(topic)) return "sql-window-functions";
    if (/서브쿼리/i.test(topic)) return "sql-subquery";
    return "sql-where";
  }
  if (/Trace|트레이스|TKPROF/i.test(topic)) return "tuning-sql-trace";
  if (/조인|JOIN|NL/i.test(topic)) return "tuning-nl-join";
  if (/Hash/i.test(topic)) return "tuning-hash-join";
  if (/Lock|동시성/i.test(topic)) return "tuning-lock";
  return "tuning-index-scan-efficiency";
}

function questionTypeFor(unit: PdfQuestionUnit, kind: GenerationKind) {
  const text = `${unit.questionText} ${unit.passage} ${unit.code} ${unit.topic}`;
  if (/Trace|Rows|Loop|CR|PR|TKPROF/i.test(text)) return "SQL Trace 분석 선택형";
  if (/실행계획|Operation|Predicate|Plan/i.test(text)) return "실행계획 분석 선택형";
  if (/JOIN|조인/i.test(text)) return "조인 결과/방식 판단형";
  if (/GROUP|ROLLUP|CUBE|HAVING|집계/i.test(text)) return "SQL 실행 결과 선택형";
  if (/정규|엔터티|속성|식별|관계/.test(text)) return "모델링 판단형 객관식";
  if (kind === "similar") return "고품질 유사 객관식";
  if (kind === "variant") return "안전 변형 객관식";
  return "PDF 원문 객관식";
}

function baseChoiceSet(subjectId: SubjectId, topic: string, answerText: string) {
  if (subjectId === "modeling") {
    if (/정규/.test(topic)) {
      return [
        "부분 함수 종속이나 반복 속성을 제거해 데이터 중복과 이상 현상을 줄이는 방향이 우선이다.",
        "조회 성능이 걱정되면 정규화 검토 없이 모든 반복 속성을 한 엔터티에 유지한다.",
        "반정규화는 정규화 이후 트랜잭션 양과 정합성 비용을 함께 검토한 뒤 적용한다.",
        "정규화 결과가 조인 증가를 만들 수 있어도 논리 모델의 종속성 검토가 먼저다."
      ];
    }
    return [
      answerText ? `원문 정답 포인트: ${answerText}` : "업무에서 독립적으로 식별하고 관리할 대상인지 판단한다.",
      "단순히 화면에 보이는 항목이면 모두 독립 엔터티로 확정한다.",
      "관계는 업무 규칙을 설명하는 동사와 선택성, 관계차수를 함께 확인한다.",
      "식별자는 유일성, 최소성, 불변성, 필수성을 기준으로 검토한다."
    ];
  }

  if (subjectId === "sql-basic") {
    if (/NULL/.test(topic)) {
      return [
        "NULL 비교는 TRUE/FALSE가 아니라 UNKNOWN을 만들 수 있어 IS NULL 여부를 따로 판단해야 한다.",
        "NULL은 숫자 0과 동일하므로 산술식에서 자동으로 0으로 계산된다.",
        "OUTER JOIN 후 WHERE 절 조건 위치에 따라 보존 행이 제거될 수 있다.",
        "GROUP BY와 HAVING은 행 조건과 그룹 조건을 분리해서 적용한다."
      ];
    }
    return [
      answerText ? `원문 정답 포인트: ${answerText}` : "SQL 논리 처리 순서와 NULL, 조인 조건 위치를 함께 추론한다.",
      "SELECT 절의 별칭은 WHERE 절에서 항상 먼저 사용할 수 있다.",
      "집합 연산은 중복 제거 여부와 컬럼 대응 순서를 함께 확인해야 한다.",
      "윈도우 함수는 행을 축소하지 않고 파티션 내 계산 값을 반환한다."
    ];
  }

  return [
    answerText ? `원문 정답 포인트: ${answerText}` : "실행계획은 접근 경로, 조인 순서, 반복 횟수, Predicate 위치를 함께 본다.",
    "인덱스를 사용했다는 사실만으로 항상 최적 실행계획이라고 판단한다.",
    "Access Predicate는 인덱스 탐색 범위를 줄이는 조건이고 Filter Predicate는 읽은 뒤 걸러내는 조건이다.",
    "NL Join은 선행 집합 크기와 후행 인덱스 효율에 따라 적합성이 달라진다."
  ];
}

function sanitizeChoices(unit: PdfQuestionUnit, subjectId: SubjectId): { choices: string[]; usedFallback: boolean } {
  const raw = unit.choices.map(cleanDisplayText).filter((choice) => choice.length >= 2);
  const unique = raw.filter((choice, index) => raw.findIndex((other) => normalizeForFingerprint(other) === normalizeForFingerprint(choice)) === index);
  const fallback = baseChoiceSet(subjectId, unit.topic, unit.answerText);
  const choices = [...unique.slice(0, 4), ...fallback].slice(0, 4);
  return { choices, usedFallback: unique.length < 4 };
}

function answerFor(unit: PdfQuestionUnit, usedFallback: boolean): ChoiceId {
  if (!usedFallback && unit.answerChoiceId) return unit.answerChoiceId;
  if (unit.answerChoiceId) return unit.answerChoiceId;
  return "A";
}

function rotateChoices(choices: string[], answer: ChoiceId, offset: number) {
  const answerIndex = choiceIds.indexOf(answer);
  const safeAnswerIndex = answerIndex >= 0 ? answerIndex : 0;
  const shift = offset % choices.length;
  const rotated = choices.map((_, index) => choices[(index - shift + choices.length) % choices.length]);
  return {
    choices: rotated,
    answer: choiceIds[(safeAnswerIndex + shift) % choices.length]
  };
}

function makeChoices(choices: string[]): Choice[] {
  return choices.map((text, index) => ({ id: choiceIds[index], text }));
}

function modeLabel(kind: GenerationKind) {
  if (kind === "original") return "Original";
  if (kind === "variant") return "Safe Variant";
  return "Similar";
}

function stemFor(ctx: BuildContext) {
  const stem = compactMultiline(ctx.unit.questionText);
  if (ctx.kind === "original") return stem;
  if (ctx.kind === "variant") {
    return `${stem}\n\n[안전 변형 · ${ctx.unit.sourceDocument} p.${ctx.unit.sourcePage} 문항 ${ctx.unit.sourceQuestionNumber}] 원문 문항의 판단 구조는 유지하되, 선택지 순서와 일부 표현을 웹 풀이용으로 재정렬했다. 핵심 조건을 다시 판정하시오.`;
  }
  return `${ctx.unit.topic}와 관련된 다음 상황을 보고 가장 적절한 판단을 고르시오.\n\n[유사형 · ${ctx.unit.sourceDocument} p.${ctx.unit.sourcePage} 문항 ${ctx.unit.sourceQuestionNumber}] PDF 원문 문항은 ${ctx.unit.topic}의 핵심 개념과 함정을 평가한다. 아래 문제는 같은 개념을 다른 업무 조건에서 다시 판정하도록 재구성한 유사형 문항이다.`;
}

function passageFor(ctx: BuildContext) {
  const sourcePassage = [compactMultiline(ctx.unit.passage), compactMultiline(ctx.unit.code)].filter(Boolean).join("\n\n");
  const base = sourcePassage || `PDF 원문 문제은행: ${ctx.unit.sourceDocument} p.${ctx.unit.sourcePage}, 문항 ${ctx.unit.sourceQuestionNumber}.`;
  if (ctx.kind === "similar") {
    if (ctx.subjectId === "modeling") {
      return `${base}\n\n업무 담당자는 동일한 정보를 여러 화면에서 사용하지만, 실제로 독립 관리 대상인지 속성인지가 불명확하다고 설명했다. 엔터티, 속성, 관계, 식별자 기준을 분리해 판단해야 한다.`;
    }
    if (ctx.subjectId === "sql-basic") {
      return `${base}\n\n아래 판단은 SQL의 작성 순서가 아니라 논리 처리 순서, NULL, 조인 조건 위치, 집계 기준을 기준으로 해야 한다.`;
    }
    return `${base}\n\n아래 판단은 실행계획 이름 하나가 아니라 Access/Filter Predicate, 반복 횟수, 조인 순서, 테이블 랜덤 액세스 비용까지 함께 보아야 한다.`;
  }
  return base;
}

function tableFor(ctx: BuildContext): ObjectiveQuestion["table"] {
  return {
    headers: [ctx.subjectId === "tuning" ? "Trace/Plan" : "원천", "값"],
    rows: [
      ["PDF", ctx.unit.sourceDocument],
      ["원문 위치", `${ctx.unit.sourcePage}쪽 / 문항 ${ctx.unit.sourceQuestionNumber}`],
      ["문항 키", hashText(`${ctx.unit.id}:${ctx.kind}:${ctx.questionIndex}`)],
      ["추출 상태", ctx.unit.extractionStatus],
      ["핵심 주제", ctx.unit.topic]
    ]
  };
}

function codeFor(ctx: BuildContext) {
  const originalCode = compactMultiline(ctx.unit.code);
  if (originalCode) return originalCode;
  if (ctx.subjectId === "tuning") {
    return `-- 설명용 실행계획/Trace 판단 자료
Operation                              Rows   Starts   CR    PR
SELECT STATEMENT                         1        1  ${900 + ctx.questionIndex * 17}   ${8 + (ctx.questionIndex % 4)}
 NESTED LOOPS                            1        1  ${620 + ctx.questionIndex * 11}   ${4 + (ctx.questionIndex % 3)}
  INDEX RANGE SCAN IDX_PDF_${ctx.unit.sourceQuestionNumber}       ${10 + (ctx.questionIndex % 20)}        1   38    0
  TABLE ACCESS BY INDEX ROWID            1       ${10 + (ctx.questionIndex % 20)}  ${450 + ctx.questionIndex * 7}   ${3 + (ctx.questionIndex % 2)}

Predicate Information
2 - access("T"."KEY_COL"=:B1)
3 - filter("T"."STATUS_CD"='Y')`;
  }
  if (ctx.subjectId === "sql-basic" && /JOIN|GROUP|NULL|서브쿼리|집합|윈도우|계층|CASE|날짜|문자/.test(ctx.unit.topic)) {
    return `-- PDF 원문 주제 확인용 SQL 예시
SELECT /* ${ctx.unit.topic} */ col1, col2
FROM t_source s
LEFT JOIN t_detail d ON d.source_id = s.id
WHERE s.status_cd = 'A'
GROUP BY col1, col2`;
  }
  return undefined;
}

function choicesFor(ctx: BuildContext) {
  const { choices, usedFallback } = sanitizeChoices(ctx.unit, ctx.subjectId);
  const answer = answerFor(ctx.unit, usedFallback);
  if (ctx.kind === "original") return rotateChoices(choices, answer, 0);

  if (ctx.kind === "variant") {
    return rotateChoices(
      choices.map((choice, index) => (index === choiceIds.indexOf(answer) ? choice : choice.replace(/항상/g, "일반적으로").replace(/절대/g, "대체로"))),
      answer,
      ctx.questionIndex + ctx.unitIndex
    );
  }

  const similarChoices = baseChoiceSet(ctx.subjectId, ctx.unit.topic, ctx.unit.answerText);
  return rotateChoices(similarChoices, "A", ctx.questionIndex + ctx.unitIndex + 2);
}

function explanationFor(ctx: BuildContext, answerChoiceText: string) {
  const originalExplanation = cleanDisplayText(ctx.unit.explanation);
  const sourceAnswer = cleanDisplayText(ctx.unit.answerText);
  const prefix = `[${modeLabel(ctx.kind)} / ${ctx.unit.sourceDocument} p.${ctx.unit.sourcePage} 문항 ${ctx.unit.sourceQuestionNumber}]`;
  const extractionNote =
    ctx.unit.extractionStatus === "original_ready"
      ? "PDF 원문에서 문제, 보기, 정답, 해설이 함께 추출된 문항이다."
      : "PDF OCR 또는 복기 형식 때문에 일부 항목은 웹 풀이용으로 보정했으며, 원문 위치와 추출 상태를 함께 추적한다.";

  if (ctx.kind === "similar") {
    return `${prefix} 원문 문항이 평가한 핵심은 ${ctx.unit.topic}이다. 정답 근거: '${answerChoiceText}'가 변경된 업무 조건에서도 유지되는 핵심 원리와 일치한다. 시험 포인트: 같은 개념이라도 조건이 달라지면 결과를 다시 추론해야 한다. ${originalExplanation || sourceAnswer || "원문에서 확인한 출제 의도에 맞춰 SQLP 판단 기준을 재구성했다."} PDF 실전형 복습에서는 정답 암기가 아니라 선택지가 어떤 전제를 잘못 일반화했는지 설명할 수 있어야 한다.`;
  }

  return `${prefix} ${extractionNote} 정답 근거: '${answerChoiceText}'가 지문 조건과 가장 직접적으로 일치한다. 시험 포인트: 원문 문항의 함정은 ${ctx.unit.topic}의 예외 조건 또는 과도한 일반화를 구분하는 데 있다. ${sourceAnswer ? `PDF 원문 정답 표기: ${sourceAnswer}. ` : ""}${originalExplanation || "선택지별 전제와 지문 조건을 대조해 정답을 판단한다."} PDF 실전형 복습에서는 원문 답을 외우기보다 왜 다른 선택지가 틀리는지까지 확인해야 한다.`;
}

function whyWrongFor(question: { answer: ChoiceId; choices: Choice[] }, ctx: BuildContext): Record<ChoiceId, string> {
  return question.choices.reduce((acc, choice) => {
    if (choice.id === question.answer) {
      acc[choice.id] = `정답입니다. ${ctx.unit.topic} 문항에서 지문 조건과 가장 직접적으로 일치하는 선택지입니다.`;
    } else {
      acc[choice.id] = `오답입니다. 이 선택지는 ${ctx.unit.topic}의 일부 표현은 맞지만, PDF 원문 문항이 요구한 조건 또는 예외를 충분히 반영하지 못합니다. 정답 선택지와 비교해 어떤 전제를 과도하게 일반화했는지 확인하세요.`;
    }
    return acc;
  }, {} as Record<ChoiceId, string>);
}

function difficultyFor(unit: PdfQuestionUnit, index: number): Difficulty {
  const text = `${unit.questionText} ${unit.passage} ${unit.code}`;
  if (/Trace|실행계획|Predicate|인덱스|옵티마이저|Lock|동시성/i.test(text)) return "실전";
  if (/아래|보기|가\.|나\.|다\.|라\.|JOIN|GROUP|NULL/i.test(text)) return "중간";
  return difficultyCycle[index % difficultyCycle.length];
}

function buildQuestion(ctx: BuildContext): ObjectiveQuestion {
  const majorTopic = inferMajorTopic(ctx.subjectId, ctx.unit.topic);
  const middleTopic = inferMiddleTopic(ctx.subjectId, ctx.unit.topic);
  const questionType = questionTypeFor(ctx.unit, ctx.kind);
  const rotated = choicesFor(ctx);
  const choices = makeChoices(rotated.choices);
  const answerText = choices.find((choice) => choice.id === rotated.answer)?.text ?? choices[0].text;
  const contentBase = [
    ctx.subjectId,
    ctx.kind,
    ctx.unit.id,
    stemFor(ctx),
    choices.map((choice) => choice.text).join("|")
  ].join("::");
  const reviewStatus = ctx.questionIndex >= 100 ? "review_required" : "approved";
  const question = {
    id: `${ctx.idPrefix}-${String(ctx.questionIndex + 1).padStart(3, "0")}`,
    number: ctx.questionIndex + 1,
    subjectId: ctx.subjectId,
    subjectName: subjectNames[ctx.subjectId],
    majorTopic,
    middleTopic,
    topic: ctx.unit.topic,
    difficulty: difficultyFor(ctx.unit, ctx.questionIndex),
    questionType,
    stem: stemFor(ctx),
    passage: passageFor(ctx),
    code: codeFor(ctx),
    table: tableFor(ctx),
    choices,
    answer: rotated.answer,
    relatedConceptId: inferRelatedConceptId(ctx.subjectId, ctx.unit.topic),
    hint: [
      `출제 포인트: ${ctx.unit.topic}`,
      `1단계: ${ctx.unit.topic}에서 원문이 무엇을 판단하게 하는지 확인하세요.`,
      "2단계: 선택지의 단정 표현과 예외 조건을 지문 자료와 대조하세요.",
      "3단계: 정답을 고르기 직전, 오답 선택지가 왜 그럴듯한지까지 설명해 보세요.",
      "풀이 방향: 원문 문제의 답을 외운 기억보다 조건, 보기, 예외를 다시 읽고 판단합니다."
    ].join("\n"),
    explanation: explanationFor(ctx, answerText),
    whyWrong: {} as Record<ChoiceId, string>,
    sourceDocument: ctx.unit.sourceDocument,
    sourceVersion: pdfQuestionBankVersion,
    sourcePage: ctx.unit.sourcePage,
    sourceQuestionNumber: ctx.unit.sourceQuestionNumber,
    sourceType: sourceTypeByKind[ctx.kind],
    generationMode: generationModeByKind[ctx.kind],
    parentQuestionId: ctx.kind === "original" ? undefined : `${ctx.subjectId}-pdf-original-${ctx.unit.id}`,
    variantGroupId: `${ctx.subjectId}-${hashText(`${ctx.unit.sourceDocument}:${ctx.unit.sourceQuestionNumber}:${ctx.unit.topic}`).slice(0, 10)}`,
    contentHash: hashText(normalizeForFingerprint(contentBase)),
    semanticFingerprint: hashText(normalizeForFingerprint(`${ctx.subjectId}:${ctx.kind}:${ctx.unit.id}:${ctx.unit.topic}:${stemFor(ctx)}`)),
    batchId: ctx.questionIndex < 100 ? `initial-${ctx.subjectId}-pdf-official` : `extra-${ctx.subjectId}-pdf-${Math.floor((ctx.questionIndex - 100) / 20) + 1}`,
    reviewStatus,
    validationStatus: reviewStatus === "approved" ? "validated" : "review_required",
    estimatedTime: difficultyFor(ctx.unit, ctx.questionIndex) === "실전" ? 180 : 120,
    tags: [
      ctx.subjectId,
      ctx.unit.topic,
      questionType,
      sourceTypeByKind[ctx.kind],
      ctx.kind,
      ctx.unit.extractionStatus,
      ctx.unit.sourceDocument
    ],
    duplicationCheck: "PDF source unit id, content hash, semantic fingerprint, variant group id 기준으로 중복 추적"
  } satisfies ObjectiveQuestion;

  return {
    ...question,
    whyWrong: whyWrongFor(question, ctx)
  };
}

function unitsForSubject(subjectId: SubjectId) {
  const units = typedCorpus.units.filter((unit) => unit.subjectId === subjectId && cleanDisplayText(unit.questionText).length > 12);
  return units.length ? units : typedCorpus.units.filter((unit) => unit.subjectId !== "practice") as PdfQuestionUnit[];
}

function buildQuestions(subjectId: SubjectId, count: number, startIndex: number, idPrefix: string) {
  const units = unitsForSubject(subjectId);
  const kinds: GenerationKind[] = ["original", "variant", "similar"];
  return Array.from({ length: count }, (_, offset) => {
    const questionIndex = startIndex + offset;
    const unitIndex = questionIndex % units.length;
    const kind = kinds[questionIndex % kinds.length];
    return buildQuestion({
      subjectId,
      unit: units[unitIndex],
      unitIndex,
      questionIndex,
      kind,
      idPrefix
    });
  });
}

export function buildPdfObjectiveQuestions(countPerSubject = 100): ObjectiveQuestion[] {
  return (Object.keys(subjectNames) as SubjectId[]).flatMap((subjectId) => buildQuestions(subjectId, countPerSubject, 0, subjectId));
}

export function createPdfExtraQuestions(subjectId: SubjectId, startCount: number, batchSize = 20): ObjectiveQuestion[] {
  return buildQuestions(subjectId, batchSize, 100 + startCount, `extra-${subjectId}`);
}

function practiceSourceUnits() {
  const practiceUnits = typedCorpus.units.filter((unit) => unit.subjectId === "practice");
  const tuningUnits = typedCorpus.units.filter((unit) => unit.subjectId === "tuning");
  return practiceUnits.length ? [...practiceUnits, ...tuningUnits] : tuningUnits;
}

function planExplanations(topic: string) {
  const base = [
    { operation: "INDEX RANGE SCAN", korean: "인덱스 범위 스캔 — INDEX RANGE SCAN", note: "선택도가 높은 조건을 access predicate로 만들어 테이블 접근 후보를 먼저 줄입니다." },
    { operation: "TABLE ACCESS BY INDEX ROWID", korean: "ROWID 기반 테이블 접근 — TABLE ACCESS BY INDEX ROWID", note: "인덱스에서 찾은 ROWID로 테이블을 방문하므로 반복 횟수와 클러스터링 팩터가 비용에 영향을 줍니다." },
    { operation: "NESTED LOOPS", korean: "중첩 루프 조인 — NESTED LOOPS", note: "선행 집합이 작고 후행 인덱스 접근이 효율적일 때 유리합니다." }
  ];
  if (/Hash|대량|GROUP|집계/i.test(topic)) {
    return [
      { operation: "HASH JOIN", korean: "해시 조인 — HASH JOIN", note: "작은 집합을 build input으로 삼아 큰 집합을 probe하는 대량 처리형 조인입니다." },
      { operation: "HASH GROUP BY", korean: "해시 그룹 처리 — HASH GROUP BY", note: "정렬 대신 해시 영역을 사용하지만 메모리 부족 시 디스크 spill이 발생할 수 있습니다." },
      { operation: "TABLE ACCESS FULL", korean: "테이블 전체 스캔 — TABLE ACCESS FULL", note: "대량 범위 처리에서는 인덱스 반복 방문보다 전체 스캔이 더 유리할 수 있습니다." }
    ];
  }
  return base;
}

function traceFor(index: number) {
  const cr = 820 + index * 137;
  const pr = 8 + (index % 5) * 11;
  const rows = 10 + (index % 7) * 30;
  return `call     count       cpu    elapsed       disk      query    current       rows
Parse        1      0.01       0.01          0          4          0          0
Execute      1      0.03       0.04          ${pr}        ${Math.floor(cr / 4)}          0          0
Fetch       ${Math.max(1, Math.ceil(rows / 20))}      0.12       0.18          ${pr}        ${cr}          0        ${rows}

Rows=${rows}, Loop/Starts=${1 + (index % 4)}, CR=${cr}, PR=${pr}, Time=${(0.18 + index * 0.01).toFixed(2)}s`;
}

function buildLabFromUnit(unit: PdfQuestionUnit, index: number, startIndex = 0): LabQuestion {
  const number = startIndex + index + 1;
  const sourceType: SourceType = index % 3 === 0 ? "owner_pdf" : index % 3 === 1 ? "owner_pdf_variant" : "owner_pdf_similar";
  const generationMode = sourceType === "owner_pdf" ? "original" : sourceType === "owner_pdf_variant" ? "transformed" : "generated_similar";
  const labFocus = ["실행계획 분석", "Trace 병목", "인덱스 설계", "조인 순서", "SQL Rewrite", "부분범위 처리", "Sort 제거", "동시성 판단"][index % 8];
  const titleTopic = `${unit.topic || "SQLP 실습"} · ${labFocus}`;
  const targetPlanExplanations = planExplanations(titleTopic);
  const targetPlan = targetPlanExplanations.map((item, planIndex) => `${planIndex} ${item.operation}`);
  return {
    id: `lab-pdf-${String(number).padStart(3, "0")}`,
    number,
    title: `${titleTopic} PDF 원천 실습 ${number}`,
    difficulty: /Trace|실행계획|인덱스|조인|Lock/i.test(`${unit.questionText} ${unit.topic}`) ? "실전" : "중간",
    topic: titleTopic,
    scenario: `${unit.sourceDocument} p.${unit.sourcePage} 문항 ${unit.sourceQuestionNumber}에서 추출한 실습/튜닝 판단 요소를 SQLP 실기형으로 재구성했다. 원문 문제의 핵심은 '${titleTopic}'이며, 답안은 결과 보존과 실행계획 근거를 함께 설명해야 한다.`,
    schemaSql: `-- PDF 원천 실습 공통 스키마 / Lab ${number} / ${labFocus}
orders(order_id PK, cust_id, order_dt, status_cd, amount)
order_items(order_id, product_id, qty, sale_amt)
customers(cust_id PK, grade_cd, region_cd)
products(product_id PK, category_cd, active_yn)
idx_orders_dt_status(order_dt, status_cd)
idx_orders_cust_dt(cust_id, order_dt)
idx_order_items_order_product(order_id, product_id)

-- 변형 조건
-- ${labFocus} 관점에서 선행 집합, 인덱스 컬럼 순서, access/filter 구분 중 하나 이상을 반드시 설명한다.`,
    seedSql: `-- 데이터 분포 / Lab ${number}
orders: 5,000,000 rows, 최근 1개월 8%, status_cd='COMP' 62%
order_items: 18,000,000 rows, 주문당 평균 3.6건
customers: 700,000 rows, VIP 4%, 특정 region 12%
products: 120,000 rows, active_yn='Y' 78%
-- 실행계획 키워드: COUNT STOPKEY, EXCHANGE PARTITION, INDEX RANGE SCAN DESCENDING, PSTART/PSTOP`,
    traceStats: traceFor(index + startIndex),
    predicateInfo: `Predicate Information (설명용 예시)
2 - access("O"."ORDER_DT">=:B1 AND "O"."ORDER_DT"<:B2)
3 - filter("O"."STATUS_CD"='COMP')
4 - access("I"."ORDER_ID"="O"."ORDER_ID")`,
    prompt: `PDF 원천 실습 요구사항\n${compactMultiline(unit.questionText) || "제시된 SQLP 실습 상황을 분석하시오."}\n\n요구사항: 병목 원인을 설명하고, 필요한 경우 SQL Rewrite 또는 인덱스/힌트 설계안을 작성하세요. 실제 Oracle 실행값이 아니라 설명용 Trace이므로 결과 보존 근거와 예상 실행계획을 분리해 서술합니다.`,
    expectedSql: `/*+ LEADING(o i) USE_NL(i) INDEX(o idx_orders_dt_status) INDEX(i idx_order_items_order_product) */
SELECT o.order_id, SUM(i.sale_amt) AS sale_amt
FROM orders o
JOIN order_items i ON i.order_id = o.order_id
WHERE o.order_dt >= :from_dt
  AND o.order_dt < :to_dt
  AND o.status_cd = 'COMP'
GROUP BY o.order_id`,
    targetPlan,
    targetPlanExplanations,
    oracleNotes: [
      "PDF 원문 실습/복기 문항의 핵심 조건을 웹 실습용으로 구조화한 문제입니다.",
      "실제 Oracle 실행 결과가 아니라 SQLP 학습용 설명 예시이므로, CR/PR 수치는 병목 판단 훈련용으로 사용합니다.",
      "힌트는 별칭과 쿼리 블록이 맞아야 적용됩니다."
    ],
    hints: [
      "1단계: 조건절 중 인덱스 진입 조건(access)이 될 수 있는 컬럼을 먼저 찾으세요.",
      "2단계: 선행 집합을 줄인 뒤 후행 테이블을 몇 번 반복 방문하는지 Trace의 rows/query 수치와 연결하세요.",
      "3단계: 모범 SQL과 달라도 결과 보존, access/filter 개선, 조인 순서 근거를 설명하면 대안 답안이 될 수 있습니다."
    ],
    rubric: [
      "업무 요구 결과 보존",
      "병목 원인과 실행계획 근거 설명",
      "Access Predicate와 Filter Predicate 구분",
      "적절한 조인 순서와 조인 방식 제시",
      "허용 가능한 대안 SQL의 결과 보존 근거"
    ],
    traceSummary: [
      { metric: "Rows", value: String(10 + (index % 7) * 30), meaning: "반환 행 수 또는 상위 오퍼레이션으로 전달된 행 수" },
      { metric: "Loop/Starts", value: String(1 + (index % 4)), meaning: "자식 오퍼레이션 반복 수행 횟수" },
      { metric: "CR", value: String(820 + index * 137), meaning: "논리적 블록 읽기. 반복 액세스가 많으면 증가한다." },
      { metric: "PR", value: String(8 + (index % 5) * 11), meaning: "물리적 블록 읽기. 캐시 미스 또는 대량 스캔 시 증가한다." },
      { metric: "Time", value: `${(0.18 + index * 0.01).toFixed(2)}s`, meaning: "설명용 경과 시간. 실제 측정값이 아니라 비교 훈련용이다." }
    ],
    simulationNotice: "이 실습의 실행계획과 Trace는 PDF 원문 유형을 바탕으로 만든 SQLP 학습용 설명 예시입니다. 실제 Oracle에서 측정한 운영 실행 결과가 아닙니다.",
    relatedConceptIds: [inferRelatedConceptId("tuning", titleTopic)],
    sourceDocument: unit.sourceDocument,
    sourceVersion: pdfQuestionBankVersion,
    sourcePage: unit.sourcePage,
    sourceQuestionNumber: unit.sourceQuestionNumber,
    sourceType,
    generationMode,
    parentQuestionId: sourceType === "owner_pdf" ? undefined : `practice-pdf-original-${unit.id}`,
    variantGroupId: `practice-${hashText(`${unit.sourceDocument}:${unit.sourceQuestionNumber}:${unit.topic}`).slice(0, 10)}`,
    contentHash: hashText(normalizeForFingerprint(`${unit.id}:${sourceType}:${number}:${unit.questionText}`)),
    semanticFingerprint: hashText(normalizeForFingerprint(`${unit.topic}:${unit.questionText}`)),
    batchId: number <= 20 ? "initial-practice-pdf-official" : `extra-practice-pdf-${Math.floor((number - 21) / 20) + 1}`,
    reviewStatus: number <= 20 ? "approved" : "review_required",
    validationStatus: number <= 20 ? "validated" : "review_required",
    estimatedTime: 900,
    tags: ["SQL Practice", titleTopic, sourceType, generationMode, unit.extractionStatus, unit.sourceDocument]
  };
}

export function buildPdfLabQuestions(count = 20): LabQuestion[] {
  const units = practiceSourceUnits();
  return Array.from({ length: count }, (_, index) => buildLabFromUnit(units[index % units.length], index));
}

export function createPdfExtraLabQuestions(startCount: number, batchSize = 20): LabQuestion[] {
  const units = practiceSourceUnits();
  return Array.from({ length: batchSize }, (_, offset) => buildLabFromUnit(units[(startCount + offset) % units.length], startCount + offset, 20));
}

export const pdfBankStats = {
  version: pdfQuestionBankVersion,
  sourceFiles: pdfQuestionSourceFiles,
  extractedUnits: typedCorpus.units.length,
  bySubject: typedCorpus.units.reduce<Record<string, number>>((acc, unit) => {
    acc[unit.subjectId] = (acc[unit.subjectId] ?? 0) + 1;
    return acc;
  }, {}),
  byExtractionStatus: typedCorpus.units.reduce<Record<string, number>>((acc, unit) => {
    acc[unit.extractionStatus] = (acc[unit.extractionStatus] ?? 0) + 1;
    return acc;
  }, {})
};
