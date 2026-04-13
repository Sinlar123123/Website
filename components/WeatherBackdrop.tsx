import type { AtmosphereKind } from "@/lib/weather/spb-atmosphere";

type Props = {
  background: string;
  isDay: boolean;
  kind: AtmosphereKind;
};

/** Детерминированные снежинки (без клиента), позиции «случайные», но стабильные между рендерами. */
const SNOW_FLAKES = Array.from({ length: 48 }, (_, i) => {
  const left = ((i * 37 + i * i * 3) % 1000) / 10;
  const delay = ((i * 0.19) % 8).toFixed(2);
  const duration = (8 + (i % 8) + (i % 5) * 0.3).toFixed(2);
  const size = 2 + (i % 4);
  return { left: `${left}%`, delay, duration, size };
});

/**
 * Фон: градиент по погоде + солнце/луна + туман + дождь/снег (CSS в globals.css).
 */
export default function WeatherBackdrop({ background, isDay, kind }: Props) {
  const showRain = kind === "rain" || kind === "storm";
  const showSnow = kind === "snow";
  const precip = showRain || showSnow;

  const showSunBright = isDay && kind === "clear";
  const showSunHazy = isDay && kind === "cloud";
  const showMoon = !isDay;

  const showFogHeavy = kind === "fog";
  const showFogMild = kind === "cloud";

  const rootClass =
    "weather-backdrop-root pointer-events-none fixed inset-0 -z-10 min-h-[100dvh]" +
    (precip ? " weather-backdrop-root--precip" : "");

  return (
    <div
      aria-hidden
      className={rootClass}
      data-weather={kind}
      data-day={isDay ? "1" : "0"}
    >
      <div
        className="absolute inset-0 transition-[background] duration-[2.4s] ease-out"
        style={{ background }}
      />

      {showMoon ? (
        <div
          className={
            "weather-moon" + (showRain || showSnow ? " weather-moon--muted" : "")
          }
        />
      ) : null}

      {showSunBright ? (
        <div className="weather-sun weather-sun--bright">
          <div className="weather-sun-core" />
          <div className="weather-sun-rays" />
        </div>
      ) : null}

      {showSunHazy ? (
        <div className="weather-sun weather-sun--hazy">
          <div className="weather-sun-core" />
        </div>
      ) : null}

      {showFogHeavy ? <div className="weather-fog weather-fog--heavy" /> : null}
      {showFogMild ? <div className="weather-fog weather-fog--mild" /> : null}

      <div className="weather-backdrop-ambient absolute inset-0" />

      {showRain ? (
        <div className="weather-rain" aria-hidden>
          <div className="weather-rain-layer weather-rain-layer--a" />
          <div className="weather-rain-layer weather-rain-layer--b" />
        </div>
      ) : null}

      {showSnow ? (
        <div className="weather-snow-layer" aria-hidden>
          {SNOW_FLAKES.map((f, i) => (
            <span
              key={i}
              className="weather-snowflake"
              style={{
                left: f.left,
                animationDelay: `${f.delay}s`,
                animationDuration: `${f.duration}s`,
                width: f.size,
                height: f.size,
              }}
            />
          ))}
        </div>
      ) : null}
    </div>
  );
}
