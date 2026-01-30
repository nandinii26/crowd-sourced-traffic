import 'dotenv/config';
import express from 'express';
import http from 'http';
import { Server as SocketIOServer } from 'socket.io';
import ingestRouter from './routes/ingest';
import { initKafka } from './kafka/producer';
import { initDb } from './db';

async function main() {
  const app = express();
  app.use(express.json());

  app.use('/ingest', ingestRouter);

  const server = http.createServer(app);
  const io = new SocketIOServer(server, { cors: { origin: '*' } });

  io.on('connection', (socket) => {
    console.log('client connected', socket.id);
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
