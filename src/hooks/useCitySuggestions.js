import { useEffect, useState } from "react";
import { searchCities } from "../lib/geo";

// Debounced city autocomplete; stale requests are aborted as the user keeps typing.
export default function useCitySuggestions(query) {
  const [suggestions, setSuggestions] = useState([]);

  useEffect(() => {
    const q = query.trim();
    if (q.length < 2) {
      setSuggestions([]);
      return;
    }

    const controller = new AbortController();
    const id = setTimeout(() => {
      searchCities(q, controller.signal)
        .then(setSuggestions)
        .catch((err) => {
          if (err.name !== "AbortError") setSuggestions([]);
        });
    }, 250);

    return () => {
      clearTimeout(id);
      controller.abort();
    };
  }, [query]);

  return suggestions;
}
