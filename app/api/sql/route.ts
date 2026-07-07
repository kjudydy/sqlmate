import { NextResponse } from "next/server";
import { z } from "zod";
import { gradeSqlSubmission, isReadOnlySql, normalizeSql, simulatePlan } from "@/lib/grading";
import { labQuestions } from "@/lib/problem-bank";

const requestSchema = z.object({
  sql: z.string().min(1).max(12000),
  labId: z.string().optional()
});

function toPlanLines(rows: Array<Record<string, unknown>>) {
  return rows.map((row) => String(row["QUERY PLAN"] ?? Object.values(row)[0] ?? "")).filter(Boolean);
}

export async function POST(request: Request) {
  const parsed = requestSchema.safeParse(await request.json());
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }

  const { sql, labId } = parsed.data;
  const lab = labQuestions.find((item) => item.id === labId) ?? labQuestions[0];

  if (!isReadOnlySql(sql)) {
    return NextResponse.json(
      {
        mode: "rejected",
        plan: ["Rejected before execution"],
        message: "SELECT, WITH, EXPLAIN만 허용됩니다. 세미콜론, 주석형 다중문, DDL/DML은 차단했습니다.",
        grading: gradeSqlSubmission(lab, sql)
      },
      { status: 400 }
    );
  }

  if (!process.env.DATABASE_URL) {
    return NextResponse.json({
      mode: "local",
      plan: simulatePlan(sql),
      message: "DATABASE_URL이 없어 PostgreSQL 실행 대신 SQLMate 튜닝 시뮬레이션을 사용했습니다.",
      grading: gradeSqlSubmission(lab, sql)
    });
  }

  let client: import("pg").Client | null = null;

  try {
    const { Client } = await import("pg");
    client = new Client({
      connectionString: process.env.DATABASE_URL,
      application_name: "sqlmate-readonly-lab"
    });
    await client.connect();
    await client.query("begin read only");
    await client.query("set local statement_timeout = '3000ms'");

    const normalized = normalizeSql(sql);
    const explainSql = normalized.startsWith("explain") ? sql : `explain (costs true, verbose false, buffers false, format text) ${sql}`;
    const result = await client.query(explainSql);
    await client.query("rollback");

    return NextResponse.json({
      mode: "postgres",
      plan: toPlanLines(result.rows),
      message: "PostgreSQL EXPLAIN 결과입니다. 해설은 Oracle/SQLP 튜닝 관점으로 함께 판단하세요.",
      grading: gradeSqlSubmission(lab, sql)
    });
  } catch (error) {
    if (client) {
      try {
        await client.query("rollback");
      } catch {
        // Ignore rollback failures from already closed connections.
      }
    }

    return NextResponse.json({
      mode: "local",
      plan: simulatePlan(sql),
      message: error instanceof Error ? `PostgreSQL 실행 실패: ${error.message}` : "PostgreSQL 실행 실패로 로컬 시뮬레이션을 사용했습니다.",
      grading: gradeSqlSubmission(lab, sql)
    });
  } finally {
    await client?.end().catch(() => undefined);
  }
}
