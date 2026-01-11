const FRONTEND_URL = process.env.NODE_ENV === "production"
    ? "https://dancearena-devtrak.onrender.com"
    : "http://localhost:5173";

module.exports = { FRONTEND_URL };