import { useEffect, useState } from "react";
import api from "../lib/axios";
import { useNavigate } from "react-router-dom";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";

// Extra extensions
import Heading from "@tiptap/extension-heading";
import TaskList from "@tiptap/extension-task-list";
import TaskItem from "@tiptap/extension-task-item";
import Blockquote from "@tiptap/extension-blockquote";

export default function AddNote() {
  const [title, setTitle] = useState("");
  const [tags, setTags] = useState("");
  const [folder, setFolder] = useState("");
  const [folders, setFolders] = useState<string[]>([]);
  const [newFolder, setNewFolder] = useState("");
  const navigate = useNavigate();

  // 📝 Tiptap editor instance without lowlight
  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: false, // disable default heading
      }),
      Heading.configure({ levels: [1, 2, 3] }),
      TaskList,
      TaskItem.configure({ nested: true }),
      Blockquote,
    ],
    content: "<p>Write your note here...</p>",
  });

  // ✅ Fetch folders
  useEffect(() => {
    const fetchFolders = async () => {
      try {
        const res = await api.get("/notes");
        const notes: { folder?: string }[] = res.data;
        const allFolders = Array.from(
          new Set(notes.map((n) => n.folder || "General"))
        );
        setFolders(allFolders);
      } catch (err) {
        console.error("Failed to fetch folders", err);
      }
    };
    fetchFolders();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const folderToUse = newFolder.trim() || folder || "General";
    const content = editor?.getHTML() || ""; // ✅ get HTML

    try {
      await api.post("/notes", {
        title,
        content,
        tags: tags.split(",").map((t) => t.trim()).filter(Boolean),
        folder: folderToUse,
      });
      navigate("/dashboard");
    } catch (err: any) {
      console.error(err.response?.data || err.message);
      alert("Error saving note");
    }
  };

  return (
    <div className="max-w-lg mx-auto mt-10 bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-md">
      <h2 className="text-xl font-bold mb-4">Add Note</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Title */}
        <input
          type="text"
          placeholder="Title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="w-full p-2 border rounded"
          required
        />

        {/* Toolbar */}
        <div className="flex flex-wrap gap-2 mb-2">
          <button type="button" onClick={() => editor?.chain().focus().toggleBold().run()}>B</button>
          <button type="button" onClick={() => editor?.chain().focus().toggleItalic().run()}>I</button>
          <button type="button" onClick={() => editor?.chain().focus().toggleUnderline().run()}>U</button>
          <button type="button" onClick={() => editor?.chain().focus().toggleBulletList().run()}>• List</button>
          <button type="button" onClick={() => editor?.chain().focus().toggleHeading({ level: 1 }).run()}>H1</button>
          <button type="button" onClick={() => editor?.chain().focus().toggleHeading({ level: 2 }).run()}>H2</button>
          <button type="button" onClick={() => editor?.chain().focus().toggleHeading({ level: 3 }).run()}>H3</button>
          <button type="button" onClick={() => editor?.chain().focus().toggleTaskList().run()}>☑ Checklist</button>
          <button type="button" onClick={() => editor?.chain().focus().toggleCodeBlock().run()}>{"</>"}</button>
          <button type="button" onClick={() => editor?.chain().focus().toggleBlockquote().run()}>❝ Quote</button>
        </div>

        {/* Editor */}
        <div className="border p-2 rounded bg-white dark:bg-gray-700">
          <EditorContent editor={editor} />
        </div>

        {/* Tags */}
        <input
          type="text"
          placeholder="Tags (comma separated)"
          value={tags}
          onChange={(e) => setTags(e.target.value)}
          className="w-full p-2 border rounded"
        />

        {/* Folder */}
        <select
          value={folder}
          onChange={(e) => {
            setFolder(e.target.value);
            setNewFolder("");
          }}
          className="w-full p-2 border rounded"
        >
          <option value="">-- Select Folder --</option>
          {folders.map((f) => (
            <option key={f} value={f}>
              {f}
            </option>
          ))}
          <option value="__new__">Add New Folder...</option>
        </select>

        {folder === "__new__" && (
          <input
            type="text"
            placeholder="New Folder Name"
            value={newFolder}
            onChange={(e) => setNewFolder(e.target.value)}
            className="w-full p-2 border rounded"
          />
        )}

        <button
          type="submit"
          className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-lg"
        >
          Save Note
        </button>
      </form>
    </div>
  );
}
