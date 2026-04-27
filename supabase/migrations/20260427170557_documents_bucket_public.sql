-- Make documents bucket public so document images render in the app
insert into storage.buckets (id, name, public)
values ('documents', 'documents', true)
on conflict (id) do update set public = true;

-- Allow public read of documents
do $$
begin
  if not exists (
    select 1 from pg_policies
    where schemaname = 'storage' and tablename = 'objects' and policyname = 'Public read documents'
  ) then
    create policy "Public read documents"
      on storage.objects for select
      using (bucket_id = 'documents');
  end if;
end$$;

-- Allow uploads from anon/authenticated (app uses anon key)
do $$
begin
  if not exists (
    select 1 from pg_policies
    where schemaname = 'storage' and tablename = 'objects' and policyname = 'Anyone can upload documents'
  ) then
    create policy "Anyone can upload documents"
      on storage.objects for insert
      with check (bucket_id = 'documents');
  end if;
end$$;
