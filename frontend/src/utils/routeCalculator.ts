import { Route, RouteStep } from '../types';

// Calculate distance between two coordinates using Haversine formula
export function calculateDistance(coord1: [number, number], coord2: [number, number]): number {
  const R = 6371; // Earth's radius in km
  const lat1 = coord1[0] * Math.PI / 180;
  const lat2 = coord2[0] * Math.PI / 180;
  const deltaLat = (coord2[0] - coord1[0]) * Math.PI / 180;
  const deltaLon = (coord2[1] - coord1[1]) * Math.PI / 180;

  const a = Math.sin(deltaLat / 2) * Math.sin(deltaLat / 2) +
    Math.cos(lat1) * Math.cos(lat2) *
    Math.sin(deltaLon / 2) * Math.sin(deltaLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return R * c; // Distance in km
}

// Generate a route with waypoints between origin and destination
export function generateRoute(
  origin: [number, number],
  destination: [number, number],
  mode: 'fastest' | 'shortest' = 'fastest'
): Route {
  const waypoints: [number, number][] = [origin];
  
  // Create intermediate waypoints for a more realistic route
  const numWaypoints = 5;
  for (let i = 1; i < numWaypoints; i++) {
    const ratio = i / numWaypoints;
    // Add some curve to make it more realistic
    const latOffset = (Math.random() - 0.5) * 0.01;
    const lonOffset = (Math.random() - 0.5) * 0.01;
    const lat = origin[0] + (destination[0] - origin[0]) * ratio + latOffset;
    const lon = origin[1] + (destination[1] - origin[1]) * ratio + lonOffset;
    waypoints.push([lat, lon]);
  }
  
  waypoints.push(destination);

  // Calculate total distance
  let totalDistance = 0;
  for (let i = 0; i < waypoints.length - 1; i++) {
    totalDistance += calculateDistance(waypoints[i], waypoints[i + 1]);
  }

  // Calculate duration (assuming average speed based on mode)
  const avgSpeed = mode === 'fastest' ? 60 : 45; // km/h
  const baseDuration = (totalDistance / avgSpeed) * 60; // minutes

  // Add traffic factor (10-30% slower)
  const trafficFactor = 1 + (Math.random() * 0.2 + 0.1);
  const durationInTraffic = baseDuration * trafficFactor;

  // Determine traffic level
  let trafficLevel: string;
  if (trafficFactor < 1.15) trafficLevel = 'Light';
  else if (trafficFactor < 1.25) trafficLevel = 'Moderate';
  else trafficLevel = 'Heavy';

  // Generate route steps
  const steps: RouteStep[] = [];
  const directions = ['north', 'south', 'east', 'west', 'northeast', 'northwest', 'southeast', 'southwest'];
  
  for (let i = 0; i < waypoints.length - 1; i++) {
    const stepDistance = calculateDistance(waypoints[i], waypoints[i + 1]);
    const stepDuration = (stepDistance / avgSpeed) * 60;
    const direction = directions[Math.floor(Math.random() * directions.length)];
    
    steps.push({
      instruction: i === 0 
        ? 'Head ' + direction 
        : (i === waypoints.length - 2 
          ? 'Arrive at destination' 
          : 'Continue ' + direction),
      distance: stepDistance,
      duration: stepDuration,
      coordinates: [waypoints[i], waypoints[i + 1]]
    });
  }

  return {
    coordinates: waypoints,
    distance: totalDistance,
    duration: baseDuration,
    durationInTraffic,
    trafficLevel,
    steps
  };
}

export function formatDistance(km: number): string {
  if (km < 1) {
    return `${Math.round(km * 1000)} m`;
  }
  return `${km.toFixed(1)} km`;
}

export function formatDuration(minutes: number): string {
  const hours = Math.floor(minutes / 60);
  const mins = Math.round(minutes % 60);
  
  if (hours === 0) {
    return `${mins} min`;
  }
  return `${hours} hr ${mins} min`;
}
