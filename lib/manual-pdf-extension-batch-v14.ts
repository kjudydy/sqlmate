import type { ChoiceId, Difficulty, SubjectId } from "@/lib/types";

type ManualPdfExtensionQuestion = {
  subjectId: SubjectId;
  number: number;
  majorTopic: string;
  middleTopic: string;
  topic: string;
  difficulty: Difficulty;
  questionType: string;
  mode: "original" | "variant" | "similar";
  sourcePage: number;
  sourceQuestionNumber?: number;
  parentQuestionId?: string;
  stem: string;
  passage?: string;
  code?: string;
  table?: {
    title?: string;
    headers: string[];
    rows: string[][];
  };
  tables?: Array<{
    title?: string;
    headers: string[];
    rows: string[][];
  }>;
  choices: Array<[ChoiceId, string, string]>;
  answer: ChoiceId;
  relatedConceptId: string;
  hint: [string, string, string];
  explanation: string;
};

export const manualPdfObjectiveExtensionBatch14: ManualPdfExtensionQuestion[] = [
  {
    subjectId: "sql-basic",
    number: 201,
    majorTopic: "SQL 기본 및 활용",
    middleTopic: "집합 연산",
    topic: "UNION과 UNION ALL",
    difficulty: "상급",
    questionType: "SQL 결과 건수 추론형",
    mode: "original",
    sourcePage: 84,
    sourceQuestionNumber: 84,
    stem: "아래 두 테이블 R1, R2에 대해 가, 나 두 SQL의 결과 건수로 가장 적절한 것은?",
    tables: [
      {
        title: "R1(A, B, C)",
        headers: ["A", "B", "C"],
        rows: [
          ["A3", "B2", "C3"],
          ["A1", "B1", "C1"],
          ["A2", "B1", "C2"]
        ]
      },
      {
        title: "R2(A, B, C)",
        headers: ["A", "B", "C"],
        rows: [
          ["A1", "B1", "C1"],
          ["A3", "B2", "C3"]
        ]
      }
    ],
    code: `가.
SELECT A, B, C FROM R1
UNION ALL
SELECT A, B, C FROM R2;

나.
SELECT A, B, C FROM R1
UNION
SELECT A, B, C FROM R2;`,
    choices: [
      ["A", "가: 5개, 나: 3개", "정답이다. UNION ALL은 중복을 제거하지 않아 3+2=5개이고, UNION은 두 테이블의 중복 2행을 제거해 고유 3개만 남는다."],
      ["B", "가: 5개, 나: 5개", "오답이다. UNION은 중복 행을 제거한다."],
      ["C", "가: 3개, 나: 3개", "오답이다. UNION ALL은 중복 제거를 하지 않으므로 R1과 R2 행 수를 모두 더한다."],
      ["D", "가: 3개, 나: 5개", "오답이다. UNION 결과가 UNION ALL 결과보다 커질 수 없다."]
    ],
    answer: "A",
    relatedConceptId: "sql-set-operators",
    hint: ["UNION ALL은 중복을 제거하지 않는다.", "UNION은 전체 컬럼 값이 같은 행을 하나로 본다.", "R2의 두 행은 R1에 이미 존재한다."],
    explanation: "R1은 3행, R2는 2행이다. UNION ALL은 중복 여부와 무관하게 5행을 반환한다. UNION은 A, B, C 전체 컬럼 조합을 기준으로 중복을 제거하므로 R1에 있는 3개의 고유 행만 남는다."
  },
  {
    subjectId: "sql-basic",
    number: 202,
    majorTopic: "SQL 기본 및 활용",
    middleTopic: "JOIN",
    topic: "Outer Join 결과 건수",
    difficulty: "상급",
    questionType: "JOIN 결과 추론형",
    mode: "variant",
    sourcePage: 74,
    sourceQuestionNumber: 74,
    parentQuestionId: "sql-cert-q74-outer-join-count",
    stem: "EMP.C는 DEPT.C와 연결된다. EMP와 DEPT를 각각 LEFT OUTER JOIN, FULL OUTER JOIN, RIGHT OUTER JOIN 했을 때 결과 건수로 가장 적절한 것은?",
    tables: [
      {
        title: "EMP 테이블",
        headers: ["A", "B", "C"],
        rows: [
          ["1", "b", "w"],
          ["3", "d", "w"],
          ["5", "y", "y"]
        ]
      },
      {
        title: "DEPT 테이블",
        headers: ["C", "D", "E"],
        rows: [
          ["w", "1", "10"],
          ["z", "4", "11"],
          ["v", "2", "22"]
        ]
      }
    ],
    choices: [
      ["A", "LEFT 3건, FULL 5건, RIGHT 4건", "정답이다. EMP 기준 3건, 양쪽 미매칭을 더한 FULL 5건, DEPT 기준 w 매칭 2건과 z/v 미매칭 2건으로 RIGHT 4건이다."],
      ["B", "LEFT 3건, FULL 4건, RIGHT 5건", "오답이다. FULL은 양쪽 미매칭을 모두 포함하고 RIGHT는 DEPT 기준 결과다."],
      ["C", "LEFT 4건, FULL 5건, RIGHT 4건", "오답이다. LEFT는 EMP 세 행만 보존하므로 DEPT 미매칭 두 행은 포함하지 않는다."],
      ["D", "LEFT 3건, FULL 5건, RIGHT 3건", "오답이다. RIGHT는 DEPT의 z, v 행까지 보존하므로 3건이 아니다."]
    ],
    answer: "A",
    relatedConceptId: "sql-join",
    hint: ["보존되는 테이블을 먼저 표시한다.", "C=w는 EMP 두 행과 DEPT 한 행이 매칭된다.", "FULL은 양쪽 미매칭 행을 모두 추가한다."],
    explanation: "외부 조인은 보존 방향이 핵심이다. LEFT는 EMP의 3행을 모두 보존한다. FULL은 EMP의 y 미매칭 행과 DEPT의 z, v 미매칭 행을 모두 포함하므로 5건이다. RIGHT는 DEPT의 w가 EMP 두 행과 매칭되고 z, v가 보존되어 4건이다."
  },
  {
    subjectId: "sql-basic",
    number: 203,
    majorTopic: "SQL 기본 및 활용",
    middleTopic: "함수",
    topic: "문자 함수와 줄바꿈",
    difficulty: "상급",
    questionType: "SQL 실행 결과형",
    mode: "similar",
    sourcePage: 41,
    sourceQuestionNumber: 41,
    parentQuestionId: "sql-cert-q41-length-replace",
    stem: "아래와 같은 두 건의 데이터에서 SQL 수행 결과로 가장 적절한 것은? 단, 줄바꿈 문자는 실제 저장값이 아니라 CHR(10)으로 표시하였다.",
    table: {
      title: "TAB1",
      headers: ["ROWNUM", "C1"],
      rows: [
        ["1", "A || CHR(10) || A"],
        ["2", "B || CHR(10) || B || CHR(10) || B"]
      ]
    },
    code: `SELECT SUM(CC)
FROM (
  SELECT LENGTH(C1) - LENGTH(REPLACE(C1, CHR(10))) + 1 AS CC
  FROM TAB1
);`,
    choices: [
      ["A", "2", "오답이다. 첫 번째 행의 줄 수만 계산한 값이다."],
      ["B", "3", "오답이다. 두 번째 행의 줄 수만 계산한 값이다."],
      ["C", "5", "정답이다. 첫 번째 행은 2줄, 두 번째 행은 3줄이므로 합계는 5다."],
      ["D", "6", "오답이다. 줄바꿈 문자 개수에 1을 더한 값을 행별로 계산해야 한다."]
    ],
    answer: "C",
    relatedConceptId: "sql-functions",
    hint: ["REPLACE로 제거되는 문자는 줄바꿈 문자다.", "줄 수는 줄바꿈 개수보다 1 크다.", "행별 CC를 구한 뒤 합산한다."],
    explanation: "첫 번째 값에는 줄바꿈이 1개 있으므로 CC=2, 두 번째 값에는 줄바꿈이 2개 있으므로 CC=3이다. SUM(CC)는 5다."
  },
  {
    subjectId: "sql-basic",
    number: 204,
    majorTopic: "SQL 기본 및 활용",
    middleTopic: "Subquery",
    topic: "최신 이력 조회",
    difficulty: "최상급",
    questionType: "최적 SQL 선택형",
    mode: "original",
    sourcePage: 69,
    sourceQuestionNumber: 69,
    stem: "전체 고객을 대상으로 2010년 12월 4일자 고객 정보를 조회하려고 한다. 고객변경이력에서 기준일 이전의 가장 최근 변경 이력을 붙이는 SQL로 가장 적절한 것은?",
    tables: [
      {
        title: "고객",
        headers: ["컬럼"],
        rows: [["고객ID"], ["고객명"], ["전화번호"], ["주소"], ["자녀수"], ["직업"]]
      },
      {
        title: "고객변경이력",
        headers: ["컬럼"],
        rows: [["고객ID"], ["변경순번"], ["변경일자"], ["고객등급"], ["전화번호"], ["주소"], ["자녀수"], ["직업"]]
      }
    ],
    choices: [
      ["A", "고객별 MAX(변경순번)을 전체에서 한 번만 구한 뒤 고객과 조인한다.", "오답이다. 고객별 최신 이력을 구해야 하므로 전체 단일 MAX를 사용하면 고객별 기준이 깨진다."],
      ["B", "변경일자 조건 후 고객ID로 GROUP BY 하여 고객별 MAX(변경순번)을 구하고 다시 이력과 조인한다.", "정답이다. 기준일 이전 이력 중 고객별 최신 순번을 찾고 해당 이력 행을 가져온다."],
      ["C", "변경일자 조건 후 전체 결과에 ROWNUM = 1을 적용한다.", "오답이다. 전체에서 한 행만 남아 모든 고객의 최신 이력을 구할 수 없다."],
      ["D", "고객변경이력을 먼저 모두 정렬한 뒤 첫 번째 행만 고객 전체에 조인한다.", "오답이다. 고객별 최신 행이 아니라 전체 최신 행 하나만 사용한다."]
    ],
    answer: "B",
    relatedConceptId: "sql-subquery",
    hint: ["최신 이력은 전체 기준이 아니라 고객별 기준이다.", "기준일 이전 조건을 먼저 적용한다.", "고객ID별 최대 변경순번을 다시 원본 이력과 연결한다."],
    explanation: "이력 테이블에서 기준일 이전의 행만 대상으로 고객별 최신 변경순번을 구해야 한다. 그 결과를 다시 고객변경이력과 조인하면 전체 고객의 해당 기준일 현재 정보를 얻을 수 있다."
  },
  {
    subjectId: "sql-basic",
    number: 205,
    majorTopic: "SQL 기본 및 활용",
    middleTopic: "집합 연산",
    topic: "UNION ALL 대체 가능성",
    difficulty: "최상급",
    questionType: "최적 SQL 선택형",
    mode: "original",
    sourcePage: 67,
    sourceQuestionNumber: 67,
    stem: "아래 ERD와 Dictionary 조회 결과를 고려할 때, 보기 중 UNION 대신 UNION ALL을 사용해도 가능한 것으로 가장 적절한 것은?",
    tables: [
      {
        title: "EMP 컬럼별 NUM_DISTINCT",
        headers: ["COLUMN_NAME", "NUM_DISTINCT"],
        rows: [
          ["EMPNO", "14"],
          ["ENAME", "14"],
          ["DEPTNO", "3"],
          ["JOB", "5"],
          ["MGR", "6"],
          ["SAL", "12"]
        ]
      }
    ],
    choices: [
      ["A", "SELECT deptno, job, mgr FROM emp WHERE empno = 7499 UNION SELECT deptno, job, mgr FROM emp WHERE empno = 7654", "정답이다. EMPNO는 유일하므로 두 조건의 결과 행은 서로 다른 사원이며 UNION ALL로 중복 제거 비용을 피할 수 있다."],
      ["B", "SELECT job, mgr FROM emp WHERE deptno = 10 UNION SELECT job, mgr FROM emp WHERE deptno = 20", "오답이다. JOB, MGR 조합이 부서 간 중복될 가능성을 배제할 수 없다."],
      ["C", "SELECT deptno, job, mgr FROM emp WHERE deptno = 10 UNION SELECT deptno, job, mgr FROM emp WHERE deptno = 20", "오답이다. DEPTNO가 다르므로 결과가 중복되지 않을 수 있지만, 지문에서 가장 명확하게 보장되는 것은 유일 컬럼 EMPNO 조건이다."],
      ["D", "SELECT empno, job, mgr FROM emp WHERE deptno = 10 UNION SELECT empno, job, mgr FROM emp WHERE deptno = 20", "오답이다. EMPNO를 포함하면 중복 가능성이 낮지만, 조건이 배타적인지와 결과 컬럼 중복 제거 필요성을 SQL만으로 일반화하기 어렵다."]
    ],
    answer: "A",
    relatedConceptId: "sql-set-operators",
    hint: ["UNION ALL은 중복 제거를 하지 않는다.", "두 SELECT 결과가 절대 중복되지 않는 근거가 있어야 한다.", "NUM_DISTINCT가 전체 행 수와 같은 컬럼을 확인한다."],
    explanation: "EMPNO의 NUM_DISTINCT가 14로 전체 사원 수와 같다면 사원을 유일하게 식별한다고 볼 수 있다. 서로 다른 EMPNO 조건은 같은 사원 행을 반환하지 않으므로 UNION ALL 사용 근거가 가장 명확하다."
  },
  {
    subjectId: "sql-basic",
    number: 206,
    majorTopic: "SQL 기본 및 활용",
    middleTopic: "날짜 함수",
    topic: "Oracle 날짜 연산",
    difficulty: "상급",
    questionType: "SQL 실행 결과형",
    mode: "original",
    sourcePage: 42,
    sourceQuestionNumber: 42,
    stem: "Oracle 환경에서 아래 SQL의 결과로 가장 적절한 것은?",
    code: `SELECT TO_CHAR(
         TO_DATE('2015.01.10 10', 'YYYY.MM.DD HH24') + 1/24/(60/10),
         'YYYY.MM.DD HH24:MI:SS'
       ) AS RESULT
FROM DUAL;`,
    choices: [
      ["A", "2015.01.10 11:01:00", "오답이다. 1/24는 1시간이지만 다시 60/10으로 나누어 10분을 더하는 식이다."],
      ["B", "2015.01.10 10:05:00", "오답이다. 더해지는 시간은 5분이 아니라 10분이다."],
      ["C", "2015.01.10 10:10:00", "정답이다. Oracle DATE에서 1은 하루이므로 1/24/(60/10)은 10분이다."],
      ["D", "2015.01.10 10:30:00", "오답이다. 30분을 더하려면 1/48 또는 30/1440과 같은 값이어야 한다."]
    ],
    answer: "C",
    relatedConceptId: "sql-functions",
    hint: ["Oracle DATE에서 숫자 1은 하루다.", "1/24는 1시간이다.", "1시간을 6으로 나누면 10분이다."],
    explanation: "Oracle DATE 산술에서 하루가 1이다. 1/24는 1시간, 이를 6으로 나누면 10분이다. 따라서 2015.01.10 10:00:00에서 10분이 더해진다."
  },
  {
    subjectId: "sql-basic",
    number: 207,
    majorTopic: "SQL 기본 및 활용",
    middleTopic: "JOIN",
    topic: "기간 이력 조인",
    difficulty: "최상급",
    questionType: "SQL 문장 선택형",
    mode: "similar",
    sourcePage: 39,
    sourceQuestionNumber: 39,
    parentQuestionId: "sql-restored-q39-period-join",
    stem: "서비스 가입 테이블의 기간 컬럼을 기준으로 2015년 1월에 유효했던 서비스별 건수를 구하려고 한다. 인덱스 사용과 날짜 비교의 정확성을 모두 고려한 SQL로 가장 적절한 것은?",
    tables: [
      {
        title: "서비스가입",
        headers: ["컬럼", "설명"],
        rows: [
          ["SVC_ID", "서비스ID"],
          ["JOIN_YMD", "가입일자 YYYYMMDD"],
          ["JOIN_HH", "가입시각 HH24"],
          ["SVC_START_DATE", "유효시작일 DATE"],
          ["SVC_END_DATE", "유효종료일 DATE"]
        ]
      }
    ],
    choices: [
      ["A", "WHERE SVC_START_DATE <= TO_DATE('20150131235959','YYYYMMDDHH24MISS') AND SVC_END_DATE >= TO_DATE('20150101000000','YYYYMMDDHH24MISS')", "정답이다. 기간이 2015년 1월 구간과 겹치는지 반개구간 성격으로 판단할 수 있고, 컬럼 가공을 피한다."],
      ["B", "WHERE TO_CHAR(SVC_END_DATE,'YYYYMM') = '201501'", "오답이다. 컬럼을 가공하여 일반 인덱스 사용이 어렵고, 시작일이 1월 이전인 유효 가입을 놓칠 수 있다."],
      ["C", "WHERE '201501' BETWEEN TO_CHAR(SVC_START_DATE,'YYYYMM') AND TO_CHAR(SVC_END_DATE,'YYYYMM')", "오답이다. 양쪽 컬럼을 모두 문자 변환하므로 인덱스 활용과 날짜 경계 처리에 불리하다."],
      ["D", "WHERE JOIN_YMD || JOIN_HH = '2015010100'", "오답이다. 가입 시점이 아니라 서비스 유효 기간과 1월의 교차 여부를 판단해야 한다."]
    ],
    answer: "A",
    relatedConceptId: "sql-where",
    hint: ["기간 조건은 시작과 종료가 조회 구간과 겹치는지 본다.", "컬럼에 함수를 적용하면 인덱스 시작점을 만들기 어렵다.", "가입 시각과 유효 기간을 구분한다."],
    explanation: "조회월과 유효 기간이 겹치려면 서비스 시작일이 조회월 종료보다 작거나 같고, 서비스 종료일이 조회월 시작보다 크거나 같아야 한다. 날짜 컬럼을 가공하지 않는 조건이 성능상 유리하다."
  },
  {
    subjectId: "sql-basic",
    number: 208,
    majorTopic: "SQL 기본 및 활용",
    middleTopic: "분석 함수",
    topic: "누적 합계",
    difficulty: "상급",
    questionType: "SQL 선택형",
    mode: "variant",
    sourcePage: 1,
    sourceQuestionNumber: 1,
    parentQuestionId: "practice-review-running-total",
    stem: "지점별 판매월 순서로 누적매출을 구하려고 한다. 같은 지점 안에서 판매월이 증가할수록 누적값이 증가하는 SQL로 가장 적절한 것은?",
    table: {
      title: "월별지점매출",
      headers: ["지점", "판매월", "매출"],
      rows: [
        ["10", "1", "521"],
        ["10", "2", "684"],
        ["20", "1", "537"],
        ["20", "2", "650"],
        ["20", "3", "500"]
      ]
    },
    choices: [
      ["A", "SUM(매출) OVER (PARTITION BY 지점 ORDER BY 판매월 ROWS BETWEEN UNBOUNDED PRECEDING AND CURRENT ROW)", "정답이다. 지점별로 판매월 순서의 누적 합계를 계산한다."],
      ["B", "SUM(매출) OVER (ORDER BY 지점)", "오답이다. 지점 내 판매월 순서가 없고 지점별 파티션도 명확하지 않다."],
      ["C", "SUM(매출) OVER (PARTITION BY 판매월 ORDER BY 지점)", "오답이다. 판매월별 누적이 되어 지점별 누적매출이 아니다."],
      ["D", "SUM(매출) OVER ()", "오답이다. 전체 합계를 모든 행에 반복 표시한다."]
    ],
    answer: "A",
    relatedConceptId: "sql-window-functions",
    hint: ["누적 기준 단위가 지점인지 확인한다.", "순서는 판매월이다.", "현재 행까지의 윈도우 범위가 필요하다."],
    explanation: "분석 함수의 PARTITION BY는 누적을 끊는 단위이고 ORDER BY는 누적 순서다. 지점별 판매월 순 누적합은 `PARTITION BY 지점 ORDER BY 판매월 ROWS ... CURRENT ROW` 구조가 맞다."
  },
  {
    subjectId: "sql-basic",
    number: 209,
    majorTopic: "SQL 기본 및 활용",
    middleTopic: "계층형 질의",
    topic: "CONNECT BY 처리",
    difficulty: "상급",
    questionType: "결과 행 수 추론형",
    mode: "similar",
    sourcePage: 52,
    sourceQuestionNumber: 52,
    stem: "아래 조직 테이블에서 루트 사원부터 하위 사원을 모두 조회하는 계층형 질의를 수행한다. 반환 행 수로 가장 적절한 것은?",
    table: {
      title: "EMP_TREE",
      headers: ["EMP_ID", "MGR_ID"],
      rows: [
        ["1", "NULL"],
        ["2", "1"],
        ["3", "1"],
        ["4", "2"],
        ["5", "2"],
        ["6", "3"]
      ]
    },
    code: `SELECT emp_id
FROM emp_tree
START WITH mgr_id IS NULL
CONNECT BY PRIOR emp_id = mgr_id;`,
    choices: [
      ["A", "3", "오답이다. 직속 하위만 조회하는 것이 아니라 전체 하위 계층을 따라 내려간다."],
      ["B", "5", "오답이다. 루트 사원도 결과에 포함된다."],
      ["C", "6", "정답이다. 루트 1번과 그 하위 2,3,4,5,6이 모두 반환된다."],
      ["D", "7", "오답이다. 제시된 행은 6개뿐이고 순환도 없다."]
    ],
    answer: "C",
    relatedConceptId: "sql-hierarchical-query",
    hint: ["START WITH 행도 결과에 포함된다.", "CONNECT BY PRIOR emp_id = mgr_id는 부모에서 자식으로 내려간다.", "모든 연결된 하위 행을 센다."],
    explanation: "계층형 질의는 START WITH로 선택된 루트 행을 포함하고 CONNECT BY 조건을 만족하는 자식 행을 재귀적으로 반환한다. 제시된 6행이 모두 루트 1번의 하위 계층에 속한다."
  },
  {
    subjectId: "sql-basic",
    number: 210,
    majorTopic: "SQL 기본 및 활용",
    middleTopic: "GROUP BY",
    topic: "ROLLUP과 GROUPING",
    difficulty: "상급",
    questionType: "집계 결과 추론형",
    mode: "similar",
    sourcePage: 58,
    sourceQuestionNumber: 58,
    stem: "아래 매출 테이블에서 `GROUP BY ROLLUP(지역, 상품)`을 수행할 때 생성되는 그룹의 종류로 가장 적절한 것은?",
    table: {
      title: "SALES",
      headers: ["지역", "상품", "금액"],
      rows: [
        ["서울", "A", "10"],
        ["서울", "B", "20"],
        ["부산", "A", "30"]
      ]
    },
    choices: [
      ["A", "(지역, 상품) 상세 그룹만 생성된다.", "오답이다. ROLLUP은 소계와 총계를 추가한다."],
      ["B", "(지역, 상품), (지역), () 그룹이 생성된다.", "정답이다. ROLLUP(지역, 상품)은 상세, 지역 소계, 전체 총계 순서의 그룹을 만든다."],
      ["C", "(상품), () 그룹만 생성된다.", "오답이다. ROLLUP의 왼쪽 컬럼인 지역 소계가 포함된다."],
      ["D", "(지역), (상품), () 그룹이 생성된다.", "오답이다. 이는 CUBE 성격에 가깝고 ROLLUP은 계층형 소계를 만든다."]
    ],
    answer: "B",
    relatedConceptId: "sql-group-functions",
    hint: ["ROLLUP은 지정 순서의 계층 소계를 만든다.", "오른쪽 컬럼부터 제거된 그룹을 생각한다.", "전체 총계 그룹도 포함된다."],
    explanation: "`ROLLUP(지역, 상품)`은 `(지역, 상품)` 상세 집계, `(지역)` 소계, `()` 전체 총계를 생성한다. `(상품)` 단독 그룹은 생성하지 않는다."
  },
  {
    subjectId: "sql-basic",
    number: 211,
    majorTopic: "SQL 기본 및 활용",
    middleTopic: "DML",
    topic: "MERGE",
    difficulty: "최상급",
    questionType: "SQL 비교형",
    mode: "original",
    sourcePage: 73,
    sourceQuestionNumber: 73,
    stem: "아래 (A), (B) 두 SQL에 대한 설명으로 가장 부적절한 것은?",
    code: `(A)
UPDATE 급여지급 T
   SET T.월급여 = (
       SELECT S.월급여
       FROM 사원 S
       WHERE S.사원번호 = T.사원번호
   )
 WHERE T.급여월 = '201101'
   AND EXISTS (
       SELECT 1
       FROM 사원 S
       WHERE S.사원번호 = T.사원번호
         AND S.부서코드 = '30'
   );

(B)
MERGE INTO 급여지급 T
USING (
  SELECT S.사원번호, S.월급여
  FROM 사원 S
  WHERE S.부서코드 = '30'
) S
ON (T.급여월 = '201101' AND T.사원번호 = S.사원번호)
WHEN MATCHED THEN
  UPDATE SET T.월급여 = S.월급여;`,
    choices: [
      ["A", "(A)와 (B)의 수정되는 데이터 건수는 같다.", "오답이다. 동일한 급여월과 부서 30 사원 매칭 조건이라면 수정 대상은 같다."],
      ["B", "적절한 인덱스가 없다면 (A)가 사원 테이블을 반복 액세스할 가능성이 있다.", "오답이다. 상관 서브쿼리와 EXISTS가 반복 액세스 비용을 만들 수 있다."],
      ["C", "두 SQL 모두 같은 방식으로 조인한다면 처리량이 많아도 성능 차이가 전혀 없다.", "정답이다. 실행계획, 조인 방식, 반복 액세스 여부에 따라 성능 차이가 날 수 있으므로 '전혀 없다'는 부적절하다."],
      ["D", "(B)는 WHEN NOT MATCHED THEN INSERT 절을 추가해 신규 급여 행 처리도 가능하도록 확장할 수 있다.", "오답이다. MERGE는 매칭되지 않은 행에 대한 INSERT 절을 추가할 수 있다."]
    ],
    answer: "C",
    relatedConceptId: "sql-dml",
    hint: ["수정 대상 조건이 같은지 먼저 본다.", "반복 서브쿼리와 조인 방식 차이를 본다.", "성능 차이가 전혀 없다는 단정 표현을 의심한다."],
    explanation: "두 문장은 같은 업무 결과를 만들 수 있지만, 실행계획은 달라질 수 있다. UPDATE의 상관 서브쿼리 반복 액세스, MERGE의 조인 방식, 인덱스 구성에 따라 성능 차이가 생길 수 있다."
  },
  {
    subjectId: "sql-basic",
    number: 212,
    majorTopic: "SQL 기본 및 활용",
    middleTopic: "Subquery",
    topic: "NOT IN과 NULL",
    difficulty: "상급",
    questionType: "NULL 처리 추론형",
    mode: "variant",
    sourcePage: 55,
    sourceQuestionNumber: 55,
    stem: "아래 데이터에서 SQL의 결과 행 수로 가장 적절한 것은?",
    tables: [
      {
        title: "T1",
        headers: ["C1"],
        rows: [["1"], ["2"], ["3"]]
      },
      {
        title: "T2",
        headers: ["C1"],
        rows: [["2"], ["NULL"]]
      }
    ],
    code: `SELECT *
FROM T1
WHERE C1 NOT IN (SELECT C1 FROM T2);`,
    choices: [
      ["A", "0건", "정답이다. NOT IN 목록에 NULL이 포함되면 비교 결과가 UNKNOWN이 되어 어떤 행도 TRUE가 되지 않는다."],
      ["B", "1건", "오답이다. 3만 남는다고 생각하기 쉽지만 NULL 때문에 NOT IN 전체 판정이 달라진다."],
      ["C", "2건", "오답이다. 1과 3이 남는 것은 T2에 NULL이 없을 때의 결과다."],
      ["D", "3건", "오답이다. 값 2와의 비교뿐 아니라 NULL과의 비교도 고려해야 한다."]
    ],
    answer: "A",
    relatedConceptId: "sql-null",
    hint: ["NOT IN은 내부적으로 여러 <> 비교의 AND와 유사하다.", "NULL과의 비교 결과는 TRUE/FALSE가 아니라 UNKNOWN이다.", "WHERE는 TRUE인 행만 반환한다."],
    explanation: "`C1 NOT IN (2, NULL)`은 `C1 <> 2 AND C1 <> NULL`처럼 평가될 수 있다. `C1 <> NULL`은 UNKNOWN이므로 WHERE 조건이 TRUE가 되지 않아 결과가 없다."
  },
  {
    subjectId: "sql-basic",
    number: 213,
    majorTopic: "SQL 기본 및 활용",
    middleTopic: "JOIN",
    topic: "ANSI JOIN 조건 위치",
    difficulty: "중급",
    questionType: "결과 변화 판단형",
    mode: "similar",
    sourcePage: 74,
    sourceQuestionNumber: 74,
    stem: "LEFT OUTER JOIN에서 오른쪽 테이블의 상태 조건을 WHERE 절에 두었을 때 발생할 수 있는 결과로 가장 적절한 것은?",
    code: `SELECT A.고객ID, B.쿠폰ID
FROM 고객 A
LEFT OUTER JOIN 쿠폰 B
  ON A.고객ID = B.고객ID
WHERE B.상태 = '사용가능';`,
    choices: [
      ["A", "쿠폰이 없는 고객도 모두 보존된다.", "오답이다. WHERE에서 B.상태를 검사하면 B가 NULL인 행은 제거된다."],
      ["B", "실질적으로 INNER JOIN처럼 동작할 수 있다.", "정답이다. 오른쪽 테이블 컬럼 조건이 WHERE에 있으면 미매칭 NULL 행이 제거된다."],
      ["C", "FULL OUTER JOIN으로 자동 변환된다.", "오답이다. DBMS가 외부 조인 방향을 자동으로 FULL로 바꾸지 않는다."],
      ["D", "ON 절 조건과 WHERE 절 조건은 외부 조인에서 항상 완전히 동일하다.", "오답이다. 외부 조인에서는 조건 위치가 결과 보존 여부에 영향을 줄 수 있다."]
    ],
    answer: "B",
    relatedConceptId: "sql-join",
    hint: ["LEFT OUTER JOIN은 왼쪽 미매칭 행을 NULL로 보존한다.", "WHERE 조건은 조인 후 최종 필터다.", "NULL인 오른쪽 컬럼이 조건을 통과하는지 본다."],
    explanation: "오른쪽 테이블 조건을 WHERE에 두면 LEFT OUTER JOIN으로 생성된 NULL 보존 행이 제거될 수 있다. 오른쪽 조건을 보존 방향에 맞게 ON 절에 둘지, WHERE 절에 둘지 구분해야 한다."
  },
  {
    subjectId: "sql-basic",
    number: 214,
    majorTopic: "SQL 기본 및 활용",
    middleTopic: "Window Function",
    topic: "RANK와 ROW_NUMBER",
    difficulty: "상급",
    questionType: "분석 함수 선택형",
    mode: "similar",
    sourcePage: 69,
    sourceQuestionNumber: 69,
    stem: "고객별 최근 변경 이력 1건만 조회하되, 같은 변경일자가 여러 건이면 변경순번이 가장 큰 한 건만 남기려고 한다. 가장 적절한 분석 함수 사용은?",
    choices: [
      ["A", "RANK() OVER (ORDER BY 변경일자 DESC)", "오답이다. 고객별 파티션이 없어 전체 고객 중 순위가 매겨진다."],
      ["B", "ROW_NUMBER() OVER (PARTITION BY 고객ID ORDER BY 변경일자 DESC, 변경순번 DESC)", "정답이다. 고객별로 최신 날짜와 가장 큰 변경순번 한 행을 안정적으로 선택한다."],
      ["C", "DENSE_RANK() OVER (PARTITION BY 변경일자 ORDER BY 고객ID)", "오답이다. 변경일자를 파티션으로 나누면 고객별 최신 이력 판정이 되지 않는다."],
      ["D", "COUNT(*) OVER (PARTITION BY 고객ID)", "오답이다. 고객별 이력 개수만 구하고 최신 행 선택 기준을 제공하지 않는다."]
    ],
    answer: "B",
    relatedConceptId: "sql-window-functions",
    hint: ["최신 1건은 고객별로 판단한다.", "동일 날짜일 때 tie-breaker가 필요하다.", "한 행만 고를 때 ROW_NUMBER가 명확하다."],
    explanation: "고객별 최신 이력 한 건을 선택하려면 `PARTITION BY 고객ID`가 필요하고, 최신 기준을 `ORDER BY 변경일자 DESC, 변경순번 DESC`로 지정한 뒤 ROW_NUMBER=1을 선택한다."
  },
  {
    subjectId: "sql-basic",
    number: 215,
    majorTopic: "SQL 기본 및 활용",
    middleTopic: "집합 연산",
    topic: "MINUS",
    difficulty: "중급",
    questionType: "결과 추론형",
    mode: "variant",
    sourcePage: 60,
    sourceQuestionNumber: 60,
    stem: "아래 두 테이블에서 SQL 수행 결과로 가장 적절한 것은?",
    tables: [
      {
        title: "T_A",
        headers: ["C1"],
        rows: [["1"], ["1"], ["2"], ["3"]]
      },
      {
        title: "T_B",
        headers: ["C1"],
        rows: [["1"], ["4"]]
      }
    ],
    code: `SELECT C1 FROM T_A
MINUS
SELECT C1 FROM T_B;`,
    choices: [
      ["A", "1, 2, 3", "오답이다. MINUS는 첫 번째 결과에서 두 번째 결과와 중복되는 값을 제거한다."],
      ["B", "2, 3", "정답이다. 집합 연산은 중복을 제거한 뒤 차집합을 반환한다."],
      ["C", "1, 1, 2, 3", "오답이다. MINUS는 중복 행을 그대로 유지하지 않는다."],
      ["D", "4", "오답이다. 두 번째 집합에만 있는 값은 반환되지 않는다."]
    ],
    answer: "B",
    relatedConceptId: "sql-set-operators",
    hint: ["MINUS는 첫 번째 집합 기준이다.", "집합 연산은 기본적으로 중복을 제거한다.", "두 번째 집합에 있는 1은 제거된다."],
    explanation: "T_A의 고유 값은 1,2,3이고 T_B의 고유 값은 1,4다. T_A MINUS T_B 결과는 2,3이다."
  },
  {
    subjectId: "sql-basic",
    number: 216,
    majorTopic: "SQL 기본 및 활용",
    middleTopic: "CASE",
    topic: "조건식 평가",
    difficulty: "중급",
    questionType: "SQL 결과형",
    mode: "similar",
    sourcePage: 62,
    sourceQuestionNumber: 62,
    stem: "아래 SQL의 결과로 가장 적절한 것은?",
    code: `SELECT CASE
         WHEN 10 BETWEEN 1 AND 10 THEN 'A'
         WHEN 10 >= 10 THEN 'B'
         ELSE 'C'
       END AS RESULT
FROM DUAL;`,
    choices: [
      ["A", "A", "정답이다. CASE는 위에서부터 조건을 평가하고 처음 TRUE가 된 결과를 반환한다."],
      ["B", "B", "오답이다. 두 번째 조건도 TRUE지만 첫 번째 조건에서 이미 반환된다."],
      ["C", "C", "오답이다. 첫 번째 조건이 TRUE이므로 ELSE까지 가지 않는다."],
      ["D", "A와 B 두 행", "오답이다. CASE 식은 조건별 행을 생성하는 것이 아니라 하나의 값을 반환한다."]
    ],
    answer: "A",
    relatedConceptId: "sql-functions",
    hint: ["CASE 조건은 순차적으로 평가된다.", "처음 TRUE가 된 WHEN에서 멈춘다.", "BETWEEN은 양 끝값을 포함한다."],
    explanation: "`10 BETWEEN 1 AND 10`은 TRUE다. CASE는 첫 번째 TRUE 조건의 결과를 반환하므로 RESULT는 A다."
  },
  {
    subjectId: "sql-basic",
    number: 217,
    majorTopic: "SQL 기본 및 활용",
    middleTopic: "GROUP BY",
    topic: "HAVING",
    difficulty: "중급",
    questionType: "논리적 처리 순서형",
    mode: "variant",
    sourcePage: 57,
    sourceQuestionNumber: 57,
    stem: "부서별 급여 합계가 10000 이상인 부서만 조회하려고 한다. 가장 적절한 조건 위치는?",
    choices: [
      ["A", "WHERE SUM(sal) >= 10000", "오답이다. WHERE에서는 그룹 함수 조건을 직접 사용할 수 없다."],
      ["B", "HAVING SUM(sal) >= 10000", "정답이다. 그룹 생성 후 집계 결과를 필터링할 때 HAVING을 사용한다."],
      ["C", "ON SUM(sal) >= 10000", "오답이다. ON은 조인 조건 위치이며 그룹 집계 필터가 아니다."],
      ["D", "ORDER BY SUM(sal) >= 10000", "오답이다. ORDER BY는 정렬 위치이며 필터링 조건이 아니다."]
    ],
    answer: "B",
    relatedConceptId: "sql-group-functions",
    hint: ["WHERE는 그룹화 전에 적용된다.", "집계 결과 조건은 그룹화 후에 판단한다.", "GROUP BY 결과 필터는 HAVING이다."],
    explanation: "부서별 급여 합계처럼 집계 결과에 대한 조건은 GROUP BY 이후 HAVING 절에서 필터링해야 한다."
  },
  {
    subjectId: "sql-basic",
    number: 218,
    majorTopic: "SQL 기본 및 활용",
    middleTopic: "DML",
    topic: "DELETE 참조 동작",
    difficulty: "상급",
    questionType: "제약조건 결과 추론형",
    mode: "variant",
    sourcePage: 65,
    sourceQuestionNumber: 65,
    stem: "아래 제약조건과 데이터가 있을 때 `DELETE FROM T WHERE C = 1` 수행 후 R에 남는 데이터로 가장 적절한 것은?",
    tables: [
      {
        title: "T",
        headers: ["C", "D"],
        rows: [["1", "10"], ["2", "20"]]
      },
      {
        title: "S",
        headers: ["B", "C"],
        rows: [["1", "1"], ["2", "2"]]
      },
      {
        title: "R",
        headers: ["A", "B"],
        rows: [["1", "1"], ["2", "2"]]
      }
    ],
    code: `CREATE TABLE T (C INTEGER PRIMARY KEY, D INTEGER);
CREATE TABLE S (
  B INTEGER PRIMARY KEY,
  C INTEGER REFERENCES T(C) ON DELETE CASCADE
);
CREATE TABLE R (
  A INTEGER PRIMARY KEY,
  B INTEGER REFERENCES S(B) ON DELETE SET NULL
);`,
    choices: [
      ["A", "(1, NULL), (2, 2)", "정답이다. T.C=1 삭제로 S.B=1이 CASCADE 삭제되고, 이를 참조하던 R.B는 SET NULL이 된다."],
      ["B", "(1, 1), (2, 2)", "오답이다. S.B=1 삭제에 따라 R.B=1은 NULL로 변경된다."],
      ["C", "(2, 2)만 남는다.", "오답이다. R은 CASCADE가 아니라 SET NULL이므로 R.A=1 행 자체는 삭제되지 않는다."],
      ["D", "모든 R 행이 삭제된다.", "오답이다. R 테이블에는 ON DELETE CASCADE가 적용되어 있지 않다."]
    ],
    answer: "A",
    relatedConceptId: "sql-ddl-constraints",
    hint: ["T 삭제가 S에 어떤 동작을 일으키는지 본다.", "S 삭제가 R에 어떤 동작을 일으키는지 본다.", "CASCADE와 SET NULL은 행 삭제와 참조값 변경이 다르다."],
    explanation: "T.C=1 삭제는 S의 해당 참조 행을 CASCADE로 삭제한다. R은 S(B)를 ON DELETE SET NULL로 참조하므로 S.B=1 삭제 시 R의 B 값만 NULL로 바뀌고 R 행은 유지된다."
  },
  {
    subjectId: "sql-basic",
    number: 219,
    majorTopic: "SQL 기본 및 활용",
    middleTopic: "PIVOT",
    topic: "행 열 전환",
    difficulty: "상급",
    questionType: "SQL 선택형",
    mode: "similar",
    sourcePage: 64,
    sourceQuestionNumber: 64,
    stem: "월별 상품 매출을 상품별 컬럼으로 전환하려고 한다. Oracle PIVOT 문장으로 가장 적절한 것은?",
    table: {
      title: "SALES",
      headers: ["월", "상품", "금액"],
      rows: [
        ["202601", "A", "100"],
        ["202601", "B", "200"],
        ["202602", "A", "150"]
      ]
    },
    choices: [
      ["A", "SELECT * FROM SALES PIVOT (SUM(금액) FOR 상품 IN ('A' AS A, 'B' AS B))", "정답이다. 상품 값을 컬럼으로 전환하고 금액을 집계한다."],
      ["B", "SELECT * FROM SALES UNPIVOT (금액 FOR 상품 IN (A, B))", "오답이다. UNPIVOT은 컬럼을 행으로 풀 때 사용한다."],
      ["C", "SELECT 월, 상품, SUM(금액) FROM SALES", "오답이다. GROUP BY가 없고 행 열 전환도 수행하지 않는다."],
      ["D", "SELECT * FROM SALES PIVOT (상품 FOR SUM(금액) IN ('A','B'))", "오답이다. PIVOT 집계식과 FOR 대상 컬럼의 위치가 바뀌었다."]
    ],
    answer: "A",
    relatedConceptId: "sql-pivot",
    hint: ["행의 상품 값을 컬럼으로 올리는 연산이다.", "PIVOT에는 집계식과 FOR 컬럼이 필요하다.", "UNPIVOT과 방향을 구분한다."],
    explanation: "PIVOT은 행 값을 컬럼으로 전환하면서 집계한다. `SUM(금액) FOR 상품 IN (...)` 구조가 맞다."
  },
  {
    subjectId: "sql-basic",
    number: 220,
    majorTopic: "SQL 기본 및 활용",
    middleTopic: "Window Function",
    topic: "ROWS와 RANGE",
    difficulty: "최상급",
    questionType: "분석 함수 결과형",
    mode: "similar",
    sourcePage: 61,
    sourceQuestionNumber: 61,
    stem: "아래 데이터에서 두 번째 행의 A, B 값으로 가장 적절한 것은?",
    table: {
      title: "T",
      headers: ["ID", "AMT"],
      rows: [
        ["1", "10"],
        ["2", "10"],
        ["3", "20"]
      ]
    },
    code: `SELECT id,
       SUM(amt) OVER (ORDER BY amt ROWS BETWEEN UNBOUNDED PRECEDING AND CURRENT ROW)  AS A,
       SUM(amt) OVER (ORDER BY amt RANGE BETWEEN UNBOUNDED PRECEDING AND CURRENT ROW) AS B
FROM T
ORDER BY id;`,
    choices: [
      ["A", "A=10, B=10", "오답이다. RANGE는 같은 정렬값을 가진 peer 행을 함께 포함한다."],
      ["B", "A=20, B=20", "정답이다. 두 번째 행까지 ROWS 누적은 20이고, RANGE는 AMT=10인 두 행을 함께 포함해 20이다."],
      ["C", "A=10, B=20", "오답이다. 두 번째 행의 ROWS 프레임은 첫 번째와 두 번째 행을 포함한다."],
      ["D", "A=20, B=40", "오답이다. RANGE CURRENT ROW는 AMT=20 행까지 포함하지 않는다."]
    ],
    answer: "B",
    relatedConceptId: "sql-window-functions",
    hint: ["ROWS는 물리적 행 단위다.", "RANGE는 정렬값이 같은 행을 같은 범위로 본다.", "두 번째 행의 AMT는 첫 번째와 같다."],
    explanation: "두 번째 행에서 ROWS 누적은 정렬상 앞의 두 행을 포함해 20이다. RANGE는 AMT=10인 peer 행 두 개를 포함하므로 역시 20이다."
  },
  {
    subjectId: "tuning",
    number: 201,
    majorTopic: "옵티마이저와 실행계획",
    middleTopic: "실행계획",
    topic: "실행계획에서 알 수 있는 정보",
    difficulty: "중급",
    questionType: "부적절한 설명 선택형",
    mode: "original",
    sourcePage: 67,
    sourceQuestionNumber: 129,
    stem: "실행계획을 통해 일반적으로 확인하기 어려운 정보로 가장 적절한 것은?",
    choices: [
      ["A", "예상 조인 순서", "오답이다. 실행계획의 트리 구조와 Operation 순서로 조인 순서를 추정할 수 있다."],
      ["B", "예상 접근 경로", "오답이다. TABLE ACCESS, INDEX RANGE SCAN 등 접근 경로가 표시된다."],
      ["C", "예상 비용과 카디널리티", "오답이다. CBO 실행계획에는 Cost와 Rows 등의 추정값이 표시된다."],
      ["D", "실제로 처리한 정확한 블록 수와 대기 시간", "정답이다. 일반 실행계획은 예상 정보이며 실제 블록 읽기와 대기 시간은 SQL Trace나 실행 통계가 필요하다."]
    ],
    answer: "D",
    relatedConceptId: "tuning-execution-plan",
    hint: ["실행계획은 기본적으로 예상 계획이다.", "Cost와 Rows는 추정값이다.", "실측값은 Trace 또는 실제 실행 통계를 봐야 한다."],
    explanation: "실행계획만으로는 실제 수행 중 발생한 정확한 CR, PR, 대기 이벤트, elapsed time을 알 수 없다. 이 정보는 SQL Trace, TKPROF, `DBMS_XPLAN.DISPLAY_CURSOR`의 ALLSTATS 계열 출력 등에서 확인한다."
  },
  {
    subjectId: "tuning",
    number: 202,
    majorTopic: "옵티마이저와 실행계획",
    middleTopic: "실행계획",
    topic: "실행 순서",
    difficulty: "상급",
    questionType: "실행계획 해석형",
    mode: "variant",
    sourcePage: 67,
    sourceQuestionNumber: 130,
    stem: "아래 실행계획에서 실제 데이터 접근이 가장 먼저 일어나는 Operation으로 가장 적절한 것은?",
    code: `Id | Operation                    | Name
 0 | SELECT STATEMENT             |
 1 |  NESTED LOOPS                |
 2 |   TABLE ACCESS BY INDEX ROWID | EMP
 3 |    INDEX RANGE SCAN          | EMP_X1
 4 |   TABLE ACCESS BY INDEX ROWID | DEPT
 5 |    INDEX UNIQUE SCAN         | DEPT_PK`,
    choices: [
      ["A", "SELECT STATEMENT", "오답이다. 루트 Operation은 결과를 반환하는 최상위 노드이지 실제 첫 접근 노드가 아니다."],
      ["B", "NESTED LOOPS", "오답이다. 조인 Operation은 자식 행 소스를 받아 처리한다."],
      ["C", "INDEX RANGE SCAN EMP_X1", "정답이다. 들여쓰기상 EMP 테이블 접근의 자식 인덱스 스캔이 먼저 시작된다."],
      ["D", "TABLE ACCESS BY INDEX ROWID DEPT", "오답이다. DEPT는 NL Join의 후행 테이블로 EMP에서 얻은 행마다 접근된다."]
    ],
    answer: "C",
    relatedConceptId: "tuning-execution-plan",
    hint: ["실행계획은 들여쓰기와 부모-자식 관계를 본다.", "인덱스 ROWID 접근 전 인덱스 스캔이 필요하다.", "NL Join에서는 선행 행 소스를 먼저 만든다."],
    explanation: "Index Range Scan으로 EMP의 ROWID를 먼저 찾고, 그 ROWID로 EMP 테이블을 접근한다. 이후 NL Join의 후행 집합인 DEPT가 반복 접근된다."
  },
  {
    subjectId: "tuning",
    number: 203,
    majorTopic: "인덱스 튜닝",
    middleTopic: "인덱스 기본",
    topic: "인덱스 사용 판단",
    difficulty: "중급",
    questionType: "부적절한 설명 선택형",
    mode: "original",
    sourcePage: 69,
    sourceQuestionNumber: 139,
    stem: "인덱스에 대한 설명으로 가장 부적절한 것은?",
    choices: [
      ["A", "인덱스는 검색 속도를 높일 수 있지만 DML 작업에는 유지 비용을 증가시킬 수 있다.", "오답이다. 인덱스는 INSERT, UPDATE, DELETE 시 함께 관리되어야 한다."],
      ["B", "인덱스 컬럼의 선택도와 클러스터링 팩터는 인덱스 효율에 영향을 준다.", "오답이다. 선택도와 테이블 랜덤 액세스 비용은 중요한 판단 요소다."],
      ["C", "조건에 맞는 데이터가 테이블 대부분이면 Full Table Scan이 더 유리할 수 있다.", "오답이다. 대량 범위에서는 순차 I/O가 더 효율적일 수 있다."],
      ["D", "인덱스가 존재하면 어떤 SQL에서도 Full Table Scan보다 항상 빠르다.", "정답이다. 인덱스는 상황에 따라 오히려 많은 랜덤 액세스를 유발할 수 있다."]
    ],
    answer: "D",
    relatedConceptId: "tuning-index-break-even",
    hint: ["인덱스는 만능이 아니다.", "랜덤 액세스가 얼마나 발생하는지 본다.", "조건 선택도가 낮으면 FTS가 유리할 수 있다."],
    explanation: "인덱스는 소량 범위 검색에 유리하지만 대량 데이터 접근에서는 테이블 랜덤 액세스가 많아져 Full Table Scan보다 불리할 수 있다."
  },
  {
    subjectId: "tuning",
    number: 204,
    majorTopic: "인덱스 튜닝",
    middleTopic: "결합 인덱스",
    topic: "선두 컬럼과 범위 조건",
    difficulty: "최상급",
    questionType: "인덱스 구성 판단형",
    mode: "original",
    sourcePage: 69,
    sourceQuestionNumber: 138,
    stem: "아래 인덱스와 SQL에 대한 설명으로 가장 적절한 것은?",
    code: `[INDEX 생성]
CREATE INDEX IDX_EMP_01 ON EMP (REGIST_DATE, DEPTNO);

[SQL 실행]
SELECT *
FROM EMP
WHERE DEPTNO = 47
  AND REGIST_DATE BETWEEN DATE '2015-02-01' AND DATE '2015-02-28';`,
    choices: [
      ["A", "REGIST_DATE가 선두 컬럼이고 범위 조건이므로 해당 월 범위를 찾은 뒤 DEPTNO 조건은 추가 필터로 평가될 수 있다.", "정답이다. 선두 컬럼 범위 스캔 안에서 후속 컬럼 조건은 스캔 범위를 크게 줄이지 못할 수 있다."],
      ["B", "DEPTNO가 조건에 있으므로 인덱스는 항상 DEPTNO=47 지점부터 탐색한다.", "오답이다. 결합 인덱스의 선두 컬럼은 REGIST_DATE다."],
      ["C", "두 컬럼 모두 조건에 있으므로 인덱스 컬럼 순서는 성능에 영향을 주지 않는다.", "오답이다. 동등 조건과 범위 조건의 위치는 스캔 효율에 큰 영향을 준다."],
      ["D", "REGIST_DATE 범위 조건이 있으므로 인덱스를 전혀 사용할 수 없다.", "오답이다. 선두 컬럼 범위 조건으로 Index Range Scan은 가능하다."]
    ],
    answer: "A",
    relatedConceptId: "tuning-composite-index",
    hint: ["결합 인덱스의 컬럼 순서를 먼저 본다.", "선두 컬럼이 범위 조건이면 이후 컬럼의 활용 범위를 생각한다.", "DEPTNO가 Access Predicate인지 Filter Predicate인지 구분한다."],
    explanation: "인덱스가 `(REGIST_DATE, DEPTNO)` 순서라면 월 범위로 먼저 스캔하고 그 내부에서 DEPTNO를 판단하게 된다. DEPTNO 선택도가 높다면 `(DEPTNO, REGIST_DATE)`가 더 유리할 수 있다."
  },
  {
    subjectId: "tuning",
    number: 205,
    majorTopic: "인덱스 튜닝",
    middleTopic: "인덱스 유형",
    topic: "로컬 프리픽스 파티션 인덱스",
    difficulty: "상급",
    questionType: "인덱스 선택형",
    mode: "original",
    sourcePage: 78,
    sourceQuestionNumber: 78,
    stem: "거래 테이블이 거래일시 기준 Range 파티션되어 있다. 다음 중 LOCAL PREFIXED 파티션 인덱스로 가장 적절한 것은?",
    code: `CREATE TABLE 거래 (
  고객번호 VARCHAR2(10),
  종목코드 VARCHAR2(20),
  거래일시 DATE,
  거래금액 NUMBER
)
PARTITION BY RANGE (거래일시) (...);`,
    choices: [
      ["A", "CREATE INDEX 거래_N1 ON 거래(거래일시) LOCAL", "정답이다. 로컬 인덱스이며 파티션 키인 거래일시가 인덱스 선두 컬럼이다."],
      ["B", "CREATE INDEX 거래_N2 ON 거래(고객번호) LOCAL", "오답이다. 로컬이지만 파티션 키가 선두 컬럼이 아니므로 prefixed가 아니다."],
      ["C", "CREATE INDEX 거래_N3 ON 거래(종목코드, 거래일시) LOCAL", "오답이다. 파티션 키가 포함되지만 선두 컬럼이 아니다."],
      ["D", "CREATE INDEX 거래_N4 ON 거래(종목코드, 거래일시)", "오답이다. LOCAL 키워드가 없고 파티션 키도 선두가 아니다."]
    ],
    answer: "A",
    relatedConceptId: "tuning-partitioning",
    hint: ["LOCAL 여부를 먼저 확인한다.", "Prefixed는 파티션 키가 인덱스 선두에 오는지 본다.", "파티션 키가 뒤에 있으면 prefixed가 아니다."],
    explanation: "Local prefixed partition index는 각 파티션에 대응되는 로컬 인덱스이면서 파티션 키가 인덱스 선두 컬럼으로 포함되어야 한다."
  },
  {
    subjectId: "tuning",
    number: 206,
    majorTopic: "인덱스 튜닝",
    middleTopic: "파티션 인덱스",
    topic: "Global/Local Prefixed",
    difficulty: "최상급",
    questionType: "인덱스 유형 조합형",
    mode: "original",
    sourcePage: 79,
    sourceQuestionNumber: 79,
    stem: "아래 DDL에서 거래_IDX1과 거래_IDX2에 해당하는 인덱스 유형을 순서대로 고른 것은?",
    code: `CREATE TABLE 거래 (
  거래번호 NUMBER,
  상품번호 VARCHAR2(6),
  거래일자 VARCHAR2(8),
  거래금액 NUMBER
)
PARTITION BY RANGE (거래일자) (...);

CREATE INDEX 거래_IDX1 ON 거래(거래일자, 상품번호)
GLOBAL PARTITION BY RANGE(거래일자) (...);

CREATE INDEX 거래_IDX2 ON 거래(거래번호, 거래일자) LOCAL;`,
    choices: [
      ["A", "Global Prefixed, Local Prefixed", "오답이다. IDX2는 LOCAL이지만 파티션 키가 선두가 아니다."],
      ["B", "Global Prefixed, Local Nonprefixed", "정답이다. IDX1은 GLOBAL 파티션 인덱스이며 파티션 키가 선두이고, IDX2는 LOCAL이지만 거래일자가 선두가 아니다."],
      ["C", "Global Nonprefixed, Local Prefixed", "오답이다. IDX1은 거래일자가 선두라 prefixed다."],
      ["D", "Local Prefixed, Global Nonprefixed", "오답이다. IDX1은 LOCAL이 아니라 GLOBAL이다."],
    ],
    answer: "B",
    relatedConceptId: "tuning-partitioning",
    hint: ["GLOBAL/LOCAL을 먼저 분리한다.", "Prefixed는 파티션 키가 인덱스 앞쪽에 오는지 판단한다.", "거래_IDX2는 거래번호가 선두다."],
    explanation: "거래_IDX1은 GLOBAL 파티션 인덱스이고 파티션 키 거래일자가 선두라 Global Prefixed다. 거래_IDX2는 LOCAL이지만 선두 컬럼이 거래번호이므로 Local Nonprefixed다."
  },
  {
    subjectId: "tuning",
    number: 207,
    majorTopic: "파티션 튜닝",
    middleTopic: "Partition Pruning",
    topic: "Range 파티션 조건",
    difficulty: "최상급",
    questionType: "최적 SQL 선택형",
    mode: "original",
    sourcePage: 77,
    sourceQuestionNumber: 77,
    stem: "주문 테이블이 주문일자 기준 월 단위 Range 파티션되어 있다. 2011년 1월부터 3월까지 주문 데이터를 월별 평균 100만 건이라고 가정할 때, 보기 중 I/O 측면에서 가장 비효율이 없는 SQL 두 개로 가장 적절한 것은?",
    code: `CREATE TABLE 주문 (
  고객번호 VARCHAR2(10),
  주문일자 VARCHAR2(8),
  주문시각 VARCHAR2(6),
  ...
)
PARTITION BY RANGE(주문일자) (
  PARTITION m201101 VALUES LESS THAN('20110201'),
  PARTITION m201102 VALUES LESS THAN('20110301'),
  PARTITION m201103 VALUES LESS THAN('20110401'),
  ...
);`,
    choices: [
      ["A", "① 단일 BETWEEN 조건과 ② 월별 UNION ALL 조건", "정답이다. 파티션 키에 대한 범위 조건을 직접 사용하므로 필요한 월 파티션만 읽는다."],
      ["B", "② 월별 UNION ALL 조건과 ③ SUBSTR(주문일자,1,6) IN 조건", "오답이다. ③은 파티션 키를 가공해 파티션 프루닝이 제한될 수 있다."],
      ["C", "③ SUBSTR 조건과 ④ NL 힌트 조인 조건", "오답이다. ③은 컬럼 가공, ④는 별도 일자 테이블 조인으로 파티션 키 조건이 직접적이지 않다."],
      ["D", "① 단일 BETWEEN 조건과 ③ SUBSTR 조건", "오답이다. ③은 파티션 키 가공 때문에 불필요한 파티션 접근 가능성이 있다."]
    ],
    answer: "A",
    relatedConceptId: "tuning-partitioning",
    hint: ["파티션 키 주문일자가 좌변에서 가공되는지 본다.", "Range 파티션은 경계값으로 대상 파티션을 잘라낼 수 있어야 한다.", "UNION ALL로 월별 범위를 직접 쓰는 방식도 프루닝에 유리하다."],
    explanation: "파티션 프루닝은 파티션 키에 대한 직접적인 범위 조건에서 가장 명확하다. `SUBSTR(주문일자,1,6)`처럼 파티션 키를 가공하면 옵티마이저가 파티션 범위를 정확히 줄이기 어렵다."
  },
  {
    subjectId: "tuning",
    number: 208,
    majorTopic: "Lock과 동시성",
    middleTopic: "Blocking",
    topic: "행 Lock 충돌",
    difficulty: "상급",
    questionType: "동시성 시나리오형",
    mode: "original",
    sourcePage: 78,
    sourceQuestionNumber: 22,
    stem: "MS-SQL Server에서 아래 UPDATE문이 아직 커밋되지 않았다. 격리 수준과 Snapshot 관련 설정을 기본값으로 둔 상황에서 블로킹 없이 동시에 수행 가능한 SQL로 가장 적절한 것은?",
    table: {
      title: "EMP",
      headers: ["EMPNO(PK)", "ENAME", "DEPTNO", "SAL"],
      rows: [
        ["7788", "김철수", "10", "3000"],
        ["7900", "이정훈", "20", "5000"],
        ["7903", "정명훈", "20", "2000"],
        ["8012", "홍길동", "30", "6000"]
      ]
    },
    code: `UPDATE EMP
SET SAL = SAL * 1.1
WHERE DEPTNO = 20;`,
    choices: [
      ["A", "SELECT * FROM EMP WHERE EMPNO = 7900", "오답이다. 기본 격리 수준에서 갱신 중인 행을 읽으려 하면 공유 잠금과 충돌할 수 있다."],
      ["B", "UPDATE EMP SET SAL = SAL * 1.1 WHERE EMPNO = 7900", "오답이다. 이미 갱신 중인 행을 다시 갱신하므로 충돌한다."],
      ["C", "DELETE FROM EMP WHERE EMPNO = 7903", "오답이다. DEPTNO=20에 해당하는 잠긴 행 삭제는 충돌한다."],
      ["D", "INSERT INTO EMP(EMPNO, ENAME, DEPTNO, SAL) VALUES(8014, '이정호', 40, 4000)", "정답이다. 새로운 PK 행 삽입이고 기존 갱신 행과 직접 충돌하지 않는다."]
    ],
    answer: "D",
    relatedConceptId: "tuning-lock",
    hint: ["UPDATE가 잠근 행은 DEPTNO=20인 두 행이다.", "읽기와 갱신이 잠금과 충돌할 수 있다.", "새로운 키 삽입이 기존 잠긴 행을 건드리는지 본다."],
    explanation: "기본 잠금 기반 격리에서는 갱신 중인 행을 읽거나 변경하는 SQL이 대기할 수 있다. 새 PK 값을 가진 다른 부서 행을 삽입하는 문장은 기존 잠긴 행과 직접 충돌하지 않는다."
  },
  {
    subjectId: "tuning",
    number: 209,
    majorTopic: "Lock과 동시성",
    middleTopic: "트랜잭션",
    topic: "Lock 경합 최소화",
    difficulty: "중급",
    questionType: "부적절한 설명 선택형",
    mode: "original",
    sourcePage: 78,
    sourceQuestionNumber: 21,
    stem: "Lock 경합에 의한 성능 저하를 최소화하기 위한 가이드라인으로 가장 부적절한 것은?",
    choices: [
      ["A", "트랜잭션의 원자성을 해치지 않는 범위에서 트랜잭션을 가능한 짧게 유지한다.", "오답이다. 잠금 보유 시간을 줄이는 좋은 방법이다."],
      ["B", "같은 데이터를 갱신하는 프로그램이 동시에 수행되지 않도록 설계한다.", "오답이다. 갱신 충돌을 줄일 수 있다."],
      ["C", "SELECT 문장은 Lock과 무관하므로 어떤 경우에도 튜닝 대상에서 제외한다.", "정답이다. SELECT도 격리 수준, 잠금 힌트, 접근 경로에 따라 경합과 대기에 영향을 줄 수 있다."],
      ["D", "조건절에 맞는 최적 인덱스를 제공하여 불필요한 잠금 범위를 줄인다.", "오답이다. 넓은 스캔은 더 많은 행이나 범위 잠금으로 이어질 수 있다."]
    ],
    answer: "C",
    relatedConceptId: "tuning-lock",
    hint: ["잠금 시간, 잠금 범위, 접근 경로를 함께 본다.", "SELECT가 항상 잠금 영향이 없는지 의심한다.", "부적절한 절대 표현을 찾는다."],
    explanation: "SELECT라도 격리 수준과 DBMS 동작, 잠금 힌트, 접근 경로에 따라 잠금 대기나 범위 잠금과 관련될 수 있다. Lock 경합 튜닝에서 무조건 제외할 수 없다."
  },
  {
    subjectId: "tuning",
    number: 210,
    majorTopic: "대량 DML 튜닝",
    middleTopic: "Direct Path Insert",
    topic: "테이블 Lock",
    difficulty: "상급",
    questionType: "대기 상태 판단형",
    mode: "original",
    sourcePage: 70,
    sourceQuestionNumber: 70,
    stem: "아래 INSERT ALL 문장을 서로 다른 세션에서 순차 수행할 때 두 번째 세션의 상태로 가장 올바른 것은?",
    code: `INSERT /*+ APPEND */ ALL
WHEN :v_주식선물구분 = '주식' THEN
  INTO 주식월별시세(종목코드, 거래일자, 종가)
WHEN :v_주식선물구분 = '선물' THEN
  INTO 선물월별시세(종목코드, 거래일자, 종가)
SELECT 종목코드, :v_기준일자 AS 거래일자, AVG(종가) AS 종가
FROM 주식일별시세
GROUP BY 종목코드;`,
    choices: [
      ["A", "TM 락을 Row-X(SX) 모드로 요청하고 대기한다.", "오답이다. Direct Path Insert는 일반 행 단위 DML보다 강한 테이블 잠금이 필요할 수 있다."],
      ["B", "TX 락을 Exclusive 모드로 요청하고 대기한다.", "오답이다. 행 충돌이 아니라 대상 세그먼트에 대한 테이블 수준 잠금 성격을 먼저 본다."],
      ["C", "TM 락을 Exclusive 모드로 요청하고 대기한다.", "정답이다. APPEND Direct Path Insert는 대상 테이블에 강한 TM 락을 요구해 동시 삽입이 대기할 수 있다."],
      ["D", "정상적으로 수행된다.", "오답이다. 같은 대상 테이블에 Direct Path Insert가 동시에 진행되면 대기할 수 있다."]
    ],
    answer: "C",
    relatedConceptId: "tuning-direct-path-insert",
    hint: ["APPEND 힌트는 Direct Path Insert를 의미한다.", "Direct Path Insert는 세그먼트 끝에 직접 적재하며 강한 테이블 잠금이 필요할 수 있다.", "행 Lock이 아니라 TM Lock 모드를 본다."],
    explanation: "Direct Path Insert는 버퍼 캐시를 우회하고 세그먼트 고수위선을 조정하는 특성 때문에 대상 테이블에 강한 TM 잠금을 요구할 수 있다. 같은 대상에 대한 후속 Direct Path Insert는 대기 상태가 될 수 있다."
  },
  {
    subjectId: "tuning",
    number: 211,
    majorTopic: "SQL 튜닝",
    middleTopic: "SQL Rewrite",
    topic: "UPDATE와 MERGE",
    difficulty: "최상급",
    questionType: "튜닝 설명 선택형",
    mode: "variant",
    sourcePage: 73,
    sourceQuestionNumber: 73,
    stem: "상관 서브쿼리 UPDATE와 MERGE 문장을 비교한 설명으로 가장 적절한 것은?",
    code: `UPDATE 급여지급 T
SET 월급여 = (SELECT 월급여 FROM 사원 S WHERE S.사원번호 = T.사원번호)
WHERE 급여월 = '201101'
  AND EXISTS (SELECT 1 FROM 사원 S WHERE S.사원번호 = T.사원번호 AND S.부서코드 = '30');

MERGE INTO 급여지급 T
USING (SELECT 사원번호, 월급여 FROM 사원 WHERE 부서코드 = '30') S
ON (T.급여월 = '201101' AND T.사원번호 = S.사원번호)
WHEN MATCHED THEN UPDATE SET T.월급여 = S.월급여;`,
    choices: [
      ["A", "MERGE는 항상 UPDATE보다 빠르므로 실행계획 확인이 필요 없다.", "오답이다. 실행계획과 인덱스 구성에 따라 다르다."],
      ["B", "UPDATE는 상관 서브쿼리와 EXISTS가 분리되어 사원 테이블 반복 접근이 발생할 수 있으므로 MERGE의 조인 실행계획과 비교해야 한다.", "정답이다. 결과가 같아도 반복 액세스 여부와 조인 방식에 따라 성능이 달라진다."],
      ["C", "MERGE는 UPDATE 처리를 할 수 없고 INSERT만 가능하다.", "오답이다. WHEN MATCHED THEN UPDATE가 가능하다."],
      ["D", "두 SQL은 문법만 다르고 옵티마이저가 항상 동일한 실행계획으로 바꾼다.", "오답이다. 항상 동일한 계획을 보장하지 않는다."]
    ],
    answer: "B",
    relatedConceptId: "tuning-sql-rewrite",
    hint: ["업무 결과와 실행 비용을 분리해서 본다.", "상관 서브쿼리가 반복될 가능성을 본다.", "MERGE도 실행계획 확인이 필요하다."],
    explanation: "상관 서브쿼리 UPDATE는 조건에 따라 내부 테이블 반복 접근이 생길 수 있다. MERGE는 조인 기반으로 재작성할 수 있지만 항상 빠른 것은 아니므로 실제 실행계획과 인덱스 구성을 비교해야 한다."
  },
  {
    subjectId: "tuning",
    number: 212,
    majorTopic: "SQL Trace",
    middleTopic: "TKPROF",
    topic: "Trace 해석",
    difficulty: "최상급",
    questionType: "Trace 분석형",
    mode: "original",
    sourcePage: 51,
    sourceQuestionNumber: 51,
    stem: "아래 Trace 결과를 가장 적절히 설명한 보기 두 개를 고른다면 포함되어야 할 내용으로 가장 적절한 것은?",
    table: {
      title: "Trace 요약",
      headers: ["Call", "Count", "CPU", "Elapsed", "Disk", "Query", "Current", "Rows"],
      rows: [
        ["Parse", "1", "0.00", "0.02", "0", "0", "0", "0"],
        ["Execute", "1", "0.00", "0.00", "0", "0", "0", "0"],
        ["Fetch", "78", "10.50", "49.39", "2780", "266408", "0", "1999"]
      ]
    },
    choices: [
      ["A", "Fetch 단계의 Query가 매우 크므로 인덱스 ROWID 기반 테이블 랜덤 액세스 비용을 의심한다.", "정답이다. Fetch에서 논리 읽기가 집중되어 있고 Rows 대비 Query가 크다."],
      ["B", "Parse 단계가 대부분의 시간을 사용하므로 바인드 변수만 적용하면 해결된다.", "오답이다. Parse 비용은 작고 Fetch 비용이 크다."],
      ["C", "Disk가 0이 아니므로 모든 병목은 물리 I/O뿐이며 논리 읽기는 무시한다.", "오답이다. Query 논리 읽기가 매우 크므로 함께 봐야 한다."],
      ["D", "CPU와 Elapsed 차이가 크므로 I/O 대기 또는 경합 가능성도 함께 확인한다.", "정답에 포함될 수 있다. Elapsed가 CPU보다 훨씬 크면 대기 시간을 확인해야 한다."]
    ],
    answer: "A",
    relatedConceptId: "tuning-sql-trace",
    hint: ["Call별로 시간이 어디에 몰리는지 본다.", "Rows 대비 Query 값을 본다.", "CPU와 Elapsed 차이는 대기 가능성을 알려준다."],
    explanation: "Trace에서 대부분의 작업은 Fetch 단계에 집중되어 있다. Query 논리 읽기가 매우 크고 Rows는 1999건이므로 인덱스 스캔 후 테이블 랜덤 액세스가 과도한지 확인해야 한다. Elapsed와 CPU 차이도 추가 대기 분석의 단서가 된다."
  },
  {
    subjectId: "tuning",
    number: 213,
    majorTopic: "SQL 튜닝",
    middleTopic: "SQL Rewrite",
    topic: "UNION ALL 분기",
    difficulty: "최상급",
    questionType: "SQL 선택형",
    mode: "variant",
    sourcePage: 67,
    sourceQuestionNumber: 67,
    stem: "아래 SQL 중 UNION 대신 UNION ALL로 바꾸어도 의미가 보존된다고 판단하기 가장 쉬운 것은?",
    passage: "EMP 테이블에서 EMPNO는 PK이며, DEPTNO와 JOB은 중복될 수 있다.",
    choices: [
      ["A", "SELECT deptno, job FROM emp WHERE empno = 7499 UNION SELECT deptno, job FROM emp WHERE empno = 7654", "정답이다. 서로 다른 PK 조건으로 한 행씩 읽고, 같은 사원 행이 중복될 수 없다는 근거가 가장 명확하다."],
      ["B", "SELECT job FROM emp WHERE deptno = 10 UNION SELECT job FROM emp WHERE deptno = 20", "오답이다. 서로 다른 부서에 같은 JOB이 존재할 수 있다."],
      ["C", "SELECT deptno FROM emp WHERE job = 'CLERK' UNION SELECT deptno FROM emp WHERE job = 'SALESMAN'", "오답이다. 두 직무가 다른 행이어도 결과 컬럼 DEPTNO는 중복될 수 있다."],
      ["D", "SELECT mgr FROM emp WHERE sal > 1000 UNION SELECT mgr FROM emp WHERE sal > 2000", "오답이다. 두 조건은 포함 관계라 중복 가능성이 크다."]
    ],
    answer: "A",
    relatedConceptId: "tuning-query-transformation",
    hint: ["UNION ALL은 중복 제거를 하지 않는다.", "반환 컬럼 조합이 중복될 수 없는 근거가 필요하다.", "PK 조건은 같은 행이 두 번 나오는 것을 막는 강한 근거다."],
    explanation: "UNION ALL로 바꾸려면 두 분기 결과가 중복되지 않아야 한다. EMPNO가 PK이고 서로 다른 EMPNO 조건이면 같은 행이 두 분기에서 동시에 나오지 않는다."
  },
  {
    subjectId: "tuning",
    number: 214,
    majorTopic: "옵티마이저",
    middleTopic: "통계정보",
    topic: "Selectivity와 Cardinality",
    difficulty: "상급",
    questionType: "개념 비교형",
    mode: "similar",
    sourcePage: 68,
    sourceQuestionNumber: 134,
    stem: "옵티마이저가 조건절 `DEPTNO = 10`의 결과 건수를 추정하는 과정에 대한 설명으로 가장 적절한 것은?",
    choices: [
      ["A", "Selectivity는 조건을 만족할 비율이고, Cardinality는 그 비율을 전체 행 수에 적용한 예상 행 수다.", "정답이다. 선택도와 카디널리티의 관계를 정확히 설명한다."],
      ["B", "Selectivity와 Cardinality는 모두 실제 실행 후의 정확한 반환 행 수다.", "오답이다. 옵티마이저 단계에서는 추정값이다."],
      ["C", "Cardinality가 작을수록 항상 Hash Join이 선택된다.", "오답이다. 조인 방식은 입력 크기, 인덱스, 비용 등 여러 요소에 따라 결정된다."],
      ["D", "통계정보가 없어도 옵티마이저는 항상 정확한 선택도를 계산한다.", "오답이다. 통계 부재나 왜곡은 잘못된 추정으로 이어질 수 있다."]
    ],
    answer: "A",
    relatedConceptId: "tuning-cardinality",
    hint: ["비율과 행 수를 구분한다.", "옵티마이저의 값은 대부분 추정이다.", "통계정보가 추정 품질에 영향을 준다."],
    explanation: "Selectivity는 조건을 만족할 것으로 예상되는 비율이고, Cardinality는 해당 비율을 입력 행 수에 적용해 얻는 예상 행 수다. 이 추정이 Access Path와 Join Order 선택에 큰 영향을 준다."
  },
  {
    subjectId: "tuning",
    number: 215,
    majorTopic: "조인 튜닝",
    middleTopic: "Nested Loops Join",
    topic: "후행 인덱스",
    difficulty: "상급",
    questionType: "조인 방식 판단형",
    mode: "similar",
    sourcePage: 72,
    sourceQuestionNumber: 146,
    stem: "Nested Loops Join이 효율적으로 수행되기 위한 조건으로 가장 적절한 것은?",
    choices: [
      ["A", "선행 집합이 작고 후행 테이블 조인 컬럼에 효율적인 인덱스가 있어 반복 접근 비용이 작아야 한다.", "정답이다. NL Join은 선행 행마다 후행을 탐색하므로 후행 인덱스가 중요하다."],
      ["B", "후행 테이블에 인덱스가 없어도 선행 집합이 크면 항상 가장 빠르다.", "오답이다. 큰 선행 집합과 후행 Full Scan 반복은 매우 비효율적이다."],
      ["C", "NL Join은 정렬이 필요하므로 항상 Sort Merge Join보다 느리다.", "오답이다. NL Join은 조인 자체에 정렬이 필수는 아니다."],
      ["D", "NL Join은 대량 배치에서는 절대 사용할 수 없다.", "오답이다. 조건, 인덱스, 부분범위 처리에 따라 사용할 수 있다."]
    ],
    answer: "A",
    relatedConceptId: "tuning-nested-loops",
    hint: ["NL은 반복 탐색 구조다.", "선행 집합 크기와 후행 접근 비용을 곱해 생각한다.", "후행 인덱스가 반복 비용을 낮춘다."],
    explanation: "NL Join은 선행 Row Source의 각 행마다 후행 Row Source를 탐색한다. 선행 집합이 작고 후행 조인 컬럼 인덱스가 효율적이면 빠르지만, 반복 접근 횟수가 커지면 비용이 급증한다."
  },
  {
    subjectId: "tuning",
    number: 216,
    majorTopic: "조인 튜닝",
    middleTopic: "Hash Join",
    topic: "Build Input",
    difficulty: "상급",
    questionType: "조인 방식 선택형",
    mode: "variant",
    sourcePage: 72,
    sourceQuestionNumber: 147,
    stem: "Hash Join에서 Build Input으로 선택하기에 일반적으로 더 적절한 집합은?",
    choices: [
      ["A", "조인 전에 필터링되어 상대적으로 작아진 집합", "정답이다. 작은 집합으로 해시 테이블을 만들면 메모리 사용과 Spill 위험을 줄일 수 있다."],
      ["B", "항상 큰 테이블", "오답이다. 큰 입력으로 해시 테이블을 만들면 메모리 부담이 커진다."],
      ["C", "인덱스가 없는 테이블은 크기와 무관하게 항상 Probe Input이다.", "오답이다. Build/Probe 선택은 크기, 필터링, 통계 등 비용에 따라 결정된다."],
      ["D", "ORDER BY 절에 등장한 테이블", "오답이다. 정렬 기준과 Hash Join의 Build Input 선택은 직접적인 기준이 아니다."]
    ],
    answer: "A",
    relatedConceptId: "tuning-hash-join",
    hint: ["Hash Join은 Build 단계에서 해시 테이블을 만든다.", "해시 테이블은 메모리에 담길수록 유리하다.", "필터링 후 크기가 작은 쪽이 유리하다."],
    explanation: "Hash Join은 Build Input을 읽어 해시 테이블을 만들고 Probe Input으로 탐색한다. Build Input이 작을수록 메모리 사용과 TEMP Spill 위험이 낮다."
  },
  {
    subjectId: "tuning",
    number: 217,
    majorTopic: "인덱스 튜닝",
    middleTopic: "인덱스 손익분기점",
    topic: "클러스터링 팩터",
    difficulty: "최상급",
    questionType: "성능 원인 판단형",
    mode: "similar",
    sourcePage: 51,
    sourceQuestionNumber: 51,
    stem: "같은 조건으로 2,000건을 조회하는데 인덱스 Range Scan 후 TABLE ACCESS BY ROWID에서 논리 읽기가 과도하다. 가장 먼저 의심할 원인으로 적절한 것은?",
    choices: [
      ["A", "인덱스 컬럼의 클러스터링 팩터가 나빠 테이블 블록 랜덤 액세스가 많이 발생한다.", "정답이다. 인덱스 순서와 테이블 저장 순서가 멀면 ROWID 접근이 많은 블록 방문으로 이어진다."],
      ["B", "Parse Count가 1이라서 항상 하드 파싱 병목이다.", "오답이다. 조회 비용의 핵심은 Fetch 단계의 블록 읽기다."],
      ["C", "인덱스가 있으므로 테이블 액세스 비용은 항상 0이다.", "오답이다. 인덱스로 ROWID를 찾은 뒤 테이블 블록을 읽어야 한다."],
      ["D", "Rows가 2,000건이면 어떤 테이블에서도 반드시 Full Scan이 더 느리다.", "오답이다. 테이블 크기, CF, 캐시 상태, 선택도에 따라 다르다."]
    ],
    answer: "A",
    relatedConceptId: "tuning-clustering-factor",
    hint: ["인덱스 스캔 비용과 테이블 액세스 비용을 분리한다.", "ROWID로 테이블을 읽을 때 블록 방문 수를 생각한다.", "클러스터링 팩터가 좋으면 근접 행이 같은 블록에 모여 있다."],
    explanation: "인덱스 Range Scan 자체보다 테이블 ROWID 액세스에서 논리 읽기가 많이 발생하면 클러스터링 팩터와 테이블 랜덤 액세스를 확인해야 한다."
  },
  {
    subjectId: "tuning",
    number: 218,
    majorTopic: "SQL 튜닝",
    middleTopic: "OR Expansion",
    topic: "USE_CONCAT",
    difficulty: "상급",
    questionType: "쿼리 변환 선택형",
    mode: "similar",
    sourcePage: 6,
    sourceQuestionNumber: 20,
    stem: "OR 조건 때문에 서로 다른 인덱스를 효율적으로 사용하기 어려운 SQL을 UNION ALL 분기로 나누어 각 분기에서 적절한 인덱스를 타게 하는 변환은?",
    choices: [
      ["A", "OR Expansion 또는 Concatenation", "정답이다. OR 조건을 여러 분기로 분해해 UNION ALL 형태로 처리할 수 있다."],
      ["B", "Subquery Unnesting", "오답이다. 서브쿼리를 조인으로 풀어내는 변환이다."],
      ["C", "View Merging", "오답이다. 인라인 뷰를 외부 쿼리와 병합하는 변환이다."],
      ["D", "Join Elimination", "오답이다. 불필요한 조인을 제거하는 변환이다."],
    ],
    answer: "A",
    relatedConceptId: "tuning-query-transformation",
    hint: ["OR 조건을 분리하는 변환을 떠올린다.", "UNION ALL 형태가 핵심이다.", "Oracle 힌트로 USE_CONCAT이 관련된다."],
    explanation: "OR Expansion은 OR 조건을 여러 분기로 나누어 각 분기가 적절한 인덱스를 사용할 수 있게 하는 쿼리 변환이다. Oracle에서는 USE_CONCAT 힌트와 관련된다."
  },
  {
    subjectId: "tuning",
    number: 219,
    majorTopic: "파티션 튜닝",
    middleTopic: "Partition Pruning",
    topic: "함수 기반 조건",
    difficulty: "상급",
    questionType: "비효율 원인 선택형",
    mode: "variant",
    sourcePage: 77,
    sourceQuestionNumber: 77,
    stem: "주문 테이블이 주문일자(YYYYMMDD 문자) 기준 Range 파티션되어 있을 때 다음 조건이 비효율적일 수 있는 주된 이유는?",
    code: `WHERE SUBSTR(주문일자, 1, 6) IN ('201101', '201102', '201103')`,
    choices: [
      ["A", "파티션 키 컬럼을 함수로 가공해 파티션 프루닝과 인덱스 Range Scan이 제한될 수 있기 때문이다.", "정답이다. 파티션 키를 그대로 범위 비교하는 조건이 더 명확하다."],
      ["B", "IN 조건은 Oracle에서 문법적으로 사용할 수 없기 때문이다.", "오답이다. IN 조건 자체는 문법적으로 가능하다."],
      ["C", "문자 컬럼에는 Range 파티션을 만들 수 없기 때문이다.", "오답이다. 문자형 값도 경계값 기준 Range 파티션이 가능하다."],
      ["D", "SUBSTR을 사용하면 항상 결과가 0건이 되기 때문이다.", "오답이다. 결과 의미가 아니라 접근 경로와 프루닝 효율 문제다."]
    ],
    answer: "A",
    relatedConceptId: "tuning-partitioning",
    hint: ["파티션 키가 좌변에서 그대로 쓰였는지 본다.", "함수 적용은 경계값 추론을 어렵게 한다.", "월별 범위 조건으로 바꿀 수 있는지 생각한다."],
    explanation: "파티션 키를 함수로 감싸면 옵티마이저가 파티션 경계를 직접 이용하기 어렵다. `주문일자 BETWEEN '20110101' AND '20110331'` 또는 월별 범위 UNION ALL 같은 방식이 더 명확하다."
  },
  {
    subjectId: "tuning",
    number: 220,
    majorTopic: "옵티마이저",
    middleTopic: "인덱스 스캔",
    topic: "Index Skip Scan",
    difficulty: "상급",
    questionType: "스캔 방식 판단형",
    mode: "similar",
    sourcePage: 69,
    sourceQuestionNumber: 137,
    stem: "결합 인덱스가 `(성별, 고객등급, 가입일자)` 순서이고 성별의 NDV가 2로 매우 낮다. SQL이 성별 조건 없이 고객등급과 가입일자만 조건으로 사용한다. 옵티마이저가 고려할 수 있는 인덱스 스캔 방식으로 가장 적절한 것은?",
    choices: [
      ["A", "Index Unique Scan", "오답이다. 선두 컬럼 조건 없이 유일 인덱스 단건 탐색을 보장하는 상황이 아니다."],
      ["B", "Index Skip Scan", "정답이다. 선두 컬럼의 NDV가 낮으면 가능한 선두 값을 건너뛰며 후속 컬럼 조건으로 탐색할 수 있다."],
      ["C", "Index Fast Full Scan만 가능하다.", "오답이다. Fast Full Scan도 가능할 수 있지만, 후속 컬럼 조건을 활용한 Skip Scan을 고려할 수 있다."],
      ["D", "Full Table Scan만 가능하고 인덱스는 절대 사용할 수 없다.", "오답이다. 선두 컬럼 조건이 없어도 Skip Scan 같은 대안이 있을 수 있다."]
    ],
    answer: "B",
    relatedConceptId: "tuning-index-scan-efficiency",
    hint: ["결합 인덱스 선두 컬럼 조건이 없는 상황이다.", "선두 컬럼 NDV가 낮으면 어떤 스캔을 고려할 수 있는지 떠올린다.", "Skip Scan은 선두 값을 여러 번 나누어 탐색하는 방식이다."],
    explanation: "Index Skip Scan은 결합 인덱스의 선두 컬럼 조건이 없더라도 선두 컬럼의 distinct 값이 적을 때 각 선두 값 조합을 건너뛰며 후속 컬럼 조건을 활용할 수 있는 방식이다."
  }
];
