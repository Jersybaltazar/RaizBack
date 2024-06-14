import { NextFunction, Response } from "express";
import OrderModel from "../models/order.model";
import { catchAsyncError } from "../middleware/catchAsyncError";
//create new order
export const newOrder = catchAsyncError(
  async (data: any , res: Response) => {
    const order = await OrderModel.create(data);

    res.status(201).json({
      success: true,
      order,
    });
  }
);

//get all Orders
export const getAllOrdesService = async( res:Response) => {
    const orders = await OrderModel.find().sort({createdAt: -1});
    res.status(201).json({
        success:true,
        orders,
    });
};