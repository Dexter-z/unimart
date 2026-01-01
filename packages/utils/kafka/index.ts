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
// Use different broker port for client cert auth if specified
if (fs.existsSync(path.resolve(process.env.KAFKA_CLIENT_CERT_PATH || 'service.cert')) && 
    process.env.KAFKA_BROKER_CLIENT_CERT) {
  rawBroker = process.env.KAFKA_BROKER_CLIENT_CERT;
  console.log('Using client cert broker port');
}
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
// Load certificate files
const caPath = process.env.KAFKA_SSL_CA_PATH || 'ca.pem';
const clientCertPath = process.env.KAFKA_CLIENT_CERT_PATH || 'service.cert';
const clientKeyPath = process.env.KAFKA_CLIENT_KEY_PATH || 'service.key';

const resolvedCaPath = path.resolve(caPath);
const resolvedCertPath = path.resolve(clientCertPath);
const resolvedKeyPath = path.resolve(clientKeyPath);

console.log('KAFKA_SSL_CA_PATH (resolved):', resolvedCaPath);
console.log('KAFKA_CLIENT_CERT_PATH (resolved):', resolvedCertPath);
console.log('KAFKA_CLIENT_KEY_PATH (resolved):', resolvedKeyPath);

let ca: string[] = [];
let clientCert: string[] | undefined;
let clientKey: string[] | undefined;

// Load CA certificate
try {
  const caExists = fs.existsSync(resolvedCaPath);
  console.log('CA file exists:', caExists);
  if (caExists) {
    const caContent = fs.readFileSync(resolvedCaPath, 'utf-8');
    console.log('CA file length:', caContent.length);
    ca = [caContent];
  }
} catch (err: any) {
  console.error('❌ Error loading CA file:', err?.message || err);
}

// Load client certificate and key (for client cert auth)
const useClientCerts = fs.existsSync(resolvedCertPath) && fs.existsSync(resolvedKeyPath);
console.log('Using client certificate auth:', useClientCerts);

if (useClientCerts) {
  try {
    const certContent = fs.readFileSync(resolvedCertPath, 'utf-8');
    const keyContent = fs.readFileSync(resolvedKeyPath, 'utf-8');
    console.log('Client cert length:', certContent.length);
    console.log('Client key length:', keyContent.length);
    clientCert = [certContent];
    clientKey = [keyContent];
  } catch (err: any) {
    console.error('❌ Error loading client cert/key:', err?.message || err);
  }
}

export const kafka = new Kafka({
  clientId: 'kafka-service',
  brokers, // validated host:port strings
  ssl: useClientCerts ? {
    ca,
    cert: clientCert,
    key: clientKey,
    rejectUnauthorized: true,
  } : {
    ca: ca.length > 0 ? ca : undefined,
    rejectUnauthorized: false, // Disabled for SASL - CA chain issue
  },
  sasl: useClientCerts ? undefined : {
    mechanism: 'plain',
    username: process.env.KAFKA_USERNAME as string,
    password: process.env.KAFKA_PASSWORD as string,
  },
  logLevel: logLevel.INFO,
});