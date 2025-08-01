"use server"

// TODO: Add kafka tracking implementation
import { kafka } from "@packages/utils/kafka";

// TODO: Initialize producer when needed
const producer = kafka.producer();

export  async function sendKafkaEvent(eventData: {
    userId?: string;
    productId?: string;
    shopId?: string;
    action: string;
    country?: string;
    city?: string;
    device?: string;
}) {
    try {
        await producer.connect();
        await producer.send({
            topic: 'users-events',
            messages: [{value: JSON.stringify(eventData)}]
        })
    } catch (error) {
        console.error("Error sending Kafka event", error);
        
    } finally{
        await producer.disconnect();
    }
}
