import { useContext, useMemo, useState } from "react";
import { Line, Bar } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  Filler,
  Tooltip,
} from "chart.js";
import dataContext from "./Context/dataContext/dataContext";
import ThemeContext from "./Context/themeContext/ThemeContext";
import UnitContext from "./Context/unitContext/UnitContext";
import Skeleton from "./Skeleton";
import { convertTemp, formatEpoch, WIND_UNITS } from "../lib/format";
import { upcomingHours } from "../lib/forecast";

ChartJS.register(CategoryScale, LinearScale, BarElement, LineElement, PointElement, Filler, Tooltip);

// Canvas can't read CSS variables, so mirror the theme tokens from index.css.
const PALETTE = {
  light: { temp: "245, 158, 11", rain: "37, 99, 235", wind: "13, 148, 136", grid: "#e2e8f0", tick: "#64748b", muted: "#94a3b8" },
  dark: { temp: "251, 191, 36", rain: "96, 165, 250", wind: "45, 212, 191", grid: "#27272a", tick: "#a1a1aa", muted: "#52525b" },
};

const TABS = [
  ["temp", "Temperature"],
  ["rain", "Rain"],
  ["wind", "Wind"],
];

// Vertical fade under a line, from the series colour to transparent.
const areaFill = (rgb) => (ctx) => {
  const { chart } = ctx;
  if (!chart.chartArea) return "transparent";
  const gradient = chart.ctx.createLinearGradient(0, chart.chartArea.top, 0, chart.chartArea.bottom);
  gradient.addColorStop(0, `rgba(${rgb}, 0.35)`);
  gradient.addColorStop(1, `rgba(${rgb}, 0)`);
  return gradient;
};

const HourlyTrends = ({ className = "" }) => {
  const { sharedData } = useContext(dataContext);
  const { theme } = useContext(ThemeContext);
  const { unit, windUnit } = useContext(UnitContext);
  const [tab, setTab] = useState("temp");

  const hours = useMemo(() => (sharedData ? upcomingHours(sharedData, 24) : []), [sharedData]);

  if (!sharedData) {
    return (
      <section className={`card ${className}`} aria-busy="true">
        <Skeleton className="mb-4 h-3 w-28" />
        <Skeleton className="h-4 w-64" />
        <Skeleton className="mt-6 h-52 w-full" />
      </section>
    );
  }

  const colors = PALETTE[theme];
  const tz = sharedData.timezone;
  const at = (hour) => formatEpoch(hour.datetimeEpoch, tz, { hour: "numeric" });
  const labels = hours.map((hour, i) => (i === 0 ? "Now" : at(hour)));
  const windFactor = WIND_UNITS[windUnit].factor;
  const peak = (key) => hours.reduce((best, h) => ((h[key] ?? 0) > (best[key] ?? 0) ? h : best), hours[0]);
  const low = (key) => hours.reduce((best, h) => (h[key] < best[key] ? h : best), hours[0]);

  let summary;
  let chart;
  if (tab === "temp") {
    const hi = peak("temp");
    const lo = low("temp");
    summary = `High of ${convertTemp(hi.temp, unit)}° around ${at(hi)}, low of ${convertTemp(lo.temp, unit)}° around ${at(lo)}`;
    chart = (
      <Line
        data={{
          labels,
          datasets: [
            {
              label: "Temperature",
              data: hours.map((h) => convertTemp(h.temp, unit)),
              borderColor: `rgb(${colors.temp})`,
              backgroundColor: areaFill(colors.temp),
              fill: true,
            },
            {
              label: "Feels like",
              data: hours.map((h) => convertTemp(h.feelslike ?? h.temp, unit)),
              borderColor: colors.muted,
              borderDash: [4, 4],
              borderWidth: 1.5,
              fill: false,
            },
          ],
        }}
        options={baseOptions(colors, (v) => `${v}°`)}
      />
    );
  } else if (tab === "rain") {
    const wettest = peak("precipprob");
    const chance = Math.round(wettest.precipprob ?? 0);
    summary =
      chance >= 50
        ? `Rain likely around ${at(wettest)} (${chance}%)`
        : chance >= 20
          ? `Slight chance of rain, peaking at ${chance}%`
          : "Dry for the next 24 hours";
    chart = (
      <Bar
        data={{
          labels,
          datasets: [
            {
              label: "Chance of rain",
              data: hours.map((h) => Math.round(h.precipprob ?? 0)),
              backgroundColor: `rgba(${colors.rain}, 0.85)`,
              borderRadius: 4,
              maxBarThickness: 14,
            },
          ],
        }}
        options={baseOptions(colors, (v) => `${v}%`, { min: 0, max: 100 })}
      />
    );
  } else {
    const windiest = peak("windgust");
    summary = `Strongest gusts around ${at(windiest)}, up to ${Math.round((windiest.windgust ?? windiest.windspeed) * windFactor)} ${WIND_UNITS[windUnit].label}`;
    chart = (
      <Line
        data={{
          labels,
          datasets: [
            {
              label: "Wind",
              data: hours.map((h) => Math.round(h.windspeed * windFactor)),
              borderColor: `rgb(${colors.wind})`,
              backgroundColor: areaFill(colors.wind),
              fill: true,
            },
            {
              label: "Gusts",
              data: hours.map((h) => Math.round((h.windgust ?? h.windspeed) * windFactor)),
              borderColor: colors.muted,
              borderDash: [4, 4],
              borderWidth: 1.5,
              fill: false,
            },
          ],
        }}
        options={baseOptions(colors, (v) => `${v} ${WIND_UNITS[windUnit].label}`, { min: 0 })}
      />
    );
  }

  return (
    <section className={`card ${className}`}>
      <div className="mb-1 flex flex-wrap items-center justify-between gap-3">
        <h2 className="card-title mb-0">Hourly trends</h2>
        <div role="tablist" aria-label="Hourly metric" className="flex rounded-full bg-subtle p-0.5 text-xs">
          {TABS.map(([id, label]) => (
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
      <p className="text-sm">{summary}</p>
      <div className="mt-4 h-56" role="img" aria-label={`${TABS.find(([id]) => id === tab)[1]} over the next 24 hours. ${summary}`}>
        {chart}
      </div>
    </section>
  );
};

function baseOptions(colors, format, y = {}) {
  return {
    responsive: true,
    maintainAspectRatio: false,
    interaction: { mode: "index", intersect: false },
    elements: { line: { tension: 0.4, borderWidth: 2 }, point: { radius: 0, hoverRadius: 4 } },
    plugins: {
      legend: { display: false },
      tooltip: { callbacks: { label: (ctx) => ` ${ctx.dataset.label}: ${format(ctx.parsed.y)}` } },
    },
    scales: {
      x: {
        grid: { display: false },
        border: { display: false },
        ticks: { color: colors.tick, maxRotation: 0, autoSkipPadding: 16, font: { size: 11 } },
      },
      y: {
        ...y,
        grid: { color: colors.grid },
        border: { display: false },
        ticks: { color: colors.tick, maxTicksLimit: 5, callback: format, font: { size: 11 } },
      },
    },
  };
}

export default HourlyTrends;
