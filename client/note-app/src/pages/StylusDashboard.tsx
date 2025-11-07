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
    if (!confirm("Delete this masterpiece?")) return;
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

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-800 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-yellow-500 mx-auto mb-4"></div>
          <p className="text-yellow-400 text-xl font-bold">LOADING MASTERPIECES...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-800 p-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-12">
          <div>
            <h1 className="text-5xl font-black bg-gradient-to-r from-yellow-400 via-orange-500 to-yellow-400 bg-clip-text text-transparent">
              ARTISTIC CANVAS
            </h1>
            <p className="text-gray-400 mt-2">Your handwritten masterpieces collection</p>
          </div>
          <button
            onClick={() => navigate("/handwriting")}
            className="px-8 py-4 rounded-2xl bg-gradient-to-r from-yellow-500 to-orange-500 text-white font-bold shadow-2xl hover:shadow-3xl transform hover:scale-105 transition-all duration-300 border border-yellow-400/30"
          >
            <span className="flex items-center gap-3">
              <span className="text-xl">🎨</span>
              CREATE CANVAS
            </span>
          </button>
        </div>

        {notes.length === 0 ? (
          <div className="text-center mt-20">
            <div className="bg-white/5 backdrop-blur-xl rounded-3xl border border-white/10 p-16 max-w-2xl mx-auto">
              <div className="text-8xl mb-6">📝</div>
              <h3 className="text-2xl font-bold text-white mb-4">No Canvas Yet</h3>
              <p className="text-gray-400 text-lg mb-8">Start your first handwritten masterpiece</p>
              <button
                onClick={() => navigate("/handwriting")}
                className="px-8 py-3 rounded-xl bg-gradient-to-r from-yellow-500 to-orange-500 text-white font-semibold hover:shadow-lg transform hover:scale-105 transition-all duration-300"
              >
                Begin Creation
              </button>
            </div>
          </div>
        ) : (
          <div className="grid gap-8 grid-cols-1 md:grid-cols-2 xl:grid-cols-3">
            {notes.map((note) => (
              <div
                key={note._id}
                className="bg-white/5 backdrop-blur-xl rounded-3xl border border-white/10 overflow-hidden hover:border-white/20 transition-all duration-500 group hover:scale-105 hover:shadow-2xl"
              >
                <div className="relative overflow-hidden">
                  <img
                    src={`http://localhost:5000/${note.image}`}
                    alt={note.title}
                    className="w-full h-64 object-cover group-hover:scale-110 transition-transform duration-700"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                  
                  <div className="absolute top-4 right-4 flex gap-2 opacity-0 group-hover:opacity-100 transition-all duration-300">
                    <button
                      onClick={() => editNote(note)}
                      className="px-4 py-2 rounded-xl bg-yellow-500/90 backdrop-blur-sm text-white font-semibold shadow-lg hover:bg-yellow-600 transform hover:scale-105 transition-all duration-200 border border-yellow-400/30"
                    >
                      ✏️
                    </button>
                    <button
                      onClick={() => deleteNote(note._id)}
                      className="px-4 py-2 rounded-xl bg-red-500/90 backdrop-blur-sm text-white font-semibold shadow-lg hover:bg-red-600 transform hover:scale-105 transition-all duration-200 border border-red-400/30"
                    >
                      🗑️
                    </button>
                  </div>
                </div>

                <div className="p-6">
                  <h2 className="text-xl font-bold text-white mb-2 line-clamp-1 group-hover:text-yellow-400 transition-colors duration-300">
                    {note.title}
                  </h2>
                  
                  <div className="flex items-center justify-between">
                    <span className="px-3 py-1 bg-white/10 rounded-full text-gray-300 text-sm border border-white/10">
                      {note.folder || "Uncategorized"}
                    </span>
                    <span className="text-gray-400 text-sm">
                      {new Date(note.createdAt).toLocaleDateString()}
                    </span>
                  </div>

                  {note.tags && note.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-3">
                      {note.tags.slice(0, 3).map((tag, index) => (
                        <span
                          key={index}
                          className="px-2 py-1 bg-purple-500/20 rounded text-purple-300 text-xs border border-purple-500/30"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <style>{`
        .line-clamp-1 {
          display: -webkit-box;
          -webkit-line-clamp: 1;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }
        
        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-10px); }
        }
        
        .floating {
          animation: float 3s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
};

export default StylusDashboard;