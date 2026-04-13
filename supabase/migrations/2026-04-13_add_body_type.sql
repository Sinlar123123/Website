alter table public.avatar_appearance
add column if not exists body_type text not null default 'male';

alter table public.avatar_appearance
drop constraint if exists avatar_appearance_body_type_check;

alter table public.avatar_appearance
add constraint avatar_appearance_body_type_check
check (body_type in ('male', 'female'));
