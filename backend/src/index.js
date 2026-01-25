// Load environment variables FIRST
import dotenv from "dotenv";
dotenv.config();

// Core imports
import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import passport from "passport";
import rateLimit from "express-rate-limit";

// Routes
import authRoutes from "./routes/auth.js";
import folderRoutes from "./routes/folders.js";
import fileRoutes from "./routes/files.js";
import trashRoutes from "./routes/trash.js";
import shareRoutes from "./routes/shares.js";
import linkShareRoutes from "./routes/linkShares.js";
import logsRoutes from "./routes/logs.js";
import activityRoutes from "./routes/activity.js";

// Auth providers
import "./auth/google.js";

const app = express();

/*CRITICAL FIX: Trust proxy for Railway deployment*/
// This fixes the X-Forwarded-For header issue and rate limiting
app.set('trust proxy', 1);

/*MIDDLEWARE*/

// CORS Configuration - Allow multiple origins
const allowedOrigins = [
  "https://clouddrive.store",
  "https://www.clouddrive.store",
  'https://cloud-drive-five-lyart.vercel.app', 
  'http://localhost:3000', 
  'http://localhost:5173',
  process.env.FRONTEND_URL  
].filter(Boolean); 

app.use(
  cors({
    origin: function (origin, callback) {
      // Allow requests with no origin (like mobile apps, Postman, or curl)
      if (!origin) return callback(null, true);
      
      // Allow all Vercel preview URLs (*.vercel.app)
      if (origin && origin.includes('.vercel.app')) {
        console.log(`CORS allowed Vercel origin: ${origin}`);
        return callback(null, true);
      }
      
      // Check if origin is in allowed list
      if (allowedOrigins.includes(origin)) {
        console.log(`CORS allowed origin: ${origin}`);
        return callback(null, true);
      }
      
      // Log rejected origin for debugging
      console.warn(`CORS blocked origin: ${origin}`);
      const msg = 'The CORS policy for this site does not allow access from the specified Origin.';
      return callback(new Error(msg), false);
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization", "Cookie"],
  })
);

// Body parsers
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ extended: true, limit: "50mb" }));
app.use(cookieParser());
app.use(passport.initialize());

// Request logger (debug)
app.use((req, res, next) => {
  const time = new Date().toISOString();
  console.log(`[${time}] ${req.method} ${req.path} - Origin: ${req.get('origin') || 'none'} - IP: ${req.ip}`);
  next();
});

/*RATE LIMITING*/

// General API rate limiter
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // 100 requests per 15 minutes
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res) => {
    console.warn(`Rate limit exceeded for IP: ${req.ip}`);
    res.status(429).json({
      error: 'Too many requests from this IP, please try again later.',
      retryAfter: '15 minutes'
    });
  },
  skip: (req) => {
    // Skip rate limiting for health checks
    return req.path === '/api/health' || req.path === '/';
  }
});

// Strict rate limiter for auth endpoints
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // 5 attempts per 15 minutes
  skipSuccessfulRequests: true, // Don't count successful logins
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res) => {
    console.warn(`Auth rate limit exceeded for IP: ${req.ip}`);
    res.status(429).json({
      error: 'Too many authentication attempts, please try again later.',
      retryAfter: '15 minutes'
    });
  }
});

// Apply rate limiting
app.use('/api/', apiLimiter);

/*HEALTH & ROOT*/

app.get("/api/health", (req, res) => {
  res.json({
    status: "ok",
    time: new Date().toISOString(),
    environment: process.env.NODE_ENV || "development",
    proxy: {
      ip: req.ip,
      ips: req.ips,
      trustProxy: app.get('trust proxy')
    }
  });
});

app.get("/", (req, res) => {
  res.json({
    message: "CloudDrive Backend Running",
    version: "1.0.0",
    allowedOrigins: allowedOrigins,
  });
});

/*API ROUTES*/

// Auth routes with stricter rate limiting
app.use("/api/auth", authLimiter, authRoutes);

app.use("/api/folders", folderRoutes);

//Mount trash routes BEFORE general file routes
app.use("/api/files/trash", trashRoutes);

app.use("/api/files", fileRoutes);
app.use("/api/shares", shareRoutes);
app.use("/api/link", linkShareRoutes);
app.use("/api/logs", logsRoutes);
app.use("/api/activity", activityRoutes);

/*404 HANDLER*/

app.use((req, res) => {
  console.log(`404 - ${req.method} ${req.path}`);
  res.status(404).json({
    message: "Route not found",
    path: req.path,
    method: req.method,
  });
});

/*ERROR HANDLER */

app.use((err, req, res, next) => {
  console.error("❌ Error:", err);
  res.status(err.status || 500).json({
    message: err.message || "Internal server error",
    ...(process.env.NODE_ENV === "development" && { stack: err.stack }),
  });
});

/* SERVER START */

const PORT = process.env.PORT || 4000;

app.listen(PORT, () => {
  console.log("=".repeat(60));
  console.log("🚀 CloudDrive Backend Server");
  console.log("=".repeat(60));
  console.log(`🌐 http://localhost:${PORT}`);
  console.log(`📦 ENV: ${process.env.NODE_ENV || "development"}`);
  console.log(`🔒 Trust Proxy: ${app.get('trust proxy')}`);
  console.log(`⏱️  Rate Limiting: Enabled (100 req/15min, Auth: 5 req/15min)`);
  console.log(`\n🌍 Allowed Origins:`);
  allowedOrigins.forEach(origin => console.log(`   ✓ ${origin}`));
  console.log("=".repeat(60));
  console.log("\n📋 Registered Routes:");
  console.log("  - POST   /api/auth/login");
  console.log("  - POST   /api/auth/signup");
  console.log("  - POST   /api/files/:id/trash");
  console.log("  - GET    /api/files/trash");
  console.log("  - PATCH  /api/files/trash/:id/restore");
  console.log("  - DELETE /api/files/trash/:id/permanent");
  console.log("  - DELETE /api/files/trash/empty");
  console.log("=".repeat(60));
  console.log("✅ Server ready to accept connections\n");
});

export default app;