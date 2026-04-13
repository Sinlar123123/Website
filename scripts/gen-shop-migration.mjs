import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const rows = [
  ["hat_cotton_cap", "Хлопковая кепка", "hat", 55, "\u{1F9E2}", "common"],
  ["glasses_reading", "Очки для чтения", "glasses", 62, "\u{1F913}", "common"],
  ["scarf_plain", "Простой шарф", "accessory", 68, "\u{1F9E3}", "common"],
  ["ring_bronze_band", "Бронзовое кольцо", "ring", 72, "\u{1F48D}", "common"],
  ["gloves_cloth", "Тряпичные перчатки", "gloves", 78, "\u{1F9E4}", "common"],
  ["belt_leather_simple", "Простой кожаный ремень", "belt", 82, "\u{1F517}", "common"],
  ["charm_smile_pin", "Значок-улыбка", "charm", 58, "\u{1F60A}", "common"],
  ["mask_cloth_casual", "Тканевая маска", "mask", 88, "\u{1F637}", "common"],
  ["cloak_light_hood", "Лёгкий капюшон", "cloak", 95, "\u{1F9F5}", "common"],
  ["shoulder_patch_star", "Нашивка со звездой", "shoulder", 52, "\u2B50", "common"],
  ["socks_striped", "Полосатые носки", "socks", 60, "\u{1F9E6}", "common"],
  ["keychain_heart", "Брелок-сердечко", "charm", 74, "\u{1F496}", "common"],
  ["bow_tie_red", "Красная бабочка", "accessory", 92, "\u{1F454}", "common"],
  ["earring_pearl", "Жемчужная серёжка", "earring", 66, "\u{1F9AA}", "common"],
  ["hat_cap_backwards", "Кепка задом наперёд", "hat", 90, "\u{1F3A9}", "common"],
  ["mittens_wool", "Шерстяные варежки", "gloves", 84, "\u{1F9E4}", "common"],
  ["locket_empty", "Медальон без фото", "accessory", 100, "\u{1F4FF}", "common"],
  ["ribbon_hair", "Лента в волосах", "accessory", 64, "\u{1F380}", "common"],
  ["tote_canvas", "Сумка-шопер", "accessory", 108, "\u{1F45C}", "common"],
  ["bandana_classic", "Классическая бандана", "accessory", 76, "\u{1F7E5}", "common"],
  ["hat_fedora_night", "Федора ночного города", "hat", 268, "\u{1F3AD}", "rare"],
  ["glasses_steampunk", "Стимпанк-очки", "glasses", 292, "\u{1F97D}", "rare"],
  ["beard_braided", "Заплетённая борода", "beard", 276, "\u{1F9D4}", "rare"],
  ["cane_silver", "Серебряная трость", "weapon", 340, "\u{1F9AF}", "rare"],
  ["cloak_traveler", "Плащ странника", "cloak", 342, "\u{1F9E5}", "rare"],
  ["compass_rose", "Компас с розой ветров", "accessory", 310, "\u{1F9ED}", "rare"],
  ["mask_venetian", "Венецианская маска", "mask", 356, "\u{1F3AD}", "rare"],
  ["ring_signet", "Перстень с печатью", "ring", 382, "\u{1F48E}", "rare"],
  ["sword_training", "Тренировочный меч", "weapon", 298, "\u2694\uFE0F", "rare"],
  ["gloves_engineer", "Инженерные перчатки", "gloves", 324, "\u{1F9E4}", "rare"],
  ["pauldron_single_iron", "Железный наплечник", "shoulder", 360, "\u{1F6E1}\uFE0F", "rare"],
  ["halo_dim", "Тусклый нимб", "aura", 322, "\u{1F31F}", "rare"],
  ["wings_paper", "Бумажные крылья", "wings", 286, "\u{1F4C4}", "rare"],
  ["pet_rock_googly", "Камень с глазками", "pet", 308, "\u{1FAA8}", "rare"],
  ["lantern_warm", "Тёплый фонарь", "accessory", 294, "\u{1F3EE}", "rare"],
  ["watch_pocket", "Карманные часы", "accessory", 418, "\u231A", "rare"],
  ["quill_ink", "Перо и чернильница", "weapon", 288, "\u{1F58B}\uFE0F", "rare"],
  ["crown_toy", "Корона из сюрприза", "hat", 312, "\u{1F451}", "rare"],
  ["dagger_ornamental", "Декоративный кинжал", "weapon", 398, "\u{1F5E1}\uFE0F", "rare"],
  ["cape_short_hero", "Короткий плащ героя", "cloak", 336, "\u{1F396}\uFE0F", "rare"],
  ["blade_runic", "Клинок с рунами", "weapon", 720, "\u2694\uFE0F", "mythical"],
  ["crown_thorns_glow", "Шипастый венец с мерцанием", "hat", 860, "\u{1F451}", "mythical"],
  ["wings_spectral_half", "Полупрозрачные крылья", "wings", 940, "\u{1F985}", "mythical"],
  ["staff_arcane_orb", "Посох с магической сферой", "weapon", 1080, "\u{1F52E}", "mythical"],
  ["aura_blue_flame", "Синее пламя вокруг", "aura", 990, "\u{1F525}", "mythical"],
  ["cloak_starfield", "Плащ со звёздным небом", "cloak", 1020, "\u2728", "mythical"],
  ["mask_raven", "Маска ворона", "mask", 910, "\u{1F989}", "mythical"],
  ["ring_dragon_coil", "Кольцо змеи дракона", "ring", 880, "\u{1F409}", "mythical"],
  ["gauntlet_runic_one", "Руническая перчатка", "gloves", 790, "\u{1F9E4}", "mythical"],
  ["amulet_allseeing", "Амулет всевидящего ока", "accessory", 1260, "\u{1F441}\uFE0F", "mythical"],
  ["sword_frostmourne_echo", "Эхо Фростморна", "weapon", 3200, "\u2744\uFE0F", "legendary"],
  ["crown_lich_king_style", "Корона в духе Короля-лича", "hat", 3800, "\u{1F451}", "legendary"],
  ["wings_archangel_torn", "Крылья раненого архангела", "wings", 4500, "\u{1F985}", "legendary"],
  ["mantle_northwind", "Мантия северного ветра", "cloak", 4200, "\u2744\uFE0F", "legendary"],
  ["phoenix_brooch", "Брошь феникса", "accessory", 3600, "\u{1F525}", "legendary"],
  ["blade_world_edge", "Клинок с краю мира", "weapon", 9800, "\u2694\uFE0F", "immortal"],
  ["helm_infinity", "Шлем без начала и конца", "hat", 11200, "\u267E\uFE0F", "immortal"],
  ["wings_eternal_flame", "Крылья вечного пламени", "wings", 14000, "\u{1F525}", "immortal"],
  ["heart_frozen_time", "Сердце остановившегося времени", "accessory", 12500, "\u2764\uFE0F", "immortal"],
  ["crown_void_king", "Корона короля пустоты", "hat", 15500, "\u{1F451}", "immortal"],
];

function escSql(s) {
  return s.replace(/'/g, "''");
}

const valueLines = rows
  .map(
    ([slug, name, slot, price, icon, rarity]) =>
      `  ('${escSql(slug)}', '${escSql(name)}', '${escSql(slot)}', ${price}, '${escSql(icon)}', '${rarity}')`,
  )
  .join(",\n");

const sql = `-- +60 предметов:20 common, 20 rare, 10 mythical, 5 legendary, 5 immortal.
insert into public.items (slug, name, slot, price, icon, rarity) values
${valueLines}
on conflict (slug) do update set
  name = excluded.name,
  slot = excluded.slot,
  price = excluded.price,
  icon = excluded.icon,
  rarity = excluded.rarity;
`;

const out = path.join(__dirname, "../supabase/migrations/2026-04-18_shop_items_expansion_60.sql");
fs.writeFileSync(out, sql, "utf8");
console.log("Wrote", rows.length, "rows to", out);
