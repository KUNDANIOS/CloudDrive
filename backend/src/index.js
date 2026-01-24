// Load environment variables FIRST
import dotenv from "dotenv";
dotenv.config();

// Core imports
import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import passport from "passport";

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

/*MIDDLEWARE*/

// CORS Configuration - Allow multiple origins
const allowedOrigins = [
  'https://cloud-drive-five-lyart.vercel.app', // Production Vercel
  'http://localhost:3000', // Local development
  'http://localhost:5173', // Vite development
  process.env.FRONTEND_URL // Additional custom frontend URL
].filter(Boolean); // Remove undefined values

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
  console.log(`[${time}] ${req.method} ${req.path} - Origin: ${req.get('origin') || 'none'}`);
  next();
});

/*HEALTH & ROOT*/

app.get("/api/health", (req, res) => {
  res.json({
    status: "ok",
    time: new Date().toISOString(),
    environment: process.env.NODE_ENV || "development",
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

app.use("/api/auth", authRoutes);
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
  console.error(" Error:", err);
  res.status(err.status || 500).json({
    message: err.message || "Internal server error",
    ...(process.env.NODE_ENV === "development" && { stack: err.stack }),
  });
});

/* SERVER START */

const PORT = process.env.PORT || 4000;

app.listen(PORT, () => {
  console.log("=".repeat(60));
  console.log("CloudDrive Backend Server");
  console.log("=".repeat(60));
  console.log(`http://localhost:${PORT}`);
  console.log(`ENV: ${process.env.NODE_ENV || "development"}`);
  console.log(`Allowed Origins:`);
  allowedOrigins.forEach(origin => console.log(`   - ${origin}`));
  console.log("=".repeat(60));
  console.log("");
  console.log("Registered Routes:");
  console.log("  - POST   /api/files/:id/trash");
  console.log("  - GET    /api/files/trash");
  console.log("  - PATCH  /api/files/trash/:id/restore");
  console.log("  - DELETE /api/files/trash/:id/permanent");
  console.log("  - DELETE /api/files/trash/empty");
  console.log("=".repeat(60));
});

export default app;