import express from 'express';
import { authorizeRoles, isAuthentificated} from '../middleware/auth';
import { getOrdersAnalitics, getPropertiesAnalitics, getUsersAnalitics } from '../controllers/analytics.controller';
const analyticsRouter = express.Router();


analyticsRouter.get("/get-users-analytics", isAuthentificated,authorizeRoles("admin"), getUsersAnalitics);

analyticsRouter.get("/get-order-analytics", isAuthentificated,authorizeRoles("admin"), getOrdersAnalitics);

analyticsRouter.get("/get-properties-analytics", isAuthentificated,authorizeRoles("admin"), getPropertiesAnalitics);


export default analyticsRouter;
