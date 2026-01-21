import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

// Always use your verified domain
const getFromAddress = () => {
  return process.env.EMAIL_FROM || "CloudDrive <no-reply@clouddrive.store>";
};

// ================= OTP EMAIL =================
export async function sendOTPEmail(email, otp, type = "verification") {
  const subjects = {
    verification: "Verify Your Email - CloudDrive",
    login: "Your Login Code - CloudDrive",
    reset: "Reset Your Password - CloudDrive",
    twoFactor: "Your 2FA Code - CloudDrive",
  };

  const titles = {
    verification: "Email Verification",
    login: "Login Verification",
    reset: "Password Reset",
    twoFactor: "Two-Factor Authentication",
  };

  console.log("📨 Sending OTP:", otp, "to:", email);
  console.log("📤 FROM:", getFromAddress());

  try {
    const result = await resend.emails.send({
      from: getFromAddress(),
      to: email,
      subject: subjects[type] || subjects.verification,
      html: `
        <!DOCTYPE html>
        <html>
        <body style="margin:0;padding:0;font-family:Arial,sans-serif;background:#f9fafb;">
          <div style="max-width:600px;margin:auto;padding:20px;background:white;border-radius:8px;">
            <h1 style="text-align:center;color:#2563eb;">CloudDrive</h1>
            <h2>${titles[type]}</h2>
            <p>Your verification code is:</p>
            <div style="font-size:32px;font-weight:bold;letter-spacing:6px;margin:20px 0;">
              ${otp}
            </div>
            <p>This code expires in <b>10 minutes</b>.</p>
            <p style="color:#6b7280;font-size:12px;">If you did not request this, you can ignore this email.</p>
          </div>
        </body>
        </html>
      `,
    });

    console.log("✅ OTP email sent:", result);
    return true;
  } catch (error) {
    console.error("❌ OTP email failed:", error);
    throw new Error("Failed to send OTP email");
  }
}

// ================= PASSWORD RESET EMAIL =================
export async function sendPasswordResetEmail(email, resetLink) {
  console.log("📨 Sending reset email to:", email);
  console.log("📤 FROM:", getFromAddress());

  try {
    const result = await resend.emails.send({
      from: getFromAddress(),
      to: email,
      subject: "Reset Your Password - CloudDrive",
      html: `
        <!DOCTYPE html>
        <html>
        <body style="margin:0;padding:0;font-family:Arial,sans-serif;background:#f9fafb;">
          <div style="max-width:600px;margin:auto;padding:20px;background:white;border-radius:8px;">
            <h1 style="color:#2563eb;">CloudDrive</h1>
            <h2>Reset Your Password</h2>
            <p>Click the button below to reset your password:</p>
            <p style="margin:20px 0;">
              <a href="${resetLink}" 
                 style="background:#2563eb;color:white;padding:12px 20px;border-radius:6px;text-decoration:none;">
                 Reset Password
              </a>
            </p>
            <p>This link expires in <b>1 hour</b>.</p>
            <p style="color:#6b7280;font-size:12px;">If you did not request this, ignore this email.</p>
          </div>
        </body>
        </html>
      `,
    });

    console.log("✅ Reset email sent:", result);
    return true;
  } catch (error) {
    console.error("❌ Reset email failed:", error);
    throw new Error("Failed to send reset email");
  }
}
