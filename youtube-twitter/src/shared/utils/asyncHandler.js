/**
 * Advanced async handler with error context and logging
 */
const asyncHandler = (requestHandler) => {
    return async (req, res, next) => {
        try {
            await Promise.resolve(requestHandler(req, res, next));
        } catch (error) {
            // Enhanced error logging
            console.error(
                `[${new Date().toISOString()}] Error in ${req.method} ${
                    req.path
                }:`,
                {
                    message: error.message,
                    stack: error.stack,
                    userId: req.profile?._id,
                    userAgent: req.get("User-Agent"),
                    ip: req.ip
                }
            );

            // Determine status code
            const statusCode = error.statusCode || error.status || 500;

            // Enhanced error response
            const errorResponse = {
                success: false,
                error: {
                    message: error.message || "Internal Server Error",
                    code: error.code || "UNKNOWN_ERROR",
                    timestamp: new Date().toISOString(),
                    path: req.path,
                    method: req.method
                }
            };

            // Add stack trace in development
            if (process.env.NODE_ENV === "development") {
                errorResponse.error.stack = error.stack;
            }

            // Add validation errors if present
            if (error.name === "ValidationError") {
                errorResponse.error.details = Object.values(error.errors).map(
                    (err) => ({
                        field: err.path,
                        message: err.message
                    })
                );
            }

            res.status(statusCode).json(errorResponse);
        }
    };
};

export default asyncHandler;
