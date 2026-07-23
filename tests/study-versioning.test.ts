import { describe, expect, it } from "vitest";
import { filterCurrentAnswers, filterCurrentAttempts, isCurrentAnswerForQuestion } from "@/lib/study-versioning";
import type { AnswerRecord, AttemptRecord, ObjectiveQuestion } from "@/lib/types";

const question = {
  id: "modeling-001",
  contentHash: "current-hash"
} as ObjectiveQuestion;

function answer(overrides: Partial<AnswerRecord> = {}): AnswerRecord {
  return {
    questionId: "modeling-001",
    selectedChoiceId: "A",
    correct: true,
    answeredAt: "2026-07-23T00:00:00.000Z",
    hintUsed: false,
    ...overrides
  };
}

function attempt(overrides: Partial<AttemptRecord> = {}): AttemptRecord {
  return {
    id: "attempt-1",
    questionId: "modeling-001",
    subjectId: "modeling",
    topic: "데이터 모델링",
    selectedChoiceId: "A",
    correct: true,
    answeredAt: "2026-07-23T00:00:00.000Z",
    stem: "문제",
    ...overrides
  };
}

describe("study versioning", () => {
  it("does not treat legacy answers without a content hash as solved for the new question bank", () => {
    expect(isCurrentAnswerForQuestion(answer(), question)).toBe(false);
  });

  it("keeps answers whose content hash matches the current question", () => {
    expect(isCurrentAnswerForQuestion(answer({ questionContentHash: "current-hash" }), question)).toBe(true);
  });

  it("filters stale answers without deleting the original state object", () => {
    const answers = {
      "modeling-001": answer({ questionContentHash: "old-hash" }),
      "modeling-002": answer({ questionId: "modeling-002", questionContentHash: "current-two" })
    };
    const filtered = filterCurrentAnswers(answers, [
      question,
      { id: "modeling-002", contentHash: "current-two" } as ObjectiveQuestion
    ]);

    expect(Object.keys(filtered)).toEqual(["modeling-002"]);
    expect(Object.keys(answers)).toEqual(["modeling-001", "modeling-002"]);
  });

  it("filters stale attempts so the dashboard calendar follows the current bank", () => {
    const attempts = [
      attempt({ questionContentHash: "old-hash" }),
      attempt({ id: "attempt-2", questionContentHash: "current-hash" })
    ];

    expect(filterCurrentAttempts(attempts, [question]).map((item) => item.id)).toEqual(["attempt-2"]);
  });
});
