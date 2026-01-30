import { Kafka, Message, Producer } from 'kafkajs';

const kafka = new Kafka({ clientId: 'crowd-traffic-backend', brokers: [process.env.KAFKA_BROKER || 'localhost:9092'] });
export const kafkaProducer: Producer = kafka.producer();

let _connected = false;

export async function initKafka(): Promise<void> {
  if (_connected) return;
  try {
    await kafkaProducer.connect();
    _connected = true;
    console.log('Kafka producer connected');
  } catch (err) {
    console.warn('Kafka producer connection failed:', err instanceof Error ? err.message : err);
    throw err;
  }
}

export async function sendMessage(topic: string, messages: Message[]) {
  if (!_connected) {
    try {
      await kafkaProducer.connect();
      _connected = true;
      console.log('Kafka producer connected (lazy)');
    } catch (err) {
      console.error('Failed to connect kafka producer', err);
      throw err;
    }
  }
  return kafkaProducer.send({ topic, messages });
}
