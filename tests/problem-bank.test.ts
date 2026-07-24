import { describe, expect, it } from "vitest";
import {
  createLocalExtraLabQuestions,
  createLocalExtraQuestion,
  createLocalExtraQuestions,
  labQuestions,
  objectiveQuestions,
  officialSourceVersion,
  subjects
} from "@/lib/problem-bank";
import { findLikelyDuplicateQuestions } from "@/lib/question-batch";
import {
  findPublishedUserVisibleIssues,
  getVerifiedProductionSummary,
  verifiedOfficialSourceVersion
} from "@/lib/verified-production-bank";
import type { ObjectiveQuestion, SubjectId } from "@/lib/types";

function bySubject(subjectId: SubjectId) {
  return objectiveQuestions.filter((question) => question.subjectId === subjectId);
}

function userVisibleQuestionText(question: ObjectiveQuestion) {
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
    question.table ? [question.table.headers.join(" "), question.table.rows.flat().join(" ")].join(" ") : "",
    ...question.choices.map((choice) => choice.text),
    question.hint,
    question.explanation,
    ...Object.values(question.whyWrong)
  ]
    .filter(Boolean)
    .join("\n");
}

function questionSignature(question: ObjectiveQuestion) {
  return [
    question.subjectId,
    question.majorTopic,
    question.middleTopic,
    question.topic,
    question.stem,
    question.passage ?? "",
    question.code ?? "",
    question.table ? JSON.stringify(question.table) : "",
    question.choices.map((choice) => choice.text).join("|")
  ]
    .join("::")
    .replace(/\s+/g, " ")
    .trim();
}

describe("SQLMate verified production problem bank", () => {
  it("publishes 100 objective questions per subject", () => {
    expect(objectiveQuestions).toHaveLength(300);
    for (const subject of subjects) {
      expect(bySubject(subject.id)).toHaveLength(100);
      expect(bySubject(subject.id).map((question) => question.number)).toEqual(Array.from({ length: 100 }, (_, index) => index + 1));
    }
  });

  it("keeps the approved PDF review seeds and expands them with Variant and Similar questions", () => {
    const summary = getVerifiedProductionSummary();

    expect(summary.objectiveTotal).toBe(300);
    for (const subject of subjects) {
      const subjectSummary = summary.bySubject[subject.id];
      expect(subjectSummary.total).toBe(100);
      expect(subjectSummary.original).toBe(5);
      expect(subjectSummary.variant).toBeGreaterThanOrEqual(30);
      expect(subjectSummary.similar).toBeGreaterThanOrEqual(60);
      expect(subjectSummary.topics).toBeGreaterThanOrEqual(35);
      expect(subjectSummary.types).toBeGreaterThanOrEqual(6);
    }
  });

  it("does not expose source metadata or review statuses in user-visible question fields", () => {
    expect(findPublishedUserVisibleIssues()).toEqual([]);

    const forbidden = [
      "sourceDocument",
      "sourceType",
      "generationMode",
      "review_required",
      "original_ready",
      "문항 키",
      "추출 상태",
      "PDF 원문 문항",
      "유사형 문항"
    ];

    for (const question of objectiveQuestions) {
      const text = userVisibleQuestionText(question);
      for (const pattern of forbidden) {
        expect(text).not.toContain(pattern);
      }
      expect(text).not.toMatch(/\[[^\]]+\.pdf\s+p\./i);
      expect(text).not.toContain(question.sourceDocument ?? "__no_source__");
    }
  });

  it("stores internal source and validation metadata for every published question", () => {
    expect(officialSourceVersion).toBe(verifiedOfficialSourceVersion);

    for (const question of objectiveQuestions) {
      expect(question.sourceVersion).toBe(verifiedOfficialSourceVersion);
      expect(question.sourceDocument).toBeTruthy();
      expect(question.sourceType).toMatch(/^owner_pdf/);
      expect(question.generationMode).toMatch(/original|transformed|generated_similar/);
      expect(question.reviewStatus).toBe("approved");
      expect(question.validationStatus).toBe("validated");
      expect(question.contentHash).toMatch(/^[0-9a-f]{8}$/);
      expect(question.semanticFingerprint).toMatch(/^[0-9a-f]{8}$/);
      expect(question.batchId).toBe(`initial-${question.subjectId}-v1`);
    }
  });

  it("keeps choices, answer mapping, hints, explanations, and related concepts complete", () => {
    for (const question of objectiveQuestions) {
      expect(question.choices).toHaveLength(4);
      expect(question.choices.map((choice) => choice.id)).toEqual(["A", "B", "C", "D"]);
      expect(question.choices.some((choice) => choice.id === question.answer)).toBe(true);
      expect(question.hint).toContain("1단계");
      expect(question.hint).toContain("2단계");
      expect(question.hint).toContain("3단계");
      expect(question.explanation.length).toBeGreaterThan(20);
      expect(question.relatedConceptId).toBeTruthy();

      for (const choice of question.choices) {
        expect(question.whyWrong[choice.id]).toBeTruthy();
        expect(question.whyWrong[choice.id].length).toBeGreaterThan(10);
      }
    }
  });

  it("prevents exact duplicates and semantic-template duplicates in the current published bank", () => {
    const signatures = objectiveQuestions.map(questionSignature);
    expect(new Set(signatures).size).toBe(signatures.length);
    expect(findLikelyDuplicateQuestions()).toEqual([]);
  });

  it("includes exam-style materials across SQL, model, plan, and Trace questions", () => {
    const withMaterial = objectiveQuestions.filter((question) => question.passage || question.code || question.table);
    const withCode = objectiveQuestions.filter((question) => question.code);
    const withTable = objectiveQuestions.filter((question) => question.table);
    const tuningWithPlan = bySubject("tuning").filter((question) => question.table?.headers.includes("Operation"));

    expect(withMaterial.length).toBeGreaterThanOrEqual(270);
    expect(withCode.length).toBeGreaterThanOrEqual(150);
    expect(withTable.length).toBeGreaterThanOrEqual(220);
    expect(tuningWithPlan.length).toBeGreaterThanOrEqual(80);
    expect(new Set(objectiveQuestions.map((question) => question.questionType)).size).toBeGreaterThanOrEqual(8);
  });

  it("publishes 20 structurally different SQL Practice questions", () => {
    expect(labQuestions).toHaveLength(20);
    expect(new Set(labQuestions.map((lab) => lab.title)).size).toBe(20);
    expect(new Set(labQuestions.map((lab) => lab.topic)).size).toBeGreaterThanOrEqual(18);
    expect(new Set(labQuestions.map((lab) => lab.schemaSql)).size).toBe(20);
    expect(new Set(labQuestions.map((lab) => lab.expectedSql)).size).toBe(20);

    for (const lab of labQuestions) {
      expect(lab.traceStats).toContain("Rows");
      expect(lab.traceStats).toContain("Loop");
      expect(lab.predicateInfo).toContain("Predicate Information");
      expect(lab.targetPlanExplanations?.length).toBe(lab.targetPlan.length);
      expect(lab.traceSummary?.map((row) => row.metric)).toEqual(expect.arrayContaining(["Rows", "Loop/Starts", "PR", "CR", "Time"]));
      expect(lab.simulationNotice).toContain("실제 Oracle 실행 결과로 표시하지 않는다");
    }
  });

  it("generates 20-question expansion batches without colliding with the first 100", () => {
    for (const subject of subjects) {
      const batch = createLocalExtraQuestions(subject.id, 0, 20);
      const baseIds = new Set(bySubject(subject.id).map((question) => question.id));

      expect(batch).toHaveLength(20);
      expect(batch[0].number).toBe(101);
      expect(batch[19].number).toBe(120);
      expect(batch.every((question) => question.subjectId === subject.id)).toBe(true);
      expect(batch.every((question) => !baseIds.has(question.id))).toBe(true);
      expect(batch.every((question) => question.sourceVersion === verifiedOfficialSourceVersion)).toBe(true);
      expect(batch.every((question) => question.contentHash?.match(/^[0-9a-f]{8}$/))).toBe(true);
    }
  });

  it("generates 20 SQL Practice expansion questions with unique ids and simulation labeling", () => {
    const batch = createLocalExtraLabQuestions(0, 20);

    expect(batch).toHaveLength(20);
    expect(batch[0].number).toBe(21);
    expect(batch[19].number).toBe(40);
    expect(new Set(batch.map((lab) => lab.id)).size).toBe(20);
    expect(new Set(batch.map((lab) => lab.expectedSql)).size).toBe(20);
    expect(batch.every((lab) => lab.sourceVersion === verifiedOfficialSourceVersion)).toBe(true);
    expect(batch.every((lab) => lab.traceStats?.includes("Rows") && lab.traceStats.includes("Loop"))).toBe(true);
    expect(batch.every((lab) => lab.simulationNotice?.includes("실제 Oracle 실행 결과로 표시하지 않는다"))).toBe(true);
  });

  it("keeps single-question expansion API compatible with the AI fallback routes", () => {
    const objective = createLocalExtraQuestion("tuning", 0);
    expect(objective.number).toBe(101);
    expect(objective.choices).toHaveLength(4);
    expect(objective.answer).toMatch(/[ABCD]/);

    const lab = createLocalExtraLabQuestions(0, 1)[0];
    expect(lab.number).toBe(21);
    expect(lab.expectedSql.length).toBeGreaterThan(50);
  });
});
