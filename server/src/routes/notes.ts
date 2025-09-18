import express from "express";
import Note from "../models/Note";
import { verifyToken, AuthRequest } from "../middleware/authMiddleware";

const router = express.Router();

// ✅ CREATE NOTE
router.post("/", verifyToken, async (req: AuthRequest, res) => {
  const { title, content, tags, folder } = req.body;
  const userId = req.userId;

  try {
    const note = new Note({
      title,
      content,
      tags,
      folder: folder || "General", // 👈 default folder
      user: userId,
    });
    await note.save();
    res.status(201).json(note);
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
});

// ✅ GET ALL NOTES (for logged-in user)
router.get("/", verifyToken, async (req: AuthRequest, res) => {
  try {
    const notes = await Note.find({ user: req.userId }).sort({ createdAt: -1 });
    res.json(notes);
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
});

// ✅ GET SINGLE NOTE BY ID
router.get("/:id", verifyToken, async (req: AuthRequest, res) => {
  try {
    const note = await Note.findOne({ _id: req.params.id, user: req.userId });
    if (!note) return res.status(404).json({ message: "Note not found" });
    res.json(note);
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
});

// ✅ UPDATE NOTE
router.put("/:id", verifyToken, async (req: AuthRequest, res) => {
  const { title, content, tags, folder } = req.body;
  try {
    const note = await Note.findOneAndUpdate(
      { _id: req.params.id, user: req.userId },
      { title, content, tags, folder: folder || "General" }, // 👈 allow folder update
      { new: true }
    );
    if (!note) return res.status(404).json({ message: "Note not found" });
    res.json(note);
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
});

// ✅ DELETE NOTE
router.delete("/:id", verifyToken, async (req: AuthRequest, res) => {
  try {
    const note = await Note.findOneAndDelete({
      _id: req.params.id,
      user: req.userId,
    });
    if (!note) return res.status(404).json({ message: "Note not found" });
    res.json({ message: "Note deleted successfully" });
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
});

export default router;
