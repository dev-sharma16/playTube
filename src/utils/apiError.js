// ? this file is for making the 'error' consistence throughout the codebase ,so we don't need to learn what i pass first status code or message

// * this class extends the og 'Error' class read NodeJs Docs for more info

class ApiErrors extends Error {
    constructor(
        statusCode,
        message = "Something went Wrong.!",
        errors = [],
        stack = ""
    ){
        super(message)
        this.statusCode = statusCode
        this.data = null
        this.message = message
        this.success = false
        this.errors = errors

        if (stack) {
            this.stack = stack
        } else {
            Error.captureStackTrace(this, this.constructor)
        }
    }
}

export {ApiErrors}