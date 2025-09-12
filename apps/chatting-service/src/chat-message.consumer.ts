import prisma from "@packages/libs/prisma";
import { incrementUnseenCount } from "@packages/libs/redis/message.redis";
import { kafka } from "@packages/utils/kafka";
import { Consumer, EachMessagePayload } from "kafkajs";

interface BufferedMessage {
    conversationId: string;
    senderId: string;
    senderType: string;
    content: string;
    createdAt: string;
}

const TOPIC = "chat.new_message";
const GROUP_ID = "chat-message-db-writer";
const BATCH_INTERVAL_MS = 3000;

let buffer: BufferedMessage[] = [];
let flushTimer: NodeJS.Timeout | null = null;

//Initialise kafka consumer here eventually
export async function startConsumer() {
    const consumer: Consumer = kafka.consumer({ groupId: GROUP_ID });
    await consumer.connect();
    await consumer.subscribe({ topic: TOPIC, fromBeginning: false });

    console.log("Kafka consumer connected and subscribed to topic: ", TOPIC);

    await consumer.run({
        eachMessage: async ({message}: EachMessagePayload) => {
            if(!message.value){
                return
            }

            try {
                const parsed: BufferedMessage = JSON.parse(message.value.toString());
                buffer.push(parsed);

                //If this is the first message, start the timer
                if (buffer.length === 1 && !flushTimer) {
                    flushTimer = setTimeout(flushBufferToDb, BATCH_INTERVAL_MS);
                }
            } catch (error) {
                console.log("Error processing message:", error);
            }
        },
    });
}


//Flush buffer to database and reset timer
async function flushBufferToDb() {
    const toInsert = buffer.splice(0, buffer.length);

    if(flushTimer){
        clearTimeout(flushTimer);
        flushTimer = null;
    }

    if (toInsert.length === 0){
        return
    }

    try {
        const prismaPayload = toInsert.map((msg) => ({
            conversationId: msg.conversationId,
            senderId: msg.senderId,
            senderType: msg.senderType,
            content: msg.content,
            createdAt: new Date(msg.createdAt),
        }));

        const invalid = prismaPayload.filter(m => !m.senderId);
        const valid = prismaPayload.filter(m => m.senderId);

        if (invalid.length) {
            console.warn(`Skipping ${invalid.length} invalid chat messages missing senderId (conversationIds: ${invalid.map(i => i.conversationId).join(",")})`);
        }

        if (valid.length === 0) {
            console.log("No valid messages to flush after filtering; aborting createMany.");
            return;
        }

        await prisma.message.createMany({
            data: valid,
        });

        for (const msg of valid) {
            const receiverType = msg.senderType === "user" ? "seller" : "user";
            await incrementUnseenCount(receiverType, msg.conversationId);
        }

        console.log(`Flushed ${valid.length} messages to DB (filtered ${invalid.length}) and updated unseen counts.`);

    } catch (error) {
        console.error("Error flushing buffer to DB:", error);

    // Requeue only the original batch so we attempt again; however if failures were due to validation we already filtered.
    buffer.unshift(...toInsert);

        if(!flushTimer){
            flushTimer = setTimeout(flushBufferToDb, BATCH_INTERVAL_MS);
        }
    }
}