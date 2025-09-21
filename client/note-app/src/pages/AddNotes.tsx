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
import EditorToolbar from "../components/EditorToolbar";
import NoteForm from "../components/NoteForm";
import { encryptText, isEncryptedContent, decryptText } from "../lib/crypto";

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
  const [isEncrypted, setIsEncrypted] = useState(false);
  const [encryptionPassword, setEncryptionPassword] = useState("");
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    if (editNote?.content && isEncryptedContent(editNote.content)) {
      setIsEncrypted(true);
    }
  }, [editNote]);

  const editor = useEditor({
    extensions: [
      StarterKit.configure({ heading: false, codeBlock: false }),
      Heading.configure({ levels: [1, 2, 3] }),
      TaskList,
      TaskItem.configure({ nested: true }),
      Blockquote,
      Underline,
    ],
    content: editNote?.content
      ? isEncryptedContent(editNote.content)
        ? "🔒 Encrypted content - enter password to decrypt"
        : editNote.content
      : "<p>Write your note here...</p>",
    editable: !(editNote?.content && isEncryptedContent(editNote.content)),
  });

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
    if (e.target.files) setFiles(Array.from(e.target.files));
  };

  const handleDecryptContent = async () => {
    if (!encryptionPassword.trim()) {
      alert("Please enter a password");
      return;
    }

    try {
      const decryptedContent = decryptText(editNote.content, encryptionPassword);
      editor?.commands.setContent(decryptedContent);
      setShowPasswordModal(false);
      setIsEncrypted(false);
      editor?.setEditable(true);
    } catch (error) {
      alert("Invalid password. Please try again.");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // If encrypting but no password set, show modal
    if (isEncrypted && !encryptionPassword) {
      setShowPasswordModal(true);
      return;
    }

    const folderToUse = newFolder.trim() || folder || "General";
    let noteContent = editor?.getHTML() || "";

    if (isEncrypted && !isEncryptedContent(noteContent)) {
      noteContent = encryptText(noteContent, encryptionPassword);
    }

    const formData = new FormData();
    formData.append("title", title);
    formData.append("content", noteContent);
    formData.append("folder", folderToUse);
    formData.append("isEncrypted", isEncrypted.toString());

    tags
      .split(",")
      .map((t: string) => t.trim())
      .filter((t: string) => t.length > 0)
      .forEach((tag: string) => formData.append("tags[]", tag));

    files.forEach((file) => formData.append("files", file));
    if (dueDate) formData.append("dueDate", dueDate);
    if (reminder !== "") formData.append("reminder", reminder.toString());

    try {
      if (editNote) {
        await api.put(`/notes/${editNote._id}`, formData, {
          headers: { "Content-Type": "multipart/form-data" },
        });
      } else {
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

  const handleEncryptionToggle = (encrypted: boolean) => {
    if (encrypted && !encryptionPassword) {
      setShowPasswordModal(true);
    } else {
      setIsEncrypted(encrypted);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900">
      <EditorToolbar
        editor={editor}
        onSave={handleSubmit}
        onCancel={() => navigate("/dashboard")}
        isEditing={!!editNote}
      />

      <div className="max-w-4xl mx-auto p-4">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg overflow-hidden">
          <NoteForm
            title={title}
            setTitle={setTitle}
            tags={tags}
            setTags={setTags}
            folder={folder}
            setFolder={setFolder}
            folders={folders}
            newFolder={newFolder}
            setNewFolder={setNewFolder}
            files={files}
            handleFilesChange={handleFilesChange}
            dueDate={dueDate}
            setDueDate={setDueDate}
            reminder={reminder}
            setReminder={setReminder}
            content={editor?.getHTML() || ""}
            setContent={(content) => editor?.commands.setContent(content)}
            isEncrypted={isEncrypted}
            setIsEncrypted={handleEncryptionToggle}
          />

          <div className="p-6 bg-white dark:bg-gray-700 min-h-[500px] lined-paper">
            <div className="max-w-2xl mx-auto">
              {isEncrypted &&
              editor?.getText() === "🔒 Encrypted content - enter password to decrypt" ? (
                <div className="text-center py-16">
                  <div className="text-4xl mb-4">🔒</div>
                  <h3 className="text-xl font-semibold mb-2">
                    Encrypted Content
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400 mb-4">
                    This note is encrypted. Enter password to decrypt and edit.
                  </p>
                  <button
                    onClick={() => setShowPasswordModal(true)}
                    className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded"
                  >
                    Enter Password
                  </button>
                </div>
              ) : (
                <EditorContent
                  editor={editor}
                  className="prose prose-lg max-w-none dark:prose-invert focus:outline-none"
                />
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Password Modal */}
      {showPasswordModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg w-96">
            <h3 className="text-lg font-semibold mb-4">
              {isEncrypted ? "Enter Password to Decrypt" : "Set Encryption Password"}
            </h3>
            <input
              type="password"
              value={encryptionPassword}
              onChange={(e) => setEncryptionPassword(e.target.value)}
              placeholder="Enter password"
              className="w-full p-2 border border-gray-300 rounded mb-4"
            />
            <div className="flex gap-2 justify-end">
              <button
                onClick={() => setShowPasswordModal(false)}
                className="px-4 py-2 text-gray-600 hover:text-gray-800"
              >
                Cancel
              </button>
              <button
                onClick={isEncrypted ? handleDecryptContent : () => {
                  if (encryptionPassword.trim()) {
                    setIsEncrypted(true);
                    setShowPasswordModal(false);
                  } else {
                    alert("Please enter a password");
                  }
                }}
                className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
              >
                Confirm
              </button>
            </div>
          </div>
        </div>
      )}

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