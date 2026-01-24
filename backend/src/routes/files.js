import express from "express";
import multer from "multer";
import { supabase } from "../supabase.js";
import { protect } from "../middleware/authMiddleware.js";
import { logActivity } from "../utils/logActivity.js";

const router = express.Router();
const upload = multer({ storage: multer.memoryStorage() });

/* GET STORAGE USAGE - MUST BE BEFORE /:id */
router.get("/storage", protect, async (req, res) => {
  try {
    const userId = req.user.id;

    // Get all non-deleted files for this user
    const { data: files, error } = await supabase
      .from("files")
      .select("size_bytes")
      .eq("owner_id", userId)
      .eq("is_deleted", false);

    if (error) throw error;

    // Calculate total storage used
    const totalBytes = (files || []).reduce((sum, file) => sum + (file.size_bytes || 0), 0);
    
    // 5GB limit in bytes
    const limitBytes = 5 * 1024 * 1024 * 1024; // 5GB

    console.log(`Storage for user ${userId}: ${totalBytes} / ${limitBytes} bytes`);

    res.json({
      used: totalBytes,
      limit: limitBytes
    });
  } catch (err) {
    console.error("Get storage error:", err);
    res.status(500).json({ message: err.message });
  }
});

/* GET STARRED FILES - MUST BE BEFORE /:id */
router.get("/starred", protect, async (req, res) => {
  try {
    const { data, error } = await supabase
      .from("files")
      .select("*")
      .eq("owner_id", req.user.id)
      .eq("is_starred", true)
      .eq("is_deleted", false);

    if (error) throw error;

    const files = (data || []).map(file => ({
      id: file.id,
      name: file.name,
      type: 'file',
      size: file.size_bytes,
      mimeType: file.mime_type,
      parentId: file.folder_id,
      path: `/${file.name}`,
      isStarred: true,
      isTrashed: false,
      owner: {
        id: req.user.id,
        name: req.user.name || "You",
        email: req.user.email,
      },
      createdAt: file.created_at,
      updatedAt: file.updated_at,
    }));

    res.json({ files });
  } catch (err) {
    console.error("Get starred files error:", err);
    res.status(500).json({ message: err.message });
  }
});

/* GET RECENT FILES - MUST BE BEFORE /:id */
router.get("/recent", protect, async (req, res) => {
  try {
    const { data, error } = await supabase
      .from("files")
      .select("*")
      .eq("owner_id", req.user.id)
      .eq("is_deleted", false)
      .order("updated_at", { ascending: false })
      .limit(20);

    if (error) throw error;

    const files = (data || []).map(file => ({
      id: file.id,
      name: file.name,
      type: 'file',
      size: file.size_bytes,
      mimeType: file.mime_type,
      parentId: file.folder_id,
      path: `/${file.name}`,
      isStarred: file.is_starred || false,
      isTrashed: false,
      owner: {
        id: req.user.id,
        name: req.user.name || "You",
        email: req.user.email,
      },
      createdAt: file.created_at,
      updatedAt: file.updated_at,
    }));

    res.json({ files });
  } catch (err) {
    console.error("Get recent files error:", err);
    res.status(500).json({ message: err.message });
  }
});

/* SEARCH FILES - MUST BE BEFORE /:id */
router.get("/search", protect, async (req, res) => {
  try {
    const q = req.query.q;
    if (!q) return res.json({ files: [] });

    const { data, error } = await supabase
      .from("files")
      .select("*")
      .eq("owner_id", req.user.id) 
      .eq("is_deleted", false)
      .ilike("name", `%${q}%`);

    if (error) throw error;

    const files = (data || []).map(file => ({
      id: file.id,
      name: file.name,
      type: 'file',
      size: file.size_bytes,
      mimeType: file.mime_type,
      parentId: file.folder_id,
      path: `/${file.name}`,
      isStarred: file.is_starred || false,
      isTrashed: false,
      owner: {
        id: req.user.id,
        name: req.user.name || "You",
        email: req.user.email,
      },
      createdAt: file.created_at,
      updatedAt: file.updated_at,
    }));

    res.json({ files });
  } catch (err) {
    console.error("Search files error:", err);
    res.status(500).json({ message: err.message });
  }
});

/* UPLOAD FILE */
router.post("/upload", protect, upload.single("file"), async (req, res) => {
  try {
    const file = req.file;
    if (!file) return res.status(400).json({ message: "No file uploaded" });

    const userId = req.user.id;
    const folderId = req.body.parentId || null;
    const filePath = `${userId}/${Date.now()}-${file.originalname}`;

    console.log('Uploading file:', file.originalname, 'to folder:', folderId);

    const { error: uploadError } = await supabase.storage
      .from("files")
      .upload(filePath, file.buffer, { contentType: file.mimetype });

    if (uploadError) throw uploadError;

    const { data, error } = await supabase
      .from("files")
      .insert({
        name: file.originalname,
        owner_id: userId,
        folder_id: folderId,
        mime_type: file.mimetype,
        size_bytes: file.size,
        storage_key: filePath,
      })
      .select()
      .single();

    if (error) throw error;

    const transformedFile = {
      id: data.id,
      name: data.name,
      type: 'file',
      size: data.size_bytes,
      mimeType: data.mime_type,
      parentId: data.folder_id,
      path: `/${data.name}`,
      isStarred: data.is_starred || false,
      isTrashed: false,
      owner: {
        id: req.user.id,
        name: req.user.name || "You",
        email: req.user.email,
      },
      createdAt: data.created_at,
      updatedAt: data.updated_at,
    };

    await logActivity({
      userId,
      action: "file_uploaded",
      resourceType: "file",
      resourceId: data.id,
      metadata: { name: data.name, folderId },
    });

    res.json({ file: transformedFile });
  } catch (err) {
    console.error("Upload error:", err);
    res.status(500).json({ message: err.message });
  }
});

/* GET USER FILES */
router.get("/", protect, async (req, res) => {
  try {
    const { data, error } = await supabase
      .from("files")
      .select("*")
      .eq("owner_id", req.user.id)
      .eq("is_deleted", false)
      .order("created_at", { ascending: false });

    if (error) throw error;

    const files = (data || []).map(file => ({
      id: file.id,
      name: file.name,
      type: 'file',
      size: file.size_bytes,
      mimeType: file.mime_type,
      parentId: file.folder_id,
      path: `/${file.name}`,
      isStarred: file.is_starred || false,
      isTrashed: false,
      owner: {
        id: req.user.id,
        name: req.user.name || "You",
        email: req.user.email,
      },
      createdAt: file.created_at,
      updatedAt: file.updated_at,
    }));

    res.json({ files });
  } catch (err) {
    console.error("Get files error:", err);
    res.status(500).json({ message: err.message });
  }
});

/* GET FILE BY ID - MUST BE AFTER SPECIFIC ROUTES */
router.get("/:id", protect, async (req, res) => {
  try {
    const { data, error } = await supabase
      .from("files")
      .select("*")
      .eq("id", req.params.id)
      .eq("owner_id", req.user.id)
      .single();

    if (error) throw error;

    const file = {
      id: data.id,
      name: data.name,
      type: 'file',
      size: data.size_bytes,
      mimeType: data.mime_type,
      parentId: data.folder_id,
      path: `/${data.name}`,
      isStarred: data.is_starred || false,
      isTrashed: false,
      owner: {
        id: req.user.id,
        name: req.user.name || "You",
        email: req.user.email,
      },
      createdAt: data.created_at,
      updatedAt: data.updated_at,
    };

    res.json({ file });
  } catch (err) {
    console.error("Get file error:", err);
    res.status(500).json({ message: err.message });
  }
});

/* GET DOWNLOAD URL */
router.get("/:id/download", protect, async (req, res) => {
  try {
    const { data: file } = await supabase
      .from("files")
      .select("*")
      .eq("id", req.params.id)
      .eq("owner_id", req.user.id)
      .single();

    if (!file) return res.status(404).json({ message: "File not found" });

    const { data, error } = await supabase.storage
      .from("files")
      .createSignedUrl(file.storage_key, 60);

    if (error) throw error;

    res.json({ url: data.signedUrl });
  } catch (err) {
    console.error("Download error:", err);
    res.status(500).json({ message: err.message });
  }
});

/* RENAME FILE */
router.patch("/:id", protect, async (req, res) => {
  try {
    const { name } = req.body || {};

    const { data, error } = await supabase
      .from("files")
      .update({ name })
      .eq("id", req.params.id)
      .eq("owner_id", req.user.id)
      .select()
      .single();

    if (error) throw error;

    const file = {
      id: data.id,
      name: data.name,
      type: 'file',
      size: data.size_bytes,
      mimeType: data.mime_type,
      parentId: data.folder_id,
      path: `/${data.name}`,
      isStarred: data.is_starred || false,
      isTrashed: false,
      owner: {
        id: req.user.id,
        name: req.user.name || "You",
        email: req.user.email,
      },
      createdAt: data.created_at,
      updatedAt: data.updated_at,
    };

    await logActivity({
      userId: req.user.id,
      action: "file_updated",
      resourceType: "file",
      resourceId: data.id,
      metadata: { name: data.name },
    });

    res.json({ file });
  } catch (err) {
    console.error("Rename file error:", err);
    res.status(500).json({ message: err.message });
  }
});

/* MOVE FILE */
router.patch("/:id/move", protect, async (req, res) => {
  try {
    const { parentId } = req.body;

    const { data, error } = await supabase
      .from("files")
      .update({ folder_id: parentId || null })
      .eq("id", req.params.id)
      .eq("owner_id", req.user.id)
      .select()
      .single();

    if (error) throw error;

    const file = {
      id: data.id,
      name: data.name,
      type: 'file',
      size: data.size_bytes,
      mimeType: data.mime_type,
      parentId: data.folder_id,
      path: `/${data.name}`,
      isStarred: data.is_starred || false,
      isTrashed: false,
      owner: {
        id: req.user.id,
        name: req.user.name || "You",
        email: req.user.email,
      },
      createdAt: data.created_at,
      updatedAt: data.updated_at,
    };

    res.json({ file });
  } catch (err) {
    console.error("Move file error:", err);
    res.status(500).json({ message: err.message });
  }
});

/* MOVE TO TRASH (SOFT DELETE) */
router.post("/:id/trash", protect, async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    console.log(`Moving item ${id} to trash for user ${userId}`);

    // Try file first
    const { data: file, error: fileError } = await supabase
      .from("files")
      .update({
        is_deleted: true,
        deleted_at: new Date().toISOString(),
      })
      .eq("id", id)
      .eq("owner_id", userId)
      .select();

    if (file && file.length > 0) {
      console.log('File moved to trash');
      
      await logActivity({
        userId,
        action: "file_deleted",
        resourceType: "file",
        resourceId: id,
      });

      return res.json({ message: "File moved to trash" });
    }

    // Try folder
    const { data: folder, error: folderError } = await supabase
      .from("folders")
      .update({
        is_deleted: true,
        deleted_at: new Date().toISOString(),
      })
      .eq("id", id)
      .eq("owner_id", userId)
      .select();

    if (folder && folder.length > 0) {
      console.log('Folder moved to trash');
      
      await logActivity({
        userId,
        action: "folder_deleted",
        resourceType: "folder",
        resourceId: id,
      });

      return res.json({ message: "Folder moved to trash" });
    }

    console.log('Item not found');
    return res.status(404).json({ message: "Item not found" });
  } catch (error) {
    console.error('Error moving to trash:', error);
    res.status(500).json({ message: "Failed to move item to trash", error: error.message });
  }
});

/* TOGGLE STAR */
router.post("/:id/star", protect, async (req, res) => {
  try {
    const { data: currentFile } = await supabase
      .from("files")
      .select("is_starred")
      .eq("id", req.params.id)
      .eq("owner_id", req.user.id)
      .single();

    const { data, error } = await supabase
      .from("files")
      .update({ is_starred: !currentFile?.is_starred })
      .eq("id", req.params.id)
      .eq("owner_id", req.user.id)
      .select()
      .single();

    if (error) throw error;

    const file = {
      id: data.id,
      name: data.name,
      type: 'file',
      size: data.size_bytes,
      mimeType: data.mime_type,
      parentId: data.folder_id,
      path: `/${data.name}`,
      isStarred: data.is_starred || false,
      isTrashed: false,
      owner: {
        id: req.user.id,
        name: req.user.name || "You",
        email: req.user.email,
      },
      createdAt: data.created_at,
      updatedAt: data.updated_at,
    };

    res.json({ file });
  } catch (err) {
    console.error("Toggle star error:", err);
    res.status(500).json({ message: err.message });
  }
});

export default router;