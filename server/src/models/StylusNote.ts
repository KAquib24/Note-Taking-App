import mongoose, { Schema, Document } from "mongoose";

export interface IStylusNote extends Document {
  title: string;
  image: string; // path to saved canvas image
  folder?: string;
  tags?: string[];
  createdAt: Date;
  pinned?: boolean;
}

const StylusNoteSchema = new mongoose.Schema({
  title: { type: String, default: "Untitled" },
  image: { type: String, required: true },
  folder: { type: String, default: "" },
  tags: { type: [String], default: [] },
  pinned: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now },
});

export default mongoose.model<IStylusNote>("StylusNote", StylusNoteSchema);
