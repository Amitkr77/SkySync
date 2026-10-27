import { useContext, useMemo } from "react";
import { Droplet } from "lucide-react";
import dataContext from "./Context/dataContext/dataContext";
import UnitContext from "./Context/unitContext/UnitContext";
import WeatherIcon from "./WeatherIcon";
import { formatDegrees, formatEpoch } from "../lib/format";
import { upcomingHours } from "../lib/forecast";

const HourlyForecast = ({ className = "" }) => {
  const { sharedData } = useContext(dataContext);
  const { unit } = useContext(UnitContext);

  // The "Now" slot shows live conditions so it matches the big temperature above.
  const hours = useMemo(() => {
    const upcoming = upcomingHours(sharedData, 24);
    const current = sharedData.currentConditions;
    if (upcoming.length && current) {
      upcoming[0] = { ...upcoming[0], temp: current.temp, icon: current.icon, conditions: current.conditions };
    }
    return upcoming;
  }, [sharedData]);

  return (
    <div className={className}>
      <h2 className="card-title">Next 24 hours</h2>
      <ol className="-mx-2 flex gap-1 overflow-x-auto pb-2 scrollbar-thin">
        {hours.map((hour, index) => (
          <li
            key={hour.datetimeEpoch}
            className={`flex min-w-[3.75rem] flex-col items-center gap-2 rounded-xl px-2 py-3 transition-colors ${
              index === 0 ? "bg-accent/10 ring-1 ring-inset ring-accent/20" : "hover:bg-subtle"
            }`}
          >
            <span className={`text-xs ${index === 0 ? "font-medium text-accent" : "text-muted"}`}>
              {index === 0 ? "Now" : formatEpoch(hour.datetimeEpoch, sharedData.timezone, { hour: "numeric" })}
            </span>
            <WeatherIcon icon={hour.icon} label={hour.conditions} className="h-6 w-6" />
            <span className="text-sm font-medium">{formatDegrees(hour.temp, unit)}</span>
            <span
              className={`flex items-center gap-0.5 text-[11px] ${hour.precipprob >= 20 ? "text-accent" : "invisible"}`}
              aria-label={`${Math.round(hour.precipprob)}% chance of rain`}
            >
              <Droplet className="h-2.5 w-2.5" />
              {Math.round(hour.precipprob)}%
            </span>
          </li>
        ))}
      </ol>
    </div>
  );
};

export default HourlyForecast;
