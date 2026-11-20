create type public.join_request_status as enum ('pending', 'accepted', 'rejected');

create table public.teams (
  id uuid primary key default gen_random_uuid(),
  name text not null check (char_length(name) between 3 and 100),
  description text not null check (char_length(description) between 1 and 3000),
  idea_id uuid references public.ideas (id) on delete set null,
  owner_id uuid not null default auth.uid() references auth.users (id) on delete cascade,
  open_roles jsonb not null default '[]'::jsonb,
  size_limit integer not null default 5 check (size_limit between 2 and 50),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint teams_open_roles_array check (
    jsonb_typeof(open_roles) = 'array' and jsonb_array_length(open_roles) <= 20
  )
);

create index teams_created_at_idx on public.teams (created_at desc);
create index teams_owner_id_idx on public.teams (owner_id);
create index teams_idea_id_idx on public.teams (idea_id);

create table public.team_members (
  team_id uuid not null references public.teams (id) on delete cascade,
  user_id uuid not null references auth.users (id) on delete cascade,
  role text not null default 'member' check (role in ('owner', 'member')),
  created_at timestamptz not null default now(),
  primary key (team_id, user_id)
);

create index team_members_user_id_idx on public.team_members (user_id);

create table public.join_requests (
  id uuid primary key default gen_random_uuid(),
  team_id uuid not null references public.teams (id) on delete cascade,
  user_id uuid not null references auth.users (id) on delete cascade,
  message text not null default '' check (char_length(message) <= 1000),
  status public.join_request_status not null default 'pending',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (team_id, user_id)
);

create index join_requests_team_status_idx on public.join_requests (team_id, status, created_at);
create index join_requests_user_id_idx on public.join_requests (user_id);

alter table public.teams enable row level security;
alter table public.team_members enable row level security;
alter table public.join_requests enable row level security;

revoke all on public.teams, public.team_members, public.join_requests from public, anon, authenticated;

grant select on public.teams to anon, authenticated;
grant insert, update, delete on public.teams to authenticated;
grant select, insert, update, delete on public.team_members to authenticated;
grant select, insert on public.join_requests to authenticated;

create policy "Anyone can read teams"
  on public.teams for select to anon, authenticated using (true);

create policy "Owners create teams"
  on public.teams for insert to authenticated
  with check ((select auth.uid()) = owner_id);

create policy "Owners update teams"
  on public.teams for update to authenticated
  using ((select auth.uid()) = owner_id)
  with check ((select auth.uid()) = owner_id);

create policy "Owners delete teams"
  on public.teams for delete to authenticated
  using ((select auth.uid()) = owner_id);

create policy "Signed-in users can read team members"
  on public.team_members for select to authenticated using (true);

create policy "Owners add team members"
  on public.team_members for insert to authenticated
  with check (
    role = 'member'
    and exists (
      select 1 from public.teams t
      where t.id = team_id and t.owner_id = (select auth.uid())
    )
  );

create policy "Owners update team members"
  on public.team_members for update to authenticated
  using (
    role = 'member'
    and exists (
      select 1 from public.teams t
      where t.id = team_id and t.owner_id = (select auth.uid())
    )
  )
  with check (
    role = 'member'
    and exists (
      select 1 from public.teams t
      where t.id = team_id and t.owner_id = (select auth.uid())
    )
  );

create policy "Owners remove team members"
  on public.team_members for delete to authenticated
  using (
    role = 'member'
    and exists (
      select 1 from public.teams t
      where t.id = team_id and t.owner_id = (select auth.uid())
    )
  );

create policy "Requesters and owners can read join requests"
  on public.join_requests for select to authenticated
  using (
    user_id = (select auth.uid())
    or exists (
      select 1 from public.teams t
      where t.id = team_id and t.owner_id = (select auth.uid())
    )
  );

create policy "Users request to join teams"
  on public.join_requests for insert to authenticated
  with check (
    user_id = (select auth.uid())
    and status = 'pending'
    and exists (
      select 1 from public.teams t
      where t.id = team_id
        and t.owner_id <> (select auth.uid())
        and (select count(*) from public.team_members m where m.team_id = t.id) < t.size_limit
    )
    and not exists (
      select 1 from public.team_members m
      where m.team_id = join_requests.team_id and m.user_id = (select auth.uid())
    )
  );

create or replace function public.set_teams_updated_at()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger set_teams_updated_at
  before update on public.teams
  for each row execute function public.set_teams_updated_at();

create trigger set_join_requests_updated_at
  before update on public.join_requests
  for each row execute function public.set_teams_updated_at();

create or replace function public.add_team_owner_as_member()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.team_members (team_id, user_id, role)
  values (new.id, new.owner_id, 'owner');
  return new;
end;
$$;

create trigger add_team_owner_after_insert
  after insert on public.teams
  for each row execute function public.add_team_owner_as_member();

create or replace function public.enforce_team_member_capacity()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  team_capacity integer;
  current_members integer;
begin
  if tg_op = 'UPDATE' and old.team_id = new.team_id and old.user_id = new.user_id then
    return new;
  end if;

  select size_limit into team_capacity
  from public.teams
  where id = new.team_id
  for update;

  if not found then
    raise exception 'Team not found';
  end if;

  select count(*) into current_members
  from public.team_members
  where team_id = new.team_id;

  if current_members >= team_capacity then
    raise exception 'This team is full';
  end if;

  return new;
end;
$$;

create trigger enforce_team_member_capacity
  before insert or update of team_id, user_id on public.team_members
  for each row execute function public.enforce_team_member_capacity();

create or replace function public.prevent_team_size_below_members()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  current_members integer;
begin
  select count(*) into current_members
  from public.team_members
  where team_id = new.id;

  if new.size_limit < current_members then
    raise exception 'Team size limit cannot be below current membership';
  end if;

  return new;
end;
$$;

create trigger prevent_team_size_below_members
  before update of size_limit on public.teams
  for each row execute function public.prevent_team_size_below_members();

create or replace function public.handle_team_join_request(
  p_request_id uuid,
  p_decision public.join_request_status
)
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  request_row public.join_requests%rowtype;
  team_row public.teams%rowtype;
  member_count integer;
begin
  if (select auth.uid()) is null then
    raise exception 'Authentication required';
  end if;

  if p_decision not in ('accepted', 'rejected') then
    raise exception 'Invalid request decision';
  end if;

  select * into request_row
  from public.join_requests
  where id = p_request_id
  for update;

  if not found then
    raise exception 'Request not found';
  end if;

  select * into team_row
  from public.teams
  where id = request_row.team_id
  for update;

  if not found or team_row.owner_id <> (select auth.uid()) then
    raise exception 'Only the team owner can review requests';
  end if;

  if request_row.status <> 'pending' then
    raise exception 'Request has already been reviewed';
  end if;

  if p_decision = 'accepted' then
    select count(*) into member_count
    from public.team_members
    where team_id = team_row.id;

    if member_count >= team_row.size_limit then
      raise exception 'This team is full';
    end if;

    insert into public.team_members (team_id, user_id, role)
    values (team_row.id, request_row.user_id, 'member');
  end if;

  update public.join_requests
  set status = p_decision, updated_at = now()
  where id = request_row.id;
end;
$$;

revoke execute on function public.handle_team_join_request(uuid, public.join_request_status) from public, anon;
grant execute on function public.handle_team_join_request(uuid, public.join_request_status) to authenticated;
revoke execute on function public.add_team_owner_as_member() from public, anon, authenticated;
revoke execute on function public.enforce_team_member_capacity() from public, anon, authenticated;
revoke execute on function public.prevent_team_size_below_members() from public, anon, authenticated;
