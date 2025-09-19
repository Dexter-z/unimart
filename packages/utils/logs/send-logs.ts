import { kafka } from "../kafka";

const producer = kafka.producer();

type LogProps = {
    type?: "info" | "error" | "warning" | "debug" | "success";
    message: string;
    source?: string;
};

export async function sendLogs({type= "info", message, source= "unknown-service"}:LogProps){
    const logPayload= {
        type,
        message,
        source,
        timestamp: new Date().toISOString(),
    }
    await producer.connect();
    await producer.send({
        topic: "logs",
        messages: [
            { value: JSON.stringify(logPayload) },
        ],
    });
    await producer.disconnect();
}