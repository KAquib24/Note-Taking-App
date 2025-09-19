import mongoose, { Document, Schema } from "mongoose";

export interface INote extends Document {
  title: string;
  content: string;
  tags?: string[];
  folder?: string;
  user: mongoose.Schema.Types.ObjectId;
  attachments?: string[];
  dueDate?: Date;
  reminder?: number;
  pinned?: boolean; // ✅ Add this line
  createdAt: Date;
  updatedAt: Date;
}

const noteSchema = new Schema<INote>(
  {
    title: { type: String, required: true },
    content: { type: String, required: true },
    tags: [{ type: String }],
    folder: { type: String, default: "General" },
    user: { type: Schema.Types.ObjectId, ref: "User", required: true },
    attachments: [{ type: String }],
    dueDate: { type: Date },
    reminder: { type: Number },
    pinned: { type: Boolean, default: false }, // ✅ Add this line
  },
  { timestamps: true }
);

export default mongoose.model<INote>("Note", noteSchema);
