"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const auth_1 = require("../middleware/auth");
const analytics_controller_1 = require("../controllers/analytics.controller");
const analyticsRouter = express_1.default.Router();
analyticsRouter.get("/get-users-analytics", auth_1.isAuthentificated, (0, auth_1.authorizeRoles)("admin"), analytics_controller_1.getUsersAnalitics);
analyticsRouter.get("/get-order-analytics", auth_1.isAuthentificated, (0, auth_1.authorizeRoles)("admin"), analytics_controller_1.getOrdersAnalitics);
analyticsRouter.get("/get-properties-analytics", auth_1.isAuthentificated, (0, auth_1.authorizeRoles)("admin"), analytics_controller_1.getPropertiesAnalitics);
exports.default = analyticsRouter;
