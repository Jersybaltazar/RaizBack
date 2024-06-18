import { Server as SocketIoServer } from "socket.io";
import http from "http";

export const initSocketServer = (server: http.Server) => {
  const io = new SocketIoServer(server);

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
