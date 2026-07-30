const fs = require("fs");
const path = require("path");
const Module = require("module");
const ts = require("typescript");

const root = process.cwd();
const reportPath = path.join(root, "docs", "PROBLEM_BANK_AUDIT_2026-07-30.md");

const originalResolveFilename = Module._resolveFilename;
Module._resolveFilename = function resolveAlias(request, parent, isMain, options) {
  if (request.startsWith("@/")) {
    request = path.join(root, request.slice(2));
  }
  return originalResolveFilename.call(this, request, parent, isMain, options);
};

require.extensions[".ts"] = function compileTs(module, filename) {
  const source = fs.readFileSync(filename, "utf8");
  const output = ts.transpileModule(source, {
    compilerOptions: {
      module: ts.ModuleKind.CommonJS,
      target: ts.ScriptTarget.ES2020,
      jsx: ts.JsxEmit.ReactJSX,
      esModuleInterop: true
    },
    fileName: filename
  }).outputText;
  module._compile(output, filename);
};

const { objectiveQuestions, labQuestions, conceptArticles } = require(path.join(root, "lib", "problem-bank.ts"));

const subjectLabel = {
  modeling: "1과목",
  "sql-basic": "2과목",
  tuning: "3과목"
};

const conceptIds = new Set(conceptArticles.map((item) => item.id));

const questionsBySubject = {
  modeling: objectiveQuestions.filter((question) => question.subjectId === "modeling"),
  "sql-basic": objectiveQuestions.filter((question) => question.subjectId === "sql-basic"),
  tuning: objectiveQuestions.filter((question) => question.subjectId === "tuning")
};

function textParts(value) {
  if (!value) return [];
  if (typeof value === "string") return [value];
  if (Array.isArray(value)) return value.flatMap(textParts);
  if (typeof value === "object") return Object.values(value).flatMap(textParts);
  return [String(value)];
}

function visibleQuestionText(question) {
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
    question.visualAssets,
    question.table,
    question.tables,
    question.choices,
    question.hint,
    question.explanation,
    question.whyWrong
  ]
    .flatMap(textParts)
    .filter(Boolean)
    .join("\n");
}

function visibleLabText(lab) {
  return [
    lab.title,
    lab.difficulty,
    lab.topic,
    lab.scenario,
    lab.schemaSql,
    lab.seedSql,
    lab.visualAssets,
    lab.sampleData,
    lab.traceStats,
    lab.predicateInfo,
    lab.prompt,
    lab.expectedSql,
    lab.targetPlan,
    lab.targetPlanExplanations,
    lab.oracleNotes,
    lab.hints,
    lab.rubric,
    lab.traceSummary,
    lab.simulationNotice,
    lab.relatedConceptIds
  ]
    .flatMap(textParts)
    .filter(Boolean)
    .join("\n");
}

function normalize(value) {
  return String(value ?? "")
    .toLowerCase()
    .replace(/'[^']*'/g, "'#'")
    .replace(/"[^"]*"/g, '"#"')
    .replace(/\b\d{2,}\b/g, "#")
    .replace(/[a-z_][a-z0-9_$#]{2,}/g, "id")
    .replace(/[가-힣]{1,2}_[a-z0-9_]+/g, "id")
    .replace(/\s+/g, " ")
    .trim();
}

function grams(value) {
  const compact = normalize(value).replace(/\s+/g, "");
  const set = new Set();
  for (let i = 0; i < compact.length - 2; i += 1) set.add(compact.slice(i, i + 3));
  return set;
}

function jaccard(a, b) {
  const left = grams(a);
  const right = grams(b);
  if (!left.size || !right.size) return 0;
  let intersection = 0;
  for (const item of left) if (right.has(item)) intersection += 1;
  return intersection / (left.size + right.size - intersection);
}

function displayQuestion(question) {
  const bucket = questionsBySubject[question.subjectId] ?? [];
  const displayIndex = bucket.indexOf(question) + 1;
  const number = displayIndex > 0 ? displayIndex : question.number;
  return `${subjectLabel[question.subjectId]} ${number}번`;
}

function displayLab(lab) {
  return `실기 ${lab.number}번`;
}

function addIssue(list, issue) {
  list.push(issue);
}

const objectiveIssues = [];
const labIssues = [];
const imageCandidates = [];
const sourceRecheck = [];

const bannedPatterns = [
  { pattern: /�|㉧|公|分|往|幻|務|凶/, reason: "깨진 문자 또는 OCR 잔여 문자 가능성" },
  { pattern: /sourceDocument|sourceType|generationMode|review_required|original_ready/i, reason: "관리자 메타데이터 노출 가능성" },
  { pattern: /PDF 원문 문항|유사형 문항|\[[^\]]+\.pdf\s+p\./i, reason: "문제 유형 또는 PDF 출처 문구 노출 가능성" },
  { pattern: /\bF\s+R\s+O\s+M\b|\bSELEC\s+T\b|\bU\s+N\s*I\s*O\s+N\b|\bN\s+U\s+LL\b/i, reason: "SQL 키워드 비정상 분리 가능성" }
];

const materialTokens = [
  "CREATE TABLE",
  "ALTER TABLE",
  "INSERT INTO",
  "DELETE FROM",
  "SELECT ",
  " FROM ",
  " WHERE ",
  " GROUP BY ",
  " ORDER BY ",
  "REFERENCES",
  "실행계획",
  "TRACE",
  "TKPROF"
];

for (const question of objectiveQuestions) {
  const text = visibleQuestionText(question);
  const title = displayQuestion(question);
  const hasStructuredMaterial = Boolean(question.passage || question.code || question.table || question.tables?.length);
  const upperStem = question.stem.toUpperCase();
  const materialHitsInStem = materialTokens.filter((token) => upperStem.includes(token)).length;
  const sqlChoiceCount = question.choices.filter((choice) => /\bselect\b|\bupdate\b|\bmerge\b|\bcreate\b|\binsert\b|\bdelete\b/i.test(choice.text)).length;
  const longestChoice = Math.max(...question.choices.map((choice) => choice.text.length));
  const totalTableRows = (question.table ? question.table.rows.length : 0) + (question.tables ?? []).reduce((sum, table) => sum + table.rows.length, 0);
  const codeLines = (question.code ?? "").split(/\r?\n/).filter(Boolean).length;
  const fullQuestionImageAssets = (question.visualAssets ?? []).filter((asset) => {
    const assetText = textParts(asset).join(" ");
    return /선택지|보기|문항|원문|문제 전체|전체 캡처|대조 자료/i.test(assetText);
  });

  for (const { pattern, reason } of bannedPatterns) {
    if (pattern.test(text)) {
      addIssue(objectiveIssues, {
        severity: "BLOCKER",
        item: title,
        id: question.id,
        category: "깨진 표시",
        reason,
        action: "사용자 표시 필드 원문을 다시 대조하고 정식 공개 전 수정"
      });
    }
  }

  if (!hasStructuredMaterial && (materialHitsInStem >= 2 || /\bselect\b.+\bfrom\b/i.test(question.stem))) {
    addIssue(objectiveIssues, {
      severity: "HIGH",
      item: title,
      id: question.id,
      category: "자료 뭉침",
      reason: "SQL, DDL, 표, 실행계획으로 보이는 내용이 stem에 뭉쳐 있을 가능성",
      action: "stem과 code/table/passage를 분리해 재배치"
    });
  }

  if (!question.relatedConceptId || !conceptIds.has(question.relatedConceptId)) {
    addIssue(objectiveIssues, {
      severity: "MEDIUM",
      item: title,
      id: question.id,
      category: "관련 개념 연결",
      reason: `관련 개념 ID가 없거나 존재하지 않음: ${question.relatedConceptId ?? "없음"}`,
      action: "실제 개념정리 문서 ID로 연결"
    });
  }

  for (const choice of question.choices) {
    const explanation = question.whyWrong?.[choice.id] ?? "";
    if (explanation.length < 20) {
      addIssue(objectiveIssues, {
        severity: "MEDIUM",
        item: title,
        id: question.id,
        category: "선택지별 해설",
        reason: `${choice.id} 선택지 해설이 너무 짧거나 없음`,
        action: "왜 맞고 왜 틀렸는지 선택지별로 보강"
      });
    }
  }

  if (fullQuestionImageAssets.length) {
    addIssue(objectiveIssues, {
      severity: "HIGH",
      item: title,
      id: question.id,
      category: "이미지 자료",
      reason: "이미지 설명상 문제 본문/선택지까지 포함한 전체 캡처일 가능성",
      action: "사용자 화면에는 표, ERD, 실행계획, Trace 등 풀이 자료만 이미지로 분리하고 전체 문제 캡처는 제거"
    });
  }

  if ((question.difficulty.includes("기본") || question.difficulty.includes("湲")) && !hasStructuredMaterial && question.stem.length < 55 && longestChoice < 30) {
    addIssue(objectiveIssues, {
      severity: "LOW",
      item: title,
      id: question.id,
      category: "난이도",
      reason: "자료 없이 짧은 정의형 문항이라 SQLP 대비용으로 지나치게 쉬울 수 있음",
      action: "동일 개념을 판단형 또는 사례형으로 보강할지 검토"
    });
  }

  if (question.sourceType === "owner_pdf" && !question.sourceQuestionNumber) {
    sourceRecheck.push({
      item: title,
      id: question.id,
      reason: "Original 계열인데 원문 문항 번호가 비어 있어 PDF 1:1 대조 추적이 약함",
      action: "원본 PDF 페이지와 문항 번호를 수동 확인"
    });
  }

  if (sqlChoiceCount >= 2 || longestChoice > 170 || codeLines >= 12 || totalTableRows >= 10 || /ERD|Trace|TKPROF|실행계획/i.test(text)) {
    imageCandidates.push({
      item: title,
      id: question.id,
      reason: [
        sqlChoiceCount >= 2 ? `SQL 선택지 ${sqlChoiceCount}개` : "",
        longestChoice > 170 ? `긴 선택지 ${longestChoice}자` : "",
        codeLines >= 12 ? `긴 코드 ${codeLines}줄` : "",
        totalTableRows >= 10 ? `표 행 ${totalTableRows}개` : "",
        /ERD|Trace|TKPROF|실행계획/i.test(text) ? "ERD/Trace/실행계획 키워드 포함" : ""
      ].filter(Boolean).join(", "),
      action: "정돈된 코드 블록, 다중 표, 또는 PDF형 이미지 자료 병행 표시 검토"
    });
  }
}

const skeletonGroups = new Map();
for (const question of objectiveQuestions) {
  const key = [
    question.subjectId,
    question.topic,
    normalize(`${question.stem} ${question.choices.map((choice) => choice.text).join(" ")}`).slice(0, 220)
  ].join("::");
  if (!skeletonGroups.has(key)) skeletonGroups.set(key, []);
  skeletonGroups.get(key).push(question);
}

for (const group of skeletonGroups.values()) {
  if (group.length >= 2) {
    addIssue(objectiveIssues, {
      severity: "HIGH",
      item: group.map(displayQuestion).join(", "),
      id: group.map((item) => item.id).join(", "),
      category: "중복/템플릿",
      reason: "숫자, 날짜, 명칭을 지운 문제 골격이 거의 동일함",
      action: "한 문제만 유지하거나 서로 다른 추론 과정이 생기도록 재작성"
    });
  }
}

const similarPairs = [];
for (let i = 0; i < objectiveQuestions.length; i += 1) {
  for (let j = i + 1; j < objectiveQuestions.length; j += 1) {
    const a = objectiveQuestions[i];
    const b = objectiveQuestions[j];
    if (a.subjectId !== b.subjectId) continue;
    if (a.topic !== b.topic && a.questionType !== b.questionType) continue;
    const score = jaccard(
      `${a.stem} ${a.code ?? ""} ${a.choices.map((choice) => choice.text).join(" ")}`,
      `${b.stem} ${b.code ?? ""} ${b.choices.map((choice) => choice.text).join(" ")}`
    );
    if (score >= 0.86) {
      similarPairs.push({ a, b, score });
    }
  }
}

similarPairs
  .sort((left, right) => right.score - left.score)
  .slice(0, 40)
  .forEach(({ a, b, score }) => {
    addIssue(objectiveIssues, {
      severity: "MEDIUM",
      item: `${displayQuestion(a)} / ${displayQuestion(b)}`,
      id: `${a.id} / ${b.id}`,
      category: "유사도",
      reason: `문항 텍스트 유사도 ${score.toFixed(2)}. 실질 중복인지 수동 검토 필요`,
      action: "평가 개념, 추론 단계, 데이터/SQL 구조가 충분히 다른지 확인"
    });
  });

for (const lab of labQuestions) {
  const text = visibleLabText(lab);
  const title = displayLab(lab);
  const sampleTableCount = lab.sampleData?.length ?? 0;
  const sampleRows = (lab.sampleData ?? []).reduce((sum, table) => sum + table.rows.length, 0);
  const longSqlLength = Math.max(lab.schemaSql?.length ?? 0, lab.seedSql?.length ?? 0, lab.expectedSql?.length ?? 0, lab.prompt?.length ?? 0);
  const targetPlanLines = (lab.targetPlan ?? []).reduce((sum, line) => sum + String(line).split(/\r?\n/).length, 0);

  for (const { pattern, reason } of bannedPatterns) {
    if (pattern.test(text)) {
      addIssue(labIssues, {
        severity: "BLOCKER",
        item: title,
        id: lab.id,
        category: "깨진 표시",
        reason,
        action: "실기 사용자 표시 필드를 PDF 페이지와 다시 대조"
      });
    }
  }

  if (/좌측|우측|목표 결과|같은 형태/.test(text) && sampleTableCount < 2) {
    addIssue(labIssues, {
      severity: "HIGH",
      item: title,
      id: lab.id,
      category: "문제 자료 누락",
      reason: "좌측/우측 또는 목표 결과가 필요한 문항인데 표가 2개 미만임",
      action: "원천 표와 목표 결과 표를 분리해 표시"
    });
  }

  if (/실기문제\s*\d+/.test(text)) {
    addIssue(labIssues, {
      severity: "MEDIUM",
      item: title,
      id: lab.id,
      category: "원문 라벨 노출",
      reason: "문제 본문 또는 자료에 실기문제 번호 라벨이 남아 있을 수 있음",
      action: "사용자 문제 제목은 사이트 번호만 사용하고 원문 라벨 제거"
    });
  }

  if (!lab.relatedConceptIds?.length || lab.relatedConceptIds.some((id) => !conceptIds.has(id))) {
    addIssue(labIssues, {
      severity: "MEDIUM",
      item: title,
      id: lab.id,
      category: "관련 개념 연결",
      reason: "관련 개념 ID가 없거나 실제 개념 문서와 연결되지 않음",
      action: "실기 주제별 관련 개념 문서 ID를 보강"
    });
  }

  if ((lab.hints ?? []).length < 3 || (lab.rubric ?? []).length < 3) {
    addIssue(labIssues, {
      severity: "MEDIUM",
      item: title,
      id: lab.id,
      category: "실기 채점/힌트",
      reason: "힌트 또는 채점 기준이 3개 미만임",
      action: "실기 풀이 방향, 핵심 단서, 채점 기준을 보강"
    });
  }

  if (sampleRows >= 12 || longSqlLength >= 1200 || targetPlanLines >= 12 || /Trace|TKPROF|실행계획|ERD/i.test(text)) {
    imageCandidates.push({
      item: title,
      id: lab.id,
      reason: [
        sampleRows >= 12 ? `표 행 ${sampleRows}개` : "",
        longSqlLength >= 1200 ? `긴 SQL/본문 ${longSqlLength}자` : "",
        targetPlanLines >= 12 ? `목표/실행계획 ${targetPlanLines}줄` : "",
        /Trace|TKPROF|실행계획|ERD/i.test(text) ? "ERD/Trace/실행계획 키워드 포함" : ""
      ].filter(Boolean).join(", "),
      action: "표/실행계획/Trace는 이미지 또는 접힘 코드블록으로 병행 표시 검토"
    });
  }
}

const labPairs = [];
for (let i = 0; i < labQuestions.length; i += 1) {
  for (let j = i + 1; j < labQuestions.length; j += 1) {
    const a = labQuestions[i];
    const b = labQuestions[j];
    const score = jaccard(`${a.scenario} ${a.prompt} ${a.expectedSql}`, `${b.scenario} ${b.prompt} ${b.expectedSql}`);
    if (score >= 0.82) labPairs.push({ a, b, score });
  }
}

labPairs
  .sort((left, right) => right.score - left.score)
  .slice(0, 20)
  .forEach(({ a, b, score }) => {
    addIssue(labIssues, {
      severity: "HIGH",
      item: `${displayLab(a)} / ${displayLab(b)}`,
      id: `${a.id} / ${b.id}`,
      category: "실기 유사도",
      reason: `실기 시나리오와 정답 SQL 유사도 ${score.toFixed(2)}. 같은 템플릿 반복인지 수동 검토 필요`,
      action: "업무 요구사항, 테이블 관계, 풀이 능력이 충분히 다른지 확인"
    });
  });

const sourceRecheckLimited = sourceRecheck.slice(0, 80);

function renderTable(headers, rows) {
  const escape = (value) => String(value ?? "").replace(/\|/g, "\\|").replace(/\n/g, "<br>");
  return [
    `| ${headers.map(escape).join(" | ")} |`,
    `| ${headers.map(() => "---").join(" | ")} |`,
    ...rows.map((row) => `| ${row.map(escape).join(" | ")} |`)
  ].join("\n");
}

function countBySeverity(issues) {
  return issues.reduce((acc, issue) => {
    acc[issue.severity] = (acc[issue.severity] ?? 0) + 1;
    return acc;
  }, {});
}

const allConceptMissing = [...objectiveIssues, ...labIssues].filter((issue) => issue.category === "관련 개념 연결");
const blockerIssues = [...objectiveIssues, ...labIssues].filter((issue) => issue.severity === "BLOCKER");
const manualSpotChecks = [];

const subject2Question43 = questionsBySubject["sql-basic"][42];
if (subject2Question43) {
  manualSpotChecks.push({
    item: "2과목 43번",
    result:
      (subject2Question43.tables?.length ?? 0) >= 2
        ? "현재 데이터에는 EMP 테이블과 DEPT 테이블이 분리되어 있음"
        : "표가 2개 미만이라 PDF 원문과 화면 대조 후 수정 필요",
    action: "운영 화면에서도 두 표가 분리 렌더링되는지 확인"
  });
}

const labQuestion6 = labQuestions.find((lab) => lab.number === 6);
if (labQuestion6) {
  manualSpotChecks.push({
    item: "실기 6번",
    result:
      (labQuestion6.sampleData?.length ?? 0) >= 2
        ? "현재 데이터에는 입력표와 목표 결과표가 모두 존재함"
        : "좌측 입력표/우측 목표 결과표가 누락되어 수정 필요",
    action: "운영 화면에서 sampleData 두 표가 모두 보이는지 확인하고, 필요 시 PDF형 이미지 자료를 병행"
  });
}

const objectiveVisualAssetCount = objectiveQuestions.reduce((sum, question) => sum + (question.visualAssets?.length ?? 0), 0);
const labVisualAssetCount = labQuestions.reduce((sum, lab) => sum + (lab.visualAssets?.length ?? 0), 0);

const report = [
  "# Problem Bank Full Audit - 2026-07-30",
  "",
  "## Summary",
  "",
  renderTable(
    ["항목", "결과"],
    [
      ["객관식 총수", String(objectiveQuestions.length)],
      ["1과목", String(objectiveQuestions.filter((q) => q.subjectId === "modeling").length)],
      ["2과목", String(objectiveQuestions.filter((q) => q.subjectId === "sql-basic").length)],
      ["3과목", String(objectiveQuestions.filter((q) => q.subjectId === "tuning").length)],
      ["실기 총수", String(labQuestions.length)],
      ["객관식 감사 이슈", JSON.stringify(countBySeverity(objectiveIssues))],
      ["실기 감사 이슈", JSON.stringify(countBySeverity(labIssues))],
      ["객관식 이미지 자료 연결", String(objectiveVisualAssetCount)],
      ["실기 이미지 자료 연결", String(labVisualAssetCount)],
      ["복잡 자료 이미지/구조화 후보", String(imageCandidates.length)],
      ["원문 1:1 대조 추적 보강 후보", String(sourceRecheck.length)],
      ["깨진 문자/관리자 메타데이터 차단 이슈", String(blockerIssues.length)]
    ]
  ),
  "",
  "## 수정 필요 문제 번호 - 객관식",
  "",
  objectiveIssues.length
    ? renderTable(["심각도", "문제", "분류", "사유", "조치"], objectiveIssues.map((issue) => [issue.severity, issue.item, issue.category, issue.reason, issue.action]))
    : "자동 감사 기준에서 즉시 수정 필요 객관식 문제는 발견되지 않았다.",
  "",
  "## 수정 필요 문제 번호 - 실기",
  "",
  labIssues.length
    ? renderTable(["심각도", "문제", "분류", "사유", "조치"], labIssues.map((issue) => [issue.severity, issue.item, issue.category, issue.reason, issue.action]))
    : "자동 감사 기준에서 즉시 수정 필요 실기 문제는 발견되지 않았다.",
  "",
  "## 수동 확인 포인트",
  "",
  manualSpotChecks.length
    ? renderTable(["문제", "현재 확인 결과", "다음 조치"], manualSpotChecks.map((item) => [item.item, item.result, item.action]))
    : "이번 감사에서 별도 수동 확인 포인트는 없다.",
  "",
  "## 복잡 자료 이미지 또는 구조화 표시 후보",
  "",
  imageCandidates.length
    ? renderTable(["문제", "사유", "권장 조치"], imageCandidates.map((item) => [item.item, item.reason, item.action]))
    : "현재 기준에서 이미지/구조화 표시 후보가 없다.",
  "",
  "### 구조화 렌더링 적용 상태",
  "",
  renderTable(
    ["영역", "상태", "남은 판단"],
    [
      ["객관식 SQL 선택지", "긴 SQL/다중 줄 선택지는 코드블록 형태로 표시", "PDF 원문 도식이 필요한 선택지는 이미지 병행 검토"],
      ["객관식 SQL/실행계획/Trace 자료", "자료 종류를 SQL, 실행계획, Trace로 자동 분류하고 실행계획 Operation 한글 설명을 병행", "ERD나 큰 표는 원문 이미지 또는 별도 구조화 자료 추가 검토"],
      ["객관식/실기 큰 표", "다중 표는 PDF형 자료 카드로 분리하고 큰 표는 카드 내부 스크롤과 행·열 배지를 제공", "원문 그림의 좌우 배치가 풀이 핵심인 문항은 이미지 병행 검토"],
      ["ERD/입력-결과 도식", "다중 표가 있고 관계/목표 결과 단서가 있는 문제는 관계도 또는 입력-결과 흐름 카드로 표시", "원본 ERD 이미지 자체가 풀이 핵심인 문항은 PDF 이미지 병행 검토"],
      ["실기 Trace", "핵심 요약표와 전체 원문 접기/펼치기 제공", "표/ERD가 큰 실기는 문제별 원문 구조 재대조 필요"],
      ["오답노트", "문제풀이 화면과 동일한 SQL 선택지/자료 카드 표시", "오래된 오답 스냅샷은 원본 데이터 fallback 유지"]
    ]
  ),
  "",
  "## 원문과 다르게 출제되었는지 수동 대조가 필요한 후보",
  "",
  "자동 감사는 PDF 원문과 화면 문항의 의미 차이를 단정할 수 없다. 아래 목록은 Original 계열이지만 원문 문항 번호 추적이 약해 PDF 페이지 대조를 우선해야 하는 후보다.",
  "",
  sourceRecheckLimited.length
    ? renderTable(["문제", "사유", "조치"], sourceRecheckLimited.map((item) => [item.item, item.reason, item.action]))
    : "Original 계열 원문 추적 보강 후보가 없다.",
  sourceRecheck.length > sourceRecheckLimited.length ? `\n\n나머지 ${sourceRecheck.length - sourceRecheckLimited.length}건은 동일 기준으로 후속 수동 대조가 필요하다.` : "",
  "",
  "## 문제풀이 후 학습 연결 감사",
  "",
  renderTable(
    ["기능", "감사 결과", "다음 조치"],
    [
      ["틀린 선택지 이유", objectiveIssues.some((item) => item.category === "선택지별 해설") ? "보강 필요 항목 있음" : "전체 객관식 선택지별 해설 데이터 존재"],
      ["관련 개념으로 이동", allConceptMissing.length ? `${allConceptMissing.length}건 연결 보강 필요` : "객관식/실기 관련 개념 ID가 실제 개념 문서와 연결됨"],
      ["오답노트 원문 문제 전체 보기", "코드상 questionSnapshot 저장 및 오답노트 상세 표시 경로 존재", "오래된 오답 기록 fallback만 계속 유지"],
      ["비슷한 개념 문제 다시 풀기", "현재는 관련 개념 이동과 문제 다시 풀기는 있으나, 자동 유사 문제 추천 버튼은 없음", "관련ConceptId 기반 '비슷한 문제 풀기' 큐 추가 권장"]
    ]
  ),
  "",
  "## Recommended Next Fix Order",
  "",
  "1. BLOCKER 또는 HIGH 이슈부터 문제 화면에서 직접 확인한다.",
  "2. 복잡 자료 후보 중 SQL 선택지가 길거나 실행계획/Trace가 있는 문제는 이미지 또는 전용 코드블록 표시를 적용한다.",
  "3. Original 계열 문항 번호 추적이 약한 문제는 PDF 페이지와 문항 번호를 보강한다.",
  "4. 실기는 PDF 원문 구조를 기준으로 없는 자료를 억지로 추가하지 않고, 있는 자료만 표/코드/이미지로 분리한다.",
  "5. 관련ConceptId 기반으로 '비슷한 문제 풀기' 흐름을 추가한다.",
  ""
].join("\n");

fs.writeFileSync(reportPath, report, "utf8");

console.log(`Wrote ${path.relative(root, reportPath)}`);
console.log(`Objective questions: ${objectiveQuestions.length}`);
console.log(`Lab questions: ${labQuestions.length}`);
console.log(`Objective issues: ${objectiveIssues.length}`);
console.log(`Lab issues: ${labIssues.length}`);
console.log(`Image/structured candidates: ${imageCandidates.length}`);
console.log(`Source recheck candidates: ${sourceRecheck.length}`);
