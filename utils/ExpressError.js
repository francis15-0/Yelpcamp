class expressError extends Error{
    constructor(message, statusCode){
        this.message = message
        this.statusCode = statusCode;
    }
}

module.exports = expressError;