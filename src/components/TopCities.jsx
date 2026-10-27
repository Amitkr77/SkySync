import { useContext, useState } from "react";
import { ChevronRight, Star } from "lucide-react";
import UnitContext from "./Context/unitContext/UnitContext";
import SearchContext from "./Context/searchContext/SearchContext";
import FavoritesContext from "./Context/favoritesContext/FavoritesContext";
import ToastContext from "./Context/toastContext/ToastContext";
import WeatherIcon from "./WeatherIcon";
import Skeleton from "./Skeleton";
import usePlacesWeather from "../hooks/usePlacesWeather";
import { formatDegrees } from "../lib/format";

const POPULAR = [
  { query: "Patna", name: "Patna", detail: "India" },
  { query: "Mumbai", name: "Mumbai", detail: "India" },
  { query: "New York", name: "New York", detail: "USA" },
  { query: "London", name: "London", detail: "UK" },
  { query: "Tokyo", name: "Tokyo", detail: "Japan" },
  { query: "Sydney", name: "Sydney", detail: "Australia" },
  { query: "Cairo", name: "Cairo", detail: "Egypt" },
  { query: "Paris", name: "Paris", detail: "France" },
  { query: "Berlin", name: "Berlin", detail: "Germany" },
  { query: "Toronto", name: "Toronto", detail: "Canada" },
];

// Saved places are stored as full addresses ("Patna, Bihar, India"); show the first part as the name.
const toPlace = (label) => {
  const [name, ...rest] = label.split(",").map((part) => part.trim());
  return { query: label, name, detail: rest.join(", ") };
};

const TopCities = ({ className = "" }) => {
  const { unit } = useContext(UnitContext);
  const { setSearchData } = useContext(SearchContext);
  const { favorites, toggleFavorite } = useContext(FavoritesContext);
  const { notify } = useContext(ToastContext);
  const [tab, setTab] = useState(() => (favorites.length ? "saved" : "popular"));

  const places = tab === "saved" ? favorites.map(toPlace) : POPULAR;
  // Only the visible tab's places are fetched.
  const weather = usePlacesWeather(places.map((p) => p.query));
  const conditions = weather && places.map((_, i) => ({ current: weather[i]?.currentConditions }));

  const unsave = (place) => {
    toggleFavorite(place.query);
    notify(`Removed ${place.name} from saved`, { action: "Undo", onAction: () => toggleFavorite(place.query) });
  };

  const openCity = (query) => {
    setSearchData(query);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <section className={`card flex flex-col ${className}`}>
      <div className="mb-3 flex items-center justify-between">
        <h2 className="card-title mb-0">Cities</h2>
        <div role="tablist" aria-label="City lists" className="flex rounded-full bg-subtle p-0.5 text-xs">
          {[
            ["saved", `Saved${favorites.length ? ` · ${favorites.length}` : ""}`],
            ["popular", "Popular"],
          ].map(([id, label]) => (
            <button
              key={id}
              type="button"
              role="tab"
              aria-selected={tab === id}
              onClick={() => setTab(id)}
              className={`rounded-full px-3 py-1 transition-colors ${
                tab === id ? "bg-surface font-medium text-fg shadow-sm" : "text-muted hover:text-fg"
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      <div className="-mx-2 max-h-[360px] flex-1 overflow-y-auto scrollbar-thin" role="tabpanel">
        {tab === "saved" && favorites.length === 0 && (
          <p className="px-2 py-6 text-center text-sm text-muted">
            Tap <Star className="inline h-3.5 w-3.5 align-[-2px]" /> on a city to save it here.
          </p>
        )}
        {!conditions &&
          places.map((p) => <Skeleton key={p.query} className="mx-2 my-3 h-10" />)}
        <ul>
          {conditions &&
            places.map((place, i) => {
              const current = conditions[i]?.current;
              return (
                <li key={place.query} className="group flex items-center rounded-xl transition-colors hover:bg-subtle">
                  <button
                    type="button"
                    onClick={() => openCity(place.query)}
                    className="flex min-w-0 flex-1 items-center gap-3 rounded-xl px-2 py-2.5 text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
                  >
                    {current ? (
                      <WeatherIcon icon={current.icon} label={current.conditions} className="h-6 w-6 shrink-0" />
                    ) : (
                      <span className="h-6 w-6 shrink-0" />
                    )}
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-sm font-medium">{place.name}</span>
                      <span className="block truncate text-xs text-muted">
                        {[place.detail, current?.conditions ?? "Unavailable"].filter(Boolean).join(" · ")}
                      </span>
                    </span>
                    <span className="text-sm font-medium">{current ? formatDegrees(current.temp, unit) : ""}</span>
                  </button>
                  {tab === "saved" ? (
                    <button
                      type="button"
                      aria-label={`Remove ${place.name} from saved cities`}
                      onClick={() => unsave(place)}
                      className="mr-1 rounded-full p-1.5 text-amber-400 hover:bg-line"
                    >
                      <Star className="h-4 w-4 fill-current" />
                    </button>
                  ) : (
                    <ChevronRight className="mr-2 h-4 w-4 text-muted opacity-0 transition-opacity group-hover:opacity-100" />
                  )}
                </li>
              );
            })}
        </ul>
      </div>
    </section>
  );
};

export default TopCities;
