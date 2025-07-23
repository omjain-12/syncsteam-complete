import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import morgan from "morgan";
import rateLimit from "express-rate-limit";
import helmet from "helmet";

const app = express();

// Security middleware
app.use(helmet());

// Rate limiting
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // limit each IP to 100 requests per windowMs
    message: "Too many requests from this IP, please try again later."
});
app.use("/api/", limiter);

// CORS configuration
app.use(
    cors({
        origin: process.env.CORS_ORIGIN,
        credentials: true,
        methods: ["GET", "POST", "PUT", "DELETE", "PATCH"],
        allowedHeaders: ["Content-Type", "Authorization"]
    })
);

// Body parsing middleware
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ extended: true, limit: "50mb" }));
app.use(express.static("public"));
app.use(cookieParser());
app.use(morgan("combined")); // More detailed logging

// Health check endpoint
app.get("/health", (req, res) => {
    res.status(200).json({
        status: "success",
        message: "StreamHub Media Platform is running",
        timestamp: new Date().toISOString(),
        version: "2.0.0"
    });
});

// API Routes
import authRoutes from "./features/authentication/auth.routes.js";
import contentRoutes from "./features/content-management/content.routes.js";
import socialRoutes from "./features/social-interactions/social.routes.js";
import analyticsRoutes from "./features/analytics/analytics.routes.js";
import profileRoutes from "./features/user-profile/profile.routes.js";
import systemRoutes from "./core/system/system.routes.js";

// Route declarations with new structure
app.use("/api/v1/auth", authRoutes);
app.use("/api/v1/content", contentRoutes);
app.use("/api/v1/social", socialRoutes);
app.use("/api/v1/analytics", analyticsRoutes);
app.use("/api/v1/profile", profileRoutes);
app.use("/api/v1/system", systemRoutes);

// Global error handler
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(err.statusCode || 500).json({
        status: "error",
        message: err.message || "Internal Server Error",
        ...(process.env.NODE_ENV === "development" && { stack: err.stack })
    });
});

// 404 handler
app.use("*", (req, res) => {
    res.status(404).json({
        status: "error",
        message: "API endpoint not found",
        requestedUrl: req.originalUrl
    });
});

export default app;
