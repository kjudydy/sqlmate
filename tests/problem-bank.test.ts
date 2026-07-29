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
  it("publishes only page-reviewed PDF objective questions", () => {
    expect(objectiveQuestions).toHaveLength(30);
    expect(bySubject("modeling")).toHaveLength(10);
    expect(bySubject("sql-basic")).toHaveLength(10);
    expect(bySubject("tuning")).toHaveLength(10);
  });

  it("summarizes original, variant, and similar questions for each subject", () => {
    const summary = getVerifiedProductionSummary();

    expect(summary.objectiveTotal).toBe(30);
    for (const subject of subjects) {
      const subjectSummary = summary.bySubject[subject.id];
      expect(subjectSummary.total).toBe(bySubject(subject.id).length);
      expect(subjectSummary.original).toBeGreaterThan(0);
      expect(subjectSummary.variant + subjectSummary.similar).toBeGreaterThan(0);
      expect(subjectSummary.topics).toBeGreaterThanOrEqual(3);
      expect(subjectSummary.types).toBeGreaterThanOrEqual(1);
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
      "유사형 문항",
      "묘의 상태",
      "테아블"
    ];
    const forbiddenPatterns = [
      /[公分往幻務]/,
      /I八|八\)|八3/,
      /\bF\s+R\s+O\s+M\b/i,
      /\bFR\s+O\s+M\b/i,
      /\bU\s+N\s*I\s*O\s+N\b/i,
      /\bSELEC\s+T\b/i,
      /\bPROM\s+TBL\b/i,
      /\bN\s+U\s+LL\b/i,
      /\bV\s+A\s+R\s*CH\s*A?\s*R?2?\b/i,
      /부\s+적\s+절|적\s+절|가\s+장|것\s+은|실\s+행|결\s+과|오\s+류|작\s+성|모\s+델/,
      /SESSIONJ?D|LOCKJ?D|PRODJ?D|STADIUMJ?D/i,
      /31正3/
    ];

    for (const question of objectiveQuestions) {
      const text = userVisibleQuestionText(question);
      for (const pattern of forbidden) {
        expect(text).not.toContain(pattern);
      }
      for (const pattern of forbiddenPatterns) {
        expect(text).not.toMatch(pattern);
      }
      expect(text).not.toMatch(/\[[^\]]+\.pdf\s+p\./i);
      expect(text).not.toContain(question.sourceDocument ?? "__no_source__");
    }
  });

  it("does not publish PDF items whose SQL, tables, or trace are collapsed into the stem", () => {
    const collapsedMaterialTokens = [
      "CREATE TABLE",
      "ALTER TABLE",
      "INSERT INTO",
      "DELETE FROM",
      "SELECT ",
      " FROM ",
      " WHERE ",
      " GROUP BY ",
      " HAVING ",
      " ORDER BY ",
      " REFERENCES ",
      " ON DELETE ",
      "[SQL]",
      "[테이블",
      "현재 테이블",
      "테이블 명",
      "실행계획",
      "TRACE"
    ];

    for (const question of objectiveQuestions) {
      if (question.code || question.table || question.passage) continue;

      const upperStem = question.stem.toUpperCase();
      const materialHits = collapsedMaterialTokens.filter((token) => upperStem.includes(token)).length;

      expect(materialHits).toBeLessThan(2);
      expect(upperStem).not.toContain("CREATE TABLE");
      expect(question.stem).not.toMatch(/\bSELECT\b.+\bFROM\b/i);
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
      expect(question.batchId).toBeTruthy();
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

  it("publishes exam materials for SQL, table, plan, and trace style questions", () => {
    const withMaterial = objectiveQuestions.filter((question) => question.passage || question.code || question.table);
    const withCode = objectiveQuestions.filter((question) => question.code);

    expect(withMaterial.length).toBeGreaterThanOrEqual(4);
    expect(withCode.length).toBeGreaterThanOrEqual(2);
    expect(new Set(objectiveQuestions.map((question) => question.questionType)).size).toBeGreaterThanOrEqual(3);
  });

  it("publishes the verified SQL Practice starter cases", () => {
    expect(labQuestions).toHaveLength(5);
    expect(new Set(labQuestions.map((lab) => lab.topic)).size).toBeGreaterThanOrEqual(5);
  });

  it("does not create template objective expansion batches", () => {
    for (const subject of subjects) {
      const batch = createLocalExtraQuestions(subject.id, 0, 20);
      expect(batch).toHaveLength(0);
      expect(() => createLocalExtraQuestion(subject.id, 0)).toThrow(/No verified PDF expansion question/);
    }
  });

  it("does not create template SQL Practice expansion batches", () => {
    const batch = createLocalExtraLabQuestions(0, 5);

    expect(batch).toHaveLength(0);
    expect(() => createLocalExtraLabQuestion(0)).toThrow(/No verified PDF expansion lab/);
  });
});
