# SkySync

## Overview

SkySync is a React-based weather application that provides users with real-time weather data, rain probability charts, and an interactive global map. The application integrates with weather APIs to deliver accurate and up-to-date weather information, allowing users to stay informed about the conditions in their favorite cities and around the world.

## Features

- **Current conditions**: Temperature, feels-like, high/low and a live local clock in the city's own timezone.
- **Smart tips**: Plain-language advice for the next 12 hours (umbrella, sunscreen, heat, wind, air quality).
- **Forecasts**: Next-24-hours strip, an hourly trends chart (temperature, rain, wind), and a 7-day forecast whose days expand for details.
- **Today's details**: Air quality and UV scales, humidity, a wind compass, visibility, pressure, a sunrise/sunset arc and the moon phase.
- **Search**: City autocomplete, recent searches, "use my location", and a `/` keyboard shortcut.
- **Saved cities**: Star a city to keep its current weather one tap away, alongside a list of popular cities.
- **Compare**: Put two cities side by side.
- **Interactive map**:
  - Drop up to 5 pins to check any spot; remove one from its popup or by right-clicking it, or clear them all (with Undo).
  - Street, satellite and terrain base maps; an animated rain-radar overlay with a timeline; saved cities on the map.
  - Fullscreen, recenter on the searched city, and pin your own location.
- **Weather alerts**: Active alerts appear as a banner.
- **Preferences**: °C/°F, wind in km/h, mph, m/s or knots, and Auto/Light/Dark appearance, remembered between visits.
- **Shareable links**: The URL always reflects the city (`?city=London`); share or copy it from the main card.
- **Offline & installable**: Installable as an app (PWA). Recent forecasts are cached and shown when you're offline, and data refreshes automatically every 15 minutes.

## Technologies Used

- **React** + **Vite**, styled with **Tailwind CSS** and **lucide-react** icons.
- **Chart.js**: For the chance-of-rain chart.
- **Leaflet** with **OpenStreetMap** tiles and **RainViewer** radar.
- **Visual Crossing Weather API**: Forecasts, current conditions and alerts (needs an API key).
- **Open-Meteo**: City search and air quality (no key needed).
- **Nominatim (OpenStreetMap)**: Place names for "use my location" and map clicks (no key needed).

## Demo

Experience SkySync live at [https://skysyncapp.netlify.app/](https://skysyncapp.netlify.app/).

## Setup and Installation

1. **Clone the Repository**

   ```bash
   git clone https://github.com/yourusername/skysync.git
   ```

2. **Navigate to the Project Directory**

   ```bash
   cd skysync
   ```

3. **Install Dependencies**

   Ensure you have `Node.js` and `npm` installed. Install the project dependencies by running:

   ```bash
   npm install
   ```

4. **Set Up API Keys**

   The application uses the Visual Crossing Weather API. Obtain an API key from [Visual Crossing](https://www.visualcrossing.com/weather-api) then copy `.env.example` to `.env` and add your key:

   ```bash
   cp .env.example .env
   # then edit .env:
   WEATHER_API_KEY=your_api_key_here
   ```

   `.env` is git-ignored — never commit your key.

5. **Start the Development Server**

   ```bash
   npm run dev
   ```

   The application will be available at [http://localhost:5173](http://localhost:5173).

## Usage

1. **Search for Weather**

   Use the search bar in the navbar to enter a city name. Press Enter or click the search button to retrieve weather information for that city.

2. **Explore the Map**

   Click on the interactive map to view weather conditions for different global locations. The map allows you to explore various places and see real-time weather data.

3. **View Rain Probability**

   Check the rain probability chart for a visual representation of the chances of rain throughout the day.

4. **Top Cities Weather**

   View weather conditions for major cities around the world in the top cities section.

## Components

- **Dashboard**: Main layout containing weather cards, the map, rain probability chart, and small card components.
- **Map**: Interactive map utilizing Leaflet for global weather exploration.
- **RainProbabilityChart**: Displays a bar chart of rain probability using Chart.js.
- **SmallCard**: Shows current weather conditions for a specific city.
- **WeatherComponent**: Provides detailed weather information and a weekly forecast for the selected city.
- **Navbar**: Includes the search bar, weather alerts button, and profile information.

## Contributing

Contributions are welcome! Please fork the repository and submit a pull request with your changes. Make sure your code adheres to the project’s coding standards and includes appropriate tests.

## License

This project is licensed under the [MIT License](LICENSE).

## Contact

For any questions or feedback, please contact:

- **Email**: Amitroyk99@gmail.com
- **GitHub**: [Amitkr77](https://github.com/Amitkr77)

