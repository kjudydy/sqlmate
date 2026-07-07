# SQLMate

SQLMate는 SQLP 합격을 목표로 만든 학습 플랫폼 초안입니다. 객관식 문제풀이, SQL 작성형 실습, 오답노트, SQLP 개념정리, 개인 노트를 한 화면 흐름으로 묶었습니다.

## 현재 포함된 기능

- 1과목/2과목/3과목 객관식 각 100문제, 총 300문제
- SQL 작성형 실습 20문제
- 문제별 힌트, 정답 판정, 친절한 해설, 오답노트 자동 저장
- SQL 실습 답안 채점과 실행계획 시뮬레이션
- `DATABASE_URL` 설정 시 PostgreSQL `EXPLAIN` 실행
- Oracle/SQLP 튜닝 관점 해설과 힌트 연습
- SQLP 개념정리, 중요 표시, 개념별 메모
- 개인 노트
- Supabase Google 로그인과 사용자별 학습 상태 동기화 구조
- OpenAI API 키가 있을 때 추가 문제 생성, 없을 때 무료 로컬 생성
- Supabase 환경변수가 설정된 배포 환경에서는 Google 로그인 후에만 학습 화면 진입

문제는 실제 기출 원문을 복제하지 않고, SQLP 공식 범위와 자주 출제되는 개념/튜닝 패턴을 바탕으로 만든 오리지널 문항입니다.

## 기술 스택

- Next.js + React + TypeScript
- Supabase Auth/Postgres/RLS
- PostgreSQL `EXPLAIN` 기반 SQL 실습 API
- OpenAI Responses API 연동 가능 구조
- Vitest 테스트
- Vercel 배포 기준

## 로컬 실행

Codex 번들 런타임 기준:

```powershell
C:\Users\LG\.cache\codex-runtimes\codex-primary-runtime\dependencies\bin\pnpm.cmd install
C:\Users\LG\.cache\codex-runtimes\codex-primary-runtime\dependencies\node\bin\node.exe .\node_modules\next\dist\bin\next dev
```

일반 Node.js가 설치되어 있다면:

```bash
pnpm install
pnpm dev
```

## 환경변수

`.env.example`을 `.env.local`로 복사한 뒤 필요한 값만 채웁니다.

```bash
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
OPENAI_API_KEY=
OPENAI_MODEL=
DATABASE_URL=
```

- Supabase 값을 비워두면 로컬 데모 저장으로 동작합니다.
- Supabase 값을 채우면 첫 화면이 Google 로그인 게이트로 바뀌고, 로그인한 사용자만 SQLMate 학습 화면에 들어갑니다.
- OpenAI 값을 비워두면 추가 문제는 무료 로컬 생성으로 동작합니다.
- `DATABASE_URL`을 비워두면 SQL 실행계획은 로컬 시뮬레이션으로 동작합니다.

## Supabase 설정

1. Supabase에서 무료 프로젝트를 만듭니다.
2. SQL Editor에서 `supabase/schema.sql`을 실행합니다.
3. Authentication > Providers > Google을 활성화합니다.
4. Google Cloud OAuth Client ID/Secret을 Supabase Google Provider에 입력합니다.
5. Vercel 배포 URL과 로컬 URL을 Supabase Redirect URL에 등록합니다.
6. Vercel 환경변수에 `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`를 추가합니다.

`study_state` 테이블은 RLS가 켜져 있고, 사용자는 본인의 학습 상태만 읽고 쓸 수 있습니다.

## PostgreSQL 실습 DB

`DATABASE_URL`은 반드시 학습 전용 DB를 사용하세요. API는 읽기 전용 트랜잭션과 statement timeout을 사용하고, `SELECT`, `WITH`, `EXPLAIN`만 허용합니다.

Oracle SQLP 실기 대비는 앱 내부 해설과 힌트로 보완합니다. PostgreSQL 실행계획은 실제 실행 가능한 무료 실습 기반이고, Oracle 힌트/별칭/조인 방식은 답안 리뷰 관점에서 함께 봅니다.

## 검증

pnpm 래퍼가 `sharp` build approval에서 멈추는 환경에서는 아래처럼 직접 실행할 수 있습니다.

```powershell
C:\Users\LG\.cache\codex-runtimes\codex-primary-runtime\dependencies\node\bin\node.exe .\node_modules\typescript\bin\tsc --noEmit
C:\Users\LG\.cache\codex-runtimes\codex-primary-runtime\dependencies\node\bin\node.exe .\node_modules\vitest\vitest.mjs run
C:\Users\LG\.cache\codex-runtimes\codex-primary-runtime\dependencies\node\bin\node.exe .\node_modules\next\dist\bin\next build
```

## 배포

무료 기준으로는 Vercel Hobby + Supabase Free 조합이 가장 단순합니다.

```bash
vercel
```

Vercel 프로젝트 환경변수에 `.env.local`의 필요한 값을 등록하고 다시 배포하면 됩니다.
