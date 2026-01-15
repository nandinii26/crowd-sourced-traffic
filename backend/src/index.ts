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
  await initKafka();

  const port = process.env.PORT || 3000;
  server.listen(port, () => console.log(`Server listening on ${port}`));
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
