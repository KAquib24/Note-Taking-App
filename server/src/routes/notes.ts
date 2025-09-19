// server/src/routes/notes.ts
import express, { Response } from "express";
import multer from "multer";
import fs from "fs";
import path from "path";
import Note from "../models/Note";
import { verifyToken, AuthRequest } from "../middleware/authMiddleware";
import PDFDocument from "pdfkit";
import TurndownService from "turndown";

const router = express.Router();

// ✅ Ensure uploads folder exists
const uploadDir = path.join(__dirname, "../../uploads");
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// ✅ Multer setup
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadDir),
  filename: (req, file, cb) => cb(null, Date.now() + "-" + file.originalname),
});
const upload = multer({ storage });

// ✅ Helper to extract file paths
const getFilePaths = (
  files?: Express.Multer.File[] | { [fieldname: string]: Express.Multer.File[] }
) => {
  if (!files) return [];
  const paths = Array.isArray(files)
    ? files.map((f) => f.path)
    : Object.values(files).flat().map((f) => f.path);

  return paths.map((p) =>
    p.replace(/\\/g, "/").replace(/^.*\/uploads\//, "uploads/")
  );
};

// ✅ CREATE NOTE
router.post("/", verifyToken, upload.array("files"), async (req: AuthRequest, res: Response) => {
  const { title, content, tags, folder, dueDate, reminder } = req.body;
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
      dueDate: dueDate ? new Date(dueDate) : undefined,
      reminder: reminder ? parseInt(reminder) : undefined,
      pinned: false,
    });

    await note.save();
    res.status(201).json(note);
  } catch (err) {
    console.error("Error creating note:", err);
    res.status(500).json({ message: "Server error" });
  }
});

// ✅ GET ALL NOTES (pinned first, then recent)
router.get("/", verifyToken, async (req: AuthRequest, res: Response) => {
  try {
    const notes = await Note.find({ user: req.userId }).sort({ pinned: -1, createdAt: -1 });
    res.json(notes);
  } catch (err) {
    console.error("Error fetching notes:", err);
    res.status(500).json({ message: "Server error" });
  }
});

// ✅ GET REMINDERS
router.get("/reminders", verifyToken, async (req: AuthRequest, res: Response) => {
  try {
    const now = new Date();
    const upcoming = await Note.find({
      user: req.userId,
      dueDate: { $gte: now },
    }).sort({ dueDate: 1 });
    res.json(upcoming);
  } catch (err) {
    console.error("Error fetching reminders:", err);
    res.status(500).json({ message: "Server error" });
  }
});

// ✅ EXPORT NOTE (PDF, MD, TXT) - SINGLE VERSION WITH IMPROVEMENTS
router.get("/export/:id/:format", verifyToken, async (req: AuthRequest, res: Response) => {
  const { id, format } = req.params;

  try {
    const note = await Note.findOne({ _id: id, user: req.userId });
    if (!note) return res.status(404).json({ message: "Note not found" });

    if (format === "pdf") {
      // Use PDFDocument (more reliable for server-side)
      const doc = new PDFDocument();
      res.setHeader("Content-Type", "application/pdf");
      res.setHeader("Content-Disposition", `attachment; filename="${note.title}.pdf"`);
      doc.pipe(res);

      // PDF Content
      doc.fontSize(18).text(note.title, { underline: true });
      doc.moveDown();
      doc.fontSize(12).text(note.content || "");
      
      // Add attachments list if any
      if (note.attachments && note.attachments.length > 0) {
        doc.moveDown();
        doc.fontSize(14).text("Attachments:", { underline: true });
        note.attachments.forEach((attachment, index) => {
          doc.fontSize(10).text(`${index + 1}. ${attachment}`);
        });
      }
      
      doc.end();
      return;
    }

    if (format === "md") {
      const turndownService = new TurndownService();
      let markdown = `# ${note.title}\n\n${turndownService.turndown(note.content || "")}`;

      // Add attachments if any
      if (note.attachments && note.attachments.length > 0) {
        markdown += `\n\n## Attachments\n`;
        note.attachments.forEach(attachment => {
          markdown += `- ${attachment}\n`;
        });
      }

      res.setHeader("Content-Type", "text/markdown");
      res.setHeader("Content-Disposition", `attachment; filename="${note.title}.md"`);
      return res.send(markdown);
    }

    if (format === "txt") {
      let textContent = `${note.title}\n${'='.repeat(note.title.length)}\n\n${note.content || ""}`;
      
      // Add attachments if any
      if (note.attachments && note.attachments.length > 0) {
        textContent += `\n\nAttachments:\n`;
        note.attachments.forEach(attachment => {
          textContent += `- ${attachment}\n`;
        });
      }

      res.setHeader("Content-Type", "text/plain");
      res.setHeader("Content-Disposition", `attachment; filename="${note.title}.txt"`);
      return res.send(textContent);
    }

    res.status(400).json({ message: "Invalid export format" });
  } catch (err) {
    console.error("Error exporting note:", err);
    res.status(500).json({ message: "Server error" });
  }
});

// ✅ TOGGLE PIN
router.put("/pin/:id", verifyToken, async (req: AuthRequest, res: Response) => {
  try {
    const note = await Note.findOne({ _id: req.params.id, user: req.userId });
    if (!note) return res.status(404).json({ message: "Note not found" });

    note.pinned = !note.pinned;
    await note.save();
    res.json(note);
  } catch (err) {
    console.error("Error pinning note:", err);
    res.status(500).json({ message: "Server error" });
  }
});

// ✅ UPDATE NOTE
router.put("/:id", verifyToken, upload.array("files"), async (req: AuthRequest, res: Response) => {
  const { title, content, tags, folder, dueDate, reminder } = req.body;
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
        ...(dueDate ? { dueDate: new Date(dueDate) } : {}),
        ...(reminder ? { reminder: parseInt(reminder) } : {}),
      },
      { new: true }
    );

    if (!note) return res.status(404).json({ message: "Note not found" });
    res.json(note);
  } catch (err) {
    console.error("Error updating note:", err);
    res.status(500).json({ message: "Server error" });
  }
});

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