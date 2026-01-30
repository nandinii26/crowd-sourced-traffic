import 'dotenv/config';
import express from 'express';
import http from 'http';
import cors from 'cors';
import { Server as SocketIOServer } from 'socket.io';
import ingestRouter from './routes/ingest';
import trafficRouter from './routes/traffic';
import { initKafka } from './kafka/producer';
import { initDb } from './db';

async function main() {
  const app = express();
  
  // Enable CORS for frontend
  app.use(cors({
    origin: 'http://localhost:5173',
    credentials: true
  }));
  
  app.use(express.json());

  app.use('/ingest', ingestRouter);
  app.use('/traffic', trafficRouter);

  const server = http.createServer(app);
  const io = new SocketIOServer(server, { 
    cors: { 
      origin: 'http://localhost:5173',
      credentials: true 
    } 
  });

  io.on('connection', (socket) => {
    console.log('client connected', socket.id);
    
    // Major cities with their coordinates
    const cities = [
      { name: 'New York', lat: 40.7128, lon: -74.0060 },
      { name: 'London', lat: 51.5074, lon: -0.1278 },
      { name: 'Tokyo', lat: 35.6762, lon: 139.6503 },
      { name: 'Paris', lat: 48.8566, lon: 2.3522 },
      { name: 'Mumbai', lat: 19.0760, lon: 72.8777 },
      { name: 'Sydney', lat: -33.8688, lon: 151.2093 },
      { name: 'Dubai', lat: 25.2048, lon: 55.2708 },
      { name: 'Los Angeles', lat: 34.0522, lon: -118.2437 },
      { name: 'Singapore', lat: 1.3521, lon: 103.8198 },
      { name: 'Berlin', lat: 52.5200, lon: 13.4050 },
    ];

    // Send mock traffic data every 3 seconds
    const interval = setInterval(() => {
      const mockData = [];
      
      // Generate 3-5 traffic segments for random cities
      const numSegments = 3 + Math.floor(Math.random() * 3);
      for (let i = 0; i < numSegments; i++) {
        const city = cities[Math.floor(Math.random() * cities.length)];
        const offsetLat = (Math.random() - 0.5) * 0.1;
        const offsetLon = (Math.random() - 0.5) * 0.1;
        const startLat = city.lat + offsetLat;
        const startLon = city.lon + offsetLon;
        const endLat = startLat + (Math.random() - 0.5) * 0.02;
        const endLon = startLon + (Math.random() - 0.5) * 0.02;
        
        const speed = 10 + Math.random() * 70;
        let congestionLevel;
        if (speed > 50) congestionLevel = 'low';
        else if (speed > 30) congestionLevel = 'medium';
        else if (speed > 10) congestionLevel = 'high';
        else congestionLevel = 'severe';

        mockData.push({
          id: Math.random().toString(36).substr(2, 9),
          coordinates: [[startLat, startLon], [endLat, endLon]],
          speed: speed,
          congestionLevel: congestionLevel,
          timestamp: new Date().toISOString(),
          city: city.name,
        });
      }
      
      socket.emit('traffic-update', mockData);
    }, 3000);

    socket.on('disconnect', () => {
      clearInterval(interval);
      console.log('client disconnected', socket.id);
    });
  });

  await initDb();
  
  // Kafka initialization disabled - not running
  // try {
  //   await Promise.race([
  //     initKafka(),
  //     new Promise((_, reject) => setTimeout(() => reject(new Error('Kafka timeout')), 5000))
  //   ]);
  // } catch (err) {
  //   console.warn('Kafka initialization failed (continuing without Kafka):', err instanceof Error ? err.message : err);
  // }

  const port = process.env.PORT || 3000;
  server.listen(port, () => console.log(`Server listening on ${port}`));
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
