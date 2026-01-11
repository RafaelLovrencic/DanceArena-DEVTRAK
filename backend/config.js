const FRONTEND_URL = process.env.NODE_ENV === "production"
    ? "https://dance-arena-devtrak.vercel.app"
    : "http://localhost:5173";

module.exports = { FRONTEND_URL };