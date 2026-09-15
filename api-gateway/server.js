require("dotenv").config();
const express = require("express");
const { createProxyMiddleware } = require("http-proxy-middleware");
const verifyToken = require("./verifyToken");

const app = express();

const REGISTRATION_SERVICE_URL = process.env.REGISTRATION_SERVICE_URL || "http://localhost:5001";
const LOGIN_SERVICE_URL = process.env.LOGIN_SERVICE_URL || "http://localhost:5002";
const ADMIN_SERVICE_URL = process.env.ADMIN_SERVICE_URL || "http://localhost:5003";
const USER_SERVICE_URL = process.env.USER_SERVICE_URL || "http://localhost:5004";

// No express.json() here on purpose — http-proxy-middleware needs the
// raw request stream to forward bodies correctly.

// Public routes — no token required
app.use(
  "/register",
  createProxyMiddleware({
    target: REGISTRATION_SERVICE_URL,
    changeOrigin: true,
    pathRewrite: (path, req) => "/register" + path,
  })
);

app.use(
  "/auth",
  createProxyMiddleware({
    target: LOGIN_SERVICE_URL,
    changeOrigin: true,
    pathRewrite: (path, req) => "/auth" + path,
  })
);

// Protected routes — JWT + role required
app.use(
  "/admin",
  verifyToken("admin"),
  createProxyMiddleware({
    target: ADMIN_SERVICE_URL,
    changeOrigin: true,
    pathRewrite: (path, req) => "/admin" + path,
  })
);

app.use(
  "/user",
  verifyToken("user"),
  createProxyMiddleware({
    target: USER_SERVICE_URL,
    changeOrigin: true,
    pathRewrite: (path, req) => "/user" + path,
  })
);

app.get("/", (req, res) => res.send("API Gateway is running. Route through /register, /auth, /admin, /user"));

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`API Gateway running on port ${PORT}`));