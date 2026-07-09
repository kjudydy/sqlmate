export type SubjectId = "modeling" | "sql-basic" | "tuning";

export type Difficulty = "기본" | "중간" | "실전";

export type ChoiceId = "A" | "B" | "C" | "D";

export type Choice = {
  id: ChoiceId;
  text: string;
};

export type ObjectiveQuestion = {
  id: string;
  number: number;
  subjectId: SubjectId;
  subjectName: string;
  topic: string;
  difficulty: Difficulty;
  stem: string;
  passage?: string;
  code?: string;
  table?: {
    headers: string[];
    rows: string[][];
  };
  choices: Choice[];
  answer: ChoiceId;
  hint: string;
  explanation: string;
  whyWrong: Record<ChoiceId, string>;
};

export type LabQuestion = {
  id: string;
  number: number;
  title: string;
  difficulty: Difficulty;
  topic: string;
  scenario: string;
  schemaSql: string;
  seedSql: string;
  prompt: string;
  expectedSql: string;
  targetPlan: string[];
  oracleNotes: string[];
  hints: string[];
  rubric: string[];
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
};

export type WrongNote = {
  questionId: string;
  memo: string;
  updatedAt: string;
};

export type ConceptMark = {
  conceptId: string;
  highlighted: boolean;
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
  conceptMarks: Record<string, ConceptMark>;
  personalNotes: PersonalNote[];
  extraQuestions: ObjectiveQuestion[];
};
