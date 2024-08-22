# SkySync

## Overview

SkySync is a React-based weather application that provides users with real-time weather data, rain probability charts, and an interactive global map. The application integrates with weather APIs to deliver accurate and up-to-date weather information, allowing users to stay informed about the conditions in their favorite cities and around the world.

## Features

- **Current Weather Information**: View up-to-date weather conditions for any city.
- **Rain Probability Chart**: Visualize the likelihood of rain throughout the day with a detailed chart.
- **Interactive Map**: Explore global weather conditions with an interactive map; click on locations to get detailed weather data.
- **Top Cities Weather**: Check the weather for a selection of major cities worldwide.

## Technologies Used

- **React**: A JavaScript library for building user interfaces.
- **Chart.js**: For rendering rain probability charts.
- **Leaflet**: For creating an interactive map.
- **Visual Crossing Weather API**: Provides comprehensive weather data and forecasts.

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

   The application uses the Visual Crossing Weather API. Obtain an API key from [Visual Crossing](https://www.visualcrossing.com/weather-api) and replace the placeholder API key in the code:

   ```javascript
   const apiKey = 'YOUR_API_KEY_HERE';
   ```

5. **Start the Development Server**

   ```bash
   npm start
   ```

   The application will be available at [http://localhost:3000](http://localhost:3000).

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

