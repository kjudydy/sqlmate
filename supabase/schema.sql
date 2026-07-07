create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text,
  display_name text,
  created_at timestamptz not null default now()
);

create table if not exists public.study_state (
  user_id uuid primary key references auth.users(id) on delete cascade,
  state jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now()
);

create table if not exists public.problem_feedback (
  id bigint generated always as identity primary key,
  user_id uuid not null references auth.users(id) on delete cascade,
  question_id text not null,
  feedback text not null,
  created_at timestamptz not null default now()
);

alter table public.profiles enable row level security;
alter table public.study_state enable row level security;
alter table public.problem_feedback enable row level security;

create policy "profiles are readable by owner"
  on public.profiles for select
  to authenticated
  using ((select auth.uid()) = id);

create policy "profiles are insertable by owner"
  on public.profiles for insert
  to authenticated
  with check ((select auth.uid()) = id);

create policy "profiles are updatable by owner"
  on public.profiles for update
  to authenticated
  using ((select auth.uid()) = id)
  with check ((select auth.uid()) = id);

create policy "study state is readable by owner"
  on public.study_state for select
  to authenticated
  using ((select auth.uid()) = user_id);

create policy "study state is insertable by owner"
  on public.study_state for insert
  to authenticated
  with check ((select auth.uid()) = user_id);

create policy "study state is updatable by owner"
  on public.study_state for update
  to authenticated
  using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);

create policy "problem feedback is manageable by owner"
  on public.problem_feedback for all
  to authenticated
  using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, email, display_name)
  values (new.id, new.email, new.raw_user_meta_data->>'name')
  on conflict (id) do nothing;

  insert into public.study_state (user_id, state)
  values (new.id, '{}'::jsonb)
  on conflict (user_id) do nothing;

  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();
