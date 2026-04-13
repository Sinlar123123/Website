export type HouseholdTask = {
  slug: string;
  emoji: string;
  title: string;
  description: string;
  coinsReward: number;
  xpReward: number;
};

export const HOUSEHOLD_TASKS: HouseholdTask[] = [
  {
    slug: "wash_dishes",
    emoji: "\u{1F9FD}",
    title: "Помыть посуду",
    description: "Разгрузить раковину или загрузить посудомойку — кухня сразу приятнее.",
    coinsReward: 12,
    xpReward: 15,
  },
  {
    slug: "vacuum_floor",
    emoji: "\u{1F9F9}",
    title: "Пропылесосить или подмести",
    description: "Быстрый круг по комнате: меньше пыли и приятнее ходить босиком.",
    coinsReward: 14,
    xpReward: 18,
  },
  {
    slug: "take_out_trash",
    emoji: "\u{1F5D1}\u{FE0F}",
    title: "Вынести мусор",
    description: "Пакет из ведра до контейнера — маленький подвиг, но душу от груза разгружает.",
    coinsReward: 10,
    xpReward: 12,
  },
  {
    slug: "water_plants",
    emoji: "\u{1F331}",
    title: "Полить цветы",
    description: "Напомни зелёным друзьям, что ты о них помнишь.",
    coinsReward: 11,
    xpReward: 14,
  },
  {
    slug: "walk_dog",
    emoji: "\u{1F415}",
    title: "Выгулять собаку",
    description: "Свежий воздух для пса — и для тебя тоже. Даже короткая прогулка считается.",
    coinsReward: 13,
    xpReward: 16,
  },
  {
    slug: "make_tea",
    emoji: "\u{1F375}",
    title: "Сделать чай",
    description: "Заварить кружку любимого чая и выдохнуть на минуту.",
    coinsReward: 4,
    xpReward: 5,
  },
  {
    slug: "smile_for_loved_one",
    emoji: "\u{1F60A}",
    title: "Подарить любимке улыбку",
    description: "Искренняя улыбка или тёплое слово — бесплатно для тебя, дорого для настроения.",
    coinsReward: 9,
    xpReward: 11,
  },
  {
    slug: "obmashki",
    emoji: "\u{1F4AF}",
    title: "ОБМАШКИИIIIIII!!!!!!!!!",
    description: "Тот самый ритуал заряда бодрости. Выполни по полной программе и зафиксируй победу.",
    coinsReward: 18,
    xpReward: 22,
  },
  {
    slug: "dance_favorite_track",
    emoji: "\u{1F3B6}",
    title: "Потанцевать под любимый трек",
    description: "Две минуты движения под музыку — мозг благодарит, тело тоже.",
    coinsReward: 10,
    xpReward: 13,
  },
];

export const HOUSEHOLD_TASK_SLUGS = new Set(HOUSEHOLD_TASKS.map((t) => t.slug));
