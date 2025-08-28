import express from 'express';
import cors from "cors"
import { errorMiddleware } from '@packages/error-handler/error-middleware';
import cookieParser from 'cookie-parser';
import router from './routes/chatting.route';


const app = express();
//app.use(express.json())

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
  res.send({ message: 'Welcome to chatting-service!' });
});

//Routes
//app.use("/api", router)


const port = process.env.PORT || 6006;

//Web socket


const server = app.listen(port, () => {
  console.log(`Listening at http://localhost:${port}/api`);
});
server.on('error', console.error);
