import React, { useState, useEffect, useRef } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Tooltip, useMapEvents } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';


import markerIconPng from 'leaflet/dist/images/marker-icon.png';
import markerShadowPng from 'leaflet/dist/images/marker-shadow.png';

const apiKey = 'AW7QXUPGD57CQWZABYK2EQR4P'; 

// Custom marker icon
const customIcon = new L.Icon({
  iconUrl: markerIconPng,
  shadowUrl: markerShadowPng,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

const WeatherMap = () => {
  const [city, setCity] = useState(null); // State for the single city marker
  const [mapCenter, setMapCenter] = useState([25.6093, 85.1376]); // Initial map center for Patna
  const mapRef = useRef(null);

  const fetchWeatherData = async (latitude, longitude) => {
    try {
      const response = await fetch(
        `https://weather.visualcrossing.com/VisualCrossingWebServices/rest/services/timeline/${latitude},${longitude}?include=current&key=${apiKey}&contentType=json`
      );
      const data = await response.json();
      console.log('Fetched data:', data);
      return {
        name: data.address,
        latitude: data.latitude,
        longitude: data.longitude,
        ...data.currentConditions,
      };
    } catch (error) {
      console.error('Error fetching weather data:', error);
      return null;
    }
  };

  const MapEvents = () => {
    useMapEvents({
      click: async (e) => {
        const { lat, lng } = e.latlng;
        console.log('Map clicked at:', lat, lng);
        const newCity = await fetchWeatherData(lat, lng);
        if (newCity) {
          setCity(newCity); // Set the new city marker and remove the old one
        }
      },
    });
    return null;
  };

  useEffect(() => {
    // Function to handle geolocation
    const handleGeolocation = () => {
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          (position) => {
            setMapCenter([position.coords.latitude, position.coords.longitude]);
          },
          () => {
            // On error (e.g., permission denied), fallback to Patna
            console.warn('Geolocation access denied, using Patna as default.');
            setMapCenter([25.6093, 85.1376]);
          }
        );
      } else {
        // Geolocation not supported, fallback to Patna
        console.warn('Geolocation not supported, using Patna as default.');
        setMapCenter([25.6093, 85.1376]);
      }
    };

    handleGeolocation();
  }, []);

  useEffect(() => {
    // Initial data fetch for the current city
    const initialFetch = async () => {
      const initialCity = await fetchWeatherData(mapCenter[0], mapCenter[1]);
      if (initialCity) {
        setCity(initialCity);
      }
    };

    initialFetch();
  }, [mapCenter]);

  return (
    <div className="relative">
      <MapContainer center={mapCenter} zoom={5} scrollWheelZoom={true} style={{ height: '300px' }} ref={mapRef}>
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url='https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png' // Dark theme URL
        />
        {city && (
          <Marker
            position={[city.latitude, city.longitude]}
            icon={customIcon}
            eventHandlers={{
              click: (e) => {
                console.log(`Marker clicked: ${city.name}`);
                e.target.openPopup();
              },
            }}
          >
            <Popup>
              <div>
                <h2>{city.name}</h2>
                <p>Conditions: {city.conditions}</p>
                <p>Temperature: {city.temp}°C</p>
                <p>Feels Like: {city.feelslike}°C</p>
                <p>Wind Speed: {city.windspeed} km/h</p>
                <p>Humidity: {city.humidity}%</p>
              </div>
            </Popup>
            <Tooltip>{city.name}</Tooltip>
          </Marker>
        )}
        <MapEvents />
      </MapContainer>
    </div>
  );
};

export default WeatherMap;
