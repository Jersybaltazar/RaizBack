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

//body parser
app.use(express.json({ limit: "50mb" }));

//cookie parser
app.use(cookieParser());

// cors

app.use(cors({ origin: ["http://localhost:3000"], credentials: true }));

app.use(
  "/api/v1",
  userRouter,
  propertyRouter,
  notificationRoute,
  analyticsRouter,
  layoutRouter
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
app.use(ErrorMiddleware);
