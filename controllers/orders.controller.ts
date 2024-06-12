import { NextFunction, Request, Response } from "express";
import { catchAsyncError } from "../middleware/catchAsyncError";
import ErrorHandler from "../utils/ErrorHandler";
import { IOrder } from "../models/order.model";
import userModel from "../models/user.model";
import PropertyModel from "../models/property.model";
import path from "path";
import ejs from "ejs";
import sendMail from "../utils/sendMail";
import NotificationModel from "../models/notification.model";
import { newOrder } from "../services/order.service";
import {getAllOrdesService} from "../services/order.service"


//crear order de visita
export const createOrder = catchAsyncError(
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { propertyId, visit_info } = req.body as IOrder;

      const user = await userModel.findById(req.user?._id);


      const propertie = await PropertyModel.findById(propertyId);

      if (!propertie) {
        return next(new ErrorHandler("Propiedad no encontrada", 400));
      }
      const data: any = {
        propertyId: propertie._id,
        userId: user?._id,
        visit_info,
      };

      const mailData = {
        order: {
          _id: propertie._id.toString().slice(0, 6),
          name: propertie.name,
          price: propertie.price,
          date: new Date().toLocaleDateString("en-US", {
            year: "numeric",
            month: "long",
            day: "numeric",
          }),
        },
      };
      const html = await ejs.renderFile(
        path.join(__dirname, "../mails/order-confirmation.ejs"),
        { order: mailData }
      );
      try {
        if (user) {
          await sendMail({
            email: user.email,
            subject: "Confirmacion de la visita",
            template: "order-confirmation.ejs",
            data: mailData,
          });
        }
      } catch (error: any) {
        return next(new ErrorHandler(error.message, 500));
      }

      user?.properties.push(propertie?._id);
      await user?.save();

      await NotificationModel.create({
        user: user?._id,
        title: "Nueva Visita",
        message: `YOU HAve a new question in ${propertie?.name}`,
      });

      propertie.purchased ? (propertie.purchased += 1) : propertie.purchased;

      await propertie.save();

      newOrder(data, res, next);
    } catch (error: any) {
      return next(new ErrorHandler(error.message, 500));
    }
  }
);
//
export const getAllOrders = catchAsyncError(
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      getAllOrdesService(res);
    } catch (error: any) {
      return next(new ErrorHandler(error.message, 500));
    }
  }
);

//nueva visita
