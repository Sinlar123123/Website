-- Доска «хотелок» для пары: канбан в разделе «Полезное».
-- После применения добавьте email в public.wishlist_allowlist (SQL Editor):
--   insert into public.wishlist_allowlist (email) values ('you@example.com'), ('partner@example.com');

create table if not exists public.wishlist_allowlist (
  email text primary key
);

alter table public.wishlist_allowlist enable row level security;

drop policy if exists "wishlist_allowlist_self_read" on public.wishlist_allowlist;
create policy "wishlist_allowlist_self_read"
on public.wishlist_allowlist for select
to authenticated
using (
  lower(trim(email)) = lower(trim(coalesce(auth.jwt() ->> 'email', '')))
);

create table if not exists public.wishlist_items (
  id uuid primary key default gen_random_uuid(),
  body text not null check (char_length(trim(body)) > 0),
  column_id text not null default 'backlog' check (column_id in ('backlog', 'next', 'done')),
  author_label text not null default '' check (char_length(author_label) <= 32),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists wishlist_items_column_created_idx
  on public.wishlist_items (column_id, created_at desc);

alter table public.wishlist_items enable row level security;

drop policy if exists "wishlist_items_select_allowed" on public.wishlist_items;
create policy "wishlist_items_select_allowed"
on public.wishlist_items for select
to authenticated
using (
  exists (
    select 1 from public.wishlist_allowlist w
    where lower(trim(w.email)) = lower(trim(coalesce(auth.jwt() ->> 'email', '')))
  )
);

drop policy if exists "wishlist_items_insert_allowed" on public.wishlist_items;
create policy "wishlist_items_insert_allowed"
on public.wishlist_items for insert
to authenticated
with check (
  exists (
    select 1 from public.wishlist_allowlist w
    where lower(trim(w.email)) = lower(trim(coalesce(auth.jwt() ->> 'email', '')))
  )
);

drop policy if exists "wishlist_items_update_allowed" on public.wishlist_items;
create policy "wishlist_items_update_allowed"
on public.wishlist_items for update
to authenticated
using (
  exists (
    select 1 from public.wishlist_allowlist w
    where lower(trim(w.email)) = lower(trim(coalesce(auth.jwt() ->> 'email', '')))
  )
)
with check (
  exists (
    select 1 from public.wishlist_allowlist w
    where lower(trim(w.email)) = lower(trim(coalesce(auth.jwt() ->> 'email', '')))
  )
);

drop policy if exists "wishlist_items_delete_allowed" on public.wishlist_items;
create policy "wishlist_items_delete_allowed"
on public.wishlist_items for delete
to authenticated
using (
  exists (
    select 1 from public.wishlist_allowlist w
    where lower(trim(w.email)) = lower(trim(coalesce(auth.jwt() ->> 'email', '')))
  )
);
