import { Router } from "express";
import { verifyLogin } from "../middlewares/verifyLogin.middleware.js";
import { allPost, filteredData, getSinglePost, interestedData, myPost } from "../controllers/get.controller.js";

const getRouter = Router()

getRouter.route("/all-post").get(verifyLogin, allPost)
getRouter.route("/my-post").get(verifyLogin, myPost)
getRouter.route("/post/:postId").get(getSinglePost)
getRouter.route("/interested").get(verifyLogin, interestedData)
getRouter.route("/filter/:city/:address").get(verifyLogin, filteredData)
//etRouter.route("/filter/:city").get(verifyLogin, filteredData)

export {
    getRouter
}