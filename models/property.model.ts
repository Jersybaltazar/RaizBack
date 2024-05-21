import mongoose, { Document, Model, Schema } from "mongoose";
import { IUser } from "./user.model";

//se define las interface del comentario
export interface IComment extends Document {
  user: IUser; //referencia a un usuario
  question: string; //el texto del comentario
  questionReplies: IComment[]; //respuestas del comentario
}

// se crea la interfaz que hereda de la interfaz anterior y agrega los campos adicionales reseña
interface IReview extends Document {
  user: IUser;
  rating?: number;
  comment: string;
  commentReplies?: IReview[];
}

// definiendo la interface para el enlace
interface ILink extends Document {
  title: string;
  url: string;
}
// definiendo la interface de los datos de la propiedad
interface IPropertyData extends Document {
  bedrooms: string;
  bathrooms: string;
  videoUrl: string;
  images: { public_id: string; url: string }[];
  size: string;
  title: string;
  description: string;
  videoSection: string;
  videoLength: number;
  videoPlayer: string;
  links: ILink[];
  virtualTour: string;
  questions: IComment[];
}

interface IProperty extends Document {
  name: string;
  description: string;
  categories: string;
  price: number;
  estimatedPrice?: number; //descunento
  thumbnail: object; //miniatura
  tags: string; // etiquetas
  level: string; //
  location: string;
  benefits: { title: string }[];
  prerequisites: { title: string }[];
  reviews: IReview[];
  propertyData: IPropertyData[];
  ratings?: number;
  purchased?: number;
  // estado de
}

const reviewSchema = new Schema<IReview>({
  user: Object,
  rating: {
    type: Number,
    default: 0,
  },
  comment: String,
  commentReplies: [Object],
});

const linkSchema = new Schema<ILink>({
  title: String,
  url: String,
});

const commentSchema = new Schema<IComment>({
  user: Object,
  question: String,
  questionReplies: [Object],
});

const propertyDataSchema = new Schema<IPropertyData>({
  bedrooms: String,
  bathrooms: String,
  videoUrl: String,
  images: [{ public_id: String, url: String }],
  size: String,
  title: String,
  description: String,
  videoSection: String,
  videoLength: Number,
  videoPlayer: String,
  links: [linkSchema],
  virtualTour: String,
  questions: [commentSchema],
});

const propertySchema = new Schema<IProperty>(
  {
    name: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      required: true,
    },
    categories: {
      type: String,

    },
    price: {
      type: Number,
      required: true,
    },
    estimatedPrice: {
      type: Number,
    },
    thumbnail: {
      public_id: {
        type: String,
      },
      url: {
        type: String,
      },
    },
    tags: {
      type: String,
      required: true,
    },
    level: {
      type: String,
      required: true,
    },
    location: {
      type: String,
      required: true,
    },
    benefits: [{ title: String }],
    prerequisites: [{ title: String }],
    reviews: [reviewSchema],
    propertyData: [propertyDataSchema],
    ratings: {
      type: Number,
      default: 0,
    },
    purchased: {
      type: Number,
      default: 0,
    },
  },
  { timestamps: true }
);

const PropertyModel: Model<IProperty> = mongoose.model(
  "Property",
  propertySchema
);

export default PropertyModel;
