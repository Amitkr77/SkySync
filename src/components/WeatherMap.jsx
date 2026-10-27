import { useCallback, useContext, useEffect, useRef, useState } from 'react';
import { MapContainer, Marker, Popup, TileLayer, useMap, useMapEvents } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import {
  Crosshair,
  Layers,
  LoaderCircle,
  LocateFixed,
  Maximize2,
  Minimize2,
  Pause,
  Play,
  Star,
  Trash2,
} from 'lucide-react';
import dataContext from './Context/dataContext/dataContext';
import UnitContext from './Context/unitContext/UnitContext';
import SearchContext from './Context/searchContext/SearchContext';
import FavoritesContext from './Context/favoritesContext/FavoritesContext';
import ToastContext from './Context/toastContext/ToastContext';
import usePlacesWeather from '../hooks/usePlacesWeather';
import { fetchWeather } from '../lib/weatherApi';
import { reverseGeocode } from '../lib/geo';
import { formatDegrees, formatSpeed, formatTemp } from '../lib/format';

const DEFAULT_CENTER = [25.6093, 85.1376]; // Patna
const MAX_PINS = 5;
const OSM = '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors';

// All keyless. Streets and terrain are inverted for dark mode; satellite photos are not.
const BASEMAPS = {
  streets: { label: 'Map', url: 'https://tile.openstreetmap.org/{z}/{x}/{y}.png', attribution: OSM, invert: true },
  satellite: {
    label: 'Satellite',
    url: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
    attribution: 'Imagery &copy; Esri',
    invert: false,
  },
  terrain: {
    label: 'Terrain',
    url: 'https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png',
    attribution: `${OSM}, &copy; <a href="https://opentopomap.org">OpenTopoMap</a>`,
    maxZoom: 17,
    invert: true,
  },
};

const escapeHtml = (text = '') =>
  String(text).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]);

// Markers are small temperature pills (styled in index.css as .map-pill). Icons are cached
// by content so re-renders (e.g. every radar frame) hand Leaflet the same object and
// markers aren't redrawn.
const iconCache = new Map();
const pillIcon = (label, variant, caption = '') => {
  const key = `${variant}|${label}|${caption}`;
  if (!iconCache.has(key)) {
    iconCache.set(
      key,
      L.divIcon({
        className: '',
        iconSize: [0, 0],
        popupAnchor: [0, -34],
        html: `<div class="map-pill map-pill--${variant}">${escapeHtml(label)}${
          caption ? `<small>${escapeHtml(caption)}</small>` : ''
        }</div>`,
      })
    );
  }
  return iconCache.get(key);
};

const shortName = (name = '') => name.split(',')[0];

// ---------- map behaviours (must live inside MapContainer) ----------

const MapClicks = ({ onPick }) => {
  useMapEvents({ click: (e) => onPick(e.latlng.lat, e.latlng.lng) });
  return null;
};

// MapContainer's `center` only applies on mount, so follow the searched city explicitly.
const FollowCity = ({ lat, lng }) => {
  const map = useMap();
  useEffect(() => {
    if (lat != null && lng != null) map.setView([lat, lng], Math.max(map.getZoom(), 5));
  }, [map, lat, lng]);
  return null;
};

// Wheel-zoom only once the map has been clicked, so the page still scrolls past it.
const ScrollZoomOnFocus = () => {
  const map = useMap();
  useEffect(() => {
    const enable = () => map.scrollWheelZoom.enable();
    const disable = () => map.scrollWheelZoom.disable();
    map.on('focus', enable);
    map.on('blur', disable);
    return () => {
      map.off('focus', enable);
      map.off('blur', disable);
    };
  }, [map]);
  return null;
};

// ---------- radar ----------

// Recent RainViewer radar frames (keyless; free tiles stop at zoom 7 and are upscaled beyond).
const useRadarFrames = (enabled) => {
  const [frames, setFrames] = useState([]);
  useEffect(() => {
    if (!enabled) return;
    const controller = new AbortController();
    fetch('https://api.rainviewer.com/public/weather-maps.json', { signal: controller.signal })
      .then((res) => res.json())
      .then(({ host, radar }) =>
        setFrames(
          (radar?.past ?? []).slice(-8).map((f) => ({ time: f.time, url: `${host}${f.path}/256/{z}/{x}/{y}/2/1_1.png` }))
        )
      )
      .catch((error) => {
        if (error.name !== 'AbortError') console.error('Radar unavailable:', error);
      });
    return () => controller.abort();
  }, [enabled]);
  return frames;
};

const RadarPlayer = ({ frames, index, setIndex, playing, setPlaying }) => {
  const frame = frames[index];
  if (!frame) return null;
  const minutesAgo = Math.max(0, Math.round((Date.now() / 1000 - frame.time) / 60));
  return (
    <div className="absolute bottom-3 left-3 z-[1000] w-64 rounded-2xl border border-line bg-surface/90 p-3 shadow-lg backdrop-blur">
      <div className="flex items-center gap-2">
        <button
          type="button"
          aria-label={playing ? 'Pause radar' : 'Play radar'}
          onClick={() => setPlaying((p) => !p)}
          className="grid h-7 w-7 place-items-center rounded-full bg-accent text-white dark:text-zinc-950"
        >
          {playing ? <Pause className="h-3.5 w-3.5" /> : <Play className="h-3.5 w-3.5" />}
        </button>
        <div className="text-xs leading-tight">
          <p className="font-medium">
            {new Date(frame.time * 1000).toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })}
          </p>
          <p className="text-muted">{minutesAgo ? `${minutesAgo} min ago` : 'Latest'}</p>
        </div>
      </div>
      <input
        type="range"
        aria-label="Radar time"
        min={0}
        max={frames.length - 1}
        value={index}
        onChange={(e) => {
          setPlaying(false);
          setIndex(Number(e.target.value));
        }}
        className="mt-2 w-full accent-[rgb(var(--accent))]"
      />
      <div className="mt-1 flex items-center gap-2 text-[10px] text-muted">
        Light
        <span className="h-1.5 flex-1 rounded-full bg-gradient-to-r from-sky-300 via-yellow-300 via-60% to-fuchsia-600" />
        Heavy
      </div>
    </div>
  );
};

// ---------- popups ----------

const PlaceDetails = ({ name, current, loading, unit, windUnit }) => (
  <div className="min-w-[11rem]">
    <p className="pr-4 font-semibold capitalize">{name}</p>
    {loading ? (
      <p className="mt-1 flex items-center gap-1.5 text-muted">
        <LoaderCircle className="h-3.5 w-3.5 animate-spin" /> Loading weather…
      </p>
    ) : current ? (
      <div className="mt-1 space-y-0.5 text-muted">
        <p>
          <span className="font-medium text-fg">{formatTemp(current.temp, unit)}</span> · {current.conditions}
        </p>
        <p>Feels like {formatTemp(current.feelslike, unit)}</p>
        <p>
          Wind {formatSpeed(current.windspeed, windUnit)} · Humidity {Math.round(current.humidity)}%
        </p>
      </div>
    ) : (
      <p className="mt-1 text-muted">Weather unavailable for this spot.</p>
    )}
  </div>
);

const PopupActions = ({ children }) => (
  <div className="mt-3 flex flex-wrap gap-1.5 border-t border-line pt-3">{children}</div>
);

const PopupButton = ({ onClick, children, tone = 'default' }) => (
  <button
    type="button"
    onClick={onClick}
    className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-medium transition-colors ${
      tone === 'primary'
        ? 'bg-accent text-white hover:opacity-90 dark:text-zinc-950'
        : tone === 'danger'
          ? 'text-red-500 hover:bg-red-500/10'
          : 'text-fg hover:bg-subtle'
    }`}
  >
    {children}
  </button>
);

// ---------- toolbar ----------

const ToolButton = ({ label, onClick, active, children, badge }) => (
  <button
    type="button"
    aria-label={label}
    title={label}
    aria-pressed={active}
    onClick={onClick}
    className={`relative grid h-9 w-9 place-items-center rounded-xl border shadow-sm backdrop-blur transition-colors ${
      active ? 'border-accent bg-accent text-white dark:text-zinc-950' : 'border-line bg-surface/90 text-fg hover:bg-subtle'
    }`}
  >
    {children}
    {badge ? (
      <span className="absolute -right-1 -top-1 grid h-4 min-w-4 place-items-center rounded-full bg-red-500 px-1 text-[10px] font-semibold text-white">
        {badge}
      </span>
    ) : null}
  </button>
);

const Switch = ({ label, checked, onChange }) => (
  <label className="flex cursor-pointer items-center justify-between gap-4 rounded-lg px-2 py-1.5 text-sm hover:bg-subtle">
    {label}
    <input type="checkbox" className="peer sr-only" checked={checked} onChange={(e) => onChange(e.target.checked)} />
    <span className="relative h-5 w-9 rounded-full bg-line transition-colors after:absolute after:left-0.5 after:top-0.5 after:h-4 after:w-4 after:rounded-full after:bg-white after:shadow after:transition-transform peer-checked:bg-accent peer-checked:after:translate-x-4 peer-focus-visible:ring-2 peer-focus-visible:ring-accent" />
  </label>
);

// ---------- main ----------

const WeatherMap = ({ className = '' }) => {
  const { sharedData } = useContext(dataContext);
  const { unit, windUnit } = useContext(UnitContext);
  const { setSearchData } = useContext(SearchContext);
  const { favorites, isFavorite, toggleFavorite } = useContext(FavoritesContext);
  const { notify } = useContext(ToastContext);

  const [map, setMap] = useState(null);
  const [pins, setPins] = useState([]);
  const [basemap, setBasemap] = useState('streets');
  const [showRadar, setShowRadar] = useState(false);
  const [showSaved, setShowSaved] = useState(false);
  const [layersOpen, setLayersOpen] = useState(false);
  const [fullscreen, setFullscreen] = useState(false);
  const [locating, setLocating] = useState(false);
  const [frameIndex, setFrameIndex] = useState(0);
  const [playing, setPlaying] = useState(true);
  const nextPinId = useRef(0);

  const frames = useRadarFrames(showRadar);
  const savedWeather = usePlacesWeather(favorites, showSaved);
  const base = BASEMAPS[basemap];

  // Start on the latest radar frame, then loop through them while playing.
  useEffect(() => setFrameIndex(Math.max(frames.length - 1, 0)), [frames]);
  useEffect(() => {
    if (!showRadar || !playing || frames.length < 2) return;
    const id = setInterval(() => setFrameIndex((i) => (i + 1) % frames.length), 700);
    return () => clearInterval(id);
  }, [showRadar, playing, frames.length]);

  // Fullscreen: lock page scroll, let Escape exit, and tell Leaflet its size changed.
  useEffect(() => {
    if (!map) return;
    const id = setTimeout(() => map.invalidateSize(), 50);
    if (!fullscreen) return () => clearTimeout(id);
    document.body.style.overflow = 'hidden';
    const onKey = (e) => e.key === 'Escape' && setFullscreen(false);
    document.addEventListener('keydown', onKey);
    return () => {
      clearTimeout(id);
      document.body.style.overflow = '';
      document.removeEventListener('keydown', onKey);
    };
  }, [fullscreen, map]);

  const addPin = useCallback(
    async (lat, lng, knownName) => {
      const id = ++nextPinId.current;
      setPins((list) => [...list, { id, lat, lng, name: knownName ?? 'Dropped pin', loading: true }].slice(-MAX_PINS));
      try {
        const [data, placeName] = await Promise.all([
          fetchWeather(`${lat.toFixed(4)},${lng.toFixed(4)}`, { period: 'today', include: 'current' }),
          knownName ? Promise.resolve(knownName) : reverseGeocode(lat, lng).catch(() => null),
        ]);
        setPins((list) =>
          list.map((p) =>
            p.id === id ? { ...p, loading: false, current: data.currentConditions, name: placeName ?? data.resolvedAddress } : p
          )
        );
      } catch (error) {
        console.error('Error fetching weather data:', error);
        setPins((list) => list.map((p) => (p.id === id ? { ...p, loading: false } : p)));
      }
    },
    []
  );

  const removePin = (pin) => {
    map?.closePopup();
    setPins((list) => list.filter((p) => p.id !== pin.id));
    notify(`Removed ${shortName(pin.name)}`, {
      action: 'Undo',
      onAction: () => setPins((list) => [...list, pin].slice(-MAX_PINS)),
    });
  };

  const clearPins = () => {
    const removed = pins;
    map?.closePopup();
    setPins([]);
    notify(`Cleared ${removed.length} pin${removed.length > 1 ? 's' : ''}`, {
      action: 'Undo',
      onAction: () => setPins(removed),
    });
  };

  const locate = () => {
    if (!navigator.geolocation) return notify("Location isn't supported in this browser");
    setLocating(true);
    navigator.geolocation.getCurrentPosition(
      ({ coords }) => {
        setLocating(false);
        map?.flyTo([coords.latitude, coords.longitude], Math.max(map.getZoom(), 9));
        addPin(coords.latitude, coords.longitude);
      },
      (err) => {
        setLocating(false);
        notify(err.code === err.PERMISSION_DENIED ? 'Location permission was denied' : "Couldn't get your location");
      },
      { timeout: 10_000, maximumAge: 10 * 60_000 }
    );
  };

  const openForecast = (name) => {
    setFullscreen(false);
    setSearchData(name);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const saveToggle = (name) => {
    const wasSaved = isFavorite(name);
    toggleFavorite(name);
    notify(wasSaved ? `Removed ${shortName(name)} from saved` : `Saved ${shortName(name)}`);
  };

  const mainCity = sharedData
    ? {
        name: sharedData.resolvedAddress,
        lat: sharedData.latitude,
        lng: sharedData.longitude,
        current: sharedData.currentConditions,
      }
    : null;

  const mainIcon = mainCity && pillIcon(formatDegrees(mainCity.current?.temp, unit), 'main', shortName(mainCity.name));

  const savedMarkers = showSaved && savedWeather
    ? favorites
        .map((name, i) => ({ name, data: savedWeather[i] }))
        .filter(({ name, data }) => data && name.toLowerCase() !== mainCity?.name.toLowerCase())
    : [];

  return (
    <section className={`card ${className}`}>
      <div className="mb-4 flex flex-wrap items-center justify-between gap-x-4 gap-y-1">
        <h2 className="card-title mb-0">Map</h2>
        <p className="text-xs text-muted">
          Click to drop a pin · right-click a pin to remove it
          {pins.length > 0 && ` · ${pins.length}/${MAX_PINS} pins`}
        </p>
      </div>

      {/* The wrapper owns the size (MapContainer ignores style changes after mount).
          `isolate` keeps Leaflet's z-indexes below the sticky header. */}
      <div
        className={
          fullscreen
            ? 'fixed inset-0 z-[1200] isolate bg-bg'
            : 'relative isolate h-[440px] overflow-hidden rounded-xl'
        }
      >
        <MapContainer ref={setMap} center={DEFAULT_CENTER} zoom={5} scrollWheelZoom={false} style={{ height: '100%' }}>
          <TileLayer
            key={basemap}
            className={base.invert ? 'base-tiles' : ''}
            url={base.url}
            attribution={base.attribution}
            maxZoom={base.maxZoom ?? 19}
          />
          {/* Every radar frame stays mounted (preloaded); only the current one is visible. */}
          {showRadar &&
            frames.map((frame, i) => (
              <TileLayer
                key={frame.time}
                url={frame.url}
                opacity={i === frameIndex ? 0.7 : 0}
                maxNativeZoom={7}
                zIndex={10}
                attribution={i === frames.length - 1 ? 'Radar &copy; <a href="https://www.rainviewer.com/">RainViewer</a>' : undefined}
              />
            ))}

          <FollowCity lat={mainCity?.lat} lng={mainCity?.lng} />
          <ScrollZoomOnFocus />
          <MapClicks onPick={(lat, lng) => addPin(lat, lng)} />

          {mainCity && (
            <Marker position={[mainCity.lat, mainCity.lng]} icon={mainIcon} zIndexOffset={1000}>
              <Popup>
                <PlaceDetails name={mainCity.name} current={mainCity.current} unit={unit} windUnit={windUnit} />
                <PopupActions>
                  <PopupButton onClick={() => saveToggle(mainCity.name)}>
                    <Star className={`h-3.5 w-3.5 ${isFavorite(mainCity.name) ? 'fill-amber-400 text-amber-400' : ''}`} />
                    {isFavorite(mainCity.name) ? 'Saved' : 'Save'}
                  </PopupButton>
                </PopupActions>
              </Popup>
            </Marker>
          )}

          {savedMarkers.map(({ name, data }) => (
            <Marker
              key={`saved-${name}`}
              position={[data.latitude, data.longitude]}
              icon={pillIcon(formatDegrees(data.currentConditions?.temp, unit), 'saved', shortName(name))}
            >
              <Popup>
                <PlaceDetails name={name} current={data.currentConditions} unit={unit} windUnit={windUnit} />
                <PopupActions>
                  <PopupButton tone="primary" onClick={() => openForecast(name)}>Full forecast</PopupButton>
                  <PopupButton tone="danger" onClick={() => saveToggle(name)}>Unsave</PopupButton>
                </PopupActions>
              </Popup>
            </Marker>
          ))}

          {pins.map((pin) => (
            <Marker
              key={pin.id}
              position={[pin.lat, pin.lng]}
              icon={pillIcon(pin.loading ? '…' : formatDegrees(pin.current?.temp, unit), 'pin')}
              eventHandlers={{ contextmenu: () => removePin(pin) }}
            >
              <Popup>
                <PlaceDetails name={pin.name} current={pin.current} loading={pin.loading} unit={unit} windUnit={windUnit} />
                <PopupActions>
                  {pin.current && (
                    <>
                      <PopupButton tone="primary" onClick={() => openForecast(pin.name)}>Full forecast</PopupButton>
                      <PopupButton onClick={() => saveToggle(pin.name)}>
                        <Star className={`h-3.5 w-3.5 ${isFavorite(pin.name) ? 'fill-amber-400 text-amber-400' : ''}`} />
                        Save
                      </PopupButton>
                    </>
                  )}
                  <PopupButton tone="danger" onClick={() => removePin(pin)}>
                    <Trash2 className="h-3.5 w-3.5" /> Remove
                  </PopupButton>
                </PopupActions>
              </Popup>
            </Marker>
          ))}
        </MapContainer>

        {/* Toolbar */}
        <div className="absolute right-3 top-3 z-[1000] flex flex-col gap-2">
          <ToolButton label="Map layers" active={layersOpen} onClick={() => setLayersOpen((o) => !o)}>
            <Layers className="h-4 w-4" />
          </ToolButton>
          <ToolButton
            label={mainCity ? `Back to ${shortName(mainCity.name)}` : 'Recenter'}
            onClick={() => mainCity && map?.flyTo([mainCity.lat, mainCity.lng], Math.max(map.getZoom(), 6))}
          >
            <Crosshair className="h-4 w-4" />
          </ToolButton>
          <ToolButton label="Pin my location" onClick={locate}>
            {locating ? <LoaderCircle className="h-4 w-4 animate-spin" /> : <LocateFixed className="h-4 w-4" />}
          </ToolButton>
          <ToolButton label={fullscreen ? 'Exit fullscreen' : 'Fullscreen'} onClick={() => setFullscreen((f) => !f)}>
            {fullscreen ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
          </ToolButton>
          {pins.length > 0 && (
            <ToolButton label="Clear all pins" onClick={clearPins} badge={pins.length}>
              <Trash2 className="h-4 w-4" />
            </ToolButton>
          )}
        </div>

        {layersOpen && (
          <div className="absolute right-14 top-3 z-[1000] w-56 animate-pop rounded-2xl border border-line bg-surface p-2 shadow-xl">
            <p className="px-2 pb-1.5 pt-1 text-[11px] font-medium uppercase tracking-wider text-muted">Base map</p>
            <div className="grid grid-cols-3 gap-1">
              {Object.entries(BASEMAPS).map(([id, { label }]) => (
                <button
                  key={id}
                  type="button"
                  aria-pressed={basemap === id}
                  onClick={() => setBasemap(id)}
                  className={`rounded-lg px-2 py-1.5 text-xs transition-colors ${
                    basemap === id ? 'bg-accent/15 font-medium text-accent' : 'text-muted hover:bg-subtle hover:text-fg'
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>
            <p className="px-2 pb-1 pt-3 text-[11px] font-medium uppercase tracking-wider text-muted">Overlays</p>
            <Switch label="Rain radar" checked={showRadar} onChange={setShowRadar} />
            <Switch label="Saved cities" checked={showSaved} onChange={setShowSaved} />
            {showSaved && favorites.length === 0 && (
              <p className="px-2 pt-1 text-xs text-muted">Star a city to see it here.</p>
            )}
          </div>
        )}

        {showRadar && (
          <RadarPlayer frames={frames} index={frameIndex} setIndex={setFrameIndex} playing={playing} setPlaying={setPlaying} />
        )}
      </div>
    </section>
  );
};

export default WeatherMap;
