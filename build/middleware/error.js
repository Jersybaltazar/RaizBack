"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ErrorMiddleware = void 0;
const ErrorHandler_1 = __importDefault(require("../utils/ErrorHandler"));
const ErrorMiddleware = (err, req, res, next) => {
    // Configurando el código de estado y el mensaje por defecto si no se proporcionan
    err.statusCode = err.statusCode || 500;
    err.message = err.message || 'Error interno del servidor';
    // cuando el id de mongodb es erroneo
    if (err.name === 'CastError') {
        const message = `Recurso  base de datos no encontrado :${err.path}`;
        err = new ErrorHandler_1.default(message, 400);
    }
    // clave duplicada 
    if (err.code === 11000) {
        const message = `clave duplicada :${Object.keys(err.keyValue)}`;
        err = new ErrorHandler_1.default(message, 400);
    }
    // error en jwt token
    if (err.name === 'JsonWebTokenError') {
        const message = `Json web token es invalido, intenta de nuevo`;
        err = new ErrorHandler_1.default(message, 400);
    }
    // expirado en jwt token
    if (err.name === 'TokenExpiredError') {
        const message = `Json web token se ah expirado, intenta de nuevo`;
        err = new ErrorHandler_1.default(message, 400);
    }
    // configurando la respuesta json q enviaremos al cliente
    res.status(err.statusCode).json({
        succes: false,
        message: err.message,
    });
};
exports.ErrorMiddleware = ErrorMiddleware;
