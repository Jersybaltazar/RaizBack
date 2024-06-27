import {app} from "./app";
import { v2 as cloudinary } from "cloudinary";
import connectDB from "./utils/db"; 
import http from "http";
import { initSocketServer } from "./socketServer";
require("dotenv").config();

const server = http.createServer(app);

//configuracion cloudinary
cloudinary.config({
    cloud_name: process.env.CLOUD_NAME,
    api_key: process.env.CLOUD_API_KEY,
    api_secret: process.env.CLOUD_SECRET_KEY,
});


initSocketServer(server);
//crear el servidor

server.listen(process.env.PORT,()=>{
    console.log(`Servidor escuchando en el puerto ${process.env.PORT}`);
    connectDB();
}); 