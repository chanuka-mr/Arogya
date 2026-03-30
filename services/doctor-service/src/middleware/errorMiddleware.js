const notFound = (req, res, next) => {
    const error = new Error(`Route not found: ${req.originalUrl}`);
    error.statusCode = 404;
    next(error);
};

const errorHandler = (error, req, res, next) => {
    let statusCode = error.statusCode || res.statusCode || 500;
    let message = error.message || "Internal server error";

    if (error.name === "CastError") {
        statusCode = 400;
        message = "Invalid resource id";
    }

    if (error.code === 11000) {
        statusCode = 409;
        message = `Duplicate value for ${Object.keys(error.keyValue).join(", ")}`;
    }

    if (error.name === "ValidationError") {
        statusCode = 400;
        message = Object.values(error.errors)
            .map((item) => item.message)
            .join(", ");
    }

    res.status(statusCode).json({
        message
    });
};

module.exports = {
    notFound,
    errorHandler
};
