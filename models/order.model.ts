import mongoose, { Document, Model, Schema } from "mongoose";

export interface IOrder extends Document {
  propertyId: string;
  userId: string;
  visitDate: Date;
  visitTime: string;
  
}

const orderSchema = new Schema<IOrder>(
  {
    propertyId: {
      type: String,
      required: true,
    },
    userId: {
      type: String,
      required: true,
    },
    visitDate: {
      type: Date,
      required: true,
    },
    visitTime: {
      type: String,
      required: true,
    },
   
  },
  { timestamps: true }
);

const OrderModel: Model<IOrder> = mongoose.model("Order", orderSchema);
export default OrderModel;
