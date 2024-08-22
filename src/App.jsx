import React from "react";
import SearchProvider from "./components/Context/searchContext/SearchProvider";
import DataProvider from "./components/Context/dataContext/dataProvider";
import Dashboard from "./components/Dasboard";
import Navbar from "./components/Navbar";

function App() {
  return (
    <DataProvider>
      <SearchProvider>
        <div className="bg-black mx-10 mt-[5px] rounded-3xl">
          <Navbar />
          <Dashboard />
        </div>
      </SearchProvider>
    </DataProvider>
  );
}

export default App;
