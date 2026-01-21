import express from "express";
import crypto from "crypto";
import { supabase } from "../supabase.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

/* Create public link */
router.post("/", protect, async (req, res) => {
  const { resource_type, resource_id, expires_at } = req.body;
  const token = crypto.randomBytes(24).toString("hex");

  const { data, error } = await supabase.from("link_shares").insert({
    resource_type,
    resource_id,
    token,
    expires_at: expires_at || null,
    created_by: req.user.id,
  });

  if (error) return res.status(400).json(error);

  res.json({
    link: `http://localhost:4000/api/link/${token}`,
  });
});

/* Resolve link */
router.get("/:token", async (req, res) => {
  const { token } = req.params;

  const { data, error } = await supabase
    .from("link_shares")
    .select("*")
    .eq("token", token)
    .single();

  if (error || !data) return res.status(404).json({ message: "Invalid link" });

  if (data.expires_at && new Date(data.expires_at) < new Date()) {
    return res.status(403).json({ message: "Link expired" });
  }

  res.json(data);
});

export default router;
