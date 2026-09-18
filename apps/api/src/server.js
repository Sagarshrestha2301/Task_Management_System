import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import { requestLogger } from "./middleware/request-logger.js";
import { errorHandler, notFoundHandler } from "./middleware/error-handler.js";
import { createApiRouter } from "./modules/api.js";
import { prisma } from "./lib/prisma.js";
const app = express();
const PORT = Number(process.env.PORT) || 3001;
const API_ORIGIN = process.env.API_ORIGIN || "http://localhost:3001";
const APP_ORIGIN = process.env.APP_ORIGIN || "http://localhost:5173";
app.use(express.json({ limit: "1mb" }));
app.use(cookieParser());
app.use(cors({
    origin: [APP_ORIGIN],
    credentials: true,
    methods: ["GET", "POST", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization", "X-Request-ID"],
}));
app.use(requestLogger);
app.use(createApiRouter());
app.use(notFoundHandler);
app.use(errorHandler);
app.use(notFoundHandler);
app.use(errorHandler);
async function start() {
    try {
        await prisma.$connect();
        console.log("Connected to PostgreSQL");
        app.listen(PORT, "0.0.0.0", () => {
            console.log(`API server running on port ${PORT}`);
        });
    }
    catch (err) {
        console.error("Failed to start server:", err);
        process.exit(1);
    }
}
start();
export { app };
