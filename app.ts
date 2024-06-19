require("dotenv").config();
import express, { NextFunction, Request, Response } from "express";
export const app = express();
import cors from "cors";
import cookieParser from "cookie-parser";
import { ErrorMiddleware } from "./middleware/error";
import userRouter from "./routes/user.route";
import propertyRouter from "./routes/property.route";
import notificationRoute from "./routes/notification.route";
import analyticsRouter from "./routes/analytics.route";
import layoutRouter from "./routes/layout.route";
import orderRouter from "./routes/order.route";
import { rateLimit } from "express-rate-limit";
//body parser
app.use(express.json({ limit: "50mb" }));

//cookie parser
app.use(cookieParser());

// Configuración de CORS
// Configuración de CORS
app.use(cors({ origin: "https://raiz-front.vercel.app", credentials: true }));

// Configuración de cabeceras CORS adicionales
app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "https://raiz-front.vercel.app");
  res.header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept, Authorization");
  res.header("Access-Control-Allow-Credentials", "true");
  next();
});
// limite de respuesta de la API
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, //15minutos
  max: 100, // Limit each ip to 1000 requests per window (here, per 15minuts)
  standardHeaders: "draft-7",
  legacyHeaders: false,
});
app.use(limiter);
app.use(
  "/api/v1",
  userRouter,
  propertyRouter,
  notificationRoute,
  analyticsRouter,
  layoutRouter,
  orderRouter
);

//testing Api
app.get("/test", (req: Request, res: Response, next: NextFunction) => {
  res.status(200).json({
    success: true,
    message: "Testing API is workinasg.",
  });
});
// unknow ruta
app.all("*", (req: Request, res: Response, next: NextFunction) => {
  const err = new Error(`Ruta ${req.originalUrl} no encontrada `) as any;
  err.statusCode = 404;
  next(err);
});
//middleware calls

app.use(ErrorMiddleware);
