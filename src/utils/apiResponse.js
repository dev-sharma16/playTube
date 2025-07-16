// ? this file is for making the 'response' consistence throughout the codebase 

class ApiResponse {
    constructor(statusCode, data, message= "Success"){
        this.statusCode = statusCode
        this.data = data
        this.message = message
        this.success = statusCode < 400
    }
}

export { ApiResponse }