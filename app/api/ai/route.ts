import { NextResponse } from "next/server";
import { z } from "zod";

const requestSchema = z.object({
  action: z.literal("generate-question"),
  subjectId: z.enum(["modeling", "sql-basic", "tuning"]),
  count: z.number().int().min(0).default(0)
});

export async function POST(request: Request) {
  const parsed = requestSchema.safeParse(await request.json());
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }

  return NextResponse.json(
    {
      error: "추가 문제 자동 생성은 중지되었습니다. PDF 원문 대조와 검수를 통과한 문제만 공개합니다.",
      mode: "blocked"
    },
    { status: 410 }
  );
}
