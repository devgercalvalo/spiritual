-- Bucket público para imágenes de posts, productos y kits.
insert into storage.buckets (id, name, public)
values ('media', 'media', true)
on conflict (id) do nothing;

create policy "media: lectura pública"
  on storage.objects for select
  using (bucket_id = 'media');

create policy "media: admin sube archivos"
  on storage.objects for insert
  with check (bucket_id = 'media' and public.is_admin());

create policy "media: admin actualiza archivos"
  on storage.objects for update
  using (bucket_id = 'media' and public.is_admin())
  with check (bucket_id = 'media' and public.is_admin());

create policy "media: admin elimina archivos"
  on storage.objects for delete
  using (bucket_id = 'media' and public.is_admin());
