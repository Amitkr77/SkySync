import { useCallback, useEffect, useState } from "react";
import FavoritesContext from "./FavoritesContext";
import { readJSON, writeJSON } from "../../../lib/storage";

const STORAGE_KEY = "skysync-favorites";
const same = (a, b) => a.toLowerCase() === b.toLowerCase();

const FavoritesProvider = ({ children }) => {
  const [favorites, setFavorites] = useState(() => readJSON(STORAGE_KEY, []));

  useEffect(() => writeJSON(STORAGE_KEY, favorites), [favorites]);

  const isFavorite = useCallback((place) => favorites.some((f) => same(f, place)), [favorites]);

  const toggleFavorite = useCallback(
    (place) =>
      setFavorites((list) =>
        list.some((f) => same(f, place)) ? list.filter((f) => !same(f, place)) : [...list, place]
      ),
    []
  );

  return (
    <FavoritesContext.Provider value={{ favorites, isFavorite, toggleFavorite }}>
      {children}
    </FavoritesContext.Provider>
  );
};

export default FavoritesProvider;
