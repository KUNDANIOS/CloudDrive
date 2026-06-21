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

    const { data: files, error } = await supabase
      .from("files")
      .select("size_bytes")
      .eq("owner_id", userId)
      .eq("is_deleted", false);

    if (error) throw error;

    const totalBytes = (files || []).reduce((sum, file) => sum + (file.size_bytes || 0), 0);
    const limitBytes = 5 * 1024 * 1024 * 1024;

    res.json({ used: totalBytes, limit: limitBytes });
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
      owner: { id: req.user.id, name: req.user.name || "You", email: req.user.email },
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
      owner: { id: req.user.id, name: req.user.name || "You", email: req.user.email },
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
      owner: { id: req.user.id, name: req.user.name || "You", email: req.user.email },
      createdAt: file.created_at,
      updatedAt: file.updated_at,
    }));

    res.json({ files });
  } catch (err) {
    console.error("Search files error:", err);
    res.status(500).json({ message: err.message });
  }
});

/* GET TRASH - MUST BE BEFORE /:id */
router.get("/trash", protect, async (req, res) => {
  try {
    const userId = req.user.id;

    const { data: files } = await supabase
      .from("files")
      .select("*")
      .eq("owner_id", userId)
      .eq("is_deleted", true);

    const { data: folders } = await supabase
      .from("folders")
      .select("*")
      .eq("owner_id", userId)
      .eq("is_deleted", true);

    const mappedFiles = (files || []).map((f) => ({
      id: f.id,
      name: f.name,
      type: "file",
      size: f.size_bytes,
      mimeType: f.mime_type,
      parentId: f.folder_id,
      path: `/${f.name}`,
      isStarred: f.is_starred || false,
      isTrashed: true,
      owner: { id: userId, name: req.user.name || "You", email: req.user.email },
      createdAt: f.created_at,
      updatedAt: f.updated_at,
    }));

    const mappedFolders = (folders || []).map((f) => ({
      id: f.id,
      name: f.name,
      type: "folder",
      parentId: f.parent_id,
      path: `/${f.name}`,
      isStarred: f.is_starred || false,
      isTrashed: true,
      owner: { id: userId, name: req.user.name || "You", email: req.user.email },
      createdAt: f.created_at,
      updatedAt: f.updated_at,
    }));

    res.json({ files: mappedFiles, folders: mappedFolders });
  } catch (error) {
    console.error("Get trash error:", error);
    res.status(500).json({ message: "Failed to get trash" });
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
      owner: { id: req.user.id, name: req.user.name || "You", email: req.user.email },
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
      owner: { id: req.user.id, name: req.user.name || "You", email: req.user.email },
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
      owner: { id: req.user.id, name: req.user.name || "You", email: req.user.email },
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
      owner: { id: req.user.id, name: req.user.name || "You", email: req.user.email },
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
      owner: { id: req.user.id, name: req.user.name || "You", email: req.user.email },
      createdAt: data.created_at,
      updatedAt: data.updated_at,
    };

    res.json({ file });
  } catch (err) {
    console.error("Move file error:", err);
    res.status(500).json({ message: err.message });
  }
});

/* RESTORE FROM TRASH - MUST BE BEFORE /:id */
router.patch("/:id/restore", protect, async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    // Try file first
    const { data: file } = await supabase
      .from("files")
      .update({ is_deleted: false, deleted_at: null })
      .eq("id", id)
      .eq("owner_id", userId)
      .select();

    if (file && file.length > 0) {
      await logActivity({
        userId,
        action: "file_restored",
        resourceType: "file",
        resourceId: id,
      });
      return res.json({ message: "File restored" });
    }

    // Try folder
    const { data: folder } = await supabase
      .from("folders")
      .update({ is_deleted: false, deleted_at: null })
      .eq("id", id)
      .eq("owner_id", userId)
      .select();

    if (folder && folder.length > 0) {
      await logActivity({
        userId,
        action: "folder_restored",
        resourceType: "folder",
        resourceId: id,
      });
      return res.json({ message: "Folder restored" });
    }

    return res.status(404).json({ message: "Item not found" });
  } catch (error) {
    console.error("Restore error:", error);
    res.status(500).json({ message: "Failed to restore item" });
  }
});

/* MOVE TO TRASH (SOFT DELETE) */
router.post("/:id/trash", protect, async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    // Try file first
    const { data: file } = await supabase
      .from("files")
      .update({ is_deleted: true, deleted_at: new Date().toISOString() })
      .eq("id", id)
      .eq("owner_id", userId)
      .select();

    if (file && file.length > 0) {
      await logActivity({
        userId,
        action: "file_deleted",
        resourceType: "file",
        resourceId: id,
      });
      return res.json({ message: "File moved to trash" });
    }

    // Try folder
    const { data: folder } = await supabase
      .from("folders")
      .update({ is_deleted: true, deleted_at: new Date().toISOString() })
      .eq("id", id)
      .eq("owner_id", userId)
      .select();

    if (folder && folder.length > 0) {
      await logActivity({
        userId,
        action: "folder_deleted",
        resourceType: "folder",
        resourceId: id,
      });
      return res.json({ message: "Folder moved to trash" });
    }

    return res.status(404).json({ message: "Item not found" });
  } catch (error) {
    console.error("Error moving to trash:", error);
    res.status(500).json({ message: "Failed to move item to trash" });
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
      owner: { id: req.user.id, name: req.user.name || "You", email: req.user.email },
      createdAt: data.created_at,
      updatedAt: data.updated_at,
    };

    res.json({ file });
  } catch (err) {
    console.error("Toggle star error:", err);
    res.status(500).json({ message: err.message });
  }
});

/* PERMANENT DELETE */
router.delete("/:id/permanent", protect, async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    // Try file first
    const { data: file } = await supabase
      .from("files")
      .select("storage_key")
      .eq("id", id)
      .eq("owner_id", userId)
      .single();

    if (file) {
      if (file.storage_key) {
        await supabase.storage.from("files").remove([file.storage_key]);
      }
      await supabase.from("files").delete().eq("id", id).eq("owner_id", userId);
      return res.json({ message: "File permanently deleted" });
    }

    // Try folder
    const { data: folder } = await supabase
      .from("folders")
      .select("id")
      .eq("id", id)
      .eq("owner_id", userId)
      .single();

    if (folder) {
      await supabase.from("folders").delete().eq("id", id).eq("owner_id", userId);
      return res.json({ message: "Folder permanently deleted" });
    }

    return res.status(404).json({ message: "Item not found" });
  } catch (error) {
    console.error("Permanent delete error:", error);
    res.status(500).json({ message: "Failed to permanently delete item" });
  }
});

/* EMPTY TRASH */
router.delete("/trash/empty", protect, async (req, res) => {
  try {
    const userId = req.user.id;

    // Get all trashed files to delete from storage
    const { data: trashedFiles } = await supabase
      .from("files")
      .select("id, storage_key")
      .eq("owner_id", userId)
      .eq("is_deleted", true);

    if (trashedFiles && trashedFiles.length > 0) {
      const storageKeys = trashedFiles.map((f) => f.storage_key).filter(Boolean);
      if (storageKeys.length > 0) {
        await supabase.storage.from("files").remove(storageKeys);
      }
      await supabase.from("files").delete().eq("owner_id", userId).eq("is_deleted", true);
    }

    // Delete trashed folders
    await supabase.from("folders").delete().eq("owner_id", userId).eq("is_deleted", true);

    res.json({ message: "Trash emptied" });
  } catch (error) {
    console.error("Empty trash error:", error);
    res.status(500).json({ message: "Failed to empty trash" });
  }
});

export default router;