import express from "express";
import { supabase } from "../supabase.js";
import { protect } from "../middleware/authMiddleware.js";
import { logActivity } from "../utils/logActivity.js";

const router = express.Router();

/* GET ALL TRASHED FILES & FOLDERS*/
router.get("/", protect, async (req, res) => {
  try {
    const userId = req.user.id;

    console.log('Fetching trashed items for user:', userId);

    const { data: folders, error: folderError } = await supabase
      .from("folders")
      .select("*")
      .eq("owner_id", userId)
      .eq("is_deleted", true)
      .order("deleted_at", { ascending: false });

    const { data: files, error: fileError } = await supabase
      .from("files")
      .select("*")
      .eq("owner_id", userId)
      .eq("is_deleted", true)
      .order("deleted_at", { ascending: false });

    if (folderError) {
      console.error('Folder error:', folderError);
      return res.status(400).json({ message: "Failed to load trash", error: folderError });
    }

    if (fileError) {
      console.error('File error:', fileError);
      return res.status(400).json({ message: "Failed to load trash", error: fileError });
    }

    // Transform folders
    const transformedFolders = (folders || []).map(folder => ({
      id: folder.id,
      name: folder.name,
      type: 'folder',
      parentId: folder.parent_id,
      path: `/${folder.name}`,
      isStarred: folder.is_starred || false,
      isTrashed: true,
      owner: {
        id: req.user.id,
        name: req.user.name || "You",
        email: req.user.email,
      },
      createdAt: folder.created_at,
      updatedAt: folder.updated_at,
      deletedAt: folder.deleted_at,
    }));

    // Transform files
    const transformedFiles = (files || []).map(file => ({
      id: file.id,
      name: file.name,
      type: 'file',
      size: file.size_bytes,
      mimeType: file.mime_type,
      parentId: file.folder_id,
      path: `/${file.name}`,
      isStarred: file.is_starred || false,
      isTrashed: true,
      owner: {
        id: req.user.id,
        name: req.user.name || "You",
        email: req.user.email,
      },
      createdAt: file.created_at,
      updatedAt: file.updated_at,
      deletedAt: file.deleted_at,
    }));

    console.log(`Found ${transformedFolders.length} folders and ${transformedFiles.length} files in trash`);

    res.json({
      folders: transformedFolders,
      files: transformedFiles,
    });
  } catch (error) {
    console.error('Server error:', error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

/*RESTORE FILE OR FOLDER*/
router.patch("/:id/restore", protect, async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    console.log(`Restoring item ${id}`);

    // Try file first
    const { data: file, error: fileError } = await supabase
      .from("files")
      .update({ is_deleted: false, deleted_at: null })
      .eq("id", id)
      .eq("owner_id", userId)
      .eq("is_deleted", true)
      .select();

    if (file && file.length > 0) {
      console.log('File restored');
      
      await logActivity({
        userId,
        action: "file_restored",
        resourceType: "file",
        resourceId: id,
      });

      return res.json({ message: "File restored" });
    }

    // Try folder
    const { data: folder, error: folderError } = await supabase
      .from("folders")
      .update({ is_deleted: false, deleted_at: null })
      .eq("id", id)
      .eq("owner_id", userId)
      .eq("is_deleted", true)
      .select();

    if (folder && folder.length > 0) {
      console.log('Folder restored');
      
      await logActivity({
        userId,
        action: "folder_restored",
        resourceType: "folder",
        resourceId: id,
      });

      return res.json({ message: "Folder restored" });
    }

    console.log('Item not found in trash');
    return res.status(404).json({ message: "Item not found in trash" });
  } catch (error) {
    console.error('Restore failed:', error);
    res.status(500).json({ message: "Restore failed", error: error.message });
  }
});

/*✅ DELETE FOREVER (FILE OR FOLDER)*/
router.delete("/:id/permanent", protect, async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    console.log(`Permanently deleting item ${id}`);

    // Try file first
    const { data: file, error: fileError } = await supabase
      .from("files")
      .delete()
      .eq("id", id)
      .eq("owner_id", userId)
      .eq("is_deleted", true)
      .select();

    if (file && file.length > 0) {
      console.log('File permanently deleted');
      return res.json({ message: "File permanently deleted" });
    }

    // Try folder
    const { data: folder, error: folderError } = await supabase
      .from("folders")
      .delete()
      .eq("id", id)
      .eq("owner_id", userId)
      .eq("is_deleted", true)
      .select();

    if (folder && folder.length > 0) {
      console.log('Folder permanently deleted');
      return res.json({ message: "Folder permanently deleted" });
    }

    console.log('Item not found in trash');
    return res.status(404).json({ message: "Item not found in trash" });
  } catch (error) {
    console.error('Delete failed:', error);
    res.status(500).json({ message: "Delete failed", error: error.message });
  }
});

/**EMPTY TRASH*/
router.delete("/empty", protect, async (req, res) => {
  try {
    const userId = req.user.id;

    console.log(`Emptying trash for user ${userId}`);

    const { error: filesError } = await supabase
      .from("files")
      .delete()
      .eq("owner_id", userId)
      .eq("is_deleted", true);

    const { error: foldersError } = await supabase
      .from("folders")
      .delete()
      .eq("owner_id", userId)
      .eq("is_deleted", true);

    if (filesError || foldersError) {
      console.error('Error emptying trash:', { filesError, foldersError });
      return res.status(500).json({ message: "Failed to empty trash" });
    }

    console.log('Trash emptied successfully');
    res.json({ message: "Trash emptied successfully" });
  } catch (error) {
    console.error('Error emptying trash:', error);
    res.status(500).json({ message: "Failed to empty trash", error: error.message });
  }
});

export default router;