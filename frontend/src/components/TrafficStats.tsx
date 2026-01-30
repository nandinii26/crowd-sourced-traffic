import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Activity, Clock, TrendingDown, TrendingUp } from 'lucide-react';
import { TrafficSegment } from '../types';

interface TrafficStatsProps {
  trafficData: TrafficSegment[];
}

export default function TrafficStats({ trafficData }: TrafficStatsProps) {
  const stats = {
    total: trafficData.length,
    low: trafficData.filter(s => s.congestionLevel === 'low').length,
    medium: trafficData.filter(s => s.congestionLevel === 'medium').length,
    high: trafficData.filter(s => s.congestionLevel === 'high').length,
    severe: trafficData.filter(s => s.congestionLevel === 'severe').length,
  };

  const chartData = [
    { name: 'Low', value: stats.low, fill: '#10b981' },
    { name: 'Medium', value: stats.medium, fill: '#f59e0b' },
    { name: 'High', value: stats.high, fill: '#f97316' },
    { name: 'Severe', value: stats.severe, fill: '#ef4444' },
  ];

  const avgSpeed = trafficData.length > 0
    ? trafficData.reduce((sum, s) => sum + s.speed, 0) / trafficData.length
    : 0;

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-gray-800 mb-2">Traffic Statistics</h2>
        <p className="text-sm text-gray-600">Real-time network overview</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-4 rounded-lg border border-blue-200">
          <div className="flex items-center justify-between mb-2">
            <Activity className="w-5 h-5 text-blue-600" />
          </div>
          <div className="text-2xl font-bold text-gray-800">{stats.total}</div>
          <div className="text-sm text-gray-600">Active Segments</div>
        </div>

        <div className="bg-gradient-to-br from-green-50 to-green-100 p-4 rounded-lg border border-green-200">
          <div className="flex items-center justify-between mb-2">
            <TrendingUp className="w-5 h-5 text-green-600" />
          </div>
          <div className="text-2xl font-bold text-gray-800">{avgSpeed.toFixed(1)}</div>
          <div className="text-sm text-gray-600">Avg Speed (km/h)</div>
        </div>

        <div className="bg-gradient-to-br from-orange-50 to-orange-100 p-4 rounded-lg border border-orange-200">
          <div className="flex items-center justify-between mb-2">
            <TrendingDown className="w-5 h-5 text-orange-600" />
          </div>
          <div className="text-2xl font-bold text-gray-800">{stats.high + stats.severe}</div>
          <div className="text-sm text-gray-600">Congested Areas</div>
        </div>

        <div className="bg-gradient-to-br from-purple-50 to-purple-100 p-4 rounded-lg border border-purple-200">
          <div className="flex items-center justify-between mb-2">
            <Clock className="w-5 h-5 text-purple-600" />
          </div>
          <div className="text-2xl font-bold text-gray-800">Live</div>
          <div className="text-sm text-gray-600">Data Stream</div>
        </div>
      </div>

      {/* Chart */}
      <div className="bg-white p-4 rounded-lg border border-gray-200">
        <h3 className="font-semibold text-gray-800 mb-4">Congestion Distribution</h3>
        <ResponsiveContainer width="100%" height={200}>
          <BarChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" />
            <YAxis />
            <Tooltip />
            <Bar dataKey="value" fill="#2563eb" radius={[8, 8, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Recent Activity */}
      <div className="bg-white p-4 rounded-lg border border-gray-200">
        <h3 className="font-semibold text-gray-800 mb-3">Congestion Breakdown</h3>
        <div className="space-y-2">
          {chartData.map((item) => (
            <div key={item.name} className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 rounded" style={{ backgroundColor: item.fill }}></div>
                <span className="text-sm text-gray-700">{item.name}</span>
              </div>
              <span className="text-sm font-medium text-gray-800">
                {item.value} ({stats.total > 0 ? ((item.value / stats.total) * 100).toFixed(1) : 0}%)
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
