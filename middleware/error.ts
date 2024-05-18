import { NextFunction, Response, Request } from "express";
import ErrorHandler from "../utils/ErrorHandler";

export const ErrorMiddleware = (err:any, req:Request, res:Response, next:NextFunction)=>{

    // Configurando el código de estado y el mensaje por defecto si no se proporcionan
    err.statusCode = err.statusCode || 500;
    err.message = err.message || 'Error interno del servidor';

    // cuando el id de mongodb es erroneo
    if (err.name === 'CastError') {
        const message =`Recurso  base de datos no encontrado :${err.path}`;
        err = new ErrorHandler(message, 400);
        
    }
    // clave duplicada 
    if (err.code === 11000) {
        const message =`clave duplicada :${Object.keys(err.keyValue)}`;
        err = new ErrorHandler(message,400);
    } 
    
    // error en jwt token

    if (err.name === 'JsonWebTokenError') {
        const message =`Json web token es invalido, intenta de nuevo`;
        err = new ErrorHandler(message, 400);
    }
    // expirado en jwt token

    if (err.name === 'TokenExpiredError') {
        const message =`Json web token se ah expirado, intenta de nuevo`;
        err = new ErrorHandler(message, 400);
    }
    // configurando la respuesta json q enviaremos al cliente
    res.status(err.statusCode).json({
        succes:false,
        message:err.message,
    })

}   