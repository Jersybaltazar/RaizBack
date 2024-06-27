import express from 'express';
import { authorizeRoles, isAuthentificated} from '../middleware/auth';
import { createLayout, editLayout, getLayoutByType } from '../controllers/layout.controller';
import { updateAccessToken } from '../controllers/user.controller';
const layoutRouter = express.Router();

layoutRouter.post("/create-layout", updateAccessToken,isAuthentificated, authorizeRoles("admin"), createLayout);

layoutRouter.put("/edit-layout", updateAccessToken,isAuthentificated, authorizeRoles("admin"), editLayout);

layoutRouter.get("/get-layout/:type" , getLayoutByType);

export default layoutRouter;
