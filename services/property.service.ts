import { Response} from  'express';
import PropertyModel from '../models/property.model';
import { catchAsyncError } from '../middleware/catchAsyncError';

// crear propiedad
export const  createProperty = catchAsyncError(async(data:any, res:Response)=>{
    const property = await PropertyModel.create(data);
    res.status(201).json({
        success:true,
        property,
    })
})
//get all properties
export const getAllPropertiesService =async (res:Response) =>{
    const properties = await PropertyModel.find().sort({createdAt: -1});
    res.status(201).json({
        success:true,
        properties,
    });
};