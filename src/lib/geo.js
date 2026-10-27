// Keyless helpers: Open-Meteo for city search and air quality, Nominatim for reverse geocoding.

const unique = (parts) => parts.filter((part, i) => part && parts.indexOf(part) === i);

export async function searchCities(query, signal) {
  const params = new URLSearchParams({ name: query, count: "6", language: "en", format: "json" });
  const res = await fetch(`https://geocoding-api.open-meteo.com/v1/search?${params}`, { signal });
  if (!res.ok) throw new Error("City search failed.");
  const { results = [] } = await res.json();
  return results.map((r) => ({
    id: r.id,
    name: r.name,
    detail: unique([r.admin1, r.country]).join(", "),
    label: unique([r.name, r.admin1, r.country]).join(", "),
  }));
}

// Turns coordinates into a readable place name like "Patna, Bihar, India".
export async function reverseGeocode(latitude, longitude, signal) {
  const params = new URLSearchParams({
    format: "jsonv2",
    lat: latitude,
    lon: longitude,
    zoom: "10",
    "accept-language": "en",
  });
  const res = await fetch(`https://nominatim.openstreetmap.org/reverse?${params}`, { signal });
  if (!res.ok) throw new Error("Reverse geocoding failed.");
  const { address = {}, name } = await res.json();
  const place = address.city || address.town || address.village || address.county || name;
  if (!place) return null;
  return unique([place, address.state, address.country]).join(", ");
}

export async function fetchAirQuality(latitude, longitude, signal) {
  const params = new URLSearchParams({ latitude, longitude, current: "us_aqi,pm2_5" });
  const res = await fetch(`https://air-quality-api.open-meteo.com/v1/air-quality?${params}`, { signal });
  if (!res.ok) throw new Error("Air quality lookup failed.");
  const { current } = await res.json();
  return current?.us_aqi == null ? null : current;
}
