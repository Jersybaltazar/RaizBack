"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteProperty = exports.getAdminAllProperties = exports.addReplyToReview = exports.addReview = exports.addAnswer = exports.addQuestion = exports.getAllProperty = exports.getSingleProperty = exports.editProperty = exports.uploadProperty = void 0;
const catchAsyncError_1 = require("../middleware/catchAsyncError");
const ErrorHandler_1 = __importDefault(require("../utils/ErrorHandler"));
const cloudinary_1 = __importDefault(require("cloudinary"));
const property_service_1 = require("../services/property.service");
const property_model_1 = __importDefault(require("../models/property.model"));
const mongoose_1 = __importDefault(require("mongoose"));
const path_1 = __importDefault(require("path"));
const sendMail_1 = __importDefault(require("../utils/sendMail"));
const ejs_1 = __importDefault(require("ejs"));
const redis_1 = require("../utils/redis");
const notification_model_1 = __importDefault(require("../models/notification.model"));
// subir propiedad
exports.uploadProperty = (0, catchAsyncError_1.catchAsyncError)(async (req, res, next) => {
    try {
        // Extrae el cuerpo de la solicitud (req.body) y lo asigna a la variable `data`.
        const data = req.body;
        // Extrae la propiedad `thumbnail` del objeto `data`.
        const { thumbnail, propertyData } = data;
        // Si `thumbnail` existe, procede a subirlo a Cloudinary.
        if (thumbnail) {
            // Sube la imagen a Cloudinary dentro de la carpeta "miniatura".
            const myCloud = await cloudinary_1.default.v2.uploader.upload(thumbnail, {
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
                    const imageUploads = await Promise.all(property.images.map((image) => cloudinary_1.default.v2.uploader.upload(image, {
                        folder: "Propiedades",
                    })));
                    property.images = imageUploads.map((upload) => ({
                        public_id: upload.public_id,
                        url: upload.secure_url,
                    }));
                }
            }
        }
        (0, property_service_1.createProperty)(data, res, next);
    }
    catch (error) {
        return next(new ErrorHandler_1.default(error.message, 500));
    }
});
//Edit Property
exports.editProperty = (0, catchAsyncError_1.catchAsyncError)(async (req, res, next) => {
    try {
        const data = req.body;
        const thumbnail = data.thumbnail;
        if (thumbnail) {
            await cloudinary_1.default.v2.uploader.destroy(thumbnail.public_id);
            const myCloud = await cloudinary_1.default.v2.uploader.upload(thumbnail, {
                folder: "properties",
            });
            data.thumbnail = {
                public_id: myCloud.public_id,
                url: myCloud.secure_url,
            };
        }
        const propertyId = req.params.id;
        const property = await property_model_1.default.findByIdAndUpdate(propertyId, {
            $set: data,
        }, { new: true });
        res.status(201).json({
            success: true,
            property,
        });
    }
    catch (error) {
        return next(new ErrorHandler_1.default(error.message, 500));
    }
});
// mostrar   solo una propiedad
exports.getSingleProperty = (0, catchAsyncError_1.catchAsyncError)(async (req, res, next) => {
    try {
        const propertyId = req.params.id;
        const isCacheExist = await redis_1.redis.get(propertyId);
        if (isCacheExist) {
            const property = JSON.parse(isCacheExist);
            res.status(200).json({
                success: true,
                property,
            });
        }
        else {
            const property = await property_model_1.default.findById(req.params.id).select("-propertyData.videoUrl -propertyData.suggestion -propertyData.questions -propertyData.links");
            //        console.log("hitting mongo db")
            await redis_1.redis.set(propertyId, JSON.stringify(property), "EX", 604800);
            res.status(200).json({
                success: true,
                property,
            });
        }
    }
    catch (error) {
        return next(new ErrorHandler_1.default(error.message, 500));
    }
});
//mostrar todas las propiedades
exports.getAllProperty = (0, catchAsyncError_1.catchAsyncError)(async (req, res, next) => {
    try {
        const properties = await property_model_1.default.find().select("-propertyData.videoUrl -propertyData.suggestion -propertyData.questions -propertyData.links");
        res.status(200).json({
            success: true,
            properties,
        });
    }
    catch (error) {
        return next(new ErrorHandler_1.default(error.message, 500));
    }
});
exports.addQuestion = (0, catchAsyncError_1.catchAsyncError)(async (req, res, next) => {
    try {
        const { question, propertyId, contentId } = req.body;
        const property = await property_model_1.default.findById(propertyId);
        if (!mongoose_1.default.Types.ObjectId.isValid(contentId)) {
            return next(new ErrorHandler_1.default("Invalid content Id", 400));
        }
        const propertyContent = property?.propertyData?.find((item) => item._id.equals(contentId));
        if (!propertyContent) {
            return next(new ErrorHandler_1.default("No se encontró el contenido de la propiedad", 400));
        }
        // crear un nuevo objeto pregunta
        const newQuestion = {
            user: req.user,
            question,
            questionReplies: [],
        };
        //añadir la pregunta al contenido de la propiedad
        propertyContent.questions.push(newQuestion);
        await notification_model_1.default.create({
            user: req.user?._id,
            title: "Nueva Pregunta recivoda",
            message: `YOU HAve a new question in ${property?.name}`,
        });
        //guardar   la propiedad actualizada
        await property?.save();
        res.status(200).json({
            success: true,
            property,
        });
    }
    catch (error) {
        return next(new ErrorHandler_1.default(error.message, 500));
    }
});
exports.addAnswer = (0, catchAsyncError_1.catchAsyncError)(async (req, res, next) => {
    try {
        const { answer, propertyId, contentId, questionId } = req.body;
        const property = await property_model_1.default.findById(propertyId);
        if (!mongoose_1.default.Types.ObjectId.isValid(contentId)) {
            return next(new ErrorHandler_1.default("ID de contenido no válido", 400));
        }
        const propertyContent = property?.propertyData?.find((item) => item._id.equals(contentId));
        if (!propertyContent) {
            return next(new ErrorHandler_1.default("No se encontró el contenido de la propiedad", 400));
        }
        const question = propertyContent?.questions?.find((item) => item._id.equals(questionId));
        if (!question) {
            return next(new ErrorHandler_1.default("Pregunta Invalida", 400));
        }
        console.log(question);
        // crear una nueva respuesta
        const newAnswer = {
            user: req.user,
            answer,
        };
        // Agregar la respuesta al contenido de la propiedad
        question.questionReplies.push(newAnswer);
        await property?.save();
        if (req.user?._id === question.user._id) {
            //crear notificacion
            await notification_model_1.default.create({
                user: req.user?._id,
                title: "New Question Reply Received",
                message: `YOU HAve a new question reply in ${propertyContent.bathrooms}`,
            });
        }
        else {
            const data = {
                name: question.user.name,
                title: propertyContent.bathrooms,
            };
            const html = await ejs_1.default.renderFile(path_1.default.join(__dirname, "../mails/question-reply.ejs"), data);
            try {
                await (0, sendMail_1.default)({
                    email: question.user.email,
                    subject: "Question Reply",
                    template: "question-reply.ejs",
                    data,
                });
            }
            catch (error) {
                return next(new ErrorHandler_1.default(error.message, 500));
            }
        }
        res.status(200).json({
            success: true,
            property,
        });
    }
    catch (error) {
        return next(new ErrorHandler_1.default(error.message, 500));
    }
});
exports.addReview = (0, catchAsyncError_1.catchAsyncError)(async (req, res, next) => {
    try {
        const userPropertyList = req.user?.properties;
        const propertyId = req.params.id;
        //Verifica si el propertyId ya existe en la lista de propiedades del usuario basándote en el _id.
        const propertyExist = userPropertyList?.some((property) => property._id.toString() === propertyId.toString());
        if (!propertyExist) {
            return next(new ErrorHandler_1.default("No eres elegible para acceder a este curso.", 404));
        }
        const property = await property_model_1.default.findById(propertyId);
        const { review, rating } = req.body;
        const reviewData = {
            user: req.user,
            rating,
            comment: review,
        };
        property?.reviews.push(reviewData);
        let avg = 0;
        property?.reviews.forEach((rev) => {
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
    }
    catch (error) {
        return next(new ErrorHandler_1.default(error.message, 500));
    }
});
exports.addReplyToReview = (0, catchAsyncError_1.catchAsyncError)(async (req, res, next) => {
    try {
        const { comment, propertyId, reviewId } = req.body;
        const property = await property_model_1.default.findById(propertyId);
        if (!property) {
            return next(new ErrorHandler_1.default("Propiedad no encontrada", 404));
        }
        const review = property?.reviews?.find((rev) => rev._id.toString() === reviewId);
        if (!review) {
            return next(new ErrorHandler_1.default("Review no encontrada", 404));
        }
        const replyData = {
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
    }
    catch (error) {
        return next(new ErrorHandler_1.default(error.message, 500));
    }
});
//get all courses
exports.getAdminAllProperties = (0, catchAsyncError_1.catchAsyncError)(async (req, res, next) => {
    try {
        (0, property_service_1.getAllPropertiesService)(res);
    }
    catch (error) {
        return next(new ErrorHandler_1.default(error.message, 400));
    }
});
//Delete Course --- only for admin
exports.deleteProperty = (0, catchAsyncError_1.catchAsyncError)(async (req, res, next) => {
    try {
        const { id } = req.params;
        const property = await property_model_1.default.findById(id);
        if (!property) {
            return next(new ErrorHandler_1.default("Propiedad no encontrada", 400));
        }
        await property.deleteOne({ id });
        await redis_1.redis.del(id);
        res.status(200).json({
            success: true,
            message: "Propiedad eliminada exitosamente",
        });
    }
    catch (error) {
        return next(new ErrorHandler_1.default(error.message, 400));
    }
});
