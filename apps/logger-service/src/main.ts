import express from 'express';
import cors from "cors"
import { errorMiddleware } from '@packages/error-handler/error-middleware';
import cookieParser from 'cookie-parser';
import router from './routes/logger.route';
import WebSocket from "ws";
import http from "http"
import { consumeKafkaMessages } from './logger-consumer';


const app = express();

const wsServer = new WebSocket.Server({ noServer: true })
export const clients = new Set<WebSocket>();

wsServer.on("connection", (ws) => {
  console.log("New Logger client connected");
  clients.add(ws);

  ws.on("close", () => {
    console.log("Logger client disconnected");
    clients.delete(ws);
  });
})


app.use(cors({
  origin: [
    "http://localhost:3000",
    "http://localhost:3001",
    "http://192.168.250.215:3000"
  ],
  allowedHeaders: ["Authorization", "Content-Type"],
  credentials: true
}))

// Increase payload limit for image uploads
app.use(express.json({ limit: '10mb' }))
app.use(express.urlencoded({ extended: true, limit: '10mb' }))
app.use(cookieParser())
app.use(errorMiddleware)



app.get('/', (req, res) => {
  res.send({ message: 'Welcome to logger-service!' });
});

//Routes
app.use("/api", router)

const port = process.env.PORT || 6007;

const server = http.createServer(app);

server.on("upgrade", (request, socket, head) => {
  wsServer.handleUpgrade(request, socket, head, (ws) => {
    wsServer.emit("connection", ws, request);
  });
});

server.listen(port, () => {
  console.log(`Logger service is running at http://localhost:${port}/api`)
})


//Start kafka consumer
consumeKafkaMessages();