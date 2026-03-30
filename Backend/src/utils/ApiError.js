class ApiError extends Error {
     constructor(
        statusCode,
        message= "Something went wrong",
        errors = [],
        stack = ""
    ){
        // this.message = message
        super(message)
        // ehat does super(message) do ? it calls the constructor of the parent class (Error) and passes the message argument to it, which sets the message property of the error object. This allows us to use the built-in functionality of the Error class while also adding our own custom properties and methods to the ApiError class.
        this.statusCode = statusCode
        this.data = null
        this.success = false;
        this.errors = errors

        if (stack) {
            this.stack = stack
        } else{
            Error.captureStackTrace(this, this.constructor)
        }

    }
}

export {ApiError}