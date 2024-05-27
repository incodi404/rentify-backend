import nodemail from "nodemailer"
import { asynchandler } from "../utils/asynchandler.utils.js"
import { BASE_LINK } from "../constant.js"
const transport = nodemail.createTransport({
    service: "gmail",
    auth: {
        user: process.env.MAIL_USER,
        pass: process.env.MAIL_PASS 
    }
})


const mailSend = asynchandler(async (email, body, purpose = "Verify Your Email") => {

    try {
        const mailOptions = {
            from: process.env.MAIL_USER,
            to: email,
            subject: purpose,
            html: body
        }

        transport.sendMail(mailOptions)
        return true
    } catch (error) {
        console.log("Error: Email sent failed!")
        return false
    }
})

export { mailSend }


