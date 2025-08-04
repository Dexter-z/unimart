"use server"

// TODO: Add kafka tracking implementation
import { kafka } from "@packages/utils/kafka";

// Create a singleton producer that stays connected
let producer: any = null;
let producerConnected = false;

const getProducer = async () => {
    if (!producer) {
        producer = kafka.producer();
    }
    
    if (!producerConnected) {
        try {
            await producer.connect();
            producerConnected = true;
            console.log('✅ Producer connected successfully');
        } catch (error) {
            console.error('❌ Failed to connect producer:', error);
            throw error;
        }
    }
    
    return producer;
};

export async function sendKafkaEvent(eventData: {
    userId?: string;
    productId?: string;
    shopId?: string;
    action: string;
    country?: string;
    city?: string;
    device?: string;
}) {
    try {
        const activeProducer = await getProducer();
        await activeProducer.send({
            topic: 'users-events',
            messages: [{value: JSON.stringify(eventData)}]
        });
        console.log('📤 Event sent successfully:', eventData.action);
    } catch (error) {
        console.error("❌ Error sending Kafka event", error);
        // Reset connection state on error so it will reconnect next time
        producerConnected = false;
    }
}
