# SQLMate Current State

작성일: 2026-07-20
분석 기준 커밋: `e32814c Improve SQLP generation and concept tools`
작업 브랜치: `feature/sqlp-platform-overhaul`

## 1. Git 상태

- 기준 브랜치: `main`
- 새 작업 브랜치: `feature/sqlp-platform-overhaul`
- main과 origin/main은 분석 시점에 동기화되어 있었다.
- 최근 커밋:
  - `e32814c Improve SQLP generation and concept tools`
  - `7ba77ad Refine concepts and SQLP lab practice`
  - `246ce18 Expand concepts and SQLP lab practice`
  - `463bb5e Expand modeling concept guide notes`
  - `674257f Rework concept notes hierarchy`

## 2. 프로젝트 구조

현재 구조는 단일 Next.js 앱에 가까운 형태다.

```text
app/
  api/ai/route.ts
  api/sql/route.ts
  globals.css
  layout.tsx
  page.tsx
lib/
  concepts.ts
  grading.ts
  problem-bank.ts
  supabase-client.ts
  types.ts
supabase/
  schema.sql
tests/
  grading.test.ts
  problem-bank.test.ts
```

문제점:

- 화면, 상태 관리, 학습 로직이 `app/page.tsx`에 과도하게 집중되어 있다.
- 콘텐츠 데이터가 `lib/problem-bank.ts`, `lib/concepts.ts`에 하드코딩되어 있다.
- 관리자 콘텐츠 검수 흐름과 콘텐츠 버전 관리가 없다.
- DB migration 체계가 `supabase/schema.sql` 단일 파일에 머물러 있다.
- 문서 체계가 요청된 운영 수준에 비해 부족하다.

## 3. 기술 스택과 패키지

`package.json` 기준:

- Next.js: `latest`
- React: `latest`
- TypeScript: `latest`
- Supabase JS: `latest`
- pg: `latest`
- zod: `latest`
- lucide-react: `latest`
- Vitest: `latest`

스크립트:

- `dev`: `next dev`
- `build`: `next build`
- `start`: `next start`
- `typecheck`: `tsc --noEmit`
- `test`: `vitest run`

주의:

- `lint` 스크립트가 없다.
- 의존성이 `latest`로 고정되어 있어 장기 운영 시 재현성이 약하다.

## 4. Supabase 연결 상태

환경변수:

- `.env.example`에는 다음 키가 정의되어 있다.
  - `NEXT_PUBLIC_SUPABASE_URL`
  - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
  - `OPENAI_API_KEY`
  - `OPENAI_MODEL`
  - `DATABASE_URL`
- 실제 환경변수 값은 보안상 문서화하지 않는다.

클라이언트:

- `lib/supabase-client.ts`에서 브라우저용 Supabase Client를 생성한다.
- `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`가 없으면 local fallback으로 동작한다.

현재 저장 방식:

- Supabase가 설정되면 `study_state`의 `state jsonb`에 전체 학습 상태를 통째로 upsert한다.
- Supabase가 없으면 브라우저 `localStorage`에 저장한다.

문제점:

- 문제별 시도, 오답, 마킹, 노트가 정규화되어 있지 않다.
- 사용자별 분석/통계/복습 쿼리가 어렵다.
- 콘텐츠와 사용자 데이터를 분리해서 관리하지 않는다.
- 다른 기기 복원은 `study_state` 전체 JSON에 의존한다.

## 5. 인증 상태

- Supabase Auth 기반 Google OAuth를 사용한다.
- Supabase 미설정 시 데모 모드로 진입한다.
- Supabase 설정 시 로그인 게이트가 나타난다.
- 로그인 후 `study_state`를 읽고 앱 상태에 반영한다.

확인 필요:

- 실제 운영 Supabase에서 Google Provider가 계속 활성화되어 있는지
- Supabase Auth Redirect URL에 Production/Preview 도메인이 모두 등록되어 있는지
- Preview 도메인에서 OAuth Redirect가 동작하는지

## 6. 현재 DB 스키마

`supabase/schema.sql` 기준 테이블:

- `profiles`
- `study_state`
- `problem_feedback`

RLS:

- `profiles`: owner select/insert/update
- `study_state`: owner select/insert/update
- `problem_feedback`: owner all

Trigger:

- `auth.users` insert 후 `profiles`, `study_state`를 생성하는 `handle_new_user()`

부족한 영역:

- `subjects`
- `topics`
- `concept_documents`
- `questions`
- `question_choices`
- `question_hints`
- `practice_scenarios`
- `attempts`
- `wrong_answer_items`
- `bookmarks`
- `personal_notes`
- `note_blocks`
- `highlights`
- `review_schedules`
- `admin_roles`
- `content_versions`
- `content_sources`
- `audit_logs`

## 7. Vercel 상태

`.vercel/project.json` 기준:

- projectName: `sqlmate`
- projectId: 존재함
- orgId: 존재함

최근 배포:

- 이전 작업에서 Production alias `https://sqlmate.vercel.app`가 갱신되었다.

이번 개편 원칙:

- `main` 병합 및 Production 배포 전에는 Preview만 배포한다.
- 작업 브랜치 `feature/sqlp-platform-overhaul`에서 Vercel Preview를 생성한다.

## 8. 기존 구현 기능

현재 앱은 다음 화면을 제공한다.

- 대시보드
- 객관식 문제풀이
- SQL 실습
- 오답노트
- 개념정리
- 개인노트

구현된 기능:

- Google 로그인 게이트
- localStorage fallback
- Supabase `study_state` 동기화
- 하드코딩 문제은행
- 추가 문제 생성 함수
- 실습 문제 추가 함수
- 단순 SQL 채점/시뮬레이션 API
- 개념 형광펜
- 개인 노트 목록/상세 편집
- 오답노트 자동 표시

## 9. Mock/하드코딩/localStorage 구분

하드코딩:

- 과목/문제: `lib/problem-bank.ts`
- 개념 문서: `lib/concepts.ts`
- 실습 DDL/seed/expected plan: `lib/problem-bank.ts`

Mock/시뮬레이션:

- `/api/sql`은 실제 Oracle 실행이 아니다.
- PostgreSQL `EXPLAIN`을 사용할 수 있는 옵션이 있으나 운영 DB에서 사용자 SQL을 직접 실행해서는 안 된다.
- Oracle 실행계획은 expected/simulated 성격이다.
- `/api/ai`는 OpenAI API 키가 없으면 fallback 응답을 제공한다.

localStorage:

- Supabase 미설정 시 학습 상태 전체가 localStorage에 저장된다.
- Supabase 설정 전/오프라인 상태의 임시 fallback으로는 유용하지만 운영 저장소로는 부적절하다.

## 10. 테스트와 빌드 상태

2026-07-20 기준 실행 결과:

- TypeScript: PASS
- Unit tests: PASS, 2 files / 18 tests
- Production build: PASS
- Lint: 스크립트 없음

## 11. 모바일/접근성/UX 상태

확인된 개선 필요점:

- `app/page.tsx` 단일 컴포넌트가 커서 UI 상태 추적이 어렵다.
- 긴 개념 문서에서 사이드바 집중 모드는 일부 있으나, 형광펜 삭제 UX가 상단 칩 방식이라 가독성을 해친다.
- 개인 노트는 textarea 기반으로 Notion형 블록 노트가 아니다.
- 실행계획/Trace 표의 모바일 가독성 개선이 필요하다.
- 관리자 콘텐츠 검수 화면이 없다.
- 메뉴 구조가 요청된 14개 핵심 메뉴를 모두 반영하지 않는다.

## 12. 주요 리스크

- 콘텐츠 품질 리스크: 현재 문제은행은 SQLP 실전 난이도 대비 깊이가 부족하다.
- 데이터 모델 리스크: 단일 JSON `study_state`는 확장성이 낮다.
- 보안 리스크: 사용자 SQL 실행 샌드박스가 분리되어 있지 않다.
- 운영 리스크: 콘텐츠 검수 상태 없이 AI/생성 콘텐츠가 바로 사용자에게 노출될 수 있다.
- 유지보수 리스크: 화면과 로직이 큰 파일 하나에 집중되어 있다.

## 13. 개편 방향

1. 문서와 요구사항을 먼저 고정한다.
2. DB migration을 재실행 가능하게 분리한다.
3. 콘텐츠/사용자 데이터/관리자 검수 데이터를 분리한다.
4. 1차 운영 품질 콘텐츠를 seed로 작성한다.
5. 문제 풀이 엔진을 유형 기반으로 재설계한다.
6. 형광펜/노트/오답/복습을 사용자별 DB 저장으로 전환한다.
7. SQL 실습은 실제 실행과 시뮬레이션을 명확히 분리한다.
8. 관리자 검수 상태를 거친 콘텐츠만 일반 사용자에게 공개한다.
