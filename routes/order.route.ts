import express from 'express';
import { authorizeRoles, isAuthentificated} from '../middleware/auth';
import { createOrder, getAllOrders } from '../controllers/orders.controller';
import { updateAccessToken } from '../controllers/user.controller';
const orderRouter = express.Router();

orderRouter.post("/create-order", isAuthentificated, createOrder);
orderRouter.get("/get-orders", updateAccessToken,isAuthentificated,authorizeRoles("admin"), getAllOrders);

export default orderRouter;