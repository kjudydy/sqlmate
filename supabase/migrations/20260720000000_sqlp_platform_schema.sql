-- SQLMate platform overhaul schema.
-- Apply after reviewing docs/DATABASE.md. This migration is designed to be re-runnable.

create extension if not exists pgcrypto;

do $$
begin
  create type public.content_status as enum ('draft', 'generated', 'validating', 'review_required', 'approved', 'rejected', 'archived');
exception
  when duplicate_object then null;
end $$;

do $$
begin
  create type public.content_source_type as enum ('official_scope', 'user_pdf_adapted', 'public_reference_adapted', 'original', 'ai_assisted');
exception
  when duplicate_object then null;
end $$;

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text,
  display_name text,
  avatar_url text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.admin_roles (
  user_id uuid primary key references auth.users(id) on delete cascade,
  role text not null check (role in ('owner', 'content_admin', 'reviewer')),
  granted_by uuid references auth.users(id),
  granted_at timestamptz not null default now()
);

create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.admin_roles ar
    where ar.user_id = auth.uid()
      and ar.role in ('owner', 'content_admin', 'reviewer')
  );
$$;

create table if not exists public.subjects (
  id text primary key,
  name text not null,
  display_order int not null
);

create table if not exists public.topics (
  id uuid primary key default gen_random_uuid(),
  subject_id text not null references public.subjects(id) on delete cascade,
  parent_id uuid references public.topics(id) on delete cascade,
  title text not null,
  display_order int not null default 0,
  unique (subject_id, parent_id, title)
);

create table if not exists public.content_sources (
  id uuid primary key default gen_random_uuid(),
  source_type public.content_source_type not null,
  label text not null,
  locator text,
  notes text,
  created_at timestamptz not null default now()
);

create table if not exists public.concept_documents (
  id text primary key,
  subject_id text not null references public.subjects(id),
  major_topic text not null,
  minor_topic text not null,
  detail_topic text not null,
  title text not null,
  summary text not null,
  body jsonb not null default '[]'::jsonb,
  keywords text[] not null default '{}',
  source_id uuid references public.content_sources(id),
  status public.content_status not null default 'draft',
  content_version text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.questions (
  id text primary key,
  subject_id text not null references public.subjects(id),
  major_topic text not null,
  minor_topic text not null,
  detail_topic text not null,
  difficulty text not null,
  question_type text not null,
  prompt text not null,
  passage text,
  sql_text text,
  table_payload jsonb,
  plan_payload jsonb,
  trace_payload jsonb,
  answer_payload jsonb not null,
  explanation text not null,
  wrong_answer_notes jsonb not null default '[]'::jsonb,
  related_concept_ids text[] not null default '{}',
  expected_minutes int not null default 2,
  source_id uuid references public.content_sources(id),
  status public.content_status not null default 'draft',
  content_version text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.question_choices (
  id uuid primary key default gen_random_uuid(),
  question_id text not null references public.questions(id) on delete cascade,
  choice_key text not null,
  choice_text text not null,
  display_order int not null,
  unique (question_id, choice_key)
);

create table if not exists public.question_hints (
  id uuid primary key default gen_random_uuid(),
  question_id text not null references public.questions(id) on delete cascade,
  hint_level int not null check (hint_level between 1 and 3),
  title text not null,
  body text not null,
  unique (question_id, hint_level)
);

create table if not exists public.practice_scenarios (
  id text primary key,
  title text not null,
  area text not null,
  difficulty text not null,
  scenario text not null,
  requirement text not null,
  tables_payload jsonb not null default '[]'::jsonb,
  current_sql text not null,
  current_plan jsonb not null,
  current_trace jsonb not null,
  target_plan jsonb not null,
  predicate_info jsonb not null default '[]'::jsonb,
  expected_result text not null,
  performance_goal text not null,
  constraints_payload jsonb not null default '[]'::jsonb,
  model_sql text not null,
  acceptable_sql_patterns text[] not null default '{}',
  grading_rubric jsonb not null default '[]'::jsonb,
  explanation text not null,
  related_concept_ids text[] not null default '{}',
  source_id uuid references public.content_sources(id),
  status public.content_status not null default 'draft',
  content_version text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.practice_hints (
  id uuid primary key default gen_random_uuid(),
  practice_id text not null references public.practice_scenarios(id) on delete cascade,
  hint_level int not null check (hint_level between 1 and 3),
  title text not null,
  body text not null,
  unique (practice_id, hint_level)
);

create table if not exists public.attempts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  question_id text not null references public.questions(id),
  submitted_answer jsonb not null,
  is_correct boolean not null,
  hints_used int[] not null default '{}',
  answered_at timestamptz not null default now()
);

create table if not exists public.practice_submissions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  practice_id text not null references public.practice_scenarios(id),
  submitted_sql text not null,
  score int not null check (score between 0 and 100),
  passed boolean not null,
  execution_mode text not null default 'oracle_simulation',
  feedback jsonb not null default '[]'::jsonb,
  submitted_at timestamptz not null default now()
);

create table if not exists public.wrong_answer_items (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  question_id text not null references public.questions(id),
  last_attempt_id uuid references public.attempts(id) on delete set null,
  status text not null default 'new' check (status in ('new', 'due', 'learning', 'almost_mastered', 'mastered')),
  consecutive_correct int not null default 0,
  next_review_at timestamptz not null default now(),
  memo text not null default '',
  updated_at timestamptz not null default now(),
  unique (user_id, question_id)
);

create table if not exists public.bookmarks (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  target_type text not null check (target_type in ('question', 'concept', 'practice')),
  target_id text not null,
  created_at timestamptz not null default now(),
  unique (user_id, target_type, target_id)
);

create table if not exists public.highlights (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  concept_id text not null references public.concept_documents(id) on delete cascade,
  anchor jsonb not null,
  selected_text text not null,
  color text not null default 'yellow' check (color in ('yellow', 'green', 'pink', 'blue')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.annotations (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  target_type text not null check (target_type in ('question', 'concept', 'practice')),
  target_id text not null,
  body text not null default '',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (user_id, target_type, target_id)
);

create table if not exists public.personal_notes (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  parent_id uuid references public.personal_notes(id) on delete set null,
  title text not null default '새 노트',
  tags text[] not null default '{}',
  favorite boolean not null default false,
  trashed_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.note_blocks (
  id uuid primary key default gen_random_uuid(),
  note_id uuid not null references public.personal_notes(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  block_type text not null,
  body jsonb not null default '{}'::jsonb,
  display_order int not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.todo_items (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  title text not null,
  completed boolean not null default false,
  due_date date,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.learning_sessions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  session_date date not null default current_date,
  solved_count int not null default 0,
  practice_count int not null default 0,
  minutes int not null default 0,
  unique (user_id, session_date)
);

create table if not exists public.ai_feedback (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  target_type text not null,
  target_id text not null,
  prompt_hash text not null,
  response jsonb not null,
  created_at timestamptz not null default now()
);

create table if not exists public.content_versions (
  id uuid primary key default gen_random_uuid(),
  target_type text not null,
  target_id text not null,
  content_version text not null,
  status public.content_status not null,
  change_summary text not null,
  created_by uuid references auth.users(id),
  created_at timestamptz not null default now()
);

create table if not exists public.audit_logs (
  id uuid primary key default gen_random_uuid(),
  actor_id uuid references auth.users(id),
  action text not null,
  target_type text not null,
  target_id text,
  payload jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

alter table public.profiles enable row level security;
alter table public.admin_roles enable row level security;
alter table public.subjects enable row level security;
alter table public.topics enable row level security;
alter table public.content_sources enable row level security;
alter table public.concept_documents enable row level security;
alter table public.questions enable row level security;
alter table public.question_choices enable row level security;
alter table public.question_hints enable row level security;
alter table public.practice_scenarios enable row level security;
alter table public.practice_hints enable row level security;
alter table public.attempts enable row level security;
alter table public.practice_submissions enable row level security;
alter table public.wrong_answer_items enable row level security;
alter table public.bookmarks enable row level security;
alter table public.highlights enable row level security;
alter table public.annotations enable row level security;
alter table public.personal_notes enable row level security;
alter table public.note_blocks enable row level security;
alter table public.todo_items enable row level security;
alter table public.learning_sessions enable row level security;
alter table public.ai_feedback enable row level security;
alter table public.content_versions enable row level security;
alter table public.audit_logs enable row level security;

drop policy if exists "profiles owner read" on public.profiles;
create policy "profiles owner read" on public.profiles for select to authenticated using (auth.uid() = id);
drop policy if exists "profiles owner write" on public.profiles;
create policy "profiles owner write" on public.profiles for all to authenticated using (auth.uid() = id) with check (auth.uid() = id);

drop policy if exists "admin roles visible to admins" on public.admin_roles;
create policy "admin roles visible to admins" on public.admin_roles for select to authenticated using (public.is_admin() or auth.uid() = user_id);

drop policy if exists "approved subjects readable" on public.subjects;
create policy "approved subjects readable" on public.subjects for select to authenticated using (true);
drop policy if exists "approved topics readable" on public.topics;
create policy "approved topics readable" on public.topics for select to authenticated using (true);

drop policy if exists "approved concept docs readable" on public.concept_documents;
create policy "approved concept docs readable" on public.concept_documents for select to authenticated using (status = 'approved' or public.is_admin());
drop policy if exists "approved questions readable" on public.questions;
create policy "approved questions readable" on public.questions for select to authenticated using (status = 'approved' or public.is_admin());
drop policy if exists "approved choices readable" on public.question_choices;
create policy "approved choices readable" on public.question_choices for select to authenticated using (
  exists (select 1 from public.questions q where q.id = question_id and (q.status = 'approved' or public.is_admin()))
);
drop policy if exists "approved hints readable" on public.question_hints;
create policy "approved hints readable" on public.question_hints for select to authenticated using (
  exists (select 1 from public.questions q where q.id = question_id and (q.status = 'approved' or public.is_admin()))
);
drop policy if exists "approved practice readable" on public.practice_scenarios;
create policy "approved practice readable" on public.practice_scenarios for select to authenticated using (status = 'approved' or public.is_admin());
drop policy if exists "approved practice hints readable" on public.practice_hints;
create policy "approved practice hints readable" on public.practice_hints for select to authenticated using (
  exists (select 1 from public.practice_scenarios p where p.id = practice_id and (p.status = 'approved' or public.is_admin()))
);

drop policy if exists "admins manage content" on public.concept_documents;
create policy "admins manage content" on public.concept_documents for all to authenticated using (public.is_admin()) with check (public.is_admin());
drop policy if exists "admins manage questions" on public.questions;
create policy "admins manage questions" on public.questions for all to authenticated using (public.is_admin()) with check (public.is_admin());
drop policy if exists "admins manage question choices" on public.question_choices;
create policy "admins manage question choices" on public.question_choices for all to authenticated using (public.is_admin()) with check (public.is_admin());
drop policy if exists "admins manage question hints" on public.question_hints;
create policy "admins manage question hints" on public.question_hints for all to authenticated using (public.is_admin()) with check (public.is_admin());
drop policy if exists "admins manage practice" on public.practice_scenarios;
create policy "admins manage practice" on public.practice_scenarios for all to authenticated using (public.is_admin()) with check (public.is_admin());

drop policy if exists "user attempts owner" on public.attempts;
create policy "user attempts owner" on public.attempts for all to authenticated using (auth.uid() = user_id) with check (auth.uid() = user_id);
drop policy if exists "user practice submissions owner" on public.practice_submissions;
create policy "user practice submissions owner" on public.practice_submissions for all to authenticated using (auth.uid() = user_id) with check (auth.uid() = user_id);
drop policy if exists "user wrong answers owner" on public.wrong_answer_items;
create policy "user wrong answers owner" on public.wrong_answer_items for all to authenticated using (auth.uid() = user_id) with check (auth.uid() = user_id);
drop policy if exists "user bookmarks owner" on public.bookmarks;
create policy "user bookmarks owner" on public.bookmarks for all to authenticated using (auth.uid() = user_id) with check (auth.uid() = user_id);
drop policy if exists "user highlights owner" on public.highlights;
create policy "user highlights owner" on public.highlights for all to authenticated using (auth.uid() = user_id) with check (auth.uid() = user_id);
drop policy if exists "user annotations owner" on public.annotations;
create policy "user annotations owner" on public.annotations for all to authenticated using (auth.uid() = user_id) with check (auth.uid() = user_id);
drop policy if exists "user notes owner" on public.personal_notes;
create policy "user notes owner" on public.personal_notes for all to authenticated using (auth.uid() = user_id) with check (auth.uid() = user_id);
drop policy if exists "user note blocks owner" on public.note_blocks;
create policy "user note blocks owner" on public.note_blocks for all to authenticated using (auth.uid() = user_id) with check (auth.uid() = user_id);
drop policy if exists "user todos owner" on public.todo_items;
create policy "user todos owner" on public.todo_items for all to authenticated using (auth.uid() = user_id) with check (auth.uid() = user_id);
drop policy if exists "user learning sessions owner" on public.learning_sessions;
create policy "user learning sessions owner" on public.learning_sessions for all to authenticated using (auth.uid() = user_id) with check (auth.uid() = user_id);
drop policy if exists "user ai feedback owner" on public.ai_feedback;
create policy "user ai feedback owner" on public.ai_feedback for all to authenticated using (auth.uid() = user_id) with check (auth.uid() = user_id);

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, email, display_name, avatar_url)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data->>'name', new.raw_user_meta_data->>'full_name'),
    new.raw_user_meta_data->>'avatar_url'
  )
  on conflict (id) do update
    set email = excluded.email,
        display_name = coalesce(public.profiles.display_name, excluded.display_name),
        avatar_url = coalesce(excluded.avatar_url, public.profiles.avatar_url),
        updated_at = now();

  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

insert into public.subjects (id, name, display_order)
values
  ('subject-1', '1과목 데이터 모델링의 이해', 1),
  ('subject-2', '2과목 SQL 기본 및 활용', 2),
  ('subject-3', '3과목 SQL 고급활용 및 튜닝', 3)
on conflict (id) do update
set name = excluded.name,
    display_order = excluded.display_order;
