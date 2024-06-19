"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.initSocketServer = void 0;
const socket_io_1 = require("socket.io");
const initSocketServer = (server) => {
    const io = new socket_io_1.Server(server);
    io.on("connection", (socket) => {
        console.log("Usuario Conectado");
        //Escuche el evento de notificación desde el frontend
        socket.on("notification", (data) => {
            //Transmitir los datos de notificación a todos los clientes conectados (admindashboard)
            io.emit("newNotification", data);
        });
        socket.on("disconnect", () => {
            console.log("El usuario se ah dsconectado");
        });
    });
};
exports.initSocketServer = initSocketServer;
