alter table public.profiles
  add column role text not null default 'student'
  check (role in ('student', 'company', 'admin'));

create table public.companies (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid references auth.users(id) on delete cascade,
  name text not null check (char_length(name) between 2 and 120),
  logo_url text,
  description text not null default '',
  industry text not null default '',
  tech text[] not null default '{}',
  website text,
  location text,
  created_at timestamptz not null default now()
);

create table public.tasks (
  id uuid primary key default gen_random_uuid(),
  company_id uuid not null references public.companies(id) on delete cascade,
  title text not null check (char_length(title) between 3 and 160),
  description text not null,
  domain text not null,
  role text not null,
  skills text[] not null default '{}',
  difficulty text not null check (difficulty in ('Beginner', 'Intermediate', 'Advanced')),
  est_hours integer not null check (est_hours between 1 and 500),
  deadline date,
  deliverables text not null,
  evaluation_criteria text not null,
  created_at timestamptz not null default now()
);

create table public.submissions (
  id uuid primary key default gen_random_uuid(),
  task_id uuid not null references public.tasks(id) on delete cascade,
  user_id uuid not null default auth.uid() references auth.users(id) on delete cascade,
  content text not null check (char_length(content) between 1 and 10000),
  link_url text,
  status text not null default 'submitted' check (status in ('submitted', 'reviewed')),
  feedback text,
  score integer check (score between 0 and 100),
  created_at timestamptz not null default now(),
  unique (task_id, user_id)
);

create index tasks_company_id_idx on public.tasks(company_id);
create index tasks_domain_idx on public.tasks(domain);
create index tasks_skills_idx on public.tasks using gin(skills);
create index submissions_task_id_idx on public.submissions(task_id);

alter table public.companies enable row level security;
alter table public.tasks enable row level security;
alter table public.submissions enable row level security;

revoke all on public.companies, public.tasks, public.submissions from anon, authenticated;
grant select on public.companies, public.tasks to anon, authenticated;
grant insert, update, delete on public.companies to authenticated;
grant insert, update, delete on public.tasks to authenticated;
grant select on public.submissions to authenticated;
grant insert (task_id, user_id, content, link_url) on public.submissions to authenticated;
grant update (status, feedback, score) on public.submissions to authenticated;

create policy "Companies are publicly readable" on public.companies for select to anon, authenticated using (true);
create policy "Company owners manage their company" on public.companies for all to authenticated
  using ((select auth.uid()) = owner_id and exists (select 1 from public.profiles p where p.id = (select auth.uid()) and p.role in ('company', 'admin')))
  with check ((select auth.uid()) = owner_id and exists (select 1 from public.profiles p where p.id = (select auth.uid()) and p.role in ('company', 'admin')));

create policy "Tasks are publicly readable" on public.tasks for select to anon, authenticated using (true);
create policy "Company owners manage their tasks" on public.tasks for all to authenticated
  using (exists (select 1 from public.companies c where c.id = company_id and c.owner_id = (select auth.uid())))
  with check (exists (select 1 from public.companies c where c.id = company_id and c.owner_id = (select auth.uid())));

create policy "Students read their submissions and task companies review" on public.submissions for select to authenticated
  using (user_id = (select auth.uid()) or exists (select 1 from public.tasks t join public.companies c on c.id = t.company_id where t.id = task_id and c.owner_id = (select auth.uid())));
create policy "Students submit their own work" on public.submissions for insert to authenticated
  with check (user_id = (select auth.uid()) and exists (select 1 from public.profiles p where p.id = (select auth.uid()) and p.role = 'student'));
create policy "Company owners review submissions" on public.submissions for update to authenticated
  using (exists (select 1 from public.tasks t join public.companies c on c.id = t.company_id where t.id = task_id and c.owner_id = (select auth.uid())))
  with check (exists (select 1 from public.tasks t join public.companies c on c.id = t.company_id where t.id = task_id and c.owner_id = (select auth.uid())));

-- Seeded company pages are read-only examples until an authenticated company owner is assigned.
insert into public.companies (id, name, description, industry, tech, website, location) values
('a1000000-0000-4000-8000-000000000001', 'Northstar Labs', 'A product studio making thoughtful tools for everyday work.', 'Technology', array['React','TypeScript','Figma'], 'https://example.com', 'Remote'),
('a1000000-0000-4000-8000-000000000002', 'TerraKind', 'Helping communities make measurable progress on climate goals.', 'Climate', array['Python','Data','GIS'], 'https://example.com', 'New York, NY'),
('a1000000-0000-4000-8000-000000000003', 'Carewell', 'Designing more accessible ways to navigate health information.', 'Health', array['Research','UX','React'], 'https://example.com', 'Remote'),
('a1000000-0000-4000-8000-000000000004', 'Common Ground', 'Building community-powered products for local organizations.', 'Social Impact', array['Writing','Design','SQL'], 'https://example.com', 'Chicago, IL');

insert into public.tasks (company_id, title, description, domain, role, skills, difficulty, est_hours, deadline, deliverables, evaluation_criteria) values
('a1000000-0000-4000-8000-000000000001', 'Audit a product onboarding flow', 'Review a sample onboarding flow and identify where new users lose clarity.', 'Product', 'Product Design', array['UX Research','Figma','Writing'], 'Beginner', 5, null, 'Annotated flow and a prioritized list of improvements.', 'Clarity, evidence, and usefulness of recommendations.'),
('a1000000-0000-4000-8000-000000000001', 'Build a responsive dashboard widget', 'Create a small accessible dashboard widget using the supplied sample data.', 'Technology', 'Frontend Development', array['React','TypeScript','CSS'], 'Intermediate', 10, null, 'A working demo and short implementation notes.', 'Responsive behavior, accessibility, and code quality.'),
('a1000000-0000-4000-8000-000000000002', 'Map neighborhood tree coverage', 'Explore the sample tree inventory and summarize coverage gaps across neighborhoods.', 'Climate', 'Data Analysis', array['Python','GIS','Data Visualization'], 'Intermediate', 8, null, 'A notebook or report with one clear map and findings.', 'Sound analysis, readable visuals, and actionable insight.'),
('a1000000-0000-4000-8000-000000000002', 'Write a climate impact explainer', 'Turn a technical climate metric into a clear explainer for community partners.', 'Climate', 'Content Design', array['Writing','Research','Climate'], 'Beginner', 4, null, 'A one-page explainer with sources.', 'Accuracy, accessibility, and audience fit.'),
('a1000000-0000-4000-8000-000000000003', 'Improve a health resource search', 'Prototype a more helpful search experience for a library of health resources.', 'Health', 'UX Design', array['UX','Figma','Accessibility'], 'Advanced', 12, null, 'Clickable prototype and a brief rationale.', 'Accessibility, information architecture, and usability.'),
('a1000000-0000-4000-8000-000000000003', 'Create a health FAQ component', 'Build a reusable FAQ component for a patient education page using example content.', 'Health', 'Frontend Development', array['React','Accessibility','CSS'], 'Intermediate', 8, null, 'A responsive, keyboard accessible component.', 'Accessibility, maintainability, and visual clarity.'),
('a1000000-0000-4000-8000-000000000004', 'Analyze community program feedback', 'Find themes in a small anonymized set of community program feedback.', 'Social Impact', 'Research', array['Research','SQL','Communication'], 'Beginner', 6, null, 'A short findings memo with representative themes.', 'Careful synthesis, privacy, and clear next steps.'),
('a1000000-0000-4000-8000-000000000004', 'Design a volunteer sign-up page', 'Design a mobile-first sign-up page that helps local volunteers choose a shift.', 'Social Impact', 'Product Design', array['Figma','Product Design','Writing'], 'Intermediate', 7, null, 'A mobile and desktop prototype with interaction notes.', 'Ease of use, inclusive language, and responsive thinking.');
