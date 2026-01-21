import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";
import passport from "passport";

import authRoutes from "./routes/auth.js";
import folderRoutes from "./routes/folders.js";
import fileRoutes from "./routes/files.js";
import trashRoutes from "./routes/trash.js";
import shareRoutes from "./routes/shares.js";
import linkShareRoutes from "./routes/linkShares.js";
import logsRoutes from "./routes/logs.js";
import activityRoutes from "./routes/activity.js";
import "./auth/google.js";

// Load environment variables FIRST
dotenv.config();

const app = express();

// CORS configuration - MUST be before routes
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'Cookie']
}));

// Body parsers - MUST be before routes
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));
app.use(cookieParser());
app.use(passport.initialize());

// Request logging middleware - helps debug
app.use((req, res, next) => {
  const timestamp = new Date().toISOString();
  console.log(`[${timestamp}] ${req.method} ${req.path}`);
  
  // Log request body for auth routes (excluding sensitive fields)
  if (req.path.startsWith('/api/auth')) {
    const sanitizedBody = { ...req.body };
    if (sanitizedBody.password) sanitizedBody.password = '***';
    if (sanitizedBody.otp) sanitizedBody.otp = '***';
    console.log('  Body:', sanitizedBody);
  }
  
  next();
});

// Health check endpoint
app.get("/api/health", (req, res) => {
  res.json({ 
    status: "ok", 
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development'
  });
});

// Root test
app.get("/", (req, res) => {
  res.json({ 
    message: "Cloud Drive Backend Running",
    version: "1.0.0",
    endpoints: [
      "GET  /api/health",
      "POST /api/auth/register",
      "POST /api/auth/login",
      "POST /api/auth/forgot-password",
      "POST /api/auth/reset-password",
      "POST /api/auth/verify-email",
      "POST /api/auth/resend-email-otp"
    ]
  });
});

// API Routes
app.use("/api/auth", authRoutes);
app.use("/api/folders", folderRoutes);
app.use("/api/files", fileRoutes);
app.use("/api/trash", trashRoutes);
app.use("/api/shares", shareRoutes);
app.use("/api/link", linkShareRoutes);
app.use("/api/logs", logsRoutes);
app.use("/api/activity", activityRoutes);

// 404 handler - MUST be after all routes
app.use((req, res) => {
  console.log(`❌ 404 - Route not found: ${req.method} ${req.path}`);
  res.status(404).json({ 
    message: "Route not found",
    path: req.path,
    method: req.method
  });
});

// Global error handler
app.use((err, req, res, next) => {
  console.error("💥 Global error handler:", err);
  res.status(err.status || 500).json({
    message: err.message || "Internal server error",
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
});

const PORT = process.env.PORT || 4000;

app.listen(PORT, () => {
  console.log("=".repeat(60));
  console.log(`🚀 CloudDrive Backend Server`);
  console.log("=".repeat(60));
  console.log(`📍 Server running on: http://localhost:${PORT}`);
  console.log(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`🔗 Frontend URL: ${process.env.FRONTEND_URL || 'http://localhost:3000'}`);
  console.log(`📧 Email service: ${process.env.RESEND_API_KEY ? '✅ Configured' : '❌ Not configured'}`);
  console.log(`📱 SMS service: ${process.env.TWILIO_ACCOUNT_SID ? '✅ Configured' : '❌ Not configured'}`);
  console.log(`🗄️  Database: ${process.env.SUPABASE_URL ? '✅ Connected' : '❌ Not configured'}`);
  console.log("=".repeat(60));
  console.log(`\n✨ Ready to accept requests!\n`);
});

export default app;