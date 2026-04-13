import WeatherBackdrop from "@/components/WeatherBackdrop";
import { getSpbAtmosphere } from "@/lib/weather/spb-atmosphere";

/** Серверный кусок: погода подтягивается отдельно, не блокируя первый ответ страницы. */
export default async function WeatherBackdropLoader() {
  const atmosphere = await getSpbAtmosphere();
  return <WeatherBackdrop background={atmosphere.background} />;
}
