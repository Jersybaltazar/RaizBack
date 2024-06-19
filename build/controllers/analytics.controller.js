"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getOrdersAnalitics = exports.getPropertiesAnalitics = exports.getUsersAnalitics = void 0;
const ErrorHandler_1 = __importDefault(require("../utils/ErrorHandler"));
const catchAsyncError_1 = require("../middleware/catchAsyncError");
const analytics_generate_1 = require("../utils/analytics.generate");
const user_model_1 = __importDefault(require("../models/user.model"));
const property_model_1 = __importDefault(require("../models/property.model"));
const order_model_1 = __importDefault(require("../models/order.model"));
//get  user analytics --- oonly for admin
exports.getUsersAnalitics = (0, catchAsyncError_1.catchAsyncError)(async (req, res, next) => {
    try {
        const users = await (0, analytics_generate_1.generateLast12MonthsData)(user_model_1.default);
        res.status(200).json({
            succcess: true,
            users,
        });
    }
    catch (error) {
        return next(new ErrorHandler_1.default(error.message, 500));
    }
});
// get products analytics --- only for admin
exports.getPropertiesAnalitics = (0, catchAsyncError_1.catchAsyncError)(async (req, res, next) => {
    try {
        const properties = await (0, analytics_generate_1.generateLast12MonthsData)(property_model_1.default);
        res.status(200).json({
            succcess: true,
            properties,
        });
    }
    catch (error) {
        return next(new ErrorHandler_1.default(error.message, 500));
    }
});
// get order analytics ---only for admin
exports.getOrdersAnalitics = (0, catchAsyncError_1.catchAsyncError)(async (req, res, next) => {
    try {
        const orders = await (0, analytics_generate_1.generateLast12MonthsData)(order_model_1.default);
        res.status(200).json({
            succcess: true,
            orders,
        });
    }
    catch (error) {
        return next(new ErrorHandler_1.default(error.message, 500));
    }
});
