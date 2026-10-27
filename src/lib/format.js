// Values from the API are metric; `unit` is "C" (metric) or "F" (imperial).

export const convertTemp = (celsius, unit) =>
  Math.round(unit === "F" ? (celsius * 9) / 5 + 32 : celsius);

export const formatTemp = (celsius, unit) => {
  if (celsius == null) return "–";
  return `${convertTemp(celsius, unit)}°${unit}`;
};

// Compact form for dense lists, e.g. "24°".
export const formatDegrees = (celsius, unit) =>
  celsius == null ? "–" : `${convertTemp(celsius, unit)}°`;

export const uvLabel = (uv) => {
  if (uv == null) return "";
  if (uv <= 2) return "Low";
  if (uv <= 5) return "Moderate";
  if (uv <= 7) return "High";
  if (uv <= 10) return "Very high";
  return "Extreme";
};

// US AQI bands (EPA).
export const aqiLevel = (aqi) => {
  if (aqi == null) return { label: "Unavailable", dot: "bg-muted" };
  if (aqi <= 50) return { label: "Good", dot: "bg-emerald-500" };
  if (aqi <= 100) return { label: "Moderate", dot: "bg-yellow-400" };
  if (aqi <= 150) return { label: "Unhealthy for sensitive groups", dot: "bg-orange-500" };
  if (aqi <= 200) return { label: "Unhealthy", dot: "bg-red-500" };
  if (aqi <= 300) return { label: "Very unhealthy", dot: "bg-purple-500" };
  return { label: "Hazardous", dot: "bg-rose-800" };
};

export const formatRelative = (timestampMs, nowMs = Date.now()) => {
  const minutes = Math.round((nowMs - timestampMs) / 60_000);
  if (minutes < 1) return "just now";
  if (minutes < 60) return `${minutes} min ago`;
  const hours = Math.round(minutes / 60);
  return hours < 24 ? `${hours} h ago` : `${Math.round(hours / 24)} d ago`;
};

const COMPASS =["N", "NE", "E", "SE", "S", "SW", "W", "NW"];
export const compassDirection = (degrees) =>
  degrees == null ? "" : COMPASS[Math.round(degrees / 45) % 8];

// `windUnit` is one of WIND_UNITS' keys; the API value is always km/h.
export const WIND_UNITS = {
  kmh: { label: "km/h", factor: 1 },
  mph: { label: "mph", factor: 0.621371 },
  ms: { label: "m/s", factor: 1 / 3.6 },
  kn: { label: "kn", factor: 0.539957 },
};

export const formatSpeed = (kmh, windUnit = "kmh") => {
  if (kmh == null) return "–";
  const { label, factor } = WIND_UNITS[windUnit] ?? WIND_UNITS.kmh;
  return `${Math.round(kmh * factor)} ${label}`;
};

// Distances follow the wind unit's system: miles for mph, km otherwise.
export const formatDistance = (km, windUnit) => {
  if (km == null) return "–";
  return windUnit === "mph" ? `${Math.round(km * 0.621371)} mi` : `${Math.round(km)} km`;
};

export const visibilityLabel = (km) => {
  if (km == null) return "";
  if (km >= 10) return "Clear view";
  if (km >= 4) return "Slightly hazy";
  if (km >= 1) return "Hazy";
  return "Fog";
};

export const pressureLabel = (hpa) => {
  if (hpa == null) return "";
  if (hpa < 1000) return "Low — unsettled";
  if (hpa > 1025) return "High — settled";
  return "Normal";
};

// Visual Crossing's moonphase: 0 new, 0.25 first quarter, 0.5 full, 0.75 last quarter.
export const moonPhaseName = (phase) => {
  if (phase == null) return "";
  const near = (target) => Math.abs(phase - target) < 0.03;
  if (near(0) || near(1)) return "New moon";
  if (near(0.25)) return "First quarter";
  if (near(0.5)) return "Full moon";
  if (near(0.75)) return "Last quarter";
  if (phase < 0.25) return "Waxing crescent";
  if (phase < 0.5) return "Waxing gibbous";
  if (phase < 0.75) return "Waning gibbous";
  return "Waning crescent";
};

// Formats an epoch (in seconds) in the location's own timezone, not the viewer's.
export const formatEpoch = (epochSeconds, timeZone, options) =>
  new Intl.DateTimeFormat("en-US", { timeZone, ...options }).format(
    new Date(epochSeconds * 1000)
  );
