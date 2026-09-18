export function healthCheck(_req, res, _next) {
    res.json({ status: "ok", timestamp: new Date().toISOString() });
}
export function readinessCheck(_req, res, _next) {
    res.json({ status: "ready", timestamp: new Date().toISOString() });
}
