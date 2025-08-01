import { kafka } from "@packages/utils/kafka";
import { updateUserAnalytics } from "./services/analytics.service";

const consumer = kafka.consumer({ 
  groupId: 'user-events-group',
  sessionTimeout: 30000,
  heartbeatInterval: 3000,
  maxWaitTimeInMs: 5000
});

const eventQueue: any[] = [];

const processQueue = async () => {
  if (eventQueue.length === 0) {
    return;
  }
  
  console.log(`📦 Processing ${eventQueue.length} events...`);
  const events = [...eventQueue]

  eventQueue.length = 0;

  for(const event of events){
    console.log(`⚡ Processing event: ${event.action} for user: ${event.userId}`);
    
    if(event.action === "shop_visit"){
      //Update shop visitor analytics
      console.log('🏪 Shop visit event - skipping for now');
      continue;
    }

    const validActions = [
      "add_to_wishlist",
      "add_to_cart",
      "product_view",
      "remove_from_wishlist",
      "remove_from_cart"
    ];

    if(!event.action || !validActions.includes(event.action)){
      console.log(`⚠️ Invalid action: ${event.action}, skipping`);
      continue;
    }

    try {
      await updateUserAnalytics(event);
      console.log(`✅ Successfully processed ${event.action} for user ${event.userId}`);
    } catch (error: any) {
      console.error("❌ Error processing event:", error?.message || error);
      console.error("📋 Event data:", event);
    }
  }
}

setInterval(processQueue, 3000); //Every 3 seconds

//kafka consumer for user events
export const consumeKafkaMessages = async () => {
  try {
    console.log('🔌 Connecting to Kafka...');
    await consumer.connect();
    console.log('✅ Connected to Kafka successfully');
    
    console.log('📡 Subscribing to users-events topic...');
    await consumer.subscribe({ topic: 'users-events', fromBeginning: false });
    console.log('✅ Subscribed to users-events topic');
    
    console.log('🎧 Starting to consume messages...');
    await consumer.run({
      eachMessage: async({message}) => {
        if(!message.value){
          console.log('⚠️ Received empty message');
          return;
        }
        try {
          const event = JSON.parse(message.value.toString());
          console.log('📨 Received Kafka event:', event);
          eventQueue.push(event);
          console.log(`📦 Event added to queue (${eventQueue.length} total)`);
        } catch (parseError: any) {
          console.error('❌ Failed to parse message:', parseError?.message);
        }
      }
    });
  } catch (error: any) {
    console.error('❌ Kafka connection error:', error?.message || error);
    
    // Close the consumer properly before retrying
    try {
      await consumer.disconnect();
    } catch (disconnectError) {
      // Ignore disconnect errors
    }
    
    console.log('🔄 Retrying connection in 10 seconds...');
    setTimeout(() => {
      consumeKafkaMessages();
    }, 10000);
  }
}

// Handle graceful shutdown
process.on('SIGTERM', async () => {
  console.log('📴 Shutting down Kafka consumer...');
  try {
    await consumer.disconnect();
    console.log('✅ Kafka consumer disconnected');
  } catch (error) {
    console.error('❌ Error disconnecting:', error);
  }
  process.exit(0);
});

process.on('SIGINT', async () => {
  console.log('📴 Shutting down Kafka consumer...');
  try {
    await consumer.disconnect();
    console.log('✅ Kafka consumer disconnected');
  } catch (error) {
    console.error('❌ Error disconnecting:', error);
  }
  process.exit(0);
});

console.log('🚀 Starting Kafka service...');
consumeKafkaMessages().catch(console.error);