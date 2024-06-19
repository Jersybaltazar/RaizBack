"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const auth_1 = require("../middleware/auth");
const orders_controller_1 = require("../controllers/orders.controller");
const orderRouter = express_1.default.Router();
orderRouter.post("/create-order", auth_1.isAuthentificated, orders_controller_1.createOrder);
orderRouter.get("/get-orders", auth_1.isAuthentificated, (0, auth_1.authorizeRoles)("admin"), orders_controller_1.getAllOrders);
exports.default = orderRouter;
