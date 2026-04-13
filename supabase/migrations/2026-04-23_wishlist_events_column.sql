-- Колонка «Мероприятия» на доске хотелок (концерты, театр, кино и т.д.)

alter table public.wishlist_items drop constraint if exists wishlist_items_column_id_check;

alter table public.wishlist_items add constraint wishlist_items_column_id_check
  check (column_id in ('nastyushka', 'danyushka', 'family', 'dreams', 'events'));
