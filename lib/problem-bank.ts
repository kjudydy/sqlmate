import type { Choice, ChoiceId, ConceptArticle, Difficulty, LabQuestion, ObjectiveQuestion, SubjectId } from "@/lib/types";

const choiceIds: ChoiceId[] = ["A", "B", "C", "D"];

type Blueprint = {
  topic: string;
  difficulty: Difficulty;
  stems: string[];
  correct: string;
  distractors: string[];
  hint: string;
  explanation: string;
};

type SubjectConfig = {
  id: SubjectId;
  name: string;
  blueprints: Blueprint[];
};

function rotateChoices(correct: string, distractors: string[], seed: number): { choices: Choice[]; answer: ChoiceId } {
  const all = [correct, ...distractors.slice(0, 3)];
  const correctIndex = seed % 4;
  const ordered = [...all];
  const [correctText] = ordered.splice(0, 1);
  ordered.splice(correctIndex, 0, correctText);

  return {
    choices: ordered.map((text, index) => ({ id: choiceIds[index], text })),
    answer: choiceIds[correctIndex]
  };
}

function makeWhyWrong(choices: Choice[], answer: ChoiceId, explanation: string): Record<ChoiceId, string> {
  return choices.reduce(
    (acc, choice) => {
      acc[choice.id] =
        choice.id === answer
          ? `정답입니다. ${explanation}`
          : "이 선택지는 일부 키워드는 그럴듯하지만 SQLP 관점의 핵심 조건을 빠뜨렸거나 범위를 과장했습니다.";
      return acc;
    },
    {} as Record<ChoiceId, string>
  );
}

function buildQuestions(config: SubjectConfig, count: number): ObjectiveQuestion[] {
  return Array.from({ length: count }, (_, index) => {
    const blueprint = config.blueprints[index % config.blueprints.length];
    const stem = blueprint.stems[Math.floor(index / config.blueprints.length) % blueprint.stems.length];
    const { choices, answer } = rotateChoices(blueprint.correct, blueprint.distractors, index + config.id.length);

    return {
      id: `${config.id}-${String(index + 1).padStart(3, "0")}`,
      number: index + 1,
      subjectId: config.id,
      subjectName: config.name,
      topic: blueprint.topic,
      difficulty: blueprint.difficulty,
      stem: stem.replace("{n}", String(index + 1)).replace("{topic}", blueprint.topic),
      choices,
      answer,
      hint: blueprint.hint,
      explanation: blueprint.explanation,
      whyWrong: makeWhyWrong(choices, answer, blueprint.explanation)
    };
  });
}

const modeling: SubjectConfig = {
  id: "modeling",
  name: "1과목 데이터 모델링의 이해",
  blueprints: [
    {
      topic: "엔터티",
      difficulty: "기본",
      stems: [
        "업무에서 독립적으로 식별되고 지속적으로 관리해야 하는 대상에 대한 설명으로 가장 적절한 것은?",
        "다음 중 엔터티 후보를 판단할 때 가장 먼저 확인해야 할 기준은?",
        "SQLP 모델링 문제에서 엔터티와 단순 속성을 구분하는 기준으로 가장 적절한 것은?"
      ],
      correct: "업무적으로 의미가 있고 식별 가능하며 여러 인스턴스를 가질 수 있는 대상이다.",
      distractors: [
        "화면에 표시되는 모든 입력 항목은 독립 엔터티로 분리해야 한다.",
        "코드 값처럼 값의 종류가 적은 항목은 항상 엔터티가 될 수 없다.",
        "관계형 데이터베이스에서는 모든 엔터티가 물리 테이블과 1:1로 대응해야 한다."
      ],
      hint: "엔터티는 이름보다 업무에서 관리해야 하는 인스턴스 집합인지가 중요합니다.",
      explanation: "엔터티는 업무적으로 관리할 필요가 있고, 인스턴스를 식별할 수 있으며, 속성과 관계를 통해 설명되는 대상입니다."
    },
    {
      topic: "속성",
      difficulty: "기본",
      stems: [
        "속성을 도출할 때 SQLP 관점에서 가장 바람직한 판단은?",
        "다음 중 속성의 원자성에 대한 설명으로 가장 적절한 것은?",
        "데이터 모델에서 파생 속성을 다룰 때 주의해야 할 점은?"
      ],
      correct: "업무적으로 더 이상 분해하지 않아도 되는 의미 단위로 관리한다.",
      distractors: [
        "조회 성능을 위해 모든 속성은 중복 저장하는 것이 원칙이다.",
        "복합 의미를 가진 문자열 속성은 검색 조건에 자주 쓰여도 그대로 두는 것이 정규화에 유리하다.",
        "파생 속성은 원천 속성보다 항상 정확하므로 정합성 검사가 필요 없다."
      ],
      hint: "속성은 업무 의미와 데이터 품질을 함께 봐야 합니다.",
      explanation: "속성은 엔터티의 성질을 나타내며, 원자성과 정합성이 중요합니다. 파생 속성은 성능상 필요할 수 있지만 원천과 동기화 전략이 필요합니다."
    },
    {
      topic: "관계",
      difficulty: "중간",
      stems: [
        "선택 관계(optional relationship)를 SQL 작성에 반영할 때 가장 적절한 방식은?",
        "관계의 선택성을 잘못 해석했을 때 발생하기 쉬운 문제는?",
        "ERD에서 관계선을 읽고 SQL 조인 방식을 결정할 때 우선 고려해야 할 것은?"
      ],
      correct: "부모 또는 자식의 존재 선택성을 확인하고, 누락되면 안 되는 쪽을 기준으로 외부 조인을 검토한다.",
      distractors: [
        "모든 관계는 내부 조인으로 작성해야 데이터 정합성이 보장된다.",
        "선택 관계는 물리적으로 외래키를 만들 수 없다는 뜻이다.",
        "외부 조인은 성능이 나쁘므로 선택 관계에서도 사용하면 안 된다."
      ],
      hint: "선택 관계는 결과 집합에서 보존해야 하는 행을 결정합니다.",
      explanation: "선택 관계를 내부 조인으로 처리하면 존재하지 않는 관련 행 때문에 기준 데이터가 사라질 수 있습니다. SQLP 실기에서도 감점 포인트입니다."
    },
    {
      topic: "식별자",
      difficulty: "중간",
      stems: [
        "주식별자를 선정할 때 가장 적절한 기준은?",
        "본질식별자와 인조식별자의 비교로 옳은 것은?",
        "식별자 설계가 SQL 성능에 미치는 영향으로 가장 적절한 설명은?"
      ],
      correct: "업무적으로 유일성, 최소성, 안정성, 존재성을 만족하는 후보를 우선 검토한다.",
      distractors: [
        "인조식별자는 항상 본질식별자보다 업무 의미가 명확하다.",
        "복합 식별자는 조인이 어려우므로 어떤 경우에도 사용하면 안 된다.",
        "식별자는 논리 모델에만 영향을 주며 물리 인덱스 설계와 무관하다."
      ],
      hint: "식별자는 유일하기만 하면 되는 것이 아닙니다.",
      explanation: "좋은 식별자는 유일성과 최소성뿐 아니라 변경 가능성이 낮아야 합니다. 인조식별자는 편리하지만 업무 유일성 제약을 별도로 보장해야 합니다."
    },
    {
      topic: "정규화",
      difficulty: "실전",
      stems: [
        "제3정규형 위반을 판단하는 기준으로 가장 적절한 것은?",
        "다음 중 정규화의 목적을 가장 잘 설명한 것은?",
        "SQLP 모델링 문제에서 반정규화를 검토하기 전에 먼저 확인해야 하는 것은?"
      ],
      correct: "기본키가 아닌 속성이 다른 기본키가 아닌 속성에 종속되는 이행 종속을 제거한다.",
      distractors: [
        "조회 성능 향상을 위해 중복 데이터를 우선 늘리는 과정이다.",
        "모든 테이블을 반드시 단일 컬럼 기본키로 바꾸는 과정이다.",
        "NULL을 완전히 없애기 위해 모든 선택 관계를 필수 관계로 바꾸는 과정이다."
      ],
      hint: "3NF의 키워드는 이행 종속입니다.",
      explanation: "정규화는 중복과 이상 현상을 줄이는 설계 절차입니다. 반정규화는 정규화 이후 성능 요구와 정합성 유지 비용을 비교한 뒤 적용합니다."
    },
    {
      topic: "NULL",
      difficulty: "중간",
      stems: [
        "NULL 속성을 포함한 모델을 SQL로 조회할 때 주의할 점은?",
        "다음 중 NULL의 의미에 대한 설명으로 가장 적절한 것은?",
        "선택 속성과 NULL 허용 여부를 결정할 때 바람직한 기준은?"
      ],
      correct: "NULL은 알 수 없음 또는 해당 없음의 의미를 가질 수 있으므로 업무 의미를 명확히 정의해야 한다.",
      distractors: [
        "NULL은 숫자 0 또는 빈 문자열과 항상 같은 값으로 처리된다.",
        "NULL 허용 컬럼은 인덱스를 만들 수 없다.",
        "NULL 비교에는 항상 = NULL 구문을 사용해야 한다."
      ],
      hint: "NULL은 값이 아니라 상태에 가깝습니다.",
      explanation: "NULL은 비교, 집계, 조인 조건에서 예상과 다른 결과를 만들 수 있습니다. Oracle에서는 빈 문자열을 NULL로 다루는 특징도 주의해야 합니다."
    },
    {
      topic: "데이터 모델과 트랜잭션",
      difficulty: "실전",
      stems: [
        "트랜잭션 관점에서 데이터 모델을 검토하는 이유로 가장 적절한 것은?",
        "모델이 표현하는 트랜잭션을 이해할 때 확인해야 할 내용은?",
        "업무 트랜잭션과 데이터 모델의 불일치가 만들 수 있는 문제는?"
      ],
      correct: "동시에 생성, 변경, 삭제되는 데이터 범위를 파악해 무결성과 성능을 함께 검토하기 위해서다.",
      distractors: [
        "트랜잭션은 애플리케이션 코드 문제이므로 논리 모델과 무관하다.",
        "트랜잭션이 많으면 모든 테이블을 하나로 합치는 것이 원칙이다.",
        "동시성은 DBMS가 자동 처리하므로 식별자와 관계 설계에서는 고려하지 않는다."
      ],
      hint: "모델은 업무 행위의 단위를 담아야 합니다.",
      explanation: "모델과 트랜잭션이 맞지 않으면 조인 비용, 잠금 범위, 정합성 유지 비용이 커질 수 있습니다."
    },
    {
      topic: "슈퍼타입/서브타입",
      difficulty: "실전",
      stems: [
        "슈퍼타입/서브타입 모델을 물리 설계로 전환할 때 고려해야 할 기준은?",
        "서브타입 통합 또는 분리에 대한 설명으로 가장 적절한 것은?",
        "SQLP에서 서브타입 모델의 성능 문제를 판단할 때 봐야 하는 것은?"
      ],
      correct: "조회 패턴, 발생 건수, 공통 속성 비율, 배타성, 변경 가능성을 종합해 결정한다.",
      distractors: [
        "서브타입은 무조건 하나의 테이블로 통합해야 정규화가 유지된다.",
        "서브타입은 항상 각각 별도 테이블로 분리해야 조인이 사라진다.",
        "슈퍼타입/서브타입은 개념 모델에만 존재하므로 물리 설계에는 영향이 없다."
      ],
      hint: "정답은 하나의 고정 규칙이 아니라 트레이드오프입니다.",
      explanation: "슈퍼타입/서브타입 물리화는 통합, 개별, 공통+개별 방식이 있으며 데이터 특성과 조회 패턴에 따라 달라집니다."
    },
    {
      topic: "관계와 조인",
      difficulty: "중간",
      stems: [
        "데이터 모델의 관계를 SQL 조인으로 변환할 때 가장 적절한 설명은?",
        "관계선의 카디널리티를 잘못 해석하면 어떤 문제가 발생할 수 있는가?",
        "모델이 표현하는 관계와 실제 SQL 결과 건수의 관계로 옳은 것은?"
      ],
      correct: "관계의 카디널리티와 선택성은 조인 결과 건수와 누락 가능성을 예측하는 기준이 된다.",
      distractors: [
        "ERD 관계선은 설명용이므로 SQL 조인 조건과 무관하다.",
        "1:M 관계에서는 항상 M쪽 테이블만 조회해야 한다.",
        "카디널리티는 물리 저장 순서를 의미한다."
      ],
      hint: "관계선은 SQL 결과 집합의 모양을 예측하게 해줍니다.",
      explanation: "관계와 카디널리티를 이해하면 조인 조건 누락, 중복 증가, 기준 데이터 누락을 방지할 수 있습니다."
    },
    {
      topic: "반정규화",
      difficulty: "실전",
      stems: [
        "반정규화를 적용할 때 가장 적절한 판단은?",
        "중복 컬럼을 추가하는 반정규화에서 반드시 검토해야 하는 것은?",
        "SQLP에서 반정규화가 정답이 되기 어려운 경우는?"
      ],
      correct: "정규화 모델을 기준으로 성능 병목과 정합성 유지 방안을 함께 검토한 뒤 제한적으로 적용한다.",
      distractors: [
        "반정규화는 데이터 중복을 늘리는 것이므로 항상 금지된다.",
        "반정규화를 하면 인덱스 설계가 필요 없어지는 것이 일반적이다.",
        "조회 SQL이 느리면 원인 분석 없이 우선 컬럼을 중복 저장한다."
      ],
      hint: "반정규화는 성능 해법이지만 정합성 비용이 붙습니다.",
      explanation: "반정규화는 조회 성능을 개선할 수 있지만 변경 시 정합성 관리가 필요합니다. 병목 원인 분석 없이 적용하면 부작용이 큽니다."
    }
  ]
};

const sqlBasic: SubjectConfig = {
  id: "sql-basic",
  name: "2과목 SQL 기본 및 활용",
  blueprints: [
    {
      topic: "SELECT 논리 처리 순서",
      difficulty: "기본",
      stems: [
        "SELECT 문장의 논리적 처리 순서로 가장 적절한 것은?",
        "GROUP BY 별칭 사용 가능 여부를 판단할 때 근거가 되는 개념은?",
        "WHERE 절과 HAVING 절의 차이를 가장 잘 설명한 것은?"
      ],
      correct: "FROM/JOIN 이후 WHERE, GROUP BY, HAVING, SELECT, ORDER BY 순서로 이해한다.",
      distractors: [
        "SELECT 절이 항상 가장 먼저 실행되므로 SELECT 별칭은 모든 절에서 사용할 수 있다.",
        "ORDER BY는 집계 전에 실행되므로 그룹 함수와 함께 사용할 수 없다.",
        "HAVING은 개별 행 필터링 전용이고 WHERE는 그룹 필터링 전용이다."
      ],
      hint: "문법 작성 순서와 논리 처리 순서는 다릅니다.",
      explanation: "논리 처리 순서를 알면 별칭 사용, 집계 필터링, 조인 후 필터링 문제를 정확히 판단할 수 있습니다."
    },
    {
      topic: "조인",
      difficulty: "중간",
      stems: [
        "외부 조인에서 필터 조건의 위치가 중요한 이유는?",
        "INNER JOIN과 LEFT OUTER JOIN의 차이에 대한 설명으로 가장 적절한 것은?",
        "조인 조건 누락이 발생했을 때 가장 먼저 의심해야 할 결과는?"
      ],
      correct: "외부 조인 대상 테이블 조건을 WHERE에 두면 NULL 보존 행이 제거될 수 있다.",
      distractors: [
        "외부 조인은 WHERE 조건의 영향을 받지 않는다.",
        "INNER JOIN은 조인 조건이 없어도 항상 기준 테이블 건수를 유지한다.",
        "조인 조건이 누락되면 DBMS가 외래키를 자동으로 찾아 보정한다."
      ],
      hint: "ON 절과 WHERE 절은 결과 보존 의미가 다를 수 있습니다.",
      explanation: "외부 조인은 보존 테이블의 행을 남기는 것이 핵심입니다. WHERE 조건이 NULL 확장 행을 제거하면 내부 조인처럼 동작할 수 있습니다."
    },
    {
      topic: "집계와 HAVING",
      difficulty: "기본",
      stems: [
        "집계 함수와 GROUP BY에 대한 설명으로 옳은 것은?",
        "COUNT(*)와 COUNT(컬럼)의 차이로 가장 적절한 것은?",
        "HAVING 절을 사용해야 하는 상황은?"
      ],
      correct: "COUNT(컬럼)은 NULL을 제외하고 COUNT(*)는 행 자체를 센다.",
      distractors: [
        "SUM 함수는 NULL이 하나라도 포함되면 항상 NULL을 반환한다.",
        "GROUP BY가 있으면 SELECT 절에는 어떤 컬럼이든 자유롭게 쓸 수 있다.",
        "HAVING은 인덱스 사용을 위해 반드시 WHERE보다 먼저 작성해야 한다."
      ],
      hint: "집계에서 NULL 처리 방식은 자주 나옵니다.",
      explanation: "COUNT(*)는 조건을 만족한 행 수를 세고, COUNT(expr)는 expr이 NULL이 아닌 행만 셉니다. 그룹 조건은 HAVING에서 처리합니다."
    },
    {
      topic: "서브쿼리",
      difficulty: "중간",
      stems: [
        "상관 서브쿼리에 대한 설명으로 가장 적절한 것은?",
        "IN과 EXISTS를 비교할 때 고려해야 할 점은?",
        "스칼라 서브쿼리의 특징으로 옳은 것은?"
      ],
      correct: "상관 서브쿼리는 외부 쿼리의 값을 참조하므로 실행 방식과 변환 가능성을 확인해야 한다.",
      distractors: [
        "상관 서브쿼리는 항상 한 번만 실행되므로 성능 문제가 생기지 않는다.",
        "EXISTS는 반드시 서브쿼리 결과 전체를 정렬한 뒤 비교한다.",
        "스칼라 서브쿼리는 여러 행 여러 컬럼을 반환해도 SELECT 절에서 사용할 수 있다."
      ],
      hint: "외부 쿼리 값을 참조하는지 보세요.",
      explanation: "상관 서브쿼리는 행 단위 반복처럼 보일 수 있지만 옵티마이저가 세미 조인 등으로 변환할 수 있습니다. 반환 건수 조건도 중요합니다."
    },
    {
      topic: "윈도우 함수",
      difficulty: "실전",
      stems: [
        "윈도우 함수 사용 시 PARTITION BY와 ORDER BY의 역할로 옳은 것은?",
        "순위 함수 RANK와 DENSE_RANK의 차이로 가장 적절한 것은?",
        "누적 합계를 작성할 때 window frame을 명시해야 하는 이유는?"
      ],
      correct: "PARTITION BY는 분석 그룹을 나누고 ORDER BY는 그룹 내 계산 순서를 정의한다.",
      distractors: [
        "윈도우 함수는 GROUP BY처럼 결과 행 수를 항상 줄인다.",
        "RANK와 DENSE_RANK는 동률 처리 후 다음 순위에서 항상 같은 값을 반환한다.",
        "윈도우 함수는 WHERE 절에서 직접 사용할 수 있다."
      ],
      hint: "분석 함수는 행을 보존하면서 계산합니다.",
      explanation: "윈도우 함수는 집계와 달리 행을 유지합니다. Oracle에서는 ROWS/RANGE 프레임 차이가 결과에 영향을 줄 수 있습니다."
    },
    {
      topic: "집합 연산자",
      difficulty: "중간",
      stems: [
        "UNION과 UNION ALL의 차이로 옳은 것은?",
        "집합 연산자를 사용할 때 컬럼 목록에 대한 조건은?",
        "INTERSECT와 MINUS/EXCEPT의 의미로 가장 적절한 것은?"
      ],
      correct: "UNION은 중복 제거를 수행하고 UNION ALL은 중복 제거 없이 결과를 결합한다.",
      distractors: [
        "UNION ALL은 항상 UNION보다 정답이 다르므로 사용할 수 없다.",
        "집합 연산자는 양쪽 SELECT의 컬럼 개수와 데이터 타입 호환성을 요구하지 않는다.",
        "INTERSECT는 두 집합의 차집합을 반환한다."
      ],
      hint: "중복 제거 여부가 성능과 결과를 모두 바꿉니다.",
      explanation: "UNION은 정렬 또는 해시 기반 중복 제거 비용이 들 수 있습니다. SQLP에서는 결과 의미와 성능을 함께 판단합니다."
    },
    {
      topic: "Top N 쿼리",
      difficulty: "실전",
      stems: [
        "Top N 쿼리를 작성할 때 ORDER BY와 제한 조건의 관계로 옳은 것은?",
        "Oracle의 ROWNUM 기반 Top N에서 주의할 점은?",
        "상위 N건을 안정적으로 구하기 위한 가장 적절한 접근은?"
      ],
      correct: "정렬이 먼저 적용된 결과에 대해 행 제한이 적용되도록 인라인 뷰나 FETCH 구문을 사용한다.",
      distractors: [
        "WHERE ROWNUM <= N을 ORDER BY와 같은 SELECT 블록에 쓰면 항상 정렬 후 제한된다.",
        "Top N은 인덱스와 무관하므로 어떤 정렬 컬럼도 성능 차이가 없다.",
        "동률 처리는 SQL에서 표현할 수 없고 애플리케이션에서만 처리한다."
      ],
      hint: "Oracle ROWNUM은 부여 시점이 함정입니다.",
      explanation: "Oracle의 전통적인 Top N은 ORDER BY를 인라인 뷰 내부에 두고 바깥에서 ROWNUM을 제한해야 정렬 후 제한 의미가 됩니다."
    },
    {
      topic: "NULL 함수",
      difficulty: "중간",
      stems: [
        "NULL 처리 함수 사용 시 성능 관점에서 주의할 점은?",
        "NVL/COALESCE를 조건절 컬럼에 적용할 때 발생할 수 있는 문제는?",
        "NULL 비교를 올바르게 작성한 것은?"
      ],
      correct: "인덱스 컬럼에 함수를 적용하면 일반 인덱스 액세스가 어려워질 수 있다.",
      distractors: [
        "NVL을 쓰면 모든 조건이 자동으로 인덱스 범위 스캔으로 변환된다.",
        "NULL은 = NULL로 비교해야 한다.",
        "COALESCE는 표준 SQL이 아니므로 어떤 DBMS에서도 사용할 수 없다."
      ],
      hint: "조건절의 왼쪽 컬럼을 가공하는지 보세요.",
      explanation: "조건절에서 컬럼에 함수를 적용하면 SARGable하지 않은 표현이 될 수 있습니다. 필요하면 함수 기반 인덱스나 조건 재작성도 검토합니다."
    },
    {
      topic: "DML/TCL",
      difficulty: "기본",
      stems: [
        "COMMIT과 ROLLBACK에 대한 설명으로 옳은 것은?",
        "트랜잭션 제어어의 역할로 가장 적절한 것은?",
        "DML 수행 후 잠금과 트랜잭션에 대해 올바른 설명은?"
      ],
      correct: "COMMIT은 변경을 확정하고 ROLLBACK은 미확정 변경을 취소한다.",
      distractors: [
        "SELECT 문은 항상 테이블 전체에 배타 잠금을 건다.",
        "ROLLBACK은 이미 COMMIT된 모든 과거 변경까지 되돌린다.",
        "DML은 자동으로 즉시 영구 저장되므로 트랜잭션과 무관하다."
      ],
      hint: "트랜잭션의 경계를 생각하세요.",
      explanation: "DML은 트랜잭션 안에서 수행되고 COMMIT 전까지는 미확정 상태입니다. 잠금과 동시성 문제는 SQLP 튜닝에서도 중요합니다."
    },
    {
      topic: "계층형/재귀 질의",
      difficulty: "실전",
      stems: [
        "계층형 질의에서 부모-자식 탐색 방향을 판단할 때 중요한 것은?",
        "Oracle CONNECT BY와 재귀 CTE에 대한 설명으로 가장 적절한 것은?",
        "계층 데이터 조회에서 순환 구조를 주의해야 하는 이유는?"
      ],
      correct: "시작 조건과 부모-자식 연결 조건을 명확히 해 탐색 방향과 깊이를 제어해야 한다.",
      distractors: [
        "계층형 질의는 항상 전체 테이블 스캔만 가능하다.",
        "순환 구조는 DBMS가 무조건 자동으로 제거하므로 고려할 필요가 없다.",
        "START WITH는 최종 출력 정렬 조건을 의미한다."
      ],
      hint: "루트와 연결 조건이 핵심입니다.",
      explanation: "계층형 질의는 시작점, 연결 방향, 순환 방지, 형제 정렬이 중요합니다. Oracle 실무에서는 CONNECT BY 관련 문법도 자주 다뤄집니다."
    }
  ]
};

const tuning: SubjectConfig = {
  id: "tuning",
  name: "3과목 SQL 고급활용 및 튜닝",
  blueprints: [
    {
      topic: "SQL 처리 과정",
      difficulty: "기본",
      stems: [
        "SQL 처리 과정에 대한 설명으로 가장 적절한 것은?",
        "하드 파싱을 줄이기 위한 방법으로 가장 적절한 것은?",
        "바인드 변수 사용의 주요 효과는?"
      ],
      correct: "파싱, 최적화, 실행, fetch 단계를 이해하고 공유 가능한 SQL은 재사용되도록 작성한다.",
      distractors: [
        "리터럴 값을 매번 다르게 넣으면 공유 SQL이 더 잘 재사용된다.",
        "하드 파싱은 실행계획이 이미 있어도 반드시 매번 수행된다.",
        "바인드 변수는 I/O를 물리적으로 없애는 기능이다."
      ],
      hint: "공유와 재사용은 SQL 텍스트와 바인드 변수에 영향을 받습니다.",
      explanation: "SQL은 파싱과 최적화를 거쳐 실행됩니다. 바인드 변수는 불필요한 하드 파싱과 shared pool 부하를 줄이는 데 중요합니다."
    },
    {
      topic: "옵티마이저",
      difficulty: "실전",
      stems: [
        "비용 기반 옵티마이저가 실행계획을 선택할 때 활용하는 주요 정보는?",
        "통계정보가 오래되었을 때 발생할 수 있는 문제는?",
        "카디널리티 추정 오류가 조인 방식에 미치는 영향은?"
      ],
      correct: "테이블/인덱스 통계, 컬럼 분포, 선택도, 시스템 통계 등을 활용해 비용을 추정한다.",
      distractors: [
        "옵티마이저는 SQL 작성 순서만 그대로 따라 실행한다.",
        "통계정보는 실행계획과 무관하며 저장 공간 계산에만 쓰인다.",
        "카디널리티 추정이 틀려도 조인 순서와 조인 방식은 변하지 않는다."
      ],
      hint: "옵티마이저는 추정으로 계획을 세웁니다.",
      explanation: "CBO는 통계와 선택도를 바탕으로 비용을 계산합니다. 데이터 분포 왜곡이나 오래된 통계는 잘못된 조인 순서와 액세스 경로를 만들 수 있습니다."
    },
    {
      topic: "인덱스 스캔",
      difficulty: "실전",
      stems: [
        "복합 인덱스 설계에서 선두 컬럼을 정할 때 가장 중요한 기준은?",
        "Index Range Scan이 유리한 경우로 가장 적절한 것은?",
        "인덱스 스캔 효율을 떨어뜨리는 조건은?"
      ],
      correct: "자주 함께 사용되는 조건, 등치/범위 조건 순서, 선택도, 정렬/조인 필요성을 함께 고려한다.",
      distractors: [
        "컬럼명이 짧은 순서로 복합 인덱스를 구성해야 한다.",
        "복합 인덱스는 선두 컬럼 조건이 없어도 항상 모든 컬럼을 효율적으로 탐색한다.",
        "선택도가 낮은 컬럼은 어떤 경우에도 인덱스 선두에 오면 안 된다."
      ],
      hint: "선두 컬럼과 등치 조건, 범위 조건 이후 컬럼 활용을 떠올리세요.",
      explanation: "복합 인덱스는 선두 컬럼, 조건 형태, 정렬 요구가 중요합니다. 범위 조건 뒤 컬럼은 탐색 범위 축소 효과가 제한될 수 있습니다."
    },
    {
      topic: "테이블 액세스 최소화",
      difficulty: "실전",
      stems: [
        "인덱스 ROWID 액세스 비용을 줄이는 방법으로 가장 적절한 것은?",
        "테이블 액세스가 많은 실행계획을 개선할 때 검토할 것은?",
        "커버링 인덱스의 장점으로 가장 적절한 것은?"
      ],
      correct: "필터링 효율이 좋은 인덱스와 필요한 컬럼 포함 여부를 검토해 테이블 방문 횟수를 줄인다.",
      distractors: [
        "인덱스를 사용하면 테이블 액세스 비용은 항상 0이 된다.",
        "테이블 액세스가 많으면 인덱스를 모두 삭제하는 것이 정답이다.",
        "ROWID 액세스는 정렬 비용과만 관련 있고 랜덤 I/O와는 무관하다."
      ],
      hint: "인덱스 스캔 뒤 테이블을 몇 번 방문하는지 보세요.",
      explanation: "인덱스로 많은 ROWID를 얻은 뒤 테이블을 반복 방문하면 랜덤 I/O가 커집니다. 선택도, 클러스터링 팩터, 커버링 가능성을 봐야 합니다."
    },
    {
      topic: "NL 조인",
      difficulty: "실전",
      stems: [
        "Nested Loop 조인이 유리한 상황으로 가장 적절한 것은?",
        "NL 조인에서 inner 테이블 인덱스가 중요한 이유는?",
        "LEADING과 USE_NL 힌트를 함께 사용할 때 주의해야 할 점은?"
      ],
      correct: "선행 집합이 작고 후행 집합을 인덱스로 반복 탐색할 수 있을 때 유리하다.",
      distractors: [
        "두 테이블이 모두 매우 크고 조인 결과도 대부분이면 항상 NL 조인이 최선이다.",
        "NL 조인은 후행 테이블 접근 경로와 무관하게 일정한 비용을 가진다.",
        "USE_NL 힌트만 쓰면 조인 순서가 항상 자동으로 최적화된다."
      ],
      hint: "선행 건수 × 후행 접근 비용을 생각하세요.",
      explanation: "NL 조인은 반복 접근 구조라 선행 집합 크기와 후행 인덱스 효율이 핵심입니다. Oracle 힌트는 LEADING으로 순서를, USE_NL로 방식을 분리해 생각합니다."
    },
    {
      topic: "해시 조인",
      difficulty: "실전",
      stems: [
        "Hash Join이 유리한 상황으로 가장 적절한 것은?",
        "해시 조인에서 build input 선택이 중요한 이유는?",
        "USE_HASH 힌트를 사용할 때 고려해야 할 점은?"
      ],
      correct: "대량 데이터의 동등 조인에서 작은 집합으로 해시 테이블을 만들고 큰 집합을 탐색할 때 유리하다.",
      distractors: [
        "해시 조인은 범위 조인과 비동등 조인에서만 사용할 수 있다.",
        "해시 조인은 메모리 사용량과 무관하므로 대용량에서도 항상 안정적이다.",
        "해시 조인은 인덱스가 있으면 절대 선택되지 않는다."
      ],
      hint: "대량, 동등 조인, build/probe를 떠올리세요.",
      explanation: "해시 조인은 대량 동등 조인에 강하지만 메모리 부족 시 temp 사용이 늘 수 있습니다. 작은 쪽을 build로 두는 것이 일반적으로 유리합니다."
    },
    {
      topic: "실행계획 판독",
      difficulty: "실전",
      stems: [
        "실행계획의 Predicate Information을 볼 때 가장 중요한 구분은?",
        "Access Predicate와 Filter Predicate의 차이로 가장 적절한 것은?",
        "실행계획 튜닝에서 Rows 추정치와 실제 Rows를 비교하는 이유는?"
      ],
      correct: "Access Predicate는 탐색 범위 결정에 직접 쓰이고 Filter Predicate는 읽은 뒤 걸러내는 조건이다.",
      distractors: [
        "Filter Predicate는 항상 Access Predicate보다 성능이 좋다.",
        "Predicate Information은 SQL 문법 오류를 찾는 용도로만 사용된다.",
        "Rows 추정치는 실행계획과 무관하므로 실제 실행 결과와 비교할 필요가 없다."
      ],
      hint: "인덱스에서 범위를 줄이는 조건인지, 읽고 버리는 조건인지 보세요.",
      explanation: "Predicate 구분은 인덱스 활용도를 판단하는 핵심입니다. 추정 행 수와 실제 행 수 차이는 통계/선택도 문제를 드러냅니다."
    },
    {
      topic: "스칼라 서브쿼리",
      difficulty: "실전",
      stems: [
        "스칼라 서브쿼리 튜닝에서 주의할 점은?",
        "SELECT 절 스칼라 서브쿼리가 성능 문제를 만들 수 있는 이유는?",
        "스칼라 서브쿼리를 조인으로 바꿔볼 수 있는 상황은?"
      ],
      correct: "외부 행마다 반복 수행될 수 있으므로 캐싱 가능성, 중복 키 수, 조인 변환 가능성을 확인한다.",
      distractors: [
        "스칼라 서브쿼리는 항상 한 번만 실행되므로 대량 데이터에서도 안전하다.",
        "스칼라 서브쿼리는 두 컬럼 이상을 반환하는 것이 일반적이다.",
        "스칼라 서브쿼리는 인덱스와 무관하므로 튜닝 대상이 아니다."
      ],
      hint: "외부 행 수와 서브쿼리 반복 비용을 곱해 보세요.",
      explanation: "스칼라 서브쿼리는 결과 캐싱이 도움이 될 수 있지만 중복도가 낮거나 대량이면 비용이 커질 수 있습니다."
    },
    {
      topic: "파티셔닝",
      difficulty: "실전",
      stems: [
        "Partition Pruning이 성능에 도움이 되는 이유는?",
        "파티션 키 조건 작성 시 주의할 점은?",
        "파티션 테이블에서 전역/지역 인덱스를 고려하는 기준은?"
      ],
      correct: "조건에 맞는 파티션만 읽도록 해 스캔 범위와 I/O를 줄일 수 있다.",
      distractors: [
        "파티셔닝을 적용하면 모든 쿼리가 자동으로 단일 블록 조회가 된다.",
        "파티션 키에 함수를 적용해도 pruning에는 영향이 없다.",
        "지역 인덱스와 전역 인덱스는 관리와 성능 특성이 완전히 동일하다."
      ],
      hint: "파티션을 탈 수 있게 조건을 쓰는지가 중요합니다.",
      explanation: "파티션 pruning은 대용량 테이블에서 읽을 범위를 줄입니다. 파티션 키 가공, 암시적 형변환은 pruning을 방해할 수 있습니다."
    },
    {
      topic: "Lock과 동시성",
      difficulty: "중간",
      stems: [
        "Lock과 트랜잭션 동시성 제어에 대한 설명으로 옳은 것은?",
        "불필요한 Lock 경합을 줄이기 위한 SQL 작성 원칙은?",
        "대량 DML 튜닝에서 트랜잭션 크기를 고려해야 하는 이유는?"
      ],
      correct: "변경 대상 범위와 트랜잭션 지속 시간을 줄이면 경합과 대기 시간을 줄이는 데 도움이 된다.",
      distractors: [
        "COMMIT을 전혀 하지 않으면 동시성이 항상 좋아진다.",
        "SELECT FOR UPDATE는 잠금을 걸지 않는 조회 전용 구문이다.",
        "인덱스는 조회 성능에만 영향을 주고 DML 잠금 범위와는 무관하다."
      ],
      hint: "잠금은 오래, 넓게 잡을수록 경합 가능성이 커집니다.",
      explanation: "동시성 튜닝은 SQL 실행 시간, 변경 범위, 인덱스, 트랜잭션 경계가 함께 작용합니다."
    }
  ]
};

export const subjects = [modeling, sqlBasic, tuning].map(({ id, name }) => ({ id, name }));

export const objectiveQuestions: ObjectiveQuestion[] = [
  ...buildQuestions(modeling, 100),
  ...buildQuestions(sqlBasic, 100),
  ...buildQuestions(tuning, 100)
];

export const conceptArticles: ConceptArticle[] = [
  {
    id: "concept-model-entity",
    category: "데이터 모델링",
    title: "엔터티, 속성, 관계를 SQL로 읽는 법",
    summary: "SQLP는 모델링 용어를 암기하는 시험이 아니라, 모델이 SQL 결과와 성능에 어떤 영향을 주는지 묻습니다.",
    keyPoints: [
      "엔터티는 업무적으로 관리해야 하는 인스턴스 집합입니다.",
      "속성은 원자성, 의미 명확성, 정합성 유지 가능성을 기준으로 봅니다.",
      "관계의 카디널리티와 선택성은 조인 결과 건수와 누락 가능성을 결정합니다.",
      "선택 관계를 내부 조인으로 처리하면 기준 행이 사라질 수 있습니다."
    ],
    examTrap: "ERD 관계선을 단순히 조인 조건으로만 보지 말고, 어떤 행을 보존해야 하는지까지 판단해야 합니다.",
    oracleAngle: "Oracle SQL 실기에서는 선택 관계를 놓쳐 INNER JOIN으로 쓰는 답안이 감점 포인트가 될 수 있습니다."
  },
  {
    id: "concept-normalization",
    category: "데이터 모델링",
    title: "정규화와 반정규화의 경계",
    summary: "정규화는 이상 현상을 줄이고, 반정규화는 검증된 성능 병목을 줄이기 위한 제한적 선택입니다.",
    keyPoints: [
      "1NF는 반복 속성과 복합 속성 제거를 봅니다.",
      "2NF는 부분 함수 종속 제거, 3NF는 이행 함수 종속 제거가 핵심입니다.",
      "반정규화는 조회 성능만이 아니라 변경 정합성 비용을 함께 평가해야 합니다.",
      "중복 컬럼, 요약 테이블, 테이블 통합/분할은 모두 정합성 유지 전략이 있어야 합니다."
    ],
    examTrap: "느리다는 이유만으로 바로 반정규화를 선택하면 오답이 되기 쉽습니다. 먼저 조인 조건, 인덱스, 통계, SQL 작성 문제를 봅니다."
  },
  {
    id: "concept-select-order",
    category: "SQL 기본",
    title: "SELECT 논리 처리 순서",
    summary: "문법 작성 순서와 논리 처리 순서를 구분하면 별칭, WHERE/HAVING, 집계 문제를 안정적으로 풀 수 있습니다.",
    keyPoints: [
      "논리적으로 FROM/JOIN, WHERE, GROUP BY, HAVING, SELECT, ORDER BY 순서로 이해합니다.",
      "WHERE는 개별 행 필터, HAVING은 그룹 결과 필터입니다.",
      "SELECT 별칭은 같은 SELECT 블록의 WHERE/GROUP BY에서 일반적으로 사용할 수 없습니다.",
      "ORDER BY는 SELECT 별칭을 사용할 수 있는 대표적인 절입니다."
    ],
    examTrap: "집계 함수 조건을 WHERE에 쓰는 오류와, 외부 조인 후 WHERE 조건으로 행을 제거하는 오류가 자주 등장합니다."
  },
  {
    id: "concept-window",
    category: "SQL 활용",
    title: "윈도우 함수는 행을 줄이지 않는다",
    summary: "분석 함수는 GROUP BY와 달리 원본 행을 유지하며 그룹 내 순위, 누적, 이동 평균 등을 계산합니다.",
    keyPoints: [
      "PARTITION BY는 계산 그룹, ORDER BY는 그룹 내 순서를 정의합니다.",
      "RANK는 동률 후 순위를 건너뛰고, DENSE_RANK는 건너뛰지 않습니다.",
      "누적 합계는 ROWS/RANGE 프레임 차이에 주의해야 합니다.",
      "윈도우 함수 결과로 필터링하려면 인라인 뷰나 CTE를 사용합니다."
    ],
    examTrap: "WHERE 절에서 바로 분석 함수 결과를 조건으로 쓰는 문장은 대부분 오답입니다."
  },
  {
    id: "concept-index",
    category: "튜닝",
    title: "인덱스는 찾는 비용과 테이블 방문 비용의 합이다",
    summary: "인덱스를 탔다고 항상 빠른 것이 아닙니다. 인덱스 스캔 후 테이블을 몇 번 방문하는지가 핵심입니다.",
    keyPoints: [
      "복합 인덱스는 선두 컬럼, 등치 조건, 범위 조건, 정렬 요구를 함께 봅니다.",
      "컬럼에 함수를 적용하면 일반 인덱스의 Access Predicate가 되기 어렵습니다.",
      "선택도가 낮아도 조인 순서, 정렬 제거, 커버링 목적이면 의미가 있을 수 있습니다.",
      "클러스터링 팩터가 나쁘면 ROWID 테이블 액세스 비용이 커질 수 있습니다."
    ],
    examTrap: "조건절에 NVL, TO_CHAR, SUBSTR를 무심코 적용하면 인덱스를 못 쓰는 답안이 될 수 있습니다.",
    oracleAngle: "Oracle에서는 함수 기반 인덱스가 대안이 될 수 있지만, SQLP 답안에서는 기존 오브젝트 정보 기준으로 먼저 판단해야 합니다."
  },
  {
    id: "concept-join-tuning",
    category: "튜닝",
    title: "NL, Hash, Sort Merge 조인의 선택 기준",
    summary: "조인 방식은 데이터 크기, 선택도, 인덱스, 정렬 필요성, 메모리 사용량에 따라 달라집니다.",
    keyPoints: [
      "NL 조인은 선행 집합이 작고 후행 테이블 인덱스 탐색이 효율적일 때 좋습니다.",
      "Hash Join은 대량 동등 조인에서 작은 쪽을 build input으로 둘 때 유리합니다.",
      "Sort Merge Join은 정렬된 입력이나 비동등 조인에서 검토될 수 있습니다.",
      "LEADING, USE_NL, USE_HASH 힌트는 조인 순서와 방식을 분리해 이해해야 합니다."
    ],
    examTrap: "USE_NL만 쓰고 조인 순서를 고정하지 않거나, 후행 테이블에 적절한 인덱스가 없는 답안은 실기에서 취약합니다.",
    oracleAngle: "Oracle 힌트는 별칭 정확도가 중요합니다. 테이블 원명과 별칭을 혼동하면 힌트가 무시될 수 있습니다."
  },
  {
    id: "concept-plan",
    category: "실행계획",
    title: "Access Predicate와 Filter Predicate",
    summary: "실행계획은 어떤 조건이 탐색 범위를 줄이고, 어떤 조건이 읽은 뒤 버리는지 알려줍니다.",
    keyPoints: [
      "Access Predicate는 인덱스나 파티션 탐색 범위를 줄이는 조건입니다.",
      "Filter Predicate는 읽어 온 row source에서 추가로 걸러내는 조건입니다.",
      "Rows 추정치와 실제 rows 차이는 통계, 선택도, 데이터 분포 문제를 보여줍니다.",
      "실기에서는 실행계획뿐 아니라 Predicate Information까지 함께 읽어야 합니다."
    ],
    examTrap: "실행계획에 INDEX가 보인다는 이유만으로 좋은 계획이라고 단정하지 마세요. 테이블 액세스 횟수와 filter 비율을 봐야 합니다."
  },
  {
    id: "concept-bind",
    category: "SQL 처리 구조",
    title: "파싱, 바인드 변수, 공유 SQL",
    summary: "하드 파싱을 줄이고 실행계획 재사용성을 높이는 것은 OLTP 성능의 기본입니다.",
    keyPoints: [
      "SQL 텍스트가 다르면 공유 SQL로 재사용되기 어렵습니다.",
      "바인드 변수는 하드 파싱과 shared pool 부하를 줄이는 데 도움을 줍니다.",
      "데이터 분포가 심하게 치우친 컬럼은 바인드 변수와 히스토그램/Adaptive Cursor Sharing을 함께 이해해야 합니다.",
      "리터럴 남발은 CPU와 래치/뮤텍스 경합을 만들 수 있습니다."
    ],
    examTrap: "바인드 변수는 만능이 아닙니다. skew가 큰 조건에서는 실행계획 안정성과 선택도 추정 문제를 함께 봅니다."
  }
];

const labBlueprints = [
  {
    title: "최근 주문 조회의 인덱스 범위 스캔",
    topic: "인덱스 스캔",
    scenario: "주문 목록 화면에서 최근 7일간 결제 완료 주문을 고객명과 함께 최신순으로 보여준다. 기존 SQL은 주문일자에 TO_CHAR를 적용해 인덱스를 사용하지 못한다.",
    prompt: "orders.order_date 컬럼을 가공하지 않고 최근 7일 조건과 status 조건을 사용해 SQL을 작성하라. Oracle 답안 관점에서는 orders(order_date, status) 또는 orders(status, order_date) 인덱스 사용 의도를 힌트로 표현해도 좋다.",
    expectedSql:
      "select /*+ leading(o c) use_nl(c) index(o orders_ix_status_date) */ o.order_id, c.customer_name, o.order_date, o.amount from orders o join customers c on c.customer_id = o.customer_id where o.status = 'PAID' and o.order_date >= current_date - interval '7 day' order by o.order_date desc",
    targetPlan: ["Index Range Scan on orders", "Nested Loop to customers", "Order by minimized by index order"],
    oracleNotes: ["TO_CHAR(order_date)를 조건절에 쓰면 일반 인덱스 Access Predicate가 되기 어렵다.", "Oracle 힌트는 별칭 o, c 기준으로 작성해야 한다."],
    hints: ["날짜 컬럼 왼쪽을 가공하지 마세요.", "선행 집합은 최근 주문이어야 합니다.", "고객은 PK로 반복 탐색하는 NL 조인이 자연스럽습니다."]
  },
  {
    title: "고객별 마지막 주문 찾기",
    topic: "윈도우 함수",
    scenario: "각 고객의 마지막 주문 1건만 조회해야 한다. 같은 고객이 주문을 여러 번 했고, 주문일자가 같으면 주문번호가 큰 건을 우선한다.",
    prompt: "ROW_NUMBER 분석 함수를 사용해 고객별 최신 주문 1건을 반환하라.",
    expectedSql:
      "with ranked as (select o.*, row_number() over (partition by o.customer_id order by o.order_date desc, o.order_id desc) as rn from orders o) select * from ranked where rn = 1",
    targetPlan: ["WindowAgg / analytic ranking", "Filter rn = 1", "Possible index on (customer_id, order_date desc, order_id desc)"],
    oracleNotes: ["Oracle에서는 ROW_NUMBER() OVER(PARTITION BY ... ORDER BY ...) 패턴이 대표적이다.", "동률 기준을 명확히 하지 않으면 결과가 불안정하다."],
    hints: ["GROUP BY MAX(order_date)만으로는 같은 날짜 중복을 처리하기 어렵습니다.", "동률 처리 기준을 ORDER BY에 포함하세요."]
  },
  {
    title: "미구매 고객 탐색",
    topic: "세미/안티 조인",
    scenario: "마케팅 대상자를 추출하기 위해 최근 30일간 주문이 없는 활성 고객을 찾아야 한다.",
    prompt: "NOT EXISTS를 사용해 활성 고객 중 최근 주문이 없는 고객을 조회하라.",
    expectedSql:
      "select c.customer_id, c.customer_name from customers c where c.status = 'ACTIVE' and not exists (select 1 from orders o where o.customer_id = c.customer_id and o.order_date >= current_date - interval '30 day')",
    targetPlan: ["Anti Join / NOT EXISTS", "Index on orders(customer_id, order_date)", "Filter active customers"],
    oracleNotes: ["NOT IN은 NULL이 섞일 때 의미가 달라질 수 있어 실기에서는 NOT EXISTS가 더 안전한 경우가 많다."],
    hints: ["NULL 함정을 피하세요.", "주문 테이블은 고객ID와 주문일자 복합 인덱스가 좋습니다."]
  },
  {
    title: "스칼라 서브쿼리 반복 제거",
    topic: "스칼라 서브쿼리",
    scenario: "상품 목록마다 최근 30일 판매수량을 스칼라 서브쿼리로 계산해 응답이 느리다.",
    prompt: "판매 데이터를 먼저 상품별로 집계한 뒤 상품 테이블과 조인하는 형태로 재작성하라.",
    expectedSql:
      "with sales_30d as (select product_id, sum(quantity) as qty from order_items oi join orders o on o.order_id = oi.order_id where o.order_date >= current_date - interval '30 day' group by product_id) select p.product_id, p.product_name, coalesce(s.qty, 0) as qty from products p left join sales_30d s on s.product_id = p.product_id",
    targetPlan: ["Aggregate order_items once", "Hash/NL join to products", "Avoid per-row scalar subquery"],
    oracleNotes: ["Oracle에서 스칼라 서브쿼리 캐싱이 있어도 중복도가 낮으면 반복 비용이 커질 수 있다."],
    hints: ["상품마다 한 번씩 계산하지 말고, 판매량을 한 번에 집계하세요.", "없는 판매량은 0으로 표현해야 합니다."]
  },
  {
    title: "선택 관계 보존 조인",
    topic: "외부 조인",
    scenario: "고객 목록에 선택적으로 존재하는 멤버십 등급을 함께 보여줘야 한다. 멤버십이 없는 고객도 결과에 남아야 한다.",
    prompt: "LEFT JOIN을 사용하고 멤버십 상태 조건이 고객 행을 제거하지 않도록 작성하라.",
    expectedSql:
      "select c.customer_id, c.customer_name, m.grade from customers c left join memberships m on m.customer_id = c.customer_id and m.status = 'VALID' where c.status = 'ACTIVE'",
    targetPlan: ["Filter active customers", "Outer join memberships", "Preserve customers without membership"],
    oracleNotes: ["외부 조인 대상 조건을 WHERE에 두면 NULL 확장 행이 제거되어 내부 조인처럼 될 수 있다."],
    hints: ["보존해야 할 테이블은 customers입니다.", "멤버십 조건은 ON 절에 두는 편이 자연스럽습니다."]
  },
  {
    title: "복합 인덱스 선두 컬럼 활용",
    topic: "복합 인덱스",
    scenario: "orders(status, order_date, customer_id) 인덱스가 있다. 결제완료 주문 중 특정 기간의 고객별 주문을 조회해야 한다.",
    prompt: "status 등치 조건과 order_date 범위 조건을 함께 사용해 복합 인덱스 선두 컬럼을 활용하는 SQL을 작성하라.",
    expectedSql:
      "select /*+ index(o orders_ix_status_date_customer) */ o.customer_id, count(*) from orders o where o.status = 'PAID' and o.order_date >= date '2026-01-01' and o.order_date < date '2026-02-01' group by o.customer_id",
    targetPlan: ["Index Range Scan using status/order_date", "Group aggregate", "No function on indexed columns"],
    oracleNotes: ["Oracle DATE 리터럴 또는 바인드 변수를 사용하면 암시적 형변환 위험을 줄일 수 있다."],
    hints: ["선두 컬럼 status를 등치로 사용하세요.", "월 조건은 컬럼 가공 대신 반열린 구간으로 작성하세요."]
  },
  {
    title: "대량 조인의 Hash Join 유도",
    topic: "해시 조인",
    scenario: "월간 매출 집계에서 주문과 주문상세를 대량으로 조인한다. 후행 인덱스 반복 탐색보다 해시 조인이 유리하다.",
    prompt: "대량 기간 조건을 사용하고 Hash Join 의도를 힌트로 표현하라.",
    expectedSql:
      "select /*+ leading(o oi) use_hash(oi) */ o.store_id, sum(oi.quantity * oi.unit_price) as sales from orders o join order_items oi on oi.order_id = o.order_id where o.order_date >= date '2026-01-01' and o.order_date < date '2026-02-01' group by o.store_id",
    targetPlan: ["Hash Join", "Partition/date range pruning candidate", "Hash aggregate"],
    oracleNotes: ["USE_HASH는 조인 대상 별칭을 정확히 써야 한다.", "대량 동등 조인은 Hash Join이 NL보다 유리할 수 있다."],
    hints: ["선행 집합이 크면 NL 반복 비용을 의심하세요.", "월 조건은 반열린 구간으로 작성하세요."]
  },
  {
    title: "페이징 쿼리의 안정적 정렬",
    topic: "Top N",
    scenario: "게시글 목록을 최신순으로 페이징한다. created_at만 정렬하면 같은 시간 게시글의 순서가 흔들린다.",
    prompt: "created_at DESC, post_id DESC 정렬을 사용해 안정적인 Top N/페이징 SQL을 작성하라.",
    expectedSql:
      "select post_id, title, created_at from posts where board_id = $1 order by created_at desc, post_id desc limit 20 offset 0",
    targetPlan: ["Index Scan on posts(board_id, created_at desc, post_id desc)", "Limit", "Stable ordering"],
    oracleNotes: ["Oracle 12c 이상은 FETCH FIRST를 사용할 수 있고, 이전 방식은 인라인 뷰 + ROWNUM을 사용한다."],
    hints: ["정렬 기준이 유일하지 않으면 페이지 중복/누락이 생길 수 있습니다.", "인덱스는 필터 컬럼 + 정렬 컬럼 순서를 검토하세요."]
  },
  {
    title: "파티션 프루닝 가능한 조건",
    topic: "파티셔닝",
    scenario: "sales 테이블은 sale_date 기준 월 파티션이다. 기존 SQL은 TO_CHAR(sale_date, 'YYYYMM') 조건을 사용해 pruning이 불안정하다.",
    prompt: "sale_date 컬럼을 가공하지 않고 2026년 1월 데이터만 조회하라.",
    expectedSql:
      "select store_id, sum(amount) from sales where sale_date >= date '2026-01-01' and sale_date < date '2026-02-01' group by store_id",
    targetPlan: ["Partition pruning January partition", "Range scan", "Aggregate by store"],
    oracleNotes: ["파티션 키에 함수를 적용하면 정적 pruning이 어려워질 수 있다."],
    hints: ["컬럼을 가공하지 마세요.", "월 조건은 시작 이상, 다음 달 시작 미만으로 표현하세요."]
  },
  {
    title: "OR 조건 분해",
    topic: "쿼리 변환",
    scenario: "고객 검색에서 phone = :phone OR email = :email 조건 때문에 인덱스 선택이 불안정하다. 두 컬럼 각각 인덱스가 있다.",
    prompt: "UNION ALL을 사용해 두 검색 경로를 분리하되 중복 가능성을 제어하라.",
    expectedSql:
      "select customer_id, customer_name from customers where phone = $1 union all select customer_id, customer_name from customers where email = $2 and phone <> $1",
    targetPlan: ["Index Scan on phone", "Index Scan on email", "Concatenate results"],
    oracleNotes: ["Oracle에서는 OR expansion이 자동으로 일어날 수 있지만, 실기에서는 의도를 명확히 재작성하는 문제가 나올 수 있다."],
    hints: ["각 조건이 자기 인덱스를 타게 분리해 보세요.", "중복 제거가 필요한지 업무적으로 확인하세요."]
  },
  {
    title: "LIKE 검색의 선두 와일드카드",
    topic: "인덱스 스캔",
    scenario: "상품명 검색이 '%키워드%'로 작성되어 일반 B-tree 인덱스를 사용하기 어렵다. 접두 검색으로 요구사항을 조정할 수 있다.",
    prompt: "접두 검색 조건으로 product_name 인덱스를 활용하는 SQL을 작성하라.",
    expectedSql:
      "select /*+ index(p products_ix_name) */ product_id, product_name from products p where p.product_name like $1 || '%'",
    targetPlan: ["Index Range Scan on product_name", "Avoid leading wildcard"],
    oracleNotes: ["'%값' 형태는 일반 B-tree 인덱스 range scan에 불리하다. Oracle Text 등 별도 인덱스가 대안일 수 있다."],
    hints: ["와일드카드 위치를 보세요.", "요구사항이 부분 검색인지 접두 검색인지 분리하세요."]
  },
  {
    title: "암시적 형변환 제거",
    topic: "조건절 튜닝",
    scenario: "orders.order_id는 숫자 컬럼인데 문자열 리터럴로 비교하고 있다. 실행계획에서 함수 변환이 보인다.",
    prompt: "컬럼 타입에 맞는 바인드 또는 리터럴을 사용해 조건을 작성하라.",
    expectedSql:
      "select order_id, amount from orders where order_id = $1",
    targetPlan: ["Index Unique Scan on orders_pk", "No implicit conversion"],
    oracleNotes: ["Oracle에서 컬럼 쪽에 TO_CHAR/TO_NUMBER가 적용되면 인덱스 사용성이 떨어질 수 있다."],
    hints: ["컬럼 타입과 비교 값 타입을 맞추세요.", "함수가 컬럼 쪽에 생기지 않게 해야 합니다."]
  },
  {
    title: "배치 UPDATE 대상 선별",
    topic: "DML 튜닝",
    scenario: "만료 쿠폰 상태를 일괄 변경한다. 전체 쿠폰 테이블을 스캔하지 않도록 만료일과 상태 조건으로 대상을 좁혀야 한다.",
    prompt: "읽기 전용 실습이므로 UPDATE 대신 변경 대상 SELECT를 작성하라. status와 expire_at 조건을 함께 사용하라.",
    expectedSql:
      "select coupon_id from coupons where status = 'ACTIVE' and expire_at < current_date",
    targetPlan: ["Index Range Scan on coupons(status, expire_at)", "Small target set before DML"],
    oracleNotes: ["실제 DML 튜닝에서는 변경 대상 선별 SQL의 액세스 경로와 트랜잭션 크기가 중요하다."],
    hints: ["DML 자체보다 대상 집합을 얼마나 좁히는지가 먼저입니다.", "복합 인덱스 순서를 생각하세요."]
  },
  {
    title: "집계 후 조인",
    topic: "조인 순서",
    scenario: "주문상세 수천만 건을 상품과 먼저 조인한 뒤 집계해서 느리다. 기간 내 상품별 수량을 먼저 집계하면 데이터가 줄어든다.",
    prompt: "order_items를 기간 조건과 함께 먼저 상품별 집계한 뒤 products와 조인하라.",
    expectedSql:
      "with item_sum as (select oi.product_id, sum(oi.quantity) qty from order_items oi join orders o on o.order_id = oi.order_id where o.order_date >= current_date - interval '30 day' group by oi.product_id) select p.product_name, s.qty from item_sum s join products p on p.product_id = s.product_id order by s.qty desc",
    targetPlan: ["Filter orders by date", "Aggregate by product_id", "Join reduced result to products"],
    oracleNotes: ["대량 조인에서는 조인 전 집계로 row source를 줄이는 전략이 유효할 수 있다."],
    hints: ["먼저 줄일 수 있는 집합이 무엇인지 보세요.", "상품명은 마지막에 붙여도 됩니다."]
  },
  {
    title: "중복 제거 비용 줄이기",
    topic: "집합 연산",
    scenario: "두 이벤트 로그를 합치는데 서로 중복될 수 없는 원천이다. UNION을 사용해 불필요한 중복 제거 비용이 발생한다.",
    prompt: "결과 의미가 허용된다면 UNION ALL을 사용해 두 로그를 결합하라.",
    expectedSql:
      "select user_id, event_at, event_type from app_events where event_at >= current_date - interval '1 day' union all select user_id, event_at, event_type from web_events where event_at >= current_date - interval '1 day'",
    targetPlan: ["Append / Concatenate", "No sort unique", "Independent date range scans"],
    oracleNotes: ["UNION은 SORT UNIQUE 또는 HASH UNIQUE 비용이 들 수 있다. 중복 불가능성이 보장되면 UNION ALL이 유리하다."],
    hints: ["중복 제거가 정말 필요한지 확인하세요.", "UNION과 UNION ALL의 실행계획 차이를 떠올리세요."]
  },
  {
    title: "EXISTS로 조기 종료 유도",
    topic: "세미 조인",
    scenario: "리뷰가 하나 이상 있는 상품만 찾는다. 리뷰 건수 전체는 필요 없다.",
    prompt: "COUNT(*) > 0 대신 EXISTS로 존재 여부만 확인하라.",
    expectedSql:
      "select p.product_id, p.product_name from products p where exists (select 1 from reviews r where r.product_id = p.product_id)",
    targetPlan: ["Semi Join", "Stop after first matching review", "Index on reviews(product_id)"],
    oracleNotes: ["EXISTS는 존재성 확인 의도를 명확히 하며 세미 조인 변환 대상이 될 수 있다."],
    hints: ["개수를 구해야 하나요, 존재만 확인하면 되나요?", "리뷰 테이블 product_id 인덱스를 생각하세요."]
  },
  {
    title: "ORDER BY 제거 가능한 인덱스",
    topic: "정렬 튜닝",
    scenario: "계좌 거래내역 화면은 account_id 조건과 trade_at DESC 정렬을 항상 사용한다.",
    prompt: "account_id로 필터링하고 trade_at DESC, tx_id DESC로 정렬하는 SQL을 작성하라. 적절한 인덱스 방향도 설명에 반영된다.",
    expectedSql:
      "select tx_id, trade_at, amount from account_transactions where account_id = $1 order by trade_at desc, tx_id desc limit 50",
    targetPlan: ["Index Scan on (account_id, trade_at desc, tx_id desc)", "Limit", "No extra sort"],
    oracleNotes: ["Oracle에서는 인덱스 컬럼 순서와 DESC 지정으로 SORT ORDER BY 제거를 기대할 수 있다."],
    hints: ["필터 컬럼 뒤에 정렬 컬럼을 배치하면 정렬 비용을 줄일 수 있습니다.", "동률 정렬 기준을 포함하세요."]
  },
  {
    title: "불필요한 SELECT * 제거",
    topic: "I/O 최소화",
    scenario: "목록 화면에서 필요한 컬럼은 4개뿐인데 SELECT *를 사용해 넓은 테이블을 반복 조회한다.",
    prompt: "필요한 컬럼만 조회하고, 조건 컬럼과 출력 컬럼 일부를 포함한 인덱스 활용 가능성을 높여라.",
    expectedSql:
      "select order_id, order_date, status, amount from orders where customer_id = $1 and order_date >= current_date - interval '90 day' order by order_date desc",
    targetPlan: ["Index Scan candidate on customer/date", "Reduced row width", "Less table/block IO"],
    oracleNotes: ["Oracle B-tree 인덱스만으로 모든 컬럼을 만족하는 경우 테이블 액세스를 줄일 수 있다. 다만 인덱스 폭 증가 비용도 고려한다."],
    hints: ["목록 화면에 정말 필요한 컬럼만 남겨보세요.", "인덱스가 커버할 수 있는지 생각하세요."]
  },
  {
    title: "데이터 skew와 바인드 변수",
    topic: "옵티마이저",
    scenario: "status = 'ACTIVE'는 전체의 95%, 'SUSPENDED'는 1%다. 같은 SQL이 상태 값에 따라 전혀 다른 선택도를 가진다.",
    prompt: "상태 조건과 생성일 조건을 사용한 조회 SQL을 작성하고, 해설에서 히스토그램/Adaptive Cursor Sharing 관점을 확인하라.",
    expectedSql:
      "select user_id, created_at from users where status = $1 and created_at >= current_date - interval '7 day'",
    targetPlan: ["Plan may vary by bind selectivity", "Index or full scan depending on value", "Stats/histogram important"],
    oracleNotes: ["Oracle에서는 바인드 변수 사용 시 skew 컬럼에서 선택도 추정 문제가 생길 수 있고, 히스토그램과 Adaptive Cursor Sharing을 함께 검토한다."],
    hints: ["바인드 변수는 좋지만 skew가 큰 컬럼은 실행계획 안정성을 봐야 합니다.", "상태 값별 비율이 핵심입니다."]
  },
  {
    title: "조인 조건 누락 탐지",
    topic: "실행계획 판독",
    scenario: "상품과 카테고리를 조회하는 SQL에서 조인 조건 하나가 빠져 결과 건수가 폭증했다.",
    prompt: "products와 categories를 명시적 JOIN으로 연결하고 조인 조건을 정확히 작성하라.",
    expectedSql:
      "select p.product_id, p.product_name, c.category_name from products p join categories c on c.category_id = p.category_id where p.status = 'SALE'",
    targetPlan: ["Join with equality predicate", "No Cartesian product", "Filter sale products"],
    oracleNotes: ["실행계획에 MERGE JOIN CARTESIAN 또는 비정상 Rows 폭증이 보이면 조인 조건 누락을 의심한다."],
    hints: ["결과 건수가 곱으로 증가하는지 보세요.", "명시적 JOIN과 ON 조건으로 의도를 드러내세요."]
  },
  {
    title: "인라인 뷰로 Top N 후 조인",
    topic: "Top N 조인",
    scenario: "최근 주문 100건만 고객 정보와 조인하면 되는데 전체 주문과 고객을 조인한 뒤 정렬한다.",
    prompt: "주문에서 먼저 최근 100건을 제한한 뒤 고객과 조인하라.",
    expectedSql:
      "with recent_orders as (select order_id, customer_id, order_date, amount from orders order by order_date desc limit 100) select r.order_id, c.customer_name, r.order_date, r.amount from recent_orders r join customers c on c.customer_id = r.customer_id",
    targetPlan: ["Top N on orders first", "Nested Loop to customers", "Avoid sorting joined large result"],
    oracleNotes: ["Oracle 전통 문법에서는 ORDER BY 인라인 뷰 바깥에서 ROWNUM <= 100을 적용한다."],
    hints: ["전체를 조인한 뒤 정렬하지 말고, 먼저 줄일 수 있는지 보세요.", "Top N의 적용 시점이 핵심입니다."]
  }
];

const sharedSchemaSql = `create table customers (
  customer_id bigint primary key,
  customer_name text not null,
  status text not null
);

create table orders (
  order_id bigint primary key,
  customer_id bigint not null references customers(customer_id),
  status text not null,
  order_date date not null,
  amount numeric(12,2) not null
);

create table order_items (
  order_id bigint not null references orders(order_id),
  product_id bigint not null,
  quantity integer not null,
  unit_price numeric(12,2) not null
);

create index orders_ix_status_date_customer on orders(status, order_date, customer_id);
create index orders_ix_customer_date on orders(customer_id, order_date);
create index order_items_ix_order on order_items(order_id);
create index order_items_ix_product on order_items(product_id);`;

const sharedSeedSql = `insert into customers values
  (1, 'Kim Data', 'ACTIVE'),
  (2, 'Lee Plan', 'ACTIVE'),
  (3, 'Park Tune', 'SLEEP');

insert into orders values
  (101, 1, 'PAID', current_date - interval '1 day', 120000),
  (102, 1, 'READY', current_date - interval '20 day', 80000),
  (103, 2, 'PAID', current_date - interval '3 day', 220000);

insert into order_items values
  (101, 1001, 2, 30000),
  (101, 1002, 1, 60000),
  (103, 1001, 4, 55000);`;

export const labQuestions: LabQuestion[] = labBlueprints.map((lab, index) => ({
  id: `lab-${String(index + 1).padStart(2, "0")}`,
  number: index + 1,
  difficulty: index % 3 === 0 ? "실전" : index % 3 === 1 ? "중간" : "기본",
  schemaSql: sharedSchemaSql,
  seedSql: sharedSeedSql,
  rubric: [
    "요구사항을 만족하는 결과 컬럼과 조건을 작성했는가",
    "컬럼 가공, 암시적 형변환, 불필요한 중복 제거 등 성능 저하 표현을 피했는가",
    "조인 순서/방식/인덱스 사용 의도를 설명하거나 힌트로 표현했는가",
    "Oracle SQLP 실기 기준으로 별칭, 힌트 대상, 선택 관계를 정확히 반영했는가"
  ],
  ...lab
}));

export function createLocalExtraQuestion(subjectId: SubjectId, count: number): ObjectiveQuestion {
  const subject = [modeling, sqlBasic, tuning].find((item) => item.id === subjectId) ?? tuning;
  const blueprint = subject.blueprints[(count + 3) % subject.blueprints.length];
  const { choices, answer } = rotateChoices(blueprint.correct, blueprint.distractors, count + 11);
  const number = 101 + count;

  return {
    id: `${subjectId}-extra-${Date.now()}-${count}`,
    number,
    subjectId,
    subjectName: subject.name,
    topic: blueprint.topic,
    difficulty: "실전",
    stem: `[추가문제 ${number}] ${blueprint.stems[count % blueprint.stems.length].replace("{topic}", blueprint.topic)}`,
    choices,
    answer,
    hint: blueprint.hint,
    explanation: `${blueprint.explanation} 추가 문제는 기존 기출 원문이 아니라 SQLP 출제 범위와 함정 패턴을 바탕으로 생성된 오리지널 문항입니다.`,
    whyWrong: makeWhyWrong(choices, answer, blueprint.explanation)
  };
}
