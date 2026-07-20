# Concept Gap Report

Date: 2026-07-20

## 이번 작업에서 수정한 항목

- 모든 개념에 강제로 들어가던 `단권화 풀이 공식`류 제목과 삽입 로직을 제거했다.
- 기본 보강 블록은 `요약`, `암기표`, `개념 구조`, `기출 체크` 중심으로 변경했다.
- WHERE, SQL Trace, 인덱스 스캔 효율화, 쿼리 변환 상세 문서의 고정 공식 제목을 자연스러운 개념/진단 표 제목으로 변경했다.

## 첨부 자료 기준으로 추가 보강이 필요한 항목

### 1과목

- 데이터 모델링 세 가지 관점과 3단계 모델링 설명을 더 촘촘히 연결해야 한다.
- 외부/개념/내부 스키마와 논리적/물리적 독립성은 독립 문서로 분리할 가치가 있다.
- 좋은 데이터 모델의 조건은 중복, 비유연성, 비일관성 각각을 예시와 함께 보강해야 한다.

### 2과목

- SQL 논리 처리 순서와 실제 작성 순서를 표로 분리해 보강해야 한다.
- OUTER JOIN 조건 위치, NOT IN NULL, 집계 전후 조건은 문제와 양방향 연결을 강화해야 한다.
- ROLLUP/CUBE/GROUPING SETS는 결과 행 생성 규칙 중심의 예제가 더 필요하다.

### 3과목

- SGA/PGA, Buffer Cache, Shared Pool, Library Cache, Cursor를 독립 세부 개념으로 보강해야 한다.
- Hard Parse, Soft Parse, Bind Peeking, Adaptive Cursor Sharing을 옵티마이저/파싱 흐름 안에 연결해야 한다.
- 통계정보, 선택도, 카디널리티, 비용 계산은 실행계획 오판 사례와 함께 보강해야 한다.
- Hash Join의 build/probe 선택, memory spill, TEMP 사용은 실습과 연결해야 한다.
- SQL Trace, TKPROF, DBMS_XPLAN은 실습 화면의 Trace 요약 표와 동일한 용어 체계를 사용해야 한다.

## 중복 또는 통합 후보

- `인덱스 스캔 효율화`, `SARGable 조건`, `Access Predicate와 Filter Predicate`는 별도 문서로 두되 상호 링크가 필요하다.
- `쿼리 변환`, `뷰 머징`, `Predicate Pushing`, `Subquery Unnesting`은 3과목 내 같은 대단원 아래 배치해야 한다.
- `Top-N`, `부분범위 처리`, `정렬 생략`은 SQL 기본과 튜닝 양쪽에서 다루되 목적을 구분해야 한다.

## 검수 필요

- PDF 일부 구간은 인코딩 깨짐이 있어 텍스트 추출만으로 확정하지 않는다.
- 실제 Oracle에서 검증하지 않은 실행계획/Trace는 `설명용 예시`로 표시한다.
