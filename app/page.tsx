"use client";

import {
  BarChart3,
  BookOpen,
  Brain,
  CalendarDays,
  CheckCircle2,
  ChevronLeft,
  Database,
  Highlighter,
  ListChecks,
  LogIn,
  LogOut,
  NotebookPen,
  Play,
  Plus,
  RotateCcw,
  Search,
  Settings,
  ShieldCheck,
  Sparkles,
  Trash2,
  UserRound,
  XCircle
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import type { User } from "@supabase/supabase-js";
import { approvedConceptDocuments, approvedPracticeScenarios, approvedQuestions } from "@/lib/content/sqlp-content";
import { summarizeDistribution } from "@/lib/validation/content-quality";
import { getSupabaseBrowserClient, isSupabaseConfigured } from "@/lib/supabase-client";
import type { ConceptDocument, HintStep, PracticeScenario, SqlpQuestion, SqlpSubjectId } from "@/lib/content/schema";

type View =
  | "dashboard"
  | "concepts"
  | "subject-1"
  | "subject-2"
  | "subject-3"
  | "practice"
  | "mock"
  | "wrong"
  | "bookmarks"
  | "notes"
  | "stats"
  | "tutor"
  | "settings"
  | "admin";

type Todo = {
  id: string;
  title: string;
  completed: boolean;
  createdAt: string;
};

type Attempt = {
  questionId: string;
  submitted: string[];
  correct: boolean;
  hintsUsed: number;
  answeredAt: string;
};

type PracticeSubmission = {
  practiceId: string;
  sql: string;
  score: number;
  submittedAt: string;
};

type HighlightMark = {
  id: string;
  conceptId: string;
  markKey: string;
  text: string;
  occurrenceIndex: number;
  color: "yellow" | "green" | "pink" | "blue";
};

type NoteBlock = {
  id: string;
  type: "paragraph" | "heading" | "bullet" | "check" | "code";
  text: string;
  checked?: boolean;
};

type NoteDoc = {
  id: string;
  title: string;
  tags: string[];
  favorite: boolean;
  trashed: boolean;
  updatedAt: string;
  blocks: NoteBlock[];
};

type OverhaulState = {
  todos: Todo[];
  attempts: Attempt[];
  hintProgress: Record<string, number>;
  practiceDrafts: Record<string, string>;
  practiceSubmissions: PracticeSubmission[];
  highlights: HighlightMark[];
  notes: NoteDoc[];
  bookmarks: Array<{ targetType: "question" | "concept" | "practice"; targetId: string }>;
};

const stateKey = "sqlmate-platform-overhaul-state";

const emptyState: OverhaulState = {
  todos: [],
  attempts: [],
  hintProgress: {},
  practiceDrafts: {},
  practiceSubmissions: [],
  highlights: [],
  notes: [
    {
      id: "note-welcome",
      title: "헷갈리는 SQLP 개념",
      tags: ["SQLP"],
      favorite: true,
      trashed: false,
      updatedAt: new Date().toISOString(),
      blocks: [
        { id: "b1", type: "heading", text: "내가 자주 틀리는 포인트" },
        { id: "b2", type: "bullet", text: "NOT IN에 NULL이 섞이면 UNKNOWN 때문에 결과가 사라질 수 있다." },
        { id: "b3", type: "code", text: "where not exists (...)" }
      ]
    }
  ],
  bookmarks: []
};

const subjects = [
  { id: "subject-1" as const, label: "1과목", title: "데이터 모델링" },
  { id: "subject-2" as const, label: "2과목", title: "SQL 기본 및 활용" },
  { id: "subject-3" as const, label: "3과목", title: "고급활용 및 튜닝" }
];

const examSchedule = [
  { round: "제55회", date: "2026-08-22", apply: "2026.07.20 ~ 07.24" },
  { round: "제56회", date: "2026-11-14", apply: "2026.10 예정" }
];

function nowIso() {
  return new Date().toISOString();
}

function dateKey(date: Date) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
}

function daysBetween(from: Date, to: Date) {
  const start = new Date(from.getFullYear(), from.getMonth(), from.getDate()).getTime();
  const end = new Date(to.getFullYear(), to.getMonth(), to.getDate()).getTime();
  return Math.ceil((end - start) / 86400000);
}

function formatDate(date: Date) {
  return new Intl.DateTimeFormat("ko-KR", {
    year: "numeric",
    month: "long",
    day: "numeric",
    weekday: "long"
  }).format(date);
}

function scoreLabel(score: number) {
  if (score >= 80) return "안정권";
  if (score >= 60) return "보강권";
  return "집중권";
}

function normalize(value: string) {
  return value.toLowerCase().replace(/\s+/g, " ").trim();
}

function arraysEqual(a: string[], b: string[]) {
  const left = [...a].map(normalize).sort();
  const right = [...b].map(normalize).sort();
  return left.length === right.length && left.every((value, index) => value === right[index]);
}

function gradeQuestion(question: SqlpQuestion, submitted: string[]) {
  const answerValue = Array.isArray(question.answer.value) ? question.answer.value : [question.answer.value];

  if (question.answer.kind === "choice" || question.answer.kind === "choices" || question.answer.kind === "ordered") {
    return arraysEqual(submitted, answerValue);
  }

  if (question.answer.kind === "text" || question.answer.kind === "texts") {
    const accepted = [...answerValue, ...(question.answer.accepted ?? [])].map(normalize);
    return submitted.every((value) => accepted.includes(normalize(value)));
  }

  if (question.answer.kind === "rubric") {
    const text = normalize(submitted.join(" "));
    return answerValue.filter((item) => text.includes(normalize(item).slice(0, 2))).length >= Math.ceil(answerValue.length / 2);
  }

  return false;
}

function answerText(question: SqlpQuestion) {
  return Array.isArray(question.answer.value) ? question.answer.value.join(", ") : question.answer.value;
}

function countOccurrences(text: string, needle: string) {
  if (!needle) return 0;
  let count = 0;
  let index = 0;
  while (true) {
    const found = text.indexOf(needle, index);
    if (found === -1) return count;
    count += 1;
    index = found + needle.length;
  }
}

function findNthOccurrence(text: string, needle: string, occurrenceIndex: number) {
  let index = 0;
  for (let count = 0; count <= occurrenceIndex; count += 1) {
    const found = text.indexOf(needle, index);
    if (found === -1) return -1;
    if (count === occurrenceIndex) return found;
    index = found + needle.length;
  }
  return -1;
}

function safeJsonState(value: unknown): OverhaulState {
  const candidate = value as Partial<OverhaulState> | undefined;
  return {
    ...emptyState,
    ...(candidate ?? {}),
    todos: candidate?.todos ?? [],
    attempts: candidate?.attempts ?? [],
    hintProgress: candidate?.hintProgress ?? {},
    practiceDrafts: candidate?.practiceDrafts ?? {},
    practiceSubmissions: candidate?.practiceSubmissions ?? [],
    highlights: candidate?.highlights ?? [],
    notes: candidate?.notes?.length ? candidate.notes : emptyState.notes,
    bookmarks: candidate?.bookmarks ?? []
  };
}

function buildCalendar(state: OverhaulState) {
  const today = new Date();
  const first = new Date(today.getFullYear(), today.getMonth(), 1);
  const last = new Date(today.getFullYear(), today.getMonth() + 1, 0);
  const offset = first.getDay();
  const total = Math.ceil((offset + last.getDate()) / 7) * 7;
  const counts = new Map<string, number>();

  state.attempts.forEach((attempt) => {
    const key = dateKey(new Date(attempt.answeredAt));
    counts.set(key, (counts.get(key) ?? 0) + 1);
  });

  state.practiceSubmissions.forEach((submission) => {
    const key = dateKey(new Date(submission.submittedAt));
    counts.set(key, (counts.get(key) ?? 0) + 3);
  });

  return Array.from({ length: total }, (_, index) => {
    const day = index - offset + 1;
    if (day < 1 || day > last.getDate()) return { key: `blank-${index}`, day: "", count: 0, today: false };
    const date = new Date(today.getFullYear(), today.getMonth(), day);
    const key = dateKey(date);
    return { key, day: String(day), count: counts.get(key) ?? 0, today: key === dateKey(today) };
  });
}

export default function Home() {
  const supabase = useMemo(() => getSupabaseBrowserClient(), []);
  const [user, setUser] = useState<User | null>(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [state, setState] = useState<OverhaulState>(emptyState);
  const [view, setView] = useState<View>("dashboard");
  const [selectedConceptId, setSelectedConceptId] = useState(approvedConceptDocuments[0]?.id ?? "");
  const [selectedQuestions, setSelectedQuestions] = useState<Record<SqlpSubjectId, number>>({
    "subject-1": 0,
    "subject-2": 0,
    "subject-3": 0
  });
  const [answers, setAnswers] = useState<Record<string, string[]>>({});
  const [newTodo, setNewTodo] = useState("");
  const [conceptSidebarOpen, setConceptSidebarOpen] = useState(true);
  const [notesSidebarOpen, setNotesSidebarOpen] = useState(true);
  const [selectedNoteId, setSelectedNoteId] = useState(emptyState.notes[0].id);
  const [search, setSearch] = useState("");
  const [syncStatus, setSyncStatus] = useState("로컬 준비");

  useEffect(() => {
    const local = window.localStorage.getItem(stateKey);
    if (local) setState(safeJsonState(JSON.parse(local)));

    if (!supabase) {
      setAuthLoading(false);
      return;
    }

    supabase.auth.getUser().then(({ data }) => {
      setUser(data.user);
      setAuthLoading(false);
    });

    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => listener.subscription.unsubscribe();
  }, [supabase]);

  useEffect(() => {
    window.localStorage.setItem(stateKey, JSON.stringify(state));
  }, [state]);

  useEffect(() => {
    if (!supabase || !user) return;

    let cancelled = false;
    supabase
      .from("study_state")
      .select("state")
      .eq("user_id", user.id)
      .maybeSingle()
      .then(({ data }) => {
        if (cancelled) return;
        const saved = data?.state as { overhaul?: OverhaulState } | null;
        if (saved?.overhaul) {
          setState(safeJsonState(saved.overhaul));
          setSyncStatus("DB에서 복원됨");
        } else {
          setSyncStatus("새 학습 상태");
        }
      });

    return () => {
      cancelled = true;
    };
  }, [supabase, user]);

  useEffect(() => {
    if (!supabase || !user) return;
    const timeout = window.setTimeout(() => {
      setSyncStatus("저장 중");
      supabase
        .from("study_state")
        .upsert({ user_id: user.id, state: { overhaul: state }, updated_at: nowIso() })
        .then(({ error }) => setSyncStatus(error ? "DB 저장 실패, 로컬 보존" : "저장 완료"));
    }, 700);

    return () => window.clearTimeout(timeout);
  }, [state, supabase, user]);

  const attemptsByQuestion = useMemo(() => {
    const map = new Map<string, Attempt>();
    state.attempts.forEach((attempt) => map.set(attempt.questionId, attempt));
    return map;
  }, [state.attempts]);

  const wrongAttempts = state.attempts.filter((attempt) => !attempt.correct);
  const solvedCount = state.attempts.length;
  const correctCount = state.attempts.filter((attempt) => attempt.correct).length;
  const accuracy = solvedCount ? Math.round((correctCount / solvedCount) * 100) : 0;
  const nearestExam = examSchedule.find((exam) => daysBetween(new Date(), new Date(exam.date)) >= 0) ?? examSchedule[0];
  const dday = daysBetween(new Date(), new Date(nearestExam.date));
  const calendar = buildCalendar(state);
  const selectedConcept = approvedConceptDocuments.find((concept) => concept.id === selectedConceptId) ?? approvedConceptDocuments[0];
  const selectedNote = state.notes.find((note) => note.id === selectedNoteId) ?? state.notes[0];

  function signIn() {
    if (!supabase) return;
    void supabase.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo: window.location.origin }
    });
  }

  function signOut() {
    void supabase?.auth.signOut();
  }

  function updateState(updater: (current: OverhaulState) => OverhaulState) {
    setState((current) => safeJsonState(updater(current)));
  }

  function submitQuestion(question: SqlpQuestion) {
    const submitted = answers[question.id] ?? [];
    if (submitted.length === 0 || submitted.every((item) => !item.trim())) return;
    const correct = gradeQuestion(question, submitted);

    updateState((current) => ({
      ...current,
      attempts: [
        ...current.attempts.filter((attempt) => attempt.questionId !== question.id),
        {
          questionId: question.id,
          submitted,
          correct,
          hintsUsed: current.hintProgress[question.id] ?? 0,
          answeredAt: nowIso()
        }
      ]
    }));
  }

  function showNextHint(questionId: string) {
    updateState((current) => ({
      ...current,
      hintProgress: {
        ...current.hintProgress,
        [questionId]: Math.min(3, (current.hintProgress[questionId] ?? 0) + 1)
      }
    }));
  }

  function addTodo() {
    const title = newTodo.trim();
    if (!title) return;
    updateState((current) => ({
      ...current,
      todos: [{ id: crypto.randomUUID(), title, completed: false, createdAt: nowIso() }, ...current.todos]
    }));
    setNewTodo("");
  }

  function toggleTodo(id: string) {
    updateState((current) => ({
      ...current,
      todos: current.todos.map((todo) => (todo.id === id ? { ...todo, completed: !todo.completed } : todo))
    }));
  }

  function addHighlight(conceptId: string, color: HighlightMark["color"]) {
    const selection = window.getSelection();
    const selectedText = selection?.toString().trim();
    if (!selection || !selectedText || selection.rangeCount === 0) return;

    const range = selection.getRangeAt(0);
    const element =
      range.startContainer.nodeType === Node.TEXT_NODE ? range.startContainer.parentElement : (range.startContainer as Element);
    const container = element?.closest<HTMLElement>("[data-mark-key]");
    if (!container) return;

    const markKey = container.dataset.markKey;
    const rawText = container.dataset.markText ?? container.textContent ?? "";
    if (!markKey) return;

    const before = range.cloneRange();
    before.selectNodeContents(container);
    before.setEnd(range.startContainer, range.startOffset);
    const occurrenceIndex = countOccurrences(before.toString(), selectedText);

    updateState((current) => ({
      ...current,
      highlights: [
        ...current.highlights,
        { id: crypto.randomUUID(), conceptId, markKey, text: selectedText, occurrenceIndex, color }
      ]
    }));
    selection.removeAllRanges();
  }

  function removeHighlight(id: string) {
    updateState((current) => ({
      ...current,
      highlights: current.highlights.filter((mark) => mark.id !== id)
    }));
  }

  function renderMarkedText(conceptId: string, markKey: string, text: string) {
    const marks = state.highlights
      .filter((mark) => mark.conceptId === conceptId && mark.markKey === markKey)
      .map((mark) => ({ ...mark, start: findNthOccurrence(text, mark.text, mark.occurrenceIndex) }))
      .filter((mark) => mark.start >= 0)
      .sort((a, b) => a.start - b.start);

    const chunks: React.ReactNode[] = [];
    let cursor = 0;
    for (const mark of marks) {
      if (mark.start < cursor) continue;
      if (mark.start > cursor) chunks.push(text.slice(cursor, mark.start));
      chunks.push(
        <button
          key={mark.id}
          className={`inline-mark mark-${mark.color}`}
          onClick={() => removeHighlight(mark.id)}
          title="이 표시만 지우기"
          type="button"
        >
          {text.slice(mark.start, mark.start + mark.text.length)}
        </button>
      );
      cursor = mark.start + mark.text.length;
    }
    chunks.push(text.slice(cursor));
    return chunks;
  }

  function updateNoteBlock(noteId: string, blockId: string, text: string) {
    updateState((current) => ({
      ...current,
      notes: current.notes.map((note) =>
        note.id === noteId
          ? {
              ...note,
              updatedAt: nowIso(),
              blocks: note.blocks.map((block) => (block.id === blockId ? { ...block, text } : block))
            }
          : note
      )
    }));
  }

  function addNote() {
    const note: NoteDoc = {
      id: crypto.randomUUID(),
      title: "새 SQLP 노트",
      tags: [],
      favorite: false,
      trashed: false,
      updatedAt: nowIso(),
      blocks: [{ id: crypto.randomUUID(), type: "paragraph", text: "" }]
    };
    updateState((current) => ({ ...current, notes: [note, ...current.notes] }));
    setSelectedNoteId(note.id);
  }

  function addNoteBlock(noteId: string, type: NoteBlock["type"]) {
    updateState((current) => ({
      ...current,
      notes: current.notes.map((note) =>
        note.id === noteId
          ? {
              ...note,
              updatedAt: nowIso(),
              blocks: [...note.blocks, { id: crypto.randomUUID(), type, text: "", checked: false }]
            }
          : note
      )
    }));
  }

  function submitPractice(scenario: PracticeScenario) {
    const sql = state.practiceDrafts[scenario.id] ?? "";
    const lower = normalize(sql);
    const matches = scenario.acceptableSqlPatterns.filter((pattern) => lower.includes(normalize(pattern))).length;
    const score = Math.min(100, 35 + matches * 18 + (sql.length > 80 ? 10 : 0));

    updateState((current) => ({
      ...current,
      practiceSubmissions: [
        ...current.practiceSubmissions,
        { practiceId: scenario.id, sql, score, submittedAt: nowIso() }
      ]
    }));
  }

  if (authLoading) {
    return <div className="login-gate">SQLMate 준비 중...</div>;
  }

  if (!user) {
    return (
      <main className="login-gate">
        <section className="auth-card">
          <p className="eyebrow">SQLP Coach Platform</p>
          <h1>SQLMate</h1>
          <p>구글 계정으로 로그인하면 문제풀이, 오답노트, 형광펜, 개인 노트가 계정에 맞춰 저장됩니다.</p>
          {!isSupabaseConfigured() && <p className="warning-text">Supabase 환경변수가 없어서 현재는 로컬 데모 모드입니다.</p>}
          <button className="primary-button" onClick={signIn} type="button">
            <LogIn size={18} /> Google로 시작하기
          </button>
        </section>
      </main>
    );
  }

  return (
    <main className="app-shell sqlmate-2026">
      <aside className="sidebar">
        <div className="brand compact-brand">
          <div>
            <strong>SQLMate</strong>
            <span>SQLP 합격 루틴</span>
          </div>
        </div>
        <nav className="nav-list">
          {[
            ["dashboard", "대시보드", BarChart3],
            ["concepts", "SQLP 개념 정리", BookOpen],
            ["subject-1", "1과목 문제풀이", ListChecks],
            ["subject-2", "2과목 문제풀이", ListChecks],
            ["subject-3", "3과목 문제풀이", ListChecks],
            ["practice", "SQLP 실습", Database],
            ["mock", "모의고사", CalendarDays],
            ["wrong", "오답노트", RotateCcw],
            ["bookmarks", "북마크", Highlighter],
            ["notes", "개인 노트", NotebookPen],
            ["stats", "학습 통계", BarChart3],
            ["tutor", "AI 튜터", Brain],
            ["settings", "사용자 설정", Settings],
            ["admin", "관리자 콘텐츠", ShieldCheck]
          ].map(([key, label, Icon]) => (
            <button key={key as string} className={`nav-item ${view === key ? "active" : ""}`} onClick={() => setView(key as View)} type="button">
              <Icon size={17} /> {label as string}
            </button>
          ))}
        </nav>
        <div className="sidebar-footer">
          <UserRound size={18} />
          <div>
            <strong>{user.user_metadata?.name ?? user.email}</strong>
            <span>{syncStatus}</span>
          </div>
          <button className="icon-button" onClick={signOut} title="로그아웃" type="button">
            <LogOut size={16} />
          </button>
        </div>
      </aside>

      <section className="workspace">
        <header className="topbar slim-topbar">
          <div>
            <p className="eyebrow">{formatDate(new Date())}</p>
            <h1>{viewTitle(view)}</h1>
          </div>
          <div className="top-actions">
            <span className="soft-pill">{nearestExam.round} D-{Math.max(0, dday)}</span>
            <span className="soft-pill">{scoreLabel(accuracy)} · 정답률 {accuracy}%</span>
          </div>
        </header>

        {view === "dashboard" && (
          <Dashboard
            accuracy={accuracy}
            solvedCount={solvedCount}
            correctCount={correctCount}
            dday={dday}
            nearestExam={nearestExam}
            calendar={calendar}
            todos={state.todos}
            newTodo={newTodo}
            setNewTodo={setNewTodo}
            addTodo={addTodo}
            toggleTodo={toggleTodo}
            attemptsByQuestion={attemptsByQuestion}
            wrongAttempts={wrongAttempts}
          />
        )}

        {view === "concepts" && selectedConcept && (
          <ConceptsView
            concepts={approvedConceptDocuments}
            selectedConcept={selectedConcept}
            sidebarOpen={conceptSidebarOpen}
            setSidebarOpen={setConceptSidebarOpen}
            setSelectedConceptId={setSelectedConceptId}
            addHighlight={addHighlight}
            clearHighlights={() =>
              updateState((current) => ({
                ...current,
                highlights: current.highlights.filter((mark) => mark.conceptId !== selectedConcept.id)
              }))
            }
            renderMarkedText={renderMarkedText}
          />
        )}

        {(view === "subject-1" || view === "subject-2" || view === "subject-3") && (
          <QuestionView
            subjectId={view}
            questionIndex={selectedQuestions[view]}
            setQuestionIndex={(index) => setSelectedQuestions((current) => ({ ...current, [view]: index }))}
            answers={answers}
            setAnswers={setAnswers}
            attemptsByQuestion={attemptsByQuestion}
            hintProgress={state.hintProgress}
            showNextHint={showNextHint}
            submitQuestion={submitQuestion}
          />
        )}

        {view === "practice" && (
          <PracticeView
            drafts={state.practiceDrafts}
            submissions={state.practiceSubmissions}
            setDraft={(practiceId, sql) =>
              updateState((current) => ({ ...current, practiceDrafts: { ...current.practiceDrafts, [practiceId]: sql } }))
            }
            submitPractice={submitPractice}
          />
        )}

        {view === "wrong" && <WrongView wrongAttempts={wrongAttempts} />}
        {view === "notes" && selectedNote && (
          <NotesView
            notes={state.notes.filter((note) => !note.trashed)}
            selectedNote={selectedNote}
            sidebarOpen={notesSidebarOpen}
            setSidebarOpen={setNotesSidebarOpen}
            setSelectedNoteId={setSelectedNoteId}
            addNote={addNote}
            updateNoteTitle={(title) =>
              updateState((current) => ({
                ...current,
                notes: current.notes.map((note) => (note.id === selectedNote.id ? { ...note, title, updatedAt: nowIso() } : note))
              }))
            }
            updateNoteBlock={updateNoteBlock}
            addNoteBlock={addNoteBlock}
          />
        )}

        {view === "bookmarks" && <SimplePanel title="북마크" body="문제·개념·실습 북마크 저장 구조는 준비됐고, 화면 연결은 다음 UI 배치에서 붙입니다." />}
        {view === "mock" && <SimplePanel title="모의고사" body="모의고사는 승인 콘텐츠가 충분히 쌓인 뒤 과목별 배점과 제한시간을 반영해 열 예정입니다." />}
        {view === "stats" && <StatsView />}
        {view === "tutor" && <SimplePanel title="AI 튜터" body="AI 튜터는 서버 API에서 승인된 해설을 근거로 답변하도록 연결합니다. 현재 Preview에서는 Mock/준비 중으로 표시합니다." />}
        {view === "settings" && <SimplePanel title="사용자 설정" body="로그인, 저장 상태, 데이터 동기화 정책을 확인하는 설정 화면입니다." />}
        {view === "admin" && <AdminView />}
      </section>
    </main>
  );
}

function viewTitle(view: View) {
  const titles: Record<View, string> = {
    dashboard: "나의 학습 현황",
    concepts: "SQLP 개념 정리",
    "subject-1": "1과목 문제풀이",
    "subject-2": "2과목 문제풀이",
    "subject-3": "3과목 문제풀이",
    practice: "SQLP 실습",
    mock: "모의고사",
    wrong: "오답노트",
    bookmarks: "북마크",
    notes: "개인 노트",
    stats: "학습 통계",
    tutor: "AI 튜터",
    settings: "사용자 설정",
    admin: "관리자 콘텐츠 관리"
  };
  return titles[view];
}

function Dashboard({
  accuracy,
  solvedCount,
  correctCount,
  dday,
  nearestExam,
  calendar,
  todos,
  newTodo,
  setNewTodo,
  addTodo,
  toggleTodo,
  attemptsByQuestion,
  wrongAttempts
}: {
  accuracy: number;
  solvedCount: number;
  correctCount: number;
  dday: number;
  nearestExam: { round: string; date: string; apply: string };
  calendar: Array<{ key: string; day: string; count: number; today: boolean }>;
  todos: Todo[];
  newTodo: string;
  setNewTodo: (value: string) => void;
  addTodo: () => void;
  toggleTodo: (id: string) => void;
  attemptsByQuestion: Map<string, Attempt>;
  wrongAttempts: Attempt[];
}) {
  return (
    <div className="dashboard-grid">
      <section className="study-hero">
        <div>
          <p className="eyebrow">SQLMate Study Room</p>
          <h2>가볍게 열고, 깊게 푸는 SQLP 루틴</h2>
          <p>오늘은 핵심 개념 1개, 문제 10개, 실습 Trace 1개를 목표로 잡아보세요.</p>
        </div>
        <div className="dday-card">
          <span>{nearestExam.round}</span>
          <strong>D-{Math.max(0, dday)}</strong>
          <small>{nearestExam.date} · 접수 {nearestExam.apply}</small>
        </div>
      </section>

      <section className="metric-strip">
        <Metric label="풀이 완료" value={`${solvedCount}문제`} sub="1차 승인 세트 기준" />
        <Metric label="정답률" value={`${accuracy}%`} sub={`${correctCount}개 정답`} />
        <Metric label="오답 복습" value={`${wrongAttempts.length}개`} sub="간격 반복 대상" />
        <Metric label="실습" value={`${approvedPracticeScenarios.length}개`} sub="Oracle 모의 계획" />
      </section>

      <section className="panel todo-panel">
        <div className="panel-heading">
          <div>
            <p className="eyebrow">오늘 할 일</p>
            <h2>직접 적고 체크하기</h2>
          </div>
        </div>
        <div className="todo-input">
          <input value={newTodo} onChange={(event) => setNewTodo(event.target.value)} onKeyDown={(event) => event.key === "Enter" && addTodo()} placeholder="예: SQL Trace 계산 20분 복습" />
          <button className="primary-button" onClick={addTodo} type="button">
            <Plus size={16} /> 추가
          </button>
        </div>
        <div className="todo-list">
          {todos.length === 0 && <p className="muted">아직 오늘 할 일이 없어요. 필요한 것만 짧게 적어두면 충분합니다.</p>}
          {todos.map((todo) => (
            <label key={todo.id} className="todo-row">
              <input checked={todo.completed} onChange={() => toggleTodo(todo.id)} type="checkbox" />
              <span>{todo.title}</span>
            </label>
          ))}
        </div>
      </section>

      <section className="panel progress-panel">
        <div className="panel-heading">
          <div>
            <p className="eyebrow">과목별 진행</p>
            <h2>승인 문제 풀이 현황</h2>
          </div>
        </div>
        {subjects.map((subject) => {
          const questions = approvedQuestions.filter((question) => question.subjectId === subject.id);
          const solved = questions.filter((question) => attemptsByQuestion.has(question.id)).length;
          const percent = Math.round((solved / questions.length) * 100);
          return (
            <div key={subject.id} className="progress-line">
              <div>
                <strong>{subject.label}</strong>
                <span>{subject.title}</span>
              </div>
              <div className="progress-track">
                <span style={{ width: `${percent}%` }} />
              </div>
              <b>{percent}%</b>
            </div>
          );
        })}
      </section>

      <section className="panel calendar-panel">
        <div className="panel-heading">
          <div>
            <p className="eyebrow">학습 달력</p>
            <h2>이번 달 기록</h2>
          </div>
        </div>
        <div className="study-calendar">
          {["일", "월", "화", "수", "목", "금", "토"].map((day) => (
            <strong key={day}>{day}</strong>
          ))}
          {calendar.map((day) => (
            <span key={day.key} className={`${day.today ? "today" : ""} heat-${Math.min(4, day.count)}`}>
              {day.day}
            </span>
          ))}
        </div>
      </section>
    </div>
  );
}

function Metric({ label, value, sub }: { label: string; value: string; sub: string }) {
  return (
    <div className="metric">
      <span>{label}</span>
      <strong>{value}</strong>
      <small>{sub}</small>
    </div>
  );
}

function ConceptsView({
  concepts,
  selectedConcept,
  sidebarOpen,
  setSidebarOpen,
  setSelectedConceptId,
  addHighlight,
  clearHighlights,
  renderMarkedText
}: {
  concepts: ConceptDocument[];
  selectedConcept: ConceptDocument;
  sidebarOpen: boolean;
  setSidebarOpen: (value: boolean) => void;
  setSelectedConceptId: (value: string) => void;
  addHighlight: (conceptId: string, color: HighlightMark["color"]) => void;
  clearHighlights: () => void;
  renderMarkedText: (conceptId: string, markKey: string, text: string) => React.ReactNode[];
}) {
  return (
    <div className={`split-view ${sidebarOpen ? "" : "collapsed"}`}>
      <aside className="content-list">
        <button className="ghost-button" onClick={() => setSidebarOpen(!sidebarOpen)} type="button">
          <ChevronLeft size={16} /> {sidebarOpen ? "목록 접기" : "목록 열기"}
        </button>
        {concepts.map((concept) => (
          <button key={concept.id} className={`list-card ${selectedConcept.id === concept.id ? "active" : ""}`} onClick={() => setSelectedConceptId(concept.id)} type="button">
            <small>{concept.subjectName}</small>
            <strong>{concept.title}</strong>
            <span>{concept.minorTopic}</span>
          </button>
        ))}
      </aside>
      <article className="reader panel">
        <div className="panel-heading">
          <div>
            <p className="eyebrow">{selectedConcept.majorTopic}</p>
            <h2>{selectedConcept.title}</h2>
          </div>
          <div className="mark-tools">
            {(["yellow", "green", "pink", "blue"] as const).map((color) => (
              <button key={color} className={`swatch mark-${color}`} onClick={() => addHighlight(selectedConcept.id, color)} title={`${color} 형광펜`} type="button" />
            ))}
            <button className="ghost-button" onClick={clearHighlights} type="button">
              <Trash2 size={15} /> 모든 마킹 지우기
            </button>
          </div>
        </div>
        <p className="reader-summary" data-mark-key={`${selectedConcept.id}:summary`} data-mark-text={selectedConcept.summary}>
          {renderMarkedText(selectedConcept.id, `${selectedConcept.id}:summary`, selectedConcept.summary)}
        </p>
        {selectedConcept.sections.map((section, sectionIndex) => (
          <section key={section.title} className="concept-section">
            <h3>{section.title}</h3>
            {section.body?.map((body, index) => {
              const key = `${selectedConcept.id}:section:${sectionIndex}:body:${index}`;
              return (
                <p key={key} data-mark-key={key} data-mark-text={body}>
                  {renderMarkedText(selectedConcept.id, key, body)}
                </p>
              );
            })}
            {section.bullets && (
              <ul>
                {section.bullets.map((item, index) => {
                  const key = `${selectedConcept.id}:section:${sectionIndex}:bullet:${index}`;
                  return (
                    <li key={key} data-mark-key={key} data-mark-text={item}>
                      {renderMarkedText(selectedConcept.id, key, item)}
                    </li>
                  );
                })}
              </ul>
            )}
            {section.table && <DataTable headers={section.table.headers} rows={section.table.rows} />}
          </section>
        ))}
      </article>
    </div>
  );
}

function QuestionView({
  subjectId,
  questionIndex,
  setQuestionIndex,
  answers,
  setAnswers,
  attemptsByQuestion,
  hintProgress,
  showNextHint,
  submitQuestion
}: {
  subjectId: SqlpSubjectId;
  questionIndex: number;
  setQuestionIndex: (index: number) => void;
  answers: Record<string, string[]>;
  setAnswers: React.Dispatch<React.SetStateAction<Record<string, string[]>>>;
  attemptsByQuestion: Map<string, Attempt>;
  hintProgress: Record<string, number>;
  showNextHint: (questionId: string) => void;
  submitQuestion: (question: SqlpQuestion) => void;
}) {
  const questions = approvedQuestions.filter((question) => question.subjectId === subjectId);
  const question = questions[Math.min(questionIndex, questions.length - 1)];
  const attempt = attemptsByQuestion.get(question.id);
  const visibleHints = question.hints.slice(0, hintProgress[question.id] ?? 0);

  function updateAnswer(value: string, checked = true) {
    setAnswers((current) => {
      if (question.answer.kind === "choices") {
        const existing = new Set(current[question.id] ?? []);
        if (checked) existing.add(value);
        else existing.delete(value);
        return { ...current, [question.id]: Array.from(existing) };
      }
      return { ...current, [question.id]: [value] };
    });
  }

  const currentAnswer = answers[question.id] ?? [];
  const allSolved = questions.every((item) => attemptsByQuestion.has(item.id));

  return (
    <div className="question-layout">
      <aside className="question-index panel">
        <p className="eyebrow">{subjects.find((subject) => subject.id === subjectId)?.title}</p>
        <div className="question-dots">
          {questions.map((item, index) => (
            <button key={item.id} className={`${questionIndex === index ? "active" : ""} ${attemptsByQuestion.get(item.id)?.correct ? "correct" : attemptsByQuestion.has(item.id) ? "wrong" : ""}`} onClick={() => setQuestionIndex(index)} type="button">
              {index + 1}
            </button>
          ))}
        </div>
        {allSolved && (
          <div className="review-box">
            <strong>1차 승인 세트 완료</strong>
            <p>추가 문제는 관리자 검수 대기 풀로 생성 후 approved 상태가 되면 이어서 공개하도록 설계했습니다.</p>
          </div>
        )}
      </aside>
      <section className="question-card panel">
        <div className="question-meta">
          <span>{question.majorTopic}</span>
          <span>{question.type}</span>
          <span>{question.difficulty}</span>
          <span>{question.expectedMinutes}분</span>
        </div>
        <h2>
          {questionIndex + 1}. {question.prompt}
        </h2>
        {question.passage && <pre className="passage">{question.passage}</pre>}
        {question.sql && <pre className="code-block">{question.sql}</pre>}
        {question.table && <DataTable headers={question.table.headers} rows={question.table.rows} />}

        {question.choices ? (
          <div className="choice-list">
            {question.choices.map((choice) => {
              const checked = currentAnswer.includes(choice.id);
              return (
                <label key={choice.id} className={`choice-row ${checked ? "selected" : ""}`}>
                  <input
                    checked={checked}
                    onChange={(event) => updateAnswer(choice.id, event.target.checked)}
                    type={question.answer.kind === "choices" ? "checkbox" : "radio"}
                    name={question.id}
                  />
                  <span>{choice.id}</span>
                  <strong>{choice.text}</strong>
                </label>
              );
            })}
          </div>
        ) : (
          <textarea
            className="answer-box"
            value={currentAnswer[0] ?? ""}
            onChange={(event) => updateAnswer(event.target.value)}
            placeholder="답안을 입력하세요."
          />
        )}

        <div className="hint-list">
          {visibleHints.map((hint) => (
            <HintCard key={hint.level} hint={hint} />
          ))}
        </div>

        <div className="question-actions">
          <button className="ghost-button" onClick={() => showNextHint(question.id)} disabled={(hintProgress[question.id] ?? 0) >= 3} type="button">
            <Sparkles size={16} /> 힌트 보기
          </button>
          <button className="primary-button" onClick={() => submitQuestion(question)} type="button">
            <CheckCircle2 size={16} /> 제출
          </button>
        </div>

        {attempt && (
          <div className={`result-box ${attempt.correct ? "correct" : "wrong"}`}>
            <h3>{attempt.correct ? "정답입니다" : "다시 복습할 문제입니다"}</h3>
            <p>
              정답: <strong>{answerText(question)}</strong>
            </p>
            <p>{question.explanation}</p>
            <ul>
              {question.wrongAnswerNotes.map((note) => (
                <li key={note}>{note}</li>
              ))}
            </ul>
          </div>
        )}
      </section>
    </div>
  );
}

function PracticeView({
  drafts,
  submissions,
  setDraft,
  submitPractice
}: {
  drafts: Record<string, string>;
  submissions: PracticeSubmission[];
  setDraft: (practiceId: string, sql: string) => void;
  submitPractice: (scenario: PracticeScenario) => void;
}) {
  const [selectedId, setSelectedId] = useState(approvedPracticeScenarios[0].id);
  const scenario = approvedPracticeScenarios.find((item) => item.id === selectedId) ?? approvedPracticeScenarios[0];
  const latest = [...submissions].reverse().find((item) => item.practiceId === scenario.id);

  return (
    <div className="practice-grid">
      <aside className="content-list">
        {approvedPracticeScenarios.map((item) => (
          <button key={item.id} className={`list-card ${scenario.id === item.id ? "active" : ""}`} onClick={() => setSelectedId(item.id)} type="button">
            <small>{item.area}</small>
            <strong>{item.title}</strong>
            <span>{item.difficulty}</span>
          </button>
        ))}
      </aside>
      <section className="panel practice-main">
        <p className="eyebrow">Oracle 모의 실행계획 분석 모드</p>
        <h2>{scenario.title}</h2>
        <p>{scenario.scenario}</p>
        <div className="lab-section">
          <h3>요구사항</h3>
          <p>{scenario.requirement}</p>
        </div>
        <div className="lab-section">
          <h3>현재 SQL</h3>
          <pre className="code-block">{scenario.currentSql}</pre>
        </div>
        <div className="lab-section">
          <h3>현재 실행계획</h3>
          <PlanTable plan={scenario.currentPlan} />
        </div>
        <div className="lab-section">
          <h3>Predicate Information</h3>
          <ul>
            {scenario.predicateInfo.map((line) => (
              <li key={line}>{line}</li>
            ))}
          </ul>
        </div>
        <textarea
          className="sql-editor"
          value={drafts[scenario.id] ?? ""}
          onChange={(event) => setDraft(scenario.id, event.target.value)}
          placeholder="여기에 튜닝 SQL 또는 힌트 전략을 작성하세요."
        />
        <button className="primary-button" onClick={() => submitPractice(scenario)} type="button">
          <Play size={16} /> 모의 채점
        </button>
        {latest && (
          <div className="result-box correct">
            <h3>최근 제출 점수 {latest.score}점</h3>
            <p>{scenario.explanation}</p>
            <p>모범 SQL</p>
            <pre className="code-block">{scenario.modelSql}</pre>
          </div>
        )}
      </section>
    </div>
  );
}

function NotesView({
  notes,
  selectedNote,
  sidebarOpen,
  setSidebarOpen,
  setSelectedNoteId,
  addNote,
  updateNoteTitle,
  updateNoteBlock,
  addNoteBlock
}: {
  notes: NoteDoc[];
  selectedNote: NoteDoc;
  sidebarOpen: boolean;
  setSidebarOpen: (value: boolean) => void;
  setSelectedNoteId: (value: string) => void;
  addNote: () => void;
  updateNoteTitle: (title: string) => void;
  updateNoteBlock: (noteId: string, blockId: string, text: string) => void;
  addNoteBlock: (noteId: string, type: NoteBlock["type"]) => void;
}) {
  return (
    <div className={`split-view notes-view ${sidebarOpen ? "" : "collapsed"}`}>
      <aside className="content-list">
        <div className="list-actions">
          <button className="ghost-button" onClick={() => setSidebarOpen(!sidebarOpen)} type="button">
            <ChevronLeft size={16} /> {sidebarOpen ? "목록 접기" : "목록 열기"}
          </button>
          <button className="primary-button" onClick={addNote} type="button">
            <Plus size={16} /> 노트
          </button>
        </div>
        {notes.map((note) => (
          <button key={note.id} className={`list-card ${selectedNote.id === note.id ? "active" : ""}`} onClick={() => setSelectedNoteId(note.id)} type="button">
            <strong>{note.title}</strong>
            <span>{new Intl.DateTimeFormat("ko-KR").format(new Date(note.updatedAt))}</span>
          </button>
        ))}
      </aside>
      <section className="panel note-editor">
        <input className="note-title-input" value={selectedNote.title} onChange={(event) => updateNoteTitle(event.target.value)} />
        <div className="block-toolbar">
          {(["paragraph", "heading", "bullet", "check", "code"] as const).map((type) => (
            <button key={type} className="ghost-button" onClick={() => addNoteBlock(selectedNote.id, type)} type="button">
              {type}
            </button>
          ))}
        </div>
        {selectedNote.blocks.map((block) => (
          <textarea
            key={block.id}
            className={`note-block note-${block.type}`}
            value={block.text}
            onChange={(event) => updateNoteBlock(selectedNote.id, block.id, event.target.value)}
            placeholder={block.type === "code" ? "SQL 코드" : "내용을 입력하세요"}
          />
        ))}
      </section>
    </div>
  );
}

function WrongView({ wrongAttempts }: { wrongAttempts: Attempt[] }) {
  return (
    <section className="panel">
      <p className="eyebrow">Spaced Review</p>
      <h2>오답노트</h2>
      {wrongAttempts.length === 0 ? (
        <p className="muted">아직 오답이 없습니다. 틀린 문제는 자동으로 이곳에 쌓입니다.</p>
      ) : (
        <div className="wrong-list">
          {wrongAttempts.map((attempt) => {
            const question = approvedQuestions.find((item) => item.id === attempt.questionId);
            if (!question) return null;
            return (
              <article key={attempt.questionId} className="wrong-card">
                <strong>{question.prompt}</strong>
                <p>내 답: {attempt.submitted.join(", ")} · 정답: {answerText(question)}</p>
                <p>{question.explanation}</p>
              </article>
            );
          })}
        </div>
      )}
    </section>
  );
}

function StatsView() {
  const distribution = summarizeDistribution(approvedQuestions);
  return (
    <section className="panel">
      <p className="eyebrow">Content Distribution</p>
      <h2>현재 승인 콘텐츠 분포</h2>
      <DataTable
        headers={["구분", "수량"]}
        rows={[
          ...Object.entries(distribution.bySubject).map(([key, value]) => [key, String(value)]),
          ...Object.entries(distribution.byType).map(([key, value]) => [key, String(value)]),
          ...Object.entries(distribution.byDifficulty).map(([key, value]) => [key, String(value)])
        ]}
      />
    </section>
  );
}

function AdminView() {
  return (
    <section className="panel">
      <p className="eyebrow">Review Workflow</p>
      <h2>관리자 콘텐츠 관리</h2>
      <div className="metric-strip">
        <Metric label="승인 문제" value={`${approvedQuestions.length}개`} sub="1차 품질 세트" />
        <Metric label="승인 실습" value={`${approvedPracticeScenarios.length}개`} sub="Oracle 모의 계획" />
        <Metric label="개념 문서" value={`${approvedConceptDocuments.length}개`} sub="단권화 노트" />
        <Metric label="검수 대기" value="0개" sub="DB 적용 후 관리" />
      </div>
      <p className="muted">생성 콘텐츠는 DB 스키마상 review_required로 저장하고, 관리자 검수 후 approved가 되어야 일반 사용자에게 공개됩니다.</p>
    </section>
  );
}

function SimplePanel({ title, body }: { title: string; body: string }) {
  return (
    <section className="panel">
      <p className="eyebrow">SQLMate</p>
      <h2>{title}</h2>
      <p>{body}</p>
    </section>
  );
}

function HintCard({ hint }: { hint: HintStep }) {
  return (
    <div className="hint-card">
      <strong>
        {hint.level}단계 · {hint.title}
      </strong>
      <p>{hint.body}</p>
    </div>
  );
}

function DataTable({ headers, rows }: { headers: string[]; rows: string[][] }) {
  return (
    <div className="table-wrap">
      <table>
        <thead>
          <tr>
            {headers.map((header) => (
              <th key={header}>{header}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, rowIndex) => (
            <tr key={`${row.join(":")}-${rowIndex}`}>
              {row.map((cell, index) => (
                <td key={`${cell}-${index}`}>{cell}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function PlanTable({ plan }: { plan: PracticeScenario["currentPlan"] }) {
  return (
    <DataTable
      headers={["Id", "Operation", "Object", "Starts", "Rows", "CR", "PR", "Predicate"]}
      rows={plan.map((op) => [
        String(op.id),
        `${op.parentId ? "  ".repeat(Math.min(4, op.id)) : ""}${op.operation}`,
        op.objectName ?? "",
        String(op.starts),
        String(op.rows),
        String(op.cr ?? ""),
        String(op.pr ?? ""),
        op.accessPredicate ? `access(${op.accessPredicate})` : op.filterPredicate ? `filter(${op.filterPredicate})` : ""
      ])}
    />
  );
}
