import { NextFunction, Request, Response } from "express";
import { catchAsyncError } from "../middleware/catchAsyncError";
import ErrorHandler from "../utils/ErrorHandler";
import cloudinary from "cloudinary";
import {
  createProperty,
  getAllPropertiesService,
} from "../services/property.service";
import PropertyModel from "../models/property.model";
import mongoose from "mongoose";
import path from "path";
import sendMail from "../utils/sendMail";
import ejs from "ejs";
import { redis } from "../utils/redis";
import NotificationModel from "../models/notification.model";

// subir propiedad
export const uploadProperty = catchAsyncError(
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      // Extrae el cuerpo de la solicitud (req.body) y lo asigna a la variable `data`.
      const data = req.body;
      // Extrae la propiedad `thumbnail` del objeto `data`.
      const { thumbnail, propertyData } = data;
      // Si `thumbnail` existe, procede a subirlo a Cloudinary.
      if (thumbnail) {
        // Sube la imagen a Cloudinary dentro de la carpeta "miniatura".
        const myCloud = await cloudinary.v2.uploader.upload(thumbnail, {
          folder: "Miniatura",
        });
        //Actualiza `data.thumbnail` con el `public_id` y la `secure_url` de la imagen subida.
        data.thumbnail = {
          public_id: myCloud.public_id,
          url: myCloud.secure_url,
        };
      }
      //subir las imagenes si existen
      if (propertyData && Array.isArray(propertyData)) {
        for (const property of propertyData) {
          if (property.images && Array.isArray(property.images)) {
            const imageUploads = await Promise.all(
              property.images.map((image: string) =>
                cloudinary.v2.uploader.upload(image, {
                  folder: "Propiedades",
                })
              )
            );
            property.images = imageUploads.map((upload) => ({
              public_id: upload.public_id,
              url: upload.secure_url,
            }));
          }
        }
      }
      createProperty(data, res, next);
    } catch (error: any) {
      return next(new ErrorHandler(error.message, 500));
    }
  }
);

//Edit Property
export const editProperty = catchAsyncError(
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const data = req.body;
      const thumbnail = data.thumbnail;

      if (thumbnail) {
        await cloudinary.v2.uploader.destroy(thumbnail.public_id);

        const myCloud = await cloudinary.v2.uploader.upload(thumbnail, {
          folder: "properties",
        });
        data.thumbnail = {
          public_id: myCloud.public_id,
          url: myCloud.secure_url,
        };
      }

      const propertyId = req.params.id;

      const property = await PropertyModel.findByIdAndUpdate(
        propertyId,
        {
          $set: data,
        },
        { new: true }
      );
      res.status(201).json({
        success: true,
        property,
      });
    } catch (error: any) {
      return next(new ErrorHandler(error.message, 500));
    }
  }
);
// mostrar   solo una propiedad
export const getSingleProperty = catchAsyncError(
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const propertyId = req.params.id;
      const isCacheExist = await redis.get(propertyId);

      if (isCacheExist) {
        const property = JSON.parse(isCacheExist);
        res.status(200).json({
          success: true,
          property,
        });
      } else {
        const property = await PropertyModel.findById(req.params.id).select(
          "-propertyData.videoUrl -propertyData.suggestion -propertyData.questions -propertyData.links"
        );
        //        console.log("hitting mongo db")
        await redis.set(propertyId, JSON.stringify(property), "EX", 604800);
        res.status(200).json({
          success: true,
          property,
        });
      }
    } catch (error: any) {
      return next(new ErrorHandler(error.message, 500));
    }
  }
);

//mostrar todas las propiedades
export const getAllProperty = catchAsyncError(
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const properties = await PropertyModel.find().select(
        "-propertyData.videoUrl -propertyData.suggestion -propertyData.questions -propertyData.links"
      );
      res.status(200).json({
        success: true,
        properties,
      });
    } catch (error: any) {
      return next(new ErrorHandler(error.message, 500));
    }
  }
);

//añadir pregunta a a la propiedad
interface IAddQuestionData {
  question: string;
  propertyId: string;
  contentId: string;
}
export const addQuestion = catchAsyncError(
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { question, propertyId, contentId }: IAddQuestionData = req.body;
      const property = await PropertyModel.findById(propertyId);

      if (!mongoose.Types.ObjectId.isValid(contentId)) {
        return next(new ErrorHandler("Invalid content Id", 400));
      }

      const propertyContent = property?.propertyData?.find((item: any) =>
        item._id.equals(contentId)
      );

      if (!propertyContent) {
        return next(
          new ErrorHandler("No se encontró el contenido de la propiedad", 400)
        );
      }
      // crear un nuevo objeto pregunta
      const newQuestion: any = {
        user: req.user,
        question,
        questionReplies: [],
      };
      //añadir la pregunta al contenido de la propiedad
      propertyContent.questions.push(newQuestion);
      await NotificationModel.create({
        user: req.user?._id,
        title: "Nueva Pregunta",
        message: `YOU HAve a new question in ${propertyContent.bedrooms}`,
      });
      //guardar   la propiedad actualizada
      await property?.save();

      res.status(200).json({
        success: true,
        property,
      });
    } catch (error: any) {
      return next(new ErrorHandler(error.message, 500));
    }
  }
);

//añadir respuesta en la pregunta de la propiedad
interface IAddAnswerData {
  answer: string;
  propertyId: string;
  contentId: string;
  questionId: string;
}

export const addAnswer = catchAsyncError(
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { answer, propertyId, contentId, questionId }: IAddAnswerData =
        req.body;
      const property = await PropertyModel.findById(propertyId);

      if (!mongoose.Types.ObjectId.isValid(contentId)) {
        return next(new ErrorHandler("ID de contenido no válido", 400));
      }

      const propertyContent = property?.propertyData?.find((item: any) =>
        item._id.equals(contentId)
      );

      if (!propertyContent) {
        return next(
          new ErrorHandler("No se encontró el contenido de la propiedad", 400)
        );
      }
      const question = propertyContent?.questions?.find((item: any) =>
        item._id.equals(questionId)
      );
      if (!question) {
        return next(new ErrorHandler("Pregunta Invalida", 400));
      }
      console.log(question);
      // crear una nueva respuesta
      const newAnswer: any = {
        user: req.user,
        answer,
      };

      // Agregar la respuesta al contenido de la propiedad
      question.questionReplies.push(newAnswer);

      await property?.save();

      if (req.user?._id === question.user._id) {
        //crear notificacion
        await NotificationModel.create({
          user: req.user?._id,
          title: "New Question Reply Received",
          message: `YOU HAve a new question reply in ${propertyContent.bathrooms}`,
        });
      } else {
        const data = {
          name: question.user.name,
          title: propertyContent.bathrooms,
        };
        const html = await ejs.renderFile(
          path.join(__dirname, "../mails/question-reply.ejs"),
          data
        );
        try {
          await sendMail({
            email: question.user.email,
            subject: "Question Reply",
            template: "question-reply.ejs",
            data,
          });
        } catch (error: any) {
          return next(new ErrorHandler(error.message, 500));
        }
      }
      res.status(200).json({
        success: true,
        property,
      });
    } catch (error: any) {
      return next(new ErrorHandler(error.message, 500));
    }
  }
);

//añadir opinion a la propiedad
interface IAddReviewData {
  review: string;
  propertyId: string;
  rating: number;
  userId: string;
}

export const addReview = catchAsyncError(
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userPropertyList = req.user?.properties;
      const propertyId = req.params.id;
      //Verifica si el propertyId ya existe en la lista de propiedades del usuario basándote en el _id.

      const propertyExist = userPropertyList?.some(
        (property: any) => property._id.toString() === propertyId.toString()
      );
      if (!propertyExist) {
        return next(
          new ErrorHandler("No eres elegible para acceder a este curso.", 404)
        );
      }
      const property = await PropertyModel.findById(propertyId);
      const { review, rating } = req.body as IAddReviewData;
      const reviewData: any = {
        user: req.user,
        rating,
        comment: review,
      };
      property?.reviews.push(reviewData);

      let avg = 0;

      property?.reviews.forEach((rev: any) => {
        avg += rev.rating;
      });
      if (property) {
        property.ratings = avg / property.reviews.length;
      }

      await property?.save();
      const notification = {
        title: "NEW REVIEW RECEIVER",
        message: `${req.user?.name} has given a review in ${property?.name}`,
      };

      //crear notificación

      res.status(200).json({
        success: true,
        property,
      });
    } catch (error: any) {
      return next(new ErrorHandler(error.message, 500));
    }
  }
);

// add reply in review
interface IAddReviewData {
  comment: string;
  propertyId: string;
  reviewId: string;
}
export const addReplyToReview = catchAsyncError(
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { comment, propertyId, reviewId } = req.body as IAddReviewData;
      const property = await PropertyModel.findById(propertyId);
      if (!property) {
        return next(new ErrorHandler("Propiedad no encontrada", 404));
      }

      const review = property?.reviews?.find(
        (rev: any) => rev._id.toString() === reviewId
      );
      if (!review) {
        return next(new ErrorHandler("Review no encontrada", 404));
      }
      const replyData: any = {
        user: req.user,
        comment,
      };
      if (!review.commentReplies) {
        review.commentReplies = [];
      }

      review.commentReplies?.push(replyData);

      await property?.save();
      res.status(200).json({
        success: true,
        property,
      });
    } catch (error: any) {
      return next(new ErrorHandler(error.message, 500));
    }
  }
);

//get all courses
export const getAdminAllProperties = catchAsyncError(
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      getAllPropertiesService(res);
    } catch (error: any) {
      return next(new ErrorHandler(error.message, 400));
    }
  }
);

//Delete Course --- only for admin
export const deleteProperty = catchAsyncError(
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id } = req.params;

      const property = await PropertyModel.findById(id);
      if (!property) {
        return next(new ErrorHandler("Propiedad no encontrada", 400));
      }
      await property.deleteOne({ id });

      await redis.del(id);

      res.status(200).json({
        success: true,
        message: "Propiedad eliminada exitosamente",
      });
    } catch (error: any) {
      return next(new ErrorHandler(error.message, 400));
    }
  }
);
