import React from "react";
import Card from "./WeatherComponent";
import Map from "./Map";
import RainProbabilityChart from "./RainProbabilityChart";
import SmallCard from "./SmallCard";

function Dasboard() {
  return (
    <div className="text-white flex gap-2 px-4 py-4">
      <div className="w-[70%] bg-black rounded-3xl px-2 pt-2">
        <Card />
        <Map />
      </div>
      <div className="bg-black w-[30%] flex flex-col ">
        <RainProbabilityChart />
        <SmallCard />
      </div>
    </div>
  );
}

export default Dasboard;
