-- Приблизительная цена на карточке хотелки (свободный текст, например: до 5к, ~15 000 руб).

alter table public.wishlist_items add column if not exists approximate_price text;

alter table public.wishlist_items drop constraint if exists wishlist_items_approximate_price_len;
alter table public.wishlist_items add constraint wishlist_items_approximate_price_len
  check (approximate_price is null or char_length(trim(approximate_price)) <= 120);
