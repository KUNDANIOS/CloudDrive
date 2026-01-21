import express from "express";
import { supabase } from "../supabase.js";
import { protect } from "../middleware/authMiddleware.js";
import { Resend } from 'resend';

const router = express.Router();
const resend = new Resend(process.env.RESEND_API_KEY);

/* SHARE FILE VIA EMAIL */
router.post("/email", protect, async (req, res) => {
  try {
    const { fileId, email, message } = req.body;

    if (!fileId || !email) {
      return res.status(400).json({ message: "File ID and email required" });
    }

    // Get file details
    const { data: file, error: fileError } = await supabase
      .from("files")
      .select("*")
      .eq("id", fileId)
      .eq("owner_id", req.user.id)
      .single();

    if (fileError || !file) {
      return res.status(404).json({ message: "File not found" });
    }

    // Create share record in database
    const { data: share, error: shareError } = await supabase
      .from("shares")
      .insert({
        file_id: fileId,
        owner_id: req.user.id,
        shared_with_email: email,
        permission: 'view',
      })
      .select()
      .single();

    if (shareError) throw shareError;

    // Generate share link
    const shareLink = `${process.env.FRONTEND_URL}/shared/${share.id}`;

    // Send email using Resend
    const emailData = await resend.emails.send({
      from: process.env.EMAIL_FROM,
      to: email,
      subject: `${req.user.name || req.user.email} shared "${file.name}" with you`,
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
        </head>
        <body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;">
          <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
            <!-- Header -->
            <div style="text-align: center; padding: 20px 0; border-bottom: 2px solid #e5e7eb;">
              <h1 style="margin: 0; color: #2563eb; font-size: 24px;">📁 CloudDrive</h1>
            </div>

            <!-- Content -->
            <div style="padding: 30px 0;">
              <h2 style="color: #111827; font-size: 20px; margin: 0 0 16px 0;">File Shared with You</h2>
              
              <p style="color: #6b7280; font-size: 16px; line-height: 1.5; margin: 0 0 24px 0;">
                <strong style="color: #111827;">${req.user.name || req.user.email}</strong> has shared a file with you on CloudDrive.
              </p>

              <!-- File Card -->
              <div style="background: #f9fafb; border: 1px solid #e5e7eb; border-radius: 8px; padding: 20px; margin: 0 0 24px 0;">
                <div style="display: flex; align-items: center; margin-bottom: 8px;">
                  <span style="font-size: 24px; margin-right: 12px;">📄</span>
                  <h3 style="margin: 0; color: #111827; font-size: 18px;">${file.name}</h3>
                </div>
                <p style="color: #6b7280; font-size: 14px; margin: 0;">
                  Size: ${(file.size_bytes / 1024 / 1024).toFixed(2)} MB
                </p>
              </div>

              ${message ? `
                <div style="background: #eff6ff; border-left: 4px solid #2563eb; padding: 16px; margin: 0 0 24px 0; border-radius: 4px;">
                  <p style="margin: 0; color: #1e40af; font-size: 14px;"><strong>Message:</strong></p>
                  <p style="margin: 8px 0 0 0; color: #1e3a8a; font-size: 14px;">${message}</p>
                </div>
              ` : ''}

              <!-- CTA Button -->
              <div style="text-align: center; margin: 32px 0;">
                <a href="${shareLink}" 
                   style="display: inline-block; background: #2563eb; color: white; padding: 14px 32px; text-decoration: none; border-radius: 6px; font-weight: 600; font-size: 16px;">
                  View File
                </a>
              </div>

              <!-- Direct Link -->
              <div style="background: #f9fafb; border: 1px solid #e5e7eb; border-radius: 6px; padding: 12px; margin: 24px 0;">
                <p style="margin: 0 0 8px 0; color: #6b7280; font-size: 12px;">Or copy this link:</p>
                <p style="margin: 0; color: #2563eb; font-size: 12px; word-break: break-all;">${shareLink}</p>
              </div>
            </div>

            <!-- Footer -->
            <div style="border-top: 1px solid #e5e7eb; padding: 20px 0; text-align: center;">
              <p style="margin: 0; color: #9ca3af; font-size: 12px;">
                This email was sent by CloudDrive. If you didn't expect this email, you can safely ignore it.
              </p>
            </div>
          </div>
        </body>
        </html>
      `,
    });

    console.log('Email sent:', emailData);

    res.json({ 
      message: `File shared successfully with ${email}`,
      share: {
        id: share.id,
        email,
        shareLink,
        emailId: emailData.id,
      }
    });
  } catch (err) {
    console.error("Share error:", err);
    res.status(500).json({ message: err.message || 'Failed to share file' });
  }
});

/* GET SHARES FOR A FILE */
router.get("/file/:fileId", protect, async (req, res) => {
  try {
    const { data, error } = await supabase
      .from("shares")
      .select("*")
      .eq("file_id", req.params.fileId)
      .eq("owner_id", req.user.id);

    if (error) throw error;

    res.json({ shares: data || [] });
  } catch (err) {
    console.error("Get shares error:", err);
    res.status(500).json({ message: err.message });
  }
});

/* REMOVE SHARE */
router.delete("/:shareId", protect, async (req, res) => {
  try {
    const { error } = await supabase
      .from("shares")
      .delete()
      .eq("id", req.params.shareId)
      .eq("owner_id", req.user.id);

    if (error) throw error;

    res.json({ message: "Share removed" });
  } catch (err) {
    console.error("Remove share error:", err);
    res.status(500).json({ message: err.message });
  }
});

export default router;