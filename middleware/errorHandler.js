export function errorHandler(err, _req, res, _next) {
    // Log error for debugging (in production, use proper logger)
    console.error("Error caught by errorHandler:", err);

    // MongoDB duplicate key error
    if (err.code === 11000) {
        const field = Object.keys(err.keyPattern || {})[0] || "field";
        return res.status(409).json({
            error: "Duplicate entry",
            message: `A resource with this ${field} already exists`,
        });
    }

    // Joi validation error (if thrown rather than returned)
    if (err.name === "ValidationError" && err.isJoi) {
        return res.status(400).json({
            error: "Validation error",
            details: err.details[0].message,
        });
    }

    // MongoDB CastError (invalid ObjectId format, etc.)
    if (err.name === "CastError") {
        return res.status(400).json({
            error: "Invalid ID format",
            message: err.message,
        });
    }

    // Custom application errors (you can create these in your services)
    if (err.statusCode) {
        return res.status(err.statusCode).json({
            error: err.message,
        });
    }

    // Default 500 error
    res.status(500).json({
        error: "Internal server error",
        message: process.env.NODE_ENV === "development" ? err.message : "Something went wrong",
    });
}
