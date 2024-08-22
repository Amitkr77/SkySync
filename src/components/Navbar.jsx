import React, { useContext, useState } from "react";
import profile from "../assets/profile.png";
import SearchContext from "./Context/searchContext/SeacrhContext";
import dataContext from "./Context/dataContext/dataContext";

function Navbar() {
  const [searchTerm, setSearchTerm] = useState("");
  const [showProfileCard, setShowProfileCard] = useState(false);
  const { setSearchData } = useContext(SearchContext);
  const { sharedData } = useContext(dataContext);

  const handleSearchChange = (event) => {
    setSearchTerm(event.target.value);
  };

  const handleSearchSubmit = () => {
    setSearchData(searchTerm);
  };

  const handleAlerts = (sharedData) => {
    if (sharedData.alerts && sharedData.alerts.length > 0) {
      const alertMessage = sharedData.alerts
        .map((alert) => `${alert.headline}: ${alert.description}`)
        .join("\n");

      alert(`Weather Alert!\n${alertMessage}`);
    } else {
      alert("No active alerts.");
    }
  };

  const toggleProfileCard = () => {
    setShowProfileCard(!showProfileCard);
  };

  return (
    <nav className="flex flex-col md:flex-row items-center justify-between px-4 py-4">
      <div className="flex items-center gap-6 mb-4 md:mb-0">
        <div className="space-x-4">
          <button className="border rounded-full p-2" onClick={handleAlerts}>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              height="24px"
              viewBox="0 -960 960 960"
              width="24px"
              fill="#e8eaed"
            >
              <path d="M160-200v-80h80v-280q0-83 50-147.5T420-792v-28q0-25 17.5-42.5T480-880q25 0 42.5 17.5T540-820v28q80 20 130 84.5T720-560v280h80v80H160Zm320-300Zm0 420q-33 0-56.5-23.5T400-160h160q0 33-23.5 56.5T480-80ZM320-280h320v-280q0-66-47-113t-113-47q-66 0-113 47t-47 113v280Z" />
            </svg>
          </button>
        </div>
        <div className="flex text-white items-center capitalize text-xl">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            height="30px"
            viewBox="0 -960 960 960"
            width="34px"
            fill="#FFFFFF"
          >
            <path d="M480-480q33 0 56.5-23.5T560-560q0-33-23.5-56.5T480-640q-33 0-56.5 23.5T400-560q0 33 23.5 56.5T480-480Zm0 294q122-112 181-203.5T720-552q0-109-69.5-178.5T480-800q-101 0-170.5 69.5T240-552q0 71 59 162.5T480-186Zm0 106Q319-217 239.5-334.5T160-552q0-150 96.5-239T480-880q127 0 223.5 89T800-552q0 100-79.5 217.5T480-80Zm0-480Z" />
          </svg>
          {sharedData.resolvedAddress}
        </div>
      </div>
      <div className="search-btn relative mb-4 md:mb-0">
        <input
          className="outline-none bg-transparent border  text-white rounded-full pl-10 pr-2 py-1 w-full md:w-[504px] placeholder:text-[#efefefc6]"
          type="search"
          required
          placeholder="Search city..."
          value={searchTerm}
          onChange={handleSearchChange}
          onKeyDown={(event) => {
            if (event.key === "Enter") {
              handleSearchSubmit();
              setSearchTerm("");
            }
          }}
        />
        <svg
          className="absolute top-1/2 transform -translate-y-1/2 left-3"
          xmlns="http://www.w3.org/2000/svg"
          height="20px"
          viewBox="0 -960 960 960"
          width="20px"
          fill="#FFFFFF"
        >
          <path d="M784-120 532-372q-30 24-69 38t-83 14q-109 0-184.5-75.5T120-580q0-109 75.5-184.5T380-840q109 0 184.5 75.5T640-580q0 44-14 83t-38 69l252 252-56 56ZM380-400q75 0 127.5-52.5T560-580q0-75-52.5-127.5T380-760q-75 0-127.5 52.5T200-580q0 75 52.5 127.5T380-400Z" />
        </svg>
      </div>

      <div className="relative">
        <img
          src={profile}
          alt="profile image"
          className="h-10 w-10 rounded-full cursor-pointer border-2 border-gray-300 transition-transform transform hover:scale-110 hover:border-black"
          onClick={toggleProfileCard}
        />
        {showProfileCard && (
          <div className="absolute top-16 right-0  text-gray-100 p-6 rounded-xl shadow-lg w-64 max-w-xs backdrop-blur-sm border">
            <div className="flex items-center space-x-4 mb-4">
              <img
                src={profile}
                alt="profile image"
                className="h-20 w-20 rounded-full border-2 border-gray-200 shadow-md"
              />
              <div>
                <h2 className="text-xl font-semibold mb-1">Amit kumar</h2>
                <p className="text-sm text-gray-100">Patna</p>
              </div>
            </div>
            <div className="flex justify-center mt-4">
              <button className="bg-blue-500 text-white py-2 px-4 rounded-full shadow-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-400 transition-transform transform hover:scale-105">
                <a href="https://github.com/Amitkr77">View profile</a>
              </button>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}

export default Navbar;
