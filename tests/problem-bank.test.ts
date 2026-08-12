import { describe, expect, it } from "vitest";
import {
  createLocalExtraLabQuestion,
  createLocalExtraLabQuestions,
  createLocalExtraQuestion,
  createLocalExtraQuestions,
  labQuestions,
  objectiveQuestions,
  officialSourceVersion,
  subjects
} from "@/lib/problem-bank";
import { conceptArticles } from "@/lib/concepts";
import { findLikelyDuplicateQuestions } from "@/lib/question-batch";
import {
  findPublishedUserVisibleIssues,
  getVerifiedProductionSummary,
  verifiedOfficialSourceVersion
} from "@/lib/verified-production-bank";
import type { ObjectiveQuestion, SubjectId } from "@/lib/types";

const expectedObjectiveCounts: Record<SubjectId, number> = {
  modeling: 101,
  "sql-basic": 121,
  tuning: 152
};

function bySubject(subjectId: SubjectId) {
  return objectiveQuestions.filter((question) => question.subjectId === subjectId);
}

function userVisibleQuestionText(question: ObjectiveQuestion) {
  return [
    question.subjectName,
    question.majorTopic,
    question.middleTopic,
    question.topic,
    question.difficulty,
    question.questionType,
    question.stem,
    question.passage,
    question.code,
    ...(question.visualAssets ?? []).map((asset) => [asset.title, asset.alt, asset.caption].filter(Boolean).join(" ")),
    question.table ? [question.table.headers.join(" "), question.table.rows.flat().join(" ")].join(" ") : "",
    ...(question.tables ?? []).map((table) => [table.title, table.headers.join(" "), table.rows.flat().join(" ")].filter(Boolean).join(" ")),
    ...question.choices.map((choice) => choice.text),
    question.hint,
    question.explanation,
    ...Object.values(question.whyWrong)
  ]
    .filter(Boolean)
    .join("\n");
}

function questionSignature(question: ObjectiveQuestion) {
  return [
    question.subjectId,
    question.majorTopic,
    question.middleTopic,
    question.topic,
    question.stem,
    question.passage ?? "",
    question.code ?? "",
    question.table ? JSON.stringify(question.table) : "",
    question.tables ? JSON.stringify(question.tables) : "",
    question.choices.map((choice) => choice.text).join("|")
  ]
    .join("::")
    .replace(/\s+/g, " ")
    .trim();
}

describe("SQLMate verified production problem bank", () => {
  it("publishes only reviewed PDF objective questions", () => {
    expect(objectiveQuestions).toHaveLength(Object.values(expectedObjectiveCounts).reduce((sum, count) => sum + count, 0));
    expect(bySubject("modeling")).toHaveLength(expectedObjectiveCounts.modeling);
    expect(bySubject("sql-basic")).toHaveLength(expectedObjectiveCounts["sql-basic"]);
    expect(bySubject("tuning")).toHaveLength(expectedObjectiveCounts.tuning);
  });

  it("summarizes original, variant, and similar questions for each subject", () => {
    const summary = getVerifiedProductionSummary();

    expect(summary.objectiveTotal).toBe(Object.values(expectedObjectiveCounts).reduce((sum, count) => sum + count, 0));
    for (const subject of subjects) {
      const subjectSummary = summary.bySubject[subject.id];
      expect(subjectSummary.total).toBe(bySubject(subject.id).length);
      expect(subjectSummary.original).toBeGreaterThan(0);
      expect(subjectSummary.variant + subjectSummary.similar).toBeGreaterThan(0);
      expect(subjectSummary.topics).toBeGreaterThanOrEqual(3);
      expect(subjectSummary.types).toBeGreaterThanOrEqual(1);
    }
  });

  it("does not expose source metadata or review statuses in user-visible question fields", () => {
    expect(findPublishedUserVisibleIssues()).toEqual([]);

    const forbidden = [
      "sourceDocument",
      "sourceType",
      "generationMode",
      "review_required",
      "original_ready",
      "문항 키",
      "추출 상태",
      "PDF 원문 문항",
      "유사형 문항",
      "묘의 상태",
      "테아블"
    ];
    const forbiddenPatterns = [
      /[公分往幻務]/,
      /I八|八\)|八3/,
      /\bF\s+R\s+O\s+M\b/i,
      /\bFR\s+O\s+M\b/i,
      /\bU\s+N\s*I\s*O\s+N\b/i,
      /\bSELEC\s+T\b/i,
      /\bPROM\s+TBL\b/i,
      /\bN\s+U\s+LL\b/i,
      /\bV\s+A\s+R\s*CH\s*A?\s*R?2?\b/i,
      /부\s+적\s+절|적\s+절|가\s+장|것\s+은|실\s+행|결\s+과|오\s+류|작\s+성|모\s+델/,
      /SESSIONJ?D|LOCKJ?D|PRODJ?D|STADIUMJ?D/i,
      /31正3/
    ];

    for (const question of objectiveQuestions) {
      const text = userVisibleQuestionText(question);
      for (const pattern of forbidden) {
        expect(text).not.toContain(pattern);
      }
      for (const pattern of forbiddenPatterns) {
        expect(text).not.toMatch(pattern);
      }
      expect(text).not.toMatch(/\[[^\]]+\.pdf\s+p\./i);
      expect(text).not.toContain(question.sourceDocument ?? "__no_source__");
    }
  });

  it("does not publish PDF items whose SQL, tables, or trace are collapsed into the stem", () => {
    const collapsedMaterialTokens = [
      "CREATE TABLE",
      "ALTER TABLE",
      "INSERT INTO",
      "DELETE FROM",
      "SELECT ",
      " FROM ",
      " WHERE ",
      " GROUP BY ",
      " HAVING ",
      " ORDER BY ",
      " REFERENCES ",
      " ON DELETE ",
      "[SQL]",
      "[테이블",
      "현재 테이블",
      "테이블 명",
      "실행계획",
      "TRACE"
    ];

    for (const question of objectiveQuestions) {
      if (question.code || question.table || question.tables?.length || question.passage) continue;

      const upperStem = question.stem.toUpperCase();
      const materialHits = collapsedMaterialTokens.filter((token) => upperStem.includes(token)).length;

      expect(materialHits).toBeLessThan(2);
      expect(upperStem).not.toContain("CREATE TABLE");
      expect(question.stem).not.toMatch(/\bSELECT\b.+\bFROM\b/i);
    }
  });

  it("stores internal source and validation metadata for every published question", () => {
    expect(officialSourceVersion).toBe(verifiedOfficialSourceVersion);

    for (const question of objectiveQuestions) {
      expect(question.sourceVersion).toBe(verifiedOfficialSourceVersion);
      expect(question.sourceDocument).toBeTruthy();
      expect(question.sourceType).toMatch(/^owner_pdf/);
      expect(question.generationMode).toMatch(/original|transformed|generated_similar/);
      expect(question.reviewStatus).toBe("approved");
      expect(question.validationStatus).toBe("validated");
      expect(question.contentHash).toMatch(/^[0-9a-f]{8}$/);
      expect(question.semanticFingerprint).toMatch(/^[0-9a-f]{8}$/);
      expect(question.batchId).toBeTruthy();
    }
  });

  it("keeps choices, answer mapping, hints, explanations, and related concepts complete", () => {
    for (const question of objectiveQuestions) {
      expect(question.choices).toHaveLength(4);
      expect(question.choices.map((choice) => choice.id)).toEqual(["A", "B", "C", "D"]);
      expect(question.choices.some((choice) => choice.id === question.answer)).toBe(true);
      expect(question.hint).toMatch(/1(?:단계|\?④퀎)/);
      expect(question.hint).toMatch(/2(?:단계|\?④퀎)/);
      expect(question.hint).toMatch(/3(?:단계|\?④퀎)/);
      expect(question.explanation.length).toBeGreaterThan(20);
      expect(question.relatedConceptId).toBeTruthy();

      for (const choice of question.choices) {
        expect(question.whyWrong[choice.id]).toBeTruthy();
        expect(question.whyWrong[choice.id].length).toBeGreaterThan(10);
      }
    }
  });

  it("links NULL-focused SQL questions to the detailed NULL concept", () => {
    const nullConcept = conceptArticles.find((concept) => concept.id === "sql-null");
    const nullConceptText = JSON.stringify(nullConcept?.studyBlocks ?? []);
    const nullFocusedQuestions = objectiveQuestions.filter(
      (question) => {
        const topicText = [question.middleTopic, question.topic].filter(Boolean).join(" ");
        const sourceText = [question.parentQuestionId, question.stem].filter(Boolean).join(" ");
        return question.subjectId === "sql-basic" && /\bNULL\b/i.test(topicText) && !/SET NULL/i.test(sourceText);
      }
    );

    expect(nullConcept?.studyBlocks?.length).toBeGreaterThanOrEqual(5);
    expect(nullConceptText).toContain("UNKNOWN");
    expect(nullConceptText).toContain("NOT IN");
    expect(nullConceptText).toContain("COUNT(*)");
    expect(nullConceptText).toContain("OUTER JOIN");
    expect(nullFocusedQuestions.length).toBeGreaterThanOrEqual(5);

    for (const question of nullFocusedQuestions) {
      expect(
        question.relatedConceptId,
        `${question.subjectId} ${question.number} ${question.middleTopic} ${question.topic} ${question.parentQuestionId ?? ""}`
      ).toBe("sql-null");
    }
  });

  it("links SQL join result and history-join questions to join concepts", () => {
    const joinConceptText = JSON.stringify(
      [
        conceptArticles.find((concept) => concept.id === "sql-join")?.studyBlocks ?? [],
        conceptArticles.find((concept) => concept.id === "sql-standard-join")?.studyBlocks ?? []
      ]
    );
    const expectedJoinLinks = new Map([
      ["prod-ext-sql-basic-022", "sql-standard-join"],
      ["prod-ext-sql-basic-053", "sql-standard-join"],
      ["prod-ext-sql-basic-070", "sql-join"],
      { questionId: "prod-ext-sql-basic-207", conceptId: "sql-join", keywords: ["BETWEEN", "JOIN"] },
    ]);

    expect(joinConceptText).toContain("OUTER JOIN");
    expect(joinConceptText).toContain("LEFT OUTER JOIN");
    expect(joinConceptText).toContain("FULL OUTER JOIN");
    expect(joinConceptText).toContain("COUNT(*)");
    expect(joinConceptText).toContain("이력 조인");

    for (const [questionId, conceptId] of expectedJoinLinks) {
      const question = objectiveQuestions.find((item) => item.id === questionId);
      expect(question, questionId).toBeTruthy();
      expect(question?.relatedConceptId).toBe(conceptId);
    }
  });

  it("keeps COUNT/NULL, NOT IN/NULL, and referential DELETE questions on their most useful concepts", () => {
    const expectedLinks = new Map([
      ["prod-ext-sql-basic-068", "sql-null"],
      ["prod-ext-sql-basic-082", "sql-null"],
      ["prod-ext-sql-basic-083", "sql-null"],
      ["prod-ext-sql-basic-106", "sql-null"],
      ["prod-ext-sql-basic-117", "sql-null"],
      ["prod-ext-sql-basic-212", "sql-null"],
      ["prod-ext-sql-basic-218", "sql-constraints"]
    ]);
    const nullConceptText = JSON.stringify(conceptArticles.find((concept) => concept.id === "sql-null")?.studyBlocks ?? []);
    const constraintConceptText = JSON.stringify(
      conceptArticles.find((concept) => concept.id === "sql-constraints")?.studyBlocks ?? []
    );

    expect(nullConceptText).toContain("COUNT(*)");
    expect(nullConceptText).toContain("COUNT(컬럼)");
    expect(nullConceptText).toContain("NOT IN");
    expect(nullConceptText).toContain("UNKNOWN");
    expect(constraintConceptText).toContain("ON DELETE CASCADE");
    expect(constraintConceptText).toContain("ON DELETE SET NULL");

    for (const [questionId, conceptId] of expectedLinks) {
      const question = objectiveQuestions.find((item) => item.id === questionId);
      expect(question, questionId).toBeTruthy();
      expect(question?.relatedConceptId).toBe(conceptId);
    }
  });

  it("links the first modeling audit batch to the concepts that actually explain each question", () => {
    const expectedLinks = new Map([
      ["prod-modeling-001", "modeling-entity"],
      ["prod-modeling-002", "modeling-entity"],
      ["prod-modeling-003", "modeling-entity"],
      ["prod-modeling-005", "modeling-attribute"],
      ["prod-modeling-006", "modeling-entity"],
      ["prod-modeling-008", "modeling-attribute"],
      ["prod-ext-modeling-024", "modeling-history"],
      ["prod-ext-modeling-026", "modeling-super-subtype"],
      ["prod-ext-modeling-030", "modeling-distributed"],
      ["prod-ext-modeling-035", "modeling-normalization"]
    ]);
    const conceptTextById = new Map(
      ["modeling-entity", "modeling-attribute", "modeling-history", "modeling-super-subtype", "modeling-distributed", "modeling-normalization"].map(
        (conceptId) => [
          conceptId,
          JSON.stringify(conceptArticles.find((concept) => concept.id === conceptId)?.studyBlocks ?? [])
        ]
      )
    );

    expect(conceptTextById.get("modeling-entity")).toContain("엔터티 성립 조건");
    expect(conceptTextById.get("modeling-attribute")).toContain("도메인");
    expect(conceptTextById.get("modeling-history")).toContain("선분 이력");
    expect(conceptTextById.get("modeling-super-subtype")).toContain("슈퍼타입");
    expect(conceptTextById.get("modeling-distributed")).toContain("위치 투명성");
    expect(conceptTextById.get("modeling-normalization")).toContain("중복 관계 반정규화");

    for (const [questionId, conceptId] of expectedLinks) {
      const question = objectiveQuestions.find((item) => item.id === questionId);
      expect(question, questionId).toBeTruthy();
      expect(question?.relatedConceptId).toBe(conceptId);
    }
  });

  it("links the second modeling audit batch without flattening specific concepts", () => {
    const expectedLinks = new Map([
      ["prod-ext-modeling-051", "modeling-entity"],
      ["prod-ext-modeling-053", "modeling-relationship"],
      ["prod-ext-modeling-063", "modeling-natural-surrogate"],
      ["prod-ext-modeling-070", "modeling-distributed"],
      ["prod-ext-modeling-086", "modeling-history"],
      ["prod-ext-modeling-088", "modeling-super-subtype"],
      ["prod-ext-modeling-089", "modeling-distributed"]
    ]);
    const naturalKeyConceptText = JSON.stringify(
      conceptArticles.find((concept) => concept.id === "modeling-natural-surrogate")?.studyBlocks ?? []
    );

    expect(naturalKeyConceptText).toContain("본질식별자");
    expect(naturalKeyConceptText).toContain("인조식별자");

    for (const [questionId, conceptId] of expectedLinks) {
      const question = objectiveQuestions.find((item) => item.id === questionId);
      expect(question, questionId).toBeTruthy();
      expect(question?.relatedConceptId).toBe(conceptId);
    }
  });

  it("links the final modeling audit batch to subject-one concepts", () => {
    const expectedLinks = new Map([
      ["prod-ext-modeling-109", "modeling-history"],
      ["prod-ext-modeling-110", "modeling-super-subtype"],
      ["prod-ext-modeling-112", "modeling-distributed"],
      ["prod-ext-modeling-117", "modeling-relationship"],
      ["prod-ext-modeling-118", "modeling-transaction-model"],
      ["prod-ext-modeling-119", "modeling-null"]
    ]);
    const transactionConceptText = JSON.stringify(
      conceptArticles.find((concept) => concept.id === "modeling-transaction-model")?.studyBlocks ?? []
    );

    expect(transactionConceptText).toContain("ACID");
    expect(transactionConceptText).toContain("원자성");
    expect(transactionConceptText).toContain("일관성");
    expect(transactionConceptText).toContain("고립성");
    expect(transactionConceptText).toContain("지속성");

    for (const [questionId, conceptId] of expectedLinks) {
      const question = objectiveQuestions.find((item) => item.id === questionId);
      expect(question, questionId).toBeTruthy();
      expect(question?.relatedConceptId).toBe(conceptId);
    }
  });

  it("links constraint-focused SQL questions to the detailed constraint concept", () => {
    const constraintConcept = conceptArticles.find((concept) => concept.id === "sql-constraints");
    const constraintConceptText = JSON.stringify(constraintConcept?.studyBlocks ?? []);
    const constraintFocusedQuestions = objectiveQuestions.filter((question) => {
      const linkText = [question.middleTopic, question.topic, question.stem, question.code, question.parentQuestionId].filter(Boolean).join(" ");
      const isPermissionCommandQuestion = /(GRANT|REVOKE|DCL|권한)/i.test(linkText);
      return (
        question.subjectId === "sql-basic" &&
        !isPermissionCommandQuestion &&
        !/SELECT\s+목록\s+제약|GROUP BY.*SELECT/i.test(linkText) &&
        /(제약조건|참조\s*무결성|CHECK|PRIMARY\s+KEY|FOREIGN\s+KEY|UNIQUE|ON\s+DELETE|CASCADE|SET\s+NULL|외래키|기본키)/i.test(linkText)
      );
    });

    expect(constraintConcept).toBeTruthy();
    expect(constraintConceptText).toContain("PRIMARY KEY");
    expect(constraintConceptText).toContain("FOREIGN KEY");
    expect(constraintConceptText).toContain("UNIQUE");
    expect(constraintConceptText).toContain("CHECK");
    expect(constraintConceptText).toContain("ON DELETE CASCADE");
    expect(constraintConceptText).toContain("ON DELETE SET NULL");
    expect(constraintFocusedQuestions.length).toBeGreaterThanOrEqual(3);

    for (const question of constraintFocusedQuestions) {
      expect(
        question.relatedConceptId,
        `${question.subjectId} ${question.number} ${question.middleTopic} ${question.topic} ${question.parentQuestionId ?? ""}`
      ).toBe("sql-constraints");
    }
  });

  it("links SQL identifier rule questions to the identifier concept", () => {
    const identifierConcept = conceptArticles.find((concept) => concept.id === "sql-identifiers");
    const identifierConceptText = JSON.stringify(identifierConcept?.studyBlocks ?? []);
    const identifierQuestions = objectiveQuestions.filter((question) =>
      ["prod-sql-basic-005", "prod-sql-basic-008"].includes(question.id)
    );

    expect(identifierConcept).toBeTruthy();
    expect(identifierConceptText).toContain("일반 식별자");
    expect(identifierConceptText).toContain("인용 식별자");
    expect(identifierConceptText).toContain("큰따옴표");
    expect(identifierConceptText).toContain("예약어");
    expect(identifierQuestions).toHaveLength(2);

    for (const question of identifierQuestions) {
      expect(question.relatedConceptId).toBe("sql-identifiers");
    }
  });

  it("links SQL management command questions to the management command concepts", () => {
    const tclConcept = conceptArticles.find((concept) => concept.id === "sql-tcl");
    const tclConceptText = JSON.stringify(tclConcept?.studyBlocks ?? []);
    const dclConceptText = JSON.stringify(conceptArticles.find((concept) => concept.id === "sql-dcl")?.studyBlocks ?? []);
    const sqlQuestion11 = objectiveQuestions.find((question) => question.subjectId === "sql-basic" && question.number === 11);
    const sqlQuestion1 = objectiveQuestions.find((question) => question.subjectId === "sql-basic" && question.number === 1);
    const mergeQuestion = objectiveQuestions.find((question) => question.subjectId === "sql-basic" && question.topic === "MERGE");

    expect(tclConcept).toBeTruthy();
    expect(tclConceptText).toContain("DDL");
    expect(tclConceptText).toContain("DML");
    expect(tclConceptText).toContain("TCL");
    expect(tclConceptText).toContain("DCL");
    expect(tclConceptText).toContain("COMMIT");
    expect(tclConceptText).toContain("ROLLBACK");
    expect(tclConceptText).toContain("SAVEPOINT");
    expect(dclConceptText).toContain("GRANT");
    expect(dclConceptText).toContain("REVOKE");

    expect(sqlQuestion11?.relatedConceptId).toBe("sql-tcl");
    expect(sqlQuestion1?.relatedConceptId).toBe("sql-dcl");
    expect(mergeQuestion?.relatedConceptId).toBe("sql-dml");
  });

  it("keeps the first SQL-basic concept batch connected to useful concept content", () => {
    const expectedLinks = new Map([
      ["prod-sql-basic-001", "sql-dcl"],
      ["prod-sql-basic-002", "sql-ddl"],
      ["prod-sql-basic-003", "sql-null"],
      ["prod-sql-basic-004", "sql-constraints"],
      ["prod-sql-basic-005", "sql-identifiers"],
      ["prod-sql-basic-006", "sql-null"],
      ["prod-sql-basic-007", "sql-constraints"],
      ["prod-sql-basic-008", "sql-identifiers"],
      ["prod-sql-basic-009", "sql-join"],
      ["prod-sql-basic-010", "sql-window-functions"],
      ["prod-ext-sql-basic-011", "sql-tcl"],
      ["prod-ext-sql-basic-012", "sql-date"],
      ["prod-ext-sql-basic-013", "sql-null"],
      ["prod-ext-sql-basic-014", "sql-join"],
      ["prod-ext-sql-basic-015", "sql-group-functions"],
      ["prod-ext-sql-basic-016", "sql-group-functions"],
      ["prod-ext-sql-basic-017", "sql-window-functions"],
      ["prod-ext-sql-basic-018", "sql-set-operators"],
      ["prod-ext-sql-basic-019", "sql-dml"],
      ["prod-ext-sql-basic-020", "sql-select"],
      ["prod-ext-sql-basic-021", "sql-set-operators"],
      ["prod-ext-sql-basic-022", "sql-standard-join"],
      ["prod-ext-sql-basic-023", "sql-ddl-constraints"],
      ["prod-ext-sql-basic-024", "sql-null"],
      ["prod-ext-sql-basic-025", "sql-window-functions"],
      ["prod-ext-sql-basic-026", "sql-group-functions"],
      ["prod-ext-sql-basic-027", "sql-dml"],
      ["prod-ext-sql-basic-028", "sql-top-n"],
      ["prod-ext-sql-basic-029", "sql-standard-join"],
      ["prod-ext-sql-basic-030", "sql-group-having"],
      ["prod-ext-sql-basic-031", "sql-null"],
      ["prod-ext-sql-basic-032", "sql-standard-join"],
      ["prod-ext-sql-basic-033", "sql-hierarchical-self-join"],
      ["prod-ext-sql-basic-034", "sql-subquery"],
      ["prod-ext-sql-basic-035", "sql-pivot-unpivot"],
      ["prod-ext-sql-basic-036", "sql-set-operators"],
      ["prod-ext-sql-basic-037", "sql-window-functions"],
      ["prod-ext-sql-basic-038", "sql-group-functions"],
      ["prod-ext-sql-basic-039", "sql-standard-join"],
      ["prod-ext-sql-basic-040", "sql-dml"]
    ]);
    const conceptText = (conceptId: string) =>
      JSON.stringify(conceptArticles.find((concept) => concept.id === conceptId)?.studyBlocks ?? []);

    expect(conceptText("sql-select")).toContain("FROM");
    expect(conceptText("sql-select")).toContain("WHERE");
    expect(conceptText("sql-select")).toContain("ORDER BY");
    expect(conceptText("sql-group-functions")).toContain("ROLLUP");
    expect(conceptText("sql-group-functions")).toContain("CUBE");
    expect(conceptText("sql-group-functions")).toContain("GROUPING_ID");
    expect(conceptText("sql-group-having")).toContain("HAVING");
    expect(conceptText("sql-group-having")).toContain("COUNT(*)");
    expect(conceptText("sql-hierarchical-self-join")).toContain("CONNECT BY");
    expect(conceptText("sql-hierarchical-self-join")).toContain("PRIOR");
    expect(conceptText("sql-pivot-unpivot")).toContain("PIVOT");
    expect(conceptText("sql-pivot-unpivot")).toContain("UNPIVOT");

    for (const [questionId, conceptId] of expectedLinks) {
      const question = objectiveQuestions.find((item) => item.id === questionId);
      expect(question, questionId).toBeTruthy();
      expect(question?.relatedConceptId).toBe(conceptId);
    }
  });

  it("keeps subject-two questions 1 through 30 connected to concepts that explain the clicked topic", () => {
    const conceptText = (conceptId: string) =>
      JSON.stringify(conceptArticles.find((concept) => concept.id === conceptId)?.studyBlocks ?? []);
    const auditedDestinations = [
      { questionId: "prod-sql-basic-001", conceptId: "sql-dcl", keywords: ["GRANT", "REVOKE"] },
      { questionId: "prod-sql-basic-002", conceptId: "sql-ddl", keywords: ["CREATE", "ALTER", "DROP"] },
      { questionId: "prod-sql-basic-003", conceptId: "sql-null", keywords: ["UNKNOWN", "NOT IN"] },
      { questionId: "prod-sql-basic-004", conceptId: "sql-constraints", keywords: ["PRIMARY KEY", "FOREIGN KEY"] },
      { questionId: "prod-sql-basic-005", conceptId: "sql-identifiers", keywords: ["Oracle", "SELECT"] },
      { questionId: "prod-sql-basic-006", conceptId: "sql-null", keywords: ["COUNT(*)", "COUNT("] },
      { questionId: "prod-sql-basic-007", conceptId: "sql-constraints", keywords: ["CHECK", "FOREIGN KEY"] },
      { questionId: "prod-sql-basic-008", conceptId: "sql-identifiers", keywords: ["Oracle", "EMP"] },
      { questionId: "prod-sql-basic-009", conceptId: "sql-join", keywords: ["INNER JOIN", "OUTER JOIN"] },
      { questionId: "prod-sql-basic-010", conceptId: "sql-window-functions", keywords: ["ROW_NUMBER", "ORDER BY"] },
      { questionId: "prod-ext-sql-basic-011", conceptId: "sql-tcl", keywords: ["COMMIT", "ROLLBACK"] },
      { questionId: "prod-ext-sql-basic-012", conceptId: "sql-date", keywords: ["DATE", "ADD_MONTHS"] },
      { questionId: "prod-ext-sql-basic-013", conceptId: "sql-null", keywords: ["NVL", "NULL"] },
      { questionId: "prod-ext-sql-basic-014", conceptId: "sql-join", keywords: ["JOIN", "BETWEEN"] },
      { questionId: "prod-ext-sql-basic-015", conceptId: "sql-group-functions", keywords: ["ROLLUP", "GROUPING_ID"] },
      { questionId: "prod-ext-sql-basic-016", conceptId: "sql-group-functions", keywords: ["CUBE", "GROUPING SETS"] },
      { questionId: "prod-ext-sql-basic-017", conceptId: "sql-window-functions", keywords: ["RANK", "DENSE_RANK"] },
      { questionId: "prod-ext-sql-basic-018", conceptId: "sql-set-operators", keywords: ["UNION", "UNION ALL"] },
      { questionId: "prod-ext-sql-basic-019", conceptId: "sql-dml", keywords: ["MERGE", "UPDATE"] },
      { questionId: "prod-ext-sql-basic-020", conceptId: "sql-select", keywords: ["FROM", "WHERE"] },
      { questionId: "prod-ext-sql-basic-021", conceptId: "sql-set-operators", keywords: ["INTERSECT", "MINUS"] },
      { questionId: "prod-ext-sql-basic-022", conceptId: "sql-standard-join", keywords: ["OUTER JOIN", "FULL OUTER JOIN"] },
      { questionId: "prod-ext-sql-basic-023", conceptId: "sql-ddl-constraints", keywords: ["CREATE TABLE", "ALTER TABLE"] },
      { questionId: "prod-ext-sql-basic-024", conceptId: "sql-null", keywords: ["OUTER JOIN", "NULL"] },
      { questionId: "prod-ext-sql-basic-025", conceptId: "sql-window-functions", keywords: ["PARTITION BY", "ROW_NUMBER"] },
      { questionId: "prod-ext-sql-basic-026", conceptId: "sql-group-functions", keywords: ["ROLLUP", "CUBE"] },
      { questionId: "prod-ext-sql-basic-027", conceptId: "sql-dml", keywords: ["INSERT", "DELETE"] },
      { questionId: "prod-ext-sql-basic-028", conceptId: "sql-top-n", keywords: ["ROWNUM", "FETCH FIRST"] },
      { questionId: "prod-ext-sql-basic-029", conceptId: "sql-standard-join", keywords: ["OUTER JOIN", "WHERE"] },
      { questionId: "prod-ext-sql-basic-030", conceptId: "sql-group-having", keywords: ["HAVING", "COUNT"] }
    ];

    for (const { questionId, conceptId, keywords } of auditedDestinations) {
      const question = objectiveQuestions.find((item) => item.id === questionId);
      const destinationText = conceptText(conceptId);

      expect(question, questionId).toBeTruthy();
      expect(question?.relatedConceptId, questionId).toBe(conceptId);
      for (const keyword of keywords) {
        expect(destinationText, `${questionId} -> ${conceptId} should explain ${keyword}`).toContain(keyword);
      }
    }
  });

  it("keeps subject-two questions 31 through 60 connected to concepts that explain the clicked topic", () => {
    const conceptText = (conceptId: string) =>
      JSON.stringify(conceptArticles.find((concept) => concept.id === conceptId)?.studyBlocks ?? []);
    const auditedDestinations = [
      { questionId: "prod-ext-sql-basic-031", conceptId: "sql-null", keywords: ["NVL", "NULL"] },
      { questionId: "prod-ext-sql-basic-032", conceptId: "sql-standard-join", keywords: ["COUNT(*)", "OUTER JOIN"] },
      { questionId: "prod-ext-sql-basic-033", conceptId: "sql-hierarchical-self-join", keywords: ["CONNECT BY", "PRIOR"] },
      { questionId: "prod-ext-sql-basic-034", conceptId: "sql-subquery", keywords: ["스칼라", "서브쿼리"] },
      { questionId: "prod-ext-sql-basic-035", conceptId: "sql-pivot-unpivot", keywords: ["PIVOT", "UNPIVOT"] },
      { questionId: "prod-ext-sql-basic-036", conceptId: "sql-set-operators", keywords: ["UNION", "UNION ALL"] },
      { questionId: "prod-ext-sql-basic-037", conceptId: "sql-window-functions", keywords: ["RANK", "DENSE_RANK"] },
      { questionId: "prod-ext-sql-basic-038", conceptId: "sql-group-functions", keywords: ["ROLLUP", "GROUPING"] },
      { questionId: "prod-ext-sql-basic-039", conceptId: "sql-standard-join", keywords: ["OUTER JOIN", "WHERE"] },
      { questionId: "prod-ext-sql-basic-040", conceptId: "sql-dml", keywords: ["MERGE", "UPDATE"] },
      { questionId: "prod-ext-sql-basic-051", conceptId: "sql-date", keywords: ["DATE", "BETWEEN"] },
      { questionId: "prod-ext-sql-basic-052", conceptId: "sql-set-operators", keywords: ["UNION", "UNION ALL"] },
      { questionId: "prod-ext-sql-basic-053", conceptId: "sql-standard-join", keywords: ["FULL OUTER JOIN", "RIGHT"] },
      { questionId: "prod-ext-sql-basic-054", conceptId: "sql-set-operators", keywords: ["UNION ALL", "중복"] },
      { questionId: "prod-ext-sql-basic-055", conceptId: "sql-group-having", keywords: ["HAVING", "WHERE"] },
      { questionId: "prod-ext-sql-basic-056", conceptId: "sql-window-functions", keywords: ["ROWS", "RANGE"] },
      { questionId: "prod-ext-sql-basic-057", conceptId: "sql-window-functions", keywords: ["RANK", "DENSE_RANK"] },
      { questionId: "prod-ext-sql-basic-058", conceptId: "sql-null", keywords: ["NOT IN", "NULL"] },
      { questionId: "prod-ext-sql-basic-059", conceptId: "sql-subquery", keywords: ["스칼라", "서브쿼리"] },
      { questionId: "prod-ext-sql-basic-060", conceptId: "sql-dml", keywords: ["MERGE", "INSERT"] },
      { questionId: "prod-ext-sql-basic-061", conceptId: "sql-group-functions", keywords: ["ROLLUP", "GROUPING"] },
      { questionId: "prod-ext-sql-basic-062", conceptId: "sql-hierarchical-self-join", keywords: ["CONNECT BY", "PRIOR"] },
      { questionId: "prod-ext-sql-basic-063", conceptId: "sql-set-operators", keywords: ["INTERSECT", "MINUS"] },
      { questionId: "prod-ext-sql-basic-064", conceptId: "sql-join", keywords: ["BETWEEN", "비등가"] },
      { questionId: "prod-ext-sql-basic-066", conceptId: "sql-subquery", keywords: ["EXISTS", "NOT EXISTS"] },
      { questionId: "prod-ext-sql-basic-067", conceptId: "sql-top-n", keywords: ["ROWNUM", "ORDER BY"] },
      { questionId: "prod-ext-sql-basic-068", conceptId: "sql-null", keywords: ["COUNT(*)", "COUNT("] },
      { questionId: "prod-ext-sql-basic-069", conceptId: "sql-functions", keywords: ["CASE", "DECODE"] },
      { questionId: "prod-ext-sql-basic-070", conceptId: "sql-join", keywords: ["이력", "최신"] },
      { questionId: "prod-ext-sql-basic-071", conceptId: "sql-window-functions", keywords: ["ROWS", "RANGE"] }
    ];

    for (const { questionId, conceptId, keywords } of auditedDestinations) {
      const question = objectiveQuestions.find((item) => item.id === questionId);
      const destinationText = conceptText(conceptId);

      expect(question, questionId).toBeTruthy();
      expect(question?.relatedConceptId, questionId).toBe(conceptId);
      for (const keyword of keywords) {
        expect(destinationText, `${questionId} -> ${conceptId} should explain ${keyword}`).toContain(keyword);
      }
    }
  });

  it("keeps subject-two questions 61 through 90 connected to concepts that explain the clicked topic", () => {
    const conceptText = (conceptId: string) =>
      JSON.stringify(conceptArticles.find((concept) => concept.id === conceptId)?.studyBlocks ?? []);
    const auditedDestinations = [
      { questionId: "prod-ext-sql-basic-072", conceptId: "sql-group-having", keywords: ["SELECT 목록", "GROUP BY"] },
      { questionId: "prod-ext-sql-basic-073", conceptId: "sql-standard-join", keywords: ["OUTER JOIN", "WHERE"] },
      { questionId: "prod-ext-sql-basic-074", conceptId: "sql-pivot-unpivot", keywords: ["PIVOT", "그룹"] },
      { questionId: "prod-ext-sql-basic-075", conceptId: "sql-subquery", keywords: ["인라인 뷰", "FROM"] },
      { questionId: "prod-ext-sql-basic-076", conceptId: "sql-tcl", keywords: ["COMMIT", "ROLLBACK"] },
      { questionId: "prod-ext-sql-basic-077", conceptId: "sql-constraints", keywords: ["CHECK", "제약조건"] },
      { questionId: "prod-ext-sql-basic-078", conceptId: "sql-null", keywords: ["NVL", "NULL"] },
      { questionId: "prod-ext-sql-basic-079", conceptId: "sql-set-operators", keywords: ["컬럼 개수", "UNION"] },
      { questionId: "prod-ext-sql-basic-080", conceptId: "sql-standard-join", keywords: ["NATURAL JOIN", "USING"] },
      { questionId: "prod-ext-sql-basic-081", conceptId: "sql-window-functions", keywords: ["LAG", "LEAD"] },
      { questionId: "prod-ext-sql-basic-082", conceptId: "sql-null", keywords: ["COUNT(*)", "NULL"] },
      { questionId: "prod-ext-sql-basic-083", conceptId: "sql-null", keywords: ["COUNT(", "NULL"] },
      { questionId: "prod-ext-sql-basic-084", conceptId: "sql-standard-join", keywords: ["OUTER JOIN", "WHERE"] },
      { questionId: "prod-ext-sql-basic-086", conceptId: "sql-functions", keywords: ["LENGTH", "REPLACE"] },
      { questionId: "prod-ext-sql-basic-087", conceptId: "sql-set-operators", keywords: ["UNION", "UNION ALL"] },
      { questionId: "prod-ext-sql-basic-088", conceptId: "sql-window-functions", keywords: ["NTILE", "구간"] },
      { questionId: "prod-ext-sql-basic-089", conceptId: "sql-where", keywords: ["IN", "LIKE"] },
      { questionId: "prod-ext-sql-basic-090", conceptId: "sql-date", keywords: ["DATE", "ADD_MONTHS"] },
      { questionId: "prod-ext-sql-basic-091", conceptId: "sql-date", keywords: ["DATE", "ADD_MONTHS"] },
      { questionId: "prod-ext-sql-basic-092", conceptId: "sql-regexp", keywords: ["REGEXP_INSTR", "REGEXP_REPLACE"] },
      { questionId: "prod-ext-sql-basic-101", conceptId: "sql-set-operators", keywords: ["UNION", "UNION ALL"] },
      { questionId: "prod-ext-sql-basic-102", conceptId: "sql-null", keywords: ["LENGTH", "NULL"] },
      { questionId: "prod-ext-sql-basic-103", conceptId: "sql-standard-join", keywords: ["FULL OUTER JOIN", "RIGHT"] },
      { questionId: "prod-ext-sql-basic-104", conceptId: "sql-date", keywords: ["DATE", "1/24"] },
      { questionId: "prod-ext-sql-basic-105", conceptId: "sql-dcl", keywords: ["GRANT", "REVOKE"] },
      { questionId: "prod-ext-sql-basic-106", conceptId: "sql-null", keywords: ["NOT IN", "NULL"] },
      { questionId: "prod-ext-sql-basic-107", conceptId: "sql-window-functions", keywords: ["FIRST_VALUE", "ORDER BY"] },
      { questionId: "prod-ext-sql-basic-108", conceptId: "sql-window-functions", keywords: ["NTILE", "구간"] },
      { questionId: "prod-ext-sql-basic-109", conceptId: "sql-standard-join", keywords: ["OUTER JOIN", "WHERE"] },
      { questionId: "prod-ext-sql-basic-110", conceptId: "sql-group-functions", keywords: ["GROUPING SETS", "ROLLUP"] }
    ];

    for (const { questionId, conceptId, keywords } of auditedDestinations) {
      const question = objectiveQuestions.find((item) => item.id === questionId);
      const destinationText = conceptText(conceptId);

      expect(question, questionId).toBeTruthy();
      expect(question?.relatedConceptId, questionId).toBe(conceptId);
      for (const keyword of keywords) {
        expect(destinationText, `${questionId} -> ${conceptId} should explain ${keyword}`).toContain(keyword);
      }
    }
  });


  it("keeps subject-two questions 91 through 121 connected to concepts that explain the clicked topic", () => {
    const conceptText = (conceptId: string) =>
      JSON.stringify(conceptArticles.find((concept) => concept.id === conceptId)?.studyBlocks ?? []);
    const auditedDestinations = [
      { questionId: "prod-ext-sql-basic-111", conceptId: "sql-top-n", keywords: ["ROWNUM", "FETCH FIRST"] },
      { questionId: "prod-ext-sql-basic-112", conceptId: "sql-hierarchical-self-join", keywords: ["CONNECT BY", "PRIOR"] },
      { questionId: "prod-ext-sql-basic-113", conceptId: "sql-dml", keywords: ["MERGE", "UPDATE"] },
      { questionId: "prod-ext-sql-basic-114", conceptId: "sql-regexp", keywords: ["REGEXP_REPLACE", "REGEXP_INSTR"] },
      { questionId: "prod-ext-sql-basic-115", conceptId: "sql-standard-join", keywords: ["NATURAL JOIN", "USING"] },
      { questionId: "prod-ext-sql-basic-116", conceptId: "sql-set-operators", keywords: ["MINUS", "INTERSECT"] },
      { questionId: "prod-ext-sql-basic-117", conceptId: "sql-null", keywords: ["COUNT(*)", "COUNT("] },
      { questionId: "prod-ext-sql-basic-118", conceptId: "sql-dcl", keywords: ["GRANT", "ROLE"] },
      { questionId: "prod-ext-sql-basic-119", conceptId: "sql-pivot-unpivot", keywords: ["PIVOT", "UNPIVOT"] },
      { questionId: "prod-ext-sql-basic-120", conceptId: "sql-where", keywords: ["LIKE", "ESCAPE"] },
      { questionId: "prod-ext-sql-basic-201", conceptId: "sql-set-operators", keywords: ["UNION", "UNION ALL"] },
      { questionId: "prod-ext-sql-basic-202", conceptId: "sql-standard-join", keywords: ["FULL OUTER JOIN", "RIGHT"] },
      { questionId: "prod-ext-sql-basic-203", conceptId: "sql-functions", keywords: ["LENGTH", "REPLACE"] },
      { questionId: "prod-ext-sql-basic-204", conceptId: "sql-join", keywords: ["BETWEEN", "JOIN"] },
      { questionId: "prod-ext-sql-basic-205", conceptId: "sql-set-operators", keywords: ["UNION", "UNION ALL"] },
      { questionId: "prod-ext-sql-basic-206", conceptId: "sql-date", keywords: ["DATE", "1/24"] },
      { questionId: "prod-ext-sql-basic-207", conceptId: "sql-join", keywords: ["BETWEEN", "JOIN"] },
      { questionId: "prod-ext-sql-basic-208", conceptId: "sql-window-functions", keywords: ["ROWS", "RANGE"] },
      { questionId: "prod-ext-sql-basic-209", conceptId: "sql-hierarchical-query", keywords: ["START WITH", "CONNECT BY"] },
      { questionId: "prod-ext-sql-basic-210", conceptId: "sql-group-functions", keywords: ["ROLLUP", "GROUPING"] },
      { questionId: "prod-ext-sql-basic-211", conceptId: "sql-dml", keywords: ["MERGE", "UPDATE"] },
      { questionId: "prod-ext-sql-basic-212", conceptId: "sql-null", keywords: ["NOT IN", "NULL"] },
      { questionId: "prod-ext-sql-basic-213", conceptId: "sql-standard-join", keywords: ["OUTER JOIN", "WHERE"] },
      { questionId: "prod-ext-sql-basic-214", conceptId: "sql-window-functions", keywords: ["ROW_NUMBER", "RANK"] },
      { questionId: "prod-ext-sql-basic-215", conceptId: "sql-set-operators", keywords: ["MINUS", "INTERSECT"] },
      { questionId: "prod-ext-sql-basic-216", conceptId: "sql-functions", keywords: ["CASE", "DECODE"] },
      { questionId: "prod-ext-sql-basic-217", conceptId: "sql-group-having", keywords: ["HAVING", "GROUP BY"] },
      { questionId: "prod-ext-sql-basic-218", conceptId: "sql-constraints", keywords: ["ON DELETE", "CASCADE"] },
      { questionId: "prod-ext-sql-basic-219", conceptId: "sql-pivot-unpivot", keywords: ["PIVOT", "UNPIVOT"] },
      { questionId: "prod-ext-sql-basic-220", conceptId: "sql-window-functions", keywords: ["ROWS", "RANGE"] },
      { questionId: "prod-ext-sql-basic-121", conceptId: "sql-group-functions", keywords: ["GROUPING SETS", "CUBE"] }
    ];

    for (const { questionId, conceptId, keywords } of auditedDestinations) {
      const question = objectiveQuestions.find((item) => item.id === questionId);
      const destinationText = conceptText(conceptId);

      expect(question, questionId).toBeTruthy();
      expect(question?.relatedConceptId, questionId).toBe(conceptId);
      for (const keyword of keywords) {
        expect(destinationText, `${questionId} -> ${conceptId} should explain ${keyword}`).toContain(keyword);
      }
    }
  });
  it("normalizes the second SQL-basic concept batch away from broad legacy concept aliases", () => {
    const expectedLinksBySource = new Map([
      ["pdf-v-2-group-having", "sql-group-having"],
      ["pdf-v-2-rollup", "sql-group-functions"],
      ["pdf-s-2-connect-by", "sql-hierarchical-self-join"],
      ["pdf-o-2-customer-history", "sql-join"],
      ["pdf-v-2-group-select", "sql-group-having"],
      ["pdf-v-2-pivot", "sql-pivot-unpivot"],
      ["pdf-v-2-tcl", "sql-tcl"]
    ]);
    const legacyConceptIds = new Set(["sql-group-by", "sql-hierarchical", "sql-pivot", "sql-transaction", "sql-joins"]);

    for (const [parentQuestionId, conceptId] of expectedLinksBySource) {
      const question = objectiveQuestions.find((item) => item.subjectId === "sql-basic" && item.parentQuestionId === parentQuestionId);
      expect(question, parentQuestionId).toBeTruthy();
      expect(question?.relatedConceptId).toBe(conceptId);
    }

    const secondSqlBatch = objectiveQuestions.filter(
      (question) => question.subjectId === "sql-basic" && expectedLinksBySource.has(question.parentQuestionId ?? "")
    );
    expect(secondSqlBatch.length).toBeGreaterThanOrEqual(expectedLinksBySource.size);
    expect(secondSqlBatch.filter((question) => legacyConceptIds.has(question.relatedConceptId ?? ""))).toEqual([]);
  });

  it("links the final SQL-basic concept batch to specific function, date, regexp, and join concepts", () => {
    const expectedLinksBySource = new Map([
      ["sqlp60-q5-outer-join-on-where", "sql-standard-join"],
      ["sql-date-arithmetic", "sql-date"],
      ["sql-service-period-condition", "sql-date"],
      ["sqld-q31-regexp-instr", "sql-regexp"],
      ["sql-string-count-character", "sql-functions"],
      ["sqld-q5-multicolumn-in", "sql-where"]
    ]);
    const functionConceptText = JSON.stringify(conceptArticles.find((concept) => concept.id === "sql-functions")?.studyBlocks ?? []);
    const regexpConceptText = JSON.stringify(conceptArticles.find((concept) => concept.id === "sql-regexp")?.studyBlocks ?? []);
    const dateConceptText = JSON.stringify(conceptArticles.find((concept) => concept.id === "sql-date")?.studyBlocks ?? []);

    expect(functionConceptText).toContain("LENGTH");
    expect(functionConceptText).toContain("REPLACE");
    expect(functionConceptText).toContain("CASE");
    expect(regexpConceptText).toContain("REGEXP_INSTR");
    expect(regexpConceptText).toContain("REGEXP_REPLACE");
    expect(dateConceptText).toContain("ADD_MONTHS");

    for (const [parentQuestionId, conceptId] of expectedLinksBySource) {
      const question = objectiveQuestions.find((item) => item.subjectId === "sql-basic" && item.parentQuestionId === parentQuestionId);
      expect(question, parentQuestionId).toBeTruthy();
      expect(question?.relatedConceptId).toBe(conceptId);
    }
  });

  it("links the first tuning concept batch to the performance concept that explains the question", () => {
    const expectTuningLink = (predicate: (question: ObjectiveQuestion) => boolean, conceptId: string, label: string) => {
      const question = objectiveQuestions.find((item) => item.subjectId === "tuning" && predicate(item));
      expect(question, label).toBeTruthy();
      expect(question?.relatedConceptId).toBe(conceptId);
    };

    expectTuningLink((question) => question.parentQuestionId === "pdf-lab-topn" && /Top-N|STOPKEY/.test(question.topic), "tuning-top-n", "Top-N/STOPKEY");
    expectTuningLink((question) => /파티션/.test(question.middleTopic) && /Partition Pruning/.test(question.topic), "tuning-partition-pruning", "Partition Pruning");
    expectTuningLink((question) => question.parentQuestionId === "pdf-s-3-bind-peeking", "tuning-optimizer", "Bind Peeking");
    expectTuningLink((question) => question.parentQuestionId === "pdf-s-3-hash-build", "tuning-hash-join", "Hash Join Build Input");
    expectTuningLink((question) => question.parentQuestionId === "pdf-s-3-nl-trace", "tuning-nl-join", "NL Join 반복 비용");
    expectTuningLink((question) => question.parentQuestionId === "pdf-v-3-partition-pruning", "tuning-partition-pruning", "Partition Pruning variant");
  });

  it("keeps subject-three questions 1 through 30 connected to concepts that explain the clicked topic", () => {
    const conceptText = (conceptId: string) =>
      JSON.stringify(conceptArticles.find((concept) => concept.id === conceptId)?.studyBlocks ?? []);
    const auditedDestinations = [
      { number: 1, conceptId: "tuning-architecture", keywords: ["Connection", "SGA"] },
      { number: 2, conceptId: "tuning-io", keywords: ["Full Table Scan", "ROWID"] },
      { number: 3, conceptId: "tuning-architecture", keywords: ["SGA", "PGA"] },
      { number: 4, conceptId: "tuning-optimizer", keywords: ["Bind", "Histogram"] },
      { number: 5, conceptId: "tuning-sql-processing", keywords: ["Static SQL", "Dynamic SQL"] },
      { number: 6, conceptId: "tuning-architecture", keywords: ["Connection Pool", "Server Process"] },
      { number: 7, conceptId: "tuning-architecture", keywords: ["Buffer Cache", "Library Cache"] },
      { number: 8, conceptId: "tuning-optimizer", keywords: ["Bind", "Histogram"] },
      { number: 9, conceptId: "tuning-index-scan-efficiency", keywords: ["Access Predicate", "Filter Predicate"] },
      { number: 10, conceptId: "tuning-composite-index", keywords: ["결합 인덱스", "Access Predicate"] },
      { number: 11, conceptId: "tuning-index-scan-efficiency", keywords: ["B-Tree", "Index Range Scan"] },
      { number: 12, conceptId: "tuning-index-scan-efficiency", keywords: ["Access Predicate", "Filter Predicate"] },
      { number: 13, conceptId: "tuning-table-access", keywords: ["ROWID", "클러스터링"] },
      { number: 14, conceptId: "tuning-nl-join", keywords: ["Nested Loops", "Semi Join"] },
      { number: 15, conceptId: "tuning-hash-join", keywords: ["해시 조인", "Build Input"] },
      { number: 16, conceptId: "tuning-sql-trace", keywords: ["SQL Trace", "TKPROF"] },
      { number: 17, conceptId: "tuning-query-transformation", keywords: ["Subquery Unnesting", "세미 조인"] },
      { number: 18, conceptId: "tuning-query-transformation", keywords: ["Predicate Pushing", "View"] },
      { number: 19, conceptId: "tuning-top-n", keywords: ["Top-N", "STOPKEY"] },
      { number: 20, conceptId: "tuning-partition-pruning", keywords: ["Partition Pruning", "Partition"] },
      { number: 21, conceptId: "tuning-index-scan-efficiency", keywords: ["Access Predicate", "Filter Predicate"] },
      { number: 22, conceptId: "tuning-nl-join", keywords: ["Nested Loops", "후행"] },
      { number: 23, conceptId: "tuning-composite-index", keywords: ["결합 인덱스", "선두"] },
      { number: 24, conceptId: "tuning-table-access", keywords: ["ROWID", "클러스터링"] },
      { number: 25, conceptId: "tuning-hash-join", keywords: ["Build Input", "Probe Input"] },
      { number: 26, conceptId: "tuning-partition-pruning", keywords: ["Partition Pruning", "Partition"] },
      { number: 27, conceptId: "tuning-query-transformation", keywords: ["OR Expansion", "UNION ALL"] },
      { number: 28, conceptId: "tuning-optimizer", keywords: ["Bind Peeking", "선택도"] },
      { number: 29, conceptId: "tuning-sort", keywords: ["One-pass", "Multi-pass"] },
      { number: 30, conceptId: "tuning-lock", keywords: ["TM", "Lock"] }
    ];

    for (const { number, conceptId, keywords } of auditedDestinations) {
      const question = objectiveQuestions.find((item) => item.subjectId === "tuning" && item.number === number);
      const destinationText = conceptText(conceptId);

      expect(question, `tuning question ${number}`).toBeTruthy();
      expect(question?.relatedConceptId, `tuning question ${number}`).toBe(conceptId);
      for (const keyword of keywords) {
        expect(destinationText, `tuning question ${number} -> ${conceptId} should explain ${keyword}`).toContain(keyword);
      }
    }
  });

  it("keeps subject-three questions 31 through 60 connected to concepts that explain the clicked topic", () => {
    const conceptText = (conceptId: string) =>
      JSON.stringify(conceptArticles.find((concept) => concept.id === conceptId)?.studyBlocks ?? []);
    const auditedDestinations = [
      { number: 31, conceptId: "tuning-index-scan-efficiency", keywords: ["Index Skip Scan", "NDV"] },
      { number: 32, conceptId: "tuning-index-scan-efficiency", keywords: ["Index Fast Full Scan", "Index Full Scan"] },
      { number: 33, conceptId: "tuning-table-access", keywords: ["ROWID", "클러스터링"] },
      { number: 34, conceptId: "tuning-query-transformation", keywords: ["View Merging", "NO_MERGE"] },
      { number: 35, conceptId: "tuning-scalar-subquery", keywords: ["Scalar Subquery", "Caching"] },
      { number: 36, conceptId: "tuning-composite-index", keywords: ["결합 인덱스", "선두"] },
      { number: 37, conceptId: "tuning-table-access", keywords: ["ROWID", "클러스터링"] },
      { number: 38, conceptId: "tuning-hash-join", keywords: ["Build Input", "Probe Input"] },
      { number: 39, conceptId: "tuning-query-transformation", keywords: ["Predicate Pushing", "View"] },
      { number: 40, conceptId: "tuning-sql-sharing", keywords: ["Adaptive Cursor Sharing", "Bind"] },
      { number: 41, conceptId: "tuning-sql-trace", keywords: ["SQL Trace", "TKPROF"] },
      { number: 42, conceptId: "tuning-partitioning", keywords: ["Local index", "Prefixed"] },
      { number: 43, conceptId: "tuning-partitioning", keywords: ["Global index", "Local index"] },
      { number: 44, conceptId: "tuning-index-scan-efficiency", keywords: ["SARGable", "LIKE"] },
      { number: 45, conceptId: "tuning-table-access", keywords: ["ROWID", "클러스터링"] },
      { number: 46, conceptId: "tuning-index-scan-efficiency", keywords: ["Access Predicate", "Filter Predicate"] },
      { number: 47, conceptId: "tuning-nl-join", keywords: ["Nested Loops", "후행"] },
      { number: 48, conceptId: "tuning-hash-join", keywords: ["Build Input", "Probe"] },
      { number: 49, conceptId: "tuning-sort", keywords: ["ORDER BY", "인덱스"] },
      { number: 50, conceptId: "tuning-query-transformation", keywords: ["OR Expansion", "UNION ALL"] },
      { number: 51, conceptId: "tuning-query-transformation", keywords: ["View Merging", "NO_MERGE"] },
      { number: 52, conceptId: "tuning-query-transformation", keywords: ["Subquery Unnesting", "UNNEST"] },
      { number: 53, conceptId: "tuning-partition-pruning", keywords: ["Partition Pruning", "SARGable"] },
      { number: 54, conceptId: "tuning-parallel", keywords: ["Parallel", "APPEND"] },
      { number: 55, conceptId: "tuning-sql-trace", keywords: ["Application Cursor Caching", "Execute Count"] },
      { number: 56, conceptId: "tuning-cardinality", keywords: ["카디널리티", "Histogram"] },
      { number: 57, conceptId: "tuning-optimizer", keywords: ["Bind Peeking", "Histogram"] },
      { number: 58, conceptId: "tuning-lock", keywords: ["Lock", "Blocking"] },
      { number: 59, conceptId: "tuning-index-scan-efficiency", keywords: ["Index Fast Full Scan", "Index Full Scan"] },
      { number: 60, conceptId: "tuning-top-n", keywords: ["STOPKEY", "Top-N"] }
    ];

    for (const { number, conceptId, keywords } of auditedDestinations) {
      const question = objectiveQuestions.find((item) => item.subjectId === "tuning" && item.number === number);
      const destinationText = conceptText(conceptId);

      expect(question, `tuning question ${number}`).toBeTruthy();
      expect(question?.relatedConceptId, `tuning question ${number}`).toBe(conceptId);
      for (const keyword of keywords) {
        expect(destinationText, `tuning question ${number} -> ${conceptId} should explain ${keyword}`).toContain(keyword);
      }
    }
  });

  it("links the second tuning concept batch to rewrite and partition concepts precisely", () => {
    const rewriteQuestion = objectiveQuestions.find(
      (question) => question.subjectId === "tuning" && /최신 이력|고객변경이력/.test([question.topic, question.stem].join(" "))
    );
    const localPrefixedQuestion = objectiveQuestions.find(
      (question) => question.subjectId === "tuning" && question.parentQuestionId === "sql-cert-q78-local-prefixed"
    );
    const partitionExchangeQuestion = objectiveQuestions.find(
      (question) => question.subjectId === "tuning" && question.parentQuestionId === "practice-partition-exchange"
    );
    const rewriteConceptText = JSON.stringify(conceptArticles.find((concept) => concept.id === "tuning-sql-rewrite")?.studyBlocks ?? []);
    const partitionConceptText = JSON.stringify(conceptArticles.find((concept) => concept.id === "tuning-partitioning")?.studyBlocks ?? []);

    expect(rewriteQuestion).toBeTruthy();
    expect(rewriteQuestion?.relatedConceptId).toBe("tuning-sql-rewrite");
    expect(rewriteConceptText).toContain("최신 이력");
    expect(rewriteConceptText).toContain("결과를 보존");

    expect(localPrefixedQuestion).toBeTruthy();
    expect(localPrefixedQuestion?.relatedConceptId).toBe("tuning-partitioning");
    expect(partitionExchangeQuestion).toBeTruthy();
    expect(partitionExchangeQuestion?.relatedConceptId).toBe("tuning-partitioning");
    expect(partitionConceptText).toContain("Local index");
    expect(partitionConceptText).toContain("Global index");
  });

  it("links imported tuning expansion questions to architecture, trace, sort, and top-n concepts", () => {
    const expectedLinks = [
      {
        label: "buffer cache latch",
        conceptId: "tuning-architecture",
        question: objectiveQuestions.find(
          (item) =>
            item.subjectId === "tuning" &&
            item.sourceDocument === "sqlp_advanced_exam.pdf" &&
            item.sourceQuestionNumber === 1 &&
            /Latch|Buffer|버퍼 캐시/.test([item.middleTopic, item.topic, item.stem].join(" "))
        )
      },
      {
        label: "TKPROF NLJ batching",
        conceptId: "tuning-sql-trace",
        question: objectiveQuestions.find(
          (item) =>
            item.subjectId === "tuning" && item.sourceDocument === "sqlmate_sqlp_advanced_exam.pdf" && /TKPROF/.test([item.middleTopic, item.topic].join(" "))
        )
      },
      {
        label: "sort operation removal",
        conceptId: "tuning-sort",
        question: objectiveQuestions.find(
          (item) => item.subjectId === "tuning" && /Sort Operation|Sort 제거/.test([item.middleTopic, item.topic].join(" "))
        )
      },
      {
        label: "top-n stopkey",
        conceptId: "tuning-top-n",
        question: objectiveQuestions.find((item) => item.subjectId === "tuning" && item.parentQuestionId === "sqlmate-advanced-20q-08")
      }
    ];

    for (const { label, conceptId, question } of expectedLinks) {
      expect(question, label).toBeTruthy();
      expect(question?.relatedConceptId, label).toBe(conceptId);
      expect(conceptArticles.find((concept) => concept.id === conceptId), conceptId).toBeTruthy();
    }
  });

  it("links imported tuning index questions to composite-index and scan-efficiency concepts", () => {
    const compositeColumnOrderQuestion = objectiveQuestions.find(
      (item) => item.subjectId === "tuning" && /결합 인덱스 컬럼 순서/.test([item.middleTopic, item.topic].join(" "))
    );
    const compositePredicateQuestion = objectiveQuestions.find(
      (item) => item.subjectId === "tuning" && item.parentQuestionId === "sqlmate-advanced-20q-11"
    );
    const fullFastScanQuestion = objectiveQuestions.find(
      (item) => item.subjectId === "tuning" && item.parentQuestionId === "sqlmate-advanced-20q-13"
    );
    const skipScanQuestion = objectiveQuestions.find(
      (item) => item.subjectId === "tuning" && item.sourceDocument === "sqlmate_sqlp_advanced_exam.pdf" && /IN-List Iterator/.test(item.topic)
    );

    expect(compositeColumnOrderQuestion).toBeTruthy();
    expect(compositeColumnOrderQuestion?.relatedConceptId).toBe("tuning-composite-index");
    expect(compositePredicateQuestion).toBeTruthy();
    expect(compositePredicateQuestion?.relatedConceptId).toBe("tuning-composite-index");
    expect(fullFastScanQuestion).toBeTruthy();
    expect(fullFastScanQuestion?.relatedConceptId).toBe("tuning-index-scan-efficiency");
    expect(skipScanQuestion).toBeTruthy();
    expect(skipScanQuestion?.relatedConceptId).toBe("tuning-index-scan-efficiency");
  });

  it("keeps imported tuning join, concurrency, optimizer, and transformation links specific", () => {
    const expectedLinksBySource = new Map([
      ["sqlmate-advanced-20q-03", "tuning-hash-join"],
      ["sqlmate-advanced-20q-07", "tuning-query-transformation"],
      ["sqlmate-advanced-20q-09", "tuning-concurrency"],
      ["sqlmate-advanced-20q-12", "tuning-nl-join"],
      ["sqlmate-advanced-20q-14", "tuning-cardinality"],
      ["sqlmate-advanced-20q-15", "tuning-scalar-subquery"],
      ["sqlmate-advanced-20q-19", "tuning-partitioning"],
      ["sqlmate-advanced-20q-20", "tuning-sql-sharing"]
    ]);

    for (const [parentQuestionId, conceptId] of expectedLinksBySource) {
      const question = objectiveQuestions.find((item) => item.subjectId === "tuning" && item.parentQuestionId === parentQuestionId);
      expect(question, parentQuestionId).toBeTruthy();
      expect(question?.relatedConceptId, parentQuestionId).toBe(conceptId);
    }

    const pushSubqQuestion = objectiveQuestions.find((item) => item.subjectId === "tuning" && /PUSH_SUBQ/.test(item.topic));
    expect(pushSubqQuestion).toBeTruthy();
    expect(pushSubqQuestion?.relatedConceptId).toBe("tuning-query-transformation");
  });

  it("links row-number and ranking SQL questions to the window function concept", () => {
    const windowConcept = conceptArticles.find((concept) => concept.id === "sql-window-functions");
    const windowConceptText = JSON.stringify(windowConcept?.studyBlocks ?? []);
    const windowQuestions = objectiveQuestions.filter((question) => {
      const linkText = [
        question.middleTopic,
        question.topic,
        question.stem,
        question.passage,
        question.code,
        question.parentQuestionId,
        ...question.choices.map((choice) => choice.text)
      ]
        .filter(Boolean)
        .join(" ");

      return (
        question.subjectId === "sql-basic" &&
        /(ROW_NUMBER|DENSE_RANK|RANK|NTILE|LAG|LEAD|OVER\s*\(|PARTITION\s+BY|ROWS\s+BETWEEN|RANGE\s+BETWEEN|Window|window)/i.test(
          linkText
        )
      );
    });

    expect(windowConcept).toBeTruthy();
    expect(windowConceptText).toContain("ROW_NUMBER");
    expect(windowConceptText).toContain("RANK");
    expect(windowConceptText).toContain("DENSE_RANK");
    expect(windowConceptText).toContain("PARTITION BY");
    expect(windowConceptText).toContain("ORDER BY");
    expect(windowQuestions.length).toBeGreaterThanOrEqual(5);

    for (const question of windowQuestions) {
      expect(
        question.relatedConceptId,
        `${question.subjectId} ${question.number} ${question.middleTopic} ${question.topic} ${question.parentQuestionId ?? ""}`
      ).toBe("sql-window-functions");
    }
  });

  it("does not point published questions to missing concept articles", () => {
    const conceptIds = new Set(conceptArticles.map((concept) => concept.id));
    const missingLinks = objectiveQuestions
      .filter((question) => question.relatedConceptId && !conceptIds.has(question.relatedConceptId))
      .map((question) => `${question.subjectName} ${question.number} -> ${question.relatedConceptId}`);

    expect(missingLinks).toEqual([]);
  });

  it("opens useful concept destinations for representative problem-screen related concept buttons", () => {
    const conceptText = (conceptId: string) => JSON.stringify(conceptArticles.find((concept) => concept.id === conceptId)?.studyBlocks ?? []);
    const representativeDestinations = [
      {
        questionId: "prod-sql-basic-003",
        conceptId: "sql-null",
        keywords: ["UNKNOWN", "NOT IN", "COUNT(*)"]
      },
      {
        questionId: "prod-sql-basic-007",
        conceptId: "sql-constraints",
        keywords: ["PRIMARY KEY", "FOREIGN KEY", "CHECK"]
      },
      {
        questionId: "prod-sql-basic-008",
        conceptId: "sql-identifiers",
        keywords: ["일반 식별자", "인용 식별자"]
      },
      {
        questionId: "prod-ext-sql-basic-011",
        conceptId: "sql-tcl",
        keywords: ["COMMIT", "ROLLBACK", "SAVEPOINT"]
      },
      {
        questionId: "prod-ext-sql-basic-019",
        conceptId: "sql-dml",
        keywords: ["INSERT", "UPDATE", "MERGE"]
      },
      {
        questionId: "prod-sql-basic-010",
        conceptId: "sql-window-functions",
        keywords: ["ROW_NUMBER", "RANK", "ORDER BY"]
      }
    ];

    for (const { questionId, conceptId, keywords } of representativeDestinations) {
      const question = objectiveQuestions.find((item) => item.id === questionId);
      const destinationText = conceptText(conceptId);

      expect(question, questionId).toBeTruthy();
      expect(question?.relatedConceptId, questionId).toBe(conceptId);
      for (const keyword of keywords) {
        expect(destinationText, `${questionId} -> ${conceptId} should explain ${keyword}`).toContain(keyword);
      }
    }
  });

  it("prevents exact duplicates and semantic-template duplicates in the current published bank", () => {
    const signatures = objectiveQuestions.map(questionSignature);
    expect(new Set(signatures).size).toBe(signatures.length);
    expect(findLikelyDuplicateQuestions()).toEqual([]);
  });

  it("publishes exam materials for SQL, table, plan, and trace style questions", () => {
    const withMaterial = objectiveQuestions.filter((question) => question.passage || question.code || question.table || question.tables?.length);
    const withCode = objectiveQuestions.filter((question) => question.code);

    expect(withMaterial.length).toBeGreaterThanOrEqual(4);
    expect(withCode.length).toBeGreaterThanOrEqual(2);
    expect(new Set(objectiveQuestions.map((question) => question.questionType)).size).toBeGreaterThanOrEqual(3);
  });

  it("keeps multi-table objective materials separated for join-count questions", () => {
    const duplicateKeyQuestion = objectiveQuestions.find((item) => item.subjectId === "sql-basic" && item.number === 22);
    const basicQuestion = objectiveQuestions.find((item) => item.subjectId === "sql-basic" && item.number === 43);

    expect(duplicateKeyQuestion).toBeTruthy();
    expect(duplicateKeyQuestion?.table).toBeUndefined();
    expect(duplicateKeyQuestion?.tables?.map((table) => table.title)).toEqual(["EMP 테이블", "DEPT 테이블"]);
    expect(duplicateKeyQuestion?.tables?.[0]?.rows).toHaveLength(4);
    expect(duplicateKeyQuestion?.tables?.[1]?.rows).toHaveLength(3);
    expect(duplicateKeyQuestion?.answer).toBe("B");

    expect(basicQuestion).toBeTruthy();
    expect(basicQuestion?.table).toBeUndefined();
    expect(basicQuestion?.tables?.map((table) => table.title)).toEqual(["EMP 테이블", "DEPT 테이블"]);
    expect(basicQuestion?.choices.map((choice) => choice.text)).toEqual([
      "LEFT 3건, FULL 5건, RIGHT 4건",
      "LEFT 3건, FULL 4건, RIGHT 5건",
      "LEFT 4건, FULL 5건, RIGHT 4건",
      "LEFT 3건, FULL 5건, RIGHT 3건"
    ]);
    expect(basicQuestion?.answer).toBe("A");
  });

  it("publishes the verified SQL Practice starter cases", () => {
    expect(labQuestions).toHaveLength(34);
    expect(new Set(labQuestions.map((lab) => lab.topic)).size).toBeGreaterThanOrEqual(32);
  });

  it("shows both source and target tables for the running-total practice case", () => {
    const lab = labQuestions.find((item) => item.number === 6);

    expect(lab?.sampleData?.map((table) => table.title)).toEqual(["월별지점매출", "목표 결과"]);
    expect(lab?.sampleData?.[0]?.headers).toEqual(["지점", "판매월", "매출"]);
    expect(lab?.sampleData?.[1]?.headers).toEqual(["지점", "판매월", "매출", "누적매출"]);
  });

  it("does not create template objective expansion batches", () => {
    for (const subject of subjects) {
      const batch = createLocalExtraQuestions(subject.id, 0, 20);
      expect(batch).toHaveLength(0);
      expect(() => createLocalExtraQuestion(subject.id, 0)).toThrow(/No verified PDF expansion question/);
    }
  });

  it("does not create template SQL Practice expansion batches", () => {
    const batch = createLocalExtraLabQuestions(0, 5);

    expect(batch).toHaveLength(0);
    expect(() => createLocalExtraLabQuestion(0)).toThrow(/No verified PDF expansion lab/);
  });
});
