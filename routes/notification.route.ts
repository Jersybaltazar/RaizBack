import express  from "express";
import { authorizeRoles, isAuthentificated } from "../middleware/auth";
import { getNotifications, updateNotification } from "../controllers/notification.controller";
const notificationRoute = express.Router();

notificationRoute.get(
    "/get-all-notifications",
    isAuthentificated,
    authorizeRoles("admin"),
    getNotifications
);
notificationRoute.put(
    "/update-notification/:id",
    isAuthentificated,
    authorizeRoles("admin"),
    updateNotification
);



export default notificationRoute;