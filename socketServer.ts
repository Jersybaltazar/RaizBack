import { Server as SocketIOServer} from "socket.io";
import http from "http";

export const initSocketServer = (server:http.Server) => {
    const io = new SocketIOServer(server, {
        cors: {
          origin: "*", // Ajusta esto según tu configuración de CORS
          methods: ["GET", "POST"],
        },
      });

    io.on("connection",(socket)=>{
        console.log("A user connected");
        // 
        socket.on("notification",(data)=>{
            io.emit("newNotification", data);
        });
        socket.on("disconnect",()=>{
            console.log("A user disconnected");
        }) 
    })
};