import express from "express";
import multer from "multer";
import path from "path";
import fs from "fs";
import StylusNote from "../models/StylusNote";

const router = express.Router();

// multer setup - INCREASE FILE SIZE LIMIT
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const dir = "uploads/stylus";
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    cb(null, dir);
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname));
  },
});

// ✅ Increase file size limit to 50MB
const upload = multer({ 
  storage,
  limits: { fileSize: 50 * 1024 * 1024 } // 50MB limit
});

// GET all notes
router.get("/", async (req, res) => {
  try {
    const notes = await StylusNote.find().sort({ createdAt: -1 });
    res.json(notes);
  } catch (err) {
    res.status(500).json({ error: "Server error" });
  }
});

// POST new note
router.post("/", upload.single("image"), async (req, res) => {
  try {
    const { title, folder } = req.body;
    if (!req.file) return res.status(400).json({ error: "No file uploaded" });

    const newNote = await StylusNote.create({
      title: title || "Untitled",
      folder: folder || "Default",
      image: req.file.path.replace(/\\/g, "/"),
    });

    res.json(newNote);
  } catch (err) {
    res.status(500).json({ error: "Server error" });
  }
});

// PUT update note
router.put("/:id", upload.single("image"), async (req, res) => {
  try {
    const { title, folder } = req.body;
    const updateData: any = { title, folder };
    
    if (req.file) {
      // Delete old image if exists
      const oldNote = await StylusNote.findById(req.params.id);
      if (oldNote && oldNote.image) {
        try {
          fs.unlinkSync(oldNote.image);
        } catch (err) {
          console.error("Error deleting old image:", err);
        }
      }
      updateData.image = req.file.path.replace(/\\/g, "/");
    }

    const updatedNote = await StylusNote.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true }
    );

    if (!updatedNote) {
      return res.status(404).json({ error: "Note not found" });
    }

    res.json(updatedNote);
  } catch (err) {
    res.status(500).json({ error: "Server error" });
  }
});

// DELETE note
router.delete("/:id", async (req, res) => {
  try {
    const note = await StylusNote.findByIdAndDelete(req.params.id);
    if (note && note.image) {
      try {
        fs.unlinkSync(note.image);
      } catch (err) {
        console.error("Error deleting image file:", err);
      }
    }
    res.json({ message: "Deleted" });
  } catch (err) {
    res.status(500).json({ error: "Server error" });
  }
});

export default router;