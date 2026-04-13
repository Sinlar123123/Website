-- Ссылка и картинка у карточки хотелки; публичный bucket wishlist (файлы в папке = user id).

alter table public.wishlist_items add column if not exists link_url text;
alter table public.wishlist_items add column if not exists image_storage_path text;

alter table public.wishlist_items drop constraint if exists wishlist_items_link_url_len;
alter table public.wishlist_items add constraint wishlist_items_link_url_len
  check (link_url is null or (char_length(link_url) <= 2000 and link_url ~ '^https?://'));

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'wishlist',
  'wishlist',
  true,
  5242880,
  array['image/jpeg', 'image/png', 'image/webp', 'image/gif']::text[]
)
on conflict (id) do update set
  public = excluded.public,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

drop policy if exists "wishlist_storage_insert" on storage.objects;
create policy "wishlist_storage_insert"
on storage.objects for insert
to authenticated
with check (
  bucket_id = 'wishlist'
  and (storage.foldername(name))[1] = auth.uid()::text
  and exists (
    select 1 from public.wishlist_allowlist w
    where lower(trim(w.email)) = lower(trim(coalesce(auth.jwt() ->> 'email', '')))
  )
);

drop policy if exists "wishlist_storage_delete" on storage.objects;
create policy "wishlist_storage_delete"
on storage.objects for delete
to authenticated
using (
  bucket_id = 'wishlist'
  and (storage.foldername(name))[1] = auth.uid()::text
  and exists (
    select 1 from public.wishlist_allowlist w
    where lower(trim(w.email)) = lower(trim(coalesce(auth.jwt() ->> 'email', '')))
  )
);

drop policy if exists "wishlist_storage_select" on storage.objects;
create policy "wishlist_storage_select"
on storage.objects for select
to public
using (bucket_id = 'wishlist');
