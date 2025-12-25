import { Kafka, logLevel } from 'kafkajs';
import fs from 'fs';
import path from 'path';

// // Suppress partitioner warning
process.env.KAFKAJS_NO_PARTITIONER_WARNING = '1';
// // Load environment variables if not already loaded
// if (!process.env.KAFKA_API_KEY || !process.env.KAFKA_API_SECRET) {
//   try {
//     const dotenv = require('dotenv');
//     const path = require('path');
//     dotenv.config({ path: path.resolve(process.cwd(), '.env') });
//   } catch (error) {
//     console.error('Failed to load .env file:', error);
//   }
// }

// export const kafka = new Kafka({
//   clientId: 'kafka-service',
//   //GET BROKER ADDRESS FROM RED PANDA WEBSITE
//   //brokers: ["d25ujkc4nva65l4a4500.any.us-east-1.mpx.prd.cloud.redpanda.com:9092"],
//   brokers: ["localhost:9092"],
//   // ssl: {},
//   // sasl: {
//   //   mechanism: 'scram-sha-256',
//   //   username: process.env.KAFKA_API_KEY!,
//   //   password: process.env.KAFKA_API_SECRET!,
//   // },
//   connectionTimeout: 60000,
//   requestTimeout: 60000,
//   retry: {
//     initialRetryTime: 2000,
//     retries: 5
//   }
// });




// Log Kafka environment variables for debugging
console.log('--- Kafka ENV DEBUG ---');
console.log('KAFKA_BROKER:', process.env.KAFKA_BROKER);
console.log('KAFKA_USERNAME:', process.env.KAFKA_USERNAME);
console.log('KAFKA_PASSWORD:', process.env.KAFKA_PASSWORD ? '***' : undefined);
console.log('KAFKA_SSL_CA_PATH:', process.env.KAFKA_SSL_CA_PATH);
console.log('-----------------------');

// Load CA certificate
const caPath = process.env.KAFKA_SSL_CA_PATH || 'ca.pem';
const ca = [fs.readFileSync(path.resolve(caPath), 'utf-8')];

export const kafka = new Kafka({
  clientId: 'kafka-service',
  brokers: [process.env.KAFKA_BROKER as string], // e.g. 'kafka-xxxx.aivencloud.com:PORT'
  ssl: {
    ca,
    rejectUnauthorized: true,
  },
  sasl: {
    mechanism: 'plain', // Aiven uses PLAIN
    username: process.env.KAFKA_USERNAME as string,
    password: process.env.KAFKA_PASSWORD as string,
  },
  logLevel: logLevel.INFO,
});