/**
 * Enhanced API Error class with additional context
 */
class ApiError extends Error {
    constructor(
        statusCode,
        message = "Something went wrong",
        errors = [],
        stack = "",
        code = null
    ) {
        super(message);
        this.statusCode = statusCode;
        this.data = null;
        this.message = message;
        this.success = false;
        this.errors = errors;
        this.code = code;
        this.timestamp = new Date().toISOString();

        if (stack) {
            this.stack = stack;
        } else {
            Error.captureStackTrace(this, this.constructor);
        }
    }

    // Factory methods for common errors
    static badRequest(message = "Bad Request", code = "BAD_REQUEST") {
        return new ApiError(400, message, [], "", code);
    }

    static unauthorized(message = "Unauthorized", code = "UNAUTHORIZED") {
        return new ApiError(401, message, [], "", code);
    }

    static forbidden(message = "Forbidden", code = "FORBIDDEN") {
        return new ApiError(403, message, [], "", code);
    }

    static notFound(message = "Not Found", code = "NOT_FOUND") {
        return new ApiError(404, message, [], "", code);
    }

    static conflict(message = "Conflict", code = "CONFLICT") {
        return new ApiError(409, message, [], "", code);
    }

    static validation(
        message = "Validation Failed",
        errors = [],
        code = "VALIDATION_ERROR"
    ) {
        return new ApiError(422, message, errors, "", code);
    }

    static internal(
        message = "Internal Server Error",
        code = "INTERNAL_ERROR"
    ) {
        return new ApiError(500, message, [], "", code);
    }

    static rateLimit(message = "Too Many Requests", code = "RATE_LIMIT") {
        return new ApiError(429, message, [], "", code);
    }

    // Convert to plain object for logging
    toObject() {
        return {
            statusCode: this.statusCode,
            message: this.message,
            code: this.code,
            errors: this.errors,
            timestamp: this.timestamp,
            stack: this.stack
        };
    }
}

export default ApiError;
