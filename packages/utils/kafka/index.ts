import { Kafka } from 'kafkajs';

// Suppress partitioner warning
process.env.KAFKAJS_NO_PARTITIONER_WARNING = '1';

export const kafka = new Kafka({
  clientId: 'kafka-service',
  //GET BROKER ADDRESS FROM RED PANDA WEBSITE
  brokers: ["d25ujkc4nva65l4a4500.any.us-east-1.mpx.prd.cloud.redpanda.com:9092"],
  ssl: true,
  sasl: {
    mechanism: 'scram-sha-256',
    username: process.env.KAFKA_API_KEY!,
    password: process.env.KAFKA_API_SECRET!,
  },
  connectionTimeout: 30000,
  requestTimeout: 30000,
  retry: {
    initialRetryTime: 1000,
    retries: 8
  }
});