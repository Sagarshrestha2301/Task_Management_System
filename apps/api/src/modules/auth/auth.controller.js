import { makeErrorResponse } from "../../lib/errors.js";
import { generateRequestId } from "../../lib/request-id.js";
import { registerSchema, loginSchema, changePasswordSchema, forgotPasswordSchema, resetPasswordSchema, } from "./schemas.js";
import * as authService from "./auth.service.js";
const SESSION_COOKIE_NAME = "session";
function formatZodErrors(errors) {
    const formatted = {};
    for (const [key, messages] of Object.entries(errors)) {
        formatted[key] = messages.join(", ");
    }
    return formatted;
}
function setSessionCookie(res, secret, expiresAt) {
    res.cookie(SESSION_COOKIE_NAME, secret, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        path: "/",
        expires: expiresAt,
    });
}
function clearSessionCookie(res) {
    res.clearCookie(SESSION_COOKIE_NAME, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        path: "/",
    });
}
function getSessionSecret(req) {
    return req.cookies?.[SESSION_COOKIE_NAME] ?? null;
}
export async function register(req, res, next) {
    const requestId = generateRequestId();
    res.setHeader("X-Request-ID", requestId);
    try {
        const parseResult = registerSchema.safeParse(req.body);
        if (!parseResult.success) {
            res
                .status(400)
                .json(makeErrorResponse("VALIDATION_ERROR", "Invalid request.", requestId, formatZodErrors(parseResult.error.flatten().fieldErrors)));
            return;
        }
        const result = await authService.registerUser({
            email: parseResult.data.email,
            name: parseResult.data.displayName,
            password: parseResult.data.password,
        });
        const session = await authService.createSession(result.user.id, req.ip, req.get("user-agent"));
        setSessionCookie(res, session.secret, session.expiresAt);
        res.status(201).json({
            user: result.user,
        });
    }
    catch (err) {
        if (err instanceof Error && err.message === "USER_EXISTS") {
            res
                .status(409)
                .json(makeErrorResponse("CONFLICT", "An account with this email already exists.", requestId));
            return;
        }
        next(err);
    }
}
export async function login(req, res, next) {
    const requestId = generateRequestId();
    res.setHeader("X-Request-ID", requestId);
    try {
        const parseResult = loginSchema.safeParse(req.body);
        if (!parseResult.success) {
            res
                .status(400)
                .json(makeErrorResponse("VALIDATION_ERROR", "Login failed.", requestId, formatZodErrors(parseResult.error.flatten().fieldErrors)));
            return;
        }
        const result = await authService.loginUser({
            email: parseResult.data.email,
            password: parseResult.data.password,
            ip: req.ip,
            userAgent: req.get("user-agent"),
        });
        if (!result) {
            // Generic error for enumeration resistance
            res
                .status(401)
                .json(makeErrorResponse("UNAUTHENTICATED", "Invalid credentials.", requestId));
            return;
        }
        setSessionCookie(res, result.secret, result.expiresAt);
        res.json({
            user: result.user,
        });
    }
    catch (err) {
        next(err);
    }
}
export async function logout(req, res, next) {
    const requestId = generateRequestId();
    res.setHeader("X-Request-ID", requestId);
    try {
        const secret = getSessionSecret(req);
        if (secret) {
            const session = await authService.validateSession(secret);
            if (session) {
                await authService.revokeSession(session.sessionId);
            }
        }
        clearSessionCookie(res);
        res.status(204).send();
    }
    catch (err) {
        next(err);
    }
}
export async function getSession(req, res, next) {
    const requestId = generateRequestId();
    res.setHeader("X-Request-ID", requestId);
    try {
        const secret = getSessionSecret(req);
        if (!secret) {
            res
                .status(401)
                .json(makeErrorResponse("UNAUTHENTICATED", "No active session.", requestId));
            return;
        }
        const session = await authService.validateSession(secret);
        if (!session) {
            clearSessionCookie(res);
            res
                .status(401)
                .json(makeErrorResponse("UNAUTHENTICATED", "Session expired or invalid.", requestId));
            return;
        }
        res.json({ user: session.user });
    }
    catch (err) {
        next(err);
    }
}
export async function changePassword(req, res, next) {
    const requestId = generateRequestId();
    res.setHeader("X-Request-ID", requestId);
    try {
        const secret = getSessionSecret(req);
        if (!secret) {
            res
                .status(401)
                .json(makeErrorResponse("UNAUTHENTICATED", "Authentication required.", requestId));
            return;
        }
        const session = await authService.validateSession(secret);
        if (!session) {
            clearSessionCookie(res);
            res
                .status(401)
                .json(makeErrorResponse("UNAUTHENTICATED", "Session expired.", requestId));
            return;
        }
        const parseResult = changePasswordSchema.safeParse(req.body);
        if (!parseResult.success) {
            res
                .status(400)
                .json(makeErrorResponse("VALIDATION_ERROR", "Invalid request.", requestId, formatZodErrors(parseResult.error.flatten().fieldErrors)));
            return;
        }
        await authService.changePassword(session.user.id, parseResult.data.currentPassword, parseResult.data.newPassword);
        clearSessionCookie(res);
        res.status(204).send();
    }
    catch (err) {
        if (err instanceof Error && err.message === "INVALID_CURRENT_PASSWORD") {
            res
                .status(400)
                .json(makeErrorResponse("VALIDATION_ERROR", "Current password is incorrect.", requestId, { currentPassword: "Current password is incorrect." }));
            return;
        }
        if (err instanceof Error && err.message === "USER_NOT_FOUND") {
            res
                .status(404)
                .json(makeErrorResponse("NOT_FOUND", "User not found.", requestId));
            return;
        }
        next(err);
    }
}
export async function forgotPassword(req, res, next) {
    const requestId = generateRequestId();
    res.setHeader("X-Request-ID", requestId);
    try {
        const parseResult = forgotPasswordSchema.safeParse(req.body);
        if (!parseResult.success) {
            res
                .status(400)
                .json(makeErrorResponse("VALIDATION_ERROR", "Invalid request.", requestId, formatZodErrors(parseResult.error.flatten().fieldErrors)));
            return;
        }
        // Always return success for enumeration resistance
        await authService.requestPasswordReset(parseResult.data.email);
        res.status(204).send();
    }
    catch (err) {
        next(err);
    }
}
export async function resetPassword(req, res, next) {
    const requestId = generateRequestId();
    res.setHeader("X-Request-ID", requestId);
    try {
        const parseResult = resetPasswordSchema.safeParse(req.body);
        if (!parseResult.success) {
            res
                .status(400)
                .json(makeErrorResponse("VALIDATION_ERROR", "Invalid request.", requestId, formatZodErrors(parseResult.error.flatten().fieldErrors)));
            return;
        }
        await authService.resetPassword(parseResult.data.token, parseResult.data.newPassword);
        res.status(204).send();
    }
    catch (err) {
        if (err instanceof Error && err.message === "INVALID_OR_EXPIRED_TOKEN") {
            res
                .status(400)
                .json(makeErrorResponse("VALIDATION_ERROR", "Invalid or expired reset token.", requestId, { token: "Invalid or expired reset token." }));
            return;
        }
        next(err);
    }
}
