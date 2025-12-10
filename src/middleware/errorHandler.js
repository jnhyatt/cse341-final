export function errorHandler(err, _req, res, _next) {
    console.error("Error:", err);

    // MongoDB duplicate key error
    if (err.code === 11000) {
        const field = Object.keys(err.keyPattern || {})[0] || "field";
        return res.status(409).json({
            error: "Duplicate entry",
            message: `A resource with this ${field} already exists`,
        });
    }

    if (err.name === "ValidationError" && err.isJoi) {
        return res.status(400).json({
            error: "Validation error",
            details: err.details[0].message,
        });
    }

    if (err.name === "CastError") {
        return res.status(400).json({
            error: "Invalid ID format",
            message: err.message,
        });
    }

    if (err.statusCode) {
        return res.status(err.statusCode).json({
            error: err.message,
        });
    }

    res.status(500).json({
        error: "Internal server error",
        message: process.env.NODE_ENV === "development" ? err.message : "Something went wrong",
    });
}

export class AppError extends Error {
    constructor(message, statusCode) {
        super(message);
        this.statusCode = statusCode;
        Error.captureStackTrace(this, this.constructor);
    }
}
