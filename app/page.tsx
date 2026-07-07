"use client";

import {
  BarChart3,
  BookOpen,
  Brain,
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
  Save,
  ShieldCheck,
  Sparkles,
  XCircle
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { containsUnsafeSql, gradeSqlSubmission, isChoiceCorrect } from "@/lib/grading";
import { conceptArticles, createLocalExtraQuestion, labQuestions, objectiveQuestions, subjects } from "@/lib/problem-bank";
import { getSupabaseBrowserClient, isSupabaseConfigured } from "@/lib/supabase-client";
import type {
  AnswerRecord,
  AttemptRecord,
  ChoiceId,
  ConceptMark,
  ObjectiveQuestion,
  PersonalNote,
  StudyStatePayload,
  SubjectId,
  WrongNote
} from "@/lib/types";

type Section = "dashboard" | "practice" | "lab" | "wrong" | "concepts" | "notes";

const emptyState: StudyStatePayload = {
  answers: {},
  attempts: [],
  wrongNotes: {},
  conceptMarks: {},
  personalNotes: [],
  extraQuestions: []
};

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

function usePersistentState<T>(key: string, initialValue: T) {
  const [value, setValue] = useState<T>(() => {
    if (typeof window === "undefined") return initialValue;
    const saved = window.localStorage.getItem(key);
    return saved ? (JSON.parse(saved) as T) : initialValue;
  });

  useEffect(() => {
    window.localStorage.setItem(key, JSON.stringify(value));
  }, [key, value]);

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

export default function Home() {
  const [section, setSection] = useState<Section>("dashboard");
  const [activeSubject, setActiveSubject] = useState<SubjectId>("modeling");
  const [questionIndex, setQuestionIndex] = useState(0);
  const [selectedChoice, setSelectedChoice] = useState<ChoiceId | null>(null);
  const [hintVisible, setHintVisible] = useState(false);
  const [answers, setAnswers] = usePersistentState<Record<string, AnswerRecord>>("sqlmate.answers", emptyState.answers);
  const [attempts, setAttempts] = usePersistentState<AttemptRecord[]>("sqlmate.attempts", emptyState.attempts);
  const [wrongNotes, setWrongNotes] = usePersistentState<Record<string, WrongNote>>("sqlmate.wrongNotes", emptyState.wrongNotes);
  const [conceptMarks, setConceptMarks] = usePersistentState<Record<string, ConceptMark>>("sqlmate.conceptMarks", emptyState.conceptMarks);
  const [personalNotes, setPersonalNotes] = usePersistentState<PersonalNote[]>("sqlmate.personalNotes", emptyState.personalNotes);
  const [extraQuestions, setExtraQuestions] = usePersistentState<ObjectiveQuestion[]>("sqlmate.extraQuestions", emptyState.extraQuestions);
  const [selectedConceptId, setSelectedConceptId] = useState(conceptArticles[0]?.id ?? "");
  const [activeLabIndex, setActiveLabIndex] = useState(0);
  const [labSql, setLabSql] = useState("");
  const [labResult, setLabResult] = useState<ReturnType<typeof gradeSqlSubmission> | null>(null);
  const [remotePlan, setRemotePlan] = useState<{ mode: string; plan: string[]; message: string } | null>(null);
  const [cloudUser, setCloudUser] = useState<{ id: string; email?: string } | null>(null);
  const [cloudReady, setCloudReady] = useState(false);
  const [cloudStatus, setCloudStatus] = useState("데모 저장");
  const [isGenerating, setIsGenerating] = useState(false);

  const supabase = useMemo(() => getSupabaseBrowserClient(), []);
  const allQuestions = useMemo(() => [...objectiveQuestions, ...extraQuestions], [extraQuestions]);
  const subjectQuestions = useMemo(
    () => allQuestions.filter((question) => question.subjectId === activeSubject),
    [allQuestions, activeSubject]
  );
  const currentQuestion = subjectQuestions[clampIndex(questionIndex, subjectQuestions.length)];
  const currentAnswer = currentQuestion ? answers[currentQuestion.id] : undefined;
  const selectedConcept = conceptArticles.find((concept) => concept.id === selectedConceptId) ?? conceptArticles[0];
  const activeLab = labQuestions[activeLabIndex];

  const completed = Object.keys(answers).length;
  const correct = Object.values(answers).filter((answer) => answer.correct).length;
  const accuracy = completed ? Math.round((correct / completed) * 100) : 0;
  const wrongCount = attempts.filter((attempt) => !attempt.correct).length;
  const highlightedCount = Object.values(conceptMarks).filter((mark) => mark.highlighted).length;

  const studyState = useMemo<StudyStatePayload>(
    () => ({
      answers,
      attempts,
      wrongNotes,
      conceptMarks,
      personalNotes,
      extraQuestions
    }),
    [answers, attempts, wrongNotes, conceptMarks, personalNotes, extraQuestions]
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
      return;
    }

    supabase.auth.getSession().then(({ data }) => {
      const user = data.session?.user;
      setCloudUser(user ? { id: user.id, email: user.email ?? undefined } : null);
    });

    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      const user = session?.user;
      setCloudUser(user ? { id: user.id, email: user.email ?? undefined } : null);
    });

    return () => {
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
  }, [cloudUser, setAnswers, setAttempts, setConceptMarks, setExtraQuestions, setPersonalNotes, setWrongNotes, supabase]);

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

  async function addExtraQuestion() {
    setIsGenerating(true);
    try {
      const response = await fetch("/api/ai", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "generate-question", subjectId: activeSubject, count: extraQuestions.length })
      });
      const data = (await response.json()) as { question?: ObjectiveQuestion };
      setExtraQuestions((prev) => [...prev, data.question ?? createLocalExtraQuestion(activeSubject, prev.length)]);
      setQuestionIndex(subjectQuestions.length);
    } catch {
      setExtraQuestions((prev) => [...prev, createLocalExtraQuestion(activeSubject, prev.length)]);
      setQuestionIndex(subjectQuestions.length);
    } finally {
      setIsGenerating(false);
    }
  }

  async function runLab() {
    const localResult = gradeSqlSubmission(activeLab, labSql);
    setLabResult(localResult);
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

  const wrongQuestionIds = Array.from(new Set(attempts.filter((attempt) => !attempt.correct).map((attempt) => attempt.questionId)));
  const navItems = [
    { id: "dashboard" as Section, label: "대시보드", icon: BarChart3 },
    { id: "practice" as Section, label: "문제풀이", icon: Brain },
    { id: "lab" as Section, label: "SQL 실습", icon: Database },
    { id: "wrong" as Section, label: "오답노트", icon: RotateCcw },
    { id: "concepts" as Section, label: "개념정리", icon: BookOpen },
    { id: "notes" as Section, label: "개인노트", icon: NotebookPen }
  ];

  return (
    <main className="app-shell">
      <aside className="sidebar">
        <div className="brand">
          <div className="brand-mark">SM</div>
          <div>
            <strong>SQLMate</strong>
            <span>SQLP 실전 학습</span>
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
            <p className="eyebrow">SQLP Coach Mode</p>
            <h1>{sectionTitle(section)}</h1>
          </div>
          <div className="top-actions">
            <span className="pill">{scoreLabel(accuracy)} · 정답률 {accuracy}%</span>
            {cloudUser ? (
              <button className="ghost-button" onClick={signOut}>
                <LogOut size={17} />
                로그아웃
              </button>
            ) : (
              <button className="primary-button" onClick={signInWithGoogle}>
                <LogIn size={17} />
                Google 로그인
              </button>
            )}
          </div>
        </header>

        {section === "dashboard" && (
          <div className="dashboard-grid">
            <StatCard label="풀이 완료" value={`${completed}문제`} detail={`전체 ${objectiveQuestions.length + extraQuestions.length}문제 중`} />
            <StatCard label="정답률" value={`${accuracy}%`} detail={`${correct}개 정답 · ${completed - correct}개 오답`} />
            <StatCard label="오답 복습" value={`${wrongQuestionIds.length}문제`} detail={`총 오답 시도 ${wrongCount}회`} />
            <StatCard label="개념 표시" value={`${highlightedCount}개`} detail={`개인 노트 ${personalNotes.length}개`} />

            <section className="wide-panel">
              <div className="panel-heading">
                <div>
                  <p className="eyebrow">Subject Progress</p>
                  <h2>과목별 학습 현황</h2>
                </div>
                <button className="ghost-button" onClick={() => setSection("practice")}>
                  <Brain size={17} />
                  이어 풀기
                </button>
              </div>
              <div className="subject-progress">
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
              </div>
            </section>

            <section className="plan-visual">
              <div className="panel-heading">
                <div>
                  <p className="eyebrow">Execution Plan Sense</p>
                  <h2>실기 대비 사고 흐름</h2>
                </div>
              </div>
              <div className="plan-map" aria-hidden="true">
                <span>요구사항</span>
                <span>데이터 모델</span>
                <span>인덱스</span>
                <span>조인 방식</span>
                <span>실행계획</span>
                <span>답안 SQL</span>
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
              <button className="primary-button full" onClick={addExtraQuestion} disabled={isGenerating}>
                <Plus size={17} />
                {isGenerating ? "생성 중" : "추가 문제"}
              </button>
              <div className="question-list">
                {subjectQuestions.slice(0, 120).map((question, index) => (
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
            <section className="subject-panel">
              {conceptArticles.map((concept) => (
                <button
                  key={concept.id}
                  className={concept.id === selectedConcept.id ? "subject-tab active" : "subject-tab"}
                  onClick={() => setSelectedConceptId(concept.id)}
                >
                  {concept.category}
                  <strong>{concept.title}</strong>
                </button>
              ))}
            </section>

            <section className={conceptMarks[selectedConcept.id]?.highlighted ? "concept-article highlighted" : "concept-article"}>
              <div className="panel-heading">
                <div>
                  <p className="eyebrow">{selectedConcept.category}</p>
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
                  <input value={note.title} onChange={(event) => updatePersonalNote(note.id, { title: event.target.value })} />
                  <textarea value={note.body} onChange={(event) => updatePersonalNote(note.id, { body: event.target.value })} />
                  <div className="note-footer">
                    <input value={note.tags} onChange={(event) => updatePersonalNote(note.id, { tags: event.target.value })} />
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
      return "오늘의 SQLP 학습";
    case "practice":
      return "객관식 문제풀이";
    case "lab":
      return "SQL 작성형 실습";
    case "wrong":
      return "오답 복습";
    case "concepts":
      return "SQLP 개념정리";
    case "notes":
      return "개인 노트";
  }
}

function StatCard({ label, value, detail }: { label: string; value: string; detail: string }) {
  return (
    <article className="stat-card">
      <span>{label}</span>
      <strong>{value}</strong>
      <p>{detail}</p>
    </article>
  );
}
