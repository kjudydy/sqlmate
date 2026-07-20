import { describe, expect, it } from "vitest";
import { conceptDocuments, practiceScenarios, sqlpQuestions } from "@/lib/content/sqlp-content";
import { summarizeDistribution, validateContentSet } from "@/lib/validation/content-quality";

describe("SQLP quality seed content", () => {
  it("contains the approved first quality set", () => {
    const distribution = summarizeDistribution(sqlpQuestions);

    expect(distribution.bySubject["subject-1"]).toBe(10);
    expect(distribution.bySubject["subject-2"]).toBe(10);
    expect(distribution.bySubject["subject-3"]).toBe(10);
    expect(practiceScenarios).toHaveLength(3);
    expect(conceptDocuments.length).toBeGreaterThanOrEqual(3);
  });

  it("mixes problem types beyond simple single choice", () => {
    const distribution = summarizeDistribution(sqlpQuestions);

    expect(Object.keys(distribution.byType).length).toBeGreaterThanOrEqual(10);
    expect(distribution.byType.single_choice).toBeLessThan(10);
    expect(distribution.byType.trace_analysis).toBeGreaterThanOrEqual(2);
    expect(distribution.byType.multi_select).toBeGreaterThanOrEqual(3);
  });

  it("passes required quality gates for first set", () => {
    const issues = validateContentSet(sqlpQuestions, conceptDocuments, practiceScenarios);
    const failures = issues.filter((issue) => issue.severity === "fail");

    expect(failures).toEqual([]);
  });

  it("links every question to at least one concept", () => {
    for (const question of sqlpQuestions) {
      expect(question.relatedConceptIds.length).toBeGreaterThan(0);
    }
  });

  it("keeps practice scenarios internally grounded in trace and predicate data", () => {
    for (const scenario of practiceScenarios) {
      expect(scenario.currentTrace.queryGets).toBeGreaterThan(0);
      expect(scenario.currentPlan.length).toBeGreaterThanOrEqual(3);
      expect(scenario.targetPlan.length).toBeGreaterThanOrEqual(3);
      expect(scenario.predicateInfo.join("\n")).toMatch(/access|filter|PSTART|PSTOP|Predicate/i);
      expect(scenario.acceptableSqlPatterns.length).toBeGreaterThanOrEqual(3);
    }
  });
});
