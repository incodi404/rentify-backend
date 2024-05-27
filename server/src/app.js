import cookieParser from "cookie-parser"
import express from "express"
import cors from "cors"

const app = express()

app.use(express.json({limit: "50kb"}))
app.use(express.urlencoded({limit: "50kb", extended: true}))
app.use(cookieParser())
app.use(cors({
    origin: 'http://127.0.0.1:5173',
    credentials: true
}))

//import route
import {userRouter} from "./routes/user.routes.js"
import {postRouter} from "./routes/post.route.js"
import { getRouter } from "./routes/get.route.js"

//declear path
app.use("/api/v1/user", userRouter)
app.use("/api/v1/post", postRouter)
app.use("/api/v1/get", getRouter)


export {app}