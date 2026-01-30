import { Clock, Navigation, AlertCircle, TrendingUp } from 'lucide-react';
import { Route, RouteRequest } from '../types';
import { formatDistance, formatDuration } from '../utils/routeCalculator';

interface RouteDetailsProps {
  route: Route;
  routeRequest: RouteRequest;
}

export default function RouteDetails({ route, routeRequest }: RouteDetailsProps) {
  const trafficDelay = route.durationInTraffic - route.duration;
  const originName = routeRequest.originName ?? 'Custom origin';
  const destinationName = routeRequest.destinationName ?? 'Custom destination';
  
  return (
    <div className="mt-6 bg-white rounded-lg border-2 border-blue-200 overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-500 to-blue-600 text-white p-4">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center space-x-2">
            <Navigation className="w-5 h-5" />
            <span className="font-semibold">Route Overview</span>
          </div>
          <span className={`text-xs px-2 py-1 rounded ${
            route.trafficLevel === 'Light' ? 'bg-green-500' :
            route.trafficLevel === 'Moderate' ? 'bg-yellow-500' :
            'bg-red-500'
          }`}>
            {route.trafficLevel} Traffic
          </span>
        </div>
        <div className="text-sm opacity-90">
          {originName} → {destinationName}
        </div>
      </div>

      {/* Main Info */}
      <div className="p-4 space-y-4">
        {/* Time and Distance */}
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-blue-50 p-3 rounded-lg">
            <div className="flex items-center space-x-2 mb-1">
              <Clock className="w-4 h-4 text-blue-600" />
              <span className="text-xs text-gray-600">Duration</span>
            </div>
            <div className="text-xl font-bold text-gray-800">
              {formatDuration(route.durationInTraffic)}
            </div>
            {trafficDelay > 1 && (
              <div className="text-xs text-orange-600 mt-1">
                +{formatDuration(trafficDelay)} delay
              </div>
            )}
          </div>

          <div className="bg-green-50 p-3 rounded-lg">
            <div className="flex items-center space-x-2 mb-1">
              <TrendingUp className="w-4 h-4 text-green-600" />
              <span className="text-xs text-gray-600">Distance</span>
            </div>
            <div className="text-xl font-bold text-gray-800">
              {formatDistance(route.distance)}
            </div>
          </div>
        </div>

        {/* Traffic Info */}
        {trafficDelay > 1 && (
          <div className="flex items-start space-x-2 p-3 bg-orange-50 border border-orange-200 rounded-lg">
            <AlertCircle className="w-4 h-4 text-orange-600 mt-0.5" />
            <div className="flex-1">
              <p className="text-sm font-medium text-orange-800">Traffic Advisory</p>
              <p className="text-xs text-orange-700 mt-1">
                Current traffic conditions add approximately {formatDuration(trafficDelay)} to your journey.
              </p>
            </div>
          </div>
        )}

        {/* Route Steps */}
        {route.steps && route.steps.length > 0 && (
          <div className="border-t pt-4">
            <h4 className="text-sm font-semibold text-gray-800 mb-3">Route Steps</h4>
            <div className="space-y-2 max-h-48 overflow-y-auto">
              {route.steps.map((step, index) => (
                <div key={index} className="flex items-start space-x-3 p-2 hover:bg-gray-50 rounded">
                  <div className="flex-shrink-0 w-6 h-6 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-xs font-medium">
                    {index + 1}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-gray-800">{step.instruction}</p>
                    <p className="text-xs text-gray-500 mt-0.5">
                      {formatDistance(step.distance)} · {formatDuration(step.duration)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
