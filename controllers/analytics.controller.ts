import { Request, Response, NextFunction } from "express";
import ErrorHandler from "../utils/ErrorHandler";
import { catchAsyncError } from "../middleware/catchAsyncError";
import { generateLast12MonthsData } from "../utils/analytics.generate";
import userModel from "../models/user.model";
import PropertyModel from "../models/property.model";
import OrderModel from "../models/order.model";

//get  user analytics --- oonly for admin

export const getUsersAnalitics = catchAsyncError(
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const users = await generateLast12MonthsData(userModel);
      res.status(200).json({
        succcess: true,
        users,
      });
    } catch (error: any) {
      return next(new ErrorHandler(error.message, 500));
    }
  }
);
// get products analytics --- only for admin

export const getPropertiesAnalitics = catchAsyncError(
    async (req: Request, res: Response, next: NextFunction) => {
      try {
        const properties = await generateLast12MonthsData(PropertyModel);
        res.status(200).json({
          succcess: true,
          properties,
        });
      } catch (error: any) {
        return next(new ErrorHandler(error.message, 500));
      }
    }
  );
// get order analytics ---only for admin
export const getOrdersAnalitics = catchAsyncError(
    async (req: Request, res: Response, next: NextFunction) => {
      try {
        const orders = await generateLast12MonthsData(OrderModel);
        res.status(200).json({
          succcess: true,
          orders,
        });
      } catch (error: any) {
        return next(new ErrorHandler(error.message, 500));
      }
    }
  );

