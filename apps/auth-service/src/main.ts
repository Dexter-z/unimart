import express from 'express';
import cors from "cors"
import { errorMiddleware } from '@packages/error-handler/error-middleware';
import cookieParser from 'cookie-parser';
import router from './routes/auth.router';
import swaggerUi from 'swagger-ui-express';
const swaggerDocument = require('./swagger-output.json'); // Adjust the path as necessary

const app = express();

app.use(cors({
    origin: [
        "http://localhost:3000",
        "http://localhost:3001",
        "http://localhost:3002",
        "http://192.168.250.215:3000"
    ],
    allowedHeaders: ["Authorization", "Content-Type"],
    credentials: true
}))

// Increase payload limit for image uploads
app.use(express.json({ limit: '10mb' }))
app.use(express.urlencoded({ extended: true, limit: '10mb' }))
app.use(cookieParser())

app.get('/', (req, res) => {
    res.send({ 'message': 'Hello API'});
});

app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerDocument));
app.get("/docs-json", (req, res) => {
    res.json(swaggerDocument);
})


//Routes
app.use("/api", router)

app.use(errorMiddleware)

const port = process.env.PORT || 6001
const host = process.env.AUTH_URL || "http://localhost"
const server = app.listen(port, () => {
    console.log(`Auth service is running at ${host}:${port}/api`)
    console.log(`Swagger Docs is available at ${host}:${port}/docs`)
})

server.on("error", (err) => {
    console.log("Server error: ", err)
})
