"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const http_1 = __importDefault(require("http"));
const socket_io_1 = require("socket.io");
const ingest_1 = __importDefault(require("./routes/ingest"));
const producer_1 = require("./kafka/producer");
const db_1 = require("./db");
async function main() {
    const app = (0, express_1.default)();
    app.use(express_1.default.json());
    app.use('/ingest', ingest_1.default);
    const server = http_1.default.createServer(app);
    const io = new socket_io_1.Server(server, { cors: { origin: '*' } });
    io.on('connection', (socket) => {
        console.log('client connected', socket.id);
    });
    await (0, db_1.initDb)();
    await (0, producer_1.initKafka)();
    const port = process.env.PORT || 3000;
    server.listen(port, () => console.log(`Server listening on ${port}`));
}
main().catch((err) => {
    console.error(err);
    process.exit(1);
});
