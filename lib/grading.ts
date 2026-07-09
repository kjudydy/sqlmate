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
  /--/
];

export function isChoiceCorrect(question: ObjectiveQuestion, selected: ChoiceId) {
  return question.answer === selected;
}

export function normalizeSql(sql: string) {
  return sql.trim().replace(/\s+/g, " ").replace(/;$/g, "").toLowerCase();
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
    hasNoMergeHint: /no_merge\s*\(/.test(normalized),
    hasFullHint: /full\s*\(/.test(normalized),
    hasDateRange: />=\s*(:|\$|\?|'|\w)|<\s*(:|\$|\?|'|\w)/.test(normalized),
    hasFunctionOnColumn: /\b(lower|upper|substr|to_char|coalesce|nvl)\s*\(\s*[a-z_][\w.]*\s*[,)]/.test(normalized),
    hasExists: /\bexists\b/.test(normalized),
    hasScalarSubquery: /\(\s*select\b/.test(normalized),
    hasWindowFunction: /\bover\s*\(/.test(normalized),
    hasStopKey: /\blimit\b|\bfetch\s+first\b|\brownum\b/.test(normalized),
    hasGroupBy: /\bgroup\s+by\b/.test(normalized),
    hasUnionAll: /\bunion all\b/.test(normalized),
    hasOuterJoin: /\bleft\s+join\b|\bleft\s+outer\s+join\b|\bright\s+join\b|\bfull\s+join\b/.test(normalized),
    hasNotExists: /\bnot\s+exists\b/.test(normalized)
  };
}

export function gradeSqlSubmission(lab: LabQuestion, sql: string) {
  if (!sql.trim()) {
    return {
      score: 0,
      passed: false,
      feedback: ["먼저 답안 SQL을 작성해야 합니다."],
      plan: ["No plan"]
    };
  }

  if (!isReadOnlySql(sql)) {
    return {
      score: 0,
      passed: false,
      feedback: ["실습 채점은 SELECT, WITH, EXPLAIN 계열의 읽기 전용 SQL만 허용합니다."],
      plan: ["Rejected before execution"]
    };
  }

  const signals = extractPlanSignals(sql);
  const feedback: string[] = [];
  let score = 45;

  if (signals.hasFunctionOnColumn) {
    score -= 20;
    feedback.push("조건절에서 컬럼에 함수를 적용하면 인덱스 액세스 조건으로 쓰이기 어렵습니다.");
  } else {
    score += 12;
    feedback.push("컬럼 변형을 피한 조건식이라 인덱스 활용 가능성이 좋습니다.");
  }

  if (signals.hasDateRange) {
    score += 10;
    feedback.push("날짜 또는 범위 조건을 SARGable 형태로 작성했습니다.");
  }

  if (signals.hasIndexHint || signals.hasLeadingHint || signals.hasUseNlHint || signals.hasUseHashHint || signals.hasNoMergeHint || signals.hasFullHint) {
    score += 18;
    feedback.push("Oracle 관점의 힌트 의도가 보입니다. SQLP 실기에서는 힌트 위치와 별칭 정확도가 중요합니다.");
  }

  if (lab.topic.includes("조인") && (signals.hasUseNlHint || signals.hasUseHashHint || signals.hasExists || signals.hasOuterJoin)) {
    score += 10;
    feedback.push("조인 방식이나 보존 집합을 의식한 답안입니다.");
  }

  if (lab.topic.includes("Top-N") && (signals.hasWindowFunction || signals.hasStopKey)) {
    score += 10;
    feedback.push("Top-N 또는 STOPKEY 계열의 부분범위 처리 의도가 보입니다.");
  }

  if (lab.topic.includes("파티션") && signals.hasDateRange) {
    score += 10;
    feedback.push("파티션 키로 볼 수 있는 날짜 범위를 명확히 작성했습니다. PSTART/PSTOP 축소를 기대할 수 있습니다.");
  }

  if (lab.topic.includes("스칼라") && signals.hasScalarSubquery) {
    score -= 8;
    feedback.push("반복 실행되는 스칼라 서브쿼리는 사전 집계 조인으로 바꿀 수 있는지 확인하세요.");
  } else if (lab.topic.includes("스칼라") && signals.hasGroupBy) {
    score += 8;
    feedback.push("반복 스칼라 서브쿼리 대신 사전 집계 후 조인하는 방향이 좋습니다.");
  }

  if (lab.topic.includes("OR") && signals.hasUnionAll) {
    score += 8;
    feedback.push("OR 조건을 UNION ALL로 분해해 인덱스 후보를 살리는 접근이 좋습니다.");
  }

  if ((lab.topic.includes("세미") || lab.topic.includes("안티")) && (signals.hasExists || signals.hasNotExists)) {
    score += 8;
    feedback.push("존재 여부 중심의 세미/안티 조인 의도가 보입니다.");
  }

  if (lab.topic.includes("아우터") && signals.hasOuterJoin) {
    score += 8;
    feedback.push("기준 행 보존을 위한 OUTER JOIN 구조를 사용했습니다.");
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

  if (signals.hasStopKey) {
    plan.push("     -> Limit / StopKey candidate");
  }

  if (signals.hasGroupBy) {
    plan.push("     -> HashAggregate / GroupAggregate candidate");
  }

  if (signals.hasUseHashHint) {
    plan.push("        -> Hash Join");
  } else if (signals.hasUseNlHint || signals.hasLeadingHint) {
    plan.push("        -> Nested Loop");
  } else if (signals.hasExists) {
    plan.push("        -> Semi Join");
  } else if (signals.hasOuterJoin) {
    plan.push("        -> Outer Join");
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
