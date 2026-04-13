-- Один раз для существующих аккаунтов: считаем персонажа уже созданным.
alter table public.profiles
add column if not exists character_setup_complete boolean not null default false;

update public.profiles
set character_setup_complete = true
where character_setup_complete = false;

comment on column public.profiles.character_setup_complete is
  'После регистрации false до прохождения экрана «создать персонажа» (пол + никнейм).';
