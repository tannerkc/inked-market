-- 011 wrote `storage.foldername(name)` inside an EXISTS subquery over
-- public.studios, where the unqualified `name` bound to studios.name (inner
-- scope shadows the policy's target table) instead of storage.objects.name.
-- foldername(<studio name>) is always empty, so every owner write was
-- rejected. Recreate the policies with the objects column qualified.

drop policy if exists "Owners upload to own studio folder" on storage.objects;
drop policy if exists "Owners update own studio images" on storage.objects;
drop policy if exists "Owners delete own studio images" on storage.objects;

create policy "Owners upload to own studio folder"
  on storage.objects for insert to authenticated
  with check (
    bucket_id = 'studio-images'
    and exists (
      select 1 from public.studios s
      where s.id::text = (storage.foldername(objects.name))[1]
        and s.claimed_by = auth.uid()
    )
  );

create policy "Owners update own studio images"
  on storage.objects for update to authenticated
  using (
    bucket_id = 'studio-images'
    and exists (
      select 1 from public.studios s
      where s.id::text = (storage.foldername(objects.name))[1]
        and s.claimed_by = auth.uid()
    )
  );

create policy "Owners delete own studio images"
  on storage.objects for delete to authenticated
  using (
    bucket_id = 'studio-images'
    and exists (
      select 1 from public.studios s
      where s.id::text = (storage.foldername(objects.name))[1]
        and s.claimed_by = auth.uid()
    )
  );
