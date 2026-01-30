export interface TrafficSegment {
  id: string;
  coordinates: [number, number][];
  speed: number;
  congestionLevel: 'low' | 'medium' | 'high' | 'severe';
  timestamp: string;
  city?: string;
}

export interface RouteRequest {
  origin: [number, number];
  destination: [number, number];
  mode?: 'fastest' | 'shortest';
  originName?: string;
  destinationName?: string;
}

export interface Route {
  coordinates: [number, number][];
  distance: number;
  duration: number;
  trafficLevel: string;
  durationInTraffic: number;
  steps?: RouteStep[];
}

export interface RouteStep {
  instruction: string;
  distance: number;
  duration: number;
  coordinates: [number, number][];
}

export interface TrafficEvent {
  anonymized_id: string;
  lat: number;
  lon: number;
  speed: number;
  heading: number;
  recorded_at: string;
}
