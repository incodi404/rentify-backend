import { Router } from "express";
import { deleteAccountEmailGenerate, generateEmailVerification, getUser, login, logout, verifyAndDeleteAccount, verifyEmail } from "../controllers/user.controller.js";
import { verifyLogin } from "../middlewares/verifyLogin.middleware.js";
import { interested } from "../controllers/interested.controller.js";

const userRouter = Router()

userRouter.route("/email-verification").post(generateEmailVerification)
userRouter.route("/verify-email/:verifyEmailToken").get(verifyEmail)
userRouter.route("/login").post(login)
userRouter.route("/get-user").get(verifyLogin, getUser)
userRouter.route("/logout").get(verifyLogin, logout)
userRouter.route("/interested").post(verifyLogin, interested)
userRouter.route("/delete-account").get(verifyLogin, deleteAccountEmailGenerate)
userRouter.route("/verify-and-delete-account/:userId").get(verifyAndDeleteAccount)

export {userRouter}

