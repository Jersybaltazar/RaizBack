import express from "express";
import {
  activateUser,
  deleteUser,
  getAllUsers,
  getUserInfo,
  loginUser,
  logoutUser,
  registrationUser,
  socialAuth,
  updateAccessToken,
  updatePassword,
  updateProfile,
  updateUserInfo,
  updateUserRole,
} from "../controllers/user.controller";
import { authorizeRoles, isAuthentificated } from "../middleware/auth";

const userRouter = express.Router();

userRouter.post("/registrar", registrationUser);

userRouter.post("/activarUser", activateUser);

userRouter.post("/login", loginUser);

userRouter.get("/logout", isAuthentificated, logoutUser);

userRouter.get("/refresh", updateAccessToken);

userRouter.get("/me", updateAccessToken,isAuthentificated, getUserInfo);

userRouter.post("/socialAuth", socialAuth);

userRouter.put(
  "/updateUser",
  updateAccessToken,
  isAuthentificated,
  updateUserInfo
);

userRouter.put(
  "/updatePassword",
  updateAccessToken,
  isAuthentificated,
  updatePassword
);

userRouter.put(
  "/update-profile",
  updateAccessToken,
  isAuthentificated,
  updateProfile
);

userRouter.get(
  "/get-users",
  updateAccessToken,
  isAuthentificated,
  authorizeRoles("admin"),
  getAllUsers
);
userRouter.put(
  "/update-role",
  updateAccessToken,
  isAuthentificated,
  authorizeRoles("admin"),
  updateUserRole
);

userRouter.delete(
  "/delete-user/:id",
  updateAccessToken,
  isAuthentificated,
  authorizeRoles("admin"),
  deleteUser
);
export default userRouter;
