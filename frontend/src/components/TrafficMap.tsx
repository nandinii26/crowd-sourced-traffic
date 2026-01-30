import { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Polyline, Marker, Popup, useMap, useMapEvents } from 'react-leaflet';
import { TrafficSegment, RouteRequest, Route } from '../types';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// Fix for default marker icons in React-Leaflet
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
});

// Custom icons for origin and destination
const originIcon = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-green.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

const destinationIcon = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

interface TrafficMapProps {
  trafficData: TrafficSegment[];
  routeRequest: RouteRequest | null;
  currentRoute: Route | null;
  pickTarget?: 'origin' | 'destination' | null;
  onMapPick?: (coord: [number, number]) => void;
}

function MapUpdater({ center, zoom }: { center: [number, number]; zoom: number }) {
  const map = useMap();
  useEffect(() => {
    map.setView(center, zoom);
  }, [center, zoom, map]);
  return null;
}

function MapClickHandler({ enabled, onPick }: { enabled: boolean; onPick?: (coord: [number, number]) => void }) {
  useMapEvents({
    click(e) {
      if (!enabled || !onPick) return;
      onPick([e.latlng.lat, e.latlng.lng]);
    }
  });
  return null;
}

export default function TrafficMap({ trafficData, routeRequest, currentRoute, pickTarget, onMapPick }: TrafficMapProps) {
  const [center, setCenter] = useState<[number, number]>([20, 0]); // World view default
  const [zoom, setZoom] = useState(2);

  useEffect(() => {
    if (routeRequest && currentRoute) {
      // Center between origin and destination
      const midLat = (routeRequest.origin[0] + routeRequest.destination[0]) / 2;
      const midLon = (routeRequest.origin[1] + routeRequest.destination[1]) / 2;
      setCenter([midLat, midLon]);
      
      // Calculate appropriate zoom level based on distance
      const distance = currentRoute.distance;
      if (distance < 10) setZoom(12);
      else if (distance < 50) setZoom(10);
      else if (distance < 200) setZoom(8);
      else if (distance < 500) setZoom(6);
      else if (distance < 1000) setZoom(5);
      else if (distance < 2000) setZoom(4);
      else setZoom(3);
    } else if (routeRequest) {
      setCenter(routeRequest.origin);
      setZoom(10);
    } else if (trafficData.length > 0) {
      const firstSegment = trafficData[0];
      if (firstSegment.coordinates.length > 0) {
        setCenter(firstSegment.coordinates[0]);
        setZoom(6);
      }
    }
  }, [routeRequest, trafficData, currentRoute]);

  const getColorByCongestion = (level: string): string => {
    switch (level) {
      case 'low': return '#10b981';
      case 'medium': return '#f59e0b';
      case 'high': return '#f97316';
      case 'severe': return '#ef4444';
      default: return '#6b7280';
    }
  };

  return (
    <MapContainer 
      center={center} 
      zoom={zoom} 
      className="h-full w-full"
      zoomControl={true}
    >
      <MapUpdater center={center} zoom={zoom} />
      <MapClickHandler enabled={Boolean(pickTarget)} onPick={onMapPick} />
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      
      {/* Route Polyline - Draw this first so it's below markers */}
      {currentRoute && (
        <Polyline
          positions={currentRoute.coordinates}
          pathOptions={{
            color: '#2563eb',
            weight: 6,
            opacity: 0.8,
            dashArray: '10, 5'
          }}
        >
          <Popup>
            <div className="p-2">
              <p className="font-semibold">Planned Route</p>
              <p className="text-sm">Distance: {currentRoute.distance.toFixed(1)} km</p>
              <p className="text-sm">Duration: {Math.round(currentRoute.durationInTraffic)} min</p>
              <p className="text-sm">Traffic: {currentRoute.trafficLevel}</p>
            </div>
          </Popup>
        </Polyline>
      )}

      {/* Traffic Segments */}
      {trafficData.map((segment) => (
        <Polyline
          key={segment.id}
          positions={segment.coordinates}
          pathOptions={{
            color: getColorByCongestion(segment.congestionLevel),
            weight: 5,
            opacity: 0.7,
          }}
        >
          <Popup>
            <div className="p-2">
              <p className="font-semibold">{segment.city || 'Traffic Segment'}</p>
              <p className="text-sm">Speed: {segment.speed.toFixed(1)} km/h</p>
              <p className="text-sm">Level: {segment.congestionLevel}</p>
              <p className="text-xs text-gray-500">{new Date(segment.timestamp).toLocaleTimeString()}</p>
            </div>
          </Popup>
        </Polyline>
      ))}

      {/* Route Markers */}
      {routeRequest && (
        <>
          <Marker position={routeRequest.origin} icon={originIcon}>
            <Popup>
              <div className="p-2">
                <p className="font-semibold text-green-600">Origin</p>
                <p className="text-sm">{routeRequest.originName || 'Starting Point'}</p>
              </div>
            </Popup>
          </Marker>
          <Marker position={routeRequest.destination} icon={destinationIcon}>
            <Popup>
              <div className="p-2">
                <p className="font-semibold text-red-600">Destination</p>
                <p className="text-sm">{routeRequest.destinationName || 'End Point'}</p>
              </div>
            </Popup>
          </Marker>
        </>
      )}
    </MapContainer>
  );
}
