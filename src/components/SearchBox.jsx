import { useContext, useEffect, useRef, useState } from "react";
import { Clock, LoaderCircle, LocateFixed, MapPin, Search, X } from "lucide-react";
import SearchContext from "./Context/searchContext/SearchContext";
import useCitySuggestions from "../hooks/useCitySuggestions";
import { reverseGeocode } from "../lib/geo";

const SearchBox = ({ className = "" }) => {
  const { setSearchData, recentSearches, removeRecentSearch, clearRecentSearches } =
    useContext(SearchContext);
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(-1);
  const [locating, setLocating] = useState(false);
  const [notice, setNotice] = useState(null);
  const rootRef = useRef(null);
  const inputRef = useRef(null);
  const suggestions = useCitySuggestions(query);

  const typing = query.trim().length >= 2;
  // Empty box: "use my location" + recent searches. Typing: live suggestions.
  const items = typing
    ? suggestions.map((s) => ({ kind: "city", ...s }))
    : [{ kind: "locate" }, ...recentSearches.map((label) => ({ kind: "recent", label }))];

  useEffect(() => setActive(-1), [query, open]);

  useEffect(() => {
    if (!open) return;
    const onPointerDown = (e) => {
      if (!rootRef.current?.contains(e.target)) setOpen(false);
    };
    document.addEventListener("pointerdown", onPointerDown);
    return () => document.removeEventListener("pointerdown", onPointerDown);
  }, [open]);

  // "/" focuses search from anywhere, unless the user is already typing somewhere.
  useEffect(() => {
    const onKeyDown = (e) => {
      const typingElsewhere = e.target.closest?.("input, textarea, select, [contenteditable=true]");
      if (e.key === "/" && !typingElsewhere && !e.metaKey && !e.ctrlKey && !e.altKey) {
        e.preventDefault();
        inputRef.current?.focus();
      }
    };
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, []);

  useEffect(() => {
    if (!notice) return;
    const id = setTimeout(() => setNotice(null), 4000);
    return () => clearTimeout(id);
  }, [notice]);

  const finish = () => {
    setQuery("");
    setOpen(false);
    inputRef.current?.blur();
  };

  const locate = () => {
    if (!navigator.geolocation) {
      setNotice("Location isn't supported in this browser.");
      return;
    }
    setLocating(true);
    navigator.geolocation.getCurrentPosition(
      async ({ coords }) => {
        const name = await reverseGeocode(coords.latitude, coords.longitude).catch(() => null);
        setSearchData(name ?? `${coords.latitude.toFixed(4)},${coords.longitude.toFixed(4)}`);
        setLocating(false);
        finish();
      },
      (err) => {
        setLocating(false);
        setNotice(err.code === err.PERMISSION_DENIED ? "Location permission was denied." : "Couldn't get your location.");
      },
      { timeout: 10_000, maximumAge: 10 * 60_000 }
    );
  };

  const choose = (item) => {
    if (item.kind === "locate") return locate();
    setSearchData(item.label);
    finish();
  };

  const onKeyDown = (event) => {
    if (event.key === "ArrowDown" || event.key === "ArrowUp") {
      event.preventDefault();
      setOpen(true);
      const step = event.key === "ArrowDown" ? 1 : -1;
      setActive((i) => (items.length ? (i + step + items.length) % items.length : -1));
    } else if (event.key === "Escape") {
      setOpen(false);
    } else if (event.key === "Enter" && open && active >= 0 && items[active]) {
      event.preventDefault();
      choose(items[active]);
    }
  };

  const onSubmit = (event) => {
    event.preventDefault();
    if (!query.trim()) return;
    // Prefer the top suggestion so "londo" still lands on London.
    setSearchData(typing && suggestions[0] ? suggestions[0].label : query);
    finish();
  };

  const showList = open && (typing ? suggestions.length > 0 : true);

  return (
    <div ref={rootRef} className={`relative ${className}`}>
      <form role="search" onSubmit={onSubmit}>
        <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />
        <input
          ref={inputRef}
          type="search"
          role="combobox"
          aria-label="Search city"
          aria-expanded={showList}
          aria-controls="search-listbox"
          aria-autocomplete="list"
          aria-activedescendant={active >= 0 ? `search-option-${active}` : undefined}
          placeholder="Search for a city"
          autoComplete="off"
          value={query}
          onChange={(event) => {
            setQuery(event.target.value);
            setOpen(true);
          }}
          onFocus={() => setOpen(true)}
          onKeyDown={onKeyDown}
          className="h-10 w-full rounded-full border border-line bg-surface pl-10 pr-11 text-sm placeholder:text-muted focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/30 [&::-webkit-search-cancel-button]:hidden"
        />
        {!query && !open && (
          <kbd className="pointer-events-none absolute right-11 top-1/2 hidden -translate-y-1/2 rounded-md border border-line bg-subtle px-1.5 text-[11px] text-muted sm:block">
            /
          </kbd>
        )}
        <button
          type="button"
          onClick={locate}
          aria-label="Use my location"
          title="Use my location"
          className="absolute right-1.5 top-1/2 -translate-y-1/2 rounded-full p-1.5 text-muted transition-colors hover:bg-subtle hover:text-fg"
        >
          {locating ? <LoaderCircle className="h-4 w-4 animate-spin" /> : <LocateFixed className="h-4 w-4" />}
        </button>
      </form>

      {notice && (
        <p role="status" className="absolute left-4 top-11 text-xs text-red-500">
          {notice}
        </p>
      )}

      {showList && (
        <div className="absolute inset-x-0 top-12 rounded-2xl border border-line bg-surface p-1.5 shadow-xl">
          {!typing && recentSearches.length > 0 && (
            <div className="flex items-center justify-between px-3 pb-1 pt-2 text-xs text-muted">
              <span>Recent</span>
              <button type="button" onClick={clearRecentSearches} className="hover:text-fg">
                Clear
              </button>
            </div>
          )}
          <ul id="search-listbox" role="listbox" aria-label="Search suggestions">
            {items.map((item, index) => (
              <li
                key={item.kind === "locate" ? "locate" : `${item.kind}-${item.id ?? item.label}`}
                id={`search-option-${index}`}
                role="option"
                aria-selected={active === index}
                onPointerDown={(e) => e.preventDefault()}
                onClick={() => choose(item)}
                onMouseEnter={() => setActive(index)}
                className={`group flex cursor-pointer items-center gap-3 rounded-xl px-3 py-2 text-sm ${
                  active === index ? "bg-subtle" : ""
                } ${item.kind === "locate" && recentSearches.length > 0 ? "mb-1" : ""}`}
              >
                {item.kind === "locate" && (
                  <>
                    <LocateFixed className="h-4 w-4 text-accent" />
                    <span className="text-accent">Use my current location</span>
                  </>
                )}
                {item.kind === "recent" && (
                  <>
                    <Clock className="h-4 w-4 shrink-0 text-muted" />
                    <span className="min-w-0 flex-1 truncate">{item.label}</span>
                    <button
                      type="button"
                      aria-label={`Remove ${item.label} from recent searches`}
                      onClick={(e) => {
                        e.stopPropagation();
                        removeRecentSearch(item.label);
                      }}
                      className="rounded-full p-1 text-muted opacity-0 hover:bg-line hover:text-fg group-hover:opacity-100"
                    >
                      <X className="h-3.5 w-3.5" />
                    </button>
                  </>
                )}
                {item.kind === "city" && (
                  <>
                    <MapPin className="h-4 w-4 shrink-0 text-muted" />
                    <span className="min-w-0 flex-1 truncate">
                      <span className="font-medium">{item.name}</span>
                      {item.detail && <span className="text-muted"> · {item.detail}</span>}
                    </span>
                  </>
                )}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default SearchBox;
