-- Keep reviewed submission summaries public only for anonymous profile visitors.
drop policy if exists "Reviewed experience records are public" on public.submissions;
create policy "Reviewed experience records are public" on public.submissions
  for select to anon using (status = 'reviewed');

create or replace function public.valid_text_array(p_values text[], p_max_count integer, p_max_length integer)
returns boolean
language sql
immutable
parallel safe
set search_path = ''
as $$
  select p_values is not null
    and pg_catalog.cardinality(p_values) <= p_max_count
    and coalesce((
      select pg_catalog.bool_and(pg_catalog.char_length(pg_catalog.btrim(tag)) between 1 and p_max_length)
      from pg_catalog.unnest(p_values) as items(tag)
    ), true);
$$;

create or replace function public.valid_open_roles(p_roles jsonb)
returns boolean
language plpgsql
immutable
set search_path = ''
as $$
declare
  role_item jsonb;
  skill_item jsonb;
begin
  if pg_catalog.jsonb_typeof(p_roles) <> 'array' or pg_catalog.jsonb_array_length(p_roles) > 20 then
    return false;
  end if;
  for role_item in select value from pg_catalog.jsonb_array_elements(p_roles) as roles(value) loop
    if pg_catalog.jsonb_typeof(role_item) <> 'object'
      or coalesce(pg_catalog.jsonb_typeof(role_item -> 'title') <> 'string', true)
      or pg_catalog.char_length(pg_catalog.btrim(role_item ->> 'title')) not between 1 and 60
      or coalesce(pg_catalog.jsonb_typeof(role_item -> 'description') <> 'string', true)
      or pg_catalog.char_length(role_item ->> 'description') > 240
      or coalesce(pg_catalog.jsonb_typeof(role_item -> 'skills') <> 'array', true)
      or pg_catalog.jsonb_array_length(role_item -> 'skills') > 10 then
      return false;
    end if;
    for skill_item in select value from pg_catalog.jsonb_array_elements(role_item -> 'skills') as skills(value) loop
      if pg_catalog.jsonb_typeof(skill_item) <> 'string'
        or pg_catalog.char_length(pg_catalog.btrim(skill_item #>> '{}')) not between 1 and 40 then
        return false;
      end if;
    end loop;
  end loop;
  return true;
end;
$$;

-- Enforce limits at the database boundary as well as in Zod server actions.
alter table public.profiles
  add constraint profiles_full_name_length check (char_length(full_name) <= 80) not valid,
  add constraint profiles_college_length check (college is null or char_length(college) <= 120) not valid,
  add constraint profiles_education_length check (education is null or char_length(education) <= 120) not valid,
  add constraint profiles_bio_length check (bio is null or char_length(bio) <= 500) not valid,
  add constraint profiles_skills_count check (public.valid_text_array(skills, 20, 40)) not valid,
  add constraint profiles_interests_count check (public.valid_text_array(interests, 20, 40)) not valid,
  add constraint profiles_links_http check (
    (github_url is null or github_url ~* '^https?://') and
    (linkedin_url is null or linkedin_url ~* '^https?://') and
    (portfolio_url is null or portfolio_url ~* '^https?://') and
    (avatar_url is null or avatar_url ~* '^https?://')
  ) not valid;

alter table public.companies
  add constraint companies_description_length check (char_length(description) <= 3000) not valid,
  add constraint companies_industry_length check (char_length(industry) <= 80) not valid,
  add constraint companies_location_length check (location is null or char_length(location) <= 120) not valid,
  add constraint companies_tech_count check (public.valid_text_array(tech, 20, 40)) not valid,
  add constraint companies_links_http check (
    (website is null or website ~* '^https?://') and
    (logo_url is null or logo_url ~* '^https?://')
  ) not valid;

alter table public.tasks
  add constraint tasks_description_length check (char_length(description) between 1 and 5000) not valid,
  add constraint tasks_domain_length check (char_length(domain) between 2 and 80) not valid,
  add constraint tasks_role_length check (char_length(role) between 2 and 80) not valid,
  add constraint tasks_skills_count check (public.valid_text_array(skills, 20, 40)) not valid,
  add constraint tasks_deliverables_length check (char_length(deliverables) between 1 and 3000) not valid,
  add constraint tasks_evaluation_length check (char_length(evaluation_criteria) between 1 and 3000) not valid;

alter table public.submissions
  add constraint submissions_feedback_length check (feedback is null or char_length(feedback) <= 3000) not valid,
  add constraint submissions_link_http check (link_url is null or link_url ~* '^https?://') not valid;

alter table public.ideas
  add constraint ideas_skills_count check (public.valid_text_array(skills_needed, 20, 40)) not valid;

alter table public.teams
  add constraint teams_open_roles_schema check (public.valid_open_roles(open_roles)) not valid;
