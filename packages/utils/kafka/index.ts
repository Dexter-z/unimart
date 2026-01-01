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
console.log('KAFKA_BROKER (raw):', typeof process.env.KAFKA_BROKER, JSON.stringify(process.env.KAFKA_BROKER));
console.log('KAFKA_USERNAME:', process.env.KAFKA_USERNAME);
console.log('KAFKA_PASSWORD:', process.env.KAFKA_PASSWORD ? '***' : undefined);
console.log('KAFKA_SSL_CA_PATH:', process.env.KAFKA_SSL_CA_PATH);
console.log('-----------------------');

// Validate and normalize brokers
const rawBroker = process.env.KAFKA_BROKER || '';
let brokers: string[] = [];
try {
  // show hidden characters length to help debug CR/LF issues
  console.log('KAFKA_BROKER length:', rawBroker.length);
  brokers = rawBroker
    .split(',')
    .map(b => b.trim())
    .filter(Boolean)
    .map(b => {
      // Keep original for error messages
      const original = b;
      const parts = b.split(':');
      if (parts.length !== 2) throw new Error(`Invalid broker format (expected host:port): "${original}"`);
      const host = parts[0].trim();
      // remove any non-digit characters from port string (helps with hidden chars)
      const portStr = parts[1].replace(/[^0-9]/g, '');
      const port = Number(portStr);
      if (Number.isNaN(port) || port < 0 || port > 65535) throw new Error(`Invalid port for broker "${original}": ${parts[1]}`);
      return `${host}:${port}`;
    });
  console.log('KAFKA_BROKERS (validated):', JSON.stringify(brokers));
} catch (err: any) {
  console.error('❌ Kafka broker parsing error:', err?.message || err);
  // rethrow so startup fails fast and logs are visible
  throw err;
}

// Load CA certificate
const caPath = process.env.KAFKA_SSL_CA_PATH || 'ca.pem';
const ca = [fs.readFileSync(path.resolve(caPath), 'utf-8')];

export const kafka = new Kafka({
  clientId: 'kafka-service',
  brokers, // validated host:port strings
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