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
let rawBroker = process.env.KAFKA_BROKER || '';
// Remove surrounding quotes if someone set the var as "host:port" or 'host:port'
rawBroker = rawBroker.replace(/^["']+|["']+$/g, '');
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
      // strip quotes from each segment
      b = b.replace(/^["']+|["']+$/g, '');
      const parts = b.split(':');
      if (parts.length !== 2) throw new Error(`Invalid broker format (expected host:port): "${original}"`);
      const host = parts[0].trim().replace(/^["']+|["']+$/g, '');
      // remove any non-digit characters from port string (helps with hidden chars)
      const portStr = parts[1].trim().replace(/^["']+|["']+$/g, '').replace(/[^0-9]/g, '');
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
// Use embedded CA or fallback to file
const EMBEDDED_CA = process.env.KAFKA_CA_CERT; // optional: set full cert as env var
let ca: string[] = [];

if (EMBEDDED_CA) {
  console.log('Using embedded CA from KAFKA_CA_CERT env var');
  ca = [EMBEDDED_CA];
} else {
  const caPath = process.env.KAFKA_SSL_CA_PATH || 'ca.pem';
  const resolvedCaPath = path.resolve(caPath);
  console.log('KAFKA_SSL_CA_PATH (resolved):', resolvedCaPath);
  try {
    const exists = fs.existsSync(resolvedCaPath);
    console.log('CA file exists:', exists);
    if (!exists) {
      console.error(`CA file not found at ${resolvedCaPath}. Ensure KAFKA_SSL_CA_PATH points to the mounted secret file.`);
      throw new Error('CA file not found');
    }

    const caContent = fs.readFileSync(resolvedCaPath, 'utf-8');
    console.log('CA file length:', caContent.length);
    console.log('CA startsWith BEGIN CERTIFICATE:', caContent.trim().startsWith('-----BEGIN CERTIFICATE-----'));
    ca = [caContent];
  } catch (err:any) {
    console.error('❌ Error loading CA file:', err?.message || err);
    throw err;
  }
}

export const kafka = new Kafka({
  clientId: 'kafka-service',
  brokers, // validated host:port strings
  ssl: {
    ca,
    rejectUnauthorized: process.env.NODE_TLS_REJECT_UNAUTHORIZED !== '0',
  },
  sasl: {
    mechanism: 'plain', // Aiven uses PLAIN
    username: process.env.KAFKA_USERNAME as string,
    password: process.env.KAFKA_PASSWORD as string,
  },
  logLevel: logLevel.INFO,
});