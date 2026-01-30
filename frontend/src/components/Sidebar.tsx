import { useEffect, useState } from 'react';
import { Navigation, TrendingUp, MapPinned, Search, Globe } from 'lucide-react';
import { TrafficSegment, RouteRequest, Route } from '../types';
import TrafficStats from './TrafficStats';
import RouteDetails from './RouteDetails';

interface SidebarProps {
  onRouteRequest: (request: RouteRequest) => void;
  trafficData: TrafficSegment[];
  currentRoute: Route | null;
  routeRequest: RouteRequest | null;
  originCoord: [number, number] | null;
  destinationCoord: [number, number] | null;
  originLabel: string;
  destinationLabel: string;
  pickTarget: 'origin' | 'destination' | null;
  onPickTarget: (target: 'origin' | 'destination' | null) => void;
  onSetOrigin: (coord: [number, number], label?: string) => void;
  onSetDestination: (coord: [number, number], label?: string) => void;
}

const CITIES = [
  { name: 'New York', coords: [40.7128, -74.0060] as [number, number] },
  { name: 'London', coords: [51.5074, -0.1278] as [number, number] },
  { name: 'Tokyo', coords: [35.6762, 139.6503] as [number, number] },
  { name: 'Paris', coords: [48.8566, 2.3522] as [number, number] },
  { name: 'Mumbai', coords: [19.0760, 72.8777] as [number, number] },
  { name: 'Sydney', coords: [-33.8688, 151.2093] as [number, number] },
  { name: 'Dubai', coords: [25.2048, 55.2708] as [number, number] },
  { name: 'Los Angeles', coords: [34.0522, -118.2437] as [number, number] },
  { name: 'Singapore', coords: [1.3521, 103.8198] as [number, number] },
  { name: 'Berlin', coords: [52.5200, 13.4050] as [number, number] },
];

type PlaceResult = {
  display_name: string;
  lat: string;
  lon: string;
  type?: string;
};

export default function Sidebar({
  onRouteRequest,
  trafficData,
  currentRoute,
  routeRequest,
  originCoord,
  destinationCoord,
  originLabel,
  destinationLabel,
  pickTarget,
  onPickTarget,
  onSetOrigin,
  onSetDestination
}: SidebarProps) {
  const [selectedOriginCity, setSelectedOriginCity] = useState<string>('');
  const [selectedDestinationCity, setSelectedDestinationCity] = useState<string>('');
  const [originLat, setOriginLat] = useState('');
  const [originLon, setOriginLon] = useState('');
  const [destinationLat, setDestinationLat] = useState('');
  const [destinationLon, setDestinationLon] = useState('');
  const [originQuery, setOriginQuery] = useState('');
  const [destinationQuery, setDestinationQuery] = useState('');
  const [originResults, setOriginResults] = useState<PlaceResult[]>([]);
  const [destinationResults, setDestinationResults] = useState<PlaceResult[]>([]);
  const [originSearching, setOriginSearching] = useState(false);
  const [destinationSearching, setDestinationSearching] = useState(false);
  const [activeTab, setActiveTab] = useState<'route' | 'stats'>('route');

  useEffect(() => {
    if (originCoord) {
      setOriginLat(originCoord[0].toFixed(6));
      setOriginLon(originCoord[1].toFixed(6));
    }
  }, [originCoord]);

  useEffect(() => {
    if (destinationCoord) {
      setDestinationLat(destinationCoord[0].toFixed(6));
      setDestinationLon(destinationCoord[1].toFixed(6));
    }
  }, [destinationCoord]);

  const isValidLatLon = (lat: number, lon: number) => (
    Number.isFinite(lat) &&
    Number.isFinite(lon) &&
    lat >= -90 && lat <= 90 &&
    lon >= -180 && lon <= 180
  );

  const updateOriginCoord = (latValue: string, lonValue: string) => {
    setOriginLat(latValue);
    setOriginLon(lonValue);
    const lat = Number(latValue);
    const lon = Number(lonValue);
    if (isValidLatLon(lat, lon)) {
      onSetOrigin([lat, lon], `Custom (${lat.toFixed(5)}, ${lon.toFixed(5)})`);
    }
  };

  const updateDestinationCoord = (latValue: string, lonValue: string) => {
    setDestinationLat(latValue);
    setDestinationLon(lonValue);
    const lat = Number(latValue);
    const lon = Number(lonValue);
    if (isValidLatLon(lat, lon)) {
      onSetDestination([lat, lon], `Custom (${lat.toFixed(5)}, ${lon.toFixed(5)})`);
    }
  };

  const handleOriginCityChange = (value: string) => {
    setSelectedOriginCity(value);
    const city = CITIES.find((c) => c.name === value);
    if (city) {
      onSetOrigin(city.coords, city.name);
    }
  };

  const handleDestinationCityChange = (value: string) => {
    setSelectedDestinationCity(value);
    const city = CITIES.find((c) => c.name === value);
    if (city) {
      onSetDestination(city.coords, city.name);
    }
  };

  const searchPlaces = async (query: string, signal: AbortSignal): Promise<PlaceResult[]> => {
    const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&limit=6`;
    const response = await fetch(url, {
      headers: {
        'Accept-Language': 'en'
      },
      signal
    });
    if (!response.ok) {
      return [];
    }
    return (await response.json()) as PlaceResult[];
  };

  useEffect(() => {
    if (originQuery.trim().length < 3) {
      setOriginResults([]);
      return;
    }
    const controller = new AbortController();
    const timeout = setTimeout(async () => {
      setOriginSearching(true);
      try {
        const results = await searchPlaces(originQuery.trim(), controller.signal);
        setOriginResults(results);
      } finally {
        setOriginSearching(false);
      }
    }, 350);
    return () => {
      controller.abort();
      clearTimeout(timeout);
    };
  }, [originQuery]);

  useEffect(() => {
    if (destinationQuery.trim().length < 3) {
      setDestinationResults([]);
      return;
    }
    const controller = new AbortController();
    const timeout = setTimeout(async () => {
      setDestinationSearching(true);
      try {
        const results = await searchPlaces(destinationQuery.trim(), controller.signal);
        setDestinationResults(results);
      } finally {
        setDestinationSearching(false);
      }
    }, 350);
    return () => {
      controller.abort();
      clearTimeout(timeout);
    };
  }, [destinationQuery]);

  const handlePlanRoute = () => {
    if (!originCoord || !destinationCoord) {
      return;
    }
    onRouteRequest({
      origin: originCoord,
      destination: destinationCoord,
      originName: originLabel || 'Custom origin',
      destinationName: destinationLabel || 'Custom destination',
      mode: 'fastest'
    });
  };

  const handleCityClick = (city: typeof CITIES[0]) => {
    onSetOrigin(city.coords, city.name);
    onSetDestination(city.coords, city.name);
    onRouteRequest({
      origin: city.coords,
      destination: city.coords,
      originName: city.name,
      destinationName: city.name,
      mode: 'fastest'
    });
  };

  return (
    <div className="w-96 bg-white shadow-xl flex flex-col">
      {/* Tabs */}
      <div className="flex border-b">
        <button
          onClick={() => setActiveTab('route')}
          className={`flex-1 px-4 py-3 flex items-center justify-center space-x-2 ${
            activeTab === 'route' ? 'bg-blue-50 border-b-2 border-blue-600 text-blue-600' : 'text-gray-600'
          }`}
        >
          <Navigation className="w-4 h-4" />
          <span className="font-medium">Route Planning</span>
        </button>
        <button
          onClick={() => setActiveTab('stats')}
          className={`flex-1 px-4 py-3 flex items-center justify-center space-x-2 ${
            activeTab === 'stats' ? 'bg-blue-50 border-b-2 border-blue-600 text-blue-600' : 'text-gray-600'
          }`}
        >
          <TrendingUp className="w-4 h-4" />
          <span className="font-medium">Statistics</span>
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-6">
        {activeTab === 'route' ? (
          <div className="space-y-6">
            <div>
              <h2 className="text-xl font-bold text-gray-800 mb-4">Plan Your Route</h2>
              <p className="text-sm text-gray-600 mb-6">
                Use city presets, enter coordinates, or click the map.
              </p>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <MapPinned className="w-4 h-4 inline mr-1" />
                  Starting Point
                </label>
                <input
                  type="text"
                  placeholder="Search any place in the world"
                  value={originQuery}
                  onChange={(e) => setOriginQuery(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent mb-2"
                />
                {originSearching && (
                  <div className="text-xs text-gray-500 mb-2">Searching…</div>
                )}
                {originResults.length > 0 && (
                  <div className="mb-2 max-h-40 overflow-y-auto border border-gray-200 rounded-lg bg-white">
                    {originResults.map((result) => (
                      <button
                        key={`${result.lat}-${result.lon}-${result.display_name}`}
                        onClick={() => {
                          const lat = Number(result.lat);
                          const lon = Number(result.lon);
                          if (isValidLatLon(lat, lon)) {
                            onSetOrigin([lat, lon], result.display_name);
                            setOriginQuery(result.display_name);
                            setOriginResults([]);
                          }
                        }}
                        className="w-full text-left px-3 py-2 text-xs hover:bg-blue-50"
                      >
                        {result.display_name}
                      </button>
                    ))}
                  </div>
                )}
                <select
                  value={selectedOriginCity}
                  onChange={(e) => handleOriginCityChange(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"
                >
                  <option value="">Select origin city</option>
                  {CITIES.map((city) => (
                    <option key={city.name} value={city.name}>{city.name}</option>
                  ))}
                </select>
                <div className="mt-2 grid grid-cols-2 gap-2">
                  <input
                    type="number"
                    placeholder="Latitude"
                    value={originLat}
                    onChange={(e) => updateOriginCoord(e.target.value, originLon)}
                    className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                  <input
                    type="number"
                    placeholder="Longitude"
                    value={originLon}
                    onChange={(e) => updateOriginCoord(originLat, e.target.value)}
                    className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                <div className="mt-2 flex flex-wrap items-center gap-2">
                  <button
                    onClick={() => onPickTarget('origin')}
                    className="px-3 py-1.5 text-xs bg-blue-50 text-blue-700 rounded-lg border border-blue-200 hover:bg-blue-100"
                  >
                    Pick on map
                  </button>
                  {pickTarget === 'origin' && (
                    <span className="text-xs text-blue-600">Click on map to set origin</span>
                  )}
                  {originLabel && (
                    <span className="text-xs text-gray-600">Selected: {originLabel}</span>
                  )}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <MapPinned className="w-4 h-4 inline mr-1" />
                  Destination
                </label>
                <input
                  type="text"
                  placeholder="Search any place in the world"
                  value={destinationQuery}
                  onChange={(e) => setDestinationQuery(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent mb-2"
                />
                {destinationSearching && (
                  <div className="text-xs text-gray-500 mb-2">Searching…</div>
                )}
                {destinationResults.length > 0 && (
                  <div className="mb-2 max-h-40 overflow-y-auto border border-gray-200 rounded-lg bg-white">
                    {destinationResults.map((result) => (
                      <button
                        key={`${result.lat}-${result.lon}-${result.display_name}`}
                        onClick={() => {
                          const lat = Number(result.lat);
                          const lon = Number(result.lon);
                          if (isValidLatLon(lat, lon)) {
                            onSetDestination([lat, lon], result.display_name);
                            setDestinationQuery(result.display_name);
                            setDestinationResults([]);
                          }
                        }}
                        className="w-full text-left px-3 py-2 text-xs hover:bg-blue-50"
                      >
                        {result.display_name}
                      </button>
                    ))}
                  </div>
                )}
                <select
                  value={selectedDestinationCity}
                  onChange={(e) => handleDestinationCityChange(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"
                >
                  <option value="">Select destination city</option>
                  {CITIES.map((city) => (
                    <option key={city.name} value={city.name}>{city.name}</option>
                  ))}
                </select>
                <div className="mt-2 grid grid-cols-2 gap-2">
                  <input
                    type="number"
                    placeholder="Latitude"
                    value={destinationLat}
                    onChange={(e) => updateDestinationCoord(e.target.value, destinationLon)}
                    className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                  <input
                    type="number"
                    placeholder="Longitude"
                    value={destinationLon}
                    onChange={(e) => updateDestinationCoord(destinationLat, e.target.value)}
                    className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                <div className="mt-2 flex flex-wrap items-center gap-2">
                  <button
                    onClick={() => onPickTarget('destination')}
                    className="px-3 py-1.5 text-xs bg-blue-50 text-blue-700 rounded-lg border border-blue-200 hover:bg-blue-100"
                  >
                    Pick on map
                  </button>
                  {pickTarget === 'destination' && (
                    <span className="text-xs text-blue-600">Click on map to set destination</span>
                  )}
                  {destinationLabel && (
                    <span className="text-xs text-gray-600">Selected: {destinationLabel}</span>
                  )}
                </div>
              </div>

              <button
                onClick={handlePlanRoute}
                disabled={!originCoord || !destinationCoord}
                className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed text-white font-medium py-3 px-4 rounded-lg flex items-center justify-center space-x-2 transition-colors"
              >
                <Search className="w-4 h-4" />
                <span>Find Best Route</span>
              </button>
            </div>

            {currentRoute && routeRequest && (
              <RouteDetails route={currentRoute} routeRequest={routeRequest} />
            )}

            <div className="mt-8 p-4 bg-gradient-to-r from-indigo-50 to-purple-50 rounded-lg border border-indigo-100">
              <h3 className="font-semibold text-gray-800 mb-3 flex items-center">
                <Globe className="w-4 h-4 mr-2" />
                Quick City Navigation
              </h3>
              <div className="grid grid-cols-2 gap-2">
                {CITIES.map((city) => (
                  <button
                    key={city.name}
                    onClick={() => handleCityClick(city)}
                    className="px-3 py-2 bg-white hover:bg-indigo-50 border border-indigo-200 rounded-lg text-sm text-gray-700 hover:text-indigo-600 transition-colors"
                  >
                    {city.name}
                  </button>
                ))}
              </div>
            </div>

            <div className="mt-4 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg border border-blue-100">
              <h3 className="font-semibold text-gray-800 mb-2">Traffic Legend</h3>
              <div className="space-y-2">
                <div className="flex items-center space-x-2">
                  <div className="w-4 h-4 rounded bg-green-500"></div>
                  <span className="text-sm text-gray-700">Low Traffic ({">"} 50 km/h)</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-4 h-4 rounded bg-yellow-500"></div>
                  <span className="text-sm text-gray-700">Medium (30-50 km/h)</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-4 h-4 rounded bg-orange-500"></div>
                  <span className="text-sm text-gray-700">High (10-30 km/h)</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-4 h-4 rounded bg-red-500"></div>
                  <span className="text-sm text-gray-700">Severe ({"<"} 10 km/h)</span>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <TrafficStats trafficData={trafficData} />
        )}
      </div>
    </div>
  );
}
