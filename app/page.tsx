"use client";

import {
  BarChart3,
  BookOpen,
  Brain,
  CalendarDays,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Highlighter,
  Lightbulb,
  LogIn,
  LogOut,
  NotebookPen,
  Play,
  Plus,
  RotateCcw,
  Trash2,
  ShieldCheck,
  Sparkles,
  XCircle
} from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import { containsUnsafeSql, gradeSqlSubmission, isChoiceCorrect } from "@/lib/grading";
import { conceptArticles, createLocalExtraLabQuestions, createLocalExtraQuestions, labQuestions, objectiveQuestions, officialSourceVersion, subjects } from "@/lib/problem-bank";
import { filterCurrentAnswers, filterCurrentAttempts } from "@/lib/study-versioning";
import { getSupabaseBrowserClient, isSupabaseConfigured } from "@/lib/supabase-client";
import type { FormEvent, ReactNode } from "react";
import type {
  AnswerRecord,
  AttemptRecord,
  ChoiceId,
  ConceptMark,
  LabQuestion,
  ObjectiveQuestion,
  PersonalNote,
  StudyStatePayload,
  SubjectId,
  TodoItem,
  WrongNote
} from "@/lib/types";

type Section = "dashboard" | "practice" | "lab" | "wrong" | "concepts" | "notes";

const verifiedExpansionReady = false;

type PendingHighlight = {
  text: string;
  fieldKey: string;
  occurrenceIndex: number;
};

const emptyState: StudyStatePayload = {
  answers: {},
  labAnswers: {},
  todoChecks: {},
  todoItems: {},
  attempts: [],
  wrongNotes: {},
  dismissedWrongNotes: {},
  conceptMarks: {},
  personalNotes: [],
  extraQuestions: [],
  extraLabQuestions: []
};

const sqlpExamSchedule = [
  {
    round: "제54회",
    examDate: "2026-03-07",
    applyPeriod: "2026.02.02 ~ 02.06",
    ticketDate: "2026.02.20"
  },
  {
    round: "제55회",
    examDate: "2026-08-22",
    applyPeriod: "2026.07.20 ~ 07.24",
    ticketDate: "2026.08.07"
  }
];

function nowIso() {
  return new Date().toISOString();
}

function formatDateTime(value: string) {
  return new Intl.DateTimeFormat("ko-KR", {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit"
  }).format(new Date(value));
}

function formatFullDate(date: Date) {
  return new Intl.DateTimeFormat("ko-KR", {
    year: "numeric",
    month: "long",
    day: "numeric",
    weekday: "long"
  }).format(date);
}

function formatChoiceIds(choiceIds: ChoiceId[]) {
  return choiceIds.length ? choiceIds.join(", ") : "이전 선택 답 정보 없음";
}

function getChoiceStatusText(choiceId: ChoiceId, selectedIds: ChoiceId[], correctId: ChoiceId) {
  const selected = selectedIds.includes(choiceId);
  const correct = choiceId === correctId;

  if (selected && correct) return "내가 선택한 정답";
  if (selected) return "내가 선택한 답 · 오답";
  if (correct) return "선택하지 않은 정답";
  return "오답";
}

function getMaterialLabel(code: string) {
  if (/Rows|Loop|Starts|CR|PR|Predicate|Operation|PLAN|Trace|TKPROF/i.test(code)) {
    return "SQL / 실행계획 / Trace";
  }

  return "SQL";
}

function toDateKey(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function daysBetween(from: Date, to: Date) {
  const start = new Date(from.getFullYear(), from.getMonth(), from.getDate()).getTime();
  const end = new Date(to.getFullYear(), to.getMonth(), to.getDate()).getTime();
  return Math.ceil((end - start) / 86400000);
}

function usePersistentState<T>(key: string, initialValue: T) {
  const [value, setValue] = useState<T>(initialValue);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    try {
      const saved = window.localStorage.getItem(key);
      if (saved) {
        setValue(JSON.parse(saved) as T);
      }
    } catch {
      setValue(initialValue);
    }
    setHydrated(true);
  }, [initialValue, key]);

  useEffect(() => {
    if (!hydrated) return;
    window.localStorage.setItem(key, JSON.stringify(value));
  }, [hydrated, key, value]);

  return [value, setValue] as const;
}

function scoreLabel(percent: number) {
  if (percent >= 80) return "합격권";
  if (percent >= 60) return "보강권";
  return "집중권";
}

function clampIndex(index: number, length: number) {
  if (length === 0) return 0;
  return Math.max(0, Math.min(index, length - 1));
}

function getNextExtraStartCount(questions: ObjectiveQuestion[], subjectId: SubjectId) {
  return questions
    .filter((question) => question.subjectId === subjectId)
    .reduce((max, question) => Math.max(max, Math.max(0, question.number - 100)), 0);
}

function findNthOccurrence(text: string, needle: string, occurrenceIndex: number) {
  if (!needle) return -1;

  let fromIndex = 0;
  let foundIndex = -1;

  for (let index = 0; index <= occurrenceIndex; index += 1) {
    foundIndex = text.indexOf(needle, fromIndex);
    if (foundIndex === -1) return -1;
    fromIndex = foundIndex + needle.length;
  }

  return foundIndex;
}

function countOccurrencesBefore(text: string, needle: string) {
  if (!needle) return 0;

  let count = 0;
  let fromIndex = 0;

  while (true) {
    const foundIndex = text.indexOf(needle, fromIndex);
    if (foundIndex === -1) return count;
    count += 1;
    fromIndex = foundIndex + needle.length;
  }
}

function buildStudyCalendar(today: Date, attempts: AttemptRecord[], labAnswers: StudyStatePayload["labAnswers"]) {
  const year = today.getFullYear();
  const month = today.getMonth();
  const first = new Date(year, month, 1);
  const last = new Date(year, month + 1, 0);
  const offset = first.getDay();
  const totalCells = Math.ceil((offset + last.getDate()) / 7) * 7;
  const counts = new Map<string, number>();

  attempts.forEach((attempt) => {
    const key = toDateKey(new Date(attempt.answeredAt));
    counts.set(key, (counts.get(key) ?? 0) + 1);
  });

  Object.values(labAnswers).forEach((answer) => {
    const key = toDateKey(new Date(answer.answeredAt));
    counts.set(key, (counts.get(key) ?? 0) + 3);
  });

  return Array.from({ length: totalCells }, (_, index) => {
    const dayNumber = index - offset + 1;
    if (dayNumber < 1 || dayNumber > last.getDate()) {
      return { key: `blank-${index}`, day: "", count: 0, isToday: false };
    }

    const date = new Date(year, month, dayNumber);
    const key = toDateKey(date);
    return {
      key,
      day: String(dayNumber),
      count: counts.get(key) ?? 0,
      isToday: key === toDateKey(today)
    };
  });
}

export default function Home() {
  const [section, setSection] = useState<Section>("dashboard");
  const [activeSubject, setActiveSubject] = useState<SubjectId>("modeling");
  const [questionIndex, setQuestionIndex] = useState(0);
  const [selectedChoice, setSelectedChoice] = useState<ChoiceId | null>(null);
  const [hintVisible, setHintVisible] = useState(false);
  const [answers, setAnswers] = usePersistentState<Record<string, AnswerRecord>>("sqlmate.answers", emptyState.answers);
  const [labAnswers, setLabAnswers] = usePersistentState<StudyStatePayload["labAnswers"]>("sqlmate.labAnswers", emptyState.labAnswers);
  const [todoChecks, setTodoChecks] = usePersistentState<StudyStatePayload["todoChecks"]>("sqlmate.todoChecks", emptyState.todoChecks);
  const [todoItems, setTodoItems] = usePersistentState<StudyStatePayload["todoItems"]>("sqlmate.todoItems", emptyState.todoItems);
  const [newTodoText, setNewTodoText] = useState("");
  const [attempts, setAttempts] = usePersistentState<AttemptRecord[]>("sqlmate.attempts", emptyState.attempts);
  const [wrongNotes, setWrongNotes] = usePersistentState<Record<string, WrongNote>>("sqlmate.wrongNotes", emptyState.wrongNotes);
  const [dismissedWrongNotes, setDismissedWrongNotes] = usePersistentState<Record<string, string>>("sqlmate.dismissedWrongNotes", emptyState.dismissedWrongNotes);
  const [conceptMarks, setConceptMarks] = usePersistentState<Record<string, ConceptMark>>("sqlmate.conceptMarks", emptyState.conceptMarks);
  const [personalNotes, setPersonalNotes] = usePersistentState<PersonalNote[]>("sqlmate.personalNotes", emptyState.personalNotes);
  const [extraQuestions, setExtraQuestions] = usePersistentState<ObjectiveQuestion[]>("sqlmate.extraQuestions", emptyState.extraQuestions);
  const [extraLabQuestions, setExtraLabQuestions] = usePersistentState<LabQuestion[]>("sqlmate.extraLabQuestions", emptyState.extraLabQuestions ?? []);
  const [selectedConceptId, setSelectedConceptId] = useState(conceptArticles[0]?.id ?? "");
  const [selectedPersonalNoteId, setSelectedPersonalNoteId] = useState("");
  const [conceptNavCollapsed, setConceptNavCollapsed] = useState(false);
  const [noteListCollapsed, setNoteListCollapsed] = useState(false);
  const [selectedHighlightText, setSelectedHighlightText] = useState("");
  const [selectedHighlightTarget, setSelectedHighlightTarget] = useState<PendingHighlight | null>(null);
  const [highlightColor, setHighlightColor] = useState<"yellow" | "green" | "pink">("yellow");
  const [activeConceptSubject, setActiveConceptSubject] = useState<SubjectId>("modeling");
  const [activeConceptMajor, setActiveConceptMajor] = useState(
    conceptArticles.find((concept) => concept.subjectId === "modeling")?.majorTopic ?? ""
  );
  const [activeLabIndex, setActiveLabIndex] = useState(0);
  const [labSql, setLabSql] = useState("");
  const [labResult, setLabResult] = useState<ReturnType<typeof gradeSqlSubmission> | null>(null);
  const [remotePlan, setRemotePlan] = useState<{ mode: string; plan: string[]; message: string } | null>(null);
  const [cloudUser, setCloudUser] = useState<{ id: string; email?: string } | null>(null);
  const [cloudReady, setCloudReady] = useState(false);
  const [authChecked, setAuthChecked] = useState(false);
  const [cloudStatus, setCloudStatus] = useState("데모 저장");
  const [isGenerating, setIsGenerating] = useState(false);
  const [wrongNoteSaveStatus, setWrongNoteSaveStatus] = useState<Record<string, "idle" | "saving" | "saved" | "failed">>({});
  const [pendingWrongDeleteId, setPendingWrongDeleteId] = useState<string | null>(null);
  const wrongMemoTimers = useRef<Record<string, number>>({});

  const supabase = useMemo(() => getSupabaseBrowserClient(), []);
  const activeExtraQuestions = useMemo(
    () => extraQuestions.filter((question) => question.sourceVersion === officialSourceVersion && Boolean(question.contentHash)),
    [extraQuestions]
  );
  const activeExtraLabQuestions = useMemo(
    () => extraLabQuestions.filter((question) => question.sourceVersion === officialSourceVersion && Boolean(question.contentHash)),
    [extraLabQuestions]
  );
  const allQuestions = useMemo(() => [...objectiveQuestions, ...activeExtraQuestions], [activeExtraQuestions]);
  const allLabQuestions = useMemo(() => [...labQuestions, ...activeExtraLabQuestions], [activeExtraLabQuestions]);
  const currentAnswers = useMemo(() => filterCurrentAnswers(answers, allQuestions), [answers, allQuestions]);
  const currentAttempts = useMemo(() => filterCurrentAttempts(attempts, allQuestions), [attempts, allQuestions]);
  const baseSubjectQuestions = useMemo(
    () => objectiveQuestions.filter((question) => question.subjectId === activeSubject),
    [activeSubject]
  );
  const subjectExtraQuestions = useMemo(
    () => activeExtraQuestions.filter((question) => question.subjectId === activeSubject),
    [activeSubject, activeExtraQuestions]
  );
  const subjectQuestions = useMemo(
    () => [...baseSubjectQuestions, ...subjectExtraQuestions].map((question, index) => ({ ...question, number: index + 1 })),
    [baseSubjectQuestions, subjectExtraQuestions]
  );
  const currentQuestion = subjectQuestions[clampIndex(questionIndex, subjectQuestions.length)];
  const currentAnswer = currentQuestion ? currentAnswers[currentQuestion.id] : undefined;
  const conceptSubjectTabs = useMemo(
    () =>
      [
        { id: "modeling" as SubjectId, label: "1과목", title: "데이터 모델링" },
        { id: "sql-basic" as SubjectId, label: "2과목", title: "SQL 기본/활용" },
        { id: "tuning" as SubjectId, label: "3과목", title: "튜닝" }
      ].map((subject) => ({
        ...subject,
        count: conceptArticles.filter((concept) => concept.subjectId === subject.id).length
      })),
    []
  );
  const conceptSubjectArticles = useMemo(
    () => conceptArticles.filter((concept) => concept.subjectId === activeConceptSubject),
    [activeConceptSubject]
  );
  const conceptMajorTopics = useMemo(
    () => Array.from(new Set(conceptSubjectArticles.map((concept) => concept.majorTopic))),
    [conceptSubjectArticles]
  );
  const resolvedConceptMajor = conceptMajorTopics.includes(activeConceptMajor) ? activeConceptMajor : (conceptMajorTopics[0] ?? "");
  const visibleConceptArticles = useMemo(
    () => conceptSubjectArticles.filter((concept) => concept.majorTopic === resolvedConceptMajor),
    [conceptSubjectArticles, resolvedConceptMajor]
  );
  const selectedConcept = visibleConceptArticles.find((concept) => concept.id === selectedConceptId) ?? visibleConceptArticles[0];
  const selectedPersonalNote = personalNotes.find((note) => note.id === selectedPersonalNoteId) ?? personalNotes[0];
  const activeLab = allLabQuestions[clampIndex(activeLabIndex, allLabQuestions.length)];
  const selectedConceptHighlights = selectedConcept ? (conceptMarks[selectedConcept.id]?.highlights ?? []) : [];

  const completed = Object.keys(currentAnswers).length;
  const correct = Object.values(currentAnswers).filter((answer) => answer.correct).length;
  const accuracy = completed ? Math.round((correct / completed) * 100) : 0;
  const wrongCount = currentAttempts.filter((attempt) => !attempt.correct).length;
  const highlightedCount = Object.values(conceptMarks).reduce((sum, mark) => sum + (mark.highlights?.length ?? (mark.highlighted ? 1 : 0)), 0);
  const today = new Date();
  const todayKey = toDateKey(today);
  const nextExam = sqlpExamSchedule.find((exam) => daysBetween(today, new Date(`${exam.examDate}T00:00:00`)) >= 0) ?? sqlpExamSchedule[sqlpExamSchedule.length - 1];
  const examDday = Math.max(0, daysBetween(today, new Date(`${nextExam.examDate}T00:00:00`)));
  const todaysTodos = todoItems[todayKey] ?? [];
  const completedTodos = todaysTodos.filter((todo) => todo.checked).length;
  const labCompleted = allLabQuestions.filter((lab) => labAnswers[lab.id]).length;
  const labProgressPercent = allLabQuestions.length ? Math.round((labCompleted / allLabQuestions.length) * 100) : 0;
  const labPassed = Object.values(labAnswers).filter((answer) => answer.passed).length;
  const monthlyStudyDays = useMemo(() => buildStudyCalendar(today, currentAttempts, labAnswers), [currentAttempts, labAnswers, todayKey]);
  const subjectAnsweredCount = subjectQuestions.filter((question) => currentAnswers[question.id]).length;
  const canGenerateExtraBatch = subjectQuestions.length > 0 && subjectAnsweredCount === subjectQuestions.length;
  const canGenerateExtraLabBatch = allLabQuestions.length > 0 && labCompleted === allLabQuestions.length;
  const nextExtraBatchStart = subjectQuestions.length + 1;
  const nextExtraBatchEnd = subjectQuestions.length + 20;

  const studyState = useMemo<StudyStatePayload>(
    () => ({
      answers,
      labAnswers,
      todoChecks,
      todoItems,
      attempts,
      wrongNotes,
      dismissedWrongNotes,
      conceptMarks,
      personalNotes,
      extraQuestions,
      extraLabQuestions
    }),
    [answers, labAnswers, todoChecks, todoItems, attempts, wrongNotes, dismissedWrongNotes, conceptMarks, personalNotes, extraQuestions, extraLabQuestions]
  );

  useEffect(() => {
    setQuestionIndex(0);
    setHintVisible(false);
    setSelectedChoice(null);
  }, [activeSubject]);

  useEffect(() => {
    setSelectedChoice(currentAnswer?.selectedChoiceId ?? null);
    setHintVisible(false);
  }, [currentQuestion?.id, currentAnswer?.selectedChoiceId]);

  useEffect(() => {
    if (!supabase) {
      setCloudStatus("로컬 데모 저장");
      setAuthChecked(true);
      return;
    }

    const authClient = supabase;
    let ignore = false;

    async function bootstrapAuth() {
      try {
        const params = new URLSearchParams(window.location.search);
        if (params.has("code")) {
          await authClient.auth.exchangeCodeForSession(window.location.href);
          window.history.replaceState({}, document.title, window.location.pathname);
        }

        const { data } = await authClient.auth.getSession();
        if (ignore) return;

        const user = data.session?.user;
        setCloudUser(user ? { id: user.id, email: user.email ?? undefined } : null);
      } finally {
        if (!ignore) setAuthChecked(true);
      }
    }

    bootstrapAuth();

    const { data: listener } = authClient.auth.onAuthStateChange((_event, session) => {
      const user = session?.user;
      setCloudUser(user ? { id: user.id, email: user.email ?? undefined } : null);
      setAuthChecked(true);
    });

    return () => {
      ignore = true;
      listener.subscription.unsubscribe();
    };
  }, [supabase]);

  useEffect(() => {
    if (!supabase || !cloudUser) {
      setCloudReady(false);
      return;
    }

    let ignore = false;
    setCloudStatus("클라우드 불러오는 중");

    supabase
      .from("study_state")
      .select("state")
      .eq("user_id", cloudUser.id)
      .maybeSingle()
      .then(({ data, error }) => {
        if (ignore) return;
        if (!error && data?.state) {
          const state = data.state as StudyStatePayload;
          setAnswers(state.answers ?? {});
          setLabAnswers(state.labAnswers ?? {});
          setTodoChecks(state.todoChecks ?? {});
          setTodoItems(state.todoItems ?? {});
          setAttempts(state.attempts ?? []);
          setWrongNotes(state.wrongNotes ?? {});
          setDismissedWrongNotes(state.dismissedWrongNotes ?? {});
          setConceptMarks(state.conceptMarks ?? {});
          setPersonalNotes(state.personalNotes ?? []);
          setExtraQuestions(state.extraQuestions ?? []);
          setExtraLabQuestions(state.extraLabQuestions ?? []);
        }
        setCloudReady(true);
        setCloudStatus(error ? "클라우드 스키마 확인 필요" : "클라우드 동기화");
      });

    return () => {
      ignore = true;
    };
  }, [cloudUser, setAnswers, setAttempts, setConceptMarks, setDismissedWrongNotes, setExtraLabQuestions, setExtraQuestions, setLabAnswers, setPersonalNotes, setTodoChecks, setTodoItems, setWrongNotes, supabase]);

  useEffect(() => {
    if (!supabase || !cloudUser || !cloudReady) return;

    const timer = window.setTimeout(() => {
      supabase
        .from("study_state")
        .upsert({
          user_id: cloudUser.id,
          state: studyState,
          updated_at: nowIso()
        })
        .then(({ error }) => setCloudStatus(error ? "클라우드 저장 실패" : "클라우드 동기화"));
    }, 900);

    return () => window.clearTimeout(timer);
  }, [cloudReady, cloudUser, studyState, supabase]);

  useEffect(() => {
    return () => {
      Object.values(wrongMemoTimers.current).forEach((timer) => window.clearTimeout(timer));
    };
  }, []);

  async function signInWithGoogle() {
    if (!supabase) {
      setCloudStatus("Supabase 환경변수 필요");
      return;
    }

    await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: window.location.origin
      }
    });
  }

  async function signOut() {
    await supabase?.auth.signOut();
    setCloudUser(null);
    setCloudReady(false);
    setCloudStatus("로컬 데모 저장");
  }

  function submitAnswer() {
    if (!currentQuestion || !selectedChoice) return;

    const answerIsCorrect = isChoiceCorrect(currentQuestion, selectedChoice);
    const answeredAt = nowIso();

    setAnswers((prev) => ({
      ...prev,
      [currentQuestion.id]: {
        questionId: currentQuestion.id,
        selectedChoiceId: selectedChoice,
        correct: answerIsCorrect,
        answeredAt,
        hintUsed: hintVisible,
        questionContentHash: currentQuestion.contentHash,
        questionSourceVersion: currentQuestion.sourceVersion
      }
    }));

    setAttempts((prev) => [
      {
        id: `${currentQuestion.id}-${Date.now()}`,
        questionId: currentQuestion.id,
        subjectId: currentQuestion.subjectId,
        topic: currentQuestion.topic,
        selectedChoiceId: selectedChoice,
        correct: answerIsCorrect,
        answeredAt,
        stem: currentQuestion.stem,
        questionContentHash: currentQuestion.contentHash,
        questionSourceVersion: currentQuestion.sourceVersion
      },
      ...prev
    ]);

    if (!answerIsCorrect) {
      setDismissedWrongNotes((prev) => {
        if (!prev[currentQuestion.id]) return prev;
        const next = { ...prev };
        delete next[currentQuestion.id];
        return next;
      });

      setWrongNotes((prev) => {
        const previous = prev[currentQuestion.id];

        return {
          ...prev,
          [currentQuestion.id]: {
            questionId: currentQuestion.id,
            memo: previous?.memo ?? "",
            updatedAt: answeredAt,
            selectedChoiceId: selectedChoice,
            correctChoiceId: currentQuestion.answer,
            questionSnapshot: currentQuestion,
            wrongCount: (previous?.wrongCount ?? 0) + 1,
            firstWrongAt: previous?.firstWrongAt ?? answeredAt,
            lastWrongAt: answeredAt
          }
        };
      });
    }
  }

  function addExtraQuestionBatch() {
    setIsGenerating(true);
    const firstNewQuestionIndex = subjectQuestions.length;
    try {
      setExtraQuestions((prev) => {
        const nextStartCount = getNextExtraStartCount(activeExtraQuestions, activeSubject);
        const batch = createLocalExtraQuestions(activeSubject, nextStartCount, 20);
        return [...prev, ...batch];
      });
      setQuestionIndex(firstNewQuestionIndex);
    } finally {
      setIsGenerating(false);
    }
  }

  function addExtraLabBatch() {
    setIsGenerating(true);
    const firstNewLabIndex = allLabQuestions.length;
    try {
      setExtraLabQuestions((prev) => [...prev, ...createLocalExtraLabQuestions(activeExtraLabQuestions.length, 20)]);
      setActiveLabIndex(firstNewLabIndex);
      setLabSql("");
      setLabResult(null);
      setRemotePlan(null);
    } finally {
      setIsGenerating(false);
    }
  }

  async function runLab() {
    if (!activeLab) return;
    const localResult = gradeSqlSubmission(activeLab, labSql);
    setLabResult(localResult);
    setLabAnswers((prev) => ({
      ...prev,
      [activeLab.id]: {
        labId: activeLab.id,
        score: localResult.score,
        passed: localResult.passed,
        answeredAt: nowIso()
      }
    }));
    setRemotePlan(null);

    try {
      const response = await fetch("/api/sql", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sql: labSql, labId: activeLab.id })
      });
      setRemotePlan((await response.json()) as { mode: string; plan: string[]; message: string });
    } catch {
      setRemotePlan({
        mode: "local",
        plan: localResult.plan,
        message: "로컬 시뮬레이션 실행계획을 표시합니다."
      });
    }
  }

  function updateConceptMark(conceptId: string, patch: Partial<ConceptMark>) {
    setConceptMarks((prev) => ({
      ...prev,
      [conceptId]: {
        ...(prev[conceptId] ?? {
          conceptId,
          highlighted: false,
          memo: "",
          updatedAt: nowIso()
        }),
        ...patch,
        updatedAt: nowIso()
      }
    }));
  }

  function renderHighlightedText(text: string, fieldKey: string): ReactNode {
    const ranges = selectedConceptHighlights
      .filter((highlight) => highlight.fieldKey === fieldKey && highlight.text.trim().length > 0)
      .map((highlight) => {
        const start = findNthOccurrence(text, highlight.text, highlight.occurrenceIndex ?? 0);
        return start >= 0 ? { highlight, start, end: start + highlight.text.length } : null;
      })
      .filter((range): range is NonNullable<typeof range> => Boolean(range))
      .sort((a, b) => a.start - b.start || b.end - a.end);

    if (!ranges.length) return text;

    const parts: ReactNode[] = [];
    let cursor = 0;

    ranges.forEach(({ highlight, start, end }) => {
      if (start < cursor) return;
      if (start > cursor) parts.push(text.slice(cursor, start));
      parts.push(
        <mark
          className={`concept-mark mark-${highlight.color}`}
          key={highlight.id}
          role="button"
          tabIndex={0}
          title="클릭하면 이 형광펜만 삭제됩니다."
          onClick={(event) => {
            event.stopPropagation();
            removeConceptHighlight(highlight.id);
          }}
          onKeyDown={(event) => {
            if (event.key !== "Enter" && event.key !== " ") return;
            event.preventDefault();
            removeConceptHighlight(highlight.id);
          }}
        >
          {text.slice(start, end)}
        </mark>
      );
      cursor = end;
    });

    if (cursor < text.length) parts.push(text.slice(cursor));
    return parts;
  }

  function captureConceptSelection() {
    const selection = window.getSelection();
    const text = selection?.toString().trim() ?? "";
    if (!selection || text.length < 2 || selection.rangeCount === 0) {
      setSelectedHighlightText("");
      setSelectedHighlightTarget(null);
      return;
    }

    const range = selection.getRangeAt(0);
    const startElement = range.startContainer.nodeType === Node.TEXT_NODE ? range.startContainer.parentElement : (range.startContainer as Element);
    const fieldElement = startElement?.closest<HTMLElement>("[data-highlight-field]");
    const fieldKey = fieldElement?.dataset.highlightField;

    if (!fieldElement || !fieldKey) {
      setSelectedHighlightText("");
      setSelectedHighlightTarget(null);
      return;
    }

    const beforeRange = range.cloneRange();
    beforeRange.selectNodeContents(fieldElement);
    beforeRange.setEnd(range.startContainer, range.startOffset);
    const occurrenceIndex = countOccurrencesBefore(beforeRange.toString(), text);

    setSelectedHighlightText(text.slice(0, 160));
    setSelectedHighlightTarget({ text: text.slice(0, 160), fieldKey, occurrenceIndex });
  }

  function addConceptHighlight() {
    if (!selectedConcept || !selectedHighlightTarget) return;

    const nextHighlight = {
      id: `mark-${Date.now()}`,
      text: selectedHighlightTarget.text,
      color: highlightColor,
      fieldKey: selectedHighlightTarget.fieldKey,
      occurrenceIndex: selectedHighlightTarget.occurrenceIndex
    };
    const previousHighlights = conceptMarks[selectedConcept.id]?.highlights ?? [];

    updateConceptMark(selectedConcept.id, {
      highlighted: false,
      highlights: [
        ...previousHighlights.filter(
          (item) =>
            !(
              item.text === nextHighlight.text &&
              item.fieldKey === nextHighlight.fieldKey &&
              (item.occurrenceIndex ?? 0) === nextHighlight.occurrenceIndex
            )
        ),
        nextHighlight
      ]
    });
    setSelectedHighlightText("");
    setSelectedHighlightTarget(null);
    window.getSelection()?.removeAllRanges();
  }

  function removeConceptHighlight(highlightId: string) {
    if (!selectedConcept) return;
    updateConceptMark(selectedConcept.id, {
      highlighted: false,
      highlights: selectedConceptHighlights.filter((highlight) => highlight.id !== highlightId)
    });
    setSelectedHighlightText("");
    setSelectedHighlightTarget(null);
  }

  function clearConceptHighlights() {
    if (!selectedConcept) return;
    updateConceptMark(selectedConcept.id, {
      highlighted: false,
      highlights: []
    });
    setSelectedHighlightText("");
    setSelectedHighlightTarget(null);
    window.getSelection()?.removeAllRanges();
  }

  function selectConceptSubject(subjectId: SubjectId) {
    const firstConcept = conceptArticles.find((concept) => concept.subjectId === subjectId);
    setActiveConceptSubject(subjectId);
    setActiveConceptMajor(firstConcept?.majorTopic ?? "");
    setSelectedConceptId(firstConcept?.id ?? "");
    setConceptNavCollapsed(false);
  }

  function selectConceptMajor(majorTopic: string) {
    const firstConcept = conceptArticles.find(
      (concept) => concept.subjectId === activeConceptSubject && concept.majorTopic === majorTopic
    );
    setActiveConceptMajor(majorTopic);
    setSelectedConceptId(firstConcept?.id ?? "");
    setConceptNavCollapsed(false);
  }

  function openRelatedConcept(conceptId: string) {
    const concept = conceptArticles.find((article) => article.id === conceptId);
    if (!concept) return;

    setSection("concepts");
    setActiveConceptSubject(concept.subjectId);
    setActiveConceptMajor(concept.majorTopic);
    setSelectedConceptId(concept.id);
    setConceptNavCollapsed(true);
  }

  function addPersonalNote() {
    const id = `note-${Date.now()}`;
    const note: PersonalNote = {
      id,
      title: "새 개인 노트",
      body: "헷갈리는 개념, 쿼리 패턴, 실행계획 해석을 정리하세요.",
      tags: "SQLP",
      updatedAt: nowIso()
    };
    setPersonalNotes((prev) => [note, ...prev]);
    setSelectedPersonalNoteId(id);
    setNoteListCollapsed(true);
  }

  function updatePersonalNote(noteId: string, patch: Partial<PersonalNote>) {
    setPersonalNotes((prev) =>
      prev.map((note) => (note.id === noteId ? { ...note, ...patch, updatedAt: nowIso() } : note))
    );
  }

  function deletePersonalNote(noteId: string) {
    setPersonalNotes((prev) => prev.filter((note) => note.id !== noteId));
    setSelectedPersonalNoteId((current) => (current === noteId ? "" : current));
  }

  function addTodo(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const text = newTodoText.trim();
    if (!text) return;
    const todo: TodoItem = {
      id: crypto.randomUUID(),
      text,
      checked: false,
      createdAt: nowIso()
    };
    setTodoItems((prev) => ({
      ...prev,
      [todayKey]: [...(prev[todayKey] ?? []), todo]
    }));
    setNewTodoText("");
  }

  function toggleTodo(todoId: string) {
    setTodoItems((prev) => ({
      ...prev,
      [todayKey]: (prev[todayKey] ?? []).map((todo) => (todo.id === todoId ? { ...todo, checked: !todo.checked } : todo))
    }));
  }

  function deleteTodo(todoId: string) {
    setTodoItems((prev) => ({
      ...prev,
      [todayKey]: (prev[todayKey] ?? []).filter((todo) => todo.id !== todoId)
    }));
  }

  const latestWrongAttemptsByQuestion = useMemo(() => {
    const latest = new Map<string, AttemptRecord>();

    for (const attempt of attempts) {
      if (!attempt.correct && !latest.has(attempt.questionId)) {
        latest.set(attempt.questionId, attempt);
      }
    }

    return latest;
  }, [attempts]);
  const wrongQuestionIds = useMemo(() => {
    const ids = new Set([...Object.keys(wrongNotes), ...Array.from(latestWrongAttemptsByQuestion.keys())]);

    return Array.from(ids)
      .filter((questionId) => !dismissedWrongNotes[questionId])
      .sort((left, right) => {
        const leftTime = wrongNotes[left]?.lastWrongAt ?? latestWrongAttemptsByQuestion.get(left)?.answeredAt ?? wrongNotes[left]?.updatedAt ?? "";
        const rightTime = wrongNotes[right]?.lastWrongAt ?? latestWrongAttemptsByQuestion.get(right)?.answeredAt ?? wrongNotes[right]?.updatedAt ?? "";
        return rightTime.localeCompare(leftTime);
      });
  }, [dismissedWrongNotes, latestWrongAttemptsByQuestion, wrongNotes]);

  function getWrongQuestion(questionId: string) {
    return wrongNotes[questionId]?.questionSnapshot ?? allQuestions.find((item) => item.id === questionId);
  }

  function getWrongSelectedChoiceIds(note: WrongNote | undefined, attempt: AttemptRecord | undefined) {
    if (note?.selectedChoiceIds?.length) return note.selectedChoiceIds;
    if (note?.selectedChoiceId) return [note.selectedChoiceId];
    if (attempt?.selectedChoiceId) return [attempt.selectedChoiceId];
    return [];
  }

  function updateWrongMemo(questionId: string, memo: string, question?: ObjectiveQuestion) {
    const updatedAt = nowIso();
    setWrongNoteSaveStatus((prev) => ({ ...prev, [questionId]: "saving" }));
    setWrongNotes((prev) => ({
      ...prev,
      [questionId]: {
        ...(prev[questionId] ?? { questionId, wrongCount: 0 }),
        questionId,
        memo,
        updatedAt,
        questionSnapshot: prev[questionId]?.questionSnapshot ?? question
      }
    }));

    if (wrongMemoTimers.current[questionId]) {
      window.clearTimeout(wrongMemoTimers.current[questionId]);
    }

    wrongMemoTimers.current[questionId] = window.setTimeout(() => {
      setWrongNoteSaveStatus((prev) => ({ ...prev, [questionId]: "saved" }));
    }, 800);
  }

  function confirmDeleteWrongNote() {
    if (!pendingWrongDeleteId) return;
    const questionId = pendingWrongDeleteId;
    const deletedAt = nowIso();

    setWrongNotes((prev) => {
      const next = { ...prev };
      delete next[questionId];
      return next;
    });
    setDismissedWrongNotes((prev) => ({
      ...prev,
      [questionId]: deletedAt
    }));
    setWrongNoteSaveStatus((prev) => {
      const next = { ...prev };
      delete next[questionId];
      return next;
    });
    setPendingWrongDeleteId(null);
    setCloudStatus("오답노트 삭제 저장 중");
  }

  function retryWrongQuestion(question: ObjectiveQuestion) {
    setSection("practice");
    setActiveSubject(question.subjectId);
    const nextQuestions = allQuestions.filter((item) => item.subjectId === question.subjectId);
    const nextIndex = Math.max(0, nextQuestions.findIndex((item) => item.id === question.id));
    setQuestionIndex(nextIndex);
    setSelectedChoice(null);
    setHintVisible(false);
    setAnswers((prev) => {
      if (!prev[question.id]) return prev;
      const next = { ...prev };
      delete next[question.id];
      return next;
    });
  }

  const navItems = [
    { id: "dashboard" as Section, label: "대시보드", icon: BarChart3 },
    { id: "practice" as Section, label: "문제풀이", icon: Brain },
    { id: "wrong" as Section, label: "오답노트", icon: RotateCcw },
    { id: "concepts" as Section, label: "개념정리", icon: BookOpen },
    { id: "notes" as Section, label: "개인노트", icon: NotebookPen }
  ];

  if (isSupabaseConfigured() && !authChecked) {
    return (
      <main className="login-gate">
        <section className="auth-card">
          <p className="eyebrow">SQLMate</p>
          <h1>SQLMate</h1>
          <p>학습 기록을 불러오는 중입니다.</p>
        </section>
      </main>
    );
  }

  if (isSupabaseConfigured() && authChecked && !cloudUser) {
    return (
      <main className="login-gate">
        <section className="auth-card">
          <p className="eyebrow">Study planner</p>
          <h1>SQLMate</h1>
          <p>Google 계정으로 로그인하면 문제풀이, 오답노트, 개념 메모, 개인 노트가 본인 계정에 저장됩니다.</p>
          <button className="primary-button" onClick={signInWithGoogle}>
            <LogIn size={18} />
            Google로 시작하기
          </button>
        </section>
      </main>
    );
  }

  return (
    <main className="app-shell">
      <aside className="sidebar">
        <div className="brand">
          <div>
            <strong>SQLMate</strong>
            <span>나만의 학습 기록</span>
          </div>
        </div>

        <nav className="nav-list" aria-label="SQLMate sections">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = section === item.id || (item.id === "practice" && section === "lab");
            return (
              <button key={item.id} className={isActive ? "nav-item active" : "nav-item"} onClick={() => setSection(item.id)}>
                <Icon size={18} />
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>

        <div className="sidebar-footer">
          <ShieldCheck size={18} />
          <div>
            <strong>{cloudStatus}</strong>
            <span>{cloudUser?.email ?? (isSupabaseConfigured() ? "로그인 대기" : "무료 데모 모드")}</span>
          </div>
        </div>
      </aside>

      <section className="workspace">
        <header className="topbar">
          <div>
            <p className="eyebrow">My study room</p>
            <h1>{sectionTitle(section)}</h1>
          </div>
          <div className="top-actions">
            <span className="pill">{scoreLabel(accuracy)} · 정답률 {accuracy}%</span>
            {cloudUser ? (
              <>
                <span className="pill">{cloudUser.email ?? "로그인됨"}</span>
                <button className="ghost-button" onClick={signOut}>
                  <LogOut size={17} />
                  로그아웃
                </button>
              </>
            ) : (
              <button className="primary-button" onClick={signInWithGoogle}>
                <LogIn size={17} />
                Google 로그인
              </button>
            )}
          </div>
        </header>

        {section === "dashboard" && (
          <div className="dashboard-v2">
            <section className="exam-hero">
              <div>
                <p className="eyebrow">Next exam</p>
                <h2>D-{examDday}</h2>
                <p>{nextExam.round} · {nextExam.examDate}</p>
                <span>{formatFullDate(today)} · 접수 {nextExam.applyPeriod}</span>
              </div>
              <div className="exam-hero-actions">
                <button className="primary-button" onClick={() => setSection("practice")}>
                  <Brain size={17} />
                  문제 풀기
                </button>
              </div>
            </section>

            <section className="progress-panel">
              <div className="panel-heading">
                <div>
                  <p className="eyebrow">Progress</p>
                  <h2>과목별 진행률</h2>
                </div>
                <span className="pill">{completed} / {objectiveQuestions.length + activeExtraQuestions.length}</span>
              </div>
              <div className="dashboard-progress-list">
                {subjects.map((subject) => {
                  const subjectTotal = allQuestions.filter((question) => question.subjectId === subject.id).length;
                  const subjectDone = allQuestions.filter((question) => question.subjectId === subject.id && currentAnswers[question.id]).length;
                  const percent = subjectTotal ? Math.round((subjectDone / subjectTotal) * 100) : 0;
                  return (
                    <button
                      className="progress-row"
                      key={subject.id}
                      onClick={() => {
                        setActiveSubject(subject.id);
                        setSection("practice");
                      }}
                    >
                      <span>{subject.name}</span>
                      <div className="progress-track">
                        <div style={{ width: `${percent}%` }} />
                      </div>
                      <strong>{percent}%</strong>
                    </button>
                  );
                })}
                <button className="progress-row" onClick={() => setSection("lab")}>
                  <span>실습 SQL 작성형</span>
                  <div className="progress-track">
                    <div style={{ width: `${labProgressPercent}%` }} />
                  </div>
                  <strong>{labCompleted}/{allLabQuestions.length}</strong>
                </button>
              </div>
            </section>

            <section className="todo-panel">
              <div className="panel-heading">
                <div>
                  <p className="eyebrow">Today</p>
                  <h2>내 할 일</h2>
                </div>
                <span className="pill">{completedTodos}/{todaysTodos.length}</span>
              </div>
              <form className="todo-form" onSubmit={addTodo}>
                <input
                  value={newTodoText}
                  onChange={(event) => setNewTodoText(event.target.value)}
                  placeholder="오늘 할 일을 적어주세요"
                  aria-label="오늘 할 일 추가"
                />
                <button className="icon-only soft" type="submit" aria-label="할 일 추가">
                  <Plus size={17} />
                </button>
              </form>
              <div className="todo-list">
                {todaysTodos.length === 0 && <p className="empty compact">아직 적은 할 일이 없어요.</p>}
                {todaysTodos.map((todo) => {
                  return (
                    <div key={todo.id} className={todo.checked ? "todo-item checked" : "todo-item"}>
                      <label>
                        <input type="checkbox" checked={todo.checked} onChange={() => toggleTodo(todo.id)} />
                        <span>{todo.text}</span>
                      </label>
                      <button className="icon-only tiny" onClick={() => deleteTodo(todo.id)} aria-label="할 일 삭제">
                        <Trash2 size={15} />
                      </button>
                    </div>
                  );
                })}
              </div>
            </section>

            <section className="calendar-panel">
              <div className="panel-heading">
                <div>
                  <p className="eyebrow">Study Calendar</p>
                  <h2>{today.getFullYear()}년 {today.getMonth() + 1}월 학습량</h2>
                </div>
                <CalendarDays size={22} />
              </div>
              <div className="calendar-weekdays" aria-hidden="true">
                {["일", "월", "화", "수", "목", "금", "토"].map((day) => (
                  <span key={day}>{day}</span>
                ))}
              </div>
              <div className="study-calendar">
                {monthlyStudyDays.map((day) => (
                  <span
                    key={day.key}
                    className={`calendar-day ${day.isToday ? "today" : ""}`}
                    data-level={Math.min(4, day.count)}
                    title={day.day ? `${day.day}일 · 학습 ${day.count}회` : ""}
                  >
                    {day.day}
                  </span>
                ))}
              </div>
            </section>
          </div>
        )}

        {section === "practice" && currentQuestion && (
          <div className="practice-layout">
            <section className="subject-panel">
              {subjects.map((subject) => (
                <button
                  key={subject.id}
                  className={subject.id === activeSubject ? "subject-tab active" : "subject-tab"}
                  onClick={() => setActiveSubject(subject.id)}
                >
                  {subject.name}
                </button>
              ))}
              <button className="subject-tab lab-entry" onClick={() => setSection("lab")}>
                <span>SQL 실습</span>
                <strong>실행계획 · Trace · SQL Rewrite</strong>
              </button>
              <div className="extra-gate">
                <span>
                  {subjectAnsweredCount}/{subjectQuestions.length} 완료
                  {subjectExtraQuestions.length > 0 ? ` · 추가 ${subjectExtraQuestions.length}문제` : ""}
                </span>
                <p>11번 이후 문제는 PDF 원문 대조 검수 후 다시 열 예정입니다.</p>
                <button className="primary-button full" onClick={addExtraQuestionBatch} disabled={isGenerating || !verifiedExpansionReady}>
                  <Plus size={17} />
                  {isGenerating ? "생성 중" : "추가 문제 검수 중"}
                </button>
              </div>
              <div className="question-list">
                {subjectQuestions.map((question, index) => (
                  <button
                    key={question.id}
                    className={`mini-question ${index === questionIndex ? "active" : ""} ${currentAnswers[question.id]?.correct ? "correct" : currentAnswers[question.id] ? "wrong" : ""}`}
                    onClick={() => setQuestionIndex(index)}
                  >
                    {question.number}
                  </button>
                ))}
              </div>
            </section>

            <section className="question-panel">
              <div className="question-meta">
                <span>{currentQuestion.subjectName}</span>
                <span>{currentQuestion.topic}</span>
                <span>{currentQuestion.difficulty}</span>
              </div>
              <h2>
                {currentQuestion.number}. {currentQuestion.stem}
              </h2>

              {(currentQuestion.passage || currentQuestion.code || currentQuestion.table) && (
                <div className="exam-material">
                  {currentQuestion.passage && <p>{currentQuestion.passage}</p>}
                  {currentQuestion.table && (
                    <div className="exam-table-wrap">
                      <table className="exam-table">
                        <thead>
                          <tr>
                            {currentQuestion.table.headers.map((header) => (
                              <th key={header}>{header}</th>
                            ))}
                          </tr>
                        </thead>
                        <tbody>
                          {currentQuestion.table.rows.map((row, rowIndex) => (
                            <tr key={`${currentQuestion.id}-row-${rowIndex}`}>
                              {row.map((cell, cellIndex) => (
                                <td key={`${currentQuestion.id}-${rowIndex}-${cellIndex}`}>{cell}</td>
                              ))}
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                  {currentQuestion.code && <pre className="exam-code">{currentQuestion.code}</pre>}
                </div>
              )}

              <div className="choice-list">
                {currentQuestion.choices.map((choice) => {
                  const isSelected = selectedChoice === choice.id;
                  const reveal = Boolean(currentAnswer);
                  const isAnswer = currentQuestion.answer === choice.id;
                  return (
                    <button
                      key={choice.id}
                      className={`choice ${isSelected ? "selected" : ""} ${reveal && isAnswer ? "answer" : ""} ${reveal && isSelected && !isAnswer ? "miss" : ""}`}
                      onClick={() => setSelectedChoice(choice.id)}
                    >
                      <strong>{choice.id}</strong>
                      <span>{choice.text}</span>
                    </button>
                  );
                })}
              </div>

              {hintVisible && (
                <div className="hint-box">
                  <Lightbulb size={18} />
                  <p>{currentQuestion.hint}</p>
                </div>
              )}

              {currentAnswer && (
                <div className={currentAnswer.correct ? "explain-box correct" : "explain-box wrong"}>
                  <div className="explain-title">
                    {currentAnswer.correct ? <CheckCircle2 size={20} /> : <XCircle size={20} />}
                    <strong>{currentAnswer.correct ? "정답" : "오답"}</strong>
                  </div>
                  <p>{currentQuestion.explanation}</p>
                  <p className="small-muted">
                    선택 {currentAnswer.selectedChoiceId}: {currentQuestion.whyWrong[currentAnswer.selectedChoiceId]}
                  </p>
                  <div className="choice-explanations">
                    <strong>선택지별 해설</strong>
                    {currentQuestion.choices.map((choice) => (
                      <p
                        key={`${currentQuestion.id}-why-${choice.id}`}
                        className={choice.id === currentQuestion.answer ? "choice-explanation answer" : "choice-explanation"}
                      >
                        <b>{choice.id}</b> {currentQuestion.whyWrong[choice.id]}
                      </p>
                    ))}
                  </div>
                  {currentQuestion.relatedConceptId && (
                    <button className="ghost-button" onClick={() => openRelatedConcept(currentQuestion.relatedConceptId!)}>
                      <BookOpen size={17} />
                      관련 개념정리 보기
                    </button>
                  )}
                </div>
              )}

              <div className="question-actions">
                <button className="ghost-button" onClick={() => setHintVisible(true)}>
                  <Lightbulb size={17} />
                  힌트
                </button>
                <button className="primary-button" onClick={submitAnswer} disabled={!selectedChoice}>
                  <CheckCircle2 size={17} />
                  제출
                </button>
                <button className="ghost-button icon-only" aria-label="Previous question" onClick={() => setQuestionIndex((prev) => clampIndex(prev - 1, subjectQuestions.length))}>
                  <ChevronLeft size={18} />
                </button>
                <button className="ghost-button icon-only" aria-label="Next question" onClick={() => setQuestionIndex((prev) => clampIndex(prev + 1, subjectQuestions.length))}>
                  <ChevronRight size={18} />
                </button>
              </div>
              <div className="bottom-add-panel">
                <div>
                  <strong>문제 풀이 풀 확장</strong>
                  <span>PDF 원문 대조 검수 완료 후 20문제 단위로 다시 제공합니다.</span>
                </div>
                <button className="primary-button" onClick={addExtraQuestionBatch} disabled={isGenerating || !verifiedExpansionReady}>
                  <Plus size={17} />
                  검수 중
                </button>
              </div>
            </section>
          </div>
        )}

        {section === "lab" && !activeLab && (
          <div className="lab-layout">
            <section className="subject-panel">
              <button className="subject-tab" onClick={() => setSection("practice")}>
                <span>필기 문제풀이</span>
                <strong>1과목 · 2과목 · 3과목 객관식으로 돌아가기</strong>
              </button>
              <div className="extra-gate">
                <span>SQL 실습 재검수 중</span>
                <p>아까 예시 수준과 다른 실습 문제는 운영에서 내렸습니다.</p>
                <button className="primary-button" disabled>
                  <Sparkles size={17} />
                  원문 대조 중
                </button>
              </div>
            </section>

            <section className="lab-main">
              <div className="question-meta">
                <span>SQL Practice</span>
                <span>실행계획 · Trace · SQL Rewrite</span>
                <span>검수 중</span>
              </div>
              <h2>SQL 실습 문제를 다시 검수하고 있어요</h2>
              <p className="lead">
                숫자만 바뀐 실습이나 예시와 다른 구성은 공개하지 않도록 내렸습니다. 다음 배치는 업무 상황, 테이블 구조, SQL, 실행계획, Trace, 채점 기준을 한 문제씩 대조한 뒤 다시 공개합니다.
              </p>
              <div className="prompt-box">
                <strong>재작성 기준</strong>
                <p>
                  실습은 원문 자료를 기준으로 서로 다른 풀이 능력을 평가해야 합니다. JOIN 작성, 서브쿼리, 집계, 분석 함수, 인덱스 설계, 실행계획 분석, SQL Trace 분석, Lock/동시성 같은 유형을 숫자만 바꾸지 않고 별도 문제로 구성합니다.
                </p>
              </div>
            </section>
          </div>
        )}

        {section === "lab" && activeLab && (
          <div className="lab-layout">
            <section className="subject-panel">
              <button className="subject-tab" onClick={() => setSection("practice")}>
                <span>필기 문제풀이</span>
                <strong>1과목 · 2과목 · 3과목 객관식으로 돌아가기</strong>
              </button>
              {allLabQuestions.map((lab, index) => (
                <button
                  key={lab.id}
                  className={index === activeLabIndex ? "subject-tab active" : "subject-tab"}
                  onClick={() => {
                    setActiveLabIndex(index);
                    setLabSql("");
                    setLabResult(null);
                    setRemotePlan(null);
                  }}
                >
                  실습 {lab.number}. {lab.topic}
                </button>
              ))}
              <div className="extra-gate">
                <span>{labCompleted}/{allLabQuestions.length} 시도 · 실습 풀 확장</span>
                <p>추가 실습은 숫자만 바뀐 문제를 제외하고 원문 대조 검수 후 다시 엽니다.</p>
                <button className="primary-button" onClick={addExtraLabBatch} disabled={isGenerating || !verifiedExpansionReady}>
                  <Sparkles size={17} />
                  실습 검수 중
                </button>
              </div>
            </section>

            <section className="lab-main">
              <div className="question-meta">
                <span>SQL 작성형</span>
                <span>{activeLab.topic}</span>
                <span>{activeLab.difficulty}</span>
              </div>
              <h2>{activeLab.title}</h2>
              <p className="lead">{activeLab.scenario}</p>

              <div className="split-panels">
                <div className="code-panel schema-panel">
                  <div className="code-panel-heading">
                    <h3>스키마/인덱스</h3>
                    <span>복원형 조건</span>
                  </div>
                  <pre>{activeLab.schemaSql}</pre>
                </div>
                <div className="code-panel schema-panel compact">
                  <div className="code-panel-heading">
                    <h3>AS-IS/제약</h3>
                    <span>현재 SQL과 제한사항</span>
                  </div>
                  <pre>{activeLab.seedSql}</pre>
                </div>
                <div className="code-panel plan-target-panel">
                  <div className="code-panel-heading">
                    <h3>목표 실행계획</h3>
                    <span>영문 Operation · 한글 해설</span>
                  </div>
                  <ul className="plan-explain-list">
                    {(activeLab.targetPlanExplanations ?? activeLab.targetPlan.map((item) => ({ operation: item, korean: item, note: "답안에서 이 처리 의도를 드러내야 합니다." }))).map((item) => (
                      <li key={item.operation}>
                        <strong>{item.operation}</strong>
                        <span>{item.korean}</span>
                        <em>{item.note}</em>
                      </li>
                    ))}
                  </ul>
                </div>
                {activeLab.traceStats && (
                  <div className="code-panel schema-panel compact">
                    <div className="code-panel-heading">
                      <h3>SQL Trace 통계</h3>
                      <span>핵심 요약 · 전체 원문</span>
                    </div>
                    {activeLab.simulationNotice && <p className="trace-notice">{activeLab.simulationNotice}</p>}
                    {activeLab.traceSummary?.length ? (
                      <div className="trace-summary-table">
                        <table>
                          <thead>
                            <tr>
                              <th>항목</th>
                              <th>값</th>
                              <th>의미</th>
                            </tr>
                          </thead>
                          <tbody>
                            {activeLab.traceSummary.map((row) => (
                              <tr key={row.metric}>
                                <td>{row.metric}</td>
                                <td>{row.value}</td>
                                <td>{row.meaning}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    ) : null}
                    <details className="trace-raw">
                      <summary>전체 Trace 원문 보기</summary>
                      <pre>{activeLab.traceStats}</pre>
                    </details>
                  </div>
                )}
                {activeLab.predicateInfo && (
                  <div className="code-panel schema-panel compact">
                    <div className="code-panel-heading">
                      <h3>Predicate Information</h3>
                      <span>access/filter 판정</span>
                    </div>
                    <pre>{activeLab.predicateInfo}</pre>
                  </div>
                )}
              </div>

              <div className="prompt-box">
                <strong>문제</strong>
                <p>{activeLab.prompt}</p>
              </div>

              <div className="hint-box lab-hint-box">
                <Lightbulb size={18} />
                <div>
                  <strong>단계별 힌트</strong>
                  <ol>
                    {activeLab.hints.map((hint) => (
                      <li key={hint}>{hint}</li>
                    ))}
                  </ol>
                </div>
              </div>

              <textarea
                className={containsUnsafeSql(labSql) ? "sql-editor danger" : "sql-editor"}
                value={labSql}
                onChange={(event) => setLabSql(event.target.value)}
                placeholder="SELECT 또는 WITH 문으로 답안을 작성하세요. Oracle 힌트는 주석 형태로 함께 연습할 수 있습니다."
                spellCheck={false}
              />

              <div className="question-actions">
                <button className="primary-button" onClick={runLab}>
                  <Play size={17} />
                  실행계획 확인
                </button>
                <button className="ghost-button" onClick={() => setLabSql(activeLab.expectedSql)}>
                  <Sparkles size={17} />
                  기준 답안
                </button>
              </div>
              <div className="bottom-add-panel">
                <div>
                  <strong>실습 문제 풀 확장</strong>
                  <span>실습 추가 배치는 원문 대조 검수 완료 후 제공합니다.</span>
                </div>
                <button className="primary-button" onClick={addExtraLabBatch} disabled={isGenerating || !verifiedExpansionReady}>
                  <Plus size={17} />
                  검수 중
                </button>
              </div>

              {labResult && (
                <div className="lab-result">
                  <div>
                    <p className="eyebrow">Feedback</p>
                    <h3>{labResult.score}점 · {labResult.passed ? "통과권" : "보강 필요"}</h3>
                    <ul>
                      {labResult.feedback.map((item) => (
                        <li key={item}>{item}</li>
                      ))}
                    </ul>
                  </div>
                  <div className="code-panel">
                    <h3>{remotePlan?.mode === "postgres" ? "PostgreSQL EXPLAIN" : "실행계획 시뮬레이션"}</h3>
                    <pre>{(remotePlan?.plan ?? labResult.plan).join("\n")}</pre>
                    <p className="small-muted">{remotePlan?.message ?? "DATABASE_URL이 없으면 로컬 시뮬레이션이 사용됩니다."}</p>
                  </div>
                </div>
              )}

              <section className="oracle-panel">
                <h3>Oracle/SQLP 관점</h3>
                <ul>
                  {activeLab.oracleNotes.map((note) => (
                    <li key={note}>{note}</li>
                  ))}
                </ul>
                {activeLab.relatedConceptIds?.length ? (
                  <div className="related-concept-actions">
                    <strong>관련 개념</strong>
                    {activeLab.relatedConceptIds.map((conceptId) => {
                      const concept = conceptArticles.find((article) => article.id === conceptId);
                      if (!concept) return null;

                      return (
                        <button key={conceptId} className="ghost-button" onClick={() => openRelatedConcept(conceptId)}>
                          <BookOpen size={16} />
                          {concept.detailTopic}
                        </button>
                      );
                    })}
                  </div>
                ) : null}
              </section>
            </section>
          </div>
        )}

        {section === "wrong" && (
          <section className="wide-panel">
            <div className="panel-heading">
              <div>
                <p className="eyebrow">Review Queue</p>
                <h2>오답노트</h2>
              </div>
              <span className="pill">{wrongQuestionIds.length}문제</span>
            </div>

            <div className="review-list">
              {wrongQuestionIds.length === 0 && <p className="empty">아직 오답이 없습니다. 문제풀이에서 틀린 문항이 자동으로 쌓입니다.</p>}
              {wrongQuestionIds.map((questionId) => {
                const question = getWrongQuestion(questionId);
                const note = wrongNotes[questionId];
                const latestAttempt = latestWrongAttemptsByQuestion.get(questionId);
                const selectedIds = getWrongSelectedChoiceIds(note, latestAttempt);
                const lastWrongAt = note?.lastWrongAt ?? latestAttempt?.answeredAt ?? note?.updatedAt;
                const wrongAttemptsForQuestion = attempts.filter((attempt) => attempt.questionId === questionId && !attempt.correct).length;
                const wrongCountForQuestion = note?.wrongCount ?? wrongAttemptsForQuestion;
                const memo = note?.memo ?? "";
                const saveStatus = wrongNoteSaveStatus[questionId];

                if (!question) {
                  return (
                    <article className="review-item" key={questionId}>
                      <div className="wrong-note-main">
                        <span className="pill">원본 문제 연결 필요</span>
                        <h3>문제 ID: {questionId}</h3>
                        <p className="small-muted">기존 오답 기록에 원본 문제 정보가 부족합니다. 확인 가능한 메모는 그대로 보존했습니다.</p>
                      </div>
                      <aside className="wrong-note-side">
                        <label className="wrong-memo-label" htmlFor={`wrong-memo-${questionId}`}>
                          다시 틀리지 않기 위한 나만의 포인트
                        </label>
                        <textarea
                          id={`wrong-memo-${questionId}`}
                          value={memo}
                          onChange={(event) => updateWrongMemo(questionId, event.target.value)}
                          placeholder="다시 틀리지 않기 위한 나만의 포인트"
                        />
                        <span className="wrong-save-status">{saveStatus === "saving" ? "저장 중..." : saveStatus === "saved" ? "저장 완료" : "클라우드 동기화"}</span>
                        <button className="danger-button" onClick={() => setPendingWrongDeleteId(questionId)}>
                          <Trash2 size={16} />
                          오답노트에서 삭제
                        </button>
                      </aside>
                    </article>
                  );
                }

                return (
                  <article className="review-item" key={questionId}>
                    <div className="wrong-note-main">
                      <div className="wrong-note-meta">
                        <span className="pill">{question.subjectName}</span>
                        <span className="pill">{question.majorTopic ?? question.topic}</span>
                        <span className="pill">{question.difficulty}</span>
                        {lastWrongAt && <span className="pill">최근 오답 {formatDateTime(lastWrongAt)}</span>}
                      </div>

                      <section className="wrong-note-section">
                        <p className="eyebrow">문제 {question.number}</p>
                        <h3>{question.stem}</h3>
                        {question.passage && <p className="wrong-note-passage">{question.passage}</p>}
                      </section>

                      {(question.table || question.code) && (
                        <section className="wrong-note-section">
                          <h4>문제 자료</h4>
                          {question.table && (
                            <div className="exam-table-wrap wrong-table-wrap">
                              <table className="exam-table">
                                <thead>
                                  <tr>
                                    {question.table.headers.map((header) => (
                                      <th key={`${question.id}-wrong-header-${header}`}>{header}</th>
                                    ))}
                                  </tr>
                                </thead>
                                <tbody>
                                  {question.table.rows.map((row, rowIndex) => (
                                    <tr key={`${question.id}-wrong-row-${rowIndex}`}>
                                      {row.map((cell, cellIndex) => (
                                        <td key={`${question.id}-wrong-${rowIndex}-${cellIndex}`}>{cell}</td>
                                      ))}
                                    </tr>
                                  ))}
                                </tbody>
                              </table>
                            </div>
                          )}
                          {question.code && (
                            <div className="wrong-code-block">
                              <span>{getMaterialLabel(question.code)}</span>
                              <pre className="exam-code">{question.code}</pre>
                            </div>
                          )}
                        </section>
                      )}

                      <section className="wrong-note-section">
                        <h4>선택지</h4>
                        <div className="wrong-choice-list">
                          {question.choices.map((choice) => {
                            const selected = selectedIds.includes(choice.id);
                            const correctChoice = question.answer === choice.id;
                            const statusText = getChoiceStatusText(choice.id, selectedIds, question.answer);
                            return (
                              <div
                                key={`${question.id}-wrong-choice-${choice.id}`}
                                className={`wrong-choice ${selected ? "selected-wrong" : ""} ${correctChoice ? "answer" : ""} ${selected && correctChoice ? "selected-correct" : ""}`}
                              >
                                <div className="wrong-choice-label">
                                  <strong>{choice.id}</strong>
                                  <span>{choice.text}</span>
                                </div>
                                <em>{statusText}</em>
                              </div>
                            );
                          })}
                        </div>
                      </section>

                      <section className="wrong-note-section">
                        <h4>채점 결과</h4>
                        <div className="wrong-result-grid">
                          <div>
                            <span>내가 선택한 답</span>
                            <strong>{formatChoiceIds(selectedIds)}</strong>
                          </div>
                          <div>
                            <span>실제 정답</span>
                            <strong>{question.answer}</strong>
                          </div>
                          <div>
                            <span>틀린 횟수</span>
                            <strong>{wrongCountForQuestion}회</strong>
                          </div>
                        </div>
                      </section>

                      <section className="wrong-note-section">
                        <h4>선택지별 해설</h4>
                        <div className="wrong-explanation-list">
                          {question.choices.map((choice) => {
                            const selected = selectedIds.includes(choice.id);
                            const correctChoice = question.answer === choice.id;
                            const explanation = question.whyWrong?.[choice.id];
                            return (
                              <div
                                key={`${question.id}-wrong-explanation-${choice.id}`}
                                className={`choice-explanation ${correctChoice ? "answer" : ""} ${selected && !correctChoice ? "selected-miss" : ""}`}
                              >
                                <b>{choice.id}</b>
                                <strong>{getChoiceStatusText(choice.id, selectedIds, question.answer)}</strong>
                                <p>{explanation || "이 선택지의 개별 해설은 아직 없습니다. 아래 정답 근거를 함께 확인해 주세요."}</p>
                              </div>
                            );
                          })}
                        </div>
                      </section>

                      <section className="wrong-note-section">
                        <h4>정답 근거</h4>
                        <p>{question.explanation}</p>
                      </section>

                      {question.relatedConceptId && (
                        <section className="wrong-note-section compact">
                          <h4>관련 개념</h4>
                          <button className="ghost-button" onClick={() => openRelatedConcept(question.relatedConceptId!)}>
                            <BookOpen size={17} />
                            관련 개념 보기
                          </button>
                        </section>
                      )}
                    </div>

                    <aside className="wrong-note-side">
                      <label className="wrong-memo-label" htmlFor={`wrong-memo-${questionId}`}>
                        다시 틀리지 않기 위한 나만의 포인트
                      </label>
                      <textarea
                        id={`wrong-memo-${questionId}`}
                        value={memo}
                        onChange={(event) => updateWrongMemo(questionId, event.target.value, question)}
                        placeholder="예: Access Predicate와 Filter Predicate를 먼저 구분하기"
                      />
                      <span className="wrong-save-status">{saveStatus === "saving" ? "저장 중..." : saveStatus === "saved" ? "저장 완료" : "클라우드 동기화"}</span>
                      <div className="wrong-note-actions">
                        <button className="ghost-button" onClick={() => retryWrongQuestion(question)}>
                          <RotateCcw size={16} />
                          문제 다시 풀기
                        </button>
                        <button className="danger-button" onClick={() => setPendingWrongDeleteId(questionId)}>
                          <Trash2 size={16} />
                          오답노트에서 삭제
                        </button>
                      </div>
                    </aside>
                  </article>
                );
              })}
            </div>
          </section>
        )}

        {section === "concepts" && selectedConcept && (
          <div className={conceptNavCollapsed ? "concept-layout nav-collapsed" : "concept-layout"}>
            <section className="concept-toc">
              <button className="toc-toggle" onClick={() => setConceptNavCollapsed((prev) => !prev)}>
                <BookOpen size={16} />
                <span>{conceptNavCollapsed ? "펼치기" : "목록 접기"}</span>
              </button>

              {conceptNavCollapsed ? (
                <div className="collapsed-label">
                  <span>{selectedConcept.subjectName.replace(/^(\d과목)\s*/, "$1")}</span>
                  <strong>{selectedConcept.title}</strong>
                </div>
              ) : (
                <>
                  <div className="concept-subject-tabs">
                    {conceptSubjectTabs.map((subject) => (
                      <button
                        key={subject.id}
                        className={subject.id === activeConceptSubject ? "concept-subject active" : "concept-subject"}
                        onClick={() => selectConceptSubject(subject.id)}
                      >
                        <span>{subject.label}</span>
                        <strong>{subject.title}</strong>
                        <small>{subject.count}개 세부항목</small>
                      </button>
                    ))}
                  </div>

                  <div className="concept-major-list">
                    <p className="eyebrow">주요항목</p>
                    {conceptMajorTopics.map((majorTopic) => (
                      <button
                        key={majorTopic}
                        className={majorTopic === resolvedConceptMajor ? "major-topic active" : "major-topic"}
                        onClick={() => selectConceptMajor(majorTopic)}
                      >
                        {majorTopic}
                      </button>
                    ))}
                  </div>

                  <div className="concept-detail-list">
                    <div className="panel-mini-heading">
                      <p className="eyebrow">세부항목</p>
                      <strong>{resolvedConceptMajor}</strong>
                    </div>
                    {visibleConceptArticles.map((concept) => (
                      <button
                        key={concept.id}
                        className={concept.id === selectedConcept.id ? "concept-detail active" : "concept-detail"}
                        onClick={() => {
                          setSelectedConceptId(concept.id);
                          setConceptNavCollapsed(true);
                        }}
                      >
                        <strong>{concept.title}</strong>
                        <span>{concept.summary}</span>
                      </button>
                    ))}
                  </div>
                </>
              )}
            </section>

            <section className="concept-article" onMouseUp={captureConceptSelection}>
              <div className="panel-heading">
                <div>
                  <p className="eyebrow">
                    {selectedConcept.subjectName} / {selectedConcept.majorTopic}
                  </p>
                  <h2>{selectedConcept.title}</h2>
                </div>
                <div className="highlight-toolbar">
                  <div className="color-palette" aria-label="형광펜 색상">
                    {(["yellow", "green", "pink"] as const).map((color) => (
                      <button
                        key={color}
                        className={highlightColor === color ? `color-dot ${color} active` : `color-dot ${color}`}
                        aria-label={`${color} 형광펜`}
                        onClick={() => setHighlightColor(color)}
                      />
                    ))}
                  </div>
                  <button className="ghost-button" onClick={addConceptHighlight} disabled={!selectedHighlightTarget}>
                    <Highlighter size={17} />
                    선택 형광펜
                  </button>
                  <button className="ghost-button" onClick={clearConceptHighlights} disabled={selectedConceptHighlights.length === 0}>
                    <Trash2 size={17} />
                    모든 마킹 지우기
                  </button>
                </div>
              </div>
              {selectedHighlightText && <p className="selection-preview">선택됨: {selectedHighlightText}</p>}
              <p className="lead" data-highlight-field={`${selectedConcept.id}:summary`}>
                {renderHighlightedText(selectedConcept.summary, `${selectedConcept.id}:summary`)}
              </p>
              {selectedConcept.studyBlocks?.map((block, blockIndex) => {
                if (block.type === "table") {
                  return (
                    <div className="concept-study-block" key={`${block.title}-${blockIndex}`}>
                      <h3>{block.title}</h3>
                      <div className="concept-table-wrap">
                        <table className="concept-table">
                          <thead>
                            <tr>
                              {block.headers.map((header, headerIndex) => (
                                <th key={header} data-highlight-field={`${selectedConcept.id}:block-${blockIndex}:header-${headerIndex}`}>
                                  {renderHighlightedText(header, `${selectedConcept.id}:block-${blockIndex}:header-${headerIndex}`)}
                                </th>
                              ))}
                            </tr>
                          </thead>
                          <tbody>
                            {block.rows.map((row, rowIndex) => (
                              <tr key={`${block.title}-${rowIndex}`}>
                                {row.map((cell, cellIndex) => (
                                  <td key={`${block.title}-${rowIndex}-${cellIndex}`} data-highlight-field={`${selectedConcept.id}:block-${blockIndex}:row-${rowIndex}:cell-${cellIndex}`}>
                                    {renderHighlightedText(cell, `${selectedConcept.id}:block-${blockIndex}:row-${rowIndex}:cell-${cellIndex}`)}
                                  </td>
                                ))}
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  );
                }

                if (block.type === "flow") {
                  return (
                    <div className="concept-study-block" key={`${block.title}-${blockIndex}`}>
                      <h3>{block.title}</h3>
                      <ol className="concept-flow">
                        {block.steps.map((step, stepIndex) => (
                          <li key={`${block.title}-${stepIndex}`}>
                            <span>{stepIndex + 1}</span>
                            <p data-highlight-field={`${selectedConcept.id}:block-${blockIndex}:step-${stepIndex}`}>
                              {renderHighlightedText(step, `${selectedConcept.id}:block-${blockIndex}:step-${stepIndex}`)}
                            </p>
                          </li>
                        ))}
                      </ol>
                    </div>
                  );
                }

                if (block.type === "checklist") {
                  return (
                    <div className="concept-study-block" key={`${block.title}-${blockIndex}`}>
                      <h3>{block.title}</h3>
                      <ul className="concept-checklist">
                        {block.items.map((item, itemIndex) => (
                          <li key={item} data-highlight-field={`${selectedConcept.id}:block-${blockIndex}:item-${itemIndex}`}>
                            {renderHighlightedText(item, `${selectedConcept.id}:block-${blockIndex}:item-${itemIndex}`)}
                          </li>
                        ))}
                      </ul>
                    </div>
                  );
                }

                return (
                  <div className="concept-study-block" key={`${block.title}-${blockIndex}`}>
                    <h3>{block.title}</h3>
                    {block.paragraphs.map((paragraph, paragraphIndex) => (
                      <p key={paragraph} data-highlight-field={`${selectedConcept.id}:block-${blockIndex}:paragraph-${paragraphIndex}`}>
                        {renderHighlightedText(paragraph, `${selectedConcept.id}:block-${blockIndex}:paragraph-${paragraphIndex}`)}
                      </p>
                    ))}
                  </div>
                );
              })}
              <h3>시험에 자주 나오는 핵심</h3>
              <ul className="concept-points">
                {selectedConcept.keyPoints.map((point, pointIndex) => (
                  <li key={point} data-highlight-field={`${selectedConcept.id}:key-${pointIndex}`}>
                    {renderHighlightedText(point, `${selectedConcept.id}:key-${pointIndex}`)}
                  </li>
                ))}
              </ul>
              <div className="prompt-box">
                <strong>시험 함정</strong>
                <p data-highlight-field={`${selectedConcept.id}:trap`}>{renderHighlightedText(selectedConcept.examTrap, `${selectedConcept.id}:trap`)}</p>
              </div>
              {selectedConcept.oracleAngle && (
                <div className="prompt-box oracle">
                  <strong>Oracle 관점</strong>
                  <p data-highlight-field={`${selectedConcept.id}:oracle`}>{renderHighlightedText(selectedConcept.oracleAngle, `${selectedConcept.id}:oracle`)}</p>
                </div>
              )}
              <textarea
                value={conceptMarks[selectedConcept.id]?.memo ?? ""}
                onChange={(event) => updateConceptMark(selectedConcept.id, { memo: event.target.value })}
                placeholder="이 개념에서 헷갈리는 부분"
              />
            </section>
          </div>
        )}

        {section === "notes" && (
          <section className="wide-panel">
            <div className="panel-heading">
              <div>
                <p className="eyebrow">Private Notes</p>
                <h2>개인 노트</h2>
              </div>
              <button className="primary-button" onClick={addPersonalNote}>
                <Plus size={17} />새 노트
              </button>
            </div>

            {personalNotes.length === 0 && <p className="empty">개인 노트를 만들면 로컬에 즉시 저장되고, 로그인 후에는 Supabase에 동기화됩니다.</p>}

            {personalNotes.length > 0 && selectedPersonalNote && (
              <div className={noteListCollapsed ? "notes-workspace notes-collapsed" : "notes-workspace"}>
                <aside className="note-list">
                  <button className="toc-toggle" onClick={() => setNoteListCollapsed((prev) => !prev)}>
                    <NotebookPen size={16} />
                    <span>{noteListCollapsed ? "목록" : "목록 접기"}</span>
                  </button>
                  {noteListCollapsed ? (
                    <div className="collapsed-label">
                      <span>{personalNotes.length}개 노트</span>
                      <strong>{selectedPersonalNote.title || "제목 없는 노트"}</strong>
                    </div>
                  ) : (
                    <div className="note-list-items">
                      {personalNotes.map((note) => (
                        <button
                          className={note.id === selectedPersonalNote.id ? "note-list-item active" : "note-list-item"}
                          key={note.id}
                          onClick={() => {
                            setSelectedPersonalNoteId(note.id);
                            setNoteListCollapsed(true);
                          }}
                        >
                          <strong>{note.title || "제목 없는 노트"}</strong>
                          <span>{note.body || "내용 없음"}</span>
                          <small>
                            {note.tags || "태그 없음"} · {formatDateTime(note.updatedAt)}
                          </small>
                        </button>
                      ))}
                    </div>
                  )}
                </aside>

                <article className="note-editor-panel">
                  <div className="note-card-head">
                    <input
                      aria-label="노트 제목"
                      value={selectedPersonalNote.title}
                      onChange={(event) => updatePersonalNote(selectedPersonalNote.id, { title: event.target.value })}
                      placeholder="노트 제목"
                    />
                    <button className="ghost-button icon-only" aria-label="노트 삭제" onClick={() => deletePersonalNote(selectedPersonalNote.id)}>
                      <Trash2 size={16} />
                    </button>
                  </div>
                  <textarea
                    value={selectedPersonalNote.body}
                    onChange={(event) => updatePersonalNote(selectedPersonalNote.id, { body: event.target.value })}
                    placeholder="헷갈리는 개념, 쿼리 패턴, 실행계획 해석을 적어두세요."
                  />
                  <div className="note-footer">
                    <input
                      aria-label="노트 태그"
                      value={selectedPersonalNote.tags}
                      onChange={(event) => updatePersonalNote(selectedPersonalNote.id, { tags: event.target.value })}
                      placeholder="태그"
                    />
                    <span>{formatDateTime(selectedPersonalNote.updatedAt)}</span>
                  </div>
                </article>
              </div>
            )}
          </section>
        )}
      </section>
      {pendingWrongDeleteId && (
        <div className="confirm-backdrop" role="presentation">
          <section className="confirm-dialog" role="dialog" aria-modal="true" aria-labelledby="wrong-delete-title">
            <div>
              <p className="eyebrow">Delete Review Item</p>
              <h3 id="wrong-delete-title">이 문제를 오답노트에서 삭제할까요?</h3>
              <p>작성한 나만의 포인트도 함께 삭제됩니다. 원본 문제와 풀이 기록, 다른 사용자의 데이터는 삭제되지 않습니다.</p>
            </div>
            <div className="confirm-actions">
              <button className="ghost-button" onClick={() => setPendingWrongDeleteId(null)}>
                취소
              </button>
              <button className="danger-button" onClick={confirmDeleteWrongNote}>
                <Trash2 size={16} />
                삭제
              </button>
            </div>
          </section>
        </div>
      )}
    </main>
  );
}

function sectionTitle(section: Section) {
  switch (section) {
    case "dashboard":
      return "학습 홈";
    case "practice":
      return "객관식 문제풀이";
    case "lab":
      return "문제풀이 · SQL 실습";
    case "wrong":
      return "오답 복습";
    case "concepts":
      return "개념정리";
    case "notes":
      return "개인 노트";
  }
}



