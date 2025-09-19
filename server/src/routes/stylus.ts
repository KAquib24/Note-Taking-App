import express from "express";
import multer from "multer";
import path from "path";
import fs from "fs";
import StylusNote from "../models/StylusNote";

const router = express.Router();

// multer setup
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
const upload = multer({ storage });

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
    const { title } = req.body;
    if (!req.file) return res.status(400).json({ error: "No file uploaded" });

    const newNote = await StylusNote.create({
      title: title || "Untitled",
      image: req.file.path.replace("\\", "/"),
    });

    res.json(newNote);
  } catch (err) {
    res.status(500).json({ error: "Server error" });
  }
});

// DELETE note
router.delete("/:id", async (req, res) => {
  try {
    const note = await StylusNote.findByIdAndDelete(req.params.id);
    if (note) fs.unlinkSync(note.image); // remove image
    res.json({ message: "Deleted" });
  } catch (err) {
    res.status(500).json({ error: "Server error" });
  }
});

export default router;
