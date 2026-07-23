# Question Coverage Report

Updated: 2026-07-23

## 2026-07-23 PDF 스타일 반영

`SQL-자격검정-실전문제.pdf` 분석 후 문제 생성 로직을 다음처럼 조정했다.

- 1과목 모델링: 표 기반 후보 판단, 업무 규칙, 모델링 원칙, SQL 영향까지 함께 묻도록 템플릿을 강화했다.
- 2과목 SQL 기본 및 활용: SQL 코드와 판단 지점 표를 함께 제시하고, 논리 처리 순서·NULL·조인 보존·집계 기준을 선택지별로 검증하도록 보강했다.
- 3과목 SQL 고급활용 및 튜닝: 실행계획/Trace 표를 포함하고 Rows, Starts, CR, PR, Access Predicate, Filter Predicate를 해석하는 객관식 비중을 늘렸다.
- 추가 20문제 배치: 문제 본문에 `PDF 실전문제형 추가 사례` 문맥을 추가하고 review_required 상태로 생성되도록 유지했다.
- SQL Practice: 실습 공통 채점 기준에 Trace 수치와 Predicate 구분, 대안 SQL의 결과 보존 근거를 추가했다.

자동 검증 기준:

- 과목별 객관식 100문제 유지
- 문제 자료(passage/code/table) 포함 문항 260개 이상
- 표 포함 문항 90개 이상
- SQL/실행계획/Trace 코드 포함 문항 120개 이상
- 3과목 Trace/Plan 표 포함 문항 40개 이상
- 문제 유형 8종 이상 유지

Date: 2026-07-20

## 현재 문제 수

| 과목 | 공개 문제 수 | 기준 |
|---|---:|---|
| 1과목 데이터 모델링의 이해 | 100 | 1~10번은 사용자 승인 품질 기준 세트, 11~100번은 객관식 유지 및 메타데이터 보강 |
| 2과목 SQL 기본 및 활용 | 100 | 1~10번은 사용자 승인 품질 기준 세트, 11~100번은 객관식 유지 및 메타데이터 보강 |
| 3과목 SQL 고급활용 및 튜닝 | 100 | 1~10번은 사용자 승인 품질 기준 세트, 11~100번은 객관식 유지 및 메타데이터 보강 |
| SQL 실습 | 20 | SQL 작성형, 실행계획/Trace/Predicate 기반 실습 |

## 필기 문제 유형

- 단일 선택 객관식
- 보기 조합형
- 표 판단형 객관식
- SQL 실행 결과 선택형
- 실행계획 분석 선택형
- SQL Trace 분석 선택형
- 적절한 튜닝 방향 선택형
- 옳지 않은 설명 선택형

## 보강한 데이터 필드

- `majorTopic`
- `middleTopic`
- `questionType`
- `relatedConceptId`
- `reviewStatus`
- `duplicationCheck`

## 20문제 확장 배치

- `lib/question-batch.ts`에 관리자/검수용 20문제 배치 계획 함수를 추가했다.
- 배치 크기: 20문제
- 신규 배치 상태: `review_required`
- 일반 사용자에게 검수 전 문제를 자동 공개하지 않는 원칙을 코드와 문서에 기록했다.
- 각 배치는 부족한 주제, 중복 후보, 객관식 유지 여부, 관련 개념 연결을 확인하도록 설계했다.

## 공식 PDF 코퍼스 반영 상태

| 구분 | 적용 내용 |
|---|---|
| 공식 원본 PDF | `SQL-자격검정-실전문제.pdf`, 45~50회 기출문제 PDF 총 7개 |
| 객관식 초기 세트 | 1·2·3과목 각 100문제, 총 300문제 유지 |
| SQL Practice 초기 세트 | 20문제 유지 |
| 출처 추적 | 모든 객관식/실습 문항에 sourceDocument, sourceType, generationMode, sourceVersion 부여 |
| 배치 추적 | 초기 세트는 `initial-*-v1`, 추가 세트는 20문제 단위 `extra-*-n` |
| 유사도 방지 기반 | contentHash와 semanticFingerprint를 생성해 숫자/이름만 바꾼 변형을 추적할 수 있게 함 |
| 검수 상태 | 초기 공개 세트는 validated, 추가 배치 후보는 review_required |

### 초기 객관식 세트 출처 유형

- 원본 충실형 기준: `owner_pdf`
- 안전 변형형 기준: `owner_pdf_variant`
- 고품질 유사형 기준: `owner_pdf_similar`

초기 세트는 세 유형을 모두 포함한다. PDF 원본 답을 외운 사용자가 그대로 맞히는 것만으로 학습이 끝나지 않도록, 유사형은 업무 상황, SQL 구조, 데이터 분포, 판단해야 할 함정을 달리하도록 관리한다.

## 다음 콘텐츠 확장 우선순위

- 1과목: 모델링 3단계, 데이터 독립성, 식별/비식별 관계, 정규화-반정규화 사례
- 2과목: SQL 결과 추론, OUTER JOIN 조건 위치, 집계/윈도우/Top-N 결과 판단
- 3과목: Access/Filter Predicate, 클러스터링 팩터, 조인 방식, Trace 수치 해석, Query Transformation
