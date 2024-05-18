require("dotenv").config();
import mongoose,{Document,Model,Schema} from "mongoose";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

const emailRegex: RegExp = /^[^\s@]+@[^\s@]+.[^\s@]+$/;

export interface IUser extends Document{
    name: string;
    email:string;
    password: string;
    avatar:{
        public_id: string;
        url:string;
    },
    role: string;
    isVerified:boolean;
    properties: Array<{propertyId:string}>;
    comparePassword:(password: string)=> Promise<boolean>;
    SignAccessToken: ()=> string;
    SignRefreshToken: ()=> string;

};

const userSchema: Schema<IUser> = new mongoose.Schema({

    name:{
        type:String,
        required:[true,"Por favor ingresa tu nombre"],
    },
    email:{
        type:String,
        required:[true,"Por favor ingresa tu correo"],
        validate:{
            validator:function(value:string){
            return emailRegex.test(value);
            },
            message:"Correo electronico no valido"
        },
        unique: true,
    },
    password:{
        type:String,
        required:[true,"Por favor ingresa tu contrasenia"],
        minlength:[6,"Ingresa minimo 6 caracteres"],
        select:false
    },
    avatar:{
        public_id: String,
        url: String,
    },
    role:{
        type:String,
        default: "user",
    },
    isVerified:{
        type:Boolean,
        default:false,
    },
    properties:[
        {
            propertyId:String,
        }
    ],


},{timestamps:true});
//hash contraseña y guardar despues
userSchema.pre<IUser>('save', async function (next) {
    if (!this.isModified('password')) {
        next();
    }
    this.password = await bcrypt.hash(this.password, 10);
    next();
})
//sign acces token
userSchema.methods.SignAccessToken = function (){
    return jwt.sign({id: this._id}, process.env.ACCESS_TOKEN || '', {
        expiresIn:"5m",
    });
}

//sign actualizar token
userSchema.methods.SignRefreshToken = function (){
    return jwt.sign({id: this._id}, process.env.REFRESH_TOKEN || '', {
        expiresIn: "3d",
    });
}
//comparar contraseñas
userSchema.methods.comparePassword = async function (enteredPassword:string):Promise<boolean>{
    return await bcrypt.compare(enteredPassword, this.password);
};

const userModel: Model<IUser> = mongoose.model("User",userSchema);

export default userModel;

