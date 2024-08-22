import React, { useRef } from "react";
import map from "../assets/map.jpg";
import WeatherMap from "./WeatherMap";

function Map() {
  const btnRef = useRef(null);

  const handleBtn = () => {
    if (btnRef.current) {
      btnRef.current.style.display = "none";
    }
  };

  return (
    <div className="mt-2">
      <div className="pb-4">
        <h2 className="text-xl">Global Map</h2>
      </div>
      <div className="relative">
        <WeatherMap />
        <div
          ref={btnRef}
          id="btn"
          className="absolute bottom-6 left-10 z-[9999] bg-transparent border-x text-white w-[200px] h-48 rounded-2xl p-4 flex flex-col items-center shadow-lg backdrop-blur-md bg-opacity-60"
        >
          <p className="text-center text-sm font-medium mb-3">
            Explore the global map of wind, weather, and ocean conditions.
          </p>
          <img
            src={map}
            alt="Map"
            className="rounded-xl h-16 w-full object-cover mb-5"
          />
          <button onClick={handleBtn} className="w-full py-2 bg-blue-500 text-white rounded-full text-sm font-semibold transition-transform transform hover:scale-105 active:scale-95">
            Get Started
          </button>
        </div>
      </div>
    </div>
  );
}

export default Map;
