import Link from "next/link";
import {
  findUserVisibleQualityIssues,
  pdfReviewItems,
  pdfReviewQuestions,
  pdfReviewSummary,
  type PdfReviewItem,
  type PdfReviewLab,
  type PdfReviewQuestion
} from "@/lib/pdf-review-bank";

const modeLabels = {
  original: "Original",
  variant: "Safe Variant",
  similar: "Similar"
} as const;

function answerLabel(question: PdfReviewQuestion) {
  return Array.isArray(question.answer) ? question.answer.join(", ") : question.answer;
}

function MetaPanel({ item }: { item: PdfReviewItem }) {
  return (
    <aside className="pdf-review-meta" aria-label="관리자 검수 정보">
      <div className="panel-mini-heading">
        <strong>관리자 검수 정보</strong>
        <span className="pill">{modeLabels[item.mode]}</span>
      </div>
      <dl>
        <div>
          <dt>상태</dt>
          <dd>{item.status}</dd>
        </div>
        <div>
          <dt>원본</dt>
          <dd>{item.source.document}</dd>
        </div>
        <div>
          <dt>페이지</dt>
          <dd>
            p.{item.source.page}
            {item.source.answerPage ? ` / 해설 p.${item.source.answerPage}` : ""}
          </dd>
        </div>
        <div>
          <dt>문항</dt>
          <dd>{item.source.questionNumber}</dd>
        </div>
      </dl>
      <p>{item.source.verificationNote}</p>
      {item.validationNotes.length > 0 && (
        <ul>
          {item.validationNotes.map((note) => (
            <li key={note}>{note}</li>
          ))}
        </ul>
      )}
    </aside>
  );
}

function QuestionPreview({ question }: { question: PdfReviewQuestion }) {
  return (
    <article className="pdf-user-preview" aria-label="일반 사용자 문제풀이 미리보기">
      <div className="wrong-note-meta">
        <span className="pill">{question.subjectName}</span>
        <span className="pill">{question.majorTopic}</span>
        <span className="pill">{question.difficulty}</span>
      </div>
      <h3>{question.stem}</h3>
      {question.passage && <p className="wrong-note-passage">{question.passage}</p>}
      {question.table && (
        <div className="exam-table-wrap wrong-table-wrap">
          <table>
            <thead>
              <tr>
                {question.table.headers.map((header) => (
                  <th key={header}>{header}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {question.table.rows.map((row, rowIndex) => (
                <tr key={`${question.id}-row-${rowIndex}`}>
                  {row.map((cell, cellIndex) => (
                    <td key={`${question.id}-cell-${rowIndex}-${cellIndex}`}>{cell}</td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      {question.code && (
        <div className="wrong-code-block">
          <span>SQL</span>
          <pre>{question.code}</pre>
        </div>
      )}
      <div className="choice-list">
        {question.choices.map((choice) => (
          <div className="choice" key={choice.id}>
            <strong>{choice.id}</strong>
            <span>{choice.text}</span>
          </div>
        ))}
      </div>
      <section className="wrong-note-section compact">
        <h4>제출 후 표시 영역</h4>
        <p>
          정답: <strong>{answerLabel(question)}</strong>
        </p>
        <p>{question.explanation}</p>
        <div className="choice-explanations">
          <strong>선택지별 해설</strong>
          {question.choices.map((choice) => (
            <div className="choice-explanation" key={`${question.id}-explain-${choice.id}`}>
              <b>{choice.id}</b>
              <p>{choice.explanation}</p>
            </div>
          ))}
        </div>
      </section>
      <div className="related-concept-actions">
        <strong>관련 개념</strong>
        <span className="pill">{question.relatedConcept}</span>
      </div>
    </article>
  );
}

function LabPreview({ lab }: { lab: PdfReviewLab }) {
  return (
    <article className="pdf-user-preview" aria-label="일반 사용자 SQL Practice 미리보기">
      <div className="wrong-note-meta">
        <span className="pill">SQL Practice</span>
        <span className="pill">{lab.topic}</span>
        <span className="pill">{lab.difficulty}</span>
      </div>
      <h3>{lab.title}</h3>
      <p className="wrong-note-passage">{lab.scenario}</p>
      <section className="wrong-note-section compact">
        <h4>요구사항</h4>
        <ul>
          {lab.requirements.map((requirement) => (
            <li key={requirement}>{requirement}</li>
          ))}
        </ul>
      </section>
      <div className="wrong-code-block">
        <span>Schema</span>
        <pre>{lab.schemaSql}</pre>
      </div>
      {lab.currentSql && (
        <div className="wrong-code-block">
          <span>Current SQL</span>
          <pre>{lab.currentSql}</pre>
        </div>
      )}
      {lab.executionPlan && (
        <div className="wrong-code-block">
          <span>Execution Plan</span>
          <pre>{lab.executionPlan}</pre>
        </div>
      )}
      {lab.traceSummary && (
        <div className="exam-table-wrap wrong-table-wrap">
          <table>
            <thead>
              <tr>
                {lab.traceSummary.headers.map((header) => (
                  <th key={header}>{header}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {lab.traceSummary.rows.map((row, rowIndex) => (
                <tr key={`${lab.id}-trace-${rowIndex}`}>
                  {row.map((cell, cellIndex) => (
                    <td key={`${lab.id}-trace-cell-${rowIndex}-${cellIndex}`}>{cell}</td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      <section className="wrong-note-section compact">
        <h4>모범 답안</h4>
        <div className="wrong-code-block">
          <span>SQL</span>
          <pre>{lab.answerSql}</pre>
        </div>
        <p>{lab.explanation}</p>
      </section>
    </article>
  );
}

export default function PdfReviewPage() {
  const qualityIssues = findUserVisibleQualityIssues();
  const objectiveCountBySubject = ["1과목", "2과목", "3과목"].map((subjectName) => ({
    subjectName,
    count: pdfReviewQuestions.filter((question) => question.subjectName === subjectName).length
  }));

  return (
    <main className="workspace pdf-review-page">
      <div className="topbar">
        <div>
          <p className="eyebrow">PDF Review Gate</p>
          <h1>PDF 원문 기반 35문제 검수 세트</h1>
        </div>
        <div className="top-actions">
          <Link href="/" className="ghost-button">
            SQLMate로 돌아가기
          </Link>
        </div>
      </div>

      <section className="pdf-review-summary">
        <div>
          <span>전체</span>
          <strong>{pdfReviewSummary.total}</strong>
        </div>
        <div>
          <span>필기</span>
          <strong>{pdfReviewSummary.objectives}</strong>
        </div>
        <div>
          <span>SQL Practice</span>
          <strong>{pdfReviewSummary.labs}</strong>
        </div>
        <div>
          <span>품질 차단 이슈</span>
          <strong>{qualityIssues.length}</strong>
        </div>
      </section>

      <section className="pdf-review-status">
        <div className="panel-heading">
          <div>
            <p className="eyebrow">Coverage</p>
            <h2>검수 세트 구성</h2>
          </div>
        </div>
        <div className="pdf-review-chip-row">
          {objectiveCountBySubject.map((subject) => (
            <span className="pill" key={subject.subjectName}>
              {subject.subjectName} {subject.count}문제
            </span>
          ))}
          <span className="pill">SQL Practice {pdfReviewSummary.labs}문제</span>
          <span className="pill">Original {pdfReviewSummary.byMode.original ?? 0}</span>
          <span className="pill">Variant {pdfReviewSummary.byMode.variant ?? 0}</span>
          <span className="pill">Similar {pdfReviewSummary.byMode.similar ?? 0}</span>
        </div>
        {qualityIssues.length > 0 ? (
          <p className="empty">사용자 표시 필드에 금지 패턴이 남아 있어 게시가 차단됩니다.</p>
        ) : (
          <p className="small-muted">사용자 표시 필드에서 깨진 문자, 검수 상태, PDF 파일명, generationMode 등 관리자 메타데이터가 검출되지 않았습니다.</p>
        )}
      </section>

      <section className="pdf-review-list">
        {pdfReviewItems.map((item) => (
          <div className="pdf-review-card" key={item.id}>
            <MetaPanel item={item} />
            {item.kind === "objective" ? <QuestionPreview question={item} /> : <LabPreview lab={item} />}
          </div>
        ))}
      </section>
    </main>
  );
}
