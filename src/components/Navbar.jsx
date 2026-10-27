import { useCallback, useContext, useRef, useState } from "react";
import { CloudSun } from "lucide-react";
import profile from "../assets/profile.png";
import UnitContext from "./Context/unitContext/UnitContext";
import SearchBox from "./SearchBox";
import SettingsMenu from "./SettingsMenu";
import useDismiss from "../hooks/useDismiss";

function Navbar() {
  const [showProfileCard, setShowProfileCard] = useState(false);
  const profileRef = useRef(null);
  const { unit, toggleUnit } = useContext(UnitContext);
  const closeProfile = useCallback(() => setShowProfileCard(false), []);
  useDismiss(profileRef, showProfileCard, closeProfile);

  return (
    <header className="sticky top-0 z-[1100] border-b border-line bg-bg/80 backdrop-blur-md">
      <div className="mx-auto flex max-w-7xl flex-wrap items-center gap-3 px-4 py-3 sm:px-6">
        <a href="/" className="flex items-center gap-2 text-base font-semibold tracking-tight">
          <CloudSun className="h-6 w-6 text-accent" strokeWidth={1.75} />
          SkySync
        </a>

        <SearchBox className="order-last w-full sm:order-none sm:ml-6 sm:w-auto sm:max-w-md sm:flex-1" />

        <div className="ml-auto flex items-center gap-2">
          <button
            type="button"
            className="icon-btn font-medium"
            aria-label={`Switch to °${unit === "C" ? "F" : "C"}`}
            onClick={toggleUnit}
          >
            °{unit}
          </button>
          <SettingsMenu />

          <div className="relative" ref={profileRef}>
            <button
              type="button"
              aria-label="Profile"
              aria-expanded={showProfileCard}
              onClick={() => setShowProfileCard((open) => !open)}
              className="block rounded-full focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
            >
              <img src={profile} alt="" className="h-9 w-9 rounded-full border border-line object-cover" />
            </button>
            {showProfileCard && (
              <div className="absolute right-0 top-12 w-64 animate-pop rounded-2xl border border-line bg-surface p-5 shadow-xl">
                <div className="flex items-center gap-3">
                  <img src={profile} alt="" className="h-12 w-12 rounded-full object-cover" />
                  <div>
                    <p className="font-medium">Amit Kumar</p>
                    <p className="text-sm text-muted">Patna</p>
                  </div>
                </div>
                <a
                  href="https://github.com/Amitkr77"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-4 block rounded-full bg-accent py-2 text-center text-sm font-medium text-white transition-opacity hover:opacity-90 dark:text-zinc-950"
                >
                  View profile
                </a>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}

export default Navbar;
