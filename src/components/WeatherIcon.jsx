import {
  Cloud,
  CloudFog,
  CloudLightning,
  CloudMoon,
  CloudRain,
  CloudSnow,
  CloudSun,
  Moon,
  Sun,
  Wind,
} from "lucide-react";

// Maps Visual Crossing's icon ids to bundled icons, each with its own tint.
const ICONS = {
  "clear-day": { Icon: Sun, color: "text-amber-500" },
  "clear-night": { Icon: Moon, color: "text-indigo-300" },
  "partly-cloudy-day": { Icon: CloudSun, color: "text-amber-500" },
  "partly-cloudy-night": { Icon: CloudMoon, color: "text-indigo-300" },
  cloudy: { Icon: Cloud, color: "text-slate-400" },
  rain: { Icon: CloudRain, color: "text-sky-500" },
  "showers-day": { Icon: CloudRain, color: "text-sky-500" },
  "showers-night": { Icon: CloudRain, color: "text-sky-500" },
  "thunder-rain": { Icon: CloudLightning, color: "text-violet-400" },
  "thunder-showers-day": { Icon: CloudLightning, color: "text-violet-400" },
  "thunder-showers-night": { Icon: CloudLightning, color: "text-violet-400" },
  snow: { Icon: CloudSnow, color: "text-sky-300" },
  "snow-showers-day": { Icon: CloudSnow, color: "text-sky-300" },
  "snow-showers-night": { Icon: CloudSnow, color: "text-sky-300" },
  fog: { Icon: CloudFog, color: "text-slate-400" },
  wind: { Icon: Wind, color: "text-teal-400" },
};

const WeatherIcon = ({ icon, label, className = "h-6 w-6" }) => {
  const { Icon, color } = ICONS[icon] ?? ICONS.cloudy;
  return (
    <Icon
      className={`${color} ${className}`}
      strokeWidth={1.5}
      role="img"
      aria-label={label ?? icon}
    />
  );
};

export default WeatherIcon;
