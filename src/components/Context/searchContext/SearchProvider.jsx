import { useCallback, useEffect, useState } from "react";
import SearchContext from "./SearchContext";
import { readJSON, writeJSON } from "../../../lib/storage";

const LAST_CITY_KEY = "skysync-last-city";
const RECENT_KEY = "skysync-recent";
const DEFAULT_CITY = "Patna";

// A shared link (?city=) wins, then the last city viewed, then the default.
const initialCity = () =>
  new URLSearchParams(window.location.search).get("city")?.trim() ||
  readJSON(LAST_CITY_KEY, null) ||
  DEFAULT_CITY;

const SearchProvider = ({ children }) => {
  const [searchData, setSearch] = useState(initialCity);
  const [recentSearches, setRecentSearches] = useState(() => readJSON(RECENT_KEY, []));

  // Remember the city and keep the URL shareable.
  useEffect(() => {
    writeJSON(LAST_CITY_KEY, searchData);
    const url = new URL(window.location.href);
    url.searchParams.set("city", searchData);
    window.history.replaceState(null, "", url);
  }, [searchData]);

  useEffect(() => writeJSON(RECENT_KEY, recentSearches), [recentSearches]);

  const setSearchData = useCallback((query) => {
    const q = query.trim();
    if (!q) return;
    setSearch(q);
    setRecentSearches((list) =>
      [q, ...list.filter((item) => item.toLowerCase() !== q.toLowerCase())].slice(0, 5)
    );
  }, []);

  const removeRecentSearch = useCallback(
    (query) => setRecentSearches((list) => list.filter((item) => item !== query)),
    []
  );
  const clearRecentSearches = useCallback(() => setRecentSearches([]), []);

  return (
    <SearchContext.Provider
      value={{ searchData, setSearchData, recentSearches, removeRecentSearch, clearRecentSearches }}
    >
      {children}
    </SearchContext.Provider>
  );
};

export default SearchProvider;
