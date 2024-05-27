import { User } from "../models/user.model.js"
import { ApiError } from "../utils/ApiError.utils.js"
import { asynchandler } from "../utils/asynchandler.utils.js"
import jwt from "jsonwebtoken"

const verifyLogin = asynchandler(async (req, res, next) => {
    try {
        const token = req.cookies?.accessToken || req.header("Authorization")?.replace("Bearer ", "")

        if (!token) { return res.status(400).json(ApiError(400, "Token not found!")) }

        const decodedToken = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET)

        if (!decodedToken) { return res.status(400).json(ApiError(400, "Token is invalid!")) }

        const user = await User.findById(decodedToken?._id).select("-password -refreshToken")

        if (!user) { return res.status(400).json(ApiError(400, "User not found!")) }

        req.user = user

        next()
    } catch (error) {
        console.log("Something is wrong in middleware :: ", error)
        return res.status(500).json(ApiError(500, "Token not found!"))
    }
})

export { verifyLogin }