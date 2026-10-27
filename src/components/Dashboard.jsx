import { lazy, Suspense, useContext } from "react";
import { CloudOff, TriangleAlert } from "lucide-react";
import CurrentWeather from "./CurrentWeather";
import DailyForecast from "./DailyForecast";
import WeatherStats from "./WeatherStats";
import TopCities from "./TopCities";
import Skeleton from "./Skeleton";
import AlertsBanner from "./AlertsBanner";
import dataContext from "./Context/dataContext/dataContext";
import { formatRelative } from "../lib/format";
import { conditionTint } from "../lib/forecast";

// Chart.js and Leaflet are the heaviest dependencies; load them after the first paint.
const HourlyTrends = lazy(() => import("./HourlyTrends"));
const WeatherMap = lazy(() => import("./WeatherMap"));

const CardFallback = ({ className, height }) => (
  <section className={`card ${className}`} aria-busy="true">
    <Skeleton className="mb-4 h-3 w-24" />
    <Skeleton className={`w-full ${height}`} />
  </section>
);

function Dashboard() {
  const { sharedData, loading, error } = useContext(dataContext);
  // Skeletons only while something is actually loading; a failed first load gets an empty state.
  const showForecast = sharedData || loading;

  return (
    <main className="relative mx-auto max-w-7xl px-4 py-6 sm:px-6">
      {/* Soft page glow that follows the current conditions. */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 -top-20 -z-10 h-[28rem] blur-3xl transition-[background] duration-1000"
        style={{
          background: `radial-gradient(50% 60% at 30% 30%, ${conditionTint(sharedData?.currentConditions?.icon)}, transparent)`,
        }}
      />

      {error && (
        <div
          role="alert"
          className="mb-4 flex animate-pop items-center gap-3 rounded-2xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm"
        >
          <TriangleAlert className="h-4 w-4 shrink-0 text-red-500" strokeWidth={2} />
          {error}
        </div>
      )}
      {sharedData?._stale && (
        <div
          role="status"
          className="mb-4 flex items-center gap-3 rounded-2xl border border-line bg-surface px-4 py-3 text-sm"
        >
          <CloudOff className="h-4 w-4 shrink-0 text-muted" strokeWidth={2} />
          Couldn&apos;t reach the weather service — showing saved data from{" "}
          {formatRelative(sharedData._fetchedAt)}.
        </div>
      )}
      <AlertsBanner />

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-12">
        {showForecast ? (
          <>
            {/* Cards rise in one after another on first load. */}
            <CurrentWeather className="animate-rise lg:col-span-8" />
            <DailyForecast className="animate-rise [animation-delay:60ms] lg:col-span-4" />
            <Suspense fallback={<CardFallback className="lg:col-span-12" height="h-56" />}>
              <HourlyTrends className="animate-rise [animation-delay:120ms] lg:col-span-12" />
            </Suspense>
            <WeatherStats className="animate-rise [animation-delay:180ms] lg:col-span-8" />
          </>
        ) : (
          <section className="card flex flex-col items-center py-16 text-center lg:col-span-8">
            <CloudOff className="h-10 w-10 text-muted" strokeWidth={1.5} />
            <p className="mt-4 font-medium">No forecast to show</p>
            <p className="mt-1 text-sm text-muted">Search for a city above to see its weather.</p>
          </section>
        )}
        <TopCities className="animate-rise [animation-delay:240ms] lg:col-span-4" />
        <Suspense fallback={<CardFallback className="lg:col-span-12" height="h-[440px]" />}>
          <WeatherMap className="animate-rise [animation-delay:300ms] lg:col-span-12" />
        </Suspense>
      </div>

      <footer className="mt-10 text-center text-xs text-muted">
        Weather data by{" "}
        <a href="https://www.visualcrossing.com/" target="_blank" rel="noopener noreferrer" className="underline-offset-2 hover:underline">
          Visual Crossing
        </a>
      </footer>
    </main>
  );
}

export default Dashboard;
