-- ═══════════════════════════════════════════════════════════════════════════
-- Pane al Pane · archivio file (immagini degli articoli e PDF dei numeri)
-- Bucket pubblico in lettura: chiunque può vedere le immagini pubblicate,
-- solo la redazione può caricare, sostituire o cancellare i file.
-- ═══════════════════════════════════════════════════════════════════════════

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'media',
  'media',
  true,
  20971520, -- 20 MB: il PDF di un numero; le foto arrivano già ridotte dal sito
  array['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'application/pdf']
)
on conflict (id) do update set
  public = excluded.public,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

create policy "media: caricamento redazione" on storage.objects
  for insert to authenticated with check (bucket_id = 'media' and public.is_staff());
create policy "media: modifica redazione" on storage.objects
  for update to authenticated using (bucket_id = 'media' and public.is_staff());
create policy "media: eliminazione redazione" on storage.objects
  for delete to authenticated using (bucket_id = 'media' and public.is_staff());
