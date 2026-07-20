export type SqlpSubjectId = "subject-1" | "subject-2" | "subject-3";

export type DifficultyLevel = "basic" | "intermediate" | "advanced" | "expert";

export type QuestionType =
  | "single_choice"
  | "multi_select"
  | "combination"
  | "true_false_combo"
  | "fill_blank"
  | "ordering"
  | "result_inference"
  | "plan_interpretation"
  | "trace_analysis"
  | "index_design"
  | "sql_rewrite"
  | "hint_writing"
  | "join_strategy"
  | "lock_scenario"
  | "modeling_judgment"
  | "short_answer"
  | "essay";

export type ContentStatus = "draft" | "generated" | "validating" | "review_required" | "approved" | "rejected" | "archived";

export type SourceType = "official_scope" | "user_pdf_adapted" | "public_reference_adapted" | "original" | "ai_assisted";

export type ContentSource = {
  type: SourceType;
  label: string;
  locator?: string;
};

export type HintStep = {
  level: 1 | 2 | 3;
  title: string;
  body: string;
};

export type PlanOperation = {
  id: number;
  parentId?: number;
  operation: string;
  objectName?: string;
  starts: number;
  rows: number;
  cost?: number;
  cardinality?: number;
  cr?: number;
  pr?: number;
  timeMs?: number;
  accessPredicate?: string;
  filterPredicate?: string;
};

export type TraceSummary = {
  parseCount: number;
  executeCount: number;
  fetchCount: number;
  rows: number;
  queryGets: number;
  currentGets: number;
  diskReads: number;
  elapsedMs: number;
  cpuMs: number;
  waitMs?: number;
};

export type TableSpec = {
  name: string;
  ddl: string;
  rows?: number;
  distribution?: string[];
  indexes?: string[];
  statistics?: string[];
};

export type Choice = {
  id: string;
  text: string;
};

export type AnswerSpec = {
  kind: "choice" | "choices" | "text" | "texts" | "ordered" | "sql" | "rubric";
  value: string | string[];
  accepted?: string[];
};

export type SqlpQuestion = {
  id: string;
  subjectId: SqlpSubjectId;
  subjectName: string;
  majorTopic: string;
  minorTopic: string;
  detailTopic: string;
  difficulty: DifficultyLevel;
  type: QuestionType;
  prompt: string;
  passage?: string;
  table?: {
    headers: string[];
    rows: string[][];
  };
  sql?: string;
  tables?: TableSpec[];
  plan?: PlanOperation[];
  trace?: TraceSummary;
  choices?: Choice[];
  answer: AnswerSpec;
  explanation: string;
  wrongAnswerNotes: string[];
  relatedConceptIds: string[];
  hints: HintStep[];
  expectedMinutes: number;
  source: ContentSource;
  status: ContentStatus;
  version: string;
};

export type ConceptSection = {
  title: string;
  body?: string[];
  bullets?: string[];
  table?: {
    headers: string[];
    rows: string[][];
  };
  code?: string;
};

export type ConceptDocument = {
  id: string;
  subjectId: SqlpSubjectId;
  subjectName: string;
  majorTopic: string;
  minorTopic: string;
  detailTopic: string;
  title: string;
  summary: string;
  sections: ConceptSection[];
  relatedQuestionIds: string[];
  keywords: string[];
  source: ContentSource;
  status: ContentStatus;
  version: string;
};

export type PracticeScenario = {
  id: string;
  title: string;
  area: string;
  difficulty: DifficultyLevel;
  scenario: string;
  requirement: string;
  tables: TableSpec[];
  currentSql: string;
  currentPlan: PlanOperation[];
  currentTrace: TraceSummary;
  targetPlan: PlanOperation[];
  predicateInfo: string[];
  expectedResult: string;
  performanceGoal: string;
  constraints: string[];
  hints: HintStep[];
  modelSql: string;
  acceptableSqlPatterns: string[];
  gradingRubric: string[];
  explanation: string;
  relatedConceptIds: string[];
  source: ContentSource;
  status: ContentStatus;
  version: string;
};
