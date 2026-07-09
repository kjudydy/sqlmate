import { describe, expect, it } from "vitest";
import { conceptArticles, createLocalExtraQuestion, createLocalExtraQuestions, objectiveQuestions, subjects } from "@/lib/problem-bank";
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
      expect(topicCount).toBeGreaterThanOrEqual(35);
    }
  });

  it("keeps key reconstructed exam-style topics inside the first 100 questions", () => {
    const modelingTopics = Array.from(new Set(bySubject("modeling").map((question) => question.topic)));
    const sqlTopics = Array.from(new Set(bySubject("sql-basic").map((question) => question.topic)));

    expect(modelingTopics).toEqual(
      expect.arrayContaining([
        "데이터 모델링 유의점",
        "외부·개념·내부 스키마",
        "식별·비식별 관계",
        "주식별자 도출 기준",
        "식별자의 최소성",
        "도메인"
      ])
    );

    expect(sqlTopics).toEqual(
      expect.arrayContaining([
        "DISTINCT",
        "문자 함수",
        "날짜 함수",
        "NVL과 COALESCE",
        "CASE 표현식",
        "ROLLUP",
        "CUBE",
        "Top-N"
      ])
    );
  });

  it("offers concept articles beyond the dashboard summary cards", () => {
    expect(conceptArticles.length).toBeGreaterThanOrEqual(57);
  });

  it("organizes concept articles by the official SQLP subject hierarchy", () => {
    expect(new Set(conceptArticles.map((concept) => concept.subjectId))).toEqual(new Set(["modeling", "sql-basic", "tuning"]));
    expect(conceptArticles).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          subjectId: "modeling",
          majorTopic: "데이터 모델링의 이해",
          detailTopic: "엔터티"
        }),
        expect.objectContaining({
          subjectId: "sql-basic",
          majorTopic: "SQL 활용",
          detailTopic: "윈도우 함수"
        }),
        expect.objectContaining({
          subjectId: "tuning",
          majorTopic: "인덱스 튜닝",
          detailTopic: "인덱스 스캔 효율화"
        }),
        expect.objectContaining({
          subjectId: "tuning",
          majorTopic: "Lock과 트랜잭션 동시성 제어",
          detailTopic: "동시성 제어"
        })
      ])
    );
  });

  it("keeps concept bullets exam-focused without generic prompt labels", () => {
    for (const concept of conceptArticles) {
      expect(concept.summary.length).toBeGreaterThan(40);
      expect(concept.keyPoints.length).toBeGreaterThanOrEqual(5);
      expect(concept.examTrap.length).toBeGreaterThan(25);
      expect(concept.keyPoints.some((point) => /^(핵심 정의|지문 읽기|판단 순서|SQL 연결):/.test(point))).toBe(false);
    }
  });

  it("provides study-ready hints, explanations, and choice feedback", () => {
    for (const question of objectiveQuestions) {
      expect(question.hint).toContain("출제 포인트");
      expect(question.hint).toContain("풀이 방향");
      expect(question.explanation).toContain("정답 근거");
      expect(question.explanation).toContain("시험 포인트");

      for (const choice of question.choices) {
        expect(question.whyWrong[choice.id]).toBeTruthy();
        expect(question.whyWrong[choice.id].length).toBeGreaterThan(20);
      }
    }
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

  it("generates independent 20-question extra batches per subject", () => {
    for (const subject of subjects) {
      const firstBatch = createLocalExtraQuestions(subject.id, 0, 20);
      const secondBatch = createLocalExtraQuestions(subject.id, 20, 20);
      const ids = new Set([...firstBatch, ...secondBatch].map((question) => question.id));

      expect(firstBatch).toHaveLength(20);
      expect(secondBatch).toHaveLength(20);
      expect(firstBatch[0].number).toBe(101);
      expect(firstBatch[19].number).toBe(120);
      expect(secondBatch[0].number).toBe(121);
      expect(secondBatch[19].number).toBe(140);
      expect(ids.size).toBe(40);
      expect(firstBatch.every((question) => question.subjectId === subject.id)).toBe(true);
      expect(secondBatch.every((question) => question.subjectId === subject.id)).toBe(true);
    }
  });
});
