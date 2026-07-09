import type { ConceptArticle, ConceptStudyBlock } from "@/lib/types";

type ConceptSeed = Omit<ConceptArticle, "category" | "title">;

function concept(seed: ConceptSeed): ConceptArticle {
  const defaultBlocks = buildDefaultStudyBlocks(seed);
  const studyBlocks = seed.studyBlocks?.length ? completeStudyBlocks(seed.studyBlocks, defaultBlocks) : defaultBlocks;
  return {
    ...seed,
    studyBlocks,
    category: `${seed.subjectName} > ${seed.majorTopic}`,
    title: seed.detailTopic
  };
}

function completeStudyBlocks(blocks: ConceptStudyBlock[], defaults: ConceptStudyBlock[]) {
  const completed = [...blocks];
  const hasType = (type: ConceptStudyBlock["type"]) => completed.some((block) => block.type === type);

  for (const block of defaults) {
    if (completed.length >= 3 && hasType("table") && hasType("checklist")) break;
    if (!hasType(block.type)) {
      completed.push(block);
    }
  }

  for (const block of defaults) {
    if (completed.length >= 4) break;
    completed.push(block);
  }

  return completed;
}

function buildDefaultStudyBlocks(seed: ConceptSeed): ConceptStudyBlock[] {
  const subjectGuide =
    seed.subjectId === "modeling"
      ? {
          lens: "업무 규칙을 엔터티, 속성, 관계, 식별자, 정규화 수준으로 나누어 읽는다.",
          firstQuestion: "이 데이터가 업무에서 독립적으로 관리되는 대상인지, 아니면 다른 데이터의 속성/행위인지 먼저 판단한다.",
          secondQuestion: "식별자와 관계 선택성이 SQL 결과 건수, 조인 방식, NULL 허용 여부에 어떤 영향을 주는지 연결한다.",
          flow: [
            "지문에서 업무 명사와 발생 사건을 표시한다.",
            "엔터티 후보가 식별 가능하고 여러 인스턴스를 가질 수 있는지 확인한다.",
            "속성이 원자값인지, 반복/다중값인지, 기본/설계/파생 속성인지 분류한다.",
            "관계의 필수/선택, 1:1/1:M/M:M, 식별/비식별 여부를 판단한다.",
            "정규화, NULL, 본질식별자와 인조식별자가 SQL 조인과 성능에 미치는 영향을 정리한다."
          ]
        }
      : seed.subjectId === "sql-basic"
        ? {
            lens: "SQL 문장을 작성 순서가 아니라 논리 처리 순서와 결과 집합 변화로 읽는다.",
            firstQuestion: "FROM/JOIN에서 기준 집합이 어떻게 만들어지고 WHERE에서 어떤 행이 제거되는지 먼저 본다.",
            secondQuestion: "GROUP BY, HAVING, SELECT, ORDER BY, Top-N 단계에서 NULL, 중복, 정렬 요구사항이 어떻게 달라지는지 확인한다.",
            flow: [
              "FROM과 JOIN 조건으로 최초 행 집합과 기준 테이블을 정한다.",
              "WHERE에서 NULL, BETWEEN, IN, LIKE, AND/OR 우선순위가 행 제거에 미치는 영향을 계산한다.",
              "GROUP BY와 HAVING이 행 단위 조건인지 그룹 단위 조건인지 나눈다.",
              "SELECT 절 함수, CASE, 집계, DISTINCT가 최종 값과 중복 제거 범위를 어떻게 바꾸는지 본다.",
              "ORDER BY, 윈도우 함수, Top-N, 집합연산자가 정렬과 결과 건수에 미치는 영향을 마지막에 확인한다."
            ]
          }
        : {
            lens: "실행계획 이름만 외우지 말고 결과 보존, 접근 경로, 반복 횟수, I/O 비용, 힌트 의도를 순서대로 읽는다.",
            firstQuestion: "SQL을 바꾸더라도 요구 결과가 변하지 않는지 먼저 확인한다.",
            secondQuestion: "그 다음 Access Predicate와 Filter Predicate, 조인 순서, 조인 방식, 정렬/TEMP, Call 횟수를 근거로 튜닝 방향을 정한다.",
            flow: [
              "요구 결과와 보존해야 할 행을 먼저 적는다.",
              "선행 집합을 줄일 수 있는 조건과 인덱스 선두 컬럼을 찾는다.",
              "인덱스 스캔 후 테이블 랜덤 액세스가 얼마나 반복되는지 본다.",
              "NL, 소트 머지, 해시 조인의 입력 크기와 메모리/TEMP 비용을 비교한다.",
              "힌트, 인덱스 설계, 쿼리 변환 제어가 목표 실행계획과 결과 정확성을 동시에 만족하는지 검증한다."
            ]
          };

  const noteParagraphs = [
    seed.summary,
    ...seed.keyPoints.map((point) => `- ${point}`),
    `- 기출 함정: ${seed.examTrap}`,
    seed.oracleAngle ? `- Oracle/실무 연결: ${seed.oracleAngle}` : ""
  ].filter(Boolean);

  return [
    {
      type: "section",
      title: `${seed.detailTopic} 요약`,
      paragraphs: noteParagraphs
    },
    {
      type: "table",
      title: `${seed.detailTopic} 암기표`,
      headers: ["구분", "정리"],
      rows: [
        ["정의", seed.summary],
        ["판단 기준", subjectGuide.firstQuestion],
        ["문제 연결", subjectGuide.secondQuestion],
        ["주의", seed.examTrap],
        ["Oracle/실무", seed.oracleAngle ?? "SQLP는 Oracle 기준의 결과 해석과 튜닝 관점을 함께 묻는다."]
      ]
    },
    {
      type: "checklist",
      title: `${seed.detailTopic} 기출 체크`,
      items: [
        `${seed.detailTopic}의 정의, 반대 개념, 예외 조건을 한 번에 말할 수 있어야 한다.`,
        "문제에서 '옳은 것', '부적절한 것', '결과가 같은 것', '성능상 유리한 것' 중 무엇을 묻는지 먼저 표시한다.",
        ...subjectGuide.flow,
        seed.examTrap
      ]
    }
  ];
}

const modelingSubject = "1과목 데이터 모델링의 이해";
const sqlSubject = "2과목 SQL 기본 및 활용";
const tuningSubject = "3과목 SQL 고급활용 및 튜닝";

const conceptSeeds: ConceptSeed[] = [
  {
    id: "modeling-data-model",
    subjectId: "modeling",
    subjectName: modelingSubject,
    majorTopic: "데이터 모델링의 이해",
    detailTopic: "데이터모델의 이해",
    summary:
      "데이터 모델링은 현실 업무를 데이터 관점에서 추상화, 단순화, 명확화하여 엔터티, 속성, 관계로 표현하는 과정이다. SQLP에서는 정의를 외우는 것보다 모델링 단계와 데이터 독립성, 모델링 유의점을 구분하는 문제가 자주 나온다.",
    studyBlocks: [
      {
        type: "section",
        title: "전체 그림",
        paragraphs: [
          "이 세부항목은 SQLP 1과목의 출발점이다. 단순히 모델링의 정의를 묻는 데서 끝나지 않고, 모델링의 특징, 관점, 중요성, 유의점, 데이터 모델링 단계, 데이터 독립성, 스키마 구조, 좋은 데이터 모델의 조건까지 한 묶음으로 반복 출제된다.",
          "기출에서는 '모델링 유의점이 아닌 것', '개념/논리/물리 모델링 설명으로 맞는 것', '외부/개념/내부 스키마와 독립성 연결', '좋은 데이터 모델 요소'처럼 용어를 바꾸어 묻는 경우가 많다."
        ]
      },
      {
        type: "table",
        title: "모델링의 3대 특징",
        headers: ["특징", "의미", "시험에서 보는 포인트"],
        rows: [
          ["추상화", "현실 세계의 복잡한 현상 중 필요한 부분을 일정한 형식으로 뽑아 표현한다.", "모형화, 가설적 표현, 현실세계의 반영이라는 표현과 연결된다."],
          ["단순화", "복잡한 업무를 약속된 표기법과 규칙으로 이해하기 쉽게 표현한다.", "ERD, 표기법, 제한된 언어로 표현한다는 설명이 나오면 단순화다."],
          ["명확화", "애매한 업무 개념을 누구나 같은 의미로 이해하도록 정확하게 기술한다.", "의사소통, 업무규칙 공유, 애매모호함 제거와 연결된다."]
        ]
      },
      {
        type: "table",
        title: "모델링의 세 가지 관점",
        headers: ["관점", "핵심 질문", "예시", "주의할 점"],
        rows: [
          ["데이터 관점", "업무가 어떤 데이터를 필요로 하고 데이터끼리 어떤 관계를 가지는가?", "고객, 주문, 상품, 계약, 수강 같은 데이터와 관계를 찾는다.", "SQLP 데이터 모델링 단원은 주로 이 관점에서 출제된다."],
          ["프로세스 관점", "업무가 실제로 무엇을 수행하고 어떤 절차로 처리되는가?", "주문 접수, 결제 승인, 배송 처리, 계약 변경 같은 업무 행위를 본다.", "데이터 모델링 문제에서 프로세스 관점 설명을 데이터 관점과 섞어 내는 함정이 있다."],
          ["상관 관점", "프로세스가 수행될 때 데이터가 어떻게 생성, 변경, 삭제, 조회되는가?", "주문 접수 시 주문이 생성되고 재고가 감소하며 결제가 생성되는 흐름을 본다.", "CRUD 매트릭스, 트랜잭션, 데이터 생명주기와 연결된다."]
        ]
      },
      {
        type: "table",
        title: "데이터 모델링이 중요한 이유와 유의점",
        headers: ["구분", "내용", "기출 판단법"],
        rows: [
          ["파급효과", "데이터 구조 변경은 표준, 응용 프로그램, 인터페이스, 테스트, 이행까지 큰 영향을 준다.", "시스템 구축 후반 데이터 모델 변경은 위험이 크다는 설명과 연결된다."],
          ["간결한 표현", "복잡한 정보 요구사항을 데이터 모델이라는 설계도 형태로 명확하게 보여준다.", "데이터 모델은 요구사항 이해와 의사소통 도구다."],
          ["데이터 품질", "잘못된 데이터 구조는 오래 누적될수록 치유하기 어려운 품질 문제를 만든다.", "중복, 불일치, 업무규칙 누락은 데이터 품질 저하 원인이다."],
          ["중복", "같은 사실을 여러 곳에 저장해 저장공간 낭비와 정합성 문제를 만든다.", "모델링 유의점에 포함된다."],
          ["비유연성", "업무 변화가 작아도 모델과 프로그램을 크게 바꿔야 하는 구조다.", "데이터 정의를 프로세스와 분리해야 한다는 설명과 함께 나온다."],
          ["비일관성", "중복이 없더라도 데이터 간 연관 관계가 명확하지 않으면 모순된 상태가 생긴다.", "상호 연관 관계를 명확하게 정의해야 예방할 수 있다."],
          ["반정규화", "성능을 위해 중복을 허용하는 설계 조정이다.", "모델링 유의점 자체가 아니다. '유의점으로 적절하지 않은 것' 단골 함정이다."]
        ]
      },
      {
        type: "flow",
        title: "현실세계에서 데이터베이스까지 가는 흐름",
        steps: [
          "현실세계의 업무를 관찰하고 데이터 요구사항을 수집한다.",
          "개념적 데이터 모델링에서 핵심 엔터티와 주요 관계를 업무 중심으로 잡는다.",
          "논리적 데이터 모델링에서 식별자, 속성, 관계, 정규화, M:M 해소, 참조 무결성, 이력 전략을 구체화한다.",
          "물리적 데이터 모델링에서 테이블, 컬럼, 인덱스, 파티션, 저장 구조, 성능 요소를 DBMS에 맞게 설계한다.",
          "구현 후 SQL 작성과 튜닝 단계에서 모델의 관계, 선택성, 식별자, 정규화 수준이 실행계획과 성능에 영향을 준다."
        ]
      },
      {
        type: "table",
        title: "데이터 모델링의 3단계",
        headers: ["단계", "수준", "주요 산출/활동", "자주 나오는 표현"],
        rows: [
          ["개념적 모델링", "가장 추상적, 업무 중심, 포괄적", "핵심 엔터티와 관계 발견, ERD 초안, 전사적 데이터 관점 정리", "EA, 전사 모델, 상위 수준, 사용자 요구사항 발견"],
          ["논리적 모델링", "업무 규칙을 가장 상세히 표현", "식별자 확정, 속성 정의, 정규화, M:M 관계 해소, 참조 무결성, 이력 관리", "재사용성 높음, 정규화, 데이터 모델링의 핵심 단계"],
          ["물리적 모델링", "구체적, DBMS 구현 중심", "테이블, 컬럼, 인덱스, 테이블스페이스, 저장 구조, 접근 경로, 성능 설계", "성능, 저장, 하드웨어, DBMS 특성 반영"]
        ]
      },
      {
        type: "table",
        title: "데이터베이스 3단계 구조와 데이터 독립성",
        headers: ["구조", "무엇을 표현하나", "연결되는 독립성", "시험 포인트"],
        rows: [
          ["외부 스키마", "사용자나 응용 프로그램이 보는 개별 화면 또는 뷰", "논리적 독립성과 연결", "여러 외부 스키마가 하나의 개념 스키마를 바라볼 수 있다."],
          ["개념 스키마", "조직 전체 데이터베이스의 논리적 통합 구조", "외부-개념 사상, 개념-내부 사상의 기준", "전체 DB의 엔터티, 관계, 제약조건을 표현한다."],
          ["내부 스키마", "데이터가 실제 저장되는 물리적 구조와 접근 방법", "물리적 독립성과 연결", "저장 장치, 인덱스, 파일 구조 변경과 관련된다."],
          ["논리적 독립성", "개념 스키마가 바뀌어도 외부 스키마와 응용 프로그램 영향이 최소화되는 성질", "외부 스키마와 개념 스키마 사이", "논리 구조 변경에 대한 독립성이다."],
          ["물리적 독립성", "내부 저장 구조가 바뀌어도 개념 스키마와 응용 프로그램 영향이 최소화되는 성질", "개념 스키마와 내부 스키마 사이", "저장 구조 변경에 대한 독립성이다."]
        ]
      },
      {
        type: "table",
        title: "좋은 데이터 모델의 요소",
        headers: ["요소", "의미", "기출 키워드"],
        rows: [
          ["완전성", "업무에서 필요로 하는 모든 데이터가 정의되어 있어야 한다.", "빠진 속성/엔터티가 없어야 한다."],
          ["중복배제", "동일한 사실은 한 번만 기록되도록 설계한다.", "나이와 생년월일을 동시에 저장하는 예시는 중복 함정이다."],
          ["업무규칙", "업무 규칙이 엔터티, 속성, 관계, 서브타입, 제약으로 모델에 표현되어야 한다.", "모든 사용자가 같은 규칙으로 데이터를 해석해야 한다."],
          ["데이터 재사용", "회사 전체 관점의 통합 모델로 여러 업무에서 데이터를 재사용할 수 있어야 한다.", "부서별로 흩어진 데이터 구조는 재사용성이 낮다."],
          ["의사소통", "데이터 모델은 업무 사용자, 개발자, DBA가 같은 의미로 대화하게 하는 산출물이다.", "명확화와 연결된다."],
          ["통합성", "동일한 주체, 대상, 행위를 합리적으로 통합해 데이터 일관성을 높인다.", "고객/상품/계약 등 공통 데이터 통합과 연결된다."]
        ]
      },
      {
        type: "checklist",
        title: "이 세부항목에서 외워야 하는 문장",
        items: [
          "모델링의 특징은 추상화, 단순화, 명확화다.",
          "모델링 관점은 데이터 관점, 프로세스 관점, 데이터와 프로세스의 상관 관점이다.",
          "데이터 모델링의 중요성은 파급효과, 간결한 표현, 데이터 품질이다.",
          "데이터 모델링 유의점은 중복, 비유연성, 비일관성이다.",
          "데이터 모델링 3단계는 개념적, 논리적, 물리적 모델링이다.",
          "데이터베이스 3단계 구조는 외부 스키마, 개념 스키마, 내부 스키마다.",
          "논리적 독립성은 외부-개념, 물리적 독립성은 개념-내부 단계와 연결한다.",
          "좋은 데이터 모델 요소는 완전성, 중복배제, 업무규칙, 데이터 재사용, 의사소통, 통합성이다."
        ]
      }
    ],
    keyPoints: [
      "모델링의 대표 특징은 추상화, 단순화, 명확화이며, 현실 세계를 약속된 표기법으로 이해 가능한 구조로 표현한다.",
      "데이터 관점은 업무가 어떤 데이터를 필요로 하는지, 프로세스 관점은 업무가 무엇을 수행하는지, 상관 관점은 프로세스가 데이터에 주는 영향을 본다.",
      "개념 모델링은 업무 중심의 큰 구조, 논리 모델링은 키/속성/관계와 정규화, 물리 모델링은 DBMS 구현과 성능을 고려한다.",
      "ANSI/SPARC 3단계 구조는 외부, 개념, 내부 스키마로 나뉘며 논리적 독립성과 물리적 독립성을 설명할 때 함께 출제된다.",
      "모델링 유의점은 중복, 비유연성, 비일관성이다. 성능을 위한 반정규화는 모델링 유의점 자체가 아니라 설계 이후의 조정이다."
    ],
    examTrap:
      "기출에서는 '반정규화를 고려한다'를 모델링 유의점으로 섞어 넣는 방식이 자주 나온다. 유의점은 중복, 비유연성, 비일관성으로 고정해서 판단한다.",
    oracleAngle:
      "SQL 튜닝 문제에서도 모델이 잘못되면 조인 조건, 선택 관계, NULL 처리, 인덱스 설계가 흔들린다. 실행계획 이전에 데이터 모델을 먼저 읽는 습관이 중요하다."
  },
  {
    id: "modeling-entity",
    subjectId: "modeling",
    subjectName: modelingSubject,
    majorTopic: "데이터 모델링의 이해",
    detailTopic: "엔터티",
    summary:
      "엔터티는 업무상 관리해야 하는 데이터 집합이며, 식별 가능한 인스턴스를 가져야 한다. SQLP 객관식에서는 엔터티 성립 조건과 유형 분류를 묻는 문제가 많다.",
    studyBlocks: [
      {
        type: "table",
        title: "엔터티 성립 조건",
        headers: ["조건", "설명", "기출 판단법"],
        rows: [
          ["업무 필요성", "업무에서 관리해야 하는 정보여야 한다.", "단순 참고 자료나 임시 계산 결과는 엔터티로 보기 어렵다."],
          ["식별 가능성", "각 인스턴스를 구분할 수 있어야 한다.", "식별자가 없으면 엔터티 성립이 약하다."],
          ["인스턴스 집합", "두 개 이상의 인스턴스가 존재하거나 존재 가능해야 한다.", "단 하나만 존재하는 개념은 속성이나 코드값일 수 있다."],
          ["속성 보유", "엔터티는 관리할 속성을 가져야 한다.", "속성이 전혀 없다는 설명은 대표 오답이다."],
          ["관계 보유", "업무적으로 다른 엔터티와 관계를 가질 수 있어야 한다.", "고립된 데이터인지, 업무 흐름에 참여하는지 확인한다."]
        ]
      },
      {
        type: "table",
        title: "엔터티 분류",
        headers: ["분류 기준", "종류", "의미와 예시"],
        rows: [
          ["유무형", "유형 엔터티", "물리적 형태가 있는 대상이다. 사원, 상품, 설비처럼 눈에 보이는 실체가 대표적이다."],
          ["유무형", "개념 엔터티", "물리적 형태는 없지만 업무상 관리하는 개념이다. 조직, 보험상품, 계정과목 등이 예시다."],
          ["유무형", "사건 엔터티", "업무 행위나 발생 사실을 관리한다. 주문, 청구, 입금, 수강, 계약변경이 대표적이다."],
          ["발생 시점", "기본 엔터티", "다른 엔터티에 의존하지 않고 독립적으로 발생하는 원천 데이터다."],
          ["발생 시점", "중심 엔터티", "기본 엔터티에서 파생되어 업무의 중심 역할을 한다. 계약, 주문, 청구처럼 업무 흐름의 축이 된다."],
          ["발생 시점", "행위 엔터티", "두 개 이상의 엔터티 사이에서 발생하는 행위를 표현한다. 주문상세, 수강내역, 계약변경이 자주 나온다."]
        ]
      },
      {
        type: "flow",
        title: "ERD에서 엔터티를 읽는 순서",
        steps: [
          "엔터티 이름이 업무 명사인지 확인한다.",
          "주식별자와 주요 속성을 보고 무엇의 집합인지 판단한다.",
          "기본, 중심, 행위 엔터티 중 어디에 가까운지 발생 시점을 본다.",
          "관계 차수와 선택성을 통해 이 엔터티가 업무 흐름에서 어떤 역할을 하는지 확인한다.",
          "N:M 관계가 직접 보이면 교차 엔터티로 풀어야 하는지 판단한다."
        ]
      }
    ],
    keyPoints: [
      "엔터티는 업무에서 필요하고, 식별 가능하며, 두 개 이상의 인스턴스와 속성을 가져야 하고, 다른 엔터티와 관계를 가질 수 있어야 한다.",
      "유형 엔터티는 물리적 형태가 있는 대상, 개념 엔터티는 개념적으로 관리되는 대상, 사건 엔터티는 업무 행위나 발생 사실을 관리한다.",
      "기본 엔터티는 원천 데이터, 중심 엔터티는 업무의 중심 축, 행위 엔터티는 두 개 이상의 엔터티 사이에서 발생한 업무 행위를 주로 표현한다.",
      "엔터티명은 업무 용어를 사용하고 단수 명사로 명명하며, 약어나 중복 의미를 피해야 한다.",
      "N:M 관계가 발견되면 교차 엔터티나 행위 엔터티로 풀어 1:M 관계 두 개로 전환하는 것이 일반적이다."
    ],
    examTrap:
      "인스턴스가 없거나 속성이 없는 대상은 엔터티로 보기 어렵다. '언젠가 필요할 것 같다'는 이유만으로 엔터티가 되지는 않는다.",
    oracleAngle:
      "행위 엔터티는 대량 데이터가 되는 경우가 많아 조인 순서와 인덱스 설계의 핵심이 된다. 주문, 수강, 계약이 대표적인 튜닝 대상이다."
  },
  {
    id: "modeling-attribute",
    subjectId: "modeling",
    subjectName: modelingSubject,
    majorTopic: "데이터 모델링의 이해",
    detailTopic: "속성",
    summary:
      "속성은 엔터티가 관리해야 하는 더 이상 분리하기 어려운 업무 정보다. 기본, 설계, 파생 속성의 구분과 도메인, 원자성, NULL 허용 여부가 자주 출제된다.",
    studyBlocks: [
      {
        type: "section",
        title: "속성을 판단하는 기준",
        paragraphs: [
          "속성은 엔터티가 업무적으로 관리해야 하는 항목이다. 하나의 속성은 하나의 의미를 가져야 하고, 더 이상 의미 있게 분리하기 어려운 단위여야 한다.",
          "기출에서는 속성의 정의 자체보다 기본속성, 설계속성, 파생속성의 구분과 도메인, NULL, 원자성, 다중값 분해를 자주 묻는다."
        ]
      },
      {
        type: "table",
        title: "속성의 종류",
        headers: ["종류", "의미", "예시", "기출 함정"],
        rows: [
          ["기본 속성", "업무에서 원래 발생하거나 수집되는 속성", "고객명, 생년월일, 주문일자, 원금", "업무에서 정의되어 저장되는 값이면 계산처럼 보여도 기본 속성일 수 있다."],
          ["설계 속성", "업무에는 없지만 모델링이나 시스템 설계를 위해 만든 속성", "상품코드, 고객번호, 예금분류코드", "코드값은 업무 분류를 시스템적으로 관리하기 위해 만든 설계 속성으로 자주 출제된다."],
          ["파생 속성", "다른 속성으로 계산되거나 유도되는 속성", "나이, 주문금액합계, 이자", "이자율은 정의된 값이고, 이자는 계산된 값이라는 식으로 구분한다."]
        ]
      },
      {
        type: "table",
        title: "도메인과 속성 품질",
        headers: ["개념", "설명", "시험 포인트"],
        rows: [
          ["도메인", "속성이 가질 수 있는 값의 범위와 제약", "단답형으로 자주 나온다. 성별 코드, 학점 범위, 금액 양수 조건 등이 해당한다."],
          ["원자성", "속성값은 더 이상 반복되거나 나뉘지 않는 단일 값이어야 한다.", "전화번호1/전화번호2처럼 반복되면 별도 엔터티를 검토한다."],
          ["NULL 허용", "아직 모르거나 해당 없음 상태를 허용하는지 정한다.", "필수 속성과 선택 속성, 주식별자 존재성과 연결된다."],
          ["명명 일관성", "같은 의미는 같은 이름과 같은 도메인으로 관리한다.", "데이터 표준화와 좋은 데이터 모델 요소로 이어진다."]
        ]
      }
    ],
    keyPoints: [
      "기본 속성은 업무에서 원래 수집되는 값, 설계 속성은 모델링 과정에서 식별이나 분류를 위해 만든 값, 파생 속성은 다른 속성으로 계산되는 값이다.",
      "도메인은 속성이 가질 수 있는 값의 범위와 제약이며, 단답형에서 반복적으로 출제되는 용어다.",
      "속성은 하나의 의미를 가져야 하며, 반복 그룹이나 다중값은 별도 엔터티로 분리하는 것이 정규화 관점에 맞다.",
      "파생 속성은 조회 성능을 위해 저장할 수 있지만 원천 값과의 정합성 관리가 필요하다.",
      "속성명은 업무에서 쓰는 명확한 명사형 용어를 쓰고, 같은 의미의 속성은 전사적으로 일관되게 정의한다."
    ],
    examTrap:
      "이자율처럼 업무상 정의되어 저장되는 값은 기본 또는 설계 속성일 수 있지만, 이자처럼 원금과 이자율로 계산되는 값은 파생 속성이다.",
    oracleAngle:
      "WHERE 절에서 자주 쓰는 속성의 도메인과 데이터 타입은 인덱스 효율에 직접 영향을 준다. DATE 칼럼을 문자처럼 비교하는 습관은 SQLP 실기 감점 포인트다."
  },
  {
    id: "modeling-relationship",
    subjectId: "modeling",
    subjectName: modelingSubject,
    majorTopic: "데이터 모델링의 이해",
    detailTopic: "관계",
    summary:
      "관계는 엔터티 인스턴스 사이의 업무적 연관성이다. 관계명, 차수, 선택사양을 읽어 SQL 조인 방식과 결과 건수를 예측하는 문제가 중요하다.",
    studyBlocks: [
      {
        type: "table",
        title: "관계 표기에서 반드시 보는 것",
        headers: ["요소", "의미", "기출 포인트"],
        rows: [
          ["관계명", "두 엔터티 사이의 업무 의미를 동사형으로 표현한다.", "지나치게 포괄적인 '가진다', '이다'보다 업무 의미가 드러나야 한다."],
          ["관계차수", "한 인스턴스가 상대 엔터티 인스턴스 몇 개와 연결되는지 나타낸다.", "1:1, 1:M, M:N 결과 건수와 조인 중복을 판단한다."],
          ["관계선택사양", "관계 참여가 필수인지 선택인지 나타낸다.", "선택 관계는 OUTER JOIN 필요 여부와 연결된다."],
          ["관계분류", "존재 관계, 행위 관계 등 성격을 설명하는 분류다.", "관계 표기법의 구성요소를 묻는 문제에서 '관계분류'는 함정이 될 수 있다."]
        ]
      },
      {
        type: "table",
        title: "관계의 종류와 SQL 연결",
        headers: ["구분", "의미", "SQL에서 주의할 점"],
        rows: [
          ["존재 관계", "엔터티 존재 자체가 서로 관련되는 관계", "부모-자식 구조, 기준정보 참조에서 자주 보인다."],
          ["행위 관계", "업무 행위가 발생하면서 만들어지는 관계", "주문과 상품 사이의 주문상세처럼 행위 엔터티가 필요할 수 있다."],
          ["필수 관계", "상대 인스턴스가 반드시 존재해야 하는 관계", "INNER JOIN 가능성이 높지만 지문 요구사항을 확인해야 한다."],
          ["선택 관계", "상대 인스턴스가 없을 수도 있는 관계", "기준 집합을 보존하려면 OUTER JOIN을 검토한다."],
          ["M:N 관계", "양쪽 모두 다수로 연결되는 관계", "관계형 모델에서는 교차 엔터티로 풀어야 한다."]
        ]
      },
      {
        type: "checklist",
        title: "관계 문제 풀이 체크",
        items: [
          "관계 표기법 요소는 관계명, 관계차수, 관계선택사양이다.",
          "선택 관계를 INNER JOIN하면 기준 데이터가 사라질 수 있다.",
          "1:M 관계에서 M쪽을 조인하면 행 수가 늘어날 수 있다.",
          "M:N 관계는 교차 엔터티나 행위 엔터티로 해소한다.",
          "ERD 문제는 선 모양보다 업무 의미와 선택성을 먼저 읽는다."
        ]
      }
    ],
    keyPoints: [
      "관계 표기에는 관계명, 관계차수, 관계선택사양이 포함된다. 관계분류는 표기 요소로 묻는 문제에서 함정으로 쓰일 수 있다.",
      "존재 관계는 엔터티 존재 자체의 연관, 행위 관계는 업무 행위 발생에 따른 연관으로 구분한다.",
      "1:1, 1:M, M:N 관계 차수와 필수/선택 관계를 읽을 수 있어야 ERD 기반 문제를 풀 수 있다.",
      "선택 관계를 INNER JOIN으로 처리하면 보존해야 할 기준 집합이 사라질 수 있으므로 OUTER JOIN 필요 여부를 판단해야 한다.",
      "관계명은 양방향으로 읽히며, 각 방향의 업무 의미가 자연스러운지 확인한다."
    ],
    examTrap:
      "선택 관계와 필수 관계를 단순히 선 모양으로만 외우면 지문형 문제에서 틀린다. 기준 엔터티의 모든 건을 보존해야 하는지 먼저 판단한다.",
    oracleAngle:
      "실기에서는 ERD의 선택 관계를 무시하고 이너 조인을 쓰는 답안이 감점된다. 조인 방식은 실행계획뿐 아니라 업무 결과의 정확성과도 연결된다."
  },
  {
    id: "modeling-identifier",
    subjectId: "modeling",
    subjectName: modelingSubject,
    majorTopic: "데이터 모델링의 이해",
    detailTopic: "식별자",
    summary:
      "식별자는 엔터티 인스턴스를 유일하게 구분하는 속성 또는 속성 집합이다. 주식별자 도출 기준과 본질식별자, 인조식별자의 장단점이 반복 출제된다.",
    studyBlocks: [
      {
        type: "table",
        title: "주식별자 도출 기준",
        headers: ["기준", "의미", "기출에서 틀린 선지"],
        rows: [
          ["업무에서 자주 이용", "조회, 조인, 업무 식별에 자주 쓰는 속성이 좋다.", "거의 사용하지 않는 내부 설명값을 주식별자로 둔다는 설명"],
          ["값이 자주 변하지 않음", "식별자는 변경되면 자식 데이터와 참조 관계에 큰 영향을 준다.", "변경 가능성이 큰 상태명, 부서명, 상품명 등을 식별자로 둔다는 설명"],
          ["명칭/내역 지양", "이름이나 설명은 중복되거나 변경될 수 있다.", "명칭, 내역처럼 이름으로 기술되는 것을 주식별자로 지정한다는 설명"],
          ["속성 수 최소화", "복합 식별자는 필요한 만큼만 구성한다.", "너무 많은 속성으로 복합키를 만들면 조인 복잡도와 오류 가능성이 커진다."]
        ]
      },
      {
        type: "table",
        title: "식별자 분류",
        headers: ["분류 기준", "종류", "설명"],
        rows: [
          ["대표성", "주식별자 / 보조식별자", "주식별자는 대표 식별자, 보조식별자는 유일하지만 대표로 쓰지 않는 식별자다."],
          ["생성 위치", "내부식별자 / 외부식별자", "내부식별자는 엔터티 내부에서 스스로 생성되고, 외부식별자는 부모 엔터티로부터 상속된다."],
          ["속성 수", "단일식별자 / 복합식별자", "하나의 속성으로 식별하면 단일, 둘 이상이면 복합이다."],
          ["업무 의미", "본질식별자 / 인조식별자", "본질식별자는 업무 의미가 있고, 인조식별자는 식별을 위해 인위적으로 만든 값이다."]
        ]
      },
      {
        type: "table",
        title: "주식별자의 네 가지 특성",
        headers: ["특성", "의미", "예시 판단"],
        rows: [
          ["유일성", "각 인스턴스를 유일하게 구분해야 한다.", "동명이인이 가능한 고객명은 단독 주식별자로 부적절하다."],
          ["최소성", "유일성을 만족하는 데 필요한 최소 속성만 포함한다.", "불필요한 속성을 복합키에 추가하면 최소성 위반이다."],
          ["불변성", "값이 자주 바뀌지 않아야 한다.", "부서명, 상품명처럼 변경 가능한 값은 위험하다."],
          ["존재성", "NULL이 될 수 없어야 한다.", "주식별자 속성은 반드시 값이 있어야 한다."]
        ]
      }
    ],
    keyPoints: [
      "주식별자는 유일성, 최소성, 불변성, 존재성을 만족해야 한다.",
      "주식별자는 업무에서 자주 이용되고 값이 자주 변하지 않으며, 지나치게 많은 속성으로 구성하지 않는 것이 좋다.",
      "명칭이나 내역처럼 설명성 텍스트는 변경 가능성이 높아 주식별자로 부적절한 경우가 많다.",
      "본질식별자는 업무 의미가 있는 자연 식별자이고, 인조식별자는 식별 목적을 위해 만든 대체 식별자다.",
      "식별 관계는 부모 식별자가 자식 식별자에 포함되고, 비식별 관계는 일반 외래키로만 참조한다."
    ],
    examTrap:
      "대체로 '이름으로 기술되는 것을 주식별자로 지정한다'는 선지는 틀린 설명이다. 식별자는 변하지 않고 짧고 명확해야 한다.",
    oracleAngle:
      "인조식별자를 쓰면 조인 키가 단순해질 수 있지만, 업무상 중복을 막는 유니크 제약을 별도로 설계하지 않으면 데이터 품질 문제가 생긴다."
  },
  {
    id: "modeling-normalization",
    subjectId: "modeling",
    subjectName: modelingSubject,
    majorTopic: "데이터 모델과 SQL",
    detailTopic: "정규화",
    summary:
      "정규화는 데이터 중복과 이상현상을 줄이기 위해 엔터티와 속성을 함수 종속성에 맞게 분해하는 과정이다. 1NF, 2NF, 3NF 판단 문제가 핵심이다.",
    keyPoints: [
      "제1정규형은 반복 속성이나 다중값을 제거해 속성의 원자성을 확보한다.",
      "제2정규형은 복합 식별자 일부에만 종속되는 부분 함수 종속을 제거한다.",
      "제3정규형은 기본키가 아닌 속성 사이의 이행 함수 종속을 제거한다.",
      "정규화는 입력, 수정, 삭제 이상을 줄이고 데이터 일관성을 높인다.",
      "성능을 이유로 반정규화를 검토하더라도 정규화된 모델을 먼저 이해하고 병목을 확인해야 한다."
    ],
    examTrap:
      "복합키가 아닌 단일키 테이블에는 부분 함수 종속에 의한 2NF 위반을 묻기 어렵다. 키 구조를 먼저 확인하고 정규형을 판단한다.",
    oracleAngle:
      "과도한 반정규화는 조인을 줄일 수 있지만 갱신 비용과 정합성 관리 비용이 커진다. SQLP에서는 정규화와 성능 모델링의 순서를 함께 묻는다."
  },
  {
    id: "modeling-relationship-join",
    subjectId: "modeling",
    subjectName: modelingSubject,
    majorTopic: "데이터 모델과 SQL",
    detailTopic: "관계와 조인의 이해",
    summary:
      "데이터 모델의 관계는 SQL 조인의 근거가 된다. 관계 차수와 선택성을 읽어 INNER JOIN, OUTER JOIN, EXISTS, 집계 위치를 고르는 능력이 중요하다.",
    keyPoints: [
      "1:M 관계에서 M쪽을 조인하면 기준 집합의 행 수가 늘어날 수 있으므로 DISTINCT나 GROUP BY가 필요한지 확인한다.",
      "부모 없는 자식을 허용하지 않는 필수 관계는 일반적으로 INNER JOIN 가능성이 높다.",
      "자식이 없더라도 부모를 보존해야 하면 OUTER JOIN 또는 NOT EXISTS를 고려한다.",
      "N:M 관계는 교차 엔터티를 통해 두 번 조인되므로 중복과 집계 왜곡을 특히 조심한다.",
      "조인 조건 누락은 카티션 곱을 만들고, 잘못된 조건 위치는 OUTER JOIN 결과를 INNER JOIN처럼 바꾼다."
    ],
    examTrap:
      "LEFT OUTER JOIN의 오른쪽 테이블 조건을 WHERE 절에 두면 NULL 확장 행이 제거될 수 있다. 조건은 ON 절과 WHERE 절의 의미 차이를 따져야 한다.",
    oracleAngle:
      "실행계획에서 조인 순서와 조인 방식은 모델의 기준 집합을 반영해야 한다. 결과 정확성이 먼저이고 그 다음이 성능이다."
  },
  {
    id: "modeling-transaction-model",
    subjectId: "modeling",
    subjectName: modelingSubject,
    majorTopic: "데이터 모델과 SQL",
    detailTopic: "모델이 표현하는 트랜잭션의 이해",
    summary:
      "트랜잭션은 업무상 하나의 논리적 작업 단위이며, 모델은 어떤 데이터가 함께 생성, 변경, 삭제되는지 표현한다. 지문형 문제에서는 CRUD와 관계 선택성을 같이 본다.",
    keyPoints: [
      "하나의 업무 트랜잭션에서 동시에 발생하는 엔터티와 선택적으로 발생하는 엔터티를 구분한다.",
      "필수 관계는 트랜잭션 처리 시 함께 생성되어야 하는 데이터일 가능성이 높다.",
      "업무 생명주기가 다른 데이터는 무리하게 한 엔터티에 합치지 않는다.",
      "트랜잭션 단위가 명확해야 잠금 범위, 커밋 단위, 배치 처리 범위를 설계할 수 있다.",
      "이력 엔터티는 현재 상태와 변경 이력을 분리할 때 자주 등장한다."
    ],
    examTrap:
      "관계가 존재한다고 해서 모든 데이터가 항상 같은 트랜잭션에서 생성되는 것은 아니다. 선택 관계와 발생 시점을 함께 읽는다.",
    oracleAngle:
      "트랜잭션 범위가 넓으면 undo, redo, lock 대기와 배치 성능 문제가 커진다. SQLP 튜닝은 업무 단위까지 함께 본다."
  },
  {
    id: "modeling-null",
    subjectId: "modeling",
    subjectName: modelingSubject,
    majorTopic: "데이터 모델과 SQL",
    detailTopic: "Null 속성의 이해",
    summary:
      "NULL은 값이 없거나 아직 알 수 없음을 의미하며 0이나 공백과 다르다. 모델링에서는 필수 속성과 선택 속성을 구분하고, SQL에서는 3값 논리를 이해해야 한다.",
    keyPoints: [
      "주식별자 속성은 존재성을 만족해야 하므로 NULL이 될 수 없다.",
      "NULL과의 비교는 =, <>가 아니라 IS NULL, IS NOT NULL을 사용한다.",
      "집계 함수에서 COUNT(*)는 행 수를 세지만 COUNT(컬럼)은 NULL을 제외한다.",
      "NULL을 허용하는 외래키는 선택 관계를 표현할 수 있다.",
      "NVL, COALESCE 같은 NULL 처리 함수는 결과와 인덱스 사용 가능성에 영향을 준다."
    ],
    examTrap:
      "NULL은 어떤 값과도 같지 않다. NOT IN 서브쿼리 결과에 NULL이 섞이면 예상과 다른 결과가 나올 수 있다.",
    oracleAngle:
      "Oracle에서 빈 문자열은 NULL로 취급되는 특징이 있다. 문자열 칼럼 조건과 함수 기반 인덱스 설계에서 주의한다."
  },
  {
    id: "modeling-natural-surrogate",
    subjectId: "modeling",
    subjectName: modelingSubject,
    majorTopic: "데이터 모델과 SQL",
    detailTopic: "본질식별자 vs 인조식별자",
    summary:
      "본질식별자는 업무 의미를 가진 식별자이고 인조식별자는 시스템이 식별 목적으로 만든 값이다. 시험에서는 장단점과 데이터 품질 보완책을 함께 묻는다.",
    keyPoints: [
      "본질식별자는 업무 의미가 있어 중복 판단이 쉽지만 길거나 변경 가능성이 있으면 관리가 어렵다.",
      "인조식별자는 키가 단순하고 조인이 편하지만 업무 중복을 자동으로 막아주지는 않는다.",
      "인조식별자를 쓰는 경우에도 업무상 유일해야 하는 속성 조합에는 유니크 제약을 검토한다.",
      "본질식별자가 복합키로 너무 길어지면 자식 엔터티 전파와 인덱스 비용이 커질 수 있다.",
      "식별자는 성능뿐 아니라 업무 의미, 변경 가능성, 데이터 품질을 함께 고려해 선택한다."
    ],
    examTrap:
      "인조식별자를 만들었다고 업무 식별 문제가 사라지는 것은 아니다. 원래 중복 금지 규칙을 별도로 관리해야 한다.",
    oracleAngle:
      "Sequence 기반 인조키는 입력 성능과 키 관리에 유리하지만, SQLP에서는 업무키 유니크 인덱스와 조합해 설명하는 답이 더 안전하다."
  },
  {
    id: "sql-rdb-overview",
    subjectId: "sql-basic",
    subjectName: sqlSubject,
    majorTopic: "SQL 기본",
    detailTopic: "관계형 데이터베이스 개요",
    summary:
      "관계형 데이터베이스는 데이터를 릴레이션, 행, 열로 표현하고 집합 연산과 관계 연산을 기반으로 처리한다. SQLP에서는 키, 무결성, SQL 명령 분류가 기본이다.",
    keyPoints: [
      "릴레이션은 테이블, 튜플은 행, 애트리뷰트는 열에 대응한다.",
      "기본키는 유일성과 존재성을 만족하고, 외래키는 참조 무결성을 표현한다.",
      "SQL은 DDL, DML, TCL, DCL로 구분되며 SELECT는 DML 범주로 다룬다.",
      "관계형 모델은 중복 행을 허용하지 않는 수학적 릴레이션에서 출발하지만 SQL 테이블은 중복 행이 가능하다.",
      "집합 기반 사고가 중요하며 행 단위 절차 처리보다 한 번의 SQL로 처리하는 것이 기본 방향이다."
    ],
    examTrap:
      "SQL의 SELECT 결과는 ORDER BY가 없으면 순서가 보장되지 않는다. 테이블이 정렬되어 저장된다는 식의 설명은 틀리다.",
    oracleAngle:
      "Oracle은 read consistency를 통해 조회 시점 일관성을 제공한다. 관계형 개념과 트랜잭션 격리 개념이 튜닝 문제로 이어진다."
  },
  {
    id: "sql-select",
    subjectId: "sql-basic",
    subjectName: sqlSubject,
    majorTopic: "SQL 기본",
    detailTopic: "SELECT 문",
    summary:
      "SELECT 문은 조회 대상, 조건, 그룹, 정렬을 표현한다. 시험에서는 문장 실행 순서와 DISTINCT, 별칭, 산술식, NULL 처리 결과를 자주 묻는다.",
    keyPoints: [
      "논리적 처리 순서는 FROM, WHERE, GROUP BY, HAVING, SELECT, ORDER BY로 이해하면 대부분의 결과 예측 문제를 풀 수 있다.",
      "DISTINCT는 SELECT 목록 전체 조합의 중복을 제거한다.",
      "SELECT 절 별칭은 일반적으로 ORDER BY에서 사용할 수 있지만 WHERE 절에서는 사용할 수 없다.",
      "산술 연산에 NULL이 포함되면 결과가 NULL이 된다.",
      "문자, 숫자, 날짜 타입의 암시적 변환은 결과와 성능 모두에 영향을 줄 수 있다."
    ],
    examTrap:
      "WHERE 절에서 SELECT 별칭을 바로 쓰는 보기, DISTINCT가 특정 한 컬럼에만 적용된다는 설명은 자주 나오는 함정이다.",
    oracleAngle:
      "Oracle에서는 ROWNUM이 ORDER BY보다 먼저 부여되는 상황을 주의해야 한다. Top-N 문제는 인라인 뷰나 FETCH FIRST로 정렬 이후 제한한다."
  },
  {
    id: "sql-functions",
    subjectId: "sql-basic",
    subjectName: sqlSubject,
    majorTopic: "SQL 기본",
    detailTopic: "함수",
    summary:
      "함수 문제는 문자, 숫자, 날짜, 변환, NULL 처리 함수의 결과를 정확히 계산하는 방식으로 출제된다. Oracle 함수의 세부 차이를 알아야 한다.",
    keyPoints: [
      "단일행 함수는 행마다 하나의 결과를 반환하고, 그룹 함수는 여러 행을 하나의 결과로 집계한다.",
      "NVL은 두 인자 타입 변환을 주의하고, COALESCE는 첫 번째 NULL이 아닌 값을 반환한다.",
      "DECODE와 CASE는 조건 분기 표현에 사용되며 CASE가 표준 SQL에 가깝다.",
      "TRUNC, ROUND는 숫자와 날짜 모두에서 출제될 수 있으며 기준 단위가 중요하다.",
      "문자 함수는 SUBSTR, INSTR, LPAD/RPAD, LTRIM/RTRIM, REPLACE 결과를 직접 계산하는 문제가 많다."
    ],
    examTrap:
      "NULL 관련 함수의 반환 타입과 평가 순서를 헷갈리기 쉽다. NVL(숫자컬럼, '0')처럼 타입 변환이 섞인 보기는 조심한다.",
    oracleAngle:
      "조건 컬럼에 함수를 씌우면 일반 인덱스 사용이 어려워질 수 있다. 필요하면 함수 기반 인덱스나 조건 변환을 고려한다."
  },
  {
    id: "sql-where",
    subjectId: "sql-basic",
    subjectName: sqlSubject,
    majorTopic: "SQL 기본",
    detailTopic: "WHERE 절",
    summary:
      "WHERE 절은 행을 필터링한다. 비교, BETWEEN, IN, LIKE, IS NULL, 논리 연산자 우선순위와 NULL의 3값 논리가 핵심이다.",
    keyPoints: [
      "AND가 OR보다 우선순위가 높으므로 복합 조건은 괄호로 의도를 명확히 한다.",
      "BETWEEN은 양 끝 값을 포함하고, NOT BETWEEN은 범위 밖을 의미한다.",
      "LIKE에서 %는 0개 이상 문자, _는 한 글자를 의미하며 ESCAPE로 와일드카드를 문자로 처리할 수 있다.",
      "IN은 목록 중 하나와 일치하는지 확인하고, NOT IN은 NULL이 섞이면 결과가 예상과 달라질 수 있다.",
      "WHERE 절은 GROUP BY 이전에 적용되므로 집계 결과 조건은 HAVING에 둔다."
    ],
    examTrap:
      "NULL 비교를 = NULL로 작성한 보기, OR 조건에 괄호가 없어 의도와 다른 결과를 내는 보기가 자주 나온다.",
    oracleAngle:
      "인덱스 선두 컬럼에 함수나 부정 조건을 쓰면 액세스 효율이 떨어질 수 있다. 조건을 SARGable하게 바꾸는 실기형 문제가 많다."
  },
  {
    id: "sql-group-having",
    subjectId: "sql-basic",
    subjectName: sqlSubject,
    majorTopic: "SQL 기본",
    detailTopic: "GROUP BY, HAVING 절",
    summary:
      "GROUP BY는 행을 그룹으로 묶고 HAVING은 그룹 결과를 필터링한다. SELECT 목록과 그룹 컬럼의 관계, COUNT의 NULL 처리, HAVING 위치가 중요하다.",
    keyPoints: [
      "GROUP BY를 사용하면 SELECT 목록에는 그룹 컬럼이나 그룹 함수만 올 수 있다.",
      "WHERE는 그룹화 전 행 조건이고, HAVING은 그룹화 후 집계 조건이다.",
      "COUNT(*)는 모든 행을 세고 COUNT(컬럼)은 NULL이 아닌 값만 센다.",
      "GROUP BY 없이 HAVING만 사용하는 경우 전체 결과를 하나의 그룹처럼 다루는 DBMS 동작을 문제에서 확인해야 한다.",
      "집계 전 중복 제거가 필요하면 COUNT(DISTINCT 컬럼)처럼 명시한다."
    ],
    examTrap:
      "집계 조건을 WHERE에 쓰는 보기, 그룹화하지 않은 일반 컬럼을 SELECT에 쓰는 보기는 대표 오답이다.",
    oracleAngle:
      "대량 집계에서는 HASH GROUP BY, SORT GROUP BY 여부와 인덱스 정렬 활용 가능성을 실행계획에서 본다."
  },
  {
    id: "sql-order-by",
    subjectId: "sql-basic",
    subjectName: sqlSubject,
    majorTopic: "SQL 기본",
    detailTopic: "ORDER BY 절",
    summary:
      "ORDER BY는 최종 결과의 정렬을 보장하는 유일한 절이다. 정렬 기준, 별칭, 컬럼 위치, NULL 정렬 순서가 주로 출제된다.",
    keyPoints: [
      "ORDER BY가 없으면 조회 결과 순서는 보장되지 않는다.",
      "ORDER BY에는 SELECT 별칭이나 컬럼 순번을 사용할 수 있다.",
      "ASC는 오름차순, DESC는 내림차순이며 여러 정렬 기준은 앞 기준이 같을 때 다음 기준을 적용한다.",
      "Oracle은 기본적으로 ASC에서 NULL이 뒤, DESC에서 NULL이 앞에 정렬되는 특징을 가진다.",
      "정렬은 비용이 큰 작업이므로 Top-N이나 페이징에서는 정렬 범위를 줄이는 전략이 중요하다."
    ],
    examTrap:
      "인덱스가 있으니 ORDER BY 없이도 항상 정렬된다는 설명은 틀리다. 결과 순서는 ORDER BY로만 보장한다.",
    oracleAngle:
      "정렬을 피하려면 인덱스 컬럼 순서와 정렬 방향이 맞아야 한다. 실행계획의 SORT ORDER BY 유무를 확인한다."
  },
  {
    id: "sql-join",
    subjectId: "sql-basic",
    subjectName: sqlSubject,
    majorTopic: "SQL 기본",
    detailTopic: "조인",
    summary:
      "조인은 두 개 이상의 테이블을 관련 컬럼으로 결합한다. 등가조인, 비등가조인, 셀프조인, 아우터조인의 결과 행 수를 예측하는 문제가 많다.",
    keyPoints: [
      "조인 조건이 없거나 부족하면 카티션 곱이 발생한다.",
      "INNER JOIN은 양쪽 조건을 만족하는 행만 반환한다.",
      "OUTER JOIN은 기준 테이블의 행을 보존하고 상대 테이블이 없으면 NULL로 채운다.",
      "비등가 조인은 BETWEEN 같은 범위 조건으로 조인하는 경우에 쓰인다.",
      "셀프조인은 같은 테이블을 서로 다른 별칭으로 두 번 참조한다."
    ],
    examTrap:
      "OUTER JOIN 대상 테이블 조건을 WHERE 절에 두면 보존 행이 제거될 수 있다. ON 절 조건과 WHERE 절 조건의 차이를 확인한다.",
    oracleAngle:
      "Oracle 구문 (+)와 ANSI OUTER JOIN을 섞어 쓰는 것은 피한다. SQLP에서는 ANSI 표준 조인과 Oracle 실행계획 해석을 모두 알아야 한다."
  },
  {
    id: "sql-standard-join",
    subjectId: "sql-basic",
    subjectName: sqlSubject,
    majorTopic: "SQL 기본",
    detailTopic: "표준 조인",
    summary:
      "표준 조인은 ANSI SQL 형식의 JOIN 문법이다. NATURAL JOIN, USING, ON, CROSS JOIN, OUTER JOIN 문법 차이를 결과와 함께 이해해야 한다.",
    keyPoints: [
      "ON 절은 조인 조건을 자유롭게 명시하며 컬럼명이 달라도 사용할 수 있다.",
      "USING은 양쪽 테이블에 같은 이름의 조인 컬럼이 있을 때 사용한다.",
      "NATURAL JOIN은 같은 이름의 모든 컬럼으로 자동 조인하므로 의도하지 않은 결과가 나올 수 있다.",
      "CROSS JOIN은 카티션 곱을 명시적으로 만든다.",
      "FULL OUTER JOIN은 양쪽 테이블의 미매칭 행을 모두 보존한다."
    ],
    examTrap:
      "NATURAL JOIN이 항상 안전하다는 설명은 틀리다. 같은 이름의 불필요한 컬럼까지 조인 조건이 될 수 있다.",
    oracleAngle:
      "튜닝 관점에서는 표준 조인 문법 자체보다 옵티마이저가 변환한 조인 순서, 조인 방식, 접근 경로를 실행계획에서 확인한다."
  },
  {
    id: "sql-subquery",
    subjectId: "sql-basic",
    subjectName: sqlSubject,
    majorTopic: "SQL 활용",
    detailTopic: "서브쿼리",
    summary:
      "서브쿼리는 SQL 안에 포함된 또 다른 SELECT다. 단일행, 다중행, 다중컬럼, 상호연관 서브쿼리의 결과 조건과 오류 상황을 구분해야 한다.",
    keyPoints: [
      "단일행 서브쿼리는 =, <, > 같은 단일행 비교 연산자와 사용하고 결과가 2건 이상이면 오류가 난다.",
      "다중행 서브쿼리는 IN, ANY, ALL, EXISTS와 함께 사용한다.",
      "상호연관 서브쿼리는 바깥 쿼리의 값을 참조하며 행마다 평가될 수 있다.",
      "EXISTS는 서브쿼리 결과의 존재 여부를 보고, SELECT 목록 자체는 중요하지 않다.",
      "NOT EXISTS는 NULL 영향이 적어 NOT IN보다 안전한 경우가 많다."
    ],
    examTrap:
      "NOT IN 서브쿼리 결과에 NULL이 포함되면 전체 조건이 UNKNOWN이 되어 원하는 결과가 나오지 않을 수 있다.",
    oracleAngle:
      "옵티마이저는 서브쿼리를 세미 조인, 안티 조인, 뷰 병합 등으로 변환할 수 있다. 변환 여부가 성능을 좌우한다."
  },
  {
    id: "sql-set-operators",
    subjectId: "sql-basic",
    subjectName: sqlSubject,
    majorTopic: "SQL 활용",
    detailTopic: "집합연산자",
    summary:
      "집합연산자는 여러 SELECT 결과를 행 집합으로 결합한다. UNION, UNION ALL, INTERSECT, MINUS의 중복 처리와 정렬 위치가 핵심이다.",
    keyPoints: [
      "UNION은 중복을 제거하고 UNION ALL은 중복을 유지한다.",
      "INTERSECT는 교집합, MINUS는 앞 SELECT에서 뒤 SELECT를 뺀 차집합이다.",
      "각 SELECT의 컬럼 개수와 대응 데이터 타입이 맞아야 한다.",
      "ORDER BY는 전체 집합연산 결과의 마지막에 한 번만 쓰는 것이 기본이다.",
      "중복 제거가 필요한 집합연산은 정렬 또는 해시 비용이 발생할 수 있다."
    ],
    examTrap:
      "UNION과 UNION ALL의 결과 건수 차이를 묻는 표 문제가 많다. 중복 행을 직접 세어야 한다.",
    oracleAngle:
      "성능상 중복 제거가 필요 없다면 UNION ALL이 유리하다. 불필요한 SORT UNIQUE를 피하는 것이 튜닝 포인트다."
  },
  {
    id: "sql-group-functions",
    subjectId: "sql-basic",
    subjectName: sqlSubject,
    majorTopic: "SQL 활용",
    detailTopic: "그룹 함수",
    summary:
      "그룹 함수는 집계 결과를 확장하는 ROLLUP, CUBE, GROUPING SETS 등을 포함한다. 소계, 총계, GROUPING 함수 결과를 표로 판단하는 문제가 자주 나온다.",
    keyPoints: [
      "ROLLUP은 지정한 컬럼 순서에 따라 계층적 소계와 총계를 만든다.",
      "CUBE는 가능한 모든 조합의 소계를 만든다.",
      "GROUPING SETS는 필요한 그룹 조합만 명시적으로 만든다.",
      "GROUPING 함수는 해당 컬럼이 집계로 생성된 NULL인지 실제 NULL인지 구분한다.",
      "GROUPING_ID는 여러 GROUPING 결과를 비트 조합으로 표현한다."
    ],
    examTrap:
      "ROLLUP(a,b)와 ROLLUP(b,a)는 소계 행 구성이 다르다. 컬럼 순서가 문제의 핵심이다.",
    oracleAngle:
      "대량 리포트 SQL에서 ROLLUP/CUBE는 여러 번 스캔하는 UNION ALL 집계를 한 번의 집계로 대체할 수 있다."
  },
  {
    id: "sql-window-functions",
    subjectId: "sql-basic",
    subjectName: sqlSubject,
    majorTopic: "SQL 활용",
    detailTopic: "윈도우 함수",
    summary:
      "윈도우 함수는 행을 유지한 채 파티션별 순위, 누적, 이동 집계를 계산한다. PARTITION BY, ORDER BY, WINDOWING 절의 의미를 구분해야 한다.",
    keyPoints: [
      "RANK는 동순위 후 순번을 건너뛰고, DENSE_RANK는 건너뛰지 않는다.",
      "ROW_NUMBER는 같은 정렬 값에도 고유한 순번을 부여한다.",
      "SUM() OVER(PARTITION BY ... ORDER BY ...)는 누적 합계 문제로 자주 나온다.",
      "LAG, LEAD는 이전 행과 다음 행 값을 참조한다.",
      "ROWS는 물리적 행 기준, RANGE는 정렬 값의 논리적 범위 기준이다."
    ],
    examTrap:
      "RANK와 DENSE_RANK의 동순위 처리 차이, ROWS와 RANGE의 누적 범위 차이는 표 계산 문제에서 자주 틀린다.",
    oracleAngle:
      "분석 함수는 셀프조인이나 상호연관 서브쿼리를 줄여 성능을 개선할 수 있지만, 정렬 비용을 반드시 고려해야 한다."
  },
  {
    id: "sql-top-n",
    subjectId: "sql-basic",
    subjectName: sqlSubject,
    majorTopic: "SQL 활용",
    detailTopic: "Top N 쿼리",
    summary:
      "Top N 쿼리는 정렬된 결과 중 상위 N건을 조회한다. Oracle의 ROWNUM 처리 순서와 ROW_NUMBER, FETCH FIRST의 차이가 핵심이다.",
    keyPoints: [
      "ROWNUM은 행이 반환되는 시점에 부여되므로 ORDER BY 이후 Top-N을 하려면 인라인 뷰가 필요하다.",
      "ROW_NUMBER() OVER(ORDER BY ...)는 정렬 기준에 따라 순번을 부여한 뒤 필터링할 수 있다.",
      "FETCH FIRST n ROWS ONLY는 정렬 이후 제한을 표현하는 표준적 문법이다.",
      "동순위를 포함해야 하면 RANK나 DENSE_RANK를 고려한다.",
      "페이징은 OFFSET이 커질수록 비용이 커질 수 있어 키셋 페이지네이션도 고려한다."
    ],
    examTrap:
      "WHERE ROWNUM <= 10 ORDER BY 점수 DESC는 점수 상위 10건이 아닐 수 있다. 정렬을 먼저 만든 뒤 ROWNUM을 적용한다.",
    oracleAngle:
      "실행계획에서 STOPKEY가 나타나면 필요한 상위 건수만 처리하는 최적화가 적용될 수 있다."
  },
  {
    id: "sql-hierarchical-self-join",
    subjectId: "sql-basic",
    subjectName: sqlSubject,
    majorTopic: "SQL 활용",
    detailTopic: "계층형 질의와 셀프 조인",
    summary:
      "계층형 질의는 부모-자식 구조를 탐색하고 셀프 조인은 같은 테이블 내부 관계를 조인한다. START WITH, CONNECT BY, PRIOR의 방향이 중요하다.",
    keyPoints: [
      "START WITH는 계층 탐색의 시작 행을 지정한다.",
      "CONNECT BY PRIOR 부모컬럼 = 자식컬럼 형태에 따라 위에서 아래 또는 아래에서 위로 탐색 방향이 결정된다.",
      "LEVEL은 루트부터의 계층 깊이를 나타낸다.",
      "SYS_CONNECT_BY_PATH는 경로 문자열을 만들고, CONNECT_BY_ISLEAF는 리프 노드 여부를 나타낸다.",
      "셀프 조인은 조직도, 추천인, 선후행 관계처럼 같은 엔터티 안의 관계를 표현한다."
    ],
    examTrap:
      "PRIOR의 위치가 바뀌면 탐색 방향이 바뀐다. 예시 데이터를 직접 두세 단계 따라가며 판단한다.",
    oracleAngle:
      "Oracle 계층형 질의는 SQLP에서 자주 다루는 고유 영역이다. 재귀 WITH와 CONNECT BY 문법 차이도 함께 알아두면 좋다."
  },
  {
    id: "sql-pivot-unpivot",
    subjectId: "sql-basic",
    subjectName: sqlSubject,
    majorTopic: "SQL 활용",
    detailTopic: "PIVOT 절과 UNPIVOT 절",
    summary:
      "PIVOT은 행 값을 컬럼으로 회전하고 UNPIVOT은 컬럼을 행으로 회전한다. 리포트 형태 변환과 집계 기준을 이해하는 문제가 나온다.",
    keyPoints: [
      "PIVOT은 집계 함수와 FOR 절의 값 목록을 이용해 행을 컬럼으로 변환한다.",
      "UNPIVOT은 여러 컬럼을 속성명과 값 행으로 펼친다.",
      "PIVOT에서 명시하지 않은 컬럼은 암묵적인 그룹 기준이 될 수 있다.",
      "값 목록과 별칭에 따라 결과 컬럼명이 달라진다.",
      "UNPIVOT은 기본적으로 NULL 값을 제외할 수 있어 INCLUDE NULLS 여부를 확인한다."
    ],
    examTrap:
      "PIVOT 결과의 그룹 기준을 놓치면 행 수 예측을 틀린다. PIVOT 절 밖에 남은 컬럼을 확인한다.",
    oracleAngle:
      "리포트 SQL에서 PIVOT은 가독성을 높이지만 동적 컬럼이 필요하면 동적 SQL이나 조건부 집계를 검토해야 한다."
  },
  {
    id: "sql-regexp",
    subjectId: "sql-basic",
    subjectName: sqlSubject,
    majorTopic: "SQL 활용",
    detailTopic: "정규표현식",
    summary:
      "정규표현식은 문자열 패턴 검색과 치환에 사용된다. REGEXP_LIKE, REGEXP_REPLACE, REGEXP_SUBSTR의 기본 패턴 의미가 출제된다.",
    keyPoints: [
      "^는 문자열 시작, $는 문자열 끝, .은 임의의 한 문자, *는 0회 이상, +는 1회 이상을 뜻한다.",
      "[0-9], [A-Z]처럼 문자 범위를 지정할 수 있다.",
      "REGEXP_LIKE는 WHERE 절에서 패턴 만족 여부를 검사한다.",
      "REGEXP_REPLACE는 패턴에 맞는 부분을 치환하고, REGEXP_SUBSTR은 패턴에 맞는 부분 문자열을 반환한다.",
      "단순 LIKE보다 표현력은 높지만 비용이 커질 수 있다."
    ],
    examTrap:
      "LIKE의 %와 정규표현식의 *는 의미가 다르다. *는 바로 앞 패턴의 0회 이상 반복이다.",
    oracleAngle:
      "대량 테이블에서 정규표현식 조건은 인덱스를 활용하기 어렵다. 가능하면 전처리 컬럼이나 단순 조건으로 좁힌 뒤 적용한다."
  },
  {
    id: "sql-dml",
    subjectId: "sql-basic",
    subjectName: sqlSubject,
    majorTopic: "관리 구문",
    detailTopic: "DML",
    summary:
      "DML은 데이터를 조회, 입력, 수정, 삭제하는 명령이다. INSERT, UPDATE, DELETE, MERGE의 문법과 트랜잭션 적용 여부를 구분한다.",
    keyPoints: [
      "INSERT는 단일 행 입력과 서브쿼리 기반 다중 행 입력이 가능하다.",
      "UPDATE와 DELETE에서 WHERE 절을 생략하면 대상 테이블의 모든 행이 영향을 받는다.",
      "MERGE는 조건에 따라 UPDATE와 INSERT를 한 문장으로 처리한다.",
      "DML 결과는 COMMIT 전까지 ROLLBACK 가능하다.",
      "무결성 제약조건 위반 시 DML은 실패한다."
    ],
    examTrap:
      "DELETE는 DML이므로 ROLLBACK 가능하지만 TRUNCATE는 DDL 성격이라 일반적으로 되돌리기 어렵다는 차이를 기억한다.",
    oracleAngle:
      "대량 DML은 undo, redo, 인덱스 유지, 트리거 비용이 크다. 배치 튜닝에서는 커밋 단위와 인덱스 전략을 함께 본다."
  },
  {
    id: "sql-tcl",
    subjectId: "sql-basic",
    subjectName: sqlSubject,
    majorTopic: "관리 구문",
    detailTopic: "TCL",
    summary:
      "TCL은 트랜잭션을 제어하는 COMMIT, ROLLBACK, SAVEPOINT 명령이다. 데이터 변경의 확정과 취소 범위를 이해해야 한다.",
    keyPoints: [
      "COMMIT은 현재 트랜잭션의 변경 내용을 영구 반영한다.",
      "ROLLBACK은 마지막 COMMIT 이후 변경을 취소한다.",
      "SAVEPOINT는 트랜잭션 내부의 부분 취소 지점을 만든다.",
      "DDL 수행 시 암시적 COMMIT이 발생하는 DBMS 특성을 주의한다.",
      "트랜잭션은 ACID 특성으로 설명된다."
    ],
    examTrap:
      "SAVEPOINT로 돌아가도 트랜잭션이 끝나는 것은 아니다. 최종 반영은 COMMIT으로 결정된다.",
    oracleAngle:
      "장시간 트랜잭션은 undo 공간과 lock 대기를 키운다. SQLP 튜닝에서는 커밋 단위와 일관성 요구사항을 함께 고려한다."
  },
  {
    id: "sql-ddl",
    subjectId: "sql-basic",
    subjectName: sqlSubject,
    majorTopic: "관리 구문",
    detailTopic: "DDL",
    summary:
      "DDL은 데이터베이스 객체를 생성, 변경, 삭제하는 명령이다. CREATE, ALTER, DROP, TRUNCATE, RENAME의 성격과 자동 커밋 여부가 중요하다.",
    keyPoints: [
      "CREATE는 객체를 생성하고 ALTER는 구조를 변경한다.",
      "DROP은 객체를 삭제하고, TRUNCATE는 테이블 구조는 남긴 채 데이터를 빠르게 제거한다.",
      "DDL은 일반적으로 암시적 COMMIT을 발생시킨다.",
      "제약조건은 데이터 무결성을 보장하기 위한 객체 정의 요소다.",
      "뷰, 인덱스, 시퀀스, 시노님 같은 객체도 DDL로 관리한다."
    ],
    examTrap:
      "DELETE와 TRUNCATE의 차이는 자주 나온다. DELETE는 조건 삭제와 롤백 가능성이 있고, TRUNCATE는 전체 제거와 DDL 성격을 가진다.",
    oracleAngle:
      "DDL은 라이브러리 캐시 무효화와 잠금을 유발할 수 있어 운영 중 수행 시 영향 범위를 고려해야 한다."
  },
  {
    id: "sql-dcl",
    subjectId: "sql-basic",
    subjectName: sqlSubject,
    majorTopic: "관리 구문",
    detailTopic: "DCL",
    summary:
      "DCL은 권한을 부여하고 회수하는 GRANT, REVOKE 명령이다. 사용자, 역할, 객체 권한과 시스템 권한의 차이를 이해한다.",
    keyPoints: [
      "GRANT는 권한을 부여하고 REVOKE는 권한을 회수한다.",
      "시스템 권한은 데이터베이스 작업 수행 권한이고, 객체 권한은 특정 객체에 대한 SELECT, INSERT 같은 권한이다.",
      "ROLE은 여러 권한을 묶어 관리하는 단위다.",
      "WITH GRANT OPTION은 부여받은 객체 권한을 다른 사용자에게 다시 부여할 수 있게 한다.",
      "권한 설계는 최소 권한 원칙을 따르는 것이 기본이다."
    ],
    examTrap:
      "권한을 회수했을 때 연쇄적으로 회수되는 범위는 DBMS와 권한 부여 방식에 따라 달라질 수 있으므로 지문의 조건을 확인한다.",
    oracleAngle:
      "운영 SQL 튜닝 도구 접근에도 권한이 필요하다. 실행계획, 트레이스, 동적 성능 뷰 조회 권한은 실무에서 자주 막히는 지점이다."
  },
  {
    id: "tuning-architecture",
    subjectId: "tuning",
    subjectName: tuningSubject,
    majorTopic: "SQL 수행 구조",
    detailTopic: "데이터베이스 아키텍처",
    summary:
      "데이터베이스 아키텍처는 SQL이 메모리, 프로세스, 디스크를 거쳐 처리되는 구조다. Oracle 기준으로 SGA, PGA, 서버 프로세스, 백그라운드 프로세스의 역할을 이해한다.",
    keyPoints: [
      "SGA는 여러 프로세스가 공유하는 메모리 영역이고, PGA는 서버 프로세스별 작업 메모리다.",
      "버퍼 캐시는 데이터 블록을 캐싱하고, 라이브러리 캐시는 SQL과 실행계획을 공유한다.",
      "DBWR, LGWR, CKPT 같은 백그라운드 프로세스는 쓰기, 로그, 체크포인트와 관련된다.",
      "SQL 성능은 CPU, 메모리, I/O, 네트워크, lock 대기 중 병목이 어디인지에 따라 접근이 달라진다.",
      "논리 I/O와 물리 I/O의 차이를 알아야 실행계획과 트레이스 결과를 해석할 수 있다."
    ],
    examTrap:
      "버퍼 캐시에 있으면 디스크 I/O가 줄지만 논리 I/O가 없어지는 것은 아니다. 논리 I/O도 CPU와 래치 비용을 유발한다.",
    oracleAngle:
      "Oracle 튜닝은 SQL 텍스트만 보지 않고 버퍼 캐시, 라이브러리 캐시, PGA 정렬 영역, redo/undo까지 함께 본다."
  },
  {
    id: "tuning-sql-processing",
    subjectId: "tuning",
    subjectName: tuningSubject,
    majorTopic: "SQL 수행 구조",
    detailTopic: "SQL 처리 과정",
    summary:
      "SQL 처리 과정은 파싱, 최적화, 로우 소스 생성, 실행으로 이해한다. 하드 파싱과 소프트 파싱, 바인드 변수, 커서 공유가 SQLP의 핵심이다.",
    keyPoints: [
      "파싱 단계에서는 문법, 의미, 권한을 확인하고 공유 가능한 커서를 찾는다.",
      "하드 파싱은 최적화와 실행계획 생성을 포함해 비용이 크고, 소프트 파싱은 기존 커서를 재사용한다.",
      "옵티마이저는 통계정보와 비용 모델을 바탕으로 실행계획 후보를 비교한다.",
      "로우 소스는 실행계획의 각 단계가 행을 생산하는 연산 단위다.",
      "바인드 변수 사용은 파싱 부하와 라이브러리 캐시 경합을 줄이는 대표 전략이다."
    ],
    examTrap:
      "SQL 텍스트가 한 글자만 달라도 다른 커서가 될 수 있다. 리터럴을 계속 바꾸는 SQL은 하드 파싱 증가의 원인이 된다.",
    oracleAngle:
      "실기에서는 힌트를 통해 원하는 실행계획을 고정하기도 하지만, 통계정보와 바인드 피킹 영향도 함께 고려해야 한다."
  },
  {
    id: "tuning-io",
    subjectId: "tuning",
    subjectName: tuningSubject,
    majorTopic: "SQL 수행 구조",
    detailTopic: "데이터베이스 I/O 메커니즘",
    summary:
      "I/O 튜닝은 SQLP 3과목의 중심이다. 블록 단위 접근, 인덱스 경유 테이블 액세스, 랜덤 I/O와 순차 I/O의 차이를 이해한다.",
    keyPoints: [
      "데이터베이스는 행이 아니라 블록 단위로 데이터를 읽는다.",
      "논리 I/O는 메모리 버퍼에서 블록을 읽는 것이고, 물리 I/O는 디스크에서 블록을 읽는 것이다.",
      "인덱스 스캔 후 테이블 랜덤 액세스가 많으면 소량 조회에는 유리하지만 대량 조회에는 불리할 수 있다.",
      "Full Table Scan은 항상 나쁜 것이 아니라 대량 범위 조회에서는 더 효율적일 수 있다.",
      "클러스터링 팩터는 인덱스 순서와 테이블 저장 순서의 유사도를 나타내며 테이블 액세스 비용에 영향을 준다."
    ],
    examTrap:
      "인덱스를 사용하면 무조건 빠르다는 선지는 틀리다. 선택도, 테이블 액세스 횟수, 읽어야 할 블록 수를 같이 본다.",
    oracleAngle:
      "실행계획에서 consistent gets, physical reads, table access by index rowid 수치를 보고 병목을 판단한다."
  },
  {
    id: "tuning-explain-plan",
    subjectId: "tuning",
    subjectName: tuningSubject,
    majorTopic: "SQL 분석 도구",
    detailTopic: "예상 실행계획",
    summary:
      "예상 실행계획은 옵티마이저가 선택할 것으로 예상한 접근 경로와 조인 방법을 보여준다. 실제 수행 통계와 다를 수 있다는 점이 중요하다.",
    keyPoints: [
      "실행계획은 위에서 아래로만 읽지 않고, 들여쓰기와 자식 연산 관계를 보며 로우 소스 흐름을 해석한다.",
      "ACCESS PREDICATE는 인덱스 탐색 조건, FILTER PREDICATE는 읽은 뒤 걸러내는 조건으로 이해한다.",
      "Rows, Cost, Bytes는 통계 기반 추정치이므로 실제 건수와 차이가 날 수 있다.",
      "인덱스 스캔, 테이블 액세스, 조인 방식, 정렬 작업 유무를 우선 확인한다.",
      "예상 실행계획만으로는 실제 병목을 확정할 수 없고 실행 통계가 필요하다."
    ],
    examTrap:
      "Cost가 낮다고 항상 빠르다고 단정하면 안 된다. 통계 오류, 바인드 값, 실제 반환 건수 차이를 고려한다.",
    oracleAngle:
      "Oracle에서는 DBMS_XPLAN.DISPLAY_CURSOR로 실제 실행 통계를 포함한 계획을 보는 것이 실무 분석에 더 유용하다."
  },
  {
    id: "tuning-sql-trace",
    subjectId: "tuning",
    subjectName: tuningSubject,
    majorTopic: "SQL 분석 도구",
    detailTopic: "SQL 트레이스",
    summary:
      "SQL 트레이스는 실제 수행 시간, 대기 이벤트, 파싱/실행/페치 통계를 확인하는 도구다. 실행계획보다 더 현실적인 병목 분석 근거를 제공한다.",
    keyPoints: [
      "Trace/TKPROF 결과에서 parse, execute, fetch 단계별 CPU, elapsed, disk, query, current 수치를 본다.",
      "fetch 횟수와 반환 행 수는 애플리케이션 Call 비용과 연결된다.",
      "대기 이벤트를 통해 I/O 대기, lock 대기, 네트워크 대기 등을 구분한다.",
      "실제 row source 통계가 있으면 예상 Rows와 실제 Rows 차이를 확인할 수 있다.",
      "트레이스는 부하가 있으므로 필요한 세션과 구간에 제한해 사용한다."
    ],
    examTrap:
      "실행계획만 보고 병목을 확정하는 선지는 위험하다. 실제 수행 통계와 대기 이벤트가 함께 있어야 정확하다.",
    oracleAngle:
      "SQLP 실기형 해설에서는 SQL 트레이스의 consistent gets와 elapsed time 변화를 개선 전후 비교 근거로 제시하면 좋다."
  },
  {
    id: "tuning-response-time",
    subjectId: "tuning",
    subjectName: tuningSubject,
    majorTopic: "SQL 분석 도구",
    detailTopic: "응답 시간 분석",
    summary:
      "응답 시간 분석은 전체 시간을 CPU 사용 시간과 대기 시간으로 나누어 병목을 찾는 방식이다. 감이 아니라 시간 비중으로 튜닝 대상을 정한다.",
    keyPoints: [
      "응답 시간은 CPU time과 wait time의 합으로 본다.",
      "대기 이벤트의 종류와 비중을 보면 I/O, lock, 네트워크, 래치 중 어디가 병목인지 추정할 수 있다.",
      "가장 오래 걸리는 SQL 또는 가장 많이 수행되는 SQL이 우선 튜닝 대상이 된다.",
      "평균 시간만 보면 안 되고 총 수행 횟수와 총 소요 시간을 함께 본다.",
      "부분 최적화보다 전체 업무 응답 시간에 미치는 영향이 큰 구간을 우선한다."
    ],
    examTrap:
      "한 번 실행 시간이 긴 SQL보다 짧지만 수만 번 반복되는 SQL이 전체 병목일 수 있다. 총량 기준으로 본다.",
    oracleAngle:
      "AWR, ASH, SQL Monitor 같은 Oracle 도구는 응답 시간 분석의 대표적인 근거 자료다."
  },
  {
    id: "tuning-index-basic",
    subjectId: "tuning",
    subjectName: tuningSubject,
    majorTopic: "인덱스 튜닝",
    detailTopic: "인덱스 기본 원리",
    summary:
      "인덱스는 테이블 데이터를 빠르게 찾기 위한 별도 구조다. B-tree 인덱스의 루트, 브랜치, 리프 블록과 Range Scan 원리를 이해해야 한다.",
    keyPoints: [
      "B-tree 인덱스는 루트에서 브랜치를 거쳐 리프 블록으로 탐색한다.",
      "리프 블록은 키 순서로 정렬되어 있어 범위 조건 처리에 유리하다.",
      "인덱스 스캔 후 필요한 컬럼이 테이블에 있으면 ROWID로 테이블을 다시 액세스한다.",
      "선택도가 높은 조건은 인덱스 사용에 유리하고, 선택도가 낮은 조건은 Full Scan이 나을 수 있다.",
      "인덱스는 조회 성능을 높일 수 있지만 DML 시 유지 비용이 발생한다."
    ],
    examTrap:
      "인덱스가 많을수록 항상 좋다는 설명은 틀리다. DML 부하와 저장 공간, 옵티마이저 선택 혼란을 고려한다.",
    oracleAngle:
      "Index Range Scan, Unique Scan, Full Scan, Fast Full Scan의 차이를 실행계획에서 구분해야 한다."
  },
  {
    id: "tuning-table-access",
    subjectId: "tuning",
    subjectName: tuningSubject,
    majorTopic: "인덱스 튜닝",
    detailTopic: "테이블 엑세스 최소화",
    summary:
      "인덱스를 타도 테이블 랜덤 액세스가 많으면 느릴 수 있다. SQLP에서는 인덱스 컬럼 구성과 커버링, 클러스터링 팩터로 테이블 액세스를 줄이는 전략이 중요하다.",
    keyPoints: [
      "인덱스에서 찾은 ROWID로 테이블 블록을 반복 방문하는 작업이 랜덤 I/O를 만든다.",
      "조회 컬럼을 인덱스에 포함하면 테이블 액세스를 줄일 수 있지만 인덱스 크기와 DML 비용이 증가한다.",
      "필터 조건이 인덱스에 포함되지 않으면 많은 ROWID를 찾아놓고 테이블에서 버릴 수 있다.",
      "클러스터링 팩터가 좋으면 인덱스 순서대로 읽을 때 테이블 블록 재방문이 줄어든다.",
      "부분 범위 처리와 Top-N에서는 정렬된 인덱스를 이용해 초기에 중단하는 전략이 유리하다."
    ],
    examTrap:
      "인덱스 스캔 건수가 적어 보여도 테이블 액세스가 많으면 전체 비용이 클 수 있다. 실행계획의 TABLE ACCESS BY INDEX ROWID를 확인한다.",
    oracleAngle:
      "Oracle 실기에서는 INDEX 힌트만 쓰는 것이 아니라 필요한 컬럼, 액세스 조건, 필터 조건을 맞춰 인덱스 설계를 설명해야 한다."
  },
  {
    id: "tuning-index-scan-efficiency",
    subjectId: "tuning",
    subjectName: tuningSubject,
    majorTopic: "인덱스 튜닝",
    detailTopic: "인덱스 스캔 효율화",
    summary:
      "인덱스 스캔 효율은 필요한 범위만 정확히 스캔하는지에 달려 있다. 선두 컬럼, 등치 조건, 범위 조건, 함수 사용 여부가 핵심이다.",
    keyPoints: [
      "복합 인덱스는 선두 컬럼 조건이 있어야 효율적으로 Range Scan하기 쉽다.",
      "등치 조건은 인덱스 탐색 범위를 크게 줄이고, 범위 조건 이후 컬럼은 액세스 범위 축소 효과가 제한될 수 있다.",
      "컬럼에 함수를 적용하면 일반 인덱스 액세스 조건으로 쓰기 어렵다.",
      "LIKE 'ABC%'는 범위 탐색이 가능하지만 LIKE '%ABC'는 일반 B-tree 인덱스 활용이 어렵다.",
      "OR 조건은 UNION ALL 분리, IN-list 처리, Bitmap 변환 등 다양한 대안이 있다."
    ],
    examTrap:
      "인덱스 컬럼이 WHERE 절에 모두 있다고 해서 효율적인 것은 아니다. 선두 컬럼과 조건 형태, 범위 조건 위치를 먼저 본다.",
    oracleAngle:
      "실행계획 Predicate Information에서 access와 filter로 나뉘는 조건을 확인하면 인덱스 스캔 효율을 판단할 수 있다."
  },
  {
    id: "tuning-index-design",
    subjectId: "tuning",
    subjectName: tuningSubject,
    majorTopic: "인덱스 튜닝",
    detailTopic: "인덱스 설계",
    summary:
      "인덱스 설계는 자주 수행되는 SQL의 조건, 조인, 정렬, 집계를 기준으로 컬럼 순서를 결정하는 작업이다. 단일 SQL보다 전체 workload를 봐야 한다.",
    keyPoints: [
      "조건절 등치 컬럼, 범위 컬럼, 정렬/그룹 컬럼, 조회 컬럼의 순서를 종합해 설계한다.",
      "선택도가 높은 컬럼이 항상 앞이라는 단순 공식은 위험하며, 등치 조건 여부와 SQL 패턴이 더 중요할 수 있다.",
      "조인 컬럼 인덱스는 NL 조인의 inner table 접근 성능에 중요하다.",
      "ORDER BY와 GROUP BY를 인덱스 순서로 처리하면 정렬 비용을 줄일 수 있다.",
      "비슷한 인덱스가 너무 많으면 DML 비용과 관리 비용이 증가하므로 통합 가능성을 검토한다."
    ],
    examTrap:
      "컬럼 선택도만 보고 인덱스 순서를 정하는 보기는 조심한다. 등치 조건, 범위 조건, 정렬 생략 가능성까지 본다.",
    oracleAngle:
      "실기 답안에서는 INDEX 힌트와 함께 어떤 인덱스를 새로 만들거나 어떤 기존 인덱스를 활용할지 근거를 제시해야 한다."
  },
  {
    id: "tuning-nl-join",
    subjectId: "tuning",
    subjectName: tuningSubject,
    majorTopic: "조인 튜닝",
    detailTopic: "NL 조인",
    summary:
      "Nested Loops 조인은 선행 테이블의 각 행마다 후행 테이블을 반복 탐색한다. 소량 선행 집합과 후행 테이블 조인 인덱스가 있을 때 유리하다.",
    keyPoints: [
      "NL 조인은 선행 집합 건수가 작고 후행 테이블 접근이 인덱스로 빠를 때 효율적이다.",
      "후행 테이블 조인 컬럼에 적절한 인덱스가 없으면 반복 Full Scan이 발생할 수 있다.",
      "응답 시간이 빠른 부분 범위 처리에 유리한 경우가 많다.",
      "선행 테이블 선택이 잘못되면 반복 횟수가 폭증한다.",
      "LEADING, USE_NL, INDEX 힌트 조합으로 원하는 NL 계획을 유도할 수 있다."
    ],
    examTrap:
      "NL 조인이 항상 빠른 것은 아니다. 선행 결과가 대량이면 후행 인덱스가 있어도 랜덤 액세스가 폭증한다.",
    oracleAngle:
      "실기에서 USE_NL만 쓰고 inner table 접근 인덱스를 맞추지 않으면 계획 의도가 불완전하다."
  },
  {
    id: "tuning-sort-merge-join",
    subjectId: "tuning",
    subjectName: tuningSubject,
    majorTopic: "조인 튜닝",
    detailTopic: "소트 머지 조인",
    summary:
      "소트 머지 조인은 양쪽 집합을 조인 키로 정렬한 뒤 병합한다. 대량 조인이나 비등가 조인에서 고려되지만 정렬 비용이 핵심이다.",
    keyPoints: [
      "양쪽 입력을 조인 키 기준으로 정렬한 뒤 순차적으로 병합한다.",
      "조인 컬럼에 적절한 정렬 상태가 이미 있으면 정렬 비용이 줄 수 있다.",
      "등가 조인뿐 아니라 일부 비등가 조인에서도 사용할 수 있다.",
      "정렬 대상이 크면 PGA 부족과 TEMP 사용으로 성능이 떨어진다.",
      "USE_MERGE 힌트로 유도할 수 있다."
    ],
    examTrap:
      "소트 머지 조인은 인덱스가 없을 때 무조건 선택되는 방식이 아니다. 정렬 비용과 입력 집합 크기를 함께 본다.",
    oracleAngle:
      "실행계획에서 SORT JOIN 단계와 TEMP 사용 여부를 확인해 병목을 판단한다."
  },
  {
    id: "tuning-hash-join",
    subjectId: "tuning",
    subjectName: tuningSubject,
    majorTopic: "조인 튜닝",
    detailTopic: "해시 조인",
    summary:
      "해시 조인은 작은 집합으로 해시 테이블을 만들고 큰 집합을 탐색해 조인한다. 대량 등가 조인에서 유리하지만 메모리와 빌드 입력 선택이 중요하다.",
    keyPoints: [
      "작은 집합을 build input으로 삼아 해시 테이블을 만들고, 큰 집합을 probe input으로 탐색한다.",
      "주로 등가 조인에서 사용된다.",
      "대량 조인에서는 NL 조인보다 랜덤 액세스가 적어 유리할 수 있다.",
      "메모리가 부족하면 해시 영역이 디스크로 spill되어 TEMP I/O가 발생한다.",
      "LEADING, USE_HASH, FULL 힌트 조합으로 대량 조인 계획을 유도할 수 있다."
    ],
    examTrap:
      "작은 테이블이 항상 build input이라고 단정하지 않는다. 필터 후 예상 건수와 통계정보 기준으로 판단한다.",
    oracleAngle:
      "실기에서는 해시 조인을 유도할 때 조인 입력 순서와 전체 스캔 또는 파티션 pruning 여부를 함께 설명한다."
  },
  {
    id: "tuning-scalar-subquery",
    subjectId: "tuning",
    subjectName: tuningSubject,
    majorTopic: "조인 튜닝",
    detailTopic: "스칼라 서브쿼리",
    summary:
      "스칼라 서브쿼리는 한 행에 대해 하나의 값을 반환하는 서브쿼리다. 반복 수행 비용, 캐싱, 조인 변환 가능성을 이해해야 한다.",
    keyPoints: [
      "스칼라 서브쿼리는 SELECT 절에서 코드명 조회나 집계 값 조회에 자주 사용된다.",
      "상관 스칼라 서브쿼리는 외부 행마다 수행될 수 있어 대량 데이터에서 비용이 커질 수 있다.",
      "결과 캐싱이 적용될 수 있지만 입력 값 종류가 많으면 효과가 제한된다.",
      "동일 결과를 조인과 GROUP BY로 미리 집계해 결합하면 성능이 좋아지는 경우가 많다.",
      "서브쿼리가 둘 이상의 행을 반환하면 오류가 발생한다."
    ],
    examTrap:
      "스칼라 서브쿼리가 항상 조인보다 느리거나 항상 빠르다고 단정하지 않는다. 반복 횟수와 캐싱 가능성을 함께 본다.",
    oracleAngle:
      "Oracle 옵티마이저는 스칼라 서브쿼리를 조인으로 변환하거나 캐싱할 수 있다. 실행계획으로 실제 변환 여부를 확인한다."
  },
  {
    id: "tuning-advanced-join",
    subjectId: "tuning",
    subjectName: tuningSubject,
    majorTopic: "조인 튜닝",
    detailTopic: "고급 조인 기법",
    summary:
      "고급 조인 기법은 세미 조인, 안티 조인, 조인 제거, 아우터 조인 변환 등 옵티마이저 변환과 연결된다. 결과 보존 조건을 정확히 이해해야 한다.",
    keyPoints: [
      "EXISTS와 IN은 세미 조인으로 변환될 수 있으며, 매칭 존재 여부만 필요할 때 사용된다.",
      "NOT EXISTS와 NOT IN은 안티 조인과 관련되지만 NULL 처리 차이를 주의한다.",
      "불필요한 테이블은 제약조건과 컬럼 사용 여부에 따라 조인 제거될 수 있다.",
      "아우터 조인은 조건 위치에 따라 결과가 바뀌므로 변환 가능성이 제한된다.",
      "스타 조인, 파티션 와이즈 조인 같은 기법은 대용량 분석 SQL에서 중요하다."
    ],
    examTrap:
      "NOT IN과 NOT EXISTS를 무조건 같은 의미로 보면 틀린다. NULL이 들어오는 순간 결과가 달라질 수 있다.",
    oracleAngle:
      "실행계획에서 HASH JOIN SEMI, HASH JOIN ANTI 같은 연산을 보면 서브쿼리 변환이 적용된 것으로 이해한다."
  },
  {
    id: "tuning-optimizer-principle",
    subjectId: "tuning",
    subjectName: tuningSubject,
    majorTopic: "SQL 옵티마이저",
    detailTopic: "SQL 옵티마이징 원리",
    summary:
      "옵티마이저는 가능한 실행계획 중 비용이 낮은 계획을 선택한다. 통계정보, 선택도, 카디널리티, 비용 산정 원리를 이해해야 한다.",
    keyPoints: [
      "비용 기반 옵티마이저는 통계정보를 이용해 각 실행계획의 예상 비용을 계산한다.",
      "선택도는 조건을 만족할 것으로 예상되는 비율이고, 카디널리티는 예상 행 수다.",
      "통계정보가 오래되었거나 데이터 분포가 치우치면 잘못된 계획이 나올 수 있다.",
      "히스토그램은 컬럼 값 분포가 균등하지 않을 때 선택도 추정에 도움을 준다.",
      "힌트는 옵티마이저 선택을 유도하지만 잘못 쓰면 오히려 성능을 망칠 수 있다."
    ],
    examTrap:
      "옵티마이저가 항상 최적의 실제 계획을 고른다고 단정하면 안 된다. 통계와 바인드 값이 틀리면 선택도 추정도 틀린다.",
    oracleAngle:
      "SQLP 실기에서는 통계정보 오류, 히스토그램 필요성, 바인드 변수 영향까지 해설에 포함하면 튜닝 관점이 살아난다."
  },
  {
    id: "tuning-sql-sharing",
    subjectId: "tuning",
    subjectName: tuningSubject,
    majorTopic: "SQL 옵티마이저",
    detailTopic: "SQL 공유 및 재사용",
    summary:
      "SQL 공유는 동일 SQL이 기존 커서와 실행계획을 재사용하는 것이다. 하드 파싱을 줄이고 라이브러리 캐시 부하를 낮추는 것이 목적이다.",
    keyPoints: [
      "SQL 텍스트, 스키마, 권한, 환경 등이 맞아야 커서를 공유할 수 있다.",
      "바인드 변수는 리터럴 차이로 생기는 하드 파싱을 줄인다.",
      "소프트 파싱도 완전히 공짜는 아니므로 애플리케이션에서 커서 재사용을 고려한다.",
      "바인드 변수는 공유에는 유리하지만 값별 데이터 분포가 크게 다르면 계획 선택이 어려워질 수 있다.",
      "라이브러리 캐시 경합은 동시 접속이 많은 시스템에서 응답 시간 문제를 만든다."
    ],
    examTrap:
      "바인드 변수를 쓰면 모든 경우에 성능이 좋아진다는 설명은 과하다. 데이터 편차가 큰 조건에서는 적응형 커서 공유 같은 이슈가 있다.",
    oracleAngle:
      "Oracle의 bind peeking, adaptive cursor sharing은 SQL 공유와 실행계획 안정성 사이의 균형 문제로 자주 언급된다."
  },
  {
    id: "tuning-query-transformation",
    subjectId: "tuning",
    subjectName: tuningSubject,
    majorTopic: "SQL 옵티마이저",
    detailTopic: "쿼리 변환",
    summary:
      "쿼리 변환은 옵티마이저가 같은 결과를 내는 더 효율적인 형태로 SQL을 바꾸는 과정이다. 뷰 병합, 서브쿼리 언네스팅, 조건절 이행이 핵심이다.",
    keyPoints: [
      "뷰 병합은 인라인 뷰를 바깥 쿼리와 합쳐 더 넓은 최적화 기회를 만든다.",
      "서브쿼리 언네스팅은 서브쿼리를 조인 형태로 변환한다.",
      "조건절 이행은 조인 조건을 통해 한 테이블 조건을 다른 테이블로 전파한다.",
      "OR 확장, 조인 제거, 집계 뷰 변환 등도 쿼리 변환 범주에 포함될 수 있다.",
      "NO_MERGE, MATERIALIZE 같은 힌트는 변환을 제어할 때 사용된다."
    ],
    examTrap:
      "SQL에 적힌 순서대로만 실행된다고 생각하면 옵티마이저 문제를 틀린다. 논리적으로 같은 결과면 내부적으로 변환될 수 있다.",
    oracleAngle:
      "실기에서는 원하는 실행계획을 만들기 위해 변환을 허용할지 막을지 판단해야 한다. NO_MERGE 힌트는 자주 쓰이는 도구다."
  },
  {
    id: "tuning-sort",
    subjectId: "tuning",
    subjectName: tuningSubject,
    majorTopic: "고급 SQL 튜닝",
    detailTopic: "소트 튜닝",
    summary:
      "소트 튜닝은 ORDER BY, GROUP BY, DISTINCT, UNION, 윈도우 함수에서 발생하는 정렬 비용을 줄이는 것이다. 메모리와 TEMP 사용을 함께 본다.",
    keyPoints: [
      "정렬 대상 행 수와 행 크기가 클수록 비용이 커진다.",
      "인덱스 순서를 활용하면 SORT ORDER BY를 생략할 수 있다.",
      "불필요한 DISTINCT와 UNION은 정렬 또는 해시 중복 제거 비용을 만든다.",
      "Top-N은 정렬 전체를 끝내기보다 STOPKEY 같은 부분 처리 최적화를 노린다.",
      "PGA가 부족하면 TEMP I/O가 발생해 응답 시간이 급격히 늘 수 있다."
    ],
    examTrap:
      "ORDER BY를 없애면 빠르지만 결과 순서 요구사항도 사라진다. 요구사항을 만족하는 범위에서 정렬 비용을 줄여야 한다.",
    oracleAngle:
      "실행계획의 SORT ORDER BY, SORT GROUP BY, SORT UNIQUE와 V$TEMPSEG_USAGE 같은 TEMP 사용 지표를 함께 본다."
  },
  {
    id: "tuning-dml",
    subjectId: "tuning",
    subjectName: tuningSubject,
    majorTopic: "고급 SQL 튜닝",
    detailTopic: "DML 튜닝",
    summary:
      "DML 튜닝은 INSERT, UPDATE, DELETE, MERGE의 대량 처리 성능을 개선하는 영역이다. 인덱스, 제약조건, 트리거, redo/undo 비용이 중요하다.",
    keyPoints: [
      "대량 INSERT에서는 direct path insert, 병렬 처리, NOLOGGING 가능성을 검토할 수 있다.",
      "UPDATE/DELETE는 대상 행을 찾는 조건 인덱스와 변경 대상 인덱스 유지 비용을 함께 본다.",
      "인덱스가 많으면 DML마다 인덱스 갱신 비용이 증가한다.",
      "트리거와 외래키 제약은 DML 성능에 영향을 줄 수 있다.",
      "커밋을 너무 자주 하면 로그 동기화 비용이 커지고, 너무 드물면 undo와 lock 부담이 커진다."
    ],
    examTrap:
      "대량 DELETE를 무조건 한 문장으로 끝내는 것이 정답은 아니다. 업무 일관성, undo, lock, 배치 시간 창을 고려한다.",
    oracleAngle:
      "Oracle에서는 array processing, bulk bind, direct path, partition exchange 같은 기법이 대량 DML 튜닝의 핵심이다."
  },
  {
    id: "tuning-call-minimize",
    subjectId: "tuning",
    subjectName: tuningSubject,
    majorTopic: "고급 SQL 튜닝",
    detailTopic: "데이터베이스 Call 최소화",
    summary:
      "데이터베이스 Call 최소화는 애플리케이션과 DB 사이 왕복 횟수를 줄이는 튜닝이다. 한 건씩 반복 처리하는 방식은 SQLP에서 대표적인 개선 대상이다.",
    keyPoints: [
      "반복 루프 안에서 SQL을 계속 실행하면 parse, execute, fetch call이 폭증한다.",
      "가능하면 집합 기반 SQL 한 문장으로 처리한다.",
      "배열 처리와 bulk fetch/bulk bind는 네트워크 왕복과 call 횟수를 줄인다.",
      "SELECT N+1 패턴은 애플리케이션 성능 문제의 대표 사례다.",
      "필요한 컬럼만 조회하고 fetch size를 적절히 조정한다."
    ],
    examTrap:
      "SQL 한 번의 실행 시간만 보지 말고 수행 횟수를 곱한 전체 시간을 본다. 짧은 SQL도 수만 번이면 병목이다.",
    oracleAngle:
      "PL/SQL에서는 FORALL, BULK COLLECT가 call 최소화와 문맥 전환 비용 감소에 자주 쓰인다."
  },
  {
    id: "tuning-partitioning",
    subjectId: "tuning",
    subjectName: tuningSubject,
    majorTopic: "고급 SQL 튜닝",
    detailTopic: "파티셔닝",
    summary:
      "파티셔닝은 큰 테이블이나 인덱스를 논리적으로 분할해 관리성과 성능을 높이는 기법이다. 파티션 pruning과 로컬/글로벌 인덱스가 핵심이다.",
    keyPoints: [
      "Range, List, Hash, Composite 파티션 방식이 있다.",
      "파티션 키 조건이 있으면 필요한 파티션만 읽는 pruning이 가능하다.",
      "Local index는 파티션과 같은 단위로 관리되고, Global index는 전체 데이터를 대상으로 한다.",
      "대량 적재와 삭제는 파티션 exchange, truncate partition으로 효율화할 수 있다.",
      "파티션 키를 잘못 고르면 pruning 효과가 없어지고 관리만 복잡해진다."
    ],
    examTrap:
      "파티션 테이블이라고 항상 빠른 것은 아니다. SQL 조건이 파티션 키를 활용하지 못하면 전체 파티션을 읽을 수 있다.",
    oracleAngle:
      "실행계획의 PSTART, PSTOP을 확인하면 어떤 파티션을 읽는지 알 수 있다."
  },
  {
    id: "tuning-batch",
    subjectId: "tuning",
    subjectName: tuningSubject,
    majorTopic: "고급 SQL 튜닝",
    detailTopic: "대용량 배치 프로그램 튜닝",
    summary:
      "대용량 배치 튜닝은 제한된 시간 안에 많은 데이터를 안정적으로 처리하는 것이 목표다. 집합 처리, 병렬, 파티션, 커밋 단위, 실패 복구를 함께 설계한다.",
    keyPoints: [
      "행 단위 반복 처리보다 집합 기반 SQL로 처리 범위를 크게 줄인다.",
      "처리 대상 분할 기준을 정해 병렬화와 재시작을 쉽게 만든다.",
      "커밋 단위는 undo, redo, lock, 복구 가능성을 고려해 정한다.",
      "중간 결과 임시 테이블 사용은 비용과 관리 포인트를 함께 검토한다.",
      "배치 전후 통계정보, 인덱스 상태, 파티션 관리가 성능에 영향을 준다."
    ],
    examTrap:
      "병렬 처리만 늘리면 빨라진다는 설명은 위험하다. I/O 대역폭, lock 경합, TEMP, 로그 쓰기 병목이 함께 커질 수 있다.",
    oracleAngle:
      "Oracle 병렬 힌트는 강력하지만 제약 조건에서 병렬을 쓰지 말라고 하면 감점이다. 실기 지문 제약을 먼저 확인한다."
  },
  {
    id: "tuning-advanced-sql",
    subjectId: "tuning",
    subjectName: tuningSubject,
    majorTopic: "고급 SQL 튜닝",
    detailTopic: "고급 SQL 활용",
    summary:
      "고급 SQL 활용은 복잡한 요구사항을 절차식 반복 없이 SQL로 표현하는 능력이다. WITH, 분석 함수, 집계 확장, MERGE, 조건부 집계를 조합한다.",
    keyPoints: [
      "WITH 절은 복잡한 SQL을 단계별로 읽기 쉽게 만들고, 재사용 또는 물리화 여부가 성능에 영향을 준다.",
      "분석 함수는 순위, 누적, 전후 행 비교를 셀프조인 없이 처리할 수 있다.",
      "조건부 집계는 CASE와 SUM/COUNT를 조합해 피벗 형태 결과를 만들 수 있다.",
      "MERGE는 변경 여부에 따라 입력과 수정을 한 번에 처리한다.",
      "복잡한 SQL일수록 결과 정확성을 먼저 검증하고 실행계획을 조정한다."
    ],
    examTrap:
      "SQL이 짧다고 항상 좋은 것은 아니다. 요구사항을 누락하거나 중복 집계를 만들면 오답이다.",
    oracleAngle:
      "SQLP 실기에서는 목표 실행계획을 만족하면서도 결과가 정확한 SQL을 써야 한다. 힌트보다 요구사항 충족이 우선이다."
  },
  {
    id: "tuning-lock",
    subjectId: "tuning",
    subjectName: tuningSubject,
    majorTopic: "Lock과 트랜잭션 동시성 제어",
    detailTopic: "Lock",
    summary:
      "Lock은 동시 트랜잭션 사이 데이터 일관성을 보장하기 위한 잠금이다. 공유 잠금, 배타 잠금, row lock, table lock, lock wait를 이해한다.",
    keyPoints: [
      "DML은 변경 대상 행에 배타적 잠금을 걸어 다른 트랜잭션의 동시 변경을 막는다.",
      "잠금 범위가 크거나 트랜잭션이 길면 대기와 교착 상태 가능성이 커진다.",
      "인덱스가 없으면 변경 대상 탐색 범위가 커져 불필요한 대기나 성능 저하가 생길 수 있다.",
      "SELECT FOR UPDATE는 조회한 행을 변경 목적으로 잠글 때 사용한다.",
      "Deadlock은 서로가 가진 자원을 기다리는 순환 대기 상황이다."
    ],
    examTrap:
      "조회는 항상 잠금을 전혀 만들지 않는다고 단정하면 안 된다. SELECT FOR UPDATE나 격리 수준에 따라 동작이 달라진다.",
    oracleAngle:
      "Oracle은 일반 SELECT에서 read consistency를 제공해 읽기와 쓰기 충돌을 줄이지만, DML 간 row lock 대기는 여전히 중요하다."
  },
  {
    id: "tuning-transaction",
    subjectId: "tuning",
    subjectName: tuningSubject,
    majorTopic: "Lock과 트랜잭션 동시성 제어",
    detailTopic: "트랜잭션",
    summary:
      "트랜잭션은 하나의 논리적 작업 단위이며 ACID 특성을 가진다. SQLP에서는 커밋, 롤백, 격리 수준, undo를 성능과 연결해 묻는다.",
    keyPoints: [
      "Atomicity는 전부 반영 또는 전부 취소, Consistency는 일관성 유지, Isolation은 동시 수행 격리, Durability는 영속성을 뜻한다.",
      "트랜잭션이 길어질수록 lock 유지 시간과 undo 부담이 커진다.",
      "COMMIT은 변경을 확정하고 잠금을 해제한다.",
      "ROLLBACK은 변경을 취소하며 undo 정보를 사용한다.",
      "격리 수준은 dirty read, non-repeatable read, phantom read 같은 현상과 연결된다."
    ],
    examTrap:
      "커밋을 자주 하면 무조건 좋은 것은 아니다. 로그 동기화 횟수가 늘고 업무 원자성이 깨질 수 있다.",
    oracleAngle:
      "Oracle은 undo 기반의 읽기 일관성을 제공한다. 오래 걸리는 조회는 필요한 undo가 사라지면 snapshot too old 문제가 생길 수 있다."
  },
  {
    id: "tuning-concurrency",
    subjectId: "tuning",
    subjectName: tuningSubject,
    majorTopic: "Lock과 트랜잭션 동시성 제어",
    detailTopic: "동시성 제어",
    summary:
      "동시성 제어는 여러 사용자가 동시에 데이터를 읽고 변경할 때 일관성과 성능을 균형 있게 유지하는 기법이다. 낙관적/비관적 제어와 격리 수준을 이해한다.",
    keyPoints: [
      "비관적 동시성 제어는 충돌 가능성이 높다고 보고 미리 잠금을 건다.",
      "낙관적 동시성 제어는 먼저 처리하고 변경 시점에 버전이나 timestamp로 충돌을 확인한다.",
      "격리 수준이 높을수록 일관성은 강해지지만 동시성은 낮아질 수 있다.",
      "핫 블록, 시퀀스, 인덱스 경합처럼 데이터 변경 집중 지점이 동시성 병목이 될 수 있다.",
      "업무상 허용 가능한 일관성 수준을 정하고 잠금 범위를 최소화한다."
    ],
    examTrap:
      "동시성 문제를 SQL 하나의 실행계획만으로 해결하려는 보기는 부족하다. 트랜잭션 범위와 애플리케이션 처리 방식까지 봐야 한다.",
    oracleAngle:
      "Oracle 튜닝에서는 row lock wait, buffer busy waits, enq 대기 이벤트를 통해 동시성 병목을 추적한다."
  }
];

export const conceptArticles: ConceptArticle[] = conceptSeeds.map(concept);
