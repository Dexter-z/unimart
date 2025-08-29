import { Kafka } from 'kafkajs';

// Suppress partitioner warning
process.env.KAFKAJS_NO_PARTITIONER_WARNING = '1';

// Load environment variables if not already loaded
if (!process.env.KAFKA_API_KEY || !process.env.KAFKA_API_SECRET) {
  try {
    const dotenv = require('dotenv');
    const path = require('path');
    dotenv.config({ path: path.resolve(process.cwd(), '.env') });
  } catch (error) {
    console.error('Failed to load .env file:', error);
  }
}

export const kafka = new Kafka({
  clientId: 'kafka-service',
  //GET BROKER ADDRESS FROM RED PANDA WEBSITE
  //brokers: ["d25ujkc4nva65l4a4500.any.us-east-1.mpx.prd.cloud.redpanda.com:9092"],
  brokers: ["localhost:9092"],
  // ssl: {},
  // sasl: {
  //   mechanism: 'scram-sha-256',
  //   username: process.env.KAFKA_API_KEY!,
  //   password: process.env.KAFKA_API_SECRET!,
  // },
  connectionTimeout: 60000,
  requestTimeout: 60000,
  retry: {
    initialRetryTime: 2000,
    retries: 5
  }
});