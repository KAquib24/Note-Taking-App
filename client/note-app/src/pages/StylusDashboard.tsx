import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

interface StylusNote {
  _id: string;
  title: string;
  image: string;
  folder?: string;
  tags?: string[];
  pinned?: boolean;
  createdAt: string;
}

const StylusDashboard: React.FC = () => {
  const [notes, setNotes] = useState<StylusNote[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const fetchNotes = async () => {
    setLoading(true);
    try {
      const res = await fetch("http://localhost:5000/api/stylus");
      const data = await res.json();
      setNotes(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotes();
  }, []);

  const deleteNote = async (id: string) => {
    if (!confirm("Delete this stylus note?")) return;
    try {
      await fetch(`http://localhost:5000/api/stylus/${id}`, { method: "DELETE" });
      setNotes((prev) => prev.filter((n) => n._id !== id));
    } catch (err) {
      console.error(err);
    }
  };

  const editNote = (note: StylusNote) => {
    navigate("/handwriting", { state: { note } });
  };

  if (loading) return <p className="text-center text-lg">⏳ Loading...</p>;

  return (
    <div className="p-8 min-h-screen bg-gray-50">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-4xl font-extrabold text-gray-800 tracking-tight">
          ✍️ Stylus Notes
        </h1>
        <button
          onClick={() => navigate("/handwriting")}
          className="px-4 py-2 rounded-lg bg-gradient-to-r from-indigo-500 to-purple-600 text-white font-semibold shadow-md hover:scale-105 transform transition"
        >
          + New Stylus Note
        </button>
      </div>

      {notes.length === 0 ? (
        <p className="text-gray-600 text-center mt-20">
          No stylus notes yet. Click <b>+ New Stylus Note</b> to get started!
        </p>
      ) : (
        <div className="grid gap-6 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
          {notes.map((note) => (
            <div
              key={note._id}
              className="bg-white shadow-lg rounded-2xl overflow-hidden hover:shadow-xl transition relative"
            >
              <img
                src={`http://localhost:5000/${note.image}`}
                alt={note.title}
                className="w-full h-48 object-cover"
              />
              <div className="p-4">
                <h2 className="text-lg font-bold text-gray-800 truncate">
                  {note.title}
                </h2>
                <p className="text-sm text-gray-500">
                  {note.folder || "Uncategorized"}
                </p>
              </div>
              <div className="absolute top-3 right-3 flex gap-2">
                <button
                  onClick={() => editNote(note)}
                  className="px-3 py-1 rounded-lg bg-yellow-500 text-white text-sm font-medium shadow hover:bg-yellow-600"
                >
                  Edit
                </button>
                <button
                  onClick={() => deleteNote(note._id)}
                  className="px-3 py-1 rounded-lg bg-red-600 text-white text-sm font-medium shadow hover:bg-red-700"
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default StylusDashboard;
