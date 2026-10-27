import { useCallback, useContext, useRef, useState } from "react";
import { Monitor, Moon, Settings2, Sun } from "lucide-react";
import UnitContext from "./Context/unitContext/UnitContext";
import ThemeContext from "./Context/themeContext/ThemeContext";
import useDismiss from "../hooks/useDismiss";
import { WIND_UNITS } from "../lib/format";

const Segmented = ({ label, options, value, onChange }) => (
  <div>
    <p className="mb-1.5 text-xs text-muted">{label}</p>
    <div
      role="radiogroup"
      aria-label={label}
      className="grid gap-0.5 rounded-xl bg-subtle p-0.5 text-xs"
      style={{ gridTemplateColumns: `repeat(${options.length}, minmax(0, 1fr))` }}
    >
      {options.map(({ id, text, Icon }) => (
        <button
          key={id}
          type="button"
          role="radio"
          aria-checked={value === id}
          onClick={() => onChange(id)}
          className={`flex items-center justify-center gap-1 rounded-[10px] px-2 py-1.5 transition-colors ${
            value === id ? "bg-surface font-medium text-fg shadow-sm" : "text-muted hover:text-fg"
          }`}
        >
          {Icon && <Icon className="h-3.5 w-3.5" />}
          {text}
        </button>
      ))}
    </div>
  </div>
);

const SettingsMenu = () => {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);
  const { unit, setUnit, windUnit, setWindUnit } = useContext(UnitContext);
  const { preference, setPreference } = useContext(ThemeContext);
  const close = useCallback(() => setOpen(false), []);
  useDismiss(ref, open, close);

  return (
    <div className="relative" ref={ref}>
      <button
        type="button"
        className="icon-btn"
        aria-label="Settings"
        aria-expanded={open}
        onClick={() => setOpen((o) => !o)}
      >
        <Settings2 className="h-4 w-4" />
      </button>
      {open && (
        <div className="absolute right-0 top-12 w-72 animate-pop space-y-4 rounded-2xl border border-line bg-surface p-4 shadow-xl">
          <Segmented
            label="Temperature"
            value={unit}
            onChange={setUnit}
            options={[
              { id: "C", text: "°C" },
              { id: "F", text: "°F" },
            ]}
          />
          <Segmented
            label="Wind speed"
            value={windUnit}
            onChange={setWindUnit}
            options={Object.entries(WIND_UNITS).map(([id, { label }]) => ({ id, text: label }))}
          />
          <Segmented
            label="Appearance"
            value={preference}
            onChange={setPreference}
            options={[
              { id: "system", text: "Auto", Icon: Monitor },
              { id: "light", text: "Light", Icon: Sun },
              { id: "dark", text: "Dark", Icon: Moon },
            ]}
          />
          <p className="border-t border-line pt-3 text-xs text-muted">
            Press <kbd className="rounded border border-line bg-subtle px-1.5 py-0.5 font-sans">/</kbd> anywhere to search
          </p>
        </div>
      )}
    </div>
  );
};

export default SettingsMenu;
