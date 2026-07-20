import type { ConceptDocument, HintStep, PracticeScenario, SqlpQuestion } from "@/lib/content/schema";

const version = "2026.07.20-quality-seed";

const officialScope = {
  type: "official_scope" as const,
  label: "KDATA SQLP 출제 기준 기반 자체 제작"
};

const pdfSource = (locator: string) => ({
  type: "user_pdf_adapted" as const,
  label: "사용자 제공 SQLP 3과목 복기 PDF 분석 기반 변형",
  locator
});

function h(a: string, b: string, c: string): HintStep[] {
  return [
    { level: 1, title: "풀이 방향", body: a },
    { level: 2, title: "핵심 조건", body: b },
    { level: 3, title: "직전 단서", body: c }
  ];
}

function q(question: Omit<SqlpQuestion, "status" | "version">): SqlpQuestion {
  return {
    ...question,
    status: "approved",
    version
  };
}

export const conceptDocuments: ConceptDocument[] = [
  {
    id: "concept-data-modeling-foundation",
    subjectId: "subject-1",
    subjectName: "1과목 데이터 모델링의 이해",
    majorTopic: "데이터 모델링의 이해",
    minorTopic: "데이터 모델과 성능",
    detailTopic: "모델링 관점, 3단계 모델링, 데이터 독립성",
    title: "데이터 모델링의 출발점: 관점, 단계, 독립성",
    summary:
      "SQLP 1과목은 용어 암기가 아니라 업무 규칙을 데이터 구조로 바꾸는 판단을 묻는다. 모델링의 관점, 개념/논리/물리 모델링, 데이터베이스 3단계 구조와 데이터 독립성은 엔터티·속성·관계·식별자 문제의 전제가 된다.",
    sections: [
      {
        title: "모델링의 세 가지 관점",
        body: [
          "데이터 관점은 업무가 지속적으로 관리해야 하는 명사형 대상을 찾는다. 고객, 주문, 계약, 상품처럼 업무 사건이 반복되어도 식별되어야 하는 정보가 중심이다.",
          "프로세스 관점은 업무가 무엇을 수행하는지 본다. 주문 접수, 결제 승인, 배송 처리처럼 행위와 절차가 중심이므로 데이터 모델에서는 CRUD 행렬이나 생명주기 검증으로 연결된다.",
          "상관 관점은 프로세스가 데이터에 어떤 변화를 일으키는지 본다. 어떤 프로세스가 어떤 엔터티를 생성, 조회, 수정, 삭제하는지 보지 못하면 필수 관계, 이력 관리, 상태 속성을 놓치기 쉽다."
        ],
        table: {
          headers: ["관점", "핵심 질문", "시험 함정"],
          rows: [
            ["데이터 관점", "업무가 장기적으로 관리해야 할 데이터는 무엇인가?", "프로세스 이름을 엔터티로 착각하지 않는다."],
            ["프로세스 관점", "업무는 어떤 절차로 데이터를 사용하거나 변경하는가?", "ERD 자체보다 CRUD·생명주기 검증과 연결된다."],
            ["상관 관점", "프로세스 수행 결과 데이터 상태가 어떻게 바뀌는가?", "상태 속성, 이력 엔터티, 선택 관계 판단에 직접 영향을 준다."]
          ]
        }
      },
      {
        title: "개념·논리·물리 모델링",
        bullets: [
          "개념 모델링은 업무 범위와 주요 엔터티를 큰 단위로 식별한다. 전사 데이터 관점, 핵심 업무 용어 통일, 주요 관계 발견이 목적이다.",
          "논리 모델링은 엔터티, 속성, 관계, 식별자, 정규화, 참조 무결성을 DBMS와 독립적으로 상세화한다. SQLP에서 가장 자주 판단 문제가 출제되는 단계다.",
          "물리 모델링은 테이블, 컬럼, 데이터 타입, 인덱스, 파티션, 반정규화, 저장 구조처럼 특정 DBMS 구현과 성능 제약을 반영한다.",
          "문제에서 업무 규칙을 가장 정확하게 반영한다고 하면 논리 모델링 관점이고, 성능을 위해 중복 컬럼을 둔다면 물리 모델링 또는 반정규화 관점이다."
        ]
      },
      {
        title: "3단계 스키마와 데이터 독립성",
        table: {
          headers: ["구조", "설명", "독립성 연결"],
          rows: [
            ["외부 스키마", "사용자나 프로그램이 보는 개별 뷰", "논리적 데이터 독립성의 보호 대상"],
            ["개념 스키마", "조직 전체 데이터의 논리적 통합 구조", "외부-개념 사상으로 여러 뷰를 통합"],
            ["내부 스키마", "저장 장치에 실제 배치되는 물리 구조", "물리적 데이터 독립성의 변경 대상"]
          ]
        },
        bullets: [
          "논리적 데이터 독립성은 개념 스키마 변경으로부터 외부 스키마와 응용 프로그램 영향을 최소화하는 성질이다.",
          "물리적 데이터 독립성은 인덱스 추가, 파일 구조 변경, 저장 위치 변경처럼 내부 스키마 변경의 영향을 최소화하는 성질이다."
        ]
      }
    ],
    relatedQuestionIds: ["s1-q01", "s1-q02", "s1-q03"],
    keywords: ["모델링 관점", "개념 모델링", "논리 모델링", "물리 모델링", "데이터 독립성"],
    source: officialScope,
    status: "approved",
    version
  },
  {
    id: "concept-index-scan-efficiency",
    subjectId: "subject-3",
    subjectName: "3과목 SQL 고급활용 및 튜닝",
    majorTopic: "인덱스 튜닝",
    minorTopic: "인덱스 스캔 효율화",
    detailTopic: "Access Predicate와 Filter Predicate",
    title: "인덱스 스캔 효율화: 적게 읽고 바로 버리게 만들지 않는 설계",
    summary:
      "인덱스 튜닝의 핵심은 인덱스를 사용했는지가 아니라 인덱스 안에서 얼마나 좁게, 얼마나 연속적으로, 얼마나 버리지 않고 읽었는지다. SQLP는 Access Predicate와 Filter Predicate의 차이, 결합 인덱스 선두 컬럼, BETWEEN·LIKE·함수·묵시적 변환, 테이블 랜덤 액세스까지 함께 묻는다.",
    sections: [
      {
        title: "인덱스 스캔 효율을 보는 순서",
        bullets: [
          "조건절이 인덱스 컬럼을 가공하지 않는 SARGable 형태인지 확인한다. `substr(col,1,6)`이나 `to_char(date_col,'yyyymm')`은 대개 Access Predicate를 Filter Predicate로 밀어낸다.",
          "결합 인덱스에서 선두 컬럼부터 등치 조건으로 닫히는지 본다. 선두 컬럼이 빠지면 Skip Scan 가능성이 있더라도 일반 Range Scan 효율은 급격히 떨어진다.",
          "등치 조건 다음 최초 범위 조건이 나오면 그 뒤 컬럼은 탐색 범위를 더 좁히지 못하고 필터 역할로 바뀔 수 있다.",
          "인덱스에서 얻은 ROWID로 테이블에 접근하는 횟수와 클러스터링 팩터를 본다. 인덱스 스캔이 좋아도 테이블 랜덤 액세스가 많으면 손익분기점을 넘는다.",
          "인덱스 컬럼 순서와 ORDER BY/GROUP BY가 맞으면 Sort 생략, STOPKEY, 부분범위 처리가 가능해진다."
        ]
      },
      {
        title: "Access와 Filter의 구분",
        table: {
          headers: ["구분", "의미", "성능 영향", "대표 예"],
          rows: [
            ["Access Predicate", "인덱스 탐색 시작점과 종료점을 결정한다.", "스캔 범위를 줄인다.", "IDX(A,B,C)에서 A=:a AND B=:b"],
            ["Filter Predicate", "읽은 인덱스 엔트리나 테이블 로우를 나중에 걸러낸다.", "읽은 뒤 버리므로 CR과 CPU가 늘어난다.", "A=:a AND C=:c, 또는 substr(A,1,2)='10'"],
            ["Table Filter", "ROWID로 테이블에 간 뒤 컬럼 조건을 검사한다.", "랜덤 액세스 후 버려 더 비싸다.", "인덱스에 없는 상태코드 조건"]
          ]
        }
      },
      {
        title: "시험에서 자주 틀리는 표현",
        bullets: [
          "인덱스를 사용했으므로 성능이 좋다는 표현은 틀릴 수 있다. Range Scan이 넓고 테이블 랜덤 액세스가 많으면 Full Scan보다 나쁠 수 있다.",
          "함수 기반 인덱스가 없는데 컬럼에 함수를 적용하면 일반 인덱스 Access가 어렵다.",
          "`LIKE '%ABC'`는 일반 B*Tree 인덱스에서 앞쪽 탐색 시작점을 잡을 수 없다. `LIKE 'ABC%'`와 다르다.",
          "OR 조건은 한쪽만 인덱스를 잘 타도 전체 조건 때문에 비효율이 생길 수 있어 OR Expansion, UNION ALL 분해, Bitmap 조합을 검토한다."
        ]
      }
    ],
    relatedQuestionIds: ["s3-q01", "s3-q02", "s3-q04", "lab-01", "lab-03"],
    keywords: ["Access Predicate", "Filter Predicate", "결합 인덱스", "랜덤 액세스", "STOPKEY"],
    source: pdfSource("PDF pp.36-42"),
    status: "approved",
    version
  },
  {
    id: "concept-sql-trace-tkprof",
    subjectId: "subject-3",
    subjectName: "3과목 SQL 고급활용 및 튜닝",
    majorTopic: "SQL 튜닝",
    minorTopic: "SQL Trace와 TKPROF",
    detailTopic: "Rows, Loop, CR, PR, Fetch 해석",
    title: "SQL Trace와 TKPROF: 실행계획보다 먼저 숫자를 읽는 법",
    summary:
      "SQL Trace는 튜닝 문제의 물증이다. Rows, Starts/Loop, CR, PR, Fetch, CPU, elapsed, wait를 함께 읽으면 실행계획 노드가 실제로 얼마나 반복되었고 어디서 논리 I/O가 폭증했는지 추론할 수 있다.",
    sections: [
      {
        title: "Trace 지표의 의미",
        table: {
          headers: ["지표", "의미", "읽는 법"],
          rows: [
            ["Parse", "SQL 파싱 횟수", "Parse가 Execute와 비슷하게 많으면 하드/소프트 파싱 비용을 의심한다."],
            ["Execute", "실행 호출 횟수", "OLTP 반복 실행 SQL은 1회 평균 값을 함께 본다."],
            ["Fetch", "결과를 가져온 호출 횟수", "Rows/Fetch로 Array Size와 네트워크 왕복 비용을 추론한다."],
            ["Rows", "반환 또는 처리 행 수", "상위 노드 Rows와 하위 노드 Rows 차이가 크면 필터링 낭비를 본다."],
            ["Query/CR", "일관 읽기 블록", "SELECT 중심 튜닝의 핵심 비용이다."],
            ["Current", "현재 모드 읽기", "DML, 인덱스 유지, 블록 변경과 연결된다."],
            ["Disk/PR", "물리 읽기", "캐시 미스, Full Scan, 대량 접근을 의심한다."]
          ]
        }
      },
      {
        title: "부모·자식 오퍼레이션 정합성",
        bullets: [
          "부모 Rows는 자식에서 올라온 행을 조인, 필터, 집계, 정렬한 결과다. 자식 Rows가 부모 Rows보다 훨씬 크면 그 위치에서 버려지는 행이 많다는 뜻이다.",
          "Nested Loops의 내부 테이블 Starts는 외부 입력 행 수와 거의 비례한다. 내부 인덱스 Range Scan Starts가 수만 회라면 반복 랜덤 액세스가 병목일 가능성이 높다.",
          "COUNT STOPKEY나 WINDOW NOSORT STOPKEY가 보이면 전체 정렬 없이 필요한 건수에서 멈출 수 있는지 확인한다."
        ]
      }
    ],
    relatedQuestionIds: ["s3-q03", "s3-q06", "lab-01", "lab-02"],
    keywords: ["SQL Trace", "TKPROF", "CR", "PR", "Fetch", "Rows per Execute"],
    source: pdfSource("PDF p.40"),
    status: "approved",
    version
  },
  {
    id: "concept-join-and-rewrite",
    subjectId: "subject-3",
    subjectName: "3과목 SQL 고급활용 및 튜닝",
    majorTopic: "조인 튜닝과 SQL Rewrite",
    minorTopic: "Join Order, Join Method, Query Transformation",
    detailTopic: "NL/Hash Join, OR Expansion, View Merging",
    title: "조인 튜닝과 Rewrite: 같은 결과를 더 적은 반복으로 만드는 법",
    summary:
      "SQL 튜닝 실습은 문장을 예쁘게 바꾸는 문제가 아니라 결과 보존과 접근 경로 제어를 동시에 요구한다. NL Join, Hash Join, 세미 조인, OR Expansion, View Merging, Predicate Pushing은 실행계획을 의도한 형태로 유도하는 핵심 도구다.",
    sections: [
      {
        title: "조인 방식 판단",
        table: {
          headers: ["방식", "좋은 상황", "위험 신호"],
          rows: [
            ["Nested Loops", "외부 집합이 작고 내부 접근이 인덱스로 빠를 때", "내부 Starts가 많고 테이블 랜덤 액세스가 폭증"],
            ["Hash Join", "큰 집합을 한 번씩 읽어 조인할 때", "빌드 입력이 너무 크거나 Workarea 부족으로 Temp 발생"],
            ["Sort Merge Join", "양쪽이 이미 정렬되어 있거나 범위 조인이 많을 때", "불필요한 Sort 비용과 Temp 사용"]
          ]
        }
      },
      {
        title: "Rewrite의 핵심 원칙",
        bullets: [
          "결과 집합이 바뀌면 튜닝이 아니다. OUTER JOIN을 INNER JOIN처럼 바꾸거나 NULL 처리 의미를 바꾸는 Rewrite는 오답이다.",
          "OR 조건은 서로 배타적인 분기로 UNION ALL 분해할 수 있으면 각 분기별 최적 인덱스를 사용할 수 있다.",
          "스칼라 서브쿼리가 행마다 반복되면 사전 집계 후 조인으로 바꾸는 것이 보통 유리하다.",
          "View Merging은 뷰 내부 조건과 외부 조건을 합쳐 더 좋은 계획을 만들 수 있지만, 집계·ROWNUM·분석 함수가 있으면 의미 보존 때문에 제한된다."
        ]
      }
    ],
    relatedQuestionIds: ["s3-q05", "s3-q07", "s3-q08", "lab-02"],
    keywords: ["NL Join", "Hash Join", "OR Expansion", "View Merging", "Predicate Pushing"],
    source: pdfSource("PDF pp.10-21"),
    status: "approved",
    version
  },
  {
    id: "concept-sql-core-semantics",
    subjectId: "subject-2",
    subjectName: "2과목 SQL 기본 및 활용",
    majorTopic: "SQL 기본 및 활용",
    minorTopic: "NULL, 집계, 분석 함수, 집합 연산",
    detailTopic: "논리 처리 순서와 결과 추론",
    title: "SQL 결과 추론 핵심: NULL, 집계, 분석 함수, 집합 연산",
    summary:
      "SQLP 필기에서 2과목은 문법 암기보다 결과 집합이 어떻게 변하는지 묻는다. NULL의 UNKNOWN, OUTER JOIN 조건 위치, GROUP BY 확장, 분석 함수의 행 보존성, UNION과 UNION ALL의 중복 처리 차이를 논리 처리 순서대로 읽어야 한다.",
    sections: [
      {
        title: "NULL과 3값 논리",
        bullets: [
          "WHERE 절은 TRUE인 행만 통과시킨다. FALSE뿐 아니라 UNKNOWN도 제거된다.",
          "NOT IN 서브쿼리에 NULL이 포함되면 `값 <> NULL`이 UNKNOWN이 되어 결과가 모두 제거될 수 있다.",
          "COUNT(*)는 행 수를 세지만 COUNT(expr)는 expr이 NULL인 행을 제외한다."
        ]
      },
      {
        title: "집계와 분석 함수",
        bullets: [
          "GROUP BY는 행을 그룹 단위로 줄이지만 분석 함수는 원래 행 수를 보존하면서 윈도우 계산 결과를 붙인다.",
          "ROLLUP(a,b)는 (a,b), (a), () 집계 레벨을 만든다. GROUPING 함수는 원천 NULL과 집계 NULL을 구분한다.",
          "ROW_NUMBER는 동점에도 유일 순번을 부여하고, RANK는 동점 다음 순위를 건너뛰며, DENSE_RANK는 건너뛰지 않는다."
        ]
      },
      {
        title: "결과 보존형 Rewrite",
        bullets: [
          "UNION은 중복 제거 비용이 있고 UNION ALL은 입력을 그대로 붙인다. 상호 배타성이 증명될 때만 UNION ALL로 결과를 보존할 수 있다.",
          "LEFT JOIN의 우측 테이블 조건을 WHERE에 두면 NULL 확장 행이 제거될 수 있다. 결과 보존 테이블을 먼저 판단한다.",
          "MERGE의 MATCHED/NOT MATCHED는 대상 테이블과 소스의 조인 매칭 여부로 결정된다."
        ]
      }
    ],
    relatedQuestionIds: ["s2-q01", "s2-q02", "s2-q03", "s2-q04", "s2-q05", "s2-q06", "s2-q07", "s2-q08", "s2-q09", "s2-q10"],
    keywords: ["NULL", "UNKNOWN", "COUNT", "ROLLUP", "GROUPING", "UNION ALL", "MERGE", "SAVEPOINT"],
    source: officialScope,
    status: "approved",
    version
  },
  {
    id: "concept-lock-concurrency",
    subjectId: "subject-3",
    subjectName: "3과목 SQL 고급활용 및 튜닝",
    majorTopic: "Lock과 동시성 제어",
    minorTopic: "트랜잭션 격리와 갱신 충돌",
    detailTopic: "Lost Update, SELECT FOR UPDATE, 낙관적 락",
    title: "Lock과 동시성: 읽기-계산-쓰기 사이의 틈을 제어하기",
    summary:
      "동시성 문제는 단일 SQL 문장의 정답보다 여러 세션이 같은 데이터를 어떤 순서로 읽고 변경하는지 해석하는 능력을 요구한다. Lost Update, 행 잠금, 원자적 갱신, 버전 조건은 SQLP 고급 활용 영역에서 반복 출제될 수 있는 핵심이다.",
    sections: [
      {
        title: "Lost Update가 생기는 흐름",
        bullets: [
          "세션 A와 B가 같은 잔액 100을 읽는다.",
          "A가 10 차감 후 90으로 UPDATE한다.",
          "B가 오래된 100을 기준으로 20 차감 후 80으로 UPDATE하면 A의 변경이 사라진다.",
          "문제는 UPDATE 문법이 아니라 조회 결과를 애플리케이션에서 오래 들고 있다가 조건 없이 덮어쓰는 흐름이다."
        ]
      },
      {
        title: "방지 방법",
        table: {
          headers: ["방법", "핵심", "주의점"],
          rows: [
            ["SELECT FOR UPDATE", "대상 행을 먼저 잠그고 계산한다.", "긴 트랜잭션이면 대기와 교착 위험이 커진다."],
            ["원자적 UPDATE", "balance = balance - :amt처럼 DB 안에서 계산한다.", "조건절에 잔액 부족 등 업무 검증을 포함한다."],
            ["낙관적 락", "version 컬럼을 WHERE 조건에 포함한다.", "갱신 건수 0이면 충돌로 보고 재시도 또는 오류 처리한다."]
          ]
        }
      }
    ],
    relatedQuestionIds: ["s3-q09"],
    keywords: ["Lost Update", "SELECT FOR UPDATE", "원자적 UPDATE", "낙관적 락", "교착"],
    source: officialScope,
    status: "approved",
    version
  }
];

export const sqlpQuestions: SqlpQuestion[] = [
  q({
    id: "s1-q01",
    subjectId: "subject-1",
    subjectName: "1과목 데이터 모델링의 이해",
    majorTopic: "데이터 모델링의 이해",
    minorTopic: "데이터 모델링의 중요성",
    detailTopic: "모델링 관점",
    difficulty: "intermediate",
    type: "combination",
    prompt: "다음 보기 중 데이터 모델링의 세 가지 관점에 대한 설명으로 옳은 것만 모두 고른 것은?",
    passage:
      "ㄱ. 데이터 관점은 업무가 지속적으로 관리해야 할 데이터와 데이터 간 관계를 파악한다.\nㄴ. 프로세스 관점은 데이터가 물리적으로 어떤 블록에 저장되는지 파악한다.\nㄷ. 상관 관점은 프로세스가 데이터에 생성·조회·수정·삭제 영향을 주는 방식을 파악한다.\nㄹ. 상관 관점은 CRUD 행렬과 데이터 생명주기 검증에 연결된다.",
    choices: [
      { id: "A", text: "ㄱ, ㄴ" },
      { id: "B", text: "ㄱ, ㄷ, ㄹ" },
      { id: "C", text: "ㄴ, ㄷ" },
      { id: "D", text: "ㄱ, ㄴ, ㄷ, ㄹ" }
    ],
    answer: { kind: "choice", value: "B" },
    explanation:
      "데이터 관점은 명사형 데이터와 관계, 프로세스 관점은 업무 행위와 절차, 상관 관점은 프로세스가 데이터에 미치는 CRUD 영향을 본다. 물리 블록 저장 방식은 물리 모델링 또는 저장 구조의 영역이지 프로세스 관점이 아니다.",
    wrongAnswerNotes: ["ㄴ은 프로세스 관점이 아니라 물리 저장 구조에 가깝다."],
    relatedConceptIds: ["concept-data-modeling-foundation"],
    hints: h("세 관점을 데이터·행위·영향으로 나누어 보세요.", "CRUD 행렬은 상관 관점과 연결됩니다.", "물리 블록 저장은 프로세스 관점이 아닙니다."),
    expectedMinutes: 2,
    source: officialScope
  }),
  q({
    id: "s1-q02",
    subjectId: "subject-1",
    subjectName: "1과목 데이터 모델링의 이해",
    majorTopic: "데이터 모델링의 이해",
    minorTopic: "데이터 모델링 단계",
    detailTopic: "개념·논리·물리 모델링",
    difficulty: "intermediate",
    type: "ordering",
    prompt: "다음 작업을 일반적인 데이터 모델링 진행 순서에 맞게 배열하라.",
    passage:
      "ㄱ. 엔터티, 속성, 관계, 식별자, 정규화를 상세화한다.\nㄴ. 테이블, 컬럼 타입, 인덱스, 파티션, 반정규화 방안을 결정한다.\nㄷ. 핵심 업무 영역과 주요 데이터 집합을 식별하고 업무 용어를 정리한다.",
    answer: { kind: "ordered", value: ["ㄷ", "ㄱ", "ㄴ"] },
    explanation:
      "개념 모델링에서 업무 범위와 핵심 데이터 집합을 식별하고, 논리 모델링에서 엔터티·속성·관계·정규화를 상세화한 뒤, 물리 모델링에서 DBMS 구현과 성능 요소를 반영한다.",
    wrongAnswerNotes: ["인덱스와 파티션은 물리 모델링 요소다."],
    relatedConceptIds: ["concept-data-modeling-foundation"],
    hints: h("가장 추상적인 작업부터 시작합니다.", "정규화는 DBMS 저장 구조보다 앞 단계입니다.", "인덱스와 파티션은 마지막 물리 구현 단계입니다."),
    expectedMinutes: 2,
    source: officialScope
  }),
  q({
    id: "s1-q03",
    subjectId: "subject-1",
    subjectName: "1과목 데이터 모델링의 이해",
    majorTopic: "데이터 모델링의 이해",
    minorTopic: "데이터 독립성",
    detailTopic: "3단계 스키마",
    difficulty: "basic",
    type: "fill_blank",
    prompt: "내부 저장 구조, 파일 배치, 인덱스 구성이 변경되어도 개념 스키마와 응용 프로그램 영향을 최소화하는 성질을 무엇이라 하는가?",
    answer: { kind: "text", value: "물리적 데이터 독립성", accepted: ["물리적", "물리"] },
    explanation:
      "내부 스키마 변경으로부터 개념 스키마와 외부 스키마를 보호하는 성질은 물리적 데이터 독립성이다. 논리적 데이터 독립성은 개념 스키마 변경으로부터 외부 스키마를 보호한다.",
    wrongAnswerNotes: ["논리적 독립성은 저장 구조가 아니라 개념 스키마 변경과 연결된다."],
    relatedConceptIds: ["concept-data-modeling-foundation"],
    hints: h("외부-개념-내부 스키마 중 내부 스키마 변경을 떠올리세요.", "인덱스와 저장 위치 변경은 물리 저장 구조입니다.", "정답은 논리적이 아니라 물리적입니다."),
    expectedMinutes: 1,
    source: officialScope
  }),
  q({
    id: "s1-q04",
    subjectId: "subject-1",
    subjectName: "1과목 데이터 모델링의 이해",
    majorTopic: "엔터티",
    minorTopic: "엔터티 도출",
    detailTopic: "엔터티 성립 조건",
    difficulty: "intermediate",
    type: "modeling_judgment",
    prompt: "온라인 강의 서비스에서 독립 엔터티로 가장 적절한 후보를 고르라.",
    passage:
      "회원이 강의를 수강 신청하면 수강신청번호가 발급된다. 결제 전에는 신청 상태가 대기이고 결제 완료 후 수강중으로 바뀐다. 강의별 진도율과 마지막 학습 위치를 저장해야 하며, 같은 회원은 같은 강의를 기간이 다르면 다시 신청할 수 있다.",
    choices: [
      { id: "A", text: "회원, 강의, 수강신청" },
      { id: "B", text: "회원, 강의, 신청상태" },
      { id: "C", text: "회원명, 강의명, 진도율" },
      { id: "D", text: "회원, 강의, 마지막학습위치" }
    ],
    answer: { kind: "choice", value: "A" },
    explanation:
      "수강신청은 회원과 강의 사이의 반복 가능한 업무 사건이며 별도 식별자, 상태, 기간, 진도율을 가진다. 신청상태와 마지막학습위치는 수강신청의 속성으로 보는 것이 자연스럽다.",
    wrongAnswerNotes: ["상태코드와 마지막 위치는 독립 생명주기가 없으면 속성이다."],
    relatedConceptIds: ["concept-data-modeling-foundation"],
    hints: h("반복 가능한 업무 사건을 찾으세요.", "같은 회원과 같은 강의가 기간별로 다시 생길 수 있습니다.", "수강신청번호가 발급되는 대상이 엔터티 후보입니다."),
    expectedMinutes: 3,
    source: officialScope
  }),
  q({
    id: "s1-q05",
    subjectId: "subject-1",
    subjectName: "1과목 데이터 모델링의 이해",
    majorTopic: "속성",
    minorTopic: "속성 분류",
    detailTopic: "기본·설계·파생 속성",
    difficulty: "basic",
    type: "true_false_combo",
    prompt: "속성 분류에 대한 참·거짓 조합으로 옳은 것을 고르라.",
    table: {
      headers: ["보기", "설명"],
      rows: [
        ["ㄱ", "주문금액 합계처럼 다른 속성으로 계산할 수 있는 값은 파생 속성이다."],
        ["ㄴ", "업무에서 자연스럽게 발생하지 않고 설계를 위해 만든 주문상태코드는 설계 속성으로 볼 수 있다."],
        ["ㄷ", "파생 속성은 항상 저장하면 안 되며 어떤 경우에도 모델에 표현하지 않는다."]
      ]
    },
    choices: [
      { id: "A", text: "ㄱ O, ㄴ O, ㄷ O" },
      { id: "B", text: "ㄱ O, ㄴ O, ㄷ X" },
      { id: "C", text: "ㄱ O, ㄴ X, ㄷ X" },
      { id: "D", text: "ㄱ X, ㄴ O, ㄷ X" }
    ],
    answer: { kind: "choice", value: "B" },
    explanation:
      "파생 속성도 성능이나 이력 보존이 필요하면 저장할 수 있다. 따라서 '항상 저장하면 안 된다'는 절대 표현이 틀렸다.",
    wrongAnswerNotes: ["항상, 무조건 표현은 모델링 문제에서 자주 함정이다."],
    relatedConceptIds: ["concept-data-modeling-foundation"],
    hints: h("파생 속성의 저장 가능 여부를 보세요.", "성능상 합계나 잔액을 저장하는 경우가 있습니다.", "ㄷ의 항상이 함정입니다."),
    expectedMinutes: 2,
    source: officialScope
  }),
  q({
    id: "s1-q06",
    subjectId: "subject-1",
    subjectName: "1과목 데이터 모델링의 이해",
    majorTopic: "관계",
    minorTopic: "식별·비식별 관계",
    detailTopic: "식별자 상속",
    difficulty: "advanced",
    type: "single_choice",
    prompt: "식별 관계와 비식별 관계에 대한 설명으로 가장 적절한 것은?",
    choices: [
      { id: "A", text: "부모 식별자가 자식 기본식별자에 포함되면 일반적으로 식별 관계로 본다." },
      { id: "B", text: "식별 관계는 항상 선택 관계로만 표현한다." },
      { id: "C", text: "비식별 관계에서는 참조 무결성을 표현할 수 없다." },
      { id: "D", text: "식별 관계는 성능이 나쁘므로 논리 모델링에서 사용하지 않는다." }
    ],
    answer: { kind: "choice", value: "A" },
    explanation:
      "식별 관계는 부모의 식별자가 자식의 기본식별자 구성에 포함되는 관계다. 식별/비식별 선택은 생명주기 종속성과 식별자 안정성을 보고 판단한다.",
    wrongAnswerNotes: ["비식별 관계에서도 FK는 가능하다."],
    relatedConceptIds: ["concept-data-modeling-foundation"],
    hints: h("자식의 기본식별자 구성을 보세요.", "부모 키가 자식 PK에 들어가면 무엇인가요?", "비식별 관계도 참조 무결성은 표현할 수 있습니다."),
    expectedMinutes: 2,
    source: officialScope
  }),
  q({
    id: "s1-q07",
    subjectId: "subject-1",
    subjectName: "1과목 데이터 모델링의 이해",
    majorTopic: "정규화",
    minorTopic: "함수 종속",
    detailTopic: "제2정규형",
    difficulty: "advanced",
    type: "modeling_judgment",
    prompt: "복합 기본식별자 (주문번호, 상품번호)를 가진 주문상세에서 상품명이 상품번호에만 종속된다. 제2정규형 위반을 제거하는 분해로 가장 적절한 것은?",
    choices: [
      { id: "A", text: "주문상세(주문번호, 상품번호, 주문수량), 상품(상품번호, 상품명), 주문(주문번호, 주문일자)" },
      { id: "B", text: "주문상세(주문번호, 상품번호, 상품명, 주문수량, 주문일자)" },
      { id: "C", text: "상품(상품번호, 상품명, 주문수량, 주문일자)" },
      { id: "D", text: "주문(주문번호, 상품번호, 주문수량), 상품(상품명, 주문일자)" }
    ],
    answer: { kind: "choice", value: "A" },
    explanation:
      "상품명은 복합키 전체가 아니라 상품번호에만 종속되는 부분 함수 종속이므로 상품 엔터티로 분리한다. 주문일자는 주문번호에 종속되므로 주문 헤더로 분리하는 것이 자연스럽다.",
    wrongAnswerNotes: ["복합키 일부에 종속된 속성이 제2정규형 위반이다."],
    relatedConceptIds: ["concept-data-modeling-foundation"],
    hints: h("복합 식별자 일부에만 종속되는 속성을 찾으세요.", "상품명은 상품번호만 알면 결정됩니다.", "주문일자는 주문번호에 종속됩니다."),
    expectedMinutes: 3,
    source: officialScope
  }),
  q({
    id: "s1-q08",
    subjectId: "subject-1",
    subjectName: "1과목 데이터 모델링의 이해",
    majorTopic: "반정규화",
    minorTopic: "반정규화 판단",
    detailTopic: "중복 컬럼과 집계 컬럼",
    difficulty: "intermediate",
    type: "multi_select",
    prompt: "반정규화를 검토할 수 있는 상황을 모두 고르라.",
    choices: [
      { id: "A", text: "정규화된 모델에서 빈번한 조인으로 응답 시간이 반복적으로 기준을 초과한다." },
      { id: "B", text: "업무 규칙이 불명확해서 데이터 중복으로 임시 해결하려 한다." },
      { id: "C", text: "대량 조회 화면에서 실시간 집계 비용이 과도하여 검증된 집계 컬럼을 유지할 수 있다." },
      { id: "D", text: "데이터 정합성 유지 방법 없이 같은 값을 여러 테이블에 저장한다." }
    ],
    answer: { kind: "choices", value: ["A", "C"] },
    explanation:
      "반정규화는 성능을 위해 중복을 의도적으로 도입하는 설계이며, 정합성 유지 수단과 성능 근거가 있어야 한다. 업무 규칙 미정이나 정합성 방안 없는 중복은 모델 품질 저하다.",
    wrongAnswerNotes: ["반정규화는 설계 근거와 정합성 유지 방안이 필수다."],
    relatedConceptIds: ["concept-data-modeling-foundation"],
    hints: h("반정규화는 성능 개선 목적이어야 합니다.", "정합성 유지 방안 없는 중복은 오답입니다.", "빈번한 조인과 실시간 집계 부담은 검토 사유가 됩니다."),
    expectedMinutes: 2,
    source: officialScope
  }),
  q({
    id: "s1-q09",
    subjectId: "subject-1",
    subjectName: "1과목 데이터 모델링의 이해",
    majorTopic: "식별자",
    minorTopic: "주식별자 특징",
    detailTopic: "유일성, 최소성, 불변성, 존재성",
    difficulty: "basic",
    type: "short_answer",
    prompt: "주식별자의 네 가지 대표 특성을 쓰라.",
    answer: { kind: "texts", value: ["유일성", "최소성", "불변성", "존재성"] },
    explanation:
      "주식별자는 엔터티 인스턴스를 유일하게 구분해야 하며, 불필요한 속성을 포함하지 않아야 하고, 업무적으로 안정적이며, 반드시 값이 존재해야 한다.",
    wrongAnswerNotes: ["업무 의미가 있는 이름이나 설명성은 주식별자의 대표 특성이 아니다."],
    relatedConceptIds: ["concept-data-modeling-foundation"],
    hints: h("각 인스턴스를 구분하는 기준입니다.", "불필요한 컬럼을 넣으면 어떤 성질이 깨질까요?", "유일성·최소성·불변성·존재성을 떠올리세요."),
    expectedMinutes: 1,
    source: officialScope
  }),
  q({
    id: "s1-q10",
    subjectId: "subject-1",
    subjectName: "1과목 데이터 모델링의 이해",
    majorTopic: "이력 모델링",
    minorTopic: "선분 이력",
    detailTopic: "기간 중복 방지",
    difficulty: "advanced",
    type: "essay",
    prompt: "고객 등급 이력을 시작일자와 종료일자로 관리할 때, 같은 고객의 기간이 겹치지 않게 설계·검증해야 하는 이유를 설명하라.",
    answer: { kind: "rubric", value: ["동일 시점 단일 등급 보장", "기간 중복 시 조회 결과 중복 또는 모호성 발생", "시작일자/종료일자 제약 또는 변경 로직 필요"] },
    explanation:
      "선분 이력은 특정 시점에 유효한 행이 하나로 결정되어야 한다. 기간이 겹치면 기준일 조회에서 두 등급이 동시에 조회되어 업무 의미가 모호해지고 조인 결과도 중복된다.",
    wrongAnswerNotes: ["이력 엔터티는 단순 로그가 아니라 기준시점 조회 가능성을 보장해야 한다."],
    relatedConceptIds: ["concept-data-modeling-foundation"],
    hints: h("기준일 조회 결과가 몇 건이어야 하는지 생각하세요.", "겹치는 기간은 같은 시점에 여러 상태를 만듭니다.", "고객번호와 기간의 제약, 종료일자 갱신 로직이 핵심입니다."),
    expectedMinutes: 4,
    source: officialScope
  }),
  q({
    id: "s2-q01",
    subjectId: "subject-2",
    subjectName: "2과목 SQL 기본 및 활용",
    majorTopic: "SQL 기본",
    minorTopic: "NULL",
    detailTopic: "NOT IN과 UNKNOWN",
    difficulty: "advanced",
    type: "result_inference",
    prompt: "EMP에는 DEPTNO 10, 30인 행이 각각 1건 있고, DEPT 서브쿼리 결과가 10, 20, NULL일 때 다음 SQL 결과 행 수는?",
    sql: "select * from emp e where e.deptno not in (select d.deptno from dept d);",
    choices: [
      { id: "A", text: "0건" },
      { id: "B", text: "1건, DEPTNO=30만 반환" },
      { id: "C", text: "2건" },
      { id: "D", text: "오류 발생" }
    ],
    answer: { kind: "choice", value: "A" },
    explanation:
      "NOT IN의 서브쿼리 결과에 NULL이 포함되면 비교 결과가 UNKNOWN이 되어 어떤 값도 TRUE가 되지 않는다. 30 <> NULL도 TRUE가 아니라 UNKNOWN이다.",
    wrongAnswerNotes: ["NULL이 섞인 NOT IN은 NOT EXISTS와 다르게 동작할 수 있다."],
    relatedConceptIds: ["concept-sql-core-semantics"],
    hints: h("NOT IN은 모든 값과 다르다는 조건입니다.", "비교 대상에 NULL이 있으면 어떤 일이 생길까요?", "30 <> NULL은 TRUE가 아니라 UNKNOWN입니다."),
    expectedMinutes: 2,
    source: officialScope
  }),
  q({
    id: "s2-q02",
    subjectId: "subject-2",
    subjectName: "2과목 SQL 기본 및 활용",
    majorTopic: "SQL 활용",
    minorTopic: "집계 함수",
    detailTopic: "COUNT와 NULL",
    difficulty: "basic",
    type: "fill_blank",
    prompt: "C1 값이 10, NULL, 20, NULL일 때 `select count(*), count(c1), sum(c1) from t`의 count(c1) 값은?",
    answer: { kind: "text", value: "2" },
    explanation: "COUNT(*)는 행 수를 모두 세지만 COUNT(컬럼)은 NULL을 제외한다. NULL이 아닌 값은 10과 20 두 건이다.",
    wrongAnswerNotes: ["COUNT(c1)은 NULL을 세지 않는다."],
    relatedConceptIds: ["concept-sql-core-semantics"],
    hints: h("COUNT(*)와 COUNT(expr)를 구분하세요.", "NULL인 C1 값은 COUNT(c1)에서 제외됩니다.", "NULL이 아닌 값은 10과 20 두 건입니다."),
    expectedMinutes: 1,
    source: officialScope
  }),
  q({
    id: "s2-q03",
    subjectId: "subject-2",
    subjectName: "2과목 SQL 기본 및 활용",
    majorTopic: "SQL 활용",
    minorTopic: "JOIN",
    detailTopic: "OUTER JOIN 조건 위치",
    difficulty: "advanced",
    type: "single_choice",
    prompt: "LEFT JOIN에서 우측 테이블 조건을 ON절이 아니라 WHERE절에 두면 생길 수 있는 결과 차이로 가장 적절한 것은?",
    choices: [
      { id: "A", text: "두 SQL은 항상 같은 결과를 반환한다." },
      { id: "B", text: "WHERE 조건 때문에 주문이 없는 고객이 제거될 수 있다." },
      { id: "C", text: "ON 조건은 문법적으로 사용할 수 없다." },
      { id: "D", text: "항상 더 빠른 실행계획이 선택된다." }
    ],
    answer: { kind: "choice", value: "B" },
    explanation:
      "LEFT OUTER JOIN의 우측 테이블 컬럼 조건을 WHERE에 두면 NULL 확장된 행이 제거되어 사실상 INNER JOIN처럼 동작할 수 있다. 조건 위치는 결과 보존 여부를 바꾼다.",
    wrongAnswerNotes: ["OUTER JOIN 조건 위치는 단순 성능 문제가 아니라 결과 문제다."],
    relatedConceptIds: ["concept-join-and-rewrite"],
    hints: h("LEFT JOIN의 보존 테이블을 확인하세요.", "WHERE에서 우측 컬럼을 검사하면 NULL 확장 행은 어떻게 될까요?", "주문 없는 고객을 남기지 못합니다."),
    expectedMinutes: 3,
    source: officialScope
  }),
  q({
    id: "s2-q04",
    subjectId: "subject-2",
    subjectName: "2과목 SQL 기본 및 활용",
    majorTopic: "SQL 활용",
    minorTopic: "윈도우 함수",
    detailTopic: "ROW_NUMBER와 RANK",
    difficulty: "intermediate",
    type: "combination",
    prompt: "윈도우 함수 설명으로 옳은 것만 고른 것은?",
    passage:
      "ㄱ. ROW_NUMBER는 동점이 있어도 서로 다른 순번을 부여한다.\nㄴ. RANK는 동점 다음 순위에 건너뜀이 생길 수 있다.\nㄷ. DENSE_RANK는 동점 다음 순위에 건너뜀이 생긴다.\nㄹ. 분석 함수는 GROUP BY처럼 행 수를 반드시 줄인다.",
    choices: [
      { id: "A", text: "ㄱ, ㄴ" },
      { id: "B", text: "ㄱ, ㄷ" },
      { id: "C", text: "ㄴ, ㄷ, ㄹ" },
      { id: "D", text: "ㄱ, ㄴ, ㄷ, ㄹ" }
    ],
    answer: { kind: "choice", value: "A" },
    explanation:
      "ROW_NUMBER는 유일 순번, RANK는 동점 후 순위 건너뜀, DENSE_RANK는 건너뜀 없음이다. 분석 함수는 기존 행에 값을 붙이므로 GROUP BY처럼 행 수를 줄이지 않는다.",
    wrongAnswerNotes: ["DENSE_RANK와 RANK의 차이가 핵심이다."],
    relatedConceptIds: ["concept-sql-core-semantics"],
    hints: h("동점 처리와 행 수 보존 여부를 나누세요.", "DENSE는 순위를 촘촘하게 유지합니다.", "분석 함수는 행을 줄이지 않습니다."),
    expectedMinutes: 2,
    source: officialScope
  }),
  q({
    id: "s2-q05",
    subjectId: "subject-2",
    subjectName: "2과목 SQL 기본 및 활용",
    majorTopic: "SQL 활용",
    minorTopic: "GROUP BY 확장",
    detailTopic: "ROLLUP과 GROUPING",
    difficulty: "advanced",
    type: "result_inference",
    prompt: "ROLLUP(지역, 상품군) 결과에서 GROUPING(지역)=1인 행의 의미로 가장 적절한 것은?",
    choices: [
      { id: "A", text: "지역별 상품군 소계 행" },
      { id: "B", text: "전체 총계 행" },
      { id: "C", text: "상품군별 지역 소계 행" },
      { id: "D", text: "원천 데이터의 지역 값이 NULL인 상세 행" }
    ],
    answer: { kind: "choice", value: "B" },
    explanation:
      "ROLLUP(지역, 상품군)은 (지역, 상품군), (지역), () 집계를 만든다. GROUPING(지역)=1은 지역 컬럼이 집계로 생략된 행이므로 전체 총계다.",
    wrongAnswerNotes: ["GROUPING은 원천 NULL과 집계 NULL을 구분한다."],
    relatedConceptIds: ["concept-sql-core-semantics"],
    hints: h("ROLLUP 집계 조합을 순서대로 써보세요.", "GROUPING=1은 해당 컬럼이 집계로 생략된 것입니다.", "지역까지 생략되면 전체 총계입니다."),
    expectedMinutes: 3,
    source: officialScope
  }),
  q({
    id: "s2-q06",
    subjectId: "subject-2",
    subjectName: "2과목 SQL 기본 및 활용",
    majorTopic: "SQL 기본",
    minorTopic: "서브쿼리",
    detailTopic: "상호연관 서브쿼리",
    difficulty: "intermediate",
    type: "single_choice",
    prompt: "상호연관 서브쿼리에 대한 설명으로 옳은 것은?",
    choices: [
      { id: "A", text: "서브쿼리가 외부 쿼리 컬럼을 참조하면 상호연관 서브쿼리다." },
      { id: "B", text: "상호연관 서브쿼리는 SELECT 절에서만 사용할 수 있다." },
      { id: "C", text: "상호연관 서브쿼리는 항상 한 번만 실행된다." },
      { id: "D", text: "상호연관 서브쿼리는 EXISTS와 함께 사용할 수 없다." }
    ],
    answer: { kind: "choice", value: "A" },
    explanation:
      "상호연관 서브쿼리는 내부 서브쿼리가 외부 쿼리 컬럼을 참조하는 형태다. 옵티마이저가 Unnesting할 수 있으나 논리적으로 외부 행과 연결된다.",
    wrongAnswerNotes: ["상호연관 서브쿼리는 WHERE, SELECT 등 여러 위치에서 가능하고 EXISTS와 자주 함께 쓰인다."],
    relatedConceptIds: ["concept-join-and-rewrite"],
    hints: h("외부 쿼리와 내부 쿼리의 참조 관계를 보세요.", "EXISTS 절에서 외부 컬럼을 자주 참조합니다.", "항상 한 번만 실행된다는 말은 틀립니다."),
    expectedMinutes: 2,
    source: officialScope
  }),
  q({
    id: "s2-q07",
    subjectId: "subject-2",
    subjectName: "2과목 SQL 기본 및 활용",
    majorTopic: "SQL 활용",
    minorTopic: "집합 연산",
    detailTopic: "UNION과 UNION ALL",
    difficulty: "intermediate",
    type: "multi_select",
    prompt: "UNION ALL을 UNION 대신 사용할 수 있는 근거로 적절한 것을 모두 고르라.",
    choices: [
      { id: "A", text: "두 입력 집합이 업무적으로 상호 배타적이다." },
      { id: "B", text: "중복 제거가 요구사항에 명시되어 있다." },
      { id: "C", text: "중복 가능성이 있으나 결과 건수만 맞으면 된다." },
      { id: "D", text: "OR 조건을 배타 조건으로 나누어 각 분기가 겹치지 않도록 작성했다." }
    ],
    answer: { kind: "choices", value: ["A", "D"] },
    explanation:
      "UNION은 중복 제거 비용이 든다. 입력 집합이 상호 배타적이거나 OR Expansion 과정에서 배타 조건을 명확히 두었다면 UNION ALL로 비용을 줄일 수 있다.",
    wrongAnswerNotes: ["중복 제거 요구가 있으면 UNION ALL은 결과를 바꿀 수 있다."],
    relatedConceptIds: ["concept-join-and-rewrite"],
    hints: h("UNION과 UNION ALL의 차이는 중복 제거입니다.", "결과 보존 근거가 있어야 합니다.", "상호 배타성이 있으면 UNION ALL을 검토합니다."),
    expectedMinutes: 2,
    source: officialScope
  }),
  q({
    id: "s2-q08",
    subjectId: "subject-2",
    subjectName: "2과목 SQL 기본 및 활용",
    majorTopic: "SQL 활용",
    minorTopic: "계층형 질의",
    detailTopic: "CONNECT BY",
    difficulty: "advanced",
    type: "fill_blank",
    prompt: "Oracle 계층형 질의에서 루트 행 조건을 지정하는 절의 키워드를 쓰라.",
    answer: { kind: "text", value: "START WITH", accepted: ["start with", "STARTWITH"] },
    explanation:
      "START WITH는 루트 행 조건을 지정하고 CONNECT BY는 부모-자식 연결 조건을 지정한다. PRIOR 위치에 따라 탐색 방향 해석이 달라진다.",
    wrongAnswerNotes: ["CONNECT BY는 연결 조건이고 루트 시작 조건은 START WITH다."],
    relatedConceptIds: ["concept-sql-core-semantics"],
    hints: h("루트 행 조건과 연결 조건을 분리하세요.", "CONNECT BY는 부모-자식 관계 조건입니다.", "루트는 START WITH로 지정합니다."),
    expectedMinutes: 1,
    source: officialScope
  }),
  q({
    id: "s2-q09",
    subjectId: "subject-2",
    subjectName: "2과목 SQL 기본 및 활용",
    majorTopic: "SQL 기본",
    minorTopic: "DML",
    detailTopic: "MERGE",
    difficulty: "advanced",
    type: "short_answer",
    prompt: "MERGE 문에서 대상 테이블에 매칭되는 행이 있을 때 수행되는 절과, 매칭되는 행이 없을 때 수행되는 절을 각각 쓰라.",
    answer: { kind: "texts", value: ["WHEN MATCHED", "WHEN NOT MATCHED"] },
    explanation:
      "MERGE는 소스와 대상의 조인 결과에 따라 매칭된 대상 행에는 WHEN MATCHED, 매칭되지 않은 소스 행에는 WHEN NOT MATCHED 절을 수행한다.",
    wrongAnswerNotes: ["MATCHED/NOT MATCHED 기준은 대상 테이블과 소스의 조인 매칭 여부다."],
    relatedConceptIds: ["concept-join-and-rewrite"],
    hints: h("MERGE는 upsert 문장입니다.", "대상에 있으면 갱신, 없으면 입력입니다.", "절 이름은 WHEN MATCHED와 WHEN NOT MATCHED입니다."),
    expectedMinutes: 2,
    source: officialScope
  }),
  q({
    id: "s2-q10",
    subjectId: "subject-2",
    subjectName: "2과목 SQL 기본 및 활용",
    majorTopic: "SQL 기본",
    minorTopic: "트랜잭션",
    detailTopic: "SAVEPOINT",
    difficulty: "intermediate",
    type: "single_choice",
    prompt: "SAVEPOINT에 대한 설명으로 가장 적절한 것은?",
    choices: [
      { id: "A", text: "트랜잭션 전체가 아니라 지정한 지점 이후 작업만 부분 롤백할 수 있게 한다." },
      { id: "B", text: "COMMIT과 동일하게 변경 내용을 영구 반영한다." },
      { id: "C", text: "DDL 문장과 무관하게 항상 유지된다." },
      { id: "D", text: "다른 세션의 변경 내용을 취소할 수 있다." }
    ],
    answer: { kind: "choice", value: "A" },
    explanation:
      "SAVEPOINT는 트랜잭션 내 특정 지점을 지정하고 ROLLBACK TO SAVEPOINT로 그 이후 변경만 취소할 수 있게 한다.",
    wrongAnswerNotes: ["SAVEPOINT는 영구 반영도, 다른 세션 제어도 아니다."],
    relatedConceptIds: ["concept-sql-core-semantics"],
    hints: h("트랜잭션 안의 중간 지점입니다.", "ROLLBACK TO와 함께 생각하세요.", "COMMIT처럼 영구 반영하지 않습니다."),
    expectedMinutes: 1,
    source: officialScope
  }),
  q({
    id: "s3-q01",
    subjectId: "subject-3",
    subjectName: "3과목 SQL 고급활용 및 튜닝",
    majorTopic: "인덱스 튜닝",
    minorTopic: "인덱스 스캔 효율화",
    detailTopic: "Access Predicate",
    difficulty: "advanced",
    type: "plan_interpretation",
    prompt: "조건절 `C1=:b1 AND C2 BETWEEN :b2 AND :b3 AND C3=:b4`에서 고객별 기간 조회가 대부분일 때 가장 효율적인 결합 인덱스 후보는?",
    choices: [
      { id: "A", text: "IDX_A(C1, C2, C3)" },
      { id: "B", text: "IDX_B(C2, C1, C3)" },
      { id: "C", text: "IDX_C(C3, C2, C1)" },
      { id: "D", text: "IDX_D(C2)" }
    ],
    answer: { kind: "choice", value: "A" },
    explanation:
      "등치 조건 C1을 선두에 두고 범위 조건 C2를 이어 두면 고객 단위로 기간 범위를 좁힌다. C3는 C2 범위 뒤라 탐색 범위 축소에는 제한이 있지만 필터 또는 테이블 액세스 감소에 기여할 수 있다.",
    wrongAnswerNotes: ["범위 조건이 선두이면 C1 등치 조건을 탐색 시작점으로 충분히 활용하기 어렵다."],
    relatedConceptIds: ["concept-index-scan-efficiency"],
    hints: h("등치 조건과 범위 조건의 순서를 보세요.", "선두 컬럼은 탐색 범위를 가장 먼저 결정합니다.", "C1 등치 후 C2 범위가 자연스럽습니다."),
    expectedMinutes: 3,
    source: officialScope
  }),
  q({
    id: "s3-q02",
    subjectId: "subject-3",
    subjectName: "3과목 SQL 고급활용 및 튜닝",
    majorTopic: "인덱스 튜닝",
    minorTopic: "인덱스 스캔 가능성",
    detailTopic: "컬럼 가공",
    difficulty: "advanced",
    type: "multi_select",
    prompt: "일반 B*Tree 인덱스 IDX_ORD(주문일자)가 있을 때 Range Scan을 유도하기 쉬운 조건을 모두 고르라.",
    choices: [
      { id: "A", text: "주문일자 >= DATE '2026-07-01' AND 주문일자 < DATE '2026-08-01'" },
      { id: "B", text: "TO_CHAR(주문일자, 'YYYYMM') = '202607'" },
      { id: "C", text: "주문일자 BETWEEN DATE '2026-07-01' AND DATE '2026-07-31'" },
      { id: "D", text: "SUBSTR(주문일자, 1, 6) = '202607'" }
    ],
    answer: { kind: "choices", value: ["A", "C"] },
    explanation:
      "컬럼 자체를 범위 비교에 두면 B*Tree 인덱스 탐색 시작·종료점을 잡기 쉽다. 컬럼에 함수를 적용하면 함수 기반 인덱스가 없는 한 일반 인덱스 효율이 떨어진다.",
    wrongAnswerNotes: ["날짜 컬럼에 함수를 적용하는 조건은 대표적인 인덱스 사용 불리 조건이다."],
    relatedConceptIds: ["concept-index-scan-efficiency"],
    hints: h("컬럼을 가공하는지 확인하세요.", "함수 기반 인덱스가 별도로 있다는 조건은 없습니다.", "컬럼 원형 비교인 A와 C가 유리합니다."),
    expectedMinutes: 2,
    source: pdfSource("PDF p.42")
  }),
  q({
    id: "s3-q03",
    subjectId: "subject-3",
    subjectName: "3과목 SQL 고급활용 및 튜닝",
    majorTopic: "SQL 튜닝",
    minorTopic: "SQL Trace",
    detailTopic: "Fetch와 Array Size",
    difficulty: "advanced",
    type: "trace_analysis",
    prompt: "TKPROF에서 Fetch count=51, Fetch rows=5000일 때 Rows per Fetch에 가장 가까운 값은?",
    choices: [
      { id: "A", text: "약 10" },
      { id: "B", text: "약 50" },
      { id: "C", text: "약 98" },
      { id: "D", text: "약 5000" }
    ],
    answer: { kind: "choice", value: "C" },
    explanation:
      "Rows per Fetch는 Fetch rows / Fetch count = 5000 / 51 = 약 98이다. SQL Trace 문제에서는 총 rows, fetch 횟수, query gets를 함께 읽어 Array Size와 네트워크 왕복 가능성을 판단한다.",
    wrongAnswerNotes: ["query gets는 논리 읽기 블록 수이고 Rows per Fetch 계산의 분자가 아니다."],
    relatedConceptIds: ["concept-sql-trace-tkprof"],
    hints: h("Fetch 라인의 rows와 count를 봅니다.", "5000행을 51번 Fetch했습니다.", "5000 / 51은 약 98입니다."),
    expectedMinutes: 2,
    source: pdfSource("PDF p.40")
  }),
  q({
    id: "s3-q04",
    subjectId: "subject-3",
    subjectName: "3과목 SQL 고급활용 및 튜닝",
    majorTopic: "인덱스 튜닝",
    minorTopic: "테이블 액세스 최소화",
    detailTopic: "랜덤 액세스 손익분기점",
    difficulty: "expert",
    type: "essay",
    prompt: "인덱스 Range Scan 후 테이블 랜덤 액세스가 많아 Full Table Scan보다 느려지는 이유를 설명하라.",
    answer: { kind: "rubric", value: ["ROWID 기반 랜덤 액세스 반복", "클러스터링 팩터", "넓은 범위 조건", "테이블 필터 후 폐기", "손익분기점"] },
    explanation:
      "인덱스는 정렬된 키에서 ROWID를 찾지만 테이블 블록은 키 순서대로 모여 있지 않을 수 있다. 범위가 넓거나 클러스터링 팩터가 나쁘면 ROWID별 랜덤 블록 방문이 폭증한다.",
    wrongAnswerNotes: ["인덱스 사용 여부가 아니라 테이블 접근 횟수와 블록 방문 패턴을 설명해야 한다."],
    relatedConceptIds: ["concept-index-scan-efficiency"],
    hints: h("인덱스 엔트리와 테이블 블록의 저장 순서는 다릅니다.", "ROWID 방문이 몇 번 반복되는지 생각하세요.", "클러스터링 팩터와 넓은 범위 조건을 언급해야 합니다."),
    expectedMinutes: 4,
    source: officialScope
  }),
  q({
    id: "s3-q05",
    subjectId: "subject-3",
    subjectName: "3과목 SQL 고급활용 및 튜닝",
    majorTopic: "조인 튜닝",
    minorTopic: "Join Method",
    detailTopic: "Nested Loops와 Hash Join",
    difficulty: "advanced",
    type: "join_strategy",
    prompt: "고객 50건을 먼저 찾고 각 고객의 최근 주문 5건을 인덱스(고객번호, 주문일자 DESC)로 가져와야 한다. 주문은 2억 건이다. 우선 검토할 조인 방식은?",
    choices: [
      { id: "A", text: "Nested Loops Join, 외부 집합이 작고 내부를 고객별 인덱스로 부분범위 처리할 수 있기 때문" },
      { id: "B", text: "Hash Join, 작은 외부 집합에서도 무조건 대용량 Full Scan이 유리하기 때문" },
      { id: "C", text: "Sort Merge Join, 모든 조인은 정렬 후 병합이 가장 안정적이기 때문" },
      { id: "D", text: "Cartesian Join, 고객 수가 적으므로 조인 조건이 없어도 비용이 낮기 때문" }
    ],
    answer: { kind: "choice", value: "A" },
    explanation:
      "외부 집합이 50건으로 작고 내부 주문 테이블에 고객번호+주문일자 인덱스가 있어 최근 5건을 STOPKEY로 가져올 수 있다면 NL Join이 적절하다.",
    wrongAnswerNotes: ["조인 방식은 입력 크기와 접근 경로에 따라 달라진다."],
    relatedConceptIds: ["concept-join-and-rewrite", "concept-index-scan-efficiency"],
    hints: h("외부 집합 크기와 내부 접근 경로를 같이 봅니다.", "고객별 최근 5건이면 STOPKEY가 가능합니다.", "작은 외부 집합 + 좋은 인덱스는 NL Join 후보입니다."),
    expectedMinutes: 3,
    source: officialScope
  }),
  q({
    id: "s3-q06",
    subjectId: "subject-3",
    subjectName: "3과목 SQL 고급활용 및 튜닝",
    majorTopic: "SQL 튜닝",
    minorTopic: "실행계획 해석",
    detailTopic: "Starts 반복",
    difficulty: "expert",
    type: "trace_analysis",
    prompt: "다음 계획에서 병목으로 가장 의심할 부분은?",
    table: {
      headers: ["Id", "Operation", "Starts", "Rows", "CR", "PR"],
      rows: [
        ["1", "NESTED LOOPS", "1", "120", "48050", "32"],
        ["2", "INDEX RANGE SCAN CUST_X1", "1", "120", "35", "0"],
        ["3", "TABLE ACCESS BY INDEX ROWID ORDERS", "120", "24000", "47000", "32"],
        ["4", "INDEX RANGE SCAN ORDERS_X2", "120", "24000", "1200", "0"]
      ]
    },
    choices: [
      { id: "A", text: "CUST_X1의 PR이 0이므로 고객 인덱스가 병목이다." },
      { id: "B", text: "ORDERS 테이블 액세스가 120회 반복되고 CR이 커서 랜덤 액세스 병목을 의심한다." },
      { id: "C", text: "NESTED LOOPS는 항상 나쁘므로 Hash Join으로 바꾸면 무조건 개선된다." },
      { id: "D", text: "INDEX RANGE SCAN ORDERS_X2의 CR이 작으므로 전체 계획에는 문제가 없다." }
    ],
    answer: { kind: "choice", value: "B" },
    explanation:
      "내부 주문 인덱스 스캔 자체의 CR은 1200이지만 ROWID로 주문 테이블을 120회 반복 접근하면서 CR 47000이 발생한다. 테이블 랜덤 액세스나 후행 필터 폐기가 병목일 가능성이 높다.",
    wrongAnswerNotes: ["NL 자체가 아니라 내부 반복 접근 비용을 본다."],
    relatedConceptIds: ["concept-sql-trace-tkprof", "concept-index-scan-efficiency"],
    hints: h("Starts가 반복되는 노드를 보세요.", "인덱스와 테이블 액세스의 CR을 분리하세요.", "가장 큰 CR은 TABLE ACCESS BY INDEX ROWID입니다."),
    expectedMinutes: 3,
    source: officialScope
  }),
  q({
    id: "s3-q07",
    subjectId: "subject-3",
    subjectName: "3과목 SQL 고급활용 및 튜닝",
    majorTopic: "SQL Rewrite",
    minorTopic: "OR Expansion",
    detailTopic: "UNION ALL 분해",
    difficulty: "advanced",
    type: "sql_rewrite",
    prompt: "조건 `(상태='대기' and 요청일자<:d1) or (상태='완료' and 완료일자>=:d2)`를 서로 배타적인 두 분기로 나눌 때 적절한 집합 연산자는?",
    choices: [
      { id: "A", text: "UNION ALL, 두 상태 값이 서로 배타적이므로 중복 제거가 필요 없을 수 있다." },
      { id: "B", text: "UNION, SQL 튜닝에서는 항상 중복 제거가 필요하다." },
      { id: "C", text: "INTERSECT, 두 조건을 동시에 만족하는 행만 필요하기 때문이다." },
      { id: "D", text: "MINUS, 첫 번째 조건에서 두 번째 조건을 빼야 하기 때문이다." }
    ],
    answer: { kind: "choice", value: "A" },
    explanation:
      "상태가 대기와 완료로 서로 배타적이면 OR 조건을 UNION ALL 두 분기로 나누어 각각 다른 인덱스를 사용할 수 있다. 중복 가능성이 없다는 근거가 있을 때 UNION의 중복 제거 비용을 피한다.",
    wrongAnswerNotes: ["UNION ALL은 결과 보존 근거가 있을 때만 안전하다."],
    relatedConceptIds: ["concept-join-and-rewrite"],
    hints: h("두 분기가 같은 행을 동시에 포함할 수 있는지 보세요.", "상태 값이 대기와 완료로 동시에 될 수 없습니다.", "중복 제거가 필요 없으면 UNION ALL입니다."),
    expectedMinutes: 2,
    source: pdfSource("PDF p.10")
  }),
  q({
    id: "s3-q08",
    subjectId: "subject-3",
    subjectName: "3과목 SQL 고급활용 및 튜닝",
    majorTopic: "Query Transformation",
    minorTopic: "View Merging",
    detailTopic: "집계 뷰 병합 제한",
    difficulty: "advanced",
    type: "single_choice",
    prompt: "View Merging이 제한될 수 있는 경우로 가장 적절한 것은?",
    choices: [
      { id: "A", text: "뷰 내부에 GROUP BY 집계가 있어 외부 조건과 단순 병합 시 결과 의미가 바뀔 수 있는 경우" },
      { id: "B", text: "뷰가 단순 SELECT * FROM 단일 테이블인 경우" },
      { id: "C", text: "뷰 외부에 등치 조건이 하나 있는 경우" },
      { id: "D", text: "뷰 내부 테이블에 인덱스가 있는 경우" }
    ],
    answer: { kind: "choice", value: "A" },
    explanation:
      "집계, DISTINCT, ROWNUM, 분석 함수 등은 행 수와 의미를 바꾸므로 뷰 병합이 제한될 수 있다. 단순 뷰는 외부 조건과 병합될 수 있다.",
    wrongAnswerNotes: ["인덱스 존재 여부 자체가 View Merging 제한 사유는 아니다."],
    relatedConceptIds: ["concept-join-and-rewrite"],
    hints: h("뷰 병합이 결과 의미를 바꾸는 경우를 찾으세요.", "행 수를 줄이는 연산이 있는지 봅니다.", "GROUP BY 집계 뷰는 조심해야 합니다."),
    expectedMinutes: 2,
    source: officialScope
  }),
  q({
    id: "s3-q09",
    subjectId: "subject-3",
    subjectName: "3과목 SQL 고급활용 및 튜닝",
    majorTopic: "Lock과 동시성",
    minorTopic: "트랜잭션 격리",
    detailTopic: "Lost Update",
    difficulty: "advanced",
    type: "lock_scenario",
    prompt: "두 세션이 같은 계좌 잔액을 읽고 각각 차감 후 UPDATE하는 로직에서 Lost Update를 방지하기 위한 방법으로 적절한 것을 모두 고르라.",
    choices: [
      { id: "A", text: "SELECT ... FOR UPDATE로 대상 행을 잠근 뒤 계산한다." },
      { id: "B", text: "UPDATE account SET balance = balance - :amt WHERE account_id = :id 형태의 원자적 갱신을 사용한다." },
      { id: "C", text: "애플리케이션에서 SELECT 결과를 오래 보관했다가 조건 없이 UPDATE한다." },
      { id: "D", text: "버전 컬럼을 WHERE 조건에 포함하는 낙관적 락을 사용한다." }
    ],
    answer: { kind: "choices", value: ["A", "B", "D"] },
    explanation:
      "Lost Update는 같은 기존 값을 기준으로 서로의 변경을 덮어쓸 때 발생한다. 행 잠금, 원자적 UPDATE, 버전 기반 낙관적 락은 방지 수단이다.",
    wrongAnswerNotes: ["오래된 조회 값을 조건 없이 갱신하는 방식은 위험하다."],
    relatedConceptIds: ["concept-lock-concurrency"],
    hints: h("같은 기존 값을 기준으로 덮어쓰는 문제입니다.", "잠금 또는 조건부 갱신이 필요합니다.", "조건 없는 UPDATE는 방지책이 아닙니다."),
    expectedMinutes: 3,
    source: officialScope
  }),
  q({
    id: "s3-q10",
    subjectId: "subject-3",
    subjectName: "3과목 SQL 고급활용 및 튜닝",
    majorTopic: "파티션 튜닝",
    minorTopic: "Partition Pruning",
    detailTopic: "파티션 키 가공",
    difficulty: "expert",
    type: "plan_interpretation",
    prompt: "주문 테이블이 주문년월 기준 Range Partition인데 조건이 `substr(주문번호,1,6)=:yyyymm`일 때 Partition Range All이 발생한 직접 원인은?",
    choices: [
      { id: "A", text: "파티션 키 주문년월을 직접 조건으로 사용하지 않고 주문번호를 SUBSTR로 가공했기 때문이다." },
      { id: "B", text: "주문상태 조건이 등치 조건이기 때문이다." },
      { id: "C", text: "Range Partition은 어떤 조건에서도 pruning이 불가능하기 때문이다." },
      { id: "D", text: "완료 상태 데이터가 너무 적기 때문이다." }
    ],
    answer: { kind: "choice", value: "A" },
    explanation:
      "파티션 키가 주문년월인데 조건절은 주문번호를 SUBSTR로 가공한다. 옵티마이저가 주문번호 앞자리와 파티션 키의 동치성을 일반적으로 보장할 수 없으므로 PSTART/PSTOP을 좁히지 못한다.",
    wrongAnswerNotes: ["Range Partition도 파티션 키 조건이 명확하면 pruning 가능하다."],
    relatedConceptIds: ["concept-index-scan-efficiency"],
    hints: h("파티션 기준 컬럼과 조건절 컬럼이 같은지 확인하세요.", "주문번호 앞 6자리를 사람이 알고 있어도 옵티마이저가 항상 보장하지 않습니다.", "파티션 키 주문년월을 직접 조건에 써야 합니다."),
    expectedMinutes: 3,
    source: pdfSource("PDF pp.36-37")
  })
];

export const practiceScenarios: PracticeScenario[] = [
  {
    id: "lab-01",
    title: "파티션 프루닝 실패와 주문월 조건 Rewrite",
    area: "Partition Pruning, SQL Rewrite, Hash Join",
    difficulty: "expert",
    scenario: "월별 Range Partition된 주문 대용량 테이블에서 주문번호 앞 6자리로 월을 판정하던 배치 조회가 모든 파티션을 읽고 있다.",
    requirement: "주문월 파티션 프루닝이 가능하도록 SQL을 재작성하고, 상태·상품 조인 조건을 유지한 채 같은 결과를 반환하라.",
    tables: [
      {
        name: "ORDERS",
        rows: 180000000,
        ddl:
          "create table orders (\n  order_ym char(6) not null,\n  order_no varchar2(20) not null,\n  product_id number not null,\n  order_status varchar2(10) not null,\n  order_amt number not null,\n  constraint orders_pk primary key(order_ym, order_no)\n) partition by range(order_ym) (...);",
        indexes: ["ORDERS_X1(order_status, order_ym, product_id)", "ORDERS_PK(order_ym, order_no)"],
        distribution: ["월별 약 300만 건", "완료 상태 약 42%", "대상 상품군 월별 약 8만 건"],
        statistics: ["partition statistics current", "histogram on order_status"]
      },
      {
        name: "PRODUCTS",
        rows: 250000,
        ddl: "create table products (product_id number primary key, category_cd varchar2(20), sale_yn char(1));",
        indexes: ["PRODUCTS_X1(category_cd, sale_yn, product_id)"]
      }
    ],
    currentSql:
      "select p.category_cd, count(*), sum(o.order_amt)\nfrom orders o join products p on p.product_id = o.product_id\nwhere substr(o.order_no, 1, 6) = :yyyymm\n  and o.order_status = '완료'\n  and p.sale_yn = 'Y'\ngroup by p.category_cd",
    currentPlan: [
      { id: 1, operation: "HASH GROUP BY", starts: 1, rows: 38, cost: 186400, cardinality: 40, cr: 1488000, pr: 182000, timeMs: 41200 },
      { id: 2, parentId: 1, operation: "HASH JOIN", starts: 1, rows: 82000, cost: 186100, cardinality: 85000, cr: 1487900, pr: 182000, timeMs: 40700 },
      { id: 3, parentId: 2, operation: "PARTITION RANGE ALL", objectName: "ORDERS", starts: 1, rows: 75600000, cost: 181000, cardinality: 76000000, cr: 1452000, pr: 180200, timeMs: 39000, filterPredicate: "SUBSTR(O.ORDER_NO,1,6)=:YYYYMM AND O.ORDER_STATUS='완료'" },
      { id: 4, parentId: 2, operation: "TABLE ACCESS FULL", objectName: "PRODUCTS", starts: 1, rows: 180000, cost: 4200, cardinality: 180000, cr: 35900, pr: 1800, timeMs: 1600, filterPredicate: "P.SALE_YN='Y'" }
    ],
    currentTrace: { parseCount: 1, executeCount: 1, fetchCount: 3, rows: 38, queryGets: 1488000, currentGets: 0, diskReads: 182000, elapsedMs: 41200, cpuMs: 31100, waitMs: 10100 },
    targetPlan: [
      { id: 1, operation: "HASH GROUP BY", starts: 1, rows: 38, cost: 12600, cardinality: 40, cr: 98300, pr: 4200, timeMs: 3400 },
      { id: 2, parentId: 1, operation: "HASH JOIN", starts: 1, rows: 82000, cost: 12400, cardinality: 85000, cr: 98200, pr: 4200, timeMs: 3300 },
      { id: 3, parentId: 2, operation: "PARTITION RANGE SINGLE", objectName: "ORDERS", starts: 1, rows: 1260000, cost: 9100, cardinality: 1250000, cr: 62400, pr: 2600, timeMs: 2300, accessPredicate: "O.ORDER_YM=:YYYYMM", filterPredicate: "O.ORDER_STATUS='완료'" },
      { id: 4, parentId: 2, operation: "TABLE ACCESS FULL", objectName: "PRODUCTS", starts: 1, rows: 180000, cost: 3200, cardinality: 180000, cr: 35800, pr: 1600, timeMs: 900, filterPredicate: "P.SALE_YN='Y'" }
    ],
    predicateInfo: ["현재: filter(SUBSTR(O.ORDER_NO,1,6)=:YYYYMM) 때문에 PSTART/PSTOP이 ALL로 확장된다.", "목표: access(O.ORDER_YM=:YYYYMM)로 PARTITION RANGE SINGLE 또는 ITERATOR를 유도한다."],
    expectedResult: "카테고리별 주문건수와 주문금액 합계는 기존 SQL과 동일해야 한다.",
    performanceGoal: "CR 1,488,000에서 100,000 이하, PR 182,000에서 5,000 이하로 감소",
    constraints: ["주문번호 생성 규칙에 의존하지 말 것", "상품 판매여부 조건 유지", "결과 중복 금지"],
    hints: h("파티션 키를 직접 조건절에 등장시키세요.", "SUBSTR 조건은 사람이 이해해도 옵티마이저가 파티션 범위로 보장하지 못합니다.", "o.order_ym = :yyyymm 조건으로 바꾸고 나머지 조건은 그대로 유지합니다."),
    modelSql:
      "select p.category_cd, count(*), sum(o.order_amt)\nfrom orders o join products p on p.product_id = o.product_id\nwhere o.order_ym = :yyyymm\n  and o.order_status = '완료'\n  and p.sale_yn = 'Y'\ngroup by p.category_cd",
    acceptableSqlPatterns: ["order_ym = :yyyymm", "partition range single", "partition range iterator"],
    gradingRubric: ["결과 보존 30", "파티션 키 직접 조건 30", "조인 조건 유지 20", "불필요한 함수 조건 제거 20"],
    explanation: "문제의 핵심은 파티션 키 ORDER_YM을 SQL에 직접 명시하지 않아 파티션 프루닝이 실패한 점이다. ORDER_YM 조건으로 PSTART/PSTOP을 좁히면 대량 Full Scan과 물리 읽기가 감소한다.",
    relatedConceptIds: ["concept-index-scan-efficiency", "concept-sql-trace-tkprof"],
    source: pdfSource("PDF pp.36-37"),
    status: "approved",
    version
  },
  {
    id: "lab-02",
    title: "UNION ALL + COUNT STOPKEY로 최근 이력 조회 유도",
    area: "COUNT STOPKEY, UNION ALL, NL Join",
    difficulty: "expert",
    scenario: "고객별 최근 유효 이력 1건을 가져오는 SQL이 전체 이력을 정렬한 뒤 상위 1건을 골라 응답 시간이 불안정하다.",
    requirement: "업무적으로 배타적인 이력 소스를 나누고 각 분기에서 최신 1건만 읽도록 재작성하라.",
    tables: [
      {
        name: "CUSTOMER",
        rows: 12000000,
        ddl: "create table customer (cust_id number primary key, grade_cd varchar2(10), use_yn char(1));",
        indexes: ["CUSTOMER_X1(use_yn, cust_id)"]
      },
      {
        name: "GRADE_HIST",
        rows: 240000000,
        ddl: "create table grade_hist (cust_id number, apply_dt date, grade_cd varchar2(10), source_cd varchar2(10));",
        indexes: ["GRADE_HIST_X1(cust_id, source_cd, apply_dt desc)"],
        distribution: ["고객당 평균 20건", "source_cd='AUTO'와 'MANUAL'은 동일 일자 중복 없음"]
      }
    ],
    currentSql:
      "select * from (\n  select h.*, row_number() over(partition by h.cust_id order by h.apply_dt desc) rn\n  from customer c join grade_hist h on h.cust_id = c.cust_id\n  where c.use_yn = 'Y' and h.apply_dt <= :base_dt\n) where rn = 1",
    currentPlan: [
      { id: 1, operation: "VIEW", starts: 1, rows: 550000, cost: 248000, cardinality: 550000, cr: 2320000, pr: 82000, timeMs: 58700 },
      { id: 2, parentId: 1, operation: "WINDOW SORT PUSHED RANK", starts: 1, rows: 11000000, cost: 247000, cardinality: 11000000, cr: 2319000, pr: 82000, timeMs: 58000 },
      { id: 3, parentId: 2, operation: "HASH JOIN", starts: 1, rows: 11000000, cost: 210000, cardinality: 11000000, cr: 1850000, pr: 62000, timeMs: 40500 }
    ],
    currentTrace: { parseCount: 1, executeCount: 1, fetchCount: 5501, rows: 550000, queryGets: 2320000, currentGets: 0, diskReads: 82000, elapsedMs: 58700, cpuMs: 43100, waitMs: 15600 },
    targetPlan: [
      { id: 1, operation: "NESTED LOOPS", starts: 1, rows: 550000, cost: 64000, cardinality: 550000, cr: 420000, pr: 6000, timeMs: 9200 },
      { id: 2, parentId: 1, operation: "INDEX RANGE SCAN", objectName: "CUSTOMER_X1", starts: 1, rows: 550000, cost: 12000, cardinality: 550000, cr: 32000, pr: 300, timeMs: 1100, accessPredicate: "C.USE_YN='Y'" },
      { id: 3, parentId: 1, operation: "COUNT STOPKEY", starts: 550000, rows: 550000, cost: 1, cardinality: 1, cr: 388000, pr: 5700, timeMs: 7900 },
      { id: 4, parentId: 3, operation: "INDEX RANGE SCAN DESCENDING", objectName: "GRADE_HIST_X1", starts: 550000, rows: 550000, cost: 1, cardinality: 1, cr: 388000, pr: 5700, timeMs: 7400, accessPredicate: "H.CUST_ID=C.CUST_ID AND H.SOURCE_CD=:SOURCE AND H.APPLY_DT<=:BASE_DT" }
    ],
    predicateInfo: [
      "목표 Access Predicate: H.CUST_ID=C.CUST_ID AND H.SOURCE_CD=:SOURCE AND H.APPLY_DT<=:BASE_DT",
      "Filter Predicate가 아니라 인덱스 DESC Range Scan의 Access 조건으로 들어가야 고객별 최신 1건에서 멈출 수 있다.",
      "COUNT STOPKEY가 전체 Window Sort를 대체해야 한다."
    ],
    expectedResult: "사용 고객별 기준일 이전 최신 등급 이력 1건",
    performanceGoal: "전체 WINDOW SORT 제거, 고객별 이력 인덱스 DESC 스캔 + STOPKEY",
    constraints: ["동일 적용일자 우선순위가 있으면 ORDER BY에 명시", "전체 이력 정렬 금지"],
    hints: h("전체 이력을 정렬하지 말고 고객별로 필요한 1건만 가져오세요.", "인덱스가 cust_id, source_cd, apply_dt desc 순서입니다.", "rownum <= 1 또는 fetch first 1 row only 구조를 사용합니다."),
    modelSql:
      "select c.cust_id, x.grade_cd, x.apply_dt\nfrom customer c\ncross apply (\n  select grade_cd, apply_dt\n  from grade_hist h\n  where h.cust_id = c.cust_id\n    and h.source_cd = :source\n    and h.apply_dt <= :base_dt\n  order by h.apply_dt desc\n  fetch first 1 row only\n) x\nwhere c.use_yn = 'Y'",
    acceptableSqlPatterns: ["fetch first 1 row", "rownum <= 1", "index range scan descending", "count stopkey"],
    gradingRubric: ["최신 1건 결과 보존 30", "전체 Window Sort 제거 25", "DESC 인덱스와 STOPKEY 유도 30", "동률 처리 근거 15"],
    explanation: "대량 이력을 모두 조인하고 분석 함수로 순위를 매기면 CR과 TEMP가 커진다. 고객별 외부 입력이 있고 이력 인덱스가 최신순이면 각 고객마다 필요한 첫 행에서 멈추도록 쓰는 것이 핵심이다.",
    relatedConceptIds: ["concept-join-and-rewrite", "concept-sql-trace-tkprof"],
    source: pdfSource("PDF pp.18, 27-28"),
    status: "approved",
    version
  },
  {
    id: "lab-03",
    title: "UPDATE 대상 선별을 위한 OR Expansion과 인덱스 분기",
    area: "DML Tuning, OR Expansion, Index Range Scan",
    difficulty: "expert",
    scenario: "대량 UPDATE가 두 개의 서로 다른 업무 조건을 OR로 묶어 수행되어 대상 선별 단계에서 Full Scan 비용이 크다.",
    requirement: "두 조건을 배타적인 분기로 나누어 각 분기별 인덱스를 사용하고, UPDATE 대상 중복을 방지하는 방안을 제시하라.",
    tables: [
      {
        name: "TARGET_ORDER",
        rows: 90000000,
        ddl: "create table target_order (order_id number primary key, order_status varchar2(10), request_dt date, complete_dt date, batch_flag char(1));",
        indexes: ["TARGET_ORDER_X1(order_status, request_dt)", "TARGET_ORDER_X2(order_status, complete_dt)", "TARGET_ORDER_PK(order_id)"],
        distribution: ["대기 8%", "완료 55%", "월별 request_dt 균등", "최근 complete_dt 2%"]
      }
    ],
    currentSql:
      "update target_order t\nset batch_flag = 'Y'\nwhere (t.order_status = '대기' and t.request_dt < :d1)\n   or (t.order_status = '완료' and t.complete_dt >= :d2)",
    currentPlan: [
      { id: 1, operation: "UPDATE STATEMENT", starts: 1, rows: 0, cost: 158000, cardinality: 0, cr: 920000, pr: 73000, timeMs: 33800 },
      { id: 2, parentId: 1, operation: "UPDATE", objectName: "TARGET_ORDER", starts: 1, rows: 0, cost: 158000, cardinality: 0, cr: 920000, pr: 73000, timeMs: 33700 },
      { id: 3, parentId: 2, operation: "TABLE ACCESS FULL", objectName: "TARGET_ORDER", starts: 1, rows: 5100000, cost: 158000, cardinality: 5100000, cr: 640000, pr: 72000, timeMs: 29100, filterPredicate: "(ORDER_STATUS='대기' AND REQUEST_DT<:D1) OR (ORDER_STATUS='완료' AND COMPLETE_DT>=:D2)" }
    ],
    currentTrace: { parseCount: 1, executeCount: 1, fetchCount: 0, rows: 5100000, queryGets: 640000, currentGets: 280000, diskReads: 73000, elapsedMs: 33800, cpuMs: 27600, waitMs: 6200 },
    targetPlan: [
      { id: 1, operation: "UPDATE STATEMENT", starts: 1, rows: 0, cost: 62000, cardinality: 0, cr: 286000, pr: 11800, timeMs: 10800 },
      { id: 2, parentId: 1, operation: "UPDATE", objectName: "TARGET_ORDER", starts: 1, rows: 0, cost: 62000, cardinality: 0, cr: 286000, pr: 11800, timeMs: 10700 },
      { id: 3, parentId: 2, operation: "UNION-ALL", starts: 1, rows: 5100000, cost: 61000, cardinality: 5100000, cr: 84000, pr: 9800, timeMs: 6000 },
      { id: 4, parentId: 3, operation: "INDEX RANGE SCAN", objectName: "TARGET_ORDER_X1", starts: 1, rows: 1700000, cost: 18000, cardinality: 1700000, cr: 26000, pr: 3400, timeMs: 1900, accessPredicate: "ORDER_STATUS='대기' AND REQUEST_DT<:D1" },
      { id: 5, parentId: 3, operation: "INDEX RANGE SCAN", objectName: "TARGET_ORDER_X2", starts: 1, rows: 3400000, cost: 43000, cardinality: 3400000, cr: 58000, pr: 6400, timeMs: 4100, accessPredicate: "ORDER_STATUS='완료' AND COMPLETE_DT>=:D2" }
    ],
    predicateInfo: ["현재: OR 전체가 테이블 필터로 평가되어 Full Scan.", "목표: OR Expansion으로 각 분기 조건이 해당 결합 인덱스의 Access Predicate가 된다.", "주의: 두 분기가 배타적이지 않으면 UPDATE 대상 중복을 검토해야 한다."],
    expectedResult: "대기 오래된 주문과 최근 완료 주문의 batch_flag를 Y로 변경",
    performanceGoal: "대상 선별 query gets 640,000에서 100,000 이하",
    constraints: ["두 분기 대상 중복 금지", "UPDATE 결과 보존", "힌트는 Oracle 문법 기준"],
    hints: h("OR 조건이 서로 다른 인덱스를 필요로 합니다.", "대기와 완료 상태는 같은 행에서 동시에 참일 수 없습니다.", "USE_CONCAT 또는 UNION ALL 분해와 인덱스 힌트를 검토하세요."),
    modelSql:
      "update /*+ use_concat */ target_order t\nset batch_flag = 'Y'\nwhere (t.order_status = '대기' and t.request_dt < :d1)\n   or (t.order_status = '완료' and t.complete_dt >= :d2)",
    acceptableSqlPatterns: ["use_concat", "union all", "target_order_x1", "target_order_x2"],
    gradingRubric: ["결과 보존 25", "OR Expansion 의도 30", "인덱스별 Access Predicate 설명 30", "중복 UPDATE 위험 설명 15"],
    explanation: "OR 조건이 서로 다른 날짜 컬럼과 인덱스를 요구하면 하나의 조건으로는 좋은 Access Predicate를 만들기 어렵다. 상태 값이 배타적이라는 업무 규칙이 있으므로 OR Expansion으로 분기별 인덱스 탐색을 유도할 수 있다.",
    relatedConceptIds: ["concept-join-and-rewrite", "concept-index-scan-efficiency"],
    source: pdfSource("PDF p.10"),
    status: "approved",
    version
  }
];

export const approvedQuestions = sqlpQuestions.filter((item) => item.status === "approved");
export const approvedPracticeScenarios = practiceScenarios.filter((item) => item.status === "approved");
export const approvedConceptDocuments = conceptDocuments.filter((item) => item.status === "approved");
