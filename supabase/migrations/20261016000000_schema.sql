-- ═══════════════════════════════════════════════════════════════════════════
-- Pane al Pane · schema del database (Supabase / PostgreSQL)
-- Da eseguire una volta sola: Supabase → SQL Editor → incolla → Run.
-- ═══════════════════════════════════════════════════════════════════════════

create extension if not exists pgcrypto;

-- ─── Redazione ─────────────────────────────────────────────────────────────
-- Ogni utente creato in Supabase Auth riceve un profilo con ruolo «pending»
-- (nessun permesso). Un amministratore lo promuove a «editor» o «admin».
create table public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  email text,
  display_name text,
  role text not null default 'pending' check (role in ('pending', 'editor', 'admin')),
  created_at timestamptz not null default now()
);

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, email, display_name)
  values (new.id, new.email, coalesce(new.raw_user_meta_data ->> 'display_name', split_part(new.email, '@', 1)))
  on conflict (id) do nothing;
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

create or replace function public.is_staff()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.profiles where id = auth.uid() and role in ('editor', 'admin')
  );
$$;

create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (select 1 from public.profiles where id = auth.uid() and role = 'admin');
$$;

-- ─── Impostazioni della testata (una sola riga) ───────────────────────────
create table public.settings (
  id int primary key default 1 check (id = 1),
  masthead text not null default 'Pane al Pane',
  tagline text not null default 'Il giornale degli studenti',
  school_name text not null default 'IPSEOA «Giulio Pastore»',
  school_sites text not null default 'Varallo e Gattinara',
  school_year text not null default '2026/2027',
  about text not null default '',
  footer_note text not null default '',
  updated_at timestamptz not null default now()
);
insert into public.settings (id) values (1) on conflict do nothing;

-- ─── Numeri del giornale ──────────────────────────────────────────────────
create table public.issues (
  id uuid primary key default gen_random_uuid(),
  number int not null unique check (number >= 0),
  title text not null default '' check (char_length(title) <= 200),
  month date not null,
  editorial text,
  cover_image text,
  cover_alt text,
  pdf_url text,
  status text not null default 'draft' check (status in ('draft', 'published')),
  is_demo boolean not null default false,
  published_at date,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ─── Articoli ─────────────────────────────────────────────────────────────
create table public.articles (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique check (slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$'),
  title text not null check (char_length(title) between 1 and 300),
  subtitle text,
  excerpt text,
  body text not null default '',
  author_name text not null default 'La redazione',
  author_role text,
  course text not null check (course in ('aperitivo', 'primo', 'secondo', 'contorno', 'dessert', 'caffe')),
  issue_id uuid references public.issues (id) on delete set null,
  cover_image text,
  cover_alt text,
  cover_credit text,
  status text not null default 'draft' check (status in ('draft', 'published')),
  featured boolean not null default false,
  is_demo boolean not null default false,
  extra jsonb,
  published_at date,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  search tsvector generated always as (
    setweight(to_tsvector('italian'::regconfig, coalesce(title, '')), 'A') ||
    setweight(to_tsvector('italian'::regconfig, coalesce(subtitle, '') || ' ' || coalesce(excerpt, '') || ' ' || coalesce(author_name, '')), 'B') ||
    setweight(to_tsvector('italian'::regconfig, regexp_replace(coalesce(body, ''), '<[^>]+>', ' ', 'g')), 'C')
  ) stored
);

create index articles_search_idx on public.articles using gin (search);
create index articles_course_idx on public.articles (course, published_at desc);
create index articles_issue_idx on public.articles (issue_id);

-- ─── Sondaggi ─────────────────────────────────────────────────────────────
create table public.polls (
  id uuid primary key default gen_random_uuid(),
  question text not null check (char_length(question) between 1 and 300),
  description text,
  status text not null default 'draft' check (status in ('draft', 'open', 'closed')),
  issue_id uuid references public.issues (id) on delete set null,
  is_demo boolean not null default false,
  created_at timestamptz not null default now()
);

create table public.poll_options (
  id uuid primary key default gen_random_uuid(),
  poll_id uuid not null references public.polls (id) on delete cascade,
  label text not null check (char_length(label) between 1 and 200),
  position int not null default 0
);

-- Il voto è anonimo: si conserva solo un'impronta (hash) di un codice casuale
-- salvato nel browser, che serve a impedire voti doppi. Nessun dato personale.
create table public.poll_votes (
  id bigint generated always as identity primary key,
  poll_id uuid not null references public.polls (id) on delete cascade,
  option_id uuid not null references public.poll_options (id) on delete cascade,
  voter_hash text not null,
  created_at timestamptz not null default now(),
  unique (poll_id, voter_hash)
);

-- ─── Contributi dei lettori (sempre moderati) ─────────────────────────────
create table public.submissions (
  id uuid primary key default gen_random_uuid(),
  kind text not null check (kind in ('domanda', 'lettera', 'contributo')),
  title text check (char_length(title) <= 200),
  message text not null check (char_length(message) between 10 and 4000),
  signature text check (char_length(signature) <= 80),
  class_label text check (char_length(class_label) <= 40),
  status text not null default 'pending' check (status in ('pending', 'published', 'archived', 'rejected')),
  answer text check (char_length(answer) <= 4000),
  is_demo boolean not null default false,
  created_at timestamptz not null default now(),
  published_at timestamptz
);

-- ─── Giochi (cruciverba e quiz) ───────────────────────────────────────────
create table public.games (
  id uuid primary key default gen_random_uuid(),
  kind text not null check (kind in ('crossword', 'quiz')),
  title text not null check (char_length(title) between 1 and 200),
  intro text,
  status text not null default 'draft' check (status in ('draft', 'published')),
  issue_id uuid references public.issues (id) on delete set null,
  is_demo boolean not null default false,
  data jsonb not null,
  created_at timestamptz not null default now()
);

-- ─── Aggiornamento automatico di updated_at ───────────────────────────────
create or replace function public.touch_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger issues_touch before update on public.issues
  for each row execute function public.touch_updated_at();
create trigger articles_touch before update on public.articles
  for each row execute function public.touch_updated_at();
create trigger settings_touch before update on public.settings
  for each row execute function public.touch_updated_at();

-- ─── Funzioni pubbliche (voto, risultati, invio contributi) ───────────────
create or replace function public.cast_vote(p_poll uuid, p_option uuid, p_voter text)
returns text
language plpgsql
security definer
set search_path = public
as $$
declare
  v_status text;
begin
  if p_voter is null or char_length(p_voter) < 16 or char_length(p_voter) > 128 then
    return 'invalid';
  end if;
  select status into v_status from public.polls where id = p_poll;
  if v_status is null then
    return 'invalid';
  end if;
  if not exists (select 1 from public.poll_options where id = p_option and poll_id = p_poll) then
    return 'invalid';
  end if;
  if v_status <> 'open' then
    return 'closed';
  end if;
  insert into public.poll_votes (poll_id, option_id, voter_hash)
  values (p_poll, p_option, p_voter)
  on conflict (poll_id, voter_hash) do nothing;
  if found then
    return 'ok';
  end if;
  return 'duplicate';
end;
$$;

create or replace function public.poll_results(p_poll uuid)
returns table (option_id uuid, votes bigint)
language sql
stable
security definer
set search_path = public
as $$
  select o.id, count(v.id)
  from public.poll_options o
  join public.polls p on p.id = o.poll_id
  left join public.poll_votes v on v.option_id = o.id
  where o.poll_id = p_poll and (p.status in ('open', 'closed') or public.is_staff())
  group by o.id;
$$;

create or replace function public.submit_contribution(
  p_kind text, p_title text, p_message text, p_signature text, p_class text
)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.submissions (kind, title, message, signature, class_label, status)
  values (p_kind, nullif(trim(p_title), ''), trim(p_message), nullif(trim(p_signature), ''), nullif(trim(p_class), ''), 'pending');
end;
$$;

revoke all on function public.cast_vote(uuid, uuid, text) from public;
revoke all on function public.poll_results(uuid) from public;
revoke all on function public.submit_contribution(text, text, text, text, text) from public;
grant execute on function public.cast_vote(uuid, uuid, text) to anon, authenticated;
grant execute on function public.poll_results(uuid) to anon, authenticated;
grant execute on function public.submit_contribution(text, text, text, text, text) to anon, authenticated;
