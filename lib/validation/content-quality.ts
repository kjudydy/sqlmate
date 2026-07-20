import type { ConceptDocument, PlanOperation, PracticeScenario, SqlpQuestion } from "@/lib/content/schema";

export type ContentIssue = {
  severity: "fail" | "review";
  id: string;
  message: string;
};

function normalize(value: string) {
  return value.toLowerCase().replace(/\s+/g, " ").trim();
}

export function questionSignature(question: SqlpQuestion) {
  return normalize(
    [
      question.subjectId,
      question.majorTopic,
      question.minorTopic,
      question.detailTopic,
      question.type,
      question.prompt,
      question.passage ?? "",
      question.sql ?? "",
      question.choices?.map((choice) => choice.text).join("|") ?? ""
    ].join("::")
  );
}

function hasAnswer(question: SqlpQuestion) {
  if (Array.isArray(question.answer.value)) return question.answer.value.length > 0;
  return Boolean(question.answer.value.trim());
}

function validatePlan(plan: PlanOperation[], ownerId: string): ContentIssue[] {
  const issues: ContentIssue[] = [];
  const ids = new Set<number>();

  for (const op of plan) {
    if (ids.has(op.id)) {
      issues.push({ severity: "fail", id: ownerId, message: `Duplicate plan operation id ${op.id}` });
    }
    ids.add(op.id);

    if (op.starts < 0 || op.rows < 0 || (op.cr ?? 0) < 0 || (op.pr ?? 0) < 0 || (op.timeMs ?? 0) < 0) {
      issues.push({ severity: "fail", id: ownerId, message: `Negative execution metric on operation ${op.id}` });
    }

    if (op.parentId && !plan.some((parent) => parent.id === op.parentId)) {
      issues.push({ severity: "fail", id: ownerId, message: `Missing parent operation ${op.parentId} for ${op.id}` });
    }

    if ((op.pr ?? 0) > (op.cr ?? Number.MAX_SAFE_INTEGER) + (op.pr ?? 0) && op.cr !== undefined) {
      issues.push({ severity: "review", id: ownerId, message: `Unusual PR/CR relationship on operation ${op.id}` });
    }
  }

  return issues;
}

export function validateContentSet(questions: SqlpQuestion[], concepts: ConceptDocument[], labs: PracticeScenario[]) {
  const issues: ContentIssue[] = [];
  const conceptIds = new Set(concepts.map((concept) => concept.id));
  const signatures = new Map<string, string>();

  for (const question of questions) {
    if (question.status !== "approved") {
      issues.push({ severity: "review", id: question.id, message: "Initial quality question is not approved" });
    }

    if (question.hints.length < 3) {
      issues.push({ severity: "fail", id: question.id, message: "Question has fewer than 3 hints" });
    }

    if (!hasAnswer(question)) {
      issues.push({ severity: "fail", id: question.id, message: "Question has no answer" });
    }

    if (question.explanation.length < 70) {
      issues.push({ severity: "review", id: question.id, message: "Explanation may be too short for SQLP quality" });
    }

    if (question.relatedConceptIds.length === 0) {
      issues.push({ severity: "fail", id: question.id, message: "Question has no related concept" });
    }

    for (const conceptId of question.relatedConceptIds) {
      if (!conceptIds.has(conceptId)) {
        issues.push({ severity: "fail", id: question.id, message: `Missing related concept ${conceptId}` });
      }
    }

    if (question.plan) {
      issues.push(...validatePlan(question.plan, question.id));
    }

    const signature = questionSignature(question);
    const existing = signatures.get(signature);
    if (existing) {
      issues.push({ severity: "fail", id: question.id, message: `Duplicate question signature with ${existing}` });
    }
    signatures.set(signature, question.id);
  }

  for (const concept of concepts) {
    if (concept.sections.length < 2 || concept.summary.length < 90) {
      issues.push({ severity: "review", id: concept.id, message: "Concept document is too thin" });
    }
  }

  for (const lab of labs) {
    if (lab.hints.length < 3) {
      issues.push({ severity: "fail", id: lab.id, message: "Practice scenario has fewer than 3 hints" });
    }

    if (!lab.currentSql || !lab.modelSql) {
      issues.push({ severity: "fail", id: lab.id, message: "Practice scenario requires current SQL and model SQL" });
    }

    if (lab.currentTrace.queryGets < lab.currentTrace.rows && lab.currentTrace.rows > 1000) {
      issues.push({ severity: "review", id: lab.id, message: "Trace query gets is unexpectedly lower than rows" });
    }

    issues.push(...validatePlan(lab.currentPlan, `${lab.id}:current`));
    issues.push(...validatePlan(lab.targetPlan, `${lab.id}:target`));

    if (!lab.predicateInfo.some((line) => /access|filter|predicate|PSTART|PSTOP/i.test(line))) {
      issues.push({ severity: "fail", id: lab.id, message: "Predicate information is missing access/filter context" });
    }
  }

  return issues;
}

export function summarizeDistribution(questions: SqlpQuestion[]) {
  return {
    bySubject: countBy(questions, (question) => question.subjectId),
    byType: countBy(questions, (question) => question.type),
    byDifficulty: countBy(questions, (question) => question.difficulty)
  };
}

function countBy<T>(items: T[], keyFn: (item: T) => string) {
  return items.reduce<Record<string, number>>((acc, item) => {
    const key = keyFn(item);
    acc[key] = (acc[key] ?? 0) + 1;
    return acc;
  }, {});
}
