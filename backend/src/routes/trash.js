import express from "express";
import { supabase } from "../supabase.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

router.get("/", protect, async (req, res) => {
  const folders = await supabase
    .from("folders")
    .select("*")
    .eq("owner_id", req.user.id)
    .eq("is_deleted", true);

  const files = await supabase
    .from("files")
    .select("*")
    .eq("owner_id", req.user.id)
    .eq("is_deleted", true);

  res.json({ folders: folders.data, files: files.data });
});

export default router;
