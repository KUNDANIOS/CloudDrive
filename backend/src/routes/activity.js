import express from "express";
import { supabase } from "../supabase.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

router.get("/", protect, async (req, res) => {
  const { data, error } = await supabase
    .from("activity_logs")
    .select("*")
    .eq("user_id", req.user.id)
    .order("created_at", { ascending: false });

  if (error) return res.status(400).json(error);
  res.json(data);
});

export default router;
