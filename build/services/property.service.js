"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getAllPropertiesService = exports.createProperty = void 0;
const property_model_1 = __importDefault(require("../models/property.model"));
const catchAsyncError_1 = require("../middleware/catchAsyncError");
// crear propiedad
exports.createProperty = (0, catchAsyncError_1.catchAsyncError)(async (data, res) => {
    const property = await property_model_1.default.create(data);
    res.status(201).json({
        success: true,
        property,
    });
});
//get all properties
const getAllPropertiesService = async (res) => {
    const properties = await property_model_1.default.find().sort({ createdAt: -1 });
    res.status(201).json({
        success: true,
        properties,
    });
};
exports.getAllPropertiesService = getAllPropertiesService;
