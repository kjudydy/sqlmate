import { NextResponse } from "next/server";
import { z } from "zod";
import { createLocalExtraQuestion, subjects } from "@/lib/problem-bank";
import type { ChoiceId, ObjectiveQuestion, SubjectId } from "@/lib/types";

const requestSchema = z.object({
  action: z.literal("generate-question"),
  subjectId: z.enum(["modeling", "sql-basic", "tuning"]),
  count: z.number().int().min(0).default(0)
});

const choiceIds: ChoiceId[] = ["A", "B", "C", "D"];

function extractOutputText(data: unknown) {
  const response = data as {
    output_text?: string;
    output?: Array<{ content?: Array<{ type?: string; text?: string }> }>;
  };

  if (response.output_text) return response.output_text;

  return (
    response.output
      ?.flatMap((item) => item.content ?? [])
      .filter((content) => content.type === "output_text" || content.text)
      .map((content) => content.text ?? "")
      .join("\n") ?? ""
  );
}

function parseJsonObject(text: string) {
  const cleaned = text.replace(/```json|```/g, "").trim();
  const start = cleaned.indexOf("{");
  const end = cleaned.lastIndexOf("}");
  if (start === -1 || end === -1) return null;
  return JSON.parse(cleaned.slice(start, end + 1)) as Partial<ObjectiveQuestion>;
}

function normalizeGeneratedQuestion(raw: Partial<ObjectiveQuestion>, subjectId: SubjectId, count: number): ObjectiveQuestion | null {
  const subjectName = subjects.find((subject) => subject.id === subjectId)?.name ?? "SQLP";
  const choices = raw.choices?.slice(0, 4);
  const answer = raw.answer;

  if (!raw.stem || !choices || choices.length !== 4 || !answer || !choiceIds.includes(answer)) {
    return null;
  }

  return {
    id: `${subjectId}-ai-${Date.now()}-${count}`,
    number: 101 + count,
    subjectId,
    subjectName,
    topic: raw.topic ?? "SQLP 실전",
    difficulty: raw.difficulty ?? "실전",
    stem: raw.stem,
    choices: choices.map((choice, index) => ({
      id: choiceIds[index],
      text: choice.text
    })),
    answer,
    hint: raw.hint ?? "키워드 암기보다 실행 결과와 성능 영향을 함께 생각하세요.",
    explanation: raw.explanation ?? "SQLP 공식 출제 범위에 맞춘 오리지널 추가 문항입니다.",
    whyWrong: {
      A: raw.whyWrong?.A ?? "선택지의 전제 또는 범위가 부정확합니다.",
      B: raw.whyWrong?.B ?? "선택지의 전제 또는 범위가 부정확합니다.",
      C: raw.whyWrong?.C ?? "선택지의 전제 또는 범위가 부정확합니다.",
      D: raw.whyWrong?.D ?? "선택지의 전제 또는 범위가 부정확합니다."
    }
  };
}

export async function POST(request: Request) {
  const parsed = requestSchema.safeParse(await request.json());
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }

  const { subjectId, count } = parsed.data;
  const fallback = createLocalExtraQuestion(subjectId, count);
  const apiKey = process.env.OPENAI_API_KEY;
  const model = process.env.OPENAI_MODEL;

  if (!apiKey || !model) {
    return NextResponse.json({
      question: fallback,
      mode: "local",
      message: "OPENAI_API_KEY와 OPENAI_MODEL이 없어 무료 로컬 생성 문항을 반환했습니다."
    });
  }

  try {
    const response = await fetch("https://api.openai.com/v1/responses", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model,
        instructions:
          "You create original Korean SQLP-style exam questions. Do not reproduce real copyrighted exam questions. Return strict JSON only.",
        input: `과목: ${subjectId}. SQLP 공식 범위와 Oracle 튜닝 관점을 반영한 객관식 4지선다 오리지널 문제 1개를 JSON으로 생성해줘. 필드: topic, difficulty("기본"|"중간"|"실전"), stem, choices[{id,text}], answer("A"|"B"|"C"|"D"), hint, explanation, whyWrong{A,B,C,D}.`
      })
    });

    if (!response.ok) {
      return NextResponse.json({ question: fallback, mode: "local", message: "AI 생성 실패로 로컬 문항을 반환했습니다." });
    }

    const text = extractOutputText(await response.json());
    const generated = normalizeGeneratedQuestion(parseJsonObject(text) ?? {}, subjectId, count);

    return NextResponse.json({
      question: generated ?? fallback,
      mode: generated ? "ai" : "local",
      message: generated ? "AI 추가 문항을 생성했습니다." : "AI 응답 검증 실패로 로컬 문항을 반환했습니다."
    });
  } catch {
    return NextResponse.json({
      question: fallback,
      mode: "local",
      message: "AI 호출 예외로 로컬 문항을 반환했습니다."
    });
  }
}
