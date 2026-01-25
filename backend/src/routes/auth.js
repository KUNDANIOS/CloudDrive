import express from "express";
import { supabase } from "../supabase.js";
import { protect } from "../middleware/authMiddleware.js";
import rateLimit from "express-rate-limit";

const router = express.Router();

/* =========================
   RATE LIMITERS
========================= */
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: process.env.NODE_ENV === "development" ? 100 : 10,
  message: "Too many attempts, please try again later",
  standardHeaders: true,
  legacyHeaders: false,
});

/* =========================
   REGISTER
========================= */
router.post("/register", authLimiter, async (req, res) => {
  try {
    const { email, password, name, phone } = req.body;

    if (!email || !password || !name) {
      return res
        .status(400)
        .json({ message: "Email, password, and name are required" });
    }

    const cleanEmail = email.trim().toLowerCase();

    const { data, error } = await supabase.auth.signUp({
      email: cleanEmail,
      password,
      options: {
        emailRedirectTo: `${process.env.FRONTEND_URL}/auth/callback`,
      },
    });

    if (error) {
      return res.status(400).json({ message: error.message });
    }

    // Create profile row
    await supabase.from("profiles").insert({
      id: data.user.id,
      name,
      phone_number: phone || null,
      email_verified: false,
    });

    return res.json({
      success: true,
      message: "Registration successful. Please check your email to verify.",
    });
  } catch (err) {
    console.error("Register error:", err);
    res.status(500).json({ message: "Registration failed" });
  }
});

/* =========================
   LOGIN
========================= */
router.post("/login", authLimiter, async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res
        .status(400)
        .json({ message: "Email and password are required" });
    }

    const cleanEmail = email.trim().toLowerCase();

    const { data, error } = await supabase.auth.signInWithPassword({
      email: cleanEmail,
      password,
    });

    if (error) {
      return res.status(401).json({ message: error.message });
    }

    // 🚨 Email not verified
    if (!data.user.email_confirmed_at) {
      return res.status(403).json({
        requiresVerification: true,
        message: "Please verify your email before logging in",
      });
    }

    const { data: profile } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", data.user.id)
      .single();

    return res.json({
      success: true,
      session: data.session,
      user: { ...data.user, ...profile },
    });
  } catch (err) {
    console.error("Login error:", err);
    res.status(500).json({ message: "Login failed" });
  }
});

/* =========================
   FORGOT PASSWORD
   (Supabase handles tokens)
========================= */
router.post("/forgot-password", async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ message: "Email is required" });
    }

    await supabase.auth.resetPasswordForEmail(email.trim().toLowerCase(), {
      redirectTo: `${process.env.FRONTEND_URL}/reset-password`,
    });

    return res.json({
      message: "If an account exists, a reset link has been sent.",
    });
  } catch (err) {
    console.error("Forgot password error:", err);
    res.status(500).json({ message: "Failed to process request" });
  }
});

/* =========================
   LOGOUT
========================= */
router.post("/logout", async (req, res) => {
  // Supabase logout handled client-side
  return res.json({ message: "Logged out successfully" });
});

/* =========================
   GET CURRENT USER (PROTECTED)
========================= */
router.get("/me", protect, async (req, res) => {
  try {
    const { data: profile } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", req.user.id)
      .single();

    res.json({ user: { ...req.user, ...profile } });
  } catch (err) {
    console.error("Get user error:", err);
    res.status(500).json({ message: "Failed to get user" });
  }
});

export default router;
