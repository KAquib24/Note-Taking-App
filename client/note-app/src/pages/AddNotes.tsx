import { useEffect, useState } from "react";
import api from "../lib/axios";
import { useNavigate, useLocation } from "react-router-dom";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Heading from "@tiptap/extension-heading";
import TaskList from "@tiptap/extension-task-list";
import TaskItem from "@tiptap/extension-task-item";
import Blockquote from "@tiptap/extension-blockquote";
import Underline from "@tiptap/extension-underline";
import AiToolsModal from "../components/AiToolsModel";

export default function AddNote() {
  const location = useLocation();
  const editNote = location.state?.note;

  const [title, setTitle] = useState(editNote?.title || "");
  const [tags, setTags] = useState(editNote?.tags?.join(", ") || "");
  const [folder, setFolder] = useState(editNote?.folder || "");
  const [folders, setFolders] = useState<string[]>([]);
  const [newFolder, setNewFolder] = useState("");
  const [files, setFiles] = useState<File[]>([]);
  const [dueDate, setDueDate] = useState(editNote?.dueDate || "");
  const [reminder, setReminder] = useState(editNote?.reminder || "");
  const [isAiOpen, setIsAiOpen] = useState(false);
  const navigate = useNavigate();

  // 📝 Tiptap editor
  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: false,
        codeBlock: false,
      }),
      Heading.configure({ levels: [1, 2, 3] }),
      TaskList,
      TaskItem.configure({ nested: true }),
      Blockquote,
      Underline,
    ],
    content: editNote?.content || "<p>Write your note here...</p>",
  });

  // ✅ Fetch folders from existing notes
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

  const handleFilesChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setFiles(Array.from(e.target.files));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const folderToUse = newFolder.trim() || folder || "General";

    const formData = new FormData();
    formData.append("title", title);
    formData.append("content", editor?.getHTML() || "");
    formData.append("folder", folderToUse);

    // Tags
    tags
      .split(",")
      .map((t: string) => t.trim())
      .filter(Boolean)
      .forEach((tag: string) => formData.append("tags[]", tag));

    // Files
    files.forEach((file) => formData.append("files", file));

    // Due Date & Reminder (optional)
    if (dueDate) formData.append("dueDate", dueDate);
    if (reminder !== "") formData.append("reminder", reminder.toString());

    try {
      if (editNote) {
        // Update existing note
        await api.put(`/notes/${editNote._id}`, formData, {
          headers: { "Content-Type": "multipart/form-data" },
        });
      } else {
        // Create new note
        await api.post("/notes", formData, {
          headers: { "Content-Type": "multipart/form-data" },
        });
      }
      navigate("/dashboard");
    } catch (err: any) {
      console.error(err.response?.data || err.message);
      alert("Error saving note");
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900">
      {/* Ribbon Toolbar */}
      <div className="bg-white dark:bg-gray-800 shadow-md">
        <div className="max-w-6xl mx-auto px-4 py-2">
          <div className="flex flex-wrap items-center gap-2 mb-1">
            {/* File Operations */}
            <div className="flex items-center gap-1 mr-4">
              <button
                type="button"
                onClick={handleSubmit}
                className="flex items-center gap-1 px-3 py-1.5 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 111.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                    clipRule="evenodd"
                  />
                </svg>
                {editNote ? "Update" : "Save"}
              </button>
              <button
                type="button"
                onClick={() => navigate("/dashboard")}
                className="flex items-center gap-1 px-3 py-1.5 bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                    clipRule="evenodd"
                  />
                </svg>
                Cancel
              </button>
            </div>

            {/* Text Formatting */}
            <div className="flex items-center gap-1 border-r border-gray-300 dark:border-gray-600 pr-3 mr-3">
              <select
                className="px-2 py-1 border rounded text-sm bg-white dark:bg-gray-700 dark:text-white"
                onChange={(e) => {
                  if (e.target.value === "paragraph") {
                    editor?.chain().focus().setParagraph().run();
                  } else {
                    const level = parseInt(e.target.value) as 1 | 2 | 3;
                    editor?.chain().focus().toggleHeading({ level }).run();
                  }
                }}
              >
                <option value="paragraph">Normal</option>
                <option value="1">Heading 1</option>
                <option value="2">Heading 2</option>
                <option value="3">Heading 3</option>
              </select>

              <div className="flex">
                <button
                  type="button"
                  onClick={() => editor?.chain().focus().toggleBold().run()}
                  className={`p-1.5 rounded hover:bg-gray-200 dark:hover:bg-gray-700 ${
                    editor?.isActive("bold")
                      ? "bg-gray-200 dark:bg-gray-700"
                      : ""
                  }`}
                  title="Bold"
                >
                  <span className="font-bold">B</span>
                </button>
                <button
                  type="button"
                  onClick={() => editor?.chain().focus().toggleItalic().run()}
                  className={`p-1.5 rounded hover:bg-gray-200 dark:hover:bg-gray-700 ${
                    editor?.isActive("italic")
                      ? "bg-gray-200 dark:bg-gray-700"
                      : ""
                  }`}
                  title="Italic"
                >
                  <span className="italic">I</span>
                </button>
                <button
                  type="button"
                  onClick={() =>
                    editor?.chain().focus().toggleUnderline().run()
                  }
                  className={`p-1.5 rounded hover:bg-gray-200 dark:hover:bg-gray-700 ${
                    editor?.isActive("underline")
                      ? "bg-gray-200 dark:bg-gray-700"
                      : ""
                  }`}
                  title="Underline"
                >
                  <span className="underline">U</span>
                </button>
              </div>

              <div className="flex">
                <button
                  type="button"
                  onClick={() =>
                    editor?.chain().focus().toggleBulletList().run()
                  }
                  className={`p-1.5 rounded hover:bg-gray-200 dark:hover:bg-gray-700 ${
                    editor?.isActive("bulletList")
                      ? "bg-gray-200 dark:bg-gray-700"
                      : ""
                  }`}
                  title="Bullet List"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path
                      fillRule="evenodd"
                      d="M2 5a1 1 0 011-1h1a1 1 0 010 2H3a1 1 0 01-1-1zm0 5a1 1 0 011-1h1a1 1 0 110 2H3a1 1 0 01-1-1zm0 5a1 1 0 011-1h1a1 1 0 110 2H3a1 1 0 01-1-1zm12-10a1 1 0 01-1 1H6a1 1 0 010-2h7a1 1 0 011 1zm-1 5a1 1 0 100 2H6a1 1 0 100-2h7zm-1 5a1 1 0 100 2H6a1 1 0 100-2h7z"
                      clipRule="evenodd"
                    />
                  </svg>
                </button>
                <button
                  type="button"
                  onClick={() =>
                    editor?.chain().focus().toggleOrderedList().run()
                  }
                  className={`p-1.5 rounded hover:bg-gray-200 dark:hover:bg-gray-700 ${
                    editor?.isActive("orderedList")
                      ? "bg-gray-200 dark:bg-gray-700"
                      : ""
                  }`}
                  title="Numbered List"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path
                      fillRule="evenodd"
                      d="M2 5a1 1 0 011-1h1a1 1 0 010 2H3a1 1 0 01-1-1zm0 5a1 1 0 011-1h1a1 1 0 110 2H3a1 1 0 01-1-1zm0 5a1 1 0 011-1h1a1 1 0 110 2H3a1 1 0 01-1-1zm12-10a1 1 0 01-1 1H6a1 1 0 010-2h7a1 1 0 011 1zm-1 5a1 1 0 100 2H6a1 1 0 100-2h7zm-1 5a1 1 0 100 2H6a1 1 0 100-2h7z"
                      clipRule="evenodd"
                    />
                  </svg>
                </button>
                <button
                  type="button"
                  onClick={() =>
                    editor?.chain().focus().toggleTaskList().run()
                  }
                  className={`p-1.5 rounded hover:bg-gray-200 dark:hover:bg-gray-700 ${
                    editor?.isActive("taskList")
                      ? "bg-gray-200 dark:bg-gray-700"
                      : ""
                  }`}
                  title="Checklist"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path
                      fillRule="evenodd"
                      d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 111.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                      clipRule="evenodd"
                    />
                  </svg>
                </button>
                <button
                  type="button"
                  onClick={() =>
                    editor?.chain().focus().toggleBlockquote().run()
                  }
                  className={`p-1.5 rounded hover:bg-gray-200 dark:hover:bg-gray-700 ${
                    editor?.isActive("blockquote")
                      ? "bg-gray-200 dark:bg-gray-700"
                      : ""
                  }`}
                  title="Blockquote"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path
                      fillRule="evenodd"
                      d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                      clipRule="evenodd"
                    />
                  </svg>
                </button>
              </div>
            </div>

            {/* AI Tools Button */}
            <button
              type="button"
              onClick={() => setIsAiOpen(true)}
              className="flex items-center gap-1 px-3 py-1.5 bg-yellow-500 text-white rounded hover:bg-yellow-600 transition-colors"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M9.243 3.03a1 1 0 01.727 1.213L9.53 6h2.94l.56-2.243a1 1 0 111.94.486L14.53 6H17a1 1 0 110 2h-2.97l-1 4H15a1 1 0 110 2h-2.47l-.56 2.242a1 1 0 11-1.94-.485L10.47 14H7.53l-.56 2.242a1 1 0 11-1.94-.485L5.47 14H3a1 1 0 110-2h2.97l1-4H5a1 1 0 110-2h2.47l.56-2.243a1 1 0 011.213-.727zM9.03 8l-1 4h2.938l1-4H9.031z"
                  clipRule="evenodd"
                />
              </svg>
              AI Tools
            </button>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="max-w-4xl mx-auto p-4">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg overflow-hidden">
          {/* Form Inputs */}
          <div className="p-6 border-b border-gray-200 dark:border-gray-700">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block text-sm font-medium mb-1">
                  Title *
                </label>
                <input
                  type="text"
                  placeholder="Note Title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full p-2 border rounded dark:bg-gray-700 dark:text-white"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Tags</label>
                <input
                  type="text"
                  placeholder="Tags (comma separated)"
                  value={tags}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setTags(e.target.value)}
                  className="w-full p-2 border rounded dark:bg-gray-700 dark:text-white"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">Folder</label>
                <select
                  value={folder}
                  onChange={(e) => {
                    setFolder(e.target.value);
                    setNewFolder("");
                  }}
                  className="w-full p-2 border rounded dark:bg-gray-700 dark:text-white"
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
                    className="w-full p-2 border rounded mt-2 dark:bg-gray-700 dark:text-white"
                  />
                )}
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">
                  Attachments
                </label>
                <input
                  type="file"
                  multiple
                  onChange={handleFilesChange}
                  className="w-full p-2 border rounded dark:bg-gray-700 dark:text-white"
                />
                {files.length > 0 && (
                  <ul className="text-sm text-gray-700 dark:text-gray-300 mt-1">
                    {files.map((file, idx) => (
                      <li key={idx} className="truncate">
                        {file.name}
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
              <div>
                <label className="block text-sm font-medium mb-1">
                  Due Date
                </label>
                <input
                  type="datetime-local"
                  value={dueDate}
                  onChange={(e) => setDueDate(e.target.value)}
                  className="w-full p-2 border rounded dark:bg-gray-700 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">
                  Reminder (minutes before)
                </label>
                <input
                  type="number"
                  placeholder="Set reminder"
                  value={reminder}
                  onChange={(e) =>
                    setReminder(
                      e.target.value === "" ? "" : parseInt(e.target.value)
                    )
                  }
                  className="w-full p-2 border rounded dark:bg-gray-700 dark:text-white"
                  min={0}
                />
              </div>
            </div>
          </div>

          {/* Lined Paper Editor */}
          <div className="p-6 bg-white dark:bg-gray-700 min-h-[500px] lined-paper">
            <div className="max-w-2xl mx-auto">
              <EditorContent
                editor={editor}
                className="prose prose-lg max-w-none dark:prose-invert focus:outline-none"
              />
            </div>
          </div>
        </div>
      </div>

      {/* AI Tools Modal */}
      <AiToolsModal 
        editor={editor} 
        isOpen={isAiOpen} 
        onClose={() => setIsAiOpen(false)} 
      />

      <style>{`
        .lined-paper {
          background-image: linear-gradient(to bottom, #f1f1f1 1px, transparent 1px);
          background-size: 100% 24px;
          background-position: 0 10px;
        }
        .dark .lined-paper {
          background-image: linear-gradient(to bottom, #4B5563 1px, transparent 1px);
        }
      `}</style>
    </div>
  );
}