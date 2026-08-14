import { describe, expect, it } from "vitest";
import { resolveRelatedConceptNavigation } from "@/lib/concept-navigation";
import { conceptArticles, objectiveQuestions } from "@/lib/problem-bank";
import type { ObjectiveQuestion, WrongNote } from "@/lib/types";

function findQuestion(questionId: string): ObjectiveQuestion {
  const question = objectiveQuestions.find((item) => item.id === questionId);
  if (!question) throw new Error(`Missing representative question: ${questionId}`);
  return question;
}

describe("related concept navigation", () => {
  const representativeQuestionIds = [
    "prod-sql-basic-003",
    "prod-ext-sql-basic-023",
    "prod-ext-sql-basic-070",
    "prod-tuning-010",
    "prod-ext-tuning-307",
    "prod-ext-tuning-141",
    "prod-ext-tuning-152"
  ];

  it("uses the same destination from solved explanations and wrong-note snapshots", () => {
    for (const questionId of representativeQuestionIds) {
      const solvedQuestion = findQuestion(questionId);
      const wrongNote: WrongNote = {
        questionId: solvedQuestion.id,
        memo: "",
        updatedAt: "2026-08-12T00:00:00.000Z",
        selectedChoiceId: solvedQuestion.choices.find((choice) => choice.id !== solvedQuestion.answer)?.id,
        correctChoiceId: solvedQuestion.answer,
        questionSnapshot: solvedQuestion,
        wrongCount: 1,
        firstWrongAt: "2026-08-12T00:00:00.000Z",
        lastWrongAt: "2026-08-12T00:00:00.000Z"
      };

      const solvedDestination = resolveRelatedConceptNavigation(solvedQuestion.relatedConceptId, conceptArticles);
      const wrongNoteDestination = resolveRelatedConceptNavigation(wrongNote.questionSnapshot?.relatedConceptId, conceptArticles);

      expect(solvedDestination, `${questionId} solved explanation destination`).toBeTruthy();
      expect(wrongNoteDestination, `${questionId} wrong-note destination`).toEqual(solvedDestination);
      expect(solvedDestination?.section).toBe("concepts");
      expect(solvedDestination?.selectedConceptId).toBe(solvedQuestion.relatedConceptId);
    }
  });

  it("does not move the UI when a stale snapshot references a missing concept", () => {
    expect(resolveRelatedConceptNavigation("missing-concept-id", conceptArticles)).toBeNull();
    expect(resolveRelatedConceptNavigation(undefined, conceptArticles)).toBeNull();
  });

  it("keeps visual example tables in confusing concept pages", () => {
    const normalization = conceptArticles.find((concept) => concept.id === "modeling-normalization");
    const groupFunctions = conceptArticles.find((concept) => concept.id === "sql-group-functions");

    expect(normalization?.studyBlocks?.some((block) => block.type === "table" && block.title === "1NF, 2NF, 3NF 판단 기준")).toBe(true);
    expect(normalization?.studyBlocks?.some((block) => block.type === "table" && block.title === "제2정규형 예시: 분해 전 수강강좌")).toBe(true);
    expect(normalization?.studyBlocks?.some((block) => block.type === "flow" && block.title === "부분 함수 종속 흐름")).toBe(true);
    expect(normalization?.studyBlocks?.some((block) => block.type === "table" && block.title === "제3정규형 예시: 분해 전 결제내역")).toBe(true);
    expect(normalization?.studyBlocks?.some((block) => block.type === "flow" && block.title === "이행 함수 종속 흐름")).toBe(true);
    expect(groupFunctions?.studyBlocks?.some((block) => block.type === "table" && block.title === "ROLLUP(지역, 상품) 결과")).toBe(true);
    expect(groupFunctions?.studyBlocks?.some((block) => block.type === "table" && block.title === "ROLLUP, CUBE, GROUPING SETS 차이")).toBe(true);
  });
});
