import { describe, expect, it } from "vitest";
import {
  createLocalExtraLabQuestion,
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
  it("does not publish the temporary seed objective questions before PDF line-by-line verification", () => {
    expect(objectiveQuestions).toHaveLength(0);
    for (const subject of subjects) {
      expect(bySubject(subject.id)).toHaveLength(0);
    }
  });

  it("keeps the production summary blocked until a new PDF verified bank is published", () => {
    const summary = getVerifiedProductionSummary();

    expect(summary.objectiveTotal).toBe(0);
    for (const subject of subjects) {
      const subjectSummary = summary.bySubject[subject.id];
      expect(subjectSummary.total).toBe(0);
      expect(subjectSummary.original).toBe(0);
      expect(subjectSummary.variant).toBe(0);
      expect(subjectSummary.similar).toBe(0);
      expect(subjectSummary.topics).toBe(0);
      expect(subjectSummary.types).toBe(0);
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

  it("does not expose exam materials from temporary seed questions", () => {
    const withMaterial = objectiveQuestions.filter((question) => question.passage || question.code || question.table);
    const withCode = objectiveQuestions.filter((question) => question.code);

    expect(withMaterial).toHaveLength(0);
    expect(withCode).toHaveLength(0);
    expect(new Set(objectiveQuestions.map((question) => question.questionType)).size).toBe(0);
  });

  it("does not publish temporary SQL Practice cases before PDF line-by-line verification", () => {
    expect(labQuestions).toHaveLength(0);
  });

  it("does not publish unverified objective expansion batches from templates", () => {
    for (const subject of subjects) {
      const batch = createLocalExtraQuestions(subject.id, 0, 10);
      expect(batch).toHaveLength(0);
    }
  });

  it("does not publish unverified SQL Practice expansion batches from templates", () => {
    const batch = createLocalExtraLabQuestions(0, 5);

    expect(batch).toHaveLength(0);
  });

  it("blocks single-question fallback APIs until verified PDF material is republished", () => {
    expect(() => createLocalExtraQuestion("tuning", 0)).toThrow();
    expect(() => createLocalExtraLabQuestion(0)).toThrow();
  });
});
