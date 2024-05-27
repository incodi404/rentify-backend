import { asynchandler } from "../utils/asynchandler.utils.js"
import { ApiError } from "../utils/ApiError.utils.js"
import { ApiResponse } from "../utils/ApiResponse.utils.js"
import jwt from "jsonwebtoken"
import { mailSend } from "../utils/nodemailer.utils.js"
import { validateEmail, validateString, validatePassword, validateNumber } from "../utils/validation.utils.js"
import { User } from "../models/user.model.js"
import { client } from "../db/redis.db.js"
import { BASE_LINK } from "../constant.js"

const generateAccessAndRefreshToken = async (email) => {
    try {
        const user = await User.findOne({ email: email })

        const accessToken = await user.generateAccessToken()
        const refreshToken = await user.generateRefreshToken()

        user.refreshToken = refreshToken
        await user.save()

        return { accessToken, refreshToken }

    } catch (error) {
        console.log(ApiError(400, "Token not generated :: ", error));
    }
}

const options = {
    httpOnly: true,
    secure: true,
    sameSite: "None"
}

const generateEmailVerification = asynchandler(async (req, res) => {
    const { firstName, lastName, password, phone, email, designation } = req.body

    //All field check

    if (
        [firstName, lastName, password, phone, email, designation].some((field) => field?.trim() === "")
    ) {
        return res.status(400).json(ApiError(400, "Every field is required!"))
    }

    //Zod validation

    if (
        [firstName, lastName, designation].some((field) => validateString(field) != true)
    ) {
        return res.status(400).json(ApiError(400, "Something is invalid!"))
    }

    const validatePhone = validateNumber(phone)

    if (!validatePhone) { return res.status(400).json(ApiError(400, "Phone is invalid!")) }

    const emailValidation = validateEmail(email)

    if (!emailValidation) { return res.status(400).json(ApiError(400, "Email is invalid!")) }

    const validatePass = validatePassword(password)

    if (!validatePass) { return res.status(400).json(ApiError(400, "Password is invalid!")) }

    //DB validation

    const existedUser = await User.findOne({
        $or: [{ email: email }, { phone: phone }]
    })

    if (existedUser) { return res.status(400).json(ApiError(400, "Email or phone number is already exists!")) }

    const existedUserRedis = await client.json.get(`user:${email}`)

    if (existedUserRedis) { return res.status(400).json(ApiError(400, "Email is already exists, please verify the email!")) }

    //Data upload to Redis

    const data = {
        firstName: firstName.toLowerCase(),
        lastName: lastName.toLowerCase(),
        password,
        phone,
        email,
        designation: designation.toLowerCase(),
    }


    client.json.set(`user:${email}`, '$', data, 'nx').then((data) => {
        if (!data) {
            return res.status(500).json(ApiError(500, "Data saving in redis failed!"))
        }

        client.expire(`user:${email}`, 3600).then((data) => {
            if (!data) { return res.status(500).json(ApiError(500, "Expire time set in redis failed!")) }
        })
    })

    //Generate verify token

    const verifyEmailToken = jwt.sign(
        {
            email: email
        },
        process.env.VERIFY_TOKEN_SECRET,
        {
            expiresIn: process.env.VERIFY_TOKEN_EXPIRY
        }
    )

    if (!verifyEmailToken) { return res.status(500).json(ApiError(500, "Verify Token not created!")) }

    //Sent Email

    const emailBody = `<a href="${BASE_LINK}/email-verification/${verifyEmailToken}"><button>Verify Email</button></a>`

    const emailSent = mailSend(email, emailBody)

    if (!emailSent) { return res.status(500).json(ApiError(500, "Email sent failed!")) }

    //Final Response

    return res.status(200).json(ApiResponse(200, `OTP has been sent to your  email id : ${email}`, { "Email": email }))
    //return res.status(200).json(ApiResponse(200,"Ok", verifyEmailToken))
})

const verifyEmail = asynchandler(async (req, res) => {
    const token = req.params.verifyEmailToken

    if (!token) { return res.status(400).json(ApiError(400, "Token not found!")) }

    const decodedToken = jwt.verify(token, process.env.VERIFY_TOKEN_SECRET)

    if (!decodedToken) { return res.status(400).json(ApiError(400, "Token invalid!")) }

    const userInRedis = await client.json.get(`user:${decodedToken?.email}`)

    if (!userInRedis) { return res.status(400).json(ApiError(400, "User not found!")) }

    const userInMongo = await User.create(userInRedis)

    //Delete data from Redis

    await client.json.del(`user:${decodedToken?.email}`).then((data) => {
        if (!data) { return res.status(500).json(ApiError(500, "User not deleted!")) }
    })

    if (!userInMongo) { return res.status(500).json(ApiError(500, "User does not created!")) }

    return res.status(200).json(ApiResponse(200, "User verified and created!", userInMongo))
})

const login = asynchandler(async (req, res) => {
    const { email, password } = req.body

    if (!validateEmail(email)) { return res.status(400).json(ApiError(400, "Email is invalid!")) }

    if (!email || !password) { return res.status(400).json(ApiError(400, "Email and password both are requied!")) }

    const user = await User.findOne({ email: email })

    if (!user) { return res.status(400).json(ApiError(400, "User not found!")) }

    const isPassCorrect = await user.isPasswordCorrect(password)

    if (!isPassCorrect) { return res.status(400).json(ApiError(400, "Password is incorrect!")) }

    const { accessToken, refreshToken } = await generateAccessAndRefreshToken(email)

    if (!accessToken || !refreshToken) { return res.status(500).json(ApiError(500, "Token generation failed!")) }

    return res.status(200).cookie("accessToken", accessToken, options).cookie("refreshToken", refreshToken, options).json(ApiResponse(200, "Login successfull!", {accessToken, refreshToken}))
    //return res.status(200).json(ApiResponse(200, "Login successfull!"))

})

const logout = asynchandler(async (req, res) => {

    const userFromCookie = req.user

    if (!userFromCookie) { return res.status(400).json(ApiError(400, "Are you logged in? User not found!")) }

    const user = await User.findByIdAndUpdate(
        userFromCookie?._id,
        {
            refreshToken: ""
        },
        {
            new: true
        }
    )

    if (!user) { return res.status(500).json(ApiError(500, "Logout failed!")) }

    return res
        .status(200)
        .clearCookie("accessToken", options)
        .clearCookie("refreshToken", options)
        .json(ApiResponse(200, "User logged out successfully!"))

})

const getUser = asynchandler(async (req, res) => {

    const user = req.user

    if (!user) { return res.status(400).json(ApiError(400, "Are you logged in? User not found!")) }

    return res.status(200).json(ApiResponse(200, "User fetched!", user))
})

const deleteAccountEmailGenerate = asynchandler(async(req,res)=>{
    const user = req.user

    if (!user) { return res.status(400).json(ApiError(400, "Are you logged in? User not found!")) }

    const emailBody = `<a href="${BASE_LINK}/delete-account/${user?._id}"><button>Delete Your Acccount</button></a>`

    const emailSent = mailSend(user?.email, emailBody)

    // if (!emailSent) { return res.status(500).json(ApiError(500, "Email sent failed!")) }

    return res.status(200).json(ApiResponse(200, "Check your Gmail inbox"))
}) 

const verifyAndDeleteAccount = asynchandler(async(req,res)=>{
    const {userId} = req.params

    if (!userId) { return res.status(400).json(ApiError(400, "User id not found!")) }

    const deleteAccount = await User.findByIdAndDelete(userId)

    if (!deleteAccount) { return res.status(400).json(ApiError(400, "Account not found!")) }

    return res.status(200).json(ApiResponse(200, "Account Deleted!"))
})

const checkServer = asynchandler(async(req,res)=>{
    return res.status(200).json(ApiResponse(200, "Server is ok"))
})


export { generateEmailVerification, verifyEmail, login, getUser, logout, deleteAccountEmailGenerate, verifyAndDeleteAccount, checkServer }