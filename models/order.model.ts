import mongoose, { Document, Model, Schema } from "mongoose";

export interface IOrder extends Document {
  propertyId: string;
  userId: string;
  visit_info: object;
  
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
    visit_info: {
      type: Object,
    },
   
  },
  { timestamps: true }
);

const OrderModel: Model<IOrder> = mongoose.model("Order", orderSchema);
export default OrderModel;
