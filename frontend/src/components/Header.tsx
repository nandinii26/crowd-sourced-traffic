import { MapPin, Activity } from 'lucide-react';

interface HeaderProps {
  isConnected: boolean;
}

export default function Header({ isConnected }: HeaderProps) {
  return (
    <header className="bg-gradient-to-r from-blue-600 to-blue-800 text-white shadow-lg">
      <div className="px-6 py-4 flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <MapPin className="w-8 h-8" />
          <div>
            <h1 className="text-2xl font-bold">Crowd Traffic</h1>
            <p className="text-sm text-blue-100">Real-time Traffic Intelligence</p>
          </div>
        </div>
        
        <div className="flex items-center space-x-2">
          <Activity className={`w-5 h-5 ${isConnected ? 'text-green-300' : 'text-red-300'}`} />
          <span className="text-sm">
            {isConnected ? 'Connected' : 'Disconnected'}
          </span>
        </div>
      </div>
    </header>
  );
}
