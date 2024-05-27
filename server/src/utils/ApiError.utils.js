function ApiError(statusCode, message, data={}) {
    return {
        statusCode: statusCode,
        message: message,
        data: data
    }
}

export {ApiError}