/**
 * Порядок карточек в каталоге ачивок: внутри каждой числовой линейки — от меньшего порога к большему (прогрессия).
 * Спец-ачивки без ступеней (магазин «всё купить», мета) — в конце соответствующего смыслового блока.
 */
export const ACHIEVEMENT_CATALOG_ORDER = [
  // Ежедневные входы
  "login_7",
  "login_14",
  "login_30",
  "login_45",
  "login_60",
  "login_90",
  "login_120",
  "login_180",
  "login_270",
  "login_365",
  "login_500",
  // Суммарно домашние задания
  "tasks_10",
  "tasks_30",
  "tasks_75",
  "tasks_150",
  "tasks_300",
  "tasks_500",
  "tasks_1000",
  // Уровень
  "level_3",
  "level_5",
  "level_7",
  "level_10",
  "level_12",
  "level_15",
  "level_18",
  "level_20",
  "level_25",
  "level_30",
  // Суммарный XP
  "xp_1k",
  "xp_3k",
  "xp_8k",
  "xp_15k",
  "xp_35k",
  "xp_60k",
  // Монеты на счёту
  "coins_250",
  "coins_800",
  "coins_2k",
  "coins_5k",
  // Магазин: от первой покупки к коллекционеру
  "first_purchase",
  "purchase_2",
  "purchase_4",
  "shop_collector",
  // Сохранения внешности аватара
  "avatar_5",
  "avatar_15",
  "avatar_40",
  "avatar_80",
  // Один тип задания много раз (по возрастанию порога)
  "obmashki_fan_5",
  "plant_care_10",
  "tea_master_10",
  "vacuum_pro_10",
  "dance_repeat_12",
  "wash_streak_12",
  "obmashki_fan_15",
  "smile_spark_15",
  "trash_ninja_15",
  "dog_friend_20",
  // Мета
  "jack_all_tasks",
  "power_day",
  // Старт
  "first_login",
] as const;

const ORDER_INDEX = new Map<string, number>(
  ACHIEVEMENT_CATALOG_ORDER.map((id, i) => [id, i]),
);

export function sortAchievementCatalog<T extends { id: string }>(rows: T[]): T[] {
  const fallback = ACHIEVEMENT_CATALOG_ORDER.length;
  return [...rows].sort((a, b) => {
    const ia = ORDER_INDEX.has(a.id) ? ORDER_INDEX.get(a.id)! : fallback;
    const ib = ORDER_INDEX.has(b.id) ? ORDER_INDEX.get(b.id)! : fallback;
    if (ia !== ib) return ia - ib;
    return a.id.localeCompare(b.id);
  });
}
