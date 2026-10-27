import SearchProvider from "./components/Context/searchContext/SearchProvider";
import DataProvider from "./components/Context/dataContext/dataProvider";
import UnitProvider from "./components/Context/unitContext/UnitProvider";
import ThemeProvider from "./components/Context/themeContext/ThemeProvider";
import FavoritesProvider from "./components/Context/favoritesContext/FavoritesProvider";
import ToastProvider from "./components/Context/toastContext/ToastProvider";
import Dashboard from "./components/Dashboard";
import Navbar from "./components/Navbar";

function App() {
  return (
    <ThemeProvider>
      <UnitProvider>
        <ToastProvider>
          <FavoritesProvider>
            <SearchProvider>
              <DataProvider>
                <div className="min-h-screen">
                  <Navbar />
                  <Dashboard />
                </div>
              </DataProvider>
            </SearchProvider>
          </FavoritesProvider>
        </ToastProvider>
      </UnitProvider>
    </ThemeProvider>
  );
}

export default App;
