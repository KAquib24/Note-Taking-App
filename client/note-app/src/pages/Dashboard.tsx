import { useEffect, useState } from "react";

interface Note {
  _id: string;
  title: string;
  content: string;
  tags?: string[];
  folder?: string;
  createdAt: string;
  attachments?: string[];
  dueDate?: string;
  reminder?: number;
  pinned?: boolean;
}

interface DashboardProps {
  searchQuery: string;
  searchFilter: string;
}

const Dashboard = ({ searchQuery, searchFilter }: DashboardProps) => {
  const [notes, setNotes] = useState<Note[]>([]);
  const [filteredNotes, setFilteredNotes] = useState<Note[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedFolder, setSelectedFolder] = useState<string | null>(null);
  const [editingNote, setEditingNote] = useState<Note | null>(null);

  const [editTitle, setEditTitle] = useState("");
  const [editContent, setEditContent] = useState("");
  const [editTags, setEditTags] = useState("");
  const [editFolder, setEditFolder] = useState("");
  const [editDueDate, setEditDueDate] = useState<string>("");
  const [editReminder, setEditReminder] = useState<number | "">("");

  // ✅ Dark mode state
  const [darkMode, setDarkMode] = useState<boolean>(false);

  // ✅ Fetch notes
  useEffect(() => {
    const fetchNotes = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) {
          setLoading(false);
          return;
        }

        const res = await fetch("http://localhost:5000/api/notes", {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (!res.ok) throw new Error("Failed to fetch notes");

        const data = await res.json();
        setNotes(data);
        setFilteredNotes(data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchNotes();
  }, []);

  // ✅ Apply search/filter/folder
  useEffect(() => {
    let tempNotes = notes;

    if (selectedFolder)
      tempNotes = tempNotes.filter((n) => n.folder === selectedFolder);

    if (searchQuery.trim()) {
      const lowerQuery = searchQuery.toLowerCase();
      tempNotes = tempNotes.filter((n) => {
        if (searchFilter === "title")
          return n.title.toLowerCase().includes(lowerQuery);
        if (searchFilter === "content")
          return n.content.toLowerCase().includes(lowerQuery);
        if (searchFilter === "tags")
          return n.tags?.some((tag) => tag.toLowerCase().includes(lowerQuery));
        if (searchFilter === "folder")
          return n.folder?.toLowerCase().includes(lowerQuery);
        return (
          n.title.toLowerCase().includes(lowerQuery) ||
          n.content.toLowerCase().includes(lowerQuery) ||
          n.tags?.some((tag) => tag.toLowerCase().includes(lowerQuery)) ||
          n.folder?.toLowerCase().includes(lowerQuery)
        );
      });
    }

    setFilteredNotes(tempNotes);
  }, [notes, searchQuery, searchFilter, selectedFolder]);

  // ✅ Delete note
  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this note?")) return;

    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`http://localhost:5000/api/notes/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error("Failed to delete note");
      setNotes((prev) => prev.filter((n) => n._id !== id));
      setFilteredNotes((prev) => prev.filter((n) => n._id !== id));
    } catch (err) {
      console.error(err);
      alert("Error deleting note");
    }
  };

  // ✅ Edit note
  const startEditing = (note: Note) => {
    setEditingNote(note);
    setEditTitle(note.title);
    setEditContent(note.content);
    setEditTags(note.tags?.join(", ") || "");
    setEditFolder(note.folder || "General");
    setEditDueDate(note.dueDate || "");
    setEditReminder(note.reminder ?? "");
  };

  const handleUpdate = async () => {
    if (!editingNote) return;

    try {
      const token = localStorage.getItem("token");
      const res = await fetch(
        `http://localhost:5000/api/notes/${editingNote._id}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            title: editTitle,
            content: editContent,
            tags: editTags.split(",").map((t) => t.trim()),
            folder: editFolder,
            dueDate: editDueDate || undefined,
            reminder: editReminder === "" ? undefined : editReminder,
          }),
        }
      );
      if (!res.ok) throw new Error("Failed to update note");
      const updated = await res.json();
      setNotes((prev) =>
        prev.map((n) => (n._id === updated._id ? updated : n))
      );
      setFilteredNotes((prev) =>
        prev.map((n) => (n._id === updated._id ? updated : n))
      );
      setEditingNote(null);
    } catch (err) {
      console.error(err);
      alert("Error updating note");
    }
  };

  // ✅ Toggle pin
  const togglePin = async (note: Note) => {
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(
        `http://localhost:5000/api/notes/pin/${note._id}`,
        {
          method: "PUT",
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      const updatedNote = await res.json();
      setNotes((prev) =>
        prev.map((n) => (n._id === updatedNote._id ? updatedNote : n))
      );
      setFilteredNotes((prev) =>
        prev.map((n) => (n._id === updatedNote._id ? updatedNote : n))
      );
    } catch (err) {
      console.error(err);
      alert("Failed to pin/unpin note");
    }
  };

  // ✅ Export Notes - Improved version
  const handleExport = async (id: string, format: "pdf" | "md" | "txt") => {
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(
        `http://localhost:5000/api/notes/export/${id}/${format}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (!res.ok) throw new Error("Export failed");

      // Get filename from Content-Disposition header or generate one
      const contentDisposition = res.headers.get('Content-Disposition');
      let filename = `note-${id}.${format}`;
      
      if (contentDisposition) {
        const filenameMatch = contentDisposition.match(/filename="(.+)"/);
        if (filenameMatch) {
          filename = filenameMatch[1];
        }
      }

      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error("Export error:", err);
      alert("Failed to export note");
    }
  };

  if (loading)
    return (
      <p className={`p-6 ${darkMode ? "text-white" : "text-black"}`}>
        Loading notes...
      </p>
    );

  const folders = Array.from(new Set(notes.map((n) => n.folder || "General")));

  // ✅ Sort notes: pinned first
  const sortedNotes = [...filteredNotes].sort((a, b) => {
    if (a.pinned && !b.pinned) return -1;
    if (!a.pinned && b.pinned) return 1;
    return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
  });

  return (
    <div
      className={`${
        darkMode ? "bg-gray-900 text-white" : "bg-gray-50 text-black"
      } p-6 min-h-screen`}
    >
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-3xl font-bold">Your Notes</h1>
        <button
          onClick={() => setDarkMode((prev) => !prev)}
          className={`${
            darkMode ? "bg-gray-700 text-white" : "bg-gray-200 text-black"
          } px-3 py-1 rounded`}
        >
          {darkMode ? "Light Mode" : "Dark Mode"}
        </button>
      </div>

      {/* Folder List */}
      <div className="flex gap-3 mb-6 flex-wrap">
        <button
          className={`px-3 py-1 rounded ${
            selectedFolder === null
              ? "bg-blue-500 text-white"
              : darkMode
              ? "bg-gray-700 text-white"
              : "bg-gray-200"
          }`}
          onClick={() => setSelectedFolder(null)}
        >
          All
        </button>
        {folders.map((folder) => (
          <button
            key={folder}
            className={`px-3 py-1 rounded ${
              selectedFolder === folder
                ? "bg-blue-500 text-white"
                : darkMode
                ? "bg-gray-700 text-white"
                : "bg-gray-200"
            }`}
            onClick={() => setSelectedFolder(folder)}
          >
            {folder}
          </button>
        ))}
      </div>

      {sortedNotes.length === 0 ? (
        <p>No notes found.</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {sortedNotes.map((note) => (
            <div
              key={note._id}
              className={`${
                darkMode
                  ? "bg-gray-800 border-gray-700"
                  : "bg-white border-gray-300"
              } border rounded-lg p-5 shadow-md hover:shadow-lg transition`}
            >
              {editingNote && editingNote._id === note._id ? (
                <>
                  {/* Edit form */}
                  <input
                    className="w-full p-2 border rounded mb-2"
                    value={editTitle}
                    onChange={(e) => setEditTitle(e.target.value)}
                  />
                  <textarea
                    className="w-full p-2 border rounded mb-2"
                    rows={3}
                    value={editContent}
                    onChange={(e) => setEditContent(e.target.value)}
                  />
                  <input
                    className="w-full p-2 border rounded mb-2"
                    value={editTags}
                    onChange={(e) => setEditTags(e.target.value)}
                    placeholder="Tags (comma separated)"
                  />
                  <input
                    className="w-full p-2 border rounded mb-2"
                    value={editFolder}
                    onChange={(e) => setEditFolder(e.target.value)}
                    placeholder="Folder"
                  />
                  <input
                    type="datetime-local"
                    className="w-full p-2 border rounded mb-2"
                    value={editDueDate}
                    onChange={(e) => setEditDueDate(e.target.value)}
                  />
                  <input
                    type="number"
                    className="w-full p-2 border rounded mb-2"
                    placeholder="Reminder (minutes)"
                    value={editReminder}
                    onChange={(e) =>
                      setEditReminder(
                        e.target.value === "" ? "" : parseInt(e.target.value)
                      )
                    }
                  />

                  <div className="flex gap-2">
                    <button
                      onClick={handleUpdate}
                      className="bg-green-600 text-white px-3 py-1 rounded hover:bg-green-700"
                    >
                      Save
                    </button>
                    <button
                      onClick={() => setEditingNote(null)}
                      className="bg-gray-500 text-white px-3 py-1 rounded hover:bg-gray-600"
                    >
                      Cancel
                    </button>
                  </div>
                </>
              ) : (
                <>
                  {/* Note Display */}
                  <div className="flex justify-between items-start">
                    <h2 className="text-xl font-semibold">{note.title}</h2>
                    <button
                      onClick={() => togglePin(note)}
                      className={`${
                        note.pinned
                          ? "bg-yellow-400 text-black"
                          : darkMode
                          ? "bg-gray-700 text-white"
                          : "bg-gray-300"
                      } px-2 py-1 rounded`}
                    >
                      {note.pinned ? "Pinned" : "Pin"}
                    </button>
                  </div>

                  <div
                    className="mt-2 prose max-w-none"
                    dangerouslySetInnerHTML={{ __html: note.content }}
                  />

                  <p className="text-xs mt-2">
                    Folder: {note.folder || "General"}
                  </p>

                  {note.tags && note.tags.length > 0 && (
                    <div className="mt-2">
                      {note.tags.map((tag, idx) => (
                        <span
                          key={idx}
                          className="inline-block bg-blue-100 text-blue-600 text-sm px-2 py-1 rounded mr-2"
                        >
                          #{tag}
                        </span>
                      ))}
                    </div>
                  )}

                  {note.dueDate && (
                    <p className="text-sm text-red-600 mt-2">
                      Due: {new Date(note.dueDate).toLocaleString()}
                      {note.reminder
                        ? ` (Reminder ${note.reminder} mins before)`
                        : ""}
                    </p>
                  )}

                  {note.attachments && note.attachments.length > 0 && (
                    <div className="mt-3">
                      <h3 className="font-semibold mb-1">Attachments:</h3>
                      <ul className="space-y-1">
                        {note.attachments.map((file, idx) => {
                          const ext = file.split(".").pop()?.toLowerCase();
                          if (
                            ["png", "jpg", "jpeg", "gif", "webp"].includes(
                              ext || ""
                            )
                          )
                            return (
                              <li key={idx}>
                                <img
                                  src={`http://localhost:5000/${file}`}
                                  alt="attachment"
                                  className="max-w-full rounded"
                                />
                              </li>
                            );
                          if (["mp3", "wav", "ogg"].includes(ext || ""))
                            return (
                              <li key={idx}>
                                <audio
                                  controls
                                  src={`http://localhost:5000/${file}`}
                                  className="w-full"
                                />
                              </li>
                            );
                          if (["mp4", "webm", "ogg"].includes(ext || ""))
                            return (
                              <li key={idx}>
                                <video
                                  controls
                                  src={`http://localhost:5000/${file}`}
                                  className="w-full rounded"
                                />
                              </li>
                            );
                          return (
                            <li key={idx}>
                              <a
                                href={`http://localhost:5000/${file}`}
                                target="_blank"
                                rel="noreferrer"
                                className="text-blue-600 underline"
                              >
                                {file.split("/").pop()}
                              </a>
                            </li>
                          );
                        })}
                      </ul>
                    </div>
                  )}

                  <p className="text-xs mt-2">
                    {new Date(note.createdAt).toLocaleString()}
                  </p>

                  {/* Actions */}
                  <div className="flex gap-2 mt-4">
                    <button
                      onClick={() => startEditing(note)}
                      className="bg-yellow-500 text-white px-3 py-1 rounded hover:bg-yellow-600"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(note._id)}
                      className="bg-red-600 text-white px-3 py-1 rounded hover:bg-red-700"
                    >
                      Delete
                    </button>
                    <button
                      onClick={() => handleExport(note._id, "pdf")}
                      className="bg-blue-600 text-white px-3 py-1 rounded"
                    >
                      PDF
                    </button>
                    <button
                      onClick={() => handleExport(note._id, "md")}
                      className="bg-green-600 text-white px-3 py-1 rounded"
                    >
                      MD
                    </button>
                    <button
                      onClick={() => handleExport(note._id, "txt")}
                      className="bg-gray-600 text-white px-3 py-1 rounded"
                    >
                      TXT
                    </button>
                  </div>
                </>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Dashboard;