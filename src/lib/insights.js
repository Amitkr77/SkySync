import { aqiLevel, formatDegrees, formatEpoch, formatSpeed } from "./format";
import { upcomingHours } from "./forecast";

// Plain-language tips for the next 12 hours, most actionable first.
export function getInsights(data, airQuality, { unit, windUnit }) {
  const tips = [];
  const current = data.currentConditions;
  const nowSec = Date.now() / 1000;
  const upcoming = upcomingHours(data, 12);

  const wetHour = upcoming.find((hour) => hour.precipprob >= 50);
  if (wetHour) {
    tips.push({
      type: "rain",
      text:
        wetHour.datetimeEpoch <= nowSec
          ? "Rain likely now — take an umbrella"
          : `Take an umbrella — rain likely around ${formatEpoch(wetHour.datetimeEpoch, data.timezone, { hour: "numeric" })}`,
    });
  }

  const uvPeak = Math.max(current.uvindex ?? 0, ...upcoming.map((hour) => hour.uvindex ?? 0));
  if (uvPeak >= 6) tips.push({ type: "uv", text: `UV reaches ${uvPeak} — wear sunscreen` });

  if (current.feelslike >= 35) {
    tips.push({ type: "heat", text: `Feels like ${formatDegrees(current.feelslike, unit)} — stay hydrated` });
  } else if (current.feelslike <= 5) {
    tips.push({ type: "cold", text: `Feels like ${formatDegrees(current.feelslike, unit)} — dress warmly` });
  }

  const gust = Math.max(current.windgust ?? 0, current.windspeed ?? 0);
  if (gust >= 40) tips.push({ type: "wind", text: `Gusty winds up to ${formatSpeed(gust, windUnit)}` });

  if (airQuality?.us_aqi > 100) {
    tips.push({
      type: "aqi",
      text: `Air quality is ${aqiLevel(airQuality.us_aqi).label.toLowerCase()} — limit time outdoors`,
    });
  }

  if (current.visibility != null && current.visibility < 2) {
    tips.push({ type: "fog", text: "Low visibility — drive carefully" });
  }

  if (tips.length === 0) tips.push({ type: "good", text: "No weather worries for the next 12 hours" });
  return tips;
}
