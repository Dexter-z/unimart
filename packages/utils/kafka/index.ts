import { Kafka } from 'kafkajs';

export const kafka = new Kafka({
  clientId: 'kafka-sevice',
  //GET BROKER ADDRESS FROM RED PANDA WEBSITE
  brokers: ["d25ujkc4nva65l4a4500.any.us-east-1.mpx.prd.cloud.redpanda.com:9092"],
  ssl: {},
  sasl: {
    mechanism: 'scram-sha-256',
    username: process.env.KAFKA_API_KEY!,
    password: process.env.KAFKA_API_SECRET!,
  }
});