import type { AnswerRecord, AttemptRecord, ObjectiveQuestion } from "@/lib/types";

type VersionedQuestion = Pick<ObjectiveQuestion, "id" | "contentHash">;

function questionMap(questions: VersionedQuestion[]) {
  return new Map(questions.map((question) => [question.id, question]));
}

export function isCurrentAnswerForQuestion(answer: AnswerRecord | undefined, question: VersionedQuestion | undefined) {
  if (!answer || !question) return false;
  if (!question.contentHash) return true;
  return answer.questionContentHash === question.contentHash;
}

export function filterCurrentAnswers(answers: Record<string, AnswerRecord>, questions: VersionedQuestion[]) {
  const questionsById = questionMap(questions);

  return Object.fromEntries(
    Object.entries(answers).filter(([questionId, answer]) => isCurrentAnswerForQuestion(answer, questionsById.get(questionId)))
  );
}

export function filterCurrentAttempts(attempts: AttemptRecord[], questions: VersionedQuestion[]) {
  const questionsById = questionMap(questions);

  return attempts.filter((attempt) => {
    const question = questionsById.get(attempt.questionId);
    if (!question) return false;
    if (!question.contentHash) return true;
    return attempt.questionContentHash === question.contentHash;
  });
}
