import { useEffect, useState } from "react";
import UnitContext from "./UnitContext";
import { readJSON, writeJSON } from "../../../lib/storage";
import { WIND_UNITS } from "../../../lib/format";

const UNIT_KEY = "skysync-unit";
const WIND_KEY = "skysync-wind";

// Stored as a plain "C"/"F" string.
const readUnit = () => {
  try {
    return localStorage.getItem(UNIT_KEY)?.replace(/"/g, "") === "F" ? "F" : "C";
  } catch {
    return "C";
  }
};

const UnitProvider = ({ children }) => {
  const [unit, setUnit] = useState(readUnit);
  // Wind defaults to the temperature unit's system until the user picks one.
  const [windUnit, setWindUnit] = useState(() => {
    const stored = readJSON(WIND_KEY, null);
    return WIND_UNITS[stored] ? stored : readUnit() === "F" ? "mph" : "kmh";
  });

  useEffect(() => {
    try {
      localStorage.setItem(UNIT_KEY, unit);
    } catch {
      // Storage unavailable (private mode etc.) — the preference just won't persist.
    }
  }, [unit]);

  useEffect(() => writeJSON(WIND_KEY, windUnit), [windUnit]);

  const toggleUnit = () => setUnit((u) => (u === "C" ? "F" : "C"));

  return (
    <UnitContext.Provider value={{ unit, setUnit, toggleUnit, windUnit, setWindUnit }}>
      {children}
    </UnitContext.Provider>
  );
};

export default UnitProvider;
