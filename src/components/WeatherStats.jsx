import { useContext } from "react";
import { Droplets, Eye, Gauge, Leaf, Sunrise, Sunset, SunDim, Wind } from "lucide-react";
import dataContext from "./Context/dataContext/dataContext";
import UnitContext from "./Context/unitContext/UnitContext";
import Skeleton from "./Skeleton";
import useNow from "../hooks/useNow";
import {
  aqiLevel,
  compassDirection,
  formatDegrees,
  formatDistance,
  formatEpoch,
  formatSpeed,
  moonPhaseName,
  pressureLabel,
  uvLabel,
  visibilityLabel,
} from "../lib/format";

const Stat = ({ icon: Icon, label, value, detail, children }) => (
  <div className="flex flex-col rounded-xl bg-subtle/60 p-4">
    <div className="flex items-center gap-1.5 text-xs text-muted">
      <Icon className="h-3.5 w-3.5" strokeWidth={2} />
      {label}
    </div>
    <div className="mt-2 text-2xl font-light">{value}</div>
    {detail && <div className="mt-1 flex items-center gap-1.5 truncate text-xs text-muted">{detail}</div>}
    {children && <div className="mt-auto pt-3">{children}</div>}
  </div>
);

// A coloured scale with a marker at `fraction` (0–1); used for UV and AQI.
const Scale = ({ fraction, gradient }) => (
  <div className={`relative h-1.5 rounded-full ${gradient}`}>
    <span
      className="absolute top-1/2 h-3 w-3 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-surface bg-fg shadow"
      style={{ left: `${Math.min(Math.max(fraction, 0), 1) * 100}%` }}
    />
  </div>
);

const Bar = ({ fraction }) => (
  <div className="h-1.5 rounded-full bg-line">
    <div className="h-full rounded-full bg-accent" style={{ width: `${Math.min(Math.max(fraction, 0), 1) * 100}%` }} />
  </div>
);

// Small compass; `degrees` is where the wind comes FROM, so the arrow points where it blows.
const Compass = ({ degrees = 0 }) => (
  <svg viewBox="0 0 40 40" className="h-10 w-10" aria-hidden="true">
    <circle cx="20" cy="20" r="18" className="fill-none stroke-line" strokeWidth="1.5" />
    {["N", "E", "S", "W"].map((d, i) => (
      <text
        key={d}
        x={20 + 13 * Math.sin((i * Math.PI) / 2)}
        y={20 - 13 * Math.cos((i * Math.PI) / 2) + 2.5}
        textAnchor="middle"
        className="fill-muted"
        fontSize="6"
      >
        {d}
      </text>
    ))}
    <g transform={`rotate(${degrees + 180} 20 20)`}>
      <path d="M20 9 L23.5 22 L20 19.5 L16.5 22 Z" className="fill-accent" />
    </g>
  </svg>
);

// Lit portion of the moon for a 0–1 phase (0 new, 0.5 full).
const MoonIcon = ({ phase = 0 }) => {
  const r = 9;
  const k = Math.cos(2 * Math.PI * phase);
  const waxing = phase <= 0.5;
  const sweep = waxing ? (k > 0 ? 0 : 1) : k > 0 ? 1 : 0;
  const lit = `M0 ${-r} A${r} ${r} 0 0 ${waxing ? 1 : 0} 0 ${r} A${Math.abs(k) * r} ${r} 0 0 ${sweep} 0 ${-r}Z`;
  return (
    <svg viewBox="-10 -10 20 20" className="h-5 w-5" aria-hidden="true">
      <circle r={r} className="fill-line" />
      <path d={lit} className="fill-slate-200" />
    </svg>
  );
};

const SunAndMoon = ({ day, timeZone }) => {
  const now = useNow(60_000) / 1000;
  const { sunriseEpoch: sunrise, sunsetEpoch: sunset, moonphase } = day;
  const progress = Math.min(Math.max((now - sunrise) / (sunset - sunrise), 0), 1);
  const angle = Math.PI * (1 - progress);
  const sunX = 100 + 85 * Math.cos(angle);
  const sunY = 92 - 85 * Math.sin(angle);
  const daylight = sunset - sunrise;
  const time = (epoch) => formatEpoch(epoch, timeZone, { hour: "numeric", minute: "2-digit" });

  return (
    <div className="col-span-2 rounded-xl bg-subtle/60 p-4">
      <div className="flex items-center justify-between text-xs text-muted">
        <span>
          Sun · {Math.floor(daylight / 3600)}h {Math.round((daylight % 3600) / 60)}m of daylight
        </span>
        {moonphase != null && (
          <span className="flex items-center gap-1.5" title={`Moon phase ${moonphase}`}>
            <MoonIcon phase={moonphase} />
            {moonPhaseName(moonphase)}
          </span>
        )}
      </div>
      <svg viewBox="0 0 200 100" className="mt-1 h-20 w-full" aria-hidden="true">
        <path d="M15 92 A85 85 0 0 1 185 92" fill="none" className="stroke-line" strokeWidth="2" strokeDasharray="4 4" />
        <path
          d="M15 92 A85 85 0 0 1 185 92"
          fill="none"
          className="stroke-amber-400"
          strokeWidth="2"
          pathLength="100"
          strokeDasharray={`${progress * 100} 100`}
        />
        <circle cx={sunX} cy={sunY} r="9" className="fill-amber-400/20" />
        <circle cx={sunX} cy={sunY} r="5.5" className="fill-amber-400" />
      </svg>
      <div className="flex justify-between text-sm">
        <span className="flex items-center gap-1.5">
          <Sunrise className="h-4 w-4 text-muted" strokeWidth={2} /> {time(sunrise)}
        </span>
        <span className="flex items-center gap-1.5">
          {time(sunset)} <Sunset className="h-4 w-4 text-muted" strokeWidth={2} />
        </span>
      </div>
    </div>
  );
};

const WeatherStats = ({ className = "" }) => {
  const { sharedData, airQuality } = useContext(dataContext);
  const { unit, windUnit } = useContext(UnitContext);

  if (!sharedData) {
    return (
      <section className={`card ${className}`} aria-busy="true">
        <h2 className="card-title">Today&apos;s details</h2>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          {Array.from({ length: 6 }, (_, i) => (
            <Skeleton key={i} className="h-28 rounded-xl" />
          ))}
          <Skeleton className="col-span-2 h-28 rounded-xl" />
        </div>
      </section>
    );
  }

  const current = sharedData.currentConditions;
  const aqi = airQuality?.us_aqi;
  const aqiInfo = aqiLevel(aqi);

  return (
    <section className={`card ${className}`}>
      <h2 className="card-title">Today&apos;s details</h2>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <Stat
          icon={Leaf}
          label="Air quality"
          value={aqi ?? "–"}
          detail={
            <>
              <span className={`h-2 w-2 shrink-0 rounded-full ${aqiInfo.dot}`} />
              <span className="truncate" title={aqiInfo.label}>{aqiInfo.label}</span>
            </>
          }
        >
          {aqi != null && (
            <Scale
              fraction={aqi / 300}
              gradient="bg-gradient-to-r from-emerald-500 via-yellow-400 via-40% to-purple-600"
            />
          )}
        </Stat>
        <Stat
          icon={Droplets}
          label="Humidity"
          value={`${Math.round(current.humidity)}%`}
          detail={`Dew point ${formatDegrees(current.dew, unit)}`}
        >
          <Bar fraction={current.humidity / 100} />
        </Stat>
        <Stat
          icon={Wind}
          label="Wind"
          value={formatSpeed(current.windspeed, windUnit)}
          detail={`${compassDirection(current.winddir)}${current.windgust ? ` · gusts ${formatSpeed(current.windgust, windUnit)}` : ""}`}
        >
          <Compass degrees={current.winddir ?? 0} />
        </Stat>
        <Stat icon={SunDim} label="UV index" value={current.uvindex ?? "–"} detail={uvLabel(current.uvindex)}>
          <Scale
            fraction={(current.uvindex ?? 0) / 11}
            gradient="bg-gradient-to-r from-emerald-500 via-yellow-400 via-50% to-fuchsia-600"
          />
        </Stat>
        <Stat
          icon={Eye}
          label="Visibility"
          value={formatDistance(current.visibility, windUnit)}
          detail={visibilityLabel(current.visibility)}
        />
        <Stat
          icon={Gauge}
          label="Pressure"
          value={`${Math.round(current.pressure)} hPa`}
          detail={pressureLabel(current.pressure)}
        />
        <SunAndMoon day={sharedData.days[0]} timeZone={sharedData.timezone} />
      </div>
    </section>
  );
};

export default WeatherStats;
