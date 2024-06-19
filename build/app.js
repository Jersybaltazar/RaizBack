"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.app = void 0;
require("dotenv").config();
const express_1 = __importDefault(require("express"));
exports.app = (0, express_1.default)();
const cors_1 = __importDefault(require("cors"));
const cookie_parser_1 = __importDefault(require("cookie-parser"));
const error_1 = require("./middleware/error");
const user_route_1 = __importDefault(require("./routes/user.route"));
const property_route_1 = __importDefault(require("./routes/property.route"));
const notification_route_1 = __importDefault(require("./routes/notification.route"));
const analytics_route_1 = __importDefault(require("./routes/analytics.route"));
const layout_route_1 = __importDefault(require("./routes/layout.route"));
const order_route_1 = __importDefault(require("./routes/order.route"));
const express_rate_limit_1 = require("express-rate-limit");
//body parser
exports.app.use(express_1.default.json({ limit: "50mb" }));
//cookie parser
exports.app.use((0, cookie_parser_1.default)());
// cors
exports.app.use((0, cors_1.default)({ origin: ["http://localhost:3000"], credentials: true }));
// limite de respuesta de la API
const limiter = (0, express_rate_limit_1.rateLimit)({
    windowMs: 15 * 60 * 1000, //15minutos
    max: 100, // Limit each ip to 1000 requests per window (here, per 15minuts)
    standardHeaders: 'draft-7',
    legacyHeaders: false,
});
exports.app.use("/api/v1", user_route_1.default, property_route_1.default, notification_route_1.default, analytics_route_1.default, layout_route_1.default, order_route_1.default);
//testing Api
exports.app.get("/test", (req, res, next) => {
    res.status(200).json({
        success: true,
        message: "Testing API is workinasg.",
    });
});
// unknow ruta
exports.app.all("*", (req, res, next) => {
    const err = new Error(`Ruta ${req.originalUrl} no encontrada `);
    err.statusCode = 404;
    next(err);
});
//middleware calls
exports.app.use(limiter);
exports.app.use(error_1.ErrorMiddleware);
