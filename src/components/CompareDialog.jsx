import { useContext, useEffect, useRef, useState } from "react";
import { LoaderCircle, MapPin, Search, X } from "lucide-react";
import dataContext from "./Context/dataContext/dataContext";
import UnitContext from "./Context/unitContext/UnitContext";
import WeatherIcon from "./WeatherIcon";
import useCitySuggestions from "../hooks/useCitySuggestions";
import { fetchWeather } from "../lib/weatherApi";
import { formatDegrees, formatSpeed, formatTemp } from "../lib/format";

const ROWS = [
  ["Now", (d, u) => formatTemp(d.currentConditions.temp, u)],
  ["Feels like", (d, u) => formatTemp(d.currentConditions.feelslike, u)],
  ["High / Low", (d, u) => `${formatDegrees(d.days[0].tempmax, u)} / ${formatDegrees(d.days[0].tempmin, u)}`],
  ["Conditions", (d) => d.currentConditions.conditions],
  ["Chance of rain", (d) => `${Math.round(d.days[0].precipprob ?? 0)}%`],
  ["Humidity", (d) => `${Math.round(d.currentConditions.humidity)}%`],
  ["Wind", (d, u, w) => formatSpeed(d.currentConditions.windspeed, w)],
  ["UV index", (d) => d.currentConditions.uvindex ?? "–"],
  [
    "Local time",
    (d) =>
      new Intl.DateTimeFormat("en-US", { timeZone: d.timezone, hour: "numeric", minute: "2-digit" }).format(
        Date.now()
      ),
  ],
];

const CompareDialog = ({ open, onClose }) => {
  const dialogRef = useRef(null);
  const { sharedData } = useContext(dataContext);
  const { unit, windUnit } = useContext(UnitContext);
  const [query, setQuery] = useState("");
  const [other, setOther] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const suggestions = useCitySuggestions(query);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (open && !dialog.open) dialog.showModal();
    if (!open && dialog.open) dialog.close();
  }, [open]);

  const pick = async (label) => {
    setQuery("");
    setLoading(true);
    setError(null);
    try {
      // "today" with current + days costs a single API record.
      setOther(await fetchWeather(label, { period: "today", include: "current,days" }));
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const columns = [sharedData, other];

  return (
    <dialog
      ref={dialogRef}
      onClose={onClose}
      onClick={(e) => e.target === dialogRef.current && onClose()}
      aria-labelledby="compare-title"
      className="w-[min(40rem,calc(100vw-2rem))] rounded-2xl border border-line bg-surface p-0 text-fg shadow-2xl backdrop:bg-black/50 backdrop:backdrop-blur-sm"
    >
      <div className="p-5">
        <div className="flex items-center justify-between">
          <h2 id="compare-title" className="text-base font-medium">
            Compare cities
          </h2>
          <button
            type="button"
            aria-label="Close"
            onClick={onClose}
            className="rounded-full p-1.5 text-muted hover:bg-subtle hover:text-fg"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <form
          className="relative mt-4"
          onSubmit={(e) => {
            e.preventDefault();
            if (query.trim()) pick(suggestions[0]?.label ?? query.trim());
          }}
        >
          <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />
          <input
            type="search"
            aria-label="City to compare"
            placeholder="Pick a city to compare"
            autoComplete="off"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="h-10 w-full rounded-full border border-line bg-bg pl-10 pr-4 text-sm placeholder:text-muted focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/30"
          />
          {suggestions.length > 0 && query.trim().length >= 2 && (
            <ul className="absolute inset-x-0 top-12 z-10 rounded-2xl border border-line bg-surface p-1.5 shadow-xl">
              {suggestions.map((s) => (
                <li key={s.id}>
                  <button
                    type="button"
                    onClick={() => pick(s.label)}
                    className="flex w-full items-center gap-3 rounded-xl px-3 py-2 text-left text-sm hover:bg-subtle"
                  >
                    <MapPin className="h-4 w-4 shrink-0 text-muted" />
                    <span className="truncate">
                      <span className="font-medium">{s.name}</span>
                      {s.detail && <span className="text-muted"> · {s.detail}</span>}
                    </span>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </form>

        {error && <p className="mt-3 text-sm text-red-500">{error}</p>}

        {sharedData && (
          <div className="mt-5 overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left">
                  <th className="w-1/3" />
                  {columns.map((data, i) => (
                    <th key={i} className="w-1/3 pb-3 align-bottom font-medium">
                      {data ? (
                        <span className="flex items-center gap-2">
                          <WeatherIcon icon={data.currentConditions.icon} className="h-5 w-5 shrink-0" />
                          <span className="truncate capitalize">{data.resolvedAddress.split(",")[0]}</span>
                        </span>
                      ) : loading ? (
                        <LoaderCircle className="h-4 w-4 animate-spin text-muted" />
                      ) : (
                        <span className="font-normal text-muted">Pick a city</span>
                      )}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-line">
                {ROWS.map(([label, value]) => (
                  <tr key={label}>
                    <th scope="row" className="py-2.5 text-left font-normal text-muted">
                      {label}
                    </th>
                    {columns.map((data, i) => (
                      <td key={i} className="py-2.5">
                        {data ? value(data, unit, windUnit) : "–"}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </dialog>
  );
};

export default CompareDialog;
