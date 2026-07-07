# SQLMate Public Deployment

SQLMate는 Vercel + Supabase 무료 플랜을 기준으로 배포합니다.

## 1단계: 공개 데모 URL 만들기

이 단계는 Supabase 없이도 가능합니다. 누구나 접속할 수 있고, 각 사용자의 학습 기록은 브라우저 localStorage에 저장됩니다.

### Vercel CLI 방식

Vercel 계정 로그인이 된 터미널에서 실행합니다.

```powershell
cd C:\Users\LG\Documents\Codex\2026-07-07\dnpq\outputs\sqlmate
pnpm dlx vercel
pnpm dlx vercel --prod
```

처음 실행할 때 권장 선택:

- Set up and deploy: `Y`
- Which scope: 개인 계정 선택
- Link to existing project: `N`
- Project name: `sqlmate`
- Directory: `./`
- Override settings: `N`

배포가 끝나면 `https://sqlmate-...vercel.app` 형태의 주소가 생성됩니다.

### Vercel Dashboard 방식

GitHub 저장소에 `outputs/sqlmate` 내용을 올린 뒤 Vercel에서 Import합니다.

1. GitHub에 `sqlmate` 저장소를 만듭니다.
2. 이 프로젝트 폴더를 저장소에 push합니다.
3. Vercel Dashboard > Add New Project > Import Git Repository.
4. Framework는 Next.js로 자동 인식됩니다.
5. Deploy를 누릅니다.

## 2단계: Google 로그인과 개인 저장 활성화

1. Supabase 무료 프로젝트를 생성합니다.
2. Supabase SQL Editor에서 `supabase/schema.sql`을 실행합니다.
3. Authentication > Providers > Google을 활성화합니다.
4. Google Cloud Console에서 OAuth Web Client를 생성합니다.
5. Supabase Google Provider에 Client ID와 Secret을 입력합니다.
6. Supabase URL과 anon key를 Vercel 환경변수에 추가합니다.

Vercel 환경변수:

```bash
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
```

Google OAuth Redirect URI에는 Supabase가 제공하는 callback URL을 등록합니다.

Vercel 배포 주소는 Supabase Authentication URL 설정에 등록합니다.

## 3단계: AI 추가 문제 활성화

OpenAI API를 사용할 때만 설정합니다. 비워두면 무료 로컬 생성 모드가 유지됩니다.

```bash
OPENAI_API_KEY=
OPENAI_MODEL=
```

## 4단계: SQL 실습 EXPLAIN 활성화

학습 전용 PostgreSQL DB를 만든 뒤 Vercel 환경변수에 추가합니다.

```bash
DATABASE_URL=
```

주의:

- 운영 DB를 연결하지 마세요.
- SQLMate API는 읽기 전용 트랜잭션과 statement timeout을 사용합니다.
- `SELECT`, `WITH`, `EXPLAIN` 외 SQL은 차단합니다.

## 무료 운영 순서 추천

1. Vercel만 연결해서 공개 데모 배포
2. Supabase 연결로 Google 로그인/개인 저장 활성화
3. 사용자가 늘어나면 OpenAI API와 PostgreSQL 실습 DB 연결
