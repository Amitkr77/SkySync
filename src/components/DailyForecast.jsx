import { useContext, useEffect, useState } from "react";
import { ChevronDown } from "lucide-react";
import dataContext from "./Context/dataContext/dataContext";
import UnitContext from "./Context/unitContext/UnitContext";
import WeatherIcon from "./WeatherIcon";
import Skeleton from "./Skeleton";
import { formatDegrees, formatEpoch, formatSpeed, uvLabel } from "../lib/format";

const Detail = ({ label, value }) => (
  <div>
    <dt className="text-muted">{label}</dt>
    <dd className="mt-0.5 font-medium">{value}</dd>
  </div>
);

const DailyForecast = ({ className = "" }) => {
  const { sharedData } = useContext(dataContext);
  const { unit, windUnit } = useContext(UnitContext);
  const [openDay, setOpenDay] = useState(null);

  // Collapse when switching cities.
  useEffect(() => setOpenDay(null), [sharedData?.resolvedAddress]);

  if (!sharedData) {
    return (
      <section className={`card ${className}`} aria-busy="true">
        <h2 className="card-title">7-day forecast</h2>
        {Array.from({ length: 7 }, (_, i) => (
          <Skeleton key={i} className="my-4 h-6 w-full" />
        ))}
      </section>
    );
  }

  const tz = sharedData.timezone;
  const days = sharedData.days.slice(0, 7);
  // Every row's bar is drawn on the same scale so the week is comparable at a glance.
  const weekMin = Math.min(...days.map((d) => d.tempmin));
  const weekMax = Math.max(...days.map((d) => d.tempmax));
  const range = weekMax - weekMin || 1;
  const time = (epoch) => formatEpoch(epoch, tz, { hour: "numeric", minute: "2-digit" });

  return (
    <section className={`card flex flex-col ${className}`}>
      <h2 className="card-title">7-day forecast</h2>
      <ul className="-mx-2 flex flex-1 flex-col justify-between">
        {days.map((day, index) => {
          const left = ((day.tempmin - weekMin) / range) * 100;
          const width = Math.max(((day.tempmax - day.tempmin) / range) * 100, 4);
          const open = openDay === day.datetime;
          return (
            <li key={day.datetime} className={index > 0 ? "border-t border-line" : ""}>
              <button
                type="button"
                aria-expanded={open}
                onClick={() => setOpenDay(open ? null : day.datetime)}
                className="group grid w-full grid-cols-[2.75rem_1.5rem_2.25rem_2rem_1fr_2rem_0.75rem] items-center gap-2 rounded-xl px-2 py-3 text-left text-sm transition-colors hover:bg-subtle focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
              >
                <span className="font-medium">
                  {index === 0 ? "Today" : formatEpoch(day.datetimeEpoch, tz, { weekday: "short" })}
                </span>
                <WeatherIcon icon={day.icon} label={day.conditions} className="h-5 w-5" />
                <span className="text-xs text-accent">
                  {day.precipprob >= 20 ? `${Math.round(day.precipprob)}%` : ""}
                </span>
                <span className="text-right text-muted">{formatDegrees(day.tempmin, unit)}</span>
                <div className="relative h-1.5 rounded-full bg-subtle group-hover:bg-line">
                  <div
                    className="absolute inset-y-0 rounded-full bg-gradient-to-r from-sky-400 to-amber-400"
                    style={{ left: `${left}%`, width: `${width}%` }}
                  />
                </div>
                <span className="text-right font-medium">{formatDegrees(day.tempmax, unit)}</span>
                <ChevronDown
                  className={`h-3 w-3 text-muted transition-transform ${open ? "rotate-180" : "opacity-0 group-hover:opacity-100"}`}
                />
              </button>
              {open && (
                <div className="mx-2 mb-3 animate-pop rounded-xl bg-subtle/60 p-3 text-xs">
                  <p className="mb-3 text-sm">{day.description || day.conditions}</p>
                  <dl className="grid grid-cols-3 gap-x-3 gap-y-3">
                    <Detail
                      label="Rain"
                      value={`${Math.round(day.precipprob ?? 0)}%${day.precip ? ` · ${day.precip} mm` : ""}`}
                    />
                    <Detail label="Wind" value={formatSpeed(day.windspeed, windUnit)} />
                    <Detail label="Humidity" value={`${Math.round(day.humidity)}%`} />
                    <Detail label="UV index" value={`${day.uvindex ?? "–"} ${uvLabel(day.uvindex)}`} />
                    <Detail label="Sunrise" value={time(day.sunriseEpoch)} />
                    <Detail label="Sunset" value={time(day.sunsetEpoch)} />
                  </dl>
                </div>
              )}
            </li>
          );
        })}
      </ul>
    </section>
  );
};

export default DailyForecast;
