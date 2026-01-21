import express from "express";
import { supabase } from "../supabase.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

/* CREATE FOLDER */
router.post("/", protect, async (req, res) => {
  try {
    const { name, parentId } = req.body || {};
    if (!name) return res.status(400).json({ message: "Folder name required" });

    const { data, error } = await supabase
      .from("folders")
      .insert({
        name,
        parent_id: parentId || null,
        owner_id: req.user.id,
      })
      .select()
      .single();

    if (error) throw error;

    const folder = {
      id: data.id,
      name: data.name,
      type: 'folder',
      parentId: data.parent_id,
      path: `/${data.name}`,
      isStarred: false,
      isTrashed: false,
      owner: {
        id: req.user.id,
        name: req.user.name || "You",
        email: req.user.email,
      },
      createdAt: data.created_at,
      updatedAt: data.updated_at,
    };

    res.json({ folder });
  } catch (err) {
    console.error("Create folder error:", err);
    res.status(500).json({ message: err.message });
  }
});

/* GET ALL FOLDERS - NEW ROUTE */
router.get("/", protect, async (req, res) => {
  try {
    const { data, error } = await supabase
      .from("folders")
      .select("*")
      .eq("owner_id", req.user.id)
      .eq("is_deleted", false)
      .order("created_at", { ascending: false });

    if (error) throw error;

    const folders = (data || []).map(f => ({
      id: f.id,
      name: f.name,
      type: 'folder',
      parentId: f.parent_id,
      path: `/${f.name}`,
      isStarred: false,
      isTrashed: false,
      owner: {
        id: req.user.id,
        name: req.user.name || "You",
        email: req.user.email,
      },
      createdAt: f.created_at,
      updatedAt: f.updated_at,
    }));

    res.json({ folders });
  } catch (err) {
    console.error("Get folders error:", err);
    res.status(500).json({ message: err.message });
  }
});

/* GET ROOT FOLDER CONTENTS */
router.get("/root", protect, async (req, res) => {
  try {
    const { data: folders, error: foldersError } = await supabase
      .from("folders")
      .select("*")
      .eq("owner_id", req.user.id)
      .is("parent_id", null)
      .eq("is_deleted", false);

    const { data: files, error: filesError } = await supabase
      .from("files")
      .select("*")
      .eq("owner_id", req.user.id)
      .is("folder_id", null)
      .eq("is_deleted", false);

    if (foldersError) throw foldersError;
    if (filesError) throw filesError;

    const transformedFolders = (folders || []).map(f => ({
      id: f.id,
      name: f.name,
      type: 'folder',
      parentId: f.parent_id,
      path: `/${f.name}`,
      isStarred: false,
      isTrashed: false,
      owner: {
        id: req.user.id,
        name: req.user.name || "You",
        email: req.user.email,
      },
      createdAt: f.created_at,
      updatedAt: f.updated_at,
    }));

    const transformedFiles = (files || []).map(f => ({
      id: f.id,
      name: f.name,
      type: 'file',
      size: f.size_bytes,
      mimeType: f.mime_type,
      parentId: f.folder_id,
      path: `/${f.name}`,
      isStarred: f.is_starred || false,
      isTrashed: false,
      owner: {
        id: req.user.id,
        name: req.user.name || "You",
        email: req.user.email,
      },
      createdAt: f.created_at,
      updatedAt: f.updated_at,
    }));

    res.json({ 
      items: [...transformedFolders, ...transformedFiles]
    });
  } catch (err) {
    console.error("Get folder contents error:", err);
    res.status(500).json({ message: err.message });
  }
});

/* GET FOLDER CONTENTS BY ID */
router.get("/:id/contents", protect, async (req, res) => {
  try {
    const parentId = req.params.id === "root" ? null : req.params.id;

    const { data: folders, error: foldersError } = await supabase
      .from("folders")
      .select("*")
      .eq("owner_id", req.user.id)
      .eq("parent_id", parentId)
      .eq("is_deleted", false);

    const { data: files, error: filesError } = await supabase
      .from("files")
      .select("*")
      .eq("owner_id", req.user.id)
      .eq("folder_id", parentId)
      .eq("is_deleted", false);

    if (foldersError) throw foldersError;
    if (filesError) throw filesError;

    const transformedFolders = (folders || []).map(f => ({
      id: f.id,
      name: f.name,
      type: 'folder',
      parentId: f.parent_id,
      path: `/${f.name}`,
      isStarred: false,
      isTrashed: false,
      owner: {
        id: req.user.id,
        name: req.user.name || "You",
        email: req.user.email,
      },
      createdAt: f.created_at,
      updatedAt: f.updated_at,
    }));

    const transformedFiles = (files || []).map(f => ({
      id: f.id,
      name: f.name,
      type: 'file',
      size: f.size_bytes,
      mimeType: f.mime_type,
      parentId: f.folder_id,
      path: `/${f.name}`,
      isStarred: f.is_starred || false,
      isTrashed: false,
      owner: {
        id: req.user.id,
        name: req.user.name || "You",
        email: req.user.email,
      },
      createdAt: f.created_at,
      updatedAt: f.updated_at,
    }));

    res.json({ 
      items: [...transformedFolders, ...transformedFiles]
    });
  } catch (err) {
    console.error("Get folder contents error:", err);
    res.status(500).json({ message: err.message });
  }
});

/* RENAME FOLDER */
router.patch("/:id", protect, async (req, res) => {
  try {
    const { name } = req.body || {};

    const { data, error } = await supabase
      .from("folders")
      .update({ name })
      .eq("id", req.params.id)
      .eq("owner_id", req.user.id)
      .select()
      .single();

    if (error) throw error;

    const folder = {
      id: data.id,
      name: data.name,
      type: 'folder',
      parentId: data.parent_id,
      path: `/${data.name}`,
      isStarred: false,
      isTrashed: false,
      owner: {
        id: req.user.id,
        name: req.user.name || "You",
        email: req.user.email,
      },
      createdAt: data.created_at,
      updatedAt: data.updated_at,
    };

    res.json({ folder });
  } catch (err) {
    console.error("Rename folder error:", err);
    res.status(500).json({ message: err.message });
  }
});

/* MOVE FOLDER */
router.patch("/:id/move", protect, async (req, res) => {
  try {
    const { parentId } = req.body;

    const { data, error } = await supabase
      .from("folders")
      .update({ parent_id: parentId || null })
      .eq("id", req.params.id)
      .eq("owner_id", req.user.id)
      .select()
      .single();

    if (error) throw error;

    const folder = {
      id: data.id,
      name: data.name,
      type: 'folder',
      parentId: data.parent_id,
      path: `/${data.name}`,
      isStarred: false,
      isTrashed: false,
      owner: {
        id: req.user.id,
        name: req.user.name || "You",
        email: req.user.email,
      },
      createdAt: data.created_at,
      updatedAt: data.updated_at,
    };

    res.json({ folder });
  } catch (err) {
    console.error("Move folder error:", err);
    res.status(500).json({ message: err.message });
  }
});

/* DELETE FOLDER */
router.delete("/:id", protect, async (req, res) => {
  try {
    const { error } = await supabase
      .from("folders")
      .update({ is_deleted: true })
      .eq("id", req.params.id)
      .eq("owner_id", req.user.id);

    if (error) throw error;

    res.json({ message: "Folder moved to trash" });
  } catch (err) {
    console.error("Delete folder error:", err);
    res.status(500).json({ message: err.message });
  }
});

/* RESTORE FOLDER */
router.post("/:id/restore", protect, async (req, res) => {
  try {
    const { error } = await supabase
      .from("folders")
      .update({ is_deleted: false })
      .eq("id", req.params.id)
      .eq("owner_id", req.user.id);

    if (error) throw error;

    res.json({ message: "Folder restored" });
  } catch (err) {
    console.error("Restore folder error:", err);
    res.status(500).json({ message: err.message });
  }
});

export default router;