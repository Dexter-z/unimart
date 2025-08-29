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

        await prisma.message.createMany({
            data: prismaPayload,
        });

        //Redis unseen counter only if db insert was successfull
        for (const msg of prismaPayload) {
            const receiverType = msg.senderType === "user" ? "seller" : "user";
            await incrementUnseenCount(receiverType, msg.conversationId);
        }

        console.log(`Flushed ${prismaPayload.length} messages to DB and updated unseen counts.`);

    } catch (error) {
        console.error("Error flushing buffer to DB:", error);

        buffer.unshift(...toInsert); //Re-add to start of buffer if failed

        if(!flushTimer){
            flushTimer = setTimeout(flushBufferToDb, BATCH_INTERVAL_MS);
        }
    }
}