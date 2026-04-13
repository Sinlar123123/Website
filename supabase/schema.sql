-- Run this script in Supabase SQL Editor.
-- It creates all tables, RLS policies, and starter data for the avatar MVP.

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text not null unique,
  display_name text not null default '',
  character_setup_complete boolean not null default false,
  coins integer not null default 0,
  xp integer not null default 0,
  level integer not null default 1,
  created_at timestamptz not null default now()
);

create table if not exists public.avatar_appearance (
  user_id uuid primary key references public.profiles(id) on delete cascade,
  body_type text not null default 'male' check (body_type in ('male', 'female')),
  hair text not null default 'short',
  eyes text not null default 'brown',
  nose text not null default 'classic',
  mouth text not null default 'smile',
  top text not null default 'shirt_blue',
  bottom text not null default 'pants_dark',
  boots text not null default 'boots_black',
  equipped_slots jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now()
);

create table if not exists public.activity_log (
  id bigint generated always as identity primary key,
  user_id uuid not null references public.profiles(id) on delete cascade,
  action_type text not null,
  coins_delta integer not null default 0,
  xp_delta integer not null default 0,
  created_at timestamptz not null default now()
);

create table if not exists public.items (
  slug text primary key,
  name text not null,
  slot text not null,
  price integer not null check (price >= 0),
  icon text not null default '🎁',
  rarity text not null default 'common',
  created_at timestamptz not null default now()
);

create table if not exists public.user_items (
  user_id uuid not null references public.profiles(id) on delete cascade,
  item_slug text not null references public.items(slug) on delete cascade,
  purchased_at timestamptz not null default now(),
  primary key (user_id, item_slug)
);

create table if not exists public.achievements (
  id text primary key,
  name text not null,
  description text not null,
  coins_reward integer not null default 0,
  xp_reward integer not null default 0,
  is_hidden boolean not null default false,
  created_at timestamptz not null default now()
);

create table if not exists public.user_achievements (
  user_id uuid not null references public.profiles(id) on delete cascade,
  achievement_id text not null references public.achievements(id) on delete cascade,
  unlocked_at timestamptz not null default now(),
  primary key (user_id, achievement_id)
);

alter table public.profiles enable row level security;
alter table public.avatar_appearance enable row level security;
alter table public.activity_log enable row level security;
alter table public.items enable row level security;
alter table public.user_items enable row level security;
alter table public.achievements enable row level security;
alter table public.user_achievements enable row level security;

drop policy if exists "profiles_select_own" on public.profiles;
create policy "profiles_select_own"
on public.profiles for select
to authenticated
using (auth.uid() = id);

drop policy if exists "profiles_insert_own" on public.profiles;
create policy "profiles_insert_own"
on public.profiles for insert
to authenticated
with check (auth.uid() = id);

drop policy if exists "profiles_update_own" on public.profiles;
create policy "profiles_update_own"
on public.profiles for update
to authenticated
using (auth.uid() = id);

drop policy if exists "avatar_select_own" on public.avatar_appearance;
create policy "avatar_select_own"
on public.avatar_appearance for select
to authenticated
using (auth.uid() = user_id);

drop policy if exists "avatar_insert_own" on public.avatar_appearance;
create policy "avatar_insert_own"
on public.avatar_appearance for insert
to authenticated
with check (auth.uid() = user_id);

drop policy if exists "avatar_update_own" on public.avatar_appearance;
create policy "avatar_update_own"
on public.avatar_appearance for update
to authenticated
using (auth.uid() = user_id);

drop policy if exists "activity_select_own" on public.activity_log;
create policy "activity_select_own"
on public.activity_log for select
to authenticated
using (auth.uid() = user_id);

drop policy if exists "activity_insert_own" on public.activity_log;
create policy "activity_insert_own"
on public.activity_log for insert
to authenticated
with check (auth.uid() = user_id);

drop policy if exists "items_select_all" on public.items;
create policy "items_select_all"
on public.items for select
to authenticated
using (true);

drop policy if exists "user_items_select_own" on public.user_items;
create policy "user_items_select_own"
on public.user_items for select
to authenticated
using (auth.uid() = user_id);

drop policy if exists "user_items_insert_own" on public.user_items;
create policy "user_items_insert_own"
on public.user_items for insert
to authenticated
with check (auth.uid() = user_id);

drop policy if exists "achievements_select_all" on public.achievements;
create policy "achievements_select_all"
on public.achievements for select
to authenticated
using (true);

drop policy if exists "user_achievements_select_own" on public.user_achievements;
create policy "user_achievements_select_own"
on public.user_achievements for select
to authenticated
using (auth.uid() = user_id);

drop policy if exists "user_achievements_insert_own" on public.user_achievements;
create policy "user_achievements_insert_own"
on public.user_achievements for insert
to authenticated
with check (auth.uid() = user_id);

insert into public.items (slug, name, slot, price, icon, rarity) values
  ('hat_straw', 'Соломенная шляпа', 'hat', 80, '👒', 'common'),
  ('hat_iron', 'Железный шлем', 'hat', 220, '⛑️', 'rare'),
  ('glasses_round', 'Круглые очки', 'glasses', 120, '🕶️', 'common'),
  ('beard_wizard', 'Борода волшебника', 'beard', 190, '🧔', 'rare'),
  ('umbrella_red', 'Красный зонтик', 'accessory', 90, '☂️', 'common'),
  ('sword_bronze', 'Бронзовый меч', 'weapon', 260, '🗡️', 'epic')
on conflict (slug) do nothing;

-- +60 предметов:20 common, 20 rare, 10 mythical, 5 legendary, 5 immortal.
insert into public.items (slug, name, slot, price, icon, rarity) values
  ('hat_cotton_cap', 'Хлопковая кепка', 'hat', 55, '🧢', 'common'),
  ('glasses_reading', 'Очки для чтения', 'glasses', 62, '🤓', 'common'),
  ('scarf_plain', 'Простой шарф', 'accessory', 68, '🧣', 'common'),
  ('ring_bronze_band', 'Бронзовое кольцо', 'ring', 72, '💍', 'common'),
  ('gloves_cloth', 'Тряпичные перчатки', 'gloves', 78, '🧤', 'common'),
  ('belt_leather_simple', 'Простой кожаный ремень', 'belt', 82, '🔗', 'common'),
  ('charm_smile_pin', 'Значок-улыбка', 'charm', 58, '😊', 'common'),
  ('mask_cloth_casual', 'Тканевая маска', 'mask', 88, '😷', 'common'),
  ('cloak_light_hood', 'Лёгкий капюшон', 'cloak', 95, '🧵', 'common'),
  ('shoulder_patch_star', 'Нашивка со звездой', 'shoulder', 52, '⭐', 'common'),
  ('socks_striped', 'Полосатые носки', 'socks', 60, '🧦', 'common'),
  ('keychain_heart', 'Брелок-сердечко', 'charm', 74, '💖', 'common'),
  ('bow_tie_red', 'Красная бабочка', 'accessory', 92, '👔', 'common'),
  ('earring_pearl', 'Жемчужная серёжка', 'earring', 66, '🦪', 'common'),
  ('hat_cap_backwards', 'Кепка задом наперёд', 'hat', 90, '🎩', 'common'),
  ('mittens_wool', 'Шерстяные варежки', 'gloves', 84, '🧤', 'common'),
  ('locket_empty', 'Медальон без фото', 'accessory', 100, '📿', 'common'),
  ('ribbon_hair', 'Лента в волосах', 'accessory', 64, '🎀', 'common'),
  ('tote_canvas', 'Сумка-шопер', 'accessory', 108, '👜', 'common'),
  ('bandana_classic', 'Классическая бандана', 'accessory', 76, '🟥', 'common'),
  ('hat_fedora_night', 'Федора ночного города', 'hat', 268, '🎭', 'rare'),
  ('glasses_steampunk', 'Стимпанк-очки', 'glasses', 292, '🥽', 'rare'),
  ('beard_braided', 'Заплетённая борода', 'beard', 276, '🧔', 'rare'),
  ('cane_silver', 'Серебряная трость', 'weapon', 340, '🦯', 'rare'),
  ('cloak_traveler', 'Плащ странника', 'cloak', 342, '🧥', 'rare'),
  ('compass_rose', 'Компас с розой ветров', 'accessory', 310, '🧭', 'rare'),
  ('mask_venetian', 'Венецианская маска', 'mask', 356, '🎭', 'rare'),
  ('ring_signet', 'Перстень с печатью', 'ring', 382, '💎', 'rare'),
  ('sword_training', 'Тренировочный меч', 'weapon', 298, '⚔️', 'rare'),
  ('gloves_engineer', 'Инженерные перчатки', 'gloves', 324, '🧤', 'rare'),
  ('pauldron_single_iron', 'Железный наплечник', 'shoulder', 360, '🛡️', 'rare'),
  ('halo_dim', 'Тусклый нимб', 'aura', 322, '🌟', 'rare'),
  ('wings_paper', 'Бумажные крылья', 'wings', 286, '📄', 'rare'),
  ('pet_rock_googly', 'Камень с глазками', 'pet', 308, '🪨', 'rare'),
  ('lantern_warm', 'Тёплый фонарь', 'accessory', 294, '🏮', 'rare'),
  ('watch_pocket', 'Карманные часы', 'accessory', 418, '⌚', 'rare'),
  ('quill_ink', 'Перо и чернильница', 'weapon', 288, '🖋️', 'rare'),
  ('crown_toy', 'Корона из сюрприза', 'hat', 312, '👑', 'rare'),
  ('dagger_ornamental', 'Декоративный кинжал', 'weapon', 398, '🗡️', 'rare'),
  ('cape_short_hero', 'Короткий плащ героя', 'cloak', 336, '🎖️', 'rare'),
  ('blade_runic', 'Клинок с рунами', 'weapon', 720, '⚔️', 'mythical'),
  ('crown_thorns_glow', 'Шипастый венец с мерцанием', 'hat', 860, '👑', 'mythical'),
  ('wings_spectral_half', 'Полупрозрачные крылья', 'wings', 940, '🦅', 'mythical'),
  ('staff_arcane_orb', 'Посох с магической сферой', 'weapon', 1080, '🔮', 'mythical'),
  ('aura_blue_flame', 'Синее пламя вокруг', 'aura', 990, '🔥', 'mythical'),
  ('cloak_starfield', 'Плащ со звёздным небом', 'cloak', 1020, '✨', 'mythical'),
  ('mask_raven', 'Маска ворона', 'mask', 910, '🦉', 'mythical'),
  ('ring_dragon_coil', 'Кольцо змеи дракона', 'ring', 880, '🐉', 'mythical'),
  ('gauntlet_runic_one', 'Руническая перчатка', 'gloves', 790, '🧤', 'mythical'),
  ('amulet_allseeing', 'Амулет всевидящего ока', 'accessory', 1260, '👁️', 'mythical'),
  ('sword_frostmourne_echo', 'Эхо Фростморна', 'weapon', 3200, '❄️', 'legendary'),
  ('crown_lich_king_style', 'Корона в духе Короля-лича', 'hat', 3800, '👑', 'legendary'),
  ('wings_archangel_torn', 'Крылья раненого архангела', 'wings', 4500, '🦅', 'legendary'),
  ('mantle_northwind', 'Мантия северного ветра', 'cloak', 4200, '❄️', 'legendary'),
  ('phoenix_brooch', 'Брошь феникса', 'accessory', 3600, '🔥', 'legendary'),
  ('blade_world_edge', 'Клинок с краю мира', 'weapon', 9800, '⚔️', 'immortal'),
  ('helm_infinity', 'Шлем без начала и конца', 'hat', 11200, '♾️', 'immortal'),
  ('wings_eternal_flame', 'Крылья вечного пламени', 'wings', 14000, '🔥', 'immortal'),
  ('heart_frozen_time', 'Сердце остановившегося времени', 'accessory', 12500, '❤️', 'immortal'),
  ('crown_void_king', 'Корона короля пустоты', 'hat', 15500, '👑', 'immortal')
on conflict (slug) do update set
  name = excluded.name,
  slot = excluded.slot,
  price = excluded.price,
  icon = excluded.icon,
  rarity = excluded.rarity;

insert into public.achievements (id, name, description, coins_reward, xp_reward, is_hidden) values
  ('first_login', 'Добро пожаловать в балаган', 'Забрали ежедневный бонус. Технически вы уже не случайный клик.', 30, 30, false),
  ('first_purchase', 'Шопоголик: демо-версия', 'Купили что-то в магазине. Совесть молчит, монеты плачут.', 50, 40, false),
  ('level_3', 'Третий — не лишний', '3 уровня. Кот вас ещё уважает.', 80, 70, false),
  ('level_5', 'Пятёрка без двойки', '5 уровней. Можно не опускать глаза в метро.', 100, 90, false),
  ('level_7', 'Магическое семь', '7 уровней — как в сказке, только с бонусами.', 120, 110, false),
  ('level_10', 'Десяточка в кармане', '10 уровней. Вы точно не для галочки.', 180, 150, false),
  ('level_12', 'Дюжина не из яиц', '12 уровней — аккуратная куча крутости.', 200, 175, false),
  ('level_15', 'Пятнадцать — уже с муссом', '15 уровней. Можно чуть задрать нос.', 220, 200, false),
  ('level_18', 'Совершеннолетие по XP', '18 уровней. Игра не выдаст паспорт, зато уважение есть.', 250, 230, false),
  ('level_20', 'Двадцать без кризиса', '20 уровней. Кризис среднего возраста отложен.', 280, 260, false),
  ('level_25', 'Четверть века… ну почти', '25 уровней. Звучит взросло.', 350, 320, false),
  ('level_30', 'Тридцатка блестит', '30 уровней. Вы для этой игры уже плотный босс.', 450, 400, false),
  ('login_7', 'Неделя в строю', '7 бонусов на разных днях. Либо дисциплина, либо вы очень любите кнопку.', 60, 55, false),
  ('login_14', 'Две недели держим марку', '14 раз пришли и не потерялись. Гордость.', 90, 80, false),
  ('login_30', 'Месяц привычки и шуток', '30 входов. Соседи по быту должны бояться.', 150, 130, false),
  ('login_45', 'Полтора месяца — серьёзно', '45 бонусов. Вы не гость, вы фурнитура.', 180, 160, false),
  ('login_60', 'Два месяца без капризов', '60 входов. Признайтесь, вам нравится.', 220, 200, false),
  ('login_90', 'Квартал стабильности', '90 бонусов. Это уже почти сезонный сериал.', 300, 270, false),
  ('login_120', 'Четыре месяца — не шутка', '120 раз. Игра в шоке, вы в ресурсе.', 380, 340, false),
  ('login_180', 'Полгода романтики с бонусом', '180 входов. Юбилей скоро.', 500, 450, false),
  ('login_270', 'Девять месяцев — почти родили', '270 бонусов на разных днях. Игра гордится вами как родители первоклассником.', 650, 580, false),
  ('login_365', 'Год без «забыл зайти»', '365 раз. Легенда с подтверждением из календаря.', 800, 700, false),
  ('xp_1k', 'Тыща XP без стресса', 'Накопили XP. Мозг: «это же учёба?» Вы: «это прикол».', 40, 40, false),
  ('xp_3k', 'Три косаря в опыт', '3000 XP. Если б это были шаги, вы бы до холодильника дошли дважды.', 90, 85, false),
  ('xp_8k', 'Восемь тысяч — уже сериал', '8000 XP. Титры не нужны, вы и есть главный герой.', 140, 130, false),
  ('xp_15k', 'Пятнашка опыта', '15000 XP. HR бы оценил, но мы тут не про это.', 200, 190, false),
  ('xp_35k', 'Мастер «ещё чуть-чуть»', '35000 XP. Остановиться невозможно.', 280, 270, false),
  ('xp_60k', 'Элита по бумагам XP', '60000 XP. Игра шепчет: «ой, кто это у нас».', 400, 380, false),
  ('coins_250', 'Двести пятьдесят — не дырка', 'На счету от 250 монет. Мелочь, а приятно.', 35, 35, false),
  ('coins_800', 'Восемьсот — уже «у меня есть запас»', '800+ монет. Можно купить красоту или понтоваться.', 70, 65, false),
  ('coins_2k', 'Две тыщи — это взрослое', '2000 монет на счету. Копилка растит мускулы.', 120, 110, false),
  ('coins_5k', 'Пять косарей — мечта копилки', '5000+ монет. Вы как сейф, только с чувством юмора.', 200, 190, false),
  ('purchase_2', 'Два стула — оба мои', '2 разные покупки. Коллекционер просыпается.', 45, 40, false),
  ('purchase_4', 'Четыре покупки — это уже стратегия', '4 разных предмета. Магазин аплодирует стоя.', 80, 75, false),
  ('shop_collector', 'Я забрал всё, извините', 'Купили вообще всё из витрины. Остальным только смотреть скринами.', 180, 170, false),
  ('tasks_10', 'Десять побед над бытом', '10 отмеченных дел. Реальность чуть менее кошмар.', 55, 50, false),
  ('tasks_30', 'Тридцать раз сказали «сделал!»', '30 дел. Гордость и лёгкая усталость.', 100, 95, false),
  ('tasks_75', 'Семьдесят пять — это уже спортзал', '75 дел. Тренер по балду гордился бы.', 160, 150, false),
  ('tasks_150', 'Сто пятьдесят и ни одной одышки (ну почти)', '150 дел. Вы — гроза пылесоса.', 240, 220, false),
  ('tasks_300', 'Три сотни дел — легенда подъезда', '300 дел. Соседи нюхают победу.', 350, 330, false),
  ('tasks_500', 'Пять сотен — вы вообще живёте там?', '500 дел. Быт капитулирует.', 500, 480, false),
  ('avatar_5', 'Пять луков на аватаре', '5 сохранений внешности. Решительность или метания — неважно, награда есть.', 40, 38, false),
  ('avatar_15', 'Пятнадцать правок — мы не одержимы, мы стильные', '15 сохранений. Дизайнер внутри орёт.', 90, 85, false),
  ('avatar_40', 'Сорок правок — это любовь', '40 сохранений. Аватар устал, вы нет.', 180, 170, false),
  ('avatar_80', 'Восемьдесят сохранений — кожа салфеткой не вытрет', '80 сохранений. Это уже перфекционизм с медалью.', 280, 260, false),
  ('jack_all_tasks', 'Собрал всех питомцев по быту', 'Хоть раз отметили каждый тип задания. Покемоны быта пойманы все.', 120, 110, false),
  ('power_day', 'Три дела за один заход — вы многозадачный монстр', '3+ бытовых задания за день. Адреналин и чистая посуда.', 70, 65, false),
  ('obmashki_fan_5', 'ОБМАШКИ: пятёрка с плюсом', '5 ОБМАШЕК. Энергия завода.', 90, 88, false),
  ('obmashki_fan_15', 'ОБМАШКИ: вы уже в зале славы', '15 ОБМАШЕК. Соседи слышат и завидуют молча.', 160, 155, false),
  ('tea_master_10', 'Чайный босс', '10 раз «сделать чай». Заварник в шоке от вашей дисциплины.', 50, 48, false),
  ('dog_friend_20', 'Собака уже назначила вас CEO', '20 прогулок. Хвост в восторге, ноги тоже.', 85, 82, false),
  ('smile_spark_15', 'Улыбок больше, чем в офисе за год', '15 улыбок любимым. Романтика с честным фармом.', 75, 72, false),
  ('wash_streak_12', 'Посуда блестит, совесть чиста', '12 раз помыли посуду. Раковина шепчет «спасибо».', 65, 62, false),
  ('vacuum_pro_10', 'Пыль умерла от страха', '10 раз пылесос или подметание. Аллергия в ярости.', 60, 58, false),
  ('trash_ninja_15', 'Мусорный ниндзя без тени', '15 выносов. Контейнер знает вас в лицо.', 65, 63, false),
  ('dance_repeat_12', 'Танцпол дома — соседи подпевают… наверное', '12 танцев. Кардио под любимый трек.', 62, 60, false),
  ('plant_care_10', 'Цветы пишут вам в благодарность', '10 поливов. Джунгли легализованы.', 58, 56, false),
  ('tasks_1000', 'Тысяча дел — вы или робот?', '1000 дел. Если бы это были километры, вы бы до Марса добежали с остановками.', 900, 850, false),
  ('login_500', 'Пятьсот раз не на шутку', '500 ежедневных бонусов. Уже не прикол — это образ жизни.', 950, 900, false)
on conflict (id) do update set
  name = excluded.name,
  description = excluded.description,
  coins_reward = excluded.coins_reward,
  xp_reward = excluded.xp_reward,
  is_hidden = excluded.is_hidden;

insert into public.achievements (id, name, description, coins_reward, xp_reward, is_hidden) values
  ('hidden_midnight', 'Полуночник с характером', 'Забрали бонус, когда нормальные люди спят. Или не спят. Мы не осуждаем, мы фиксируем.', 120, 110, true),
  ('hidden_tea_sage', 'Чайный дедушка из лора', '40 раз «сделать чай» как задание. Завод по гидратации выписывает вам спасибо.', 200, 190, true),
  ('hidden_squirrel', 'Белка с запасом на зиму и лето', '3000 монет на счету. Орешки можно не прятать — вы уже в безопасности.', 180, 170, true),
  ('hidden_home_legend', 'Бог быта в человеческом обличье', '800+ бытовых подвигов. Олимпиада по дивану отменена — вы на поле.', 600, 550, true),
  ('hidden_early_bird', 'Жаворонок с кофеином', 'Бонус до того, как солнце окончательно проснулось. Кофе ещё в шоке.', 130, 120, true),
  ('hidden_evening_ritual', 'Закат, бонус, эстетика', 'Зашли за наградой на закате. Романтика с пикселями.', 125, 115, true),
  ('hidden_weekend_warrior', 'Выходной? Не слышали', 'В субботу или воскресенье отметили быт. Отдых для слабых.', 140, 130, true),
  ('hidden_typhoon_day', 'Ураган дел прошёл мимо дивана', '5 дел за один день. Лень подала ноту протеста, вы её проигнорировали.', 150, 140, true),
  ('hidden_full_house_day', 'Сезон сериала за один выпуск', 'За сутки закрыли весь список быта. Режиссёр аплодирует.', 220, 200, true),
  ('hidden_smile_vault', 'Склад улыбок (легендарный ред)', 'Улыбались так часто, что система сдалась и выдала тайник. Для коллекционеров старой школы.', 145, 135, true),
  ('hidden_dish_legend', 'Раковина боится вас по ночам', 'Посуда знала, что вы придёте. Архивная ачивка для тех, кто успел.', 150, 140, true),
  ('hidden_trash_monarch', 'Король пакетов и контейнеров', 'Маршрут до мусорки вы помните лучше, чем пароль от Wi‑Fi.', 150, 140, true),
  ('hidden_vortex_clean', 'Пылесос шепчет ваше имя', 'Чистота не подарок — это ваш бренд. Архив для старых гриндеров.', 150, 140, true),
  ('hidden_tea_giant', 'Заварник подает на вас в суд', '30 чаёв как задание. Вы не пьёте чай — вы его выполняете.', 160, 150, true),
  ('hidden_obmashki_apostle', 'Апостол ОБМАШЕК и энергии вселенной', '30 ОБМАШЕК. Соседи не понимают, но чувствуют вибрации.', 170, 160, true),
  ('hidden_dance_storm', 'Танцпол дома, бас в стенах', '30 танцев. Кардио, музыка и легенда о том, что слышали соседи.', 155, 145, true),
  ('hidden_jungle_home', 'Джунгли легальны, цветы подписали договор', '30 поливов. У вас теперь свой мини‑Амазон.', 155, 145, true),
  ('hidden_dog_ceo', 'Собака утвердила вашу должность', '40 прогулок. Вы в штате, хвост — председатель совета.', 175, 165, true),
  ('hidden_sunrise_century', 'Сто рассветов и ни одного «лень»', '100 ежедневных бонусов. Календарь плачет от нежности.', 280, 260, true),
  ('hidden_treasury_10k', 'Сейф мечтал о таком, как вы', '10000 монет на счету. Копилка наняла охрану.', 320, 300, true),
  ('hidden_xp_starship', 'Космический корабль из чистого XP', '100000 опыта. Быт остался на орбите.', 350, 330, true),
  ('hidden_chameleon', 'Кто я сегодня? Да', '50 сохранений внешности. ДНК аватара уже не уверено в себе.', 200, 190, true),
  ('hidden_triple_cart_day', 'Три покупки — кошелёк в слезах, вы в восторге', '3 раза купили в один день. Импульсивность одобряется наградой.', 160, 150, true),
  ('hidden_quick_start', 'Спидран: бонус за час', 'Первый бонус почти сразу после регистрации. Вы не гуляете — вы заходите в мету.', 110, 100, true),
  ('hidden_jackpot_balance', 'Слот-машина быта дала совпадение', 'Баланс выстроился в красивую цифру. Проверьте, не сон — но награда реальная.', 150, 140, true),
  ('hidden_wallet_after_shopping', 'Шопинг-терапия прошла успешно', 'Потратили в магазине как взрослые. Кошелёк обижен, душа сыта.', 155, 145, true),
  ('hidden_trophy_glutton', 'Медалей больше, чем места на стене', '30+ ачивок. Полка скрипит, гордость не помещается в дверной проём.', 160, 150, true),
  ('hidden_chronicle_thick', 'Летопись кликов и подвигов', '400+ событий в логе. Историки будущего будут перечитывать вместо сна.', 145, 135, true),
  ('hidden_almost_broke', 'Богатый духом, бедный монетами', 'На счету от 1 до 9 монет. Зато драма невероятная.', 120, 110, true),
  ('hidden_scroll_name', 'Ник длиннее моей нервной системы', '20+ символов в нике. Клавиатура устала, уважение осталось.', 130, 120, true),
  ('hidden_three_day_chain', 'Три дня подряд: бонус + быт, без выходных', '3 календарных дня без передышки. Режим «я не сдаюсь» включён.', 165, 155, true),
  ('hidden_friday_thirteen', 'Пятница 13-е — и вы живы', 'Играли в «ту» пятницу. Судьба кинула кубик, выпало «прикол».', 140, 130, true),
  ('hidden_leet_balance', 'Счётчики шепчут: «элита»', 'Монеты или XP попали в узнаваемое число. Гик-гордость +100.', 135, 125, true),
  ('hidden_rune_alpha', 'Руна α — красиво звучит, смысл потом', 'Секретная награда. Разработчик положил заглушку и ушёл пить чай.', 100, 100, true),
  ('hidden_rune_beta', 'Руна β — вторая заглушка, чтобы не было одиноко', 'Ещё одна тайна. Когда придумаем условие — вы первые узнаете. Наверное.', 100, 100, true)
on conflict (id) do update set
  name = excluded.name,
  description = excluded.description,
  coins_reward = excluded.coins_reward,
  xp_reward = excluded.xp_reward,
  is_hidden = excluded.is_hidden;

-- Wishlist board (Полезное): run migration 2026-04-13_wishlist_board.sql or paste tables here in SQL Editor.
-- wishlist_allowlist (email), wishlist_items (+ link_url, image_storage_path, approximate_price), storage bucket wishlist
