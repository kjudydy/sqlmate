export type SubjectId = "modeling" | "sql-basic" | "tuning";

export type Difficulty = "기본" | "중간" | "중급" | "상급" | "실전" | "최상급";

export type ChoiceId = "A" | "B" | "C" | "D";

export type SourceType = "owner_pdf" | "owner_pdf_variant" | "owner_pdf_similar";

export type GenerationMode = "original" | "shuffled" | "transformed" | "generated_similar";

export type ValidationStatus = "validated" | "review_required";

export type ContentSourceMetadata = {
  sourceDocument?: string;
  sourceVersion?: string;
  sourcePage?: number;
  sourceQuestionNumber?: number;
  sourceType?: SourceType;
  generationMode?: GenerationMode;
  parentQuestionId?: string;
  variantGroupId?: string;
  contentHash?: string;
  semanticFingerprint?: string;
  batchId?: string;
  reviewStatus?: "approved" | "review_required";
  validationStatus?: ValidationStatus;
  estimatedTime?: number;
  tags?: string[];
};

export type Choice = {
  id: ChoiceId;
  text: string;
};

export type ObjectiveQuestion = ContentSourceMetadata & {
  id: string;
  number: number;
  subjectId: SubjectId;
  subjectName: string;
  majorTopic?: string;
  middleTopic?: string;
  topic: string;
  difficulty: Difficulty;
  questionType?: string;
  stem: string;
  passage?: string;
  code?: string;
  table?: {
    headers: string[];
    rows: string[][];
  };
  choices: Choice[];
  answer: ChoiceId;
  relatedConceptId?: string;
  hint: string;
  explanation: string;
  whyWrong: Record<ChoiceId, string>;
  reviewStatus?: "approved" | "review_required";
  duplicationCheck?: string;
};

export type LabTraceSummaryRow = {
  metric: string;
  value: string;
  meaning: string;
};

export type LabPlanExplanation = {
  operation: string;
  korean: string;
  note: string;
};

export type LabQuestion = ContentSourceMetadata & {
  id: string;
  number: number;
  title: string;
  difficulty: Difficulty;
  topic: string;
  scenario: string;
  schemaSql: string;
  seedSql: string;
  traceStats?: string;
  predicateInfo?: string;
  prompt: string;
  expectedSql: string;
  targetPlan: string[];
  targetPlanExplanations?: LabPlanExplanation[];
  oracleNotes: string[];
  hints: string[];
  rubric: string[];
  traceSummary?: LabTraceSummaryRow[];
  simulationNotice?: string;
  relatedConceptIds?: string[];
};

export type ConceptStudyBlock =
  | {
      type: "section";
      title: string;
      paragraphs: string[];
    }
  | {
      type: "table";
      title: string;
      headers: string[];
      rows: string[][];
    }
  | {
      type: "flow";
      title: string;
      steps: string[];
    }
  | {
      type: "checklist";
      title: string;
      items: string[];
    };

export type ConceptArticle = {
  id: string;
  subjectId: SubjectId;
  subjectName: string;
  majorTopic: string;
  detailTopic: string;
  category: string;
  title: string;
  summary: string;
  studyBlocks?: ConceptStudyBlock[];
  keyPoints: string[];
  examTrap: string;
  oracleAngle?: string;
};

export type AnswerRecord = {
  questionId: string;
  selectedChoiceId: ChoiceId;
  correct: boolean;
  answeredAt: string;
  hintUsed: boolean;
  questionContentHash?: string;
  questionSourceVersion?: string;
};

export type LabAnswerRecord = {
  labId: string;
  score: number;
  passed: boolean;
  answeredAt: string;
};

export type AttemptRecord = {
  id: string;
  questionId: string;
  subjectId: SubjectId;
  topic: string;
  selectedChoiceId: ChoiceId;
  correct: boolean;
  answeredAt: string;
  stem: string;
  questionContentHash?: string;
  questionSourceVersion?: string;
};

export type WrongNote = {
  questionId: string;
  memo: string;
  updatedAt: string;
  selectedChoiceId?: ChoiceId;
  selectedChoiceIds?: ChoiceId[];
  correctChoiceId?: ChoiceId;
  questionSnapshot?: ObjectiveQuestion;
  wrongCount?: number;
  firstWrongAt?: string;
  lastWrongAt?: string;
};

export type ConceptMark = {
  conceptId: string;
  highlighted: boolean;
  highlights?: Array<{
    id: string;
    text: string;
    color: "yellow" | "green" | "pink";
    fieldKey?: string;
    occurrenceIndex?: number;
  }>;
  memo: string;
  updatedAt: string;
};

export type PersonalNote = {
  id: string;
  title: string;
  body: string;
  tags: string;
  updatedAt: string;
};

export type TodoItem = {
  id: string;
  text: string;
  checked: boolean;
  createdAt: string;
};

export type StudyStatePayload = {
  answers: Record<string, AnswerRecord>;
  labAnswers: Record<string, LabAnswerRecord>;
  todoChecks: Record<string, boolean>;
  todoItems: Record<string, TodoItem[]>;
  attempts: AttemptRecord[];
  wrongNotes: Record<string, WrongNote>;
  dismissedWrongNotes: Record<string, string>;
  conceptMarks: Record<string, ConceptMark>;
  personalNotes: PersonalNote[];
  extraQuestions: ObjectiveQuestion[];
  extraLabQuestions?: LabQuestion[];
};
