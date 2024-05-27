function ApiResponse (
    statusCode,
    message,
    data={}
) {
    return {
        statusCode: statusCode,
        message: message,
        data: data,
        success: true
    }
}

export {ApiResponse}