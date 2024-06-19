"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
require("dotenv").config();
const mongoose_1 = __importDefault(require("mongoose"));
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const emailRegex = /^[^\s@]+@[^\s@]+.[^\s@]+$/;
;
const userSchema = new mongoose_1.default.Schema({
    name: {
        type: String,
        required: [true, "Por favor ingresa tu nombre"],
    },
    email: {
        type: String,
        required: [true, "Por favor ingresa tu correo"],
        validate: {
            validator: function (value) {
                return emailRegex.test(value);
            },
            message: "Correo electronico no valido"
        },
        unique: true,
    },
    password: {
        type: String,
        required: [true, "Por favor ingresa tu contrasenia"],
        minlength: [6, "Ingresa minimo 6 caracteres"],
        select: false
    },
    avatar: {
        public_id: String,
        url: String,
    },
    role: {
        type: String,
        default: "user",
    },
    isVerified: {
        type: Boolean,
        default: false,
    },
    properties: [
        {
            propertyId: String,
        }
    ],
}, { timestamps: true });
//hash contraseña y guardar despues
userSchema.pre('save', async function (next) {
    if (!this.isModified('password')) {
        next();
    }
    this.password = await bcryptjs_1.default.hash(this.password, 10);
    next();
});
//sign acces token
userSchema.methods.SignAccessToken = function () {
    return jsonwebtoken_1.default.sign({ id: this._id }, process.env.ACCESS_TOKEN || '', {
        expiresIn: "5m",
    });
};
//sign actualizar token
userSchema.methods.SignRefreshToken = function () {
    return jsonwebtoken_1.default.sign({ id: this._id }, process.env.REFRESH_TOKEN || '', {
        expiresIn: "3d",
    });
};
//comparar contraseñas
userSchema.methods.comparePassword = async function (enteredPassword) {
    return await bcryptjs_1.default.compare(enteredPassword, this.password);
};
const userModel = mongoose_1.default.model("User", userSchema);
exports.default = userModel;
