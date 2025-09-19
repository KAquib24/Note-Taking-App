// File: StylusDashboard.tsx
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
      setNotes(prev => prev.filter(n => n._id !== id));
    } catch (err) {
      console.error(err);
    }
  };

  const editNote = (note: StylusNote) => {
    navigate("/handwriting", { state: { note } });
  };

  if (loading) return <p>Loading...</p>;

  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold mb-4">Stylus Notes</h1>
      <button
        onClick={() => navigate("/handwriting")}
        className="mb-4 px-3 py-1 bg-blue-500 text-white rounded"
      >
        Add New Stylus Note
      </button>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {notes.map(note => (
          <div key={note._id} className="border rounded p-4 relative">
            <h2 className="font-semibold mb-2">{note.title}</h2>
            <p className="text-sm text-gray-500 mb-2">{note.folder}</p>
            <img src={`http://localhost:5000/${note.image}`} alt={note.title} className="w-full rounded mb-2" />
            <div className="flex gap-2 absolute top-2 right-2">
              <button
                onClick={() => editNote(note)}
                className="bg-yellow-500 text-white px-2 py-1 rounded"
              >
                Edit
              </button>
              <button
                onClick={() => deleteNote(note._id)}
                className="bg-red-600 text-white px-2 py-1 rounded"
              >
                Delete
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default StylusDashboard;
