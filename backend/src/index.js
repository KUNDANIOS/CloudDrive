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

/*CORS CONFIGURATION */

const allowedOrigins = [
  "https://clouddrive.store",
  "https://www.clouddrive.store",
  "https://cloud-drive-five-lyart.vercel.app",
  "http://localhost:3000",
  "http://localhost:5173",
  process.env.FRONTEND_URL,
].filter(Boolean);

app.use(
  cors({
    origin: function (origin, callback) {
      // Allow server-to-server, Postman, curl
      if (!origin) return callback(null, true);

      // Allow all Vercel preview deployments
      if (origin.endsWith(".vercel.app")) {
        return callback(null, true);
      }

      // Allow explicitly whitelisted origins
      if (allowedOrigins.includes(origin)) {
        return callback(null, true);
      }

      console.warn("❌ CORS blocked:", origin);
      return callback(null, false); // DO NOT throw error
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization", "Cookie"],
  })
);

// REQUIRED: handle preflight requests
app.options("*", cors());

/*BODY & AUTH MIDDLEWARE */

app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ extended: true, limit: "50mb" }));
app.use(cookieParser());
app.use(passport.initialize());

/*REQUEST LOGGER (DEBUG)*/

app.use((req, res, next) => {
  console.log(
    `[${new Date().toISOString()}] ${req.method} ${req.path} | Origin: ${
      req.headers.origin || "none"
    }`
  );
  next();
});

/*HEALTH & ROOT */

app.get("/api/health", (req, res) => {
  res.json({
    status: "ok",
    time: new Date().toISOString(),
    env: process.env.NODE_ENV || "development",
  });
});

app.get("/", (req, res) => {
  res.json({
    message: "CloudDrive Backend Running",
    allowedOrigins,
  });
});

/*API ROUTES*/

app.use("/api/auth", authRoutes);
app.use("/api/folders", folderRoutes);

// Trash routes MUST come before files
app.use("/api/files/trash", trashRoutes);
app.use("/api/files", fileRoutes);

app.use("/api/shares", shareRoutes);
app.use("/api/link", linkShareRoutes);
app.use("/api/logs", logsRoutes);
app.use("/api/activity", activityRoutes);

/*404 HANDLER*/

app.use((req, res) => {
  res.status(404).json({
    message: "Route not found",
    method: req.method,
    path: req.path,
  });
});

/*GLOBAL ERROR HANDLER*/

app.use((err, req, res, next) => {
  console.error(" Server Error:", err.message);
  res.status(err.status || 500).json({
    message: err.message || "Internal Server Error",
    ...(process.env.NODE_ENV === "development" && { stack: err.stack }),
  });
});

/*SERVER START*/

const PORT = process.env.PORT || 4000;

app.listen(PORT, () => {
  console.log("=".repeat(60));
  console.log(" CloudDrive Backend Server Running");
  console.log(` PORT: ${PORT}`);
  console.log(` ENV: ${process.env.NODE_ENV || "development"}`);
  console.log("Allowed Origins:");
  allowedOrigins.forEach((o) => console.log("   -", o));
  console.log("=".repeat(60));
});

export default app;
