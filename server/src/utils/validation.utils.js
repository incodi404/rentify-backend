import {z} from "zod"

const emailSchema = z.string().email()
const stringSchema = z.string().regex(/^[a-zA-Z\s]*$/)
const numberSchema = z.string().regex(/^\+\d+(\.\d+)?$/).min(13)
const passwordSchema = z.string().min(8).max(20).regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()\-_=+\\\|\[\]{};:'",<.>\/?]).{8,}$/)
const allNumberSchema = z.number()

function validateEmail(email) {
    try {
        emailSchema.parse(email)
        return true
    } catch (error) {
        return false
    }
}

function validateString(string) {
    try {
        stringSchema.parse(string)
        return true
    } catch (error) {
        console.log(error);
        return false
    }
}

function validateNumber(num) {
    try {
        numberSchema.parse(num)
        return true
    } catch (error) {
        return false
    }
}

function validatePassword(pass) {
    try {
        passwordSchema.parse(pass)
        return true
    } catch (error) {
        return false
    }
}

function allNumberValidation(num) {
    try {
        allNumberSchema.parse(num)
        return true
    } catch (error) {
        console.log(error);
        return false
    }
}

export {validateEmail, validateString, validateNumber, validatePassword, allNumberValidation}