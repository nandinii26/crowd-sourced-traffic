"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.kafkaProducer = void 0;
exports.initKafka = initKafka;
exports.sendMessage = sendMessage;
const kafkajs_1 = require("kafkajs");
const kafka = new kafkajs_1.Kafka({ clientId: 'crowd-traffic-backend', brokers: [process.env.KAFKA_BROKER || 'localhost:9092'] });
exports.kafkaProducer = kafka.producer();
let _connected = false;
async function initKafka() {
    if (_connected)
        return;
    await exports.kafkaProducer.connect();
    _connected = true;
    console.log('Kafka producer connected');
}
async function sendMessage(topic, messages) {
    if (!_connected) {
        try {
            await exports.kafkaProducer.connect();
            _connected = true;
            console.log('Kafka producer connected (lazy)');
        }
        catch (err) {
            console.error('Failed to connect kafka producer', err);
            throw err;
        }
    }
    return exports.kafkaProducer.send({ topic, messages });
}
