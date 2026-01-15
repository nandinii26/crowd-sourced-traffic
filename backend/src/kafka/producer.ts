import { Kafka } from 'kafkajs';

type KafkaMessage = {
  key?: string | Buffer | null;
  value?: string | Buffer | null;
  headers?: { [key: string]: unknown } | undefined;
};

const kafka = new Kafka({ clientId: 'crowd-traffic-backend', brokers: [process.env.KAFKA_BROKER || 'localhost:9092'] });
export const kafkaProducer = kafka.producer();

let _connected = false;

export async function initKafka() {
  if (_connected) return;
  await kafkaProducer.connect();
  _connected = true;
  console.log('Kafka producer connected');
}

export async function sendMessage(topic: string, messages: KafkaMessage[]) {
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
