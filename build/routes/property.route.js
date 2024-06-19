"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const property_controller_1 = require("../controllers/property.controller");
const auth_1 = require("../middleware/auth");
const user_controller_1 = require("../controllers/user.controller");
const propertyRouter = express_1.default.Router();
propertyRouter.post("/createProperty", user_controller_1.updateAccessToken, auth_1.isAuthentificated, (0, auth_1.authorizeRoles)("admin"), property_controller_1.uploadProperty);
propertyRouter.put("/editProperty/:id", user_controller_1.updateAccessToken, auth_1.isAuthentificated, (0, auth_1.authorizeRoles)("admin"), property_controller_1.editProperty);
propertyRouter.get("/getProperty/:id", property_controller_1.getSingleProperty);
propertyRouter.get("/getProperties", property_controller_1.getAllProperty);
//course content
propertyRouter.put("/addQuestion", user_controller_1.updateAccessToken, auth_1.isAuthentificated, property_controller_1.addQuestion);
propertyRouter.put("/addAnswer", user_controller_1.updateAccessToken, auth_1.isAuthentificated, property_controller_1.addAnswer);
propertyRouter.get("/get-properties", user_controller_1.updateAccessToken, auth_1.isAuthentificated, (0, auth_1.authorizeRoles)("admin"), property_controller_1.getAdminAllProperties);
propertyRouter.delete("/delete-property/:id", user_controller_1.updateAccessToken, auth_1.isAuthentificated, (0, auth_1.authorizeRoles)("admin"), property_controller_1.deleteProperty);
exports.default = propertyRouter;
