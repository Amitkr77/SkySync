import { useEffect, useState } from "react";
import { fetchWeather } from "../lib/weatherApi";

// Current conditions for several places at once. Returns null while loading, then an
// array aligned with `queries` (null entries for places that failed).
// "today" + "current" costs one API record per place, and responses are cached.
export default function usePlacesWeather(queries, enabled = true) {
  const [results, setResults] = useState(null);
  const key = enabled ? queries.join("|") : "";

  useEffect(() => {
    if (!enabled) return;
    setResults(null);
    if (!key) {
      setResults([]);
      return;
    }
    const controller = new AbortController();
    const list = key.split("|");

    Promise.allSettled(
      list.map((query) => fetchWeather(query, { period: "today", include: "current", signal: controller.signal }))
    ).then((settled) => {
      if (!controller.signal.aborted) {
        setResults(settled.map((result) => (result.status === "fulfilled" ? result.value : null)));
      }
    });

    return () => controller.abort();
  }, [key, enabled]);

  return results;
}
