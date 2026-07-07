import type { Choice, ChoiceId, ConceptArticle, Difficulty, LabQuestion, ObjectiveQuestion, SubjectId } from "@/lib/types";

const choiceIds: ChoiceId[] = ["A", "B", "C", "D"];

type Seed = {
  topic: string;
  difficulty: Difficulty;
  scenario: string;
  correct: string;
  wrong: [string, string, string];
  hint: string;
  explanation: string;
};

type Bank = {
  id: SubjectId;
  name: string;
  seeds: Seed[];
};

function rotate(correct: string, wrong: string[], seed: number): { choices: Choice[]; answer: ChoiceId } {
  const ordered = [...wrong.slice(0, 3)];
  const answerIndex = seed % choiceIds.length;
  ordered.splice(answerIndex, 0, correct);
  return {
    choices: ordered.map((text, index) => ({ id: choiceIds[index], text })),
    answer: choiceIds[answerIndex]
  };
}

function wrongMap(seed: Seed, choices: Choice[], answer: ChoiceId): Record<ChoiceId, string> {
  return choices.reduce((acc, choice) => {
    acc[choice.id] =
      choice.id === answer
        ? `정답입니다. ${seed.explanation}`
        : `오답 포인트: 보기 "${choice.text}"는 지문의 보존 집합, 업무 규칙, 실행 결과를 끝까지 확인하지 않은 판단입니다.`;
    return acc;
  }, {} as Record<ChoiceId, string>);
}

function makeStem(seed: Seed, index: number) {
  const variants = [
    `${seed.scenario} 이 상황에서 가장 타당한 판단은?`,
    `SQLP 복기형 ${index + 1}. ${seed.scenario} 보기 중 가장 적절한 것은?`,
    `실전 검토 문제. ${seed.scenario} 잘못 판단하면 어떤 기준을 놓치기 쉬운가?`
  ];
  return variants[Math.floor(index / 10) % variants.length];
}

function build(bank: Bank, count: number, startIndex = 0, idPrefix: string = bank.id): ObjectiveQuestion[] {
  return Array.from({ length: count }, (_, offset) => {
    const index = startIndex + offset;
    const seed = bank.seeds[index % bank.seeds.length];
    const { choices, answer } = rotate(seed.correct, seed.wrong, index + bank.id.length);
    return {
      id: `${idPrefix}-${String(index + 1).padStart(3, "0")}`,
      number: index + 1,
      subjectId: bank.id,
      subjectName: bank.name,
      topic: seed.topic,
      difficulty: seed.difficulty,
      stem: makeStem(seed, index),
      choices,
      answer,
      hint: seed.hint,
      explanation: seed.explanation,
      whyWrong: wrongMap(seed, choices, answer)
    };
  });
}

const modeling: Bank = {
  id: "modeling",
  name: "1과목 데이터 모델링의 이해",
  seeds: [
    {
      topic: "엔터티",
      difficulty: "기본",
      scenario: "고객 상담 이력이 여러 번 발생하고 상담 일시, 상담자, 처리 결과를 지속 관리해야 한다.",
      correct: "업무적으로 식별 가능한 인스턴스 집합이므로 상담 이력 엔터티 후보로 검토한다.",
      wrong: ["화면 입력 항목이므로 속성으로만 둔다.", "코드 값이 아니므로 엔터티가 될 수 없다.", "물리 테이블이 없으므로 개념 모델에 표현하지 않는다."],
      hint: "엔터티는 화면이 아니라 업무상 관리 대상입니다.",
      explanation: "엔터티는 업무 의미, 식별성, 반복 발생, 지속 관리 필요성이 있어야 합니다."
    },
    {
      topic: "속성과 원자성",
      difficulty: "기본",
      scenario: "고객 테이블에 주소1, 주소2, 주소3 컬럼이 반복되어 있고 주소 변경 이력도 필요하다.",
      correct: "반복 속성을 분리하고 주소 또는 주소 이력 엔터티로 관리할지 검토한다.",
      wrong: ["컬럼 수가 적으면 반복 속성도 문제없다.", "문자열로 합쳐 저장하면 항상 좋은 설계다.", "속성 원자성은 물리 설계에서만 검토한다."],
      hint: "반복 속성은 변경 이력과 검색 조건에서 문제가 됩니다.",
      explanation: "속성은 더 이상 쪼갤 필요가 없는 업무 의미 단위여야 하며 반복 속성은 정규화 대상입니다."
    },
    {
      topic: "관계 선택성",
      difficulty: "중간",
      scenario: "고객은 주문이 없을 수 있지만 주문은 반드시 고객을 가진다. 고객 목록과 최근 주문일을 함께 보여야 한다.",
      correct: "주문이 없는 고객도 보존해야 하므로 고객 기준 외부 조인을 검토한다.",
      wrong: ["모든 관계는 INNER JOIN으로 작성한다.", "선택 관계는 외래키를 만들 수 없다는 뜻이다.", "외부 조인은 항상 성능이 나쁘므로 금지한다."],
      hint: "어느 쪽 행을 보존해야 하는지 먼저 보세요.",
      explanation: "선택 관계를 내부 조인으로 처리하면 기준 엔터티의 행이 누락될 수 있습니다."
    },
    {
      topic: "식별자",
      difficulty: "중간",
      scenario: "업무 식별자가 길고 변경 가능성이 있어 대리키를 도입하려 한다.",
      correct: "대리키를 쓰더라도 업무 식별자의 유일성 제약은 별도로 보장한다.",
      wrong: ["대리키가 있으면 업무 유일성은 더 이상 필요 없다.", "복합 식별자는 어떤 경우에도 금지한다.", "식별자는 성능 문제라 논리 모델에서 제외한다."],
      hint: "대리키와 업무 유일성은 다른 문제입니다.",
      explanation: "식별자는 유일성, 최소성, 안정성을 만족해야 하며 대리키는 업무 규칙을 대신하지 않습니다."
    },
    {
      topic: "정규화",
      difficulty: "중간",
      scenario: "주문 테이블에 고객등급과 등급할인율이 같이 있고 할인율은 고객등급에만 종속된다.",
      correct: "비식별자 속성 간 이행 종속이므로 등급 기준 테이블 분리를 검토한다.",
      wrong: ["조회가 빠르면 정규화 위반이 아니다.", "문자형 컬럼이면 정규화 대상이 아니다.", "외래키가 없으면 함수 종속도 없다."],
      hint: "3정규형의 핵심은 이행 종속입니다.",
      explanation: "3NF는 비식별자 속성이 다른 비식별자 속성에 종속되는 구조를 제거합니다."
    },
    {
      topic: "반정규화",
      difficulty: "실전",
      scenario: "정규화된 모델에서 조인이 많아 느리다는 이유로 집계 컬럼 추가를 제안했다.",
      correct: "SQL, 인덱스, 통계, 조인 방식의 병목을 확인한 뒤 정합성 유지 방안과 함께 제한적으로 적용한다.",
      wrong: ["조인이 보이면 무조건 중복 컬럼을 추가한다.", "반정규화는 정합성 비용이 없다.", "반정규화 후에는 인덱스 설계가 필요 없다."],
      hint: "반정규화는 검증된 처방입니다.",
      explanation: "반정규화는 성능 이득과 정합성 비용을 함께 계산해야 합니다."
    },
    {
      topic: "NULL 속성",
      difficulty: "중간",
      scenario: "선택 속성이 많은 모델을 조회하면서 NULL 비교와 집계 결과가 예상과 달라졌다.",
      correct: "NULL은 값이 없음 또는 해당 없음의 상태이므로 비교, 집계, 조인에서 별도 의미를 고려한다.",
      wrong: ["NULL은 숫자 0과 같다.", "NULL 비교는 = NULL로 작성한다.", "Oracle에서 빈 문자열은 항상 공백 한 칸이다."],
      hint: "NULL은 값이 아니라 상태에 가깝습니다.",
      explanation: "NULL은 UNKNOWN 비교 결과를 만들 수 있고 Oracle에서는 빈 문자열이 NULL로 취급됩니다."
    },
    {
      topic: "슈퍼타입/서브타입",
      difficulty: "실전",
      scenario: "상품 슈퍼타입 아래 예금상품과 대출상품 서브타입이 있고 공통 속성과 개별 속성이 섞여 있다.",
      correct: "조회 패턴, 데이터량, 공통 속성 비율, 배타성, 변경 가능성을 종합해 통합 또는 분리 방식을 결정한다.",
      wrong: ["항상 하나의 테이블로 통합한다.", "항상 개별 테이블로 분리한다.", "개념 모델의 서브타입은 물리 성능과 무관하다."],
      hint: "항상 하나의 정답은 없습니다.",
      explanation: "슈퍼타입/서브타입 물리화는 업무 규칙과 조회 패턴의 트레이드오프입니다."
    },
    {
      topic: "M:N 관계",
      difficulty: "중간",
      scenario: "학생과 과목 사이의 수강 관계에 수강일자와 성적이 종속된다.",
      correct: "수강 교차 엔터티를 만들고 수강일자와 성적을 그 속성으로 관리한다.",
      wrong: ["학생 테이블에 과목 코드를 반복 컬럼으로 둔다.", "과목 테이블에 학생 목록을 문자열로 저장한다.", "관계 속성은 아무 엔터티에 붙여도 된다."],
      hint: "관계가 자체 속성을 가지면 엔터티 후보입니다.",
      explanation: "M:N 관계는 교차 엔터티로 해소해야 관계 속성과 이력을 안정적으로 관리할 수 있습니다."
    },
    {
      topic: "모델과 SQL 성능",
      difficulty: "실전",
      scenario: "거래상세만으로 거래일 조건을 자주 조회하지만 거래일은 거래 헤더에만 있다.",
      correct: "트랜잭션 단위, 조인 경로, 조건 컬럼 위치를 확인하고 인덱스로 해결 가능한지 먼저 판단한다.",
      wrong: ["모델은 보지 말고 힌트로만 해결한다.", "상세 테이블에 모든 헤더 컬럼을 중복하면 항상 최적이다.", "트랜잭션 범위는 DB 설계와 무관하다."],
      hint: "SQLP는 모델, SQL, 인덱스를 함께 봅니다.",
      explanation: "모델은 조인 경로와 조건 컬럼 위치를 결정하므로 SQL 성능과 직접 연결됩니다."
    }
  ]
};

const sqlBasic: Bank = {
  id: "sql-basic",
  name: "2과목 SQL 기본 및 활용",
  seeds: [
    {
      topic: "SELECT 처리 순서",
      difficulty: "기본",
      scenario: "SELECT 별칭을 WHERE 절에서 바로 사용하려는 SQL을 검토 중이다.",
      correct: "논리 처리 순서는 FROM/JOIN, WHERE, GROUP BY, HAVING, SELECT, ORDER BY로 이해한다.",
      wrong: ["SELECT가 가장 먼저 처리된다.", "ORDER BY가 가장 먼저 처리된다.", "HAVING은 원본 행을 먼저 필터링한다."],
      hint: "문법 순서와 논리 처리 순서는 다릅니다.",
      explanation: "처리 순서를 알면 별칭, 집계 조건, WHERE/HAVING 함정을 피할 수 있습니다."
    },
    {
      topic: "NULL과 집계",
      difficulty: "중간",
      scenario: "COUNT(*), COUNT(col), SUM(col)의 결과가 NULL 때문에 달라지는 문제다.",
      correct: "COUNT(*)는 행 수를 세고 COUNT(col), SUM(col)은 대상 표현식이 NULL인 행을 제외한다.",
      wrong: ["COUNT(col)은 NULL도 0으로 계산한다.", "SUM(col)은 NULL을 자동으로 0으로 바꾼다.", "IS NULL은 NULL을 반환하는 함수다."],
      hint: "COUNT(*)와 COUNT(표현식)을 나누세요.",
      explanation: "집계 함수마다 NULL 처리 방식이 다르며 결과 건수와 합계가 달라집니다."
    },
    {
      topic: "외부 조인",
      difficulty: "실전",
      scenario: "LEFT JOIN 후 오른쪽 테이블의 상태 조건을 WHERE 절에 두었다.",
      correct: "기준 행 보존이 필요하면 오른쪽 테이블 조건을 ON 절에 둘지 검토한다.",
      wrong: ["외부 조인의 모든 조건은 WHERE 절에 둔다.", "조건 위치는 결과 건수와 무관하다.", "LEFT JOIN은 모든 조건에서 기준 행을 항상 보존한다."],
      hint: "오른쪽 컬럼을 WHERE에서 필터링하면 NULL 보존 행이 사라질 수 있습니다.",
      explanation: "외부 조인의 조건 위치는 결과 집합을 바꿀 수 있습니다."
    },
    {
      topic: "NOT IN과 NULL",
      difficulty: "중간",
      scenario: "NOT IN 서브쿼리 결과에 NULL이 포함될 수 있다.",
      correct: "NULL 때문에 기대한 행이 반환되지 않을 수 있으므로 NOT EXISTS 또는 NULL 제거를 검토한다.",
      wrong: ["NOT IN은 NULL을 자동 제외한다.", "NOT EXISTS는 항상 정렬이 필요하다.", "NULL 비교는 TRUE 또는 FALSE만 반환한다."],
      hint: "3값 논리의 UNKNOWN을 떠올리세요.",
      explanation: "NULL 비교는 UNKNOWN이 될 수 있어 반부정 조건에서 결과가 크게 달라집니다."
    },
    {
      topic: "GROUP BY와 HAVING",
      difficulty: "기본",
      scenario: "부서별 평균 급여가 5000 이상인 부서만 조회하려 한다.",
      correct: "집계 결과 조건이므로 GROUP BY 이후 HAVING 절에서 판단한다.",
      wrong: ["집계 조건도 WHERE 절에 둔다.", "HAVING은 ORDER BY 이후 실행된다.", "GROUP BY가 있으면 WHERE 절은 사용할 수 없다."],
      hint: "원본 행 조건인지 그룹 결과 조건인지 보세요.",
      explanation: "WHERE는 원본 행 필터이고 HAVING은 그룹 결과 필터입니다."
    },
    {
      topic: "윈도우 함수",
      difficulty: "중간",
      scenario: "부서별 급여 순위를 매기되 동순위 다음 순번은 건너뛰어야 한다.",
      correct: "RANK는 동순위가 있으면 다음 순위를 건너뛴다.",
      wrong: ["ROW_NUMBER는 동순위에 같은 순위를 준다.", "DENSE_RANK는 동순위 뒤 순위를 건너뛴다.", "윈도우 함수는 GROUP BY처럼 행 수를 줄인다."],
      hint: "동순위 처리와 행 수 유지 여부를 구분하세요.",
      explanation: "윈도우 함수는 행을 유지한 채 분석 값을 붙이고 순위 함수마다 동순위 처리가 다릅니다."
    },
    {
      topic: "Top-N",
      difficulty: "실전",
      scenario: "Oracle에서 ROWNUM과 ORDER BY를 같은 SELECT 블록에 두고 상위 N건을 구하려 한다.",
      correct: "정렬을 먼저 수행한 인라인 뷰 바깥에서 ROWNUM 또는 순위 필터를 적용한다.",
      wrong: ["WHERE ROWNUM <= N과 ORDER BY를 같은 블록에 두면 항상 정렬 후 상위 N건이다.", "Top-N은 ORDER BY 없이도 결정적이다.", "동점 포함도 ROW_NUMBER만 쓰면 항상 정확하다."],
      hint: "ROWNUM 부여 시점을 보세요.",
      explanation: "ROWNUM은 정렬 전 부여될 수 있어 정렬 인라인 뷰와 바깥 필터 구조가 필요합니다."
    },
    {
      topic: "집합 연산자",
      difficulty: "중간",
      scenario: "두 결과 집합을 합치는데 중복 제거가 필요 없다.",
      correct: "UNION ALL은 중복 제거 없이 이어 붙이므로 불필요한 정렬/중복 제거 비용을 피할 수 있다.",
      wrong: ["UNION ALL은 항상 중복을 제거한다.", "UNION은 컬럼 개수와 타입이 달라도 자동 보정한다.", "집합 연산자는 각 SELECT의 ORDER BY를 모두 유지한다."],
      hint: "중복 제거 여부를 보세요.",
      explanation: "UNION은 중복 제거 비용이 있고 UNION ALL은 결과 정합성상 중복 허용 여부를 확인해야 합니다."
    },
    {
      topic: "계층형 질의",
      difficulty: "중간",
      scenario: "조직도처럼 부모-자식 관계가 같은 테이블에 저장되어 있다.",
      correct: "같은 테이블을 부모와 자식 역할로 구분해 셀프 조인하거나 계층형 질의를 사용한다.",
      wrong: ["같은 테이블은 자기 자신과 조인할 수 없다.", "부모키가 있으면 계층이 자동 계산된다.", "계층형 질의는 집계 함수가 있을 때만 쓴다."],
      hint: "하나의 테이블이 두 역할을 합니다.",
      explanation: "계층 구조는 부모-자식 관계를 기준으로 같은 테이블을 반복 참조합니다."
    },
    {
      topic: "SQL 분류",
      difficulty: "기본",
      scenario: "COMMIT, ROLLBACK, GRANT, TRUNCATE의 분류와 트랜잭션 특성을 묻는다.",
      correct: "COMMIT과 ROLLBACK은 트랜잭션을 제어하는 TCL이다.",
      wrong: ["COMMIT은 테이블 구조를 바꾸는 DDL이다.", "GRANT는 데이터를 조회하는 DML이다.", "SELECT는 트랜잭션 확정을 담당한다."],
      hint: "명령의 목적을 기준으로 분류하세요.",
      explanation: "DDL, DML, TCL, DCL은 구조, 데이터, 트랜잭션, 권한 제어 목적에 따라 나뉩니다."
    }
  ]
};

const tuning: Bank = {
  id: "tuning",
  name: "3과목 SQL 고급활용 및 튜닝",
  seeds: [
    {
      topic: "SARGable 조건",
      difficulty: "실전",
      scenario: "주문일 컬럼에 TO_CHAR(order_dt, 'YYYYMM') = :yyyymm 조건을 사용한다.",
      correct: "컬럼 변형을 제거하고 order_dt >= :month_start AND order_dt < :next_month_start 범위 조건으로 바꾼다.",
      wrong: ["TO_CHAR가 가독성이 좋으므로 그대로 둔다.", "인덱스 힌트만 추가하면 충분하다.", "날짜 컬럼을 문자형으로 바꾸면 항상 빠르다."],
      hint: "컬럼 함수는 access predicate가 되기 어렵습니다.",
      explanation: "컬럼 가공을 피하면 일반 B-Tree 인덱스의 범위 탐색 가능성이 높아집니다."
    },
    {
      topic: "복합 인덱스",
      difficulty: "중간",
      scenario: "복합 인덱스 (cust_id, order_dt)가 있고 고객별 기간 주문을 조회한다.",
      correct: "선두 컬럼 cust_id에 동등 조건, order_dt에 범위 조건이 있으면 효율적이다.",
      wrong: ["order_dt 조건만 있으면 선두 컬럼과 무관하게 효율적이다.", "복합 인덱스 컬럼 순서는 성능과 무관하다.", "컬럼이 많을수록 어떤 조건에도 최적이다."],
      hint: "선두 컬럼과 동등/범위 조건 순서가 핵심입니다.",
      explanation: "복합 인덱스는 선두 컬럼 사용 여부와 조건 형태에 따라 탐색 범위가 달라집니다."
    },
    {
      topic: "Access와 Filter Predicate",
      difficulty: "실전",
      scenario: "실행계획에는 인덱스 스캔이 보이지만 실제 읽은 블록 수가 많다.",
      correct: "Predicate Information에서 access 조건과 filter 조건을 구분해 실제 인덱스 효율을 확인한다.",
      wrong: ["인덱스 스캔이면 모든 조건이 access 조건이다.", "access와 filter는 성능 의미가 같다.", "filter 조건이 많을수록 항상 좋다."],
      hint: "인덱스를 탔다와 효율적으로 탔다를 구분하세요.",
      explanation: "인덱스 스캔 이름만 보지 말고 어떤 조건이 탐색 범위를 줄였는지 봐야 합니다."
    },
    {
      topic: "NL 조인",
      difficulty: "중간",
      scenario: "선행 집합은 작고 후행 테이블 조인 컬럼에 선택도 좋은 인덱스가 있다.",
      correct: "Nested Loops 조인이 유리할 수 있으며 선행 집합 크기와 후행 인덱스를 함께 확인한다.",
      wrong: ["두 테이블이 모두 대용량이면 NL이 항상 빠르다.", "USE_NL 하나면 조인 순서까지 항상 고정된다.", "후행 인덱스는 NL 성능과 무관하다."],
      hint: "NL은 반복 탐색입니다.",
      explanation: "NL 조인은 선행 행마다 후행 테이블을 탐색하므로 선행 집합과 후행 인덱스가 중요합니다."
    },
    {
      topic: "해시 조인",
      difficulty: "중간",
      scenario: "대량 주문과 주문상세를 동등 조건으로 조인해 집계한다.",
      correct: "대량 동등 조인에서는 작은 빌드 입력과 메모리 비용을 고려해 Hash Join을 검토한다.",
      wrong: ["해시 조인은 비동등 조인에서만 사용한다.", "해시 조인은 인덱스가 있어야만 실행된다.", "해시 조인은 항상 정렬이 필수다."],
      hint: "Build와 Probe 입력을 보세요.",
      explanation: "Hash Join은 대량 동등 조인에서 유리할 수 있으며 빌드 입력 크기와 메모리를 봐야 합니다."
    },
    {
      topic: "스칼라 서브쿼리",
      difficulty: "실전",
      scenario: "SELECT 절 스칼라 서브쿼리가 고객 행마다 마지막 결제일을 반복 조회한다.",
      correct: "사전 집계한 인라인 뷰 또는 CTE와 조인해 반복 실행을 줄인다.",
      wrong: ["스칼라 서브쿼리는 항상 한 번만 실행된다.", "SELECT 절에 있으면 조인보다 항상 빠르다.", "집계 조인으로 바꿀 때 기준 행 보존은 보지 않아도 된다."],
      hint: "행마다 수행되는지 생각하세요.",
      explanation: "스칼라 서브쿼리는 캐싱될 수 있지만 반복 비용이 커질 수 있어 사전 집계 조인이 대안입니다."
    },
    {
      topic: "옵티마이저와 통계",
      difficulty: "실전",
      scenario: "데이터 분포가 치우쳤는데 통계가 오래되어 잘못된 조인 순서가 선택됐다.",
      correct: "카디널리티 추정에 영향을 주는 통계, 히스토그램, 바인드 값 분포를 확인한다.",
      wrong: ["힌트를 많이 쓰면 통계는 필요 없다.", "옵티마이저는 항상 실제 행 수를 안다.", "통계는 테이블 생성 시 한 번만 수집하면 충분하다."],
      hint: "예상 행 수와 실제 행 수 차이를 보세요.",
      explanation: "옵티마이저는 통계 기반으로 비용을 추정하므로 통계가 틀리면 실행계획도 흔들립니다."
    },
    {
      topic: "쿼리 변환",
      difficulty: "중간",
      scenario: "인라인 뷰를 먼저 집계한 뒤 조인해야 하는데 옵티마이저가 뷰 머징을 시도할 수 있다.",
      correct: "집계 시점을 보존해야 하면 NO_MERGE 등으로 쿼리 블록 변환을 제어할지 검토한다.",
      wrong: ["인라인 뷰는 항상 물리적으로 먼저 실행된다.", "쿼리 변환은 결과를 바꾸므로 사용하면 안 된다.", "NO_MERGE는 모든 조인 방식을 자동 고정한다."],
      hint: "작성한 SQL 모양과 실제 실행계획은 다를 수 있습니다.",
      explanation: "뷰 머징, Unnesting, Pushdown은 실행계획을 크게 바꾸므로 필요한 경우 제어합니다."
    },
    {
      topic: "Top-N 튜닝",
      difficulty: "실전",
      scenario: "대량 정렬 후 일부 페이지만 조회하는 SQL이 느리다.",
      correct: "정렬 기준과 필터 조건에 맞는 인덱스를 검토하고 불필요한 전체 정렬을 줄인다.",
      wrong: ["정렬은 항상 메모리에서 끝나므로 튜닝 대상이 아니다.", "ORDER BY가 있으면 어떤 인덱스도 사용할 수 없다.", "OFFSET이 클수록 항상 빠르다."],
      hint: "정렬할 전체 범위를 줄이세요.",
      explanation: "Top-N과 페이징은 조건, 정렬 컬럼, 인덱스 순서를 함께 설계해야 합니다."
    },
    {
      topic: "OR 조건 분해",
      difficulty: "실전",
      scenario: "서로 다른 컬럼 조건이 OR로 묶여 인덱스 효율이 낮다.",
      correct: "조건별 인덱스 후보가 다르면 UNION ALL로 분해하되 중복 발생 여부를 제어한다.",
      wrong: ["OR 조건은 항상 FULL SCAN만 가능하다.", "UNION ALL로 바꾸면 중복 여부를 볼 필요가 없다.", "OR 조건에는 어떤 인덱스도 사용할 수 없다."],
      hint: "분기별 access predicate를 살리는 접근입니다.",
      explanation: "OR 분해는 각 분기 인덱스를 살릴 수 있지만 UNION ALL은 중복 제거를 하지 않습니다."
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
    id: "modeling-core",
    category: "1과목 > 모델링 기본",
    title: "모델링은 SQL 결과와 성능을 결정한다",
    summary: "SQLP 모델링은 용어 암기보다 엔터티, 속성, 관계, 식별자가 결과 건수와 조인 경로에 주는 영향을 묻는다.",
    keyPoints: ["모델링은 현실 업무를 추상화, 단순화, 명확화하는 과정이다.", "엔터티는 업무 의미, 식별성, 반복 발생, 지속 관리 필요성을 기준으로 판단한다.", "관계 선택성과 카디널리티는 INNER/OUTER JOIN 선택으로 이어진다.", "식별자와 조건 컬럼 위치는 인덱스 설계와 실행계획에 영향을 준다."],
    examTrap: "화면 항목이면 엔터티, 조인이 많으면 반정규화처럼 단순 규칙으로 판단하는 보기는 위험하다.",
    oracleAngle: "Oracle 실행계획의 조인 순서와 접근 경로는 모델의 관계 구조와 조건 컬럼 위치에 크게 영향을 받는다."
  },
  {
    id: "modeling-normalization",
    category: "1과목 > 정규화와 반정규화",
    title: "정규화는 이상 현상 제거, 반정규화는 검증된 처방",
    summary: "정규화는 변경 이상과 중복을 줄이고, 반정규화는 병목이 검증된 뒤 정합성 비용까지 고려해 제한적으로 적용한다.",
    keyPoints: ["1NF는 반복 속성과 복합 속성을 제거한다.", "2NF는 복합 식별자의 부분 종속을 제거한다.", "3NF는 비식별자 속성 간 이행 종속을 제거한다.", "반정규화 전에는 SQL, 인덱스, 통계, 조인 방식을 먼저 확인한다."],
    examTrap: "조회가 느리다는 말만 보고 중복 컬럼을 추가하는 보기는 정답이 되기 어렵다."
  },
  {
    id: "sql-basic-order",
    category: "2과목 > SQL 기본",
    title: "논리 처리 순서와 NULL은 기본 함정이다",
    summary: "SELECT 논리 처리 순서, WHERE/HAVING 차이, NULL 비교와 집계는 객관식에서 반복되는 함정이다.",
    keyPoints: ["논리 처리 순서는 FROM/JOIN, WHERE, GROUP BY, HAVING, SELECT, ORDER BY로 이해한다.", "WHERE는 원본 행 필터, HAVING은 그룹 결과 필터다.", "COUNT(*)는 행 수, COUNT(expr)는 NULL 표현식을 제외한다.", "NULL 비교는 IS NULL을 사용하며 3값 논리를 고려한다."],
    examTrap: "SELECT 별칭을 WHERE에서 바로 쓰거나 집계 조건을 WHERE에 쓰는 보기는 조심해야 한다."
  },
  {
    id: "sql-join-subquery",
    category: "2과목 > 조인과 서브쿼리",
    title: "조인은 결과 보존, 서브쿼리는 NULL을 먼저 본다",
    summary: "외부 조인의 조건 위치와 NOT IN의 NULL 처리는 실제 시험에서 결과 건수를 바꾸는 대표 포인트다.",
    keyPoints: ["외부 조인에서 보존되어야 할 행이 WHERE 조건으로 제거되지 않는지 확인한다.", "오른쪽 테이블 조건은 ON 절과 WHERE 절에서 의미가 달라질 수 있다.", "NOT IN 서브쿼리에 NULL이 있으면 기대한 결과가 나오지 않을 수 있다.", "EXISTS는 존재 여부 중심이라 세미 조인 형태로 최적화될 수 있다."],
    examTrap: "LEFT JOIN을 썼다는 이유만으로 기준 행이 항상 보존된다고 판단하면 틀릴 수 있다."
  },
  {
    id: "sql-window-topn",
    category: "2과목 > 윈도우 함수와 Top-N",
    title: "Top-N은 정렬 시점과 필터 시점을 분리한다",
    summary: "윈도우 함수는 행을 줄이지 않고 분석 값을 붙이며, Oracle ROWNUM은 정렬 전후 시점을 구분해야 한다.",
    keyPoints: ["ROW_NUMBER는 고유 순번, RANK는 동순위 뒤 순위 건너뜀, DENSE_RANK는 연속 순위다.", "윈도우 함수 결과를 필터링하려면 인라인 뷰나 CTE를 사용한다.", "Oracle ROWNUM은 정렬 전에 부여될 수 있으므로 바깥 블록에서 제한한다.", "동점 포함 Top-N은 RANK, DENSE_RANK, FETCH WITH TIES 계열을 검토한다."],
    examTrap: "ROWNUM과 ORDER BY를 같은 블록에 두고 정렬 후 상위 N건이라고 보는 보기는 위험하다."
  },
  {
    id: "tuning-index",
    category: "3과목 > 인덱스 튜닝",
    title: "인덱스는 존재보다 사용 방식이 중요하다",
    summary: "인덱스 문제는 인덱스가 있느냐보다 선두 컬럼, 조건 형태, access/filter predicate 구분을 묻는다.",
    keyPoints: ["B-Tree 인덱스는 선두 컬럼과 정렬된 키 순서가 탐색 효율을 좌우한다.", "컬럼에 함수를 적용하면 일반 인덱스 access 조건으로 쓰이기 어렵다.", "복합 인덱스는 동등 조건 컬럼과 범위 조건 컬럼 순서를 함께 고려한다.", "Predicate Information에서 access와 filter를 구분한다."],
    examTrap: "인덱스 스캔이 보이면 무조건 성공이라는 보기는 틀릴 가능성이 높다.",
    oracleAngle: "Oracle 실행계획에서는 INDEX RANGE SCAN 이름만 보지 말고 access 조건을 확인한다."
  },
  {
    id: "tuning-join",
    category: "3과목 > 조인 튜닝",
    title: "NL, Hash, Sort Merge는 데이터량과 인덱스가 결정한다",
    summary: "조인 방식은 선행 집합 크기, 후행 인덱스, 조인 조건, 메모리와 정렬 필요성에 따라 달라진다.",
    keyPoints: ["NL 조인은 선행 집합이 작고 후행 인덱스 탐색이 효율적일 때 유리하다.", "Hash 조인은 대량 동등 조인에서 빌드 입력이 적절할 때 유리하다.", "Sort Merge 조인은 정렬된 집합이나 비동등 조인에서 고려될 수 있다.", "LEADING, USE_NL, USE_HASH 힌트는 별칭과 조인 순서 의도를 정확히 맞춰야 한다."],
    examTrap: "USE_NL만 있으면 조인 순서까지 항상 고정된다고 보는 보기는 위험하다."
  },
  {
    id: "tuning-optimizer",
    category: "3과목 > 옵티마이저와 실기 전략",
    title: "옵티마이저는 통계와 변환으로 실행계획을 만든다",
    summary: "SQLP 튜닝 문제는 SQL 문장보다 옵티마이저가 어떤 정보를 보고 어떤 변환을 했는지 묻는 경우가 많다.",
    keyPoints: ["통계 정보는 선택도, 카디널리티, 조인 순서 결정에 영향을 준다.", "뷰 머징, 서브쿼리 Unnesting, 조건 Pushdown은 실행계획을 크게 바꾼다.", "실제 실행 통계의 Starts, A-Rows, Buffers를 함께 본다.", "실기는 요구사항, 모델, 인덱스, 목표 실행계획을 동시에 맞춘다."],
    examTrap: "목표 실행계획만 맞추고 선택 관계를 내부 조인으로 바꾸거나 필수 조건을 빠뜨리면 감점된다.",
    oracleAngle: "힌트는 쿼리 블록과 별칭이 정확해야 하며 상충 힌트는 무시될 수 있다."
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

const seedSql = `-- PostgreSQL 실습에서는 SELECT/WITH 쿼리만 실행합니다.
-- Oracle 힌트는 주석 형태로 작성해 실행계획 의도를 함께 연습합니다.`;

const labCases = [
  ["조인 순서", "고객 기준 최근 주문 조회", "활성 고객 중 최근 30일 주문이 있는 고객만 조회한다. 고객을 먼저 줄인 뒤 주문을 NL 조인으로 탐색하는 의도를 SQL에 표현하라.", `select /*+ leading(c) use_nl(o) index(o idx_orders_01) */ c.cust_id, c.cust_name, o.order_id, o.order_dt from customers c join orders o on o.cust_id = c.cust_id where c.region_cd = :region_cd and o.order_dt >= :from_dt`, ["CUSTOMERS region filter", "NESTED LOOPS", "ORDERS IDX_ORDERS_01 RANGE SCAN"], ["leading(c)", "use_nl(o)", "index(o idx_orders_01)"]],
  ["인덱스 조건", "주문월 조건 SARGable 변환", "TO_CHAR(order_dt,'YYYYMM') 조건을 주문일 인덱스를 사용할 수 있는 범위 조건으로 작성하라.", `select /*+ index(o idx_orders_02) */ o.order_id, o.order_dt, o.amount from orders o where o.order_dt >= :month_start and o.order_dt < :next_month_start`, ["ORDERS IDX_ORDERS_02 RANGE SCAN", "TABLE ACCESS BY INDEX ROWID"], ["index(o idx_orders_02)", "컬럼 함수 제거"]],
  ["해시 조인", "대량 주문상품 집계", "최근 분기 주문상품을 상품별로 집계한다. 해시 조인과 해시 집계를 의도한 SQL을 작성하라.", `select /*+ leading(o) use_hash(oi) */ oi.product_id, sum(oi.sale_amt) sale_amt from orders o join order_items oi on oi.order_id = o.order_id where o.order_dt >= :q_start and o.order_dt < :q_end group by oi.product_id`, ["ORDERS date range scan", "HASH JOIN", "HASH GROUP BY"], ["use_hash(oi)", "group by 집계"]],
  ["외부 조인", "주문 없는 고객 보존", "고객 목록을 기준으로 최근 주문 상태를 보여준다. 주문이 없는 고객도 출력되어야 한다.", `select c.cust_id, c.cust_name, o.order_id, o.status_cd from customers c left join orders o on o.cust_id = c.cust_id and o.order_dt >= :from_dt and o.status_cd = 'PAID' where c.region_cd = :region_cd`, ["CUSTOMERS preserved", "OUTER JOIN", "ORDERS condition in ON"], ["ON 절 조건 위치", "기준 행 보존"]],
  ["Top-N", "카테고리별 매출 Top-N", "상품 카테고리별 매출 상위 3개 상품을 조회한다. 원본 집계 후 순위 필터링이 가능하게 작성하라.", `with sales as (select p.category_cd, oi.product_id, sum(oi.sale_amt) sale_amt from products p join order_items oi on oi.product_id = p.product_id group by p.category_cd, oi.product_id), ranked as (select sales.*, row_number() over(partition by category_cd order by sale_amt desc) rn from sales) select * from ranked where rn <= 3`, ["HASH GROUP BY", "WINDOW SORT", "RN <= 3 FILTER"], ["window function", "inline view filter"]],
  ["스칼라 서브쿼리", "반복 스칼라 서브쿼리 제거", "고객별 마지막 결제일을 SELECT 절 스칼라 서브쿼리로 반복 조회하던 SQL을 사전 집계 조인으로 개선하라.", `with last_pay as (select o.cust_id, max(p.pay_dt) last_pay_dt from orders o join payments p on p.order_id = o.order_id group by o.cust_id) select c.cust_id, c.cust_name, lp.last_pay_dt from customers c left join last_pay lp on lp.cust_id = c.cust_id`, ["PAYMENTS pre aggregation", "CUSTOMERS OUTER JOIN", "No repeated scalar subquery"], ["사전 집계", "반복 수행 제거"]],
  ["세미 조인", "구매 이력 존재 고객", "특정 상품을 구매한 이력이 있는 고객만 조회한다. 중복 제거 정렬보다 존재 여부 중심으로 작성하라.", `select c.cust_id, c.cust_name from customers c where exists (select 1 from orders o join order_items oi on oi.order_id = o.order_id where o.cust_id = c.cust_id and oi.product_id = :product_id)`, ["CUSTOMERS", "SEMI JOIN / EXISTS", "ORDER_ITEMS IDX_ITEMS_01"], ["exists", "중복 제거 회피"]],
  ["뷰 머징", "집계 후 조인 순서 고정", "주문상품을 상품별로 먼저 집계한 뒤 상품과 조인해야 한다. 집계 인라인 뷰가 병합되지 않도록 의도를 표현하라.", `select /*+ no_merge(s) use_hash(p) */ p.category_cd, s.product_id, s.sale_amt from (select product_id, sum(sale_amt) sale_amt from order_items group by product_id) s join products p on p.product_id = s.product_id`, ["ORDER_ITEMS HASH GROUP BY", "NO_MERGE inline view", "HASH JOIN PRODUCTS"], ["no_merge(s)", "use_hash(p)"]],
  ["Top-N 페이징", "주문 목록 페이징", "최근 주문 목록에서 101~120번째 행을 조회한다. 결정적인 정렬 기준을 포함해 작성하라.", `select * from (select q.*, row_number() over(order by q.order_dt desc, q.order_id desc) rn from orders q where q.order_dt >= :from_dt) x where x.rn between 101 and 120`, ["ORDERS date range", "WINDOW SORT ORDER BY", "RN BETWEEN filter"], ["deterministic order by", "row_number"]],
  ["OR 조건 분해", "OR 조건으로 인한 인덱스 비효율", "상태 조건과 채널 조건이 OR로 묶여 인덱스 사용성이 낮다. UNION ALL 분해를 고려해 작성하라.", `select order_id, order_dt, amount from orders where status_cd = :status_cd and order_dt >= :from_dt union all select order_id, order_dt, amount from orders where channel_cd = :channel_cd and order_dt >= :from_dt and status_cd <> :status_cd`, ["Branch 1 index candidate", "Branch 2 index candidate", "UNION ALL no duplicate"], ["or expansion", "중복 방지 조건"]]
] as const;

const labDifficulties: Difficulty[] = ["실전", "중간", "기본"];

export const labQuestions: LabQuestion[] = Array.from({ length: 20 }, (_, index) => {
  const lab = labCases[index % labCases.length];
  const round = Math.floor(index / labCases.length) + 1;
  return {
    id: `lab-${String(index + 1).padStart(2, "0")}`,
    number: index + 1,
    title: round === 1 ? lab[1] : `${lab[1]} 변형`,
    difficulty: labDifficulties[index % labDifficulties.length],
    topic: lab[0],
    scenario: "PostgreSQL에서 실행 가능한 SELECT를 작성하되 Oracle SQLP 튜닝 관점의 힌트와 실행계획 의도를 함께 연습합니다.",
    schemaSql: commonSchema,
    seedSql,
    prompt: lab[2],
    expectedSql: lab[3],
    targetPlan: [...lab[4]],
    oracleNotes: ["힌트는 쿼리 블록과 테이블 별칭이 정확해야 효과를 기대할 수 있습니다.", "목표 실행계획을 맞추더라도 결과 보존 조건을 깨뜨리면 감점입니다.", "Access Predicate와 Filter Predicate를 구분해 인덱스 효율을 설명할 수 있어야 합니다."],
    hints: [...lab[5]],
    rubric: ["요구 결과 보존", "조건의 SARGable 작성", "조인 순서와 방식 의도", "Oracle 힌트 위치와 별칭 정확성"]
  };
});

export function createLocalExtraQuestion(subjectId: SubjectId, count: number): ObjectiveQuestion {
  const bank = [modeling, sqlBasic, tuning].find((item) => item.id === subjectId) ?? tuning;
  return build(bank, 1, 100 + count, `extra-${bank.id}`)[0];
}
