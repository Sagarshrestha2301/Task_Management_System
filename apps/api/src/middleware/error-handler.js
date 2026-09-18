export function notFoundHandler(req, res, next) {
    const requestId = req.id ?? "unknown";
    res.status(404).json({
        error: {
            code: "NOT_FOUND",
            message: "The requested resource was not found.",
            requestId,
        },
    });
}
export function errorHandler(err, req, res, next) {
    const requestId = req.id ?? "unknown";
    console.error(JSON.stringify({
        timestamp: new Date().toISOString(),
        level: "error",
        requestId,
        message: err.message,
    }));
    res.status(500).json({
        error: {
            code: "INTERNAL",
            message: "An unexpected error occurred.",
            requestId,
        },
    });
}
