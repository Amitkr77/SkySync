import React, { useContext, useEffect, useState } from "react";
import { Bar } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";
import dataContext from "./Context/dataContext/dataContext";

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

const WeatherChart = () => {
  const { sharedData } = useContext(dataContext);
  const [chartData, setChartData] = useState([]);

  const transformData = (data) => {
    const hours = data.days[0].hours.map((hour) => ({
      time: new Date(hour.datetimeEpoch).toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
        hour12: true,
      }),
      rainProbability: hour.precipprob,
    }));
    return hours;
  };

  useEffect(() => {
    if (sharedData) {
      const transformedData = transformData(sharedData);
      setChartData(transformedData);
    }
  }, [sharedData]);

  if (!sharedData) {
    return <div className="text-white">Loading...</div>;
  }

  if (!chartData || chartData.length === 0) {
    return <div className="text-white">No data available</div>;
  }

  const labels = chartData.map((item) => item.time);
  const data = {
    labels: labels,
    datasets: [
      {
        label: "Rain Probability (%)",
        data: chartData.map((item) => item.rainProbability),
        backgroundColor: "rgba(54, 162, 235, 0.6)",
      },
    ],
  };

  return (
    <div className="bg-black px-4 rounded-lg h-[315px]">
      <h1 className="pb-12 font-medium text-xl pt-2">Chances for rain</h1>
      <Bar
        data={data}
        options={{
          responsive: true,
          plugins: {
            legend: {
              position: "top",
            },
            title: {
              display: true,
              text: "Rain Probability for the Day",
            },
          },
          scales: {
            x: {
              title: {
                display: true,
                text: "Time",
              },
            },
            y: {
              title: {
                display: true,
                text: "Probability (%)",
              },
              beginAtZero: true,
            },
          },
        }}
      />
    </div>
  );
};

export default WeatherChart;
