-- Owner-scoped storage access for studio-images.
-- 001's insert policy allowed any authenticated user to write anywhere in the
-- bucket and nobody could update/delete. Object paths are {studio_id}/{uuid}.ext;
-- scope all writes to studios the caller has claimed. Public read unchanged.

drop policy if exists "Studio owners can upload images" on storage.objects;

create policy "Owners upload to own studio folder"
  on storage.objects for insert to authenticated
  with check (
    bucket_id = 'studio-images'
    and exists (
      select 1 from public.studios s
      where s.id::text = (storage.foldername(name))[1]
        and s.claimed_by = auth.uid()
    )
  );

create policy "Owners update own studio images"
  on storage.objects for update to authenticated
  using (
    bucket_id = 'studio-images'
    and exists (
      select 1 from public.studios s
      where s.id::text = (storage.foldername(name))[1]
        and s.claimed_by = auth.uid()
    )
  );

create policy "Owners delete own studio images"
  on storage.objects for delete to authenticated
  using (
    bucket_id = 'studio-images'
    and exists (
      select 1 from public.studios s
      where s.id::text = (storage.foldername(name))[1]
        and s.claimed_by = auth.uid()
    )
  );
