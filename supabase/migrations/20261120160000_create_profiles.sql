create table public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  full_name text not null default '',
  username text,
  college text,
  education text,
  bio text,
  skills text[] not null default '{}',
  interests text[] not null default '{}',
  github_url text,
  linkedin_url text,
  portfolio_url text,
  availability text,
  avatar_url text,
  created_at timestamptz not null default now(),
  constraint profiles_username_format check (
    username is null or username ~ '^[a-z0-9_]{3,24}$'
  )
);

create unique index profiles_username_unique_idx
  on public.profiles (lower(username))
  where username is not null;

alter table public.profiles enable row level security;

create policy "Signed-in users can read profiles"
  on public.profiles
  for select
  to authenticated
  using (true);

create policy "Owners can update their profile"
  on public.profiles
  for update
  to authenticated
  using ((select auth.uid()) = id)
  with check ((select auth.uid()) = id);

revoke all on public.profiles from anon, authenticated;
grant select on public.profiles to authenticated;
grant update (
  full_name,
  username,
  college,
  education,
  bio,
  skills,
  interests,
  github_url,
  linkedin_url,
  portfolio_url,
  availability,
  avatar_url
) on public.profiles to authenticated;

create or replace function public.handle_new_user_profile()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.profiles (id, full_name)
  values (new.id, coalesce(new.raw_user_meta_data ->> 'full_name', new.raw_user_meta_data ->> 'name', ''));
  return new;
end;
$$;

drop trigger if exists on_auth_user_created_profile on auth.users;
create trigger on_auth_user_created_profile
  after insert on auth.users
  for each row execute function public.handle_new_user_profile();
