import { useEffect, useState } from "react";
import ThemeContext from "./ThemeContext";

const STORAGE_KEY = "skysync-theme";
const darkQuery = () => window.matchMedia("(prefers-color-scheme: dark)");

const readPreference = () => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored === "light" || stored === "dark" ? stored : "system";
  } catch {
    return "system";
  }
};

// `preference` is what the user picked (system/light/dark); `theme` is what's applied.
const ThemeProvider = ({ children }) => {
  const [preference, setPreference] = useState(readPreference);
  const [systemDark, setSystemDark] = useState(() => darkQuery().matches);
  const theme = preference === "system" ? (systemDark ? "dark" : "light") : preference;

  useEffect(() => {
    const query = darkQuery();
    const onChange = (e) => setSystemDark(e.matches);
    query.addEventListener("change", onChange);
    return () => query.removeEventListener("change", onChange);
  }, []);

  useEffect(() => {
    document.documentElement.classList.toggle("dark", theme === "dark");
    try {
      localStorage.setItem(STORAGE_KEY, preference);
    } catch {
      // Storage unavailable — the preference just won't persist.
    }
  }, [theme, preference]);

  return (
    <ThemeContext.Provider value={{ theme, preference, setPreference }}>
      {children}
    </ThemeContext.Provider>
  );
};

export default ThemeProvider;
