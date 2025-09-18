// server/src/routes/notes.ts
import express, { Response } from "express";
import multer from "multer";
import fs from "fs";
import path from "path";
import Note from "../models/Note";
import { verifyToken, AuthRequest } from "../middleware/authMiddleware";

const router = express.Router();

// ✅ Ensure uploads folder exists
const uploadDir = path.join(__dirname, "../../uploads");
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// ✅ Multer setup
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + "-" + file.originalname);
  },
});

const upload = multer({ storage });

// Helper to extract file paths from req.files
const getFilePaths = (files?: Express.Multer.File[] | { [fieldname: string]: Express.Multer.File[] }) => {
  if (!files) return [];
  const paths = Array.isArray(files)
    ? files.map(f => f.path)
    : Object.values(files).flat().map(f => f.path);

  // Store paths relative to project root or uploads folder
  return paths.map(p => p.replace(/\\/g, "/").replace(/^.*\/uploads\//, "uploads/"));
};


// ✅ CREATE NOTE WITH ATTACHMENTS
router.post(
  "/",
  verifyToken,
  upload.array("files"),
  async (req: AuthRequest, res: Response) => {
    const { title, content, tags, folder } = req.body;
    const userId = req.userId;

    const filePaths = getFilePaths(req.files);

    try {
      const note = new Note({
        title,
        content,
        tags,
        folder: folder || "General",
        user: userId,
        attachments: filePaths,
      });

      await note.save();
      res.status(201).json(note);
    } catch (err) {
      console.error("Error creating note:", err);
      res.status(500).json({ message: "Server error" });
    }
  }
);

// ✅ GET ALL NOTES
router.get("/", verifyToken, async (req: AuthRequest, res: Response) => {
  try {
    const notes = await Note.find({ user: req.userId }).sort({ createdAt: -1 });
    res.json(notes);
  } catch (err) {
    console.error("Error fetching notes:", err);
    res.status(500).json({ message: "Server error" });
  }
});

// ✅ UPDATE NOTE
router.put(
  "/:id",
  verifyToken,
  upload.array("files"),
  async (req: AuthRequest, res: Response) => {
    const { title, content, tags, folder } = req.body;
    const filePaths = getFilePaths(req.files);

    try {
      const note = await Note.findOneAndUpdate(
        { _id: req.params.id, user: req.userId },
        {
          title,
          content,
          tags,
          folder: folder || "General",
          ...(filePaths.length ? { attachments: filePaths } : {}),
        },
        { new: true }
      );

      if (!note) return res.status(404).json({ message: "Note not found" });
      res.json(note);
    } catch (err) {
      console.error("Error updating note:", err);
      res.status(500).json({ message: "Server error" });
    }
  }
);

// ✅ DELETE NOTE
router.delete("/:id", verifyToken, async (req: AuthRequest, res: Response) => {
  try {
    const note = await Note.findOneAndDelete({ _id: req.params.id, user: req.userId });

    if (!note) return res.status(404).json({ message: "Note not found" });
    res.json({ message: "Note deleted successfully" });
  } catch (err) {
    console.error("Error deleting note:", err);
    res.status(500).json({ message: "Server error" });
  }
});

export default router;
