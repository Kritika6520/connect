create type public.idea_stage as enum (
  'idea',
  'planning',
  'building',
  'testing',
  'launched'
);

create table public.ideas (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null default auth.uid() references auth.users (id) on delete cascade,
  title text not null check (char_length(title) between 3 and 120),
  problem text not null check (char_length(problem) between 1 and 3000),
  solution text not null check (char_length(solution) between 1 and 3000),
  target_users text not null check (char_length(target_users) between 1 and 500),
  domain text not null check (char_length(domain) between 2 and 80),
  skills_needed text[] not null default '{}',
  team_size integer not null default 1 check (team_size between 1 and 50),
  stage public.idea_stage not null default 'idea',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index ideas_created_at_idx on public.ideas (created_at desc);
create index ideas_domain_idx on public.ideas (domain);
create index ideas_owner_id_idx on public.ideas (owner_id);
create index ideas_skills_needed_idx on public.ideas using gin (skills_needed);

alter table public.ideas enable row level security;

revoke all on public.ideas from anon, authenticated;
grant select on public.ideas to anon, authenticated;
grant insert, update, delete on public.ideas to authenticated;

create policy "Anyone can read ideas"
  on public.ideas
  for select
  to anon, authenticated
  using (true);

create policy "Owners can create ideas"
  on public.ideas
  for insert
  to authenticated
  with check ((select auth.uid()) = owner_id);

create policy "Owners can update ideas"
  on public.ideas
  for update
  to authenticated
  using ((select auth.uid()) = owner_id)
  with check ((select auth.uid()) = owner_id);

create policy "Owners can delete ideas"
  on public.ideas
  for delete
  to authenticated
  using ((select auth.uid()) = owner_id);

create or replace function public.set_ideas_updated_at()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger set_ideas_updated_at
  before update on public.ideas
  for each row execute function public.set_ideas_updated_at();
