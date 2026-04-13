/** Санкт-Петербург — координаты центра. */
const SPB_LAT = 59.9343;
const SPB_LON = 30.3351;

const OPEN_METEO =
  `https://api.open-meteo.com/v1/forecast?latitude=${SPB_LAT}&longitude=${SPB_LON}` +
  "&current=weather_code,is_day&timezone=Europe%2FMoscow";

/** Запасной фон (как раньше на сайте). */
export const FALLBACK_ATMOSPHERE_CSS = [
  "radial-gradient(ellipse 100% 80% at 50% -30%, rgba(99, 102, 241, 0.12), transparent 55%)",
  "linear-gradient(180deg, #0d0d14 0%, #0a0a12 100%)",
].join(", ");

export type AtmosphereKind = "clear" | "cloud" | "fog" | "rain" | "snow" | "storm";

export type SpbAtmosphere = {
  /** Готовая строка для CSS `background` (несколько слоёв). */
  background: string;
  isDay: boolean;
  weatherCode: number;
  /** Упрощённый тип погоды для визуальных эффектов на фоне. */
  kind: AtmosphereKind;
};

/** Если Open-Meteo недоступен — нейтральный дневной пасмурный сценарий. */
export const FALLBACK_ATMOSPHERE: SpbAtmosphere = {
  background: FALLBACK_ATMOSPHERE_CSS,
  isDay: true,
  weatherCode: -1,
  kind: "cloud",
};

function classifyWeather(code: number): AtmosphereKind {
  if (code === 0) return "clear";
  if (code >= 1 && code <= 3) return "cloud";
  if (code === 45 || code === 48) return "fog";
  if (code >= 51 && code <= 67) return "rain";
  if (code >= 80 && code <= 82) return "rain";
  if (code >= 71 && code <= 77 || code === 85 || code === 86) return "snow";
  if (code >= 95) return "storm";
  return "cloud";
}

function buildLayers(isDay: boolean, kind: ReturnType<typeof classifyWeather>): string[] {
  const base = "#080810";

  if (!isDay) {
    switch (kind) {
      case "clear":
        return [
          "radial-gradient(ellipse 110% 90% at 50% -35%, rgba(99, 102, 241, 0.28), transparent 52%)",
          "radial-gradient(ellipse 80% 50% at 85% 100%, rgba(139, 92, 246, 0.12), transparent 50%)",
          `linear-gradient(180deg, #0c1022 0%, ${base} 55%)`,
        ];
      case "rain":
        return [
          "radial-gradient(ellipse 100% 55% at 40% -5%, rgba(56, 189, 248, 0.14), transparent 55%)",
          `linear-gradient(180deg, #0a121c 0%, ${base} 60%)`,
        ];
      case "snow":
        return [
          "radial-gradient(ellipse 90% 50% at 50% -10%, rgba(226, 232, 240, 0.1), transparent 55%)",
          `linear-gradient(180deg, #0e141c 0%, ${base} 58%)`,
        ];
      case "storm":
        return [
          "radial-gradient(ellipse 85% 45% at 70% -5%, rgba(168, 85, 247, 0.22), transparent 50%)",
          "radial-gradient(ellipse 60% 40% at 20% 0%, rgba(59, 130, 246, 0.12), transparent 45%)",
          `linear-gradient(180deg, #140a1c 0%, ${base} 55%)`,
        ];
      case "fog":
        return [
          "radial-gradient(ellipse 120% 70% at 50% -20%, rgba(148, 163, 184, 0.14), transparent 55%)",
          `linear-gradient(180deg, #111418 0%, ${base} 65%)`,
        ];
      case "cloud":
      default:
        return [
          "radial-gradient(ellipse 100% 65% at 50% -25%, rgba(100, 116, 139, 0.18), transparent 55%)",
          `linear-gradient(180deg, #10141c 0%, ${base} 62%)`,
        ];
    }
  }

  /* День: те же тёмные тона сайта, но теплее/светлее «небо» сверху */
  switch (kind) {
    case "clear":
      return [
        "radial-gradient(ellipse 100% 75% at 50% -30%, rgba(251, 191, 36, 0.16), transparent 52%)",
        "radial-gradient(ellipse 70% 50% at 15% 0%, rgba(129, 140, 248, 0.12), transparent 48%)",
        `linear-gradient(180deg, #121a2e 0%, #0e1018 45%, ${base} 100%)`,
      ];
    case "rain":
      return [
        "radial-gradient(ellipse 100% 55% at 35% -8%, rgba(56, 189, 248, 0.12), transparent 55%)",
        `linear-gradient(180deg, #101820 0%, ${base} 58%)`,
      ];
    case "snow":
      return [
        "radial-gradient(ellipse 95% 55% at 50% -15%, rgba(226, 232, 240, 0.12), transparent 52%)",
        `linear-gradient(180deg, #121820 0%, ${base} 60%)`,
      ];
    case "storm":
      return [
        "radial-gradient(ellipse 80% 45% at 65% -5%, rgba(192, 132, 252, 0.16), transparent 48%)",
        `linear-gradient(180deg, #160f24 0%, ${base} 55%)`,
      ];
    case "fog":
      return [
        "radial-gradient(ellipse 110% 70% at 50% -18%, rgba(148, 163, 184, 0.12), transparent 55%)",
        `linear-gradient(180deg, #12161c 0%, ${base} 65%)`,
      ];
    case "cloud":
    default:
      return [
        "radial-gradient(ellipse 100% 65% at 50% -22%, rgba(148, 163, 184, 0.14), transparent 54%)",
        `linear-gradient(180deg, #141820 0%, ${base} 62%)`,
      ];
  }
}

const OPEN_METEO_TIMEOUT_MS = 2500;

export async function getSpbAtmosphere(): Promise<SpbAtmosphere> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), OPEN_METEO_TIMEOUT_MS);
  try {
    const res = await fetch(OPEN_METEO, {
      next: { revalidate: 600 },
      signal: controller.signal,
    });
    if (!res.ok) throw new Error(`open-meteo ${res.status}`);
    const data = (await res.json()) as {
      current?: { weather_code?: number; is_day?: number };
    };
    const weatherCode = data.current?.weather_code ?? 0;
    const isDay = data.current?.is_day === 1;
    const kind = classifyWeather(weatherCode);
    const background = buildLayers(isDay, kind).join(", ");
    return { background, isDay, weatherCode, kind };
  } catch {
    return { ...FALLBACK_ATMOSPHERE };
  } finally {
    clearTimeout(timeoutId);
  }
}
