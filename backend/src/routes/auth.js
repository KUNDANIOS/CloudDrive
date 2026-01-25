import express from "express";
import jwt from "jsonwebtoken";
import { supabase } from "../supabase.js";
import { protect } from "../middleware/authMiddleware.js";
import { generateOTP, generateResetToken, getOTPExpiry } from "../utils/otp.js";
import { sendOTPEmail, sendPasswordResetEmail } from "../utils/email.js";
import { sendOTPSMS } from "../utils/sms.js";
import rateLimit from "express-rate-limit";

const router = express.Router();

/*RATE LIMIT*/
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

/*REGISTER*/
router.post("/register", authLimiter, async (req, res) => {
  try {
    console.log("Register request:", req.body.email);
    const { email, password, name, phone } = req.body;
    
    if (!email || !password || !name) {
      return res.status(400).json({ message: "Email, password, and name are required" });
    }

    const cleanEmail = String(email).trim().toLowerCase();

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(cleanEmail)) {
      return res.status(400).json({ message: "Invalid email format" });
    }

    if (password.length < 8) {
      return res.status(400).json({ message: "Password must be at least 8 characters" });
    }

    const { data: authData, error } = await supabase.auth.admin.createUser({
      email: cleanEmail,
      password,
      email_confirm: false,
    });

    if (error) {
      console.error("Registration error:", error);
      return res.status(400).json({ message: error.message });
    }

    await supabase.from("profiles").insert({
      id: authData.user.id,
      name,
      phone_number: phone || null,
      email_verified: false,
      phone_verified: false,
    });

    // FIX: Delete ALL OTP records (both verified and unverified)
    console.log("Deleting all old OTP records...");
    const { error: deleteError } = await supabase
      .from("otp_verifications")
      .delete()
      .eq("email", cleanEmail)
      .eq("otp_type", "email_verification");
    // REMOVED .eq("verified", false) to delete ALL records
    
    if (deleteError) {
      console.error("Delete error (non-critical):", deleteError);
    } else {
      console.log("Old OTP records deleted");
    }

    const otp = generateOTP(6);
    console.log("Generated OTP:", otp, "for:", cleanEmail);
    
    const { data: insertedOtp, error: otpError } = await supabase
      .from("otp_verifications")
      .insert({
        user_id: authData.user.id,
        email: cleanEmail,
        otp_code: otp,
        otp_type: "email_verification",
        verified: false,
        expires_at: getOTPExpiry(10),
      })
      .select()
      .single();

    if (otpError) {
      console.error("OTP insert error:", otpError);
      return res.status(500).json({ message: "Failed to generate OTP" });
    }

    console.log("OTP saved to database:", insertedOtp.id);
    console.log("OTP details:", {
      id: insertedOtp.id,
      otp_code: insertedOtp.otp_code,
      verified: insertedOtp.verified,
      expires_at: insertedOtp.expires_at
    });

    await sendOTPEmail(cleanEmail, otp, "verification");
    console.log("User registered:", authData.user.id);

    res.json({
      message: "Registered! Check your email for OTP.",
      userId: authData.user.id,
      email: cleanEmail,
      requiresVerification: true,
    });
  } catch (e) {
    console.error("Registration error:", e);
    res.status(500).json({ message: "Registration failed. Please try again." });
  }
});

/*VERIFY EMAIL*/
router.post("/verify-email", authLimiter, async (req, res) => {
  try {
    console.log("Email verification request");
    console.log("Request body:", req.body);
    
    const { email, otp } = req.body;
    
    if (!email || !otp) {
      return res.status(400).json({ message: "Email and OTP are required" });
    }

    const cleanOTP = String(otp).trim();
    const cleanEmail = String(email).trim().toLowerCase();

    console.log("Verifying OTP:", { 
      originalEmail: email,
      cleanEmail: cleanEmail, 
      originalOTP: otp,
      cleanOTP: cleanOTP 
    });

    // First, check if there are ANY OTP records for this email
    const { data: allOtpRecords } = await supabase
      .from("otp_verifications")
      .select("*")
      .eq("email", cleanEmail)
      .eq("otp_type", "email_verification")
      .order("created_at", { ascending: false });

    console.log("All OTP records for email:", allOtpRecords?.length || 0);
    if (allOtpRecords && allOtpRecords.length > 0) {
      console.log("Latest OTP record:", {
        id: allOtpRecords[0].id,
        otp_code: allOtpRecords[0].otp_code,
        verified: allOtpRecords[0].verified,
        expires_at: allOtpRecords[0].expires_at,
        created_at: allOtpRecords[0].created_at
      });
    }

    // Query for unverified OTPs
    const { data: otpRecords, error: otpError } = await supabase
      .from("otp_verifications")
      .select("*")
      .eq("email", cleanEmail)
      .eq("otp_type", "email_verification")
      .eq("verified", false)
      .order("created_at", { ascending: false })
      .limit(1);

    if (otpError) {
      console.error("Database query error:", otpError);
      return res.status(500).json({ message: "Database error. Please try again." });
    }

    console.log("Found unverified OTP records:", otpRecords?.length || 0);

    if (!otpRecords || otpRecords.length === 0) {
      console.log("No unverified OTP found for email:", cleanEmail);
      return res.status(400).json({ 
        message: "Invalid OTP or OTP already used. Please request a new code." 
      });
    }

    const otpData = otpRecords[0];
    console.log("OTP Data found:", {
      id: otpData.id,
      stored_otp: otpData.otp_code,
      received_otp: cleanOTP,
      expires_at: otpData.expires_at,
      created_at: otpData.created_at,
      user_id: otpData.user_id
    });

    // Check expiration
    const now = new Date();
    const expiresAt = new Date(otpData.expires_at);
    console.log("Time check:", { 
      now: now.toISOString(), 
      expires: expiresAt.toISOString(),
      expired: now > expiresAt 
    });

    if (now > expiresAt) {
      console.log("OTP expired");
      return res.status(400).json({ message: "OTP expired. Please request a new one." });
    }

    // Compare OTPs
    const storedOTP = String(otpData.otp_code).trim();
    console.log("OTP Comparison:", { 
      stored: storedOTP, 
      received: cleanOTP, 
      match: storedOTP === cleanOTP,
      storedType: typeof storedOTP,
      receivedType: typeof cleanOTP
    });

    if (storedOTP !== cleanOTP) {
      console.log("OTP mismatch");
      return res.status(400).json({ message: "Incorrect OTP" });
    }

    console.log("OTP verified, updating records...");

    // Update verification status
    const { error: updateError } = await supabase
      .from("otp_verifications")
      .update({ verified: true })
      .eq("id", otpData.id);

    if (updateError) {
      console.error("Update error:", updateError);
      return res.status(500).json({ message: "Failed to verify OTP" });
    }

    console.log("OTP record marked as verified");

    // Update profile
    const { error: profileError } = await supabase
      .from("profiles")
      .update({ email_verified: true })
      .eq("id", otpData.user_id);

    if (profileError) {
      console.error("Profile update error:", profileError);
    } else {
      console.log("Profile updated");
    }

    // Update auth user
    const { error: authError } = await supabase.auth.admin.updateUserById(
      otpData.user_id, 
      { email_confirm: true }
    );

    if (authError) {
      console.error("Auth update error:", authError);
    } else {
      console.log("Auth user updated");
    }

    // Get user data
    const { data: userData, error: userError } = await supabase.auth.admin.getUserById(otpData.user_id);

    if (userError || !userData) {
      console.error("User fetch error:", userError);
      return res.status(500).json({ message: "Failed to get user data" });
    }

    console.log("User data fetched");

    // Generate token
    const token = jwt.sign(
      { id: userData.user.id, email: userData.user.email },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    console.log("Email verified successfully:", cleanEmail);
    res.json({ 
      message: "Email verified successfully", 
      token,
      user: userData.user 
    });

  } catch (e) {
    console.error(" Verification error:", e);
    res.status(500).json({ message: "Verification failed. Please try again." });
  }
});

/* RESEND OTP */
router.post("/resend-email-otp", otpLimiter, async (req, res) => {
  try {
    console.log(" Resend OTP request");
    const { email } = req.body;
    
    if (!email) {
      return res.status(400).json({ message: "Email is required" });
    }

    const cleanEmail = String(email).trim().toLowerCase();
    console.log(" Looking for user with email:", cleanEmail);

    const { data: users } = await supabase.auth.admin.listUsers();
    const user = users.users.find((u) => u.email?.toLowerCase() === cleanEmail);
    
    if (!user) {
      console.log(" User not found:", cleanEmail);
      return res.status(404).json({ message: "User not found" });
    }

    console.log(" User found:", user.id);

    const { data: profile } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", user.id)
      .single();
    
    if (profile?.email_verified) {
      console.log(" Email already verified");
      return res.status(400).json({ message: "Email already verified" });
    }

    //  FIX: Delete ALL OTP records (both verified and unverified)
    console.log(" Deleting ALL old OTP records...");
    const { error: deleteError } = await supabase
      .from("otp_verifications")
      .delete()
      .eq("email", cleanEmail)
      .eq("otp_type", "email_verification");
    

    if (deleteError) {
      console.error(" Delete error (non-critical):", deleteError);
    } else {
      console.log(" All old OTP records deleted");
    }

    const otp = generateOTP(6);
    console.log(" Generated new OTP:", otp, "for:", cleanEmail);

    // Insert new OTP
    const { data: insertedOtp, error: insertError } = await supabase
      .from("otp_verifications")
      .insert({
        user_id: user.id,
        email: cleanEmail,
        otp_code: otp,
        otp_type: "email_verification",
        verified: false,
        expires_at: getOTPExpiry(10),
      })
      .select()
      .single();

    if (insertError) {
      console.error(" Insert error:", insertError);
      return res.status(500).json({ message: "Failed to generate OTP" });
    }

    console.log(" OTP saved to database:", insertedOtp.id);
    console.log(" OTP details:", {
      id: insertedOtp.id,
      otp_code: insertedOtp.otp_code,
      verified: insertedOtp.verified,
      expires_at: insertedOtp.expires_at
    });

    await sendOTPEmail(cleanEmail, otp, "verification");
    console.log(" OTP resent to:", cleanEmail);
    
    res.json({ message: "OTP sent successfully" });
  } catch (e) {
    console.error(" Resend OTP error:", e);
    res.status(500).json({ message: "Failed to resend OTP. Please try again." });
  }
});

/*LOGIN*/
router.post("/login", authLimiter, async (req, res) => {
  try {
    console.log(" Login request:", req.body.email);
    const { email, password } = req.body;
    
    if (!email || !password) {
      return res.status(400).json({ message: "Email and password are required" });
    }

    const cleanEmail = String(email).trim().toLowerCase();

    const { data, error } = await supabase.auth.signInWithPassword({ 
      email: cleanEmail, 
      password 
    });
    
    if (error) {
      console.error(" Login error:", error.message);
      return res.status(401).json({ message: "Invalid email or password" });
    }

    const { data: profile } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", data.user.id)
      .single();
    
    if (!profile?.email_verified) {
      //FIX: Delete ALL old OTP records (both verified and unverified)
      console.log("🗑️ Deleting ALL old OTP records for unverified user...");
      const { error: deleteError } = await supabase
        .from("otp_verifications")
        .delete()
        .eq("email", cleanEmail)
        .eq("otp_type", "email_verification");
      //REMOVED .eq("verified", false) to delete ALL records

      if (deleteError) {
        console.error(" Delete error (non-critical):", deleteError);
      } else {
        console.log("✅ All old OTP records deleted");
      }

      const otp = generateOTP(6);
      console.log("🔢 Generated OTP for login:", otp);
      
      const { data: insertedOtp, error: insertError } = await supabase
        .from("otp_verifications")
        .insert({
          user_id: data.user.id,
          email: cleanEmail,
          otp_code: otp,
          otp_type: "email_verification",
          verified: false,
          expires_at: getOTPExpiry(10),
        })
        .select()
        .single();

      if (insertError) {
        console.error(" OTP insert error:", insertError);
      } else {
        console.log(" OTP saved:", insertedOtp.id);
      }
      
      await sendOTPEmail(cleanEmail, otp, "verification");
      console.log(" Login blocked - email not verified:", cleanEmail);
      
      return res.status(200).json({ 
        success: false,
        requiresVerification: true,
        email: cleanEmail,
        message: "Please verify your email first. We've sent you a new OTP."
      });
    }

    const token = jwt.sign(
      { id: data.user.id, email: data.user.email },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    console.log(" Login successful:", cleanEmail);
    res.json({ 
      success: true,
      token, 
      user: { ...data.user, ...profile } 
    });
  } catch (e) {
    console.error(" Login error:", e);
    res.status(500).json({ message: "Login failed. Please try again." });
  }
});

/*FORGOT PASSWORD */
router.post("/forgot-password", otpLimiter, async (req, res) => {
  try {
    console.log(" Forgot password request received");
    const { email } = req.body;
    
    if (!email) {
      return res.status(400).json({ message: "Email is required" });
    }

    const cleanEmail = String(email).trim().toLowerCase();
    console.log(" Looking up user:", cleanEmail);
    
    const { data: users, error: listError } = await supabase.auth.admin.listUsers();
    
    if (listError) {
      console.error(" Error listing users:", listError);
      return res.json({ message: "If an account exists, a reset link has been sent" });
    }
    
    const user = users.users.find((u) => u.email?.toLowerCase() === cleanEmail);
    
    if (!user) {
      console.log(" User not found, but returning success for security");
      return res.json({ message: "If an account exists, a reset link has been sent" });
    }
    
    console.log(" User found:", user.id);

    const token = generateResetToken();
    console.log(" Generated reset token");
    
    const { error: insertError } = await supabase
      .from("password_reset_tokens")
      .insert({
        user_id: user.id,
        token,
        expires_at: new Date(Date.now() + 3600000),
      });
    
    if (insertError) {
      console.error(" Error inserting token:", insertError);
      return res.status(500).json({ message: "Failed to process request. Please try again." });
    }
    
    console.log(" Token saved to database");

    const resetLink = `${process.env.FRONTEND_URL}/reset-password?token=${token}`;
    console.log(" Reset link generated");
    
    await sendPasswordResetEmail(cleanEmail, resetLink);
    
    console.log(" Password reset email sent to:", cleanEmail);
    
    res.json({ message: "If an account exists, a reset link has been sent" });
  } catch (e) {
    console.error(" Forgot password error:", e);
    res.status(500).json({ message: "Failed to process request. Please try again." });
  }
});

/*RESET PASSWORD*/
router.post("/reset-password", authLimiter, async (req, res) => {
  try {
    console.log(" Reset password request received");
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
      console.error(" Token not found or already used");
      
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
      console.log(" Token expired");
      return res.status(400).json({ 
        message: "Reset token has expired. Please request a new one." 
      });
    }

    const { error: updateError } = await supabase.auth.admin.updateUserById(
      resetToken.user_id,
      { 
        password: password,
        email_confirm: true
      }
    );

    if (updateError) {
      console.error(" Password update error:", updateError);
      return res.status(500).json({ message: "Failed to update password. Please try again." });
    }

    await supabase
      .from("profiles")
      .update({ email_verified: true })
      .eq("id", resetToken.user_id);

    await supabase
      .from("password_reset_tokens")
      .update({ used: true })
      .eq("id", resetToken.id);

    console.log(" Password reset successful for user:", resetToken.user_id);

    res.json({ message: "Password reset successful" });
  } catch (e) {
    console.error(" Reset password error:", e);
    res.status(500).json({ message: "Password reset failed. Please try again." });
  }
});

/*LOGOUT*/
router.post("/logout", (req, res) => {
  console.log(" Logout request");
  res.json({ message: "Logged out successfully" });
});

/*GET CURRENT USER (PROTECTED)*/
router.get("/me", protect, async (req, res) => {
  try {
    const { data: profile } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", req.user.id)
      .single();

    res.json({ user: { ...req.user, ...profile } });
  } catch (e) {
    console.error(" Get user error:", e);
    res.status(500).json({ message: "Failed to get user" });
  }
});

/*ADMIN: FIX UNVERIFIED EMAILS*/
router.post("/admin/fix-unverified-users", async (req, res) => {
  if (process.env.NODE_ENV !== 'development') {
    return res.status(403).json({ message: "This endpoint is only available in development" });
  }

  try {
    console.log(" Fixing unverified users...");

    const { data: users } = await supabase.auth.admin.listUsers();
    
    let fixed = 0;
    for (const user of users.users) {
      if (!user.email_confirmed_at) {
        await supabase.auth.admin.updateUserById(user.id, {
          email_confirm: true
        });
        
        await supabase
          .from("profiles")
          .update({ email_verified: true })
          .eq("id", user.id);
        
        fixed++;
        console.log(` Fixed user: ${user.email}`);
      }
    }

    console.log(` Fixed ${fixed} users`);
    res.json({ 
      message: `Successfully fixed ${fixed} unverified users`,
      fixed 
    });
  } catch (e) {
    console.error(" Fix unverified users error:", e);
    res.status(500).json({ message: "Failed to fix users" });
  }
});

/*ADMIN: CLEANUP VERIFIED OTPs*/
router.post("/admin/cleanup-verified-otps", async (req, res) => {
  if (process.env.NODE_ENV !== 'development') {
    return res.status(403).json({ message: "Only available in development" });
  }

  try {
    console.log(" Cleaning up verified OTP records...");

    const { error } = await supabase
      .from("otp_verifications")
      .delete()
      .eq("verified", true);

    if (error) {
      console.error(" Cleanup error:", error);
      return res.status(500).json({ error });
    }

    console.log(" Cleanup complete");
    res.json({ message: "Verified OTP records cleaned up" });
  } catch (e) {
    console.error(" Error:", e);
    res.status(500).json({ error: e.message });
  }
});

export default router;