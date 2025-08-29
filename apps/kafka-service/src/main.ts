import { kafka } from "@packages/utils/kafka";
import { updateUserAnalytics } from "./services/analytics.service";

// console.log('📚 Imports loaded successfully');
// console.log('⚙️ Creating consumer...');

const consumer = kafka.consumer({ 
  groupId: 'user-events-group'
});

const eventQueue: any[] = [];

const processQueue = async () => {
  // console.log('🔄 processQueue called, eventQueue length:', eventQueue.length);
  
  if (eventQueue.length === 0) {
    return;
  }
  
  // console.log(`📦 Processing ${eventQueue.length} events...`);
  const events = [...eventQueue]

  eventQueue.length = 0;

  for(const event of events){
    // console.log(`⚡ Processing event: ${event.action} for user: ${event.userId}`);
    
    if(event.action === "shop_visit"){
      //Update shop visitor analytics
      // console.log('🏪 Shop visit event - skipping for now');
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
      // console.log(`⚠️ Invalid action: ${event.action}, skipping`);
      continue;
    }

    try {
      // console.log(`🔄 About to call updateUserAnalytics with:`, event);
      await updateUserAnalytics(event);
      // console.log(`✅ Successfully processed ${event.action} for user ${event.userId}`);
    } catch (error: any) {
      // console.error("❌ Error processing event:", error?.message || error);
      // console.error("📋 Full error stack:", error?.stack);
      // console.error("📋 Event data:", event);
    }
  }
}

setInterval(processQueue, 3000); //Every 3 seconds

// Add a heartbeat log every 30 seconds to show service is alive
// setInterval(() => {
//   console.log(`💓 Kafka service alive - Queue: ${eventQueue.length} events`);
// }, 30000);

//kafka consumer for user events
export const consumeKafkaMessages = async () => {
  try {
    // console.log('🔌 Connecting to Kafka consumer...');
    await consumer.connect();
    // console.log('✅ Consumer connected successfully');
    
    // console.log('📡 Subscribing to users-events topic...');
    await consumer.subscribe({ topic: 'users-events', fromBeginning: false });
    // console.log('✅ Subscribed to users-events topic');
    
    // console.log('🎧 Starting to consume messages...');
    await consumer.run({
      eachMessage: async({ topic, partition, message }) => {
        if(!message.value){
          // console.log('⚠️ Received empty message');
          return;
        }
        
        try {
          const event = JSON.parse(message.value.toString());
          // console.log('📨 Received Kafka event:', { topic, partition, event });
          eventQueue.push(event);
          // console.log(`📦 Event added to queue (${eventQueue.length} total)`);
        } catch (parseError: any) {
          // console.error('❌ Failed to parse message:', parseError?.message);
          // console.error('❌ Raw message:', message.value?.toString());
        }
      }
    });
  } catch (error: any) {
    // console.error('❌ Kafka consumer error:', error?.message || error);
    // console.error('❌ Full error stack:', error?.stack);
    
    // Retry connection after 10 seconds
    // console.log('🔄 Retrying connection in 10 seconds...');
    setTimeout(() => {
      consumeKafkaMessages().catch(console.error);
    }, 10000);
  }
}

// Handle graceful shutdown
process.on('SIGTERM', async () => {
  // console.log('📴 Shutting down Kafka consumer...');
  try {
    await consumer.disconnect();
    // console.log('✅ Kafka consumer disconnected');
  } catch (error) {
    // console.error('❌ Error disconnecting:', error);
  }
  process.exit(0);
});

process.on('SIGINT', async () => {
  // console.log('📴 Shutting down Kafka consumer...');
  try {
    await consumer.disconnect();
    // console.log('✅ Kafka consumer disconnected');
  } catch (error) {
    // console.error('❌ Error disconnecting:', error);
  }
  process.exit(0);
});

// console.log('🚀 Starting Kafka service...');
// console.log('🌍 Environment check:');
// console.log('- NODE_ENV:', process.env.NODE_ENV || 'not set');
// console.log('- KAFKA_API_KEY:', process.env.KAFKA_API_KEY ? `✅ Set (${process.env.KAFKA_API_KEY})` : '❌ Missing');
// console.log('- KAFKA_API_SECRET:', process.env.KAFKA_API_SECRET ? `✅ Set (${process.env.KAFKA_API_SECRET?.substring(0,10)}...)` : '❌ Missing');
// console.log('- DATABASE_URL:', process.env.DATABASE_URL ? '✅ Set' : '❌ Missing');
consumeKafkaMessages().catch(console.error);