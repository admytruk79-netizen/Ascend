-- Auto-create a public.profiles row whenever a new auth.users row appears
-- (magic-link sign-up). Without this, P3's sync code would need to upsert
-- profiles itself on first sync, which is a race against RLS (a user can't
-- insert into profiles for an id that isn't auth.uid() yet in edge cases
-- around first-session timing) — doing it in a trigger, running as the
-- table owner, sidesteps that entirely.

create function public.handle_new_auth_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id) values (new.id);
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_auth_user();
