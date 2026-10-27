import { useCallback, useContext, useEffect, useRef, useState } from "react";
import dataContext from "./dataContext";
import SearchContext from "../searchContext/SearchContext";
import { fetchWeather } from "../../../lib/weatherApi";
import { fetchAirQuality } from "../../../lib/geo";

const AUTO_REFRESH_MS = 15 * 60 * 1000;

const DataProvider = ({ children }) => {
  const { searchData } = useContext(SearchContext);
  const [sharedData, setSharedData] = useState(null);
  const [airQuality, setAirQuality] = useState(null);
  const [loading, setLoading] = useState(Boolean(searchData));
  const [error, setError] = useState(null);
  const [refreshToken, setRefreshToken] = useState(0);
  const forceRef = useRef(false);
  const dataRef = useRef(null);
  dataRef.current = sharedData;

  // Bypass the cache and fetch again.
  const refresh = useCallback(() => {
    forceRef.current = true;
    setRefreshToken((t) => t + 1);
  }, []);

  useEffect(() => {
    if (!searchData) return;

    // Abort the previous request so a slow, stale response can't overwrite a newer one.
    const controller = new AbortController();
    setLoading(true);
    setError(null);

    fetchWeather(searchData, { signal: controller.signal, force: forceRef.current })
      .then((data) => {
        forceRef.current = false;
        setSharedData(data);
      })
      .catch((err) => {
        if (err.name !== "AbortError") setError(err.message);
      })
      .finally(() => {
        if (!controller.signal.aborted) setLoading(false);
      });

    return () => controller.abort();
  }, [searchData, refreshToken]);

  // Refresh when the data is old: on a timer, and when the tab becomes visible again.
  useEffect(() => {
    const refreshIfOld = () => {
      const fetchedAt = dataRef.current?._fetchedAt;
      if (document.visibilityState === "visible" && fetchedAt && Date.now() - fetchedAt > AUTO_REFRESH_MS) {
        refresh();
      }
    };
    const id = setInterval(refreshIfOld, 60_000);
    document.addEventListener("visibilitychange", refreshIfOld);
    return () => {
      clearInterval(id);
      document.removeEventListener("visibilitychange", refreshIfOld);
    };
  }, [refresh]);

  const latitude = sharedData?.latitude;
  const longitude = sharedData?.longitude;
  useEffect(() => {
    if (latitude == null || longitude == null) return;
    const controller = new AbortController();
    fetchAirQuality(latitude, longitude, controller.signal)
      .then(setAirQuality)
      .catch((err) => {
        if (err.name !== "AbortError") setAirQuality(null);
      });
    return () => controller.abort();
  }, [latitude, longitude, refreshToken]);

  return (
    <dataContext.Provider value={{ sharedData, airQuality, loading, error, refresh }}>
      {children}
    </dataContext.Provider>
  );
};

export default DataProvider;
