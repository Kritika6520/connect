-- Allow anonymous visitors to view public profile pages and reviewed experience records.
drop policy if exists "Signed-in users can read profiles" on public.profiles;
create policy "Anyone can read public profiles" on public.profiles
  for select to anon, authenticated using (true);
grant select on public.profiles to anon;

create policy "Reviewed experience records are public" on public.submissions
  for select to anon using (status = 'reviewed');
grant select (task_id, user_id, status, feedback, score, created_at) on public.submissions to anon;

create index submissions_reviewed_user_created_idx
  on public.submissions (user_id, created_at desc)
  where status = 'reviewed';
