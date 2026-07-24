import { describe, expect, it } from "vitest";
import {
  findUserVisibleQualityIssues,
  getUserVisibleText,
  pdfReviewItems,
  pdfReviewLabs,
  pdfReviewQuestions
} from "@/lib/pdf-review-bank";

describe("PDF rebuild review gate", () => {
  it("builds the first 35-item review set with the requested distribution", () => {
    expect(pdfReviewItems).toHaveLength(35);
    expect(pdfReviewQuestions).toHaveLength(30);
    expect(pdfReviewLabs).toHaveLength(5);

    for (const subjectName of ["1과목", "2과목", "3과목"]) {
      const subjectQuestions = pdfReviewQuestions.filter((question) => question.subjectName === subjectName);
      expect(subjectQuestions).toHaveLength(10);
      expect(subjectQuestions.filter((question) => question.mode === "original")).toHaveLength(5);
      expect(subjectQuestions.filter((question) => question.mode === "variant")).toHaveLength(3);
      expect(subjectQuestions.filter((question) => question.mode === "similar")).toHaveLength(2);
    }
  });

  it("keeps all user-visible fields free of OCR garbage and admin metadata", () => {
    expect(findUserVisibleQualityIssues()).toEqual([]);

    for (const item of pdfReviewItems) {
      const text = getUserVisibleText(item);
      expect(text).not.toContain(item.source.document);
      expect(text).not.toContain(item.status);
      expect(text).not.toContain(item.mode);
    }
  });

  it("uses only verified statuses in the preview set", () => {
    expect(pdfReviewItems.every((item) => item.status.endsWith("_verified"))).toBe(true);
    expect(pdfReviewItems.some((item) => item.status === "review_required")).toBe(false);
    expect(pdfReviewItems.some((item) => item.status === "extracted")).toBe(false);
  });

  it("keeps SQL Practice cases structurally different", () => {
    expect(new Set(pdfReviewLabs.map((lab) => lab.topic)).size).toBe(5);
    expect(new Set(pdfReviewLabs.map((lab) => lab.schemaSql)).size).toBe(5);
    expect(new Set(pdfReviewLabs.map((lab) => lab.answerSql)).size).toBe(5);
  });

  it("requires choices, answers, explanations, concepts, and hints for each objective question", () => {
    for (const question of pdfReviewQuestions) {
      expect(question.choices).toHaveLength(4);
      expect(question.explanation.length).toBeGreaterThan(20);
      expect(question.relatedConcept.length).toBeGreaterThan(1);
      expect(question.hints).toHaveLength(3);
      expect(question.validationNotes.length).toBeGreaterThanOrEqual(1);
      for (const choice of question.choices) {
        expect(choice.text.length).toBeGreaterThanOrEqual(1);
        expect(choice.explanation.length).toBeGreaterThan(12);
      }
    }
  });
});
