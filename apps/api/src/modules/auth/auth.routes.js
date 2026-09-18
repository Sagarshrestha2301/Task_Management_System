import { Router } from "express";
import { register, login, logout, getSession, changePassword, forgotPassword, resetPassword, } from "./auth.controller.js";
import { authRateLimiter } from "../../middleware/rate-limiter.js";
export function createAuthRouter() {
    const router = Router();
    router.use(authRateLimiter);
    router.post("/register", register);
    router.post("/login", login);
    router.post("/logout", logout);
    router.get("/session", getSession);
    router.post("/change-password", changePassword);
    router.post("/forgot-password", forgotPassword);
    router.post("/reset-password", resetPassword);
    return router;
}
