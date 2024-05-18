import express from "express";
import { addAnswer, addQuestion, deleteProperty, editProperty, getAdminAllProperties, getAllProperty, getSingleProperty, uploadProperty } from "../controllers/property.controller";
import { authorizeRoles, isAuthentificated } from "../middleware/auth";
import { updateAccessToken } from "../controllers/user.controller";
const propertyRouter = express.Router();

propertyRouter.post(
  "/createProperty",
  updateAccessToken,
  isAuthentificated,
  authorizeRoles("admin"),
  uploadProperty
);
propertyRouter.put(
  "/editProperty/:id",
  isAuthentificated,
  authorizeRoles("admin"),
  editProperty
);
propertyRouter.get(
  "/getProperty/:id",
  getSingleProperty
);
propertyRouter.get(
  "/getProperties",
  getAllProperty
);

//course content
propertyRouter.put(
  "/addQuestion",
  isAuthentificated,
  addQuestion
);
propertyRouter.put(
  "/addAnswer",
  isAuthentificated,
  addAnswer
);





propertyRouter.get(
  "/get-properties",
  isAuthentificated,
  authorizeRoles("admin"),
  getAdminAllProperties
);  
propertyRouter.delete(
  "/delete-property/:id",
  isAuthentificated,
  authorizeRoles("admin"),
  deleteProperty
)
export default propertyRouter;