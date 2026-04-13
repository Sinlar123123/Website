-- Доска хотелок: 4 колонки (Настюшка, Данюшка, Семья, Мечты).
-- Сначала снимаем старый check, чтобы переписать значения.

alter table public.wishlist_items drop constraint if exists wishlist_items_column_id_check;

update public.wishlist_items set column_id = 'dreams' where column_id = 'backlog';
update public.wishlist_items set column_id = 'family' where column_id = 'next';
update public.wishlist_items set column_id = 'dreams' where column_id = 'done';
update public.wishlist_items set column_id = 'dreams' where column_id not in ('nastyushka', 'danyushka', 'family', 'dreams');

alter table public.wishlist_items alter column column_id set default 'dreams';

alter table public.wishlist_items add constraint wishlist_items_column_id_check
  check (column_id in ('nastyushka', 'danyushka', 'family', 'dreams'));
