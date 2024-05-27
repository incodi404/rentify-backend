import { Router } from "express";
import { createPost, deletePost, updatePost } from "../controllers/post.controller.js";
import { verifyLogin } from "../middlewares/verifyLogin.middleware.js";

const postRouter = Router()

postRouter.route("/create-post").post(verifyLogin, createPost)
postRouter.route("/update-post").put(verifyLogin, updatePost)
postRouter.route("/delete-post").delete(verifyLogin, deletePost)

export {
    postRouter
}