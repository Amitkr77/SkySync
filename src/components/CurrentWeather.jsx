import { useContext, useState } from "react";
import {
  ArrowLeftRight,
  Check,
  CircleCheck,
  CloudFog,
  Factory,
  MapPin,
  RotateCw,
  Share2,
  Snowflake,
  Star,
  SunDim,
  Thermometer,
  Umbrella,
  Wind,
} from "lucide-react";
import dataContext from "./Context/dataContext/dataContext";
import UnitContext from "./Context/unitContext/UnitContext";
import FavoritesContext from "./Context/favoritesContext/FavoritesContext";
import WeatherIcon from "./WeatherIcon";
import HourlyForecast from "./HourlyForecast";
import CompareDialog from "./CompareDialog";
import Skeleton from "./Skeleton";
import useNow from "../hooks/useNow";
import { convertTemp, formatDegrees, formatRelative } from "../lib/format";
import { getInsights } from "../lib/insights";
import { conditionTint } from "../lib/forecast";
import ToastContext from "./Context/toastContext/ToastContext";

const INSIGHT_ICONS = {
  rain: Umbrella,
  uv: SunDim,
  heat: Thermometer,
  cold: Snowflake,
  wind: Wind,
  aqi: Factory,
  fog: CloudFog,
  good: CircleCheck,
};

const ActionButton = ({ label, onClick, children, pressed }) => (
  <button
    type="button"
    aria-label={label}
    title={label}
    aria-pressed={pressed}
    onClick={onClick}
    className="rounded-full p-2 text-muted transition-colors hover:bg-subtle hover:text-fg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
  >
    {children}
  </button>
);

const CurrentWeather = ({ className = "" }) => {
  const { sharedData, airQuality, loading, refresh } = useContext(dataContext);
  const { unit, windUnit } = useContext(UnitContext);
  const { isFavorite, toggleFavorite } = useContext(FavoritesContext);
  const { notify } = useContext(ToastContext);
  const [compareOpen, setCompareOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const now = useNow();

  if (!sharedData) {
    return (
      <section className={`card ${className}`} aria-busy="true">
        <Skeleton className="h-5 w-40" />
        <Skeleton className="mt-2 h-4 w-56" />
        <div className="mt-8 flex items-center justify-between">
          <Skeleton className="h-24 w-44" />
          <Skeleton className="h-24 w-24 rounded-full" />
        </div>
        <Skeleton className="mt-10 h-24 w-full" />
      </section>
    );
  }

  const current = sharedData.currentConditions;
  const today = sharedData.days[0];
  const place = sharedData.resolvedAddress;
  const favorite = isFavorite(place);
  const insights = getInsights(sharedData, airQuality, { unit, windUnit });
  const shortPlace = place.split(",")[0];

  const toggleSaved = () => {
    toggleFavorite(place);
    notify(favorite ? `Removed ${shortPlace} from saved` : `Saved ${shortPlace}`, {
      action: "Undo",
      onAction: () => toggleFavorite(place),
    });
  };
  const localDateTime = new Intl.DateTimeFormat("en-US", {
    timeZone: sharedData.timezone,
    weekday: "long",
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  }).format(now);

  const share = async () => {
    const url = window.location.href;
    if (navigator.share) {
      try {
        await navigator.share({ title: `Weather in ${place}`, url });
      } catch {
        // User closed the share sheet.
      }
      return;
    }
    try {
      await navigator.clipboard.writeText(url);
      notify("Link copied to clipboard");
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      window.prompt("Copy this link:", url);
    }
  };

  return (
    <section
      className={`card relative isolate flex flex-col overflow-hidden transition-opacity ${loading ? "opacity-70" : ""} ${className}`}
      aria-busy={loading}
    >
      {/* Weather-tinted wash behind the content */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 -z-10 transition-[background] duration-700"
        style={{
          background: `radial-gradient(90% 70% at 100% 0%, ${conditionTint(current.icon, 0.3)}, transparent 70%)`,
        }}
      />
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <h1 className="flex items-center gap-1.5 text-lg font-medium capitalize">
            <MapPin className="h-4 w-4 shrink-0 text-muted" strokeWidth={2} />
            <span className="truncate">{place}</span>
          </h1>
          <p className="mt-1 text-sm text-muted">{localDateTime}</p>
          {sharedData._fetchedAt && (
            <p className={`mt-0.5 text-xs ${sharedData._stale ? "text-amber-500" : "text-muted"}`}>
              {sharedData._stale ? "Offline · saved " : "Updated "}
              {formatRelative(sharedData._fetchedAt, now)}
            </p>
          )}
        </div>
        <div className="-mr-2 -mt-1 flex shrink-0 items-center">
          <ActionButton
            label={favorite ? "Remove from saved cities" : "Save city"}
            pressed={favorite}
            onClick={toggleSaved}
          >
            <Star className={`h-4 w-4 ${favorite ? "fill-amber-400 text-amber-400" : ""}`} />
          </ActionButton>
          <ActionButton label={copied ? "Link copied" : "Share"} onClick={share}>
            {copied ? <Check className="h-4 w-4 text-emerald-500" /> : <Share2 className="h-4 w-4" />}
          </ActionButton>
          <ActionButton label="Compare with another city" onClick={() => setCompareOpen(true)}>
            <ArrowLeftRight className="h-4 w-4" />
          </ActionButton>
          <ActionButton label="Refresh" onClick={refresh}>
            <RotateCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
          </ActionButton>
        </div>
      </div>

      <div className="mt-6 flex items-center justify-between gap-6">
        <div>
          <p className="text-7xl font-light tracking-tighter sm:text-8xl">
            {convertTemp(current.temp, unit)}
            <span className="ml-1 align-top text-3xl font-normal text-muted">°{unit}</span>
          </p>
          <p className="mt-2 text-base font-medium">{current.conditions}</p>
          <p className="mt-1 text-sm text-muted">
            Feels like {formatDegrees(current.feelslike, unit)} · H{" "}
            {formatDegrees(today.tempmax, unit)} · L {formatDegrees(today.tempmin, unit)}
          </p>
        </div>
        <WeatherIcon
          icon={current.icon}
          label={current.conditions}
          className="h-24 w-24 shrink-0 sm:h-32 sm:w-32"
        />
      </div>

      {today.description && <p className="mt-6 text-sm text-muted">{today.description}</p>}

      <ul className="mt-4 flex flex-wrap gap-2" aria-label="Weather tips">
        {insights.map(({ type, text }) => {
          const Icon = INSIGHT_ICONS[type];
          return (
            <li
              key={type}
              className="inline-flex items-center gap-1.5 rounded-full border border-line bg-subtle/60 px-3 py-1.5 text-xs"
            >
              <Icon className="h-3.5 w-3.5 text-accent" strokeWidth={2} />
              {text}
            </li>
          );
        })}
      </ul>

      <HourlyForecast className="mt-6 border-t border-line pt-5" />

      <CompareDialog open={compareOpen} onClose={() => setCompareOpen(false)} />
    </section>
  );
};

export default CurrentWeather;
