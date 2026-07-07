import type { ChoiceId, LabQuestion, ObjectiveQuestion } from "@/lib/types";

const DANGEROUS_SQL = [
  /\binsert\b/i,
  /\bupdate\b/i,
  /\bdelete\b/i,
  /\bdrop\b/i,
  /\balter\b/i,
  /\btruncate\b/i,
  /\bcreate\b/i,
  /\bgrant\b/i,
  /\brevoke\b/i,
  /\bcopy\b/i,
  /\bcall\b/i,
  /\bdo\s+\$\$/i,
  /;/,
  /--/,
  /\/\*/
];

export function isChoiceCorrect(question: ObjectiveQuestion, selected: ChoiceId) {
  return question.answer === selected;
}

export function normalizeSql(sql: string) {
  return sql
    .trim()
    .replace(/\s+/g, " ")
    .replace(/;$/g, "")
    .toLowerCase();
}

export function stripOracleHints(sql: string) {
  return sql.replace(/\/\*\+[\s\S]*?\*\//g, " ");
}

export function containsUnsafeSql(sql: string) {
  const sqlWithoutHints = stripOracleHints(sql);
  return DANGEROUS_SQL.some((pattern) => pattern.test(sqlWithoutHints));
}

export function isReadOnlySql(sql: string) {
  const normalized = normalizeSql(sql);
  return /^(select|with|explain)\b/.test(normalized) && !containsUnsafeSql(sql);
}

export function extractPlanSignals(sql: string) {
  const normalized = normalizeSql(sql);

  return {
    hasIndexHint: /index\s*\(|index_/.test(normalized),
    hasLeadingHint: /leading\s*\(/.test(normalized),
    hasUseNlHint: /use_nl\s*\(/.test(normalized),
    hasUseHashHint: /use_hash\s*\(/.test(normalized),
    hasDateRange: />=\s*(:|\$|\?|'|\w)|<\s*(:|\$|\?|'|\w)/.test(normalized),
    hasFunctionOnColumn: /\b(lower|upper|substr|to_char|coalesce|nvl)\s*\(\s*[a-z_][\w.]*\s*[,)]/.test(normalized),
    hasExists: /\bexists\b/.test(normalized),
    hasScalarSubquery: /\(\s*select\b/.test(normalized),
    hasWindowFunction: /\bover\s*\(/.test(normalized)
  };
}

export function gradeSqlSubmission(lab: LabQuestion, sql: string) {
  if (!sql.trim()) {
    return {
      score: 0,
      passed: false,
      feedback: ["SQL을 먼저 작성해야 합니다."],
      plan: ["No plan"]
    };
  }

  if (!isReadOnlySql(sql)) {
    return {
      score: 0,
      passed: false,
      feedback: ["실습 샌드박스는 SELECT, WITH, EXPLAIN 계열의 읽기 전용 SQL만 허용합니다."],
      plan: ["Rejected before execution"]
    };
  }

  const signals = extractPlanSignals(sql);
  const feedback: string[] = [];
  let score = 50;

  if (signals.hasFunctionOnColumn) {
    score -= 20;
    feedback.push("조건절에서 컬럼에 함수를 적용하면 인덱스 액세스 조건이 되기 어렵습니다.");
  } else {
    score += 10;
    feedback.push("컬럼 변형을 피한 조건식이라 인덱스 활용 가능성이 좋습니다.");
  }

  if (signals.hasDateRange) {
    score += 10;
    feedback.push("날짜/범위 조건을 SARGable 형태로 작성했습니다.");
  }

  if (signals.hasIndexHint || signals.hasLeadingHint || signals.hasUseNlHint || signals.hasUseHashHint) {
    score += 20;
    feedback.push("Oracle 관점의 힌트 의도를 명시했습니다. 실제 SQLP 실기에서는 힌트 위치와 대상 별칭 정확도가 중요합니다.");
  }

  if (lab.topic.includes("조인") && (signals.hasUseNlHint || signals.hasUseHashHint || signals.hasExists)) {
    score += 10;
    feedback.push("조인 방식 또는 세미 조인 의도가 드러납니다.");
  }

  if (signals.hasScalarSubquery && lab.topic.includes("스칼라")) {
    score += 10;
    feedback.push("스칼라 서브쿼리의 반복 수행 여부를 실행계획에서 확인해야 합니다.");
  }

  const boundedScore = Math.max(0, Math.min(100, score));

  return {
    score: boundedScore,
    passed: boundedScore >= 70,
    feedback,
    plan: simulatePlan(sql)
  };
}

export function simulatePlan(sql: string) {
  const signals = extractPlanSignals(sql);
  const plan = ["Result", "  -> Project"];

  if (signals.hasWindowFunction) {
    plan.push("     -> WindowAgg");
  }

  if (signals.hasUseHashHint) {
    plan.push("        -> Hash Join");
  } else if (signals.hasUseNlHint || signals.hasLeadingHint) {
    plan.push("        -> Nested Loop");
  } else if (signals.hasExists) {
    plan.push("        -> Semi Join");
  } else {
    plan.push("        -> Planner selected join strategy");
  }

  if (signals.hasFunctionOnColumn) {
    plan.push("           -> Seq Scan (function on indexed column)");
  } else if (signals.hasIndexHint || signals.hasDateRange) {
    plan.push("           -> Index Scan / Bitmap Index Scan candidate");
  } else {
    plan.push("           -> Seq Scan candidate");
  }

  return plan;
}
