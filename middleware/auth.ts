import { Request, Response, NextFunction } from "express";
import ErrorHandler from "../utils/ErrorHandler";
import { catchAsyncError } from "./catchAsyncError";
import jwt, { JwtPayload } from "jsonwebtoken";
import { redis } from "../utils/redis";

export const isAuthentificated = catchAsyncError(
  async (req: Request, res: Response, next: NextFunction) => {
    const access_token = req.cookies.access_token as string;
    if (!access_token) {
      return next(new ErrorHandler("por faovor inicia sesion this resource", 400));
    }
    const decoded = jwt.verify(
      access_token,
      process.env.ACCESS_TOKEN as string
    ) as JwtPayload;

    if (!decoded) {
      return next(new ErrorHandler("Token de acceso no valido", 400));
    }

    const user = await redis.get(decoded.id);

    if (!user) {
      return next(new ErrorHandler("Por favor Inicia Secion", 400));
    }
    req.user = JSON.parse(user);
    next();
  }
);

//validar rol del usuario
export const authorizeRoles = (...roles: string[])=>{
  return(req:Request, res:Response, next:NextFunction)=>{
    if (!roles.includes(req.user?.role || '')) {
      return next(new ErrorHandler(`Role: ${req.user?.role}no tiene permiso para acceder a este recurso`, 403)); 
    }
    next();
  }
}
