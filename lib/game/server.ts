import { sortAchievementCatalog } from "@/lib/game/achievement-catalog-order";
import { createClient } from "@/lib/supabase/server";
import { HOUSEHOLD_TASKS, HOUSEHOLD_TASK_SLUGS } from "@/lib/game/household-tasks";
import { getLevelInfo, levelFromXp } from "@/lib/game/progression";
import type { AvatarAppearance, GameItem, Profile } from "@/lib/game/types";

const SHOP_ITEM_COUNT = 66;

const DEFAULT_APPEARANCE: AvatarAppearance = {
  body_type: "male",
  hair: "short",
  eyes: "brown",
  nose: "classic",
  mouth: "smile",
  top: "shirt_blue",
  bottom: "pants_dark",
  boots: "boots_black",
  equipped_slots: {},
};

const MALE_BODY_PRESET: Pick<
  AvatarAppearance,
  "body_type" | "hair" | "top" | "bottom" | "boots" | "mouth"
> = {
  body_type: "male",
  hair: "short",
  top: "shirt_blue",
  bottom: "pants_dark",
  boots: "boots_black",
  mouth: "smile",
};

const FEMALE_BODY_PRESET: Pick<
  AvatarAppearance,
  "body_type" | "hair" | "top" | "bottom" | "boots" | "mouth"
> = {
  body_type: "female",
  hair: "long",
  top: "dress_red",
  bottom: "skirt_violet",
  boots: "boots_brown",
  mouth: "smile",
};

type ProfileRow = Profile & { created_at?: string };

function throwIfSupabaseError(error: { message: string } | null | undefined, actionRu: string): void {
  if (!error) return;
  const msg = error.message;
  if (/fetch failed|Failed to fetch|NetworkError|ECONNREFUSED|ENOTFOUND|getaddrinfo|certificate/i.test(msg)) {
    throw new Error(
      `Не удаётся связаться с Supabase (${actionRu}). Проверьте в .env.local адрес NEXT_PUBLIC_SUPABASE_URL и ключ NEXT_PUBLIC_SUPABASE_ANON_KEY (скопируйте из Supabase → Settings → API, без лишних пробелов). Убедитесь, что проект на supabase.com не на паузе, и что интернет/VPN не блокируют запросы.`,
    );
  }
  throw new Error(msg);
}

function normalizeAppearance(raw: Partial<AvatarAppearance> | null): AvatarAppearance {
  return {
    ...DEFAULT_APPEARANCE,
    ...raw,
    equipped_slots: (raw?.equipped_slots as Record<string, string>) ?? {},
  };
}

async function updateProfileProgress(
  userId: string,
  coinsDelta: number,
  xpDelta: number,
  actionType: string,
) {
  const supabase = await createClient();
  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select("coins, xp")
    .eq("id", userId)
    .single();

  if (profileError) {
    throw new Error(profileError.message);
  }

  const nextCoins = Math.max(0, (profile.coins ?? 0) + coinsDelta);
  const nextXp = Math.max(0, (profile.xp ?? 0) + xpDelta);
  const nextLevel = levelFromXp(nextXp);

  const { error: updateError } = await supabase
    .from("profiles")
    .update({ coins: nextCoins, xp: nextXp, level: nextLevel })
    .eq("id", userId);

  if (updateError) {
    throw new Error(updateError.message);
  }

  const { error: logError } = await supabase.from("activity_log").insert({
    user_id: userId,
    action_type: actionType,
    coins_delta: coinsDelta,
    xp_delta: xpDelta,
  });

  if (logError) {
    throw new Error(logError.message);
  }
}

async function unlockAchievementIfNeeded(userId: string, achievementId: string) {
  const supabase = await createClient();

  const { data: alreadyUnlocked } = await supabase
    .from("user_achievements")
    .select("achievement_id")
    .eq("user_id", userId)
    .eq("achievement_id", achievementId)
    .maybeSingle();

  if (alreadyUnlocked) {
    return;
  }

  const { data: achievement } = await supabase
    .from("achievements")
    .select("id, coins_reward, xp_reward")
    .eq("id", achievementId)
    .maybeSingle();

  if (!achievement) {
    return;
  }

  const { error: unlockError } = await supabase.from("user_achievements").insert({
    user_id: userId,
    achievement_id: achievement.id,
  });

  if (unlockError) {
    throw new Error(unlockError.message);
  }

  await updateProfileProgress(
    userId,
    achievement.coins_reward ?? 0,
    achievement.xp_reward ?? 0,
    `achievement:${achievement.id}`,
  );
}

function utcDateKey(iso: string): string {
  return iso.slice(0, 10);
}

function hasThreeConsecutiveDaysBoth(loginDaysSet: Set<string>, taskDaysSet: Set<string>): boolean {
  const both = [...loginDaysSet].filter((d) => taskDaysSet.has(d)).sort();
  for (let i = 0; i <= both.length - 3; i++) {
    const [y0, m0, d0] = both[i].split("-").map(Number);
    const [y1, m1, d1] = both[i + 1].split("-").map(Number);
    const [y2, m2, d2] = both[i + 2].split("-").map(Number);
    const a = Date.UTC(y0, m0 - 1, d0);
    const b = Date.UTC(y1, m1 - 1, d1);
    const c = Date.UTC(y2, m2 - 1, d2);
    if (b === a + 86_400_000 && c === b + 86_400_000) return true;
  }
  return false;
}

function isFridayThirteenUtc(iso: string): boolean {
  const d = new Date(iso);
  return d.getUTCDay() === 5 && d.getUTCDate() === 13;
}

async function evaluateAchievements(userId: string) {
  const supabase = await createClient();

  const [
    { data: profile },
    { count: purchasesCount },
    { count: loginDays },
    { count: avatarCount },
    { data: houseRows },
    { data: lastLoginRow },
    { data: loginTimeRows },
    { data: purchaseTimeRows },
    { count: unlockedAchievementsCount },
    { count: activityLogTotalCount },
    { data: activitySampleRows },
  ] = await Promise.all([
    supabase.from("profiles").select("level, xp, coins, created_at, display_name").eq("id", userId).single(),
    supabase
      .from("user_items")
      .select("item_slug", { count: "exact", head: true })
      .eq("user_id", userId),
    supabase
      .from("activity_log")
      .select("id", { count: "exact", head: true })
      .eq("user_id", userId)
      .eq("action_type", "daily_login"),
    supabase
      .from("activity_log")
      .select("id", { count: "exact", head: true })
      .eq("user_id", userId)
      .eq("action_type", "avatar_update"),
    supabase
      .from("activity_log")
      .select("action_type, created_at")
      .eq("user_id", userId)
      .like("action_type", "household_task:%"),
    supabase
      .from("activity_log")
      .select("created_at")
      .eq("user_id", userId)
      .eq("action_type", "daily_login")
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle(),
    supabase
      .from("activity_log")
      .select("created_at")
      .eq("user_id", userId)
      .eq("action_type", "daily_login"),
    supabase
      .from("activity_log")
      .select("created_at, coins_delta")
      .eq("user_id", userId)
      .eq("action_type", "purchase_item"),
    supabase
      .from("user_achievements")
      .select("achievement_id", { count: "exact", head: true })
      .eq("user_id", userId),
    supabase
      .from("activity_log")
      .select("id", { count: "exact", head: true })
      .eq("user_id", userId),
    supabase
      .from("activity_log")
      .select("created_at")
      .eq("user_id", userId)
      .order("created_at", { ascending: false })
      .limit(5000),
  ]);

  const lc = loginDays ?? 0;
  const pc = purchasesCount ?? 0;
  const ac = avatarCount ?? 0;
  const level = profile?.level ?? 1;
  const xp = profile?.xp ?? 0;
  const coins = profile?.coins ?? 0;

  const bySlug: Record<string, number> = {};
  const dayTally: Record<string, number> = {};
  const slugsByDay: Record<string, Set<string>> = {};
  let householdOnWeekend = false;
  for (const row of houseRows ?? []) {
    const at = (row as { action_type?: string }).action_type ?? "";
    if (!at.startsWith("household_task:")) continue;
    const slug = at.replace("household_task:", "");
    bySlug[slug] = (bySlug[slug] ?? 0) + 1;
    const created = (row as { created_at?: string }).created_at ?? "";
    const day = created.slice(0, 10);
    if (day) dayTally[day] = (dayTally[day] ?? 0) + 1;
    if (day) {
      if (!slugsByDay[day]) slugsByDay[day] = new Set();
      slugsByDay[day].add(slug);
    }
    if (created) {
      const w = new Date(created).getUTCDay();
      if (w === 0 || w === 6) householdOnWeekend = true;
    }
  }
  const fullHouseDay = Object.values(slugsByDay).some((s) => s.size >= HOUSEHOLD_TASKS.length);
  const taskTotal = Object.values(bySlug).reduce((sum, n) => sum + n, 0);
  const maxTasksOneDay = Math.max(0, ...Object.values(dayTally));
  const jackAll = HOUSEHOLD_TASKS.every((t) => (bySlug[t.slug] ?? 0) >= 1);

  const loginDayKeys = new Set(
    (loginTimeRows ?? []).map((row) => utcDateKey((row as { created_at: string }).created_at)),
  );
  const taskDayKeys = new Set(
    Object.entries(dayTally)
      .filter(([, n]) => n > 0)
      .map(([d]) => d),
  );
  const threeDayChain = hasThreeConsecutiveDaysBoth(loginDayKeys, taskDayKeys);

  const totalPurchaseSpend = (purchaseTimeRows ?? []).reduce((sum, row) => {
    const delta = (row as { coins_delta?: number }).coins_delta ?? 0;
    return sum + Math.abs(delta);
  }, 0);

  const fridayThirteenHit = (activitySampleRows ?? []).some((row) =>
    isFridayThirteenUtc((row as { created_at: string }).created_at),
  );

  const displayName = (profile?.display_name as string | undefined)?.trim() ?? "";

  const checks: Array<[string, boolean]> = [
    ["first_login", lc >= 1],
    ["first_purchase", pc >= 1],
    ["level_3", level >= 3],
    ["level_5", level >= 5],
    ["level_7", level >= 7],
    ["level_10", level >= 10],
    ["level_12", level >= 12],
    ["level_15", level >= 15],
    ["level_18", level >= 18],
    ["level_20", level >= 20],
    ["level_25", level >= 25],
    ["level_30", level >= 30],
    ["login_7", lc >= 7],
    ["login_14", lc >= 14],
    ["login_30", lc >= 30],
    ["login_45", lc >= 45],
    ["login_60", lc >= 60],
    ["login_90", lc >= 90],
    ["login_120", lc >= 120],
    ["login_180", lc >= 180],
    ["login_270", lc >= 270],
    ["login_365", lc >= 365],
    ["login_500", lc >= 500],
    ["xp_1k", xp >= 1000],
    ["xp_3k", xp >= 3000],
    ["xp_8k", xp >= 8000],
    ["xp_15k", xp >= 15000],
    ["xp_35k", xp >= 35000],
    ["xp_60k", xp >= 60000],
    ["coins_250", coins >= 250],
    ["coins_800", coins >= 800],
    ["coins_2k", coins >= 2000],
    ["coins_5k", coins >= 5000],
    ["purchase_2", pc >= 2],
    ["purchase_4", pc >= 4],
    ["shop_collector", pc >= SHOP_ITEM_COUNT],
    ["tasks_10", taskTotal >= 10],
    ["tasks_30", taskTotal >= 30],
    ["tasks_75", taskTotal >= 75],
    ["tasks_150", taskTotal >= 150],
    ["tasks_300", taskTotal >= 300],
    ["tasks_500", taskTotal >= 500],
    ["tasks_1000", taskTotal >= 1000],
    ["avatar_5", ac >= 5],
    ["avatar_15", ac >= 15],
    ["avatar_40", ac >= 40],
    ["avatar_80", ac >= 80],
    ["jack_all_tasks", jackAll],
    ["power_day", maxTasksOneDay >= 3],
    ["obmashki_fan_5", (bySlug.obmashki ?? 0) >= 5],
    ["obmashki_fan_15", (bySlug.obmashki ?? 0) >= 15],
    ["tea_master_10", (bySlug.make_tea ?? 0) >= 10],
    ["dog_friend_20", (bySlug.walk_dog ?? 0) >= 20],
    ["smile_spark_15", (bySlug.smile_for_loved_one ?? 0) >= 15],
    ["wash_streak_12", (bySlug.wash_dishes ?? 0) >= 12],
    ["vacuum_pro_10", (bySlug.vacuum_floor ?? 0) >= 10],
    ["trash_ninja_15", (bySlug.take_out_trash ?? 0) >= 15],
    ["dance_repeat_12", (bySlug.dance_favorite_track ?? 0) >= 12],
    ["plant_care_10", (bySlug.water_plants ?? 0) >= 10],
  ];

  for (const [id, ok] of checks) {
    if (ok) {
      await unlockAchievementIfNeeded(userId, id);
    }
  }

  const lastAt = lastLoginRow?.created_at;
  if (lastAt) {
    const hour = new Date(lastAt as string).getUTCHours();
    if (hour >= 22 || hour <= 4) {
      await unlockAchievementIfNeeded(userId, "hidden_midnight");
    }
  }

  const loginUtcHours = (loginTimeRows ?? []).map((row) =>
    new Date((row as { created_at: string }).created_at).getUTCHours(),
  );
  const anyMorningLogin = loginUtcHours.some((h) => h >= 5 && h <= 8);
  const anyEveningLogin = loginUtcHours.some((h) => h >= 17 && h <= 20);

  if (anyMorningLogin) {
    await unlockAchievementIfNeeded(userId, "hidden_early_bird");
  }
  if (anyEveningLogin) {
    await unlockAchievementIfNeeded(userId, "hidden_evening_ritual");
  }
  if (householdOnWeekend) {
    await unlockAchievementIfNeeded(userId, "hidden_weekend_warrior");
  }
  if (maxTasksOneDay >= 5) {
    await unlockAchievementIfNeeded(userId, "hidden_typhoon_day");
  }
  if (fullHouseDay) {
    await unlockAchievementIfNeeded(userId, "hidden_full_house_day");
  }

  if ((bySlug.make_tea ?? 0) >= 30) {
    await unlockAchievementIfNeeded(userId, "hidden_tea_giant");
  }

  if (coins === 777) {
    await unlockAchievementIfNeeded(userId, "hidden_jackpot_balance");
  }
  if (totalPurchaseSpend >= 550) {
    await unlockAchievementIfNeeded(userId, "hidden_wallet_after_shopping");
  }
  if ((unlockedAchievementsCount ?? 0) >= 30) {
    await unlockAchievementIfNeeded(userId, "hidden_trophy_glutton");
  }
  if ((activityLogTotalCount ?? 0) >= 400) {
    await unlockAchievementIfNeeded(userId, "hidden_chronicle_thick");
  }
  if (coins >= 1 && coins <= 9) {
    await unlockAchievementIfNeeded(userId, "hidden_almost_broke");
  }
  if (displayName.length >= 20) {
    await unlockAchievementIfNeeded(userId, "hidden_scroll_name");
  }
  if (threeDayChain) {
    await unlockAchievementIfNeeded(userId, "hidden_three_day_chain");
  }
  if (fridayThirteenHit) {
    await unlockAchievementIfNeeded(userId, "hidden_friday_thirteen");
  }
  if (coins === 1337 || xp === 1337) {
    await unlockAchievementIfNeeded(userId, "hidden_leet_balance");
  }

  if (lc >= 100) {
    await unlockAchievementIfNeeded(userId, "hidden_sunrise_century");
  }
  if (coins >= 10_000) {
    await unlockAchievementIfNeeded(userId, "hidden_treasury_10k");
  }
  if (xp >= 100_000) {
    await unlockAchievementIfNeeded(userId, "hidden_xp_starship");
  }

  const purchasesByDay: Record<string, number> = {};
  for (const row of purchaseTimeRows ?? []) {
    const ts = (row as { created_at: string }).created_at?.slice(0, 10);
    if (ts) purchasesByDay[ts] = (purchasesByDay[ts] ?? 0) + 1;
  }
  if (Object.values(purchasesByDay).some((n) => n >= 3)) {
    await unlockAchievementIfNeeded(userId, "hidden_triple_cart_day");
  }

  const regAt = profile && "created_at" in profile ? (profile as { created_at?: string }).created_at : undefined;
  if (regAt && (loginTimeRows ?? []).length > 0) {
    const regMs = new Date(regAt).getTime();
    const firstLoginMs = Math.min(
      ...(loginTimeRows ?? []).map((r) => new Date((r as { created_at: string }).created_at).getTime()),
    );
    if (Number.isFinite(firstLoginMs) && firstLoginMs - regMs <= 60 * 60 * 1000) {
      await unlockAchievementIfNeeded(userId, "hidden_quick_start");
    }
  }

  if ((bySlug.make_tea ?? 0) >= 40) {
    await unlockAchievementIfNeeded(userId, "hidden_tea_sage");
  }
  if (coins >= 3000) {
    await unlockAchievementIfNeeded(userId, "hidden_squirrel");
  }
  if (taskTotal >= 800) {
    await unlockAchievementIfNeeded(userId, "hidden_home_legend");
  }
}

async function runPostLoginRewards(userId: string) {
  const supabase = await createClient();
  const start = new Date();
  start.setHours(0, 0, 0, 0);
  const end = new Date(start);
  end.setDate(end.getDate() + 1);

  const { data: todayLogin } = await supabase
    .from("activity_log")
    .select("id")
    .eq("user_id", userId)
    .eq("action_type", "daily_login")
    .gte("created_at", start.toISOString())
    .lt("created_at", end.toISOString())
    .maybeSingle();

  if (!todayLogin) {
    await updateProfileProgress(userId, 20, 30, "daily_login");
  }

  await evaluateAchievements(userId);
}

export async function bootstrapUser(userId: string, email: string) {
  const rawUrl = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";
  const rawKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? "";
  if (!rawUrl || /YOUR_PROJECT_ID|example\.com|placeholder/i.test(rawUrl)) {
    throw new Error(
      "В .env.local не настроен реальный NEXT_PUBLIC_SUPABASE_URL. Замените заглушку на URL проекта из Supabase (Settings → API → Project URL).",
    );
  }
  if (!rawKey || /YOUR_SUPABASE_ANON_KEY|placeholder/i.test(rawKey)) {
    throw new Error(
      "В .env.local не настроен NEXT_PUBLIC_SUPABASE_ANON_KEY. Скопируйте anon public key из Supabase → Settings → API.",
    );
  }

  const supabase = await createClient();

  const { data: existing } = await supabase
    .from("profiles")
    .select("id, character_setup_complete")
    .eq("id", userId)
    .maybeSingle();

  if (!existing) {
    const { error: profileError } = await supabase.from("profiles").insert({
      id: userId,
      email,
      display_name: "",
      character_setup_complete: false,
    });

    throwIfSupabaseError(profileError, "создание профиля");

    const { error: avatarError } = await supabase.from("avatar_appearance").insert({
      user_id: userId,
      ...DEFAULT_APPEARANCE,
    });
    throwIfSupabaseError(avatarError, "создание аватара");
  } else {
    const { error: emailError } = await supabase.from("profiles").update({ email }).eq("id", userId);
    throwIfSupabaseError(emailError, "обновление email в профиле");
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("character_setup_complete")
    .eq("id", userId)
    .single();

  if (profile?.character_setup_complete) {
    await runPostLoginRewards(userId);
  }
}

const NICKNAME_RE = /^[\p{L}\p{N} _.-]+$/u;

export async function completeCharacterSetup(
  userId: string,
  rawNickname: string,
  bodyType: "male" | "female",
) {
  const supabase = await createClient();

  const { data: profile, error: profileReadError } = await supabase
    .from("profiles")
    .select("character_setup_complete")
    .eq("id", userId)
    .single();

  if (profileReadError) {
    throw new Error(profileReadError.message);
  }

  if (profile?.character_setup_complete) {
    throw new Error("Персонаж для этого аккаунта уже создан.");
  }

  const nickname = rawNickname.trim().replace(/\s+/g, " ");
  if (nickname.length < 2 || nickname.length > 24) {
    throw new Error("Никнейм: от 2 до 24 символов.");
  }
  if (!NICKNAME_RE.test(nickname)) {
    throw new Error("Никнейм: только буквы, цифры, пробел, «_», «-» и «.».");
  }

  const preset = bodyType === "female" ? FEMALE_BODY_PRESET : MALE_BODY_PRESET;
  const appearancePatch: Partial<AvatarAppearance> = {
    ...DEFAULT_APPEARANCE,
    ...preset,
  };

  const { error: profileUpdateError } = await supabase
    .from("profiles")
    .update({
      display_name: nickname,
      character_setup_complete: true,
    })
    .eq("id", userId);

  if (profileUpdateError) {
    throw new Error(profileUpdateError.message);
  }

  const { error: avatarError } = await supabase
    .from("avatar_appearance")
    .update(appearancePatch)
    .eq("user_id", userId);

  if (avatarError) {
    throw new Error(avatarError.message);
  }

  await runPostLoginRewards(userId);
}

export async function getGameState(userId: string) {
  const supabase = await createClient();
  const start = new Date();
  start.setHours(0, 0, 0, 0);
  const end = new Date(start);
  end.setDate(end.getDate() + 1);

  const [
    { data: profile },
    { data: avatar },
    { data: items },
    { data: owned },
    { data: unlocked },
    { data: householdLogs },
    { data: achievementCatalog },
  ] = await Promise.all([
    supabase.from("profiles").select("*").eq("id", userId).single(),
    supabase.from("avatar_appearance").select("*").eq("user_id", userId).single(),
    supabase.from("items").select("*").order("price", { ascending: true }),
    supabase.from("user_items").select("item_slug").eq("user_id", userId),
    supabase
      .from("user_achievements")
      .select("achievement_id, unlocked_at, achievements(id, name, description, coins_reward, xp_reward, is_hidden)")
      .eq("user_id", userId)
      .order("unlocked_at", { ascending: false }),
    supabase
      .from("activity_log")
      .select("action_type")
      .eq("user_id", userId)
      .like("action_type", "household_task:%")
      .gte("created_at", start.toISOString())
      .lt("created_at", end.toISOString()),
    supabase
      .from("achievements")
      .select("id, name, description, coins_reward, xp_reward")
      .eq("is_hidden", false),
  ]);

  const normalizedProfile = {
    ...(profile as ProfileRow),
    character_setup_complete: Boolean((profile as ProfileRow | null)?.character_setup_complete),
  };
  const levelInfo = getLevelInfo(normalizedProfile.xp ?? 0);

  const completedHouseholdTaskSlugsToday = (householdLogs ?? [])
    .map((row) => (row.action_type as string)?.replace(/^household_task:/, "") ?? "")
    .filter((slug) => HOUSEHOLD_TASK_SLUGS.has(slug));

  const catalogSorted = sortAchievementCatalog(achievementCatalog ?? []);

  return {
    profile: normalizedProfile,
    levelInfo,
    avatar: normalizeAppearance(avatar as Partial<AvatarAppearance> | null),
    items: (items ?? []) as GameItem[],
    ownedItems: (owned ?? []).map((row) => row.item_slug),
    unlockedAchievements: unlocked ?? [],
    achievementCatalog: catalogSorted,
    householdTasks: HOUSEHOLD_TASKS,
    completedHouseholdTaskSlugsToday,
  };
}

export async function saveAvatarBase(userId: string, appearance: Partial<AvatarAppearance>) {
  const supabase = await createClient();
  const allowedFields = ["hair", "eyes", "nose", "mouth", "top", "bottom", "boots"] as const;

  const payload = Object.fromEntries(
    Object.entries(appearance).filter(([key]) =>
      (allowedFields as readonly string[]).includes(key),
    ),
  );

  const { error } = await supabase
    .from("avatar_appearance")
    .update(payload)
    .eq("user_id", userId);

  if (error) {
    if (error.message.includes("body_type")) {
      throw new Error(
        "Нужно обновить таблицу avatar_appearance: add column body_type. Выполните SQL из supabase/migrations/2026-04-13_add_body_type.sql",
      );
    }
    throw new Error(error.message);
  }

  await updateProfileProgress(userId, 10, 20, "avatar_update");
  await evaluateAchievements(userId);
}

export async function equipItem(userId: string, itemSlug: string) {
  const supabase = await createClient();

  const [{ data: item, error: itemError }, { data: owned }, { data: avatar }] = await Promise.all([
    supabase.from("items").select("slug, slot").eq("slug", itemSlug).single(),
    supabase
      .from("user_items")
      .select("item_slug")
      .eq("user_id", userId)
      .eq("item_slug", itemSlug)
      .maybeSingle(),
    supabase.from("avatar_appearance").select("equipped_slots").eq("user_id", userId).single(),
  ]);

  if (itemError || !item) {
    throw new Error(itemError?.message ?? "Item not found.");
  }

  if (!owned) {
    throw new Error("Этот предмет еще не куплен.");
  }

  const equippedSlots = ((avatar?.equipped_slots as Record<string, string>) ?? {}) as Record<
    string,
    string
  >;

  equippedSlots[item.slot] = item.slug;

  const { error: updateError } = await supabase
    .from("avatar_appearance")
    .update({ equipped_slots: equippedSlots })
    .eq("user_id", userId);

  if (updateError) {
    throw new Error(updateError.message);
  }
}

export async function unequipSlot(userId: string, slot: string) {
  const supabase = await createClient();
  const { data: avatar } = await supabase
    .from("avatar_appearance")
    .select("equipped_slots")
    .eq("user_id", userId)
    .single();

  const equippedSlots = ((avatar?.equipped_slots as Record<string, string>) ?? {}) as Record<
    string,
    string
  >;
  delete equippedSlots[slot];

  const { error } = await supabase
    .from("avatar_appearance")
    .update({ equipped_slots: equippedSlots })
    .eq("user_id", userId);

  if (error) {
    throw new Error(error.message);
  }
}

export async function buyItem(userId: string, itemSlug: string) {
  const supabase = await createClient();

  const [{ data: item }, { data: profile }, { data: alreadyOwned }] = await Promise.all([
    supabase.from("items").select("slug, price").eq("slug", itemSlug).single(),
    supabase.from("profiles").select("coins").eq("id", userId).single(),
    supabase
      .from("user_items")
      .select("item_slug")
      .eq("user_id", userId)
      .eq("item_slug", itemSlug)
      .maybeSingle(),
  ]);

  if (!item) {
    throw new Error("Предмет не найден.");
  }

  if (alreadyOwned) {
    throw new Error("Предмет уже куплен.");
  }

  if ((profile?.coins ?? 0) < item.price) {
    throw new Error("Недостаточно монет.");
  }

  const { error: insertError } = await supabase.from("user_items").insert({
    user_id: userId,
    item_slug: item.slug,
  });

  if (insertError) {
    throw new Error(insertError.message);
  }

  await updateProfileProgress(userId, -item.price, 25, "purchase_item");
  await evaluateAchievements(userId);
}

export async function completeHouseholdTask(userId: string, taskSlug: string) {
  if (!HOUSEHOLD_TASK_SLUGS.has(taskSlug)) {
    throw new Error("Такого задания нет.");
  }

  const task = HOUSEHOLD_TASKS.find((t) => t.slug === taskSlug);
  if (!task) {
    throw new Error("Такого задания нет.");
  }

  const supabase = await createClient();
  const actionType = `household_task:${task.slug}`;
  const start = new Date();
  start.setHours(0, 0, 0, 0);
  const end = new Date(start);
  end.setDate(end.getDate() + 1);

  const { data: already } = await supabase
    .from("activity_log")
    .select("id")
    .eq("user_id", userId)
    .eq("action_type", actionType)
    .gte("created_at", start.toISOString())
    .lt("created_at", end.toISOString())
    .maybeSingle();

  if (already) {
    throw new Error("Это задание уже отмечено сегодня. Загляните завтра!");
  }

  await updateProfileProgress(userId, task.coinsReward, task.xpReward, actionType);
  await evaluateAchievements(userId);
}
