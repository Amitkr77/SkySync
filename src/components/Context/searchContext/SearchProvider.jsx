import React, { useState } from "react";
import SearchContext from "./SeacrhContext";

const SearchProvider = ({children})=>{
    const [searchData,setSearchData] = useState("patna");

    return(
        <SearchContext.Provider value={{searchData,setSearchData}}>
            {children}
        </SearchContext.Provider>
    )
}

export default SearchProvider;