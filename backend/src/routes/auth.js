import express from "express";
import jwt from "jsonwebtoken";
import { supabase } from "../supabase.js";
import { protect } from "../middleware/authMiddleware.js";
import { generateOTP, generateResetToken, getOTPExpiry } from "../utils/otp.js";
import { sendOTPEmail, sendPasswordResetEmail } from "../utils/email.js";
import { sendOTPSMS } from "../utils/sms.js";
import rateLimit from "express-rate-limit";

const router = express.Router();

/* ==================== RATE LIMIT ==================== */
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: process.env.NODE_ENV === 'development' ? 100 : 10,
  message: "Too many attempts, please try again later",
  standardHeaders: true,
  legacyHeaders: false,
});

const otpLimiter = rateLimit({
  windowMs: 5 * 60 * 1000,
  max: process.env.NODE_ENV === 'development' ? 50 : 5,
  message: "Too many OTP requests, please try again later",
  standardHeaders: true,
  legacyHeaders: false,
});

/* ==================== REGISTER ==================== */
router.post("/register", authLimiter, async (req, res) => {
  try {
    console.log("📝 Register request:", req.body.email);
    const { email, password, name, phone } = req.body;
    
    if (!email || !password || !name) {
      return res.status(400).json({ message: "Email, password, and name are required" });
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ message: "Invalid email format" });
    }

    // Validate password strength
    if (password.length < 8) {
      return res.status(400).json({ message: "Password must be at least 8 characters" });
    }

    const { data: authData, error } = await supabase.auth.admin.createUser({
      email,
      password,
      email_confirm: false,
    });

    if (error) {
      console.error("❌ Registration error:", error);
      return res.status(400).json({ message: error.message });
    }

    await supabase.from("profiles").insert({
      id: authData.user.id,
      name,
      phone_number: phone || null,
      email_verified: false,
      phone_verified: false,
    });

    const otp = generateOTP(6);
    await supabase.from("otp_verifications").insert({
      user_id: authData.user.id,
      email,
      otp_code: otp,
      otp_type: "email_verification",
      expires_at: getOTPExpiry(10),
    });

    await sendOTPEmail(email, otp, "verification");
    console.log("✅ User registered:", authData.user.id);

    res.json({
      message: "Registered! Check your email for OTP.",
      userId: authData.user.id,
      email,
      requiresVerification: true,
    });
  } catch (e) {
    console.error("💥 Registration error:", e);
    res.status(500).json({ message: "Registration failed. Please try again." });
  }
});
/* ==================== VERIFY EMAIL ==================== */
router.post("/verify-email", authLimiter, async (req, res) => {
  try {
    console.log("✉️ Email verification request");
    const { email, otp } = req.body;
    
    if (!email || !otp) {
      return res.status(400).json({ message: "Email and OTP are required" });
    }

    // Clean inputs
    const cleanOTP = String(otp).trim();
    const cleanEmail = String(email).trim().toLowerCase();

    console.log("🔍 Verifying OTP:", { email: cleanEmail, otp: cleanOTP });

    // Query WITHOUT .single() to avoid errors when no data exists
    const { data: otpRecords, error: otpError } = await supabase
      .from("otp_verifications")
      .select("*")
      .eq("email", cleanEmail)
      .eq("otp_type", "email_verification")
      .eq("verified", false)
      .order("created_at", { ascending: false })
      .limit(1);

    if (otpError) {
      console.error("❌ Database query error:", otpError);
      return res.status(500).json({ message: "Database error. Please try again." });
    }

    console.log("📋 Found OTP records:", otpRecords?.length || 0);

    // Check if we got any records
    if (!otpRecords || otpRecords.length === 0) {
      console.log("⚠️ No OTP found for email:", cleanEmail);
      return res.status(400).json({ message: "Invalid OTP or OTP already used" });
    }

    const otpData = otpRecords[0];
    console.log("📄 OTP Data:", {
      id: otpData.id,
      stored_otp: otpData.otp_code,
      received_otp: cleanOTP,
      expires_at: otpData.expires_at,
      created_at: otpData.created_at
    });

    // Check expiration
    if (new Date() > new Date(otpData.expires_at)) {
      console.log("⏰ OTP expired");
      return res.status(400).json({ message: "OTP expired. Please request a new one." });
    }

    // Compare OTPs
    const storedOTP = String(otpData.otp_code).trim();
    console.log("🔐 Comparing:", { stored: storedOTP, received: cleanOTP, match: storedOTP === cleanOTP });

    if (storedOTP !== cleanOTP) {
      console.log("❌ OTP mismatch");
      return res.status(400).json({ message: "Incorrect OTP" });
    }

    console.log("✅ OTP verified, updating records...");

    // Update verification status
    const { error: updateError } = await supabase
      .from("otp_verifications")
      .update({ verified: true })
      .eq("id", otpData.id);

    if (updateError) {
      console.error("❌ Update error:", updateError);
      return res.status(500).json({ message: "Failed to verify OTP" });
    }

    // Update profile
    await supabase
      .from("profiles")
      .update({ email_verified: true })
      .eq("id", otpData.user_id);

    // Update auth user
    await supabase.auth.admin.updateUserById(otpData.user_id, { 
      email_confirm: true 
    });

    // Get user data
    const { data: userData, error: userError } = await supabase.auth.admin.getUserById(otpData.user_id);

    if (userError || !userData) {
      console.error("❌ User fetch error:", userError);
      return res.status(500).json({ message: "Failed to get user data" });
    }

    // Generate token
    const token = jwt.sign(
      { id: userData.user.id, email: userData.user.email },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    console.log("✅ Email verified successfully:", cleanEmail);
    res.json({ 
      message: "Email verified successfully", 
      token,
      user: userData.user 
    });

  } catch (e) {
    console.error("💥 Verification error:", e);
    res.status(500).json({ message: "Verification failed. Please try again." });
  }
});

/* ==================== RESEND OTP ==================== */
router.post("/resend-email-otp", otpLimiter, async (req, res) => {
  try {
    console.log("🔄 Resend OTP request");
    const { email } = req.body;
    
    if (!email) {
      return res.status(400).json({ message: "Email is required" });
    }

    const cleanEmail = String(email).trim().toLowerCase();

    const { data: users } = await supabase.auth.admin.listUsers();
    const user = users.users.find((u) => u.email?.toLowerCase() === cleanEmail);
    
    if (!user) {
      console.log("❌ User not found:", cleanEmail);
      return res.status(404).json({ message: "User not found" });
    }

    const { data: profile } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", user.id)
      .single();
    
    if (profile?.email_verified) {
      return res.status(400).json({ message: "Email already verified" });
    }

    const otp = generateOTP(6);
    console.log("🔢 Generated new OTP:", otp, "for:", cleanEmail);

    const { error: insertError } = await supabase
      .from("otp_verifications")
      .insert({
        user_id: user.id,
        email: cleanEmail,
        otp_code: otp,
        otp_type: "email_verification",
        expires_at: getOTPExpiry(10),
      });

    if (insertError) {
      console.error("❌ Insert error:", insertError);
      return res.status(500).json({ message: "Failed to generate OTP" });
    }

    await sendOTPEmail(cleanEmail, otp, "verification");
    console.log("✅ OTP resent to:", cleanEmail);
    
    res.json({ message: "OTP sent successfully" });
  } catch (e) {
    console.error("💥 Resend OTP error:", e);
    res.status(500).json({ message: "Failed to resend OTP. Please try again." });
  }
});
/* ==================== LOGIN ==================== */
router.post("/login", authLimiter, async (req, res) => {
  try {
    console.log("🔐 Login request:", req.body.email);
    const { email, password } = req.body;
    
    if (!email || !password) {
      return res.status(400).json({ message: "Email and password are required" });
    }

    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    
    if (error) {
      console.error("❌ Login error:", error.message);
      return res.status(401).json({ message: "Invalid email or password" });
    }

    const { data: profile } = await supabase.from("profiles").select("*").eq("id", data.user.id).single();
    
    if (!profile?.email_verified) {
      const otp = generateOTP(6);
      await supabase.from("otp_verifications").insert({
        user_id: data.user.id,
        email,
        otp_code: otp,
        otp_type: "email_verification",
        expires_at: getOTPExpiry(10),
      });
      await sendOTPEmail(email, otp, "verification");
      console.log("⚠️ Login blocked - email not verified:", email);
      return res.status(403).json({ 
        message: "Please verify your email first. We've sent you a new OTP.",
        requiresVerification: true,
        email 
      });
    }

    const token = jwt.sign(
      { id: data.user.id, email: data.user.email },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    console.log("✅ Login successful:", email);
    res.json({ token, user: { ...data.user, ...profile } });
  } catch (e) {
    console.error("💥 Login error:", e);
    res.status(500).json({ message: "Login failed. Please try again." });
  }
});

/* ==================== FORGOT PASSWORD ==================== */
router.post("/forgot-password", otpLimiter, async (req, res) => {
  try {
    console.log("📧 Forgot password request received");
    const { email } = req.body;
    
    if (!email) {
      return res.status(400).json({ message: "Email is required" });
    }
    
    console.log("🔍 Looking up user:", email);
    
    const { data: users, error: listError } = await supabase.auth.admin.listUsers();
    
    if (listError) {
      console.error("❌ Error listing users:", listError);
      // Don't reveal the error to prevent user enumeration
      return res.json({ message: "If an account exists, a reset link has been sent" });
    }
    
    const user = users.users.find((u) => u.email === email);
    
    if (!user) {
      console.log("⚠️ User not found, but returning success for security");
      // Always return success to prevent user enumeration
      return res.json({ message: "If an account exists, a reset link has been sent" });
    }
    
    console.log("✅ User found:", user.id);

    const token = generateResetToken();
    console.log("🔑 Generated reset token");
    
    const { error: insertError } = await supabase
      .from("password_reset_tokens")
      .insert({
        user_id: user.id,
        token,
        expires_at: new Date(Date.now() + 3600000), // 1 hour
      });
    
    if (insertError) {
      console.error("❌ Error inserting token:", insertError);
      return res.status(500).json({ message: "Failed to process request. Please try again." });
    }
    
    console.log("✅ Token saved to database");

    const resetLink = `${process.env.FRONTEND_URL}/reset-password?token=${token}`;
    console.log("🔗 Reset link generated");
    
    await sendPasswordResetEmail(email, resetLink);
    
    console.log("✅ Password reset email sent to:", email);
    
    res.json({ message: "If an account exists, a reset link has been sent" });
  } catch (e) {
    console.error("💥 Forgot password error:", e);
    res.status(500).json({ message: "Failed to process request. Please try again." });
  }
});

/* ==================== RESET PASSWORD ==================== */
router.post("/reset-password", authLimiter, async (req, res) => {
  try {
    console.log("🔄 Reset password request received");
    const { token, password } = req.body;
    
    if (!token || !password) {
      return res.status(400).json({ message: "Token and password are required" });
    }

    if (password.length < 8) {
      return res.status(400).json({ message: "Password must be at least 8 characters" });
    }

    const { data: resetToken, error: fetchError } = await supabase
      .from("password_reset_tokens")
      .select("*")
      .eq("token", token)
      .eq("used", false)
      .single();

    if (fetchError || !resetToken) {
      console.error("❌ Token not found or already used");
      
      // Check if token was already used
      const { data: usedToken } = await supabase
        .from("password_reset_tokens")
        .select("*")
        .eq("token", token)
        .single();
      
      if (usedToken?.used) {
        return res.status(400).json({ 
          message: "This reset link has already been used. Please request a new one." 
        });
      }
      
      return res.status(400).json({ 
        message: "Invalid or expired reset token. Please request a new password reset link." 
      });
    }

    if (new Date() > new Date(resetToken.expires_at)) {
      console.log("⏰ Token expired");
      return res.status(400).json({ 
        message: "Reset token has expired. Please request a new one." 
      });
    }

    // Update user's password AND confirm email
    const { error: updateError } = await supabase.auth.admin.updateUserById(
      resetToken.user_id,
      { 
        password: password,
        email_confirm: true  // Confirm email when resetting password
      }
    );

    if (updateError) {
      console.error("❌ Password update error:", updateError);
      return res.status(500).json({ message: "Failed to update password. Please try again." });
    }

    // Also update profile to mark email as verified
    await supabase
      .from("profiles")
      .update({ email_verified: true })
      .eq("id", resetToken.user_id);

    // Mark token as used
    await supabase
      .from("password_reset_tokens")
      .update({ used: true })
      .eq("id", resetToken.id);

    console.log("✅ Password reset successful for user:", resetToken.user_id);

    res.json({ message: "Password reset successful" });
  } catch (e) {
    console.error("💥 Reset password error:", e);
    res.status(500).json({ message: "Password reset failed. Please try again." });
  }
});

/* ==================== LOGOUT ==================== */
router.post("/logout", (req, res) => {
  console.log("👋 Logout request");
  res.json({ message: "Logged out successfully" });
});

/* ==================== GET CURRENT USER (PROTECTED) ==================== */
router.get("/me", protect, async (req, res) => {
  try {
    const { data: profile } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", req.user.id)
      .single();

    res.json({ user: { ...req.user, ...profile } });
  } catch (e) {
    console.error("💥 Get user error:", e);
    res.status(500).json({ message: "Failed to get user" });
  }
});

/* ==================== ADMIN: FIX UNVERIFIED EMAILS (DEV ONLY) ==================== */
router.post("/admin/fix-unverified-users", async (req, res) => {
  // Only allow in development
  if (process.env.NODE_ENV !== 'development') {
    return res.status(403).json({ message: "This endpoint is only available in development" });
  }

  try {
    console.log("🔧 Fixing unverified users...");

    // Get all users with unconfirmed emails
    const { data: users } = await supabase.auth.admin.listUsers();
    
    let fixed = 0;
    for (const user of users.users) {
      if (!user.email_confirmed_at) {
        // Confirm email in auth.users
        await supabase.auth.admin.updateUserById(user.id, {
          email_confirm: true
        });
        
        // Update profile
        await supabase
          .from("profiles")
          .update({ email_verified: true })
          .eq("id", user.id);
        
        fixed++;
        console.log(`✅ Fixed user: ${user.email}`);
      }
    }

    console.log(`✅ Fixed ${fixed} users`);
    res.json({ 
      message: `Successfully fixed ${fixed} unverified users`,
      fixed 
    });
  } catch (e) {
    console.error("💥 Fix unverified users error:", e);
    res.status(500).json({ message: "Failed to fix users" });
  }
});

export default router;