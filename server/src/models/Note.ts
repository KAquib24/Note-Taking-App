import mongoose, { Schema, Document } from "mongoose";

export interface INote extends Document {
  title: string;
  content: string;
  tags: string[];
  user: mongoose.Types.ObjectId;
  folder?: string;
  attachments?: string[]; // ✅ New field
  createdAt: Date;
  updatedAt: Date;
}

const NoteSchema = new Schema<INote>(
  {
    title: { type: String, required: true },
    content: { type: String, required: true },
    tags: [{ type: String }],
    folder: { type: String, default: "General" },
    user: { type: Schema.Types.ObjectId, ref: "User", required: true },
    attachments: [{ type: String }], // ✅ Store uploaded file paths
  },
  { timestamps: true }
);

export default mongoose.model<INote>("Note", NoteSchema);
