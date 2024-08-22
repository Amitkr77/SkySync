import React, { useState } from "react";
import dataContext from "./dataContext";

const dataProvider = ({ children }) => {
  const [sharedData, setSharedData] = useState('');

  return (
    <dataContext.Provider value={{ sharedData, setSharedData }}>
      {children}
    </dataContext.Provider>
  );
};

export default dataProvider;
