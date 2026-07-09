"use client";

import {
  BarChart3,
  BookOpen,
  Brain,
  CalendarDays,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Database,
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
import { useEffect, useMemo, useState } from "react";
import { containsUnsafeSql, gradeSqlSubmission, isChoiceCorrect } from "@/lib/grading";
import { conceptArticles, createLocalExtraQuestions, labQuestions, objectiveQuestions, subjects } from "@/lib/problem-bank";
import { getSupabaseBrowserClient, isSupabaseConfigured } from "@/lib/supabase-client";
import type { FormEvent } from "react";
import type {
  AnswerRecord,
  AttemptRecord,
  ChoiceId,
  ConceptMark,
  ObjectiveQuestion,
  PersonalNote,
  StudyStatePayload,
  SubjectId,
  TodoItem,
  WrongNote
} from "@/lib/types";

type Section = "dashboard" | "practice" | "lab" | "wrong" | "concepts" | "notes";

const emptyState: StudyStatePayload = {
  answers: {},
  labAnswers: {},
  todoChecks: {},
  todoItems: {},
  attempts: [],
  wrongNotes: {},
  conceptMarks: {},
  personalNotes: [],
  extraQuestions: []
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
  const [conceptMarks, setConceptMarks] = usePersistentState<Record<string, ConceptMark>>("sqlmate.conceptMarks", emptyState.conceptMarks);
  const [personalNotes, setPersonalNotes] = usePersistentState<PersonalNote[]>("sqlmate.personalNotes", emptyState.personalNotes);
  const [extraQuestions, setExtraQuestions] = usePersistentState<ObjectiveQuestion[]>("sqlmate.extraQuestions", emptyState.extraQuestions);
  const [selectedConceptId, setSelectedConceptId] = useState(conceptArticles[0]?.id ?? "");
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

  const supabase = useMemo(() => getSupabaseBrowserClient(), []);
  const allQuestions = useMemo(() => [...objectiveQuestions, ...extraQuestions], [extraQuestions]);
  const baseSubjectQuestions = useMemo(
    () => objectiveQuestions.filter((question) => question.subjectId === activeSubject),
    [activeSubject]
  );
  const subjectExtraQuestions = useMemo(
    () => extraQuestions.filter((question) => question.subjectId === activeSubject),
    [activeSubject, extraQuestions]
  );
  const subjectQuestions = useMemo(
    () => [...baseSubjectQuestions, ...subjectExtraQuestions].map((question, index) => ({ ...question, number: index + 1 })),
    [baseSubjectQuestions, subjectExtraQuestions]
  );
  const currentQuestion = subjectQuestions[clampIndex(questionIndex, subjectQuestions.length)];
  const currentAnswer = currentQuestion ? answers[currentQuestion.id] : undefined;
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
  const activeLab = labQuestions[activeLabIndex];

  const completed = Object.keys(answers).length;
  const correct = Object.values(answers).filter((answer) => answer.correct).length;
  const accuracy = completed ? Math.round((correct / completed) * 100) : 0;
  const wrongCount = attempts.filter((attempt) => !attempt.correct).length;
  const highlightedCount = Object.values(conceptMarks).filter((mark) => mark.highlighted).length;
  const today = new Date();
  const todayKey = toDateKey(today);
  const nextExam = sqlpExamSchedule.find((exam) => daysBetween(today, new Date(`${exam.examDate}T00:00:00`)) >= 0) ?? sqlpExamSchedule[sqlpExamSchedule.length - 1];
  const examDday = Math.max(0, daysBetween(today, new Date(`${nextExam.examDate}T00:00:00`)));
  const todaysTodos = todoItems[todayKey] ?? [];
  const completedTodos = todaysTodos.filter((todo) => todo.checked).length;
  const labCompleted = Object.keys(labAnswers).length;
  const labPassed = Object.values(labAnswers).filter((answer) => answer.passed).length;
  const monthlyStudyDays = useMemo(() => buildStudyCalendar(today, attempts, labAnswers), [attempts, labAnswers, todayKey]);
  const subjectAnsweredCount = subjectQuestions.filter((question) => answers[question.id]).length;
  const canGenerateExtraBatch = subjectQuestions.length > 0 && subjectAnsweredCount === subjectQuestions.length;
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
      conceptMarks,
      personalNotes,
      extraQuestions
    }),
    [answers, labAnswers, todoChecks, todoItems, attempts, wrongNotes, conceptMarks, personalNotes, extraQuestions]
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
          setConceptMarks(state.conceptMarks ?? {});
          setPersonalNotes(state.personalNotes ?? []);
          setExtraQuestions(state.extraQuestions ?? []);
        }
        setCloudReady(true);
        setCloudStatus(error ? "클라우드 스키마 확인 필요" : "클라우드 동기화");
      });

    return () => {
      ignore = true;
    };
  }, [cloudUser, setAnswers, setAttempts, setConceptMarks, setExtraQuestions, setLabAnswers, setPersonalNotes, setTodoChecks, setTodoItems, setWrongNotes, supabase]);

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
        hintUsed: hintVisible
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
        stem: currentQuestion.stem
      },
      ...prev
    ]);

    if (!answerIsCorrect) {
      setWrongNotes((prev) => ({
        ...prev,
        [currentQuestion.id]: prev[currentQuestion.id] ?? {
          questionId: currentQuestion.id,
          memo: "",
          updatedAt: answeredAt
        }
      }));
    }
  }

  function addExtraQuestionBatch() {
    if (!canGenerateExtraBatch) return;

    setIsGenerating(true);
    const firstNewQuestionIndex = subjectQuestions.length;
    try {
      setExtraQuestions((prev) => {
        const nextStartCount = getNextExtraStartCount(prev, activeSubject);
        const batch = createLocalExtraQuestions(activeSubject, nextStartCount, 20);
        return [...prev, ...batch];
      });
      setQuestionIndex(firstNewQuestionIndex);
    } finally {
      setIsGenerating(false);
    }
  }

  async function runLab() {
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

  function selectConceptSubject(subjectId: SubjectId) {
    const firstConcept = conceptArticles.find((concept) => concept.subjectId === subjectId);
    setActiveConceptSubject(subjectId);
    setActiveConceptMajor(firstConcept?.majorTopic ?? "");
    setSelectedConceptId(firstConcept?.id ?? "");
  }

  function selectConceptMajor(majorTopic: string) {
    const firstConcept = conceptArticles.find(
      (concept) => concept.subjectId === activeConceptSubject && concept.majorTopic === majorTopic
    );
    setActiveConceptMajor(majorTopic);
    setSelectedConceptId(firstConcept?.id ?? "");
  }

  function addPersonalNote() {
    const note: PersonalNote = {
      id: `note-${Date.now()}`,
      title: "새 개인 노트",
      body: "헷갈리는 개념, 쿼리 패턴, 실행계획 해석을 정리하세요.",
      tags: "SQLP",
      updatedAt: nowIso()
    };
    setPersonalNotes((prev) => [note, ...prev]);
  }

  function updatePersonalNote(noteId: string, patch: Partial<PersonalNote>) {
    setPersonalNotes((prev) =>
      prev.map((note) => (note.id === noteId ? { ...note, ...patch, updatedAt: nowIso() } : note))
    );
  }

  function deletePersonalNote(noteId: string) {
    setPersonalNotes((prev) => prev.filter((note) => note.id !== noteId));
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

  const wrongQuestionIds = Array.from(new Set(attempts.filter((attempt) => !attempt.correct).map((attempt) => attempt.questionId)));
  const navItems = [
    { id: "dashboard" as Section, label: "대시보드", icon: BarChart3 },
    { id: "practice" as Section, label: "문제풀이", icon: Brain },
    { id: "lab" as Section, label: "SQL 실습", icon: Database },
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
            return (
              <button key={item.id} className={section === item.id ? "nav-item active" : "nav-item"} onClick={() => setSection(item.id)}>
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
                <span className="pill">{completed} / {objectiveQuestions.length + extraQuestions.length}</span>
              </div>
              <div className="dashboard-progress-list">
                {subjects.map((subject) => {
                  const subjectTotal = allQuestions.filter((question) => question.subjectId === subject.id).length;
                  const subjectDone = allQuestions.filter((question) => question.subjectId === subject.id && answers[question.id]).length;
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
                    <div style={{ width: `${Math.round((labCompleted / labQuestions.length) * 100)}%` }} />
                  </div>
                  <strong>{labCompleted}/{labQuestions.length}</strong>
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
              <div className="extra-gate">
                <span>
                  {subjectAnsweredCount}/{subjectQuestions.length} 완료
                  {subjectExtraQuestions.length > 0 ? ` · 추가 ${subjectExtraQuestions.length}문제` : ""}
                </span>
                {canGenerateExtraBatch ? (
                  <button className="primary-button full" onClick={addExtraQuestionBatch} disabled={isGenerating}>
                    <Plus size={17} />
                    {isGenerating ? "생성 중" : `${nextExtraBatchStart}-${nextExtraBatchEnd}번 추가`}
                  </button>
                ) : (
                  <p>현재 과목 문제를 모두 풀면 20문제 추가 생성이 열립니다.</p>
                )}
              </div>
              <div className="question-list">
                {subjectQuestions.map((question, index) => (
                  <button
                    key={question.id}
                    className={`mini-question ${index === questionIndex ? "active" : ""} ${answers[question.id]?.correct ? "correct" : answers[question.id] ? "wrong" : ""}`}
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
            </section>
          </div>
        )}

        {section === "lab" && (
          <div className="lab-layout">
            <section className="subject-panel">
              {labQuestions.map((lab, index) => (
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
                <div className="code-panel">
                  <h3>스키마</h3>
                  <pre>{activeLab.schemaSql}</pre>
                </div>
                <div className="code-panel">
                  <h3>목표 실행계획</h3>
                  <ul>
                    {activeLab.targetPlan.map((item) => (
                      <li key={item}>{item}</li>
                    ))}
                  </ul>
                </div>
              </div>

              <div className="prompt-box">
                <strong>문제</strong>
                <p>{activeLab.prompt}</p>
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
                const question = allQuestions.find((item) => item.id === questionId);
                if (!question) return null;
                const note = wrongNotes[questionId];
                return (
                  <article className="review-item" key={questionId}>
                    <div>
                      <span className="pill">{question.subjectName}</span>
                      <h3>{question.stem}</h3>
                      <p>{question.explanation}</p>
                    </div>
                    <textarea
                      value={note?.memo ?? ""}
                      onChange={(event) =>
                        setWrongNotes((prev) => ({
                          ...prev,
                          [questionId]: {
                            questionId,
                            memo: event.target.value,
                            updatedAt: nowIso()
                          }
                        }))
                      }
                      placeholder="다시 틀리지 않기 위한 나만의 포인트"
                    />
                  </article>
                );
              })}
            </div>
          </section>
        )}

        {section === "concepts" && selectedConcept && (
          <div className="concept-layout">
            <section className="concept-toc">
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
            </section>

            <section className="concept-detail-list">
              <div className="panel-mini-heading">
                <p className="eyebrow">세부항목</p>
                <strong>{resolvedConceptMajor}</strong>
              </div>
              {visibleConceptArticles.map((concept) => (
                <button
                  key={concept.id}
                  className={concept.id === selectedConcept.id ? "concept-detail active" : "concept-detail"}
                  onClick={() => setSelectedConceptId(concept.id)}
                >
                  <strong>{concept.title}</strong>
                  <span>{concept.summary}</span>
                </button>
              ))}
            </section>

            <section className={conceptMarks[selectedConcept.id]?.highlighted ? "concept-article highlighted" : "concept-article"}>
              <div className="panel-heading">
                <div>
                  <p className="eyebrow">
                    {selectedConcept.subjectName} / {selectedConcept.majorTopic}
                  </p>
                  <h2>{selectedConcept.title}</h2>
                </div>
                <button
                  className="ghost-button"
                  onClick={() =>
                    updateConceptMark(selectedConcept.id, {
                      highlighted: !conceptMarks[selectedConcept.id]?.highlighted
                    })
                  }
                >
                  <Highlighter size={17} />
                  중요 표시
                </button>
              </div>
              <p className="lead">{selectedConcept.summary}</p>
              <h3>시험에 자주 나오는 핵심</h3>
              <ul className="concept-points">
                {selectedConcept.keyPoints.map((point) => (
                  <li key={point}>{point}</li>
                ))}
              </ul>
              <div className="prompt-box">
                <strong>시험 함정</strong>
                <p>{selectedConcept.examTrap}</p>
              </div>
              {selectedConcept.oracleAngle && (
                <div className="prompt-box oracle">
                  <strong>Oracle 관점</strong>
                  <p>{selectedConcept.oracleAngle}</p>
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

            <div className="notes-grid">
              {personalNotes.map((note) => (
                <article className="note-card" key={note.id}>
                  <div className="note-card-head">
                    <input
                      aria-label="노트 제목"
                      value={note.title}
                      onChange={(event) => updatePersonalNote(note.id, { title: event.target.value })}
                      placeholder="노트 제목"
                    />
                    <button className="ghost-button icon-only" aria-label="노트 삭제" onClick={() => deletePersonalNote(note.id)}>
                      <Trash2 size={16} />
                    </button>
                  </div>
                  <textarea
                    value={note.body}
                    onChange={(event) => updatePersonalNote(note.id, { body: event.target.value })}
                    placeholder="헷갈리는 개념, 쿼리 패턴, 실행계획 해석을 적어두세요."
                  />
                  <div className="note-footer">
                    <input
                      aria-label="노트 태그"
                      value={note.tags}
                      onChange={(event) => updatePersonalNote(note.id, { tags: event.target.value })}
                      placeholder="태그"
                    />
                    <span>{formatDateTime(note.updatedAt)}</span>
                  </div>
                </article>
              ))}
              {personalNotes.length === 0 && <p className="empty">개인 노트를 만들면 로컬에 즉시 저장되고, 로그인 후에는 Supabase에 동기화됩니다.</p>}
            </div>
          </section>
        )}
      </section>
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
      return "SQL 작성형 실습";
    case "wrong":
      return "오답 복습";
    case "concepts":
      return "개념정리";
    case "notes":
      return "개인 노트";
  }
}



