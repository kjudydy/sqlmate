import { objectiveQuestions, subjects } from "@/lib/problem-bank";
import type { ObjectiveQuestion, SubjectId } from "@/lib/types";

export const QUESTION_BATCH_SIZE = 20;

export type QuestionBatchPlan = {
  subjectId: SubjectId;
  subjectName: string;
  currentApprovedCount: number;
  nextStartNumber: number;
  nextEndNumber: number;
  batchSize: number;
  underrepresentedTopics: Array<{
    topic: string;
    count: number;
  }>;
  reviewStatus: "review_required";
  guardrails: string[];
};

function normalizeForDuplication(value: string) {
  return value
    .toLowerCase()
    .replace(/[0-9]+/g, "#")
    .replace(/[a-z][a-z0-9_]*(?=\s*(?:\.|,|\)|\())/gi, "id")
    .replace(/\s+/g, " ")
    .trim();
}

function questionFingerprint(question: ObjectiveQuestion) {
  return normalizeForDuplication(
    [
      question.subjectId,
      question.majorTopic ?? "",
      question.middleTopic ?? "",
      question.topic,
      question.questionType ?? "",
      question.stem,
      question.passage ?? "",
      question.code ?? "",
      question.table ? JSON.stringify(question.table) : "",
      question.choices.map((choice) => choice.text).join("|")
    ].join("::")
  );
}

function topicCounts(subjectId: SubjectId) {
  const counts = new Map<string, number>();

  for (const question of objectiveQuestions.filter((item) => item.subjectId === subjectId && (item.reviewStatus ?? "approved") === "approved")) {
    counts.set(question.topic, (counts.get(question.topic) ?? 0) + 1);
  }

  return Array.from(counts, ([topic, count]) => ({ topic, count })).sort((a, b) => a.count - b.count || a.topic.localeCompare(b.topic, "ko"));
}

export function buildQuestionBatchPlan(subjectId: SubjectId, batchSize = QUESTION_BATCH_SIZE): QuestionBatchPlan {
  const subject = subjects.find((item) => item.id === subjectId);
  const subjectQuestions = objectiveQuestions.filter((question) => question.subjectId === subjectId && (question.reviewStatus ?? "approved") === "approved");
  const currentApprovedCount = subjectQuestions.length;
  const nextStartNumber = currentApprovedCount + 1;

  return {
    subjectId,
    subjectName: subject?.name ?? subjectId,
    currentApprovedCount,
    nextStartNumber,
    nextEndNumber: nextStartNumber + batchSize - 1,
    batchSize,
    underrepresentedTopics: topicCounts(subjectId).slice(0, 8),
    reviewStatus: "review_required",
    guardrails: [
      "필기 문제는 클릭형 객관식으로만 생성한다.",
      "기존 문제의 숫자, 테이블명, 선택지 순서만 바꾼 문제는 중복으로 본다.",
      "새 배치는 관리자 검수 전 review_required 상태로 둔다.",
      "관련 개념 ID와 선택지별 해설이 없는 문제는 공개하지 않는다."
    ]
  };
}

export function buildAllQuestionBatchPlans(batchSize = QUESTION_BATCH_SIZE) {
  return subjects.map((subject) => buildQuestionBatchPlan(subject.id, batchSize));
}

export function findLikelyDuplicateQuestions(questions: ObjectiveQuestion[] = objectiveQuestions) {
  const buckets = new Map<string, ObjectiveQuestion[]>();

  for (const question of questions) {
    const key = questionFingerprint(question);
    buckets.set(key, [...(buckets.get(key) ?? []), question]);
  }

  return Array.from(buckets.values())
    .filter((bucket) => bucket.length > 1)
    .map((bucket) => bucket.map((question) => question.id));
}

