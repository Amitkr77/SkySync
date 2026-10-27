const API_KEY = import.meta.env.WEATHER_API_KEY;
const BASE_URL =
  "https://weather.visualcrossing.com/VisualCrossingWebServices/rest/services/timeline";

const ERROR_MESSAGES = {
  400: "Couldn't find that location. Check the spelling and try again.",
  401: "Invalid weather API key. Check WEATHER_API_KEY in your .env file.",
  429: "Daily weather API limit reached. Try again later.",
};

// Responses are cached in localStorage: reused while fresh to save API quota,
// and served (marked `_stale`) when the network or API fails, e.g. offline.
const CACHE_PREFIX = "skysync-cache:";
const FRESH_MS = 10 * 60 * 1000;
const MAX_AGE_MS = 24 * 60 * 60 * 1000;

const readCache = (key) => {
  try {
    const raw = localStorage.getItem(CACHE_PREFIX + key);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
};

const pruneCache = (maxAge) => {
  try {
    for (const key of Object.keys(localStorage)) {
      if (!key.startsWith(CACHE_PREFIX)) continue;
      const fetchedAt = JSON.parse(localStorage.getItem(key))?._fetchedAt ?? 0;
      if (Date.now() - fetchedAt > maxAge) localStorage.removeItem(key);
    }
  } catch {
    // Storage unavailable — caching is best-effort.
  }
};

const writeCache = (key, data) => {
  try {
    localStorage.setItem(CACHE_PREFIX + key, JSON.stringify(data));
  } catch {
    // Probably over quota: drop everything cached and try once more.
    pruneCache(0);
    try {
      localStorage.setItem(CACHE_PREFIX + key, JSON.stringify(data));
    } catch {
      // Give up quietly; the app works without the cache.
    }
  }
};

pruneCache(MAX_AGE_MS);

// All values come back in metric units (°C, km/h, mb); convert at display time.
export async function fetchWeather(
  location,
  { period = "", include = "days,hours,current,alerts", signal, force = false } = {}
) {
  if (!API_KEY) {
    throw new Error("Missing WEATHER_API_KEY. Add it to your .env file.");
  }

  const cacheKey = `${location.toLowerCase()}|${period}|${include}`;
  const cached = readCache(cacheKey);
  if (!force && cached && Date.now() - cached._fetchedAt < FRESH_MS) return cached;

  const path = [encodeURIComponent(location), period].filter(Boolean).join("/");
  const params = new URLSearchParams({
    unitGroup: "metric",
    include,
    key: API_KEY,
    contentType: "json",
  });

  try {
    const res = await fetch(`${BASE_URL}/${path}?${params}`, { signal });
    if (!res.ok) {
      const error = new Error(ERROR_MESSAGES[res.status] ?? "Failed to fetch weather data.");
      error.status = res.status;
      throw error;
    }
    const data = await res.json();
    data._fetchedAt = Date.now();
    writeCache(cacheKey, data);
    return data;
  } catch (error) {
    // A bad location is a real answer; anything else falls back to saved data if we have it.
    if (error.name === "AbortError" || error.status === 400 || !cached) throw error;
    return { ...cached, _stale: true };
  }
}
