import express from 'express';
import cors from "cors";
import proxy from "express-http-proxy";
import morgan from "morgan";
import rateLimit from 'express-rate-limit';
import swaggerUi from "swagger-ui-express";
import cookieParser from "cookie-parser";
import initializeSiteConfig from './libs/initializeSiteConfig';

const app = express();


app.use(cors({
  origin: [
        process.env.USER_UI_URL,
        process.env.SELLER_UI_URL,
        process.env.ADMIN_UI_URL
    ],
  allowedHeaders: ["Authorization", "Content-Type"],
  credentials: true
}))

app.use(morgan("dev"))
app.use(express.json({limit: "100mb"}))
app.use(express.urlencoded({limit: "100mb", extended: true}))
app.use(cookieParser())
app.set("trust proxy", 1)

//Apply rate limiter
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: (req:any) => (req.user ? 1000 : 100),
  message: {error: "Too many requests, please try again later!"},
  standardHeaders: true,
  legacyHeaders: true,
  keyGenerator: (req: any) => req.ip,
})

app.use(limiter)

app.get('/gateway-health', (req, res) => {
  res.send({ message: 'Welcome to api-gateway!' });
});

app.use("/recommendation", proxy(process.env.RECOMMENDATION_SERVICE_URL))
app.use("/logger", proxy(process.env.LOGGER_SERVICE_URL))
app.use("/chatting", proxy(process.env.CHATTING_SERVICE_URL))

app.use("/admin", proxy(process.env.ADMIN_SERVICE_URL))
app.use("/order", proxy(process.env.ORDER_SERVICE_URL))
app.use("/seller", proxy(process.env.SELLER_SERVICE_URL))
app.use("/product", proxy(process.env.PRODUCT_SERVICE_URL))
app.use("/", proxy(process.env.AUTH_SERVICE_URL))

const port = process.env.PORT || 8080;
const server = app.listen(port, () => {
  console.log(`Listening at http://localhost:${port}/api`);
  try {
    initializeSiteConfig();
    console.log("Site Config initialized successfully")
  } catch (error) {
    console.log("Failed to initialize Site Config: ", error);
  }
});
server.on('error', console.error);
