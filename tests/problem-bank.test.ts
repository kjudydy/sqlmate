import { describe, expect, it } from "vitest";
import {
  conceptArticles,
  createLocalExtraLabQuestions,
  createLocalExtraQuestion,
  createLocalExtraQuestions,
  labQuestions,
  objectiveQuestions,
  subjects
} from "@/lib/problem-bank";
import { buildAllQuestionBatchPlans, findLikelyDuplicateQuestions, PDF_STYLE_GUARDRAILS, QUESTION_BATCH_SIZE } from "@/lib/question-batch";
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

  it("adds rich study blocks for broad guide chapters", () => {
    const dataModeling = conceptArticles.find((concept) => concept.id === "modeling-data-model");
    expect(dataModeling?.studyBlocks?.length).toBeGreaterThanOrEqual(7);
    expect(dataModeling?.studyBlocks?.some((block) => block.type === "table")).toBe(true);
    expect(dataModeling?.studyBlocks?.some((block) => block.type === "flow")).toBe(true);
    expect(JSON.stringify(dataModeling?.studyBlocks)).toContain("데이터베이스 3단계 구조");
    expect(JSON.stringify(dataModeling?.studyBlocks)).toContain("논리적 독립성");
    expect(JSON.stringify(dataModeling?.studyBlocks)).toContain("좋은 데이터 모델");
  });

  it("keeps the first modeling chapter detailed enough for guide-based study", () => {
    for (const conceptId of ["modeling-data-model", "modeling-entity", "modeling-attribute", "modeling-relationship", "modeling-identifier"]) {
      const concept = conceptArticles.find((article) => article.id === conceptId);
      expect(concept?.studyBlocks?.length).toBeGreaterThanOrEqual(3);
      expect(concept?.studyBlocks?.some((block) => block.type === "table")).toBe(true);
    }
  });

  it("gives every concept a structured study-note layout", () => {
    for (const concept of conceptArticles) {
      expect(concept.studyBlocks?.length).toBeGreaterThanOrEqual(3);
      expect(concept.studyBlocks?.some((block) => block.type === "table")).toBe(true);
      expect(concept.studyBlocks?.some((block) => block.type === "checklist")).toBe(true);
      expect(JSON.stringify(concept.studyBlocks)).not.toContain("세부 포인트");
      expect(JSON.stringify(concept.studyBlocks)).not.toContain("지문/SQL 판정 순서");
      expect(JSON.stringify(concept.studyBlocks)).not.toContain("풀이 공식");
    }
  });

  it("keeps SQL lab questions diverse and reconstructed-exam oriented", () => {
    expect(labQuestions).toHaveLength(20);
    expect(new Set(labQuestions.map((lab) => lab.title)).size).toBe(20);
    expect(new Set(labQuestions.map((lab) => lab.topic)).size).toBeGreaterThanOrEqual(15);
    expect(new Set(labQuestions.map((lab) => lab.schemaSql)).size).toBe(20);
    expect(new Set(labQuestions.map((lab) => lab.seedSql)).size).toBe(20);
    expect(labQuestions.every((lab) => lab.traceStats?.includes("Rows") && lab.traceStats.includes("Loop"))).toBe(true);
    expect(labQuestions.every((lab) => lab.predicateInfo?.includes("Predicate Information"))).toBe(true);

    const labText = JSON.stringify(labQuestions);
    expect(labText).toContain("COUNT STOPKEY");
    expect(labText).toContain("EXCHANGE PARTITION");
    expect(labText).toContain("INDEX RANGE SCAN DESCENDING");
    expect(labText).toContain("PSTART/PSTOP");
  });

  it("adds Korean operation explanations and trace summaries to SQL practice", () => {
    for (const lab of labQuestions) {
      expect(lab.simulationNotice).toContain("설명 예시");
      expect(lab.targetPlanExplanations?.length).toBe(lab.targetPlan.length);
      expect(lab.targetPlanExplanations?.every((item) => item.korean.includes(item.operation) || item.korean.includes(" - "))).toBe(true);
      expect(lab.targetPlanExplanations?.every((item) => item.note.length > 12)).toBe(true);
      expect(lab.traceSummary?.map((row) => row.metric)).toEqual(expect.arrayContaining(["Rows", "Loop/Starts", "PR", "CR", "Time"]));
    }
  });

  it("provides study-ready hints, explanations, and choice feedback", () => {
    for (const question of objectiveQuestions) {
      expect(question.hint).toContain("출제 포인트");
      expect(question.hint).toContain("풀이 방향");
      expect(question.explanation).toContain("정답 근거");
      expect(question.explanation).toContain("시험 포인트");
      expect(question.explanation).toContain("PDF 실전형 복습");

      for (const choice of question.choices) {
        expect(question.whyWrong[choice.id]).toBeTruthy();
        expect(question.whyWrong[choice.id].length).toBeGreaterThan(20);
      }
    }
  });

  it("reflects SQL exam practice PDF style in objective question materials", () => {
    const questionsWithMaterial = objectiveQuestions.filter((question) => question.passage || question.code || question.table);
    const questionsWithTables = objectiveQuestions.filter((question) => question.table);
    const questionsWithCode = objectiveQuestions.filter((question) => question.code);
    const tuningQuestionsWithTraceTable = bySubject("tuning").filter((question) =>
      question.table?.headers.join(" ").includes("Trace/Plan")
    );

    expect(questionsWithMaterial.length).toBeGreaterThanOrEqual(260);
    expect(questionsWithTables.length).toBeGreaterThanOrEqual(90);
    expect(questionsWithCode.length).toBeGreaterThanOrEqual(120);
    expect(tuningQuestionsWithTraceTable.length).toBeGreaterThanOrEqual(40);
    expect(new Set(objectiveQuestions.map((question) => question.questionType)).size).toBeGreaterThanOrEqual(8);
  });

  it("also upgrades the first ten approved seed questions with PDF-style materials", () => {
    for (const subject of subjects) {
      const firstTen = bySubject(subject.id).slice(0, 10);

      expect(firstTen).toHaveLength(10);
      expect(firstTen.every((question) => question.passage?.includes("PDF 실전문제형 기준 문항"))).toBe(true);
      expect(firstTen.every((question) => question.hint.includes("PDF 실전형 체크"))).toBe(true);
      expect(firstTen.every((question) => question.table)).toBe(true);

      if (subject.id === "tuning") {
        expect(firstTen.every((question) => question.table?.headers.join(" ").includes("Trace/Plan"))).toBe(true);
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
      expect(extra.passage).toContain("PDF 실전문제형 추가 사례");
      expect(extra.explanation).toContain("PDF 실전형 복습");
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
      expect(firstBatch.every((question) => question.reviewStatus === "review_required")).toBe(true);
      expect(firstBatch.every((question) => question.duplicationCheck?.includes("review_required"))).toBe(true);
      expect(firstBatch.every((question) => question.passage?.includes("PDF 실전문제형 추가 사례"))).toBe(true);
    }
  });

  it("keeps admin-style 20-question expansion batches in review_required planning", () => {
    const plans = buildAllQuestionBatchPlans();

    expect(plans).toHaveLength(subjects.length);
    for (const plan of plans) {
      expect(plan.batchSize).toBe(QUESTION_BATCH_SIZE);
      expect(plan.nextStartNumber).toBe(101);
      expect(plan.nextEndNumber).toBe(120);
      expect(plan.reviewStatus).toBe("review_required");
      expect(plan.guardrails.join(" ")).toContain("객관식");
      expect(plan.guardrails).toEqual(expect.arrayContaining(PDF_STYLE_GUARDRAILS));
      expect(plan.guardrails.join(" ")).toContain("Trace");
      expect(plan.guardrails.join(" ")).toContain("SQL Practice");
      expect(plan.underrepresentedTopics.length).toBeGreaterThan(0);
    }
  });

  it("does not flag the current approved bank as exact semantic-variant duplicates", () => {
    expect(findLikelyDuplicateQuestions()).toEqual([]);
  });

  it("generates independent extra SQL lab batches after the first 20", () => {
    const firstBatch = createLocalExtraLabQuestions(0, 5);
    const secondBatch = createLocalExtraLabQuestions(5, 5);
    const ids = new Set([...firstBatch, ...secondBatch].map((question) => question.id));

    expect(firstBatch).toHaveLength(5);
    expect(secondBatch).toHaveLength(5);
    expect(firstBatch[0].number).toBe(21);
    expect(secondBatch[0].number).toBe(26);
    expect(ids.size).toBe(10);
    expect(new Set([...firstBatch, ...secondBatch].map((question) => question.schemaSql)).size).toBeGreaterThanOrEqual(5);
    expect(firstBatch.every((question) => question.traceStats?.includes("CR"))).toBe(true);
    expect(firstBatch.every((question) => question.predicateInfo?.includes("access"))).toBe(true);
    expect(firstBatch.every((question) => question.title.includes("PDF 실기형 추가"))).toBe(true);
    expect(firstBatch.every((question) => question.prompt.includes("PDF 실기형 추가 조건"))).toBe(true);
    expect(firstBatch.every((question) => question.rubric.some((item) => item.includes("데이터 분포")))).toBe(true);
  });
});
