import React, { useContext, useEffect, useState } from "react";
import dataContext from "./Context/dataContext/dataContext";

const SmallCard = ({
  city,
  country,
  weatherCondition,
  weatherIcon,
  temperature,
}) => {
  return (
    <div className="bg-gray-800 text-white p-2 h-24  rounded-lg mb-10 shadow-lg ">
      <div className="bg-gray-900 text-gray-100 rounded-lg shadow-lg backdrop-blur-md bg-opacity-60 transition-transform duration-300 ease-in-out transform hover:scale-105 ">
        <div className="flex items-center justify-between p-2">
          <div>
            <h3 className="font-light text-sm">{country}</h3>
            <h3 className="text-lg font-semibold text-teal-400">{city}</h3>
            <p className="mt-1 text-xs">{weatherCondition}</p>
          </div>
          <div className="flex flex-col items-center">
            <img
              src={`https://raw.githubusercontent.com/basmilius/weather-icons/dev/design/line/final/${weatherIcon}.svg`}
              alt={weatherCondition}
              className="h-16 w-16 mb-1 transition-transform duration-300 ease-in-out transform hover:scale-110"
            />
            <p className="text-lg font-bold">{temperature}°C</p>
          </div>
        </div>
      </div>
    </div>
  );
};

const WeatherList = () => {
  const { sharedData } = useContext(dataContext);
  const [weatherData, setWeatherData] = useState([]);

  const cities = [
    { city: "patna", country: "India" },
    { city: "mumbai", country: "India" },
    { city: "new york", country: "USA" },
    { city: "london", country: "UK" },
    { city: "tokyo", country: "Japan" },
    { city: "sydney", country: "Australia" },
    { city: "cairo", country: "Egypt" },
    { city: "paris", country: "France" },
    { city: "berlin", country: "Germany" },
    { city: "toronto", country: "Canada" },
  ];

  useEffect(() => {
    if (sharedData) {
      const currentWeather = sharedData.days[0].hours[0];
      const weatherInfo = cities.map((c) => {
        return {
          city: c.city.charAt(0).toUpperCase() + c.city.slice(1),
          country: c.country,
          weatherCondition: currentWeather.conditions,
          weatherIcon: currentWeather.icon || "",
          temperature: currentWeather.temp,
        };
      });
      setWeatherData(weatherInfo);
    }
  }, [sharedData]);

  if (!sharedData) {
    return <div className="text-white">Loading...</div>;
  }

  return (
    <div className="px-2">
      <h2 className="text-white text-2xl text-left mb-4">Top Cities Weather</h2>
      <div className=" overflow-y-scroll h-80 scrollbar-thin scrollbar-track-gray-700 p-4 scrollbar-thumb-green-500">
        {weatherData.map((data, index) => (
          <SmallCard key={index} {...data} />
        ))}
      </div>
    </div>
  );
};

export default WeatherList;
