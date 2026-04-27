-- Ensure 'documents' storage bucket exists and is public
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'documents',
  'documents',
  true,
  10485760,
  array['image/png','image/jpeg','image/jpg','image/webp','image/gif','application/pdf']
)
on conflict (id) do update
  set public = true,
      file_size_limit = excluded.file_size_limit,
      allowed_mime_types = excluded.allowed_mime_types;

-- Public read
drop policy if exists "Public read documents" on storage.objects;
create policy "Public read documents"
  on storage.objects for select
  using (bucket_id = 'documents');

-- Public/anon insert
drop policy if exists "Anyone can upload documents" on storage.objects;
create policy "Anyone can upload documents"
  on storage.objects for insert
  with check (bucket_id = 'documents');

drop policy if exists "Anyone can update documents" on storage.objects;
create policy "Anyone can update documents"
  on storage.objects for update
  using (bucket_id = 'documents');

drop policy if exists "Anyone can delete documents" on storage.objects;
create policy "Anyone can delete documents"
  on storage.objects for delete
  using (bucket_id = 'documents');
