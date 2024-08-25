import React, { useState, useEffect, useContext } from "react";
import SearchContext from "./Context/searchContext/SeacrhContext";
import dataContext from "./Context/dataContext/dataContext";

const WeatherComponent = () => {
  const { searchData } = useContext(SearchContext);
  const { setSharedData } = useContext(dataContext);

  const daysOfWeek = [
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday",
    "Sunday",
  ];

  const today = new Date();
  const currentDayIndex = today.getDay();
  const currentDayName =
    currentDayIndex === 0 ? "Sunday" : daysOfWeek[currentDayIndex - 1];
  const [expandedDay, setExpandedDay] = useState(currentDayName.toLowerCase());
  const [weeklyWeather, setWeeklyWeather] = useState([]);
  const [unit, setUnit] = useState('C'); 
  
  const now = new Date();
  const hours = now.getHours();
  const minutes = now.getMinutes();
  const time = `${hours}:${minutes < 10 ? "0" + minutes : minutes}`;

  const apiKey = "AW7QXUPGD57CQWZABYK2EQR4P";
  const url = `https://weather.visualcrossing.com/VisualCrossingWebServices/rest/services/timeline/${searchData}?include=fcst%2Cobs%2Chistfcst%2Cstats%2Cdays%2Chours%2Ccurrent%2Calerts&key=${apiKey}&options=beta&contentType=json`;

  useEffect(() => {
    if (!searchData) {
      return;
    }

    const fetchWeatherData = async () => {
      try {
        const res = await fetch(url);
        if (!res.ok) {
          throw new Error("Failed to fetch weather data");
        }

        const data = await res.json();
        const weeklyData = data.days.slice(0, 7).map((day) => ({
          name: new Date(day.datetime).toLocaleDateString("en-US", {
            weekday: "long",
          }),
          tempF: day.temp,
          tempC: (day.temp - 32) * 5 / 9, 
          wind: day.windspeed,
          pressure: day.pressure,
          humidity: day.humidity,
          sunrise: new Date(day.sunriseEpoch * 1000).toLocaleTimeString(),
          sunset: new Date(day.sunsetEpoch * 1000).toLocaleTimeString(),
          weatherIcon: day.icon
            ? `https://raw.githubusercontent.com/basmilius/weather-icons/dev/design/line/final/${day.icon}.svg`
            : "error",
        }));

        const reorderedData = daysOfWeek.map((day) =>
          weeklyData.find((d) => d.name === day)
        );

        setWeeklyWeather(reorderedData);
        setSharedData(data);
      } catch (error) {
        console.error("Error fetching weather data:", error);
      }
    };

    fetchWeatherData();
  }, [searchData, url, setSharedData]);

  const handleToggleUnit = (e) => {
    e.stopPropagation(); // Prevent click event from affecting expanded day
    setUnit(unit === 'C' ? 'F' : 'C');
  };

  if (!weeklyWeather.length) {
    return <p>{searchData ? "Loading..." : "Please enter a city name"}</p>;
  }

  return (
    <div className="flex gap-4 flex-wrap justify-center px-2 bg-black rounded-lg shadow-lg">
      {weeklyWeather.map((day, index) => (
        <div
          key={index}
          id={day.name.toLowerCase()}
          className={`flex flex-col items-center justify-between p-4 text-white bg-gray-800 rounded-xl transition-transform duration-500 ease-in-out transform ${
            expandedDay === day.name.toLowerCase()
              ? "w-60 h-72 p-2 scale-90 opacity-100"
              : "w-24 h-72 scale-75 opacity-75"
          } hover:scale-100`}
          onClick={() =>
            setExpandedDay(
              expandedDay === day.name.toLowerCase()
                ? null
                : day.name.toLowerCase()
            )
          }
        >
          {expandedDay === day.name.toLowerCase() ? (
            <>
              <div className="bg-gray-900 text-gray-100 rounded-lg shadow-lg p-4 max-w-xs mx-auto backdrop-blur-md bg-opacity-60 sm:max-w-md lg:max-w-lg">
                <div className="flex flex-col sm:flex-row sm:justify-between items-start sm:items-center border-b border-gray-700 pb-4">
                  <h1 className="text-xl font-semibold">{day.name}</h1>
                  <h1 className="text-md font-light">{time}</h1>
                </div>
                <div className="flex flex-col items-center justify-between w-full gap-2">
                  <div className="flex items-center w-full gap-2 justify-between">
                    <h1
                      className="text-3xl font-extrabold text-teal-400 cursor-pointer"
                      onClick={handleToggleUnit} // Toggle unit on click
                    >
                      {unit === 'C' ? `${day.tempC.toFixed(1)}°C` : `${day.tempF.toFixed(1)}°F`}
                    </h1>
                    <img
                      className="h-20 w-20 transition-transform duration-300 transform hover:scale-110 rounded-lg shadow-md"
                      src={day.weatherIcon}
                      alt="Weather Icon"
                    />
                  </div>
                  <div className="flex flex-col sm:flex-row justify-between gap-4 w-full">
                    <div className="text-sm space-y-2 sm:space-y-3">
                      <h3>
                        Wind: <span className="font-light">{day.wind} km/h</span>
                      </h3>
                      <h3>
                        Pressure: <span className="font-light">{day.pressure} hPa</span>
                      </h3>
                      <h3>
                        Humidity: <span className="font-light">{day.humidity}%</span>
                      </h3>
                    </div>
                    <div className="text-sm pt-[53px] space-y-2 sm:space-y-3">
                      <h3>
                        Sunset: <span className="font-light">{day.sunset}</span>
                      </h3>
                      <h3>
                        Sunrise: <span className="font-light">{day.sunrise}</span>
                      </h3>
                    </div>
                  </div>
                </div>
              </div>
            </>
          ) : (
            <>
              <div className="mb-2">
                <h1 className="text-lg font-semibold">{day.name.slice(0, 3)}</h1>
              </div>
              <div className="mb-2">
                <img
                  className="h-16 w-16 transition-transform duration-300 transform hover:scale-110"
                  src={day.weatherIcon}
                  alt="Weather Icon"
                />
              </div>
              <div className="text-lg font-bold">
                {unit === 'C' ? `${day.tempC.toFixed(1)}°C` : `${day.tempF.toFixed(1)}°F`}
              </div>
            </>
          )}
        </div>
      ))}
    </div>
  );
};

export default WeatherComponent;
