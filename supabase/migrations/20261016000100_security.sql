-- ═══════════════════════════════════════════════════════════════════════════
-- Pane al Pane · regole di sicurezza (Row Level Security)
-- I lettori vedono solo ciò che è pubblicato; solo la redazione può scrivere.
-- ═══════════════════════════════════════════════════════════════════════════

alter table public.profiles enable row level security;
alter table public.settings enable row level security;
alter table public.issues enable row level security;
alter table public.articles enable row level security;
alter table public.polls enable row level security;
alter table public.poll_options enable row level security;
alter table public.poll_votes enable row level security;
alter table public.submissions enable row level security;
alter table public.games enable row level security;

-- Profili: ognuno vede il proprio; l'amministratore vede e modifica tutti.
create policy "profili: lettura" on public.profiles
  for select to authenticated using (id = auth.uid() or public.is_admin());
create policy "profili: ruoli gestiti dall'admin" on public.profiles
  for update to authenticated using (public.is_admin()) with check (public.is_admin());

-- Impostazioni: lettura pubblica, modifica della redazione.
create policy "impostazioni: lettura" on public.settings
  for select to anon, authenticated using (true);
create policy "impostazioni: modifica" on public.settings
  for update to authenticated using (public.is_staff()) with check (public.is_staff());

-- Numeri: pubblici solo se pubblicati.
create policy "numeri: lettura" on public.issues
  for select to anon, authenticated using (status = 'published' or public.is_staff());
create policy "numeri: inserimento" on public.issues
  for insert to authenticated with check (public.is_staff());
create policy "numeri: modifica" on public.issues
  for update to authenticated using (public.is_staff()) with check (public.is_staff());
create policy "numeri: eliminazione" on public.issues
  for delete to authenticated using (public.is_staff());

-- Articoli: visibili se pubblicati e (senza numero o con il numero pubblicato).
create policy "articoli: lettura" on public.articles
  for select to anon, authenticated using (
    public.is_staff()
    or (
      status = 'published'
      and (
        issue_id is null
        or exists (select 1 from public.issues i where i.id = issue_id and i.status = 'published')
      )
    )
  );
create policy "articoli: inserimento" on public.articles
  for insert to authenticated with check (public.is_staff());
create policy "articoli: modifica" on public.articles
  for update to authenticated using (public.is_staff()) with check (public.is_staff());
create policy "articoli: eliminazione" on public.articles
  for delete to authenticated using (public.is_staff());

-- Sondaggi e opzioni: pubblici se aperti o chiusi (non in bozza).
create policy "sondaggi: lettura" on public.polls
  for select to anon, authenticated using (status in ('open', 'closed') or public.is_staff());
create policy "sondaggi: gestione" on public.polls
  for all to authenticated using (public.is_staff()) with check (public.is_staff());
create policy "opzioni: lettura" on public.poll_options
  for select to anon, authenticated using (
    exists (select 1 from public.polls p where p.id = poll_id and (p.status in ('open', 'closed') or public.is_staff()))
  );
create policy "opzioni: gestione" on public.poll_options
  for all to authenticated using (public.is_staff()) with check (public.is_staff());

-- Voti: nessuna lettura diretta. Si vota solo tramite cast_vote(),
-- si leggono i totali solo tramite poll_results(). La redazione può
-- inserire i voti dimostrativi e cancellare i voti.
create policy "voti: gestione redazione" on public.poll_votes
  for all to authenticated using (public.is_staff()) with check (public.is_staff());

-- Contributi: i lettori vedono solo quelli pubblicati; inviano tramite
-- submit_contribution(), che li salva sempre «in attesa».
create policy "contributi: lettura" on public.submissions
  for select to anon, authenticated using (status = 'published' or public.is_staff());
create policy "contributi: gestione" on public.submissions
  for all to authenticated using (public.is_staff()) with check (public.is_staff());

-- Giochi.
create policy "giochi: lettura" on public.games
  for select to anon, authenticated using (status = 'published' or public.is_staff());
create policy "giochi: gestione" on public.games
  for all to authenticated using (public.is_staff()) with check (public.is_staff());

-- Permessi espliciti per le API di Supabase (le regole qui sopra decidono
-- comunque riga per riga che cosa si può leggere o modificare).
grant usage on schema public to anon, authenticated;
grant select on public.settings, public.issues, public.articles, public.polls,
  public.poll_options, public.submissions, public.games to anon, authenticated;
grant select, update on public.profiles to authenticated;
grant update on public.settings to authenticated;
grant insert, update, delete on public.issues, public.articles, public.polls,
  public.poll_options, public.submissions, public.games to authenticated;
grant select, insert, delete on public.poll_votes to authenticated;
grant usage on all sequences in schema public to authenticated;
