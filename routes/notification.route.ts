import express  from "express";
import { authorizeRoles, isAuthentificated } from "../middleware/auth";
import { getNotifications, updateNotification } from "../controllers/notification.controller";
import { updateAccessToken } from "../controllers/user.controller";
const notificationRoute = express.Router();

notificationRoute.get(
    "/get-all-notifications",
    updateAccessToken,
    isAuthentificated,
    authorizeRoles("admin"),
    getNotifications
);
notificationRoute.put(
    "/update-notification/:id",
    updateAccessToken,
    isAuthentificated,
    authorizeRoles("admin"),
    updateNotification
);



export default notificationRoute;