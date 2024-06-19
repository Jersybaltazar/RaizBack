"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getAllOrders = exports.createOrder = void 0;
const catchAsyncError_1 = require("../middleware/catchAsyncError");
const ErrorHandler_1 = __importDefault(require("../utils/ErrorHandler"));
const user_model_1 = __importDefault(require("../models/user.model"));
const property_model_1 = __importDefault(require("../models/property.model"));
const path_1 = __importDefault(require("path"));
const ejs_1 = __importDefault(require("ejs"));
const sendMail_1 = __importDefault(require("../utils/sendMail"));
const notification_model_1 = __importDefault(require("../models/notification.model"));
const order_service_1 = require("../services/order.service");
const order_service_2 = require("../services/order.service");
//crear order de visita
exports.createOrder = (0, catchAsyncError_1.catchAsyncError)(async (req, res, next) => {
    try {
        const { propertyId, visitDate, visitTime } = req.body;
        const user = await user_model_1.default.findById(req.user?._id);
        if (!user) {
            return next(new ErrorHandler_1.default("Usuario no encontrado", 400));
        }
        const propertieExistInUser = user?.properties.some((propertie) => propertie._id.toString() === propertyId);
        if (propertieExistInUser) {
            return next(new ErrorHandler_1.default("Ya visitaste esta propiedad", 400));
        }
        const propertie = await property_model_1.default.findById(propertyId);
        if (!propertie) {
            return next(new ErrorHandler_1.default("Propiedad no encontrada", 400));
        }
        const data = {
            propertyId: propertie._id,
            userId: user?._id,
            visitDate,
            visitTime,
        };
        const mailData = {
            order: {
                _id: propertie._id.toString().slice(0, 6),
                name: propertie.name,
                date: new Date(visitDate).toLocaleDateString("en-US", {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                }),
                time: visitTime
            },
        };
        const html = await ejs_1.default.renderFile(path_1.default.join(__dirname, "../mails/order-confirmation.ejs"), { order: mailData });
        try {
            if (user) {
                await (0, sendMail_1.default)({
                    email: user.email,
                    subject: "Confirmacion de la visita",
                    template: "order-confirmation.ejs",
                    data: mailData,
                });
            }
        }
        catch (error) {
            return next(new ErrorHandler_1.default(error.message, 500));
        }
        user?.properties.push(propertie?._id);
        await user?.save();
        await notification_model_1.default.create({
            user: user?._id,
            title: "Nueva Visita",
            message: `YOU HAve a new question in ${propertie?.name}`,
        });
        propertie.purchased ? (propertie.purchased += 1) : propertie.purchased;
        await propertie.save();
        (0, order_service_1.newOrder)(data, res, next);
    }
    catch (error) {
        return next(new ErrorHandler_1.default(error.message, 500));
    }
});
//
exports.getAllOrders = (0, catchAsyncError_1.catchAsyncError)(async (req, res, next) => {
    try {
        (0, order_service_2.getAllOrdesService)(res);
    }
    catch (error) {
        return next(new ErrorHandler_1.default(error.message, 500));
    }
});
//nueva visita
