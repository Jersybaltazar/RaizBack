import express  from "express";
import { authorizeRoles, isAuthentificated } from "../middleware/auth";
import { getNotifications } from "../controllers/notification.controller";
const notificationRoute = express.Router();

notificationRoute.get(
    "/get-all-notifications",
    isAuthentificated,
    authorizeRoles("admin"),
    getNotifications
);


export default notificationRoute;