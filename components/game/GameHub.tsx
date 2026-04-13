"use client";

import { useCallback, useEffect, useMemo, useState } from "react";

import AvatarSVG from "@/components/game/AvatarSVG";

type GameState = {
  profile: {
    id: string;
    email: string;
    display_name: string;
    character_setup_complete?: boolean;
    coins: number;
    xp: number;
    level: number;
  };
  levelInfo: {
    level: number;
    xpCurrentLevel: number;
    xpForNextLevel: number;
    progressPercent: number;
  };
  avatar: {
    body_type: "male" | "female";
    hair: string;
    eyes: string;
    nose: string;
    mouth: string;
    top: string;
    bottom: string;
    boots: string;
    equipped_slots: Record<string, string>;
  };
  items: Array<{
    slug: string;
    name: string;
    slot: string;
    price: number;
    icon: string;
    rarity: string;
  }>;
  ownedItems: string[];
  unlockedAchievements: Array<{
    achievement_id: string;
    unlocked_at: string;
    achievements: {
      id: string;
      name: string;
      description: string;
      coins_reward: number;
      xp_reward: number;
      is_hidden?: boolean;
    };
  }>;
  achievementCatalog: Array<{
    id: string;
    name: string;
    description: string;
    coins_reward: number;
    xp_reward: number;
  }>;
  householdTasks: Array<{
    slug: string;
    emoji: string;
    title: string;
    description: string;
    coinsReward: number;
    xpReward: number;
  }>;
  completedHouseholdTaskSlugsToday: string[];
};

const appearanceOptions: Record<string, string[]> = {
  hair: ["short", "long", "curly", "punk"],
  eyes: ["brown", "blue", "green", "gray"],
  nose: ["classic", "sharp", "round"],
  mouth: ["smile", "serious", "wide"],
  top: ["shirt_blue", "hoodie_black", "dress_red"],
  bottom: ["pants_dark", "pants_light", "skirt_violet"],
  boots: ["boots_black", "boots_brown", "sneakers_white"],
};

const FIELD_LABELS: Record<string, string> = {
  hair: "Причёска",
  eyes: "Глаза",
  nose: "Нос",
  mouth: "Рот",
  top: "Верх",
  bottom: "Низ",
  boots: "Обувь",
};

const VALUE_LABELS: Record<string, string> = {
  male: "Мужской",
  female: "Женский",
  short: "Короткие",
  long: "Длинные",
  curly: "Кудрявые",
  punk: "Панк",
  brown: "Карие",
  blue: "Голубые",
  green: "Зелёные",
  gray: "Серые",
  classic: "Классический",
  sharp: "Острый",
  round: "Круглый",
  smile: "Улыбка",
  serious: "Серьёзный",
  wide: "Широкая",
  shirt_blue: "Синяя рубашка",
  hoodie_black: "Чёрное худи",
  dress_red: "Красное платье",
  pants_dark: "Тёмные штаны",
  pants_light: "Светлые штаны",
  skirt_violet: "Фиолетовая юбка",
  boots_black: "Чёрные сапоги",
  boots_brown: "Коричневые сапоги",
  sneakers_white: "Белые кеды",
};

function toPretty(value: string) {
  return VALUE_LABELS[value] ?? value.replaceAll("_", " ");
}

type Props = {
  view: "avatar" | "shop" | "achievements" | "tasks";
};

export default function GameHub({ view }: Props) {
  const [data, setData] = useState<GameState | null>(null);
  const [draft, setDraft] = useState<Record<string, string> | null>(null);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState<string>("");
  const [error, setError] = useState<string>("");

  const fetchState = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      await fetch("/api/game/bootstrap", { method: "POST" });
      const response = await fetch("/api/game/me", { cache: "no-store" });
      const payload = await response.json();
      if (!response.ok) {
        throw new Error(payload.error ?? "Ошибка загрузки.");
      }
      setData({
        ...payload,
        achievementCatalog: payload.achievementCatalog ?? [],
        householdTasks: payload.householdTasks ?? [],
        completedHouseholdTaskSlugsToday: payload.completedHouseholdTaskSlugsToday ?? [],
      });
      setDraft({
        body_type: payload.avatar.body_type ?? "male",
        hair: payload.avatar.hair,
        eyes: payload.avatar.eyes,
        nose: payload.avatar.nose,
        mouth: payload.avatar.mouth,
        top: payload.avatar.top,
        bottom: payload.avatar.bottom,
        boots: payload.avatar.boots,
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Ошибка загрузки.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void fetchState();
  }, [fetchState]);

  const ownedSet = useMemo(() => new Set(data?.ownedItems ?? []), [data?.ownedItems]);

  const unlockedAchievementIds = useMemo(
    () => new Set((data?.unlockedAchievements ?? []).map((r) => r.achievement_id)),
    [data?.unlockedAchievements],
  );

  const secretAchievementsUnlocked = useMemo(
    () =>
      (data?.unlockedAchievements ?? []).filter(
        (r) => r.achievements?.is_hidden === true,
      ),
    [data?.unlockedAchievements],
  );

  const catalogProgress = useMemo(() => {
    const cat = data?.achievementCatalog ?? [];
    const n = cat.filter((a) => unlockedAchievementIds.has(a.id)).length;
    return { unlocked: n, total: cat.length };
  }, [data?.achievementCatalog, unlockedAchievementIds]);

  const itemIcons = useMemo(
    () => Object.fromEntries((data?.items ?? []).map((i) => [i.slug, i.icon])),
    [data?.items],
  );

  async function saveAppearance() {
    if (!draft) return;
    setError("");
    setMessage("");
    const response = await fetch("/api/game/avatar", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ appearance: draft }),
    });
    const payload = await response.json();
    if (!response.ok) {
      setError(payload.error ?? "Не удалось сохранить.");
      return;
    }
    setMessage("Внешность сохранена. +очки и +опыт начислены.");
    await fetchState();
  }

  async function buy(itemSlug: string) {
    setError("");
    setMessage("");
    const response = await fetch("/api/game/shop/buy", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ itemSlug }),
    });
    const payload = await response.json();
    if (!response.ok) {
      setError(payload.error ?? "Покупка не удалась.");
      return;
    }
    setMessage("Покупка успешна.");
    await fetchState();
  }

  async function equip(itemSlug: string) {
    setError("");
    setMessage("");
    const response = await fetch("/api/game/avatar", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ mode: "equip", itemSlug }),
    });
    const payload = await response.json();
    if (!response.ok) {
      setError(payload.error ?? "Не удалось экипировать.");
      return;
    }
    setMessage("Предмет экипирован.");
    await fetchState();
  }

  async function completeHouseholdTaskAction(taskSlug: string) {
    setError("");
    setMessage("");
    const response = await fetch("/api/game/tasks/complete", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ taskSlug }),
    });
    const payload = await response.json();
    if (!response.ok) {
      setError(payload.error ?? "Не удалось отметить задание.");
      return;
    }
    setMessage("Отлично! Награда начислена.");
    await fetchState();
  }

  async function unequip(slot: string) {
    setError("");
    setMessage("");
    const response = await fetch("/api/game/avatar", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ mode: "unequip", slot }),
    });
    const payload = await response.json();
    if (!response.ok) {
      setError(payload.error ?? "Не удалось снять предмет.");
      return;
    }
    setMessage("Предмет снят.");
    await fetchState();
  }

  if (loading) {
    return <div className="text-slate-400">Загрузка игрового профиля...</div>;
  }

  if (error && !data) {
    return (
      <div className="rounded-xl border border-rose-500/30 bg-rose-500/10 p-4 text-rose-200">
        {error}
      </div>
    );
  }

  if (!data || !draft) {
    return null;
  }

  return (
    <section className="space-y-6">
      <header className="relative z-20 rounded-2xl border border-white/10 bg-[#141422] p-5">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="rounded-2xl border border-white/10 bg-[#0f0f1a] p-1">
              <AvatarSVG appearance={data.avatar} size={72} itemIcons={itemIcons} />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-white">
                Привет, {data.profile.display_name || data.profile.email}
              </h1>
              <p className="text-sm text-slate-400">
                Уровень {data.profile.level} · {data.profile.xp} XP · {data.profile.coins} монет
              </p>
            </div>
          </div>
          <nav className="relative z-30 flex flex-wrap gap-2 text-sm" aria-label="Разделы игры">
            <a
              className="inline-flex rounded-lg border border-white/20 px-3 py-2 text-slate-200 hover:border-indigo-400 hover:text-white"
              href="/avatar"
            >
              Аватар
            </a>
            <a
              className="inline-flex rounded-lg border border-white/20 px-3 py-2 text-slate-200 hover:border-indigo-400 hover:text-white"
              href="/shop"
            >
              Магазин
            </a>
            <a
              className="inline-flex rounded-lg border border-white/20 px-3 py-2 text-slate-200 hover:border-indigo-400 hover:text-white"
              href="/tasks"
            >
              Задания
            </a>
            <a
              className="inline-flex rounded-lg border border-white/20 px-3 py-2 text-slate-200 hover:border-indigo-400 hover:text-white"
              href="/achievements"
            >
              Ачивки
            </a>
          </nav>
        </div>
        <div className="mt-4 h-2 overflow-hidden rounded-full bg-[#202033]">
          <div
            className="h-full rounded-full bg-indigo-500 transition-all"
            style={{ width: `${data.levelInfo.progressPercent}%` }}
          />
        </div>
        <p className="mt-2 text-xs text-slate-500">
          До следующего уровня: {data.levelInfo.xpForNextLevel - data.levelInfo.xpCurrentLevel} XP
        </p>
      </header>

      {message ? (
        <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-3 text-emerald-200">
          {message}
        </div>
      ) : null}
      {error ? (
        <div className="rounded-xl border border-rose-500/30 bg-rose-500/10 p-3 text-rose-200">{error}</div>
      ) : null}

      {view === "avatar" ? (
        <div className="grid gap-6 lg:grid-cols-2">
          <div className="rounded-2xl border border-white/10 bg-[#141422] p-5">
            <h2 className="text-lg font-semibold text-white">Базовая внешность</h2>
            <p className="mt-2 text-sm text-slate-500">
              Пол: <span className="text-slate-300">{toPretty(draft.body_type)}</span>
              <span className="text-slate-600"> — выбирается один раз при создании персонажа.</span>
            </p>
            <div className="mt-4 space-y-4">
              {Object.entries(appearanceOptions).map(([key, values]) => (
                <label key={key} className="block">
                  <span className="mb-1 block text-sm text-slate-400">{FIELD_LABELS[key] ?? key}</span>
                  <select
                    className="w-full rounded-lg border border-white/10 bg-[#0f0f1a] px-3 py-2 text-slate-200"
                    value={draft[key]}
                    onChange={(event) => {
                      const nextValue = event.target.value;
                      setDraft((prev) => (prev ? { ...prev, [key]: nextValue } : prev));
                    }}
                  >
                    {values.map((value) => (
                      <option key={value} value={value}>
                        {toPretty(value)}
                      </option>
                    ))}
                  </select>
                </label>
              ))}
            </div>
            <button
              onClick={saveAppearance}
              className="mt-5 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-500"
            >
              Сохранить внешность
            </button>
          </div>

          <div className="space-y-4 rounded-2xl border border-white/10 bg-[#141422] p-5">
            <h2 className="text-lg font-semibold text-white">Предпросмотр аватара</h2>
            <div className="flex justify-center rounded-xl border border-white/10 bg-[#0f0f1a] p-4">
              <AvatarSVG
                appearance={{
                  body_type: draft.body_type as "male" | "female",
                  hair: draft.hair,
                  eyes: draft.eyes,
                  nose: draft.nose,
                  mouth: draft.mouth,
                  top: draft.top,
                  bottom: draft.bottom,
                  boots: draft.boots,
                  equipped_slots: data.avatar.equipped_slots,
                }}
                size={240}
                itemIcons={itemIcons}
              />
            </div>

            <div>
              <h3 className="mb-2 text-sm text-slate-400">Экипированные предметы</h3>
              <div className="space-y-2">
                {Object.entries(data.avatar.equipped_slots).length === 0 ? (
                  <p className="text-sm text-slate-500">Пока ничего не экипировано.</p>
                ) : (
                  Object.entries(data.avatar.equipped_slots).map(([slot, slug]) => (
                    <div
                      key={slot}
                      className="flex items-center justify-between rounded-lg border border-white/10 bg-[#0f0f1a] px-3 py-2"
                    >
                      <span className="text-sm text-slate-300">
                        {slot}: {toPretty(slug)}
                      </span>
                      <button
                        onClick={() => void unequip(slot)}
                        className="text-xs text-rose-300 hover:text-rose-200"
                      >
                        Снять
                      </button>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>
      ) : null}

      {view === "shop" ? (
        <div className="rounded-2xl border border-white/10 bg-[#141422] p-5">
          <h2 className="mb-4 text-lg font-semibold text-white">Магазин предметов</h2>
          <div className="grid gap-3 md:grid-cols-2">
            {data.items.map((item) => {
              const owned = ownedSet.has(item.slug);
              return (
                <div key={item.slug} className="rounded-xl border border-white/10 bg-[#0f0f1a] p-4">
                  <p className="text-lg">{item.icon}</p>
                  <h3 className="font-semibold text-white">{item.name}</h3>
                  <p className="text-xs text-slate-500">
                    Слот: {item.slot} · Редкость: {item.rarity}
                  </p>
                  <p className="mt-2 text-sm text-indigo-300">{item.price} монет</p>
                  <div className="mt-3 flex gap-2">
                    {!owned ? (
                      <button
                        onClick={() => void buy(item.slug)}
                        className="rounded-lg bg-indigo-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-indigo-500"
                      >
                        Купить
                      </button>
                    ) : (
                      <button
                        onClick={() => void equip(item.slug)}
                        className="rounded-lg border border-indigo-400/40 px-3 py-1.5 text-xs text-indigo-200 hover:bg-indigo-500/10"
                      >
                        Экипировать
                      </button>
                    )}
                    {owned ? <span className="text-xs text-emerald-300">Куплено</span> : null}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ) : null}

      {view === "tasks" ? (
        <div className="rounded-2xl border border-white/10 bg-[#141422] p-5">
          <h2 className="text-lg font-semibold text-white">Домашние задания</h2>
          <p className="mt-1 max-w-2xl text-sm text-slate-500">
            Нажми «Сделал!», когда реально закончил дело. За каждое задание можно получить монеты и опыт{" "}
            <span className="text-slate-400">один раз в день</span> — честная геймификация без бесконечного фарма
            с одной кнопки.
          </p>
          <div className="mt-5 grid gap-4 md:grid-cols-2">
            {data.householdTasks.map((task) => {
              const doneToday = data.completedHouseholdTaskSlugsToday.includes(task.slug);
              return (
                <div
                  key={task.slug}
                  className="flex flex-col rounded-xl border border-white/10 bg-[#0f0f1a] p-4 transition-colors hover:border-indigo-500/25"
                >
                  <div className="flex items-start gap-3">
                    <span className="text-3xl leading-none" aria-hidden>
                      {task.emoji}
                    </span>
                    <div className="min-w-0 flex-1">
                      <h3 className="font-semibold text-white">{task.title}</h3>
                      <p className="mt-1 text-sm text-slate-400">{task.description}</p>
                      <p className="mt-2 text-xs text-indigo-300/90">
                        Награда: +{task.coinsReward} монет · +{task.xpReward} XP
                      </p>
                    </div>
                  </div>
                  <button
                    type="button"
                    disabled={doneToday}
                    onClick={() => void completeHouseholdTaskAction(task.slug)}
                    className={`mt-4 rounded-lg px-4 py-2 text-sm font-semibold transition-colors ${
                      doneToday
                        ? "cursor-default border border-white/10 bg-white/[0.04] text-slate-500"
                        : "bg-indigo-600 text-white hover:bg-indigo-500"
                    }`}
                  >
                    {doneToday ? "Сегодня уже отмечено" : "Сделал!"}
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      ) : null}

      {view === "achievements" ? (
        <div className="space-y-8">
          <div className="rounded-2xl border border-white/10 bg-[#141422] p-5">
            <h2 className="text-lg font-semibold text-white">Ачивки</h2>
            <p className="mt-1 text-sm text-slate-500">
              В каталоге <span className="text-slate-300">{catalogProgress.total}</span> целей — от ежедневных входов
              до сотен бытовых дел. Награды начисляются автоматически, когда условие выполнено.
            </p>
            <p className="mt-2 text-sm font-medium text-indigo-300">
              Открыто в каталоге: {catalogProgress.unlocked} / {catalogProgress.total}
              {secretAchievementsUnlocked.length > 0 ? (
                <span className="ml-2 text-fuchsia-300/90">
                  · скрытых найдено: {secretAchievementsUnlocked.length}
                </span>
              ) : null}
            </p>

            {data.achievementCatalog.length === 0 ? (
              <p className="mt-4 rounded-lg border border-amber-500/30 bg-amber-500/10 p-3 text-sm text-amber-100">
                Каталог ачивок не загрузился. Проверьте, что в Supabase выполнена миграция с колонкой{" "}
                <code className="text-amber-50/90">is_hidden</code> и вставлены строки в{" "}
                <code className="text-amber-50/90">achievements</code> (файл{" "}
                <code className="text-amber-50/90">2026-04-14_achievements_50_plus_hidden.sql</code>).
              </p>
            ) : null}

            <div className="mt-5 grid max-h-[min(70vh,720px)] gap-2 overflow-y-auto pr-1 sm:grid-cols-2 xl:grid-cols-3">
              {data.achievementCatalog.map((ach) => {
                const ok = unlockedAchievementIds.has(ach.id);
                return (
                  <div
                    key={ach.id}
                    className={`rounded-xl border p-3 transition-colors ${
                      ok
                        ? "border-emerald-500/35 bg-emerald-500/[0.06]"
                        : "border-white/[0.08] bg-[#0f0f1a] opacity-[0.92]"
                    }`}
                  >
                    <p className="font-medium text-white">{ach.name}</p>
                    <p className="mt-1 text-xs leading-relaxed text-slate-400">{ach.description}</p>
                    <p className="mt-2 text-xs text-slate-500">
                      Награда:{" "}
                      <span className={ok ? "text-emerald-300" : "text-slate-400"}>
                        +{ach.coins_reward} монет · +{ach.xp_reward} XP
                      </span>
                    </p>
                    <p className="mt-1 text-[11px] uppercase tracking-wide text-slate-600">
                      {ok ? "Открыто" : "В процессе"}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>

          {secretAchievementsUnlocked.length > 0 ? (
            <div className="rounded-2xl border border-fuchsia-500/25 bg-fuchsia-500/[0.04] p-5">
              <h3 className="text-base font-semibold text-fuchsia-200">Скрытые находки</h3>
              <p className="mt-1 text-xs text-slate-500">
                Этих целей нет в общем списке — вы выполнили что-то особенное (или дождётесь будущего обновления).
              </p>
              <div className="mt-3 space-y-2">
                {secretAchievementsUnlocked.map((row) => (
                  <div
                    key={row.achievement_id}
                    className="rounded-lg border border-fuchsia-500/20 bg-[#0f0f1a] p-3"
                  >
                    <p className="font-medium text-white">{row.achievements?.name ?? row.achievement_id}</p>
                    <p className="text-xs text-slate-400">{row.achievements?.description}</p>
                    <p className="mt-1 text-xs text-emerald-300">
                      +{row.achievements?.coins_reward ?? 0} монет · +{row.achievements?.xp_reward ?? 0} XP
                    </p>
                  </div>
                ))}
              </div>
            </div>
          ) : null}
        </div>
      ) : null}
    </section>
  );
}
