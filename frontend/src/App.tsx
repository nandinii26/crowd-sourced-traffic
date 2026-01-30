import { useState, useEffect } from 'react';
import { io, Socket } from 'socket.io-client';
import TrafficMap from './components/TrafficMap';
import Sidebar from './components/Sidebar';
import Header from './components/Header';
import { TrafficSegment, RouteRequest, Route } from './types';
import { generateRoute } from './utils/routeCalculator';

function App() {
  const [_socket, setSocket] = useState<Socket | null>(null);
  const [trafficData, setTrafficData] = useState<TrafficSegment[]>([]);
  const [isConnected, setIsConnected] = useState(false);
  const [routeRequest, setRouteRequest] = useState<RouteRequest | null>(null);
  const [currentRoute, setCurrentRoute] = useState<Route | null>(null);
  const [originCoord, setOriginCoord] = useState<[number, number] | null>(null);
  const [destinationCoord, setDestinationCoord] = useState<[number, number] | null>(null);
  const [originLabel, setOriginLabel] = useState('');
  const [destinationLabel, setDestinationLabel] = useState('');
  const [pickTarget, setPickTarget] = useState<'origin' | 'destination' | null>(null);

  const formatCoord = (coord: [number, number]) => `${coord[0].toFixed(5)}, ${coord[1].toFixed(5)}`;

  const handleSetOrigin = (coord: [number, number], label?: string) => {
    setOriginCoord(coord);
    setOriginLabel(label ?? formatCoord(coord));
  };

  const handleSetDestination = (coord: [number, number], label?: string) => {
    setDestinationCoord(coord);
    setDestinationLabel(label ?? formatCoord(coord));
  };

  const handleMapPick = (coord: [number, number]) => {
    if (pickTarget === 'origin') {
      handleSetOrigin(coord, `Map pin (${formatCoord(coord)})`);
    } else if (pickTarget === 'destination') {
      handleSetDestination(coord, `Map pin (${formatCoord(coord)})`);
    }
    setPickTarget(null);
  };

  const handleRouteRequest = (request: RouteRequest) => {
    setRouteRequest(request);
    handleSetOrigin(request.origin, request.originName);
    handleSetDestination(request.destination, request.destinationName);
    const route = generateRoute(request.origin, request.destination, request.mode);
    setCurrentRoute(route);
  };

  useEffect(() => {
    const newSocket = io('http://localhost:3000', {
      transports: ['websocket', 'polling']
    });

    newSocket.on('connect', () => {
      console.log('Connected to server');
      setIsConnected(true);
    });

    newSocket.on('disconnect', () => {
      console.log('Disconnected from server');
      setIsConnected(false);
    });

    newSocket.on('traffic-update', (data: TrafficSegment[]) => {
      setTrafficData(data);
    });

    setSocket(newSocket);

    return () => {
      newSocket.close();
    };
  }, []);

  return (
    <div className="h-screen flex flex-col">
      <Header isConnected={isConnected} />
      <div className="flex flex-1 overflow-hidden">
        <Sidebar 
          onRouteRequest={handleRouteRequest}
          trafficData={trafficData}
          currentRoute={currentRoute}
          routeRequest={routeRequest}
          originCoord={originCoord}
          destinationCoord={destinationCoord}
          originLabel={originLabel}
          destinationLabel={destinationLabel}
          pickTarget={pickTarget}
          onPickTarget={setPickTarget}
          onSetOrigin={handleSetOrigin}
          onSetDestination={handleSetDestination}
        />
        <div className="flex-1">
          <TrafficMap 
            trafficData={trafficData}
            routeRequest={routeRequest}
            currentRoute={currentRoute}
            pickTarget={pickTarget}
            onMapPick={handleMapPick}
          />
        </div>
      </div>
    </div>
  );
}

export default App;
