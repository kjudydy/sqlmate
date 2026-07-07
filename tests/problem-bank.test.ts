import { describe, expect, it } from "vitest";
import { conceptArticles, createLocalExtraQuestion, objectiveQuestions, subjects } from "@/lib/problem-bank";
import type { ObjectiveQuestion, SubjectId } from "@/lib/types";

function bySubject(subjectId: SubjectId) {
  return objectiveQuestions.filter((question) => question.subjectId === subjectId);
}

function questionSignature(question: ObjectiveQuestion) {
  return [
    question.subjectId,
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

describe("SQLP problem bank", () => {
  it("keeps 100 objective questions for every subject", () => {
    for (const subject of subjects) {
      expect(bySubject(subject.id)).toHaveLength(100);
    }
  });

  it("does not repeat identical objective questions inside a subject", () => {
    for (const subject of subjects) {
      const signatures = bySubject(subject.id).map(questionSignature);
      expect(new Set(signatures).size).toBe(signatures.length);
    }
  });

  it("covers many official detail topics instead of repeating a tiny seed set", () => {
    for (const subject of subjects) {
      const topicCount = new Set(bySubject(subject.id).map((question) => question.topic)).size;
      expect(topicCount).toBeGreaterThanOrEqual(25);
    }
  });

  it("offers concept articles beyond the dashboard summary cards", () => {
    expect(conceptArticles.length).toBeGreaterThanOrEqual(75);
  });

  it("generates local extra questions after the first 100 without id collisions", () => {
    for (const subject of subjects) {
      const extra = createLocalExtraQuestion(subject.id, 0);
      const baseIds = new Set(bySubject(subject.id).map((question) => question.id));

      expect(extra.number).toBe(101);
      expect(baseIds.has(extra.id)).toBe(false);
      expect(extra.subjectId).toBe(subject.id);
    }
  });
});
