import type { Choice, ChoiceId, ConceptArticle, Difficulty, LabQuestion, ObjectiveQuestion, SubjectId } from "@/lib/types";

const choiceIds: ChoiceId[] = ["A", "B", "C", "D"];

type ExamSeed = {
  topic: string;
  difficulty: Difficulty;
  stem: string;
  passage?: string;
  code?: string;
  table?: ObjectiveQuestion["table"];
  choices: [string, string, string, string];
  answerIndex: 0 | 1 | 2 | 3;
  hint: string;
  explanation: string;
};

type ExamBank = {
  id: SubjectId;
  name: string;
  seeds: ExamSeed[];
};

function makeChoices(seed: ExamSeed): Choice[] {
  return seed.choices.map((text, index) => ({ id: choiceIds[index], text }));
}

function makeWhyWrong(seed: ExamSeed): Record<ChoiceId, string> {
  return choiceIds.reduce(
    (acc, id, index) => {
      acc[id] =
        index === seed.answerIndex
          ? `정답입니다. ${seed.explanation}`
          : `오답입니다. ${seed.choices[index]}는 지문의 조건, SQL 처리 순서, 실행계획 근거 중 일부를 놓친 선택지입니다.`;
      return acc;
    },
    {} as Record<ChoiceId, string>
  );
}

function build(bank: ExamBank, count: number, startIndex = 0, idPrefix: string = bank.id): ObjectiveQuestion[] {
  return Array.from({ length: count }, (_, offset) => {
    const index = startIndex + offset;
    const seed = bank.seeds[index % bank.seeds.length];
    return {
      id: `${idPrefix}-${String(index + 1).padStart(3, "0")}`,
      number: index + 1,
      subjectId: bank.id,
      subjectName: bank.name,
      topic: seed.topic,
      difficulty: seed.difficulty,
      stem: seed.stem,
      passage: seed.passage,
      code: seed.code,
      table: seed.table,
      choices: makeChoices(seed),
      answer: choiceIds[seed.answerIndex],
      hint: seed.hint,
      explanation: seed.explanation,
      whyWrong: makeWhyWrong(seed)
    };
  });
}

const modeling: ExamBank = {
  id: "modeling",
  name: "1과목 데이터 모델링의 이해",
  seeds: [
    {
      topic: "엔터티",
      difficulty: "기본",
      stem: "다음 중 엔터티로 보기 가장 어려운 것은?",
      table: {
        headers: ["후보", "업무 설명"],
        rows: [
          ["고객", "서비스에 가입하고 주문을 발생시킨다."],
          ["주문", "주문번호로 식별되며 주문일자와 상태를 가진다."],
          ["상담이력", "고객별로 여러 건 발생하고 처리결과를 관리한다."],
          ["고객명", "고객을 표시하기 위한 이름 값이다."]
        ]
      },
      choices: ["고객", "주문", "상담이력", "고객명"],
      answerIndex: 3,
      hint: "값 자체인지, 식별 가능한 인스턴스 집합인지 구분하세요.",
      explanation: "고객명은 고객 엔터티의 속성에 가깝고, 독립적인 인스턴스 집합으로 보기 어렵습니다."
    },
    {
      topic: "속성",
      difficulty: "기본",
      stem: "다음 설명에 해당하는 속성 분류로 가장 적절한 것은?",
      passage: "주문금액은 주문수량과 상품단가를 이용해 계산할 수 있으며, 업무상 저장하지 않아도 재계산이 가능하다.",
      choices: ["기본 속성", "설계 속성", "파생 속성", "외래 속성"],
      answerIndex: 2,
      hint: "다른 속성으로 계산되는 값입니다.",
      explanation: "주문금액처럼 다른 속성으로 산출 가능한 값은 파생 속성으로 분류합니다."
    },
    {
      topic: "관계",
      difficulty: "중간",
      stem: "아래 업무 규칙을 논리 모델 관계로 표현할 때 가장 적절한 것은?",
      passage: "한 고객은 주문을 하지 않을 수도 있다. 하나의 주문은 반드시 한 명의 고객에 의해 생성된다.",
      choices: ["고객과 주문은 1:1 필수 관계", "고객 선택, 주문 필수의 1:M 관계", "고객 필수, 주문 선택의 M:N 관계", "관계가 없고 주문에 고객명을 중복 저장"],
      answerIndex: 1,
      hint: "고객 쪽에서 주문 존재가 선택인지 필수인지 보세요.",
      explanation: "고객은 주문이 없을 수 있고 주문은 고객이 필수이므로 고객-주문은 고객 기준 선택 1:M 관계입니다."
    },
    {
      topic: "식별자",
      difficulty: "중간",
      stem: "다음 중 주식별자 선정 기준으로 가장 부적절한 것은?",
      choices: ["유일성", "최소성", "불변성 또는 안정성", "컬럼 길이가 길수록 우선"],
      answerIndex: 3,
      hint: "식별자는 길이보다 업무 식별성과 안정성이 중요합니다.",
      explanation: "식별자는 유일성, 최소성, 안정성, 존재성을 봅니다. 길이가 길수록 우선한다는 기준은 없습니다."
    },
    {
      topic: "정규화",
      difficulty: "중간",
      stem: "다음 테이블에서 가장 직접적으로 의심되는 정규형 위반은?",
      table: {
        headers: ["주문번호", "고객번호", "고객등급", "등급할인율"],
        rows: [
          ["O1001", "C01", "GOLD", "10%"],
          ["O1002", "C02", "SILVER", "5%"],
          ["O1003", "C03", "GOLD", "10%"]
        ]
      },
      passage: "등급할인율은 고객등급에만 종속된다.",
      choices: ["1정규형 위반", "2정규형 위반", "3정규형 위반", "도메인 무결성 위반만 해당"],
      answerIndex: 2,
      hint: "비식별자 속성 간 종속을 찾으세요.",
      explanation: "고객등급 -> 등급할인율은 비식별자 속성 간 이행 종속이므로 3NF 위반으로 볼 수 있습니다."
    },
    {
      topic: "반정규화",
      difficulty: "실전",
      stem: "반정규화를 검토하는 순서로 가장 적절한 것은?",
      choices: ["중복 컬럼 추가 후 SQL을 검토한다.", "정규화 모델, SQL, 인덱스, 통계를 검토한 뒤 정합성 유지 방안과 함께 적용한다.", "조인이 2개 이상이면 무조건 반정규화한다.", "반정규화는 정합성 검증이 필요 없다."],
      answerIndex: 1,
      hint: "반정규화는 마지막에 가까운 처방입니다.",
      explanation: "반정규화는 검증된 성능 병목과 정합성 유지 방안이 있을 때 제한적으로 적용합니다."
    },
    {
      topic: "NULL 속성",
      difficulty: "중간",
      stem: "NULL 속성에 대한 설명으로 옳은 것은?",
      choices: ["NULL은 숫자 0과 동일하다.", "Oracle에서 빈 문자열은 NULL로 취급될 수 있다.", "NULL 비교는 = NULL로 한다.", "집계 함수는 모든 NULL을 항상 0으로 바꾼다."],
      answerIndex: 1,
      hint: "Oracle의 빈 문자열 처리와 3값 논리를 떠올리세요.",
      explanation: "Oracle에서는 빈 문자열이 NULL로 취급됩니다. NULL 비교는 IS NULL을 사용해야 합니다."
    },
    {
      topic: "슈퍼타입/서브타입",
      difficulty: "실전",
      stem: "슈퍼타입/서브타입 물리 모델 변환 시 고려 사항으로 거리가 먼 것은?",
      choices: ["조회 패턴", "서브타입별 데이터 발생량", "배타성 여부", "서브타입 이름의 글자 수"],
      answerIndex: 3,
      hint: "물리화는 데이터와 업무 패턴이 기준입니다.",
      explanation: "통합/분리 판단에는 조회 패턴, 데이터량, 공통 속성 비율, 배타성 등이 중요합니다."
    },
    {
      topic: "M:N 관계",
      difficulty: "중간",
      stem: "아래 업무에서 필요한 모델링으로 가장 적절한 것은?",
      passage: "학생은 여러 과목을 수강할 수 있고, 과목은 여러 학생이 수강할 수 있다. 수강일자와 성적은 수강 관계에 종속된다.",
      choices: ["학생 테이블에 과목코드1, 과목코드2를 둔다.", "과목 테이블에 학생목록 문자열을 둔다.", "수강 엔터티를 두고 수강일자와 성적을 관리한다.", "학생명과 과목명을 하나의 컬럼에 저장한다."],
      answerIndex: 2,
      hint: "관계 자체가 속성을 가지면 엔터티 후보입니다.",
      explanation: "M:N 관계는 교차 엔터티로 해소하고 관계 속성을 해당 엔터티에 둡니다."
    },
    {
      topic: "모델과 SQL",
      difficulty: "실전",
      stem: "다음 모델에서 주문이 없는 고객까지 조회해야 할 때 적절한 SQL 방향은?",
      table: {
        headers: ["엔터티", "주요 속성", "관계"],
        rows: [
          ["고객", "고객번호, 고객명", "고객 1 : 주문 N"],
          ["주문", "주문번호, 고객번호, 주문일자", "주문은 고객 필수"]
        ]
      },
      choices: ["고객 INNER JOIN 주문", "고객 LEFT OUTER JOIN 주문", "주문 INNER JOIN 고객", "주문만 조회"],
      answerIndex: 1,
      hint: "보존되어야 하는 기준 집합은 고객입니다.",
      explanation: "주문이 없는 고객도 결과에 포함해야 하므로 고객 기준 외부 조인을 사용해야 합니다."
    },
    {
      topic: "이력 모델",
      difficulty: "실전",
      stem: "고객 등급 변경 이력을 관리하기 위한 속성 조합으로 가장 적절한 것은?",
      choices: ["고객번호, 현재등급만 저장", "고객번호, 등급, 적용시작일, 적용종료일", "고객명, 등급명만 저장", "등급코드만 별도 테이블에 저장"],
      answerIndex: 1,
      hint: "이력은 기간 또는 시점이 있어야 합니다.",
      explanation: "이력 관리를 위해서는 식별 대상과 값, 적용 기간을 함께 관리해야 합니다."
    },
    {
      topic: "관계명",
      difficulty: "기본",
      stem: "관계명 작성 기준으로 가장 적절한 것은?",
      choices: ["양쪽 관계의 의미가 드러나도록 동사형으로 표현한다.", "테이블명을 그대로 반복한다.", "항상 생략한다.", "관계명은 물리 모델에서만 필요하다."],
      answerIndex: 0,
      hint: "관계명은 업무 의미를 전달해야 합니다.",
      explanation: "관계명은 엔터티 사이의 업무적 의미를 명확하게 표현해야 합니다."
    }
  ]
};

const sqlBasic: ExamBank = {
  id: "sql-basic",
  name: "2과목 SQL 기본 및 활용",
  seeds: [
    {
      topic: "SELECT 처리 순서",
      difficulty: "기본",
      stem: "다음 SQL에서 SELECT 절 별칭 AMT를 WHERE 절에서 사용할 수 없는 주된 이유는?",
      code: "SELECT order_id, amount AS amt\nFROM orders\nWHERE amt >= 10000;",
      choices: ["WHERE가 SELECT보다 논리적으로 먼저 처리되기 때문이다.", "별칭은 ORDER BY에서만 절대 사용할 수 없다.", "숫자 컬럼에는 별칭을 줄 수 없다.", "FROM 절이 가장 마지막에 처리되기 때문이다."],
      answerIndex: 0,
      hint: "논리 처리 순서를 보세요.",
      explanation: "WHERE는 SELECT보다 먼저 처리되므로 SELECT에서 만든 별칭을 WHERE에서 바로 사용할 수 없습니다."
    },
    {
      topic: "NULL과 집계",
      difficulty: "중간",
      stem: "아래 테이블에 대해 SQL 실행 결과로 옳은 것은?",
      table: {
        headers: ["ID", "VAL"],
        rows: [
          ["1", "10"],
          ["2", "NULL"],
          ["3", "20"]
        ]
      },
      code: "SELECT COUNT(*) C1, COUNT(val) C2, SUM(val) S\nFROM T;",
      choices: ["C1=3, C2=2, S=30", "C1=2, C2=2, S=30", "C1=3, C2=3, S=30", "C1=3, C2=2, S=NULL"],
      answerIndex: 0,
      hint: "COUNT(*)와 COUNT(컬럼)을 구분하세요.",
      explanation: "COUNT(*)는 전체 행 3건, COUNT(val)은 NULL 제외 2건, SUM(val)은 NULL 제외 합계 30입니다."
    },
    {
      topic: "외부 조인",
      difficulty: "실전",
      stem: "아래 SQL의 문제점으로 가장 적절한 것은?",
      code: "SELECT c.cust_id, o.order_id\nFROM customers c LEFT JOIN orders o\n  ON o.cust_id = c.cust_id\nWHERE o.status_cd = 'PAID';",
      choices: ["주문이 없는 고객이 제거될 수 있다.", "LEFT JOIN은 문법 오류다.", "WHERE 절은 조인 후 사용할 수 없다.", "고객 테이블이 항상 제거된다."],
      answerIndex: 0,
      hint: "오른쪽 테이블 조건이 WHERE에 있습니다.",
      explanation: "외부 조인 후 오른쪽 테이블 조건을 WHERE에 두면 NULL 보존 행이 제거되어 내부 조인처럼 동작할 수 있습니다."
    },
    {
      topic: "NOT IN",
      difficulty: "중간",
      stem: "다음 SQL에서 서브쿼리 결과에 NULL이 포함될 때 발생 가능한 현상은?",
      code: "SELECT empno\nFROM emp\nWHERE deptno NOT IN (SELECT deptno FROM closed_dept);",
      choices: ["기대한 행이 반환되지 않을 수 있다.", "NULL은 자동 제외되어 항상 정상 동작한다.", "NOT IN은 EXISTS로 자동 변환되어 결과가 같다.", "서브쿼리에 NULL이 있으면 문법 오류다."],
      answerIndex: 0,
      hint: "3값 논리의 UNKNOWN을 생각하세요.",
      explanation: "NOT IN 목록에 NULL이 포함되면 비교 결과가 UNKNOWN이 되어 기대한 결과가 나오지 않을 수 있습니다."
    },
    {
      topic: "GROUP BY",
      difficulty: "기본",
      stem: "부서별 평균 급여가 5000 이상인 부서를 조회하는 조건 위치로 옳은 것은?",
      choices: ["WHERE AVG(sal) >= 5000", "HAVING AVG(sal) >= 5000", "ORDER BY AVG(sal) >= 5000", "FROM AVG(sal) >= 5000"],
      answerIndex: 1,
      hint: "집계 후 조건입니다.",
      explanation: "집계 결과 조건은 GROUP BY 이후 HAVING 절에서 판단합니다."
    },
    {
      topic: "윈도우 함수",
      difficulty: "중간",
      stem: "동순위가 있으면 다음 순위를 건너뛰는 순위 함수는?",
      choices: ["ROW_NUMBER", "RANK", "DENSE_RANK", "NTILE"],
      answerIndex: 1,
      hint: "1, 1, 3 형태의 순위입니다.",
      explanation: "RANK는 동순위 다음 순위를 건너뛰고, DENSE_RANK는 건너뛰지 않습니다."
    },
    {
      topic: "Top-N",
      difficulty: "실전",
      stem: "Oracle에서 정렬 후 상위 10건을 안정적으로 구하는 SQL 형태는?",
      choices: ["SELECT * FROM emp WHERE ROWNUM <= 10 ORDER BY sal DESC", "SELECT * FROM (SELECT * FROM emp ORDER BY sal DESC) WHERE ROWNUM <= 10", "SELECT * FROM emp WHERE ROWNUM > 10 ORDER BY sal DESC", "SELECT * FROM emp HAVING ROWNUM <= 10"],
      answerIndex: 1,
      hint: "정렬을 안쪽에서 먼저 수행합니다.",
      explanation: "Oracle ROWNUM은 정렬 전에 부여될 수 있으므로 정렬 인라인 뷰 바깥에서 제한해야 합니다."
    },
    {
      topic: "집합 연산자",
      difficulty: "기본",
      stem: "중복 제거가 필요 없고 두 결과 집합을 단순히 합치려 할 때 가장 적절한 연산자는?",
      choices: ["UNION", "UNION ALL", "INTERSECT", "MINUS"],
      answerIndex: 1,
      hint: "중복 제거 비용이 없는 연산입니다.",
      explanation: "UNION ALL은 중복 제거 없이 결과를 이어 붙입니다."
    },
    {
      topic: "계층형 질의",
      difficulty: "중간",
      stem: "조직도처럼 같은 테이블의 관리자-직원 관계를 조회할 때 필요한 개념은?",
      choices: ["셀프 조인", "카티션 곱만 사용", "집합 연산만 사용", "DDL만 사용"],
      answerIndex: 0,
      hint: "같은 테이블이 두 역할을 합니다.",
      explanation: "부모-자식 구조는 같은 테이블을 서로 다른 별칭으로 참조하는 셀프 조인 또는 계층형 질의로 다룹니다."
    },
    {
      topic: "PIVOT",
      difficulty: "중간",
      stem: "월별 매출 행 데이터를 월 컬럼 형태로 회전시키는 기능과 가장 가까운 것은?",
      choices: ["PIVOT", "UNPIVOT", "ROLLBACK", "GRANT"],
      answerIndex: 0,
      hint: "행 값을 열로 바꾸는 기능입니다.",
      explanation: "PIVOT은 행으로 존재하는 값을 열 방향으로 회전해 집계 결과를 보여줍니다."
    },
    {
      topic: "TCL",
      difficulty: "기본",
      stem: "다음 중 TCL에 해당하는 명령어 조합은?",
      choices: ["COMMIT, ROLLBACK", "CREATE, ALTER", "GRANT, REVOKE", "SELECT, UPDATE"],
      answerIndex: 0,
      hint: "트랜잭션 제어 명령입니다.",
      explanation: "COMMIT과 ROLLBACK은 트랜잭션을 확정하거나 취소하는 TCL입니다."
    },
    {
      topic: "표준 조인",
      difficulty: "중간",
      stem: "두 테이블에 공통 컬럼명이 있고 해당 컬럼 기준으로 동일명 컬럼을 한 번만 표시하는 조인은?",
      choices: ["NATURAL JOIN", "CROSS JOIN", "FULL SCAN", "UNION ALL"],
      answerIndex: 0,
      hint: "동일한 이름의 컬럼을 자동 기준으로 삼습니다.",
      explanation: "NATURAL JOIN은 동일한 이름의 컬럼을 기준으로 조인하며 공통 컬럼을 한 번만 표시합니다."
    }
  ]
};

const tuning: ExamBank = {
  id: "tuning",
  name: "3과목 SQL 고급활용 및 튜닝",
  seeds: [
    {
      topic: "SARGable",
      difficulty: "실전",
      stem: "아래 조건을 인덱스 사용에 유리하게 바꾼 것으로 가장 적절한 것은?",
      code: "WHERE TO_CHAR(order_dt, 'YYYYMM') = '202608'",
      choices: ["WHERE order_dt >= DATE '2026-08-01' AND order_dt < DATE '2026-09-01'", "WHERE TO_CHAR(order_dt) LIKE '202608%'", "WHERE NVL(order_dt, SYSDATE) = DATE '2026-08-01'", "WHERE SUBSTR(order_dt, 1, 6) = '202608'"],
      answerIndex: 0,
      hint: "컬럼을 가공하지 않는 범위 조건입니다.",
      explanation: "컬럼 함수를 제거하고 날짜 범위 조건을 사용하면 인덱스 range scan 가능성이 높아집니다."
    },
    {
      topic: "복합 인덱스",
      difficulty: "중간",
      stem: "인덱스 IDX_ORD_01(cust_id, order_dt)가 있을 때 가장 효율적인 조건 조합은?",
      choices: ["cust_id = :b1 AND order_dt >= :b2", "order_dt = :b1", "amount = :b1", "order_dt >= :b1 AND status_cd = :b2"],
      answerIndex: 0,
      hint: "선두 컬럼 사용 여부가 중요합니다.",
      explanation: "복합 인덱스는 선두 컬럼 cust_id가 동등 조건으로 사용될 때 후속 컬럼 범위 탐색이 효율적입니다."
    },
    {
      topic: "Access Predicate",
      difficulty: "실전",
      stem: "실행계획 Predicate Information 해석으로 가장 적절한 것은?",
      code: "access(\"CUST_ID\"=:B1)\nfilter(TO_CHAR(\"ORDER_DT\",'YYYYMM')=:B2)",
      choices: ["CUST_ID는 인덱스 탐색 조건으로 사용된다.", "ORDER_DT는 인덱스 탐색 범위를 줄인다.", "filter 조건은 읽기 전에 항상 탐색 범위를 줄인다.", "access와 filter는 성능상 동일하다."],
      answerIndex: 0,
      hint: "access와 filter를 구분하세요.",
      explanation: "access는 인덱스 탐색 범위를 줄이는 조건이고 filter는 읽은 후 걸러내는 조건입니다."
    },
    {
      topic: "NL 조인",
      difficulty: "중간",
      stem: "Nested Loops 조인이 유리한 상황으로 가장 적절한 것은?",
      choices: ["선행 집합이 작고 후행 조인 컬럼에 선택도 좋은 인덱스가 있다.", "두 테이블이 모두 대용량이고 인덱스가 없다.", "조인 조건이 없고 카티션 곱이 필요하다.", "항상 Hash Join보다 빠르다."],
      answerIndex: 0,
      hint: "NL은 반복 탐색입니다.",
      explanation: "NL 조인은 선행 집합이 작고 후행 테이블 인덱스 탐색이 효율적일 때 유리합니다."
    },
    {
      topic: "Hash Join",
      difficulty: "중간",
      stem: "Hash Join에 대한 설명으로 옳은 것은?",
      choices: ["대량 동등 조인에서 유리할 수 있다.", "비동등 조인에서만 사용된다.", "항상 인덱스가 필수다.", "항상 정렬을 먼저 수행한다."],
      answerIndex: 0,
      hint: "Build/Probe를 떠올리세요.",
      explanation: "Hash Join은 대량 동등 조인에서 작은 집합을 build input으로 삼을 때 효과적일 수 있습니다."
    },
    {
      topic: "스칼라 서브쿼리",
      difficulty: "실전",
      stem: "다음 SQL의 튜닝 방향으로 가장 적절한 것은?",
      code: "SELECT c.cust_id,\n       (SELECT MAX(pay_dt) FROM payments p WHERE p.cust_id = c.cust_id) last_pay_dt\nFROM customers c;",
      choices: ["payments를 사전 집계한 뒤 customers와 조인한다.", "SELECT 절 서브쿼리는 항상 한 번만 수행되므로 그대로 둔다.", "MAX 함수를 제거하고 정렬만 사용한다.", "customers를 삭제한다."],
      answerIndex: 0,
      hint: "고객 행마다 반복될 수 있습니다.",
      explanation: "스칼라 서브쿼리가 반복 수행되면 사전 집계 조인으로 바꿔 비용을 줄일 수 있습니다."
    },
    {
      topic: "통계정보",
      difficulty: "실전",
      stem: "예상 Rows와 실제 A-Rows 차이가 매우 큰 실행계획을 보았다. 우선 확인할 사항은?",
      choices: ["통계정보와 히스토그램", "테이블명 길이", "SQL 키워드 대소문자", "컬럼 주석 존재 여부"],
      answerIndex: 0,
      hint: "카디널리티 추정 문제입니다.",
      explanation: "예상 행 수와 실제 행 수 차이가 크면 통계정보, 히스토그램, 바인드 값 분포를 확인해야 합니다."
    },
    {
      topic: "뷰 머징",
      difficulty: "실전",
      stem: "아래 SQL에서 인라인 뷰의 선집계 결과를 보존하고 싶을 때 고려할 힌트는?",
      code: "SELECT *\nFROM (SELECT product_id, SUM(sale_amt) amt\n      FROM order_items\n      GROUP BY product_id) s\nJOIN products p ON p.product_id = s.product_id;",
      choices: ["NO_MERGE(s)", "USE_NL(s)", "FULL(p)", "APPEND"],
      answerIndex: 0,
      hint: "인라인 뷰 병합을 제어합니다.",
      explanation: "NO_MERGE 힌트는 인라인 뷰가 병합되지 않도록 의도할 때 사용합니다."
    },
    {
      topic: "Top-N 튜닝",
      difficulty: "실전",
      stem: "대량 주문 목록에서 최신 20건만 조회한다. 가장 중요한 인덱스 설계 방향은?",
      choices: ["WHERE 조건과 ORDER BY 컬럼 순서를 함께 고려한다.", "ORDER BY가 있으면 인덱스는 무조건 무효다.", "최신 20건이므로 통계는 필요 없다.", "항상 FULL SCAN 후 정렬한다."],
      answerIndex: 0,
      hint: "필터링과 정렬을 함께 줄여야 합니다.",
      explanation: "Top-N 튜닝은 조건 컬럼과 정렬 컬럼을 고려해 전체 정렬 범위를 줄이는 것이 핵심입니다."
    },
    {
      topic: "OR Expansion",
      difficulty: "실전",
      stem: "OR 조건을 UNION ALL로 분해할 때 반드시 확인해야 하는 것은?",
      choices: ["분기 간 중복 발생 여부", "SELECT 컬럼명의 한글 여부", "힌트 주석 길이", "테이블스페이스명"],
      answerIndex: 0,
      hint: "UNION ALL은 중복 제거를 하지 않습니다.",
      explanation: "UNION ALL은 중복을 제거하지 않으므로 분기 조건이 배타적인지 확인해야 합니다."
    },
    {
      topic: "파티션",
      difficulty: "중간",
      stem: "주문일 기준 RANGE 파티션 테이블에서 파티션 프루닝을 기대하기 가장 어려운 조건은?",
      choices: ["order_dt >= DATE '2026-08-01'", "order_dt < DATE '2026-09-01'", "TO_CHAR(order_dt,'YYYYMM') = '202608'", "order_dt BETWEEN :b1 AND :b2"],
      answerIndex: 2,
      hint: "파티션 키 컬럼 가공 여부를 보세요.",
      explanation: "파티션 키 컬럼을 함수로 가공하면 파티션 프루닝이 어려워질 수 있습니다."
    },
    {
      topic: "힌트",
      difficulty: "실전",
      stem: "다음 힌트 조합에서 가장 의심해야 할 문제는?",
      code: "/*+ USE_NL(o) FULL(o) */",
      choices: ["NL 후행 테이블에 FULL 스캔을 강제해 반복 FULL SCAN이 될 수 있다.", "힌트는 SQL에 아무 영향도 줄 수 없다.", "FULL 힌트는 항상 INDEX 힌트보다 빠르다.", "USE_NL은 정렬만 제어한다."],
      answerIndex: 0,
      hint: "반복 탐색 대상에 FULL을 강제했습니다.",
      explanation: "NL 조인의 후행 테이블에 FULL 힌트가 적용되면 선행 행마다 큰 비용이 반복될 수 있습니다."
    }
  ]
};

export const subjects = [
  { id: modeling.id, name: modeling.name },
  { id: sqlBasic.id, name: sqlBasic.name },
  { id: tuning.id, name: tuning.name }
];

export const objectiveQuestions: ObjectiveQuestion[] = [
  ...build(modeling, 100),
  ...build(sqlBasic, 100),
  ...build(tuning, 100)
];

export const conceptArticles: ConceptArticle[] = [
  {
    id: "modeling-entity-attribute",
    category: "1과목 데이터 모델링 > 엔터티와 속성",
    title: "엔터티는 업무가 관리해야 하는 집합이다",
    summary: "SQLP 모델링 문제는 용어 암기보다 후보가 엔터티인지, 속성인지, 관계인지 구분하는 능력을 자주 묻습니다.",
    keyPoints: [
      "엔터티는 업무에서 독립적으로 관리할 필요가 있는 대상의 집합입니다.",
      "속성은 엔터티를 설명하는 값이며, 계산으로 얻는 값은 저장 여부를 신중히 판단합니다.",
      "인스턴스가 반복적으로 발생하고 식별자가 필요하면 엔터티 후보로 봅니다.",
      "M:N 관계에서 관계 자체의 속성이 생기면 교차 엔터티로 분해합니다."
    ],
    examTrap: "고객명, 주문금액처럼 값 하나를 설명하는 항목을 엔터티로 고르는 선택지가 자주 함정입니다.",
    oracleAngle: "엔터티와 관계 선택은 조인 경로와 인덱스 설계에 직접 영향을 줍니다."
  },
  {
    id: "modeling-normalization",
    category: "1과목 데이터 모델링 > 정규화와 반정규화",
    title: "정규화는 이상 현상 제거, 반정규화는 근거 있는 예외다",
    summary: "정규화는 종속성을 기준으로 중복과 이상 현상을 줄이고, 반정규화는 조회 성능과 업무 요구를 검증한 뒤 제한적으로 적용합니다.",
    keyPoints: [
      "1NF는 반복 속성과 다중 값을 제거합니다.",
      "2NF는 복합 식별자에 대한 부분 함수 종속을 제거합니다.",
      "3NF는 일반 속성 간 이행 함수 종속을 제거합니다.",
      "반정규화는 정합성 유지 방안과 갱신 비용을 함께 제시해야 합니다."
    ],
    examTrap: "조회가 느리다는 이유만으로 무조건 중복 컬럼을 추가하는 선택지는 위험합니다.",
    oracleAngle: "반정규화 전에는 실행계획, 조인 비용, 인덱스 후보를 먼저 확인합니다."
  },
  {
    id: "modeling-relationship-identifier",
    category: "1과목 데이터 모델링 > 관계와 식별자",
    title: "관계의 선택성과 필수성은 SQL 결과 건수를 바꾼다",
    summary: "필수/선택 관계, 식별/비식별 관계, 주식별자 선택은 실제 SQL의 INNER/OUTER JOIN과 결과 보존 조건으로 이어집니다.",
    keyPoints: [
      "필수 관계는 반드시 대응 행이 있어야 하고 선택 관계는 없을 수 있습니다.",
      "식별 관계는 부모 식별자가 자식 식별자에 포함됩니다.",
      "대체 식별자는 후보키 중 주식별자가 아닌 식별자입니다.",
      "관계 차수와 카디널리티는 ERD와 SQL 결과 건수를 함께 설명합니다."
    ],
    examTrap: "선택 관계인데 INNER JOIN으로만 해석하면 기준 행이 사라지는 문제가 생깁니다.",
    oracleAngle: "OUTER JOIN 조건을 ON에 둘지 WHERE에 둘지에 따라 결과 보존 여부가 달라집니다."
  },
  {
    id: "sql-order-null",
    category: "2과목 SQL 기본 및 활용 > 처리 순서와 NULL",
    title: "논리 처리 순서와 NULL은 객관식 단골 함정이다",
    summary: "SELECT 절이 먼저 실행된다고 착각하거나 NULL 비교를 일반 비교처럼 보는 문제가 반복됩니다.",
    keyPoints: [
      "논리 처리 순서는 FROM, WHERE, GROUP BY, HAVING, SELECT, ORDER BY 순서로 이해합니다.",
      "WHERE는 행 필터, HAVING은 그룹 결과 필터입니다.",
      "COUNT(*)는 행 수를 세고 COUNT(expr)는 NULL 표현식을 제외합니다.",
      "NULL 비교는 IS NULL, IS NOT NULL을 사용하고 3값 논리를 고려합니다."
    ],
    examTrap: "SELECT 별칭을 같은 SELECT 블록의 WHERE에서 바로 쓰는 선택지는 틀린 경우가 많습니다.",
    oracleAngle: "Oracle에서는 빈 문자열을 NULL로 취급하는 특성도 함께 기억해야 합니다."
  },
  {
    id: "sql-join-subquery",
    category: "2과목 SQL 기본 및 활용 > 조인과 서브쿼리",
    title: "조인은 행 보존, 서브쿼리는 NULL 전파를 먼저 본다",
    summary: "OUTER JOIN 조건 위치와 NOT IN 서브쿼리의 NULL 포함 여부는 정답을 갈라놓는 핵심 포인트입니다.",
    keyPoints: [
      "LEFT JOIN의 오른쪽 테이블 조건을 WHERE에 두면 OUTER JOIN 효과가 사라질 수 있습니다.",
      "NOT IN 서브쿼리에 NULL이 포함되면 기대한 결과가 나오지 않을 수 있습니다.",
      "EXISTS는 존재 여부를 판단하므로 중복 제거보다 반조인 관점으로 봅니다.",
      "NATURAL JOIN은 동일 이름 컬럼을 자동 사용하므로 의도치 않은 조인이 생길 수 있습니다."
    ],
    examTrap: "LEFT JOIN이라고 해서 기준 행이 항상 보존된다고 단정하면 안 됩니다.",
    oracleAngle: "Predicate Information에서 조인 조건과 필터 조건이 어디에 적용되는지 확인합니다."
  },
  {
    id: "sql-window-topn",
    category: "2과목 SQL 기본 및 활용 > 윈도우 함수와 Top-N",
    title: "Top-N은 정렬 후 제한하는 위치가 중요하다",
    summary: "ROWNUM, ROW_NUMBER, RANK, DENSE_RANK의 차이와 정렬 시점은 SQLP 객관식과 실습 모두에서 자주 나옵니다.",
    keyPoints: [
      "ROW_NUMBER는 유일 순번, RANK는 동순위 후 건너뜀, DENSE_RANK는 연속 순위입니다.",
      "윈도우 함수 결과를 필터링하려면 인라인 뷰나 CTE 바깥에서 조건을 둡니다.",
      "Oracle ROWNUM은 ORDER BY보다 먼저 부여될 수 있어 정렬 인라인 뷰 바깥에서 제한합니다.",
      "동점 포함 Top-N은 RANK, DENSE_RANK, WITH TIES 계열을 검토합니다."
    ],
    examTrap: "ORDER BY와 ROWNUM을 같은 블록에 둔 뒤 정렬 후 상위 N건이라고 보는 선택지는 위험합니다.",
    oracleAngle: "FETCH FIRST, STOPKEY, WINDOW SORT가 실행계획에 어떻게 나타나는지 함께 봅니다."
  },
  {
    id: "tuning-index-predicate",
    category: "3과목 SQL 고급활용 및 튜닝 > 인덱스와 Predicate",
    title: "인덱스는 탔는지가 아니라 어떻게 탔는지가 중요하다",
    summary: "인덱스 스캔이라는 단어만 보고 정답을 고르면 안 되고 access predicate와 filter predicate를 구분해야 합니다.",
    keyPoints: [
      "컬럼을 함수로 감싸면 일반 B-Tree 인덱스의 탐색 조건이 되기 어렵습니다.",
      "복합 인덱스는 선두 컬럼, 동등 조건, 범위 조건 순서를 함께 봅니다.",
      "access 조건은 탐색 범위를 줄이고 filter 조건은 읽은 뒤 걸러냅니다.",
      "선택도가 낮은 컬럼 인덱스는 단독 사용 효과가 제한될 수 있습니다."
    ],
    examTrap: "실행계획에 INDEX RANGE SCAN이 보인다는 이유만으로 효율적이라고 판단하는 선택지는 함정입니다.",
    oracleAngle: "DBMS_XPLAN의 Predicate Information에서 access/filter를 반드시 확인합니다."
  },
  {
    id: "tuning-join-method",
    category: "3과목 SQL 고급활용 및 튜닝 > 조인 방식",
    title: "NL, Hash, Sort Merge는 데이터량과 인덱스가 결정한다",
    summary: "조인 방식은 선행 집합 크기, 후행 인덱스, 조인 조건, 메모리와 정렬 비용에 따라 달라집니다.",
    keyPoints: [
      "Nested Loops는 선행 집합이 작고 후행 인덱스가 효율적일 때 유리합니다.",
      "Hash Join은 대량 동등 조인에서 작은 입력을 build input으로 삼을 때 효과적입니다.",
      "Sort Merge Join은 정렬된 집합이나 비동등 조인에서 검토됩니다.",
      "LEADING, USE_NL, USE_HASH 힌트는 별칭과 쿼리 블록이 맞아야 의도대로 작동합니다."
    ],
    examTrap: "USE_NL 힌트 하나만으로 조인 순서까지 항상 고정된다고 보는 선택지는 틀릴 수 있습니다.",
    oracleAngle: "힌트는 결과를 바꾸면 안 되며, 목표 실행계획과 정합성을 함께 만족해야 합니다."
  },
  {
    id: "tuning-transform-plan",
    category: "3과목 SQL 고급활용 및 튜닝 > 옵티마이저와 실행계획",
    title: "옵티마이저는 통계와 변환으로 실행계획을 만든다",
    summary: "SQLP 실습형은 단순히 SQL을 맞히는 것이 아니라 왜 그 실행계획이 나와야 하는지 설명할 수 있어야 합니다.",
    keyPoints: [
      "통계정보와 히스토그램은 카디널리티 추정과 조인 순서에 영향을 줍니다.",
      "뷰 머징, 서브쿼리 Unnesting, 조건 Pushdown은 SQL 모양과 다른 계획을 만들 수 있습니다.",
      "실제 실행 통계에서는 Starts, A-Rows, Buffers를 함께 봅니다.",
      "목표 실행계획을 맞추려면 요구사항, 모델, 인덱스, 힌트를 동시에 점검합니다."
    ],
    examTrap: "목표 실행계획만 맞추려고 결과 보존 조건을 깨뜨리면 감점입니다.",
    oracleAngle: "NO_MERGE, LEADING, INDEX, FULL 같은 힌트는 쿼리 블록과 별칭 기준으로 정확히 작성합니다."
  }
];

const commonSchema = `customers(cust_id, cust_name, grade_cd, region_cd, created_at)
orders(order_id, cust_id, order_dt, status_cd, channel_cd, amount)
order_items(order_id, item_id, product_id, qty, sale_amt)
products(product_id, category_cd, product_name, active_yn)
payments(payment_id, order_id, pay_dt, pay_amt, pay_method)
idx_orders_01(cust_id, order_dt)
idx_orders_02(order_dt, status_cd)
idx_items_01(product_id, order_id)
idx_payments_01(order_id, pay_dt)`;

const cleanSeedSql = `-- PostgreSQL 실습에서는 SELECT/WITH 쿼리만 실행합니다.
-- Oracle 힌트는 주석 형태로 작성하고, 목표 실행계획 의도를 함께 학습합니다.`;

const cleanLabCases = [
  [
    "조인 순서",
    "고객 기준 최근 주문 조회",
    "활성 고객 중 최근 30일 주문이 있는 고객만 조회한다. 고객을 먼저 줄인 뒤 주문을 Nested Loops로 탐색하는 의도를 SQL에 표현하라.",
    `select /*+ leading(c) use_nl(o) index(o idx_orders_01) */ c.cust_id, c.cust_name, o.order_id, o.order_dt
from customers c
join orders o on o.cust_id = c.cust_id
where c.region_cd = :region_cd
  and o.order_dt >= :from_dt`,
    ["CUSTOMERS region filter", "NESTED LOOPS", "ORDERS IDX_ORDERS_01 RANGE SCAN"],
    ["leading(c)", "use_nl(o)", "index(o idx_orders_01)"]
  ],
  [
    "인덱스 조건",
    "주문월 조건 SARGable 변환",
    "TO_CHAR(order_dt,'YYYYMM') 조건을 주문일 인덱스를 사용할 수 있는 범위 조건으로 바꿔 작성하라.",
    `select /*+ index(o idx_orders_02) */ o.order_id, o.order_dt, o.amount
from orders o
where o.order_dt >= :month_start
  and o.order_dt < :next_month_start`,
    ["ORDERS IDX_ORDERS_02 RANGE SCAN", "TABLE ACCESS BY INDEX ROWID"],
    ["index(o idx_orders_02)", "컬럼 함수 제거"]
  ],
  [
    "해시 조인",
    "대량 주문상품 집계",
    "최근 분기 주문상품을 상품별로 집계한다. 대량 동등 조인과 해시 집계를 의도한 SQL을 작성하라.",
    `select /*+ leading(o) use_hash(oi) */ oi.product_id, sum(oi.sale_amt) sale_amt
from orders o
join order_items oi on oi.order_id = o.order_id
where o.order_dt >= :q_start
  and o.order_dt < :q_end
group by oi.product_id`,
    ["ORDERS date range scan", "HASH JOIN", "HASH GROUP BY"],
    ["use_hash(oi)", "group by 집계"]
  ],
  [
    "아우터 조인",
    "주문 없는 고객 보존",
    "고객 목록을 기준으로 최근 주문 상태를 보여준다. 주문이 없는 고객도 출력되도록 조건 위치를 조정하라.",
    `select c.cust_id, c.cust_name, o.order_id, o.status_cd
from customers c
left join orders o
  on o.cust_id = c.cust_id
 and o.order_dt >= :from_dt
 and o.status_cd = 'PAID'
where c.region_cd = :region_cd`,
    ["CUSTOMERS preserved", "OUTER JOIN", "ORDERS condition in ON"],
    ["ON 절 조건 위치", "기준 행 보존"]
  ],
  [
    "Top-N",
    "카테고리별 매출 Top-N",
    "상품 카테고리별 매출 상위 3개 상품을 조회한다. 집계 후 순위 필터링이 가능하도록 작성하라.",
    `with sales as (
  select p.category_cd, oi.product_id, sum(oi.sale_amt) sale_amt
  from products p
  join order_items oi on oi.product_id = p.product_id
  group by p.category_cd, oi.product_id
),
ranked as (
  select sales.*, row_number() over(partition by category_cd order by sale_amt desc) rn
  from sales
)
select * from ranked where rn <= 3`,
    ["HASH GROUP BY", "WINDOW SORT", "RN <= 3 FILTER"],
    ["window function", "inline view filter"]
  ],
  [
    "스칼라 서브쿼리",
    "반복 스칼라 서브쿼리 제거",
    "고객별 마지막 결제일을 SELECT 절 스칼라 서브쿼리로 반복 조회하던 SQL을 사전 집계 조인으로 개선하라.",
    `with last_pay as (
  select o.cust_id, max(p.pay_dt) last_pay_dt
  from orders o
  join payments p on p.order_id = o.order_id
  group by o.cust_id
)
select c.cust_id, c.cust_name, lp.last_pay_dt
from customers c
left join last_pay lp on lp.cust_id = c.cust_id`,
    ["PAYMENTS pre aggregation", "CUSTOMERS OUTER JOIN", "No repeated scalar subquery"],
    ["사전 집계", "반복 수행 제거"]
  ],
  [
    "세미 조인",
    "구매 이력 존재 고객",
    "특정 상품을 구매한 이력이 있는 고객만 조회한다. 중복 제거 정렬보다 존재 여부 중심으로 작성하라.",
    `select c.cust_id, c.cust_name
from customers c
where exists (
  select 1
  from orders o
  join order_items oi on oi.order_id = o.order_id
  where o.cust_id = c.cust_id
    and oi.product_id = :product_id
)`,
    ["CUSTOMERS", "SEMI JOIN / EXISTS", "ORDER_ITEMS IDX_ITEMS_01"],
    ["exists", "중복 제거 회피"]
  ],
  [
    "뷰 머징 제어",
    "집계 후 조인 순서 보존",
    "주문상품을 상품별로 먼저 집계한 뒤 상품과 조인해야 한다. 집계 인라인 뷰가 병합되지 않도록 의도를 표현하라.",
    `select /*+ no_merge(s) use_hash(p) */ p.category_cd, s.product_id, s.sale_amt
from (
  select product_id, sum(sale_amt) sale_amt
  from order_items
  group by product_id
) s
join products p on p.product_id = s.product_id`,
    ["ORDER_ITEMS HASH GROUP BY", "NO_MERGE inline view", "HASH JOIN PRODUCTS"],
    ["no_merge(s)", "use_hash(p)"]
  ],
  [
    "Top-N 페이징",
    "주문 목록 페이징",
    "최근 주문 목록에서 101~120번째 행을 조회한다. 결정적인 정렬 기준을 포함해 작성하라.",
    `select *
from (
  select q.*, row_number() over(order by q.order_dt desc, q.order_id desc) rn
  from orders q
  where q.order_dt >= :from_dt
) x
where x.rn between 101 and 120`,
    ["ORDERS date range", "WINDOW SORT ORDER BY", "RN BETWEEN filter"],
    ["deterministic order by", "row_number"]
  ],
  [
    "OR 조건 분해",
    "OR 조건 인덱스 활용",
    "상태 조건과 채널 조건이 OR로 묶여 인덱스 효율이 낮다. UNION ALL 분해를 고려해 작성하라.",
    `select order_id, order_dt, amount
from orders
where status_cd = :status_cd
  and order_dt >= :from_dt
union all
select order_id, order_dt, amount
from orders
where channel_cd = :channel_cd
  and order_dt >= :from_dt
  and status_cd <> :status_cd`,
    ["Branch 1 index candidate", "Branch 2 index candidate", "UNION ALL no duplicate"],
    ["or expansion", "중복 방지 조건"]
  ]
] as const;

const cleanLabDifficulties: Difficulty[] = ["실전", "중간", "기본"];

export const labQuestions: LabQuestion[] = Array.from({ length: 20 }, (_, index) => {
  const lab = cleanLabCases[index % cleanLabCases.length];
  const round = Math.floor(index / cleanLabCases.length) + 1;
  return {
    id: `lab-${String(index + 1).padStart(2, "0")}`,
    number: index + 1,
    title: round === 1 ? lab[1] : `${lab[1]} 변형`,
    difficulty: cleanLabDifficulties[index % cleanLabDifficulties.length],
    topic: lab[0],
    scenario: "PostgreSQL에서 실행 가능한 SELECT를 작성하되 Oracle SQLP 튜닝 관점의 힌트와 실행계획 의도를 함께 학습합니다.",
    schemaSql: commonSchema,
    seedSql: cleanSeedSql,
    prompt: lab[2],
    expectedSql: lab[3],
    targetPlan: [...lab[4]],
    oracleNotes: [
      "힌트는 쿼리 블록과 테이블 별칭이 정확해야 의도대로 적용될 수 있습니다.",
      "목표 실행계획을 맞추더라도 결과 보존 조건을 깨뜨리면 오답입니다.",
      "Access Predicate와 Filter Predicate를 구분해 인덱스 사용 효율을 설명해야 합니다."
    ],
    hints: [...lab[5]],
    rubric: ["요구 결과 보존", "조건의 SARGable 작성", "조인 순서와 방식 의도", "Oracle 힌트 위치와 별칭 정확성"]
  };
});

export function createLocalExtraQuestion(subjectId: SubjectId, count: number): ObjectiveQuestion {
  const bank = [modeling, sqlBasic, tuning].find((item) => item.id === subjectId) ?? tuning;
  return build(bank, 1, 100 + count, `extra-${bank.id}`)[0];
}
