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

  it("links constraint-focused SQL questions to the detailed constraint concept", () => {
    const constraintConcept = conceptArticles.find((concept) => concept.id === "sql-constraints");
    const constraintConceptText = JSON.stringify(constraintConcept?.studyBlocks ?? []);
    const constraintFocusedQuestions = objectiveQuestions.filter((question) => {
      const linkText = [question.middleTopic, question.topic, question.stem, question.code, question.parentQuestionId].filter(Boolean).join(" ");
      return (
        question.subjectId === "sql-basic" &&
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
