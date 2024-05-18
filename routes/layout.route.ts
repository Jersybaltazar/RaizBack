import express from 'express';
import { authorizeRoles, isAuthentificated} from '../middleware/auth';
import { createLayout, editLayout, getLayoutByType } from '../controllers/layout.controller';
const layoutRouter = express.Router();

layoutRouter.post("/create-layout", isAuthentificated, authorizeRoles("admin"), createLayout);

layoutRouter.put("/edit-layout", isAuthentificated, authorizeRoles("admin"), editLayout);

layoutRouter.get("/get-layout/:type" , getLayoutByType);

export default layoutRouter;
