import { useEffect, useState } from "react";

interface Note {
  _id: string;
  title: string;
  content: string;
  tags?: string[];
  folder?: string;
  createdAt: string;
  attachments?: string[]; // ✅ New field for uploaded files
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

  // ✅ Fetch Notes
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

  // ✅ Apply Search + Filter + Folder
  useEffect(() => {
    let tempNotes = notes;

    if (selectedFolder) {
      tempNotes = tempNotes.filter((note) => note.folder === selectedFolder);
    }

    if (searchQuery.trim()) {
      const lowerQuery = searchQuery.toLowerCase();
      tempNotes = tempNotes.filter((note) => {
        if (searchFilter === "title") return note.title.toLowerCase().includes(lowerQuery);
        if (searchFilter === "content") return note.content.toLowerCase().includes(lowerQuery);
        if (searchFilter === "tags") return note.tags?.some((tag) => tag.toLowerCase().includes(lowerQuery));
        if (searchFilter === "folder") return note.folder?.toLowerCase().includes(lowerQuery);
        return (
          note.title.toLowerCase().includes(lowerQuery) ||
          note.content.toLowerCase().includes(lowerQuery) ||
          note.tags?.some((tag) => tag.toLowerCase().includes(lowerQuery)) ||
          note.folder?.toLowerCase().includes(lowerQuery)
        );
      });
    }

    setFilteredNotes(tempNotes);
  }, [notes, searchQuery, searchFilter, selectedFolder]);

  // ✅ Delete Note
  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this note?")) return;

    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`http://localhost:5000/api/notes/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!res.ok) throw new Error("Failed to delete note");

      setNotes((prev) => prev.filter((note) => note._id !== id));
      setFilteredNotes((prev) => prev.filter((note) => note._id !== id));
    } catch (err) {
      console.error(err);
      alert("Error deleting note");
    }
  };

  const startEditing = (note: Note) => {
    setEditingNote(note);
    setEditTitle(note.title);
    setEditContent(note.content);
    setEditTags(note.tags?.join(", ") || "");
    setEditFolder(note.folder || "General");
  };

  const handleUpdate = async () => {
    if (!editingNote) return;

    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`http://localhost:5000/api/notes/${editingNote._id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({
          title: editTitle,
          content: editContent,
          tags: editTags.split(",").map((t) => t.trim()),
          folder: editFolder,
        }),
      });

      if (!res.ok) throw new Error("Failed to update note");

      const updated = await res.json();

      setNotes((prev) => prev.map((note) => (note._id === updated._id ? updated : note)));
      setFilteredNotes((prev) => prev.map((note) => (note._id === updated._id ? updated : note)));

      setEditingNote(null);
    } catch (err) {
      console.error(err);
      alert("Error updating note");
    }
  };

  if (loading) return <p className="p-6">Loading notes...</p>;

  // ✅ Get all folders
  const folders = Array.from(new Set(notes.map((n) => n.folder || "General")));

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <h1 className="text-3xl font-bold mb-4">Your Notes</h1>

      {/* Folder List */}
      <div className="flex gap-3 mb-6 flex-wrap">
        <button
          className={`px-3 py-1 rounded ${selectedFolder === null ? "bg-blue-500 text-white" : "bg-gray-200"}`}
          onClick={() => setSelectedFolder(null)}
        >
          All
        </button>
        {folders.map((folder) => (
          <button
            key={folder}
            className={`px-3 py-1 rounded ${selectedFolder === folder ? "bg-blue-500 text-white" : "bg-gray-200"}`}
            onClick={() => setSelectedFolder(folder)}
          >
            {folder}
          </button>
        ))}
      </div>

      {filteredNotes.length === 0 ? (
        <p className="text-gray-500">No notes found.</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredNotes.map((note) => (
            <div key={note._id} className="border rounded-lg p-5 bg-white shadow-md hover:shadow-lg transition">
              {editingNote && editingNote._id === note._id ? (
                <>
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
                  <h2 className="text-xl font-semibold text-gray-800">{note.title}</h2>

                  {/* Render HTML safely */}
                  <div
                    className="text-gray-700 mt-2 prose max-w-none"
                    dangerouslySetInnerHTML={{ __html: note.content }}
                  />

                  {/* Folder */}
                  <p className="text-xs text-gray-500 mt-2">Folder: {note.folder || "General"}</p>

                  {/* Tags */}
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

                  {/* ✅ Attachments */}
                  {note.attachments && note.attachments.length > 0 && (
                    <div className="mt-3">
                      <h3 className="font-semibold text-gray-700 mb-1">Attachments:</h3>
                      <ul className="space-y-1">
                        {note.attachments.map((file, idx) => {
                          const ext = file.split(".").pop()?.toLowerCase();
                          if (["png","jpg","jpeg","gif","webp"].includes(ext || "")) {
                            return <li key={idx}><img src={`http://localhost:5000/${file}`} alt="attachment" className="max-w-full rounded" /></li>;
                          } else if (["mp3","wav","ogg"].includes(ext || "")) {
                            return <li key={idx}><audio controls src={`http://localhost:5000/${file}`} className="w-full" /></li>;
                          } else if (["mp4","webm","ogg"].includes(ext || "")) {
                            return <li key={idx}><video controls src={`http://localhost:5000/${file}`} className="w-full rounded" /></li>;
                          } else {
                            return (
                              <li key={idx}>
                                <a href={`http://localhost:5000/${file}`} target="_blank" rel="noreferrer" className="text-blue-600 underline">
                                  {file.split("/").pop()}
                                </a>
                              </li>
                            );
                          }
                        })}
                      </ul>
                    </div>
                  )}

                  {/* Created */}
                  <p className="text-xs text-gray-500 mt-2">
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
