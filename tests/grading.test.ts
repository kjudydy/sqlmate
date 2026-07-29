import { describe, expect, it } from "vitest";
import { containsUnsafeSql, gradeSqlSubmission, isReadOnlySql, isStaticDesignSql, normalizeSql } from "@/lib/grading";
import type { LabQuestion } from "@/lib/types";

const lab: LabQuestion = {
  id: "lab-test",
  number: 1,
  title: "테스트 실습",
  difficulty: "실전",
  topic: "인덱스 조인",
  scenario: "테스트",
  schemaSql: "",
  seedSql: "",
  prompt: "",
  expectedSql: "",
  targetPlan: [],
  oracleNotes: [],
  hints: [],
  rubric: []
};

describe("SQLMate grading helpers", () => {
  it("normalizes whitespace and trailing semicolons", () => {
    expect(normalizeSql(" SELECT  *   FROM orders; ")).toBe("select * from orders");
  });

  it("rejects write or multi statement SQL", () => {
    expect(containsUnsafeSql("drop table users")).toBe(true);
    expect(isReadOnlySql("select * from orders; delete from orders")).toBe(false);
  });

  it("accepts read-only SQL and gives tuning credit", () => {
    const result = gradeSqlSubmission(
      lab,
      "select /*+ leading(o c) use_nl(c) index(o orders_ix1) */ * from orders o join customers c on c.id = o.customer_id where o.order_date >= current_date - interval '7 day'"
    );

    expect(result.passed).toBe(true);
    expect(result.plan.join("\n")).toContain("Index Scan");
  });

  it("accepts CREATE INDEX plus SELECT as a static design answer without treating it as executable SQL", () => {
    const sql = `create index orders_ix1 on orders(customer_id, order_date);

select /*+ index(o orders_ix1) */ *
from orders o
where o.order_date >= date '2026-07-01'`;

    expect(isReadOnlySql(sql)).toBe(false);
    expect(isStaticDesignSql(sql)).toBe(true);
    expect(gradeSqlSubmission(lab, sql).score).toBeGreaterThanOrEqual(70);
  });
});
